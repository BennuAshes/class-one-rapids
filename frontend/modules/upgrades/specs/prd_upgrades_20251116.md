# Product Requirements Document: Shop Upgrades System

| Version | Author | Date | Status |
|---------|--------|------|--------|
| v1.0 | Claude Code | 2025-11-16 | Draft |

## Executive Summary

A permanent upgrade system that enables players to spend scrap on meaningful progression enhancements. This system introduces five distinct upgrades across two categories: Scrap Efficiency (boosting AI Pet scrap generation) and Pet Acquisition (increasing pets gained per feed). All upgrades are one-time purchases that provide permanent passive bonuses, creating strategic resource management and progression depth.

---

## Problem & Opportunity

### Problem Statement

Players have access to the shop screen and can accumulate scrap, but currently have no upgrades to purchase. While the shop infrastructure exists, it displays an empty state, leaving players without meaningful progression options. The scrap currency accumulates but cannot be converted into gameplay improvements, limiting long-term engagement and strategic depth.

### User Impact

**Who's Affected**: All players who have accessed the shop screen and accumulated scrap

**Frequency**: Players encounter this gap every time they visit the shop, which occurs multiple times per session as they check for spending opportunities

**Current Metrics** (Hypothetical):
- 100% shop visit rate results in empty state experience
- 0% scrap spend rate (no upgrades available to purchase)
- Player confusion around "what do I do with scrap?" peaks after first shop visit
- Session length plateaus after 5-8 minutes when players realize progression is limited

### Business Impact

**Cost of Not Solving**:
- Mid-game churn at 45-60% when players exhaust shallow progression (no upgrade depth)
- Session length stagnation at 8 minutes without strategic decisions
- Lack of resource sink leads to scrap inflation (balancing nightmare for future features)
- Negative perception: "Shop exists but is empty" feels worse than no shop at all
- Competitive disadvantage vs idle games with standard upgrade progression trees

### Evidence

Hypothetical metrics indicating urgency:
- 68% of players who visit shop never return after seeing empty state
- Average scrap accumulation: 2,400 (well above upgrade cost threshold but no outlet)
- 0% of players exhibit strategic scrap management behavior (saving vs spending decisions)
- User feedback: "Shop says coming soon but when?" appears in 34% of reviews

---

## Solution Overview

### Approach

Implement a complete upgrade purchasing and effect system featuring:

1. **Five Defined Upgrades** with balanced progression:
   - **Scrap Finder** (100 scrap): +10% scrap generation
   - **Scrap Magnet** (500 scrap): +15% scrap generation
   - **Scrap Amplifier** (2,000 scrap): +25% scrap generation
   - **Extra Feed** (200 scrap): +1 AI Pet per feed
   - **Double Feed** (1,000 scrap): +2 AI Pets per feed

2. **Purchase System** with validation:
   - Check sufficient scrap balance
   - Verify upgrade not already purchased
   - Deduct scrap cost atomically
   - Persist purchase permanently

3. **Effect Application**:
   - Scrap multipliers automatically boost AI Pet scrap generation
   - Pet bonuses immediately increase pets gained per feed button press
   - Effects compound (all purchased upgrades stack)

4. **UI Integration**:
   - Display upgrades in shop screen (categorized by type)
   - Show purchase status (available, purchased, insufficient scrap)
   - Visual feedback for successful purchase
   - Clear communication of upgrade effects

### Value Proposition

**For Players**:
- Strategic resource management: choose between scrap efficiency (passive scaling) vs pet acquisition (active scaling)
- Permanent progression: purchases persist across sessions, providing lasting value
- Clear ROI: understand exactly what each scrap expenditure achieves
- Sense of achievement: visible milestones as upgrade tiers unlock

**For Product**:
- Proven idle game monetization pattern (resource sink → balanced economy)
- Engagement hook: strategic decisions increase session depth and return visits
- Data-driven balancing: track which upgrades purchased in what order
- Foundation for expanded progression (future upgrade tiers, categories, prestige systems)

### Key Differentiators

- **Two-path strategy**: Players choose active (pet acquisition) or passive (scrap efficiency) based on playstyle
- **Exponential pricing**: Later upgrades require significantly more scrap but provide better value per scrap spent
- **Permanent effects**: No subscriptions, no timers—purchased upgrades work forever
- **Transparent math**: All effects shown as clear percentages/absolute bonuses, no hidden calculations

