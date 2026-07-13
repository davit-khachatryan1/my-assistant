import { AccountButton } from './AccountButton';
import styles from './TopBar.module.css';

interface TopBarProps {
  onOpenSettings: () => void;
}

export function TopBar({ onOpenSettings }: TopBarProps) {
  return (
    <header className={styles.topBar}>
      <div className={styles.brand}>
        <span className={styles.statusDot} aria-hidden="true" />
        <span className={`${styles.title} text-app-title`}>Luka</span>
        <span className={`${styles.online} text-timestamp`}>ONLINE</span>
      </div>
      <div className={styles.actions}>
        <AccountButton />
        <button
          type="button"
          className={styles.settingsButton}
          onClick={onOpenSettings}
          aria-label="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M19.4 13.5c.04-.33.06-.66.06-1s-.02-.67-.06-1l2.1-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.5 1a7.6 7.6 0 0 0-1.7-1L14.4 3a.5.5 0 0 0-.5-.42h-4a.5.5 0 0 0-.5.42l-.36 2.53a7.6 7.6 0 0 0-1.7 1l-2.5-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64L4.6 11.5c-.04.33-.06.66-.06 1s.02.67.06 1L2.5 15.15a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.5-1a7.6 7.6 0 0 0 1.7 1l.36 2.53a.5.5 0 0 0 .5.42h4a.5.5 0 0 0 .5-.42l.36-2.53a7.6 7.6 0 0 0 1.7-1l2.5 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64L19.4 13.5Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
