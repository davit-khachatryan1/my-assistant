import type { LanguageCode } from '../../state/appState.types';
import type { UILanguage } from '../../lib/i18n/uiStrings';
import { useAppState, useUIStrings } from '../../state/AppStateContext';
import styles from './SettingsPanel.module.css';

const LANGUAGES: Array<{ code: LanguageCode; label: string }> = [
  { code: 'hy', label: 'Հայերեն' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

const APP_LANGUAGES: Array<{ code: UILanguage; label: string }> = [
  { code: 'hy', label: 'Հայերեն' },
  { code: 'en', label: 'English' },
];

export function LanguageToggle() {
  const { settings, updateSettings } = useAppState();
  const t = useUIStrings();

  return (
    <div className={styles.languageStack}>
      <div className={styles.languageGroup}>
        <p className={`${styles.languageLabel} text-timestamp`}>{t.appLanguage}</p>
        <div className={styles.segmented}>
          {APP_LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              className={`${styles.segment} text-button-label`}
              data-selected={settings.uiLanguage === language.code}
              onClick={() => updateSettings({ uiLanguage: language.code })}
            >
              {language.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.languageGroup}>
        <p className={`${styles.languageLabel} text-timestamp`}>{t.youSpeak}</p>
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
        <p className={`${styles.languageLabel} text-timestamp`}>{t.lukaAnswers}</p>
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
