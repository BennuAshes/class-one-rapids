# Asheron's Call Idler: Comprehensive POC Design Document

## Executive Summary

**Project Vision**: Transform the revolutionary character progression and world systems of Asheron's Call (1999) into a modern idler/clicker game that captures the essence of limitless character customization and skill-based advancement while leveraging proven idle game satisfaction mechanics.

**Core Innovation**: Unlike traditional class-based idle RPGs, this game offers complete character building freedom through Asheron's Call's revolutionary skill system, adapted for idle progression with automated combat, spell research, and world exploration.

**Target Audience**: RPG enthusiasts seeking deep customization, idle game fans wanting meaningful progression, and nostalgic Asheron's Call veterans.

---

## 1. Core Game Concept

### 1.1 Central Theme: "The Endless Dereth"

Players control a newly arrived character on the island of Dereth, automatically exploring, fighting, and growing stronger through the game's flexible skill system. Unlike traditional MMORPGs constrained by time and groups, this idle version allows players to experience the full depth of Asheron's Call's character development at their own pace.

### 1.2 Core Fantasy

- **Freedom Builder**: Create any character combination imaginable
- **Master Experimenter**: Test different skill builds and strategies
- **Persistent Explorer**: Continuously discover new areas and challenges
- **Spell Researcher**: Develop magical abilities across multiple schools
- **Equipment Artisan**: Improve gear through tinkering and enchantment

### 1.3 Primary Game Loop

**Basic Cycle (10-30 seconds)**:
Combat → Loot → Experience Gain → Skill Investment → Stronger Combat

**Meta Cycle (5-15 minutes)**:
Area Exploration → New Challenge Discovery → Character Build Adjustment → Progression Unlock

**Prestige Cycle (2-6 hours)**:
World Reset → Heritage Selection → Advanced Character Building → Deeper Progression Access

---

## 2. Character System Architecture

### 2.1 The Six Vital Attributes (Adapted from AC)

Each attribute automatically improves combat effectiveness and unlocks new capabilities:

**Strength**
- *Idle Function*: Increases melee damage output per second
- *Unlocks*: Heavy armor usage, advanced melee techniques
- *Visual Feedback*: Character model grows more muscular

**Endurance** 
- *Idle Function*: Increases health regeneration and combat duration
- *Unlocks*: Extended exploration sessions, environmental resistance
- *Visual Feedback*: Improved recovery animations, less fatigue

**Coordination**
- *Idle Function*: Increases ranged attack accuracy and speed  
- *Unlocks*: Advanced archery skills, precise tinkering
- *Visual Feedback*: Smoother attack animations, better aim tracking

**Quickness**
- *Idle Function*: Increases attack speed and dodge chance
- *Unlocks*: Stealth abilities, rapid movement techniques
- *Visual Feedback*: Faster character animations, blur effects

**Focus**
- *Idle Function*: Increases mana regeneration and spell effectiveness
- *Unlocks*: Advanced magic schools, spell research
- *Visual Feedback*: Magical aura effects, enchanted equipment glow

**Self**
- *Idle Function*: Increases mana pool and spell duration
- *Unlocks*: Life magic mastery, advanced enchantments
- *Visual Feedback*: Character emanates confidence, enhanced spell effects

### 2.2 Skill System Implementation

**Starting Allocation**: 270 attribute points distributed at character creation
**Skill Points**: Begin with 50, earn more through level progression
**Specialization System**: Three tiers per skill:
- **Untrained**: No skill points invested, basic capability
- **Trained**: Skill points invested, improved effectiveness  
- **Specialized**: Major skill point investment, maximum potential

**Core Skill Categories**:

**Combat Skills**
- *Melee Defense*: Reduces incoming melee damage
- *Missile Defense*: Reduces incoming ranged damage  
- *Magic Defense*: Reduces incoming spell damage
- *Sword/Axe/Mace/Dagger*: Weapon-specific damage bonuses
- *Bow/Crossbow*: Ranged weapon specializations

