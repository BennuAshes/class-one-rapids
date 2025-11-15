import { useMemo } from 'react'
import { computed, type Observable } from '@legendapp/state'
import { shopStore } from './stores/shop.store'
import { UpgradeType } from './types'

interface UpgradeBonuses {
  scrapPerPet: number
  petsPerFeed: number
}

interface UseUpgradeBonusesReturn {
  bonuses$: Observable<UpgradeBonuses>
  scrapPerPetBonus$: Observable<number>
  petsPerFeedBonus$: Observable<number>
}

export function useUpgradeBonuses(): UseUpgradeBonusesReturn {
  return useMemo(() => {
    const bonuses$ = computed(() => {
      const purchasedIds = shopStore.purchasedUpgrades.get()
      const allUpgrades = shopStore.availableUpgrades.get()
      const ownedUpgrades = allUpgrades.filter(u => purchasedIds.includes(u.id))

      const scrapPerPet = ownedUpgrades
        .filter(u => u.upgradeType === UpgradeType.SCRAP_PER_PET)
        .reduce((sum, u) => sum + u.effectValue, 0)

      const petsPerFeed = ownedUpgrades
        .filter(u => u.upgradeType === UpgradeType.PETS_PER_FEED)
        .reduce((sum, u) => sum + u.effectValue, 0)

      return { scrapPerPet, petsPerFeed }
    })

    const scrapPerPetBonus$ = computed(() => bonuses$.get().scrapPerPet)
    const petsPerFeedBonus$ = computed(() => bonuses$.get().petsPerFeed)

    return { bonuses$, scrapPerPetBonus$, petsPerFeedBonus$ }
  }, [])
}
