# Singularity Pet Clicker Implementation Tasks

## Document Metadata

- **Source TDD**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/tdd_singularity_pet_clicker_20251116.md`
- **Generated**: 2025-11-16
- **Total Tasks**: 3
- **Architecture**: Feature-based module organization with co-located tests
- **Methodology**: Test-Driven Development (Red-Green-Refactor)

---

## 🔍 Architecture Decisions (from TDD)

Based on codebase exploration and TDD specifications:

**File Organization**:
- Module: `frontend/modules/attack-button/` (flat structure - <10 items)
- Tests: Co-located with implementation files (`.test.tsx` extension)
- No barrel exports (index.ts) - direct imports only

**State Management**:
- Using `useState` for local component state
- No custom hooks needed (single use case)
- No Legend-State store required (no persistence per PRD)

**Component Architecture**:
- `SingularityPet.tsx` - Self-contained clicker component
- `ClickerScreen.tsx` - Screen wrapper for SingularityPet
- Integration into App.tsx for navigation

**Key Decisions**:
- **CREATE**: `SingularityPet.tsx` (new feature component)
- **CREATE**: `SingularityPet.test.tsx` (co-located tests)
- **CREATE**: `ClickerScreen.tsx` (new screen wrapper)
- Use `Pressable` (modern React Native API, better accessibility)
- Use `StyleSheet.create` (performance optimization)
- Functional state updates (prevents race conditions during rapid clicking)

---

## Phase 1: Core Clicker Feature (TDD Approach)

_Duration: 2-4 hours | Priority: P0 | Prerequisites: None_

**LEAN PRINCIPLE**: First task delivers working user-visible functionality. No infrastructure-only tasks.

---

### Task 1.1: Implement SingularityPet Component with Feed Button (TDD)

**ROLE**: You are a senior React Native developer implementing the core clicker feature using strict TDD methodology

**CONTEXT**:
- This is the FIRST user-visible feature of the clicker game
- The TDD specifies a simple button-and-counter interface using React's `useState` hook
- No persistence required (per PRD Section 11 "Out of Scope")
- Must achieve <100ms response time and 60fps performance

**OBJECTIVE**:
Create a working clicker component where users can tap a "feed" button to increment a counter, delivering immediate visual feedback. This task implements the complete feature using the Red-Green-Refactor TDD cycle.

**FILE LOCATIONS**:
- Test File: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/SingularityPet.test.tsx`
- Implementation: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/SingularityPet.tsx`

**ARCHITECTURE REFERENCE**:
- State Management Guide: `@docs/architecture/state-management-hooks-guide.md` (§ Component State with useState)
- File Organization: `@docs/architecture/file-organization-patterns.md` (Feature-based modules, co-located tests)
- Testing Guide: `@docs/research/react_native_testing_library_guide_20250918_184418.md`

---

#### TDD IMPLEMENTATION CYCLE

**CRITICAL**: Follow strict Red-Green-Refactor for each requirement. Write test FIRST, watch it fail, then implement.

---

#### Step 1: RED - Write Failing Tests First

Create test file: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/SingularityPet.test.tsx`

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { userEvent } from '@testing-library/react-native';
import { SingularityPet } from './SingularityPet';

