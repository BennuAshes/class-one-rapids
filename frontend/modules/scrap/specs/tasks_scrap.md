# Scrap Resource System - Agent-Executable Task List

## Document Control

| Version | Author | Date | Status | Source TDD |
|---------|--------|------|--------|------------|
| v1.0 | Claude (Generated) | 2025-11-16 | Ready for Execution | tdd_scrap.md |

---

## Overview

This task list breaks down the Scrap Resource System implementation into explicit, sequential, agent-executable tasks following Test-Driven Development (TDD) methodology. Each task includes specific file paths, actions, and success criteria.

**Total Estimated Time**: 2.0 days

**Key Principles**:
- RED-GREEN-REFACTOR cycle for all implementation
- Component integration tests FIRST (before any implementation)
- No implementation without failing tests first
- Tests run via `cmd.exe` (per CLAUDE.md guidelines for WSL performance)

---

## Phase 1: Foundation & Test Setup [0.5 days]

### Task 1.1: Create Scrap Module Directory Structure

**Objective**: Establish file structure for scrap feature

**Actions**:
1. Create directory: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/`
2. Verify directory exists with `ls` command

**Success Criteria**:
- [ ] Directory `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/` exists

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/` (directory)

---

### Task 1.2: Write Component Integration Tests (RED Phase - MANDATORY FIRST)

**Objective**: Write failing integration tests in ClickerScreen.test.tsx that verify scrap display and generation behavior

**TDD Phase**: RED (tests must fail initially)

**Actions**:
1. Read existing file: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`
2. Add new test suite: `describe('ClickerScreen Scrap Integration', () => { ... })`
3. Add test: `test('displays scrap total on screen', () => { ... })`
   - Verify scrap display exists with `screen.getByText(/scrap/i)`
4. Add test: `test('scrap increases automatically every second', async () => { ... })`
   - Use `jest.useFakeTimers()`
   - Advance time with `jest.advanceTimersByTime(1000)`
   - Verify scrap value changes
5. Add test: `test('scrap generation scales with pet count', async () => { ... })`
   - Add 3 pets via button presses
   - Advance 1 second
   - Verify scrap increased by 3
6. Add test: `test('scrap persists across remounts', async () => { ... })`
   - Generate scrap
   - Unmount component
   - Mock AsyncStorage.getItem to return saved value
   - Re-render
   - Verify scrap restored
7. Add test: `test('displays formatted scrap numbers with thousand separators', async () => { ... })`
   - Mock AsyncStorage to return large value (1234567)
   - Verify display shows "1,234,567"
8. Run tests via `cmd.exe /c "npm test ClickerScreen.test.tsx"`

**Success Criteria**:
- [ ] 5 new integration tests added to ClickerScreen.test.tsx
- [ ] All new tests FAIL (RED phase confirmed)
- [ ] Error messages indicate missing scrap display/functionality
- [ ] Tests use proper async/await patterns with `waitFor`
- [ ] Tests use fake timers for time-based assertions

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`

**Reference Implementation** (from TDD Section 8):
```typescript
describe('ClickerScreen Scrap Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('displays scrap total on screen', () => {
    render(<ClickerScreen />);
    expect(screen.getByText(/scrap/i)).toBeTruthy();
  });

  test('scrap increases automatically every second', async () => {
    render(<ClickerScreen />);
    const initialText = screen.getByText(/scrap/i);
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(screen.getByText(/scrap/i)).toBeTruthy();
    });
  });

  test('scrap generation scales with pet count', async () => {
    render(<ClickerScreen />);
    const button = screen.getByRole('button', { name: /feed/i });

    for (let i = 0; i < 3; i++) {
      await userEvent.press(button);
    }

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 3/i)).toBeTruthy();
    });

    const scrapBefore = parseInt(
      screen.getByText(/scrap/i).props.children.match(/\d+/)[0]
    );

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      const scrapAfter = parseInt(
        screen.getByText(/scrap/i).props.children.match(/\d+/)[0]
      );
      expect(scrapAfter).toBe(scrapBefore + 3);
    });
  });

  test('scrap persists across remounts', async () => {
    const { unmount } = render(<ClickerScreen />);
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'scrap-total-v1',
        expect.any(String)
      );
    });

    unmount();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(5));
    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/scrap.*5/i)).toBeTruthy();
    });
  });

  test('displays formatted scrap numbers with thousand separators', async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'scrap-total-v1') return Promise.resolve(JSON.stringify(1234567));
      return Promise.resolve(null);
    });

    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/scrap.*1,234,567/i)).toBeTruthy();
    });
  });
});
```

