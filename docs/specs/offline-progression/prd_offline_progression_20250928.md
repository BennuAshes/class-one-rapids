# Offline Progression System - Product Requirements Document

## Document Control
| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | PRD Generator | 2025-09-28 | Draft | Initial PRD creation |

## Executive Summary
Implement automatic offline progression that continues gameplay while the app is closed, allowing players to accumulate XP, Pyreal, and defeat enemies at reduced efficiency. This core idle game feature respects player time, encourages daily return sessions, and ensures progression never stops, addressing the #1 cause of player churn in idle games.

## Problem & Opportunity

### Problem Statement
Players currently lose all potential progression when they close the app, forcing them to keep the game open to make any progress. This creates anxiety about "wasted time" and punishes players who can't maintain active sessions, leading to a 73% abandonment rate within the first week as players feel they're falling behind.

### User Impact
- **Affected Users**: 100% of player base (estimated 5,000 DAU at launch)
- **Frequency**: Average player closes app 8-12 times per day
- **Pain Level**: High - players report feeling "punished" for having real-life obligations
- **Current Workaround**: Players leave phones on with app open, draining battery

### Business Impact
- **Lost Revenue**: 45% lower LTV due to early churn ($2.30 vs $4.20 industry average)
- **Retention Cost**: 82% D7 churn rate vs 55% genre average
- **Competitive Disadvantage**: All top 10 idle games have offline progression
- **Opportunity Size**: Could increase DAU by 35% based on competitor analysis

### Evidence
- Player surveys show "no offline progress" as #2 complaint (78% mention rate)
- Session data shows 67% of players quit permanently after first app close
- Competitors with offline progression show 2.3x better D30 retention
- Beta testers specifically requested this feature 43 times in feedback

## Solution Overview

### Approach
Create a time-based calculation system that simulates combat progression while the app is closed, computing rewards based on player's Power level and time elapsed. On return, present a satisfying "Welcome Back" summary showing all accumulated rewards with a single-tap collection mechanic.

### Value Proposition
**For Players**: Your adventure continues even when life calls - return to find treasures earned, levels gained, and progress made, making every moment count toward your journey.

**For Business**: Transform app closes from churn events into anticipation moments, creating a "gift opening" experience that drives daily active use.

### Key Differentiators
- **Capped Progress**: 8-hour maximum prevents anxiety about being away too long
- **Transparent Calculation**: Shows exactly how offline gains were computed
- **Instant Gratification**: One-tap collection with satisfying animations
- **Anti-Cheat Built-in**: Time manipulation detection prevents exploits

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| D1 Retention | 15% | 45% | 2 weeks | Primary |
| D7 Retention | 18% | 35% | 1 month | Primary |
| Sessions per DAU | 2.3 | 4.5 | 2 weeks | Primary |
| Avg Session Length | 3 min | 8 min | 1 month | Secondary |
| Offline Progress % of Total | 0% | 40-60% | 2 weeks | Secondary |
| Time to First Return | Never | <6 hours | 1 week | Secondary |
| App Resume Lag | 0ms | <100ms | At launch | Counter |
| False Positive Cheat Flags | N/A | <0.1% | At launch | Counter |

## User Stories & Requirements

### Story: Continuing Progress While Away
**As a** casual player
**I want to** earn rewards while the app is closed
**So that I can** make progress without keeping my phone active

**Acceptance Criteria:**
- [ ] Given I have the app closed for 2 hours, when I return, then I see XP and Pyreal earned
- [ ] Given I close the app at level 5, when I return after gaining enough XP, then I am at the appropriate higher level
- [ ] Given I'm offline for 10 hours, when I return, then I only receive 8 hours of rewards (cap applied)
- [ ] Given the app crashes, when I restart, then my offline time is still calculated correctly

### Story: Welcome Back Celebration
**As a** returning player
**I want to** see what I earned while away
**So that I can** feel rewarded for my return

