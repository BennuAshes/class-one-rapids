# Core Clicker Flow - Agent-Executable Task List

**Generated from TDD**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/tdd_core_clicker_flow_20251116.md`
**Generation Date**: 2025-11-16
**Feature**: Single "feed" button with persistent counter display
**Methodology**: Test-Driven Development (TDD)

---

## Overview

This task list implements a minimal viable clicker feature: a single "feed" button that increments a persistent counter displayed as "Singularity Pet Count". Implementation follows strict TDD methodology with React Native Testing Library and Legend-State v3 for fine-grained reactive state management.

**Success Criteria**:
- Button press response time <100ms
- Counter updates accurately (no dropped taps)
- State persists across app restarts
- Touch target meets 44x44pt accessibility requirements
- All tests pass before moving to next task

---

## Phase 1: Foundation & App Integration (TDD Zero Layer)

### Task 1.1: App Integration Tests (MANDATORY FIRST)

**ROLE**: You are a test engineer establishing the foundation for TDD by creating app-level integration tests that validate the complete user journey.

**CONTEXT**: The app currently has a "Hello World" placeholder in `App.tsx`. Before implementing any features, we need integration tests that will fail until the ClickerScreen is properly integrated. This prevents orphaned features and catches import errors immediately.

**OBJECTIVE**: Create failing integration tests at the App level that validate ClickerScreen renders and is accessible to users.

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Tests
```typescript
// File: /mnt/c/dev/class-one-rapids/frontend/App.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from './App';

