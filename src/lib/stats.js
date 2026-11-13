import { CATEGORIES } from './constants.js';

const SIGN = { up: 1, down: -1, flat: 0 };

/**
 * News pulse per ticker: the average signed impact score of every story that
 * mentions it. +100 means consistently strong positive coverage, -100 the
 * opposite. This is a news signal, not a price.
 */
export function tickerPulse(articles) {
  const byTicker = new Map();
  for (const article of articles) {
    for (const item of article.analysis.stockImpact) {
      const entry = byTicker.get(item.ticker) ?? { ticker: item.ticker, mentions: 0, sum: 0, stories: [] };
      entry.mentions += 1;
      entry.sum += SIGN[item.direction] * article.analysis.impactScore;
      entry.stories.push(article);
      byTicker.set(item.ticker, entry);
    }
  }
  return [...byTicker.values()]
    .map(({ sum, ...entry }) => ({ ...entry, pulse: Math.round(sum / entry.mentions) }))
    .sort((a, b) => b.pulse - a.pulse);
}

export function sentimentByCategory(articles) {
  return CATEGORIES.map((category) => {
    const rows = articles.filter((article) => article.category === category);
    const count = (sentiment) => rows.filter((article) => article.analysis.sentiment === sentiment).length;
    return {
      category,
      bullish: count('bullish'),
      neutral: count('neutral'),
      bearish: count('bearish'),
      total: rows.length,
    };
  });
}

export function impactMix(articles) {
  const mix = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const article of articles) mix[article.analysis.impact] += 1;
  return mix;
}
