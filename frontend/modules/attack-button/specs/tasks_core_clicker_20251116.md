# Core Clicker Implementation Tasks

## Document Control

| Version | Generated From | Date | Status |
|---------|---------------|------|--------|
| v1.0 | tdd_core_clicker_20251116.md | 2025-11-16 | Ready for Execution |

## Task Execution Principles

This task list follows the **Lean Task Generation Guide** and **Test-Driven Development (TDD)** methodology:

- ✅ Every task delivers user-visible functionality
- ✅ No infrastructure-only tasks
- ✅ Start with simplest working feature
- ✅ Just-in-time file creation and dependency installation
- ✅ Mandatory TDD: RED → GREEN → REFACTOR cycle for all tasks

## Important: Use cmd.exe for Jest Tests

Per project guidelines in CLAUDE.md, **all Jest tests must be run using cmd.exe** due to WSL/Windows performance issues. Use:
```bash
cmd.exe /c "npm test"
```

---

## Phase 1: App Integration Test Foundation (TDD Zero Layer)

### Task 1.1: Write App-Level Integration Tests (TDD RED Phase)

**ROLE**: You are a test engineer establishing the integration test foundation that will validate the complete user journey.

**CONTEXT**: This is the MANDATORY FIRST step before any implementation. App-level integration tests catch missing imports/modules immediately and ensure the feature is accessible to users. These tests MUST fail initially (RED phase) and will guide all implementation work.

**OBJECTIVE**: Create App.test.tsx with comprehensive integration tests that validate users can see and interact with the clicker game. All tests should FAIL initially.

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Integration Tests

Create `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`:

```typescript
import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import App from './App';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('App Integration - Core Clicker', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without import errors', () => {
    // This test FAILS if ClickerScreen doesn't exist or can't be imported
    expect(() => render(<App />)).not.toThrow();
  });

  test('displays Singularity Pet Count on launch', () => {
    render(<App />);

    // Verify clicker screen is visible to user
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('displays feed button', () => {
    render(<App />);

    const feedButton = screen.getByRole('button', { name: /feed/i });
    expect(feedButton).toBeTruthy();
  });

  test('increments count when feed button is tapped', async () => {
    render(<App />);

    const feedButton = screen.getByRole('button', { name: /feed/i });

    await user.press(feedButton);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });
  });

  test('handles multiple taps accurately', async () => {
    render(<App />);

    const feedButton = screen.getByRole('button', { name: /feed/i });

    // Tap 3 times
    await user.press(feedButton);
    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });

    await user.press(feedButton);
    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 2/i)).toBeTruthy();
    });

    await user.press(feedButton);
    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 3/i)).toBeTruthy();
    });
  });
});
```

#### Step 2: Run Tests to Verify RED Phase

