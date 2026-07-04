import { useAppState } from '../../state/AppStateContext';
import styles from './SettingsPanel.module.css';

export function LanguageToggle() {
  const { settings, updateSettings } = useAppState();

  return (
    <div className={styles.segmented}>
      <button
        type="button"
        className={`${styles.segment} text-button-label`}
        data-selected={settings.languageMode === 'hy-first'}
        onClick={() => updateSettings({ languageMode: 'hy-first' })}
      >
        Հայերեն
      </button>
      <button
        type="button"
        className={`${styles.segment} text-button-label`}
        data-selected={settings.languageMode === 'en-first'}
        onClick={() => updateSettings({ languageMode: 'en-first' })}
      >
        English
      </button>
    </div>
  );
}
