# Shop Screen Implementation Task List

## Document Control

| Version | Author | Date | Status | Source TDD |
|---------|--------|------|--------|------------|
| v1.0 | Claude Code | 2025-11-16 | Active | `/mnt/c/dev/class-one-rapids/frontend/modules/shop/specs/tdd_shop.md` |

## Overview

This task list provides granular, agent-executable tasks for implementing the Shop Screen feature following Test-Driven Development (TDD) methodology. Each task specifies exact files to modify/create, test requirements, implementation requirements, and acceptance criteria.

**Implementation Approach**: TDD (Test First)
- Write failing tests first
- Implement minimal code to pass tests
- Refactor while keeping tests green

## Phase 1: State Foundation

### Task 1.1: Add Upgrade Type Definitions to gameStore

**Task ID**: SHOP-001
**Phase**: 1 - State Foundation
**Dependencies**: None
**Estimated Effort**: 15 minutes

**Description**: Add TypeScript interfaces and type definitions for the upgrade system to gameStore.ts

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`
- **Tests to Add**:
  - Test that `Upgrade` interface is correctly typed (TypeScript compilation)
  - No runtime tests needed for type definitions

**Implementation Requirements**:
1. Add `UpgradeType` type definition:
   ```typescript
   export type UpgradeType = 'scrap-per-pet' | 'pets-per-feed';
   ```

2. Add `Upgrade` interface:
   ```typescript
   export interface Upgrade {
     id: string;
     name: string;
     description: string;
     scrapCost: number;
     type: UpgradeType;
     effectValue: number;
     maxLevel?: number;
     currentLevel?: number;
   }
   ```

**Acceptance Criteria**:
- [ ] TypeScript compiles without errors
- [ ] Exported types can be imported in other files
- [ ] Interface includes all required properties per TDD spec

---

### Task 1.2: Add Shop State Observables to gameStore

**Task ID**: SHOP-002
**Phase**: 1 - State Foundation
**Dependencies**: SHOP-001
**Estimated Effort**: 20 minutes

**Description**: Add upgrades and purchasedUpgrades observables to the gameState$ object

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`
- **Tests to Add**:
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
  ```

**Implementation Requirements**:
1. Update `gameState$` observable in gameStore.ts:
   ```typescript
   export const gameState$ = observable({
     petCount: 0,
     scrap: 0,
     upgrades: [] as Upgrade[],
     purchasedUpgrades: [] as string[],
   });
   ```

2. Ensure proper TypeScript typing for arrays

**Acceptance Criteria**:
- [ ] All 4 tests pass
- [ ] No regressions in existing gameStore tests
- [ ] Observables are reactive (can call .get() and .set())
- [ ] Arrays are properly typed

---

### Task 1.3: Add availableUpgrades$ Computed Observable

**Task ID**: SHOP-003
**Phase**: 1 - State Foundation
**Dependencies**: SHOP-002
**Estimated Effort**: 25 minutes

**Description**: Create a computed observable that filters out purchased upgrades from the full upgrades list

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`
- **Tests to Add**:
  ```typescript
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

    test('returns empty array when no upgrades exist', () => {
      gameState$.upgrades.set([]);
      gameState$.purchasedUpgrades.set([]);

      expect(availableUpgrades$.get()).toEqual([]);
    });
  });
  ```

**Implementation Requirements**:
1. Add computed observable after `scrapRate$`:
   ```typescript
   export const availableUpgrades$ = computed(() => {
     const allUpgrades = gameState$.upgrades.get();
     const purchased = gameState$.purchasedUpgrades.get();
     return allUpgrades.filter(u => !purchased.includes(u.id));
   });
   ```

2. Export the computed observable

**Acceptance Criteria**:
- [ ] All 4 tests pass
- [ ] Computed updates automatically when upgrades or purchasedUpgrades change
- [ ] Returns correct filtered array in all scenarios
- [ ] No regressions in existing tests

---

### Task 1.4: Add getScrapMultiplier Helper Function

**Task ID**: SHOP-004
**Phase**: 1 - State Foundation
**Dependencies**: SHOP-002
**Estimated Effort**: 30 minutes

