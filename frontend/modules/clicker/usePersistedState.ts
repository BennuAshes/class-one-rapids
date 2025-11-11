import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVE_DEBOUNCE_MS = 1000;

export function usePersistedState(
  key: string,
  initialValue: number = 0
): [number, React.Dispatch<React.SetStateAction<number>>] {
  const [value, setValue] = useState(initialValue);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Load value from AsyncStorage on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue !== null) {
          const parsedValue = parseInt(storedValue, 10);
          if (!isNaN(parsedValue) && parsedValue >= 0) {
            setValue(parsedValue);
          }
        }
      } catch (error) {
        console.error(`Error loading ${key} from AsyncStorage:`, error);
      }
    };

    loadValue();
  }, [key]);

  // Save value to AsyncStorage with debounce
  useEffect(() => {
    // Skip saving on initial mount (we just loaded the value)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(key, value.toString());
      } catch (error) {
        console.error(`Error saving ${key} to AsyncStorage:`, error);
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [key, value]);

  return [value, setValue];
}
