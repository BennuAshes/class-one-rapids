# Shop Screen Technical Design Document

## Document Control

| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude Code | 2025-11-16 | Draft | Initial TDD from PRD |

## Executive Summary

This technical design implements a dedicated shop screen accessible from the main game screen via navigation. The shop provides the infrastructure to display upgrades purchasable with scrap (the in-game currency), supporting two upgrade types: scrap-per-pet multipliers and pets-per-feed multipliers. The MVP establishes the foundation (screen navigation, UI layout, data structures) without pre-populating specific upgrade items, enabling iterative content addition based on gameplay balancing. This implementation follows the existing single-screen architecture pattern and integrates with the shared game state for scrap balance display.

## 1. Overview & Context

### Problem Statement

The application currently lacks a mechanism for players to spend accumulated scrap resources. Users need:
- A dedicated interface to view and purchase upgrades
- Clear navigation between the main game and shop screens
- Infrastructure supporting two upgrade types (scrap-per-pet and pets-per-feed)
- An empty state when no upgrades are defined (MVP requirement)
- Integration with the existing scrap balance system

### Solution Approach

We will implement a shop screen using:
- **Navigation**: Simple conditional rendering or React Navigation for screen switching
- **Shop Screen**: New component with empty state placeholder UI
- **Upgrade Data Structure**: TypeScript interfaces supporting both upgrade types
- **State Integration**: Display scrap balance from shared game state
- **UI Layout**: Scrollable list/grid supporting multiple upgrade items
- **Testing**: Component tests for navigation, empty state, and UI elements

This approach balances infrastructure completion with content flexibility: the shop framework is production-ready while upgrade definitions remain configurable for future iterations.

### Success Criteria

**Technical Metrics**:
- Navigation response time: < 100ms between screens
- UI render time: < 100ms for shop screen load
- Scrap balance accuracy: 100% sync with shared state
- Empty state visibility: Displays clear messaging when no upgrades exist
- Test coverage: > 80% for new code
- Accessibility compliance: WCAG AA (4.5:1 contrast, 44x44pt touch targets)
- Zero navigation regressions: Main screen tests still pass

## 2. Codebase Exploration & Integration Analysis

### Existing Components

**Exploration Results**: Found existing single-screen architecture with shared game state.

