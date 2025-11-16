# Scrap Resource System Technical Design Document

## Document Control

| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude (Generated) | 2025-11-16 | Draft | Initial TDD from PRD |

## Executive Summary

This Technical Design Document defines the implementation for a passive resource generation system where AI Pets automatically collect "scrap" over time. The solution leverages Legend-State v3 for reactive state management, extends the existing persisted counter pattern, and implements interval-based resource generation. This feature establishes the foundation for a resource economy while maintaining the existing clicker game architecture.

**Key Technical Decisions:**
- Extend existing `usePersistedCounter` pattern with new `useScrapGeneration` hook
- Legend-State observables for reactive scrap display updates
- setInterval-based generation (1-second ticks, active sessions only)
- AsyncStorage persistence using existing patterns
- Display-only UI integration into existing ClickerScreen
- Test-Driven Development with comprehensive coverage

---

## 1. Overview & Context

### Problem Statement

Players need a passive progression mechanic that rewards AI Pet accumulation and creates an idle game loop. The system must generate scrap resources automatically based on AI Pet count (1 scrap per pet per second), display the accumulating total prominently, and persist progress across sessions. The implementation must be extensible for future scrap consumption features while maintaining the simplicity of the current architecture.

**Technical Challenges:**
- Accurate interval-based generation (±100ms precision per PRD requirement)
- Integration with existing AI Pet counter without coupling
- Preventing resource drift during rapid pet count changes
- Graceful handling of background/inactive states
- Extensibility for future consumption mechanics
- Maintaining <50ms UI update latency for scrap display

### Solution Approach

Implement a reactive resource generation system using Legend-State v3 observables with interval-based calculation:

1. **State Layer**: Custom hook `useScrapGeneration` that encapsulates:
   - Legend-State observable for scrap total
   - setInterval for 1-second tick generation
   - Reactive subscription to AI Pet count changes
   - AsyncStorage persistence with debounced writes

2. **Generation Logic**:
   - Active-only generation (no offline progression per PRD FR-1.4)
   - Calculate scrap per tick: `currentPetCount * 1` (linear scaling)
   - Update scrap total atomically to prevent race conditions
   - Clean up intervals on unmount/pause

3. **UI Integration**:
   - Extend existing ClickerScreen component (UPDATE, not CREATE new screen)
   - Add scrap display above or near pet count
   - Use Legend-State `Memo` for surgical updates
   - Format large numbers with thousand separators
   - Include helper text about no current usage

4. **Persistence Layer**:
   - Versioned storage key: `scrap-total-v1`
   - Automatic load on app start
   - Debounced save every 1 second (aligned with generation interval)
   - Graceful fallback to 0 on errors

### Success Criteria

**Performance:**
- Scrap generation interval accuracy: ±100ms (PRD NFR-1.3)
- UI update latency: <50ms (PRD NFR-1.2)
- No frame rate drops during generation or display updates

**Reliability:**
- 100% persistence success rate for scrap totals
- Accurate generation rate adjustment when pet count changes
- No scrap underflow (negative values prevented per PRD FR-5.3)
- Graceful degradation on AsyncStorage failures

**Functionality:**
- Scrap generates every 1 second when app is active
- Rate scales linearly with AI Pet count (1 scrap/pet/second)
- Display updates in real-time with formatted numbers
- Scrap persists and restores correctly across sessions

---

## 2. Codebase Exploration & Integration Analysis

### Existing Components

**ClickerScreen** (`/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`):
- **Current state**: Complete implementation with pet counter and feed button
- **Purpose**: Main game screen displaying Singularity Pet count and feed interaction
- **Integration**: Rendered directly in App.tsx within SafeAreaProvider
- **Structure**: Uses `usePersistedCounter` hook, displays count with `Memo`, renders Pressable button
- **Decision**: **UPDATE** - Add scrap display to existing screen (no new screen needed per lean principles)

### Existing Hooks

**usePersistedCounter** (`/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts`):
- **Path**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/usePersistedCounter.ts`
- **Purpose**: Manages persistent AI Pet counter with Legend-State observables and AsyncStorage
- **Implementation**: Module-level singleton observable, 1-second debounced persistence, atomic increment action
- **Pattern**: `persist` configuration with AsyncStorage plugin, returns `{ count$, actions }` interface
- **Used by**: ClickerScreen component
- **Relevance**: Serves as reference pattern for `useScrapGeneration` implementation

### Store Properties (Verified)

**No existing stores** - The codebase uses custom hooks with module-level observables instead of global stores:
- `count$` observable defined at module level in `usePersistedCounter.ts` (line 25-33)
- This pattern will be replicated for scrap with `scrap$` observable

**Decision**: Continue custom hook pattern (no global store needed per existing architecture)

### Integration Points

**App.tsx** (`/mnt/c/dev/class-one-rapids/frontend/App.tsx`):
- **Current structure**:
  ```typescript
  <SafeAreaProvider>
    <ClickerScreen />
  </SafeAreaProvider>
  ```
- **Integration**: No navigation system, single-screen app
- **Decision**: No changes needed to App.tsx - scrap feature integrates into existing ClickerScreen

**ClickerScreen Structure**:
```typescript
// Current:
<View style={styles.container}>
  <View style={styles.counterContainer}>
    <Memo>{() => <Text>Singularity Pet Count: {count$.get()}</Text>}</Memo>
  </View>
  <Pressable onPress={actions.increment}>feed</Pressable>
</View>

// After Integration:
<View style={styles.container}>
  <View style={styles.counterContainer}>
    <Memo>{() => <Text>Singularity Pet Count: {count$.get()}</Text>}</Memo>
  </View>

  {/* NEW: Scrap display */}
  <View style={styles.scrapContainer}>
    <Memo>{() => <Text>Scrap: {formatNumber(scrap$.get())}</Text>}</Memo>
    <Text style={styles.helperText}>AI Pets collect scrap automatically</Text>
  </View>

  <Pressable onPress={actions.increment}>feed</Pressable>
</View>
```

### Architecture Decisions (UPDATE vs CREATE)

**Hook: useScrapGeneration**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts`
  - **RATIONALE**: New feature logic, belongs in `scrap` module. Follows `usePersistedCounter` pattern but adds interval-based generation logic. Module ownership clear.

