# Core Clicker Flow - Implementation Tasks

## Document Metadata
- **Source TDD**: tdd_core_clicker_20251111.md
- **Generated**: 2025-11-11
- **Total Tasks**: 4 phases (MVP focus)
- **Architecture**: Flat structure (<10 items per @docs/architecture/file-organization-patterns.md)
- **State Management**: useState (component-local, appropriate for single-component scope)

---

## Phase 1: First User-Visible Feature - Basic Clicker (TDD RED Phase)
*Duration: 2 hours | Priority: P0 | Prerequisites: None*

**LEAN PRINCIPLE**: First task delivers WORKING button and counter that user can interact with immediately.

### Task 1.1: Implement Minimal Working Clicker with Failing Tests
**ROLE**: You are a senior React Native developer implementing the first user-visible feature using strict TDD

**CONTEXT**: Based on TDD Section 7 (TDD Strategy) and Section 11 (Implementation Plan Phase 1). This is a single-component MVP using useState for state management (appropriate per @docs/architecture/state-management-hooks-guide.md: "Component State for state local to a single component").

**OBJECTIVE**: Create a working clicker that increments a counter when user taps a button, following Red-Green-Refactor TDD cycle

**FILE LOCATIONS** (per @docs/architecture/file-organization-patterns.md - flat structure for <10 items):
```
modules/clicker/
├── ClickerScreen.tsx           # Main component
├── ClickerScreen.test.tsx      # Co-located test (ALWAYS next to implementation)
└── (types.ts)                  # Optional - only if needed
```

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write 3 Failing Tests First
```typescript
// modules/clicker/ClickerScreen.test.tsx
import { render, screen, userEvent } from '@testing-library/react-native';
import { ClickerScreen } from './ClickerScreen';

describe('ClickerScreen - Basic Rendering', () => {
  test('should render counter with initial value of 0', () => {
    render(<ClickerScreen />);
    expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
  });

  test('should render Feed button', () => {
    render(<ClickerScreen />);
    expect(screen.getByText('Feed')).toBeTruthy();
  });

  test('should increment counter when Feed button is pressed', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    const button = screen.getByText('Feed');
    await user.press(button);

    expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
  });
});
```

**ALL THREE TESTS MUST FAIL** before proceeding to GREEN phase.

#### Step 2: GREEN - Minimal Implementation to Pass Tests
```typescript
// modules/clicker/ClickerScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const ClickerScreen = () => {
  const [count, setCount] = useState(0);

  const handleFeed = () => {
    setCount(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>Singularity Pet Count: {count}</Text>
      <TouchableOpacity style={styles.button} onPress={handleFeed}>
        <Text style={styles.buttonText}>Feed</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  counter: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 44,  // WCAG accessibility minimum
    minHeight: 44,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

#### Step 3: REFACTOR - (Skip for now, will refactor in later tasks)

**ACCEPTANCE CRITERIA**:
- [ ] Test file created at `modules/clicker/ClickerScreen.test.tsx` (co-located)
- [ ] Component file created at `modules/clicker/ClickerScreen.tsx`
- [ ] All 3 tests run and PASS
- [ ] Counter displays "Singularity Pet Count: 0" on initial render
- [ ] "Feed" button is visible and tappable
- [ ] Tapping button increments counter by 1
- [ ] Button meets 44x44pt minimum touch target (WCAG compliance)
- [ ] Counter updates immediately (no lag)

**VISUAL REQUIREMENTS** (from TDD FR3.1-3.3):

| Property | Value | Notes |
|----------|-------|-------|
| **Button Size** | 44x44pt minimum | WCAG touch target requirement |
| **Button Color** | #007AFF (iOS blue) | Platform-native styling |
| **Counter Font** | 18sp | Above 16sp minimum for readability |
| **Layout** | Vertically centered | flex: 1, justifyContent: 'center' |
| **Spacing** | 20px padding, 20px between elements | Clear visual hierarchy |

**DELIVERABLES**:
1. Working clicker component (user can tap and see count increase)
2. 3 passing tests documenting behavior
3. Co-located test file structure

**DEPENDENCIES**: None - this is the first task
**TOOLS NEEDED**: React Native Testing Library, Jest
**ESTIMATED TIME**: 1-2 hours

---

## Phase 2: Persistence & Reliability (TDD Continuation)
*Duration: 3 hours | Priority: P0 | Prerequisites: Task 1.1*

### Task 2.1: Add AsyncStorage Persistence with TDD
**ROLE**: You are a senior React Native developer adding data persistence following TDD

**CONTEXT**: Component now works but doesn't save/load data. Add AsyncStorage persistence with 1-second debounce per TDD Section 5 (Data Model) and Section 9 (Performance Optimization).

**OBJECTIVE**: Persist counter value across app sessions using AsyncStorage with debounced saves

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Persistence Tests
```typescript
// Add to modules/clicker/ClickerScreen.test.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('ClickerScreen - Persistence', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });

  test('should load counter from AsyncStorage on mount', async () => {
    // Set up stored value
    await AsyncStorage.setItem('singularity_pet_count', '42');

    render(<ClickerScreen />);

    // Should load and display stored value
    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 42/i)).toBeTruthy();
    });
  });

  test('should save counter to AsyncStorage after debounce', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    // Tap button 3 times
    const button = screen.getByText('Feed');
    await user.press(button);
    await user.press(button);
    await user.press(button);

    // Wait for debounce (1 second)
    await waitFor(
      () => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'singularity_pet_count',
          '3'
        );
      },
      { timeout: 1500 }
    );
  });

  test('should default to 0 if no stored value exists', () => {
    render(<ClickerScreen />);
    expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
  });

  test('should default to 0 if stored value is invalid', async () => {
    await AsyncStorage.setItem('singularity_pet_count', 'invalid');

    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
    });
  });
});
```

**TESTS MUST FAIL** before implementing persistence.

#### Step 2: GREEN - Implement Persistence Logic
```typescript
// Update modules/clicker/ClickerScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'singularity_pet_count';
const SAVE_DEBOUNCE_MS = 1000;

