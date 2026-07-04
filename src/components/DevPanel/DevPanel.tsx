import { useAppState } from '../../state/AppStateContext';
import { useMotionPreference } from '../../state/MotionPreferenceContext';
import type { OrbState, ThinkingLabel } from '../Orb/orb.types';
import styles from './DevPanel.module.css';

const ORB_STATES: OrbState[] = ['idle', 'listening', 'thinking', 'speaking'];
const THINKING_LABELS: ThinkingLabel[] = ['thinking', 'searching', 'writing'];

export function DevPanel() {
  const { orbState, setOrbState, thinkingLabel, setThinkingLabel } = useAppState();
  const { reducedMotion, devOverride, setDevOverride } = useMotionPreference();

  const handleSimulateSpeaking = () => {
    setOrbState('speaking');
    setTimeout(() => setOrbState('idle'), 4000);
  };

  return (
    <div className={styles.panel}>
      <span className={styles.badge}>DEV</span>
      <div className={styles.row}>
        {ORB_STATES.map((s) => (
          <button
            key={s}
            type="button"
            className={styles.button}
            data-active={orbState === s}
            onClick={() => setOrbState(s)}
          >
            {s}
          </button>
        ))}
      </div>
      {orbState === 'thinking' && (
        <div className={styles.row}>
          {THINKING_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              className={styles.pill}
              data-active={thinkingLabel === label}
              onClick={() => setThinkingLabel(label)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className={styles.row}>
        <button type="button" className={styles.button} onClick={handleSimulateSpeaking}>
          simulate speaking → idle
        </button>
      </div>
      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={devOverride === true}
          onChange={(e) => setDevOverride(e.target.checked ? true : null)}
        />
        simulate reduced motion {devOverride === null && reducedMotion ? '(system: on)' : ''}
      </label>
    </div>
  );
}
