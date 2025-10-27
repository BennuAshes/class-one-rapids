# Product Requirements Document: Salvage & Tinkering System with Progressive Automation

## Document Information

| Version | Author | Date | Status |
|---------|--------|------|--------|
| v1.0 | Game Design Team | 2025-10-26 | Draft |

### Executive Summary

The Salvage & Tinkering System introduces a progressively automated idle game mechanic where players manually salvage items for materials and upgrade equipment through tinkering. The system evolves from satisfying manual crafting (Levels 1-10) through strategic hybrid automation (Levels 11-25) to full optimization gameplay (Level 26+), creating a compelling engagement loop that rewards both active play and idle progression while maintaining player agency throughout.

---

## 1. Problem & Opportunity

### Problem Statement

Mobile idle/incremental games face a fundamental tension: manual clicking provides satisfying feedback but becomes tedious, while premature automation removes player engagement. Current games either:
- Force repetitive manual actions that feel like work (player fatigue at 20-30 min)
- Introduce automation too early, removing the satisfaction of progress (50% drop-off when automation starts)
- Create disconnected manual and auto systems that compete rather than complement

Players need a crafting/progression system that naturally transitions from engaging manual gameplay to strategic automation without losing the core satisfaction loop.

### User Impact

**Who's Affected:**
- **Primary**: 100% of players engaging with equipment progression (core game loop)
- **Secondary**: Players seeking idle/passive progression (estimated 70% of player base)
- **Frequency**: Multiple times per session, daily engagement

**Current Experience:**
- Equipment upgrades require manual material gathering (tedious after 50+ items)
- No offline progression for crafting systems
- Material management becomes overwhelming at scale (200+ items)
- Players must choose between tedious clicking or no progression

### Business Impact

**Cost of Not Solving:**
- **Retention**: Session lengths plateau at 15 minutes vs target 30+ minutes
- **Monetization**: Limited premium upgrade paths without automation systems
- **Engagement**: 40% of players abandon equipment system after Level 5
- **Lifetime Value**: Players who engage with crafting have 3x higher LTV but only 30% currently do so

**Opportunity:**
- Idle/incremental mechanics increase daily active users by 40-60% in comparable games
- Automation systems create clear monetization tiers (speed boosts, offline bonuses)
- Progressive complexity naturally segments players by engagement level

### Evidence

**Hypothetical Metrics (Based on Similar Games):**
- Average salvage session: 5.2 minutes (target: 15+ minutes)
- Manual clicks per session: 47 (unsustainable beyond Level 10)
- Equipment upgrade frequency: 2.1 per day (target: 8-12 per day with automation)
- Material inventory turnover: 68% unused (indicates poor engagement loop)

---

## 2. Solution Overview

### Approach

A three-phase progression system that transforms the salvage and tinkering experience:

**Phase 1: Manual Crafting Foundation (Levels 1-10)**
- Direct click-to-salvage with satisfying visual/audio feedback
- 100% success rate tinkering to build confidence
- Simple material collection and equipment upgrade flow
- First automation unlock at Level 10 as major milestone

**Phase 2: Assisted Automation (Levels 11-25)**
- Gradual automation unlocks through dual progression trees
- Hybrid gameplay where manual actions provide bonuses (2x speed, critical success)
- Strategic decision-making: automation priorities, resource allocation
- Active play remains superior but automation provides baseline progress

**Phase 3: Full Automation & Optimization (Level 26+)**
- Complete automation with offline progression
- High-level strategic decisions (prestige choices, forge cycles)
- Manual "god mode" abilities for active players (1000x processing, legendary chances)
- Optimization and big number satisfaction

### Value Proposition

**For Active Players:**
- Satisfying manual gameplay that remains rewarding at all levels
- Manual bonuses ensure clicking is always valuable (2x speed, 5x materials)
- Strategic depth through automation management and prestige choices

**For Idle Players:**
- Gradual automation unlocks create clear progression goals
- Offline progression after Level 26 enables daily check-in gameplay
- Set-and-forget systems with periodic optimization opportunities