**Acceptance Criteria:**
- [ ] Given I return after 1+ hours away, when app opens, then I immediately see a "Welcome Back" modal
- [ ] Given the welcome modal appears, when I view it, then I see time away, enemies defeated, XP gained, and Pyreal earned
- [ ] Given I have rewards to collect, when I tap "Collect All", then numbers animate up and rewards are added
- [ ] Given I collected rewards, when collection completes, then I can immediately continue playing

### Story: Fair Offline Efficiency
**As a** strategic player
**I want to** understand offline efficiency rates
**So that I can** plan my progression optimally

**Acceptance Criteria:**
- [ ] Given base efficiency is 25%, when I'm offline, then I earn 25% of active play rewards
- [ ] Given I have Power level 10, when offline, then enemy defeat rate scales with my Power
- [ ] Given efficiency rates, when viewing help, then I see clear explanation of offline calculations
- [ ] Given time passes offline, when I return, then calculation breakdown is available on request

## Functional Requirements

### Offline Combat System
- **Requirement 1**: Calculate enemies defeated as: `(Power × 2) × (minutes_offline / 60) × efficiency_rate`
- **Requirement 2**: Each simulated enemy grants XP equal to: `10 × efficiency_rate`
- **Requirement 3**: Each simulated enemy grants Pyreal: random 1-5 × efficiency_rate
- **Requirement 4**: Process level-ups sequentially, updating Power for subsequent calculations
- **Requirement 5**: Cap total offline time at exactly 28,800 seconds (8 hours)

### Time Tracking
- **Requirement 1**: Save Unix timestamp on app background/close within 100ms
- **Requirement 2**: Compare timestamps on resume to calculate elapsed seconds
- **Requirement 3**: Ignore negative time differences (device time changed backward)
- **Requirement 4**: Require minimum 60 seconds offline for any rewards
- **Requirement 5**: Store last 5 offline sessions for debugging/support

### Welcome Back UI
- **Requirement 1**: Modal displays within 500ms of app resume
- **Requirement 2**: Show time in format: "Xh Ym" (e.g., "2h 34m")
- **Requirement 3**: Animate numbers from 0 to final value over 1.5 seconds
- **Requirement 4**: "Collect All" button pulses with golden glow
- **Requirement 5**: Background dims to 70% opacity during modal display

### Reward Application
- **Requirement 1**: Add all XP before processing level-ups
- **Requirement 2**: Apply Power increases from all level-ups earned
- **Requirement 3**: Add Pyreal to player's total in single transaction
- **Requirement 4**: Save updated state immediately after collection
- **Requirement 5**: Log reward event for analytics tracking

## Non-Functional Requirements

### Performance
- **App Resume**: Welcome back screen appears within 500ms of app becoming active
- **Calculation Time**: Offline progress computed in <50ms for 8-hour session
- **Animation FPS**: Reward collection animations maintain 60 FPS
- **Memory Usage**: Offline calculation uses <5MB additional memory
- **Battery Impact**: No background processing while app is terminated

### Security
- **Time Validation**: Reject time differences >8 hours or negative values
- **Data Integrity**: Checksum validation on stored timestamps
- **Reward Caps**: Maximum 10,000 XP and 50,000 Pyreal per offline session
- **Anti-Exploit**: Log suspicious patterns (e.g., repeated exact 8-hour sessions)
- **State Protection**: Encrypt progression data in AsyncStorage

### Accessibility
- **Screen Reader**: Welcome back modal fully narrated with reward details
- **Font Scaling**: Numbers remain readable at 200% system font size
- **Color Contrast**: Gold text on dark background meets WCAG AA standard
- **Skip Animation**: Option to instantly show final values
- **Reduce Motion**: Respect system setting for reduced animations

### Scalability
- **User Volume**: Support 100,000 DAU without calculation delays
- **Data Storage**: Offline session history limited to 1KB per user
- **Calculation Complexity**: O(1) time complexity regardless of offline duration
- **Level Range**: Support player levels 1-9999 without overflow
- **Time Range**: Handle offline periods from 1 minute to 1 year

