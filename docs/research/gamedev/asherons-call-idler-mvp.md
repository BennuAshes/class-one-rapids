# Asheron's Call Idler: MVP Design Document

## Core Philosophy
Combine Asheron's Call's meaningful progression depth with idle game accessibility, prioritizing traditional fun through polished core mechanics over feature complexity.

## MVP Core Loop (5-15 seconds)

### Primary Tap Mechanic: Combat Power Slider
- **Tap** = Quick Strike (high accuracy, base damage)
- **Hold** = Power Attack (charge up to 3 seconds)
  - 1 sec = 1.5x damage, 90% accuracy
  - 2 sec = 2.0x damage, 75% accuracy
  - 3 sec = 3.0x damage, 60% accuracy
- **Visual Feedback**: Charging bar with color progression (white → yellow → orange → red)
- **Audio**: Rising pitch during charge, satisfying impact sounds scaled to damage
- **Auto-Battle**: Defaults to quick strikes at 50% efficiency when idle

### Enemy Combat
- Creatures from AC lore (Drudges → Olthoi → Tuskers)
- 3 stance types: High/Mid/Low (rock-paper-scissors weakness system)
- Visual weakness indicator above enemy
- Health bars with damage numbers
- Death animations drop pyreals + loot

## Progression Systems

### 1. Simplified Attributes (Start with 3)
**Strength** - Increases tap damage
**Coordination** - Increases accuracy & critical chance
**Endurance** - Increases offline efficiency (up to 75%)

Each level up grants 1 attribute point. Visual bar fills showing progress to next level.

### 2. Skills (MVP: 3 Core Paths)
**Melee Mastery** - Improves power attack scaling
**Item Enchantment** - Auto-applies temporary buffs
**Leadership** - Generates vassal bonuses (idle multiplier)

Skills level through use:
- Melee Mastery: XP from power attacks
- Item Enchant: XP from buff applications
- Leadership: XP from vassal contributions

### 3. Tinkering Loop
- Salvage drops from enemies (simplified to 3 types)
  - **Iron**: +Damage
  - **Crystal**: +Accuracy
  - **Leather**: +Speed
- Combine 10 salvage → Apply to weapon (max 5 applications)
- Visual weapon glow intensifies with each application

### 4. Allegiance System (Idle Multiplier)
- **Patron Mode**: Recruit AI vassals (cost: pyreals)
- Each vassal provides +10% idle XP generation
- Max 3 vassals in MVP
- Vassals have names from AC lore
- Visual: Small portraits generating XP particles

## Idle Mechanics

### Offline Progression
- Auto-combat continues at Endurance-based efficiency (25-75%)
- Returns to game shows "While you were away..." summary
- Capped at 8 hours of offline progress
- Visual: Pile of loot/pyreals to collect

### Quick Activities (While Active)
- **Portal Runs** (30 seconds): Bonus loot chance
- **Lifestone Meditation** (45 seconds): Temporary buff
- Visual progress circles for each activity

## Interface Design

### Main Screen Layout
```
[Character Avatar] [Current Enemy]
[Attributes: STR/COORD/END bars]
[Tap/Hold Area - 60% of screen]
[Vassals Row - small portraits]
[Currency: Pyreals counter]
[Menu Tabs: Skills | Tinkering | Allegiance]
```

### Feedback Systems
- Damage numbers float up with color coding
- Screen shake on critical hits (optional)
- Combo counter for successful weakness exploitation
- Pyreal collection has coin sound + sparkle effect

## Progression Pacing

### First 5 Minutes
- Kill first Drudge in 3 taps
- Level up immediately (big celebration)
- Unlock first salvage
- Tutorial shows hold mechanic
- First tinker application

### First Hour
- Reach level 10
- Unlock all 3 skills
- First vassal recruited
- 100+ enemies defeated
- First weapon maxed with salvage

### First Day
- Level 25+
- Multiple vassals
- Encounter first boss (Olthoi Queen)
- Unlock second weapon slot
- 10,000+ pyreals earned

## Portal System (Soft Prestige)
At level 50, unlock "Asheron's Portal":
- Reset level to 1
- Keep vassals & one skill specialization
- Gain permanent +50% damage multiplier
- Unlock new enemy tier
- Visual: Purple portal animation

## Success Metrics
- First tap within 5 seconds
- 50% D1 retention
- Average session: 5-10 minutes
- 80% reach level 10 in first week
- Power attack used 30%+ of active taps