**Description**: Create helper function to calculate scrap multiplier from purchased upgrades (returns 1.0 for MVP)

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`
- **Tests to Add**:
  ```typescript
  describe('getScrapMultiplier', () => {
    beforeEach(() => {
      gameState$.upgrades.set([]);
      gameState$.purchasedUpgrades.set([]);
    });

    test('returns 1.0 baseline when no upgrades purchased', () => {
      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.0);
    });

    test('returns 1.0 when no upgrades exist', () => {
      gameState$.upgrades.set([]);
      gameState$.purchasedUpgrades.set([]);

      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.0);
    });

    test('ignores pets-per-feed upgrades', () => {
      gameState$.upgrades.set([
        { id: 'pet-upgrade', name: 'Pet Boost', description: '', scrapCost: 100, type: 'pets-per-feed', effectValue: 2 },
      ]);
      gameState$.purchasedUpgrades.set(['pet-upgrade']);

      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.0);
    });

    test('calculates correct multiplier with one scrap-per-pet upgrade', () => {
      gameState$.upgrades.set([
        { id: 'scrap-1', name: 'Scrap Boost', description: '', scrapCost: 100, type: 'scrap-per-pet', effectValue: 0.5 },
      ]);
      gameState$.purchasedUpgrades.set(['scrap-1']);

      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.5);
    });

    test('calculates correct multiplier with multiple scrap-per-pet upgrades', () => {
      gameState$.upgrades.set([
        { id: 'scrap-1', name: 'Scrap Boost I', description: '', scrapCost: 100, type: 'scrap-per-pet', effectValue: 0.5 },
        { id: 'scrap-2', name: 'Scrap Boost II', description: '', scrapCost: 500, type: 'scrap-per-pet', effectValue: 1.0 },
      ]);
      gameState$.purchasedUpgrades.set(['scrap-1', 'scrap-2']);

      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(2.5);
    });

    test('only counts purchased upgrades', () => {
      gameState$.upgrades.set([
        { id: 'scrap-1', name: 'Scrap Boost I', description: '', scrapCost: 100, type: 'scrap-per-pet', effectValue: 0.5 },
        { id: 'scrap-2', name: 'Scrap Boost II', description: '', scrapCost: 500, type: 'scrap-per-pet', effectValue: 1.0 },
      ]);
      gameState$.purchasedUpgrades.set(['scrap-1']); // Only purchased first one

      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.5);
    });
  });
  ```

**Implementation Requirements**:
1. Add helper function before `scrapRate$` definition:
   ```typescript
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
   ```

2. Export function for testing:
   ```typescript
   export { getScrapMultiplier }; // For testing
   ```

**Acceptance Criteria**:
- [ ] All 6 tests pass
- [ ] Function returns 1.0 for MVP (no upgrades)
- [ ] Function correctly filters by upgrade type
- [ ] Function correctly sums effectValue
- [ ] Function is exported for testing

---

### Task 1.5: Update scrapRate$ to Use getScrapMultiplier

**Task ID**: SHOP-005
**Phase**: 1 - State Foundation
**Dependencies**: SHOP-004
**Estimated Effort**: 15 minutes

**Description**: Modify scrapRate$ computed to use dynamic multiplier from upgrades instead of hardcoded 1

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`
- **Tests to Add**:
  ```typescript
  describe('scrapRate$ with upgrades', () => {
    beforeEach(() => {
      gameState$.petCount.set(0);
      gameState$.upgrades.set([]);
      gameState$.purchasedUpgrades.set([]);
    });

    test('uses baseline multiplier when no upgrades', () => {
      gameState$.petCount.set(10);

      const rate = scrapRate$.get();
      expect(rate).toBe(10); // 10 pets * 1.0 multiplier
    });

    test('uses upgraded multiplier when scrap-per-pet purchased', () => {
      gameState$.petCount.set(10);
      gameState$.upgrades.set([
        { id: 'scrap-1', name: 'Boost', description: '', scrapCost: 100, type: 'scrap-per-pet', effectValue: 0.5 },
      ]);
      gameState$.purchasedUpgrades.set(['scrap-1']);

      const rate = scrapRate$.get();
      expect(rate).toBe(15); // 10 pets * 1.5 multiplier
    });

    test('scrapRate$ updates reactively when upgrade purchased', () => {
      gameState$.petCount.set(10);
      gameState$.upgrades.set([
        { id: 'scrap-1', name: 'Boost', description: '', scrapCost: 100, type: 'scrap-per-pet', effectValue: 1.0 },
      ]);

      const rateBefore = scrapRate$.get();
      expect(rateBefore).toBe(10); // No upgrades yet

      gameState$.purchasedUpgrades.set(['scrap-1']);

      const rateAfter = scrapRate$.get();
      expect(rateAfter).toBe(20); // 10 pets * 2.0 multiplier
    });
  });
  ```

**Implementation Requirements**:
1. Update `scrapRate$` computed:
   ```typescript
   export const scrapRate$ = computed(() => {
     const petCount = gameState$.petCount.get();
     const scrapMultiplier = getScrapMultiplier(); // Changed from hardcoded 1
     return Math.floor(petCount * scrapMultiplier);
   });
   ```

**Acceptance Criteria**:
- [ ] All 3 new tests pass
- [ ] All existing scrapRate$ tests still pass
- [ ] scrapRate$ reactively updates when upgrades change
- [ ] No breaking changes to existing functionality

---

### Task 1.6: Update useGameState Hook to Expose Shop State

**Task ID**: SHOP-006
**Phase**: 1 - State Foundation
**Dependencies**: SHOP-003
**Estimated Effort**: 20 minutes