**Magic Schools**
- *War Magic*: Direct damage spells with automated targeting
- *Life Magic*: Healing and enhancement buffs
- *Item Magic*: Equipment enchantments and improvements
- *Creature Magic*: Debuffs and creature manipulation

**Utility Skills**  
- *Healing*: Health restoration effectiveness
- *Lockpick*: Chest and door access in exploration
- *Appraise*: Improved loot identification and value
- *Tinkering*: Equipment modification and improvement

**Movement Skills**
- *Jump*: Enables access to elevated areas
- *Run*: Increases exploration speed between areas

### 2.3 Experience Investment System

**XP Generation**: Automatic through combat, exploration, and achievement
**Investment Choice**: Players manually allocate XP to attributes or skills
**Scaling Costs**: Higher levels require exponentially more investment
**Respec Options**: Limited reallocation opportunities through special items

---

## 3. Automated Combat System

### 3.1 Combat Flow

**Target Selection**: AI automatically selects appropriate enemies based on character strength
**Attack Execution**: Uses highest skilled weapon type automatically
**Spell Casting**: Rotates through known spells based on effectiveness
**Defense Calculation**: Combines trained defense skills for damage reduction
**Loot Distribution**: Automatic pickup with inventory management

### 3.2 Skill-Based Combat Depth

**Melee Specialists**: High Strength/Endurance builds excel at sustained close combat
**Archer Builds**: Coordination/Quickness focus for rapid ranged elimination  
**Mage Characters**: Focus/Self investment for devastating spell combinations
**Hybrid Warriors**: Balanced builds offering versatility across combat types

### 3.3 Enemy Progression

**Area-Based Challenges**: Each region features level-appropriate enemies
**Skill Requirement Gates**: Some enemies require specific skill combinations
**Elite Encounters**: Special enemies dropping rare upgrade materials
**Boss Creatures**: Major challenges requiring optimized builds

---

## 4. Magic System Adaptation

### 4.1 Automated Spell Research

**Research Progression**: Characters automatically discover new spells within their specialized schools
**Component Management**: Automated reagent collection and consumption  
**Spell Level Scaling**: Power levels 1-7 unlock progressively
**Mana Management**: Automatic mana conservation based on combat efficiency

### 4.2 The Four Schools of Magic

**War Magic** (Damage Focus)
- *Levels 1-3*: Basic elemental damage (Force Bolt, Flame Bolt, etc.)
- *Levels 4-5*: Area effect spells (Blade Blast, Shock Wave)
- *Levels 6-7*: Devastating single-target destruction

**Life Magic** (Enhancement/Healing)  
- *Levels 1-3*: Basic healing and minor attribute buffs
- *Levels 4-5*: Major regeneration and stat enhancements
- *Levels 6-7*: Powerful protective barriers and restoration

**Item Magic** (Equipment Enhancement)
- *Levels 1-3*: Weapon sharpening and armor hardening  
- *Levels 4-5*: Elemental weapon enhancement and magical protection
- *Levels 6-7*: Legendary equipment transformations

**Creature Magic** (Debuff/Control)
- *Levels 1-3*: Basic weakening and slowing effects
- *Levels 4-5*: Attribute drain and movement restriction
- *Levels 6-7*: Powerful debilitation and control effects

### 4.3 Spell Combination Synergies

**Spell Stacking**: Multiple schools can enhance each other
**Build Optimization**: Different combinations favor different play styles
**Automatic Casting**: AI selects optimal spell combinations for current situation
**Mana Efficiency**: Higher skills reduce mana costs and increase effectiveness

---

## 5. World Exploration System

### 5.1 Dereth Island Adaptation

**Automated Travel**: Characters automatically move between areas
**Discovery Mechanics**: New regions unlock based on character capabilities
**Skill Gates**: Certain areas require specific skill thresholds
**Environmental Challenges**: Hazards requiring particular resistances or abilities

### 5.2 Area Progression Structure

