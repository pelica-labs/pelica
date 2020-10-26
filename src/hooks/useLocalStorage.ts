import { useState } from "react";

export default function useLocalStorage<T>(key: string, initialValue: T): [T, (x: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item || !JSON.parse(item)) {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      }

      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
      throw error; // this will most likely be a QuotaExceededError
      // @todo how do we make sure this data is still stored?
    }
  };

  return [storedValue, setValue] as [T, (x: T) => void];
}
