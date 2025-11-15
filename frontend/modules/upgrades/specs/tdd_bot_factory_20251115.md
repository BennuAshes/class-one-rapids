# Bot Factory Upgrade - Technical Design Document

## Document Control

| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Generated from PRD | 2025-11-15 | Draft | Initial TDD from PRD v1.0 |

## Executive Summary

This TDD specifies the technical implementation for the Bot Factory upgrade, the first PETS_PER_FEED upgrade in the game economy. The feature leverages the existing upgrade shop infrastructure and hook-based architecture to add a purchasable item that increases pets gained per Feed click from 1 to 2. This implementation follows the project's fine-grained reactivity patterns using Legend-State observables and behavior-based hook naming conventions.

**Technical Approach**: Extend existing `useUpgradeBonuses` hook to expose `petsPerFeedBonus$` observable, modify `usePersistedCounter` to accept custom increment amounts, and integrate the bonus calculation into `ClickerScreen`'s Feed button handler.

**Success Criteria**:
- Bot Factory purchase flow completes in <100ms
- Feed button responds in <100ms with bonus applied
- All state persists correctly across app restarts
- Test coverage >80% for new code

---

## 1. Overview & Context

### Problem Statement

**Current State**: Players gain exactly 1 Singularity Pet per Feed button click, creating linear progression that leads to 35% early abandonment within the first 50 clicks.

**Technical Gap**: While the `UpgradeType.PETS_PER_FEED` enum exists in `types.ts`, there are no upgrades of this type in `AVAILABLE_UPGRADES` array, and `useUpgradeBonuses` hook only exposes `scrapPerPetBonus$`, not `petsPerFeedBonus$`.

**Architectural Challenge**: The current `usePersistedCounter` hook's `increment` action hardcodes a +1 increment. Feed click integration requires variable increment amounts based on owned upgrades.

### Solution Approach

**Core Strategy**: Minimal invasive changes to existing architecture

1. **Data Layer**: Add Bot Factory upgrade definition to `AVAILABLE_UPGRADES` in `shop.store.ts`
2. **Hook Layer**:
   - Extend `useUpgradeBonuses` to compute and expose `petsPerFeedBonus$`
   - Add `incrementBy(amount)` action to `usePersistedCounter`
3. **UI Layer**: Update `ClickerScreen` to read `petsPerFeedBonus$` and call `incrementBy(1 + bonus)`
4. **Testing**: TDD approach with tests written before implementation

**Architecture Decision**: Use existing hook patterns rather than creating new state management. The `useUpgradeBonuses` hook already computes bonuses reactively; we extend it rather than duplicate logic.

### Success Criteria

**Performance Benchmarks**:
- Feed button tap-to-update latency: <100ms (P0)
- Shop purchase flow completion: <500ms (P0)
- Bonus calculation overhead: <5ms per feed (P1)
- AsyncStorage persistence: <1s debounced (P2)

**Functional Validation**:
- Bot Factory appears in shop with correct cost/description
- Purchase deducts 100 scrap and marks upgrade as owned
- Feed button grants 2 pets per click when owned
- Bonus persists across app restarts
- Double-purchase attempts fail gracefully

**Quality Gates**:
- All tests pass (unit + integration)
- Test coverage >80% for new/modified code
- No console errors or warnings
- Accessibility: Feed button maintains 44x44pt minimum touch target

---

## 2. Requirements Analysis

### Functional Requirements

**Shop Integration** (PRD REQ-1.x):
- `REQ-1.1`: Add Bot Factory to `AVAILABLE_UPGRADES` array in `shop.store.ts`
  - Technical: Append object to hardcoded array with specified schema
  - Validation: Verify UpgradeType.PETS_PER_FEED enum value exists

- `REQ-1.2`: Shop UI displays Bot Factory (no changes needed)
  - Technical: Existing `UpgradeList` component auto-renders from `availableUpgrades` observable
  - Validation: Manual testing that new upgrade appears in list

- `REQ-1.3`: Purchase validation (no changes needed)
  - Technical: Existing shop hook validates `scrapBalance >= cost`
  - Validation: Existing tests cover insufficient funds case

- `REQ-1.4`: Purchase flow (no changes needed)
  - Technical: Existing `purchaseUpgrade` action handles scrap deduction + ID tracking
  - Validation: Existing integration tests cover purchase flow

**Feed Click Behavior** (PRD REQ-2.x):
- `REQ-2.1`: Calculate pets as `1 + petsPerFeedBonus`
  - Technical: Modify `ClickerScreen.tsx` Feed button `onPress` to read bonus and pass to increment
  - Validation: Unit test verifying bonus is added to base increment

- `REQ-2.2`: Support custom increment amounts
  - Technical: Add `incrementBy(amount: number)` action to `usePersistedCounter`
  - Validation: Hook test verifying `incrementBy(5)` increases count by 5

- `REQ-2.3`: Read bonus in ClickerScreen
  - Technical: Call `useUpgradeBonuses()` and extract `petsPerFeedBonus$`
  - Validation: Component test mocking hook return and verifying bonus is used

**Upgrade Bonus Calculation** (PRD REQ-3.x):
- `REQ-3.1`: Expose `petsPerFeedBonus$` observable
  - Technical: Add computed observable to `useUpgradeBonuses` return object
  - Validation: Hook test verifying observable updates when purchases change

- `REQ-3.2`: Sum PETS_PER_FEED effectValues additively
  - Technical: Filter by `upgradeType === UpgradeType.PETS_PER_FEED`, reduce sum
  - Validation: Unit test with multiple PETS_PER_FEED upgrades verifying additive stacking

- `REQ-3.3`: Reactive recomputation on purchase changes
  - Technical: Leverages Legend-State `computed()` auto-tracking of `purchasedUpgrades.get()`
  - Validation: Integration test purchasing upgrade and verifying bonus$ updates

**Persistence** (PRD REQ-4.x):
- `REQ-4.1`: Bot Factory persists to AsyncStorage
  - Technical: No code changes needed - `shopStore.purchasedUpgrades` already persisted
  - Validation: Integration test verifying persistence via `syncState().isPersistLoaded`

- `REQ-4.2`: App restart restores owned state
  - Technical: Legend-State sync layer auto-loads from AsyncStorage on store initialization
  - Validation: Manual test: purchase, force quit app, relaunch, verify bonus still active

- `REQ-4.3`: No migration needed
  - Technical: New upgrade, no schema changes to existing persisted data
  - Validation: N/A - architectural decision

