import { capitalise, signed } from '../lib/format.js';

export const ARROW = {
  up: '▲',
  down: '▼',
  flat: '●',
  bullish: '▲',
  bearish: '▼',
  neutral: '●',
};

export function SentimentPill({ sentiment, score }) {
  return (
    <span className={`pill pill-${sentiment}`}>
      <span className="pill-icon" aria-hidden="true">{ARROW[sentiment]}</span>
      {capitalise(sentiment)}
      {typeof score === 'number' && <span className="pill-num">{signed(score)}</span>}
    </span>
  );
}

export function ImpactPill({ impact, score }) {
  return (
    <span className={`pill impact impact-${impact.toLowerCase()}`} title="Impact score out of 100">
      <span className="impact-bars" aria-hidden="true"><i /><i /><i /></span>
      {impact}
      {typeof score === 'number' && <span className="pill-num">{score}</span>}
    </span>
  );
}

export function TickerChip({ ticker, direction, name, watched, onSelect, onToggleWatch }) {
  return (
    <span className={`tchip tchip-${direction ?? 'none'}`}>
      <button
        type="button"
        className="tchip-main"
        onClick={() => onSelect?.(ticker)}
        title={name ? `${name}: show all stories` : `Show all stories for ${ticker}`}
      >
        {direction && <span className="tchip-arrow" aria-hidden="true">{ARROW[direction]}</span>}
        {ticker}
      </button>
      {onToggleWatch && (
        <button
          type="button"
          className="tchip-star"
          aria-pressed={watched}
          aria-label={watched ? `Remove ${ticker} from watchlist` : `Add ${ticker} to watchlist`}
          onClick={() => onToggleWatch(ticker)}
        >
          {watched ? '★' : '☆'}
        </button>
      )}
    </span>
  );
}
