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
  // userId present -> signed-in request, routed to the Postgres-backed
  // implementation for durable cross-device history. Absent -> anonymous,
  // routed to the in-memory implementation exactly as before. See store.ts.
  getHistory(conversationId: string, userId?: string): Promise<StoredChatMessage[]>;
  appendMessage(conversationId: string, message: StoredChatMessage, userId?: string): Promise<void>;
}
