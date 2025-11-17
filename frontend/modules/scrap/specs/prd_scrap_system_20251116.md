# Product Requirements Document: Scrap Idle Resource System

| Version | Author | Date | Status |
|---------|--------|------|--------|
| v1.0 | Claude | 2025-11-16 | Draft |

## Executive Summary

This PRD defines a passive resource generation system called "scrap" that accumulates automatically based on the number of AI Pets (Singularity Pet Count) the user has collected. Every 1 second, players gain scrap proportional to their AI Pet count. This resource has no current use case but establishes the foundation for future economy features. The system delivers pure idle game mechanics with visual feedback but zero spending mechanisms.

---

## Problem & Opportunity

### Problem Statement

Users currently have no way to see ongoing value from their AI Pet collection beyond the satisfaction of incrementing a counter. The pets serve no functional purpose after being acquired. Players lack any sense of progression or passive reward for their accumulated pets.

### User Impact

This affects all users who have acquired AI Pets through the feed button. Without passive resource generation, there's no incentive to continue playing after the initial clicking phase, and no reward for having built up a pet collection. Users expect idle games to provide "something happening" even when they're not actively clicking.

### Business Impact

Without an idle resource system, the application has no retention mechanism for players between active sessions. Players have no reason to return after closing the app. Every idle game competitor provides passive resource generation as a core engagement loop. Missing this feature represents a critical gap in the idle game progression model.

### Evidence

- Standard idle game pattern: Resources generated per second based on owned entities
- Expected update frequency: 1-second intervals (industry standard for idle games)
- Retention impact: Idle mechanics typically increase day-2 retention by 30-50%
- Player expectation: "Numbers go up" even when not actively playing

---

## Solution Overview

### Approach

Implement an automated timer system that:
1. Calculates scrap generation rate based on current AI Pet count (1 scrap per pet per second as baseline)
2. Updates scrap value every 1 second while the app is active
3. Displays current scrap value prominently on screen
4. Provides visual feedback showing resource accumulation

The scrap resource is displayed but has no consumption mechanism (explicitly out of scope).

### Value Proposition

Users experience continuous progression through passive resource accumulation. Each AI Pet they've collected generates ongoing value, creating a sense of compound growth and rewarding past effort. The idle mechanic provides a "reason to come back" as scrap continues accumulating.

### Key Differentiators

- Pure idle mechanic: No active clicking required for scrap generation
- Direct pet value: Each AI Pet contributes to scrap generation
- Persistent progression: Scrap accumulates continuously during active sessions
- Foundation for economy: Establishes resource layer for future features

---

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Scrap calculation accuracy | N/A | 100% (correct rate based on pet count) | Launch | Primary |
| Timer precision | N/A | Updates within ±100ms of 1-second interval | Launch | Primary |
| UI update latency | N/A | < 50ms after scrap value changes | Launch | Primary |
| Scrap display visibility | N/A | 100% of users can see scrap value | Launch | Secondary |
| Session duration increase | Baseline | +20% average session time | 2 weeks post-launch | Secondary |
| Return rate (day-1) | Baseline | +15% players return next day | 2 weeks post-launch | Counter |

---

## User Stories & Requirements

### Story: Passive Scrap Generation

As a user
I want to automatically gain scrap based on my AI Pets
So that my pets provide ongoing value beyond just a number

**Acceptance Criteria:**
- [ ] Given I have 1 AI Pet, when 1 second passes, then I gain 1 scrap
- [ ] Given I have 10 AI Pets, when 1 second passes, then I gain 10 scrap
- [ ] Given I have 0 AI Pets, when 1 second passes, then I gain 0 scrap
- [ ] Given I acquire a new AI Pet, when the next scrap tick occurs, then the scrap rate reflects the new pet count
- [ ] Given the app is open, when time passes, then scrap continuously accumulates without any user action

### Story: Scrap Display

As a user
I want to see how much scrap I have
So that I can track my passive progress

