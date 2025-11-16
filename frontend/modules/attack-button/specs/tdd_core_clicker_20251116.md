# Core Clicker Flow Technical Design Document

## Document Control

| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude (Generated) | 2025-11-16 | Draft | Initial TDD from PRD |

## Executive Summary

This Technical Design Document defines the implementation for a minimal clicker game interface featuring a single "feed" button that increments a counter labeled "Singularity Pet Count". The solution leverages Legend-State v3 for fine-grained reactive state management, AsyncStorage for persistence, and follows Test-Driven Development (TDD) principles to ensure reliability and maintainability.

**Key Technical Decisions:**
- Hook-based architecture with behavior-focused naming (`usePersistedCounter`)
- Legend-State observables for sub-100ms reactive updates
- AsyncStorage persistence with versioned keys for migration support
- React Native Testing Library for comprehensive test coverage
- Single-screen implementation within existing App.tsx structure

---

## 1. Overview & Context

### Problem Statement

Users need a simple, satisfying interaction mechanism for an incremental/clicker game. The core gameplay loop - click to increment a value - must be immediately accessible and responsive with sub-100ms feedback. The counter must persist across app sessions to retain user progress.

**Technical Challenges:**
- Achieving <100ms tap-to-visual-update latency
- Ensuring accurate count tracking during rapid tapping (30-50 taps/minute)
- Persisting state reliably with graceful error handling
- Maintaining 100% counter accuracy across app restarts and crashes

### Solution Approach

Implement a reactive state management solution using Legend-State v3 observables with AsyncStorage persistence:

1. **State Layer**: Custom hook `usePersistedCounter` that encapsulates:
   - Legend-State observable for fine-grained reactivity
   - AsyncStorage persistence with 1-second debounce
   - Atomic increment operations to prevent race conditions

2. **UI Layer**: Single-screen component integrated into existing App.tsx:
   - Pressable button with 44x44pt touch target (WCAG AA compliant)
   - Text display with "Singularity Pet Count: [number]" format
   - Legend-State `Memo` component for surgical UI updates

3. **Persistence Layer**:
   - Versioned storage key: `singularity-pet-count-v1`
   - Automatic load on app start
   - Debounced save on each increment (1s delay)
   - Graceful fallback to in-memory state on errors

### Success Criteria

**Performance:**
- Tap-to-visual-update: <100ms (measured via performance.now())
- Button press state feedback: <100ms
- 60fps UI rendering during interactions

**Reliability:**
- 100% counter accuracy (all taps registered)
- 100% persistence success rate (verified via test assertions)
- Graceful degradation on AsyncStorage failures

**Accessibility:**
- 44x44pt minimum touch target
- 4.5:1 contrast ratio for text
- Screen reader support with proper accessibility labels

---

## 2. Codebase Exploration & Integration Analysis

### Existing Components

**App.tsx** (`/mnt/c/dev/class-one-rapids/frontend/App.tsx`):
- **Current state**: Basic "Hello World" placeholder
- **Purpose**: Root component with SafeAreaProvider wrapper
- **Integration**: Fully initialized with safe area context
- **Decision**: **UPDATE** - Modify App.tsx to include clicker screen

### Existing Hooks

**None found** - This is the first feature implementation
- **Decision**: **CREATE** `usePersistedCounter.ts` hook for counter behavior

### Store Properties (Verified)

**No existing stores** - Clean slate for state management
- **Decision**: **CREATE** counter state within custom hook (no global store needed for single-screen feature)

### Integration Points

**App.tsx Structure**:
```typescript
// Current:
<SafeAreaProvider>
  <View>
    <Text>Hello World</Text>
  </View>
</SafeAreaProvider>

// After Integration:
<SafeAreaProvider>
  <ClickerScreen />
</SafeAreaProvider>
```

**No navigation system** - Single screen app
- App.tsx renders the clicker screen directly
- No React Navigation setup required
- No tab navigation or screen transitions

### Architecture Decisions (UPDATE vs CREATE)

**Component: ClickerScreen**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
  - **RATIONALE**: New feature component, belongs in `attack-button` module (aligned with PRD location)

