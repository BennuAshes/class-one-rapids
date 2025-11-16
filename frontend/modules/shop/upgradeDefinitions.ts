/**
 * Defines an upgrade that can be purchased in the shop.
 */
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effectType: 'scrapMultiplier' | 'petBonus';
  effectValue: number;
  category?: 'scrapEfficiency' | 'petAcquisition';
}

/**
 * All available upgrades in the shop.
 * Centralized data source for easy balancing and extensibility.
 */
export const UPGRADE_DEFINITIONS: Upgrade[] = [
  {
    id: 'scrap-boost-1',
    name: 'Scrap Finder',
    description: '+10% scrap generation from AI Pets',
    cost: 100,
    effectType: 'scrapMultiplier',
    effectValue: 0.1,
    category: 'scrapEfficiency',
  },
  {
    id: 'pet-boost-1',
    name: 'Extra Feed',
    description: '+1 AI Pet per feed button press',
    cost: 200,
    effectType: 'petBonus',
    effectValue: 1,
    category: 'petAcquisition',
  },
  {
    id: 'scrap-boost-2',
    name: 'Scrap Magnet',
    description: '+15% scrap generation from AI Pets',
    cost: 500,
    effectType: 'scrapMultiplier',
    effectValue: 0.15,
    category: 'scrapEfficiency',
  },
  {
    id: 'pet-boost-2',
    name: 'Double Feed',
    description: '+2 AI Pets per feed button press',
    cost: 1000,
    effectType: 'petBonus',
    effectValue: 2,
    category: 'petAcquisition',
  },
  {
    id: 'scrap-boost-3',
    name: 'Scrap Amplifier',
    description: '+25% scrap generation from AI Pets',
    cost: 2000,
    effectType: 'scrapMultiplier',
    effectValue: 0.25,
    category: 'scrapEfficiency',
  },
];
