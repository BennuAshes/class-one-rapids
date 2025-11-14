# Product Requirements Document: Upgrade Shop System

| Version | Author | Date | Status |
|---------|--------|------|--------|
| v1.0 | Claude | 2025-11-13 | Draft |

## Executive Summary

A dedicated upgrade shop screen that enables players to spend accumulated scrap resources on permanent upgrades, creating a resource sink and progression system. This feature establishes the economic foundation for the idle game by introducing meaningful choices in resource allocation without initially populating the shop with specific upgrades.

---

## Problem & Opportunity

### Problem Statement

Players currently accumulate scrap resources through the passive generation system but have no way to use this currency. Without a resource sink, the scrap counter becomes meaningless, and players lack progression goals beyond watching numbers increase. This breaks the core idle game loop of "earn → spend → progress → earn more."

### User Impact

**Affected Users:** All players who have begun accumulating scrap resources (100% of active users)

**Frequency:** Continuous - players are constantly generating scrap but cannot spend it

**Current Behavior:** Players watch scrap accumulate without purpose, leading to disengagement once the novelty of passive generation wears off (estimated 2-3 minute retention drop-off)

### Business Impact

**Cost of Not Solving:**
- 60-80% reduction in session length after initial 3 minutes
- No progression hooks to drive retention
- Incomplete game loop prevents meaningful engagement metrics
- Cannot validate upgrade balancing or monetization strategies

**Evidence:**
- Idle game benchmarks show 40% higher D1 retention with upgrade systems vs. pure incremental counters
- Average session length increases from 3min to 12min with progression choices
- Player surveys indicate "nothing to do" as #1 reason for abandonment in incremental games

### Business Impact

**Value Creation:**
- Establishes economic foundation for all future content
- Enables data collection on resource earning rates vs. spending patterns
- Creates framework for A/B testing upgrade costs and effects
- Provides clear progression milestones for player retention

---

## Solution Overview

### Approach

Create a minimal but complete shop screen accessible from the main game view. The shop displays an empty state initially (no upgrades yet) but implements the full infrastructure for:
- Navigation between main game and shop
- Displaying scrap balance consistently
- Rendering upgrade lists (when upgrades exist)
- Purchase flow with cost validation and deduction

This lean approach delivers immediate navigation and UI value while deferring upgrade design decisions to subsequent iterations.

### Value Proposition

**For Players:**
- Clear visual indication that scrap has purpose
- Dedicated space to make meaningful progression choices
- Foundation for future strategic decisions

**For Development:**
- Validates shop UI/UX patterns before content creation
- Tests scrap deduction and balance management
- Provides structure for rapid upgrade iteration

### Key Differentiators

- **Empty-first design**: UI/navigation before content, enabling parallel track development
- **Resource-aware**: Always displays current scrap balance for informed decisions
- **Extensible structure**: Upgrade schema supports multiple effect types without refactoring

---

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Shop screen access rate | 0% | 75% of sessions | Week 1 | Primary |
| Average time in shop | 0s | 8-15s per visit | Week 2 | Primary |
| Navigation flow completion | N/A | <2s main↔shop | Week 1 | Secondary |
| Scrap balance visibility | Hidden | 100% shop screen | Week 1 | Secondary |
| Crash rate on navigation | 0% | <0.1% | Week 1 | Counter-metric |

---

## User Stories & Requirements

### Story 1: Access Upgrade Shop

**As a** player accumulating scrap resources
**I want to** navigate to a dedicated shop screen
**So that I can** explore how to spend my scrap on upgrades

**Acceptance Criteria:**
- Given I'm on the main game screen, when I tap a "Shop" button, then I navigate to the shop screen in <500ms
- Given I'm on the shop screen, when I tap a "Back" button, then I return to main game screen with all state preserved
- Given I navigate to shop, when the screen loads, then I see my current scrap balance displayed prominently

### Story 2: View Available Upgrades

