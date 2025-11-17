# Task List: Scrap System Implementation
## Passive Resource Generation System

**Generated From:** `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/tdd_scrap_system_20251117.md`
**Date:** 2025-11-17
**Module:** scrap
**Methodology:** Test-Driven Development (TDD)

---

## Overview

This task list provides explicit, sequential tasks for implementing the Scrap System feature. Each task includes:
- Unique Task ID
- Clear description
- Task type (test/implementation/refactor)
- Dependencies
- Acceptance criteria
- File paths involved

The implementation follows TDD methodology: write tests first, then implement the feature to pass those tests.

---

## Task Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: UI Integration | 3 tasks | 1 hour |
| Phase 2: Timer Implementation | 3 tasks | 1 hour |
| Phase 3: Testing | 7 tasks | 2-3 hours |
| Phase 4: Manual Testing | 4 tasks | 1 hour |
| Phase 5: Documentation | 2 tasks | 30 minutes |
| **Total** | **19 tasks** | **5-6 hours** |

---

## Phase 1: UI Integration

### Task SCRAP-1.1: Add Scrap Display to AttackButtonScreen

**Type:** Implementation
**Dependencies:** None
**Priority:** HIGH

**Description:**
Modify AttackButtonScreen component to import scrap$ observable from useGameState hook and add a Text component to display the current scrap value.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Implementation Steps:**
1. Import `useEffect` from React (add to existing import)
2. Destructure `scrap$` from `useGameState()` hook
3. Add `const scrap = scrap$.get();` to read the current scrap value
4. Add new `<Text>` component after pet count display:
   ```typescript
   <Text
     style={styles.scrapText}
     accessibilityRole="text"
     accessibilityLabel={`Scrap: ${scrap}`}
   >
     Scrap: {scrap}
   </Text>
   ```

**Acceptance Criteria:**
- [ ] scrap$ is destructured from useGameState hook
- [ ] scrap variable reads current value using .get()
- [ ] Text component displays "Scrap: {value}"
- [ ] accessibilityRole is set to "text"
- [ ] accessibilityLabel includes the scrap value
- [ ] TypeScript compiles without errors
- [ ] No runtime errors when rendering

**Verification:**
```bash
cd /mnt/c/dev/class-one-rapids/frontend && npx tsc --noEmit
```

---

### Task SCRAP-1.2: Add Styling for Scrap Display

**Type:** Implementation
**Dependencies:** SCRAP-1.1
**Priority:** HIGH

**Description:**
Add styling for the scrap counter and adjust spacing to accommodate the new display element.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Implementation Steps:**
1. Modify `counterText` style: Change `marginBottom` from `30` to `10`
2. Add new `scrapText` style to StyleSheet:
   ```typescript
   scrapText: {
     fontSize: 16,
     marginBottom: 20,
     color: '#000000',
   },
   ```

**Acceptance Criteria:**
- [ ] counterText.marginBottom is 10
- [ ] scrapText style exists with fontSize: 16
- [ ] scrapText.marginBottom is 20
- [ ] scrapText.color is '#000000'
- [ ] Visual layout looks correct (scrap between pet count and button)
- [ ] No style regressions on existing elements

**Verification:**
```bash
cd /mnt/c/dev/class-one-rapids/frontend && npm start
# Manually verify UI layout in expo
```

---

### Task SCRAP-1.3: Manual Verification of UI

**Type:** Manual Testing
**Dependencies:** SCRAP-1.1, SCRAP-1.2
**Priority:** HIGH

**Description:**
Manually verify that the scrap counter displays correctly with initial value and proper styling.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Testing Steps:**
1. Start the development server: `cd /mnt/c/dev/class-one-rapids/frontend && npm start`
2. Launch app in iOS simulator or Android emulator
3. Verify "Scrap: 0" displays on screen
4. Verify positioning: Pet count → Scrap → Feed button (top to bottom)
5. Verify font size of scrap is slightly smaller than pet count
6. Verify adequate spacing between elements
7. Check for any console errors or warnings

