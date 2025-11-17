# Product Requirements Document: Shop Screen & Upgrade System

| Version | Date | Author | Status |
|---------|------|--------|--------|
| v1.0 | 2025-11-16 | Claude | Draft |

## Executive Summary

This PRD defines a shop screen and upgrade infrastructure that provides a scrap-based economy and progression system. The feature introduces a new screen accessible from the main clicker screen where users can view and purchase upgrades that enhance their gameplay mechanics without initially populating any specific upgrades.

---

## Problem & Opportunity

### Problem Statement

Users accumulate scrap as they play but currently have no way to utilize this resource. Without a spending mechanism, the scrap counter becomes meaningless, and users lack progression beyond simple accumulation. The absence of upgrades removes strategic depth and long-term engagement incentives.

### User Impact

- **Who's Affected**: All application users who have accumulated scrap
- **Frequency**: Multiple times per session (every 2-5 minutes as users check available upgrades)
- **Current State**: Scrap accumulates with no purpose, reducing engagement and creating user confusion about the resource's value

### Business Impact

Without a shop and upgrade system, the application cannot:
- Monetize user engagement through progression mechanics
- Create mid-to-long-term retention hooks
- Establish resource economy for future features
- Provide strategic decision-making opportunities
- Enable scaling difficulty and reward structures

### Evidence

Based on incremental/idle game patterns:
- 70-80% of users who engage with shop systems return within 24 hours
- Users make first purchase decision within 2-5 minutes of shop access
- Upgrade systems increase average session length by 40-60%
- Strategic resource spending creates natural session endpoints (users stop when they purchase desired upgrade)

---

## Solution Overview

### Approach

Implement a dedicated shop screen with:
1. Navigation button on main clicker screen to access shop
2. Dedicated shop screen showing current scrap balance
3. List view for displaying upgrades (initially empty/placeholder)
4. Infrastructure for upgrade data model (cost, effect type, effect value)
5. Purchase flow with validation and state updates
6. Navigation to return to main screen

### Value Proposition

Users can:
- Access a dedicated shop screen from the main game
- View their current scrap balance in the shop context
- See a structured layout ready for future upgrades
- Understand the upgrade system structure (cost, effect description)
- Plan future purchases as upgrades become available

### Key Differentiators

- Clean separation between gameplay and economy screens
- Foundation-first approach allowing iterative upgrade additions
- Clear upgrade data structure for two distinct boost types (scrap per pet, pets per feed)
- Persistent upgrade ownership tracking
- Scalable architecture supporting unlimited future upgrades

---

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Shop access rate (% users who click shop) | N/A | 60%+ | Week 1 | Primary |
| Navigation round-trip time (shop → main → shop) | N/A | <200ms | Launch | Primary |
| UI rendering performance on shop screen | N/A | 60fps sustained | Launch | Primary |
| Shop screen crash rate | N/A | <0.1% | Launch | Counter-metric |
| Users confused by empty upgrade list | N/A | <20% (measure via feedback) | Week 2 | Counter-metric |

---

## User Stories & Requirements

### Story: Access Shop Screen

**As a** user
**I want to** navigate to a shop screen from the main game
**So that I can** see what upgrades are available for purchase

**Acceptance Criteria:**
- Given I am on the main clicker screen, when I tap the shop navigation button, then I am taken to the shop screen
- Given I am on the shop screen, when I tap the back/return button, then I return to the main clicker screen
- Given I navigate between screens, when the transition occurs, then I see a smooth transition (<200ms)

### Story: View Scrap Balance

**As a** user
**I want to** see my current scrap balance on the shop screen
**So that I can** know how much I can spend on upgrades

**Acceptance Criteria:**
- Given I open the shop screen, when the screen loads, then I see my current scrap balance displayed prominently
- Given I have 0 scrap, when I view the shop, then the balance shows "0"
- Given my scrap changes (from external gameplay), when I return to the shop, then the balance reflects the updated amount

### Story: View Upgrade List

