# Salvage & Tinkering System Specification

## Feature Overview

The Salvage & Tinkering system introduces a comprehensive item improvement and resource recycling mechanic that transforms unwanted loot into valuable crafting materials. Players can break down equipment they've collected during their adventures to obtain salvage materials, which can then be applied to enhance their favorite gear through tinkering. This creates a meaningful use for every piece of loot, turning what would be vendor trash into potential power progression.

This system serves as a crucial economic sink and progression layer that extends the lifecycle of equipment. Rather than constantly replacing gear, players can invest in pieces they enjoy using, creating emotional attachment to their items while providing granular power progression between major equipment upgrades. The system rewards both combat prowess (through loot acquisition) and strategic decision-making (through resource management and enhancement choices).

The feature enhances the core game loop by adding a satisfying "cleanup" phase after combat sessions where players sort through their loot, make meaningful decisions about what to salvage, and apply improvements to their gear. This creates a natural rhythm of action (combat) → collection (loot) → refinement (salvaging) → enhancement (tinkering) that provides varied gameplay pacing and maintains engagement during traditionally "downtime" moments.

## Core Mechanics

### Salvaging Process

**Base Mechanics:**
- Players can destroy equipment items to obtain salvage materials
- Salvage yield formula: `Base Material Units = Item Level × Quality Modifier × (1 + Salvaging Skill / 100)`
- Quality Modifier ranges from 0.5 (Poor) to 2.0 (Legendary)
- Critical salvage chance: `5% + (Salvaging Skill × 0.1%)` yields 2x materials

**Material Types:**
- **Metals** (from weapons/armor): Iron, Steel, Mithril, Adamantine
- **Gems** (from magical items): Ruby, Sapphire, Emerald, Diamond
- **Essences** (from enchanted items): Fire, Ice, Lightning, Shadow
- **Organics** (from creature drops): Hide, Bone, Scale, Sinew

**Workmanship System:**
- Each salvaged material has a Workmanship rating (1-100)
- Workmanship = `Base Item Quality × (0.8 + Random(0.4))`
- Higher workmanship increases tinkering success rates
- Materials can be refined to improve workmanship (costs 3:1 ratio)

### Tinkering Application

**Enhancement Types:**
1. **Weapon Imbuing** (one-time permanent enhancement):
   - Ruby: Critical Strike (+5-15% critical chance)
   - Sapphire: Armor Penetration (ignore 10-30% armor)
   - Emerald: Life Steal (2-8% damage as healing)
   - Diamond: Elemental Burst (10-25% chance for bonus elemental damage)

2. **Armor Reinforcement** (stackable up to 10 times):
   - Iron: +1 base defense per application
   - Steel: +2% physical resistance (max 20%)
   - Mithril: +1% magic resistance per application
   - Adamantine: +5% durability per application

3. **Accessory Tuning** (unique enhancements):
   - Essences add elemental resistances or damage bonuses
   - Organics add stat bonuses based on creature type

**Success Rate Calculation:**
```
Base Success = 33%
Skill Bonus = Tinkering Skill × 0.2%
Workmanship Bonus = Average Workmanship / 100 × 15%
Tool Quality Bonus = Tool Tier × 5%
Final Success Rate = min(95%, Base + Skill + Workmanship + Tool)
```

**Failure Consequences:**
- Material is consumed regardless
- 10% chance of item damage on critical failure (roll under 10)
- Damaged items have -20% effectiveness until repaired

### Salvage Bags System

**Partial Bags:**
- Salvaging yields 1-100 units of material
- Partial bags stack in inventory (max stack: 10)
- Combine partials to create complete 100-unit bags

**Complete Bags:**
- Used for standard tinkering (33% base success)
- Can be traded between players
- Required for all enhancement attempts

**Foolproof Bags:**
- Rare drops from bosses or crafted from 5 complete bags + catalyst
- Guarantee 100% tinkering success
- Bind on pickup to prevent economy inflation
- Limited to 3 uses per week per player

## Player Psychology & Fun Factors

### Feedback Systems

**Visual Feedback:**
- Salvaging: Item dissolves into colored particles matching material type
- Particle count/intensity reflects material yield
- Screen flash on critical salvage (gold particles)
- Tinkering success: Item glows and pulses with enhancement color
- Tinkering failure: Smoke effect with disappointed sound

**Audio Feedback:**
- Salvaging: Satisfying "crunch" or "dissolution" sound scaled to item rarity
- Material collection: Coins-like collection sound
- Tinkering attempt: Crafting ambience (hammering, magical humming)
- Success: Triumphant chord progression
- Failure: Discordant clang or fizzle

**Tactile Responses (Mobile):**
- Haptic pulse on salvage completion
- Success vibration pattern (three quick pulses)
- Failure vibration (long declining buzz)

### Flow Maintenance

**Challenge Scaling:**
- Early game: Simple salvage/enhance with high success rates
- Mid game: Introduction of workmanship management
- Late game: Risk/reward with expensive materials and lower base rates
- Expert tier: Min-maxing with material combinations and timing

