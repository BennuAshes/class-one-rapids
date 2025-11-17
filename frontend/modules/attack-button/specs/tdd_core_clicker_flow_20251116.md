# Core Clicker Flow Technical Design Document

## Document Control

| Version | Author      | Date       | Status | Changes              |
| ------- | ----------- | ---------- | ------ | -------------------- |
| v1.0    | Claude      | 2025-11-16 | Draft  | Initial TDD from PRD |

## Executive Summary

This Technical Design Document defines the implementation strategy for a minimal viable clicker feature: a single "feed" button that increments a persistent counter displayed as "Singularity Pet Count". The feature establishes the foundational interaction mechanic for user engagement through immediate visual feedback and cross-session state persistence. Implementation follows Test-Driven Development (TDD) methodology with React Native Testing Library and Legend-State v3 for fine-grained reactive state management.

## 1. Overview & Context

### Problem Statement

The application currently lacks any interactive user engagement mechanism. Users need a simple, satisfying interaction that provides immediate visual feedback and persistent progress tracking. Without this foundational clicker mechanic, there is no baseline for user engagement, progression tracking, or future feature expansion.

### Solution Approach

Implement a single-screen interface featuring:
1. A "feed" button (Pressable component) meeting WCAG 44x44pt touch target requirements
2. A reactive counter display showing "Singularity Pet Count: [number]"
3. Legend-State observable for fine-grained reactivity with <100ms update latency
4. AsyncStorage persistence for cross-session state retention
5. Behavior-based custom hook (usePersistedCounter) encapsulating increment and persistence logic

### Success Criteria

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| Button press response time | <100ms from press to counter update | Performance testing with RN Testing Library |
| Counter update accuracy | 100% (no dropped taps, rapid tap sequences) | Integration tests with 10+ rapid taps |
| State persistence | Counter value retained within 1 second of app close | AsyncStorage integration tests |
| Touch target accessibility | 44x44pt minimum | Component snapshot tests with style verification |
| UI render performance | 60fps sustained during interactions | Performance monitoring (no frame drops) |

## 2. Codebase Exploration & Integration Analysis

### Existing Components

**EXPLORATION RESULTS**:

#### App.tsx
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/App.tsx`
- **Current state**: Minimal "Hello World" placeholder
- **Purpose**: Application root component
- **Integration**: Already includes SafeAreaProvider wrapper
- **Decision**: UPDATE existing file to render ClickerScreen component

```typescript
// Current implementation (lines 1-13):
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

#### Navigation Hook
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useNavigation.ts`
- **Current state**: Complete navigation hook with shop/clicker screen switching
- **Purpose**: State-based navigation using Legend-State observable
- **Integration**: Exports `currentScreen$` observable and navigation actions
- **Decision**: NOT NEEDED for MVP (single screen only)
- **Note**: Available for future multi-screen expansion

### Module Structure

**attack-button module**:
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/`
- **Current state**: Empty (only specs directory exists)
- **Decision**: CREATE all implementation files in this module

**Expected Structure**:
```
frontend/modules/attack-button/
├── ClickerScreen.tsx          # CREATE - Main screen component
├── ClickerScreen.test.tsx     # CREATE - Component integration tests
├── hooks/
│   ├── usePersistedCounter.ts      # CREATE - Persistent counter hook
│   └── usePersistedCounter.test.tsx # CREATE - Hook unit tests
└── specs/
    ├── feature-attack.md            # EXISTS
    ├── prd_core_clicker_flow_20251116.md  # EXISTS
    └── tdd_core_clicker_flow_20251116.md  # THIS FILE
```

### Existing Dependencies

**Legend-State v3**: `@legendapp/state@^3.0.0-beta.35`
- Observable primitives
- Persistence plugins
- React integration

**AsyncStorage**: `@react-native-async-storage/async-storage@^2.2.0`
- Persistent key-value storage
- Compatible with Expo SDK 54

**Testing**:
- `@testing-library/react-native@^13.3.3`
- `@testing-library/jest-native@^5.4.3`
- `jest-expo@^54.0.13`

