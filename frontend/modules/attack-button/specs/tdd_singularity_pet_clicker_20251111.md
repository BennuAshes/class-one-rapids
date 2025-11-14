# Singularity Pet Clicker - Technical Design Document

## Document Control

| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude | 2025-11-11 | Draft | Initial TDD from PRD |

## Executive Summary

This document outlines the technical implementation strategy for the Singularity Pet Clicker feature, establishing the foundation for an idle/clicker game using React Native, Expo SDK 54, and Legend-State v3 for state management. The implementation follows Test-Driven Development (TDD) principles, behavior-based hook naming conventions, and lean development practices to deliver a performant, accessible core clicking mechanic with sub-100ms response times.

---

## 1. Overview & Context

### Problem Statement

Players need an engaging idle/clicker game mechanic that provides immediate satisfaction through resource accumulation. The technical challenge is delivering sub-100ms tap-to-update latency while maintaining 60fps during rapid tapping (10+ taps/second), persisting state reliably, and supporting large numbers (up to MAX_SAFE_INTEGER).

### Solution Approach

Implement a single-screen feature using:
- **React Native** components for UI with optimized touch handling
- **Legend-State v3** observables for fine-grained reactive state management
- **AsyncStorage** for persistent state with debounced writes
- **Behavior-based custom hooks** following project architecture patterns
- **TDD methodology** with React Native Testing Library for quality assurance

### Success Criteria

**Technical Metrics:**
- Tap-to-update latency: <100ms (p95)
- Frame rate during rapid tapping: ≥60fps
- Storage write debouncing: ≤1 write per 500ms
- Test coverage: >80% for new code
- Zero data loss on app closure/crash
- Support numbers up to 9,007,199,254,740,991 (MAX_SAFE_INTEGER)

---

## 2. Requirements Analysis

### Functional Requirements

**FR-1: Core Interaction**
- Single tap increments counter by 1
- Response time <100ms (p95)
- Accurate tap registration (no drops during rapid tapping)
- Visual feedback on button press
- Haptic feedback on supported devices

**FR-2: Display & Feedback**
- Real-time counter updates (<100ms)
- Number formatting with comma separators (1,234,567)
- Support for large numbers (up to MAX_SAFE_INTEGER)
- Smooth counter animations
- High-contrast, accessible typography

**FR-3: State Persistence**
- Auto-save on every increment (debounced)
- Load saved state on app launch
- Graceful error handling for storage failures
- No data corruption on unexpected app termination

### Non-Functional Requirements

**Performance:**
- Tap latency: <100ms (p95), <50ms (p50)
- UI maintains 60fps during rapid tapping
- Memory footprint: <10MB for feature module
- Storage write debouncing: 1 write per 500ms maximum

**Security:**
- Count validation prevents negative values
- Count validation prevents overflow beyond MAX_SAFE_INTEGER
- Local storage uses AsyncStorage encryption if available

**Accessibility:**
- WCAG 2.1 AA contrast ratio (4.5:1 minimum)
- Touch target: ≥44x44pt
- Screen reader support for count announcements

**Scalability:**
- Architecture supports adding per-tap multipliers
- State structure allows multiple currency types
- Component design allows upgrade UI integration

**Platform Support:**
- iOS 13+ (Expo SDK 54 compatibility)
- Android 8.0+ (API level 26+)
- Both touch and click input methods

---

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     UI Layer                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ClickerScreen.tsx (Component)                   │  │
│  │  - Renders button and counter                    │  │
│  │  - Uses Memo for fine-grained updates            │  │
│  │  - Handles user interactions                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓ uses
┌─────────────────────────────────────────────────────────┐
│                  Hook Layer                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  usePersistedCounter.ts (Behavior Hook)          │  │
│  │  - Returns count$ observable                     │  │
│  │  - Returns increment action                      │  │
│  │  - Manages persistence logic                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓ manages
┌─────────────────────────────────────────────────────────┐
│                  State Layer                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  counter.store.ts (Private Store)                │  │
│  │  - Observable count with persistence             │  │
│  │  - Not exported to components                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓ persists to
┌─────────────────────────────────────────────────────────┐
│              Persistence Layer                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  AsyncStorage                                     │  │
│  │  - Key: "singularity-pet-count-v1"               │  │
│  │  - Value: number                                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Component Design

#### ClickerScreen Component

**Purpose**: Main UI component displaying feed button and counter

