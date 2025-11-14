# Scrap Passive Generation System - Technical Design Document

## Document Control

| Version | Author    | Date       | Status | Changes              |
| ------- | --------- | ---------- | ------ | -------------------- |
| v1.0    | Claude AI | 2025-11-13 | Draft  | Initial TDD from PRD |

## Executive Summary

Implement a tick-based passive resource generation system using React Native + Legend-State v3 where AI Pets generate "scrap" resources every 1 second. This system establishes the foundational idle game mechanic with fine-grained reactive UI updates, persistent state management, and offline progression calculation, aligning with the PRD goal of creating meaningful passive progression that rewards pet ownership.

---

## 1. Overview & Context

### Problem Statement

Players currently have AI Pets (Singularity Pets via `usePersistedCounter`) but these pets provide no gameplay value beyond incrementing a counter. The application lacks:

- Passive resource economy system
- Idle game progression mechanics
- Offline accumulation rewards
- Incentive for returning to the game

### Solution Approach

Build a **tick-based passive generation system** that:

1. Runs an interval timer (3-second ticks) when app is active
2. Calculates scrap generation based on pet count (1 scrap per pet per tick)
3. Persists scrap count to AsyncStorage with Legend-State sync
4. Calculates offline accumulation on app resume (max 4-hour cap)
5. Displays scrap count and generation rate with fine-grained reactive updates
6. Integrates seamlessly with existing pet counter system

### Success Criteria

**Technical Performance Metrics:**

- Tick accuracy: 3000ms ±100ms tolerance
- UI update latency: < 50ms from tick to scrap count update
- Storage write frequency: Debounced to max 1 write/second
- Memory footprint: < 5MB for tick + state management
- Test coverage: > 80% for new code

**User Experience Metrics:**

- No dropped ticks during normal app usage
- Smooth number animations without jank
- Accurate offline calculation (within 1% of expected)
- No data loss on app termination

---

## 2. Requirements Analysis

### Functional Requirements (Mapped from PRD)

| PRD Req                                              | Technical Implementation                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| **REQ-1.1**: 3-second tick interval                  | `setInterval(3000ms)` with cleanup on unmount/background           |
| **REQ-1.2**: 1 scrap/pet/tick generation             | Formula: `scrapGained = petCount * 1`                              |
| **REQ-1.3**: Only generate if petCount > 0           | Conditional: `if (petCount > 0) generateScrap()`                   |
| **REQ-1.4**: Tick starts when active                 | `useEffect` with `AppState` listener                               |
| **REQ-1.5**: Tick pauses on background               | `AppState.addEventListener('change')` cleanup                      |
| **REQ-2.1**: Display total scrap                     | Reactive `<Memo>{() => <Text>{scrap$.get()}</Text>}</Memo>`        |
| **REQ-2.2**: Show generation rate                    | Computed: `scrapPerSecond = petCount / 3`                          |
| **REQ-2.3**: Visual feedback on tick                 | Optional animation/particle effect (P1)                            |
| **REQ-2.4**: Number formatting (K/M/B)               | Reuse existing `formatNumber` utility                              |
| **REQ-2.5**: Reactive updates without full re-render | Legend-State fine-grained observables                              |
| **REQ-3.1**: Save scrap on change                    | Legend-State `persist` with AsyncStorage                           |
| **REQ-3.2**: Load scrap on init                      | Legend-State auto-hydration from AsyncStorage                      |
| **REQ-3.3**: Pet count determines rate               | Read from existing `usePersistedCounter` observable                |
| **REQ-3.4**: Survives app closure                    | AsyncStorage persistence                                           |
| **REQ-4.1**: Calculate offline scrap                 | Formula: `offlineScrap = min(petCount * ticks, petCount * 48)`     |
| **REQ-4.2**: 4-hour cap (48 ticks max)               | `const maxTicks = 48; const ticks = min(elapsed / 3000, maxTicks)` |
| **REQ-4.3**: Welcome back message                    | Optional UI component (P1)                                         |
| **REQ-4.4**: Apply offline earnings immediately      | Update scrap on `AppState` change to 'active'                      |

### Non-Functional Requirements

#### Performance

- **Tick Precision**: Use `Date.now()` timestamps to prevent drift, not cumulative intervals
- **UI Responsiveness**: All updates via Legend-State observables (no prop drilling)
- **Storage Efficiency**: Debounce writes to 1000ms to prevent excessive I/O
- **Memory Management**: Clear interval on unmount, no memory leaks

#### Security

- **Data Validation**: Validate scrap values (non-negative, finite numbers)
- **NaN Protection**: Guard against `NaN` from calculations
- **Storage Corruption**: Graceful fallback to 0 if corrupted data

#### Scalability

- **Extensible Schema**: Design for future multi-resource support
- **O(1) Calculations**: Constant time regardless of accumulated scrap
- **Modular Design**: Separate concerns (tick, calculation, storage, UI)

---

