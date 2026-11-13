import { CATEGORIES, DIRECTIONS, HORIZONS, IMPACTS, SENTIMENTS } from './constants.js';

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

const toInt = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
};

const toText = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export const impactFromScore = (score) => (score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW');

export const sentimentFromScore = (score) =>
  score > 15 ? 'bullish' : score < -15 ? 'bearish' : 'neutral';

/**
 * Turns any analysis-shaped object (from Claude, GPT, the demo engine or storage)
 * into the exact structure the UI renders. Unknown values fall back to safe
 * defaults, scores are clamped, and lists are capped.
 */
export function normalizeAnalysis(raw = {}, engine = 'claude') {
  const sentimentScore = clamp(toInt(raw.sentimentScore, 0), -100, 100);
  const impactScore = clamp(toInt(raw.impactScore, 50), 0, 100);

  const sentiment = SENTIMENTS.includes(raw.sentiment)
    ? raw.sentiment
    : sentimentFromScore(sentimentScore);

  const impactLabel = String(raw.impact ?? '').toUpperCase();
  const impact = IMPACTS.includes(impactLabel) ? impactLabel : impactFromScore(impactScore);

  const seen = new Set();
  const stockImpact = (Array.isArray(raw.stockImpact) ? raw.stockImpact : [])
    .map((item) => ({
      ticker: toText(item?.ticker, 12)
        .toUpperCase()
        .replace(/[^A-Z0-9.&-]/g, ''),
      direction: DIRECTIONS.includes(item?.direction) ? item.direction : 'flat',
      expectedMove: toText(item?.expectedMove, 40),
      rationale: toText(item?.rationale, 260),
    }))
    .filter((item) => {
      if (!item.ticker || seen.has(item.ticker)) return false;
      seen.add(item.ticker);
      return true;
    })
    .slice(0, 6);

  const keyNumbers = (Array.isArray(raw.keyNumbers) ? raw.keyNumbers : [])
    .map((item) => ({ label: toText(item?.label, 60), value: toText(String(item?.value ?? ''), 40) }))
    .filter((item) => item.label && item.value)
    .slice(0, 6);

  return {
    summary: toText(raw.summary, 500),
    category: CATEGORIES.includes(raw.category) ? raw.category : null,
    sentiment,
    sentimentScore,
    impact,
    impactScore,
    stockImpact,
    keyNumbers,
    watchOut: toText(raw.watchOut, 400),
    horizon: HORIZONS.includes(raw.horizon) ? raw.horizon : 'Short-term',
    confidence: clamp(toInt(raw.confidence, 50), 0, 100),
    engine,
  };
}
