import { UPGRADE_DEFINITIONS, getUpgradeById, getUpgradesByCategory } from './upgradeDefinitions';

describe('upgradeDefinitions', () => {
  test('exports exactly 5 upgrades', () => {
    expect(UPGRADE_DEFINITIONS).toHaveLength(5);
  });

  test('all upgrades have unique IDs', () => {
    const ids = UPGRADE_DEFINITIONS.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(UPGRADE_DEFINITIONS.length);
  });

  test('all upgrades have required fields', () => {
    UPGRADE_DEFINITIONS.forEach(upgrade => {
      expect(upgrade.id).toBeTruthy();
      expect(upgrade.name).toBeTruthy();
      expect(upgrade.description).toBeTruthy();
      expect(upgrade.scrapCost).toBeGreaterThan(0);
      expect(upgrade.effectType).toMatch(/scrapMultiplier|petBonus/);
      expect(upgrade.effectValue).toBeGreaterThan(0);
      expect(upgrade.category).toMatch(/Scrap Efficiency|Pet Acquisition/);
    });
  });

  test('has 3 scrap efficiency upgrades', () => {
    const scrapUpgrades = UPGRADE_DEFINITIONS.filter(
      u => u.category === 'Scrap Efficiency'
    );
    expect(scrapUpgrades).toHaveLength(3);
  });

  test('has 2 pet acquisition upgrades', () => {
    const petUpgrades = UPGRADE_DEFINITIONS.filter(
      u => u.category === 'Pet Acquisition'
    );
    expect(petUpgrades).toHaveLength(2);
  });

  test('scrap efficiency upgrades have scrapMultiplier effect', () => {
    const scrapUpgrades = UPGRADE_DEFINITIONS.filter(
      u => u.category === 'Scrap Efficiency'
    );
    scrapUpgrades.forEach(upgrade => {
      expect(upgrade.effectType).toBe('scrapMultiplier');
    });
  });

  test('pet acquisition upgrades have petBonus effect', () => {
    const petUpgrades = UPGRADE_DEFINITIONS.filter(
      u => u.category === 'Pet Acquisition'
    );
    petUpgrades.forEach(upgrade => {
      expect(upgrade.effectType).toBe('petBonus');
    });
  });

  test('getUpgradeById returns correct upgrade', () => {
    const upgrade = getUpgradeById('scrap-boost-1');
    expect(upgrade?.name).toBe('Scrap Finder');
    expect(upgrade?.scrapCost).toBe(100);
  });

  test('getUpgradeById returns undefined for invalid ID', () => {
    const upgrade = getUpgradeById('invalid-id');
    expect(upgrade).toBeUndefined();
  });

  test('getUpgradesByCategory returns scrap efficiency upgrades', () => {
    const upgrades = getUpgradesByCategory('Scrap Efficiency');
    expect(upgrades).toHaveLength(3);
    expect(upgrades.every(u => u.category === 'Scrap Efficiency')).toBe(true);
  });

  test('getUpgradesByCategory returns pet acquisition upgrades', () => {
    const upgrades = getUpgradesByCategory('Pet Acquisition');
    expect(upgrades).toHaveLength(2);
    expect(upgrades.every(u => u.category === 'Pet Acquisition')).toBe(true);
  });
});