**Decision Points:**
- Salvage vs Sell vs Keep evaluation for each item
- Material investment risk assessment
- Enhancement priority ordering
- Workmanship refinement cost/benefit analysis

### Satisfaction Layers

**Primary Action:** Breaking down items feels immediately rewarding
- Instant material gain
- Clear inventory space
- Progress toward enhancement goals

**Secondary Effects:** Successful tinkering provides power spike
- Visible combat improvement
- Stat sheet numbers increase
- New visual effects on enhanced items

**Meta Progression:** Long-term equipment investment
- Building perfect gear sets
- Collecting rare material types
- Mastering enhancement combinations
- Salvaging skill progression unlocks better rates

### Polish Points

- Salvage animation duration: 1.2 seconds (fast enough to chain, slow enough to feel meaningful)
- Material collection delay: 0.3 seconds (builds anticipation)
- Tinkering channeling time: 3 seconds (creates tension)
- Success celebration duration: 2 seconds (allows savoring without disrupting flow)
- Particle effect quality scales with device performance
- Smart batching for mass salvaging (hold button to continue)

## User Interface & Experience

### Salvaging Interface

**Layout:**
- Grid view of eligible items
- Quick filters: Rarity, Type, Level
- Batch selection with shift+click or area drag
- Salvage preview showing expected materials
- "Salvage All" with rarity threshold safeguard

**Information Display:**
- Item comparison tooltip
- Expected material yield range
- Workmanship preview
- Current material inventory
- Success rate preview if used for tinkering

### Tinkering Workbench

**Main Screen:**
- Central item slot for enhancement target
- Material slots around it (visual recipe)
- Success rate percentage prominently displayed
- Enhancement preview on hover
- Previous enhancement history

**Mobile Adaptations:**
- Swipe gestures for inventory navigation
- Pinch to zoom on item details
- Drag and drop with haptic feedback
- One-thumb accessible confirm buttons
- Auto-rotate for landscape crafting mode

### Accessibility Features

- Colorblind modes for material differentiation
- Text labels option for all materials
- Keyboard shortcuts for all actions
- Screen reader support with descriptive audio cues
- Reduced motion mode for particle effects
- Confirmation dialogues for high-value salvaging

## Progression Integration

### Unlock Progression

**Level 10:** Basic salvaging unlocked
- Access to Iron and Hide materials
- Can salvage Common and Uncommon items
- 5 tinkering attempts per day

**Level 25:** Advanced salvaging
- Access to Steel and Bone materials
- Can salvage Rare items
- 10 tinkering attempts per day
- Workmanship refinement unlocked

**Level 40:** Expert tinkering
- All material types available
- Can salvage Epic items
- Unlimited tinkering attempts
- Foolproof bag crafting unlocked

**Level 50+:** Master craftsman
- Legendary item salvaging
- Special enhancement combinations
- Reduced material costs (-20%)
- Can teach tinkering to other players (social feature)

### Skill Progression

**Salvaging Skill (0-300):**
- +0.5% material yield per point
- +0.1% critical salvage chance per point
- Milestone bonuses at 50, 100, 200, 300
- Gained through salvaging (1 point per 100 items)

**Tinkering Skill (0-300):**
- +0.2% success rate per point
- Unlocks advanced enhancements at thresholds
- Gained through successful tinkering
- Failed attempts give 50% skill experience

### Power Scaling

**Early Game (Levels 1-25):**
- Enhancements provide 5-10% power increase
- Focus on basic stats and defense

**Mid Game (Levels 26-40):**
- Enhancements provide 15-25% power increase
- Introduction of specialized builds

**Late Game (Levels 41-50):**
- Enhancements provide 30-40% power increase
- Critical for end-game content completion

**End Game (Level 50+):**
- Min-maxing for 1-2% improvements
- Prestige enhancements for cosmetic effects

## Technical Requirements

### Performance Constraints

- Salvaging animation: 60 FPS on mid-tier devices
- Material particle count: Dynamic (100-1000 based on device)
- Inventory updates: <100ms response time
- Batch salvaging: Process 50 items/second
- Network sync: 500ms maximum latency tolerance

### Data Structures

```javascript
// Salvage Material
{
  id: string,
  type: MaterialType,
  workmanship: number (1-100),
  quantity: number,
  sourceItemLevel: number,
  timestamp: Date
}

// Tinkered Item
{
  baseItemId: string,
  enhancements: [{
    type: EnhancementType,
    material: MaterialType,
    value: number,
    appliedDate: Date
  }],
  tinkerCount: number (0-10),
  isImbued: boolean,
  durability: number (0-100)
}
```

### Save/Load Considerations

- Material inventory saved incrementally
- Tinkering history logged for rollback capability
- Cloud save sync every 5 minutes
- Local cache for offline tinkering planning
- Maximum 10MB per player for crafting data

### Network Requirements

- Salvaging can be done offline (sync on reconnect)
- Tinkering requires server validation
- Material trading uses secure transaction system
- Anti-cheat validation for material generation
- Rate limiting: 100 salvage operations/minute

