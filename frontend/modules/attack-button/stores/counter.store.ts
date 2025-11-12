import { observable } from '@legendapp/state'
import { configureSynced, synced } from '@legendapp/state/sync'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COUNTER_CONSTRAINTS } from '../types'

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
 * Validates and constrains counter values
 *
 * @param value - Value to validate
 * @returns Valid counter value within constraints
 */
export function validateCount(value: number): number {
  const original = value

  // Check for invalid numbers
  if (!Number.isFinite(value)) {
    if (__DEV__) {
      console.warn(`[Counter] Invalid number ${original}, resetting to 0`)
    }
    return COUNTER_CONSTRAINTS.MIN_VALUE
  }

  // Prevent negative
  if (value < COUNTER_CONSTRAINTS.MIN_VALUE) {
    if (__DEV__) {
      console.warn(`[Counter] Negative value ${value} not allowed, setting to 0`)
    }
    return COUNTER_CONSTRAINTS.MIN_VALUE
  }

  // Prevent overflow
  if (value > COUNTER_CONSTRAINTS.MAX_VALUE) {
    if (__DEV__) {
      console.warn(`[Counter] Value ${value} exceeds max, capping at ${COUNTER_CONSTRAINTS.MAX_VALUE}`)
    }
    return COUNTER_CONSTRAINTS.MAX_VALUE
  }

  // Ensure integer
  return Math.floor(value)
}

/**
 * Factory function to create counter store with specific storage key
 *
 * @param storageKey - AsyncStorage key for persistence
 * @param initialValue - Initial counter value (default: 0)
 * @returns Observable counter store
 */
export function createCounterStore(storageKey: string, initialValue = 0) {
  return observable({
    count: persist({
      initial: validateCount(initialValue),
      persist: {
        name: storageKey,
        debounceSet: COUNTER_CONSTRAINTS.DEBOUNCE_MS
      }
    })
  })
}