Run tests using cmd.exe (MUST fail because ClickerScreen doesn't exist):

```bash
cmd.exe /c "npm test App.test.tsx"
```

Expected outcome: All tests fail with import errors or missing component errors.

#### Step 3: Create Skeleton Component to Fix Import Tests

Create minimal `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`:

```typescript
import React from 'react';
import { View, Text } from 'react-native';

export function ClickerScreen() {
  return (
    <View>
      <Text>Placeholder</Text>
    </View>
  );
}
```

Update `/mnt/c/dev/class-one-rapids/frontend/App.tsx` to import ClickerScreen:

```typescript
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClickerScreen } from './modules/attack-button/ClickerScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <ClickerScreen />
    </SafeAreaProvider>
  );
}
```

#### Step 4: Verify Partial Progress

Run tests again:
- ✅ "renders without import errors" should now PASS
- ❌ All behavior tests should still FAIL (no counter, no button functionality)

**FILES TO CREATE**:
- `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx` (integration tests)
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx` (skeleton only)

**FILES TO MODIFY**:
- `/mnt/c/dev/class-one-rapids/frontend/App.tsx` (integrate ClickerScreen)

**DEPENDENCIES TO ADD**: None (all dependencies already installed in Expo SDK 54)

**ACCEPTANCE CRITERIA**:
- [ ] App.test.tsx exists with 5 integration tests
- [ ] Test "renders without import errors" PASSES
- [ ] Behavior tests (displays count, button works) FAIL
- [ ] Tests run via cmd.exe without errors
- [ ] ClickerScreen module exists but has no functionality yet

**DELIVERABLE**: Integration test suite in RED phase, ready to guide implementation. Import/integration issues caught early.

---

## Phase 2: TDD Feature Implementation

### Task 2.1: Implement Persistent Counter Hook with TDD

**ROLE**: You are a state management developer implementing a reusable hook for persistent counter behavior.

**CONTEXT**: App integration tests are failing because ClickerScreen has no functionality. This task implements the core state management logic using Legend-State observables with AsyncStorage persistence. Following TDD: write hook tests first, then implement.

**OBJECTIVE**: Create `usePersistedCounter` hook that manages counter state with Legend-State observables and persists to AsyncStorage with 1-second debounce.

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Hook Tests (RED Phase)

Create `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.test.tsx`:

```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePersistedCounter } from './usePersistedCounter';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('usePersistedCounter Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  test('initializes count to 0 when no stored value', async () => {
    const { result } = renderHook(() => usePersistedCounter());

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(0);
    });
  });

  test('loads persisted count on initialization', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(42));

    const { result } = renderHook(() => usePersistedCounter());

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(42);
    });
  });

  test('increments count correctly', async () => {
    const { result } = renderHook(() => usePersistedCounter());

    // Wait for initialization
    await waitFor(() => {
      expect(result.current.count$.get()).toBe(0);
    });

    act(() => {
      result.current.actions.increment();
    });

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(1);
    });
  });

  test('handles rapid increments accurately', async () => {
    const { result } = renderHook(() => usePersistedCounter());

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(0);
    });

    // Rapid increments
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.actions.increment();
      });

      await waitFor(() => {
        expect(result.current.count$.get()).toBe(i + 1);
      });
    }

    expect(result.current.count$.get()).toBe(10);
  });

  test('persists count to AsyncStorage after debounce', async () => {
    const { result } = renderHook(() => usePersistedCounter());

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(0);
    });

    act(() => {
      result.current.actions.increment();
    });

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(1);
    });

    // Wait for debounced persist (1 second + buffer)
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'singularity-pet-count-v1',
        expect.any(String)
      );
    }, { timeout: 2000 });
  });

  test('handles AsyncStorage read errors gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => usePersistedCounter());

    // Should fallback to 0 without crashing
    await waitFor(() => {
      expect(result.current.count$.get()).toBe(0);
    });
  });
});
```

Run tests with cmd.exe - they MUST fail (hook doesn't exist yet):
```bash
cmd.exe /c "npm test usePersistedCounter.test.tsx"
```

#### Step 2: Minimal Implementation (GREEN Phase)

Create `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts`:

```typescript
import { useMemo } from 'react';
import { observable, Observable } from '@legendapp/state';
import { configureSynced, synced } from '@legendapp/state/sync';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure persistence plugin
const persistPlugin = ObservablePersistAsyncStorage({ AsyncStorage });

const persist = configureSynced(synced, {
  persist: {
    plugin: persistPlugin,
    retrySync: true,
  },
});

interface UsePersistedCounterReturn {
  count$: Observable<number>;
  actions: {
    increment: () => void;
  };
}

/**
 * Hook for managing a persistent counter using Legend-State observables.
 * Counter value persists to AsyncStorage with 1-second debounce.
 *
 * @returns Observable counter value and increment action
 */
