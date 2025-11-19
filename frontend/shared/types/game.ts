/**
 * Core game state interfaces and type definitions for the Singularity Pet feeding system.
 */

/**
 * Types of skill requirements
 */
export type SkillRequirementType = 'singularityPetCount' | 'totalPets' | 'upgrade' | 'time';

/**
 * Represents a requirement that must be met to unlock a skill
 */
export interface SkillRequirement {
  /** Type of requirement */
  type: SkillRequirementType;
  /** Value or threshold for the requirement */
  value: number | string;
}

/**
 * Types of skill effects
 */
export type SkillEffectType = 'visualTrail' | 'other';

/**
 * Represents a skill that can be unlocked and activated
 */
export interface Skill {
  /** Unique identifier for the skill */
  id: string;
  /** Display name of the skill */
  name: string;
  /** Description explaining what the skill does */
  description: string;
  /** Requirement to unlock this skill */
  unlockRequirement: SkillRequirement;
  /** Type of effect this skill provides */
  effectType: SkillEffectType;
  /** Optional configuration for the effect */
  effectConfig?: Record<string, unknown>;
}

/**
 * Represents an upgrade that can be purchased in the game.
 */
export interface Upgrade {
  /** Unique identifier for the upgrade */
  id: string;
  /** Display name of the upgrade */
  name: string;
  /** Description explaining what the upgrade does */
  description: string;
  /** Cost in scrap to purchase this upgrade (renamed from scrapCost) */
  cost: number;
  /** Type of effect this upgrade provides */
  effectType: 'scrapMultiplier' | 'petBonus' | 'singularityRateMultiplier' | 'unlockCombination';
  /**
   * Numeric value of the effect:
   * - For scrapMultiplier: decimal multiplier (0.1 = 10%, 0.15 = 15%)
   * - For petBonus: flat integer bonus (1 = +1 pet, 2 = +2 pets)
   * - For singularityRateMultiplier: decimal multiplier (0.5 = 50%, 1.0 = 100%)
   * - For unlockCombination: not used (boolean unlock)
   */
  effectValue: number;
  /** Optional category for organizing upgrades */
  category?: 'scrapEfficiency' | 'petAcquisition' | 'singularityAcceleration' | 'petCombination';
}

/**
 * Main game state structure.
 */
export interface GameState {
  /** Number of AI Pets (base tier) */
  petCount: number;
  /** Number of Big Pets (tier 2) */
  bigPetCount: number;
  /** Number of Singularity Pets (tier 3) */
  singularityPetCount: number;
  /** Amount of scrap collected */
  scrap: number;
  /** Available upgrades */
  upgrades: Upgrade[];
  /** IDs of upgrades that have been purchased */
  purchasedUpgrades: string[];
  /** Available skills in the game */
  skills: Skill[];
  /** IDs of skills that have been unlocked */
  unlockedSkills: string[];
  /** IDs of skills that are currently active */
  activeSkills: string[];
}

/**
 * Persisted game state structure with versioning and metadata.
 */
export interface PersistedGameState {
  /** Schema version for migration support */
  version: number;
  /** The actual game state data */
  data: GameState;
  /** Unix timestamp when this state was saved */
  timestamp: number;
}

/**
 * Storage keys for AsyncStorage.
 */
export const STORAGE_KEYS = {
  GAME_STATE: 'game-state-v1',
} as const;

/**
 * Default initial game state.
 */
export const DEFAULT_GAME_STATE: GameState = {
  petCount: 0,
  bigPetCount: 0,
  singularityPetCount: 0,
  scrap: 0,
  upgrades: [],
  purchasedUpgrades: [],
  skills: [],
  unlockedSkills: [],
  activeSkills: [],
};

/**
 * Type guard to validate if an unknown value is a valid GameState.
 *
 * @param state - Unknown value to validate
 * @returns true if the value is a valid GameState
 */
export function isValidGameState(state: unknown): state is GameState {
  if (!state || typeof state !== 'object') {
    return false;
  }

  const s = state as Record<string, unknown>;

  return (
    typeof s.petCount === 'number' &&
    typeof s.bigPetCount === 'number' &&
    typeof s.singularityPetCount === 'number' &&
    typeof s.scrap === 'number' &&
    Array.isArray(s.upgrades) &&
    Array.isArray(s.purchasedUpgrades) &&
    s.purchasedUpgrades.every((id) => typeof id === 'string') &&
    Array.isArray(s.skills) &&
    Array.isArray(s.unlockedSkills) &&
    s.unlockedSkills.every((id) => typeof id === 'string') &&
    Array.isArray(s.activeSkills) &&
    s.activeSkills.every((id) => typeof id === 'string')
  );
}

/**
 * Sanitizes a game state by clamping values to valid ranges.
 * Ensures no negative values and keeps numbers within safe integer limits.
 *
 * @param state - Game state to sanitize
 * @returns Sanitized game state
 */
export function sanitizeGameState(state: GameState): GameState {
  return {
    petCount: Math.max(
      0,
      Math.min(state.petCount, Number.MAX_SAFE_INTEGER)
    ),
    bigPetCount: Math.max(
      0,
      Math.min(state.bigPetCount || 0, Number.MAX_SAFE_INTEGER)
    ),
    singularityPetCount: Math.max(
      0,
      Math.min(state.singularityPetCount || 0, Number.MAX_SAFE_INTEGER)
    ),
    scrap: Math.max(0, Math.min(state.scrap, Number.MAX_SAFE_INTEGER)),
    upgrades: state.upgrades || [],
    purchasedUpgrades: state.purchasedUpgrades || [],
    skills: state.skills || [],
    unlockedSkills: state.unlockedSkills || [],
    activeSkills: state.activeSkills || [],
  };
}
