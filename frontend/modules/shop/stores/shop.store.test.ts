import { shopStore } from './shop.store'
import { mockUpgrade } from '../types'
import { waitFor } from '@testing-library/react-native'

describe('shopStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    shopStore.availableUpgrades.set([])
    shopStore.purchasedUpgrades.set([])
    shopStore.lastPurchaseTime.set(0)
  })

  test('initializes with empty state', () => {
    expect(shopStore.availableUpgrades.get()).toEqual([])
    expect(shopStore.purchasedUpgrades.get()).toEqual([])
    expect(shopStore.lastPurchaseTime.get()).toBe(0)
  })

  test('can set available upgrades', () => {
    const mockUpgrades = [mockUpgrade]

    shopStore.availableUpgrades.set(mockUpgrades)

    expect(shopStore.availableUpgrades.get()).toEqual(mockUpgrades)
  })

  test('tracks purchased upgrades', async () => {
    shopStore.purchasedUpgrades.push('upgrade-1')

    await waitFor(() => {
      expect(shopStore.purchasedUpgrades.get()).toContain('upgrade-1')
    })
  })

  test('updates last purchase time', async () => {
    const timestamp = Date.now()
    shopStore.lastPurchaseTime.set(timestamp)

    await waitFor(() => {
      expect(shopStore.lastPurchaseTime.get()).toBe(timestamp)
    })
  })

  test('allows multiple purchases tracking', async () => {
    shopStore.purchasedUpgrades.push('upgrade-1')
    shopStore.purchasedUpgrades.push('upgrade-2')
    shopStore.purchasedUpgrades.push('upgrade-3')

    await waitFor(() => {
      const purchased = shopStore.purchasedUpgrades.get()
      expect(purchased).toHaveLength(3)
      expect(purchased).toContain('upgrade-1')
      expect(purchased).toContain('upgrade-2')
      expect(purchased).toContain('upgrade-3')
    })
  })
})
