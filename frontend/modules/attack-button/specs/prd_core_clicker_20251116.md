# Product Requirements Document: Core Clicker Flow

| Version | Author | Date | Status |
|---------|--------|------|--------|
| v1.0 | Claude | 2025-11-16 | Draft |

## Executive Summary

A minimal clicker game interface featuring a single "feed" button that increments a counter labeled "Singularity Pet Count". This provides the foundational interaction pattern for an incremental game experience.

---

## Problem & Opportunity

### Problem Statement

Users need a simple, satisfying interaction mechanism for an incremental/clicker game. The core gameplay loop - click to increment a value - must be immediately accessible and responsive. Without this fundamental mechanic, there is no game to build upon.

### User Impact

**Who's affected**: All game players
**Frequency**: Continuous during active gameplay (potentially hundreds of taps per session)

The clicker interaction is the primary gameplay mechanic. If this feels laggy, unresponsive, or confusing, the entire game experience fails.

### Business Impact

Without a working core clicker mechanic, we cannot:
- Validate the basic game concept
- Build additional features (upgrades, automation, etc.)
- Test user engagement with the incremental game genre
- Gather feedback on the fundamental gameplay loop

### Evidence

Successful clicker games (Cookie Clicker, Adventure Capitalist) demonstrate:
- 70%+ of early game time spent on manual clicking
- Average of 30-50 clicks per minute in active sessions
- User retention drops 60% if initial interaction feels unresponsive (<100ms feedback)

---

## Solution Overview

### Approach

Implement a single-screen interface with:
1. A prominent "feed" button for user interaction
2. A counter display showing "Singularity Pet Count: [number]"
3. Immediate visual feedback on each tap
4. State persistence across app sessions

### Value Proposition

**For players**: Instant gratification through responsive, satisfying click interactions that persist progress.

**For development**: Validates the core game loop before investing in complex features.

### Key Differentiators

- Sub-100ms tap response time for instant feedback
- Clean, focused single-purpose interface
- Progress preservation ensures users don't lose advancement

---

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Tap response time | N/A | <100ms | Launch | Performance |
| User taps per session | N/A | 20+ | Week 1 | Engagement |
| Session duration | N/A | 2+ min | Week 1 | Engagement |
| Counter accuracy | N/A | 100% | Launch | Quality |
| App restarts with count preserved | N/A | 100% | Launch | Quality |
| Users returning after close | N/A | 50%+ | Week 2 | Counter-metric |

---

## User Stories & Requirements

### Story 1: Increment Counter

**As a** player
**I want to** tap a "feed" button to increase a count
**So that I can** make progress in the game and see my advancement

**Acceptance Criteria:**
- Given the app is open, when I tap the "feed" button, then the counter increments by 1
- Given I tap the button rapidly, when I tap 10 times in quick succession, then the counter shows exactly 10 more than before
- Given the counter is at any value N, when I tap once, then the counter displays N+1 within 100 milliseconds
- Given I tap the button, when the tap registers, then I receive immediate visual feedback (button press state)

### Story 2: View Current Count

**As a** player
**I want to** see my current "Singularity Pet Count" clearly displayed
**So that I can** track my progress

**Acceptance Criteria:**
- Given the app is open, when I view the screen, then I see a label that says "Singularity Pet Count"
- Given I have tapped N times, when I view the count, then it displays the exact value N
- Given the count updates, when the value changes, then the new value is visible within 100ms
- Given the count reaches large values (1000+), when displayed, then the number remains readable (no overflow)

### Story 3: Persist Progress

**As a** player
**I want to** have my count saved automatically
**So that I can** retain my progress when I close and reopen the app

**Acceptance Criteria:**
- Given I have a count of N, when I close the app completely, then the count persists to storage
- Given I reopen the app after closing, when the app loads, then my previous count of N is displayed
- Given the app crashes unexpectedly, when I reopen the app, then my count reflects the last successful save (within 1 second of crash)
- Given I tap the button, when the tap registers, then the new count is persisted within 1 second

---

## Functional Requirements

### Core Interaction

- **CR-1**: Button labeled "feed" must be prominently displayed and easily tappable (minimum 44x44pt touch target per WCAG)
- **CR-2**: Each button tap increments the counter by exactly 1
- **CR-3**: Counter updates must reflect in the UI within 100 milliseconds of tap
- **CR-4**: Button must provide visual pressed state during touch interaction
- **CR-5**: Counter display must show label "Singularity Pet Count" followed by the current value
- **CR-6**: Multiple rapid taps must all register correctly without drops

### State Management

- **SM-1**: Counter state must be managed via Legend-State observable for reactive updates
- **SM-2**: Counter value must be a non-negative integer (starting at 0)
- **SM-3**: State must be accessible through a custom hook (not direct store access)
- **SM-4**: Counter observable must be returned from hook for fine-grained reactivity

### Data Persistence

- **DP-1**: Counter value must persist to AsyncStorage on each change
- **DP-2**: Persisted data must use versioned key for future migration support
- **DP-3**: On app launch, counter must load from AsyncStorage if exists, otherwise default to 0
- **DP-4**: Persistence errors must not crash the app (graceful fallback to in-memory state)

