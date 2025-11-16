import { useMemo } from 'react';
import { observable, Observable } from '@legendapp/state';
import { configureSynced, synced } from '@legendapp/state/sync';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useScrapGeneration } from '../scrap/useScrapGeneration';
import { useUpgrades } from '../shop/useUpgrades';

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
 * Applies pet bonus effects from purchased upgrades.
 *
 * @returns Observable counter value and increment action
 */
export function usePersistedCounter(): UsePersistedCounterReturn {
  const { scrap$ } = useScrapGeneration(count$);
  const { totalPetBonus$ } = useUpgrades(scrap$);

  return useMemo(() => {
    // Actions
    const actions = {
      increment: () => {
        const bonus = totalPetBonus$.get();
        count$.set((prev) => prev + 1 + bonus);
      },
    };

    return {
      count$,
      actions,
    };
  }, [totalPetBonus$]);
}
