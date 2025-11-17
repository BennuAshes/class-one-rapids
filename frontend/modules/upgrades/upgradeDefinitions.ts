import { Upgrade, UpgradeCategory } from './types';

/**
 * Complete catalog of all upgrades in the game
 * Immutable and exhaustive
 */
export const UPGRADE_DEFINITIONS: Upgrade[] = [
  // Scrap Efficiency Upgrades
  {
    id: 'scrap-boost-1',
    name: 'Scrap Finder',
    description: '+10% scrap generation from AI Pets',
    scrapCost: 100,
    effectType: 'scrapMultiplier',
    effectValue: 0.1,
    category: 'Scrap Efficiency',
  },
  {
    id: 'scrap-boost-2',
    name: 'Scrap Magnet',
    description: '+15% scrap generation from AI Pets',
    scrapCost: 500,
    effectType: 'scrapMultiplier',
    effectValue: 0.15,
    category: 'Scrap Efficiency',
  },
  {
    id: 'scrap-boost-3',
    name: 'Scrap Amplifier',
    description: '+25% scrap generation from AI Pets',
    scrapCost: 2000,
    effectType: 'scrapMultiplier',
    effectValue: 0.25,
    category: 'Scrap Efficiency',
  },
  // Pet Acquisition Upgrades
  {
    id: 'pet-boost-1',
    name: 'Extra Feed',
    description: '+1 AI Pet per feed button press',
    scrapCost: 200,
    effectType: 'petBonus',
    effectValue: 1,
    category: 'Pet Acquisition',
  },
  {
    id: 'pet-boost-2',
    name: 'Double Feed',
    description: '+2 AI Pets per feed button press',
    scrapCost: 1000,
    effectType: 'petBonus',
    effectValue: 2,
    category: 'Pet Acquisition',
  },
];

/**
 * Get upgrade by ID
 * @param id - Upgrade ID
 * @returns Upgrade definition or undefined if not found
 */
export function getUpgradeById(id: string): Upgrade | undefined {
  return UPGRADE_DEFINITIONS.find(u => u.id === id);
}

/**
 * Get upgrades by category
 * @param category - Category to filter by
 * @returns Array of upgrades in category
 */
export function getUpgradesByCategory(category: UpgradeCategory): Upgrade[] {
  return UPGRADE_DEFINITIONS.filter(u => u.category === category);
}
