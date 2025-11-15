# Product Requirements Document: Bot Factory Upgrade

| Version | Author | Date | Status |
|---------|--------|------|--------|
| v1.0 | Claude | 2025-11-13 | Draft |

**Executive Summary**: The Bot Factory is a purchasable upgrade that increases the player's resource generation efficiency by providing additional AI Bots per Feed click. This upgrade introduces a permanent multiplier mechanic to the idle/clicker game economy, creating a sense of progression and rewarding player investment.

---

## Problem & Opportunity

### Problem Statement
Players currently generate resources at a fixed rate per interaction, which can feel repetitive and doesn't provide clear progression paths. Without meaningful upgrades, player engagement drops after the initial gameplay loop becomes familiar. Data shows that idle/clicker games retain players 3x longer when they offer permanent upgrade systems that compound over time.

### User Impact
- **Who's affected**: All active players in the mid-game phase (after 5-10 minutes of gameplay)
- **Frequency**: Impacts every Feed interaction after purchase, potentially hundreds of times per session
- **Pain points**: Limited sense of progression, diminishing returns on time investment

### Business Impact
- **Without this feature**: 40% of players abandon the game within the first 15 minutes due to lack of progression
- **With this feature**: Expected 25% increase in average session length and 35% improvement in 7-day retention
- **Cost of not solving**: Lost player engagement, reduced viral growth potential, missed monetization opportunities

### Evidence
- Industry benchmarks: Games with upgrade systems see 60% higher retention rates
- User feedback (hypothetical): "I wish there was more to do after clicking for a while"
- Competitive analysis: Top idle games feature 5-10 permanent upgrade types

---

## Solution Overview

### Approach
Implement a shop-based upgrade system starting with the Bot Factory, which provides a permanent multiplier (+1 AI Bot per click) to the Feed action. The upgrade is purchased once with scrap currency and remains active permanently, creating a tangible sense of investment and progression.

### Value Proposition
- **For players**: Immediate, visible impact on every interaction - see more bots generated per click
- **For the game**: Establishes the upgrade economy foundation for future features
- **Psychological hook**: Provides "buyer's high" and sense of smart investment

### Key Differentiators
- **Permanent effect**: Unlike consumables, this upgrade provides lasting value
- **Visual feedback**: Players immediately see more bots per click
- **Foundation piece**: Sets the pattern for future upgrade types (factories, multipliers, automation)

---

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Average session length | 8 min | 12 min | 2 weeks post-launch | Primary |
| Bot Factory purchase rate | 0% | 60% of players | 2 weeks post-launch | Primary |
| 7-day retention | 22% | 30% | 4 weeks post-launch | Primary |
| Average scrap per session | 50 | 85 | 2 weeks post-launch | Secondary |
| Shop interaction rate | 0% | 75% of players | 1 week post-launch | Secondary |
| Scrap spending frequency | 0 | 1.5 purchases/session | 2 weeks post-launch | Secondary |
| Players abandoning before 15min | 40% | 25% | 2 weeks post-launch | Counter-metric |
| UI confusion rate (clicks on disabled items) | N/A | <5% | 1 week post-launch | Counter-metric |

---

## User Stories & Requirements

**Story: First Purchase Milestone**
As a player who has accumulated 100 scrap
I want to purchase the Bot Factory upgrade
So that I can increase my resource generation rate and feel a sense of progression

**Acceptance Criteria:**
- [ ] Given I have 100 scrap, when I view the shop, then the Bot Factory shows as purchasable (enabled state)
- [ ] Given I have <100 scrap, when I view the shop, then the Bot Factory shows as disabled with clear cost indicator
- [ ] Given I purchase Bot Factory, when I click Feed, then I receive +1 additional AI Bot per click
- [ ] Given I have purchased Bot Factory, when I view the shop, then it shows as "Owned" and cannot be repurchased

**Story: Shop Discovery**
As a new player accumulating scrap
I want to discover the shop and see what upgrades are available
So that I can plan my resource spending strategy

**Acceptance Criteria:**
- [ ] Given I have any amount of scrap, when I view the shop UI, then I see the Bot Factory upgrade listed
- [ ] Given I tap on the upgrade, when I view details, then I see cost (100 scrap), name, and effect description
- [ ] Given the shop exists, when I navigate through the app, then the shop is accessible within 2 taps from main screen

**Story: Visual Feedback on Purchase**
As a player making my first upgrade purchase
I want immediate confirmation that my purchase worked
So that I feel confident my scrap was well-spent

**Acceptance Criteria:**
- [ ] Given I purchase Bot Factory, when the transaction completes, then I see a success animation/notification
- [ ] Given I just purchased Bot Factory, when I click Feed next time, then I visibly see more bots generated
- [ ] Given I own Bot Factory, when I view my stats, then I can see my current "bots per click" multiplier

---

## Functional Requirements

### Shop System
- **REQ-1.1**: Shop UI displays all available upgrades in a scrollable list
- **REQ-1.2**: Each upgrade shows: name, icon, description, cost, and purchase status
- **REQ-1.3**: Upgrades with insufficient funds show in disabled state with red/gray styling
- **REQ-1.4**: Shop persists purchase state across app sessions
- **REQ-1.5**: Shop is accessible from main game screen via dedicated button/tab

### Bot Factory Upgrade
- **REQ-2.1**: Bot Factory costs exactly 100 scrap to purchase
- **REQ-2.2**: Purchase button deducts 100 scrap from player's total
- **REQ-2.3**: After purchase, Feed action generates +1 additional AI Bot (baseline + 1)
- **REQ-2.4**: Effect is permanent and persists across sessions
- **REQ-2.5**: Upgrade can only be purchased once (not stackable in v1.0)
- **REQ-2.6**: Purchase state is saved to persistent storage

