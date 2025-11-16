# Product Requirements Document: Shop System

## Overview

The Shop System introduces a strategic spending mechanism for the scrap resource, enabling players to purchase upgrades that enhance their progression in the clicker game. This system creates a meaningful progression loop where players accumulate scrap through AI Pet generation and invest it into permanent upgrades that improve either scrap generation efficiency or AI Pet acquisition rates.

This feature transforms scrap from a passive accumulation mechanic into an active strategic resource, giving players meaningful choices about how to optimize their progression path. The shop serves as the foundation for future upgrade systems and provides the core economic gameplay loop.

## Goals and Objectives

### Primary Goals
- Implement a dedicated shop screen accessible from the main game interface
- Create a UI framework for displaying and purchasing upgrades
- Establish the upgrade purchase flow including cost validation and state updates
- Enable navigation between the main clicker screen and shop screen
- Provide a scalable architecture for adding future upgrades

### Secondary Goals
- Create an intuitive upgrade browsing experience
- Provide clear feedback on upgrade costs and affordability
- Establish visual patterns for upgrade categorization (scrap efficiency vs. pet acquisition)
- Ensure smooth navigation transitions between screens
- Set up extensible data structures for upgrade definitions

## User Stories

### As a player:
1. I want to access the shop from the main screen so I can see what upgrades are available
2. I want to see all available upgrades in an organized list so I can understand my options
3. I want to see upgrade costs clearly so I know how much scrap I need
4. I want to know if I can afford an upgrade before attempting to purchase it
5. I want to purchase upgrades with my scrap so I can improve my progression
6. I want to see my scrap balance update when I make a purchase so I know the transaction succeeded
7. I want purchased upgrades to be marked or hidden so I don't accidentally buy them twice
8. I want to return to the main game screen after shopping so I can continue playing
9. I want my upgrade purchases to persist across sessions so my progress is saved
10. I want to see what effect each upgrade will have before purchasing it

### As a game designer:
1. I want a flexible upgrade definition system that can support different upgrade types
2. I want to establish two upgrade categories: scrap efficiency and pet acquisition
3. I want the shop to be easily extensible for adding new upgrades in the future
4. I want to ensure proper validation prevents invalid purchases
5. I want the economic balance to encourage strategic decision-making

## Functional Requirements

### FR-1: Shop Navigation
- **FR-1.1**: The main clicker screen SHALL provide a clearly visible button/link to access the shop
- **FR-1.2**: Tapping the shop access button SHALL navigate the player to the shop screen
- **FR-1.3**: The shop screen SHALL provide a back button/navigation to return to the main screen
- **FR-1.4**: Navigation transitions SHALL be smooth and consistent with platform conventions
- **FR-1.5**: The player's current scrap balance SHALL remain visible in the shop screen

### FR-2: Upgrade Display
- **FR-2.1**: The shop SHALL display all available upgrades in a scrollable list
- **FR-2.2**: Each upgrade listing SHALL display the upgrade name
- **FR-2.3**: Each upgrade listing SHALL display the scrap cost
- **FR-2.4**: Each upgrade listing SHALL display a description of what the upgrade does
- **FR-2.5**: Upgrades SHALL be visually categorized or labeled by type (scrap efficiency vs. pet acquisition)
- **FR-2.6**: The shop SHALL clearly indicate which upgrades are currently affordable
- **FR-2.7**: The shop SHALL disable or visually differentiate upgrades the player cannot afford

### FR-3: Upgrade Purchase Flow
- **FR-3.1**: Each upgrade SHALL have a purchase button or tap target
- **FR-3.2**: The system SHALL validate the player has sufficient scrap before allowing purchase
- **FR-3.3**: When a purchase is valid, the system SHALL deduct the upgrade cost from the player's scrap balance
- **FR-3.4**: When a purchase is valid, the system SHALL mark the upgrade as purchased
- **FR-3.5**: Purchased upgrades SHALL be removed from the available upgrades list OR clearly marked as owned
- **FR-3.6**: The system SHALL prevent duplicate purchases of the same upgrade
- **FR-3.7**: Purchase transactions SHALL be atomic (all-or-nothing)
- **FR-3.8**: Failed purchase attempts SHALL provide clear feedback to the player

