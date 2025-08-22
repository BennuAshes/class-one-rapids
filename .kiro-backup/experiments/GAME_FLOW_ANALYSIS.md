# Asheron's Call Idler - Game Flow Analysis Report

## Executive Summary

This report analyzes the current implementation of the Asheron's Call Idler game, documenting how the game flows from launch to gameplay, including all major systems and their interactions.

## Current Implementation Structure

### 1. Application Architecture

The game is built using:
- **React Native + Expo** for cross-platform mobile development
- **Legend-state** for reactive state management and persistence
- **TypeScript** for type safety
- **Expo Router** for navigation

### 2. Game Flow Overview

```
Welcome Screen → Character Select → Character Creation (if needed) → Main Gameplay
                       ↓                    ↓
                  Character Details    Attribute Allocation
                       ↓
                  Skills Management
```

## Detailed Game Flow

### Phase 1: Initial Launch
1. **Welcome Screen** (`src/app/index.tsx`)
   - Displays game title "Asheron's Call Idler"
   - Shows tagline: "Forge your destiny through limitless character progression"
   - Single "Begin Your Journey" button
   - Routes to Character Select screen

### Phase 2: Character Management
1. **Character Select Screen** (`src/features/character/CharacterSelectScreen.tsx`)
   - Checks for existing character in persistent storage
   - If no character exists → Routes to Character Creation
   - If character exists → Shows character info with options to continue or delete
   - Implements character persistence through Legend-state

2. **Character Creation** (`src/features/character/CharacterCreationScreen.tsx`)
   - Step-by-step wizard interface
   - Name input with validation (2-20 characters)
   - Attribute allocation system (270 points across 6 attributes)
   - Visual character model that responds to attribute changes
   - Creates initial character state with default values

3. **Attribute System**
   - Six core attributes: Strength, Endurance, Coordination, Quickness, Focus, Self
   - Each attribute starts at 10 (minimum)
   - 270 total points to distribute
   - Visual feedback through animated character model
   - Affects derived stats (health, mana, stamina, attack/defense bonuses)

### Phase 3: Main Gameplay Loop

1. **Main Gameplay Screen** (`src/features/character/MainGameplayScreen.tsx`)
   - **Character Overview Section**: Displays level, experience, active activities
   - **Combat System Section**: Real-time combat interface with creature selection
   - **Idle Progress Section**: Three automated activities (Combat Training, Area Exploration, Spell Research)
   - **Quick Actions**: Navigation to character details and settings

2. **Combat System** (`src/features/combat/`)
   - **Manual Combat Mode**:
     - Player selects creature from available list
     - Real-time combat with health bars and damage calculations
     - Experience and loot rewards on victory
     - Combat log showing all actions
   - **Idle Combat Training**:
     - Automated combat simulation
     - Generates experience over time
     - No loot generation in idle mode

3. **Idle Activities System** (`src/features/character/idleActivitiesStore.ts`)
   - Three parallel activities can run simultaneously:
     - **Combat Training**: 30-second cycles, 5 XP per completion
     - **Area Exploration**: 45-second cycles, 8 XP per completion
     - **Spell Research**: 60-second cycles, 10 XP per completion
   - Progress bars show real-time advancement
   - Activities continue when app is in background (limited)

### Phase 4: Character Progression

1. **Experience System** (`src/features/character/progressionService.ts`)
   - Experience gained from combat and idle activities
   - Level calculation using exponential formula (1.2x multiplier per level)
   - Skill points awarded on level up (1 per level + milestone bonuses)
   - Milestone levels (5, 10, 15, etc.) grant bonus skill points

2. **Skills System** (`src/features/character/skillDefinitions.ts`)
   - Three skill categories: Combat, Magic, Utility
   - Skills have three tiers: Untrained (0), Trained (1), Specialized (2)
   - Skill points can be invested to increase tiers
   - Skills affect combat calculations and derived stats

3. **Character Persistence**
   - Two-tier persistence system:
     - Basic character data (name, level, experience)
     - Full character state (attributes, skills, progression, derived stats)
   - Cross-platform storage (MMKV for mobile, localStorage for web)
   - Automatic saving with error recovery
   - Data validation and integrity checks

