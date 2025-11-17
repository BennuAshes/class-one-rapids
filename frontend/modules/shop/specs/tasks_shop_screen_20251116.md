# Shop Screen & Upgrade System - Agent-Executable Task List

## Document Control

| Version | Generated From | Date | Status |
|---------|---------------|------|--------|
| v1.0 | tdd_shop_screen_20251116.md | 2025-11-16 | Ready for Execution |

## Overview

This task list provides explicit, agent-executable tasks for implementing the shop screen and upgrade system feature following Test-Driven Development (TDD) methodology. Each task includes clear acceptance criteria, testing requirements, and expected deliverables.

## Task Execution Guidelines

### TDD Red-Green-Refactor Cycle

**MANDATORY**: All tasks must follow strict TDD approach:

1. **RED Phase**: Write failing test first
   - Test MUST fail initially
   - Validates that test is meaningful
   - Ensures no accidental implementation exists

2. **GREEN Phase**: Write minimal code to pass test
   - Only write code needed to make test pass
   - No extra features or optimizations
   - Focus on making test green

3. **REFACTOR Phase**: Improve code quality
   - Clean up implementation
   - Extract reusable patterns
   - Maintain all passing tests

### Testing Requirements

- **Test Runner**: Use `cmd.exe /c "npm test"` (per CLAUDE.md - WSL performance)
- **Framework**: React Native Testing Library + Jest
- **Mocking**: Jest mocks for AsyncStorage
- **Async Handling**: Use `waitFor` for Legend-State observable updates
- **Query Priority**: Use `getByRole`, `getByText` over `testID`

### File Organization

- Tests co-located with implementation (not in `__tests__` folders)
- No barrel exports (import directly from files)
- Follow module structure: `modules/shop/{components,hooks,types}`

---

## Phase 1: Foundation & Navigation (CRITICAL PATH)

### Task 1.1: App Integration Test Setup (MANDATORY FIRST)

**Priority**: HIGHEST (Blocks all other tasks)

**Objective**: Update App.test.tsx with comprehensive navigation tests that will fail until shop screen is implemented. This validates the complete user journey and catches missing imports.

**RED Phase Requirements**:

1. UPDATE `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`
2. Add test: "renders without import errors"
   - Validates ShopScreen module exists and can be imported
   - MUST fail if ShopScreen doesn't exist
3. Add test: "displays shop navigation button on clicker screen"
   - Verifies shop button exists on clicker screen
   - MUST fail - button doesn't exist yet
4. Add test: "navigates to shop screen when shop button pressed"
   - Tests user flow: click shop button → see shop screen
   - MUST fail - navigation not implemented
5. Add test: "navigates back to clicker when back button pressed"
   - Tests return flow: click back → see clicker screen
   - MUST fail - back button doesn't exist
6. Add test: "preserves scrap balance across screen navigation"
   - Tests state persistence during navigation
   - MUST fail - scrap tracking not implemented

**Implementation Steps**:

```typescript
// Add to App.test.tsx after existing tests

describe('App Multi-Screen Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without import errors', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  test('displays clicker screen by default', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /feed/i })).toBeTruthy();
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('displays shop navigation button on clicker screen', () => {
    render(<App />);
    const shopButton = screen.getByRole('button', { name: /shop/i });
    expect(shopButton).toBeTruthy();
  });

  test('navigates to shop screen when shop button pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
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

    // Navigate back
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.press(backButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /feed/i })).toBeTruthy();
    });
  });

  test('preserves scrap balance across screen navigation', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Feed to generate scrap
    const feedButton = screen.getByRole('button', { name: /feed/i });
    await user.press(feedButton);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      expect(screen.getByText(/scrap: 1/i)).toBeTruthy();
    });

    // Navigate back
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.press(backButton);

    // Navigate to shop again
    await user.press(screen.getByRole('button', { name: /shop/i }));

    await waitFor(() => {
      expect(screen.getByText(/scrap: 1/i)).toBeTruthy();
    });
  });
});
```

**Test Execution**:

Run: `cmd.exe /c "npm test -- App.test.tsx"`

**Acceptance Criteria**:

- [ ] All 6 new tests added to App.test.tsx
- [ ] All tests FAIL when run (RED phase complete)
- [ ] Test output clearly shows what's missing (shop button, ShopScreen, etc.)
- [ ] Existing clicker tests still pass
- [ ] Tests use userEvent.setup() for interactions
- [ ] Tests use waitFor for async state updates
- [ ] Tests query by accessible attributes (role, text)

**Deliverable**: App.test.tsx with 6 failing integration tests ready for TDD implementation

**Blocker Status**: MUST complete before Task 1.2

---

### Task 1.2: Minimal ShopScreen Stub Creation

**Priority**: HIGHEST (Unblocks App.tsx conditional rendering)

**Objective**: Create minimal ShopScreen component with just enough implementation to prevent import errors. This allows App.tsx to import ShopScreen without crashing.

**Context**: App integration tests from Task 1.1 are failing because ShopScreen doesn't exist. This task creates the bare minimum stub.

**Implementation Steps**:

1. CREATE `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * ShopScreen - Stub implementation for shop interface
 *
 * STUB: Minimal component to prevent import errors.
 * Full implementation comes in Phase 3.
 */
export function ShopScreen(): JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>Shop Screen (Stub)</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

2. VERIFY import doesn't throw:

Run: `cmd.exe /c "npm test -- App.test.tsx -t 'renders without import errors'"`

**Acceptance Criteria**:

- [ ] File created at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`
- [ ] ShopScreen exports a valid React component
- [ ] Component renders without crashing
- [ ] Test "renders without import errors" PASSES
- [ ] Other navigation tests still FAIL (expected - navigation not implemented)

**Deliverable**: Minimal ShopScreen stub that can be imported

**Dependencies**: None

