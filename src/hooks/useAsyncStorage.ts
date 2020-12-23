import localforage from "localforage";
import { useEffect, useRef, useState } from "react";

export const asyncStorage = localforage.createInstance({
  name: "pelica",
  storeName: "pelica",
  version: 1,
});

export const useAsyncStorage = <T>(key: string, initialValue: T): [T, (value: T) => Promise<void>] => {
  const isMounted = useRef(true);
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    getItem();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const getItem = async () => {
    try {
      const value = await asyncStorage.getItem<T>(key);

      if (isMounted.current) {
        setStoredValue(value ?? initialValue);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const setValue = async (value: T) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;

    if (isMounted.current) {
      setStoredValue(valueToStore);
    }

    try {
      await asyncStorage.setItem(key, value);
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};
