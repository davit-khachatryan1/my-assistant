import styles from './Orb.module.css';

interface Dot {
  x: number;
  y: number;
  delay: number;
}

const DOTS: Dot[] = [
  { x: 130, y: 55, delay: 0 },
  { x: 165, y: 85, delay: 0.4 },
  { x: 172, y: 130, delay: 0.9 },
  { x: 145, y: 165, delay: 1.3 },
  { x: 95, y: 172, delay: 0.2 },
  { x: 55, y: 148, delay: 1.7 },
  { x: 48, y: 100, delay: 0.6 },
  { x: 70, y: 58, delay: 1.1 },
];

export function OrbDots() {
  return (
    <g>
      {DOTS.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={2.5}
          className={styles.dot}
          style={{ animationDelay: `${dot.delay}s` }}
        />
      ))}
    </g>
  );
}