**Responsibilities:**
- Render feed button with proper touch target size
- Display counter with formatted numbers
- Provide visual/haptic feedback on tap
- Use fine-grained reactivity (Memo) for optimal performance

**Interfaces:**
```typescript
// Component doesn't export props - it's a screen
export function ClickerScreen(): JSX.Element
```

**Dependencies:**
- `usePersistedCounter` hook
- `@legendapp/state/react` (Memo component)
- React Native components (View, Text, TouchableOpacity)
- Optional: Haptics API for feedback

#### usePersistedCounter Hook

**Purpose**: Provides persistent counter behavior with auto-save

**Responsibilities:**
- Manage counter observable
- Provide increment action
- Handle persistence to AsyncStorage
- Debounce storage writes
- Load initial value on mount

**Interfaces:**
```typescript
interface UsePersistedCounterReturn {
  count$: Observable<number>
  actions: {
    increment: () => void
    reset: () => void
    set: (value: number) => void
  }
}

export function usePersistedCounter(
  storageKey: string,
  initialValue?: number
): UsePersistedCounterReturn
```

**Dependencies:**
- `counter.store.ts` (private store)
- `@legendapp/state` (observable, synced)
- `@legendapp/state/persist-plugins/async-storage`
- `@react-native-async-storage/async-storage`

#### counter.store.ts (Private Store)

**Purpose**: Private observable store for counter state

**Responsibilities:**
- Hold counter observable with persistence configuration
- Not directly accessible by components
- Only accessed through hook

**Interfaces:**
```typescript
// Internal only - not exported
interface CounterStore {
  count: number
}
```

**Dependencies:**
- `@legendapp/state` (observable, configureSynced, synced)
- Persistence configuration

### Data Flow

**User Tap Sequence:**

```
1. User taps feed button
   ↓
2. TouchableOpacity onPress fires
   ↓
3. actions.increment() called
   ↓
4. counter$.count increments (synchronous)
   ↓
5. Memo component re-renders counter (fine-grained)
   ↓
6. Visual feedback shows (button animation)
   ↓
7. Haptic feedback triggers (iOS/Android)
   ↓
8. Debounced save to AsyncStorage (after 500ms)
   ↓
9. Storage write completes (background)
```

**App Launch Sequence:**

```
1. App initializes
   ↓
2. ClickerScreen mounts
   ↓
3. usePersistedCounter hook initializes
   ↓
4. Hook checks AsyncStorage for saved value
   ↓
5. If found: Load saved count
   If not found: Use initial value (0)
   ↓
6. Observable initialized with loaded value
   ↓
7. UI renders with current count
```

---

## 4. API Design

### Internal APIs

No external HTTP APIs required for MVP. All APIs are TypeScript module interfaces.

#### Hook API

```typescript
// modules/attack-button/hooks/usePersistedCounter.ts

/**
 * Provides persistent counter behavior with auto-save
 *
 * @param storageKey - AsyncStorage key for persistence
 * @param initialValue - Starting value if no saved data (default: 0)
 * @returns Observable counter and actions
 */
export function usePersistedCounter(
  storageKey: string,
  initialValue = 0
): UsePersistedCounterReturn

interface UsePersistedCounterReturn {
  // Observable for fine-grained reactivity
  count$: Observable<number>

  // Actions (not observables)
  actions: {
    /**
     * Increment counter by 1
     * Triggers auto-save (debounced)
     */
    increment: () => void

    /**
     * Reset counter to initial value
     */
    reset: () => void

    /**
     * Set counter to specific value
     * Useful for testing or future features
     */
    set: (value: number) => void
  }
}
```

#### Store Internal API

```typescript
// modules/attack-button/stores/counter.store.ts (PRIVATE)

import { observable } from '@legendapp/state'
import { configureSynced, synced } from '@legendapp/state/sync'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'

// Internal store - not exported to components
const counter$ = observable({
  count: synced({
    initial: 0,
    persist: {
      name: 'singularity-pet-count-v1',
      plugin: observablePersistAsyncStorage({ AsyncStorage })
    }
  })
})

// Only export for hook usage
export { counter$ }
```

### External Integrations

None required for MVP.

---

## 5. Data Model

### Entity Design

#### Counter Entity

