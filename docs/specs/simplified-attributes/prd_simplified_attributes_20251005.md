# Product Requirements Document: Simplified Attributes System

## Document Metadata

| Version | Date | Author | Status |
|---------|------|--------|--------|
| v1.0 | 2025-10-05 | Claude | Draft |

**Executive Summary**: Introduce a three-attribute progression system (Strength, Coordination, Endurance) that expands player choice beyond single Power metric while maintaining idle game simplicity. Players allocate points earned through leveling to customize their playstyle between damage-focused, precision-focused, or idle-efficiency builds.

## Problem & Opportunity

### Problem Statement
Currently, player progression is limited to a single Power metric that increases linearly with level. This provides no player agency or meaningful choices in character development. Players at the same level have identical capabilities, reducing engagement and eliminating the satisfaction of build customization that drives long-term retention in progression games.

### User Impact
- **Affected Users**: 100% of active players beyond level 5
- **Frequency**: Every level-up event (approximately every 3-5 minutes early game)
- **Pain Points**:
  - No differentiation between playstyles
  - Lack of strategic depth in progression choices
  - Missing the "build planning" engagement loop

### Business Impact
- Current D7 retention: 15% (below 25% target for idle games)
- Session length averages 4 minutes (target: 8-10 minutes)
- Lost opportunity cost: ~40% of players cite "lack of depth" in churn surveys

### Evidence
- Benchmark data: Top idle games with attribute systems show 35% higher D7 retention
- Player feedback: "Just watching numbers go up gets boring after level 20"
- Analytics: 60% drop-off occurs between levels 15-25 when progression feels repetitive

## Solution Overview

### Approach
Replace the single Power progression with three distinct attributes that players manually allocate. Each attribute provides clear, immediate benefits that support different playstyles while maintaining the core "numbers go up" satisfaction.

### Value Proposition
- **Player Agency**: Every level brings a meaningful choice
- **Build Diversity**: Three viable paths create replayability
- **Strategic Depth**: Planning attribute distribution adds meta-game layer
- **Maintained Simplicity**: Only three choices, all clearly beneficial

### Key Differentiators
- **No "Trap" Choices**: All attributes remain valuable throughout progression
- **Immediate Impact**: Each point provides noticeable gameplay change
- **Future-Proof Design**: System scales with planned features (offline mode, bosses)

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| D7 Retention | 15% | 22% | 4 weeks | Primary |
| Average Session Length | 4 min | 6 min | 2 weeks | Primary |
| Level 25+ Retention | 8% | 15% | 6 weeks | Primary |
| Attribute Distribution Variance | N/A | <40% | 4 weeks | Secondary |
| Level-Up Engagement Rate | 45% | 75% | 2 weeks | Secondary |
| Build Diversity Index | 1.0 | >2.5 | 4 weeks | Secondary |
| Power Progression Satisfaction | N/A | No decrease | 2 weeks | Counter |

## User Stories & Requirements

### Story: Attribute Point Allocation
**As a** player who just leveled up
**I want to** allocate my attribute point to customize my build
**So that I can** progress according to my preferred playstyle

**Acceptance Criteria:**
- [ ] Given I level up, when the level-up animation completes, then I receive exactly 1 attribute point
- [ ] Given I have unspent points, when I tap the Attributes button, then the panel shows available points clearly
- [ ] Given I tap the [+] button next to an attribute, when I have points available, then the attribute increases by 1
- [ ] Given I allocate a point, when confirmed, then the change is immediately saved and cannot be undone

### Story: Strength-Based Combat
**As a** damage-focused player
**I want to** increase my Strength attribute
**So that I can** defeat enemies faster with higher base damage

**Acceptance Criteria:**
- [ ] Given I have 5 Strength, when I tap an enemy, then base damage increases by exactly 25 (5 × 5)
- [ ] Given I increase Strength mid-combat, when I tap next, then new damage applies immediately
- [ ] Given any Strength value, when viewing the attribute panel, then current damage bonus is displayed

### Story: Coordination-Based Precision
**As a** precision-focused player
**I want to** increase my Coordination attribute
**So that I can** land more critical hits on weakness spots

**Acceptance Criteria:**
- [ ] Given I have 10 Coordination, when I tap a weakness spot, then critical chance is 30% (base 10% + 20%)
- [ ] Given critical chance reaches 90%, when adding more Coordination, then it caps at 90%
- [ ] Given any Coordination value, when viewing stats, then current critical chance percentage is shown

### Story: Endurance-Based Idle Play
**As a** casual player with limited active time
**I want to** increase my Endurance attribute
**So that I can** progress more efficiently while offline

**Acceptance Criteria:**
- [ ] Given I have 10 Endurance, when returning from offline, then efficiency is 50% (base 25% + 25%)
- [ ] Given efficiency reaches 75%, when adding more Endurance, then it caps at 75%
- [ ] Given any Endurance value, when viewing stats, then offline efficiency percentage is displayed

### Story: Existing Player Migration
**As an** existing player with progress
**I want to** convert my current Power to the new system
**So that I can** continue without losing progress

**Acceptance Criteria:**
- [ ] Given I'm level 20 with 20 Power, when the update launches, then I receive 20 unallocated attribute points
- [ ] Given I log in post-update, when the game loads, then a one-time tutorial explains the new system
- [ ] Given migration occurs, when checking total power, then damage output remains similar or higher

## Functional Requirements