**App.tsx Current State** (`/mnt/c/dev/class-one-rapids/frontend/App.tsx`):
```typescript
// frontend/App.tsx (current)
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

**Key Integration Points**:
- Single screen architecture (no navigation yet)
- SafeAreaProvider already configured
- Direct import of ClickerScreen component
- Must add navigation logic to switch between ClickerScreen and ShopScreen

**ClickerScreen** (`/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`):
```typescript
// Simplified view of current implementation
export const ClickerScreen = observer(function ClickerScreen() {
  const { petCount$, scrap$, scrapRate$ } = useGameState();

  // Scrap generation timer
  useEffect(() => {
    const interval = setInterval(() => {
      const rate = scrapRate$.get();
      scrap$.set(prev => prev + rate);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Pet count, scrap display, feed button */}
    </SafeAreaView>
  );
});
```

**Key Observations**:
- Uses `useGameState()` hook for accessing petCount, scrap, scrapRate
- Timer logic for scrap generation lives in ClickerScreen
- Uses `observer` from Legend-State for reactivity
- SafeAreaView handles device safe areas

### Existing Hooks

**useGameState** (`/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useGameState.ts`):
```typescript
export function useGameState() {
  return {
    petCount$: gameState$.petCount,
    scrap$: gameState$.scrap,
    scrapRate$: scrapRate$,
  };
}
```

**Key Integration**:
- Provides access to scrap balance for shop screen
- No modifications needed - shop will consume existing hook
- Observable pattern enables fine-grained reactivity

### Store Properties (Verified)

**gameStore.ts** (`/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`):
```typescript
export const gameState$ = observable({
  petCount: 0,
  scrap: 0,
});

export const scrapRate$ = computed(() => {
  const petCount = gameState$.petCount.get();
  const scrapMultiplier = 1; // Base: 1 scrap per pet per second
  return Math.floor(petCount * scrapMultiplier);
});
```

**Key Observations**:
- Scrap balance is available in shared state
- No upgrade state exists yet (new requirement for shop)
- Store is private, accessed only through hooks (correct pattern)

### Integration Points

**App.tsx**:
- Current: Single screen (ClickerScreen)
- Required: Add navigation logic to switch between ClickerScreen and ShopScreen
- Options:
  1. Simple conditional rendering with state (`currentScreen === 'main' | 'shop'`)
  2. React Navigation (more robust, future-proof)

**ClickerScreen**:
- Must add "Shop" button to navigate to shop
- No other changes required
- Maintain all existing functionality

**gameStore.ts**:
- Must add shop state (purchased upgrades tracking)
- Add upgrade definitions (empty array for MVP)
- Add upgrade data structures (TypeScript interfaces)

### Architecture Decisions (UPDATE vs CREATE)

**Store: gameStore.ts**
- ✅ FOUND at: `frontend/shared/store/gameStore.ts`
- **DECISION: UPDATE** existing file
- **RATIONALE**: Shop state (purchased upgrades, upgrade definitions) is part of game progression. Adding to existing gameStore maintains single source of truth. Per state-management-hooks-guide.md: "Multi-feature shared state → Store + Hook pattern". Shop needs access to scrap balance and upgrades in one place.

**Hook: useGameState**
- ✅ FOUND at: `frontend/shared/hooks/useGameState.ts`
- **DECISION: UPDATE** existing file
- **RATIONALE**: Add shop-related observables (upgrades$, purchasedUpgrades$) to return object. Keeps all game state access in one hook. Alternative (useShopState) would create unnecessary hook proliferation for simple state access.

**Component: ShopScreen**
- ❌ NOT FOUND
- **DECISION: CREATE** new file at `frontend/modules/shop/ShopScreen.tsx`
- **RATIONALE**: New top-level screen component. Per file-organization-patterns.md: screens are components, live in module directories. Shop is a distinct feature module separate from attack-button.

**Component: UpgradeCard (optional)**
- ❌ NOT FOUND
- **DECISION: DO NOT CREATE** for MVP
- **RATIONALE**: No upgrades to display yet. Empty state is a simple Text component. Extract UpgradeCard when real upgrade items are added (avoid premature abstraction).

**Navigation: Screen Switching**
- ❌ NOT FOUND (no navigation exists)
- **DECISION: CREATE** navigation logic in App.tsx
- **APPROACH OPTIONS**:
  - **Option A (Simple)**: useState in App.tsx for current screen
  - **Option B (Robust)**: React Navigation stack
- **SELECTED: Option A** for MVP
- **RATIONALE**: Single navigation level (main ↔ shop), no deep linking needed, no tab navigation. React Navigation is overkill for 2-screen linear flow. Can migrate later if navigation complexity grows.

**Hook: useNavigation (if using React Navigation)**
- Not applicable (using simple conditional rendering)

### Integration Validation

- **Duplicate/similar components?** No - shop is new feature, no existing shop/store screens
- **Module ownership clarity**:
  - `shared/store/gameStore.ts` owns upgrade definitions and purchase state
  - `shared/hooks/useGameState.ts` owns state access for all game features
  - `modules/shop/` owns ShopScreen UI and shop-specific components
  - `modules/attack-button/` owns ClickerScreen and navigation button to shop
- **State sharing accessibility**: ShopScreen uses useGameState() to access scrap and upgrades
- **Navigation accessibility**: ClickerScreen adds button to navigate to shop, ShopScreen has back navigation

### File Structure Decision

Per file-organization-patterns.md:
- **Shared State**: Update `frontend/shared/store/gameStore.ts` (upgrade state)
- **Shared Hooks**: Update `frontend/shared/hooks/useGameState.ts` (upgrade observables)
- **Shop Module**: Create new module at `frontend/modules/shop/` for shop-specific code
- **Small Features (< 10 items)**: Flat structure - all shop files at module root

**Final Directory Structure**:
```
frontend/
├── shared/
│   ├── store/
│   │   ├── gameStore.ts           # UPDATE - Add upgrade definitions, purchase state
│   │   └── gameStore.test.ts      # UPDATE - Add upgrade state tests
│   └── hooks/
│       ├── useGameState.ts        # UPDATE - Add upgrades$ to return
│       └── useGameState.test.ts   # UPDATE - Add upgrade access tests
├── modules/
│   ├── attack-button/
│   │   ├── ClickerScreen.tsx      # UPDATE - Add shop navigation button
│   │   └── ClickerScreen.test.tsx # UPDATE - Add navigation button tests
│   └── shop/
│       ├── specs/
│       │   ├── feature-shop.md
│       │   ├── prd_shop_20251116.md
│       │   └── tdd_shop.md (this file)
│       ├── ShopScreen.tsx         # NEW - Shop screen component
│       └── ShopScreen.test.tsx    # NEW - Shop screen tests
└── App.tsx                        # UPDATE - Add navigation logic
```

## 3. Requirements Analysis

### Functional Requirements

**From PRD User Stories** - mapped to technical implementation:

1. **Navigation to Shop** (NAV-1, NAV-2)
   - **Implementation**: Add state in App.tsx: `const [currentScreen, setCurrentScreen] = useState<'main' | 'shop'>('main')`
   - **Button in ClickerScreen**: Add Pressable with onPress={() => navigateToShop()}
   - **Back Navigation**: ShopScreen includes back button/gesture to return to main
   - **State Preservation**: Game state (scrap, pets) maintained during navigation (no reset)

2. **Navigation Transitions** (NAV-4)
   - **iOS**: Slide transition (right to left for forward, left to right for back)
   - **Android**: Fade transition (material design pattern)
   - **Implementation**: If using simple conditional, no animation. If using React Navigation, transitions built-in.
   - **Decision for MVP**: No animations (simple conditional rendering). Add in P1 iteration.

3. **Shop Screen UI** (UI-1, UI-2, UI-3)
   - **Header**: Text component "Shop" or "Upgrades" at top
   - **Layout**: ScrollView container supporting future grid/list of upgrades
   - **Empty State**: View with centered Text: "No upgrades available yet" or "Coming soon"
   - **Accessibility**: Header has `accessibilityRole="header"`, empty state has `accessibilityRole="text"`

4. **Upgrade Display Slots** (UI-4, UI-5)
   - **Structure**: Each upgrade (when added) renders as View with:
     - Name: Text component
     - Description: Text component (smaller font)
     - Cost: Text component with scrap icon/label
     - Type indicator: Badge/tag showing "Scrap Boost" or "Pet Boost"
   - **Visual Hierarchy**: Use font sizes, colors, spacing to separate upgrade types
   - **MVP**: No upgrades to display, but layout supports future items

5. **Upgrade Data Structure** (UPG-1, UPG-2, UPG-3, UPG-5)
   ```typescript
   interface Upgrade {
     id: string;
     name: string;
     description: string;
     scrapCost: number;
     type: 'scrap-per-pet' | 'pets-per-feed';
     effectValue: number; // Multiplier or increment value
     maxLevel?: number; // Optional: if upgrades can be leveled
   }
   ```
   - **Type "scrap-per-pet"**: Increases scrapMultiplier in scrapRate$ calculation
   - **Type "pets-per-feed"**: Increases pets gained when feed button pressed
   - **Extensibility**: Interface supports adding new upgrade types (use union type)

6. **Upgrade Rendering** (UPG-4)
   - **Empty Array Handling**: `upgrades.length === 0` → show empty state
   - **No Errors**: FlatList or map() handles empty array gracefully
   - **Implementation**:
     ```typescript
     {upgrades$.length === 0 ? (
       <EmptyState />
     ) : (
       <FlatList data={upgrades$} renderItem={...} />
     )}
     ```

7. **Scrap Balance Display** (STATE-1)
   - **Source**: `useGameState().scrap$`
   - **Location**: Header of shop screen (top right or top section)
   - **Format**: "Scrap: {amount}" (consistent with main screen)
   - **Real-time Updates**: Uses Legend-State observer for automatic updates

8. **Shop State Management** (STATE-2, STATE-3)
   - **Upgrade Definitions**: `upgrades$: observable<Upgrade[]>([])`
   - **Purchased Upgrades**: `purchasedUpgrades$: observable<string[]>([])` (array of upgrade IDs)
   - **Persistence**: Not required for MVP (per PRD scope)
   - **Independence**: Shop state separate from game state logically, but stored in same gameStore

### Non-Functional Requirements

**Performance**:
- **Navigation Response**: < 100ms (simple conditional render, no async)
- **Shop Render**: < 100ms (empty state, no complex layouts)
- **UI Framerate**: 60fps maintained (no animations in MVP)
- **Memory**: No leaks (no timers or subscriptions in shop screen)

**Accessibility**:
- **Touch Targets**: Shop button ≥ 44x44pt, back button ≥ 44x44pt
- **Screen Reader**: All buttons have `accessibilityLabel`, header has `accessibilityRole="header"`
- **Contrast**: Text meets WCAG AA (4.5:1) - use same color scheme as ClickerScreen
- **Safe Areas**: ShopScreen uses SafeAreaView with edges={['top', 'bottom']}

**Platform Support**:
- iOS: React Native via Expo SDK 54
- Android: React Native via Expo SDK 54
- Web: React Native Web (if applicable)

**Reliability**:
- **Navigation State**: Always defined ('main' or 'shop'), no undefined states
- **Back Navigation**: Always available (hardware back on Android, UI button on both platforms)
- **State Sync**: Scrap balance always current (Legend-State reactivity)

## 4. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   App.tsx (Entry Point)                         │
│                                                                 │
│  State: currentScreen = 'main' | 'shop'                        │
│  Navigation: setCurrentScreen(screen)                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         SafeAreaProvider (Context)                        │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  {currentScreen === 'main' ? (                      │  │ │
│  │  │    <ClickerScreen onNavigateToShop={...} />        │  │ │
│  │  │  ) : (                                              │  │ │
│  │  │    <ShopScreen onNavigateBack={...} />             │  │ │
│  │  │  )}                                                  │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │                                             │
         ▼                                             ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│   ClickerScreen         │               │     ShopScreen          │
│                         │               │                         │
│  Hooks:                 │               │  Hooks:                 │
│   - useGameState()      │               │   - useGameState()      │
│                         │               │                         │
│  UI:                    │               │  UI:                    │
│   - Pet count display   │               │   - Header "Shop"       │
│   - Scrap display       │               │   - Scrap balance       │
│   - Feed button         │               │   - Empty state         │
│   - Shop button ← NEW   │               │   - Back button         │
└─────────────────────────┘               └─────────────────────────┘
         │                                             │
         └──────────────── useGameState() ────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│             Shared State Layer (Legend-State)                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  gameStore.ts                                             │  │
│  │                                                           │  │
│  │  gameState$ = observable({                               │  │
│  │    petCount: 0,                                          │  │
│  │    scrap: 0,                                             │  │
│  │    upgrades: [],              // ← NEW                   │  │
│  │    purchasedUpgrades: [],     // ← NEW                   │  │
│  │  });                                                     │  │
│  │                                                           │  │
│  │  Computed Values:                                        │  │
│  │  scrapRate$ = computed(() => {                           │  │
│  │    const petCount = gameState$.petCount.get();          │  │
│  │    const multiplier = getScrapMultiplier(); // ← UPDATED │  │
│  │    return Math.floor(petCount * multiplier);            │  │
│  │  });                                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  useGameState.ts (Public API)                            │  │
│  │                                                           │  │
│  │  export function useGameState() {                        │  │
│  │    return {                                              │  │
│  │      petCount$: gameState$.petCount,                     │  │
│  │      scrap$: gameState$.scrap,                           │  │
│  │      scrapRate$: scrapRate$,                             │  │
│  │      upgrades$: gameState$.upgrades,       // ← NEW      │  │
│  │      purchasedUpgrades$: gameState$.purchasedUpgrades,   │  │
│  │    };                                                    │  │
│  │  }                                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Design

#### App.tsx (Updated)

**Responsibilities**:
- Manage current screen state
- Provide navigation functions to child screens
- Render SafeAreaProvider and current screen

**Implementation**:
```typescript
// frontend/App.tsx
import { useState } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClickerScreen } from "./modules/attack-button/ClickerScreen";
import { ShopScreen } from "./modules/shop/ShopScreen";

type Screen = 'main' | 'shop';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');

  return (
    <SafeAreaProvider>
      {currentScreen === 'main' ? (
        <ClickerScreen onNavigateToShop={() => setCurrentScreen('shop')} />
      ) : (
        <ShopScreen onNavigateBack={() => setCurrentScreen('main')} />
      )}
    </SafeAreaProvider>
  );
}
```

**Props**:
- None (root component)

**State**:
- `currentScreen: 'main' | 'shop'` - current active screen

#### ClickerScreen (Updated)

**New Props**:
- `onNavigateToShop: () => void` - callback to navigate to shop

**New UI Elements**:
- Shop button: Pressable positioned below feed button or in header

**Implementation Changes**:
```typescript
interface ClickerScreenProps {
  onNavigateToShop: () => void;
}

