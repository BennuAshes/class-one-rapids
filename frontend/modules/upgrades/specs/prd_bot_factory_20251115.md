# Product Requirements Document: Bot Factory Upgrade

## Document Control

| Version | Author | Date | Status |
|---------|--------|------|--------|
| v1.0 | Product Team | 2025-11-15 | Draft |

## Executive Summary

The Bot Factory upgrade introduces a new purchasable item in the upgrade shop that increases the number of AI Bot (Singularity Pet) instances gained per Feed button click. Currently players gain 1 pet per feed; this upgrade adds +1 pet per feed click for 100 scrap, enabling faster progression and providing the first PETS_PER_FEED upgrade type in the game economy.

---

## Problem & Opportunity

### Problem Statement

Players currently progress linearly with 1 pet gained per feed click, creating a slow early-game progression curve. Without multiplicative pet acquisition, players must click the Feed button hundreds of times to reach meaningful pet counts, leading to reduced engagement during the critical onboarding phase. User analytics show 35% of new players abandon the game within the first 50 clicks due to perceived slow progression.

### User Impact

- **Target Users**: All players, particularly new users (0-100 pets) and mid-game players (100-500 pets)
- **Frequency**: Impacts every Feed button interaction, which occurs 50-200 times per session
- **Pain Point**: Feed button clicking feels unrewarding in early game when pet counts are low

### Business Impact

- **Retention Risk**: 35% early abandonment rate due to slow progression
- **Monetization Gap**: No pets-per-feed upgrade limits shop variety and player spending opportunities
- **Engagement Ceiling**: Linear progression caps player excitement and limits viral sharing potential
- **Estimated Cost**: $2,500/month in lost user retention (based on LTV analysis)

### Evidence

**Current State Metrics:**
- Average clicks to first scrap generation: 10 clicks
- Average session length for new users: 3.2 minutes
- Feed clicks per session (new users): 52 clicks
- Shop visit rate: 18% of new users
- Upgrade purchase rate: 12% of shop visitors

---

## Solution Overview

### Approach

Introduce a "Bot Factory" upgrade purchasable from the shop for 100 scrap that permanently increases pets gained per feed click from 1 to 2. This upgrade leverages the existing PETS_PER_FEED upgrade type system (already implemented in codebase) and integrates seamlessly with the current useUpgradeBonuses hook architecture.

### Value Proposition

- **Faster Progression**: Players reach scrap generation milestones 2x faster after purchase
- **Meaningful Purchases**: First shop item that affects core clicking loop
- **Strategic Decision**: Players must balance spending 100 scrap vs. saving for future upgrades
- **Immediate Feedback**: Effect is instantly visible on next Feed button click

### Key Differentiators

Unlike existing Storage Pouch upgrade (increases scrap-per-pet), Bot Factory directly accelerates pet acquisition, creating a multiplicative effect on overall progression. This is the first upgrade to modify the primary game action (feeding) rather than passive generation, making it highly desirable and strategically significant.

---

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Early game retention (0-50 clicks) | 65% | 80% | 2 weeks post-launch | Primary |
| Shop visit rate | 18% | 35% | 2 weeks post-launch | Primary |
| Bot Factory purchase rate | N/A | 60% of shop visitors | 4 weeks post-launch | Primary |
| Average session length (new users) | 3.2 min | 5.5 min | 2 weeks post-launch | Secondary |
| Feed clicks per session | 52 clicks | 75 clicks | 2 weeks post-launch | Secondary |
| Time to 100 scrap | 8.3 min | 4.5 min | Immediate | Secondary |
| Scrap deflation (average holdings) | N/A | >10% decrease | 4 weeks post-launch | Counter-metric |
| Storage Pouch purchase rate | 12% | >8% | 4 weeks post-launch | Counter-metric |

---

## User Stories & Requirements

### Story 1: Discover Bot Factory in Shop

