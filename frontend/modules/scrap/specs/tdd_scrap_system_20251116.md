# Scrap Idle Resource System Technical Design Document

## Document Control

| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude | 2025-11-16 | Draft | Initial TDD from PRD |

## Executive Summary

This technical design implements a passive idle resource generation system where users accumulate "scrap" automatically every 1 second based on their AI Pet count (Singularity Pet Count). The implementation follows Test-Driven Development (TDD) principles, uses React's useEffect for timer management, and integrates with the existing clicker system through shared state. The architecture prioritizes simplicity while establishing a foundation for future economy features, with no spending mechanisms in MVP scope.

## 1. Overview & Context

### Problem Statement

The application currently has a clicker interaction (feed button → AI Pets), but pets provide no ongoing value after acquisition. Users need passive resource generation that:
- Rewards them for their pet collection over time
- Provides idle game progression mechanics
- Creates a foundation for future economy systems
- Maintains accurate timer-based updates (1-second intervals)
- Integrates seamlessly with existing pet count state

### Solution Approach

We will implement a timer-based resource system using:
- **Shared State**: Legend-State observable for pet count and scrap (lift state from ClickerScreen)
- **Timer Management**: `useEffect` with `setInterval` for 1-second scrap generation ticks
- **State Refactoring**: Move pet count from ClickerScreen local state to shared store
- **Integration**: Update ClickerScreen to use shared state, add scrap display to UI
- **Testing**: Component tests for scrap display, timer behavior, and rate calculations

This approach balances simplicity with extensibility: shared state enables future features (shop, upgrades) while keeping the implementation lean for MVP.

### Success Criteria

**Technical Metrics**:
- Timer accuracy: 1-second intervals (±100ms acceptable variance)
- Scrap calculation: 100% accuracy (1 scrap per pet per second baseline)
- State synchronization: Pet count changes reflect in next scrap tick (< 1 second latency)
- UI update latency: < 50ms after scrap value changes
- Test coverage: > 80% for new code
- No memory leaks: Timer cleanup on component unmount
- No performance degradation: < 5ms computation per tick, maintain 60fps

## 2. Codebase Exploration & Integration Analysis

### Existing Components

**Exploration Results**: Found existing clicker implementation.

**ClickerScreen Current State** (`/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`):
```typescript
// frontend/modules/attack-button/ClickerScreen.tsx (current)
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ClickerScreen() {
  const [count, setCount] = useState(0);  // LOCAL STATE - needs refactoring

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
```

**Key Integration Points**:
- Pet count is currently local state (`useState`) in ClickerScreen
- Must refactor to shared state to enable scrap generation based on pet count
- ClickerScreen is the only screen, rendered directly in App.tsx
- SafeAreaProvider already configured in App.tsx

### Existing Hooks

**None found**. No custom hooks exist in the codebase yet.

### Store Properties (Verified)

**None found**. No Legend-State stores exist in the codebase yet.

This implementation will create the first shared store for the application.

### Integration Points

**App.tsx** (`/mnt/c/dev/class-one-rapids/frontend/App.tsx`):
- Current imports: SafeAreaProvider, ClickerScreen
- Navigation structure: Single screen, no navigation
- Active screens: ClickerScreen (only screen)
- SafeAreaProvider is already configured

**ClickerScreen Refactoring Required**:
- Change from `useState(0)` to shared observable: `gameState$.petCount`
- Update increment logic to use: `gameState$.petCount.set(prev => prev + 1)`
- Add scrap display to existing UI
- Maintain all existing functionality (tests must still pass)

### Architecture Decisions (UPDATE vs CREATE)

**Store: gameState$ (game store)**
- ❌ NOT FOUND
- **DECISION: CREATE** new file at `frontend/shared/store/gameStore.ts`
- **RATIONALE**: This is the first cross-feature shared state. Pet count is needed by both ClickerScreen (increment) and scrap generation (calculate rate). Per state-management-hooks-guide.md: "Multi-feature shared state → Store + Hook pattern". Creates a shared game state foundation.

**Hook: useGameState**
- ❌ NOT FOUND
- **DECISION: CREATE** new file at `frontend/shared/hooks/useGameState.ts`
- **RATIONALE**: Per state-management-hooks-guide.md §🎯 Core Principles: "Components never import observables directly - All state access through hooks". Hook provides public API for accessing game state (pet count, scrap).

**Component: ClickerScreen**
- ✅ FOUND at: `frontend/modules/attack-button/ClickerScreen.tsx`
- **DECISION: UPDATE** existing file
- **RATIONALE**: Must refactor to use shared state instead of local state. Add scrap display to existing UI. Breaking change to internal implementation, but external behavior remains the same (all existing tests must still pass).

**Component: ScrapDisplay (sub-component)**
- ❌ NOT FOUND
- **DECISION: CREATE INLINE** (no separate file)
- **RATIONALE**: Scrap display is simple (1 Text component), no need for file extraction. Will add directly to ClickerScreen JSX. Per lean principles: extract only when duplication appears.

**Hook: useScrapGeneration (timer logic)**
- ❌ NOT FOUND
- **DECISION: CREATE INLINE** (no separate file for MVP)
- **RATIONALE**: Timer logic is specific to scrap generation, not reusable behavior. Implement directly in ClickerScreen with useEffect. Per state-management-hooks-guide.md: "Is state used by only ONE component? YES → Use useState in component". In this case, timer is only used in one screen. Can extract to custom hook if timer logic needs reuse later.

### Integration Validation

- **Duplicate/similar components?** No - scrap is new feature, no existing resource displays
- **Module ownership clarity**:
  - `shared/store/` owns game state (pet count, scrap)
  - `shared/hooks/` owns state access hooks
  - `attack-button` module owns ClickerScreen (displays both pets and scrap)
- **State sharing accessibility**: All components can access gameState$ through useGameState hook

### File Structure Decision

Per file-organization-patterns.md:
- **Shared State**: Goes in `frontend/shared/store/` (cross-feature state)
- **Shared Hooks**: Goes in `frontend/shared/hooks/` (cross-feature access)
- **Scrap Module**: Creates new module at `frontend/modules/scrap/` for future scrap-specific features

**Final Directory Structure**:
```
frontend/
├── shared/
│   ├── store/
│   │   └── gameStore.ts          # NEW - Shared game state (petCount, scrap)
│   └── hooks/
│       └── useGameState.ts       # NEW - Public API for game state
├── modules/
│   ├── attack-button/
│   │   ├── specs/
│   │   │   ├── feature-attack.md
│   │   │   ├── prd_core_clicker_flow_20251116.md
│   │   │   └── tdd_core_clicker_flow_20251116.md
│   │   ├── ClickerScreen.tsx     # UPDATE - Use shared state, add scrap display
│   │   └── ClickerScreen.test.tsx # UPDATE - Add scrap tests, update state tests
│   └── scrap/
│       └── specs/
│           ├── feature-scrap.md
│           ├── prd_scrap_system_20251116.md
│           └── tdd_scrap_system_20251116.md (this file)
└── App.tsx                        # NO CHANGE - Already renders ClickerScreen
```

## 3. Requirements Analysis

### Functional Requirements

**From PRD User Stories** - mapped to technical implementation:

1. **Scrap Generation Logic** (FR-1, FR-2, FR-3, FR-5)
   - Base rate: 1 scrap per AI Pet per second
   - Calculation: `Math.floor(petCount * 1)` (scrapMultiplier = 1.0 for MVP)
   - Timer interval: 1000ms (1 second)
   - State update: `gameState$.scrap.set(prev => prev + rate)` on each tick

2. **Timer System** (FR-6, FR-7, FR-8, FR-9, FR-10)
   - Implementation: `useEffect(() => { const interval = setInterval(..., 1000); return () => clearInterval(interval); }, [])`
   - Auto-start: Timer starts when ClickerScreen mounts
   - Cleanup: Timer cleared when ClickerScreen unmounts
   - Continuous: Timer runs while app is in foreground
   - Pause on background: No offline accumulation (out of scope for MVP)

3. **Scrap Display** (FR-11, FR-12, FR-13, FR-14, FR-15)
   - Label format: "Scrap: {amount}" (or similar clear label)
   - Update timing: Synchronous with scrap state changes (< 16ms)
   - Number range: Support 0 to 999,999+ (JavaScript native number handling)
   - Visibility: Display in ClickerScreen above or below pet count (no scrolling needed)
   - Generation rate: Display "+{rate}/sec" if space permits (P1 enhancement)

4. **Integration with Pet System** (FR-16, FR-17, FR-18, FR-19)
   - Real-time rate: Scrap generation uses current pet count each tick
   - Pet count changes: Next scrap tick (within 1 second) uses updated count
   - Initial scrap: 0 on first app launch
   - Persistence: Not implemented in MVP (per PRD Open Questions - "pending" decision)

### Non-Functional Requirements

**Performance**:
- **Timer Computation**: < 5ms per tick (simple arithmetic, no blocking)
  - Calculation: `const rate = petCount * 1` (trivially fast)
  - State update: Legend-State's `set()` is optimized for fine-grained updates
