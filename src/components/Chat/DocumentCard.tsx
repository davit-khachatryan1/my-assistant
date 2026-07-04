import { useState } from 'react';
import type { DocumentMessage } from '../../state/appState.types';
import { useAppState } from '../../state/AppStateContext';
import styles from './Transcript.module.css';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function DocumentCard({ message }: { message: DocumentMessage }) {
  const { updateDocumentMeta } = useAppState();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(false);
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
      if (!res.ok) throw new Error('generation failed');
      const blob = await res.blob();
      updateDocumentMeta(message.id, formatBytes(blob.size));
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = message.filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={styles.documentCard} data-error={downloadError}>
      <svg
        className={`${styles.documentIcon} ${downloading ? styles.documentIconPulse : ''}`}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
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
          {message.fileSizeLabel ? `${message.fileType} · ${message.fileSizeLabel}` : message.fileType}
        </p>
      </div>
      <button
        type="button"
        className={styles.downloadButton}
        onClick={handleDownload}
        aria-label={`Download ${message.filename}`}
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
      </button>
    </div>
  );
}
