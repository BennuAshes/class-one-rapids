import { observable } from '@legendapp/state'
import { configureSynced, synced } from '@legendapp/state/sync'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Upgrade } from '../types'
import { UpgradeType } from '../types'

/**
 * Shop Store
 *
 * Manages shop state including available upgrades and purchase tracking.
 * Persists purchased upgrades and last purchase time to AsyncStorage.
 */

// Configure persistence plugin
const persistPlugin = observablePersistAsyncStorage({ AsyncStorage })

// Create configured synced function
const persist = configureSynced(synced, {
  persist: {
    plugin: persistPlugin,
    retrySync: true
  }
})

/**
 * Available upgrades catalog (hardcoded for MVP)
 */
const AVAILABLE_UPGRADES: Upgrade[] = [
  {
    id: 'storage-pouch-1',
    name: 'Storage Pouch',
    description: 'Adds +1 scrap per pet',
    cost: 20,
    upgradeType: UpgradeType.SCRAP_PER_PET,
    effectValue: 1
  },
  // Bot Factory upgrade
  {
    id: 'bot-factory-1',
    name: 'Bot Factory',
    description: 'Adds +1 AI Bot per Feed click',
    cost: 100,
    upgradeType: UpgradeType.PETS_PER_FEED,
    effectValue: 1
  }
]

/**
 * Shop observable store
 *
 * - availableUpgrades: All upgrades that can be purchased (not persisted, hardcoded for MVP)
 * - purchasedUpgrades: IDs of purchased upgrades (persisted to AsyncStorage)
 * - lastPurchaseTime: Timestamp of last purchase (persisted for analytics)
 */
export const shopStore = observable({
  // Available upgrades (hardcoded, not persisted)
  availableUpgrades: AVAILABLE_UPGRADES as Upgrade[],

  // Purchased upgrade IDs (persisted)
  purchasedUpgrades: persist({
    initial: [] as string[],
    persist: {
      name: 'shop-purchased-v1',
      debounceSet: 1000
    }
  }),

  // Last purchase timestamp (persisted)
  lastPurchaseTime: persist({
    initial: 0,
    persist: {
      name: 'shop-last-purchase-v1'
    }
  })
})
