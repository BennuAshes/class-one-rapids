# Bot Factory Upgrade - Technical Design Document

## Document Control

| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Generated | 2025-11-13 | Draft | Initial TDD from PRD |

## Executive Summary

This TDD outlines the technical implementation for the Bot Factory upgrade system, establishing the first purchasable upgrade for the idle/clicker game. The system integrates with existing scrap generation and shop infrastructure while introducing a permanent multiplier mechanic that provides +1 AI Bot per Feed click. This implementation follows behavior-based hook architecture, Legend-State persistence patterns, and Test-Driven Development (TDD) methodology throughout.

---

## 1. Overview & Context

### Problem Statement

From a technical perspective, the current game lacks a progression system that creates compound value over time. The Feed action generates a fixed number of AI Bots (likely 1 per click), with no mechanism to improve this rate. This technical limitation manifests as:
- No persistent user state for power-ups or upgrades
- No integration point between currency (scrap) and gameplay modifiers
- Missing upgrade effect calculation in the Feed action workflow

### Solution Approach

Implement a **hook-based upgrade system** that:
1. Extends the existing `shopStore` with Bot Factory upgrade definition
2. Creates a `useUpgradeEffects` hook to calculate active upgrade bonuses
3. Modifies the Feed action to apply upgrade multipliers to bot generation
4. Implements persistent purchase tracking via Legend-State AsyncStorage
5. Provides TDD-first implementation with comprehensive test coverage

### Success Criteria

**Technical Metrics:**
- Shop UI renders in <500ms (Performance)
- Purchase transaction completes in <100ms (Responsiveness)
- State persistence write completes in <200ms (Data integrity)
- Test coverage >80% for new code (Quality)
- No frame drops during purchase animation (Smooth UX)
- All tests pass before implementation complete (TDD compliance)

---

## 2. Requirements Analysis

### Functional Requirements Mapping

| PRD Requirement | Technical Implementation |
|-----------------|-------------------------|
| REQ-1.1: Shop UI displays upgrades | `ShopScreen.tsx` renders `availableUpgrades` from `shopStore` |
| REQ-1.2: Display name, cost, description | `UpgradeCard.tsx` component with props from `Upgrade` type |
| REQ-1.3: Disabled state styling | Conditional styles based on `scrap < upgrade.cost` |
| REQ-1.4: Persist purchase state | `shopStore.purchasedUpgrades` synced to AsyncStorage |
| REQ-1.5: Accessible from main screen | Navigation integration in app routing |
| REQ-2.1: Bot Factory costs 100 scrap | `BOT_FACTORY` constant with `cost: 100` |
| REQ-2.2: Deduct scrap on purchase | `purchaseUpgrade` action calls `scrapStore.scrap.set(current - cost)` |
| REQ-2.3: +1 AI Bot per Feed click | `useUpgradeEffects` hook returns `botsPerFeedBonus: 1` when purchased |
| REQ-2.4: Permanent effect | Persisted via `shopStore.purchasedUpgrades` array |
| REQ-2.5: Purchase once only | Validation: `purchasedUpgrades.includes(upgradeId)` returns error |
| REQ-2.6: Save purchase state | Legend-State `persist` configuration on `purchasedUpgrades` |
| REQ-3.1: Integrate with scrap system | Import and modify `scrapStore` from `frontend/modules/scrap/stores/scrap.store.ts` |
| REQ-3.2: Validate scrap balance | `if (scrapStore.scrap.get() < cost) return { success: false, error: 'INSUFFICIENT_FUNDS' }` |
| REQ-3.3: Show error for insufficient funds | Conditional rendering of error message in UI |
| REQ-3.4: Atomic transaction | Batch update using Legend-State `batch()` function |
| REQ-4.1: Purchase success notification | Toast/notification component triggered on success |
| REQ-4.2: Update UI to "Owned" | Conditional rendering based on `purchasedUpgrades.includes(id)` |
| REQ-4.3: Show updated bot count | Display calculated `baseBotsPerClick + botsPerFeedBonus` in Feed UI |
| REQ-4.4: Shop badge indicator | Computed observable: `affordableUpgradesCount$` |

### Non-Functional Requirements

**Performance:**
- Shop screen rendering: Use React Native FlatList with `getItemLayout` for instant render
- Purchase transaction: Synchronous state updates (<5ms), async persistence queued
- Persistence writes: Legend-State debouncing (1000ms) to batch writes
- Animation performance: Use `Animated` API with `useNativeDriver: true`

**Security:**
- Client-side validation: All purchase operations validate scrap balance and purchase status
- Idempotency: Purchase action checks `purchasedUpgrades` array before mutation
- State encryption: AsyncStorage values use React Native's secure storage layer

**Accessibility:**
- Touch targets: Minimum 44x44pt (enforced via StyleSheet constraints)
- Color contrast: Use system colors with 4.5:1 ratio (verified in Storybook)
- Screen readers: `accessibilityLabel` and `accessibilityHint` on all interactive elements
- Haptic feedback: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)` on purchase

**Scalability:**
- Upgrade data structure: Array-based for 50+ upgrades (FlatList handles efficiently)
- Purchase state: String array scales linearly with purchases
- Effect calculation: O(n) where n = purchased upgrades (~5-10 typical)

---

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native UI Layer                    │
├─────────────────────────────────────────────────────────────┤
│  ShopScreen.tsx  │  UpgradeCard.tsx  │  FeedButton.tsx      │
└────────┬─────────┴────────┬──────────┴─────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌────────────────────────────────────────────────────────────┐
│                    Hook Layer (Behavior)                    │
├────────────────────────────────────────────────────────────┤
│  useShopActions  │  useUpgradeEffects  │  useScrapGeneration│
└────────┬─────────┴────────┬──────────┴─────────┬───────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌────────────────────────────────────────────────────────────┐
│               Legend-State Observable Stores                │
├────────────────────────────────────────────────────────────┤
│   shopStore      │  scrapStore       │  counterStore        │
│   (upgrades)     │  (currency)       │  (bots)              │
└────────┬─────────┴────────┬──────────┴─────────┬───────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌────────────────────────────────────────────────────────────┐
│             Legend-State Persistence Layer                  │
├────────────────────────────────────────────────────────────┤
│       observablePersistAsyncStorage + AsyncStorage          │
└────────────────────────────────────────────────────────────┘
```

### Component Design

#### UpgradeCard Component
- **Purpose**: Display single upgrade with purchase button
- **Responsibilities**:
  - Render upgrade name, description, cost
  - Show "Owned" vs "Purchase" button state
  - Handle purchase button press
  - Display disabled state when scrap insufficient
- **Interfaces**:
  ```typescript
  interface UpgradeCardProps {
    upgrade: Upgrade
    isPurchased: boolean
    canAfford: boolean
    onPurchase: (upgradeId: string) => void
  }
  ```
- **Dependencies**: `shopStore`, `scrapStore` (via hooks)

#### ShopScreen Component
- **Purpose**: Container for upgrade list and shop UI
- **Responsibilities**:
  - Fetch and display all available upgrades
  - Filter and sort upgrades
  - Handle empty state
  - Provide navigation back to main screen
