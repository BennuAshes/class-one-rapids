# Core Clicker Flow - Technical Design Document

## Document Control

| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | AI Assistant | 2025-11-11 | Draft | Initial TDD from PRD |

## Executive Summary

This document defines the technical architecture for implementing a minimal viable clicker game feature in React Native with Expo. The system uses component-local state management (useState) for MVP simplicity, AsyncStorage for persistence, and follows Test-Driven Development (TDD) methodology. The architecture prioritizes responsiveness (<50ms tap response), maintainability (hook-based patterns), and extensibility (foundation for future features).

---

## 1. Overview & Context

### Problem Statement

Implement a high-performance, cross-platform clicker interface that provides sub-50ms tap response times, reliable state persistence, and immediate visual feedback while maintaining 60fps rendering performance.

### Solution Approach

Single-component React Native application with:
- **Component-local state** using useState (appropriate for single-feature scope per architecture guide)
- **AsyncStorage persistence** with debounced saves (1-second debounce)
- **TDD-first development** using React Native Testing Library
- **Co-located tests** following project file organization standards

### Success Criteria

| Technical Metric | Target | Measurement Method |
|-----------------|--------|-------------------|
| Tap Response Time | <50ms (95th percentile) | Performance.now() timestamps |
| Render Performance | <16ms per update | React DevTools Profiler |
| Storage Save Latency | <500ms | AsyncStorage timing logs |
| Test Coverage | >80% | Jest coverage report |
| Zero Dropped Taps | 100% accuracy | Automated tap testing |

---

## 2. Requirements Analysis

### Functional Requirements Mapping

| PRD Requirement | Technical Implementation |
|-----------------|-------------------------|
| FR1.1: "Feed" button display | TouchableOpacity with Text child, 18sp font |
| FR1.2: 44x44pt touch target | minWidth/minHeight StyleSheet properties |
| FR1.3: "Singularity Pet Count: [n]" | Text component with template string interpolation |
| FR1.4: Increment by 1 per tap | useState setter: `setCount(prev => prev + 1)` |
| FR1.5: Support 0-999,999,999 | TypeScript number type validation |
| FR2.1: AsyncStorage persistence | `@react-native-async-storage/async-storage` v1.23+ |
| FR2.2: Hook-based state | useState hook (appropriate for single-component scope) |
| FR2.3: Load within 2s | useEffect with AsyncStorage.getItem on mount |
| FR2.4: Debounced save (1s) | useEffect with debounce, cleanup on unmount |
| FR3.1: Platform-native styling | Platform.OS conditional styling |
| FR3.2: 16sp min text size | fontSize: 16 in StyleSheet |
| FR3.3: Vertical centering | flex: 1, justifyContent: 'center', alignItems: 'center' |
| FR3.4: Visual + haptic feedback | TouchableOpacity activeOpacity + Haptics.impactAsync (P1) |

### Non-Functional Requirements

- **Performance NFR1-4**: Optimized render cycle, no unnecessary re-renders
- **Security NFR5-6**: Input validation, AsyncStorage data integrity checks
- **Accessibility NFR7-10**: accessibilityLabel, accessibilityRole, contrast ratios
- **Scalability NFR11-12**: Hook pattern easily extensible to custom hooks/Legend-State
- **Device Support NFR13-15**: Responsive layout, tested on iOS 13+/Android 8.0+

---

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│         Clicker Screen Component         │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  useState (count: number)           │ │
│  │  - Current counter value            │ │
│  │  - Default: 0                       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  useEffect (Load from storage)      │ │
│  │  - Runs once on mount               │ │
│  │  - AsyncStorage.getItem('petCount') │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  useEffect (Save to storage)        │ │
│  │  - Debounced (1s)                   │ │
│  │  - AsyncStorage.setItem('petCount') │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  handleFeed: () => void             │ │
│  │  - setCount(prev => prev + 1)       │ │
│  │  - Optional: Haptics.impactAsync()  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  UI Render                          │ │
│  │  - Counter Text                     │ │
│  │  - Feed TouchableOpacity             │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
           ↓                    ↑
           ↓                    ↑
    AsyncStorage API     User Tap Events
