import { useMemo } from 'react';
import { observable, Observable, computed } from '@legendapp/state';
import { configureSynced, synced } from '@legendapp/state/sync';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UPGRADE_DEFINITIONS, Upgrade } from './upgradeDefinitions';

const persistPlugin = new ObservablePersistAsyncStorage({ AsyncStorage });

const persist = configureSynced(synced, {
  persist: {
    plugin: persistPlugin,
    retrySync: true,
  },
});

interface UseUpgradesReturn {
  purchasedUpgradeIds$: Observable<string[]>;
  availableUpgrades$: Observable<Upgrade[]>;
  totalScrapMultiplier$: Observable<number>;
  totalPetBonus$: Observable<number>;
  actions: {
    purchase: (upgradeId: string) => boolean;
  };
}

const purchasedUpgradeIds$ = observable(
  persist({
    initial: [] as string[],
    persist: {
      name: 'purchased-upgrades-v1',
      debounceSet: 1000,
    },
  })
);

/**
 * Hook for managing shop upgrades, purchases, and effect calculations.
 * Tracks purchased upgrades with persistence and validates purchase transactions.
 *
 * @param scrap$ - Observable containing current scrap balance
 * @returns Upgrade state, computed values, and purchase action
 */
export function useUpgrades(scrap$: Observable<number>): UseUpgradesReturn {
  const availableUpgrades$ = useMemo(
    () =>
      computed(() => {
        const purchased = purchasedUpgradeIds$.get();
        return UPGRADE_DEFINITIONS.filter((u) => !purchased.includes(u.id));
      }),
    []
  );

  const totalScrapMultiplier$ = useMemo(
    () =>
      computed(() => {
        const purchased = purchasedUpgradeIds$.get();
        const scrapUpgrades = UPGRADE_DEFINITIONS.filter(
          (u) => purchased.includes(u.id) && u.effectType === 'scrapMultiplier'
        );
        return scrapUpgrades.reduce((sum, u) => sum + u.effectValue, 0);
      }),
    []
  );

  const totalPetBonus$ = useMemo(
    () =>
      computed(() => {
        const purchased = purchasedUpgradeIds$.get();
        const petUpgrades = UPGRADE_DEFINITIONS.filter(
          (u) => purchased.includes(u.id) && u.effectType === 'petBonus'
        );
        return petUpgrades.reduce((sum, u) => sum + u.effectValue, 0);
      }),
    []
  );

  const actions = useMemo(
    () => ({
      purchase: (upgradeId: string): boolean => {
        // Find upgrade
        const upgrade = UPGRADE_DEFINITIONS.find((u) => u.id === upgradeId);
        if (!upgrade) {
          console.error(`Upgrade not found: ${upgradeId}`);
          return false;
        }

        // Validate: sufficient scrap
        const currentScrap = scrap$.get();
        if (currentScrap < upgrade.cost) {
          console.log(`Insufficient scrap for ${upgrade.name}`);
          return false;
        }

        // Validate: not already purchased
        const purchased = purchasedUpgradeIds$.get();
        if (purchased.includes(upgradeId)) {
          console.log(`Upgrade already purchased: ${upgrade.name}`);
          return false;
        }

        // Execute purchase
        try {
          scrap$.set((prev) => prev - upgrade.cost);
          purchasedUpgradeIds$.set((prev) => [...prev, upgradeId]);
          return true;
        } catch (error) {
          console.error('Purchase failed:', error);
          return false;
        }
      },
    }),
    [scrap$]
  );

  return useMemo(
    () => ({
      purchasedUpgradeIds$,
      availableUpgrades$,
      totalScrapMultiplier$,
      totalPetBonus$,
      actions,
    }),
    [availableUpgrades$, totalScrapMultiplier$, totalPetBonus$, actions]
  );
}
