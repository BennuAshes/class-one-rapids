# Storage Pouch Upgrade - Technical Design Document

## Document Control

| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude Code | 2025-11-13 | Draft | Initial TDD from PRD |

## Executive Summary

This Technical Design Document outlines the implementation of the Storage Pouch upgrade feature—the first purchasable upgrade in the shop system. The implementation extends existing scrap generation and shop infrastructure with hook-based state management, TDD-driven development, and fine-grained reactivity using Legend-State v3. The feature provides +1 scrap per pet bonus, persists across sessions, and establishes patterns for future upgrade expansion.

---

## 1. Overview & Context

### Problem Statement

The current game loop lacks progression mechanics beyond passive scrap accumulation. Players have no spending opportunities or ways to improve efficiency, leading to high early churn (60-70% within 5 minutes). The Storage Pouch upgrade solves this by creating the first meaningful purchase decision that provides immediate, tangible benefits (doubled scrap generation rate).

### Solution Approach

Implement a complete upgrade purchase flow using:
- **Hook-based architecture** following `@docs/architecture/state-management-hooks-guide.md` patterns
- **Legend-State observables** for fine-grained reactivity and persistence
- **Test-Driven Development** using React Native Testing Library
- **Lean file organization** with co-located tests and behavior-focused hook naming
- **Additive upgrade system** enabling future expansion with multiple upgrade types

### Success Criteria

**Technical Metrics:**
- Shop screen render time < 200ms on mid-range devices
- Purchase transaction complete < 100ms (excluding AsyncStorage sync)
- Zero race conditions in purchase flow (atomic operations)
- 100% test coverage for purchase logic and scrap calculation
- Zero breaking changes to existing scrap generation system

**Business Metrics (from PRD):**
- 75%+ shop engagement rate
- 60%+ purchase conversion rate
- < 5% scrap depletion events (indicates balanced economy)

---

## 2. Requirements Analysis

### Functional Requirements

**FR-1: Shop Display System**
- Display scrollable list of available upgrades
- Show real-time scrap balance in header
- Visual affordance indicators (affordable/unaffordable states)
- "Purchased" badge on owned upgrades
- Disable purchase button for owned or unaffordable upgrades

**FR-2: Storage Pouch Upgrade Data**
- ID: `storage-pouch-1`
- Cost: 20 scrap (constant)
- Effect: +1 scrap per pet (additive bonus)
- Type: `UpgradeType.SCRAP_PER_PET`
- One-time purchase (non-stackable for MVP)

**FR-3: Purchase Transaction Flow**
- Pre-validation: Check sufficient funds
- Atomic operation: Deduct scrap + record ownership + update timestamp
- Post-purchase feedback: Visual confirmation (no errors silently swallowed)
- Error handling: Clear messages for insufficient funds, already purchased, invalid upgrade

**FR-4: Scrap Generation Integration**
- Calculate total scrap per pet bonus from owned upgrades
- Formula: `scrapPerTick = petCount × (BASE_RATE + totalUpgradeBonus)`
- Apply immediately without app restart
- Maintain 1-second tick accuracy
- Respect `SCRAP_CONSTRAINTS.MAX_SCRAP` ceiling

**FR-5: Persistence Layer**
- Persist purchased upgrade IDs to AsyncStorage (`shop-purchased-v1`)
- 1000ms debounce on writes to reduce I/O
- Load purchases on app launch
- Graceful degradation on storage failures

### Non-Functional Requirements

**Performance:**
- Shop screen initial render: < 200ms (target: 150ms)
- Purchase validation + state update: < 100ms
- AsyncStorage write latency: < 50ms (debounced)
- Scrap generation calculation overhead: < 5ms per tick

**Security:**
- No direct store mutations from components (hook-only access)
- Purchase validation before state changes (prevent negative scrap)
- Immutable upgrade purchase history
- Type-safe interfaces throughout

**Accessibility:**
- Minimum 44×44pt touch targets (WCAG 2.1 AA)
- Screen reader announcements for purchase success/failure
- Visual + text indicators for affordability (not color-only)
- Accessible labels for all interactive elements

**Scalability:**
- Support 50+ upgrades without FlatList performance degradation
- Extensible upgrade type system (`UpgradeType` enum)
- Generic purchase logic applicable to all upgrade types
- Efficient observable subscriptions (fine-grained updates only)

---

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ShopScreen.tsx                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Header (Scrap Balance)                              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  UpgradeList (ScrollView/FlatList)                   │  │
│  │   ├── UpgradeItem (Storage Pouch)                    │  │
│  │   ├── UpgradeItem (Future upgrades...)               │  │
│  │   └── EmptyState (no upgrades)                       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ useShopActions() hook
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              useShopActions.ts (Custom Hook)                 │
│  - Returns: actions { purchase,Reset }, observables         │
│  - Handles: Purchase logic, validation, state updates       │
│  - Accesses: shopStore$ (private), scrapStore$ (import)    │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴──────────────┐
        ↓                           ↓
┌──────────────────┐     ┌──────────────────────┐
│  shopStore$      │     │  scrapStore$         │
│  (Legend-State)  │     │  (existing)          │
├──────────────────┤     ├──────────────────────┤
│ availableUpgrades│     │ scrap: number        │
│ purchasedUpgrades│     │ lastTickTime: number │
│ lastPurchaseTime │     └──────────────────────┘
└────────┬─────────┘              ↑
         │                        │
         ↓ Persist via AsyncStorage
  ┌──────────────────────────────┐
  │  React Native AsyncStorage   │
  │  Keys:                        │
  │   - shop-purchased-v1         │
  │   - scrap-count-v1            │
  └──────────────────────────────┘

