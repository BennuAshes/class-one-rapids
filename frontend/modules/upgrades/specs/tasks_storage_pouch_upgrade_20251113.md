# Storage Pouch Upgrade - Implementation Tasks

## Document Metadata

- **Source TDD**: `tdd_storage_pouch_upgrade_20251113.md`
- **Generated**: 2025-11-13
- **Total Tasks**: 11 core tasks across 3 phases
- **Estimated Duration**: 5 days
- **Architecture Reference**: Feature-based organization per `@docs/architecture/organizing_expo_apps_by_feature_20250921_113000.md`

---

## Phase 1: Core Hooks & Purchase Logic [2 days]

_Duration: 2 days | Priority: P0 | Prerequisites: None_

**LEAN PRINCIPLE**: First task must deliver user-visible, testable functionality following TDD cycle (Red-Green-Refactor).

### Task 1.1: TDD - Implement useUpgradeBonuses Hook

**ROLE**: You are a senior React Native developer implementing upgrade bonus calculation using Test-Driven Development

**CONTEXT**: The TDD (Section 4) specifies a new `useUpgradeBonuses` hook that calculates total scrap-per-pet bonuses from purchased upgrades. This hook will be consumed by the existing `useScrapGeneration` hook to enhance generation rates. The shop store already exists with `purchasedUpgrades` array and `availableUpgrades` structure.

**OBJECTIVE**: Create the `useUpgradeBonuses` hook following strict TDD methodology (Red-Green-Refactor cycle) that computes upgrade bonuses from shop state.

**FILE LOCATIONS** (Following @docs/architecture/file-organization-patterns.md):
- Hook: `frontend/modules/shop/hooks/useUpgradeBonuses.ts`
- Hook Test: `frontend/modules/shop/hooks/useUpgradeBonuses.test.ts` (co-located)
- Import from existing: `frontend/modules/shop/stores/shop.store.ts`
- Import from existing: `frontend/modules/shop/types.ts`

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Tests First

```typescript
// frontend/modules/shop/hooks/useUpgradeBonuses.test.ts
import { renderHook, waitFor } from '@testing-library/react-native'
import { useUpgradeBonuses } from './useUpgradeBonuses'
import { shopStore } from '../stores/shop.store'
import { UpgradeType, type Upgrade } from '../types'

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
```

#### Step 2: GREEN - Minimal Implementation

```typescript
// frontend/modules/shop/hooks/useUpgradeBonuses.ts
import { useMemo } from 'react'
import { computed, type Observable } from '@legendapp/state'
import { shopStore } from '../stores/shop.store'
import { UpgradeType } from '../types'

interface UpgradeBonuses {
  scrapPerPet: number
  petsPerFeed: number
}

interface UseUpgradeBonusesReturn {
  bonuses$: Observable<UpgradeBonuses>
  scrapPerPetBonus$: Observable<number>
}

export function useUpgradeBonuses(): UseUpgradeBonusesReturn {
  return useMemo(() => {
    const bonuses$ = computed(() => {
      const purchasedIds = shopStore.purchasedUpgrades.get()
      const allUpgrades = shopStore.availableUpgrades.get()

      const ownedUpgrades = allUpgrades.filter(u =>
        purchasedIds.includes(u.id)
      )

      const scrapPerPet = ownedUpgrades
        .filter(u => u.upgradeType === UpgradeType.SCRAP_PER_PET)
        .reduce((sum, u) => sum + u.effectValue, 0)

      const petsPerFeed = ownedUpgrades
        .filter(u => u.upgradeType === UpgradeType.PETS_PER_FEED)
        .reduce((sum, u) => sum + u.effectValue, 0)

      return { scrapPerPet, petsPerFeed }
    })

    const scrapPerPetBonus$ = computed(() => bonuses$.get().scrapPerPet)

    return {
      bonuses$,
      scrapPerPetBonus$
    }
  }, [])
}
```

#### Step 3: REFACTOR - Improve Code Quality

- Extract bonus calculation logic if needed
- Add JSDoc comments
- Optimize observable dependencies
- Ensure all tests remain green

**ACCEPTANCE CRITERIA**:
- [ ] All tests written BEFORE implementation
- [ ] useUpgradeBonuses hook returns computed observables
- [ ] scrapPerPetBonus$ correctly sums SCRAP_PER_PET upgrades
- [ ] bonuses$ includes both scrapPerPet and petsPerFeed
- [ ] Hook uses useMemo to prevent recreation on re-renders
- [ ] All tests pass with 100% coverage for this hook
- [ ] No direct store mutations (read-only hook)

**DEPENDENCIES**: None (uses existing shop.store.ts and types.ts)
**DELIVERABLES**: Hook file, test file, passing tests
**ESTIMATED TIME**: 3 hours

---

### Task 1.2: TDD - Implement useShopActions Hook with Purchase Logic

**ROLE**: You are a senior React Native developer implementing shop purchase actions using Test-Driven Development

**CONTEXT**: The TDD (Section 4) specifies a `useShopActions` hook that handles purchase transactions, validation, and shop state initialization. This hook must validate purchases (sufficient funds, not already purchased), execute atomic transactions, and provide computed observables for UI state.

**OBJECTIVE**: Create the `useShopActions` hook following strict TDD methodology that manages shop actions and purchase flow.

**FILE LOCATIONS**:
- Hook: `frontend/modules/shop/hooks/useShopActions.ts`
- Hook Test: `frontend/modules/shop/hooks/useShopActions.test.ts` (co-located)
- Import existing: `frontend/modules/shop/stores/shop.store.ts`
- Import existing: `frontend/modules/scrap/stores/scrap.store.ts`
- Import existing: `frontend/modules/shop/types.ts`

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Tests First

