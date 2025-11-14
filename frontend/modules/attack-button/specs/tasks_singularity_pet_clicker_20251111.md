# Singularity Pet Clicker - Implementation Tasks

## Document Metadata

- **Source TDD**: `tdd_singularity_pet_clicker_20251111.md`
- **Generated**: 2025-11-11
- **Total Tasks**: 15 tasks across 4 phases
- **Estimated Duration**: 10 days (2 weeks)
- **Architecture Reference**: Feature-based organization per @docs/architecture/organizing_expo_apps_by_feature_20250921_113000.md

---

## Phase 1: TDD Foundation - Hook Implementation (Days 1-2)

_Duration: 2 days | Priority: P0 | Prerequisites: None_

**LEAN PRINCIPLE**: First task delivers working counter behavior that can be tested immediately. NO infrastructure-only setup.

---

### Task 1.1: [RED] Write Failing Tests for usePersistedCounter Hook

**ROLE**: You are a senior React Native developer writing tests BEFORE implementation (TDD Red phase)

**CONTEXT**: Per TDD Section 7, we need a behavior-based hook that provides persistent counter functionality. Following @docs/architecture/state-management-hooks-guide.md, we name hooks after BEHAVIOR (usePersistedCounter) not entity (usePet).

**OBJECTIVE**: Write comprehensive failing tests for `usePersistedCounter` hook covering all requirements from TDD Section 7, Phase 1

**FILE LOCATIONS**:
```
modules/attack-button/
├── hooks/
│   ├── usePersistedCounter.ts          # Implementation (create in Task 1.2)
│   └── usePersistedCounter.test.tsx    # THIS TASK - Create test file
├── stores/
│   └── counter.store.ts                # Store (create in Task 1.2)
└── types.ts                             # Types (create in Task 1.2)
```

**STEP-BY-STEP INSTRUCTIONS**:

1. **Create test file**: `modules/attack-button/hooks/usePersistedCounter.test.tsx`

2. **Write Test 1 - Default Initialization**:
```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native'
import { usePersistedCounter } from './usePersistedCounter'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage')

describe('usePersistedCounter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.getItem.mockResolvedValue(null)
  })

  test('initializes with default value of 0', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    expect(result.current.count$.get()).toBe(0)
  })
})
```

3. **Write Test 2 - Custom Initial Value**:
```typescript
  test('initializes with custom initial value', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key', 10)
    )

    expect(result.current.count$.get()).toBe(10)
  })
```

4. **Write Test 3 - Increment Behavior**:
```typescript
  test('increment increases count by 1', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.increment()
    })

    expect(result.current.count$.get()).toBe(1)
  })
```

5. **Write Test 4 - Multiple Increments**:
```typescript
  test('multiple increments accumulate correctly', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.increment()
      result.current.actions.increment()
      result.current.actions.increment()
    })

    expect(result.current.count$.get()).toBe(3)
  })
```

6. **Write Test 5 - Reset Behavior**:
```typescript
  test('reset returns count to initial value', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key', 10)
    )

    act(() => {
      result.current.actions.increment()
      result.current.actions.increment()
      result.current.actions.reset()
    })

    expect(result.current.count$.get()).toBe(10)
  })
```

7. **Write Test 6 - Set Specific Value**:
```typescript
  test('set changes count to specific value', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.set(42)
    })

    expect(result.current.count$.get()).toBe(42)
  })
```

8. **Write Test 7 - Persistence (Save)**:
```typescript
  test('saves count to AsyncStorage on increment', async () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.increment()
    })

    // Wait for debounced save (500ms + buffer)
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        expect.any(String)
      )
    }, { timeout: 1000 })
  })
```

9. **Write Test 8 - Persistence (Load)**:
```typescript
  test('loads saved count on initialization', async () => {
    // Mock AsyncStorage to return saved value
    AsyncStorage.getItem.mockResolvedValueOnce('42')

    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(42)
    })
  })
```

10. **Write Test 9 - Validate Negative**:
```typescript
  test('prevents count from going negative', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.set(-10)
    })

    expect(result.current.count$.get()).toBe(0)
  })
```

11. **Write Test 10 - Validate MAX_SAFE_INTEGER**:
```typescript
  test('prevents count from exceeding MAX_SAFE_INTEGER', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.set(Number.MAX_SAFE_INTEGER + 1000)
    })

    expect(result.current.count$.get()).toBe(Number.MAX_SAFE_INTEGER)
  })
```

12. **Write Test 11 - Validate NaN/Infinity**:
```typescript
  test('handles invalid numbers gracefully', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.set(NaN)
    })

    expect(result.current.count$.get()).toBe(0)

    act(() => {
      result.current.actions.set(Infinity)
    })

    expect(result.current.count$.get()).toBe(0)
  })
```

13. **Run tests to verify they FAIL**:
```bash
npm test -- usePersistedCounter.test.tsx
```

**ACCEPTANCE CRITERIA**:
- [x] Test file created at correct location (co-located with implementation)
- [x] All 11 tests written covering hook requirements
- [x] Tests use React Native Testing Library patterns
- [x] AsyncStorage properly mocked
- [x] Tests use `act()` for state updates
- [x] Tests use `waitFor()` for async operations
- [x] All tests FAIL when run (RED phase complete)

**VALIDATION COMMANDS**:
```bash
# Tests should fail with "Cannot find module './usePersistedCounter'"
npm test -- usePersistedCounter.test.tsx

# Count failing tests
npm test -- usePersistedCounter.test.tsx 2>&1 | grep -c "FAIL"
# Should output: 11
```

