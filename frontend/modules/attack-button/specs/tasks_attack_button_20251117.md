# Task List: Attack Button Feature (Singularity Pet Feeding System)
**Generated From:** tdd_attack_button_20251117.md
**Date:** 2025-11-17
**Status:** Ready for Execution
**Methodology:** Test-Driven Development (TDD)

---

## Overview

This task list breaks down the implementation of the Attack Button feature into atomic, agent-executable tasks following TDD methodology. Each task is clearly defined with specific file paths, code requirements, and dependencies.

**Key Principles:**
1. Write test first, then implement
2. Each task is atomic and independently testable
3. Tasks build upon each other sequentially
4. All tests must pass using cmd.exe as per project guidelines

---

## Phase 1: Core Foundation - Type Definitions & Store Setup

### Task 1.1: Create Game State Type Definitions
**Status:** Pending
**Priority:** HIGH
**Dependencies:** None
**Estimated Time:** 15 minutes

**Objective:** Create the foundational type definitions for the game state.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/shared/types/game.ts`

**Implementation Details:**
1. Create file at `/mnt/c/dev/class-one-rapids/frontend/shared/types/game.ts`
2. Define `GameState` interface with:
   - `petCount: number` (main counter)
   - `scrap: number` (reserved for future)
   - `upgrades: Upgrade[]` (reserved for future)
   - `purchasedUpgrades: string[]` (reserved for future)
3. Define `Upgrade` interface with:
   - `id: string`
   - `name: string`
   - `description: string`
   - `scrapCost: number`
   - `effectType: 'scrapMultiplier' | 'petBonus'`
   - `effectValue: number`
4. Define `PersistedGameState` interface with:
   - `version: number`
   - `data: GameState`
   - `timestamp: number`
5. Define `STORAGE_KEYS` constant with `GAME_STATE: 'game-state-v1'`
6. Define `DEFAULT_GAME_STATE` constant with all zeros/empty arrays
7. Implement `isValidGameState(state: unknown): state is GameState` type guard
8. Implement `sanitizeGameState(state: GameState): GameState` sanitization function

**Acceptance Criteria:**
- [ ] File compiles without TypeScript errors
- [ ] All interfaces are properly exported
- [ ] Type guards validate structure and value ranges
- [ ] Sanitization clamps values to valid ranges

---

### Task 1.2: Write Tests for Game Store - Observable Initialization
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 1.1
**Estimated Time:** 20 minutes

**Objective:** Write tests for game store observable initialization before implementing the store.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`

**Implementation Details:**
1. Create test file at `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`
2. Import necessary testing utilities and types
3. Add `beforeEach` hook to reset state and clear mocks
4. Write test suite: `describe('gameStore', () => { ... })`
5. Add nested suite: `describe('gameState$ observable', () => { ... })`
6. Write tests:
   - Test: 'initializes with zero pet count'
   - Test: 'allows setting pet count'
   - Test: 'supports functional updates'
   - Test: 'initializes with empty scrap'
   - Test: 'initializes with empty upgrades array'
   - Test: 'initializes with empty purchasedUpgrades array'

**Test Code Reference:**
```typescript
describe('gameState$ observable', () => {
  test('initializes with zero pet count', () => {
    expect(gameState$.petCount.get()).toBe(0);
  });

  test('allows setting pet count', () => {
    gameState$.petCount.set(5);
    expect(gameState$.petCount.get()).toBe(5);
  });

  test('supports functional updates', () => {
    gameState$.petCount.set(10);
    gameState$.petCount.set(prev => prev + 5);
    expect(gameState$.petCount.get()).toBe(15);
  });
});
```

**Acceptance Criteria:**
- [ ] Tests are written but fail (expected - TDD red phase)
- [ ] Test file compiles with TypeScript
- [ ] Test structure follows Jest best practices

---

### Task 1.3: Implement Game Store - Observable and Basic Functions
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 1.2
**Estimated Time:** 25 minutes

**Objective:** Implement the game store with Legend State observable to pass the tests from Task 1.2.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Implementation Details:**
1. Create file at `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`
2. Import `observable` from '@legendapp/state'
3. Import `GameState` type from '../types/game'
4. Create `gameState$` observable with initial values:
   - `petCount: 0`
   - `scrap: 0`
   - `upgrades: []`
   - `purchasedUpgrades: []`
5. Export `gameState$` observable
6. Implement `incrementPetCount(amount: number = 1): void`
   - Use functional update: `gameState$.petCount.set(prev => prev + amount)`
7. Implement `resetPetCount(): void`
   - Set petCount to 0
8. Implement `resetGameState(): void`
   - Reset all fields to defaults
9. Export `maxPetCount = Number.MAX_SAFE_INTEGER`
10. Implement `isPetCountAtMax(): boolean`
    - Return true if petCount >= maxPetCount

**Acceptance Criteria:**
- [ ] Tests from Task 1.2 pass
- [ ] TypeScript compiles without errors
- [ ] All functions properly exported
- [ ] Observable updates trigger reactively

---

### Task 1.4: Write Tests for Game Store - Increment Functions
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 1.3
**Estimated Time:** 15 minutes