**Description**: Add upgrades, purchasedUpgrades, and availableUpgrades observables to useGameState hook return object

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useGameState.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useGameState.test.ts`
- **Tests to Add**:
  ```typescript
  describe('useGameState shop state access', () => {
    test('exposes upgrades$ observable', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.upgrades$).toBeDefined();
      expect(result.current.upgrades$.get()).toEqual([]);
    });

    test('exposes purchasedUpgrades$ observable', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.purchasedUpgrades$).toBeDefined();
      expect(result.current.purchasedUpgrades$.get()).toEqual([]);
    });

    test('exposes availableUpgrades$ computed', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.availableUpgrades$).toBeDefined();
      expect(result.current.availableUpgrades$.get()).toEqual([]);
    });

    test('upgrades$ updates when state changes', () => {
      const { result } = renderHook(() => useGameState());

      const testUpgrade: Upgrade = {
        id: 'test',
        name: 'Test Upgrade',
        description: 'Test',
        scrapCost: 100,
        type: 'scrap-per-pet',
        effectValue: 0.5,
      };

      act(() => {
        gameState$.upgrades.set([testUpgrade]);
      });

      expect(result.current.upgrades$.get()).toEqual([testUpgrade]);
    });
  });
  ```

**Implementation Requirements**:
1. Import `availableUpgrades$` from gameStore
2. Update useGameState return object:
   ```typescript
   export function useGameState() {
     return {
       petCount$: gameState$.petCount,
       scrap$: gameState$.scrap,
       scrapRate$: scrapRate$,
       upgrades$: gameState$.upgrades,
       purchasedUpgrades$: gameState$.purchasedUpgrades,
       availableUpgrades$: availableUpgrades$,
     };
   }
   ```

**Acceptance Criteria**:
- [ ] All 4 tests pass
- [ ] All existing useGameState tests still pass
- [ ] Hook properly exposes all shop-related observables
- [ ] No TypeScript errors

---

## Phase 2: ShopScreen Component

### Task 2.1: Create ShopScreen Component Structure

**Task ID**: SHOP-007
**Phase**: 2 - ShopScreen Component
**Dependencies**: SHOP-006
**Estimated Effort**: 30 minutes

**Description**: Create basic ShopScreen component file with imports, props interface, and skeleton structure

**Files to Create**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`
- **Tests to Add**:
  ```typescript
  import React from 'react';
  import { render, screen } from '@testing-library/react-native';
  import { ShopScreen } from './ShopScreen';
  import { gameState$ } from '../../shared/store/gameStore';

  describe('ShopScreen', () => {
    beforeEach(() => {
      gameState$.scrap.set(0);
      gameState$.upgrades.set([]);
      gameState$.purchasedUpgrades.set([]);
    });

    describe('Initial Render', () => {
      test('renders without crashing', () => {
        render(<ShopScreen onNavigateBack={() => {}} />);
        expect(screen.toJSON()).toBeTruthy();
      });

      test('accepts onNavigateBack prop', () => {
        const mockCallback = jest.fn();
        render(<ShopScreen onNavigateBack={mockCallback} />);
        // Component should render without error
        expect(screen.toJSON()).toBeTruthy();
      });
    });
  });
  ```

**Implementation Requirements**:
1. Create file with basic structure:
   ```typescript
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
         <View>
           <Text>Shop Screen</Text>
         </View>
       </SafeAreaView>
     );
   });

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       backgroundColor: '#FFFFFF',
     },
   });
   ```

**Acceptance Criteria**:
- [ ] File created at correct location
- [ ] All 2 tests pass
- [ ] TypeScript compiles without errors
- [ ] Component wrapped with observer HOC
- [ ] SafeAreaView configured with top/bottom edges

---

### Task 2.2: Add ShopScreen Header with Title

**Task ID**: SHOP-008
**Phase**: 2 - ShopScreen Component
**Dependencies**: SHOP-007
**Estimated Effort**: 20 minutes

**Description**: Implement header section with "Shop" title and proper accessibility attributes

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`
- **Tests to Add**:
  ```typescript
  describe('Header', () => {
    test('displays shop title', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/shop/i)).toBeTruthy();
    });

    test('title has header accessibility role', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      const title = screen.getByRole('header');
      expect(title).toBeTruthy();
      expect(title.props.children).toMatch(/shop/i);
    });
  });
  ```

**Implementation Requirements**:
1. Add header View with title Text:
   ```typescript
   return (
     <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
       <View style={styles.header}>
         <Text
           style={styles.title}
           accessibilityRole="header"
         >
           Shop
         </Text>
       </View>
     </SafeAreaView>
   );
   ```

2. Add styles:
   ```typescript
   header: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     padding: 20,
     borderBottomWidth: 1,
     borderBottomColor: '#E0E0E0',
   },
   title: {
     fontSize: 24,
     fontWeight: 'bold',
     color: '#000000',
   },
   ```

**Acceptance Criteria**:
- [ ] Both tests pass
- [ ] Title displays "Shop"
- [ ] Title has header accessibility role
- [ ] Header has visual separation (border)

---

### Task 2.3: Add Back Button to ShopScreen Header

**Task ID**: SHOP-009
**Phase**: 2 - ShopScreen Component
**Dependencies**: SHOP-008
**Estimated Effort**: 25 minutes

**Description**: Add back navigation button to header with proper accessibility and touch target size

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`
- **Tests to Add**:
  ```typescript
  import { fireEvent } from '@testing-library/react-native';

  describe('Navigation', () => {
    test('displays back button', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeTruthy();
    });

    test('calls onNavigateBack when back button pressed', () => {
      const mockNavigateBack = jest.fn();
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.press(backButton);

      expect(mockNavigateBack).toHaveBeenCalledTimes(1);
    });

    test('back button has accessible label', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton.props.accessibilityLabel).toMatch(/back/i);
    });
  });
  ```

**Implementation Requirements**:
1. Add Pressable with back button before title:
   ```typescript
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
   </View>
   ```

2. Add styles:
   ```typescript
   backButton: {
     minWidth: 44,
     minHeight: 44,
     justifyContent: 'center',
   },
   backButtonText: {
     fontSize: 16,
     color: '#007AFF',
   },
   ```

