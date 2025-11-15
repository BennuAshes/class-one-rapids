import { renderHook, waitFor } from '@testing-library/react-native'
import { useShopActions } from './useShopActions'
import { shopStore } from './stores/shop.store'
import { scrapStore } from '../scrap/stores/scrap.store'
import { UpgradeType, type Upgrade } from './types'

describe('useShopActions', () => {
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
    shopStore.purchasedUpgrades.set([])
    shopStore.availableUpgrades.set([STORAGE_POUCH])
    scrapStore.scrap.set(0)
  })

  test('purchaseUpgrade succeeds with sufficient scrap', async () => {
    scrapStore.scrap.set(25)

    const { result } = renderHook(() => useShopActions())
    const purchaseResult = result.current.purchaseUpgrade(STORAGE_POUCH.id)

    await waitFor(() => {
      expect(purchaseResult.success).toBe(true)
      expect(scrapStore.scrap.get()).toBe(5) // 25 - 20
      expect(shopStore.purchasedUpgrades.get()).toContain('storage-pouch-1')
    })
  })

  test('purchaseUpgrade fails with insufficient scrap', async () => {
    scrapStore.scrap.set(10)

    const { result } = renderHook(() => useShopActions())
    const purchaseResult = result.current.purchaseUpgrade(STORAGE_POUCH.id)

    await waitFor(() => {
      expect(purchaseResult.success).toBe(false)
      expect(purchaseResult.error).toBe('Insufficient scrap')
      expect(scrapStore.scrap.get()).toBe(10) // Unchanged
      expect(shopStore.purchasedUpgrades.get()).not.toContain('storage-pouch-1')
    })
  })

  test('purchaseUpgrade fails for already purchased upgrade', async () => {
    scrapStore.scrap.set(50)
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])

    const { result } = renderHook(() => useShopActions())
    const purchaseResult = result.current.purchaseUpgrade(STORAGE_POUCH.id)

    await waitFor(() => {
      expect(purchaseResult.success).toBe(false)
      expect(purchaseResult.error).toBe('Upgrade already purchased')
      expect(scrapStore.scrap.get()).toBe(50) // Unchanged
    })
  })

  test('purchaseUpgrade fails for non-existent upgrade', async () => {
    scrapStore.scrap.set(100)

    const { result } = renderHook(() => useShopActions())
    const purchaseResult = result.current.purchaseUpgrade('non-existent-id')

    await waitFor(() => {
      expect(purchaseResult.success).toBe(false)
      expect(purchaseResult.error).toBe('Upgrade not found')
      expect(scrapStore.scrap.get()).toBe(100) // Unchanged
    })
  })

  test('purchaseUpgrade updates lastPurchaseTime on success', async () => {
    scrapStore.scrap.set(25)
    const beforeTime = Date.now()

    const { result } = renderHook(() => useShopActions())
    result.current.purchaseUpgrade(STORAGE_POUCH.id)

    await waitFor(() => {
      const lastPurchaseTime = shopStore.lastPurchaseTime.get()
      expect(lastPurchaseTime).toBeGreaterThanOrEqual(beforeTime)
      expect(lastPurchaseTime).toBeLessThanOrEqual(Date.now())
    })
  })

  test('canAfford returns true with sufficient scrap', () => {
    scrapStore.scrap.set(25)

    const { result } = renderHook(() => useShopActions())
    const affordable = result.current.canAfford(STORAGE_POUCH.id)

    expect(affordable).toBe(true)
  })

  test('canAfford returns false with insufficient scrap', () => {
    scrapStore.scrap.set(10)

    const { result } = renderHook(() => useShopActions())
    const affordable = result.current.canAfford(STORAGE_POUCH.id)

    expect(affordable).toBe(false)
  })

  test('canAfford returns false for non-existent upgrade', () => {
    scrapStore.scrap.set(100)

    const { result } = renderHook(() => useShopActions())
    const affordable = result.current.canAfford('non-existent-id')

    expect(affordable).toBe(false)
  })

  test('isPurchased returns true for owned upgrade', () => {
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])

    const { result } = renderHook(() => useShopActions())
    const purchased = result.current.isPurchased(STORAGE_POUCH.id)

    expect(purchased).toBe(true)
  })

  test('isPurchased returns false for unowned upgrade', () => {
    shopStore.purchasedUpgrades.set([])

    const { result } = renderHook(() => useShopActions())
    const purchased = result.current.isPurchased(STORAGE_POUCH.id)

    expect(purchased).toBe(false)
  })
})