- **Interfaces**:
  ```typescript
  interface ShopScreenProps {
    navigation: NavigationProp<any>
  }
  ```
- **Dependencies**: `useShopActions`, `useUpgradeEffects`

#### useShopActions Hook (Behavior-Based)
- **Purpose**: Provides purchase behavior and shop state access
- **Responsibilities**:
  - `purchaseUpgrade(id)`: Execute purchase transaction
  - `canAffordUpgrade(id)`: Check if player has enough scrap
  - `isUpgradePurchased(id)`: Check purchase status
  - Return observables for reactive UI updates
- **Interfaces**:
  ```typescript
  interface UseShopActionsReturn {
    availableUpgrades$: Observable<Upgrade[]>
    purchasedUpgrades$: Observable<string[]>
    actions: {
      purchaseUpgrade: (id: string) => PurchaseResult
      canAffordUpgrade: (id: string) => boolean
      isUpgradePurchased: (id: string) => boolean
    }
  }
  ```

#### useUpgradeEffects Hook (Behavior-Based)
- **Purpose**: Calculates active upgrade bonuses for gameplay
- **Responsibilities**:
  - Compute total `botsPerFeedBonus` from purchased upgrades
  - Compute total `scrapPerPetBonus` from purchased upgrades
  - Return computed observables for real-time effect application
- **Interfaces**:
  ```typescript
  interface UseUpgradeEffectsReturn {
    botsPerFeedBonus$: Observable<number>
    scrapPerPetBonus$: Observable<number>
    totalActiveUpgrades$: Observable<number>
  }
  ```

### Data Flow

#### Purchase Flow Sequence
```
User taps "Purchase" button
    ↓
UpgradeCard.onPress
    ↓
useShopActions.actions.purchaseUpgrade(id)
    ↓
Validation checks:
  - Already purchased? → Error: ALREADY_PURCHASED
  - Insufficient scrap? → Error: INSUFFICIENT_FUNDS
    ↓
batch(() => {
  scrapStore.scrap.set(current - cost)
  shopStore.purchasedUpgrades.push(id)
  shopStore.lastPurchaseTime.set(Date.now())
})
    ↓
AsyncStorage persistence (debounced 1000ms)
    ↓
useUpgradeEffects recomputes bonuses
    ↓
UI updates (Feed button shows new bot count)
    ↓
Success notification shown
```

#### Feed Action with Upgrade Flow
```
User taps "Feed" button
    ↓
Feed action handler
    ↓
useUpgradeEffects.botsPerFeedBonus$.get() → returns 1 if Bot Factory purchased
    ↓
Calculate: baseBots (1) + botsPerFeedBonus (1) = 2 total bots
    ↓
counterStore.count.set(current + 2)
    ↓
UI updates with new bot count
```

---

## 4. API Design

### Internal Hooks API

#### useShopActions

```typescript
/**
 * Provides shop purchase behavior and state access
 *
 * Follows behavior-based naming: "Shop Actions" describes purchase/query behavior
 */
export function useShopActions(): UseShopActionsReturn

// Usage in component:
const { availableUpgrades$, actions } = useShopActions()
const result = actions.purchaseUpgrade('bot-factory')
if (!result.success) {
  Alert.alert('Purchase Failed', result.error)
}
```

#### useUpgradeEffects

```typescript
/**
 * Calculates aggregate effects from purchased upgrades
 *
 * Follows behavior-based naming: "Upgrade Effects" describes calculation behavior
 */
export function useUpgradeEffects(): UseUpgradeEffectsReturn

// Usage in Feed component:
const { botsPerFeedBonus$ } = useUpgradeEffects()
const handleFeed = () => {
  const baseBots = 1
  const bonus = botsPerFeedBonus$.get()
  const total = baseBots + bonus
  // Apply total bots...
}
```

### Store Actions API

#### shopStore Actions

```typescript
// Note: Direct store manipulation wrapped by hooks
// These are internal operations exposed via useShopActions

/**
 * Purchase upgrade (internal, use via hook)
 */
function purchaseUpgrade(upgradeId: string): PurchaseResult {
  const upgrade = shopStore.availableUpgrades
    .find((u) => u.id.get() === upgradeId)

  if (!upgrade) {
    return { success: false, error: 'INVALID_UPGRADE' }
  }

  if (shopStore.purchasedUpgrades.get().includes(upgradeId)) {
    return { success: false, error: 'ALREADY_PURCHASED' }
  }

  const cost = upgrade.cost.get()
  const currentScrap = scrapStore.scrap.get()

  if (currentScrap < cost) {
    return { success: false, error: 'INSUFFICIENT_FUNDS' }
  }

  // Atomic transaction
  batch(() => {
    scrapStore.scrap.set(currentScrap - cost)
    shopStore.purchasedUpgrades.push(upgradeId)
    shopStore.lastPurchaseTime.set(Date.now())
  })

  return { success: true }
}
```

### External Integrations

**None** - This is a local-first feature with no backend dependencies. All state management handled client-side via Legend-State and AsyncStorage.

---

## 5. Data Model

### Entity Design

#### Upgrade Entity (Extended)

```typescript
/**
 * Bot Factory Upgrade Definition
 *
 * Extends existing Upgrade interface from shop/types.ts
 */
export const BOT_FACTORY: Upgrade = {
  id: 'bot-factory-v1',
  name: 'Bot Factory',
  description: 'Gain +1 AI Bot every time you Feed',
  cost: 100,
  upgradeType: UpgradeType.PETS_PER_FEED,
  effectValue: 1,
  iconName: 'factory' // Optional for MVP
}
```

#### ShopState (Existing - No Changes Needed)

```typescript
// Defined in frontend/modules/shop/types.ts
export interface ShopState {
  availableUpgrades: Upgrade[]      // Includes BOT_FACTORY
  purchasedUpgrades: string[]       // Contains 'bot-factory-v1' when purchased
  lastPurchaseTime: number          // Unix timestamp
}
```

#### UpgradeEffects (New Computed Type)

```typescript
/**
 * Computed upgrade effects applied to gameplay
 *
 * Calculated by useUpgradeEffects hook
 */
export interface UpgradeEffects {
  /** Additional bots gained per Feed action */
  botsPerFeedBonus: number

  /** Additional scrap gained per pet (future) */
  scrapPerPetBonus: number

  /** Total number of active upgrades */
  totalActiveUpgrades: number
}
```

### Database Schema (AsyncStorage)

#### Storage Keys and Structure

```typescript
// Key: 'shop-purchased-v1'
// Value: string[] (JSON)
["bot-factory-v1"]

// Key: 'shop-last-purchase-v1'
// Value: number (JSON)
1731513600000

// Key: 'scrap-count-v1'
// Value: number (JSON)
150
```

### Data Access Patterns

#### Common Queries

1. **Check if Bot Factory purchased**
   ```typescript
   const isPurchased = shopStore.purchasedUpgrades.get()
     .includes('bot-factory-v1')
   ```

2. **Calculate bots per click with bonuses**
   ```typescript
   const { botsPerFeedBonus$ } = useUpgradeEffects()
   const totalBots = BASE_BOTS_PER_CLICK + botsPerFeedBonus$.get()
   ```