```typescript
// frontend/modules/shop/hooks/useShopActions.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useShopActions } from './useShopActions'
import { shopStore } from '../stores/shop.store'
import { scrapStore } from '../../scrap/stores/scrap.store'
import { UpgradeType } from '../types'

describe('useShopActions', () => {
  beforeEach(() => {
    // Reset stores
    shopStore.availableUpgrades.set([])
    shopStore.purchasedUpgrades.set([])
    shopStore.lastPurchaseTime.set(0)
    scrapStore.scrap.set(0)
  })

  describe('initializeUpgrades', () => {
    test('initializes with Storage Pouch in available upgrades', () => {
      const { result } = renderHook(() => useShopActions())

      act(() => {
        result.current.actions.initializeUpgrades()
      })

      const upgrades = result.current.availableUpgrades$.get()
      expect(upgrades).toHaveLength(1)
      expect(upgrades[0]).toMatchObject({
        id: 'storage-pouch-1',
        name: 'Storage Pouch',
        cost: 20,
        upgradeType: UpgradeType.SCRAP_PER_PET,
        effectValue: 1
      })
    })
  })

  describe('purchase', () => {
    test('succeeds with sufficient scrap', async () => {
      scrapStore.scrap.set(30)
      const { result } = renderHook(() => useShopActions())

      act(() => {
        result.current.actions.initializeUpgrades()
      })

      const purchaseResult = await act(async () => {
        return await result.current.actions.purchase('storage-pouch-1')
      })

      await waitFor(() => {
        expect(purchaseResult.success).toBe(true)
        expect(scrapStore.scrap.get()).toBe(10) // 30 - 20
        expect(result.current.purchasedUpgrades$.get()).toContain('storage-pouch-1')
        expect(result.current.lastPurchaseTime$.get()).toBeGreaterThan(0)
      })
    })

    test('fails with insufficient funds', async () => {
      scrapStore.scrap.set(15) // Less than 20
      const { result } = renderHook(() => useShopActions())

      act(() => {
        result.current.actions.initializeUpgrades()
      })

      const purchaseResult = await act(async () => {
        return await result.current.actions.purchase('storage-pouch-1')
      })

      expect(purchaseResult.success).toBe(false)
      expect(purchaseResult.error).toBe('INSUFFICIENT_FUNDS')
      expect(scrapStore.scrap.get()).toBe(15) // Unchanged
      expect(result.current.purchasedUpgrades$.get()).not.toContain('storage-pouch-1')
    })

    test('fails when already purchased', async () => {
      scrapStore.scrap.set(50)
      shopStore.purchasedUpgrades.set(['storage-pouch-1'])
      const { result } = renderHook(() => useShopActions())

      act(() => {
        result.current.actions.initializeUpgrades()
      })

      const purchaseResult = await act(async () => {
        return await result.current.actions.purchase('storage-pouch-1')
      })

      expect(purchaseResult.success).toBe(false)
      expect(purchaseResult.error).toBe('ALREADY_PURCHASED')
      expect(scrapStore.scrap.get()).toBe(50) // Unchanged
    })

    test('fails with invalid upgrade ID', async () => {
      scrapStore.scrap.set(100)
      const { result } = renderHook(() => useShopActions())

      const purchaseResult = await act(async () => {
        return await result.current.actions.purchase('invalid-id')
      })

      expect(purchaseResult.success).toBe(false)
      expect(purchaseResult.error).toBe('INVALID_UPGRADE')
    })
  })

  describe('computed observables', () => {
    test('isPurchased$ returns true for owned upgrades', async () => {
      shopStore.purchasedUpgrades.set(['storage-pouch-1'])
      const { result } = renderHook(() => useShopActions())

      act(() => {
        result.current.actions.initializeUpgrades()
      })

      const isPurchased$ = result.current.isPurchased$('storage-pouch-1')
      expect(isPurchased$.get()).toBe(true)
    })

    test('isAffordable$ returns true when sufficient scrap', () => {
      scrapStore.scrap.set(25)
      const { result } = renderHook(() => useShopActions())

      act(() => {
        result.current.actions.initializeUpgrades()
      })

      const isAffordable$ = result.current.isAffordable$('storage-pouch-1')
      expect(isAffordable$.get()).toBe(true)
    })

    test('isAffordable$ returns false when insufficient scrap', () => {
      scrapStore.scrap.set(15)
      const { result } = renderHook(() => useShopActions())

      act(() => {
        result.current.actions.initializeUpgrades()
      })

      const isAffordable$ = result.current.isAffordable$('storage-pouch-1')
      expect(isAffordable$.get()).toBe(false)
    })
  })
})
```

#### Step 2: GREEN - Minimal Implementation

