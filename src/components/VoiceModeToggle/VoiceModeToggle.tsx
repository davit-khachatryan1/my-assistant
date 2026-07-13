import { useAppState } from '../../state/AppStateContext';
import styles from './VoiceModeToggle.module.css';

export function VoiceModeToggle() {
  const { settings, updateSettings, stopAssistantSpeech } = useAppState();
  const voiceOn = settings.voiceReplies;

  const handleToggle = () => {
    if (voiceOn) stopAssistantSpeech();
    updateSettings({ voiceReplies: !voiceOn });
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      data-selected={voiceOn}
      onClick={handleToggle}
      aria-pressed={voiceOn}
      aria-label={voiceOn ? 'Անցնել միայն տեքստային պատասխանների' : 'Անցնել ձայնային պատասխանների'}
    >
      {voiceOn ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 9v6h4l5 4V5L8 9H4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M17 8.5a5 5 0 0 1 0 7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 9v6h4l5 4V5L8 9H4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
      <span className="text-button-label">{voiceOn ? 'Ձայն' : 'Միայն տեքստ'}</span>
    </button>
  );
}