**Objective:** Write tests for increment and reset functions.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`

**Implementation Details:**
1. Add nested suite: `describe('incrementPetCount', () => { ... })`
2. Write tests:
   - Test: 'increments by 1 by default'
   - Test: 'increments by specified amount'
   - Test: 'accumulates multiple increments'
3. Add nested suite: `describe('resetPetCount', () => { ... })`
4. Write tests:
   - Test: 'resets pet count to zero'
   - Test: 'resets from non-zero value'
5. Add nested suite: `describe('resetGameState', () => { ... })`
6. Write tests:
   - Test: 'resets all state to defaults'
   - Test: 'resets petCount, scrap, upgrades, and purchasedUpgrades'

**Acceptance Criteria:**
- [ ] All tests pass (implementation already exists from Task 1.3)
- [ ] Tests verify increment behavior
- [ ] Tests verify reset behavior
- [ ] Edge cases covered

---

### Task 1.5: Write Tests for Game Store - Maximum Value Handling
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 1.4
**Estimated Time:** 10 minutes

**Objective:** Write tests for maximum value handling.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`

**Implementation Details:**
1. Add nested suite: `describe('maximum value handling', () => { ... })`
2. Write tests:
   - Test: 'isPetCountAtMax returns false initially'
   - Test: 'isPetCountAtMax returns true at maximum'
   - Test: 'maxPetCount equals Number.MAX_SAFE_INTEGER'
   - Test: 'isPetCountAtMax returns true when exceeding maximum'

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Maximum value constant validated
- [ ] Boundary conditions tested

---

## Phase 2: Persistence Layer

### Task 2.1: Write Tests for Persistence - Save Operations
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 1.5
**Estimated Time:** 25 minutes

