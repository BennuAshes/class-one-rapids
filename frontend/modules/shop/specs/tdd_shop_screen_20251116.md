# Shop Screen & Upgrade System Technical Design Document

## Document Control

| Version | Author      | Date       | Status | Changes              |
| ------- | ----------- | ---------- | ------ | -------------------- |
| v1.0    | Claude      | 2025-11-16 | Draft  | Initial TDD from PRD |

## Executive Summary

This Technical Design Document defines the implementation strategy for a shop screen and upgrade infrastructure that provides a scrap-based economy and progression system. The feature introduces navigation between the main clicker screen and a dedicated shop screen where users can view and purchase upgrades that enhance gameplay mechanics. Implementation follows Test-Driven Development (TDD) methodology with React Native Testing Library and Legend-State v3 for fine-grained reactive state management, building upon the existing clicker screen foundation.

## 1. Overview & Context

### Problem Statement

Users accumulate scrap through gameplay but currently have no mechanism to spend this resource. Without a shop system and upgrade infrastructure, scrap becomes meaningless, users lack progression incentives beyond simple accumulation, and the application cannot establish strategic depth or mid-to-long-term retention hooks. The absence of a spending mechanism removes opportunities for resource-based decision-making and scaling difficulty/reward structures.

### Solution Approach

Implement a multi-screen application featuring:
1. Navigation system for switching between clicker screen and shop screen
2. Dedicated shop screen displaying current scrap balance and upgrade list
3. Upgrade data model supporting two effect types: "scrap per pet" and "pets per feed"
4. Purchase flow with validation (sufficient scrap check) and state updates
5. Persistent tracking of purchased upgrades via AsyncStorage
6. Infrastructure for adding future upgrades without architectural changes

### Success Criteria

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| Shop access rate | 60%+ users click shop button | Analytics/manual testing |
| Navigation response time | <200ms screen transitions | Performance testing with RN Testing Library |
| Purchase transaction time | <100ms from tap to state update | Integration tests measuring action latency |
| UI render performance | 60fps sustained with 0-100 upgrades | FlatList virtualization performance testing |
| Shop screen crash rate | <0.1% | Error boundary integration tests |

## 2. Codebase Exploration & Integration Analysis

### Existing Components

**EXPLORATION RESULTS**:

#### App.tsx
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/App.tsx`
- **Current state**: Renders ClickerScreen directly inside SafeAreaProvider
- **Purpose**: Application root component
- **Decision**: UPDATE to conditionally render ClickerScreen or ShopScreen based on navigation state

```typescript
// Current implementation (lines 1-11):
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClickerScreen } from "./modules/attack-button/ClickerScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <ClickerScreen />
    </SafeAreaProvider>
  );
}
```

#### ClickerScreen Component
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
- **Current state**: Complete implementation with feed button and counter display
- **Purpose**: Main gameplay screen
- **Integration**: Uses usePersistedCounter hook, Legend-State Memo components
- **Decision**: UPDATE to add shop navigation button

#### useNavigation Hook
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useNavigation.ts`
- **Current state**: Complete navigation hook with observable-based screen switching
- **Purpose**: State-based navigation using Legend-State
- **Integration**: Exports `currentScreen$` observable and navigation actions
- **Decision**: USE existing hook (already supports 'clicker' | 'shop' screens)
- **Key APIs**:
  - `currentScreen$: Observable<'clicker' | 'shop'>` - Observable for current screen
  - `actions.navigateToShop()` - Navigate to shop
  - `actions.navigateToClicker()` - Return to clicker

```typescript
// Existing navigation hook structure:
type Screen = 'clicker' | 'shop';
const currentScreen$ = observable<Screen>('clicker');

export function useNavigation(): UseNavigationReturn {
  return {
    currentScreen$,
    actions: {
      navigateToShop: () => { currentScreen$.set('shop'); },
      navigateToClicker: () => { currentScreen$.set('clicker'); },
      reset: () => { currentScreen$.set('clicker'); }
    }
  };
}
```

#### usePersistedCounter Hook
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.ts`
- **Current state**: Complete implementation with Legend-State synced persistence
- **Purpose**: Persistent counter behavior with AsyncStorage
- **Integration**: Used by ClickerScreen for pet count
- **Decision**: REUSE for scrap tracking (different storage key)
- **Key Pattern**: Behavior-based hook following state management guide

### Module Structure

**shop module**:
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/`
- **Current state**: Only specs directory exists
- **Decision**: CREATE all implementation files in this module

**Expected Structure**:
```
frontend/modules/shop/
├── ShopScreen.tsx                # CREATE - Shop screen component
├── ShopScreen.test.tsx           # CREATE - Component integration tests
├── components/
│   ├── UpgradeList.tsx           # CREATE - Upgrade list component
│   ├── UpgradeList.test.tsx      # CREATE - Component tests
│   ├── UpgradeItem.tsx           # CREATE - Individual upgrade item
│   └── UpgradeItem.test.tsx      # CREATE - Component tests
├── hooks/
│   ├── useUpgrades.ts            # CREATE - Upgrade state hook
│   └── useUpgrades.test.tsx      # CREATE - Hook unit tests
├── types/
│   └── upgrade.ts                # CREATE - TypeScript types
└── specs/
    ├── prd_shop_screen_20251116.md     # EXISTS
    └── tdd_shop_screen_20251116.md     # THIS FILE
```

**Shared State Integration**:
- **Scrap Balance**: Reuse `usePersistedCounter('scrap-balance')` pattern
- **Navigation**: Use existing `useNavigation()` hook
- **Purchased Upgrades**: Create new persistent state via Legend-State synced()

### Existing Dependencies

**Legend-State v3**: `@legendapp/state@^3.0.0-beta.35`
- Observable primitives
- Persistence plugins (synced, AsyncStorage integration)
- React integration (Memo, For, Show components)

**AsyncStorage**: `@react-native-async-storage/async-storage@^2.2.0`
- Persistent key-value storage
- Cross-platform compatible with Expo SDK 54

**Testing**:
- `@testing-library/react-native@^13.3.3`
- `@testing-library/jest-native@^5.4.3`
- `jest-expo@^54.0.13`

**UI Components**:
- `react-native-safe-area-context@~5.6.0` (already configured)
- React Native core components (View, Text, Pressable, FlatList, ScrollView)

### Architecture Decisions (UPDATE vs CREATE)

**Component: App.tsx**
- ✅ **DECISION: UPDATE** existing file at `/mnt/c/dev/class-one-rapids/frontend/App.tsx`
  - RATIONALE: Root app file needs conditional rendering logic for multi-screen navigation

**Component: ClickerScreen.tsx**
- ✅ **DECISION: UPDATE** existing file at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
  - RATIONALE: Add shop navigation button to existing screen

**Component: ShopScreen**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`
  - RATIONALE: New feature component. Primary shop interface.

**Component: UpgradeList**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/components/UpgradeList.tsx`
  - RATIONALE: Separates upgrade list rendering from screen layout logic

**Component: UpgradeItem**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/components/UpgradeItem.tsx`
  - RATIONALE: Reusable upgrade card component following component composition patterns

**Hook: useUpgrades**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/hooks/useUpgrades.ts`
  - RATIONALE: Behavior-based hook for upgrade management (collection behavior + purchase behavior)

