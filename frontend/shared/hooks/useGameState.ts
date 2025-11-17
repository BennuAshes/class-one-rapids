import { gameState$, scrapRate$ } from '../store/gameStore';

/**
 * Hook for accessing shared game state
 * Provides reactive observables for pet count, scrap, and scrap rate
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
  };
}