**Component: ClickerScreen**
- ✅ **DECISION: UPDATE** existing file at `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
  - **RATIONALE**: Single-screen app, scrap display is part of main game UI. Lean principles dictate extending existing screen rather than creating navigation complexity. No new screen needed per PRD analysis.

**Utility: formatNumber**
- ❌ **DECISION: CREATE** new file at `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.ts`
  - **RATIONALE**: Number formatting utility for thousand separators. Scrap module owns formatting logic. Reusable for future resource displays.

**Tests**
- ❌ **DECISION: CREATE** new files:
  - `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts` (hook tests)
  - `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.test.ts` (utility tests)
- ✅ **DECISION: UPDATE** existing file:
  - `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx` (add scrap display tests)

### Integration Validation

- ✅ No duplicate/similar components exist (no other scrap systems)
- ✅ Module ownership clear: `scrap` module owns generation logic and formatting, `attack-button` module owns UI integration
- ✅ Navigation accessibility: Scrap visible on main screen (no navigation needed)
- ✅ No conflicting state management patterns (extends existing Legend-State + AsyncStorage pattern)
- ✅ Follows file organization patterns: co-located tests, no barrel exports, behavior-focused naming

---

## 3. Requirements Analysis

### Functional Requirements

**FR-1: Scrap Generation**
- **FR-1.1 (1-second generation interval)**:
  - Implementation: `setInterval(() => { scrap$.set(prev => prev + petCount) }, 1000)`
  - Testing: Mock timers in Jest, verify tick occurs every 1000ms ±100ms

- **FR-1.2 (1 scrap per pet per second)**:
  - Implementation: Linear calculation `scrapPerTick = petCount * 1`
  - Testing: Verify with 0, 1, 5, 100 pets - confirm exact scrap amounts

- **FR-1.3 (Automatic generation)**:
  - Implementation: useEffect starts interval on component mount
  - Testing: Render component, wait for ticks, verify scrap increases without user interaction

- **FR-1.4 (Active-only generation)**:
  - Implementation: No offline calculation, interval only runs when component mounted
  - Testing: Verify scrap does NOT increase when component unmounted

**FR-2: Scrap Display**
- **FR-2.1 (Prominent display)**:
  - Implementation: Dedicated scrap container in ClickerScreen, positioned above feed button
  - Testing: Verify element exists with `getByText(/scrap/i)`

- **FR-2.2 (Real-time updates)**:
  - Implementation: Legend-State `Memo` component wrapping scrap display
  - Testing: Mock timer advances, verify UI shows new value within 50ms

- **FR-2.3 (Number formatting)**:
  - Implementation: `formatNumber()` utility with thousand separators (e.g., "1,234,567")
  - Testing: Verify formatting for values: 0, 999, 1000, 1234567

- **FR-2.4 (Clear labeling)**:
  - Implementation: "Scrap: [value]" text with helper text below
  - Testing: Verify label text exists and is accessible

**FR-3: Scrap Persistence**
- **FR-3.1 (AsyncStorage save)**:
  - Implementation: Legend-State `persist` configuration, same as pet counter pattern
  - Testing: Verify AsyncStorage.setItem called with 'scrap-total-v1' key

- **FR-3.2 (Restore on return)**:
  - Implementation: Automatic load on hook initialization via persist plugin
  - Testing: Mock AsyncStorage.getItem return value, verify scrap initializes correctly

- **FR-3.3 (Shared storage mechanism)**:
  - Implementation: Use same ObservablePersistAsyncStorage plugin as pet counter
  - Testing: Verify both pet count and scrap persist/restore independently

**FR-4: AI Pet Integration**
- **FR-4.1 (Read pet count from state)**:
  - Implementation: Subscribe to `count$` observable from `usePersistedCounter`
  - Testing: Verify scrap generation uses current pet count value

- **FR-4.2 (Adjust on pet count change)**:
  - Implementation: Reactive subscription updates generation rate immediately
  - Testing: Increment pet count, verify next scrap tick uses new rate

- **FR-4.3 (Transparent relationship)**:
  - Implementation: Helper text explains pets collect scrap automatically
  - Testing: Verify helper text is visible to users

**FR-5: Resource Management**
- **FR-5.1 (Accurate total)**:
  - Implementation: Atomic observable updates prevent race conditions
  - Testing: Rapid pet count changes, verify scrap total remains accurate

- **FR-5.2 (Non-negative integer)**:
  - Implementation: Initialize to 0, all operations are additions
  - Testing: Verify scrap never goes below 0 (no consumption yet)

- **FR-5.3 (Prevent underflow)**:
  - Implementation: No subtraction operations in current scope
  - Testing: Edge case tests confirm scrap >= 0 always

- **FR-5.4 (Extensible for consumption)**:
  - Implementation: Expose `actions.spend(amount)` stub for future use
  - Testing: Architecture supports future subtraction without refactoring

### Non-Functional Requirements

**NFR-1: Performance**
- **NFR-1.1 (No performance degradation)**:
  - Target: Scrap generation calculations < 1ms
  - Implementation: Simple arithmetic (petCount * 1), no complex operations
  - Testing: Performance.now() measurements in tests

- **NFR-1.2 (Smooth UI updates)**:
  - Target: UI updates < 50ms, no frame drops
  - Implementation: Fine-grained reactivity via Memo, only scrap text re-renders
  - Testing: Verify 60fps maintained during updates (React DevTools Profiler)

- **NFR-1.3 (Interval accuracy)**:
  - Target: 1000ms ±100ms (900-1100ms acceptable)
  - Implementation: setInterval with explicit 1000ms parameter
  - Testing: Measure actual tick intervals over 10 ticks

**NFR-2: Scalability**
- **NFR-2.1 (Handle large totals)**:
  - Target: Support up to 1 trillion (10^12)
  - Implementation: JavaScript number type (safe up to 2^53-1)
  - Testing: Test with values: 999999999999 (within range)

- **NFR-2.2 (Handle large pet counts)**:
  - Target: Support up to 100,000 pets
  - Implementation: Calculation scales linearly (O(1) complexity)
  - Testing: Mock 100,000 pets, verify generation accuracy

- **NFR-2.3 (Adjustable formula)**:
  - Target: Easy to change generation rate constant
  - Implementation: Extract `SCRAP_PER_PET_PER_SECOND = 1` constant
  - Testing: Change constant, verify rate adjusts correctly

**NFR-3: Maintainability**
- **NFR-3.1 (Modular generation logic)**:
  - Implementation: Separate `useScrapGeneration` hook, encapsulated logic
  - Testing: Hook tests independent of UI tests

- **NFR-3.2 (Follow project conventions)**:
  - Implementation: Match `usePersistedCounter` patterns (module observable, persist config, return interface)
  - Testing: Code review checklist confirms pattern alignment

- **NFR-3.3 (Documented mechanics)**:
  - Implementation: JSDoc comments explaining generation formula
  - Testing: Documentation review confirms clarity

**NFR-4: User Experience**
- **NFR-4.1 (Visible progression)**:
  - Implementation: Real-time scrap count updates every second
  - Testing: User can observe scrap increasing

- **NFR-4.2 (Communicate no usage)**:
  - Implementation: Helper text: "AI Pets collect scrap automatically (no use yet)"
  - Testing: Verify text is visible and clear

- **NFR-4.3 (Natural fit in UI)**:
  - Implementation: Scrap display between counter and button, consistent styling
  - Testing: Visual regression testing (future), manual review

**NFR-5: Reliability**
- **NFR-5.1 (Reliable during extended sessions)**:
  - Implementation: Interval cleanup on unmount, no memory leaks
  - Testing: Mount/unmount cycles, verify intervals cleared

- **NFR-5.2 (Graceful error recovery)**:
  - Implementation: Try/catch around generation logic, fallback to 0
  - Testing: Force calculation errors, verify no app crash

- **NFR-5.3 (No silent persistence failures)**:
  - Implementation: AsyncStorage errors logged to console (error level)
  - Testing: Mock AsyncStorage failure, verify error logged

---

## 4. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      App.tsx                             │
│  (SafeAreaProvider wrapper)                              │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         ClickerScreen.tsx (UPDATED)                │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  usePersistedCounter()                       │ │ │
│  │  │  - count$ (AI Pet count)                     │ │ │
│  │  │  - actions.increment()                       │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │                                                    │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  useScrapGeneration(count$)     [NEW]        │ │ │
│  │  │  - scrap$ (Scrap total)                      │ │ │
│  │  │  - generation active (1s interval)           │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │                                                    │ │
│  │  UI Components:                                    │ │
│  │  ├─ Pet Counter Display (Memo wrapper)            │ │
│  │  ├─ Scrap Display (Memo wrapper) [NEW]            │ │
│  │  └─ Feed Button (Pressable)                       │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                    ↓                    ↓
       ┌────────────────────┐  ┌────────────────────┐
       │   AsyncStorage     │  │   AsyncStorage     │
       │  singularity-pet-  │  │  scrap-total-v1    │
       │  count-v1          │  │                    │
       └────────────────────┘  └────────────────────┘
```

