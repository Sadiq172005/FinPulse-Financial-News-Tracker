import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AlertsView, { AlertItem } from './components/AlertsView.jsx';
import Analytics from './components/Analytics.jsx';
import AnalyzeModal from './components/AnalyzeModal.jsx';
import ArticleCard from './components/ArticleCard.jsx';
import ExportModal from './components/ExportModal.jsx';
import { ARROW } from './components/Pills.jsx';
import WatchlistView from './components/WatchlistView.jsx';
import { COMPANIES, buildSampleArticles } from './data/articles.js';
import { DEFAULT_RULES, buildAlerts } from './lib/alerts.js';
import { analyzeArticle, fetchEngineStatus } from './lib/api.js';
import { CATEGORIES, PROVIDER_LABELS } from './lib/constants.js';
import { signed } from './lib/format.js';
import { tickerPulse } from './lib/stats.js';
import { usePersistentState } from './lib/storage.js';

const VIEWS = [
  { id: 'feed', label: 'Feed' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'alerts', label: 'Alerts' },
];

const DEFAULT_FILTERS = { query: '', category: 'All', impact: 'ALL', sentiment: 'all', sort: 'latest', watchOnly: false };
const DEFAULT_WATCHLIST = ['NOVA', 'MRDN', 'VLTA'];

