# Shop System Technical Design Document

## Document Control

| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude (Generated) | 2025-11-16 | Draft | Initial TDD from PRD |

## Executive Summary

This Technical Design Document defines the implementation for a Shop System that enables players to purchase upgrades using the scrap resource. The solution implements a dedicated shop screen with navigation, upgrade display/purchase flow, state management for purchased upgrades, and integration with existing scrap and AI Pet systems. This feature establishes the foundation for the game's economic progression loop.

**Key Technical Decisions:**
- Simple state-based navigation (conditional rendering) instead of React Navigation
- Extend scrap hook pattern with new `useUpgrades` hook for upgrade state management
- Legend-State observables for reactive upgrade display and affordability checks
- AsyncStorage persistence for purchased upgrades using existing patterns
- Dedicated ShopScreen component with upgrade list UI
- Centralized upgrade definitions in data file for easy extensibility
- Test-Driven Development with comprehensive coverage

---

## 1. Overview & Context

### Problem Statement

Players need a strategic spending mechanism for accumulated scrap that provides meaningful progression choices. The system must display available upgrades, validate purchase affordability, deduct scrap costs, track purchased upgrades, and apply upgrade effects to gameplay mechanics (scrap generation and AI Pet acquisition). The implementation must be easily extensible for adding new upgrades in the future while maintaining the simplicity of the current single-screen architecture.

**Technical Challenges:**
- Navigation between main clicker screen and shop screen without introducing complex navigation library
- Validating purchases to prevent invalid transactions (insufficient scrap, duplicate purchases)
- Applying upgrade effects to existing scrap generation and pet increment mechanics
- Persisting purchased upgrades across sessions
- Displaying upgrades with clear affordability indicators
- Ensuring atomic purchase transactions (all-or-nothing)
- Maintaining extensibility for future upgrade types and effects

### Solution Approach

Implement a shop system using simple state-based navigation with reactive upgrade management:

1. **Navigation Layer**: Conditional screen rendering based on app state
   - Add navigation state to App.tsx (currentScreen: 'clicker' | 'shop')
   - ClickerScreen shows "Shop" button to navigate to shop
   - ShopScreen shows "Back" button to return to clicker
   - No React Navigation dependency needed for simple two-screen flow

2. **State Layer**: Custom hook `useUpgrades` that encapsulates:
   - Legend-State observable for purchased upgrade IDs
   - Computed observable for available (unpurchased) upgrades
   - Purchase validation logic (scrap check, duplicate check)
   - Purchase transaction (deduct scrap, mark purchased, save state)
   - AsyncStorage persistence with same pattern as scrap/counter

3. **Data Layer**: Centralized upgrade definitions
   - Static upgrade data in `upgradeDefinitions.ts`
   - TypeScript interfaces for upgrade structure
   - Two effect types: scrapMultiplier and petBonus
   - Unique IDs for tracking purchases

4. **UI Layer**: ShopScreen component
   - Displays scrap balance prominently
   - Scrollable list of available upgrades
   - Each upgrade shows: name, cost, description, effect type
   - Visual differentiation for affordable vs unaffordable upgrades
   - Purchase buttons with validation feedback

5. **Integration Layer**: Upgrade effects applied to gameplay
   - Scrap generation multiplier applied in `useScrapGeneration`
   - Pet acquisition bonus applied in `usePersistedCounter` increment action
   - Computed observables calculate total multipliers from purchased upgrades
   - Effects stack if multiple upgrades of same type purchased

### Success Criteria

**Functionality:**
- Players can navigate to/from shop with single tap
- Upgrades display with clear costs and affordability
- Purchase validation prevents invalid transactions (100% accuracy)
- Scrap balance updates immediately after purchase
- Purchased upgrades persist and restore across sessions
- Upgrade effects apply correctly to gameplay (multipliers/bonuses work)

**Performance:**
- Shop screen opens in <300ms (PRD NFR-2.1)
- Purchase transactions complete within 100ms (PRD NFR-2.2)
- Upgrade list renders smoothly with 50+ upgrades (PRD NFR-2.3)

**Reliability:**
- 100% of valid purchases succeed
- 100% of invalid purchases prevented
- No duplicate purchases possible
- Persistence failures handled gracefully

---

## 2. Codebase Exploration & Integration Analysis

### Existing Components

**App.tsx** (`/mnt/c/dev/class-one-rapids/frontend/App.tsx`):
- **Current state**: Minimal wrapper - SafeAreaProvider wrapping ClickerScreen
- **Structure**: Single screen, no navigation logic
- **Integration**: Need to add navigation state and conditional rendering
- **Decision**: **UPDATE** - Add simple navigation state without external library

**ClickerScreen** (`/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`):
- **Current state**: Main game screen with pet counter, scrap display, feed button
- **Purpose**: Primary game interface
- **Integration**: Uses `usePersistedCounter` and `useScrapGeneration`
- **Decision**: **UPDATE** - Add "Shop" navigation button, integrate upgrade effects

### Existing Hooks

**usePersistedCounter** (`/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts`):
- **Purpose**: Manages persistent AI Pet counter with Legend-State
- **Pattern**: Module-level singleton observable, persist config, returns `{ count$, actions }`
- **Integration**: Increment action needs to apply pet acquisition bonuses from upgrades
- **Decision**: **UPDATE** - Modify increment action to check for pet bonus upgrades

**useScrapGeneration** (`/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts`):
- **Purpose**: Manages passive scrap generation based on pet count
- **Pattern**: Module-level observable, interval-based generation, persist config
- **Integration**: Generation calculation needs to apply scrap multiplier upgrades
- **Decision**: **UPDATE** - Modify generation calculation to include multiplier effects

### Architecture Decisions (UPDATE vs CREATE)

**Hook: useUpgrades**
- **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgrades.ts`
  - **RATIONALE**: New shop-specific state management. Follows existing hook patterns (module observable, persist, return interface). Owns purchased upgrade tracking and purchase logic.

**Hook: useNavigation**
- **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useNavigation.ts`
  - **RATIONALE**: Simple navigation state management for app-level screen switching. Reusable pattern for future screens. Keeps navigation logic separate from App.tsx rendering.

**Component: ShopScreen**
- **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`
  - **RATIONALE**: New screen dedicated to shop functionality. Follows ClickerScreen pattern. Module ownership clear.

**Component: UpgradeListItem**
- **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/UpgradeListItem.tsx`
  - **RATIONALE**: Reusable upgrade display component. Encapsulates upgrade rendering logic. Keeps ShopScreen clean.

**Data: upgradeDefinitions**
- **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.ts`
  - **RATIONALE**: Centralized data source for all upgrade configurations. Easy to add new upgrades without code changes. Type-safe upgrade structure.

**Utility: formatScrap**
- **DECISION: REUSE** existing `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.ts`
  - **RATIONALE**: Already exists for formatting scrap display. Same formatting needed for shop.

**Component: App**
- **DECISION: UPDATE** existing file at `/mnt/c/dev/class-one-rapids/frontend/App.tsx`
  - **RATIONALE**: Add navigation state and conditional screen rendering. Minimal changes to existing structure.

**Component: ClickerScreen**
- **DECISION: UPDATE** existing file at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
  - **RATIONALE**: Add shop navigation button. Integrate upgrade effects into pet increment.

**Hook: usePersistedCounter**
- **DECISION: UPDATE** existing file at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts`
  - **RATIONALE**: Modify increment action to apply pet acquisition bonuses from purchased upgrades.

**Hook: useScrapGeneration**
- **DECISION: UPDATE** existing file at `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts`
  - **RATIONALE**: Modify generation calculation to apply scrap multiplier effects from purchased upgrades.

**Tests**
- **DECISION: CREATE** new files:
  - `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgrades.test.ts` (hook tests)
  - `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx` (component tests)
  - `/mnt/c/dev/class-one-rapids/frontend/modules/shop/UpgradeListItem.test.tsx` (component tests)
- **DECISION: UPDATE** existing files:
  - `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx` (add shop button tests)
  - `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.test.ts` (add upgrade bonus tests)
  - `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts` (add multiplier tests)

### Integration Validation

- ✅ No duplicate/similar components exist (no other shop systems)
- ✅ Module ownership clear: `shop` module owns shop UI/state, `shared/hooks` owns navigation
- ✅ Navigation accessibility: Simple state-based approach, no external library needed
- ✅ No conflicting state management patterns (extends existing Legend-State + AsyncStorage pattern)
- ✅ Follows file organization patterns: co-located tests, no barrel exports, behavior-focused naming

---

## 3. Requirements Analysis

### Functional Requirements

**FR-1: Shop Navigation**
- **FR-1.1 (Shop access button on main screen)**:
  - Implementation: Add "Shop" Pressable button to ClickerScreen
  - Testing: Verify button exists with `getByText(/shop/i)`, press triggers navigation

- **FR-1.2 (Navigate to shop screen)**:
  - Implementation: `useNavigation` hook provides `navigateToShop()` action
  - Testing: Press shop button, verify ShopScreen renders

- **FR-1.3 (Back button in shop)**:
  - Implementation: ShopScreen has "Back" Pressable button
  - Testing: Verify back button exists, press returns to ClickerScreen

- **FR-1.4 (Smooth transitions)**:
  - Implementation: Conditional rendering with React Native defaults
  - Testing: Visual/manual testing (animation not in MVP scope)

- **FR-1.5 (Scrap balance visible in shop)**:
  - Implementation: ShopScreen displays scrap total from `scrap$` observable
  - Testing: Verify scrap balance renders in ShopScreen with correct value

**FR-2: Upgrade Display**
- **FR-2.1 (Scrollable upgrade list)**:
  - Implementation: FlatList rendering available upgrades in ShopScreen
  - Testing: Verify FlatList exists, renders multiple upgrade items

- **FR-2.2 (Display upgrade name)**:
  - Implementation: UpgradeListItem shows `upgrade.name`
  - Testing: Verify upgrade name text visible for each item

- **FR-2.3 (Display scrap cost)**:
  - Implementation: UpgradeListItem shows formatted `upgrade.cost`
  - Testing: Verify cost text displays with proper formatting (e.g., "Cost: 100 scrap")

- **FR-2.4 (Display description)**:
  - Implementation: UpgradeListItem shows `upgrade.description`
  - Testing: Verify description text visible

- **FR-2.5 (Visual categorization by type)**:
  - Implementation: Color-coding or icons based on `upgrade.effectType`
  - Testing: Verify different visual styles for scrapMultiplier vs petBonus

- **FR-2.6 (Indicate affordability)**:
  - Implementation: Computed `isAffordable$` for each upgrade, visual styling
  - Testing: Verify affordable upgrades styled differently than unaffordable

- **FR-2.7 (Disable unaffordable upgrades)**:
  - Implementation: Purchase button disabled when scrap < cost
  - Testing: Verify button has `disabled` prop when unaffordable

**FR-3: Upgrade Purchase Flow**
- **FR-3.1 (Purchase button per upgrade)**:
  - Implementation: Pressable button in UpgradeListItem
  - Testing: Verify purchase button exists for each upgrade

- **FR-3.2 (Validate sufficient scrap)**:
  - Implementation: `purchase()` action checks `scrap$.get() >= cost`
  - Testing: Attempt purchase with insufficient scrap, verify failure

- **FR-3.3 (Deduct scrap on purchase)**:
  - Implementation: `scrap$.set(prev => prev - cost)` on valid purchase
  - Testing: Purchase upgrade, verify scrap balance decreased by cost

- **FR-3.4 (Mark upgrade as purchased)**:
  - Implementation: Add upgrade ID to `purchasedUpgradeIds$` observable
  - Testing: After purchase, verify upgrade ID in purchased list