export const ClickerScreen = observer(function ClickerScreen({
  onNavigateToShop
}: ClickerScreenProps) {
  // Existing implementation...

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Existing pet count, scrap, feed button */}

        <Pressable
          style={styles.shopButton}
          onPress={onNavigateToShop}
          accessibilityRole="button"
          accessibilityLabel="Open shop"
        >
          <Text style={styles.shopButtonText}>Shop</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
});
```

#### ShopScreen (New)

**Responsibilities**:
- Display shop header and scrap balance
- Render empty state when no upgrades exist
- Provide back navigation button
- Display upgrades list when populated (future)

**Props**:
```typescript
interface ShopScreenProps {
  onNavigateBack: () => void;
}
```

**Implementation**:
```typescript
// frontend/modules/shop/ShopScreen.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameState } from '../../shared/hooks/useGameState';
import { observer } from '@legendapp/state/react';

interface ShopScreenProps {
  onNavigateBack: () => void;
}

export const ShopScreen = observer(function ShopScreen({
  onNavigateBack
}: ShopScreenProps) {
  const { scrap$, upgrades$ } = useGameState();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={onNavigateBack}
          accessibilityRole="button"
          accessibilityLabel="Back to main screen"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <Text
          style={styles.title}
          accessibilityRole="header"
        >
          Shop
        </Text>

        <Text
          style={styles.scrapBalance}
          accessibilityRole="text"
          accessibilityLabel={`Scrap balance: ${scrap$.get()}`}
        >
          Scrap: {scrap$.get()}
        </Text>
      </View>

      <View style={styles.content}>
        {upgrades$.get().length === 0 ? (
          <View style={styles.emptyState}>
            <Text
              style={styles.emptyText}
              accessibilityRole="text"
            >
              No upgrades available yet
            </Text>
            <Text style={styles.emptySubtext}>
              Check back soon for new upgrades!
            </Text>
          </View>
        ) : (
          // Future: FlatList of upgrade items
          <Text>Upgrades list (future)</Text>
        )}
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  scrapBalance: {
    fontSize: 16,
    color: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
  },
});
```

## 5. State Management Design

### Upgrade Data Model

**TypeScript Interfaces**:
```typescript
// frontend/shared/store/gameStore.ts (additions)