- **UI Framerate**: 60fps maintained (timer runs on separate tick, doesn't block render)
  - Text update is O(1) complexity
  - No animations or complex computations
- **Memory**: No leaks (timer cleanup in useEffect return function)
  - `clearInterval` ensures timer stops on unmount

**Accessibility**:
- **Scrap Display**: `accessibilityRole="text"`
- **Screen Reader**: Announce "Scrap: {amount}" and generation rate
- **Text Contrast**: ≥ 4.5:1 against background (same as pet counter)
- **Perceivability**: Text format ensures clarity for all users

**Platform Support**:
- iOS: React Native via Expo SDK 54
- Android: React Native via Expo SDK 54
- Web: React Native Web (if applicable)

**Reliability**:
- **Timer Drift**: < 5% per hour (JavaScript setInterval baseline accuracy)
- **Negative Prevention**: Math.floor ensures non-negative integers
- **Edge Cases**: Handles 0 pets (0 scrap/sec), large pet counts, app backgrounding

## 4. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   App.tsx (Entry Point)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         SafeAreaProvider (Context)                    │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │       ClickerScreen Component                   │  │  │
│  │  │                                                 │  │  │
│  │  │  Hooks:                                         │  │  │
│  │  │   - useGameState() → { petCount$, scrap$ }     │  │  │
│  │  │   - useEffect(timer) → scrap generation        │  │  │
│  │  │                                                 │  │  │
│  │  │  UI:                                            │  │  │
│  │  │   - SafeAreaView (container)                   │  │  │
│  │  │   - Text (pet count display)                   │  │  │
│  │  │   - Text (scrap display) ← NEW                 │  │  │
│  │  │   - Pressable (feed button)                    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         ▲                                    │
         │ useGameState()                     │ Observables
         │                                    ▼
┌─────────────────────────────────────────────────────────────┐
│             Shared State Layer (Legend-State)               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  gameStore.ts                                         │  │
│  │                                                       │  │
│  │  gameState$ = observable({                           │  │
│  │    petCount: 0,    // Shared pet count               │  │
│  │    scrap: 0,       // Passive resource               │  │
│  │  });                                                 │  │
│  │                                                       │  │
│  │  Computed Values:                                    │  │
│  │  scrapRate$ = computed(() =>                         │  │
│  │    Math.floor(gameState$.petCount.get() * 1)        │  │
│  │  );                                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  useGameState.ts (Public API)                        │  │
│  │                                                       │  │
│  │  export function useGameState() {                    │  │
│  │    return {                                          │  │
│  │      petCount$: gameState$.petCount,                 │  │
│  │      scrap$: gameState$.scrap,                       │  │
│  │      scrapRate$: scrapRate$,                         │  │
│  │    };                                                │  │
│  │  }                                                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Component Breakdown**:
1. **App.tsx**: Root component, provides SafeAreaProvider context (no changes)
2. **ClickerScreen**: Displays pets, scrap, and feed button. Manages scrap generation timer.
3. **gameStore.ts**: Legend-State observable containing shared game state (petCount, scrap)
4. **useGameState.ts**: Custom hook providing public API for accessing game state
5. **scrapRate$**: Computed observable deriving scrap generation rate from pet count

**External Dependencies**:
- `@legendapp/state`: State management library (needs installation)
- `react-native`: Core RN components (View, Text, Pressable, StyleSheet)
- `react-native-safe-area-context`: Safe area handling (SafeAreaView)
- `react`: State management (useEffect for timer)

### Component Design

#### gameStore.ts (Shared State)

**Purpose**: Central store for cross-feature game state

**Responsibilities**:
- Define observable for pet count and scrap
- Define computed observable for scrap generation rate
- Provide single source of truth for game progression state

**Interfaces**:
```typescript
// gameStore.ts
import { observable, computed } from '@legendapp/state';

// Observable state
export const gameState$ = observable({
  petCount: 0,  // Singularity Pet Count (shared with ClickerScreen)
  scrap: 0,     // Passive resource (scrap system)
});

// Computed scrap generation rate (scrap per second)
export const scrapRate$ = computed(() => {
  const petCount = gameState$.petCount.get();
  const scrapMultiplier = 1; // Base multiplier (future: upgrades can modify)
  return Math.floor(petCount * scrapMultiplier);
});
```

**Dependencies**:
- @legendapp/state: Observable and computed APIs

#### useGameState.ts (Hook)

**Purpose**: Public API for accessing game state

**Responsibilities**:
- Provide reactive observables for pet count and scrap
- Provide computed observable for scrap rate
- Abstract store implementation from components

**Interfaces**:
```typescript
// useGameState.ts
import { gameState$, scrapRate$ } from '../store/gameStore';

export function useGameState() {
  return {
    petCount$: gameState$.petCount,
    scrap$: gameState$.scrap,
    scrapRate$: scrapRate$,
  };
}

// Usage in components:
const { petCount$, scrap$, scrapRate$ } = useGameState();
const petCount = petCount$.get();  // Read current value
petCount$.set(5);                  // Write new value
```

**Dependencies**:
- gameStore.ts: State observables

#### ClickerScreen Component (Updated)

**Purpose**: Implements clicker interaction + scrap display + timer

**Responsibilities**:
- Manage scrap generation timer (useEffect with setInterval)
- Display pet count (using shared state)
- Display scrap amount and generation rate
- Handle feed button presses (increment pet count)
- Cleanup timer on unmount

**State Flow (Updated)**:
```
Initial Render
  └─> petCount$ = 0, scrap$ = 0
  └─> Timer starts (useEffect)

Timer Tick (Every 1 Second)
  └─> Calculate rate = scrapRate$.get()
  └─> Update scrap: scrap$.set(prev => prev + rate)
  └─> ClickerScreen re-renders (scrap text updates)

User Press Feed Button
  └─> onPress() called
  └─> petCount$.set(prev => prev + 1)
  └─> ClickerScreen re-renders (pet count text updates)
  └─> Next timer tick uses new pet count

Component Unmount
  └─> clearInterval(timerRef)
  └─> Timer stops
```

### Data Flow

**Sequence Diagram: Scrap Generation Tick**

```
Timer             useEffect        gameState$      Component
 |                   |                 |               |
 |--1 sec elapsed--->|                 |               |
 |                   |                 |               |
 |                   |--get rate------>|               |
 |                   |   (scrapRate$)  |               |
 |                   |                 |               |
 |                   |<--return rate---|               |
 |                   |   (e.g., 10)    |               |
 |                   |                 |               |
 |                   |--set scrap----->|               |
 |                   | (prev + rate)   |               |
 |                   |                 |               |
 |                   |                 |--notify------>|
 |                   |                 |  observers    |
 |                   |                 |               |
 |                   |                 |               | (re-render)
 |                   |                 |               | (scrap text updates)
```

**Timeline**:
- T+0ms: Timer tick fires (1 second since last tick)
- T+0ms: Get current scrapRate$ (computed from petCount)
- T+0ms: Update scrap observable: `scrap$.set(prev => prev + rate)`
- T+~2ms: Legend-State notifies observers (component subscribed via .get())
- T+~8ms: React schedules re-render
- T+~16ms: Component re-renders with new scrap value
- **Total: < 20ms** (well under 50ms requirement)

**Sequence Diagram: User Increments Pet Count**

```
User         Pressable      petCount$      scrapRate$     Timer
 |               |              |               |           |
 |----tap------->|              |               |           |
 |               |              |               |           |
 |               |--onPress---->|               |           |
 |               | (inc by 1)   |               |           |
 |               |              |               |           |
 |               |              |--notify------>|           |
 |               |              | (recompute)   |           |
 |               |              |               |           |
 |               |              |               |           |
 |               |              |               |<--next----|
 |               |              |               |   tick    |
 |               |              |               |           |
 |               |              |<--get count---|           |
 |               |              |               |           |
 |               |              |--return new---|           |
 |               |              |   count       |           |
 |               |              |               |           |
 |               |              |               | (uses updated count)
```

## 5. API Design

### Internal APIs

**gameStore.ts API**:
```typescript
// Observable state (read/write)
gameState$.petCount.get(): number
gameState$.petCount.set(value: number | ((prev: number) => number)): void

gameState$.scrap.get(): number
gameState$.scrap.set(value: number | ((prev: number) => number)): void

// Computed rate (read-only)
scrapRate$.get(): number
```

**useGameState.ts API**:
```typescript
interface GameStateHook {
  petCount$: Observable<number>;  // Reactive pet count
  scrap$: Observable<number>;     // Reactive scrap amount
  scrapRate$: Computed<number>;   // Reactive scrap rate (computed)
}

function useGameState(): GameStateHook
```

**ClickerScreen Usage**:
```typescript
// In ClickerScreen component
const { petCount$, scrap$, scrapRate$ } = useGameState();

// Read values (reactive - component re-renders on change)
const petCount = petCount$.get();
const scrap = scrap$.get();
const scrapRate = scrapRate$.get();

// Write values
petCount$.set(prev => prev + 1);  // Increment pet count
scrap$.set(prev => prev + scrapRate);  // Add scrap
```

### External Integrations

None. No third-party services or APIs required.

## 6. Data Model

### Entity Design

**Game State**:
```typescript
interface GameState {
  petCount: number;  // Singularity Pet Count (0...Infinity)
  scrap: number;     // Passive resource (0...Infinity)
}

// Initial state
const initialState: GameState = {
  petCount: 0,
  scrap: 0,
};
```

**Computed Values**:
```typescript
// Scrap generation rate (scrap per second)
interface ScrapRate {
  value: number;  // Math.floor(petCount * scrapMultiplier)
}

// Calculation
scrapRate = Math.floor(petCount * 1);  // Base: 1 scrap per pet per second
```

### Database Schema

**Not applicable for MVP**. No persistence layer.

Per PRD Section "Open Questions":
> Should scrap persist across app restarts, or reset to 0 each launch?
> - **Recommendation**: Persist scrap
> - **Decision needed by**: Design phase (week 1)

**Future Enhancement**: Add Legend-State persistence plugin for AsyncStorage
```typescript
// Future: persistObservable(gameState$, { local: 'gameState' });
```

### Data Access Patterns

**Read (Reactive)**:
```typescript
// In component (subscribes to changes, re-renders on update)
const petCount = petCount$.get();
const scrap = scrap$.get();
const scrapRate = scrapRate$.get();
```

**Write (State Updates)**:
```typescript
// Increment pet count (on button press)
petCount$.set(prev => prev + 1);

// Increment scrap (on timer tick)
scrap$.set(prev => prev + scrapRate$.get());
```

**Computed (Derived State)**:
```typescript
// Scrap rate is automatically recomputed when petCount changes
const scrapRate$ = computed(() => {
  return Math.floor(gameState$.petCount.get() * 1);
});
```

## 7. Security Design

### Authentication & Authorization

**Not applicable**. No user accounts or authentication in scope.

### Data Security

**Not applicable**. No sensitive data handling.

- Pet count and scrap are not PII
- All data stays on device (no network requests)
- No backend synchronization

### Security Controls

**Input Validation**: None needed (timer is only input, fully controlled)

**Rate Limiting**: None needed (timer runs at fixed 1-second interval)

**CORS Policies**: Not applicable (no network requests)

## 8. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

All implementation must follow **Red-Green-Refactor** cycle.

#### Testing Framework & Tools

- **Framework**: React Native Testing Library + Jest
- **Reference**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Test Runner**: Jest with React Native preset (pre-configured in Expo)
- **Timer Mocking**: Jest fake timers (`jest.useFakeTimers()`)
- **Legend-State Testing**: Direct observable access in tests

#### TDD Implementation Process

For each feature/behavior, follow this strict order:

**1. RED Phase - Write Failing Test First**

Example tests to write BEFORE implementation:

```typescript
// ClickerScreen.test.tsx (additions)

test('displays initial scrap count of zero', () => {
  render(<ClickerScreen />);
  expect(screen.getByText(/Scrap: 0/i)).toBeTruthy();
});
// This test MUST fail initially (no scrap display exists yet)

test('generates scrap based on pet count after 1 second', () => {
  jest.useFakeTimers();
  render(<ClickerScreen />);

  // User has 5 pets
  const feedButton = screen.getByRole('button', { name: /feed/i });
  for (let i = 0; i < 5; i++) {
    fireEvent.press(feedButton);
  }

  // Advance timer by 1 second
  act(() => {
    jest.advanceTimersByTime(1000);
  });

  // Should generate 5 scrap (5 pets * 1 scrap/pet/sec)
  expect(screen.getByText(/Scrap: 5/i)).toBeTruthy();

  jest.useRealTimers();
});
// This test MUST fail (no timer, no scrap generation logic)
```

**2. GREEN Phase - Minimal Implementation**

Write ONLY enough code to pass tests:
```typescript
// Step 1: Create gameStore.ts
export const gameState$ = observable({
  petCount: 0,
  scrap: 0,
});

export const scrapRate$ = computed(() => {
  return Math.floor(gameState$.petCount.get() * 1);
});

// Step 2: Create useGameState.ts
export function useGameState() {
  return {
    petCount$: gameState$.petCount,
    scrap$: gameState$.scrap,
    scrapRate$: scrapRate$,
  };
}

// Step 3: Update ClickerScreen.tsx
export function ClickerScreen() {
  const { petCount$, scrap$, scrapRate$ } = useGameState();

  // Timer for scrap generation
  useEffect(() => {
    const interval = setInterval(() => {
      const rate = scrapRate$.get();
      scrap$.set(prev => prev + rate);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text>Singularity Pet Count: {petCount$.get()}</Text>
        <Text>Scrap: {scrap$.get()}</Text>  {/* NEW */}

        <Pressable onPress={() => petCount$.set(prev => prev + 1)}>
          <Text>feed</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

**3. REFACTOR Phase - Improve Code**

- Add accessibility attributes to scrap display
- Add styles for scrap text
- Add scrap rate display ("+X/sec")
- Optimize component re-renders (use Observer component if needed)
- Maintain all green tests

### App-Level Integration Testing (TDD Zero Layer)

**App.test.tsx Updates** (if file exists, add integration tests):

```typescript
// App.test.tsx - Integration tests for scrap system

describe('App Integration - Scrap System', () => {
  test('displays scrap counter on app launch', () => {
    const { getByText } = render(<App />);

    // Verify scrap display is present
    expect(getByText(/Scrap:/i)).toBeTruthy();
  });

  test('scrap generation works end-to-end', () => {
    jest.useFakeTimers();
    const { getByText, getByRole } = render(<App />);

    // Get feed button and click 3 times
    const feedButton = getByRole('button', { name: /feed/i });
    fireEvent.press(feedButton);
    fireEvent.press(feedButton);
    fireEvent.press(feedButton);

    // Advance timer by 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should have 6 scrap (3 pets * 1 scrap/pet/sec * 2 seconds)
    expect(getByText(/Scrap: 6/i)).toBeTruthy();

    jest.useRealTimers();
  });
});
```

### Unit Testing (TDD First Layer)

**Test Categories** (in order of implementation):

1. **Store Tests** - Observable state works correctly
2. **Hook Tests** - useGameState returns correct observables
3. **Component Render Tests** - Scrap display appears
4. **Timer Tests** - Scrap generation ticks work
5. **Integration Tests** - Pet count affects scrap rate
6. **Accessibility Tests** - Screen reader support

**Comprehensive Test Suite**:

```typescript
// gameStore.test.ts - NEW FILE

import { gameState$, scrapRate$ } from './gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset state before each test
    gameState$.petCount.set(0);
    gameState$.scrap.set(0);
  });

  describe('gameState$ observable', () => {
    test('initializes with zero pet count', () => {
      expect(gameState$.petCount.get()).toBe(0);
    });

    test('initializes with zero scrap', () => {
      expect(gameState$.scrap.get()).toBe(0);
    });

    test('allows setting pet count', () => {
      gameState$.petCount.set(5);
      expect(gameState$.petCount.get()).toBe(5);
    });

    test('allows setting scrap', () => {
      gameState$.scrap.set(100);
      expect(gameState$.scrap.get()).toBe(100);
    });

    test('supports functional updates for pet count', () => {
      gameState$.petCount.set(10);
      gameState$.petCount.set(prev => prev + 5);
      expect(gameState$.petCount.get()).toBe(15);
    });

    test('supports functional updates for scrap', () => {
      gameState$.scrap.set(50);
      gameState$.scrap.set(prev => prev + 25);
      expect(gameState$.scrap.get()).toBe(75);
    });
  });

  describe('scrapRate$ computed observable', () => {
    test('returns 0 when pet count is 0', () => {
      gameState$.petCount.set(0);
      expect(scrapRate$.get()).toBe(0);
    });

    test('returns pet count when multiplier is 1', () => {
      gameState$.petCount.set(10);
      expect(scrapRate$.get()).toBe(10);
    });

    test('automatically recomputes when pet count changes', () => {
      gameState$.petCount.set(5);
      expect(scrapRate$.get()).toBe(5);

      gameState$.petCount.set(15);
      expect(scrapRate$.get()).toBe(15);
    });

    test('floors fractional results', () => {
      // If multiplier was 1.5 (future enhancement)
      // For now, with multiplier=1, this always floors integers
      gameState$.petCount.set(7);
      expect(scrapRate$.get()).toBe(7);  // Math.floor(7 * 1) = 7
    });
  });
});

