import type { PromptChipIcon } from '../../state/mockPrompts';
import styles from './SuggestionTile.module.css';

interface SuggestionTileProps {
  label: string;
  icon: PromptChipIcon;
  tint: 'plum' | 'chartreuse';
  onClick: () => void;
}

function TileIcon({ icon }: { icon: PromptChipIcon }) {
  if (icon === 'search') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="m20 20-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function SuggestionTile({ label, icon, tint, onClick }: SuggestionTileProps) {
  return (
    <button type="button" className={styles.tile} data-tint={tint} onClick={onClick}>
      <span className={styles.iconWrap} data-tint={tint}>
        <TileIcon icon={icon} />
      </span>
      <p className={`${styles.label} text-tile-label`}>{label}</p>
      <svg
        className={styles.cornerArrow}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 17 17 7M9 7h8v8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