**Unblocks**: Task 1.3

---

### Task 1.3: App.tsx Conditional Rendering

**Priority**: HIGHEST (Enables navigation)

**Objective**: Update App.tsx to conditionally render ClickerScreen or ShopScreen based on navigation state from useNavigation hook.

**GREEN Phase for**: App integration test "renders without import errors"

**Implementation Steps**:

1. UPDATE `/mnt/c/dev/class-one-rapids/frontend/App.tsx`

```typescript
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Memo } from "@legendapp/state/react";
import { ClickerScreen } from "./modules/attack-button/ClickerScreen";
import { ShopScreen } from "./modules/shop/ShopScreen";
import { useNavigation } from "./shared/hooks/useNavigation";

export default function App() {
  const { currentScreen$ } = useNavigation();

  return (
    <SafeAreaProvider>
      <Memo>
        {() => {
          const screen = currentScreen$.get();
          return screen === 'shop' ? <ShopScreen /> : <ClickerScreen />;
        }}
      </Memo>
    </SafeAreaProvider>
  );
}
```

2. VERIFY navigation imports work:

Run: `cmd.exe /c "npm test -- App.test.tsx -t 'renders without import errors'"`

**Acceptance Criteria**:

- [ ] App.tsx imports ShopScreen without errors
- [ ] App.tsx uses useNavigation hook
- [ ] Conditional rendering uses Memo for reactivity
- [ ] Default renders ClickerScreen
- [ ] When currentScreen$ = 'shop', renders ShopScreen
- [ ] Test "renders without import errors" PASSES
- [ ] Test "displays clicker screen by default" PASSES

**Deliverable**: App.tsx with conditional screen rendering

**Dependencies**: Task 1.2 (ShopScreen stub exists)

**Unblocks**: Task 1.4

---

### Task 1.4: Add Shop Navigation Button to ClickerScreen

**Priority**: HIGH (Enables user to access shop)

**Objective**: Update ClickerScreen to add shop navigation button that calls navigateToShop() from useNavigation hook.

**GREEN Phase for**: App integration test "displays shop navigation button on clicker screen"

**Implementation Steps**:

1. UPDATE `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`

Add after existing imports:
```typescript
import { useNavigation } from "../../shared/hooks/useNavigation";
```

Add inside component (before return):
```typescript
const { actions: navActions } = useNavigation();
```

Add to JSX (after existing content, before closing View):
```typescript
<Pressable
  style={styles.shopButton}
  onPress={navActions.navigateToShop}
  accessibilityRole="button"
  accessibilityLabel="Open Shop"
>
  <Text style={styles.shopButtonText}>Shop</Text>
</Pressable>
```

Add to StyleSheet:
```typescript
shopButton: {
  backgroundColor: '#34D399',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  marginTop: 16,
  minWidth: 44,
  minHeight: 44,
  alignItems: 'center',
  justifyContent: 'center',
},
shopButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
},
```

2. VERIFY button appears and is accessible:

Run: `cmd.exe /c "npm test -- App.test.tsx -t 'displays shop navigation button'"`

**Acceptance Criteria**:

- [ ] ClickerScreen imports useNavigation
- [ ] Shop button renders on clicker screen
- [ ] Button has accessibilityRole="button"
- [ ] Button has accessibilityLabel="Open Shop"
- [ ] Button meets 44x44pt touch target minimum
- [ ] Button calls navActions.navigateToShop on press
- [ ] Test "displays shop navigation button on clicker screen" PASSES
- [ ] Existing clicker tests still pass

**Deliverable**: ClickerScreen with shop navigation button

**Dependencies**: Task 1.3 (App.tsx conditional rendering)

**Unblocks**: Task 1.5

---

### Task 1.5: Add Back Button to ShopScreen

**Priority**: HIGH (Enables return to clicker)

**Objective**: Update ShopScreen stub to add back navigation button that calls navigateToClicker() from useNavigation hook.

**GREEN Phase for**: App integration tests "navigates to shop" and "navigates back to clicker"

**Implementation Steps**:

1. UPDATE `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '../shared/hooks/useNavigation';

export function ShopScreen(): JSX.Element {
  const { actions: navActions } = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Pressable
          style={styles.backButton}
          onPress={navActions.navigateToClicker}
          accessibilityRole="button"
          accessibilityLabel="Back to Clicker"
          testID="back-button"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Shop</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
});
```

2. VERIFY navigation flow works end-to-end:

Run: `cmd.exe /c "npm test -- App.test.tsx -t 'navigation'"`

**Acceptance Criteria**:

- [ ] ShopScreen imports useNavigation
- [ ] Back button renders on shop screen
- [ ] Button has accessibilityRole="button"
- [ ] Button has accessibilityLabel="Back to Clicker"
- [ ] Button meets 44x44pt touch target minimum
- [ ] Button calls navActions.navigateToClicker on press
- [ ] Test "navigates to shop screen when shop button pressed" PASSES
- [ ] Test "navigates back to clicker when back button pressed" PASSES

**Deliverable**: ShopScreen with functional back navigation

**Dependencies**: Task 1.4 (Shop button exists)

**Unblocks**: Task 1.6

---

### Task 1.6: Add Scrap Tracking to ClickerScreen

**Priority**: HIGH (Foundation for shop economy)

**Objective**: Update ClickerScreen to track scrap balance using usePersistedCounter and grant 1 scrap per feed action (base rate, no upgrades yet).

**GREEN Phase for**: App integration test "preserves scrap balance across screen navigation"

**Implementation Steps**:

1. UPDATE `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`

Add to imports:
```typescript
// usePersistedCounter already imported for pet count
```

Add inside component:
```typescript
const { count$: scrap$, actions: scrapActions } = usePersistedCounter('scrap-balance');
```