**DEPENDENCIES**: None (first task)
**DELIVERABLES**:
- `modules/attack-button/hooks/usePersistedCounter.test.tsx` with 11 failing tests
- Test output showing all tests fail for correct reasons

**ESTIMATED TIME**: 3 hours

---

### Task 1.2: [GREEN] Implement usePersistedCounter Hook to Pass Tests

**ROLE**: You are a senior React Native developer implementing minimal code to pass tests (TDD Green phase)

**CONTEXT**: Tests from Task 1.1 define exact behavior needed. Implement using Legend-State v3 per @docs/research/expo_legend_state_v3_guide_20250917_225656.md

**OBJECTIVE**: Create hook implementation that makes all 11 tests pass

**FILE LOCATIONS**:
```
modules/attack-button/
├── hooks/
│   ├── usePersistedCounter.ts          # THIS TASK
│   └── usePersistedCounter.test.tsx    # From Task 1.1
├── stores/
│   └── counter.store.ts                # THIS TASK
└── types.ts                             # THIS TASK
```

**STEP-BY-STEP INSTRUCTIONS**:

1. **Create types file**: `modules/attack-button/types.ts`
```typescript
import { Observable } from '@legendapp/state'

/**
 * Counter validation constraints
 */
export const COUNTER_CONSTRAINTS = {
  MIN_VALUE: 0,
  MAX_VALUE: Number.MAX_SAFE_INTEGER,
  DEBOUNCE_MS: 500,
} as const

/**
 * Hook return type for usePersistedCounter
 */
export interface UsePersistedCounterReturn {
  count$: Observable<number>
  actions: {
    increment: () => void
    reset: () => void
    set: (value: number) => void
  }
}
```

2. **Create private store**: `modules/attack-button/stores/counter.store.ts`
```typescript
import { observable } from '@legendapp/state'
import { configureSynced, synced } from '@legendapp/state/sync'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COUNTER_CONSTRAINTS } from '../types'

// Configure persistence plugin
const persistPlugin = observablePersistAsyncStorage({ AsyncStorage })

// Create configured synced function
const persist = configureSynced(synced, {
  persist: {
    plugin: persistPlugin,
    retrySync: true
  }
})

// Validation function
export function validateCount(value: number): number {
  // Check for invalid numbers
  if (!Number.isFinite(value)) {
    return COUNTER_CONSTRAINTS.MIN_VALUE
  }

  // Prevent negative
  if (value < COUNTER_CONSTRAINTS.MIN_VALUE) {
    return COUNTER_CONSTRAINTS.MIN_VALUE
  }

  // Prevent overflow
  if (value > COUNTER_CONSTRAINTS.MAX_VALUE) {
    return COUNTER_CONSTRAINTS.MAX_VALUE
  }

  // Ensure integer
  return Math.floor(value)
}

// Factory function to create counter store with specific key
export function createCounterStore(storageKey: string, initialValue = 0) {
  return observable({
    count: persist({
      initial: validateCount(initialValue),
      persist: {
        name: storageKey,
      }
    })
  })
}
```

3. **Create hook implementation**: `modules/attack-button/hooks/usePersistedCounter.ts`
```typescript
import { useMemo } from 'react'
import { createCounterStore, validateCount } from '../stores/counter.store'
import type { UsePersistedCounterReturn } from '../types'

/**
 * Provides persistent counter behavior with auto-save
 *
 * @param storageKey - AsyncStorage key for persistence
 * @param initialValue - Starting value if no saved data (default: 0)
 * @returns Observable counter and actions
 *
 * @example
 * ```tsx
 * const { count$, actions } = usePersistedCounter('my-counter', 0)
 *
 * // In component
 * <Memo>{() => <Text>{count$.get()}</Text>}</Memo>
 * <Button onPress={actions.increment}>Increment</Button>
 * ```
 */
export function usePersistedCounter(
  storageKey: string,
  initialValue = 0
): UsePersistedCounterReturn {
  // Create store instance (memoized to persist across renders)
  const store = useMemo(
    () => createCounterStore(storageKey, initialValue),
    [storageKey, initialValue]
  )

  // Return memoized object with observable and actions
  return useMemo(() => ({
    // Observable for fine-grained reactivity
    count$: store.count,

    // Actions (regular functions, not observables)
    actions: {
      increment: () => {
        const current = store.count.get()
        store.count.set(validateCount(current + 1))
      },

      reset: () => {
        store.count.set(validateCount(initialValue))
      },

      set: (value: number) => {
        store.count.set(validateCount(value))
      }
    }
  }), [store, initialValue])
}
```

4. **Run tests to verify they PASS**:
```bash
npm test -- usePersistedCounter.test.tsx
```

5. **Fix any failing tests** by adjusting implementation (minimal changes only)

**ACCEPTANCE CRITERIA**:
- [x] All 3 files created at correct locations
- [x] Types properly defined with TypeScript
- [x] Store uses Legend-State observable with persistence
- [x] Hook returns observable (not value) per architecture guide
- [x] Validation prevents negative, overflow, and invalid numbers
- [x] Debouncing configured to 500ms
- [x] All 11 tests PASS (GREEN phase complete)
- [x] No extra features beyond test requirements

**VALIDATION COMMANDS**:
```bash
# All tests should pass
npm test -- usePersistedCounter.test.tsx

# Check TypeScript compilation
npx tsc --noEmit

# Verify no linting errors
npm run lint
```

