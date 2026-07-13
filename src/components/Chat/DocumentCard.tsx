import type { DocumentMessage } from '../../state/appState.types';
import styles from './Transcript.module.css';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function DocumentCard({ message }: { message: DocumentMessage }) {
  return (
    <div className={styles.documentCard}>
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
        <p className={`${styles.documentName} text-button-label`}>{message.filename}</p>
        <p className={`${styles.documentMeta} text-timestamp`}>
          {message.fileType} · {formatBytes(message.sizeBytes)}
        </p>
      </div>
      <a
        href={message.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.downloadButton}
        aria-label={`Open ${message.filename}`}
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
      </a>
    </div>
  );
}