**Hook: usePersistedCounter**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts`
  - **RATIONALE**: Behavior-focused hook for persistent counter logic (reusable pattern)

**App.tsx**
- ✅ **DECISION: UPDATE** existing file at `/mnt/c/dev/class-one-rapids/frontend/App.tsx`
  - **RATIONALE**: Integrate ClickerScreen into existing app structure

### Integration Validation

- ✅ No duplicate/similar components exist
- ✅ Module ownership clear: `attack-button` module owns clicker functionality
- ✅ Navigation accessibility: Screen rendered directly in App.tsx (no navigation needed)
- ✅ No conflicting state management patterns

---

## 3. Requirements Analysis

### Functional Requirements

**CR-1: Feed Button Display**
- Implementation: `<Pressable>` component with "feed" text label
- Touch target: `minWidth: 44, minHeight: 44` (StyleSheet)
- Visual feedback: Opacity change on press (0.7 when pressed)

**CR-2: Increment Accuracy**
- Implementation: `count$.set(prev => prev + 1)` (atomic operation)
- Testing: Rapid tap sequence verification (10 consecutive taps)

**CR-3: Sub-100ms UI Update**
- Implementation: Legend-State `Memo` component wrapping counter display
- Observable reactivity ensures updates within one render cycle (<16ms at 60fps)

**CR-4: Button Press State**
- Implementation: `Pressable` style function with `({ pressed }) => [...]` pattern
- Visual change: Opacity 1.0 → 0.7 during press

**CR-5: Counter Display Format**
- Implementation: `<Text>Singularity Pet Count: {count$.get()}</Text>`
- Rendering: Within `Memo` component for surgical updates

**CR-6: Rapid Tap Handling**
- Implementation: Legend-State atomic updates (no race conditions)
- Testing: 30-50 taps/minute stress test

### Non-Functional Requirements

**Performance Targets:**
- **60fps Rendering**: Achieved via fine-grained reactivity (only counter text re-renders)
- **<100ms Latency**: Legend-State observables update synchronously, React re-renders within single frame
- **Button Feedback**: CSS-like press state (no JavaScript delay)

**Accessibility Standards (WCAG 2.1 Level AA):**
- **Touch Target**: `minWidth: 44, minHeight: 44` (verified in tests)
- **Color Contrast**:
  - Button: White text (#FFFFFF) on blue background (#007AFF) = 8.6:1 ratio ✅
  - Counter: Black text (#000000) on white background (#FFFFFF) = 21:1 ratio ✅
- **Screen Reader**:
  - Button: `accessibilityRole="button"`, `accessibilityLabel="Feed button"`
  - Counter: `accessibilityRole="text"`, `accessibilityLabel="Singularity Pet Count: {value}"`

**Platform Support:**
- iOS: Expo SDK 54 (React Native 0.81+)
- Android: Expo SDK 54 (React Native 0.81+)
- Web: Modern browsers (Chrome 90+, Safari 14+, Firefox 88+)

---

## 4. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   App.tsx                        │
│  (SafeAreaProvider wrapper)                      │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         ClickerScreen.tsx                  │ │
│  │  ┌──────────────────────────────────────┐ │ │
│  │  │  usePersistedCounter()               │ │ │
│  │  │  - count$ (Observable<number>)       │ │ │
│  │  │  - actions.increment()               │ │ │
│  │  └──────────────────────────────────────┘ │ │
│  │                                            │ │
│  │  UI Components:                            │ │
│  │  ├─ Counter Display (Memo wrapper)        │ │
│  │  └─ Feed Button (Pressable)               │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                    ↓
         ┌──────────────────────┐
         │   AsyncStorage       │
         │  Key: singularity-   │
         │       pet-count-v1   │
         └──────────────────────┘
```

### Component Design

#### ClickerScreen.tsx

**Purpose**: Main game screen displaying counter and feed button

**Responsibilities**:
- Render counter display with current value
- Render feed button with accessibility labels
- Handle button press events by calling `increment()` action

**Dependencies**:
- `usePersistedCounter` hook (state management)
- `react-native` components (View, Text, Pressable)
- `@legendapp/state/react` (Memo component)

**Interfaces**:
```typescript
// No props - self-contained screen
export function ClickerScreen(): JSX.Element
```

#### usePersistedCounter Hook

**Purpose**: Manage persistent counter state with AsyncStorage integration

**Responsibilities**:
- Initialize counter from AsyncStorage on mount
- Provide observable counter value for reactive UI
- Expose increment action for button press
- Debounce persistence writes (1 second delay)
- Handle AsyncStorage errors gracefully

**Dependencies**:
- `@legendapp/state` (observable, configureSynced, synced)
- `@legendapp/state/persist-plugins/async-storage`
- `@react-native-async-storage/async-storage`