/**
 * Upgrade type definitions
 */
export type UpgradeType = 'scrap-per-pet' | 'pets-per-feed';

/**
 * Upgrade definition
 */
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  scrapCost: number;
  type: UpgradeType;
  effectValue: number; // Multiplier (scrap-per-pet) or increment (pets-per-feed)
  maxLevel?: number; // Optional: maximum purchase level
  currentLevel?: number; // Optional: current owned level
}
```

### State Structure Updates

**gameStore.ts Updates**:
```typescript
// frontend/shared/store/gameStore.ts
import { observable, computed } from '@legendapp/state';

// Existing game state
export const gameState$ = observable({
  petCount: 0,
  scrap: 0,

  // NEW: Shop state
  upgrades: [] as Upgrade[],
  purchasedUpgrades: [] as string[], // Array of purchased upgrade IDs
});

// Helper: Get scrap multiplier from purchased upgrades
function getScrapMultiplier(): number {
  const purchasedIds = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  const scrapUpgrades = upgrades.filter(
    u => u.type === 'scrap-per-pet' && purchasedIds.includes(u.id)
  );

  // Base multiplier: 1.0
  // Add effectValue from each purchased scrap-per-pet upgrade
  return scrapUpgrades.reduce((total, upgrade) => total + upgrade.effectValue, 1.0);
}

// Updated: Scrap rate now uses multiplier from upgrades
export const scrapRate$ = computed(() => {
  const petCount = gameState$.petCount.get();
  const scrapMultiplier = getScrapMultiplier();
  return Math.floor(petCount * scrapMultiplier);
});

// NEW: Computed - available upgrades (not yet purchased)
export const availableUpgrades$ = computed(() => {
  const allUpgrades = gameState$.upgrades.get();
  const purchased = gameState$.purchasedUpgrades.get();
  return allUpgrades.filter(u => !purchased.includes(u.id));
});
```

**useGameState.ts Updates**:
```typescript
// frontend/shared/hooks/useGameState.ts
import { gameState$, scrapRate$, availableUpgrades$ } from '../store/gameStore';