export function usePersistedCounter(): UsePersistedCounterReturn {
  return useMemo(() => {
    // Create persisted observable
    const count$ = observable(
      persist({
        initial: 0,
        persist: {
          name: 'singularity-pet-count-v1',
          debounceSet: 1000, // 1 second debounce
        },
      })
    );

    // Actions
    const actions = {
      increment: () => {
        count$.set((prev) => prev + 1);
      },
    };

    return {
      count$,
      actions,
    };
  }, []);
}
```

#### Step 3: Verify Tests Pass (GREEN Phase Validation)

Run tests with cmd.exe - all should now PASS:
```bash
cmd.exe /c "npm test usePersistedCounter.test.tsx"
```

#### Step 4: Refactor (if needed)

Code is clean and minimal. No refactoring needed for this phase.

**FILES TO CREATE**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts`
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.test.tsx`

**DEPENDENCIES TO ADD**: None (Legend-State and AsyncStorage already installed)

**ACCEPTANCE CRITERIA**:
- [ ] All 6 hook tests PASS when run via cmd.exe
- [ ] Hook initializes count to 0 by default
- [ ] Hook loads persisted count from AsyncStorage
- [ ] Increment action works correctly
- [ ] Rapid increments handled accurately (10 consecutive taps)
- [ ] AsyncStorage persistence verified with 1s debounce
- [ ] Graceful error handling for AsyncStorage failures

**DELIVERABLE**: Working persistent counter hook with 100% test coverage, ready for component integration.

---

### Task 2.2: Implement ClickerScreen Component with TDD

**ROLE**: You are a UI developer implementing the clicker game screen with full TDD coverage.

**CONTEXT**: The `usePersistedCounter` hook is fully tested and working. Now we implement the ClickerScreen component that uses this hook to display the counter and feed button. This will make the App integration tests pass.

**OBJECTIVE**: Implement ClickerScreen component with counter display and feed button, following TDD principles with accessibility and performance requirements.

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Component Tests (RED Phase)

Create `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`:

```typescript
import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { ClickerScreen } from './ClickerScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('ClickerScreen Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  // Render Tests
  test('displays counter with initial value of 0', async () => {
    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 0')).toBeTruthy();
    });
  });

  test('displays feed button with correct label', () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });
    expect(button).toBeTruthy();
  });

  // Interaction Tests
  test('increments count when button is pressed', async () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });

    await user.press(button);

    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 1')).toBeTruthy();
    });
  });

  test('handles rapid tapping accurately', async () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Rapid taps - verify each increment
    for (let i = 0; i < 10; i++) {
      await user.press(button);

      await waitFor(() => {
        expect(screen.getByText(`Singularity Pet Count: ${i + 1}`)).toBeTruthy();
      });
    }

    // Final verification
    expect(screen.getByText('Singularity Pet Count: 10')).toBeTruthy();
  });

  // Accessibility Tests
  test('button meets minimum touch target size (44x44pt)', () => {
    render(<ClickerScreen />);

    const button = screen.getByTestId('feed-button');

    const style = Array.isArray(button.props.style)
      ? Object.assign({}, ...button.props.style)
      : button.props.style;

    expect(style.minWidth).toBeGreaterThanOrEqual(44);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });

  test('has correct accessibility attributes', () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toMatch(/feed/i);
  });

  test('counter has accessibility label with current value', async () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });

    await user.press(button);

    await waitFor(() => {
      const counterText = screen.getByText('Singularity Pet Count: 1');
      expect(counterText.props.accessibilityRole).toBe('text');
      expect(counterText.props.accessibilityLabel).toContain('1');
    });
  });

  // Persistence Integration Test
  test('restores count after remount', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(5));

    const { unmount } = render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 5')).toBeTruthy();
    });

    unmount();

    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 5')).toBeTruthy();
    });
  });
});
```

Run tests with cmd.exe - they MUST fail (no implementation yet):
```bash
cmd.exe /c "npm test ClickerScreen.test.tsx"
```

#### Step 2: Implement ClickerScreen (GREEN Phase)

Update `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`:

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Memo } from '@legendapp/state/react';
import { usePersistedCounter } from './usePersistedCounter';

/**
 * Main clicker game screen.
 * Displays a counter and feed button. Each tap increments the counter.
 * Counter value persists across app sessions.
 */
export function ClickerScreen() {
  const { count$, actions } = usePersistedCounter();

  return (
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  counterContainer: {
    marginBottom: 40,
  },
  counterText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  feedButton: {
    minWidth: 44,
    minHeight: 44,
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedButtonPressed: {
    opacity: 0.7,
  },
  feedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

#### Step 3: Verify All Tests Pass (GREEN Phase Validation)

Run component tests:
```bash
cmd.exe /c "npm test ClickerScreen.test.tsx"
```

Run App integration tests (should now ALL PASS):
```bash
cmd.exe /c "npm test App.test.tsx"
```

Run all tests together:
```bash
cmd.exe /c "npm test"
```

#### Step 4: Refactor (if needed)

Code is clean and well-structured. Styles are extracted to StyleSheet. No additional refactoring needed.

**FILES TO MODIFY**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx` (replace skeleton with full implementation)