**Acceptance Criteria**:
- [ ] All 3 tests pass
- [ ] Back button calls onNavigateBack callback
- [ ] Button meets 44x44pt minimum touch target
- [ ] Button has proper accessibility attributes

---

### Task 2.4: Add Scrap Balance Display to Header

**Task ID**: SHOP-010
**Phase**: 2 - ShopScreen Component
**Dependencies**: SHOP-009
**Estimated Effort**: 25 minutes

**Description**: Display current scrap balance in header, updating reactively via Legend-State

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`
- **Tests to Add**:
  ```typescript
  describe('Scrap Balance Display', () => {
    test('displays scrap balance', () => {
      gameState$.scrap.set(100);
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/scrap: 100/i)).toBeTruthy();
    });

    test('displays zero scrap initially', () => {
      gameState$.scrap.set(0);
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/scrap: 0/i)).toBeTruthy();
    });

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

    test('scrap balance has accessibility attributes', () => {
      gameState$.scrap.set(100);
      render(<ShopScreen onNavigateBack={() => {}} />);

      const scrapText = screen.getByText(/scrap: 100/i);
      expect(scrapText.props.accessibilityRole).toBe('text');
    });
  });
  ```

**Implementation Requirements**:
1. Add scrap balance Text after title in header:
   ```typescript
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
   ```

2. Add style:
   ```typescript
   scrapBalance: {
     fontSize: 16,
     color: '#000000',
   },
   ```

**Acceptance Criteria**:
- [ ] All 5 tests pass
- [ ] Scrap balance displays correctly
- [ ] Balance updates reactively when scrap$ changes
- [ ] Accessibility attributes present
- [ ] Handles all scrap values (0, large numbers)

---

### Task 2.5: Add Empty State Display

**Task ID**: SHOP-011
**Phase**: 2 - ShopScreen Component
**Dependencies**: SHOP-010
**Estimated Effort**: 30 minutes

**Description**: Implement empty state UI when no upgrades are available, with conditional rendering

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`
- **Tests to Add**:
  ```typescript
  describe('Empty State', () => {
    test('displays empty state when no upgrades', () => {
      gameState$.upgrades.set([]);
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/no upgrades available/i)).toBeTruthy();
    });

    test('displays empty state subtext', () => {
      gameState$.upgrades.set([]);
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/check back soon/i)).toBeTruthy();
    });

    test('empty state text has accessibility role', () => {
      gameState$.upgrades.set([]);
      render(<ShopScreen onNavigateBack={() => {}} />);

      const emptyText = screen.getByText(/no upgrades available/i);
      expect(emptyText.props.accessibilityRole).toBe('text');
    });

    test('does not display empty state when upgrades exist', () => {
      gameState$.upgrades.set([
        {
          id: 'test',
          name: 'Test Upgrade',
          description: 'Test',
          scrapCost: 100,
          type: 'scrap-per-pet',
          effectValue: 0.5,
        },
      ]);

      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.queryByText(/no upgrades available/i)).toBeNull();
    });
  });
  ```

**Implementation Requirements**:
1. Add content section with conditional rendering:
   ```typescript
   return (
     <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
       <View style={styles.header}>
         {/* ... existing header code ... */}
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
           <Text>Upgrades list (future)</Text>
         )}
       </View>
     </SafeAreaView>
   );
   ```

2. Add styles:
   ```typescript
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
   ```

**Acceptance Criteria**:
- [ ] All 4 tests pass
- [ ] Empty state displays when upgrades array is empty
- [ ] Empty state hidden when upgrades exist
- [ ] Text centered with proper styling
- [ ] Accessibility attributes present

---

### Task 2.6: Add Accessibility Tests for ShopScreen

**Task ID**: SHOP-012
**Phase**: 2 - ShopScreen Component
**Dependencies**: SHOP-011
**Estimated Effort**: 25 minutes

**Description**: Add comprehensive accessibility tests for all interactive elements and text

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`
- **Tests to Add**:
  ```typescript
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

      // Extract style (may be array or object)
      const style = Array.isArray(backButton.props.style)
        ? backButton.props.style.reduce((acc, s) => ({ ...acc, ...s }), {})
        : backButton.props.style;

      expect(style.minWidth).toBeGreaterThanOrEqual(44);
      expect(style.minHeight).toBeGreaterThanOrEqual(44);
    });

    test('all text elements have appropriate roles', () => {
      gameState$.scrap.set(100);
      gameState$.upgrades.set([]);

      render(<ShopScreen onNavigateBack={() => {}} />);

      // Check header
      expect(screen.getByRole('header')).toBeTruthy();

      // Check text elements
      const textElements = screen.getAllByRole('text');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });
  ```

**Implementation Requirements**:
- No code changes required
- Tests verify existing accessibility implementation

**Acceptance Criteria**:
- [ ] All 4 tests pass
- [ ] All accessibility roles validated
- [ ] Touch target sizes verified
- [ ] Accessibility labels validated

---

## Phase 3: Navigation Integration

### Task 3.1: Update App.tsx with Navigation State

**Task ID**: SHOP-013
**Phase**: 3 - Navigation Integration
**Dependencies**: SHOP-012
**Estimated Effort**: 25 minutes

**Description**: Add screen state management to App.tsx with type-safe screen values

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/App.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`
- **Tests to Add**:
  ```typescript
  import React from 'react';
  import { render, screen } from '@testing-library/react-native';
  import App from './App';
  import { gameState$ } from './shared/store/gameStore';

  describe('App', () => {
    beforeEach(() => {
      gameState$.petCount.set(0);
      gameState$.scrap.set(0);
      gameState$.upgrades.set([]);
      gameState$.purchasedUpgrades.set([]);
    });

    test('renders without crashing', () => {
      render(<App />);
      expect(screen.toJSON()).toBeTruthy();
    });

    test('renders ClickerScreen by default', () => {
      render(<App />);
      // ClickerScreen has "Singularity Pet Count" text
      expect(screen.getByText(/singularity pet count/i)).toBeTruthy();
    });

    test('wraps content in SafeAreaProvider', () => {
      const { root } = render(<App />);
      // SafeAreaProvider should be in tree
      expect(root).toBeTruthy();
    });
  });
  ```