- **FR-3.5 (Remove/mark purchased upgrades)**:
  - Implementation: Filter out purchased IDs from available upgrades computed observable
  - Testing: After purchase, verify upgrade no longer appears in shop

- **FR-3.6 (Prevent duplicate purchases)**:
  - Implementation: Check if ID already in `purchasedUpgradeIds$` before allowing purchase
  - Testing: Attempt to purchase same upgrade twice, verify second attempt fails

- **FR-3.7 (Atomic transactions)**:
  - Implementation: Single function handles all purchase steps, no partial states
  - Testing: Verify scrap deduction and ID addition happen together or not at all

- **FR-3.8 (Failed purchase feedback)**:
  - Implementation: Return success/failure from purchase action, optional error message
  - Testing: Attempt invalid purchase, verify user sees feedback (future: toast/alert)

**FR-4: Upgrade System Architecture**
- **FR-4.1 (Two effect types)**:
  - Implementation: TypeScript union type `'scrapMultiplier' | 'petBonus'`
  - Testing: Verify both types work correctly with different upgrades

- **FR-4.2 (Data-driven definitions)**:
  - Implementation: Array of upgrade objects in `upgradeDefinitions.ts`
  - Testing: Add new upgrade to definitions, verify it appears in shop

- **FR-4.3 (Track purchased upgrades)**:
  - Implementation: Observable array `purchasedUpgradeIds$: string[]`
  - Testing: Verify purchased IDs stored correctly

- **FR-4.4 (Apply effects automatically)**:
  - Implementation: Computed observables in hooks read purchased upgrades, calculate totals
  - Testing: Purchase upgrade, verify effect applies to gameplay immediately

- **FR-4.5 (Extensible for future types)**:
  - Implementation: Upgrade interface supports additional effect types easily
  - Testing: Architecture review confirms extensibility

- **FR-4.6 (Unique identifiers)**:
  - Implementation: Each upgrade has unique string `id` property
  - Testing: Verify no duplicate IDs in definitions

**FR-5: Data Persistence**
- **FR-5.1 (Save purchased upgrades)**:
  - Implementation: Legend-State persist config for `purchasedUpgradeIds$`
  - Testing: Verify AsyncStorage.setItem called with upgrade IDs

- **FR-5.2 (Restore on return)**:
  - Implementation: Automatic load via persist plugin on app start
  - Testing: Mock AsyncStorage.getItem, verify purchased IDs restored

- **FR-5.3 (Same storage mechanism)**:
  - Implementation: Use ObservablePersistAsyncStorage plugin like scrap/counter
  - Testing: Verify all three persist independently (pet count, scrap, upgrades)

- **FR-5.4 (Graceful persistence failures)**:
  - Implementation: Try/catch around persistence, fallback to empty array
  - Testing: Mock AsyncStorage error, verify app continues functioning

**FR-6: Integration with Existing Systems**
- **FR-6.1 (Modify scrap per pet per second)**:
  - Implementation: In `useScrapGeneration`, multiply base rate by scrap multiplier from upgrades
  - Testing: Purchase scrap multiplier upgrade, verify generation rate increases

- **FR-6.2 (Modify pets per feed press)**:
  - Implementation: In `usePersistedCounter` increment action, add pet bonus from upgrades
  - Testing: Purchase pet bonus upgrade, verify feed button adds more pets

- **FR-6.3 (Stack multiple upgrades)**:
  - Implementation: Sum all multipliers/bonuses from purchased upgrades
  - Testing: Purchase two scrap multipliers, verify effects stack

- **FR-6.4 (Apply immediately on purchase)**:
  - Implementation: Effects read from purchased upgrades reactively
  - Testing: Purchase upgrade, verify effect applies within next game tick

- **FR-6.5 (Main screen reflects effects)**:
  - Implementation: Real-time scrap generation/pet increment uses computed totals
  - Testing: Observe scrap/pets after purchase, verify values change

### Non-Functional Requirements

**NFR-1: User Experience**
- **NFR-1.1 (Intuitive interface)**:
  - Target: No tutorial needed to understand shop
  - Implementation: Clear labels, familiar UI patterns (buttons, lists)
  - Testing: User testing (manual), clear component structure

- **NFR-1.2 (Clear costs and effects)**:
  - Target: Player understands what each upgrade does
  - Implementation: Descriptive text, cost displayed prominently
  - Testing: All text visible and readable

- **NFR-1.3 (Visual feedback)**:
  - Target: Immediate response to interactions
  - Implementation: Button press states, disabled states, list updates
  - Testing: Verify press states work, purchases update UI

- **NFR-1.4 (Responsive navigation)**:
  - Target: Natural feel when switching screens
  - Implementation: Instant conditional rendering
  - Testing: Navigation completes <300ms (manual timing)

- **NFR-1.5 (Adaptive layout)**:
  - Target: Works on different screen sizes
  - Implementation: Flex layouts, ScrollView/FlatList
  - Testing: Test on various device sizes

**NFR-2: Performance**
- **NFR-2.1 (Shop opens <300ms)**:
  - Implementation: Simple conditional rendering, no heavy computation
  - Testing: Performance.now() measurements in tests

- **NFR-2.2 (Purchase completes <100ms)**:
  - Implementation: Atomic observable updates, simple calculations
  - Testing: Time purchase transactions in tests

- **NFR-2.3 (Smooth rendering with 50+ upgrades)**:
  - Implementation: FlatList for virtualization, optimized renders
  - Testing: Test with large upgrade definition array

**NFR-3: Scalability**
- **NFR-3.1 (Support 100+ upgrades)**:
  - Implementation: FlatList handles large lists efficiently
  - Testing: Test with 100 upgrades in definitions

- **NFR-3.2 (Accommodate future effect types)**:
  - Implementation: Extensible TypeScript interfaces, switch statements
  - Testing: Architecture review, add mock new effect type

- **NFR-3.3 (Easy balancing)**:
  - Implementation: Centralized data definitions, no code changes needed
  - Testing: Modify upgrade costs/effects in definitions, verify changes apply

**NFR-4: Maintainability**
- **NFR-4.1 (Well-documented structures)**:
  - Implementation: TypeScript interfaces, JSDoc comments
  - Testing: Documentation review

- **NFR-4.2 (Follow project patterns)**:
  - Implementation: Match existing hook/component patterns
  - Testing: Code review checklist

- **NFR-4.3 (Modular code)**:
  - Implementation: Separate concerns (UI, state, data)
  - Testing: Each module testable independently

- **NFR-4.4 (Test coverage)**:
  - Target: >90% coverage for shop functionality
  - Testing: Jest coverage report

**NFR-5: Accessibility**
- **NFR-5.1 (Minimum touch targets)**:
  - Target: 44x44 points per WCAG guidelines
  - Implementation: StyleSheet with minWidth/minHeight
  - Testing: Verify button styles meet minimum

- **NFR-5.2 (Sufficient contrast)**:
  - Target: 4.5:1 contrast ratio for text
  - Implementation: Dark text on light backgrounds
  - Testing: Manual contrast checking

- **NFR-5.3 (Screen reader support)**:
  - Target: All elements navigable with screen reader
  - Implementation: Accessibility attributes on all interactive elements
  - Testing: Test with screen reader enabled

- **NFR-5.4 (Accessibility labels)**:
  - Target: All buttons have descriptive labels
  - Implementation: accessibilityLabel on all Pressables
  - Testing: Verify labels exist and are descriptive

**NFR-6: Reliability**
- **NFR-6.1 (Prevent invalid transactions)**:
  - Target: 100% validation accuracy
  - Implementation: Pre-purchase checks, atomic updates
  - Testing: Comprehensive validation tests

- **NFR-6.2 (Handle concurrent purchases)**:
  - Target: No race conditions
  - Implementation: Synchronous observable updates
  - Testing: Rapid purchase attempts in tests

- **NFR-6.3 (No silent failures)**:
  - Target: All errors logged/reported
  - Implementation: Try/catch with console.error
  - Testing: Force errors, verify logging

---

## 4. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx (UPDATED)                        │
│  (SafeAreaProvider wrapper + navigation state)                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  useNavigation()                          [NEW]           │  │
│  │  - currentScreen$ ('clicker' | 'shop')                    │  │
│  │  - actions: { navigateToShop, navigateToClicker }         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  {currentScreen === 'clicker' ? (                                │
│    ┌────────────────────────────────────────────────────────┐  │
│    │  ClickerScreen.tsx (UPDATED)                            │  │
│    │  ┌──────────────────────────────────────────────────┐  │  │
│    │  │  usePersistedCounter() (UPDATED)                  │  │  │
│    │  │  - count$ (with pet bonus from upgrades)          │  │  │
│    │  │  - actions.increment() (applies bonuses)          │  │  │
│    │  └──────────────────────────────────────────────────┘  │  │
│    │  ┌──────────────────────────────────────────────────┐  │  │
│    │  │  useScrapGeneration(count$) (UPDATED)             │  │  │
│    │  │  - scrap$ (with multiplier from upgrades)         │  │  │
│    │  └──────────────────────────────────────────────────┘  │  │
│    │  ┌──────────────────────────────────────────────────┐  │  │
│    │  │  useNavigation()                                  │  │  │
│    │  │  - Get navigateToShop action                      │  │  │
│    │  └──────────────────────────────────────────────────┘  │  │
│    │                                                          │  │
│    │  UI: Pet counter, Scrap display, Feed button, Shop btn │  │
│    └────────────────────────────────────────────────────────┘  │
│  ) : (                                                           │
│    ┌────────────────────────────────────────────────────────┐  │
│    │  ShopScreen.tsx                          [NEW]          │  │
│    │  ┌──────────────────────────────────────────────────┐  │  │
│    │  │  useScrapGeneration(count$)                       │  │  │
│    │  │  - scrap$ (for balance display)                   │  │  │
│    │  └──────────────────────────────────────────────────┘  │  │
│    │  ┌──────────────────────────────────────────────────┐  │  │
│    │  │  useUpgrades(scrap$)                 [NEW]        │  │  │
│    │  │  - purchasedUpgradeIds$ (persisted)               │  │  │
│    │  │  - availableUpgrades$ (computed)                  │  │  │
│    │  │  - actions: { purchase }                          │  │  │
│    │  └──────────────────────────────────────────────────┘  │  │
│    │  ┌──────────────────────────────────────────────────┐  │  │
│    │  │  useNavigation()                                  │  │  │
│    │  │  - Get navigateToClicker action                   │  │  │
│    │  └──────────────────────────────────────────────────┘  │  │
│    │                                                          │  │
│    │  UI: Back button, Scrap balance, Upgrade FlatList       │  │
│    │  ├─ UpgradeListItem (repeated)          [NEW]          │  │
│    │  │  - Name, Cost, Description, Purchase button         │  │
│    │  └─ ...                                                 │  │
│    └────────────────────────────────────────────────────────┘  │
│  )}                                                              │
└─────────────────────────────────────────────────────────────────┘
            ↓                  ↓                    ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  AsyncStorage    │  │  AsyncStorage    │  │  AsyncStorage    │
│  singularity-    │  │  scrap-total-v1  │  │  purchased-      │
│  pet-count-v1    │  │                  │  │  upgrades-v1     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Component Design

#### App.tsx (UPDATED)

**Purpose**: Root application component with simple navigation state

**Responsibilities**:
- Render SafeAreaProvider wrapper (existing)
- Manage navigation state via `useNavigation` hook (NEW)
- Conditionally render ClickerScreen or ShopScreen based on current screen (NEW)

**Dependencies**:
- `react-native-safe-area-context` (SafeAreaProvider)
- `useNavigation` hook (NEW)
- ClickerScreen component (existing)
- ShopScreen component (NEW)