---

## Phase 2: TDD Feature Implementation [1-1.5 days]

### Task 2.1: Implement formatNumber Utility with TDD [0.25 days]

#### Task 2.1.1: Write formatNumber Tests (RED Phase)

**Objective**: Write comprehensive failing tests for number formatting utility

**TDD Phase**: RED

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.test.ts`
2. Import testing utilities
3. Add test: `test('formats zero correctly', () => { ... })`
   - Expect: `formatNumber(0)` returns `'0'`
4. Add test: `test('formats small numbers without separators', () => { ... })`
   - Expect: `formatNumber(1)` returns `'1'`
   - Expect: `formatNumber(99)` returns `'99'`
   - Expect: `formatNumber(999)` returns `'999'`
5. Add test: `test('formats thousands with comma separator', () => { ... })`
   - Expect: `formatNumber(1000)` returns `'1,000'`
   - Expect: `formatNumber(1234)` returns `'1,234'`
6. Add test: `test('formats millions with comma separators', () => { ... })`
   - Expect: `formatNumber(1000000)` returns `'1,000,000'`
   - Expect: `formatNumber(1234567)` returns `'1,234,567'`
7. Add test: `test('formats billions with comma separators', () => { ... })`
   - Expect: `formatNumber(1000000000)` returns `'1,000,000,000'`
8. Add test: `test('handles large numbers within JavaScript safe integer range', () => { ... })`
   - Expect: `formatNumber(999999999999)` returns `'999,999,999,999'`
9. Add test: `test('handles negative numbers (edge case)', () => { ... })`
   - Expect: `formatNumber(-1234)` returns `'-1,234'`
10. Add test: `test('handles decimal numbers', () => { ... })`
    - Expect: `formatNumber(1234.56)` returns `'1,234.56'`
11. Run tests via `cmd.exe /c "npm test formatNumber.test.ts"`

**Success Criteria**:
- [ ] File created with 8 test cases
- [ ] All tests FAIL with "formatNumber is not defined" error
- [ ] Tests cover: zero, small numbers, thousands, millions, billions, large numbers, negatives, decimals

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.test.ts`

---

#### Task 2.1.2: Implement formatNumber Utility (GREEN Phase)

**Objective**: Implement minimal code to make all formatNumber tests pass

**TDD Phase**: GREEN

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.ts`
2. Export function: `export function formatNumber(value: number): string`
3. Implement using `toLocaleString('en-US')` method
4. Add JSDoc comment explaining function purpose and examples
5. Run tests via `cmd.exe /c "npm test formatNumber.test.ts"`

**Success Criteria**:
- [ ] All formatNumber tests PASS (GREEN)
- [ ] Implementation uses locale-aware formatting
- [ ] Function has TypeScript type annotations
- [ ] JSDoc comment includes examples

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.ts`

**Reference Implementation** (from TDD Appendix D):
```typescript
/**
 * Formats a number with thousand separators for display.
 *
 * @param value - The number to format
 * @returns Formatted string with commas (e.g., "1,234,567")
 *
 * @example
 * formatNumber(0) → "0"
 * formatNumber(1000) → "1,000"
 * formatNumber(1234567) → "1,234,567"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
```

---

#### Task 2.1.3: Refactor formatNumber (REFACTOR Phase)

**Objective**: Improve code quality while maintaining passing tests

**TDD Phase**: REFACTOR

**Actions**:
1. Review implementation for clarity
2. Verify JSDoc comment is comprehensive
3. Run tests via `cmd.exe /c "npm test formatNumber.test.ts"` to confirm no regressions

**Success Criteria**:
- [ ] All tests still PASS
- [ ] Code is clean and well-documented
- [ ] No unnecessary complexity

---

### Task 2.2: Implement useScrapGeneration Hook with TDD [0.5 days]

#### Task 2.2.1: Write useScrapGeneration Tests (RED Phase)

**Objective**: Write comprehensive failing tests for scrap generation hook