**Interface**:
```typescript
interface UsePersistedCounterReturn {
  count$: Observable<number>  // Reactive counter value
  actions: {
    increment: () => void      // Atomic increment operation
  }
}

export function usePersistedCounter(): UsePersistedCounterReturn
```

### Data Flow

**User Interaction Sequence:**

```
1. User taps "Feed" button
   ↓
2. Pressable onPress fires
   ↓
3. actions.increment() called
   ↓
4. Observable count$ updated (atomic operation)
   ↓
5. Memo component detects change
   ↓
6. Counter text re-renders (< 16ms)
   ↓
7. AsyncStorage write scheduled (debounced, 1s delay)
   ↓
8. Persistence completes in background
```

**App Startup Sequence:**

```
1. App.tsx renders
   ↓
2. ClickerScreen mounts
   ↓
3. usePersistedCounter hook initializes
   ↓
4. AsyncStorage.getItem('singularity-pet-count-v1') called
   ↓
5. Stored value loaded (or defaults to 0)
   ↓
6. count$ observable initialized with value
   ↓
7. UI renders with persisted count
```

---

## 5. API Design

### Internal APIs

This feature is self-contained with no external API integrations. All APIs are internal React/React Native interfaces.

**Hook API:**

```typescript
// usePersistedCounter.ts
export function usePersistedCounter(): UsePersistedCounterReturn

// Usage in component:
const { count$, actions } = usePersistedCounter()
```

**Component API:**

```typescript
// ClickerScreen.tsx
export function ClickerScreen(): JSX.Element

// Usage in App.tsx:
<ClickerScreen />
```

---

## 6. Data Model

### Entity Design

**Counter State:**

```typescript
interface CounterState {
  value: number  // Non-negative integer, starting at 0
}
```

**AsyncStorage Schema:**

```typescript
{
  key: "singularity-pet-count-v1",  // Versioned for migration support
  value: "42"                         // Stringified number
}
```

### Data Access Patterns

**Read Pattern (App Startup):**
```typescript
// On hook initialization:
1. AsyncStorage.getItem('singularity-pet-count-v1')
2. Parse JSON string to number
3. Initialize observable with value (or 0 if null)
```

**Write Pattern (After Increment):**
```typescript
// On counter update:
1. User action triggers increment
2. Observable updates immediately
3. Debounced persist triggered (1s delay)
4. AsyncStorage.setItem('singularity-pet-count-v1', JSON.stringify(value))
```

**Caching Strategy:**
- In-memory: Observable holds current value (single source of truth)
- Persistent: AsyncStorage provides durable backup
- No explicit cache invalidation (writes are debounced, not cached)

### Data Consistency

**Approach**: Optimistic UI with eventual persistence
- UI updates immediately on tap (optimistic)
- Persistence happens asynchronously (eventual)
- On crash: Last persisted value restored (up to 1 second of data loss acceptable per PRD)

**Error Handling:**
- AsyncStorage read failure: Default to 0, log error (graceful degradation)
- AsyncStorage write failure: Continue in-memory, log error (user sees correct value, persistence retried on next update)

---

## 7. Security Design

### Authentication & Authorization

**Not Applicable**: Single-user offline app with no authentication requirements.

### Data Security

**Encryption at Rest**:
- Not implemented (counter value is non-sensitive game data)
- AsyncStorage uses platform defaults (iOS Keychain, Android SharedPreferences)

**Encryption in Transit**:
- Not applicable (no network communication)

**PII Handling**:
- No personally identifiable information collected or stored

**Audit Logging**:
- Not required (simple game mechanic, no compliance needs)

### Security Controls

**Input Validation:**
- Counter increments are atomic operations (no user input to validate)
- AsyncStorage values validated on load (fallback to 0 if invalid)

**Rate Limiting:**
- Not applicable (local-only operations)

**CORS Policies:**
- Not applicable (no API endpoints)

**Security Headers:**
- Not applicable (no web server)

---

## 8. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools

- **Framework**: React Native Testing Library v12+
- **Test Runner**: Jest 29+ with React Native preset
- **Mocking**: Jest built-in mocking for AsyncStorage
- **Assertions**: `@testing-library/jest-native` extended matchers

