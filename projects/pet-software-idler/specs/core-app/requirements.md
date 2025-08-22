# Requirements Document

## Introduction

Pet Software Idler is a cross-platform idle/incremental game where players manage a software development company creating applications for pets. Built with Expo for iOS, Android, and web deployment, the application uses Legend-state for reactive state management to handle complex game calculations and real-time UI updates efficiently.

## Requirements

### Requirement 1.1: Cross-Platform Game Foundation
**User Story:** As a player, I want to play the game seamlessly on my phone, tablet, or web browser, so that I can continue my progress on any device.

#### Acceptance Criteria
1. WHEN the game is launched on iOS THEN it SHALL display with native iOS performance and touch controls
2. WHEN the game is launched on Android THEN it SHALL display with native Android performance and touch controls
3. WHEN the game is accessed via web browser THEN it SHALL render as a responsive web application with mouse/keyboard support
4. IF the platform detection fails THEN the application SHALL default to web-safe components and controls
5. WHEN switching between devices THEN the game progress SHALL be consistent across platforms

### Requirement 1.2: Reactive Game State Management
**User Story:** As a player, I want the game to continuously calculate and update resources in real-time, so that I can see my progress happening live without manual refreshing.

#### Acceptance Criteria
1. WHEN idle production occurs THEN resource counters SHALL update automatically every frame
2. WHEN multiple game systems produce resources THEN all calculations SHALL happen simultaneously and efficiently
3. IF a state calculation fails THEN the game SHALL maintain the last valid state without corrupting save data
4. WHEN the game auto-saves THEN the entire game state SHALL be persisted without blocking the UI
5. WHEN game calculations run THEN the application SHALL maintain 60fps performance even with complex formulas

### Requirement 1.3: Core Idle Game Mechanics
**User Story:** As a player, I want to click to produce resources and purchase upgrades that automate production, so that I can progress from active clicking to passive income generation.

#### Acceptance Criteria
1. WHEN clicking the main action button THEN resources SHALL increase based on click multipliers
2. WHEN purchasing an automation upgrade THEN passive resource generation SHALL begin immediately
3. IF insufficient resources for a purchase THEN the UI SHALL clearly indicate what is needed
4. WHEN offline time is calculated THEN the player SHALL receive accurate offline progress
5. WHEN viewing production rates THEN the UI SHALL display per-second calculations accurately

### Requirement 1.4: Web-Specific Features
**User Story:** As a web player, I want the game to work like a native web application with proper saving and browser integration, so that I can play comfortably in my browser.

#### Acceptance Criteria
1. WHEN playing in a browser THEN the game SHALL auto-save to localStorage every 30 seconds
2. WHEN using browser back/forward THEN the game SHALL handle navigation without losing progress
3. WHEN the browser window is resized THEN the game layout SHALL adapt responsively
4. IF localStorage is unavailable THEN the game SHALL warn the player about save limitations
5. WHEN closing the browser tab THEN the game SHALL attempt to save current progress

### Requirement 1.5: Development and Testing Environment
**User Story:** As a developer, I want hot reloading and comprehensive debugging tools for the game logic, so that I can efficiently develop and balance game features.

#### Acceptance Criteria
1. WHEN game code changes are saved THEN the application SHALL hot reload preserving game state
2. WHEN debugging is enabled THEN game state SHALL be inspectable in real-time through dev tools
3. IF a game calculation error occurs THEN detailed logs SHALL indicate the formula and values involved
4. WHEN running tests THEN game mechanics SHALL be testable in accelerated time
5. WHEN building for production THEN the build SHALL optimize bundle size while preserving game performance

### Requirement 1.6: Performance and Optimization
**User Story:** As a player, I want the game to run smoothly even after hours of play with complex game states, so that long-term progression remains enjoyable.

#### Acceptance Criteria
1. WHEN the game launches THEN initial load time SHALL be under 3 seconds on 3G connections
2. WHEN game calculations become complex THEN the frame rate SHALL not drop below 30fps
3. IF device memory is limited THEN the game SHALL implement cleanup for non-visible UI elements
4. WHEN large numbers are displayed THEN the game SHALL use optimized formatting (1.5M instead of 1,500,000)
5. WHEN the game runs for extended periods THEN memory usage SHALL remain stable without leaks

## Success Metrics
- Game runs at 60fps on modern devices with up to 100 automated producers
- Save/load operations complete in under 500ms
- Web lighthouse score of 85+ for performance
- Hot reload during development maintains game state 95% of the time
- Offline progress calculations accurate within 1% of online calculations

## Out of Scope
- Multiplayer or social features
- Backend server infrastructure for cloud saves
- In-app purchases and monetization
- Complex graphics, animations, or particle effects
- Multiple save slots or profile management
- Achievements and leaderboard systems