**DEPENDENCIES**: Task 1.1 (tests must exist first)
**DELIVERABLES**:
- `modules/attack-button/types.ts` with types and constants
- `modules/attack-button/stores/counter.store.ts` with private store
- `modules/attack-button/hooks/usePersistedCounter.ts` with hook implementation
- All 11 tests passing

**ESTIMATED TIME**: 4 hours

---

### Task 1.3: [REFACTOR] Improve Hook Implementation Quality

**ROLE**: You are a senior developer refactoring code while keeping tests green (TDD Refactor phase)

**CONTEXT**: Hook works and passes tests, but needs polish for production readiness

**OBJECTIVE**: Improve code quality, add documentation, optimize performance

**REFACTORING CHECKLIST**:

1. **Add JSDoc Comments**:
   - Document all exported functions
   - Add parameter descriptions
   - Include usage examples
   - Document validation constraints

2. **Extract Magic Numbers**:
   - Ensure all constants in `COUNTER_CONSTRAINTS`
   - No hardcoded values in implementation

3. **Optimize Performance**:
   - Verify useMemo dependencies are correct
   - Check for unnecessary re-renders
   - Ensure validation doesn't run unnecessarily

4. **Error Handling**:
   - Add console warnings for validation (development only)
   - Handle AsyncStorage failures gracefully

5. **Code Organization**:
   - Consistent formatting
   - Clear separation of concerns
   - Follow project style guide

**IMPLEMENTATION**:

Update validation with development warnings:
```typescript
export function validateCount(value: number): number {
  const original = value

  // Check for invalid numbers
  if (!Number.isFinite(value)) {
    if (__DEV__) {
      console.warn(`[Counter] Invalid number ${original}, resetting to 0`)
    }
    return COUNTER_CONSTRAINTS.MIN_VALUE
  }

  // Prevent negative
  if (value < COUNTER_CONSTRAINTS.MIN_VALUE) {
    if (__DEV__) {
      console.warn(`[Counter] Negative value ${value} not allowed, setting to 0`)
    }
    return COUNTER_CONSTRAINTS.MIN_VALUE
  }

  // Prevent overflow
  if (value > COUNTER_CONSTRAINTS.MAX_VALUE) {
    if (__DEV__) {
      console.warn(`[Counter] Value ${value} exceeds max, capping at ${COUNTER_CONSTRAINTS.MAX_VALUE}`)
    }
    return COUNTER_CONSTRAINTS.MAX_VALUE
  }

  // Ensure integer
  return Math.floor(value)
}
```

**ACCEPTANCE CRITERIA**:
- [x] All code has JSDoc comments
- [x] No magic numbers in code
- [x] Development warnings added for validation
- [x] Code formatted consistently
- [x] All 11 tests still PASS after refactoring
- [x] No new functionality added (refactor only)

**VALIDATION COMMANDS**:
```bash
# Tests must still pass
npm test -- usePersistedCounter.test.tsx

# Check code quality
npm run lint

# TypeScript check
npx tsc --noEmit
```

**DEPENDENCIES**: Task 1.2 (implementation must exist)
**DELIVERABLES**:
- Polished, production-ready hook implementation
- All tests still passing
- Code ready for code review

**ESTIMATED TIME**: 2 hours

---

## Phase 2: TDD UI Implementation - Component (Days 3-4)

_Duration: 2 days | Priority: P0 | Prerequisites: Phase 1_

**LEAN PRINCIPLE**: Component delivers user-visible interaction. User can tap button and see count increase.

---

### Task 2.1: [RED] Write Failing Tests for ClickerScreen Component

**ROLE**: You are a senior React Native developer writing component tests BEFORE implementation

**CONTEXT**: Per TDD Section 7 Phase 2, create UI tests following @docs/research/react_native_testing_library_guide_20250918_184418.md

**OBJECTIVE**: Write comprehensive failing tests for ClickerScreen component

**FILE LOCATIONS**:
```
modules/attack-button/
├── ClickerScreen.tsx                # Implementation (Task 2.2)
├── ClickerScreen.test.tsx           # THIS TASK
└── utils/
    ├── formatNumber.ts              # Utility (Task 2.2)
    └── formatNumber.test.ts         # THIS TASK
```

**STEP-BY-STEP INSTRUCTIONS**:

1. **Create utility test file**: `modules/attack-button/utils/formatNumber.test.ts`
```typescript
import { formatNumber } from './formatNumber'

describe('formatNumber', () => {
  test('formats small numbers without commas', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(1)).toBe('1')
    expect(formatNumber(999)).toBe('999')
  })

  test('formats thousands with commas', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(12345)).toBe('12,345')
    expect(formatNumber(999999)).toBe('999,999')
  })

  test('formats millions with commas', () => {
    expect(formatNumber(1000000)).toBe('1,000,000')
    expect(formatNumber(12345678)).toBe('12,345,678')
  })

  test('formats MAX_SAFE_INTEGER correctly', () => {
    expect(formatNumber(Number.MAX_SAFE_INTEGER)).toBe('9,007,199,254,740,991')
  })
})
```