**UI Components**:
- `react-native-safe-area-context@~5.6.0` (already configured in App.tsx)

### Architecture Decisions (UPDATE vs CREATE)

**Component: App.tsx**
- ✅ **DECISION: UPDATE** existing file at `/mnt/c/dev/class-one-rapids/frontend/App.tsx`
  - RATIONALE: Root app file already exists with SafeAreaProvider configured. Simple modification to render ClickerScreen instead of placeholder.

**Component: ClickerScreen**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
  - RATIONALE: New feature component. Belongs in attack-button module as primary screen.

**Hook: usePersistedCounter**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.ts`
  - RATIONALE: New behavior-based hook for persistent counter logic. Follows state management architecture patterns.

**Tests: App.test.tsx**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`
  - RATIONALE: App-level integration tests to validate ClickerScreen renders without import errors.

**Tests: ClickerScreen.test.tsx**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`
  - RATIONALE: Component integration tests following co-location pattern.

**Tests: usePersistedCounter.test.tsx**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/hooks/usePersistedCounter.test.tsx`
  - RATIONALE: Hook unit tests following co-location pattern.

### Integration Validation

- **Duplicate components**: None - this is the first feature implementation
- **Module ownership clarity**: attack-button module owns all clicker functionality
- **Navigation accessibility**: Direct render in App.tsx root (no navigation needed for single-screen MVP)
- **Persistence collision**: No existing stores - usePersistedCounter will own "singularity-pet-count" storage key

## 3. Requirements Analysis

### Functional Requirements

| ID | Requirement | Technical Implementation |
|----|-------------|-------------------------|
| R1.1 | Button labeled "feed" visible on main screen | Pressable component with Text child in ClickerScreen |
| R1.2 | Button responds to press events with platform feedback | Pressable with style function for pressed state + optional haptic feedback |
| R1.3 | Each button press increments counter by exactly 1 | usePersistedCounter hook exposes increment action updating observable |
| R1.4 | Counter updates visible within 100ms | Legend-State observable triggers Memo component re-render (<10ms typical) |
| R1.5 | Button handles 10+ rapid taps without dropping inputs | Observable batching with atomic increment operations |
| R2.1 | Label displays "Singularity Pet Count" + value | Text component with Memo wrapper observing count$ |
| R2.2 | Count value updates reactively when state changes | Legend-State Memo component subscribes to count$ observable |
| R2.3 | Count value displays as integer (no decimals) | Number type in observable, no decimal formatting |
| R2.4 | Initial count value is 0 for new users | usePersistedCounter initial value: 0 |
| R3.1 | Counter value persists to local storage on each increment | AsyncStorage.setItem in increment action via synced() |
| R3.2 | Counter value loads from local storage on app launch | synced() with persist config loads on hook initialization |
| R3.3 | Persistence occurs automatically without user action | Legend-State synced() handles automatic persistence |
| R3.4 | Failed storage operations do not crash app or block UI | Try-catch in AsyncStorage operations, observable updates continue |

### Non-Functional Requirements

#### Performance
- **60fps UI rendering**: React Native baseline with fine-grained Memo updates (no full component re-renders)
- **<100ms response time**: Observable update (<10ms) + AsyncStorage write (async, non-blocking)
- **No dropped frames**: Pressable uses native press handling, observable batching prevents render thrashing

#### Accessibility
- **Minimum touch target**: 44x44pt minWidth/minHeight on Pressable (WCAG 2.1 Level AA)
- **Color contrast**: 4.5:1 minimum ratio for text (WCAG AA) - verified in component styles
- **Screen reader support**:
  - Button: `accessibilityRole="button"`, `accessibilityLabel="Feed"`
  - Counter: `accessibilityRole="text"`, `accessibilityLabel="Singularity Pet Count: {value}"`

#### Platform Support
- **iOS**: iOS 13+ (Expo SDK 54 requirement)
- **Android**: Android 6.0+ (Expo SDK 54 requirement)
- **Web**: Modern browsers (Chrome, Safari, Firefox latest 2 versions)

