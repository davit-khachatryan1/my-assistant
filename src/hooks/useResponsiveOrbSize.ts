import { useEffect, useState } from 'react';

const QUERY = '(min-width: 768px)';

export function useResponsiveOrbSize(compactSize: number, wideSize: number): number {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    const onChange = () => setWide(mediaQuery.matches);
    onChange();
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return wide ? wideSize : compactSize;
}