### FR-4: Upgrade System Architecture
- **FR-4.1**: The system SHALL support two upgrade effect types: scrap generation multiplier and AI Pet acquisition bonus
- **FR-4.2**: Upgrade definitions SHALL be data-driven and easily configurable
- **FR-4.3**: The system SHALL track which upgrades have been purchased
- **FR-4.4**: The system SHALL apply purchased upgrade effects to gameplay automatically
- **FR-4.5**: The upgrade system SHALL be extensible to support future upgrade types
- **FR-4.6**: Each upgrade SHALL have a unique identifier for tracking purposes

### FR-5: Data Persistence
- **FR-5.1**: Purchased upgrades SHALL be saved to local storage
- **FR-5.2**: Purchased upgrades SHALL be restored when the player returns to the game
- **FR-5.3**: Upgrade persistence SHALL use the same storage mechanism as other game state
- **FR-5.4**: Persistence failures SHALL not corrupt existing game state

### FR-6: Integration with Existing Systems
- **FR-6.1**: Scrap generation upgrades SHALL modify the scrap earned per AI Pet per second
- **FR-6.2**: Pet acquisition upgrades SHALL modify the number of AI Pets gained per feed button press
- **FR-6.3**: Upgrade effects SHALL stack if multiple upgrades of the same type are purchased
- **FR-6.4**: Upgrade effects SHALL be applied immediately upon purchase
- **FR-6.5**: The main screen SHALL reflect upgrade effects in real-time

## Non-Functional Requirements

### NFR-1: User Experience
- **NFR-1.1**: The shop interface SHALL be intuitive and require no tutorial to understand
- **NFR-1.2**: Upgrade costs and effects SHALL be clearly communicated
- **NFR-1.3**: The shop SHALL provide visual feedback for all user interactions
- **NFR-1.4**: Navigation between screens SHALL feel responsive and natural
- **NFR-1.5**: The shop layout SHALL adapt properly to different screen sizes

### NFR-2: Performance
- **NFR-2.1**: Opening the shop screen SHALL take less than 300ms
- **NFR-2.2**: Purchase transactions SHALL complete within 100ms
- **NFR-2.3**: The upgrade list SHALL render smoothly even with 50+ upgrades
- **NFR-2.4**: Navigation transitions SHALL maintain 60 FPS on target devices
- **NFR-2.5**: Upgrade calculations SHALL not cause noticeable performance degradation

### NFR-3: Scalability
- **NFR-3.1**: The system SHALL support at least 100 different upgrade definitions
- **NFR-3.2**: The architecture SHALL accommodate future upgrade effect types without major refactoring
- **NFR-3.3**: Upgrade definitions SHALL be easily modifiable for balancing purposes
- **NFR-3.4**: The system SHALL handle edge cases like maximum value overflow gracefully

### NFR-4: Maintainability
- **NFR-4.1**: Upgrade data structures SHALL be well-documented and self-explanatory
- **NFR-4.2**: The shop component SHALL follow existing project patterns and conventions
- **NFR-4.3**: Code SHALL be modular with clear separation of concerns
- **NFR-4.4**: Unit tests SHALL cover core purchase logic and validation
- **NFR-4.5**: The system SHALL use TypeScript types for upgrade definitions

### NFR-5: Accessibility
- **NFR-5.1**: All interactive elements SHALL meet minimum touch target sizes (44x44 points)
- **NFR-5.2**: Text SHALL have sufficient contrast ratios for readability
- **NFR-5.3**: Screen readers SHALL be able to navigate the shop interface
- **NFR-5.4**: All buttons SHALL have appropriate accessibility labels
- **NFR-5.5**: Disabled states SHALL be clearly distinguishable visually