## 4. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        App.tsx                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │            SafeAreaProvider                         │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │         ClickerScreen.tsx                     │  │ │
│  │  │                                               │  │ │
│  │  │  ┌─────────────────────────────────────────┐ │  │ │
│  │  │  │  usePersistedCounter()                  │ │  │ │
│  │  │  │  ┌─────────────────────────────────┐    │ │  │ │
│  │  │  │  │ Legend-State Observable         │    │ │  │ │
│  │  │  │  │  count$: Observable<number>     │    │ │  │ │
│  │  │  │  └────────────┬────────────────────┘    │ │  │ │
│  │  │  │               │                          │ │  │ │
│  │  │  │               ↓                          │ │  │ │
│  │  │  │  ┌─────────────────────────────────┐    │ │  │ │
│  │  │  │  │ synced() Persistence Layer      │    │ │  │ │
│  │  │  │  │  - AsyncStorage plugin          │    │ │  │ │
│  │  │  │  │  - Auto-save on change          │    │ │  │ │
│  │  │  │  │  - Auto-load on mount           │    │ │  │ │
│  │  │  │  └─────────────────────────────────┘    │ │  │ │
│  │  │  └─────────────────────────────────────────┘ │  │ │
│  │  │                                               │  │ │
│  │  │  UI Components:                              │  │ │
│  │  │  - Pressable (feed button)                   │  │ │
│  │  │  - Memo<Text> (counter display)              │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
                ┌──────────────────────┐
                │   AsyncStorage       │
                │   Key: "singularity- │
                │        pet-count"    │
                │   Value: number      │
                └──────────────────────┘
```

### Component Design

#### ClickerScreen Component

**Purpose**: Main screen rendering feed button and counter display

**Responsibilities**:
- Render Pressable button with "feed" label
- Render counter display with "Singularity Pet Count: X" label
- Handle button press events by calling increment action
- Observe count$ observable for reactive updates
- Apply styles meeting accessibility requirements

**Interfaces**:
```typescript
// No props - self-contained screen component
export function ClickerScreen(): JSX.Element

// Internal state from hook
const { count$, actions } = usePersistedCounter('singularity-pet-count')
```

**Dependencies**:
- `usePersistedCounter` hook
- React Native components: View, Text, Pressable, StyleSheet
- Legend-State React primitives: Memo
- react-native-safe-area-context: SafeAreaView

#### usePersistedCounter Hook

**Purpose**: Encapsulate persistent counter behavior with Legend-State

**Responsibilities**:
- Create observable for counter value
- Configure persistence to AsyncStorage
- Provide increment action
- Handle initial value (0) for new users
- Ensure atomic updates (no race conditions)

**Interfaces**:
```typescript
interface UsePersistedCounterReturn {
  count$: Observable<number>;
  actions: {
    increment: () => void;
    reset: () => void;
  };
}

export function usePersistedCounter(storageKey: string): UsePersistedCounterReturn
```

**Dependencies**:
- `@legendapp/state`: observable, computed
- `@legendapp/state/sync`: synced, configureSynced
- `@legendapp/state/persist-plugins/async-storage`: ObservablePersistAsyncStorage
- `@react-native-async-storage/async-storage`: AsyncStorage

### Data Flow

#### User Interaction Flow (Tap to Increment)

```
User taps feed button
        ↓
Pressable onPress event
        ↓
actions.increment() called
        ↓
count$.set(count$.get() + 1)
        ↓
┌───────────────────────────────┐
│  Observable Update Triggers:  │
│  1. Memo re-renders counter   │  (<10ms)
│  2. synced() saves to storage │  (async, non-blocking)
└───────────────────────────────┘
        ↓
User sees updated count within 100ms
```

#### Persistence Flow (Load on Launch)

```
App launches
        ↓
usePersistedCounter hook initializes
        ↓
synced() plugin checks AsyncStorage for key "singularity-pet-count"
        ↓
┌────────────────────────────────┐
│  If key exists:                │
│    - Load value into count$    │
│  If key not found:             │
│    - Use initial value: 0      │
└────────────────────────────────┘
        ↓
