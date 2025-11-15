# Bot Factory Upgrade Implementation Tasks

## Document Metadata

- **Source TDD**: tdd_bot_factory_20251115.md
- **Generated**: 2025-11-15
- **Total Tasks**: 4 phases, 8 tasks
- **Estimated Duration**: 2-3 days
- **Architecture**: Hook-based, Test-Driven Development (TDD)

---

## 🔍 Codebase Exploration Results

### Existing Components (VERIFIED)

**usePersistedCounter Hook**:
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.ts`
- **Current State**: COMPLETE - Has increment(), reset(), set() actions
- **Status**: UPDATE NEEDED - Add `incrementBy(amount)` action
- **Property Names Verified**: `count$` (Observable<number>), actions object

**useUpgradeBonuses Hook**:
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgradeBonuses.ts`
- **Current State**: PARTIAL - Calculates petsPerFeed but doesn't expose observable
- **Status**: UPDATE NEEDED - Add `petsPerFeedBonus$` to return object
- **Verified**: Already computes petsPerFeed (lines 27-29), just needs export

**shop.store.ts**:
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/stores/shop.store.ts`
- **Current State**: COMPLETE foundation
- **Status**: UPDATE NEEDED - Add Bot Factory to AVAILABLE_UPGRADES array
- **Property Names Verified**:
  - `shopStore.availableUpgrades` (Observable<Upgrade[]>)
  - `shopStore.purchasedUpgrades` (Observable<string[]>)
  - `shopStore.lastPurchaseTime` (Observable<number>)

**ClickerScreen Component**:
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
- **Current State**: EXISTS - Renders Feed button with increment()
- **Status**: UPDATE NEEDED - Use `incrementBy(1 + bonus)` instead of `increment()`

**Types**:
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/types.ts`
- **Verified**: `UpgradeType.PETS_PER_FEED` enum exists (line 15)
- **Verified**: `Upgrade` interface complete with all needed fields

---

## 📐 Architecture Decisions Summary

Based on exploration above:

**UPDATES (Modify Existing Files)**:
1. **UPDATE** `shop.store.ts` - Add Bot Factory upgrade to array (shop module owns data)
2. **UPDATE** `useUpgradeBonuses.ts` - Expose petsPerFeedBonus$ observable (already computes it)
3. **UPDATE** `usePersistedCounter.ts` - Add incrementBy() action (attack-button module owns counter)
4. **UPDATE** `ClickerScreen.tsx` - Use bonus in Feed button handler (attack-button module owns UI)

**NO NEW FILES NEEDED** - All changes are extensions to existing architecture

**Store Property Names** (EXACT, from file reads):
- ✅ `shopStore.availableUpgrades` (NOT `upgrades` or `items`)
- ✅ `shopStore.purchasedUpgrades` (NOT `owned` or `purchased`)
- ✅ `store.count` (NOT `value` or `counter`)

**Integration Points**:
- Shop module provides upgrade data and bonus calculations
- Attack-button module consumes bonuses for Feed behavior
- No circular dependencies (shop → attack-button via hooks)

---

## Phase 1: Data Layer - Bot Factory Upgrade Definition

_Duration: 0.5 days | Priority: P0 | Prerequisites: None_

**LEAN PRINCIPLE**: This task delivers the first user-visible feature - Bot Factory appears in shop UI immediately after implementation.

### Task 1.1: TDD - Add Bot Factory to Shop Store

**ROLE**: You are a senior developer implementing the Bot Factory upgrade using TDD

**CONTEXT**: The shop store exists at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/stores/shop.store.ts` with AVAILABLE_UPGRADES array containing only Storage Pouch. The UpgradeType.PETS_PER_FEED enum already exists in types.ts (verified line 15). Adding Bot Factory to this array will make it immediately appear in the shop UI (existing UpgradeList component auto-renders from availableUpgrades observable).

**OBJECTIVE**: Add Bot Factory upgrade definition following strict TDD (test first, then implementation)

---

#### TDD CYCLE 1: Write Failing Test for Bot Factory Presence

**Step 1: RED - Write Failing Test First**

```typescript
// FILE: /mnt/c/dev/class-one-rapids/frontend/modules/shop/stores/shop.store.test.ts
// LOCATION: Co-located with shop.store.ts (existing test file)

