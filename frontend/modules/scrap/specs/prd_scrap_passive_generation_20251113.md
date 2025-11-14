# Passive Scrap Generation System - Product Requirements Document

| Version | Author    | Date       | Status |
| ------- | --------- | ---------- | ------ |
| v1.0    | Claude AI | 2025-11-13 | Draft  |

**Executive Summary**: Implement a passive resource generation system where AI Pets automatically collect "scrap" every 1 second, creating a foundational idle game mechanic that rewards players for having more pets while establishing a resource economy for future feature expansion.

---

## Problem & Opportunity

### Problem Statement

Players currently have AI Pets (Singularity Pets) but these pets provide no gameplay value beyond a simple counter. There is no resource economy system and no passive progression that rewards players for returning to the game or maintaining engagement.

### User Impact

- **Who's Affected**: All players who have fed Singularity Pets
- **Frequency**: Continuous - affects every play session
- **Pain Point**: Lack of progression reward for pet ownership reduces long-term engagement

### Business Impact

- **Cost of Not Solving**: Players lose interest after initial interaction with pets
- **Retention Risk**: Without passive progression, players have no incentive to return
- **Engagement Gap**: No idle game loop to maintain interest during inactive periods

### Evidence

Based on idle game best practices research (2025):

- Idle games with offline/passive progression show 35% higher session engagement
- 60-80% of successful idle games implement passive resource generation within first hour
- Players expect meaningful progression with "minimal constant player input"

---

## Solution Overview

### Approach

Implement a tick-based passive resource generation system where AI Pets automatically generate "scrap" resources every 1 second. The amount of scrap generated scales with the number of pets owned, creating incentive for pet acquisition while establishing the foundation for future resource spending mechanics.

### Value Proposition

- **For Players**: Rewarding idle progression that makes pet ownership meaningful
- **For Engagement**: Creates reason to return and check accumulated resources
- **For Economy**: Establishes resource foundation for future upgrade systems

### Key Differentiators

- **Thematic Integration**: Scrap collection fits pet theme ("they bring you shiny stuff like ravens")
- **Scalable Foundation**: Resource system designed for future expansion
- **Minimal Complexity**: Simple 3-second tick aligns with idle game best practices (5-15 second loops)

---

## Success Metrics

| Metric                        | Current  | Target                 | Timeline            | Type           |
| ----------------------------- | -------- | ---------------------- | ------------------- | -------------- |
| Session Return Rate           | Baseline | +25%                   | 2 weeks post-launch | Primary        |
| Average Session Length        | Baseline | +15%                   | 2 weeks post-launch | Primary        |
| Pet Feeding Frequency         | Baseline | +40%                   | 1 week post-launch  | Secondary      |
| Resource Check Frequency      | N/A      | 3+ times per session   | 2 weeks post-launch | Secondary      |
| Scrap Accumulation Engagement | N/A      | 70% of users with pets | 1 week post-launch  | Secondary      |
| Early Churn Rate (D1)         | Baseline | -10%                   | 4 weeks post-launch | Counter-metric |

---

## User Stories & Requirements

### Story 1: Automatic Scrap Collection

**As a player with AI Pets**
**I want to automatically collect scrap over time**
**So that I can feel rewarded for owning pets without constant interaction**

**Acceptance Criteria:**

- Given I have at least 1 AI Pet, when 1 second pass, then my scrap count increases
- Given I have 0 AI Pets, when time passes, then my scrap count does not increase
- Given the app is active, when each 3-second tick occurs, then I see visual feedback of scrap generation

### Story 2: Visible Resource Display

**As a player**
**I want to see my current scrap amount clearly displayed**
**So that I can track my progress and feel accomplishment**

**Acceptance Criteria:**

- Given I am on the main game screen, when I view the UI, then I see my total scrap count prominently displayed
- Given scrap is generated, when the count updates, then I see smooth animation of the number changing
- Given I have accumulated scrap, when the number gets large, then it displays in readable format (e.g., 1.2K, 3.4M)

### Story 3: Scaling Generation Rate

**As a player**
**I want more pets to generate more scrap**
**So that I have incentive to acquire more pets**

**Acceptance Criteria:**