Component renders with loaded count
```

## 5. API Design

### Internal APIs

No external HTTP APIs required for MVP. All state is local.

### Hook API

#### usePersistedCounter

```typescript
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
  // Implementation uses useMemo to ensure stable observable reference
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

**Return Type**:
```typescript
interface UsePersistedCounterReturn {
  count$: Observable<number>;  // Reactive counter value
  actions: {
    increment: () => void;      // Increment by 1
    reset: () => void;          // Reset to 0
  };
}
```

## 6. Data Model

### State Schema

```typescript
// Counter state (in-memory observable)
count$: Observable<number>

// Persisted state (AsyncStorage)
{
  key: "singularity-pet-count",
  value: "0" // Stringified number
}
```

### Data Validation

- **Type**: `number` (integer only, no decimals)
- **Range**: 0 to Number.MAX_SAFE_INTEGER (9,007,199,254,740,991)
- **Default**: 0 for new users
- **Serialization**: JSON.stringify/parse handled by AsyncStorage plugin

### Data Access Patterns

#### Read Pattern
```typescript
// Component observes count$ via Memo
<Memo>{() => <Text>Count: {count$.get()}</Text>}</Memo>
```

#### Write Pattern
```typescript
// Increment action updates observable
actions.increment() → count$.set(count$.get() + 1)
```

#### Persistence Pattern
```typescript
// Automatic via synced() configuration
// Writes to AsyncStorage after each state change
// No manual save/load required
```

## 7. Security Design

### Authentication & Authorization
Not applicable for MVP (local-only state, no user accounts).

### Data Security

**Local Data Protection**:
- AsyncStorage data is sandboxed per-app (iOS Keychain, Android SharedPreferences)
- Counter value is non-sensitive (gameplay data, not PII)
- No encryption required for MVP

**Input Validation**:
- Increment action always adds 1 (no user input for increment value)
- No injection risk (no string concatenation or eval)

### Security Controls

**Rate Limiting**: None required (local-only operations)

**Access Control**:
- Hook enforces single source of truth (no direct observable mutation)
- Actions are the only way to modify state

## 8. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools
- **Framework**: React Native Testing Library
- **Reference**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Test Runner**: Jest with jest-expo preset
- **Mocking**: Jest mocks for AsyncStorage

#### TDD Implementation Process

For each feature/component, follow this strict order:

1. **RED Phase - Write Failing Test First**
   ```typescript
   // Example: Test for counter increment
   test('increments count when feed button pressed', async () => {
     render(<ClickerScreen />);
     const button = screen.getByRole('button', { name: /feed/i });
     await user.press(button);

     await waitFor(() => {
       expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
     });
   });
   // This test MUST fail initially (component doesn't exist yet)
   ```

2. **GREEN Phase - Minimal Implementation**
   - Write ONLY enough code to pass the test
   - No extra features or optimizations
   - Focus on making test green

3. **REFACTOR Phase - Improve Code**
   - Clean up implementation
   - Extract components/functions
   - Maintain all green tests

#### Test Categories (in order of implementation)

### App-Level Integration Testing (TDD Zero Layer - MANDATORY FIRST)

**CRITICAL**: Before implementing any feature components, write integration tests at the App.tsx level that validate the complete user journey including component imports.

#### Why App-Level Tests First?
- Catches missing imports/modules immediately (prevents "Unable to resolve" errors)
- Validates ClickerScreen integration works end-to-end
- Ensures the screen is actually accessible to users
- Tests fail until ClickerScreen component exists (prevents orphaned features)

#### Required App-Level Integration Tests

```typescript
// App.test.tsx - Write these BEFORE implementing ClickerScreen

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

#### App Integration Test Checklist (MUST COMPLETE FIRST)

- [ ] App.test.tsx created with import validation test
- [ ] Test verifies ClickerScreen can be imported without errors
- [ ] Test validates user can see feed button
- [ ] Test validates counter display is visible
- [ ] All App-level tests are FAILING (RED phase) before implementation
- [ ] Create skeleton ClickerScreen component to make import tests pass
- [ ] Then implement features to make behavior tests pass

**Test Execution Order**:
1. **App-Level Integration Tests** (validates imports & rendering) ← START HERE
2. Unit Tests (individual screen components and hooks)
3. Component Integration Tests (hook + component interaction)

### Unit Testing (TDD First Layer)

**ClickerScreen Component Tests**:
```typescript
// ClickerScreen.test.tsx