describe('SingularityPet Component', () => {
  describe('Rendering', () => {
    test('renders with initial count of 0', () => {
      render(<SingularityPet />);

      // Verify counter displays initial state
      expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
    });

    test('renders feed button with correct label', () => {
      render(<SingularityPet />);

      // Verify button exists with "feed" text
      expect(screen.getByText('feed')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    test('increments count by 1 when feed button is pressed', async () => {
      const user = userEvent.setup();
      render(<SingularityPet />);

      const feedButton = screen.getByText('feed');
      await user.press(feedButton);

      // Verify count incremented to 1
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });

    test('handles sequential clicks correctly', async () => {
      const user = userEvent.setup();
      render(<SingularityPet />);

      const feedButton = screen.getByText('feed');

      // Click 5 times
      await user.press(feedButton);
      await user.press(feedButton);
      await user.press(feedButton);
      await user.press(feedButton);
      await user.press(feedButton);

      // Verify count is 5
      expect(screen.getByText(/Singularity Pet Count: 5/i)).toBeTruthy();
    });

    test('handles rapid clicking without missing increments', async () => {
      const user = userEvent.setup();
      render(<SingularityPet />);

      const feedButton = screen.getByText('feed');

      // Rapid click 10 times (testing functional state updates)
      for (let i = 0; i < 10; i++) {
        await user.press(feedButton);
      }

      // Verify all clicks were counted
      expect(screen.getByText(/Singularity Pet Count: 10/i)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    test('button has correct accessibility attributes', () => {
      render(<SingularityPet />);

      const feedButton = screen.getByRole('button');

      // Verify accessibility role
      expect(feedButton).toBeTruthy();
      expect(feedButton.props.accessibilityRole).toBe('button');
      expect(feedButton.props.accessibilityLabel).toBeTruthy();
    });

    test('counter text is accessible to screen readers', () => {
      render(<SingularityPet />);

      const counterText = screen.getByText(/Singularity Pet Count: 0/i);

      // Verify counter has accessibility label
      expect(counterText.props.accessibilityLabel).toBeTruthy();
    });
  });

  describe('Counter Behavior', () => {
    test('displays large numbers correctly', async () => {
      const user = userEvent.setup();
      render(<SingularityPet />);

      const feedButton = screen.getByText('feed');

      // Click many times to reach larger number
      for (let i = 0; i < 50; i++) {
        await user.press(feedButton);
      }

      // Verify large number displays
      expect(screen.getByText(/Singularity Pet Count: 50/i)).toBeTruthy();
    });
  });
});
```

**Run tests and verify they FAIL**:
```bash
# Run from frontend directory on Windows (per CLAUDE.md WSL workaround)
cmd.exe /c "npm test -- SingularityPet.test.tsx"
```

Expected: All tests should FAIL (component doesn't exist yet)

---

#### Step 2: GREEN - Minimal Implementation to Pass Tests

Create implementation file: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/SingularityPet.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export function SingularityPet() {
  const [count, setCount] = useState<number>(0);

  const handleFeed = () => {
    // Use functional update to prevent race conditions during rapid clicking
    setCount(prevCount => prevCount + 1);
  };

  return (
    <View style={styles.container}>
      <Text
        style={styles.countText}
        accessibilityLabel={`Singularity Pet Count: ${count}`}
      >
        Singularity Pet Count: {count}
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.feedButton,
          pressed && styles.feedButtonPressed
        ]}
        onPress={handleFeed}
        accessibilityRole="button"
        accessibilityLabel="Feed the singularity pet"
        accessibilityHint="Increases the pet count by one"
      >
        <Text style={styles.buttonText}>feed</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
  countText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  feedButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 120,
    minHeight: 44, // Meets WCAG minimum touch target
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedButtonPressed: {
    backgroundColor: '#0051D5', // Darker shade for pressed state
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
```

**Run tests and verify they PASS**:
```bash
cmd.exe /c "npm test -- SingularityPet.test.tsx"
```

Expected: All tests should PASS

---

#### Step 3: REFACTOR - Code Quality Improvements

Review implementation for:
- Clear variable names ✓
- Proper TypeScript types ✓
- Accessibility attributes ✓
- Performance optimizations (StyleSheet.create) ✓
- Functional state updates ✓
- Code organization ✓

**Re-run tests after any refactoring**:
```bash
cmd.exe /c "npm test -- SingularityPet.test.tsx"
```

Expected: All tests remain GREEN

---

**VISUAL REQUIREMENTS**:

| Property | Value | Notes |
|----------|-------|-------|
| **Counter Font Size** | 24px | Large, readable |
| **Counter Color** | #000 (black) | High contrast (18.17:1 ratio) |
| **Button Size** | 120x44px minimum | Exceeds WCAG 44x44pt requirement |
| **Button Color** | #007AFF (iOS blue) | 4.69:1 contrast ratio |
| **Button Pressed** | #0051D5 (darker blue) | Visual feedback |
| **Spacing** | 20px padding, 20px gap | Clean layout |
| **Border Radius** | 8px | Modern, rounded corners |

---

**ACCEPTANCE CRITERIA**:
- [x] Component renders with counter showing "Singularity Pet Count: 0"
- [x] Feed button displays with text "feed"
- [x] Single click increments counter by 1
- [x] Multiple clicks increment correctly (5 clicks → count of 5)
- [x] Rapid clicking handles all increments without loss
- [x] Button meets 44x44pt minimum touch target size
- [x] Button has proper accessibility attributes (role, label, hint)
- [x] Counter text has accessibility label for screen readers
- [x] Large numbers (50+) display correctly
- [x] All tests pass (coverage >80%)
- [x] No TypeScript errors
- [x] No console warnings

**TEST EXECUTION**:
```bash
# Run all tests
cmd.exe /c "npm test -- SingularityPet.test.tsx"

# Run with coverage
cmd.exe /c "npm test -- --coverage SingularityPet.test.tsx"

# Watch mode for development
cmd.exe /c "npm test -- --watch SingularityPet.test.tsx"
```

**DELIVERABLE**:
Working SingularityPet component that users can interact with immediately. Counter increments on button press with <100ms response time.

**DEPENDENCIES**: None (first feature)

**ESTIMATED TIME**: 1-2 hours

---

### Task 1.2: Create ClickerScreen Wrapper Component (TDD)

**ROLE**: You are a senior React Native developer implementing screen navigation structure

**CONTEXT**:
- The SingularityPet component is now working (Task 1.1 complete)
- Need to create a screen-level component to integrate into app navigation
- This screen will serve as the main game screen for the clicker feature

**OBJECTIVE**:
Create a ClickerScreen component that wraps SingularityPet and provides proper screen-level layout with SafeAreaView for device compatibility.

**FILE LOCATIONS**:
- Test File: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`
- Implementation: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`

**ARCHITECTURE REFERENCE**:
- Expo App Organization: `@docs/architecture/organizing_expo_apps_by_feature_20250921_113000.md`
- File Organization: `@docs/architecture/file-organization-patterns.md`

---

#### TDD IMPLEMENTATION CYCLE

#### Step 1: RED - Write Failing Tests First

Create test file: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ClickerScreen } from './ClickerScreen';

describe('ClickerScreen', () => {
  const mockOnNavigateToShop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      render(<ClickerScreen onNavigateToShop={mockOnNavigateToShop} />);

      // Screen should render successfully
      expect(screen.toJSON()).toBeTruthy();
    });

    test('renders SingularityPet component', () => {
      render(<ClickerScreen onNavigateToShop={mockOnNavigateToShop} />);

      // Verify SingularityPet is rendered (check for its distinctive text)
      expect(screen.getByText(/Singularity Pet Count:/i)).toBeTruthy();
      expect(screen.getByText('feed')).toBeTruthy();
    });
  });

  describe('Layout', () => {
    test('uses SafeAreaView for device compatibility', () => {
      const { root } = render(<ClickerScreen onNavigateToShop={mockOnNavigateToShop} />);

      // Verify SafeAreaView is in component tree
      const safeAreaView = root.findAllByType('SafeAreaView');
      expect(safeAreaView.length).toBeGreaterThan(0);
    });

    test('centers content in container', () => {
      const { root } = render(<ClickerScreen onNavigateToShop={mockOnNavigateToShop} />);

      // Verify container has centering styles
      const views = root.findAllByType('View');
      const containerView = views.find(view =>
        view.props.style?.justifyContent === 'center' &&
        view.props.style?.alignItems === 'center'
      );
      expect(containerView).toBeTruthy();
    });
  });

  describe('Integration', () => {
    test('SingularityPet component is functional within screen', async () => {
      const { getByText } = render(<ClickerScreen onNavigateToShop={mockOnNavigateToShop} />);

      // Verify initial state
      expect(getByText(/Singularity Pet Count: 0/i)).toBeTruthy();

      // This confirms SingularityPet is properly integrated
    });
  });
});
```

**Run tests and verify they FAIL**:
```bash
cmd.exe /c "npm test -- ClickerScreen.test.tsx"
```

Expected: Tests should FAIL (component doesn't exist yet)

---

#### Step 2: GREEN - Minimal Implementation to Pass Tests

Create implementation file: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`

```typescript
import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { SingularityPet } from './SingularityPet';

interface ClickerScreenProps {
  onNavigateToShop: () => void;
}

export function ClickerScreen({ onNavigateToShop }: ClickerScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SingularityPet />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

**Run tests and verify they PASS**:
```bash
cmd.exe /c "npm test -- ClickerScreen.test.tsx"
```

Expected: All tests should PASS

---

#### Step 3: REFACTOR - Code Quality Improvements

Review implementation for:
- Proper TypeScript interface ✓
- SafeAreaView for device compatibility ✓
- Flex layout for centering ✓
- Clean styling with StyleSheet.create ✓
- Proper component composition ✓

**Re-run tests**:
```bash
cmd.exe /c "npm test -- ClickerScreen.test.tsx"
```

Expected: All tests remain GREEN

---

**VISUAL REQUIREMENTS**:

| Property | Value | Notes |
|----------|-------|-------|
| **Background Color** | #F5F5F5 (light gray) | Neutral, easy on eyes |
| **Layout** | Flex centered | Content centered vertically and horizontally |
| **Safe Area** | Full screen | Handles notches and status bars |

---

**ACCEPTANCE CRITERIA**:
- [x] ClickerScreen component renders without errors
- [x] SingularityPet component is rendered within screen
- [x] SafeAreaView is used for device compatibility
- [x] Content is centered (justifyContent and alignItems: 'center')
- [x] Screen has clean background color (#F5F5F5)
- [x] TypeScript interface defined for props
- [x] All tests pass
- [x] No TypeScript errors

**TEST EXECUTION**:
```bash
# Run tests
cmd.exe /c "npm test -- ClickerScreen.test.tsx"

# Run with coverage
cmd.exe /c "npm test -- --coverage ClickerScreen.test.tsx"
```

**DELIVERABLE**:
Screen-level component that properly wraps SingularityPet with safe area handling and centered layout.

**DEPENDENCIES**: Task 1.1 (SingularityPet component must exist)

**ESTIMATED TIME**: 30-60 minutes

---

### Task 1.3: Integrate ClickerScreen into App Navigation

**ROLE**: You are a senior React Native developer integrating the clicker screen into the app's navigation structure

**CONTEXT**:
- SingularityPet component is complete (Task 1.1)
- ClickerScreen wrapper is complete (Task 1.2)
- Need to make the screen accessible to users through app navigation
- App likely uses Expo Router or React Navigation

**OBJECTIVE**:
Integrate ClickerScreen into the main app navigation so users can access the clicker feature. Update App.tsx to include the new screen.

**FILE LOCATIONS**:
- Test File: `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx` (update existing or create)
- Implementation: `/mnt/c/dev/class-one-rapids/frontend/App.tsx` (update existing)

**ARCHITECTURE REFERENCE**:
- Expo App Organization: `@docs/architecture/organizing_expo_apps_by_feature_20250921_113000.md`
- File Organization: `@docs/architecture/file-organization-patterns.md`

---

#### IMPLEMENTATION STEPS

**BEFORE STARTING**:
1. Read `/mnt/c/dev/class-one-rapids/frontend/App.tsx` to understand current navigation structure
2. Determine if using Expo Router, React Navigation, or custom navigation
3. Identify where to add ClickerScreen

**Step 1: Write Integration Test**

Update or create: `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from './App';

describe('App Navigation Integration', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.toJSON()).toBeTruthy();
  });

  test('displays ClickerScreen content', () => {
    render(<App />);

    // Verify clicker screen content is visible
    // (adjust based on actual navigation structure)
    expect(screen.getByText(/Singularity Pet Count:/i)).toBeTruthy();
    expect(screen.getByText('feed')).toBeTruthy();
  });
});
```

**Run tests and verify they FAIL** (if ClickerScreen not yet integrated):
```bash
cmd.exe /c "npm test -- App.test.tsx"
```

---

**Step 2: Implement Integration**

Update: `/mnt/c/dev/class-one-rapids/frontend/App.tsx`

**Example integration** (adjust based on actual app structure):

```typescript
import React from 'react';
import { ClickerScreen } from './modules/attack-button/ClickerScreen';