### NFR-6: Reliability
- **NFR-6.1**: Purchase validation SHALL prevent all invalid transactions
- **NFR-6.2**: The system SHALL handle concurrent purchase attempts safely
- **NFR-6.3**: Data persistence SHALL not fail silently
- **NFR-6.4**: The shop SHALL recover gracefully from storage errors
- **NFR-6.5**: Invalid upgrade definitions SHALL be detected during development

## Success Metrics

### Quantitative Metrics
1. **Navigation Success**: 100% of shop navigation attempts successfully open/close the shop screen
2. **Purchase Accuracy**: 100% of valid purchases complete successfully; 100% of invalid purchases are prevented
3. **Data Persistence**: 100% of purchased upgrades are correctly saved and restored across sessions
4. **Performance**: Shop screen opens in <300ms in 95% of cases
5. **Test Coverage**: Minimum 90% code coverage for shop and upgrade functionality

### Qualitative Metrics
1. **User Understanding**: Players can articulate what upgrades do and how to purchase them
2. **Visual Clarity**: Players can easily identify affordable vs. unaffordable upgrades
3. **Navigation Intuitiveness**: Players can navigate to and from the shop without confusion
4. **Code Quality**: Code review confirms adherence to project standards and patterns
5. **Extensibility**: Future developers can easily add new upgrades without modifying core logic

### Validation Criteria
- Players can access the shop from the main screen with a single tap
- Upgrades display clearly with name, cost, and description
- Players cannot purchase upgrades they cannot afford
- Scrap balance updates immediately after purchase
- Purchased upgrades are marked/removed to prevent duplicate purchases
- Players can return to the main screen seamlessly
- All automated tests pass successfully
- Upgrade effects apply correctly to gameplay mechanics

## Out of Scope

### Explicitly Excluded from This Release
1. **Specific Upgrade Implementations**: Individual upgrades (Bot Factory, Storage Pouch, etc.) will be separate features
2. **Upgrade Previews**: Showing exact numerical impact before purchase (e.g., "Your scrap/sec will increase from 10 to 15")
3. **Multi-Purchase**: Buying multiple quantities of the same upgrade in a single transaction
4. **Upgrade Refunds**: Ability to sell back or undo upgrade purchases
5. **Upgrade Categories/Tabs**: Organizing upgrades into separate sections or tabs
6. **Search/Filter**: Finding specific upgrades in a large list
7. **Upgrade Recommendations**: Suggesting which upgrades to buy based on play style
8. **Unlock Requirements**: Upgrades that require prerequisites beyond scrap cost
9. **Limited Quantity Upgrades**: Upgrades that can only be purchased a certain number of times
10. **Timed Sales**: Temporary discounts or special offers on upgrades
11. **Upgrade Animations**: Special visual effects when purchasing or applying upgrades
12. **Confirmation Dialogs**: "Are you sure you want to purchase this?" prompts
13. **Undo Last Purchase**: Reverting the most recent purchase
14. **Upgrade Tooltips**: Long-press or hover for detailed information
15. **Comparison Tools**: Comparing multiple upgrades side-by-side

### Future Considerations
- Upgrade tiers/levels (purchasing the same upgrade multiple times for increasing costs)
- Synergy effects between certain upgrade combinations
- Achievement system tied to upgrade purchases
- Statistics tracking (total upgrades owned, total scrap spent, etc.)
- Upgrade prestige mechanics
- Alternative currencies for special upgrades
- Time-limited exclusive upgrades
- Upgrade bundles or packages

## Technical Considerations

### Architecture
- Implement React Navigation or similar for screen management
- Utilize React hooks for shop state management (useState, useEffect)
- Create reusable upgrade list item components
- Implement centralized upgrade definition data structure
- Follow existing localStorage persistence patterns from scrap and counter systems
- Use Legend State for reactive upgrade state if consistent with project patterns

### Upgrade Data Structure
```typescript
interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effectType: 'scrapMultiplier' | 'petBonus';
  effectValue: number;
  category?: string;
}
```

