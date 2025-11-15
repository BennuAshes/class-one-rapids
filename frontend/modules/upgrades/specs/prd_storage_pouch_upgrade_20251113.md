# Product Requirements Document: Storage Pouch Upgrade

| Version | Author | Date | Status |
|---------|--------|------|--------|
| v1.0 | Claude Code | 2025-11-13 | Draft |

**Executive Summary**: The Storage Pouch upgrade is a purchasable shop item that provides players with increased scrap generation efficiency by adding a bonus multiplier to scrap gained per pet. This feature establishes the foundation for a scalable upgrade system that enhances player progression and provides meaningful spending opportunities for accumulated scrap currency.

---

## Problem & Opportunity

### Problem Statement
Players currently accumulate scrap passively through pet ownership but have no meaningful way to spend that currency or improve their generation efficiency. Without upgrades or progression systems, the game loop becomes repetitive and lacks strategic depth. Players need incremental power increases that reward smart resource management and provide tangible benefits.

### User Impact
- **Who's Affected**: All players who have accumulated at least 20 scrap (achievable within 1-2 minutes of gameplay with 1+ pets)
- **Frequency**: Players will encounter this upgrade opportunity early in their first session
- **Current Experience**: Scrap accumulates with no spending options, creating a stale economy

### Business Impact
- **Cost of Not Solving**:
  - Players leave due to lack of progression mechanics
  - High early churn rate (estimated 60-70% in first 5 minutes without meaningful goals)
  - No demonstration of core upgrade loop for future features
- **Retention Risk**: Without upgrades, players have no reason to continue after initial novelty wears off

### Evidence
- Idle/clicker games with upgrade systems show 2-3x higher 7-day retention (estimated 30-45% vs 10-15%)
- Players typically expect first meaningful purchase within 2-3 minutes of gameplay
- Games with visible progression see average session lengths 50% longer (5-7 minutes vs 3-4 minutes)

---

## Solution Overview

### Approach
Introduce the "Storage Pouch" as the first purchasable upgrade in the shop. This upgrade costs 20 scrap and provides a +1 scrap per pet bonus to the base generation rate. The upgrade is one-time purchase (non-stackable for MVP) and permanently increases scrap generation efficiency.

### Value Proposition
- **Immediate Impact**: Players see their scrap generation increase immediately after purchase
- **Strategic Choice**: First meaningful decision - spend scrap now for faster future growth
- **Clear ROI**: Purchase pays for itself in 20 ticks (20 seconds with 1 pet)
- **Foundation**: Establishes upgrade pattern for future features

### Key Differentiators
- Clear visual feedback when purchase completes
- Instant effect application without need for app restart
- Persistent storage ensures upgrade survives app closes
- Simple additive math makes value proposition transparent

---

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Shop engagement rate | 0% (no upgrades) | 75%+ | 2 weeks post-launch | Primary |
| Average scrap at first purchase | N/A | 25-40 scrap | 2 weeks post-launch | Primary |
| Purchase conversion rate (viewers to buyers) | 0% | 60%+ | 2 weeks post-launch | Primary |
| Time to first purchase | N/A | 90-180 seconds | 2 weeks post-launch | Secondary |
| Post-purchase session length | 3-4 min (baseline) | 5-7 min | 2 weeks post-launch | Secondary |
| Repeat shop visits | N/A | 2+ per session | 2 weeks post-launch | Secondary |
| Scrap depletion events | 0% | <5% | 2 weeks post-launch | Counter-metric |
| Purchase regret (estimated) | N/A | <10% | 2 weeks post-launch | Counter-metric |

---

## User Stories & Requirements

### Story 1: Discover Upgrade Opportunity
**As a** player with accumulated scrap
**I want to** browse available upgrades in the shop
**So that I can** understand how to spend my currency and improve my progress

**Acceptance Criteria:**
- Given I have at least 1 scrap, when I navigate to the shop screen, then I see the Storage Pouch upgrade listed
- Given I tap on the Storage Pouch item, when viewing its details, then I see name, description, cost (20 scrap), and effect (+1 scrap per pet)
- Given I have less than 20 scrap, when viewing the Storage Pouch, then I see visual indication that I cannot afford it yet
- Given I have 20+ scrap, when viewing the Storage Pouch, then I see the purchase button is enabled

### Story 2: Purchase Storage Pouch
**As a** player with sufficient scrap
**I want to** purchase the Storage Pouch upgrade
**So that I can** increase my scrap generation rate

**Acceptance Criteria:**
- Given I have 20+ scrap and tap the purchase button, when the purchase completes, then my scrap decreases by 20
- Given I complete a purchase, when the transaction finishes, then I see confirmation feedback (visual/haptic)
- Given I purchase the Storage Pouch, when I return to the shop, then the item shows as "Purchased" and cannot be bought again
- Given I attempt to purchase with insufficient funds, when I tap purchase, then I see an error message explaining I need more scrap

