import type { UILanguage } from '../lib/i18n/uiStrings';

export type MessageRole = 'assistant' | 'user';

export interface BaseMessage {
  id: string;
  role: MessageRole;
  timestamp: string;
}

export interface TextMessage extends BaseMessage {
  kind: 'text';
  content: string;
  streaming?: boolean;
}

export interface DocumentMessage extends BaseMessage {
  kind: 'document';
  documentId: string;
  filename: string;
  fileType: string;
  title: string;
  url: string;
  sizeBytes: number;
}

export interface DocumentSuggestionMessage extends BaseMessage {
  kind: 'document-suggestion';
  filename: string;
  title: string;
  content: string;
  status: 'idle' | 'generating' | 'error';
  errorMessage?: string;
}

export type Message = TextMessage | DocumentMessage | DocumentSuggestionMessage;

export type LanguageCode = 'hy' | 'en' | 'ru';

// The UI chrome's own display language (buttons, headers, error/notice
// copy) — independent of inputLanguage/responseLanguage, which govern the
// conversation content only. Armenian stays the default; English is the
// only other UI-chrome translation maintained today. Defined in
// lib/i18n/uiStrings.ts (the dictionary's home); re-exported here so
// Settings can reference it without a cross-layer import direction.
export type { UILanguage };

// Each mode gets a distinct system prompt (src/lib/providers/modePrompts.ts)
// and, for Digest, a real search-tool-backed capability restricted to
// search-capable models (src/lib/providers/modelRouter.ts's supportsSearch).
export type Mode = 'tutor' | 'digest' | 'interview' | 'retention';

export interface Settings {
  model: string;
  voice: string;
  voiceReplies: boolean;
  inputLanguage: LanguageCode;
  responseLanguage: LanguageCode;
  uiLanguage: UILanguage;
  mode: Mode;
}
