# Shop System - Agent-Executable Task List

## Document Control

| Version | Author | Date | Status | Source TDD |
|---------|--------|------|--------|------------|
| v1.0 | Claude (Generated) | 2025-11-16 | Ready for Execution | tdd_shop.md |

---

## Overview

This task list breaks down the Shop System implementation into explicit, sequential, agent-executable tasks following Test-Driven Development (TDD) methodology. Each task includes specific file paths, actions, and success criteria.

**Total Estimated Time**: 3.5 days

**Key Principles**:
- RED-GREEN-REFACTOR cycle for all implementation
- Component integration tests FIRST (before any implementation)
- No implementation without failing tests first
- Tests run via `cmd.exe` (per CLAUDE.md guidelines for WSL performance)

---

## Phase 1: Foundation & Navigation [1.0 day]

### Task 1.1: Create Shop Module Directory Structure

**Objective**: Establish file structure for shop feature

**Actions**:
1. Create directory: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/`
2. Create directory: `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/`
3. Verify directories exist with `ls` command

**Success Criteria**:
- [ ] Directory `/mnt/c/dev/class-one-rapids/frontend/modules/shop/` exists
- [ ] Directory `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/` exists

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/` (directory)
- `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/` (directory)

---

### Task 1.2: Write App Navigation Integration Tests (RED Phase - MANDATORY FIRST)

**Objective**: Write failing integration tests in App.test.tsx that verify navigation between clicker and shop screens

**TDD Phase**: RED (tests must fail initially)

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`
2. Import dependencies:
   - `render, screen, waitFor` from `@testing-library/react-native`
   - `userEvent` from `@testing-library/user-event`
   - `App` from `./App`
   - Mock `@react-native-async-storage/async-storage`
3. Add `beforeEach` hook:
   - `jest.clearAllMocks()`
   - Mock `AsyncStorage.getItem` to return `null`
4. Add test suite: `describe('App Navigation Integration', () => { ... })`
5. Add test: `test('starts on clicker screen', () => { ... })`
   - Render App
   - Verify "Singularity Pet Count" text is visible
6. Add test: `test('navigates to shop when shop button pressed', async () => { ... })`
   - Setup userEvent
   - Render App
   - Find shop button with `getByRole('button', { name: /shop/i })`
   - Press shop button
   - Wait for shop screen to appear (verify "available upgrades" text)
7. Add test: `test('navigates back to clicker when back button pressed', async () => { ... })`
   - Navigate to shop
   - Find back button
   - Press back button
   - Verify back on clicker screen
8. Run tests via `cmd.exe /c "npm test App.test.tsx"`

**Success Criteria**:
- [ ] File created with 3 integration tests
- [ ] All tests FAIL (RED phase confirmed)
- [ ] Error messages indicate missing shop button/screen
- [ ] Tests use proper async/await patterns with `waitFor`

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`

**Reference Implementation** (from TDD Section 8):
```typescript
import { render, screen, waitFor } from '@testing-library/react-native';
import { userEvent } from '@testing-library/user-event';
import App from './App';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('App Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  test('starts on clicker screen', () => {
    render(<App />);
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('navigates to shop when shop button pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
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
      expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
    });
  });
});
```

---

### Task 1.3: Implement useNavigation Hook with TDD [0.25 days]

#### Task 1.3.1: Write useNavigation Tests (RED Phase)

**Objective**: Write failing tests for navigation hook

**TDD Phase**: RED

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useNavigation.test.ts`
2. Import dependencies:
   - `renderHook, act` from `@testing-library/react-native`
   - `useNavigation` from `./useNavigation`
3. Add test suite: `describe('useNavigation Hook', () => { ... })`
4. Add test: `test('initializes to clicker screen', () => { ... })`
   - Render hook
   - Expect: `currentScreen$.get()` equals `'clicker'`
5. Add test: `test('navigates to shop', () => { ... })`
   - Render hook
   - Call `actions.navigateToShop()`
   - Expect: `currentScreen$.get()` equals `'shop'`
6. Add test: `test('navigates back to clicker', () => { ... })`
   - Navigate to shop
   - Call `actions.navigateToClicker()`
   - Expect: `currentScreen$.get()` equals `'clicker'`
7. Run tests via `cmd.exe /c "npm test useNavigation.test.ts"`

**Success Criteria**:
- [ ] File created with 3 test cases
- [ ] All tests FAIL with "useNavigation is not defined" error
- [ ] Tests verify both navigation directions

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useNavigation.test.ts`

---

#### Task 1.3.2: Implement useNavigation Hook (GREEN Phase)

**Objective**: Implement minimal code to make useNavigation tests pass

**TDD Phase**: GREEN

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useNavigation.ts`
2. Import dependencies:
   - `useMemo` from React
   - `observable, Observable` from `@legendapp/state`
3. Define type: `type Screen = 'clicker' | 'shop';`
4. Define interface: `UseNavigationReturn` with:
   - `currentScreen$: Observable<Screen>`
   - `actions: { navigateToShop: () => void; navigateToClicker: () => void }`
5. Create module-level observable: `currentScreen$` initialized to `'clicker'`
6. Implement `useNavigation` function:
   - Return `useMemo` with currentScreen$ and actions
   - `navigateToShop` sets currentScreen$ to `'shop'`
   - `navigateToClicker` sets currentScreen$ to `'clicker'`
7. Add JSDoc comment
8. Run tests via `cmd.exe /c "npm test useNavigation.test.ts"`

**Success Criteria**:
- [ ] All useNavigation tests PASS (GREEN)
- [ ] Hook provides currentScreen$ observable
- [ ] Hook provides navigation actions
- [ ] Function has TypeScript type annotations

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useNavigation.ts`

**Reference Implementation** (from TDD Appendix D):
```typescript
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

const currentScreen$ = observable<Screen>('clicker');

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

---

#### Task 1.3.3: Refactor useNavigation (REFACTOR Phase)

**Objective**: Improve code quality while maintaining passing tests

**TDD Phase**: REFACTOR

**Actions**:
1. Review implementation for clarity
2. Verify JSDoc comment is comprehensive
3. Run tests via `cmd.exe /c "npm test useNavigation.test.ts"` to confirm no regressions

**Success Criteria**:
- [ ] All tests still PASS
- [ ] Code is clean and well-documented
- [ ] No unnecessary complexity

---

### Task 1.4: Create Minimal ShopScreen Component with TDD [0.25 days]

#### Task 1.4.1: Write ShopScreen Basic Tests (RED Phase)

**Objective**: Write failing tests for minimal ShopScreen component

**TDD Phase**: RED

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`
2. Import dependencies:
   - `render, screen` from `@testing-library/react-native`
   - `ShopScreen` from `./ShopScreen`
3. Add test suite: `describe('ShopScreen Component', () => { ... })`
4. Add test: `test('displays "Available Upgrades" heading', () => { ... })`
   - Render ShopScreen
   - Verify text "Available Upgrades" is visible
