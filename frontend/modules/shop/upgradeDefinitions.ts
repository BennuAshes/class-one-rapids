import { Upgrade } from '../../shared/types/game';

/**
 * Complete array of all upgrades available in the game.
 *
 * This defines the 5 core upgrades available in the shop:
 * - 3 scrap efficiency upgrades (10%, 15%, 25% multipliers)
 * - 2 pet acquisition upgrades (+1, +2 pet bonuses)
 *
 * Total investment: 3,800 scrap
 * Maximum effects: 50% scrap multiplier, +3 pets per feed
 */
export const UPGRADES: Upgrade[] = [
  {
    id: 'scrap-boost-1',
    name: 'Scrap Finder',
    description: 'Your AI Pets are better at finding scrap. Increases scrap generation by 10%.',
    cost: 100,
    effectType: 'scrapMultiplier',
    effectValue: 0.1,
    category: 'scrapEfficiency',
  },
  {
    id: 'scrap-boost-2',
    name: 'Scrap Magnet',
    description: 'Your AI Pets attract more scrap. Increases scrap generation by 15%.',
    cost: 500,
    effectType: 'scrapMultiplier',
    effectValue: 0.15,
    category: 'scrapEfficiency',
  },
  {
    id: 'scrap-boost-3',
    name: 'Scrap Amplifier',
    description: 'Your AI Pets generate scrap more efficiently. Increases scrap generation by 25%.',
    cost: 2000,
    effectType: 'scrapMultiplier',
    effectValue: 0.25,
    category: 'scrapEfficiency',
  },
  {
    id: 'pet-boost-1',
    name: 'Extra Feed',
    description: 'Each feed gives you one additional AI Pet.',
    cost: 200,
    effectType: 'petBonus',
    effectValue: 1,
    category: 'petAcquisition',
  },
  {
    id: 'pet-boost-2',
    name: 'Double Feed',
    description: 'Each feed gives you two additional AI Pets.',
    cost: 1000,
    effectType: 'petBonus',
    effectValue: 2,
    category: 'petAcquisition',
  },
];

/**
 * Retrieves an upgrade by its unique ID.
 *
 * @param id - The unique identifier of the upgrade to find
 * @returns The upgrade if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const upgrade = getUpgradeById('scrap-boost-1');
 * if (upgrade) {
 *   console.log(upgrade.name); // "Scrap Finder"
 * }
 * ```
 */
export function getUpgradeById(id: string): Upgrade | undefined {
  return UPGRADES.find(u => u.id === id);
}

/**
 * Retrieves all upgrades of a specific category.
 *
 * @param category - The category to filter by ('scrapEfficiency' or 'petAcquisition')
 * @returns Array of upgrades in the specified category
 *
 * @example
 * ```typescript
 * const scrapUpgrades = getUpgradesByCategory('scrapEfficiency');
 * console.log(scrapUpgrades.length); // 3
 * ```
 */
export function getUpgradesByCategory(
  category: 'scrapEfficiency' | 'petAcquisition'
): Upgrade[] {
  return UPGRADES.filter(u => u.category === category);
}

/**
 * Retrieves all upgrades of a specific effect type.
 *
 * @param effectType - The effect type to filter by ('scrapMultiplier' or 'petBonus')
 * @returns Array of upgrades with the specified effect type
 *
 * @example
 * ```typescript
 * const multiplierUpgrades = getUpgradesByEffectType('scrapMultiplier');
 * console.log(multiplierUpgrades.length); // 3
 * ```
 */
export function getUpgradesByEffectType(
  effectType: 'scrapMultiplier' | 'petBonus'
): Upgrade[] {
  return UPGRADES.filter(u => u.effectType === effectType);
}
