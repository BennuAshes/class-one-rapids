# Scrap Idle Resource System Implementation Tasks

## Document Metadata

- **Source TDD**: `tdd_scrap_system_20251116.md`
- **Generated**: 2025-11-16
- **Total Tasks**: 6 tasks across 4 phases
- **Estimated Duration**: 2 days
- **Architecture**: Feature-based, Test-Driven Development (TDD)

## 🔍 Architecture Decisions (from TDD Section 2)

Based on codebase exploration in TDD:

**CREATE (New Files)**:
- CREATE: `frontend/shared/store/gameStore.ts` (first cross-feature shared state)
- CREATE: `frontend/shared/hooks/useGameState.ts` (public API for game state)

**UPDATE (Existing Files)**:
- UPDATE: `frontend/modules/attack-button/ClickerScreen.tsx` (refactor to use shared state, add scrap display)
- UPDATE: `frontend/modules/attack-button/ClickerScreen.test.tsx` (adapt for shared state, add scrap tests)

**Store Properties (verified in TDD Section 2.3)**:
- `gameState$.petCount` (migrated from ClickerScreen local state)
- `gameState$.scrap` (NEW - passive resource)
- `scrapRate$` (computed - scrap per second)

**Integration Points**:
- App.tsx: No changes needed (already renders ClickerScreen)
- ClickerScreen: Migrate from `useState` to shared `gameState$` observable

**Module Ownership**:
- `shared/store/` owns game state (cross-feature state)
- `shared/hooks/` owns state access hooks (public API)
- `attack-button` module owns ClickerScreen (displays pets + scrap)

---

## 📋 LEAN PRINCIPLES REMINDER

Per @docs/architecture/lean-task-generation-guide.md:
- ✅ **First task delivers user-visible functionality** (not just setup)
- ✅ **Each task independently demo-able**
- ✅ **Just-in-time file/folder creation** (create when needed)
- ✅ **No infrastructure-only tasks**

---

## Phase 1: Foundation - Shared Game State (TDD First Layer)

_Duration: 0.5 days | Priority: P0 | Prerequisites: None_

**CRITICAL**: This phase creates the shared state foundation. All subsequent tasks depend on this.

### Task 1.1: Install Legend-State Dependency

**ROLE**: You are a senior developer setting up dependencies

**CONTEXT**: The scrap system requires Legend-State for fine-grained reactive state management (per TDD Section 4 "System Architecture"). This is the first shared state in the application.

**OBJECTIVE**: Install @legendapp/state package to enable reactive state management

**IMPLEMENTATION STEPS**:

1. Install Legend-State package:
   ```bash
   npm install @legendapp/state
   ```

2. Verify installation:
   ```bash
   npm list @legendapp/state
   ```

**ACCEPTANCE CRITERIA**:
- [ ] @legendapp/state package installed successfully
- [ ] Package appears in package.json dependencies
- [ ] No installation errors or warnings
- [ ] Version is latest stable (verify with npm)

**DELIVERABLES**:
- Updated package.json with @legendapp/state dependency
- Updated package-lock.json

**DEPENDENCIES**: None
**ESTIMATED TIME**: 5 minutes
**TOOLS NEEDED**: npm

---

### Task 1.2: TDD - Create Game Store with Tests (RED-GREEN-REFACTOR)

**ROLE**: You are a senior developer implementing shared state using Test-Driven Development

**CONTEXT**: Per TDD Section 2 "Codebase Exploration", no shared stores exist yet. This is the first cross-feature shared state, containing pet count (currently in ClickerScreen local state) and scrap (new resource).

**OBJECTIVE**: Build `gameStore.ts` and `scrapRate$` computed observable using strict TDD approach

**FILE LOCATIONS**:
- Store: `frontend/shared/store/gameStore.ts` (CREATE - new file per TDD Section 2)
- Store Test: `frontend/shared/store/gameStore.test.ts` (CREATE - co-located test)

**BEFORE STARTING IMPLEMENTATION**:

**Dependency Validation Checklist**:
- [ ] Verify @legendapp/state is installed (Task 1.1 completed)
- [ ] No existing stores to conflict with (verified in TDD Section 2)
- [ ] No persistence layer in MVP (deferred per TDD Section 13 "Open Questions")