```typescript
// frontend/modules/shop/hooks/useShopActions.ts
import { useMemo } from 'react'
import { computed, type Observable } from '@legendapp/state'
import { shopStore } from '../stores/shop.store'
import { scrapStore } from '../../scrap/stores/scrap.store'
import { UpgradeType, type Upgrade, type PurchaseResult } from '../types'

interface UseShopActionsReturn {
  availableUpgrades$: Observable<Upgrade[]>
  purchasedUpgrades$: Observable<string[]>
  lastPurchaseTime$: Observable<number>
  isPurchased$: (upgradeId: string) => Observable<boolean>
  isAffordable$: (upgradeId: string) => Observable<boolean>
  actions: {
    purchase: (upgradeId: string) => Promise<PurchaseResult>
    initializeUpgrades: () => void
  }
}

const STORAGE_POUCH_UPGRADE: Upgrade = {
  id: 'storage-pouch-1',
  name: 'Storage Pouch',
  description: 'Adds +1 scrap per pet',
  cost: 20,
  upgradeType: UpgradeType.SCRAP_PER_PET,
  effectValue: 1
}

export function useShopActions(): UseShopActionsReturn {
  return useMemo(() => {
    const initializeUpgrades = () => {
      shopStore.availableUpgrades.set([STORAGE_POUCH_UPGRADE])
    }

    const purchase = async (upgradeId: string): Promise<PurchaseResult> => {
      const availableUpgrades = shopStore.availableUpgrades.get()
      const purchasedUpgrades = shopStore.purchasedUpgrades.get()
      const currentScrap = scrapStore.scrap.get()

      // Find upgrade
      const upgrade = availableUpgrades.find(u => u.id === upgradeId)
      if (!upgrade) {
        return {
          success: false,
          error: 'INVALID_UPGRADE',
          upgradeId,
          timestamp: Date.now()
        }
      }

      // Check if already purchased
      if (purchasedUpgrades.includes(upgradeId)) {
        return {
          success: false,
          error: 'ALREADY_PURCHASED',
          upgradeId,
          timestamp: Date.now()
        }
      }

      // Check sufficient funds
      if (currentScrap < upgrade.cost) {
        return {
          success: false,
          error: 'INSUFFICIENT_FUNDS',
          upgradeId,
          timestamp: Date.now()
        }
      }

      // Execute atomic transaction
      const timestamp = Date.now()
      scrapStore.scrap.set(currentScrap - upgrade.cost)
      shopStore.purchasedUpgrades.push(upgradeId)
      shopStore.lastPurchaseTime.set(timestamp)

      return {
        success: true,
        upgradeId,
        timestamp
      }
    }

    const isPurchased$ = (upgradeId: string) =>
      computed(() => shopStore.purchasedUpgrades.get().includes(upgradeId))

    const isAffordable$ = (upgradeId: string) =>
      computed(() => {
        const upgrade = shopStore.availableUpgrades.get().find(u => u.id === upgradeId)
        if (!upgrade) return false
        return scrapStore.scrap.get() >= upgrade.cost
      })

    return {
      availableUpgrades$: shopStore.availableUpgrades,
      purchasedUpgrades$: shopStore.purchasedUpgrades,
      lastPurchaseTime$: shopStore.lastPurchaseTime,
      isPurchased$,
      isAffordable$,
      actions: {
        purchase,
        initializeUpgrades
      }
    }
  }, [])
}
```

#### Step 3: REFACTOR - Improve Code Quality

- Extract validation functions
- Add JSDoc comments
- Optimize observable dependencies
- Consider transaction rollback on errors (future)

**ACCEPTANCE CRITERIA**:
- [ ] All tests written BEFORE implementation
- [ ] Purchase validates: upgrade exists, not purchased, sufficient funds
- [ ] Purchase executes atomic transaction (scrap deduction + add to purchased + timestamp)
- [ ] Failed purchases return appropriate error codes
- [ ] Successful purchases return success with timestamp
- [ ] isPurchased$ and isAffordable$ computed observables work correctly
- [ ] initializeUpgrades populates Storage Pouch
- [ ] All tests pass with >90% coverage
- [ ] No state mutations outside transaction

**DEPENDENCIES**: Task 1.1 (same module)
**DELIVERABLES**: Hook file, test file, passing tests
**ESTIMATED TIME**: 4 hours

---

### Task 1.3: TDD - Integrate Upgrade Bonuses into Scrap Generation

**ROLE**: You are a senior React Native developer integrating upgrade bonuses into the existing scrap generation system

**CONTEXT**: The TDD (Section 3, Data Flow) specifies that `useScrapGeneration` must call `useUpgradeBonuses` to calculate enhanced scrap per tick. Current base rate is `petCount × 1`. With upgrades, it becomes `petCount × (1 + totalUpgradeBonus)`. The existing hook uses `setInterval` for ticks.

**OBJECTIVE**: Modify the existing `useScrapGeneration` hook to apply upgrade bonuses to scrap calculation, following TDD methodology.

**FILE LOCATIONS**:
- Modify: `frontend/modules/scrap/hooks/useScrapGeneration.ts`
- Modify Test: `frontend/modules/scrap/hooks/useScrapGeneration.test.ts` (or create if missing)
- Import from: `frontend/modules/shop/hooks/useUpgradeBonuses.ts` (Task 1.1)

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Integration Tests First

```typescript
// Add to frontend/modules/scrap/hooks/useScrapGeneration.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useScrapGeneration } from './useScrapGeneration'
import { scrapStore } from '../stores/scrap.store'
import { shopStore } from '../../shop/stores/shop.store'
import { UpgradeType } from '../../shop/types'

describe('useScrapGeneration with upgrades', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    scrapStore.scrap.set(0)
    shopStore.purchasedUpgrades.set([])
    shopStore.availableUpgrades.set([])
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('generates base rate without upgrades', () => {
    const petCount = 3
    renderHook(() => useScrapGeneration(petCount))

    act(() => {
      jest.advanceTimersByTime(1000) // 1 tick
    })

    expect(scrapStore.scrap.get()).toBe(3) // 3 pets × 1 scrap/pet
  })

  test('applies Storage Pouch bonus to generation', async () => {
    const STORAGE_POUCH = {
      id: 'storage-pouch-1',
      name: 'Storage Pouch',
      description: 'Test',
      cost: 20,
      upgradeType: UpgradeType.SCRAP_PER_PET,
      effectValue: 1
    }

    shopStore.availableUpgrades.set([STORAGE_POUCH])
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])

    const petCount = 3
    renderHook(() => useScrapGeneration(petCount))

    act(() => {
      jest.advanceTimersByTime(1000) // 1 tick
    })

    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(6) // 3 pets × (1 + 1) = 6
    })
  })

  test('bonus applies immediately after purchase', async () => {
    scrapStore.scrap.set(30)
    const STORAGE_POUCH = {
      id: 'storage-pouch-1',
      name: 'Storage Pouch',
      description: 'Test',
      cost: 20,
      upgradeType: UpgradeType.SCRAP_PER_PET,
      effectValue: 1
    }

    shopStore.availableUpgrades.set([STORAGE_POUCH])

    const petCount = 2
    renderHook(() => useScrapGeneration(petCount))

    // Before purchase: 2 pets × 1 = 2 scrap/tick
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    await waitFor(() => expect(scrapStore.scrap.get()).toBe(32)) // 30 + 2

    // Simulate purchase
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])
    scrapStore.scrap.set(12) // 32 - 20 (cost)

    // After purchase: 2 pets × 2 = 4 scrap/tick
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(16) // 12 + 4
    })
  })

  test('respects SCRAP_CONSTRAINTS.MAX_SCRAP ceiling with bonuses', async () => {
    const { SCRAP_CONSTRAINTS } = await import('../types')

    shopStore.availableUpgrades.set([{
      id: 'storage-pouch-1',
      name: 'Storage Pouch',
      description: 'Test',
      cost: 20,
      upgradeType: UpgradeType.SCRAP_PER_PET,
      effectValue: 1
    }])
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])

    scrapStore.scrap.set(SCRAP_CONSTRAINTS.MAX_SCRAP - 3)

    const petCount = 10 // Would generate 20 scrap/tick
    renderHook(() => useScrapGeneration(petCount))

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(SCRAP_CONSTRAINTS.MAX_SCRAP) // Capped
    })
  })
})
```

