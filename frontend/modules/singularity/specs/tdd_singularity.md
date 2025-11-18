# Technical Design Document: Singularity System

**Version:** 1.0
**Date:** 2025-11-17
**Feature:** Singularity Progression System
**Module:** `/frontend/modules/singularity`
**Related PRD:** `prd_singularity.md`

---

## 1. Executive Summary

This Technical Design Document (TDD) provides a comprehensive implementation blueprint for the Singularity System feature. The Singularity System introduces multi-tiered pet progression (AI Pets → Big AI Pets → Singularity Pets), pet combination mechanics, and a skill system with visual effects. This document translates the product requirements into concrete technical specifications, component designs, data structures, and implementation guidelines using Test-Driven Development (TDD) methodology.

### 1.1 Goals

- Design a scalable, extensible multi-tier pet progression system
- Integrate seamlessly with existing Legend State reactive patterns
- Implement passive singularity progression with probabilistic mechanics
- Create a skill system framework supporting visual effects (starting with Painting)
- Provide clear component specifications for TDD implementation
- Ensure testability, maintainability, and code quality
- Support future extensibility for additional tiers and skills

### 1.2 Non-Goals

- Offline mode implementation (per CLAUDE.md)
- Analytics or telemetry systems
- Pet naming or individual pet tracking
- Multiplayer or social features
- Advanced animations or particle systems (MVP uses simple trails)
- Cloud sync (local persistence only)

---

## 2. Architecture Overview

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              AttackButtonScreen.tsx                    │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │  - Pet count displays (AI, Big, Singularity)    │  │ │
│  │  │  - Feed button (triggers singularity boost)     │  │ │
│  │  │  - Combine button (AI → Big conversion)         │  │ │
│  │  │  - Painting trail canvas                        │  │ │
│  │  │  - Skills button (navigate to skills screen)    │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
│                         │                                   │
│         ┌───────────────┴───────────────┐                  │
│         │                               │                  │
│  ┌──────▼──────┐                 ┌──────▼──────┐          │
│  │   Skills    │                 │    Shop     │          │
│  │   Screen    │                 │   Screen    │          │
│  │  (new)      │                 │  (existing) │          │
│  └──────┬──────┘                 └──────┬──────┘          │
│         │                               │                  │
└─────────┼───────────────────────────────┼──────────────────┘
          │                               │
          └───────────┬───────────────────┘
                      │
          ┌───────────▼────────────────────────────────┐
          │      gameState$ (Legend State)             │
          │  ┌──────────────────────────────────────┐  │
          │  │ Core (existing):                     │  │
          │  │   petCount: number                   │  │
          │  │   scrap: number                      │  │
          │  │   upgrades: Upgrade[]                │  │
          │  │   purchasedUpgrades: string[]        │  │
          │  │                                       │  │
          │  │ Singularity (new):                   │  │
          │  │   bigPetCount: number                │  │
          │  │   singularityPetCount: number        │  │
          │  │   skills: Skill[]                    │  │
          │  │   unlockedSkills: string[]           │  │
          │  │   activeSkills: string[]             │  │
          │  └──────────────────────────────────────┘  │
          │                                            │
          │  Game Loop (new):                          │
          │    - Singularity tick processor            │
          │    - Skill unlock checker                  │
          │                                            │
          │  Auto-persistence (existing):              │
          │    - Debounced save (1s)                   │
          │    - AsyncStorage                          │
          └────────────────────────────────────────────┘
```

### 2.2 Component Hierarchy

```
App
└── SafeAreaProvider
    ├── AttackButtonScreen
    │   ├── PetCountsDisplay (new)
    │   │   ├── AI Pet Count
    │   │   ├── Big AI Pet Count
    │   │   └── Singularity Pet Count
    │   │
    │   ├── ScrapDisplay (existing)
    │   │
    │   ├── FeedButton (existing, enhanced)
    │   │   └── Triggers singularity boost
    │   │
    │   ├── CombineButton (new)
    │   │   ├── Shows cost and current count
    │   │   └── Confirmation dialog
    │   │
    │   ├── NavigationButtons (existing)
    │   │   ├── Shop Button
    │   │   └── Skills Button (new)
    │   │
    │   └── PaintingCanvas (new)
    │       └── TrailPoint[] (when painting active)
    │
    ├── SkillsScreen (new)
    │   ├── SkillsHeader
    │   │   └── Back Button
    │   │
    │   └── SkillsList
    │       └── SkillCard[]
    │           ├── Skill Info (name, description)
    │           ├── Unlock Requirements
    │           ├── Lock Status Indicator
    │           └── Toggle Switch (if unlocked)
    │
    └── ShopScreen (existing)
        └── Singularity upgrades (new)
```

### 2.3 Data Flow

```
User Action: Feed Button Press
       │
       ▼
handleFeed()
       │
       ├─► Add pets (existing logic)
       │   └─► petCount += (1 + petBonus)
       │
       └─► Apply singularity boost (new)
           └─► Immediate singularity chance roll
               └─► May trigger AI Pet → Singularity Pet


Game Loop Tick (1000ms interval)
       │
       ├─► Scrap Generation (existing)
       │   └─► scrap += calculateScrapPerSecond()
       │
       ├─► Singularity Progression (new)
       │   ├─► Calculate AI Pet singularity chances
       │   ├─► Calculate Big Pet singularity chances
       │   ├─► Apply tier transitions
       │   └─► Update pet counts
       │
       └─► Skill Unlock Check (new)
           ├─► Check each locked skill's requirements
           ├─► Unlock skills when conditions met
           └─► Auto-enable newly unlocked skills


User Action: Combine Pets
       │
       ▼
handleCombinePets()
       │
       ├─► Validation
       │   ├─► Check petCount >= COMBINE_COST
       │   └─► Show confirmation dialog
       │
       └─► Execute Combination
           ├─► petCount -= COMBINE_COST
           ├─► bigPetCount += 1
           └─► Reactive update → UI re-renders
```

---

## 3. Data Models and Type Definitions

### 3.1 Extended GameState Interface

**File:** `/frontend/shared/types/game.ts`

**Additions to existing GameState:**

```typescript
export interface GameState {
  // Existing fields
  petCount: number;              // AI Pets (existing)
  scrap: number;                 // Existing
  upgrades: Upgrade[];           // Existing
  purchasedUpgrades: string[];   // Existing

  // New singularity fields
  bigPetCount: number;           // Big AI Pets
  singularityPetCount: number;   // Singularity Pets
  skills: Skill[];               // Available skills (populated at runtime)
  unlockedSkills: string[];      // IDs of unlocked skills
  activeSkills: string[];        // IDs of enabled skills (for toggle)
}
```

**Updated DEFAULT_GAME_STATE:**

```typescript
export const DEFAULT_GAME_STATE: GameState = {
  petCount: 0,
  scrap: 0,
  upgrades: [],
  purchasedUpgrades: [],

  // New defaults
  bigPetCount: 0,
  singularityPetCount: 0,
  skills: [],
  unlockedSkills: [],
  activeSkills: [],
};
```

**Updated isValidGameState type guard:**

```typescript
export function isValidGameState(state: unknown): state is GameState {
  if (!state || typeof state !== 'object') {
    return false;
  }

  const s = state as Record<string, unknown>;

  return (
    // Existing validations
    typeof s.petCount === 'number' &&
    typeof s.scrap === 'number' &&
    Array.isArray(s.upgrades) &&
    Array.isArray(s.purchasedUpgrades) &&
    s.purchasedUpgrades.every((id) => typeof id === 'string') &&

    // New validations
    typeof s.bigPetCount === 'number' &&
    typeof s.singularityPetCount === 'number' &&
    Array.isArray(s.skills) &&
    Array.isArray(s.unlockedSkills) &&
    Array.isArray(s.activeSkills) &&
    s.unlockedSkills.every((id) => typeof id === 'string') &&
    s.activeSkills.every((id) => typeof id === 'string')
  );
}
```

**Updated sanitizeGameState:**

```typescript
export function sanitizeGameState(state: GameState): GameState {
  return {
    petCount: Math.max(
      0,
      Math.min(state.petCount, Number.MAX_SAFE_INTEGER)
    ),
    scrap: Math.max(0, Math.min(state.scrap, Number.MAX_SAFE_INTEGER)),
    upgrades: state.upgrades || [],
    purchasedUpgrades: state.purchasedUpgrades || [],

    // New sanitizations
    bigPetCount: Math.max(
      0,
      Math.min(state.bigPetCount || 0, Number.MAX_SAFE_INTEGER)
    ),
    singularityPetCount: Math.max(
      0,
      Math.min(state.singularityPetCount || 0, Number.MAX_SAFE_INTEGER)
    ),
    skills: state.skills || [],
    unlockedSkills: state.unlockedSkills || [],
    activeSkills: state.activeSkills || [],
  };
}
```

### 3.2 Skill System Types

**File:** `/frontend/shared/types/game.ts`

```typescript
/**
 * Requirement type for unlocking a skill.
 */
