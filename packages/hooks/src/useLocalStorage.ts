'use client';

import { useState, useEffect, useCallback } from 'react';

export type LocalStorageValue = string | number | boolean | object | null;

export interface UseLocalStorageOptions<T> {
  /** Key prefix (default: 'buildpad') */
  prefix?: string;
  /** Serialize function */
  serialize?: (value: T) => string;
  /** Deserialize function */
  deserialize?: (value: string) => T;
}

export interface UseLocalStorageReturn<T> {
  /** Current stored value */
  value: T | null;
  /** Set the value */
  setValue: (value: T | null) => void;
  /** Remove the value from storage */
  removeValue: () => void;
}

/**
 * Parse JSON safely with fallback
 */
function parseJSON<T>(value: string): T | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * Hook for persistent localStorage state
 * Ported from DaaS useLocalStorage composable for React
 * 
 * @example
 * ```tsx
 * const { value, setValue, removeValue } = useLocalStorage<{ theme: string }>('settings', { theme: 'light' });
 * 
 * // Update value
 * setValue({ theme: 'dark' });
 * 
 * // Remove value
 * removeValue();
 * ```
 */
export function useLocalStorage<T extends LocalStorageValue>(
  key: string,
  defaultValue: T | null = null,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    prefix = 'buildpad',
    serialize = JSON.stringify,
    deserialize = parseJSON,
  } = options;

  const internalKey = `${prefix}-${key}`;

  // Get initial value from localStorage
  const getStoredValue = useCallback((): T | null => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const rawValue = localStorage.getItem(internalKey);
      if (!rawValue) return defaultValue;
      
      const parsed = deserialize(rawValue);
      return parsed as T | null;
    } catch (error) {
      console.warn(`Couldn't parse value from local storage for key "${internalKey}"`, error);
      return defaultValue;
    }
  }, [internalKey, defaultValue, deserialize]);

  const [value, setValueState] = useState<T | null>(() => getStoredValue());

  // Sync with localStorage on mount and when storage changes
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === internalKey) {
        const newValue = event.newValue 
          ? (deserialize(event.newValue) as T | null)
          : defaultValue;
        setValueState(newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [internalKey, defaultValue, deserialize]);

  const setValue = useCallback((newValue: T | null) => {
    try {
      setValueState(newValue);
      
      if (newValue === null) {
        localStorage.removeItem(internalKey);
      } else {
        localStorage.setItem(internalKey, serialize(newValue));
      }
    } catch (error) {
      console.warn(`Couldn't set value to local storage for key "${internalKey}"`, error);
    }
  }, [internalKey, serialize]);

  const removeValue = useCallback(() => {
    try {
      setValueState(null);
      localStorage.removeItem(internalKey);
    } catch (error) {
      console.warn(`Couldn't remove value from local storage for key "${internalKey}"`, error);
    }
  }, [internalKey]);

  return {
    value,
    setValue,
    removeValue,
  };
}