```

### Component Design

#### ClickerScreen Component

**Purpose**: Main screen displaying counter and feed button

**Responsibilities**:
- Manage counter state locally (useState)
- Load initial count from AsyncStorage on mount
- Save count to AsyncStorage with debouncing
- Handle tap events and increment counter
- Render UI with accessibility support

**Interfaces**:
- **Props**: None (self-contained screen component)
- **State**: `count: number` (0 to 999,999,999)
- **Storage Key**: `'singularity_pet_count'` (AsyncStorage)

**Dependencies**:
- `react` (useState, useEffect, useRef)
- `react-native` (View, Text, TouchableOpacity, StyleSheet, Platform)
- `@react-native-async-storage/async-storage`
- `expo-haptics` (P1 - optional)

### Data Flow

```
1. App Launch
   ↓
2. ClickerScreen mounts
   ↓
3. useEffect (load) → AsyncStorage.getItem('singularity_pet_count')
   ↓
4. If value exists → setCount(parsedValue)
   ↓
5. Component renders with loaded/default count
   ↓
6. User taps "Feed" button
   ↓
7. handleFeed() → setCount(prev => prev + 1)
   ↓
8. Component re-renders with new count (< 16ms)
   ↓
9. useEffect (save) → Debounce timer starts/resets
   ↓
10. After 1s of no taps → AsyncStorage.setItem('singularity_pet_count', count)
    ↓
11. Loop back to step 6 (or app close persists data)
```

---

## 4. API Design

### Internal APIs

No external API calls in MVP. All operations are local.

**AsyncStorage Interface:**

| Operation | Method | Purpose | Key | Value Type |
|-----------|--------|---------|-----|------------|
| Load Count | `getItem` | Retrieve persisted count on app start | `'singularity_pet_count'` | `string` (JSON number) |
| Save Count | `setItem` | Persist count after debounce period | `'singularity_pet_count'` | `string` (JSON number) |

**Error Handling:**
- Load failure → Default to count = 0, log error
- Save failure → Retry once, log error if persists
- Parse error → Reset to 0, log corruption event

---

## 5. Data Model

### Entity Design

```typescript
// types.ts
export interface ClickerState {
  count: number  // Range: 0 to 999,999,999
}

// Storage schema
type StoredCount = string  // JSON stringified number
```

### Storage Schema

**AsyncStorage Key-Value Pair:**
```typescript
{
  key: 'singularity_pet_count',
  value: '42'  // String representation of number
}
```

**Validation Rules:**
- Value must be parseable as number
- Value must be >= 0
- Value must be <= 999,999,999
- Invalid values reset to 0

### Data Access Patterns

```typescript
// Load pattern (on mount)
const loadCount = async (): Promise<number> => {
  try {
    const stored = await AsyncStorage.getItem('singularity_pet_count')
    if (stored === null) return 0
    const parsed = parseInt(stored, 10)
    if (isNaN(parsed) || parsed < 0 || parsed > 999999999) {
      return 0
    }
    return parsed
  } catch (error) {
    console.error('Failed to load count:', error)
    return 0
  }
}