Scrap Generation Flow (Enhanced):
┌─────────────────────────────────────┐
│  useScrapGeneration.ts              │
│  (existing hook)                    │
│   ├── Calculate base: petCount × 1  │
│   ├── NEW: Get upgrade bonuses      │
│   ├── NEW: Apply to calculation     │
│   └── Set scrapStore$.scrap         │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│  useUpgradeBonuses.ts (NEW)         │
│  - Calculates total SCRAP_PER_PET   │
│  - Returns computed observable      │
│  - Reads shopStore$ purchases       │
└─────────────────────────────────────┘
```

### Component Design

#### ShopScreen Component
**Purpose**: Main shop UI displaying upgrades and handling navigation

**Responsibilities**:
- Render scrollable upgrade list
- Display current scrap balance
- Handle back navigation
- Show empty state when no upgrades available

**Interfaces**:
```typescript
interface ShopScreenProps {
  onBack?: () => void
}
```

**Dependencies**:
- `useShopActions()` - Purchase logic and shop state
- `scrapStore` - Current scrap balance (display only)
- `UpgradeList` component (new)
- `EmptyState` component (existing)

#### UpgradeList Component (NEW)
**Purpose**: Scrollable list of purchasable upgrades

**Responsibilities**:
- Render each upgrade as `UpgradeItem`
- Handle scroll performance for 50+ items (FlatList)
- Show empty state when no upgrades

**Interfaces**:
```typescript
interface UpgradeListProps {
  upgrades: Upgrade[]
  purchasedIds: string[]
  currentScrap: number
  onPurchase: (upgradeId: string) => Promise<PurchaseResult>
}
```

#### UpgradeItem Component (NEW)
**Purpose**: Individual upgrade card with purchase button

**Responsibilities**:
- Display upgrade name, description, cost, effect
- Show affordability state (visual distinction)
- Show purchased badge when owned
- Disable purchase button when unaffordable or owned
- Trigger purchase action on button press

**Interfaces**:
```typescript
interface UpgradeItemProps {
  upgrade$: Observable<Upgrade>
  isPurchased$: Observable<boolean>
  isAffordable$: Observable<boolean>
  onPurchase: () => Promise<void>
}
```

### Data Flow

**Purchase Flow Sequence:**
```
User Tap Purchase Button
    ↓
1. useShopActions.purchase(upgradeId)
    ↓
2. Validation:
   - Upgrade exists in availableUpgrades?
   - Not already purchased?
   - Sufficient scrap (scrapStore.scrap >= cost)?
    ↓
3. If valid → Atomic Transaction:
   - scrapStore.scrap.set(current - cost)
   - shopStore.purchasedUpgrades.push(upgradeId)
   - shopStore.lastPurchaseTime.set(Date.now())
    ↓
4. AsyncStorage persists changes (debounced 1000ms)
    ↓
5. Return PurchaseResult { success: true }
    ↓
6. UI updates via reactive observables:
   - Purchase button disables
   - "Purchased" badge appears
   - Scrap balance decreases
    ↓
7. Next scrap generation tick applies upgrade bonus
```

**Scrap Generation with Upgrades:**
```
setInterval (1000ms tick)
    ↓
1. useScrapGeneration hook triggered
    ↓
2. Calculate total bonus from upgrades:
   - useUpgradeBonuses() → totalScrapPerPetBonus
    ↓
3. Calculate scrap gained:
   - baseRate = 1 scrap per pet
   - scrapGained = petCount × (baseRate + totalScrapPerPetBonus)
    ↓
4. Update scrapStore:
   - newScrap = validateScrap(current + scrapGained)
   - scrapStore.scrap.set(newScrap)
   - scrapStore.lastTickTime.set(Date.now())
    ↓
5. UI updates reactively (scrap counter, generation rate)
```

---

## 4. API Design

### Internal Hook APIs

#### useShopActions Hook

```typescript
// hooks/useShopActions.ts

interface UseShopActionsReturn {
  // Observables for fine-grained reactivity
  availableUpgrades$: Observable<Upgrade[]>
  purchasedUpgrades$: Observable<string[]>
  lastPurchaseTime$: Observable<number>

  // Computed observables
  isPurchased$: (upgradeId: string) => Observable<boolean>
  isAffordable$: (upgradeId: string) => Observable<boolean>

  // Actions
  actions: {
    purchase: (upgradeId: string) => Promise<PurchaseResult>
    initializeUpgrades: () => void
  }
}

function useShopActions(): UseShopActionsReturn
```

**Key Methods:**
- `purchase(upgradeId)`: Validates and executes purchase transaction
- `initializeUpgrades()`: Populates `availableUpgrades` with hardcoded MVP list
- `isPurchased$(id)`: Returns computed observable checking ownership
- `isAffordable$(id)`: Returns computed observable checking affordability

#### useUpgradeBonuses Hook (NEW)

```typescript
// hooks/useUpgradeBonuses.ts

interface UpgradeBonuses {
  scrapPerPet: number    // Total bonus for SCRAP_PER_PET type
  petsPerFeed: number    // Total bonus for PETS_PER_FEED type (future)
}

interface UseUpgradeBonusesReturn {
  bonuses$: Observable<UpgradeBonuses>
  scrapPerPetBonus$: Observable<number>  // Convenience accessor
}

