import { observable, computed } from '@legendapp/state';

/**
 * Shared game state observable
 * Contains cross-feature game progression state
 */
export const gameState$ = observable({
  petCount: 0,  // Singularity Pet Count (shared with ClickerScreen)
  scrap: 0,     // Passive resource (scrap system)
});

/**
 * Computed scrap generation rate (scrap per second)
 * Auto-recomputes when petCount changes
 */
export const scrapRate$ = computed(() => {
  const petCount = gameState$.petCount.get();
  const scrapMultiplier = 1; // Base: 1 scrap per pet per second
  return Math.floor(petCount * scrapMultiplier);
});
