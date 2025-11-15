import { renderHook, waitFor } from '@testing-library/react-native'
import { useUpgradeBonuses } from './useUpgradeBonuses'
import { shopStore } from './stores/shop.store'
import { UpgradeType, type Upgrade } from './types'

describe('useUpgradeBonuses', () => {
  beforeEach(() => {
    // Reset store state
    shopStore.purchasedUpgrades.set([])
    shopStore.availableUpgrades.set([])
  })

  test('returns zero bonus when no upgrades purchased', () => {
    const { result } = renderHook(() => useUpgradeBonuses())

    expect(result.current.scrapPerPetBonus$.get()).toBe(0)
    expect(result.current.bonuses$.get()).toEqual({
      scrapPerPet: 0,
      petsPerFeed: 0
    })
  })

  test('returns +1 bonus when Storage Pouch purchased', async () => {
    const STORAGE_POUCH: Upgrade = {
      id: 'storage-pouch-1',
      name: 'Storage Pouch',
      description: 'Adds +1 scrap per pet',
      cost: 20,
      upgradeType: UpgradeType.SCRAP_PER_PET,
      effectValue: 1
    }

    shopStore.availableUpgrades.set([STORAGE_POUCH])
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])

    const { result } = renderHook(() => useUpgradeBonuses())

    await waitFor(() => {
      expect(result.current.scrapPerPetBonus$.get()).toBe(1)
    })
  })

  test('sums multiple SCRAP_PER_PET upgrades', async () => {
    const upgrades: Upgrade[] = [
      {
        id: 'upgrade-1',
        name: 'Upgrade 1',
        description: 'Test',
        cost: 10,
        upgradeType: UpgradeType.SCRAP_PER_PET,
        effectValue: 1
      },
      {
        id: 'upgrade-2',
        name: 'Upgrade 2',
        description: 'Test',
        cost: 20,
        upgradeType: UpgradeType.SCRAP_PER_PET,
        effectValue: 2
      }
    ]

    shopStore.availableUpgrades.set(upgrades)
    shopStore.purchasedUpgrades.set(['upgrade-1', 'upgrade-2'])

    const { result } = renderHook(() => useUpgradeBonuses())

    await waitFor(() => {
      expect(result.current.scrapPerPetBonus$.get()).toBe(3) // 1 + 2
    })
  })

  test('ignores non-SCRAP_PER_PET upgrade types', async () => {
    const upgrades: Upgrade[] = [
      {
        id: 'scrap-upgrade',
        name: 'Scrap Upgrade',
        description: 'Test',
        cost: 10,
        upgradeType: UpgradeType.SCRAP_PER_PET,
        effectValue: 2
      },
      {
        id: 'pet-upgrade',
        name: 'Pet Upgrade',
        description: 'Test',
        cost: 20,
        upgradeType: UpgradeType.PETS_PER_FEED,
        effectValue: 5
      }
    ]

    shopStore.availableUpgrades.set(upgrades)
    shopStore.purchasedUpgrades.set(['scrap-upgrade', 'pet-upgrade'])

    const { result } = renderHook(() => useUpgradeBonuses())

    await waitFor(() => {
      expect(result.current.scrapPerPetBonus$.get()).toBe(2) // Only scrap-upgrade
    })
  })
})