// useGameState.test.ts - NEW FILE

import { renderHook } from '@testing-library/react-native';
import { useGameState } from './useGameState';
import { gameState$ } from '../store/gameStore';

describe('useGameState', () => {
  beforeEach(() => {
    gameState$.petCount.set(0);
    gameState$.scrap.set(0);
  });

  test('returns petCount$ observable', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.petCount$).toBeDefined();
    expect(result.current.petCount$.get()).toBe(0);
  });

  test('returns scrap$ observable', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.scrap$).toBeDefined();
    expect(result.current.scrap$.get()).toBe(0);
  });

  test('returns scrapRate$ computed observable', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.scrapRate$).toBeDefined();
    expect(result.current.scrapRate$.get()).toBe(0);
  });

  test('petCount$ observable is reactive', () => {
    const { result } = renderHook(() => useGameState());

    result.current.petCount$.set(10);
    expect(result.current.petCount$.get()).toBe(10);
  });

  test('scrap$ observable is reactive', () => {
    const { result } = renderHook(() => useGameState());

    result.current.scrap$.set(50);
    expect(result.current.scrap$.get()).toBe(50);
  });

  test('scrapRate$ recomputes when petCount changes', () => {
    const { result } = renderHook(() => useGameState());

    result.current.petCount$.set(5);
    expect(result.current.scrapRate$.get()).toBe(5);

    result.current.petCount$.set(12);
    expect(result.current.scrapRate$.get()).toBe(12);
  });
});

// ClickerScreen.test.tsx - UPDATES TO EXISTING FILE

import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { ClickerScreen } from './ClickerScreen';
import { gameState$ } from '../../shared/store/gameStore';