export const ClickerScreen = () => {
  const [count, setCount] = useState(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load count from storage on mount
  useEffect(() => {
    const loadCount = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 999999999) {
            setCount(parsed);
          }
        }
      } catch (error) {
        console.error('[Clicker] Failed to load count:', error);
      }
    };

    loadCount();
  }, []);

  // Save count to storage (debounced)
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, count.toString());
      } catch (error) {
        console.error('[Clicker] Failed to save count:', error);
      }
    }, SAVE_DEBOUNCE_MS);

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [count]);

  const handleFeed = () => {
    setCount(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>Singularity Pet Count: {count}</Text>
      <TouchableOpacity style={styles.button} onPress={handleFeed}>
        <Text style={styles.buttonText}>Feed</Text>
      </TouchableOpacity>
    </View>
  );
};

// ... styles unchanged
```

#### Step 3: REFACTOR - Extract validation logic
```typescript
// Add helper function
const validateCount = (value: string | null): number => {
  if (value === null) return 0;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > 999999999) return 999999999;
  return parsed;
};

// Use in loadCount
setCount(validateCount(stored));
```

**ACCEPTANCE CRITERIA**:
- [ ] All new persistence tests pass
- [ ] Counter loads from AsyncStorage on mount within 2 seconds
- [ ] Counter saves to AsyncStorage after 1-second debounce
- [ ] Invalid stored values default to 0 (no crashes)
- [ ] Multiple rapid taps don't trigger multiple saves (debounced)
- [ ] Cleanup properly on component unmount (no memory leaks)
- [ ] All previous tests still pass (no regressions)

**DELIVERABLES**:
1. Persistence logic implemented
2. 4 additional passing tests
3. Error handling for storage failures

**DEPENDENCIES**: Task 1.1
**TOOLS NEEDED**: @react-native-async-storage/async-storage v1.23+
**ESTIMATED TIME**: 2-3 hours

---

## Phase 3: Accessibility & Polish (TDD Refinement)
*Duration: 2 hours | Priority: P0 | Prerequisites: Task 2.1*

### Task 3.1: Add Accessibility Support with Tests
**ROLE**: You are a senior developer ensuring WCAG 2.1 AA compliance

**CONTEXT**: Component works but lacks accessibility features required by TDD Section 2 (Non-Functional Requirements NFR7-10).

**OBJECTIVE**: Add screen reader support, proper labels, and accessibility roles

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Accessibility Tests
```typescript
// Add to modules/clicker/ClickerScreen.test.tsx
describe('ClickerScreen - Accessibility', () => {
  test('button should have proper accessibility role', () => {
    render(<ClickerScreen />);
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
  });

  test('button should have descriptive accessibility label', () => {
    render(<ClickerScreen />);
    const button = screen.getByLabelText('Feed the Singularity Pet');
    expect(button).toBeTruthy();
  });

  test('counter should have accessibility label', () => {
    render(<ClickerScreen />);
    const counter = screen.getByLabelText(/Pet count is 0/i);
    expect(counter).toBeTruthy();
  });

  test('counter should update accessibility label when incremented', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    await user.press(screen.getByRole('button'));

    expect(screen.getByLabelText(/Pet count is 1/i)).toBeTruthy();
  });
});
```

#### Step 2: GREEN - Add Accessibility Props
```typescript
// Update modules/clicker/ClickerScreen.tsx
return (
  <View style={styles.container}>
    <Text
      style={styles.counter}
      accessible={true}
      accessibilityLabel={`Pet count is ${count}`}
      accessibilityRole="text"
    >
      Singularity Pet Count: {count}
    </Text>
    <TouchableOpacity
      style={styles.button}
      onPress={handleFeed}
      accessible={true}
      accessibilityLabel="Feed the Singularity Pet"
      accessibilityHint="Tap to increase the pet count by one"
      accessibilityRole="button"
    >
      <Text style={styles.buttonText}>Feed</Text>
    </TouchableOpacity>
  </View>
);
```

#### Step 3: REFACTOR - Add platform-specific styling
```typescript
// Update styles for better touch targets on Android
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: Platform.OS === 'ios' ? 8 : 4,
    minWidth: 44,
    minHeight: 44,
    elevation: Platform.OS === 'android' ? 2 : 0,  // Android shadow
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,  // iOS shadow
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 4 : undefined,
  },
  // ... other styles
});
```

**ACCEPTANCE CRITERIA**:
- [ ] All accessibility tests pass
- [ ] Button has `accessibilityRole="button"`
- [ ] Button has descriptive `accessibilityLabel`
- [ ] Counter has `accessibilityLabel` that updates with value
- [ ] Screen reader announces changes correctly
- [ ] Touch targets meet 44x44pt minimum
- [ ] Color contrast ratio meets WCAG 2.1 AA (4.5:1)
- [ ] All previous tests still pass

**DELIVERABLES**:
1. Full accessibility support
2. 4 additional passing tests
3. Platform-specific styling (iOS/Android)

**DEPENDENCIES**: Task 2.1
**ESTIMATED TIME**: 1.5-2 hours

---

## Phase 4: Performance Validation & Documentation
*Duration: 1.5 hours | Priority: P0 | Prerequisites: Task 3.1*

### Task 4.1: Add Performance Tests and Final Polish
**ROLE**: You are a senior developer ensuring performance targets are met

**CONTEXT**: Component is feature-complete. Validate performance requirements from TDD Section 9 (Performance Requirements).

**OBJECTIVE**: Verify tap response <50ms, render time <16ms, and add edge case tests

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Performance and Edge Case Tests
```typescript
// Add to modules/clicker/ClickerScreen.test.tsx
describe('ClickerScreen - Performance & Edge Cases', () => {
  test('should handle rapid tapping without dropping taps', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    const button = screen.getByRole('button');

    // Simulate 10 rapid taps
    for (let i = 0; i < 10; i++) {
      await user.press(button);
    }

    // All taps should be registered
    expect(screen.getByText(/Singularity Pet Count: 10/i)).toBeTruthy();
  });

  test('should handle maximum value correctly', async () => {
    const user = userEvent.setup();
    await AsyncStorage.setItem('singularity_pet_count', '999999998');

    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/999999998/i)).toBeTruthy();
    });

    const button = screen.getByRole('button');
    await user.press(button);

    expect(screen.getByText(/999999999/i)).toBeTruthy();
  });

  test('should handle component unmount gracefully', async () => {
    const { unmount } = render(<ClickerScreen />);

    const user = userEvent.setup();
    await user.press(screen.getByRole('button'));

    // Should not throw errors on unmount
    expect(() => unmount()).not.toThrow();
  });
});