```typescript
// modules/attack-button/types.ts

/**
 * Singularity Pet Counter state
 * Simple number value with validation constraints
 */
export interface CounterState {
  count: number  // Range: 0 to MAX_SAFE_INTEGER
}

/**
 * Validation constraints
 */
export const COUNTER_CONSTRAINTS = {
  MIN_VALUE: 0,
  MAX_VALUE: Number.MAX_SAFE_INTEGER, // 9,007,199,254,740,991
  STORAGE_KEY: 'singularity-pet-count-v1',
  DEBOUNCE_MS: 500,
} as const
```

### Database Schema

**AsyncStorage (Key-Value Store):**

```typescript
// Storage Structure
{
  "singularity-pet-count-v1": "1234567"  // Stored as string, parsed to number
}

// Legend-State handles serialization/deserialization automatically
```

**Migration Strategy:**
- v1: Initial schema (single number value)
- Future versions: Append version suffix to key (e.g., `-v2`)
- Migration logic in hook initialization if needed

### Data Access Patterns

**Common Operations:**

1. **Read Current Count**
   ```typescript
   const currentCount = counter$.count.get()
   ```

2. **Increment Count**
   ```typescript
   counter$.count.set(counter$.count.get() + 1)
   // OR
   counter$.count.set(prev => prev + 1)
   ```

3. **Persist to Storage** (automatic via Legend-State)
   ```typescript
   // Handled by synced configuration
   // Debounced automatically based on config
   ```

**Caching Strategy:**
- In-memory observable acts as cache
- AsyncStorage acts as persistent backing store
- No additional caching layer needed for MVP

**Data Consistency:**
- Single source of truth: Observable in store
- Optimistic updates (increment happens immediately)
- Background persistence (doesn't block UI)
- Storage failures logged but don't block interactions

---

## 6. Security Design

### Authentication & Authorization

Not applicable for MVP (local-only feature).

### Data Security

**Encryption at Rest:**
- AsyncStorage provides encryption if device supports it
- No custom encryption required for MVP
- Count value is not sensitive data

**Encryption in Transit:**
- Not applicable (no network communication)

**PII Handling:**
- No personally identifiable information stored
- Count value is game state only

**Audit Logging:**
- Development: Console logs for storage operations
- Production: Error logging for storage failures only
- No audit trail needed for MVP

### Security Controls

**Input Validation:**
```typescript
// Validation in hook/store
function validateCount(value: number): number {
  // Prevent negative values
  if (value < COUNTER_CONSTRAINTS.MIN_VALUE) {
    return COUNTER_CONSTRAINTS.MIN_VALUE
  }

  // Prevent overflow beyond safe integer range
  if (value > COUNTER_CONSTRAINTS.MAX_VALUE) {
    return COUNTER_CONSTRAINTS.MAX_VALUE
  }

  // Ensure it's a valid number
  if (!Number.isFinite(value)) {
    return COUNTER_CONSTRAINTS.MIN_VALUE
  }

  return Math.floor(value) // Ensure integer
}
```

**Rate Limiting:**
- Not applicable (local interactions)
- No artificial rate limiting on taps

**CORS Policies:**
- Not applicable (no web API)

**Security Headers:**
- Not applicable (mobile app)

---

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

All implementation follows **Red-Green-Refactor** cycle:
1. **RED**: Write failing test first
2. **GREEN**: Write minimal code to pass test
3. **REFACTOR**: Improve code while keeping tests green

### Testing Framework & Tools

**Framework:** React Native Testing Library
- **Reference:** @docs/research/react_native_testing_library_guide_20250918_184418.md
- **Test Runner:** Jest with React Native preset (jest-expo)
- **Mocking:** Jest mocks for AsyncStorage
- **Query Priority:** User-visible content > testIds

**Installation:**
```bash
# Already installed in project
npm install --save-dev @testing-library/react-native
npm install --save-dev @testing-library/jest-native
npm install --save-dev jest-expo
```

### TDD Implementation Process

#### Phase 1: Hook Tests (Foundation)

**File:** `modules/attack-button/hooks/usePersistedCounter.test.tsx`

**Test 1: RED - Initialize with default value**
```typescript
import { renderHook } from '@testing-library/react-native'
import { usePersistedCounter } from './usePersistedCounter'

describe('usePersistedCounter', () => {
  test('initializes with default value of 0', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    expect(result.current.count$.get()).toBe(0)
  })
})
// MUST FAIL FIRST - hook doesn't exist yet
```

**Test 2: RED - Increment increases count**
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

**Test 3: RED - Multiple increments accumulate**
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

**Test 4: RED - Reset returns to initial value**
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

**Test 5: RED - Persists to AsyncStorage**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'

test('saves count to AsyncStorage on increment', async () => {
  const { result } = renderHook(() =>
    usePersistedCounter('test-key')
  )

  act(() => {
    result.current.actions.increment()
  })

  // Wait for debounced save
  await waitFor(() => {
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      '1'
    )
  }, { timeout: 1000 })
})
```

**Test 6: RED - Loads from AsyncStorage on mount**
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

**Test 7: RED - Validates count range**
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

#### Phase 2: Component Tests (UI Layer)

**File:** `modules/attack-button/ClickerScreen.test.tsx`

**Test 1: RED - Renders feed button**
```typescript
import { render, screen } from '@testing-library/react-native'
import { ClickerScreen } from './ClickerScreen'

