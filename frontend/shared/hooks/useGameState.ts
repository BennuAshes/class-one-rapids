import { gameState$, scrapRate$, availableUpgrades$ } from '../store/gameStore';

/**
 * Hook for accessing shared game state
 * Provides reactive observables for pet count, scrap, scrap rate, and shop state
 *
 * @returns Reactive observables for game state
 *
 * @example
 * const { petCount$, scrap$, scrapRate$ } = useGameState();
 * const petCount = petCount$.get();  // Read current value
 * petCount$.set(5);                  // Write new value
 * petCount$.set(prev => prev + 1);   // Functional update
 */
export function useGameState() {
  return {
    petCount$: gameState$.petCount,
    scrap$: gameState$.scrap,
    scrapRate$: scrapRate$,
    upgrades$: gameState$.upgrades,
    purchasedUpgrades$: gameState$.purchasedUpgrades,
    availableUpgrades$: availableUpgrades$,
  };
}