## Core Game Systems

### 1. Combat Engine (`CombatEngine.ts`)
- Turn-based combat with 1-second rounds
- Attack calculations based on attributes and skills
- Critical hit system (10% base chance)
- Damage mitigation through defense stats
- Experience rewards scaled by creature level and performance
- Loot generation from creature-specific tables
- Offline combat simulation (up to 12 hours)

### 2. Creature System (`CreatureManager.ts`)
- Tiered creature difficulty (levels 1-100)
- Level requirements for creature access
- Each creature has unique stats and loot tables
- Progressive difficulty scaling

### 3. Experience & Leveling (`ExperienceManager.ts`)
- Base experience modified by combat performance
- Level difference multipliers (bonus for harder enemies)
- Skill point rewards on level up
- Automatic character progression updates

### 4. Visual Feedback System
- **Character Model** (`CharacterModel.tsx`):
  - 3D-style character visualization
  - Animated based on attribute values
  - Visual effects for high attribute levels
  - Size scaling based on strength/endurance
  
- **Progress Animations**:
  - Smooth progress bars for all activities
  - Level up celebrations
  - Milestone achievement notifications
  
- **Combat Animations**:
  - Real-time health bar updates
  - Damage number displays
  - Critical hit visual effects

### 5. State Management Architecture
- **Observable State Pattern**: Using Legend-state for reactive updates
- **Persistent Stores**:
  - `characterState`: Basic character data
  - `fullCharacterState`: Complete character information
  - `combatState$`: Active combat session
  - `idleActivitiesState`: Idle progression tracking
  - `appSettings`: User preferences

## User Interface Flow

### Navigation Structure
- **Stack Navigator**: Main navigation container
- **Tab Navigator**: Character management screens
- **Modal Presentations**: Attribute allocation, combat details

### Screen Transitions
1. Splash → Welcome (automatic)
2. Welcome → Character Select (user action)
3. Character Select → Creation or Gameplay (conditional)
4. Gameplay → Various detail screens (user navigation)

### Key UI Components
- **Button Component**: Consistent styling with variants
- **ProgressBar**: Visual progression indicators
- **ScrollView**: Responsive content containers
- **Modal Overlays**: Detailed views and selections

## Idle Game Mechanics

### Active Play Benefits
- 2x experience gain during active sessions
- Manual control over combat targets
- Direct skill point allocation
- Equipment management access

### Offline Progression
- Limited to 12 hours maximum
- Reduced efficiency (50% of active rate)
- Simple combat simulation
- No rare loot acquisition
- Automatic pause on low health

### Return Incentives
- Accumulated progress summary
- Pending level ups and skill points
- New unlock notifications
- Activity completion rewards

## Current Implementation Gaps

### Missing from Design Document
1. **World Exploration**: No area progression system implemented
2. **Equipment System**: No gear, tinkering, or equipment management
3. **Magic System**: Spell research exists but no actual spell casting
4. **Heritage/Prestige**: No prestige or meta-progression system
5. **Monetization**: No ads or IAP implementation
6. **Social Features**: No sharing or competitive elements

### Partially Implemented
1. **Attributes**: System exists but simplified (no secondary stats)
2. **Skills**: Basic structure but limited effects on gameplay
3. **Combat**: Functional but lacks depth (no spell combat, limited strategy)
4. **Offline Progress**: Basic implementation, needs enhancement

## Technical Observations

### Strengths
- Clean component architecture
- Strong TypeScript typing
- Robust state persistence
- Good error handling
- Modular system design

### Areas for Improvement
- Performance optimization needed for animations
- Better offline calculation accuracy
- Enhanced data validation
- More comprehensive testing coverage
- Memory management for long sessions

## Conclusion

The current implementation provides a solid foundation for an idle RPG with character progression. The core systems (character creation, attributes, combat, idle activities) are functional but simplified compared to the design vision. The game successfully implements the basic idle game loop but lacks the depth and variety described in the original design document. The architecture is well-structured for future expansion to include the missing systems.