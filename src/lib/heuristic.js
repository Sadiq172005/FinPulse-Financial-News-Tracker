// Rule-based fallback analyser. It runs in the browser when no Claude API
// back end is reachable, so the dashboard stays usable as a static demo.
// It is deliberately simple: a weighted keyword lexicon, a few phrase rules
// and regular expressions for tickers and figures.

import { CATEGORIES } from './constants.js';
import { impactFromScore, normalizeAnalysis, sentimentFromScore } from './normalize.js';

const POSITIVE = {
  beat: 2, beats: 2, surge: 3, surges: 3, surged: 3, soar: 3, soars: 3, soared: 3,
  jump: 2, jumps: 2, jumped: 2, rally: 2, rallies: 2, rallied: 2, record: 2,
  upgrade: 2, upgrades: 2, upgraded: 2, growth: 1, grew: 1, profit: 1, profitable: 2,
  gain: 1, gains: 1, gained: 1, wins: 2, win: 2, won: 2, approval: 2, approved: 2,
  expands: 1, expansion: 1, strong: 1, robust: 1, rebound: 2, rebounds: 2,
  outperform: 2, buyback: 2, dividend: 1, partnership: 1, rose: 1, rises: 1, rise: 1,
  climbs: 2, climbed: 2, boost: 1, boosts: 1, eased: 1, cools: 1, cooled: 1,
};

const NEGATIVE = {
  miss: 2, misses: 2, missed: 2, plunge: 3, plunges: 3, plunged: 3, slump: 3,
  slumps: 3, tumbles: 3, tumbled: 3, slides: 2, slid: 2, fall: 2, falls: 2, fell: 2,
  drop: 2, drops: 2, dropped: 2, downgrade: 2, downgrades: 2, downgraded: 2,
  probe: 2, investigation: 2, lawsuit: 2, fraud: 3, default: 3, defaults: 3,
  recall: 2, layoffs: 2, loss: 2, losses: 2, weak: 1, weaker: 1, weakens: 1,
  warning: 2, warns: 2, delay: 1, delays: 1, delayed: 1, fine: 2, fined: 2,
  penalty: 2, hack: 3, hacked: 3, breach: 3, bankruptcy: 3, selloff: 3,
  decline: 2, declines: 2, declined: 2, slowdown: 2, slows: 2, shortage: 2,
  outage: 2, halts: 3, halted: 3, liquidated: 2, trims: 2, slipped: 1,
};

// Phrases are scored first and removed, so their words are not counted twice.
const PHRASES = [
  [/rate cuts?|cuts? (?:interest |policy )?rates?/, 2],
  [/rate hikes?|raises? (?:interest |policy )?rates?/, -2],
  [/raises? (?:full-year |annual )?(?:guidance|outlook|forecast)/, 3],
  [/(?:cuts?|lowers?|trims?) (?:full-year |annual )?(?:guidance|outlook|forecast)/, -3],
  [/profit warning/, -3],
  [/record high/, 3],
  [/record low/, -3],
  [/sell-off/, -3],
  [/bad loans?/, -2],
];

const AMPLIFIERS = [
  'record', 'unexpected', 'surprise', 'sharply', 'emergency', 'biggest', 'largest',
  'crisis', 'halt', 'default', 'bankruptcy', 'acquire', 'merger',
];

const CATEGORY_HINTS = {
  Earnings: /\b(quarter|quarterly|earnings|revenue|net profit|guidance|results|margin)\b/i,
  Economy: /\b(inflation|central bank|gdp|policy rate|interest rate|factory output|unemployment|fiscal|exports?)\b/i,
  Banking: /\b(bank|lender|loans?|deposits?|provisions?|credit card|npa)\b/i,
  Technology: /\b(software|chip|semiconductor|cloud|ai|app|telecom|data cent(?:er|re)|outage)\b/i,
  Energy: /\b(crude|oil|gas|solar|gold|barrel|opec|refinery|mining|coal)\b/i,
  Crypto: /\b(bitcoin|ether|crypto|stablecoin|token|blockchain|staking)\b/i,
  Deals: /\b(acquire|acquisition|merger|ipo|stake|buyout|takeover|listing)\b/i,
  Markets: /\b(index|stocks|shares|rally|volatility|investors|benchmark)\b/i,
};

const NOT_TICKERS = new Set([
  'CEO', 'CFO', 'GDP', 'IPO', 'USD', 'EUR', 'INR', 'AI', 'ETF', 'FY', 'YOY', 'QOQ',
  'US', 'UK', 'EU', 'GST', 'SEC', 'IMF', 'OPEC', 'EV', 'IT', 'API', 'CPI', 'PMI',
  'NPA', 'EPS', 'GW', 'MW', 'OFS',
]);

const HORIZON_BY_CATEGORY = {
  Markets: 'Intraday',
  Crypto: 'Intraday',
  Earnings: 'Short-term',
  Banking: 'Short-term',
  Technology: 'Short-term',
  Energy: 'Short-term',
  Economy: 'Medium-term',
  Deals: 'Medium-term',
};

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export function extractTickers(text, known = []) {
  const found = new Set();
  const pattern = /\(([A-Z]{2,6})\)|\$([A-Z]{2,6})\b|\b(?:NSE|BSE|NYSE|NASDAQ):\s?([A-Z]{2,10})\b/g;
  for (const match of text.matchAll(pattern)) {
    const ticker = match[1] || match[2] || match[3];
    if (!NOT_TICKERS.has(ticker)) found.add(ticker);
  }
  for (const ticker of known) {
    if (new RegExp(`\\b${ticker}\\b`).test(text)) found.add(ticker);
  }
  return [...found].slice(0, 6);
}