5. Add test: `test('displays back button', () => { ... })`
   - Render ShopScreen
   - Verify back button exists with `getByRole('button', { name: /back/i })`
6. Run tests via `cmd.exe /c "npm test ShopScreen.test.tsx"`

**Success Criteria**:
- [ ] File created with 2 test cases
- [ ] All tests FAIL with "ShopScreen is not defined" error

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

---

#### Task 1.4.2: Implement Minimal ShopScreen (GREEN Phase)

**Objective**: Create minimal ShopScreen component to make tests pass

**TDD Phase**: GREEN

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`
2. Import dependencies:
   - `View, Text, Pressable, StyleSheet` from `react-native`
   - `useNavigation` from `../../shared/hooks/useNavigation`
3. Create `ShopScreen` component:
   - Get navigation actions from useNavigation hook
   - Render View container
   - Render "Available Upgrades" Text heading
   - Render Pressable back button with `onPress={actions.navigateToClicker}`
   - Add accessibility attributes to back button
4. Create StyleSheet with basic styles
5. Export component
6. Run tests via `cmd.exe /c "npm test ShopScreen.test.tsx"`

**Success Criteria**:
- [ ] All ShopScreen tests PASS (GREEN)
- [ ] Component displays heading
- [ ] Component displays back button
- [ ] Back button has accessibility attributes

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Reference Implementation** (from TDD Appendix D):
```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '../../shared/hooks/useNavigation';

export function ShopScreen() {
  const { actions } = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={actions.navigateToClicker}
          accessibilityRole="button"
          accessibilityLabel="Back to clicker screen"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      </View>

      <Text style={styles.heading}>Available Upgrades</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
});
```

---

#### Task 1.4.3: Refactor ShopScreen (REFACTOR Phase)

**Objective**: Improve component structure while maintaining passing tests

**TDD Phase**: REFACTOR

**Actions**:
1. Review component structure for clarity
2. Verify styles are consistent
3. Run tests via `cmd.exe /c "npm test ShopScreen.test.tsx"` to confirm no regressions

**Success Criteria**:
- [ ] All tests still PASS
- [ ] Component is clean and maintainable

---

### Task 1.5: Update App.tsx for Navigation [0.25 days]

#### Task 1.5.1: Verify App Integration Tests Still Failing

**Objective**: Confirm App integration tests from Task 1.2 are still RED

**TDD Phase**: RED (verification)

**Actions**:
1. Run App tests via `cmd.exe /c "npm test App.test.tsx"`
2. Verify all navigation integration tests FAIL
3. Review error messages to ensure they indicate missing shop button in ClickerScreen

**Success Criteria**:
- [ ] All 3 App integration tests FAIL
- [ ] Error messages indicate shop button not found or navigation not working
- [ ] Tests are ready for implementation

---

#### Task 1.5.2: Update App.tsx with Navigation (GREEN Phase)

**Objective**: Integrate navigation into App.tsx to enable screen switching

**TDD Phase**: GREEN

**Actions**:
1. Read file: `/mnt/c/dev/class-one-rapids/frontend/App.tsx`
2. Add imports:
   - `import { Memo } from '@legendapp/state/react';`
   - `import { useNavigation } from './shared/hooks/useNavigation';`
   - `import { ShopScreen } from './modules/shop/ShopScreen';`
3. Inside App component:
   - Call `const { currentScreen$ } = useNavigation();`
4. Replace ClickerScreen rendering with conditional:
   ```typescript
   <Memo>
     {() => (
       currentScreen$.get() === 'clicker' ? (
         <ClickerScreen />
       ) : (
         <ShopScreen />
       )
     )}
   </Memo>
   ```
5. Run tests via `cmd.exe /c "npm test App.test.tsx"`

**Success Criteria**:
- [ ] App tests show shop button error (navigation works, but button missing in ClickerScreen)
- [ ] Conditional rendering implemented
- [ ] Navigation hook integrated

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/App.tsx`

---

### Task 1.6: Add Shop Button to ClickerScreen [0.25 days]

#### Task 1.6.1: Write ClickerScreen Shop Button Tests (RED Phase)

**Objective**: Write failing tests for shop button in ClickerScreen

**TDD Phase**: RED

**Actions**:
1. Read file: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`
2. Add new test suite: `describe('ClickerScreen Shop Navigation', () => { ... })`
3. Add test: `test('displays shop navigation button', () => { ... })`
   - Render ClickerScreen
   - Verify shop button exists with `getByRole('button', { name: /shop/i })`
4. Run tests via `cmd.exe /c "npm test ClickerScreen.test.tsx"`

**Success Criteria**:
- [ ] 1 new test added to ClickerScreen.test.tsx
- [ ] Test FAILS (RED phase confirmed)
- [ ] Error message indicates shop button not found

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`

---

#### Task 1.6.2: Add Shop Button to ClickerScreen (GREEN Phase)

**Objective**: Add shop navigation button to ClickerScreen

**TDD Phase**: GREEN

**Actions**:
1. Read file: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
2. Add import:
   - `import { useNavigation } from '../../shared/hooks/useNavigation';`
3. In component body, after existing hooks:
   - Add: `const { actions: navActions } = useNavigation();`
4. In JSX, after the feed button:
   - Add shop button Pressable
   - Set `onPress={navActions.navigateToShop}`
   - Add accessibility attributes
   - Style as secondary button
5. Add styles to StyleSheet:
   - `shopButton`: similar to feedButton but different color
   - `shopButtonText`: similar to feedButtonText
6. Run tests via `cmd.exe /c "npm test ClickerScreen.test.tsx"`
7. Run App tests via `cmd.exe /c "npm test App.test.tsx"`

**Success Criteria**:
- [ ] ClickerScreen shop button test PASSES
- [ ] All App navigation integration tests PASS (GREEN)
- [ ] All existing ClickerScreen tests still PASS
- [ ] Shop button is visible and functional

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`

**Reference Implementation** (from TDD Section 12):
```typescript
// Add import
import { useNavigation } from '../../shared/hooks/useNavigation';

// In component
export function ClickerScreen() {
  const { count$, actions } = usePersistedCounter();
  const { scrap$ } = useScrapGeneration(count$);
  const { actions: navActions } = useNavigation();

  return (
    <View style={styles.container}>
      {/* Existing content... */}

      {/* Shop Button */}
      <Pressable
        style={({ pressed }) => [
          styles.shopButton,
          pressed && styles.shopButtonPressed,
        ]}
        onPress={navActions.navigateToShop}
        accessibilityRole="button"
        accessibilityLabel="Shop"
        accessibilityHint="Navigate to the shop to purchase upgrades"
      >
        <Text style={styles.shopButtonText}>Shop</Text>
      </Pressable>
    </View>
  );
}

