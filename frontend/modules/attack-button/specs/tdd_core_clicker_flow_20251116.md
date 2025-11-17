# Core Clicker Flow Technical Design Document

## Document Control

| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude | 2025-11-16 | Draft | Initial TDD from PRD |

## Executive Summary

This technical design implements a minimal clicker interaction consisting of a single pressable button labeled "feed" and a counter display showing "Singularity Pet Count: [number]". The implementation follows Test-Driven Development (TDD) principles, uses React Native's modern Pressable API, and maintains zero scope beyond the explicit user request. The architecture is intentionally lean, avoiding unnecessary abstractions while remaining maintainable and testable.

## 1. Overview & Context

### Problem Statement

The application currently has no interactive elements. Users need a simple, tactile way to interact with the application through a basic increment mechanism. The technical challenge is to implement this with minimal complexity while ensuring:
- Immediate visual feedback (< 100ms response time)
- Accurate state management (no missed increments)
- Platform accessibility standards (44x44pt touch targets)
- 60fps performance during interaction

### Solution Approach

We will implement a single-screen React Native application using:
- **Component State**: `useState` for counter management (no global state needed for single-screen app)
- **Modern UI**: `Pressable` component for touch handling (not deprecated TouchableOpacity)
- **Platform Compliance**: Safe area handling via `react-native-safe-area-context`
- **Accessibility**: WCAG AA standards with proper touch targets and screen reader support
- **Testing**: Component tests using React Native Testing Library

This approach prioritizes simplicity: no state management libraries, no navigation, no persistence - just a working clicker interaction.

### Success Criteria

**Technical Metrics**:
- Button press to counter update: < 100ms (synchronous state update)
- UI framerate during interaction: 60fps (measured via React DevTools)
- Zero missed increments during rapid tapping (verified through tests)
- Touch target size: ≥ 44x44pt (WCAG requirement)
- Text contrast: ≥ 4.5:1 ratio (accessibility requirement)
- Test coverage: > 80% for new code

## 2. Codebase Exploration & Integration Analysis

### Existing Components

**Exploration Results**: No existing feature components found.

The codebase is in a clean baseline state:
- `frontend/App.tsx` exists with minimal "Hello World" implementation
- `SafeAreaProvider` is already configured in App.tsx
- No existing module directories or components

**App.tsx Current State**:
```typescript
// frontend/App.tsx (current)
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export default function App() {
  return (
    <SafeAreaProvider>
      <View>
        <Text>Hello World</Text>
      </View>
    </SafeAreaProvider>
  );
}
```

### Existing Hooks

**None found**. No custom hooks exist in the codebase.

### Store Properties (Verified)

**None found**. No Legend-State stores exist in the codebase.

### Integration Points

**App.tsx** (`/mnt/c/dev/class-one-rapids/frontend/App.tsx`):
- Current imports: SafeAreaProvider, View, Text
- Navigation structure: Single screen, no navigation
- Active screens: None (displays "Hello World" placeholder)
- SafeAreaProvider is already configured (required for SafeAreaView usage)

**No existing navigation**: This is a single-screen application with no routing.

### Architecture Decisions (UPDATE vs CREATE)

**Component: ClickerScreen**
- ❌ NOT FOUND
- **DECISION: CREATE** new file at `frontend/modules/attack-button/ClickerScreen.tsx`
- **RATIONALE**: This is the first feature implementation. Creates a new module following the file-organization-patterns guide. Module name "attack-button" already exists in specs directory, so we maintain consistency.

**Hook: (none required)**
- **DECISION: NO CUSTOM HOOK NEEDED**
- **RATIONALE**: Counter state is local to ClickerScreen only. Per state-management-hooks-guide.md §🧭 Hook Decision Tree: "Is state used by only ONE component? YES → Use `useState` in component". No hook needed for single-component state.

**Store: (none required)**
- **DECISION: NO STORE NEEDED**
- **RATIONALE**: No cross-feature state sharing. Per state-management-hooks-guide.md, stores are "ONLY when state needs cross-feature sharing". This is a single-screen app with no other features.