const NUMBER_PATTERN =
  /(?:[$₹€£]\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:trillion|billion|million|crore|lakh|bn|mn)\b)?|\d[\d,]*(?:\.\d+)?\s?(?:%|percent\b|bps\b|basis points\b|GW\b|MW\b))/gi;

const LEADING_FILLER = /^(?:and|to|of|by|at|from|the|a|an|was|were|is|with|its|in|on|for|about|up|down|than|that|as)\s+/i;
const TRAILING_FILLER = /\s+(?:of|to|by|at|from|a|an|the|about|was|is|were|nearly|around|some|than)$/i;

export function extractKeyNumbers(text, max = 5) {
  const numbers = [];
  const seen = new Set();
  for (const match of text.matchAll(NUMBER_PATTERN)) {
    const value = match[0].trim();
    if (seen.has(value)) continue;
    seen.add(value);

    const clause = text
      .slice(Math.max(0, match.index - 70), match.index)
      .split(/[.;:!?(,]/)
      .pop()
      .trim();
    let label = clause.split(/\s+/).filter(Boolean).slice(-4).join(' ');
    for (let i = 0; i < 3; i += 1) label = label.replace(LEADING_FILLER, '');
    for (let i = 0; i < 2; i += 1) label = label.replace(TRAILING_FILLER, '');

    numbers.push({ label: label ? capitalise(label) : 'Figure', value });
    if (numbers.length >= max) break;
  }
  return numbers;
}

export function scoreSentiment(text) {
  let working = text.toLowerCase();
  let raw = 0;
  let hits = 0;

  for (const [pattern, weight] of PHRASES) {
    if (pattern.test(working)) {
      raw += weight;
      hits += 1;
      working = working.replace(pattern, ' ');
    }
  }
  for (const word of working.match(/[a-z]+/g) ?? []) {
    if (POSITIVE[word]) {
      raw += POSITIVE[word];
      hits += 1;
    } else if (NEGATIVE[word]) {
      raw -= NEGATIVE[word];
      hits += 1;
    }
  }
  return { raw, hits, score: Math.round(100 * Math.tanh(raw / 6)) };
}

export function classifyCategory(text) {
  let best = 'Markets';
  let bestCount = 0;
  for (const category of CATEGORIES) {
    const pattern = new RegExp(CATEGORY_HINTS[category].source, 'gi');
    const count = (text.match(pattern) ?? []).length;
    if (count > bestCount) {
      best = category;
      bestCount = count;
    }
  }
  return best;
}

function summarise(headline, body) {
  // Split only where punctuation is followed by a space, so "$1.1 billion" stays whole.
  const sentences = body.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
  const summary = sentences.slice(0, 2).join(' ') || headline;
  return summary.length > 320 ? `${summary.slice(0, 317).trimEnd()}...` : summary;
}

function watchOutFor(sentiment, category) {
  if (sentiment === 'bullish') {
    return `Positive ${category.toLowerCase()} headlines are often priced in quickly. Check whether the numbers beat what the market already expected before acting.`;
  }
  if (sentiment === 'bearish') {
    return `Look for follow-up disclosures. One negative ${category.toLowerCase()} story can widen if peers or regulators confirm the same trend.`;
  }
  return 'The tone is mixed. Wait for a clear catalyst, such as guidance, data or an official statement, before reading direction into it.';
}

/** Analyse one article without any network call. */
export function analyzeHeuristic({ headline = '', body = '', category, knownTickers = [] }) {
  const text = `${headline}. ${body}`;
  const { raw, hits, score } = scoreSentiment(text);
  const sentiment = sentimentFromScore(score);
  const tickers = extractTickers(text, knownTickers);
  const resolvedCategory = CATEGORIES.includes(category) ? category : classifyCategory(text);

  const percentages = [...text.matchAll(/(\d+(?:\.\d+)?)\s?%/g)].map((m) => parseFloat(m[1]));
  const largestMove = Math.min(40, Math.max(0, ...percentages));
  const lower = text.toLowerCase();
  const amplifiers = AMPLIFIERS.filter((word) => lower.includes(word)).length;
  const scale = /\b(?:billion|trillion|crore)\b/i.test(text) ? 8 : 0;
  const impactScore = clamp(
    Math.round(22 + Math.abs(raw) * 5 + largestMove * 0.8 + amplifiers * 7 + scale + (tickers.length ? 5 : 0)),
    5,
    97,
  );

  const direction = sentiment === 'bullish' ? 'up' : sentiment === 'bearish' ? 'down' : 'flat';
  const tone = `${sentiment} (${score > 0 ? '+' : ''}${score})`;

  return normalizeAnalysis(
    {
      summary: summarise(headline, body),
      category: resolvedCategory,
      sentiment,
      sentimentScore: score,
      impact: impactFromScore(impactScore),
      impactScore,
      stockImpact: tickers.map((ticker) => ({
        ticker,
        direction,
        expectedMove: direction === 'flat' ? 'Range-bound' : 'Direction only',
        rationale: `Headline tone reads ${tone}. The demo engine infers direction from keywords, not from fundamentals.`,
      })),
      keyNumbers: extractKeyNumbers(text),
      watchOut: watchOutFor(sentiment, resolvedCategory),
      horizon: HORIZON_BY_CATEGORY[resolvedCategory],
      confidence: clamp(30 + hits * 5, 30, 60),
    },
    'heuristic',
  );
}