## 3. System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      ClickerScreen                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  usePersistedCounter (existing)                        │  │
│  │  Returns: count$ (petCount observable)                 │  │
│  └────────────────────┬───────────────────────────────────┘  │
│                       │ Provides petCount                     │
│                       ▼                                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  ScrapCounter (new component)                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  useScrapGeneration(petCount)                    │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │  scrapStore (Legend-State)                 │  │  │  │
│  │  │  │  - scrap: synced<number>                   │  │  │  │
│  │  │  │  - lastTickTime: number                    │  │  │  │
│  │  │  │  - lastActiveTime: number                  │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │  Tick Timer (setInterval 3000ms)           │  │  │  │
│  │  │  │  - Generates scrap every tick              │  │  │  │
│  │  │  │  - Updates scrap$ observable               │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │  AppState Listener                         │  │  │  │
│  │  │  │  - Pauses/resumes tick timer               │  │  │  │
│  │  │  │  - Calculates offline scrap on resume      │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  │                                                  │  │  │
│  │  │  Returns:                                        │  │  │
│  │  │  - scrap$ (observable)                           │  │  │
│  │  │  - generationRate$ (computed observable)        │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  UI Rendering (fine-grained):                           │  │
│  │  <Memo>{() => formatNumber(scrap$.get())}</Memo>        │  │
│  │  <Memo>{() => generationRate$.get()}/sec</Memo>         │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

External Dependencies:
- AsyncStorage (persistence)
- AppState API (lifecycle)
- Legend-State v3 (state + sync)
```

### Component Design

#### ScrapCounter Component

- **Purpose**: Display scrap count and generation rate with visual feedback
- **Responsibilities**:
  - Render scrap amount (formatted)
  - Render generation rate (scrap/second)
  - Optional visual effects on tick (P1)
- **Interfaces**:
  - Props: `{ petCount: number, style?: StyleProp<ViewStyle> }`
  - Uses: `useScrapGeneration(petCount)` hook
- **Dependencies**: `useScrapGeneration`, `formatNumber`, Legend-State `<Memo>`

#### useScrapGeneration Hook

- **Purpose**: Provides tick-based scrap generation behavior with offline calculation
- **Responsibilities**:
  - Initialize scrap store with persistence
  - Start/stop tick interval based on AppState
  - Calculate offline scrap on resume
  - Provide scrap observable and generation rate
- **Interfaces**:
  ```typescript
  function useScrapGeneration(petCount: number): {
    scrap$: Observable<number>;
    generationRate$: Observable<number>; // scrap per second
  };
  ```
- **Dependencies**: `scrapStore`, `calculateOfflineScrap`, AppState, Legend-State

#### scrapStore (Legend-State)

- **Purpose**: Private observable store for scrap state
- **Responsibilities**:
  - Persist scrap count to AsyncStorage
  - Track last tick time for offline calculation
  - Track last active time for elapsed calculation
  - Validate scrap values (non-negative, finite)
- **Interfaces**:
  ```typescript
  interface ScrapStoreState {
    scrap: number; // synced with AsyncStorage
    lastTickTime: number; // timestamp of last tick (for debugging)
    lastActiveTime: number; // timestamp when app last became active
  }
  ```
- **Dependencies**: Legend-State, AsyncStorage plugin

### Data Flow

#### Active Generation Flow (User Present)

```
1. User opens app / app is active
   └─> AppState listener detects 'active'
       └─> useScrapGeneration starts tick interval (3000ms)
           └─> Every 1 second:
               ├─> Read petCount from prop
               ├─> Calculate: scrapGained = petCount * 1
               ├─> Update: scrap$.set(current + scrapGained)
               │   └─> Legend-State triggers AsyncStorage write (debounced)
               ├─> Update: lastTickTime = Date.now()
               └─> UI re-renders via <Memo> observing scrap$
```

#### Offline Accumulation Flow (User Returns)

```
1. User returns to app after being away
   └─> AppState listener detects 'background' -> 'active' transition
       └─> Calculate offline scrap:
           ├─> elapsed = Date.now() - lastActiveTime
           ├─> ticksPassed = Math.floor(elapsed / 3000)
           ├─> cappedTicks = Math.min(ticksPassed, 48) // 4-hour cap
           ├─> offlineScrap = petCount * cappedTicks
           └─> scrap$.set(current + offlineScrap)
               └─> UI shows updated scrap amount
```

---

## 4. API Design

### Internal APIs

#### useScrapGeneration Hook API

```typescript
/**
 * Custom hook providing tick-based scrap generation with offline accumulation
 *
 * @param petCount - Current number of pets (drives generation rate)
 * @returns Observable scrap count and computed generation rate
 *
 * @example
 * const { scrap$, generationRate$ } = useScrapGeneration(petCount)
 * <Memo>{() => <Text>{scrap$.get()}</Text>}</Memo>
 */
function useScrapGeneration(petCount: number): UseScrapGenerationReturn;

interface UseScrapGenerationReturn {
  scrap$: Observable<number>;
  generationRate$: Observable<number>; // scrap per second (petCount / 3)
}
```

#### calculateOfflineScrap Utility

```typescript
/**
 * Calculates scrap earned during offline period with 4-hour cap
 *
 * @param petCount - Number of pets during offline period
 * @param elapsedMs - Time elapsed since last active (milliseconds)
 * @param tickInterval - Tick interval in ms (default: 3000)
 * @param maxTicks - Maximum ticks to accumulate (default: 48 = 4 hours)
 * @returns Scrap earned offline
 */
function calculateOfflineScrap(
  petCount: number,
  elapsedMs: number,
  tickInterval?: number,
  maxTicks?: number
): number;
```

#### validateScrap Utility

```typescript
/**
 * Validates and constrains scrap values to prevent invalid states
 *
 * @param value - Scrap value to validate
 * @returns Valid scrap value (non-negative, finite, integer)
 */
