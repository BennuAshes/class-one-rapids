# Pet Software Idler - TODO List

## Project Foundation
- [x] **Story 1**: Initialize Expo Project with TypeScript ✅
  - Set up new Expo project with TypeScript template
  - Configure strict TypeScript settings
  - Set up project structure and path aliases
  - Time: 2 hours

- [ ] **Story 2**: Set Up Legend State Core Game State
  - Create main game state observable with Legend State v3
  - Define TypeScript interfaces for all game entities
  - Set up computed values for derived state
  - Implement state persistence with MMKV
  - Time: 3 hours

## Core Gameplay
- [ ] **Story 3**: Implement Click Button Component
  - Create reusable game button component
  - Implement touch feedback and animations
  - Add sound effect support
  - Handle rapid clicking properly
  - Time: 2 hours

- [ ] **Story 4**: Create Resource Display Component
  - Display current resources (lines of code, money, leads)
  - Format large numbers appropriately (K, M, B)
  - Update in real-time using Legend State
  - Animate value changes
  - Time: 2 hours

## Automation Systems
- [ ] **Story 5**: Implement Junior Developer Automation
  - Create unit purchase system with cost scaling
  - Implement automatic resource generation
  - Add hire button that appears after conditions met
  - Create developer sprite animation component
  - Time: 4 hours

- [ ] **Story 6**: Implement Feature Shipping System
  - Create ship feature button that converts code to money
  - Implement conversion logic (10 lines = $15)
  - Show money counter when first money earned
  - Add visual feedback for successful shipment
  - Time: 3 hours

- [ ] **Story 7**: Implement Sales Department
  - Unlock sales department at $500 earned
  - Add visual expansion animation
  - Implement lead generation system
  - Create lead-to-revenue conversion logic
  - Time: 4 hours

## Persistence & Progress
- [ ] **Story 8**: Implement Save System
  - Auto-save every 30 seconds
  - Manual save button
  - Visual save indicator
  - Handle save errors gracefully
  - Time: 3 hours

- [ ] **Story 9**: Implement Offline Progress
  - Calculate production during offline time
  - Show offline earnings summary
  - Cap at 12 hours maximum
  - Handle edge cases (time manipulation)
  - Time: 3 hours

## Engagement Features
- [ ] **Story 10**: Implement Achievement System
  - Define achievement data structure
  - Track progress for each achievement
  - Show unlock notifications
  - Create achievement list UI
  - Persist achievement state
  - Time: 4 hours

- [ ] **Story 11**: Implement Visual Feedback System
  - Create floating number component
  - Implement particle effects
  - Add progress bar animations
  - Create screen shake for big numbers
  - Time: 4 hours

## Integration
- [ ] **Story 12**: Main Game Screen Integration
  - Integrate all components into main game screen
  - Set up proper layout and scrolling
  - Initialize all game systems
  - Handle app lifecycle properly
  - Time: 4 hours

## Additional Tasks
- [ ] Add sound effect assets (clicks, purchases, achievements)
- [ ] Create/source visual assets (developer sprites, icons, backgrounds)
- [ ] Define exact balance formulas for late game progression
- [ ] Set up analytics integration
- [ ] Configure app icons and splash screen
- [ ] Write app store descriptions
- [ ] Create screenshots for app stores

## Future Features (Post-MVP)
- [ ] Conference events system
- [ ] Prestige/reset mechanics
- [ ] Cloud save integration
- [ ] Leaderboards
- [ ] More unit types
- [ ] Special events
- [ ] Tutorial system