describe('App Navigation Integration', () => {
  test('renders without import errors', () => {
    // This test FAILS if ClickerScreen module doesn't exist or has import errors
    expect(() => render(<App />)).not.toThrow();
  });

  test('displays clicker screen by default', () => {
    render(<App />);

    // This test FAILS if ClickerScreen doesn't render or lacks these elements
    expect(screen.getByRole('button', { name: /feed/i })).toBeTruthy();
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('clicker screen is accessible from app root', () => {
    render(<App />);

    // Verify counter display is present (validates integration)
    const counter = screen.getByText(/Singularity Pet Count: 0/i);
    expect(counter).toBeTruthy();
  });
});
```

#### Step 2: Run Tests (Must FAIL)
```bash
cmd.exe /c "npm test -- App.test.tsx"
```

Expected result: All tests FAIL (ClickerScreen doesn't exist yet)

**FILES TO CREATE**:
- `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx` - NEW FILE

**ACCEPTANCE CRITERIA**:
- [ ] App.test.tsx created with 3 integration tests
- [ ] All tests run and FAIL (RED phase)
- [ ] Test output clearly shows why tests fail (missing ClickerScreen)
- [ ] Tests validate imports, rendering, and screen accessibility

**DELIVERABLE**: Failing app integration tests ready for TDD implementation. Tests establish what the app should do before any code is written.

---

### Task 1.2: Skeleton ClickerScreen for Import Validation

**ROLE**: You are a frontend engineer creating a minimal skeleton component to pass import tests while keeping behavior tests failing.

**CONTEXT**: App.test.tsx tests are failing because ClickerScreen doesn't exist. This task creates the minimal component structure to pass import tests, but behavior tests should still fail (no button or counter yet).

**OBJECTIVE**: Create skeleton ClickerScreen component and update App.tsx to render it, making import tests pass while behavior tests remain RED.

**TDD IMPLEMENTATION**:

#### Step 1: Create Minimal Skeleton Component
```typescript
// File: /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx

import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ClickerScreen(): JSX.Element {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View />
    </SafeAreaView>
  );
}
```

#### Step 2: Update App.tsx
```typescript
// File: /mnt/c/dev/class-one-rapids/frontend/App.tsx

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

#### Step 3: Run Tests (Partial Success)
```bash
cmd.exe /c "npm test -- App.test.tsx"
```

Expected result:
- ✅ "renders without import errors" PASSES
- ❌ "displays clicker screen by default" FAILS (no button/counter yet)
- ❌ "clicker screen is accessible from app root" FAILS (no counter yet)

**FILES TO CREATE**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/` - NEW DIRECTORY
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx` - NEW FILE

**FILES TO MODIFY**:
- `/mnt/c/dev/class-one-rapids/frontend/App.tsx` - UPDATE (replace Hello World with ClickerScreen)

**ACCEPTANCE CRITERIA**:
- [ ] ClickerScreen.tsx created with minimal structure
- [ ] App.tsx imports and renders ClickerScreen without errors
- [ ] Import test PASSES (no module resolution errors)
- [ ] Behavior tests still FAIL (no functionality yet)
- [ ] App runs without crashes (`npx expo start`)

**DELIVERABLE**: Skeleton component integrated into app. Import validation passes, ready for feature implementation.

---

## Phase 2: TDD Feature Implementation

### Task 2.1: Persistent Counter Hook (TDD)

**ROLE**: You are a state management engineer implementing a persistent counter hook using Legend-State v3 with full TDD coverage.

**CONTEXT**: The ClickerScreen skeleton exists but has no functionality. Before implementing the UI, we need the behavior-based hook that encapsulates counter logic with AsyncStorage persistence. This follows behavior-based architecture patterns.

**OBJECTIVE**: Implement usePersistedCounter hook using Legend-State observable with AsyncStorage persistence, following strict TDD methodology.

**TDD IMPLEMENTATION**:

#### Step 1: RED Phase - Write ALL Failing Hook Tests First
```typescript
// File: /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.test.tsx

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePersistedCounter } from './usePersistedCounter';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('usePersistedCounter Hook', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('initializes with default value 0', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-key'));

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(0);
    });
  });

  test('increments count on action', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-key'));

    act(() => {
      result.current.actions.increment();
    });

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(1);
    });
  });

  test('handles rapid increments accurately', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-key'));

    // Rapid increments with waitFor after each
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.actions.increment();
      });

      await waitFor(() => {
        expect(result.current.count$.get()).toBe(i + 1);
      });
    }

    // Final verification
    expect(result.current.count$.get()).toBe(10);
  });

  test('persists value to AsyncStorage', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-persist'));

    act(() => {
      result.current.actions.increment();
    });

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(1);
    });

    // Verify AsyncStorage was called (synced handles persistence)
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test-persist',
        expect.any(String)
      );
    }, { timeout: 2000 });
  });

  test('loads persisted value on mount', async () => {
    // Pre-populate AsyncStorage
    await AsyncStorage.setItem('test-load', JSON.stringify(42));

    const { result } = renderHook(() => usePersistedCounter('test-load'));

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(42);
    }, { timeout: 2000 });
  });

  test('reset action sets count to 0', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-reset'));

    act(() => {
      result.current.actions.increment();
      result.current.actions.increment();
    });

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(2);
    });

    act(() => {
      result.current.actions.reset();
    });

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(0);
    });
  });
});
```

Run tests - they MUST all FAIL:
```bash
cmd.exe /c "npm test -- usePersistedCounter.test.tsx"
```

#### Step 2: GREEN Phase - Minimal Implementation to Pass Tests
```typescript
// File: /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.ts

import { useMemo } from 'react';
import { observable } from '@legendapp/state';
import { synced } from '@legendapp/state/sync';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Observable } from '@legendapp/state';

interface UsePersistedCounterReturn {
  count$: Observable<number>;
  actions: {
    increment: () => void;
    reset: () => void;
  };
}

/**
 * Custom hook providing persistent counter behavior using Legend-State.
 *
 * Behavior: Incremental counting with automatic AsyncStorage persistence
 *
 * @param storageKey - Unique key for AsyncStorage persistence
 * @returns Observable counter and increment action
 *
 * @example
 * const { count$, actions } = usePersistedCounter('my-counter');
 *
 * // In component:
 * <Memo>{() => <Text>Count: {count$.get()}</Text>}</Memo>
 * <Pressable onPress={actions.increment}>
 *   <Text>Increment</Text>
 * </Pressable>
 */
export function usePersistedCounter(storageKey: string): UsePersistedCounterReturn {
  return useMemo(() => {
    const count$ = observable(
      synced({
        initial: 0,
        persist: {
          name: storageKey,
          plugin: ObservablePersistAsyncStorage({ AsyncStorage }),
        },
      })
    );

    const actions = {
      increment: () => {
        count$.set(count$.get() + 1);
      },
      reset: () => {
        count$.set(0);
      },
    };

    return { count$, actions };
  }, [storageKey]);
}
```

Run tests - they MUST all PASS:
```bash
cmd.exe /c "npm test -- usePersistedCounter.test.tsx"
```

#### Step 3: REFACTOR Phase
- Review implementation for clarity
- Ensure JSDoc comments are accurate
- Run tests again to verify they still pass

**FILES TO CREATE**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/` - NEW DIRECTORY
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.ts` - NEW FILE
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.test.tsx` - NEW FILE

**ACCEPTANCE CRITERIA**:
- [ ] All 6 hook tests written and initially FAIL (RED phase)
- [ ] usePersistedCounter.ts implemented
- [ ] All tests PASS (GREEN phase)
- [ ] Hook initializes with value 0
- [ ] Increment action works correctly
- [ ] Handles 10+ rapid increments without dropping any
- [ ] Persists to AsyncStorage automatically
- [ ] Loads persisted value on mount
- [ ] Reset action works correctly
- [ ] Tests complete in <5 seconds

**DELIVERABLE**: Fully tested persistent counter hook with Legend-State + AsyncStorage integration. All tests passing.

---

### Task 2.2: ClickerScreen Component Implementation (TDD)

**ROLE**: You are a React Native engineer implementing the ClickerScreen component with full TDD coverage and accessibility compliance.

**CONTEXT**: The usePersistedCounter hook is fully tested and working. Now we implement the UI component that uses the hook, rendering a feed button and counter display. This task makes the App.test.tsx behavior tests pass.

**OBJECTIVE**: Implement ClickerScreen component using usePersistedCounter hook, with Pressable button and reactive counter display, following strict TDD methodology.

**TDD IMPLEMENTATION**:

#### Step 1: RED Phase - Write ALL Failing Component Tests First
```typescript
// File: /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { userEvent } from '@testing-library/react-native';
import { ClickerScreen } from './ClickerScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('ClickerScreen Component', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('renders feed button with correct accessibility attributes', () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });
    expect(button).toBeTruthy();
    expect(button.props.accessibilityLabel).toBe('Feed');
  });

  test('renders counter display with initial value 0', async () => {
    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
    });
  });

  test('increments counter when button pressed', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });
    await user.press(button);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });
  });

  test('handles rapid taps accurately', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Tap 10 times rapidly
    for (let i = 0; i < 10; i++) {
      await user.press(button);

      await waitFor(() => {
        expect(screen.getByText(`Singularity Pet Count: ${i + 1}`)).toBeTruthy();
      });
    }

    // Final verification
    expect(screen.getByText(/Singularity Pet Count: 10/i)).toBeTruthy();
  });

  test('button meets accessibility touch target size', () => {
    render(<ClickerScreen />);

    const button = screen.getByTestId('feed-button');
    const style = Array.isArray(button.props.style)
      ? Object.assign({}, ...button.props.style)
      : button.props.style;

    expect(style.minWidth).toBeGreaterThanOrEqual(44);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });

  test('counter text has correct accessibility attributes', async () => {
    render(<ClickerScreen />);

    await waitFor(() => {
      const counter = screen.getByText(/Singularity Pet Count: 0/i);
      expect(counter.props.accessibilityRole).toBe('text');
    });
  });
});
```

Run tests - they MUST all FAIL:
```bash
cmd.exe /c "npm test -- ClickerScreen.test.tsx"
```

#### Step 2: GREEN Phase - Minimal Implementation to Pass Tests
```typescript
// File: /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Memo } from '@legendapp/state/react';
import { usePersistedCounter } from './hooks/usePersistedCounter';

