import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { createApp } from '../server/index.js';

// A stand-in for the Anthropic client that returns one forced tool call.
const fakeClient = {
  calls: [],
  messages: {
    async create(params) {
      fakeClient.calls.push(params);
      return {
        content: [
          {
            type: 'tool_use',
            name: 'record_analysis',
            input: {
              summary: 'Test summary of the article.',
              category: 'Earnings',
              sentiment: 'bullish',
              sentimentScore: 150,
              impact: 'HIGH',
              impactScore: 88,
              stockImpact: [{ ticker: 'nova', direction: 'up', expectedMove: '+3%', rationale: 'Beat.' }],
              keyNumbers: [{ label: 'Revenue', value: '$8.4B' }],
              watchOut: 'Customer concentration.',
              horizon: 'Short-term',
              confidence: 80,
            },
          },
        ],
        usage: { input_tokens: 10, output_tokens: 20 },
      };
    },
  },
};

let server;
let base;
let offlineServer;
let offlineBase;

const listen = (app) =>
  new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

before(async () => {
  server = await listen(createApp({ client: fakeClient, model: 'test-model' }));
  base = `http://127.0.0.1:${server.address().port}`;
  offlineServer = await listen(createApp());
  offlineBase = `http://127.0.0.1:${offlineServer.address().port}`;
});

after(() => {
  server.close();
  offlineServer.close();
});

const post = (url, body) =>
  fetch(`${url}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

test('health reports whether Claude analysis is available', async () => {
  assert.deepEqual(await (await fetch(`${base}/api/health`)).json(), { ok: true, ai: true, provider: 'anthropic', model: 'test-model', claude: true });
  assert.deepEqual(await (await fetch(`${offlineBase}/api/health`)).json(), { ok: true, ai: false, provider: null, model: null, claude: false });
});

test('analyze forces the tool call and returns a normalised analysis', async () => {
  const response = await post(base, { headline: 'Novara beats estimates on AI demand', body: 'Revenue was $8.4B.' });
  assert.equal(response.status, 200);
  const { analysis, model } = await response.json();
  assert.equal(model, 'test-model');
  assert.equal(analysis.engine, 'claude');
  assert.equal(analysis.sentimentScore, 100);
  assert.equal(analysis.stockImpact[0].ticker, 'NOVA');

  const sent = fakeClient.calls.at(-1);
  assert.deepEqual(sent.tool_choice, { type: 'tool', name: 'record_analysis' });
  assert.match(sent.messages[0].content, /Novara beats estimates/);
});

test('analyze rejects bad input and reports a missing key', async () => {
  assert.equal((await post(base, { headline: 'short' })).status, 400);
  assert.equal((await post(base, { headline: 'A valid headline here', body: 'x'.repeat(9000) })).status, 400);
  const offline = await post(offlineBase, { headline: 'A valid headline here' });
  assert.equal(offline.status, 503);
  assert.match((await offline.json()).error, /OPENAI_API_KEY/);
});

test('OpenAI provider forces the function call and parses its arguments', async () => {
  const { createOpenAIProvider, providerFromEnv } = await import('../server/providers.js');
  const sent = [];
  const fakeFetch = async (url, options) => {
    sent.push({ url, body: JSON.parse(options.body), auth: options.headers.Authorization });
    return {
      ok: true,
      json: async () => ({
        output: [
          { type: 'reasoning', summary: [] },
          {
            type: 'function_call',
            name: 'record_analysis',
            arguments: JSON.stringify({
              summary: 'GPT summary.', category: 'Deals', sentiment: 'bearish', sentimentScore: -40,
              impact: 'MEDIUM', impactScore: 55,
              stockImpact: [{ ticker: 'HELX', direction: 'down', expectedMove: '-2%', rationale: 'Premium.' }],
              keyNumbers: [{ label: 'Deal', value: '$3.2B' }], watchOut: 'Trial risk.',
              horizon: 'Medium-term', confidence: 70,
            }),
          },
        ],
        usage: { input_tokens: 5, output_tokens: 9 },
      }),
    };
  };

  const provider = createOpenAIProvider({ apiKey: 'sk-test', model: 'gpt-test', fetchImpl: fakeFetch });
  const app = createApp({ provider });
  const instance = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
  const url = `http://127.0.0.1:${instance.address().port}`;
  try {
    const health = await (await fetch(`${url}/api/health`)).json();
    assert.deepEqual(health, { ok: true, ai: true, provider: 'openai', model: 'gpt-test', claude: false });

    const response = await post(url, { headline: 'Helix to acquire oncology unit for $3.2 billion' });
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.provider, 'openai');
    assert.equal(data.analysis.engine, 'openai');
    assert.equal(data.analysis.stockImpact[0].ticker, 'HELX');

    assert.match(sent[0].url, /\/responses$/);
    assert.equal(sent[0].auth, 'Bearer sk-test');
    assert.deepEqual(sent[0].body.tool_choice, { type: 'function', name: 'record_analysis' });
  } finally {
    instance.close();
  }

  assert.equal((await providerFromEnv({ OPENAI_API_KEY: 'sk-x' })).provider, 'openai');
  assert.equal(await providerFromEnv({}), null);
});

test('OpenAI errors are passed through with their status', async () => {
  const { createOpenAIProvider } = await import('../server/providers.js');
  const provider = createOpenAIProvider({
    apiKey: 'bad',
    fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({ error: { message: 'Incorrect API key provided.' } }) }),
  });
  const app = createApp({ provider });
  const instance = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
  try {
    const response = await post(`http://127.0.0.1:${instance.address().port}`, { headline: 'A valid headline here' });
    assert.equal(response.status, 401);
    assert.match((await response.json()).error, /Incorrect API key/);
  } finally {
    instance.close();
  }
});
