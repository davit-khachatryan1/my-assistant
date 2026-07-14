import { resolveModel } from '../../../lib/providers/modelRouter';
import { streamAnthropic, streamOpenAICompatible, streamGemini, type ChatTurn } from '../../../lib/providers/streamChat';
import { DOCUMENT_MARKER_PREFIX, DOCUMENT_MARKER_REGEX } from '../../../lib/providers/systemPrompt';
import { conversationStore } from '../../../lib/conversation/store';
import type { StoredChatMessage } from '../../../lib/conversation/ConversationStore';
import { getCachedDigest, setCachedDigest } from '../../../lib/search/digestCache';
import { auth } from '../../../lib/auth/auth';
import type { LanguageCode, Mode } from '../../../state/appState.types';

export const runtime = 'nodejs';

interface ChatRequestBody {
  conversationId: string;
  text: string;
  mode: Mode;
  model: string;
  inputLanguage?: LanguageCode;
  responseLanguage?: LanguageCode;
}

function explicitlyRequestedDocument(text: string): boolean {
  const lower = text.toLowerCase();
  return /(\bpdf\b|\bdocx?\b|\bfile\b|\bdocument\b|\bexport\b|\bdownload\b|փաստաթուղթ|ֆայլ|պդֆ|pdf|արտահանիր|ներբեռնել|скачай|файл|документ|пдф|экспорт)/i.test(
    lower,
  );
}

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  hy: 'Armenian',
  en: 'English',
  ru: 'Russian',
};

const DOCUMENT_REJECTED_NOTICE: Record<LanguageCode, string> = {
  hy: '\n\nԵս փաստաթուղթ չեմ ստեղծի, քանի որ ֆայլ կամ PDF չես խնդրել։ Եթե պետք է, գրիր՝ «պատրաստիր PDF» կամ «ստեղծիր փաստաթուղթ»։',
  en: "\n\nI won't generate a document since you didn't ask for a file or PDF. If you need one, say \"make a PDF\" or \"generate a document\".",
  ru: '\n\nЯ не буду создавать документ, так как вы не просили файл или PDF. Если нужно, напишите «сделай PDF» или «создай документ».',
};

function buildLanguageTurn(inputLanguage?: LanguageCode, responseLanguage?: LanguageCode): ChatTurn {
  const input = LANGUAGE_NAMES[inputLanguage ?? 'hy'];
  const response = LANGUAGE_NAMES[responseLanguage ?? 'hy'];

  return {
    role: 'user',
    content:
      `Language settings for this conversation:\n` +
      `- The user will speak/write primarily in ${input}.\n` +
      `- You must answer in ${response}, unless the user explicitly asks to translate or answer in another language.\n` +
      `Apply this to every reply, including document text.`,
  };
}