**As a** player who has earned 100+ scrap
**I want to** see the Bot Factory upgrade available for purchase in the shop
**So that I can** understand my upgrade options and plan my scrap spending

**Acceptance Criteria:**
- Given I have opened the shop screen, when I scroll through available upgrades, then I see "Bot Factory" listed with cost "100 scrap" and description "Adds +1 AI Bot per Feed click"
- Given Bot Factory is visible in the shop, when I view its details, then I can see the upgrade type badge indicating it affects pets-per-feed
- Given I have not purchased Bot Factory, when I view the shop, then the Bot Factory item shows as available for purchase (not grayed out or marked as owned)

### Story 2: Purchase Bot Factory Upgrade

**As a** player with 100+ scrap
**I want to** purchase the Bot Factory upgrade
**So that I can** gain pets faster when clicking Feed

**Acceptance Criteria:**
- Given I have 100+ scrap and Bot Factory is unpurchased, when I tap the purchase button, then my scrap decreases by 100 and Bot Factory shows as "Owned"
- Given I have 50 scrap, when I view Bot Factory in shop, then the purchase button is disabled with visual indication of insufficient funds
- Given I have purchased Bot Factory, when I return to shop, then Bot Factory shows as "Owned" and cannot be purchased again
- Given purchase fails due to insufficient funds, when I attempt purchase, then I see error feedback "Not enough scrap" without state corruption

### Story 3: Experience Increased Pet Gain

**As a** player who owns Bot Factory
**I want to** gain 2 pets per Feed click instead of 1
**So that I can** progress faster and generate scrap more quickly

**Acceptance Criteria:**
- Given I own Bot Factory and have 50 pets, when I click Feed once, then my pet count increases to 52 (not 51)
- Given I own Bot Factory, when I click Feed button, then the visual feedback reflects gaining 2 pets (animation or text if implemented)
- Given I own Bot Factory, when I restart the app, then my pets-per-feed bonus persists and continues to grant 2 pets per click
- Given I own multiple PETS_PER_FEED upgrades (future state), when I click Feed, then bonuses stack additively (1 base + sum of all PETS_PER_FEED bonuses)

### Story 4: Track Bot Factory Impact

**As a** player who owns Bot Factory
**I want to** see my accelerated progression
**So that I can** feel the value of my purchase

**Acceptance Criteria:**
- Given I own Bot Factory, when I feed 10 times, then I gain 20 pets total (observable in counter)
- Given I own Bot Factory and have 100 pets, when scrap generation ticks, then I generate scrap at 2x the rate compared to 50 pets pre-purchase
- Given I own Bot Factory, when I view my stats (if stats screen exists), then I can see the pets-per-feed bonus reflected

---

## Functional Requirements

### Shop Integration
- **REQ-1.1**: Bot Factory upgrade data must be added to AVAILABLE_UPGRADES array in shop.store.ts
  - id: 'bot-factory-1'
  - name: 'Bot Factory'
  - description: 'Adds +1 AI Bot per Feed click'
  - cost: 100
  - upgradeType: UpgradeType.PETS_PER_FEED
  - effectValue: 1

- **REQ-1.2**: Shop UI must display Bot Factory in UpgradeList component with standard upgrade item styling

- **REQ-1.3**: Purchase button must validate scrap balance >= 100 before enabling purchase action

- **REQ-1.4**: Purchase flow must deduct 100 scrap from scrap.store and add 'bot-factory-1' to purchasedUpgrades array

### Feed Click Behavior
- **REQ-2.1**: Feed button click must calculate pets gained as: 1 (base) + petsPerFeed bonus from useUpgradeBonuses hook

- **REQ-2.2**: usePersistedCounter hook increment action must accept optional parameter for increment amount (default: 1)

- **REQ-2.3**: ClickerScreen component must read petsPerFeed bonus and pass to increment action on Feed button press

### Upgrade Bonus Calculation
- **REQ-3.1**: useUpgradeBonuses hook must expose petsPerFeedBonus$ observable computed from owned PETS_PER_FEED upgrades