**TDD Phase**: RED

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts`
2. Import dependencies:
   - `renderHook, act, waitFor` from `@testing-library/react-native`
   - `observable` from `@legendapp/state`
   - Mock `@react-native-async-storage/async-storage`
3. Setup `beforeEach`:
   - `jest.useFakeTimers()`
   - `jest.clearAllMocks()`
   - Mock `AsyncStorage.getItem` to return `null`
4. Setup `afterEach`:
   - `jest.useRealTimers()`
5. Add test: `test('initializes scrap to 0 when no stored value', async () => { ... })`
   - Create petCount$ observable with value 0
   - Render hook with petCount$
   - Expect: `result.current.scrap$.get()` equals 0
6. Add test: `test('loads persisted scrap on initialization', async () => { ... })`
   - Mock `AsyncStorage.getItem` to return `JSON.stringify(1234)`
   - Create petCount$ observable with value 5
   - Render hook
   - Expect: scrap$ equals 1234
7. Add test: `test('generates scrap every 1 second based on pet count', async () => { ... })`
   - Create petCount$ observable with value 3
   - Render hook, capture initial scrap
   - Advance timers by 1000ms
   - Expect: scrap increased by 3
   - Advance another 1000ms
   - Expect: scrap increased by 6 total
8. Add test: `test('adjusts generation rate when pet count changes', async () => { ... })`
   - Create petCount$ observable with value 2
   - Render hook
   - Advance 1 second, verify +2 scrap
   - Change petCount$ to 5
   - Advance 1 second, verify +5 more scrap
9. Add test: `test('handles zero pets correctly', async () => { ... })`
   - Create petCount$ observable with value 0
   - Advance 5 seconds
   - Expect: scrap unchanged
10. Add test: `test('persists scrap to AsyncStorage', async () => { ... })`
    - Create petCount$ with value 1
    - Advance 1 second
    - Expect: `AsyncStorage.setItem` called with 'scrap-total-v1'
11. Add test: `test('cleans up interval on unmount', async () => { ... })`
    - Create petCount$ with value 5
    - Render hook
    - Advance 1 second, verify scrap increased
    - Unmount hook
    - Advance 5 more seconds
    - Verify no errors thrown (interval cleaned up)
12. Add test: `test('handles AsyncStorage read errors gracefully', async () => { ... })`
    - Mock `AsyncStorage.getItem` to reject with error
    - Render hook
    - Expect: scrap defaults to 0 without crashing
13. Run tests via `cmd.exe /c "npm test useScrapGeneration.test.ts"`

**Success Criteria**:
- [ ] 8 test cases written covering all scenarios
- [ ] All tests FAIL with appropriate error messages
- [ ] Tests use fake timers correctly
- [ ] Tests verify persistence behavior
- [ ] Tests verify cleanup behavior

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts`

---

#### Task 2.2.2: Implement useScrapGeneration Hook (GREEN Phase)

**Objective**: Implement minimal code to make all useScrapGeneration tests pass

**TDD Phase**: GREEN

**Actions**:
1. Create file: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts`
2. Import dependencies:
   - `useEffect, useMemo` from React
   - `observable, Observable` from `@legendapp/state`
   - `configureSynced, synced` from `@legendapp/state/sync`
   - `ObservablePersistAsyncStorage` from `@legendapp/state/persist-plugins/async-storage`
   - `AsyncStorage` from `@react-native-async-storage/async-storage`
3. Define constants:
   - `SCRAP_PER_PET_PER_SECOND = 1`
   - `GENERATION_INTERVAL_MS = 1000`
4. Configure persistence plugin (same pattern as usePersistedCounter)
5. Create module-level observable:
   - `scrap$` with persist configuration
   - Storage key: `'scrap-total-v1'`
   - Initial value: 0
   - Debounce: 1000ms
6. Define `UseScrapGenerationReturn` interface:
   - Property: `scrap$: Observable<number>`
7. Implement `useScrapGeneration` function:
   - Parameter: `petCount$: Observable<number>`
   - Return type: `UseScrapGenerationReturn`
8. Add `useEffect` hook:
   - Create `setInterval` with 1000ms interval
   - In interval callback:
     - Wrap in try/catch for error handling
     - Read current pet count: `petCount$.get()`
     - Calculate scrap to add: `currentPetCount * SCRAP_PER_PET_PER_SECOND`
     - Update scrap: `scrap$.set((prev) => prev + scrapToAdd)`
   - On error: log to console.error
   - Return cleanup function: `clearInterval(intervalId)`
   - Dependencies: `[petCount$]`
9. Return `useMemo(() => ({ scrap$ }), [])`
10. Add JSDoc comments
11. Run tests via `cmd.exe /c "npm test useScrapGeneration.test.ts"`

**Success Criteria**:
- [ ] All useScrapGeneration tests PASS (GREEN)
- [ ] Hook implements interval-based generation
- [ ] Hook persists to AsyncStorage with debounce
- [ ] Hook cleans up interval on unmount
- [ ] Hook handles errors gracefully

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts`