**App.tsx**
- ✅ FOUND at: `frontend/App.tsx`
- **DECISION: UPDATE** existing file
- **RATIONALE**: Will replace "Hello World" placeholder with ClickerScreen component. This is the entry point for the application.

### Integration Validation

- **Duplicate/similar components?** No - this is the first feature component
- **Module ownership clarity**: `attack-button` module owns clicker interaction
- **Navigation accessibility**: Component will be rendered directly in App.tsx (no navigation needed for single-screen app)

### File Structure Decision

Per file-organization-patterns.md:
- **Small Features (< 10 items)**: Flat structure
- **Expected items**: ClickerScreen.tsx (1) + ClickerScreen.test.tsx (1) = 2 items
- **Decision**: Use flat structure at `frontend/modules/attack-button/` level

**Final Directory Structure**:
```
frontend/modules/attack-button/
├── specs/
│   ├── feature-attack.md
│   ├── prd_core_clicker_flow_20251116.md
│   └── tdd_core_clicker_flow_20251116.md (this file)
├── ClickerScreen.tsx          # NEW - Main component
└── ClickerScreen.test.tsx     # NEW - Component tests
```

## 3. Requirements Analysis

### Functional Requirements

**From PRD User Stories** - mapped to technical implementation:

1. **Button Display** (FR-1, FR-3)
   - Render `<Pressable>` component with text "feed"
   - Minimum touch target: 44x44pt (via minWidth/minHeight styles)
   - Visual pressed state using `style` function: `({ pressed }) => [...]`

2. **Counter Display** (FR-5, FR-6, FR-7, FR-8, FR-9)
   - Render `<Text>` with format: "Singularity Pet Count: {count}"
   - State management: `const [count, setCount] = useState(0)`
   - Increment logic: `setCount(prev => prev + 1)` (ensures accuracy)
   - Number formatting: Support 0 to 999,999+ (JavaScript handles this natively)

3. **Interaction** (FR-2, FR-4)
   - Pressable `onPress` handler updates state: `onPress={() => setCount(prev => prev + 1)}`
   - State update is synchronous (< 16ms, happens in same render cycle)
   - Visual feedback via Pressable pressed state (opacity/background change)

4. **Layout** (FR-10, FR-11, FR-12)
   - Vertical flexbox layout (button below counter)
   - Center alignment for visual clarity
   - SafeAreaView wrapper for notch/home indicator handling
   - Responsive on iPhone SE (320pt width) to iPad (1024pt width)

### Non-Functional Requirements

**Performance**:
- **UI Framerate**: 60fps during interaction
  - React Native's synchronous state updates ensure this
  - No animations or complex computations that would block main thread
- **Touch Response**: < 100ms (platform baseline)
  - Direct state update, no async operations
  - Pressable has built-in optimizations for touch handling
- **Counter Update**: Synchronous (< 16ms render time)
  - `useState` update triggers immediate re-render
  - Single `<Text>` node update is trivially fast

**Accessibility**:
- **Touch Targets**: ≥ 44x44pt (WCAG 2.1 Level AA)
  - Enforced via StyleSheet: `minWidth: 44, minHeight: 44`
- **Text Contrast**: ≥ 4.5:1 against background
  - Default React Native black text on white background = 21:1 ratio
- **Screen Reader Support**:
  - Button: `accessibilityRole="button"`, `accessibilityLabel="feed button"`
  - Counter: `accessibilityRole="text"`, `accessibilityLabel` with dynamic count
  - Counter announces: "Singularity Pet Count: {count}"

**Platform Support**:
- iOS: React Native via Expo SDK 54
- Android: React Native via Expo SDK 54
- Web: React Native Web (if applicable to Expo setup)

**Testability**:
- Component must be testable with React Native Testing Library
- All user interactions must be testable via `fireEvent.press()`
- State changes must be observable via `getByText()` queries