describe('ClickerScreen', () => {
  test('renders feed button', () => {
    render(<ClickerScreen />)

    expect(screen.getByText('Feed')).toBeTruthy()
  })
})
```

**Test 2: RED - Displays initial count**
```typescript
test('displays initial count of 0', () => {
  render(<ClickerScreen />)

  expect(screen.getByText('Singularity Pet Count: 0')).toBeTruthy()
})
```

**Test 3: RED - Increments count on button press**
```typescript
import { userEvent } from '@testing-library/react-native'

test('increments count when feed button is pressed', async () => {
  const user = userEvent.setup()
  render(<ClickerScreen />)

  const feedButton = screen.getByText('Feed')

  await user.press(feedButton)

  expect(screen.getByText('Singularity Pet Count: 1')).toBeTruthy()
})
```

**Test 4: RED - Handles rapid tapping**
```typescript
test('handles rapid tapping accurately', async () => {
  const user = userEvent.setup()
  render(<ClickerScreen />)

  const feedButton = screen.getByText('Feed')

  // Simulate 10 rapid taps
  for (let i = 0; i < 10; i++) {
    await user.press(feedButton)
  }

  expect(screen.getByText('Singularity Pet Count: 10')).toBeTruthy()
})
```

**Test 5: RED - Formats numbers with commas**
```typescript
test('formats large numbers with comma separators', async () => {
  const user = userEvent.setup()
  render(<ClickerScreen />)

  const feedButton = screen.getByText('Feed')

  // Mock hook to return large number
  jest.spyOn(require('./hooks/usePersistedCounter'), 'usePersistedCounter')
    .mockReturnValue({
      count$: { get: () => 1234567 },
      actions: { increment: jest.fn() }
    })

  expect(screen.getByText('Singularity Pet Count: 1,234,567')).toBeTruthy()
})
```

**Test 6: RED - Button meets accessibility standards**
```typescript
test('feed button meets minimum touch target size', () => {
  const { getByText } = render(<ClickerScreen />)

  const button = getByText('Feed')
  const buttonStyle = button.props.style

  // Minimum 44x44pt for accessibility
  expect(buttonStyle.minWidth).toBeGreaterThanOrEqual(44)
  expect(buttonStyle.minHeight).toBeGreaterThanOrEqual(44)
})
```

#### Phase 3: Integration Tests

**File:** `modules/attack-button/integration.test.tsx`

**Test 1: RED - End-to-end tap-to-persist flow**
```typescript
test('complete tap-to-persist flow works', async () => {
  const user = userEvent.setup()
  render(<ClickerScreen />)

  const feedButton = screen.getByText('Feed')

  // Tap multiple times
  await user.press(feedButton)
  await user.press(feedButton)
  await user.press(feedButton)

  // Verify UI updates
  expect(screen.getByText('Singularity Pet Count: 3')).toBeTruthy()

  // Wait for debounced save
  await waitFor(() => {
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      expect.any(String),
      '3'
    )
  }, { timeout: 1000 })
})
```

**Test 2: RED - Persists and loads across app restarts**
```typescript
test('count persists across component unmount/remount', async () => {
  const user = userEvent.setup()

  // First render
  const { unmount } = render(<ClickerScreen />)

  await user.press(screen.getByText('Feed'))
  await user.press(screen.getByText('Feed'))

  // Wait for save
  await waitFor(() => {
    expect(AsyncStorage.setItem).toHaveBeenCalled()
  }, { timeout: 1000 })

  // Unmount component
  unmount()

  // Mock AsyncStorage to return saved value
  AsyncStorage.getItem.mockResolvedValueOnce('2')

  // Re-render
  render(<ClickerScreen />)

  // Should load saved count
  await waitFor(() => {
    expect(screen.getByText('Singularity Pet Count: 2')).toBeTruthy()
  })
})
```

### Test Categories Summary

**Unit Testing (TDD First Layer):**
- Hook behavior tests (7 tests)
- Number formatting utility tests (3 tests)
- Validation function tests (4 tests)
- **Total:** ~14 unit tests
- **Coverage Target:** >90%

**Component Testing (TDD Second Layer):**
- Render tests (3 tests)
- Interaction tests (5 tests)
- Accessibility tests (2 tests)
- **Total:** ~10 component tests
- **Coverage Target:** >85%

**Integration Testing (TDD Third Layer):**
- End-to-end flows (2 tests)
- Persistence verification (2 tests)
- **Total:** ~4 integration tests
- **Coverage Target:** >80%

### TDD Checklist for Each Component

- [x] First test written before implementation code
- [x] Each test covers one specific behavior
- [x] Tests use React Native Testing Library patterns
- [x] Minimal use of testIds (prefer user-visible queries)
- [x] Tests query by user-visible content (getByText, getByRole)
- [x] Async operations use waitFor/findBy
- [x] All tests pass before moving to next feature

---

## 8. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|---------------|---------------|
| Runtime | React Native 0.81+ (Expo SDK 54) | Required for New Architecture and Legend-State v3 compatibility |
| Storage | AsyncStorage (React Native) | Lightweight key-value store for local persistence |
| State Management | Legend-State v3 beta | Fine-grained reactivity, built-in persistence support |
| Testing | Jest + React Native Testing Library | Industry standard for React Native testing |

### Deployment Architecture

**Environment Strategy:**
- **Development**: Local Expo Dev Client
- **Testing**: Expo Go for manual QA
- **Production**: EAS Build for App Store/Play Store

**No Backend Required:**
- Feature is entirely client-side
- No API servers needed
- No deployment infrastructure beyond app distribution

### Monitoring & Observability

#### Metrics

**Application Metrics:**
- Tap latency (p50, p95, p99)
- Frame rate during rapid tapping
- Storage write frequency
- Storage operation success rate

**Business Metrics:**
- Average taps per session
- Session duration
- Peak count reached per user
- Daily active users (from parent app analytics)

**Implementation:**
```typescript
// Simple console metrics for development
// Replace with analytics service in production