function validateScrap(value: number): number;
```

### External Integrations

**AsyncStorage (React Native)**

- Used via Legend-State `observablePersistAsyncStorage` plugin
- Storage key: `scrap-count-v1`
- Auto-sync with debounce (1000ms)

**AppState (React Native)**

- Event: `change` event with states: `active`, `background`, `inactive`
- Purpose: Detect app lifecycle for tick pause/resume and offline calc

---

## 5. Data Model

### ScrapStore Entity

```typescript
interface ScrapStoreState {
  // Persisted fields
  scrap: number; // Total accumulated scrap (synced to AsyncStorage)
  lastActiveTime: number; // Unix timestamp when app last became active

  // Runtime fields (not persisted)
  lastTickTime: number; // Unix timestamp of last tick (for debugging)
}

// Constraints
const SCRAP_CONSTRAINTS = {
  MIN_VALUE: 0,
  MAX_VALUE: Number.MAX_SAFE_INTEGER,
  TICK_INTERVAL_MS: 3000,
  MAX_OFFLINE_TICKS: 48, // 4 hours * 60 min * 60 sec / 3 sec = 4800 ticks, but capped at 48 for 4 hours
  DEBOUNCE_MS: 1000, // AsyncStorage write debounce
};
```

### Database Schema (AsyncStorage)

```json
{
  "scrap-count-v1": {
    "scrap": 1234,
    "lastActiveTime": 1699876543210
  }
}
```

**Indexes**: N/A (AsyncStorage is key-value)
**Data Validation**:

- `validateScrap()` ensures non-negative, finite, integer values
- Legend-State `configureSynced` handles serialization/deserialization

**Migration Strategy**:

- V1: Initial schema (scrap + lastActiveTime)
- Future V2: Add `scrapLifetime`, `totalTicksProcessed` (new storage key: `scrap-count-v2`)

### Data Access Patterns

**Common Queries**:

1. **Read scrap on mount**: `scrap$.get()` - O(1) from in-memory observable
2. **Update scrap on tick**: `scrap$.set(newValue)` - O(1) update + async persist
3. **Load from AsyncStorage**: Automatic on init via Legend-State hydration

**Caching Strategy**:

- Legend-State keeps state in-memory
- AsyncStorage writes are debounced (1000ms)
- Reads from AsyncStorage only on app cold start

**Data Consistency**:

- Single source of truth: `scrapStore.scrap` observable
- AsyncStorage is always eventual consistency (no conflicts)
- No server sync in MVP (all local)

---

## 6. Security Design

### Authentication & Authorization

**Not Applicable** - Local-only MVP with no server communication

### Data Security

**Encryption at Rest**: Not implemented in MVP (AsyncStorage plaintext)

- **Rationale**: Scrap is non-sensitive game data, no PII
- **Future**: Could encrypt with `react-native-encrypted-storage` if needed

**Encryption in Transit**: N/A (no network calls)

**PII Handling**: No PII collected

**Audit Logging**:

- Development mode: Console warnings for invalid values
- Production: Silent correction with `validateScrap()`

### Security Controls

**Input Validation**:

```typescript
function validateScrap(value: number): number {
  if (!Number.isFinite(value)) {
    console.warn("[Scrap] Invalid number, resetting to 0");
    return 0;
  }
  if (value < 0) {
    console.warn("[Scrap] Negative value not allowed, setting to 0");
    return 0;
  }
  if (value > Number.MAX_SAFE_INTEGER) {
    console.warn("[Scrap] Value exceeds max, capping");
    return Number.MAX_SAFE_INTEGER;
  }
  return Math.floor(value);
}
```

**Rate Limiting**: N/A (local calculations)

**CORS Policies**: N/A (no server)

**Security Headers**: N/A (mobile app)

---

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

All implementation follows **Red-Green-Refactor** cycle using React Native Testing Library + Jest.

#### Testing Framework & Tools

- **Framework**: React Native Testing Library (RNTL)
- **Reference**: `@docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Test Runner**: Jest with `jest-expo` preset
- **Mocking**: Jest mocks for AsyncStorage, AppState, timers

#### TDD Implementation Process

For each feature/component, follow this strict order:

**1. RED Phase - Write Failing Test First**

```typescript
// Example: Scrap generation test
test("generates 1 scrap per pet every 1 second", () => {
  const { result } = renderHook(() => useScrapGeneration(2)); // 2 pets

  expect(result.current.scrap$.get()).toBe(0); // Initial

  act(() => {
    jest.advanceTimersByTime(3000); // 1 tick
  });

  expect(result.current.scrap$.get()).toBe(2); // 2 pets * 1 scrap
});
// This test MUST fail initially (hook doesn't exist yet)
```

**2. GREEN Phase - Minimal Implementation**

- Write ONLY enough code to pass the test
- No extra features or optimizations
- Focus on making test green

**3. REFACTOR Phase - Improve Code**

- Clean up implementation
- Extract utilities/helpers
- Maintain all green tests

### Test Categories (in order of implementation)

#### Phase 1: Unit Testing (TDD First Layer)

**1.1 Utility Functions (Pure Logic)**

