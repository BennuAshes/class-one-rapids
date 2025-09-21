# Product Requirements Document: Core Combat Tap Mechanic

| Version | Date | Author | Status |
|---------|------|--------|--------|
| v1.0 | 2025-09-20 | Development Team | Draft |

**Executive Summary**: Implement the fundamental tap-based combat system for Asheron's Call Idler that delivers visceral, responsive combat feedback through touch interactions. This core mechanic forms the foundation of all gameplay and must achieve exceptional polish to make the game engaging even without additional features.

## Problem & Opportunity

### Problem Statement
Mobile idle games often suffer from shallow combat mechanics that feel disconnected and unsatisfying. Players lose engagement quickly when core interactions lack meaningful feedback and progression. Current market solutions either focus too heavily on automation (removing player agency) or require complex control schemes unsuitable for mobile platforms.

### User Impact
- **Primary Users**: Mobile gamers seeking engaging idle/incremental experiences (estimated 50M+ users globally)
- **Frequency**: Core interaction used hundreds of times per play session
- **Pain Points**: Existing games lack satisfying combat feedback, unclear progression mechanics, and poor touch responsiveness

### Business Impact
- **Retention Risk**: Poor core mechanics lead to 70%+ day-1 churn in mobile games
- **Revenue Impact**: Unsatisfying gameplay directly correlates to reduced IAP conversion (industry average 2-5%)
- **Market Opportunity**: Quality execution could capture significant market share in $5B+ idle game market

### Evidence
- Market research shows 65% of idle game players abandon games within first session due to poor core mechanics
- Top-performing idle games achieve 85%+ user satisfaction on core interaction feedback
- Benchmark analysis reveals tap-to-damage response times >150ms significantly impact player enjoyment

## Solution Overview

### Approach
Develop a polished, responsive tap-based combat system centered on hitting enemy weakness spots with immediate visual, audio, and haptic feedback. The system emphasizes skill-based timing and precision while maintaining the accessibility expected in idle games.

### Value Proposition
- **Instant Gratification**: Sub-100ms tap response with satisfying feedback
- **Skill Expression**: Weakness spot targeting adds strategic depth
- **Progressive Power**: Combo system rewards sustained engagement
- **Polish First**: Core mechanic feels exceptional even without additional features

### Key Differentiators
- Dynamic weakness spot system vs. static tap zones
- Combo multiplier system rewards precision over button mashing
- Multi-layered feedback (visual + audio + haptic) creates visceral satisfaction
- Scalable damage system accommodates incremental progression

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Tap Response Time | N/A | <100ms | Launch | Primary |
| Combat Session Length | N/A | 3-5 minutes | 4 weeks post-launch | Primary |
| Day-1 Retention | N/A | 65%+ | 2 weeks post-launch | Primary |
| Combat Interaction Rate | N/A | 80+ taps/minute | Launch | Secondary |
| User Satisfaction Score | N/A | 4.2+ stars | 4 weeks post-launch | Secondary |
| Combo Success Rate | N/A | 45%+ | 2 weeks post-launch | Secondary |
| Session Abandonment Rate | N/A | <15% | Launch | Counter-metric |

## User Stories & Requirements

**Story: Responsive Combat Feedback**
As a mobile gamer
I want immediate, satisfying feedback when I tap enemies
So that I feel connected to the combat and motivated to continue playing

**Acceptance Criteria:**
- [ ] Given an enemy is displayed, when I tap within enemy bounds, then visual impact effect appears within 100ms
- [ ] Given a successful hit, when damage is calculated, then damage number appears with scaling animation
- [ ] Given multiple rapid hits, when combo threshold is reached, then combo multiplier visual indicator activates

**Story: Weakness Spot Strategy**
As a player seeking skill expression
I want to target enemy weak points for bonus damage
So that I can feel mastery and progression in my combat skills

**Acceptance Criteria:**
- [ ] Given an enemy appears, when weakness spots are generated, then highlighted areas are clearly visible
- [ ] Given I tap a weakness spot, when hit registers, then bonus damage calculation applies (150-200% base damage)
- [ ] Given weakness spot is hit, when effect triggers, then distinct visual/audio feedback differentiates from normal hits

**Story: Progressive Power Fantasy**
As an idle game player
I want my attacks to feel increasingly powerful
So that I experience meaningful progression and growth

**Acceptance Criteria:**
- [ ] Given player Power attribute increases, when damage is calculated, then numbers scale appropriately
- [ ] Given successful combos, when multiplier builds, then damage numbers and effects become more dramatic
- [ ] Given enemy defeat, when loot drops, then Pyreal collection happens automatically with satisfying pickup effect

## Functional Requirements

### **Combat Input System**
- Touch input detection with 100ms maximum response time
- Accurate hit detection within enemy sprite boundaries
- Support for rapid tapping without input loss or lag
- Tap location precision tracking for weakness spot validation

### **Enemy Interaction System**
- Dynamic weakness spot generation (2-4 spots per enemy)
- Weakness spot highlighting with pulsing/glowing effects
- Enemy health bar display with smooth depletion animation
- Enemy defeat state with satisfying destruction animation