**Implementation Requirements**:
1. Update App.tsx with navigation state:
   ```typescript
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

**Acceptance Criteria**:
- [ ] All 3 tests pass
- [ ] App renders ClickerScreen by default
- [ ] TypeScript Screen type properly defined
- [ ] SafeAreaProvider still wraps content

---

### Task 3.2: Add Navigation Tests to App.test.tsx

**Task ID**: SHOP-014
**Phase**: 3 - Navigation Integration
**Dependencies**: SHOP-013
**Estimated Effort**: 35 minutes

**Description**: Add comprehensive navigation flow tests to verify screen switching and state preservation

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`
- **Tests to Add**:
  ```typescript
  import { fireEvent, waitFor } from '@testing-library/react-native';

  describe('App Navigation', () => {
    beforeEach(() => {
      gameState$.petCount.set(0);
      gameState$.scrap.set(0);
      gameState$.upgrades.set([]);
      gameState$.purchasedUpgrades.set([]);
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

      // Set scrap balance
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

    test('preserves pet count during navigation', () => {
      render(<App />);

      // Add pets
      gameState$.petCount.set(5);

      // Navigate to shop and back
      const shopButton = screen.getByRole('button', { name: /shop/i });
      fireEvent.press(shopButton);

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.press(backButton);

      // Verify pet count preserved
      expect(screen.getByText(/5/)).toBeTruthy();
    });

    test('can navigate back and forth multiple times', () => {
      render(<App />);

      // First round trip
      fireEvent.press(screen.getByRole('button', { name: /shop/i }));
      fireEvent.press(screen.getByRole('button', { name: /back/i }));

      // Second round trip
      fireEvent.press(screen.getByRole('button', { name: /shop/i }));
      fireEvent.press(screen.getByRole('button', { name: /back/i }));

      // Third round trip
      fireEvent.press(screen.getByRole('button', { name: /shop/i }));
      expect(screen.getByRole('header', { name: /shop/i })).toBeTruthy();
    });
  });
  ```

**Implementation Requirements**:
- No code changes required
- Tests verify navigation implementation from SHOP-013

**Acceptance Criteria**:
- [ ] All 5 tests pass
- [ ] Navigation works bidirectionally
- [ ] State preserved across navigation
- [ ] Multiple navigation cycles work correctly

---

### Task 3.3: Update ClickerScreen with Navigation Prop

**Task ID**: SHOP-015
**Phase**: 3 - Navigation Integration
**Dependencies**: SHOP-013
**Estimated Effort**: 20 minutes

**Description**: Add onNavigateToShop prop to ClickerScreen interface and update component signature

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`
- **Tests to Add**:
  ```typescript
  describe('ClickerScreen props', () => {
    test('accepts onNavigateToShop prop', () => {
      const mockNavigate = jest.fn();
      render(<ClickerScreen onNavigateToShop={mockNavigate} />);
      expect(screen.toJSON()).toBeTruthy();
    });

    test('renders without error when onNavigateToShop provided', () => {
      expect(() => {
        render(<ClickerScreen onNavigateToShop={() => {}} />);
      }).not.toThrow();
    });
  });
  ```

**Implementation Requirements**:
1. Add interface and update component signature in ClickerScreen.tsx:
   ```typescript
   interface ClickerScreenProps {
     onNavigateToShop: () => void;
   }

   export const ClickerScreen = observer(function ClickerScreen({
     onNavigateToShop
   }: ClickerScreenProps) {
     // ... existing code ...
   });
   ```

**Acceptance Criteria**:
- [ ] Both tests pass
- [ ] Component accepts onNavigateToShop prop
- [ ] TypeScript compiles without errors
- [ ] No regressions in existing tests

---

### Task 3.4: Add Shop Button to ClickerScreen

**Task ID**: SHOP-016
**Phase**: 3 - Navigation Integration
**Dependencies**: SHOP-015
**Estimated Effort**: 30 minutes

**Description**: Add shop navigation button to ClickerScreen UI with accessibility attributes

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`
- **Tests to Add**:
  ```typescript
  import { fireEvent } from '@testing-library/react-native';

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

    test('shop button has accessible label', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const shopButton = screen.getByRole('button', { name: /shop/i });
      expect(shopButton.props.accessibilityLabel).toMatch(/shop/i);
    });

    test('shop button meets minimum touch target size', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const shopButton = screen.getByRole('button', { name: /shop/i });

      const style = Array.isArray(shopButton.props.style)
        ? shopButton.props.style.reduce((acc, s) => ({ ...acc, ...s }), {})
        : shopButton.props.style;

      expect(style.minWidth).toBeGreaterThanOrEqual(44);
      expect(style.minHeight).toBeGreaterThanOrEqual(44);
    });
  });
  ```

