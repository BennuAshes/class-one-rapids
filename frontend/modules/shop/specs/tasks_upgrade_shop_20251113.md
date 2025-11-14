# Upgrade Shop System - Implementation Tasks

## Document Metadata

- **Source TDD**: `tdd_upgrade_shop_20251113.md`
- **Generated**: 2025-11-13
- **Total Tasks**: 8
- **Execution Model**: Test-Driven Development (Red-Green-Refactor)
- **Architecture**: Feature-based organization with co-located tests

---

## Phase 1: First User-Visible Feature (Per Lean Principles)

_Duration: 1 day | Priority: P0 | Prerequisites: None_

**LEAN PRINCIPLE**: First task MUST deliver working functionality users can interact with. NO infrastructure-only tasks.

### Task 1.1: Implement Shop Navigation with TDD

**ROLE**: You are a senior React Native developer implementing the first user-visible shop feature using Test-Driven Development

**CONTEXT**: From TDD Section 11 (Implementation Plan), Phase 2, Feature 1. The shop system needs basic navigation from the main game screen to a shop screen. This is the FIRST user-visible feature following @docs/architecture/lean-task-generation-guide.md - users can tap a button and see a new screen.

**OBJECTIVE**: Create working navigation from main screen (ClickerScreen) to shop screen with back navigation, following strict TDD Red-Green-Refactor cycle

**TDD IMPLEMENTATION CYCLE**:

#### Cycle 1: RED - Shop Button on Main Screen

**Step 1: Write Failing Test**
```typescript
// File: frontend/modules/attack-button/ClickerScreen.test.tsx (modify existing)
import { render, screen, userEvent } from '@testing-library/react-native'

describe('ClickerScreen - Shop Navigation', () => {
  test('displays shop button', () => {
    render(<ClickerScreen />)

    // This test FAILS initially (button doesn't exist)
    expect(screen.getByText(/shop/i)).toBeTruthy()
  })
})
```

**Step 2: GREEN - Add Shop Button**
```typescript
// File: frontend/modules/attack-button/ClickerScreen.tsx (modify existing)
// Add shop button to existing screen
<TouchableOpacity>
  <Text>Shop</Text>
</TouchableOpacity>
```

**Step 3: REFACTOR - Style Button**
- Add proper styling following existing patterns
- Ensure 44x44pt minimum touch target

#### Cycle 2: RED - Navigation to Shop Screen

**Step 1: Write Failing Test**
```typescript
test('shop button navigates to shop screen', async () => {
  const user = userEvent.setup()
  render(<ClickerScreen />)

  const shopButton = screen.getByText(/shop/i)
  await user.press(shopButton)

  // This test FAILS initially (navigation not implemented)
  await waitFor(() => {
    expect(screen.getByTestId('shop-screen')).toBeTruthy()
  })
})
```

**Step 2: GREEN - Create Basic ShopScreen**
```typescript
// File: frontend/modules/shop/ShopScreen.tsx (NEW)
export function ShopScreen() {
  return <View testID="shop-screen"><Text>Shop</Text></View>
}

// Modify ClickerScreen to add navigation
<TouchableOpacity onPress={() => navigation.navigate('Shop')}>
  <Text>Shop</Text>
</TouchableOpacity>
```

**Step 3: REFACTOR - Extract Component**
- Create ShopButton component if needed
- Clean up navigation logic

#### Cycle 3: RED - Scrap Balance Display

**Step 1: Write Failing Test**
```typescript
// File: frontend/modules/shop/ShopScreen.test.tsx (NEW)
describe('ShopScreen', () => {
  test('displays scrap balance in header', () => {
    scrapStore.scrap.set(250)
    render(<ShopScreen />)

    // This test FAILS initially (header doesn't exist)
    expect(screen.getByText(/250/)).toBeTruthy()
    expect(screen.getByText(/scrap/i)).toBeTruthy()
  })
})
```

**Step 2: GREEN - Add Header**
```typescript
// File: frontend/modules/shop/ShopScreen.tsx
import { scrapStore } from '@/modules/scrap/stores/scrap.store'
import { observer } from '@legendapp/state/react'

export const ShopScreen = observer(() => {
  const scrap = scrapStore.scrap.get()
  return (
    <View testID="shop-screen">
      <Text>Scrap: {scrap}</Text>
    </View>
  )
})
```

**Step 3: REFACTOR - Format Numbers**
- Add comma formatting for large numbers
- Extract header component

**FILE STRUCTURE CREATED**:
```
frontend/
├── modules/
│   ├── shop/
│   │   ├── ShopScreen.tsx           # Main shop screen
│   │   ├── ShopScreen.test.tsx      # Co-located tests
│   └── attack-button/
│       └── ClickerScreen.tsx        # Modified to add shop button
```

**ACCEPTANCE CRITERIA**:
- [ ] Shop button visible on main screen
- [ ] Shop button meets 44x44pt touch target minimum
- [ ] Tapping shop button navigates to shop screen in <500ms
- [ ] Shop screen displays current scrap balance
- [ ] All tests pass (Red-Green-Refactor cycle followed)
- [ ] Back navigation returns to main screen
- [ ] Scrap balance updates reactively

**DELIVERABLES**:
1. Working shop navigation (user can tap button and see new screen)
2. Shop screen with scrap balance header
3. All tests passing
4. Both features are demo-able

**DEPENDENCIES**: None (first task, uses existing scrapStore)

**TOOLS NEEDED**: React Navigation (already installed), Legend-State (existing)

---

## Phase 2: Core Shop UI Implementation

_Duration: 1 day | Priority: P0 | Prerequisites: Task 1.1_

### Task 2.1: Implement Empty Shop State with TDD

**ROLE**: You are a senior React Native developer implementing empty state UI

**CONTEXT**: From TDD Section 11, Phase 2, Feature 2. When no upgrades exist, users should see a message indicating upgrades are coming.