#### Step 2: GREEN - Modify Existing Implementation

```typescript
// Modify frontend/modules/scrap/hooks/useScrapGeneration.ts
import { useEffect, useMemo } from 'react'
import { computed, Observable } from '@legendapp/state'
import { scrapStore } from '../stores/scrap.store'
import { SCRAP_CONSTRAINTS } from '../types'
import { validateScrap } from '../utils/scrapValidation'
import { useUpgradeBonuses } from '../../shop/hooks/useUpgradeBonuses' // NEW IMPORT

export interface UseScrapGenerationReturn {
  scrap$: Observable<number>
  generationRate$: Observable<number> // scrap per second
}

export function useScrapGeneration(petCount: number): UseScrapGenerationReturn {
  // NEW: Get upgrade bonuses
  const { scrapPerPetBonus$ } = useUpgradeBonuses()

  // Start tick timer when component mounts and app is active
  useEffect(() => {
    // Only run timer if there are pets
    if (petCount <= 0) {
      return
    }

    // Set up tick interval
    const intervalId = setInterval(() => {
      const baseRate = 1 // Base scrap per pet per tick
      const totalBonus = scrapPerPetBonus$.get() // NEW: Get current bonus
      const scrapPerPet = baseRate + totalBonus // NEW: Apply bonus

      const scrapGained = petCount * scrapPerPet // MODIFIED: Use enhanced rate
      const currentScrap = scrapStore.scrap.get()
      const newScrap = validateScrap(currentScrap + scrapGained)

      scrapStore.scrap.set(newScrap)
      scrapStore.lastTickTime.set(Date.now())
    }, SCRAP_CONSTRAINTS.TICK_INTERVAL_MS)

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [petCount, scrapPerPetBonus$]) // MODIFIED: Add scrapPerPetBonus$ to deps

  // Computed generation rate (scrap per second)
  const generationRate$ = useMemo(() =>
    computed(() => {
      const baseRate = 1
      const totalBonus = scrapPerPetBonus$.get() // NEW: Include bonus in rate calculation
      const scrapPerPet = baseRate + totalBonus
      return (petCount * scrapPerPet) / (SCRAP_CONSTRAINTS.TICK_INTERVAL_MS / 1000)
    })
  , [petCount, scrapPerPetBonus$]) // MODIFIED: Add scrapPerPetBonus$ to deps

  return useMemo(() => ({
    scrap$: scrapStore.scrap,
    generationRate$
  }), [generationRate$])
}
```

#### Step 3: REFACTOR - Improve Code Quality

- Extract rate calculation logic
- Add JSDoc comments
- Optimize observable dependencies
- Ensure all tests remain green

**ACCEPTANCE CRITERIA**:
- [ ] Integration tests written BEFORE modification
- [ ] useScrapGeneration calls useUpgradeBonuses
- [ ] Base generation works: petCount × 1 scrap/tick
- [ ] Enhanced generation works: petCount × (1 + bonus) scrap/tick
- [ ] Bonus applies immediately when upgrades change
- [ ] SCRAP_CONSTRAINTS.MAX_SCRAP ceiling respected
- [ ] generationRate$ computed observable includes bonus
- [ ] All existing tests still pass
- [ ] New integration tests pass
- [ ] No breaking changes to existing functionality

**DEPENDENCIES**: Task 1.1 (useUpgradeBonuses), Task 1.2 (shop actions)
**DELIVERABLES**: Modified hook file, integration tests, passing tests
**ESTIMATED TIME**: 3 hours

---

## Phase 2: UI Components [2 days]

_Duration: 2 days | Priority: P0 | Prerequisites: Phase 1_

**LEAN PRINCIPLE**: Build user-facing components that demonstrate the working purchase flow.

### Task 2.1: TDD - Implement UpgradeItem Component

**ROLE**: You are a senior React Native UI developer implementing the upgrade card component using Test-Driven Development

**CONTEXT**: The TDD (Section 3, Component Design) specifies an `UpgradeItem` component that displays a single upgrade with name, description, cost, and purchase button. It must show affordability state, purchased badge, and meet accessibility requirements (44×44pt touch targets, screen reader labels).

**OBJECTIVE**: Create the `UpgradeItem` component following strict TDD methodology with full accessibility support.

**FILE LOCATIONS**:
- Component: `frontend/modules/shop/components/UpgradeItem.tsx`
- Component Test: `frontend/modules/shop/components/UpgradeItem.test.tsx` (co-located)
- Import from: `frontend/modules/shop/types.ts`

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Component Tests First