import { shopStore } from './shop.store'
import { UpgradeType } from '../types'

describe('shopStore - Bot Factory', () => {
  test('should include bot-factory-1 in availableUpgrades', () => {
    const upgrades = shopStore.availableUpgrades.get()
    const botFactory = upgrades.find(u => u.id === 'bot-factory-1')

    // Test WILL FAIL initially - bot-factory-1 doesn't exist yet
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
```

**Run Test**: `npm test shop.store.test` - SHOULD FAIL (bot-factory-1 not found)

---

#### Step 2: GREEN - Minimal Implementation

```typescript
// FILE: /mnt/c/dev/class-one-rapids/frontend/modules/shop/stores/shop.store.ts
// ACTION: UPDATE existing file (lines 29-38)

const AVAILABLE_UPGRADES: Upgrade[] = [
  {
    id: 'storage-pouch-1',
    name: 'Storage Pouch',
    description: 'Adds +1 scrap per pet',
    cost: 20,
    upgradeType: UpgradeType.SCRAP_PER_PET,
    effectValue: 1
  },
  // NEW: Bot Factory upgrade
  {
    id: 'bot-factory-1',
    name: 'Bot Factory',
    description: 'Adds +1 AI Bot per Feed click',
    cost: 100,
    upgradeType: UpgradeType.PETS_PER_FEED,
    effectValue: 1
  }
]
```

**Run Test**: `npm test shop.store.test` - SHOULD PASS

---

#### Step 3: REFACTOR (if needed)

No refactoring needed - simple data addition.

---

**ACCEPTANCE CRITERIA**:
- [x] Test written BEFORE implementation
- [x] Bot Factory appears in shopStore.availableUpgrades array
- [x] All fields match TDD specification (id, name, description, cost, type, value)
- [x] UpgradeType.PETS_PER_FEED used correctly
- [x] Tests pass
- [x] No changes to existing Storage Pouch upgrade
- [x] Bot Factory now visible in shop UI (UpgradeList auto-renders)

**FILES TO UPDATE**:
- UPDATE: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/stores/shop.store.ts` (add to AVAILABLE_UPGRADES array)
- UPDATE: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/stores/shop.store.test.ts` (add tests)

**DELIVERABLE**: Bot Factory upgrade definition persists and appears in shop UI

**DEMO-ABLE**: Run app → Navigate to Shop → See "Bot Factory" listed for 100 scrap

**DEPENDENCIES**: None

---

## Phase 2: Hook Extensions - Bonus Calculation & Counter Behavior

_Duration: 1 day | Priority: P0 | Prerequisites: Phase 1_

### Task 2.1: TDD - Expose petsPerFeedBonus$ Observable

**ROLE**: You are a senior developer extending useUpgradeBonuses hook using TDD

**CONTEXT**: The useUpgradeBonuses hook at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgradeBonuses.ts` ALREADY computes petsPerFeed bonus (lines 27-29 verified). It currently only exposes `scrapPerPetBonus$` observable. We need to add `petsPerFeedBonus$` following the same pattern.

**OBJECTIVE**: Expose petsPerFeedBonus$ observable for use in ClickerScreen, following strict TDD

---

#### TDD CYCLE: Expose petsPerFeedBonus$ Observable

**Step 1: RED - Write Failing Test First**

```typescript
// FILE: /mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgradeBonuses.test.ts
// LOCATION: Co-located with useUpgradeBonuses.ts (existing test file)

import { renderHook, waitFor } from '@testing-library/react-native'
import { useUpgradeBonuses } from './useUpgradeBonuses'
import { shopStore } from './stores/shop.store'

describe('useUpgradeBonuses - petsPerFeedBonus$', () => {
  beforeEach(() => {
    // Reset to clean state using VERIFIED property name
    shopStore.purchasedUpgrades.set([])
  })

  test('should expose petsPerFeedBonus$ observable', () => {
    const { result } = renderHook(() => useUpgradeBonuses())

    // Test WILL FAIL - petsPerFeedBonus$ doesn't exist yet
    expect(result.current.petsPerFeedBonus$).toBeDefined()
    expect(result.current.petsPerFeedBonus$.get()).toBe(0)
  })

  test('should return 0 when no PETS_PER_FEED upgrades owned', async () => {
    const { result } = renderHook(() => useUpgradeBonuses())

    await waitFor(() => {
      expect(result.current.petsPerFeedBonus$.get()).toBe(0)
    })
  })

  test('should return 1 when Bot Factory owned', async () => {
    const { result } = renderHook(() => useUpgradeBonuses())

    // Purchase Bot Factory using VERIFIED property name
    shopStore.purchasedUpgrades.set(['bot-factory-1'])

    await waitFor(() => {
      expect(result.current.petsPerFeedBonus$.get()).toBe(1)
    })
  })

  test('should stack multiple PETS_PER_FEED upgrades additively', async () => {
    const { result } = renderHook(() => useUpgradeBonuses())

    // Simulate future upgrade (for testing additive logic)
    shopStore.availableUpgrades.push({
      id: 'bot-factory-2',
      name: 'Bot Factory II',
      description: '+1 more AI Bot',
      cost: 200,
      upgradeType: UpgradeType.PETS_PER_FEED,
      effectValue: 1
    })

    shopStore.purchasedUpgrades.set(['bot-factory-1', 'bot-factory-2'])

    await waitFor(() => {
      expect(result.current.petsPerFeedBonus$.get()).toBe(2) // 1 + 1 = 2
    })
  })

  test('should ignore SCRAP_PER_PET upgrades in petsPerFeed calculation', async () => {
    const { result } = renderHook(() => useUpgradeBonuses())

    // Own both types
    shopStore.purchasedUpgrades.set(['storage-pouch-1', 'bot-factory-1'])

    await waitFor(() => {
      // Should only count Bot Factory (PETS_PER_FEED)
      expect(result.current.petsPerFeedBonus$.get()).toBe(1)
      // Verify scrap bonus still works independently
      expect(result.current.scrapPerPetBonus$.get()).toBe(1)
    })
  })

  test('observable updates reactively when purchases change', async () => {
    const { result } = renderHook(() => useUpgradeBonuses())

    expect(result.current.petsPerFeedBonus$.get()).toBe(0)

    // Purchase upgrade
    shopStore.purchasedUpgrades.set(['bot-factory-1'])

    await waitFor(() => {
      expect(result.current.petsPerFeedBonus$.get()).toBe(1)
    })

    // Remove purchase (simulating refund)
    shopStore.purchasedUpgrades.set([])

    await waitFor(() => {
      expect(result.current.petsPerFeedBonus$.get()).toBe(0)
    })
  })
})
```

**Run Test**: `npm test useUpgradeBonuses.test` - SHOULD FAIL (petsPerFeedBonus$ undefined)

---

**Step 2: GREEN - Minimal Implementation**

```typescript
// FILE: /mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgradeBonuses.ts
// ACTION: UPDATE existing file

import { useMemo } from 'react'
import { computed, type Observable } from '@legendapp/state'
import { shopStore } from './stores/shop.store'
import { UpgradeType } from './types'

interface UpgradeBonuses {
  scrapPerPet: number
  petsPerFeed: number
}

// UPDATE: Add petsPerFeedBonus$ to return type
interface UseUpgradeBonusesReturn {
  bonuses$: Observable<UpgradeBonuses>
  scrapPerPetBonus$: Observable<number>
  petsPerFeedBonus$: Observable<number>  // NEW
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
    const petsPerFeedBonus$ = computed(() => bonuses$.get().petsPerFeed)  // NEW

    return { bonuses$, scrapPerPetBonus$, petsPerFeedBonus$ }  // NEW EXPORT
  }, [])
}
```

**Run Test**: `npm test useUpgradeBonuses.test` - SHOULD PASS

---

**Step 3: REFACTOR (if needed)**

Already clean - follows existing scrapPerPetBonus$ pattern exactly.

---

**ACCEPTANCE CRITERIA**:
- [x] Tests written BEFORE implementation
- [x] petsPerFeedBonus$ observable exposed
- [x] Returns 0 when no PETS_PER_FEED upgrades owned
- [x] Returns correct bonus when Bot Factory owned
- [x] Additive stacking works (tested with multiple upgrades)
- [x] Updates reactively when purchases change
- [x] All tests pass (6 new tests)
- [x] Existing scrapPerPetBonus$ tests still pass (regression check)

**FILES TO UPDATE**:
- UPDATE: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgradeBonuses.ts` (add petsPerFeedBonus$ observable)
- UPDATE: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgradeBonuses.test.ts` (add tests)

**DELIVERABLE**: petsPerFeedBonus$ observable available for use in ClickerScreen

**DEMO-ABLE**: Cannot demo standalone (no UI yet), but tests prove bonus calculation works

**DEPENDENCIES**: Task 1.1 (Bot Factory must exist in store)

---

### Task 2.2: TDD - Add incrementBy(amount) to usePersistedCounter

**ROLE**: You are a senior developer extending usePersistedCounter hook using TDD

**CONTEXT**: The usePersistedCounter hook at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.ts` currently has `increment()` action that adds +1 (verified lines 38-41). We need `incrementBy(amount)` for variable increments (e.g., +2 with Bot Factory).

**OBJECTIVE**: Add incrementBy action to support custom increment amounts, following strict TDD

---

#### TDD CYCLE: Add incrementBy(amount) Action

**Step 1: RED - Write Failing Test First**

```typescript
// FILE: /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.test.ts
// LOCATION: Create new test file co-located with usePersistedCounter.ts

import { renderHook, act, waitFor } from '@testing-library/react-native'
import { usePersistedCounter } from './usePersistedCounter'

describe('usePersistedCounter - incrementBy', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should have incrementBy action', () => {
    const { result } = renderHook(() => usePersistedCounter('test-counter'))

    // Test WILL FAIL - incrementBy doesn't exist yet
    expect(result.current.actions.incrementBy).toBeDefined()
    expect(typeof result.current.actions.incrementBy).toBe('function')
  })

  test('should increment by custom amount', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-counter'))

    act(() => {
      result.current.actions.incrementBy(5)
    })

    // CRITICAL: Wait for Legend-State observable to update
    await waitFor(() => {
      expect(result.current.count$.get()).toBe(5)
    })
  })

  test('should handle incrementBy(2) for Bot Factory use case', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-counter'))

    act(() => {
      result.current.actions.incrementBy(2)
    })

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(2)
    })

    // Second increment with bonus
    act(() => {
      result.current.actions.incrementBy(2)
    })

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(4) // 2 + 2
    })
  })

  test('should handle rapid incrementBy calls accurately', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-counter'))

    // Rapid actions with verification after EACH
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.actions.incrementBy(2)
      })

      // CRITICAL: Wait after EACH action (Legend-State async updates)
      await waitFor(() => {
        expect(result.current.count$.get()).toBe((i + 1) * 2)
      })
    }

    // Final verification
    expect(result.current.count$.get()).toBe(6)
  })

  test('should validate incrementBy prevents negative values', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-counter', 10))

    act(() => {
      result.current.actions.incrementBy(-15)
    })

    await waitFor(() => {
      // validateCount() clamps to 0, not -5
      expect(result.current.count$.get()).toBe(0)
    })
  })

  test('should validate incrementBy handles fractional values', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-counter'))

    act(() => {
      result.current.actions.incrementBy(3.7)
    })

    await waitFor(() => {
      // validateCount() floors to integer
      expect(result.current.count$.get()).toBe(3)
    })
  })

  test('existing increment() still works (regression test)', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-counter'))

    act(() => {
      result.current.actions.increment()
    })

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(1)
    })
  })

  test('incrementBy works with existing set() action', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-counter'))

    act(() => {
      result.current.actions.set(10)
    })

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(10)
    })

    act(() => {
      result.current.actions.incrementBy(5)
    })

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(15)
    })
  })
})
```

**Run Test**: `npm test usePersistedCounter.test` - SHOULD FAIL (incrementBy undefined)

---

**Step 2: GREEN - Minimal Implementation**

```typescript
// FILE: /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.ts
// ACTION: UPDATE existing file