function useUpgradeBonuses(): UseUpgradeBonusesReturn
```

**Calculation Logic:**
```typescript
const bonuses$ = computed(() => {
  const purchasedIds = shopStore.purchasedUpgrades.get()
  const allUpgrades = shopStore.availableUpgrades.get()

  const ownedUpgrades = allUpgrades.filter(u =>
    purchasedIds.includes(u.id)
  )

  const scrapPerPet = ownedUpgrades
    .filter(u => u.upgradeType === UpgradeType.SCRAP_PER_PET)
    .reduce((sum, u) => sum + u.effectValue, 0)

  return { scrapPerPet, petsPerFeed: 0 }
})
```

### External Integrations

None required for MVP. All data is local (AsyncStorage persistence only).

---

## 5. Data Model

### Entity Design

#### Upgrade Entity (Existing - Extended)
```typescript
interface Upgrade {
  id: string                    // Unique identifier (e.g., "storage-pouch-1")
  name: string                  // Display name ("Storage Pouch")
  description: string           // Effect description ("Adds +1 scrap per pet")
  cost: number                  // Scrap cost (20)
  upgradeType: UpgradeType      // Effect category (SCRAP_PER_PET)
  effectValue: number           // Numeric bonus (1)
  iconName?: string             // Optional icon identifier (future)
}

enum UpgradeType {
  SCRAP_PER_PET = 'SCRAP_PER_PET',
  PETS_PER_FEED = 'PETS_PER_FEED'
}
```

#### PurchaseResult (Existing - Extended)
```typescript
interface PurchaseResult {
  success: boolean
  error?: 'INSUFFICIENT_FUNDS' | 'ALREADY_PURCHASED' | 'INVALID_UPGRADE'
  upgradeId?: string           // NEW: ID of purchased/attempted upgrade
  timestamp?: number           // NEW: Transaction timestamp
}
```

#### ShopState (Existing)
```typescript
interface ShopState {
  availableUpgrades: Upgrade[]      // Hardcoded list for MVP
  purchasedUpgrades: string[]       // Persisted to AsyncStorage
  lastPurchaseTime: number          // Persisted to AsyncStorage
}
```

### Database Schema (AsyncStorage)

**Key-Value Pairs:**

| Key | Value Type | Example | Persistence |
|-----|------------|---------|-------------|
| `shop-purchased-v1` | `string[]` | `["storage-pouch-1"]` | Legend-State synced |
| `shop-last-purchase-v1` | `number` | `1699887654321` | Legend-State synced |
| `scrap-count-v1` | `number` | `50` | Legend-State synced (existing) |

**Migration Strategy:**
- Version suffix (`-v1`) enables future schema changes
- No migration needed for MVP (greenfield feature)
- Future: Transform hooks can handle v1 → v2 data migration

### Data Access Patterns

**Common Queries:**
1. **Check if upgrade purchased**: `O(n)` array scan on purchasedUpgrades (acceptable for < 50 items)
2. **Check affordability**: Direct observable comparison `scrapStore.scrap.get() >= upgrade.cost`
3. **Calculate total bonuses**: `O(n × m)` where n = purchases, m = available upgrades (optimized with computed observables)
4. **Load on app start**: Single AsyncStorage read per key (async, debounced)

**Caching Strategy:**
- Legend-State observables provide automatic memoization
- Computed observables (`bonuses$`) recalculate only when dependencies change
- No manual caching required

**Data Consistency:**
- Purchase transaction is atomic within Legend-State (synchronous mutations)
- AsyncStorage writes are eventually consistent (acceptable for single-user local app)
- No conflict resolution needed (no server sync in MVP)

---

## 6. Security Design

### Authentication & Authorization

**Not Applicable for MVP** - Single-player local game with no accounts or authentication.

### Data Security

**Encryption at Rest:** None required for MVP (non-sensitive game data)
- Future consideration: Obfuscate AsyncStorage data to prevent trivial save editing

**Encryption in Transit:** Not applicable (no network requests)

**PII Handling:** No PII collected or stored

**Audit Logging:**
- `shopStore.lastPurchaseTime` records timestamp of each purchase
- Future: Expand to full purchase history log for analytics

### Security Controls

**Input Validation:**
```typescript
// Validate upgradeId exists before purchase
function validateUpgradeId(id: string, availableUpgrades: Upgrade[]): boolean {
  return availableUpgrades.some(u => u.id === id)
}

// Validate sufficient funds
function validateSufficientScrap(cost: number, currentScrap: number): boolean {
  return currentScrap >= cost
}

// Validate not already purchased
function validateNotPurchased(id: string, purchasedIds: string[]): boolean {
  return !purchasedIds.includes(id)
}
```

**State Protection:**
- No direct `shopStore` exports to components
- All mutations through hook actions only
- TypeScript enforces type safety
- Legend-State observables prevent accidental direct assignment

**Rate Limiting:** Not required (local single-player game)

**CORS Policies:** Not applicable (no network requests)

---

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools
- **Framework**: React Native Testing Library
- **Reference**: `@docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Test Runner**: Jest with React Native preset
- **Mocking**: Jest mocks for AsyncStorage (built-in mock from package)
- **Custom Renderers**: Wrap components with necessary providers

#### TDD Implementation Process

**For each feature/component, follow this strict order:**

1. **RED Phase - Write Failing Test First**
```typescript
test('should display Storage Pouch in shop', () => {
  render(<ShopScreen />)
  expect(screen.getByText('Storage Pouch')).toBeTruthy()
})
// This test MUST fail initially (component doesn't exist yet)
```

2. **GREEN Phase - Minimal Implementation**
- Write ONLY enough code to pass the test
- No extra features or optimizations
- Focus on making test green

3. **REFACTOR Phase - Improve Code**
- Clean up implementation
- Extract components/functions
- Maintain all green tests

### Test Categories (in order of implementation)

#### Unit Testing (TDD First Layer)