**OBJECTIVE**: Create empty state component with tests following TDD cycle

**TDD IMPLEMENTATION CYCLE**:

#### Cycle 1: RED - Empty State Renders

**Step 1: Write Failing Test**
```typescript
// File: frontend/modules/shop/ShopScreen.test.tsx
test('shows empty state when no upgrades available', () => {
  render(<ShopScreen />)

  // This test FAILS initially (empty state doesn't exist)
  expect(screen.getByText(/upgrades coming soon/i)).toBeTruthy()
})
```

**Step 2: GREEN - Add Empty State**
```typescript
// File: frontend/modules/shop/EmptyState.tsx (NEW)
export function EmptyState({ message = 'Upgrades coming soon!' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

// Modify ShopScreen.tsx
export const ShopScreen = observer(() => {
  const scrap = scrapStore.scrap.get()
  return (
    <View testID="shop-screen">
      <Text>Scrap: {scrap}</Text>
      <EmptyState />
    </View>
  )
})
```

**Step 3: REFACTOR - Add Styling**
- Center content
- Add icon or illustration
- Ensure proper spacing

#### Cycle 2: RED - Conditional Rendering

**Step 1: Write Failing Test**
```typescript
test('hides empty state when upgrades exist', () => {
  shopStore.availableUpgrades.set([mockUpgrade])
  render(<ShopScreen />)

  // Empty state should not be visible
  expect(screen.queryByText(/upgrades coming soon/i)).toBeNull()
})
```

**Step 2: GREEN - Add Conditional Logic**
```typescript
export const ShopScreen = observer(() => {
  const scrap = scrapStore.scrap.get()
  const upgrades = shopStore.availableUpgrades.get()

  return (
    <View testID="shop-screen">
      <Text>Scrap: {scrap}</Text>
      {upgrades.length === 0 ? (
        <EmptyState />
      ) : (
        <Text>Upgrade List</Text>
      )}
    </View>
  )
})
```

**Step 3: REFACTOR - Extract to Hook**
- Create `useAvailableUpgrades` if needed
- Clean up conditional logic

**FILE STRUCTURE CREATED**:
```
frontend/modules/shop/
├── ShopScreen.tsx
├── ShopScreen.test.tsx
├── EmptyState.tsx           # NEW
└── EmptyState.test.tsx      # NEW (co-located)
```

**ACCEPTANCE CRITERIA**:
- [ ] Empty state displays when no upgrades exist
- [ ] Empty state has clear, friendly messaging
- [ ] Empty state is centered and visually balanced
- [ ] Empty state hidden when upgrades present
- [ ] All tests pass following TDD cycle
- [ ] Minimum accessibility requirements met

**DELIVERABLES**:
1. EmptyState component with tests
2. Conditional rendering in ShopScreen
3. Visual polish (styling, spacing)

**DEPENDENCIES**: Task 1.1

---

### Task 2.2: Implement Upgrade Type Definitions

**ROLE**: You are a senior TypeScript developer defining type-safe upgrade schemas

**CONTEXT**: From TDD Section 5 (Data Model), upgrade entity design must support SCRAP_PER_PET and PETS_PER_FEED effect types with extensibility for future types.

**OBJECTIVE**: Create TypeScript types for upgrade data structure following TDD architecture specifications

**IMPLEMENTATION STEPS**:

1. Create types file with upgrade schema:

```typescript
// File: frontend/modules/shop/types.ts (NEW)

/**
 * Upgrade effect types
 *
 * SCRAP_PER_PET: Increases scrap gained per pet when feeding
 * PETS_PER_FEED: Increases number of pets gained per feed action
 */
export enum UpgradeType {
  SCRAP_PER_PET = 'SCRAP_PER_PET',
  PETS_PER_FEED = 'PETS_PER_FEED'
}

/**
 * Upgrade entity
 *
 * Represents a single purchasable upgrade in the shop.
 * Effects are additive (not multiplicative) for MVP simplicity.
 */
export interface Upgrade {
  /** Unique identifier */
  id: string

  /** Display name shown to user */
  name: string

  /** Player-facing description of what upgrade does */
  description: string

  /** Scrap cost to purchase */
  cost: number

  /** Category of effect this upgrade provides */
  upgradeType: UpgradeType

  /** Numeric value to add (additive effect) */
  effectValue: number

  /** Optional icon identifier for future use */
  iconName?: string
}

/**
 * Example upgrade for reference:
 *
 * const betterFood: Upgrade = {
 *   id: 'better-food-1',
 *   name: 'Better Food',
 *   description: 'Increases scrap gained per pet by 5',
 *   cost: 100,
 *   upgradeType: UpgradeType.SCRAP_PER_PET,
 *   effectValue: 5
 * }
 */
```

2. Add shop state types:

```typescript
// File: frontend/modules/shop/types.ts (continued)

/**
 * Shop state interface
 *
 * Manages available upgrades and purchase tracking
 */
export interface ShopState {
  /** All upgrades that can be purchased */
  availableUpgrades: Upgrade[]

  /** IDs of upgrades that have been purchased */
  purchasedUpgrades: string[]

  /** Timestamp of last purchase (for analytics) */
  lastPurchaseTime: number
}

/**
 * Purchase result
 *
 * Returned from purchase actions to indicate success/failure
 */
export interface PurchaseResult {
  success: boolean
  error?: 'INSUFFICIENT_FUNDS' | 'ALREADY_PURCHASED' | 'INVALID_UPGRADE'
}
```

3. Create mock data for testing:

```typescript
// File: frontend/modules/shop/types.ts (continued)

/** Mock upgrade for testing */
export const mockUpgrade: Upgrade = {
  id: 'test-upgrade-1',
  name: 'Test Upgrade',
  description: 'A test upgrade for development',
  cost: 100,
  upgradeType: UpgradeType.SCRAP_PER_PET,
  effectValue: 5
}
```