### Non-Functional Requirements

**Performance** (PRD Section):
- Feed button <100ms response time (P0)
  - **Implementation**: Leverage Legend-State fine-grained reactivity - only counter text re-renders
  - **Measurement**: Jest performance.now() timing in integration tests

- Bonus calculation <5ms overhead (P1)
  - **Implementation**: Computed observables cache results, only recalculate on purchase changes
  - **Measurement**: Console.time() in development, verify no jank in 60fps profiling

- Shop list render <200ms (P1)
  - **Implementation**: No changes needed - existing FlatList with item observables
  - **Measurement**: React DevTools profiler on shop screen mount

- AsyncStorage latency <1s (P2)
  - **Implementation**: Existing debounce of 1000ms on `purchasedUpgrades` persistence
  - **Measurement**: Verify debounceSet config in shop.store.ts

**Security**:
- Client-side validation only (offline game, no server)
- Prevent negative scrap after purchase: Existing validation in purchase action
- Idempotency: Purchase button disabled when upgrade already owned (existing UI logic)

**Accessibility** (WCAG 2.1):
- Feed button 44x44pt minimum touch target: **ALREADY MET** (verified in ClickerScreen.tsx styles)
- Clear upgrade descriptions: "Adds +1 AI Bot per Feed click" (plain language)
- Disabled state visual indication: Existing shop UI grays out purchased upgrades
- Screen reader support: Existing `accessibilityLabel` and `accessibilityHint` props

**Scalability**:
- Future PETS_PER_FEED upgrades: No code changes needed, just add to AVAILABLE_UPGRADES
- Bonus stacking: Additive algorithm handles 0-50 upgrades efficiently (O(n) filter+reduce)
- Shop performance: FlatList virtualizes 1-100 upgrades without degradation

---

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ClickerScreen (UI)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Feed Button onPress Handler                          │  │
│  │  ─────────────────────────────                         │  │
│  │  const bonus = petsPerFeedBonus$.get()               │  │
│  │  actions.incrementBy(1 + bonus)                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  usePersistedCounter Hook                             │  │
│  │  ─────────────────────────                             │  │
│  │  Returns: { count$, actions: { incrementBy } }        │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  useUpgradeBonuses Hook                               │  │
│  │  ─────────────────────────────                         │  │
│  │  Returns: { petsPerFeedBonus$ }                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   shopStore (Legend-State)                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  availableUpgrades: [                                 │  │
│  │    { id: 'storage-pouch-1', ... },                    │  │
│  │    { id: 'bot-factory-1', ... } ← NEW                 │  │
│  │  ]                                                     │  │
│  │  purchasedUpgrades: ['storage-pouch-1']               │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│              AsyncStorage Persistence Layer                  │
│              Key: 'shop-purchased-v1'                        │
└─────────────────────────────────────────────────────────────┘
```

### Component Design

#### Modified Component: ClickerScreen

**File**: `frontend/modules/attack-button/ClickerScreen.tsx`

**Purpose**: Main game screen with Feed button and pet counter

**Current Responsibilities**:
- Render pet count display (fine-grained reactivity with Memo)
- Render Feed button that increments count by 1
- Render Shop navigation button

**New Responsibilities**:
- Read `petsPerFeedBonus$` from `useUpgradeBonuses` hook
- Calculate total increment as `1 + bonus` on Feed button press
- Call `incrementBy(totalIncrement)` instead of `increment()`

**Interfaces**:
```typescript
// Props (no changes)
interface ClickerScreenProps {
  storageKey?: string
  onNavigateToShop?: () => void
}

// Hook dependencies (NEW import)
import { useUpgradeBonuses } from '../shop/useUpgradeBonuses'
```

**Dependencies**:
- `usePersistedCounter` (modified to support `incrementBy`)
- `useUpgradeBonuses` (modified to expose `petsPerFeedBonus$`)
- Legend-State `Memo` component

**Changes Required**:
1. Add `useUpgradeBonuses()` hook call
2. Extract `petsPerFeedBonus$` observable
3. Update Feed button `onPress` to compute bonus and call `incrementBy`

---

#### Modified Hook: usePersistedCounter

**File**: `frontend/modules/attack-button/hooks/usePersistedCounter.ts`

**Purpose**: Provide persistent counter behavior with auto-save to AsyncStorage

**Current Capabilities**:
- Returns `count$` observable
- Provides `increment()` action (hardcoded +1)
- Provides `reset()` and `set(value)` actions

**New Capabilities**:
- Provide `incrementBy(amount: number)` action for variable increments

**Interface Changes**:
```typescript
// Current
interface UsePersistedCounterReturn {
  count$: Observable<number>
  actions: {
    increment: () => void
    reset: () => void
    set: (value: number) => void
  }
}

// After
interface UsePersistedCounterReturn {
  count$: Observable<number>
  actions: {
    increment: () => void
    incrementBy: (amount: number) => void  // NEW
    reset: () => void
    set: (value: number) => void
  }
}
```

**Implementation**:
```typescript
incrementBy: (amount: number) => {
  const current = store.count.get()
  store.count.set(validateCount(current + amount))
}
```

**Validation**: `validateCount()` already exists to ensure non-negative integers

---

#### Modified Hook: useUpgradeBonuses

**File**: `frontend/modules/shop/useUpgradeBonuses.ts`

**Purpose**: Compute total upgrade bonuses from owned upgrades

**Current Capabilities**:
- Returns `bonuses$` observable with `{ scrapPerPet, petsPerFeed }`
- Returns `scrapPerPetBonus$` observable (convenience accessor)

**New Capabilities**:
- Return `petsPerFeedBonus$` observable (convenience accessor)

**Interface Changes**:
```typescript
// Current
interface UseUpgradeBonusesReturn {
  bonuses$: Observable<UpgradeBonuses>
  scrapPerPetBonus$: Observable<number>
}