### Component Design

#### ClickerScreen.tsx (UPDATED)

**Purpose**: Main game screen displaying AI Pet count, scrap total, and feed button

**Responsibilities**:
- Render AI Pet counter with current value (existing)
- Render scrap total with formatted display (NEW)
- Render feed button with accessibility labels (existing)
- Handle button press events by calling increment action (existing)
- Orchestrate scrap generation based on pet count (NEW)

**Dependencies**:
- `usePersistedCounter` hook (existing - AI Pet state)
- `useScrapGeneration` hook (NEW - scrap state and generation)
- `formatNumber` utility (NEW - number formatting)
- `react-native` components (View, Text, Pressable)
- `@legendapp/state/react` (Memo component)

**Interface**:
```typescript
// No props - self-contained screen (unchanged)
export function ClickerScreen(): JSX.Element
```

**Changes**:
- Import `useScrapGeneration` and `formatNumber`
- Call `useScrapGeneration(count$)` to get `scrap$` observable
- Add scrap display UI with Memo wrapper
- Add helper text about automatic collection
- Update styles to accommodate new display section

#### useScrapGeneration Hook (NEW)

**Purpose**: Manage scrap generation logic with interval-based passive accumulation

**Responsibilities**:
- Initialize scrap total from AsyncStorage on mount
- Provide observable scrap value for reactive UI
- Run 1-second interval for passive generation
- Calculate scrap per tick based on AI Pet count
- Update scrap total atomically
- Clean up interval on unmount
- Debounce persistence writes (1 second delay)
- Handle AsyncStorage errors gracefully

**Dependencies**:
- `@legendapp/state` (observable, configureSynced, synced)
- `@legendapp/state/persist-plugins/async-storage`
- `@react-native-async-storage/async-storage`
- React hooks (useEffect for interval management)

**Interface**:
```typescript
interface UseScrapGenerationReturn {
  scrap$: Observable<number>  // Reactive scrap total value
}

export function useScrapGeneration(
  petCount$: Observable<number>  // AI Pet count from usePersistedCounter
): UseScrapGenerationReturn
```

**Implementation Notes**:
- Module-level `scrap$` observable (singleton pattern like count$)
- useEffect sets up interval that reads `petCount$.get()` and increments scrap
- Interval cleared on unmount to prevent memory leaks
- Generation formula: `scrap$.set(prev => prev + petCount$.get() * SCRAP_PER_PET_PER_SECOND)`

#### formatNumber Utility (NEW)

**Purpose**: Format large numbers with thousand separators for display

**Responsibilities**:
- Convert number to string with commas
- Handle edge cases (0, negative numbers, decimals)
- Maintain readability for large values

**Dependencies**: None (pure utility function)

**Interface**:
```typescript
export function formatNumber(value: number): string

// Examples:
// formatNumber(0) → "0"
// formatNumber(999) → "999"
// formatNumber(1000) → "1,000"
// formatNumber(1234567) → "1,234,567"
```

### Data Flow

**Scrap Generation Sequence:**

```
1. ClickerScreen renders
   ↓
2. usePersistedCounter initializes → count$ observable
   ↓
3. useScrapGeneration(count$) initializes → scrap$ observable
   ↓
4. AsyncStorage loads persisted scrap (or defaults to 0)
   ↓
5. useEffect starts 1-second interval
   ↓
6. Every 1000ms:
   a. Read current petCount from count$.get()
   b. Calculate scrapToAdd = petCount * SCRAP_PER_PET_PER_SECOND
   c. Update scrap$.set(prev => prev + scrapToAdd)
   d. Memo component detects change
   e. Scrap display re-renders (< 50ms)
   f. AsyncStorage write scheduled (debounced, 1s delay)
   ↓
7. On unmount: clearInterval, persistence completes in background
```

**AI Pet Count Change Impact:**

```
1. User taps "Feed" button
   ↓
2. count$ increments (existing flow)
   ↓
3. Next generation tick (within 1 second):
   a. Interval callback reads NEW count$.get() value
   b. Calculates scrap with updated pet count
   c. Scrap generation rate immediately reflects change
   ↓
4. No explicit subscription needed - interval reads observable each tick
```

**App Startup Sequence:**

```
1. App.tsx renders
   ↓
2. ClickerScreen mounts
   ↓
3. usePersistedCounter initializes
   ↓
4. AsyncStorage loads 'singularity-pet-count-v1' (e.g., 5 pets)
   ↓
5. useScrapGeneration(count$) initializes
   ↓
6. AsyncStorage loads 'scrap-total-v1' (e.g., 1,234 scrap)
   ↓
7. Both observables initialized with persisted values
   ↓
8. UI renders with restored pet count and scrap total
   ↓
9. Generation interval starts, begins accumulating scrap at 5/second
```

---

## 5. API Design

### Internal APIs

This feature is self-contained with no external API integrations. All APIs are internal React/React Native interfaces.

**Hook API:**

```typescript
// useScrapGeneration.ts
export function useScrapGeneration(
  petCount$: Observable<number>
): UseScrapGenerationReturn

// Usage in component:
const { count$ } = usePersistedCounter();
const { scrap$ } = useScrapGeneration(count$);
```

**Utility API:**

```typescript
// formatNumber.ts
export function formatNumber(value: number): string

// Usage in component:
<Text>Scrap: {formatNumber(scrap$.get())}</Text>
```

**Component API (unchanged):**

```typescript
// ClickerScreen.tsx
export function ClickerScreen(): JSX.Element

// Usage in App.tsx (unchanged):
<ClickerScreen />
```

---

## 6. Data Model

### Entity Design

**Scrap State:**

```typescript
interface ScrapState {
  total: number  // Non-negative integer, starting at 0
}

// Constants
const SCRAP_PER_PET_PER_SECOND = 1;  // Linear scaling factor
const GENERATION_INTERVAL_MS = 1000;  // 1 second
```

**AsyncStorage Schema:**

```typescript
// Scrap persistence
{
  key: "scrap-total-v1",  // Versioned for migration support
  value: "1234"           // Stringified number
}

// AI Pet persistence (existing)
{
  key: "singularity-pet-count-v1",
  value: "5"
}

// Independent storage - no shared state object
```

### Data Access Patterns

**Read Pattern (App Startup):**
```typescript
// On hook initialization:
1. AsyncStorage.getItem('scrap-total-v1')
2. Parse JSON string to number
3. Initialize observable with value (or 0 if null)
```