**FILE STRUCTURE CREATED**:
```
frontend/modules/shop/
├── types.ts                 # NEW - All TypeScript types
```

**ACCEPTANCE CRITERIA**:
- [ ] UpgradeType enum defines all effect types
- [ ] Upgrade interface includes all required fields
- [ ] ShopState interface matches TDD specification
- [ ] PurchaseResult type supports error cases
- [ ] JSDoc comments explain each type
- [ ] Mock data provided for testing
- [ ] Types export correctly for use in other files

**DELIVERABLES**:
1. Complete type definitions in types.ts
2. Mock data for testing
3. Full JSDoc documentation

**DEPENDENCIES**: None (types only, no runtime dependencies)

---

## Phase 3: Shop State Management

_Duration: 1 day | Priority: P0 | Prerequisites: Task 2.2_

### Task 3.1: Implement Shop Store with TDD

**ROLE**: You are a senior developer implementing Legend-State shop store following TDD practices

**CONTEXT**: From TDD Section 5 (Data Model) and state management guide (@docs/architecture/state-management-hooks-guide.md). Shop needs to track available upgrades and purchased upgrade IDs with AsyncStorage persistence.

**OBJECTIVE**: Create shop store with Legend-State following TDD Red-Green-Refactor cycle

**TDD IMPLEMENTATION CYCLE**:

#### Cycle 1: RED - Store Initialization

**Step 1: Write Failing Test**
```typescript
// File: frontend/modules/shop/stores/shop.store.test.ts (NEW)
import { shopStore } from './shop.store'

describe('shopStore', () => {
  test('initializes with empty upgrades and purchases', () => {
    // This test FAILS initially (store doesn't exist)
    expect(shopStore.availableUpgrades.get()).toEqual([])
    expect(shopStore.purchasedUpgrades.get()).toEqual([])
    expect(shopStore.lastPurchaseTime.get()).toBe(0)
  })
})
```

**Step 2: GREEN - Create Store**
```typescript
// File: frontend/modules/shop/stores/shop.store.ts (NEW)
import { observable } from '@legendapp/state'
import { configureSynced, synced } from '@legendapp/state/sync'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Upgrade } from '../types'

// Configure persistence
const persistPlugin = observablePersistAsyncStorage({ AsyncStorage })

const persist = configureSynced(synced, {
  persist: {
    plugin: persistPlugin,
    retrySync: true
  }
})

export const shopStore = observable({
  availableUpgrades: [] as Upgrade[],

  purchasedUpgrades: persist({
    initial: [] as string[],
    persist: {
      name: 'shop-purchased-v1',
      debounceSet: 1000
    }
  }),

  lastPurchaseTime: persist({
    initial: 0,
    persist: {
      name: 'shop-last-purchase-v1'
    }
  })
})
```

**Step 3: REFACTOR - Extract Configuration**
- Consider extracting persist config if used elsewhere
- Add JSDoc comments

#### Cycle 2: RED - Add Upgrade to Store

**Step 1: Write Failing Test**
```typescript
test('can set available upgrades', () => {
  const mockUpgrades = [mockUpgrade]

  shopStore.availableUpgrades.set(mockUpgrades)

  expect(shopStore.availableUpgrades.get()).toEqual(mockUpgrades)
})
```

**Step 2: GREEN - Verify Functionality**
(Already works with observable, test should pass)

**Step 3: REFACTOR - N/A**

#### Cycle 3: RED - Track Purchases

**Step 1: Write Failing Test**
```typescript
test('tracks purchased upgrades', async () => {
  shopStore.purchasedUpgrades.set([])

  shopStore.purchasedUpgrades.push('upgrade-1')

  await waitFor(() => {
    expect(shopStore.purchasedUpgrades.get()).toContain('upgrade-1')
  })
})
```

**Step 2: GREEN - Verify Observable Behavior**
(Should work with Legend-State observables)

**Step 3: REFACTOR - Add Helper Methods**
- Consider adding `isPurchased(id)` helper
- Add `resetPurchases()` for testing

**FILE STRUCTURE CREATED**:
```
frontend/modules/shop/
└── stores/
    ├── shop.store.ts        # NEW - Shop state
    └── shop.store.test.ts   # NEW - Co-located tests
```

**ACCEPTANCE CRITERIA**:
- [ ] Store initializes with correct defaults
- [ ] availableUpgrades can be set and retrieved
- [ ] purchasedUpgrades persists to AsyncStorage
- [ ] lastPurchaseTime persists correctly
- [ ] All tests pass with waitFor for async operations
- [ ] Store follows Legend-State patterns from guide

**DELIVERABLES**:
1. shop.store.ts with Legend-State configuration
2. Comprehensive test suite
3. Persistence configured correctly

**DEPENDENCIES**: Task 2.2 (types)

---

## Phase 4: Purchase Logic Implementation

_Duration: 1.5 days | Priority: P0 | Prerequisites: Task 3.1_

### Task 4.1: Implement Purchase Hook with TDD

**ROLE**: You are a senior developer implementing purchase behavior hook following strict TDD

**CONTEXT**: From TDD Section 7 (TDD Strategy) and state management guide (@docs/architecture/state-management-hooks-guide.md). Hook must validate scrap balance, deduct scrap, track purchases, and apply effects. Hook name follows BEHAVIOR-based naming: `useUpgradePurchase` (purchase behavior) not `useShop` (entity).

**OBJECTIVE**: Create `useUpgradePurchase` hook with all purchase logic following Red-Green-Refactor

**TDD IMPLEMENTATION CYCLE**:

#### Cycle 1: RED - Insufficient Funds Validation