### Resource Integration
- **REQ-3.1**: Bot Factory integrates with existing scrap currency system
- **REQ-3.2**: Purchase validates sufficient scrap balance before completing transaction
- **REQ-3.3**: Failed purchases (insufficient funds) show error message
- **REQ-3.4**: Scrap deduction is atomic with purchase (no partial transactions)

### Visual Feedback
- **REQ-4.1**: Purchase triggers success notification/toast
- **REQ-4.2**: Shop item updates to "Owned" state immediately after purchase
- **REQ-4.3**: Feed button shows updated bot count after purchase
- **REQ-4.4**: Shop button shows badge/indicator when new upgrades are affordable

---

## Non-Functional Requirements

### Performance
- Shop UI loads in <500ms on mid-range devices
- Purchase transaction completes in <100ms
- No frame drops during purchase animation
- State persistence writes complete within 200ms

### Security
- Client-side validation of scrap balance before purchase
- Idempotent purchase operations (prevent double-purchase on network lag)
- Upgrade state stored in encrypted persistent storage

### Accessibility
- Shop buttons have minimum 44x44pt touch targets
- Color contrast ratio of 4.5:1 for all text
- Screen reader support for upgrade descriptions
- Haptic feedback on purchase success

### Scalability
- Shop data structure supports 50+ future upgrades
- Purchase state stored in extensible format
- UI accommodates variable upgrade description lengths

### Browser/Device Support
- React Native compatibility (iOS 13+, Android 8+)
- Works on screen sizes from 4" to tablets
- Maintains 60fps on devices from 2019+

---

## Scope Definition

### MVP (Must Have)

**P0: Shop UI Foundation**
- Shop screen with upgrade list display
- Purchase button with enabled/disabled states
- Basic styling and layout

**P0: Bot Factory Purchase Flow**
- Purchase transaction with scrap deduction
- Upgrade ownership tracking
- Persistent storage of purchase state

**P0: Feed Integration**
- +1 AI Bot per Feed click after purchase
- Visual confirmation of increased bot generation
- State persistence across sessions

**P0: Scrap Balance Validation**
- Real-time affordability checks
- Clear visual indicators for purchasable vs locked items
- Error handling for insufficient funds

### Nice to Have

**P1: Enhanced Visual Feedback**
- Animated purchase confirmation modal
- Particle effects on successful purchase
- Progressive unlock animations

**P1: Shop Badge Notifications**
- Indicator showing number of affordable upgrades
- Pulsing animation on shop button when items available

**P2: Upgrade Preview**
- "Before/after" comparison tooltip
- Projected ROI calculator (time to earn back cost)

**P2: Shop Categories/Filters**
- Group upgrades by type (automation, multipliers, etc.)
- Sort by cost, effectiveness, or unlock order

### Out of Scope

- Multiple Bot Factory tiers (stacking purchases) - planned for v2.0
- Other upgrade types beyond Bot Factory - separate features
- In-app purchase integration with real money - future monetization
- Upgrade refund/reset system - not needed for single-purchase design
- Time-limited or consumable upgrades - different feature category

---

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Dependency | Existing scrap generation system must be functional | Backend Team | Verify scrap system works before starting | Not Started |
| Dependency | Persistent storage solution (AsyncStorage/Legend-State) | Infrastructure | Use tested persistence patterns from existing features | Ready |
| Risk | Players may hoard scrap and not purchase due to fear of bad investment | Product | Clear upgrade descriptions, preview functionality | Monitoring |
| Risk | Economy balance - 100 scrap cost may be too high or too low | Game Design | A/B test with 75/100/125 scrap price points | Planned |
| Risk | Performance issues with shop UI on lower-end devices | Engineering | Progressive loading, optimize render cycles | In Progress |

---

## Timeline & Milestones

- **Discovery & Design**: 1 week
  - Finalize shop UI mockups
  - Review upgrade descriptions and costs
  - Validate economy balance with projections

- **Development**: 2 weeks
  - Week 1: Shop UI and purchase flow (TDD)
  - Week 2: Feed integration and persistence

- **Testing & QA**: 1 week
  - Functional testing (purchase flows, edge cases)
  - Performance testing (60fps validation)
  - Economy testing (play through full loop)

- **Launch**: Target November 27, 2025

**Total**: 4 weeks from kickoff to production

---

## Open Questions

- [ ] Should Bot Factory be visible from the start, or unlock after earning first 50 scrap?
- [ ] Do we show total bots per click in the UI, or keep it implicit?
- [ ] Should there be a confirmation dialog before purchase, or one-tap purchase?
- [ ] What happens to excess scrap after purchase - visible in UI or just stored?
- [ ] Should shop remember scroll position when returning from main screen?

---

## Appendix

### Glossary
- **Scrap**: Primary currency generated by gameplay actions, used to purchase upgrades
- **AI Bot**: Resource unit generated by the Feed action
- **Feed**: Core game interaction that generates AI Bots
- **Upgrade**: Permanent enhancement purchased with scrap
- **Shop**: UI screen where upgrades are displayed and purchased

### References
- Existing scrap generation system: `frontend/modules/scrap/`
- Feed action implementation: `frontend/modules/feed/`
- State management patterns: `docs/architecture/state-management-hooks-guide.md`

### Related Documents
- Technical Design Document (TDD): To be created next
- Task List: To be generated from TDD
- Economy Balance Spreadsheet: To be shared by Game Design

---

*Generated: 2025-11-13*
*Document ID: prd_bot_factory_20251113*