```typescript
// utils/scrapCalculations.test.ts
describe("calculateOfflineScrap", () => {
  test("calculates scrap for elapsed time", () => {
    // 2 pets, 9000ms elapsed (3 ticks), 3000ms tick interval
    expect(calculateOfflineScrap(2, 9000, 3000)).toBe(6); // 2 * 3 ticks
  });

  test("caps offline accumulation at max ticks", () => {
    // 2 pets, 24 hours elapsed, max 48 ticks
    const oneDayMs = 24 * 60 * 60 * 1000;
    expect(calculateOfflineScrap(2, oneDayMs, 3000, 48)).toBe(96); // 2 * 48
  });

  test("returns 0 if no pets", () => {
    expect(calculateOfflineScrap(0, 9000)).toBe(0);
  });

  test("returns 0 if negative elapsed time", () => {
    expect(calculateOfflineScrap(2, -1000)).toBe(0);
  });
});

describe("validateScrap", () => {
  test("allows valid positive numbers", () => {
    expect(validateScrap(100)).toBe(100);
  });

  test("floors decimal values", () => {
    expect(validateScrap(10.7)).toBe(10);
  });

  test("rejects negative values", () => {
    expect(validateScrap(-5)).toBe(0);
  });

  test("rejects NaN", () => {
    expect(validateScrap(NaN)).toBe(0);
  });

  test("rejects Infinity", () => {
    expect(validateScrap(Infinity)).toBe(0);
  });
});
```

**1.2 Store Logic**

```typescript
// stores/scrap.store.test.ts
describe("scrapStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("initializes with default scrap value of 0", () => {
    const store = createScrapStore();
    expect(store.scrap.get()).toBe(0);
  });

  test("persists scrap to AsyncStorage", async () => {
    const store = createScrapStore();

    store.scrap.set(100);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "scrap-count-v1",
        expect.stringContaining('"scrap":100')
      );
    });
  });

  test("loads scrap from AsyncStorage on init", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify({ scrap: 250, lastActiveTime: Date.now() })
    );

    const store = createScrapStore();

    await waitFor(() => {
      expect(store.scrap.get()).toBe(250);
    });
  });
});
```

**1.3 Hook Logic**

```typescript
// hooks/useScrapGeneration.test.ts
describe("useScrapGeneration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("initializes with scrap at 0", () => {
    const { result } = renderHook(() => useScrapGeneration(0));
    expect(result.current.scrap$.get()).toBe(0);
  });

  test("generates scrap every 1 second based on pet count", async () => {
    const { result } = renderHook(() => useScrapGeneration(3)); // 3 pets

    expect(result.current.scrap$.get()).toBe(0);

    // First tick
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(result.current.scrap$.get()).toBe(3); // 3 pets * 1
    });

    // Second tick
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(result.current.scrap$.get()).toBe(6); // 3 pets * 2 ticks
    });
  });

  test("does not generate scrap if pet count is 0", async () => {
    const { result } = renderHook(() => useScrapGeneration(0));

    act(() => {
      jest.advanceTimersByTime(9000); // 3 ticks
    });

    await waitFor(() => {
      expect(result.current.scrap$.get()).toBe(0);
    });
  });

  test("stops tick timer when unmounted", () => {
    const { unmount } = renderHook(() => useScrapGeneration(2));

    unmount();

    // Timer should be cleared (no error on advance)
    expect(() => {
      jest.advanceTimersByTime(3000);
    }).not.toThrow();
  });

  test("computes generation rate correctly", () => {
    const { result } = renderHook(() => useScrapGeneration(6)); // 6 pets

    // 6 pets / 1 second = 2 scrap per second
    expect(result.current.generationRate$.get()).toBeCloseTo(2, 1);
  });

  test("updates generation rate when pet count changes", () => {
    const { result, rerender } = renderHook(
      ({ petCount }) => useScrapGeneration(petCount),
      { initialProps: { petCount: 3 } }
    );

    expect(result.current.generationRate$.get()).toBeCloseTo(1, 1);

    rerender({ petCount: 9 });

    expect(result.current.generationRate$.get()).toBeCloseTo(3, 1);
  });
});
```

**1.4 Offline Calculation**

```typescript
// hooks/useScrapGeneration.test.ts (continued)
describe("useScrapGeneration - Offline Accumulation", () => {
  test("calculates offline scrap on app resume", async () => {
    // Mock AppState
    let appStateListener: (state: string) => void;
    AppState.addEventListener = jest.fn((event, callback) => {
      appStateListener = callback;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useScrapGeneration(4)); // 4 pets

    // Simulate app going to background
    act(() => {
      appStateListener("background");
    });

    // Simulate 9 seconds offline (3 ticks * 4 pets = 12 scrap)
    const nineSecondsLater = Date.now() + 9000;
    jest.setSystemTime(nineSecondsLater);

    // Simulate app coming back to foreground
    act(() => {
      appStateListener("active");
    });

    await waitFor(() => {
      expect(result.current.scrap$.get()).toBe(12); // 4 pets * 3 ticks
    });
  });

  test("caps offline accumulation at 4 hours (48 ticks)", async () => {
    let appStateListener: (state: string) => void;
    AppState.addEventListener = jest.fn((event, callback) => {
      appStateListener = callback;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useScrapGeneration(2)); // 2 pets

    act(() => {
      appStateListener("background");
    });

    // Simulate 24 hours offline (way more than 4-hour cap)
    const twentyFourHoursLater = Date.now() + 24 * 60 * 60 * 1000;
    jest.setSystemTime(twentyFourHoursLater);

    act(() => {
      appStateListener("active");
    });

    await waitFor(() => {
      // Max 48 ticks * 2 pets = 96 scrap
      expect(result.current.scrap$.get()).toBe(96);
    });
  });
});
```

