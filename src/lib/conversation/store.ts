import { createInMemoryConversationStore } from './InMemoryConversationStore';
import type { ConversationStore } from './ConversationStore';

// Phase 1 changes only this file's contents (swap for a Drizzle/Postgres
// backed store) — route/client code imports conversationStore and never
// needs to change when that happens.
export const conversationStore: ConversationStore = createInMemoryConversationStore();
