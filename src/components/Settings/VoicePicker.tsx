import { useState } from 'react';
import { useAppState, useUIStrings } from '../../state/AppStateContext';
import { getAudioAdapter } from '../../lib/audio/getAudioAdapter';
import styles from './SettingsPanel.module.css';

const PREVIEW_SAMPLE_TEXT_HY = 'Բարև, ես Լուկան եմ։';

export function VoicePicker() {
  const { settings, updateSettings, stopAssistantSpeech } = useAppState();
  const t = useUIStrings();
  const [previewing, setPreviewing] = useState<string | null>(null);

  const VOICES = [
    { id: 'hy-female', label: t.voiceHyFemale },
    { id: 'hy-male', label: t.voiceHyMale },
  ];

  const handlePreview = async (id: string) => {
    setPreviewing(id);
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: PREVIEW_SAMPLE_TEXT_HY, voiceId: id }),
      });
      if (!res.ok) throw new Error('tts unavailable');
      const audioBuffer = await res.arrayBuffer();
      await getAudioAdapter().play(audioBuffer, new AbortController().signal);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 900));
    } finally {
      setPreviewing((current) => (current === id ? null : current));
    }
  };

  return (
    <div className={styles.voiceList}>
      <div className={styles.voiceReplyRow}>
        <div>
          <p className={`${styles.voiceReplyTitle} text-user-message`}>{t.spokenReplies}</p>
          <p className={`${styles.voiceReplyMeta} text-timestamp`}>{t.voiceInputStillWorks}</p>
        </div>
        <button
          type="button"
          className={styles.voiceReplyToggle}
          data-selected={settings.voiceReplies}
          onClick={() => {
            if (settings.voiceReplies) stopAssistantSpeech();
            updateSettings({ voiceReplies: !settings.voiceReplies });
          }}
          aria-pressed={settings.voiceReplies}
        >
          {settings.voiceReplies ? 'ON' : 'OFF'}
        </button>
      </div>

      {VOICES.map((voice) => (
        <div key={voice.id} className={styles.voiceRow}>
          <button
            type="button"
            className={`${styles.voiceLabel} text-user-message`}
            data-selected={settings.voice === voice.id}
            onClick={() => updateSettings({ voice: voice.id })}
          >
            {voice.label}
          </button>
          <button
            type="button"
            className={styles.previewButton}
            data-playing={previewing === voice.id}
            onClick={() => handlePreview(voice.id)}
            aria-label={`Preview ${voice.label}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 4v16l14-8L6 4Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
