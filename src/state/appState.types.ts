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
  filename: string;
  fileType: string;
  fileSizeLabel?: string;
  title: string;
  content: string;
}

export type Message = TextMessage | DocumentMessage;

export type LanguageMode = 'hy-first' | 'en-first';

export interface Settings {
  model: string;
  voice: string;
  languageMode: LanguageMode;
}
