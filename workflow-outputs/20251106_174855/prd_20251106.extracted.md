# Product Requirements Document: Salvage & Tinkering System - Progressive Automation

## 1. Overview

This PRD outlines the requirements for implementing a progressive automation system for salvaging items and tinkering with equipment in an idle/incremental game. The system transitions players from satisfying manual actions through semi-automated management to full automation, following proven idle game patterns where automation feels like a meaningful achievement rather than removing gameplay.

**Core Philosophy**: Manual → Semi-Auto → Full Automation

The design respects the tactile satisfaction of early-game crafting while providing the optimization depth of late-game idle mechanics.

## 2. Goals

### Primary Goals
- Create an engaging progression from manual clicking to full automation over 15-20 hours
- Maintain player agency and satisfaction throughout all progression phases
- Implement smooth transitions between manual, hybrid, and automated gameplay
- Ensure each automation unlock feels earned and impactful

### Secondary Goals
- Support monetization opportunities at each progression phase
- Enable offline progression in late game
- Provide optimization depth for engaged players
- Create clear metrics for progression success

## 3. Scope

### In Scope

#### Phase 1: Manual Crafting (Levels 1-10)
- Click-based salvaging with immediate feedback
- Manual tinkering system with 100% success rate
- Basic particle effects and animations
- Material collection and counting
- First automation unlocks (auto-collect, batch select, first assistant)

#### Phase 2: Assisted Automation (Levels 11-25)
- Salvage automation upgrades (5 tiers)
- Tinkering automation line (3 tiers)
- Hybrid gameplay mechanics (click bonuses, combos, critical clicks)
- Material refinement system
- Salvage filter system
- Priority management for automated tinkering

#### Phase 3: Full Automation (Levels 26+)
- Complete automation systems
- Offline progression
- Prestige mechanics
- Advanced "endgame clicking" features
- Optimization tools and analytics
- Forge mastery system

#### Supporting Systems
- Progressive UI evolution (3 distinct interfaces)
- Tutorial and onboarding flow
- Analytics tracking for all three phases
- Monetization integration points

### Out of Scope

#### Initial Release
- PvP or multiplayer features
- Social/guild salvaging systems
- Equipment trading marketplace
- Multiple character slots
- Cross-platform cloud saves (can be added later)

#### Future Considerations
- Seasonal prestige events
- Salvage competitions/leaderboards
- Equipment NFT integration
- Advanced AI suggestions for optimization

## 4. Requirements

### 4.1 Functional Requirements - Phase 1 (Levels 1-10)

#### FR-P1-001: Manual Salvaging
- **Priority**: P0
- **Description**: Players must be able to click items in inventory to salvage them
- **Acceptance Criteria**:
  - Single tap/click initiates 0.5-second salvage animation
  - Animation shows item breaking apart with particle effects
  - Different item rarities produce different colored particles
  - Materials "burst out" and either auto-collect after 2 seconds or can be clicked to collect immediately
  - Empty inventory slot appears ready for next item
  - All interactions complete within 3 seconds total

#### FR-P1-002: Material System
- **Priority**: P0
- **Description**: Track and display materials earned from salvaging
- **Acceptance Criteria**:
  - Support minimum 3 material tiers: Common, Rare, Epic
  - Material counters update with satisfying number popup animation
  - Rare material drops trigger screen flash and special sound
  - Material counts persist between sessions
  - Display current material counts prominently in UI

#### FR-P1-003: Manual Tinkering
- **Priority**: P0
- **Description**: Players can upgrade equipment using collected materials
- **Acceptance Criteria**:
  - Drag-and-drop OR button-based material application to equipment
  - 2-second "channeling" animation with progress bar
  - 100% success rate for Phase 1 tinkering
  - Clear display of "+1" or improvement on equipment
  - Power level increases visibly with each upgrade
  - Cost increases predictably with each tier

#### FR-P1-004: Auto-Collect Unlock (Level 5)
- **Priority**: P0
- **Description**: First efficiency upgrade - materials automatically collected
- **Acceptance Criteria**:
  - Unlocks at level 5
  - Materials fly to inventory after 0.5 seconds automatically
  - Visual indication of unlock achievement
  - Players can still manual-click for immediate collection