export function ClickerScreen(): JSX.Element {
  const { count$, actions } = usePersistedCounter('singularity-pet-count');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Memo>
          {() => (
            <Text
              style={styles.counterText}
              accessibilityRole="text"
            >
              Singularity Pet Count: {count$.get()}
            </Text>
          )}
        </Memo>

        <Pressable
          onPress={actions.increment}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Feed"
          testID="feed-button"
        >
          <Text style={styles.buttonText}>Feed</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  counterText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
```

Run tests - they MUST all PASS:
```bash
cmd.exe /c "npm test -- ClickerScreen.test.tsx"
```

#### Step 3: REFACTOR Phase
- Review styles for consistency
- Verify accessibility attributes
- Run tests again to verify they still pass

**FILES TO MODIFY**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx` - REPLACE skeleton with full implementation

**FILES TO CREATE**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx` - NEW FILE

**ACCEPTANCE CRITERIA**:
- [ ] All 6 component tests written and initially FAIL (RED phase)
- [ ] ClickerScreen.tsx implemented with Pressable and Memo
- [ ] All component tests PASS (GREEN phase)
- [ ] Button renders with correct accessibility attributes
- [ ] Counter displays initial value 0
- [ ] Counter increments on button press
- [ ] Handles 10 rapid taps accurately
- [ ] Button meets 44x44pt minimum touch target
- [ ] Counter has accessibility attributes
- [ ] Tests complete in <10 seconds

**DELIVERABLE**: Fully functional ClickerScreen component with TDD coverage. All component tests passing.

---

### Task 2.3: Full Integration Validation

**ROLE**: You are a QA engineer validating that all tests pass and the feature works end-to-end across all layers.

**CONTEXT**: The hook and component are individually tested and working. Now we validate that the entire feature integrates correctly at the app level and works on actual devices.

**OBJECTIVE**: Verify all test suites pass, App.test.tsx tests now succeed, and the feature works on iOS/Android simulators.

**VALIDATION STEPS**:

#### Step 1: Run Complete Test Suite
```bash
# Run all tests
cmd.exe /c "npm test"
```

Expected results:
- ✅ App.test.tsx - All 3 tests PASS
- ✅ usePersistedCounter.test.tsx - All 6 tests PASS
- ✅ ClickerScreen.test.tsx - All 6 tests PASS
- ✅ Total: 15 passing tests

#### Step 2: Manual Testing on Simulators
```bash
# Test on iOS
npx expo start --ios

# Test on Android
npx expo start --android
```

Manual test checklist:
1. App launches without errors
2. ClickerScreen is visible by default
3. Counter displays "Singularity Pet Count: 0"
4. Tapping "Feed" button increments counter to 1
5. Multiple rapid taps increment accurately
6. Counter updates within 100ms of tap
7. Close and reopen app - counter value persists
8. Reset app data - counter returns to 0

#### Step 3: Persistence Validation
```bash
# Test persistence across app restarts
1. Increment counter to 5
2. Close app (swipe away)
3. Reopen app
4. Verify counter shows 5
```

#### Step 4: Accessibility Validation
- Enable VoiceOver (iOS) or TalkBack (Android)
- Verify button is announced as "Feed, button"
- Verify counter is announced correctly
- Verify button can be activated with double-tap

**ACCEPTANCE CRITERIA**:
- [ ] All 15 tests pass in test suite
- [ ] App.test.tsx integration tests all PASS
- [ ] Feature works on iOS simulator
- [ ] Feature works on Android emulator
- [ ] Counter increments accurately on button press
- [ ] Counter updates within 100ms (feels instant)
- [ ] Counter value persists across app restarts
- [ ] Button meets accessibility requirements
- [ ] No console errors or warnings
- [ ] No frame drops during interaction

**DELIVERABLE**: Fully validated clicker feature working end-to-end. All tests passing, feature demo-able on devices.

---

## Phase 3: Quality Assurance & Validation

### Task 3.1: Cross-Platform Accessibility Audit

**ROLE**: You are an accessibility specialist ensuring the feature meets WCAG 2.1 Level AA standards across all platforms.

**CONTEXT**: The feature is working end-to-end with all tests passing. Now we validate accessibility compliance on real devices and simulators.

**OBJECTIVE**: Verify touch targets, color contrast, and screen reader support meet accessibility standards on iOS, Android, and Web.

**VALIDATION STEPS**:

#### iOS Testing
```bash
npx expo start --ios
```

1. **Touch Target Size**
   - Test on iPhone SE (smallest screen)
   - Verify button is easily tappable
   - Measure with accessibility inspector (44x44pt minimum)

2. **VoiceOver Support**
   - Enable VoiceOver (Settings > Accessibility > VoiceOver)
   - Navigate to button - verify announced as "Feed, button"
   - Navigate to counter - verify announced as "Singularity Pet Count: [value], text"
   - Double-tap button - verify counter increments
   - Verify focus order is logical (counter → button)

3. **Color Contrast**
   - Button text (#fff) on blue background (#007AFF): Check ratio ≥ 4.5:1
   - Counter text (#000) on white background (#fff): Check ratio ≥ 7:1
   - Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

#### Android Testing
```bash
npx expo start --android
```

1. **Touch Target Size**
   - Test on Pixel 7 or similar
   - Verify button is easily tappable
   - Verify button meets 48dp minimum (Android guideline)

2. **TalkBack Support**
   - Enable TalkBack (Settings > Accessibility > TalkBack)
   - Navigate to button - verify announced correctly
   - Navigate to counter - verify announced correctly
   - Double-tap button - verify counter increments

#### Web Testing (if applicable)
```bash
npx expo start --web
```

1. **Keyboard Navigation**
   - Tab to button - verify focus visible
   - Press Enter/Space - verify counter increments
   - Verify focus order is logical

2. **Screen Reader Support**
   - Test with NVDA (Windows) or JAWS
   - Verify button and counter announced correctly

**ACCEPTANCE CRITERIA**:
- [ ] Button meets 44x44pt minimum on iOS
- [ ] Button meets 48dp minimum on Android
- [ ] Color contrast ratios meet WCAG AA (≥4.5:1)
- [ ] VoiceOver announces button correctly on iOS
- [ ] VoiceOver announces counter correctly on iOS
- [ ] TalkBack announces button correctly on Android
- [ ] TalkBack announces counter correctly on Android
- [ ] Button activates via double-tap with screen readers
- [ ] Focus order is logical and predictable
- [ ] No accessibility warnings in React Native DevTools

**DELIVERABLE**: Accessibility compliance verified across platforms. Feature usable by users with disabilities.

---

### Task 3.2: Performance Validation

**ROLE**: You are a performance engineer validating that the feature meets response time and frame rate requirements.

**CONTEXT**: The feature is accessible and working correctly. Now we validate performance metrics meet the requirements (<100ms response, 60fps sustained).

**OBJECTIVE**: Measure and verify button response time, counter update latency, and frame rate during interactions.

**VALIDATION STEPS**:

#### Response Time Testing
```typescript
// Add temporary performance logging to ClickerScreen.tsx
const handlePress = () => {
  const start = performance.now();
  actions.increment();
  requestAnimationFrame(() => {
    const end = performance.now();
    console.log(`Response time: ${end - start}ms`);
  });
};
```

1. **Single Tap Measurement**
   - Tap button once
   - Verify console shows <100ms response time
   - Verify counter updates feel instant

2. **Rapid Tap Testing**
   - Tap as fast as possible for 10 seconds
   - Verify all taps are counted (no dropped inputs)
   - Verify counter stays in sync with taps
   - Check console for any response times >100ms

#### Frame Rate Monitoring
```bash
# Enable performance monitor
npx expo start
# Press 'm' in terminal to show developer menu
# Select "Show Performance Monitor"
```

1. **Baseline Frame Rate**
   - Observe FPS while app is idle (should be 60fps)

2. **Interaction Frame Rate**
   - Tap button rapidly while monitoring FPS
   - Verify FPS stays at 60 (or near 60)
   - Verify no frame drops during rapid tapping

3. **Persistence Impact**
   - Tap button 100 times
   - Verify AsyncStorage writes don't block UI
   - Verify no frame rate degradation

#### Memory & CPU Monitoring
```bash
# Use React Native DevTools or Xcode Instruments
# Monitor during rapid tapping
```

1. **Memory Usage**
   - Observe memory during 1000 taps
   - Verify no memory leaks (memory stays stable)

2. **CPU Usage**
   - Observe CPU during rapid tapping
   - Verify reasonable CPU usage (<50% on modern devices)

**ACCEPTANCE CRITERIA**:
- [ ] Button press to counter update <100ms (typically <10ms)
- [ ] 60fps sustained during interactions
- [ ] No dropped taps during rapid sequences
- [ ] AsyncStorage writes are non-blocking
- [ ] No memory leaks after 1000 taps
- [ ] Reasonable CPU usage during interactions
- [ ] Counter updates feel instant and smooth
- [ ] No lag or stuttering during rapid tapping

**DELIVERABLE**: Performance requirements validated. Feature performs smoothly on target devices.

---

### Task 3.3: Final Cross-Platform Testing & Sign-Off

**ROLE**: You are a QA lead performing final validation before declaring the feature complete.

**CONTEXT**: All tests pass, accessibility is validated, and performance meets requirements. This is the final verification before feature sign-off.

**OBJECTIVE**: Validate the complete feature works correctly on all target platforms with no issues.

**VALIDATION STEPS**:

#### iOS Testing (iPhone 14+, iOS 13+)
```bash
npx expo start --ios
```

1. **Functional Testing**
   - Counter initializes to 0
   - Button increments counter correctly
   - Counter persists across app restarts
   - Rapid taps work accurately

2. **Visual Validation**
   - Button is properly styled
   - Counter is readable
   - Layout looks good on different screen sizes
   - Safe area insets are respected

3. **Edge Cases**
   - Test on iPhone SE (small screen)
   - Test on iPhone 14 Pro Max (large screen)
   - Test in landscape orientation
   - Test with system font size changes

#### Android Testing (Pixel 7+, Android 6.0+)
```bash
npx expo start --android
```

1. **Functional Testing**
   - Counter initializes to 0
   - Button increments counter correctly
   - Counter persists across app restarts
   - Rapid taps work accurately

2. **Visual Validation**
   - Button is properly styled (may look slightly different from iOS)
   - Counter is readable
   - Layout adapts to Android design language
   - Status bar is handled correctly

3. **Edge Cases**
   - Test on different screen sizes
   - Test with different Android versions
   - Test in landscape orientation

#### Web Testing (Chrome, Safari, Firefox)
```bash
npx expo start --web
```

1. **Functional Testing**
   - Counter initializes to 0
   - Button click increments counter
   - Counter persists (localStorage)
   - Multiple clicks work accurately

2. **Visual Validation**
   - Button is properly styled for web
   - Counter is readable
   - Layout is responsive
   - Works at different viewport sizes

3. **Browser Compatibility**
   - Chrome: Full functionality
   - Safari: Full functionality
   - Firefox: Full functionality

#### Persistence Testing (All Platforms)
```bash
# Test counter persistence across app lifecycle
```

1. **Increment counter to 42**
2. **Close app completely** (swipe away, force quit)
3. **Reopen app**
4. **Verify counter shows 42**
5. **Test rapid increments** (add 10 more)
6. **Close and reopen again**
7. **Verify counter shows 52**

#### Regression Testing
```bash
# Run full test suite one final time
cmd.exe /c "npm test"
```

- Verify all 15 tests still pass
- Verify no new console warnings
- Verify no performance regressions

**ACCEPTANCE CRITERIA**:
- [ ] Feature works on iOS (iPhone 14+, iOS 13+)
- [ ] Feature works on Android (Pixel 7+, Android 6.0+)
- [ ] Feature works on Web (Chrome, Safari, Firefox)
- [ ] Counter persists correctly on all platforms
- [ ] Rapid taps work accurately on all platforms
- [ ] Visual design is consistent and polished
- [ ] Works on different screen sizes
- [ ] Works in landscape orientation
- [ ] No console errors or warnings
- [ ] All 15 tests pass
- [ ] Ready for production deployment

**DELIVERABLE**: Feature fully validated and ready for production. All platforms tested, all tests passing, no known issues.

---

## Summary

**Total Tasks**: 8 tasks across 3 phases
**Estimated Timeline**: 2 weeks
**Testing Approach**: TDD with Red-Green-Refactor cycle
**Coverage**: 15 total tests (3 app integration, 6 hook unit, 6 component integration)

**Key Deliverables**:
1. Failing app integration tests (TDD foundation)
2. Skeleton component integrated into app
3. Fully tested persistent counter hook
4. Fully tested ClickerScreen component
5. End-to-end integration validation
6. Accessibility compliance verification
7. Performance requirements validation
8. Cross-platform feature validation

**Success Metrics**:
- All 15 tests passing
- <100ms button response time
- 60fps sustained frame rate
- WCAG 2.1 Level AA compliance
- Cross-platform compatibility (iOS, Android, Web)
- State persistence working correctly

---

**Next Steps After Completion**:
1. Review with product owner for acceptance
2. Create pull request with all changes
3. Deploy to staging environment for final testing
4. Release to production once approved

**Future Enhancements** (not in this task list):
- Add haptic feedback on button press
- Add visual animations for counter updates
- Add multi-screen navigation using existing navigation hook
- Add more gameplay features (shop, upgrades, etc.)
