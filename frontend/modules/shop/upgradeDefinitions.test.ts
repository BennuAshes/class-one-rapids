import { UPGRADE_DEFINITIONS, Upgrade } from './upgradeDefinitions';

describe('Upgrade Definitions', () => {
  test('all upgrades have unique IDs', () => {
    const ids = UPGRADE_DEFINITIONS.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('all upgrades have required fields', () => {
    UPGRADE_DEFINITIONS.forEach(upgrade => {
      expect(upgrade.id).toBeDefined();
      expect(upgrade.name).toBeDefined();
      expect(upgrade.description).toBeDefined();
      expect(upgrade.cost).toBeDefined();
      expect(upgrade.effectType).toBeDefined();
      expect(upgrade.effectValue).toBeDefined();
    });
  });

  test('all costs are positive numbers', () => {
    UPGRADE_DEFINITIONS.forEach(upgrade => {
      expect(upgrade.cost).toBeGreaterThan(0);
      expect(typeof upgrade.cost).toBe('number');
    });
  });

  test('all effectValues are valid', () => {
    UPGRADE_DEFINITIONS.forEach(upgrade => {
      if (upgrade.effectType === 'scrapMultiplier') {
        expect(upgrade.effectValue).toBeGreaterThan(0);
        expect(upgrade.effectValue).toBeLessThan(1);
      } else if (upgrade.effectType === 'petBonus') {
        expect(upgrade.effectValue).toBeGreaterThan(0);
        expect(Number.isInteger(upgrade.effectValue)).toBe(true);
      }
    });
  });

  test('contains at least one scrapMultiplier upgrade', () => {
    const scrapUpgrades = UPGRADE_DEFINITIONS.filter(
      u => u.effectType === 'scrapMultiplier'
    );
    expect(scrapUpgrades.length).toBeGreaterThan(0);
  });

  test('contains at least one petBonus upgrade', () => {
    const petUpgrades = UPGRADE_DEFINITIONS.filter(
      u => u.effectType === 'petBonus'
    );
    expect(petUpgrades.length).toBeGreaterThan(0);
  });
});
