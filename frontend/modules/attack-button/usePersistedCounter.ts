import { useMemo } from 'react';
import { observable, Observable } from '@legendapp/state';
import { configureSynced, synced } from '@legendapp/state/sync';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure persistence plugin
const persistPlugin = new ObservablePersistAsyncStorage({ AsyncStorage });

const persist = configureSynced(synced, {
  persist: {
    plugin: persistPlugin,
    retrySync: true,
  },
});

interface UsePersistedCounterReturn {
  count$: Observable<number>;
  actions: {
    increment: () => void;
  };
}

// Create persisted observable at module level (singleton for app lifecycle)
const count$ = observable(
  persist({
    initial: 0,
    persist: {
      name: 'singularity-pet-count-v1',
      debounceSet: 1000, // 1 second debounce
    },
  })
);

/**
 * Hook for managing a persistent counter using Legend-State observables.
 * Counter value persists to AsyncStorage with 1-second debounce.
 *
 * @returns Observable counter value and increment action
 */
export function usePersistedCounter(): UsePersistedCounterReturn {
  return useMemo(() => {
    // Actions
    const actions = {
      increment: () => {
        count$.set((prev) => prev + 1);
      },
    };

    return {
      count$,
      actions,
    };
  }, []);
}