**Types: upgrade.ts**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/types/upgrade.ts`
  - RATIONALE: Centralized TypeScript type definitions for upgrade data model

**Tests**
- ❌ **DECISION: CREATE** all test files co-located with implementation
  - RATIONALE: Follows co-location pattern from existing codebase

### Integration Validation

- **Duplicate components**: None - shop is a new feature module
- **Module ownership clarity**:
  - attack-button module owns clicker screen
  - shop module owns shop screen and upgrade infrastructure
  - shared/hooks owns navigation (already exists)
- **Navigation accessibility**: Both screens accessible via useNavigation hook
- **State collision prevention**:
  - Scrap balance: `scrap-balance` storage key (new)
  - Pet count: `singularity-pet-count` storage key (existing)
  - Purchased upgrades: `purchased-upgrades` storage key (new)
- **Cross-screen state sharing**:
  - Scrap balance must be accessible from both clicker and shop screens
  - Upgrade effects must apply to clicker screen mechanics

## 3. Requirements Analysis

### Functional Requirements

| ID | Requirement | Technical Implementation |
|----|-------------|-------------------------|
| **Navigation** |
| R1.1 | Shop button visible on clicker screen | Pressable component in ClickerScreen with navigation action |
| R1.2 | Tapping shop button navigates to shop screen | Call `actions.navigateToShop()` from useNavigation hook |
| R1.3 | Shop screen includes back button to clicker | Pressable with `actions.navigateToClicker()` action |
| R1.4 | Navigation preserves all game state | State persists in observables (no unmounting) |
| R1.5 | Screen transitions complete within 200ms | Conditional rendering based on currentScreen$ observable |
| **Shop Screen Display** |
| R2.1 | Shop displays current scrap balance | Memo component observing scrap$ from usePersistedCounter('scrap-balance') |
| R2.2 | Shop includes scrollable upgrade list area | FlatList component rendering upgrade items |
| R2.3 | Empty state displays when no upgrades available | Show component with conditional rendering |
| R2.4 | Shop follows consistent styling with clicker | Shared StyleSheet patterns, matching colors/fonts |
| **Upgrade Data Model** |
| R3.1 | Each upgrade has unique identifier | `id: string` (UUID or timestamp-based) |
| R3.2 | Each upgrade has name | `name: string` |
| R3.3 | Each upgrade has description | `description: string` |
| R3.4 | Each upgrade has scrap cost | `cost: number` (positive integer) |
| R3.5 | Each upgrade has effect type | `effectType: 'scrapPerPet' \| 'petsPerFeed'` |
| R3.6 | Each upgrade has effect value | `effectValue: number` (boost amount) |
| R3.7 | Upgrade structure supports future expansion | TypeScript interface with optional fields for prerequisites, icons, etc. |
| **Purchase Flow** |
| R4.1 | Users initiate purchase by tapping upgrade | Pressable onPress on UpgradeItem component |
| R4.2 | Purchase validates scrap >= cost | Validation logic in purchase action |
| R4.3 | Successful purchase deducts scrap | `scrap$.set(scrap$.get() - cost)` |
| R4.4 | Successful purchase marks upgrade as purchased | Add upgrade.id to purchasedUpgrades$ Set |
| R4.5 | Purchased upgrades cannot be re-purchased | Filter purchased upgrades from available list |
| R4.6 | Failed purchase shows error message | Alert or toast notification for insufficient scrap |
| R4.7 | Purchase updates persist across sessions | AsyncStorage via synced() for purchasedUpgrades$ |
| **State Management** |
| R5.1 | Scrap balance shared between screens | Single observable accessed via usePersistedCounter |
| R5.2 | Purchased upgrades persist to local storage | synced() configuration with AsyncStorage plugin |
| R5.3 | Upgrade effects apply to clicker gameplay | Computed values in clicker screen reading purchased upgrades |
| R5.4 | State updates propagate reactively | Legend-State observables trigger Memo re-renders |

### Non-Functional Requirements

#### Performance
- **60fps UI rendering** on shop screen with 0-100 upgrade items via FlatList virtualization
- **<200ms navigation** between screens via instant observable state switching
- **<100ms purchase transaction** from tap to state update via synchronous observable mutations
- **Efficient list rendering** using FlatList with keyExtractor and React.memo on UpgradeItem

#### Accessibility
- **Minimum touch target**: 44x44pt for all buttons (WCAG 2.1 Level AA)
- **Color contrast**: 4.5:1 minimum ratio for all text (WCAG AA)
- **Screen reader support**:
  - Shop button: `accessibilityRole="button"`, `accessibilityLabel="Open Shop"`
  - Back button: `accessibilityRole="button"`, `accessibilityLabel="Back to Clicker"`
  - Upgrade items: `accessibilityRole="button"`, `accessibilityLabel="[Name] - [Cost] scrap"`
  - Scrap balance: `accessibilityRole="text"`, `accessibilityLabel="Scrap balance: [amount]"`
- **Focus management**: Returning to previous screen maintains scroll position

#### Platform Support
- **iOS**: iOS 13+ (Expo SDK 54 requirement)
- **Android**: Android 6.0+ (Expo SDK 54 requirement)
- **Web**: Modern browsers (Chrome, Safari, Firefox latest 2 versions)

#### Scalability
- **Support 100+ upgrades** without performance degradation via FlatList virtualization
- **Extensible upgrade types** beyond initial scrapPerPet/petsPerFeed via discriminated unions
- **Future-proof data model** for complex upgrade dependencies via optional fields

## 4. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           App.tsx                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              SafeAreaProvider                               │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │      Conditional Rendering (useNavigation)           │  │ │
│  │  │  ┌────────────────────┐   ┌────────────────────┐    │  │ │
│  │  │  │  ClickerScreen     │   │   ShopScreen       │    │  │ │
│  │  │  │  - Feed button     │   │   - Scrap display  │    │  │ │
│  │  │  │  - Pet counter     │   │   - Upgrade list   │    │  │ │
│  │  │  │  - Shop nav button │   │   - Back button    │    │  │ │
│  │  │  └────────────────────┘   └────────────────────┘    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    State Layer (Legend-State)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  useNavigation()                                          │  │
│  │  - currentScreen$: Observable<'clicker' | 'shop'>        │  │
│  │  - actions: { navigateToShop, navigateToClicker }        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  usePersistedCounter('scrap-balance')                    │  │
│  │  - scrap$: Observable<number>                            │  │
│  │  - actions: { increment, decrement, reset }              │  │
│  │  - Persistence: AsyncStorage (synced)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  usePersistedCounter('singularity-pet-count')            │  │
│  │  - count$: Observable<number>                            │  │
│  │  - actions: { increment }                                │  │
│  │  - Persistence: AsyncStorage (synced)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  useUpgrades()                                           │  │
│  │  - availableUpgrades$: Observable<Upgrade[]>             │  │
│  │  - purchasedUpgrades$: Observable<Set<string>>           │  │
│  │  - filteredUpgrades$: Computed<Upgrade[]>                │  │
│  │  - actions: { purchaseUpgrade }                          │  │
│  │  - Persistence: AsyncStorage (synced)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AsyncStorage Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Key: 'currentScreen' (not persisted - in-memory only)   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Key: 'scrap-balance'                                    │  │
│  │  Value: number (stringified)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Key: 'singularity-pet-count'                            │  │
│  │  Value: number (stringified)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Key: 'purchased-upgrades'                               │  │
│  │  Value: string[] (array of upgrade IDs, stringified)     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Design

#### App Component (Root)

**Purpose**: Application root with navigation logic

**Responsibilities**:
- Render SafeAreaProvider wrapper
- Conditionally render ClickerScreen or ShopScreen based on currentScreen$
- Maintain consistent wrapper structure across screens

**Interfaces**:
```typescript
export default function App(): JSX.Element

// Internal dependencies
const { currentScreen$ } = useNavigation()
```

**Dependencies**:
- `useNavigation` hook
- SafeAreaProvider from react-native-safe-area-context
- ClickerScreen and ShopScreen components

#### ClickerScreen Component (Updated)

**Purpose**: Main gameplay screen

**Responsibilities**:
- Render feed button and pet counter (existing)
- Render shop navigation button (NEW)
- Handle feed action to increment pets and scrap
- Display current scrap balance (NEW)

**Interfaces**:
```typescript
export function ClickerScreen(): JSX.Element

// Internal state from hooks
const { count$, actions: petActions } = usePersistedCounter('singularity-pet-count')
const { count$: scrap$, actions: scrapActions } = usePersistedCounter('scrap-balance')
const { actions: navActions } = useNavigation()
const { purchasedUpgrades$ } = useUpgrades()

// Computed upgrade effects
const scrapPerPet$ = computed(() => {
  const purchased = purchasedUpgrades$.get()
  // Calculate total scrap per pet boost from purchased upgrades
  return 1 + totalScrapPerPetBoost
})
```

**New Elements**:
- Shop navigation button (Pressable)
- Scrap balance display (Text with Memo)
- Updated feed action to grant scrap based on upgrade effects

**Dependencies** (Updated):
- `usePersistedCounter` hook (2 instances: pet count, scrap balance)
- `useNavigation` hook (NEW)
- `useUpgrades` hook (NEW - for computing upgrade effects)
- React Native components: View, Text, Pressable, StyleSheet
- Legend-State React primitives: Memo, computed
- react-native-safe-area-context: SafeAreaView

#### ShopScreen Component

**Purpose**: Shop interface for viewing and purchasing upgrades

**Responsibilities**:
- Render back navigation button
- Display current scrap balance
- Render UpgradeList component
- Handle navigation back to clicker

**Interfaces**:
```typescript
export function ShopScreen(): JSX.Element

// Internal state from hooks
const { count$: scrap$ } = usePersistedCounter('scrap-balance')
const { actions: navActions } = useNavigation()
const upgradesHook = useUpgrades()
```

**Dependencies**:
- `usePersistedCounter` hook (scrap balance)
- `useNavigation` hook
- `useUpgrades` hook
- UpgradeList component
- React Native components: View, Text, Pressable, StyleSheet
- Legend-State React primitives: Memo
- react-native-safe-area-context: SafeAreaView

#### UpgradeList Component

**Purpose**: Scrollable list of available upgrades

**Responsibilities**:
- Render FlatList of upgrades
- Handle empty state when no upgrades available
- Optimize rendering with virtualization
- Pass purchase action to UpgradeItem components

**Interfaces**:
```typescript
interface UpgradeListProps {
  upgrades$: Observable<Upgrade[]>
  purchasedUpgrades$: Observable<Set<string>>
  currentScrap$: Observable<number>
  onPurchase: (upgradeId: string) => void
}

export function UpgradeList({
  upgrades$,
  purchasedUpgrades$,
  currentScrap$,
  onPurchase
}: UpgradeListProps): JSX.Element
```

**Dependencies**:
- UpgradeItem component
- React Native components: FlatList, View, Text
- Legend-State React primitives: For, Show, Memo

#### UpgradeItem Component

**Purpose**: Individual upgrade card with purchase button

**Responsibilities**:
- Display upgrade name, description, cost
- Show affordable/unaffordable state
- Handle purchase button press
- Disable if already purchased or unaffordable

**Interfaces**:
```typescript
interface UpgradeItemProps {
  upgrade$: Observable<Upgrade>
  isPurchased$: Observable<boolean>
  isAffordable$: Observable<boolean>
  onPurchase: (upgradeId: string) => void
}