#### FR-P1-005: Batch Select (Level 8)
- **Priority**: P0
- **Description**: Multi-select salvage capability
- **Acceptance Criteria**:
  - Shift-click or checkbox to select multiple items
  - "Salvage All Selected" button appears when 2+ items selected
  - Processes all selected items sequentially with animations
  - Can cancel batch operation mid-process

#### FR-P1-006: Salvage Assistant (Level 10)
- **Priority**: P0
- **Description**: First automation milestone
- **Acceptance Criteria**:
  - Unlocks at level 10 with major celebration
  - Automatically salvages 1 item every 3 seconds
  - Player can still manual-click to salvage faster
  - Clear visual indicator of assistant working
  - Toggle to enable/disable assistant

### 4.2 Functional Requirements - Phase 2 (Levels 11-25)

#### FR-P2-001: Salvage Automation Progression
- **Priority**: P0
- **Description**: Five-tier automation upgrade path
- **Acceptance Criteria**:
  - Level 11: Basic Assistant (1 item/3 sec)
  - Level 13: Skilled Assistant (1 item/2 sec)
  - Level 15: Expert Assistant (1 item/1 sec)
  - Level 18: Salvage Team (3 items/sec)
  - Level 22: Salvage Factory (10 items/sec)
  - Each upgrade visually distinguishable
  - Clear progress tracking between tiers

#### FR-P2-002: Auto-Tinker System
- **Priority**: P0
- **Description**: Automated tinkering with player control
- **Acceptance Criteria**:
  - Level 12: Auto-Tinker toggle unlocks
  - Player sets target equipment piece
  - Automatically consumes materials when available
  - Visual progress bar shows upgrade progress
  - Can override at any time with manual tinkering

#### FR-P2-003: Priority System (Level 16)
- **Priority**: P0
- **Description**: Queue management for automated tinkering
- **Acceptance Criteria**:
  - Drag-to-reorder equipment priority
  - Auto-tinker follows priority order
  - Materials distributed according to priorities
  - Override priority with manual actions
  - Save priority settings between sessions

#### FR-P2-004: Smart Tinkering (Level 20)
- **Priority**: P1
- **Description**: AI suggests optimal material distribution
- **Acceptance Criteria**:
  - Analyzes current equipment and materials
  - Presents 1-click suggestion for optimal distribution
  - Learn from player's manual choices over time
  - Clear explanation of why suggestion is optimal
  - Can ignore suggestions without penalty

#### FR-P2-005: Hybrid Gameplay Mechanics
- **Priority**: P0
- **Description**: Bonus systems that reward manual play
- **Acceptance Criteria**:
  - Manual clicks 2x faster than automation
  - Combo system: 10 quick clicks trigger 5-second speed burst
  - Critical clicks: 5% chance for 5x materials on manual salvage
  - Active tinkering: Manual tinkering 50% cheaper than auto
  - All bonuses clearly telegraphed and celebrated

#### FR-P2-006: Material Refinement (Level 15)
- **Priority**: P1
- **Description**: Convert lower-tier materials to higher tiers
- **Acceptance Criteria**:
  - Manual refinement: 3 common → 1 rare
  - Clear UI for refinement process
  - Level 20: Auto-refiner unlocks
  - Configurable auto-refinement rules
  - Prevents accidental material loss

#### FR-P2-007: Salvage Filters (Level 18)
- **Priority**: P1
- **Description**: Rule-based automated salvaging
- **Acceptance Criteria**:
  - Set rules like "Auto-salvage all commons"
  - Rarity-based filtering
  - Item-type based filtering
  - Whitelist system to protect specific items
  - Clear visual indication of filtered items

### 4.3 Functional Requirements - Phase 3 (Levels 26+)

#### FR-P3-001: Master Salvager (Level 26)
- **Priority**: P0
- **Description**: Complete automation unlock
- **Acceptance Criteria**:
  - Process up to 100 items/second
  - Queue holds 10,000 items minimum
  - Offline progression activated
  - Materials accumulate during offline time (with reasonable caps)
  - Summary screen on return showing offline gains

