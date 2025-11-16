# Product Requirements Document: Scrap Resource System

## Overview

The Scrap Resource System introduces a passive resource generation mechanic to the clicker game where AI Pets automatically collect "scrap" over time. This system creates an idle/incremental game loop where players benefit from their AI Pet collection even when not actively clicking. Scrap represents shiny objects and materials that AI Pets gather autonomously, similar to how ravens collect shiny items in nature.

This feature establishes the foundation for a resource economy that will enable future gameplay systems and progression mechanics.

## Goals and Objectives

### Primary Goals
- Implement a passive resource generation system that rewards players for accumulating AI Pets
- Create a visible and trackable "scrap" currency that updates automatically
- Establish the technical foundation for future resource-based gameplay systems
- Enhance player engagement through idle progression mechanics

### Secondary Goals
- Provide visual feedback for scrap accumulation
- Ensure scrap generation is balanced and scales appropriately with AI Pet count
- Create a persistent resource that carries value even though it has no immediate use

## User Stories

### As a player:
1. I want to see my scrap total displayed clearly so I know how much I've accumulated
2. I want my AI Pets to automatically generate scrap every second so I can progress even when idle
3. I want to see my scrap count increase based on the number of AI Pets I own so I'm incentivized to get more pets
4. I want my scrap total to persist across sessions so my progress is not lost
5. I want to see visual feedback when scrap is generated so I feel progression is happening

### As a game designer:
1. I want to establish a foundational resource system that can support future features
2. I want scrap generation to scale linearly with AI Pet count for predictable balancing
3. I want the system to be extensible for future scrap consumption mechanics

## Functional Requirements

### FR-1: Scrap Generation
- **FR-1.1**: The system SHALL generate scrap every 1 second based on the player's current AI Pet count
- **FR-1.2**: Each AI Pet SHALL contribute equally to scrap generation (1 scrap per pet per second initially)
- **FR-1.3**: Scrap generation SHALL occur automatically without player input
- **FR-1.4**: Scrap generation SHALL only occur when the application is active (no offline progression)

### FR-2: Scrap Display
- **FR-2.1**: The current scrap total SHALL be displayed prominently in the user interface
- **FR-2.2**: The scrap display SHALL update in real-time as scrap is generated
- **FR-2.3**: The scrap value SHALL be formatted appropriately (e.g., with thousand separators for large numbers)
- **FR-2.4**: The UI SHALL clearly label the resource as "Scrap" with appropriate theming

### FR-3: Scrap Persistence
- **FR-3.1**: Scrap totals SHALL be saved to local storage
- **FR-3.2**: Scrap totals SHALL be restored when the player returns to the game
- **FR-3.3**: Scrap persistence SHALL use the same storage mechanism as other game state

### FR-4: AI Pet Integration
- **FR-4.1**: The system SHALL read the current AI Pet count from the game state
- **FR-4.2**: Scrap generation SHALL automatically adjust when AI Pet count changes
- **FR-4.3**: The relationship between AI Pets and scrap generation SHALL be transparent to the player

### FR-5: Resource Management
- **FR-5.1**: The system SHALL maintain an accurate scrap total at all times
- **FR-5.2**: The scrap total SHALL be a non-negative integer
- **FR-5.3**: The system SHALL prevent scrap underflow (going negative)
- **FR-5.4**: The system SHALL support future scrap consumption mechanics (extensibility)

## Non-Functional Requirements

### NFR-1: Performance
- **NFR-1.1**: Scrap generation calculations SHALL NOT cause noticeable performance degradation
- **NFR-1.2**: UI updates SHALL be smooth and not cause frame rate drops
- **NFR-1.3**: The 1-second generation interval SHALL be accurate within ±100ms

### NFR-2: Scalability
- **NFR-2.1**: The system SHALL handle scrap totals up to at least 1 trillion (10^12)
- **NFR-2.2**: The system SHALL support AI Pet counts up to at least 100,000
- **NFR-2.3**: The generation formula SHALL be easily adjustable for balancing

### NFR-3: Maintainability
- **NFR-3.1**: Scrap generation logic SHALL be modular and easily testable
- **NFR-3.2**: Code SHALL follow existing project patterns and conventions
- **NFR-3.3**: The system SHALL be documented with clear comments explaining the generation mechanics