**Interface**:
```typescript
export default function App(): JSX.Element
```

**Changes**:
- Import `useNavigation` and `ShopScreen`
- Call `useNavigation()` to get `currentScreen$` observable
- Replace direct `<ClickerScreen />` with conditional:
  ```tsx
  <Memo>
    {() => currentScreen$.get() === 'clicker'
      ? <ClickerScreen />
      : <ShopScreen />
    }
  </Memo>
  ```

#### useNavigation Hook (NEW)

**Purpose**: Manage simple navigation state between screens

**Responsibilities**:
- Provide observable for current screen
- Provide navigation actions to switch screens
- Keep navigation logic centralized and testable

**Dependencies**:
- `@legendapp/state` (observable)
- React hooks (useMemo)

**Interface**:
```typescript
type Screen = 'clicker' | 'shop';

interface UseNavigationReturn {
  currentScreen$: Observable<Screen>;
  actions: {
    navigateToShop: () => void;
    navigateToClicker: () => void;
  };
}

export function useNavigation(): UseNavigationReturn
```

**Implementation Notes**:
- Module-level `currentScreen$` observable (singleton)
- Initializes to 'clicker'
- No persistence needed (always starts on clicker screen)
- Simple set operations for navigation actions

#### ClickerScreen (UPDATED)

**Purpose**: Main game screen with shop navigation

**Responsibilities**:
- Display pet counter and scrap balance (existing)
- Render feed button (existing)
- Render shop navigation button (NEW)
- Integrate upgrade effects into gameplay (NEW)

**Dependencies**:
- `usePersistedCounter` (existing, UPDATED)
- `useScrapGeneration` (existing, UPDATED)
- `useNavigation` (NEW)
- React Native components

**Changes**:
- Import `useNavigation` hook
- Add Shop Pressable button to UI
- Call `navigateToShop` on button press
- No other changes (effects applied in hooks)

#### ShopScreen (NEW)

**Purpose**: Dedicated screen for browsing and purchasing upgrades

**Responsibilities**:
- Display scrap balance prominently
- Render back navigation button
- Display scrollable list of available upgrades
- Handle upgrade purchases via actions

**Dependencies**:
- `useUpgrades` hook (NEW)
- `useScrapGeneration` hook (for scrap balance)
- `usePersistedCounter` hook (for passing count$ to scrap generation)
- `useNavigation` hook (NEW)
- `UpgradeListItem` component (NEW)
- `formatNumber` utility (existing)
- React Native components (View, Text, Pressable, FlatList, StyleSheet)
- `@legendapp/state/react` (Memo)
- `react-native-safe-area-context` (SafeAreaView)

**Interface**:
```typescript
export function ShopScreen(): JSX.Element
```

**Implementation Notes**:
- SafeAreaView wrapper for safe area handling
- Header section with back button and scrap balance
- FlatList for upgrade display (virtualized for performance)
- Each upgrade rendered via UpgradeListItem
- No local state (all from hooks)

#### UpgradeListItem (NEW)

**Purpose**: Reusable component for displaying a single upgrade

**Responsibilities**:
- Display upgrade name, cost, description
- Show visual indicator for effect type (icon/color)
- Show affordability status (visual differentiation)
- Render purchase button with proper disabled state
- Handle purchase button press

**Dependencies**:
- `formatNumber` utility (existing)
- React Native components (View, Text, Pressable, StyleSheet)
- `@legendapp/state/react` (Memo)

**Interface**:
```typescript
interface UpgradeListItemProps {
  upgrade: Upgrade;
  isAffordable$: Observable<boolean>;
  onPurchase: (upgradeId: string) => void;
}

export function UpgradeListItem(props: UpgradeListItemProps): JSX.Element
```

**Implementation Notes**:
- Memo wrapper for reactive affordability updates
- Pressable button disabled when `!isAffordable$.get()`
- Color/icon based on `upgrade.effectType`
- Accessibility labels on all interactive elements

#### useUpgrades Hook (NEW)

**Purpose**: Manage upgrade purchase state and logic

**Responsibilities**:
- Initialize purchased upgrade IDs from AsyncStorage
- Provide observable array of purchased IDs
- Compute available (unpurchased) upgrades
- Validate purchase attempts (affordability, duplicates)
- Execute purchase transactions atomically
- Persist purchased IDs to AsyncStorage
- Provide upgrade effect totals for integration

**Dependencies**:
- `@legendapp/state` (observable, computed, configureSynced, synced)
- `@legendapp/state/persist-plugins/async-storage`
- `@react-native-async-storage/async-storage`
- `upgradeDefinitions` (NEW)
- React hooks (useMemo)

**Interface**:
```typescript
interface UseUpgradesReturn {
  purchasedUpgradeIds$: Observable<string[]>;
  availableUpgrades$: Observable<Upgrade[]>;
  totalScrapMultiplier$: Observable<number>;
  totalPetBonus$: Observable<number>;
  actions: {
    purchase: (upgradeId: string) => boolean; // Returns success/failure
  };
}

export function useUpgrades(scrap$: Observable<number>): UseUpgradesReturn
```

**Implementation Notes**:
- Module-level `purchasedUpgradeIds$` observable with persist config
- `availableUpgrades$` = computed filter of all upgrades not in purchased IDs
- `totalScrapMultiplier$` = computed sum of effectValue for purchased scrapMultiplier upgrades
- `totalPetBonus$` = computed sum of effectValue for purchased petBonus upgrades
- `purchase()` validates before executing, returns boolean success
- Validation: scrap check, duplicate check
- Transaction: deduct scrap, add ID to purchased list (atomic)

#### usePersistedCounter (UPDATED)

**Purpose**: Manage AI Pet counter with upgrade bonuses

**Responsibilities**:
- Persist pet count to AsyncStorage (existing)
- Increment count on feed button press (existing)
- Apply pet acquisition bonuses from upgrades (NEW)

**Changes**:
- Import `useUpgrades` hook
- Call `useUpgrades(scrap$)` to get `totalPetBonus$`
- Modify `increment` action:
  ```typescript
  increment: () => {
    const bonus = totalPetBonus$.get();
    count$.set((prev) => prev + 1 + bonus);
  }
  ```

**Note**: Needs access to `scrap$` observable to pass to `useUpgrades`. Solution: Pass `scrap$` as parameter or access via module import.

#### useScrapGeneration (UPDATED)

**Purpose**: Manage scrap generation with upgrade multipliers

**Responsibilities**:
- Generate scrap every second based on pet count (existing)
- Persist scrap to AsyncStorage (existing)
- Apply scrap generation multipliers from upgrades (NEW)

**Changes**:
- Import `useUpgrades` hook
- Call `useUpgrades(scrap$)` to get `totalScrapMultiplier$`
- Modify generation calculation:
  ```typescript
  const scrapToAdd = currentPetCount * SCRAP_PER_PET_PER_SECOND * (1 + totalScrapMultiplier$.get());
  ```

**Integration Note**: Circular dependency consideration - `useUpgrades` needs `scrap$`, which is in `useScrapGeneration`. Solution: Extract `scrap$` to shared module or pass as parameter.

#### upgradeDefinitions.ts (NEW)

**Purpose**: Centralized data source for all upgrade configurations

**Responsibilities**:
- Define all upgrade objects with complete data
- Export typed array of upgrades
- Ensure unique IDs for all upgrades
- Provide type safety via TypeScript interfaces

**Dependencies**: None (pure data)

**Interface**:
```typescript
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effectType: 'scrapMultiplier' | 'petBonus';
  effectValue: number;
  category?: 'scrapEfficiency' | 'petAcquisition';
}

export const UPGRADE_DEFINITIONS: Upgrade[] = [
  // Initial upgrades (examples for testing/demo)
  {
    id: 'scrap-boost-1',
    name: 'Scrap Finder',
    description: '+10% scrap generation from AI Pets',
    cost: 100,
    effectType: 'scrapMultiplier',
    effectValue: 0.1,
    category: 'scrapEfficiency'
  },
  {
    id: 'pet-boost-1',
    name: 'Extra Feed',
    description: '+1 AI Pet per feed button press',
    cost: 200,
    effectType: 'petBonus',
    effectValue: 1,
    category: 'petAcquisition'
  },
  // ... more upgrades
];
```

**Implementation Notes**:
- Export const array of upgrade objects
- Start with 2-3 sample upgrades for testing
- Easy to add new upgrades by appending to array
- No code changes needed to add upgrades (just data)

### Data Flow

**Navigation Flow**:
```
1. User taps "Shop" button in ClickerScreen
   ↓
2. navigateToShop() action called
   ↓
3. currentScreen$ set to 'shop'
   ↓
4. App.tsx Memo detects change
   ↓
5. Conditional render switches to ShopScreen
   ↓
6. User taps "Back" button in ShopScreen
   ↓
7. navigateToClicker() action called
   ↓
8. currentScreen$ set to 'clicker'
   ↓
9. App.tsx Memo detects change
   ↓
10. Conditional render switches back to ClickerScreen
```

**Purchase Flow**:
```
1. ShopScreen renders with available upgrades
   ↓
2. User taps purchase button on upgrade
   ↓
3. onPurchase(upgradeId) called
   ↓
4. actions.purchase(upgradeId) executed in useUpgrades
   ↓
5. Validation checks:
   a. currentScrap = scrap$.get()
   b. upgradeCost = upgrade.cost
   c. if (currentScrap < upgradeCost) return false
   d. if (purchasedUpgradeIds$.get().includes(upgradeId)) return false
   ↓
6. Purchase transaction (atomic):
   a. scrap$.set(prev => prev - upgradeCost)
   b. purchasedUpgradeIds$.set(prev => [...prev, upgradeId])
   ↓
7. AsyncStorage persistence triggered (debounced):
   a. Save new purchasedUpgradeIds array
   b. Save new scrap total
   ↓
8. Computed observables update automatically:
   a. availableUpgrades$ removes purchased upgrade
   b. totalScrapMultiplier$ or totalPetBonus$ recalculates
   ↓
9. UI updates reactively:
   a. ShopScreen FlatList removes purchased upgrade (via availableUpgrades$)
   b. Scrap balance decreases (via scrap$)
   ↓
10. Gameplay effects apply immediately:
   a. Next scrap generation tick uses new multiplier
   b. Next feed button press uses new bonus
```

**Upgrade Effect Application Flow**:
```
1. User purchases scrapMultiplier upgrade
   ↓
2. purchasedUpgradeIds$ updated with new ID
   ↓
3. totalScrapMultiplier$ computed observable recalculates:
   a. Filter purchased upgrades by effectType === 'scrapMultiplier'
   b. Sum all effectValue properties
   c. Return total multiplier (e.g., 0.1 + 0.15 = 0.25)
   ↓
4. Next generation tick in useScrapGeneration:
   a. scrapToAdd = petCount * 1 * (1 + totalScrapMultiplier$.get())
   b. If multiplier = 0.25, actual rate = 1.25x base
   c. scrap$ updates with boosted amount
   ↓
5. User sees increased scrap accumulation rate immediately
```

**App Startup Flow**:
```
1. App.tsx renders
   ↓
2. ClickerScreen mounts (default navigation state)
   ↓
3. usePersistedCounter initializes:
   a. AsyncStorage loads 'singularity-pet-count-v1'
   ↓
4. useScrapGeneration initializes:
   a. AsyncStorage loads 'scrap-total-v1'
   b. Interval starts for generation
   ↓
5. useUpgrades initializes (in hooks):
   a. AsyncStorage loads 'purchased-upgrades-v1'
   b. Computed observables calculate totals
   ↓
6. All state restored, gameplay continues with upgrade effects active
```

---

## 5. API Design

### Internal APIs

This feature is self-contained with no external API integrations. All APIs are internal React/React Native interfaces.