2. **Create component test file**: `modules/attack-button/ClickerScreen.test.tsx`
```typescript
import React from 'react'
import { render, screen, userEvent } from '@testing-library/react-native'
import { ClickerScreen } from './ClickerScreen'

describe('ClickerScreen', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders feed button', () => {
    render(<ClickerScreen />)
    expect(screen.getByText('Feed')).toBeTruthy()
  })

  test('renders counter label', () => {
    render(<ClickerScreen />)
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy()
  })

  test('displays initial count of 0', () => {
    render(<ClickerScreen />)
    expect(screen.getByText('Singularity Pet Count: 0')).toBeTruthy()
  })

  test('increments count on button press', async () => {
    render(<ClickerScreen />)

    const feedButton = screen.getByText('Feed')
    await user.press(feedButton)

    expect(screen.getByText('Singularity Pet Count: 1')).toBeTruthy()
  })

  test('handles multiple rapid taps accurately', async () => {
    render(<ClickerScreen />)

    const feedButton = screen.getByText('Feed')

    // Tap 5 times rapidly
    for (let i = 0; i < 5; i++) {
      await user.press(feedButton)
    }

    expect(screen.getByText('Singularity Pet Count: 5')).toBeTruthy()
  })

  test('formats large numbers with commas', async () => {
    render(<ClickerScreen />)

    // Mock hook to return large number
    const mockHook = require('./hooks/usePersistedCounter')
    jest.spyOn(mockHook, 'usePersistedCounter').mockReturnValue({
      count$: {
        get: () => 1234567,
        // Mock observable methods needed by Memo
        peek: () => 1234567,
        onChange: jest.fn()
      },
      actions: {
        increment: jest.fn(),
        reset: jest.fn(),
        set: jest.fn()
      }
    })

    const { rerender } = render(<ClickerScreen />)
    rerender(<ClickerScreen />)

    expect(screen.getByText('Singularity Pet Count: 1,234,567')).toBeTruthy()
  })

  test('feed button meets accessibility touch target size', () => {
    const { getByText } = render(<ClickerScreen />)

    const button = getByText('Feed').parent
    const style = button?.props.style

    // Flatten style array if needed
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style)
      : style

    expect(flatStyle.minWidth).toBeGreaterThanOrEqual(44)
    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44)
  })

  test('has high contrast colors for accessibility', () => {
    const { getByText } = render(<ClickerScreen />)

    const counterText = screen.getByText(/Singularity Pet Count/i)
    const style = counterText.props.style

    // Verify text color is defined (actual contrast checked manually)
    expect(style.color).toBeDefined()
  })
})
```

3. **Run tests to verify they FAIL**:
```bash
npm test -- ClickerScreen.test.tsx
npm test -- formatNumber.test.ts
```

**ACCEPTANCE CRITERIA**:
- [x] Utility test file created with 4 tests
- [x] Component test file created with 8 tests
- [x] Tests use React Native Testing Library patterns
- [x] Tests query by user-visible content (getByText)
- [x] Tests use userEvent for interactions
- [x] Tests verify accessibility requirements
- [x] All tests FAIL when run (RED phase complete)

**VALIDATION COMMANDS**:
```bash
# Should fail with module not found
npm test -- ClickerScreen.test.tsx
npm test -- formatNumber.test.ts

# Count failures
npm test -- ClickerScreen.test.tsx 2>&1 | grep -c "FAIL"
# Should output: 8
```

**DEPENDENCIES**: Phase 1 complete (hook implementation exists)
**DELIVERABLES**:
- `modules/attack-button/utils/formatNumber.test.ts` with 4 failing tests
- `modules/attack-button/ClickerScreen.test.tsx` with 8 failing tests

**ESTIMATED TIME**: 3 hours

---

### Task 2.2: [GREEN] Implement ClickerScreen Component to Pass Tests

**ROLE**: You are a senior React Native developer implementing minimal UI to pass tests

**CONTEXT**: Tests define exact UI requirements. Use fine-grained reactivity per architecture guide.

**OBJECTIVE**: Create component that makes all tests pass

**FILE LOCATIONS**:
```
modules/attack-button/
├── ClickerScreen.tsx                # THIS TASK
├── ClickerScreen.test.tsx           # From Task 2.1
└── utils/
    ├── formatNumber.ts              # THIS TASK
    └── formatNumber.test.ts         # From Task 2.1
```

**VISUAL REQUIREMENTS**:

```yaml
visual_requirements:
  component_name: "ClickerScreen"

  layout:
    structure: "centered vertical stack"
    alignment: "center"
    padding: "20px"

  feed_button:
    dimensions:
      min_width: "44px"  # WCAG requirement
      min_height: "44px"
      padding: "16px 32px"
    colors:
      background: "#007AFF"  # iOS blue
      text: "#FFFFFF"
      states:
        pressed: "#0051D5"
    typography:
      font_size: "18px"
      font_weight: "600"
      text: "Feed"
    interactions:
      feedback: "opacity + haptic"
      press_opacity: "0.7"
      response_time: "<100ms"

  counter_display:
    typography:
      font_size: "24px"
      font_weight: "700"
      line_height: "1.2"
      label: "Singularity Pet Count: {value}"
    colors:
      text: "#000000"  # High contrast
      background: "transparent"
    spacing:
      margin_bottom: "20px"

  accessibility:
    min_contrast_ratio: "4.5:1"
    touch_targets: "44x44px minimum"
    screen_reader: "Announce count changes"
    keyboard_navigable: true
```

**STEP-BY-STEP INSTRUCTIONS**:

1. **Create number formatter utility**: `modules/attack-button/utils/formatNumber.ts`
```typescript
/**
 * Formats a number with comma separators for thousands
 *
 * @param num - Number to format
 * @returns Formatted string with commas (e.g., "1,234,567")
 *
 * @example
 * formatNumber(1234) // "1,234"
 * formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}
```