**Starter Areas**
- *Holtburg*: Balanced challenges for new characters
- *Shoushi*: Emphasis on magic and intelligence-based progression  
- *Yaraq*: Focus on physical skills and endurance

**Mid-Tier Regions**
- *Cragstone*: Advanced melee combat challenges
- *Hebian-To*: Complex magical puzzles and research opportunities
- *Tufa*: Mixed combat requiring diverse skill sets

**End-Game Areas**  
- *Marae Lassel*: Extreme challenges requiring specialized builds
- *Lost City of Neftet*: Puzzle-heavy areas demanding specific skill combinations
- *Harbinger Dungeons*: Ultimate tests of character optimization

### 5.3 Exploration Rewards

**Skill Point Bonuses**: Discovering new areas grants additional skill points
**Rare Reagents**: Magical components for advanced spellcasting
**Unique Equipment**: Area-specific loot with special properties
**Lore Unlocks**: Story fragments that enhance the game's narrative depth

---

## 6. Equipment and Tinkering System

### 6.1 Automated Equipment Management  

**Loot Evaluation**: AI automatically compares and equips superior gear
**Equipment Scaling**: Gear effectiveness improves with relevant skills
**Wear and Repair**: Items degrade over time but auto-repair with materials
**Storage Management**: Intelligent inventory sorting and space optimization

### 6.2 Tinkering Integration

**Material Collection**: Automatic gathering of tinkering materials during exploration
**Equipment Enhancement**: Graduated improvement system using collected materials
**Skill-Based Results**: Higher Tinkering skill enables better modifications
**Risk/Reward Balance**: Advanced tinkering can improve or destroy items

**Tinkering Categories**:
- *Weapon Tinkering*: Damage, accuracy, and durability improvements
- *Armor Tinkering*: Protection, weight reduction, and special resistances  
- *Item Tinkering*: Magical enhancement and special property addition
- *Salvaging*: Breaking down items for rare crafting materials

### 6.3 Equipment Progression Path

**Basic Gear**: Simple weapons and armor found through early exploration
**Tinked Equipment**: Enhanced gear providing significant stat bonuses
**Magical Items**: Spell-enhanced equipment with special abilities
**Legendary Artifacts**: Rare items with unique properties and massive bonuses

---

## 7. Prestige and Meta-Progression

### 7.1 Heritage System (Prestige Mechanic)

**World Reset Concept**: Character "ascends" to start new life with advantages
**Heritage Selection**: Choose from different Asheron's Call heritage groups
**Permanent Bonuses**: Each heritage provides lasting bonuses across all future characters
**Cumulative Power**: Multiple prestige runs stack bonuses for increasing effectiveness

**Heritage Groups and Bonuses**:

**Aluvian** (Traditional Fantasy)
- *Bonus*: +10% melee damage and +5% weapon skill experience
- *Theme*: Balanced progression with combat focus

**Gharu'ndim** (Desert Warrior Culture)  
- *Bonus*: +15% movement speed and +10% exploration rewards
- *Theme*: Rapid progression and discovery emphasis

**Sho** (Oriental Philosophy)
- *Bonus*: +20% magic effectiveness and +10% mana regeneration
- *Theme*: Magical mastery and spell research focus

**Viamontian** (Noble Warrior)
- *Bonus*: +25% rare loot chance and +15% equipment durability
- *Theme*: Superior equipment acquisition and maintenance

### 7.2 Legacy Skills

**Skill Mastery**: Achieving maximum specialization in skills unlocks legacy versions
**Cross-Character Benefits**: Legacy skills provide bonuses to all future characters
**Deep Specialization**: Incentivizes focused builds rather than generalization
**Collection Gameplay**: Encourages multiple playthroughs with different builds

### 7.3 Ascension Challenges

**Skill Requirements**: Must achieve specific skill combinations before ascension
**Area Completion**: Full exploration of major regions required
**Boss Victories**: Defeat significant creatures to prove character capability
**Tinkering Mastery**: Create legendary equipment through advanced crafting

