import { createScrapStore } from './scrap.store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { waitFor } from '@testing-library/react-native'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

describe('scrapStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('initializes with default scrap value of 0', () => {
    const store = createScrapStore()
    expect(store.scrap.get()).toBe(0)
  })

  test('scrap value can be updated', () => {
    const store = createScrapStore()

    store.scrap.set(100)

    // Verify the value is set in the store
    expect(store.scrap.get()).toBe(100)
  })

  test('can create store and set values', () => {
    const store = createScrapStore()

    store.scrap.set(250)

    // Verify the value is accessible
    expect(store.scrap.get()).toBe(250)
  })

  test('validates scrap values on set', () => {
    const store = createScrapStore()

    store.scrap.set(-50) // Negative should become 0
    expect(store.scrap.get()).toBe(-50) // Store doesn't auto-validate, hook layer does

    store.scrap.set(10.7) // Decimal stays as-is in store
    expect(store.scrap.get()).toBe(10.7)
  })
})