2. **Create ClickerScreen component**: `modules/attack-button/ClickerScreen.tsx`
```typescript
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Memo } from '@legendapp/state/react'
import { usePersistedCounter } from './hooks/usePersistedCounter'
import { formatNumber } from './utils/formatNumber'

/**
 * Main clicker screen component
 *
 * Displays a feed button and counter showing Singularity Pet Count.
 * Uses fine-grained reactivity with Legend-State for optimal performance.
 */
export function ClickerScreen() {
  // Get counter state and actions from hook
  const { count$, actions } = usePersistedCounter('singularity-pet-count-v1', 0)

  return (
    <View style={styles.container}>
      {/* Counter Display - Only re-renders when count changes */}
      <Memo>
        {() => (
          <Text style={styles.counterText}>
            Singularity Pet Count: {formatNumber(count$.get())}
          </Text>
        )}
      </Memo>

      {/* Feed Button */}
      <TouchableOpacity
        style={styles.feedButton}
        onPress={actions.increment}
        activeOpacity={0.7}
        accessibilityLabel="Feed button"
        accessibilityHint="Tap to increase Singularity Pet Count"
        accessibilityRole="button"
      >
        <Text style={styles.feedButtonText}>Feed</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  counterText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  feedButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  feedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
})
```

3. **Run tests to verify they PASS**:
```bash
npm test -- formatNumber.test.ts
npm test -- ClickerScreen.test.tsx
```

4. **Fix any failing tests** with minimal changes

**ACCEPTANCE CRITERIA**:
- [x] formatNumber utility created and passes all 4 tests
- [x] ClickerScreen component created and passes all 8 tests
- [x] Uses Memo for fine-grained reactivity
- [x] Button meets 44x44pt accessibility minimum
- [x] Numbers formatted with comma separators
- [x] All tests PASS (GREEN phase complete)
- [x] No extra features beyond test requirements

**VALIDATION COMMANDS**:
```bash
# All tests pass
npm test -- formatNumber.test.ts
npm test -- ClickerScreen.test.tsx

# TypeScript check
npx tsc --noEmit

# Lint check
npm run lint
```

**DEPENDENCIES**: Task 2.1 (tests exist), Phase 1 (hook exists)
**DELIVERABLES**:
- `modules/attack-button/utils/formatNumber.ts` passing 4 tests
- `modules/attack-button/ClickerScreen.tsx` passing 8 tests
- User can tap button and see count increase

**ESTIMATED TIME**: 4 hours

---

### Task 2.3: [REFACTOR] Add Visual Feedback and Animations

**ROLE**: You are a senior React Native developer adding polish while keeping tests green

**CONTEXT**: Basic functionality works. Add visual feedback per TDD Section 9 (Performance) requirements.

**OBJECTIVE**: Improve UX with button feedback and counter animations

**ENHANCEMENTS**:

1. **Button Press Feedback**:
   - Already has activeOpacity (0.7)
   - Add haptic feedback (optional, P1 priority)

2. **Counter Animation** (Optional for MVP):
   - Simple fade or slide when number changes
   - Keep under 100ms to meet performance requirements

3. **Visual Polish**:
   - Ensure high contrast (already in styles)
   - Add subtle shadows/depth

**IMPLEMENTATION** (Optional Haptic):

```typescript
import * as Haptics from 'expo-haptics'

// In component
const handlePress = () => {
  // Haptic feedback on supported devices
  if (Haptics.impactAsync) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }
  actions.increment()
}

// Update button
<TouchableOpacity
  style={styles.feedButton}
  onPress={handlePress}
  // ... rest of props
>
```

**ACCEPTANCE CRITERIA**:
- [x] Button has visual press feedback (activeOpacity)
- [x] Optional: Haptic feedback on supported devices
- [x] Optional: Counter animation (if time permits)
- [x] All 8 component tests still PASS
- [x] Performance not degraded (<100ms response)

**VALIDATION COMMANDS**:
```bash
# All tests still pass
npm test -- ClickerScreen.test.tsx

# Manual test on device
npm run ios  # or npm run android
# Tap button rapidly, verify smooth feedback
```

**DEPENDENCIES**: Task 2.2 (component exists)
**DELIVERABLES**:
- Enhanced ClickerScreen with visual feedback
- All tests still passing
- Better user experience

**ESTIMATED TIME**: 2 hours

---

## Phase 3: Integration & Testing (Days 5-7)

_Duration: 3 days | Priority: P0 | Prerequisites: Phase 2_

---

### Task 3.1: [RED] Write Integration Tests

**ROLE**: You are a QA engineer writing end-to-end flow tests

**CONTEXT**: Component and hook work independently. Verify they work together correctly.

**OBJECTIVE**: Write integration tests for complete tap-to-persist flow

**FILE LOCATION**:
```
modules/attack-button/
└── integration.test.tsx     # THIS TASK
```

**STEP-BY-STEP INSTRUCTIONS**:

Create `modules/attack-button/integration.test.tsx`:

```typescript
import React from 'react'
import { render, screen, userEvent, waitFor } from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ClickerScreen } from './ClickerScreen'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage')

describe('ClickerScreen Integration', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.getItem.mockResolvedValue(null)
    AsyncStorage.setItem.mockResolvedValue(undefined)
  })

  test('complete tap-to-persist flow works end-to-end', async () => {
    render(<ClickerScreen />)

    const feedButton = screen.getByText('Feed')

    // Tap 3 times
    await user.press(feedButton)
    await user.press(feedButton)
    await user.press(feedButton)

    // Verify UI updates
    expect(screen.getByText('Singularity Pet Count: 3')).toBeTruthy()

    // Wait for debounced save (500ms + buffer)
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  test('count persists across component unmount/remount', async () => {
    // First render
    const { unmount } = render(<ClickerScreen />)

    const feedButton = screen.getByText('Feed')
    await user.press(feedButton)
    await user.press(feedButton)

    // Wait for save
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled()
    }, { timeout: 1000 })

    // Get what was saved
    const savedValue = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]

    // Unmount
    unmount()

    // Mock AsyncStorage to return saved value
    AsyncStorage.getItem.mockResolvedValueOnce(savedValue)

    // Re-render
    render(<ClickerScreen />)

    // Should load saved count
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 2')).toBeTruthy()
    })
  })

  test('handles rapid tapping without dropping events', async () => {
    render(<ClickerScreen />)

    const feedButton = screen.getByText('Feed')

    // Rapid tap 10 times
    for (let i = 0; i < 10; i++) {
      await user.press(feedButton)
    }

    expect(screen.getByText('Singularity Pet Count: 10')).toBeTruthy()
  })
})
```

Run tests - they should FAIL or PASS depending on implementation:
```bash
npm test -- integration.test.tsx
```

**ACCEPTANCE CRITERIA**:
- [x] Integration test file created
- [x] 3 end-to-end tests written
- [x] Tests verify full flow from tap to persistence
- [x] Tests check unmount/remount scenario
- [x] Tests verify rapid tapping accuracy

**DEPENDENCIES**: Phase 2 complete (component exists)
**DELIVERABLES**: Integration test suite
**ESTIMATED TIME**: 2 hours

---

### Task 3.2: [GREEN] Fix Integration Issues

**ROLE**: You are a senior developer fixing any integration issues found

**CONTEXT**: Integration tests may reveal issues with persistence timing, state management, or edge cases

**OBJECTIVE**: Ensure all integration tests pass

**POTENTIAL ISSUES TO FIX**:

1. **Persistence Timing**: If tests fail on persistence, check debounce configuration
2. **State Isolation**: Ensure each test gets fresh state
3. **Async Handling**: Verify all async operations properly awaited

**ACCEPTANCE CRITERIA**:
- [x] All 3 integration tests PASS
- [x] No flaky tests (run 10 times, all pass)
- [x] Performance metrics still met (<100ms tap response)

**VALIDATION COMMANDS**:
```bash
# Run integration tests 10 times
for i in {1..10}; do npm test -- integration.test.tsx; done

# All should pass
```

**DEPENDENCIES**: Task 3.1 (integration tests exist)
**DELIVERABLES**: All integration tests passing reliably
**ESTIMATED TIME**: 2 hours

---

### Task 3.3: Performance Testing & Optimization

**ROLE**: You are a performance engineer validating system meets TDD requirements

**CONTEXT**: TDD Section 9 specifies performance targets: <100ms p95 tap latency, 60fps

**OBJECTIVE**: Measure and verify performance metrics

**PERFORMANCE TESTS**:

1. **Tap Latency Measurement**:
   - Add performance.now() instrumentation
   - Measure time from tap to UI update
   - Target: <100ms for p95

2. **Frame Rate Testing**:
   - Use React DevTools Profiler
   - Tap rapidly (10+ taps/sec)
   - Verify 60fps maintained

3. **Memory Usage**:
   - Check memory footprint
   - Target: <10MB for feature module

**IMPLEMENTATION**:

Create `modules/attack-button/performance.test.tsx`:

```typescript
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { ClickerScreen } from './ClickerScreen'

describe('Performance', () => {
  test('tap latency is under 100ms for 95th percentile', () => {
    const { getByText } = render(<ClickerScreen />)
    const feedButton = getByText('Feed')

    const latencies: number[] = []

    // Measure 100 taps
    for (let i = 0; i < 100; i++) {
      const start = performance.now()
      fireEvent.press(feedButton)
      const end = performance.now()

      latencies.push(end - start)
    }

    // Sort and get p95
    latencies.sort((a, b) => a - b)
    const p95Index = Math.floor(latencies.length * 0.95)
    const p95Latency = latencies[p95Index]

    expect(p95Latency).toBeLessThan(100)
  })
})
```

**ACCEPTANCE CRITERIA**:
- [x] Tap latency <100ms (p95)
- [x] Frame rate ≥60fps during rapid tapping
- [x] Memory footprint <10MB
- [x] Performance test passing

**VALIDATION COMMANDS**:
```bash
npm test -- performance.test.tsx

# Manual testing with React DevTools
npm run ios
# Enable Performance Monitor
# Tap rapidly and observe FPS
```

**DEPENDENCIES**: Phase 2 complete
**DELIVERABLES**: Performance validated, test passing
**ESTIMATED TIME**: 3 hours

---

### Task 3.4: Accessibility Audit & Fixes

**ROLE**: You are an accessibility specialist ensuring WCAG 2.1 AA compliance

**CONTEXT**: TDD Section 2 specifies accessibility requirements

**OBJECTIVE**: Verify and fix accessibility issues

**AUDIT CHECKLIST**:

1. **Touch Targets**: ≥44x44pt (VERIFIED in tests)
2. **Color Contrast**: ≥4.5:1 ratio
3. **Screen Reader**: Proper labels and hints
4. **Keyboard Navigation**: Not applicable for mobile

**TOOLS**:
- iOS: Accessibility Inspector
- Android: Accessibility Scanner
- Manual testing with VoiceOver/TalkBack

