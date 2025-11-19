# Product Requirements Document: Asheron's Call Idler Mobile App

## Introduction

A mobile idle game app that recreates the authentic Asheron's Call experience through modern tap-based gameplay mechanics, featuring the complete AC attribute and skill system with intuitive navigation between combat, character management, and progression screens.

### Business Context
The mobile gaming market demands accessible yet deep experiences that respect player time while offering meaningful progression. By combining AC's beloved mechanics with idle game design, we create a unique product that appeals to both nostalgic veterans and new players seeking depth in mobile gaming.

### Problem Statement
Mobile gamers lack access to deep, authentic RPG experiences that can be enjoyed in short sessions while maintaining long-term progression goals. Existing idle games often sacrifice depth for simplicity, leaving players wanting more meaningful character development and combat systems.

## Requirements

### Requirement 1: Core Navigation and Combat Interface
**User Story:** As a player, I want seamless navigation between combat, skills, inventory, and activities, so that I can manage all aspects of my character without interrupting gameplay flow.

#### Acceptance Criteria
- WHEN launching the app THEN display purple portal animation followed by immediate combat screen with tappable enemy
- WHEN tapping navigation tabs THEN transition smoothly between Skills, Inventory, Map, and Settings screens within 300ms
- WHEN in combat THEN display creature HP, weakness indicators, and damage numbers using AC-authentic fonts and colors
- IF returning from background THEN restore exact game state including active timers and combat progress

### Requirement 2: Character Progression System
**User Story:** As a player, I want to develop my character through AC's six-attribute system and skill specializations, so that I can create unique builds and experience meaningful progression.

#### Acceptance Criteria
- WHEN gaining XP THEN automatically distribute to active skills based on 70/30 split between primary and trained skills
- WHEN reaching attribute milestones (25/50/75/100) THEN unlock corresponding abilities with visual notifications
- WHEN spending skill credits THEN allow training/specialization following AC rules with clear cost display
- IF attempting invalid skill combination THEN show requirement tooltips explaining prerequisites

### Requirement 3: Idle Activity Management
**User Story:** As a player, I want to manage multiple concurrent activities from quick raids to lengthy quests, so that I can optimize my time and progress even when not actively playing.

#### Acceptance Criteria
- WHEN starting activities THEN display progress bars with time remaining for up to 3 concurrent tasks
- WHEN offline THEN continue activity progress at configured efficiency rate based on Endurance attribute
- WHEN activity completes THEN show reward notification with auto-collect option
- IF device storage permits THEN queue up to 10 completed activity rewards for later collection

### Requirement 4: Portal and Prestige System
**User Story:** As a player, I want to prestige through Asheron's Portal when ready, so that I receive multiplicative bonuses and unlock new content tiers while maintaining my specialization progress.

#### Acceptance Criteria
- WHEN meeting prestige requirements (Level 100 + Boss Kill + 10 Portal Stones) THEN enable white portal animation
- WHEN prestiging THEN preserve skill specializations and 10% of attribute progress
- WHEN entering new iteration THEN apply damage/XP/pyreal multipliers based on prestige count
- IF canceling prestige THEN maintain current progress without penalty

### Requirement 5: Combat Gesture System
**User Story:** As a player, I want to use different tap gestures for varied combat strategies, so that I can exploit enemy weaknesses and maximize damage output.

#### Acceptance Criteria
- WHEN quick tapping THEN execute high-accuracy attacks with base damage
- WHEN holding tap THEN charge power attacks up to 3 seconds for increased damage multiplier
- WHEN using correct attack height against enemy stance THEN apply weakness bonus damage
- IF gesture input fails THEN default to basic attack without penalty

## Success Metrics

- Daily Active Users maintain 60%+ seven-day retention rate
- Average session length between 5-15 minutes with 3+ sessions per day
- Prestige completion rate of 40% for players reaching level 50
- Combat gesture system adoption by 75% of active players within first week
- App store rating maintained above 4.5 stars with emphasis on depth and authenticity

## Out of Scope

- Real-time multiplayer combat or PvP functionality
- Voice chat or complex social features beyond basic allegiance system
- User-generated content or modding support
- Cross-platform progression sync with PC/console versions
- NFT or blockchain integration