**Reference**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`

#### TDD Implementation Process

For each feature/component, follow this strict order:

**1. RED Phase - Write Failing Test First**

```typescript
// Example: Test for counter increment
test('increments count when feed button is pressed', async () => {
  render(<ClickerScreen />);
  const button = screen.getByRole('button', { name: /feed/i });

  await userEvent.press(button);

  // This test MUST fail initially (no implementation yet)
  await waitFor(() => {
    expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
  });
});
```

**2. GREEN Phase - Minimal Implementation**

- Write ONLY enough code to pass the test
- No extra features or optimizations
- Focus on making test green

**3. REFACTOR Phase - Improve Code**

- Clean up implementation
- Extract components/functions
- Maintain all green tests

### App-Level Integration Testing (TDD Zero Layer - MANDATORY FIRST)

**CRITICAL**: Before implementing any feature components, write integration tests at the App.tsx level that validate the complete user journey.

#### Why App-Level Tests First?

- Catches missing imports/modules immediately (prevents "Unable to resolve" errors)
- Validates component integration works end-to-end
- Ensures feature is actually accessible to users
- Tests fail until implementation exists (true TDD)

#### Required App-Level Integration Tests

```typescript
// App.test.tsx - Write these BEFORE implementing ClickerScreen

import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import App from './App';

