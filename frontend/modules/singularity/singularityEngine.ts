/**
 * Core singularity engine logic for pet transitions.
 *
 * This module handles the probabilistic progression of pets through tiers:
 * AI Pets (tier 1) -> Big Pets (tier 2) -> Singularity Pets (tier 3)
 *
 * Each tick, pets have a small probability to transition to the next tier.
 * Rates can be boosted by upgrades and feeding bonuses.
 */

import { GameState } from '../../shared/types/game';
import { SINGULARITY_CONFIG } from './singularityConfig';

/**
 * Calculates the effective singularity rate including upgrade multipliers.
 *
 * The formula is: effectiveRate = baseRate * (1 + totalMultiplier)
 * For example, a base rate of 0.01 with 0.5 multiplier becomes 0.015 (50% increase)
 *
 * @param baseRate - Base singularity rate per second (0.0001 for AI->Big, 0.01 for Big->Singularity)
 * @param totalMultiplier - Sum of all rate multipliers from upgrades (e.g., 0.5 = 50% increase)
 * @returns Effective rate after applying multipliers
 */
export function getEffectiveSingularityRate(
  baseRate: number,
  totalMultiplier: number
): number {
  return baseRate * (1 + totalMultiplier);
}

/**
 * Processes singularity transitions for one game tick.
 *
 * This function implements the core idle game loop for pet progression:
 * 1. Calculate effective rates based on upgrades
 * 2. For each pet, roll probability (rate * deltaTime) to transition
 * 3. Atomically update all pet counts to maintain consistency
 *
 * The probability scales linearly with deltaTime, so longer ticks have
 * proportionally higher transition chances. This ensures consistent
 * progression regardless of tick frequency.
 *
 * @param state - Current game state
 * @param deltaTime - Time elapsed in seconds since last tick (typically 1.0)
 * @param totalMultiplier - Sum of all singularity rate multipliers from upgrades
 * @returns Updated game state with new pet counts after transitions
 */
export function processSingularityTick(
  state: GameState,
  deltaTime: number,
  totalMultiplier: number
): GameState {
  let aiPetsToPromote = 0;
  let bigPetsToPromote = 0;

  // Calculate effective rates with upgrade multipliers
  const aiPetRate = getEffectiveSingularityRate(
    SINGULARITY_CONFIG.BASE_AI_PET_SINGULARITY_RATE,
    totalMultiplier
  );
  const bigPetRate = getEffectiveSingularityRate(
    SINGULARITY_CONFIG.BASE_BIG_PET_SINGULARITY_RATE,
    totalMultiplier
  );

  // Roll for each AI Pet transition (AI Pet -> Big Pet)
  const aiPetProbability = aiPetRate * deltaTime;
  for (let i = 0; i < state.petCount; i++) {
    if (Math.random() < aiPetProbability) {
      aiPetsToPromote++;
    }
  }

  // Roll for each Big Pet transition (Big Pet -> Singularity Pet)
  const bigPetProbability = bigPetRate * deltaTime;
  for (let i = 0; i < state.bigPetCount; i++) {
    if (Math.random() < bigPetProbability) {
      bigPetsToPromote++;
    }
  }

  // Atomically update pet counts to prevent inconsistencies
  // Note: Pets flow in one direction (AI -> Big -> Singularity)
  return {
    ...state,
    petCount: state.petCount - aiPetsToPromote,
    bigPetCount: state.bigPetCount - bigPetsToPromote + aiPetsToPromote,
    singularityPetCount: state.singularityPetCount + bigPetsToPromote,
  };
}

/**
 * Applies singularity boost chance when feeding the Singularity Pet.
 *
 * When feeding, there's a small probability (1% by default) to instantly
 * promote one random pet to the next tier. This provides a reward for
 * active play compared to pure idle progression.
 *
 * The pet to promote is selected proportionally based on tier populations.
 * For example, if you have 90 AI Pets and 10 Big Pets, there's a 90% chance
 * an AI Pet will be promoted and 10% chance a Big Pet will be promoted.
 *
 * @param state - Current game state
 * @returns Updated game state (possibly with one pet promoted)
 */
export function applySingularityBoostFromFeeding(state: GameState): GameState {
  // Roll for boost trigger (default 1% chance)
  if (Math.random() >= SINGULARITY_CONFIG.FEEDING_SINGULARITY_BOOST_CHANCE) {
    return state;
  }

  // Calculate total promotable pets (Singularity Pets cannot be promoted further)
  const totalPromotable = state.petCount + state.bigPetCount;

  if (totalPromotable === 0) {
    // No pets to promote
    return state;
  }

  // Randomly select which tier to promote from, weighted by population
  const randomValue = Math.random();
  const aiPetThreshold = state.petCount / totalPromotable;

  if (randomValue < aiPetThreshold && state.petCount > 0) {
    // Promote AI Pet to Big Pet
    return {
      ...state,
      petCount: state.petCount - 1,
      bigPetCount: state.bigPetCount + 1,
    };
  } else if (state.bigPetCount > 0) {
    // Promote Big Pet to Singularity Pet
    return {
      ...state,
      bigPetCount: state.bigPetCount - 1,
      singularityPetCount: state.singularityPetCount + 1,
    };
  }

  return state;
}
