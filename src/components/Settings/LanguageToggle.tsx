import type { LanguageCode } from '../../state/appState.types';
import { useAppState } from '../../state/AppStateContext';
import styles from './SettingsPanel.module.css';

const LANGUAGES: Array<{ code: LanguageCode; label: string }> = [
  { code: 'hy', label: 'Հայերեն' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

export function LanguageToggle() {
  const { settings, updateSettings } = useAppState();

  return (
    <div className={styles.languageStack}>
      <div className={styles.languageGroup}>
        <p className={`${styles.languageLabel} text-timestamp`}>You speak</p>
        <div className={styles.segmented}>
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              className={`${styles.segment} text-button-label`}
              data-selected={settings.inputLanguage === language.code}
              onClick={() => updateSettings({ inputLanguage: language.code })}
            >
              {language.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.languageGroup}>
        <p className={`${styles.languageLabel} text-timestamp`}>Luka answers</p>
        <div className={styles.segmented}>
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              className={`${styles.segment} text-button-label`}
              data-selected={settings.responseLanguage === language.code}
              onClick={() => updateSettings({ responseLanguage: language.code })}
            >
              {language.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