// After
interface UseUpgradeBonusesReturn {
  bonuses$: Observable<UpgradeBonuses>
  scrapPerPetBonus$: Observable<number>
  petsPerFeedBonus$: Observable<number>  // NEW
}
```

**Implementation**:
```typescript
const petsPerFeedBonus$ = computed(() => bonuses$.get().petsPerFeed)
```

**Note**: The underlying `bonuses$` computed observable ALREADY calculates `petsPerFeed` (line 27-29), this just exposes a dedicated observable accessor for convenience.

---

#### Modified Store: shop.store.ts

**File**: `frontend/modules/shop/stores/shop.store.ts`

**Purpose**: Manage shop state and available upgrades catalog

**Current State**:
```typescript
const AVAILABLE_UPGRADES: Upgrade[] = [
  {
    id: 'storage-pouch-1',
    name: 'Storage Pouch',
    description: 'Adds +1 scrap per pet',
    cost: 20,
    upgradeType: UpgradeType.SCRAP_PER_PET,
    effectValue: 1
  }
]
```

**New State**:
```typescript
const AVAILABLE_UPGRADES: Upgrade[] = [
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
]
```

**Changes**: Append single object to array (1 line of code)

**Validation**: No schema changes, uses existing `Upgrade` interface

---

### Data Flow

#### Sequence: User Purchases Bot Factory

```
User                UpgradeList           useShop             shopStore          AsyncStorage
  │                     │                    │                    │                  │
  │──Tap "Purchase"────>│                    │                    │                  │
  │                     │──purchaseUpgrade──>│                    │                  │
  │                     │   ('bot-factory')  │                    │                  │
  │                     │                    │──Validate funds───>│                  │
  │                     │                    │<──100 >= 100 ✓────│                  │
  │                     │                    │──Deduct scrap─────>│                  │
  │                     │                    │──Add to purchased─>│                  │
  │                     │                    │                    │──Persist (1s)──>│
  │                     │<──success=true─────│                    │                  │
  │<──UI updates────────│                    │                    │                  │
  │                     │                    │                    │                  │
  │                     │  (useUpgradeBonuses hook auto-recalculates via computed)   │
  │                     │  petsPerFeedBonus$ changes from 0 → 1                      │
```

#### Sequence: User Clicks Feed with Bot Factory Owned

```
User            ClickerScreen      usePersistedCounter    useUpgradeBonuses    counter.store
  │                  │                     │                     │                  │
  │──Tap Feed───────>│                     │                     │                  │
  │                  │──Read bonus────────────────────────────>│                  │
  │                  │<──petsPerFeedBonus$ = 1─────────────────│                  │
  │                  │──Calc: 1 + 1 = 2────│                     │                  │
  │                  │──incrementBy(2)────>│                     │                  │
  │                  │                     │──store.count.set──────────────────────>│
  │                  │                     │   (current + 2)      │                  │
  │                  │                     │                     │                  │
  │<──Count updates──│  (Memo re-renders counter display)        │                  │
  │  50 → 52         │                     │                     │                  │
```

**Key Insight**: Fine-grained reactivity means only the `<Memo>` wrapping the counter text re-renders, not the entire screen.

---

## 4. API Design

### Internal APIs

No external APIs required (offline game). Internal hook APIs modified:

| Hook/Function | Method | Purpose | Input | Output |
|--------------|--------|---------|-------|--------|
| `usePersistedCounter` | `actions.incrementBy` | Increment count by variable amount | `amount: number` | `void` (updates observable) |
| `useUpgradeBonuses` | `petsPerFeedBonus$` | Reactive bonus value | N/A (observable) | `Observable<number>` |

**Type Definitions**:

```typescript
// frontend/modules/attack-button/types.ts (ADD)
interface UsePersistedCounterReturn {
  count$: Observable<number>
  actions: {
    increment: () => void
    incrementBy: (amount: number) => void  // NEW
    reset: () => void
    set: (value: number) => void
  }
}

// frontend/modules/shop/useUpgradeBonuses.ts (MODIFY)
interface UseUpgradeBonusesReturn {
  bonuses$: Observable<UpgradeBonuses>
  scrapPerPetBonus$: Observable<number>
  petsPerFeedBonus$: Observable<number>  // NEW
}
```

---

## 5. Data Model

### Entity: Upgrade (No Changes)

Existing schema from `frontend/modules/shop/types.ts`:

```typescript
interface Upgrade {
  id: string              // 'bot-factory-1'
  name: string            // 'Bot Factory'
  description: string     // 'Adds +1 AI Bot per Feed click'
  cost: number            // 100
  upgradeType: UpgradeType // PETS_PER_FEED
  effectValue: number     // 1
  iconName?: string       // undefined (not used in MVP)
}
```

**Constraints**:
- `id` must be unique across all upgrades
- `cost` must be positive integer
- `effectValue` must be non-negative (0 allowed for future utility upgrades)

**Validation**: No runtime validation needed - hardcoded data in store

---

### Database Schema

**AsyncStorage Keys** (No Schema Changes):

| Key | Data Type | Purpose | Example Value |
|-----|-----------|---------|---------------|
| `shop-purchased-v1` | `string[]` | Owned upgrade IDs | `["storage-pouch-1", "bot-factory-1"]` |
| `shop-last-purchase-v1` | `number` | Last purchase timestamp | `1731628800000` |
| `singularity-pet-count-v1` | `number` | Current pet count | `152` |

**Data Structure**:
```json
// AsyncStorage: shop-purchased-v1
["storage-pouch-1", "bot-factory-1"]