#### FR-P3-002: Grand Tinkermaster (Level 30)
- **Priority**: P0
- **Description**: Full equipment management automation
- **Acceptance Criteria**:
  - Manages all equipment simultaneously
  - Predictive AI calculates optimal upgrade paths
  - Perfect material distribution (no waste)
  - Real-time adjustment based on new materials
  - Can still manual override for specific cases

#### FR-P3-003: Prestige Salvaging (Level 35)
- **Priority**: P1
- **Description**: Meta-progression bonus system
- **Acceptance Criteria**:
  - Every 1000 items salvaged triggers prestige choice
  - Choose 1 of 3 rotating bonuses:
    * +10% all materials for 1 hour
    * Next 100 salvages guaranteed rare
    * Double tinkering speed for 30 minutes
  - Bonuses stack with existing effects
  - Clear timer displays for active bonuses

#### FR-P3-004: Forge Mastery (Level 40)
- **Priority**: P2
- **Description**: Periodic massive upgrade cycles
- **Acceptance Criteria**:
  - Automated forge cycle every 2 hours
  - Player chooses focus before each cycle (damage/defense/speed)
  - Results apply across all equipment
  - Creates noticeable power spikes
  - Can manually trigger with premium currency

#### FR-P3-005: Endgame Clicking Features
- **Priority**: P1
- **Description**: Keep manual actions relevant at endgame
- **Acceptance Criteria**:
  - **God Click**: Processes 1000 items instantly (1hr cooldown)
  - **Perfect Salvage**: 50% chance for legendary materials on manual salvage
  - **Master's Touch**: Manual tinkering can exceed normal upgrade limits
  - All features clearly explained in tutorial
  - Visual spectacle for each activation

### 4.4 UI/UX Requirements

#### UR-001: Phase 1 UI - Hands-On Interface
- **Priority**: P0
- **Description**: Simple, direct manipulation interface
- **Acceptance Criteria**:
  - Grid-based inventory (minimum 20 slots visible)
  - Large, tappable salvage buttons
  - Prominent material counters
  - Equipment slots with drag-and-drop targets
  - Clear tutorial overlays for first-time actions

#### UR-002: Phase 2 UI - Management Dashboard
- **Priority**: P0
- **Description**: Expanded interface with automation controls
- **Acceptance Criteria**:
  - Auto-salvage status panel (on/off, speed, queue count)
  - Progress bar for automation actions
  - Detailed material breakdown with icons
  - Equipment grid with priority indicators
  - Automation upgrade tree visualization

#### UR-003: Phase 3 UI - Command Center
- **Priority**: P0
- **Description**: Information-dense optimization interface
- **Acceptance Criteria**:
  - Real-time stats (items/sec, efficiency %, queue size)
  - Streaming number displays for material flows
  - Power level with growth rate (+X/hour)
  - Strategic control panel with presets
  - Statistics and analytics screens
  - Prestige countdown timers

#### UR-004: UI Transition System
- **Priority**: P1
- **Description**: Smooth evolution between UI phases
- **Acceptance Criteria**:
  - Gradual introduction of new UI elements
  - Tutorial callouts for each new element
  - Optional "classic view" toggle for veterans
  - Consistent core elements across all phases

### 4.5 Progression & Balance Requirements

#### PB-001: Level Progression Pacing
- **Priority**: P0
- **Description**: Controlled progression through phases
- **Acceptance Criteria**:
  - Phase 1 (Levels 1-10): 15-20 minutes
  - Phase 2 (Levels 11-25): 4-8 hours
  - Phase 3 (Level 26-40): 15-20 hours
  - Level-up triggers feel achievable but meaningful
  - XP curves prevent excessive grinding

#### PB-002: Material Balance
- **Priority**: P0
- **Description**: Material drop rates and consumption rates balanced
- **Acceptance Criteria**:
  - Common materials: abundant, low value
  - Rare materials: regular drops, meaningful value
  - Epic materials: exciting drops, high value
  - Legendary materials: rare, game-changing
  - Tinkering costs scale with availability

#### PB-003: Automation Cost Balance
- **Priority**: P0
- **Description**: Automation upgrades feel earned
- **Acceptance Criteria**:
  - Each automation unlock requires meaningful material investment
  - Cost increases exponentially with tier
  - Player should feel automation has been "earned" through effort
  - No pay-to-skip progression gates (can accelerate only)