**Reference Implementation** (from TDD Appendix D):
```typescript
import { useEffect, useMemo } from 'react';
import { observable, Observable } from '@legendapp/state';
import { configureSynced, synced } from '@legendapp/state/sync';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCRAP_PER_PET_PER_SECOND = 1;
const GENERATION_INTERVAL_MS = 1000;

const persistPlugin = new ObservablePersistAsyncStorage({ AsyncStorage });

const persist = configureSynced(synced, {
  persist: {
    plugin: persistPlugin,
    retrySync: true,
  },
});

interface UseScrapGenerationReturn {
  scrap$: Observable<number>;
}

const scrap$ = observable(
  persist({
    initial: 0,
    persist: {
      name: 'scrap-total-v1',
      debounceSet: 1000,
    },
  })
);

/**
 * Hook for managing passive scrap generation based on AI Pet count.
 * Generates scrap every 1 second while component is mounted.
 * Scrap total persists to AsyncStorage with 1-second debounce.
 *
 * @param petCount$ - Observable containing current AI Pet count
 * @returns Observable scrap total value
 */
export function useScrapGeneration(
  petCount$: Observable<number>
): UseScrapGenerationReturn {
  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        const currentPetCount = petCount$.get();
        const scrapToAdd = currentPetCount * SCRAP_PER_PET_PER_SECOND;
        scrap$.set((prev) => prev + scrapToAdd);
      } catch (error) {
        console.error('Scrap generation error:', error);
      }
    }, GENERATION_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [petCount$]);

  return useMemo(() => ({
    scrap$,
  }), []);
}
```

---

#### Task 2.2.3: Refactor useScrapGeneration (REFACTOR Phase)

**Objective**: Improve code quality while maintaining passing tests

**TDD Phase**: REFACTOR

**Actions**:
1. Review implementation for clarity
2. Verify constants are well-named and documented
3. Verify JSDoc comments are comprehensive
4. Verify error handling is appropriate
5. Run tests via `cmd.exe /c "npm test useScrapGeneration.test.ts"` to confirm no regressions

**Success Criteria**:
- [ ] All tests still PASS
- [ ] Code is clean and well-documented
- [ ] Constants are clearly defined
- [ ] Error handling is comprehensive

---

### Task 2.3: Integrate Scrap Display into ClickerScreen [0.5 days]

#### Task 2.3.1: Verify Integration Tests Still Failing

**Objective**: Confirm component integration tests from Phase 1 are still RED

**TDD Phase**: RED (verification)

**Actions**:
1. Run ClickerScreen tests via `cmd.exe /c "npm test ClickerScreen.test.tsx"`
2. Verify all scrap integration tests FAIL
3. Review error messages to ensure they indicate missing UI integration

**Success Criteria**:
- [ ] All 5 scrap integration tests FAIL
- [ ] Error messages indicate scrap display not found in DOM
- [ ] Existing pet counter tests still PASS

---

#### Task 2.3.2: Implement Scrap Display in ClickerScreen (GREEN Phase)

**Objective**: Integrate scrap display into ClickerScreen to make all tests pass

**TDD Phase**: GREEN

**Actions**:
1. Read file: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
2. Add imports:
   - `import { useScrapGeneration } from '../scrap/useScrapGeneration';`
   - `import { formatNumber } from '../scrap/formatNumber';`
3. In component body, after `usePersistedCounter` call:
   - Add: `const { scrap$ } = useScrapGeneration(count$);`
