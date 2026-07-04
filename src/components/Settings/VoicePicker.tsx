import { useState } from 'react';
import { useAppState } from '../../state/AppStateContext';
import { playAudioStream } from '../../lib/audio/playAudioResponse';
import styles from './SettingsPanel.module.css';

const VOICES = [
  { id: 'hy-female', label: 'Հայերեն — Իգական' },
  { id: 'hy-male', label: 'Հայերեն — Արական' },
];

const PREVIEW_SAMPLE_TEXT_HY = 'Բարև, ես Լուկան եմ։';

export function VoicePicker() {
  const { settings, updateSettings } = useAppState();
  const [previewing, setPreviewing] = useState<string | null>(null);

  const handlePreview = async (id: string) => {
    setPreviewing(id);
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: PREVIEW_SAMPLE_TEXT_HY, voiceId: id }),
      });
      if (!res.ok) throw new Error('tts unavailable');
      await playAudioStream(res);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 900));
    } finally {
      setPreviewing((current) => (current === id ? null : current));
    }
  };

  return (
    <div className={styles.voiceList}>
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