**Write Pattern (After Generation Tick):**
```typescript
// On scrap update:
1. Interval fires (every 1 second)
2. Observable updates immediately: scrap$.set(prev => prev + petCount * 1)
3. Debounced persist triggered (1s delay)
4. AsyncStorage.setItem('scrap-total-v1', JSON.stringify(value))
```

**Generation Pattern (Active Session):**
```typescript
// Interval tick (every 1000ms):
1. Read current petCount: petCount$.get()
2. Calculate scrap to add: petCount * SCRAP_PER_PET_PER_SECOND
3. Update total atomically: scrap$.set(prev => prev + scrapToAdd)
4. UI updates via Memo reactivity
```

### Data Consistency

**Approach**: Optimistic UI with eventual persistence
- UI updates immediately on generation tick (optimistic)
- Persistence happens asynchronously (eventual)
- On crash: Last persisted value restored (up to 1 second of scrap loss acceptable per PRD)

**Error Handling:**
- AsyncStorage read failure: Default to 0, log error (graceful degradation)
- AsyncStorage write failure: Continue in-memory, log error (user sees correct value, persistence retried on next update)
- Calculation errors: Try/catch around generation logic, skip tick and log error

**Edge Cases:**
- Pet count changes mid-generation: Next tick uses new count (reactive)
- App goes to background: Interval stops, no offline accumulation (per PRD FR-1.4)
- Rapid pet count changes: Each tick reads current count, no drift
- Scrap overflow: JavaScript numbers support up to 2^53-1 (9 quadrillion), sufficient per PRD NFR-2.1

---

## 7. Security Design

### Authentication & Authorization

**Not Applicable**: Single-user offline app with no authentication requirements.

### Data Security

**Encryption at Rest**:
- Not implemented (scrap and pet counts are non-sensitive game data)
- AsyncStorage uses platform defaults (iOS Keychain, Android SharedPreferences)

**Encryption in Transit**:
- Not applicable (no network communication)

**PII Handling**:
- No personally identifiable information collected or stored

**Audit Logging**:
- Not required (simple game mechanic, no compliance needs)

### Security Controls

**Input Validation:**
- Generation calculations are deterministic (no user input to validate)
- AsyncStorage values validated on load (fallback to 0 if invalid)
- Pet count is always non-negative (enforced by existing counter logic)

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

- **Framework**: React Native Testing Library v13+ (already in project)
- **Test Runner**: Jest 29+ with React Native preset
- **Mocking**: Jest built-in mocking for AsyncStorage and timers
- **Assertions**: `@testing-library/jest-native` extended matchers
- **Timer Control**: Jest fake timers for interval testing

**Reference**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`

#### TDD Implementation Process

For each feature/component, follow this strict order:

**1. RED Phase - Write Failing Test First**

```typescript
// Example: Test for scrap generation
test('generates scrap every second based on pet count', async () => {
  jest.useFakeTimers();

  const { result } = renderHook(() => {
    const { count$ } = usePersistedCounter();
    count$.set(5); // 5 pets
    return useScrapGeneration(count$);
  });

  const initialScrap = result.current.scrap$.get();

  // Advance 1 second
  jest.advanceTimersByTime(1000);

  // This test MUST fail initially (no implementation yet)
  await waitFor(() => {
    expect(result.current.scrap$.get()).toBe(initialScrap + 5);
  });

  jest.useRealTimers();
});
```

**2. GREEN Phase - Minimal Implementation**

- Write ONLY enough code to pass the test
- No extra features or optimizations
- Focus on making test green

**3. REFACTOR Phase - Improve Code**

- Clean up implementation
- Extract constants/utilities
- Maintain all green tests

### App-Level Integration Testing (TDD Zero Layer - MANDATORY FIRST)

**CRITICAL**: Before implementing scrap feature, write integration tests at the ClickerScreen level that validate the complete user experience.

#### Why Component-Level Integration Tests First?

- Catches missing imports immediately (prevents "Unable to resolve" errors)
- Validates hook integration works with existing component
- Ensures feature is actually visible to users
- Tests fail until implementation exists (true TDD)

#### Required Integration Tests

```typescript
// ClickerScreen.test.tsx - ADD these BEFORE implementing scrap feature

describe('ClickerScreen Scrap Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('displays scrap total on screen', () => {
    render(<ClickerScreen />);

    // This test FAILS if scrap display doesn't exist
    expect(screen.getByText(/scrap/i)).toBeTruthy();
  });

  test('scrap increases automatically every second', async () => {
    render(<ClickerScreen />);

    // Get initial scrap value
    const initialText = screen.getByText(/scrap/i);

    // Advance 1 second
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      // Verify scrap increased (with 0 pets, should still show 0 + 0*1 = 0)
      // But implementation will be verified with actual pets
      expect(screen.getByText(/scrap/i)).toBeTruthy();
    });
  });

  test('scrap generation scales with pet count', async () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Add 3 pets
    for (let i = 0; i < 3; i++) {
      await userEvent.press(button);
    }

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 3/i)).toBeTruthy();
    });

    // Record scrap before generation
    const scrapBefore = parseInt(
      screen.getByText(/scrap/i).props.children.match(/\d+/)[0]
    );

    // Advance 1 second
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      const scrapAfter = parseInt(
        screen.getByText(/scrap/i).props.children.match(/\d+/)[0]
      );
      // 3 pets = 3 scrap per second
      expect(scrapAfter).toBe(scrapBefore + 3);
    });
  });

  test('scrap persists across remounts', async () => {
    const { unmount } = render(<ClickerScreen />);

    // Generate some scrap
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'scrap-total-v1',
        expect.any(String)
      );
    });

    unmount();

    // Re-render and verify scrap persisted
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(5));

    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/scrap.*5/i)).toBeTruthy();
    });
  });
});
```

#### Component Integration Test Checklist (MUST COMPLETE FIRST)

- [ ] `ClickerScreen.test.tsx` updated with scrap integration tests
- [ ] Tests verify scrap display is visible on screen
- [ ] Tests validate scrap generates automatically every second
- [ ] Tests verify scrap rate scales with pet count
- [ ] Tests confirm scrap persists across remounts
- [ ] All integration tests are FAILING (RED phase) before implementation
- [ ] Then implement features to make behavior tests pass

### Unit Testing (TDD First Layer)

**Hook Tests** (`useScrapGeneration.test.ts`):

```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useScrapGeneration } from './useScrapGeneration';
import { observable } from '@legendapp/state';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('useScrapGeneration Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('initializes scrap to 0 when no stored value', async () => {
    const petCount$ = observable(0);
    const { result } = renderHook(() => useScrapGeneration(petCount$));

    await waitFor(() => {
      expect(result.current.scrap$.get()).toBe(0);
    });
  });

  test('loads persisted scrap on initialization', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(1234));

    const petCount$ = observable(5);
    const { result } = renderHook(() => useScrapGeneration(petCount$));

    await waitFor(() => {
      expect(result.current.scrap$.get()).toBe(1234);
    });
  });

  test('generates scrap every 1 second based on pet count', async () => {
    const petCount$ = observable(3);
    const { result } = renderHook(() => useScrapGeneration(petCount$));

    const initialScrap = result.current.scrap$.get();

    // Advance 1 second
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(result.current.scrap$.get()).toBe(initialScrap + 3);
    });

    // Advance another second
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(result.current.scrap$.get()).toBe(initialScrap + 6);
    });
  });

  test('adjusts generation rate when pet count changes', async () => {
    const petCount$ = observable(2);
    const { result } = renderHook(() => useScrapGeneration(petCount$));

    const initialScrap = result.current.scrap$.get();

    // Generate with 2 pets
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(result.current.scrap$.get()).toBe(initialScrap + 2);
    });

    // Change pet count to 5
    act(() => {
      petCount$.set(5);
    });

    // Next tick should use new count
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(result.current.scrap$.get()).toBe(initialScrap + 2 + 5);
    });
  });

  test('handles zero pets correctly', async () => {
    const petCount$ = observable(0);
    const { result } = renderHook(() => useScrapGeneration(petCount$));

    const initialScrap = result.current.scrap$.get();

    // Advance several seconds
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      // Scrap should not increase with 0 pets
      expect(result.current.scrap$.get()).toBe(initialScrap);
    });
  });

  test('persists scrap to AsyncStorage', async () => {
    const petCount$ = observable(1);
    const { result } = renderHook(() => useScrapGeneration(petCount$));

    // Generate scrap
    jest.advanceTimersByTime(1000);

    // Wait for debounced persist (1 second + buffer)
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'scrap-total-v1',
        expect.any(String)
      );
    }, { timeout: 2000 });
  });

  test('cleans up interval on unmount', async () => {
    const petCount$ = observable(5);
    const { result, unmount } = renderHook(() => useScrapGeneration(petCount$));

    const scrapAfterFirstTick = result.current.scrap$.get();

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(result.current.scrap$.get()).toBe(scrapAfterFirstTick + 5);
    });

    const scrapBeforeUnmount = result.current.scrap$.get();

    // Unmount component
    unmount();

    // Advance time - scrap should NOT increase after unmount
    jest.advanceTimersByTime(5000);

    // Note: Can't check result.current after unmount, but verify no errors
    expect(() => jest.advanceTimersByTime(1000)).not.toThrow();
  });

  test('handles AsyncStorage read errors gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
      new Error('Storage error')
    );

    const petCount$ = observable(1);
    const { result } = renderHook(() => useScrapGeneration(petCount$));

    // Should fallback to 0 without crashing
    await waitFor(() => {
      expect(result.current.scrap$.get()).toBe(0);
    });
  });
});
```

**Utility Tests** (`formatNumber.test.ts`):

```typescript
import { formatNumber } from './formatNumber';