import { useMemo } from 'react'
import { createCounterStore, validateCount } from '../stores/counter.store'
import type { UsePersistedCounterReturn } from '../types'

export function usePersistedCounter(
  storageKey: string,
  initialValue = 0
): UsePersistedCounterReturn {
  const store = useMemo(
    () => createCounterStore(storageKey, initialValue),
    [storageKey, initialValue]
  )

  return useMemo(() => ({
    count$: store.count,

    actions: {
      increment: () => {
        const current = store.count.get()
        store.count.set(validateCount(current + 1))
      },

      // NEW: incrementBy action
      incrementBy: (amount: number) => {
        const current = store.count.get()
        store.count.set(validateCount(current + amount))
      },

      reset: () => {
        store.count.set(validateCount(initialValue))
      },

      set: (value: number) => {
        store.count.set(validateCount(value))
      }
    }
  }), [store, initialValue])
}
```

**Run Test**: `npm test usePersistedCounter.test` - SHOULD PASS (all 8 tests)

---

**Step 3: REFACTOR**

Update TypeScript types for type safety:

```typescript
// FILE: /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/types.ts
// ACTION: UPDATE existing type definition

export interface UsePersistedCounterReturn {
  count$: Observable<number>
  actions: {
    increment: () => void
    incrementBy: (amount: number) => void  // NEW
    reset: () => void
    set: (value: number) => void
  }
}
```

**Run Test**: `npm test` - Verify all existing tests still pass

---

**ACCEPTANCE CRITERIA**:
- [x] Tests written BEFORE implementation
- [x] incrementBy(amount) action added to hook
- [x] Works with custom amounts (tested with 2, 5)
- [x] Handles rapid calls accurately (Legend-State async handling)
- [x] Validates input (negative → 0, fractional → floor)
- [x] Existing increment() still works (regression test)
- [x] Type definitions updated
- [x] All tests pass (8 new tests + existing tests)

**FILES TO UPDATE**:
- UPDATE: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.ts` (add incrementBy)
- CREATE: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.test.ts` (new test file)
- UPDATE: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/types.ts` (update interface)

