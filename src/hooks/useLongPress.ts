import { useRef } from 'react';

const LONG_PRESS_MS = 500;

export function useLongPress(onLongPress: () => void, onRelease?: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const start = () => {
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  };

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (firedRef.current) onRelease?.();
    firedRef.current = false;
  };

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: clear,
  };
}