**Hook Tests:**
```typescript
// useShopActions.test.ts
describe('useShopActions', () => {
  test('initializes with Storage Pouch in available upgrades', () => {
    const { result } = renderHook(() => useShopActions())

    const upgrades = result.current.availableUpgrades$.get()
    expect(upgrades).toContainEqual(
      expect.objectContaining({ id: 'storage-pouch-1' })
    )
  })

  test('purchase succeeds with sufficient scrap', async () => {
    scrapStore.scrap.set(30) // More than 20 cost
    const { result } = renderHook(() => useShopActions())

    const purchaseResult = await act(async () => {
      return await result.current.actions.purchase('storage-pouch-1')
    })

    await waitFor(() => {
      expect(purchaseResult.success).toBe(true)
      expect(scrapStore.scrap.get()).toBe(10) // 30 - 20
      expect(result.current.purchasedUpgrades$.get()).toContain('storage-pouch-1')
    })
  })

  test('purchase fails with insufficient funds', async () => {
    scrapStore.scrap.set(15) // Less than 20 cost
    const { result } = renderHook(() => useShopActions())

    const purchaseResult = await act(async () => {
      return await result.current.actions.purchase('storage-pouch-1')
    })

    expect(purchaseResult.success).toBe(false)
    expect(purchaseResult.error).toBe('INSUFFICIENT_FUNDS')
    expect(scrapStore.scrap.get()).toBe(15) // Unchanged
  })

  test('purchase fails when already purchased', async () => {
    scrapStore.scrap.set(50)
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])
    const { result } = renderHook(() => useShopActions())

    const purchaseResult = await act(async () => {
      return await result.current.actions.purchase('storage-pouch-1')
    })

    expect(purchaseResult.success).toBe(false)
    expect(purchaseResult.error).toBe('ALREADY_PURCHASED')
  })
})
```

**Bonus Calculation Tests:**
```typescript
// useUpgradeBonuses.test.ts
describe('useUpgradeBonuses', () => {
  test('returns zero bonus when no upgrades purchased', () => {
    shopStore.purchasedUpgrades.set([])
    const { result } = renderHook(() => useUpgradeBonuses())

    expect(result.current.scrapPerPetBonus$.get()).toBe(0)
  })

  test('returns +1 bonus when Storage Pouch purchased', () => {
    shopStore.availableUpgrades.set([STORAGE_POUCH_UPGRADE])
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])
    const { result } = renderHook(() => useUpgradeBonuses())

    expect(result.current.scrapPerPetBonus$.get()).toBe(1)
  })

  test('sums multiple SCRAP_PER_PET upgrades', () => {
    shopStore.availableUpgrades.set([
      { id: 'upgrade-1', upgradeType: UpgradeType.SCRAP_PER_PET, effectValue: 1 },
      { id: 'upgrade-2', upgradeType: UpgradeType.SCRAP_PER_PET, effectValue: 2 }
    ])
    shopStore.purchasedUpgrades.set(['upgrade-1', 'upgrade-2'])
    const { result } = renderHook(() => useUpgradeBonuses())

    expect(result.current.scrapPerPetBonus$.get()).toBe(3) // 1 + 2
  })
})
```

**Component Render Tests:**
```typescript
// UpgradeItem.test.tsx
describe('UpgradeItem', () => {
  const mockUpgrade: Upgrade = {
    id: 'storage-pouch-1',
    name: 'Storage Pouch',
    description: 'Adds +1 scrap per pet',
    cost: 20,
    upgradeType: UpgradeType.SCRAP_PER_PET,
    effectValue: 1
  }

  test('renders upgrade name and description', () => {
    render(<UpgradeItem upgrade={mockUpgrade} isPurchased={false} isAffordable={true} />)

    expect(screen.getByText('Storage Pouch')).toBeTruthy()
    expect(screen.getByText('Adds +1 scrap per pet')).toBeTruthy()
  })

  test('shows cost in purchase button', () => {
    render(<UpgradeItem upgrade={mockUpgrade} isPurchased={false} isAffordable={true} />)

    expect(screen.getByText(/20.*scrap/i)).toBeTruthy()
  })

  test('disables button when not affordable', () => {
    render(<UpgradeItem upgrade={mockUpgrade} isPurchased={false} isAffordable={false} />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  test('shows purchased badge when owned', () => {
    render(<UpgradeItem upgrade={mockUpgrade} isPurchased={true} isAffordable={true} />)

    expect(screen.getByText(/purchased|owned/i)).toBeTruthy()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('calls onPurchase when button pressed', async () => {
    const onPurchase = jest.fn()
    render(<UpgradeItem upgrade={mockUpgrade} isPurchased={false} isAffordable={true} onPurchase={onPurchase} />)

    const user = userEvent.setup()
    await user.press(screen.getByRole('button'))

    expect(onPurchase).toHaveBeenCalledTimes(1)
  })
})
```

**Accessibility Tests:**
```typescript
// UpgradeItem.test.tsx (continued)
describe('UpgradeItem Accessibility', () => {
  test('purchase button meets touch target size', () => {
    render(<UpgradeItem upgrade={mockUpgrade} isPurchased={false} isAffordable={true} />)

    const button = screen.getByTestId('purchase-button')
    const style = Array.isArray(button.props.style)
      ? Object.assign({}, ...button.props.style)
      : button.props.style

    expect(style.minWidth).toBeGreaterThanOrEqual(44)
    expect(style.minHeight).toBeGreaterThanOrEqual(44)
  })

  test('button has accessibility label', () => {
    render(<UpgradeItem upgrade={mockUpgrade} isPurchased={false} isAffordable={true} />)

    const button = screen.getByRole('button')
    expect(button.props.accessibilityLabel).toContain('Storage Pouch')
    expect(button.props.accessibilityLabel).toContain('20 scrap')
  })
})
```

#### Integration Testing (TDD Second Layer)

