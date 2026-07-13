import type { Mode } from '../../state/appState.types';
import { useAppState } from '../../state/AppStateContext';
import styles from './SettingsPanel.module.css';

const MODES: Array<{ id: Mode; label: string }> = [
  { id: 'tutor', label: 'Ուսուցիչ' },
  { id: 'digest', label: 'Նորություններ' },
  { id: 'interview', label: 'Հարցազրույց' },
  { id: 'retention', label: 'Կրկնում' },
];

export function ModePicker() {
  const { settings, updateSettings } = useAppState();

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