**Acceptance Criteria:**
- [ ] Scrap displays "Scrap: 0" initially
- [ ] Scrap is positioned between pet count and button
- [ ] Font size is visually smaller (16px vs 18px)
- [ ] Spacing looks correct (10px above, 20px below)
- [ ] No visual regressions
- [ ] No console errors
- [ ] TypeScript compiles successfully

---

## Phase 2: Timer Implementation

### Task SCRAP-2.1: Implement Scrap Generation Timer

**Type:** Implementation
**Dependencies:** SCRAP-1.1, SCRAP-1.2, SCRAP-1.3
**Priority:** HIGH

**Description:**
Add a useEffect hook with setInterval to generate scrap every second based on the current petCount value.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Implementation Steps:**
1. Add useEffect hook after the `handleFeed` function definition
2. Create setInterval with 1000ms interval
3. In the timer callback:
   - Read current petCount: `const petCount = petCount$.get();`
   - Calculate scrap generated: `const scrapGenerated = petCount * 1;`
   - Only update if scrapGenerated > 0
   - Update scrap using functional update: `scrap$.set((prev) => prev + scrapGenerated);`
4. Return cleanup function: `return () => clearInterval(interval);`
5. Use empty dependency array: `}, []);`

**Code to Add:**
```typescript
// Scrap generation timer
useEffect(() => {
  const interval = setInterval(() => {
    const petCount = petCount$.get();
    const scrapGenerated = petCount * 1; // 1 scrap per pet per second

    if (scrapGenerated > 0) {
      scrap$.set((prev) => prev + scrapGenerated);
    }
  }, 1000);

  return () => clearInterval(interval);
}, []); // Empty dependency array - timer persists for component lifetime
```

**Acceptance Criteria:**
- [ ] useEffect hook is added with empty dependency array
- [ ] setInterval is created with 1000ms interval
- [ ] petCount is read using .get() inside callback
- [ ] scrapGenerated is calculated as petCount * 1
- [ ] Conditional check prevents updates when scrapGenerated = 0
- [ ] scrap is updated using functional set with prev => prev + scrapGenerated
- [ ] Cleanup function calls clearInterval
- [ ] TypeScript compiles without errors

**Verification:**
```bash
cd /mnt/c/dev/class-one-rapids/frontend && npx tsc --noEmit
```

---

### Task SCRAP-2.2: Manual Testing of Timer Behavior

**Type:** Manual Testing
**Dependencies:** SCRAP-2.1
**Priority:** HIGH

**Description:**
Manually verify that scrap generates at the correct rate based on petCount.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Testing Steps:**
1. Start the app in development mode
2. **Test Case 1: Zero pet count**
   - Initial state: petCount = 0
   - Wait 5 seconds
   - Verify scrap remains 0
3. **Test Case 2: Single pet**
   - Click feed button once (petCount = 1)
   - Observe scrap counter
   - Verify scrap increments by 1 every second for 5 seconds (should reach 5)
4. **Test Case 3: Multiple pets**
   - Click feed button 4 more times (petCount = 5)
   - Observe scrap counter
   - Verify scrap increments by 5 every second
5. **Test Case 4: Timer cleanup**
   - Navigate away from screen (if possible)
   - Navigate back
   - Verify timer restarts and scrap continues generating

**Acceptance Criteria:**
- [ ] No scrap generated when petCount = 0
- [ ] Scrap generates at rate of 1 per second with 1 pet
- [ ] Scrap generates at rate of 5 per second with 5 pets
- [ ] Timer cleans up properly on unmount
- [ ] Timer restarts on remount
- [ ] No console errors during testing
- [ ] No memory leaks observed

---

### Task SCRAP-2.3: Verify Persistence Integration

**Type:** Manual Testing
**Dependencies:** SCRAP-2.1, SCRAP-2.2
**Priority:** HIGH