**Scrap Generation Integration:**
```typescript
// scrapGeneration.integration.test.ts
describe('Scrap Generation with Upgrades', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    scrapStore.scrap.set(0)
    shopStore.purchasedUpgrades.set([])
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('generates base rate without upgrades', () => {
    const petCount = 3
    renderHook(() => useScrapGeneration(petCount))

    jest.advanceTimersByTime(1000) // 1 tick

    expect(scrapStore.scrap.get()).toBe(3) // 3 pets × 1 scrap/pet
  })

  test('applies Storage Pouch bonus to generation', async () => {
    shopStore.availableUpgrades.set([STORAGE_POUCH_UPGRADE])
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])

    const petCount = 3
    renderHook(() => useScrapGeneration(petCount))

    jest.advanceTimersByTime(1000) // 1 tick

    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(6) // 3 pets × (1 + 1) scrap/pet
    })
  })

  test('bonus applies immediately after purchase', async () => {
    scrapStore.scrap.set(30)
    shopStore.availableUpgrades.set([STORAGE_POUCH_UPGRADE])

    const petCount = 2
    renderHook(() => useScrapGeneration(petCount))
    const { result: shopResult } = renderHook(() => useShopActions())

    // Before purchase: 2 pets × 1 = 2 scrap/tick
    jest.advanceTimersByTime(1000)
    await waitFor(() => expect(scrapStore.scrap.get()).toBe(32))

    // Purchase upgrade
    await act(async () => {
      await shopResult.current.actions.purchase('storage-pouch-1')
    })

    // After purchase: 2 pets × 2 = 4 scrap/tick
    jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(16) // 32 - 20 (cost) + 4 (generation)
    })
  })
})
```

**Shop UI Integration:**
```typescript
// ShopScreen.integration.test.tsx
describe('ShopScreen Integration', () => {
  test('full purchase flow with UI updates', async () => {
    scrapStore.scrap.set(25)
    render(<ShopScreen />)

    // Verify initial state
    expect(screen.getByText(/scrap: 25/i)).toBeTruthy()
    expect(screen.getByText('Storage Pouch')).toBeTruthy()

    // Purchase button should be enabled
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

  test('shows error message on insufficient funds', async () => {
    scrapStore.scrap.set(15) // Less than 20
    render(<ShopScreen />)

    const purchaseButton = screen.getByRole('button', { name: /purchase.*storage pouch/i })
    expect(purchaseButton).toBeDisabled()

    // Verify visual indicator
    expect(screen.getByText(/not enough scrap|insufficient funds/i)).toBeTruthy()
  })
})
```

#### End-to-End Testing (TDD Third Layer)

**Complete User Flow:**
```typescript
// e2e/upgrade-purchase.e2e.test.tsx
describe('Upgrade Purchase E2E', () => {
  test('player accumulates scrap, purchases upgrade, sees benefit', async () => {
    jest.useFakeTimers()

    // Start with 0 scrap, 1 pet
    scrapStore.scrap.set(0)
    const petCount = 1

    // Render main app
    render(<App />)

    // Navigate to shop
    const shopButton = screen.getByText(/shop/i)
    await userEvent.press(shopButton)

    // Initially cannot afford upgrade
    const purchaseButton = screen.getByRole('button', { name: /purchase.*storage pouch/i })
    expect(purchaseButton).toBeDisabled()

    // Generate scrap over time
    renderHook(() => useScrapGeneration(petCount))
    jest.advanceTimersByTime(25000) // 25 ticks = 25 scrap (1 per tick)

    await waitFor(() => {
      expect(screen.getByText(/scrap: 25/i)).toBeTruthy()
      expect(purchaseButton).not.toBeDisabled()
    })

    // Purchase upgrade
    await userEvent.press(purchaseButton)

    await waitFor(() => {
      expect(screen.getByText(/scrap: 5/i)).toBeTruthy()
      expect(screen.getByText(/purchased/i)).toBeTruthy()
    })

    // Verify generation rate increased
    scrapStore.scrap.set(5) // Reset for clear measurement
    jest.advanceTimersByTime(1000) // 1 tick

    await waitFor(() => {
      expect(scrapStore.scrap.get()).toBe(7) // 5 + (1 pet × 2 scrap/pet)
    })

    jest.useRealTimers()
  })
})
```

### TDD Checklist for Each Component

- [ ] First test written before any implementation code
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns
- [ ] No testIds unless absolutely necessary (style verification)
- [ ] Tests query by user-visible content (text, roles, labels)
- [ ] Async operations use `waitFor`/`findBy`/`act`
- [ ] All tests pass before next feature
- [ ] Coverage > 80% for new code

---

## 8. Infrastructure & Deployment

### Infrastructure Requirements

**Not Applicable** - React Native mobile app with no server infrastructure required for MVP.

### Deployment Architecture

**Environment Strategy:**
- **Development**: Local simulator/emulator testing
- **Testing**: CI/CD automated test runs (GitHub Actions or similar)
- **Production**: App Store (iOS) + Google Play (Android) releases

**Build Configuration:**
- React Native build system (Metro bundler)
- TypeScript compilation
- Jest for testing
- EAS Build (Expo Application Services) for production builds

### Monitoring & Observability

#### Metrics

**Application Metrics** (Future - Not MVP):
- Shop screen render time (performance monitoring)
- Purchase success/failure rates
- Average scrap at first purchase
- Upgrade ownership distribution

**Business Metrics** (Analytics - Future):
- Time to first purchase
- Purchase conversion rate
- Session length post-purchase
- Repeat shop visits

#### Logging

**MVP Logging:**
- Console warnings on AsyncStorage failures
- Error boundaries catch React errors
- Purchase failures logged to console (dev mode)