// Retention mode needs prior Tutor/Digest content to write grounded quiz
// questions against — see modePrompts.ts's retention prompt.
function buildRetentionContext(history: StoredChatMessage[]): string {
  const relevant = history.filter((m) => m.mode === 'tutor' || m.mode === 'digest').slice(-12);
  if (relevant.length === 0) {
    return 'Prior topics: none yet (this is a new conversation, or Tutor/Digest mode has not been used yet).';
  }
  const lines = relevant.map((m) => `${m.role === 'user' ? 'User' : 'Luka'}: ${m.content}`);
  return `Prior topics discussed (from Tutor/Digest mode turns):\n${lines.join('\n')}`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequestBody;
  const resolved = resolveModel(body.model);

  if (!resolved || !process.env[resolved.envVar]) {
    return Response.json(
      { error: 'provider_not_configured', provider: resolved?.provider ?? null, envVar: resolved?.envVar ?? null },
      { status: 503 },
    );
  }

  if (body.mode === 'digest' && !resolved.supportsSearch) {
    return Response.json(
      { error: 'search_unsupported_model', provider: resolved.provider, envVar: null },
      { status: 503 },
    );
  }

  const apiKey = process.env[resolved.envVar] as string;

  // Phase A: identity is read but not yet used for gating — a signed-in
  // user's history is durably persisted to Postgres, an anonymous
  // request's behavior is byte-for-byte unchanged from before auth existed.
  const session = await auth();
  const userId = session?.user?.id;

  const history = await conversationStore.getHistory(body.conversationId, userId);
  const historyTurns: ChatTurn[] = history.map((m) => ({ role: m.role, content: m.content }));
  const turns: ChatTurn[] = [
    buildLanguageTurn(body.inputLanguage, body.responseLanguage),
    ...historyTurns,
    { role: 'user', content: body.text },
  ];
  const allowDocument = explicitlyRequestedDocument(body.text);
  const retentionContext = body.mode === 'retention' ? buildRetentionContext(history) : undefined;

  const deepseekExtraBody = resolved.deepseekThinking
    ? { thinking: { type: resolved.deepseekThinking } }
    : undefined;

  const cachedDigest = body.mode === 'digest' ? getCachedDigest(body.text) : null;

  const enableSearch = body.mode === 'digest';
  const providerStream = cachedDigest
    ? null
    : resolved.provider === 'anthropic'
      ? streamAnthropic(apiKey, resolved.apiModel, turns, body.mode, { enableSearch, retentionContext })
      : resolved.provider === 'google'
        ? streamGemini(apiKey, resolved.apiModel, turns, body.mode, { enableSearch, retentionContext })
        : streamOpenAICompatible(
            apiKey,
            resolved.baseURL,
            resolved.apiModel,
            turns,
            body.mode,
            deepseekExtraBody,
            retentionContext,
          );

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let pendingLine = '';
      let documentMode = false;
      let documentBuffer = '';
      let assistantText = '';

      const write = (event: 'token' | 'searchStatus' | 'documentSuggestion' | 'done' | 'error', data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const flushLine = (line: string) => {
        if (documentMode) {
          documentBuffer += line + '\n';
          return;
        }
        if (line.startsWith(DOCUMENT_MARKER_PREFIX)) {
          if (!allowDocument) {
            const notice = DOCUMENT_REJECTED_NOTICE[body.responseLanguage ?? 'hy'];
            write('token', { text: notice });
            assistantText += notice;
            documentMode = true;
            documentBuffer = line + '\n';
            return;
          }
          documentMode = true;
          documentBuffer = line + '\n';
          return;
        }
        write('token', { text: line + '\n' });
        assistantText += line + '\n';
      };

      try {
        if (cachedDigest) {
          write('token', { text: cachedDigest });
          assistantText = cachedDigest;
        } else if (providerStream) {
          for await (const chunk of providerStream) {
            if (chunk.type === 'error') {
              write('error', { message: chunk.message });
              controller.close();
              return;
            }
            if (chunk.type === 'searchStatus') {
              write('searchStatus', {
                phase: chunk.phase,
                resultCount: chunk.resultCount,
                errorCode: chunk.errorCode,
              });
              continue;
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
        }

        // stream finished — handle whatever remains
        if (documentMode && allowDocument) {
          documentBuffer += pendingLine;
          const match = documentBuffer.match(DOCUMENT_MARKER_REGEX);
          if (match) {
            const [, filename, title, content] = match;
            write('documentSuggestion', { filename, title, content: content.trim() });
            assistantText += `[a document was offered: ${title}]`;
          } else {
            // malformed marker — fail open, show as ordinary text
            write('token', { text: documentBuffer });
            assistantText += documentBuffer;
          }
        } else if (!allowDocument && documentMode) {
          // The model tried to create a document without explicit permission.
          // We already emitted the plain chat notice above, so drop the marker body.
        } else if (pendingLine.length > 0) {
          write('token', { text: pendingLine });
          assistantText += pendingLine;
        }

        if (body.mode === 'digest' && !cachedDigest && assistantText) {
          setCachedDigest(body.text, assistantText);
        }

        await conversationStore.appendMessage(
          body.conversationId,
          {
            role: 'user',
            content: body.text,
            createdAt: new Date().toISOString(),
            mode: body.mode,
          },
          userId,
        );
        await conversationStore.appendMessage(
          body.conversationId,
          {
            role: 'assistant',
            content: assistantText,
            createdAt: new Date().toISOString(),
            mode: body.mode,
          },
          userId,
        );

        write('done', {});
      } catch (err) {
        write('error', { message: err instanceof Error ? err.message : 'Stream failed' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
