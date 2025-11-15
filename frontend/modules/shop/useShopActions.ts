import { useCallback } from 'react'
import { shopStore } from './stores/shop.store'
import { scrapStore } from '../scrap/stores/scrap.store'
import type { PurchaseResult } from './types'

interface UseShopActionsReturn {
  purchaseUpgrade: (upgradeId: string) => PurchaseResult
  canAfford: (upgradeId: string) => boolean
  isPurchased: (upgradeId: string) => boolean
}

export function useShopActions(): UseShopActionsReturn {
  const purchaseUpgrade = useCallback((upgradeId: string): PurchaseResult => {
    // Find the upgrade
    const upgrade = shopStore.availableUpgrades.get().find(u => u.id === upgradeId)
    if (!upgrade) {
      return { success: false, error: 'Upgrade not found' }
    }

    // Check if already purchased
    const alreadyPurchased = shopStore.purchasedUpgrades.get().includes(upgradeId)
    if (alreadyPurchased) {
      return { success: false, error: 'Upgrade already purchased' }
    }

    // Check if player can afford it
    const currentScrap = scrapStore.scrap.get()
    if (currentScrap < upgrade.cost) {
      return { success: false, error: 'Insufficient scrap' }
    }

    // Execute purchase (atomic transaction)
    scrapStore.scrap.set(currentScrap - upgrade.cost)
    shopStore.purchasedUpgrades.set([...shopStore.purchasedUpgrades.get(), upgradeId])
    shopStore.lastPurchaseTime.set(Date.now())

    return { success: true }
  }, [])

  const canAfford = useCallback((upgradeId: string): boolean => {
    const upgrade = shopStore.availableUpgrades.get().find(u => u.id === upgradeId)
    if (!upgrade) return false

    const currentScrap = scrapStore.scrap.get()
    return currentScrap >= upgrade.cost
  }, [])

  const isPurchased = useCallback((upgradeId: string): boolean => {
    return shopStore.purchasedUpgrades.get().includes(upgradeId)
  }, [])

  return {
    purchaseUpgrade,
    canAfford,
    isPurchased
  }
}