// Add styles
const styles = StyleSheet.create({
  // ... existing styles ...
  shopButton: {
    marginTop: 20,
    backgroundColor: '#34C759',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
    minHeight: 44,
  },
  shopButtonPressed: {
    opacity: 0.7,
  },
  shopButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
```

---

#### Task 1.6.3: Refactor Navigation Integration (REFACTOR Phase)

**Objective**: Improve navigation code quality while maintaining passing tests

**TDD Phase**: REFACTOR

**Actions**:
1. Review button styling for consistency
2. Verify accessibility attributes are comprehensive
3. Run all tests via `cmd.exe /c "npm test"` to confirm no regressions

**Success Criteria**:
- [ ] All tests still PASS
- [ ] Navigation UI is clean and consistent
- [ ] Accessibility is comprehensive

---

## Phase 2: Upgrade Data & State Management [1.0 day]

### Task 2.1: Create Upgrade Definitions with TDD [0.25 days]

#### Task 2.1.1: Write Upgrade Definitions Tests (RED Phase)

**Objective**: Write failing tests for upgrade data definitions

**TDD Phase**: RED

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.test.ts`
2. Import `UPGRADE_DEFINITIONS, Upgrade` from `./upgradeDefinitions`
3. Add test suite: `describe('Upgrade Definitions', () => { ... })`
4. Add test: `test('all upgrades have unique IDs', () => { ... })`
   - Map upgrade IDs to array
   - Create Set from IDs
   - Expect Set size equals array length
5. Add test: `test('all upgrades have required fields', () => { ... })`
   - Iterate through UPGRADE_DEFINITIONS
   - Verify each has: id, name, description, cost, effectType, effectValue
6. Add test: `test('all costs are positive numbers', () => { ... })`
   - Verify all upgrade costs > 0
7. Add test: `test('all effectValues are valid', () => { ... })`
   - Verify scrapMultiplier effectValues are between 0 and 1
   - Verify petBonus effectValues are positive integers
8. Add test: `test('contains at least one scrapMultiplier upgrade', () => { ... })`
   - Find upgrades with effectType 'scrapMultiplier'
   - Expect length > 0
9. Add test: `test('contains at least one petBonus upgrade', () => { ... })`
   - Find upgrades with effectType 'petBonus'
   - Expect length > 0
10. Run tests via `cmd.exe /c "npm test upgradeDefinitions.test.ts"`

**Success Criteria**:
- [ ] File created with 6 test cases
- [ ] All tests FAIL with "UPGRADE_DEFINITIONS is not defined" error
- [ ] Tests validate data integrity

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.test.ts`

---

#### Task 2.1.2: Implement Upgrade Definitions (GREEN Phase)

**Objective**: Create upgrade data definitions to make tests pass

**TDD Phase**: GREEN

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.ts`
2. Define TypeScript interface:
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
   ```
3. Define initial upgrades array with 4-5 sample upgrades:
   - At least 2 scrapMultiplier upgrades (costs: 100, 500)
   - At least 2 petBonus upgrades (costs: 200, 1000)
   - Include balanced costs and effects
4. Export as `UPGRADE_DEFINITIONS`
5. Add JSDoc comments
6. Run tests via `cmd.exe /c "npm test upgradeDefinitions.test.ts"`

**Success Criteria**:
- [ ] All upgradeDefinitions tests PASS (GREEN)
- [ ] At least 4 upgrades defined
- [ ] Both effect types represented
- [ ] Costs are balanced for progression

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.ts`

**Reference Implementation** (from TDD Section 6):
```typescript
/**
 * Defines an upgrade that can be purchased in the shop.
 */
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effectType: 'scrapMultiplier' | 'petBonus';
  effectValue: number;
  category?: 'scrapEfficiency' | 'petAcquisition';
}

/**
 * All available upgrades in the shop.
 * Centralized data source for easy balancing and extensibility.
 */
export const UPGRADE_DEFINITIONS: Upgrade[] = [
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
    id: 'pet-boost-1',
    name: 'Extra Feed',
    description: '+1 AI Pet per feed button press',
    cost: 200,
    effectType: 'petBonus',
    effectValue: 1,
    category: 'petAcquisition',
  },
  {
    id: 'scrap-boost-2',
    name: 'Scrap Magnet',
    description: '+15% scrap generation from AI Pets',
    cost: 500,
    effectType: 'scrapMultiplier',
    effectValue: 0.15,
    category: 'scrapEfficiency',
  },
  {
    id: 'pet-boost-2',
    name: 'Double Feed',
    description: '+2 AI Pets per feed button press',
    cost: 1000,
    effectType: 'petBonus',
    effectValue: 2,
    category: 'petAcquisition',
  },
  {
    id: 'scrap-boost-3',
    name: 'Scrap Amplifier',
    description: '+25% scrap generation from AI Pets',
    cost: 2000,
    effectType: 'scrapMultiplier',
    effectValue: 0.25,
    category: 'scrapEfficiency',
  },
];
```

---

#### Task 2.1.3: Refactor Upgrade Definitions (REFACTOR Phase)

**Objective**: Improve data structure while maintaining passing tests

**TDD Phase**: REFACTOR

**Actions**:
1. Review upgrade costs for balanced progression
2. Review descriptions for clarity
3. Verify JSDoc comments are comprehensive
4. Run tests via `cmd.exe /c "npm test upgradeDefinitions.test.ts"` to confirm no regressions

**Success Criteria**:
- [ ] All tests still PASS
- [ ] Upgrades are well-balanced
- [ ] Descriptions are clear and helpful

---

### Task 2.2: Implement useUpgrades Hook with TDD [0.5 days]

#### Task 2.2.1: Write useUpgrades Tests (RED Phase)

**Objective**: Write comprehensive failing tests for useUpgrades hook

**TDD Phase**: RED

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgrades.test.ts`
2. Import dependencies:
   - `renderHook, act, waitFor` from `@testing-library/react-native`
   - `observable` from `@legendapp/state`
   - Mock `@react-native-async-storage/async-storage`
3. Setup `beforeEach`:
   - `jest.clearAllMocks()`
   - Mock `AsyncStorage.getItem` to return `null`
   - Create `scrap$` observable with value 500
4. Add test suite: `describe('useUpgrades Hook', () => { ... })`
5. Add test: `test('initializes with no purchased upgrades', async () => { ... })`
   - Render hook
   - Expect: `purchasedUpgradeIds$.get()` equals `[]`
6. Add test: `test('loads persisted purchased upgrades', async () => { ... })`
   - Mock AsyncStorage to return `['scrap-boost-1']`
   - Render hook
   - Expect: `purchasedUpgradeIds$.get()` equals `['scrap-boost-1']`
7. Add test: `test('computes available upgrades excluding purchased', async () => { ... })`
   - Mock AsyncStorage to return `['scrap-boost-1']`
   - Render hook
   - Expect: availableUpgrades$ doesn't include 'scrap-boost-1'
8. Add test: `test('successfully purchases affordable upgrade', async () => { ... })`
   - Render hook with 500 scrap
   - Purchase 'scrap-boost-1' (cost: 100)
   - Expect: success returns true
   - Expect: scrap decreased by 100
   - Expect: upgrade ID in purchasedUpgradeIds$
9. Add test: `test('rejects purchase with insufficient scrap', async () => { ... })`
   - Set scrap$ to 50
   - Attempt purchase of upgrade costing 100
   - Expect: success returns false
   - Expect: scrap unchanged
10. Add test: `test('rejects duplicate purchase', async () => { ... })`
    - Purchase upgrade once
    - Attempt second purchase
    - Expect: second attempt returns false
11. Add test: `test('calculates total scrap multiplier', async () => { ... })`
    - Mock purchased upgrades with scrapMultiplier types
    - Expect: totalScrapMultiplier$ equals sum of effectValues
12. Add test: `test('calculates total pet bonus', async () => { ... })`
    - Mock purchased upgrades with petBonus types
    - Expect: totalPetBonus$ equals sum of effectValues
13. Add test: `test('persists purchased upgrades to AsyncStorage', async () => { ... })`
    - Purchase upgrade
    - Wait for debounced persist
    - Expect: AsyncStorage.setItem called with correct data
14. Run tests via `cmd.exe /c "npm test useUpgrades.test.ts"`

**Success Criteria**:
- [ ] File created with 9+ test cases
- [ ] All tests FAIL with appropriate error messages
- [ ] Tests cover purchase validation, persistence, computed values

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgrades.test.ts`

**Reference Implementation** (from TDD Section 8):
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
    scrap$ = observable(500);
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
      expect(available.length).toBeGreaterThan(0);
    });
  });

  test('successfully purchases affordable upgrade', async () => {
    const { result } = renderHook(() => useUpgrades(scrap$));

    const initialScrap = scrap$.get();
    const upgradeId = 'scrap-boost-1';

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
    scrap$.set(50);
    const { result } = renderHook(() => useUpgrades(scrap$));

    let success;
    act(() => {
      success = result.current.actions.purchase('scrap-boost-1');
    });

    await waitFor(() => {
      expect(success).toBe(false);
      expect(scrap$.get()).toBe(50);
      expect(result.current.purchasedUpgradeIds$.get()).not.toContain('scrap-boost-1');
    });
  });

  test('rejects duplicate purchase', async () => {
    const { result } = renderHook(() => useUpgrades(scrap$));

    act(() => {
      result.current.actions.purchase('scrap-boost-1');
    });

    await waitFor(() => {
      expect(result.current.purchasedUpgradeIds$.get()).toContain('scrap-boost-1');
    });

    const scrapAfterFirst = scrap$.get();

    let success;
    act(() => {
      success = result.current.actions.purchase('scrap-boost-1');
    });

    await waitFor(() => {
      expect(success).toBe(false);
      expect(scrap$.get()).toBe(scrapAfterFirst);
    });
  });

  test('calculates total scrap multiplier', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(['scrap-boost-1'])
    );

    const { result } = renderHook(() => useUpgrades(scrap$));

    await waitFor(() => {
      expect(result.current.totalScrapMultiplier$.get()).toBe(0.1);
    });
  });

  test('calculates total pet bonus', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(['pet-boost-1'])
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

---

#### Task 2.2.2: Implement useUpgrades Hook (GREEN Phase)

**Objective**: Implement minimal code to make all useUpgrades tests pass

**TDD Phase**: GREEN

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgrades.ts`
2. Import dependencies:
   - `useMemo` from React
   - `observable, Observable, computed` from `@legendapp/state`
   - `configureSynced, synced` from `@legendapp/state/sync`
   - `ObservablePersistAsyncStorage` from persist plugin
   - `AsyncStorage` from `@react-native-async-storage/async-storage`
   - `UPGRADE_DEFINITIONS, Upgrade` from `./upgradeDefinitions`
3. Configure persistence plugin (same pattern as other hooks)
4. Create module-level observable:
   - `purchasedUpgradeIds$` with persist configuration
   - Storage key: `'purchased-upgrades-v1'`
   - Initial value: empty array
   - Debounce: 1000ms
5. Define `UseUpgradesReturn` interface with all observables and actions
6. Implement `useUpgrades` function:
   - Parameter: `scrap$: Observable<number>`
   - Create computed observable `availableUpgrades$` filtering purchased IDs
   - Create computed observable `totalScrapMultiplier$` summing scrapMultiplier effects
   - Create computed observable `totalPetBonus$` summing petBonus effects
   - Implement `purchase` action:
     - Validate: find upgrade by ID
     - Validate: scrap$ >= upgrade.cost
     - Validate: not already purchased
     - If valid: deduct scrap, add ID to purchasedUpgradeIds$
     - Return true/false based on success
   - Return interface with all observables and actions
7. Add JSDoc comments
8. Run tests via `cmd.exe /c "npm test useUpgrades.test.ts"`

**Success Criteria**:
- [ ] All useUpgrades tests PASS (GREEN)
- [ ] Hook implements purchase validation
- [ ] Hook persists to AsyncStorage
- [ ] Hook computes available upgrades
- [ ] Hook computes effect totals

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgrades.ts`

**Reference Implementation** (from TDD Appendix D):
```typescript
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
 * Hook for managing shop upgrades, purchases, and effect calculations.
 * Tracks purchased upgrades with persistence and validates purchase transactions.
 *
 * @param scrap$ - Observable containing current scrap balance
 * @returns Upgrade state, computed values, and purchase action
 */
export function useUpgrades(scrap$: Observable<number>): UseUpgradesReturn {
  const availableUpgrades$ = useMemo(
    () =>
      computed(() => {
        const purchased = purchasedUpgradeIds$.get();
        return UPGRADE_DEFINITIONS.filter((u) => !purchased.includes(u.id));
      }),
    []
  );

  const totalScrapMultiplier$ = useMemo(
    () =>
      computed(() => {
        const purchased = purchasedUpgradeIds$.get();
        const scrapUpgrades = UPGRADE_DEFINITIONS.filter(
          (u) => purchased.includes(u.id) && u.effectType === 'scrapMultiplier'
        );
        return scrapUpgrades.reduce((sum, u) => sum + u.effectValue, 0);
      }),
    []
  );

  const totalPetBonus$ = useMemo(
    () =>
      computed(() => {
        const purchased = purchasedUpgradeIds$.get();
        const petUpgrades = UPGRADE_DEFINITIONS.filter(
          (u) => purchased.includes(u.id) && u.effectType === 'petBonus'
        );
        return petUpgrades.reduce((sum, u) => sum + u.effectValue, 0);
      }),
    []
  );

  const actions = useMemo(
    () => ({
      purchase: (upgradeId: string): boolean => {
        // Find upgrade
        const upgrade = UPGRADE_DEFINITIONS.find((u) => u.id === upgradeId);
        if (!upgrade) {
          console.error(`Upgrade not found: ${upgradeId}`);
          return false;
        }

        // Validate: sufficient scrap
        const currentScrap = scrap$.get();
        if (currentScrap < upgrade.cost) {
          console.log(`Insufficient scrap for ${upgrade.name}`);
          return false;
        }

        // Validate: not already purchased
        const purchased = purchasedUpgradeIds$.get();
        if (purchased.includes(upgradeId)) {
          console.log(`Upgrade already purchased: ${upgrade.name}`);
          return false;
        }

        // Execute purchase
        try {
          scrap$.set((prev) => prev - upgrade.cost);
          purchasedUpgradeIds$.set((prev) => [...prev, upgradeId]);
          return true;
        } catch (error) {
          console.error('Purchase failed:', error);
          return false;
        }
      },
    }),
    [scrap$]
  );

  return useMemo(
    () => ({
      purchasedUpgradeIds$,
      availableUpgrades$,
      totalScrapMultiplier$,
      totalPetBonus$,
      actions,
    }),
    [availableUpgrades$, totalScrapMultiplier$, totalPetBonus$, actions]
  );
}
```

---

#### Task 2.2.3: Refactor useUpgrades (REFACTOR Phase)

**Objective**: Improve code quality while maintaining passing tests

**TDD Phase**: REFACTOR

**Actions**:
1. Review validation logic for clarity
2. Review error handling and logging
3. Verify computed observables are efficient
4. Run tests via `cmd.exe /c "npm test useUpgrades.test.ts"` to confirm no regressions

**Success Criteria**:
- [ ] All tests still PASS
- [ ] Code is clean and well-documented
- [ ] Purchase logic is atomic and safe

---

## Phase 3: Shop UI Implementation [0.75 days]

### Task 3.1: Create UpgradeListItem Component with TDD [0.25 days]

#### Task 3.1.1: Write UpgradeListItem Tests (RED Phase)

**Objective**: Write failing tests for upgrade list item component

**TDD Phase**: RED

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/UpgradeListItem.test.tsx`
2. Import dependencies and create mock upgrade
3. Add test suite: `describe('UpgradeListItem Component', () => { ... })`
4. Add test: `test('displays upgrade information', () => { ... })`
   - Render with mock upgrade
   - Verify name, description, cost are visible
5. Add test: `test('purchase button enabled when affordable', () => { ... })`
   - Render with `isAffordable$` = true
   - Verify button not disabled
6. Add test: `test('purchase button disabled when unaffordable', () => { ... })`
   - Render with `isAffordable$` = false
   - Verify button disabled
7. Add test: `test('calls onPurchase with upgrade ID when button pressed', async () => { ... })`
   - Setup userEvent
   - Press purchase button
   - Verify onPurchase called with correct ID
8. Add test: `test('shows visual indicator for effect type', () => { ... })`
   - Render with scrapMultiplier type
   - Verify visual differentiation exists
9. Run tests via `cmd.exe /c "npm test UpgradeListItem.test.tsx"`

**Success Criteria**:
- [ ] File created with 5 test cases
- [ ] All tests FAIL with "UpgradeListItem is not defined" error

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/UpgradeListItem.test.tsx`

---

#### Task 3.1.2: Implement UpgradeListItem Component (GREEN Phase)

**Objective**: Create upgrade list item component to make tests pass

**TDD Phase**: GREEN

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/UpgradeListItem.tsx`
2. Import dependencies:
   - React Native components
   - `Memo` from Legend-State
   - `formatNumber` from scrap module
   - `Upgrade` type from upgradeDefinitions
3. Define props interface:
   - `upgrade: Upgrade`
   - `isAffordable$: Observable<boolean>`
   - `onPurchase: (upgradeId: string) => void`
4. Implement component:
   - Render upgrade name as heading
   - Render description text
   - Render formatted cost
   - Render effect type indicator (icon/color)
   - Render Memo-wrapped purchase button
   - Button disabled based on isAffordable$
   - Button onPress calls onPurchase with upgrade.id
   - Add accessibility attributes
5. Create StyleSheet with styles
6. Export component
7. Run tests via `cmd.exe /c "npm test UpgradeListItem.test.tsx"`

**Success Criteria**:
- [ ] All UpgradeListItem tests PASS (GREEN)
- [ ] Component displays all upgrade info
- [ ] Button state reflects affordability
- [ ] Purchase callback works correctly

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/UpgradeListItem.tsx`

**Reference Implementation** (from TDD Appendix D):
```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Memo } from '@legendapp/state/react';
import { Observable } from '@legendapp/state';
import { formatNumber } from '../scrap/formatNumber';
import { Upgrade } from './upgradeDefinitions';

interface UpgradeListItemProps {
  upgrade: Upgrade;
  isAffordable$: Observable<boolean>;
  onPurchase: (upgradeId: string) => void;
}

export function UpgradeListItem({
  upgrade,
  isAffordable$,
  onPurchase,
}: UpgradeListItemProps) {
  const typeColor =
    upgrade.effectType === 'scrapMultiplier' ? '#FF9500' : '#34C759';

  return (
    <View style={styles.container}>
      <View style={[styles.typeIndicator, { backgroundColor: typeColor }]} />

      <View style={styles.content}>
        <Text style={styles.name}>{upgrade.name}</Text>
        <Text style={styles.description}>{upgrade.description}</Text>
        <Text style={styles.cost}>Cost: {formatNumber(upgrade.cost)} scrap</Text>
      </View>

      <Memo>
        {() => {
          const isAffordable = isAffordable$.get();
          return (
            <Pressable
              style={({ pressed }) => [
                styles.purchaseButton,
                !isAffordable && styles.purchaseButtonDisabled,
                pressed && isAffordable && styles.purchaseButtonPressed,
              ]}
              onPress={() => onPurchase(upgrade.id)}
              disabled={!isAffordable}
              accessibilityRole="button"
              accessibilityLabel={`Purchase ${upgrade.name}`}
              accessibilityHint={`Costs ${formatNumber(upgrade.cost)} scrap`}
            >
              <Text
                style={[
                  styles.purchaseButtonText,
                  !isAffordable && styles.purchaseButtonTextDisabled,
                ]}
              >
                Purchase
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  typeIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  cost: {
    fontSize: 12,
    color: '#999999',
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 80,
    minHeight: 44,
    justifyContent: 'center',
  },
  purchaseButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  purchaseButtonPressed: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  purchaseButtonTextDisabled: {
    color: '#999999',
  },
});
```

---

#### Task 3.1.3: Refactor UpgradeListItem (REFACTOR Phase)

**Objective**: Improve component quality while maintaining passing tests

**TDD Phase**: REFACTOR

**Actions**:
1. Review component structure for clarity
2. Verify styles are clean and accessible
3. Run tests via `cmd.exe /c "npm test UpgradeListItem.test.tsx"` to confirm no regressions

**Success Criteria**:
- [ ] All tests still PASS
- [ ] Component is clean and maintainable

---

### Task 3.2: Build Complete ShopScreen with TDD [0.5 days]

#### Task 3.2.1: Write ShopScreen Integration Tests (RED Phase)

**Objective**: Write comprehensive tests for full shop screen functionality

**TDD Phase**: RED

**Actions**:
1. Read file: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`
2. Add new tests to existing suite:
3. Add test: `test('displays scrap balance', async () => { ... })`
   - Mock scrap$ observable with value 500
   - Render ShopScreen
   - Verify text shows "Scrap: 500" or similar
4. Add test: `test('displays available upgrades', async () => { ... })`
   - Render ShopScreen
   - Verify at least one upgrade name is visible
5. Add test: `test('purchase button disabled when insufficient scrap', async () => { ... })`
   - Mock low scrap balance (50)
   - Render ShopScreen
   - Verify expensive upgrade button is disabled
6. Add test: `test('completes purchase flow successfully', async () => { ... })`
   - Setup userEvent
   - Mock sufficient scrap (500)
   - Render ShopScreen
   - Find and press affordable upgrade button
   - Verify scrap deducted
   - Verify upgrade removed from list
7. Add test: `test('purchased upgrade no longer appears in list', async () => { ... })`
   - Mock purchased upgrades
   - Render ShopScreen
   - Verify purchased upgrade not in list
8. Run tests via `cmd.exe /c "npm test ShopScreen.test.tsx"`

**Success Criteria**:
- [ ] 5+ new integration tests added
- [ ] All new tests FAIL (RED phase confirmed)
- [ ] Tests verify complete purchase flow

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

---

#### Task 3.2.2: Implement Complete ShopScreen (GREEN Phase)

**Objective**: Build full shop screen with upgrade list and purchase flow

**TDD Phase**: GREEN

**Actions**:
1. Read file: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`
2. Add imports:
   - `FlatList, SafeAreaView` from React Native
   - `Memo` from Legend-State
   - `usePersistedCounter` from attack-button module
   - `useScrapGeneration` from scrap module
   - `useUpgrades` from shop module
   - `formatNumber` from scrap module
   - `UpgradeListItem` from shop module
3. Update component implementation:
   - Get count$ from usePersistedCounter
   - Get scrap$ from useScrapGeneration(count$)
   - Get upgrade state from useUpgrades(scrap$)
   - Render scrap balance at top (Memo-wrapped)
   - Render FlatList of availableUpgrades$
   - Use UpgradeListItem as renderItem
   - Compute isAffordable$ for each upgrade
   - Handle purchase with actions.purchase
4. Update styles for complete layout
5. Run tests via `cmd.exe /c "npm test ShopScreen.test.tsx"`

**Success Criteria**:
- [ ] All ShopScreen tests PASS (GREEN)
- [ ] Scrap balance displays correctly
- [ ] Upgrade list renders
- [ ] Purchase flow works end-to-end
- [ ] UI updates reactively

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Reference Implementation** (from TDD Appendix D):
```typescript
import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { Memo } from '@legendapp/state/react';
import { computed } from '@legendapp/state';
import { useNavigation } from '../../shared/hooks/useNavigation';
import { usePersistedCounter } from '../attack-button/usePersistedCounter';
import { useScrapGeneration } from '../scrap/useScrapGeneration';
import { useUpgrades } from './useUpgrades';
import { formatNumber } from '../scrap/formatNumber';
import { UpgradeListItem } from './UpgradeListItem';
import { Upgrade } from './upgradeDefinitions';

export function ShopScreen() {
  const { actions: navActions } = useNavigation();
  const { count$ } = usePersistedCounter();
  const { scrap$ } = useScrapGeneration(count$);
  const { availableUpgrades$, actions } = useUpgrades(scrap$);

  const handlePurchase = (upgradeId: string) => {
    const success = actions.purchase(upgradeId);
    if (success) {
      console.log(`Successfully purchased upgrade: ${upgradeId}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={navActions.navigateToClicker}
          accessibilityRole="button"
          accessibilityLabel="Back to clicker screen"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      </View>

      <Text style={styles.heading}>Available Upgrades</Text>

      <Memo>
        {() => (
          <Text style={styles.scrapBalance}>
            Scrap: {formatNumber(scrap$.get())}
          </Text>
        )}
      </Memo>

      <Memo>
        {() => {
          const upgrades = availableUpgrades$.get();
          return (
            <FlatList
              data={upgrades}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isAffordable$ = computed(
                  () => scrap$.get() >= item.cost
                );
                return (
                  <UpgradeListItem
                    upgrade={item}
                    isAffordable$={isAffordable$}
                    onPurchase={handlePurchase}
                  />
                );
              }}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No upgrades available. You've purchased them all!
                </Text>
              }
            />
          );
        }}
      </Memo>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  scrapBalance: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 40,
  },
});
```

---

#### Task 3.2.3: Refactor ShopScreen (REFACTOR Phase)

**Objective**: Improve shop screen quality while maintaining passing tests

**TDD Phase**: REFACTOR

**Actions**:
1. Review component structure for clarity
2. Verify FlatList performance is optimal
3. Verify accessibility is comprehensive
4. Run tests via `cmd.exe /c "npm test ShopScreen.test.tsx"` to confirm no regressions

**Success Criteria**:
- [ ] All tests still PASS
- [ ] Component is clean and performant
- [ ] List rendering is efficient

---

## Phase 4: Gameplay Integration [1.0 day]

### Task 4.1: Integrate Scrap Multiplier into useScrapGeneration [0.5 days]

#### Task 4.1.1: Write Scrap Multiplier Integration Tests (RED Phase)

**Objective**: Write failing tests for scrap multiplier upgrade effects

**TDD Phase**: RED

**Actions**:
1. Read file: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts`
2. Add new test suite: `describe('useScrapGeneration Multiplier Integration', () => { ... })`
3. Setup: `beforeEach` with fake timers and AsyncStorage mocks
4. Add test: `test('applies scrap multiplier from upgrades', async () => { ... })`
   - Mock purchased upgrade 'scrap-boost-1' (+0.1 multiplier)
   - Create petCount$ with 10 pets
   - Render hook
   - Advance 1 second
   - Expect: scrap increased by 11 (10 * 1.1)
