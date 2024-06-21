import { useState, useEffect } from "react";

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue; // Return default value if localStorage is not available
  }

  // Getting stored value
  const saved = localStorage.getItem(key);
  const initial = saved ? (JSON.parse(saved) as T) : defaultValue;
  return initial;
}

export const useLocalStorage = <T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue<T>(key, defaultValue);
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Storing input name
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        setValue(event.newValue ? JSON.parse(event.newValue) : defaultValue);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [key, defaultValue]);

  return [value, setValue];
};