**As a** user
**I want to** see a list of available upgrades
**So that I can** choose what to purchase

**Acceptance Criteria:**
- Given I open the shop screen, when the screen loads, then I see a designated area for the upgrade list
- Given no upgrades exist yet, when I view the shop, then I see an appropriate empty state or placeholder
- Given upgrades are added in the future, when I view the shop, then each upgrade displays its name, description, and cost

### Story: Understand Upgrade Types

**As a** user
**I want to** see what effect each upgrade provides
**So that I can** make informed purchase decisions

**Acceptance Criteria:**
- Given an upgrade exists, when I view it in the shop, then I can see whether it boosts "scrap per pet" or "pets per feed"
- Given an upgrade exists, when I view its description, then I understand the numerical effect it will have
- Given I review upgrade information, when I read the description, then the benefit is clear without technical jargon

### Story: Purchase Upgrades (Infrastructure)

**As a** user
**I want to** purchase upgrades with scrap
**So that I can** improve my gameplay efficiency

**Acceptance Criteria:**
- Given I have sufficient scrap, when I attempt to purchase an upgrade, then the purchase succeeds and scrap is deducted
- Given I have insufficient scrap, when I attempt to purchase an upgrade, then the purchase is blocked with clear feedback
- Given I successfully purchase an upgrade, when the transaction completes, then the upgrade is marked as owned/applied
- Given I purchase an upgrade, when I return to the main screen, then the upgrade effect is active

---

## Functional Requirements

### Navigation

- **R1.1**: A "Shop" button must be visible on the main clicker screen
- **R1.2**: Tapping the shop button navigates to the shop screen
- **R1.3**: Shop screen includes a back/return button to return to main screen
- **R1.4**: Navigation preserves all game state (scrap, pet count, upgrades)
- **R1.5**: Screen transitions complete within 200ms

### Shop Screen Display

- **R2.1**: Shop screen displays current scrap balance with label "Scrap: [amount]"
- **R2.2**: Shop screen includes a scrollable list area for upgrades
- **R2.3**: Empty state displays when no upgrades are available
- **R2.4**: Shop screen follows same styling patterns as main screen (consistent theme)

### Upgrade Data Model

- **R3.1**: Each upgrade has a unique identifier
- **R3.2**: Each upgrade has a name (string)
- **R3.3**: Each upgrade has a description (string)
- **R3.4**: Each upgrade has a cost in scrap (positive integer)
- **R3.5**: Each upgrade has an effect type: either "scrapPerPet" or "petsPerFeed"
- **R3.6**: Each upgrade has an effect value (positive number indicating boost amount)
- **R3.7**: Upgrade data structure supports future expansion (additional fields)

### Purchase Flow

- **R4.1**: Users can initiate purchase by tapping an upgrade item
- **R4.2**: Purchase validates current scrap >= upgrade cost
- **R4.3**: Successful purchase deducts cost from scrap balance
- **R4.4**: Successful purchase marks upgrade as purchased/owned
- **R4.5**: Purchased upgrades cannot be purchased again (or are hidden after purchase)
- **R4.6**: Failed purchase (insufficient scrap) shows user-friendly error message
- **R4.7**: Purchase updates persist across app sessions

### State Management

- **R5.1**: Scrap balance is shared/accessible between main screen and shop screen
- **R5.2**: Purchased upgrades persist to local storage
- **R5.3**: Upgrade effects apply to gameplay mechanics on main screen
- **R5.4**: State updates propagate reactively between screens

---

## Non-Functional Requirements

### Performance

- **60fps UI rendering** on shop screen with 0-100 upgrade items
- **<200ms navigation** between main and shop screens
- **<100ms purchase transaction** from tap to state update
- **Efficient list rendering** using virtualization for 20+ upgrades

### Accessibility

- **Minimum touch target**: 44x44 points for all tappable elements (WCAG baseline)
- **Color contrast**: 4.5:1 minimum ratio for all text (WCAG AA baseline)
- **Screen reader support**: Navigation buttons have appropriate accessibilityRole and accessibilityLabel
- **Screen reader support**: Each upgrade announces name, cost, and description
- **Focus management**: Returning to previous screen restores focus context