describe('ClickerScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders feed button with correct accessibility attributes', () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });
    expect(button).toBeTruthy();
    expect(button.props.accessibilityLabel).toBe('Feed');
  });

  test('renders counter display with initial value 0', () => {
    render(<ClickerScreen />);

    expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
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

    // Tap 10 times rapidly with waitFor after each tap
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

  test('counter text has correct accessibility attributes', () => {
    render(<ClickerScreen />);

    const counter = screen.getByText(/Singularity Pet Count: 0/i);
    expect(counter.props.accessibilityRole).toBe('text');
  });
});
```

**usePersistedCounter Hook Tests**:
```typescript
// hooks/usePersistedCounter.test.tsx

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

### Component Integration Testing (TDD Second Layer)

**Hook-Component Integration**:
```typescript
// Integration test verifying hook and component work together

describe('ClickerScreen + usePersistedCounter Integration', () => {
  test('persists count across component remounts', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ClickerScreen />);

    // Increment to 5
    const button = screen.getByRole('button', { name: /feed/i });
    for (let i = 0; i < 5; i++) {
      await user.press(button);
      await waitFor(() => {
        expect(screen.getByText(`Singularity Pet Count: ${i + 1}`)).toBeTruthy();
      });
    }

    // Unmount component
    unmount();

    // Remount component
    render(<ClickerScreen />);

    // Verify count persisted
    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 5/i)).toBeTruthy();
    }, { timeout: 2000 });
  });
});
```

### TDD Checklist for Each Component

- [ ] App integration tests written first (validates imports)
- [ ] All tests written before any implementation code
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns
- [ ] No testIds unless necessary for style verification
- [ ] Tests query by user-visible content (getByRole, getByText)
- [ ] Async operations use waitFor/findBy
- [ ] All tests pass before next feature
- [ ] Legend-State async updates handled with waitFor

## 9. Infrastructure & Deployment

### Infrastructure Requirements

No server infrastructure required for MVP (client-side only).

| Component | Specification | Justification          |
| --------- | ------------- | ---------------------- |
| Client    | iOS/Android/Web device | React Native app runtime |
| Storage   | Device local storage (100KB) | AsyncStorage for single counter value |

### Deployment Architecture

**Environment**: Expo managed workflow
- **Dev**: `npx expo start` (local development server)
- **Preview**: Expo Go app (OTA updates)
- **Production**: EAS Build (native binaries for App Store/Play Store)

**Build Commands**:
```bash
# Development
npx expo start

# Run tests (Windows)
cmd.exe /c "npm test"

# Build for production
eas build --platform all
```

### Monitoring & Observability

#### Metrics

**Application Metrics**:
- Counter increment count (tracked in observable, available for future analytics)
- Button press events (can be logged to console for debugging)

**Performance Metrics**:
- Frame rate during interactions (React Native DevTools)
- Observable update latency (console.time/timeEnd in development)

#### Logging

**Development**:
```typescript
// Optional debug logging in usePersistedCounter
if (__DEV__) {
  console.log('Counter incremented:', count$.get());
}
```

**Production**: No logging required for MVP (local-only state)

#### Alerting

Not applicable for MVP (no server-side monitoring).

## 10. Scalability & Performance

### Performance Requirements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Response time | <100ms (tap to visual update) | userEvent + waitFor assertions |
| Throughput | 10+ taps/second without dropped inputs | Rapid tap sequence tests |
| Concurrent users | N/A (single-user local app) | N/A |

### Scalability Strategy

**Horizontal Scaling**: Not applicable (client-side app)

**State Scaling**:
- Current: Single counter observable
- Future: Additional observables can be added without refactoring (Legend-State scales well)

### Performance Optimization