5. Add test: `test('stacks multiple scrap multipliers', async () => { ... })`
   - Mock two scrap multiplier upgrades (+0.1 and +0.15)
   - Create petCount$ with 10 pets
   - Advance 1 second
   - Expect: scrap increased by 12.5 (10 * 1.25)
6. Add test: `test('works with no multipliers purchased', async () => { ... })`
   - No purchased upgrades
   - Create petCount$ with 10 pets
   - Advance 1 second
   - Expect: scrap increased by 10 (base rate)
7. Run tests via `cmd.exe /c "npm test useScrapGeneration.test.ts"`

**Success Criteria**:
- [ ] 3 new integration tests added
- [ ] All new tests FAIL (RED phase confirmed)
- [ ] Tests verify multiplier calculations

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts`

---

#### Task 4.1.2: Update useScrapGeneration with Multiplier (GREEN Phase)

**Objective**: Integrate upgrade multiplier effects into scrap generation

**TDD Phase**: GREEN

**Actions**:
1. Read file: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts`
2. Add import:
   - `import { useUpgrades } from '../shop/useUpgrades';`
3. In `useScrapGeneration` function:
   - Call `const { totalScrapMultiplier$ } = useUpgrades(scrap$);`
4. In interval callback, update calculation:
   - Read multiplier: `const multiplier = totalScrapMultiplier$.get();`
   - Calculate: `const scrapToAdd = currentPetCount * SCRAP_PER_PET_PER_SECOND * (1 + multiplier);`
   - Round result: `Math.round(scrapToAdd)`