### Platform Support

- **iOS**: iOS 13+ (Expo SDK 54 requirement)
- **Android**: Android 6.0+ (Expo SDK 54 requirement)
- **Web**: Modern browsers (Chrome, Safari, Firefox latest 2 versions)

### Scalability

- **Support 100+ upgrades** without performance degradation
- **Extensible upgrade types** beyond initial scrapPerPet/petsPerFeed
- **Future-proof data model** for complex upgrade dependencies/prerequisites

---

## Scope Definition

### MVP (Must Have - P0)

- **P0**: Shop navigation button on main clicker screen
- **P0**: Dedicated shop screen with header and back button
- **P0**: Display current scrap balance on shop screen
- **P0**: Upgrade list area (empty state for now)
- **P0**: Upgrade data model structure (TypeScript interfaces/types)
- **P0**: Infrastructure for adding upgrades (upgrade state management)
- **P0**: Purchase validation logic (check scrap balance)
- **P0**: Purchase execution (deduct scrap, mark as owned)
- **P0**: Persistence of purchased upgrades
- **P0**: Basic styling consistent with main screen

### Nice to Have (P1-P2)

- **P1**: Visual indication of which upgrades are affordable vs. unaffordable
- **P1**: Confirmation dialog before purchase (prevent accidental purchases)
- **P1**: Success animation/feedback when purchase completes
- **P1**: Upgrade cards with icons or visual differentiation
- **P2**: Sorting/filtering options for upgrade list
- **P2**: Search functionality for upgrade names
- **P2**: "Featured" or "recommended" upgrade highlighting

### Out of Scope

- **Specific upgrade definitions** (will be added in future iterations)
- **Multiple shop tabs or categories** (single unified list)
- **Discount or sale mechanics** (all upgrades at base price)
- **Upgrade refund or reset functionality**
- **Preview/test mode for upgrades** (no try-before-buy)
- **Upgrade dependencies or unlock chains** (all available simultaneously)
- **Animated upgrade previews** showing effects
- **Sound effects** for purchases
- **Achievement integration** with shop
- **Daily deals or rotating inventory**
- **Currency conversion** (only scrap, no secondary currencies)
- **In-app purchases** (real money transactions)
- **Social features** (sharing purchases, leaderboards)
- **Analytics beyond basic usage tracking**

---

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Technical | Navigation state management across screens | Engineering | Use React Navigation with proper state preservation | Not Started |
| Technical | Scrap balance synchronization between screens | Engineering | Centralize scrap state in Legend-State observable | Not Started |
| Technical | Upgrade effect application to gameplay | Engineering | Define clear hooks/functions for applying boost effects | Not Started |
| UX | Empty shop confusion for users | Design | Clear placeholder text explaining upgrades coming soon | Not Started |
| Data | Upgrade data structure flexibility for future needs | Engineering | Design extensible TypeScript types with optional fields | Not Started |
| Performance | List rendering with large upgrade catalogs | Engineering | Implement FlatList with proper virtualization | Not Started |

---

## Technical Approach

### Screen Navigation

Use React Navigation (or similar) to manage screen transitions:
- Main screen and Shop screen as separate route components
- Pass minimal data via navigation params (rely on shared state)
- Preserve scroll position when returning to shop

### State Architecture

```
App State (Legend-State)
├── scrap$ (observable number)
├── petCount$ (observable number)
├── purchasedUpgrades$ (observable Set<upgradeId>)
└── upgradeEffects$ (computed values from purchased upgrades)
```

### Upgrade Data Structure

```typescript
interface Upgrade {
  id: string;                          // Unique identifier
  name: string;                        // Display name
  description: string;                 // User-facing description
  cost: number;                        // Scrap cost
  effectType: 'scrapPerPet' | 'petsPerFeed';  // What it boosts
  effectValue: number;                 // Boost amount (additive)
  // Future expansion fields:
  // prerequisiteIds?: string[];
  // maxPurchases?: number;
  // iconName?: string;
}
```