**Step 1: Write Failing Test**
```typescript
// File: frontend/modules/shop/hooks/useUpgradePurchase.test.tsx (NEW)
import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useUpgradePurchase } from './useUpgradePurchase'
import { scrapStore } from '@/modules/scrap/stores/scrap.store'
import { shopStore } from '../stores/shop.store'
import { mockUpgrade } from '../types'

describe('useUpgradePurchase', () => {
  beforeEach(() => {
    scrapStore.scrap.set(0)
    shopStore.purchasedUpgrades.set([])
    shopStore.availableUpgrades.set([mockUpgrade])
  })

  test('purchase fails when insufficient scrap', () => {
    scrapStore.scrap.set(50) // Less than mockUpgrade.cost (100)
    const { result } = renderHook(() => useUpgradePurchase())

    // This test FAILS initially (hook doesn't exist)
    const purchaseResult = result.current.purchase(mockUpgrade.id)

    expect(purchaseResult.success).toBe(false)
    expect(purchaseResult.error).toBe('INSUFFICIENT_FUNDS')
  })
})
```

**Step 2: GREEN - Implement Validation**
```typescript
// File: frontend/modules/shop/hooks/useUpgradePurchase.ts (NEW)
import { scrapStore } from '@/modules/scrap/stores/scrap.store'
import { shopStore } from '../stores/shop.store'
import type { PurchaseResult } from '../types'

export function useUpgradePurchase() {
  const purchase = (upgradeId: string): PurchaseResult => {
    const upgrade = shopStore.availableUpgrades.get().find(u => u.id === upgradeId)
    if (!upgrade) {
      return { success: false, error: 'INVALID_UPGRADE' }
    }

    const currentScrap = scrapStore.scrap.get()
    if (currentScrap < upgrade.cost) {
      return { success: false, error: 'INSUFFICIENT_FUNDS' }
    }

    return { success: true }
  }

  return { purchase }
}
```

**Step 3: REFACTOR - Extract Validation**

#### Cycle 2: RED - Scrap Deduction

**Step 1: Write Failing Test**
```typescript
test('deducts scrap on successful purchase', async () => {
  scrapStore.scrap.set(200)
  const { result } = renderHook(() => useUpgradePurchase())

  act(() => {
    result.current.purchase(mockUpgrade.id)
  })

  await waitFor(() => {
    expect(scrapStore.scrap.get()).toBe(100) // 200 - 100 cost
  })
})
```

**Step 2: GREEN - Implement Deduction**
```typescript
const purchase = (upgradeId: string): PurchaseResult => {
  // ... existing validation ...

  if (currentScrap < upgrade.cost) {
    return { success: false, error: 'INSUFFICIENT_FUNDS' }
  }

  // Deduct scrap
  scrapStore.scrap.set(currentScrap - upgrade.cost)

  return { success: true }
}
```

**Step 3: REFACTOR - Use Batch for Atomic Updates**

#### Cycle 3: RED - Track Purchase

**Step 1: Write Failing Test**
```typescript
test('marks upgrade as purchased', async () => {
  scrapStore.scrap.set(200)
  const { result } = renderHook(() => useUpgradePurchase())

  act(() => {
    result.current.purchase(mockUpgrade.id)
  })

  await waitFor(() => {
    expect(shopStore.purchasedUpgrades.get()).toContain(mockUpgrade.id)
  })
})
```

**Step 2: GREEN - Add to Purchased List**
```typescript
// Deduct scrap
scrapStore.scrap.set(currentScrap - upgrade.cost)
shopStore.purchasedUpgrades.push(upgradeId)
shopStore.lastPurchaseTime.set(Date.now())
```

**Step 3: REFACTOR - Use Batch**
```typescript
import { batch } from '@legendapp/state'

batch(() => {
  scrapStore.scrap.set(currentScrap - upgrade.cost)
  shopStore.purchasedUpgrades.push(upgradeId)
  shopStore.lastPurchaseTime.set(Date.now())
})
```

#### Cycle 4: RED - Prevent Duplicate Purchases

**Step 1: Write Failing Test**
```typescript
test('prevents purchasing same upgrade twice', () => {
  scrapStore.scrap.set(500)
  shopStore.purchasedUpgrades.set([mockUpgrade.id])
  const { result } = renderHook(() => useUpgradePurchase())

  const purchaseResult = result.current.purchase(mockUpgrade.id)

  expect(purchaseResult.success).toBe(false)
  expect(purchaseResult.error).toBe('ALREADY_PURCHASED')
})
```

**Step 2: GREEN - Add Duplicate Check**
```typescript
// After finding upgrade, before scrap check
const purchased = shopStore.purchasedUpgrades.get()
if (purchased.includes(upgradeId)) {
  return { success: false, error: 'ALREADY_PURCHASED' }
}
```

**Step 3: REFACTOR - Clean Up Logic**

#### Cycle 5: RED - Apply Upgrade Effects

**Step 1: Write Failing Test**
```typescript
test('applies SCRAP_PER_PET effect', async () => {
  const scrapPerPetUpgrade = {
    ...mockUpgrade,
    upgradeType: UpgradeType.SCRAP_PER_PET,
    effectValue: 5
  }
  shopStore.availableUpgrades.set([scrapPerPetUpgrade])
  scrapStore.scrap.set(200)

  // Assuming scrapStore has scrapPerPet property
  const initialScrapPerPet = 10
  scrapStore.scrapPerPet.set(initialScrapPerPet)

  const { result } = renderHook(() => useUpgradePurchase())

  act(() => {
    result.current.purchase(scrapPerPetUpgrade.id)
  })

  await waitFor(() => {
    expect(scrapStore.scrapPerPet.get()).toBe(15) // 10 + 5
  })
})
```

**Step 2: GREEN - Apply Effect**
```typescript
import { UpgradeType } from '../types'

// After batch update
switch (upgrade.upgradeType) {
  case UpgradeType.SCRAP_PER_PET:
    scrapStore.scrapPerPet.set(
      scrapStore.scrapPerPet.get() + upgrade.effectValue
    )
    break
  case UpgradeType.PETS_PER_FEED:
    // Apply to pet counter (implementation depends on pet system)
    break
}
```