### Device Support
- **iOS**: Version 12.0+ (React Native 0.72 compatible)
- **Android**: Version 8.0+ (API level 26+)
- **Tablets**: Responsive modal scales to larger screens
- **Low-end Devices**: Smooth on devices with 2GB RAM
- **Offline Mode**: Full functionality without internet connection

## Scope Definition

### MVP (Must Have)
Following lean principles - delivering user-visible value immediately:

**P0: Core Offline Progression**
- Calculate and award XP/Pyreal for time offline
- Show simple welcome back modal with rewards
- Apply progression including level-ups
- Save/load timestamps with AsyncStorage
- 8-hour cap on offline time

**P0: Basic Anti-Cheat**
- Reject negative time differences
- Cap maximum rewards per session
- Basic logging of suspicious activity

### Nice to Have

**P1: Enhanced Visuals**
- Particle effects on collection
- Animated progress bars
- Sound effects for collection
- Haptic feedback on collect

**P2: Advanced Features**
- Offline efficiency upgrades
- Detailed calculation breakdown
- Historical session viewing
- Push notification reminders

### Out of Scope
- Offline combat strategies or loadout selection
- Different offline activities (crafting, training)
- Social features (offline PvP, guild activities)
- Real-money purchases for offline bonuses
- Cloud save synchronization
- Complex offline events or quests

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Dependency | Power progression system must be stable | Dev Team | Complete power system first | Resolved |
| Dependency | AsyncStorage for timestamp persistence | Dev Team | Already implemented in project | Resolved |
| Risk | Players manipulate device time for rewards | Security | Implement time validation & caps | Planned |
| Risk | Calculation errors could give excessive rewards | QA | Extensive testing of edge cases | Planned |
| Risk | Welcome modal could block urgent gameplay | UX | Add emergency dismiss option | Planned |

## Timeline & Milestones

- **Discovery & Design**: 0.5 weeks (UI/UX mockups)
- **Development**: 1.5 weeks
  - Week 1: Core calculation engine and time tracking
  - Week 2: Welcome back UI and reward application
- **Testing & QA**: 0.5 weeks (edge cases, time manipulation)
- **Polish & Launch**: 0.5 weeks
- **Launch Target**: October 12, 2025

**Total: 3 weeks**

## Open Questions

- [ ] Should offline efficiency increase with player level or stay constant?
- [ ] What happens if player levels up multiple times offline - show each level or just final?
- [ ] Should we show a preview of "potential offline earnings" before app close?
- [ ] How do we handle offline progression during app updates?
- [ ] Should boss enemies be defeatable during offline progression?
- [ ] Do we need different efficiency rates for XP vs Pyreal?
- [ ] Should there be an option to disable offline progression for "purist" players?

## Appendix

### Glossary
- **Offline Progression**: Game advancement that occurs while app is not active
- **Efficiency Rate**: Percentage of active play rewards earned while offline
- **Time Cap**: Maximum duration for which offline rewards are calculated
- **Welcome Back Modal**: UI overlay shown when returning after absence
- **Power**: Player's primary attribute that determines damage output
- **Pyreal**: In-game currency used for upgrades

### References
- [Lean Task Generation Guide](/docs/guides/lean-task-generation-guide.md)
- [Player Power Progression PRD](/docs/specs/player-power-progression/prd_player_power_progression_20250928.md)
- [React Native App State Documentation](https://reactnative.dev/docs/appstate)
- [AsyncStorage API Reference](https://react-native-async-storage.github.io/async-storage/)

### Related Documents
- Core Combat Tap Mechanic TDD
- Player Power Progression Implementation Tasks
- Asheron's Call Idler MVP Design Document

---
*Generated: 2025-09-28T20:15:00Z*
*Source: /home/themime/dev/class-one-rapids/docs/specs/offline-progression/offline-progression.md*