#### Phase 2: Integration Testing (TDD Second Layer)

**2.1 Component Integration**

```typescript
// ScrapCounter.test.tsx
describe("ScrapCounter Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("displays initial scrap count of 0", () => {
    render(<ScrapCounter petCount={0} />);

    expect(screen.getByText(/scrap:/i)).toBeTruthy();
    expect(screen.getByText(/0/)).toBeTruthy();
  });

  test("displays scrap count after tick", async () => {
    render(<ScrapCounter petCount={5} />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.getByText(/5/)).toBeTruthy(); // 5 scrap from 5 pets
    });
  });

  test("formats large numbers correctly", async () => {
    render(<ScrapCounter petCount={1000} />);

    act(() => {
      jest.advanceTimersByTime(3000); // 1000 scrap
    });

    await waitFor(() => {
      expect(screen.getByText(/1\.0K/i)).toBeTruthy();
    });
  });

  test("displays generation rate", () => {
    render(<ScrapCounter petCount={6} />);

    // 6 pets / 1 second = 2 scrap/sec
    expect(screen.getByText(/2\.0.*\/sec/i)).toBeTruthy();
  });

  test("updates when pet count changes", async () => {
    const { rerender } = render(<ScrapCounter petCount={2} />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.getByText(/2/)).toBeTruthy();
    });

    // Pet count increases
    rerender(<ScrapCounter petCount={5} />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      // Previous 2 + new 5 = 7 total
      expect(screen.getByText(/7/)).toBeTruthy();
    });
  });
});
```

**2.2 Integration with ClickerScreen**

```typescript
// ClickerScreen.test.tsx (updated)
describe("ClickerScreen - Scrap Integration", () => {
  test("displays scrap counter", () => {
    render(<ClickerScreen />);

    expect(screen.getByText(/scrap:/i)).toBeTruthy();
  });

  test("scrap counter responds to pet count changes", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    render(<ClickerScreen />);

    const feedButton = screen.getByTestId("feed-button");

    // Feed 3 times to get 3 pets
    for (let i = 0; i < 3; i++) {
      await user.press(feedButton);
    }

    // Wait for pet count to update
    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 3/i)).toBeTruthy();
    });

    // Advance timer for 1 tick
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Should have 3 scrap (3 pets * 1 scrap)
    await waitFor(() => {
      expect(screen.getByText(/3/)).toBeTruthy(); // scrap display
    });

    jest.useRealTimers();
  });
});
```

#### Phase 3: End-to-End Testing (TDD Third Layer)

**3.1 Complete User Flow**

```typescript
// e2e/scrapGeneration.e2e.test.ts
describe("Scrap Generation E2E", () => {
  test("complete flow: feed pets -> generate scrap -> offline accumulation", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    // 1. Start with clean slate
    await AsyncStorage.clear();

    render(<ClickerScreen />);

    // 2. Feed to get 2 pets
    const feedButton = screen.getByTestId("feed-button");
    await user.press(feedButton);
    await user.press(feedButton);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 2/i)).toBeTruthy();
    });

    // 3. Wait for 2 ticks (6 seconds)
    act(() => {
      jest.advanceTimersByTime(6000);
    });

    // Should have 4 scrap (2 pets * 2 ticks)
    await waitFor(() => {
      expect(screen.getByText(/4/)).toBeTruthy();
    });

    // 4. Simulate app going to background
    act(() => {
      AppState.currentState = "background";
      AppState.emit("change", "background");
    });

    // 5. Simulate 12 seconds offline (4 ticks)
    jest.advanceTimersByTime(12000);

    // 6. Simulate app returning to foreground
    act(() => {
      AppState.currentState = "active";
      AppState.emit("change", "active");
    });

    // Should add 8 offline scrap (2 pets * 4 ticks) to existing 4 = 12 total
    await waitFor(() => {
      expect(screen.getByText(/12/)).toBeTruthy();
    });

    jest.useRealTimers();
  });
});
```

**3.2 Persistence E2E**

```typescript
describe("Scrap Persistence E2E", () => {
  test("scrap persists across app restarts", async () => {
    jest.useFakeTimers();

    // First render - generate some scrap
    const { unmount } = render(<ClickerScreen storageKey="test-pet-count" />);

    act(() => {
      jest.advanceTimersByTime(9000); // 3 ticks with 0 pets = still 0
    });

    // Manually set scrap for testing
    await AsyncStorage.setItem(
      "scrap-count-v1",
      JSON.stringify({
        scrap: 500,
        lastActiveTime: Date.now(),
      })
    );

    unmount();

    // Second render - should load persisted scrap
    render(<ClickerScreen storageKey="test-pet-count" />);

    await waitFor(() => {
      expect(screen.getByText(/500/)).toBeTruthy();
    });

    jest.useRealTimers();
  });
});
```

### TDD Checklist for Each Component

- [ ] First test written before any implementation code
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns
- [ ] No testIds unless absolutely necessary (use accessibility queries)
- [ ] Tests query by user-visible content (text, labels, roles)
- [ ] Async operations use `waitFor`/`findBy`
- [ ] All tests pass before next feature
- [ ] Legend-State observables tested with `waitFor` (async updates)
- [ ] Timers mocked with `jest.useFakeTimers()`
- [ ] AppState mocked for lifecycle testing