**Implementation Requirements**:
1. Read current ClickerScreen.tsx to find button placement location
2. Add Pressable for shop button after feed button:
   ```typescript
   <Pressable
     style={styles.shopButton}
     onPress={onNavigateToShop}
     accessibilityRole="button"
     accessibilityLabel="Open shop"
   >
     <Text style={styles.shopButtonText}>Shop</Text>
   </Pressable>
   ```

3. Add styles to existing StyleSheet:
   ```typescript
   shopButton: {
     minWidth: 44,
     minHeight: 44,
     backgroundColor: '#007AFF',
     paddingVertical: 12,
     paddingHorizontal: 24,
     borderRadius: 8,
     alignItems: 'center',
     justifyContent: 'center',
     marginTop: 16,
   },
   shopButtonText: {
     fontSize: 18,
     fontWeight: 'bold',
     color: '#FFFFFF',
   },
   ```

**Acceptance Criteria**:
- [ ] All 4 tests pass
- [ ] Shop button visible in UI
- [ ] Button calls navigation callback
- [ ] Meets accessibility requirements (44x44pt, label, role)
- [ ] Styled consistently with existing buttons

---

## Phase 4: Integration Testing & Validation

### Task 4.1: Add End-to-End Navigation Integration Test

**Task ID**: SHOP-017
**Phase**: 4 - Integration Testing
**Dependencies**: SHOP-016
**Estimated Effort**: 30 minutes