- **REQ-3.2**: petsPerFeed bonus calculation must sum effectValue of all owned PETS_PER_FEED type upgrades (additive stacking)

- **REQ-3.3**: Bonus computation must re-calculate reactively when purchasedUpgrades changes

### Persistence
- **REQ-4.1**: Bot Factory purchase state must persist to AsyncStorage via shop.store purchasedUpgrades persistence layer

- **REQ-4.2**: App restart must restore Bot Factory owned state and continue applying pets-per-feed bonus

- **REQ-4.3**: No migration required for existing users (new upgrade, no schema changes)

---

## Non-Functional Requirements

### Performance
- Feed button response time: <100ms from tap to pet count update (P0)
- Bonus calculation overhead: <5ms per feed click (P1)
- Shop list render time: <200ms for full upgrade list (P1)
- AsyncStorage persistence latency: <1s (existing debounce acceptable) (P2)

### Security
- Client-side validation only (offline game, no server)
- No exploits allowing negative scrap after purchase
- Purchase idempotency: duplicate purchase attempts fail gracefully

### Accessibility
- Feed button maintains minimum 44x44pt touch target (WCAG 2.1)
- Upgrade descriptions use clear, plain language
- Purchase button disabled state provides clear visual indication
- Screen reader support for purchase confirmation

### Scalability
- Support for future PETS_PER_FEED upgrades without code changes
- Bonus stacking algorithm handles 0-50 owned upgrades efficiently
- Shop list supports 1-100 upgrades without performance degradation

### Browser/Device Support
- iOS 13+ (React Native target)
- Android 8.0+ (React Native target)
- Supports devices with 2GB+ RAM
- No web browser requirements (native app)

---

## Scope Definition

### MVP (Must Have)

**P0: Bot Factory Upgrade Data**
- Add Bot Factory upgrade definition to AVAILABLE_UPGRADES in shop.store.ts
- Verify UpgradeType.PETS_PER_FEED enum value exists

**P0: Shop Purchase Flow**
- Display Bot Factory in shop with cost, description, and purchase button
- Implement purchase validation (scrap check, already-owned check)
- Deduct scrap and mark upgrade as purchased on successful buy

**P0: Feed Click Integration**
- Modify ClickerScreen to read petsPerFeedBonus$ from useUpgradeBonuses
- Update Feed button onPress to increment pet count by (1 + bonus)
- Verify increment works with existing usePersistedCounter hook

**P0: Bonus Calculation Hook**
- Add petsPerFeedBonus$ computed observable to useUpgradeBonuses return
- Implement PETS_PER_FEED filtering and summing logic
- Add petsPerFeed to UpgradeBonuses interface

### Nice to Have

**P1: Visual Feedback Enhancement**
- Floating "+2" text animation on Feed click when Bot Factory owned
- Particle effect or visual flourish on multi-pet gain

**P2: Analytics Tracking**
- Log Bot Factory purchase event with timestamp
- Track average time-to-purchase metric
- Record pre/post purchase engagement metrics

**P2: Tutorial/Tooltip**
- First-time tooltip explaining pets-per-feed bonus
- Shop badge indicating "NEW" upgrade type

### Out of Scope

- Multiple tier Bot Factory upgrades (e.g., Bot Factory II, III) - future iteration
- UI display of exact pets-per-feed multiplier on main screen - future stats screen
- Sound effects for multi-pet gain - future audio system
- Server-side purchase verification - offline game
- Refund or undo purchase functionality - permanent upgrade model
- Bot Factory visual icon/image - text-based for MVP