**Hook APIs:**

```typescript
// useNavigation.ts
export function useNavigation(): UseNavigationReturn

// Usage:
const { currentScreen$, actions } = useNavigation();
actions.navigateToShop();
```

```typescript
// useUpgrades.ts
export function useUpgrades(scrap$: Observable<number>): UseUpgradesReturn

// Usage:
const { availableUpgrades$, actions } = useUpgrades(scrap$);
actions.purchase('scrap-boost-1');
```

```typescript
// usePersistedCounter.ts (UPDATED)
export function usePersistedCounter(): UsePersistedCounterReturn

// Usage (unchanged):
const { count$, actions } = usePersistedCounter();
actions.increment(); // Now applies pet bonuses automatically
```

```typescript
// useScrapGeneration.ts (UPDATED)
export function useScrapGeneration(
  petCount$: Observable<number>
): UseScrapGenerationReturn

// Usage (unchanged):
const { scrap$ } = useScrapGeneration(count$);
// Now applies scrap multipliers automatically
```

**Component APIs:**

```typescript
// ShopScreen.tsx
export function ShopScreen(): JSX.Element

// Usage in App.tsx:
<ShopScreen />
```

```typescript
// UpgradeListItem.tsx
export function UpgradeListItem(props: UpgradeListItemProps): JSX.Element

// Usage in ShopScreen:
<UpgradeListItem
  upgrade={upgrade}
  isAffordable$={isAffordable$}
  onPurchase={handlePurchase}
/>
```

**Data APIs:**

```typescript
// upgradeDefinitions.ts
export const UPGRADE_DEFINITIONS: Upgrade[]
export interface Upgrade { /* ... */ }

// Usage:
import { UPGRADE_DEFINITIONS } from './upgradeDefinitions';
```

---

## 6. Data Model

### Entity Design

**Navigation State:**
```typescript
type Screen = 'clicker' | 'shop';

interface NavigationState {
  currentScreen: Screen;
}
```

**Upgrade State:**
```typescript
interface Upgrade {
  id: string;                              // Unique identifier
  name: string;                            // Display name
  description: string;                     // What the upgrade does
  cost: number;                            // Scrap cost to purchase
  effectType: 'scrapMultiplier' | 'petBonus'; // Type of effect
  effectValue: number;                     // Magnitude of effect
  category?: 'scrapEfficiency' | 'petAcquisition'; // Optional categorization
}

interface UpgradesState {
  purchasedUpgradeIds: string[];           // Array of purchased upgrade IDs
}

// Computed values (not stored)
interface UpgradeEffects {
  totalScrapMultiplier: number;            // Sum of scrapMultiplier effectValues
  totalPetBonus: number;                   // Sum of petBonus effectValues
}
```

**AsyncStorage Schema:**
```typescript
// Purchased upgrades persistence
{
  key: "purchased-upgrades-v1",
  value: '["scrap-boost-1", "pet-boost-1"]'  // JSON stringified string array
}

// Scrap persistence (existing)
{
  key: "scrap-total-v1",
  value: "1234"
}

// Pet count persistence (existing)
{
  key: "singularity-pet-count-v1",
  value: "5"
}
```

**Example Upgrade Objects:**
```typescript
const SCRAP_BOOST_1: Upgrade = {
  id: 'scrap-boost-1',
  name: 'Scrap Finder',
  description: '+10% scrap generation from AI Pets',
  cost: 100,
  effectType: 'scrapMultiplier',
  effectValue: 0.1,  // Represents +10% (multiply by 1.1)
  category: 'scrapEfficiency'
};

const PET_BOOST_1: Upgrade = {
  id: 'pet-boost-1',
  name: 'Extra Feed',
  description: '+1 AI Pet per feed button press',
  cost: 200,
  effectType: 'petBonus',
  effectValue: 1,    // Represents +1 pet
  category: 'petAcquisition'
};
```

### Data Access Patterns

**Read Pattern (Shop Screen Load)**:
```typescript
// On ShopScreen mount:
1. useUpgrades hook initializes
2. AsyncStorage.getItem('purchased-upgrades-v1')
3. Parse JSON to string[]
4. Initialize purchasedUpgradeIds$ observable
5. Compute availableUpgrades$ = all upgrades filtered by purchased IDs
6. Render FlatList with availableUpgrades$
```

**Write Pattern (Purchase Transaction)**:
```typescript
// On purchase button press:
1. Validate: scrap$.get() >= upgrade.cost
2. Validate: !purchasedUpgradeIds$.get().includes(upgrade.id)
3. If valid:
   a. scrap$.set(prev => prev - upgrade.cost)
   b. purchasedUpgradeIds$.set(prev => [...prev, upgrade.id])
4. Debounced persist triggered (1s delay)
5. AsyncStorage.setItem('purchased-upgrades-v1', JSON.stringify(ids))
6. AsyncStorage.setItem('scrap-total-v1', JSON.stringify(scrap))
```

**Effect Application Pattern (Gameplay Integration)**:
```typescript
// On generation tick or feed button press:
1. Read totalScrapMultiplier$.get() or totalPetBonus$.get()
2. Apply to calculation:
   - Scrap: scrapToAdd = petCount * 1 * (1 + totalScrapMultiplier)
   - Pet: newPetCount = currentPetCount + 1 + totalPetBonus
3. Update state with calculated value
```

**Computed Observable Patterns**:
```typescript
// availableUpgrades$
const availableUpgrades$ = computed(() => {
  const purchased = purchasedUpgradeIds$.get();
  return UPGRADE_DEFINITIONS.filter(u => !purchased.includes(u.id));
});

// totalScrapMultiplier$
const totalScrapMultiplier$ = computed(() => {
  const purchased = purchasedUpgradeIds$.get();
  const scrapUpgrades = UPGRADE_DEFINITIONS.filter(
    u => purchased.includes(u.id) && u.effectType === 'scrapMultiplier'
  );
  return scrapUpgrades.reduce((sum, u) => sum + u.effectValue, 0);
});

// totalPetBonus$
const totalPetBonus$ = computed(() => {
  const purchased = purchasedUpgradeIds$.get();
  const petUpgrades = UPGRADE_DEFINITIONS.filter(
    u => purchased.includes(u.id) && u.effectType === 'petBonus'
  );
  return petUpgrades.reduce((sum, u) => sum + u.effectValue, 0);
});
```

### Data Consistency

**Approach**: Optimistic UI with eventual persistence and atomic transactions

**Purchase Transaction Atomicity**:
- Both scrap deduction and ID addition happen in single function
- If either fails, neither persists (no partial states)
- Observable updates are synchronous
- AsyncStorage persistence is asynchronous but eventual

**Error Handling**:
- AsyncStorage read failure: Default to empty array `[]`, log error
- AsyncStorage write failure: Continue in-memory, log error, retry on next update
- Invalid upgrade ID: Return false from purchase, no state change
- Insufficient scrap: Return false from purchase, no state change
- Duplicate purchase attempt: Return false, no state change

**Edge Cases**:
- Rapid purchase attempts: Synchronous validation prevents double-purchase
- App crash mid-purchase: Last persisted state restored (up to 1 second lag acceptable)
- Scrap underflow: Validation prevents negative scrap
- Invalid upgrade IDs in storage: Filter out unknown IDs on load
- Upgrade effects stacking: Effects sum correctly with reduce operations

**Circular Dependency Resolution**:
- Issue: `useScrapGeneration` owns `scrap$`, but `useUpgrades` needs `scrap$`
- Solution 1: Extract `scrap$` to shared module, both hooks import it
- Solution 2: Pass `scrap$` as parameter to `useUpgrades`
- Chosen: Solution 2 (parameter passing) - maintains module ownership, clearer dependencies

---

## 7. Security Design

### Authentication & Authorization

**Not Applicable**: Single-user offline app with no authentication requirements.

### Data Security

**Encryption at Rest**:
- Not implemented (upgrade purchases are non-sensitive game data)
- AsyncStorage uses platform defaults (iOS Keychain, Android SharedPreferences)

**Encryption in Transit**:
- Not applicable (no network communication)

**PII Handling**:
- No personally identifiable information collected or stored

**Audit Logging**:
- Not required (simple game mechanic, no compliance needs)

### Security Controls

**Input Validation**:
- Purchase validation: scrap amount, upgrade ID validity, duplicate check
- All purchase inputs validated before executing transaction
- No user-provided data stored (only predefined upgrade IDs)

**Rate Limiting**:
- Not applicable (local-only operations)

**CORS Policies**:
- Not applicable (no API endpoints)

**Security Headers**:
- Not applicable (no web server)

---

## 8. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools

- **Framework**: React Native Testing Library v13+ (already in project)
- **Test Runner**: Jest 29+ with React Native preset
- **Mocking**: Jest built-in mocking for AsyncStorage and timers
- **Assertions**: `@testing-library/jest-native` extended matchers
- **User Events**: `@testing-library/user-event` for realistic interactions

**Reference**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`

**Important**: Use `cmd.exe` to run jest tests due to WSL/Windows performance issues (per CLAUDE.md)

#### TDD Implementation Process

For each feature/component, follow this strict order:

**1. RED Phase - Write Failing Test First**
**2. GREEN Phase - Minimal Implementation**
**3. REFACTOR Phase - Improve Code**

### App-Level Integration Testing (TDD Zero Layer - MANDATORY FIRST)

**CRITICAL**: Before implementing shop features, write integration tests at the App/ClickerScreen/ShopScreen level that validate complete user experience.

#### Required Integration Tests

**App.test.tsx** (NEW):
```typescript
import { render, screen, waitFor } from '@testing-library/react-native';
import { userEvent } from '@testing-library/user-event';
import App from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('App Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  test('starts on clicker screen', () => {
    render(<App />);

    // Verify clicker screen is visible
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('navigates to shop when shop button pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      // Verify shop screen is visible
      expect(screen.getByText(/available upgrades/i)).toBeTruthy();
    });
  });

  test('navigates back to clicker when back button pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      expect(screen.getByText(/available upgrades/i)).toBeTruthy();
    });

    // Navigate back
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.press(backButton);

    await waitFor(() => {
      // Verify back on clicker screen
      expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
    });
  });
});
```

**ShopScreen.test.tsx Integration Tests** (NEW):
```typescript
import { render, screen, waitFor } from '@testing-library/react-native';
import { userEvent } from '@testing-library/user-event';
import { ShopScreen } from './ShopScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../scrap/useScrapGeneration');
jest.mock('../attack-button/usePersistedCounter');

describe('ShopScreen Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  test('displays scrap balance', async () => {
    // Mock scrap$ observable
    const mockScrap$ = { get: jest.fn(() => 500) };
    require('../scrap/useScrapGeneration').useScrapGeneration.mockReturnValue({
      scrap$: mockScrap$
    });

    render(<ShopScreen />);

    await waitFor(() => {
      expect(screen.getByText(/scrap.*500/i)).toBeTruthy();
    });
  });

  test('displays available upgrades', async () => {
    render(<ShopScreen />);

    await waitFor(() => {
      // Verify at least one upgrade shows
      expect(screen.getByText(/Scrap Finder/i)).toBeTruthy();
      expect(screen.getByText(/cost.*100/i)).toBeTruthy();
    });
  });

  test('purchase button disabled when insufficient scrap', async () => {
    // Mock low scrap balance
    const mockScrap$ = { get: jest.fn(() => 50) };
    require('../scrap/useScrapGeneration').useScrapGeneration.mockReturnValue({
      scrap$: mockScrap$
    });

    render(<ShopScreen />);

    await waitFor(() => {
      const purchaseButtons = screen.getAllByRole('button', { name: /purchase/i });
      // Find the expensive upgrade button
      const expensiveButton = purchaseButtons.find(btn => {
        const parent = btn.parent;
        return parent?.findByText(/cost.*100/i);
      });
      expect(expensiveButton?.props.disabled).toBe(true);
    });
  });

  test('completes purchase flow successfully', async () => {
    const user = userEvent.setup();

    // Mock sufficient scrap
    const mockScrap$ = {
      get: jest.fn(() => 500),
      set: jest.fn()
    };
    require('../scrap/useScrapGeneration').useScrapGeneration.mockReturnValue({
      scrap$: mockScrap$
    });

    render(<ShopScreen />);

    // Find and press affordable upgrade purchase button
    const purchaseButton = screen.getByRole('button', { name: /purchase.*scrap finder/i });
    await user.press(purchaseButton);

    await waitFor(() => {
      // Verify scrap deducted
      expect(mockScrap$.set).toHaveBeenCalled();

      // Verify upgrade removed from list
      expect(screen.queryByText(/Scrap Finder/i)).toBeNull();
    });
  });
});
```

### Unit Testing (TDD First Layer)

**useNavigation.test.ts** (NEW):
```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useNavigation } from './useNavigation';

