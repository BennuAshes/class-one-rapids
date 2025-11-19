import { Upgrade } from '../../shared/types/game';

/**
 * Complete array of all upgrades available in the game.
 *
 * This defines the core upgrades available in the shop:
 * - 3 scrap efficiency upgrades (10%, 15%, 25% multipliers)
 * - 2 pet acquisition upgrades (+1, +2 pet bonuses)
 * - 1 combination unlock upgrade
 * - 2 singularity rate multiplier upgrades
 *
 * Total investment: ~15,000 scrap
 * Maximum effects: 50% scrap multiplier, +3 pets per feed, 75% faster singularity
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
  {
    id: 'unlock-combination',
    name: 'Quantum Entanglement',
    description: 'Unlock the ability to combine 10 AI Pets into 1 Big Pet. Big Pets have higher singularity rates!',
    cost: 500,
    effectType: 'unlockCombination',
    effectValue: 1,
    category: 'petCombination',
  },
  {
    id: 'singularity-rate-1',
    name: 'Singularity Accelerator',
    description: 'Increase the rate at which pets transition to higher states by 25%.',
    cost: 2500,
    effectType: 'singularityRateMultiplier',
    effectValue: 0.25,
    category: 'singularityAcceleration',
  },
  {
    id: 'singularity-rate-2',
    name: 'Singularity Overdrive',
    description: 'Further increase the singularity transition rate by an additional 50%.',
    cost: 7500,
    effectType: 'singularityRateMultiplier',
    effectValue: 0.5,
    category: 'singularityAcceleration',
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
 * @param category - The category to filter by
 * @returns Array of upgrades in the specified category
 *
 * @example
 * ```typescript
 * const scrapUpgrades = getUpgradesByCategory('scrapEfficiency');
 * console.log(scrapUpgrades.length); // 3
 * ```
 */
export function getUpgradesByCategory(
  category: 'scrapEfficiency' | 'petAcquisition' | 'petCombination' | 'singularityAcceleration'
): Upgrade[] {
  return UPGRADES.filter(u => u.category === category);
}

/**
 * Retrieves all upgrades of a specific effect type.
 *
 * @param effectType - The effect type to filter by
 * @returns Array of upgrades with the specified effect type
 *
 * @example
 * ```typescript
 * const multiplierUpgrades = getUpgradesByEffectType('scrapMultiplier');
 * console.log(multiplierUpgrades.length); // 3
 * ```
 */
export function getUpgradesByEffectType(
  effectType: 'scrapMultiplier' | 'petBonus' | 'singularityRateMultiplier' | 'unlockCombination'
): Upgrade[] {
  return UPGRADES.filter(u => u.effectType === effectType);
}
