import { useEffect, useMemo } from 'react';
import { observable, Observable } from '@legendapp/state';
import { configureSynced, synced } from '@legendapp/state/sync';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUpgrades } from '../shop/useUpgrades';

const SCRAP_PER_PET_PER_SECOND = 1;
const GENERATION_INTERVAL_MS = 1000;

const persistPlugin = new ObservablePersistAsyncStorage({ AsyncStorage });

const persist = configureSynced(synced, {
  persist: {
    plugin: persistPlugin,
    retrySync: true,
  },
});

interface UseScrapGenerationReturn {
  scrap$: Observable<number>;
}

const scrap$ = observable(
  persist({
    initial: 0,
    persist: {
      name: 'scrap-total-v1',
      debounceSet: 1000,
    },
  })
);

/**
 * Hook for managing passive scrap generation based on AI Pet count.
 * Generates scrap every 1 second while component is mounted.
 * Scrap total persists to AsyncStorage with 1-second debounce.
 * Applies scrap multiplier effects from purchased upgrades.
 *
 * @param petCount$ - Observable containing current AI Pet count
 * @returns Observable scrap total value
 */
export function useScrapGeneration(
  petCount$: Observable<number>
): UseScrapGenerationReturn {
  const { totalScrapMultiplier$ } = useUpgrades(scrap$);

  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        const currentPetCount = petCount$.get();
        const multiplier = totalScrapMultiplier$.get();
        const baseScrap = currentPetCount * SCRAP_PER_PET_PER_SECOND;
        const scrapToAdd = Math.round(baseScrap * (1 + multiplier));
        scrap$.set((prev) => prev + scrapToAdd);
      } catch (error) {
        console.error('Scrap generation error:', error);
      }
    }, GENERATION_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [petCount$, totalScrapMultiplier$]);

  return useMemo(() => ({
    scrap$,
  }), []);
}