describe('useNavigation Hook', () => {
  test('initializes to clicker screen', () => {
    const { result } = renderHook(() => useNavigation());

    expect(result.current.currentScreen$.get()).toBe('clicker');
  });

  test('navigates to shop', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.actions.navigateToShop();
    });

    expect(result.current.currentScreen$.get()).toBe('shop');
  });

  test('navigates back to clicker', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.actions.navigateToShop();
    });

    expect(result.current.currentScreen$.get()).toBe('shop');

    act(() => {
      result.current.actions.navigateToClicker();
    });

    expect(result.current.currentScreen$.get()).toBe('clicker');
  });
});
```

**useUpgrades.test.ts** (NEW):
```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUpgrades } from './useUpgrades';
import { observable } from '@legendapp/state';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('useUpgrades Hook', () => {
  let scrap$: any;

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    scrap$ = observable(500); // Start with 500 scrap
  });

  test('initializes with no purchased upgrades', async () => {
    const { result } = renderHook(() => useUpgrades(scrap$));

    await waitFor(() => {
      expect(result.current.purchasedUpgradeIds$.get()).toEqual([]);
    });
  });

  test('loads persisted purchased upgrades', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(['scrap-boost-1'])
    );

    const { result } = renderHook(() => useUpgrades(scrap$));

    await waitFor(() => {
      expect(result.current.purchasedUpgradeIds$.get()).toEqual(['scrap-boost-1']);
    });
  });

  test('computes available upgrades excluding purchased', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(['scrap-boost-1'])
    );

    const { result } = renderHook(() => useUpgrades(scrap$));

    await waitFor(() => {
      const available = result.current.availableUpgrades$.get();
      expect(available.find(u => u.id === 'scrap-boost-1')).toBeUndefined();
      expect(available.length).toBeGreaterThan(0); // Still has other upgrades
    });
  });

  test('successfully purchases affordable upgrade', async () => {
    const { result } = renderHook(() => useUpgrades(scrap$));

    const initialScrap = scrap$.get();
    const upgradeId = 'scrap-boost-1'; // Cost: 100

    let success;
    act(() => {
      success = result.current.actions.purchase(upgradeId);
    });

    await waitFor(() => {
      expect(success).toBe(true);
      expect(scrap$.get()).toBe(initialScrap - 100);
      expect(result.current.purchasedUpgradeIds$.get()).toContain(upgradeId);
    });
  });

  test('rejects purchase with insufficient scrap', async () => {
    scrap$.set(50); // Only 50 scrap
    const { result } = renderHook(() => useUpgrades(scrap$));

    let success;
    act(() => {
      success = result.current.actions.purchase('scrap-boost-1'); // Cost: 100
    });

    await waitFor(() => {
      expect(success).toBe(false);
      expect(scrap$.get()).toBe(50); // Scrap unchanged
      expect(result.current.purchasedUpgradeIds$.get()).not.toContain('scrap-boost-1');
    });
  });

  test('rejects duplicate purchase', async () => {
    const { result } = renderHook(() => useUpgrades(scrap$));

    // First purchase
    act(() => {
      result.current.actions.purchase('scrap-boost-1');
    });

    await waitFor(() => {
      expect(result.current.purchasedUpgradeIds$.get()).toContain('scrap-boost-1');
    });

    const scrapAfterFirst = scrap$.get();

    // Attempt second purchase
    let success;
    act(() => {
      success = result.current.actions.purchase('scrap-boost-1');
    });

    await waitFor(() => {
      expect(success).toBe(false);
      expect(scrap$.get()).toBe(scrapAfterFirst); // Scrap unchanged
    });
  });

  test('calculates total scrap multiplier', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(['scrap-boost-1']) // +0.1 multiplier
    );

    const { result } = renderHook(() => useUpgrades(scrap$));

    await waitFor(() => {
      expect(result.current.totalScrapMultiplier$.get()).toBe(0.1);
    });
  });

  test('calculates total pet bonus', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(['pet-boost-1']) // +1 bonus
    );

    const { result } = renderHook(() => useUpgrades(scrap$));

    await waitFor(() => {
      expect(result.current.totalPetBonus$.get()).toBe(1);
    });
  });

  test('persists purchased upgrades to AsyncStorage', async () => {
    const { result } = renderHook(() => useUpgrades(scrap$));

    act(() => {
      result.current.actions.purchase('scrap-boost-1');
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'purchased-upgrades-v1',
        JSON.stringify(['scrap-boost-1'])
      );
    }, { timeout: 2000 });
  });
});
```

**UpgradeListItem.test.tsx** (NEW):
```typescript
import { render, screen } from '@testing-library/react-native';
import { userEvent } from '@testing-library/user-event';
import { observable } from '@legendapp/state';
import { UpgradeListItem } from './UpgradeListItem';
import type { Upgrade } from './upgradeDefinitions';

describe('UpgradeListItem Component', () => {
  const mockUpgrade: Upgrade = {
    id: 'test-upgrade',
    name: 'Test Upgrade',
    description: 'Test description',
    cost: 100,
    effectType: 'scrapMultiplier',
    effectValue: 0.1,
    category: 'scrapEfficiency'
  };

  test('displays upgrade information', () => {
    const isAffordable$ = observable(true);
    const onPurchase = jest.fn();

    render(
      <UpgradeListItem
        upgrade={mockUpgrade}
        isAffordable$={isAffordable$}
        onPurchase={onPurchase}
      />
    );

    expect(screen.getByText('Test Upgrade')).toBeTruthy();
    expect(screen.getByText(/Test description/i)).toBeTruthy();
    expect(screen.getByText(/100/)).toBeTruthy();
  });

  test('purchase button enabled when affordable', () => {
    const isAffordable$ = observable(true);
    const onPurchase = jest.fn();

    render(
      <UpgradeListItem
        upgrade={mockUpgrade}
        isAffordable$={isAffordable$}
        onPurchase={onPurchase}
      />
    );

    const button = screen.getByRole('button', { name: /purchase/i });
    expect(button.props.disabled).toBeFalsy();
  });

  test('purchase button disabled when unaffordable', () => {
    const isAffordable$ = observable(false);
    const onPurchase = jest.fn();

    render(
      <UpgradeListItem
        upgrade={mockUpgrade}
        isAffordable$={isAffordable$}
        onPurchase={onPurchase}
      />
    );

    const button = screen.getByRole('button', { name: /purchase/i });
    expect(button.props.disabled).toBeTruthy();
  });

  test('calls onPurchase with upgrade ID when button pressed', async () => {
    const user = userEvent.setup();
    const isAffordable$ = observable(true);
    const onPurchase = jest.fn();

    render(
      <UpgradeListItem
        upgrade={mockUpgrade}
        isAffordable$={isAffordable$}
        onPurchase={onPurchase}
      />
    );

    const button = screen.getByRole('button', { name: /purchase/i });
    await user.press(button);

    expect(onPurchase).toHaveBeenCalledWith('test-upgrade');
  });

  test('shows visual indicator for scrapMultiplier type', () => {
    const isAffordable$ = observable(true);
    const onPurchase = jest.fn();

    render(
      <UpgradeListItem
        upgrade={{ ...mockUpgrade, effectType: 'scrapMultiplier' }}
        isAffordable$={isAffordable$}
        onPurchase={onPurchase}
      />
    );

    // Verify scrap efficiency visual (icon/color)
    // Implementation-specific test
    expect(screen.getByTestId('upgrade-type-indicator')).toHaveStyle({
      backgroundColor: expect.stringContaining('#') // Some color
    });
  });
});
```

### Component Integration Testing (TDD Second Layer)

**ClickerScreen.test.tsx (UPDATED)**:
```typescript
// Add to existing tests:

describe('ClickerScreen Shop Integration', () => {
  test('displays shop navigation button', () => {
    render(<ClickerScreen />);

    expect(screen.getByRole('button', { name: /shop/i })).toBeTruthy();
  });

  test('shop button triggers navigation', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    // Verify navigation action called (mock useNavigation hook)
    expect(mockNavigateToShop).toHaveBeenCalled();
  });

  test('feed button applies pet bonus from upgrades', async () => {
    const user = userEvent.setup();

    // Mock purchased pet bonus upgrade
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'purchased-upgrades-v1') {
        return Promise.resolve(JSON.stringify(['pet-boost-1'])); // +1 bonus
      }
      return Promise.resolve(null);
    });

    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
    });

    const feedButton = screen.getByRole('button', { name: /feed/i });
    await user.press(feedButton);

    await waitFor(() => {
      // Should increase by 2 (1 base + 1 bonus)
      expect(screen.getByText(/Singularity Pet Count: 2/i)).toBeTruthy();
    });
  });
});
```

**useScrapGeneration.test.ts (UPDATED)**:
```typescript
// Add to existing tests:

