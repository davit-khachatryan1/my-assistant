import { eq, asc } from 'drizzle-orm';
import { db } from '../db/client';
import { conversations, messages } from '../db/schema';
import type { ConversationStore, StoredChatMessage } from './ConversationStore';
import type { Mode } from '../../state/appState.types';

async function ensureConversation(conversationId: string, userId: string): Promise<void> {
  const existing = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  });
  if (!existing) {
    await db.insert(conversations).values({ id: conversationId, userId }).onConflictDoNothing();
  }
}

export function createPostgresConversationStore(): ConversationStore {
  return {
    async getHistory(conversationId) {
      const rows = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));

      return rows.map(
        (row): StoredChatMessage => ({
          role: row.role as 'user' | 'assistant',
          content: row.content,
          createdAt: row.createdAt.toISOString(),
          mode: (row.mode as Mode | null) ?? undefined,
        }),
      );
    },

    async appendMessage(conversationId, message, userId) {
      if (!userId) {
        throw new Error('PostgresConversationStore.appendMessage requires a userId');
      }
      await ensureConversation(conversationId, userId);
      await db.insert(messages).values({
        conversationId,
        role: message.role,
        content: message.content,
        mode: message.mode ?? null,
      });
    },
  };
}
