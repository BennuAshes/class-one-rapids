# Simplified Attributes System

## Feature Overview
Implement a streamlined attribute system that expands player progression beyond the single Power metric. This system introduces three core attributes that provide meaningful choices in character development while maintaining the simplicity crucial for idle game accessibility.

## Core Attributes

### 1. Strength
- **Primary Effect**: Increases tap damage directly
- **Formula**: Each point adds +5 base damage to all attacks
- **Visual**: Red gem icon with muscular arm symbol
- **Player Impact**: Allows players to become damage-focused builds

### 2. Coordination
- **Primary Effect**: Increases accuracy and critical hit chance
- **Formula**: Each point adds +2% critical chance (base 10%, max 90%)
- **Secondary Effect**: +1% accuracy per point (reduces miss chance)
- **Visual**: Blue gem icon with eye/target symbol
- **Player Impact**: Rewards precision-focused playstyles

### 3. Endurance
- **Primary Effect**: Increases offline progression efficiency
- **Formula**: Each point adds +2.5% offline efficiency (base 25%, max 75%)
- **Secondary Effect**: +10 max HP per point (future enemy damage mitigation)
- **Visual**: Green gem icon with shield/fortress symbol
- **Player Impact**: Benefits players who can't play actively all day

## Progression Mechanics

### Attribute Points
- **Allocation**: 1 attribute point granted per level up
- **Distribution**: Players manually assign points (not automatic)
- **Respec**: Not available in MVP (permanent choices add weight)
- **Starting Values**: All attributes begin at 0

### Level Integration
- Replaces the current flat Power increase per level
- Power now calculated as: Base Power (1) + (Level × attribute bonuses)
- Maintains backward compatibility with existing Power-based systems

## User Interface

### Attribute Panel
- Accessible via dedicated "Attributes" button below enemy
- Shows current values and effects for each attribute
- Plus/minus buttons for point allocation (plus only if points available)
- Visual progress bars showing relative investment

### Display Format
```
ATTRIBUTES (3 points available)

Strength: 5     [+]
└─ Damage: +25

Coordination: 3  [+]
└─ Crit: 16%

Endurance: 2    [+]
└─ Offline: 30%
```

## Balance Considerations

### Early Game (Levels 1-10)
- Limited points force meaningful choices
- No single "correct" build path
- All attributes provide noticeable impact

### Mid Game (Levels 11-25)
- Specialization becomes apparent
- Players can pursue hybrid builds
- Offline efficiency becomes more valuable

### Late Game (Level 26+)
- Clear build archetypes emerge
- Respec becomes desirable (future feature)
- Attributes scale appropriately with enemy difficulty

## Technical Implementation

### State Management
- Add attributes object to existing player state
- Persist via AsyncStorage with other progression data
- Calculate derived stats (damage, crit, offline rate) on demand

### Migration Path
1. Convert existing Power to Strength points (1:1 ratio)
2. Grant retroactive attribute points for current level
3. Show one-time tutorial explaining the new system

## Success Criteria
- Players understand each attribute's purpose within first session
- 33% distribution across all three attributes in aggregate player data
- No single attribute ignored by >80% of players
- Attribute choices feel impactful to damage/progression

## Dependencies
- Existing level/XP system (complete)
- Power-based damage calculation (complete)
- Critical hit system (complete)
- Future: Offline progression system (to utilize Endurance)

## Out of Scope (Future Iterations)
- Secondary attributes (Intelligence, Focus, Willpower)
- Attribute requirements for equipment/skills
- Temporary attribute buffs/debuffs
- Attribute point purchases with premium currency
- Respec/reallocation system

## Priority
**HIGH** - This is the next logical progression system after establishing core Power. It provides player agency and build diversity while maintaining the "one number goes up" simplicity at its core. Listed in MVP as part of the core progression systems that should follow initial combat implementation.