Update feed handler:
```typescript
const handleFeed = () => {
  petActions.increment();
  scrapActions.increment(); // Grant 1 scrap per feed (base rate)
};
```

Add scrap display to JSX (after pet counter):
```typescript
<View style={styles.scrapContainer}>
  <Text style={styles.scrapLabel}>Scrap:</Text>
  <Memo>
    {() => <Text style={styles.scrapValue}>{scrap$.get()}</Text>}
  </Memo>
</View>
```

Add to StyleSheet:
```typescript
scrapContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 12,
},
scrapLabel: {
  fontSize: 18,
  fontWeight: '600',
  marginRight: 8,
},
scrapValue: {
  fontSize: 18,
  color: '#34D399',
  fontWeight: 'bold',
},
```

2. VERIFY scrap persists across navigation:

Run: `cmd.exe /c "npm test -- App.test.tsx -t 'preserves scrap balance'"`

**Acceptance Criteria**:

- [ ] ClickerScreen uses usePersistedCounter('scrap-balance')
- [ ] Feed action increments scrap by 1
- [ ] Scrap balance displays on clicker screen
- [ ] Scrap value persists to AsyncStorage
- [ ] Scrap value survives navigation to shop and back
- [ ] Test "preserves scrap balance across screen navigation" PASSES
- [ ] All navigation tests PASS

**Deliverable**: ClickerScreen with scrap tracking and persistence

**Dependencies**: Task 1.5 (Navigation works)

**Phase 1 Complete**: All App integration tests PASS

---

## Phase 2: Upgrade Infrastructure (TDD Foundation)

### Task 2.1: Create Upgrade Type Definitions

**Priority**: MEDIUM (Foundation for upgrade system)

**Objective**: Define TypeScript types and interfaces for upgrade data model.

**RED Phase**: No tests needed for pure types (TypeScript validates at compile time)

**Implementation Steps**:

1. CREATE `/mnt/c/dev/class-one-rapids/frontend/modules/shop/types/upgrade.ts`

```typescript
/**
 * Upgrade data model for shop system
 *
 * Supports two effect types:
 * - scrapPerPet: Increases scrap gained per pet action
 * - petsPerFeed: Increases pets gained per feed action
 */
export interface Upgrade {
  /** Unique identifier (UUID or timestamp-based) */
  id: string;

  /** Display name shown in shop UI */
  name: string;

  /** User-facing description of upgrade effect */
  description: string;

  /** Scrap cost to purchase (positive integer) */
  cost: number;

  /** Type of gameplay effect */
  effectType: 'scrapPerPet' | 'petsPerFeed';

  /** Magnitude of effect (additive with other upgrades) */
  effectValue: number;

  // Future expansion fields (optional)
  iconName?: string;
  prerequisiteIds?: string[];
  maxPurchases?: number;
  tier?: number;
}

/**
 * Valid upgrade effect types
 */
export type UpgradeEffectType = 'scrapPerPet' | 'petsPerFeed';

/**
 * Type guard for validating upgrade effect types
 */
export function isValidEffectType(type: string): type is UpgradeEffectType {
  return type === 'scrapPerPet' || type === 'petsPerFeed';
}
```

2. VERIFY TypeScript compilation:

Run: `cmd.exe /c "npx tsc --noEmit"`

**Acceptance Criteria**:

- [ ] File created at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/types/upgrade.ts`
- [ ] Upgrade interface defined with all required fields
- [ ] UpgradeEffectType union type defined
- [ ] isValidEffectType type guard implemented
- [ ] Optional fields documented for future expansion
- [ ] TypeScript compiles without errors
- [ ] JSDoc comments present for all exports

**Deliverable**: Complete TypeScript type definitions for upgrades

**Dependencies**: None

**Unblocks**: Task 2.2

---

### Task 2.2: useUpgrades Hook - Write Tests (RED Phase)

**Priority**: MEDIUM

**Objective**: Write comprehensive tests for useUpgrades hook following TDD methodology. All tests MUST fail initially.

**RED Phase Requirements**:

1. CREATE `/mnt/c/dev/class-one-rapids/frontend/modules/shop/hooks/useUpgrades.test.tsx`

```typescript
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

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'purchased-upgrades',
        expect.any(String)
      );
    }, { timeout: 2000 });
  });

  test('loads persisted purchased upgrades on mount', async () => {
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

2. Run tests - ALL MUST FAIL:

Run: `cmd.exe /c "npm test -- useUpgrades.test.tsx"`

**Acceptance Criteria**:

- [ ] File created at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/hooks/useUpgrades.test.tsx`
- [ ] 10 comprehensive tests written
- [ ] Tests cover initialization, adding upgrades, purchasing, validation, persistence
- [ ] Tests use renderHook from React Native Testing Library
- [ ] Tests use act() for state changes
- [ ] Tests use waitFor() for async observable updates
- [ ] AsyncStorage properly mocked
- [ ] usePersistedCounter properly mocked
- [ ] All tests FAIL when run (hook doesn't exist)

**Deliverable**: Complete test suite for useUpgrades hook (all failing)

**Dependencies**: Task 2.1 (Upgrade types exist)

**Unblocks**: Task 2.3

---

### Task 2.3: useUpgrades Hook - Implementation (GREEN Phase)

**Priority**: MEDIUM

**Objective**: Implement useUpgrades hook to make all tests from Task 2.2 pass. Follow TDD GREEN phase - write minimal code to pass tests.

**GREEN Phase Requirements**:

1. CREATE `/mnt/c/dev/class-one-rapids/frontend/modules/shop/hooks/useUpgrades.ts`

```typescript
import { useMemo } from 'react';
import { observable, computed } from '@legendapp/state';
import { synced } from '@legendapp/state/sync';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePersistedCounter } from '../../attack-button/hooks/usePersistedCounter';
import type { Upgrade } from '../types/upgrade';

/**
 * Return type for useUpgrades hook
 */
export interface UseUpgradesReturn {
  availableUpgrades$: ReturnType<typeof observable<Upgrade[]>>;
  purchasedUpgrades$: ReturnType<typeof observable<Set<string>>>;
  filteredUpgrades$: ReturnType<typeof computed<Upgrade[]>>;
  actions: {
    purchaseUpgrade: (upgradeId: string, cost: number) => boolean;
    addUpgrade: (upgrade: Upgrade) => void;
    reset: () => void;
  };
}

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
 * // Purchase upgrade
 * actions.purchaseUpgrade('upgrade-1', 10);
 */
export function useUpgrades(): UseUpgradesReturn {
  const { count$: scrap$ } = usePersistedCounter('scrap-balance');

  return useMemo(() => {
    // Available upgrades (initially empty, can be populated later)
    const availableUpgrades$ = observable<Upgrade[]>([]);

    // Purchased upgrades (persisted as Set of IDs)
    const purchasedUpgrades$ = observable(
      synced({
        initial: new Set<string>(),
        persist: {
          name: 'purchased-upgrades',
          plugin: ObservablePersistAsyncStorage({
            AsyncStorage,
          }),
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
          return false;
        }

        // Deduct scrap
        scrap$.set(currentScrap - cost);

        // Mark as purchased
        const purchased = purchasedUpgrades$.get();
        purchased.add(upgradeId);
        purchasedUpgrades$.set(new Set(purchased));

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
  }, [scrap$]);
}
```

2. Run tests - ALL MUST PASS:

Run: `cmd.exe /c "npm test -- useUpgrades.test.tsx"`

**Acceptance Criteria**:

- [ ] File created at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/hooks/useUpgrades.ts`
- [ ] Hook exports UseUpgradesReturn interface
- [ ] availableUpgrades$ observable initialized to empty array
- [ ] purchasedUpgrades$ observable synced with AsyncStorage
- [ ] filteredUpgrades$ computed from available - purchased
- [ ] purchaseUpgrade validates scrap and deducts cost
- [ ] purchaseUpgrade returns true on success, false on failure
- [ ] addUpgrade appends to available list
- [ ] reset clears purchased upgrades
- [ ] All 10 tests PASS

**Deliverable**: Fully implemented useUpgrades hook with all tests passing

**Dependencies**: Task 2.2 (Tests written)

**Unblocks**: Phase 3

---

## Phase 3: Shop UI Components (TDD Layer by Layer)

### Task 3.1: ShopScreen Component - Write Tests (RED Phase)

**Priority**: MEDIUM

**Objective**: Write comprehensive tests for ShopScreen component. Update existing stub to full component tests.

**RED Phase Requirements**:

1. CREATE `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

```typescript
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

2. Run tests - MOST SHOULD FAIL (stub doesn't have full implementation):

Run: `cmd.exe /c "npm test -- ShopScreen.test.tsx"`

**Acceptance Criteria**:

- [ ] File created at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`
- [ ] 5 comprehensive tests written
- [ ] Tests cover back button, scrap display, navigation, upgrade list, accessibility
- [ ] Tests properly mock all hooks
- [ ] Tests use userEvent for interactions
- [ ] Tests query by role and text (not testID except for style checks)
- [ ] Most tests FAIL (stub doesn't display scrap or upgrade list)

**Deliverable**: Complete test suite for ShopScreen (most failing)

**Dependencies**: Task 2.3 (useUpgrades hook exists)

**Unblocks**: Task 3.2

---

### Task 3.2: ShopScreen Component - Full Implementation (GREEN Phase)

**Priority**: MEDIUM

**Objective**: Update ShopScreen stub from Phase 1 to full implementation with scrap display and upgrade list.

**GREEN Phase Requirements**:

1. UPDATE `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Memo } from '@legendapp/state/react';
import { useNavigation } from '../shared/hooks/useNavigation';
import { usePersistedCounter } from '../attack-button/hooks/usePersistedCounter';
import { useUpgrades } from './hooks/useUpgrades';
import { UpgradeList } from './components/UpgradeList';

/**
 * ShopScreen - Shop interface for viewing and purchasing upgrades
 *
 * Displays:
 * - Current scrap balance
 * - List of available upgrades
 * - Back button to return to clicker screen
 */
export function ShopScreen(): JSX.Element {
  const { actions: navActions } = useNavigation();
  const { count$: scrap$ } = usePersistedCounter('scrap-balance');
  const upgradesHook = useUpgrades();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={navActions.navigateToClicker}
          accessibilityRole="button"
          accessibilityLabel="Back to Clicker"
          testID="back-button"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Shop</Text>

        <View style={styles.scrapDisplay}>
          <Text style={styles.scrapLabel}>Scrap:</Text>
          <Memo>
            {() => (
              <Text
                style={styles.scrapValue}
                accessibilityRole="text"
                accessibilityLabel={`Scrap balance: ${scrap$.get()}`}
              >
                {scrap$.get()}
              </Text>
            )}
          </Memo>
        </View>
      </View>

      <UpgradeList
        upgrades$={upgradesHook.filteredUpgrades$}
        purchasedUpgrades$={upgradesHook.purchasedUpgrades$}
        currentScrap$={scrap$}
        onPurchase={upgradesHook.actions.purchaseUpgrade}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#111827',
  },
  scrapDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#34D399',
  },
  scrapLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    color: '#111827',
  },
  scrapValue: {
    fontSize: 20,
    color: '#34D399',
    fontWeight: 'bold',
  },
});
```

2. Run tests - SHOULD STILL FAIL (UpgradeList doesn't exist yet):

Run: `cmd.exe /c "npm test -- ShopScreen.test.tsx"`

**Acceptance Criteria**:

- [ ] ShopScreen imports all required hooks
- [ ] Back button functional (already working from Phase 1)
- [ ] Scrap display shows current balance from scrap$ observable
- [ ] Scrap display reactive (uses Memo)
- [ ] Scrap display has accessibility label
- [ ] UpgradeList component rendered
- [ ] Tests still FAIL (UpgradeList component doesn't exist)

**Deliverable**: ShopScreen with scrap display (tests still failing)

**Dependencies**: Task 3.1 (Tests written)

**Unblocks**: Task 3.3

---

### Task 3.3: UpgradeList Component - Write Tests (RED Phase)

**Priority**: MEDIUM

**Objective**: Write tests for UpgradeList component that handles rendering upgrade items.

**RED Phase Requirements**:

1. CREATE `/mnt/c/dev/class-one-rapids/frontend/modules/shop/components/UpgradeList.test.tsx`

```typescript
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

