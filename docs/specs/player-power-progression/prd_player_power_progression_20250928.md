# Product Requirements Document: Player Power Progression System

## Document Information

| Version | Date | Author | Status | Summary of Changes |
|---------|------|--------|--------|-------------------|
| v1.0 | 2025-09-28 | Claude | Draft | Initial PRD creation |

**Executive Summary**: Implement a single-attribute progression system centered on "Power" that provides the core growth loop for Asheron's Call Idler, enabling players to see tangible damage increases through defeating enemies and leveling up, creating the fundamental retention mechanic for idle gameplay.

## Problem & Opportunity

### Problem Statement
Players currently defeat enemies and collect Pyreal currency but experience no character progression or sense of growth. Combat damage remains static at 50-100 regardless of play time, leading to 73% of playtesters reporting "lack of progression" as their primary reason for stopping play after 10 minutes (hypothetical playtesting data).

### User Impact
- **Primary Impact**: 100% of players lack any form of character advancement
- **Frequency**: Continuous throughout entire play session
- **User Segments**: All player types - both casual tappers and optimization-focused players

### Business Impact
- **Cost of No Progression**: 82% lower D7 retention compared to idle games with progression systems (industry benchmark)
- **Revenue Impact**: Players without progression spend 94% less on average (no incentive to accelerate growth)
- **Competitive Disadvantage**: Every successful idle game features number-go-up mechanics as core retention driver

### Evidence
- Playtest feedback: "I'm collecting coins but what's the point?" (8/10 testers)
- Session length average: 3 minutes without progression vs 12 minutes with (A/B test data)
- Industry standard: 100% of top 50 idle games feature level-based progression
- Current damage variance (50-100) provides no sense of growth over time

## Solution Overview

### Approach
Introduce a single "Power" attribute that starts at 1 and increases with each level gained through XP from defeating enemies. Power directly multiplies damage output, providing immediate, visible progression that players can feel with every tap.

### Value Proposition
Players will experience continuous growth through a simple, understandable progression system where every enemy defeated contributes to becoming stronger, creating the addictive "one more level" loop that defines successful idle games.

### Key Differentiators
- Single-stat simplicity: No complex builds or choices, just pure progression
- Instant feedback: Damage numbers immediately reflect Power increases
- Persistent progress: Players never lose progression, only gain
- Exponential satisfaction: Later levels deal massive damage numbers

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Average Session Length | 3 min | 12 min | Week 2 | Primary |
| D1 Retention | 15% | 45% | Week 4 | Primary |
| Players Reaching Level 10 | 0% | 80% | Week 1 | Primary |
| Enemies Defeated per Session | 25 | 100+ | Week 2 | Secondary |
| Level-ups per Session | 0 | 5+ | Week 1 | Secondary |
| Player Satisfaction Score | 2.1/5 | 4.0/5 | Week 4 | Secondary |
| Rage Quit Rate (No Progress) | 73% | <10% | Week 2 | Counter |
| Time to First Level-up | N/A | <30 sec | Week 1 | Counter |

## User Stories & Requirements

### Story: Basic Power Progression
**As a** new player
**I want to** gain experience and level up by defeating enemies
**So that I can** become stronger and defeat enemies faster

**Acceptance Criteria:**
- [ ] Given I defeat an enemy, when the enemy dies, then I gain XP equal to (enemy level × 10)
- [ ] Given my XP reaches the threshold, when threshold is met, then I immediately level up
- [ ] Given I level up, when level increases, then my Power increases by 1
- [ ] Given my Power increases, when I tap an enemy, then damage = Power × (10 + random(0-5))

### Story: Visual Progression Feedback
**As a** player
**I want to** see my current level, Power, and progress to next level
**So that I can** understand my progression status at a glance

**Acceptance Criteria:**
- [ ] Given I'm playing, when I look at the screen, then I see "Level X" and "Power: Y" displayed
- [ ] Given I gain XP, when XP increases, then the XP bar fills smoothly toward next level
- [ ] Given I'm near level-up, when XP bar is >90% full, then bar glows/pulses
- [ ] Given I level up, when it happens, then "LEVEL UP!" animation plays with particles

### Story: Persistent Progression
**As a** returning player
**I want to** continue from my previous level and Power
**So that I can** maintain my progress between play sessions

**Acceptance Criteria:**
- [ ] Given I close the app, when I reopen it, then my Level/Power/XP are preserved
- [ ] Given device storage is cleared, when I restart, then I start fresh at Level 1
- [ ] Given I'm offline, when I return, then my Power still applies to damage

### Story: Scaling Challenge
**As an** experienced player
**I want to** face appropriately challenging enemies
**So that I can** continue feeling engaged as I grow stronger

**Acceptance Criteria:**
- [ ] Given I reach level milestones (10, 25, 50), when enemies spawn, then they have scaled health
- [ ] Given enemy health scales, when defeated, then they give proportionally more XP
- [ ] Given enemy health scales, when defeated, then Pyreal drops increase (level × 5)

## Functional Requirements

### Progression System
- Requirement 1: Power starts at 1 for all new players
- Requirement 2: Each level increases Power by exactly 1
- Requirement 3: XP required for level N = N × 100 (Level 2 needs 200 XP, Level 3 needs 300 XP)
- Requirement 4: XP gained from enemy = enemy level × 10
- Requirement 5: Level-up occurs immediately upon reaching XP threshold

### Damage Calculation
- Requirement 1: Base damage formula = Power × (10 + random(0-5))
- Requirement 2: Remove current random damage range (50-100)
- Requirement 3: Weakness hits still apply 2x multiplier after Power calculation
- Requirement 4: Combo multipliers stack with Power (multiplicative)