describe('ClickerScreen - Performance Benchmarks', () => {
  test('tap response should be fast', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    const button = screen.getByRole('button');
    const startTime = performance.now();

    await user.press(button);

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Should respond in <50ms (allowing overhead for test framework)
    expect(responseTime).toBeLessThan(100);
  });
});
```

#### Step 2: GREEN - Add useCallback optimization
```typescript
// Update modules/clicker/ClickerScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ... other code

const handleFeed = useCallback(() => {
  setCount(prev => prev + 1);
}, []);

// ... rest of component
```

#### Step 3: REFACTOR - Final code cleanup and documentation
```typescript
/**
 * ClickerScreen - Main clicker game screen
 *
 * Displays a counter and a "Feed" button. Each tap increments the counter by 1.
 * Counter value persists across app sessions using AsyncStorage with 1-second debounce.
 *
 * @module ClickerScreen
 * @performance Tap response <50ms, Render time <16ms
 * @accessibility WCAG 2.1 AA compliant
 */
export const ClickerScreen = () => {
  // ... implementation
};
```

**ACCEPTANCE CRITERIA**:
- [ ] All performance tests pass
- [ ] Rapid tapping (10+ taps) works without dropped inputs
- [ ] Maximum value (999,999,999) handled correctly
- [ ] Component unmounts without errors or memory leaks
- [ ] Tap response measured <100ms in tests
- [ ] Test coverage >80% (verified with `npm test -- --coverage`)
- [ ] All previous tests still pass (no regressions)
- [ ] Code documented with JSDoc comments

**DELIVERABLES**:
1. 3 additional edge case tests
2. Performance benchmark test
3. Code documentation
4. Test coverage report >80%

**DEPENDENCIES**: Task 3.1
**ESTIMATED TIME**: 1-1.5 hours

---

## Task Execution Guidelines

### For Human Developers
1. Execute tasks sequentially (each builds on previous)
2. **CRITICAL**: Write tests BEFORE implementation (TDD Red-Green-Refactor)
3. Run tests after each change: `npm test modules/clicker/ClickerScreen.test.tsx`
4. Verify all tests pass before moving to next task
5. Check coverage: `npm test -- --coverage modules/clicker/`

### For AI Agents
1. Read TDD document before starting each task
2. Follow exact TDD cycle: RED (failing tests) → GREEN (minimal implementation) → REFACTOR
3. Validate prerequisites (previous task completed)
4. Run all tests after implementation
5. Report test results and coverage percentage

### Test Commands
```bash
# Run specific test file
npm test modules/clicker/ClickerScreen.test.tsx