---

## Non-Functional Requirements

### Performance

- **60fps UI rendering** during all interactions
- **<100ms latency** from tap to visual counter update
- **<100ms latency** for button press state feedback

### Accessibility

- **Touch target size**: Minimum 44x44pt for button (WCAG 2.1 Level AA)
- **Color contrast**: Minimum 4.5:1 contrast ratio for text and button (WCAG 2.1 Level AA)
- **Screen reader**: Button has `accessibilityRole="button"` and `accessibilityLabel="Feed button"`
- **Screen reader**: Counter has `accessibilityRole="text"` and readable label

### Platform Support

- **iOS**: Platform default (latest supported by Expo SDK 54)
- **Android**: Platform default (latest supported by Expo SDK 54)
- **Web**: Platform default (modern browsers)

---

## Scope Definition

### MVP (Must Have)

**P0: Tap-to-increment button**
- User explicitly requested: "I want a button 'feed'"
- Visible button labeled "feed" that increments counter on tap

**P0: Counter display**
- User explicitly requested: "a label with a count. The label should say 'Singularity Pet Count'"
- Display showing "Singularity Pet Count: [number]"

**P0: State persistence**
- User implied by requesting progress tracking: count must persist across sessions
- Counter value saves to AsyncStorage and loads on app restart

**P0: Reactive state updates**
- Platform requirement: Use Legend-State for state management
- Counter updates immediately in UI when tapped

### Nice to Have

**P1: Visual feedback enhancements**
- Animated counter number change (scale/fade)
- Button ripple effect on press
- Haptic feedback on tap (mobile only)

**P2: Counter formatting**
- Comma separators for large numbers (1,000 instead of 1000)
- Abbreviated notation for very large numbers (1.5K, 2.3M)

### Out of Scope

- **Multiple counters or resources** - Single counter only per user request
- **Reset button** - Not requested by user
- **Sound effects** - Not mentioned in requirements
- **Animations beyond basic feedback** - Not requested
- **Multiple screens or navigation** - Single screen feature
- **Shop/upgrade system** - Not requested
- **Statistics or analytics** - Not requested
- **Social features or leaderboards** - Not requested
- **Achievements** - Not requested
- **Tutorial or onboarding** - Not requested
- **Settings or configuration** - Not requested

---

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Dependency | Legend-State library must be installed | Dev | Already included in project | ✅ Green |
| Dependency | AsyncStorage must be configured | Dev | Use Expo's AsyncStorage package | ✅ Green |
| Risk | Rapid tapping may cause state race conditions | Dev | Use Legend-State atomic updates; test with rapid tap sequences | 🟡 Monitor |
| Risk | Large counter values may overflow display | Dev | Test with values up to 1,000,000; implement number formatting if needed | 🟡 Monitor |
| Risk | AsyncStorage write failures could lose progress | Dev | Implement error handling with graceful degradation | 🟡 Monitor |

---

## Timeline & Milestones

- **Discovery & Design**: 0.5 days
  - Review Legend-State integration pattern
  - Design single-screen layout
  - Define persistence strategy

- **Development**: 1-2 days
  - Task 1: Basic tap-to-increment (0.5 days)
  - Task 2: Add persistence (0.5 days)
  - Task 3: Polish and accessibility (0.5 days)

- **Testing & QA**: 0.5 days
  - Test rapid tapping accuracy
  - Test persistence across app restarts
  - Verify accessibility compliance

- **Launch**: Target completion in 2-3 days

**Total**: 2-3 days development time

---

## Open Questions

- [ ] Should the counter display use scientific notation for extremely large numbers (e.g., 1e+6)?
- [ ] What is the expected maximum counter value? (Informs data type choice: number vs BigInt)
- [ ] Should there be any visual celebration at milestone counts (100, 1000, etc.)?
- [ ] Is there a preference for button style (flat, raised, outlined)?

---

## Appendix

### Glossary

- **Clicker/Incremental Game**: A game genre where the primary mechanic is clicking to increment a value, often with automation and upgrades unlocking over time
- **Legend-State**: Fine-grained reactive state management library used in this project
- **AsyncStorage**: React Native's persistent key-value storage API
- **WCAG**: Web Content Accessibility Guidelines - standards for accessible UI design
- **Touch Target**: The tappable area of an interactive UI element

### Related Documents

- `/docs/architecture/state-management-hooks-guide.md` - Hook-based state management patterns
- `/docs/architecture/lean-task-generation-guide.md` - Development approach
- `/docs/architecture/react-native-ui-guidelines.md` - UI component standards
- `/docs/architecture/file-organization-patterns.md` - Project structure

### Technical References

- Legend-State Documentation: https://legendapp.com/open-source/state/
- React Native Pressable: https://reactnative.dev/docs/pressable
- Expo AsyncStorage: https://docs.expo.dev/versions/latest/sdk/async-storage/

---

*Generated: 2025-11-16*
*Feature Source: /mnt/c/dev/class-one-rapids/frontend/modules/attack-button/specs/feature-attack.md*