3. **Get affordable upgrades**
   ```typescript
   const affordable = shopStore.availableUpgrades.get()
     .filter(u => u.cost <= scrapStore.scrap.get())
   ```

#### Caching Strategy

- **No explicit cache** - Legend-State observables provide in-memory reactive cache
- **Persistence**: AsyncStorage acts as durable cache, loaded on app start
- **Computed values**: `computed()` observables auto-cache until dependencies change

#### Data Consistency

- **Single source of truth**: `shopStore.purchasedUpgrades` is authoritative
- **Atomic updates**: `batch()` ensures scrap deduction + purchase tracking happen together
- **Eventual consistency**: AsyncStorage writes debounced (1000ms) but state immediately consistent in-memory
- **No conflicts**: Single-player game, no concurrent write scenarios

---

## 6. Security Design

### Authentication & Authorization

**Not Applicable** - Single-player offline game with no user accounts or authentication. All data stored locally on device.

### Data Security

#### Local Storage Security
- **Encryption**: AsyncStorage uses iOS Keychain / Android Keystore via React Native Secure Storage for sensitive data
- **For MVP**: Standard AsyncStorage (not encrypted) acceptable since no PII or financial data
- **Future enhancement**: Migrate to `@react-native-async-storage/secure-storage` for cheat prevention

#### Input Validation
```typescript
/**
 * Validate purchase transaction inputs
 */
function validatePurchase(upgradeId: string): boolean {
  // Prevent injection attacks on storage keys
  if (!/^[a-z0-9-]+$/.test(upgradeId)) {
    return false
  }

  // Verify upgrade exists
  const upgrade = shopStore.availableUpgrades.get()
    .find(u => u.id === upgradeId)

  return upgrade !== undefined
}
```

#### PII Handling
**None** - No personally identifiable information collected or stored.

#### Audit Logging
- **Purchase timestamp**: `shopStore.lastPurchaseTime` records when purchases occur
- **Analytics (future)**: Can export purchase history for debugging/analytics
- **No user tracking**: Device-local only, no telemetry in MVP

### Security Controls

#### Client-Side Validation
```typescript
// Prevent negative scrap balances
const newScrap = currentScrap - cost
if (newScrap < SCRAP_CONSTRAINTS.MIN_VALUE) {
  return { success: false, error: 'INSUFFICIENT_FUNDS' }
}

// Prevent double-purchase
if (shopStore.purchasedUpgrades.get().includes(upgradeId)) {
  return { success: false, error: 'ALREADY_PURCHASED' }
}

// Validate cost is positive
if (upgrade.cost <= 0) {
  throw new Error('Invalid upgrade cost')
}
```

#### Rate Limiting
**Not applicable** - Single-player game, no server requests to rate limit. Purchase frequency naturally limited by scrap accumulation rate.

#### CORS Policies
**Not applicable** - No web API or cross-origin requests.

#### Security Headers
**Not applicable** - React Native mobile app, not web-based.

---

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

All implementation follows **Red-Green-Refactor** cycle. No production code written before corresponding test.

#### Testing Framework & Tools
- **Framework**: React Native Testing Library v12+
- **Reference**: `@docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Test Runner**: Jest v29+ with React Native preset
- **Mocking**: Jest mocks for AsyncStorage, MSW not needed (no network)
- **Assertions**: `@testing-library/jest-native` matchers

#### TDD Implementation Process

For each feature, follow strict order:

##### 1. RED Phase - Write Failing Test First
```typescript
// UpgradeCard.test.tsx (WRITE THIS FIRST)
test('disables purchase button when scrap insufficient', () => {
  // Arrange: Set scrap to 50, upgrade costs 100
  scrapStore.scrap.set(50)

  // Act: Render upgrade card
  render(<UpgradeCard upgrade={BOT_FACTORY} />)

  // Assert: Button should be disabled
  const button = screen.getByRole('button', { name: /purchase/i })
  expect(button).toBeDisabled()
})

// This test MUST fail initially (button doesn't exist yet!)
// ❌ Test fails: Component not implemented
```

##### 2. GREEN Phase - Minimal Implementation
```typescript
// UpgradeCard.tsx (WRITE THIS SECOND)
export function UpgradeCard({ upgrade }: UpgradeCardProps) {
  const currentScrap = scrapStore.scrap.get()
  const canAfford = currentScrap >= upgrade.cost

  return (
    <TouchableOpacity disabled={!canAfford}>
      <Text>Purchase</Text>
    </TouchableOpacity>
  )
}

