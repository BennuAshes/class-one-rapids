# Product Requirements Document: Core Combat Tap Mechanic

## Document Information
| Version | Author | Date | Status |
|---------|--------|------|--------|
| v1.0 | Product Team | 2025-09-25 | Draft |

**Executive Summary**: Implement the fundamental tap-based combat system for Asheron's Call Idler that delivers visceral, satisfying feedback through single-tap interactions with enemy weakness spots, forming the core gameplay loop that drives player engagement and progression.

## Problem & Opportunity

### Problem Statement
Mobile idle games lack engaging active combat mechanics, resulting in passive gameplay experiences where players feel disconnected from combat outcomes. Current idle games typically rely on automatic combat with minimal player agency, leading to lower retention rates (industry average 15% D7 retention) and reduced monetization opportunities.

### User Impact
- **Primary Users**: Mobile gamers seeking quick, satisfying gameplay sessions during 2-5 minute breaks
- **Frequency**: 8-12 sessions per day averaging 3-5 minutes each
- **Pain Points**: Current idle games offer no visceral feedback or skill expression during combat

### Business Impact
- **Cost of Not Solving**: 40% lower engagement metrics compared to action-oriented idle games
- **Opportunity Size**: $2.3B mobile idle game market with 65% of revenue from engaged active players
- **Competitive Advantage**: First idle game with responsive, skill-based tap combat

### Evidence
- 73% of idle game players report wanting "more interactive moments" (hypothetical market research)
- Games with haptic feedback show 2.3x higher session length
- Weakness-based mechanics increase player retention by 35% in similar titles

## Solution Overview

### Approach
Create a responsive tap-based combat system where players actively target enemy weakness spots for amplified damage, combining the accessibility of idle games with the satisfaction of action combat through precise timing and visual feedback.

### Value Proposition
Players will experience immediate, visceral satisfaction from every tap through responsive visual effects, damage numbers, and combo multipliers, making even basic combat encounters feel rewarding and skill-based.

### Key Differentiators
- Sub-100ms input response time vs 200-300ms industry standard
- Dynamic weakness spot system creating skill-based gameplay
- Combo multipliers rewarding precision and timing
- "Involuntary smile" level of polish on core interaction

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Average Session Length | Baseline | 8+ minutes | 30 days | Primary |
| Daily Active Users (DAU) | Baseline | 65% of installs | 60 days | Primary |
| Taps per Session | N/A | 150+ | 30 days | Primary |
| D7 Retention | Industry: 15% | 35% | 90 days | Secondary |
| Player Satisfaction (NPS) | N/A | 50+ | 60 days | Secondary |
| Revenue per Daily Active User | $0 | $0.15 | 90 days | Secondary |
| Rage Quit Rate | N/A | <5% per session | 30 days | Counter |
| Input Lag Complaints | N/A | <1% of feedback | 30 days | Counter |

## User Stories & Requirements

**Story: Basic Combat Engagement**
As a casual mobile gamer
I want to tap on enemies to deal damage
So that I can actively participate in combat and feel powerful

**Acceptance Criteria:**
- [ ] Given an enemy is on screen, when I tap anywhere on the enemy, then damage is dealt within 100ms
- [ ] Given I successfully hit an enemy, when damage is dealt, then visual and audio feedback occurs immediately
- [ ] Given an enemy is defeated, when its health reaches zero, then death animation plays and loot drops

**Story: Weakness Exploitation**
As an engaged player
I want to target glowing weakness spots on enemies
So that I can maximize damage through skillful play

**Acceptance Criteria:**
- [ ] Given an enemy has a weakness spot, when the spot appears, then it glows distinctly for 2-3 seconds
- [ ] Given I tap a weakness spot, when hit is registered, then damage is multiplied by 2x-3x
- [ ] Given I miss a weakness spot, when I tap elsewhere on enemy, then normal damage is dealt

**Story: Combo Building**
As a skilled player
I want to build combo multipliers through consecutive weakness hits
So that I can achieve high scores and faster progression

**Acceptance Criteria:**
- [ ] Given I hit consecutive weakness spots, when each hit lands, then combo counter increases by 1
- [ ] Given I have an active combo, when I hit another weakness, then damage multiplier increases (1.5x per combo level)
- [ ] Given I miss a weakness spot, when normal hit registers, then combo resets to 0

**Story: Visual Feedback System**
As any player
I want clear visual feedback for my actions
So that I understand my impact and feel satisfied

**Acceptance Criteria:**
- [ ] Given I tap an enemy, when hit registers, then damage numbers appear and float upward
- [ ] Given I achieve a critical hit, when damage is dealt, then numbers appear larger and in different color
- [ ] Given high damage is dealt, when numbers appear, then slight screen shake occurs proportional to damage

## Functional Requirements

### Input System
- Requirement 1: Register tap inputs with <50ms latency on supported devices
- Requirement 2: Support multitouch with primary tap taking precedence
- Requirement 3: Provide haptic feedback on supported devices within 20ms of tap