---

## 8. Idle Mechanics Implementation

### 8.1 Offline Progression

**Combat Continuation**: Characters continue fighting appropriate enemies
**Skill Training**: Slow skill improvement through automated practice
**Exploration Advance**: Gradual progression through known areas
**Resource Accumulation**: Automatic collection of basic materials

**Offline Limits**:
- Maximum 12 hours of accumulation before requiring player return
- Reduced efficiency compared to active play
- No major discoveries or rare loot acquisition
- Limited skill point and XP generation

### 8.2 Active Play Bonuses

**Real-Time Decisions**: Manual skill point allocation and build optimization
**Equipment Management**: Conscious gear upgrades and tinkering choices
**Exploration Direction**: Choosing which areas to focus exploration efforts
**Combat Optimization**: Adjusting spell preferences and combat priorities

**Active Multipliers**:  
- 2x experience gain during active play sessions
- 3x rare loot discovery chance
- Access to manual spell research and tinkering
- Ability to tackle challenging content requiring decisions

### 8.3 Return Incentives

**Accumulated Progress**: Significant advancement during offline periods
**New Opportunities**: Discovery of new areas or equipment requires active attention
**Skill Decisions**: Accumulated skill points require manual allocation
**Strategic Choices**: Build optimization opportunities after extended progression

---

## 9. User Interface Design

### 9.1 Primary Screen Layout

**Character Display**: 3D character model showing equipment and current action
**Attribute Panel**: Six vital attributes with current values and improvement costs
**Skill Overview**: Active skills with specialization levels and upgrade options  
**Combat Feed**: Scrolling log of recent combat actions and achievements

### 9.2 Secondary Screens

**Skill Management**
- Detailed skill trees with progression paths
- Experience investment interface
- Skill effect explanations and bonuses
- Respecialization options

**Equipment Screen**
- Character paper doll with equipped items
- Inventory management with auto-sort options
- Tinkering interface for equipment enhancement
- Equipment comparison and optimization suggestions

**World Map**
- Dereth island overview with area unlock status
- Current location indicator and travel options
- Area difficulty ratings and recommended skill levels
- Discovery progress and exploration bonuses

**Magic Research**
- Spell school progression trees
- Component requirements and automatic management
- Spell effectiveness analysis and optimization
- Combination synergy exploration

### 9.3 Feedback Systems

**Immediate Feedback**
- Floating damage numbers during combat
- Skill point gain notifications
- Item acquisition celebrations  
- Level up and milestone achievements

**Progress Indicators**
- Experience bars for skills and attributes
- Area completion percentages
- Equipment enhancement progress
- Heritage advancement tracking

**Achievement System**
- Skill mastery milestones
- Exploration accomplishments  
- Combat victories and rare discoveries
- Build experimentation rewards

---

## 10. Monetization Strategy

### 10.1 Revenue Model: Convenience-First Approach

**Primary Revenue**: Rewarded video ads (70% of revenue)
**Secondary**: Time-skip purchases and cosmetic options (25%)  
**Tertiary**: Premium heritage unlocks and exclusive content (5%)

### 10.2 Rewarded Advertising Integration

**Experience Multipliers**: Watch ad for 2x XP gain for 30 minutes
**Skill Point Bonuses**: Additional skill points for character development
**Rare Loot Boosts**: Increased chance for exceptional equipment
**Tinkering Materials**: Extra crafting resources for equipment enhancement

**Ad Placement Strategy**:
- Offer ads every 15-20 minutes of active play
- Always optional with clear value proposition
- Multiple reward options for different player priorities
- Ads integrated contextually with game progression

### 10.3 In-App Purchase Options

**Time Acceleration**
- Premium offline progression rates
- Instant skill point accumulation options
- Rapid area exploration unlocks
- Accelerated equipment enhancement

**Cosmetic Enhancements**
- Character appearance customization
- Unique spell effect animations
- Distinctive equipment visual themes
- Heritage-specific cosmetic unlocks

