import { AccountButton } from './AccountButton';
import styles from './TopBar.module.css';

interface TopBarProps {
  onOpenSettings: () => void;
}

export function TopBar({ onOpenSettings }: TopBarProps) {
  return (
    <header className={styles.topBar}>
      <div className={styles.brand}>
        <svg className={styles.brandMark} width="26" height="26" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="brandMarkHead" x1="13" y1="9" x2="35" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#202024" />
              <stop offset="0.62" stopColor="#0a0a0c" />
              <stop offset="1" stopColor="#050506" />
            </linearGradient>
            <linearGradient id="brandMarkScreen" x1="24" y1="18" x2="24" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#0d1417" />
              <stop offset="1" stopColor="#010102" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="16" fill="#030304" />
          <circle cx="12" cy="23.5" r="4" fill="url(#brandMarkHead)" stroke="rgba(255,255,255,0.12)" />
          <circle cx="36" cy="23.5" r="4" fill="url(#brandMarkHead)" stroke="rgba(255,255,255,0.12)" />
          <path
            d="M13 20c0-7 4.8-11 11-11s11 4 11 11v7c0 7-4.8 11-11 11s-11-4-11-11v-7Z"
            fill="url(#brandMarkHead)"
            stroke="rgba(255,255,255,0.12)"
          />
          <rect x="15.5" y="18" width="17" height="12" rx="5" fill="url(#brandMarkScreen)" stroke="rgba(255,255,255,0.08)" />
          <path
            d="M19 23.5c1.5-2 3.5-2 5 0M24 27c1.5 1.6 3.1 1.6 4.6 0M29 23.5c-1.5-2-3.5-2-5 0"
            stroke="#4fd8ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
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
