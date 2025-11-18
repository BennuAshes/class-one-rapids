/**
 * Pet combination logic - allows manual combining of AI Pets into Big Pets.
 *
 * This provides an alternative to waiting for random singularity transitions.
 * Players can strategically combine pets to accelerate tier 2 pet acquisition.
 */

import { GameState } from '../../shared/types/game';
import { SINGULARITY_CONFIG } from './singularityConfig';

/**
 * Returns the cost to combine AI Pets into a Big Pet.
 *
 * @returns Number of AI Pets required for one Big Pet (default: 10)
 */
export function getCombineCost(): number {
  return SINGULARITY_CONFIG.COMBINE_COST;
}

/**
 * Checks if the player can perform a combination.
 * Requires:
 * - Unlock combination upgrade purchased
 * - Enough AI Pets (>= COMBINE_COST)
 *
 * @param state - Current game state
 * @returns true if combination is unlocked and petCount >= COMBINE_COST, false otherwise
 */
export function canCombinePets(state: GameState): boolean {
  const hasUnlockUpgrade = state.purchasedUpgrades.some(
    id => state.upgrades.find(u => u.id === id && u.effectType === 'unlockCombination')
  );
  return hasUnlockUpgrade && state.petCount >= SINGULARITY_CONFIG.COMBINE_COST;
}

/**
 * Combines AI Pets into a Big Pet.
 *
 * This is a manual action that converts COMBINE_COST AI Pets into 1 Big Pet.
 * The operation is atomic - either all pets are deducted and 1 Big Pet is added,
 * or the operation fails with no state changes.
 *
 * @param state - Current game state
 * @returns Updated game state with pet counts adjusted
 * @throws Error if insufficient AI Pets to combine (use canCombinePets to check first)
 */
export function combinePets(state: GameState): GameState {
  if (!canCombinePets(state)) {
    throw new Error(
      `Insufficient AI Pets to combine. Need ${SINGULARITY_CONFIG.COMBINE_COST}, have ${state.petCount}`
    );
  }

  // Atomically update pet counts
  return {
    ...state,
    petCount: state.petCount - SINGULARITY_CONFIG.COMBINE_COST,
    bigPetCount: state.bigPetCount + 1,
  };
}