```typescript
// frontend/modules/shop/components/UpgradeItem.test.tsx
import React from 'react'
import { render, screen, userEvent } from '@testing-library/react-native'
import { observable } from '@legendapp/state'
import { UpgradeItem } from './UpgradeItem'
import { UpgradeType, type Upgrade } from '../types'

describe('UpgradeItem', () => {
  const mockUpgrade: Upgrade = {
    id: 'storage-pouch-1',
    name: 'Storage Pouch',
    description: 'Adds +1 scrap per pet',
    cost: 20,
    upgradeType: UpgradeType.SCRAP_PER_PET,
    effectValue: 1
  }

  describe('Rendering', () => {
    test('renders upgrade name and description', () => {
      const upgrade$ = observable(mockUpgrade)
      const isPurchased$ = observable(false)
      const isAffordable$ = observable(true)

      render(
        <UpgradeItem
          upgrade$={upgrade$}
          isPurchased$={isPurchased$}
          isAffordable$={isAffordable$}
          onPurchase={() => Promise.resolve()}
        />
      )

      expect(screen.getByText('Storage Pouch')).toBeTruthy()
      expect(screen.getByText('Adds +1 scrap per pet')).toBeTruthy()
    })

    test('shows cost in purchase button', () => {
      const upgrade$ = observable(mockUpgrade)
      const isPurchased$ = observable(false)
      const isAffordable$ = observable(true)

      render(
        <UpgradeItem
          upgrade$={upgrade$}
          isPurchased$={isPurchased$}
          isAffordable$={isAffordable$}
          onPurchase={() => Promise.resolve()}
        />
      )

      expect(screen.getByText(/20.*scrap/i)).toBeTruthy()
    })

    test('shows effect description', () => {
      const upgrade$ = observable(mockUpgrade)
      const isPurchased$ = observable(false)
      const isAffordable$ = observable(true)

      render(
        <UpgradeItem
          upgrade$={upgrade$}
          isPurchased$={isPurchased$}
          isAffordable$={isAffordable$}
          onPurchase={() => Promise.resolve()}
        />
      )

      expect(screen.getByText(/\+1 scrap per pet/i)).toBeTruthy()
    })
  })

  describe('Purchase Button States', () => {
    test('enables button when affordable and not purchased', () => {
      const upgrade$ = observable(mockUpgrade)
      const isPurchased$ = observable(false)
      const isAffordable$ = observable(true)

      render(
        <UpgradeItem
          upgrade$={upgrade$}
          isPurchased$={isPurchased$}
          isAffordable$={isAffordable$}
          onPurchase={() => Promise.resolve()}
        />
      )

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    test('disables button when not affordable', () => {
      const upgrade$ = observable(mockUpgrade)
      const isPurchased$ = observable(false)
      const isAffordable$ = observable(false)

      render(
        <UpgradeItem
          upgrade$={upgrade$}
          isPurchased$={isPurchased$}
          isAffordable$={isAffordable$}
          onPurchase={() => Promise.resolve()}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    test('disables button and shows purchased badge when owned', () => {
      const upgrade$ = observable(mockUpgrade)
      const isPurchased$ = observable(true)
      const isAffordable$ = observable(true)

      render(
        <UpgradeItem
          upgrade$={upgrade$}
          isPurchased$={isPurchased$}
          isAffordable$={isAffordable$}
          onPurchase={() => Promise.resolve()}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(screen.getByText(/purchased|owned/i)).toBeTruthy()
    })
  })

  describe('Interactions', () => {
    test('calls onPurchase when button pressed', async () => {
      const onPurchase = jest.fn(() => Promise.resolve())
      const upgrade$ = observable(mockUpgrade)
      const isPurchased$ = observable(false)
      const isAffordable$ = observable(true)

      render(
        <UpgradeItem
          upgrade$={upgrade$}
          isPurchased$={isPurchased$}
          isAffordable$={isAffordable$}
          onPurchase={onPurchase}
        />
      )

      const user = userEvent.setup()
      const button = screen.getByRole('button')
      await user.press(button)

      expect(onPurchase).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    test('purchase button meets touch target size', () => {
      const upgrade$ = observable(mockUpgrade)
      const isPurchased$ = observable(false)
      const isAffordable$ = observable(true)

      render(
        <UpgradeItem
          upgrade$={upgrade$}
          isPurchased$={isPurchased$}
          isAffordable$={isAffordable$}
          onPurchase={() => Promise.resolve()}
        />
      )

      const button = screen.getByTestId('purchase-button')
      const style = Array.isArray(button.props.style)
        ? Object.assign({}, ...button.props.style)
        : button.props.style

      expect(style.minWidth).toBeGreaterThanOrEqual(44)
      expect(style.minHeight).toBeGreaterThanOrEqual(44)
    })

    test('button has accessibility label', () => {
      const upgrade$ = observable(mockUpgrade)
      const isPurchased$ = observable(false)
      const isAffordable$ = observable(true)

      render(
        <UpgradeItem
          upgrade$={upgrade$}
          isPurchased$={isPurchased$}
          isAffordable$={isAffordable$}
          onPurchase={() => Promise.resolve()}
        />
      )

      const button = screen.getByRole('button')
      expect(button.props.accessibilityLabel).toContain('Storage Pouch')
      expect(button.props.accessibilityLabel).toContain('20 scrap')
    })

    test('insufficient funds state has accessibility hint', () => {
      const upgrade$ = observable(mockUpgrade)
      const isPurchased$ = observable(false)
      const isAffordable$ = observable(false)

      render(
        <UpgradeItem
          upgrade$={upgrade$}
          isPurchased$={isPurchased$}
          isAffordable$={isAffordable$}
          onPurchase={() => Promise.resolve()}
        />
      )

      const button = screen.getByRole('button')
      expect(button.props.accessibilityHint).toMatch(/not enough scrap|cannot afford/i)
    })
  })
})
```

#### Step 2: GREEN - Minimal Implementation