---

## 8. Infrastructure & Deployment

### Infrastructure Requirements

| Component   | Specification               | Justification                                 |
| ----------- | --------------------------- | --------------------------------------------- |
| Storage     | AsyncStorage (React Native) | Local key-value storage, sufficient for MVP   |
| Persistence | Legend-State sync plugin    | Automatic state persistence with debouncing   |
| Timers      | JavaScript `setInterval`    | Built-in, sufficient for 3-second ticks       |
| Lifecycle   | React Native AppState API   | Detect background/foreground for offline calc |

### Deployment Architecture

**Environment Strategy**:

- Development: Expo development client
- Testing: Jest test environment
- Production: Expo build (EAS Build for production apps)

**No Backend/Server** in MVP - purely client-side

### Monitoring & Observability

#### Metrics

**Application Metrics** (for future analytics):

- Scrap generation rate (average per session)
- Offline scrap accumulation (average return bonus)
- Tick accuracy (measure drift over time)
- Storage write frequency

**Development Metrics**:

- Console warnings for invalid scrap values
- Timer drift measurement (log expected vs actual tick times)

#### Logging

**Log Levels**:

- `__DEV__` mode: Verbose warnings for validation failures
- Production: Silent corrections, no user-facing errors

**Example Logs**:

```typescript
if (__DEV__) {
  console.log("[Scrap] Tick fired, generated", scrapGained, "scrap");
  console.warn("[Scrap] Offline calc: elapsed=", elapsed, "ticks=", ticks);
}
```

#### Alerting

**Not applicable for local-only MVP** - no remote monitoring

---

## 9. Scalability & Performance

### Performance Requirements (from PRD)

- **Tick Precision**: 3000ms ±100ms tolerance ✓
- **UI Update Latency**: < 50ms from tick to visible update ✓ (Legend-State fine-grained)
- **Storage Write Frequency**: Max 1 write/second via debouncing ✓
- **Memory Footprint**: < 5MB for tick + state (easily achievable with simple timer)

### Scalability Strategy

**Horizontal Scaling**: N/A (client-side app)

**Future Multi-Resource Support**:

```typescript
// Extensible design for future resources
interface ResourceStore {
  scrap: ScrapState;
  metals: ResourceState; // future
  components: ResourceState; // future
}

interface ResourceState {
  amount: number;
  lastTickTime: number;
  lastActiveTime: number;
}
```

### Performance Optimization

**Tick Timer Optimization**:

- Use `Date.now()` timestamps to prevent cumulative drift
- Clear interval on unmount to prevent memory leaks
- Pause timer when app is backgrounded (save battery)

**UI Rendering Optimization**:

- Fine-grained reactivity with `<Memo>` - only scrap/rate update, not full component
- Debounced AsyncStorage writes (1000ms)
- Number formatting utility cached (pure function)

**Offline Calculation Optimization**:

- O(1) calculation (simple math, no loops)
- Capped at 48 ticks to prevent huge calculations on long offline periods

**Code-Level Optimizations**:

```typescript
// Use computed observables for derived state (auto-caching)
const generationRate$ = computed(() => (petCount / TICK_INTERVAL_MS) * 1000);

// Memoize hook returns to prevent re-creation
return useMemo(() => ({ scrap$, generationRate$ }), [scrap$, petCount]);
```

---

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk                                                                              | Impact | Probability | Mitigation                                                                  | Owner    |
| --------------------------------------------------------------------------------- | ------ | ----------- | --------------------------------------------------------------------------- | -------- |
| **Timer Drift**: Cumulative `setInterval` errors cause inaccurate ticks           | Medium | High        | Use `Date.now()` timestamps, calculate expected vs actual tick time         | Frontend |
| **AppState Detection**: App lifecycle events not firing correctly on some devices | High   | Low         | Test on multiple devices, add fallback to manual check on visibility change | Frontend |
| **AsyncStorage Write Failures**: Scrap not persisted on crash                     | High   | Low         | Legend-State `retrySync: true`, test crash recovery scenarios               | Frontend |
| **NaN/Infinity Propagation**: Invalid calculations corrupt state                  | Medium | Medium      | `validateScrap()` on all updates, unit tests for edge cases                 | Frontend |
| **Memory Leak**: Interval not cleared on unmount                                  | Low    | Low         | `useEffect` cleanup function, test with multiple mount/unmount cycles       | Frontend |
| **Offline Calc Overflow**: Extremely long offline time causes overflow            | Low    | Very Low    | Cap at 48 ticks (4 hours), use `Math.floor()` for safety                    | Frontend |
| **Pet Count Desync**: Pet count and scrap count stored separately                 | Medium | Low         | Both use Legend-State persistence with retry, eventual consistency          | Frontend |

### Dependencies

| Dependency                       | Type     | Mitigation                                                    |
| -------------------------------- | -------- | ------------------------------------------------------------- |
| **Existing usePersistedCounter** | Internal | Well-tested existing system, read-only access to `count$`     |
| **Legend-State v3**              | External | Beta version, monitor changelog, pin version in package.json  |
| **AsyncStorage**                 | External | Stable React Native API, fallback to in-memory if unavailable |
| **AppState API**                 | External | Standard React Native, test on iOS + Android                  |
| **formatNumber Utility**         | Internal | Existing utility, already tested                              |