**Convenience Features**
- Additional character slots for build experimentation
- Advanced inventory management tools
- Detailed analytics for build optimization
- Save state backup and restoration

### 10.4 Ethical Monetization Principles

**No Pay-to-Win**: All mechanical advantages available through gameplay
**Respect Player Time**: Purchases enhance rather than bypass content
**Transparent Value**: Clear benefit explanation for all purchases
**F2P Completability**: Full game content accessible without spending

---

## 11. Technical Architecture

### 11.1 Core Systems

**Calculation Engine**
- Efficient attribute and skill impact calculations
- Real-time combat resolution with damage formulas  
- Experience point distribution and skill advancement
- Equipment effectiveness scaling based on character skills

**Save System**
- Local storage with cloud backup capability
- Cross-device synchronization for multiple platforms
- Automatic save during critical progression moments
- Recovery systems for data corruption protection

**Content Management**
- Modular area and enemy data for easy expansion
- Dynamic equipment generation with property combinations
- Spell research progression tracking and unlock management
- Heritage and prestige bonus application system

### 11.2 Performance Optimization

**Battery Efficiency**
- Reduced calculation frequency during idle periods
- Smart background processing with CPU throttling
- Optimized animation systems with level-of-detail scaling
- Network activity minimization for offline play

**Memory Management**
- Efficient storage of character progression data
- Texture and asset streaming for large world representation
- Garbage collection optimization for smooth performance
- Cache management for frequently accessed game data

**Scalability Considerations**  
- Support for extended offline periods without overflow
- Graceful degradation on lower-end mobile devices
- Platform-specific optimization for iOS and Android
- Future expansion capability for additional content

### 11.3 Analytics Integration

**Player Behavior Tracking**
- Skill point allocation patterns and build preferences
- Area progression speeds and difficulty pain points
- Monetization touchpoint effectiveness and conversion rates
- Session length and return frequency analysis

**Balance Monitoring**
- Experience gain rates across different builds and areas
- Equipment effectiveness and tinkering success rates  
- Combat encounter difficulty and player success rates
- Feature usage patterns and engagement metrics

**Continuous Optimization**  
- A/B testing framework for UI and balance changes
- Live balance adjustments based on player data
- Feature adoption tracking and improvement opportunities
- Community feedback integration and response systems

---

## 12. Content Expansion Pipeline

### 12.1 Regular Update Cadence

