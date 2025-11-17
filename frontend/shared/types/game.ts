/**
 * Core game state interfaces and type definitions for the Singularity Pet feeding system.
 */

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
  effectType: 'scrapMultiplier' | 'petBonus';
  /**
   * Numeric value of the effect:
   * - For scrapMultiplier: decimal multiplier (0.1 = 10%, 0.15 = 15%)
   * - For petBonus: flat integer bonus (1 = +1 pet, 2 = +2 pets)
   */
  effectValue: number;
  /** Optional category for organizing upgrades */
  category?: 'scrapEfficiency' | 'petAcquisition';
}

/**
 * Main game state structure.
 */
export interface GameState {
  /** Number of times the Singularity Pet has been fed */
  petCount: number;
  /** Amount of scrap collected (reserved for future use) */
  scrap: number;
  /** Available upgrades (reserved for future use) */
  upgrades: Upgrade[];
  /** IDs of upgrades that have been purchased (reserved for future use) */
  purchasedUpgrades: string[];
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
  scrap: 0,
  upgrades: [],
  purchasedUpgrades: [],
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
    typeof s.scrap === 'number' &&
    Array.isArray(s.upgrades) &&
    Array.isArray(s.purchasedUpgrades) &&
    s.purchasedUpgrades.every((id) => typeof id === 'string')
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
    scrap: Math.max(0, Math.min(state.scrap, Number.MAX_SAFE_INTEGER)),
    upgrades: state.upgrades || [],
    purchasedUpgrades: state.purchasedUpgrades || [],
  };
}