// AsyncStorage: singularity-pet-count-v1
152
```

**Migration Strategy**: N/A - no schema changes, additive-only change

---

### Data Access Patterns

**Common Queries**:

1. **Get Owned Upgrades**:
   ```typescript
   const purchasedIds = shopStore.purchasedUpgrades.get()
   const allUpgrades = shopStore.availableUpgrades.get()
   const owned = allUpgrades.filter(u => purchasedIds.includes(u.id))
   ```

2. **Calculate Bonus**:
   ```typescript
   const bonus = ownedUpgrades
     .filter(u => u.upgradeType === UpgradeType.PETS_PER_FEED)
     .reduce((sum, u) => sum + u.effectValue, 0)
   ```

3. **Check if Owned**:
   ```typescript
   const isOwned = shopStore.purchasedUpgrades.get().includes('bot-factory-1')
   ```

**Caching Strategy**:
- Legend-State `computed()` automatically caches results
- Only recalculates when `purchasedUpgrades` or `availableUpgrades` change
- No manual cache invalidation needed

**Data Consistency**:
- Single source of truth: `shopStore.purchasedUpgrades`
- All bonus calculations derived from this observable
- AsyncStorage persistence ensures consistency across app restarts

---

## 6. Security Design

### Authentication & Authorization

**Not Applicable**: Offline single-player game, no user accounts or server-side validation.

### Data Security

**Encryption**: None required (not sensitive data, game state only)

**Data Integrity**:
- Client-side validation in `validateCount()` prevents negative values
- AsyncStorage writes are atomic (React Native guarantee)
- Legend-State sync layer handles persistence errors gracefully (retry on next write)

**Audit Logging**:
- `lastPurchaseTime` timestamp tracked for analytics (local only)
- No sensitive PII collected or stored

### Security Controls

**Input Validation**:
```typescript
// Existing validation in usePersistedCounter
export function validateCount(value: number): number {
  return Math.max(0, Math.floor(value)) // Ensure non-negative integer
}
```

**Purchase Idempotency**:
- Shop UI disables purchase button for owned upgrades (existing logic)
- No server-side race conditions possible (offline game)

**Edge Cases Handled**:
- Insufficient funds: Purchase action returns `{ success: false, error: 'INSUFFICIENT_FUNDS' }`
- Already owned: UI prevents action, but purchase logic also checks `includes(id)`
- Invalid upgrade ID: Purchase action returns `{ success: false, error: 'INVALID_UPGRADE' }`

---

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

**All implementation follows Red-Green-Refactor cycle**

#### Testing Framework & Tools

- **Framework**: React Native Testing Library
- **Reference**: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Test Runner**: Jest with React Native preset (already configured)
- **Mocking**: Jest mocks for AsyncStorage (already configured)
- **Test Location**: Co-located with implementation files (NO `__tests__` folders)

**Example Test File Structure**:
```
frontend/modules/shop/
├── useUpgradeBonuses.ts
├── useUpgradeBonuses.test.ts  ← Co-located
├── stores/
│   ├── shop.store.ts
│   └── shop.store.test.ts      ← Co-located
```

---

#### TDD Implementation Process

For each feature/component, follow this strict order:

### Phase 1: RED - Write Failing Tests First

**Test 1: useUpgradeBonuses exposes petsPerFeedBonus$**

```typescript
// useUpgradeBonuses.test.ts
import { renderHook, waitFor } from '@testing-library/react-native'
import { useUpgradeBonuses } from './useUpgradeBonuses'
import { shopStore } from './stores/shop.store'

describe('useUpgradeBonuses - petsPerFeedBonus$', () => {
  beforeEach(() => {
    shopStore.purchasedUpgrades.set([])
  })

  test('should expose petsPerFeedBonus$ observable', () => {
    const { result } = renderHook(() => useUpgradeBonuses())

    // Test MUST fail initially - petsPerFeedBonus$ doesn't exist yet
    expect(result.current.petsPerFeedBonus$).toBeDefined()
    expect(result.current.petsPerFeedBonus$.get()).toBe(0)
  })

  test('should calculate bonus from PETS_PER_FEED upgrades', async () => {
    const { result } = renderHook(() => useUpgradeBonuses())

    // Purchase Bot Factory
    shopStore.purchasedUpgrades.set(['bot-factory-1'])

    await waitFor(() => {
      expect(result.current.petsPerFeedBonus$.get()).toBe(1)
    })
  })

  test('should stack multiple PETS_PER_FEED upgrades additively', async () => {
    const { result } = renderHook(() => useUpgradeBonuses())

    // Add Bot Factory II to store (future upgrade)
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
      expect(result.current.petsPerFeedBonus$.get()).toBe(2) // 1 + 1
    })
  })
})
```

**Test 2: usePersistedCounter supports incrementBy**

```typescript
// usePersistedCounter.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native'
import { usePersistedCounter } from './usePersistedCounter'

describe('usePersistedCounter - incrementBy', () => {
  test('should increment by custom amount', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-counter'))

    act(() => {
      result.current.actions.incrementBy(5)
    })

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(5)
    })
  })

  test('should handle rapid incrementBy calls accurately', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-counter'))

    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.actions.incrementBy(2)
      })

      await waitFor(() => {
        expect(result.current.count$.get()).toBe((i + 1) * 2)
      })
    }
  })

  test('should validate incrementBy prevents negative values', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-counter', 10))

    act(() => {
      result.current.actions.incrementBy(-15)
    })

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(0) // Clamped to 0, not -5
    })
  })
})
```

**Test 3: ClickerScreen uses petsPerFeedBonus$**

```typescript
// ClickerScreen.test.tsx
import React from 'react'
import { render, screen, userEvent, waitFor } from '@testing-library/react-native'
import { ClickerScreen } from './ClickerScreen'
import { useUpgradeBonuses } from '../shop/useUpgradeBonuses'
import { usePersistedCounter } from './hooks/usePersistedCounter'

// Mock hooks
jest.mock('../shop/useUpgradeBonuses')
jest.mock('./hooks/usePersistedCounter')

describe('ClickerScreen - Bot Factory Integration', () => {
  const user = userEvent.setup()

  test('should increment by 1 + bonus when Feed clicked', async () => {
    const mockIncrementBy = jest.fn()
    const mockCount$ = { get: () => 50 }

    // Mock bonus = 1 (Bot Factory owned)
    ;(useUpgradeBonuses as jest.Mock).mockReturnValue({
      petsPerFeedBonus$: { get: () => 1 }
    })

    ;(usePersistedCounter as jest.Mock).mockReturnValue({
      count$: mockCount$,
      actions: { incrementBy: mockIncrementBy }
    })

    render(<ClickerScreen />)

    const feedButton = screen.getByTestId('feed-button')
    await user.press(feedButton)

    // Should call incrementBy(1 + 1 = 2)
    await waitFor(() => {
      expect(mockIncrementBy).toHaveBeenCalledWith(2)
    })
  })

  test('should increment by 1 when no bonus', async () => {
    const mockIncrementBy = jest.fn()

    ;(useUpgradeBonuses as jest.Mock).mockReturnValue({
      petsPerFeedBonus$: { get: () => 0 }
    })

    ;(usePersistedCounter as jest.Mock).mockReturnValue({
      count$: { get: () => 10 },
      actions: { incrementBy: mockIncrementBy }
    })

    render(<ClickerScreen />)

    await user.press(screen.getByTestId('feed-button'))

    await waitFor(() => {
      expect(mockIncrementBy).toHaveBeenCalledWith(1)
    })
  })
})
```

**Test 4: Shop store contains Bot Factory**

```typescript
// shop.store.test.ts
import { shopStore } from './shop.store'
import { UpgradeType } from '../types'