export const UpgradeItem = React.memo(function UpgradeItem({
  upgrade$,
  isPurchased$,
  isAffordable$,
  onPurchase
}: UpgradeItemProps): JSX.Element
```

**Dependencies**:
- React Native components: View, Text, Pressable, StyleSheet
- Legend-State React primitives: Memo

#### useUpgrades Hook

**Purpose**: Manage upgrade state and purchase behavior

**Responsibilities**:
- Provide observable for available upgrades (initially empty array)
- Track purchased upgrades in persistent Set
- Expose purchase action with validation
- Compute filtered upgrades (hide purchased)
- Handle scrap deduction on purchase

**Interfaces**:
```typescript
interface UseUpgradesReturn {
  availableUpgrades$: Observable<Upgrade[]>
  purchasedUpgrades$: Observable<Set<string>>
  filteredUpgrades$: Observable<Upgrade[]>  // Computed: available - purchased
  actions: {
    purchaseUpgrade: (upgradeId: string, cost: number) => boolean
    addUpgrade: (upgrade: Upgrade) => void  // For future upgrade additions
    reset: () => void
  }
}

export function useUpgrades(): UseUpgradesReturn
```

**Dependencies**:
- `@legendapp/state`: observable, computed
- `@legendapp/state/sync`: synced
- `@legendapp/state/persist-plugins/async-storage`: ObservablePersistAsyncStorage
- `@react-native-async-storage/async-storage`: AsyncStorage
- `usePersistedCounter('scrap-balance')` for scrap deduction

### Data Flow

#### Navigation Flow (Screen Switching)

```
User taps shop button on clicker screen
        ↓
ClickerScreen Pressable onPress event
        ↓
navActions.navigateToShop() called
        ↓
currentScreen$.set('shop')
        ↓
App component Memo re-renders
        ↓
Conditional render switches to ShopScreen (<10ms)
        ↓
User sees shop screen within 200ms
```

#### Purchase Flow

```
User taps upgrade item in shop
        ↓
UpgradeItem Pressable onPress event
        ↓
onPurchase(upgradeId) called
        ↓
actions.purchaseUpgrade(upgradeId, cost)
        ↓
┌────────────────────────────────────┐
│  Validation: scrap$.get() >= cost  │
│  - If false: return false + alert  │
│  - If true: proceed                │
└────────────────────────────────────┘
        ↓
scrap$.set(scrap$.get() - cost)
        ↓
purchasedUpgrades$.add(upgradeId)
        ↓
┌───────────────────────────────────────┐
│  Observable Updates Trigger:          │
│  1. Scrap display updates in shop     │
│  2. UpgradeItem disabled/hidden       │
│  3. Filtered upgrades list updates    │
│  4. AsyncStorage saves both changes   │
└───────────────────────────────────────┘
        ↓
User sees updated state within 100ms
```

#### Upgrade Effect Application (Clicker Screen)

```
User taps feed button
        ↓
ClickerScreen feed handler
        ↓
Compute scrapPerPet from purchased upgrades
┌────────────────────────────────────────┐
│  const purchased = purchasedUpgrades$  │
│    .get()                               │
│  const upgrades = availableUpgrades$   │
│    .get()                               │
│  const scrapBoosts = upgrades           │
│    .filter(u => purchased.has(u.id) &&  │
│      u.effectType === 'scrapPerPet')    │
│    .map(u => u.effectValue)             │
│  const totalBoost = scrapBoosts         │
│    .reduce((sum, v) => sum + v, 0)      │
│  const scrapPerPet = 1 + totalBoost     │
└────────────────────────────────────────┘
        ↓
Increment pet count: petCount$.set(petCount$.get() + 1)
        ↓
Increment scrap: scrap$.set(scrap$.get() + scrapPerPet)
        ↓
User sees updated counters
```

## 5. API Design

### Internal APIs

No external HTTP APIs required for MVP. All state is local.

### Hook APIs

#### useNavigation (Existing)

```typescript
/**
 * Hook for managing simple state-based navigation between screens.
 * Uses Legend-State observable for reactive screen switching.
 *
 * @returns Navigation state and actions
 */
export function useNavigation(): UseNavigationReturn {
  const actions = useMemo(
    () => ({
      navigateToShop: () => {
        currentScreen$.set('shop');
      },
      navigateToClicker: () => {
        currentScreen$.set('clicker');
      },
      reset: () => {
        currentScreen$.set('clicker');
      },
    }),
    []
  );

  return useMemo(
    () => ({
      currentScreen$,
      actions,
    }),
    [actions]
  );
}
```

**Return Type**:
```typescript
interface UseNavigationReturn {
  currentScreen$: Observable<'clicker' | 'shop'>;
  actions: {
    navigateToShop: () => void;
    navigateToClicker: () => void;
    reset: () => void;
  };
}
```

#### usePersistedCounter (Existing - Reused for Scrap)

```typescript
/**
 * Custom hook providing persistent counter behavior using Legend-State.
 *
 * Behavior: Incremental counting with automatic AsyncStorage persistence
 *
 * @param storageKey - Unique key for AsyncStorage persistence
 * @returns Observable counter and increment/decrement actions
 */
export function usePersistedCounter(storageKey: string): UsePersistedCounterReturn
```

**Return Type**:
```typescript
interface UsePersistedCounterReturn {
  count$: Observable<number>;
  actions: {
    increment: () => void;
    decrement: () => void;  // NEW - needed for scrap spending
    reset: () => void;
  };
}
```

**NOTE**: Need to UPDATE usePersistedCounter to add `decrement` action:
```typescript
decrement: () => {
  const current = count$.get();
  if (current > 0) {
    count$.set(current - 1);
  }
}
```

#### useUpgrades (New)

```typescript
/**
 * Custom hook providing upgrade management behavior using Legend-State.
 *
 * Behavior: Collection management + purchase validation + persistence
 *
 * @returns Observable upgrade collection and purchase actions
 *
 * @example
 * const { availableUpgrades$, purchasedUpgrades$, actions } = useUpgrades();
 * const { count$: scrap$ } = usePersistedCounter('scrap-balance');
 *
 * // In component:
 * <UpgradeList
 *   upgrades$={availableUpgrades$}
 *   purchasedUpgrades$={purchasedUpgrades$}
 *   currentScrap$={scrap$}
 *   onPurchase={actions.purchaseUpgrade}
 * />
 */
export function useUpgrades(): UseUpgradesReturn {
  // Get scrap balance for validation
  const { count$: scrap$, actions: scrapActions } = usePersistedCounter('scrap-balance');

  return useMemo(() => {
    // Available upgrades (initially empty, can be populated later)
    const availableUpgrades$ = observable<Upgrade[]>([]);

    // Purchased upgrades (persisted as Set of IDs)
    const purchasedUpgrades$ = observable(
      synced({
        initial: new Set<string>(),
        persist: {
          name: 'purchased-upgrades',
          plugin: new ObservablePersistAsyncStorage({ AsyncStorage }),
        },
      })
    );

    // Computed: upgrades not yet purchased
    const filteredUpgrades$ = computed(() => {
      const available = availableUpgrades$.get();
      const purchased = purchasedUpgrades$.get();
      return available.filter(upgrade => !purchased.has(upgrade.id));
    });

    const actions = {
      purchaseUpgrade: (upgradeId: string, cost: number): boolean => {
        const currentScrap = scrap$.get();

        // Validate sufficient scrap
        if (currentScrap < cost) {
          // Alert user (or return false for UI to handle)
          return false;
        }

        // Deduct scrap
        scrap$.set(currentScrap - cost);

        // Mark as purchased
        const purchased = purchasedUpgrades$.get();
        purchased.add(upgradeId);
        purchasedUpgrades$.set(new Set(purchased)); // Trigger update

        return true;
      },

      addUpgrade: (upgrade: Upgrade) => {
        const current = availableUpgrades$.get();
        availableUpgrades$.set([...current, upgrade]);
      },

      reset: () => {
        purchasedUpgrades$.set(new Set());
      }
    };

    return { availableUpgrades$, purchasedUpgrades$, filteredUpgrades$, actions };
  }, [scrap$, scrapActions]);
}
```

**Return Type**:
```typescript
interface UseUpgradesReturn {
  availableUpgrades$: Observable<Upgrade[]>;
  purchasedUpgrades$: Observable<Set<string>>;
  filteredUpgrades$: Observable<Upgrade[]>;
  actions: {
    purchaseUpgrade: (upgradeId: string, cost: number) => boolean;
    addUpgrade: (upgrade: Upgrade) => void;
    reset: () => void;
  };
}
```

## 6. Data Model

### State Schema

#### Navigation State (In-Memory, Not Persisted)
```typescript
currentScreen$: Observable<'clicker' | 'shop'>
// Default: 'clicker'
```

#### Scrap Balance (Persisted)
```typescript
scrap$: Observable<number>
// AsyncStorage key: 'scrap-balance'
// Default: 0
// Range: 0 to Number.MAX_SAFE_INTEGER
```

#### Pet Count (Persisted, Existing)
```typescript
petCount$: Observable<number>
// AsyncStorage key: 'singularity-pet-count'
// Default: 0
```

#### Purchased Upgrades (Persisted)
```typescript
purchasedUpgrades$: Observable<Set<string>>
// AsyncStorage key: 'purchased-upgrades'
// Value stored as: string[] (array of upgrade IDs)
// Default: new Set()
```

#### Available Upgrades (In-Memory)
```typescript
availableUpgrades$: Observable<Upgrade[]>
// Default: []
// Note: Initially empty, populated in future iterations
```

### TypeScript Types

```typescript
// /frontend/modules/shop/types/upgrade.ts

/**
 * Upgrade data model
 */
export interface Upgrade {
  id: string;                          // Unique identifier (UUID or timestamp-based)
  name: string;                        // Display name
  description: string;                 // User-facing description
  cost: number;                        // Scrap cost (positive integer)
  effectType: 'scrapPerPet' | 'petsPerFeed';  // What it boosts
  effectValue: number;                 // Boost amount (additive)

  // Future expansion fields (optional):
  iconName?: string;                   // Icon identifier for future UI
  prerequisiteIds?: string[];          // Upgrade dependencies for future unlock chains
  maxPurchases?: number;               // For repeatable upgrades in future
  tier?: number;                       // For tiered upgrade systems in future
}

/**
 * Upgrade effect types
 */
export type UpgradeEffectType = 'scrapPerPet' | 'petsPerFeed';

/**
 * Type guard for upgrade effect types
 */
export function isValidEffectType(type: string): type is UpgradeEffectType {
  return type === 'scrapPerPet' || type === 'petsPerFeed';
}
```

### Data Validation

#### Upgrade Data
- **id**: Non-empty string, unique within upgrade collection
- **name**: Non-empty string, max 50 characters (UI constraint)
- **description**: Non-empty string, max 200 characters (UI constraint)
- **cost**: Positive integer, range 1 to 1,000,000 (reasonable maximum)
- **effectType**: Must be 'scrapPerPet' or 'petsPerFeed' (discriminated union)
- **effectValue**: Positive number, range 0.1 to 100 (reasonable boost range)

#### Persistence Data
- **Scrap Balance**: Number, serialized as string via JSON.stringify
- **Purchased Upgrades**: Set<string>, serialized as string[] via JSON.stringify
- **Pet Count**: Number, serialized as string via JSON.stringify

### Data Access Patterns

#### Read Pattern (Shop Screen)
```typescript
// Observe scrap balance
<Memo>{() => <Text>Scrap: {scrap$.get()}</Text>}</Memo>

// Observe filtered upgrades
<For each={filteredUpgrades$}>
  {(upgrade$) => <UpgradeItem upgrade$={upgrade$} />}
</For>
```

#### Write Pattern (Purchase)
```typescript
// Purchase action updates multiple observables atomically
actions.purchaseUpgrade(upgradeId, cost) → {
  scrap$.set(scrap$.get() - cost)
  purchasedUpgrades$.add(upgradeId)
}
```

#### Computed Pattern (Upgrade Effects)
```typescript
// Clicker screen computes total boost from purchased upgrades
const scrapPerPet$ = computed(() => {
  const purchased = purchasedUpgrades$.get();
  const upgrades = availableUpgrades$.get();

  const scrapBoosts = upgrades
    .filter(u => purchased.has(u.id) && u.effectType === 'scrapPerPet')
    .map(u => u.effectValue);

  const totalBoost = scrapBoosts.reduce((sum, v) => sum + v, 0);
  return 1 + totalBoost; // Base 1 scrap per pet + boosts
});
```

## 7. Security Design

### Authentication & Authorization
Not applicable for MVP (local-only state, no user accounts).

### Data Security

**Local Data Protection**:
- AsyncStorage data is sandboxed per-app (iOS Keychain, Android SharedPreferences)
- Upgrade data is non-sensitive (gameplay data, not PII)
- No encryption required for MVP

**Input Validation**:
- Purchase action validates scrap balance before deducting
- Upgrade IDs validated against available upgrades list
- No user-provided strings in upgrade data (pre-defined upgrades only)

### Security Controls

**Rate Limiting**: None required (local-only operations)

**Access Control**:
- Hooks enforce single source of truth (no direct observable mutation)
- Actions are the only way to modify state
- Purchase action prevents negative scrap balance

**Data Integrity**:
- TypeScript ensures type safety for upgrade data
- Observable updates are atomic (no partial state)
- AsyncStorage persistence handles failures gracefully (data remains in memory)

## 8. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools
- **Framework**: React Native Testing Library
- **Reference**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Test Runner**: Jest with jest-expo preset
- **Mocking**: Jest mocks for AsyncStorage

#### TDD Implementation Process

For each feature/component, follow this strict order:

1. **RED Phase - Write Failing Test First**
   ```typescript
   // Example: Test for shop navigation
   test('navigates to shop when shop button pressed', async () => {
     render(<App />);
     const shopButton = screen.getByRole('button', { name: /shop/i });
     await user.press(shopButton);

     await waitFor(() => {
       expect(screen.getByText(/scrap:/i)).toBeTruthy();
     });
   });
   // This test MUST fail initially (shop button doesn't exist yet)
   ```

2. **GREEN Phase - Minimal Implementation**
   - Write ONLY enough code to pass the test
   - No extra features or optimizations
   - Focus on making test green

3. **REFACTOR Phase - Improve Code**
   - Clean up implementation
   - Extract components/functions
   - Maintain all green tests

### App-Level Integration Testing (TDD Zero Layer - MANDATORY FIRST)

**CRITICAL**: Before implementing shop features, write integration tests at the App.tsx level that validate the complete navigation journey including component imports.

#### Why App-Level Tests First?
- Catches missing imports/modules immediately (prevents "Unable to resolve" errors)
- Validates multi-screen navigation works end-to-end
- Ensures both screens are accessible to users
- Tests fail until ShopScreen component exists (prevents orphaned features)

#### Required App-Level Integration Tests

```typescript
// App.test.tsx - UPDATE with navigation tests

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { userEvent } from '@testing-library/react-native';
import App from './App';

describe('App Multi-Screen Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without import errors', () => {
    // This test FAILS if ShopScreen module doesn't exist or has import errors
    expect(() => render(<App />)).not.toThrow();
  });

  test('displays clicker screen by default', () => {
    render(<App />);

    // Verify clicker screen elements
    expect(screen.getByRole('button', { name: /feed/i })).toBeTruthy();
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('displays shop navigation button on clicker screen', () => {
    render(<App />);

    // This test FAILS if shop button doesn't exist
    const shopButton = screen.getByRole('button', { name: /shop/i });
    expect(shopButton).toBeTruthy();
  });

  test('navigates to shop screen when shop button pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      // Verify shop screen elements appear
      expect(screen.getByText(/scrap:/i)).toBeTruthy();
      expect(screen.queryByRole('button', { name: /feed/i })).toBeNull();
    });
  });

  test('navigates back to clicker when back button pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      expect(screen.getByText(/scrap:/i)).toBeTruthy();
    });

    // Navigate back to clicker
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.press(backButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /feed/i })).toBeTruthy();
      expect(screen.queryByText(/scrap:/i)).toBeNull(); // Scrap display only in shop
    });
  });

  test('preserves scrap balance across screen navigation', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Feed to generate scrap (assuming 1 scrap per feed)
    const feedButton = screen.getByRole('button', { name: /feed/i });
    await user.press(feedButton);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      // Scrap balance should reflect feeding action
      expect(screen.getByText(/scrap: 1/i)).toBeTruthy();
    });

    // Navigate back
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.press(backButton);

    // Navigate to shop again
    await user.press(screen.getByRole('button', { name: /shop/i }));

    await waitFor(() => {
      // Scrap balance should still be 1
      expect(screen.getByText(/scrap: 1/i)).toBeTruthy();
    });
  });
});
```

### Unit Testing (TDD First Layer)

#### ShopScreen Component Tests

```typescript
// ShopScreen.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { userEvent } from '@testing-library/react-native';
import { ShopScreen } from './ShopScreen';