```typescript
// frontend/modules/shop/components/UpgradeItem.tsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { observer, Memo } from '@legendapp/state/react'
import type { Observable } from '@legendapp/state'
import type { Upgrade } from '../types'

interface UpgradeItemProps {
  upgrade$: Observable<Upgrade>
  isPurchased$: Observable<boolean>
  isAffordable$: Observable<boolean>
  onPurchase: () => Promise<void>
}

export const UpgradeItem = observer(({
  upgrade$,
  isPurchased$,
  isAffordable$,
  onPurchase
}: UpgradeItemProps) => {
  const upgrade = upgrade$.get()
  const isPurchased = isPurchased$.get()
  const isAffordable = isAffordable$.get()

  const isDisabled = isPurchased || !isAffordable

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.name}>{upgrade.name}</Text>
        <Text style={styles.description}>{upgrade.description}</Text>

        {isPurchased && (
          <View style={styles.purchasedBadge}>
            <Text style={styles.purchasedText}>Purchased</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        testID="purchase-button"
        role="button"
        style={[
          styles.button,
          isDisabled && styles.buttonDisabled
        ]}
        onPress={onPurchase}
        disabled={isDisabled}
        accessibilityLabel={`Purchase ${upgrade.name} for ${upgrade.cost} scrap`}
        accessibilityHint={
          isPurchased
            ? 'Already purchased'
            : !isAffordable
            ? 'Not enough scrap to purchase'
            : `Tap to purchase ${upgrade.name}`
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        <Memo>
          {() => (
            <Text style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}>
              {isPurchased ? 'Owned' : `Purchase (${upgrade.cost} scrap)`}
            </Text>
          )}
        </Memo>
      </TouchableOpacity>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  purchasedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  purchasedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // WCAG touch target
    minWidth: 44,   // WCAG touch target
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#999999',
  },
})
```

#### Step 3: REFACTOR - Improve Code Quality

- Extract styles to theme if needed
- Optimize observable access
- Add visual polish (icons, animations)
- Ensure all tests remain green

**VISUAL REQUIREMENTS**:

| Property | Value | Notes |
|----------|-------|-------|
| **Card Background** | #FFFFFF | White |
| **Card Border Radius** | 8px | Rounded corners |
| **Card Padding** | 16px | Internal spacing |
| **Card Shadow** | 0px 2px 4px rgba(0,0,0,0.1) | Subtle elevation |
| **Name Font Size** | 18px, weight 700 | Bold title |
| **Description Font** | 14px, color #666666 | Gray body text |
| **Button Min Size** | 44×44px | WCAG touch target |
| **Button Background** | #007AFF (enabled), #CCCCCC (disabled) | iOS blue / gray |
| **Purchased Badge** | #4CAF50 background, white text | Green success color |
| **Disabled Opacity** | 0.6 | Visual disabled state |

**ACCEPTANCE CRITERIA**:
- [ ] All tests written BEFORE implementation
- [ ] Component renders name, description, cost
- [ ] Purchase button enables/disables based on affordability and ownership
- [ ] Purchased badge displays when owned
- [ ] Button meets 44×44pt minimum touch target
- [ ] Button has clear accessibility labels and hints
- [ ] onPurchase callback fires on button press
- [ ] Fine-grained reactivity (only affected parts update)
- [ ] All tests pass with 100% coverage
- [ ] WCAG 2.1 AA compliance verified

**DEPENDENCIES**: Task 1.2 (shop types and observables)
**DELIVERABLES**: Component file, test file, passing tests
**ESTIMATED TIME**: 4 hours

---

### Task 2.2: TDD - Implement UpgradeList Component and Integrate into ShopScreen

**ROLE**: You are a senior React Native developer implementing the upgrade list and integrating it into the existing shop screen

**CONTEXT**: The TDD (Section 3) specifies an `UpgradeList` component that renders multiple `UpgradeItem` components. This list will be integrated into the existing `ShopScreen.tsx` to replace the `EmptyState` component. The ShopScreen already has a header with scrap balance and back button.

**OBJECTIVE**: Create the `UpgradeList` component and integrate it into `ShopScreen`, following TDD methodology.

**FILE LOCATIONS**:
- Component: `frontend/modules/shop/components/UpgradeList.tsx`
- Component Test: `frontend/modules/shop/components/UpgradeList.test.tsx` (co-located)
- Modify: `frontend/modules/shop/ShopScreen.tsx` (existing)
- Modify Test: `frontend/modules/shop/ShopScreen.test.tsx` (existing)

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Component Tests First

```typescript
// frontend/modules/shop/components/UpgradeList.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { observable } from '@legendapp/state'
import { UpgradeList } from './UpgradeList'
import { UpgradeType, type Upgrade } from '../types'

describe('UpgradeList', () => {
  const mockUpgrades: Upgrade[] = [
    {
      id: 'storage-pouch-1',
      name: 'Storage Pouch',
      description: 'Adds +1 scrap per pet',
      cost: 20,
      upgradeType: UpgradeType.SCRAP_PER_PET,
      effectValue: 1
    }
  ]

  test('renders all upgrades', () => {
    const upgrades$ = observable(mockUpgrades)
    const purchasedIds$ = observable<string[]>([])
    const currentScrap$ = observable(25)

    render(
      <UpgradeList
        upgrades$={upgrades$}
        purchasedIds$={purchasedIds$}
        currentScrap$={currentScrap$}
        onPurchase={() => Promise.resolve({ success: true })}
      />
    )

    expect(screen.getByText('Storage Pouch')).toBeTruthy()
    expect(screen.getByText('Adds +1 scrap per pet')).toBeTruthy()
  })

  test('shows empty state when no upgrades', () => {
    const upgrades$ = observable<Upgrade[]>([])
    const purchasedIds$ = observable<string[]>([])
    const currentScrap$ = observable(0)

    render(
      <UpgradeList
        upgrades$={upgrades$}
        purchasedIds$={purchasedIds$}
        currentScrap$={currentScrap$}
        onPurchase={() => Promise.resolve({ success: true })}
      />
    )

    expect(screen.getByText(/no upgrades available/i)).toBeTruthy()
  })

  test('passes correct props to UpgradeItem', () => {
    const upgrades$ = observable(mockUpgrades)
    const purchasedIds$ = observable<string[]>([])
    const currentScrap$ = observable(25)
    const onPurchase = jest.fn(() => Promise.resolve({ success: true }))

    render(
      <UpgradeList
        upgrades$={upgrades$}
        purchasedIds$={purchasedIds$}
        currentScrap$={currentScrap$}
        onPurchase={onPurchase}
      />
    )

    // Verify UpgradeItem renders (we'll test interactions separately)
    expect(screen.getByRole('button')).toBeTruthy()
  })
})
```