- Given I have N pets, when 1 second pass, then I gain N scrap (1 scrap per pet per tick)
- Given I feed a pet (increasing count), when the next tick occurs, then generation rate increases accordingly
- Given generation rate changes, when I view the UI, then I can see my current generation rate (scrap/second)

### Story 4: Persistent Accumulation

**As a player**
**I want my scrap to persist across sessions**
**So that I don't lose my progress**

**Acceptance Criteria:**

- Given I have accumulated scrap, when I close the app, then my scrap count is saved
- Given I reopen the app, when the game loads, then my previous scrap count is restored
- Given the app was closed, when I return, then I see accumulated scrap based on offline time (with reasonable cap)

---

## Functional Requirements

### Resource Generation System

- **REQ-1.1**: System generates scrap every 1 second (3000ms tick interval)
- **REQ-1.2**: Generation amount equals 1 scrap per pet per tick (linear scaling)
- **REQ-1.3**: Generation only occurs when pet count > 0
- **REQ-1.4**: Tick timer starts when app becomes active
- **REQ-1.5**: Tick timer pauses when app goes to background

### Display & UI

- **REQ-2.1**: Total scrap displayed prominently on main screen
- **REQ-2.2**: Current generation rate displayed (scrap per second or per tick)
- **REQ-2.3**: Visual feedback on each tick (animation, particle effect, or number pop)
- **REQ-2.4**: Number formatting for large values (K, M, B notation at appropriate thresholds)
- **REQ-2.5**: Scrap display updates reactively without full screen re-render

### Persistence & State

- **REQ-3.1**: Scrap count saved to local storage on each change
- **REQ-3.2**: Scrap count loaded on app initialization
- **REQ-3.3**: Pet count (feed count) determines generation rate
- **REQ-3.4**: State survives app closure and reopen

### Offline Progression (MVP Scope)

- **REQ-4.1**: Calculate offline scrap accumulation on app return
- **REQ-4.2**: Cap offline accumulation at 4 hours maximum (48 ticks \* pet count)
- **REQ-4.3**: Display "welcome back" message showing offline earnings
- **REQ-4.4**: Apply offline earnings to total scrap count immediately

---

## Non-Functional Requirements

### Performance

- **Tick precision**: 3-second intervals with ±100ms tolerance acceptable
- **UI update latency**: < 50ms from tick to visible scrap count update
- **Storage write frequency**: Debounced to max 1 write per second despite 3-second ticks
- **Memory footprint**: Tick timer and state management < 5MB additional memory

### Security

- **Client-side only**: All calculations performed locally (no server validation needed for MVP)
- **Data validation**: Prevent negative scrap values or NaN states
- **Storage security**: Use AsyncStorage with error handling for data corruption

### Accessibility

- **Visual clarity**: Scrap counter readable at minimum WCAG AA contrast ratio (4.5:1)
- **Number formatting**: Large numbers displayed in human-readable format
- **Reduced motion**: Optional disable of generation animations

### Scalability

- **Future-proof architecture**: Resource system designed to support multiple resource types
- **Calculation efficiency**: Linear O(1) calculation regardless of accumulated scrap amount
- **Storage design**: Extensible schema for future resource additions

### Browser/Device Support

- **React Native**: iOS 13+ and Android 8+
- **Storage**: AsyncStorage compatibility across supported platforms
- **Background handling**: Proper lifecycle management for mobile app states

---

## Scope Definition

### MVP (Must Have) - P0 Priority

**P0: Basic Tick-Based Generation**

- 3-second interval timer
- Generate 1 scrap per pet per tick
- Display total scrap count
- Persist scrap to local storage

**P0: Reactive UI Updates**

- Scrap counter updates on each tick
- Number formatting for readability
- Generation rate display (X scrap/3sec)

**P0: State Management**

- Legend-State integration for reactive updates
- Hook-based architecture (usePersistedCounter pattern)
- Integration with existing pet count system

**P0: Offline Accumulation (Basic)**

- Calculate offline scrap on app resume
- 4-hour cap on offline earnings
- Simple "welcome back" notification

### Nice to Have - P1/P2 Priority

**P1: Enhanced Visual Feedback**

- Animated particle effects on tick
- Number "pop" animation when scrap increases
- Sound effect on generation (optional/toggleable)