// Mock hooks
jest.mock('../attack-button/hooks/usePersistedCounter');
jest.mock('../../shared/hooks/useNavigation');
jest.mock('./hooks/useUpgrades');

describe('ShopScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    require('../attack-button/hooks/usePersistedCounter').usePersistedCounter.mockReturnValue({
      count$: { get: () => 100 },
      actions: { increment: jest.fn(), decrement: jest.fn(), reset: jest.fn() }
    });

    require('../../shared/hooks/useNavigation').useNavigation.mockReturnValue({
      currentScreen$: { get: () => 'shop' },
      actions: { navigateToClicker: jest.fn(), navigateToShop: jest.fn(), reset: jest.fn() }
    });

    require('./hooks/useUpgrades').useUpgrades.mockReturnValue({
      availableUpgrades$: { get: () => [] },
      purchasedUpgrades$: { get: () => new Set() },
      filteredUpgrades$: { get: () => [] },
      actions: { purchaseUpgrade: jest.fn(), addUpgrade: jest.fn(), reset: jest.fn() }
    });
  });

  test('renders back button with correct accessibility attributes', () => {
    render(<ShopScreen />);

    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeTruthy();
    expect(backButton.props.accessibilityLabel).toMatch(/back/i);
  });

  test('displays current scrap balance', () => {
    render(<ShopScreen />);

    expect(screen.getByText(/scrap: 100/i)).toBeTruthy();
  });

  test('navigates back to clicker when back button pressed', async () => {
    const user = userEvent.setup();
    const mockNavigateToClicker = jest.fn();

    require('../../shared/hooks/useNavigation').useNavigation.mockReturnValue({
      currentScreen$: { get: () => 'shop' },
      actions: { navigateToClicker: mockNavigateToClicker, navigateToShop: jest.fn(), reset: jest.fn() }
    });

    render(<ShopScreen />);

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.press(backButton);

    expect(mockNavigateToClicker).toHaveBeenCalledTimes(1);
  });

  test('renders upgrade list component', () => {
    render(<ShopScreen />);

    // Verify UpgradeList is rendered (check for empty state or list container)
    expect(screen.getByTestId('upgrade-list')).toBeTruthy();
  });

  test('back button meets accessibility touch target size', () => {
    render(<ShopScreen />);

    const backButton = screen.getByTestId('back-button');
    const style = Array.isArray(backButton.props.style)
      ? Object.assign({}, ...backButton.props.style)
      : backButton.props.style;

    expect(style.minWidth).toBeGreaterThanOrEqual(44);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });
});
```

#### UpgradeList Component Tests

```typescript
// components/UpgradeList.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { observable } from '@legendapp/state';
import { UpgradeList } from './UpgradeList';
import type { Upgrade } from '../types/upgrade';