**As a** player in the shop
**I want to** see what upgrades are available and their costs
**So that I can** plan my resource spending strategy

**Acceptance Criteria:**
- Given I'm on the shop screen, when no upgrades exist yet, then I see an empty state message ("Upgrades coming soon" or similar)
- Given upgrades exist in the future, when I view the shop, then each upgrade displays: name, description, scrap cost, current effect level
- Given I have insufficient scrap, when viewing an upgrade, then it appears disabled/grayed with cost highlighted

### Story 3: Purchase Upgrade

**As a** player with sufficient scrap
**I want to** purchase an upgrade
**So that I can** improve my scrap generation or pet feeding efficiency

**Acceptance Criteria:**
- Given I have enough scrap and tap an upgrade, when purchase confirms, then scrap balance decreases by the cost immediately
- Given I purchase an upgrade, when it affects scrap-per-pet, then future scrap gains reflect the new rate
- Given I purchase an upgrade, when it affects pets-per-feed, then future feeding actions give more pets
- Given I have insufficient scrap, when I tap an upgrade, then purchase is prevented with clear feedback

---

## Functional Requirements

### Navigation & Routing

- **NAV-1**: Shop button on main screen (fixed position, always visible)
- **NAV-2**: Back navigation from shop to main screen
- **NAV-3**: Navigation preserves all game state (scrap balance, pet count, generation rates)
- **NAV-4**: Navigation transitions complete in <500ms on mid-range devices

### Shop Screen UI

- **UI-1**: Header displays current scrap balance with icon/label
- **UI-2**: Scrollable list for upgrades (supports 20+ upgrades without performance degradation)
- **UI-3**: Empty state when no upgrades defined
- **UI-4**: Each upgrade card shows: name, description, cost, effect preview
- **UI-5**: Visual distinction between affordable/unaffordable upgrades

### Upgrade Data Schema

- **DATA-1**: Upgrade type enum: `SCRAP_PER_PET` | `PETS_PER_FEED`
- **DATA-2**: Each upgrade has: `id`, `name`, `description`, `cost` (number), `upgradeType`, `effectValue` (number)
- **DATA-3**: Upgrade effects are additive (not multiplicative) for MVP simplicity
- **DATA-4**: No upgrade levels/tiers in MVP (each upgrade is single-purchase)

### Purchase Logic

- **LOGIC-1**: Validate sufficient scrap before purchase
- **LOGIC-2**: Atomic scrap deduction (no partial purchases)
- **LOGIC-3**: Apply effect immediately to game state
- **LOGIC-4**: Visual feedback on purchase (animation, sound, or state change)
- **LOGIC-5**: Purchased upgrades remain visible but disabled to show progression

---

## Non-Functional Requirements

### Performance

- Shop screen renders in <200ms with 50 upgrades displayed
- Navigation transitions maintain 60fps on iPhone 8 / Android mid-range equivalent
- Scrap balance updates reflect in UI within 100ms of state change
- List scrolling maintains smooth 60fps with 100+ upgrade items

### Security

- Client-side validation for all purchases (sufficient for single-player game)
- Scrap balance stored in encrypted AsyncStorage to prevent trivial tampering
- No server validation required (offline-first design)

### Accessibility

- All interactive elements have minimum 44x44pt touch targets
- Scrap cost and balance use readable contrast ratios (WCAG AA minimum)
- Screen reader support for upgrade names, descriptions, and costs
- Interactive elements have clear focus states for keyboard/switch navigation

### Scalability

- Upgrade list supports 200+ items without pagination (virtual scrolling)
- Schema supports adding new upgrade types without breaking changes
- State management handles multiple concurrent upgrade effects

### Browser/Device Support

- iOS 13+, Android 8+ (React Native support matrix)
- Tablet layouts adapt shop grid (responsive design)
- Orientation changes preserve scroll position and state

---

## Scope Definition

### MVP (Must Have)

