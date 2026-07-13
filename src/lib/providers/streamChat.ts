import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';
import { buildSystemPrompt } from './systemPrompt';
import type { Mode } from '../../state/appState.types';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamOptions {
  enableSearch?: boolean;
  retentionContext?: string;
}

export type ChatChunk =
  | { type: 'token'; text: string }
  | { type: 'searchStatus'; phase: 'searching' | 'done' | 'error'; resultCount?: number; errorCode?: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export async function* streamAnthropic(
  apiKey: string,
  model: string,
  messages: ChatTurn[],
  mode: Mode,
  options?: StreamOptions,
): AsyncGenerator<ChatChunk> {
  try {
    const client = new Anthropic({ apiKey });
    const stream = client.messages.stream({
      model,
      max_tokens: 2048,
      system: buildSystemPrompt(mode, { retentionContext: options?.retentionContext }),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      ...(options?.enableSearch
        ? { tools: [{ type: 'web_search_20250305' as const, name: 'web_search' as const, max_uses: 3 }] }
        : {}),
    });
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield { type: 'token', text: event.delta.text };
      } else if (event.type === 'content_block_start') {
        const block = event.content_block;
        if (block.type === 'server_tool_use' && block.name === 'web_search') {
          yield { type: 'searchStatus', phase: 'searching' };
        } else if (block.type === 'web_search_tool_result') {
          if (Array.isArray(block.content)) {
            yield { type: 'searchStatus', phase: 'done', resultCount: block.content.length };
          } else {
            yield { type: 'searchStatus', phase: 'error', errorCode: block.content.error_code };
          }
        }
        // Other server-tool block types carry structured (non-display) data — skip silently.
      }
    }
    yield { type: 'done' };
  } catch (err) {
    yield { type: 'error', message: err instanceof Error ? err.message : 'Anthropic request failed' };
  }
}

export async function* streamOpenAICompatible(
  apiKey: string,
  baseURL: string | undefined,
  model: string,
  messages: ChatTurn[],
  mode: Mode,
  extraBody?: Record<string, unknown>,
  retentionContext?: string,
): AsyncGenerator<ChatChunk> {
  try {
    const client = new OpenAI({ apiKey, baseURL });
    const stream = await client.chat.completions.create({
      model,
      stream: true,
      messages: [{ role: 'system', content: buildSystemPrompt(mode, { retentionContext }) }, ...messages],
      ...extraBody,
    } as OpenAI.Chat.ChatCompletionCreateParamsStreaming);
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield { type: 'token', text: delta };
    }
    yield { type: 'done' };
  } catch (err) {
    yield { type: 'error', message: err instanceof Error ? err.message : 'Request failed' };
  }
}

export async function* streamGemini(
  apiKey: string,
  model: string,
  messages: ChatTurn[],
  mode: Mode,
  options?: StreamOptions,
): AsyncGenerator<ChatChunk> {
  if (options?.enableSearch) {
    yield* streamGeminiWithSearch(apiKey, model, messages, mode, options?.retentionContext);
    return;
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const generativeModel = genAI.getGenerativeModel({
      model,
      systemInstruction: buildSystemPrompt(mode, { retentionContext: options?.retentionContext }),
    });
    const result = await generativeModel.generateContentStream({
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    });
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield { type: 'token', text };
    }
    yield { type: 'done' };
  } catch (err) {
    yield { type: 'error', message: err instanceof Error ? err.message : 'Gemini request failed' };
  }
}

// Search-grounded Gemini path — uses @google/genai (the modern SDK) since
// the legacy @google/generative-ai package only exposes the deprecated
// googleSearchRetrieval tool, not the google_search tool current Gemini
// models require. Non-search Gemini calls stay on the package above.
async function* streamGeminiWithSearch(
  apiKey: string,
  model: string,
  messages: ChatTurn[],
  mode: Mode,
  retentionContext?: string,
): AsyncGenerator<ChatChunk> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    let announcedSearching = false;
    let announcedDone = false;

    const stream = await ai.models.generateContentStream({
      model,
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: buildSystemPrompt(mode, { retentionContext }),
        tools: [{ googleSearch: {} }],
      },
    });

    if (!announcedSearching) {
      yield { type: 'searchStatus', phase: 'searching' };
      announcedSearching = true;
    }

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) yield { type: 'token', text };

      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (!announcedDone && groundingChunks) {
        yield { type: 'searchStatus', phase: 'done', resultCount: groundingChunks.length };
        announcedDone = true;
      }
    }

    if (!announcedDone) {
      // Stream finished without ever reporting grounding metadata — surface
      // as an error status so the client can show the degradation notice
      // rather than silently presenting an ungrounded answer as current.
      yield { type: 'searchStatus', phase: 'error', errorCode: 'no_grounding_metadata' };
    }

    yield { type: 'done' };
  } catch (err) {
    yield { type: 'error', message: err instanceof Error ? err.message : 'Gemini search request failed' };
  }
}