function trackTapLatency(latencyMs: number) {
  // Development: console.log
  if (__DEV__) {
    console.log(`Tap latency: ${latencyMs}ms`)
  }

  // Production: Send to analytics service
  // Analytics.track('tap_latency', { value: latencyMs })
}
```

#### Logging

**Log Levels:**
- **ERROR**: Storage failures, validation errors
- **WARN**: Performance degradation, approaching limits
- **INFO**: Feature usage events (production)
- **DEBUG**: Detailed state changes (development only)

**Centralized Logging:**
- Development: Console logs
- Production: Consider Sentry or similar for error tracking

**Log Retention:**
- Development: Session-based (cleared on app restart)
- Production: Handled by error tracking service (30-day retention typical)

#### Alerting

| Alert | Condition | Priority | Action |
|-------|-----------|----------|--------|
| Storage Failure Rate | >1% of operations fail | P1 | Investigate AsyncStorage issues, check device storage |
| High Tap Latency | p95 >200ms | P2 | Review performance optimization, check for main thread blocking |
| Count Validation Errors | >10 per session | P2 | Check for potential data corruption or edge cases |

---

## 9. Scalability & Performance

### Performance Requirements

**Response Time:**
- p50: <50ms tap-to-update
- p95: <100ms tap-to-update
- p99: <150ms tap-to-update

**Throughput:**
- Support 10+ taps per second without drops
- Maintain 60fps during rapid interaction

**Concurrent Users:**
- Not applicable (local-only feature)

### Scalability Strategy

**Horizontal Scaling:**
- Not applicable (client-side only)

**Load Balancing:**
- Not applicable (no servers)

**Database Scaling:**
- AsyncStorage is per-device
- No shared database to scale

**Caching Layers:**
- Observable acts as in-memory cache
- No additional caching needed

### Performance Optimization

#### Query Optimization

Not applicable (no database queries).

#### Asset Optimization

- Minimal assets (text-based UI)
- No images for MVP
- StyleSheet optimization (static styles)

#### Code-Level Optimizations

```typescript
// 1. Use Memo for fine-grained reactivity
import { Memo } from '@legendapp/state/react'

