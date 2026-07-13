export type ChatSSEEvent =
  | { type: 'token'; text: string }
  | { type: 'searchStatus'; phase: 'searching' | 'done' | 'error'; resultCount?: number; errorCode?: string }
  | { type: 'documentSuggestion'; filename: string; title: string; content: string }
  // Client-constructed only, once /api/generate-document resolves a suggestion — the
  // chat route itself no longer emits this over SSE.
  | { type: 'document'; documentId: string; filename: string; title: string; url: string; sizeBytes: number }
  | { type: 'concepts'; concepts: unknown[] } // reserved for a later phase — not emitted yet
  | { type: 'done' }
  | { type: 'error'; message: string };