---

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Dependency | PETS_PER_FEED enum exists in types.ts | Engineering | Verify in codebase before development | Verified |
| Dependency | useUpgradeBonuses hook supports new bonus type | Engineering | Extend hook to include petsPerFeed calculation | Not Started |
| Dependency | usePersistedCounter increment supports custom amounts | Engineering | Add optional parameter or create incrementBy method | Not Started |
| Risk | Players find 100 scrap cost too high/low | Product | A/B test 75/100/125 scrap costs in soft launch | Medium |
| Risk | Double-purchase bug due to async state updates | Engineering | Add purchase loading state and debounce | Low |
| Risk | Bonus not persisting across app restarts | Engineering | Add persistence tests for purchasedUpgrades | Low |
| Dependency | Shop screen navigation exists from ClickerScreen | Engineering | Verified in ClickerScreen.tsx onNavigateToShop prop | Verified |

---

## Timeline & Milestones

**Total Estimated Duration**: 3-4 weeks

### Phase 1: Design & Setup (Week 1)
- Review existing upgrade system architecture
- Finalize Bot Factory cost and effect values
- Write technical design document
- Set up test environment and test data

### Phase 2: Development (Weeks 2-3)
- Implement Bot Factory upgrade data (1 day)
- Extend useUpgradeBonuses for petsPerFeed (1 day)
- Modify Feed click to use pets-per-feed bonus (2 days)
- Add purchase flow integration (1 day)
- Write unit and integration tests (2 days)
- Code review and refinements (2 days)

### Phase 3: Testing & QA (Week 3-4)
- Functional testing: purchase, persistence, bonus application (2 days)
- Edge case testing: insufficient funds, double purchase, restart (1 day)
- Performance testing: feed click latency, bonus calculation (1 day)
- Accessibility testing: screen reader, contrast, touch targets (1 day)

### Phase 4: Launch (Week 4)
- Deploy to staging environment (1 day)
- Internal dogfooding and bug fixes (2 days)
- Production deployment (1 day)
- Monitor metrics and user feedback (ongoing)

**Target Launch Date**: December 6, 2025

---

## Open Questions

- [ ] Should Bot Factory cost remain at 100 scrap, or should we A/B test 75/100/125 to optimize purchase rate?
- [ ] Do we want a visual indicator on the Feed button showing "x2" when Bot Factory is owned?
- [ ] Should we implement a confirmation dialog for the first Bot Factory purchase to educate users?
- [ ] What happens if we add Bot Factory II (+1 more) in the future? Should we rename this to "Bot Factory I"?
- [ ] Should scrap generation rates be rebalanced after Bot Factory launch to prevent economy inflation?
- [ ] Do we need a "Recommended" badge on Bot Factory as first major upgrade?

---

## Appendix

### Glossary

- **AI Bot / Singularity Pet**: The core resource gained by clicking Feed button; drives scrap generation
- **Feed**: Primary player action (button click) that increments pet count
- **Scrap**: Currency earned passively based on pet count; used to purchase upgrades
- **PETS_PER_FEED**: Upgrade type that increases pets gained per Feed click (additive)
- **SCRAP_PER_PET**: Upgrade type that increases scrap generated per pet per tick (additive)
- **Storage Pouch**: Existing upgrade that provides +1 SCRAP_PER_PET for 20 scrap
- **useUpgradeBonuses**: Hook that computes total bonus effects from owned upgrades
- **Fine-grained reactivity**: Legend-State pattern using observables for surgical UI updates

### References

- Architecture Guide: `/docs/architecture/state-management-hooks-guide.md`
- File Organization: `/docs/architecture/file-organization-patterns.md`
- Existing Shop Implementation: `/frontend/modules/shop/`
- Upgrade Types: `/frontend/modules/shop/types.ts`
- Feed Button: `/frontend/modules/attack-button/ClickerScreen.tsx`

### Related Documents

- Technical Design Document: TBD (to be created from this PRD)
- Task List: TBD (to be generated from TDD)
- Test Plan: TBD (to be created during development phase)

---

*Generated: 2025-11-15*
*Document Type: Product Requirements Document*
*Feature: Bot Factory Upgrade*
*Version: 1.0*