**Step 3: REFACTOR - Extract Effect Application**

**FINAL HOOK STRUCTURE**:
```typescript
export function useUpgradePurchase() {
  const purchase = (upgradeId: string): PurchaseResult => {
    // 1. Validate upgrade exists
    // 2. Check not already purchased
    // 3. Validate sufficient scrap
    // 4. Deduct scrap, track purchase (batched)
    // 5. Apply upgrade effect
    return { success: true }
  }

  const canAfford = (cost: number): boolean => {
    return scrapStore.scrap.get() >= cost
  }

  const isPurchased = (upgradeId: string): boolean => {
    return shopStore.purchasedUpgrades.get().includes(upgradeId)
  }

  return { purchase, canAfford, isPurchased }
}
```

**FILE STRUCTURE CREATED**:
```
frontend/modules/shop/
└── hooks/
    ├── useUpgradePurchase.ts        # NEW - Purchase behavior
    └── useUpgradePurchase.test.tsx  # NEW - Co-located tests
```

**ACCEPTANCE CRITERIA**:
- [ ] Validates sufficient scrap before purchase
- [ ] Deducts correct scrap amount
- [ ] Tracks purchased upgrades
- [ ] Prevents duplicate purchases
- [ ] Applies SCRAP_PER_PET effects correctly
- [ ] Applies PETS_PER_FEED effects correctly
- [ ] All state updates are atomic (batched)
- [ ] All tests pass with waitFor for async operations
- [ ] Hook follows behavior-based naming

**DELIVERABLES**:
1. useUpgradePurchase hook with full purchase logic
2. Comprehensive test suite (>80% coverage)
3. Effect application for both upgrade types

**DEPENDENCIES**: Task 3.1 (shop store)

**NOTE**: This task may require adding `scrapPerPet` to scrapStore if it doesn't exist yet.

---

## Phase 5: Upgrade List UI

_Duration: 1 day | Priority: P0 | Prerequisites: Task 4.1_

### Task 5.1: Implement Upgrade List with TDD

**ROLE**: You are a senior React Native developer implementing upgrade list display

**CONTEXT**: From TDD Section 11, Phase 2, Feature 3. Shop needs to display available upgrades in a scrollable list with affordability indication.

**OBJECTIVE**: Create UpgradeCard component and integrate with FlatList following TDD

**TDD IMPLEMENTATION CYCLE**:

#### Cycle 1: RED - UpgradeCard Displays Details

**Step 1: Write Failing Test**
```typescript
// File: frontend/modules/shop/UpgradeCard.test.tsx (NEW)
import { render, screen } from '@testing-library/react-native'
import { observable } from '@legendapp/state'
import { UpgradeCard } from './UpgradeCard'
import { mockUpgrade } from './types'

describe('UpgradeCard', () => {
  test('displays upgrade name, description, and cost', () => {
    const upgrade$ = observable(mockUpgrade)

    // This test FAILS initially (component doesn't exist)
    render(<UpgradeCard upgrade$={upgrade$} />)

    expect(screen.getByText(mockUpgrade.name)).toBeTruthy()
    expect(screen.getByText(mockUpgrade.description)).toBeTruthy()
    expect(screen.getByText(/100.*scrap/i)).toBeTruthy()
  })
})
```

**Step 2: GREEN - Create Basic Card**
```typescript
// File: frontend/modules/shop/UpgradeCard.tsx (NEW)
import { observer } from '@legendapp/state/react'
import { View, Text } from 'react-native'
import type { Observable } from '@legendapp/state'
import type { Upgrade } from './types'

export const UpgradeCard = observer(({
  upgrade$
}: {
  upgrade$: Observable<Upgrade>
}) => {
  const name = upgrade$.name.get()
  const description = upgrade$.description.get()
  const cost = upgrade$.cost.get()

  return (
    <View>
      <Text>{name}</Text>
      <Text>{description}</Text>
      <Text>{cost} scrap</Text>
    </View>
  )
})
```

**Step 3: REFACTOR - Add Styling**

#### Cycle 2: RED - Buy Button Functionality

**Step 1: Write Failing Test**
```typescript
test('buy button triggers purchase', async () => {
  const upgrade$ = observable(mockUpgrade)
  const onPurchase = jest.fn()

  const user = userEvent.setup()
  render(<UpgradeCard upgrade$={upgrade$} onPurchase={onPurchase} />)

  const buyButton = screen.getByText(/buy/i)
  await user.press(buyButton)

  await waitFor(() => {
    expect(onPurchase).toHaveBeenCalledWith(mockUpgrade.id)
  })
})
```

**Step 2: GREEN - Add Button**
```typescript
export const UpgradeCard = observer(({
  upgrade$,
  onPurchase
}: {
  upgrade$: Observable<Upgrade>
  onPurchase: (id: string) => void
}) => {
  // ... existing code ...
  const id = upgrade$.id.get()

  return (
    <View>
      {/* ... existing content ... */}
      <TouchableOpacity onPress={() => onPurchase(id)}>
        <Text>Buy</Text>
      </TouchableOpacity>
    </View>
  )
})
```

**Step 3: REFACTOR - Style Button**

#### Cycle 3: RED - Affordability Indication

**Step 1: Write Failing Test**
```typescript
test('disables button when cannot afford', () => {
  scrapStore.scrap.set(50) // Less than mockUpgrade.cost (100)
  const upgrade$ = observable(mockUpgrade)

  render(<UpgradeCard upgrade$={upgrade$} isAffordable={false} />)

  const buyButton = screen.getByTestId('buy-button')
  expect(buyButton).toBeDisabled()
})
```

