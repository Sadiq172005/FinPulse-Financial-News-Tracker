// FinPulse API: a thin proxy between the browser and an AI provider
// (Claude or OpenAI GPT). The API key stays on the server and every response
// is validated before it reaches the client.

import 'dotenv/config';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import express from 'express';

import { normalizeAnalysis } from '../src/lib/normalize.js';
import { createAnthropicProvider, providerFromEnv } from './providers.js';

const RATE_LIMIT = { windowMs: 60_000, max: 20 };
const ENGINE_BY_PROVIDER = { anthropic: 'claude', openai: 'openai' };

function rateLimiter({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const recent = (hits.get(req.ip) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= max) {
      return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
    }
    recent.push(now);
    hits.set(req.ip, recent);
    return next();
  };
}

function validateArticle(payload) {
  const headline = typeof payload?.headline === 'string' ? payload.headline.trim() : '';
  const body = typeof payload?.body === 'string' ? payload.body.trim() : '';
  const category = typeof payload?.category === 'string' ? payload.category.trim() : '';
  if (headline.length < 8) return { error: 'Headline must be at least 8 characters long.' };
  if (headline.length > 300) return { error: 'Headline must be 300 characters or fewer.' };
  if (body.length > 8000) return { error: 'Article text must be 8,000 characters or fewer.' };
  return { article: { headline, body, category } };
}

/**
 * Builds the Express app. Pass `provider` (from providers.js) for any AI
 * backend, or `client` + `model` as a shortcut for an Anthropic client.
 * Tests inject fakes through either option.
 */
export function createApp({ provider = null, client = null, model, allowedOrigins = [] } = {}) {
  const ai = provider ?? (client ? createAnthropicProvider({ client, model }) : null);

  const app = express();
  app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      ai: Boolean(ai),
      provider: ai?.provider ?? null,
      model: ai?.model ?? null,
      claude: ai?.provider === 'anthropic',
    });
  });

  app.post('/api/analyze', rateLimiter(RATE_LIMIT), async (req, res) => {
    const { article, error } = validateArticle(req.body);
    if (error) return res.status(400).json({ error });
    if (!ai) {
      return res.status(503).json({ error: 'No AI key is set on the server. Add ANTHROPIC_API_KEY or OPENAI_API_KEY to .env.' });
    }

    try {
      const { raw, usage } = await ai.analyze(article);
      return res.json({
        analysis: normalizeAnalysis(raw, ENGINE_BY_PROVIDER[ai.provider]),
        provider: ai.provider,
        model: ai.model,
        usage,
      });
    } catch (err) {
      console.error('[analyze]', err.message);
      const status = Number.isInteger(err.status) && err.status >= 400 ? err.status : 502;
      return res.status(status).json({ error: err.message || 'AI request failed.' });
    }
  });

  // Serve the production build when it exists, so one process can host both
  // the API and the dashboard (npm start).
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
  if (existsSync(dist)) {
    app.use(express.static(dist));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
      return res.sendFile(path.join(dist, 'index.html'));
    });
  }

  app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown API route.' }));

  return app;
}

const isEntryPoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) {
  const port = Number(process.env.PORT) || 8787;
  const provider = await providerFromEnv();
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  createApp({ provider, allowedOrigins }).listen(port, () => {
    console.log(`FinPulse API listening on http://localhost:${port}`);
    console.log(
      provider
        ? `AI analysis is on (provider: ${provider.provider}, model: ${provider.model}).`
        : 'No ANTHROPIC_API_KEY or OPENAI_API_KEY is set. The dashboard will use its built-in demo engine.',
    );
  });
}