describe('useScrapGeneration Multiplier Integration', () => {
  test('applies scrap multiplier from upgrades', async () => {
    jest.useFakeTimers();

    // Mock purchased scrap multiplier upgrade
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'purchased-upgrades-v1') {
        return Promise.resolve(JSON.stringify(['scrap-boost-1'])); // +0.1 (10%)
      }
      return Promise.resolve(null);
    });

    const petCount$ = observable(10);
    const { result } = renderHook(() => useScrapGeneration(petCount$));

    const initialScrap = result.current.scrap$.get();

    // Advance 1 second
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      // Base: 10 pets * 1 scrap/sec = 10
      // With 10% multiplier: 10 * 1.1 = 11
      expect(result.current.scrap$.get()).toBe(initialScrap + 11);
    });

    jest.useRealTimers();
  });

  test('stacks multiple scrap multipliers', async () => {
    jest.useFakeTimers();

    // Mock two scrap multiplier upgrades
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'purchased-upgrades-v1') {
        return Promise.resolve(JSON.stringify(['scrap-boost-1', 'scrap-boost-2'])); // +0.1 + 0.15 = +0.25
      }
      return Promise.resolve(null);
    });

    const petCount$ = observable(10);
    const { result } = renderHook(() => useScrapGeneration(petCount$));

    const initialScrap = result.current.scrap$.get();

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      // Base: 10 * 1 = 10
      // With 25% multiplier: 10 * 1.25 = 12.5 (rounded to 13)
      const expected = initialScrap + Math.round(10 * 1.25);
      expect(result.current.scrap$.get()).toBe(expected);
    });

    jest.useRealTimers();
  });
});
```

### End-to-End Testing (TDD Third Layer)

**E2E: Complete Shop Purchase Flow**:
```typescript
describe('Complete Shop Purchase E2E Flow', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  test('full flow from clicker to purchase to gameplay effect', async () => {
    // Render app
    render(<App />);

    // Verify starting state
    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
      expect(screen.getByText(/Scrap: 0/i)).toBeTruthy();
    });

    // Add pets and generate scrap
    const feedButton = screen.getByRole('button', { name: /feed/i });
    for (let i = 0; i < 5; i++) {
      await user.press(feedButton);
    }

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 5/i)).toBeTruthy();
    });

    // Wait for scrap generation (need enough for purchase)
    jest.useFakeTimers();
    for (let i = 0; i < 30; i++) {
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        // Each tick: 5 pets * 1 scrap = 5 scrap
        const expectedScrap = (i + 1) * 5;
        expect(screen.getByText(new RegExp(`Scrap.*${expectedScrap}`, 'i'))).toBeTruthy();
      });
    }
    // Now have 150 scrap

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      expect(screen.getByText(/available upgrades/i)).toBeTruthy();
      expect(screen.getByText(/Scrap.*150/i)).toBeTruthy();
    });

    // Purchase scrap multiplier upgrade (cost: 100)
    const purchaseButton = screen.getByRole('button', { name: /purchase.*scrap finder/i });
    await user.press(purchaseButton);

    await waitFor(() => {
      // Scrap reduced
      expect(screen.getByText(/Scrap.*50/i)).toBeTruthy();
      // Upgrade removed from list
      expect(screen.queryByText(/Scrap Finder/i)).toBeNull();
    });

    // Navigate back to clicker
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.press(backButton);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
    });

    // Verify scrap generation now boosted
    const scrapBefore = 50;
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      // Base: 5 pets * 1 = 5
      // With 10% multiplier: 5 * 1.1 = 5.5 (rounded to 6)
      const expectedIncrease = Math.round(5 * 1.1);
      const expectedScrap = scrapBefore + expectedIncrease;
      expect(screen.getByText(new RegExp(`Scrap.*${expectedScrap}`, 'i'))).toBeTruthy();
    });

    jest.useRealTimers();
  });

  test('persistence across app restarts', async () => {
    // Session 1: Purchase upgrade
    const { unmount } = render(<App />);

    // Set up initial state (have scrap and pets)
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'singularity-pet-count-v1') return Promise.resolve('5');
      if (key === 'scrap-total-v1') return Promise.resolve('200');
      return Promise.resolve(null);
    });

    // Navigate to shop and purchase
    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    const purchaseButton = screen.getByRole('button', { name: /purchase.*scrap finder/i });
    await user.press(purchaseButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'purchased-upgrades-v1',
        JSON.stringify(['scrap-boost-1'])
      );
    });

    unmount();

    // Session 2: Verify upgrade persisted
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'singularity-pet-count-v1') return Promise.resolve('5');
      if (key === 'scrap-total-v1') return Promise.resolve('100'); // After purchase
      if (key === 'purchased-upgrades-v1') return Promise.resolve(JSON.stringify(['scrap-boost-1']));
      return Promise.resolve(null);
    });

    render(<App />);

    // Navigate to shop
    const shopButton2 = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton2);

    await waitFor(() => {
      // Purchased upgrade should not appear
      expect(screen.queryByText(/Scrap Finder/i)).toBeNull();
    });

    // Navigate back and verify effect still applies
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.press(backButton);

    jest.useFakeTimers();
    const scrapBefore = 100;
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      // Multiplier still active: 5 * 1.1 = 5.5 -> 6
      expect(screen.getByText(/Scrap.*106/i)).toBeTruthy();
    });

    jest.useRealTimers();
  });
});
```

### TDD Checklist for Each Component

- [ ] First test written before any implementation code
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns
- [ ] No testIds except for style verification
- [ ] Tests query by user-visible content (getByText, getByRole)
- [ ] Async operations use waitFor or findBy queries
- [ ] Timer-dependent tests use jest.useFakeTimers()
- [ ] All tests pass before next feature
- [ ] Coverage >90% for new shop code

---

## 9. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|---------------|---------------|
| Runtime | Expo SDK 54 | Project standard, includes all required dependencies |
| Storage | AsyncStorage | Built-in persistent key-value storage for React Native |
| State Management | Legend-State v3 | Fine-grained reactivity with sub-50ms updates |
| Testing | Jest + RNTL | React Native standard testing stack |
| Navigation | State-based (custom) | Simple conditional rendering, no external library needed |

### Deployment Architecture

**Environment Strategy:**
- Development: `npm start` (Expo Go app)
- Testing: `npm test` via `cmd.exe` (Jest test runner, WSL performance workaround)
- Production: Native builds via `eas build` (future consideration)

**No CI/CD pipeline** required for initial implementation (local development only).

### Monitoring & Observability

#### Metrics

**Application Metrics:**
- Shop open latency: Performance.now() measurements in tests
- Purchase transaction latency: Test assertions verify <100ms
- Upgrade list rendering: FlatList performance with 50+ items
- Navigation transition time: Manual timing during development

**Business Metrics** (aligned with PRD):
- Purchase success rate: 100% of valid purchases (test coverage)
- Purchase rejection rate: 100% of invalid purchases prevented (test coverage)
- Persistence success rate: AsyncStorage mock verification

#### Logging

**Log Levels:**
- Error: AsyncStorage failures, purchase validation failures, invalid upgrade IDs (console.error)
- Warning: None required initially
- Info: None required initially

**Log Retention:**
- Development: Console only (no persistence)
- Production: Not applicable (no backend)

#### Alerting

No automated alerting required for single-user offline app.

---

## 10. Scalability & Performance

### Performance Requirements

**Response Time Targets:**
- Shop screen open: <300ms (PRD NFR-2.1)
  - Implementation: Simple conditional rendering, no heavy initialization

- Purchase transaction: <100ms (PRD NFR-2.2)
  - Implementation: Synchronous observable updates, simple validation

- Upgrade list rendering: Smooth with 50+ upgrades (PRD NFR-2.3)
  - Implementation: FlatList virtualization, optimized item components

**Throughput:**
- Purchase transactions: Sequential (one at a time, synchronous validation)
  - Implementation: Validation prevents concurrent purchases

**Concurrent Users:**
- Single user (offline app, no multi-user support)

### Scalability Strategy

**Upgrade System Scaling:**
- Current: 2-3 sample upgrades for testing/MVP
- Target: Support 100+ upgrades without performance degradation
- Implementation: FlatList handles virtualization automatically
- Extensibility: Add new upgrades to definitions array, no code changes

**Future Considerations:**
- Upgrade categories/tabs: Group upgrades by category in UI
- Upgrade prerequisites: Add `requiredUpgradeIds` to interface
- Tiered upgrades: Support multiple levels of same upgrade
- Alternative currencies: Extend cost/payment system

### Performance Optimization

**Rendering Optimizations:**
- FlatList virtualization: Only render visible upgrades
- Fine-grained reactivity: Only upgrade items with affordability changes re-render
- Memoized components: UpgradeListItem wrapped in Memo
- Computed observables: Cached calculations for totals

**State Management Optimizations:**
- Module-level singletons: Avoid creating observables on each render
- Debounced persistence: Reduce AsyncStorage writes
- Atomic updates: Single transaction for purchase state changes

**Performance Benchmarks:**
- Shop screen open: <300ms (test with Performance.now())
- Purchase validation: <10ms (simple checks)
- Purchase transaction: <100ms (observable updates + AsyncStorage)
- Upgrade list scroll: 60fps maintained (manual testing)

---

## 11. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Circular dependency between hooks (useScrapGeneration ↔ useUpgrades) | High | High | Extract scrap$ to shared module OR pass as parameter (chosen: parameter) | Dev |
| Purchase validation race conditions | Medium | Low | Synchronous observable updates, atomic transactions | Dev |
| AsyncStorage write failures lose purchase data | Medium | Low | Graceful degradation: continue in-memory, retry on next update | Dev |
| Upgrade effects not applying correctly | High | Medium | Comprehensive integration tests, verify computed observables | Dev |
| Navigation state loss on app crash | Low | Low | Always start on clicker screen (no persistence needed) | Dev |
| FlatList performance with many upgrades | Medium | Low | Use FlatList (virtualized), test with 100+ items | Dev |
| Scrap underflow from concurrent purchases | High | Low | Validation before deduction, synchronous updates | Dev |

### Dependencies

**Legend-State v3 (beta):**
- Impact: Core state management dependency (shared with existing features)
- Mitigation: Already in use and stable, monitor changelog for breaking changes
- Status: 🟡 Monitor (beta software, but production-ready per existing usage)

**AsyncStorage:**
- Impact: Persistence layer (shared with existing features)
- Mitigation: Already stable and included in Expo SDK 54
- Status: ✅ Green

**React Native 0.81 (Expo SDK 54):**
- Impact: Platform runtime (shared with existing app)
- Mitigation: Expo SDK provides tested compatibility
- Status: ✅ Green

**No External Navigation Library:**
- Impact: Simple state-based navigation reduces dependencies
- Mitigation: Custom implementation, full control, easy to maintain
- Status: ✅ Green

---

## 12. Implementation Plan (TDD-Driven)

Following `/mnt/c/dev/class-one-rapids/docs/architecture/lean-task-generation-guide.md` principles - prioritize user-visible functionality:

### Phase 1: Foundation & Navigation [1 day]

**Task 1.1: Implement Navigation System with TDD** [0.5 days]

**TDD Cycle:**

1. **RED - Write Failing Tests First**:
   ```typescript
   // App.test.tsx
   test('navigates to shop when shop button pressed', async () => {
     const user = userEvent.setup();
     render(<App />);

     const shopButton = screen.getByRole('button', { name: /shop/i });
     await user.press(shopButton);

     await waitFor(() => {
       expect(screen.getByText(/available upgrades/i)).toBeTruthy();
     });
   });
   ```

2. **GREEN - Minimal Implementation**:
   - Create `useNavigation.ts` hook with currentScreen$ observable
   - Update App.tsx with conditional rendering
   - Add shop button to ClickerScreen
   - Create minimal ShopScreen (just "Available Upgrades" text)

3. **REFACTOR - Polish**:
   - Extract styles
   - Add accessibility labels
   - Ensure clean component structure

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useNavigation.ts`
- `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useNavigation.test.ts`
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`

**Files Updated**:
- `/mnt/c/dev/class-one-rapids/frontend/App.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`

**Deliverable**: Working navigation between clicker and shop screens

---

**Task 1.2: Create Upgrade Data Definitions** [0.5 days]

**TDD Cycle:**

1. **RED - Write Tests**:
   ```typescript
   // upgradeDefinitions.test.ts
   test('all upgrades have unique IDs', () => {
     const ids = UPGRADE_DEFINITIONS.map(u => u.id);
     const uniqueIds = new Set(ids);
     expect(uniqueIds.size).toBe(ids.length);
   });
   ```

2. **GREEN - Implementation**:
   - Create TypeScript interface for Upgrade
   - Define 2-3 sample upgrades (for testing/demo)
   - Export UPGRADE_DEFINITIONS array

3. **REFACTOR**:
   - Add JSDoc comments
   - Organize by category
   - Ensure balanced costs/effects

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.ts`
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.test.ts`

**Deliverable**: Centralized upgrade data with validation

---

### Phase 2: Upgrade Display & State Management [1.5 days]

**Task 2.1: Implement useUpgrades Hook with TDD** [0.75 days]

**TDD Cycle:**

1. **RED - Write Failing Tests**:
   ```typescript
   // useUpgrades.test.ts
   test('successfully purchases affordable upgrade', async () => {
     const scrap$ = observable(500);
     const { result } = renderHook(() => useUpgrades(scrap$));

     let success;
     act(() => {
       success = result.current.actions.purchase('scrap-boost-1');
     });

     await waitFor(() => {
       expect(success).toBe(true);
       expect(scrap$.get()).toBe(400); // Cost: 100
       expect(result.current.purchasedUpgradeIds$.get()).toContain('scrap-boost-1');
     });
   });
   ```

2. **GREEN - Implementation**:
   - Create `useUpgrades.ts` with module-level purchasedUpgradeIds$ observable
   - Implement persist configuration for AsyncStorage
   - Implement purchase validation logic
   - Implement purchase transaction (deduct scrap, add ID)
   - Implement computed observables for effects

3. **REFACTOR**:
   - Extract validation into separate functions
   - Add error handling
   - Clean up computed observable logic

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgrades.ts`
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgrades.test.ts`

**Deliverable**: Working upgrade purchase logic with persistence

---

**Task 2.2: Build Upgrade List UI Components with TDD** [0.75 days]

**TDD Cycle:**

1. **RED - Write Tests**:
   ```typescript
   // ShopScreen.test.tsx
   test('displays available upgrades', async () => {
     render(<ShopScreen />);

     await waitFor(() => {
       expect(screen.getByText(/Scrap Finder/i)).toBeTruthy();
       expect(screen.getByText(/cost.*100/i)).toBeTruthy();
     });
   });
   ```

2. **GREEN - Implementation**:
   - Update ShopScreen with useUpgrades integration
   - Create UpgradeListItem component
   - Implement FlatList rendering of upgrades
   - Display scrap balance
   - Wire up purchase button handlers

3. **REFACTOR**:
   - Extract styles to StyleSheet
   - Add visual differentiation for effect types
   - Polish layout and spacing

**Files Updated**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/UpgradeListItem.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/UpgradeListItem.test.tsx`