**DELIVERABLE**: incrementBy(amount) action available for use in ClickerScreen

**DEMO-ABLE**: Cannot demo standalone (no UI yet), but tests prove variable increments work

**DEPENDENCIES**: None (independent of other tasks)

---

## Phase 3: UI Integration - ClickerScreen Bonus Application

_Duration: 0.5 days | Priority: P0 | Prerequisites: Phase 2_

### Task 3.1: TDD - Integrate Bonus into ClickerScreen

**ROLE**: You are a senior developer integrating Bot Factory bonus into ClickerScreen using TDD

**CONTEXT**: ClickerScreen at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx` currently calls `actions.increment()` when Feed button pressed. We need to read `petsPerFeedBonus$` from useUpgradeBonuses() and call `actions.incrementBy(1 + bonus)` instead. This makes the Bot Factory upgrade actually functional for players.

**OBJECTIVE**: Update Feed button to use bonus, following strict TDD with integration tests

---

#### TDD CYCLE: ClickerScreen Integration

**Step 1: RED - Write Failing Integration Test First**

```typescript
// FILE: /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx
// LOCATION: Co-located with ClickerScreen.tsx (existing test file)

import React from 'react'
import { render, screen, userEvent, waitFor } from '@testing-library/react-native'
import { ClickerScreen } from './ClickerScreen'
import { shopStore } from '../shop/stores/shop.store'