### 4.6 Analytics & Metrics Requirements

#### AM-001: Phase 1 Success Metrics
- **Priority**: P0
- **Description**: Track early engagement
- **Acceptance Criteria**:
  - Track: % players who salvage 100 items manually
  - Track: % players who complete first tinkering
  - Track: Average session length in Phase 1
  - Target: 80% salvage 100 items
  - Target: 90% complete first tinkering
  - Target: 10-15 minute average session

#### AM-002: Phase 2 Success Metrics
- **Priority**: P0
- **Description**: Track hybrid engagement
- **Acceptance Criteria**:
  - Track: % players who unlock first automation
  - Track: % players who use both manual and auto in same session
  - Track: Average session length in Phase 2
  - Target: 70% unlock automation
  - Target: 60% use hybrid approach
  - Target: 20-30 minute average session

#### AM-003: Phase 3 Success Metrics
- **Priority**: P0
- **Description**: Track retention and optimization
- **Acceptance Criteria**:
  - Track: % players who reach full automation
  - Track: % players who engage with prestige
  - Track: % players who return daily after 1 month
  - Target: 50% reach full automation
  - Target: 40% engage with prestige
  - Target: 30% daily return after 1 month

#### AM-004: Monetization Metrics
- **Priority**: P1
- **Description**: Track conversion and spend
- **Acceptance Criteria**:
  - Track conversion rate by phase
  - Track average spend per paying user
  - Track most popular purchase by phase
  - Track correlation between purchase and retention

### 4.7 Monetization Requirements

#### MR-001: Phase 1 Monetization
- **Priority**: P1
- **Description**: Acceleration and convenience
- **Acceptance Criteria**:
  - **Energy Boosts**: Increase click speed 50% for 1 hour ($0.99)
  - **Starter Packs**: 500 common, 50 rare materials ($2.99)
  - **Salvage Hammer**: +50% materials for 1 hour ($1.99)
  - Non-intrusive offer placement
  - Clear value proposition

#### MR-002: Phase 2 Monetization
- **Priority**: P1
- **Description**: Progression acceleration
- **Acceptance Criteria**:
  - **Automation Accelerator**: Unlock automation 5 levels early ($9.99)
  - **Queue Expander**: 2x queue capacity (permanent, $4.99)
  - **Speed Demon**: 2x automation speed for 4 hours ($3.99)
  - **Weekly Pass**: All Phase 2 bonuses for 7 days ($7.99)

#### MR-003: Phase 3 Monetization
- **Priority**: P1
- **Description**: Optimization and prestige
- **Acceptance Criteria**:
  - **Offline Maximizer**: 2x offline gains (permanent, $14.99)
  - **Perfect Settings**: AI optimization unlocked early ($9.99)
  - **Prestige Tokens**: Choose 2 of 3 prestige bonuses (consumable, $2.99)
  - **VIP Pass**: All bonuses + exclusive prestige options ($29.99/month)

#### MR-004: Monetization Guidelines
- **Priority**: P0
- **Description**: Ethical monetization standards
- **Acceptance Criteria**:
  - Never gate core progression behind paywall
  - All purchases are acceleration, not requirement
  - Clear "no purchase" path to endgame
  - No psychological manipulation tactics
  - Transparent pricing and value

## 5. Non-Functional Requirements

### NFR-001: Performance
- **Priority**: P0
- UI must remain responsive at 60fps with 100 items/sec processing
- Animation frame drops < 1% of the time
- Load time < 3 seconds on average mobile device
- Memory usage < 150MB on mobile devices

### NFR-002: Offline Progression
- **Priority**: P0
- Accurately calculate offline gains up to 24 hours
- Cap offline gains at reasonable limits to prevent exploitation
- Present offline gains summary on return
- Sync offline data without conflicts

### NFR-003: Save Data Integrity
- **Priority**: P0
- Auto-save every 30 seconds
- Cloud backup every 5 minutes (if enabled)
- Validate save data on load
- Rollback to previous save if corruption detected
- Never lose more than 30 seconds of progress