**For All Players:**
- Natural learning curve: master manual mechanics before automation
- Each automation feels earned, not handed out
- Continuous sense of advancement through 40+ levels

### Key Differentiators

1. **Earned Automation**: Each automation tier is a reward for progression, not a default feature
2. **Maintained Agency**: Manual play always provides significant bonuses, never becomes obsolete
3. **Hybrid Gameplay**: Seamless blend of active and idle mechanics in Phase 2
4. **Progressive UI Evolution**: Interface complexity matches player mastery
5. **No-Failure Learning**: Phase 1 eliminates frustration during tutorial period

---

## 3. Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Average salvage session length | 5.2 min | 15+ min | 4 weeks post-launch | Primary |
| Equipment system engagement rate | 30% | 70% | 8 weeks post-launch | Primary |
| Daily active users (DAU) retention | Baseline | +40% | 12 weeks post-launch | Primary |
| Average revenue per paying user (ARPPU) | Baseline | +50% | 12 weeks post-launch | Secondary |
| Phase 2 completion rate (Level 25+) | N/A | 50% | 8 weeks post-launch | Secondary |
| Daily sessions per user | Baseline | +2.5 sessions | 8 weeks post-launch | Secondary |
| Average click rate in Phase 3 | N/A | >10 clicks/min | 12 weeks post-launch | Counter |
| Manual action engagement drop-off | N/A | <30% | 12 weeks post-launch | Counter |

**Counter-Metric Rationale**: Monitor that automation doesn't completely replace manual play. Target: 70%+ of Phase 3 players still perform manual actions weekly.

---

## 4. User Stories & Requirements

### Epic 1: Manual Salvaging Foundation

**Story 1.1: Basic Salvaging**
As a player
I want to tap items in my inventory to salvage them
So that I can collect materials for equipment upgrades

**Acceptance Criteria:**
- [ ] Given I have items in inventory, when I tap an item, then a 0.5-second salvage animation plays
- [ ] Given salvage completes, when animation ends, then materials appear with particle effects matching material rarity
- [ ] Given materials appear, when 0.5 seconds pass, then materials auto-collect to material counter
- [ ] Given manual collection, when I tap floating materials, then they immediately collect
- [ ] Given successful salvage, when materials collect, then counter updates with popup number animation (+X)
- [ ] Given inventory slot empties, when salvage completes, then slot is ready for next item immediately

**Story 1.2: Material Discovery**
As a new player
I want to see different visual feedback for different material types
So that I understand the value of what I'm collecting

**Acceptance Criteria:**
- [ ] Given common material drops, when salvaging, then blue particles emit
- [ ] Given rare material drops, when salvaging, then purple particles emit with stronger glow
- [ ] Given epic material drops, when salvaging, then gold particles emit with screen edge glow
- [ ] Given legendary material drops, when salvaging, then rainbow particles emit with screen shake and unique sound
- [ ] Given first discovery of material type, when collected, then brief tooltip shows "[Material] discovered!"

**Story 1.3: Manual Tinkering**
As a player
I want to use collected materials to upgrade my equipment
So that I can increase my power level

**Acceptance Criteria:**
- [ ] Given I have sufficient materials, when I tap equipment piece, then tinkering interface opens
- [ ] Given tinkering interface open, when I tap "Upgrade" button, then 2-second channeling animation plays
- [ ] Given channeling completes, when timer reaches 0, then equipment shows "+1" with success particles
- [ ] Given successful upgrade, when animation completes, then power level increases visibly
- [ ] Given insufficient materials, when I tap "Upgrade", then button is disabled with red tint and shows "Need X more [material]"
- [ ] Given Phase 1 (Levels 1-10), when any upgrade occurs, then success rate is 100%

### Epic 2: Early Automation Unlocks

**Story 2.1: Batch Processing**
As a player progressing to Level 8
I want to select multiple items for salvage
So that I can process materials more efficiently

