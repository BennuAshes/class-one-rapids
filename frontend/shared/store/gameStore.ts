import { observable, computed } from '@legendapp/state';
import { Upgrade } from '../../modules/upgrades/types';
import { UPGRADE_DEFINITIONS } from '../../modules/upgrades/upgradeDefinitions';
import { PurchaseResult, PurchaseError } from '../../modules/upgrades/types';
import { savePurchases, loadPurchases } from './persistence';

/**
 * Type of upgrade available in the shop
 * @deprecated Use Upgrade from upgrades module instead
 */
export type UpgradeType = 'scrap-per-pet' | 'pets-per-feed';

/**
 * Shared game state observable
 * Contains cross-feature game progression state
 */
export const gameState$ = observable({
  petCount: 0,  // Singularity Pet Count (shared with ClickerScreen)
  scrap: 0,     // Passive resource (scrap system)
  upgrades: UPGRADE_DEFINITIONS as Upgrade[],
  purchasedUpgrades: [] as string[],
});

/**
 * Computed total scrap multiplier from all purchased scrapMultiplier upgrades
 * Base: 0 (no bonuses)
 * With upgrades: sum of all purchased scrapMultiplier effectValues
 */
export const totalScrapBonus$ = computed(() => {
  const purchasedIds = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  const scrapUpgrades = upgrades.filter(
    u => u.effectType === 'scrapMultiplier' && purchasedIds.includes(u.id)
  );

  return scrapUpgrades.reduce((sum, upgrade) => sum + upgrade.effectValue, 0);
});

/**
 * Computed total pet bonus from all purchased petBonus upgrades
 * Base: 0 (no bonuses, just base 1 pet per feed)
 * With upgrades: sum of all purchased petBonus effectValues
 */
export const totalPetBonus$ = computed(() => {
  const purchasedIds = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  const petUpgrades = upgrades.filter(
    u => u.effectType === 'petBonus' && purchasedIds.includes(u.id)
  );

  return petUpgrades.reduce((sum, upgrade) => sum + upgrade.effectValue, 0);
});

/**
 * Helper function for scrap multiplier calculation
 * Used in scrapRate$ computed observable
 */
export function getScrapMultiplier(): number {
  return 1.0 + totalScrapBonus$.get();
}

/**
 * Computed scrap generation rate (scrap per second)
 * Auto-recomputes when petCount or purchased upgrades change
 */
export const scrapRate$ = computed(() => {
  const petCount = gameState$.petCount.get();
  const scrapMultiplier = getScrapMultiplier();
  return Math.floor(petCount * scrapMultiplier);
});

/**
 * Computed observable that filters out purchased upgrades
 * Returns only upgrades that haven't been purchased yet
 */
export const availableUpgrades$ = computed(() => {
  const allUpgrades = gameState$.upgrades.get();
  const purchased = gameState$.purchasedUpgrades.get();
  return allUpgrades.filter(u => !purchased.includes(u.id));
});

/**
 * Purchase an upgrade
 * Validates affordability and purchase state, then commits transaction
 *
 * @param upgradeId - ID of upgrade to purchase
 * @returns Purchase result with success status and optional error
 */
export async function purchaseUpgrade(upgradeId: string): Promise<PurchaseResult> {
  const upgrade = gameState$.upgrades.get().find(u => u.id === upgradeId);

  // Validation: upgrade exists
  if (!upgrade) {
    return { success: false, error: PurchaseError.INVALID_UPGRADE_ID };
  }

  // Validation: not already purchased
  const alreadyPurchased = gameState$.purchasedUpgrades.get().includes(upgradeId);
  if (alreadyPurchased) {
    return { success: false, error: PurchaseError.ALREADY_PURCHASED };
  }

  // Validation: sufficient scrap
  const currentScrap = gameState$.scrap.get();
  if (currentScrap < upgrade.scrapCost) {
    return { success: false, error: PurchaseError.INSUFFICIENT_SCRAP };
  }

  // Atomic transaction: deduct scrap and record purchase
  try {
    gameState$.scrap.set(prev => prev - upgrade.scrapCost);
    gameState$.purchasedUpgrades.set(prev => [...prev, upgradeId]);

    return { success: true };
  } catch (error) {
    console.error('Purchase transaction failed:', error);
    return { success: false, error: PurchaseError.PERSISTENCE_FAILED };
  }
}

/**
 * Check if player can afford an upgrade
 * @param upgradeId - Unique upgrade identifier
 * @returns True if player has sufficient scrap
 */
export function canAffordUpgrade(upgradeId: string): boolean {
  const upgrade = gameState$.upgrades.get().find(u => u.id === upgradeId);
  if (!upgrade) return false;

  const currentScrap = gameState$.scrap.get();
  return currentScrap >= upgrade.scrapCost;
}

/**
 * Check if upgrade is already purchased
 * @param upgradeId - Unique upgrade identifier
 * @returns True if upgrade is owned
 */
export function isUpgradePurchased(upgradeId: string): boolean {
  return gameState$.purchasedUpgrades.get().includes(upgradeId);
}

/**
 * Get human-readable error message for purchase failure
 * @param error - Purchase error enum value
 * @returns User-friendly error message
 */
export function getPurchaseErrorMessage(error?: PurchaseError): string {
  switch (error) {
    case PurchaseError.INSUFFICIENT_SCRAP:
      return "Not enough scrap to purchase this upgrade.";
    case PurchaseError.ALREADY_PURCHASED:
      return "You already own this upgrade.";
    case PurchaseError.INVALID_UPGRADE_ID:
      return "Upgrade not found. Please restart the app.";
    case PurchaseError.PERSISTENCE_FAILED:
      return "Purchase successful, but failed to save. Your purchase may be lost.";
    default:
      return "An unknown error occurred.";
  }
}

/**
 * Initialize purchases from storage on app launch
 */
export async function initializePurchases(): Promise<void> {
  try {
    const savedPurchases = await loadPurchases();
    gameState$.purchasedUpgrades.set(savedPurchases);
  } catch (error) {
    console.error('Failed to initialize purchases:', error);
    gameState$.purchasedUpgrades.set([]);
  }
}

// Auto-persist purchases when they change (with debounce)
gameState$.purchasedUpgrades.onChange((changes) => {
  const newPurchases = changes.value;
  savePurchases(newPurchases).catch(error => {
    console.error('Failed to persist purchases:', error);
  });
});

// Re-export Upgrade type for backwards compatibility
export type { Upgrade };