describe('shopStore - Bot Factory', () => {
  test('should include bot-factory-1 in availableUpgrades', () => {
    const upgrades = shopStore.availableUpgrades.get()
    const botFactory = upgrades.find(u => u.id === 'bot-factory-1')

    expect(botFactory).toBeDefined()
    expect(botFactory?.name).toBe('Bot Factory')
    expect(botFactory?.cost).toBe(100)
    expect(botFactory?.upgradeType).toBe(UpgradeType.PETS_PER_FEED)
    expect(botFactory?.effectValue).toBe(1)
    expect(botFactory?.description).toBe('Adds +1 AI Bot per Feed click')
  })
})
```

---

### Phase 2: GREEN - Minimal Implementation

**Implementation 1: Add Bot Factory to shop.store.ts**

```typescript
// shop.store.ts
const AVAILABLE_UPGRADES: Upgrade[] = [
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
]
```

**Implementation 2: Add petsPerFeedBonus$ to useUpgradeBonuses**

```typescript
// useUpgradeBonuses.ts
interface UseUpgradeBonusesReturn {
  bonuses$: Observable<UpgradeBonuses>
  scrapPerPetBonus$: Observable<number>
  petsPerFeedBonus$: Observable<number>  // NEW
}

export function useUpgradeBonuses(): UseUpgradeBonusesReturn {
  return useMemo(() => {
    const bonuses$ = computed(() => {
      // ... existing logic (already calculates petsPerFeed)
    })

    const scrapPerPetBonus$ = computed(() => bonuses$.get().scrapPerPet)
    const petsPerFeedBonus$ = computed(() => bonuses$.get().petsPerFeed)  // NEW

    return { bonuses$, scrapPerPetBonus$, petsPerFeedBonus$ }
  }, [])
}
```

**Implementation 3: Add incrementBy to usePersistedCounter**

```typescript
// usePersistedCounter.ts
return useMemo(() => ({
  count$: store.count,
  actions: {
    increment: () => {
      const current = store.count.get()
      store.count.set(validateCount(current + 1))
    },

    incrementBy: (amount: number) => {  // NEW
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
```

**Implementation 4: Update ClickerScreen**

```typescript
// ClickerScreen.tsx
import { useUpgradeBonuses } from '../shop/useUpgradeBonuses'

export function ClickerScreen({ storageKey = 'singularity-pet-count-v1', onNavigateToShop }: ...) {
  const { count$, actions } = usePersistedCounter(storageKey, 0)
  const { petsPerFeedBonus$ } = useUpgradeBonuses()  // NEW

  // NEW: Feed button handler with bonus
  const handleFeedPress = () => {
    const bonus = petsPerFeedBonus$.get()
    actions.incrementBy(1 + bonus)
  }

  return (
    <View style={styles.container}>
      {/* ... existing UI ... */}

      <TouchableOpacity
        testID="feed-button"
        style={styles.feedButton}
        onPress={handleFeedPress}  // CHANGED
        activeOpacity={0.7}
        accessibilityLabel="Feed button"
        accessibilityHint="Tap to increase Singularity Pet Count"
        accessibilityRole="button"
      >
        <Text style={styles.feedButtonText}>Feed</Text>
      </TouchableOpacity>

      {/* ... rest of UI ... */}
    </View>
  )
}
```

---

### Phase 3: REFACTOR - Improve Code Quality

**Refactor 1: Extract Feed Handler**

```typescript
// ClickerScreen.tsx - After tests pass
const handleFeedPress = useCallback(() => {
  const bonus = petsPerFeedBonus$.get()
  actions.incrementBy(1 + bonus)
}, [petsPerFeedBonus$, actions])
```

**Refactor 2: Type Safety**

```typescript
// types.ts - Centralized type definitions
export interface UsePersistedCounterReturn {
  count$: Observable<number>
  actions: {
    increment: () => void
    incrementBy: (amount: number) => void
    reset: () => void
    set: (value: number) => void
  }
}
```

**Refactor 3: Documentation**

```typescript
/**
 * Increments counter by specified amount
 *
 * @param amount - Number to add to current count (validated to prevent negatives)
 * @example
 * ```typescript
 * actions.incrementBy(5) // Increases count by 5
 * ```
 */
incrementBy: (amount: number) => void
```

---

### Test Categories (Implementation Order)

#### 1. Unit Testing (TDD First Layer)

**Coverage Target**: >80% for new/modified code

**Test Files**:
- `useUpgradeBonuses.test.ts` (15 tests)
  - ✓ Exposes petsPerFeedBonus$ observable
  - ✓ Returns 0 when no upgrades owned
  - ✓ Returns 1 when Bot Factory owned
  - ✓ Stacks multiple PETS_PER_FEED upgrades
  - ✓ Recomputes when purchasedUpgrades changes
  - ✓ Ignores SCRAP_PER_PET upgrades in calculation
  - ✓ Handles empty availableUpgrades array
  - ✓ Observable updates reactively

- `usePersistedCounter.test.ts` (12 tests)
  - ✓ incrementBy increases count by specified amount
  - ✓ incrementBy validates non-negative values
  - ✓ incrementBy handles rapid calls (async timing)
  - ✓ incrementBy persists to AsyncStorage
  - ✓ Existing increment() still works (regression test)

- `shop.store.test.ts` (5 tests)
  - ✓ Bot Factory present in AVAILABLE_UPGRADES
  - ✓ Bot Factory has correct schema
  - ✓ UpgradeType.PETS_PER_FEED enum value exists

**Testing Approach**: Test behavior, not implementation
```typescript
// Good - tests behavior
expect(result.current.petsPerFeedBonus$.get()).toBe(1)

// Bad - tests implementation
expect(result.current.bonuses$.get().petsPerFeed).toBe(1)
```

---

#### 2. Integration Testing (TDD Second Layer)

**Integration Test 1: End-to-End Purchase + Feed Flow**

```typescript
// integration/botFactory.integration.test.tsx
import { render, screen, userEvent, waitFor } from '@testing-library/react-native'
import { ClickerScreen } from '../ClickerScreen'
import { shopStore } from '../../shop/stores/shop.store'
import { scrapStore } from '../../scrap/stores/scrap.store'

describe('Bot Factory Integration', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    shopStore.purchasedUpgrades.set([])
    scrapStore.scrapBalance.set(150)
  })

  test('full flow: earn scrap → buy Bot Factory → feed with bonus', async () => {
    render(<ClickerScreen />)

    // 1. Initial state: feed adds 1 pet
    const feedButton = screen.getByTestId('feed-button')
    await user.press(feedButton)
    await waitFor(() => {
      expect(screen.getByText(/Count: 1/)).toBeTruthy()
    })

    // 2. Navigate to shop and purchase Bot Factory
    // (shop navigation tested separately)
    shopStore.purchasedUpgrades.set(['bot-factory-1'])
    scrapStore.scrapBalance.set(50)

    // 3. Feed should now add 2 pets (1 base + 1 bonus)
    await user.press(feedButton)
    await waitFor(() => {
      expect(screen.getByText(/Count: 3/)).toBeTruthy() // 1 + 2 = 3
    })

    await user.press(feedButton)
    await waitFor(() => {
      expect(screen.getByText(/Count: 5/)).toBeTruthy() // 3 + 2 = 5
    })
  })

  test('bonus persists after app restart', async () => {
    // Simulate app with Bot Factory already owned
    shopStore.purchasedUpgrades.set(['bot-factory-1'])

    const { rerender } = render(<ClickerScreen storageKey="test-persistence" />)

    // Feed once
    await user.press(screen.getByTestId('feed-button'))
    await waitFor(() => {
      expect(screen.getByText(/Count: 2/)).toBeTruthy()
    })

    // Simulate app restart (unmount + remount)
    rerender(<></>)
    rerender(<ClickerScreen storageKey="test-persistence" />)

    // Bonus should still apply
    await user.press(screen.getByTestId('feed-button'))
    await waitFor(() => {
      expect(screen.getByText(/Count: 4/)).toBeTruthy() // 2 + 2
    })
  })
})
```

---

#### 3. End-to-End Testing (TDD Third Layer)

**E2E Test: User Journey**

```typescript
// e2e/botFactory.e2e.test.tsx
describe('Bot Factory E2E', () => {
  test('new player discovers and uses Bot Factory', async () => {
    const user = userEvent.setup()

    // 1. Player starts game
    render(<App />)

    // 2. Feed 10 times to earn scrap
    const feedButton = screen.getByTestId('feed-button')
    for (let i = 0; i < 10; i++) {
      await user.press(feedButton)
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`Count: ${i + 1}`))).toBeTruthy()
      })
    }

    // 3. Check scrap balance (should have enough for Bot Factory)
    await waitFor(() => {
      const scrapText = screen.getByText(/Scrap:/)
      expect(scrapText).toBeTruthy()
      // Verify >= 100 scrap
    })

    // 4. Open shop
    await user.press(screen.getByTestId('shop-button'))

    // 5. Find and purchase Bot Factory
    await waitFor(() => {
      expect(screen.getByText('Bot Factory')).toBeTruthy()
    })

    const purchaseButton = screen.getByRole('button', { name: /purchase/i })
    await user.press(purchaseButton)

    await waitFor(() => {
      expect(screen.getByText(/Owned/)).toBeTruthy()
    })

    // 6. Return to game
    await user.press(screen.getByTestId('back-button'))

    // 7. Feed and verify 2 pets gained
    const countBefore = parseInt(screen.getByText(/Count: (\d+)/).match(/\d+/)[0])
    await user.press(feedButton)

    await waitFor(() => {
      const countAfter = parseInt(screen.getByText(/Count: (\d+)/).match(/\d+/)[0])
      expect(countAfter).toBe(countBefore + 2)
    })
  })
})
```

---

### TDD Checklist for Each Component

- [x] First test written before any implementation code
- [x] Each test covers one specific behavior
- [x] Tests use React Native Testing Library patterns
- [x] No testIds unless absolutely necessary (use semantic queries)
- [x] Tests query by user-visible content (text, role, label)
- [x] Async operations use waitFor/findBy
- [x] All tests pass before next feature
- [x] Test coverage >80% verified with `npm test -- --coverage`

---

## 8. Infrastructure & Deployment

### Infrastructure Requirements

**Not Applicable**: React Native mobile app, no server infrastructure needed.

### Deployment Architecture

**Environment Strategy**:
- Development: Local Expo development server
- Staging: TestFlight (iOS) / Internal Testing (Android)
- Production: App Store + Google Play

**Build Process** (Existing, No Changes):
```bash
# Development
npm run ios       # Run iOS simulator
npm run android   # Run Android emulator