---

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Upgrade purchase rate | 0% (unavailable) | 75% of players purchase at least 1 upgrade within first 3 sessions | 2 weeks post-launch | Primary |
| Average upgrades owned | 0 | 2.5 upgrades per active player | 4 weeks post-launch | Primary |
| Scrap spend rate | 0% | 60% of accumulated scrap spent on upgrades | 4 weeks post-launch | Primary |
| Session length | 8 minutes avg | 14 minutes avg (strategic planning adds depth) | 6 weeks post-launch | Primary |
| Progression depth | 0 tiers | 80% of players unlock tier 2 upgrade (500+ scrap) | 6 weeks post-launch | Secondary |
| Path diversity | N/A | 55/45 split between scrap-first vs pet-first strategies | 4 weeks post-launch | Secondary |
| Repeat shop visits | 1.2 per session | 3.5 per session (checking purchase affordability) | 2 weeks post-launch | Secondary |
| Purchase regret rate | N/A | <5% (players reporting wishing they bought different upgrade) | 8 weeks post-launch | Counter-metric |
| Balance complaints | N/A | <10% (one upgrade path feels "mandatory" or "useless") | 6 weeks post-launch | Counter-metric |

---

## User Stories & Requirements

### Story 1: Purchase Scrap Efficiency Upgrade

**As a** player with 100+ scrap
**I want to** purchase "Scrap Finder" to increase scrap generation
**So that I can** accelerate my passive income from AI Pets

**Acceptance Criteria:**
- [ ] Given I have 100+ scrap, when I view the shop, then "Scrap Finder" shows as available for 100 scrap
- [ ] Given I tap "Scrap Finder" purchase button, when the transaction completes, then my scrap decreases by 100
- [ ] Given I purchase "Scrap Finder", when the transaction completes, then my scrap-per-pet rate increases by 10%
- [ ] Given I purchase "Scrap Finder", when I return to the shop, then "Scrap Finder" shows as "Purchased" and cannot be bought again
- [ ] Given I have "Scrap Finder", when I close and reopen the app, then my purchase persists and effects remain active

### Story 2: Purchase Pet Acquisition Upgrade

**As a** player with 200+ scrap
**I want to** purchase "Extra Feed" to gain more pets per tap
**So that I can** build my AI Pet collection faster

**Acceptance Criteria:**
- [ ] Given I have 200+ scrap, when I view the shop, then "Extra Feed" shows as available for 200 scrap
- [ ] Given I tap "Extra Feed" purchase button, when the transaction completes, then my scrap decreases by 200
- [ ] Given I purchase "Extra Feed", when I press the feed button, then I gain base pets + 1 additional pet per press
- [ ] Given I purchase "Extra Feed", when I return to the shop, then "Extra Feed" shows as "Purchased"
- [ ] Given I have "Extra Feed", when I restart the app, then my purchase persists and I continue gaining +1 pet per feed

### Story 3: Strategic Upgrade Planning

**As a** player with limited scrap
**I want to** compare upgrade options and costs
**So that I can** make informed decisions about which upgrade to purchase first

**Acceptance Criteria:**
- [ ] Given I view the shop, when I see upgrades, then each displays: name, cost, effect description, and category
- [ ] Given I have 150 scrap, when I view the shop, then I can clearly see which upgrades I can afford (100 scrap) vs cannot afford (200+ scrap)
- [ ] Given I see an upgrade I cannot afford, when I view it, then it shows how much more scrap I need
- [ ] Given I see upgrade categories (Scrap Efficiency vs Pet Acquisition), when I view the shop, then upgrades are visually grouped or labeled by category

### Story 4: Upgrade Effect Stacking

**As a** player who has purchased multiple upgrades
**I want to** see all my upgrade effects combine
**So that I can** understand my total progression bonuses

**Acceptance Criteria:**
- [ ] Given I purchase "Scrap Finder" (+10%) and "Scrap Magnet" (+15%), when I generate scrap from AI Pets, then I receive base scrap × 1.25 (25% total bonus)
- [ ] Given I purchase "Extra Feed" (+1) and "Double Feed" (+2), when I press feed, then I gain base pets + 3 additional pets
- [ ] Given I have multiple scrap upgrades, when I view my stats, then I can see my total scrap multiplier
- [ ] Given I have multiple pet upgrades, when I view my stats, then I can see my total pet bonus per feed

### Story 5: Upgrade Progression Path

**As a** player progressing through the game
**I want to** work toward higher-tier upgrades
**So that I can** achieve meaningful long-term goals

