import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value by a given delay in milliseconds.
 *
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds (default: 350ms).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
