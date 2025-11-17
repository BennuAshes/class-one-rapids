# Core Clicker Flow Implementation Tasks

## Document Metadata

- **Source TDD**: tdd_core_clicker_flow_20251116.md
- **Generated**: 2025-11-16
- **Total Tasks**: 2 (Lean approach - no infrastructure-only tasks)
- **Feature**: Core clicker interaction with "feed" button and counter display

## Architecture Decisions (from TDD Section 2)

Based on codebase exploration in TDD Section 2:

**Components**:
- **CREATE**: frontend/modules/attack-button/ClickerScreen.tsx (NEW component - first feature implementation)
- **CREATE**: frontend/modules/attack-button/ClickerScreen.test.tsx (NEW test file - co-located with component)
- **UPDATE**: frontend/App.tsx (EXISTS - currently shows "Hello World", will render ClickerScreen)
- **CREATE**: frontend/App.test.tsx (NEW - app-level integration tests)

**Hooks**: NONE (per TDD Section 2 - state is local to component, use useState directly)

**Store**: NONE (per TDD Section 2 - no cross-feature state needed, single-screen app)

**File Structure**: Flat structure at frontend/modules/attack-button/ (< 10 items, per file-organization-patterns.md)

**Dependencies**: All satisfied (react-native-safe-area-context already installed, SafeAreaProvider configured in App.tsx)

---

## Phase 1: First User-Visible Feature (MANDATORY - Per Lean Principles)

_Duration: 0.5 days | Priority: P0 | Prerequisites: None_

**LEAN PRINCIPLE**: First task MUST deliver working functionality a user can interact with. NO infrastructure-only tasks. Start with App-level integration tests to drive implementation (TDD Zero Layer).

---

### Task 1.1: Implement Working Clicker Screen with App Integration Tests (TDD Zero Layer)

**ROLE**: You are a senior React Native developer implementing the first user-visible feature using strict Test-Driven Development (TDD)

**CONTEXT**:
- App currently displays "Hello World" placeholder in App.tsx
- SafeAreaProvider is already configured in App.tsx (verified in TDD Section 2)
- This is the first feature - creates the foundation for user interaction
- Must follow TDD approach: App integration tests FIRST, then component tests, then implementation
- Reference: TDD Section 12 "Implementation Plan" Phase 1 (lines 778-800) - App-Level Integration Tests

**OBJECTIVE**:
Create a working clicker interaction where users can:
1. See a counter displaying "Singularity Pet Count: 0" (initially)
2. Tap a "feed" button to increment the counter
3. See the counter update immediately with each tap

**CRITICAL - TDD ZERO LAYER (App Integration Tests First)**:

Before implementing ClickerScreen, write App.test.tsx integration tests. These tests:
- Fail until ClickerScreen module exists (drives creation)
- Catch missing imports immediately (prevents "Unable to resolve" errors)
- Validate component is actually accessible in app
- Test fail until component exists (RED phase)

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing App Integration Tests FIRST

```typescript
// frontend/App.test.tsx - CREATE THIS FILE FIRST (before ClickerScreen exists)
import { render, screen, fireEvent } from '@testing-library/react-native';
import App from './App';

describe('App Integration', () => {
  test('renders without import errors', () => {
    // This test FAILS if ClickerScreen module doesn't exist
    expect(() => render(<App />)).not.toThrow();
  });

  test('displays clicker screen by default', () => {
    render(<App />);

    // Verify ClickerScreen is rendered (not "Hello World")
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('can interact with feed button from app root', () => {
    render(<App />);

    // Verify button exists and is interactive
    const feedButton = screen.getByRole('button', { name: /feed/i });
    fireEvent.press(feedButton);

    // Verify state update works
    expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
  });
});
```

**Run tests - they MUST fail** (ClickerScreen doesn't exist yet). This is the RED phase.

#### Step 2: GREEN - Create Skeleton Component to Pass Import Test

```typescript
// frontend/modules/attack-button/ClickerScreen.tsx - CREATE THIS FILE
import { View, Text } from 'react-native';

export function ClickerScreen() {
  return (
    <View>
      <Text>Placeholder</Text>
    </View>
  );
}
```

```typescript
// frontend/App.tsx - UPDATE THIS FILE
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

**Run tests again** - import test should PASS, behavior tests still FAIL.

#### Step 3: RED - Write Component Unit Tests

```typescript
// frontend/modules/attack-button/ClickerScreen.test.tsx - CREATE THIS FILE
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ClickerScreen } from './ClickerScreen';

