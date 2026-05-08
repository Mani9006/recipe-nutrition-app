import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for syncing state with localStorage.
 * Handles JSON serialization, error handling, and SSR compatibility.
 *
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Default value if no stored value exists
 * @returns {[*, Function]} - [storedValue, setValue]
 */
function useLocalStorage(key, initialValue) {
  // Lazy initialization to avoid parsing on every render
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      const parsed = JSON.parse(item);
      // Validate parsed data matches expected shape for arrays/objects
      if (Array.isArray(initialValue) && !Array.isArray(parsed)) {
        console.warn(`useLocalStorage: Expected array for key "${key}", got ${typeof parsed}. Resetting to initial value.`);
        return initialValue;
      }
      return parsed;
    } catch (error) {
      console.error(`useLocalStorage: Error reading key "${key}":`, error);
      // Clear corrupted data
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore cleanup errors
      }
      return initialValue;
    }
  });

  // Keep localStorage in sync with state
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const valueToStore = JSON.stringify(storedValue);
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error(`useLocalStorage: Storage quota exceeded for key "${key}".`);
      } else {
        console.error(`useLocalStorage: Error writing key "${key}":`, error);
      }
    }
  }, [key, storedValue]);

  // Listen for changes from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (event) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.error(`useLocalStorage: Error parsing external update for "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  // Wrapper for setState that also accepts a function
  const setValue = useCallback((value) => {
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      return valueToStore;
    });
  }, []);

  // Remove item from localStorage and reset to initial value
  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.error(`useLocalStorage: Error removing key "${key}":`, error);
      }
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