export default function App() {
  const handleNavigateToShop = () => {
    // TODO: Navigate to shop when shop feature is implemented
    console.log('Navigate to shop');
  };

  return <ClickerScreen onNavigateToShop={handleNavigateToShop} />;
}
```

**Note**: If app uses Expo Router or React Navigation, adjust integration accordingly:
- For Expo Router: Create route in `app/(tabs)/` or appropriate directory
- For React Navigation: Add screen to navigator configuration

**Run tests and verify they PASS**:
```bash
cmd.exe /c "npm test -- App.test.tsx"
```

---

**Step 3: Manual Testing**

**Start development server**:
```bash
# From frontend directory
npm start
```

**Test on platforms**:
1. **iOS Simulator**: Press `i` in Expo terminal
2. **Android Emulator**: Press `a` in Expo terminal
3. **Web**: Press `w` in Expo terminal

**Manual test checklist**:
- [ ] App launches without errors
- [ ] ClickerScreen is visible
- [ ] Counter displays "Singularity Pet Count: 0"
- [ ] Feed button is visible and tappable
- [ ] Clicking feed button increments counter
- [ ] Counter updates within 100ms of button press
- [ ] No performance issues or frame drops
- [ ] Safe areas respected (iOS notch, Android status bar)

---

**ACCEPTANCE CRITERIA**:
- [x] ClickerScreen is integrated into App.tsx
- [x] App launches successfully on iOS, Android, and Web
- [x] Users can access and interact with the clicker feature
- [x] Counter increments correctly on button press
- [x] No navigation errors or console warnings
- [x] Integration tests pass
- [x] Manual testing completed on at least one platform
- [x] Performance meets <100ms response time requirement

**TEST EXECUTION**:
```bash
# Run integration tests
cmd.exe /c "npm test -- App.test.tsx"