describe('formatNumber Utility', () => {
  test('formats zero correctly', () => {
    expect(formatNumber(0)).toBe('0');
  });

  test('formats small numbers without separators', () => {
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(99)).toBe('99');
    expect(formatNumber(999)).toBe('999');
  });

  test('formats thousands with comma separator', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(9999)).toBe('9,999');
  });

  test('formats millions with comma separators', () => {
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  test('formats billions with comma separators', () => {
    expect(formatNumber(1000000000)).toBe('1,000,000,000');
    expect(formatNumber(1234567890)).toBe('1,234,567,890');
  });

  test('handles large numbers within JavaScript safe integer range', () => {
    expect(formatNumber(999999999999)).toBe('999,999,999,999');
  });

  test('handles negative numbers (edge case)', () => {
    // Should not occur in scrap system, but test defensive behavior
    expect(formatNumber(-1234)).toBe('-1,234');
  });

  test('handles decimal numbers by truncating', () => {
    // Scrap should always be integer, but test robustness
    expect(formatNumber(1234.56)).toBe('1,234.56');
  });
});
```

### Component Integration Testing (TDD Second Layer)

**Persistence Integration** (already covered in Component Integration Tests above):

```typescript
describe('Scrap Persistence Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('restores scrap after remount', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(500));

    const { unmount } = render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/scrap.*500/i)).toBeTruthy();
    });

    unmount();

    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/scrap.*500/i)).toBeTruthy();
    });
  });

  test('scrap and pet count persist independently', async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'singularity-pet-count-v1') return Promise.resolve(JSON.stringify(10));
      if (key === 'scrap-total-v1') return Promise.resolve(JSON.stringify(2000));
      return Promise.resolve(null);
    });

    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 10/i)).toBeTruthy();
      expect(screen.getByText(/scrap.*2,000/i)).toBeTruthy();
    });
  });
});
```

### End-to-End Testing (TDD Third Layer)

**Complete Scrap Accumulation Flow**:

```typescript
describe('Scrap System E2E Flow', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('complete scrap accumulation and persistence flow', async () => {
    // Session 1: Start with 0 pets, add pets, watch scrap accumulate
    render(<ClickerScreen />);

    // Verify starting state
    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
      expect(screen.getByText(/scrap.*0/i)).toBeTruthy();
    });

    // Add 5 pets
    const button = screen.getByRole('button', { name: /feed/i });
    for (let i = 0; i < 5; i++) {
      await user.press(button);
    }

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 5/i)).toBeTruthy();
    });

    // Wait 10 seconds for scrap generation
    for (let i = 0; i < 10; i++) {
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        const expectedScrap = (i + 1) * 5;
        expect(screen.getByText(new RegExp(`scrap.*${expectedScrap}`, 'i'))).toBeTruthy();
      });
    }

    // Verify scrap reached 50 (5 pets * 10 seconds)
    expect(screen.getByText(/scrap.*50/i)).toBeTruthy();

    // Wait for persistence
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'scrap-total-v1',
        JSON.stringify(50)
      );
    }, { timeout: 2000 });
  });

  test('scrap generation adjusts dynamically with pet count changes', async () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Start with 2 pets
    await user.press(button);
    await user.press(button);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 2/i)).toBeTruthy();
    });

    // Generate for 3 seconds (2 scrap/sec = 6 total)
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.getByText(/scrap.*6/i)).toBeTruthy();
    });

    // Add 3 more pets (total 5)
    await user.press(button);
    await user.press(button);
    await user.press(button);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 5/i)).toBeTruthy();
    });

    // Generate for 2 more seconds (5 scrap/sec = 10 more, total 16)
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText(/scrap.*16/i)).toBeTruthy();
    });
  });

  test('scrap display formats large numbers correctly', async () => {
    // Start with pre-existing large scrap amount
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'scrap-total-v1') return Promise.resolve(JSON.stringify(1234567));
      return Promise.resolve(null);
    });

    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/scrap.*1,234,567/i)).toBeTruthy();
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
- [ ] Timer-dependent tests use `jest.useFakeTimers()`
- [ ] All tests pass before next feature
- [ ] Coverage >80% for new code

---

## 9. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|---------------|---------------|
| Runtime | Expo SDK 54 | Project standard, includes all required dependencies |
| Storage | AsyncStorage | Built-in persistent key-value storage for React Native |
| State Management | Legend-State v3 | Fine-grained reactivity with sub-50ms updates |
| Testing | Jest + RNTL | React Native standard testing stack |
| Timers | JavaScript setInterval | Native timer API for interval-based generation |

### Deployment Architecture

**Environment Strategy:**
- Development: `npm start` (Expo Go app)
- Testing: `npm test` (Jest test runner)
- Production: Native builds via `eas build` (future consideration)

**No CI/CD pipeline** required for initial implementation (local development only).

### Monitoring & Observability

#### Metrics