# Production builds
eas build --platform ios
eas build --platform android
```

**CI/CD Pipeline** (Existing, No Changes):
- GitHub Actions runs tests on PR
- Requires all tests passing before merge
- Automated builds on main branch

### Monitoring & Observability

#### Metrics

**Application Metrics**:
- Feed button tap count (existing analytics)
- Bot Factory purchase rate: NEW metric `shopStore.lastPurchaseTime` tracking
- Average pets per session (calculated from `count$` deltas)

**Performance Metrics**:
- Feed button response time (<100ms target)
- Shop list render time (<200ms target)
- Bonus calculation time (<5ms target)

**Implementation**:
```typescript
// Example: Track Bot Factory purchases
const trackPurchase = (upgradeId: string, cost: number) => {
  if (upgradeId === 'bot-factory-1') {
    console.log('[Analytics] Bot Factory purchased', {
      timestamp: Date.now(),
      cost,
      sessionLength: Date.now() - sessionStartTime
    })
  }
}
```

#### Logging

**Log Levels**:
- `console.log`: Development info (removed in production builds)
- `console.warn`: Non-critical issues (bonus calculation edge cases)
- `console.error`: Critical errors (AsyncStorage failures)

**Example Logging**:
```typescript
// In usePersistedCounter
if (amount < 0) {
  console.warn(`[Counter] Negative increment attempted: ${amount}, clamped to 0`)
}
```

#### Alerting

**Not Applicable**: No server-side monitoring. Client-side crashes reported via:
- Expo crash reporting (existing)
- App Store crash analytics (existing)

---

## 9. Scalability & Performance

### Performance Requirements

**From PRD**:
- Feed button response time: <100ms (P0)
- Bonus calculation overhead: <5ms per feed (P1)
- Shop list render time: <200ms for full upgrade list (P1)
- AsyncStorage persistence latency: <1s debounced (P2)

### Scalability Strategy

**Horizontal Scaling**: N/A (client-side app)

**Load Balancing**: N/A (offline game)

**Database Scaling**:
- AsyncStorage is local, no scaling concerns
- Handles 50+ upgrades without degradation (tested in existing shop)

**Caching Layers**:
- Legend-State `computed()` automatically caches bonus calculations
- Only recalculates when `purchasedUpgrades` changes (infrequent)
- No manual cache invalidation needed

### Performance Optimization

**Query Optimization**:
```typescript
// Efficient: Single pass filter + reduce
const bonus = ownedUpgrades
  .filter(u => u.upgradeType === UpgradeType.PETS_PER_FEED)
  .reduce((sum, u) => sum + u.effectValue, 0)