describe('UpgradeList Component', () => {
  const mockUpgrades: Upgrade[] = [
    {
      id: 'upgrade-1',
      name: 'Scrap Magnet',
      description: 'Gain +1 scrap per pet',
      cost: 10,
      effectType: 'scrapPerPet',
      effectValue: 1
    },
    {
      id: 'upgrade-2',
      name: 'Mega Feed',
      description: 'Gain +1 pet per feed',
      cost: 25,
      effectType: 'petsPerFeed',
      effectValue: 1
    }
  ];

  test('displays empty state when no upgrades available', () => {
    const upgrades$ = observable<Upgrade[]>([]);
    const purchasedUpgrades$ = observable(new Set<string>());
    const currentScrap$ = observable(100);

    render(
      <UpgradeList
        upgrades$={upgrades$}
        purchasedUpgrades$={purchasedUpgrades$}
        currentScrap$={currentScrap$}
        onPurchase={jest.fn()}
      />
    );

    expect(screen.getByText(/no upgrades available/i)).toBeTruthy();
  });

  test('renders upgrade items when upgrades available', () => {
    const upgrades$ = observable<Upgrade[]>(mockUpgrades);
    const purchasedUpgrades$ = observable(new Set<string>());
    const currentScrap$ = observable(100);

    render(
      <UpgradeList
        upgrades$={upgrades$}
        purchasedUpgrades$={purchasedUpgrades$}
        currentScrap$={currentScrap$}
        onPurchase={jest.fn()}
      />
    );

    expect(screen.getByText('Scrap Magnet')).toBeTruthy();
    expect(screen.getByText('Mega Feed')).toBeTruthy();
  });

  test('filters out purchased upgrades', () => {
    const upgrades$ = observable<Upgrade[]>(mockUpgrades);
    const purchasedUpgrades$ = observable(new Set(['upgrade-1']));
    const currentScrap$ = observable(100);

    render(
      <UpgradeList
        upgrades$={upgrades$}
        purchasedUpgrades$={purchasedUpgrades$}
        currentScrap$={currentScrap$}
        onPurchase={jest.fn()}
      />
    );

    expect(screen.queryByText('Scrap Magnet')).toBeNull();
    expect(screen.getByText('Mega Feed')).toBeTruthy();
  });
});
```

#### UpgradeItem Component Tests

```typescript
// components/UpgradeItem.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { userEvent } from '@testing-library/react-native';
import { observable } from '@legendapp/state';
import { UpgradeItem } from './UpgradeItem';
import type { Upgrade } from '../types/upgrade';

describe('UpgradeItem Component', () => {
  const mockUpgrade: Upgrade = {
    id: 'upgrade-1',
    name: 'Scrap Magnet',
    description: 'Gain +1 scrap per pet',
    cost: 10,
    effectType: 'scrapPerPet',
    effectValue: 1
  };

  test('renders upgrade name, description, and cost', () => {
    const upgrade$ = observable(mockUpgrade);
    const isPurchased$ = observable(false);
    const isAffordable$ = observable(true);

    render(
      <UpgradeItem
        upgrade$={upgrade$}
        isPurchased$={isPurchased$}
        isAffordable$={isAffordable$}
        onPurchase={jest.fn()}
      />
    );

    expect(screen.getByText('Scrap Magnet')).toBeTruthy();
    expect(screen.getByText(/Gain \+1 scrap per pet/i)).toBeTruthy();
    expect(screen.getByText(/10 scrap/i)).toBeTruthy();
  });

  test('calls onPurchase when purchase button pressed', async () => {
    const user = userEvent.setup();
    const mockOnPurchase = jest.fn();
    const upgrade$ = observable(mockUpgrade);
    const isPurchased$ = observable(false);
    const isAffordable$ = observable(true);

    render(
      <UpgradeItem
        upgrade$={upgrade$}
        isPurchased$={isPurchased$}
        isAffordable$={isAffordable$}
        onPurchase={mockOnPurchase}
      />
    );

    const purchaseButton = screen.getByRole('button', { name: /purchase/i });
    await user.press(purchaseButton);

    expect(mockOnPurchase).toHaveBeenCalledWith('upgrade-1');
  });

  test('disables purchase button when already purchased', () => {
    const upgrade$ = observable(mockUpgrade);
    const isPurchased$ = observable(true);
    const isAffordable$ = observable(true);

    render(
      <UpgradeItem
        upgrade$={upgrade$}
        isPurchased$={isPurchased$}
        isAffordable$={isAffordable$}
        onPurchase={jest.fn()}
      />
    );

    const purchaseButton = screen.getByRole('button', { name: /owned/i });
    expect(purchaseButton.props.disabled).toBe(true);
  });

  test('disables purchase button when unaffordable', () => {
    const upgrade$ = observable(mockUpgrade);
    const isPurchased$ = observable(false);
    const isAffordable$ = observable(false);

    render(
      <UpgradeItem
        upgrade$={upgrade$}
        isPurchased$={isPurchased$}
        isAffordable$={isAffordable$}
        onPurchase={jest.fn()}
      />
    );

    const purchaseButton = screen.getByRole('button', { name: /purchase/i });
    expect(purchaseButton.props.disabled).toBe(true);
  });

  test('shows visual indication for unaffordable upgrades', () => {
    const upgrade$ = observable(mockUpgrade);
    const isPurchased$ = observable(false);
    const isAffordable$ = observable(false);

    render(
      <UpgradeItem
        upgrade$={upgrade$}
        isPurchased$={isPurchased$}
        isAffordable$={isAffordable$}
        onPurchase={jest.fn()}
      />
    );

    const container = screen.getByTestId('upgrade-item');
    const style = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style)
      : container.props.style;

    // Expect reduced opacity or gray color
    expect(style.opacity).toBeLessThan(1);
  });
});
```

#### useUpgrades Hook Tests

```typescript
// hooks/useUpgrades.test.tsx

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUpgrades } from './useUpgrades';
import type { Upgrade } from '../types/upgrade';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock usePersistedCounter for scrap balance
jest.mock('../../attack-button/hooks/usePersistedCounter');

