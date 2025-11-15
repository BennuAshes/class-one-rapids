import { renderHook, waitFor } from '@testing-library/react-native'
import { useScrapGeneration } from './useScrapGeneration'
import { scrapStore } from '../stores/scrap.store'
import { shopStore } from '../../shop/stores/shop.store'
import { UpgradeType, type Upgrade } from '../../shop/types'
import { act } from 'react-test-renderer'

describe('useScrapGeneration with upgrades', () => {
  const STORAGE_POUCH: Upgrade = {
    id: 'storage-pouch-1',
    name: 'Storage Pouch',
    description: 'Adds +1 scrap per pet',
    cost: 20,
    upgradeType: UpgradeType.SCRAP_PER_PET,
    effectValue: 1
  }

  beforeEach(() => {
    // Reset stores
    scrapStore.scrap.set(0)
    scrapStore.lastTickTime.set(0)
    shopStore.purchasedUpgrades.set([])
    shopStore.availableUpgrades.set([STORAGE_POUCH])
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  test('generates base scrap without upgrades', async () => {
    jest.useFakeTimers()
    scrapStore.scrap.set(0)

    renderHook(() => useScrapGeneration(2)) // 2 pets

    // Advance 1 tick (1000ms)
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(2) // 2 pets × 1 scrap
    })

    jest.useRealTimers()
  })

  test('applies Storage Pouch bonus when purchased', async () => {
    jest.useFakeTimers()
    scrapStore.scrap.set(0)
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])

    renderHook(() => useScrapGeneration(2)) // 2 pets

    // Advance 1 tick (1000ms)
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(4) // 2 pets × (1 + 1) scrap
    })

    jest.useRealTimers()
  })

  test('applies multiple SCRAP_PER_PET upgrades', async () => {
    jest.useFakeTimers()

    const upgrades: Upgrade[] = [
      STORAGE_POUCH,
      {
        id: 'upgrade-2',
        name: 'Upgrade 2',
        description: 'Test',
        cost: 30,
        upgradeType: UpgradeType.SCRAP_PER_PET,
        effectValue: 2
      }
    ]

    scrapStore.scrap.set(0)
    shopStore.availableUpgrades.set(upgrades)
    shopStore.purchasedUpgrades.set(['storage-pouch-1', 'upgrade-2'])

    renderHook(() => useScrapGeneration(3)) // 3 pets

    // Advance 1 tick
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(12) // 3 pets × (1 + 1 + 2) scrap
    })

    jest.useRealTimers()
  })

  test('generation rate reflects upgrade bonuses', () => {
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])

    const { result } = renderHook(() => useScrapGeneration(5)) // 5 pets

    // Base rate: 5 pets × 1 = 5 scrap/sec
    // With Storage Pouch: 5 pets × (1 + 1) = 10 scrap/sec
    expect(result.current.generationRate$.get()).toBe(10)
  })

  test('does not generate scrap with 0 pets', async () => {
    jest.useFakeTimers()
    scrapStore.scrap.set(0)
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])

    renderHook(() => useScrapGeneration(0)) // 0 pets

    act(() => {
      jest.advanceTimersByTime(5000) // 5 ticks
    })

    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(0) // No generation
    })

    jest.useRealTimers()
  })
})