---

## 11. Implementation Plan (TDD-Driven)

Following `@docs/architecture/lean-task-generation-guide.md` principles - prioritize user-visible functionality:

### Phase 1: Foundation & Test Setup [Day 1]

**Deliverables**:

- Test utilities configured (jest.setup.js with AsyncStorage, AppState mocks)
- Scrap constraints and types defined
- Test file scaffolding created

**Tasks (TDD)**:

1. Write test for `validateScrap()` utility (RED)
2. Implement `validateScrap()` to pass tests (GREEN)
3. Write test for `calculateOfflineScrap()` (RED)
4. Implement `calculateOfflineScrap()` (GREEN)
5. Refactor utilities if needed

### Phase 2: Core Generation System [Day 2-3]

**Deliverables**:

- `scrapStore` with persistence
- `useScrapGeneration` hook with tick timer
- Offline accumulation logic

**Tasks (TDD)**:

1. **Store Layer**:

   - Write test: "scrapStore initializes with 0 scrap" (RED)
   - Implement `createScrapStore()` (GREEN)
   - Write test: "scrapStore persists to AsyncStorage" (RED)
   - Add Legend-State sync (GREEN)
   - Write test: "scrapStore loads from AsyncStorage" (RED)
   - Implement hydration (GREEN)

2. **Hook Layer**:

   - Write test: "useScrapGeneration starts tick timer" (RED)
   - Implement basic hook with `useEffect` + `setInterval` (GREEN)
   - Write test: "generates scrap every 1 second" (RED)
   - Implement tick logic: `scrap$.set(current + petCount)` (GREEN)
   - Write test: "stops timer on unmount" (RED)
   - Add cleanup function (GREEN)
   - Write test: "calculates offline scrap on resume" (RED)
   - Implement AppState listener (GREEN)

3. **Refactor**:
   - Extract tick logic to separate function
   - Extract AppState handling to separate function
   - Ensure all tests still pass

### Phase 3: UI Component [Day 3-4]

**Deliverables**:

- `ScrapCounter` component
- Integration with `ClickerScreen`
- Visual styling

**Tasks (TDD)**:

1. **Component Tests**:

   - Write test: "ScrapCounter displays scrap count" (RED)
   - Create basic component with `<Memo>` (GREEN)
   - Write test: "ScrapCounter formats large numbers" (RED)
   - Add `formatNumber()` integration (GREEN)
   - Write test: "ScrapCounter displays generation rate" (RED)
   - Add `generationRate$` display (GREEN)

2. **Integration Tests**:

   - Write test: "ClickerScreen includes ScrapCounter" (RED)
   - Add `<ScrapCounter>` to ClickerScreen (GREEN)
   - Write test: "Scrap updates when pets increase" (RED)
   - Pass `count$` from usePersistedCounter (GREEN)

3. **Styling**:
   - Apply styles for positioning (top-right corner)
   - Add background, padding, border-radius
   - Ensure accessibility (readable contrast)

### Phase 4: Testing & Hardening [Day 4-5]

**Deliverables**:

- Full E2E test suite passing
- Edge case coverage
- Documentation

**Tasks**:

1. E2E test: Complete user flow (feed → generate → offline → persist)
2. Edge case tests: 0 pets, negative elapsed, huge offline time
3. Performance test: Verify tick accuracy over 100 ticks
4. Accessibility test: Screen reader labels, contrast ratios
5. Documentation: Code comments, README updates

### Technical Milestones

| Milestone | Deliverable                              | Date  | Dependencies |
| --------- | ---------------------------------------- | ----- | ------------ |
| M1        | Utility functions tested + implemented   | Day 1 | None         |
| M2        | scrapStore with persistence working      | Day 2 | M1           |
| M3        | useScrapGeneration hook with ticking     | Day 3 | M2           |
| M4        | ScrapCounter UI component integrated     | Day 4 | M3           |
| M5        | Full E2E tests passing, ready for review | Day 5 | M4           |

**Total Timeline**: 4-5 days (aligns with PRD estimate)

---

## 12. Decision Log

### Architecture Decisions

| Decision                | Options Considered                                       | Choice                            | Rationale                                                              |
| ----------------------- | -------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| **State Management**    | useState, Zustand, Legend-State                          | Legend-State                      | Already used in project, fine-grained reactivity, built-in persistence |
| **Tick Mechanism**      | setTimeout recursion, setInterval, requestAnimationFrame | setInterval                       | Simple, adequate for 3-second intervals, easier to test                |
| **Offline Calculation** | Server-based, client-based with cap, unlimited           | Client-based with 4-hour cap      | No server in MVP, cap prevents abuse/overflow                          |
| **Storage**             | AsyncStorage, MMKV, Encrypted Storage                    | AsyncStorage                      | Already configured, sufficient for MVP, non-sensitive data             |
| **Number Formatting**   | Custom, numeral.js, existing formatNumber                | Existing formatNumber utility     | Already tested, no new dependency                                      |
| **Hook Pattern**        | Global store, custom hook, context                       | Custom hook (behavior-based)      | Follows project pattern (`usePersistedCounter`), encapsulates logic    |
| **Testing Strategy**    | E2E only, Unit only, TDD with all layers                 | TDD with Unit → Integration → E2E | PRD requirement, best practice for reliability                         |

### Trade-offs

**Trade-off 1**: Chose **client-side offline calculation** over **server-based tracking**