**FIXES NEEDED** (if any):

Update ClickerScreen with better accessibility:
```typescript
<View
  accessible
  accessibilityLabel="Singularity Pet Counter"
  accessibilityHint="Shows your current count"
>
  <Memo>
    {() => (
      <Text
        style={styles.counterText}
        accessibilityLiveRegion="polite"
      >
        Singularity Pet Count: {formatNumber(count$.get())}
      </Text>
    )}
  </Memo>
</View>
```

**ACCEPTANCE CRITERIA**:
- [x] All touch targets ≥44x44pt
- [x] Color contrast ≥4.5:1
- [x] Screen reader announces count changes
- [x] Accessibility labels present
- [x] Manual testing with VoiceOver/TalkBack passes

**DEPENDENCIES**: Phase 2 complete
**DELIVERABLES**: WCAG 2.1 AA compliant UI
**ESTIMATED TIME**: 2 hours

---

## Phase 4: QA & Production Readiness (Days 8-10)

_Duration: 3 days | Priority: P0 | Prerequisites: Phase 3_

---

### Task 4.1: Cross-Platform Testing (iOS & Android)

**ROLE**: You are a QA engineer testing across platforms

**CONTEXT**: Feature must work identically on iOS and Android

**OBJECTIVE**: Test on both platforms, fix platform-specific issues

**TEST MATRIX**:

| Test Case | iOS | Android |
|-----------|-----|---------|
| Button renders correctly | ✓ | ✓ |
| Tap increments count | ✓ | ✓ |
| Count persists | ✓ | ✓ |
| Number formatting | ✓ | ✓ |
| Haptic feedback (if impl) | ✓ | ✓ |
| Touch target size | ✓ | ✓ |
| Screen reader | ✓ | ✓ |
| Rapid tapping (10+/sec) | ✓ | ✓ |
| Large numbers (1M+) | ✓ | ✓ |
| MAX_SAFE_INTEGER | ✓ | ✓ |

**TESTING PROCEDURE**:

1. Run on iOS Simulator:
```bash
npm run ios
```

2. Run on Android Emulator:
```bash
npm run android
```

3. Test each scenario manually
4. Document any platform-specific issues
5. Fix issues
6. Re-test

**ACCEPTANCE CRITERIA**:
- [x] All test cases pass on iOS
- [x] All test cases pass on Android
- [x] No platform-specific bugs
- [x] Consistent UX across platforms

**DEPENDENCIES**: Phase 3 complete
**DELIVERABLES**: Platform compatibility verified
**ESTIMATED TIME**: 4 hours

---

### Task 4.2: Edge Case Testing & Bug Fixes

**ROLE**: You are a QA engineer finding and fixing edge cases

**CONTEXT**: Test unusual scenarios not covered by unit tests

**OBJECTIVE**: Find and fix edge cases

**EDGE CASE SCENARIOS**:

1. **App Backgrounding/Foregrounding**:
   - Tap button, background app, foreground
   - Verify count persists

2. **Low Storage Scenario**:
   - Mock AsyncStorage failure
   - Verify graceful handling

3. **Extremely Rapid Tapping**:
   - 20+ taps per second
   - Verify no drops

4. **Number Boundaries**:
   - Test at 999 (before comma)
   - Test at 1000 (first comma)
   - Test at 999,999, 1,000,000
   - Test at MAX_SAFE_INTEGER

5. **Device Rotation**:
   - Tap, rotate device
   - Verify state preserved

**BUGS TO FIX** (if found):
- Document each bug
- Write regression test
- Fix implementation
- Verify fix

**ACCEPTANCE CRITERIA**:
- [x] All edge cases tested
- [x] All bugs fixed
- [x] Regression tests added
- [x] No crashes or data loss

**DEPENDENCIES**: Task 4.1 complete
**DELIVERABLES**: Edge cases handled gracefully
**ESTIMATED TIME**: 4 hours

---

### Task 4.3: Code Coverage & Test Quality Review

**ROLE**: You are a tech lead reviewing test coverage and quality

**CONTEXT**: TDD requires >80% code coverage

**OBJECTIVE**: Verify coverage, improve if needed

**COVERAGE CHECK**:

```bash
npm test -- --coverage --collectCoverageFrom='modules/attack-button/**/*.{ts,tsx}'
```

**COVERAGE TARGETS**:
- Statements: >80%
- Branches: >80%
- Functions: >80%
- Lines: >80%

**REVIEW CHECKLIST**:
- [x] All functions have tests
- [x] All branches covered
- [x] Error cases tested
- [x] Integration scenarios covered
- [x] Performance validated

**IF COVERAGE < 80%**:
- Identify untested code
- Write additional tests
- Re-run coverage

**ACCEPTANCE CRITERIA**:
- [x] Statement coverage >80%
- [x] Branch coverage >80%
- [x] Function coverage >80%
- [x] Line coverage >80%
- [x] Coverage report generated

**DEPENDENCIES**: Phase 3 complete (all tests written)
**DELIVERABLES**: Coverage >80%, report generated
**ESTIMATED TIME**: 2 hours

---

### Task 4.4: Documentation & Code Review Prep

**ROLE**: You are a technical writer preparing documentation

**CONTEXT**: Feature complete, needs documentation for team

**OBJECTIVE**: Create comprehensive documentation

**DOCUMENTATION DELIVERABLES**:

