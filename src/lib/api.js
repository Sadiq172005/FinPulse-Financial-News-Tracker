import { analyzeHeuristic } from './heuristic.js';
import { normalizeAnalysis } from './normalize.js';

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

/** Asks the back end which AI provider is available, if any. Never throws. */
export async function fetchEngineStatus() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const response = await fetch(`${API_BASE}/api/health`, { signal: controller.signal });
    if (!response.ok) throw new Error('API not reachable');
    const data = await response.json();
    const live = data.ai ?? data.claude;
    return live
      ? { status: 'live', provider: data.provider ?? 'anthropic', model: data.model }
      : { status: 'demo', reason: 'The API is running but no AI key (ANTHROPIC_API_KEY or OPENAI_API_KEY) is set.' };
  } catch {
    return { status: 'demo', reason: 'No API server found, so analysis runs in the browser.' };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Analyse an article. Uses the AI provider when the back end is live and falls
 * back to the in-browser demo engine otherwise, or if the request fails.
 */
export async function analyzeArticle(input, engine) {
  if (engine.status === 'live') {
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline: input.headline, body: input.body, category: input.category }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Server returned ${response.status}`);
      return { analysis: normalizeAnalysis(data.analysis, data.analysis?.engine ?? 'claude'), note: null };
    } catch (error) {
      return {
        analysis: analyzeHeuristic(input),
        note: `The AI request failed (${error.message}). This result comes from the demo engine.`,
      };
    }
  }
  return { analysis: analyzeHeuristic(input), note: null };
}