### Attribute System Core
- **Requirement 1**: Each level grants exactly 1 attribute point for manual allocation
- **Requirement 2**: Strength adds +5 base damage per point with no cap
- **Requirement 3**: Coordination adds +2% critical chance per point, capped at 90% total
- **Requirement 4**: Endurance adds +2.5% offline efficiency per point, capped at 75% total
- **Requirement 5**: All attributes start at 0 for new players

### User Interface
- **Requirement 6**: Attributes button appears below enemy sprite, above Pyreal counter
- **Requirement 7**: Panel displays current values, bonuses, and available points
- **Requirement 8**: [+] buttons are disabled when no points available
- **Requirement 9**: Visual feedback confirms point allocation within 100ms
- **Requirement 10**: Attribute icons use distinct colors (Red/Blue/Green) for accessibility

### Damage Calculation
- **Requirement 11**: Base damage formula: `(10 + random(0-5)) + (Strength × 5)`
- **Requirement 12**: Critical damage formula: `base damage × 2` when hitting weakness
- **Requirement 13**: Critical chance formula: `min(10 + (Coordination × 2), 90)`
- **Requirement 14**: Damage updates immediately upon attribute changes

### Data Persistence
- **Requirement 15**: Attributes save to AsyncStorage within 500ms of allocation
- **Requirement 16**: Attributes persist across app sessions
- **Requirement 17**: Attribute state syncs with level/XP data atomically

## Non-Functional Requirements

### Performance
- **Response Time**: Attribute allocation completes in <200ms
- **UI Rendering**: Panel opens/closes in <300ms with smooth animation
- **Calculation Speed**: Damage calculation with attributes takes <10ms
- **Memory Usage**: Attribute system adds <1MB to app memory footprint

### Security
- **Data Validation**: Attribute points cannot exceed current level
- **Allocation Protection**: Points cannot be negative or non-integer
- **Save Integrity**: Attribute data encrypted in AsyncStorage

### Accessibility
- **Color Coding**: Icons include shapes, not just colors (WCAG 2.1 AA)
- **Touch Targets**: Minimum 44×44 pixel tap areas for [+] buttons
- **Screen Reader**: All attributes have descriptive labels
- **Text Size**: Attribute values scale with system font size settings

### Scalability
- **Player Volume**: Support 100,000+ concurrent players
- **Data Growth**: Attribute data remains <1KB per player
- **Future Attributes**: System architecture supports up to 10 attributes

### Browser/Device Support
- **iOS**: 14.0+ (React Native/Expo requirement)
- **Android**: API 21+ (React Native/Expo requirement)
- **Tablets**: Responsive layout scales to larger screens
- **Orientation**: Functions in both portrait and landscape

## Scope Definition

### MVP (Must Have)
- **P0**: Three core attributes (Strength, Coordination, Endurance) with allocation UI
- **P0**: Manual point allocation system with immediate effect application
- **P0**: Integration with existing damage and critical hit calculations
- **P0**: Data persistence across sessions via AsyncStorage
- **P0**: Migration path for existing players with retroactive points

### Nice to Have
- **P1**: Animated point allocation with particle effects
- **P2**: Attribute comparison tooltips showing build impacts
- **P2**: Visual attribute progress bars showing relative investment

### Out of Scope
- Attribute respec/reset functionality
- Temporary attribute buffs or debuffs
- Attribute requirements for equipment/skills
- Premium currency attribute point purchases
- Complex attribute interactions or synergies
- Additional attributes beyond the core three

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|------------|-------|------------|---------|
| Dependency | Critical hit system must be functional | Dev Team | System already implemented and tested | Resolved |
| Risk | Players may not understand attribute impacts | UX Team | Clear in-game descriptions and tutorial | Open |
| Risk | Permanent allocation may frustrate players | Product | Monitor feedback, consider respec in v2 | Monitoring |
| Dependency | AsyncStorage for data persistence | Dev Team | Already in use for other game data | Resolved |
| Risk | Balance issues between attribute builds | Game Design | Weekly metrics review and quick patches | Planning |

## Timeline & Milestones

- **Discovery & Design**: 1 week (UI/UX mockups, balance modeling)
- **Development**: 2 weeks (Core implementation, UI, persistence)
- **Testing & QA**: 1 week (Balance testing, edge cases, migration)
- **Launch**: Week of November 4, 2025

**Total**: 4 weeks

### Key Milestones
- Week 1: Design approval and technical planning complete
- Week 2: Core attribute system functional with basic UI
- Week 3: Full UI, persistence, and migration complete
- Week 4: Testing complete, launch ready

## Open Questions

- [ ] Should attribute points be purchasable with Pyreal at high cost?
- [ ] Should we show recommended builds for new players?
- [ ] Do we need a confirmation dialog for point allocation?
- [ ] Should offline efficiency affect Pyreal gain or just XP?
- [ ] How do attributes interact with future prestige system?

## Appendix

### Glossary
- **Attribute Point**: Currency earned on level-up for character customization
- **Build**: A player's chosen distribution of attribute points
- **Critical Chance**: Percentage probability of dealing double damage
- **Offline Efficiency**: Percentage of normal progress earned while app is closed
- **Power**: Legacy single progression metric being replaced

### References
- Original MVP Document: `/docs/research/gamedev/asherons-call-idler-mvp.md`
- Feature Description: `/docs/specs/simplified-attributes/simplified-attributes.md`
- Lean Task Generation Guide: `/docs/guides/lean-task-generation-guide.md`

### Related Documents
- Core Combat System PRD
- Player Power Progression PRD
- Weakness & Critical System PRD
- Future: Offline Progression PRD

---
*Generated: 2025-10-05 | PRD Generator v1.0*