**Acceptance Criteria:**
- [ ] Given the app is launched, when I view the screen, then I see a scrap display showing my current scrap amount
- [ ] Given scrap is being generated, when the value updates, then I see the new value within 100ms
- [ ] Given I have large amounts of scrap, when viewing the display, then the number is formatted readably (handling values up to at least 999,999)
- [ ] Given scrap increases, when I observe the display, then I can clearly see the value changing

### Story: Generation Rate Visibility

As a user
I want to understand my current scrap generation rate
So that I know what value my AI Pets are providing

**Acceptance Criteria:**
- [ ] Given I have AI Pets, when viewing the screen, then I can understand my scrap generation rate
- [ ] Given I acquire more pets, when the rate changes, then I can see or infer the updated generation speed
- [ ] Given I have 0 pets, when viewing the screen, then it's clear that I'm generating 0 scrap per second

---

## Functional Requirements

### Scrap Generation Logic
- **FR-1**: Base generation rate must be 1 scrap per AI Pet per second
- **FR-2**: Scrap must accumulate every 1 second (1000ms interval)
- **FR-3**: Generation rate must be calculated as: `Math.floor(petCount * 1 * scrapMultiplier)` where scrapMultiplier starts at 1.0
- **FR-4**: Scrap must only accumulate while the app is actively running (no offline progression)
- **FR-5**: Scrap value must be tracked as an integer (no fractional scrap)

### Timer System
- **FR-6**: Timer must tick every 1 second (±100ms acceptable variance)
- **FR-7**: Timer must start automatically when the screen mounts
- **FR-8**: Timer must clean up properly when the screen unmounts
- **FR-9**: Timer must continue running continuously while the app is in foreground
- **FR-10**: Timer must pause when app goes to background (no offline accumulation)

### Scrap Display
- **FR-11**: Display must show "Scrap: [amount]" or similar clear label
- **FR-12**: Display must update synchronously when scrap value changes
- **FR-13**: Display must handle scrap values from 0 to at least 999,999 without breaking
- **FR-14**: Display must be visible without scrolling
- **FR-15**: Display should show current generation rate (e.g., "+10/sec") if space permits

### Integration with Pet System
- **FR-16**: Scrap generation rate must reflect current AI Pet count in real-time
- **FR-17**: When pet count changes, next scrap tick must use updated pet count
- **FR-18**: Initial scrap value must be 0 on first app launch
- **FR-19**: Scrap value should persist across app restarts (future enhancement, see scope)

---

## Non-Functional Requirements

### Performance
- Timer must not impact UI responsiveness (< 5ms computation per tick)
- Scrap updates must not cause frame drops (maintain 60fps)
- Memory usage must remain constant (no timer or state leaks)

### Accessibility
- Scrap display must have `accessibilityRole="text"`
- Screen reader must announce scrap value and generation rate
- Text contrast ratio must be ≥ 4.5:1 against background
- Scrap information must be perceivable by users with various accessibility needs

### Browser/Device Support
- iOS (React Native, Expo SDK 54+)
- Android (React Native, Expo SDK 54+)
- Web (React Native Web, if applicable)

### Reliability
- Timer must not drift significantly over long sessions (< 5% drift per hour)
- Scrap calculation must never produce negative values
- System must handle edge cases (0 pets, very large pet counts, app backgrounding)

---

## Scope Definition

### CRITICAL VALIDATION

**Original Feature Request:**
> "Every 1 seconds you gain 'scrap' based on the number of AI Pets you have. They bring you shiny stuff like ravens, which is abstracted into this value for now. You can't use it for anything yet."

**Explicit Exclusions:** "You can't use it for anything yet" (no spending or consumption mechanisms)

### MVP (Must Have - P0)

**VALIDATION REQUIREMENT**: Each feature below quotes the exact request from the feature description.