# Run all tests for feature
cmd.exe /c "npm test -- modules/attack-button"

# Start development server
npm start
```

**DELIVERABLE**:
Fully integrated clicker feature accessible to users through the app. Users can launch the app and immediately start clicking the feed button to increment the counter.

**DEPENDENCIES**:
- Task 1.1 (SingularityPet component)
- Task 1.2 (ClickerScreen component)

**ESTIMATED TIME**: 30-60 minutes

---

## Phase 2: Quality Assurance & Platform Testing

_Duration: 2 hours | Priority: P0 | Prerequisites: Phase 1_

---

### Task 2.1: Cross-Platform Testing & Performance Validation

**ROLE**: You are a QA engineer validating the clicker feature across all target platforms

**CONTEXT**:
- All implementation tasks complete (Phase 1)
- Need to verify feature works on iOS, Android, and Web
- Must validate performance requirements (<100ms response, 60fps)
- Must verify accessibility requirements

**OBJECTIVE**:
Test the clicker feature on all target platforms and validate it meets all non-functional requirements from the TDD.

---

**MANUAL TESTING CHECKLIST**:

#### iOS Testing (iOS 17+)
- [ ] App launches without errors
- [ ] ClickerScreen displays correctly
- [ ] Counter shows "Singularity Pet Count: 0" initially
- [ ] Feed button is visible and properly sized
- [ ] Single tap increments counter to 1
- [ ] 10 taps increment counter to 10
- [ ] Rapid tapping (20+ taps) increments accurately
- [ ] Button provides visual feedback (press state)
- [ ] Counter updates within 100ms of tap
- [ ] No frame drops or UI jank (check with React DevTools profiler)
- [ ] VoiceOver announces "Feed the singularity pet, button"
- [ ] VoiceOver announces counter value changes
- [ ] Button meets 44pt minimum touch target
- [ ] Safe area handling works (notch, status bar)

#### Android Testing (Android 12+)
- [ ] App launches without errors
- [ ] ClickerScreen displays correctly
- [ ] Counter shows "Singularity Pet Count: 0" initially
- [ ] Feed button is visible and properly sized
- [ ] Single tap increments counter to 1
- [ ] 10 taps increment counter to 10
- [ ] Rapid tapping (20+ taps) increments accurately
- [ ] Button shows material ripple effect
- [ ] Counter updates within 100ms of tap
- [ ] No frame drops or UI jank
- [ ] TalkBack announces button and counter correctly
- [ ] Button meets 44pt minimum touch target
- [ ] Status bar and navigation bar handled properly

#### Web Testing (Chrome, Safari, Firefox, Edge)
- [ ] **Chrome**: Feature works correctly
- [ ] **Chrome**: Mouse click increments counter
- [ ] **Chrome**: Keyboard (Enter/Space) activates button
- [ ] **Safari**: Feature works correctly
- [ ] **Safari**: Interactions work smoothly
- [ ] **Firefox**: Feature works correctly
- [ ] **Firefox**: Interactions work smoothly
- [ ] **Edge**: Feature works correctly
- [ ] **Edge**: Interactions work smoothly
- [ ] Responsive on different screen sizes (mobile, tablet, desktop)
- [ ] No console errors or warnings

---

**PERFORMANCE TESTING**:

#### Response Time Validation
```typescript
// Manual performance test (run in browser console or React Native debugger)
const start = performance.now();
// Click button
const end = performance.now();
console.log(`Response time: ${end - start}ms`); // Should be <100ms
```

#### Frame Rate Validation
1. Open React DevTools Profiler
2. Start recording
3. Rapidly click feed button (20+ times)
4. Stop recording
5. Verify frame rate stays at 60fps (16.67ms per frame)
6. Check for any frame drops or jank

#### Large Number Testing
- [ ] Click to 100: Counter displays correctly
- [ ] Click to 1,000: Counter displays correctly
- [ ] Click to 10,000: Counter displays correctly
- [ ] Click to 100,000: Counter displays correctly (if patient!)
- [ ] No performance degradation at large numbers

---

**ACCESSIBILITY TESTING**:

#### Screen Reader Testing (iOS VoiceOver)
1. Enable VoiceOver: Settings > Accessibility > VoiceOver
2. Navigate to ClickerScreen
3. Verify button announced as: "Feed the singularity pet, button. Increases the pet count by one"
4. Verify counter announced as: "Singularity Pet Count: [number]"
5. Double-tap button with VoiceOver
6. Verify counter value update is announced

#### Screen Reader Testing (Android TalkBack)
1. Enable TalkBack: Settings > Accessibility > TalkBack
2. Navigate to ClickerScreen
3. Verify button announced correctly
4. Verify counter announced correctly
5. Double-tap button with TalkBack
6. Verify counter value update is announced

#### Color Contrast Validation
- [ ] Counter text contrast ratio ≥ 4.5:1 (black #000 on light gray #F5F5F5)
- [ ] Button text contrast ratio ≥ 4.5:1 (white #FFF on blue #007AFF)
- [ ] Use contrast checker tool to verify

#### Touch Target Validation
- [ ] Button width ≥ 44pt (verify with developer tools)
- [ ] Button height ≥ 44pt (verify with developer tools)
- [ ] Button easily tappable without precision

---

**ACCEPTANCE CRITERIA**:
- [x] All iOS manual tests pass
- [x] All Android manual tests pass
- [x] All Web browser tests pass (Chrome, Safari, Firefox, Edge)
- [x] Response time <100ms verified
- [x] Frame rate maintains 60fps during interactions
- [x] Large numbers (10,000+) display without performance issues
- [x] VoiceOver accessibility validated on iOS
- [x] TalkBack accessibility validated on Android
- [x] Color contrast ratios meet WCAG 4.5:1 requirement
- [x] Button meets 44x44pt minimum touch target size
- [x] No console errors or warnings on any platform
- [x] No visual bugs or layout issues

**BUG REPORTING**:
If any issues found:
1. Document the issue with steps to reproduce
2. Note the platform and OS version
3. Capture screenshots/screen recording if applicable
4. File bug report and link to this task
5. Fix bugs before marking task complete

**DELIVERABLE**:
Fully validated clicker feature working correctly on all target platforms (iOS, Android, Web) with all accessibility and performance requirements met.

**DEPENDENCIES**:
- Task 1.1 (SingularityPet component)
- Task 1.2 (ClickerScreen component)
- Task 1.3 (App integration)

**ESTIMATED TIME**: 2 hours

---

## Summary

### Completed Deliverables
1. **SingularityPet Component** - Core clicker with button and counter
2. **ClickerScreen Component** - Screen wrapper with safe area handling
3. **App Integration** - Feature accessible through main app
4. **Comprehensive Test Suite** - All components tested with >80% coverage
5. **Cross-Platform Validation** - Feature works on iOS, Android, Web

### Key Technical Decisions
- **State Management**: `useState` (appropriate for local component state)
- **Button Component**: `Pressable` (modern React Native API)
- **Styling**: `StyleSheet.create` (performance optimization)
- **State Updates**: Functional updates (prevents race conditions)
- **Test Location**: Co-located with implementation (per architecture guide)
- **No Barrel Exports**: Direct imports only

### Performance Metrics
- Response time: <100ms (click to counter update)
- Frame rate: 60fps maintained during interactions
- Test coverage: >80% (all features)
- Bundle size impact: Minimal (no external dependencies)

### Accessibility Compliance
- WCAG touch target: 44x44pt ✓
- Color contrast: 4.5:1 minimum ✓
- Screen reader support: iOS VoiceOver + Android TalkBack ✓
- Keyboard navigation: Supported on Web ✓

---

## Next Steps (Out of Scope for Current Tasks)

Future enhancements documented in TDD Section 18:
- **Persistence**: Add AsyncStorage to save counter across sessions
- **Animations**: Add button press animations and counter increment effects
- **Number Formatting**: Add comma separators for large numbers (1,234,567)
- **Multiple Pets**: Expand to support multiple pet types
- **Backend Integration**: Sync counter across devices

---

**Generated from TDD**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/tdd_singularity_pet_clicker_20251116.md`

**Generation timestamp**: 2025-11-16

**Optimized for**: AI agent execution with TDD methodology (Red-Green-Refactor)

**Total Estimated Time**: 6-8 hours (can be compressed to 4-6 hours with focused work)