**Step 2: GREEN - Add Disabled State**
```typescript
export const UpgradeCard = observer(({
  upgrade$,
  onPurchase,
  isAffordable
}: {
  upgrade$: Observable<Upgrade>
  onPurchase: (id: string) => void
  isAffordable: boolean
}) => {
  return (
    <View>
      {/* ... existing content ... */}
      <TouchableOpacity
        testID="buy-button"
        onPress={() => onPurchase(id)}
        disabled={!isAffordable}
      >
        <Text>Buy</Text>
      </TouchableOpacity>
    </View>
  )
})
```

**Step 3: REFACTOR - Add Visual Styling for Disabled**

#### Cycle 4: RED - FlatList Integration

**Step 1: Write Failing Test**
```typescript
// File: frontend/modules/shop/ShopScreen.test.tsx
test('renders list of upgrades', () => {
  shopStore.availableUpgrades.set([mockUpgrade, { ...mockUpgrade, id: 'upgrade-2', name: 'Upgrade 2' }])
  scrapStore.scrap.set(500)

  render(<ShopScreen />)

  expect(screen.getByText(mockUpgrade.name)).toBeTruthy()
  expect(screen.getByText('Upgrade 2')).toBeTruthy()
})
```

**Step 2: GREEN - Add FlatList**
```typescript
// File: frontend/modules/shop/ShopScreen.tsx
import { FlatList } from 'react-native'
import { UpgradeCard } from './UpgradeCard'
import { useUpgradePurchase } from './hooks/useUpgradePurchase'

export const ShopScreen = observer(() => {
  const scrap = scrapStore.scrap.get()
  const upgrades = shopStore.availableUpgrades.get()
  const { purchase, canAfford } = useUpgradePurchase()

  if (upgrades.length === 0) {
    return <EmptyState />
  }

  return (
    <View>
      <Text>Scrap: {scrap}</Text>
      <FlatList
        data={upgrades}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <UpgradeCard
            upgrade$={shopStore.availableUpgrades[index]}
            onPurchase={purchase}
            isAffordable={canAfford(item.cost)}
          />
        )}
      />
    </View>
  )
})
```

**Step 3: REFACTOR - Optimize FlatList**

**FILE STRUCTURE CREATED**:
```
frontend/modules/shop/
├── UpgradeCard.tsx          # NEW - Individual upgrade UI
├── UpgradeCard.test.tsx     # NEW - Co-located tests
├── ShopScreen.tsx           # MODIFIED - Add FlatList
└── ShopScreen.test.tsx      # MODIFIED - Add list tests
```

**ACCEPTANCE CRITERIA**:
- [ ] UpgradeCard displays all upgrade details
- [ ] Buy button triggers purchase action
- [ ] Button disabled when cannot afford
- [ ] Disabled state has clear visual indication
- [ ] FlatList renders all available upgrades
- [ ] FlatList maintains 60fps with 100+ items
- [ ] Touch targets meet 44x44pt minimum
- [ ] All tests pass following TDD cycle

**DELIVERABLES**:
1. UpgradeCard component with full functionality
2. FlatList integration in ShopScreen
3. Affordability-based visual feedback
4. Performance optimizations

**DEPENDENCIES**: Task 4.1 (purchase hook)

---

## Phase 6: Purchase UI Feedback

_Duration: 0.5 days | Priority: P0 | Prerequisites: Task 5.1_

### Task 6.1: Implement Purchased State with TDD

**ROLE**: You are a senior React Native developer implementing purchase feedback

**CONTEXT**: From TDD Section 11, Phase 2, Feature 5. After purchase, upgrades should show "Purchased" state and remain visible but disabled.

**OBJECTIVE**: Add purchased state indication to UpgradeCard following TDD

**TDD IMPLEMENTATION CYCLE**:

#### Cycle 1: RED - Purchased Label

**Step 1: Write Failing Test**
```typescript
// File: frontend/modules/shop/UpgradeCard.test.tsx
test('shows purchased label when upgrade purchased', () => {
  const upgrade$ = observable(mockUpgrade)
  shopStore.purchasedUpgrades.set([mockUpgrade.id])

  // This test FAILS initially (purchased state not implemented)
  render(<UpgradeCard upgrade$={upgrade$} isPurchased={true} />)

  expect(screen.getByText(/purchased/i)).toBeTruthy()
})
```

**Step 2: GREEN - Add Conditional Render**
```typescript
export const UpgradeCard = observer(({
  upgrade$,
  onPurchase,
  isAffordable,
  isPurchased
}: {
  upgrade$: Observable<Upgrade>
  onPurchase: (id: string) => void
  isAffordable: boolean
  isPurchased: boolean
}) => {
  return (
    <View>
      {/* ... existing content ... */}
      {isPurchased ? (
        <Text>Purchased ✓</Text>
      ) : (
        <TouchableOpacity
          onPress={() => onPurchase(id)}
          disabled={!isAffordable}
        >
          <Text>Buy</Text>
        </TouchableOpacity>
      )}
    </View>
  )
})
```

**Step 3: REFACTOR - Add Styling**

#### Cycle 2: RED - Integration Test

**Step 1: Write Failing Test**
```typescript
// File: frontend/modules/shop/ShopScreen.test.tsx
test('shows purchased state after purchase', async () => {
  scrapStore.scrap.set(200)
  shopStore.availableUpgrades.set([mockUpgrade])

  const user = userEvent.setup()
  render(<ShopScreen />)

  const buyButton = screen.getByText(/buy/i)
  await user.press(buyButton)

  await waitFor(() => {
    expect(screen.getByText(/purchased/i)).toBeTruthy()
    expect(screen.queryByText(/buy/i)).toBeNull()
  })
})
```

**Step 2: GREEN - Connect isPurchased**
```typescript
// File: frontend/modules/shop/ShopScreen.tsx
const { purchase, canAfford, isPurchased } = useUpgradePurchase()

<FlatList
  data={upgrades}
  renderItem={({ item, index }) => (
    <UpgradeCard
      upgrade$={shopStore.availableUpgrades[index]}
      onPurchase={purchase}
      isAffordable={canAfford(item.cost)}
      isPurchased={isPurchased(item.id)}
    />
  )}
/>
```

