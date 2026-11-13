import { useState } from 'react';

import { signed, timeAgo } from '../lib/format.js';
import { ARROW } from './Pills.jsx';

export default function WatchlistView({ watchlist, onToggleWatch, pulse, companies, onOpenStory, onTickerSelect }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const byTicker = new Map(pulse.map((item) => [item.ticker, item]));

  const add = (event) => {
    event.preventDefault();
    const ticker = draft.trim().toUpperCase();
    if (!/^[A-Z0-9.&-]{1,10}$/.test(ticker)) {
      setError('Enter a ticker symbol such as NOVA.');
      return;
    }
    if (watchlist.includes(ticker)) {
      setError(`${ticker} is already on your watchlist.`);
      return;
    }
    onToggleWatch(ticker);
    setDraft('');
    setError('');
  };

  return (
    <div className="view">
      <div className="view-head">
        <h2>Watchlist</h2>
        <p className="muted">Tickers you follow. Stories that mention them can trigger alerts.</p>
      </div>

      <form className="inline-form" onSubmit={add}>
        <label htmlFor="watch-add" className="sr-only">Ticker to add</label>
        <input
          id="watch-add"
          type="text"
          list="known-tickers"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a ticker, e.g. SOLR"
          maxLength={10}
          autoComplete="off"
        />
        <datalist id="known-tickers">
          {pulse.filter((item) => !watchlist.includes(item.ticker)).map((item) => (
            <option key={item.ticker} value={item.ticker}>{companies[item.ticker]}</option>
          ))}
        </datalist>
        <button type="submit" className="btn btn-primary">Add to watchlist</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}

      {watchlist.length === 0 ? (
        <p className="empty">Your watchlist is empty. Add a ticker above, or tap the star next to any ticker in the feed.</p>
      ) : (
        <div className="watch-grid">
          {watchlist.map((ticker) => {
            const info = byTicker.get(ticker);
            const tone = !info || info.pulse === 0 ? 'flat' : info.pulse > 0 ? 'up' : 'down';
            const stories = (info?.stories ?? [])
              .slice()
              .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
              .slice(0, 3);
            return (
              <section className="card watch-card" key={ticker}>
                <header className="watch-head">
                  <div>
                    <button type="button" className="btn-link watch-ticker mono" onClick={() => onTickerSelect(ticker)}>
                      {ticker}
                    </button>
                    <span className="muted">{companies[ticker] ?? 'Not in the current feed'}</span>
                  </div>
                  <button type="button" className="btn btn-small" onClick={() => onToggleWatch(ticker)} aria-label={`Remove ${ticker} from watchlist`}>
                    Remove
                  </button>
                </header>
                <div className="watch-pulse">
                  <span className={`dir dir-${tone}`}>
                    <span aria-hidden="true">{ARROW[tone]}</span> Pulse {info ? signed(info.pulse) : '0'}
                  </span>
                  <span className="muted">
                    {info ? `${info.mentions} ${info.mentions === 1 ? 'story' : 'stories'}` : 'No stories yet'}
                  </span>
                </div>
                {stories.length > 0 && (
                  <ul className="mini-list">
                    {stories.map((story) => (
                      <li key={story.id}>
                        <button type="button" className="btn-link" onClick={() => onOpenStory(story.id)}>
                          {story.headline}
                        </button>
                        <span className="muted">{timeAgo(story.publishedAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