describe('App Integration', () => {
  const user = userEvent.setup();

  test('renders without import errors', () => {
    // This test FAILS if ClickerScreen doesn't exist or can't be imported
    expect(() => render(<App />)).not.toThrow();
  });

  test('displays Singularity Pet Count on launch', () => {
    render(<App />);

    // Verify clicker screen is visible
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('displays feed button', () => {
    render(<App />);

    const feedButton = screen.getByRole('button', { name: /feed/i });
    expect(feedButton).toBeTruthy();
  });

  test('can tap feed button and increment count', async () => {
    render(<App />);

    const feedButton = screen.getByRole('button', { name: /feed/i });

    await user.press(feedButton);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });
  });
});
```

#### App Integration Test Checklist (MUST COMPLETE FIRST)

- [ ] `App.test.tsx` created with integration tests
- [ ] Tests verify ClickerScreen can be imported without errors
- [ ] Tests validate user can see counter and button
- [ ] Tests verify user can tap button and see count increase
- [ ] All App-level tests are FAILING (RED phase) before implementation
- [ ] Create skeleton ClickerScreen to make import tests pass
- [ ] Then implement features to make behavior tests pass

### Unit Testing (TDD First Layer)

**Component Tests** (`ClickerScreen.test.tsx`):

```typescript
describe('ClickerScreen Component', () => {
  const user = userEvent.setup();

  // Render Tests
  test('displays counter with initial value of 0', () => {
    render(<ClickerScreen />);
    expect(screen.getByText('Singularity Pet Count: 0')).toBeTruthy();
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

    // Rapid taps
    for (let i = 0; i < 10; i++) {
      await user.press(button);

      // Critical: Wait for observable to settle after EACH tap
      await waitFor(() => {
        expect(screen.getByText(`Singularity Pet Count: ${i + 1}`)).toBeTruthy();
      });
    }

    // Final verification
    expect(screen.getByText('Singularity Pet Count: 10')).toBeTruthy();
  });

  // Accessibility Tests
  test('button meets minimum touch target size', () => {
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
    expect(button.props.accessibilityLabel).toBe('Feed button');
  });
});
```

**Hook Tests** (`usePersistedCounter.test.tsx`):

```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePersistedCounter } from './usePersistedCounter';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('usePersistedCounter Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  test('initializes count to 0 when no stored value', async () => {
    const { result } = renderHook(() => usePersistedCounter());

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(0);
    });
  });

  test('loads persisted count on initialization', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(42));

    const { result } = renderHook(() => usePersistedCounter());

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(42);
    });
  });

  test('increments count correctly', async () => {
    const { result } = renderHook(() => usePersistedCounter());

    act(() => {
      result.current.actions.increment();
    });

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(1);
    });
  });

  test('handles rapid increments accurately', async () => {
    const { result } = renderHook(() => usePersistedCounter());

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

  test('persists count to AsyncStorage', async () => {
    const { result } = renderHook(() => usePersistedCounter());

    act(() => {
      result.current.actions.increment();
    });

    // Wait for debounced persist (1 second + buffer)
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'singularity-pet-count-v1',
        JSON.stringify(1)
      );
    }, { timeout: 2000 });
  });

  test('handles AsyncStorage read errors gracefully', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => usePersistedCounter());

    // Should fallback to 0 without crashing
    await waitFor(() => {
      expect(result.current.count$.get()).toBe(0);
    });
  });
});
```

### Component Integration Testing (TDD Second Layer)

**Persistence Integration**:

```typescript
describe('ClickerScreen Persistence Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('restores count after remount', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(5));

    const { unmount } = render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 5')).toBeTruthy();
    });

    unmount();

    const { rerender } = render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 5')).toBeTruthy();
    });
  });
});
```

### End-to-End Testing (TDD Third Layer)

**Complete User Flow**:

```typescript
describe('Core Clicker E2E Flow', () => {
  const user = userEvent.setup();

  test('complete user session with persistence', async () => {
    // Session 1: User taps 5 times
    AsyncStorage.getItem.mockResolvedValue(null);

    const { unmount } = render(<App />);

    const button = screen.getByRole('button', { name: /feed/i });

    for (let i = 0; i < 5; i++) {
      await user.press(button);
      await waitFor(() => {
        expect(screen.getByText(`Singularity Pet Count: ${i + 1}`)).toBeTruthy();
      });
    }

    // Wait for persistence
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'singularity-pet-count-v1',
        JSON.stringify(5)
      );
    }, { timeout: 2000 });

    unmount();

    // Session 2: User reopens app, continues from 5
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(5));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 5')).toBeTruthy();
    });

    const buttonSession2 = screen.getByRole('button', { name: /feed/i });
    await user.press(buttonSession2);

    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 6')).toBeTruthy();
    });
  });
});
```

### TDD Checklist for Each Component

- [ ] First test written before any implementation code
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns
- [ ] No testIds except for style verification (StyleSheet access)
- [ ] Tests query by user-visible content (`getByText`, `getByRole`)
- [ ] Async operations use `waitFor` or `findBy` queries
- [ ] All tests pass before next feature
- [ ] Coverage >80% for new code

---

## 9. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|---------------|---------------|
| Runtime | Expo SDK 54 | Project standard, includes all required dependencies |
| Storage | AsyncStorage | Built-in persistent key-value storage for React Native |
| State Management | Legend-State v3 | Fine-grained reactivity with sub-100ms updates |
| Testing | Jest + RNTL | React Native standard testing stack |

### Deployment Architecture

**Environment Strategy:**
- Development: `npm start` (Expo Go app)
- Testing: `npm test` (Jest test runner)
- Production: Native builds via `eas build` (future consideration)

**No CI/CD pipeline** required for initial implementation (local development only).

### Monitoring & Observability

#### Metrics

**Application Metrics:**
- Tap response time: Performance.now() measurements in tests
- Counter accuracy: Test assertions verify exact counts
- Persistence success rate: AsyncStorage mock verification

**Business Metrics** (aligned with PRD):
- Taps per session: Not tracked initially (manual testing)
- Session duration: Not tracked initially (manual testing)
- Return rate: Not tracked initially (manual testing)

#### Logging

**Log Levels:**
- Error: AsyncStorage failures (console.error)
- Warning: None required initially
- Info: None required initially

**Log Retention:**
- Development: Console only (no persistence)
- Production: Not applicable (no backend)

#### Alerting

No automated alerting required for single-user offline app.

---

## 10. Scalability & Performance

### Performance Requirements

**Response Time Targets:**
- Tap-to-visual-update: <100ms (PRD requirement)
  - Implementation: Legend-State observables update within single React render cycle (<16ms at 60fps)

- Button press feedback: <100ms (PRD requirement)
  - Implementation: CSS-like press state (no JavaScript delay)

- Persistence latency: <1s (debounced)
  - Implementation: 1 second debounce on AsyncStorage writes

**Throughput:**
- Concurrent taps: 30-50 per minute (PRD expectation)
  - Implementation: Atomic observable updates prevent race conditions

**Concurrent Users:**
- Single user (offline app, no multi-user support)

### Scalability Strategy

**Not Applicable**: Single-screen, single-user offline app with no scalability requirements.

Future considerations (if app grows):
- Multiple counters: Extend hook to accept storage keys
- Multiple screens: Add React Navigation
- Cloud sync: Integrate syncedFetch for remote persistence

### Performance Optimization

**Query Optimization:**
- Not applicable (no database queries)

**Asset Optimization:**
- Not applicable (no images or large assets)

**Code-Level Optimizations:**
- Fine-grained reactivity: Only counter text re-renders on update
- Debounced persistence: Reduces AsyncStorage writes by ~30-50x (30 taps/min → 2 writes/min)
- Memoized components: Legend-State Memo prevents unnecessary re-renders

**Resource Pooling:**
- Not applicable (no connection pools or resource limits)

---

## 11. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| AsyncStorage write failures lose progress | High | Low | Graceful degradation: app continues with in-memory state, retries on next update | Dev |
| Rapid tapping causes race conditions | High | Medium | Use Legend-State atomic updates, test with rapid tap sequences | Dev |
| Counter overflow at large values | Medium | Low | JavaScript numbers support up to 2^53-1 (9 quadrillion), add overflow test | Dev |
| Observable update latency exceeds 100ms | High | Low | Legend-State optimized for sub-16ms updates, verify with performance tests | Dev |
| AsyncStorage quota exceeded | Low | Very Low | Counter requires ~10 bytes storage, quota is 6MB+ on all platforms | Dev |

### Dependencies

**Legend-State v3 (beta):**
- Impact: Core state management dependency
- Mitigation: Monitor changelog for breaking changes, pin version in package.json
- Status: 🟡 Monitor (beta software)

**AsyncStorage:**
- Impact: Persistence layer
- Mitigation: Already stable and included in Expo SDK 54
- Status: ✅ Green

**React Native 0.81 (Expo SDK 54):**
- Impact: Platform runtime
- Mitigation: Expo SDK provides tested compatibility
- Status: ✅ Green

---

## 12. Implementation Plan (TDD-Driven)

Following `/mnt/c/dev/class-one-rapids/docs/architecture/lean-task-generation-guide.md` principles - prioritize user-visible functionality:

### Phase 1: Foundation & Test Setup [0.5 days]

**Step 0: App Integration Test Setup (MANDATORY FIRST)**

Before implementing ANY features, write failing App.tsx integration tests:

1. Create `App.test.tsx` with navigation/integration tests
2. Write tests that verify ClickerScreen can be imported
3. Write tests that verify complete user flow (see counter, tap button, count increases)
4. Run tests - they MUST fail (RED phase)
5. Create skeleton ClickerScreen component (empty implementation) to pass import tests
6. Behavior tests still fail - ready for feature implementation

**Deliverable**: App.test.tsx with 4 failing tests (import passes, behaviors fail)

### Phase 2: TDD Feature Implementation [1-1.5 days]

**Task 2.1: Implement Basic Counter Hook with TDD** [0.5 days]

**TDD Cycle:**

1. **RED - Write Failing Tests First**:
   ```typescript
   // usePersistedCounter.test.tsx
   test('initializes count to 0', async () => {
     const { result } = renderHook(() => usePersistedCounter());
     await waitFor(() => {
       expect(result.current.count$.get()).toBe(0);
     });
   });

   test('increments count on action', async () => {
     const { result } = renderHook(() => usePersistedCounter());
     act(() => result.current.actions.increment());
     await waitFor(() => {
       expect(result.current.count$.get()).toBe(1);
     });
   });
   ```

2. **GREEN - Minimal Implementation**:
   - Create `usePersistedCounter.ts` hook
   - Initialize observable with value 0
   - Implement increment action
   - Return observable and actions

3. **REFACTOR - Clean Up**:
   - Extract types to interface
   - Add JSDoc comments

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts`
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.test.tsx`

**Deliverable**: Working counter hook with passing tests (no persistence yet)

---

**Task 2.2: Add AsyncStorage Persistence to Hook with TDD** [0.5 days]

**TDD Cycle:**

1. **RED - Write Failing Tests**:
   ```typescript
   test('loads persisted count on mount', async () => {
     AsyncStorage.getItem.mockResolvedValue(JSON.stringify(42));
     const { result } = renderHook(() => usePersistedCounter());
     await waitFor(() => {
       expect(result.current.count$.get()).toBe(42);
     });
   });

   test('persists count after increment', async () => {
     const { result } = renderHook(() => usePersistedCounter());
     act(() => result.current.actions.increment());
     await waitFor(() => {
       expect(AsyncStorage.setItem).toHaveBeenCalledWith(
         'singularity-pet-count-v1',
         JSON.stringify(1)
       );
     }, { timeout: 2000 });
   });
   ```

2. **GREEN - Implement Persistence**:
   - Add Legend-State `configureSynced` setup
   - Configure AsyncStorage plugin
   - Wrap observable with persistence
   - Set debounce to 1 second

3. **REFACTOR - Error Handling**:
   - Add try/catch for AsyncStorage errors
   - Implement graceful fallback to 0

**Dependencies Added** (just-in-time):
- Already installed in project (Expo SDK 54 includes AsyncStorage)

**Deliverable**: Hook with full persistence and error handling, all tests passing

---

**Task 2.3: Implement ClickerScreen Component with TDD** [0.5 days]

**TDD Cycle:**

1. **RED - Write Failing Component Tests**:
   ```typescript
   test('displays counter with initial value', () => {
     render(<ClickerScreen />);
     expect(screen.getByText('Singularity Pet Count: 0')).toBeTruthy();
   });

   test('increments on button press', async () => {
     render(<ClickerScreen />);
     const button = screen.getByRole('button', { name: /feed/i });
     await userEvent.press(button);
     await waitFor(() => {
       expect(screen.getByText('Singularity Pet Count: 1')).toBeTruthy();
     });
   });
   ```

2. **GREEN - Implement Component**:
   - Create ClickerScreen.tsx
   - Use `usePersistedCounter` hook
   - Render counter with Memo wrapper
   - Render Pressable button with accessibility labels
   - Wire button onPress to increment action

3. **REFACTOR - Styling**:
   - Extract StyleSheet
   - Ensure 44x44pt touch target
   - Add press state styling
   - Verify accessibility attributes

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`