## 4. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│           App.tsx (Entry Point)             │
│  ┌───────────────────────────────────────┐  │
│  │     SafeAreaProvider (Context)        │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │   ClickerScreen Component       │  │  │
│  │  │                                 │  │  │
│  │  │  State: count (useState)        │  │  │
│  │  │                                 │  │  │
│  │  │  UI:                            │  │  │
│  │  │   - SafeAreaView (container)    │  │  │
│  │  │   - Text (counter display)      │  │  │
│  │  │   - Pressable (feed button)     │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Component Breakdown**:
1. **App.tsx**: Root component, provides SafeAreaProvider context
2. **ClickerScreen**: Contains all clicker logic and UI
3. **SafeAreaView**: Handles safe area insets (notches, home indicator)
4. **Text**: Displays counter value
5. **Pressable**: Interactive button for incrementing

**External Dependencies**:
- `react-native`: Core RN components (View, Text, Pressable, StyleSheet)
- `react-native-safe-area-context`: Safe area handling (SafeAreaView)
- `react`: State management (useState)

### Component Design

#### ClickerScreen Component

**Purpose**: Implements the complete clicker interaction

**Responsibilities**:
- Manage counter state (local component state)
- Render counter display with proper formatting
- Render pressable button with accessibility attributes
- Handle button press events
- Apply responsive layout and styling

**Interfaces**:
```typescript
// Props: None (standalone screen)
export function ClickerScreen(): JSX.Element

// Internal State
type State = {
  count: number  // Current counter value (0...Infinity)
}
```

**Dependencies**:
- React: useState hook
- React Native: View, Text, Pressable, StyleSheet
- react-native-safe-area-context: SafeAreaView

**State Flow**:
```
Initial Render
  └─> count = 0

User Press
  └─> onPress() called
      └─> setCount(prev => prev + 1)
          └─> count increments
              └─> Component re-renders
                  └─> Text shows new count
```

### Data Flow

**Sequence Diagram: User Taps Button**

```
User              Pressable         Component         React
 |                   |                 |               |
 |----tap----------->|                 |               |
 |                   |                 |               |
 |                   |--onPress()----->|               |
 |                   |                 |               |
 |                   |                 |--setCount---->|
 |                   |                 |               |
 |                   |                 |<--re-render---|
 |                   |                 |               |
 |                   |                 | (Text updates)|
 |                   |                 |               |
 |<--visual feedback-|                 |               |
 |   (pressed state) |                 |               |
```

**Timeline**:
- T+0ms: User touches button
- T+0ms: Pressable registers touch, shows pressed state
- T+0ms: onPress fires, setCount called
- T+~8ms: React schedules re-render
- T+~16ms: Component re-renders with new count
- T+~16ms: Text node updates to display new count
- **Total: < 20ms** (well under 100ms requirement)

## 5. API Design

### Internal APIs

No external APIs. All logic is self-contained within the component.

**Component Interface**:
```typescript
// ClickerScreen.tsx
export function ClickerScreen(): JSX.Element

// Usage in App.tsx:
import { ClickerScreen } from './modules/attack-button/ClickerScreen'

export default function App() {
  return (
    <SafeAreaProvider>
      <ClickerScreen />
    </SafeAreaProvider>
  )
}
```

### External Integrations

None. No third-party services or APIs required.

## 6. Data Model

### Entity Design

**Counter State**:
```typescript
// Simple primitive state (not an entity)
type CounterState = number

// Initial value: 0
// Valid range: 0 to Number.MAX_SAFE_INTEGER (9,007,199,254,740,991)
// Increment: +1 per button press
```

No complex data structures needed. Single integer suffices for MVP.

### Database Schema

**Not applicable**. No persistence layer in MVP scope.

Per PRD Section "Out of Scope":
> **Persistence**: Counter does NOT persist across app restarts (user did not request "save" or "remember")

### Data Access Patterns

**Read**: `count` state variable accessed in JSX render
```typescript
<Text>Singularity Pet Count: {count}</Text>
```

**Write**: `setCount` function called on button press
```typescript
<Pressable onPress={() => setCount(prev => prev + 1)}>
```

No caching, no validation, no data consistency concerns (single source of truth in component state).

## 7. Security Design

### Authentication & Authorization

**Not applicable**. No user accounts or authentication in scope.

### Data Security

**Not applicable**. No sensitive data handling.

