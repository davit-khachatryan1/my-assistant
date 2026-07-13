import type { ConversationStore, StoredChatMessage } from './ConversationStore';

// Module-level Map — survives across requests within one Node process, but
// is explicitly NOT durable across restarts/deploys/multiple instances.
// Phase 1 replaces this with a Postgres-backed implementation behind the
// same ConversationStore interface; no other file needs to change then.
const conversations = new Map<string, StoredChatMessage[]>();

export function createInMemoryConversationStore(): ConversationStore {
  return {
    async getHistory(conversationId) {
      return conversations.get(conversationId) ?? [];
    },
    async appendMessage(conversationId, message) {
      const history = conversations.get(conversationId) ?? [];
      history.push(message);
      conversations.set(conversationId, history);
    },
  };
}
