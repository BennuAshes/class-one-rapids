/**
 * Upgrade data model for shop system
 *
 * Supports two effect types:
 * - scrapPerPet: Increases scrap gained per pet action
 * - petsPerFeed: Increases pets gained per feed action
 */
export interface Upgrade {
  /** Unique identifier (UUID or timestamp-based) */
  id: string;

  /** Display name shown in shop UI */
  name: string;

  /** User-facing description of upgrade effect */
  description: string;

  /** Scrap cost to purchase (positive integer) */
  cost: number;

  /** Type of gameplay effect */
  effectType: 'scrapPerPet' | 'petsPerFeed';

  /** Magnitude of effect (additive with other upgrades) */
  effectValue: number;

  // Future expansion fields (optional)
  iconName?: string;
  prerequisiteIds?: string[];
  maxPurchases?: number;
  tier?: number;
}

/**
 * Valid upgrade effect types
 */
export type UpgradeEffectType = 'scrapPerPet' | 'petsPerFeed';

/**
 * Type guard for validating upgrade effect types
 */
export function isValidEffectType(type: string): type is UpgradeEffectType {
  return type === 'scrapPerPet' || type === 'petsPerFeed';
}
