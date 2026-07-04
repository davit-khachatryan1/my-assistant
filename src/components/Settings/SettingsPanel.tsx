import { useMotionPreference } from '../../state/MotionPreferenceContext';
import { ModelPicker } from './ModelPicker';
import { VoicePicker } from './VoicePicker';
import { LanguageToggle } from './LanguageToggle';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { reducedMotion } = useMotionPreference();

  return (
    <div
      className={styles.panel}
      data-open={open}
      data-reduced-motion={reducedMotion}
      aria-hidden={!open}
    >
      <div className={styles.header}>
        <h2 className="text-app-title">Կարգավորումներ</h2>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <section className={styles.section}>
        <h3 className={`${styles.sectionHeader} text-section-header`}>Մոդել</h3>
        <ModelPicker />
      </section>

      <section className={styles.section}>
        <h3 className={`${styles.sectionHeader} text-section-header`}>Ձայն</h3>
        <VoicePicker />
      </section>

      <section className={styles.section}>
        <h3 className={`${styles.sectionHeader} text-section-header`}>Լեզու</h3>
        <LanguageToggle />
      </section>
    </div>
  );
}
