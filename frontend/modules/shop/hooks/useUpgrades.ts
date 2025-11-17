import { useMemo } from 'react';
import { observable, computed } from '@legendapp/state';
import { synced } from '@legendapp/state/sync';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePersistedCounter } from '../../attack-button/hooks/usePersistedCounter';
import type { Upgrade } from '../types/upgrade';

/**
 * Return type for useUpgrades hook
 */
export interface UseUpgradesReturn {
  availableUpgrades$: ReturnType<typeof observable<Upgrade[]>>;
  purchasedUpgrades$: ReturnType<typeof computed<Set<string>>>;
  filteredUpgrades$: ReturnType<typeof computed<Upgrade[]>>;
  actions: {
    purchaseUpgrade: (upgradeId: string, cost: number) => boolean;
    addUpgrade: (upgrade: Upgrade) => void;
    reset: () => void;
  };
}

/**
 * Custom hook providing upgrade management behavior using Legend-State.
 *
 * Behavior: Collection management + purchase validation + persistence
 *
 * @returns Observable upgrade collection and purchase actions
 *
 * @example
 * const { availableUpgrades$, purchasedUpgrades$, actions } = useUpgrades();
 * const { count$: scrap$ } = usePersistedCounter('scrap-balance');
 *
 * // Purchase upgrade
 * actions.purchaseUpgrade('upgrade-1', 10);
 */
export function useUpgrades(): UseUpgradesReturn {
  const { count$: scrap$ } = usePersistedCounter('scrap-balance');

  return useMemo(() => {
    // Available upgrades (initially empty, can be populated later)
    const availableUpgrades$ = observable<Upgrade[]>([]);

    // Purchased upgrade IDs (persisted as array, exposed as Set via computed)
    const purchasedUpgradeIds$ = observable(
      synced({
        initial: [] as string[],
        persist: {
          name: 'purchased-upgrades',
          plugin: new ObservablePersistAsyncStorage({
            AsyncStorage,
          }),
        },
      })
    );

    // Computed: purchased upgrades as Set for easy lookup
    const purchasedUpgrades$ = computed(() => {
      return new Set(purchasedUpgradeIds$.get());
    });

    // Computed: upgrades not yet purchased
    const filteredUpgrades$ = computed(() => {
      const available = availableUpgrades$.get();
      const purchased = purchasedUpgrades$.get();
      return available.filter(upgrade => !purchased.has(upgrade.id));
    });

    const actions = {
      purchaseUpgrade: (upgradeId: string, cost: number): boolean => {
        const currentScrap = scrap$.get();

        // Validate sufficient scrap
        if (currentScrap < cost) {
          return false;
        }

        // Deduct scrap
        scrap$.set(currentScrap - cost);

        // Mark as purchased
        const current = purchasedUpgradeIds$.get();
        if (!current.includes(upgradeId)) {
          purchasedUpgradeIds$.set([...current, upgradeId]);
        }

        return true;
      },

      addUpgrade: (upgrade: Upgrade) => {
        const current = availableUpgrades$.get();
        availableUpgrades$.set([...current, upgrade]);
      },

      reset: () => {
        purchasedUpgradeIds$.set([]);
      }
    };

    return { availableUpgrades$, purchasedUpgrades$, filteredUpgrades$, actions };
  }, [scrap$]);
}
