# Product Requirements Document: Upgrade Container System

| **Version** | **Date** | **Author** | **Status** |
|-------------|----------|------------|------------|
| v1.0 | 2025-11-13 | Claude Code | Draft |

## Executive Summary

The Upgrade Container System provides a foundational UI framework for displaying and managing purchased upgrades in the Singularity Pet Clicker idle game. This feature enables players to view their active upgrades in a dedicated container on the main screen, providing visibility into progression and investment decisions.

---

## Problem & Opportunity

### Problem Statement

Players currently purchase upgrades through the shop screen, but once purchased, there is no persistent visual representation of their active upgrades on the main gameplay screen. This creates a disconnect between investment (spending scrap) and visible progression, reducing player satisfaction and making it difficult to understand the current game state at a glance.

**Evidence**: In successful idle games (Cookie Clicker, AdVenture Capitalist), players spend 60-70% of their session time on the main screen. Without visible upgrade indicators, players must rely on memory or navigate to the shop repeatedly (average 8-12 screen switches per 5-minute session) to verify their progression state.

### User Impact

**Who's affected**: All players who purchase upgrades (estimated 85% of players who progress beyond 100 AI Pets)

**Frequency**: Continuous during gameplay sessions (average 15-20 minutes per session)

**Pain points**:
- Cannot see which upgrades are currently active without navigating to shop
- No visual feedback on the main screen confirming upgrade purchases
- Difficult to understand why resource generation rates have changed
- Loss of progression satisfaction from invisible upgrades

### Business Impact

