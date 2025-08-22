# Requirements Document

## Introduction

This specification outlines the requirements for refactoring the existing Asheron's Call Idler codebase to align with the new fun-first design principles. The current implementation contains complex systems that create barriers to immediate enjoyment, while the new design prioritizes instant gratification and explosive number growth.

The refactor will transform the game from a complex character progression system into an addictive idle/clicker experience that hooks players within 5 seconds and maintains engagement through simple, satisfying mechanics.

## Requirements

### Requirement 1: Implement 5-Second Hook Experience

**User Story:** As a new player, I want to immediately start tapping and see explosive number feedback when I open the app, so that I feel powerful and engaged within 5 seconds.

#### Acceptance Criteria

1. WHEN the app launches THEN the system SHALL display a portal animation lasting 1 second
2. WHEN the portal animation completes THEN the system SHALL immediately show a creature with "TAP THE DRUDGE!" prompt
3. WHEN the user taps the creature THEN the system SHALL display exploding damage numbers with particle effects
4. WHEN damage is dealt THEN the system SHALL show gold raining animation and immediate level up feedback
5. WHEN the first creature dies THEN the system SHALL spawn more creatures automatically
6. IF the user has not created a character THEN the system SHALL skip character creation entirely and use default values

### Requirement 2: Simplify Character Attribute System

**User Story:** As a player, I want a simple three-attribute system that directly affects my gameplay, so that I can understand and optimize my character without complexity barriers.

#### Acceptance Criteria

1. WHEN viewing character attributes THEN the system SHALL display only Strength, Endurance, and Focus
2. WHEN Strength increases THEN the system SHALL increase tap damage by 10% per point
3. WHEN Endurance increases THEN the system SHALL increase idle damage by 10% per point
4. WHEN Focus increases THEN the system SHALL increase gold gain by 10% per point
5. WHEN an attribute reaches milestone levels (10, 50, 100) THEN the system SHALL unlock special abilities
6. WHEN migrating existing characters THEN the system SHALL convert six attributes to three using appropriate mapping

### Requirement 3: Implement Basic Upgrade System

**User Story:** As a player, I want to purchase simple upgrades that immediately make me more powerful, so that I have clear progression goals and instant gratification.

#### Acceptance Criteria

1. WHEN I have sufficient gold THEN the system SHALL allow me to purchase "Sharper Sword" upgrade
2. WHEN "Sharper Sword" is purchased THEN the system SHALL double my tap damage
3. WHEN I unlock "Faster Swing" THEN the system SHALL increase my attack speed by 50%
4. WHEN I unlock "Auto Clicker" THEN the system SHALL add 1 tap per second automatically
5. WHEN upgrades are available THEN the system SHALL pulse the upgrade buttons visually
6. WHEN an upgrade is purchased THEN the system SHALL show immediate visual feedback and number changes

### Requirement 4: Create Visual Idle Activity System

**User Story:** As a player, I want to see continuous visual progress and activities happening even when I'm not actively tapping, so that I feel engaged and rewarded for returning to the game.

#### Acceptance Criteria

1. WHEN auto-slash is active THEN the system SHALL show sword swinging animations every second
2. WHEN drudge hunt begins THEN the system SHALL display mini drudges spawning and dying over 5 seconds
3. WHEN dungeon run starts THEN the system SHALL show character running through dungeon doors for 30 seconds
4. WHEN world boss event occurs THEN the system SHALL display epic boss health bar for 5 minutes
5. WHEN any idle activity completes THEN the system SHALL show "LOOT EXPLOSION" with rewards
6. WHEN multiple activities run THEN the system SHALL display progress bars for each activity

### Requirement 5: Implement Portal Prestige System

**User Story:** As a player, I want to reset my progress for permanent power increases, so that I can continue growing stronger and experiencing the satisfaction of explosive number growth.

#### Acceptance Criteria

1. WHEN I defeat the Olthoi Queen (Level 100 boss) THEN the system SHALL unlock portal travel option
2. WHEN I choose to enter a portal THEN the system SHALL show massive portal animation with epic sound
3. WHEN portal travel completes THEN the system SHALL reset my level to 1 but double all my multipliers
4. WHEN I restart after portal THEN the system SHALL display "ENTERING NEW DERETH! POWER RETAINED!" message
5. WHEN comparing pre/post portal THEN the system SHALL show power comparison (e.g., "Previous max: 1M, New starting: 100K")
6. WHEN portal stones are earned THEN the system SHALL award Math.floor(currentLevel / 10) portal stones

### Requirement 6: Redesign Main Game Interface

**User Story:** As a player, I want all important information visible at once with clear visual feedback, so that I can see my progress and make decisions without navigating through menus.

#### Acceptance Criteria

1. WHEN viewing the main screen THEN the system SHALL display gold, XP, and level at the top, always updating
2. WHEN a creature is present THEN the system SHALL show the creature taking up 40% of screen space
3. WHEN creature health changes THEN the system SHALL display clear health bar with visual updates
4. WHEN upgrades are affordable THEN the system SHALL pulse upgrade buttons with clear cost display
5. WHEN idle activities are running THEN the system SHALL show multiple progress bars with time remaining
6. WHEN any achievement occurs THEN the system SHALL provide screen shake, particles, and explosive feedback

### Requirement 7: Implement Generous Offline Progress

**User Story:** As a player, I want to receive meaningful rewards when I return to the game after being away, so that I feel my time is respected and I'm motivated to return.

#### Acceptance Criteria

1. WHEN I return after being offline THEN the system SHALL calculate rewards at 70% efficiency
2. WHEN offline time exceeds 1 hour THEN the system SHALL provide a "Welcome back, hero!" speed boost
3. WHEN displaying offline rewards THEN the system SHALL show gold, XP, and creatures defeated
4. WHEN offline events occur THEN the system SHALL display random event messages like "Found a Pyreal Mote!"
5. WHEN offline calculation completes THEN the system SHALL show reward summary with celebration effects
6. WHEN offline rewards are claimed THEN the system SHALL provide 10 minutes of 2x speed boost

### Requirement 8: Preserve Existing Data During Migration

**User Story:** As an existing player, I want my progress to be preserved during the refactor, so that I don't lose my investment in the game.

#### Acceptance Criteria

1. WHEN the refactored app launches THEN the system SHALL detect existing character data
2. WHEN migrating character attributes THEN the system SHALL convert six attributes to three using appropriate formulas
3. WHEN migrating progress THEN the system SHALL preserve level, experience, and gold values
4. WHEN migration completes THEN the system SHALL show "Game Updated!" message with new features explanation
5. IF migration fails THEN the system SHALL provide backup restoration option
6. WHEN migration is successful THEN the system SHALL remove old data structures to prevent conflicts