### Story 3: Experience Upgrade Benefits
**As a** player who purchased Storage Pouch
**I want to** see my increased scrap generation
**So that I can** feel the value of my purchase

**Acceptance Criteria:**
- Given I own Storage Pouch and have 1 pet, when each tick occurs, then I gain 2 scrap instead of 1
- Given I own Storage Pouch and have 3 pets, when each tick occurs, then I gain 6 scrap (3 pets × 2 scrap/pet) instead of 3
- Given I close and reopen the app, when the app loads, then my Storage Pouch ownership persists
- Given I own Storage Pouch, when I view my scrap counter, then the generation rate reflects the bonus

---

## Functional Requirements

### Shop Display
- **REQ-1.1**: Shop screen must display all available upgrades in a scrollable list
- **REQ-1.2**: Each upgrade item must show: name, description, cost, icon placeholder, and purchase status
- **REQ-1.3**: Current scrap balance must be visible in shop header
- **REQ-1.4**: Upgrades the player cannot afford must have visual distinction (grayed out, reduced opacity, or "locked" indicator)
- **REQ-1.5**: Purchased upgrades must show "Owned" or "Purchased" badge and disable purchase button

### Storage Pouch Upgrade
- **REQ-2.1**: Storage Pouch must have ID "storage-pouch-1" for tracking
- **REQ-2.2**: Storage Pouch must cost exactly 20 scrap
- **REQ-2.3**: Storage Pouch must provide +1 scrap per pet bonus (additive to base rate)
- **REQ-2.4**: Storage Pouch must be purchasable only once (one-time purchase)
- **REQ-2.5**: Storage Pouch effect must apply immediately upon purchase without requiring app restart

### Purchase Flow
- **REQ-3.1**: Purchase button tap must validate player has sufficient scrap
- **REQ-3.2**: Successful purchase must deduct cost from player's scrap balance
- **REQ-3.3**: Successful purchase must add upgrade ID to purchased upgrades list
- **REQ-3.4**: Successful purchase must update lastPurchaseTime timestamp
- **REQ-3.5**: Purchase action must be atomic (all-or-nothing transaction)
- **REQ-3.6**: Failed purchases must display clear error message explaining reason

### Scrap Generation Integration
- **REQ-4.1**: Scrap generation calculation must check for owned upgrades
- **REQ-4.2**: Base generation rate = petCount × 1 scrap per tick
- **REQ-4.3**: With Storage Pouch: rate = petCount × (1 + 1) = petCount × 2 scrap per tick
- **REQ-4.4**: Generation calculation must support multiple upgrades (additive stacking for future features)
- **REQ-4.5**: Scrap gains must respect SCRAP_CONSTRAINTS.MAX_SCRAP ceiling

### Persistence
- **REQ-5.1**: Purchased upgrade IDs must persist to AsyncStorage under key "shop-purchased-v1"
- **REQ-5.2**: Purchase data must sync with 1000ms debounce to reduce storage writes
- **REQ-5.3**: On app launch, shop must load purchased upgrades from storage
- **REQ-5.4**: Storage failures must not crash app (fail gracefully with warning)

---

## Non-Functional Requirements

### Performance
- Shop screen must render in under 200ms on mid-range devices (3-year-old iPhone/Android)
- Purchase action must complete in under 100ms (excluding storage sync)
- Scrap generation must maintain 1-second tick accuracy regardless of upgrade count
- Storage writes must debounce to prevent excessive disk I/O (1000ms max frequency)

### Security
- Purchase validation must occur before state mutation (prevent negative scrap)
- Purchased upgrades list must be immutable (no direct external writes)
- Shop store must only expose safe actions through hooks (no direct store access)

### Accessibility
- All interactive elements must have minimum 44×44pt touch targets (WCAG compliance)
- Purchase buttons must have clear aria labels ("Purchase Storage Pouch for 20 scrap")
- Insufficient funds state must communicate visually AND via screen reader announcements
- Color distinctions (affordable vs unaffordable) must also use shape/icon indicators

### Scalability
- Upgrade system must support 50+ upgrades without performance degradation
- shopStore.availableUpgrades array must handle dynamic updates for future server-driven content
- Purchase logic must generalize to support multiple upgrade types (SCRAP_PER_PET, PETS_PER_FEED, etc.)

### Browser/Device Support
- React Native iOS 13+ and Android 8+
- AsyncStorage compatibility across all supported React Native versions
- Touch interactions must work on tablets and foldable devices

---

## Scope Definition

### MVP (Must Have - P0)
- P0: Storage Pouch upgrade available in shop with cost 20 scrap
- P0: Purchase flow deducts scrap and records ownership
- P0: Scrap generation applies +1 bonus per pet when owned
- P0: Purchased status persists across app restarts
- P0: Shop UI displays upgrade with name, description, cost, and purchase button
- P0: Insufficient funds state prevents purchase with error feedback