---

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Tests First

```typescript
// frontend/shared/store/gameStore.test.ts
import { gameState$, scrapRate$ } from './gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset state before each test for isolation
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
      // Base multiplier is 1, so this tests Math.floor behavior
      gameState$.petCount.set(7);
      expect(scrapRate$.get()).toBe(7); // Math.floor(7 * 1) = 7
    });
  });
});
```

**Run tests - they should FAIL** (gameStore.ts doesn't exist yet):
```bash
npm test -- gameStore.test.ts
```

#### Step 2: GREEN - Write Minimal Code to Pass Tests

```typescript
// frontend/shared/store/gameStore.ts
import { observable, computed } from '@legendapp/state';

/**
 * Shared game state observable
 * Contains cross-feature game progression state
 */
export const gameState$ = observable({
  petCount: 0,  // Singularity Pet Count (shared with ClickerScreen)
  scrap: 0,     // Passive resource (scrap system)
});

/**
 * Computed scrap generation rate (scrap per second)
 * Auto-recomputes when petCount changes
 */
export const scrapRate$ = computed(() => {
  const petCount = gameState$.petCount.get();
  const scrapMultiplier = 1; // Base: 1 scrap per pet per second
  return Math.floor(petCount * scrapMultiplier);
});
```

**Run tests - they should PASS**:
```bash
npm test -- gameStore.test.ts
```

#### Step 3: REFACTOR - Improve Code Quality

- Add JSDoc comments (already included above)
- Verify code style matches project conventions
- Run tests again to ensure they remain green

---

**ACCEPTANCE CRITERIA**:
- [ ] All gameState$ tests pass (6 tests)
- [ ] All scrapRate$ tests pass (4 tests)
- [ ] gameState$ initializes with petCount=0, scrap=0
- [ ] Functional updates work (prev => prev + X)
- [ ] scrapRate$ auto-recomputes when petCount changes
- [ ] Math.floor applied to scrap rate calculation
- [ ] Test coverage > 80% for gameStore.ts
- [ ] Tests run in isolation (beforeEach resets state)

**DELIVERABLES**:
1. `frontend/shared/store/gameStore.ts` - Shared game state observable
2. `frontend/shared/store/gameStore.test.ts` - Comprehensive test suite (10 tests)

**DEPENDENCIES**: Task 1.1 (Legend-State installed)
**ESTIMATED TIME**: 1 hour
**COMPLEXITY**: Medium (first shared store, TDD discipline)

---

### Task 1.3: TDD - Create useGameState Hook with Tests (RED-GREEN-REFACTOR)

**ROLE**: You are a senior developer creating the public API for game state access

**CONTEXT**: Per TDD Section 2 "Architecture Decisions": "Components never import observables directly - All state access through hooks". This hook provides the public API for accessing game state (pet count, scrap, scrap rate).

**OBJECTIVE**: Build `useGameState` hook using Test-Driven Development

**FILE LOCATIONS**:
- Hook: `frontend/shared/hooks/useGameState.ts` (CREATE - new file per TDD Section 2)
- Hook Test: `frontend/shared/hooks/useGameState.test.ts` (CREATE - co-located test)

**BEFORE STARTING IMPLEMENTATION**:

**Dependency Validation Checklist**:
- [ ] Task 1.2 completed (gameStore.ts exists with tests passing)
- [ ] Import from `../store/gameStore` will work (relative path verified)

---

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Tests First

```typescript
// frontend/shared/hooks/useGameState.test.ts
import { renderHook } from '@testing-library/react-native';
import { useGameState } from './useGameState';
import { gameState$ } from '../store/gameStore';

describe('useGameState', () => {
  beforeEach(() => {
    // Reset game state before each test
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
```

**Run tests - they should FAIL** (useGameState.ts doesn't exist yet):
```bash
npm test -- useGameState.test.ts
```

#### Step 2: GREEN - Write Minimal Code to Pass Tests

```typescript
// frontend/shared/hooks/useGameState.ts
import { gameState$, scrapRate$ } from '../store/gameStore';

/**
 * Hook for accessing shared game state
 * Provides reactive observables for pet count, scrap, and scrap rate
 *
 * @returns Reactive observables for game state
 *
 * @example
 * const { petCount$, scrap$, scrapRate$ } = useGameState();
 * const petCount = petCount$.get();  // Read current value
 * petCount$.set(5);                  // Write new value
 * petCount$.set(prev => prev + 1);   // Functional update
 */
export function useGameState() {
  return {
    petCount$: gameState$.petCount,
    scrap$: gameState$.scrap,
    scrapRate$: scrapRate$,
  };
}
```

**Run tests - they should PASS**:
```bash
npm test -- useGameState.test.ts
```

#### Step 3: REFACTOR - Improve Code Quality

- Add JSDoc comments with usage example (already included above)
- Verify TypeScript types are inferred correctly
- Run tests again to ensure they remain green

---

**ACCEPTANCE CRITERIA**:
- [ ] All useGameState tests pass (6 tests)
- [ ] Hook returns petCount$ observable
- [ ] Hook returns scrap$ observable
- [ ] Hook returns scrapRate$ computed observable
- [ ] Observables are reactive (read/write works)
- [ ] scrapRate$ recomputes when petCount changes
- [ ] Test coverage > 80% for useGameState.ts
- [ ] JSDoc comments document usage

**DELIVERABLES**:
1. `frontend/shared/hooks/useGameState.ts` - Public API hook
2. `frontend/shared/hooks/useGameState.test.ts` - Test suite (6 tests)

**DEPENDENCIES**: Task 1.2 (gameStore.ts with tests passing)
**ESTIMATED TIME**: 30 minutes
**COMPLEXITY**: Low (simple hook, straightforward tests)

---

## Phase 2: ClickerScreen Refactoring (State Migration)

_Duration: 0.5 days | Priority: P0 | Prerequisites: Phase 1_

**CRITICAL**: This phase migrates ClickerScreen from local state to shared state WITHOUT breaking existing functionality. All existing tests must remain green.

### Task 2.1: TDD - Refactor ClickerScreen to Use Shared State (RED-GREEN-REFACTOR)

**ROLE**: You are a senior developer refactoring existing component to use shared state

**CONTEXT**: Per TDD Section 2 "Codebase Exploration", ClickerScreen currently uses local `useState(0)` for pet count. This must be refactored to use `gameState$.petCount` from shared store to enable scrap generation based on pet count.

**OBJECTIVE**: Migrate ClickerScreen from local state to shared state while maintaining all existing functionality and passing all existing tests

**FILE LOCATIONS** (based on TDD Section 2):
- UPDATE: `frontend/modules/attack-button/ClickerScreen.tsx` (existing file)
- UPDATE: `frontend/modules/attack-button/ClickerScreen.test.tsx` (existing tests)

**BEFORE STARTING IMPLEMENTATION**:

**Dependency Validation Checklist**:
- [ ] Read `frontend/modules/attack-button/ClickerScreen.tsx` (verify current implementation)
- [ ] Read `frontend/modules/attack-button/ClickerScreen.test.tsx` (verify existing tests)
- [ ] Phase 1 completed (gameStore.ts and useGameState.ts exist with tests passing)
- [ ] Import path verified: `../../shared/hooks/useGameState` (from attack-button to shared)

---

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Adapt Existing Tests for Shared State

**First, read the existing test file** to understand current test structure:
```bash
# (Agent should use Read tool to read ClickerScreen.test.tsx)
```

**Update existing tests to use shared state**:

```typescript
// frontend/modules/attack-button/ClickerScreen.test.tsx
// ADD these imports at the top
import { gameState$ } from '../../shared/store/gameStore';

describe('ClickerScreen', () => {
  beforeEach(() => {
    // ADD: Reset shared state before each test (ensures test isolation)
    gameState$.petCount.set(0);
    gameState$.scrap.set(0);
  });

  // EXISTING TESTS - Update assertions to verify shared state
  test('displays initial pet count of zero', () => {
    render(<ClickerScreen />);
    expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
    // ADD: Verify shared state is used
    expect(gameState$.petCount.get()).toBe(0);
  });

  test('increments pet count when feed button pressed', () => {
    render(<ClickerScreen />);
    const feedButton = screen.getByRole('button', { name: /feed/i });

    fireEvent.press(feedButton);

    expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    // ADD: Verify shared state updated
    expect(gameState$.petCount.get()).toBe(1);
  });

  // ADD: New test for shared state integration
  test('pet count uses shared state (not local useState)', () => {
    render(<ClickerScreen />);
    const feedButton = screen.getByRole('button', { name: /feed/i });

    fireEvent.press(feedButton);

    // Verify shared state updated
    expect(gameState$.petCount.get()).toBe(1);
  });

  // Keep all other existing tests (accessibility, button styling, etc.)
});
```

**Run tests - they should FAIL** (component still uses local useState):
```bash
npm test -- ClickerScreen.test.tsx
```

#### Step 2: GREEN - Refactor Component to Use Shared State

**Read the existing component first**:
```bash
# (Agent should use Read tool to read ClickerScreen.tsx)
```

**Update ClickerScreen.tsx**:

```typescript
// frontend/modules/attack-button/ClickerScreen.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameState } from '../../shared/hooks/useGameState'; // ADD: Import hook

export function ClickerScreen() {
  // REPLACE: const [count, setCount] = useState(0);
  // WITH: Shared state access
  const { petCount$ } = useGameState();

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

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={() => petCount$.set(prev => prev + 1)} // UPDATE: Use observable
          accessibilityRole="button"
          accessibilityLabel="feed button"
        >
          <Text style={styles.buttonText}>feed</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// KEEP: All existing styles unchanged
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

**Run tests - they should PASS** (all existing tests + new shared state test):
```bash
npm test -- ClickerScreen.test.tsx
```

#### Step 3: REFACTOR - Code Quality Check

- Verify no local state remains (no useState in component)
- Ensure all existing functionality preserved
- Run full test suite to verify no regressions:
  ```bash
  npm test
  ```

---

**ACCEPTANCE CRITERIA**:
- [ ] ClickerScreen uses `useGameState()` hook (not local useState)
- [ ] Pet count display uses `petCount$.get()`
- [ ] Feed button uses `petCount$.set(prev => prev + 1)`
- [ ] All existing ClickerScreen tests pass (no regressions)
- [ ] New test verifies shared state usage
- [ ] No local state remains in component
- [ ] Accessibility attributes unchanged
- [ ] Visual appearance unchanged (styles preserved)
- [ ] Test coverage maintained > 80%

**DELIVERABLES**:
1. Updated `frontend/modules/attack-button/ClickerScreen.tsx` - Uses shared state
2. Updated `frontend/modules/attack-button/ClickerScreen.test.tsx` - Tests adapted + new shared state test

**DEPENDENCIES**: Task 1.3 (useGameState hook with tests passing)
**ESTIMATED TIME**: 1 hour
**COMPLEXITY**: Medium (careful refactoring, must preserve existing behavior)
**RISK**: Breaking existing tests (mitigated by running tests frequently)

---

## Phase 3: Scrap Display & Timer Implementation (User-Visible Feature)

_Duration: 0.5 days | Priority: P0 | Prerequisites: Phase 2_

**USER-VISIBLE FEATURE**: Scrap counter appears and automatically increases every 1 second based on pet count.

### Task 3.1: TDD - Add Scrap Display to ClickerScreen (RED-GREEN-REFACTOR)

**ROLE**: You are a senior developer adding UI for the scrap system

**CONTEXT**: Per TDD Section 3 "Requirements Analysis", scrap must be displayed in ClickerScreen with label "Scrap: {amount}" and generation rate "+{rate}/sec" (P1 enhancement). This is a static display (no timer yet).

**OBJECTIVE**: Add scrap display to ClickerScreen UI using Test-Driven Development

**FILE LOCATIONS**:
- UPDATE: `frontend/modules/attack-button/ClickerScreen.tsx` (add scrap display)
- UPDATE: `frontend/modules/attack-button/ClickerScreen.test.tsx` (add scrap display tests)

**BEFORE STARTING IMPLEMENTATION**:

**Dependency Validation Checklist**:
- [ ] Task 2.1 completed (ClickerScreen uses shared state, tests passing)
- [ ] useGameState hook provides `scrap$` and `scrapRate$` (verified in Task 1.3)

---

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Tests for Scrap Display

```typescript
// frontend/modules/attack-button/ClickerScreen.test.tsx
// ADD to existing describe block

describe('ClickerScreen - Scrap Display', () => {
  beforeEach(() => {
    gameState$.petCount.set(0);
    gameState$.scrap.set(0);
  });

  test('displays initial scrap count of zero', () => {
    render(<ClickerScreen />);
    expect(screen.getByText(/Scrap: 0/i)).toBeTruthy();
  });

  test('displays scrap label clearly', () => {
    render(<ClickerScreen />);
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

describe('ClickerScreen - Scrap Display Accessibility', () => {
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
```

**Run tests - they should FAIL** (no scrap display in component yet):
```bash
npm test -- ClickerScreen.test.tsx
```

#### Step 2: GREEN - Add Scrap Display to Component

```typescript
// frontend/modules/attack-button/ClickerScreen.tsx
// UPDATE: Add scrap$ and scrapRate$ to destructuring
const { petCount$, scrap$, scrapRate$ } = useGameState();

// UPDATE: Add scrap display in JSX (between pet count and feed button)
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

      {/* ADD: Scrap display */}
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

// ADD: Style for scrap text
const styles = StyleSheet.create({
  // ... existing styles ...
  scrapText: {
    fontSize: 18,
    marginBottom: 30,
    color: '#000000',
  },
});
```

**Run tests - they should PASS**:
```bash
npm test -- ClickerScreen.test.tsx
```

#### Step 3: REFACTOR - Visual Polish

- Adjust spacing between elements (margins)
- Ensure text is readable and properly aligned
- Verify color contrast meets WCAG 4.5:1 ratio
- Run tests to ensure refactoring doesn't break anything

---

**VISUAL REQUIREMENTS**:

| Property | Value | Notes |
|----------|-------|-------|
| **Font Size** | 18px | Matches pet count size |
| **Color** | #000000 (black) | 4.5:1 contrast on white |
| **Margin Bottom** | 30px | Space above feed button |
| **Alignment** | Center | Centered in content area |
| **Format** | "Scrap: {amount} (+{rate}/sec)" | Clear label + rate |
| **Accessibility** | Screen reader announces value + rate | WCAG compliant |

---

**ACCEPTANCE CRITERIA**:
- [ ] Scrap display visible in ClickerScreen
- [ ] Format: "Scrap: {amount} (+{rate}/sec)"
- [ ] Initial scrap is 0
- [ ] Display updates when scrap changes
- [ ] Handles large numbers (999999+) without breaking
- [ ] Accessibility role="text"
- [ ] Accessible label includes value and rate
- [ ] All 6 new tests pass
- [ ] All existing tests still pass (no regressions)
- [ ] Visual spacing is appropriate
- [ ] Text contrast meets WCAG 4.5:1

**DELIVERABLES**:
1. Updated `frontend/modules/attack-button/ClickerScreen.tsx` - Scrap display added
2. Updated `frontend/modules/attack-button/ClickerScreen.test.tsx` - 6 new tests for scrap display

**DEPENDENCIES**: Task 2.1 (ClickerScreen refactored to shared state)
**ESTIMATED TIME**: 1 hour
**COMPLEXITY**: Low (straightforward UI addition)

---

### Task 3.2: TDD - Implement Scrap Generation Timer (RED-GREEN-REFACTOR)

**ROLE**: You are a senior developer implementing the core idle game mechanic

**CONTEXT**: Per TDD Section 3 "Requirements Analysis", scrap must automatically increase every 1 second based on pet count (1 scrap per pet per second). Timer must clean up on unmount to prevent memory leaks.

**OBJECTIVE**: Implement scrap generation timer using useEffect with setInterval, following strict TDD

**FILE LOCATIONS**:
- UPDATE: `frontend/modules/attack-button/ClickerScreen.tsx` (add timer logic)
- UPDATE: `frontend/modules/attack-button/ClickerScreen.test.tsx` (add timer tests)

**BEFORE STARTING IMPLEMENTATION**:

**Dependency Validation Checklist**:
- [ ] Task 3.1 completed (scrap display visible, tests passing)
- [ ] Jest fake timers supported (pre-configured in Expo)

---

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Tests for Timer

```typescript
// frontend/modules/attack-button/ClickerScreen.test.tsx
// ADD: Import act for async state updates
import { render, screen, fireEvent, act } from '@testing-library/react-native';

describe('ClickerScreen - Scrap Generation Timer', () => {
  beforeEach(() => {
    gameState$.petCount.set(0);
    gameState$.scrap.set(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

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

describe('ClickerScreen - Integration: Pet Count & Scrap', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

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
```

**Run tests - they should FAIL** (no timer implemented yet):
```bash
npm test -- ClickerScreen.test.tsx
```

#### Step 2: GREEN - Implement Timer with useEffect

```typescript
// frontend/modules/attack-button/ClickerScreen.tsx
// ADD: Import useEffect
import React, { useEffect } from 'react';

export function ClickerScreen() {
  const { petCount$, scrap$, scrapRate$ } = useGameState();

  // ADD: Scrap generation timer
  useEffect(() => {
    const interval = setInterval(() => {
      const rate = scrapRate$.get();
      scrap$.set(prev => prev + rate);
    }, 1000); // 1 second interval

    return () => clearInterval(interval); // Cleanup on unmount
  }, []); // Empty deps: timer runs for component lifetime

  // ... rest of component unchanged ...
}
```

**Run tests - they should PASS**:
```bash
npm test -- ClickerScreen.test.tsx
```

#### Step 3: REFACTOR - Code Quality Check

- Verify timer cleanup (no memory leaks)
- Ensure interval is 1000ms (1 second)
- Confirm scrapRate$ is used (not hardcoded calculation)
- Run full test suite to verify no regressions

---

**ACCEPTANCE CRITERIA**:
- [ ] Timer generates scrap every 1 second
- [ ] Rate calculation: `scrapRate$.get()` (uses computed observable)
- [ ] Scrap increment: `scrap$.set(prev => prev + rate)`
- [ ] Timer cleans up on unmount (clearInterval in useEffect return)
- [ ] All 8 timer tests pass
- [ ] Pet count changes affect next tick (real-time rate update)
- [ ] No scrap generation when pet count is 0
- [ ] Multiple ticks accumulate scrap correctly
- [ ] Scrap generation does not affect pet count
- [ ] All existing tests still pass (no regressions)
- [ ] No memory leaks (timer cleanup verified)

**DELIVERABLES**:
1. Updated `frontend/modules/attack-button/ClickerScreen.tsx` - Timer implemented
2. Updated `frontend/modules/attack-button/ClickerScreen.test.tsx` - 8 new timer tests

**DEPENDENCIES**: Task 3.1 (scrap display visible)
**ESTIMATED TIME**: 1.5 hours
**COMPLEXITY**: Medium (timer management, cleanup, Jest fake timers)
**CRITICAL**: Timer cleanup is essential to prevent memory leaks

---

## Phase 4: Integration Testing & Documentation

_Duration: 0.25 days | Priority: P1 | Prerequisites: Phase 3_

**VERIFICATION**: End-to-end testing and documentation to ensure production readiness.

### Task 4.1: Integration Testing & Coverage Verification

**ROLE**: You are a QA engineer validating the complete scrap system

**CONTEXT**: All individual components tested (store, hook, component, timer). Now verify end-to-end integration and test coverage meets requirements.

**OBJECTIVE**: Run full test suite, verify coverage > 80%, and perform manual testing

**IMPLEMENTATION STEPS**:

1. **Run Full Test Suite**:
   ```bash
   npm test
   ```
   - All tests must pass (green)
   - No test failures or errors

2. **Generate Coverage Report**:
   ```bash
   npm test -- --coverage
   ```
   - Coverage for gameStore.ts > 80%
   - Coverage for useGameState.ts > 80%
   - Coverage for ClickerScreen.tsx > 80%

3. **Manual Testing Checklist** (run app on device/simulator):
   - [ ] Scrap starts at 0 on app launch
   - [ ] Scrap increases every 1 second when pets exist
   - [ ] Scrap rate matches pet count (1 pet = +1/sec, 10 pets = +10/sec)
   - [ ] No scrap generation when pet count is 0
   - [ ] Pet count increment immediately affects next scrap tick
   - [ ] Timer stops when app is closed (no memory leaks)
   - [ ] Scrap display is readable and accessible
   - [ ] Feed button still works (pet count increments)
   - [ ] No visual glitches or layout issues

4. **Performance Verification**:
   - Run app for 10 minutes with 100 pets
   - Verify no lag or performance degradation
   - Check scrap accuracy (should be ~6000 after 60 seconds with 100 pets, ±5%)

5. **Accessibility Testing** (if screen reader available):
   - [ ] Pet count announced correctly
   - [ ] Scrap count announced with rate
   - [ ] Feed button is tappable and announced

**ACCEPTANCE CRITERIA**:
- [ ] All automated tests pass (100% green)
- [ ] Test coverage > 80% for all new files
- [ ] Manual testing checklist complete (all items checked)
- [ ] No memory leaks over 10-minute session
- [ ] Performance meets requirements (< 5ms per tick, 60fps maintained)
- [ ] Accessibility compliance verified

**DELIVERABLES**:
- Test coverage report (saved screenshot or text output)
- Manual testing results (checklist completed)
- Performance verification notes

**DEPENDENCIES**: Task 3.2 (timer implemented, all tests written)
**ESTIMATED TIME**: 1 hour
**TOOLS NEEDED**: npm, device/simulator, screen reader (optional)

---

## Summary Statistics

- **Total Tasks**: 6 tasks
- **Total Phases**: 4 phases
- **Estimated Duration**: 2 days (includes TDD discipline overhead)
- **Critical Path**:
  1. Task 1.1: Install Legend-State (blocker for all other tasks)
  2. Task 1.2: Create gameStore.ts (blocker for useGameState)
  3. Task 1.3: Create useGameState hook (blocker for ClickerScreen refactor)
  4. Task 2.1: Refactor ClickerScreen (blocker for scrap display)
  5. Task 3.1: Add scrap display (blocker for timer)
  6. Task 3.2: Implement timer (enables Task 4.1)
  7. Task 4.1: Integration testing (final verification)

- **Parallel Execution Potential**: 0% (all tasks are sequential due to dependencies)
- **Test Coverage Target**: > 80% for all new code
- **Risk Coverage**: All risks from TDD Section 11 addressed:
  - Timer drift: Documented acceptable variance (< 5% per hour)
  - State refactoring: Frequent test runs during Task 2.1
  - Legend-State dependency: Task 1.1 ensures installation before use
  - Timer cleanup: Task 3.2 includes unmount test
  - Pet count reactivity: Task 3.2 includes mid-session change test

---

## Execution Notes

**For AI Agents**:
1. Execute tasks sequentially in order (1.1 → 1.2 → 1.3 → 2.1 → 3.1 → 3.2 → 4.1)
2. Validate prerequisites before starting each task
3. Run tests after each task to ensure green before proceeding
4. Use Read tool to read existing files before modifying (never assume structure)
5. Report completion with test results as evidence

**For Human Developers**:
1. Tasks can be worked on in order, but checkpoint frequently
2. Run `npm test` after each change to catch regressions early
3. Use Jest fake timers for timer tests (`jest.useFakeTimers()`)
4. Commit after each completed task (green tests)
5. Manual testing is critical for timer accuracy verification

**Critical Reminders**:
- ✅ **TDD Discipline**: Test FIRST, implementation SECOND, refactor THIRD
- ✅ **No skipping tests**: Every behavior must have a test before implementation
- ✅ **Shared state pattern**: Components access state via hooks, not direct observable imports
- ✅ **Timer cleanup**: Always return cleanup function from useEffect
- ✅ **Test isolation**: Use beforeEach to reset gameState$ before each test

---

_Generated from TDD: `tdd_scrap_system_20251116.md`_
_Generation timestamp: 2025-11-16_
_Optimized for: AI agent execution with human oversight_
_Architecture compliance: Lean principles, TDD methodology, feature-based organization, behavior-based hooks_
