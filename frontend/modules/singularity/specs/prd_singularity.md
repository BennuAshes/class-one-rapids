# Product Requirements Document: Singularity System

**Version:** 1.0
**Date:** 2025-11-17
**Feature:** Singularity Progression System
**Module:** `/frontend/modules/singularity`

---

## 1. Overview

### 1.1 Executive Summary
The Singularity System introduces a multi-tiered progression mechanic where AI Pets can evolve through different tiers - from regular AI Pets to Big AI Pets and ultimately to Singularity Pets. This feature creates a long-term progression goal and introduces strategic depth through pet combination mechanics and skill acquisition.

### 1.2 Background
Currently, the game focuses on feeding AI Pets to increase the pet count, which generates scrap passively. While this provides a basic gameplay loop, it lacks long-term progression goals and strategic depth. The Singularity System addresses this by introducing:
- A prestige-like mechanic where pets can reach "singularity" over time
- An intermediate tier (Big AI Pets) created by combining regular pets
- A skill system exclusive to Singularity Pets that adds unique visual and gameplay elements
- Strategic decisions around pet management, feeding, and upgrading

### 1.3 Objectives
- Create a compelling long-term progression system with multiple pet tiers
- Introduce strategic resource management (when to combine pets vs. accumulate them)
- Provide meaningful rewards for investing in pet upgrades and feeding
- Establish a skill system that adds visual flair and player expression
- Design an extensible framework that supports future tier additions and skill expansions
- Ensure seamless integration with existing pet count, scrap, and upgrade systems

---

## 2. Goals

### 2.1 Player Engagement Goals
1. **Long-term Retention:** Provide players with meaningful progression beyond simple number increases
2. **Strategic Depth:** Introduce decisions about resource allocation and pet management
3. **Visual Rewards:** Create satisfying visual feedback through pet transformations and skills
4. **Achievement Satisfaction:** Give players clear milestones (first Big Pet, first Singularity Pet, new skills)

### 2.2 Gameplay Goals
1. **Progression Pacing:** Balance singularity rates to create anticipation without frustration
2. **Resource Tradeoffs:** Create meaningful choices between scrap generation and singularity progress
3. **Skill Discovery:** Make skill acquisition feel rewarding and impactful
4. **Tier Transitions:** Ensure each tier feels distinct and valuable

### 2.3 Technical Goals
1. **Scalable Architecture:** Support addition of new tiers, skills, and mechanics
2. **Performance:** Maintain smooth gameplay with visual effects (painting trails, etc.)
3. **State Management:** Track multiple pet types and their progression efficiently
4. **Persistence:** Reliably save and restore all singularity-related progress

---

## 3. User Stories

### 3.1 Core User Stories - Pet Tiers

**US-1: View Pet Tier Counts**
As a player, I want to see separate counts for my AI Pets, Big AI Pets, and Singularity Pets, so that I understand my current progression across all tiers.

**Acceptance Criteria:**
- Main screen displays three distinct counters: "AI Pet Count", "Big AI Pet Count", "Singularity Pet Count"
- Each counter shows the current quantity for that tier
- Counters are visually distinct and clearly labeled
- Counters update in real-time as pets progress through tiers

**US-2: Passive Singularity Progression**
As a player, I want my AI Pets to progress toward singularity over time automatically, so that I can achieve progression even when not actively playing.

**Acceptance Criteria:**
- AI Pets have a base chance to reach singularity over time
- Singularity progression happens passively (no manual trigger required)
- When a pet reaches singularity, the AI Pet count decreases by 1
- When a pet reaches singularity, the Singularity Pet count increases by 1
- Progression occurs at a balanced rate (not too fast or too slow)
- Time-based progression continues when app is closed (offline progress)

**US-3: Accelerate Singularity Through Feeding**
As a player, I want feeding my pets to help them reach singularity sooner, so that I can actively work toward my progression goals.

**Acceptance Criteria:**
- Each feed action increases singularity progress for all AI Pets
- Feeding provides a significant boost compared to passive progression
- Progress boost is clearly communicated (visual feedback or tooltip)
- Effect scales reasonably with number of feeds

**US-4: Accelerate Singularity Through Upgrades**
As a player, I want to purchase upgrades that help my pets reach singularity faster, so that I can invest scrap in long-term progression.

**Acceptance Criteria:**
- Specific upgrades in the shop increase singularity rate
- Upgrade descriptions clearly state their effect on singularity
- Multiple upgrades stack (compound or additive)
- Effects persist across app sessions

### 3.2 Core User Stories - Big AI Pets

**US-5: Combine Pets into Big AI Pets**
As a player, I want to combine multiple AI Pets to create a Big AI Pet, so that I can progress toward higher tiers.

**Acceptance Criteria:**
- An upgrade or action allows combining multiple AI Pets
- Combining requires a specific number of AI Pets (e.g., 10 or 100)
- When combined, AI Pet count decreases by the required amount
- When combined, Big AI Pet count increases by 1
- Action is clearly available and understandable
- Combination is permanent (cannot be reversed)

**US-6: Big AI Pets Generate Different Resources**
As a player, I want to understand the tradeoffs between AI Pets and Big AI Pets, so that I can make informed strategic decisions.

**Acceptance Criteria:**
- Big AI Pets have a lower scrap generation rate than equivalent AI Pets
- Big AI Pets have a significantly higher singularity chance than AI Pets
- Rates are clearly displayed or documented
- Scrap generation continues passively for Big AI Pets
- Player can compare rates before combining pets

**US-7: Big AI Pets Progress to Singularity**
As a player, I want my Big AI Pets to progress toward singularity faster than regular pets, so that I feel rewarded for creating them.

**Acceptance Criteria:**
- Big AI Pets have a higher base singularity rate than AI Pets (e.g., 10x or 100x)
- When a Big AI Pet reaches singularity, Big AI Pet count decreases by 1
- When a Big AI Pet reaches singularity, Singularity Pet count increases by 1
- Higher progression rate is noticeable during gameplay
- Feeding and upgrades also accelerate Big AI Pet singularity

### 3.3 Core User Stories - Singularity Pets & Skills

**US-8: View Singularity Pet Skills**
As a player, I want to see what skills my Singularity Pets can learn, so that I can work toward acquiring them.

**Acceptance Criteria:**
- A dedicated UI section shows available skills
- Each skill displays: name, description, unlock requirements
- Skills are organized in a clear, browsable list
- Locked skills indicate what's needed to unlock them
- Unlocked skills are visually distinct from locked skills

**US-9: Unlock Pet Skills**
As a player, I want my Singularity Pets to learn skills, so that I can unlock new visual effects and gameplay elements.

**Acceptance Criteria:**
- Skills become available when certain conditions are met (e.g., number of Singularity Pets)
- When a skill is unlocked, it's marked as "Learned" or "Active"
- Unlock is automatic when conditions are met (no manual trigger)
- Unlock persists across app sessions
- Player receives clear notification when a skill is unlocked