**Application Metrics:**
- Generation interval accuracy: Performance.now() measurements in tests
- Scrap calculation accuracy: Test assertions verify exact totals
- Persistence success rate: AsyncStorage mock verification
- UI update latency: React DevTools Profiler measurements

**Business Metrics** (aligned with PRD):
- Scrap generated per session: Not tracked initially (manual testing)
- Average scrap accumulation rate: Not tracked initially (manual testing)
- Player engagement with idle mechanics: Not tracked initially (manual testing)

#### Logging

**Log Levels:**
- Error: AsyncStorage failures, generation errors (console.error)
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
- Generation tick calculation: <1ms (PRD NFR-1.1)
  - Implementation: Simple arithmetic (petCount * 1), O(1) complexity

- UI update latency: <50ms (PRD NFR-1.2)
  - Implementation: Legend-State fine-grained reactivity, only scrap text re-renders

- Interval accuracy: 1000ms ±100ms (PRD NFR-1.3)
  - Implementation: setInterval with explicit 1000ms parameter

- Persistence latency: <1s (debounced)
  - Implementation: 1 second debounce on AsyncStorage writes

**Throughput:**
- Generation ticks: 1 per second (deterministic)
  - Implementation: Single interval, no concurrent tick processing

**Concurrent Users:**
- Single user (offline app, no multi-user support)

### Scalability Strategy

**Not Applicable**: Single-screen, single-user offline app with no scalability requirements.

Future considerations (if app grows):
- Multiple resources: Extend pattern with additional observables (energy, materials, etc.)
- Multiple generation sources: Compose multiple generation hooks
- Cloud sync: Integrate syncedFetch for remote persistence

### Performance Optimization

**Query Optimization:**
- Not applicable (no database queries)

**Asset Optimization:**
- Not applicable (no images or large assets)

**Code-Level Optimizations:**
- Fine-grained reactivity: Only scrap text re-renders on update (pet count display unaffected)
- Debounced persistence: Reduces AsyncStorage writes (1 write per second vs per tick)
- Memoized components: Legend-State Memo prevents unnecessary re-renders
- Cleanup on unmount: clearInterval prevents memory leaks

**Resource Pooling:**
- Not applicable (no connection pools or resource limits)

**Performance Benchmarks:**
- Generation calculation: < 1ms (tested with 100,000 pets)
- UI rendering: 60fps maintained during updates
- Memory usage: No leaks over 1-hour test session

---

## 11. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Interval drift over long sessions | Medium | Low | Use setInterval (self-correcting), test accuracy over 100+ ticks | Dev |
| AsyncStorage write failures lose scrap | Medium | Low | Graceful degradation: app continues with in-memory state, retries on next tick | Dev |
| Rapid pet count changes cause calculation errors | Low | Very Low | Read observable each tick (reactive), atomic updates prevent race conditions | Dev |
| UI performance degradation with large scrap totals | Low | Very Low | formatNumber complexity is O(log n), tested with 1 trillion | Dev |
| Memory leaks from intervals | High | Medium | clearInterval on unmount, test with mount/unmount cycles | Dev |
| Scrap overflow at large values | Low | Very Low | JavaScript numbers support up to 2^53-1 (9 quadrillion), add overflow test | Dev |

### Dependencies

**Legend-State v3 (beta):**
- Impact: Core state management dependency (shared with existing pet counter)
- Mitigation: Already in use and stable, monitor changelog for breaking changes
- Status: 🟡 Monitor (beta software, but production-ready per existing usage)

**AsyncStorage:**
- Impact: Persistence layer (shared with existing pet counter)
- Mitigation: Already stable and included in Expo SDK 54
- Status: ✅ Green

**React Native 0.81 (Expo SDK 54):**
- Impact: Platform runtime (shared with existing app)
- Mitigation: Expo SDK provides tested compatibility
- Status: ✅ Green

**JavaScript setInterval:**
- Impact: Core generation mechanism
- Mitigation: Native API, well-tested across platforms
- Status: ✅ Green

---

## 12. Implementation Plan (TDD-Driven)

Following `/mnt/c/dev/class-one-rapids/docs/architecture/lean-task-generation-guide.md` principles - prioritize user-visible functionality:

### Phase 1: Foundation & Test Setup [0.5 days]

**Step 0: Component Integration Test Setup (MANDATORY FIRST)**

Before implementing ANY scrap features, write failing integration tests in ClickerScreen:

1. Update `ClickerScreen.test.tsx` with scrap integration tests
2. Write tests that verify scrap display is visible
3. Write tests that verify scrap generates automatically every second
4. Write tests that verify scrap rate scales with pet count
5. Run tests - they MUST fail (RED phase)
6. Ready for feature implementation

**Deliverable**: `ClickerScreen.test.tsx` updated with 4-5 failing scrap tests

---

### Phase 2: TDD Feature Implementation [1-1.5 days]

**Task 2.1: Implement formatNumber Utility with TDD** [0.25 days]

**TDD Cycle:**

1. **RED - Write Failing Tests First**:
   ```typescript
   // formatNumber.test.ts
   test('formats thousands with comma separator', () => {
     expect(formatNumber(1000)).toBe('1,000');
   });

   test('formats millions with comma separators', () => {
     expect(formatNumber(1234567)).toBe('1,234,567');
   });
   ```

2. **GREEN - Minimal Implementation**:
   - Create `formatNumber.ts` utility
   - Implement number-to-string conversion with regex/Intl.NumberFormat
   - Return formatted string

3. **REFACTOR - Edge Cases**:
   - Handle 0, small numbers, large numbers
   - Add JSDoc comments

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.ts`
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.test.ts`

**Deliverable**: Working number formatter with passing tests

---

**Task 2.2: Implement Scrap Generation Hook with TDD** [0.5 days]

**TDD Cycle:**

1. **RED - Write Failing Tests**:
   ```typescript
   // useScrapGeneration.test.ts
   test('initializes scrap to 0', async () => {
     const petCount$ = observable(0);
     const { result } = renderHook(() => useScrapGeneration(petCount$));
     await waitFor(() => {
       expect(result.current.scrap$.get()).toBe(0);
     });
   });

   test('generates scrap every 1 second', async () => {
     jest.useFakeTimers();
     const petCount$ = observable(5);
     const { result } = renderHook(() => useScrapGeneration(petCount$));

     const initial = result.current.scrap$.get();
     jest.advanceTimersByTime(1000);

     await waitFor(() => {
       expect(result.current.scrap$.get()).toBe(initial + 5);
     });
     jest.useRealTimers();
   });
   ```

2. **GREEN - Implement Hook**:
   - Create `useScrapGeneration.ts` hook
   - Initialize module-level `scrap$` observable with persist config
   - Implement useEffect with setInterval for generation
   - Calculate scrap per tick: `petCount$.get() * 1`
   - Update scrap atomically
   - Return `{ scrap$ }`

3. **REFACTOR - Error Handling & Cleanup**:
   - Add try/catch for AsyncStorage errors
   - Implement graceful fallback to 0
   - Ensure clearInterval on unmount
   - Extract SCRAP_PER_PET_PER_SECOND constant