### Platform-Specific Needs

**Mobile:**
- Reduced particle effects option
- Batch processing UI for small screens
- Touch-optimized drag and drop
- Background salvaging notification

**Tablet:**
- Multi-window support for wiki reference
- Landscape-optimized crafting layout

**Cross-Platform:**
- Shared material inventory
- Synchronous tinkering results
- Platform-agnostic save system

## Balance Considerations

### Risk vs Reward Analysis

**Low Risk (Common Materials):**
- 33% success rate, low cost
- 5-10% enhancement value
- Suitable for incremental progress

**Medium Risk (Rare Materials):**
- 45-60% success rate with skills
- 15-20% enhancement value
- Best efficiency for progression

**High Risk (Legendary Materials):**
- 33-50% success rate even with max skill
- 25-35% enhancement value
- Required for competitive play

### Exploitation Prevention

- Server-side validation of all salvage operations
- Rate limiting on salvaging and tinkering
- Bound materials from certain sources
- Weekly caps on Foolproof bags
- Anti-automation detection (pattern analysis)
- Trade restrictions on newly tinkered items (24-hour bind)

### Difficulty Curve Integration

- Tutorial introduces salvaging before tinkering
- Guaranteed success on first three tinkering attempts
- Gradual introduction of material types
- Skill requirements gate advanced features
- End-game content balanced assuming 80% tinkered gear

### Economy Impact

**Material Sinks:**
- Refinement process (3:1 loss)
- Failed tinkering attempts
- Repair costs for damaged items
- Foolproof bag crafting costs

**Market Dynamics:**
- Material prices fluctuate based on meta shifts
- Rare material spawns on weekly rotation
- Trade hub for material exchange
- Guild banks can store shared materials

## Success Metrics

### Player Experience Goals

- 70% of players engage with salvaging by level 15
- Average 3-5 tinkering attempts per play session
- 80% success rate for players using Workmanship 75+ materials
- Less than 5% frustration quit rate after failures
- 90% of max-level players have fully tinkered gear

### Engagement Targets

- Daily Active Tinkers: 60% of DAU
- Average session extension: +10 minutes for salvage/tinkering
- Material trading: 20% of player trades involve materials
- Repeat tinkering on same item: Average 6 times

### Technical Performance Benchmarks

- Salvaging operation: <100ms processing time
- Tinkering validation: <500ms round trip
- Memory footprint: <50MB for complete system
- Battery impact: <5% additional drain per hour

### Fun Validation Criteria

- "One more salvage" loop engagement
- Positive sentiment in feedback (>80% favorable)
- Stream/content creator adoption rate >50%
- Reddit discussion thread activity (>100 posts/week)
- Time-to-understanding: <2 minutes in tutorial

## Implementation Priority

### MVP Requirements (Must-Have)

1. Basic salvaging of items into materials
2. Simple tinkering with flat success rates
3. Three material types (Metal, Gem, Organic)
4. Weapon damage and armor defense enhancements
5. Basic UI for both systems
6. Server validation for all operations
7. Tutorial introduction sequence

### Enhancement Features (Nice-to-Have)

1. Workmanship system
2. Foolproof bags
3. Material refinement
4. Advanced enhancement combinations
5. Visual effects for enhanced items
6. Trading system integration
7. Guild material banks
8. Salvaging skill progression
9. Daily/weekly tinkering quests
10. Leaderboards for successful enhancements

### Future Expansion Potential

- Seasonal materials for limited-time enhancements
- Player-to-player tinkering services
- Legendary tinkering recipes from raid bosses
- Material transmutation system
- Enhancement removal/transfer system
- Tinkering specialization classes
- Automated salvaging pets/companions
- Material farming dungeons
- Cross-server material markets
- NFT integration for unique enhancements (if applicable)

### Dependencies and Blockers

**Required Systems:**
- Functional inventory system
- Item rarity/quality tiers
- Basic crafting UI framework
- Server-side validation infrastructure
- Player progression/level system

**Technical Dependencies:**
- Database schema for material storage
- Network protocol for crafting operations
- Anti-cheat system integration
- Analytics pipeline for metrics
- Particle system for visual effects

**Content Dependencies:**
- Balanced item drop rates
- Material source distribution
- Enhancement value tables
- Tutorial script and localization
- UI art assets and animations

## Quality Assurance Notes

This system builds upon proven mechanics from successful games while adapting them for modern mobile/cross-platform play. The risk/reward balance provides meaningful decisions without excessive punishment, while the progression integration ensures long-term engagement without creating an insurmountable power gap between players. The technical requirements are achievable with current infrastructure, and the monetization potential (through Foolproof bags and cosmetic enhancements) provides revenue opportunities without compromising gameplay integrity.

The feature successfully enhances the core loot-driven gameplay loop by making every item potentially valuable, reduces inventory management frustration by providing clear paths for unwanted items, and creates a satisfying progression layer that extends content longevity between major updates.