**Future Logging:**
- Structured logging service (e.g., Sentry for React Native)
- Purchase event tracking
- Error reporting with stack traces

#### Alerting

**Not Applicable for MVP** - No server infrastructure to monitor.

---

## 9. Scalability & Performance

### Performance Requirements

**From PRD Non-Functional Requirements:**
- **Shop screen render**: < 200ms (target: 150ms on mid-range devices)
- **Purchase transaction**: < 100ms (state mutations only, excluding AsyncStorage)
- **AsyncStorage sync**: < 50ms write latency (debounced to 1000ms intervals)
- **Scrap generation calculation**: < 5ms overhead per tick (1-second intervals)

### Scalability Strategy

**Horizontal Scaling:** Not applicable (single-user local app)

**Component Scalability:**
- **UpgradeList**: Use `FlatList` with `windowSize` optimization for 50+ items
- **Observable subscriptions**: Fine-grained subscriptions prevent full component re-renders
- **Computed bonuses**: Memoized calculations recalculate only on purchase changes

**Database Scaling (AsyncStorage):**
- Debounced writes (1000ms) reduce I/O frequency
- Single key-value pairs avoid large blob reads/writes
- Future: Consider IndexedDB for web builds (supports indexing)

### Performance Optimization

**Query Optimization:**
```typescript
// Efficient purchase check using computed observables
const isPurchased$ = (upgradeId: string) => computed(() => {
  return shopStore.purchasedUpgrades.get().includes(upgradeId)
})

// Efficient affordability check
const isAffordable$ = (cost: number) => computed(() => {
  return scrapStore.scrap.get() >= cost
})
```

**Render Optimization:**
```typescript
// Use fine-grained reactivity to prevent full list re-renders
<For each={availableUpgrades$}>
  {(upgrade$) => (
    <UpgradeItem
      upgrade$={upgrade$}
      isPurchased$={isPurchased$(upgrade$.id.get())}
      isAffordable$={isAffordable$(upgrade$.cost.get())}
    />
  )}
</For>
```

**Code-Level Optimizations:**
- Avoid `.get()` calls in render loops (use computed observables instead)
- Use `useMemo` for expensive non-observable calculations
- Lazy load heavy components with `React.lazy()` (future)

**Resource Pooling:**
- Reuse upgrade definition objects (hardcoded constants)
- Single `setInterval` for scrap generation (existing)
- Single Legend-State configuration (global persistence plugin)

---

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| **Race condition on purchase** | High (duplicate purchase, negative scrap) | Medium | Disable button during transaction, atomic state updates, add purchase mutex | Frontend Dev |
| **AsyncStorage write failure** | Medium (lost purchase data) | Low | Retry logic with exponential backoff, graceful degradation (console warn + continue) | Frontend Dev |
| **Incorrect scrap calculation** | High (game economy broken) | Medium | Comprehensive unit tests (20+ test cases), integration tests with fake timers | Frontend Dev + QA |
| **Performance degradation with many upgrades** | Medium (slow shop screen) | Low | Use FlatList virtualization, profile with 100+ mock upgrades, optimize observables | Frontend Dev |
| **Storage quota exceeded** | Low (app unusable) | Very Low | Monitor storage usage, implement cleanup for old data, warn user if approaching limit | Frontend Dev |
| **Observable memory leaks** | Medium (app crashes over time) | Low | Audit observable subscriptions, ensure cleanup in useEffect, profile with React DevTools | Frontend Dev |

### Dependencies

**From PRD Dependencies Table:**

| Dependency | Status | Mitigation |
|------------|--------|------------|
| Existing scrap generation system functional | ✅ Complete | Verified via `useScrapGeneration.ts` review |
| Shop store and types defined | ✅ Complete | Verified via `shop.store.ts` and `types.ts` review |
| AsyncStorage configured | ✅ Complete | Verified via `observablePersistAsyncStorage` usage |

**Additional Technical Dependencies:**
- Legend-State v3 beta stability (possible API changes) → Pin version in package.json, monitor changelog
- React Native Testing Library compatibility → Use stable release (v12+), avoid experimental features

---

## 11. Implementation Plan (TDD-Driven)

### Development Phases

Following `@docs/architecture/lean-task-generation-guide.md` principles - prioritize user-visible functionality.

#### Phase 1: Foundation & Core Hook [2 days]

**Day 1: TDD Setup & useShopActions Hook**
1. **Test Setup (1 hour)**
   - Configure jest with AsyncStorage mock
   - Set up test utilities and custom renderer
   - Verify test environment works

2. **useShopActions Hook - TDD Cycle (4 hours)**
   - **RED**: Write tests for upgrade initialization
     - Test: availableUpgrades includes Storage Pouch
     - Test: purchasedUpgrades initializes empty
   - **GREEN**: Implement hook skeleton + initializeUpgrades()
   - **REFACTOR**: Extract STORAGE_POUCH constant

   - **RED**: Write purchase validation tests
     - Test: Purchase succeeds with valid conditions
     - Test: Purchase fails with insufficient scrap
     - Test: Purchase fails when already purchased
     - Test: Purchase fails with invalid upgrade ID
   - **GREEN**: Implement purchase() action with validation
   - **REFACTOR**: Extract validation functions

3. **Persistence Tests (2 hours)**
   - **RED**: Write AsyncStorage persistence tests
     - Test: Purchased upgrades persist across hook remounts
     - Test: lastPurchaseTime updates on purchase
   - **GREEN**: Implement Legend-State persistence configuration
   - **REFACTOR**: Extract persistence config to shared module

4. **Computed Observables (1 hour)**
   - **RED**: Write tests for isPurchased$ and isAffordable$
   - **GREEN**: Implement computed observables
   - **REFACTOR**: Optimize observable dependencies