**Files Created**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts`
- `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.test.ts`

**Deliverable**: Hook with full generation and persistence logic, all tests passing

---

**Task 2.3: Integrate Scrap Display into ClickerScreen with TDD** [0.5 days]

**TDD Cycle:**

1. **RED - Verify Integration Tests Still Failing**:
   - Integration tests from Phase 1 should still fail (no UI integration yet)
   - If any pass prematurely, revise to ensure proper testing

2. **GREEN - Implement UI Integration**:
   - Import `useScrapGeneration` and `formatNumber` in ClickerScreen
   - Call `useScrapGeneration(count$)` to get `scrap$` observable
   - Add scrap display UI with Memo wrapper:
     ```tsx
     <View style={styles.scrapContainer}>
       <Memo>
         {() => (
           <Text style={styles.scrapText}>
             Scrap: {formatNumber(scrap$.get())}
           </Text>
         )}
       </Memo>
       <Text style={styles.helperText}>
         AI Pets collect scrap automatically (no use yet)
       </Text>
     </View>
     ```
   - Add styles for scrapContainer, scrapText, helperText
   - Position scrap display between counter and button

3. **REFACTOR - Styling & Accessibility**:
   - Ensure consistent styling with existing UI
   - Add accessibility labels for scrap display
   - Verify layout on different screen sizes
   - Confirm no visual regressions

**Files Modified**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx` (verify tests pass)

**Deliverable**: Integrated scrap display with all tests passing (Component integration + Hook unit tests)

---

**Task 2.4: Add Accessibility & Helper Text** [0.25 days]

**TDD Cycle:**

1. **RED - Write Accessibility Tests**:
   ```typescript
   test('scrap display has accessibility label', () => {
     render(<ClickerScreen />);
     const scrapText = screen.getByText(/scrap/i);
     expect(scrapText.props.accessibilityRole).toBe('text');
   });

   test('helper text explains scrap collection', () => {
     render(<ClickerScreen />);
     expect(screen.getByText(/ai pets collect scrap automatically/i)).toBeTruthy();
   });
   ```

2. **GREEN - Add Accessibility Attributes**:
   - Add `accessibilityRole="text"` to scrap display
   - Add `accessibilityLabel` with current scrap value
   - Ensure helper text is readable by screen readers

3. **REFACTOR - UX Polish**:
   - Adjust text sizes for readability
   - Ensure color contrast meets WCAG AA (4.5:1 ratio)
   - Verify helper text doesn't clutter UI

**Deliverable**: Fully accessible scrap display with clear user communication

---

### Phase 3: Hardening & Polish [0.5 days]

**Task 3.1: Performance & Reliability Verification** [0.25 days]

**Testing Focus:**
- Run full test suite (all scrap tests + existing pet counter tests)
- Verify interval accuracy tests pass
- Verify persistence tests pass
- Manual testing on physical device (iOS + Android)

**Performance Validation:**
- Add performance measurement to generation test
- Verify <1ms calculation latency assertion passes
- Verify <50ms UI update latency assertion passes
- Test with large pet counts (100+) and large scrap totals (1,000,000+)

**Reliability Testing:**
- Test mount/unmount cycles (no memory leaks)
- Test rapid pet count changes (no calculation drift)
- Test AsyncStorage failure scenarios (graceful degradation)

**Deliverable**: All tests passing, performance verified, no regressions

---

**Task 3.2: Final Coverage Report & Documentation** [0.25 days]

**Activities:**
- Generate coverage report: `npm test -- --coverage`
- Verify >80% coverage target for scrap module
- Add inline code comments for generation logic
- Update module README if necessary
- Document scrap generation formula in code

**Deliverable**: Coverage report showing >80% for all new files, clear documentation

---

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|-------------|------|--------------|
| M1 | ClickerScreen.test.tsx with failing integration tests | Day 0.5 | Test setup complete |
| M2 | formatNumber utility with tests | Day 0.75 | M1 complete |
| M3 | useScrapGeneration hook with tests | Day 1.25 | M2 complete |
| M4 | Integrated scrap display with all tests passing | Day 1.75 | M3 complete |
| M5 | Performance validated, coverage >80% | Day 2.0 | M4 complete |

---

## 13. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| State Management | useState, Zustand, Legend-State | **Legend-State** | Project standard, fine-grained reactivity, <50ms update guarantee |
| Persistence | AsyncStorage, SQLite, Realm | **AsyncStorage** | Simplest solution for single resource, built into Expo SDK 54, matches existing pattern |
| Hook Naming | `useScrap`, `useResource`, `useScrapGeneration` | **useScrapGeneration** | Behavior-focused naming per architecture guide (describes what it does, not what it is) |
| Component Structure | New ScrapScreen, Extend ClickerScreen | **Extend ClickerScreen** | Single-screen app per PRD, lean principles avoid unnecessary navigation |
| Number Formatting | Custom regex, Intl.NumberFormat, toLocaleString | **toLocaleString or Intl.NumberFormat** | Browser-native formatting, handles edge cases, locale-aware |
| Generation Mechanism | requestAnimationFrame, setTimeout, setInterval | **setInterval** | Appropriate for 1-second ticks, self-correcting, simple to test with Jest fake timers |
| Testing Approach | Snapshot tests, Integration tests, TDD | **TDD (Test-Driven Development)** | PRD requires high reliability, TDD ensures 100% generation accuracy |

### Trade-offs

**Trade-off 1**: Chose **active-only generation** over offline accumulation
- **Benefit**: Simpler implementation, no complex time-delta calculations, no clock manipulation risks
- **Cost**: Players don't benefit from time spent away from app
- **Justification**: PRD explicitly excludes offline progression (FR-1.4), future enhancement possible

**Trade-off 2**: Chose **1-second debounce** for persistence over immediate writes
- **Benefit**: Reduces AsyncStorage writes (1 write per second vs per generation tick)
- **Cost**: Up to 1 second of scrap loss on crash
- **Justification**: Acceptable per PRD (follows existing pet counter pattern), improves performance

**Trade-off 3**: Chose **extend ClickerScreen** over creating new ScrapScreen
- **Benefit**: Simpler architecture, no navigation needed, faster implementation
- **Cost**: ClickerScreen has more responsibilities (scrap display + pet counter)
- **Justification**: Lean principles mandate avoiding over-engineering, single-screen app doesn't need navigation

**Trade-off 4**: Chose **linear scaling** (1 scrap per pet per second) over configurable formulas
- **Benefit**: Simple, predictable, easy to balance
- **Cost**: Less flexibility for game design iterations
- **Justification**: PRD specifies linear scaling (FR-1.2), extensible via SCRAP_PER_PET_PER_SECOND constant

**Trade-off 5**: Chose **module-level singleton observable** over component-level state
- **Benefit**: Matches existing pet counter pattern, shared state across remounts, simpler persistence
- **Cost**: Slightly less conventional React pattern (hooks typically encapsulate state)
- **Justification**: Architecture pattern established by existing usePersistedCounter, proven to work

---

## 14. Open Questions

Technical questions requiring resolution:

- [ ] Should scrap display use scientific notation for extremely large numbers (1e9 vs 1,000,000,000)?
  - **Recommendation**: Not for MVP (toLocaleString handles up to 1 trillion readably)
  - **Decision Needed**: Before Phase 3 if display issues arise

- [ ] Should there be visual feedback (highlight/pulse) when scrap is generated?
  - **Current**: Not in PRD scope (explicitly out of scope: FR-6 visual effects)
  - **Recommendation**: Defer to future enhancement
  - **Decision Needed**: Not required for MVP