const SORTERS = {
  latest: (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
  impact: (a, b) => b.analysis.impactScore - a.analysis.impactScore,
  bullish: (a, b) => b.analysis.sentimentScore - a.analysis.sentimentScore,
  bearish: (a, b) => a.analysis.sentimentScore - b.analysis.sentimentScore,
};

const readHash = () => {
  const name = window.location.hash.replace('#', '');
  return VIEWS.some((view) => view.id === name) ? name : 'feed';
};

const activeTheme = () => {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'dark' || explicit === 'light') return explicit;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const asArray = (value, fallback = []) => (Array.isArray(value) ? value : fallback);

function matchesFilters(article, filters, watchlist, skipCategory = false) {
  const { analysis } = article;
  if (!skipCategory && filters.category !== 'All' && article.category !== filters.category) return false;
  if (filters.impact !== 'ALL' && analysis.impact !== filters.impact) return false;
  if (filters.sentiment !== 'all' && analysis.sentiment !== filters.sentiment) return false;
  if (filters.watchOnly && !article.tickers.some((ticker) => watchlist.includes(ticker))) return false;

  const query = filters.query.trim().toLowerCase();
  if (!query) return true;
  const names = article.tickers.map((ticker) => COMPANIES[ticker] ?? '').join(' ');
  const haystack = `${article.headline} ${article.body} ${article.source} ${article.tickers.join(' ')} ${names} ${analysis.summary}`;
  return haystack.toLowerCase().includes(query);
}

export default function App() {
  // ---- state -------------------------------------------------------------
  const [view, setView] = useState(readHash);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [expanded, setExpanded] = useState(() => new Set());
  const [modal, setModal] = useState(null);
  const [engine, setEngine] = useState({ status: 'checking' });
  const [reanalyzing, setReanalyzing] = useState(null);
  const [theme, setTheme] = useState(activeTheme);

  const [themeChoice, setThemeChoice] = usePersistentState('finpulse.theme', null);
  const [storedWatchlist, setWatchlist] = usePersistentState('finpulse.watchlist', DEFAULT_WATCHLIST);
  const [storedRules, setRules] = usePersistentState('finpulse.rules', DEFAULT_RULES);
  const [storedRead, setReadIds] = usePersistentState('finpulse.read', []);
  const [storedCustom, setCustom] = usePersistentState('finpulse.custom', []);
  const [storedOverrides, setOverrides] = usePersistentState('finpulse.overrides', {});

  const watchlist = asArray(storedWatchlist, DEFAULT_WATCHLIST);
  const rules = asArray(storedRules, DEFAULT_RULES);
  const readIds = asArray(storedRead);
  const custom = asArray(storedCustom);
  const overrides = storedOverrides && typeof storedOverrides === 'object' ? storedOverrides : {};

  const searchInput = useRef(null);
  const sample = useMemo(() => buildSampleArticles(), []);

  // ---- derived data ------------------------------------------------------
  const articles = useMemo(
    () =>
      [...custom, ...sample]
        .map((article) => {
          const override = overrides[article.id];
          return override
            ? { ...article, analysis: override, tickers: override.stockImpact.map((item) => item.ticker) }
            : article;
        })
        .sort(SORTERS.latest),
    [custom, sample, overrides],
  );

  const filtered = useMemo(
    () => articles.filter((article) => matchesFilters(article, filters, watchlist)).sort(SORTERS[filters.sort]),
    [articles, filters, watchlist],
  );

  const categoryCounts = useMemo(() => {
    const pool = articles.filter((article) => matchesFilters(article, filters, watchlist, true));
    const counts = { All: pool.length };
    for (const category of CATEGORIES) counts[category] = pool.filter((a) => a.category === category).length;
    return counts;
  }, [articles, filters, watchlist]);

  const pulse = useMemo(() => tickerPulse(articles), [articles]);
  const alerts = useMemo(() => buildAlerts(articles, rules, watchlist), [articles, rules, watchlist]);
  const unreadAlerts = alerts.filter((alert) => !readIds.includes(alert.id));
  const knownTickers = useMemo(() => [...new Set([...Object.keys(COMPANIES), ...pulse.map((p) => p.ticker)])], [pulse]);

  const tone = {
    bullish: filtered.filter((a) => a.analysis.sentiment === 'bullish').length,
    neutral: filtered.filter((a) => a.analysis.sentiment === 'neutral').length,
    bearish: filtered.filter((a) => a.analysis.sentiment === 'bearish').length,
  };
  const impactCount = (level) => filtered.filter((a) => a.analysis.impact === level).length;
  const filtersActive = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  // ---- effects -----------------------------------------------------------
  useEffect(() => {
    const onHash = () => setView(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchEngineStatus().then((status) => {
      if (!cancelled) setEngine(status);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (themeChoice === 'dark' || themeChoice === 'light') {
      document.documentElement.dataset.theme = themeChoice;
    }
    setTheme(activeTheme());
    // Keep the toggle in sync if the host page changes the theme attribute.
    const observer = new MutationObserver(() => setTheme(activeTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [themeChoice]);

  useEffect(() => {
    const onKey = (event) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
      if (event.key === '/' && !typing && !modal) {
        event.preventDefault();
        searchInput.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modal]);

  // ---- actions -----------------------------------------------------------
  const go = useCallback((id) => {
    try {
      window.location.hash = id;
    } catch {
      // Hash navigation can be blocked in some embeds; state still updates.
    }
    setView(id);
  }, []);

  const closeModal = useCallback(() => setModal(null), []);
  const setFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  const toggleExpanded = (id) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleWatch = (ticker) =>
    setWatchlist(watchlist.includes(ticker) ? watchlist.filter((t) => t !== ticker) : [...watchlist, ticker]);

  const selectTicker = (ticker) => {
    setFilters({ ...DEFAULT_FILTERS, query: ticker });
    go('feed');
  };

  const openStory = (id) => {
    setFilters(DEFAULT_FILTERS);
    setExpanded((current) => new Set(current).add(id));
    if (!readIds.includes(id)) setReadIds([...readIds, id]);
    go('feed');
    window.setTimeout(() => {
      document.getElementById(`story-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  };

  const addArticle = (article) => {
    setCustom([article, ...custom]);
    setModal(null);
    setFilters(DEFAULT_FILTERS);
    setExpanded((current) => new Set(current).add(article.id));
    go('feed');
  };

  const removeArticle = (id) => setCustom(custom.filter((article) => article.id !== id));

  const reanalyze = async (article) => {
    setReanalyzing(article.id);
    const { analysis } = await analyzeArticle(
      { headline: article.headline, body: article.body, category: article.category, knownTickers },
      engine,
    );
    setOverrides({ ...overrides, [article.id]: analysis });
    setReanalyzing(null);
  };

  const toggleTheme = () => setThemeChoice(theme === 'dark' ? 'light' : 'dark');

  const engineLabel =
    engine.status === 'live' ? `${PROVIDER_LABELS[engine.provider] ?? 'AI'} API live` : engine.status === 'checking' ? 'Checking API' : 'Demo engine';
  const engineTitle =
    engine.status === 'live'
      ? `New analyses run on ${engine.model}.`
      : engine.reason ?? 'Looking for the API server.';

  // ---- render ------------------------------------------------------------
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#feed" onClick={(event) => { event.preventDefault(); go('feed'); }}>
            <svg className="brand-mark" viewBox="0 0 28 28" aria-hidden="true">
              <rect width="28" height="28" rx="7" fill="currentColor" />
              <path d="M4 15h5l2.5-7 4 13 3-9 1.5 3H24" fill="none" stroke="var(--accent-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="brand-name">FinPulse</span>
            <span className="brand-tag">Pro</span>
          </a>

          <div className="topbar-actions">
            <span className={`engine engine-${engine.status}`} title={engineTitle}>
              <span className="engine-dot" aria-hidden="true" />
              {engineLabel}
            </span>
            <button
              type="button"
              className="btn btn-icon"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setModal('analyze')}>
              Analyze article
            </button>
          </div>

          <nav className="nav" aria-label="Views">
            {VIEWS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-link ${view === item.id ? 'active' : ''}`}
                aria-current={view === item.id ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  go(item.id);
                }}
              >
                {item.label}
                {item.id === 'alerts' && unreadAlerts.length > 0 && (
                  <span className="badge" aria-label={`${unreadAlerts.length} unread`}>{unreadAlerts.length}</span>
                )}
              </a>
            ))}
          </nav>
        </div>

        <div className="tape" aria-label="News pulse by ticker">
          <div className="tape-inner">
            <span className="tape-label">News pulse</span>
            {pulse.map((item) => {
              const direction = item.pulse > 0 ? 'up' : item.pulse < 0 ? 'down' : 'flat';
              return (
                <button
                  type="button"
                  key={item.ticker}
                  className={`tape-item tape-${direction}`}
                  onClick={() => selectTicker(item.ticker)}
                  title={`${COMPANIES[item.ticker] ?? item.ticker}: ${item.mentions} ${item.mentions === 1 ? 'story' : 'stories'}`}
                >
                  <span className="tape-ticker">{item.ticker}</span>
                  <span className="tape-arrow" aria-hidden="true">{ARROW[direction]}</span>
                  <span className="tape-value">{signed(item.pulse)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="main">
        {view === 'feed' && (
          <div className="view">
            <section className="summary" aria-label="Summary of the current view">
              <div className="tile">
                <span className="tile-label">Stories in view</span>
                <span className="tile-value">{filtered.length}</span>
                <span className="tile-sub">of {articles.length} tracked</span>
              </div>
              <div className="tile">
                <span className="tile-label">High impact</span>
                <span className="tile-value">{impactCount('HIGH')}</span>
                <span className="tile-sub">{impactCount('MEDIUM')} medium, {impactCount('LOW')} low</span>
              </div>
              <div className="tile">
                <span className="tile-label">Sentiment</span>
                <span className="tone-bar" aria-hidden="true">
                  {['bullish', 'neutral', 'bearish'].map(
                    (key) => tone[key] > 0 && <span key={key} className={`seg seg-${key}`} style={{ flexGrow: tone[key] }} />,
                  )}
                </span>
                <span className="tile-sub mono">
                  {tone.bullish}{ARROW.up} bullish {'·'} {tone.neutral}{ARROW.flat} {'·'} {tone.bearish}{ARROW.down} bearish
                </span>
              </div>
              <button type="button" className="tile tile-button" onClick={() => go('alerts')}>
                <span className="tile-label">Unread alerts</span>
                <span className="tile-value">{unreadAlerts.length}</span>
                <span className="tile-sub">{rules.filter((rule) => rule.enabled).length} rules active</span>
              </button>
            </section>

            <div className="layout">
              <div className="feed-col">
                <section className="card controls" aria-label="Search and filters">
                  <div className="search">
                    <label htmlFor="search" className="sr-only">Search stories</label>
                    <input
                      id="search"
                      ref={searchInput}
                      type="search"
                      value={filters.query}
                      onChange={(event) => setFilter('query', event.target.value)}
                      placeholder="Search ticker, company or headline"
                      autoComplete="off"
                    />
                    <kbd title="Press / to search">/</kbd>
                  </div>

                  <div className="chips" role="group" aria-label="Category">
                    {['All', ...CATEGORIES].map((category) => (
                      <button
                        key={category}
                        type="button"
                        className={`chip ${filters.category === category ? 'active' : ''}`}
                        aria-pressed={filters.category === category}
                        onClick={() => setFilter('category', category)}
                      >
                        {category}
                        <span className="chip-count">{categoryCounts[category]}</span>
                      </button>
                    ))}
                  </div>

                  <div className="filters">
                    <div className="field">
                      <label htmlFor="f-impact">Impact</label>
                      <select id="f-impact" value={filters.impact} onChange={(event) => setFilter('impact', event.target.value)}>
                        <option value="ALL">All</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="f-sentiment">Sentiment</label>
                      <select id="f-sentiment" value={filters.sentiment} onChange={(event) => setFilter('sentiment', event.target.value)}>
                        <option value="all">All</option>
                        <option value="bullish">Bullish</option>
                        <option value="neutral">Neutral</option>
                        <option value="bearish">Bearish</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="f-sort">Sort by</label>
                      <select id="f-sort" value={filters.sort} onChange={(event) => setFilter('sort', event.target.value)}>
                        <option value="latest">Latest</option>
                        <option value="impact">Highest impact</option>
                        <option value="bullish">Most bullish</option>
                        <option value="bearish">Most bearish</option>
                      </select>
                    </div>
                    <label className="check" htmlFor="f-watch">
                      <input
                        id="f-watch"
                        type="checkbox"
                        checked={filters.watchOnly}
                        onChange={(event) => setFilter('watchOnly', event.target.checked)}
                      />
                      Watchlist only
                    </label>
                  </div>
                </section>

                <div className="feed-head">
                  <h2>
                    {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
                    <span className="tag" title="Companies, tickers and figures in the starter feed are fictional.">Sample data</span>
                  </h2>
                  <div className="feed-actions">
                    {filtersActive && (
                      <button type="button" className="btn btn-small" onClick={() => setFilters(DEFAULT_FILTERS)}>
                        Clear filters
                      </button>
                    )}
                    <button type="button" className="btn btn-small" onClick={() => setModal('export')} disabled={filtered.length === 0}>
                      Export
                    </button>
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <p className="empty">
                    No story matches these filters. Clear the filters, or use Analyze article to add your own.
                  </p>
                ) : (
                  <div className="stories">
                    {filtered.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        expanded={expanded.has(article.id)}
                        onToggle={toggleExpanded}
                        watchlist={watchlist}
                        onToggleWatch={toggleWatch}
                        onTickerSelect={selectTicker}
                        companies={COMPANIES}
                        canReanalyze={engine.status === 'live'}
                        aiName={PROVIDER_LABELS[engine.provider] ?? 'AI'}
                        reanalyzing={reanalyzing === article.id}
                        onReanalyze={reanalyze}
                        onRemove={article.isSample ? undefined : removeArticle}
                      />
                    ))}
                  </div>
                )}
              </div>

              <aside className="side">
                <section className="card panel">
                  <div className="panel-head">
                    <h3>Alerts</h3>
                    <button type="button" className="btn btn-small" onClick={() => go('alerts')}>Manage rules</button>
                  </div>
                  {unreadAlerts.length === 0 ? (
                    <p className="muted">You are all caught up.</p>
                  ) : (
                    <ul className="alert-list compact">
                      {unreadAlerts.slice(0, 4).map((alert) => (
                        <AlertItem key={alert.id} alert={alert} unread onOpen={openStory} />
                      ))}
                    </ul>
                  )}
                  {unreadAlerts.length > 4 && (
                    <button type="button" className="btn-link" onClick={() => go('alerts')}>
                      See all {unreadAlerts.length} unread alerts
                    </button>
                  )}
                </section>

                <section className="card panel">
                  <div className="panel-head">
                    <h3>Watchlist</h3>
                    <button type="button" className="btn btn-small" onClick={() => go('watchlist')}>Edit</button>
                  </div>
                  {watchlist.length === 0 ? (
                    <p className="muted">Tap the star next to a ticker to follow it.</p>
                  ) : (
                    <ul className="pulse-list">
                      {watchlist.map((ticker) => {
                        const info = pulse.find((item) => item.ticker === ticker);
                        const direction = !info || info.pulse === 0 ? 'flat' : info.pulse > 0 ? 'up' : 'down';
                        return (
                          <li key={ticker}>
                            <button type="button" className="btn-link mono" onClick={() => selectTicker(ticker)}>{ticker}</button>
                            <span className="muted pulse-name">{COMPANIES[ticker] ?? ''}</span>
                            <span className={`dir dir-${direction} mono`}>
                              <span aria-hidden="true">{ARROW[direction]}</span> {info ? signed(info.pulse) : '0'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </aside>
            </div>
          </div>
        )}

        {view === 'analytics' && (
          <Analytics articles={articles} pulse={pulse} companies={COMPANIES} onTickerSelect={selectTicker} onOpenStory={openStory} />
        )}

        {view === 'watchlist' && (
          <WatchlistView
            watchlist={watchlist}
            onToggleWatch={toggleWatch}
            pulse={pulse}
            companies={COMPANIES}
            onOpenStory={openStory}
            onTickerSelect={selectTicker}
          />
        )}

        {view === 'alerts' && (
          <AlertsView
            alerts={alerts}
            readIds={readIds}
            onOpen={openStory}
            onMarkAllRead={() => setReadIds([...new Set([...readIds, ...alerts.map((alert) => alert.id)])])}
            rules={rules}
            onRulesChange={setRules}
          />
        )}
      </main>

      <footer className="footer">
        <p>
          The starter feed is sample data: its companies, tickers, index and figures are fictional. Analysis is for
          information only and is not investment advice.
        </p>
      </footer>

      {modal === 'analyze' && (
        <AnalyzeModal engine={engine} knownTickers={knownTickers} companies={COMPANIES} onClose={closeModal} onAdd={addArticle} />
      )}
      {modal === 'export' && <ExportModal articles={filtered} onClose={closeModal} />}
    </div>
  );
}
