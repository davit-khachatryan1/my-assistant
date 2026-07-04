import styles from './InputBar.module.css';

interface MicButtonProps {
  active: boolean;
  onToggle: () => void;
}

export function MicButton({ active, onToggle }: MicButtonProps) {
  return (
    <button
      type="button"
      className={styles.micButton}
      data-active={active}
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? 'Stop listening' : 'Start voice input'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M19 11a7 7 0 0 1-14 0M12 18v3"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