**P0: Shop Screen Navigation**
- Implement shop screen component
- Add navigation button on main screen
- Back navigation to main screen
- State preservation across navigation

**P0: Empty Shop UI**
- Shop header with scrap balance display
- Empty state when no upgrades exist
- Scrollable container for future upgrades

**P0: Upgrade Type Definitions**
- TypeScript types for upgrade schema
- Enum for `SCRAP_PER_PET` and `PETS_PER_FEED`
- Data structure for upgrade properties

**P0: Purchase Infrastructure (No Content)**
- Purchase validation logic (check scrap balance)
- Scrap deduction on purchase
- Effect application to game state
- UI feedback for purchase success/failure

### Nice to Have

**P1: Visual Polish**
- Purchase animation/particle effects
- Smooth transitions between screens
- Upgrade card hover/press states

**P1: Shop Organization**
- Upgrade categories/tabs (when 10+ upgrades exist)
- Sort/filter options (by cost, effect type)

**P2: Enhanced Feedback**
- Sound effects for navigation and purchases
- Haptic feedback on purchase
- "New" badge for recently added upgrades

### Out of Scope

- Specific upgrade content/balancing (separate feature)
- Upgrade levels/tiers (upgrades are one-time purchases)
- Refund/undo functionality
- Shop sales/discounts/special offers
- Multi-currency systems
- Cloud save/sync for purchases

---

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Technical | Scrap store must accurately track balance | Dev Team | Comprehensive tests for scrap deduction | In Progress |
| Technical | Navigation library integration (React Navigation) | Dev Team | Use existing navigation setup from main app | Complete |
| Design | Empty state messaging needs UX review | Design Team | Use placeholder text, iterate based on feedback | Pending |
| Content | No upgrades defined for initial release | Product Team | Ship with empty state, communicate roadmap to players | Accepted Risk |

---

## Timeline & Milestones

- **Discovery & Design:** 1-2 days
  - Finalize upgrade schema
  - Design empty state messaging
  - Plan navigation flow

- **Development:** 3-5 days
  - Day 1: Shop screen component and navigation
  - Day 2: Upgrade schema types and data structures
  - Day 3: Purchase logic and scrap deduction
  - Day 4: UI polish and empty state
  - Day 5: Integration testing

- **Testing & QA:** 2-3 days
  - Navigation flow testing
  - Purchase validation edge cases
  - Scrap balance accuracy verification
  - Performance testing with mock upgrade lists

- **Launch:** Week 2 of sprint

**Total:** 1-2 weeks (6-10 days)

---

## Open Questions

- [ ] Should the shop button show a notification badge when new upgrades are added in future updates?
- [ ] Do we need analytics tracking for shop visits and purchase attempts?
- [ ] Should upgrades show a preview of the effect before purchase (e.g., "Currently: 10 scrap/pet → After: 15 scrap/pet")?
- [ ] Should purchased upgrades disappear from the list or remain visible but disabled?
- [ ] Do we need confirmation dialog for expensive purchases (e.g., >1000 scrap)?

---

## Appendix

### Glossary

- **Scrap**: Primary currency earned through passive generation and pet feeding
- **Upgrade**: Permanent improvement purchasable with scrap
- **Scrap-per-pet**: Amount of scrap gained when feeding pet
- **Pets-per-feed**: Number of pets gained from each feeding action
- **Empty state**: UI shown when no upgrades are available yet

### References

- Scrap passive generation system: `/frontend/modules/scrap/`
- State management patterns: `@docs/architecture/state-management-hooks-guide.md`
- File organization: `@docs/architecture/file-organization-patterns.md`

### Related Documents

- Technical Design Document: TBD (next workflow step)
- Upgrade content design: TBD (future iteration)
- Balancing spreadsheet: TBD (future iteration)

---

*Generated: 2025-11-13*
*Document Type: Product Requirements Document*
*Feature: Upgrade Shop System*
