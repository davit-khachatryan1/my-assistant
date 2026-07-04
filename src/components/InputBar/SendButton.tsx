import styles from './InputBar.module.css';

interface SendButtonProps {
  enabled: boolean;
  onSend: () => void;
}

export function SendButton({ enabled, onSend }: SendButtonProps) {
  return (
    <button
      type="button"
      className={styles.sendButton}
      data-enabled={enabled}
      disabled={!enabled}
      onClick={onSend}
      aria-label="Send message"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 12h16m0 0-6-6m6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
