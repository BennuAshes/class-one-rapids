import { observable } from '@legendapp/state';

interface PrestigeUpgrade {
  id: string;
  name: string;
  cost: number;
  multiplier: number;
  purchased: boolean;
}

export const prestigeState$ = observable({
  level: 0,
  points: 0,
  totalPointsEarned: 0,
  upgrades: [] as PrestigeUpgrade[],
  
  // Computed values for prestige system
  nextLevelRequirement: () => {
    const currentLevel = prestigeState$.level.get();
    return Math.floor(1000 * Math.pow(1.5, currentLevel));
  },
  
  availableUpgrades: () => {
    return prestigeState$.upgrades.get().filter(
      upgrade => !upgrade.purchased && prestigeState$.points.get() >= upgrade.cost
    );
  },
  
  totalMultiplier: () => {
    return prestigeState$.upgrades.get()
      .filter(upgrade => upgrade.purchased)
      .reduce((total, upgrade) => total * upgrade.multiplier, 1);
  }
});