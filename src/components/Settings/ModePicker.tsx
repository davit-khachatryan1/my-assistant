import type { Mode } from '../../state/appState.types';
import { useAppState, useUIStrings } from '../../state/AppStateContext';
import styles from './SettingsPanel.module.css';

export function ModePicker() {
  const { settings, updateSettings } = useAppState();
  const t = useUIStrings();

  const MODES: Array<{ id: Mode; label: string }> = [
    { id: 'tutor', label: t.modeTutor },
    { id: 'digest', label: t.modeDigest },
    { id: 'interview', label: t.modeInterview },
    { id: 'retention', label: t.modeRetention },
  ];

  return (
    <div className={`${styles.segmented} ${styles.segmentedGrid2}`}>
      {MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          className={`${styles.segment} text-button-label`}
          data-selected={settings.mode === mode.id}
          onClick={() => updateSettings({ mode: mode.id })}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