**Acceptance Criteria:**
- [ ] Given I have 100 scrap, when I start purchasing upgrades, then I can afford tier 1 upgrades (100-200 scrap)
- [ ] Given I accumulate 500-1,000 scrap, when I return to the shop, then tier 2 upgrades (500-1,000 scrap) become affordable
- [ ] Given I accumulate 2,000+ scrap, when I reach late game, then tier 3 upgrades (2,000 scrap) become available
- [ ] Given I purchase all 5 upgrades, when I view the shop, then all show as "Purchased" and the shop shows completion state

---

## Functional Requirements

### Upgrade Definitions

- **UPG-DEF-1**: System supports exactly 5 upgrades as defined in feature specification
- **UPG-DEF-2**: Each upgrade has unique ID, name, description, scrap cost, effect type, effect value, and category
- **UPG-DEF-3**: Scrap efficiency upgrades use `scrapMultiplier` effect type with decimal percentage values (0.1 = 10%)
- **UPG-DEF-4**: Pet acquisition upgrades use `petBonus` effect type with integer values (1 = +1 pet per feed)
- **UPG-DEF-5**: Upgrade definitions are immutable after purchase (no retroactive balance changes to owned upgrades)

### Purchase System

- **UPG-PUR-1**: Validate player has sufficient scrap before allowing purchase
- **UPG-PUR-2**: Validate upgrade has not been purchased previously
- **UPG-PUR-3**: Deduct scrap cost from player balance atomically with purchase transaction
- **UPG-PUR-4**: Add upgrade ID to purchased upgrades list upon successful purchase
- **UPG-PUR-5**: Persist purchased upgrades to local storage (AsyncStorage) with debounce (1000ms)
- **UPG-PUR-6**: Storage key: `purchased-upgrades-v1` for versioned persistence
- **UPG-PUR-7**: Prevent double-purchase through button disable state during transaction

### Effect Application

- **UPG-EFF-1**: Calculate total scrap multiplier by summing all purchased scrapMultiplier upgrade values
- **UPG-EFF-2**: Apply total scrap multiplier to AI Pet scrap generation rate
- **UPG-EFF-3**: Calculate total pet bonus by summing all purchased petBonus upgrade values
- **UPG-EFF-4**: Apply total pet bonus to feed button click output
- **UPG-EFF-5**: Effects apply immediately upon purchase (no restart required)
- **UPG-EFF-6**: Effects persist across app sessions (loaded from AsyncStorage on app launch)
- **UPG-EFF-7**: Use computed observables to auto-recalculate effects when purchases change

### Shop UI Integration

- **UPG-UI-1**: Display all unpurchased upgrades in shop screen
- **UPG-UI-2**: Show upgrade name, description, scrap cost, and effect for each item
- **UPG-UI-3**: Visually distinguish affordable upgrades (sufficient scrap) from unaffordable upgrades
- **UPG-UI-4**: Group or label upgrades by category (Scrap Efficiency vs Pet Acquisition)
- **UPG-UI-5**: Show "Purchase" button for affordable, unpurchased upgrades
- **UPG-UI-6**: Show "Purchased" or checkmark state for owned upgrades
- **UPG-UI-7**: Show "Insufficient Scrap" state for unaffordable upgrades
- **UPG-UI-8**: Display visual feedback (animation, toast, or confirmation) on successful purchase
- **UPG-UI-9**: Remove purchased upgrades from available list (filter out owned upgrades)

### State Management

- **UPG-STATE-1**: Store purchased upgrade IDs in Legend State observable array
- **UPG-STATE-2**: Provide computed observable for available upgrades (all upgrades minus purchased)
- **UPG-STATE-3**: Provide computed observable for total scrap multiplier effect
- **UPG-STATE-4**: Provide computed observable for total pet bonus effect
- **UPG-STATE-5**: Sync purchased upgrades observable with AsyncStorage persistence layer
- **UPG-STATE-6**: Load purchased upgrades from AsyncStorage on app initialization

---

## Non-Functional Requirements

### Performance

- **60fps UI**: Purchase button press and shop list rendering must maintain 60fps
- **<100ms Purchase**: Purchase transaction must complete within 100ms (scrap deduction, state update, UI feedback)
- **<200ms Persistence**: AsyncStorage write must complete within 200ms with debounce to batch rapid purchases
- **Instant Effect Application**: Upgrade effects must apply to next scrap generation tick or feed press immediately

### Data Integrity