**P1: Statistics Dashboard**

- Total scrap earned (lifetime)
- Average generation rate
- Time to next milestone

**P2: Boost Mechanics (Future)**

- Temporary 2x generation multipliers
- Special events with increased rates
- Ad-watched boosts

**P2: Resource Spending (Future Phase)**

- Scrap shop/upgrade system
- Pet upgrades using scrap
- Prestige mechanics with scrap requirements

### Out of Scope

**Explicitly Excluded:**

- **Scrap spending mechanics** - Future iteration (no shop/upgrade system in this phase)
- **Multiple resource types** - Only scrap in MVP (metals, components, etc. are future additions)
- **Server-side persistence** - Local-only for MVP
- **Social features** - No leaderboards or sharing
- **Complex offline progression** - No "offline managers" or advanced idle calculations
- **Monetization integration** - No ad boosts or IAP in this phase

---

## Dependencies & Risks

| Type       | Description                                                     | Owner        | Mitigation                                                      | Status       |
| ---------- | --------------------------------------------------------------- | ------------ | --------------------------------------------------------------- | ------------ |
| Dependency | Existing Singularity Pet system must provide accurate pet count | Frontend     | Verify pet count observable is accessible and reactive          | Active       |
| Dependency | Legend-State properly configured with AsyncStorage persistence  | Architecture | Review state management setup, test persistence                 | Active       |
| Risk       | Timer drift over long sessions causing inaccurate generation    | Development  | Use Date.now() calculations instead of cumulative setTimeout    | Planning     |
| Risk       | App backgrounding/foregrounding not properly detected           | Development  | Implement AppState listeners and test lifecycle                 | Planning     |
| Risk       | Large numbers (> 1B) causing display or calculation issues      | Development  | Use BigNumber library or scientific notation for extreme values | Low Priority |
| Risk       | Persistence failure causing scrap loss frustrating players      | Development  | Implement multiple save points and recovery mechanisms          | Planning     |

---

## Timeline & Milestones

### Discovery & Design: 1 day

- Review existing pet system integration
- Finalize technical design document
- Create task breakdown

### Development: 2-3 days

- Day 1: Core tick system and state management
- Day 2: UI components and visual feedback
- Day 3: Offline progression and polish

### Testing & QA: 1 day

- Unit tests for generation logic
- Integration tests with pet system
- Lifecycle testing (background/foreground)
- Persistence testing

### Launch: Immediate

- Feature flag enabled for testing
- Monitor metrics for first week
- Gather user feedback

**Total: 4-5 days**

---

## Open Questions

- [ ] Should offline accumulation show a breakdown (e.g., "You were gone for 2 hours, collected 240 scrap")?
- [ ] What happens if pet count decreases (future mechanic) - does generation rate decrease immediately?
- [ ] Should there be a visual indicator for "next tick" countdown?
- [ ] Do we want haptic feedback on scrap generation for mobile devices?
- [ ] Should scrap generation pause during tutorials or onboarding flows?
- [ ] What's the maximum cap for scrap storage (if any) to prevent overflow issues?

---

## Appendix

### Glossary

- **Tick**: A 3-second interval where scrap generation occurs
- **Scrap**: Primary passive resource collected by AI Pets (thematically "shiny stuff")
- **AI Pet / Singularity Pet**: Existing feature where players feed to increase pet count
- **Generation Rate**: Amount of scrap produced per tick (equals pet count)
- **Offline Progression**: Scrap accumulated while app is closed/backgrounded

### References

- [Idler/Clicker Games Best Practices 2025](docs/research/gamedev/idler-clicker-games-best-practices-2025.md)
- [State Management Hooks Guide](docs/architecture/state-management-hooks-guide.md)
- [Lean Task Generation Guide](docs/architecture/lean-task-generation-guide.md)
- [File Organization Patterns](docs/architecture/file-organization-patterns.md)

### Related Documents

- Technical Design Document: `tdd_scrap_passive_generation_[date].md` (to be created)
- Task List: `tasks_scrap_passive_generation_[date].md` (to be created)
- Feature Description: `frontend/modules/scrap/specs/feature.md`

---

_Document generated: 2025-11-13_
_PRD Version: 1.0_