export function useGameState() {
  return {
    petCount$: gameState$.petCount,
    scrap$: gameState$.scrap,
    scrapRate$: scrapRate$,

    // NEW: Shop state access
    upgrades$: gameState$.upgrades,
    purchasedUpgrades$: gameState$.purchasedUpgrades,
    availableUpgrades$: availableUpgrades$,
  };
}
```

### Upgrade Effects (Future Implementation)

**Scrap-per-pet Upgrade**:
- Modifies `scrapMultiplier` in `scrapRate$` calculation
- Example: "Scrap Booster I" - effectValue: 0.5 → scrapMultiplier increases from 1.0 to 1.5

**Pets-per-feed Upgrade**:
- Modifies increment logic in ClickerScreen feed button
- Example: "Double Pets" - effectValue: 2 → feeding adds 2 pets instead of 1
- Implementation: `petCount$.set(prev => prev + getPetsPerFeed())`

**Helper Function (Future)**:
```typescript
function getPetsPerFeed(): number {
  const purchasedIds = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  const petUpgrades = upgrades.filter(
    u => u.type === 'pets-per-feed' && purchasedIds.includes(u.id)
  );

  // Base: 1 pet per feed
  // Add effectValue from each purchased pets-per-feed upgrade
  return petUpgrades.reduce((total, upgrade) => total + upgrade.effectValue, 1);
}
```

## 6. API/Integration Design

### Internal APIs

**No External APIs** - MVP is client-side only.

**Internal State APIs** (via useGameState hook):

```typescript
// Read-only access
const { scrap$, upgrades$, purchasedUpgrades$ } = useGameState();

const scrapBalance = scrap$.get(); // Current scrap amount
const allUpgrades = upgrades$.get(); // All upgrade definitions
const purchased = purchasedUpgrades$.get(); // Purchased upgrade IDs

// Write access (future - purchase action)
function purchaseUpgrade(upgradeId: string) {
  const upgrade = upgrades$.find(u => u.id === upgradeId);
  const currentScrap = scrap$.get();

  if (upgrade && currentScrap >= upgrade.scrapCost) {
    // Deduct scrap
    scrap$.set(prev => prev - upgrade.scrapCost);

    // Add to purchased
    purchasedUpgrades$.set(prev => [...prev, upgradeId]);
  }
}
```

### Data Flow

**Navigation Flow**:
```
User clicks "Shop" button in ClickerScreen
  → onNavigateToShop() callback
  → App.tsx: setCurrentScreen('shop')
  → App renders ShopScreen
  → ShopScreen displays using useGameState()

User clicks "Back" button in ShopScreen
  → onNavigateBack() callback
  → App.tsx: setCurrentScreen('main')
  → App renders ClickerScreen
  → Game state preserved (scrap, pets unchanged)
```

**State Access Flow**:
```
ShopScreen mounts
  → const { scrap$, upgrades$ } = useGameState()
  → scrap$.get() reads current scrap balance
  → upgrades$.get() reads upgrade definitions (empty array for MVP)
  → Render empty state if upgrades array is empty
```

## 7. Testing Strategy

### Component Tests

**ShopScreen.test.tsx**:
```typescript
describe('ShopScreen', () => {
  beforeEach(() => {
    gameState$.scrap.set(0);
    gameState$.upgrades.set([]);
    gameState$.purchasedUpgrades.set([]);
  });

  describe('Initial Render', () => {
    test('displays shop header', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByRole('header')).toHaveTextContent(/shop/i);
    });

    test('displays scrap balance', () => {
      gameState$.scrap.set(100);
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/scrap: 100/i)).toBeTruthy();
    });

    test('displays back button', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeTruthy();
    });

    test('displays empty state when no upgrades', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/no upgrades available/i)).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    test('calls onNavigateBack when back button pressed', () => {
      const mockNavigateBack = jest.fn();
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.press(backButton);

      expect(mockNavigateBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('header has correct accessibility role', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      const header = screen.getByRole('header');
      expect(header.props.accessibilityRole).toBe('header');
    });

    test('back button has accessible label', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton.props.accessibilityLabel).toMatch(/back/i);
    });

    test('back button meets minimum touch target size', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton.props.style.minWidth).toBeGreaterThanOrEqual(44);
      expect(backButton.props.style.minHeight).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Scrap Balance Display', () => {
    test('updates when scrap changes', () => {
      const { rerender } = render(<ShopScreen onNavigateBack={() => {}} />);

      gameState$.scrap.set(250);
      rerender(<ShopScreen onNavigateBack={() => {}} />);

      expect(screen.getByText(/scrap: 250/i)).toBeTruthy();
    });

    test('handles large scrap numbers', () => {
      gameState$.scrap.set(999999);
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/scrap: 999999/i)).toBeTruthy();
    });
  });
});
```

**ClickerScreen.test.tsx Updates**:
```typescript
describe('ClickerScreen Navigation', () => {
  test('displays shop button', () => {
    render(<ClickerScreen onNavigateToShop={() => {}} />);
    const shopButton = screen.getByRole('button', { name: /shop/i });
    expect(shopButton).toBeTruthy();
  });

  test('calls onNavigateToShop when shop button pressed', () => {
    const mockNavigateToShop = jest.fn();
    render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />);

    const shopButton = screen.getByRole('button', { name: /shop/i });
    fireEvent.press(shopButton);

    expect(mockNavigateToShop).toHaveBeenCalledTimes(1);
  });

  test('shop button meets minimum touch target size', () => {
    render(<ClickerScreen onNavigateToShop={() => {}} />);
    const shopButton = screen.getByRole('button', { name: /shop/i });
    const style = shopButton.props.style;
    expect(style.minWidth).toBeGreaterThanOrEqual(44);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });
});
```

**App.test.tsx Updates**:
```typescript
describe('App Navigation', () => {
  test('renders ClickerScreen by default', () => {
    render(<App />);
    expect(screen.getByText(/singularity pet count/i)).toBeTruthy();
  });

  test('navigates to shop when shop button pressed', () => {
    render(<App />);

    const shopButton = screen.getByRole('button', { name: /shop/i });
    fireEvent.press(shopButton);

    expect(screen.getByRole('header', { name: /shop/i })).toBeTruthy();
  });

  test('navigates back to main when back button pressed', () => {
    render(<App />);

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    fireEvent.press(shopButton);

    // Navigate back
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.press(backButton);

    expect(screen.getByText(/singularity pet count/i)).toBeTruthy();
  });

  test('preserves scrap balance during navigation', () => {
    render(<App />);

    // Generate some scrap on main screen
    gameState$.scrap.set(500);

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    fireEvent.press(shopButton);

    // Verify scrap balance in shop
    expect(screen.getByText(/scrap: 500/i)).toBeTruthy();

    // Navigate back
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.press(backButton);

    // Verify scrap balance preserved on main screen
    expect(screen.getByText(/scrap: 500/i)).toBeTruthy();
  });
});
```

### Store Tests

**gameStore.test.ts Updates**:
```typescript
describe('Shop State', () => {
  beforeEach(() => {
    gameState$.upgrades.set([]);
    gameState$.purchasedUpgrades.set([]);
  });

  test('initializes with empty upgrades array', () => {
    expect(gameState$.upgrades.get()).toEqual([]);
  });

  test('initializes with empty purchased upgrades array', () => {
    expect(gameState$.purchasedUpgrades.get()).toEqual([]);
  });

  test('allows setting upgrade definitions', () => {
    const mockUpgrades: Upgrade[] = [
      {
        id: 'upgrade-1',
        name: 'Scrap Booster I',
        description: 'Increases scrap generation by 50%',
        scrapCost: 100,
        type: 'scrap-per-pet',
        effectValue: 0.5,
      },
    ];

    gameState$.upgrades.set(mockUpgrades);
    expect(gameState$.upgrades.get()).toEqual(mockUpgrades);
  });

  test('allows adding purchased upgrade IDs', () => {
    gameState$.purchasedUpgrades.set(['upgrade-1']);
    expect(gameState$.purchasedUpgrades.get()).toContain('upgrade-1');
  });
});

