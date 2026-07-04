import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Message, Settings, DocumentMessage } from './appState.types';
import type { OrbState, ThinkingLabel } from '../components/Orb/orb.types';
import { playAudioStream } from '../lib/audio/playAudioResponse';

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
  updateDocumentMeta: (id: string, fileSizeLabel: string) => void;
  orbState: OrbState;
  setOrbState: (state: OrbState) => void;
  thinkingLabel: ThinkingLabel;
  setThinkingLabel: (label: ThinkingLabel) => void;
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  sendUserMessage: (userText?: string) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

type StreamChunk =
  | { type: 'token'; text: string }
  | { type: 'document'; filename: string; title: string; content: string }
  | { type: 'error'; message: string }
  | { type: 'done' };

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [thinkingLabel, setThinkingLabel] = useState<ThinkingLabel>('thinking');
  const [settings, setSettings] = useState<Settings>({
    model: 'gpt-5-mini-free',
    voice: 'hy-female',
    languageMode: 'hy-first',
  });

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

  const updateDocumentMeta = (id: string, fileSizeLabel: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id && m.kind === 'document' ? { ...m, fileSizeLabel } : m)));
  };

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const speakReply = async (text: string) => {
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: settings.voice }),
      });
      if (!res.ok) throw new Error('tts unavailable');
      await playAudioStream(res);
      setOrbState('idle');
    } catch {
      // Speech synthesis genuinely failed (no key, invalid voice, network,
      // or playback error) — say so instead of silently faking a "speaking"
      // animation with no audio.
      appendMessage(
        createTextMessage('assistant', 'Ձայնային պատասխանը հնարավոր չեղավ հնչեցնել։'),
      );
      setOrbState('idle');
    }
  };

  const sendUserMessage = async (userText?: string) => {
    const trimmed = userText?.trim();
    let nextMessages = messages;

    if (trimmed) {
      const userMessage = createTextMessage('user', trimmed);
      nextMessages = [...messages, userMessage];
      appendMessage(userMessage);
    }

    setThinkingLabel('thinking');
    setOrbState('thinking');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, model: settings.model }),
      });

      if (res.status === 503) {
        const body = await res.json().catch(() => ({} as { envVar?: string }));
        appendMessage(
          createTextMessage(
            'assistant',
            `Ընտրված մոդելը կարգավորված չէ (բացակայում է ${body.envVar ?? 'API key'})։ Ընտրիր այլ մոդել կամ ավելացրու բանալին .env.local ֆայլում։`,
          ),
        );
        setOrbState('idle');
        return;
      }

      if (!res.ok || !res.body) {
        throw new Error('chat request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMessageId: string | null = null;
      let fullText = '';
      let pendingDocument: { filename: string; title: string; content: string } | null = null;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (!line.trim()) continue;

          let chunk: StreamChunk;
          try {
            chunk = JSON.parse(line) as StreamChunk;
          } catch {
            continue;
          }

          if (chunk.type === 'token') {
            if (!assistantMessageId) {
              const assistantMessage = createTextMessage('assistant', '', true);
              assistantMessageId = assistantMessage.id;
              appendMessage(assistantMessage);
              setOrbState('speaking');
            }
            fullText += chunk.text;
            updateMessageContent(assistantMessageId, (prev) => prev + chunk.text);
          } else if (chunk.type === 'document') {
            pendingDocument = { filename: chunk.filename, title: chunk.title, content: chunk.content };
          } else if (chunk.type === 'error') {
            if (!assistantMessageId) {
              const assistantMessage = createTextMessage(
                'assistant',
                'Ներողություն, տեղի ունեցավ սխալ։ Փորձիր նորից։',
              );
              assistantMessageId = assistantMessage.id;
              appendMessage(assistantMessage);
            }
          }
        }
      }

      if (assistantMessageId) {
        markMessageDone(assistantMessageId);
      }

      if (pendingDocument) {
        const doc: DocumentMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          kind: 'document',
          filename: pendingDocument.filename,
          fileType: pendingDocument.filename.split('.').pop()?.toUpperCase() ?? 'PDF',
          title: pendingDocument.title,
          content: pendingDocument.content,
          timestamp: new Date().toISOString(),
        };
        appendMessage(doc);
      }

      if (fullText.trim().length > 0) {
        await speakReply(fullText.trim());
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
      updateDocumentMeta,
      orbState,
      setOrbState,
      thinkingLabel,
      setThinkingLabel,
      settings,
      updateSettings,
      sendUserMessage,
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
