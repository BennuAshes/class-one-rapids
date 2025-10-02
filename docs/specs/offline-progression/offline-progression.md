# Offline Progression System

## Feature Overview
Implement automatic offline progression that allows players to accumulate XP, Pyreal, and defeat enemies while the app is closed, respecting player time and encouraging daily return sessions.

## Core Requirements

### Automatic Combat Continuation
- Game continues defeating enemies at reduced efficiency while offline
- Efficiency based on player's Endurance stat (currently using Power as proxy)
- Base offline efficiency: 25% (can scale up to 75% with future Endurance stat)
- Auto-combat uses simple tap mechanics (no weakness targeting)

### Offline Progress Calculation
- Track last active timestamp when app closes/backgrounds
- Calculate elapsed time when app reopens (max 8 hours cap)
- Compute enemies defeated based on:
  - Player's current Power level
  - Average enemy HP at current level
  - Offline efficiency rate
  - Time elapsed (capped at 8 hours)

### Welcome Back Summary
- Show "While You Were Away..." modal on return
- Display:
  - Time away (formatted as "2h 34m")
  - Enemies defeated count
  - XP gained
  - Pyreal earned
  - Levels gained (if any)
- Animated collection sequence for rewards
- Single "Collect All" button

### Progression Rewards
- XP: Full XP per enemy × offline efficiency
- Pyreal: Average Pyreal per enemy × enemies defeated
- Level ups: Process all level-ups that would have occurred
- Power increases: Apply all Power gains from level-ups

## User Experience

### App Lifecycle
1. **On App Background/Close**: Save current timestamp and progression state
2. **While Offline**: No actual processing (calculated on return)
3. **On App Resume**:
   - Calculate time elapsed
   - Compute offline gains
   - Show welcome back screen
   - Apply rewards after collection

### Visual Design
- Modal overlay with semi-transparent dark background
- Parchment-style panel (Asheron's Call theme)
- Gold particle effects around reward numbers
- Animated number counters counting up to final values
- Satisfying collection sound and haptic feedback

## Technical Constraints
- Maximum 8 hours of offline progress (28,800 seconds)
- Minimum 1 minute required for offline gains
- Anti-cheat: Validate time changes (ignore if device time goes backward)
- Performance: Calculate in background, show UI immediately

## Success Metrics
- 60% of players return within 24 hours
- Average offline session generates 3-5 level ups
- Offline progress accounts for 40-60% of total progression
- No performance impact on app resume

## Dependencies
- Existing Power progression system
- AsyncStorage for persistence
- Enemy defeat calculations
- XP and Pyreal reward systems

## Out of Scope
- Complex offline activities (crafting, quests)
- Offline PvP or multiplayer features
- Push notifications for completion
- Offline skill training
- Different offline strategies/modes