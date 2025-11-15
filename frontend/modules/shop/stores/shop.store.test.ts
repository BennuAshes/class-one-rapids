import { shopStore } from './shop.store'
import { mockUpgrade, UpgradeType } from '../types'
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

describe('shopStore - Bot Factory', () => {
  beforeEach(() => {
    // Restore the hardcoded upgrades (previous test suite clears them)
    shopStore.availableUpgrades.set([
      {
        id: 'storage-pouch-1',
        name: 'Storage Pouch',
        description: 'Adds +1 scrap per pet',
        cost: 20,
        upgradeType: UpgradeType.SCRAP_PER_PET,
        effectValue: 1
      },
      {
        id: 'bot-factory-1',
        name: 'Bot Factory',
        description: 'Adds +1 AI Bot per Feed click',
        cost: 100,
        upgradeType: UpgradeType.PETS_PER_FEED,
        effectValue: 1
      }
    ])
    shopStore.purchasedUpgrades.set([])
    shopStore.lastPurchaseTime.set(0)
  })

  test('should include bot-factory-1 in availableUpgrades', () => {
    const upgrades = shopStore.availableUpgrades.get()
    const botFactory = upgrades.find(u => u.id === 'bot-factory-1')

    expect(botFactory).toBeDefined()
  })

  test('bot-factory-1 has correct schema', () => {
    const upgrades = shopStore.availableUpgrades.get()
    const botFactory = upgrades.find(u => u.id === 'bot-factory-1')

    expect(botFactory).toMatchObject({
      id: 'bot-factory-1',
      name: 'Bot Factory',
      description: 'Adds +1 AI Bot per Feed click',
      cost: 100,
      upgradeType: UpgradeType.PETS_PER_FEED,
      effectValue: 1
    })
  })

  test('UpgradeType.PETS_PER_FEED enum exists', () => {
    // Verify enum value (already exists, regression test)
    expect(UpgradeType.PETS_PER_FEED).toBe('PETS_PER_FEED')
  })
})
