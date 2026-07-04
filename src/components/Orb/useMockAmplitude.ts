import { useEffect, useRef, useState } from 'react';

/**
 * Simulated 0-1 amplitude signal, updated via requestAnimationFrame while `active`.
 * TODO(real-mic): replace with an AnalyserNode-backed hook exposing the same
 * (active: boolean) => number signature — no changes needed in WaveformRing.
 */
export function useMockAmplitude(active: boolean): number {
  const [amplitude, setAmplitude] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setAmplitude(0);
      return;
    }

    startRef.current = performance.now();

    const tick = (now: number) => {
      const t = (now - startRef.current) / 1000;
      const envelope = 0.55 + 0.35 * Math.sin(t * 2.1);
      const jitter = (Math.random() - 0.5) * 0.2;
      setAmplitude(Math.min(1, Math.max(0, envelope + jitter)));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return amplitude;
}