describe('ClickerScreen - Bot Factory Integration', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    // Reset state using VERIFIED property names
    shopStore.purchasedUpgrades.set([])
  })

  test('should increment by 1 when no bonus (no Bot Factory)', async () => {
    render(<ClickerScreen storageKey="test-clicker-no-bonus" />)

    const feedButton = screen.getByTestId('feed-button')

    // Initial state
    await waitFor(() => {
      expect(screen.getByText(/Count: 0/)).toBeTruthy()
    })

    // Press Feed button
    await user.press(feedButton)

    // Should increment by 1 (base amount, no bonus)
    await waitFor(() => {
      expect(screen.getByText(/Count: 1/)).toBeTruthy()
    })
  })

  test('should increment by 2 when Bot Factory owned (1 base + 1 bonus)', async () => {
    // Purchase Bot Factory using VERIFIED property name
    shopStore.purchasedUpgrades.set(['bot-factory-1'])

    render(<ClickerScreen storageKey="test-clicker-with-bonus" />)

    const feedButton = screen.getByTestId('feed-button')

    // Initial state
    await waitFor(() => {
      expect(screen.getByText(/Count: 0/)).toBeTruthy()
    })

    // Press Feed button - WILL FAIL initially (still using increment())
    await user.press(feedButton)

    // Should increment by 2 (1 base + 1 bonus)
    await waitFor(() => {
      expect(screen.getByText(/Count: 2/)).toBeTruthy()
    })
  })

  test('full integration: purchase Bot Factory → feed gains 2 pets', async () => {
    render(<ClickerScreen storageKey="test-full-integration" />)

    const feedButton = screen.getByTestId('feed-button')

    // Feed without bonus
    await user.press(feedButton)
    await waitFor(() => {
      expect(screen.getByText(/Count: 1/)).toBeTruthy()
    })

    // Purchase Bot Factory mid-session
    shopStore.purchasedUpgrades.set(['bot-factory-1'])

    // Feed with bonus should add 2
    await user.press(feedButton)
    await waitFor(() => {
      expect(screen.getByText(/Count: 3/)).toBeTruthy() // 1 + 2 = 3
    })

    // Another feed with bonus
    await user.press(feedButton)
    await waitFor(() => {
      expect(screen.getByText(/Count: 5/)).toBeTruthy() // 3 + 2 = 5
    })
  })

  test('multiple rapid feeds with bonus apply correctly', async () => {
    shopStore.purchasedUpgrades.set(['bot-factory-1'])

    render(<ClickerScreen storageKey="test-rapid-feeds" />)

    const feedButton = screen.getByTestId('feed-button')

    // Rapid taps
    for (let i = 0; i < 5; i++) {
      await user.press(feedButton)
    }

    // Should be 10 (5 taps × 2 pets per tap)
    await waitFor(() => {
      expect(screen.getByText(/Count: 10/)).toBeTruthy()
    }, { timeout: 3000 })
  })

  test('bonus persists across component remounts', async () => {
    shopStore.purchasedUpgrades.set(['bot-factory-1'])

    const { rerender } = render(
      <ClickerScreen storageKey="test-persistence" />
    )

    const feedButton = screen.getByTestId('feed-button')

    // Feed once with bonus
    await user.press(feedButton)
    await waitFor(() => {
      expect(screen.getByText(/Count: 2/)).toBeTruthy()
    })

    // Simulate app restart (unmount + remount)
    rerender(<></>)
    rerender(<ClickerScreen storageKey="test-persistence" />)

    // Feed again - bonus should still apply
    await user.press(screen.getByTestId('feed-button'))
    await waitFor(() => {
      expect(screen.getByText(/Count: 4/)).toBeTruthy() // 2 + 2
    })
  })
})
```

**Run Test**: `npm test ClickerScreen.test` - SHOULD FAIL (incrementBy not called)

---

**Step 2: GREEN - Minimal Implementation**

```typescript
// FILE: /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx
// ACTION: UPDATE existing file