### NFR-004: Accessibility
- **Priority**: P1
- Support screen readers for all UI elements
- Colorblind-friendly material colors
- Adjustable text size (small/medium/large)
- Optional reduced motion mode
- Touch target minimum 44x44 points

### NFR-005: Localization
- **Priority**: P2
- Support English at launch
- Architecture supports additional languages
- Number formatting respects locale
- Cultural appropriateness review for art assets

## 6. Success Metrics

### Player Engagement
- **Phase 1 Completion**: 75% of players reach Level 10
- **Phase 2 Engagement**: 60% of players reach Level 20
- **Phase 3 Retention**: 40% of players reach Level 30

### Session Metrics
- **D1 Retention**: > 50%
- **D7 Retention**: > 30%
- **D30 Retention**: > 15%
- **Average Session Length**: 20-25 minutes across all phases

### Monetization Metrics
- **Conversion Rate**: 3-5% (free to paying)
- **ARPU**: $0.50+ after 30 days
- **ARPPU**: $15+ for paying users after 30 days
- **LTV**: $5+ per user after 90 days

### Satisfaction Metrics
- **Tutorial Completion**: > 85%
- **App Store Rating**: > 4.0 stars
- **NPS Score**: > 40
- **Support Ticket Rate**: < 5% of players

## 7. Technical Considerations

### Architecture
- **State Management**: Centralized state for materials, equipment, automation settings
- **Save System**: JSON-based save with compression and validation
- **Animation System**: Pooled particle systems for performance
- **Automation Engine**: Tick-based with configurable rates

### Platform Support
- **Primary**: iOS and Android (React Native)
- **Minimum iOS**: 13.0
- **Minimum Android**: 8.0 (API 26)
- **Screen Sizes**: Support 4" to 7" displays optimally

### Technology Stack
- **Framework**: React Native with Expo
- **State**: Zustand or Redux for global state
- **Animations**: React Native Reanimated 2
- **Backend**: Firebase or Supabase for cloud saves, analytics
- **Analytics**: Mixpanel or Amplitude
- **Monetization**: RevenueCat for IAP management

### Data Model
```typescript
// Core data structures
interface PlayerState {
  level: number;
  experience: number;
  materials: MaterialInventory;
  equipment: Equipment[];
  automationUnlocks: AutomationState;
  prestigeProgress: PrestigeState;
}

interface MaterialInventory {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
}

interface AutomationState {
  salvageSpeed: number; // items per second
  autoTinkerEnabled: boolean;
  priorities: EquipmentPriority[];
  filters: SalvageFilter[];
}
```

### Security Considerations
- **Client-side validation**: All progression
- **Server-side verification**: IAP receipts, cloud saves
- **Anti-cheat**: Sanity checks on save data (progression rate limits)
- **Privacy**: GDPR/CCPA compliant data handling

## 8. Dependencies

### Internal Dependencies
- Core combat system (provides items to salvage)
- Equipment system (receives tinkering upgrades)
- Player progression system (levels unlock automations)
- Tutorial system (teaches mechanics)

### External Dependencies
- Payment gateway (Apple/Google IAP)
- Analytics service (event tracking)
- Cloud save service (cross-device sync)
- Push notification service (offline progression alerts)

### Third-Party Libraries
- React Native Reanimated (animations)
- React Native Gesture Handler (interactions)
- AsyncStorage or MMKV (local persistence)
- RevenueCat (monetization)

## 9. Risks & Mitigations

### Risk: Progression Pacing Too Slow
- **Impact**: High - Players quit before reaching automation
- **Probability**: Medium
- **Mitigation**: Extensive playtesting, adjustable pacing parameters, A/B test different curves

### Risk: Automation Removes Fun
- **Impact**: High - Core loop loses engagement
- **Probability**: Medium
- **Mitigation**: Hybrid mechanics, endgame clicking bonuses, prestige choices maintain agency

### Risk: Material Balance Issues
- **Impact**: Medium - Grinding or bottlenecks frustrate players
- **Probability**: High
- **Mitigation**: Simulation testing, live tuning capability, player feedback loops

### Risk: Monetization Feels Predatory
- **Impact**: High - Negative reviews, poor retention
- **Probability**: Low
- **Mitigation**: Ethical guidelines, external review, clear free-to-play path