### NFR-4: User Experience
- **NFR-4.1**: Scrap accumulation SHALL provide visible progression feedback
- **NFR-4.2**: The UI SHALL clearly communicate that scrap currently has no use
- **NFR-4.3**: The scrap display SHALL fit naturally within the existing game interface

### NFR-5: Reliability
- **NFR-5.1**: Scrap generation SHALL continue reliably during extended play sessions
- **NFR-5.2**: The system SHALL recover gracefully from any calculation errors
- **NFR-5.3**: Data persistence SHALL not fail silently

## Success Metrics

### Quantitative Metrics
1. **Technical Performance**: Scrap generation occurs precisely every 1 second (±100ms) in 99% of measurements
2. **Data Integrity**: 100% of scrap totals are successfully persisted and restored across sessions
3. **UI Responsiveness**: Scrap display updates occur within 50ms of generation events
4. **Test Coverage**: Minimum 90% code coverage for scrap-related functionality

### Qualitative Metrics
1. **Player Understanding**: Players can articulate that AI Pets generate scrap passively
2. **Visual Clarity**: Players can easily locate and read their current scrap total
3. **Code Quality**: Code review confirms adherence to project standards and patterns
4. **Extensibility**: Future developers can easily add scrap consumption features

### Validation Criteria
- Scrap generation starts immediately when player has at least 1 AI Pet
- Scrap generation rate increases proportionally with AI Pet purchases
- Scrap total persists correctly across browser refreshes
- UI displays scrap total without layout issues or text overflow
- All automated tests pass successfully

## Out of Scope

### Explicitly Excluded from This Release
1. **Scrap Consumption**: Any mechanics for spending or using scrap (future feature)
2. **Scrap Upgrades**: Multipliers, boosters, or efficiency improvements for scrap generation
3. **Offline Progression**: Calculating scrap earned while the application is closed
4. **Scrap Sources**: Alternative methods of gaining scrap beyond AI Pet generation
5. **Scrap Caps**: Maximum limits on scrap accumulation
6. **Visual Effects**: Animations, particles, or special effects for scrap generation
7. **Audio Feedback**: Sound effects for scrap accumulation
8. **Scrap Conversion**: Exchanging scrap for other resources or currencies
9. **Scrap Statistics**: Detailed tracking of scrap earned per session, total lifetime scrap, etc.
10. **Multi-Resource System**: Introduction of additional resource types alongside scrap

### Future Considerations
- Shop system where scrap can be spent on items or upgrades
- Prestige mechanics involving scrap
- Scrap-based progression gates
- Social features involving scrap trading or gifting
- Analytics dashboard for scrap generation rates

## Technical Considerations

### Architecture
- Utilize React hooks for scrap state management
- Implement useEffect for interval-based generation
- Leverage existing localStorage persistence patterns
- Follow component composition patterns from existing codebase

### Dependencies
- React state management system
- Existing AI Pet state/count tracking
- LocalStorage API for persistence
- Existing game loop or timing system

### Testing Strategy
- Unit tests for scrap generation calculations
- Integration tests for scrap persistence
- Component tests for UI display and updates
- E2E tests for complete scrap accumulation flow

## Assumptions and Constraints

### Assumptions
1. Players have access to localStorage (no private browsing mode issues)
2. The game has an existing AI Pet purchase/tracking system
3. The game runs continuously in an active browser tab during play sessions
4. Number formatting utilities exist or can be easily implemented

### Constraints
1. Must use existing game state management patterns
2. Must follow existing UI/UX design language
3. Must not negatively impact performance of existing features
4. Must be implementable without external dependencies

## Appendix

### Glossary
- **Scrap**: The passive resource generated by AI Pets, representing collected shiny objects
- **AI Pet**: Game entity that generates scrap passively
- **Generation Rate**: Amount of scrap produced per time unit (1 scrap per AI Pet per second)
- **Passive Generation**: Resource accumulation that occurs automatically without player interaction

### Related Documents
- Feature Description: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/feature-scrap.md`
- Existing Clicker System Documentation
- AI Pet System Specification (if exists)

### Open Questions
1. Should there be visual feedback (animation/highlight) when scrap is generated?
2. What should the tooltip/help text say about scrap having no current use?
3. Should we cap the display at a certain number and use scientific notation?
4. Should we show a scrap/second rate indicator to players?

### Change Log
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-16 | System | Initial PRD creation |