4. In JSX, between counterContainer and feedButton:
   - Add scrapContainer View
   - Add Memo component wrapping scrap display Text
   - Display: `Scrap: {formatNumber(scrap$.get())}`
   - Add accessibility attributes: `accessibilityRole="text"`, `accessibilityLabel`
   - Add helper Text: "AI Pets collect scrap automatically (no use yet)"
5. Add styles to StyleSheet:
   - `scrapContainer`: marginBottom 40, alignItems center
   - `scrapText`: fontSize 20, fontWeight 600, color #333333, textAlign center, marginBottom 8
   - `helperText`: fontSize 12, color #666666, textAlign center, fontStyle italic
6. Run tests via `cmd.exe /c "npm test ClickerScreen.test.tsx"`

**Success Criteria**:
- [ ] All scrap integration tests PASS (GREEN)
- [ ] All existing pet counter tests still PASS
- [ ] Scrap display is visible in component
- [ ] Helper text is present
- [ ] Number formatting is applied

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`

**Reference Implementation** (from TDD Appendix D):
```typescript
// Add imports
import { useScrapGeneration } from '../scrap/useScrapGeneration';
import { formatNumber } from '../scrap/formatNumber';

// In component
export function ClickerScreen() {
  const { count$, actions } = usePersistedCounter();
  const { scrap$ } = useScrapGeneration(count$);

  return (
    <View style={styles.container}>
      {/* AI Pet Counter */}
      <View style={styles.counterContainer}>
        <Memo>
          {() => (
            <Text
              style={styles.counterText}
              accessibilityRole="text"
              accessibilityLabel={`Singularity Pet Count: ${count$.get()}`}
            >
              Singularity Pet Count: {count$.get()}
            </Text>
          )}
        </Memo>
      </View>

      {/* Scrap Display (NEW) */}
      <View style={styles.scrapContainer}>
        <Memo>
          {() => (
            <Text
              style={styles.scrapText}
              accessibilityRole="text"
              accessibilityLabel={`Scrap collected: ${formatNumber(scrap$.get())}`}
            >
              Scrap: {formatNumber(scrap$.get())}
            </Text>
          )}
        </Memo>
        <Text style={styles.helperText}>
          AI Pets collect scrap automatically (no use yet)
        </Text>
      </View>

      {/* Feed Button */}
      <Pressable
        testID="feed-button"
        style={({ pressed }) => [
          styles.feedButton,
          pressed && styles.feedButtonPressed,
        ]}
        onPress={actions.increment}
        accessibilityRole="button"
        accessibilityLabel="Feed button"
        accessibilityHint="Tap to increase the Singularity Pet count by one"
      >
        <Text style={styles.feedButtonText}>feed</Text>
      </Pressable>
    </View>
  );
}