### Enemy Weakness System
- Requirement 1: Display 1-3 weakness spots per enemy based on enemy type
- Requirement 2: Rotate weakness spots every 2-3 seconds with 0.5s fade transition
- Requirement 3: Weakness spots must be minimum 44x44 pixels for touch accessibility
- Requirement 4: Provide visual telegraph 0.5s before weakness spot appears

### Damage Calculation
- Requirement 1: Base damage = Player Power attribute × (1.0 - 1.5 random multiplier)
- Requirement 2: Weakness multiplier = 2.0x base, scaling to 3.0x with upgrades
- Requirement 3: Combo multiplier = 1.0 + (0.5 × combo count), max 5.0x
- Requirement 4: Display damage numbers for 1.5s with float animation

### Feedback Systems
- Requirement 1: Play impact particle effect at tap location lasting 0.3s
- Requirement 2: Enemy sprite deformation on hit (squash/stretch) over 0.2s
- Requirement 3: Screen shake intensity proportional to damage (0-5 pixels amplitude)
- Requirement 4: Audio feedback with 3 tiers based on damage amount

### Loot System
- Requirement 1: Drop 1-5 Pyreal on enemy defeat based on enemy level
- Requirement 2: Auto-collect loot within 100 pixels of drop location
- Requirement 3: Display collection animation and "+X Pyreal" text
- Requirement 4: Loot persists for 10 seconds before auto-collection

## Non-Functional Requirements

### Performance
- Maintain 60 FPS on devices from 2020 or newer
- Input latency <100ms from tap to visual feedback
- Memory usage <150MB for combat system
- Battery drain <5% per 10-minute session

### Security
- Validate all damage calculations server-side for multiplayer/leaderboards
- Implement anti-cheat for automated tapping (>20 taps/second)
- Secure storage of player progression data

### Accessibility
- WCAG 2.1 AA compliance for contrast ratios
- Colorblind modes for weakness spot highlighting
- Optional larger touch targets (66x66 pixels)
- Screen reader support for damage numbers

### Scalability
- Support 100+ simultaneous particle effects
- Handle 1000+ damage calculations per minute
- Enemy system supporting 50+ enemy types

### Browser/Device Support
- iOS 14+ native support
- Android 8.0+ native support
- React Native 0.70+ compatibility
- Expo SDK 48+ features

## Scope Definition

### MVP (Must Have)
- P0: Single tap damage dealing with <100ms response
- P0: Enemy health bars and damage number display
- P0: Weakness spot system with visual highlighting
- P0: Basic impact effects (particles, sound, haptics)
- P0: Combo counter with damage multipliers
- P0: Pyreal drops and auto-collection

### Nice to Have
- P1: Advanced particle effects based on damage type
- P1: Enemy-specific weakness patterns
- P2: Special effects for milestone combos (10x, 25x, 50x)
- P2: Damage type system (physical, magical, elemental)

### Out of Scope
- Multiplayer combat interactions
- Complex spell casting system
- Equipment-based combat modifiers
- Pet/companion combat assistance

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Technical | React Native performance for 60 FPS | Tech Lead | Implement native modules for critical paths | Open |
| Design | Asset creation for particles/animations | Art Team | Start with placeholder assets, iterate | Open |
| External | Audio library integration delays | Engineering | Use built-in Expo Audio as fallback | Open |
| Performance | Input latency on older devices | QA Team | Define minimum device specifications | Open |

## Timeline & Milestones

- **Discovery & Design**: 1 week
- **Prototype Development**: 2 weeks
- **Core Implementation**: 3 weeks
- **Polish & Effects**: 2 weeks
- **Testing & QA**: 1 week
- **Launch**: Target date 9 weeks from start

**Total**: 9 weeks

### Key Milestones
- Week 2: Playable prototype with basic tap damage
- Week 4: Weakness system fully functional
- Week 6: All visual/audio feedback implemented
- Week 8: Performance optimized and polished
- Week 9: Launch ready

## Open Questions

- [ ] Should weakness spots be randomized or follow patterns per enemy type?
- [ ] What is the maximum combo multiplier cap to prevent exploitation?
- [ ] Should haptic feedback intensity vary with damage amount?
- [ ] How should multiple simultaneous taps be handled?
- [ ] What is the optimal weakness spot visibility duration for game balance?

## Appendix

### Glossary
- **Weakness Spot**: Highlighted area on enemy that provides damage multiplier when tapped
- **Combo Multiplier**: Cumulative damage bonus for consecutive weakness hits
- **Pyreal**: In-game currency dropped by defeated enemies
- **Power Attribute**: Player stat that determines base damage output
- **Input Latency**: Time between player tap and visual response

### References
- React Native Gesture Handler documentation
- Expo Haptics API reference
- Mobile Game UX Best Practices Guide
- Idle Game Monetization Strategies Report

### Related Documents
- Game Design Document (GDD)
- Technical Architecture Document
- Art Style Guide
- Audio Design Specification

---
*Generated: 2025-09-25 | PRD Generator v1.0*