- **Reason**: MVP has no backend, reduces complexity, faster to implement
- **Limitation**: Player could manipulate local time (accepted for MVP)
- **Future**: Add server sync in later version with conflict resolution

**Trade-off 2**: Chose **4-hour offline cap** over **unlimited accumulation**

- **Reason**: Prevents overflow bugs, reduces incentive for long absence
- **Limitation**: Players offline >4 hours don't get more scrap
- **Future**: Could add "offline manager" upgrade to extend cap

**Trade-off 3**: Chose **setInterval** over **requestAnimationFrame**

- **Reason**: 3-second tick doesn't need frame-perfect timing, simpler to test
- **Limitation**: Potential drift over very long sessions (mitigated with timestamps)
- **Future**: Could switch to rAF + timestamp-based system if drift is issue

**Trade-off 4**: Accepted **AsyncStorage plaintext** over **encrypted storage**

- **Reason**: Scrap is non-sensitive game data, encryption adds complexity
- **Limitation**: Locally modifiable by advanced users (accepted for game)
- **Future**: Add checksum or server validation if anti-cheat needed

---

## 13. Open Questions

**Technical Questions Requiring Resolution:**

- [ ] Should we add visual particle effects on each tick (P1 feature)? If yes, use react-native-reanimated?
- [ ] Should we display a "welcome back" modal showing offline earnings (P1 feature)?
- [ ] What happens if user changes device time backward? Should we detect/prevent negative elapsed time?
- [ ] Should we log tick accuracy metrics in production for monitoring?
- [ ] Do we want a "max scrap storage" cap to prevent Number overflow? (Current: use MAX_SAFE_INTEGER)
- [ ] Should generation rate display scrap/second or scrap/tick? (Current: scrap/second for consistency)

**From PRD Open Questions:**

- [ ] Should offline accumulation show breakdown ("You were gone 2h, collected 240 scrap")?
- [ ] What if pet count decreases in future? (Not possible in current implementation)
- [ ] Visual indicator for "next tick" countdown timer?
- [ ] Haptic feedback on tick for mobile?
- [ ] Pause during tutorials/onboarding?

---

## 14. Appendices

### A. Technical Glossary

- **Tick**: A 3-second interval where scrap generation calculation occurs
- **Scrap**: Primary passive resource collected by AI Pets (integer value, non-negative)
- **Generation Rate**: Scrap produced per second, calculated as `petCount / tickInterval * 1000`
- **Offline Accumulation**: Scrap calculated for time elapsed while app was closed/backgrounded
- **Tick Drift**: Cumulative timing error from `setInterval` imprecision
- **Fine-Grained Reactivity**: Selective re-rendering of only affected UI parts (Legend-State pattern)
- **Observable**: Legend-State primitive representing reactive state (`scrap$`)
- **Debouncing**: Delaying storage writes to batch multiple updates (1000ms)
- **Validation**: Ensuring scrap values are finite, non-negative integers
- **AppState**: React Native API for detecting app lifecycle (active/background/inactive)

### B. Reference Architecture

**Similar Patterns in Project**:

- `usePersistedCounter`: Existing hook pattern we're following
- `counter.store.ts`: Existing store pattern we're mimicking
- `ClickerScreen`: Parent component where ScrapCounter integrates

**External References**:

- [Legend-State Sync Docs](https://legendapp.com/open-source/state/v3/sync/introduction/)
- [React Native AppState](https://reactnative.dev/docs/appstate)
- [RNTL Testing Guide](docs/research/react_native_testing_library_guide_20250918_184418.md)

### C. Proof of Concepts

**Timer Accuracy POC** (to validate tick precision):

```typescript
// Test harness to measure setInterval drift
function measureTickAccuracy(ticks: number) {
  const startTime = Date.now();
  const results: number[] = [];
  let tickCount = 0;

  const interval = setInterval(() => {
    const now = Date.now();
    const expectedTime = startTime + (tickCount + 1) * 3000;
    const drift = now - expectedTime;
    results.push(drift);
    tickCount++;

    if (tickCount >= ticks) {
      clearInterval(interval);
      console.log(
        "Average drift:",
        results.reduce((a, b) => a + b) / results.length
      );
      console.log("Max drift:", Math.max(...results.map(Math.abs)));
    }
  }, 3000);
}
```

### D. Related Documents

- **Product Requirements Document**: `frontend/modules/scrap/specs/prd_scrap_passive_generation_20251113.md`
- **Architecture Guides**:
  - State Management: `docs/architecture/state-management-hooks-guide.md`
  - Lean Development: `docs/architecture/lean-task-generation-guide.md`
  - File Organization: `docs/architecture/file-organization-patterns.md`
- **Research Documents**:
  - Legend-State v3: `docs/research/expo_legend_state_v3_guide_20250917_225656.md`
  - React Native Testing: `docs/research/react_native_testing_library_guide_20250918_184418.md`
  - Idle Game Best Practices: `docs/research/gamedev/idler-clicker-games-best-practices-2025.md`
- **Task List**: `frontend/modules/scrap/specs/tasks_scrap_passive_generation_20251113.md` (to be generated)

---

_Generated from PRD: prd_scrap_passive_generation_20251113.md_
_Generation Date: 2025-11-13_
_TDD Strategy: Red-Green-Refactor with React Native Testing Library_
_Target Completion: 4-5 days_