**Query Optimization**: N/A (no database queries)

**UI Optimization**:
- Fine-grained Memo components (only counter text re-renders, not entire screen)
- Pressable uses native press handling (no JS bridge delays)

**Code-Level Optimizations**:
```typescript
// Use useMemo to ensure stable observable reference
const { count$, actions } = useMemo(() => {
  // Hook implementation
}, [storageKey]);

// Use Memo for reactive counter display
<Memo>{() => <Text>Singularity Pet Count: {count$.get()}</Text>}</Memo>
```

**AsyncStorage Optimization**:
- Writes are async and non-blocking
- Legend-State batches rapid updates automatically

## 11. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| AsyncStorage compatibility issues across platforms | High | Low | Use Expo's AsyncStorage wrapper (already installed and tested) | Engineering |
| Legend-State observable updates lag on rapid taps | Medium | Low | Implement rapid tap test (10+ taps), verify batching works correctly | Engineering |
| Accessibility touch target too small on small devices | Medium | Medium | Use testID to verify minWidth/minHeight >= 44pt in tests | QA/Engineering |
| Counter exceeds MAX_SAFE_INTEGER | Low | Very Low | Document behavior in code comments, no validation needed for MVP | Engineering |
| Legend-State beta version instability | Medium | Low | Beta has been stable for months, monitor changelog, pin version | Engineering |

### Dependencies

| Dependency | Status | Mitigation |
|------------|--------|------------|
| `@legendapp/state@^3.0.0-beta.35` | Already installed | Pin version to avoid breaking changes |
| `@react-native-async-storage/async-storage@^2.2.0` | Already installed | Expo-managed, stable |
| `react-native-safe-area-context@~5.6.0` | Already installed | Already configured in App.tsx |

## 12. Implementation Plan (TDD-Driven)

### Development Phases

Following lean task generation principles - prioritize user-visible functionality:

#### Phase 1: Foundation & Test Setup [0.5 weeks]

