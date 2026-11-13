import { signed } from '../lib/format.js';
import { impactMix, sentimentByCategory } from '../lib/stats.js';
import { ARROW } from './Pills.jsx';

const SENTIMENT_KEYS = ['bullish', 'neutral', 'bearish'];
const SENTIMENT_LABEL = { bullish: 'Bullish', neutral: 'Neutral', bearish: 'Bearish' };

function SentimentByCategory({ articles }) {
  const rows = sentimentByCategory(articles);
  const max = Math.max(1, ...rows.map((row) => row.total));

  return (
    <section className="card panel">
      <h3>Sentiment by category</h3>
      <p className="panel-sub">Number of stories by tone. Bars share one scale.</p>
      <div className="legend">
        {SENTIMENT_KEYS.map((key) => (
          <span key={key}><i className={`swatch seg-${key}`} />{SENTIMENT_LABEL[key]}</span>
        ))}
      </div>
      <div className="bars">
        {rows.map((row) => (
          <div className="bar-row" key={row.category}>
            <span className="bar-label">{row.category}</span>
            <div className="bar-track">
              {SENTIMENT_KEYS.map(
                (key) =>
                  row[key] > 0 && (
                    <span
                      key={key}
                      className={`seg seg-${key}`}
                      style={{ flexGrow: row[key] }}
                      title={`${row.category}: ${row[key]} ${key}`}
                    />
                  ),
              )}
              {max - row.total > 0 && <span className="seg-gap" style={{ flexGrow: max - row.total }} />}
            </div>
            <span className="bar-value mono">
              {row.bullish}{ARROW.up} {row.neutral}{ARROW.flat} {row.bearish}{ARROW.down}
            </span>
          </div>
        ))}
      </div>
      <details className="table-toggle">
        <summary>View as table</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Category</th><th>Bullish</th><th>Neutral</th><th>Bearish</th><th>Total</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.category}>
                  <td>{row.category}</td><td>{row.bullish}</td><td>{row.neutral}</td><td>{row.bearish}</td><td>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

function PulseChart({ pulse, companies, onTickerSelect }) {
  return (
    <section className="card panel">
      <h3>News pulse by ticker</h3>
      <p className="panel-sub">
        Average signed impact of every story that mentions the ticker, from {'−'}100 to +100. A news signal, not a price.
      </p>
      <div className="bars">
        {pulse.map((item) => {
          const width = Math.abs(item.pulse) / 2;
          const tone = item.pulse > 0 ? 'bullish' : item.pulse < 0 ? 'bearish' : 'neutral';
          return (
            <button
              type="button"
              className="bar-row bar-button"
              key={item.ticker}
              onClick={() => onTickerSelect(item.ticker)}
              title={`${companies[item.ticker] ?? item.ticker}: pulse ${signed(item.pulse)} from ${item.mentions} ${item.mentions === 1 ? 'story' : 'stories'}. Click to open them.`}
            >
              <span className="bar-label mono">{item.ticker}</span>
              <span className="div-track">
                <span className="div-zero" />
                <span
                  className={`div-bar seg-${tone}`}
                  style={{ width: `${Math.max(width, 0.8)}%`, left: item.pulse >= 0 ? '50%' : `${50 - width}%` }}
                />
              </span>
              <span className="bar-value mono">{signed(item.pulse)}</span>
            </button>
          );
        })}
        <div className="bar-row axis" aria-hidden="true">
          <span className="bar-label" />
          <span className="div-axis"><span>{'−'}100</span><span>0</span><span>+100</span></span>
          <span className="bar-value" />
        </div>
      </div>
    </section>
  );
}

function ImpactMix({ articles }) {
  const mix = impactMix(articles);
  const max = Math.max(1, mix.HIGH, mix.MEDIUM, mix.LOW);
  return (
    <section className="card panel">
      <h3>Impact mix</h3>
      <p className="panel-sub">How many stories fall in each impact band.</p>
      <div className="bars">
        {['HIGH', 'MEDIUM', 'LOW'].map((level) => (
          <div className="bar-row" key={level}>
            <span className="bar-label">{level}</span>
            <div className="bar-track">
              <span className={`seg imp-fill-${level.toLowerCase()}`} style={{ flexGrow: mix[level] }} title={`${mix[level]} ${level.toLowerCase()}-impact stories`} />
              <span className="seg-gap" style={{ flexGrow: max - mix[level] }} />
            </div>
            <span className="bar-value mono">{mix[level]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskList({ articles, onOpenStory }) {
  const risks = articles
    .filter((article) => article.analysis.impact === 'HIGH' && article.analysis.watchOut)
    .sort((a, b) => b.analysis.impactScore - a.analysis.impactScore)
    .slice(0, 6);
  return (
    <section className="card panel">
      <h3>Risks to watch</h3>
      <p className="panel-sub">The watch-out from each high-impact story, strongest first.</p>
      {risks.length === 0 ? (
        <p className="muted">No high-impact stories in the feed.</p>
      ) : (
        <ul className="risk-list">
          {risks.map((article) => (
            <li key={article.id}>
              <button type="button" className="btn-link risk-title" onClick={() => onOpenStory(article.id)}>
                {article.headline}
              </button>
              <p>{article.analysis.watchOut}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Analytics({ articles, pulse, companies, onTickerSelect, onOpenStory }) {
  return (
    <div className="view">
      <div className="view-head">
        <h2>Analytics</h2>
        <p className="muted">Based on all {articles.length} stories in the feed.</p>
      </div>
      <div className="analytics-grid">
        <SentimentByCategory articles={articles} />
        <PulseChart pulse={pulse} companies={companies} onTickerSelect={onTickerSelect} />
        <ImpactMix articles={articles} />
        <RiskList articles={articles} onOpenStory={onOpenStory} />
      </div>
    </div>
  );
}
