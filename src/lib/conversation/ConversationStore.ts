import type { Mode } from '../../state/appState.types';

export interface StoredChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  // Which mode produced this message — lets Retention mode selectively
  // pull prior Tutor/Digest content when building its quiz context.
  mode?: Mode;
}

export interface ConversationStore {
  getHistory(conversationId: string): Promise<StoredChatMessage[]>;
  appendMessage(conversationId: string, message: StoredChatMessage): Promise<void>;
}