**Description**: Create comprehensive end-to-end test simulating full user navigation flow

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`
- **Tests to Add**:
  ```typescript
  describe('Shop Integration - End to End', () => {
    test('complete navigation flow with scrap balance', async () => {
      render(<App />);

      // Start on main screen
      expect(screen.getByText(/singularity pet count/i)).toBeTruthy();

      // Feed to get pets
      const feedButton = screen.getByRole('button', { name: /feed/i });
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);

      // Verify pets added
      expect(gameState$.petCount.get()).toBe(3);

      // Wait for scrap generation (pets generate scrap over time)
      await waitFor(() => {
        expect(gameState$.scrap.get()).toBeGreaterThan(0);
      }, { timeout: 3000 });

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

      // Verify game state unchanged
      expect(gameState$.petCount.get()).toBe(3);
      expect(screen.getByText(new RegExp(`scrap: ${scrapBefore}`, 'i'))).toBeTruthy();
    });

    test('shop displays empty state initially', () => {
      render(<App />);

      // Navigate to shop
      const shopButton = screen.getByRole('button', { name: /shop/i });
      fireEvent.press(shopButton);

      // Verify empty state
      expect(screen.getByText(/no upgrades available/i)).toBeTruthy();
      expect(screen.getByText(/check back soon/i)).toBeTruthy();
    });

    test('scrap balance syncs between screens', () => {
      render(<App />);

      // Set scrap on main screen
      gameState$.scrap.set(1234);
      expect(screen.getByText(/scrap: 1234/i)).toBeTruthy();

      // Navigate to shop
      fireEvent.press(screen.getByRole('button', { name: /shop/i }));

      // Verify same scrap in shop
      expect(screen.getByText(/scrap: 1234/i)).toBeTruthy();

      // Update scrap while in shop
      gameState$.scrap.set(5678);

      // Verify shop updates
      expect(screen.getByText(/scrap: 5678/i)).toBeTruthy();

      // Navigate back
      fireEvent.press(screen.getByRole('button', { name: /back/i }));

      // Verify main screen has updated scrap
      expect(screen.getByText(/scrap: 5678/i)).toBeTruthy();
    });
  });
  ```

**Implementation Requirements**:
- No code changes required
- Tests verify complete integration

**Acceptance Criteria**:
- [ ] All 3 tests pass
- [ ] End-to-end flow works correctly
- [ ] State syncs across screens
- [ ] Empty state displays properly
- [ ] All existing tests still pass

---

### Task 4.2: Run Full Test Suite and Verify Coverage

**Task ID**: SHOP-018
**Phase**: 4 - Integration Testing
**Dependencies**: SHOP-017
**Estimated Effort**: 20 minutes

**Description**: Run complete test suite using cmd.exe (per CLAUDE.md), verify all tests pass and coverage > 80%

**Files to Modify**:
- None (verification task)

**Test Requirements**:
- **Command to Run**: `cmd.exe /c "npm test -- --coverage --watchAll=false"`
- **Expected Results**:
  - All tests pass (0 failures)
  - Coverage > 80% for new files:
    - ShopScreen.tsx
    - Updated gameStore.ts
    - Updated useGameState.ts
  - No regressions in existing tests

**Implementation Requirements**:
1. Run test command via cmd.exe (Windows/WSL requirement per CLAUDE.md)
2. Review coverage report
3. Identify any gaps in coverage
4. Add additional tests if coverage < 80%

**Acceptance Criteria**:
- [ ] All tests pass with 0 failures
- [ ] ShopScreen.tsx coverage > 80%
- [ ] gameStore.ts shop state coverage > 80%
- [ ] useGameState.ts shop state coverage > 80%
- [ ] No regressions in ClickerScreen tests
- [ ] No regressions in App tests

---

### Task 4.3: Manual Testing - iOS and Android

**Task ID**: SHOP-019
**Phase**: 4 - Integration Testing
**Dependencies**: SHOP-018
**Estimated Effort**: 40 minutes

**Description**: Perform manual testing on iOS simulator and Android emulator to verify visual polish and interaction

**Files to Modify**:
- None (manual testing task)

**Test Requirements**:
- **Manual Test Cases**:

  **iOS Testing**:
  1. Launch app on iOS simulator
  2. Verify ClickerScreen displays correctly
  3. Tap Shop button
  4. Verify navigation animation (if any)
  5. Verify ShopScreen displays correctly
  6. Check header alignment and spacing
  7. Verify scrap balance displays
  8. Verify empty state message centered
  9. Tap Back button
  10. Verify return to ClickerScreen
  11. Test safe area on iPhone with notch (iPhone 14 Pro)
  12. Verify no overlap with notch/dynamic island

  **Android Testing**:
  1. Launch app on Android emulator
  2. Verify ClickerScreen displays correctly
  3. Tap Shop button
  4. Verify ShopScreen displays
  5. Verify header and content layout
  6. Test hardware back button
  7. Verify hardware back navigates to ClickerScreen
  8. Test on different screen sizes
  9. Verify safe area handling

  **Cross-Platform**:
  1. Generate scrap by feeding pets
  2. Navigate to shop
  3. Verify scrap balance matches
  4. Navigate back
  5. Verify scrap continues generating
  6. Navigate to shop again
  7. Verify updated scrap balance

**Implementation Requirements**:
- Document any visual issues
- Take screenshots of both platforms
- Note any performance issues
- Verify navigation response time < 100ms
- Verify render time < 100ms

**Acceptance Criteria**:
- [ ] App runs without crashes on iOS
- [ ] App runs without crashes on Android
- [ ] Navigation works on both platforms
- [ ] Safe areas handled correctly
- [ ] Android hardware back button works
- [ ] No visual layout issues
- [ ] Performance targets met
- [ ] Scrap balance syncs correctly

---

### Task 4.4: Accessibility Audit - Screen Reader Testing

**Task ID**: SHOP-020
**Phase**: 4 - Integration Testing
**Dependencies**: SHOP-019
**Estimated Effort**: 30 minutes

**Description**: Test with iOS VoiceOver and Android TalkBack to ensure screen reader accessibility

**Files to Modify**:
- None (accessibility testing task)

**Test Requirements**:
- **iOS VoiceOver Test Cases**:
  1. Enable VoiceOver on iOS simulator
  2. Navigate to ShopScreen
  3. Verify header reads as "Shop, header"
  4. Verify back button reads "Back to main screen, button"
  5. Verify scrap balance has proper label
  6. Verify empty state text readable
  7. Test shop button on ClickerScreen
  8. Verify focus order is logical (top to bottom)

  **Android TalkBack Test Cases**:
  1. Enable TalkBack on Android emulator
  2. Navigate to ShopScreen
  3. Verify all elements have proper labels
  4. Verify buttons announce role and label
  5. Test navigation with TalkBack gestures
  6. Verify focus order

  **Touch Target Validation**:
  1. Measure shop button dimensions
  2. Measure back button dimensions
  3. Verify both ≥ 44x44pt

  **Color Contrast**:
  1. Use WebAIM Contrast Checker on text colors
  2. Verify black (#000000) on white (#FFFFFF) = 21:1 (WCAG AAA)
  3. Verify blue (#007AFF) on white ≥ 4.5:1 (WCAG AA)
  4. Verify gray (#666666) on white ≥ 4.5:1

**Implementation Requirements**:
- Document any accessibility issues
- Fix any found issues
- Re-test after fixes

**Acceptance Criteria**:
- [ ] VoiceOver reads all elements correctly
- [ ] TalkBack reads all elements correctly
- [ ] Focus order is logical
- [ ] All buttons ≥ 44x44pt
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] No accessibility errors in React Native

---

### Task 4.5: Performance Testing and Optimization

**Task ID**: SHOP-021
**Phase**: 4 - Integration Testing
**Dependencies**: SHOP-020
**Estimated Effort**: 25 minutes

**Description**: Measure and verify navigation and render performance meets requirements

**Files to Modify**:
- None (performance testing task)

**Test Requirements**:
- **Performance Benchmarks**:

  **Navigation Response Time**:
  1. Add performance measurement in App.tsx (temporary):
     ```typescript
     const handleNavigateToShop = () => {
       const start = performance.now();
       setCurrentScreen('shop');
       requestAnimationFrame(() => {
         const end = performance.now();
         console.log('Navigation time:', end - start, 'ms');
       });
     };
     ```
  2. Measure navigation time (target: < 100ms)
  3. Remove measurement code after testing

  **Shop Screen Render Time**:
  1. Add performance mark in ShopScreen (temporary):
     ```typescript
     useEffect(() => {
       const start = performance.now();
       requestAnimationFrame(() => {
         const end = performance.now();
         console.log('ShopScreen render:', end - start, 'ms');
       });
     }, []);
     ```
  2. Measure first render (target: < 100ms)
  3. Remove measurement code

  **Memory Leak Check**:
  1. Navigate to shop and back 20 times
  2. Monitor memory in React Native debugger
  3. Verify no memory increase (no leaks)

  **Frame Rate**:
  1. Enable React Native performance monitor
  2. Navigate between screens
  3. Verify 60fps maintained (no drops)

**Implementation Requirements**:
- Add temporary performance measurements
- Run tests and record results
- Remove performance measurement code
- Document results

**Acceptance Criteria**:
- [ ] Navigation time < 100ms
- [ ] Shop screen render < 100ms
- [ ] No memory leaks detected
- [ ] 60fps maintained during navigation
- [ ] No frame drops observed
- [ ] Performance measurement code removed

---

### Task 4.6: Final Code Review and Cleanup

**Task ID**: SHOP-022
**Phase**: 4 - Integration Testing
**Dependencies**: SHOP-021
**Estimated Effort**: 30 minutes

**Description**: Review all modified files for code quality, remove any debugging code, ensure consistency

**Files to Review**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`
- `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useGameState.ts`
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/App.tsx`
- All test files

**Test Requirements**:
- **Code Quality Checklist**:
  1. Remove all console.log statements
  2. Remove commented-out code
  3. Verify TypeScript strict mode compliance
  4. Check for unused imports
  5. Verify consistent code formatting
  6. Check for TODO comments
  7. Verify all functions have proper types
  8. Check for any hardcoded values
  9. Verify error handling where needed
  10. Check for proper PropTypes/TypeScript interfaces

**Implementation Requirements**:
1. Run ESLint: `npm run lint`
2. Fix any linting errors
3. Run Prettier: `npm run format` (if available)
4. Review each modified file
5. Check imports are organized
6. Verify exports are explicit
7. Check style consistency

**Acceptance Criteria**:
- [ ] No ESLint errors or warnings
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] All imports used and organized
- [ ] TypeScript strict mode compliance
- [ ] Consistent code formatting
- [ ] No TODO comments remaining
- [ ] All tests still pass after cleanup

---

## Task Summary

### Phase 1: State Foundation (6 tasks)
- SHOP-001: Add Upgrade Type Definitions
- SHOP-002: Add Shop State Observables
- SHOP-003: Add availableUpgrades$ Computed
- SHOP-004: Add getScrapMultiplier Helper
- SHOP-005: Update scrapRate$ to Use Multiplier
- SHOP-006: Update useGameState Hook

**Total Estimated Time**: 2 hours 5 minutes

### Phase 2: ShopScreen Component (6 tasks)
- SHOP-007: Create ShopScreen Structure
- SHOP-008: Add Header with Title
- SHOP-009: Add Back Button
- SHOP-010: Add Scrap Balance Display
- SHOP-011: Add Empty State
- SHOP-012: Add Accessibility Tests

**Total Estimated Time**: 2 hours 35 minutes

### Phase 3: Navigation Integration (4 tasks)
- SHOP-013: Update App.tsx Navigation
- SHOP-014: Add Navigation Tests
- SHOP-015: Update ClickerScreen Props
- SHOP-016: Add Shop Button

**Total Estimated Time**: 1 hour 50 minutes

### Phase 4: Integration Testing (6 tasks)
- SHOP-017: End-to-End Integration Test
- SHOP-018: Test Suite and Coverage
- SHOP-019: Manual Testing
- SHOP-020: Accessibility Audit
- SHOP-021: Performance Testing
- SHOP-022: Code Review and Cleanup

**Total Estimated Time**: 2 hours 55 minutes

### Grand Total
**22 Tasks | ~9.5 Hours Total**

## Notes for Agent Execution

**TDD Methodology**:
1. Always write tests FIRST (before implementation)
2. Run tests to see them FAIL
3. Write minimal code to make tests PASS
4. Refactor while keeping tests GREEN
5. Never skip tests or write implementation first

**Testing Commands** (per CLAUDE.md):
- Run tests: `cmd.exe /c "npm test"`
- Run with coverage: `cmd.exe /c "npm test -- --coverage --watchAll=false"`
- Use cmd.exe due to WSL/Windows slowness issues

**File Paths**:
- All paths are absolute from `/mnt/c/dev/class-one-rapids/`
- Use exact paths as specified in tasks
- Create directories as needed (modules/shop/ structure)

**Dependencies**:
- Each task lists dependencies by Task ID
- Complete tasks sequentially within phases
- Do not skip dependency tasks

**Acceptance Criteria**:
- All checkboxes must be satisfied before marking task complete
- If tests fail, fix implementation before moving on
- No partial completions

**Common Pitfalls**:
- Don't forget `observer` wrapper on components using Legend-State
- Don't forget accessibility attributes (role, label)
- Don't forget minimum 44x44pt touch targets
- Don't forget to reset state in beforeEach
- Don't forget to import types/interfaces

**Success Metrics**:
- All 22 tasks completed
- All tests passing (0 failures)
- Coverage > 80% on new code
- Manual testing successful on both platforms
- Accessibility audit passed
- Performance targets met
- No regressions in existing features

---

Generated by Claude Code from TDD: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/specs/tdd_shop.md`