**Step 3: REFACTOR - Optimize Re-renders**

**FILE STRUCTURE MODIFIED**:
```
frontend/modules/shop/
├── UpgradeCard.tsx          # MODIFIED - Add purchased state
├── UpgradeCard.test.tsx     # MODIFIED - Add purchased tests
└── ShopScreen.tsx           # MODIFIED - Pass isPurchased
```

**ACCEPTANCE CRITERIA**:
- [ ] Purchased upgrades show "Purchased" label
- [ ] Buy button hidden when purchased
- [ ] Purchased state persists across app restarts
- [ ] Visual distinction for purchased items
- [ ] All tests pass
- [ ] Smooth UI transition on purchase

**DELIVERABLES**:
1. Purchased state UI in UpgradeCard
2. Integration with purchase hook
3. Persistence verification

**DEPENDENCIES**: Task 5.1

---

## Phase 7: Integration & Polish

_Duration: 1 day | Priority: P1 | Prerequisites: Task 6.1_

### Task 7.1: Integration Testing & Performance Optimization

**ROLE**: You are a QA engineer and performance specialist

**CONTEXT**: All components built, need end-to-end testing and performance validation per TDD Section 7 (TDD Strategy).

**OBJECTIVE**: Create integration tests and optimize performance to meet TDD benchmarks

**IMPLEMENTATION STEPS**:

1. **End-to-End Purchase Flow Test**:

```typescript
// File: frontend/modules/shop/__tests__/shop.integration.test.tsx (NEW)
describe('Shop Integration - Purchase Flow', () => {
  test('complete purchase flow from main screen', async () => {
    scrapStore.scrap.set(200)
    shopStore.availableUpgrades.set([mockUpgrade])

    const user = userEvent.setup()
    render(<App />)

    // 1. Navigate to shop
    const shopButton = screen.getByText(/shop/i)
    await user.press(shopButton)

    await waitFor(() => {
      expect(screen.getByTestId('shop-screen')).toBeTruthy()
    })

    // 2. Verify scrap balance
    expect(screen.getByText(/200.*scrap/i)).toBeTruthy()

    // 3. Purchase upgrade
    const buyButton = screen.getByText(/buy/i)
    await user.press(buyButton)

    await waitFor(() => {
      expect(screen.getByText(/purchased/i)).toBeTruthy()
      expect(screen.getByText(/100.*scrap/i)).toBeTruthy()
    })

    // 4. Navigate back
    const backButton = screen.getByLabelText(/back/i)
    await user.press(backButton)

    await waitFor(() => {
      expect(screen.getByTestId('clicker-screen')).toBeTruthy()
    })
  })
})
```

2. **Performance Benchmarks**:

```typescript
test('shop screen renders in < 200ms with 50 upgrades', () => {
  const upgrades = Array(50).fill(null).map((_, i) => ({
    ...mockUpgrade,
    id: `upgrade-${i}`
  }))
  shopStore.availableUpgrades.set(upgrades)

  const startTime = performance.now()
  render(<ShopScreen />)
  const endTime = performance.now()

  expect(endTime - startTime).toBeLessThan(200)
})

test('FlatList maintains 60fps with 100 upgrades', () => {
  const upgrades = Array(100).fill(null).map((_, i) => ({
    ...mockUpgrade,
    id: `upgrade-${i}`
  }))
  shopStore.availableUpgrades.set(upgrades)

  render(<ShopScreen />)

  // FlatList optimization verification
  const list = screen.getByTestId('upgrade-list')
  expect(list.props.windowSize).toBe(10)
  expect(list.props.removeClippedSubviews).toBe(true)
})
```

3. **Accessibility Testing**:

```typescript
test('all interactive elements meet accessibility requirements', () => {
  render(<UpgradeCard upgrade$={observable(mockUpgrade)} />)

  const buyButton = screen.getByTestId('buy-button')
  const style = buyButton.props.style

  expect(style.minWidth).toBeGreaterThanOrEqual(44)
  expect(style.minHeight).toBeGreaterThanOrEqual(44)
})
```

4. **FlatList Optimizations**:

```typescript
// File: frontend/modules/shop/ShopScreen.tsx
<FlatList
  testID="upgrade-list"
  data={upgrades}
  keyExtractor={(item) => item.id}
  renderItem={({ item, index }) => (
    <UpgradeCard
      upgrade$={shopStore.availableUpgrades[index]}
      onPurchase={purchase}
      isAffordable={canAfford(item.cost)}
      isPurchased={isPurchased(item.id)}
    />
  )}
  windowSize={10}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  removeClippedSubviews={true}
  initialNumToRender={10}
/>
```

**FILE STRUCTURE CREATED**:
```
frontend/modules/shop/
└── __tests__/
    └── shop.integration.test.tsx    # NEW - E2E tests
```

**ACCEPTANCE CRITERIA**:
- [ ] Full purchase flow test passes
- [ ] Shop renders in <200ms with 50 upgrades
- [ ] FlatList maintains 60fps with 100+ items
- [ ] All touch targets ≥ 44x44pt
- [ ] Navigation completes in <500ms
- [ ] Memory usage < 50MB per navigation cycle
- [ ] All accessibility requirements met

**DELIVERABLES**:
1. Integration test suite
2. Performance benchmarks
3. FlatList optimizations
4. Accessibility verification

**DEPENDENCIES**: Task 6.1

---

## Phase 8: Documentation & Cleanup

_Duration: 0.5 days | Priority: P1 | Prerequisites: Task 7.1_

### Task 8.1: Create Documentation and Examples

**ROLE**: You are a technical writer creating developer documentation

**CONTEXT**: Shop system complete, needs documentation for future upgrades and maintenance

