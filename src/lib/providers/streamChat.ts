import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT } from './systemPrompt';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatChunk =
  | { type: 'token'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export async function* streamAnthropic(
  apiKey: string,
  model: string,
  messages: ChatTurn[],
): AsyncGenerator<ChatChunk> {
  try {
    const client = new Anthropic({ apiKey });
    const stream = client.messages.stream({
      model,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield { type: 'token', text: event.delta.text };
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
  extraBody?: Record<string, unknown>,
): AsyncGenerator<ChatChunk> {
  try {
    const client = new OpenAI({ apiKey, baseURL });
    const stream = await client.chat.completions.create({
      model,
      stream: true,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
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
): AsyncGenerator<ChatChunk> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const generativeModel = genAI.getGenerativeModel({ model, systemInstruction: SYSTEM_PROMPT });
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
