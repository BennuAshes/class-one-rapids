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
 *   const { petCount$, bigPetCount$, singularityPetCount$ } = useGameState();
 *   return <Text>AI Pets: {petCount$.get()}</Text>;
 * }
 * ```
 */
export function useGameState() {
  return {
    petCount$: gameState$.petCount,
    bigPetCount$: gameState$.bigPetCount,
    singularityPetCount$: gameState$.singularityPetCount,
    scrap$: gameState$.scrap,
    upgrades$: gameState$.upgrades,
    purchasedUpgrades$: gameState$.purchasedUpgrades,
    skills$: gameState$.skills,
    unlockedSkills$: gameState$.unlockedSkills,
    activeSkills$: gameState$.activeSkills,
  };
}