describe('ClickerScreen - Scrap System', () => {
  beforeEach(() => {
    // Reset state before each test
    gameState$.petCount.set(0);
    gameState$.scrap.set(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Scrap Display', () => {
    test('displays initial scrap count of zero', () => {
      render(<ClickerScreen />);
      expect(screen.getByText(/Scrap: 0/i)).toBeTruthy();
    });

    test('displays scrap label clearly', () => {
      render(<ClickerScreen />);
      // Verify "Scrap" label is present
      expect(screen.getByText(/Scrap:/i)).toBeTruthy();
    });

    test('updates scrap display when scrap changes', () => {
      render(<ClickerScreen />);

      // Manually update scrap (simulates timer tick)
      act(() => {
        gameState$.scrap.set(25);
      });

      expect(screen.getByText(/Scrap: 25/i)).toBeTruthy();
    });

    test('handles large scrap numbers without breaking', () => {
      render(<ClickerScreen />);

      act(() => {
        gameState$.scrap.set(999999);
      });

      expect(screen.getByText(/Scrap: 999999/i)).toBeTruthy();
    });
  });

  describe('Scrap Generation Timer', () => {
    test('generates scrap after 1 second with 1 pet', () => {
      jest.useFakeTimers();
      render(<ClickerScreen />);

      // User has 1 pet
      const feedButton = screen.getByRole('button', { name: /feed/i });
      fireEvent.press(feedButton);

      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should generate 1 scrap
      expect(screen.getByText(/Scrap: 1/i)).toBeTruthy();
    });

    test('generates scrap after 1 second with 10 pets', () => {
      jest.useFakeTimers();
      render(<ClickerScreen />);

      // User has 10 pets
      const feedButton = screen.getByRole('button', { name: /feed/i });
      for (let i = 0; i < 10; i++) {
        fireEvent.press(feedButton);
      }

      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should generate 10 scrap
      expect(screen.getByText(/Scrap: 10/i)).toBeTruthy();
    });

    test('generates 0 scrap when pet count is 0', () => {
      jest.useFakeTimers();
      render(<ClickerScreen />);

      // No pets (count = 0)

      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should still be 0 scrap
      expect(screen.getByText(/Scrap: 0/i)).toBeTruthy();
    });

    test('generates scrap continuously over multiple ticks', () => {
      jest.useFakeTimers();
      render(<ClickerScreen />);

      // User has 3 pets
      const feedButton = screen.getByRole('button', { name: /feed/i });
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);

      // Tick 1: +3 scrap
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 3/i)).toBeTruthy();

      // Tick 2: +3 scrap (total: 6)
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 6/i)).toBeTruthy();

      // Tick 3: +3 scrap (total: 9)
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 9/i)).toBeTruthy();
    });

    test('updates scrap rate when pet count changes mid-session', () => {
      jest.useFakeTimers();
      render(<ClickerScreen />);

      const feedButton = screen.getByRole('button', { name: /feed/i });

      // Start with 2 pets
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);

      // Tick 1: +2 scrap
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 2/i)).toBeTruthy();

      // Add 3 more pets (total: 5 pets)
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);

      // Tick 2: +5 scrap (total: 7)
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 7/i)).toBeTruthy();
    });

    test('timer cleans up on component unmount', () => {
      jest.useFakeTimers();
      const { unmount } = render(<ClickerScreen />);

      // User has 5 pets
      const feedButton = screen.getByRole('button', { name: /feed/i });
      for (let i = 0; i < 5; i++) {
        fireEvent.press(feedButton);
      }

      // Tick while mounted
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(gameState$.scrap.get()).toBe(5);

      // Unmount component
      unmount();

      // Advance timer after unmount (should NOT generate scrap)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Scrap should still be 5 (no additional generation)
      expect(gameState$.scrap.get()).toBe(5);
    });
  });

  describe('Integration: Pet Count & Scrap', () => {
    test('pet count increment immediately affects next scrap tick', () => {
      jest.useFakeTimers();
      render(<ClickerScreen />);

      const feedButton = screen.getByRole('button', { name: /feed/i });

      // Start with 0 pets
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 0/i)).toBeTruthy();

      // Add 1 pet
      fireEvent.press(feedButton);

      // Next tick should use new count
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 1/i)).toBeTruthy();
    });

    test('scrap generation does not affect pet count', () => {
      jest.useFakeTimers();
      render(<ClickerScreen />);

      const feedButton = screen.getByRole('button', { name: /feed/i });
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);

      // Pet count = 2
      expect(screen.getByText(/Singularity Pet Count: 2/i)).toBeTruthy();

      // Advance timer (generate scrap)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Pet count should still be 2 (unchanged)
      expect(screen.getByText(/Singularity Pet Count: 2/i)).toBeTruthy();
    });
  });

  describe('Accessibility - Scrap Display', () => {
    test('scrap display has text accessibility role', () => {
      render(<ClickerScreen />);
      const scrapText = screen.getByText(/Scrap:/i);
      expect(scrapText.props.accessibilityRole).toBe('text');
    });

    test('scrap display has accessible label with current value', () => {
      render(<ClickerScreen />);

      act(() => {
        gameState$.scrap.set(42);
      });

      const scrapText = screen.getByText(/Scrap: 42/i);
      expect(scrapText.props.accessibilityLabel).toMatch(/Scrap: 42/);
    });
  });

  describe('State Refactoring: Shared State', () => {
    test('pet count uses shared state (not local useState)', () => {
      render(<ClickerScreen />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      // Increment via button
      fireEvent.press(feedButton);

      // Verify shared state updated
      expect(gameState$.petCount.get()).toBe(1);
    });

    test('scrap uses shared state', () => {
      jest.useFakeTimers();
      render(<ClickerScreen />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      fireEvent.press(feedButton);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Verify shared state updated
      expect(gameState$.scrap.get()).toBe(1);
    });
  });
});
```

**Coverage Target**: > 80% for new files (gameStore.ts, useGameState.ts, updated ClickerScreen.tsx)

### TDD Checklist for Each Component

- [ ] First test written before any implementation code
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns
- [ ] No testIds unless absolutely necessary (prefer getByText, getByRole)
- [ ] Timer tests use Jest fake timers (jest.useFakeTimers())
- [ ] State reset in beforeEach (ensures test isolation)
- [ ] Timer cleanup in afterEach (jest.useRealTimers())
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

**Environment Strategy**: Single environment (no dev/staging/prod separation needed)

### Monitoring & Observability

**Not applicable** for MVP scope. No analytics, no error tracking.

Future consideration (out of scope):
- Crash reporting: Sentry for React Native
- Analytics: Track scrap generation milestones
- Performance monitoring: Track timer drift

## 10. Scalability & Performance

### Performance Requirements

**From PRD**:
- **Timer accuracy**: 1-second intervals (±100ms acceptable variance)
- **UI update latency**: < 50ms after scrap value changes
- **Computation per tick**: < 5ms (no blocking operations)
- **Framerate**: 60fps maintained during scrap generation

**Technical Implementation**:
- JavaScript setInterval baseline: ±10-50ms variance (acceptable)
- Legend-State fine-grained reactivity: < 1ms observer notification
- Scrap calculation: `Math.floor(petCount * 1)` is O(1), < 0.01ms
- React re-render: Single `<Text>` node update, < 10ms
- **Total per tick**: < 20ms (well under 50ms requirement)

**Verification**:
- Manual testing: Run app for 10 minutes, verify scrap accuracy
- Automated testing: Jest fake timers validate tick count
- Performance testing: React DevTools Profiler (ensure < 16ms render time)

### Scalability Strategy

**Timer Drift**:
- JavaScript setInterval has cumulative drift over long sessions
- Acceptable for MVP: < 5% drift per hour per PRD
- Future enhancement: Use Date.now() timestamps for drift correction

**Large Numbers**:
- Scrap can reach Number.MAX_SAFE_INTEGER (9 quadrillion)
- At 1000 scrap/sec (1000 pets), would take 285 million years to overflow
- No scaling concerns for practical use

**Multiple Resources**:
- Future: Add more resource types (metal, energy, etc.)
- Architecture supports: Each resource gets own observable in gameState$
- No performance impact: Legend-State handles many observables efficiently

### Performance Optimization

**Current Design is Already Optimal**:
- Fine-grained reactivity (only scrap Text re-renders, not entire screen)
- Computed observables (scrapRate$ memoizes calculation)
- Simple arithmetic (no complex computations)
- No list rendering or images

**Potential Optimizations** (if needed later):
- Use Legend-State's `Observer` component for surgical re-renders
- Batch multiple resource updates in single tick
- Debounce UI updates (update every 500ms instead of every change)

**No optimization needed** for MVP scope.

## 11. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Timer drift causes inaccurate scrap generation over long sessions | Medium | Medium | Document acceptable drift (< 5% per hour). Future: Add timestamp-based drift correction. | Development |
| State refactoring breaks existing clicker tests | High | Medium | Run existing ClickerScreen tests frequently during refactoring. Ensure all tests pass before proceeding. | Development |
| Legend-State dependency not installed | High | Low | Add `@legendapp/state` to package.json, verify installation before implementation. | Development |
| Timer not cleaned up, causes memory leak | Medium | Low | Use useEffect return function for cleanup. Add unmount test to verify cleanup. | Development |
| Pet count changes not reflected in scrap rate | Medium | Low | Use computed observable (scrapRate$) that auto-recomputes. Add test for mid-session pet count change. | Development |
| Timer continues running after app backgrounded (drains battery) | Low | Medium | Document that MVP has no background handling. Future: Use AppState to pause timer. | Development |

### Dependencies

**From PRD + Technical Analysis**:

| Dependency | Type | Mitigation | Status |
|------------|------|------------|--------|
| `@legendapp/state` | NPM Package | Add to package.json with `npm install @legendapp/state` | ⚠️ Needs Installation |
| Existing ClickerScreen | Component | Must refactor to use shared state. Requires careful testing. | ✅ Ready (exists) |
| React Native Testing Library | Dev Dependency | Pre-installed with Expo | ✅ Ready |
| Jest (with fake timers) | Test Runner | Pre-configured with Expo, supports fake timers | ✅ Ready |

**Blockers**:
- [ ] Install @legendapp/state package (required before implementation)

## 12. Implementation Plan (TDD-Driven)

### Development Phases

Following `/mnt/c/dev/class-one-rapids/docs/architecture/lean-task-generation-guide.md` principles - prioritize user-visible functionality.

#### Phase 1: Dependency Installation & Store Setup

**Duration**: 0.5 hours

**CRITICAL FIRST STEP**: Install Legend-State and create shared state foundation

1. **Install @legendapp/state**
   ```bash
   npm install @legendapp/state
   ```
2. **Create gameStore.ts** (WRITE TEST FIRST - TDD)
   - Test 1: gameState$ initializes with petCount=0, scrap=0
   - Test 2: gameState$ allows setting petCount
   - Test 3: gameState$ allows setting scrap
   - Test 4: scrapRate$ computes correctly from petCount
   - Implement minimal store to pass tests
3. **Create useGameState.ts** (WRITE TEST FIRST - TDD)
   - Test 1: Hook returns petCount$ observable
   - Test 2: Hook returns scrap$ observable
   - Test 3: Hook returns scrapRate$ computed observable
   - Implement hook to pass tests

**Deliverable**:
- `frontend/shared/store/gameStore.ts` with tests passing
- `frontend/shared/hooks/useGameState.ts` with tests passing

#### Phase 2: ClickerScreen Refactoring (State Migration)

**Duration**: 1 hour

**CRITICAL**: Refactor existing component to use shared state WITHOUT breaking existing tests

1. **Update existing ClickerScreen tests** (ADAPT TESTS - TDD)
   - Add `beforeEach` to reset gameState$ (ensures test isolation)
   - Verify existing tests still work with shared state
   - Tests should fail initially (component still uses local state)
2. **Refactor ClickerScreen.tsx** (RED-GREEN-REFACTOR)
   - Replace `useState(0)` with `useGameState()`
   - Change `count` to `petCount$.get()`
   - Change `setCount` to `petCount$.set`
   - Verify all existing tests pass (no behavior change)
3. **Run full test suite**
   - All existing ClickerScreen tests must pass
   - All existing App integration tests must pass

**Deliverable**:
- ClickerScreen uses shared state
- All existing tests green (no regression)

#### Phase 3: Scrap Display (No Timer Yet)

**Duration**: 0.5 hours

**User-visible feature**: Display scrap counter (starts at 0, static for now)

1. **Write failing tests** (RED phase)
   - Test 1: "displays initial scrap count of zero"
   - Test 2: "displays scrap label clearly"
   - Test 3: "updates scrap display when scrap changes" (manual state update)
2. **Implement scrap display** (GREEN phase)
   - Add `<Text>Scrap: {scrap$.get()}</Text>` to ClickerScreen JSX
   - Add accessibility attributes: `accessibilityRole="text"`, `accessibilityLabel`
   - Add styles for scrap text
3. **Verify tests pass** (GREEN)
4. **Refactor styling** (REFACTOR phase)
   - Adjust layout (scrap below pet count, above button)
   - Ensure proper spacing and alignment

**Deliverable**:
- Scrap display visible in ClickerScreen
- Static value (0), no generation yet
- 3 new tests passing

#### Phase 4: Scrap Generation Timer

**Duration**: 1.5 hours

**User-visible feature**: Scrap automatically increases every 1 second based on pet count

1. **Write failing timer tests** (RED phase)
   - Test 1: "generates scrap after 1 second with 1 pet"
   - Test 2: "generates scrap after 1 second with 10 pets"
   - Test 3: "generates 0 scrap when pet count is 0"
   - Test 4: "generates scrap continuously over multiple ticks"
   - Test 5: "updates scrap rate when pet count changes mid-session"
   - Test 6: "timer cleans up on component unmount"
2. **Implement timer** (GREEN phase)
   ```typescript
   useEffect(() => {
     const interval = setInterval(() => {
       const rate = scrapRate$.get();
       scrap$.set(prev => prev + rate);
     }, 1000);

     return () => clearInterval(interval);
   }, []);
   ```
3. **Verify all tests pass** (GREEN)
4. **Manual testing** (REFACTOR phase)
   - Run app on device
   - Add pets, watch scrap increase
   - Verify timer accuracy over 60 seconds

**Deliverable**:
- Scrap generation fully working
- 6 new tests passing
- End-to-end feature complete

#### Phase 5: Accessibility & Polish

**Duration**: 0.5 hours

**Enhancement**: Ensure accessibility compliance and visual polish

1. **Write accessibility tests** (RED phase)
   - Test 1: "scrap display has text accessibility role"
   - Test 2: "scrap display has accessible label with current value"
2. **Implement accessibility** (GREEN phase)
   - Add `accessibilityRole="text"` to scrap Text
   - Add `accessibilityLabel={`Scrap: ${scrap}`}` for screen reader
3. **Add scrap rate display (P1 enhancement)**
   - Display "+{rate}/sec" next to scrap amount
   - Example: "Scrap: 50 (+10/sec)"
4. **Visual polish**
   - Number formatting (consider commas for large numbers)
   - Color/size adjustments for visual hierarchy

**Deliverable**:
- Full accessibility compliance
- Scrap rate displayed
- Production-ready UI

#### Phase 6: Integration Testing & Documentation

**Duration**: 0.5 hours

**Verification**: End-to-end tests and documentation

1. **App-level integration tests**
   - Test 1: "displays scrap counter on app launch"
   - Test 2: "scrap generation works end-to-end"
2. **Test coverage**
   - Run `npx jest --coverage`
   - Verify > 80% coverage for new files
3. **Manual testing checklist**
   - [ ] Scrap starts at 0
   - [ ] Scrap increases every 1 second
   - [ ] Scrap rate matches pet count
   - [ ] Timer stops when app closed
   - [ ] No memory leaks over 10-minute session
4. **Documentation**
   - Add JSDoc comments to gameStore.ts
   - Add JSDoc comments to useGameState.ts
   - Update CLAUDE.md if needed

**Deliverable**:
- Full test coverage (> 80%)
- Manual testing complete
- Documentation complete

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|-------------|------|---------------|
| M1 | Legend-State installed, gameStore.ts + tests GREEN | Day 1 AM | None |
| M2 | useGameState.ts + tests GREEN | Day 1 AM | M1 complete |
| M3 | ClickerScreen refactored to shared state, all tests GREEN | Day 1 PM | M2 complete |
| M4 | Scrap display visible (static), tests GREEN | Day 1 PM | M3 complete |
| M5 | Scrap generation timer working, tests GREEN | Day 2 AM | M4 complete |
| M6 | Accessibility + polish complete | Day 2 PM | M5 complete |
| M7 | Integration tests + documentation complete | Day 2 PM | M6 complete |

**Total Timeline**: 2 days (includes TDD discipline overhead)

### Task Execution Order (MANDATORY SEQUENCE)

**CRITICAL**: Follow this exact order per TDD best practices:

1. **Install Dependencies** (Legend-State)
2. **Store Tests** (gameStore.test.ts) ← START HERE (RED)
3. **Store Implementation** (gameStore.ts) → GREEN
4. **Hook Tests** (useGameState.test.ts) → RED
5. **Hook Implementation** (useGameState.ts) → GREEN
6. **Refactor ClickerScreen Tests** (adapt existing tests for shared state) → RED
7. **Refactor ClickerScreen** (use shared state) → GREEN (all tests pass)
8. **Scrap Display Tests** (new tests) → RED
9. **Scrap Display Implementation** → GREEN
10. **Timer Tests** (new tests) → RED
11. **Timer Implementation** → GREEN
12. **Integration Tests** (App.test.tsx) → RED/GREEN
13. **Manual Testing** (device testing)

**DO NOT**:
- ❌ Write implementation before tests
- ❌ Skip store/hook tests (they are foundational)
- ❌ Refactor ClickerScreen before shared state exists
- ❌ Move to next phase if tests are red

## 13. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| State Management | useState (local), Zustand, Legend-State | Legend-State | Per state-management-hooks-guide.md: "Multi-feature shared state → Store + Hook pattern". Pet count needed by both clicker and scrap system. Legend-State provides fine-grained reactivity (surgical re-renders). |
| Pet Count State Location | Local to ClickerScreen, Shared state | Shared state | Scrap generation needs pet count. Must lift state to enable cross-feature access. Refactor from local useState to gameState$ observable. |
| Timer Implementation | setInterval, requestAnimationFrame, Legend-State event listeners | setInterval in useEffect | Standard React pattern for periodic tasks. Simple cleanup with clearInterval. Adequate accuracy for 1-second intervals (±50ms acceptable per PRD). |
| Scrap Display Location | Separate screen, Inline in ClickerScreen | Inline in ClickerScreen | Single-screen app. Scrap is passive resource, doesn't need dedicated screen. Displaying alongside pet count provides context. |
| Hook Extraction | Inline timer, Custom useScrapGeneration hook | Inline timer (MVP) | Timer logic is specific to scrap generation, not reusable behavior. Implement in ClickerScreen with useEffect. Can extract if pattern repeats. Per lean principles: extract only when duplication appears. |
| Scrap Rate Calculation | useState, Derived in render, Computed observable | Computed observable (scrapRate$) | Auto-recomputes when petCount changes. Memoized (no redundant calculations). Clean separation of concerns (store owns computation, component consumes). |

### Trade-offs

**1. No Persistence**
- **Chose**: In-memory state only (scrap resets on app reload)
- **Over**: AsyncStorage persistence with Legend-State plugin
- **Because**: Per PRD Open Questions: "Should scrap persist across app restarts?" is marked "pending decision". Default to simplest implementation per lean principles.
- **Impact**: Acceptable for MVP. Easy to add `persistObservable(gameState$, { local: 'gameState' })` later.

**2. setInterval vs Timestamp-Based Timer**
- **Chose**: setInterval with 1000ms delay
- **Over**: Date.now() timestamp tracking for drift correction
- **Because**: PRD allows "±100ms acceptable variance". setInterval provides ±10-50ms baseline. Drift correction adds complexity for marginal accuracy gain.
- **Impact**: Timer may drift < 5% over long sessions (acceptable per PRD). Can add drift correction if user feedback requests it.

**3. Inline Timer vs Custom Hook**
- **Chose**: useEffect with setInterval directly in ClickerScreen
- **Over**: Custom `useScrapGeneration()` hook
- **Because**: Timer is only used in one place. Per state-management-hooks-guide.md: hook extraction is for reusable behaviors. No duplication yet.
- **Impact**: Less abstraction, easier to understand. Can extract to `useScrapGeneration` if other screens need timers.

**4. No Background Scrap Generation**
- **Chose**: Timer pauses when app backgrounds (no offline accumulation)
- **Over**: AppState listener + time-based catch-up
- **Because**: PRD explicitly states "Scrap must only accumulate while the app is actively running (no offline progression)" per FR-4.
- **Impact**: Users must keep app open to generate scrap. Aligns with active idle game pattern. Offline catch-up is future enhancement (P2).

**5. Refactor ClickerScreen vs Create New Component**
- **Chose**: Refactor existing ClickerScreen to use shared state
- **Over**: Create new GameScreen, deprecate ClickerScreen
- **Because**: Single-screen app. ClickerScreen already renders in App.tsx. Refactoring maintains existing structure, avoids navigation complexity.
- **Impact**: Breaking change to ClickerScreen internals (useState → shared state), but external API unchanged. All existing tests must adapt.

**6. Display Scrap Rate (+X/sec)**
- **Chose**: Display rate if space permits (P1 enhancement)
- **Over**: No rate display (scrap value only)
- **Because**: Per PRD FR-15: "Display should show current generation rate (e.g., '+10/sec') if space permits". Improves transparency, helps users understand pet value.
- **Impact**: Additional UI element, minimal development cost. Can be text next to scrap amount: "Scrap: 50 (+10/sec)".

## 14. Open Questions

**Technical questions requiring resolution**:

- [ ] **Scrap Persistence**: Should scrap persist across app restarts?
  - **Per PRD**: "Recommendation: Persist scrap - maintains progression, reduces user frustration"
  - **Decision needed**: Before Phase 1 (affects whether to add persistObservable in store)
  - **Impact**: Medium - requires Legend-State persistence plugin, AsyncStorage setup
  - **Recommendation**: Implement in Phase 1 if approved, or defer to future enhancement

- [ ] **Number Formatting**: Should scrap use comma separators or abbreviations?
  - **Example**: 1,234,567 vs 1.2M vs 1234567
  - **Decision needed**: Before Phase 5 (polish)
  - **Impact**: Low - can use `toLocaleString()` or custom formatter
  - **Recommendation**: Start with plain integers, add formatting if user feedback requests it

- [ ] **Scrap Rate Display Format**: How to display scrap generation rate?
  - **Options**: "+10/sec", "+10 per second", "10/s", "Generating: 10/sec"
  - **Decision needed**: Before Phase 5 (polish)
  - **Impact**: Low - cosmetic only
  - **Recommendation**: "+10/sec" (concise, clear, standard idle game notation)

- [ ] **Timer Drift Correction**: Should we implement timestamp-based drift correction?
  - **Tradeoff**: Accuracy (+1-2% precision) vs Complexity (additional code)
  - **Decision needed**: After Phase 4 (manual testing reveals drift)
  - **Impact**: Low - PRD allows < 5% drift per hour
  - **Recommendation**: Defer to future enhancement, only if user feedback requests it

- [ ] **Background Handling**: What should happen when app is backgrounded?
  - **Options**: Pause timer, Calculate catch-up on resume, Keep running (battery drain)
  - **Per PRD**: "Timer must pause when app goes to background (no offline accumulation)" (FR-10)
  - **Decision**: Already decided - pause timer (no background generation)
  - **Impact**: None - MVP scope is clear
  - **Future Enhancement**: AppState listener to explicitly pause/resume (P2)

- [ ] **Scrap Cap**: Should scrap have a maximum value?
  - **Options**: Unlimited (current), Cap at 999,999, Cap at Number.MAX_SAFE_INTEGER
  - **Per PRD**: "Out of Scope: Scrap Cap or Maximum - Unlimited accumulation"
  - **Decision**: Already decided - unlimited
  - **Impact**: None - JavaScript handles large integers safely
  - **Future Enhancement**: Cap can be added if economy balance requires it

## 15. Appendices

### A. Technical Glossary

- **Observable**: Legend-State reactive primitive that notifies subscribers when value changes
- **Computed Observable**: Derived observable that auto-recomputes when dependencies change (memoized)
- **Fine-Grained Reactivity**: Only components using changed observables re-render (not entire tree)
- **setInterval**: JavaScript timer function that executes callback at fixed intervals
- **Timer Drift**: Cumulative timing error in setInterval over long periods (JavaScript limitation)
- **Scrap**: The primary idle resource generated passively by AI Pets
- **AI Pet**: Entity acquired through feed button; each pet generates scrap
- **Scrap Rate**: Amount of scrap produced per second (base: 1 scrap per pet)
- **Tick**: Single update cycle of the scrap generation timer (occurs every 1 second)
- **Legend-State**: Advanced reactive state management library for React/React Native
- **Shared State**: State accessible across multiple components/features (vs local component state)

### B. Reference Architecture

**Similar Patterns**:
- Classic idle game timers (Cookie Clicker, Adventure Capitalist)
- Passive resource generation (farming games, city builders)
- Interval-based progression systems

**Legend-State Examples**:
- [Legend-State Docs](https://legendapp.com/open-source/state/)
- [Fine-Grained Reactivity Guide](https://legendapp.com/open-source/state/reactivity/)
- [Computed Observables](https://legendapp.com/open-source/state/computed/)

**React Native Timer Patterns**:
- [React Native Timers](https://reactnative.dev/docs/timers)
- [useEffect Cleanup](https://react.dev/reference/react/useEffect#cleaning-up-a-side-effect)

### C. Proof of Concepts

**No POCs needed**. Implementation uses established patterns.

**Verified Technologies**:
- Legend-State: Proven state management (used in production apps)
- setInterval: Standard JavaScript API (well-documented behavior)
- useEffect cleanup: React best practice for timer management

### D. Related Documents

- **Product Requirements Document**: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/prd_scrap_system_20251116.md`
- **Original Feature Request**: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/feature-scrap.md`
- **Lean Task Generation Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/lean-task-generation-guide.md`
- **File Organization Patterns**: `/mnt/c/dev/class-one-rapids/docs/architecture/file-organization-patterns.md`
- **State Management Hooks Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/state-management-hooks-guide.md`
- **React Native UI Guidelines**: `/mnt/c/dev/class-one-rapids/docs/architecture/react-native-ui-guidelines.md`
- **React Native Testing Library Guide**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Core Clicker TDD**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/tdd_core_clicker_flow_20251116.md`