## Out of Scope for MVP
- Magic system
- PvP/Multiplayer
- Complex crafting
- Multiple damage types
- Housing
- Spell components
- Most AC skills
- Monetization

---

# Revised MVP: Streamlined for Maximum Fun

After analyzing the MVP against traditional fun principles and idle best practices, here are critical revisions to maximize enjoyment:

## REVISION 1: Simplify to One Perfect Mechanic

### Remove Power Slider Initially
The hold-to-charge adds complexity without enhancing the core fun. Instead:

**Single Tap = Perfect**
- Tap enemy's weakness spot (highlighted)
- Hit = Satisfying damage + combo build
- Miss = Reduced damage (still progress)
- **This is more "Cookie Clicker pure" while maintaining depth**

### Reintroduce Complexity Through Enemies
- Enemy stances change every 3 hits
- Visual telegraph shows next stance (1 second warning)
- Creates rhythm game feel without complexity

## REVISION 2: Flatten Early Progression

### Attributes: Start with ONE
**Power** - Single number that affects everything
- Damage
- Accuracy
- Idle efficiency
- Everything scales off Power

*Add Coordination and Endurance at first prestige, not before*

### Skills: Remove for MVP
- No skill system initially
- Power is the only progression
- Skills become prestige unlocks later

## REVISION 3: Instant Gratification Tinkering

### Simplify Salvage to Instant Rewards
Instead of collecting and combining:
- Salvage = Immediate weapon upgrade
- Visual: Weapon glows brighter with each drop
- No management, just satisfaction
- Number on weapon shows upgrade level

## REVISION 4: Vassals as Collection, Not Management

### Make Vassals Automatic
- Defeat boss = Gain vassal automatically
- No recruitment cost
- Each provides flat 2x multiplier
- They appear as helpers attacking alongside you
- Names and portraits from AC lore for nostalgia

## REVISION 5: Streamline Interface

### One-Screen Experience
```
[Enemy Health Bar]
[ENEMY - Large, Tappable]
[Weakness Indicator]

[Your Power: 9,847]
[Pyreals: 1.2M]

[Vassal Portraits - Bottom]
```

Everything else hidden in minimal menu.

## REVISION 6: Perfect the Polish

### Core Feedback Loop (Within 100ms)
1. **Tap** →
2. **Impact effect** (screen shake, particles)
3. **Damage number** (bouncing, colored)
4. **Sound** (pitch based on damage)
5. **Pyreal drop** (if killed)
6. **Auto-collect** animation

### The "Perfect Tap" Feel
- Enemy deforms on hit (squash)
- Returns to form (stretch)
- Bigger hits = bigger deformation
- Critical hits = extra particles and screen shake
- Background subtle parallax on big hits

## Final MVP Feature List

### MUST HAVE (Week 1)
1. Single tap combat with weakness spots
2. One number (Power) that goes up
3. Enemies with increasing HP
4. Pyreal currency
5. Automatic offline progression
6. Perfect tap feedback

### SHOULD HAVE (Week 2-3)
1. Boss enemies that grant vassals
2. Simple prestige at level 50
3. Visual weapon upgrades from salvage
4. 20 unique enemies from AC lore

### COULD HAVE (Week 4+)
1. Stance-change rhythm mechanics
2. Portal animation for prestige
3. Lifestone checkpoint system
4. Music that builds with combo

### WON'T HAVE (Post-Launch)
1. Power slider mechanics
2. Complex attribute system
3. Skill trees
4. Multiplayer
5. Monetization

## Success Through Simplicity

This revised MVP follows traditional fun principles:
- **One perfect mechanic** (tapping weakness spots)
- **Clear progression** (Power number goes up)
- **Exceptional polish** (every tap feels amazing)
- **Meaningful theme** (AC nostalgia without complexity)
- **Respect for player time** (idle progression)

The game can be fun in a gray box with just tapping and numbers. Everything else amplifies that core fun rather than creating it.

## Development Priority

1. **Make tapping feel incredible** (Week 1)
2. **Polish the feedback loop** (Week 2)
3. **Add AC theme and nostalgia** (Week 3)
4. **Test and refine pacing** (Week 4)
5. **Ship when tap is perfect** (Not before)

The goal: When players tap their first Drudge and see it react, they should involuntarily smile. Everything else builds on that foundation of joy.