export type SkillRequirementType =
  | 'singularityPetCount'  // Requires N singularity pets
  | 'totalPets'            // Requires N total pets across all tiers
  | 'upgrade'              // Requires specific upgrade purchased
  | 'time';                // Requires time elapsed with singularity pets

/**
 * Skill unlock requirement specification.
 */
export interface SkillRequirement {
  /** Type of requirement to check */
  type: SkillRequirementType;
  /**
   * Threshold value or upgrade ID:
   * - For numeric types: minimum count required
   * - For 'upgrade' type: upgrade ID string
   */
  value: number | string;
}

/**
 * Visual effect type for a skill.
 */
export type SkillEffectType =
  | 'visualTrail'   // Painting-style trails
  | 'other';        // Extensible for future effects

/**
 * Skill configuration and metadata.
 */
export interface Skill {
  /** Unique identifier */
  id: string;
  /** Display name shown to player */
  name: string;
  /** Description of what the skill does */
  description: string;
  /** Conditions required to unlock this skill */
  unlockRequirement: SkillRequirement;
  /** Type of visual/gameplay effect */
  effectType: SkillEffectType;
  /** Skill-specific configuration parameters */
  effectConfig?: {
    colors?: string[];        // Color palette for visual effects
    fadeDuration?: number;    // Fade time in milliseconds
    maxTrails?: number;       // Performance limit for trails
    [key: string]: any;       // Extensible for future configs
  };
}
```

### 3.3 Extended Upgrade Interface

**File:** `/frontend/shared/types/game.ts`

```typescript
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;  // Renamed from scrapCost for consistency

  /**
   * Type of effect this upgrade provides.
   * Extended with singularity types.
   */
  effectType:
    | 'scrapMultiplier'           // Existing: increases scrap generation
    | 'petBonus'                  // Existing: bonus pets per feed
    | 'singularityRateMultiplier' // New: increases singularity rate
    | 'unlockCombination';        // New: unlocks pet combination feature

  /**
   * Numeric value of the effect:
   * - For scrapMultiplier: decimal multiplier (0.1 = 10%)
   * - For petBonus: flat integer bonus (1 = +1 pet)
   * - For singularityRateMultiplier: multiplier (0.5 = +50%, 1.0 = 2x)
   * - For unlockCombination: unused (boolean unlock)
   */
  effectValue: number;

  /** Optional category for organizing upgrades */
  category?:
    | 'scrapEfficiency'
    | 'petAcquisition'
    | 'singularityAcceleration'  // New category
    | 'petCombination';          // New category
}
```

### 3.4 Component Props Types

```typescript
// AttackButtonScreen (updated)
interface AttackButtonScreenProps {
  onNavigateToShop: () => void;
  onNavigateToSkills: () => void;  // New
}

// SkillsScreen (new)
interface SkillsScreenProps {
  onNavigateBack: () => void;
}

// SkillCard (new subcomponent)
interface SkillCardProps {
  skill: Skill;
  isUnlocked: boolean;
  isActive: boolean;
  onToggle: (skillId: string) => void;
}

// PaintingCanvas (new component)
interface PaintingCanvasProps {
  isActive: boolean;
}