// Save pattern (debounced)
const saveCount = async (count: number): Promise<void> => {
  try {
    await AsyncStorage.setItem('singularity_pet_count', count.toString())
  } catch (error) {
    console.error('Failed to save count:', error)
    // Retry logic could be added here
  }
}
```

---

## 6. Security Design

### Data Security

- **Encryption at Rest**: AsyncStorage data is automatically encrypted on iOS (Keychain) and Android (EncryptedSharedPreferences) when using secure storage options
- **Input Validation**: Counter value validated on load (0-999,999,999 range)
- **Tampering Detection**: Basic - invalid values reset to 0 (advanced anti-cheat out of scope for MVP)

### Security Controls

```typescript
// Validate loaded counter value
const validateCount = (value: any): number => {
  const num = typeof value === 'string' ? parseInt(value, 10) : value
  if (typeof num !== 'number' || isNaN(num)) return 0
  if (num < 0) return 0
  if (num > 999999999) return 999999999 // Cap at max
  return num
}
```

---

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

**All implementation follows Red-Green-Refactor cycle**

#### Testing Framework & Tools

- **Framework**: React Native Testing Library v12+
- **Reference**: @docs/research/react_native_testing_library_guide_20250918_184418.md
- **Test Runner**: Jest 29+ with react-native preset
- **Mocking**: Jest mocks for AsyncStorage
- **User Events**: @testing-library/user-event for realistic interactions

#### TDD Implementation Process

### Phase 1: RED - Write Failing Test First

**Test 1: Component Renders**
```typescript
// ClickerScreen.test.tsx
test('should render counter with initial value of 0', () => {
  render(<ClickerScreen />);
  expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
});
// FAILS - Component doesn't exist yet
```

**Test 2: Button Renders**
```typescript
test('should render Feed button', () => {
  render(<ClickerScreen />);
  expect(screen.getByText('Feed')).toBeTruthy();
});
// FAILS - Button not implemented
```

**Test 3: Button Increments Counter**
```typescript
test('should increment counter when Feed button is pressed', async () => {
  const user = userEvent.setup();
  render(<ClickerScreen />);

  const button = screen.getByText('Feed');
  await user.press(button);

  expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
});
// FAILS - No increment logic
```

### Phase 2: GREEN - Minimal Implementation

```typescript
// ClickerScreen.tsx (minimal implementation)
export const ClickerScreen = () => {
  const [count, setCount] = useState(0);

  const handleFeed = () => {
    setCount(prev => prev + 1);
  };

  return (
    <View>
      <Text>Singularity Pet Count: {count}</Text>
      <TouchableOpacity onPress={handleFeed}>
        <Text>Feed</Text>
      </TouchableOpacity>
    </View>
  );
};
// Tests 1-3 now PASS
```

### Phase 3: REFACTOR - Improve Code Quality

- Extract styles to StyleSheet
- Add accessibility labels
- Improve component structure
- All tests remain green

### Test Categories (Implementation Order)

#### Unit Testing (TDD First Layer)

**Test Suite 1: Render Tests**
- [ ] Component renders without crashing
- [ ] Counter displays with initial value 0
- [ ] Feed button is present and accessible
- [ ] Counter label format matches "Singularity Pet Count: [number]"

**Test Suite 2: Interaction Tests**
- [ ] Button press increments counter by 1
- [ ] Multiple rapid presses increment correctly (no dropped taps)
- [ ] Counter updates immediately (<16ms verified in test)
- [ ] Button has proper accessibility labels

**Test Suite 3: State Management Tests**
- [ ] useState initializes to 0
- [ ] Counter state updates trigger re-render
- [ ] State updates are batched correctly (no unnecessary renders)

#### Integration Testing (TDD Second Layer)

**Test Suite 4: Persistence Tests**
- [ ] Counter loads from AsyncStorage on mount
- [ ] Counter saves to AsyncStorage after debounce period
- [ ] Save is debounced (1 second delay)
- [ ] Multiple taps don't trigger multiple saves
- [ ] Invalid stored values default to 0
- [ ] Storage errors don't crash app

**Test Suite 5: Edge Case Tests**
- [ ] Counter handles maximum value (999,999,999)
- [ ] Counter doesn't accept negative values
- [ ] Rapid tapping (100+ taps/second) works correctly
- [ ] App recovery after storage corruption

#### Performance Testing (TDD Third Layer)

**Test Suite 6: Performance Tests**
- [ ] Tap response time <50ms (measured)
- [ ] Render time <16ms per update
- [ ] No memory leaks after 1000 taps
- [ ] Smooth scrolling/interaction during rapid tapping

### TDD Checklist for Each Component

- [ ] First test written before any implementation code
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns
- [ ] Tests query by user-visible content (not testIds)
- [ ] Async operations use waitFor/findBy
- [ ] All tests pass before moving to next feature
- [ ] Test coverage >80% verified

---

## 8. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|--------------|---------------|
| Runtime | React Native 0.72+ with Expo SDK 50+ | Cross-platform support |
| Storage | AsyncStorage (max 6MB per app) | Counter value ~20 bytes, plenty of headroom |
| Device CPU | ARM64 or equivalent | Standard mobile processors |
| Device RAM | 2GB+ | Standard for modern devices |

### Deployment Architecture

- **Development**: Local Expo Go app for rapid iteration
- **Testing**: Expo EAS Build for internal testing (TestFlight/Google Play Internal)
- **Production**: Expo EAS Update for OTA updates, full builds for app stores

### Monitoring & Observability

#### Metrics (P1 - Post-MVP)

- Tap frequency histogram (taps per second distribution)
- Average session duration
- Counter value distribution across users
- Storage save success rate

#### Logging

```typescript
// Error logging only for MVP
console.error('[Clicker] Failed to load count:', error)
console.error('[Clicker] Failed to save count:', error)
```

---

## 9. Scalability & Performance

### Performance Requirements

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| Tap Response | <50ms (95th percentile) | Direct state update, no async in handler |
| Render Time | <16ms (60fps) | Single Text component update, no heavy computation |
| Storage Save | <500ms | AsyncStorage native module (optimized) |
| Memory Usage | <5MB for component | No large state objects, simple primitives |

### Performance Optimization

1. **Prevent Unnecessary Renders**
   - Use functional setState: `setCount(prev => prev + 1)`
   - No object/array recreation in render

2. **Debounce Storage Saves**
   - Save after 1s of inactivity, not on every tap
   - Cleanup debounce timer on unmount

3. **Optimize StyleSheet**
   - Create styles once outside component
   - Use StyleSheet.create for native optimization

4. **Avoid Inline Functions**
   ```typescript
   // Good
   const handleFeed = useCallback(() => {
     setCount(prev => prev + 1)
   }, [])

   // Bad (creates new function on every render)
   onPress={() => setCount(count + 1)}
   ```

### Scalability Strategy

**Future State Management Migration Path:**

1. **MVP (Current)**: useState in component
   - Appropriate for single-component feature
   - Per @docs/architecture/state-management-hooks-guide.md: "Component State for state local to a single component"

2. **Phase 2 (Multiple counters)**: Custom Hook
   - Extract to `useClicker.ts` when logic becomes complex
   - Reusable across multiple components

3. **Phase 3 (Global state)**: Legend-State Store
   - When state needs cross-feature sharing
   - Create `clicker.store.ts` with hook interface

---

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| High-frequency tapping causes performance degradation | High | Medium | Debounce saves, optimize render cycle, performance testing | Dev |
| AsyncStorage corruption loses user progress | High | Low | Validate on load, consider backup mechanism | Dev |
| Platform-specific touch handling differences | Medium | Medium | Test on both iOS/Android, use React Native Testing Library | QA |
| Rapid tap events get dropped | Medium | Low | Use functional setState, test with automated rapid tapping | Dev |
| Storage quota exceeded (unlikely) | Low | Very Low | Monitor storage usage, counter only ~20 bytes | Dev |

### Dependencies

| Dependency | Version | Risk Level | Alternative |
|-----------|---------|------------|-------------|
| @react-native-async-storage/async-storage | 1.23+ | Low | Well-maintained, widely used |
| expo-haptics (P1) | Latest | Low | Optional feature, graceful degradation |
| React Native | 0.72+ | Low | Stable platform |

---

## 11. Implementation Plan (TDD-Driven)

### Development Phases

Following @docs/guides/lean-task-generation-guide.md principles - prioritize user-visible functionality.

#### Phase 1: Test Setup & Basic Rendering [Day 1 - 4 hours]

**Morning (2 hours):**
1. Set up test file structure (co-located)
2. Configure Jest with AsyncStorage mocks
3. Write first failing test (component renders)
4. Implement minimal component (makes test pass)

**Afternoon (2 hours):**
5. Write tests for counter display
6. Write tests for button presence
7. Implement counter and button UI
8. Add basic styling
9. All tests green

**Deliverables:**
- `ClickerScreen.tsx` (basic structure)
- `ClickerScreen.test.tsx` (render tests)
- Coverage: ~40%

#### Phase 2: Interaction & State [Day 2 - 4 hours]

**Morning (2 hours):**
1. Write failing test: button increments counter
2. Implement handleFeed function with useState
3. Write test: multiple taps work correctly
4. Write test: rapid tapping accuracy

**Afternoon (2 hours):**
5. Refactor state management
6. Add accessibility labels
7. Write accessibility tests
8. All tests green

**Deliverables:**
- Functional increment logic
- Accessibility support
- Coverage: ~60%

#### Phase 3: Persistence [Day 3 - 5 hours]

**Morning (2.5 hours):**
1. Write failing test: load from storage on mount
2. Implement useEffect with AsyncStorage.getItem
3. Write test: save to storage after debounce
4. Implement useEffect with debounced save

**Afternoon (2.5 hours):**
5. Write edge case tests (corruption, invalid values)
6. Implement validation and error handling
7. Write performance tests
8. All tests green

**Deliverables:**
- Full persistence implementation
- Error handling
- Coverage: >80%

#### Phase 4: Polish & Testing [Day 4 - 3 hours]

**Morning (1.5 hours):**
1. Manual testing on iOS simulator
2. Manual testing on Android emulator
3. Fix any platform-specific issues

**Afternoon (1.5 hours):**
4. Add haptic feedback (P1)
5. Performance profiling
6. Documentation

**Deliverables:**
- Production-ready component
- Performance verification
- Coverage: >85%

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|------------|------|--------------|
| M1: Basic Rendering | Component displays counter and button | Day 1 | None |
| M2: Interaction Working | Taps increment counter correctly | Day 2 | M1 |
| M3: Persistence Complete | Counter saves/loads from storage | Day 3 | M2 |
| M4: MVP Ready | All tests pass, performance validated | Day 4 | M3 |

---

## 12. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| State Management | useState vs custom hook vs Legend-State | useState | Per architecture guide: "Component State for state local to single component". Simple MVP scope doesn't justify overhead of Legend-State. |
| Storage | AsyncStorage vs MMKV vs Legend-State persist | AsyncStorage | Expo SDK 54 recommended, MMKV has Android compatibility issues. Simple key-value sufficient for MVP. |
| Testing Framework | Jest + RNTL vs Detox E2E | Jest + RNTL | TDD-focused, faster feedback loop. E2E unnecessary for single-component feature. |
| File Organization | Flat structure | Flat | Per architecture guide: "<10 items = flat structure". Feature has 2 files (component + test). |
| Debounce Strategy | Throttle vs Debounce vs Batch | Debounce (1s) | Reduces storage writes while ensuring all data saved. Debounce waits for typing to stop. |

### Trade-offs

- **Trade-off 1**: Chose useState over Legend-State for MVP
  - **Pro**: Simpler, faster development, appropriate for scope
  - **Con**: Migration needed if global state required later
  - **Decision**: Acceptable - clear migration path defined

- **Trade-off 2**: Debounce save at 1 second vs immediate save
  - **Pro**: Reduces storage writes by ~90%, better performance
  - **Con**: Data loss risk if app crashes within 1s of last tap
  - **Decision**: Acceptable - risk low, performance gain significant

- **Trade-off 3**: No server synchronization in MVP
  - **Pro**: Faster development, no backend dependencies
  - **Con**: Data not backed up, no cross-device sync
  - **Decision**: Acceptable - explicitly out of scope for MVP

---

## 13. Open Questions

Technical questions requiring resolution:

- [ ] Should we add error boundary for graceful crash handling?
- [ ] What analytics events should fire (if any) for tap tracking?
- [ ] Should counter display include comma formatting (e.g., "1,234" vs "1234")?
- [ ] Haptic feedback intensity level preference?
- [ ] Should we implement optimistic UI for storage saves?
- [ ] What happens at counter max value (999,999,999) - disable button or wrap?

---

## 14. Appendices

### A. Technical Glossary

- **Debouncing**: Delaying function execution until after a specified time period of inactivity
- **Functional setState**: `setCount(prev => prev + 1)` - ensures correct value even with rapid calls
- **TDD Red-Green-Refactor**: Write failing test (RED) → make it pass (GREEN) → improve code (REFACTOR)
- **Co-located tests**: Test files placed next to implementation files, not in separate `__tests__` folders
- **AsyncStorage**: React Native's asynchronous, unencrypted, persistent key-value storage
- **useState**: React Hook for managing local component state

### B. Reference Architecture

- React Native Counter Pattern: Standard increment/decrement pattern
- Expo AsyncStorage Best Practices: Official documentation patterns
- React Native Testing Library Examples: From testing guide

### C. File Structure

Per @docs/architecture/file-organization-patterns.md (flat structure for <10 items):

```
frontend/modules/clicker/
├── ClickerScreen.tsx           # Main component
├── ClickerScreen.test.tsx      # Co-located tests
└── types.ts                    # TypeScript interfaces (if needed)
```

### D. Related Documents

- **Product Requirements Document**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/prd_core_clicker_20251111.md`
- **Architecture Guides**:
  - File Organization: `@docs/architecture/file-organization-patterns.md`
  - State Management: `@docs/architecture/state-management-hooks-guide.md`
  - Working Directory: `@docs/architecture/working-directory-context.md`
- **Research Documents**:
  - Legend-State v3 Guide: `@docs/research/expo_legend_state_v3_guide_20250917_225656.md`
  - React Native Testing Library Guide: `@docs/research/react_native_testing_library_guide_20250918_184418.md`

---

*Generated from PRD: prd_core_clicker_20251111.md*
*Generation Date: 2025-11-11*
*Framework: React Native + Expo SDK 50+*
*State Management: useState (Component-local)*
*Testing: React Native Testing Library + Jest*