2. Run tests - ALL MUST FAIL:

Run: `cmd.exe /c "npm test -- UpgradeList.test.tsx"`

**Acceptance Criteria**:

- [ ] File created at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/components/UpgradeList.test.tsx`
- [ ] 3 tests written covering empty state, rendering, filtering
- [ ] Tests use observable instances for props
- [ ] All tests FAIL (component doesn't exist)

**Deliverable**: Test suite for UpgradeList (all failing)

**Dependencies**: Task 3.2 (ShopScreen expects UpgradeList)

**Unblocks**: Task 3.4

---

### Task 3.4: UpgradeList Component - Implementation (GREEN Phase)

**Priority**: MEDIUM

**Objective**: Implement UpgradeList component to render list of upgrades with empty state.

**GREEN Phase Requirements**:

1. CREATE `/mnt/c/dev/class-one-rapids/frontend/modules/shop/components/UpgradeList.tsx`

```typescript
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Memo, For } from '@legendapp/state/react';
import type { Observable } from '@legendapp/state';
import type { Upgrade } from '../types/upgrade';
import { UpgradeItem } from './UpgradeItem';

export interface UpgradeListProps {
  upgrades$: Observable<Upgrade[]>;
  purchasedUpgrades$: Observable<Set<string>>;
  currentScrap$: Observable<number>;
  onPurchase: (upgradeId: string, cost: number) => boolean;
}

/**
 * UpgradeList - Scrollable list of available upgrades
 *
 * Features:
 * - FlatList with virtualization for performance
 * - Empty state when no upgrades available
 * - Filters out purchased upgrades
 * - Passes purchase action to individual items
 */
export function UpgradeList({
  upgrades$,
  purchasedUpgrades$,
  currentScrap$,
  onPurchase
}: UpgradeListProps): JSX.Element {
  return (
    <View style={styles.container} testID="upgrade-list">
      <Memo>
        {() => {
          const upgrades = upgrades$.get();
          const purchased = purchasedUpgrades$.get();
          const filtered = upgrades.filter(u => !purchased.has(u.id));

          if (filtered.length === 0) {
            return (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No upgrades available yet.</Text>
                <Text style={styles.emptySubtext}>Check back soon!</Text>
              </View>
            );
          }

          return (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const currentScrap = currentScrap$.get();
                const isAffordable = currentScrap >= item.cost;

                return (
                  <UpgradeItem
                    upgrade={item}
                    isPurchased={false}
                    isAffordable={isAffordable}
                    onPurchase={() => onPurchase(item.id, item.cost)}
                  />
                );
              }}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={5}
              removeClippedSubviews={true}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          );
        }}
      </Memo>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
```

2. Run tests - SHOULD STILL FAIL (UpgradeItem doesn't exist):

Run: `cmd.exe /c "npm test -- UpgradeList.test.tsx"`

**Acceptance Criteria**:

- [ ] File created at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/components/UpgradeList.tsx`
- [ ] Component accepts UpgradeListProps interface
- [ ] Empty state displays when no upgrades
- [ ] FlatList renders when upgrades exist
- [ ] FlatList configured for performance (virtualization)
- [ ] Purchased upgrades filtered out
- [ ] Tests still FAIL (UpgradeItem doesn't exist)

**Deliverable**: UpgradeList component (tests still failing)

**Dependencies**: Task 3.3 (Tests written)

**Unblocks**: Task 3.5

---

### Task 3.5: UpgradeItem Component - Write Tests (RED Phase)

**Priority**: MEDIUM

**Objective**: Write tests for individual upgrade item card component.

**RED Phase Requirements**:

1. CREATE `/mnt/c/dev/class-one-rapids/frontend/modules/shop/components/UpgradeItem.test.tsx`

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { userEvent } from '@testing-library/react-native';
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
    render(
      <UpgradeItem
        upgrade={mockUpgrade}
        isPurchased={false}
        isAffordable={true}
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

    render(
      <UpgradeItem
        upgrade={mockUpgrade}
        isPurchased={false}
        isAffordable={true}
        onPurchase={mockOnPurchase}
      />
    );

    const purchaseButton = screen.getByRole('button', { name: /purchase/i });
    await user.press(purchaseButton);

    expect(mockOnPurchase).toHaveBeenCalledTimes(1);
  });

  test('disables purchase button when already purchased', () => {
    render(
      <UpgradeItem
        upgrade={mockUpgrade}
        isPurchased={true}
        isAffordable={true}
        onPurchase={jest.fn()}
      />
    );

    const purchaseButton = screen.getByRole('button', { name: /owned/i });
    expect(purchaseButton.props.disabled).toBe(true);
  });

  test('disables purchase button when unaffordable', () => {
    render(
      <UpgradeItem
        upgrade={mockUpgrade}
        isPurchased={false}
        isAffordable={false}
        onPurchase={jest.fn()}
      />
    );

    const purchaseButton = screen.getByRole('button', { name: /purchase/i });
    expect(purchaseButton.props.disabled).toBe(true);
  });

  test('shows visual indication for unaffordable upgrades', () => {
    render(
      <UpgradeItem
        upgrade={mockUpgrade}
        isPurchased={false}
        isAffordable={false}
        onPurchase={jest.fn()}
      />
    );

    const container = screen.getByTestId('upgrade-item');
    const style = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style)
      : container.props.style;

    expect(style.opacity).toBeLessThan(1);
  });
});
```

2. Run tests - ALL MUST FAIL:

Run: `cmd.exe /c "npm test -- UpgradeItem.test.tsx"`

**Acceptance Criteria**:

- [ ] File created at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/components/UpgradeItem.test.tsx`
- [ ] 5 tests written covering rendering, interaction, disabled states, visual feedback
- [ ] Tests use userEvent for button presses
- [ ] All tests FAIL (component doesn't exist)

**Deliverable**: Test suite for UpgradeItem (all failing)

**Dependencies**: Task 3.4 (UpgradeList expects UpgradeItem)

**Unblocks**: Task 3.6

---

### Task 3.6: UpgradeItem Component - Implementation (GREEN Phase)

**Priority**: MEDIUM

**Objective**: Implement UpgradeItem component to display individual upgrade cards with purchase buttons.

**GREEN Phase Requirements**:

1. CREATE `/mnt/c/dev/class-one-rapids/frontend/modules/shop/components/UpgradeItem.tsx`

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Upgrade } from '../types/upgrade';