```typescript
// Add to frontend/modules/shop/ShopScreen.test.tsx
describe('ShopScreen with UpgradeList', () => {
  beforeEach(() => {
    scrapStore.scrap.set(25)
    shopStore.purchasedUpgrades.set([])
  })

  test('displays upgrade list when upgrades available', () => {
    render(<ShopScreen />)

    // Initialize upgrades (will be done in useEffect)
    act(() => {
      shopStore.availableUpgrades.set([{
        id: 'storage-pouch-1',
        name: 'Storage Pouch',
        description: 'Adds +1 scrap per pet',
        cost: 20,
        upgradeType: UpgradeType.SCRAP_PER_PET,
        effectValue: 1
      }])
    })

    expect(screen.getByText('Storage Pouch')).toBeTruthy()
  })

  test('complete purchase flow updates UI', async () => {
    scrapStore.scrap.set(25)
    render(<ShopScreen />)

    act(() => {
      shopStore.availableUpgrades.set([{
        id: 'storage-pouch-1',
        name: 'Storage Pouch',
        description: 'Adds +1 scrap per pet',
        cost: 20,
        upgradeType: UpgradeType.SCRAP_PER_PET,
        effectValue: 1
      }])
    })

    // Verify initial state
    expect(screen.getByText(/scrap: 25/i)).toBeTruthy()

    const purchaseButton = screen.getByRole('button', { name: /purchase.*storage pouch/i })
    expect(purchaseButton).not.toBeDisabled()

    // Tap purchase button
    const user = userEvent.setup()
    await user.press(purchaseButton)

    // Wait for purchase to complete
    await waitFor(() => {
      expect(screen.getByText(/scrap: 5/i)).toBeTruthy() // 25 - 20
      expect(screen.getByText(/purchased|owned/i)).toBeTruthy()
      expect(purchaseButton).toBeDisabled()
    })
  })
})
```

#### Step 2: GREEN - Implementation

```typescript
// frontend/modules/shop/components/UpgradeList.tsx
import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { observer, For } from '@legendapp/state/react'
import { computed, type Observable } from '@legendapp/state'
import { UpgradeItem } from './UpgradeItem'
import type { Upgrade, PurchaseResult } from '../types'

interface UpgradeListProps {
  upgrades$: Observable<Upgrade[]>
  purchasedIds$: Observable<string[]>
  currentScrap$: Observable<number>
  onPurchase: (upgradeId: string) => Promise<PurchaseResult>
}

export const UpgradeList = observer(({
  upgrades$,
  purchasedIds$,
  currentScrap$,
  onPurchase
}: UpgradeListProps) => {
  const upgrades = upgrades$.get()

  if (upgrades.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No upgrades available</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <For each={upgrades$}>
        {(upgrade$, index) => {
          const upgradeId = upgrade$.id.get()

          const isPurchased$ = computed(() =>
            purchasedIds$.get().includes(upgradeId)
          )

          const isAffordable$ = computed(() =>
            currentScrap$.get() >= upgrade$.cost.get()
          )

          return (
            <UpgradeItem
              key={upgradeId}
              upgrade$={upgrade$}
              isPurchased$={isPurchased$}
              isAffordable$={isAffordable$}
              onPurchase={() => onPurchase(upgradeId)}
            />
          )
        }}
      </For>
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
})
```

```typescript
// Modify frontend/modules/shop/ShopScreen.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { observer } from '@legendapp/state/react'
import { scrapStore } from '../scrap/stores/scrap.store'
import { useShopActions } from './hooks/useShopActions' // NEW IMPORT
import { UpgradeList } from './components/UpgradeList' // NEW IMPORT

export const ShopScreen = observer(({ onBack }: { onBack?: () => void } = {}) => {
  const scrap = scrapStore.scrap.get()

  // NEW: Get shop actions
  const {
    availableUpgrades$,
    purchasedUpgrades$,
    actions
  } = useShopActions()

  // NEW: Initialize upgrades on mount
  useEffect(() => {
    actions.initializeUpgrades()
  }, [actions])

  // NEW: Purchase handler
  const handlePurchase = async (upgradeId: string) => {
    const result = await actions.purchase(upgradeId)
    // TODO: Show error toast if purchase fails (future iteration)
    return result
  }

  return (
    <View testID="shop-screen" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {onBack && (
            <TouchableOpacity
              testID="back-button"
              style={styles.backButton}
              onPress={onBack}
              accessibilityLabel="Back button"
              accessibilityHint="Return to main screen"
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Shop</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.scrapBalance}>Scrap: {scrap}</Text>
      </View>

      {/* MODIFIED: Replace EmptyState with UpgradeList */}
      <UpgradeList
        upgrades$={availableUpgrades$}
        purchasedIds$={purchasedUpgrades$}
        currentScrap$={scrapStore.scrap}
        onPurchase={handlePurchase}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 68,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  scrapBalance: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
})
```

#### Step 3: REFACTOR - Improve Code Quality

- Optimize ScrollView performance
- Consider FlatList migration for future scalability
- Extract styles to theme
- Add error handling UI

**ACCEPTANCE CRITERIA**:
- [ ] All tests written BEFORE implementation
- [ ] UpgradeList renders all upgrades using For loop
- [ ] UpgradeList shows empty state when no upgrades
- [ ] UpgradeList passes correct props to UpgradeItem
- [ ] ShopScreen initializes upgrades on mount
- [ ] ShopScreen renders UpgradeList (replaces EmptyState)
- [ ] ShopScreen handles purchase action
- [ ] Complete purchase flow works end-to-end
- [ ] UI updates reactively after purchase
- [ ] All tests pass with >90% coverage
- [ ] No console errors or warnings

**DEPENDENCIES**: Task 2.1 (UpgradeItem), Task 1.2 (useShopActions)
**DELIVERABLES**: UpgradeList component, modified ShopScreen, tests
**ESTIMATED TIME**: 3 hours