5. Update JSDoc to document multiplier application
6. Run tests via `cmd.exe /c "npm test useScrapGeneration.test.ts"`

**Success Criteria**:
- [ ] All useScrapGeneration tests PASS (GREEN)
- [ ] Multiplier effects apply correctly
- [ ] Stacking works correctly
- [ ] Base case (no upgrades) still works

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts`

**Reference Implementation** (from TDD Section 12):
```typescript
import { useUpgrades } from '../shop/useUpgrades';

export function useScrapGeneration(
  petCount$: Observable<number>
): UseScrapGenerationReturn {
  const { totalScrapMultiplier$ } = useUpgrades(scrap$);

  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        const currentPetCount = petCount$.get();
        const multiplier = totalScrapMultiplier$.get();
        const baseScrap = currentPetCount * SCRAP_PER_PET_PER_SECOND;
        const scrapToAdd = Math.round(baseScrap * (1 + multiplier));
        scrap$.set((prev) => prev + scrapToAdd);
      } catch (error) {
        console.error('Scrap generation error:', error);
      }
    }, GENERATION_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [petCount$, totalScrapMultiplier$]);

  return useMemo(() => ({ scrap$ }), []);
}
```

---

#### Task 4.1.3: Refactor Scrap Generation Integration (REFACTOR Phase)

**Objective**: Improve multiplier integration quality

**TDD Phase**: REFACTOR

**Actions**:
1. Review calculation logic for clarity
2. Verify rounding behavior is correct
3. Add inline comments explaining multiplier application
4. Run tests via `cmd.exe /c "npm test useScrapGeneration.test.ts"` to confirm no regressions

**Success Criteria**:
- [ ] All tests still PASS
- [ ] Calculation is clear and well-documented

---

### Task 4.2: Integrate Pet Bonus into usePersistedCounter [0.5 days]

#### Task 4.2.1: Write Pet Bonus Integration Tests (RED Phase)

**Objective**: Write failing tests for pet bonus upgrade effects

**TDD Phase**: RED

**Actions**:
1. Read file: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.test.ts`
2. Add new test suite: `describe('usePersistedCounter Pet Bonus Integration', () => { ... })`
3. Add test: `test('increment applies pet bonus from upgrades', async () => { ... })`
   - Mock purchased upgrade 'pet-boost-1' (+1 bonus)
   - Render hook
   - Call increment action
   - Expect: count increased by 2 (1 base + 1 bonus)