describe('useUpgrades Hook', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();

    // Default mock: 100 scrap available
    require('../../attack-button/hooks/usePersistedCounter').usePersistedCounter.mockReturnValue({
      count$: {
        get: () => 100,
        set: jest.fn()
      },
      actions: {
        increment: jest.fn(),
        decrement: jest.fn(),
        reset: jest.fn()
      }
    });
  });

  test('initializes with empty upgrades list', async () => {
    const { result } = renderHook(() => useUpgrades());

    await waitFor(() => {
      expect(result.current.availableUpgrades$.get()).toEqual([]);
      expect(result.current.purchasedUpgrades$.get().size).toBe(0);
    });
  });

  test('adds upgrade to available list', async () => {
    const { result } = renderHook(() => useUpgrades());

    const mockUpgrade: Upgrade = {
      id: 'upgrade-1',
      name: 'Test Upgrade',
      description: 'Test description',
      cost: 10,
      effectType: 'scrapPerPet',
      effectValue: 1
    };

    act(() => {
      result.current.actions.addUpgrade(mockUpgrade);
    });

    await waitFor(() => {
      expect(result.current.availableUpgrades$.get()).toHaveLength(1);
      expect(result.current.availableUpgrades$.get()[0].id).toBe('upgrade-1');
    });
  });

  test('purchases upgrade when sufficient scrap available', async () => {
    const { result } = renderHook(() => useUpgrades());

    const mockUpgrade: Upgrade = {
      id: 'upgrade-1',
      name: 'Test Upgrade',
      description: 'Test description',
      cost: 10,
      effectType: 'scrapPerPet',
      effectValue: 1
    };

    act(() => {
      result.current.actions.addUpgrade(mockUpgrade);
    });

    let purchaseSuccess = false;
    act(() => {
      purchaseSuccess = result.current.actions.purchaseUpgrade('upgrade-1', 10);
    });

    expect(purchaseSuccess).toBe(true);

    await waitFor(() => {
      expect(result.current.purchasedUpgrades$.get().has('upgrade-1')).toBe(true);
    });
  });

  test('rejects purchase when insufficient scrap', async () => {
    // Mock low scrap balance
    require('../../attack-button/hooks/usePersistedCounter').usePersistedCounter.mockReturnValue({
      count$: {
        get: () => 5,  // Only 5 scrap
        set: jest.fn()
      },
      actions: {
        increment: jest.fn(),
        decrement: jest.fn(),
        reset: jest.fn()
      }
    });

    const { result } = renderHook(() => useUpgrades());

    let purchaseSuccess = true;
    act(() => {
      purchaseSuccess = result.current.actions.purchaseUpgrade('upgrade-1', 10);
    });

    expect(purchaseSuccess).toBe(false);

    await waitFor(() => {
      expect(result.current.purchasedUpgrades$.get().has('upgrade-1')).toBe(false);
    });
  });

  test('deducts scrap cost on successful purchase', async () => {
    const mockSetScrap = jest.fn();
    require('../../attack-button/hooks/usePersistedCounter').usePersistedCounter.mockReturnValue({
      count$: {
        get: () => 100,
        set: mockSetScrap
      },
      actions: {
        increment: jest.fn(),
        decrement: jest.fn(),
        reset: jest.fn()
      }
    });

    const { result } = renderHook(() => useUpgrades());

    act(() => {
      result.current.actions.purchaseUpgrade('upgrade-1', 10);
    });

    expect(mockSetScrap).toHaveBeenCalledWith(90);
  });

  test('filters purchased upgrades from available list', async () => {
    const { result } = renderHook(() => useUpgrades());

    const mockUpgrades: Upgrade[] = [
      {
        id: 'upgrade-1',
        name: 'Upgrade 1',
        description: 'Test 1',
        cost: 10,
        effectType: 'scrapPerPet',
        effectValue: 1
      },
      {
        id: 'upgrade-2',
        name: 'Upgrade 2',
        description: 'Test 2',
        cost: 20,
        effectType: 'petsPerFeed',
        effectValue: 1
      }
    ];

    act(() => {
      mockUpgrades.forEach(u => result.current.actions.addUpgrade(u));
    });

    await waitFor(() => {
      expect(result.current.filteredUpgrades$.get()).toHaveLength(2);
    });

    act(() => {
      result.current.actions.purchaseUpgrade('upgrade-1', 10);
    });

    await waitFor(() => {
      const filtered = result.current.filteredUpgrades$.get();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('upgrade-2');
    });
  });

  test('persists purchased upgrades to AsyncStorage', async () => {
    const { result } = renderHook(() => useUpgrades());

    act(() => {
      result.current.actions.purchaseUpgrade('upgrade-1', 10);
    });

    await waitFor(() => {
      expect(result.current.purchasedUpgrades$.get().has('upgrade-1')).toBe(true);
    });

    // Verify AsyncStorage was called (synced handles persistence)
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'purchased-upgrades',
        expect.any(String)
      );
    }, { timeout: 2000 });
  });

  test('loads persisted purchased upgrades on mount', async () => {
    // Pre-populate AsyncStorage
    await AsyncStorage.setItem('purchased-upgrades', JSON.stringify(['upgrade-1', 'upgrade-2']));

    const { result } = renderHook(() => useUpgrades());

    await waitFor(() => {
      const purchased = result.current.purchasedUpgrades$.get();
      expect(purchased.has('upgrade-1')).toBe(true);
      expect(purchased.has('upgrade-2')).toBe(true);
    }, { timeout: 2000 });
  });

  test('reset action clears purchased upgrades', async () => {
    const { result } = renderHook(() => useUpgrades());

    act(() => {
      result.current.actions.purchaseUpgrade('upgrade-1', 10);
      result.current.actions.purchaseUpgrade('upgrade-2', 20);
    });

    await waitFor(() => {
      expect(result.current.purchasedUpgrades$.get().size).toBe(2);
    });

    act(() => {
      result.current.actions.reset();
    });

    await waitFor(() => {
      expect(result.current.purchasedUpgrades$.get().size).toBe(0);
    });
  });
});
```

### Component Integration Testing (TDD Second Layer)

```typescript
// Integration test verifying navigation and purchase flow

describe('Shop Integration Tests', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('purchase flow updates state across screens', async () => {
    const user = userEvent.setup();

    // Start with some scrap balance
    await AsyncStorage.setItem('scrap-balance', JSON.stringify(100));

    render(<App />);

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      expect(screen.getByText(/scrap: 100/i)).toBeTruthy();
    });

    // Purchase an upgrade (assuming one exists)
    const upgradeItem = screen.getByText(/scrap magnet/i);
    const purchaseButton = screen.getByRole('button', { name: /purchase/i });
    await user.press(purchaseButton);

    await waitFor(() => {
      // Scrap balance should be reduced
      expect(screen.getByText(/scrap: 90/i)).toBeTruthy();
      // Upgrade should be removed from list
      expect(screen.queryByText(/scrap magnet/i)).toBeNull();
    });

    // Navigate back to clicker
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.press(backButton);

    // Feed action should now grant boosted scrap
    const feedButton = screen.getByRole('button', { name: /feed/i });
    await user.press(feedButton);

    await waitFor(() => {
      // Pet count increased by 1
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });

    // Navigate back to shop to verify scrap increased by boosted amount
    await user.press(screen.getByRole('button', { name: /shop/i }));

    await waitFor(() => {
      // Scrap should be 90 + 2 (base 1 + upgrade boost 1) = 92
      expect(screen.getByText(/scrap: 92/i)).toBeTruthy();
    });
  });

  test('persists shop state across app remounts', async () => {
    const user = userEvent.setup();

    // Pre-populate state
    await AsyncStorage.setItem('scrap-balance', JSON.stringify(50));
    await AsyncStorage.setItem('purchased-upgrades', JSON.stringify(['upgrade-1']));

    const { unmount } = render(<App />);

    // Navigate to shop
    await user.press(screen.getByRole('button', { name: /shop/i }));

    await waitFor(() => {
      expect(screen.getByText(/scrap: 50/i)).toBeTruthy();
    });

    // Unmount app
    unmount();

    // Remount app
    render(<App />);

    // Navigate to shop again
    await user.press(screen.getByRole('button', { name: /shop/i }));

    await waitFor(() => {
      // Scrap balance should persist
      expect(screen.getByText(/scrap: 50/i)).toBeTruthy();
      // Purchased upgrade should not appear in list
      expect(screen.queryByTestId('upgrade-upgrade-1')).toBeNull();
    });
  });
});
```

### TDD Checklist for Each Component

- [ ] App integration tests written first (validates navigation)
- [ ] ShopScreen component tests written before implementation
- [ ] UpgradeList component tests written before implementation
- [ ] UpgradeItem component tests written before implementation
- [ ] useUpgrades hook tests written before implementation
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns
- [ ] No testIds unless necessary for style verification
- [ ] Tests query by user-visible content (getByRole, getByText)
- [ ] Async operations use waitFor/findBy
- [ ] All tests pass before next feature
- [ ] Legend-State async updates handled with waitFor

## 9. Infrastructure & Deployment

### Infrastructure Requirements

No server infrastructure required for MVP (client-side only).

| Component | Specification | Justification          |
| --------- | ------------- | ---------------------- |
| Client    | iOS/Android/Web device | React Native app runtime |
| Storage   | Device local storage (200KB) | AsyncStorage for scrap, pets, purchased upgrades |

### Deployment Architecture

**Environment**: Expo managed workflow
- **Dev**: `npx expo start` (local development server)
- **Preview**: Expo Go app (OTA updates)
- **Production**: EAS Build (native binaries for App Store/Play Store)

**Build Commands**:
```bash
# Development
npx expo start

# Run tests (Windows - per CLAUDE.md instructions)
cmd.exe /c "npm test"

# Build for production
eas build --platform all
```

### Monitoring & Observability

#### Metrics

**Application Metrics**:
- Shop access rate (tracked via navigation action calls)
- Purchase success/failure rate (tracked via purchaseUpgrade return value)
- Average scrap balance (observable value sampling)

**Performance Metrics**:
- Navigation transition time (React Native DevTools)
- FlatList scroll performance (60fps monitoring)
- Observable update latency (console.time/timeEnd in development)

#### Logging

**Development**:
```typescript
// Optional debug logging in useUpgrades
if (__DEV__) {
  console.log('Purchase attempted:', upgradeId, cost);
  console.log('Current scrap:', scrap$.get());
}
```

**Production**: No logging required for MVP (local-only state)

#### Alerting

Not applicable for MVP (no server-side monitoring).

## 10. Scalability & Performance

### Performance Requirements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Navigation time | <200ms (screen switch) | Performance.now() timing in tests |
| Purchase time | <100ms (tap to state update) | Observable update timing |
| List rendering | 60fps with 100 upgrades | FlatList performance monitoring |
| Memory usage | <50MB increase for shop | React Native DevTools profiler |

### Scalability Strategy

**Horizontal Scaling**: Not applicable (client-side app)

**Vertical Scaling (Upgrade Count)**:
- **Current**: Array-based upgrade storage, full list rendering
- **0-20 upgrades**: ScrollView with map (simple, performant)
- **20-100 upgrades**: FlatList with virtualization (MVP approach)
- **100+ upgrades**: FlatList + pagination or categorization (future)

**State Scaling**:
- Current: Single observable for upgrades, Set for purchased
- Future: Can split by category/tier if needed
- Legend-State scales well with fine-grained observables

### Performance Optimization

**List Rendering Optimization**:
```typescript
// FlatList configuration for optimal performance
<FlatList
  data={upgrades}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <UpgradeItem upgrade={item} />}
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={5}
  removeClippedSubviews={true}