// Add styles
const styles = StyleSheet.create({
  // ... existing styles ...
  scrapContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  scrapText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
```

---

#### Task 2.3.3: Refactor ClickerScreen Integration (REFACTOR Phase)

**Objective**: Improve UI integration code quality while maintaining passing tests

**TDD Phase**: REFACTOR

**Actions**:
1. Review component structure for clarity
2. Verify styles are consistent with existing design
3. Verify accessibility attributes are comprehensive
4. Run tests via `cmd.exe /c "npm test ClickerScreen.test.tsx"` to confirm no regressions

**Success Criteria**:
- [ ] All tests still PASS
- [ ] UI is clean and consistent
- [ ] Accessibility is comprehensive
- [ ] No code duplication

---

### Task 2.4: Add Accessibility & Helper Text Enhancement [0.25 days]

#### Task 2.4.1: Write Accessibility Tests (RED Phase)

**Objective**: Write tests for enhanced accessibility features

**TDD Phase**: RED

**Actions**:
1. Open file: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`
2. Add test: `test('scrap display has proper accessibility attributes', () => { ... })`
   - Verify `accessibilityRole="text"` is present
   - Verify `accessibilityLabel` includes scrap value
3. Add test: `test('helper text explains scrap collection mechanics', () => { ... })`
   - Verify text "AI Pets collect scrap automatically" is visible
   - Verify text is accessible to screen readers
4. Run tests via `cmd.exe /c "npm test ClickerScreen.test.tsx"`

**Success Criteria**:
- [ ] 2 new accessibility tests added
- [ ] Tests PASS (accessibility already implemented in Task 2.3.2)

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`

---

#### Task 2.4.2: Enhance Accessibility (GREEN Phase)

**Objective**: Ensure all accessibility attributes are comprehensive

**TDD Phase**: GREEN

**Actions**:
1. Verify scrap Text has `accessibilityRole="text"`
2. Verify scrap Text has dynamic `accessibilityLabel` with current value
3. Verify helper Text is readable by screen readers
4. Run tests via `cmd.exe /c "npm test ClickerScreen.test.tsx"`

**Success Criteria**:
- [ ] All accessibility tests PASS
- [ ] Screen readers can announce scrap value
- [ ] Helper text is accessible

**Note**: This may already be complete from Task 2.3.2, verify and adjust if needed

---

#### Task 2.4.3: UX Polish (REFACTOR Phase)

**Objective**: Polish user experience details

**TDD Phase**: REFACTOR

**Actions**:
1. Review text sizes for readability
2. Verify color contrast meets WCAG AA (4.5:1 ratio)
3. Verify helper text placement doesn't clutter UI
4. Run tests via `cmd.exe /c "npm test ClickerScreen.test.tsx"` to confirm no regressions

**Success Criteria**:
- [ ] All tests still PASS
- [ ] Text is readable
- [ ] Colors have sufficient contrast
- [ ] UI is clean and uncluttered

---

## Phase 3: Hardening & Polish [0.5 days]

### Task 3.1: Performance & Reliability Verification [0.25 days]

#### Task 3.1.1: Run Full Test Suite

**Objective**: Verify all tests pass across entire codebase

**Actions**:
1. Run all tests via `cmd.exe /c "npm test"`
2. Verify no test failures
3. Verify no test warnings

**Success Criteria**:
- [ ] All scrap tests PASS
- [ ] All existing pet counter tests PASS
- [ ] No test failures or errors
- [ ] No unexpected warnings

---

#### Task 3.1.2: Add Performance Measurement Tests

**Objective**: Verify performance requirements are met

**TDD Phase**: RED-GREEN-REFACTOR

**Actions**:
1. Open file: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts`
2. Add test: `test('generation calculation completes in under 1ms', async () => { ... })`
   - Use `performance.now()` to measure calculation time
   - Expect: calculation time < 1ms
3. Add test: `test('handles large pet counts efficiently', async () => { ... })`
   - Create petCount$ with value 100000
   - Advance 1 second
   - Verify scrap increased correctly
   - Verify no performance issues
4. Add test: `test('handles large scrap totals efficiently', async () => { ... })`
   - Mock AsyncStorage to return large value (999999999999)
   - Verify formatNumber handles efficiently
5. Run tests via `cmd.exe /c "npm test useScrapGeneration.test.ts"`

**Success Criteria**:
- [ ] 3 new performance tests added
- [ ] All performance tests PASS
- [ ] Generation calculation < 1ms
- [ ] Large values handled correctly

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts`

---

#### Task 3.1.3: Add Reliability Tests

**Objective**: Verify reliability requirements are met

**TDD Phase**: RED-GREEN-REFACTOR

**Actions**:
1. Open file: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts`
2. Add test: `test('no memory leaks over multiple mount/unmount cycles', async () => { ... })`
   - Render and unmount hook 10 times
   - Verify no errors thrown
   - Verify intervals are cleaned up
3. Add test: `test('handles rapid pet count changes without drift', async () => { ... })`
   - Create petCount$ with value 5
   - Advance 1 second, verify +5 scrap
   - Change petCount$ to 10
   - Advance 1 second, verify +10 more scrap
   - Change petCount$ to 3
   - Advance 1 second, verify +3 more scrap
   - Verify total is accurate
4. Add test: `test('continues operating after AsyncStorage write failure', async () => { ... })`
   - Mock AsyncStorage.setItem to reject
   - Generate scrap
   - Verify scrap still increases in memory
   - Verify error is logged
5. Run tests via `cmd.exe /c "npm test useScrapGeneration.test.ts"`

**Success Criteria**:
- [ ] 3 new reliability tests added
- [ ] All reliability tests PASS
- [ ] No memory leaks detected
- [ ] Calculation accuracy maintained during rapid changes
- [ ] Graceful handling of storage failures

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts`

---

#### Task 3.1.4: Manual Testing on Device

**Objective**: Verify behavior on physical/emulated devices

**Actions**:
1. Start development server: `npm start`
2. Open app on iOS simulator/device
3. Verify scrap display is visible
4. Verify scrap increases every second
5. Add pets, verify scrap rate increases
6. Close and reopen app, verify scrap persists
7. Repeat on Android emulator/device

**Success Criteria**:
- [ ] Scrap display visible on iOS
- [ ] Scrap display visible on Android
- [ ] Generation works on both platforms
- [ ] Persistence works on both platforms
- [ ] No visual glitches or performance issues

---

### Task 3.2: Final Coverage Report & Documentation [0.25 days]

#### Task 3.2.1: Generate Coverage Report

**Objective**: Verify test coverage meets >80% target

**Actions**:
1. Run coverage report: `cmd.exe /c "npm test -- --coverage"`
2. Review coverage for scrap module files:
   - `formatNumber.ts`
   - `useScrapGeneration.ts`
   - `ClickerScreen.tsx` (scrap-related code)
3. Identify any uncovered lines
4. If coverage < 80%, add tests for uncovered scenarios
5. Re-run coverage report to verify >80%

**Success Criteria**:
- [ ] Coverage report generated
- [ ] formatNumber.ts: >80% coverage
- [ ] useScrapGeneration.ts: >80% coverage
- [ ] ClickerScreen.tsx: >80% coverage (overall)
- [ ] All critical paths covered

---

#### Task 3.2.2: Add Inline Documentation

**Objective**: Ensure code is well-documented for maintainability

**Actions**:
1. Review `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.ts`
   - Verify JSDoc comment is comprehensive
   - Add examples if missing
2. Review `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts`
   - Verify JSDoc comment explains generation mechanics
   - Document constants (SCRAP_PER_PET_PER_SECOND, GENERATION_INTERVAL_MS)
   - Add inline comments for complex logic
3. Review `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
   - Verify component JSDoc is updated
   - Add inline comments for scrap integration

**Success Criteria**:
- [ ] All public functions have JSDoc comments
- [ ] All constants are documented
- [ ] Complex logic has inline comments
- [ ] Examples are provided in JSDoc

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.ts`
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts`
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`

---

#### Task 3.2.3: Final Verification

**Objective**: Ensure all requirements are met and feature is complete

**Actions**:
1. Run full test suite: `cmd.exe /c "npm test"`
2. Verify all tests PASS
3. Run coverage report: `cmd.exe /c "npm test -- --coverage"`
4. Verify coverage >80%
5. Review checklist:
   - [ ] formatNumber utility implemented with tests
   - [ ] useScrapGeneration hook implemented with tests
   - [ ] ClickerScreen integration complete
   - [ ] All functional requirements met (FR-1 through FR-5)
   - [ ] All non-functional requirements met (NFR-1 through NFR-5)
   - [ ] Accessibility implemented
   - [ ] Performance verified
   - [ ] Reliability verified
   - [ ] Documentation complete

**Success Criteria**:
- [ ] All tests PASS
- [ ] Coverage >80%
- [ ] All requirements met
- [ ] Feature is production-ready

---

## Summary

### Total Tasks: 25
- **Phase 1**: 2 tasks (Foundation & Test Setup)
- **Phase 2**: 14 tasks (TDD Feature Implementation)
- **Phase 3**: 9 tasks (Hardening & Polish)

### Files Created:
1. `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/` (directory)
2. `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.ts`
3. `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.test.ts`
4. `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts`
5. `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts`

### Files Modified:
1. `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
2. `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`

### Key TDD Principles Applied:
- ✅ RED-GREEN-REFACTOR cycle for all implementation
- ✅ Component integration tests written FIRST (Phase 1, Task 1.2)
- ✅ No implementation without failing tests
- ✅ Tests cover all functional requirements (FR-1 through FR-5)
- ✅ Tests cover all non-functional requirements (NFR-1 through NFR-5)
- ✅ Tests verify accessibility, performance, and reliability

### Success Metrics:
- Test coverage: >80% for all scrap module files
- Performance: Generation calculation <1ms, UI update <50ms
- Reliability: No memory leaks, accurate calculations, graceful error handling
- Accessibility: All displays readable by screen readers

---

*Generated from TDD: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/tdd_scrap.md`*

*Generation Date: 2025-11-16*

*Total Estimated Implementation Time: 2.0 days*