describe('availableUpgrades$ computed', () => {
  test('returns all upgrades when none purchased', () => {
    const mockUpgrades: Upgrade[] = [
      { id: 'up-1', name: 'Test', description: '', scrapCost: 10, type: 'scrap-per-pet', effectValue: 1 },
      { id: 'up-2', name: 'Test 2', description: '', scrapCost: 20, type: 'pets-per-feed', effectValue: 1 },
    ];

    gameState$.upgrades.set(mockUpgrades);
    gameState$.purchasedUpgrades.set([]);

    expect(availableUpgrades$.get()).toEqual(mockUpgrades);
  });

  test('filters out purchased upgrades', () => {
    const mockUpgrades: Upgrade[] = [
      { id: 'up-1', name: 'Test', description: '', scrapCost: 10, type: 'scrap-per-pet', effectValue: 1 },
      { id: 'up-2', name: 'Test 2', description: '', scrapCost: 20, type: 'pets-per-feed', effectValue: 1 },
    ];

    gameState$.upgrades.set(mockUpgrades);
    gameState$.purchasedUpgrades.set(['up-1']);

    const available = availableUpgrades$.get();
    expect(available).toHaveLength(1);
    expect(available[0].id).toBe('up-2');
  });

  test('returns empty array when all upgrades purchased', () => {
    const mockUpgrades: Upgrade[] = [
      { id: 'up-1', name: 'Test', description: '', scrapCost: 10, type: 'scrap-per-pet', effectValue: 1 },
    ];

    gameState$.upgrades.set(mockUpgrades);
    gameState$.purchasedUpgrades.set(['up-1']);

    expect(availableUpgrades$.get()).toEqual([]);
  });
});
```

### Integration Tests

**End-to-End Navigation Test**:
```typescript
describe('Shop Integration', () => {
  test('complete navigation flow with scrap balance', async () => {
    render(<App />);

    // Start on main screen
    expect(screen.getByText(/singularity pet count/i)).toBeTruthy();

    // Feed to get pets (which generate scrap)
    const feedButton = screen.getByRole('button', { name: /feed/i });
    fireEvent.press(feedButton);
    fireEvent.press(feedButton);
    fireEvent.press(feedButton);

    // Wait for scrap generation
    await waitFor(() => {
      expect(gameState$.scrap.get()).toBeGreaterThan(0);
    });

    const scrapBefore = gameState$.scrap.get();

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    fireEvent.press(shopButton);

    // Verify shop screen
    expect(screen.getByRole('header', { name: /shop/i })).toBeTruthy();
    expect(screen.getByText(new RegExp(`scrap: ${scrapBefore}`, 'i'))).toBeTruthy();

    // Verify empty state
    expect(screen.getByText(/no upgrades available/i)).toBeTruthy();

    // Navigate back
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.press(backButton);

    // Verify back on main screen
    expect(screen.getByText(/singularity pet count/i)).toBeTruthy();

    // Verify scrap balance unchanged
    expect(screen.getByText(new RegExp(`scrap: ${scrapBefore}`, 'i'))).toBeTruthy();
  });
});
```

### Test Coverage Goals

- **Component Tests**: 100% coverage of ShopScreen UI elements
- **Navigation Tests**: 100% coverage of navigation flows
- **State Tests**: 100% coverage of new shop state in gameStore
- **Integration Tests**: Key user flows (main → shop → back)
- **Overall**: > 80% code coverage for new files

## 8. Implementation Plan

### Phase 1: State Foundation (Day 1)

**Tasks**:
1. Update `gameStore.ts`:
   - Add `Upgrade` interface
   - Add `upgrades` observable (empty array)
   - Add `purchasedUpgrades` observable (empty array)
   - Add `availableUpgrades$` computed
   - Add `getScrapMultiplier()` helper (returns 1.0 for MVP)
   - Update `scrapRate$` to use `getScrapMultiplier()`

2. Update `gameStore.test.ts`:
   - Test upgrade state initialization
   - Test `availableUpgrades$` computed
   - Test `getScrapMultiplier()` returns 1.0 (baseline)

3. Update `useGameState.ts`:
   - Add `upgrades$`, `purchasedUpgrades$`, `availableUpgrades$` to return

4. Update `useGameState.test.ts`:
   - Test shop state access through hook

**Acceptance Criteria**:
- All existing tests pass (no regressions)
- New state tests pass
- `getScrapMultiplier()` returns 1.0 (MVP baseline)

### Phase 2: ShopScreen Component (Day 2)

**Tasks**:
1. Create `frontend/modules/shop/ShopScreen.tsx`:
   - Implement component with header, scrap balance, empty state
   - Add back button with `onNavigateBack` prop
   - Use `observer` for Legend-State reactivity
   - Style per design (WCAG AA compliance)

2. Create `frontend/modules/shop/ShopScreen.test.tsx`:
   - Test initial render (header, scrap, back button, empty state)
   - Test navigation callback
   - Test accessibility attributes
   - Test scrap balance updates

**Acceptance Criteria**:
- ShopScreen renders empty state correctly
- All accessibility requirements met (44x44pt targets, roles, labels)
- Component tests pass (> 80% coverage)

### Phase 3: Navigation Integration (Day 3)

**Tasks**:
1. Update `App.tsx`:
   - Add `currentScreen` state
   - Add conditional rendering (ClickerScreen vs ShopScreen)
   - Pass navigation callbacks to screens

2. Update `ClickerScreen.tsx`:
   - Add `onNavigateToShop` prop
   - Add "Shop" button in UI
   - Style shop button (accessibility compliant)

3. Update `ClickerScreen.test.tsx`:
   - Test shop button render
   - Test navigation callback
   - Test button accessibility

4. Update `App.test.tsx`:
   - Test navigation flow (main → shop → back)
   - Test state preservation during navigation

**Acceptance Criteria**:
- Navigation works bidirectionally
- All existing ClickerScreen tests pass
- New navigation tests pass
- No state loss during navigation

### Phase 4: Integration Testing & Polish (Day 4)

**Tasks**:
1. End-to-end testing:
   - Manual testing on iOS simulator
   - Manual testing on Android emulator
   - Verify safe areas on devices with notches
   - Test hardware back button on Android

2. Accessibility audit:
   - Screen reader testing (iOS VoiceOver, Android TalkBack)
   - Contrast ratio verification (WebAIM Contrast Checker)
   - Touch target size verification

3. Performance testing:
   - Navigation response time (< 100ms)
   - Shop screen render time (< 100ms)
   - No frame drops during navigation

4. Bug fixes and polish:
   - Address any issues from testing
   - Refine empty state messaging
   - Ensure consistent styling

**Acceptance Criteria**:
- All manual tests pass
- Accessibility compliance verified
- Performance targets met
- No regressions in existing features

### Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: State Foundation | 1 day | None |
| Phase 2: ShopScreen Component | 1 day | Phase 1 |
| Phase 3: Navigation Integration | 1 day | Phase 2 |
| Phase 4: Testing & Polish | 1 day | Phase 3 |

**Total: 4 days**

### Rollout Strategy

**Development**:
- Feature branch: `feature/shop-screen`
- PR review before merge to main

**Testing**:
- Unit tests run in CI/CD
- Manual testing on test devices
- Accessibility audit before release

**Release**:
- Merge to main after all tests pass
- Deploy to TestFlight/internal testing
- Monitor for navigation issues
- Gather user feedback on empty state messaging

**Rollback Plan**:
- If navigation breaks: revert navigation commits, keep state changes
- If state breaks: revert entire feature branch
- Graceful degradation: shop state initialization failures should not crash app

## 9. Risks & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Navigation state loss | High | Low | Test navigation thoroughly, use React DevTools to monitor state |
| Timer continues in shop | Medium | Medium | Verify scrap generation timer cleanup in ClickerScreen tests |
| Accessibility non-compliance | Medium | Low | Use accessibility linter, manual screen reader testing |
| Empty state confusion | Low | Medium | User testing for empty state messaging, iterate based on feedback |

### Timeline Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Testing phase uncovers bugs | Delays release by 1-2 days | Allocate buffer time, prioritize critical bugs |
| Accessibility issues found late | Delays release by 1 day | Audit accessibility early in Phase 2 |

### Dependency Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Legend-State breaking changes | High | Lock dependency versions, test upgrades in separate branch |
| React Native safe area issues | Medium | Use recommended package (react-native-safe-area-context) |

## 10. Future Enhancements (Out of Scope for MVP)

### P1 (Next Iteration)
- **Upgrade Definitions**: Populate `upgrades$` with real upgrade items
- **Purchase Functionality**: Implement buy button and scrap deduction
- **Upgrade Effects**: Apply scrap-per-pet and pets-per-feed multipliers
- **Insufficient Scrap State**: Disable/gray out unaffordable upgrades
- **Purchase Animation**: Feedback when buying upgrade

### P2 (Future)
- **React Navigation**: Replace simple conditional with navigation stack
- **Navigation Animations**: Slide/fade transitions between screens
- **Persistence**: Save purchased upgrades to AsyncStorage
- **Upgrade Levels**: Allow multiple purchases of same upgrade
- **Visual Categorization**: Tabs or sections for upgrade types
- **Preview System**: Show effect preview before purchasing

### P3 (Long Term)
- **Server-side Upgrades**: Fetch upgrade catalog from API
- **Analytics**: Track shop visit rate, purchase patterns
- **A/B Testing**: Test different shop layouts, messaging
- **Social Features**: Share upgrades with friends
- **Bundle Deals**: Multiple upgrades at discounted price

## 11. Open Questions

- [ ] **Empty State Messaging**: Should we show "Coming Soon" or "No upgrades available"? **Decision Pending**: Test both with users in P1.
- [ ] **Shop Button Location**: Should shop button be in header (always visible) or below feed button? **Recommendation**: Below feed button (less clutter).
- [ ] **Navigation Type**: Should we use React Navigation now or migrate later? **Decision**: Simple conditional for MVP, migrate in P2 if navigation complexity grows.
- [ ] **Back Navigation on Android**: Should hardware back button work from shop? **Recommendation**: Yes, implement in Phase 3.
- [ ] **Shop Icon**: Should shop button have icon (🛒) or just text? **Recommendation**: Text only for MVP (simpler, clearer).

## 12. Appendix

### Glossary

- **Upgrade**: Purchasable item that enhances game mechanics
- **Scrap-per-pet**: Upgrade type increasing scrap generation rate
- **Pets-per-feed**: Upgrade type increasing pets gained per feed action
- **Empty State**: UI pattern for screens with no content
- **Safe Area**: Screen regions outside device notches/home indicators
- **Observer**: Legend-State wrapper enabling fine-grained reactivity

### References

- **PRD**: `/frontend/modules/shop/specs/prd_shop_20251116.md`
- **State Management Guide**: `/docs/architecture/state-management-hooks-guide.md`
- **File Organization Guide**: `/docs/architecture/file-organization-patterns.md`
- **UI Guidelines**: `/docs/architecture/react-native-ui-guidelines.md`
- **Scrap System TDD**: `/frontend/modules/scrap/specs/tdd_scrap_system_20251116.md`
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

### Related Documents

- **Feature Description**: `frontend/modules/shop/specs/feature-shop.md`
- **Product Requirements**: `frontend/modules/shop/specs/prd_shop_20251116.md`
- **Task List**: TBD (to be generated from this TDD)

### Upgrade System Examples

**Example Upgrade Definitions (Future P1)**:
```typescript
const exampleUpgrades: Upgrade[] = [
  {
    id: 'scrap-boost-1',
    name: 'Scrap Booster I',
    description: 'Increases scrap generation by 50%',
    scrapCost: 100,
    type: 'scrap-per-pet',
    effectValue: 0.5, // Adds 0.5 to scrapMultiplier
  },
  {
    id: 'scrap-boost-2',
    name: 'Scrap Booster II',
    description: 'Doubles scrap generation',
    scrapCost: 500,
    type: 'scrap-per-pet',
    effectValue: 1.0, // Adds 1.0 to scrapMultiplier
  },
  {
    id: 'double-pets',
    name: 'Double Pets',
    description: 'Gain 2 pets per feed instead of 1',
    scrapCost: 250,
    type: 'pets-per-feed',
    effectValue: 1, // Adds 1 to petsPerFeed
  },
  {
    id: 'triple-pets',
    name: 'Triple Pets',
    description: 'Gain 3 pets per feed',
    scrapCost: 1000,
    type: 'pets-per-feed',
    effectValue: 2, // Adds 2 to petsPerFeed (total: 3)
  },
];
```

**Effect Calculations (Future P1)**:
```typescript
// Scrap rate with upgrades
function getScrapMultiplier(): number {
  const purchasedIds = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  const scrapUpgrades = upgrades.filter(
    u => u.type === 'scrap-per-pet' && purchasedIds.includes(u.id)
  );

  // Base: 1.0, add effectValue from each upgrade
  return scrapUpgrades.reduce((total, upgrade) => total + upgrade.effectValue, 1.0);
}

// Example: No upgrades → 1.0
// Example: Scrap Booster I → 1.0 + 0.5 = 1.5
// Example: Scrap Booster I + II → 1.0 + 0.5 + 1.0 = 2.5

// Pets per feed with upgrades
function getPetsPerFeed(): number {
  const purchasedIds = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  const petUpgrades = upgrades.filter(
    u => u.type === 'pets-per-feed' && purchasedIds.includes(u.id)
  );

  // Base: 1, add effectValue from each upgrade
  return petUpgrades.reduce((total, upgrade) => total + upgrade.effectValue, 1);
}

// Example: No upgrades → 1
// Example: Double Pets → 1 + 1 = 2
// Example: Double + Triple → 1 + 1 + 2 = 4
```

---

**Document Generated**: 2025-11-16 by Claude Code
**Source PRD**: `/frontend/modules/shop/specs/prd_shop_20251116.md`
**Next Step**: Generate task list from this TDD using `/flow:tasks` command
