import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Message, Settings, DocumentMessage, DocumentSuggestionMessage } from './appState.types';
import type { OrbState, ThinkingLabel } from '../components/Orb/orb.types';
import { getAudioAdapter } from '../lib/audio/getAudioAdapter';
import { parseSSEStream } from '../lib/sse/parseSSEStream';
import { resolveModel } from '../lib/providers/modelRouter';

const DIGEST_FALLBACK_MODEL = 'gemini-3-flash-free';

function createTextMessage(role: Message['role'], content: string, streaming = false): Message {
  return {
    id: crypto.randomUUID(),
    role,
    kind: 'text',
    content,
    streaming,
    timestamp: new Date().toISOString(),
  };
}

interface AppStateValue {
  messages: Message[];
  appendMessage: (message: Message) => void;
  updateMessageContent: (id: string, updater: (prev: string) => string) => void;
  orbState: OrbState;
  setOrbState: (state: OrbState) => void;
  thinkingLabel: ThinkingLabel;
  setThinkingLabel: (label: ThinkingLabel) => void;
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  sendUserMessage: (userText?: string, modeOverride?: Settings['mode']) => void;
  stopAssistantSpeech: () => void;
  setDocumentSuggestionStatus: (id: string, status: 'idle' | 'generating' | 'error', errorMessage?: string) => void;
  resolveDocumentSuggestion: (id: string, resolved: { documentId: string; url: string; sizeBytes: number }) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

type SpeechResult = 'ok' | 'failed' | 'stopped';

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [conversationId] = useState<string>(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [thinkingLabel, setThinkingLabel] = useState<ThinkingLabel>('thinking');
  const [settings, setSettings] = useState<Settings>({
    model: 'gemini-3-flash-free',
    voice: 'hy-female',
    voiceReplies: true,
    inputLanguage: 'hy',
    responseLanguage: 'hy',
    mode: 'tutor',
  });
  const speechAbortRef = useRef<AbortController | null>(null);

  const appendMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateMessageContent = (id: string, updater: (prev: string) => string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id && m.kind === 'text' ? { ...m, content: updater(m.content) } : m)),
    );
  };

  const markMessageDone = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id && m.kind === 'text' ? { ...m, streaming: false } : m)));
  };

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));

    // Digest mode requires a search-capable model. Never a silent switch —
    // auto-pick the app's free default and tell the user why, once.
    if (partial.mode === 'digest') {
      const effectiveModel = partial.model ?? settings.model;
      const resolved = resolveModel(effectiveModel);
      if (!resolved?.supportsSearch) {
        setSettings((prev) => ({ ...prev, model: DIGEST_FALLBACK_MODEL }));
        appendMessage(
          createTextMessage(
            'assistant',
            'Անցա Gemini 3 Flash մոդելին, քանի որ Նորություններ ռեժիմն աշխատում է միայն որոնման աջակցությամբ մոդելների հետ (Claude կամ Gemini)։',
          ),
        );
      }
    }
  };

  const setDocumentSuggestionStatus = (
    id: string,
    status: 'idle' | 'generating' | 'error',
    errorMessage?: string,
  ) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id && m.kind === 'document-suggestion' ? { ...m, status, errorMessage } : m)),
    );
  };

  const resolveDocumentSuggestion = (
    id: string,
    resolved: { documentId: string; url: string; sizeBytes: number },
  ) => {
    setMessages((prev) =>
      prev.map((m): Message => {
        if (m.id !== id || m.kind !== 'document-suggestion') return m;
        const documentMessage: DocumentMessage = {
          id: m.id,
          role: m.role,
          kind: 'document',
          documentId: resolved.documentId,
          filename: m.filename,
          fileType: m.filename.split('.').pop()?.toUpperCase() ?? 'PDF',
          title: m.title,
          url: resolved.url,
          sizeBytes: resolved.sizeBytes,
          timestamp: m.timestamp,
        };
        return documentMessage;
      }),
    );
  };

  const stopAssistantSpeech = () => {
    speechAbortRef.current?.abort();
    speechAbortRef.current = null;
    setOrbState('idle');
  };

  const speakReply = async (text: string): Promise<SpeechResult> => {
    stopAssistantSpeech();
    const controller = new AbortController();
    speechAbortRef.current = controller;

    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: settings.voice }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('tts unavailable');
      const audioBuffer = await res.arrayBuffer();
      const result = await getAudioAdapter().play(audioBuffer, controller.signal);
      return result;
    } catch {
      return controller.signal.aborted ? 'stopped' : 'failed';
    } finally {
      if (speechAbortRef.current === controller) {
        speechAbortRef.current = null;
      }
    }
  };

  const sendUserMessage = async (userText?: string, modeOverride?: Settings['mode']) => {
    const trimmed = userText?.trim();

    if (trimmed) {
      appendMessage(createTextMessage('user', trimmed));
    }

    setThinkingLabel('thinking');
    setOrbState('thinking');

    // Computed independently of `settings` — `updateSettings` may not have
    // committed its state update yet when a caller (e.g. a chip that both
    // updates mode and immediately sends) fires both in the same tick, so
    // this request must be self-consistent rather than trusting a
    // possibly-stale `settings.mode`/`settings.model` snapshot.
    const effectiveMode = modeOverride ?? settings.mode;
    const effectiveModel =
      effectiveMode === 'digest' && !resolveModel(settings.model)?.supportsSearch
        ? DIGEST_FALLBACK_MODEL
        : settings.model;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          text: trimmed ?? '',
          mode: effectiveMode,
          model: effectiveModel,
          inputLanguage: settings.inputLanguage,
          responseLanguage: settings.responseLanguage,
        }),
      });

      if (res.status === 503) {
        const body = await res.json().catch(() => ({} as { error?: string; envVar?: string }));
        const message =
          body.error === 'search_unsupported_model'
            ? 'Ընտրված մոդելը չի աջակցում որոնում։ Ընտրիր Claude կամ Gemini մոդել Նորություններ ռեժիմի համար։'
            : `Ընտրված մոդելը կարգավորված չէ (բացակայում է ${body.envVar ?? 'API key'})։ Ընտրիր այլ մոդել կամ ավելացրու բանալին .env.local ֆայլում։`;
        appendMessage(createTextMessage('assistant', message));
        setOrbState('idle');
        return;
      }

      if (!res.ok || !res.body) {
        throw new Error('chat request failed');
      }

      let assistantMessageId: string | null = null;
      let fullText = '';

      for await (const { event, data } of parseSSEStream(res.body)) {
        if (event === 'token') {
          const { text } = JSON.parse(data) as { text: string };
          if (!assistantMessageId) {
            const assistantMessage = createTextMessage('assistant', '', true);
            assistantMessageId = assistantMessage.id;
            appendMessage(assistantMessage);
            setOrbState(settings.voiceReplies ? 'speaking' : 'thinking');
          }
          fullText += text;
          updateMessageContent(assistantMessageId, (prev) => prev + text);
        } else if (event === 'searchStatus') {
          const status = JSON.parse(data) as { phase: 'searching' | 'done' | 'error'; errorCode?: string };
          if (status.phase === 'searching') {
            setThinkingLabel('searching');
          } else if (status.phase === 'error') {
            appendMessage(createTextMessage('assistant', 'Որոնումը անհասանելի էր այս պահին։'));
          }
        } else if (event === 'documentSuggestion') {
          const suggestion = JSON.parse(data) as { filename: string; title: string; content: string };
          const suggestionMessage: DocumentSuggestionMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            kind: 'document-suggestion',
            filename: suggestion.filename,
            title: suggestion.title,
            content: suggestion.content,
            status: 'idle',
            timestamp: new Date().toISOString(),
          };
          appendMessage(suggestionMessage);
        } else if (event === 'error') {
          if (!assistantMessageId) {
            const assistantMessage = createTextMessage(
              'assistant',
              'Ներողություն, տեղի ունեցավ սխալ։ Փորձիր նորից։',
            );
            assistantMessageId = assistantMessage.id;
            appendMessage(assistantMessage);
          }
        } else if (event === 'done') {
          break;
        }
      }

      if (assistantMessageId) {
        markMessageDone(assistantMessageId);
      }

      if (settings.voiceReplies && fullText.trim().length > 0) {
        setOrbState('speaking');
        const speechResult = await speakReply(fullText.trim());
        if (speechResult === 'failed') {
          appendMessage(createTextMessage('assistant', 'Ձայնային պատասխանը հնարավոր չեղավ հնչեցնել։'));
        }
        setOrbState('idle');
      } else {
        setOrbState('idle');
      }
    } catch {
      appendMessage(
        createTextMessage('assistant', 'Կապի խնդիր առաջացավ։ Ստուգիր ինտերնետային կապը և փորձիր նորից։'),
      );
      setOrbState('idle');
    }
  };

  const value = useMemo<AppStateValue>(
    () => ({
      messages,
      appendMessage,
      updateMessageContent,
      orbState,
      setOrbState,
      thinkingLabel,
      setThinkingLabel,
      settings,
      updateSettings,
      sendUserMessage,
      stopAssistantSpeech,
      setDocumentSuggestionStatus,
      resolveDocumentSuggestion,
    }),
    [messages, orbState, thinkingLabel, settings],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return ctx;
}