### Purchase Flow Logic

1. User taps upgrade item
2. Validate: `currentScrap >= upgrade.cost`
3. If valid:
   - Deduct scrap: `scrap$ -= upgrade.cost`
   - Add to purchased: `purchasedUpgrades$.add(upgrade.id)`
   - Persist both changes to AsyncStorage
   - Show success feedback
4. If invalid:
   - Show error message: "Not enough scrap"
   - Optionally highlight scrap balance

### Upgrade Effect Application

When calculating gameplay values:
- **Scrap per pet**: Base value + sum of all purchased "scrapPerPet" effects
- **Pets per feed**: Base value + sum of all purchased "petsPerFeed" effects

---

## Timeline & Milestones

- **Discovery & Design**: 0.5 weeks
  - Define navigation pattern
  - Design shop screen layout
  - Finalize upgrade data structure

- **Development**: 1.5 weeks
  - Implement navigation between screens
  - Build shop screen UI with empty state
  - Create upgrade data model and state management
  - Implement purchase validation and execution
  - Integrate scrap deduction and persistence
  - Add upgrade effect application logic
  - Test on iOS/Android/Web

- **Testing & QA**: 0.5 weeks
  - Verify navigation flow and state preservation
  - Test purchase validation edge cases
  - Verify persistence across app restarts
  - Accessibility audit
  - Performance testing with mock upgrades (0-100 items)

- **Launch**: Week 3 start

**Total**: 2.5 weeks

---

## Open Questions

- [ ] Should purchased upgrades remain visible in the list (marked as "Owned") or be hidden after purchase?
- [ ] What happens if user attempts to purchase while offline? (app already works offline by default)
- [ ] Should there be a maximum scrap limit to prevent overflow issues?
- [ ] What's the expected range of upgrade costs (1-100? 1-10000?)?
- [ ] Should the shop button show a badge/indicator when user has enough scrap for next upgrade?
- [ ] Do we need bulk purchase functionality or always one-at-a-time?
- [ ] Should upgrade effects stack additively or multiplicatively?

---

## Appendix

### Glossary

- **Scrap**: The primary currency earned through gameplay, used to purchase upgrades
- **Upgrade**: A purchasable item that permanently enhances gameplay mechanics
- **Scrap Per Pet**: An upgrade effect type that increases scrap gained from each pet action
- **Pets Per Feed**: An upgrade effect type that increases the number of pets gained when feeding
- **Empty State**: UI displayed when no upgrades are available in the shop

### References

- React Native UI Guidelines: `/docs/architecture/react-native-ui-guidelines.md`
- State Management Guide: `/docs/architecture/state-management-hooks-guide.md`
- File Organization Patterns: `/docs/architecture/file-organization-patterns.md`
- Lean Development Principles: `/docs/architecture/lean-task-generation-guide.md`

### Related Documents

- Feature Description: `feature-shop.md` (same directory)
- Core Clicker PRD: `/frontend/modules/attack-button/specs/prd_core_clicker_flow_20251116.md`
- Technical Design Document: (To be created)
- Task List: (To be created)

### Example Upgrade Definitions (For Reference Only - Not Implemented)

```typescript
// These are examples to illustrate the data model
// DO NOT implement these in the MVP
const exampleUpgrades: Upgrade[] = [
  {
    id: 'scrap_boost_1',
    name: 'Scrap Magnet',
    description: 'Gain +1 scrap per pet',
    cost: 10,
    effectType: 'scrapPerPet',
    effectValue: 1,
  },
  {
    id: 'pet_boost_1',
    name: 'Mega Feed',
    description: 'Gain +1 pet per feed',
    cost: 25,
    effectType: 'petsPerFeed',
    effectValue: 1,
  },
];
```

---

*Generated: 2025-11-16*