**Day 2: useUpgradeBonuses Hook & Scrap Integration**
1. **useUpgradeBonuses Hook - TDD Cycle (3 hours)**
   - **RED**: Write bonus calculation tests
     - Test: Zero bonus with no purchases
     - Test: +1 bonus with Storage Pouch
     - Test: Multiple upgrades sum correctly
   - **GREEN**: Implement bonuses$ computed observable
   - **REFACTOR**: Extract bonus calculation logic

2. **Scrap Generation Integration (3 hours)**
   - **RED**: Write integration tests
     - Test: Base generation without upgrades
     - Test: Enhanced generation with Storage Pouch
     - Test: Bonus applies immediately after purchase
   - **GREEN**: Modify useScrapGeneration to call useUpgradeBonuses
   - **REFACTOR**: Extract scrap calculation formula

3. **Integration Test Suite (2 hours)**
   - Run full integration tests with fake timers
   - Verify no race conditions in rapid purchase scenarios
   - Performance profiling (generation tick overhead < 5ms)

#### Phase 2: UI Components [2 days]

**Day 3: UpgradeItem Component**
1. **Component Structure - TDD Cycle (4 hours)**
   - **RED**: Write render tests
     - Test: Displays name, description, cost
     - Test: Shows purchase button
     - Test: Shows purchased badge when owned
   - **GREEN**: Implement UpgradeItem component
   - **REFACTOR**: Extract styles, create StyleSheet

2. **Interaction Tests (2 hours)**
   - **RED**: Write interaction tests
     - Test: Button calls onPurchase
     - Test: Button disabled when not affordable
     - Test: Button disabled when already purchased
   - **GREEN**: Implement button states and onPress handler
   - **REFACTOR**: Extract affordability styling logic

3. **Accessibility (2 hours)**
   - **RED**: Write accessibility tests
     - Test: Button has min 44×44pt touch target
     - Test: Button has clear accessibility label
     - Test: Visual + text indicators for affordability
   - **GREEN**: Add accessibility props and styling
   - **REFACTOR**: Create accessibility utility helpers

**Day 4: UpgradeList & ShopScreen Integration**
1. **UpgradeList Component (3 hours)**
   - **RED**: Write list render tests
     - Test: Renders all available upgrades
     - Test: Shows empty state when no upgrades
   - **GREEN**: Implement UpgradeList with ScrollView
   - **REFACTOR**: Optimize with FlatList for scalability

2. **ShopScreen Integration (3 hours)**
   - **RED**: Write full screen integration tests
     - Test: Complete purchase flow end-to-end
     - Test: Error message displays on insufficient funds
     - Test: Purchased state persists on navigation
   - **GREEN**: Integrate UpgradeList into ShopScreen
   - **REFACTOR**: Extract header component if needed

3. **Visual Polish & Edge Cases (2 hours)**
   - Add loading states (AsyncStorage load on mount)
   - Error handling UI for storage failures
   - Visual feedback on purchase (future: animation)

#### Phase 3: Hardening & Documentation [1 day]

**Day 5: Testing & Bug Fixes**
1. **Coverage Analysis (2 hours)**
   - Run coverage report (target: >80%)
   - Write additional tests for uncovered branches
   - Test edge cases (MAX_SCRAP ceiling, multiple rapid purchases)

2. **Performance Testing (2 hours)**
   - Profile shop screen render time (target: <200ms)
   - Profile purchase transaction time (target: <100ms)
   - Load test with 50 mock upgrades (FlatList performance)

3. **Accessibility Audit (2 hours)**
   - Manual screen reader testing (TalkBack/VoiceOver)
   - Verify WCAG 2.1 AA compliance
   - Test on tablets (touch target sizes)

4. **Documentation (2 hours)**
   - Update component README files
   - Document hook APIs with JSDoc comments
   - Create inline code comments for complex logic

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|-------------|------|--------------|
| M1: Core Hooks Complete | useShopActions + useUpgradeBonuses with tests | End of Day 2 | AsyncStorage mock setup |
| M2: UI Components Complete | UpgradeItem + UpgradeList with tests | End of Day 4 | M1 complete |
| M3: Integration Complete | Full shop flow working end-to-end | End of Day 5 (morning) | M2 complete |
| M4: Ready for QA | All tests pass, coverage >80%, docs complete | End of Day 5 (EOD) | M3 complete |

---

## 12. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| **State Management** | Context API, Zustand, Legend-State | **Legend-State v3** | Already used in project, fine-grained reactivity, excellent persistence support |
| **Hook Naming** | Entity-based (`useSingularityPet`) vs Behavior-based (`usePersistedCounter`) | **Behavior-based** | Per architecture guide, focus on behavior not entity; enables reusability |
| **Component Structure** | Single ShopScreen vs separate UpgradeList | **Separate UpgradeList** | Better separation of concerns, easier testing, reusable for future features |
| **Purchase Validation** | Client-side only vs eventual server validation | **Client-side only (MVP)** | No server in MVP; sufficient for single-player local game |
| **Upgrade Data Source** | Hardcoded vs JSON file vs server API | **Hardcoded constant** | MVP simplicity; easy to migrate to JSON/API later |
| **List Rendering** | ScrollView vs FlatList | **ScrollView (MVP), FlatList-ready** | ScrollView simpler for single item; structure supports FlatList upgrade |

### Trade-offs

**Trade-off 1: Atomic Transactions vs Race Condition Locking**
- **Chose**: Atomic state updates + button disable during transaction
- **Over**: Mutex/lock system or optimistic updates with rollback
- **Because**: Simpler implementation, sufficient for local single-user app, easier to test

