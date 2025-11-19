import { UPGRADES, getUpgradeById, getUpgradesByCategory, getUpgradesByEffectType } from './upgradeDefinitions';
import { Upgrade } from '../../shared/types/game';

describe('UPGRADES', () => {
  describe('Data Integrity', () => {
    test('exports exactly 5 upgrades', () => {
      expect(UPGRADES).toHaveLength(5);
    });

    test('all upgrades have unique IDs', () => {
      const ids = UPGRADES.map(u => u.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('all upgrades have required properties', () => {
      UPGRADES.forEach(upgrade => {
        expect(upgrade.id).toBeTruthy();
        expect(typeof upgrade.id).toBe('string');
        expect(upgrade.name).toBeTruthy();
        expect(typeof upgrade.name).toBe('string');
        expect(upgrade.cost).toBeTruthy();
        expect(typeof upgrade.cost).toBe('number');
        expect(upgrade.cost).toBeGreaterThan(0);
        expect(upgrade.effectType).toBeTruthy();
        expect(['scrapMultiplier', 'petBonus']).toContain(upgrade.effectType);
        expect(upgrade.effectValue).toBeTruthy();
        expect(typeof upgrade.effectValue).toBe('number');
        expect(upgrade.effectValue).toBeGreaterThan(0);
      });
    });

    test('all upgrades have valid categories', () => {
      UPGRADES.forEach(upgrade => {
        expect(['scrapEfficiency', 'petAcquisition']).toContain(upgrade.category);
      });
    });
  });

  describe('Scrap Efficiency Upgrades', () => {
    test('scrap-boost-1 has correct values', () => {
      const upgrade = UPGRADES.find(u => u.id === 'scrap-boost-1');

      expect(upgrade).toBeDefined();
      expect(upgrade?.name).toBe('Scrap Finder');
      expect(upgrade?.cost).toBe(100);
      expect(upgrade?.effectType).toBe('scrapMultiplier');
      expect(upgrade?.effectValue).toBe(0.1);
      expect(upgrade?.category).toBe('scrapEfficiency');
    });

    test('scrap-boost-2 has correct values', () => {
      const upgrade = UPGRADES.find(u => u.id === 'scrap-boost-2');

      expect(upgrade).toBeDefined();
      expect(upgrade?.name).toBe('Scrap Magnet');
      expect(upgrade?.cost).toBe(500);
      expect(upgrade?.effectType).toBe('scrapMultiplier');
      expect(upgrade?.effectValue).toBe(0.15);
      expect(upgrade?.category).toBe('scrapEfficiency');
    });

    test('scrap-boost-3 has correct values', () => {
      const upgrade = UPGRADES.find(u => u.id === 'scrap-boost-3');

      expect(upgrade).toBeDefined();
      expect(upgrade?.name).toBe('Scrap Amplifier');
      expect(upgrade?.cost).toBe(2000);
      expect(upgrade?.effectType).toBe('scrapMultiplier');
      expect(upgrade?.effectValue).toBe(0.25);
      expect(upgrade?.category).toBe('scrapEfficiency');
    });

    test('scrap efficiency path totals', () => {
      const scrapUpgrades = UPGRADES.filter(u => u.effectType === 'scrapMultiplier');

      expect(scrapUpgrades).toHaveLength(3);

      const totalCost = scrapUpgrades.reduce((sum, u) => sum + u.cost, 0);
      expect(totalCost).toBe(2600); // 100 + 500 + 2000

      const totalEffect = scrapUpgrades.reduce((sum, u) => sum + u.effectValue, 0);
      expect(totalEffect).toBeCloseTo(0.5, 5); // 0.1 + 0.15 + 0.25
    });
  });

  describe('Pet Acquisition Upgrades', () => {
    test('pet-boost-1 has correct values', () => {
      const upgrade = UPGRADES.find(u => u.id === 'pet-boost-1');

      expect(upgrade).toBeDefined();
      expect(upgrade?.name).toBe('Extra Feed');
      expect(upgrade?.cost).toBe(200);
      expect(upgrade?.effectType).toBe('petBonus');
      expect(upgrade?.effectValue).toBe(1);
      expect(upgrade?.category).toBe('petAcquisition');
    });

    test('pet-boost-2 has correct values', () => {
      const upgrade = UPGRADES.find(u => u.id === 'pet-boost-2');

      expect(upgrade).toBeDefined();
      expect(upgrade?.name).toBe('Double Feed');
      expect(upgrade?.cost).toBe(1000);
      expect(upgrade?.effectType).toBe('petBonus');
      expect(upgrade?.effectValue).toBe(2);
      expect(upgrade?.category).toBe('petAcquisition');
    });

    test('pet acquisition path totals', () => {
      const petUpgrades = UPGRADES.filter(u => u.effectType === 'petBonus');

      expect(petUpgrades).toHaveLength(2);

      const totalCost = petUpgrades.reduce((sum, u) => sum + u.cost, 0);
      expect(totalCost).toBe(1200); // 200 + 1000

      const totalEffect = petUpgrades.reduce((sum, u) => sum + u.effectValue, 0);
      expect(totalEffect).toBe(3); // 1 + 2
    });
  });

  describe('Balance Validation', () => {
    test('total investment for all upgrades', () => {
      const totalCost = UPGRADES.reduce((sum, u) => sum + u.cost, 0);
      expect(totalCost).toBe(3800); // 100 + 500 + 2000 + 200 + 1000
    });

    test('costs follow progression curve', () => {
      const scrapUpgrades = UPGRADES.filter(u => u.effectType === 'scrapMultiplier')
        .sort((a, b) => a.cost - b.cost);
      const petUpgrades = UPGRADES.filter(u => u.effectType === 'petBonus')
        .sort((a, b) => a.cost - b.cost);

      // Each scrap upgrade should cost more than the previous
      for (let i = 1; i < scrapUpgrades.length; i++) {
        expect(scrapUpgrades[i].cost).toBeGreaterThan(scrapUpgrades[i - 1].cost);
      }

      // Each pet upgrade should cost more than the previous
      for (let i = 1; i < petUpgrades.length; i++) {
        expect(petUpgrades[i].cost).toBeGreaterThan(petUpgrades[i - 1].cost);
      }
    });
  });

  describe('Helper Functions', () => {
    describe('getUpgradeById', () => {
      test('returns upgrade when ID exists', () => {
        const upgrade = getUpgradeById('scrap-boost-1');
        expect(upgrade).toBeDefined();
        expect(upgrade?.id).toBe('scrap-boost-1');
        expect(upgrade?.name).toBe('Scrap Finder');
      });

      test('returns undefined when ID does not exist', () => {
        const upgrade = getUpgradeById('non-existent-id');
        expect(upgrade).toBeUndefined();
      });
    });

    describe('getUpgradesByCategory', () => {
      test('returns scrap efficiency upgrades', () => {
        const upgrades = getUpgradesByCategory('scrapEfficiency');
        expect(upgrades).toHaveLength(3);
        upgrades.forEach(u => {
          expect(u.category).toBe('scrapEfficiency');
          expect(u.effectType).toBe('scrapMultiplier');
        });
      });

      test('returns pet acquisition upgrades', () => {
        const upgrades = getUpgradesByCategory('petAcquisition');
        expect(upgrades).toHaveLength(2);
        upgrades.forEach(u => {
          expect(u.category).toBe('petAcquisition');
          expect(u.effectType).toBe('petBonus');
        });
      });
    });

    describe('getUpgradesByEffectType', () => {
      test('returns scrap multiplier upgrades', () => {
        const upgrades = getUpgradesByEffectType('scrapMultiplier');
        expect(upgrades).toHaveLength(3);
        upgrades.forEach(u => {
          expect(u.effectType).toBe('scrapMultiplier');
        });
      });

      test('returns pet bonus upgrades', () => {
        const upgrades = getUpgradesByEffectType('petBonus');
        expect(upgrades).toHaveLength(2);
        upgrades.forEach(u => {
          expect(u.effectType).toBe('petBonus');
        });
      });
    });
  });
});