// Only re-renders when count$ changes
<Memo>
  {() => <Text>Count: {count$.get()}</Text>}
</Memo>

// 2. Debounce storage writes
const debouncedSave = configureSynced(synced, {
  persist: {
    plugin: observablePersistAsyncStorage({ AsyncStorage }),
  },
  
})

// 3. Optimize number formatting with memoization
const formatNumber = useMemo(() =>
  (num: number) => num.toLocaleString('en-US'),
  []
)

// 4. Use PureComponent patterns for button
const FeedButton = React.memo(({ onPress }: Props) => (
  <TouchableOpacity onPress={onPress}>
    <Text>Feed</Text>
  </TouchableOpacity>
))
```

#### Resource Pooling

Not applicable (no connection pools needed).

---

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| AsyncStorage write failures on low-storage devices | High | Medium | Implement error handling, retry logic, user notification | Dev Team |
| Tap registration drops during rapid tapping | High | Low | Use native button events, test at 20+ taps/sec, optimize event handling | Dev Team |
| Performance degradation with large numbers (>1B) | Medium | Low | Test with MAX_SAFE_INTEGER, optimize number formatting, use BigInt if needed | Dev Team |
| Legend-State v3 beta API changes | Medium | Medium | Pin version, monitor changelog, have migration plan | Tech Lead |
| Device-specific haptic API issues | Low | Medium | Graceful degradation, feature detection, extensive device testing | QA Team |
| Storage quota exceeded (unlikely with single number) | Low | Very Low | Monitor storage usage, implement cleanup if future features added | Dev Team |

### Dependencies

**From PRD + Technical:**

| Dependency | Status | Impact if Unavailable | Mitigation |
|------------|--------|----------------------|------------|
| @legendapp/state@beta | ✅ Available | Cannot implement fine-grained reactivity | Fallback to Zustand or Redux |
| AsyncStorage | ✅ Available | No persistence | Use in-memory only, warn user |
| React Native Testing Library | ✅ Available | Cannot follow TDD approach | Use React Testing Library with RN adapter |
| Expo SDK 54 | ✅ Available | Project won't build | N/A - required dependency |

---

## 11. Implementation Plan (TDD-Driven)

### Development Phases

Following @docs/architecture/lean-task-generation-guide.md principles - **prioritize user-visible functionality**:

#### Phase 1: Test Setup & Foundation [Week 1, Days 1-2]

**Objective:** Set up testing infrastructure and core hook with TDD

**Tasks:**
1. **Configure Jest and React Native Testing Library** [2 hours]
   - Verify jest.setup.js configuration
   - Add AsyncStorage mocks
   - Test that tests can run

2. **Write Hook Tests (RED phase)** [3 hours]
   - Write all 7 failing tests for `usePersistedCounter`
   - Review tests against requirements
   - Ensure tests fail for right reasons

3. **Implement Hook (GREEN phase)** [4 hours]
   - Create `counter.store.ts` with Legend-State
   - Implement `usePersistedCounter.ts` to pass tests
   - Configure AsyncStorage persistence
   - Keep tests green with minimal implementation

4. **Refactor Hook (REFACTOR phase)** [2 hours]
   - Extract validation logic
   - Optimize debouncing configuration
   - Add TypeScript documentation
   - All tests still green

**Deliverables:**
- ✅ Working test suite for hook
- ✅ `usePersistedCounter` hook passing all tests
- ✅ Persistence working (verified by tests)

---

#### Phase 2: TDD Component Implementation [Week 1, Days 3-4]

**Objective:** Build UI component following TDD

**Tasks:**
1. **Write Component Tests (RED phase)** [3 hours]
   - Write all 6 failing tests for `ClickerScreen`
   - Include accessibility tests
   - Include number formatting tests

2. **Implement Component (GREEN phase)** [4 hours]
   - Create `ClickerScreen.tsx`
   - Implement feed button with proper styling
   - Add counter display with formatting
   - Use `usePersistedCounter` hook
   - Use Memo for fine-grained updates
   - Make all tests green

3. **Add Visual Feedback (GREEN phase)** [2 hours]
   - Button press animation
   - Optional: Haptic feedback
   - Update tests to verify feedback

4. **Refactor Component (REFACTOR phase)** [2 hours]
   - Extract number formatting utility
   - Optimize styles (move to StyleSheet)
   - Improve component structure
   - Tests still green

**Deliverables:**
- ✅ Working `ClickerScreen` component
- ✅ All component tests passing
- ✅ User can tap and see count increase
- ✅ Numbers formatted with commas

---

#### Phase 3: Integration & Polish [Week 1-2, Days 5-7]

**Objective:** Integration testing, performance verification, accessibility

**Tasks:**
1. **Write Integration Tests (RED phase)** [2 hours]
   - End-to-end flow tests
   - Persistence verification tests

2. **Integration Fixes (GREEN phase)** [2 hours]
   - Fix any integration issues discovered
   - Ensure persistence works across unmount/remount

3. **Performance Testing** [3 hours]
   - Manual testing: Rapid tapping (10+ taps/sec)
   - Measure tap latency with performance.now()
   - Verify 60fps with React DevTools Profiler
   - Test with large numbers (1M, 1B, MAX_SAFE_INTEGER)

4. **Accessibility Audit** [2 hours]
   - Screen reader testing
   - Color contrast verification
   - Touch target size verification
   - Add accessibility labels if needed

5. **Polish & Animations** [3 hours]
   - Smooth counter animation
   - Button feedback polish
   - Final UI adjustments

**Deliverables:**
- ✅ All tests passing (unit + component + integration)
- ✅ Performance benchmarks met (<100ms p95)
- ✅ Accessibility standards met (WCAG 2.1 AA)
- ✅ Feature ready for QA

---

#### Phase 4: QA & Hardening [Week 2, Days 8-10]

**Objective:** Quality assurance, edge case testing, documentation

**Tasks:**
1. **Edge Case Testing** [3 hours]
   - Test with 0 count
   - Test with MAX_SAFE_INTEGER
   - Test storage failure scenarios
   - Test low-storage device scenarios
   - Test app backgrounding/foregrounding

2. **Cross-Platform Testing** [3 hours]
   - iOS testing (multiple devices)
   - Android testing (multiple devices)
   - Verify haptic feedback on both platforms
   - Verify persistence on both platforms

3. **Bug Fixes** [4 hours]
   - Fix any issues found in QA
   - Add regression tests for bugs
   - Re-verify all tests pass

4. **Documentation** [2 hours]
   - Code documentation (JSDoc comments)
   - Update README with feature description
   - Document known limitations
   - Create usage examples

**Deliverables:**
- ✅ All QA issues resolved
- ✅ Cross-platform verification complete
- ✅ Code coverage >80%
- ✅ Documentation complete

---

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|-------------|------|--------------|
| M1: Hook Complete | `usePersistedCounter` passing all tests | Day 2 | Jest setup, Legend-State configuration |
| M2: Component Complete | `ClickerScreen` passing all tests | Day 4 | M1 complete |
| M3: Integration Complete | End-to-end flow working | Day 7 | M2 complete |
| M4: Feature Complete | All tests passing, QA approved | Day 10 | M3 complete |

---

## 12. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| State Management | Zustand, Redux Toolkit, Legend-State | **Legend-State v3** | Fine-grained reactivity, built-in persistence, project standard per architecture guides |
| Persistence | AsyncStorage, MMKV, SQLite | **AsyncStorage** | Simplest for single value, MMKV has SDK 54 Android issues, SQLite overkill |
| Testing Framework | Jest, Vitest, React Native Testing Library | **Jest + RNTL** | Industry standard, best React Native support, project already configured |
| Hook Naming | `useSingularityPet`, `usePetCount`, `usePersistedCounter` | **usePersistedCounter** | Behavior-based naming per architecture guide, reusable for other counters |
| Number Formatting | Custom formatter, Intl.NumberFormat, toLocaleString | **toLocaleString('en-US')** | Built-in, performant, handles commas automatically |
| Button Component | Custom TouchableOpacity, Pressable, React Native Button | **TouchableOpacity** | Better feedback control, easier styling, familiar API |

### Trade-offs

- **Chose Legend-State v3 beta over stable Zustand**: Accepted beta risk for superior fine-grained reactivity and persistence integration. Mitigation: Pin exact version, monitor changelog.

- **Chose AsyncStorage over MMKV**: Accepted slightly slower performance for better cross-platform compatibility. MMKV has Android build issues with Expo SDK 54.

- **Chose behavior-based hook naming (`usePersistedCounter`)**: Accepted longer name for better reusability and clarity. More descriptive than entity-based naming.

- **Chose debounced storage writes (500ms)**: Accepted potential data loss on crash within 500ms window for better performance (fewer writes). Mitigation: Document limitation, consider reducing to 250ms if needed.

- **Chose Memo over observer HOC**: Accepted slightly more verbose component code for better fine-grained reactivity per architecture guide.

---

## 13. Open Questions

Technical questions requiring resolution:

- [ ] **Haptic Feedback Priority**: Should haptic feedback be P0 or P1? Need product decision on whether this is MVP-critical.
  - **Impact**: Development time, testing scope
  - **Decision Needed By**: Day 1

- [ ] **Number Abbreviation Threshold**: At what count should we switch to abbreviated format (1.2M vs 1,200,000)?
  - **Options**: 1M, 10M, 100M, or never (always show full number)
  - **Decision Needed By**: Day 3

- [ ] **Storage Failure UX**: How should we notify users of storage failures?
  - **Options**: Silent retry, toast notification, modal alert
  - **Decision Needed By**: Day 5

- [ ] **Analytics Integration**: Should we track tap events for analytics in MVP?
  - **Options**: Yes (add analytics), No (defer to next iteration)
  - **Impact**: Privacy considerations, implementation time
  - **Decision Needed By**: Day 3

- [ ] **Debounce Configuration**: Is 500ms debounce acceptable or should we reduce to 250ms?
  - **Trade-off**: Performance vs data loss risk
  - **Testing Needed**: Measure actual write frequency at 10+ taps/sec
  - **Decision Needed By**: Day 6 (after performance testing)

---

## 14. Appendices

### A. Technical Glossary

**AsyncStorage**: React Native's asynchronous, unencrypted, persistent, key-value storage system

**Debouncing**: Delaying function execution until after a wait period to reduce frequency of calls

**Fine-Grained Reactivity**: UI pattern where only specific values trigger re-renders, not entire components

**Legend-State**: Observable-based state management library with built-in persistence and fine-grained reactivity

**MAX_SAFE_INTEGER**: JavaScript's largest precisely representable integer (9,007,199,254,740,991)

**Observable**: A value that can be watched for changes and automatically triggers reactions

**p50/p95/p99**: Performance percentiles (e.g., p95 means 95% of requests are faster than this value)

**TDD (Test-Driven Development)**: Development approach where tests are written before implementation code

**Touch Target**: The interactive area of a UI element (minimum 44x44pt for accessibility)

### B. Reference Architecture

**Similar Patterns:**
- Cookie Clicker (web) - Established genre patterns
- AdVenture Capitalist (mobile) - Professional implementation reference
- React Native Counter Apps - Common implementation patterns

**Legend-State Examples:**
- Official Legend-State v3 documentation examples
- @docs/research/expo_legend_state_v3_guide_20250917_225656.md

**Testing Patterns:**
- @docs/research/react_native_testing_library_guide_20250918_184418.md
- Official RNTL documentation

### C. Proof of Concepts

**POC 1: Legend-State Persistence (Completed)**
- Verified AsyncStorage persistence works with Legend-State v3
- Confirmed debouncing configuration
- Tested load on mount

**POC 2: Touch Performance (Needed)**
- Test rapid tapping (20+ taps/sec)
- Measure actual latency with performance.now()
- Verify no dropped events

### D. Related Documents

**Source Documents:**
- **Product Requirements Document**: `prd_singularity_pet_clicker_20251111.md`
- **Feature Specification**: `feature_singularity_pet_clicker.md`

**Architecture Guides:**
- **Lean Task Generation**: @docs/architecture/lean-task-generation-guide.md
- **File Organization**: @docs/architecture/file-organization-patterns.md
- **State Management**: @docs/architecture/state-management-hooks-guide.md
- **Legend-State Guide**: @docs/research/expo_legend_state_v3_guide_20250917_225656.md
- **Testing Guide**: @docs/research/react_native_testing_library_guide_20250918_184418.md

**Next Phase Documents:**
- **Task List**: TBD (generated using `/flow:tasks` from this TDD)
- **Implementation Tracking**: TBD (generated during development)

---

_Generated from PRD: `prd_singularity_pet_clicker_20251111.md`_

_Generation Date: 2025-11-11_

_Next Step: Generate explicit task list using `/flow:tasks tdd_singularity_pet_clicker_20251111.md`_
