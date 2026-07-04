import { ARC_IDS } from './OrbArcs';

interface Particle {
  arcIndex: number;
  dur: number;
  begin: number;
  color: 'chartreuse' | 'plum';
}

const PARTICLES: Particle[] = [
  { arcIndex: 0, dur: 2.2, begin: -0.2, color: 'chartreuse' },
  { arcIndex: 0, dur: 2.8, begin: -1.4, color: 'plum' },
  { arcIndex: 1, dur: 1.8, begin: -0.6, color: 'chartreuse' },
  { arcIndex: 1, dur: 2.6, begin: -1.9, color: 'plum' },
  { arcIndex: 2, dur: 1.5, begin: -0.3, color: 'chartreuse' },
  { arcIndex: 2, dur: 2.4, begin: -1.1, color: 'plum' },
  { arcIndex: 3, dur: 2.0, begin: -0.8, color: 'chartreuse' },
  { arcIndex: 3, dur: 3.0, begin: -2.2, color: 'plum' },
  { arcIndex: 4, dur: 1.7, begin: -0.5, color: 'chartreuse' },
  { arcIndex: 4, dur: 2.5, begin: -1.6, color: 'plum' },
];

export function OrbParticles() {
  return (
    <g>
      {PARTICLES.map((particle, i) => (
        <circle key={i} r={2} fill={`var(--${particle.color === 'chartreuse' ? 'thinking-a' : 'thinking-b'})`}>
          <animateMotion
            dur={`${particle.dur}s`}
            begin={`${particle.begin}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keyPoints="0;1"
            keyTimes="0;1"
            keySplines="0.42 0 0.58 1"
          >
            <mpath href={`#${ARC_IDS[particle.arcIndex]}`} />
          </animateMotion>
        </circle>
      ))}
    </g>
  );
}