**Deliverable**: Complete shop UI with upgrade list and purchase buttons

---

### Phase 3: Gameplay Integration [1 day]

**Task 3.1: Integrate Upgrade Effects into Scrap Generation with TDD** [0.5 days]

**TDD Cycle:**

1. **RED - Write Tests**:
   ```typescript
   // useScrapGeneration.test.ts (UPDATE)
   test('applies scrap multiplier from upgrades', async () => {
     jest.useFakeTimers();

     // Mock purchased upgrade
     (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
       if (key === 'purchased-upgrades-v1') return Promise.resolve('["scrap-boost-1"]');
       return Promise.resolve(null);
     });

     const petCount$ = observable(10);
     const { result } = renderHook(() => useScrapGeneration(petCount$));

     jest.advanceTimersByTime(1000);

     await waitFor(() => {
       // Base: 10 pets * 1 = 10
       // With 10% multiplier: 10 * 1.1 = 11
       expect(result.current.scrap$.get()).toBe(11);
     });
   });
   ```

2. **GREEN - Implementation**:
   - Import useUpgrades in useScrapGeneration
   - Get totalScrapMultiplier$ from useUpgrades
   - Modify generation calculation: `petCount * 1 * (1 + multiplier)`

3. **REFACTOR**:
   - Handle circular dependency (pass scrap$ as parameter)
   - Clean up calculation logic
   - Add comments explaining multiplier application

**Files Updated**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts`
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts`

**Deliverable**: Scrap generation applies upgrade multipliers

---

**Task 3.2: Integrate Upgrade Effects into Pet Increment with TDD** [0.5 days]

**TDD Cycle:**

1. **RED - Write Tests**:
   ```typescript
   // usePersistedCounter.test.ts (UPDATE)
   test('increment applies pet bonus from upgrades', async () => {
     // Mock purchased pet bonus upgrade
     (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
       if (key === 'purchased-upgrades-v1') return Promise.resolve('["pet-boost-1"]');
       return Promise.resolve(null);
     });

     const { result } = renderHook(() => usePersistedCounter());

     act(() => {
       result.current.actions.increment();
     });

     await waitFor(() => {
       // Should increase by 2 (1 base + 1 bonus)
       expect(result.current.count$.get()).toBe(2);
     });
   });
   ```

2. **GREEN - Implementation**:
   - Import useUpgrades in usePersistedCounter
   - Get totalPetBonus$ from useUpgrades
   - Modify increment: `count$.set(prev => prev + 1 + bonus)`

3. **REFACTOR**:
   - Handle dependency injection
   - Clean up increment logic
   - Add comments

**Files Updated**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts`
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.test.ts`

**Deliverable**: Pet increment applies upgrade bonuses

---

### Phase 4: Polish & Testing [0.5 days]

**Task 4.1: E2E Testing & Final Polish** [0.5 days]

**Activities:**
- Write complete E2E test for purchase flow
- Run full test suite via `cmd.exe` (WSL workaround)
- Generate coverage report: verify >90% for shop module
- Manual testing on device (iOS + Android)
- Verify accessibility attributes
- Polish visual styling
- Add any missing documentation

**Deliverable**: Production-ready shop system with comprehensive tests

---

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|-------------|------|--------------|
| M1 | Navigation working between screens | Day 0.5 | Task 1.1 complete |
| M2 | Upgrade definitions and data model | Day 1.0 | Task 1.2 complete |
| M3 | Shop UI displays upgrades | Day 2.0 | Task 2.1, 2.2 complete |
| M4 | Purchases persist and update state | Day 2.5 | Task 2.1, 2.2 complete |
| M5 | Upgrade effects apply to gameplay | Day 3.0 | Task 3.1, 3.2 complete |
| M6 | Full test coverage, production ready | Day 3.5 | Task 4.1 complete |

---

## 13. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| Navigation Implementation | React Navigation, Custom state-based | **Custom state-based** | Simple two-screen flow doesn't justify heavy library. Conditional rendering is performant and maintainable. |
| Upgrade Data Storage | Hardcoded in hooks, JSON file, TypeScript module | **TypeScript module** | Type-safe, easy to modify, no parsing overhead, supports comments and organization. |
| Purchase Validation | Client-only, Server-side (N/A) | **Client-only** | Offline single-player game, no server needed. All validation in hooks. |
| Upgrade Effect Application | Event-based, Computed observables | **Computed observables** | Reactive updates, no manual subscription management, automatic recalculation on purchases. |
| Scrap$ Dependency | Shared module, Parameter passing | **Parameter passing** | Clearer dependencies, maintains module ownership, avoids hidden global state. |
| Upgrade Categories | Enum, String union, Separate lists | **String union type** | Type-safe, flexible, easy to add new categories, no runtime overhead. |
| List Rendering | ScrollView, FlatList | **FlatList** | Virtualization supports 100+ upgrades per NFR-3.1, better performance, industry standard. |

### Trade-offs

**Trade-off 1**: Chose **simple state navigation** over React Navigation
- **Benefit**: Zero external dependencies, faster implementation, full control, <300ms transitions
- **Cost**: No built-in features (animations, deep linking, back handling)
- **Justification**: Two-screen app doesn't need complex routing. Can migrate to React Navigation if app grows.