**Acceptance Criteria:**
- [ ] Given Level 8 reached, when tutorial displays, then batch select feature is explained
- [ ] Given batch mode available, when I shift-tap items, then items highlight with selection border
- [ ] Given items selected, when I tap "Salvage All Selected" button, then items process sequentially at 2 items/second
- [ ] Given batch salvaging, when processing, then progress bar shows X/Y items completed
- [ ] Given batch complete, when all items processed, then summary shows total materials gained

**Story 2.2: First Automation Assistant**
As a player reaching Level 10
I want to unlock automated salvaging
So that I can progress while focusing on other gameplay

**Acceptance Criteria:**
- [ ] Given Level 10 reached, when level-up occurs, then major celebration animation plays
- [ ] Given celebration complete, when dismissed, then "Salvage Assistant Unlocked!" modal appears
- [ ] Given assistant unlocked, when activated, then assistant icon appears in UI
- [ ] Given assistant active, when items in inventory, then assistant salvages 1 item every 3 seconds automatically
- [ ] Given assistant running, when I manual-click items, then manual actions process immediately (don't wait for assistant cycle)
- [ ] Given assistant working, when inventory empties, then assistant enters idle state with "Waiting for items" indicator

### Epic 3: Hybrid Automation Phase

**Story 3.1: Automation Progression Tree**
As a mid-level player (11-25)
I want to upgrade my automation capabilities
So that I can increase my passive income while maintaining active bonuses

**Acceptance Criteria:**
- [ ] Given Level 11 reached, when accessing automation menu, then upgrade tree displays with locked/unlocked tiers
- [ ] Given viewing tree, when I tap any node, then tooltip shows: level requirement, cost, effect description
- [ ] Given sufficient resources, when I purchase upgrade, then confirmation modal shows before/after stats
- [ ] Given upgrade purchased, when confirmed, then visual effect connects node to previous tier
- [ ] Given upgrade active, when salvaging occurs, then new rate applies immediately
- [ ] Upgrade progression: Level 11 (1/3s) → L13 (1/2s) → L15 (1/1s) → L18 (3/s) → L22 (10/s)

**Story 3.2: Manual Click Bonuses**
As an active player in Phase 2
I want manual actions to provide significant advantages
So that active play feels rewarding alongside automation

**Acceptance Criteria:**
- [ ] Given automation active, when I manual-click salvage, then item processes 2x faster than automation speed
- [ ] Given 10 manual clicks within 5 seconds, when threshold reached, then "COMBO!" appears and next 10 automation cycles are 3x speed
- [ ] Given manual salvage, when processing, then 5% chance for critical salvage (screen flash + "CRITICAL!" text)
- [ ] Given critical salvage, when materials drop, then 5x materials are rewarded
- [ ] Given manual tinkering, when upgrading equipment, then material cost is 50% of auto-tinkering cost
- [ ] Given manual actions, when performed, then UI shows comparison: "Manual: 2.0/sec | Auto: 1.0/sec"

**Story 3.3: Auto-Tinkering System**
As a player reaching Level 12
I want equipment to upgrade automatically
So that I don't need to manually manage each upgrade

**Acceptance Criteria:**
- [ ] Given Level 12 reached, when unlocked, then "Auto-Tinker" toggle appears on equipment pieces
- [ ] Given auto-tinker enabled, when sufficient materials available, then upgrade automatically initiates
- [ ] Given auto-tinkering, when in progress, then circular progress bar fills over 2 seconds
- [ ] Given multiple equipment pieces, when setting priority (Level 16), then materials distribute based on priority order (1-6)
- [ ] Given priority set, when materials available, then highest priority unfulfilled item receives materials
- [ ] Given Smart Tinkering unlocked (Level 20), when activated, then AI suggests optimal distribution with "Accept" button

### Epic 4: Full Automation & Endgame

**Story 4.1: Master Salvager System**
As a late-game player (Level 26+)
I want full automation with offline progression
So that I can progress even when not actively playing

**Acceptance Criteria:**
- [ ] Given Level 26 reached, when Master Salvager unlocked, then automation processes up to 100 items/second
- [ ] Given offline, when app closed, then system continues processing at 50% of active rate
- [ ] Given offline for X hours, when returning, then summary modal shows: items processed, materials gained, time elapsed
- [ ] Given queue capacity, when reached, then notification warns "Queue full: 10,000 items"
- [ ] Given queue management, when full, then oldest common items auto-salvage to make room
- [ ] Given offline gains, when exceeding 24 hours, then cap applies at 24 hours of progression (prevents exploit)

**Story 4.2: Prestige Salvaging**
As an advanced player (Level 35+)
I want meaningful choices that affect my salvaging strategy
So that I can optimize for different goals

**Acceptance Criteria:**
- [ ] Given 1000 items salvaged, when milestone reached, then prestige choice modal appears
- [ ] Given prestige choice, when presented, then 3 random options appear from pool of 12 bonuses
- [ ] Given viewing choices, when hovering, then detailed effect and duration display
- [ ] Given choice selected, when confirmed, then bonus activates with timer in UI
- [ ] Given bonus active, when timer expires, then visual effect fades and bonus deactivates
- [ ] Bonus examples: +10% materials (1hr), Next 100 = guaranteed rare (no timer), 2x tinker speed (30min)

**Story 4.3: God Mode Manual Actions**
As a max-level active player
I want extremely powerful manual abilities
So that active play remains valuable at endgame

**Acceptance Criteria:**
- [ ] Given God Click unlocked (Level 40), when activated, then next click processes 1000 items instantly
- [ ] Given God Click used, when activated, then 1-hour cooldown begins with timer display
- [ ] Given manual salvage at endgame, when clicking, then 50% chance for legendary material upgrade
- [ ] Given Master's Touch active, when manual tinkering, then can upgrade beyond normal max (+5 bonus levels)
- [ ] Given manual actions in Phase 3, when performed, then special visual effects (golden glow) distinguish from automation

### Epic 5: UI Evolution

**Story 5.1: Phase-Appropriate Interface**
As a player progressing through phases
I want the UI to match my current gameplay needs
So that I'm not overwhelmed early or under-informed late

**Acceptance Criteria:**
- [ ] Given Phase 1 (Levels 1-10), when viewing UI, then only inventory grid, material counters, and equipment slots visible
- [ ] Given Phase 2 (Levels 11-25), when UI evolves, then automation controls, progress bars, and upgrade tree appear
- [ ] Given Phase 3 (Levels 26+), when UI evolves, then command center view with statistics, efficiency metrics, and prestige options display
- [ ] Given UI transition, when phase changes, then brief animated tutorial highlights new elements
- [ ] Given any phase, when player taps "?" icon, then current phase tutorial can be replayed

**Story 5.2: Streaming Number Satisfaction**
As an idle game player
I want to see numbers increasing continuously
So that I feel progression happening

**Acceptance Criteria:**
- [ ] Given automation active (Phase 2+), when materials gained, then counter increments with smooth animation
- [ ] Given high-speed automation (Phase 3), when processing >10 items/sec, then numbers stream upward continuously
- [ ] Given power level, when increasing, then +X/hour rate displays next to total
- [ ] Given Phase 3, when viewing dashboard, then efficiency percentage (0-100%) displays based on optimal performance
- [ ] Given milestones, when reached (10k, 100k, 1M materials), then celebration animation triggers

---

## 5. Functional Requirements

### Salvaging System

- **FR-S1**: Tap-to-salvage responds within 50ms with tactile feedback (vibration on mobile)
- **FR-S2**: Each item type has unique particle effect color and intensity matching rarity
- **FR-S3**: Material collection auto-triggers after 0.5s or immediately on tap
- **FR-S4**: Salvage animation duration scales: Common 0.5s, Rare 0.7s, Epic 0.9s, Legendary 1.2s
- **FR-S5**: Material drops calculated using server-validated loot tables (prevent client manipulation)
- **FR-S6**: Inventory supports minimum 100 slots (Phase 1) scaling to 10,000 slots (Phase 3)
- **FR-S7**: Batch selection supports up to 50 items simultaneously
- **FR-S8**: Queue system processes items in FIFO order unless priority rules apply

### Tinkering System

- **FR-T1**: Equipment upgrade cost follows formula: `baseCost * (1.15 ^ currentLevel)`
- **FR-T2**: Manual tinkering applies 50% material cost discount in Phase 2+
- **FR-T3**: Success rate is 100% for Levels 1-10, introduces failure chance (90% base) at Level 11+
- **FR-T4**: Auto-tinkering processes one upgrade attempt every 2 seconds per equipment piece
- **FR-T5**: Priority system (Level 16+) supports 1-6 ranking for 6 equipment slots
- **FR-T6**: Smart Tinkering AI suggests distribution based on: current levels, material availability, cost efficiency
- **FR-T7**: Equipment power level contributes to global player power using weighted sum

### Automation System

- **FR-A1**: Automation speeds: L10 (0.33/s) → L13 (0.5/s) → L15 (1/s) → L18 (3/s) → L22 (10/s) → L26 (100/s)
- **FR-A2**: Manual click speed is always 2x current automation speed
- **FR-A3**: Combo system requires 10 manual actions within 5-second window
- **FR-A4**: Combo bonus applies 3x speed multiplier to next 10 automation cycles
- **FR-A5**: Critical salvage has 5% base chance, increased by gear bonuses, provides 5x materials
- **FR-A6**: Automation upgrade costs scale exponentially: `baseUpgradeCost * (1.5 ^ tier)`
- **FR-A7**: Offline progression calculates at 50% of active automation speed
- **FR-A8**: Offline progression caps at 24 hours of equivalent active time

### Prestige System

- **FR-P1**: Prestige triggers every 1000 items salvaged (counter persists across sessions)
- **FR-P2**: Prestige choice pool contains 12 unique bonuses, 3 randomly selected each trigger
- **FR-P3**: Bonus effects stack if same bonus selected multiple times (additive stacking)
- **FR-P4**: Timed bonuses display remaining duration in MM:SS format
- **FR-P5**: Count-based bonuses display remaining charges (e.g., "Guaranteed Rare: 47/100")
- **FR-P6**: Prestige history viewable in statistics panel (last 10 choices)

### God Mode Abilities

- **FR-G1**: God Click processes 1000 items instantly with single tap, 1-hour cooldown
- **FR-G2**: God Click cooldown persists across sessions, displays countdown timer
- **FR-G3**: Perfect Salvage grants 50% chance for legendary material on manual salvage (Phase 3)
- **FR-G4**: Master's Touch allows equipment to exceed normal max level by +5
- **FR-G5**: Master's Touch upgrades have 75% success rate, failure consumes materials
- **FR-G6**: God Mode visual effects include golden particle trails and screen border glow

### UI & Feedback Systems

- **FR-U1**: Phase 1 UI displays: 4x8 inventory grid, 3 material counters, 6 equipment slots
- **FR-U2**: Phase 2 UI adds: automation control panel, upgrade tree (12 nodes), progress bars
- **FR-U3**: Phase 3 UI adds: statistics dashboard, efficiency meter, prestige panel, streaming numbers
- **FR-U4**: Material counters support up to 999,999,999 with K/M/B suffix formatting
- **FR-U5**: Animations use device-appropriate frame rates (60 FPS target, 30 FPS minimum)
- **FR-U6**: Sound effects have 3-tier system: UI clicks (quiet), salvage effects (medium), milestone celebrations (loud)
- **FR-U7**: Haptic feedback intensity scales with action importance: tap (light), upgrade (medium), prestige (strong)

---

## 6. Non-Functional Requirements

### Performance

- **NFR-P1**: Salvage tap response time <50ms from touch to visual feedback
- **NFR-P2**: Animation frame rate maintains ≥30 FPS on devices from 2020+ (iOS 13+, Android 10+)
- **NFR-P3**: High-speed automation (100 items/sec) processes without UI stutter or dropped frames
- **NFR-P4**: Material counter updates batch at 16ms intervals (60 Hz) even during rapid gains
- **NFR-P5**: Offline progression calculation completes within 3 seconds of app resume
- **NFR-P6**: Memory footprint remains under 150MB during normal gameplay
- **NFR-P7**: Battery impact <5% per hour of active gameplay on standard devices

### Data Integrity & Security

- **NFR-S1**: Material drop rates validated server-side with signed loot table responses
- **NFR-S2**: Automation speeds validated against server-side expected ranges (±10% tolerance for latency)
- **NFR-S3**: Offline progression requires server timestamp validation to prevent clock manipulation
- **NFR-S4**: Player save data encrypted at rest using AES-256
- **NFR-S5**: Critical actions (prestige, God Click) require server confirmation before UI update
- **NFR-S6**: Inventory state syncs to server every 30 seconds during active play
- **NFR-S7**: Conflict resolution prioritizes server state if local/remote mismatch detected

### Accessibility

- **NFR-A1**: All tappable elements minimum 44x44pt touch targets (iOS HIG compliance)
- **NFR-A2**: Color blindness support: particle effects include shape differentiation (stars, circles, diamonds)
- **NFR-A3**: Screen reader support for all UI text and state changes (iOS VoiceOver, Android TalkBack)
- **NFR-A4**: Option to disable screen shake and reduce particle intensity (motion sensitivity)
- **NFR-A5**: Option to disable haptic feedback for players with haptic sensitivity
- **NFR-A6**: Minimum contrast ratio 4.5:1 for all text (WCAG AA standard)
- **NFR-A7**: Font size scaling supports system text size settings (up to 200%)

### Scalability

- **NFR-SC1**: System supports 100,000+ concurrent players processing salvage operations
- **NFR-SC2**: Inventory system scales to 10,000 items per player without performance degradation
- **NFR-SC3**: Material counter supports values up to 2^53 (JavaScript safe integer limit)
- **NFR-SC4**: Automation calculation batching for players with >1000 items queued
- **NFR-SC5**: Database queries for player state complete within 100ms at 95th percentile
- **NFR-SC6**: Server-side rate limiting: max 10 salvage operations per second per player (prevents automation exploits)

### Device & Platform Support

- **NFR-D1**: iOS 13+ (iPhone 8 and newer)
- **NFR-D2**: Android 10+ (API level 29+)
- **NFR-D3**: Minimum device specs: 2GB RAM, quad-core 1.5GHz processor
- **NFR-D4**: Graceful degradation on older devices: reduce particle count, disable motion blur
- **NFR-D5**: Portrait orientation primary, landscape orientation supported
- **NFR-D6**: Tablet layouts scale UI appropriately (larger touch targets, expanded grids)

### Reliability & Recovery

- **NFR-R1**: Auto-save player state every 10 seconds during active play
- **NFR-R2**: Failed server sync retries with exponential backoff (3 attempts max)
- **NFR-R3**: Offline queue stores up to 50 actions for sync when connectivity restored
- **NFR-R4**: Crash recovery restores to last saved state (max 10 seconds data loss)
- **NFR-R5**: Network timeout handling: operations queue locally, show "Syncing..." indicator
- **NFR-R6**: Fallback animations: if device struggles, reduce particle count dynamically

---

## 7. Scope Definition

### MVP (Must Have)

**Phase 1: Manual Foundation (P0)**
- Manual tap-to-salvage with particle effects (5 rarity types)
- Material collection (auto after 0.5s or manual tap)
- Basic tinkering: tap equipment, consume materials, upgrade with 100% success
- Material counters with popup animations
- 100-slot inventory
- Level progression 1-10 with XP from salvage actions
- First automation unlock at Level 10 (Salvage Assistant: 1 item/3s)

**Phase 2: Essential Automation (P0)**
- Automation upgrade tree: 6 tiers (Levels 10, 13, 15, 18, 22, 26)
- Manual click bonuses: 2x speed, 5% critical (5x materials)
- Auto-tinkering toggle (Level 12)
- Batch selection (Level 8): select up to 20 items
- Combo system: 10 clicks in 5s = 3x speed for 10 cycles
- Priority system for equipment (Level 16)
- UI evolution: Phase 1 → Phase 2 layouts

**Phase 3: Core Endgame (P0)**
- Master Salvager: 100 items/sec (Level 26)
- Offline progression: 50% speed, 24-hour cap
- Basic prestige system: every 1000 items, choose 1 of 3 bonuses (pool of 6)
- UI evolution: Phase 2 → Phase 3 dashboard
- Statistics panel: materials gained, items processed, time played

### Nice to Have

**Enhanced Phase 2 Features (P1)**
- Smart Tinkering AI suggestions (Level 20)
- Combo visual effects: particle trails, screen glow
- Advanced batch selection: filters (by rarity, by type)
- Material refinement: 3 common → 1 rare (Level 15)

**Enhanced Phase 3 Features (P1)**
- God Click ability: 1000 items instantly, 1-hour cooldown
- Perfect Salvage: 50% legendary upgrade chance on manual
- Master's Touch: +5 equipment levels beyond max
- Extended prestige pool: 12 unique bonuses
- Forge Mastery: 2-hour cycles with strategic choices (Level 40)
- Advanced statistics: efficiency metrics, trends, comparisons

**Polish & UX (P1)**
- Haptic feedback differentiation by action type
- Screen shake for legendary materials
- Tutorial system with replay option
- Milestone celebrations: 10K, 100K, 1M materials
- Sound effect variations (3 levels of intensity)

**Long-term Features (P2)**
- Material refinement automation (Level 30)
- Salvage filters: "Auto-salvage commons when queue >80%"
- Equipment sets: bonus for tinkering related items
- Seasonal prestige bonuses
- Leaderboards: fastest to milestones
- Social features: gift materials to friends

### Out of Scope (Current Release)

- PvP salvage racing or competitive tinkering
- Trading materials between players
- Crafting new equipment from materials (future expansion)
- Material types beyond 5 rarity tiers
- Multiple save slots or profiles
- Integration with other game systems (combat, exploration) - interface hooks only
- Web version or Steam release
- Equipment visual customization based on tinker level

---

## 8. Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Technical | Client-side animation performance on lower-end devices during 100 items/sec automation | Engineering | Progressive degradation system: reduce particle count, batch render updates | Planned |
| Technical | Server-side validation overhead for high-frequency salvage operations | Backend Team | Implement batched validation (validate every 10 operations), client-side rate limiting | Planned |
| Design | Balancing manual bonus incentives to maintain engagement in Phase 3 | Game Design | A/B test manual bonus multipliers (1.5x, 2x, 3x), monitor Phase 3 manual action rates | Research |
| Business | Monetization balance: automation shouldn't feel pay-to-win | Product Team | Free players reach full automation by Level 30, premium only accelerates by ~30% | Defined |
| Integration | Connecting salvage materials to existing equipment/power systems | Systems Team | Define clear interface: materials → equipment power → global power formula | In Progress |
| UX | Tutorial pacing for 3-phase system without overwhelming new players | UX Team | Contextual tutorials: appear only when feature unlocks, with skip option | Design Phase |
| Data | Offline progression calculation exploits (clock manipulation) | Backend Team | Server timestamp validation, max 24-hour cap, anomaly detection | Planned |

---

## 9. Timeline & Milestones

### Phase 1: Discovery & Design
**Duration: 2 weeks**
- Week 1: Finalize PRD, technical design document, UI mockups (all 3 phases)
- Week 2: Animation prototypes, balance spreadsheet, monetization integration plan

### Phase 2: Development - MVP Implementation
**Duration: 6 weeks**
- Week 3-4: Manual foundation (tap-to-salvage, tinkering, Level 1-10)
  - Deliverable: Playable Phase 1 with 10 levels
- Week 5-6: Automation systems (upgrade tree, auto-tinker, manual bonuses)
  - Deliverable: Phase 2 functional with Levels 11-25
- Week 7-8: Endgame systems (Master Salvager, offline progression, basic prestige)
  - Deliverable: Phase 3 complete with Levels 26-35
- Week 9: UI evolution, phase transitions, polish
  - Deliverable: Full UI flow from Phase 1 → Phase 3

### Phase 3: Testing & QA
**Duration: 2 weeks**
- Week 10: Internal playtesting, balance tuning, bug fixes
- Week 11: Closed beta (50 players), performance optimization, server load testing

### Phase 4: Launch Preparation
**Duration: 1 week**
- Week 12: Analytics integration, A/B test setup, app store assets, soft launch prep

**Total Estimated Time: 12 weeks (3 months)**

**Launch Target: Week 13 (soft launch), Week 14 (full launch)**

---

## 10. Open Questions

- [ ] **Integration Point**: How exactly do salvage materials map to existing equipment stat formulas? Need Systems Team input.
- [ ] **Monetization**: Should God Click be premium-only or available to all with longer cooldown? A/B test planned?
- [ ] **Balance**: What's the target materials-per-hour rate at each phase to ensure players don't feel stuck? Need economy design input.
- [ ] **Technical**: Can we achieve 100 items/sec on target devices without frame drops? Need prototype stress test.
- [ ] **UX**: Should automation be opt-in (toggle) or automatic with opt-out? User research needed.
- [ ] **Scope**: Is Master's Touch (+5 levels beyond max) creeping into P1, or can it stay P2? Discuss with stakeholders.
- [ ] **Analytics**: What are the critical events to track for Phase 2 engagement analysis? Define with data team.
- [ ] **Localization**: Do particle colors have cultural significance issues in target markets? Check with localization team.

---

## 11. Appendix

### Glossary

- **Salvage**: The act of breaking down items into component materials
- **Tinkering**: The process of applying materials to upgrade equipment
- **Automation Tier**: Progressive unlocks that increase passive salvage/tinker speed
- **Phase**: One of three gameplay stages (Manual, Hybrid, Automation) that evolve with player level
- **Prestige**: A milestone-based choice system offering temporary or permanent bonuses
- **God Click**: Endgame ability to process 1000 items with a single tap
- **Master's Touch**: Ability to upgrade equipment beyond normal maximum levels
- **Combo**: Rapid manual actions that trigger speed bonuses for automation
- **Critical Salvage**: 5% chance event that yields 5x materials
- **Perfect Salvage**: Endgame feature with 50% chance to upgrade material rarity
- **Material Rarity**: Five-tier system (Common, Rare, Epic, Legendary, Mythic)
- **Queue**: The ordered list of items awaiting automated processing
- **Offline Progression**: System that continues salvaging while app is closed

### Related Documents

- Technical Design Document (TDD): To be created from this PRD
- Game Economy Balance Spreadsheet: Materials/hour projections per level
- Animation Style Guide: Particle effects and feedback systems
- Monetization Integration Plan: Premium features and IAP tiers
- Analytics Event Specification: Tracking plan for engagement metrics
- UI/UX Mockups: Figma designs for all 3 phase interfaces

### References

- Lean Task Generation Guide: `/docs/guides/lean-task-generation-guide.md`
- Original Feature Spec: `/docs/specs/salvage-tinkering-system/salvage-tinkering-progressive-automation.md`
- Game Design Pattern: Incremental/Idle Game Mechanics (Asheron's Call crafting influence)

### Comparative Analysis

**Similar Systems in Market:**
- **AdVenture Capitalist**: Full automation focus, but lacks manual engagement depth
- **Melvor Idle**: Strong progression but overwhelming complexity early
- **Realm Grinder**: Excellent prestige system, less tactile feedback
- **Clicker Heroes**: Good manual → auto balance, but automation makes manual obsolete

**Our Differentiation**: Maintains manual value throughout all phases, progressive complexity revelation, earned automation as rewards.

---

**Document Generated**: 2025-10-26
**Next Steps**: Review with stakeholders → Technical Design Document → Prototype Phase 1 mechanics
**Estimated Development Start**: Week 1 post-approval
**Target Launch**: 12 weeks post-development start