---

## Phase 3: Testing, Polish & Documentation [1 day]

_Duration: 1 day | Priority: P0 | Prerequisites: Phase 2_

**LEAN PRINCIPLE**: Ensure quality, performance, and accessibility before delivery.

### Task 3.1: Integration Testing & Coverage Analysis

**ROLE**: You are a QA engineer validating the complete upgrade purchase system

**CONTEXT**: All components and hooks are implemented. Now we need comprehensive integration tests to verify the end-to-end flow and achieve >80% code coverage.

**OBJECTIVE**: Write integration tests, analyze coverage, and fill gaps.

**TEST SCENARIOS**:

1. **Complete Purchase Flow**
   - User accumulates scrap
   - Navigates to shop
   - Views Storage Pouch upgrade
   - Purchases upgrade (scrap deducted, ownership recorded)
   - Returns to gameplay
   - Sees enhanced scrap generation

2. **Edge Cases**
   - Multiple rapid purchase attempts (button disabled during transaction)
   - Purchase at MAX_SCRAP ceiling
   - Purchase with exactly 20 scrap
   - App restart persistence verification

3. **Error Scenarios**
   - Insufficient funds prevents purchase
   - Already purchased prevents duplicate
   - Invalid upgrade ID handled gracefully

**ACCEPTANCE CRITERIA**:
- [ ] End-to-end integration tests pass
- [ ] Code coverage >80% for all new code
- [ ] All edge cases tested
- [ ] No race conditions in purchase flow
- [ ] AsyncStorage persistence verified
- [ ] Performance benchmarks met (<200ms shop render, <100ms purchase)

**DEPENDENCIES**: All previous tasks
**DELIVERABLES**: Integration test suite, coverage report
**ESTIMATED TIME**: 3 hours

---

### Task 3.2: Accessibility Audit & Documentation

**ROLE**: You are a senior developer conducting accessibility review and documenting the feature

**CONTEXT**: Feature is functionally complete. Now we need to verify WCAG 2.1 AA compliance and create documentation for future maintainers.

**OBJECTIVE**: Conduct accessibility audit and create comprehensive documentation.

**ACCESSIBILITY CHECKLIST**:
- [ ] All interactive elements have 44×44pt minimum touch targets
- [ ] Screen reader labels are clear and descriptive
- [ ] Visual + text indicators for affordability (not color-only)
- [ ] Button disabled states announced to screen readers
- [ ] Navigation flows work with screen reader
- [ ] Color contrast ratios meet WCAG AA standards (4.5:1 for text)
- [ ] Test with TalkBack (Android) and VoiceOver (iOS)

**DOCUMENTATION REQUIREMENTS**:
- **Hook API Documentation**: JSDoc comments for useShopActions and useUpgradeBonuses
- **Component Documentation**: Props, usage examples, accessibility notes
- **Architecture Notes**: How upgrade bonuses integrate with scrap generation
- **Testing Guide**: How to run tests, coverage expectations
- **Future Enhancements**: Notes for adding new upgrades

**ACCEPTANCE CRITERIA**:
- [ ] WCAG 2.1 AA compliance verified
- [ ] Screen reader testing complete on both platforms
- [ ] All hooks have JSDoc comments
- [ ] Components have usage examples
- [ ] Architecture decisions documented
- [ ] README updated with upgrade system overview

**DEPENDENCIES**: All previous tasks
**DELIVERABLES**: Accessibility audit report, documentation files
**ESTIMATED TIME**: 4 hours

---

## Task Execution Guidelines

### For Human Developers

1. **Execute tasks sequentially within phases** - Each task builds on previous work
2. **Follow strict TDD methodology** - Write tests first, implement to pass, refactor
3. **Update task status**:
   - ⬜ Not Started
   - 🟡 In Progress
   - ✅ Complete
4. **Run tests after each task** - Ensure all tests pass before proceeding
5. **Log blockers immediately** - Don't wait to escalate issues

### For AI Agents

1. **Execute tasks sequentially** - Respect dependencies
2. **Validate prerequisites** - Check previous tasks completed
3. **Run validation commands** - Execute tests and verify coverage
4. **Report completion with evidence** - Provide test results and file paths
5. **Escalate blockers** - Report issues that cannot be auto-resolved

### Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- hooks/useShopActions.test.ts

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run on Windows (cmd.exe per CLAUDE.md)
cmd.exe /c "npm test"
```

## Summary Statistics

- **Total Tasks**: 11 core tasks (8 implementation + 3 testing/documentation)
- **Estimated Duration**: 5 days (2 days hooks, 2 days UI, 1 day polish)
- **Critical Path**: Task 1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 3.1 → 3.2
- **Parallel Execution Potential**: Tasks within same phase can be done by different team members
- **Test Coverage Target**: >80% for all new code
- **Performance Targets**:
  - Shop screen render: <200ms
  - Purchase transaction: <100ms
  - Scrap generation calculation: <5ms overhead

## Risk Mitigation

**Risk**: Race condition in purchase flow
- **Mitigation**: Button disabled during transaction, atomic state updates (Task 1.2)

**Risk**: AsyncStorage write failure loses purchase data
- **Mitigation**: Legend-State retry logic, graceful degradation (Task 1.2)

**Risk**: Performance degradation with many upgrades
- **Mitigation**: FlatList-ready architecture, computed observables for efficient recalculation (Task 2.2)

**Risk**: Accessibility requirements not met
- **Mitigation**: Dedicated accessibility testing task, WCAG checklist (Task 3.2)

---

*Generated from TDD: `tdd_storage_pouch_upgrade_20251113.md`*
*Generation timestamp: 2025-11-13*
*Optimized for: Human + AI agent execution (hybrid approach)*
*Architecture: Feature-based per @docs/architecture/organizing_expo_apps_by_feature_20250921_113000.md*
*TDD Methodology: Red-Green-Refactor cycle per @docs/research/react_native_testing_library_guide_20250918_184418.md*