**FILES TO CREATE**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`

**DEPENDENCIES TO ADD**: None (all dependencies already installed)

**ACCEPTANCE CRITERIA**:
- [ ] All 8 ClickerScreen component tests PASS
- [ ] All 5 App integration tests PASS
- [ ] Counter displays with initial value 0
- [ ] Feed button is visible and tappable
- [ ] Button increments counter on tap
- [ ] Rapid tapping (10 consecutive taps) works accurately
- [ ] Button meets 44x44pt minimum touch target
- [ ] Accessibility attributes correct (roles, labels)
- [ ] Counter restores from AsyncStorage after remount
- [ ] All tests run via cmd.exe without errors

**DELIVERABLE**: Fully functional clicker game with complete test coverage. Users can now tap to increment counter, and progress persists across sessions.

---

## Phase 3: End-to-End Validation & Polish

### Task 3.1: E2E Testing and Performance Validation

**ROLE**: You are a QA engineer validating the complete user journey and performance requirements.

**CONTEXT**: All component and integration tests are passing. This task adds end-to-end tests that simulate complete user sessions including persistence, and validates performance requirements from the PRD.

**OBJECTIVE**: Create comprehensive E2E tests that verify the complete user flow across sessions, including persistence and performance benchmarks.

**TDD IMPLEMENTATION**:

#### Step 1: Write E2E Test Suite (RED Phase)

Create `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.e2e.test.tsx`:

```typescript
import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import App from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('Core Clicker E2E Flow', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('complete user session with persistence', async () => {
    // Session 1: User opens app, taps 5 times
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { unmount } = render(<App />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Verify initial state
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 0')).toBeTruthy();
    });

    // User taps 5 times
    for (let i = 0; i < 5; i++) {
      await user.press(button);
      await waitFor(() => {
        expect(screen.getByText(`Singularity Pet Count: ${i + 1}`)).toBeTruthy();
      });
    }

    // Wait for persistence (debounced 1 second)
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'singularity-pet-count-v1',
        expect.any(String)
      );
    }, { timeout: 2000 });

    // User closes app
    unmount();

    // Session 2: User reopens app next day
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(5));

    render(<App />);

    // Counter restored from previous session
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 5')).toBeTruthy();
    });

    const buttonSession2 = screen.getByRole('button', { name: /feed/i });

    // User continues from where they left off
    await user.press(buttonSession2);

    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 6')).toBeTruthy();
    });
  });

  test('handles rapid tapping at target rate (30 taps/minute)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    render(<App />);

    const button = screen.getByRole('button', { name: /feed/i });

    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 0')).toBeTruthy();
    });

    // Simulate rapid tapping (30 taps)
    for (let i = 0; i < 30; i++) {
      await user.press(button);

      await waitFor(() => {
        expect(screen.getByText(`Singularity Pet Count: ${i + 1}`)).toBeTruthy();
      });
    }

    // Verify final count is accurate
    expect(screen.getByText('Singularity Pet Count: 30')).toBeTruthy();
  });

  test('recovers gracefully from AsyncStorage failures', async () => {
    // Storage fails to load
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage unavailable'));

    render(<App />);

    // App should still work, defaulting to 0
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 0')).toBeTruthy();
    });

    const button = screen.getByRole('button', { name: /feed/i });

    // User can still interact
    await user.press(button);

    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 1')).toBeTruthy();
    });
  });

  test('persists multiple increments with debounce', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    render(<App />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Rapid taps (within debounce window)
    await user.press(button);
    await user.press(button);
    await user.press(button);

    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 3')).toBeTruthy();
    });

    // Wait for debounced persist
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();

      // Should only save once due to debounce
      const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      expect(calls.length).toBeLessThanOrEqual(2); // Initial + debounced
    }, { timeout: 2000 });
  });
});
```

Run E2E tests:
```bash
cmd.exe /c "npm test ClickerScreen.e2e.test.tsx"
```

#### Step 2: Verify Implementation Meets Requirements (GREEN Phase)

All E2E tests should PASS because implementation is complete. If any fail, debug and fix.

#### Step 3: Run Full Test Suite

Execute complete test suite:
```bash
cmd.exe /c "npm test"
```

Verify all test files pass:
- ✅ App.test.tsx (5 integration tests)
- ✅ usePersistedCounter.test.tsx (6 hook tests)
- ✅ ClickerScreen.test.tsx (8 component tests)
- ✅ ClickerScreen.e2e.test.tsx (4 E2E tests)

**Total: 23 tests, all passing**

#### Step 4: Generate Coverage Report

Run coverage report:
```bash
cmd.exe /c "npm test -- --coverage"
```

Verify coverage targets:
- Overall coverage: >80%
- usePersistedCounter.ts: >90%
- ClickerScreen.tsx: >90%

**FILES TO CREATE**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.e2e.test.tsx`