/>

// UpgradeItem memoization
export const UpgradeItem = React.memo(function UpgradeItem(props) {
  // Component implementation
});
```

**Observable Optimization**:
```typescript
// Computed values cache results
const filteredUpgrades$ = computed(() => {
  const available = availableUpgrades$.get();
  const purchased = purchasedUpgrades$.get();
  return available.filter(u => !purchased.has(u.id));
});

// Only re-computes when dependencies change
```

**AsyncStorage Optimization**:
- Writes are async and non-blocking
- Legend-State batches rapid updates automatically
- Purchased upgrades stored as Set → array conversion minimizes serialization cost

## 11. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Navigation state synchronization issues | High | Low | Use single source of truth (currentScreen$ observable), test navigation flow thoroughly | Engineering |
| Scrap balance race conditions during purchase | High | Medium | Use synchronous observable updates, validate before deducting | Engineering |
| FlatList performance with large upgrade lists | Medium | Medium | Implement virtualization from start, test with 100 mock upgrades | Engineering |
| Purchased upgrades Set serialization issues | Medium | Low | Test AsyncStorage persistence with Set<string>, verify array conversion | Engineering |
| Upgrade effect calculation errors | High | Medium | Write comprehensive tests for effect aggregation logic, use TypeScript for type safety | Engineering |
| Screen unmounting breaking state | Medium | Low | Keep observables in hooks (not components), test remounting scenarios | Engineering |

### Dependencies

| Dependency | Status | Mitigation |
|------------|--------|------------|
| `@legendapp/state@^3.0.0-beta.35` | Already installed | Pin version to avoid breaking changes |
| `@react-native-async-storage/async-storage@^2.2.0` | Already installed | Expo-managed, stable |
| `useNavigation` hook | Already exists | Verify compatibility with multi-screen app |
| `usePersistedCounter` hook | Already exists | Add decrement action for scrap spending |

## 12. Implementation Plan (TDD-Driven)

### Development Phases

Following lean task generation principles - prioritize user-visible functionality:

#### Phase 1: Foundation & Navigation [1 week]

**Task 1.1: App Integration Test Setup (MANDATORY FIRST)**
- UPDATE `App.test.tsx` with navigation tests
- Write test: "renders without import errors"
- Write test: "displays shop navigation button on clicker screen"
- Write test: "navigates to shop screen when shop button pressed"
- Write test: "navigates back to clicker when back button pressed"
- Write test: "preserves scrap balance across screen navigation"
- Run tests - they MUST fail (shop navigation doesn't exist)
- **Deliverable**: Failing app integration tests ready for TDD

**Task 1.2: Navigation Implementation**
- UPDATE `App.tsx` to conditionally render screens based on currentScreen$
- UPDATE `ClickerScreen.tsx` to add shop navigation button
- Create minimal `ShopScreen.tsx` (just header + back button)
- Run App.test.tsx - navigation tests should now pass
- **Deliverable**: Working navigation between clicker and shop screens

**Task 1.3: Scrap Balance State**
- UPDATE `usePersistedCounter` to add `decrement` action
- UPDATE `ClickerScreen.tsx` to track scrap balance
- Update feed action to grant 1 scrap per pet (base rate)
- Display scrap balance on clicker screen
- **Deliverable**: Scrap balance persists across sessions

#### Phase 2: Shop Infrastructure [1 week]

**Task 2.1: Upgrade Type Definitions (TDD)**
1. **RED Phase**: Write type tests in `types/upgrade.test.ts`
   - Test: type guard validates upgrade effect types
   - Test: upgrade interface enforces required fields
   - Run tests - all FAIL (types don't exist)

2. **GREEN Phase**: Implement `types/upgrade.ts`
   - Define Upgrade interface
   - Define UpgradeEffectType union
   - Implement isValidEffectType type guard
   - Run tests - all PASS

**Task 2.2: useUpgrades Hook (TDD)**
1. **RED Phase**: Write `hooks/useUpgrades.test.tsx` with all hook tests
   - Test: initializes with empty upgrades list
   - Test: adds upgrade to available list
   - Test: purchases upgrade when sufficient scrap
   - Test: rejects purchase when insufficient scrap
   - Test: deducts scrap cost on purchase
   - Test: filters purchased upgrades from available list
   - Test: persists purchased upgrades to AsyncStorage
   - Test: loads persisted purchased upgrades on mount
   - Test: reset action clears purchased upgrades
   - Run tests - all FAIL (hook doesn't exist)

2. **GREEN Phase**: Implement `hooks/useUpgrades.ts`
   - Create availableUpgrades$ observable
   - Create purchasedUpgrades$ observable with synced persistence
   - Create filteredUpgrades$ computed observable
   - Implement purchaseUpgrade action with validation
   - Implement addUpgrade action
   - Implement reset action
   - Run tests - all PASS

3. **REFACTOR Phase**: Clean up implementation
   - Add JSDoc comments
   - Optimize computed observables
   - Ensure all tests still pass

#### Phase 3: Shop UI Components [1 week]

**Task 3.1: ShopScreen Component (TDD)**
1. **RED Phase**: Write `ShopScreen.test.tsx` with all component tests
   - Test: renders back button with accessibility attributes
   - Test: displays current scrap balance
   - Test: navigates back to clicker when back button pressed
   - Test: renders upgrade list component
   - Test: back button meets accessibility touch target size
   - Run tests - all FAIL (implementation is skeleton only)

2. **GREEN Phase**: Implement ShopScreen.tsx
   - Use usePersistedCounter for scrap balance display
   - Use useNavigation for back button
   - Use useUpgrades for upgrade data
   - Render UpgradeList component
   - Apply styles for 44x44pt touch target
   - Add accessibility attributes
   - Run tests - all PASS

**Task 3.2: UpgradeList Component (TDD)**
1. **RED Phase**: Write `components/UpgradeList.test.tsx`
   - Test: displays empty state when no upgrades
   - Test: renders upgrade items when upgrades available
   - Test: filters out purchased upgrades
   - Run tests - all FAIL (component doesn't exist)

2. **GREEN Phase**: Implement components/UpgradeList.tsx
   - Use For component to render upgrade items
   - Use Show component for empty state
   - Implement FlatList for virtualization
   - Pass observables to UpgradeItem components
   - Run tests - all PASS

**Task 3.3: UpgradeItem Component (TDD)**
1. **RED Phase**: Write `components/UpgradeItem.test.tsx`
   - Test: renders upgrade name, description, cost
   - Test: calls onPurchase when purchase button pressed
   - Test: disables purchase button when already purchased
   - Test: disables purchase button when unaffordable
   - Test: shows visual indication for unaffordable upgrades
   - Run tests - all FAIL (component doesn't exist)

2. **GREEN Phase**: Implement components/UpgradeItem.tsx
   - Render upgrade details with Memo components
   - Implement purchase button with conditional styling
   - Add disabled state for purchased/unaffordable
   - Apply accessibility attributes
   - Memoize component with React.memo
   - Run tests - all PASS

**Task 3.4: Upgrade Effect Application**
- UPDATE ClickerScreen to compute scrapPerPet from purchased upgrades
- Add computed observable for total scrap boost
- Update feed action to apply boost when granting scrap
- Test with manual upgrade additions
- **Deliverable**: Purchased upgrades boost scrap earnings

#### Phase 4: Testing & QA [0.5 weeks]

**Task 4.1: Integration Testing**
- Run full test suite (App + Shop + Upgrades tests)
- Verify all navigation flows work end-to-end
- Test purchase flow with mock upgrades
- Verify persistence across app restarts
- **Deliverable**: All integration tests passing

**Task 4.2: Accessibility Audit**
- Test on iPhone SE (smallest screen)
- Verify touch targets with VoiceOver (iOS)
- Verify touch targets with TalkBack (Android)
- Test color contrast with WebAIM tool
- **Deliverable**: Accessibility compliance verified

**Task 4.3: Performance Validation**
- Test FlatList with 100 mock upgrades
- Monitor frame rate with React Native DevTools
- Measure navigation transition time
- Measure purchase transaction time
- **Deliverable**: Performance requirements met (<200ms nav, <100ms purchase, 60fps)

**Task 4.4: Cross-Platform Testing**
- Test on iOS (iPhone 14+)
- Test on Android (Pixel 7+)
- Test on Web (Chrome, Safari, Firefox)
- Verify persistence works on all platforms
- **Deliverable**: Platform compatibility validated

### Technical Milestones

| Milestone | Deliverable | Week | Dependencies |
| --------- | ----------- | ---- | ------------ |
| M1 | App navigation tests failing (RED) | 1.1 | None |
| M2 | Navigation working between screens | 1.2 | M1 |
| M3 | Scrap balance persists across sessions | 1.3 | M2 |
| M4 | Upgrade types defined and tested | 2.1 | M3 |
| M5 | useUpgrades hook all tests pass (GREEN) | 2.2 | M4 |
| M6 | ShopScreen all tests pass (GREEN) | 3.1 | M5 |
| M7 | UpgradeList all tests pass (GREEN) | 3.2 | M6 |
| M8 | UpgradeItem all tests pass (GREEN) | 3.3 | M7 |
| M9 | Upgrade effects apply to clicker gameplay | 3.4 | M8 |
| M10 | Full integration tests pass | 4.1 | M9 |
| M11 | Accessibility audit complete | 4.2 | M10 |
| M12 | Performance validation complete | 4.3 | M11 |
| M13 | Cross-platform testing complete | 4.4 | M12 |

## 13. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
| -------- | ------------------ | ------ | --------- |
| State Management | useState, Context API, Zustand, Legend-State | Legend-State | Already installed, fine-grained reactivity, built-in persistence, consistent with existing clicker screen |
| Navigation | React Navigation, Tab Navigator, Custom Observable | Custom Observable (useNavigation) | Already exists in codebase, lightweight for 2-screen MVP, matches project patterns |
| Scrap Storage | New hook, Shared state, Zustand store | Reuse usePersistedCounter | Behavior-based hook pattern, already proven, maintains consistency |
| Upgrade Storage | Array, Map, Set | Set for purchased IDs, Array for available | Set provides O(1) lookup for "is purchased" checks, Array natural for FlatList |
| List Component | ScrollView, FlatList, SectionList | FlatList | Virtualization for 100+ upgrades, performant, supports all MVP requirements |
| Component Structure | Single ShopScreen, Split components | Split into ShopScreen + UpgradeList + UpgradeItem | Separation of concerns, testability, reusability |
| Purchase Validation | Client-only, Server validation | Client-only | Local-only app, no server, validation in purchaseUpgrade action |
| Effect Application | Global multiplier, Per-upgrade computation | Per-upgrade computation with sum | Clear logic, extensible, easy to test |

### Trade-offs

- **Custom Navigation over React Navigation**: Chose simplicity over feature-richness (React Navigation overkill for 2 screens, custom observable sufficient)
- **Reuse usePersistedCounter for Scrap**: Chose consistency over specialization (generic counter fits scrap behavior, maintains architecture patterns)
- **Set for Purchased Upgrades**: Chose lookup performance over serialization simplicity (Set requires conversion to array for AsyncStorage, but O(1) lookup worth it)
- **FlatList from Start**: Chose future-proofing over simplicity (could use ScrollView for empty list, but FlatList prevents future refactoring)
- **No Offline Validation**: Chose local-only validation over server sync (per CLAUDE.md - no offline mode, all validation client-side)
- **Empty Upgrade List MVP**: Chose infrastructure over content (ship shop UI without upgrades, populate in iterations)

## 14. Open Questions

Technical questions requiring resolution:

- [ ] Should purchased upgrades remain visible in list (marked "Owned") or be hidden?
  - **Recommendation**: Hide from filtered list for MVP (cleaner UI, reduces clutter), can add "View Owned" toggle in future
- [ ] Should there be a maximum scrap limit to prevent overflow?
  - **Recommendation**: No for MVP (Number.MAX_SAFE_INTEGER extremely unlikely), document in code comments
- [ ] What's the expected range of upgrade costs (1-100? 1-10000?)?
  - **Recommendation**: Start with 10-1000 range for MVP, validate in future based on gameplay balancing
- [ ] Should upgrade effects stack additively or multiplicatively?
  - **Recommendation**: Additive for MVP (simpler calculation, easier to understand), can change in future
- [ ] Should there be a confirmation dialog before purchase?
  - **Recommendation**: No for MVP (reduces friction), can add for expensive upgrades in P1
- [ ] Should shop button show badge when user can afford next upgrade?
  - **Recommendation**: P1 feature, not MVP (adds complexity, requires computed state in clicker screen)
- [ ] How should empty shop state message read?
  - **Recommendation**: "No upgrades available yet. Check back soon!" (positive, implies future content)

## 15. Appendices

### A. Technical Glossary

- **Clicker Screen**: Main gameplay screen where users tap to feed pets and earn scrap
- **Shop Screen**: Dedicated screen for viewing and purchasing upgrades
- **Scrap**: Primary currency earned through gameplay, used to purchase upgrades
- **Upgrade**: Purchasable item that permanently enhances gameplay mechanics
- **Scrap Per Pet**: Upgrade effect type that increases scrap gained from each pet action
- **Pets Per Feed**: Upgrade effect type that increases the number of pets gained when feeding
- **Legend-State**: Fine-grained reactive state management library with built-in persistence
- **Observable**: Legend-State primitive for reactive state (subscribable value)
- **Memo**: Legend-State React component for fine-grained reactivity
- **synced()**: Legend-State helper for configuring persistence and remote sync
- **FlatList**: React Native component for efficiently rendering large lists with virtualization
- **TDD**: Test-Driven Development (write tests before implementation)

### B. Reference Architecture

**Legend-State Patterns**:
- Hook-based state management: `/mnt/c/dev/class-one-rapids/docs/architecture/state-management-hooks-guide.md`
- Persistence configuration: `/mnt/c/dev/class-one-rapids/docs/research/expo_legend_state_v3_guide_20250917_225656.md`

**React Native UI Patterns**:
- Component selection: `/mnt/c/dev/class-one-rapids/docs/architecture/react-native-ui-guidelines.md`
- FlatList optimization patterns (React Native docs)

**Testing Patterns**:
- React Native Testing Library: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`
- Legend-State async testing: Use waitFor for observable updates