- **Atomic Transactions**: Scrap deduction and purchase recording must be atomic (no partial state)
- **Idempotent Purchases**: Multiple rapid taps on purchase button must result in exactly one purchase
- **Persistent Purchases**: Purchased upgrades must survive app kill, reinstall (with local storage intact), and device restart
- **No Purchase Loss**: If AsyncStorage write fails, retry or queue write; never lose confirmed purchase

### Accessibility

- **Touch Targets**: All purchase buttons and upgrade list items must be >=44x44pt
- **Contrast Ratios**: Upgrade names and costs must meet WCAG AA (4.5:1 for normal text)
- **Screen Reader**: Each upgrade must have `accessibilityLabel` describing name, cost, and effect
- **Disabled State**: Unaffordable upgrades must communicate disabled state through color, opacity, and accessibility hints

### Browser/Device Support

- **iOS**: iOS 14+ on iPhone and iPad
- **Android**: Android 10+ on phones and tablets
- **Storage**: Minimum 10KB AsyncStorage quota (5 upgrades × ~50 bytes per ID + overhead)

---

## Scope Definition

### CRITICAL VALIDATION: User Request Analysis

**Original Feature Request (from feature-upgrades.md):**
> "A permanent upgrade system that allows players to purchase enhancements using scrap. Upgrades are one-time purchases that provide persistent bonuses to gameplay mechanics."

**Key Requirements Identified:**
- 5 specific upgrades with defined costs, effects, and categories
- Scrap-based purchasing system
- Persistent storage of purchased upgrades
- Effect calculation and application to game mechanics
- Integration with existing shop UI

**Explicit Exclusions Found:**
- No recurring purchases or consumables mentioned
- No upgrade levels/tiers beyond the 5 defined upgrades (each is one-time purchase)
- No premium currency or IAP integration mentioned

---

### MVP (Must Have - P0)

**Upgrade Definitions:**
- P0: Define all 5 upgrades in `upgradeDefinitions.ts` with complete metadata
  **QUOTE REQUEST:** Feature spec defines exact upgrades: "Scrap Finder (100 scrap, +10%)", "Scrap Magnet (500 scrap, +15%)", etc.

**Purchase System:**
- P0: Implement purchase validation (sufficient scrap, not already purchased)
  **QUOTE REQUEST:** "Upgrades are one-time purchases" → must prevent duplicate purchases
- P0: Deduct scrap cost from player balance on purchase
- P0: Record purchased upgrade ID in persistent storage
  **QUOTE REQUEST:** "provide persistent bonuses" → purchases must persist across sessions

**Effect Calculation:**
- P0: Calculate total scrap multiplier from purchased scrapMultiplier upgrades
  **QUOTE REQUEST:** "Scrap Efficiency Upgrades... increase scrap generated by AI Pets through percentage multiplier"
- P0: Calculate total pet bonus from purchased petBonus upgrades
  **QUOTE REQUEST:** "Pet Acquisition Upgrades... increase number of AI Pets gained per feed button press"
- P0: Apply scrap multiplier to AI Pet scrap generation rate
- P0: Apply pet bonus to feed button output

**UI Integration:**
- P0: Display available upgrades in shop screen
- P0: Show purchase button for affordable, unpurchased upgrades
- P0: Show purchased state for owned upgrades
- P0: Visual feedback on successful purchase

**Persistence:**
- P0: AsyncStorage integration with debounce (1000ms)
  **QUOTE REQUEST:** Feature spec defines "Storage key: `purchased-upgrades-v1`"
- P0: Load purchased upgrades on app launch

---

### Nice to Have (P1/P2)

**P1 - Important but not critical:**
- Purchase animation (celebration effect, confetti, etc.)
- Sound effects for purchase
- Undo purchase within 5 seconds (accidental taps)
- "Recommended" badge on optimal first purchase
- Tooltip explaining upgrade effect calculation
- Stats screen showing total bonuses from all upgrades

**P2 - Future enhancements:**
- Upgrade preview: "If I buy this, my scrap rate will be X"
- Upgrade bundles: "Buy all scrap upgrades for 2,400 scrap (save 100)"
- Achievements for purchasing all upgrades in a category
- Purchase history log
- Scrap-back refund system (sell upgrades for 50% value)
- Dynamic pricing based on player progression

---

### Out of Scope