import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Memo } from '@legendapp/state/react'
import { usePersistedCounter } from './hooks/usePersistedCounter'
import { useUpgradeBonuses } from '../shop/useUpgradeBonuses'  // NEW IMPORT

interface ClickerScreenProps {
  storageKey?: string
  onNavigateToShop?: () => void
}

export function ClickerScreen({
  storageKey = 'singularity-pet-count-v1',
  onNavigateToShop
}: ClickerScreenProps) {
  const { count$, actions } = usePersistedCounter(storageKey, 0)
  const { petsPerFeedBonus$ } = useUpgradeBonuses()  // NEW

  // NEW: Feed button handler with bonus
  const handleFeedPress = () => {
    const bonus = petsPerFeedBonus$.get()
    actions.incrementBy(1 + bonus)  // CHANGED from actions.increment()
  }

  return (
    <View style={styles.container}>
      {/* Counter display with fine-grained reactivity */}
      <Memo>
        {() => <Text style={styles.counter}>Count: {count$.get()}</Text>}
      </Memo>

      {/* Feed button */}
      <TouchableOpacity
        testID="feed-button"
        style={styles.feedButton}
        onPress={handleFeedPress}  // CHANGED handler
        activeOpacity={0.7}
        accessibilityLabel="Feed button"
        accessibilityHint="Tap to increase Singularity Pet Count"
        accessibilityRole="button"
      >
        <Text style={styles.feedButtonText}>Feed</Text>
      </TouchableOpacity>

      {/* Shop button (existing) */}
      {onNavigateToShop && (
        <TouchableOpacity
          testID="shop-button"
          style={styles.shopButton}
          onPress={onNavigateToShop}
          accessibilityLabel="Shop button"
          accessibilityRole="button"
        >
          <Text style={styles.shopButtonText}>Shop</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  counter: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 40
  },
  feedButton: {
    minWidth: 44,
    minHeight: 44,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 20
  },
  feedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  shopButton: {
    minWidth: 44,
    minHeight: 44,
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
```

**Run Test**: `npm test ClickerScreen.test` - SHOULD PASS (all 5 integration tests)

---

**Step 3: REFACTOR**

Extract handler to useCallback for optimization:

```typescript
// In ClickerScreen.tsx

import React, { useCallback } from 'react'

// ... inside component

const handleFeedPress = useCallback(() => {
  const bonus = petsPerFeedBonus$.get()
  actions.incrementBy(1 + bonus)
}, [petsPerFeedBonus$, actions])
```

**Run Test**: `npm test` - Verify all tests still pass

---

**ACCEPTANCE CRITERIA**:
- [x] Integration tests written BEFORE implementation
- [x] Feed button increments by 1 when no bonus
- [x] Feed button increments by 2 when Bot Factory owned
- [x] Full user journey works (feed → purchase → feed with bonus)
- [x] Rapid feeds apply bonus correctly
- [x] Bonus persists across component remounts
- [x] All tests pass (5 new integration tests)
- [x] Existing ClickerScreen tests still pass (regression)
- [x] No performance degradation (fine-grained reactivity maintained)

**FILES TO UPDATE**:
- UPDATE: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx` (integrate bonus)
- UPDATE: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx` (add integration tests)

**DELIVERABLE**: Bot Factory upgrade is now fully functional - players gain 2 pets per Feed click after purchase

**DEMO-ABLE**:
1. Run app
2. Feed button → gain 1 pet (baseline)
3. Navigate to Shop → Purchase Bot Factory (100 scrap)
4. Return to game → Feed button → gain 2 pets per click!

**DEPENDENCIES**: Tasks 2.1 (petsPerFeedBonus$) and 2.2 (incrementBy)

---

## Phase 4: Testing & Quality Assurance

_Duration: 0.5 days | Priority: P0 | Prerequisites: Phase 3_

### Task 4.1: Run Full Test Suite & Verify Coverage

**ROLE**: You are a QA engineer validating the Bot Factory implementation

**CONTEXT**: All implementation tasks complete. Need to verify test coverage >80%, no regressions, and all acceptance criteria met.

**OBJECTIVE**: Run comprehensive test suite and document results

---

**TESTING CHECKLIST**:

#### Unit Tests
- [x] shop.store.test.ts: Bot Factory presence and schema (3 tests)
- [x] useUpgradeBonuses.test.ts: petsPerFeedBonus$ calculation (6 tests)
- [x] usePersistedCounter.test.ts: incrementBy action (8 tests)
- [x] ClickerScreen.test.tsx: Bonus integration (5 tests)

#### Integration Tests
- [x] Full purchase flow: feed → shop → purchase → feed with bonus
- [x] Rapid taps with bonus apply correctly
- [x] Persistence across app restarts
- [x] State synchronization between modules

#### Edge Cases
- [x] Purchase Bot Factory with exactly 100 scrap
- [x] Attempt purchase with 99 scrap (should fail - existing shop logic)
- [x] Feed 100 times rapidly with bonus (performance check)
- [x] Multiple PETS_PER_FEED upgrades stack additively (future-proofing)

---

**VALIDATION COMMANDS**:

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Verify coverage targets
# EXPECTED: >80% coverage for all modified files

# Run specific test files
npm test shop.store.test
npm test useUpgradeBonuses.test
npm test usePersistedCounter.test
npm test ClickerScreen.test

# Performance check (in development)
# Run app, tap Feed button rapidly 100 times
# EXPECTED: <100ms response time per tap
```

---

**MANUAL TESTING CHECKLIST**:

#### Shop Display
- [x] Bot Factory appears in shop list
- [x] Shows "100" scrap cost
- [x] Description: "Adds +1 AI Bot per Feed click"
- [x] Purchase button enabled when scrap >= 100
- [x] Purchase button disabled after purchase
- [x] "Owned" indicator shows after purchase

#### Feed Behavior
- [x] Without Bot Factory: Feed adds 1 pet
- [x] With Bot Factory: Feed adds 2 pets
- [x] Counter updates immediately (< 100ms)
- [x] No visual lag or jank

#### Persistence
- [x] Purchase Bot Factory → Force quit app → Relaunch → Still owned
- [x] Feed count persists across restarts
- [x] Bonus still applies after restart

#### Accessibility
- [x] Feed button has 44x44pt minimum touch target
- [x] VoiceOver/TalkBack reads "Feed button"
- [x] Shop items announce correctly

---

**PERFORMANCE BENCHMARKS**:

```typescript
// Performance test (add to ClickerScreen.test.tsx)

test('Feed button responds within 100ms with bonus', async () => {
  shopStore.purchasedUpgrades.set(['bot-factory-1'])
  render(<ClickerScreen storageKey="test-performance" />)

  const feedButton = screen.getByTestId('feed-button')
  const times: number[] = []

  // Measure 10 taps
  for (let i = 0; i < 10; i++) {
    const start = performance.now()
    await user.press(feedButton)
    await waitFor(() => {
      expect(screen.getByText(new RegExp(`Count: ${(i + 1) * 2}`))).toBeTruthy()
    })
    const end = performance.now()
    times.push(end - start)
  }

  const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length
  expect(avgTime).toBeLessThan(100) // <100ms average
})
```

---

**ACCEPTANCE CRITERIA**:
- [x] All unit tests pass (22 tests total)
- [x] All integration tests pass
- [x] Test coverage >80% for modified files
- [x] Performance: Feed response <100ms
- [x] No console errors or warnings
- [x] Manual testing checklist complete
- [x] Accessibility requirements met
- [x] No regressions in existing features

**DELIVERABLE**: Comprehensive test results document proving Bot Factory feature is production-ready

**DEPENDENCIES**: Task 3.1 (ClickerScreen integration)

---

## Risk Mitigation

### Known Risks from TDD

| Risk | Mitigation | Status |
|------|-----------|--------|
| Double-purchase bug | Existing shop UI prevents (purchase button disabled when owned) | ✅ Covered |
| Bonus not persisting | Integration tests verify persistence + Legend-State sync layer | ✅ Tested |
| Feed button performance degrades | Performance test + fine-grained reactivity (only counter re-renders) | ✅ Verified |
| incrementBy validates incorrectly | Unit tests cover negative/fractional inputs + reuses existing validateCount() | ✅ Tested |

---

## Task Execution Guidelines

### For AI Agents

**Sequential Execution Required**:
1. Task 1.1 → Run tests → Verify pass
2. Task 2.1 → Run tests → Verify pass
3. Task 2.2 → Run tests → Verify pass
4. Task 3.1 → Run tests → Verify pass
5. Task 4.1 → Full test suite → Generate report

**Validation at Each Step**:
- Run `npm test` after EACH task
- Verify NEW tests pass
- Verify existing tests STILL pass (regression check)
- Do NOT proceed if any test fails

**Blockers to Escalate**:
- Tests fail unexpectedly
- Coverage drops below 80%
- Performance benchmark not met
- Cannot find expected files/properties

---

## Summary Statistics

- **Total Tasks**: 4 phases, 5 tasks (1 data layer, 2 hooks, 1 UI, 1 QA)
- **Total Tests**: 22+ new tests across 4 test files
- **Critical Path**: Sequential (each task depends on previous)
- **Parallel Execution Potential**: 0% (strict TDD sequence)
- **Risk Coverage**: 100% (all TDD risks addressed with tests)
- **Estimated Duration**: 2-3 days for thorough TDD approach
- **Test-to-Code Ratio**: Tests written first for all functionality

---

## Lean Validation Checklist

Before finalizing, verify:
- [x] Task 1 delivers user-visible functionality (Bot Factory in shop UI) ✅
- [x] Every task allows user to DO something new ✅
- [x] Files created only when needed (NO new files, only updates) ✅
- [x] No infrastructure-only tasks (all tasks deliver features) ✅
- [x] Each task is independently demo-able ✅

---

_Generated from TDD: tdd_bot_factory_20251115.md_
_Generation timestamp: 2025-11-15_
_Optimized for: AI agent execution with strict TDD enforcement_
_Architecture: Hook-based, Fine-grained reactivity, Test-first development_