- [ ] Should scrap generation pause when app is backgrounded?
  - **Current**: setInterval pauses automatically in most environments
  - **Recommendation**: Test on physical devices to verify behavior
  - **Decision Needed**: Before Phase 3 if background behavior inconsistent

- [ ] Should we show scrap/second rate indicator to players?
  - **Current**: Not in PRD (Open Question #4 in PRD)
  - **Recommendation**: Defer to future enhancement (can add with <1 day effort)
  - **Decision Needed**: Not required for MVP

- [ ] What is the maximum scrap value we need to support?
  - **Current**: JavaScript numbers support up to 2^53-1 (9 quadrillion)
  - **Recommendation**: Add overflow test at 1 trillion to verify display formatting
  - **Decision Needed**: Before Phase 2 Task 2.1 (formatNumber implementation)

---

## 15. Appendices

### A. Technical Glossary

- **Legend-State**: Fine-grained reactive state management library using observables
- **Observable**: Reactive primitive that notifies subscribers of value changes
- **AsyncStorage**: React Native's persistent key-value storage API (iOS Keychain, Android SharedPreferences)
- **Memo Component**: Legend-State wrapper component that re-renders only when observed values change
- **TDD (Test-Driven Development)**: Development methodology where tests are written before implementation
- **setInterval**: JavaScript timer function that repeatedly executes code at specified intervals
- **Atomic Update**: Operation that completes entirely or not at all (prevents race conditions)
- **Debounce**: Delay execution until after a pause in events (reduces write frequency)
- **Active-Only Generation**: Resource accumulation only when app is running (no offline progression)
- **Linear Scaling**: Growth rate proportional to input (1:1 ratio for scrap per pet)

### B. Reference Architecture

**Similar Patterns in Industry:**
- Cookie Clicker (web): Passive resource generation with linear scaling
- Adventure Capitalist (mobile): Idle resource accumulation with display formatting
- Clicker Heroes (mobile/web): Incremental game with automatic progression
- Realm Grinder (web): Multiple resources with interval-based generation

**Legend-State Patterns:**
- Official Todo App Example: https://legendapp.com/open-source/state/examples/todo/
- React Native Integration: https://legendapp.com/open-source/state/react-native/
- Persistence Plugin Documentation: https://legendapp.com/open-source/state/sync/persist-plugins/

### C. Related Documents

- **Product Requirements Document**: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/prd_scrap.md`
- **Feature Request**: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/feature-scrap.md`
- **Core Clicker TDD (Reference)**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/tdd_core_clicker_20251116.md`
- **Lean Task Generation Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/lean-task-generation-guide.md`
- **State Management Hooks Guide**: `/mnt/c/dev/class-one-rapids/docs/architecture/state-management-hooks-guide.md`
- **File Organization Patterns**: `/mnt/c/dev/class-one-rapids/docs/architecture/file-organization-patterns.md`
- **React Native UI Guidelines**: `/mnt/c/dev/class-one-rapids/docs/architecture/react-native-ui-guidelines.md`
- **Legend-State v3 Implementation Guide**: `/mnt/c/dev/class-one-rapids/docs/research/expo_legend_state_v3_guide_20250917_225656.md`
- **React Native Testing Library Guide**: `/mnt/c/dev/class-one-rapids/docs/research/react_native_testing_library_guide_20250918_184418.md`

### D. Code Examples

**formatNumber Utility (Proposed Implementation)**

```typescript
// /mnt/c/dev/class-one-rapids/frontend/modules/scrap/formatNumber.ts

/**
 * Formats a number with thousand separators for display.
 *
 * @param value - The number to format
 * @returns Formatted string with commas (e.g., "1,234,567")
 *
 * @example
 * formatNumber(0) → "0"
 * formatNumber(1000) → "1,000"
 * formatNumber(1234567) → "1,234,567"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
```

**useScrapGeneration Hook (Proposed Implementation)**

```typescript
// /mnt/c/dev/class-one-rapids/frontend/modules/scrap/useScrapGeneration.ts
import { useEffect, useMemo } from 'react';
import { observable, Observable } from '@legendapp/state';
import { configureSynced, synced } from '@legendapp/state/sync';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const SCRAP_PER_PET_PER_SECOND = 1;
const GENERATION_INTERVAL_MS = 1000;

// Configure persistence plugin (shared with usePersistedCounter)
const persistPlugin = new ObservablePersistAsyncStorage({ AsyncStorage });

const persist = configureSynced(synced, {
  persist: {
    plugin: persistPlugin,
    retrySync: true,
  },
});

interface UseScrapGenerationReturn {
  scrap$: Observable<number>;
}

// Create persisted observable at module level (singleton)
const scrap$ = observable(
  persist({
    initial: 0,
    persist: {
      name: 'scrap-total-v1',
      debounceSet: 1000, // 1 second debounce (aligned with generation interval)
    },
  })
);

/**
 * Hook for managing passive scrap generation based on AI Pet count.
 * Generates scrap every 1 second while component is mounted.
 * Scrap total persists to AsyncStorage with 1-second debounce.
 *
 * @param petCount$ - Observable containing current AI Pet count
 * @returns Observable scrap total value
 */
export function useScrapGeneration(
  petCount$: Observable<number>
): UseScrapGenerationReturn {
  useEffect(() => {
    // Start generation interval
    const intervalId = setInterval(() => {
      try {
        const currentPetCount = petCount$.get();
        const scrapToAdd = currentPetCount * SCRAP_PER_PET_PER_SECOND;

        scrap$.set((prev) => prev + scrapToAdd);
      } catch (error) {
        console.error('Scrap generation error:', error);
        // Continue running interval despite error
      }
    }, GENERATION_INTERVAL_MS);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [petCount$]);

  return useMemo(() => ({
    scrap$,
  }), []);
}
```

**Updated ClickerScreen Component (Integration)**

```typescript
// /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Memo } from '@legendapp/state/react';
import { usePersistedCounter } from './usePersistedCounter';
import { useScrapGeneration } from '../scrap/useScrapGeneration';
import { formatNumber } from '../scrap/formatNumber';

/**
 * Main clicker game screen.
 * Displays AI Pet counter, scrap resource total, and feed button.
 * Counter and scrap values persist across app sessions.
 */
export function ClickerScreen() {
  const { count$, actions } = usePersistedCounter();
  const { scrap$ } = useScrapGeneration(count$);

  return (
    <View style={styles.container}>
      {/* AI Pet Counter */}
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

      {/* Scrap Display (NEW) */}
      <View style={styles.scrapContainer}>
        <Memo>
          {() => (
            <Text
              style={styles.scrapText}
              accessibilityRole="text"
              accessibilityLabel={`Scrap collected: ${formatNumber(scrap$.get())}`}
            >
              Scrap: {formatNumber(scrap$.get())}
            </Text>
          )}
        </Memo>
        <Text style={styles.helperText}>
          AI Pets collect scrap automatically (no use yet)
        </Text>
      </View>

      {/* Feed Button */}
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
  scrapContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  scrapText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
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

---

*Generated from PRD: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/prd_scrap.md`*

*Generation Date: 2025-11-16*

*Total Estimated Implementation Time: 2.0 days*