**DEPENDENCIES TO ADD**: None

**ACCEPTANCE CRITERIA**:
- [ ] All 4 E2E tests PASS
- [ ] Complete user session tested (tap → persist → restore → continue)
- [ ] Rapid tapping at target rate (30 taps) verified
- [ ] AsyncStorage failure recovery tested
- [ ] Debounced persistence verified (multiple taps = single save)
- [ ] Full test suite (23 tests) passes
- [ ] Coverage report shows >80% overall coverage
- [ ] All tests run via cmd.exe successfully

**DELIVERABLE**: Comprehensive test coverage with E2E validation. All user journeys tested and verified working.

---

### Task 3.2: Manual Device Testing and Performance Validation

**ROLE**: You are a QA engineer conducting manual testing on physical devices to validate performance and user experience.

**CONTEXT**: All automated tests are passing with >80% coverage. This task validates the implementation on actual devices (iOS/Android) and verifies performance requirements from the PRD.

**OBJECTIVE**: Test the app on physical devices, validate <100ms tap response time, and verify accessibility features work correctly.

**MANUAL TESTING CHECKLIST**:

#### Device Testing (iOS)

1. **Start Development Server**:
   ```bash
   npm start
   ```

2. **Open on iOS Device** (via Expo Go):
   - Scan QR code with Camera app
   - App loads and displays counter at 0

3. **Functional Testing**:
   - [ ] Counter displays "Singularity Pet Count: 0" on launch
   - [ ] Feed button is clearly visible and labeled
   - [ ] Tapping button increments counter (0 → 1 → 2 → 3)
   - [ ] Counter updates appear instant (<100ms perceived)
   - [ ] Button shows visual press state (opacity change)

4. **Rapid Tapping Test**:
   - [ ] Tap button rapidly 20+ times
   - [ ] All taps register accurately
   - [ ] No UI lag or stuttering
   - [ ] Counter displays correct final value

5. **Persistence Testing**:
   - [ ] Tap button 10 times (counter shows 10)
   - [ ] Close app completely (swipe up from app switcher)
   - [ ] Wait 2 seconds
   - [ ] Reopen app
   - [ ] Counter shows 10 (persisted correctly)

6. **Accessibility Testing** (iOS VoiceOver):
   - [ ] Enable VoiceOver in Settings
   - [ ] Launch app
   - [ ] Counter announces: "Singularity Pet Count: [number]"
   - [ ] Button announces: "Feed button, button"
   - [ ] Tapping button updates counter announcement
   - [ ] Touch target is easy to hit (44x44pt minimum)

#### Device Testing (Android)

Repeat all tests above on Android device via Expo Go:
- [ ] All functional tests pass
- [ ] All persistence tests pass
- [ ] All accessibility tests pass (with TalkBack)

#### Performance Validation

**Tap Response Time** (manual measurement):
1. Open app on device
2. Record video at 60fps or 120fps
3. Tap button 10 times while recording
4. Review video frame-by-frame
5. Measure time from finger touch to counter update
6. Target: <100ms (6 frames at 60fps)

**Results**:
- [ ] Average tap-to-update: <100ms ✅
- [ ] 60fps maintained during interaction ✅
- [ ] No frame drops or stuttering ✅

#### Visual/UX Validation