**Objective:** Write tests for saving game state to AsyncStorage before implementing persistence.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.test.ts`

**Implementation Details:**
1. Create test file at `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.test.ts`
2. Mock AsyncStorage from '@react-native-async-storage/async-storage'
3. Add `beforeEach` hook to clear mocks
4. Write test suite: `describe('persistence', () => { ... })`
5. Add nested suite: `describe('saveGameState', () => { ... })`
6. Write tests:
   - Test: 'saves state to AsyncStorage'
   - Test: 'includes version and timestamp'
   - Test: 'serializes state as JSON'
   - Test: 'throws StorageQuotaError when quota exceeded'
   - Test: 'saves with correct storage key'

**Test Code Reference:**
```typescript
test('saves state to AsyncStorage', async () => {
  const state: GameState = {
    petCount: 10,
    scrap: 50,
    upgrades: [],
    purchasedUpgrades: [],
  };

  await saveGameState(state);

  expect(AsyncStorage.setItem).toHaveBeenCalledWith(
    STORAGE_KEYS.GAME_STATE,
    expect.stringContaining('"petCount":10')
  );
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Mock setup properly configured
- [ ] AsyncStorage interactions tested
- [ ] Error cases covered

---

### Task 2.2: Implement Persistence - Save Functions
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.1
**Estimated Time:** 20 minutes

**Objective:** Implement saveGameState function to pass tests from Task 2.1.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.ts`

**Implementation Details:**
1. Create file at `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.ts`
2. Import AsyncStorage from '@react-native-async-storage/async-storage'
3. Import types from '../types/game'
4. Define `CURRENT_VERSION = 1` constant
5. Implement `saveGameState(state: GameState): Promise<void>`:
   - Create `PersistedGameState` object with version, data, and timestamp
   - Serialize to JSON
   - Save to AsyncStorage with `STORAGE_KEYS.GAME_STATE` key
   - Handle QuotaExceededError specifically
   - Throw custom `StorageQuotaError` when quota exceeded
6. Implement `StorageQuotaError` class extending Error

**Acceptance Criteria:**
- [ ] Tests from Task 2.1 pass
- [ ] State saved with version and timestamp
- [ ] Quota errors handled properly
- [ ] Function properly typed

---

### Task 2.3: Write Tests for Persistence - Load Operations
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.2
**Estimated Time:** 25 minutes

**Objective:** Write tests for loading game state from AsyncStorage.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.test.ts`

**Implementation Details:**
1. Add nested suite: `describe('loadGameState', () => { ... })`
2. Write tests:
   - Test: 'loads and parses saved state'
   - Test: 'returns null when no saved state exists'
   - Test: 'sanitizes invalid values (negative numbers)'
   - Test: 'handles corrupted JSON gracefully'
   - Test: 'returns null for invalid state structure'
   - Test: 'returns null for unknown version'
   - Test: 'validates petCount is within safe integer range'

**Test Code Reference:**
```typescript
test('sanitizes invalid values', async () => {
  const persisted: PersistedGameState = {
    version: 1,
    data: { petCount: -5, scrap: -10, upgrades: [], purchasedUpgrades: [] },
    timestamp: Date.now(),
  };

  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
    JSON.stringify(persisted)
  );

  const loaded = await loadGameState();

  expect(loaded?.petCount).toBe(0); // Clamped to minimum
  expect(loaded?.scrap).toBe(0);
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] All edge cases covered
- [ ] Validation scenarios tested
- [ ] Error handling tested

---

### Task 2.4: Implement Persistence - Load Functions
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.3
**Estimated Time:** 25 minutes

**Objective:** Implement loadGameState function to pass tests from Task 2.3.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.ts`

**Implementation Details:**
1. Implement `loadGameState(): Promise<GameState | null>`:
   - Read from AsyncStorage with `STORAGE_KEYS.GAME_STATE` key
   - Return null if no data exists
   - Parse JSON to `PersistedGameState`
   - Check version (currently only version 1 supported)
   - Return null for unknown versions
   - Validate state structure using `isValidGameState`
   - Sanitize values using `sanitizeGameState`
   - Return sanitized state
   - Catch and log errors, return null on failure

**Acceptance Criteria:**
- [ ] Tests from Task 2.3 pass
- [ ] Validation works correctly
- [ ] Sanitization clamps values
- [ ] Errors handled gracefully

---

### Task 2.5: Write Tests for Persistence - Clear and Utility Operations
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.4
**Estimated Time:** 15 minutes

**Objective:** Write tests for clearGameState and isStorageAvailable functions.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.test.ts`

**Implementation Details:**
1. Add nested suite: `describe('clearGameState', () => { ... })`
2. Write tests:
   - Test: 'removes state from storage'
   - Test: 'uses correct storage key'
   - Test: 'handles errors gracefully'
3. Add nested suite: `describe('isStorageAvailable', () => { ... })`
4. Write tests:
   - Test: 'returns true when storage works'
   - Test: 'returns false when storage fails'
   - Test: 'cleans up test key after check'

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Clear operation tested
- [ ] Storage availability check tested

---

### Task 2.6: Implement Persistence - Clear and Utility Functions
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.5
**Estimated Time:** 15 minutes

**Objective:** Implement clearGameState and isStorageAvailable functions.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.ts`

**Implementation Details:**
1. Implement `clearGameState(): Promise<void>`:
   - Remove item from AsyncStorage with `STORAGE_KEYS.GAME_STATE` key
   - Catch and log errors
   - Re-throw errors (caller should handle)
2. Implement `isStorageAvailable(): Promise<boolean>`:
   - Try to write test key `'__storage_test__'`
   - Try to remove test key
   - Return true if both succeed
   - Return false if any operation fails
   - Use try-catch to handle errors

**Acceptance Criteria:**
- [ ] Tests from Task 2.5 pass
- [ ] Clear function removes data
- [ ] Availability check reliable
- [ ] All persistence tests pass with 90%+ coverage

---

### Task 2.7: Write Tests for Game Store - Initialization from Storage
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.6
**Estimated Time:** 20 minutes

**Objective:** Write tests for initializing game state from persistent storage.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`

**Implementation Details:**
1. Mock persistence functions at top of file
2. Add nested suite: `describe('initializeGameState', () => { ... })`
3. Write tests:
   - Test: 'loads saved state from storage'
   - Test: 'merges saved state with current state'
   - Test: 'handles missing saved state gracefully'
   - Test: 'handles load errors gracefully'
   - Test: 'continues with default state on error'
   - Test: 'does not throw on initialization failure'

**Test Code Reference:**
```typescript
test('loads saved state from storage', async () => {
  const savedState: GameState = {
    petCount: 42,
    scrap: 100,
    upgrades: [],
    purchasedUpgrades: [],
  };

  (loadGameState as jest.Mock).mockResolvedValue(savedState);

  await initializeGameState();

  expect(gameState$.petCount.get()).toBe(42);
  expect(gameState$.scrap.get()).toBe(100);
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Initialization scenarios covered
- [ ] Error handling tested
- [ ] Mock setup correct

---

### Task 2.8: Implement Game Store - Initialization Function
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.7
**Estimated Time:** 15 minutes

**Objective:** Implement initializeGameState function to pass tests from Task 2.7.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Implementation Details:**
1. Import `loadGameState` from './persistence'
2. Implement `initializeGameState(): Promise<void>`:
   - Call `loadGameState()` and await result
   - If savedState exists:
     - Merge with current state using spread operator
     - Use `gameState$.set()` to update
   - If savedState is null:
     - Continue with current defaults (no action needed)
   - Wrap in try-catch block
   - Log errors to console.error
   - Never throw (graceful degradation)

**Acceptance Criteria:**
- [ ] Tests from Task 2.7 pass
- [ ] State initialized from storage
- [ ] Errors handled gracefully
- [ ] No thrown errors on failure

---

### Task 2.9: Write Tests for Game Store - Auto-Persistence
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.8
**Estimated Time:** 20 minutes

**Objective:** Write tests for automatic persistence with debouncing.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`

**Implementation Details:**
1. Add nested suite: `describe('auto-persistence', () => { ... })`
2. Use `jest.useFakeTimers()` and `jest.useRealTimers()` appropriately
3. Write tests:
   - Test: 'debounces storage writes'
   - Test: 'does not save immediately after state change'
   - Test: 'saves after 1 second debounce delay'
   - Test: 'cancels previous save timeout on rapid changes'
   - Test: 'saves only once for multiple rapid changes'
   - Test: 'handles save errors gracefully'

**Test Code Reference:**
```typescript
test('debounces storage writes', async () => {
  jest.useFakeTimers();

  incrementPetCount();
  incrementPetCount();
  incrementPetCount();

  // Should not save immediately
  expect(saveGameState).not.toHaveBeenCalled();

  // Advance past debounce delay
  jest.advanceTimersByTime(1000);

  // Flush promises
  await Promise.resolve();

  // Should save once
  expect(saveGameState).toHaveBeenCalledTimes(1);

  jest.useRealTimers();
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Debouncing behavior tested
- [ ] Timer manipulation correct
- [ ] Save frequency validated

---

### Task 2.10: Implement Game Store - Auto-Persistence with Debouncing
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.9
**Estimated Time:** 20 minutes

**Objective:** Implement auto-persistence with debouncing to pass tests from Task 2.9.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Implementation Details:**
1. Import `saveGameState` from './persistence'
2. Define `SAVE_DEBOUNCE_MS = 1000` constant
3. Define `saveTimeout: NodeJS.Timeout | null = null` variable
4. Set up `gameState$.onChange()` listener:
   - Clear existing timeout if present
   - Set new timeout with `SAVE_DEBOUNCE_MS` delay
   - In timeout callback:
     - Get current state with `gameState$.get()`
     - Call `saveGameState(state)`
     - Handle promise rejection with `.catch()`
     - Log errors to console.error

**Acceptance Criteria:**
- [ ] Tests from Task 2.9 pass
- [ ] Debouncing works correctly
- [ ] Multiple rapid changes trigger single save
- [ ] Errors logged but don't crash
- [ ] All game store tests pass with 90%+ coverage

---

## Phase 3: Hooks Layer

### Task 3.1: Write Tests for useGameState Hook
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.10
**Estimated Time:** 15 minutes

**Objective:** Write tests for the useGameState hook through component usage (per project guidelines).

**Note:** Per CLAUDE.md guidelines, hooks should be tested through components that use them, not standalone hook tests.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/__tests__/useGameState.integration.test.tsx`

**Implementation Details:**
1. Create integration test that uses a test component
2. Write test suite: `describe('useGameState hook integration', () => { ... })`
3. Create test component that uses useGameState
4. Write tests:
   - Test: 'provides access to petCount observable'
   - Test: 'provides access to scrap observable'
   - Test: 'provides access to upgrades observable'
   - Test: 'provides access to purchasedUpgrades observable'
   - Test: 'observables are reactive to changes'
   - Test: 'returns same observable references on re-render'

**Test Code Reference:**
```typescript
test('provides access to petCount observable', () => {
  const TestComponent = () => {
    const { petCount$ } = useGameState();
    return <Text>Count: {petCount$.get()}</Text>;
  };

  const { getByText } = render(<TestComponent />);
  expect(getByText('Count: 0')).toBeTruthy();
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Tests verify hook returns correct observables
- [ ] Reactivity tested through component
- [ ] No standalone hook tests (per guidelines)

---

### Task 3.2: Implement useGameState Hook
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 3.1
**Estimated Time:** 10 minutes

**Objective:** Implement useGameState hook to pass tests from Task 3.1.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useGameState.ts`

**Implementation Details:**
1. Create file at `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useGameState.ts`
2. Import `gameState$` from '../store/gameStore'
3. Implement `useGameState()` function:
   - Return object with observable references:
     - `petCount$: gameState$.petCount`
     - `scrap$: gameState$.scrap`
     - `upgrades$: gameState$.upgrades`
     - `purchasedUpgrades$: gameState$.purchasedUpgrades`
4. Add JSDoc comment explaining usage
5. Export function

**Acceptance Criteria:**
- [ ] Tests from Task 3.1 pass
- [ ] Hook returns correct observable references
- [ ] TypeScript types properly inferred
- [ ] JSDoc documentation added

---

## Phase 4: UI Component

### Task 4.1: Write Tests for AttackButtonScreen - Rendering
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 3.2
**Estimated Time:** 25 minutes

**Objective:** Write tests for AttackButtonScreen component rendering before implementation.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Implementation Details:**
1. Create test file at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`
2. Import necessary testing utilities from '@testing-library/react-native'
3. Import gameStore functions for state management in tests
4. Add `beforeEach` hook to reset game state
5. Write test suite: `describe('AttackButtonScreen', () => { ... })`
6. Add nested suite: `describe('rendering', () => { ... })`
7. Write tests:
   - Test: 'renders feed button'
   - Test: 'renders pet counter with initial value'
   - Test: 'renders with zero initial count'
   - Test: 'displays previously saved pet count'
   - Test: 'renders SafeAreaView container'
   - Test: 'applies correct styles to button'

**Test Code Reference:**
```typescript
import { render } from '@testing-library/react-native';
import { AttackButtonScreen } from './AttackButtonScreen';
import { gameState$, resetGameState } from '../../shared/store/gameStore';

describe('AttackButtonScreen', () => {
  beforeEach(() => {
    resetGameState();
  });

  describe('rendering', () => {
    test('renders feed button', () => {
      const { getByText } = render(<AttackButtonScreen />);
      const button = getByText('feed');
      expect(button).toBeTruthy();
    });

    test('renders pet counter with initial value', () => {
      const { getByText } = render(<AttackButtonScreen />);
      expect(getByText(/Singularity Pet Count: 0/)).toBeTruthy();
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Test file compiles with TypeScript
- [ ] Basic rendering scenarios covered

---

### Task 4.2: Implement AttackButtonScreen - Basic Structure
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.1
**Estimated Time:** 25 minutes

**Objective:** Implement basic AttackButtonScreen component to pass rendering tests.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Implementation Details:**
1. Create file at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`
2. Import React, View, Text, Pressable, StyleSheet from 'react-native'
3. Import SafeAreaView from 'react-native-safe-area-context'
4. Import observer from '@legendapp/state/react'
5. Import useGameState from '../../shared/hooks/useGameState'
6. Create component function wrapped with `observer`
7. Get `petCount$` from useGameState hook
8. Create empty `handleFeed` function (placeholder)
9. Render SafeAreaView with:
   - Container View
   - Text displaying "Singularity Pet Count: {petCount$.get()}"
   - Pressable button with text "feed"
10. Create basic StyleSheet with:
    - container: flex: 1, backgroundColor: '#FFFFFF'
    - content: flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20
    - counterText: fontSize: 18, marginBottom: 30, color: '#000000'
    - button: basic button styles (will enhance later)
    - buttonText: fontSize: 16, color: '#FFFFFF'

**Acceptance Criteria:**
- [ ] Tests from Task 4.1 pass
- [ ] Component renders without errors
- [ ] Counter displays correctly
- [ ] Button renders (not functional yet)

---

### Task 4.3: Write Tests for AttackButtonScreen - Button Interaction
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.2
**Estimated Time:** 20 minutes

**Objective:** Write tests for button press interactions.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Implementation Details:**
1. Add nested suite: `describe('button interaction', () => { ... })`
2. Write tests:
   - Test: 'increments counter when button pressed'
   - Test: 'increments counter multiple times'
   - Test: 'handles rapid clicking correctly'
   - Test: 'updates counter display after each press'

**Test Code Reference:**
```typescript
describe('button interaction', () => {
  test('increments counter when button pressed', () => {
    const { getByText } = render(<AttackButtonScreen />);
    const button = getByText('feed');

    fireEvent.press(button);

    expect(getByText(/Singularity Pet Count: 1/)).toBeTruthy();
  });

  test('increments counter multiple times', () => {
    const { getByText } = render(<AttackButtonScreen />);
    const button = getByText('feed');

    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(getByText(/Singularity Pet Count: 3/)).toBeTruthy();
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Button interaction scenarios covered
- [ ] Multiple clicks tested
- [ ] Rapid clicking tested

---

### Task 4.4: Implement AttackButtonScreen - Button Press Handler
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.3
**Estimated Time:** 10 minutes

**Objective:** Implement button press handler to pass interaction tests.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Implementation Details:**
1. Update `handleFeed` function:
   - Use `petCount$.set(prev => prev + 1)` for functional update
2. Connect to button's `onPress` prop:
   - `onPress={handleFeed}`

**Acceptance Criteria:**
- [ ] Tests from Task 4.3 pass
- [ ] Button increments counter
- [ ] Multiple clicks work correctly
- [ ] Rapid clicking handled properly

---

### Task 4.5: Write Tests for AttackButtonScreen - Reactivity
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.4
**Estimated Time:** 15 minutes

**Objective:** Write tests for reactive state updates.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Implementation Details:**
1. Add nested suite: `describe('reactivity', () => { ... })`
2. Write tests:
   - Test: 'counter updates reactively to external state changes'
   - Test: 'displays correct count after state reset'
   - Test: 'updates immediately when state changes'

**Test Code Reference:**
```typescript
test('counter updates reactively to external state changes', () => {
  const { getByText, rerender } = render(<AttackButtonScreen />);

  expect(getByText(/Singularity Pet Count: 0/)).toBeTruthy();

  // External state update
  gameState$.petCount.set(100);
  rerender(<AttackButtonScreen />);

  expect(getByText(/Singularity Pet Count: 100/)).toBeTruthy();
});
```

**Acceptance Criteria:**
- [ ] Tests pass (implementation already reactive due to observer)
- [ ] External state changes reflected in UI
- [ ] Reactivity verified

---

### Task 4.6: Write Tests for AttackButtonScreen - Accessibility
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.5
**Estimated Time:** 20 minutes

**Objective:** Write tests for accessibility attributes.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Implementation Details:**
1. Add nested suite: `describe('accessibility', () => { ... })`
2. Write tests:
   - Test: 'button has correct accessibility role'
   - Test: 'button has correct accessibility label'
   - Test: 'button has accessibility hint'
   - Test: 'counter has correct accessibility role'
   - Test: 'counter has correct accessibility label'
   - Test: 'counter accessibility label updates with value'

**Test Code Reference:**
```typescript
describe('accessibility', () => {
  test('button has correct accessibility attributes', () => {
    const { getByLabelText } = render(<AttackButtonScreen />);
    const button = getByLabelText('feed button');

    expect(button).toBeTruthy();
    expect(button.props.accessibilityRole).toBe('button');
  });

  test('counter has correct accessibility label', () => {
    gameState$.petCount.set(5);
    const { getByLabelText } = render(<AttackButtonScreen />);

    const counter = getByLabelText('Singularity Pet Count: 5');
    expect(counter).toBeTruthy();
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] All accessibility attributes tested
- [ ] WCAG compliance verified

---

### Task 4.7: Implement AttackButtonScreen - Accessibility Attributes
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.6
**Estimated Time:** 15 minutes

**Objective:** Add accessibility attributes to pass tests from Task 4.6.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Implementation Details:**
1. Add accessibility props to counter Text:
   - `accessibilityRole="text"`
   - `accessibilityLabel={`Singularity Pet Count: ${petCount$.get()}`}`
2. Add accessibility props to Pressable button:
   - `accessibilityRole="button"`
   - `accessibilityLabel="feed button"`
   - `accessibilityHint="Tap to feed your Singularity Pet and increase the count"`

**Acceptance Criteria:**
- [ ] Tests from Task 4.6 pass
- [ ] All accessibility attributes present
- [ ] Screen readers can navigate properly
- [ ] WCAG 2.1 AA compliant

---

### Task 4.8: Write Tests for AttackButtonScreen - Visual Feedback
**Status:** Pending
**Priority:** MEDIUM
**Dependencies:** Task 4.7
**Estimated Time:** 15 minutes

**Objective:** Write tests for button visual feedback on press.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Implementation Details:**
1. Add nested suite: `describe('visual feedback', () => { ... })`
2. Write tests:
   - Test: 'button applies pressed style on press'
   - Test: 'button has shadow/elevation styles'
   - Test: 'button meets minimum touch target size (44x44)'

**Note:** Testing dynamic styles may require checking props directly or using snapshot testing.

**Acceptance Criteria:**
- [ ] Tests written but may need adjustment based on implementation
- [ ] Visual feedback scenarios identified
- [ ] Touch target size verified

---

### Task 4.9: Implement AttackButtonScreen - Enhanced Button Styles
**Status:** Pending
**Priority:** MEDIUM
**Dependencies:** Task 4.8
**Estimated Time:** 20 minutes

**Objective:** Enhance button styles with visual feedback and proper touch targets.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Implementation Details:**
1. Update Pressable to use function style:
   ```typescript
   style={({ pressed }) => [
     styles.button,
     pressed && styles.buttonPressed
   ]}
   ```
2. Update button styles in StyleSheet:
   - Add `minWidth: 44, minHeight: 44` (iOS minimum)
   - Add `paddingHorizontal: 24, paddingVertical: 12`
   - Add `backgroundColor: '#007AFF'`
   - Add `borderRadius: 8`
   - Add iOS shadow: `shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4`
   - Add Android shadow: `elevation: 3`
3. Add `buttonPressed` style:
   - `opacity: 0.7`
   - `transform: [{ scale: 0.98 }]`
4. Update buttonText style:
   - `fontWeight: '600'`

**Acceptance Criteria:**
- [ ] Tests from Task 4.8 pass
- [ ] Button has proper touch target size
- [ ] Visual feedback on press
- [ ] Cross-platform shadows work
- [ ] All component tests pass with 80%+ coverage

---

## Phase 5: Integration

### Task 5.1: Update App.tsx to Use AttackButtonScreen
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.9
**Estimated Time:** 15 minutes

**Objective:** Integrate AttackButtonScreen into App.tsx and initialize game state.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/App.tsx`

**Implementation Details:**
1. Import `AttackButtonScreen` from './modules/attack-button/AttackButtonScreen'
2. Import `initializeGameState` from './shared/store/gameStore'
3. Add `useEffect` hook to initialize state on mount:
   ```typescript
   useEffect(() => {
     initializeGameState();
   }, []);
   ```
4. Replace current content with `<AttackButtonScreen />`
5. Ensure SafeAreaProvider is wrapping the app (if not already present)

**Acceptance Criteria:**
- [ ] App renders AttackButtonScreen
- [ ] Game state initializes on app start
- [ ] No console errors
- [ ] TypeScript compiles successfully

---

### Task 5.2: Run All Tests via cmd.exe
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 5.1
**Estimated Time:** 10 minutes

**Objective:** Execute all tests using cmd.exe to verify everything passes.

**Commands to Execute:**
```bash
cmd.exe /c "cd frontend && npm test"
```

**Expected Results:**
- All test suites pass
- No failing tests
- Coverage meets minimum requirements:
  - gameStore.ts: ≥ 90%
  - persistence.ts: ≥ 90%
  - AttackButtonScreen.tsx: ≥ 80%
  - Overall: ≥ 80%

**Acceptance Criteria:**
- [ ] All tests pass in cmd.exe
- [ ] Coverage thresholds met
- [ ] No console errors or warnings
- [ ] Test execution time reasonable

---

### Task 5.3: Generate Coverage Report
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 5.2
**Estimated Time:** 5 minutes

**Objective:** Generate and review test coverage report.

**Commands to Execute:**
```bash
cmd.exe /c "cd frontend && npm run test:coverage"
```

**Review:**
1. Check overall coverage percentage
2. Identify any uncovered lines
3. Verify coverage meets targets:
   - gameStore.ts: ≥ 90%
   - persistence.ts: ≥ 90%
   - AttackButtonScreen.tsx: ≥ 80%

**Acceptance Criteria:**
- [ ] Coverage report generated
- [ ] All coverage targets met
- [ ] No critical uncovered code paths

---

## Phase 6: Manual Testing & Verification

### Task 6.1: Manual Testing - Basic Functionality
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 5.3
**Estimated Time:** 15 minutes

**Objective:** Manually test the application to verify functionality.

**Test Scenarios:**
1. **First Launch:**
   - App starts successfully
   - Counter shows 0
   - Button is visible and labeled "feed"

2. **Button Interaction:**
   - Click button once → counter shows 1
   - Click button 10 times rapidly → counter shows 10
   - All clicks are registered

3. **Visual Feedback:**
   - Button responds to press with visual feedback
   - Button has clear pressed state
   - Counter updates immediately

4. **Persistence:**
   - Click button several times to reach count of 15
   - Close app completely
   - Reopen app
   - Verify counter shows 15

5. **Rapid Clicking:**
   - Click button 50+ times rapidly
   - Verify all clicks registered
   - Verify no lag or dropped inputs
   - Verify app remains responsive

**Acceptance Criteria:**
- [ ] All test scenarios pass
- [ ] No visual glitches
- [ ] Counter displays correctly
- [ ] Persistence works across restarts

---

### Task 6.2: Manual Testing - Accessibility
**Status:** Pending
**Priority:** MEDIUM
**Dependencies:** Task 6.1
**Estimated Time:** 15 minutes

**Objective:** Test accessibility with screen readers.

**Test Scenarios:**
1. **iOS VoiceOver (if available):**
   - Enable VoiceOver
   - Navigate to button
   - Verify announcement: "feed button, button, Tap to feed your Singularity Pet"
   - Navigate to counter
   - Verify announcement: "Singularity Pet Count: [number], text"
   - Press button
   - Verify counter announcement updates

2. **Android TalkBack (if available):**
   - Enable TalkBack
   - Perform similar tests as VoiceOver
   - Verify proper announcements

3. **Keyboard Navigation (Web):**
   - Tab to button
   - Press Enter or Space to activate
   - Verify counter increments

**Acceptance Criteria:**
- [ ] Screen reader properly announces all elements
- [ ] Button is keyboard accessible
- [ ] Counter updates are announced
- [ ] WCAG 2.1 AA compliant

---

### Task 6.3: Manual Testing - Cross-Platform
**Status:** Pending
**Priority:** MEDIUM
**Dependencies:** Task 6.2
**Estimated Time:** 20 minutes

**Objective:** Test on multiple platforms if available.

**Test Scenarios:**
1. **iOS:**
   - Test on iPhone or iPad (or simulator)
   - Verify button styling (shadows, colors)
   - Verify touch targets are adequate
   - Test in both portrait and landscape

2. **Android:**
   - Test on Android device (or emulator)
   - Verify button styling (elevation)
   - Verify touch targets are adequate
   - Test on different screen sizes

3. **Web:**
   - Test in web browser
   - Verify button is clickable
   - Verify styling translates properly
   - Test responsive layout

**Acceptance Criteria:**
- [ ] Works correctly on all tested platforms
- [ ] Styling consistent across platforms
- [ ] No platform-specific bugs
- [ ] Touch targets meet guidelines

---

## Phase 7: Documentation & Finalization

### Task 7.1: Add JSDoc Comments to All Public APIs
**Status:** Pending
**Priority:** MEDIUM
**Dependencies:** Task 6.3
**Estimated Time:** 25 minutes

**Objective:** Add comprehensive JSDoc comments to all public functions and exports.

**Files to Document:**
1. `/mnt/c/dev/class-one-rapids/frontend/shared/types/game.ts`
   - Document all interfaces
   - Document all constants
   - Document all functions

2. `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`
   - Document all exported functions
   - Document observable
   - Add usage examples

3. `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.ts`
   - Document all exported functions
   - Document error classes
   - Add usage examples

4. `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useGameState.ts`
   - Document hook
   - Add usage examples

5. `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`
   - Document component
   - Document any exported types

**JSDoc Template:**
```typescript
/**
 * Brief description
 *
 * Longer description if needed
 *
 * @param paramName - Parameter description
 * @returns Return value description
 * @throws Error conditions
 *
 * @example
 * ```typescript
 * // Usage example
 * ```
 */
```

**Acceptance Criteria:**
- [ ] All public APIs have JSDoc comments
- [ ] Parameters documented
- [ ] Return values documented
- [ ] Examples provided where helpful

---

### Task 7.2: Add Inline Comments for Complex Logic
**Status:** Pending
**Priority:** LOW
**Dependencies:** Task 7.1
**Estimated Time:** 15 minutes

**Objective:** Add inline comments to explain complex or non-obvious logic.

**Areas to Comment:**
1. **gameStore.ts:**
   - Debouncing logic
   - onChange listener setup
   - State initialization logic

2. **persistence.ts:**
   - Version migration logic
   - Validation and sanitization
   - Error handling rationale

3. **AttackButtonScreen.tsx:**
   - Observer HOC usage
   - Functional update rationale

**Acceptance Criteria:**
- [ ] Complex logic has explanatory comments
- [ ] Comments explain "why" not just "what"
- [ ] Code is readable and maintainable

---

### Task 7.3: Final TypeScript Compilation Check
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 7.2
**Estimated Time:** 5 minutes

**Objective:** Verify TypeScript compilation is error-free.

**Commands to Execute:**
```bash
cmd.exe /c "cd frontend && npx tsc --noEmit"
```

**Acceptance Criteria:**
- [ ] TypeScript compiles without errors
- [ ] No type warnings
- [ ] All imports resolve correctly

---

### Task 7.4: Final Test Run
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 7.3
**Estimated Time:** 5 minutes

**Objective:** Run all tests one final time to ensure everything still passes.

**Commands to Execute:**
```bash
cmd.exe /c "cd frontend && npm test -- --coverage"
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Coverage meets all targets
- [ ] No flaky tests
- [ ] Test suite runs cleanly

---

### Task 7.5: Create Feature Summary Document
**Status:** Pending
**Priority:** LOW
**Dependencies:** Task 7.4
**Estimated Time:** 15 minutes

**Objective:** Document the implemented feature for future reference.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/README.md`

**Content to Include:**
1. Feature overview
2. Architecture summary
3. File structure
4. Usage examples
5. Testing approach
6. Performance characteristics
7. Accessibility features
8. Future enhancement opportunities

**Acceptance Criteria:**
- [ ] README created
- [ ] Architecture explained
- [ ] Usage examples provided
- [ ] Future developers can understand the implementation

---

## Summary

### Total Tasks: 38

**By Phase:**
- Phase 1 (Core Foundation): 5 tasks
- Phase 2 (Persistence Layer): 10 tasks
- Phase 3 (Hooks Layer): 2 tasks
- Phase 4 (UI Component): 9 tasks
- Phase 5 (Integration): 3 tasks
- Phase 6 (Manual Testing): 3 tasks
- Phase 7 (Documentation): 5 tasks

**By Priority:**
- HIGH: 29 tasks
- MEDIUM: 7 tasks
- LOW: 2 tasks

**Estimated Total Time:** 8-10 hours

### Key Success Metrics

1. **Functionality:**
   - ✓ Feed button increments counter
   - ✓ Counter persists across restarts
   - ✓ No data loss

2. **Testing:**
   - ✓ All tests pass in cmd.exe
   - ✓ Coverage ≥ 80% overall
   - ✓ Coverage ≥ 90% for store and persistence

3. **Quality:**
   - ✓ TypeScript compiles without errors
   - ✓ WCAG 2.1 AA compliant
   - ✓ No console errors
   - ✓ Code properly documented

4. **Performance:**
   - ✓ Button responds < 100ms
   - ✓ Counter updates < 50ms
   - ✓ Handles rapid clicking (100+ clicks)
   - ✓ Debouncing reduces I/O

### Dependencies Graph

```
Task 1.1 (Types)
    ↓
Task 1.2 (Store Tests - Observable)
    ↓
Task 1.3 (Store Implementation)
    ↓
Task 1.4 (Store Tests - Increment)
    ↓
Task 1.5 (Store Tests - Maximum)
    ↓
Task 2.1 (Persistence Tests - Save)
    ↓
Task 2.2 (Persistence Implementation - Save)
    ↓
Task 2.3 (Persistence Tests - Load)
    ↓
Task 2.4 (Persistence Implementation - Load)
    ↓
Task 2.5 (Persistence Tests - Clear)
    ↓
Task 2.6 (Persistence Implementation - Clear)
    ↓
Task 2.7 (Store Tests - Initialization)
    ↓
Task 2.8 (Store Implementation - Initialization)
    ↓
Task 2.9 (Store Tests - Auto-Persistence)
    ↓
Task 2.10 (Store Implementation - Auto-Persistence)
    ↓
Task 3.1 (Hook Tests)
    ↓
Task 3.2 (Hook Implementation)
    ↓
Task 4.1 (Component Tests - Rendering)
    ↓
Task 4.2 (Component Implementation - Basic)
    ↓
Task 4.3 (Component Tests - Interaction)
    ↓
Task 4.4 (Component Implementation - Handler)
    ↓
Task 4.5 (Component Tests - Reactivity)
    ↓
Task 4.6 (Component Tests - Accessibility)
    ↓
Task 4.7 (Component Implementation - Accessibility)
    ↓
Task 4.8 (Component Tests - Visual Feedback)
    ↓
Task 4.9 (Component Implementation - Enhanced Styles)
    ↓
Task 5.1 (App Integration)
    ↓
Task 5.2 (Run Tests)
    ↓
Task 5.3 (Coverage Report)
    ↓
Task 6.1 (Manual Testing - Basic)
    ↓
Task 6.2 (Manual Testing - Accessibility)
    ↓
Task 6.3 (Manual Testing - Cross-Platform)
    ↓
Task 7.1 (JSDoc Comments)
    ↓
Task 7.2 (Inline Comments)
    ↓
Task 7.3 (TypeScript Check)
    ↓
Task 7.4 (Final Test Run)
    ↓
Task 7.5 (Summary Document)
```

### Notes for Execution

1. **TDD Workflow:**
   - Always write tests before implementation
   - Run tests after each implementation task
   - Expect tests to fail initially (red phase)
   - Implement minimal code to pass tests (green phase)
   - Refactor if needed (refactor phase)

2. **Testing with cmd.exe:**
   - Per project guidelines, always use cmd.exe to run Jest tests
   - Format: `cmd.exe /c "cd frontend && npm test"`
   - This avoids WSL/Windows slowness issues

3. **Hook Testing:**
   - Per project guidelines, test hooks through components
   - Don't create standalone hook tests
   - Integration tests are preferred

4. **File Paths:**
   - All file paths are absolute
   - Base path: `/mnt/c/dev/class-one-rapids/frontend/`
   - Ensure correct directory structure

5. **TypeScript:**
   - All code must be TypeScript
   - Strict type checking
   - No `any` types unless absolutely necessary

6. **State Management:**
   - Use Legend State observables
   - Prefer functional updates for safety
   - Wrap components with `observer` HOC

7. **Error Handling:**
   - Never throw on initialization failures
   - Log errors to console
   - Graceful degradation

8. **Accessibility:**
   - All interactive elements need accessibility props
   - Meet WCAG 2.1 AA standards
   - Test with screen readers when possible

---

**Ready for Execution:** This task list can be executed sequentially by an agent or developer. Each task is atomic, well-defined, and includes specific acceptance criteria.