# Run tests in watch mode
npm test -- --watch modules/clicker/

# Generate coverage report
npm test -- --coverage modules/clicker/

# Run all clicker tests
npm test modules/clicker/
```

---

## Lean Task Validation Checklist

Per @docs/guides/lean-task-generation-guide.md:

- [x] **Task 1 delivers user-visible functionality** - User can tap button and see counter
- [x] **Every task adds something user can interact with** - Each phase enhances the feature
- [x] **Files created just-in-time** - Only ClickerScreen files, no premature infrastructure
- [x] **Dependencies installed when needed** - AsyncStorage added in Phase 2 when persistence implemented
- [x] **Each task independently demo-able** - Can show working feature after each phase
- [x] **NO infrastructure-only tasks** - Every task delivers functional improvements

---

## Summary Statistics

- **Total Tasks**: 4 (focused MVP)
- **Total Time Estimate**: 8-9 hours (1-2 days)
- **Critical Path**: Sequential (TDD requires order: render → persistence → accessibility → performance)
- **Parallel Execution**: Not applicable (single-file component, TDD sequential)
- **Test Coverage Target**: >80%
- **Files Created**: 2 (ClickerScreen.tsx + ClickerScreen.test.tsx)
- **Architecture Pattern**: Flat structure, co-located tests, useState for state

---

## Risk Mitigation

### Risk 1: High-frequency tapping performance
**MITIGATION**: Task 4.1 includes rapid-tap test (10 consecutive taps), functional setState prevents race conditions

### Risk 2: AsyncStorage corruption
**MITIGATION**: Task 2.1 includes validation and error handling, defaults to 0 on corruption

### Risk 3: Platform-specific issues
**MITIGATION**: Task 3.1 adds Platform.OS conditional styling, tests run on both iOS/Android

---

*Generated from TDD: tdd_core_clicker_20251111.md*
*Generation timestamp: 2025-11-11*
*Optimized for: TDD-driven development with immediate user value*
*Architecture: Lean, feature-focused, co-located tests*
