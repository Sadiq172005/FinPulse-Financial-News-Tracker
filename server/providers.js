// AI providers. Each one returns { provider, model, analyze(article) } and
// analyze() resolves to the raw analysis object (normalised by the caller).
// Both providers force a single function/tool call, so the model must answer
// with JSON that matches ANALYSIS_TOOL.input_schema.

import { ANALYSIS_TOOL, SYSTEM_PROMPT, buildUserPrompt } from './prompt.js';

export const DEFAULT_MODELS = {
  anthropic: 'claude-sonnet-5-5',
  openai: 'gpt-5.4-mini',
};

/** Claude via the Anthropic Messages API (tool use with forced tool_choice). */
export function createAnthropicProvider({ client, model = DEFAULT_MODELS.anthropic }) {
  return {
    provider: 'anthropic',
    model,
    async analyze(article) {
      const message = await client.messages.create({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: [ANALYSIS_TOOL],
        tool_choice: { type: 'tool', name: ANALYSIS_TOOL.name },
        messages: [{ role: 'user', content: buildUserPrompt(article) }],
      });
      const toolCall = message.content.find((block) => block.type === 'tool_use');
      if (!toolCall) throw new Error('The model returned no structured analysis.');
      return { raw: toolCall.input, usage: message.usage ?? null };
    },
  };
}

/** GPT via the OpenAI Responses API (function calling with forced tool_choice). */
export function createOpenAIProvider({
  apiKey,
  model = DEFAULT_MODELS.openai,
  baseUrl = 'https://api.openai.com/v1',
  fetchImpl = fetch,
}) {
  return {
    provider: 'openai',
    model,
    async analyze(article) {
      const response = await fetchImpl(`${baseUrl}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          instructions: SYSTEM_PROMPT,
          input: buildUserPrompt(article),
          tools: [
            {
              type: 'function',
              name: ANALYSIS_TOOL.name,
              description: ANALYSIS_TOOL.description,
              parameters: ANALYSIS_TOOL.input_schema,
            },
          ],
          tool_choice: { type: 'function', name: ANALYSIS_TOOL.name },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data?.error?.message || `OpenAI API returned ${response.status}`);
        error.status = response.status;
        throw error;
      }

      const call = (data.output ?? []).find((item) => item.type === 'function_call');
      if (!call) throw new Error('The model returned no structured analysis.');
      try {
        return { raw: JSON.parse(call.arguments), usage: data.usage ?? null };
      } catch {
        throw new Error('The model returned malformed JSON.');
      }
    },
  };
}

/**
 * Picks a provider from environment variables. AI_PROVIDER forces one;
 * otherwise Claude is used when ANTHROPIC_API_KEY is set, then OpenAI.
 */
export async function providerFromEnv(env = process.env) {
  const wanted = (env.AI_PROVIDER || '').toLowerCase();
  const useAnthropic = wanted === 'anthropic' || (!wanted && env.ANTHROPIC_API_KEY);
  const useOpenAI = wanted === 'openai' || (!wanted && !env.ANTHROPIC_API_KEY && env.OPENAI_API_KEY);

  if (useAnthropic && env.ANTHROPIC_API_KEY) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    return createAnthropicProvider({
      client: new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }),
      model: env.ANTHROPIC_MODEL || DEFAULT_MODELS.anthropic,
    });
  }
  if (useOpenAI && env.OPENAI_API_KEY) {
    return createOpenAIProvider({
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL || DEFAULT_MODELS.openai,
    });
  }
  return null;
}
