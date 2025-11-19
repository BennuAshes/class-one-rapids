import { observable, computed } from '@legendapp/state';
import { GameState } from '../types/game';
import { loadGameState, saveGameState } from './persistence';
import { UPGRADES } from '../../modules/shop/upgradeDefinitions';
import { SKILLS } from '../../modules/singularity/skillDefinitions';
import { SINGULARITY_CONFIG } from '../../modules/singularity/singularityConfig';

/**
 * Maximum value for pet count (JavaScript safe integer limit)
 */
export const maxPetCount = Number.MAX_SAFE_INTEGER;

/**
 * Debounce delay for saving state to storage (in milliseconds)
 */
const SAVE_DEBOUNCE_MS = 1000;

/**
 * Timeout handle for debounced save operations
 */
let saveTimeout: NodeJS.Timeout | null = null;

/**
 * Central game state observable using Legend State.
 * This observable holds all game state and automatically triggers UI updates.
 */
export const gameState$ = observable<GameState>({
  petCount: 0,
  bigPetCount: 0,
  singularityPetCount: 0,
  scrap: 0,
  upgrades: [],
  purchasedUpgrades: [],
  skills: [],
  unlockedSkills: [],
  activeSkills: [],
});

/**
 * Computed observable that calculates the total scrap multiplier from purchased upgrades.
 * Sums up all scrapMultiplier effectValues from purchased upgrades.
 *
 * @returns The total scrap multiplier as a decimal (0.1 = 10%, 0.5 = 50%, etc.)
 *
 * @example
 * ```typescript
 * // With scrap-boost-1 (0.1) and scrap-boost-2 (0.15) purchased:
 * const multiplier = totalScrapMultiplier$.get(); // 0.25
 * const scrapGenerated = basePets * (1 + multiplier); // basePets * 1.25
 * ```
 */
export const totalScrapMultiplier$ = computed(() => {
  const purchased = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  return upgrades
    .filter(u => purchased.includes(u.id) && u.effectType === 'scrapMultiplier')
    .reduce((sum, u) => sum + u.effectValue, 0);
});

/**
 * Computed observable that calculates the total pet bonus from purchased upgrades.
 * Sums up all petBonus effectValues from purchased upgrades.
 *
 * @returns The total pet bonus as an integer (number of additional pets per feed)
 *
 * @example
 * ```typescript
 * // With pet-boost-1 (1) and pet-boost-2 (2) purchased:
 * const bonus = totalPetBonus$.get(); // 3
 * const petsToAdd = 1 + bonus; // 4 total pets per feed
 * ```
 */
export const totalPetBonus$ = computed(() => {
  const purchased = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  return upgrades
    .filter(u => purchased.includes(u.id) && u.effectType === 'petBonus')
    .reduce((sum, u) => sum + u.effectValue, 0);
});

/**
 * Computed observable for total singularity rate multiplier from upgrades
 */
export const totalSingularityRateMultiplier$ = computed(() => {
  const purchased = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  return upgrades
    .filter(u => purchased.includes(u.id) && u.effectType === 'singularityRateMultiplier')
    .reduce((sum, u) => sum + u.effectValue, 0);
});

/**
 * Computed observable for whether combination is unlocked
 */
export const isCombinationUnlocked$ = computed(() => {
  const purchased = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  return upgrades.some(u => purchased.includes(u.id) && u.effectType === 'unlockCombination');
});

/**
 * Computed observable for total pets across all tiers
 */
export const totalPets$ = computed(() => {
  return gameState$.petCount.get() + gameState$.bigPetCount.get() + gameState$.singularityPetCount.get();
});

// Set up auto-persistence with debouncing
// This will save the state 1 second after the last change
gameState$.onChange(() => {
  // Clear existing timeout if there is one
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Set new timeout to save state
  saveTimeout = setTimeout(() => {
    const state = gameState$.get();
    saveGameState(state).catch((error) => {
      console.error('Error auto-saving game state:', error);
    });
  }, SAVE_DEBOUNCE_MS);
});

/**
 * Increments the pet count by a specified amount.
 *
 * @param amount - The amount to increment by (default: 1)
 */
export function incrementPetCount(amount: number = 1): void {
  gameState$.petCount.set((prev) => prev + amount);
}

/**
 * Resets the pet count to zero.
 */
export function resetPetCount(): void {
  gameState$.petCount.set(0);
}

/**
 * Resets all game state to default values.
 */
export function resetGameState(): void {
  gameState$.set({
    petCount: 0,
    bigPetCount: 0,
    singularityPetCount: 0,
    scrap: 0,
    upgrades: UPGRADES,
    purchasedUpgrades: [],
    skills: SKILLS,
    unlockedSkills: [],
    activeSkills: [],
  });
}

/**
 * Checks if the pet count is at the maximum value.
 *
 * @returns true if pet count is at or exceeds maximum
 */
export function isPetCountAtMax(): boolean {
  return gameState$.petCount.get() >= maxPetCount;
}

/**
 * Calculates scrap generation per second for all pet tiers
 */
export function calculateScrapPerSecond(): number {
  const state = gameState$.get();
  const baseScrap =
    (state.petCount * SINGULARITY_CONFIG.AI_PET_SCRAP_RATE) +
    (state.bigPetCount * SINGULARITY_CONFIG.BIG_PET_SCRAP_RATE) +
    (state.singularityPetCount * SINGULARITY_CONFIG.SINGULARITY_PET_SCRAP_RATE);

  const multiplier = totalScrapMultiplier$.get();
  return baseScrap * (1 + multiplier);
}

/**
 * Initializes the game state from persistent storage.
 * Loads saved state if available, otherwise continues with defaults.
 * Populates upgrades and skills arrays if empty.
 * Never throws errors - failures are logged and gracefully handled.
 */
export async function initializeGameState(): Promise<void> {
  try {
    const savedState = await loadGameState();

    if (savedState) {
      // Merge saved state with current state
      gameState$.set({
        ...gameState$.get(),
        ...savedState,
      });
    }

    // Populate upgrades array if empty (first load or missing from saved state)
    if (gameState$.upgrades.get().length === 0) {
      gameState$.upgrades.set(UPGRADES);
    }

    // Populate skills array if empty
    if (gameState$.skills.get().length === 0) {
      gameState$.skills.set(SKILLS);
    }
  } catch (error) {
    console.error('Error initializing game state:', error);

    // On error, still try to ensure upgrades and skills are populated
    if (gameState$.upgrades.get().length === 0) {
      gameState$.upgrades.set(UPGRADES);
    }
    if (gameState$.skills.get().length === 0) {
      gameState$.skills.set(SKILLS);
    }
  }
}