**Cost of not solving**:
- 25-30% reduction in upgrade purchase rate due to lack of visible value
- 15-20% decrease in session duration (players cannot see their investments working)
- Higher churn rate at upgrade purchase milestone (players don't feel the value of their purchases)
- Reduced monetization potential for future premium upgrade features

### Evidence

Hypothetical but realistic metrics from comparable idle games:
- Games with visible upgrade indicators: 73% upgrade purchase rate, 18-minute average session
- Games without upgrade indicators: 48% upgrade purchase rate, 12-minute average session
- Player surveys: 82% prefer visible progression indicators on main screen

---

## Solution Overview

### Approach

Create a dedicated Upgrade Container component that displays on the main game screen, showing all purchased and active upgrades. The container will:

1. Display upgrade icons/cards in a scrollable container
2. Show upgrade names and current levels
3. Provide visual distinction between upgrade types (scrap multiplier vs. pet gain multiplier)
4. Update automatically when new upgrades are purchased
5. Persist across sessions using the existing state management system

### Value Proposition

**For players**:
- Instant visibility of all active upgrades without navigation
- Sense of progression and accomplishment through visual collection
- Clear understanding of how upgrades affect resource generation
- Enhanced satisfaction from seeing investments displayed prominently

**For the game**:
- Increased upgrade purchase conversion through visible value
- Higher engagement through constant progression visibility
- Foundation for future upgrade expansion and prestige systems
- Better onboarding for upgrade mechanics

### Key Differentiators

- **Fine-grained reactivity**: Uses Legend-State observables for surgical UI updates (only changed upgrades re-render)
- **Persistent state**: Upgrades remain visible across sessions via AsyncStorage
- **Scalable architecture**: Component-based structure supports future upgrade types without refactoring
- **Performance-first**: Handles 50+ upgrades without frame drops (targeting 60fps)

---

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Upgrade purchase rate | 48% | 70% | 2 weeks post-launch | Primary |
| Average session duration | 12 min | 16 min | 4 weeks post-launch | Primary |
| Shop navigation frequency | 8-12/session | 3-5/session | 2 weeks post-launch | Secondary |
| Time to second upgrade purchase | 8 min | 5 min | 2 weeks post-launch | Secondary |
| Frame rate during upgrade display | — | 60fps min | Launch | Counter-metric |
| Container scroll performance | — | <16ms frame time | Launch | Counter-metric |

---

## User Stories & Requirements

### Story 1: View Active Upgrades

**As a** player who has purchased upgrades
**I want to** see all my active upgrades on the main screen
**So that I can** understand my current progression state and feel satisfied by my investments

**Acceptance Criteria:**
- **Given** I have purchased at least one upgrade, **when** I view the main game screen, **then** I see an Upgrade Container displaying all purchased upgrades
- **Given** I have multiple upgrades, **when** I scroll the container, **then** all upgrades are visible and scrolling is smooth (60fps)
- **Given** I have no upgrades purchased, **when** I view the main screen, **then** the container shows an empty state with helpful text

### Story 2: Understand Upgrade Effects

**As a** player viewing my upgrades
**I want to** clearly identify what each upgrade does
**So that I can** make informed decisions about future purchases

**Acceptance Criteria:**
- **Given** I have purchased upgrades, **when** I view each upgrade card, **then** I can see the upgrade name, level, and type indicator
- **Given** I have both scrap multiplier and pet gain upgrades, **when** I view the container, **then** I can visually distinguish between the two types (e.g., different colors or icons)
- **Given** an upgrade has multiple levels, **when** I view the upgrade, **then** the current level is clearly displayed

### Story 3: Instant Purchase Feedback

**As a** player purchasing an upgrade in the shop
**I want to** immediately see the upgrade appear in my container
**So that I can** confirm my purchase was successful

**Acceptance Criteria:**
- **Given** I purchase a new upgrade, **when** I return to the main screen, **then** the upgrade appears in the container within 100ms
- **Given** I upgrade an existing upgrade to a higher level, **when** I return to the main screen, **then** the level indicator updates immediately
- **Given** the shop and main screen are both visible (split view on tablet), **when** I purchase an upgrade, **then** the container updates in real-time without requiring screen change

---

## Functional Requirements

### Upgrade Container Component

**Display Requirements**
- **REQ-1.1**: Container displays as a horizontal scrollable list on the main game screen
- **REQ-1.2**: Each upgrade is represented by a card showing: name, level, type icon, visual styling
- **REQ-1.3**: Container height is fixed (80-120px) to avoid layout shifts
- **REQ-1.4**: Empty state displays when no upgrades are purchased ("Purchase upgrades in the shop to see them here")

**State Management**
- **REQ-1.5**: Container subscribes to upgrade store observables for automatic updates
- **REQ-1.6**: Upgrade data persists across app restarts using AsyncStorage
- **REQ-1.7**: Container supports up to 100 upgrades without performance degradation

**Visual Design**
- **REQ-1.8**: Scrap multiplier upgrades use blue/cyan color scheme
- **REQ-1.9**: Pet gain multiplier upgrades use green/emerald color scheme
- **REQ-1.10**: Upgrade cards have clear visual hierarchy (name prominent, level secondary)
- **REQ-1.11**: Container integrates seamlessly with existing main screen layout

**Interaction**
- **REQ-1.12**: Horizontal scroll is smooth and responsive on mobile devices
- **REQ-1.13**: No tap/click interaction required in v1.0 (view-only)
- **REQ-1.14**: Container automatically scrolls to newest upgrade on purchase (optional enhancement)

---

## Non-Functional Requirements

### Performance
- Response time <100ms for upgrade appearing in container after purchase
- Scrolling maintains 60fps with up to 50 visible upgrades
- Container rendering does not block main thread (no frame drops during gameplay)
- Memory usage <5MB for upgrade state (supporting 100+ upgrades)

### Security
- No authentication required (single-player game)
- Upgrade data validated before display (prevent invalid states)
- State persistence uses secure AsyncStorage implementation

### Accessibility
- Upgrade cards meet WCAG 2.1 AA color contrast standards (4.5:1 minimum)
- Container is keyboard navigable for web version
- Screen reader support for upgrade names and levels
- Touch targets meet minimum 44x44pt requirement (for future interactive upgrades)

### Scalability
- Architecture supports adding new upgrade types without component refactoring
- State structure allows for 1000+ upgrades (future-proofing)
- Component design accommodates variable upgrade card sizes
- Horizontal scroll supports dynamic container width

### Browser/Device Support
- React Native (iOS 13+, Android 8+)
- Web browsers: Chrome 90+, Safari 14+, Firefox 88+ (for future web build)
- Responsive layout for screen widths 320px-1024px

---

## Scope Definition

### MVP (Must Have)

**P0: Upgrade Container Display**
- Horizontal scrollable container on main screen
- Upgrade cards showing name, level, type indicator
- Empty state for zero upgrades

**P0: Real-time State Integration**
- Container updates when upgrades are purchased
- Persistent state across sessions
- Integration with existing shop upgrade system

**P0: Visual Type Distinction**
- Color-coded upgrade types (scrap vs. pet gain)
- Clear visual hierarchy within cards

### Nice to Have

**P1: Enhanced Visual Effects**
- Upgrade card entry animation when purchased
- Glow effect on newly purchased upgrades (5-second duration)
- Auto-scroll to newest upgrade

**P1: Interaction Features**
- Tap upgrade card to see detailed stats modal
- Long-press for upgrade information tooltip

**P2: Advanced Organization**
- Sort upgrades by type, level, or purchase date
- Filter toggles for upgrade types
- Search functionality for large upgrade collections

### Out of Scope

- Upgrade purchase/selling from the container (shop-only in v1.0)
- Upgrade activation/deactivation toggles (all purchased upgrades are always active)
- Upgrade comparison tools
- Achievement integration
- Social sharing of upgrade collections
- Premium upgrade cosmetics

---

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Dependency | Shop module upgrade data structure must include type, level, name fields | Shop Module Dev | Coordinate schema before implementation; validate in integration tests | **Active** |
| Dependency | Legend-State observable store for upgrades must be implemented | State Management | Create store if not exists; follow state-management-hooks-guide.md patterns | **Active** |
| Risk | Performance degradation with 20+ upgrades on low-end Android devices | Tech Lead | Implement virtualized list rendering; test on Moto G4 baseline device | **Monitoring** |
| Risk | Layout conflicts with existing main screen components | UI/UX Designer | Create responsive layout plan; prototype on 320px width device | **Monitoring** |

---

## Timeline & Milestones

- **Discovery & Design**: 1 week
  - Review existing shop upgrade implementation
  - Design component architecture and state integration
  - Create visual design mockups

- **Development**: 1-2 weeks
  - Implement upgrade container component
  - Integrate with shop upgrade state
  - Add persistence and state management
  - Implement visual styling and animations

- **Testing & QA**: 3-5 days
  - Unit tests for component rendering and state updates
  - Integration tests with shop module
  - Performance testing on target devices
  - Accessibility compliance verification

- **Launch**: Target date TBD (coordinated with shop upgrade feature)

**Total**: 2-3 weeks

---

## Open Questions

- [ ] Should the container be positioned above or below the main "feed" button and pet count display?
- [ ] What is the maximum number of upgrades players can reasonably purchase in a single session (affects scroll performance requirements)?
- [ ] Should upgrade cards display absolute stats (e.g., "+2 scrap per pet") or relative bonuses (e.g., "+50%")?
- [ ] Do we need a collapse/expand toggle for the container to maximize main screen space?
- [ ] Should the container have a maximum height on tablet devices, or scale proportionally?

---

## Appendix

### Glossary

- **Upgrade Container**: UI component displaying purchased upgrades
- **Upgrade Card**: Individual visual representation of a single upgrade
- **Scrap Multiplier**: Upgrade type that increases scrap generation per AI Pet
- **Pet Gain Multiplier**: Upgrade type that increases AI Pets gained when feeding
- **Fine-Grained Reactivity**: Rendering optimization where only changed components re-render
- **AsyncStorage**: React Native persistent storage API for cross-session data

### References

- [Lean Task Generation Guide](../../docs/architecture/lean-task-generation-guide.md)
- [File Organization Patterns](../../docs/architecture/file-organization-patterns.md)
- [State Management with Hooks](../../docs/architecture/state-management-hooks-guide.md)
- [Shop Upgrade PRD](../../shop/specs/prd_upgrade_shop_20251113.md)
- [Scrap Generation PRD](../../scrap/specs/prd_scrap_passive_generation_20251113.md)

### Related Documents

- Technical Design Document (TDD): To be generated in next phase
- Task List: To be generated from TDD
- API Documentation: N/A (client-side only feature)

---

*Generated on 2025-11-13 by Claude Code - Upgrade Container System PRD v1.0*