**Monthly Content Drops** (Following AC's original model)
- New areas with unique challenges and rewards
- Additional heritage options with distinct bonuses
- Advanced equipment sets with special properties
- Seasonal events and limited-time achievements

**Quarterly Major Updates**
- New skill specializations and progression paths
- Expanded tinkering systems and material types
- Enhanced social features and competitive elements
- Story content advancing Dereth's ongoing narrative

### 12.2 Community-Driven Development

**Player Feedback Integration**
- Regular surveys on preferred content types
- Build sharing and optimization community features  
- Player-generated optimization guides and tutorials
- Community challenges and competitive events

**Beta Testing Program**
- Early access to new content for dedicated players
- Balance testing with experienced character builds
- Feature feedback before general release
- Community moderator and advocate programs

### 12.3 Long-Term Content Vision

**Year One**: Establish core systems and player base
**Year Two**: Advanced skill systems and world expansion
**Year Three**: Social features and competitive elements
**Year Four+**: Player-generated content and modification support

---

## 13. Launch Strategy & Success Metrics

### 13.1 Soft Launch Approach

**Limited Regional Release**: Test markets for balance and retention optimization
**Influencer Partnership**: Asheron's Call veterans and idle game content creators
**Community Building**: Discord and Reddit communities for feedback and support
**Iterative Improvement**: Rapid response to player feedback and data insights

### 13.2 Success Metrics

**Engagement Targets**
- Day 1 Retention: 70%+
- Day 7 Retention: 40%+  
- Day 30 Retention: 15%+
- Average Session Length: 20+ minutes

**Monetization Goals**
- ARPU (Average Revenue Per User): $2.50+ monthly
- Ad Engagement Rate: 80%+ of rewarded video offers
- IAP Conversion: 8%+ of players make purchases
- LTV (Lifetime Value): $15+ per retained player

**Community Building**
- Discord Server: 5,000+ active members within 6 months
- Reddit Community: 2,000+ subscribers with regular engagement
- Content Creation: 50+ YouTube videos and guides within first year
- Player Reviews: 4.5+ stars across app stores

### 13.3 Long-Term Vision

**Build the Definitive Idle RPG**: Establish reputation as deepest character customization in genre
**Expand the AC Universe**: Potential for companion games and expanded lore
**Community Ownership**: Player-driven evolution and content creation
**Genre Innovation**: Demonstrate viability of skill-based idle progression systems

---

## 14. Risk Analysis & Mitigation

### 14.1 Design Risks

**Complexity Overwhelming**: AC's system depth may confuse casual idle players
- *Mitigation*: Detailed tutorial system and build templates
- *Alternative*: "Simplified" mode with automated character development

**Analysis Paralysis**: Too many skill choices preventing player progress  
- *Mitigation*: Clear build suggestions and effectiveness feedback
- *Alternative*: Guided progression paths with branch points

**Balance Challenges**: Multiple progression paths difficult to balance
- *Mitigation*: Extensive analytics and regular balance updates  
- *Alternative*: Community feedback integration and rapid iteration

### 14.2 Market Risks

**Niche Appeal**: Asheron's Call nostalgia market may be too small
- *Mitigation*: Broader marketing to idle RPG audience
- *Alternative*: Emphasis on customization rather than AC branding

**Competition Saturation**: Idle RPG market highly competitive
- *Mitigation*: Unique selling proposition of unlimited character building
- *Alternative*: Focus on depth over breadth compared to competitors

**Monetization Challenges**: Ethical approach may limit revenue potential
- *Mitigation*: Premium cosmetic options and convenience features
- *Alternative*: Subscription model for dedicated players

### 14.3 Technical Risks

**Performance Issues**: Complex calculations causing battery drain
- *Mitigation*: Optimization focus and efficient algorithms
- *Alternative*: Cloud-based calculation for complex processing

**Data Corruption**: Complex save data vulnerable to corruption
- *Mitigation*: Multiple backup systems and recovery protocols
- *Alternative*: Server-side save data with local caching

**Platform Restrictions**: App store policies affecting monetization
- *Mitigation*: Compliance review and policy adherence
- *Alternative*: Platform-specific optimization and feature adaptation

---

## Conclusion: The Ultimate Character Builder

This Asheron's Call idler represents the perfect fusion of two gaming philosophies: the deep, unlimited customization that made AC revolutionary, and the accessible, satisfying progression that defines successful idle games. By maintaining the essence of Asheron's Call's skill-based character development while adapting it to modern idle mechanics, this POC offers something genuinely unique in the crowded idle RPG market.

The game respects both the legacy of Asheron's Call and the psychological principles that make idle games compelling. Players get the satisfaction of watching numbers increase and characters grow stronger, but with the meaningful choices and strategic depth that traditional idle games often lack. Every skill point allocation matters, every build decision creates meaningful differences, and every prestige run offers genuine experimentation opportunities.

Most importantly, this design demonstrates how innovation in game design often comes not from inventing new mechanics, but from applying proven principles in new contexts. Asheron's Call's revolutionary character system, perfected over two decades, provides the foundation for an idle game that could define a new subgenre: the deep customization idler.

**The future of idle games isn't just about watching numbers go up—it's about meaningful choices that make those numbers matter.**

---

*Design Document v1.0 - Comprehensive POC for Asheron's Call Idler*  
*Total Research & Analysis: 40+ hours of synthesis*  
*Implementation Estimate: 18-24 months for full release*