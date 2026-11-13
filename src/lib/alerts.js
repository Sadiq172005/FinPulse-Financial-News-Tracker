import { IMPACT_RANK } from './constants.js';

export const DEFAULT_RULES = [
  { id: 'rule-high', name: 'Any high-impact story', scope: 'all', value: '', minImpact: 'HIGH', sentiment: 'any', enabled: true },
  { id: 'rule-watch', name: 'Watchlist movers', scope: 'watchlist', value: '', minImpact: 'MEDIUM', sentiment: 'any', enabled: true },
  { id: 'rule-bank', name: 'Bearish banking news', scope: 'category', value: 'Banking', minImpact: 'MEDIUM', sentiment: 'bearish', enabled: true },
];

export const SCOPE_LABELS = {
  all: 'All stories',
  watchlist: 'Watchlist tickers',
  ticker: 'Ticker',
  keyword: 'Keyword',
  category: 'Category',
};

/** True when the article satisfies every condition of the rule. */
export function matchesRule(article, rule, watchlist = []) {
  if (!rule.enabled) return false;
  const { analysis } = article;
  if (IMPACT_RANK[analysis.impact] < IMPACT_RANK[rule.minImpact]) return false;
  if (rule.sentiment !== 'any' && analysis.sentiment !== rule.sentiment) return false;

  const value = String(rule.value ?? '').trim();
  switch (rule.scope) {
    case 'watchlist':
      return article.tickers.some((ticker) => watchlist.includes(ticker));
    case 'ticker':
      return article.tickers.includes(value.toUpperCase());
    case 'category':
      return article.category === value;
    case 'keyword': {
      if (!value) return false;
      const haystack = `${article.headline} ${article.body} ${analysis.summary}`.toLowerCase();
      return haystack.includes(value.toLowerCase());
    }
    default:
      return true;
  }
}

/** One alert per article, listing every rule it triggered. Strongest first. */
export function buildAlerts(articles, rules, watchlist = []) {
  return articles
    .map((article) => ({
      id: article.id,
      article,
      rules: rules.filter((rule) => matchesRule(article, rule, watchlist)).map((rule) => rule.name),
    }))
    .filter((alert) => alert.rules.length > 0)
    .sort(
      (a, b) =>
        b.article.analysis.impactScore - a.article.analysis.impactScore ||
        new Date(b.article.publishedAt) - new Date(a.article.publishedAt),
    );
}

export function describeRule(rule) {
  const parts = [];
  if (rule.scope === 'all') parts.push('Any story');
  else if (rule.scope === 'watchlist') parts.push('Watchlist tickers');
  else parts.push(`${SCOPE_LABELS[rule.scope]} "${rule.value}"`);
  parts.push(rule.minImpact === 'LOW' ? 'any impact' : `${rule.minImpact.toLowerCase()} impact or above`);
  if (rule.sentiment !== 'any') parts.push(`${rule.sentiment} only`);
  return parts.join(' · ');
}