- Counter value is not PII
- No data leaves the device
- No network requests

### Security Controls

**Input Validation**: None needed (button press is only input, no user-provided data)

**Rate Limiting**: None needed (rapid tapping is expected behavior)

**CORS Policies**: Not applicable (no network requests)

## 8. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

All implementation must follow **Red-Green-Refactor** cycle.

#### Testing Framework & Tools

- **Framework**: React Native Testing Library
- **Reference**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Test Runner**: Jest with React Native preset (pre-configured in Expo)
- **Mocking**: None needed for this component (no external dependencies to mock)

#### TDD Implementation Process

For each feature/behavior, follow this strict order:

**1. RED Phase - Write Failing Test First**

Example tests to write BEFORE implementation:

```typescript
// ClickerScreen.test.tsx

test('displays initial count of zero', () => {
  render(<ClickerScreen />);
  expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
});
// This test MUST fail initially (component doesn't exist yet)

test('increments count when feed button is pressed', () => {
  render(<ClickerScreen />);
  const feedButton = screen.getByRole('button', { name: /feed/i });

  fireEvent.press(feedButton);

  expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
});
// This test MUST fail (no button, no increment logic)
```

**2. GREEN Phase - Minimal Implementation**

Write ONLY enough code to pass tests:
```typescript
// ClickerScreen.tsx (minimal)
export function ClickerScreen() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text>Singularity Pet Count: {count}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="feed button"
        onPress={() => setCount(prev => prev + 1)}
      >
        <Text>feed</Text>
      </Pressable>
    </View>
  );
}
```

**3. REFACTOR Phase - Improve Code**

- Add SafeAreaView for safe area handling
- Extract styles to StyleSheet
- Improve layout with flexbox
- Add visual pressed state
- Maintain all green tests

### App-Level Integration Testing (TDD Zero Layer - MANDATORY FIRST)

**CRITICAL**: Before implementing ClickerScreen, write App.test.tsx integration tests.

#### Why App-Level Tests First?

- Catches missing imports immediately (prevents "Unable to resolve" errors)
- Validates component is actually accessible in app
- Tests fail until component exists (drives creation)
- Ensures integration works end-to-end

#### Required App-Level Integration Tests

```typescript
// App.test.tsx - Write BEFORE implementing ClickerScreen

describe('App Integration', () => {
  test('renders without import errors', () => {
    // This test FAILS if ClickerScreen module doesn't exist
    expect(() => render(<App />)).not.toThrow();
  });

  test('displays clicker screen by default', () => {
    const { getByText } = render(<App />);

    // Verify ClickerScreen is rendered (not "Hello World")
    expect(getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('can interact with feed button from app root', () => {
    const { getByText, getByRole } = render(<App />);

    // Verify button exists and is interactive
    const feedButton = getByRole('button', { name: /feed/i });
    fireEvent.press(feedButton);

    // Verify state update works
    expect(getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
  });
});
```

#### App Integration Test Checklist (MUST COMPLETE FIRST)

- [ ] App.test.tsx created with integration tests
- [ ] Tests verify ClickerScreen can be imported
- [ ] Tests validate screen is rendered in App.tsx
- [ ] All App-level tests are FAILING (RED phase) before implementation
- [ ] Create skeleton ClickerScreen to make import tests pass
- [ ] Then implement features to make behavior tests pass

### Unit Testing (TDD First Layer)

**Test Categories** (in order of implementation):

1. **Render Tests** - Component displays correctly
2. **Interaction Tests** - User actions work properly
3. **State Tests** - Counter changes trigger correct updates
4. **Accessibility Tests** - Screen reader and touch target compliance

**Comprehensive Test Suite**:

