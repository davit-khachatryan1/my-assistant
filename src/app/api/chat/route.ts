import { resolveModel } from '../../../lib/providers/modelRouter';
import { streamAnthropic, streamOpenAICompatible, streamGemini, type ChatTurn } from '../../../lib/providers/streamChat';
import { DOCUMENT_MARKER_PREFIX, DOCUMENT_MARKER_REGEX } from '../../../lib/providers/systemPrompt';
import type { Message } from '../../../state/appState.types';

export const runtime = 'nodejs';

function toChatTurns(messages: Message[]): ChatTurn[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.kind === 'text' ? m.content : `[a document was generated: ${m.filename}]`,
  }));
}

export async function POST(request: Request) {
  const body = (await request.json()) as { messages: Message[]; model: string };
  const resolved = resolveModel(body.model);

  if (!resolved || !process.env[resolved.envVar]) {
    return Response.json(
      { error: 'provider_not_configured', provider: resolved?.provider ?? null, envVar: resolved?.envVar ?? null },
      { status: 503 },
    );
  }

  const apiKey = process.env[resolved.envVar] as string;
  const turns = toChatTurns(body.messages);

  const deepseekExtraBody = resolved.deepseekThinking
    ? { thinking: { type: resolved.deepseekThinking } }
    : undefined;

  const providerStream =
    resolved.provider === 'anthropic'
      ? streamAnthropic(apiKey, resolved.apiModel, turns)
      : resolved.provider === 'google'
        ? streamGemini(apiKey, resolved.apiModel, turns)
        : streamOpenAICompatible(apiKey, resolved.baseURL, resolved.apiModel, turns, deepseekExtraBody);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let pendingLine = '';
      let documentMode = false;
      let documentBuffer = '';

      const write = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));

      const flushLine = (line: string) => {
        if (documentMode) {
          documentBuffer += line + '\n';
          return;
        }
        if (line.startsWith(DOCUMENT_MARKER_PREFIX)) {
          documentMode = true;
          documentBuffer = line + '\n';
          return;
        }
        write({ type: 'token', text: line + '\n' });
      };

      try {
        for await (const chunk of providerStream) {
          if (chunk.type === 'error') {
            write({ type: 'error', message: chunk.message });
            controller.close();
            return;
          }
          if (chunk.type === 'token') {
            pendingLine += chunk.text;
            let newlineIndex: number;
            while ((newlineIndex = pendingLine.indexOf('\n')) !== -1) {
              const line = pendingLine.slice(0, newlineIndex);
              flushLine(line);
              pendingLine = pendingLine.slice(newlineIndex + 1);
            }
          }
        }

        // stream finished — handle whatever remains
        if (documentMode) {
          documentBuffer += pendingLine;
          const match = documentBuffer.match(DOCUMENT_MARKER_REGEX);
          if (match) {
            const [, filename, title, content] = match;
            write({ type: 'document', filename, title, content: content.trim() });
          } else {
            // malformed marker — fail open, show as ordinary text
            write({ type: 'token', text: documentBuffer });
          }
        } else if (pendingLine.length > 0) {
          if (pendingLine.startsWith(DOCUMENT_MARKER_PREFIX)) {
            // marker was the very last (unterminated) line with no body — fail open
            write({ type: 'token', text: pendingLine });
          } else {
            write({ type: 'token', text: pendingLine });
          }
        }

        write({ type: 'done' });
      } catch (err) {
        write({ type: 'error', message: err instanceof Error ? err.message : 'Stream failed' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson' } });
}