### **Damage Calculation Engine**
- Base damage calculation using player Power attribute
- Weakness spot bonus damage (150-200% multiplier)
- Combo system with stacking multipliers (max 5x)
- Damage number display with appropriate scaling and color coding

### **Feedback Systems**
- Particle effect system for hit impacts and enemy destruction
- Screen shake effect for powerful hits (configurable intensity)
- Enemy sprite deformation on hit (squash/stretch animation)
- Audio feedback with layered sound effects for different hit types

### **Loot and Progression**
- Pyreal currency drop on enemy defeat
- Automatic loot collection with magnetic pickup animation
- Currency counter update with smooth counting animation
- Enemy respawn system with appropriate timing

## Non-Functional Requirements

### **Performance**
- Maintain 60 FPS during intensive combat sequences
- Tap-to-feedback response time <100ms on target devices
- Memory usage <50MB for combat system components
- Battery consumption optimized for extended play sessions

### **Security**
- Client-side validation with server-side verification for progression
- Anti-cheat measures for tap rate and damage validation
- Secure currency transaction logging

### **Accessibility**
- High contrast mode for weakness spot visibility
- Configurable haptic feedback intensity
- Audio cue alternatives for visual feedback
- Tap area tolerance adjustment for motor accessibility

### **Scalability**
- Support for damage numbers up to 999,999,999
- Efficient particle pooling for performance at scale
- Smooth animation scaling for varying device performance
- Progressive quality settings based on device capabilities

### **Device Support**
- iOS 12+ and Android 8.0+ compatibility
- Support for screen sizes from 4.7" to 12.9"
- Optimized touch detection for various screen technologies
- Performance scaling for devices with 2GB+ RAM

## Scope Definition

### **MVP (Must Have):**
- **P0**: Basic tap input with <100ms response time
- **P0**: Enemy weakness spot system with visual highlighting
- **P0**: Damage calculation with Power attribute scaling
- **P0**: Visual feedback (particles, screen shake, damage numbers)
- **P0**: Audio feedback system with hit sound effects
- **P0**: Enemy health bars with smooth depletion
- **P0**: Basic combo system (3-hit minimum for multiplier)
- **P0**: Pyreal drop and auto-collection on enemy defeat

### **Nice to Have:**
- **P1**: Advanced particle effects and enemy deformation animations
- **P1**: Dynamic weakness spot positioning based on enemy type
- **P1**: Haptic feedback integration for iOS devices
- **P1**: Combat tutorial and onboarding sequence
- **P2**: Multiple enemy types with varying weakness patterns
- **P2**: Critical hit system with rare bonus multipliers
- **P2**: Combat statistics tracking and display

### **Out of Scope:**
- Multiple enemy types (single enemy type for MVP)
- Equipment or weapon system integration
- Social features or leaderboards
- Advanced enemy AI or attack patterns
- Prestige or rebirth mechanics

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Technical | React Native performance limitations for 60 FPS | Engineering | Optimize rendering, implement object pooling | Monitoring |
| Design | Asset creation for particles and animations | Art Team | Create placeholder assets, iterate based on feedback | In Progress |
| Technical | Audio system integration complexity | Engineering | Use proven audio libraries, implement fallbacks | Planning |
| Business | User testing validation of "fun factor" | Product | Implement analytics, conduct user testing sessions | Planning |
| Technical | Device compatibility across Android fragmentation | Engineering | Focus on target devices, progressive enhancement | Monitoring |

## Timeline & Milestones

- **Discovery & Design**: 1 week
  - Finalize technical architecture
  - Complete art asset specifications
  - User testing plan development

- **Development**: 4 weeks
  - Week 1: Core input system and basic feedback
  - Week 2: Weakness spot system and damage calculation
  - Week 3: Visual effects and animation system
  - Week 4: Audio integration and polish

- **Testing & QA**: 2 weeks
  - Performance optimization and device testing
  - User acceptance testing and feedback iteration
  - Bug fixes and final polish

- **Launch**: Target date - Week of October 28, 2025

**Total**: 7 weeks

## Open Questions

- [ ] What haptic feedback patterns work best for different hit types?
- [ ] Should combo multipliers have a time decay or persist until missed hit?
- [ ] What's the optimal weakness spot size for various screen sizes?
- [ ] How should damage numbers scale visually at extreme values (millions+)?
- [ ] Should there be different audio feedback for different Power levels?
- [ ] What's the ideal balance between skill requirement and accessibility?

## Appendix

### Glossary of Terms
- **Power**: Player attribute that determines base damage output
- **Weakness Spot**: Highlighted enemy areas that provide bonus damage when hit
- **Combo Multiplier**: Damage bonus achieved through consecutive successful hits
- **Pyreal**: In-game currency earned from defeating enemies
- **Hit Detection**: System that determines if tap input successfully targets enemy

### References and Links
- Game Design Document: [Internal Document]
- Technical Architecture Spec: [Internal Document]
- Asheron's Call Original Combat System Reference
- Market Research Report: Mobile Idle Game Mechanics (2025)

### Related Documents
- `/docs/specs/core-combat-tap-mechanic.md` - Technical feature specification
- MVP Requirements Document
- Art Asset Pipeline Documentation
- Audio System Integration Guide

---
*Generated on 2025-09-20 using Claude Code PRD Template*