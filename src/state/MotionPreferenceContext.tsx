import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface MotionPreferenceValue {
  reducedMotion: boolean;
  /** Dev-only manual override for previewing reduced-motion behavior without OS settings. */
  devOverride: boolean | null;
  setDevOverride: (value: boolean | null) => void;
}

const MotionPreferenceContext = createContext<MotionPreferenceValue | null>(null);

export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const systemPreference = usePrefersReducedMotion();
  const [devOverride, setDevOverride] = useState<boolean | null>(null);

  const value = useMemo<MotionPreferenceValue>(
    () => ({
      reducedMotion: devOverride ?? systemPreference,
      devOverride,
      setDevOverride,
    }),
    [devOverride, systemPreference],
  );

  return (
    <MotionPreferenceContext.Provider value={value}>
      {children}
    </MotionPreferenceContext.Provider>
  );
}

export function useMotionPreference(): MotionPreferenceValue {
  const ctx = useContext(MotionPreferenceContext);
  if (!ctx) {
    throw new Error('useMotionPreference must be used within MotionPreferenceProvider');
  }
  return ctx;
}
