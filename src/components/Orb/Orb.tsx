import { useState } from 'react';
import styles from './Orb.module.css';
import { useOrbAnimation } from './useOrbAnimation';
import { useMotionPreference } from '../../state/MotionPreferenceContext';
import type { OrbProps } from './orb.types';

export function Orb({
  state,
  thinkingLabel = 'thinking',
  size = 140,
  statusLine,
  onTap,
  frozen = false,
  uiLanguage = 'hy',
}: OrbProps) {
  const { reducedMotion } = useMotionPreference();
  const [bargingIn, setBargingIn] = useState(false);

  const effectiveState = frozen ? 'idle' : state;
  const effectiveReducedMotion = frozen ? true : reducedMotion;

  const anim = useOrbAnimation(effectiveState, thinkingLabel, effectiveReducedMotion, uiLanguage);

  const handleTap = () => {
    if (frozen) return;
    if (state === 'speaking' && onTap) {
      setBargingIn(true);
      onTap();
      setTimeout(() => setBargingIn(false), 200);
    } else {
      onTap?.();
    }
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.wrapper}
        style={{ width: size, height: size }}
        data-state={effectiveState}
        data-reduced-motion={effectiveReducedMotion}
        data-barging-in={bargingIn}
        onClick={handleTap}
        aria-label={`Luka — ${effectiveState}`}
      >
        <span className={styles.robotShadow} aria-hidden="true" />
        <span className={styles.signalAura} data-state={effectiveState} aria-hidden="true" />
        <span className={styles.robot} data-state={effectiveState} aria-hidden="true">
          <span className={styles.head}>
            <span className={styles.earLeft} />
            <span className={styles.earRight} />
            <span className={styles.faceScreen}>
              <span className={styles.scanLines} />
              <span className={styles.eyeLeft} />
              <span className={styles.eyeRight} />
              <span className={styles.smile} />
            </span>
          </span>
          <span className={styles.neck} />
          <span className={styles.torso}>
            <span className={styles.armLeft} />
            <span className={styles.armRight} />
            <span className={styles.legLeft} />
            <span className={styles.legRight} />
          </span>
        </span>
      </button>
      {!frozen && (
        <p
          className={`${styles.statusLine} text-orb-status`}
          data-variant={anim.statusVariant}
          role="status"
          aria-live="polite"
        >
          {statusLine ?? anim.statusText}
          {anim.statusVariant === 'listening' && (
            <span className={styles.blinkDots} aria-hidden="true">
              <span className={styles.blinkDot} style={{ animationDelay: '0ms' }} />
              <span className={styles.blinkDot} style={{ animationDelay: '150ms' }} />
              <span className={styles.blinkDot} style={{ animationDelay: '300ms' }} />
            </span>
          )}
        </p>
      )}
    </div>
  );
}
