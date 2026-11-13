export function timeAgo(iso, now = Date.now()) {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');

export const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export function toCSV(articles) {
  const header = [
    'published_at', 'category', 'source', 'headline', 'tickers', 'sentiment',
    'sentiment_score', 'impact', 'impact_score', 'horizon', 'confidence', 'summary',
    'watch_out', 'engine',
  ];
  const rows = articles.map((article) => {
    const a = article.analysis;
    return [
      article.publishedAt, article.category, article.source, article.headline,
      article.tickers.join(' '), a.sentiment, a.sentimentScore, a.impact, a.impactScore,
      a.horizon, a.confidence, a.summary, a.watchOut, a.engine,
    ]
      .map(csvCell)
      .join(',');
  });
  return [header.join(','), ...rows].join('\n');
}

export function toJSON(articles) {
  return JSON.stringify(
    articles.map(({ id, headline, source, publishedAt, category, body, tickers, analysis }) => ({
      id, headline, source, publishedAt, category, body, tickers, analysis,
    })),
    null,
    2,
  );
}