// TrailPoint (internal type)
interface TrailPoint {
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

// CombineConfirmationDialog (new component)
interface CombineConfirmationDialogProps {
  visible: boolean;
  cost: number;
  currentCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}
```

---

## 4. State Management Design

### 4.1 State Initialization

**File:** `/frontend/shared/store/gameStore.ts`

**Add singularity fields to gameState$ observable:**

```typescript
export const gameState$ = observable<GameState>({
  petCount: 0,
  scrap: 0,
  upgrades: [],
  purchasedUpgrades: [],

  // New singularity fields
  bigPetCount: 0,
  singularityPetCount: 0,
  skills: [],
  unlockedSkills: [],
  activeSkills: [],
});
```

**Add skill definitions (similar to upgrade definitions):**

**File:** `/frontend/modules/singularity/skillDefinitions.ts` (new)

```typescript
import { Skill } from '../../shared/types/game';

/**
 * All available skills in the game.
 * MVP includes only the Painting skill.
 */
export const SKILLS: Skill[] = [
  {
    id: 'painting',
    name: 'Painting',
    description: 'Your Singularity Pet leaves a trail of various colors on the screen when you feed it.',
    unlockRequirement: {
      type: 'singularityPetCount',
      value: 1,
    },
    effectType: 'visualTrail',
    effectConfig: {
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
      fadeDuration: 3000,  // 3 seconds
      maxTrails: 50,       // Performance limit
    },
  },
  // Future skills added here
];

/**
 * Retrieves a skill by its unique ID.
 */
export function getSkillById(id: string): Skill | undefined {
  return SKILLS.find(s => s.id === id);
}
```

**Update initializeGameState to populate skills:**

```typescript
export async function initializeGameState(): Promise<void> {
  try {
    const savedState = await loadGameState();

    if (savedState) {
      gameState$.set({
        ...gameState$.get(),
        ...savedState,
      });
    }

    // Populate upgrades array if empty (existing)
    if (gameState$.upgrades.get().length === 0) {
      gameState$.upgrades.set(UPGRADES);
    }

    // Populate skills array if empty (new)
    if (gameState$.skills.get().length === 0) {
      gameState$.skills.set(SKILLS);
    }
  } catch (error) {
    console.error('Error initializing game state:', error);

    // Ensure upgrades and skills are populated for playable state
    if (gameState$.upgrades.get().length === 0) {
      gameState$.upgrades.set(UPGRADES);
    }
    if (gameState$.skills.get().length === 0) {
      gameState$.skills.set(SKILLS);
    }
  }
}
```

### 4.2 Computed Observables

**File:** `/frontend/shared/store/gameStore.ts`

**Add singularity rate multiplier computed:**

```typescript
/**
 * Computed observable that calculates the total singularity rate multiplier.
 * Sums up all singularityRateMultiplier effectValues from purchased upgrades.
 *
 * @returns The total multiplier (0.5 = +50%, 1.0 = 2x base rate)
 */
export const totalSingularityRateMultiplier$ = computed(() => {
  const purchased = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  return upgrades
    .filter(u => purchased.includes(u.id) && u.effectType === 'singularityRateMultiplier')
    .reduce((sum, u) => sum + u.effectValue, 0);
});

/**
 * Computed observable that checks if pet combination is unlocked.
 * Returns true if any 'unlockCombination' upgrade is purchased.
 */
export const isCombinationUnlocked$ = computed(() => {
  const purchased = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  return upgrades.some(
    u => purchased.includes(u.id) && u.effectType === 'unlockCombination'
  );
});

/**
 * Computed observable that calculates total pets across all tiers.
 */
export const totalPets$ = computed(() => {
  const aiPets = gameState$.petCount.get();
  const bigPets = gameState$.bigPetCount.get();
  const singularityPets = gameState$.singularityPetCount.get();

  return aiPets + bigPets + singularityPets;
});
```

### 4.3 Updated Scrap Calculation

**Modify existing scrap generation to account for multiple tiers:**

```typescript
/**
 * Calculates scrap per second based on all pet tiers and multipliers.
 *
 * Base rates:
 * - AI Pets: 1 scrap/second per pet
 * - Big AI Pets: 0.5 scrap/second per pet (50% rate penalty)
 * - Singularity Pets: 0 scrap/second (no scrap generation)
 *
 * @returns Total scrap per second after applying multipliers
 */
export function calculateScrapPerSecond(): number {
  const aiPetCount = gameState$.petCount.get();
  const bigPetCount = gameState$.bigPetCount.get();
  const singularityPetCount = gameState$.singularityPetCount.get();

  const AI_PET_SCRAP_RATE = 1.0;
  const BIG_PET_SCRAP_RATE = 0.5;
  const SINGULARITY_PET_SCRAP_RATE = 0;

  const baseScrap =
    (aiPetCount * AI_PET_SCRAP_RATE) +
    (bigPetCount * BIG_PET_SCRAP_RATE) +
    (singularityPetCount * SINGULARITY_PET_SCRAP_RATE);

  const multiplier = 1 + totalScrapMultiplier$.get();

  return baseScrap * multiplier;
}
```

### 4.4 Hook Extensions

**File:** `/frontend/shared/hooks/useGameState.ts`

```typescript
export function useGameState() {
  return {
    // Existing
    petCount$: gameState$.petCount,
    scrap$: gameState$.scrap,
    upgrades$: gameState$.upgrades,
    purchasedUpgrades$: gameState$.purchasedUpgrades,

    // New singularity fields
    bigPetCount$: gameState$.bigPetCount,
    singularityPetCount$: gameState$.singularityPetCount,
    skills$: gameState$.skills,
    unlockedSkills$: gameState$.unlockedSkills,
    activeSkills$: gameState$.activeSkills,
  };
}
```

---

## 5. Core Singularity Logic

### 5.1 Constants and Configuration

**File:** `/frontend/modules/singularity/singularityConfig.ts` (new)

```typescript
/**
 * Configuration constants for singularity system.
 * Adjust these values to tune game balance.
 */
export const SINGULARITY_CONFIG = {
  // Singularity rates (probability per second per pet)
  BASE_AI_PET_SINGULARITY_RATE: 0.0001,     // 0.01% per second (~2.78 hours average)
  BASE_BIG_PET_SINGULARITY_RATE: 0.01,      // 1% per second (~1.67 minutes average)

  // Scrap generation rates (per second per pet)
  AI_PET_SCRAP_RATE: 1.0,
  BIG_PET_SCRAP_RATE: 0.5,
  SINGULARITY_PET_SCRAP_RATE: 0,

  // Pet combination
  COMBINE_COST: 10,  // Number of AI Pets required for 1 Big Pet

  // Feeding boost
  FEEDING_SINGULARITY_BOOST_CHANCE: 0.01,   // 1% chance per feed to trigger instant singularity

  // Skill unlock thresholds
  PAINTING_UNLOCK_THRESHOLD: 1,  // Singularity pets required

  // Visual effect limits
  PAINTING_TRAIL_FADE_DURATION: 3000,  // 3 seconds in milliseconds
  PAINTING_MAX_TRAILS: 50,             // Maximum active trails

  // Game loop timing
  GAME_TICK_INTERVAL: 1000,  // 1 second in milliseconds
} as const;
```

### 5.2 Singularity Rate Calculation

**File:** `/frontend/modules/singularity/singularityEngine.ts` (new)

```typescript
import { gameState$, totalSingularityRateMultiplier$ } from '../../shared/store/gameStore';
import { SINGULARITY_CONFIG } from './singularityConfig';

/**
 * Calculates the effective singularity rate for a pet type.
 * Applies upgrade multipliers to base rate.
 *
 * @param petType - Type of pet ('ai' or 'big')
 * @returns Effective singularity rate (probability per second)
 */
export function getEffectiveSingularityRate(petType: 'ai' | 'big'): number {
  const baseRate = petType === 'ai'
    ? SINGULARITY_CONFIG.BASE_AI_PET_SINGULARITY_RATE
    : SINGULARITY_CONFIG.BASE_BIG_PET_SINGULARITY_RATE;

  const multiplier = 1 + totalSingularityRateMultiplier$.get();

  return baseRate * multiplier;
}

/**
 * Processes singularity progression for a single game tick.
 * Rolls probabilistic checks for each pet type and applies transitions.
 *
 * @param deltaTime - Time elapsed since last tick in seconds
 */
export function processSingularityTick(deltaTime: number): void {
  const aiPetRate = getEffectiveSingularityRate('ai');
  const bigPetRate = getEffectiveSingularityRate('big');

  const aiPetCount = gameState$.petCount.get();
  const bigPetCount = gameState$.bigPetCount.get();

  // Calculate probability for this tick
  const aiPetChance = aiPetRate * deltaTime;
  const bigPetChance = bigPetRate * deltaTime;

  // Count pets that reach singularity this tick
  let aiPetsTransitioned = 0;
  let bigPetsTransitioned = 0;

  // Roll for each AI Pet
  for (let i = 0; i < aiPetCount; i++) {
    if (Math.random() < aiPetChance) {
      aiPetsTransitioned++;
    }
  }

  // Roll for each Big Pet
  for (let i = 0; i < bigPetCount; i++) {
    if (Math.random() < bigPetChance) {
      bigPetsTransitioned++;
    }
  }

  // Apply transitions atomically
  if (aiPetsTransitioned > 0) {
    gameState$.petCount.set(prev => prev - aiPetsTransitioned);
    gameState$.singularityPetCount.set(prev => prev + aiPetsTransitioned);
  }

  if (bigPetsTransitioned > 0) {
    gameState$.bigPetCount.set(prev => prev - bigPetsTransitioned);
    gameState$.singularityPetCount.set(prev => prev + bigPetsTransitioned);
  }
}

/**
 * Applies an immediate singularity boost from feeding.
 * Has a small chance to instantly promote a random pet to singularity.
 */
export function applySingularityBoostFromFeeding(): void {
  const boostChance = SINGULARITY_CONFIG.FEEDING_SINGULARITY_BOOST_CHANCE;

  if (Math.random() < boostChance) {
    const aiPetCount = gameState$.petCount.get();
    const bigPetCount = gameState$.bigPetCount.get();

    // Randomly choose between AI and Big pets (if both exist)
    const targetAI = Math.random() < 0.5;

    if (targetAI && aiPetCount > 0) {
      // Promote one AI Pet to Singularity
      gameState$.petCount.set(prev => prev - 1);
      gameState$.singularityPetCount.set(prev => prev + 1);
    } else if (bigPetCount > 0) {
      // Promote one Big Pet to Singularity
      gameState$.bigPetCount.set(prev => prev - 1);
      gameState$.singularityPetCount.set(prev => prev + 1);
    }
  }
}
```

### 5.3 Pet Combination Logic

**File:** `/frontend/modules/singularity/combinationLogic.ts` (new)

```typescript
import { gameState$ } from '../../shared/store/gameStore';
import { SINGULARITY_CONFIG } from './singularityConfig';

/**
 * Checks if player can combine AI Pets into a Big Pet.
 *
 * @returns True if player has enough AI Pets
 */
export function canCombinePets(): boolean {
  const aiPetCount = gameState$.petCount.get();
  return aiPetCount >= SINGULARITY_CONFIG.COMBINE_COST;
}

/**
 * Combines AI Pets into a Big AI Pet.
 * Deducts COMBINE_COST AI Pets and adds 1 Big Pet.
 *
 * @throws Error if insufficient AI Pets
 */
export function combinePets(): void {
  const currentCount = gameState$.petCount.get();

  if (currentCount < SINGULARITY_CONFIG.COMBINE_COST) {
    throw new Error(
      `Insufficient AI Pets. Need ${SINGULARITY_CONFIG.COMBINE_COST}, have ${currentCount}`
    );
  }

  // Atomic update
  gameState$.petCount.set(prev => prev - SINGULARITY_CONFIG.COMBINE_COST);
  gameState$.bigPetCount.set(prev => prev + 1);
}

/**
 * Gets the current combine cost.
 *
 * @returns Number of AI Pets required to create 1 Big Pet
 */
export function getCombineCost(): number {
  return SINGULARITY_CONFIG.COMBINE_COST;
}
```

### 5.4 Skill Unlock Logic

**File:** `/frontend/modules/singularity/skillEngine.ts` (new)

```typescript
import { gameState$, totalPets$ } from '../../shared/store/gameStore';
import { Skill, SkillRequirement } from '../../shared/types/game';

/**
 * Checks if a skill requirement is satisfied.
 *
 * @param requirement - The requirement to check
 * @returns True if requirement is met
 */
export function checkSkillRequirement(requirement: SkillRequirement): boolean {
  switch (requirement.type) {
    case 'singularityPetCount':
      return gameState$.singularityPetCount.get() >= (requirement.value as number);

    case 'totalPets':
      return totalPets$.get() >= (requirement.value as number);

    case 'upgrade':
      return gameState$.purchasedUpgrades.get().includes(requirement.value as string);

    case 'time':
      // TODO: Implement time-based tracking if needed in future
      console.warn('Time-based skill requirements not yet implemented');
      return false;

    default:
      console.warn('Unknown skill requirement type:', requirement);
      return false;
  }
}

/**
 * Checks all locked skills and unlocks any that meet requirements.
 * Automatically enables newly unlocked skills.
 */
export function checkAndUnlockSkills(): void {
  const skills = gameState$.skills.get();
  const unlockedSkills = gameState$.unlockedSkills.get();

  skills.forEach(skill => {
    // Skip if already unlocked
    if (unlockedSkills.includes(skill.id)) {
      return;
    }

    // Check if requirement is now met
    if (checkSkillRequirement(skill.unlockRequirement)) {
      // Unlock skill
      gameState$.unlockedSkills.set(prev => [...prev, skill.id]);

      // Auto-enable skill
      gameState$.activeSkills.set(prev => [...prev, skill.id]);

      console.log(`Skill unlocked: ${skill.name}`);
    }
  });
}

/**
 * Toggles a skill's active state.
 *
 * @param skillId - ID of skill to toggle
 */
export function toggleSkill(skillId: string): void {
  const activeSkills = gameState$.activeSkills.get();

  if (activeSkills.includes(skillId)) {
    // Disable skill
    gameState$.activeSkills.set(prev => prev.filter(id => id !== skillId));
  } else {
    // Enable skill (only if unlocked)
    const unlockedSkills = gameState$.unlockedSkills.get();
    if (unlockedSkills.includes(skillId)) {
      gameState$.activeSkills.set(prev => [...prev, skillId]);
    }
  }
}

/**
 * Checks if a skill is unlocked.
 *
 * @param skillId - ID of skill to check
 * @returns True if skill is unlocked
 */
export function isSkillUnlocked(skillId: string): boolean {
  return gameState$.unlockedSkills.get().includes(skillId);
}

/**
 * Checks if a skill is active.
 *
 * @param skillId - ID of skill to check
 * @returns True if skill is active
 */
export function isSkillActive(skillId: string): boolean {
  return gameState$.activeSkills.get().includes(skillId);
}
```

---

## 6. Component Design

### 6.1 AttackButtonScreen Updates

**File:** `/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Add game loop integration:**

```typescript
import { processSingularityTick } from '../singularity/singularityEngine';
import { checkAndUnlockSkills } from '../singularity/skillEngine';
import { calculateScrapPerSecond } from '../../shared/store/gameStore';

/**
 * Game loop effect that runs scrap generation, singularity progression,
 * and skill unlock checks.
 */
useEffect(() => {
  const interval = setInterval(() => {
    // Scrap generation (updated to use multi-tier calculation)
    const scrapGenerated = calculateScrapPerSecond();
    if (scrapGenerated > 0) {
      scrap$.set(prev => prev + scrapGenerated);
    }

    // Singularity progression
    processSingularityTick(1.0);  // 1 second delta

    // Skill unlock checks
    checkAndUnlockSkills();
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

**Update feed handler:**

```typescript
import { applySingularityBoostFromFeeding } from '../singularity/singularityEngine';

const handleFeed = () => {
  // Existing: Add pets with bonus
  const bonus = totalPetBonus$.get();
  const petsToAdd = 1 + bonus;
  petCount$.set(prev => prev + petsToAdd);

  // New: Apply singularity boost
  applySingularityBoostFromFeeding();
};
```

**Add pet counts display:**

```typescript
// In JSX, replace single counter with tier breakdown
<View style={styles.petCountsContainer}>
  <Text style={styles.aiPetCount}>
    AI Pets: {petCount$.get()}
  </Text>
  <Text style={styles.bigPetCount}>
    Big AI Pets: {bigPetCount$.get()}
  </Text>
  <Text style={styles.singularityPetCount}>
    Singularity Pets: {singularityPetCount$.get()}
  </Text>
</View>
```

**Add combine button:**

```typescript
import { canCombinePets, combinePets, getCombineCost } from '../singularity/combinationLogic';

const [showCombineDialog, setShowCombineDialog] = useState(false);

const handleCombinePress = () => {
  if (canCombinePets()) {
    setShowCombineDialog(true);
  }
};

const handleCombineConfirm = () => {
  try {
    combinePets();
    setShowCombineDialog(false);
  } catch (error) {
    console.error('Combination failed:', error);
  }
};

// In JSX
<Pressable
  onPress={handleCombinePress}
  disabled={!canCombinePets()}
  style={({ pressed }) => [
    styles.combineButton,
    !canCombinePets() && styles.combineButtonDisabled,
    pressed && styles.buttonPressed,
  ]}
>
  <Text style={styles.combineButtonText}>
    Combine {getCombineCost()} AI Pets → 1 Big AI Pet
  </Text>
</Pressable>

<CombineConfirmationDialog
  visible={showCombineDialog}
  cost={getCombineCost()}
  currentCount={petCount$.get()}
  onConfirm={handleCombineConfirm}
  onCancel={() => setShowCombineDialog(false)}
/>
```

**Add styles:**

```typescript
const styles = StyleSheet.create({
  // ... existing styles

  petCountsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  aiPetCount: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  bigPetCount: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FF9500',
    marginBottom: 4,
  },
  singularityPetCount: {
    fontSize: 22,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  combineButton: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF9500',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  combineButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  combineButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
});
```

### 6.2 CombineConfirmationDialog Component

**File:** `/frontend/modules/singularity/components/CombineConfirmationDialog.tsx` (new)

```typescript
import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';

interface CombineConfirmationDialogProps {
  visible: boolean;
  cost: number;
  currentCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CombineConfirmationDialog: React.FC<CombineConfirmationDialogProps> = ({
  visible,
  cost,
  currentCount,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Combine Pets?</Text>

          <Text style={styles.message}>
            Convert {cost} AI Pets into 1 Big AI Pet?
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              • Big Pets generate less scrap ({cost} AI = {cost} scrap/s, 1 Big = 0.5 scrap/s)
            </Text>
            <Text style={styles.infoText}>
              • Big Pets reach singularity 100x faster
            </Text>
          </View>

          <View style={styles.currentCount}>
            <Text style={styles.currentCountText}>
              You have {currentCount} AI Pets
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>
                Combine
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 20,
  },
  currentCount: {
    marginBottom: 20,
  },
  currentCountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E5E5',
  },
  confirmButton: {
    backgroundColor: '#FF9500',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#666666',
  },
});
```

### 6.3 PaintingCanvas Component

**File:** `/frontend/modules/singularity/components/PaintingCanvas.tsx` (new)

```typescript
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { observer } from '@legendapp/state/react';
import { gameState$ } from '../../../shared/store/gameStore';