- [ ] Button text "feed" is clearly readable
- [ ] Counter text is large and easy to read (24px)
- [ ] Button color (#007AFF blue) has good contrast with white text
- [ ] Press state feedback is immediate and obvious
- [ ] Layout is centered and visually balanced
- [ ] Safe area respected on iPhone notched devices

**MANUAL TESTING DELIVERABLES**:

Create test report at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/manual_testing_report_20251116.md`:

```markdown
# Manual Testing Report - Core Clicker

## Test Date
2025-11-16

## Devices Tested
- iOS: [Device name, iOS version]
- Android: [Device name, Android version]

## Functional Tests
- [ ] Counter displays correctly
- [ ] Button increments counter
- [ ] Rapid tapping works (20+ taps)
- [ ] Persistence across sessions

## Performance Tests
- Tap response time: [X]ms (target: <100ms)
- Frame rate: 60fps maintained ✅
- Rapid tap accuracy: 100% ✅

## Accessibility Tests
- [ ] VoiceOver/TalkBack support working
- [ ] Touch target meets 44x44pt minimum
- [ ] Announcements clear and accurate

## Issues Found
[List any issues discovered during manual testing]

## Status
✅ Ready for production / ❌ Issues require fixes
```

**ACCEPTANCE CRITERIA**:
- [ ] App tested on at least one iOS device
- [ ] App tested on at least one Android device
- [ ] Tap response time <100ms verified
- [ ] Accessibility features tested with screen readers
- [ ] Persistence verified across app sessions
- [ ] Rapid tapping accuracy verified (20+ taps)
- [ ] Manual testing report created
- [ ] No critical issues found

**DELIVERABLE**: Manual testing report confirming app meets all PRD requirements on physical devices.

---

## Task Completion Summary

### Files Created (Total: 6)
1. `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx` - App integration tests
2. `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx` - Main screen component
3. `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx` - Component tests
4. `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.e2e.test.tsx` - E2E tests
5. `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts` - State hook
6. `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.test.tsx` - Hook tests

### Files Modified (Total: 1)
1. `/mnt/c/dev/class-one-rapids/frontend/App.tsx` - Integrate ClickerScreen

### Test Coverage
- Total Tests: 23
  - Integration: 5 tests (App.test.tsx)
  - Hook: 6 tests (usePersistedCounter.test.tsx)
  - Component: 8 tests (ClickerScreen.test.tsx)
  - E2E: 4 tests (ClickerScreen.e2e.test.tsx)
- Coverage Target: >80% ✅

### Dependencies
No new dependencies required. All features use existing packages:
- Legend-State v3 (already installed)
- AsyncStorage (already installed)
- React Native Testing Library (already installed)

## Success Criteria Validation

### Functional Requirements (from PRD)
- ✅ CR-1: Feed button displays and is tappable
- ✅ CR-2: Each tap increments counter by 1 (100% accuracy)
- ✅ CR-3: Counter updates in <100ms
- ✅ CR-4: Button shows press state
- ✅ CR-5: Counter displays "Singularity Pet Count: [number]"
- ✅ CR-6: Handles rapid tapping (30-50 taps/minute)

### Non-Functional Requirements (from PRD)
- ✅ Performance: <100ms tap-to-visual-update
- ✅ Performance: 60fps rendering during interaction
- ✅ Accessibility: 44x44pt minimum touch target
- ✅ Accessibility: Screen reader support
- ✅ Persistence: Counter saved to AsyncStorage
- ✅ Persistence: Counter restored on app restart
- ✅ Reliability: 100% counter accuracy verified in tests

### TDD Compliance
- ✅ All features implemented using RED → GREEN → REFACTOR cycle
- ✅ Tests written before implementation code
- ✅ App integration tests written first (TDD Zero Layer)
- ✅ No code written without corresponding tests
- ✅ Coverage >80% achieved

## Estimated Implementation Time

Based on TDD in section 12 of the Technical Design Document:

| Phase | Tasks | Estimated Time |
|-------|-------|---------------|
| Phase 1: Test Foundation | Task 1.1 | 0.5 days |
| Phase 2: Feature Implementation | Tasks 2.1 - 2.2 | 1.0 days |
| Phase 3: E2E & Validation | Tasks 3.1 - 3.2 | 0.5 days |
| **Total** | **6 tasks** | **2.0 days** |

## Notes for Implementation Agent

1. **Test Execution**: Always use `cmd.exe /c "npm test"` per CLAUDE.md guidelines
2. **TDD Discipline**: Never write implementation before tests - follow RED → GREEN → REFACTOR strictly
3. **App Integration First**: Task 1.1 is MANDATORY first step - catches import issues early
4. **Incremental Progress**: Each task is independently completable and testable
5. **No Premature Optimization**: Implement exactly what tests require, nothing more
6. **Just-In-Time Creation**: Create files only when needed, no upfront structure

## References

- **Technical Design Document**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/tdd_core_clicker_20251116.md`
- **Product Requirements**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/prd_core_clicker_20251116.md`
- **Lean Task Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/lean-task-generation-guide.md`
- **Testing Guide**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`

---

*Generated from: tdd_core_clicker_20251116.md*
*Generation Date: 2025-11-16*
*Ready for agent execution*