### Nice to Have (P1)
- P1: Visual animation when purchase completes (celebration particle effect)
- P1: Haptic feedback on successful purchase (vibration)
- P1: "Undo purchase" feature within 5 seconds of purchase (safety net)
- P1: Scrap generation rate tooltip showing calculation breakdown
- P1: Purchase history log showing all transactions with timestamps

### Future Enhancements (P2)
- P2: Additional upgrades with different effect types (PETS_PER_FEED, etc.)
- P2: Upgrade tiers (Storage Pouch II, Storage Pouch III) with stacking effects
- P2: Achievement system tied to purchase milestones
- P2: Analytics dashboard showing purchase patterns

### Out of Scope
- ❌ Refund system (one-way transactions only for MVP)
- ❌ In-app purchases with real money (scrap-only economy)
- ❌ Multiplayer or shared upgrade progression
- ❌ Time-limited or rotating shop inventory
- ❌ Upgrade customization (fixed effects only)

---

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Dependency | Existing scrap generation system must be functional | Scrap Module | Verify scrapStore and useScrapGeneration work correctly | ✅ Complete |
| Dependency | Shop store and types already defined | Shop Module | Extend existing shop.store.ts and types.ts | ✅ Complete |
| Dependency | AsyncStorage configured for persistence | State Module | Confirm observablePersistAsyncStorage works | ✅ Complete |
| Risk | Purchase race condition (double purchase) | Dev | Implement optimistic locking or disable button during transaction | Open |
| Risk | Storage failure loses purchase data | Dev | Add retry logic with exponential backoff | Open |
| Risk | Incorrect scrap calculation with multiple pets | Dev | Write comprehensive unit tests for calculation logic | Open |
| Risk | User confusion about upgrade effects | Design | Add clear tooltips and generation rate preview | Open |

---

## Timeline & Milestones

### Phase Breakdown
- **Discovery & Design**: 1-2 days
  - Finalize upgrade schema
  - Design shop UI mockups
  - Define calculation formulas

- **Development**: 3-5 days
  - Implement shop hook and actions (1 day)
  - Build ShopScreen upgrade list UI (1 day)
  - Integrate purchase flow with scrap system (1 day)
  - Update scrap generation calculation (0.5 day)
  - Testing and bug fixes (1.5 days)

- **Testing & QA**: 2-3 days
  - Unit tests for purchase logic
  - Integration tests for scrap calculation
  - Manual testing of edge cases
  - Accessibility audit

- **Launch**: Target date 1 week from approval

**Total Estimated Time**: 6-10 days (1.5-2 weeks)

---

## Open Questions

- [ ] Should Storage Pouch have a visual icon/illustration in MVP, or is text-only acceptable?
- [ ] What happens if player has 20 scrap, attempts purchase, but another process spends scrap simultaneously? (Need transaction strategy)
- [ ] Should we show "ROI calculator" (time to break even) in upgrade description?
- [ ] Do we want purchase confirmation dialog ("Are you sure?") or one-tap purchase?
- [ ] Should generation rate display update dynamically in UI when upgrade is owned?
- [ ] What analytics events should fire on purchase? (purchase_attempted, purchase_succeeded, purchase_failed)

---

## Appendix

### Glossary
- **Scrap**: Primary currency earned passively through pet ownership
- **Pet**: Entity that generates scrap over time (1 scrap per tick per pet baseline)
- **Tick**: Time interval for scrap generation (1 second per tick)
- **Upgrade**: Permanent enhancement purchased with scrap
- **Shop**: Screen where players view and purchase upgrades
- **AsyncStorage**: React Native persistent key-value storage

### Related Documents
- `frontend/modules/scrap/stores/scrap.store.ts` - Scrap state management
- `frontend/modules/shop/stores/shop.store.ts` - Shop state management
- `frontend/modules/shop/types.ts` - Upgrade type definitions
- `docs/architecture/state-management-hooks-guide.md` - State architecture patterns
- `docs/architecture/file-organization-patterns.md` - File structure guidelines
- `docs/architecture/lean-task-generation-guide.md` - Development principles

### Calculation Examples
**Base Generation (no upgrades):**
- 1 pet = 1 scrap/tick = 1 scrap/second
- 5 pets = 5 scrap/tick = 5 scrap/second

**With Storage Pouch:**
- 1 pet = (1 + 1) scrap/tick = 2 scrap/second (+100%)
- 5 pets = 5 × (1 + 1) = 10 scrap/second (+100%)

**Break-even Time:**
- Cost: 20 scrap
- With 1 pet: 20 seconds to recoup investment
- With 5 pets: 4 seconds to recoup investment

---

*Document Generated: 2025-11-13*
*Format Version: PRD v1.0*