**Trade-off 2**: Chose **centralized definitions file** over dynamic/fetched upgrades
- **Benefit**: Simple, type-safe, no loading states, works offline
- **Cost**: Requires app update to add upgrades (can't update remotely)
- **Justification**: PRD assumes offline game. Easy to add upgrades during development. Extensible for future server sync.

**Trade-off 3**: Chose **parameter passing for scrap$** over shared module
- **Benefit**: Explicit dependencies, clearer data flow, easier testing
- **Cost**: More parameters passed between hooks
- **Justification**: Avoids circular dependencies, maintains module encapsulation, follows functional patterns.

**Trade-off 4**: Chose **computed observables for effects** over event-based updates
- **Benefit**: Automatic reactivity, no manual subscriptions, always in sync
- **Cost**: Recalculates on every purchase (minor performance impact)
- **Justification**: Simple calculations (sum/filter), reactive pattern consistent with Legend-State, negligible performance cost.

**Trade-off 5**: Chose **visual affordability indicators** over purchase confirmation dialogs
- **Benefit**: Less UI friction, faster purchases, cleaner UX
- **Cost**: Possible accidental purchases
- **Justification**: PRD explicitly excludes confirmation dialogs (out of scope). Can add in future if user feedback indicates need.

---

## 14. Open Questions

Technical questions requiring resolution:

- [ ] How to handle circular dependency between useScrapGeneration and useUpgrades?
  - **Recommendation**: Pass scrap$ as parameter to useUpgrades
  - **Decision**: Implemented via parameter passing

- [ ] Should purchased upgrades be completely hidden or shown as "Owned"?
  - **Current**: PRD says "removed from available upgrades list OR clearly marked as owned"
  - **Recommendation**: Remove from list (simpler, cleaner UI for MVP)
  - **Decision Needed**: Before Task 2.2 implementation

- [ ] How should multiple upgrades of same type stack (additive vs multiplicative)?
  - **Current**: PRD says "effects stack if multiple upgrades of same type purchased"
  - **Recommendation**: Additive stacking (sum effectValue fields) for simplicity
  - **Decision Needed**: Before Task 3.1 implementation

- [ ] Should shop show "You have X scrap" or just the number?
  - **Recommendation**: Full text "Scrap: [formatted number]" for clarity
  - **Decision Needed**: Before Task 2.2 (UI implementation)

- [ ] What visual indicators for effect types (icons, colors, badges)?
  - **Recommendation**: Color-coded borders (blue for scrapMultiplier, green for petBonus)
  - **Decision Needed**: During Task 2.2 (UI implementation)

---

## 15. Appendices

### A. Technical Glossary

- **Upgrade**: Permanent enhancement purchased with scrap that improves game progression
- **Effect Type**: Category of upgrade benefit ('scrapMultiplier' or 'petBonus')
- **Effect Value**: Numeric magnitude of upgrade benefit (e.g., 0.1 for 10% boost)
- **Available Upgrade**: Upgrade that has not been purchased (visible in shop)
- **Purchased Upgrade**: Upgrade already bought (removed from shop, effect active)
- **Affordability**: Whether player has sufficient scrap to purchase specific upgrade
- **Atomic Transaction**: Purchase operation that completes entirely or not at all
- **Computed Observable**: Reactive value derived from other observables, auto-updates

### B. Reference Architecture

**Similar Patterns in Industry:**
- Cookie Clicker: Upgrade shop with various building/multiplier purchases
- AdVenture Capitalist: Tiered upgrades affecting production rates
- Idle Miner Tycoon: Shop system with equipment upgrades
- Realm Grinder: Multiple upgrade trees with stacking effects

**Legend-State Patterns:**
- Official Examples: https://legendapp.com/open-source/state/examples/
- Persist Plugin: https://legendapp.com/open-source/state/sync/persist-plugins/
- Computed Observables: https://legendapp.com/open-source/state/reactivity/#computed

### C. Related Documents

- **Product Requirements Document**: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/specs/prd_shop.md`
- **Scrap System TDD**: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/tdd_scrap.md`
- **Scrap System PRD**: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/prd_scrap.md`
- **Lean Task Generation Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/lean-task-generation-guide.md`
- **State Management Hooks Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/state-management-hooks-guide.md`
- **React Native UI Guidelines**: `/mnt/c/dev/class-one-rapids/docs/architecture/react-native-ui-guidelines.md`
- **React Native Testing Library Guide**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`

### D. Code Examples

**useNavigation Hook (Proposed Implementation)**:

```typescript
// /mnt/c/dev/class-one-rapids/frontend/shared/hooks/useNavigation.ts
import { useMemo } from 'react';
import { observable, Observable } from '@legendapp/state';

type Screen = 'clicker' | 'shop';

interface UseNavigationReturn {
  currentScreen$: Observable<Screen>;
  actions: {
    navigateToShop: () => void;
    navigateToClicker: () => void;
  };
}

// Module-level singleton (no persistence needed - always start on clicker)
const currentScreen$ = observable<Screen>('clicker');

/**
 * Hook for managing simple navigation state between screens.
 * No persistence - always starts on clicker screen.
 */
export function useNavigation(): UseNavigationReturn {
  return useMemo(() => {
    const actions = {
      navigateToShop: () => {
        currentScreen$.set('shop');
      },
      navigateToClicker: () => {
        currentScreen$.set('clicker');
      }
    };

    return {
      currentScreen$,
      actions
    };
  }, []);
}
```

**useUpgrades Hook (Proposed Implementation)**:

```typescript
// /mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgrades.ts
import { useMemo } from 'react';
import { observable, Observable, computed } from '@legendapp/state';
import { configureSynced, synced } from '@legendapp/state/sync';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UPGRADE_DEFINITIONS, Upgrade } from './upgradeDefinitions';

const persistPlugin = new ObservablePersistAsyncStorage({ AsyncStorage });

const persist = configureSynced(synced, {
  persist: {
    plugin: persistPlugin,
    retrySync: true,
  },
});

interface UseUpgradesReturn {
  purchasedUpgradeIds$: Observable<string[]>;
  availableUpgrades$: Observable<Upgrade[]>;
  totalScrapMultiplier$: Observable<number>;
  totalPetBonus$: Observable<number>;
  actions: {
    purchase: (upgradeId: string) => boolean;
  };
}

// Module-level persisted observable
const purchasedUpgradeIds$ = observable(
  persist({
    initial: [] as string[],
    persist: {
      name: 'purchased-upgrades-v1',
      debounceSet: 1000,
    },
  })
);

/**
 * Hook for managing upgrade purchase state and logic.
 *
 * @param scrap$ - Observable containing current scrap total
 * @returns Upgrade state and purchase actions
 */
export function useUpgrades(scrap$: Observable<number>): UseUpgradesReturn {
  return useMemo(() => {
    // Computed: available upgrades (not yet purchased)
    const availableUpgrades$ = computed(() => {
      const purchased = purchasedUpgradeIds$.get();
      return UPGRADE_DEFINITIONS.filter(u => !purchased.includes(u.id));
    });

    // Computed: total scrap multiplier from purchased upgrades
    const totalScrapMultiplier$ = computed(() => {
      const purchased = purchasedUpgradeIds$.get();
      const scrapUpgrades = UPGRADE_DEFINITIONS.filter(
        u => purchased.includes(u.id) && u.effectType === 'scrapMultiplier'
      );
      return scrapUpgrades.reduce((sum, u) => sum + u.effectValue, 0);
    });

    // Computed: total pet bonus from purchased upgrades
    const totalPetBonus$ = computed(() => {
      const purchased = purchasedUpgradeIds$.get();
      const petUpgrades = UPGRADE_DEFINITIONS.filter(
        u => purchased.includes(u.id) && u.effectType === 'petBonus'
      );
      return petUpgrades.reduce((sum, u) => sum + u.effectValue, 0);
    });

    // Actions
    const actions = {
      purchase: (upgradeId: string): boolean => {
        try {
          // Find upgrade
          const upgrade = UPGRADE_DEFINITIONS.find(u => u.id === upgradeId);
          if (!upgrade) {
            console.error(`Invalid upgrade ID: ${upgradeId}`);
            return false;
          }

          // Validate: sufficient scrap
          const currentScrap = scrap$.get();
          if (currentScrap < upgrade.cost) {
            console.log('Insufficient scrap for purchase');
            return false;
          }

          // Validate: not already purchased
          const purchased = purchasedUpgradeIds$.get();
          if (purchased.includes(upgradeId)) {
            console.log('Upgrade already purchased');
            return false;
          }

          // Execute transaction atomically
          scrap$.set((prev) => prev - upgrade.cost);
          purchasedUpgradeIds$.set((prev) => [...prev, upgradeId]);

          return true;
        } catch (error) {
          console.error('Purchase transaction error:', error);
          return false;
        }
      },
    };

    return {
      purchasedUpgradeIds$,
      availableUpgrades$,
      totalScrapMultiplier$,
      totalPetBonus$,
      actions,
    };
  }, [scrap$]);
}
```

**ShopScreen Component (Proposed Implementation)**:

```typescript
// /mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx
import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Memo, computed } from '@legendapp/state/react';
import { usePersistedCounter } from '../attack-button/usePersistedCounter';
import { useScrapGeneration } from '../scrap/useScrapGeneration';
import { useUpgrades } from './useUpgrades';
import { useNavigation } from '../../shared/hooks/useNavigation';
import { UpgradeListItem } from './UpgradeListItem';
import { formatNumber } from '../scrap/formatNumber';
import type { Upgrade } from './upgradeDefinitions';

/**
 * Shop screen where players can browse and purchase upgrades with scrap.
 */
export function ShopScreen() {
  const { count$ } = usePersistedCounter();
  const { scrap$ } = useScrapGeneration(count$);
  const { availableUpgrades$, actions } = useUpgrades(scrap$);
  const { actions: navActions } = useNavigation();

  const handlePurchase = (upgradeId: string) => {
    const success = actions.purchase(upgradeId);
    if (!success) {
      // Could show toast/alert in future
      console.log('Purchase failed');
    }
  };

  const renderUpgrade = ({ item }: { item: Upgrade }) => {
    const isAffordable$ = computed(() => scrap$.get() >= item.cost);

    return (
      <UpgradeListItem
        upgrade={item}
        isAffordable$={isAffordable$}
        onPurchase={handlePurchase}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={navActions.navigateToClicker}
          accessibilityRole="button"
          accessibilityLabel="Back to game"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <View style={styles.scrapBalance}>
          <Memo>
            {() => (
              <Text
                style={styles.scrapText}
                accessibilityRole="text"
                accessibilityLabel={`Current scrap: ${formatNumber(scrap$.get())}`}
              >
                Scrap: {formatNumber(scrap$.get())}
              </Text>
            )}
          </Memo>
        </View>
      </View>

      {/* Upgrade List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Available Upgrades</Text>

        <Memo>
          {() => {
            const upgrades = availableUpgrades$.get();

            if (upgrades.length === 0) {
              return (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    All upgrades purchased!
                  </Text>
                </View>
              );
            }

            return (
              <FlatList
                data={upgrades}
                renderItem={renderUpgrade}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
              />
            );
          }}
        </Memo>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  scrapBalance: {
    flex: 1,
    alignItems: 'flex-end',
  },
  scrapText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999999',
    textAlign: 'center',
  },
});
```

**UpgradeListItem Component (Proposed Implementation)**:

```typescript
// /mnt/c/dev/class-one-rapids/frontend/modules/shop/UpgradeListItem.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Memo } from '@legendapp/state/react';
import type { Observable } from '@legendapp/state';
import { formatNumber } from '../scrap/formatNumber';
import type { Upgrade } from './upgradeDefinitions';

interface UpgradeListItemProps {
  upgrade: Upgrade;
  isAffordable$: Observable<boolean>;
  onPurchase: (upgradeId: string) => void;
}

/**
 * Displays a single upgrade with purchase button.
 */
export function UpgradeListItem({
  upgrade,
  isAffordable$,
  onPurchase
}: UpgradeListItemProps) {
  const getTypeColor = () => {
    switch (upgrade.effectType) {
      case 'scrapMultiplier':
        return '#007AFF'; // Blue
      case 'petBonus':
        return '#34C759'; // Green
      default:
        return '#999999';
    }
  };

  const getTypeLabel = () => {
    switch (upgrade.effectType) {
      case 'scrapMultiplier':
        return 'Scrap Efficiency';
      case 'petBonus':
        return 'Pet Acquisition';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: getTypeColor() }]}>
      {/* Type Badge */}
      <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
        <Text style={styles.typeBadgeText}>{getTypeLabel()}</Text>
      </View>

      {/* Upgrade Info */}
      <View style={styles.infoSection}>
        <Text style={styles.name}>{upgrade.name}</Text>
        <Text style={styles.description}>{upgrade.description}</Text>
        <Text style={styles.cost}>Cost: {formatNumber(upgrade.cost)} scrap</Text>
      </View>

      {/* Purchase Button */}
      <Memo>
        {() => {
          const affordable = isAffordable$.get();

          return (
            <Pressable
              style={({ pressed }) => [
                styles.purchaseButton,
                !affordable && styles.purchaseButtonDisabled,
                pressed && affordable && styles.purchaseButtonPressed,
              ]}
              onPress={() => onPurchase(upgrade.id)}
              disabled={!affordable}
              accessibilityRole="button"
              accessibilityLabel={`Purchase ${upgrade.name}`}
              accessibilityState={{ disabled: !affordable }}
            >
              <Text
                style={[
                  styles.purchaseButtonText,
                  !affordable && styles.purchaseButtonTextDisabled,
                ]}
              >
                {affordable ? 'Purchase' : 'Too Expensive'}
              </Text>
            </Pressable>
          );
        }}
      </Memo>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoSection: {
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
    lineHeight: 20,
  },
  cost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  purchaseButton: {
    minWidth: 44,
    minHeight: 44,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonPressed: {
    opacity: 0.7,
  },
  purchaseButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  purchaseButtonTextDisabled: {
    color: '#999999',
  },
});
```

**upgradeDefinitions.ts (Proposed Implementation)**:

```typescript
// /mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.ts

/**
 * Upgrade effect types.
 * - scrapMultiplier: Increases scrap generated per AI Pet per second
 * - petBonus: Increases AI Pets gained per feed button press
 */
export type UpgradeEffectType = 'scrapMultiplier' | 'petBonus';

/**
 * Upgrade category for UI grouping.
 */
export type UpgradeCategory = 'scrapEfficiency' | 'petAcquisition';

/**
 * Upgrade definition structure.
 */
export interface Upgrade {
  /** Unique identifier for the upgrade */
  id: string;

  /** Display name shown to players */
  name: string;

  /** Description of what the upgrade does */
  description: string;

  /** Scrap cost to purchase */
  cost: number;

  /** Type of effect this upgrade provides */
  effectType: UpgradeEffectType;

  /** Magnitude of the effect (e.g., 0.1 for +10% multiplier, 1 for +1 pet) */
  effectValue: number;

  /** Optional category for UI organization */
  category?: UpgradeCategory;
}

/**
 * All available upgrades in the game.
 * Add new upgrades here - no code changes needed elsewhere.
 */
export const UPGRADE_DEFINITIONS: Upgrade[] = [
  // Scrap Efficiency Upgrades
  {
    id: 'scrap-boost-1',
    name: 'Scrap Finder',
    description: '+10% scrap generation from AI Pets',
    cost: 100,
    effectType: 'scrapMultiplier',
    effectValue: 0.1,
    category: 'scrapEfficiency',
  },
  {
    id: 'scrap-boost-2',
    name: 'Advanced Scrap Scanner',
    description: '+25% scrap generation from AI Pets',
    cost: 500,
    effectType: 'scrapMultiplier',
    effectValue: 0.25,
    category: 'scrapEfficiency',
  },

  // Pet Acquisition Upgrades
  {
    id: 'pet-boost-1',
    name: 'Extra Feed',
    description: '+1 AI Pet per feed button press',
    cost: 200,
    effectType: 'petBonus',
    effectValue: 1,
    category: 'petAcquisition',
  },
  {
    id: 'pet-boost-2',
    name: 'Super Feed',
    description: '+2 AI Pets per feed button press',
    cost: 750,
    effectType: 'petBonus',
    effectValue: 2,
    category: 'petAcquisition',
  },
];
```

---

*Generated from PRD: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/specs/prd_shop.md`*

*Generation Date: 2025-11-16*

*Total Estimated Implementation Time: 4.0 days*
