# Product Requirements Document: Scrap System

**Version:** 1.0
**Date:** 2025-11-17
**Feature:** Scrap Collection System
**Module:** `/frontend/modules/scrap`

---

## 1. Overview

### 1.1 Executive Summary
The Scrap System introduces a passive resource generation mechanic to the Singularity Pet feeding game. This system allows players to accumulate "scrap" resources over time based on the number of AI Pets they have. This creates a foundation for future game economy features while providing players with a sense of progression beyond the core clicking mechanic.

### 1.2 Background
Currently, the game features a single-screen architecture where players can feed their Singularity Pet by pressing a button, incrementing a counter (petCount). The game state is managed through Legend State observables and persists to AsyncStorage. The Scrap System will extend this foundation by introducing a time-based passive income mechanic.

### 1.3 Objectives
- Implement a passive resource generation system that rewards players for their AI Pet count
- Create a foundation for future economy and upgrade systems
- Provide players with continuous progression even when not actively clicking
- Ensure the system integrates seamlessly with existing game architecture and state management

---

## 2. User Stories

### 2.1 Core User Stories

**US-1: Passive Scrap Generation**
As a player, I want to automatically gain scrap over time based on my AI Pet count, so that I feel rewarded for my progress even when not actively playing.

**Acceptance Criteria:**
- Scrap is generated every 1 second
- Scrap generation rate is directly proportional to petCount (1 scrap per pet per second)
- Scrap accumulates in the background while the app is active
- Scrap value is displayed to the player in real-time
- Scrap generation only occurs when the app is in the foreground

**US-2: Scrap Display**
As a player, I want to see how much scrap I have collected, so that I can track my passive resource accumulation.

**Acceptance Criteria:**
- Scrap count is prominently displayed on the main screen
- Scrap value updates in real-time as it accumulates
- Display formatting handles large numbers appropriately
- Scrap value persists across app sessions

**US-3: Scrap Persistence**
As a player, I want my scrap to be saved when I close the app, so that I don't lose my accumulated resources.

**Acceptance Criteria:**
- Scrap value is saved to AsyncStorage through the existing persistence layer
- Scrap value is restored when the app is reopened
- Saving is debounced to avoid excessive storage operations
- State corruption is handled gracefully with validation

---

## 3. Functional Requirements

### 3.1 Scrap Generation Logic

**FR-1: Generation Interval**
- Scrap must be generated every 1 second (1000ms intervals)
- Timer must be managed using React useEffect hooks
- Timer must be cleaned up when component unmounts

**FR-2: Generation Rate Calculation**
- Generation rate formula: `scrapPerSecond = petCount * 1`
- If petCount is 0, no scrap is generated
- Scrap increments are additive (scrap += scrapPerSecond)
- No maximum cap on scrap accumulation

**FR-3: Timer Management**
- Use setInterval for consistent 1-second ticks
- Timer should only run when app is in foreground
- Timer must be cleared on component cleanup to prevent memory leaks
- Timer should start automatically when the screen mounts

### 3.2 State Management

**FR-4: Game State Integration**
- Scrap value must be stored in the existing `gameState$` observable
- Use the existing `scrap` property in the GameState interface
- Scrap updates must trigger state persistence through existing onChange handler
- Scrap must be included in the existing debounced save mechanism (1000ms)

**FR-5: State Updates**
- Scrap updates must use Legend State's reactive update patterns
- Use `gameState$.scrap.set()` for scrap modifications
- Ensure updates are atomic and don't conflict with other state changes
- Follow the existing pattern used for petCount increments

### 3.3 User Interface

**FR-6: Scrap Display Component**
- Display current scrap value as "Scrap: {value}"
- Use consistent styling with existing counter display
- Position scrap counter prominently but secondary to pet count
- Ensure accessibility with proper role and label attributes

**FR-7: Visual Feedback**
- No special animations required for this initial implementation
- Text should update smoothly with React's re-rendering
- Use observer pattern to ensure reactive updates

### 3.4 Persistence

**FR-8: Storage Integration**
- Leverage existing persistence.ts save/load functionality
- No new storage keys required (use existing GAME_STATE key)
- Scrap must be included in sanitizeGameState validation
- Scrap must be validated as a non-negative number
- Default scrap value should be 0 for new players

---

## 4. Technical Requirements

### 4.1 Architecture

**TR-1: Component Structure**
- Implement scrap generation logic within AttackButtonScreen component
- Use React hooks (useEffect) for timer management
- Use Legend State's observer pattern for reactive UI updates
- Follow existing component patterns established in the codebase

