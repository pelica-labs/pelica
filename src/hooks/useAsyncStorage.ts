import localforage from "localforage";
import { useEffect, useState } from "react";

const storage = localforage.createInstance({
  name: "pelica",
  storeName: "pelica",
  version: 1,
});

export const useAsyncStorage = <T>(key: string, initialValue: T): [T, (value: T) => Promise<void>] => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    getItem();
  }, []);

  const getItem = async () => {
    try {
      const value = await storage.getItem<T>(key);

      setStoredValue(value ?? initialValue);
    } catch (error) {
      console.error(error);
    }
  };

  const setValue = async (value: T) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);

    try {
      await storage.setItem(key, value);
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};
