import { CATEGORIES, DIRECTIONS, HORIZONS, IMPACTS, SENTIMENTS } from '../src/lib/constants.js';

export const SYSTEM_PROMPT = `You are a sell-side equity research assistant. You read one financial news article and record a structured market-impact analysis by calling the record_analysis tool.

Rules:
- Use only facts stated in the article. Never invent figures, tickers or company names.
- Be specific and concise. Write in plain English that a retail investor can follow.
- If the article names no listed company or asset, return an empty stockImpact list.
- impactScore reflects how much the news could move prices: 70-100 is HIGH, 40-69 is MEDIUM, 0-39 is LOW.
- sentimentScore runs from -100 (very bearish) to 100 (very bullish). Use neutral when effects are mixed.
- confidence reflects how complete and unambiguous the article is, not how strongly you feel.
- This is analysis for information only, never a recommendation to buy or sell.`;

// Forcing this tool with tool_choice guarantees a JSON object that matches the
// schema, so the server never has to parse free-form text.
export const ANALYSIS_TOOL = {
  name: 'record_analysis',
  description: 'Record the structured market-impact analysis of one financial news article.',
  input_schema: {
    type: 'object',
    properties: {
      summary: { type: 'string', description: 'One or two sentences, at most 45 words.' },
      category: { type: 'string', enum: CATEGORIES },
      sentiment: { type: 'string', enum: SENTIMENTS },
      sentimentScore: { type: 'integer', description: '-100 (very bearish) to 100 (very bullish).' },
      impact: { type: 'string', enum: IMPACTS },
      impactScore: { type: 'integer', description: '0 to 100. Must agree with the impact label.' },
      stockImpact: {
        type: 'array',
        description: 'Up to 5 listed companies or assets the article affects, most affected first.',
        items: {
          type: 'object',
          properties: {
            ticker: { type: 'string', description: 'Ticker symbol in capitals, as given in the article.' },
            direction: { type: 'string', enum: DIRECTIONS },
            expectedMove: { type: 'string', description: 'Short range such as "+2% to +4%" or "Range-bound".' },
            rationale: { type: 'string', description: 'One sentence explaining the direction.' },
          },
          required: ['ticker', 'direction', 'expectedMove', 'rationale'],
        },
      },
      keyNumbers: {
        type: 'array',
        description: '2 to 5 figures from the article that matter most.',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            value: { type: 'string', description: 'The figure with its unit, for example "$8.4B (+46% YoY)".' },
          },
          required: ['label', 'value'],
        },
      },
      watchOut: { type: 'string', description: 'The single most important risk or caveat, in one or two sentences.' },
      horizon: { type: 'string', enum: HORIZONS, description: 'When the effect is most likely to play out.' },
      confidence: { type: 'integer', description: '0 to 100.' },
    },
    required: [
      'summary', 'category', 'sentiment', 'sentimentScore', 'impact', 'impactScore',
      'stockImpact', 'keyNumbers', 'watchOut', 'horizon', 'confidence',
    ],
  },
};

export function buildUserPrompt({ headline, body, category }) {
  return [
    category ? `Category hint from the user: ${category}` : null,
    `Headline: ${headline}`,
    '',
    'Article:',
    body || '(No body text was provided. Analyse the headline only and lower your confidence.)',
  ]
    .filter((line) => line !== null)
    .join('\n');
}