**Description:**
Verify that scrap values persist correctly across app restarts using the existing persistence layer.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts` (existing)
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.ts` (existing)

**Testing Steps:**
1. Start the app
2. Set petCount to 10 (click feed 10 times)
3. Wait for scrap to generate for ~10 seconds (should have ~100 scrap)
4. Note the exact scrap value
5. Close the app completely (not just background)
6. Reopen the app
7. Verify scrap value matches the noted value (within ±1-2 due to debounce timing)
8. Verify petCount is still 10
9. Verify scrap continues generating

**Acceptance Criteria:**
- [ ] Scrap value persists across app restarts
- [ ] petCount persists across app restarts
- [ ] No more than 1-2 seconds of scrap lost (due to 1s debounce)
- [ ] Timer resumes generating scrap after restart
- [ ] No console errors during save/load
- [ ] AsyncStorage contains correct values

**Verification:**
```bash
# Check AsyncStorage manually if needed (platform-specific)
# iOS: ~/Library/Developer/CoreSimulator/.../AsyncStorage
# Android: adb shell run-as <package> cat /data/data/<package>/files/AsyncStorage
```

---

## Phase 3: Testing

### Task SCRAP-3.1: Write Scrap Display Tests

**Type:** Test
**Dependencies:** SCRAP-2.1, SCRAP-2.2, SCRAP-2.3
**Priority:** HIGH

**Description:**
Write unit tests for scrap display functionality including initial value, updated values, and accessibility attributes.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Test Cases to Add:**
```typescript
describe('AttackButtonScreen - Scrap Display', () => {
  beforeEach(() => {
    resetGameState();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders scrap counter with initial value', () => {
    const { getByText } = render(<AttackButtonScreen />);
    expect(getByText(/Scrap: 0/)).toBeTruthy();
  });

  test('displays previously saved scrap count', () => {
    gameState$.scrap.set(150);
    const { getByText } = render(<AttackButtonScreen />);
    expect(getByText(/Scrap: 150/)).toBeTruthy();
  });

  test('scrap counter has correct accessibility attributes', () => {
    gameState$.scrap.set(42);
    const { getByLabelText } = render(<AttackButtonScreen />);

    const scrapText = getByLabelText('Scrap: 42');
    expect(scrapText).toBeTruthy();
    expect(scrapText.props.accessibilityRole).toBe('text');
  });

  test('displays large scrap values correctly', () => {
    gameState$.scrap.set(999999);
    const { getByText } = render(<AttackButtonScreen />);
    expect(getByText(/Scrap: 999999/)).toBeTruthy();
  });
});
```

**Acceptance Criteria:**
- [ ] Test for initial scrap value (0) passes
- [ ] Test for previously saved scrap values passes
- [ ] Test for accessibility attributes passes
- [ ] Test for large scrap values passes
- [ ] All imports are correct
- [ ] beforeEach and afterEach hooks are set up correctly
- [ ] Tests use jest.useFakeTimers()

