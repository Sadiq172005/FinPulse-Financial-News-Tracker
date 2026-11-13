import { useEffect, useState } from 'react';

// localStorage can be unavailable (private mode, sandboxed frames), so every
// access is wrapped and the app works without it.

export function load(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore: state simply lives in memory for this session.
  }
}

export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => load(key, initial));
  useEffect(() => {
    save(key, value);
  }, [key, value]);
  return [value, setValue];
}