- **P0**: Scrap generation every 1 second - QUOTE: "Every 1 seconds you gain 'scrap'"
- **P0**: Generation based on AI Pet count - QUOTE: "based on the number of AI Pets you have"
- **P0**: Resource called "scrap" - QUOTE: "you gain 'scrap'"
- **P0**: Display of current scrap amount (implied: users need to see the resource they're gaining)
- **P0**: No spending mechanism - QUOTE: "You can't use it for anything yet"
- **P0**: Platform performance baseline (timer must not degrade app performance)
- **P0**: Basic accessibility (screen reader support for resource display)

### Nice to Have (P1/P2)

**P1: Enhanced User Experience** (not in original request)
- Visual animation when scrap increases (number count-up, particle effects)
- Sound effects on scrap accumulation
- Display of scrap-per-second rate alongside total
- Formatting with commas for large numbers
- Scrap history or statistics
- Visual representation of generation rate (progress bar, particles)

**P2: Potential Future Features** (explicitly NOT requested)
- Scrap persistence across app restarts (see Open Questions)
- Offline scrap accumulation (time-based catch-up)
- Scrap generation rate tooltips or detailed breakdown
- Achievements related to scrap milestones
- Visual pets that "bring" scrap (thematic representation)
- Multiple resource types beyond scrap

### Out of Scope

The following are explicitly **NOT** included in this release:

- **Scrap Spending**: No way to use scrap (user explicitly stated "can't use it for anything yet")
- **Shop or Upgrades**: No scrap consumption mechanisms
- **Offline Progression**: No scrap accumulation while app is closed
- **Persistence**: Scrap MAY reset on app restart (pending Open Questions - not explicitly requested)
- **Visual Pet Representation**: Abstract resource only, no animated ravens or visual pets
- **Multiple Resources**: Scrap only, no other currency types
- **Scrap Cap or Maximum**: Unlimited accumulation
- **Manual Scrap Collection**: Pure passive generation, no tap-to-collect
- **Scrap Boosts or Modifiers**: Base 1:1 ratio only (upgrades are future features)
- **Analytics**: No tracking of scrap generation rates or totals
- **Social Features**: No scrap sharing, leaderboards, or comparisons
- **Scrap Transfer**: No giving scrap to other players
- **Tutorial**: Generation is self-evident through observation
- **Settings**: No ability to adjust generation rates or timing
- **Prestige System**: No scrap-based reset mechanics
- **Scrap Multipliers**: Base 1 scrap per pet per second only (upgrades are separate feature)

---

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Technical | Timer accuracy across different devices/platforms | Development | Use `setInterval` with React cleanup, test on real devices | Not Started |
| Technical | State synchronization between pet count and scrap generation | Development | Use shared state management (Legend State), test rapid pet acquisition | Not Started |
| Technical | Background timer behavior (iOS/Android suspend timers) | Development | Implement proper cleanup, test app backgrounding, document limitations | Not Started |
| UX | User confusion about scrap purpose | Design/Dev | Clear labeling, tooltip explaining "no use yet" | Not Started |
| UX | User frustration with lack of scrap utility | Product | Set expectation that spending comes later, ensure visibility of coming features | Not Started |
| Dependency | Requires pet count from ClickerScreen | Development | Refactor pet count to shared state before implementing scrap | Not Started |

---

## Timeline & Milestones

- **Discovery & Planning**: 0.5 weeks
  - State management architecture (lift pet count to shared state)
  - Timer implementation strategy
  - UI/UX design for scrap display

- **Development**: 1 week
  - Refactor pet count to shared state (Legend State)
  - Implement scrap state and timer logic
  - Add scrap display to UI
  - Integrate with pet count
  - Add accessibility attributes

- **Testing & QA**: 0.5 weeks
  - Timer accuracy testing across devices
  - Pet count synchronization testing
  - Background/foreground transition testing
  - Accessibility testing
  - Performance testing (long sessions)

- **Launch**: Week 2

**Total**: 2 weeks

---

## Technical Architecture

### State Management

**Shared State (Legend State)**
```typescript
// Shared game state
const gameState$ = observable({
  petCount: 0,        // Moved from ClickerScreen local state
  scrap: 0,           // New scrap resource
});
```

**Computed Values**
```typescript
// Scrap generation rate (scrap per second)
const scrapRate$ = computed(() => {
  const petCount = gameState$.petCount.get();
  return Math.floor(petCount * 1); // Base: 1 scrap per pet per second
});
```

### Timer Implementation

Use React `useEffect` with `setInterval`:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const rate = scrapRate$.get();
    gameState$.scrap.set(prev => prev + rate);
  }, 1000); // 1 second interval

  return () => clearInterval(interval);
}, []);
```

### Integration Points

1. **ClickerScreen**: Update to use shared `gameState$.petCount` instead of local state
2. **Scrap Display**: New component or integrate into existing screen
3. **Persistence Layer**: Future enhancement to persist scrap value

---

## Open Questions

- [ ] Should scrap persist across app restarts, or reset to 0 each launch?
  - **Recommendation**: Persist scrap - maintains progression, reduces user frustration
  - **Impact**: Requires Legend State persistence setup for scrap value
  - **Decision needed by**: Design phase (week 1)

- [ ] Should we show scrap-per-second rate explicitly, or let users infer it?
  - **Recommendation**: Show rate explicitly ("+10/sec") - improves transparency
  - **Impact**: Additional UI element, minimal development cost
  - **Decision needed by**: Design phase (week 1)

- [ ] What should happen to scrap when app is backgrounded?
  - **Recommendation**: Pause generation (no offline accumulation) per feature scope
  - **Impact**: Simpler implementation, aligns with "app must be open" expectation
  - **Decision needed by**: Design phase (week 1)

- [ ] Should we format large scrap numbers with commas or use scientific notation?
  - **Example**: 1,234,567 vs 1.2M vs 1234567
  - **Decision needed by**: Design phase (week 1)

- [ ] Should scrap have a maximum cap or accumulate infinitely?
  - **Recommendation**: Infinite accumulation - no technical limitation, keeps progression open
  - **Impact**: None (JavaScript handles large integers safely up to MAX_SAFE_INTEGER)
  - **Decision needed by**: Design phase (week 1)

- [ ] Do we need a visual indicator that scrap is actively generating?
  - **Example**: Pulsing animation, "+1" floating numbers, progress bar
  - **Recommendation**: P1 enhancement - improves feedback but not critical for MVP
  - **Decision needed by**: Design review

---

## Appendix

### Glossary

- **Scrap**: The primary idle resource generated passively by AI Pets
- **AI Pet**: An entity acquired through the feed button; each pet generates scrap
- **Idle Game**: A game genre where progression continues automatically without active player input
- **Generation Rate**: The amount of scrap produced per second (base: 1 scrap per pet)
- **Tick**: A single update cycle of the scrap generation timer (occurs every 1 second)
- **Passive Resource**: Currency or resource that accumulates without player action

### References

- React Native Timer Management: https://reactnative.dev/docs/timers
- Legend State Documentation: https://legendapp.com/open-source/state/
- Idle Game Design Patterns: Industry best practices for passive resource systems
- React Hooks Cleanup: https://react.dev/reference/react/useEffect

### Related Documents

- `/docs/architecture/state-management-hooks-guide.md` - State management patterns
- `/docs/architecture/lean-task-generation-guide.md` - Development approach
- `/frontend/modules/attack-button/specs/prd_core_clicker_flow_20251116.md` - Pet/clicker system
- `/frontend/modules/shop/specs/feature-shop.md` - Future scrap spending mechanism
- `/frontend/modules/upgrades/specs/feature-upgrades.md` - Scrap multiplier upgrades

### Design Considerations

**Visual Hierarchy**
- Primary: Pet count (main engagement)
- Secondary: Scrap total (passive resource)
- Tertiary: Scrap rate (informational)

**User Mental Model**
1. I click "feed" → Get AI Pets
2. AI Pets → Generate scrap automatically
3. Scrap → (Future) Spend on upgrades/shop
4. Upgrades → Generate more scrap → Positive feedback loop

**Thematic Justification**
Feature description mentions "They bring you shiny stuff like ravens" - this establishes the thematic basis:
- AI Pets scavenge resources from the environment
- Ravens are known for collecting shiny objects
- "Scrap" as abstracted value of collected items
- Foundation for future visual representation of pets "bringing" items

---

*PRD Generated: 2025-11-16*
*Feature Source: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/feature-scrap.md`*