**Verification:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test AttackButtonScreen.test.tsx"
```

---

### Task SCRAP-3.2: Write Scrap Generation Tests

**Type:** Test
**Dependencies:** SCRAP-3.1
**Priority:** HIGH

**Description:**
Write unit tests for scrap generation logic with various petCount values.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Test Cases to Add:**
```typescript
describe('AttackButtonScreen - Scrap Generation', () => {
  beforeEach(() => {
    resetGameState();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('generates no scrap when petCount is 0', async () => {
    render(<AttackButtonScreen />);
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(gameState$.scrap.get()).toBe(0);
    });
  });

  test('generates 1 scrap per second when petCount is 1', async () => {
    gameState$.petCount.set(1);
    render(<AttackButtonScreen />);
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(gameState$.scrap.get()).toBe(3);
    });
  });

  test('generates 5 scrap per second when petCount is 5', async () => {
    gameState$.petCount.set(5);
    render(<AttackButtonScreen />);
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(gameState$.scrap.get()).toBe(10);
    });
  });

  test('handles large petCount values', async () => {
    gameState$.petCount.set(1000);
    render(<AttackButtonScreen />);
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(gameState$.scrap.get()).toBe(1000);
    });
  });

  test('accumulates scrap over time', async () => {
    gameState$.petCount.set(3);
    render(<AttackButtonScreen />);

    jest.advanceTimersByTime(1000);
    await waitFor(() => expect(gameState$.scrap.get()).toBe(3));

    jest.advanceTimersByTime(1000);
    await waitFor(() => expect(gameState$.scrap.get()).toBe(6));

    jest.advanceTimersByTime(1000);
    await waitFor(() => expect(gameState$.scrap.get()).toBe(9));
  });
});
```

**Acceptance Criteria:**
- [ ] Test for zero petCount passes (no scrap generated)
- [ ] Test for petCount = 1 passes (1 scrap/sec)
- [ ] Test for petCount = 5 passes (5 scrap/sec)
- [ ] Test for large petCount passes (1000 scrap/sec)
- [ ] Test for scrap accumulation passes
- [ ] All tests use jest.advanceTimersByTime correctly
- [ ] All tests use waitFor for async assertions

**Verification:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test AttackButtonScreen.test.tsx"
```

---

### Task SCRAP-3.3: Write Dynamic Rate Tests

**Type:** Test
**Dependencies:** SCRAP-3.2
**Priority:** HIGH

**Description:**
Write tests to verify that scrap generation rate updates correctly when petCount changes.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Test Cases to Add:**
```typescript
describe('AttackButtonScreen - Dynamic Generation Rate', () => {
  beforeEach(() => {
    resetGameState();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('generation rate updates when petCount changes', async () => {
    gameState$.petCount.set(2);
    render(<AttackButtonScreen />);

    // Generate at rate of 2/sec for 2 seconds
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(gameState$.scrap.get()).toBe(4);
    });

    // Increase pet count
    gameState$.petCount.set(5);

    // Generate at new rate of 5/sec for 2 seconds
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(gameState$.scrap.get()).toBe(14); // 4 + (5 * 2)
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test for dynamic rate change passes
- [ ] Scrap generated at initial rate is correct
- [ ] Scrap generated at new rate after change is correct
- [ ] Total accumulated scrap is correct
- [ ] Test uses jest.advanceTimersByTime correctly

**Verification:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test AttackButtonScreen.test.tsx"
```

---

### Task SCRAP-3.4: Write Timer Cleanup Tests

**Type:** Test
**Dependencies:** SCRAP-3.2
**Priority:** HIGH

**Description:**
Write tests to verify that the timer is properly cleaned up on component unmount and restarts on remount.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Test Cases to Add:**
```typescript
describe('AttackButtonScreen - Timer Cleanup', () => {
  beforeEach(() => {
    resetGameState();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('clears timer on unmount', async () => {
    const { unmount } = render(<AttackButtonScreen />);
    gameState$.petCount.set(5);

    // Advance timer while mounted
    jest.advanceTimersByTime(1000);
    await waitFor(() => expect(gameState$.scrap.get()).toBe(5));

    // Unmount component
    unmount();

    // Advance timer after unmount
    jest.advanceTimersByTime(2000);

    // Scrap should not increase
    expect(gameState$.scrap.get()).toBe(5);
  });

  test('timer restarts on remount', async () => {
    const { unmount, rerender } = render(<AttackButtonScreen />);
    gameState$.petCount.set(2);

    jest.advanceTimersByTime(1000);
    await waitFor(() => expect(gameState$.scrap.get()).toBe(2));

    unmount();

    // Remount
    rerender(<AttackButtonScreen />);

    jest.advanceTimersByTime(1000);
    await waitFor(() => expect(gameState$.scrap.get()).toBe(4));
  });
});
```