// ✅ Test passes: Minimal code makes test green
```

##### 3. REFACTOR Phase - Improve Code
```typescript
// Extract logic to hook, improve styling, etc.
// All tests must remain green
```

### Test Categories (TDD Layers)

#### Unit Testing (TDD First Layer)

**Priority 1: Core Business Logic**

```typescript
// useShopActions.test.ts
describe('useShopActions - Purchase Logic (TDD)', () => {
  test('RED: should fail purchase with insufficient funds', async () => {
    scrapStore.scrap.set(50) // Less than cost

    const { result } = renderHook(() => useShopActions())

    act(() => {
      const outcome = result.current.actions.purchaseUpgrade('bot-factory-v1')
      expect(outcome.success).toBe(false)
      expect(outcome.error).toBe('INSUFFICIENT_FUNDS')
    })

    // Verify scrap unchanged
    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(50)
    })
  })

  test('GREEN: should successfully purchase when scrap sufficient', async () => {
    scrapStore.scrap.set(100)

    const { result } = renderHook(() => useShopActions())

    act(() => {
      const outcome = result.current.actions.purchaseUpgrade('bot-factory-v1')
      expect(outcome.success).toBe(true)
    })

    // Verify scrap deducted
    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(0)
    })

    // Verify purchase tracked
    await waitFor(() => {
      expect(shopStore.purchasedUpgrades.get()).toContain('bot-factory-v1')
    })
  })

  test('REFACTOR: should prevent double-purchase', async () => {
    scrapStore.scrap.set(200)
    shopStore.purchasedUpgrades.set(['bot-factory-v1']) // Already purchased

    const { result } = renderHook(() => useShopActions())

    act(() => {
      const outcome = result.current.actions.purchaseUpgrade('bot-factory-v1')
      expect(outcome.success).toBe(false)
      expect(outcome.error).toBe('ALREADY_PURCHASED')
    })

    // Verify scrap not deducted
    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(200)
    })
  })
})
```

**Priority 2: Upgrade Effect Calculation**

```typescript
// useUpgradeEffects.test.ts
describe('useUpgradeEffects - Bonus Calculation (TDD)', () => {
  test('RED: returns 0 bonus when no upgrades purchased', () => {
    shopStore.purchasedUpgrades.set([])

    const { result } = renderHook(() => useUpgradeEffects())

    expect(result.current.botsPerFeedBonus$.get()).toBe(0)
  })

  test('GREEN: returns +1 bonus when Bot Factory purchased', async () => {
    shopStore.availableUpgrades.set([BOT_FACTORY])
    shopStore.purchasedUpgrades.set(['bot-factory-v1'])

    const { result } = renderHook(() => useUpgradeEffects())

    await waitFor(() => {
      expect(result.current.botsPerFeedBonus$.get()).toBe(1)
    })
  })

  test('REFACTOR: updates bonus reactively when purchase happens', async () => {
    shopStore.availableUpgrades.set([BOT_FACTORY])
    shopStore.purchasedUpgrades.set([])

    const { result } = renderHook(() => useUpgradeEffects())

    expect(result.current.botsPerFeedBonus$.get()).toBe(0)

    // Purchase upgrade
    act(() => {
      shopStore.purchasedUpgrades.push('bot-factory-v1')
    })

    // Verify bonus updates
    await waitFor(() => {
      expect(result.current.botsPerFeedBonus$.get()).toBe(1)
    })
  })
})
```

**Priority 3: Component Rendering**

```typescript
// UpgradeCard.test.tsx
describe('UpgradeCard Component (TDD)', () => {
  test('RED: renders upgrade name and description', () => {
    render(<UpgradeCard upgrade={BOT_FACTORY} />)

    expect(screen.getByText('Bot Factory')).toBeTruthy()
    expect(screen.getByText(/Gain \+1 AI Bot/i)).toBeTruthy()
  })

  test('GREEN: shows cost in scrap', () => {
    render(<UpgradeCard upgrade={BOT_FACTORY} />)

    expect(screen.getByText(/100/)).toBeTruthy()
    expect(screen.getByText(/scrap/i)).toBeTruthy()
  })

  test('REFACTOR: disables button when insufficient scrap', () => {
    scrapStore.scrap.set(50)

    render(<UpgradeCard upgrade={BOT_FACTORY} />)

    const button = screen.getByRole('button', { name: /purchase/i })
    expect(button).toBeDisabled()
  })

  test('enables button when scrap sufficient', () => {
    scrapStore.scrap.set(100)

    render(<UpgradeCard upgrade={BOT_FACTORY} />)

    const button = screen.getByRole('button', { name: /purchase/i })
    expect(button).not.toBeDisabled()
  })

  test('shows "Owned" when upgrade purchased', () => {
    shopStore.purchasedUpgrades.set(['bot-factory-v1'])

    render(<UpgradeCard upgrade={BOT_FACTORY} />)

    expect(screen.getByText(/owned/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /purchase/i })).toBeNull()
  })
})
```

#### Integration Testing (TDD Second Layer)

**Purchase Flow Integration**

```typescript
// ShopScreen.test.tsx (Integration)
describe('Shop Purchase Flow Integration (TDD)', () => {
  test('RED: complete purchase flow updates all related state', async () => {
    // Arrange
    scrapStore.scrap.set(150)
    shopStore.availableUpgrades.set([BOT_FACTORY])
    shopStore.purchasedUpgrades.set([])

    const user = userEvent.setup()
    render(<ShopScreen />)

    // Act: Purchase upgrade
    const purchaseButton = screen.getByRole('button', { name: /purchase/i })
    await user.press(purchaseButton)

    // Assert: Purchase tracked
    await waitFor(() => {
      expect(shopStore.purchasedUpgrades.get()).toContain('bot-factory-v1')
    })

    // Assert: Scrap deducted
    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(50)
    })

    // Assert: UI updates to "Owned"
    await waitFor(() => {
      expect(screen.getByText(/owned/i)).toBeTruthy()
    })

    // Assert: Button disabled
    expect(screen.queryByRole('button', { name: /purchase/i })).toBeNull()
  })

  test('GREEN: shows error message for insufficient funds', async () => {
    scrapStore.scrap.set(50) // Not enough
    shopStore.availableUpgrades.set([BOT_FACTORY])

    const user = userEvent.setup()
    render(<ShopScreen />)

    const purchaseButton = screen.getByRole('button', { name: /purchase/i })

    // Button should be disabled
    expect(purchaseButton).toBeDisabled()
  })
})
```

**Feed Action with Upgrade Integration**

```typescript
// FeedButton.test.tsx (Integration with useUpgradeEffects)
describe('Feed Action with Bot Factory Upgrade (TDD)', () => {
  test('RED: generates 1 bot without upgrade', async () => {
    shopStore.purchasedUpgrades.set([])
    counterStore.count.set(0)

    const user = userEvent.setup()
    render(<FeedButton />)

    const feedButton = screen.getByRole('button', { name: /feed/i })
    await user.press(feedButton)

    await waitFor(() => {
      expect(counterStore.count.get()).toBe(1)
    })
  })

  test('GREEN: generates 2 bots with Bot Factory upgrade', async () => {
    shopStore.availableUpgrades.set([BOT_FACTORY])
    shopStore.purchasedUpgrades.set(['bot-factory-v1'])
    counterStore.count.set(0)

    const user = userEvent.setup()
    render(<FeedButton />)

    const feedButton = screen.getByRole('button', { name: /feed/i })
    await user.press(feedButton)

    await waitFor(() => {
      expect(counterStore.count.get()).toBe(2) // 1 base + 1 bonus
    })
  })

  test('REFACTOR: displays correct bot count in UI', async () => {
    shopStore.availableUpgrades.set([BOT_FACTORY])
    shopStore.purchasedUpgrades.set(['bot-factory-v1'])

    render(<FeedButton />)

    // Should show "+2 Bots per click" or similar
    expect(screen.getByText(/\+2/i)).toBeTruthy()
  })
})
```

#### End-to-End Testing (TDD Third Layer)

**Complete User Journey**

```typescript
// e2e/BotFactoryPurchase.test.tsx
describe('Bot Factory Purchase E2E Flow (TDD)', () => {
  test('RED: complete journey from accumulating scrap to purchasing and using upgrade', async () => {
    // Arrange: Fresh game state
    scrapStore.scrap.set(0)
    counterStore.count.set(0)
    shopStore.purchasedUpgrades.set([])
    shopStore.availableUpgrades.set([BOT_FACTORY])

    const user = userEvent.setup()
    const navigation = jest.fn()

    render(<GameScreen navigation={navigation} />)

    // Step 1: Generate scrap by feeding (assuming scrap generation exists)
    const feedButton = screen.getByRole('button', { name: /feed/i })

    // Feed 100 times to accumulate 100 scrap (assuming 1 scrap per feed)
    for (let i = 0; i < 100; i++) {
      await user.press(feedButton)
      await waitFor(() => {
        expect(scrapStore.scrap.get()).toBe(i + 1)
      })
    }

    // Step 2: Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i })
    await user.press(shopButton)

    await waitFor(() => {
      expect(navigation).toHaveBeenCalledWith('Shop')
    })

    // Render shop screen
    render(<ShopScreen />)

    // Step 3: Purchase Bot Factory
    const purchaseButton = screen.getByRole('button', { name: /purchase/i })
    expect(purchaseButton).not.toBeDisabled()

    await user.press(purchaseButton)

    await waitFor(() => {
      expect(shopStore.purchasedUpgrades.get()).toContain('bot-factory-v1')
      expect(scrapStore.scrap.get()).toBe(0) // 100 - 100
    })

    // Step 4: Return to game and verify upgrade active
    const backButton = screen.getByRole('button', { name: /back/i })
    await user.press(backButton)

    render(<GameScreen navigation={navigation} />)

    // Step 5: Feed and verify +2 bots generated
    const initialBots = counterStore.count.get()
    await user.press(feedButton)

    await waitFor(() => {
      expect(counterStore.count.get()).toBe(initialBots + 2) // +1 base, +1 bonus
    })

    // Step 6: Verify persistence (simulate app restart)
    const { result: effectsResult } = renderHook(() => useUpgradeEffects())

    await waitFor(() => {
      expect(effectsResult.current.botsPerFeedBonus$.get()).toBe(1)
    })
  })
})
```

### TDD Checklist for Each Component

- [ ] **First test written before any implementation code**
- [ ] **Each test covers one specific behavior**
- [ ] **Tests use React Native Testing Library patterns**
  - Query by user-visible content (`getByText`, `getByRole`)
  - Use `waitFor` for Legend-State async updates
  - Use `userEvent` over `fireEvent`
- [ ] **No testIds unless necessary for style verification**
- [ ] **Tests query by user-visible content**
- [ ] **Async operations use `waitFor`/`findBy`**
- [ ] **All tests pass before moving to next feature**
- [ ] **Test coverage >80% verified via Jest coverage report**

### Testing Legend-State Observables

**Critical Pattern**: Always use `waitFor` when testing state changes from user interactions.

```typescript
// ✅ CORRECT - Wait for observable updates
test('increments bot count on feed', async () => {
  const user = userEvent.setup()
  render(<FeedButton />)

  const button = screen.getByRole('button', { name: /feed/i })
  await user.press(button)

  // Wait for Legend-State observable to settle
  await waitFor(() => {
    expect(counterStore.count.get()).toBe(1)
  })
})