**Trade-off 2: Eager Persistence vs Debounced Persistence**
- **Chose**: Debounced (1000ms) AsyncStorage writes
- **Over**: Immediate writes on every state change
- **Because**: Reduces I/O load, acceptable eventual consistency for game data, configurable via Legend-State

**Trade-off 3: Generic Purchase Hook vs Upgrade-Specific Hook**
- **Chose**: Generic `useShopActions` supporting all upgrade types
- **Over**: Separate `useStoragePouchUpgrade` hook
- **Because**: Scalable to 50+ upgrades, follows DRY principles, easier to maintain

**Trade-off 4: ScrollView vs FlatList for MVP**
- **Chose**: ScrollView for MVP with 1 upgrade, architecture supports FlatList upgrade
- **Over**: FlatList immediately
- **Because**: Premature optimization (only 1 upgrade in MVP), but structure designed for easy migration

---

## 13. Open Questions

### Technical Questions Requiring Resolution

- [ ] **Purchase Confirmation Dialog**: Should we show "Are you sure?" modal before purchase, or allow instant one-tap purchases?
  - **Impact**: UX simplicity vs preventing accidental purchases
  - **Recommendation**: One-tap for MVP (simple), add confirmation in future if users report accidental purchases

- [ ] **Concurrent Scrap Spending**: What happens if scrap generation tick and purchase action occur simultaneously?
  - **Impact**: Potential race condition, could allow purchase with temporarily insufficient funds
  - **Mitigation**: Disable purchase button during transactions, validate scrap amount atomically
  - **Resolution**: Implement atomic validation (check + deduct in single synchronous operation)

- [ ] **Purchase Animation**: Should purchase feedback be visual only, or include haptic/sound?
  - **Impact**: User satisfaction vs implementation complexity
  - **Recommendation**: Visual feedback (text change) for MVP, haptics in P1 iteration

- [ ] **ROI Calculator**: Display "Pays for itself in X seconds" on upgrade card?
  - **Impact**: User clarity vs UI clutter
  - **Recommendation**: Skip for MVP (only 1 upgrade, simple math), revisit when multiple upgrades exist

- [ ] **Generation Rate Display**: Show "Scrap/sec: X.XX" dynamically in UI?
  - **Impact**: User awareness vs implementation complexity
  - **Recommendation**: Add in P1 iteration (requires computed observable + UI update)

- [ ] **Analytics Events**: Which purchase events should we track for future analytics?
  - **Proposed Events**: `shop_viewed`, `upgrade_viewed`, `purchase_attempted`, `purchase_succeeded`, `purchase_failed_insufficient_funds`, `purchase_failed_already_owned`
  - **Resolution**: Implement event hooks in actions, integrate analytics SDK in future iteration

---

## 14. Appendices

### A. Technical Glossary

| Term | Definition |
|------|------------|
| **Observable** | Legend-State reactive primitive that notifies subscribers on value changes |
| **Computed Observable** | Derived observable that recalculates when dependencies change |
| **Fine-Grained Reactivity** | Pattern where only specific components re-render on relevant state changes, not entire tree |
| **Atomic Operation** | Transaction that completes fully or not at all (no partial state) |
| **Debouncing** | Delaying operation execution until activity stops for specified duration |
| **Hook** | React function starting with `use` that encapsulates stateful logic |
| **Behavior-Based Naming** | Naming hooks by what they DO (e.g., `usePersistedCounter`) not what they manage (e.g., `usePet`) |
| **TDD (Test-Driven Development)** | Writing tests before implementation (Red-Green-Refactor cycle) |
| **AsyncStorage** | React Native key-value storage API (persistent across app restarts) |
| **WCAG** | Web Content Accessibility Guidelines (mobile accessibility standards) |

### B. Reference Architecture

**Similar Patterns in Codebase:**
- `useScrapGeneration` hook: Effect hook pattern for tick-based generation
- `scrapStore`: Legend-State observable with AsyncStorage persistence
- `shopStore`: Existing shop state structure (extends for upgrades)

**External References:**
- [Legend-State Persistence Guide](https://legendapp.com/open-source/state/v3/sync/persist/)
- [React Native Testing Library Best Practices](https://callstack.github.io/react-native-testing-library/docs/how-should-i-query)
- [WCAG 2.1 Mobile Accessibility](https://www.w3.org/WAI/standards-guidelines/mobile/)

### C. Proof of Concepts

**None Required for MVP** - All patterns already validated in existing codebase (scrap generation, shop store, Legend-State persistence).

### D. Related Documents

**Source Documents:**
- **PRD**: `frontend/modules/upgrades/specs/prd_storage_pouch_upgrade_20251113.md`
- **Architecture Guides**:
  - `docs/architecture/state-management-hooks-guide.md` - Hook patterns and behavior-based naming
  - `docs/architecture/file-organization-patterns.md` - Co-located tests, no barrel exports
  - `docs/architecture/lean-task-generation-guide.md` - Just-in-time development principles
- **Research Guides**:
  - `docs/research/expo_legend_state_v3_guide_20250917_225656.md` - Legend-State implementation patterns
  - `docs/research/react_native_testing_library_guide_20250918_184418.md` - Testing best practices

**Existing Implementation Files:**
- `frontend/modules/shop/stores/shop.store.ts` - Base shop store
- `frontend/modules/shop/types.ts` - Upgrade type definitions
- `frontend/modules/scrap/stores/scrap.store.ts` - Scrap state management
- `frontend/modules/scrap/hooks/useScrapGeneration.ts` - Generation hook to extend
- `frontend/modules/shop/ShopScreen.tsx` - Shop UI to extend

---

*Generated from PRD: `prd_storage_pouch_upgrade_20251113.md`*
*Generation Date: 2025-11-13*
*TDD Document Version: 1.0*
