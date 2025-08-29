# Product Requirements Document: Asheron's Call Idler Foundation

## Introduction

Asheron's Call Idler brings the beloved world of Dereth to mobile through an engaging idle game that honors AC's depth while ensuring immediate accessibility. This foundation establishes core tap combat, basic progression systems, and essential idle mechanics that can be expanded with features to create a full MVP.

### Business Context
Mobile idle games generate consistent revenue through engagement-driven monetization while respecting player time. By leveraging Asheron's Call's nostalgic IP and proven gameplay systems, we create a unique position in the saturated idle market - authentic depth with modern accessibility.

### Problem Statement
Players seek meaningful progression games that respect their time, deliver satisfying moment-to-moment gameplay, and offer depth beyond simple number incrementing. Current idle games lack the rich systems and world-building that made classic MMOs memorable.

## Requirements

### Requirement 1: Core Tap Combat System
**User Story:** As a player, I want engaging tap-based combat with meaningful choices, so that I feel skillful rather than mindless.

#### Acceptance Criteria
- WHEN player taps quickly THEN execute high-accuracy attacks with base damage
- WHEN player holds tap THEN charge powerful low-accuracy attacks with 1.5x damage
- WHEN player hits with correct attack height for enemy weakness THEN deal bonus damage and build power bar
- WHEN power bar fills THEN next attack is guaranteed critical hit
- IF player mistimes attack pattern THEN damage is reduced but not negated

### Requirement 2: Basic Progression System
**User Story:** As a player, I want to see my character grow stronger through levels and attributes, so that I feel a sense of progression and investment.

#### Acceptance Criteria
- WHEN player defeats enemies THEN gain XP based on enemy level
- WHEN player levels up THEN increase base stats and unlock new content
- WHEN player reaches level milestones (10, 25, 50, 100) THEN unlock new features or areas
- WHEN player allocates attribute points THEN see immediate impact on combat effectiveness
- IF player reaches level 100 THEN unlock portal/prestige system

### Requirement 3: Idle Activity System
**User Story:** As a player, I want the game to progress while I'm away, so that I can enjoy the game without constant active play.

#### Acceptance Criteria
- WHEN player is offline THEN auto-attack continues at 50% efficiency
- WHEN player starts quick activities (5-30 seconds) THEN receive small rewards
- WHEN player starts dungeon runs (1-5 minutes) THEN receive significant rewards
- WHEN multiple activities complete THEN queue rewards for collection
- IF activity fails due to insufficient power THEN refund partial resources

### Requirement 4: Basic Creature Combat
**User Story:** As a player, I want to fight diverse enemies with different weaknesses, so that combat remains interesting and strategic.

#### Acceptance Criteria
- WHEN encountering new creature type THEN display name, level, and HP
- WHEN using attack type matching creature weakness THEN deal 1.5x damage
- WHEN defeating creature THEN drop pyreals and chance for items
- WHEN creature HP reaches zero THEN play death animation and spawn loot
- IF player dies THEN respawn at lifestone with small penalty

### Requirement 5: Essential UI and Feedback
**User Story:** As a player, I want clear visual feedback and intuitive controls, so that I understand my impact and progress at a glance.

#### Acceptance Criteria
- WHEN dealing damage THEN display floating damage numbers in appropriate colors
- WHEN gaining resources THEN show collection animations and running totals
- WHEN leveling up THEN display celebration effect with rewards summary
- WHEN viewing main screen THEN see character stats, enemy health, and active timers
- IF screen is idle for 30 seconds THEN dim display to save battery

## Success Metrics

- Player completes first tap within 5 seconds of launch
- 40% day-1 retention rate
- Average session length of 5+ minutes
- 80% of players reach level 10 within first week
- Less than 3% crash rate across all devices

## Out of Scope

- Multiplayer features (guilds, allegiances, PvP)
- Advanced magic system and spell combinations
- Full crafting and tinkering systems
- World events and seasonal content
- Complex skill specialization trees
- Housing and personal storage