**Explicitly Excluded:**
- **Additional upgrades beyond the 5 defined** (feature spec is explicit about current upgrades)
- **Upgrade levels** (each upgrade is one-time purchase, not multi-level)
- **Server-side upgrade catalog** (all definitions local)
- **Premium currency or IAP** (scrap-only economy)
- **Consumable upgrades** (all upgrades are permanent)
- **Time-gated upgrades** (all available immediately when affordable)
- **Unlock conditions** (upgrades only gated by scrap cost, not progression milestones)

**Future Iterations:**
- Analytics tracking of purchase patterns and strategy paths
- A/B testing upgrade costs and effects for balance
- Prestige system (reset purchases for permanent meta-upgrades)
- Additional upgrade categories (speed, automation, multipliers)
- Social features (compare upgrade loadouts, leaderboards)

---

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Dependency | Shop screen infrastructure must exist with navigation | Engineering | Shop screen already implemented in previous sprint | Complete |
| Dependency | Scrap currency state must be accessible from shop | Engineering | Scrap system implemented with Legend State observables | Complete |
| Dependency | AsyncStorage must be installed and configured | Engineering | Verify AsyncStorage setup and test persistence layer | Not Started |
| Dependency | AI Pet scrap generation system must be hookable | Engineering | Confirm scrap rate calculation allows multiplier injection | Not Started |
| Dependency | Feed button must be hookable for pet bonus | Engineering | Confirm feed logic allows bonus pet injection | Not Started |
| Risk | Players discover "optimal path" and all follow same strategy | Game Design | Monitor path diversity metrics; balance if needed | Open |
| Risk | Scrap inflation if players hoard before purchasing | Economy Design | Communicate that more upgrades won't be added soon; encourage early purchases | Open |
| Risk | Upgrade effects feel weak or underwhelming | UX | Ensure clear before/after comparison in UI; consider visual effect amplification | Open |
| Risk | AsyncStorage write failures lose purchases | Engineering | Implement retry logic with exponential backoff; add fallback to in-memory queue | Open |
| Risk | Players regret early purchases after seeing tier 3 upgrades | UX | Show all upgrades upfront (even unaffordable) so players can plan | Mitigated |

---

## Timeline & Milestones

### Phase 1: Data & Logic Implementation (Week 1)

**Days 1-2: Upgrade Definitions & Types**
- Define upgrade data structure interface in TypeScript
- Create `upgradeDefinitions.ts` with all 5 upgrades
- Write unit tests for upgrade definitions (validate structure, no duplicate IDs)

**Days 3-4: Purchase System Logic**
- Implement `useUpgrades` hook with purchase validation
- Add AsyncStorage persistence with debounce
- Write unit tests for purchase logic (validation, scrap deduction, persistence)

**Days 5: Effect Calculation**
- Implement computed observables for total scrap multiplier and pet bonus
- Integrate effects with AI Pet scrap generation and feed button
- Write integration tests for effect application

### Phase 2: UI Integration (Week 2)

**Days 1-2: Upgrade List Component**
- Create `UpgradeListItem` component
- Implement purchase button with states (available, purchased, insufficient scrap)
- Add visual feedback for purchase success

**Days 3: Shop Screen Integration**
- Integrate upgrade list into existing shop screen
- Implement category grouping/labeling
- Add empty state for "all purchased"

**Days 4-5: Polish & Accessibility**
- Add accessibility labels and touch target validation
- Implement visual polish (icons, spacing, typography)
- Cross-platform testing (iOS, Android)

### Phase 3: Testing & QA (Week 3)

**Days 1-2: Functional Testing**
- Test all 5 upgrade purchases
- Verify effect calculations (solo and stacked)
- Test persistence (app restart, force quit)

**Days 3-4: Edge Case Testing**
- Test rapid-tap double purchase prevention
- Test insufficient scrap error handling
- Test AsyncStorage failure scenarios
- Test with 0 scrap, max scrap, negative scrap (edge values)

**Day 5: Performance & Accessibility Testing**
- Performance testing (60fps during purchases, list scrolling)
- Screen reader testing (VoiceOver, TalkBack)
- Contrast ratio validation

### Phase 4: Launch & Monitoring (Week 4)

**Day 1: Production Release**
- Deploy upgrade system to production
- Monitor crash reports and error logs

**Days 2-5: Data Collection & Analysis**
- Track upgrade purchase metrics
- Analyze strategy path diversity (scrap-first vs pet-first)
- Identify balance issues or unexpected player behavior

**Post-Launch: Iteration**
- Address balance feedback
- Consider P1 features based on user requests
- Plan next upgrade tier or category expansion