4. Add test: `test('stacks multiple pet bonuses', async () => { ... })`
   - Mock two pet bonus upgrades (+1 and +2)
   - Render hook
   - Call increment action
   - Expect: count increased by 4 (1 base + 3 total bonus)
5. Add test: `test('works with no bonuses purchased', async () => { ... })`
   - No purchased upgrades
   - Call increment action
   - Expect: count increased by 1 (base rate)
6. Run tests via `cmd.exe /c "npm test usePersistedCounter.test.ts"`

**Success Criteria**:
- [ ] 3 new integration tests added
- [ ] All new tests FAIL (RED phase confirmed)
- [ ] Tests verify bonus calculations

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.test.ts`

---

#### Task 4.2.2: Update usePersistedCounter with Bonus (GREEN Phase)

**Objective**: Integrate upgrade bonus effects into pet increment

**TDD Phase**: GREEN

**Actions**:
1. Read file: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts`
2. Add import:
   - `import { useUpgrades } from '../shop/useUpgrades';`
   - Note: This requires accessing scrap$ - may need to refactor to accept scrap$ as parameter
3. Update `usePersistedCounter` signature to accept optional scrap$ parameter
4. If scrap$ provided, call useUpgrades to get totalPetBonus$
5. Update increment action:
   - Read bonus: `const bonus = totalPetBonus$?.get() ?? 0;`
   - Calculate: `count$.set((prev) => prev + 1 + bonus);`