### Risk: Technical Performance at Scale
- **Impact**: Medium - Poor experience on lower-end devices
- **Probability**: Medium
- **Mitigation**: Performance profiling, device testing matrix, scalable particle systems

## 10. Timeline

### Phase 1: Foundation (Weeks 1-4)
- **Week 1**: Core salvaging mechanics, manual tinkering
- **Week 2**: Particle effects, animations, satisfaction feedback
- **Week 3**: First automation unlocks (auto-collect through assistant)
- **Week 4**: Phase 1 polish, tutorial, analytics integration

### Phase 2: Automation Systems (Weeks 5-8)
- **Week 5**: Salvage automation progression (5 tiers)
- **Week 6**: Tinkering automation, priority system
- **Week 7**: Hybrid mechanics (combos, bonuses), refinement system
- **Week 8**: Phase 2 polish, UI evolution, filter system

### Phase 3: Endgame & Optimization (Weeks 9-12)
- **Week 9**: Full automation, offline progression
- **Week 10**: Prestige system, forge mastery
- **Week 11**: Endgame clicking features, command center UI
- **Week 12**: Phase 3 polish, analytics review, optimization

### Phase 4: Launch Prep (Weeks 13-16)
- **Week 13**: Monetization integration, IAP testing
- **Week 14**: Balance tuning based on playtesting
- **Week 15**: Performance optimization, bug fixes
- **Week 16**: Soft launch preparation, final polish

### Post-Launch
- **Week 17-20**: Monitoring, hotfixes, balance adjustments
- **Month 2+**: Feature iterations based on live data

## 11. Open Questions

1. **Prestige System Depth**: Should prestige reset progress, or just add bonuses?
2. **Social Features**: Any guilds/friends integration in future phases?
3. **Live Events**: Seasonal content or limited-time automation bonuses?
4. **Equipment Diversity**: How many equipment pieces should players manage?
5. **Material Cap**: Should materials have storage limits to encourage spending?
6. **Automation AI**: How sophisticated should the "smart tinkering" suggestions be?
7. **Cross-Progression**: Cloud saves optional or required?
8. **Ads Integration**: Rewarded ads for temporary boosts, or strictly IAP?

## 12. Appendices

### Appendix A: Key Design Principles
1. **Respect the Click**: Manual action always has value, even in late game
2. **Earned Automation**: Each automation is a reward, not a given
3. **Progressive Complexity**: New systems appear as old ones become routine
4. **Player Agency**: Automation assists, never replaces decision-making
5. **Satisfaction First**: Every interaction produces positive feedback

### Appendix B: Competitive Analysis
- **Clicker Heroes**: Strong automation progression but less manual endgame relevance
- **Idle Miner Tycoon**: Excellent prestige loops, we can learn from their bonus structure
- **Realm Grinder**: Complex automation trees, inspiration for our unlock system
- **AdVenture Capitalist**: Clear progression visualization, good for our UI evolution
- **Melvor Idle**: Offline progression done right, model for our Phase 3

### Appendix C: User Stories

**As a new player**, I want to feel satisfying feedback when I salvage items, so that I understand the system and want to continue playing.

**As a mid-game player**, I want to balance manual clicking for bonuses with automation efficiency, so that I feel engaged without being required to constantly tap.

**As an endgame player**, I want to optimize my automation settings and prestige choices, so that I can push my power level to new heights.

**As a paying player**, I want my purchases to feel valuable and accelerate my progress, so that I feel good about supporting the game without feeling required to pay.

### Appendix D: Glossary

- **Salvage**: Breaking down items into component materials
- **Tinkering**: Using materials to upgrade equipment
- **Automation**: Systems that perform actions without player input
- **Prestige**: Meta-progression system that provides temporary powerful bonuses
- **Hybrid Gameplay**: Combining manual actions with automation for optimal results
- **Forge Mastery**: Periodic mass upgrade cycles in late game
- **Material Refinement**: Converting lower-tier materials to higher tiers

---

**Document Version**: 1.0
**Last Updated**: 2025-11-06
**Owner**: Product Team
**Status**: Draft for Review