**Task 1.1: App Integration Test Setup (MANDATORY FIRST)**
- Create `App.test.tsx`
- Write test: "renders without import errors"
- Write test: "displays clicker screen by default"
- Write test: "clicker screen is accessible from app root"
- Run tests - they MUST fail (ClickerScreen doesn't exist)
- **Deliverable**: Failing app integration tests ready for TDD

**Task 1.2: Skeleton Component for Import Tests**
- Create minimal `ClickerScreen.tsx` (just returns empty View)
- Update `App.tsx` to import and render ClickerScreen
- Run App.test.tsx - import test should now pass
- Behavior tests still fail (no button or counter yet)
- **Deliverable**: App integrates ClickerScreen without errors, ready for feature implementation

#### Phase 2: TDD Feature Implementation [1 week]

**Task 2.1: Persistent Counter Hook (TDD)**
1. **RED Phase**: Write `usePersistedCounter.test.tsx` with all hook tests
   - Test: initializes with default value 0
   - Test: increments count on action
   - Test: handles rapid increments (10+ taps)
   - Test: persists value to AsyncStorage
   - Test: loads persisted value on mount
   - Test: reset action sets count to 0
   - Run tests - all FAIL (hook doesn't exist)

2. **GREEN Phase**: Implement `usePersistedCounter.ts`
   - Create hook with Legend-State observable
   - Configure synced() with AsyncStorage persistence
   - Implement increment and reset actions
   - Run tests - all PASS

3. **REFACTOR Phase**: Clean up implementation
   - Extract persistence config if needed
   - Add JSDoc comments
   - Ensure all tests still pass

**Task 2.2: Clicker Screen Component (TDD)**
1. **RED Phase**: Write `ClickerScreen.test.tsx` with all component tests
   - Test: renders feed button with accessibility attributes
   - Test: renders counter display with initial value 0
   - Test: increments counter when button pressed
   - Test: handles rapid taps accurately (10 taps)
   - Test: button meets accessibility touch target size (44x44pt)
   - Test: counter text has accessibility attributes
   - Run tests - all FAIL (implementation is skeleton only)

2. **GREEN Phase**: Implement ClickerScreen.tsx
   - Use usePersistedCounter hook
   - Render Pressable button with "Feed" label
   - Render Memo component for reactive counter display
   - Apply styles for 44x44pt touch target
   - Add accessibility attributes
   - Run tests - all PASS

3. **REFACTOR Phase**: Clean up implementation
   - Extract styles to StyleSheet
   - Optimize Memo usage
   - Ensure all tests still pass

**Task 2.3: Integration Validation**
- Run full test suite (App + Component + Hook tests)
- Verify all App.test.tsx tests now pass
- Test on iOS simulator (npx expo start --ios)
- Test on Android emulator (npx expo start --android)
- Verify persistence works across app restarts
- **Deliverable**: Fully functional clicker screen with all tests passing

#### Phase 3: Testing & QA [0.5 weeks]

**Task 3.1: Accessibility Audit**
- Run tests on iPhone SE (smallest screen)
- Verify touch targets with VoiceOver (iOS)
- Verify touch targets with TalkBack (Android)
- Test color contrast with WebAIM tool
- **Deliverable**: Accessibility compliance verified

**Task 3.2: Performance Validation**
- Test rapid tapping (manually tap as fast as possible for 10 seconds)
- Monitor frame rate with React Native DevTools
- Verify no frame drops during interaction
- Measure response time with performance.now()
- **Deliverable**: Performance requirements met (<100ms, 60fps)

**Task 3.3: Cross-Platform Testing**
- Test on iOS (iPhone 14+)
- Test on Android (Pixel 7+)
- Test on Web (Chrome, Safari, Firefox)
- Verify persistence works on all platforms
- **Deliverable**: Platform compatibility validated

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
| --------- | ----------- | ---- | ------------ |
| M1 | App integration tests failing (RED) | Week 1 Day 1 | None |
| M2 | Skeleton ClickerScreen passes import tests | Week 1 Day 1 | M1 |
| M3 | usePersistedCounter hook all tests pass (GREEN) | Week 1 Day 3 | M2 |
| M4 | ClickerScreen all tests pass (GREEN) | Week 1 Day 5 | M3 |
| M5 | Full integration tests pass | Week 2 Day 1 | M4 |
| M6 | Accessibility audit complete | Week 2 Day 2 | M5 |
| M7 | Performance validation complete | Week 2 Day 3 | M6 |
| M8 | Cross-platform testing complete | Week 2 Day 4 | M7 |

## 13. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
| -------- | ------------------ | ------ | --------- |
| State Management | useState, Context API, Zustand, Legend-State | Legend-State | Already installed, fine-grained reactivity, built-in persistence, optimal for Expo SDK 54 |
| Persistence | AsyncStorage, SQLite, MMKV, SecureStore | AsyncStorage | Already installed, sufficient for single counter value, cross-platform compatible |
| Component Library | TouchableOpacity, Button, Pressable | Pressable | Modern React Native API, flexible styling, better TypeScript support |
| Hook Naming | useSingularityPet, usePetCounter, usePersistedCounter | usePersistedCounter | Behavior-based naming (follows state management guide), reusable for other counters |
| Testing Library | Enzyme, React Test Renderer, RN Testing Library | RN Testing Library | Already installed, user-centric queries, modern best practices |
| Safe Area Handling | SafeAreaView (deprecated), react-native-safe-area-context | react-native-safe-area-context | Already installed in App.tsx, avoids deprecated API |

### Trade-offs

- **Legend-State v3 Beta over Stable v2**: Accepted beta risk for better performance and persistence APIs (beta has been stable for months)
- **No Maximum Count Limit**: Accepted potential overflow beyond MAX_SAFE_INTEGER for simplicity (extremely unlikely in practice)
- **Single Screen MVP over Multi-Screen**: Chose simplicity over complexity (navigation hook exists for future expansion)
- **Behavior-Based Hook Name**: Chose reusability over entity specificity (usePersistedCounter can be reused for other counters)
- **AsyncStorage over MMKV**: Chose stability over performance (AsyncStorage sufficient for single counter, MMKV can be added later if needed)

## 14. Open Questions

Technical questions requiring resolution:

- [ ] Should the counter display have a visual maximum value (e.g., "999+")?
  - **Recommendation**: No for MVP, add if user feedback indicates need
- [ ] What happens if counter exceeds Number.MAX_SAFE_INTEGER (9,007,199,254,740,991)?
  - **Recommendation**: Document in code comments, no validation for MVP (extremely unlikely)
- [ ] Should button be disabled during AsyncStorage write operations?
  - **Recommendation**: No - writes are async and non-blocking, Legend-State batches updates
- [ ] What is the preferred button color scheme (follow app theme or custom)?
  - **Recommendation**: Use default React Native blue (#007AFF) for MVP, themeable in future

## 15. Appendices

### A. Technical Glossary

- **Clicker**: Game genre where primary interaction is clicking/tapping to increment values
- **Legend-State**: Fine-grained reactive state management library with built-in persistence
- **AsyncStorage**: Persistent key-value storage for React Native (cross-platform)
- **Observable**: Legend-State primitive for reactive state (subscribable value)
- **Memo**: Legend-State React component for fine-grained reactivity (only re-renders when observed values change)
- **synced()**: Legend-State helper for configuring persistence and remote sync
- **Pressable**: Modern React Native touchable component (replacement for TouchableOpacity)
- **WCAG**: Web Content Accessibility Guidelines (accessibility standards)
- **TDD**: Test-Driven Development (write tests before implementation)

### B. Reference Architecture

**Legend-State Patterns**:
- Hook-based state management: `/mnt/c/dev/class-one-rapids/docs/architecture/state-management-hooks-guide.md`
- Persistence configuration: `/mnt/c/dev/class-one-rapids/docs/research/expo_legend_state_v3_guide_20250917_225656.md`

**React Native UI Patterns**:
- Component selection: `/mnt/c/dev/class-one-rapids/docs/architecture/react-native-ui-guidelines.md`
- Safe area handling: App.tsx example (SafeAreaProvider already configured)

**Testing Patterns**:
- React Native Testing Library: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`
- Legend-State async testing: Use waitFor for observable updates

### C. File Organization

Following `/mnt/c/dev/class-one-rapids/docs/architecture/file-organization-patterns.md`:

**Module Structure** (< 10 items, use flat structure):
```
frontend/modules/attack-button/
├── ClickerScreen.tsx               # Component
├── ClickerScreen.test.tsx          # Co-located test
├── hooks/
│   ├── usePersistedCounter.ts      # Hook
│   └── usePersistedCounter.test.tsx # Co-located test
└── specs/                          # Documentation
    ├── feature-attack.md
    ├── prd_core_clicker_flow_20251116.md
    └── tdd_core_clicker_flow_20251116.md
```

**No Barrel Exports**: Import directly from files (no index.ts)
```typescript
// ✅ Good
import { ClickerScreen } from './modules/attack-button/ClickerScreen';

// ❌ Bad (no index.ts)
import { ClickerScreen } from './modules/attack-button';
```

**Test Co-location**: Tests next to implementation (not in __tests__ folder)

### D. Related Documents

- **Product Requirements Document**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/prd_core_clicker_flow_20251116.md`
- **Original Feature Request**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/feature-attack.md`
- **Task List**: (To be created via /flow:tasks command)
- **State Management Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/state-management-hooks-guide.md`
- **File Organization Patterns**: `/mnt/c/dev/class-one-rapids/docs/architecture/file-organization-patterns.md`
- **React Native UI Guidelines**: `/mnt/c/dev/class-one-rapids/docs/architecture/react-native-ui-guidelines.md`
- **Legend-State v3 Guide**: `/mnt/c/dev/class-one-rapids/docs/research/expo_legend_state_v3_guide_20250917_225656.md`
- **Testing Library Guide**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Lean Task Generation Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/lean-task-generation-guide.md`

---

**Generated from PRD**: `prd_core_clicker_flow_20251116.md`
**Generation Date**: 2025-11-16
**Generator**: Claude (Anthropic)
**Version**: 1.0 (Draft)