### E. Code Snippets

**Final Implementation Preview** (implementation target):

```typescript
// frontend/shared/store/gameStore.ts - NEW FILE

import { observable, computed } from '@legendapp/state';

// Shared game state observable
export const gameState$ = observable({
  petCount: 0,  // Singularity Pet Count
  scrap: 0,     // Passive resource
});

// Computed scrap generation rate (scrap per second)
export const scrapRate$ = computed(() => {
  const petCount = gameState$.petCount.get();
  const scrapMultiplier = 1; // Base: 1 scrap per pet per second
  return Math.floor(petCount * scrapMultiplier);
});
```

```typescript
// frontend/shared/hooks/useGameState.ts - NEW FILE

import { gameState$, scrapRate$ } from '../store/gameStore';

/**
 * Hook for accessing shared game state
 * @returns Reactive observables for pet count, scrap, and scrap rate
 */
export function useGameState() {
  return {
    petCount$: gameState$.petCount,
    scrap$: gameState$.scrap,
    scrapRate$: scrapRate$,
  };
}
```

```typescript
// frontend/modules/attack-button/ClickerScreen.tsx - UPDATED

import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameState } from '../../shared/hooks/useGameState';

export function ClickerScreen() {
  const { petCount$, scrap$, scrapRate$ } = useGameState();

  // Scrap generation timer
  useEffect(() => {
    const interval = setInterval(() => {
      const rate = scrapRate$.get();
      scrap$.set(prev => prev + rate);
    }, 1000); // 1 second interval

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text
          style={styles.counterText}
          accessibilityRole="text"
          accessibilityLabel={`Singularity Pet Count: ${petCount$.get()}`}
        >
          Singularity Pet Count: {petCount$.get()}
        </Text>

        <Text
          style={styles.scrapText}
          accessibilityRole="text"
          accessibilityLabel={`Scrap: ${scrap$.get()}, generating ${scrapRate$.get()} per second`}
        >
          Scrap: {scrap$.get()} (+{scrapRate$.get()}/sec)
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={() => petCount$.set(prev => prev + 1)}
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
    marginBottom: 15,
    color: '#000000',
  },
  scrapText: {
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

**Usage Example**:

```typescript
// Example: Accessing game state from any component
import { useGameState } from '../../shared/hooks/useGameState';

function SomeComponent() {
  const { petCount$, scrap$, scrapRate$ } = useGameState();

  // Read current values (component re-renders on change)
  const petCount = petCount$.get();
  const scrap = scrap$.get();
  const scrapRate = scrapRate$.get();

  // Write values
  const addPet = () => petCount$.set(prev => prev + 1);
  const addScrap = (amount) => scrap$.set(prev => prev + amount);

  return (
    <View>
      <Text>Pets: {petCount}</Text>
      <Text>Scrap: {scrap} (+{scrapRate}/sec)</Text>
    </View>
  );
}
```

---

**Generated from PRD**: `prd_scrap_system_20251116.md`
**Generation Date**: 2025-11-16
**TDD Implementation Required**: Yes (all features must be test-driven)
**Architecture Compliance**: Lean principles, behavior-based hooks, fine-grained reactivity, file organization patterns