1. **README Update**: Add feature to module README
```markdown
# Attack Button Module

## Features

### Singularity Pet Clicker

A core idle/clicker mechanic featuring:
- Single-tap interaction to increment counter
- Persistent state across app sessions
- Sub-100ms tap response time
- Support for large numbers (up to 9 quadrillion)
- Accessible UI (WCAG 2.1 AA compliant)

**Usage**:
```tsx
import { ClickerScreen } from '@/modules/attack-button'

// In your navigation
<Stack.Screen name="clicker" component={ClickerScreen} />
```

**Architecture**:
- Hook: `usePersistedCounter` - Behavior-based state management
- Store: `counter.store.ts` - Private Legend-State observable
- Component: `ClickerScreen` - Fine-grained reactive UI
```

2. **API Documentation**: Already in JSDoc comments

3. **Testing Guide**: Document how to run tests
```markdown
## Testing

### Run All Tests
```bash
npm test -- modules/attack-button
```

### Run Specific Test Suites
```bash
npm test -- usePersistedCounter.test.tsx  # Hook tests
npm test -- ClickerScreen.test.tsx        # Component tests
npm test -- integration.test.tsx          # Integration tests
```

### Coverage Report
```bash
npm test -- --coverage modules/attack-button
```
```

**ACCEPTANCE CRITERIA**:
- [x] README updated with feature description
- [x] Usage examples provided
- [x] Testing guide documented
- [x] Architecture explained
- [x] All code has JSDoc comments

**DEPENDENCIES**: All implementation complete
**DELIVERABLES**: Complete documentation
**ESTIMATED TIME**: 2 hours

---

### Task 4.5: Final Integration & Deployment Prep

**ROLE**: You are a DevOps engineer preparing for deployment

**CONTEXT**: Feature ready for production

**OBJECTIVE**: Final integration, smoke tests, deployment checklist

**FINAL CHECKS**:

1. **Run All Tests**:
```bash
npm test
```

2. **TypeScript Compilation**:
```bash
npx tsc --noEmit
```

3. **Linting**:
```bash
npm run lint
```

4. **Build Verification**:
```bash
# iOS
npm run ios --configuration Release

# Android
npm run android --variant release
```

5. **Smoke Test**:
   - Launch app
   - Navigate to clicker screen
   - Tap button 10 times
   - Close app
   - Reopen app
   - Verify count persisted

**DEPLOYMENT CHECKLIST**:
- [x] All tests passing
- [x] TypeScript compiles
- [x] No linting errors
- [x] Builds successfully on iOS
- [x] Builds successfully on Android
- [x] Smoke test passes
- [x] Documentation complete
- [x] Code reviewed (if applicable)

**ACCEPTANCE CRITERIA**:
- [x] All checks passing
- [x] Feature ready for production
- [x] Deployment guide documented

**DEPENDENCIES**: All previous tasks complete
**DELIVERABLES**: Production-ready feature
**ESTIMATED TIME**: 2 hours

---

## Summary & Metrics

### Task Breakdown by Phase

| Phase | Tasks | Estimated Time | Status |
|-------|-------|----------------|--------|
| Phase 1: Hook Implementation | 3 | 9 hours (2 days) | Pending |
| Phase 2: UI Implementation | 3 | 9 hours (2 days) | Pending |
| Phase 3: Integration & Testing | 4 | 9 hours (3 days) | Pending |
| Phase 4: QA & Production | 5 | 14 hours (3 days) | Pending |
| **TOTAL** | **15** | **41 hours (10 days)** | **Pending** |

### Test Coverage Summary

| Test Type | Count | Files |
|-----------|-------|-------|
| Unit Tests - Hook | 11 | usePersistedCounter.test.tsx |
| Unit Tests - Utility | 4 | formatNumber.test.ts |
| Component Tests | 8 | ClickerScreen.test.tsx |
| Integration Tests | 3 | integration.test.tsx |
| Performance Tests | 1 | performance.test.tsx |
| **TOTAL** | **27** | **5 test files** |

### Critical Path

```
Task 1.1 → Task 1.2 → Task 1.3 → Task 2.1 → Task 2.2 → Task 2.3
   ↓
Task 3.1 → Task 3.2 → Task 3.3 → Task 3.4
   ↓
Task 4.1 → Task 4.2 → Task 4.3 → Task 4.4 → Task 4.5
```

### Lean Validation Checklist

Per @docs/architecture/lean-task-generation-guide.md:

- [x] **Task 1 delivers user-visible functionality**: Yes - Hook provides working counter behavior (testable immediately)
- [x] **Every task allows user to DO something new**: Yes - Each GREEN task adds capability
- [x] **Files/folders created only when needed**: Yes - Created just-in-time for features
- [x] **Dependencies installed only when used**: Yes - Legend-State already in project
- [x] **Each task is independently demo-able**: Yes - Tests verify each step
- [x] **NO infrastructure-only tasks**: Yes - All tasks deliver functionality or tests

### Risk Mitigation

| Risk (from TDD) | Mitigation Task | Status |
|-----------------|-----------------|--------|
| AsyncStorage failures | Task 4.2 - Edge case testing | Pending |
| Tap drops during rapid tapping | Task 3.3 - Performance testing | Pending |
| Large number performance | Task 3.3 - Performance testing | Pending |
| Cross-platform issues | Task 4.1 - Platform testing | Pending |

---

_Generated from TDD: `tdd_singularity_pet_clicker_20251111.md`_
_Generation timestamp: 2025-11-11_
_Optimized for: Human execution with TDD methodology_
_Next step: Begin Task 1.1 (RED phase - Write failing hook tests)_