**US-10: Experience Painting Skill**
As a player, I want my Singularity Pet to paint colorful trails on the screen, so that I can enjoy visual rewards for my progression.

**Acceptance Criteria:**
- When "Painting" skill is unlocked, visual trails appear on screen
- Trails consist of various colors (randomly selected or patterned)
- Trails appear during specific actions (e.g., when feeding, or continuously)
- Trails fade over time (don't clutter the screen permanently)
- Effect can be toggled on/off if desired
- Performance remains smooth with trails active

### 3.4 Secondary User Stories

**US-11: View Singularity Progress**
As a player, I want to see how close my pets are to reaching singularity, so that I can anticipate upcoming tier transitions.

**Acceptance Criteria:**
- Optional: Progress bar or percentage shows singularity progress
- Progress updates in real-time as it accumulates
- Separate progress indicators for AI Pets and Big AI Pets (if individual tracking)
- Progress is visible without obstructing primary UI

**US-12: Understand Singularity Mechanics**
As a player, I want to understand how the singularity system works, so that I can make informed decisions.

**Acceptance Criteria:**
- Tutorial or help section explains singularity tiers
- Explanation covers: how pets progress, what affects rate, benefits of each tier
- Information is accessible from main screen or settings
- Clear descriptions on relevant upgrades and actions

---

## 4. Requirements

### 4.1 Functional Requirements - Pet Tier System

**FR-1: Pet Tier State Management**
- Game state MUST track three separate pet counts:
  - `petCount` (AI Pets) - existing field
  - `bigPetCount` (Big AI Pets) - new field
  - `singularityPetCount` (Singularity Pets) - new field
- All counts MUST be non-negative integers
- All counts MUST persist across app sessions
- State MUST integrate with existing Legend State observable pattern

**FR-2: Pet Tier Display**
- Main screen MUST display all three pet counts clearly
- Format: "{count} AI Pets", "{count} Big AI Pets", "{count} Singularity Pets"
- Counts MUST update reactively when values change
- Visual hierarchy: Singularity Pets most prominent, AI Pets least prominent (or logical ordering)

**FR-3: Passive Singularity Progression for AI Pets**
- AI Pets MUST have a base singularity rate (e.g., 0.01% per second per pet)
- Each game tick MUST calculate if any AI Pets reach singularity
- Calculation MUST be probabilistic (random chance based on rate)
- When singularity occurs:
  - Decrease `petCount` by 1
  - Increase `singularityPetCount` by 1
  - Trigger visual/audio feedback (optional)

**FR-4: Passive Singularity Progression for Big AI Pets**
- Big AI Pets MUST have a higher singularity rate than AI Pets (e.g., 100x multiplier)
- Each game tick MUST calculate if any Big AI Pets reach singularity
- When singularity occurs:
  - Decrease `bigPetCount` by 1
  - Increase `singularityPetCount` by 1
  - Trigger visual/audio feedback (optional)

**FR-5: Offline Singularity Progression**
- When app reopens after being closed, MUST calculate time elapsed
- MUST apply singularity chances for all elapsed time
- Calculation SHOULD be bounded to prevent excessive processing (cap at 24 hours or similar)
- Results MUST be deterministic or pseudo-random (not exploitable by clock manipulation)

### 4.2 Functional Requirements - Feeding Effects

**FR-6: Feeding Accelerates Singularity**
- Each feed action MUST increase singularity progress
- Effect options:
  - **Option A:** Increase base singularity rate temporarily (e.g., 2x rate for 1 second per feed)
  - **Option B:** Add flat progress toward singularity (e.g., +0.1% per feed)
  - **Option C:** Increase chance in next singularity roll (one-time boost)
- Effect MUST be noticeable but balanced (not trivializing progression)
- Effect MUST apply to all AI Pets and Big AI Pets

**FR-7: Feeding Progress Persistence**
- If using temporary rate boosts, timer/effect MUST persist across app sessions
- If using cumulative progress, progress MUST be saved in game state
- Offline feeding (if implemented) MUST also apply singularity benefits

### 4.3 Functional Requirements - Upgrade Effects

**FR-8: Singularity Rate Upgrades**
- New upgrade type: `singularityRateMultiplier`
- Upgrades MUST have:
  - `effectType: 'singularityRateMultiplier'`
  - `effectValue: number` (e.g., 0.5 = +50% rate, 1.0 = +100% = 2x rate)
- Multiple upgrades MUST stack (multiplicative or additive)
- Upgrades MUST apply to both AI Pets and Big AI Pets

**FR-9: Upgrade Type System Extension**
- Extend existing `Upgrade` interface to support new effect types:
  - Existing: `'scrapMultiplier' | 'petBonus'`
  - New: `'singularityRateMultiplier'`
- Update type definitions in `/frontend/shared/types/game.ts`
- Ensure backward compatibility with existing upgrades

### 4.4 Functional Requirements - Pet Combination

**FR-10: Combine AI Pets to Big AI Pets**
- Game MUST provide an action/upgrade to combine pets
- Combination requires minimum number of AI Pets (e.g., 10, 50, or 100)
- Action MUST be disabled if player has insufficient AI Pets
- When executed:
  - Decrease `petCount` by combination cost
  - Increase `bigPetCount` by 1
  - Trigger confirmation dialog (optional, recommended for irreversible action)

**FR-11: Combination Cost Configuration**
- Combination cost SHOULD be configurable (not hardcoded)
- Consider: cost increases per Big Pet created (scaling cost)
- OR: cost is fixed (simpler for MVP)
- Cost MUST be clearly displayed before combination

**FR-12: Combination Availability**
- Combination action MUST be available from main screen or dedicated screen
- Button/action MUST show current cost and player's current AI Pet count
- Visual feedback MUST indicate if player can afford combination

### 4.5 Functional Requirements - Scrap Generation Tradeoff

**FR-13: Big AI Pet Scrap Rate**
- Big AI Pets MUST generate scrap at a different rate than AI Pets
- Recommended: Lower rate (e.g., 1 AI Pet = 1 scrap/second, 1 Big AI Pet = 5 scrap/second vs. 10 AI Pets = 10 scrap/second)
- Tradeoff: fewer scrap for higher singularity chance
- Rate MUST be clearly documented or displayed

**FR-14: Scrap Calculation with Multiple Tiers**
- Scrap generation MUST account for all pet types:
  - AI Pets: base rate (e.g., 1 scrap/second per pet)
  - Big AI Pets: modified rate (e.g., 0.5 scrap/second per pet)
  - Singularity Pets: rate TBD (could be 0, or bonus rate)
- Total scrap per second = (petCount × aiRate) + (bigPetCount × bigRate) + (singularityPetCount × singularityRate)
- Calculation MUST include all active scrap multiplier upgrades

### 4.6 Functional Requirements - Skills System

**FR-15: Skill State Management**
- Game state MUST track available skills:
  - `skills: Skill[]` - array of all possible skills
  - `unlockedSkills: string[]` - array of unlocked skill IDs
- Skill interface MUST include:
  - `id: string` - unique identifier
  - `name: string` - display name
  - `description: string` - what the skill does
  - `unlockRequirement: SkillRequirement` - conditions to unlock
  - `effectType: string` - type of visual/gameplay effect
- All fields MUST persist across app sessions

**FR-16: Skill Unlock Conditions**
- Skills MUST unlock automatically when conditions are met
- Unlock conditions MAY include:
  - Number of Singularity Pets (e.g., "Unlock Painting at 1 Singularity Pet")
  - Total pets achieved (combined across all tiers)
  - Specific upgrades purchased
  - Time-based (e.g., "After 1 hour with a Singularity Pet")
- System MUST check unlock conditions periodically (each game tick)
- When condition is met, add skill ID to `unlockedSkills` array

**FR-17: Painting Skill Implementation**
- Painting skill MUST create visual trails on the screen
- Trails MUST use various colors (random or predefined palette)
- Implementation options:
  - **Option A:** Continuous trail following touch/cursor
  - **Option B:** Trails appear on feed button taps
  - **Option C:** Trails appear randomly on screen over time
  - **Option D:** Trails follow animated pet sprite (if visual pet exists)
- Trails MUST fade out after a duration (e.g., 2-5 seconds)
- Trails MUST NOT impact performance (limit number of active trails)

**FR-18: Skill Toggle**
- Players MUST be able to enable/disable active skills
- Toggle MUST be accessible from main screen or settings
- Preference MUST persist across app sessions
- Disabling skill stops visual effects but retains unlock status

**FR-19: Skill UI Display**
- Game MUST provide a way to view all skills (learned and unlearned)
- Display location options:
  - Dedicated "Skills" screen (similar to Shop)
  - Section within main screen
  - Panel in settings/collection screen
- Each skill MUST show:
  - Name, description, unlock requirement
  - Lock status (locked/unlocked)
  - Active status (if unlocked and enabled)

### 4.7 Functional Requirements - Integration

**FR-20: Integration with Existing Systems**
- Singularity system MUST integrate with existing game state (`gameState$`)
- MUST use existing Legend State patterns for reactivity
- MUST use existing persistence layer (auto-save via onChange)
- MUST NOT break existing features (feeding, scrap generation, shop, upgrades)

**FR-21: Upgrade Shop Integration**
- Singularity-related upgrades MUST appear in existing shop
- New upgrade categories:
  - "Singularity Acceleration" or similar
  - "Pet Combination" (if combination requires an upgrade)
- Upgrades MUST follow existing purchase flow
- Effects MUST apply correctly when purchased

---

## 5. Success Metrics

### 5.1 Engagement Metrics

**SM-1: Progression Pacing**
- Average time to first Singularity Pet: 15-30 minutes of active play
- Average time to first Big AI Pet: 5-15 minutes of active play
- Players should feel progression is achievable but rewarding

**SM-2: Skill Engagement**
- First skill (Painting) unlocked by 90%+ of players who reach 1 Singularity Pet
- Skill toggle used by at least 20% of players (indicates intentional engagement)
- No more than 5% of players disable all skills (indicates effects are enjoyable)

**SM-3: Strategic Decision-Making**
- Players create Big AI Pets despite scrap tradeoff (indicates value perceived)
- Singularity rate upgrades are purchased (indicates players value progression)
- Mix of pet tiers maintained (not all players min-maxing one tier)

### 5.2 Technical Metrics

**SM-4: Performance**
- Singularity calculations < 5ms per game tick
- Painting skill effects maintain 60 FPS
- No memory leaks from trail animations
- Offline progression calculation < 100ms on app resume

**SM-5: Reliability**
- 100% accuracy in pet tier transitions (no lost pets)
- Zero bugs related to negative pet counts
- 100% persistence success rate for all singularity data
- Skill unlock conditions trigger correctly 100% of the time

**SM-6: Test Coverage**
- Minimum 90% code coverage for singularity module
- 100% coverage for tier transition logic
- All skill effects tested (visual regression testing)

---

## 6. Out of Scope

The following items are explicitly excluded from this initial implementation:

### 6.1 Additional Pet Tiers
1. **Mega AI Pets or higher tiers** - Only three tiers (AI, Big, Singularity) for MVP
2. **Pet evolution paths** - No branching evolution or multiple evolution options
3. **Pet variants** - No different "types" or "classes" of pets within a tier

### 6.2 Advanced Skills
4. **Skills beyond Painting** - Only Painting skill implemented initially
5. **Skill leveling/upgrades** - Skills are binary (unlocked or not), no levels
6. **Skill combinations** - Skills work independently, no synergy effects
7. **Active skill usage** - Skills are passive/automatic, no player-triggered abilities
8. **Skill customization** - No color selection, pattern selection, or skill parameters

### 6.3 Social/Competitive Features
9. **Leaderboards** - No comparison with other players
10. **Pet trading/gifting** - Single-player only
11. **Multiplayer skills** - No skills that interact with other players
12. **Pet naming** - Pets are not individually identified

### 6.4 Advanced Mechanics
13. **Individual pet tracking** - Pets are counted collectively, not tracked individually
14. **Pet happiness/needs** - No care mechanics beyond feeding
15. **Pet personalities** - All pets of same tier are identical
16. **Dynamic singularity rates** - Rates are fixed (not based on RNG seed or time of day)
17. **Achievements/badges** - No formal achievement system for singularity milestones
18. **Visual pet representation** - No animated pet sprites or avatars (beyond trails)

### 6.5 UI/UX Enhancements
19. **Tier transition animations** - Simple count updates, no elaborate animations
20. **Pet collection gallery** - No visual collection or history view
21. **Singularity progress visualization** - No detailed progress bars (MVP uses simple counters)
22. **Skill preview/demo** - No way to preview skills before unlocking

### 6.6 Technical Features
23. **Cloud sync** - Singularity data only stored locally
24. **Analytics tracking** - No telemetry for singularity events
25. **A/B testing framework** - Rates are fixed, not experimentally tuned
26. **Mod support** - No API for custom skills or tiers

---

## 7. Technical Requirements

### 7.1 Type Definitions

**TR-1: Extend GameState Interface**
Update `/frontend/shared/types/game.ts`:

```typescript
export interface GameState {
  petCount: number;              // AI Pets (existing)
  scrap: number;                 // Existing
  upgrades: Upgrade[];           // Existing
  purchasedUpgrades: string[];   // Existing

  // New singularity fields
  bigPetCount: number;           // Big AI Pets
  singularityPetCount: number;   // Singularity Pets
  skills: Skill[];               // Available skills
  unlockedSkills: string[];      // Unlocked skill IDs
  activeSkills: string[];        // Enabled skill IDs (for toggle)

  // Singularity progress tracking (optional, if using cumulative approach)
  singularityProgress?: number;  // 0-100 percentage or accumulated points
}
```

**TR-2: Define Skill Interface**
```typescript
export interface SkillRequirement {
  type: 'singularityPetCount' | 'totalPets' | 'upgrade' | 'time';
  value: number | string;        // Threshold or upgrade ID
}

export interface Skill {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // What the skill does
  unlockRequirement: SkillRequirement;
  effectType: 'visualTrail' | 'other';  // Extensible for future skills
  effectConfig?: Record<string, any>;   // Skill-specific parameters
}
```

**TR-3: Extend Upgrade Interface**
```typescript
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effectType: 'scrapMultiplier' | 'petBonus' | 'singularityRateMultiplier' | 'unlockCombination';
  effectValue: number;
  category?: 'scrapEfficiency' | 'petAcquisition' | 'singularityAcceleration' | 'petCombination';
}
```

### 7.2 State Management

**TR-4: Game State Initialization**
- Update `DEFAULT_GAME_STATE` to include new fields:
```typescript
export const DEFAULT_GAME_STATE: GameState = {
  petCount: 0,
  scrap: 0,
  upgrades: [],
  purchasedUpgrades: [],
  bigPetCount: 0,
  singularityPetCount: 0,
  skills: [],                    // Populated at runtime
  unlockedSkills: [],
  activeSkills: [],
  singularityProgress: 0,
};
```

**TR-5: Legend State Integration**
- Use existing `gameState$` observable for all singularity data
- Ensure all new fields are reactive (wrapped in observable)
- Use `observer()` wrapper on components displaying singularity data

**TR-6: Persistence**
- New fields MUST be included in `PersistedGameState`
- Update `isValidGameState` type guard to validate new fields
- Update `sanitizeGameState` to handle new fields (default to 0 or [])
- Maintain backward compatibility: old saves should load with default values for new fields

### 7.3 Singularity Calculation Logic

**TR-7: Singularity Rate Calculation**
```typescript
// Base rates (configurable constants)
const BASE_AI_PET_SINGULARITY_RATE = 0.0001;     // 0.01% per second
const BASE_BIG_PET_SINGULARITY_RATE = 0.01;      // 1% per second (100x multiplier)

// Calculate effective rate with upgrades
function getEffectiveSingularityRate(petType: 'ai' | 'big'): number {
  const baseRate = petType === 'ai' ? BASE_AI_PET_SINGULARITY_RATE : BASE_BIG_PET_SINGULARITY_RATE;
  const multiplierUpgrades = gameState$.purchasedUpgrades.get()
    .filter(id => {
      const upgrade = gameState$.upgrades.get().find(u => u.id === id);
      return upgrade?.effectType === 'singularityRateMultiplier';
    });

  const totalMultiplier = multiplierUpgrades.reduce((acc, id) => {
    const upgrade = gameState$.upgrades.get().find(u => u.id === id);
    return acc + (upgrade?.effectValue || 0);
  }, 1.0);

  return baseRate * totalMultiplier;
}
```

**TR-8: Singularity Tick Processing**
```typescript
function processSingularityTick(deltaTime: number): void {
  const aiPetRate = getEffectiveSingularityRate('ai');
  const bigPetRate = getEffectiveSingularityRate('big');

  const aiPetCount = gameState$.petCount.get();
  const bigPetCount = gameState$.bigPetCount.get();

  // Calculate probability per tick
  const aiPetChance = aiPetRate * deltaTime;
  const bigPetChance = bigPetRate * deltaTime;

  // Roll for each pet type (binomial distribution or simple loop)
  let aiPetsSingular = 0;
  let bigPetsSingular = 0;

  for (let i = 0; i < aiPetCount; i++) {
    if (Math.random() < aiPetChance) aiPetsSingular++;
  }

  for (let i = 0; i < bigPetCount; i++) {
    if (Math.random() < bigPetChance) bigPetsSingular++;
  }

  // Apply transitions
  if (aiPetsSingular > 0) {
    gameState$.petCount.set(aiPetCount - aiPetsSingular);
    gameState$.singularityPetCount.set(prev => prev + aiPetsSingular);
  }

  if (bigPetsSingular > 0) {
    gameState$.bigPetCount.set(bigPetCount - bigPetsSingular);
    gameState$.singularityPetCount.set(prev => prev + bigPetsSingular);
  }
}
```

**TR-9: Game Loop Integration**
- Singularity tick MUST be called from existing game loop
- Frequency: same as scrap generation tick (e.g., every 100ms or 1000ms)
- MUST pass accurate deltaTime for consistent rates
- MUST NOT cause performance degradation (profile with large pet counts)

### 7.4 Feeding Integration

**TR-10: Feeding Effect on Singularity**
```typescript
function onFeedButtonPress(): void {
  // Existing logic: increment petCount based on upgrades
  // ...existing code...

  // New: Apply singularity boost
  applySingularityBoost();
}

function applySingularityBoost(): void {
  // Option A: Temporary rate multiplier
  gameState$.singularityBoostEndTime.set(Date.now() + 1000); // 1 second boost

  // Option B: Flat progress increase
  gameState$.singularityProgress.set(prev => prev + 0.1);

  // Option C: Immediate chance roll
  const bonusChance = 0.01; // 1% chance per feed
  if (Math.random() < bonusChance) {
    // Instantly promote one random pet
    const roll = Math.random();
    if (roll < 0.5 && gameState$.petCount.get() > 0) {
      gameState$.petCount.set(prev => prev - 1);
      gameState$.singularityPetCount.set(prev => prev + 1);
    } else if (gameState$.bigPetCount.get() > 0) {
      gameState$.bigPetCount.set(prev => prev - 1);
      gameState$.singularityPetCount.set(prev => prev + 1);
    }
  }
}
```

### 7.5 Pet Combination Implementation

**TR-11: Combination Action**
```typescript
const COMBINE_COST = 10; // Number of AI Pets required

function combineAIPets(): void {
  const currentCount = gameState$.petCount.get();

  if (currentCount < COMBINE_COST) {
    // Show error or disable button
    return;
  }

  // Deduct AI Pets and add Big Pet
  gameState$.petCount.set(currentCount - COMBINE_COST);
  gameState$.bigPetCount.set(prev => prev + 1);

  // Optional: Show confirmation or success message
}
```

**TR-12: Combination UI**
- Add "Combine Pets" button to main screen or shop/upgrades screen
- Button MUST show: "Combine {COMBINE_COST} AI Pets → 1 Big AI Pet"
- Button MUST be disabled if `petCount < COMBINE_COST`
- Button styling: distinct from feed button (secondary action)

### 7.6 Scrap Calculation Update

**TR-13: Multi-Tier Scrap Generation**
```typescript
function calculateScrapPerSecond(): number {
  const aiPetCount = gameState$.petCount.get();
  const bigPetCount = gameState$.bigPetCount.get();
  const singularityPetCount = gameState$.singularityPetCount.get();

  const AI_PET_SCRAP_RATE = 1.0;       // 1 scrap/second per pet
  const BIG_PET_SCRAP_RATE = 0.5;      // 0.5 scrap/second per pet (50% rate)
  const SINGULARITY_PET_SCRAP_RATE = 0; // 0 scrap/second (or bonus rate)

  let baseScrap =
    (aiPetCount * AI_PET_SCRAP_RATE) +
    (bigPetCount * BIG_PET_SCRAP_RATE) +
    (singularityPetCount * SINGULARITY_PET_SCRAP_RATE);

  // Apply scrap multiplier upgrades (existing logic)
  const multiplier = getScrapMultiplier();

  return baseScrap * multiplier;
}
```

### 7.7 Skills System Implementation

**TR-14: Skill Initialization**
```typescript
const INITIAL_SKILLS: Skill[] = [
  {
    id: 'painting',
    name: 'Painting',
    description: 'Leaves a trail of various colors on the screen',
    unlockRequirement: {
      type: 'singularityPetCount',
      value: 1
    },
    effectType: 'visualTrail',
    effectConfig: {
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
      fadeDuration: 3000, // 3 seconds
      maxTrails: 50       // Limit for performance
    }
  }
  // Future skills added here
];

// On game initialization
gameState$.skills.set(INITIAL_SKILLS);
```

**TR-15: Skill Unlock Check**
```typescript
function checkSkillUnlocks(): void {
  const skills = gameState$.skills.get();
  const unlockedSkills = gameState$.unlockedSkills.get();

  skills.forEach(skill => {
    if (unlockedSkills.includes(skill.id)) return; // Already unlocked

    const isUnlocked = checkSkillRequirement(skill.unlockRequirement);

    if (isUnlocked) {
      gameState$.unlockedSkills.set([...unlockedSkills, skill.id]);
      gameState$.activeSkills.set(prev => [...prev, skill.id]); // Auto-enable
      // Optional: Show notification
    }
  });
}

function checkSkillRequirement(req: SkillRequirement): boolean {
  switch (req.type) {
    case 'singularityPetCount':
      return gameState$.singularityPetCount.get() >= (req.value as number);
    case 'totalPets':
      const total = gameState$.petCount.get() +
                    gameState$.bigPetCount.get() +
                    gameState$.singularityPetCount.get();
      return total >= (req.value as number);
    case 'upgrade':
      return gameState$.purchasedUpgrades.get().includes(req.value as string);
    default:
      return false;
  }
}

// Call checkSkillUnlocks in game loop or after relevant state changes
```

**TR-16: Painting Skill Rendering**
```typescript
interface TrailPoint {
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

const [trails, setTrails] = useState<TrailPoint[]>([]);

// On feed button press or continuous animation
function addPaintingTrail(x: number, y: number): void {
  const isPaintingActive = gameState$.activeSkills.get().includes('painting');
  if (!isPaintingActive) return;

  const paintingSkill = gameState$.skills.get().find(s => s.id === 'painting');
  const colors = paintingSkill?.effectConfig?.colors || ['#FF6B6B'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newTrail: TrailPoint = {
    x,
    y,
    color: randomColor,
    timestamp: Date.now()
  };

  setTrails(prev => {
    const maxTrails = paintingSkill?.effectConfig?.maxTrails || 50;
    const updated = [...prev, newTrail].slice(-maxTrails); // Keep only last N trails
    return updated;
  });
}

// Cleanup old trails
useEffect(() => {
  const interval = setInterval(() => {
    const fadeDuration = gameState$.skills.get().find(s => s.id === 'painting')?.effectConfig?.fadeDuration || 3000;
    const now = Date.now();

    setTrails(prev => prev.filter(trail => now - trail.timestamp < fadeDuration));
  }, 100);

  return () => clearInterval(interval);
}, []);

// Render trails
{trails.map((trail, index) => (
  <View
    key={index}
    style={{
      position: 'absolute',
      left: trail.x,
      top: trail.y,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: trail.color,
      opacity: 1 - (Date.now() - trail.timestamp) / fadeDuration, // Fade over time
    }}
  />
))}
```

### 7.8 UI/UX Implementation

**TR-17: Main Screen Updates**
```tsx
// Update AttackButtonScreen.tsx to display all pet counts
<View style={styles.petCountsContainer}>
  <Text style={styles.petCountLabel}>AI Pets: {gameState$.petCount.get()}</Text>
  <Text style={styles.petCountLabel}>Big AI Pets: {gameState$.bigPetCount.get()}</Text>
  <Text style={styles.petCountLabel}>Singularity Pets: {gameState$.singularityPetCount.get()}</Text>
</View>

{/* Combine button */}
<Pressable
  style={[styles.combineButton, canCombine ? {} : styles.disabledButton]}
  onPress={combineAIPets}
  disabled={!canCombine}
>
  <Text style={styles.buttonText}>
    Combine {COMBINE_COST} AI Pets → 1 Big AI Pet
  </Text>
</Pressable>
```

**TR-18: Skills Screen (Optional)**
```tsx
// Create SkillsScreen.tsx component
export const SkillsScreen = observer(() => {
  const skills = gameState$.skills.get();
  const unlockedSkills = gameState$.unlockedSkills.get();
  const activeSkills = gameState$.activeSkills.get();

  const toggleSkill = (skillId: string) => {
    if (activeSkills.includes(skillId)) {
      gameState$.activeSkills.set(activeSkills.filter(id => id !== skillId));
    } else {
      gameState$.activeSkills.set([...activeSkills, skillId]);
    }
  };

  return (
    <ScrollView>
      {skills.map(skill => (
        <View key={skill.id} style={styles.skillCard}>
          <Text style={styles.skillName}>{skill.name}</Text>
          <Text style={styles.skillDescription}>{skill.description}</Text>

          {unlockedSkills.includes(skill.id) ? (
            <Switch
              value={activeSkills.includes(skill.id)}
              onValueChange={() => toggleSkill(skill.id)}
            />
          ) : (
            <Text style={styles.lockedText}>
              Locked: Requires {formatRequirement(skill.unlockRequirement)}
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
});
```

### 7.9 Testing Requirements

**TR-19: Unit Tests**
- Test singularity rate calculations
- Test tier transition logic (pet count decrements/increments)
- Test skill unlock condition checking
- Test pet combination logic
- Test scrap generation with multiple tiers
- Test feeding effect on singularity

**TR-20: Integration Tests**
- Test full progression flow: AI Pet → Big AI Pet → Singularity Pet
- Test singularity with upgrades applied
- Test skill unlock after reaching threshold
- Test persistence of all new fields
- Test offline progression calculation
- Test painting skill rendering (no crashes)

**TR-21: Performance Tests**
- Benchmark singularity tick with 1000+ pets
- Benchmark painting trail rendering with max trails
- Profile memory usage over extended gameplay
- Test frame rate stability with active skills

**TR-22: Test Environment**
- Run tests using cmd.exe (per project guidelines)
- Use Jest with React Native Testing Library
- Mock Legend State observables
- Mock Date.now() and Math.random() for deterministic tests

---

## 8. Design Specifications

### 8.1 Main Screen Layout Updates

```
┌─────────────────────────────────────┐
│                                     │
│      AI Pet Count: 123              │ ← Existing, smaller font
│      Big AI Pet Count: 5            │ ← New, medium font
│      Singularity Pet Count: 2       │ ← New, larger/highlighted font
│                                     │
│      Scrap: 4,567                   │ ← Existing
│                                     │
│      ┌─────────────────────────┐   │
│      │        [Feed]           │   │ ← Existing feed button
│      └─────────────────────────┘   │
│                                     │
│      ┌─────────────────────────┐   │
│      │  Combine 10 AI Pets →   │   │ ← New combination button
│      │     1 Big AI Pet        │   │
│      └─────────────────────────┘   │
│                                     │
│      [Shop]  [Skills]               │ ← Navigation buttons
│                                     │
│  {Painting trail visual effects}    │ ← Canvas for trails
│                                     │
└─────────────────────────────────────┘
```

### 8.2 Typography

**Pet Count Labels:**
- AI Pets: 16px, regular (400), #666666
- Big AI Pets: 18px, medium (500), #333333
- Singularity Pets: 22px, bold (600), #007AFF (accent color)

**Buttons:**
- Feed button: 18px, medium (500), #FFFFFF
- Combine button: 16px, regular (400), #FFFFFF

### 8.3 Color Palette

**Pet Tier Colors:**
- AI Pets: #666666 (gray)
- Big AI Pets: #FF9500 (orange)
- Singularity Pets: #007AFF (blue) or #AF52DE (purple)

**Skill Colors (Painting):**
- Trail palette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
- Random selection per trail point

**Buttons:**
- Combine button background: #FF9500 (orange)
- Combine button disabled: #CCCCCC (gray)

### 8.4 Animations

**Tier Transition (Optional MVP):**
- Simple count increment/decrement (no elaborate animation)
- Possible: brief highlight flash on changing counter

**Painting Trails:**
- Opacity: 1.0 → 0.0 over 3 seconds (linear fade)
- Size: 10px diameter circles
- Position: fixed at tap/generation point (no movement)
- Spawn: on feed button tap OR continuous at 10 trails/second

**Combination Button:**
- Press effect: scale 0.98, opacity 0.7
- Disabled: opacity 0.6, no press effect

---

## 9. User Flow Diagrams

### 9.1 Pet Progression Flow

```
Start: Player has 0 pets
  ↓
[Feed Button] → Gain AI Pets (petCount++)
  ↓
Accumulate AI Pets (e.g., 10+)
  ↓
[Combine Button] → Convert 10 AI Pets → 1 Big AI Pet
  ↓
Big AI Pets have higher singularity chance
  ↓
[Time passes / Feed more] → Big AI Pet reaches singularity
  ↓
Big AI Pet → Singularity Pet (bigPetCount--, singularityPetCount++)
  ↓
Singularity Pet unlocks skills
  ↓
[Painting skill activated] → Visual trails appear
  ↓
Continue progression (accumulate more Singularity Pets, unlock more skills)
```

### 9.2 Singularity Acceleration Flow

```
Player wants faster singularity progression
  ↓
Option 1: [Feed Button] → Temporary boost to singularity rate
Option 2: [Purchase Upgrade] → Permanent boost to singularity rate
Option 3: [Create Big AI Pets] → Higher base singularity rate
  ↓
Combine multiple approaches
  ↓
Singularity Pets accumulate faster
  ↓
More skills unlock, more visual effects
```

---

## 10. Open Questions and Decisions

**Q-1:** Should singularity progression be purely time-based or include a cumulative progress system?
**Decision:** Hybrid approach: time-based random rolls with feeding providing bonus chances or rate multipliers. Keeps progression unpredictable but influenced by player actions.

**Q-2:** What should be the exact combination cost for Big AI Pets?
**Decision:** Start with 10 AI Pets = 1 Big AI Pet for MVP. Can adjust based on playtesting. Consider scaling cost (10, 20, 40, ...) in future.

**Q-3:** Should Big AI Pets generate less scrap than the equivalent AI Pets?
**Decision:** Yes. Tradeoff: 1 Big AI Pet = 0.5 scrap/sec vs. 10 AI Pets = 10 scrap/sec. Makes combination a strategic choice (sacrifice scrap for singularity chance).

**Q-4:** How many Singularity Pets should be required to unlock Painting skill?
**Decision:** 1 Singularity Pet. First skill should be immediately rewarding. Future skills can require more.

**Q-5:** Should painting trails appear continuously or only on specific actions (feed taps)?
**Decision:** On feed button taps for MVP. Creates direct player feedback and limits performance impact. Can add continuous mode later.

**Q-6:** Should players be able to disable skills individually or all at once?
**Decision:** Individually. Provides granular control. Add "toggle all" option if multiple skills exist.

**Q-7:** What happens to scrap generation when all pets become Singularity Pets?
**Decision:** Singularity Pets generate 0 scrap (or minimal scrap). Creates late-game challenge: need to balance Singularity Pet accumulation with maintaining scrap income from lower tiers.

**Q-8:** Should there be a confirmation dialog when combining pets?
**Decision:** Yes (recommended). Combination is irreversible and affects scrap generation. Simple "Combine {cost} AI Pets into 1 Big AI Pet?" confirmation.

**Q-9:** How should offline singularity progression work?
**Decision:** Calculate time elapsed (capped at 24 hours) and apply singularity chances accordingly. Use deterministic seeded random for fairness. No exploitation of clock changes.

**Q-10:** Should singularity rate be displayed to players?
**Decision:** Not directly (too technical). Instead, provide qualitative descriptions in tooltips: "Big AI Pets reach singularity much faster than AI Pets."

---

## 11. Risks and Mitigations

### 11.1 Game Balance Risks

**RISK-001: Singularity too fast**
- **Risk:** Players reach singularity too quickly, trivializing progression
- **Mitigation:** Tune rates conservatively, gather playtest data, iterate
- **Likelihood:** Medium
- **Impact:** High (reduces long-term engagement)

**RISK-002: Singularity too slow**
- **Risk:** Players never reach singularity or feel progression is too grindy
- **Mitigation:** Start with faster rates, provide clear upgrades to accelerate
- **Likelihood:** Medium
- **Impact:** High (frustration, player churn)

**RISK-003: Scrap tradeoff too punishing**
- **Risk:** Players avoid creating Big AI Pets because scrap loss is too high
- **Mitigation:** Balance rates carefully, ensure singularity benefits outweigh scrap cost
- **Likelihood:** Medium
- **Impact:** Medium (feature underutilized)

**RISK-004: Combination cost too high/low**
- **Risk:** Cost doesn't match player progression curve
- **Mitigation:** Make cost configurable, adjust based on playtesting
- **Likelihood:** Low
- **Impact:** Medium

### 11.2 Technical Risks

**RISK-005: Performance degradation with many pets**
- **Risk:** Singularity calculations slow with 10,000+ pets
- **Mitigation:** Use optimized algorithms (binomial distribution instead of loop), profile regularly
- **Likelihood:** Low (pet counts unlikely to reach 10,000+)
- **Impact:** High (unplayable)

**RISK-006: Painting trails cause lag**
- **Risk:** Too many trails degrade frame rate
- **Mitigation:** Limit max trails (50), use efficient rendering, fade quickly
- **Likelihood:** Low
- **Impact:** Medium

**RISK-007: Race conditions in tier transitions**
- **Risk:** Simultaneous transitions corrupt pet counts (negative values)
- **Mitigation:** Use atomic state updates, validate counts, add sanity checks
- **Likelihood:** Low (Legend State handles reactivity safely)
- **Impact:** High (data corruption)

**RISK-008: Offline progression exploits**
- **Risk:** Players manipulate device clock to gain progression
- **Mitigation:** Cap offline time (24 hours), use server time if available, accept some exploitation
- **Likelihood:** Medium
- **Impact:** Low (single-player game, limited impact)

### 11.3 User Experience Risks

**RISK-009: Unclear mechanics**
- **Risk:** Players don't understand how singularity works
- **Mitigation:** Provide tooltips, help section, clear descriptions on upgrades
- **Likelihood:** High (complex system)
- **Impact:** Medium (confusion, underutilization)

**RISK-010: Skill effects too subtle**
- **Risk:** Painting trails not noticeable or satisfying
- **Mitigation:** Use vibrant colors, ensure trails are visible, playtest for impact
- **Likelihood:** Low
- **Impact:** Medium (skill feels unrewarding)

**RISK-011: Accidental combinations**
- **Risk:** Players accidentally combine pets without understanding consequences
- **Mitigation:** Require confirmation dialog, clearly state scrap tradeoff
- **Likelihood:** Medium
- **Impact:** Low (players learn, but initial frustration)

---

## 12. Future Enhancements

### 12.1 Additional Pet Tiers (Post-MVP)
- **Mega AI Pets:** Combine multiple Big AI Pets
- **Transcendent Pets:** Ultimate tier beyond Singularity
- **Tier-specific bonuses:** Unique effects per tier (not just scrap/singularity rates)

### 12.2 Additional Skills
- **Dancing:** Animated pet sprites that dance on screen
- **Music:** Procedural music generation or sound effects
- **Weather:** Visual weather effects (rain, snow, particles)
- **Cloning:** Chance to duplicate pets when feeding
- **Alchemy:** Convert resources (scrap → pets or vice versa)

### 12.3 Skill Progression
- **Skill levels:** Upgrade skills to enhance effects (brighter trails, more colors)
- **Skill synergy:** Combine multiple skills for bonus effects
- **Skill customization:** Choose colors, patterns, behaviors

### 12.4 Advanced Mechanics
- **Pet personalities:** Individual pets with unique traits
- **Prestige system:** Reset progress for permanent bonuses
- **Events:** Limited-time singularity rate boosts or special skills
- **Pet battles:** Use Singularity Pets in mini-games

### 12.5 Social Features
- **Leaderboards:** Compare singularity pet counts
- **Pet sharing:** Gift pets to friends
- **Collaborative skills:** Multiplayer painting canvas

### 12.6 Analytics & Tuning
- **A/B testing:** Test different singularity rates, costs, effects
- **Telemetry:** Track player progression, identify bottlenecks
- **Dynamic balancing:** Adjust rates based on player population data

---

## 13. Acceptance Criteria

### 13.1 Feature Completion Checklist

**Must Have:**
- [ ] Game state tracks `bigPetCount` and `singularityPetCount`
- [ ] Main screen displays all three pet tier counts
- [ ] AI Pets passively progress toward singularity over time
- [ ] Big AI Pets passively progress toward singularity (at higher rate)
- [ ] Feeding accelerates singularity progression
- [ ] Singularity rate upgrades can be purchased and applied
- [ ] Pet combination action converts AI Pets to Big AI Pets
- [ ] Combination requires minimum pet count (e.g., 10)
- [ ] Combination is disabled when insufficient pets
- [ ] Big AI Pets generate less scrap than equivalent AI Pets
- [ ] Total scrap calculation includes all pet tiers
- [ ] Skills system tracks available and unlocked skills
- [ ] Painting skill unlocks at 1 Singularity Pet
- [ ] Painting skill creates visual trails when active
- [ ] Trails fade out after duration (3 seconds)
- [ ] Skills can be toggled on/off individually
- [ ] All new state persists across app restarts
- [ ] Component tests achieve 90%+ coverage
- [ ] All tests pass in cmd.exe environment
- [ ] No performance degradation with typical pet counts (<1000)

**Should Have:**
- [ ] Confirmation dialog for pet combination
- [ ] Visual distinction between pet tier counts (colors, sizes)
- [ ] Painting trails use multiple colors
- [ ] Skills UI shows unlock requirements for locked skills
- [ ] Offline progression calculated on app resume
- [ ] Tooltips explain singularity mechanics

**Nice to Have:**
- [ ] Visual effect when pet reaches singularity (flash, animation)
- [ ] Notification when new skill unlocks
- [ ] Skills screen with detailed skill information
- [ ] Progress indicator showing singularity progress

---

## 14. Implementation Plan

### 14.1 Development Phases

**Phase 1: Core State & Types (Priority: High)**
- Extend GameState interface with new fields
- Create Skill interface and SkillRequirement type
- Extend Upgrade interface for new effect types
- Update DEFAULT_GAME_STATE and validation functions
- Update persistence layer to handle new fields

**Phase 2: Pet Tier System (Priority: High)**
- Implement singularity rate calculation functions
- Integrate singularity tick into game loop
- Add tier transition logic (decrement/increment counts)
- Update main screen UI to display all pet counts
- Test tier transitions thoroughly

**Phase 3: Pet Combination (Priority: High)**
- Implement combination logic and validation
- Add "Combine Pets" button to UI
- Add confirmation dialog
- Update scrap generation to account for Big AI Pets
- Test combination flow and scrap calculations

**Phase 4: Feeding & Upgrades Integration (Priority: High)**
- Add singularity boost to feed button handler
- Create singularity rate multiplier upgrades
- Add upgrades to shop (if shop exists, otherwise seed in state)
- Test feeding effect and upgrade application

**Phase 5: Skills System (Priority: Medium)**
- Initialize skills array with Painting skill
- Implement skill unlock checking
- Add skill state management (unlocked, active)
- Create skills UI (screen or section)
- Test skill unlock conditions

**Phase 6: Painting Skill Effect (Priority: Medium)**
- Implement trail rendering system
- Add trail generation on feed taps
- Implement fade-out animation
- Optimize for performance (limit trails, efficient rendering)
- Test on device for visual quality and frame rate

**Phase 7: Offline Progression (Priority: Medium)**
- Implement offline time calculation
- Apply singularity chances for elapsed time
- Cap offline time (24 hours)
- Test with various offline durations

**Phase 8: Testing & Polish (Priority: High)**
- Write comprehensive unit tests for all new logic
- Write integration tests for full flows
- Performance testing with large pet counts
- Accessibility improvements (labels, hints)
- Bug fixes and edge case handling

**Phase 9: Balancing & Tuning (Priority: Low)**
- Playtest with real users
- Adjust singularity rates based on feedback
- Tune combination cost and scrap rates
- Refine skill unlock thresholds
- Iterate on visual effects

**Phase 10: Documentation (Priority: Low)**
- Add JSDoc comments to functions
- Document singularity mechanics for players (help section)
- Update project documentation
- Create developer guide for adding new tiers/skills

### 14.2 Testing Strategy

**Unit Tests:**
- Singularity rate calculation with various upgrade combinations
- Tier transition logic (count decrements/increments correctly)
- Pet combination validation and execution
- Skill unlock condition checking
- Scrap generation with multiple pet tiers
- Feeding singularity boost application

**Integration Tests:**
- Full progression: 0 pets → AI Pets → Big AI Pets → Singularity Pets
- Purchase singularity upgrades and verify rate increase
- Combine pets and verify scrap rate changes
- Unlock skill and verify trail rendering
- Offline progression: close app, advance clock, verify results
- Persistence: restart app, verify all singularity data restored

**Performance Tests:**
- Singularity tick with 1000 AI Pets + 100 Big AI Pets
- Painting trail rendering with 50 active trails
- Memory usage over 1 hour of gameplay
- Frame rate stability with skills active

**Manual Tests:**
- Visual verification of all UI elements
- Accessibility testing (screen reader compatibility)
- Playtest for fun factor and progression pacing
- Test on multiple devices (iOS, Android if applicable)
- Confirm tooltips and descriptions are clear

---

## 15. Appendix

### 15.1 Glossary

- **AI Pet:** Base tier pet, gained by feeding, generates scrap at base rate
- **Big AI Pet:** Second tier pet, created by combining AI Pets, higher singularity chance, lower scrap rate
- **Singularity Pet:** Third tier pet, result of AI or Big Pet reaching singularity, unlocks skills
- **Singularity:** Process by which pets evolve to higher tier
- **Singularity Rate:** Probability per second that a pet reaches singularity
- **Skill:** Special ability unlocked by Singularity Pets, provides visual or gameplay effects
- **Painting:** First skill, creates colorful visual trails on screen
- **Combination:** Action of merging multiple AI Pets into one Big AI Pet
- **Tier Transition:** Event when a pet moves from one tier to another (e.g., AI → Singularity)

### 15.2 Related Documents

- Feature Descriptions:
  - `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/specs/feature-singularity.md`
  - `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/specs/feature-big-pet.md`
  - `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/specs/feature-skills.md`
- Game State Types: `/mnt/c/dev/class-one-rapids/frontend/shared/types/game.ts`
- Game Store: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`
- Persistence: `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.ts`
- Main Screen: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`
- Shop PRD: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/specs/prd_shop_20251117.md`

### 15.3 Formulas Reference

**Singularity Probability per Tick:**
```
P(singularity) = baseSingularityRate × deltaTime × (1 + Σ upgradeMultipliers)

Where:
- baseSingularityRate: 0.0001 for AI Pets, 0.01 for Big AI Pets
- deltaTime: seconds since last tick (e.g., 1.0 for 1 second)
- upgradeMultipliers: sum of all singularityRateMultiplier upgrade values
```

**Expected Time to Singularity:**
```
E[time] = 1 / (baseSingularityRate × (1 + Σ upgradeMultipliers))

Example:
- AI Pet with no upgrades: 1 / 0.0001 = 10,000 seconds ≈ 2.78 hours
- AI Pet with 2x upgrade: 1 / 0.0002 = 5,000 seconds ≈ 1.39 hours
- Big AI Pet with no upgrades: 1 / 0.01 = 100 seconds ≈ 1.67 minutes
```

**Scrap per Second (Multi-Tier):**
```
scrapPerSecond = (aiPetCount × 1.0 + bigPetCount × 0.5 + singularityPetCount × 0) × (1 + Σ scrapMultipliers)

Example:
- 100 AI Pets, 10 Big AI Pets, 2 Singularity Pets, no multipliers:
  (100 × 1.0 + 10 × 0.5 + 2 × 0) × 1.0 = 105 scrap/second
```

**Combination Economics:**
```
Scrap loss per combination = (combinationCost × aiPetScrapRate) - bigPetScrapRate

Example (10 AI Pets → 1 Big AI Pet):
- Before: 10 AI Pets = 10 scrap/second
- After: 1 Big AI Pet = 0.5 scrap/second
- Loss: 10 - 0.5 = 9.5 scrap/second per combination
```

### 15.4 Configuration Constants

**Recommended Initial Values:**
```typescript
// Singularity rates (per second)
const BASE_AI_PET_SINGULARITY_RATE = 0.0001;      // ~2.78 hours average
const BASE_BIG_PET_SINGULARITY_RATE = 0.01;       // ~1.67 minutes average

// Scrap rates (per second per pet)
const AI_PET_SCRAP_RATE = 1.0;
const BIG_PET_SCRAP_RATE = 0.5;
const SINGULARITY_PET_SCRAP_RATE = 0;             // Or 0.1 for bonus

// Combination
const COMBINE_AI_PETS_COST = 10;                  // AI Pets required

// Feeding boost
const FEEDING_SINGULARITY_BOOST_DURATION = 1000;  // 1 second
const FEEDING_SINGULARITY_BOOST_MULTIPLIER = 2.0; // 2x rate while boosted

// Skills
const PAINTING_UNLOCK_THRESHOLD = 1;              // Singularity Pets required
const PAINTING_TRAIL_FADE_DURATION = 3000;        // 3 seconds
const PAINTING_MAX_TRAILS = 50;                   // Performance limit

// Offline progression
const MAX_OFFLINE_TIME = 24 * 60 * 60 * 1000;     // 24 hours in milliseconds
```

### 15.5 Revision History

| Version | Date       | Author  | Changes                                      |
|---------|------------|---------|----------------------------------------------|
| 1.0     | 2025-11-17 | Claude  | Initial PRD creation for Singularity System  |

---

**Document Status:** Final - Ready for Review
**Next Steps:**
1. Review and approve PRD with stakeholders
2. Create Technical Design Document (TDD) for detailed implementation
3. Generate task list for phased development
4. Begin Phase 1: Core State & Types implementation