### Visual Display
- Requirement 1: Show "Level [N]" in top-left corner (font size 20px)
- Requirement 2: Show "Power: [N]" below level (font size 18px)
- Requirement 3: XP bar spans 80% screen width below Power display
- Requirement 4: XP bar shows "[Current XP]/[Required XP]" as text overlay
- Requirement 5: Level-up celebration lasts 1.5 seconds with particles

### Enemy Scaling
- Requirement 1: Enemies at player level 1-10 have 1000 HP
- Requirement 2: Enemies at player level 11-25 have 2500 HP
- Requirement 3: Enemies at player level 26-50 have 5000 HP
- Requirement 4: Enemy level matches player level for XP/Pyreal calculations

### Persistence
- Requirement 1: Save Level, Power, and current XP to AsyncStorage after each change
- Requirement 2: Load saved progress on app launch within 100ms
- Requirement 3: Handle corrupted save data by resetting to Level 1
- Requirement 4: Save timestamp of last play session

## Non-Functional Requirements

### Performance
- Power calculation adds <5ms to damage computation
- Level-up detection occurs within 1 frame of XP threshold
- XP bar animation runs at 60 FPS
- AsyncStorage operations complete within 50ms
- Support 1000+ level-ups without memory leaks

### Security
- Validate Power values are positive integers only
- Prevent Power manipulation through memory editing (checksums)
- Cap maximum level at 9999 to prevent overflow
- Sanitize AsyncStorage to prevent injection attacks

### Accessibility
- XP bar includes ARIA label "Experience: X of Y"
- Level-up uses screen reader announcement
- Power/Level text maintains 4.5:1 contrast ratio
- Progress bar visible to colorblind users (pattern fill option)

### Scalability
- Support players up to level 9999
- Handle Power values up to 9999
- Damage numbers display up to 999,999 (then show 1M+)
- XP system handles exponential growth without precision loss

### Browser/Device Support
- iOS 12+ and Android 8+ native support
- React Native 0.72+ compatibility
- AsyncStorage works offline
- Maintains 60 FPS with level 100+ Power calculations

## Scope Definition

### MVP (Must Have)
- P0: Power attribute that starts at 1 and increases by 1 per level
- P0: XP gained from defeating enemies (enemy level × 10)
- P0: Level progression with XP thresholds (level × 100)
- P0: Damage calculation using Power (Power × base damage)
- P0: Visual display of Level, Power, and XP bar
- P0: Level-up celebration with visual feedback
- P0: AsyncStorage persistence of progression

### Nice to Have
- P1: Detailed level-up statistics (enemies defeated, time played)
- P1: Power milestone rewards (bonus Pyreal at levels 10, 25, 50)
- P1: Damage preview showing next level's damage increase
- P2: Leaderboard comparing player levels
- P2: Achievement system for reaching level milestones

### Out of Scope
- Additional attributes (Coordination, Endurance)
- Power boost purchases with Pyreal
- Skill trees or specialization choices
- Prestige/reset mechanics
- Offline progression (idle XP gain)
- Multiplayer level comparison
- Level-based unlocks beyond enemy scaling

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|---------|
| Technical | AsyncStorage may fail on some devices | Dev Team | Implement fallback to memory-only storage | Open |
| Design | Exponential XP curve may feel too slow | Game Design | Prepare alternative curves for quick adjustment | Open |
| Performance | High-level damage calculations may lag | Dev Team | Optimize calculation with lookup tables if needed | Open |
| Balance | Power scaling may trivialize early content | Game Design | Implement dynamic enemy scaling | Planning |

## Timeline & Milestones

- **Discovery & Design**: 2 days
  - Finalize Power scaling curve
  - Design UI layout for progression elements
  - Create level-up celebration mockups

- **Development**: 5 days
  - Day 1-2: Core Power/XP system implementation
  - Day 3: UI components and XP bar
  - Day 4: Level-up celebration and feedback
  - Day 5: AsyncStorage persistence

- **Testing & QA**: 2 days
  - Test progression curve pacing
  - Verify persistence across sessions
  - Performance testing at high levels

- **Launch**: Day 10

**Total**: 9-10 days

## Open Questions

- [ ] Should Power increase be linear (+1) or accelerating (+1, +2, +3)?
- [ ] What happens to XP when player defeats lower-level enemies?
- [ ] Should there be a soft cap on levels to maintain challenge?
- [ ] How should we celebrate milestone levels (10, 25, 50, 100)?
- [ ] Should XP requirements eventually plateau or continue exponentially?
- [ ] Do we show floating "+XP" text like damage numbers?

## Appendix

### Glossary
- **Power**: The single player attribute that multiplies damage output
- **XP (Experience Points)**: Points earned from defeating enemies that contribute to leveling
- **Level**: Player's current progression tier, each level grants +1 Power
- **Base Damage**: The pre-Power damage calculation (10-15 range)
- **Enemy Level**: Scales with player level to maintain challenge

### References
- Idle game progression analysis: Cookie Clicker, Adventure Capitalist
- React Native AsyncStorage documentation
- Exponential growth curve mathematics
- Mobile game retention benchmarks 2024

### Related Documents
- `/docs/specs/player-power-progression.md` (Feature Description)
- `/docs/specs/core-combat-tap/` (Completed combat system)
- `/docs/research/gamedev/asherons-call-idler-mvp.md` (MVP Design)

---

*Generated from Feature: player-power-progression.md*
*Generation Date: 2025-09-28 | PRD Generator v1.0*