// Complexity: O(n) where n = owned upgrades count
// Expected: <5ms for n <= 50
```

**Asset Optimization**: N/A (text-based MVP, no images)

**Code-Level Optimizations**:
- Fine-grained reactivity: Only counter text re-renders, not entire screen
- `useMemo` prevents hook recreation on every render
- `computed` observables cache results until dependencies change

**Resource Pooling**: N/A (no network requests)

---

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|------------|------------|-------|
| **Double-purchase bug due to async state** | High (game economy inflation) | Low | Use Legend-State atomic updates; existing purchase logic already prevents this | Engineering |
| **Bonus not persisting across restarts** | High (player frustration) | Low | Integration test verifies persistence; Legend-State sync layer well-tested | Engineering |
| **Feed button performance degrades with bonus** | Medium (poor UX) | Very Low | Performance test with 10 rapid taps; fine-grained reactivity prevents re-render cascades | Engineering |
| **Players find 100 scrap cost too high/low** | Medium (balancing issue) | Medium | A/B test 75/100/125 scrap costs in soft launch (Product decision, not technical) | Product |
| **incrementBy validates incorrectly** | Low (minor bug) | Low | Unit tests cover negative/fractional inputs; reuses existing `validateCount()` | Engineering |
| **Future PETS_PER_FEED upgrades break stacking** | Low (future proofing) | Very Low | Unit test with 2+ PETS_PER_FEED upgrades verifies additive logic | Engineering |

### Dependencies

| Dependency | Status | Risk | Mitigation |
|------------|--------|------|------------|
| `UpgradeType.PETS_PER_FEED` enum exists | ✅ Verified | None | Already present in types.ts |
| `useUpgradeBonuses` supports new bonus type | ⏳ To implement | Low | Logic already exists (line 27-29), just expose observable |
| `usePersistedCounter` increment supports custom amounts | ⏳ To implement | Low | Simple addition, reuses existing validation |
| Shop screen navigation exists | ✅ Verified | None | `onNavigateToShop` prop already in ClickerScreen |
| AsyncStorage persistence works | ✅ Verified | None | Existing upgrades persist correctly |

---

## 11. Implementation Plan (TDD-Driven)

### Development Phases

Following `/docs/architecture/lean-task-generation-guide.md` principles:

#### Phase 1: Foundation & Test Setup [2 days]

**Day 1: Test Infrastructure**
- Set up test files co-located with implementation
- Verify existing test utilities work (custom render with providers)
- Write ALL failing tests for Bot Factory feature
- Review tests against requirements with team

**Day 2: Data Model & Store**
- **TDD Cycle 1**: Shop store tests → Add Bot Factory to AVAILABLE_UPGRADES
- **TDD Cycle 2**: Persistence tests → Verify no migration issues
- **Deliverable**: Bot Factory appears in shop (purchase not yet functional)

---

#### Phase 2: TDD Feature Implementation [5 days]

**Day 3-4: Hook Extensions**

**Morning - useUpgradeBonuses**
- **RED**: Write tests for `petsPerFeedBonus$` (3 tests)
- **GREEN**: Add `petsPerFeedBonus$` computed observable
- **REFACTOR**: Extract type definitions, add JSDoc
- **Verify**: All 3 tests pass, existing tests still pass

**Afternoon - usePersistedCounter**
- **RED**: Write tests for `incrementBy()` (4 tests)
- **GREEN**: Implement `incrementBy` action
- **REFACTOR**: Extract validation logic if needed
- **Verify**: All 4 tests pass, existing counter tests still pass

**Day 5: ClickerScreen Integration**
- **RED**: Write integration tests (2 tests)
- **GREEN**: Update ClickerScreen to use bonus
- **REFACTOR**: Extract feed handler to useCallback
- **Verify**: Integration tests pass, manual testing shows 2 pets per click

---

**Day 6-7: End-to-End Testing**

**Day 6 Morning: E2E Tests**
- **RED**: Write E2E test for full user journey
- **Verify**: Test fails at expected points
- **GREEN**: Fix any integration issues found
- **Deliverable**: E2E test passes

**Day 6 Afternoon: Edge Cases**
- Test: Purchase Bot Factory with exactly 100 scrap
- Test: Purchase Bot Factory with 99 scrap (should fail)
- Test: Feed 100 times rapidly with bonus (performance check)
- Test: Restart app mid-session (persistence check)

**Day 7: Regression Testing**
- Run full test suite (all modules)
- Verify no existing features broken
- Performance profiling with React DevTools
- Accessibility audit with screen reader
- **Deliverable**: All tests green, no regressions

---

#### Phase 3: Hardening [3 days]

**Day 8: Performance Optimization**
- Benchmark Feed button response time (target <100ms)
- Profile bonus calculation (target <5ms)
- Verify 60fps maintained during rapid tapping
- Document any performance optimizations made

**Day 9: Documentation & Code Review**
- Add JSDoc comments to all new/modified functions
- Update architecture docs if patterns changed
- Submit PR with comprehensive description
- Address code review feedback

**Day 10: Pre-Launch Checklist**
- [ ] All unit tests pass (>80% coverage)
- [ ] All integration tests pass
- [ ] E2E test passes
- [ ] Manual QA on iOS simulator
- [ ] Manual QA on Android emulator
- [ ] Accessibility tested with VoiceOver/TalkBack
- [ ] Performance benchmarks met
- [ ] Code reviewed and approved
- [ ] Merge to staging branch

---

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies | Exit Criteria |
|-----------|-------------|------|--------------|---------------|
| M1: Test Suite Complete | All tests written (RED phase) | Day 2 | Test infrastructure setup | 15+ failing tests documented |
| M2: Hooks Extended | `useUpgradeBonuses` + `usePersistedCounter` done | Day 4 | Test suite | 7 tests passing |
| M3: Feature Integration | ClickerScreen uses bonus | Day 5 | Hooks extended | Integration tests pass |
| M4: E2E Validated | Full user journey tested | Day 7 | All components integrated | E2E test green |
| M5: Production Ready | Performance + docs + review | Day 10 | QA complete | PR approved |

**Target Ship Date**: Day 11 (includes 1 buffer day)

---

## 12. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| **Hook Extension vs New Hook** | 1) Extend `useUpgradeBonuses` 2) Create `usePetsPerFeedBonus` | **Extend existing hook** | Maintains single source of truth for all bonuses; avoids duplicate logic; follows existing pattern (scrapPerPetBonus$ already exists) |
| **incrementBy vs Modify increment** | 1) Add `incrementBy(amount)` 2) Change `increment()` to accept optional amount | **Add new action** | Preserves backward compatibility; clearer API (increment=+1 always, incrementBy=variable); easier to test |
| **Where to read bonus** | 1) ClickerScreen reads bonus 2) usePersistedCounter reads bonus | **ClickerScreen reads bonus** | Separation of concerns: counter is generic (reusable), game logic (bonuses) lives in game UI; makes testing easier |
| **Bonus calculation timing** | 1) Compute on every feed 2) Cache with computed observable | **Cache with computed** | Performance: bonus only changes on purchase (rare), not on every feed (frequent); Legend-State computed handles caching automatically |

### Trade-offs

**Trade-off 1**: Chose additive stacking over multiplicative
- **Reason**: Simpler math, easier to balance, matches existing SCRAP_PER_PET pattern
- **Accepted Limitation**: Less exponential growth potential
- **Future Flexibility**: Can add multiplicative upgrades later as separate type

**Trade-off 2**: Accepted client-side only validation (no server)
- **Reason**: Offline single-player game, no competitive multiplayer
- **Accepted Limitation**: Players could theoretically hack local storage
- **Mitigation**: Not a concern for game design (no leaderboards, no monetization)

**Trade-off 3**: Hardcoded upgrade data vs database
- **Reason**: MVP scope, only 2 upgrades, no dynamic content
- **Accepted Limitation**: Code deploy needed to add new upgrades
- **Future Path**: Can migrate to JSON config file or CMS later

---

## 13. Open Questions

### Technical Questions

- [x] **Q1**: Does `UpgradeType.PETS_PER_FEED` enum value exist?
  - **Status**: ✅ RESOLVED - Verified in types.ts line 14

- [x] **Q2**: Does `useUpgradeBonuses` already calculate `petsPerFeed`?
  - **Status**: ✅ RESOLVED - Yes, lines 27-29 compute it, just need to expose observable

- [ ] **Q3**: Should we add visual feedback ("+2" floating text) on multi-pet feed?
  - **Status**: OPEN - Deferred to P1 (Nice to Have)
  - **Decision Needed By**: Post-MVP based on user feedback

- [ ] **Q4**: What happens if player has 99 scrap and tries to purchase?
  - **Status**: OPEN - Verify existing purchase validation handles this
  - **Action**: Add explicit test case in Phase 2

### Product Questions (Not Technical)

- [ ] Should Bot Factory cost be 75/100/125 scrap? (Requires A/B test data)
- [ ] Should we show "x2" indicator on Feed button when owned? (UX decision)
- [ ] Do we need confirmation dialog for first purchase? (UX decision)

---

## 14. Appendices

### A. Technical Glossary

| Term | Definition |
|------|------------|
| **Fine-grained reactivity** | Pattern where only specific UI elements re-render when their exact data changes, not entire component trees |
| **Observable** | Legend-State reactive primitive that tracks dependencies and notifies subscribers of changes |
| **Computed observable** | Derived observable that auto-recalculates when dependencies change, with built-in caching |
| **Hook** | React function (starting with `use`) that encapsulates stateful logic and side effects |
| **Behavior-based naming** | Naming hooks by what they DO (e.g., `usePersistedCounter`) not what they manage (e.g., `usePet`) |
| **TDD (Test-Driven Development)** | Development methodology: write tests first (RED), implement minimal code (GREEN), improve code (REFACTOR) |
| **Additive stacking** | Bonuses combine via addition (1+1=2) rather than multiplication (1*1=1) |

### B. Reference Architecture

**Similar Patterns in Codebase**:
- `useUpgradeBonuses` already implements bonus calculation pattern (extend it)
- `ScrapCounter` component demonstrates fine-grained reactivity with observables
- `shop.store.ts` shows Legend-State persistence configuration
- `usePersistedCounter` shows behavior-based hook pattern

**External References**:
- Legend-State docs: https://legendapp.com/open-source/state/
- React Native Testing Library: https://callstack.github.io/react-native-testing-library/
- TDD Best Practices: Kent C. Dodds' Testing JavaScript course

### C. Code Snippets

**Legend-State Computed Observable Pattern**:
```typescript
// Auto-caches, only recalculates when dependencies change
const derived$ = computed(() => {
  const a = observable1.get()  // Tracked dependency
  const b = observable2.get()  // Tracked dependency
  return a + b
})
```

**React Native Testing Library Async Pattern**:
```typescript
// Always use waitFor for Legend-State observable updates
await waitFor(() => {
  expect(result.current.count$.get()).toBe(expectedValue)
})
```

### D. Related Documents

- **Product Requirements Document**: `/frontend/modules/upgrades/specs/prd_bot_factory_20251115.md`
- **Architecture Guides**:
  - State Management: `/docs/architecture/state-management-hooks-guide.md`
  - File Organization: `/docs/architecture/file-organization-patterns.md`
  - Lean Development: `/docs/architecture/lean-task-generation-guide.md`
- **Testing Guide**: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Legend-State Guide**: `/docs/research/expo_legend_state_v3_guide_20250917_225656.md`

---

**Generated from PRD**: `prd_bot_factory_20251115.md`
**Generation Date**: 2025-11-15
**Document Type**: Technical Design Document
**Feature**: Bot Factory Upgrade
**Version**: 1.0

---

## Implementation Checklist

**Pre-Implementation**:
- [ ] All architecture guides reviewed
- [ ] Existing codebase patterns understood
- [ ] Test files created (co-located)
- [ ] Development environment ready

**Phase 1 - RED**:
- [ ] All tests written (failing)
- [ ] Test coverage plan documented
- [ ] Edge cases identified

**Phase 2 - GREEN**:
- [ ] Bot Factory added to shop.store.ts
- [ ] useUpgradeBonuses extended
- [ ] usePersistedCounter extended
- [ ] ClickerScreen integrated
- [ ] All tests passing

**Phase 3 - REFACTOR**:
- [ ] Code cleaned up
- [ ] Types extracted
- [ ] Documentation added
- [ ] Performance verified

**Phase 4 - QA**:
- [ ] Manual testing complete
- [ ] Performance benchmarks met
- [ ] Accessibility validated
- [ ] No regressions found

**Launch**:
- [ ] Code review approved
- [ ] PR merged
- [ ] Feature flag enabled (if applicable)
- [ ] Monitoring active