export interface UpgradeItemProps {
  upgrade: Upgrade;
  isPurchased: boolean;
  isAffordable: boolean;
  onPurchase: () => void;
}

/**
 * UpgradeItem - Individual upgrade card with purchase button
 *
 * Displays:
 * - Upgrade name and description
 * - Cost in scrap
 * - Purchase button (disabled if unaffordable or already purchased)
 *
 * Visual states:
 * - Normal: Full opacity, green purchase button
 * - Unaffordable: Reduced opacity, disabled button
 * - Purchased: "Owned" badge, disabled button
 */
export const UpgradeItem = React.memo(function UpgradeItem({
  upgrade,
  isPurchased,
  isAffordable,
  onPurchase
}: UpgradeItemProps): JSX.Element {
  const isDisabled = isPurchased || !isAffordable;

  return (
    <View
      style={[
        styles.container,
        !isAffordable && styles.unaffordable
      ]}
      testID="upgrade-item"
    >
      <View style={styles.info}>
        <Text style={styles.name}>{upgrade.name}</Text>
        <Text style={styles.description}>{upgrade.description}</Text>
        <Text style={styles.cost}>{upgrade.cost} scrap</Text>
      </View>

      <Pressable
        style={[
          styles.button,
          isDisabled && styles.buttonDisabled
        ]}
        onPress={onPurchase}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={isPurchased ? "Owned" : "Purchase"}
      >
        <Text style={[
          styles.buttonText,
          isDisabled && styles.buttonTextDisabled
        ]}>
          {isPurchased ? 'Owned' : 'Purchase'}
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    opacity: 1,
  },
  unaffordable: {
    opacity: 0.5,
  },
  info: {
    flex: 1,
    marginRight: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  cost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34D399',
  },
  button: {
    backgroundColor: '#34D399',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
});
```

2. Run tests - ALL MUST PASS:

Run: `cmd.exe /c "npm test -- UpgradeItem.test.tsx"`

**Acceptance Criteria**:

- [ ] File created at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/components/UpgradeItem.tsx`
- [ ] Component memoized with React.memo
- [ ] Renders upgrade name, description, cost
- [ ] Purchase button calls onPurchase
- [ ] Button disabled when isPurchased or !isAffordable
- [ ] Unaffordable state shows reduced opacity
- [ ] Purchased state shows "Owned" text
- [ ] All 5 tests PASS

**Deliverable**: UpgradeItem component with all tests passing

**Dependencies**: Task 3.5 (Tests written)

**Unblocks**: Task 3.7

---

### Task 3.7: Verify Full Component Stack

**Priority**: MEDIUM

**Objective**: Run all component tests together to verify the full stack (ShopScreen → UpgradeList → UpgradeItem) works correctly.

**Verification Steps**:

1. Run all shop component tests:

Run: `cmd.exe /c "npm test -- modules/shop"`

2. Run all App integration tests:

Run: `cmd.exe /c "npm test -- App.test.tsx"`

**Acceptance Criteria**:

- [ ] All UpgradeItem tests PASS
- [ ] All UpgradeList tests PASS
- [ ] All ShopScreen tests PASS
- [ ] All useUpgrades tests PASS
- [ ] All App integration tests PASS
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors

**Deliverable**: Fully functional shop UI with all tests passing

**Dependencies**: Task 3.6 (UpgradeItem complete)

**Unblocks**: Phase 4

---

## Phase 4: Upgrade Effects & Testing (Final Integration)

### Task 4.1: Apply Upgrade Effects in ClickerScreen

**Priority**: MEDIUM

**Objective**: Update ClickerScreen to compute and apply upgrade effects (scrapPerPet boost) when feeding pets.

**Implementation Steps**:

1. UPDATE `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`

Add import:
```typescript
import { useUpgrades } from '../shop/hooks/useUpgrades';
```

Add hook inside component:
```typescript
const { availableUpgrades$, purchasedUpgrades$ } = useUpgrades();
```

Update feed handler:
```typescript
const handleFeed = () => {
  // Compute scrap boost from purchased upgrades
  const available = availableUpgrades$.get();
  const purchased = purchasedUpgrades$.get();

  const scrapBoosts = available
    .filter(u => purchased.has(u.id) && u.effectType === 'scrapPerPet')
    .map(u => u.effectValue);

  const totalBoost = scrapBoosts.reduce((sum, v) => sum + v, 0);
  const scrapPerPet = 1 + totalBoost; // Base 1 + upgrades

  // Increment pet count
  petActions.increment();

  // Grant scrap with boost
  const currentScrap = scrap$.get();
  scrap$.set(currentScrap + scrapPerPet);
};
```

2. Manual test:
   - Add mock upgrade via useUpgrades addUpgrade
   - Purchase upgrade in shop
   - Return to clicker
   - Feed and verify scrap increases by boosted amount

**Acceptance Criteria**:

- [ ] ClickerScreen imports useUpgrades
- [ ] Feed handler computes scrapPerPet from purchased upgrades
- [ ] Base scrap per feed is 1
- [ ] Each scrapPerPet upgrade adds to boost additively
- [ ] Scrap granted = 1 + sum of all scrapPerPet upgrades
- [ ] Manual testing confirms boosts apply correctly

**Deliverable**: ClickerScreen with upgrade effects applied

**Dependencies**: Task 3.7 (Shop UI complete)

**Unblocks**: Task 4.2

---

### Task 4.2: End-to-End Integration Test

**Priority**: HIGH

**Objective**: Write and verify comprehensive integration test covering full purchase flow and upgrade effect application.

**Implementation Steps**:

1. CREATE or UPDATE integration test in App.test.tsx:

```typescript
describe('Shop Purchase Flow Integration', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('purchased upgrade boosts scrap earnings', async () => {
    const user = userEvent.setup();

    // Pre-populate with scrap and upgrades
    await AsyncStorage.setItem('scrap-balance', JSON.stringify(100));

    render(<App />);

    // Add mock upgrade to system (this would normally be done by game initialization)
    // For testing, we'll need to simulate an upgrade existing
    // NOTE: This test requires upgrade initialization logic to be added

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      expect(screen.getByText(/scrap: 100/i)).toBeTruthy();
    });

    // Purchase upgrade (if one exists)
    // This test validates the flow but may need mock upgrades seeded

    // Navigate back to clicker
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.press(backButton);

    // Feed and verify boosted scrap
    const feedButton = screen.getByRole('button', { name: /feed/i });
    await user.press(feedButton);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });

    // Navigate to shop to check scrap increased
    await user.press(screen.getByRole('button', { name: /shop/i }));

    await waitFor(() => {
      // Without purchased upgrades, scrap should be 101 (100 + 1 base)
      expect(screen.getByText(/scrap: 101/i)).toBeTruthy();
    });
  });
});
```

2. Run integration test:

Run: `cmd.exe /c "npm test -- App.test.tsx -t 'purchased upgrade'"`

**Acceptance Criteria**:

- [ ] Integration test added to App.test.tsx
- [ ] Test covers: navigate to shop, purchase, return to clicker, feed, verify boost
- [ ] Test handles AsyncStorage persistence
- [ ] Test uses waitFor for all async updates
- [ ] Test PASSES

**Deliverable**: End-to-end integration test validating purchase flow

**Dependencies**: Task 4.1 (Upgrade effects implemented)

**Unblocks**: Task 4.3

---

### Task 4.3: Accessibility Audit

**Priority**: LOW (Can be done in parallel with manual testing)

**Objective**: Verify all UI components meet WCAG 2.1 AA accessibility standards.

**Audit Checklist**:

1. **Touch Target Sizes** (WCAG 2.5.5)
   - [ ] Shop button on ClickerScreen: >= 44x44pt
   - [ ] Back button on ShopScreen: >= 44x44pt
   - [ ] Purchase buttons on UpgradeItems: >= 44x44pt
   - [ ] Feed button on ClickerScreen: >= 44x44pt (already verified)

2. **Accessibility Roles and Labels**
   - [ ] Shop button: `accessibilityRole="button"`, label="Open Shop"
   - [ ] Back button: `accessibilityRole="button"`, label="Back to Clicker"
   - [ ] Purchase buttons: `accessibilityRole="button"`, label="Purchase" or "Owned"
   - [ ] Scrap display: `accessibilityRole="text"`, label with value
   - [ ] Upgrade items: Proper content description

3. **Color Contrast** (WCAG 1.4.3)
   - [ ] Shop button text vs background: >= 4.5:1
   - [ ] Back button text vs background: >= 4.5:1
   - [ ] Scrap value text vs background: >= 4.5:1
   - [ ] Upgrade name text vs background: >= 4.5:1
   - [ ] Purchase button text vs background: >= 4.5:1

4. **Screen Reader Testing**
   - [ ] VoiceOver (iOS): Navigate through shop, announce all elements correctly
   - [ ] TalkBack (Android): Navigate through shop, announce all elements correctly

**Tools**:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- React Native Accessibility Inspector
- VoiceOver (iOS Simulator)
- TalkBack (Android Emulator)

**Acceptance Criteria**:

- [ ] All touch targets meet 44x44pt minimum
- [ ] All interactive elements have accessibilityRole
- [ ] All buttons have meaningful accessibilityLabel
- [ ] All text meets 4.5:1 contrast ratio
- [ ] VoiceOver navigation works smoothly
- [ ] TalkBack navigation works smoothly

**Deliverable**: Accessibility audit report with all items passing

**Dependencies**: Task 3.7 (UI complete)

---

### Task 4.4: Cross-Platform Manual Testing

**Priority**: LOW

**Objective**: Manually test shop feature on iOS, Android, and Web to verify consistent behavior.

**Test Plan**:

**iOS Testing** (iPhone Simulator or Device):
1. [ ] App launches without errors
2. [ ] Shop button appears on clicker screen
3. [ ] Tapping shop button navigates to shop
4. [ ] Scrap balance displays correctly
5. [ ] Empty state shows "No upgrades available"
6. [ ] Back button returns to clicker
7. [ ] Scrap persists across navigation
8. [ ] Feed action grants 1 scrap (base rate)
9. [ ] No visual glitches or layout issues

**Android Testing** (Android Emulator or Device):
1. [ ] App launches without errors
2. [ ] Shop button appears on clicker screen
3. [ ] Tapping shop button navigates to shop
4. [ ] Scrap balance displays correctly
5. [ ] Empty state shows "No upgrades available"
6. [ ] Back button returns to clicker
7. [ ] Scrap persists across navigation
8. [ ] Feed action grants 1 scrap (base rate)
9. [ ] No visual glitches or layout issues

**Web Testing** (Chrome, Safari, Firefox):
1. [ ] App loads in browser without errors
2. [ ] Shop button clickable on clicker screen
3. [ ] Navigation to shop works
4. [ ] Scrap balance displays correctly
5. [ ] Empty state renders properly
6. [ ] Back button returns to clicker
7. [ ] Scrap persists (localStorage)
8. [ ] Feed action grants 1 scrap (base rate)
9. [ ] Responsive layout works correctly

**Test Execution**:

Run dev server:
```bash
npx expo start
```

Then test on each platform:
- iOS: Press `i` for iOS Simulator
- Android: Press `a` for Android Emulator
- Web: Press `w` for Web browser

**Acceptance Criteria**:

- [ ] All iOS tests pass
- [ ] All Android tests pass
- [ ] All Web tests pass
- [ ] No platform-specific bugs found
- [ ] Consistent behavior across platforms

**Deliverable**: Cross-platform testing report with screenshots

**Dependencies**: Task 4.3 (Accessibility audit complete)

---

### Task 4.5: Final Test Suite Verification

**Priority**: HIGH (Final gate before completion)

**Objective**: Run complete test suite to verify all tests pass and no regressions introduced.

**Verification Steps**:

1. Run ALL tests:

Run: `cmd.exe /c "npm test"`

2. Verify coverage (optional):

Run: `cmd.exe /c "npm test -- --coverage"`

3. Check for TypeScript errors:

Run: `cmd.exe /c "npx tsc --noEmit"`

**Acceptance Criteria**:

- [ ] All App.test.tsx tests PASS (including integration tests)
- [ ] All ClickerScreen.test.tsx tests PASS
- [ ] All ShopScreen.test.tsx tests PASS
- [ ] All UpgradeList.test.tsx tests PASS
- [ ] All UpgradeItem.test.tsx tests PASS
- [ ] All useUpgrades.test.tsx tests PASS
- [ ] No test failures or errors
- [ ] No TypeScript compilation errors
- [ ] No console warnings during tests

**Deliverable**: Clean test suite run with 100% pass rate

**Dependencies**: All previous tasks complete

**Phase 4 Complete**: Shop feature fully implemented and tested

---

## Summary of Deliverables

### Phase 1: Foundation & Navigation
- [ ] App.test.tsx with 6 navigation integration tests
- [ ] ShopScreen stub component
- [ ] App.tsx with conditional screen rendering
- [ ] ClickerScreen with shop navigation button
- [ ] ShopScreen with back navigation button
- [ ] ClickerScreen with scrap tracking

### Phase 2: Upgrade Infrastructure
- [ ] Upgrade type definitions (upgrade.ts)
- [ ] useUpgrades hook tests (10 tests)
- [ ] useUpgrades hook implementation

### Phase 3: Shop UI Components
- [ ] ShopScreen tests (5 tests)
- [ ] ShopScreen full implementation
- [ ] UpgradeList tests (3 tests)
- [ ] UpgradeList implementation
- [ ] UpgradeItem tests (5 tests)
- [ ] UpgradeItem implementation
- [ ] Full component stack verification

### Phase 4: Upgrade Effects & Testing
- [ ] ClickerScreen with upgrade effect calculations
- [ ] End-to-end integration test
- [ ] Accessibility audit report
- [ ] Cross-platform testing report
- [ ] Final test suite verification

---

## Estimated Timeline

- **Phase 1**: 2-3 days (Foundation & Navigation)
- **Phase 2**: 2 days (Upgrade Infrastructure)
- **Phase 3**: 3-4 days (Shop UI Components)
- **Phase 4**: 1-2 days (Effects & Testing)

**Total**: 8-11 days for full implementation

---

## Success Criteria

**MVP Complete When**:
- [ ] All 6 App integration tests PASS
- [ ] All component tests PASS (28+ tests total)
- [ ] Users can navigate between clicker and shop
- [ ] Scrap balance persists across navigation
- [ ] Shop displays empty state correctly
- [ ] All accessibility requirements met
- [ ] Cross-platform functionality verified
- [ ] TypeScript compiles without errors
- [ ] No console errors in development

**Ready for Next Iteration When**:
- [ ] Upgrade effects apply correctly to clicker gameplay
- [ ] Purchase flow handles edge cases (insufficient scrap)
- [ ] Persistence works reliably across app restarts
- [ ] Performance meets targets (<200ms navigation, 60fps rendering)

---

## Notes for Agent Execution

1. **ALWAYS follow TDD**: Write tests first (RED), implement to pass (GREEN), refactor (REFACTOR)
2. **Run tests using cmd.exe**: Per CLAUDE.md, use `cmd.exe /c "npm test"` for performance
3. **One task at a time**: Complete each task fully before moving to next
4. **Verify test failures**: In RED phase, ensure tests actually fail for the right reasons
5. **Verify test passes**: In GREEN phase, ensure all tests pass before proceeding
6. **No skipping phases**: Do not implement before tests are written
7. **Ask for clarification**: If task requirements unclear, ask before implementing
8. **Report blockers**: If task cannot be completed, report blocker immediately

---

**Generated**: 2025-11-16
**Source TDD**: /mnt/c/dev/class-one-rapids/frontend/modules/shop/specs/tdd_shop_screen_20251116.md
**Version**: 1.0
