import type { DocumentSuggestionMessage } from '../../state/appState.types';
import { useAppState, useUIStrings } from '../../state/AppStateContext';
import styles from './Transcript.module.css';

export function DocumentSuggestionCard({ message }: { message: DocumentSuggestionMessage }) {
  const { setDocumentSuggestionStatus, resolveDocumentSuggestion } = useAppState();
  const t = useUIStrings();
  const isGenerating = message.status === 'generating';
  const isError = message.status === 'error';

  const handleGenerate = async () => {
    setDocumentSuggestionStatus(message.id, 'generating');
    try {
      const res = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: message.filename,
          title: message.title,
          content: message.content,
        }),
      });
      if (!res.ok) throw new Error('generate failed');
      const doc = (await res.json()) as { documentId: string; url: string; sizeBytes: number };
      resolveDocumentSuggestion(message.id, doc);
    } catch {
      setDocumentSuggestionStatus(message.id, 'error', t.docGenerateError);
    }
  };

  return (
    <div className={`${styles.documentCard} ${styles.suggestionCard}`} data-error={isError}>
      <svg className={styles.documentIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <div className={styles.documentInfo}>
        <p className={`${styles.documentName} text-button-label`}>{message.title}</p>
        <p className={`${styles.documentMeta} text-timestamp`}>
          {isError ? message.errorMessage : t.docReadyToGenerate}
        </p>
      </div>
      <button
        type="button"
        className={styles.generateButton}
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-button-label">{isGenerating ? t.docGenerating : t.docGenerate}</span>
      </button>
    </div>
  );
}