interface TrailPoint {
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

interface PaintingCanvasProps {
  isActive: boolean;
}

/**
 * PaintingCanvas renders visual trails when the Painting skill is active.
 * Trails appear at feed button taps and fade out over time.
 */
export const PaintingCanvas = observer(({ isActive }: PaintingCanvasProps) => {
  const [trails, setTrails] = useState<TrailPoint[]>([]);

  // Expose method to add trail (called from parent on feed)
  React.useImperativeHandle(ref, () => ({
    addTrail: (x: number, y: number) => {
      if (!isActive) return;

      const paintingSkill = gameState$.skills.get().find(s => s.id === 'painting');
      if (!paintingSkill) return;

      const colors = paintingSkill.effectConfig?.colors || ['#FF6B6B'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const maxTrails = paintingSkill.effectConfig?.maxTrails || 50;

      const newTrail: TrailPoint = {
        x,
        y,
        color: randomColor,
        timestamp: Date.now(),
      };

      setTrails(prev => {
        const updated = [...prev, newTrail];
        // Keep only last N trails
        return updated.slice(-maxTrails);
      });
    },
  }));

  // Clean up old trails periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const paintingSkill = gameState$.skills.get().find(s => s.id === 'painting');
      const fadeDuration = paintingSkill?.effectConfig?.fadeDuration || 3000;
      const now = Date.now();

      setTrails(prev => prev.filter(trail => now - trail.timestamp < fadeDuration));
    }, 100);

    return () => clearInterval(cleanupInterval);
  }, []);

  if (!isActive) {
    return null;
  }

  const paintingSkill = gameState$.skills.get().find(s => s.id === 'painting');
  const fadeDuration = paintingSkill?.effectConfig?.fadeDuration || 3000;

  return (
    <View style={styles.canvas} pointerEvents="none">
      {trails.map((trail, index) => {
        const now = Date.now();
        const age = now - trail.timestamp;
        const opacity = Math.max(0, 1 - age / fadeDuration);

        return (
          <View
            key={`${trail.timestamp}-${index}`}
            style={[
              styles.trail,
              {
                left: trail.x,
                top: trail.y,
                backgroundColor: trail.color,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  trail: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
```

**Note:** For simplicity, we'll add trails on feed button press by passing coordinates. Alternative: use `onLayout` to get button position.

### 6.4 SkillsScreen Component

**File:** `/frontend/modules/singularity/SkillsScreen.tsx` (new)

```typescript
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { useGameState } from '../../shared/hooks/useGameState';
import { toggleSkill, isSkillUnlocked, isSkillActive } from './skillEngine';
import { Skill, SkillRequirement } from '../../shared/types/game';

interface SkillsScreenProps {
  onNavigateBack: () => void;
}

export const SkillsScreen = observer(({ onNavigateBack }: SkillsScreenProps) => {
  const { skills$, unlockedSkills$, activeSkills$ } = useGameState();

  const skills = skills$.get();
  const unlockedSkills = unlockedSkills$.get();
  const activeSkills = activeSkills$.get();

  /**
   * Formats a skill requirement for display.
   */
  const formatRequirement = (req: SkillRequirement): string => {
    switch (req.type) {
      case 'singularityPetCount':
        return `${req.value} Singularity Pet${req.value === 1 ? '' : 's'}`;
      case 'totalPets':
        return `${req.value} Total Pets`;
      case 'upgrade':
        return `Specific upgrade required`;
      case 'time':
        return `Time requirement`;
      default:
        return 'Unknown requirement';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={onNavigateBack}
          accessibilityRole="button"
          accessibilityLabel="Back to main screen"
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Skills</Text>

        {/* Spacer for centering title */}
        <View style={styles.headerSpacer} />
      </View>

      {/* Skills List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {skills.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No skills available yet.</Text>
            <Text style={styles.emptyStateSubtitle}>
              Reach singularity to unlock skills!
            </Text>
          </View>
        ) : (
          skills.map(skill => (
            <SkillCard
              key={skill.id}
              skill={skill}
              isUnlocked={unlockedSkills.includes(skill.id)}
              isActive={activeSkills.includes(skill.id)}
              onToggle={() => toggleSkill(skill.id)}
              formatRequirement={formatRequirement}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

/**
 * SkillCard displays individual skill with lock/unlock state and toggle.
 */
interface SkillCardProps {
  skill: Skill;
  isUnlocked: boolean;
  isActive: boolean;
  onToggle: () => void;
  formatRequirement: (req: SkillRequirement) => string;
}

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isUnlocked,
  isActive,
  onToggle,
  formatRequirement,
}) => {
  return (
    <View style={[styles.card, !isUnlocked && styles.cardLocked]}>
      {/* Skill Name */}
      <Text style={styles.skillName}>{skill.name}</Text>

      {/* Description */}
      <Text style={styles.skillDescription}>{skill.description}</Text>

      {/* Unlock Requirement or Toggle */}
      {isUnlocked ? (
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
          <Switch
            value={isActive}
            onValueChange={onToggle}
            accessibilityLabel={`Toggle ${skill.name}`}
            accessibilityHint={`Currently ${isActive ? 'active' : 'inactive'}`}
          />
        </View>
      ) : (
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedIcon}>🔒</Text>
          <Text style={styles.lockedText}>
            Requires: {formatRequirement(skill.unlockRequirement)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardLocked: {
    opacity: 0.7,
  },
  skillName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  skillDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  lockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  lockedText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
  },
});
```

### 6.5 App.tsx Navigation Updates

**File:** `/frontend/App.tsx`

```typescript
import { SkillsScreen } from './modules/singularity/SkillsScreen';

type Screen = 'main' | 'shop' | 'skills';

const [currentScreen, setCurrentScreen] = useState<Screen>('main');

// In return statement
return (
  <SafeAreaProvider>
    {currentScreen === 'main' && (
      <AttackButtonScreen
        onNavigateToShop={() => setCurrentScreen('shop')}
        onNavigateToSkills={() => setCurrentScreen('skills')}
      />
    )}
    {currentScreen === 'shop' && (
      <ShopScreen onNavigateBack={() => setCurrentScreen('main')} />
    )}
    {currentScreen === 'skills' && (
      <SkillsScreen onNavigateBack={() => setCurrentScreen('main')} />
    )}
  </SafeAreaProvider>
);
```

**Update AttackButtonScreen to add Skills button:**

```typescript
<Pressable
  onPress={onNavigateToSkills}
  accessibilityRole="button"
  accessibilityLabel="Skills"
  accessibilityHint="Tap to view and manage skills"
  style={({ pressed }) => [
    styles.skillsButton,
    pressed && styles.buttonPressed,
  ]}
>
  <Text style={styles.skillsButtonText}>Skills</Text>
</Pressable>
```

---

## 7. Upgrade System Integration

### 7.1 New Singularity Upgrades

**File:** `/frontend/modules/shop/upgradeDefinitions.ts`

**Add to UPGRADES array:**

```typescript
// Singularity rate upgrades
{
  id: 'singularity-boost-1',
  name: 'Singularity Accelerator I',
  description: 'Pets reach singularity 50% faster.',
  cost: 500,
  effectType: 'singularityRateMultiplier',
  effectValue: 0.5,  // +50% rate
  category: 'singularityAcceleration',
},
{
  id: 'singularity-boost-2',
  name: 'Singularity Accelerator II',
  description: 'Pets reach singularity 100% faster (2x base rate).',
  cost: 2000,
  effectType: 'singularityRateMultiplier',
  effectValue: 1.0,  // +100% = 2x total
  category: 'singularityAcceleration',
},
{
  id: 'singularity-boost-3',
  name: 'Singularity Accelerator III',
  description: 'Pets reach singularity 200% faster (3x base rate).',
  cost: 10000,
  effectType: 'singularityRateMultiplier',
  effectValue: 2.0,  // +200% = 3x total
  category: 'singularityAcceleration',
},

// Pet combination unlock (optional: could be unlocked by default)
{
  id: 'unlock-combination',
  name: 'Pet Fusion Technique',
  description: 'Unlocks the ability to combine AI Pets into Big AI Pets.',
  cost: 300,
  effectType: 'unlockCombination',
  effectValue: 1,  // Unused (boolean unlock)
  category: 'petCombination',
},
```

### 7.2 ShopScreen Display Logic

**Update UpgradeCard to handle new effect types:**

```typescript
const getEffectLabel = (upgrade: Upgrade): string => {
  switch (upgrade.effectType) {
    case 'scrapMultiplier':
      return `Scrap Multiplier +${(upgrade.effectValue * 100).toFixed(0)}%`;
    case 'petBonus':
      return `Pet Bonus +${upgrade.effectValue}`;
    case 'singularityRateMultiplier':
      return `Singularity Rate +${(upgrade.effectValue * 100).toFixed(0)}%`;
    case 'unlockCombination':
      return `Unlocks Pet Combination`;
    default:
      return 'Unknown Effect';
  }
};
```

---

## 8. Testing Strategy

### 8.1 Unit Tests Structure

**File:** `/frontend/modules/singularity/singularityEngine.test.ts` (new)

```typescript
import { gameState$, totalSingularityRateMultiplier$ } from '../../shared/store/gameStore';
import {
  getEffectiveSingularityRate,
  processSingularityTick,
  applySingularityBoostFromFeeding,
} from './singularityEngine';

describe('singularityEngine', () => {
  beforeEach(() => {
    // Reset state
    gameState$.set({
      petCount: 0,
      scrap: 0,
      upgrades: [],
      purchasedUpgrades: [],
      bigPetCount: 0,
      singularityPetCount: 0,
      skills: [],
      unlockedSkills: [],
      activeSkills: [],
    });
  });

  describe('getEffectiveSingularityRate', () => {
    it('should return base rate with no upgrades', () => {
      const aiRate = getEffectiveSingularityRate('ai');
      expect(aiRate).toBe(0.0001);

      const bigRate = getEffectiveSingularityRate('big');
      expect(bigRate).toBe(0.01);
    });

    it('should apply multiplier from upgrades', () => {
      // Mock upgrade purchased
      gameState$.upgrades.set([{
        id: 'test-boost',
        name: 'Test',
        description: 'Test',
        cost: 100,
        effectType: 'singularityRateMultiplier',
        effectValue: 0.5,
      }]);
      gameState$.purchasedUpgrades.set(['test-boost']);

      const aiRate = getEffectiveSingularityRate('ai');
      expect(aiRate).toBe(0.0001 * 1.5);  // Base * (1 + 0.5)
    });
  });

  describe('processSingularityTick', () => {
    it('should not transition pets when probability fails', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99);  // Always fail

      gameState$.petCount.set(10);
      processSingularityTick(1.0);

      expect(gameState$.petCount.get()).toBe(10);
      expect(gameState$.singularityPetCount.get()).toBe(0);
    });

    it('should transition AI Pet to Singularity when probability succeeds', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.00001);  // Always succeed

      gameState$.petCount.set(5);
      processSingularityTick(1.0);

      expect(gameState$.petCount.get()).toBeLessThan(5);
      expect(gameState$.singularityPetCount.get()).toBeGreaterThan(0);
    });

    it('should transition Big Pet to Singularity', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.001);  // Succeed for Big Pets

      gameState$.bigPetCount.set(3);
      processSingularityTick(1.0);

      expect(gameState$.bigPetCount.get()).toBeLessThan(3);
      expect(gameState$.singularityPetCount.get()).toBeGreaterThan(0);
    });
  });

  describe('applySingularityBoostFromFeeding', () => {
    it('should sometimes trigger instant singularity from AI Pets', () => {
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.001)  // Trigger boost
        .mockReturnValueOnce(0.4);   // Target AI pet

      gameState$.petCount.set(10);
      applySingularityBoostFromFeeding();

      expect(gameState$.petCount.get()).toBe(9);
      expect(gameState$.singularityPetCount.get()).toBe(1);
    });

    it('should not trigger when random check fails', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99);  // Fail boost check

      gameState$.petCount.set(10);
      applySingularityBoostFromFeeding();

      expect(gameState$.petCount.get()).toBe(10);
      expect(gameState$.singularityPetCount.get()).toBe(0);
    });
  });
});
```

**File:** `/frontend/modules/singularity/combinationLogic.test.ts` (new)

```typescript
import { gameState$ } from '../../shared/store/gameStore';
import { canCombinePets, combinePets, getCombineCost } from './combinationLogic';

describe('combinationLogic', () => {
  beforeEach(() => {
    gameState$.set({
      petCount: 0,
      scrap: 0,
      upgrades: [],
      purchasedUpgrades: [],
      bigPetCount: 0,
      singularityPetCount: 0,
      skills: [],
      unlockedSkills: [],
      activeSkills: [],
    });
  });

  describe('canCombinePets', () => {
    it('should return false when insufficient AI Pets', () => {
      gameState$.petCount.set(5);
      expect(canCombinePets()).toBe(false);
    });

    it('should return true when enough AI Pets', () => {
      gameState$.petCount.set(10);
      expect(canCombinePets()).toBe(true);
    });
  });

  describe('combinePets', () => {
    it('should throw error when insufficient pets', () => {
      gameState$.petCount.set(5);
      expect(() => combinePets()).toThrow();
    });

    it('should deduct AI Pets and add Big Pet', () => {
      gameState$.petCount.set(15);
      combinePets();

      expect(gameState$.petCount.get()).toBe(5);
      expect(gameState$.bigPetCount.get()).toBe(1);
    });

    it('should allow multiple combinations', () => {
      gameState$.petCount.set(30);
      combinePets();
      combinePets();

      expect(gameState$.petCount.get()).toBe(10);
      expect(gameState$.bigPetCount.get()).toBe(2);
    });
  });

  describe('getCombineCost', () => {
    it('should return configured combine cost', () => {
      expect(getCombineCost()).toBe(10);
    });
  });
});
```

**File:** `/frontend/modules/singularity/skillEngine.test.ts` (new)

```typescript
import { gameState$ } from '../../shared/store/gameStore';
import {
  checkSkillRequirement,
  checkAndUnlockSkills,
  toggleSkill,
  isSkillUnlocked,
  isSkillActive,
} from './skillEngine';

describe('skillEngine', () => {
  beforeEach(() => {
    gameState$.set({
      petCount: 0,
      scrap: 0,
      upgrades: [],
      purchasedUpgrades: [],
      bigPetCount: 0,
      singularityPetCount: 0,
      skills: [
        {
          id: 'test-skill',
          name: 'Test Skill',
          description: 'Test',
          unlockRequirement: { type: 'singularityPetCount', value: 1 },
          effectType: 'visualTrail',
        },
      ],
      unlockedSkills: [],
      activeSkills: [],
    });
  });

  describe('checkSkillRequirement', () => {
    it('should check singularityPetCount requirement', () => {
      const req = { type: 'singularityPetCount', value: 1 } as const;

      expect(checkSkillRequirement(req)).toBe(false);

      gameState$.singularityPetCount.set(1);
      expect(checkSkillRequirement(req)).toBe(true);
    });

    it('should check totalPets requirement', () => {
      const req = { type: 'totalPets', value: 5 } as const;

      gameState$.petCount.set(2);
      gameState$.bigPetCount.set(2);
      gameState$.singularityPetCount.set(1);

      expect(checkSkillRequirement(req)).toBe(true);
    });

    it('should check upgrade requirement', () => {
      const req = { type: 'upgrade', value: 'test-upgrade' } as const;

      expect(checkSkillRequirement(req)).toBe(false);

      gameState$.purchasedUpgrades.set(['test-upgrade']);
      expect(checkSkillRequirement(req)).toBe(true);
    });
  });

  describe('checkAndUnlockSkills', () => {
    it('should unlock skill when requirement is met', () => {
      gameState$.singularityPetCount.set(1);
      checkAndUnlockSkills();

      expect(gameState$.unlockedSkills.get()).toContain('test-skill');
      expect(gameState$.activeSkills.get()).toContain('test-skill');
    });

    it('should not unlock skill when requirement not met', () => {
      gameState$.singularityPetCount.set(0);
      checkAndUnlockSkills();

      expect(gameState$.unlockedSkills.get()).toEqual([]);
    });

    it('should not unlock already unlocked skill', () => {
      gameState$.singularityPetCount.set(1);
      gameState$.unlockedSkills.set(['test-skill']);

      const spy = jest.spyOn(console, 'log');
      checkAndUnlockSkills();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('toggleSkill', () => {
    beforeEach(() => {
      gameState$.unlockedSkills.set(['test-skill']);
      gameState$.activeSkills.set(['test-skill']);
    });

    it('should deactivate active skill', () => {
      toggleSkill('test-skill');
      expect(gameState$.activeSkills.get()).toEqual([]);
    });

    it('should activate inactive skill if unlocked', () => {
      gameState$.activeSkills.set([]);
      toggleSkill('test-skill');
      expect(gameState$.activeSkills.get()).toContain('test-skill');
    });

    it('should not activate locked skill', () => {
      gameState$.unlockedSkills.set([]);
      gameState$.activeSkills.set([]);

      toggleSkill('test-skill');
      expect(gameState$.activeSkills.get()).toEqual([]);
    });
  });
});
```

### 8.2 Component Tests

**File:** `/frontend/modules/singularity/SkillsScreen.test.tsx` (new)

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SkillsScreen } from './SkillsScreen';
import { gameState$ } from '../../shared/store/gameStore';
import { SKILLS } from './skillDefinitions';

describe('SkillsScreen', () => {
  const mockNavigateBack = jest.fn();

  beforeEach(() => {
    gameState$.set({
      petCount: 0,
      scrap: 0,
      upgrades: [],
      purchasedUpgrades: [],
      bigPetCount: 0,
      singularityPetCount: 0,
      skills: SKILLS,
      unlockedSkills: [],
      activeSkills: [],
    });
    mockNavigateBack.mockClear();
  });

  it('should render header with title', () => {
    render(<SkillsScreen onNavigateBack={mockNavigateBack} />);
    expect(screen.getByText('Skills')).toBeTruthy();
  });

  it('should render back button', () => {
    render(<SkillsScreen onNavigateBack={mockNavigateBack} />);
    const backButton = screen.getByText('← Back');
    expect(backButton).toBeTruthy();
  });

  it('should call onNavigateBack when back button pressed', () => {
    render(<SkillsScreen onNavigateBack={mockNavigateBack} />);
    const backButton = screen.getByText('← Back');
    fireEvent.press(backButton);
    expect(mockNavigateBack).toHaveBeenCalledTimes(1);
  });

  it('should display skills with lock indicators', () => {
    render(<SkillsScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.getByText('Painting')).toBeTruthy();
    expect(screen.getByText(/Requires:/)).toBeTruthy();
  });

  it('should show toggle when skill is unlocked', () => {
    gameState$.unlockedSkills.set(['painting']);
    gameState$.activeSkills.set(['painting']);

    render(<SkillsScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('should toggle skill when switch pressed', () => {
    gameState$.unlockedSkills.set(['painting']);
    gameState$.activeSkills.set(['painting']);

    render(<SkillsScreen onNavigateBack={mockNavigateBack} />);

    const toggle = screen.getByRole('switch');
    fireEvent(toggle, 'valueChange', false);

    expect(gameState$.activeSkills.get()).not.toContain('painting');
  });
});
```

**File:** `/frontend/modules/singularity/components/CombineConfirmationDialog.test.tsx` (new)

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { CombineConfirmationDialog } from './CombineConfirmationDialog';

describe('CombineConfirmationDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  it('should not render when visible is false', () => {
    const { queryByText } = render(
      <CombineConfirmationDialog
        visible={false}
        cost={10}
        currentCount={15}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(queryByText('Combine Pets?')).toBeNull();
  });

  it('should render when visible is true', () => {
    render(
      <CombineConfirmationDialog
        visible={true}
        cost={10}
        currentCount={15}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Combine Pets?')).toBeTruthy();
    expect(screen.getByText(/Convert 10 AI Pets/)).toBeTruthy();
  });

  it('should call onCancel when cancel button pressed', () => {
    render(
      <CombineConfirmationDialog
        visible={true}
        cost={10}
        currentCount={15}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should call onConfirm when combine button pressed', () => {
    render(
      <CombineConfirmationDialog
        visible={true}
        cost={10}
        currentCount={15}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByText('Combine');
    fireEvent.press(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should display current count', () => {
    render(
      <CombineConfirmationDialog
        visible={true}
        cost={10}
        currentCount={25}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/You have 25 AI Pets/)).toBeTruthy();
  });
});
```

### 8.3 Integration Tests

**File:** `/frontend/modules/singularity/singularityIntegration.test.ts` (new)

```typescript
import { gameState$ } from '../../shared/store/gameStore';
import { processSingularityTick } from './singularityEngine';
import { checkAndUnlockSkills } from './skillEngine';
import { combinePets } from './combinationLogic';
import { SKILLS } from './skillDefinitions';

describe('Singularity System Integration', () => {
  beforeEach(() => {
    gameState$.set({
      petCount: 0,
      scrap: 0,
      upgrades: [],
      purchasedUpgrades: [],
      bigPetCount: 0,
      singularityPetCount: 0,
      skills: SKILLS,
      unlockedSkills: [],
      activeSkills: [],
    });
  });

  it('should complete full progression flow: AI → Big → Singularity → Skill', () => {
    // Start with AI Pets
    gameState$.petCount.set(10);

    // Combine to Big Pet
    combinePets();
    expect(gameState$.petCount.get()).toBe(0);
    expect(gameState$.bigPetCount.get()).toBe(1);

    // Mock singularity transition
    jest.spyOn(Math, 'random').mockReturnValue(0.001);
    processSingularityTick(1.0);

    expect(gameState$.bigPetCount.get()).toBe(0);
    expect(gameState$.singularityPetCount.get()).toBe(1);

    // Check skill unlock
    checkAndUnlockSkills();
    expect(gameState$.unlockedSkills.get()).toContain('painting');
    expect(gameState$.activeSkills.get()).toContain('painting');
  });

  it('should handle multiple tier transitions in same tick', () => {
    gameState$.petCount.set(5);
    gameState$.bigPetCount.set(3);

    jest.spyOn(Math, 'random').mockReturnValue(0.001);
    processSingularityTick(1.0);

    const totalSingularity = gameState$.singularityPetCount.get();
    const totalRemaining = gameState$.petCount.get() + gameState$.bigPetCount.get();

    expect(totalSingularity).toBeGreaterThan(0);
    expect(totalSingularity + totalRemaining).toBe(8);
  });

  it('should maintain total pet count across all operations', () => {
    gameState$.petCount.set(20);

    const initialTotal = 20;

    // Combine
    combinePets();
    expect(gameState$.petCount.get() + gameState$.bigPetCount.get()).toBe(initialTotal);

    // Singularity transition
    jest.spyOn(Math, 'random').mockReturnValue(0.001);
    processSingularityTick(1.0);

    const finalTotal =
      gameState$.petCount.get() +
      gameState$.bigPetCount.get() +
      gameState$.singularityPetCount.get();

    expect(finalTotal).toBe(initialTotal);
  });
});
```

### 8.4 Test Coverage Goals

- **Unit Tests:** 90%+ coverage for all logic modules
- **Component Tests:** 90%+ coverage for SkillsScreen and CombineConfirmationDialog
- **Integration Tests:** Cover all major user flows
- **Run in cmd.exe:** Per CLAUDE.md guidelines

### 8.5 Running Tests

```bash
# Run all singularity tests
cmd.exe /c "npm test -- singularity"

# Run specific test file
cmd.exe /c "npm test -- singularityEngine.test.ts"

# Run with coverage
cmd.exe /c "npm test -- --coverage singularity"
```

---

## 9. Implementation Phases

### Phase 1: Type System and State Extensions
**Priority:** High | **Effort:** 2-3 hours

**Tasks:**
1. Extend GameState interface with singularity fields
2. Create Skill and SkillRequirement types
3. Extend Upgrade interface with new effect types
4. Update DEFAULT_GAME_STATE
5. Update isValidGameState type guard
6. Update sanitizeGameState function
7. Run TypeScript compiler to verify no errors

**Tests:**
- Type checking passes
- Existing code still compiles

**Acceptance Criteria:**
- [ ] All new types defined
- [ ] No TypeScript errors
- [ ] Backward compatible with existing state

---

### Phase 2: Core Singularity Logic (TDD)
**Priority:** High | **Effort:** 4-5 hours

**TDD Approach:**
1. Write tests for singularityEngine functions (FAIL)
2. Implement getEffectiveSingularityRate (PASS)
3. Write tests for processSingularityTick (FAIL)
4. Implement processSingularityTick (PASS)
5. Write tests for applySingularityBoostFromFeeding (FAIL)
6. Implement applySingularityBoostFromFeeding (PASS)
7. Refactor for clarity

**Tasks:**
- Create singularityConfig.ts
- Create singularityEngine.ts
- Write comprehensive unit tests
- Ensure all tests pass

**Acceptance Criteria:**
- [ ] All singularity logic tests pass
- [ ] Code coverage ≥ 90%
- [ ] Singularity transitions work correctly
- [ ] Feeding boost applies correctly

---

### Phase 3: Pet Combination Logic (TDD)
**Priority:** High | **Effort:** 2-3 hours

**TDD Approach:**
1. Write tests for combinationLogic (FAIL)
2. Implement canCombinePets (PASS)
3. Implement combinePets (PASS)
4. Implement getCombineCost (PASS)
5. Refactor

**Tasks:**
- Create combinationLogic.ts
- Write unit tests
- Ensure validation works

**Acceptance Criteria:**
- [ ] Combination logic tests pass
- [ ] Code coverage ≥ 90%
- [ ] Error handling for insufficient pets
- [ ] Atomic state updates

---

### Phase 4: Skill System Logic (TDD)
**Priority:** High | **Effort:** 3-4 hours

**TDD Approach:**
1. Write tests for skillEngine (FAIL)
2. Implement checkSkillRequirement (PASS)
3. Implement checkAndUnlockSkills (PASS)
4. Implement toggleSkill (PASS)
5. Refactor

**Tasks:**
- Create skillDefinitions.ts
- Create skillEngine.ts
- Write unit tests
- Ensure unlock logic works

**Acceptance Criteria:**
- [ ] Skill engine tests pass
- [ ] Code coverage ≥ 90%
- [ ] Skills unlock automatically
- [ ] Toggle works correctly

---

### Phase 5: State Management Integration
**Priority:** High | **Effort:** 3-4 hours

**Tasks:**
1. Update gameStore.ts with new observables
2. Add computed observables (totalSingularityRateMultiplier$, etc.)
3. Update calculateScrapPerSecond for multi-tier
4. Update initializeGameState to populate skills
5. Update useGameState hook
6. Write integration tests

**Acceptance Criteria:**
- [ ] State observables reactive
- [ ] Computed values calculate correctly
- [ ] Persistence works for new fields
- [ ] Integration tests pass

---

### Phase 6: AttackButtonScreen Updates (TDD)
**Priority:** High | **Effort:** 4-5 hours

**TDD Approach:**
1. Write tests for updated AttackButtonScreen (FAIL)
2. Update component JSX and logic (PASS)
3. Add game loop integration
4. Update feed handler
5. Add pet counts display
6. Refactor

**Tasks:**
- Update AttackButtonScreen.tsx
- Integrate game loop (scrap, singularity, skills)
- Update feed button handler
- Add pet tier displays
- Write component tests

**Acceptance Criteria:**
- [ ] Pet counts display correctly
- [ ] Feed triggers singularity boost
- [ ] Game loop runs continuously
- [ ] Component tests pass

---

### Phase 7: Combine Button and Dialog (TDD)
**Priority:** High | **Effort:** 3-4 hours

**TDD Approach:**
1. Write tests for CombineConfirmationDialog (FAIL)
2. Implement CombineConfirmationDialog (PASS)
3. Write tests for combine button in AttackButtonScreen (FAIL)
4. Add combine button to AttackButtonScreen (PASS)
5. Refactor

**Tasks:**
- Create CombineConfirmationDialog.tsx
- Add combine button to AttackButtonScreen
- Wire up handlers
- Write component tests

**Acceptance Criteria:**
- [ ] Dialog renders correctly
- [ ] Confirmation required before combining
- [ ] Button disabled when insufficient pets
- [ ] Tests pass

---

### Phase 8: SkillsScreen Implementation (TDD)
**Priority:** High | **Effort:** 4-5 hours

**TDD Approach:**
1. Write tests for SkillsScreen (FAIL)
2. Implement SkillsScreen skeleton (PASS)
3. Write tests for SkillCard (FAIL)
4. Implement SkillCard (PASS)
5. Refactor

**Tasks:**
- Create SkillsScreen.tsx
- Implement SkillCard subcomponent
- Add navigation from AttackButtonScreen
- Update App.tsx routing
- Write component tests

**Acceptance Criteria:**
- [ ] SkillsScreen renders correctly
- [ ] Skills display with lock/unlock states
- [ ] Toggle works
- [ ] Navigation works
- [ ] Tests pass

---

### Phase 9: Painting Skill Effect (TDD)
**Priority:** Medium | **Effort:** 4-5 hours

**TDD Approach:**
1. Write tests for PaintingCanvas (FAIL)
2. Implement PaintingCanvas (PASS)
3. Integrate with feed button
4. Test performance with max trails
5. Refactor

**Tasks:**
- Create PaintingCanvas.tsx
- Implement trail rendering
- Add fade-out animation
- Integrate with AttackButtonScreen
- Optimize performance

**Acceptance Criteria:**
- [ ] Trails appear on feed taps
- [ ] Trails fade out correctly
- [ ] Performance smooth with 50 trails
- [ ] Only active when skill enabled
- [ ] Tests pass

---

### Phase 10: Shop Integration
**Priority:** Medium | **Effort:** 2-3 hours

**Tasks:**
- Add singularity upgrades to upgradeDefinitions.ts
- Update ShopScreen display logic for new effect types
- Test upgrade purchases
- Verify effects apply correctly

**Acceptance Criteria:**
- [ ] Singularity upgrades visible in shop
- [ ] Upgrades purchasable
- [ ] Effects apply to singularity rates
- [ ] Shop tests updated and passing

---

### Phase 11: Integration Testing
**Priority:** High | **Effort:** 3-4 hours

**Tasks:**
- Write integration tests for full flows
- Test: AI → Big → Singularity → Skill
- Test: Multiple upgrades stacking
- Test: Persistence and restoration
- Performance testing with large pet counts

**Acceptance Criteria:**
- [ ] All integration tests pass
- [ ] No race conditions
- [ ] State persists correctly
- [ ] Performance acceptable

---

### Phase 12: Polish and Accessibility
**Priority:** Medium | **Effort:** 2-3 hours

**Tasks:**
- Add accessibility labels to all new components
- Test with screen reader (if available)
- Verify touch targets ≥ 44pt
- Add loading states if needed
- Polish animations and transitions

**Acceptance Criteria:**
- [ ] All buttons have accessibility labels
- [ ] Touch targets meet standards
- [ ] Smooth animations
- [ ] No visual glitches

---

### Phase 13: Documentation
**Priority:** Low | **Effort:** 2 hours

**Tasks:**
- Add JSDoc comments to all exported functions
- Document complex algorithms
- Add inline comments for unclear logic
- Update README if needed

**Acceptance Criteria:**
- [ ] All public APIs documented
- [ ] Complex logic explained
- [ ] Code self-documenting

---

## 10. File Structure

### 10.1 New Files

```
/frontend/modules/singularity/
├── SkillsScreen.tsx                          # Skills management screen
├── SkillsScreen.test.tsx                     # Skills screen tests
├── skillDefinitions.ts                       # Skill data definitions
├── singularityConfig.ts                      # Configuration constants
├── singularityEngine.ts                      # Core singularity logic
├── singularityEngine.test.ts                 # Singularity engine tests
├── combinationLogic.ts                       # Pet combination logic
├── combinationLogic.test.ts                  # Combination tests
├── skillEngine.ts                            # Skill unlock and toggle logic
├── skillEngine.test.ts                       # Skill engine tests
├── singularityIntegration.test.ts            # Integration tests
├── components/
│   ├── CombineConfirmationDialog.tsx         # Confirmation modal
│   ├── CombineConfirmationDialog.test.tsx    # Dialog tests
│   ├── PaintingCanvas.tsx                    # Visual trail effects
│   └── PaintingCanvas.test.tsx               # Canvas tests
└── specs/
    ├── prd_singularity.md                    # Product requirements (existing)
    ├── tdd_singularity.md                    # This document (new)
    ├── feature-singularity.md                # Feature description (existing)
    ├── feature-big-pet.md                    # Big Pet feature (existing)
    └── feature-skills.md                     # Skills feature (existing)
```

### 10.2 Modified Files

```
/frontend/
├── App.tsx                                   # Add Skills screen routing
├── shared/
│   ├── types/game.ts                         # Extend types
│   ├── store/gameStore.ts                    # Add observables and computed
│   ├── store/persistence.ts                  # No changes needed
│   └── hooks/useGameState.ts                 # Add new fields
└── modules/
    ├── attack-button/
    │   ├── AttackButtonScreen.tsx            # Major updates
    │   └── AttackButtonScreen.test.tsx       # Update tests
    └── shop/
        ├── upgradeDefinitions.ts             # Add singularity upgrades
        └── ShopScreen.tsx                    # Update effect display logic
```

---

## 11. Performance Considerations

### 11.1 Singularity Tick Performance

**Concern:** Processing singularity for 1000+ pets per tick.

**Solution:**
- Use probabilistic approach (not per-pet state)
- Limit loop iterations to current counts
- Profile with realistic pet counts
- Consider batching if performance degrades

**Acceptable Performance:**
- < 5ms per tick with 1000 AI Pets
- < 10ms per tick with 1000 AI + 100 Big Pets

### 11.2 Painting Trail Performance

**Concern:** Rendering 50 trails with fade animations.

**Solution:**
- Limit max trails (50 hard cap)
- Use simple View rendering (not Canvas)
- Clean up old trails promptly
- Use `pointerEvents="none"` on canvas

**Acceptable Performance:**
- Maintain 60 FPS with max trails active
- No memory leaks over extended gameplay

### 11.3 State Update Efficiency

**Pattern:**
- Use functional updates: `set(prev => prev + 1)`
- Avoid multiple rapid updates
- Batch related updates where possible
- Leverage Legend State's automatic optimization

---

## 12. Security and Validation

### 12.1 Input Validation

**Pet Combination:**
```typescript
if (currentCount < COMBINE_COST) {
  throw new Error('Insufficient AI Pets');
}
```

**Skill Toggle:**
```typescript
if (!unlockedSkills.includes(skillId)) {
  return;  // Silent fail, don't activate locked skill
}
```

### 12.2 State Sanitization

**All pet counts clamped to [0, MAX_SAFE_INTEGER]:**
```typescript
bigPetCount: Math.max(0, Math.min(state.bigPetCount || 0, Number.MAX_SAFE_INTEGER))
```

### 12.3 Race Condition Prevention

**Atomic updates:**
- All state changes use Legend State's atomic set operations
- No manual locks needed (Legend State handles concurrency)
- Transitions are atomic: decrement + increment in same operation

---

## 13. Acceptance Criteria Summary

**Must Have (Blocking Release):**

- [ ] Game state tracks bigPetCount, singularityPetCount, skills, unlockedSkills, activeSkills
- [ ] Main screen displays all three pet tier counts
- [ ] AI Pets and Big Pets passively progress toward singularity
- [ ] Feeding triggers singularity boost (small chance)
- [ ] Singularity rate upgrades purchasable and functional
- [ ] Pet combination converts 10 AI Pets → 1 Big Pet
- [ ] Combination requires confirmation dialog
- [ ] Combination disabled when insufficient pets
- [ ] Big Pets generate less scrap than equivalent AI Pets
- [ ] Scrap calculation includes all tiers
- [ ] Skills system tracks unlocked and active skills
- [ ] Painting skill unlocks at 1 Singularity Pet
- [ ] Painting trails render when active
- [ ] Trails fade out after 3 seconds
- [ ] Skills can be toggled on/off
- [ ] All state persists across app restarts
- [ ] All unit tests pass with ≥90% coverage
- [ ] All integration tests pass
- [ ] No TypeScript errors
- [ ] No console errors during normal use

**Should Have (Important):**

- [ ] Visual distinction between pet tier counts
- [ ] Painting trails use multiple colors
- [ ] Skills screen shows unlock requirements
- [ ] Combination dialog shows tradeoff information
- [ ] Performance smooth with typical pet counts (<1000)
- [ ] Accessibility labels on all interactive elements

**Nice to Have (Polish):**

- [ ] Visual effect when pet reaches singularity
- [ ] Notification when skill unlocks
- [ ] Progress indicator showing singularity progress
- [ ] Smooth animations

---

## 14. Revision History

| Version | Date       | Author  | Changes                                          |
|---------|------------|---------|--------------------------------------------------|
| 1.0     | 2025-11-17 | Claude  | Initial TDD creation for Singularity System      |

---

## 15. Appendix

### 15.1 Configuration Tuning Guide

**Balancing singularity rates:**

```typescript
// Fast progression (for testing)
BASE_AI_PET_SINGULARITY_RATE: 0.01     // ~1.67 minutes

// Balanced progression
BASE_AI_PET_SINGULARITY_RATE: 0.0001   // ~2.78 hours

// Slow progression
BASE_AI_PET_SINGULARITY_RATE: 0.00001  // ~27.8 hours
```

**Adjusting combine cost:**

```typescript
// Easy (quick Big Pets)
COMBINE_COST: 5

// Balanced
COMBINE_COST: 10

// Challenging
COMBINE_COST: 50
```

### 15.2 Formulas Reference

**Singularity Probability per Tick:**
```
P(singularity) = baseSingularityRate × deltaTime × (1 + Σ upgradeMultipliers)
```

**Expected Time to Singularity:**
```
E[time] = 1 / (baseSingularityRate × (1 + Σ upgradeMultipliers))

Examples:
- AI Pet (no upgrades): 1 / 0.0001 = 10,000s ≈ 2.78h
- AI Pet (+50% upgrade): 1 / 0.00015 = 6,667s ≈ 1.85h
- Big Pet (no upgrades): 1 / 0.01 = 100s ≈ 1.67min
```

**Scrap per Second (Multi-Tier):**
```
scrapPerSecond = (aiCount × 1.0 + bigCount × 0.5 + singularityCount × 0) × (1 + Σ scrapMultipliers)
```

**Combination Economics:**
```
Scrap loss per combination = (COMBINE_COST × 1.0) - 0.5 = 10 - 0.5 = 9.5 scrap/s

Example:
- Before: 10 AI Pets = 10 scrap/s
- After: 1 Big Pet = 0.5 scrap/s
- Loss: 9.5 scrap/s
```

### 15.3 Debugging Tips

**Enable verbose logging:**
```typescript
// In singularityEngine.ts
if (aiPetsTransitioned > 0) {
  console.log(`AI Pets transitioned: ${aiPetsTransitioned}`);
  gameState$.petCount.set(prev => prev - aiPetsTransitioned);
  gameState$.singularityPetCount.set(prev => prev + aiPetsTransitioned);
}
```

**Check state consistency:**
```typescript
const totalBefore = gameState$.petCount.get() + gameState$.bigPetCount.get() + gameState$.singularityPetCount.get();
// ... perform operations ...
const totalAfter = gameState$.petCount.get() + gameState$.bigPetCount.get() + gameState$.singularityPetCount.get();

if (totalBefore !== totalAfter) {
  console.error('Pet count mismatch!', { totalBefore, totalAfter });
}
```

---

**Document Status:** Final - Ready for TDD Implementation

**Next Steps:**
1. Review and approve TDD
2. Generate task list using `/flow:tasks`
3. Begin Phase 1: Type System and State Extensions
4. Follow TDD methodology: Write test → Fail → Implement → Pass → Refactor
5. Complete phases sequentially
6. Run tests in cmd.exe after each phase
7. Submit PR when all acceptance criteria met