describe('ClickerScreen', () => {
  describe('Initial Render', () => {
    test('displays "Singularity Pet Count" label', () => {
      render(<ClickerScreen />);
      expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
    });

    test('displays initial count of zero', () => {
      render(<ClickerScreen />);
      expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
    });

    test('displays feed button', () => {
      render(<ClickerScreen />);
      const feedButton = screen.getByRole('button', { name: /feed/i });
      expect(feedButton).toBeTruthy();
    });

    test('feed button contains text "feed"', () => {
      render(<ClickerScreen />);
      const feedButton = screen.getByRole('button', { name: /feed/i });
      expect(feedButton).toHaveTextContent(/feed/i);
    });
  });

  describe('Button Interaction', () => {
    test('increments count by 1 when feed button is pressed', () => {
      render(<ClickerScreen />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      fireEvent.press(feedButton);

      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });

    test('increments count multiple times', () => {
      render(<ClickerScreen />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      fireEvent.press(feedButton);
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);

      expect(screen.getByText(/Singularity Pet Count: 3/i)).toBeTruthy();
    });

    test('handles rapid tapping accurately', () => {
      render(<ClickerScreen />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      // Simulate 10 rapid taps
      for (let i = 0; i < 10; i++) {
        fireEvent.press(feedButton);
      }

      expect(screen.getByText(/Singularity Pet Count: 10/i)).toBeTruthy();
    });

    test('count persists across multiple increments', () => {
      render(<ClickerScreen />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      fireEvent.press(feedButton); // count = 1
      expect(screen.getByText(/1/i)).toBeTruthy();

      fireEvent.press(feedButton); // count = 2
      expect(screen.getByText(/2/i)).toBeTruthy();

      fireEvent.press(feedButton); // count = 3
      expect(screen.getByText(/3/i)).toBeTruthy();
    });
  });

  describe('Counter Display', () => {
    test('formats count correctly with no leading zeros', () => {
      render(<ClickerScreen />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      fireEvent.press(feedButton);

      expect(screen.queryByText(/Singularity Pet Count: 01/i)).toBeNull();
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });

    test('handles large numbers without visual breaking', () => {
      render(<ClickerScreen />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      // Simulate reaching 100+
      for (let i = 0; i < 150; i++) {
        fireEvent.press(feedButton);
      }

      expect(screen.getByText(/Singularity Pet Count: 150/i)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    test('feed button has correct accessibility role', () => {
      render(<ClickerScreen />);
      const feedButton = screen.getByRole('button', { name: /feed/i });
      expect(feedButton.props.accessibilityRole).toBe('button');
    });

    test('feed button has accessible label', () => {
      render(<ClickerScreen />);
      const feedButton = screen.getByRole('button', { name: /feed/i });
      expect(feedButton.props.accessibilityLabel).toMatch(/feed/i);
    });

    test('counter has text accessibility role', () => {
      render(<ClickerScreen />);
      const counter = screen.getByText(/Singularity Pet Count/i);
      expect(counter.props.accessibilityRole).toBe('text');
    });

    test('counter has dynamic accessibility label with count', () => {
      render(<ClickerScreen />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      fireEvent.press(feedButton);

      const counter = screen.getByText(/Singularity Pet Count: 1/i);
      expect(counter.props.accessibilityLabel).toMatch(/Singularity Pet Count: 1/);
    });
  });

  describe('Layout', () => {
    test('renders without SafeAreaView errors', () => {
      // SafeAreaProvider must be wrapping in App.tsx
      expect(() => render(<ClickerScreen />)).not.toThrow();
    });

    test('button and counter are both visible', () => {
      render(<ClickerScreen />);

      expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
      expect(screen.getByRole('button', { name: /feed/i })).toBeTruthy();
    });
  });
});
```

**Run tests - they MUST fail** (ClickerScreen is still skeleton). This is the RED phase.

#### Step 4: GREEN - Implement Minimal Working Feature

```typescript
// frontend/modules/attack-button/ClickerScreen.tsx - UPDATE THIS FILE
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ClickerScreen() {
  const [count, setCount] = useState(0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text
          style={styles.counterText}
          accessibilityRole="text"
          accessibilityLabel={`Singularity Pet Count: ${count}`}
        >
          Singularity Pet Count: {count}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={() => setCount(prev => prev + 1)}
          accessibilityRole="button"
          accessibilityLabel="feed button"
        >
          <Text style={styles.buttonText}>feed</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  counterText: {
    fontSize: 18,
    marginBottom: 30,
    color: '#000000',
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

**Run tests - all tests should PASS**. This is the GREEN phase.

#### Step 5: REFACTOR - Code Quality (if needed)

The implementation is already clean and follows best practices:
- Uses functional setState `prev => prev + 1` for accuracy (TDD Section 3 line 153)
- Meets accessibility standards: 44x44pt minimum touch target (TDD Section 3 line 176)
- Screen reader support with proper roles and labels (TDD Section 3 lines 180-183)
- SafeAreaView for notch handling (TDD Section 3 lines 156-159)
- Pressable for modern touch handling (TDD Section 3 line 923)

**Run tests again - all tests still PASS**. Refactoring complete.

**FILES TO CREATE** (based on TDD Section 2):

- **CREATE**: frontend/App.test.tsx
  - Reason: App-level integration tests (TDD Zero Layer - Section 12 lines 461-509)
  - Tests verify ClickerScreen can be imported and works in app context

- **CREATE**: frontend/modules/attack-button/ClickerScreen.tsx
  - Reason: First feature component (documented in TDD Section 2 lines 93-95)
  - Location: frontend/modules/attack-button/ (module name from existing specs directory)
  - Structure: Flat organization (< 10 items per file-organization-patterns.md)

- **CREATE**: frontend/modules/attack-button/ClickerScreen.test.tsx
  - Reason: Co-located component tests (file-organization-patterns.md - NO __tests__ folders)
  - Tests verify component behavior in isolation

**FILES TO UPDATE** (based on TDD Section 2):

- **UPDATE**: frontend/App.tsx
  - Reason: Entry point needs to render ClickerScreen (documented in TDD Section 2 lines 105-109)
  - Changes: Replace "Hello World" with ClickerScreen import and render

**NO FILES/FOLDERS TO CREATE**:
- NO custom hooks (TDD Section 2 lines 97-100 - state is local to component)
- NO stores (TDD Section 2 lines 102-103 - single-screen app, no cross-feature state)
- NO separate components folder (flat structure for < 10 items)
- NO specs folder (already exists from PRD/TDD generation)

**DEPENDENCIES**:
- None to add - react-native-safe-area-context already installed (verified in TDD Section 2 line 766)

**ACCEPTANCE CRITERIA**:
- [ ] App.test.tsx created with 3 integration tests (all passing)
- [ ] ClickerScreen.test.tsx created with 17 unit tests (all passing)
- [ ] ClickerScreen.tsx implements complete feature (all tests green)
- [ ] App.tsx renders ClickerScreen instead of "Hello World"
- [ ] User can tap "feed" button and see counter increment
- [ ] Counter displays "Singularity Pet Count: [number]" format
- [ ] Button has minimum 44x44pt touch target (WCAG compliance)
- [ ] Screen reader announces counter value correctly
- [ ] Rapid tapping is 100% accurate (no missed increments)
- [ ] Visual feedback on button press (opacity change)
- [ ] SafeAreaView handles notches/home indicators
- [ ] All 20 tests pass (3 App integration + 17 component unit tests)

**TESTING REQUIREMENTS** (from TDD Section 8):

Per CLAUDE.md: "Don't make tests just for hooks, they should be tested through the component that uses them"
Per TDD Section 8: Use React Native Testing Library (docs/research/react_native_testing_library_guide_20250918_184418.md)

Test execution:
```bash
# Run tests using cmd.exe (per CLAUDE.md - faster on WSL)
cmd.exe /c "npx jest App.test.tsx"
cmd.exe /c "npx jest ClickerScreen.test.tsx"
```

Expected coverage: > 80% for ClickerScreen.tsx (TDD Section 8 line 671)

**VISUAL/UI SPECIFICATIONS**:

| Property | Value | Notes |
|----------|-------|-------|
| **Counter Font Size** | 18px | WCAG large text minimum |
| **Counter Color** | #000000 (black) | 21:1 contrast ratio on white |
| **Button Size** | 44x44px minimum | WCAG AA touch target requirement |
| **Button Color** | #007AFF (iOS blue) | Platform standard |
| **Button Pressed** | 0.7 opacity | iOS standard feedback |
| **Button Text** | "feed" (lowercase) | Per PRD FR-3 line 141 |
| **Counter Format** | "Singularity Pet Count: {count}" | Per PRD FR-5 line 145 |
| **Layout** | Vertical flexbox, centered | Counter above button |
| **Background** | White (#FFFFFF) | Clean, accessible |
| **Safe Areas** | Top and bottom edges | Notch/home indicator handling |

**SUCCESS METRICS** (from TDD Section 3):
- Button press to counter update: < 100ms (synchronous state update)
- UI framerate during interaction: 60fps (React Native default)
- Zero missed increments during rapid tapping (verified by tests)
- Touch target size: 44x44pt (enforced in StyleSheet)
- Text contrast: 21:1 ratio (black on white)
- Test coverage: > 80% (verified by Jest coverage report)

**DELIVERABLE**:
Working clicker screen where users can tap "feed" button to increment "Singularity Pet Count" with immediate visual feedback. Feature is fully tested (20+ tests), accessible (WCAG AA compliant), and performant (< 100ms response).

**DEPENDENCIES**: None (all required infrastructure exists per TDD Section 2)

**POTENTIAL BLOCKERS**: None (TDD Section 11 confirms all dependencies satisfied)

---

## Phase 2: Manual Validation & Polish

_Duration: 0.25 days | Priority: P1 | Prerequisites: Task 1.1_

**LEAN PRINCIPLE**: Validate working feature with real device testing, add polish only if needed based on feedback.

---

### Task 2.1: Device Testing and Visual Polish

**ROLE**: You are a QA engineer and UX designer validating the feature on real devices

**CONTEXT**:
- Clicker feature is implemented and all automated tests pass
- Need to verify real-world usability and accessibility
- Reference: TDD Section 12 "Implementation Plan" Phase 3, Iteration 8 (lines 866-871)

**OBJECTIVE**:
Validate the feature works correctly on iOS and Android devices, and add visual polish if needed based on testing feedback.

**MANUAL TESTING STEPS**:

#### Step 1: Run App on Device

```bash
# Start Expo development server
npx expo start

# Test on iOS (if available)
# - Press 'i' to open iOS simulator
# - Or scan QR code with Expo Go app

# Test on Android (if available)
# - Press 'a' to open Android emulator
# - Or scan QR code with Expo Go app
```

#### Step 2: Functional Testing

Manually verify:
- [ ] Counter displays "Singularity Pet Count: 0" on initial load
- [ ] Tapping "feed" button increments counter to 1, 2, 3, etc.
- [ ] Counter updates immediately (< 100ms perceived delay)
- [ ] Rapid tapping accurately counts all taps (no missed increments)
- [ ] Button shows visual feedback when pressed (opacity change)
- [ ] Large numbers display correctly (test up to 1000+)
- [ ] No visual breaking or layout issues
- [ ] Safe area insets work correctly (no overlap with notch/home indicator)

#### Step 3: Accessibility Testing (iOS VoiceOver)

```bash
# Enable VoiceOver: Settings > Accessibility > VoiceOver > On
# Or triple-click home/side button if configured
```

Verify with VoiceOver enabled:
- [ ] Counter announces "Singularity Pet Count: [number]" when focused
- [ ] Button announces "feed button" when focused
- [ ] Button is recognized as a button element
- [ ] Counter updates are announced after button press
- [ ] All interactive elements are reachable with swipe gestures

#### Step 4: Accessibility Testing (Android TalkBack)

```bash
# Enable TalkBack: Settings > Accessibility > TalkBack > On
```

Verify with TalkBack enabled:
- [ ] Same accessibility requirements as VoiceOver
- [ ] Touch targets are large enough (44x44pt minimum)
- [ ] Visual focus indicators work correctly

#### Step 5: Visual Polish (if needed)

Based on device testing feedback, optionally add:
- Adjust colors if contrast is insufficient on actual devices
- Improve button styling if visual feedback is unclear
- Tweak spacing if layout feels cramped
- Add animations if interaction feels too static (out of scope per TDD Section 13 line 943)

**IMPORTANT**: Only make changes if device testing reveals actual issues. Do not add features not in TDD.

#### Step 6: Performance Verification

Use React DevTools Profiler (optional):
```bash
# Install React DevTools
# npm install -g react-devtools

# Run devtools
# react-devtools

# Profile button taps and verify:
# - Render time < 16ms (60fps requirement)
# - No unnecessary re-renders
# - Smooth animations (if added)
```

**FILES TO UPDATE** (only if issues found):

- **UPDATE (if needed)**: frontend/modules/attack-button/ClickerScreen.tsx
  - Reason: Address issues discovered during device testing
  - Changes: Only visual/UX improvements based on testing feedback
  - Must maintain all passing tests

**ACCEPTANCE CRITERIA**:
- [ ] App runs without errors on iOS (simulator or device)
- [ ] App runs without errors on Android (emulator or device)
- [ ] All functional requirements verified manually
- [ ] VoiceOver/TalkBack accessibility verified (if devices available)
- [ ] Performance is smooth (60fps, < 100ms response)
- [ ] No visual breaking or layout issues on different screen sizes
- [ ] All automated tests still pass after any polish changes
- [ ] Feature is ready for user demo/feedback

**TESTING REQUIREMENTS**:

If any changes are made based on device testing:
```bash
# Re-run all automated tests to ensure nothing broke
cmd.exe /c "npx jest App.test.tsx ClickerScreen.test.tsx"

# Verify test coverage is still > 80%
cmd.exe /c "npx jest --coverage frontend/modules/attack-button/"
```

**DELIVERABLE**:
Validated, polished clicker feature that works smoothly on real devices with confirmed accessibility support. Ready for user demo and feedback.

**DEPENDENCIES**: Task 1.1 complete (all tests passing)

**POTENTIAL BLOCKERS**:
- No iOS/Android devices available (can skip device testing, automated tests sufficient for MVP)
- VoiceOver/TalkBack testing requires physical devices or simulators
- Visual polish is optional and should be minimal (avoid scope creep)

---

## Task Execution Guidelines

### For Human Developers

1. **Execute tasks sequentially** (Task 1.1 must complete before Task 2.1)
2. **Follow TDD discipline strictly** (write tests before implementation)
3. **Update task status**: Not Started → In Progress → Complete
4. **Run tests frequently** (after each code change in TDD cycle)
5. **Do not skip App integration tests** (TDD Zero Layer is mandatory)

### For AI Agents

1. **Validate prerequisites** before starting each task
2. **Execute TDD cycles in exact order** (RED → GREEN → REFACTOR)
3. **Run validation commands** after each phase
4. **Report completion with evidence** (test output, file paths)
5. **Escalate if tests fail** (do not proceed to next task)

### Test Execution

Per CLAUDE.md: "Use cmd.exe to run jest tests because of slowness related to wsl and windows"

```bash
# Run App integration tests
cmd.exe /c "npx jest App.test.tsx"

# Run ClickerScreen unit tests
cmd.exe /c "npx jest ClickerScreen.test.tsx"

# Run all tests together
cmd.exe /c "npx jest App.test.tsx ClickerScreen.test.tsx"

# Run with coverage
cmd.exe /c "npx jest --coverage frontend/modules/attack-button/"
```

---

## Summary Statistics

- **Total Tasks**: 2 (following lean principles - no infrastructure-only tasks)
- **Critical Path Tasks**: Task 1.1 (Task 2.1 depends on it)
- **Parallel Execution Potential**: 0% (tasks must run sequentially)
- **Risk Coverage**: 100% (all risks from TDD Section 11 addressed)
- **Test Count**: 20 tests (3 App integration + 17 component unit tests)
- **Files Created**: 3 (App.test.tsx, ClickerScreen.tsx, ClickerScreen.test.tsx)
- **Files Updated**: 1 (App.tsx)
- **Dependencies Added**: 0 (all required packages already installed)
- **Estimated Duration**: 0.75 days (0.5 days implementation + 0.25 days validation)

---

## Lean Principles Applied

This task list follows lean-task-generation-guide.md principles:

✅ **No Infrastructure-Only Tasks**: Task 1.1 delivers working functionality immediately
✅ **First Task Delivers User-Visible Feature**: User can tap button and see counter increment
✅ **Just-In-Time Everything**: No folders/dependencies created until needed
✅ **Every Task Demo-able**: Both tasks produce shippable, testable functionality
✅ **Minimal Task Count**: 2 tasks instead of separate setup/implementation/testing phases
✅ **TDD-First Approach**: Tests written before implementation in every cycle
✅ **Modify Existing Files**: App.tsx updated rather than creating new entry points

---

## TDD Compliance

This task list follows TDD requirements from Section 8 and Section 12:

✅ **Red-Green-Refactor Cycle**: Enforced in Task 1.1 implementation steps
✅ **App Integration Tests First**: TDD Zero Layer (Task 1.1 Step 1)
✅ **Component Unit Tests Second**: TDD First Layer (Task 1.1 Step 3)
✅ **Implementation Last**: Only after tests are written and failing
✅ **No Hooks Tests**: Hooks tested through components (per CLAUDE.md)
✅ **React Native Testing Library**: Used for all test implementations
✅ **Coverage Target**: > 80% for ClickerScreen.tsx

---

_Generated from TDD: tdd_core_clicker_flow_20251116.md_
_Generation timestamp: 2025-11-16_
_Optimized for: AI agent execution with strict TDD discipline_
_Architecture: Lean, feature-based, test-driven development_
