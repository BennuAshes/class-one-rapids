/**
 * Type of effect an upgrade provides
 * - scrapMultiplier: Percentage bonus to scrap generation (0.1 = +10%)
 * - petBonus: Flat addition to pets gained per feed (1 = +1 pet)
 */
export type UpgradeEffectType = 'scrapMultiplier' | 'petBonus';

/**
 * Category of upgrade for UI grouping
 */
export type UpgradeCategory = 'Scrap Efficiency' | 'Pet Acquisition';

/**
 * Complete upgrade definition
 * Immutable after creation
 */
export interface Upgrade {
  /** Unique identifier (e.g., "scrap-boost-1") */
  id: string;

  /** Display name (e.g., "Scrap Finder") */
  name: string;

  /** Effect description for UI (e.g., "+10% scrap generation from AI Pets") */
  description: string;

  /** Cost in scrap currency */
  scrapCost: number;

  /** Type of effect this upgrade provides */
  effectType: UpgradeEffectType;

  /** Numeric value of effect (meaning depends on effectType) */
  effectValue: number;

  /** Category for UI grouping */
  category: UpgradeCategory;
}

/**
 * Purchase state
 * Persisted to AsyncStorage
 */
export interface PurchaseState {
  /** Array of purchased upgrade IDs */
  purchasedUpgrades: string[];

  /** Version for migration compatibility */
  version: number;

  /** Timestamp of last save */
  timestamp?: number;
}

/**
 * Purchase result
 * Returned from purchase transaction
 */
export interface PurchaseResult {
  success: boolean;
  error?: PurchaseError;
}

/**
 * Purchase error types
 */
export enum PurchaseError {
  INSUFFICIENT_SCRAP = 'INSUFFICIENT_SCRAP',
  ALREADY_PURCHASED = 'ALREADY_PURCHASED',
  INVALID_UPGRADE_ID = 'INVALID_UPGRADE_ID',
  PERSISTENCE_FAILED = 'PERSISTENCE_FAILED',
}