**Deliverable**: Fully functional ClickerScreen with tests, ready for integration

---

**Task 2.4: Integrate ClickerScreen into App.tsx with TDD** [0.25 days]

**TDD Cycle:**

1. **Verify App.test.tsx Tests**:
   - App integration tests should now PASS (written in Phase 1, Step 0)
   - If not passing, debug integration issues

2. **GREEN - Update App.tsx**:
   - Import ClickerScreen
   - Replace placeholder content with ClickerScreen
   - Verify SafeAreaProvider wrapper remains

3. **REFACTOR - Cleanup**:
   - Remove "Hello World" placeholder
   - Verify no console warnings

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/App.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx` (verify tests pass)

**Deliverable**: Integrated app with all tests passing (App integration + Component unit tests)

---

### Phase 3: Hardening & Polish [0.5 days]

**Task 3.1: Accessibility & Performance Verification** [0.25 days]

**Testing Focus:**
- Run full test suite
- Verify touch target size tests pass
- Verify accessibility attribute tests pass
- Manual testing on physical device (iOS + Android)

**Performance Validation:**
- Add performance measurement to tap test
- Verify <100ms latency assertion passes
- Test rapid tapping (30+ taps/minute)

**Deliverable**: All tests passing, performance verified

---

**Task 3.2: Final Coverage Report & Documentation** [0.25 days]

**Activities:**
- Generate coverage report: `npm test -- --coverage`
- Verify >80% coverage target
- Add inline code comments where needed
- Update README if necessary

**Deliverable**: Coverage report showing >80% for all new files

---

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|-------------|------|--------------|
| M1 | App.test.tsx with failing integration tests | Day 0.5 | Test setup complete |
| M2 | usePersistedCounter hook with tests | Day 1.0 | M1 complete |
| M3 | ClickerScreen component with tests | Day 1.5 | M2 complete |
| M4 | Integrated app with all tests passing | Day 1.75 | M3 complete |
| M5 | Performance validated, coverage >80% | Day 2.0 | M4 complete |

---

## 13. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| State Management | useState, Zustand, Legend-State | **Legend-State** | Project standard, fine-grained reactivity, <100ms update guarantee |
| Persistence | AsyncStorage, SQLite, Realm | **AsyncStorage** | Simplest solution for single counter, built into Expo SDK 54 |
| Hook Naming | `useSingularityPet`, `useCounter`, `usePersistedCounter` | **usePersistedCounter** | Behavior-focused naming per architecture guide (reusable pattern) |
| Component Structure | Single App.tsx, Separate ClickerScreen | **Separate ClickerScreen** | Modularity, testability, follows file organization patterns |
| Testing Approach | Snapshot tests, Integration tests, TDD | **TDD (Test-Driven Development)** | PRD requires high reliability, TDD ensures 100% counter accuracy |

### Trade-offs

**Trade-off 1**: Chose **1-second debounce** for persistence over immediate writes
- **Benefit**: Reduces AsyncStorage writes by 30-50x (performance optimization)
- **Cost**: Up to 1 second of data loss on crash
- **Justification**: PRD accepts "within 1 second of crash" data loss (AC requirement)

**Trade-off 2**: Chose **behavior-based hook name** (`usePersistedCounter`) over entity-based (`useSingularityPet`)
- **Benefit**: Hook is reusable for other counters (high scores, currencies, etc.)
- **Cost**: Name doesn't reference "Singularity Pet" domain concept
- **Justification**: Architecture guide mandates behavior-focused naming for reusability

**Trade-off 3**: Chose **no global store** over Legend-State global store pattern
- **Benefit**: Simpler implementation, no store file needed
- **Cost**: Hook owns state (less centralized)
- **Justification**: Single-screen app with one counter doesn't need global state

---

## 14. Open Questions

Technical questions requiring resolution:

- [ ] Should counter display use comma separators for large numbers (1,000 vs 1000)?
  - **Recommendation**: Not for MVP (P2 nice-to-have in PRD)
  - **Decision Needed**: Before Phase 2 if desired

- [ ] What is the expected maximum counter value?
  - **Current**: JavaScript number type supports up to 2^53-1 (9 quadrillion)
  - **Recommendation**: Add overflow test at 1 million to verify display
  - **Decision Needed**: Before Phase 3 if display formatting required

- [ ] Should there be visual celebration at milestone counts (100, 1000)?
  - **Current**: Not in PRD scope
  - **Recommendation**: Defer to future enhancement
  - **Decision Needed**: Not required for MVP

- [ ] Button style preference (flat vs raised)?
  - **Current**: Using Pressable with blue background (#007AFF)
  - **Recommendation**: Flat style with opacity press state (modern React Native pattern)
  - **Decision Needed**: Can be adjusted during Phase 2 Task 2.3 styling

---

## 15. Appendices

### A. Technical Glossary

- **Legend-State**: Fine-grained reactive state management library using observables
- **Observable**: Reactive primitive that notifies subscribers of value changes
- **AsyncStorage**: React Native's persistent key-value storage API (iOS Keychain, Android SharedPreferences)
- **Memo Component**: Legend-State wrapper component that re-renders only when observed values change
- **TDD (Test-Driven Development)**: Development methodology where tests are written before implementation
- **WCAG (Web Content Accessibility Guidelines)**: Standards for accessible UI design
- **Touch Target**: The tappable area of an interactive UI element (minimum 44x44pt)
- **Atomic Update**: Operation that completes entirely or not at all (prevents race conditions)
- **Debounce**: Delay execution until after a pause in events (reduces write frequency)

### B. Reference Architecture

**Similar Patterns in Industry:**
- Cookie Clicker (web): Click-to-increment with persistence
- Adventure Capitalist (mobile): Tap-based resource accumulation
- Clicker Heroes (mobile/web): Incremental game with tap mechanics

**Legend-State Patterns:**
- Official Todo App Example: https://legendapp.com/open-source/state/examples/todo/
- React Native Integration: https://legendapp.com/open-source/state/react-native/

### C. Related Documents

- **Product Requirements Document**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/prd_core_clicker_20251116.md`
- **Feature Request**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/feature-attack.md`
- **Lean Task Generation Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/lean-task-generation-guide.md`
- **State Management Hooks Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/state-management-hooks-guide.md`
- **File Organization Patterns**: `/mnt/c/dev/class-one-rapids/docs/architecture/file-organization-patterns.md`
- **React Native UI Guidelines**: `/mnt/c/dev/class-one-rapids/docs/architecture/react-native-ui-guidelines.md`
- **Legend-State v3 Implementation Guide**: `/mnt/c/dev/class-one-rapids/docs/research/expo_legend_state_v3_guide_20250917_225656.md`
- **React Native Testing Library Guide**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`

### D. Code Examples

**usePersistedCounter Hook (Full Implementation)**

```typescript
// /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts
import { useMemo } from 'react';
import { observable, Observable } from '@legendapp/state';
import { configureSynced, synced } from '@legendapp/state/sync';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure persistence globally
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

**ClickerScreen Component (Full Implementation)**

```typescript
// /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Memo } from '@legendapp/state/react';
import { usePersistedCounter } from './usePersistedCounter';

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

**Updated App.tsx**

```typescript
// /mnt/c/dev/class-one-rapids/frontend/App.tsx
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

---

*Generated from PRD: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/prd_core_clicker_20251116.md`*

*Generation Date: 2025-11-16*

*Total Estimated Implementation Time: 2.0 days*