```typescript
// ClickerScreen.test.tsx

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

**Coverage Target**: > 80% for ClickerScreen.tsx

### TDD Checklist for Each Component

- [ ] First test written before any implementation code
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns
- [ ] No testIds unless absolutely necessary (prefer getByText, getByRole)
- [ ] Tests query by user-visible content (text, labels)
- [ ] No async operations (all state updates are synchronous)
- [ ] All tests pass before feature is considered complete

## 9. Infrastructure & Deployment

### Infrastructure Requirements

**Not applicable** - this is a mobile application built with Expo.

No server infrastructure needed. Runs entirely on client device.

### Deployment Architecture

**Expo Workflow**:
- Development: `npx expo start` (Metro bundler)
- iOS Preview: Expo Go app or development build
- Android Preview: Expo Go app or development build
- Production: Expo Application Services (EAS) build pipeline

**Environment Strategy**: Single environment (no dev/staging/prod separation needed for MVP)

### Monitoring & Observability

**Not applicable** for MVP scope. No analytics, no error tracking.

Future consideration (out of scope):
- Crash reporting: Sentry for React Native
- Analytics: Expo Analytics or Firebase Analytics

## 10. Scalability & Performance

### Performance Requirements

**From PRD**:
- **Response time**: < 100ms for button press to counter update
- **Framerate**: 60fps during interaction
- **Accuracy**: 100% (no missed increments)

**Technical Implementation**:
- React Native's synchronous `useState` updates ensure < 16ms re-renders
- Single `<Text>` node update is O(1) complexity, trivially fast
- Pressable component has optimized touch handling (native bridge)
- No network requests, no async operations, no blocking computations

**Verification**:
- Manual testing: Tap rapidly, observe smooth UI updates
- Automated testing: fireEvent.press() loops verify accuracy
- React DevTools Profiler: Measure render time (should be < 16ms)

### Scalability Strategy

**Not applicable** - single-screen app with no backend.

Counter can handle up to `Number.MAX_SAFE_INTEGER` (9 quadrillion) before overflow.
At 10 taps/second, would take 28 million years to overflow.

### Performance Optimization

**Current Design is Already Optimal**:
- Component state (fastest React state mechanism)
- Single re-render per state change
- No list rendering (no FlatList overhead)
- No images or assets to load
- No animations (optional future enhancement)

**No optimization needed** for MVP scope.

## 11. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Rapid tapping causes missed increments | High | Low | Use functional setState: `setCount(prev => prev + 1)` ensures queued updates don't overwrite each other | Development |
| SafeAreaView import error | Medium | Low | Verify `react-native-safe-area-context` is installed, SafeAreaProvider is in App.tsx | Development |
| Accessibility failures on screen readers | Medium | Low | Add proper `accessibilityRole` and `accessibilityLabel` to all interactive elements, test with VoiceOver/TalkBack | Development |
| Button too small on devices | Medium | Low | Enforce `minWidth: 44, minHeight: 44` in StyleSheet | Development |
| Test failures block implementation | Low | Medium | Write tests incrementally, ensure each test is atomic and independent | Development |

### Dependencies

**From PRD + Technical Analysis**:

| Dependency | Type | Mitigation | Status |
|------------|------|------------|--------|
| `react-native-safe-area-context` | Package | Already installed and configured in App.tsx | ✅ Ready |
| Expo SDK 54 | Platform | Project already initialized with Expo SDK 54 | ✅ Ready |
| React Native Testing Library | Dev Dependency | Pre-installed with Expo | ✅ Ready |
| Jest | Test Runner | Pre-configured with Expo | ✅ Ready |

**No blockers identified**. All dependencies are satisfied.

## 12. Implementation Plan (TDD-Driven)

### Development Phases

Following `/mnt/c/dev/class-one-rapids/docs/architecture/lean-task-generation-guide.md` principles - prioritize user-visible functionality.

#### Phase 1: App-Level Integration Tests (MANDATORY FIRST)

**Duration**: 0.5 hours

**CRITICAL FIRST STEP**: Create App.test.tsx BEFORE implementing ClickerScreen

1. **Create App.test.tsx** (if doesn't exist)
2. **Write failing tests for app integration**:
   - Test 1: App renders without import errors
   - Test 2: ClickerScreen is displayed (not "Hello World")
   - Test 3: Can interact with feed button from app root
3. **Run tests** - they MUST fail (RED phase)
4. **Create skeleton ClickerScreen** to make import tests pass:
   ```typescript
   // ClickerScreen.tsx (skeleton)
   export function ClickerScreen() {
     return <View><Text>Placeholder</Text></View>
   }
   ```
5. **Update App.tsx** to import and render ClickerScreen
6. **Verify**: Import tests pass, behavior tests still fail

**Deliverable**: App.test.tsx with 3 integration tests (1 passing, 2 failing)

#### Phase 2: Component Test Setup

**Duration**: 0.5 hours

1. **Create ClickerScreen.test.tsx**
2. **Write all failing component tests** (see Section 8 test suite)
   - Initial render tests (4 tests)
   - Button interaction tests (5 tests)
   - Counter display tests (2 tests)
   - Accessibility tests (4 tests)
   - Layout tests (2 tests)
3. **Run tests** - all MUST fail (RED phase)
4. **Review tests** against PRD requirements (ensure coverage)

**Deliverable**: ClickerScreen.test.tsx with 17 failing tests

#### Phase 3: TDD Implementation (Red-Green-Refactor)

**Duration**: 1-2 hours

Follow strict TDD cycle for each behavior:

**Iteration 1: Display Initial Counter**
- **RED**: Test "displays initial count of zero" fails
- **GREEN**: Add `useState(0)` and `<Text>Singularity Pet Count: {count}</Text>`
- **REFACTOR**: Extract to variable if needed
- **Verify**: Test passes

**Iteration 2: Display Feed Button**
- **RED**: Test "displays feed button" fails
- **GREEN**: Add `<Pressable><Text>feed</Text></Pressable>` with accessibility props
- **REFACTOR**: Extract to separate component if complex (not needed for MVP)
- **Verify**: Test passes

**Iteration 3: Increment on Button Press**
- **RED**: Test "increments count by 1" fails
- **GREEN**: Add `onPress={() => setCount(prev => prev + 1)}`
- **REFACTOR**: None needed
- **Verify**: All increment tests pass

**Iteration 4: Rapid Tap Accuracy**
- **RED**: Test "handles rapid tapping accurately" fails (if using `setCount(count + 1)`)
- **GREEN**: Ensure functional update `setCount(prev => prev + 1)` is used
- **REFACTOR**: None needed
- **Verify**: Test passes

**Iteration 5: Accessibility Attributes**
- **RED**: Accessibility tests fail
- **GREEN**: Add `accessibilityRole`, `accessibilityLabel` to button and counter
- **REFACTOR**: None needed
- **Verify**: All accessibility tests pass

**Iteration 6: Layout & Styling**
- **RED**: Layout tests pass (basic render), but UI looks bad
- **GREEN**: Add SafeAreaView, StyleSheet, flexbox layout
- **REFACTOR**: Organize styles, add pressed state styling
- **Verify**: All tests still pass, UI looks good

**Iteration 7: Pressed State Visual Feedback**
- **RED**: No test (visual requirement from PRD FR-2)
- **GREEN**: Add `style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}`
- **REFACTOR**: Adjust opacity/background for pressed state
- **Verify**: Manual testing (no automated test for visual feedback)

**Iteration 8: Final Integration**
- **Run full test suite**: App.test.tsx + ClickerScreen.test.tsx
- **Verify**: All tests green
- **Manual test**: Run `npx expo start`, tap button, verify behavior
- **Accessibility test**: Enable VoiceOver (iOS) or TalkBack (Android), verify announcements

**Deliverable**: Fully implemented ClickerScreen with all tests passing (20+ tests green)

#### Phase 4: Polish & Documentation (Optional)

**Duration**: 0.5 hours

1. **Code review**: Ensure code follows file-organization-patterns.md
2. **Test coverage**: Run `npx jest --coverage`, verify > 80%
3. **Documentation**: Add JSDoc comments to ClickerScreen component
4. **Clean up**: Remove any console.logs, unused imports

**Deliverable**: Production-ready ClickerScreen component

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|-------------|------|---------------|
| M1 | App.test.tsx with integration tests (RED) | Day 1 AM | None |
| M2 | ClickerScreen.test.tsx with unit tests (RED) | Day 1 AM | M1 complete |
| M3 | Skeleton ClickerScreen passes import tests | Day 1 PM | M1 complete |
| M4 | All tests GREEN, feature complete | Day 1 PM | M2, M3 complete |
| M5 | Manual testing on iOS/Android | Day 2 AM | M4 complete |
| M6 | Code review, documentation | Day 2 PM | M5 complete |

**Total Timeline**: 1.5-2 days (includes TDD discipline overhead)

### Task Execution Order (MANDATORY SEQUENCE)

**CRITICAL**: Follow this exact order per TDD best practices:

1. **App Integration Tests** (App.test.tsx) ← START HERE
2. **Skeleton Component** (makes import tests pass)
3. **Component Unit Tests** (ClickerScreen.test.tsx)
4. **Component Implementation** (Red-Green-Refactor iterations)
5. **Integration Validation** (all tests green)
6. **Manual Testing** (device testing)

**DO NOT**:
- ❌ Write implementation before tests
- ❌ Skip App-level integration tests
- ❌ Implement features not covered by tests
- ❌ Move to next feature if tests are red

## 13. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| State Management | useState, useReducer, Zustand, Legend-State | `useState` | Single component, simple integer state. Per state-management-hooks-guide.md: "Is state used by only ONE component? YES → Use useState in component" |
| Component Type | Class Component, Functional Component | Functional Component | Modern React best practice, hooks support, better for testing |
| Button Component | TouchableOpacity, TouchableHighlight, Pressable | `Pressable` | Per react-native-ui-guidelines.md: "Always prefer Pressable (modern, platform-agnostic)". Not deprecated like TouchableOpacity |
| Safe Area Handling | SafeAreaView (deprecated), react-native-safe-area-context | `react-native-safe-area-context` | Per react-native-ui-guidelines.md: "React Native's built-in SafeAreaView is DEPRECATED". Must use community package |
| File Organization | Nested folders, Flat structure | Flat structure | Per file-organization-patterns.md: "< 10 items: Flat Structure". Only 2 files (component + test) |
| Test Framework | Enzyme, React Native Testing Library | React Native Testing Library | Expo default, recommended in docs/research/react_native_testing_library_guide_20250918_184418.md |
| Module Name | clicker, singularity-pet, feed-button | `attack-button` | Consistency with existing specs directory path (`frontend/modules/attack-button/specs/`) |

### Trade-offs

**1. No Persistence**
- **Chose**: In-memory state only (counter resets on app reload)
- **Over**: AsyncStorage persistence
- **Because**: User did not request "save" or "remember". Per lean principles: "Just-In-Time Everything". Add persistence only when explicitly requested.
- **Impact**: Acceptable for MVP, easy to add later

**2. No Custom Hook**
- **Chose**: useState directly in component
- **Over**: Custom `useCounter()` or `usePersistedCounter()` hook
- **Because**: State is only used in one component. Per state-management-hooks-guide.md decision tree: "Is state used by only ONE component? YES → Use useState in component"
- **Impact**: Simpler code, fewer files, easier to understand. Can extract hook later if needed.

**3. No Animation**
- **Chose**: Static Pressable with pressed state only
- **Over**: Animated.View with spring animations
- **Because**: PRD does not request animations. FR-2 only requires "visual feedback on press", which Pressable's pressed state provides.
- **Impact**: Faster implementation, fewer dependencies. Animations can be added as P1 enhancement.

**4. No Number Formatting**
- **Chose**: Plain integer display (e.g., "1000")
- **Over**: Comma-separated formatting (e.g., "1,000")
- **Because**: PRD Open Questions section asks "Should the counter display include any formatting?" but does not specify. Default to simplest implementation.
- **Impact**: Acceptable for MVP, easy to add `toLocaleString()` later if requested.

**5. Manual Testing for Visual Feedback**
- **Chose**: No automated test for pressed state styling
- **Over**: Snapshot testing or style assertion tests
- **Because**: Visual feedback is subjective, manual testing is more reliable for UX validation. Pressed state logic is simple (opacity change).
- **Impact**: Requires manual verification, but saves test complexity.

## 14. Open Questions

**Technical questions requiring resolution**:

- [ ] **Number Formatting**: Should counter use comma separators? (e.g., "1,000" vs "1000")
  - **Decision needed**: Before implementation
  - **Impact**: Low - can change with single line of code
  - **Recommendation**: Wait for user feedback, start with plain integers

- [ ] **Maximum Counter Value**: What should happen at Number.MAX_SAFE_INTEGER overflow?
  - **Decision needed**: Never (would take 28 million years to reach)
  - **Impact**: None for practical use
  - **Recommendation**: Ignore for MVP

- [ ] **Pressed State Style**: What visual feedback for button press? (opacity, scale, background color)
  - **Decision needed**: During implementation
  - **Impact**: Low - cosmetic only
  - **Recommendation**: Use 0.7 opacity (iOS standard), adjust if user feedback requests it

- [ ] **Counter Text Size**: Font size for counter display?
  - **Decision needed**: During implementation
  - **Impact**: Low - accessibility concern if too small
  - **Recommendation**: 18pt minimum (WCAG large text standard)

- [ ] **Button Position**: Counter above button or button above counter?
  - **Decision needed**: During implementation
  - **Impact**: Low - UX preference
  - **Recommendation**: Counter above button (standard info → action flow)

## 15. Appendices

### A. Technical Glossary

- **Pressable**: React Native's modern touchable component with press state handling
- **SafeAreaView**: Component that adds padding for device notches/home indicators
- **accessibilityRole**: Semantic role for screen readers (button, text, image, etc.)
- **accessibilityLabel**: Text description for screen readers
- **TDD (Test-Driven Development)**: Development methodology where tests are written before implementation (Red-Green-Refactor cycle)
- **Red-Green-Refactor**: TDD cycle - write failing test (red), implement minimal code to pass (green), improve code while keeping tests green (refactor)
- **WCAG**: Web Content Accessibility Guidelines - accessibility standards (applies to mobile too)
- **Touch Target**: Interactive area of a UI element (minimum 44x44pt per WCAG)
- **React Native Testing Library**: Testing framework for React Native components
- **useState**: React hook for component-level state management
- **Legend-State**: Advanced state management library (not needed for this component)
- **Expo SDK 54**: React Native framework and toolchain version

### B. Reference Architecture

**Similar Patterns**:
- Classic "Cookie Clicker" game mechanics
- Basic counter/tally apps
- Meditation timer incrementers
- Habit tracking tap counters

**React Native Examples**:
- [React Native Counter Example](https://reactnative.dev/docs/state) (official docs)
- [Expo Starter Templates](https://docs.expo.dev/guides/typescript/) (TypeScript patterns)

### C. Proof of Concepts

**No POCs needed**. Implementation is straightforward with established patterns.

All required functionality is well-documented in React Native core:
- useState: https://react.dev/reference/react/useState
- Pressable: https://reactnative.dev/docs/pressable
- SafeAreaView: https://github.com/th3rdwave/react-native-safe-area-context

### D. Related Documents

- **Product Requirements Document**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/prd_core_clicker_flow_20251116.md`
- **Original Feature Request**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/feature-attack.md`
- **Lean Task Generation Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/lean-task-generation-guide.md`
- **File Organization Patterns**: `/mnt/c/dev/class-one-rapids/docs/architecture/file-organization-patterns.md`
- **State Management Hooks Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/state-management-hooks-guide.md`
- **React Native UI Guidelines**: `/mnt/c/dev/class-one-rapids/docs/architecture/react-native-ui-guidelines.md`
- **React Native Testing Library Guide**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`

### E. Code Snippets

**Final Component Structure Preview** (implementation target):

```typescript
// frontend/modules/attack-button/ClickerScreen.tsx

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

**App.tsx Integration**:

```typescript
// frontend/App.tsx

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

---

**Generated from PRD**: `prd_core_clicker_flow_20251116.md`
**Generation Date**: 2025-11-16
**TDD Implementation Required**: Yes (all features must be test-driven)
**Architecture Compliance**: Lean principles, behavior-based hooks (not applicable - no hooks needed), file organization patterns
