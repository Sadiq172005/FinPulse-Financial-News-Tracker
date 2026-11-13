// Shared by the React app and the Express server.

export const CATEGORIES = [
  'Markets',
  'Earnings',
  'Economy',
  'Banking',
  'Technology',
  'Energy',
  'Crypto',
  'Deals',
];

export const IMPACTS = ['HIGH', 'MEDIUM', 'LOW'];
export const IMPACT_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3 };

export const SENTIMENTS = ['bullish', 'neutral', 'bearish'];
export const DIRECTIONS = ['up', 'down', 'flat'];
export const HORIZONS = ['Intraday', 'Short-term', 'Medium-term', 'Long-term'];

export const PROVIDER_LABELS = { anthropic: 'Claude', openai: 'GPT' };

export const ENGINE_LABELS = {
  claude: 'Claude API',
  openai: 'OpenAI API',
  heuristic: 'Demo engine (rule-based)',
  sample: 'Sample analysis',
};