**Acceptance Criteria:**
- [ ] Test for timer cleanup on unmount passes
- [ ] Scrap does not increase after unmount
- [ ] Test for timer restart on remount passes
- [ ] Scrap continues generating after remount
- [ ] No memory leaks detected
- [ ] No console warnings about state updates after unmount

**Verification:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test AttackButtonScreen.test.tsx"
```

---

### Task SCRAP-3.5: Write Integration Tests with Clicking

**Type:** Test
**Dependencies:** SCRAP-3.2, SCRAP-3.4
**Priority:** HIGH

**Description:**
Write integration tests to verify that scrap generation works correctly alongside user clicking.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Test Cases to Add:**
```typescript
import { fireEvent } from '@testing-library/react-native';

describe('AttackButtonScreen - Integration with Clicking', () => {
  beforeEach(() => {
    resetGameState();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('scrap generation continues while clicking', async () => {
    const { getByText } = render(<AttackButtonScreen />);
    gameState$.petCount.set(2);

    const button = getByText('feed');

    // Simulate clicking and time passing
    jest.advanceTimersByTime(500);
    fireEvent.press(button); // petCount becomes 3

    jest.advanceTimersByTime(500);
    // First tick: 2 scrap generated

    await waitFor(() => expect(gameState$.scrap.get()).toBe(2));

    jest.advanceTimersByTime(1000);
    // Second tick: 3 scrap generated (new rate)

    await waitFor(() => expect(gameState$.scrap.get()).toBe(5));
  });

  test('concurrent updates do not cause race conditions', async () => {
    const { getByText } = render(<AttackButtonScreen />);
    gameState$.petCount.set(1);

    const button = getByText('feed');

    // Rapid clicks while timer is running
    for (let i = 0; i < 10; i++) {
      fireEvent.press(button);
      jest.advanceTimersByTime(100);
    }

    // Total time elapsed: 1 second
    await waitFor(() => {
      // petCount should be 11 (1 + 10 clicks)
      expect(gameState$.petCount.get()).toBe(11);

      // Scrap varies by click timing, but should be in reasonable range
      const scrap = gameState$.scrap.get();
      expect(scrap).toBeGreaterThanOrEqual(1);
      expect(scrap).toBeLessThanOrEqual(15);
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test for concurrent clicking and generation passes
- [ ] No race conditions detected
- [ ] petCount updates correctly
- [ ] scrap updates correctly with varying petCount
- [ ] Scrap values are within expected range
- [ ] fireEvent.press is imported and used correctly

**Verification:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test AttackButtonScreen.test.tsx"
```

---

### Task SCRAP-3.6: Write UI Update Tests

**Type:** Test
**Dependencies:** SCRAP-3.1, SCRAP-3.2
**Priority:** MEDIUM

**Description:**
Write tests to verify that the UI updates reactively when scrap values change.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Test Cases to Add:**
```typescript
describe('AttackButtonScreen - UI Updates', () => {
  beforeEach(() => {
    resetGameState();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('scrap counter updates reactively', async () => {
    gameState$.petCount.set(1);
    const { getByText } = render(<AttackButtonScreen />);

    expect(getByText(/Scrap: 0/)).toBeTruthy();

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(getByText(/Scrap: 1/)).toBeTruthy();
    });

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(getByText(/Scrap: 2/)).toBeTruthy();
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test for reactive UI updates passes
- [ ] Scrap counter displays updated values
- [ ] waitFor is used correctly for async UI updates
- [ ] Regular expressions match scrap text correctly

**Verification:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test AttackButtonScreen.test.tsx"
```

---

### Task SCRAP-3.7: Run Full Test Suite and Generate Coverage

**Type:** Test
**Dependencies:** SCRAP-3.1, SCRAP-3.2, SCRAP-3.3, SCRAP-3.4, SCRAP-3.5, SCRAP-3.6
**Priority:** HIGH

**Description:**
Run the complete test suite to ensure all tests pass and generate coverage report to verify ≥85% coverage for scrap-related code.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`
- All existing test files

**Testing Steps:**
1. Run all tests: `cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test"`
2. Run with coverage: `cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm run test:coverage"`
3. Review coverage report for AttackButtonScreen
4. Identify any uncovered lines
5. Add additional tests if coverage < 85%
6. Fix any failing tests
7. Re-run until all tests pass

**Acceptance Criteria:**
- [ ] All AttackButtonScreen tests pass
- [ ] All existing tests still pass (no regressions)
- [ ] AttackButtonScreen coverage ≥ 85%
- [ ] No flaky tests (run 3 times to verify)
- [ ] No test warnings or errors
- [ ] Tests run successfully in cmd.exe
- [ ] Coverage report is generated

**Verification:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test -- --coverage"
```

---

## Phase 4: Manual Testing & Polish

### Task SCRAP-4.1: Cross-Platform Manual Testing

**Type:** Manual Testing
**Dependencies:** SCRAP-3.7
**Priority:** HIGH

**Description:**
Manually test the scrap system on multiple platforms to ensure consistent behavior.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Testing Steps:**
1. **iOS Simulator Testing:**
   - Start app: `cd /mnt/c/dev/class-one-rapids/frontend && npm run ios`
   - Test scrap generation with 0, 1, 5, 10, 100 pets
   - Test persistence (close and reopen app)
   - Test rapid clicking while scrap generates
   - Check for visual glitches
   - Monitor performance

2. **Android Emulator Testing:**
   - Start app: `cd /mnt/c/dev/class-one-rapids/frontend && npm run android`
   - Repeat all iOS tests
   - Check for platform-specific issues

3. **Web Testing (if applicable):**
   - Start app: `cd /mnt/c/dev/class-one-rapids/frontend && npm run web`
   - Repeat all tests
   - Check browser console for errors

**Acceptance Criteria:**
- [ ] Scrap generates correctly on iOS
- [ ] Scrap generates correctly on Android
- [ ] Scrap generates correctly on web (if applicable)
- [ ] No visual glitches on any platform
- [ ] Persistence works on all platforms
- [ ] No performance issues observed
- [ ] No console errors on any platform

---

### Task SCRAP-4.2: Accessibility Testing

**Type:** Manual Testing
**Dependencies:** SCRAP-4.1
**Priority:** HIGH

**Description:**
Test the scrap counter with screen readers to ensure accessibility compliance.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Testing Steps:**
1. **iOS VoiceOver Testing:**
   - Enable VoiceOver on iOS device/simulator
   - Navigate to scrap counter
   - Verify it reads "Scrap: [number], text"
   - Verify reading order is logical (pet count → scrap → button)
   - Test with different scrap values (0, 150, 999999)

2. **Android TalkBack Testing:**
   - Enable TalkBack on Android device/emulator
   - Navigate to scrap counter
   - Verify it reads "Scrap: [number]"
   - Verify reading order is logical
   - Test with different scrap values

3. **Color Contrast Testing:**
   - Verify black text on white background meets WCAG AA (21:1 ratio)
   - Check text is readable at different font scales

**Acceptance Criteria:**
- [ ] VoiceOver reads scrap counter correctly
- [ ] TalkBack reads scrap counter correctly
- [ ] Reading order is logical on both platforms
- [ ] Text contrast meets WCAG AA standard (21:1)
- [ ] Text is readable at 16px font size
- [ ] accessibilityRole is correctly announced
- [ ] No accessibility warnings in React DevTools

---

### Task SCRAP-4.3: Performance Testing

**Type:** Manual Testing
**Dependencies:** SCRAP-4.1
**Priority:** MEDIUM

**Description:**
Monitor performance metrics to ensure scrap system doesn't degrade app performance.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Testing Steps:**
1. **Monitor CPU Usage:**
   - Use device/simulator performance tools
   - Set petCount to 1000
   - Monitor CPU usage for 5 minutes
   - Verify CPU usage < 1% on average

2. **Monitor Frame Rate:**
   - Enable React DevTools Profiler
   - Set petCount to 100
   - Click feed button rapidly while scrap generates
   - Verify no frame drops (maintain 60 FPS)

3. **Monitor Memory:**
   - Use React DevTools Memory Profiler
   - Run app for 10 minutes with scrap generating
   - Check for memory leaks (should be 0 bytes/hour growth)

4. **Test with High petCount:**
   - Set petCount to 10000
   - Verify scrap still generates smoothly
   - Check for any lag or jank

**Acceptance Criteria:**
- [ ] CPU usage < 1% average
- [ ] No frame drops during normal usage
- [ ] No memory leaks detected
- [ ] App performs smoothly with petCount = 10000
- [ ] Timer precision within ±50ms
- [ ] UI updates occur within 16ms

---

### Task SCRAP-4.4: Edge Case Testing

**Type:** Manual Testing
**Dependencies:** SCRAP-4.1, SCRAP-4.2, SCRAP-4.3
**Priority:** MEDIUM

**Description:**
Test edge cases and unusual scenarios to ensure robustness.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Testing Steps:**
1. **Test App Backgrounding:**
   - Set petCount to 5
   - Note scrap value
   - Background the app for 30 seconds
   - Foreground the app
   - Verify scrap did NOT increase while backgrounded (foreground-only generation)
   - Verify scrap resumes generating after foregrounding

2. **Test Very Long Session:**
   - Set petCount to 10
   - Let app run for 1 hour
   - Verify scrap generates consistently
   - Check for any degradation or errors

3. **Test Rapid App Restarts:**
   - Set petCount to 5
   - Close and reopen app 10 times quickly
   - Verify persistence works correctly each time
   - Check for any data corruption

4. **Test Maximum Scrap Value:**
   - Manually set scrap to Number.MAX_SAFE_INTEGER - 100
   - Set petCount to 10
   - Wait 20 seconds
   - Verify scrap is clamped correctly (doesn't overflow)

**Acceptance Criteria:**
- [ ] No scrap generated while app is backgrounded
- [ ] Scrap resumes when app is foregrounded
- [ ] No errors during long sessions (1+ hour)
- [ ] Persistence is reliable across rapid restarts
- [ ] Maximum scrap value is handled correctly
- [ ] No data corruption in any edge case

---

## Phase 5: Documentation

### Task SCRAP-5.1: Add Code Comments

**Type:** Documentation
**Dependencies:** SCRAP-4.1, SCRAP-4.2, SCRAP-4.3, SCRAP-4.4
**Priority:** LOW

**Description:**
Add explanatory comments to the scrap generation logic to improve maintainability.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Documentation to Add:**
1. **Above useEffect hook:**
   ```typescript
   /**
    * Scrap generation timer
    *
    * Generates scrap passively based on current petCount.
    * Rate: 1 scrap per pet per second
    *
    * Timer runs for the entire component lifetime (empty dependency array).
    * Uses .get() to read latest petCount on each tick (no need to depend on observable).
    * Updates scrap using functional update to avoid race conditions.
    * Cleanup function ensures timer is cleared on unmount.
    */
   ```

2. **Inside timer callback (inline comments):**
   ```typescript
   const petCount = petCount$.get(); // Read current pet count
   const scrapGenerated = petCount * 1; // 1 scrap per pet per second

   // Only update state if scrap would actually be generated
   // This avoids unnecessary state updates, re-renders, and saves when petCount = 0
   if (scrapGenerated > 0) {
     scrap$.set((prev) => prev + scrapGenerated);
   }
   ```

**Acceptance Criteria:**
- [ ] useEffect hook has JSDoc comment explaining purpose
- [ ] Comment explains generation rate (1 scrap/pet/second)
- [ ] Comment explains empty dependency array rationale
- [ ] Comment explains functional update pattern
- [ ] Inline comments explain key logic
- [ ] Comments are clear and concise
- [ ] No excessive or redundant comments

---

### Task SCRAP-5.2: Verify Implementation Against TDD

**Type:** Documentation / Verification
**Dependencies:** SCRAP-5.1
**Priority:** LOW

**Description:**
Review the implementation against the TDD document to ensure all requirements are met and document any deviations.

**Files Involved:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/tdd_scrap_system_20251117.md`
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Review Checklist:**
1. **Component Design (Section 3):**
   - [ ] scrap$ is destructured from useGameState
   - [ ] useEffect with setInterval is implemented
   - [ ] Empty dependency array is used
   - [ ] Cleanup function clears interval
   - [ ] Scrap display has correct styling
   - [ ] Accessibility attributes are correct

2. **State Management (Section 4):**
   - [ ] Functional updates are used
   - [ ] No new state infrastructure created
   - [ ] Auto-persistence works automatically

3. **Timer Implementation (Section 6):**
   - [ ] setInterval with 1000ms interval
   - [ ] Reads petCount using .get()
   - [ ] Calculates scrapGenerated as petCount * 1
   - [ ] Conditional update when scrapGenerated > 0
   - [ ] Cleanup on unmount

4. **Testing (Section 8):**
   - [ ] All test cases from TDD are implemented
   - [ ] Coverage ≥ 85%
   - [ ] Tests use jest.useFakeTimers
   - [ ] Tests run successfully in cmd.exe

5. **Performance (Section 9):**
   - [ ] Timer precision within ±50ms
   - [ ] UI updates within 16ms
   - [ ] No memory leaks
   - [ ] Handles high petCount values

6. **Accessibility (Section 10):**
   - [ ] WCAG 2.1 AA compliant
   - [ ] accessibilityRole="text"
   - [ ] accessibilityLabel includes value
   - [ ] Screen readers work correctly

**Acceptance Criteria:**
- [ ] All TDD requirements are met
- [ ] Any deviations are documented with rationale
- [ ] Implementation matches code examples in TDD
- [ ] All success criteria (Section 16) are satisfied

---

## Completion Checklist

### Functional Requirements
- [ ] Scrap displays on screen with label "Scrap: {value}"
- [ ] Scrap starts at 0 for new players
- [ ] Scrap generates at rate of 1 per pet per second
- [ ] No scrap generated when petCount = 0
- [ ] Scrap persists across app restarts
- [ ] Timer cleans up on component unmount
- [ ] No interference with existing clicking mechanics

### Technical Requirements
- [ ] TypeScript compiles without errors
- [ ] All tests pass in cmd.exe
- [ ] Component test coverage ≥ 85%
- [ ] No new console errors or warnings
- [ ] No memory leaks (verified with profiler)
- [ ] Timer precision within ±50ms

### User Experience Requirements
- [ ] Scrap counter is readable and well-positioned
- [ ] No UI jank or frame drops
- [ ] Works on iOS, Android, and web
- [ ] Accessible to screen reader users
- [ ] Scrap updates visibly every second

### Quality Requirements
- [ ] Code follows project conventions
- [ ] Timer logic is well-commented
- [ ] No linting errors
- [ ] WCAG 2.1 AA compliant

---

## File Paths Reference

**Files to Modify:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Files Referenced (No Changes):**
- `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useGameState.ts`
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.ts`
- `/mnt/c/dev/class-one-rapids/frontend/shared/types/game.ts`

**Project Configuration:**
- `/mnt/c/dev/class-one-rapids/CLAUDE.md` (project guidelines)
- `/mnt/c/dev/class-one-rapids/frontend/package.json` (test scripts)

---

## Next Steps

1. Begin with Phase 1 tasks (UI Integration)
2. Proceed sequentially through phases
3. Run tests after each implementation task
4. Mark tasks as completed in this document
5. Document any issues or deviations

**Ready to Start:** Task SCRAP-1.1

---

**Document Version:** 1.0
**Generated:** 2025-11-17
**Status:** Ready for Execution