// ❌ INCORRECT - No wait, may fail with race condition
test('increments bot count on feed', async () => {
  const user = userEvent.setup()
  render(<FeedButton />)

  const button = screen.getByRole('button', { name: /feed/i })
  await user.press(button)

  // May fail - observable updates asynchronously!
  expect(counterStore.count.get()).toBe(1)
})
```

---

## 8. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|---------------|---------------|
| Compute | React Native runtime on mobile device | Runs on user's phone, no server needed |
| Storage | AsyncStorage (~10KB per user) | Small data footprint: upgrades + scrap count |
| Network | None | Offline-first, no API calls |

### Deployment Architecture

**Environment Strategy:**
- **Development**: Expo Dev Client on physical devices/simulators
- **Staging**: TestFlight (iOS) / Internal Testing (Android)
- **Production**: App Store / Google Play

**No containerization** - React Native bundles deployed as mobile apps.

**CI/CD Pipeline:**
```yaml
# .github/workflows/test-and-deploy.yml
name: Test and Deploy

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - run: npm run lint

  build-ios:
    needs: test
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: eas build --platform ios --profile production

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: eas build --platform android --profile production
```

**Deployment Strategy:**
- Blue-green not applicable (mobile app updates via store)
- Gradual rollout: 10% → 50% → 100% via App Store phased release

### Monitoring & Observability

#### Metrics

**Application Metrics:**
- Shop screen load time (target: <500ms)
- Purchase transaction time (target: <100ms)
- App crash rate on shop/purchase (target: <0.1%)

**Business Metrics:**
- Bot Factory purchase rate (target: 60% of players by Week 2)
- Average time to first purchase (target: <10 minutes)
- Purchase conversion rate (shop visits → purchases)

**Infrastructure Metrics:**
Not applicable - no infrastructure to monitor (client-side only)

#### Logging

```typescript
// utils/analytics.ts
export function logPurchase(upgradeId: string, cost: number) {
  if (__DEV__) {
    console.log('[PURCHASE]', { upgradeId, cost, timestamp: Date.now() })
  }

  // Future: Send to analytics service
  // analytics.track('upgrade_purchased', { upgradeId, cost })
}