**OBJECTIVE**: Document shop system usage and create example upgrades

**IMPLEMENTATION STEPS**:

1. **Create README**:

```markdown
<!-- File: frontend/modules/shop/README.md (NEW) -->
# Shop Module

Upgrade shop system for purchasing permanent game improvements with scrap.

## Features

- ✅ Navigation from main screen to shop
- ✅ Scrap balance display
- ✅ Upgrade list with affordability indication
- ✅ Purchase validation and scrap deduction
- ✅ Purchase tracking with persistence
- ✅ Effect application (SCRAP_PER_PET, PETS_PER_FEED)
- ✅ Empty state when no upgrades

## Architecture

### File Structure

```
shop/
├── ShopScreen.tsx              # Main shop screen
├── ShopScreen.test.tsx         # Screen tests
├── UpgradeCard.tsx             # Upgrade display
├── UpgradeCard.test.tsx        # Card tests
├── EmptyState.tsx              # Empty shop state
├── EmptyState.test.tsx         # Empty state tests
├── hooks/
│   ├── useUpgradePurchase.ts   # Purchase behavior
│   └── useUpgradePurchase.test.tsx
├── stores/
│   ├── shop.store.ts           # Shop state
│   └── shop.store.test.ts
└── types.ts                    # TypeScript types
```

### State Management

- **Shop Store**: Legend-State observable with AsyncStorage persistence
- **Scrap Store**: Existing scrap module for balance management
- **Hooks**: Behavior-based hooks for purchase logic

## Usage

### Adding New Upgrades

```typescript
import { shopStore } from './stores/shop.store'
import { UpgradeType } from './types'

const newUpgrade = {
  id: 'better-food-2',
  name: 'Premium Food',
  description: 'Increases scrap per pet by 10',
  cost: 250,
  upgradeType: UpgradeType.SCRAP_PER_PET,
  effectValue: 10
}

shopStore.availableUpgrades.set([
  ...shopStore.availableUpgrades.get(),
  newUpgrade
])
```

### Testing

Run tests:
```bash
npm test -- shop
```

## Performance

- Shop screen renders in <200ms with 50 upgrades
- FlatList maintains 60fps with 100+ items
- Navigation completes in <500ms

## Future Enhancements

- Upgrade categories/tabs
- Sort/filter options
- Purchase animations
- Sound effects
```

2. **Create Example Upgrades**:

```typescript
// File: frontend/modules/shop/exampleUpgrades.ts (NEW)
import { UpgradeType, type Upgrade } from './types'

/**
 * Example upgrades for testing and development
 *
 * To use: shopStore.availableUpgrades.set(EXAMPLE_UPGRADES)
 */
export const EXAMPLE_UPGRADES: Upgrade[] = [
  {
    id: 'better-food-1',
    name: 'Better Food',
    description: 'Increases scrap gained per pet by 5',
    cost: 100,
    upgradeType: UpgradeType.SCRAP_PER_PET,
    effectValue: 5
  },
  {
    id: 'bulk-feeding-1',
    name: 'Bulk Feeding',
    description: 'Feed 2 pets at once instead of 1',
    cost: 150,
    upgradeType: UpgradeType.PETS_PER_FEED,
    effectValue: 1
  },
  {
    id: 'premium-food-1',
    name: 'Premium Food',
    description: 'Increases scrap gained per pet by 10',
    cost: 250,
    upgradeType: UpgradeType.SCRAP_PER_PET,
    effectValue: 10
  },
  {
    id: 'mass-feeding-1',
    name: 'Mass Feeding',
    description: 'Feed 5 pets at once',
    cost: 500,
    upgradeType: UpgradeType.PETS_PER_FEED,
    effectValue: 4
  }
]
```

3. **Add Inline Code Comments**:

Add JSDoc comments to all public functions and hooks explaining:
- Purpose
- Parameters
- Return values
- Example usage

**FILE STRUCTURE CREATED**:
```
frontend/modules/shop/
├── README.md                # NEW - Module documentation
└── exampleUpgrades.ts       # NEW - Example data
```

**ACCEPTANCE CRITERIA**:
- [ ] README documents all features
- [ ] Usage examples provided
- [ ] File structure documented
- [ ] Example upgrades created (4+)
- [ ] All public APIs have JSDoc comments
- [ ] Performance benchmarks documented

**DELIVERABLES**:
1. Complete README.md
2. Example upgrades file
3. Inline code documentation
4. Usage guide

**DEPENDENCIES**: Task 7.1

---

## Execution Guidelines

### For Development Team

1. **Execute tasks sequentially** - Each task builds on previous
2. **Follow TDD strictly** - Write tests before implementation
3. **Run tests frequently** - Verify each cycle (Red-Green-Refactor)
4. **Update task status** as you complete each one
5. **Document blockers** immediately if encountered

### Success Criteria

**Phase Completion**:
- All tests passing
- Performance benchmarks met
- Accessibility requirements satisfied
- Documentation complete

**Final Validation**:
- [ ] Shop navigation works from main screen
- [ ] Empty state displays correctly
- [ ] Upgrades can be purchased
- [ ] Scrap deducted correctly
- [ ] Effects applied properly
- [ ] Purchased state persists
- [ ] All TDD cycles documented in tests

---

## Summary Statistics

- **Total Tasks**: 8
- **Total Duration**: 6-7 days
- **Critical Path**: Tasks 1.1 → 2.2 → 3.1 → 4.1 → 5.1 → 6.1
- **Parallel Execution**: Tasks 2.1 and 2.2 can run in parallel
- **Test Coverage Target**: >80% for all new code
- **Performance Targets**: All from TDD met

---

_Generated from TDD: `tdd_upgrade_shop_20251113.md`_
_Generation timestamp: 2025-11-13_
_Optimized for: TDD-driven development with lean principles_
_Architecture: Feature-based with co-located tests_
