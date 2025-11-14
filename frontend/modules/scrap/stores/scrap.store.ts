import { observable } from '@legendapp/state'
import { configureSynced, synced } from '@legendapp/state/sync'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SCRAP_CONSTRAINTS } from '../types'

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
 * Factory function to create scrap store with persistence
 *
 * @returns Observable scrap store with AsyncStorage sync
 */
export function createScrapStore() {
  return observable({
    scrap: persist({
      initial: 0,
      persist: {
        name: 'scrap-count-v1',
        debounceSet: SCRAP_CONSTRAINTS.DEBOUNCE_MS
      }
    }),
    lastTickTime: 0 // Runtime only, not persisted
  })
}

// Export singleton instance
export const scrapStore = createScrapStore()