**TR-2: State Management**
- Use existing `gameState$` observable from `@legendapp/state`
- Access scrap through `gameState$.scrap`
- Maintain read/write separation: read with `.get()`, update with `.set()`
- Ensure compatibility with existing onChange auto-persistence

**TR-3: Timer Implementation**
```typescript
// Pseudo-code pattern
useEffect(() => {
  const interval = setInterval(() => {
    const petCount = gameState$.petCount.get();
    const scrapGenerated = petCount * 1; // 1 scrap per pet per second
    gameState$.scrap.set((prev) => prev + scrapGenerated);
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

### 4.2 Performance Considerations

**TR-4: Efficiency**
- Timer updates should be lightweight (simple arithmetic operations)
- Leverage existing debounced persistence (no additional save overhead)
- Use Legend State's optimized reactivity to minimize re-renders
- Avoid creating new objects or arrays in the update loop

**TR-5: Memory Management**
- Ensure interval is cleared on component unmount
- No memory leaks from uncleaned timers
- Scrap values must stay within JavaScript's safe integer range (Number.MAX_SAFE_INTEGER)

### 4.3 Data Validation

**TR-6: Input Validation**
- Scrap must be validated as a number when loading from storage
- Use existing `isValidGameState` type guard
- Sanitize scrap values to prevent negative numbers
- Clamp scrap to MAX_SAFE_INTEGER in sanitizeGameState function

**TR-7: Error Handling**
- Gracefully handle storage load failures (already implemented)
- Default to 0 scrap if validation fails
- Log errors without breaking game functionality
- No user-facing error messages for backend failures

### 4.4 Testing Requirements

**TR-8: Component Testing**
- Test that scrap increments correctly based on petCount
- Test that timer is cleaned up on unmount
- Test initial scrap value is 0 for new players
- Test scrap display updates reactively
- Mock timers using Jest's fake timers for predictable testing

**TR-9: Integration Testing**
- Test scrap persists across app restarts
- Test scrap generation with various petCount values (0, 1, 100, max)
- Test concurrent updates (clicking + scrap generation)
- Test state validation with corrupted scrap values

---

## 5. Design Specifications

### 5.1 UI Layout

**DS-1: Screen Layout**
```
┌─────────────────────────────────┐
│                                 │
│   Singularity Pet Count: XXX    │
│                                 │
│   Scrap: XXX                    │
│                                 │
│   ┌─────────┐                  │
│   │  feed   │                  │
│   └─────────┘                  │
│                                 │
└─────────────────────────────────┘
```

**DS-2: Typography**
- Scrap display font size: 16px (slightly smaller than pet count's 18px)
- Font weight: Regular (400)
- Color: #000000 (matching existing text)
- Margin bottom: 20px (spacing from button)

**DS-3: Accessibility**
- Scrap text should have `accessibilityRole="text"`
- Scrap text should have `accessibilityLabel="Scrap: {value}"`
- Ensure 44x44 minimum touch target sizes (not applicable for static text)

---

## 6. Success Metrics

### 6.1 Technical Metrics

**SM-1: Performance**
- Timer precision: within 50ms variance of 1-second intervals
- State update latency: < 16ms (60fps threshold)
- No memory leaks over 1-hour session
- Storage operations remain debounced (max 1 save per second)

**SM-2: Reliability**
- 100% test coverage for scrap generation logic
- 0 crashes related to scrap system
- 100% data persistence success rate
- Graceful handling of edge cases (max values, zero values)

### 6.3 User Experience Metrics

**SM-3: Visual Feedback**
- Scrap counter updates visibly every 1 second (when petCount > 0)
- No UI jank or frame drops during scrap updates
- Scrap value persists correctly across 100% of app sessions

---

## 7. Dependencies and Assumptions

### 7.1 Dependencies

**DP-1: Existing Systems**
- Legend State (`@legendapp/state`) for reactive state management
- Existing gameStore.ts and persistence.ts modules
- GameState interface with scrap property already defined
- AsyncStorage for persistence
- React Native core libraries

**DP-2: Technical Dependencies**
- TypeScript for type safety
- Jest for testing
- React 18+ hooks (useEffect)
- No external libraries needed for timer functionality

### 7.2 Assumptions

**AS-1: User Behavior**
- Players will have the app in foreground during scrap generation
- No background processing is required (out of scope)
- Players understand passive income mechanics from similar games

**AS-2: Technical Assumptions**
- Device clocks are reliable for 1-second intervals
- JavaScript setTimeout/setInterval are sufficiently accurate
- Scrap values will not exceed Number.MAX_SAFE_INTEGER in realistic gameplay
- No network connectivity required for scrap generation

**AS-3: Future Scope**
- Scrap will be used for upgrades/purchases in future releases
- Current implementation is placeholder for future economy
- Players will be notified of scrap utility in future updates
- Scrap generation rate may be modified by future upgrade system

### 7.3 Constraints

**CS-1: Scope Limitations**
- No offline scrap generation (app must be active)
- No background processing or notifications
- No scrap spending functionality (reserved for future)
- No scrap generation rate modifiers (base 1:1 ratio only)

**CS-2: Technical Constraints**
- Must use existing state management patterns
- Must not create new persistence mechanisms
- Must not add new dependencies
- Must maintain backward compatibility with existing save data

---

## 8. Open Questions

**Q-1:** Should scrap generation continue when the app is backgrounded but not terminated?
**Decision:** No, scrap generation only occurs when app is in foreground (assumption AS-1).

**Q-2:** Should there be a visual indication when scrap is generated (animation, particle effects)?
**Decision:** No animations in initial implementation. Simple text update is sufficient.

**Q-3:** What happens if petCount reaches maximum value (Number.MAX_SAFE_INTEGER)?
**Decision:** Scrap will continue to generate at maximum rate. Both values are clamped independently.

**Q-4:** Should scrap generation rate be configurable or data-driven?
**Decision:** Hardcoded 1:1 ratio for MVP. Future upgrade system may modify this.

---

## 9. Out of Scope

The following items are explicitly excluded from this implementation:

1. **Scrap Spending:** No shop, upgrades, or consumption mechanics
2. **Offline Generation:** No background processing or "catch-up" mechanics
3. **Rate Modifications:** No multipliers, bonuses, or variable rates
4. **Notifications:** No alerts when scrap is generated
5. **Analytics:** No tracking of scrap generation rates or patterns
6. **Animations:** No visual effects for scrap accumulation
7. **Sound Effects:** No audio feedback
8. **Tutorials:** No onboarding or explanation of scrap system

---

## 10. Implementation Notes

### 10.1 Development Approach

1. **Phase 1:** Add scrap display to AttackButtonScreen UI
2. **Phase 2:** Implement timer logic with setInterval
3. **Phase 3:** Wire up scrap updates to gameState$
4. **Phase 4:** Write comprehensive tests for timer and persistence
5. **Phase 5:** Manual testing across various petCount values

### 10.2 Testing Strategy

- Use Jest's `jest.useFakeTimers()` for deterministic timer testing
- Test scrap generation with `jest.advanceTimersByTime()`
- Mock AsyncStorage for persistence tests
- Use `@testing-library/react-native` for component testing
- Follow existing test patterns from gameStore.test.ts

### 10.3 Rollout Plan

- Feature can be released immediately (no external dependencies)
- No feature flags required
- No migration needed (scrap defaults to 0)
- No user communication required (feature is self-explanatory)

---

## 11. Revision History

| Version | Date       | Author  | Changes                    |
|---------|------------|---------|----------------------------|
| 1.0     | 2025-11-17 | Claude  | Initial PRD creation       |

---

## Appendix A: Related Documents

- Feature Description: `/frontend/modules/scrap/specs/feature-scrap.md`
- Game State Types: `/frontend/shared/types/game.ts`
- Game Store Implementation: `/frontend/shared/store/gameStore.ts`
- Persistence Layer: `/frontend/shared/store/persistence.ts`
- Main App Component: `/frontend/App.tsx`
- Attack Button Screen: `/frontend/modules/attack-button/AttackButtonScreen.tsx`

---

## Appendix B: Code References

### Relevant Type Definitions
```typescript
// From game.ts
export interface GameState {
  petCount: number;
  scrap: number;  // ← Used by this feature
  upgrades: Upgrade[];
  purchasedUpgrades: string[];
}
```

### State Access Pattern
```typescript
// Reading scrap
const currentScrap = gameState$.scrap.get();

// Updating scrap
gameState$.scrap.set((prev) => prev + amount);
```

### Existing Persistence Behavior
- Auto-save triggers on any gameState$ change
- Debounced to 1000ms (same as scrap generation interval)
- Handled by onChange listener in gameStore.ts
- No additional save logic needed
