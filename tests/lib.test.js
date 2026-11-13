import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildSampleArticles } from '../src/data/articles.js';
import { buildAlerts, DEFAULT_RULES, matchesRule } from '../src/lib/alerts.js';
import { toCSV } from '../src/lib/format.js';
import { analyzeHeuristic, extractKeyNumbers, extractTickers } from '../src/lib/heuristic.js';
import { normalizeAnalysis } from '../src/lib/normalize.js';
import { impactMix, sentimentByCategory, tickerPulse } from '../src/lib/stats.js';

const articles = buildSampleArticles(Date.UTC(2026, 0, 15));

test('sample dataset is complete and internally consistent', () => {
  assert.equal(articles.length, 24);
  for (const article of articles) {
    const normalised = normalizeAnalysis(article.analysis, 'sample');
    assert.equal(normalised.impact, article.analysis.impact, `${article.id} impact label matches score band`);
    assert.equal(normalised.sentiment, article.analysis.sentiment);
    assert.ok(article.analysis.summary.length > 20);
    assert.ok(article.analysis.watchOut.length > 20);
    assert.deepEqual(article.tickers, article.analysis.stockImpact.map((s) => s.ticker));
  }
});

test('normalizeAnalysis clamps scores and repairs bad values', () => {
  const result = normalizeAnalysis({
    sentimentScore: 400,
    impactScore: -5,
    impact: 'extreme',
    stockImpact: [
      { ticker: 'nova ', direction: 'sideways' },
      { ticker: 'NOVA', direction: 'up' },
      { ticker: '' },
    ],
    keyNumbers: [{ label: 'Revenue', value: 12 }, { label: '', value: 'x' }],
    horizon: 'Forever',
  });
  assert.equal(result.sentimentScore, 100);
  assert.equal(result.sentiment, 'bullish');
  assert.equal(result.impactScore, 0);
  assert.equal(result.impact, 'LOW');
  assert.deepEqual(result.stockImpact.map((s) => [s.ticker, s.direction]), [['NOVA', 'flat']]);
  assert.deepEqual(result.keyNumbers, [{ label: 'Revenue', value: '12' }]);
  assert.equal(result.horizon, 'Short-term');
});

test('heuristic engine reads direction, tickers and figures', () => {
  const bullish = analyzeHeuristic({
    headline: 'Orbit Logistics wins $1.1 billion contract, raises full-year guidance',
    body: 'Orbit Logistics (ORBT) raised revenue guidance by 9%. Shares jumped 6% in early trade.',
  });
  assert.equal(bullish.sentiment, 'bullish');
  assert.equal(bullish.engine, 'heuristic');
  assert.deepEqual(bullish.stockImpact.map((s) => s.ticker), ['ORBT']);
  assert.equal(bullish.stockImpact[0].direction, 'up');
  assert.ok(bullish.keyNumbers.some((k) => k.value === '$1.1 billion'));

  const decimal = analyzeHeuristic({
    headline: 'Orbit Logistics wins large contract',
    body: 'Orbit Logistics (ORBT) won a contract worth $1.1 billion. Guidance rose 9%. Shares jumped.',
  });
  assert.equal(decimal.summary, 'Orbit Logistics (ORBT) won a contract worth $1.1 billion. Guidance rose 9%.');

  const bearish = analyzeHeuristic({
    headline: 'Lender plunges after fraud probe and profit warning',
    body: 'Shares fell 18% after the bank disclosed losses.',
  });
  assert.equal(bearish.sentiment, 'bearish');
  assert.ok(bearish.impactScore > bullish.impactScore - 40);
  assert.equal(bearish.category, 'Banking');
});

test('ticker and number extraction ignore common false positives', () => {
  assert.deepEqual(extractTickers('The CEO said GDP (USD) rose; see Novara (NOVA) and $VLTA.'), ['NOVA', 'VLTA']);
  assert.deepEqual(
    extractKeyNumbers('Revenue rose 18% to $4.2 billion while margins fell 120 bps.').map((n) => n.value),
    ['18%', '$4.2 billion', '120 bps'],
  );
});

test('alert rules match on scope, impact and sentiment', () => {
  const alerts = buildAlerts(articles, DEFAULT_RULES, ['NOVA', 'MRDN', 'VLTA']);
  const highCount = articles.filter((a) => a.analysis.impact === 'HIGH').length;
  assert.ok(alerts.length >= highCount);
  assert.ok(alerts[0].article.analysis.impactScore >= alerts.at(-1).article.analysis.impactScore);

  const meridian = articles.find((a) => a.id === 's05');
  const names = alerts.find((a) => a.id === 's05').rules;
  assert.deepEqual(names, ['Any high-impact story', 'Watchlist movers', 'Bearish banking news']);

  const keywordRule = { id: 'k', name: 'k', scope: 'keyword', value: 'provisions', minImpact: 'LOW', sentiment: 'any', enabled: true };
  assert.equal(matchesRule(meridian, keywordRule), true);
  assert.equal(matchesRule(meridian, { ...keywordRule, enabled: false }), false);
  assert.equal(matchesRule(meridian, { ...keywordRule, sentiment: 'bullish' }), false);
});

test('stats and export helpers aggregate the feed', () => {
  const mix = impactMix(articles);
  assert.equal(mix.HIGH + mix.MEDIUM + mix.LOW, articles.length);

  const byCategory = sentimentByCategory(articles);
  assert.equal(byCategory.reduce((sum, row) => sum + row.total, 0), articles.length);

  const pulse = tickerPulse(articles);
  const nova = pulse.find((p) => p.ticker === 'NOVA');
  assert.equal(nova.mentions, 2);
  assert.equal(nova.pulse, 75);
  assert.ok(pulse.every((p) => p.pulse >= -100 && p.pulse <= 100));

  const csv = toCSV(articles).split('\n');
  assert.equal(csv.length, articles.length + 1);
});