6. Update JSDoc to document bonus application
7. Update ClickerScreen to pass scrap$ to usePersistedCounter
8. Run tests via `cmd.exe /c "npm test usePersistedCounter.test.ts"`

**Success Criteria**:
- [ ] All usePersistedCounter tests PASS (GREEN)
- [ ] Bonus effects apply correctly
- [ ] Stacking works correctly
- [ ] Base case (no upgrades) still works

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts`
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx` (parameter passing)

**Note**: May require refactoring hook dependencies. Alternative: Make totalPetBonus$ computed in a shared location.

---

#### Task 4.2.3: Refactor Pet Increment Integration (REFACTOR Phase)

**Objective**: Improve bonus integration quality

**TDD Phase**: REFACTOR

**Actions**:
1. Review dependency injection approach
2. Verify bonus calculation is clear
3. Add inline comments explaining bonus application
4. Run tests via `cmd.exe /c "npm test usePersistedCounter.test.ts"` to confirm no regressions

**Success Criteria**:
- [ ] All tests still PASS
- [ ] Integration is clean and maintainable

---

## Phase 5: E2E Testing & Polish [0.75 days]

### Task 5.1: End-to-End Testing [0.5 days]

#### Task 5.1.1: Write E2E Purchase Flow Test

**Objective**: Create comprehensive end-to-end test of complete purchase and effect flow

**TDD Phase**: RED-GREEN-REFACTOR (complete cycle)

**Actions**:
1. Read or create file: `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`
2. Add E2E test: `test('complete purchase flow affects gameplay', async () => { ... })`
   - Setup userEvent
   - Mock AsyncStorage with initial scrap (1000)
   - Render App
   - Generate some pets by pressing feed button
   - Wait for scrap to accumulate
   - Navigate to shop
   - Purchase scrap multiplier upgrade
   - Navigate back to clicker
   - Verify scrap generation rate increased
   - Navigate to shop again
   - Purchase pet bonus upgrade
   - Navigate back to clicker
   - Press feed button
   - Verify pet count increased by more than 1
3. Run test via `cmd.exe /c "npm test App.test.tsx"`
4. Fix any issues until test passes
5. Refactor for clarity