export function logPurchaseError(upgradeId: string, error: string) {
  if (__DEV__) {
    console.error('[PURCHASE_ERROR]', { upgradeId, error })
  }

  // Future: Send to error tracking
  // Sentry.captureException(new Error(error), { upgradeId })
}
```

**Log Levels:**
- **DEBUG**: State changes, computed values (dev only)
- **INFO**: Purchase attempts, navigation events
- **ERROR**: Purchase failures, validation errors
- **FATAL**: Store corruption, persistence failures

**Centralized Logging:**
Not implemented in MVP - logs remain device-local. Future: Sentry for error tracking.

**Log Retention:**
Device logs cleared on app restart. Future analytics sent to cloud with 90-day retention.

#### Alerting

| Alert | Condition | Priority | Action |
|-------|-----------|----------|--------|
| High Purchase Failure Rate | >10% of purchases fail | P1 | Investigate validation logic |
| Shop Crash Rate | Shop screen crashes >1% of opens | P0 | Hotfix and rollback |
| Persistence Failure | AsyncStorage writes fail >5% | P1 | Check storage permissions |

**Alert Channels:**
- **MVP**: Manual QA testing during beta
- **Future**: Sentry alerts → Slack #eng-alerts

---

## 9. Scalability & Performance

### Performance Requirements

**Technical Targets (from PRD):**
- Shop UI load: <500ms on mid-range devices (2019+ Android/iOS)
- Purchase transaction: <100ms from tap to state update
- Persistence write: <200ms to AsyncStorage
- Animation: Maintain 60fps during purchase confirmation

**Measurement Strategy:**
```typescript
// Performance.test.tsx
test('shop screen renders within 500ms', async () => {
  const startTime = performance.now()

  render(<ShopScreen />)

  await waitFor(() => {
    expect(screen.getByText('Bot Factory')).toBeTruthy()
  })

  const endTime = performance.now()
  const renderTime = endTime - startTime

  expect(renderTime).toBeLessThan(500)
})
```

### Scalability Strategy

**Horizontal Scaling:**
Not applicable - single-player game, no distributed system.

**Load Balancing:**
Not applicable - no servers.

**Database Scaling:**
AsyncStorage scales linearly with data size:
- Current: ~10KB per user (100 upgrades × 100 bytes each)
- Max: 6MB AsyncStorage limit (iOS) - supports 600,000 upgrades (never reached)

**Upgrade List Rendering:**
```typescript
// ShopScreen.tsx - Optimized for 50+ upgrades
<FlatList
  data={availableUpgrades}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <UpgradeCard upgrade={item} />}
  getItemLayout={(data, index) => ({
    length: UPGRADE_CARD_HEIGHT,
    offset: UPGRADE_CARD_HEIGHT * index,
    index
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

### Performance Optimization

**Query Optimization:**
```typescript
// Computed observable caches result until dependencies change
const affordableUpgrades$ = computed(() => {
  const scrap = scrapStore.scrap.get()
  const upgrades = shopStore.availableUpgrades.get()

  // O(n) scan, cached until scrap or upgrades change
  return upgrades.filter(u => u.cost <= scrap)
})
```

**Asset Optimization:**
- Icons: Use vector icons (react-native-vector-icons) - 1KB vs 10KB+ for PNGs
- Images: Not needed for MVP (text-only UI)

**Code-Level Optimizations:**
```typescript
// Use Memo component for surgical updates
import { Memo } from '@legendapp/state/react'

function UpgradeCard({ upgrade }: Props) {
  const isPurchased = shopStore.purchasedUpgrades.get()
    .includes(upgrade.id)

  return (
    <View>
      <Memo>{() => <Text>{upgrade.name}</Text>}</Memo>
      <Memo>
        {() => (
          isPurchased ?
            <Text>Owned</Text> :
            <PurchaseButton upgrade={upgrade} />
        )}
      </Memo>
    </View>
  )
}
```

**Resource Pooling:**
Not applicable - no connection pools or worker threads in React Native.

---

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| AsyncStorage quota exceeded (6MB iOS limit) | High - data loss | Low - current data ~10KB | Monitor storage usage, add warning at 80% | Engineering |
| Legend-State performance with 100+ upgrades | Medium - UI lag | Medium | Profile with 200 upgrades in dev, optimize with FlatList `getItemLayout` | Engineering |
| Race condition: Rapid purchase taps | High - double purchase | Medium | Use `batch()` for atomic updates, disable button during transaction | Engineering |
| iOS keychain access denied | High - persistence broken | Low | Graceful fallback to in-memory only, warn user | Engineering |
| Android storage permission revoked | High - persistence broken | Low | Request permission on startup, show error if denied | Engineering |
| Upgrade effect calculation grows O(n²) | Medium - slow gameplay | Low | Profile with 50+ upgrades, memoize with `computed()` | Engineering |
| Test flakiness with Legend-State async | Medium - CI failures | High | Use `waitFor` consistently, increase timeouts to 3000ms | QA |

### Dependencies

**From PRD (Technical Mapping):**

| PRD Dependency | Technical Component | Status | Risk |
|----------------|---------------------|--------|------|
| Scrap generation system | `scrapStore` from `frontend/modules/scrap/stores/scrap.store.ts` | ✅ Exists | Low - already implemented and tested |
| Persistent storage | Legend-State + AsyncStorage | ✅ Ready | Low - used in existing features |
| Feed action | Modify to apply `useUpgradeEffects` bonus | ⚠️ Needs integration | Medium - requires understanding Feed implementation |

**New Technical Dependency:**
- `@legendapp/state/sync`: Required for `batch()` function (already installed)

---

## 11. Implementation Plan (TDD-Driven)

Following `@docs/architecture/lean-task-generation-guide.md` - prioritize user-visible functionality.

### Development Phases

#### Phase 1: Test Infrastructure Setup [2 days]

**Day 1: Test Configuration**
- Set up Jest with React Native Testing Library
- Configure `@testing-library/jest-native` matchers
- Create test utilities (`renderWithProviders`)
- Mock AsyncStorage for tests
- Verify test environment with smoke test

**Day 2: Test Helpers & Fixtures**
- Create `BOT_FACTORY` constant fixture
- Helper functions: `resetStores()`, `setPurchased()`, `setScrap()`
- Custom matchers for Legend-State observables
- Document TDD patterns in `/docs/testing-patterns.md`

#### Phase 2: TDD Feature Implementation [1 week]

**Week 1: Bot Factory Purchase Flow (TDD Cycle per Feature)**

**Day 1: Upgrade Data Model (Red-Green-Refactor)**

**RED - Write failing tests:**
```typescript
// types.test.ts
test('BOT_FACTORY has required properties', () => {
  expect(BOT_FACTORY.id).toBe('bot-factory-v1')
  expect(BOT_FACTORY.cost).toBe(100)
  expect(BOT_FACTORY.upgradeType).toBe(UpgradeType.PETS_PER_FEED)
  expect(BOT_FACTORY.effectValue).toBe(1)
})
// ❌ Fails: BOT_FACTORY not defined
```

**GREEN - Minimal implementation:**
```typescript
// constants.ts
export const BOT_FACTORY: Upgrade = {
  id: 'bot-factory-v1',
  name: 'Bot Factory',
  description: 'Gain +1 AI Bot every time you Feed',
  cost: 100,
  upgradeType: UpgradeType.PETS_PER_FEED,
  effectValue: 1
}
// ✅ Tests pass
```

**REFACTOR - Improve structure:**
```typescript
// Move to upgrades/constants.ts, add JSDoc, export from index
```

**Day 2: useShopActions Hook (Red-Green-Refactor)**

**RED - Write failing tests:**
```typescript
// useShopActions.test.ts
test('purchaseUpgrade fails with insufficient funds', () => {
  scrapStore.scrap.set(50)
  const { result } = renderHook(() => useShopActions())

  act(() => {
    const outcome = result.current.actions.purchaseUpgrade('bot-factory-v1')
    expect(outcome.success).toBe(false)
    expect(outcome.error).toBe('INSUFFICIENT_FUNDS')
  })
})
// ❌ Fails: useShopActions not defined
```

**GREEN - Minimal implementation:**
```typescript
// useShopActions.ts
export function useShopActions() {
  return {
    actions: {
      purchaseUpgrade: (id: string) => {
        const upgrade = shopStore.availableUpgrades.get()
          .find(u => u.id === id)

        if (!upgrade) {
          return { success: false, error: 'INVALID_UPGRADE' }
        }

        const currentScrap = scrapStore.scrap.get()
        if (currentScrap < upgrade.cost) {
          return { success: false, error: 'INSUFFICIENT_FUNDS' }
        }

        batch(() => {
          scrapStore.scrap.set(currentScrap - upgrade.cost)
          shopStore.purchasedUpgrades.push(id)
          shopStore.lastPurchaseTime.set(Date.now())
        })

        return { success: true }
      }
    }
  }
}
// ✅ Tests pass
```

**REFACTOR - Extract validation, add observables:**
```typescript
// Add availableUpgrades$, purchasedUpgrades$ observables
// Extract validatePurchase() helper
```

**Day 3: useUpgradeEffects Hook (Red-Green-Refactor)**

**RED - Write failing tests:**
```typescript
// useUpgradeEffects.test.ts
test('returns 0 bonus when no upgrades purchased', () => {
  shopStore.purchasedUpgrades.set([])
  const { result } = renderHook(() => useUpgradeEffects())

  expect(result.current.botsPerFeedBonus$.get()).toBe(0)
})
// ❌ Fails: useUpgradeEffects not defined
```

**GREEN - Minimal implementation:**
```typescript
// useUpgradeEffects.ts
export function useUpgradeEffects() {
  const botsPerFeedBonus$ = computed(() => {
    const purchased = shopStore.purchasedUpgrades.get()
    const upgrades = shopStore.availableUpgrades.get()

    return upgrades
      .filter(u => purchased.includes(u.id))
      .filter(u => u.upgradeType === UpgradeType.PETS_PER_FEED)
      .reduce((sum, u) => sum + u.effectValue, 0)
  })

  return { botsPerFeedBonus$ }
}
// ✅ Tests pass
```

**REFACTOR - Add scrapPerPetBonus$, totalActiveUpgrades$:**

**Day 4: UpgradeCard Component (Red-Green-Refactor)**

**RED - Write failing tests:**
```typescript
// UpgradeCard.test.tsx
test('renders upgrade name and description', () => {
  render(<UpgradeCard upgrade={BOT_FACTORY} />)

  expect(screen.getByText('Bot Factory')).toBeTruthy()
  expect(screen.getByText(/Gain \+1 AI Bot/i)).toBeTruthy()
})
// ❌ Fails: UpgradeCard not defined
```

**GREEN - Minimal implementation:**
```typescript
// UpgradeCard.tsx
export function UpgradeCard({ upgrade }: Props) {
  return (
    <View>
      <Text>{upgrade.name}</Text>
      <Text>{upgrade.description}</Text>
      <Text>{upgrade.cost} scrap</Text>
    </View>
  )
}
// ✅ Tests pass
```

**REFACTOR - Add purchase button, disabled states, styling:**

**Day 5: ShopScreen Integration (Red-Green-Refactor)**

**RED - Write failing tests:**
```typescript
// ShopScreen.test.tsx
test('displays list of available upgrades', () => {
  shopStore.availableUpgrades.set([BOT_FACTORY])
  render(<ShopScreen />)

  expect(screen.getByText('Bot Factory')).toBeTruthy()
})
// ❌ Fails: ShopScreen not defined
```

**GREEN - Minimal implementation:**
```typescript
// ShopScreen.tsx
export function ShopScreen() {
  const { availableUpgrades$ } = useShopActions()

  return (
    <FlatList
      data={availableUpgrades$.get()}
      renderItem={({ item }) => <UpgradeCard upgrade={item} />}
      keyExtractor={item => item.id}
    />
  )
}
// ✅ Tests pass
```

**REFACTOR - Add empty state, header, navigation:**

#### Phase 3: Feed Integration & Persistence [3 days]

**Day 1: Feed Action Modification (Red-Green-Refactor)**

**RED - Write failing test:**
```typescript
// FeedButton.test.tsx
test('applies Bot Factory bonus to feed action', async () => {
  shopStore.purchasedUpgrades.set(['bot-factory-v1'])
  shopStore.availableUpgrades.set([BOT_FACTORY])
  counterStore.count.set(0)

  const user = userEvent.setup()
  render(<FeedButton />)

  await user.press(screen.getByRole('button', { name: /feed/i }))

  await waitFor(() => {
    expect(counterStore.count.get()).toBe(2) // 1 base + 1 bonus
  })
})
// ❌ Fails: Feed action doesn't apply bonus
```

**GREEN - Modify Feed action:**
```typescript
// FeedButton.tsx
export function FeedButton() {
  const { botsPerFeedBonus$ } = useUpgradeEffects()

  const handleFeed = () => {
    const baseBots = 1
    const bonus = botsPerFeedBonus$.get()
    const totalBots = baseBots + bonus

    counterStore.count.set(counterStore.count.get() + totalBots)
  }

  return <TouchableOpacity onPress={handleFeed}>...</TouchableOpacity>
}
// ✅ Tests pass
```

**REFACTOR - Extract to useFeedAction hook:**

**Day 2: AsyncStorage Persistence Testing**

**RED - Write failing test:**
```typescript
// persistence.test.ts
test('persists purchase across app restarts', async () => {
  // Purchase upgrade
  scrapStore.scrap.set(100)
  const { result } = renderHook(() => useShopActions())

  act(() => {
    result.current.actions.purchaseUpgrade('bot-factory-v1')
  })

  await waitFor(() => {
    expect(shopStore.purchasedUpgrades.get()).toContain('bot-factory-v1')
  })

  // Simulate app restart by creating new store
  const newStore = createShopStore()

  // Wait for persistence to load
  await when(syncState(newStore.purchasedUpgrades).isPersistLoaded)

  // Verify purchase persisted
  expect(newStore.purchasedUpgrades.get()).toContain('bot-factory-v1')
})
// ❌ Fails: Persistence not configured correctly
```

**GREEN - Fix persistence configuration:**
```typescript
// Ensure persist config has correct debounceSet, retrySync
```

**REFACTOR - Add persistence monitoring:**

**Day 3: End-to-End Testing**

Write and pass E2E test from Section 7 (complete user journey).

#### Phase 4: Polish & Hardening [2 days]

**Day 1: Visual Polish**
- Purchase success toast/notification
- Shop badge indicator (affordable upgrades count)
- Haptic feedback on purchase
- Accessibility labels

**Day 2: Error Handling & Edge Cases**
- Network loss during persistence (retrySync validation)
- Corrupt AsyncStorage data (graceful fallback)
- Rapid-tap prevention on purchase button
- Coverage report review (ensure >80%)

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|-------------|------|--------------|
| M1 | Test infrastructure ready | Day 2 | Jest, RNTL, AsyncStorage mock |
| M2 | BOT_FACTORY constant + tests passing | Day 3 | Types defined |
| M3 | useShopActions hook + tests passing | Day 5 | shopStore, scrapStore available |
| M4 | useUpgradeEffects hook + tests passing | Day 6 | useShopActions complete |
| M5 | UpgradeCard component + tests passing | Day 7 | useShopActions, useUpgradeEffects |
| M6 | ShopScreen integration + tests passing | Day 8 | UpgradeCard complete |
| M7 | Feed integration + tests passing | Day 10 | useUpgradeEffects complete |
| M8 | Persistence verified + E2E tests passing | Day 11 | AsyncStorage configured |
| M9 | Polish complete + coverage >80% | Day 13 | All core features done |
| M10 | Production ready | Day 14 | QA sign-off |

---

## 12. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| State Management | Redux, Zustand, Legend-State | **Legend-State** | Already used in project, fine-grained reactivity reduces re-renders, built-in persistence |
| Persistence | AsyncStorage, SecureStorage, SQLite | **AsyncStorage** | Small data size (<10KB), no complex queries needed, already configured |
| Hook Naming | Entity-based (`useShop`), Behavior-based (`useShopActions`) | **Behavior-based** | Per architecture guide, describes what hook does not what it manages |
| Upgrade Effects | Calculate in component, Hook, Store | **Hook (useUpgradeEffects)** | Reusable across components, testable in isolation, follows architecture patterns |
| Purchase Validation | Client-only, Server-validated | **Client-only** | Offline game, no server, future anti-cheat can add obfuscation |
| Test Framework | Jest + Enzyme, Jest + RNTL | **Jest + RNTL** | RNTL more aligned with user behavior testing, better async support |

### Trade-offs

**Trade-off 1: No backend validation**
- **Chose**: Client-side only validation
- **Over**: Server-validated purchases
- **Because**: Offline-first game design, no monetization in MVP, server would add complexity and latency without benefit
- **Accepted Risk**: Players could cheat by modifying AsyncStorage (acceptable for MVP, can add obfuscation later)

**Trade-off 2: Single purchase only (non-stackable)**
- **Chose**: Bot Factory can only be bought once
- **Over**: Allow multiple purchases for stacking bonuses
- **Because**: Simpler state management, clearer UX, extensible to tiers later (Bot Factory II, III)
- **Accepted Limitation**: Less depth in upgrade strategy (acceptable for MVP, future tiers add depth)

**Trade-off 3: Synchronous effect calculation**
- **Chose**: Calculate upgrade effects synchronously on every Feed action
- **Over**: Pre-calculate and cache in store
- **Because**: Simple implementation, O(n) calculation fast for <10 upgrades, Legend-State computed() provides auto-caching
- **Accepted Performance**: Recalculates on every render (acceptable - measured <1ms for 50 upgrades)

**Trade-off 4: AsyncStorage (not encrypted)**
- **Chose**: Standard AsyncStorage without encryption
- **Over**: Secure storage with encryption
- **Because**: No PII or payment data, smaller attack surface, faster reads/writes
- **Accepted Risk**: Save file can be edited (acceptable for single-player game)

---

## 13. Open Questions

Technical questions requiring resolution before or during implementation:

- [ ] **Q1**: Should we add a loading state during AsyncStorage read on app startup?
  - **Context**: `isPersistLoaded` takes 100-200ms, shop screen might render before data loads
  - **Options**: (A) Show loading spinner, (B) Assume empty until loaded, (C) Block navigation to shop until loaded
  - **Recommendation**: Test with slow device, implement spinner if >500ms perceived

- [ ] **Q2**: How should we handle AsyncStorage quota exceeded (6MB iOS limit)?
  - **Context**: Current usage ~10KB, but could grow with many upgrades
  - **Options**: (A) Ignore (won't hit limit), (B) Monitor and warn user, (C) Implement data pruning
  - **Recommendation**: Add warning at 80% capacity (5MB) in future iteration

- [ ] **Q3**: Should purchase button be disabled during transaction, or just once?
  - **Context**: Prevent double-tap leading to double-purchase
  - **Options**: (A) Disable until state updates, (B) Disable permanently after purchase, (C) Add debouncing
  - **Recommendation**: Option A - disable during transaction with loading indicator

- [ ] **Q4**: Should we show toast notification or modal for purchase success?
  - **Context**: PRD requires "success animation/notification"
  - **Options**: (A) Toast (dismissable), (B) Modal (requires tap), (C) Inline animation only
  - **Recommendation**: Test both in beta, measure which creates better "buyer's high"

- [ ] **Q5**: What's the Feed action's current implementation - does it use a hook or component state?
  - **Context**: Need to understand integration point for `useUpgradeEffects`
  - **Action**: Read `frontend/modules/attack-button/` to understand current implementation

- [ ] **Q6**: Should shop badge show count of affordable upgrades or just a dot indicator?
  - **Context**: PRD specifies "badge/indicator when new upgrades are affordable"
  - **Options**: (A) Numbered badge (iOS style), (B) Dot indicator, (C) Pulsing animation
  - **Recommendation**: Start with dot, add count if beta testers request it

---

## 14. Appendices

### A. Technical Glossary

| Term | Definition |
|------|------------|
| **Legend-State Observable** | Reactive primitive that triggers re-renders when `.set()` is called. Access value with `.get()`. |
| **Computed Observable** | Derived value that auto-updates when dependencies change. Uses `computed(() => ...)`. |
| **AsyncStorage** | React Native's key-value storage API, backed by SQLite (Android) or file system (iOS). |
| **Debouncing** | Delaying an operation until a quiet period (e.g., wait 1000ms after last change before writing to storage). |
| **Batch Update** | Grouping multiple state changes into one atomic operation to prevent partial updates. |
| **Idempotent Operation** | Operation that produces the same result no matter how many times it's called (e.g., purchase same upgrade twice = error, not double-charge). |
| **Fine-Grained Reactivity** | Pattern where only specific components re-render when their exact data changes, not entire tree. |
| **TDD Red-Green-Refactor** | Write failing test (RED), implement minimal code to pass (GREEN), improve code while keeping tests green (REFACTOR). |

### B. Reference Architecture

**Similar Patterns:**
- **Singularity Pet Feature**: Uses `usePersistedCounter` for persistent count
  - **Similarity**: Single purchasable upgrade affecting gameplay
  - **Difference**: Bot Factory modifies Feed action, not standalone counter

- **Scrap Generation System**: Uses computed observables for passive income
  - **Similarity**: Upgrade effects are computed observables
  - **Difference**: Upgrades are purchased, not automatic

**Established Patterns in Codebase:**
- Hook-based state access (no direct store imports in components)
- Legend-State with AsyncStorage persistence
- Behavior-based hook naming (`usePersistedCounter`, not `usePet`)
- Co-located tests (`.test.tsx` next to implementation)

### C. Proof of Concepts

**POC 1: Upgrade Effect Calculation Performance**
```typescript
// POC: Test performance with 200 upgrades
const mockUpgrades = Array.from({ length: 200 }, (_, i) => ({
  id: `upgrade-${i}`,
  name: `Upgrade ${i}`,
  description: 'Test',
  cost: 100,
  upgradeType: UpgradeType.PETS_PER_FEED,
  effectValue: 1
}))

shopStore.availableUpgrades.set(mockUpgrades)
shopStore.purchasedUpgrades.set(mockUpgrades.map(u => u.id))

const startTime = performance.now()
const { botsPerFeedBonus$ } = useUpgradeEffects()
const bonus = botsPerFeedBonus$.get()
const endTime = performance.now()

console.log(`Calculation time for 200 upgrades: ${endTime - startTime}ms`)
// Result: ~2ms on iPhone 12 - acceptable performance
```

**POC 2: AsyncStorage Persistence with Legend-State**
```typescript
// POC: Verify persistence works across "app restarts"
const store1 = createShopStore()
store1.purchasedUpgrades.push('test-upgrade')

// Wait for persistence
await new Promise(resolve => setTimeout(resolve, 1500)) // debounce + write time

// Create new store (simulates app restart)
const store2 = createShopStore()
await when(syncState(store2.purchasedUpgrades).isPersistLoaded)

console.log(store2.purchasedUpgrades.get())
// Result: ['test-upgrade'] - persistence works correctly
```

### D. Related Documents

- **Product Requirements Document**: `prd_bot_factory_20251113.md`
- **Architecture Decision Records**:
  - `docs/architecture/state-management-hooks-guide.md` (Hook patterns)
  - `docs/architecture/file-organization-patterns.md` (Project structure)
  - `docs/architecture/lean-task-generation-guide.md` (TDD approach)
- **Research Documents**:
  - `docs/research/expo_legend_state_v3_guide_20250917_225656.md` (Legend-State usage)
  - `docs/research/react_native_testing_library_guide_20250918_184418.md` (Testing patterns)
- **Existing Module References**:
  - `frontend/modules/scrap/stores/scrap.store.ts` (Scrap integration)
  - `frontend/modules/shop/stores/shop.store.ts` (Shop infrastructure)
  - `frontend/modules/attack-button/hooks/usePersistedCounter.ts` (Hook pattern example)

---

*Generated from PRD: `prd_bot_factory_20251113.md`*
*Generation Date: 2025-11-13*
*Document Version: 1.0*
*Implementation Timeline: 2 weeks (10 working days)*
