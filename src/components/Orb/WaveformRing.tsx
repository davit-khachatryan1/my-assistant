import styles from './Orb.module.css';

const BAR_COUNT = 24;
const RING_RADIUS = 85;
const CX = 110;
const CY = 110;
const MIN_BAR_LEN = 4;
const MAX_BAR_LEN = 16;

// Fixed per-bar weight so bars vary in baseline scale while all reacting to
// the same shared amplitude signal, instead of pulsing perfectly in unison.
const BAR_WEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => 0.5 + 0.5 * Math.abs(Math.sin(i * 2.4)));

interface WaveformRingProps {
  amplitude: number;
  color: 'cyan' | 'ember';
}

export function WaveformRing({ amplitude, color }: WaveformRingProps) {
  return (
    <g className={styles.waveformRing} data-color={color}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const angle = (360 / BAR_COUNT) * i;
        const barLen = MIN_BAR_LEN + (MAX_BAR_LEN - MIN_BAR_LEN) * amplitude * BAR_WEIGHTS[i];
        return (
          <rect
            key={i}
            x={-1.5}
            y={-barLen}
            width={3}
            height={barLen}
            rx={1.5}
            className={styles.waveformBar}
            transform={`translate(${CX} ${CY}) rotate(${angle}) translate(0 ${-RING_RADIUS})`}
          />
        );
      })}
    </g>
  );
}