### Dependencies
- React Navigation (or screen management library compatible with React Native)
- Existing scrap state management system
- Existing AI Pet counter system
- LocalStorage/AsyncStorage for persistence
- TypeScript for type safety
- React Native components (View, Text, ScrollView, Pressable, etc.)

### Testing Strategy
- Unit tests for purchase validation logic
- Unit tests for scrap deduction calculations
- Unit tests for upgrade effect application
- Component tests for shop UI rendering
- Integration tests for navigation flow
- Integration tests for persistence
- E2E tests for complete purchase flow
- Tests for edge cases (insufficient funds, duplicate purchases, etc.)

## Assumptions and Constraints

### Assumptions
1. The scrap system is fully implemented and functioning
2. The AI Pet counter system tracks and exposes pet count
3. Players understand the scrap resource from the main screen
4. The application supports screen navigation (single screen app will need navigation added)
5. Players have access to localStorage for persistence
6. The project uses React Native with support for navigation

### Constraints
1. Must use existing game state management patterns
2. Must follow existing UI/UX design language and style conventions
3. Must maintain performance of existing features
4. Must be implementable without external paid services
5. Must work within React Native ecosystem and platform limitations
6. Cannot implement specific upgrades in this phase (framework only)
7. Must integrate with existing scrap and counter persistence mechanisms

## Dependencies and Integration Points

### Depends On
- Scrap system must be implemented and accessible
- AI Pet counter must be implemented and accessible
- Existing persistence mechanism must support upgrade data

### Integrates With
- Scrap generation system (applies scrap multiplier upgrades)
- Pet increment system (applies pet bonus upgrades)
- Main clicker screen (navigation and state updates)
- Persistence layer (saves purchased upgrades)

### Blocks
- Implementation of specific upgrades (Bot Factory, Storage Pouch)
- Upgrade balance testing
- Economic progression tuning
- Future shop enhancements (categories, filters, etc.)

## Appendix

### Glossary
- **Shop**: The screen/interface where players view and purchase upgrades
- **Upgrade**: A permanent enhancement purchased with scrap that improves game progression
- **Scrap Multiplier**: An upgrade that increases scrap generated per AI Pet per second
- **Pet Bonus**: An upgrade that increases AI Pets gained per feed button press
- **Purchase**: The transaction of spending scrap to acquire an upgrade
- **Affordability**: Whether the player has sufficient scrap to purchase a specific upgrade

### Related Documents
- Feature Description: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/specs/feature-shop.md`
- Scrap System PRD: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/prd_scrap.md`
- Bot Factory Feature: `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/specs/feature-factory.md`
- Storage Pouch Feature: `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/specs/feature-container.md`
- Core Clicker System Documentation

### Open Questions
1. Should we use React Navigation, custom screen state, or another navigation approach?
2. Should upgrades be displayed as cards, list items, or another layout?
3. Should we show the player's scrap balance in the header, footer, or both?
4. Should purchased upgrades be completely hidden or shown as "Owned"?
5. How should we handle multiple upgrades affecting the same stat (additive vs. multiplicative)?
6. Should we implement any haptic feedback for purchases?
7. What should the empty shop state look like (no upgrades available)?
8. Should we animate the scrap balance when it decreases from a purchase?

### Design Considerations

#### Navigation Patterns
Given the current simple structure (single ClickerScreen in App.tsx), we need to introduce navigation. Options:
1. React Navigation - industry standard, feature-rich
2. Simple conditional rendering based on state
3. Custom navigation component

Recommendation: Start with simple state-based navigation, migrate to React Navigation if complexity grows.

#### Purchase Confirmation
While confirmation dialogs are out of scope, we should consider the user experience of accidental purchases. Mitigations:
- Clear visual affordance differences between affordable/unaffordable
- Immediate visual feedback on purchase
- Consider adding confirmation in future iteration if player feedback indicates need

#### Upgrade Effect Application
Upgrades should affect the core game mechanics transparently:
- Scrap generation multipliers compound with pet count
- Pet bonuses add to the base feed increment
- Effects apply immediately without requiring restart or refresh

### Change Log
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-16 | System | Initial PRD creation |
