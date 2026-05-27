/** Generic debounce/throttle hooks (no lodash dep). */
import { useEffect, useRef, useState, useCallback } from 'react';

/** Returns a value that updates only after `delay` ms of no changes. */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Throttle: fires `fn` at most once every `wait` ms. Trailing-edge call ensures last event is honored. */
export function useThrottle<T extends (...a: any[]) => void>(fn: T, wait = 200): T {
  const lastCallRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  useEffect(() => { fnRef.current = fn; }, [fn]);

  return useCallback((...args: any[]) => {
    const now = Date.now();
    const remaining = wait - (now - lastCallRef.current);
    if (remaining <= 0) {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      lastCallRef.current = now;
      fnRef.current(...args);
    } else if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        timerRef.current = null;
        fnRef.current(...args);
      }, remaining);
    }
  }, [wait]) as T;
}