**Success Criteria**:
- [ ] E2E test passes
- [ ] Test verifies complete user journey
- [ ] Test validates upgrade effects work end-to-end

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`

---

#### Task 5.1.2: Run Full Test Suite

**Objective**: Verify all tests pass across entire codebase

**Actions**:
1. Run all tests via `cmd.exe /c "npm test"`
2. Verify no test failures
3. Fix any failing tests
4. Verify no warnings

**Success Criteria**:
- [ ] All shop tests PASS
- [ ] All existing tests PASS
- [ ] No test failures or errors
- [ ] No unexpected warnings

---

#### Task 5.1.3: Generate Coverage Report

**Objective**: Verify test coverage meets >90% target for shop module

**Actions**:
1. Run coverage report: `cmd.exe /c "npm test -- --coverage"`
2. Review coverage for shop module files
3. Identify uncovered lines
4. Add tests for uncovered scenarios if coverage < 90%
5. Re-run coverage to verify >90%

**Success Criteria**:
- [ ] Coverage report generated
- [ ] upgradeDefinitions.ts: >90% coverage
- [ ] useUpgrades.ts: >90% coverage
- [ ] ShopScreen.tsx: >90% coverage
- [ ] UpgradeListItem.tsx: >90% coverage
- [ ] All critical paths covered

---

### Task 5.2: Manual Testing & Polish [0.25 days]

#### Task 5.2.1: Manual Device Testing

**Objective**: Verify behavior on physical/emulated devices

**Actions**:
1. Start development server: `npm start`
2. Open app on iOS simulator/device
3. Test complete flow:
   - Generate some scrap
   - Navigate to shop
   - Verify upgrade list displays
   - Verify scrap balance is correct
   - Purchase affordable upgrade
   - Verify scrap deducted
   - Verify upgrade removed from list
   - Navigate back to clicker
   - Verify upgrade effect applies (scrap or pet)
   - Close and reopen app
   - Verify purchased upgrade persisted
4. Repeat on Android emulator/device

**Success Criteria**:
- [ ] Shop displays correctly on iOS
- [ ] Shop displays correctly on Android
- [ ] Purchase flow works on both platforms
- [ ] Persistence works on both platforms
- [ ] Upgrade effects apply on both platforms
- [ ] No visual glitches or performance issues

---

#### Task 5.2.2: Accessibility Verification

**Objective**: Ensure all accessibility requirements are met

**Actions**:
1. Review all shop components for accessibility attributes
2. Test with screen reader on iOS (VoiceOver)
3. Test with screen reader on Android (TalkBack)
4. Verify all buttons have proper labels
5. Verify all text is readable
6. Verify touch targets meet 44x44 minimum
7. Verify color contrast meets WCAG AA (4.5:1)

**Success Criteria**:
- [ ] All interactive elements have accessibility labels
- [ ] Screen reader announces all content correctly
- [ ] Touch targets meet minimum size
- [ ] Color contrast is sufficient

---

#### Task 5.2.3: Performance Verification

**Objective**: Verify performance requirements are met

**Actions**:
1. Test shop screen opening time (should be <300ms)
2. Test purchase transaction time (should be <100ms)
3. Test with large upgrade list (50+ items)
4. Verify smooth scrolling
5. Verify no lag or jank

**Success Criteria**:
- [ ] Shop opens in <300ms
- [ ] Purchases complete in <100ms
- [ ] FlatList scrolls smoothly with 50+ items
- [ ] No performance issues detected

---

#### Task 5.2.4: Final Documentation & Code Review

**Objective**: Ensure code is well-documented and follows best practices

**Actions**:
1. Review all shop module files for JSDoc comments
2. Verify all functions have documentation
3. Verify all constants are documented
4. Add inline comments for complex logic
5. Review code for consistency with project patterns
6. Update any component-level documentation

**Success Criteria**:
- [ ] All public functions have JSDoc
- [ ] All constants are documented
- [ ] Complex logic has inline comments
- [ ] Code follows project patterns
- [ ] No TODO or FIXME comments remain

---

#### Task 5.2.5: Final Verification Checklist

**Objective**: Ensure all requirements are met and feature is complete

**Actions**:
1. Run full test suite: `cmd.exe /c "npm test"`
2. Run coverage report: `cmd.exe /c "npm test -- --coverage"`
3. Review requirements checklist:
   - [ ] All functional requirements met (FR-1 through FR-6)
   - [ ] All non-functional requirements met (NFR-1 through NFR-6)
   - [ ] Navigation working between screens
   - [ ] Upgrade display working
   - [ ] Purchase flow working
   - [ ] Purchase validation working
   - [ ] Persistence working
   - [ ] Scrap multiplier effects working
   - [ ] Pet bonus effects working
   - [ ] Accessibility implemented
   - [ ] Performance verified
   - [ ] Tests comprehensive (>90% coverage)
   - [ ] Documentation complete

**Success Criteria**:
- [ ] All tests PASS
- [ ] Coverage >90%
- [ ] All requirements met
- [ ] Feature is production-ready

---

## Summary

### Total Tasks: 45
- **Phase 1**: 10 tasks (Foundation & Navigation)
- **Phase 2**: 9 tasks (Upgrade Data & State Management)
- **Phase 3**: 9 tasks (Shop UI Implementation)
- **Phase 4**: 9 tasks (Gameplay Integration)
- **Phase 5**: 8 tasks (E2E Testing & Polish)

### Files Created:
1. `/mnt/c/dev/class-one-rapids/frontend/modules/shop/` (directory)
2. `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/` (directory)
3. `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`
4. `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useNavigation.ts`
5. `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useNavigation.test.ts`
6. `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`
7. `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`
8. `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.ts`
9. `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.test.ts`
10. `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgrades.ts`
11. `/mnt/c/dev/class-one-rapids/frontend/modules/shop/useUpgrades.test.ts`
12. `/mnt/c/dev/class-one-rapids/frontend/modules/shop/UpgradeListItem.tsx`
13. `/mnt/c/dev/class-one-rapids/frontend/modules/shop/UpgradeListItem.test.tsx`

### Files Modified:
1. `/mnt/c/dev/class-one-rapids/frontend/App.tsx`
2. `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
3. `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`
4. `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts`
5. `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.test.ts`
6. `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts`
7. `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts`

### Key TDD Principles Applied:
- ✅ RED-GREEN-REFACTOR cycle for all implementation
- ✅ Component integration tests written FIRST (Phase 1, Task 1.2)
- ✅ No implementation without failing tests
- ✅ Tests cover all functional requirements (FR-1 through FR-6)
- ✅ Tests cover all non-functional requirements (NFR-1 through NFR-6)
- ✅ Tests verify navigation, purchase flow, persistence, and effects

### Success Metrics:
- Test coverage: >90% for all shop module files
- Performance: Shop opens <300ms, purchases <100ms, smooth with 50+ upgrades
- Reliability: 100% purchase validation accuracy, no duplicate purchases, graceful error handling
- Accessibility: All elements readable by screen readers, 44x44 touch targets, WCAG AA contrast

### Implementation Order:
1. Navigation foundation (enable moving between screens)
2. Upgrade data structures (define what can be purchased)
3. State management (track purchases and validate transactions)
4. Shop UI (display upgrades and enable purchases)
5. Gameplay integration (apply upgrade effects to existing systems)
6. End-to-end testing and polish

---

*Generated from TDD: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/specs/tdd_shop.md`*

*Generation Date: 2025-11-16*

*Total Estimated Implementation Time: 3.5 days*
