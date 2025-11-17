import { gameState$ } from '../store/gameStore';

/**
 * Custom hook to access game state observables.
 * Provides access to individual observable properties of the game state.
 *
 * @returns Object containing observable references for each game state property
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { petCount$ } = useGameState();
 *   return <Text>Count: {petCount$.get()}</Text>;
 * }
 * ```
 */
export function useGameState() {
  return {
    petCount$: gameState$.petCount,
    scrap$: gameState$.scrap,
    upgrades$: gameState$.upgrades,
    purchasedUpgrades$: gameState$.purchasedUpgrades,
  };
}
