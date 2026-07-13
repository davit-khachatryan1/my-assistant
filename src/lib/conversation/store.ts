import { createInMemoryConversationStore } from './InMemoryConversationStore';
import { createPostgresConversationStore } from './PostgresConversationStore';
import type { ConversationStore, StoredChatMessage } from './ConversationStore';

// Phase 1 changes only this file's contents (swap for a Drizzle/Postgres
// backed store) — route/client code imports conversationStore and never
// needs to change when that happens. This is that swap: a hybrid facade
// that routes to Postgres for signed-in users (durable, cross-device) and
// keeps the original in-memory behavior unchanged for anonymous users.
const inMemoryStore = createInMemoryConversationStore();
const postgresStore = createPostgresConversationStore();

function createHybridConversationStore(): ConversationStore {
  return {
    async getHistory(conversationId: string, userId?: string) {
      return userId ? postgresStore.getHistory(conversationId, userId) : inMemoryStore.getHistory(conversationId);
    },
    async appendMessage(conversationId: string, message: StoredChatMessage, userId?: string) {
      return userId
        ? postgresStore.appendMessage(conversationId, message, userId)
        : inMemoryStore.appendMessage(conversationId, message);
    },
  };
}

export const conversationStore: ConversationStore = createHybridConversationStore();