**Existing Implementations**:
- ClickerScreen: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
- usePersistedCounter: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.ts`
- useNavigation: `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useNavigation.ts`

### C. File Organization

Following `/mnt/c/dev/class-one-rapids/docs/architecture/file-organization-patterns.md`:

**Module Structure**:
```
frontend/modules/shop/
├── ShopScreen.tsx                     # Main shop screen
├── ShopScreen.test.tsx                # Shop screen tests
├── components/
│   ├── UpgradeList.tsx                # Upgrade list component
│   ├── UpgradeList.test.tsx           # Upgrade list tests
│   ├── UpgradeItem.tsx                # Individual upgrade item
│   └── UpgradeItem.test.tsx           # Upgrade item tests
├── hooks/
│   ├── useUpgrades.ts                 # Upgrade state hook
│   └── useUpgrades.test.tsx           # Hook tests
├── types/
│   └── upgrade.ts                     # TypeScript types
└── specs/
    ├── prd_shop_screen_20251116.md    # PRD
    └── tdd_shop_screen_20251116.md    # This TDD
```

**No Barrel Exports**: Import directly from files (no index.ts)
```typescript
// ✅ Good
import { ShopScreen } from './modules/shop/ShopScreen';
import { useUpgrades } from './modules/shop/hooks/useUpgrades';

// ❌ Bad (no index.ts)
import { ShopScreen, useUpgrades } from './modules/shop';
```

**Test Co-location**: Tests next to implementation (not in __tests__ folder)

### D. Related Documents

- **Product Requirements Document**: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/specs/prd_shop_screen_20251116.md`
- **Task List**: (To be created via /flow:tasks command)
- **State Management Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/state-management-hooks-guide.md`
- **File Organization Patterns**: `/mnt/c/dev/class-one-rapids/docs/architecture/file-organization-patterns.md`
- **React Native UI Guidelines**: `/mnt/c/dev/class-one-rapids/docs/architecture/react-native-ui-guidelines.md`
- **Legend-State v3 Guide**: `/mnt/c/dev/class-one-rapids/docs/research/expo_legend_state_v3_guide_20250917_225656.md`
- **Testing Library Guide**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Lean Task Generation Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/lean-task-generation-guide.md`

### E. Example Upgrade Definitions (For Reference Only - Not Implemented)

```typescript
// These are examples to illustrate the data model
// DO NOT implement these in the MVP
const exampleUpgrades: Upgrade[] = [
  {
    id: 'scrap_boost_1',
    name: 'Scrap Magnet',
    description: 'Gain +1 scrap per pet',
    cost: 10,
    effectType: 'scrapPerPet',
    effectValue: 1,
  },
  {
    id: 'scrap_boost_2',
    name: 'Scrap Amplifier',
    description: 'Gain +2 scrap per pet',
    cost: 50,
    effectType: 'scrapPerPet',
    effectValue: 2,
  },
  {
    id: 'pet_boost_1',
    name: 'Mega Feed',
    description: 'Gain +1 pet per feed',
    cost: 25,
    effectType: 'petsPerFeed',
    effectValue: 1,
  },
  {
    id: 'pet_boost_2',
    name: 'Ultra Feed',
    description: 'Gain +3 pets per feed',
    cost: 100,
    effectType: 'petsPerFeed',
    effectValue: 3,
  },
];
```

---

**Generated from PRD**: `prd_shop_screen_20251116.md`
**Generation Date**: 2025-11-16
**Generator**: Claude (Anthropic)
**Version**: 1.0 (Draft)