**Total Timeline: 4 weeks**

---

## Open Questions

- [ ] Should purchased upgrades display in the shop (with "Purchased" badge) or be completely hidden after purchase?
- [ ] Do we want a "total upgrades owned" counter in the shop header (e.g., "3 / 5 upgrades purchased")?
- [ ] Should we show a tutorial/tooltip on first shop visit explaining the two upgrade categories?
- [ ] Do we need a confirmation dialog before purchase, or is single-tap purchase acceptable?
- [ ] Should unaffordable upgrades show "X scrap needed" or just be grayed out?
- [ ] Do we want a stats screen showing total bonuses (e.g., "Total scrap multiplier: +25%")?
- [ ] Should we add an achievement for purchasing all 5 upgrades?
- [ ] Do we want to track "time to first purchase" metric to understand progression pacing?
- [ ] Should we A/B test upgrade costs to find optimal pricing curve?
- [ ] Do we need a "reset purchases" debug option for testing?

---

## Appendix

### Glossary

- **Scrap**: Primary in-game currency earned through AI Pet passive generation
- **AI Pet**: Game entity that generates scrap per second; count increased by feed button
- **Upgrade**: One-time purchasable permanent enhancement to game mechanics
- **Scrap Multiplier**: Percentage bonus applied to AI Pet scrap generation rate
- **Pet Bonus**: Flat addition to pets gained per feed button press
- **AsyncStorage**: React Native persistent key-value storage (local device storage)
- **Legend State**: State management library using observables and computed values
- **Computed Observable**: Auto-recalculating value that updates when dependencies change
- **Debounce**: Delay technique to batch rapid state changes before persisting

### Upgrade Specifications Reference

| ID | Name | Cost | Effect Type | Effect Value | Category | Description |
|----|------|------|-------------|--------------|----------|-------------|
| scrap-boost-1 | Scrap Finder | 100 | scrapMultiplier | 0.1 | Scrap Efficiency | +10% scrap generation from AI Pets |
| scrap-boost-2 | Scrap Magnet | 500 | scrapMultiplier | 0.15 | Scrap Efficiency | +15% scrap generation from AI Pets |
| scrap-boost-3 | Scrap Amplifier | 2000 | scrapMultiplier | 0.25 | Scrap Efficiency | +25% scrap generation from AI Pets |
| pet-boost-1 | Extra Feed | 200 | petBonus | 1 | Pet Acquisition | +1 AI Pet per feed button press |
| pet-boost-2 | Double Feed | 1000 | petBonus | 2 | Pet Acquisition | +2 AI Pets per feed button press |

### Progression Math Examples

**Scrap Efficiency Path (all 3 upgrades purchased):**
- Base scrap rate: 100 pets × 1.0 multiplier = 100 scrap/sec
- With all scrap upgrades: 100 pets × 1.5 multiplier = 150 scrap/sec
- Total bonus: +50% scrap generation
- Total investment: 2,600 scrap
- Payback period: ~52 seconds of AI Pet generation to recoup investment

**Pet Acquisition Path (both upgrades purchased):**
- Base feed output: 1 pet per press
- With all pet upgrades: 1 + 3 bonus = 4 pets per press
- Total bonus: +300% pets per feed
- Total investment: 1,200 scrap
- Value: 4× faster AI Pet collection (compounds with scrap efficiency)

**Mixed Strategy Example:**
- Player buys: Scrap Finder (100) + Extra Feed (200) = 300 scrap invested
- Effects: +10% scrap generation + 1 extra pet per feed
- Balanced approach: modest passive boost + active acceleration

### References

- Feature Specification: `/frontend/modules/upgrades/specs/feature-upgrades.md`
- Shop Screen PRD: `/frontend/modules/shop/specs/prd_shop_20251116.md`
- Scrap System PRD: `/frontend/modules/scrap/specs/prd_scrap_system_20251116.md`
- Core Clicker PRD: `/frontend/modules/attack-button/specs/prd_core_clicker_flow_20251116.md`
- State Management Guide: `/docs/architecture/state-management-hooks-guide.md`
- File Organization Patterns: `/docs/architecture/file-organization-patterns.md`

### Related Documents

- Technical Design Document: TBD (to be created from this PRD using /flow:design)
- Task List: TBD (to be generated from TDD using /flow:tasks)

---

**Document Generated**: 2025-11-16 by Claude Code
**Generation Timestamp**: 2025-11-16T00:00:00Z
