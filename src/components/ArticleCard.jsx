import { ENGINE_LABELS } from '../lib/constants.js';
import { timeAgo } from '../lib/format.js';
import { ARROW, ImpactPill, SentimentPill, TickerChip } from './Pills.jsx';

const DIRECTION_WORD = { up: 'Up', down: 'Down', flat: 'Flat' };

export function AnalysisDetail({ analysis, body, companies = {} }) {
  return (
    <div className="detail">
      {body && (
        <section className="detail-block">
          <h4>Article</h4>
          <p className="detail-body">{body}</p>
        </section>
      )}

      <section className="detail-block">
        <h4>Stock impact</h4>
        {analysis.stockImpact.length === 0 ? (
          <p className="muted">This story names no listed company or asset.</p>
        ) : (
          <ul className="impact-list">
            {analysis.stockImpact.map((item) => (
              <li key={item.ticker}>
                <div className="impact-line">
                  <span className={`dir dir-${item.direction}`}>
                    <span aria-hidden="true">{ARROW[item.direction]}</span> {DIRECTION_WORD[item.direction]}
                  </span>
                  <strong className="mono">{item.ticker}</strong>
                  {companies[item.ticker] && <span className="muted">{companies[item.ticker]}</span>}
                  {item.expectedMove && <span className="move mono">{item.expectedMove}</span>}
                </div>
                {item.rationale && <p>{item.rationale}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {analysis.keyNumbers.length > 0 && (
        <section className="detail-block">
          <h4>Key numbers</h4>
          <dl className="numbers">
            {analysis.keyNumbers.map((item) => (
              <div key={`${item.label}-${item.value}`}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {analysis.watchOut && (
        <section className="detail-block watch">
          <h4>Watch out</h4>
          <p>{analysis.watchOut}</p>
        </section>
      )}

      <dl className="meta-grid">
        <div>
          <dt>Horizon</dt>
          <dd>{analysis.horizon}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>
            <span className="meter" aria-hidden="true">
              <span style={{ width: `${analysis.confidence}%` }} />
            </span>
            {analysis.confidence}%
          </dd>
        </div>
        <div>
          <dt>Analysed by</dt>
          <dd>{ENGINE_LABELS[analysis.engine] ?? analysis.engine}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function ArticleCard({
  article,
  expanded,
  onToggle,
  watchlist,
  onToggleWatch,
  onTickerSelect,
  companies,
  canReanalyze,
  reanalyzing,
  onReanalyze,
  onRemove,
  aiName = 'AI',
}) {
  const { analysis } = article;
  const detailId = `detail-${article.id}`;

  return (
    <article id={`story-${article.id}`} className={`card story story-${analysis.impact.toLowerCase()}`}>
      <div className="story-meta">
        <span className="story-cat">{article.category}</span>
        <span>{article.source}</span>
        <time dateTime={article.publishedAt}>{timeAgo(article.publishedAt)}</time>
        {!article.isSample && <span className="tag">Added by you</span>}
        <span className="story-impact">
          <ImpactPill impact={analysis.impact} score={analysis.impactScore} />
        </span>
      </div>

      <h3 className="story-title">{article.headline}</h3>
      <p className="story-summary">{analysis.summary}</p>

      <div className="story-foot">
        <SentimentPill sentiment={analysis.sentiment} score={analysis.sentimentScore} />
        {analysis.stockImpact.map((item) => (
          <TickerChip
            key={item.ticker}
            ticker={item.ticker}
            direction={item.direction}
            name={companies[item.ticker]}
            watched={watchlist.includes(item.ticker)}
            onSelect={onTickerSelect}
            onToggleWatch={onToggleWatch}
          />
        ))}
        <button
          type="button"
          className="btn btn-link story-toggle"
          aria-expanded={expanded}
          aria-controls={detailId}
          onClick={() => onToggle(article.id)}
        >
          {expanded ? 'Hide analysis' : 'Full analysis'}
        </button>
      </div>

      {expanded && (
        <div id={detailId}>
          <AnalysisDetail analysis={analysis} body={article.body} companies={companies} />
          {(canReanalyze || onRemove) && (
            <div className="detail-actions">
              {canReanalyze && (
                <button type="button" className="btn" disabled={reanalyzing} onClick={() => onReanalyze(article)}>
                  {reanalyzing ? `Analysing with ${aiName}…` : `Re-analyse with ${aiName}`}
                </button>
              )}
              {onRemove && (
                <button type="button" className="btn" onClick={() => onRemove(article.id)}>
                  Remove from feed
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
