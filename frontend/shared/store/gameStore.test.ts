import {
  gameState$,
  scrapRate$,
  availableUpgrades$,
  getScrapMultiplier,
  Upgrade,
  totalScrapBonus$,
  totalPetBonus$,
  purchaseUpgrade,
  canAffordUpgrade,
  isUpgradePurchased,
  getPurchaseErrorMessage,
  initializePurchases
} from './gameStore';
import { UPGRADE_DEFINITIONS } from '../../modules/upgrades/upgradeDefinitions';
import { PurchaseError } from '../../modules/upgrades/types';
import { loadPurchases, savePurchases } from './persistence';

// Mock persistence module
jest.mock('./persistence');

describe('gameStore', () => {
  beforeEach(() => {
    // Reset state before each test for isolation
    gameState$.petCount.set(0);
    gameState$.scrap.set(0);
    gameState$.upgrades.set([]);
    gameState$.purchasedUpgrades.set([]);

    // Mock savePurchases to return a resolved promise by default
    (savePurchases as jest.Mock).mockResolvedValue(undefined);
  });

  describe('gameState$ observable', () => {
    test('initializes with zero pet count', () => {
      expect(gameState$.petCount.get()).toBe(0);
    });

    test('initializes with zero scrap', () => {
      expect(gameState$.scrap.get()).toBe(0);
    });

    test('allows setting pet count', () => {
      gameState$.petCount.set(5);
      expect(gameState$.petCount.get()).toBe(5);
    });

    test('allows setting scrap', () => {
      gameState$.scrap.set(100);
      expect(gameState$.scrap.get()).toBe(100);
    });

    test('supports functional updates for pet count', () => {
      gameState$.petCount.set(10);
      gameState$.petCount.set(prev => prev + 5);
      expect(gameState$.petCount.get()).toBe(15);
    });

    test('supports functional updates for scrap', () => {
      gameState$.scrap.set(50);
      gameState$.scrap.set(prev => prev + 25);
      expect(gameState$.scrap.get()).toBe(75);
    });
  });

  describe('scrapRate$ computed observable', () => {
    test('returns 0 when pet count is 0', () => {
      gameState$.petCount.set(0);
      expect(scrapRate$.get()).toBe(0);
    });

    test('returns pet count when multiplier is 1', () => {
      gameState$.petCount.set(10);
      expect(scrapRate$.get()).toBe(10);
    });

    test('automatically recomputes when pet count changes', () => {
      gameState$.petCount.set(5);
      expect(scrapRate$.get()).toBe(5);

      gameState$.petCount.set(15);
      expect(scrapRate$.get()).toBe(15);
    });

    test('floors fractional results', () => {
      // Base multiplier is 1, so this tests Math.floor behavior
      gameState$.petCount.set(7);
      expect(scrapRate$.get()).toBe(7); // Math.floor(7 * 1) = 7
    });
  });

  describe('Shop State', () => {
    beforeEach(() => {
      gameState$.upgrades.set([]);
      gameState$.purchasedUpgrades.set([]);
    });

    test('initializes with empty upgrades array', () => {
      expect(gameState$.upgrades.get()).toEqual([]);
    });

    test('initializes with empty purchased upgrades array', () => {
      expect(gameState$.purchasedUpgrades.get()).toEqual([]);
    });

    test('allows setting upgrade definitions', () => {
      const mockUpgrades: Upgrade[] = [
        {
          id: 'upgrade-1',
          name: 'Scrap Booster I',
          description: 'Increases scrap generation by 50%',
          scrapCost: 100,
          type: 'scrap-per-pet',
          effectValue: 0.5,
        },
      ];

      gameState$.upgrades.set(mockUpgrades);
      expect(gameState$.upgrades.get()).toEqual(mockUpgrades);
    });

    test('allows adding purchased upgrade IDs', () => {
      gameState$.purchasedUpgrades.set(['upgrade-1']);
      expect(gameState$.purchasedUpgrades.get()).toContain('upgrade-1');
    });
  });

  describe('availableUpgrades$ computed', () => {
    test('returns all upgrades when none purchased', () => {
      const mockUpgrades: Upgrade[] = [
        { id: 'up-1', name: 'Test', description: '', scrapCost: 10, type: 'scrap-per-pet', effectValue: 1 },
        { id: 'up-2', name: 'Test 2', description: '', scrapCost: 20, type: 'pets-per-feed', effectValue: 1 },
      ];

      gameState$.upgrades.set(mockUpgrades);
      gameState$.purchasedUpgrades.set([]);

      expect(availableUpgrades$.get()).toEqual(mockUpgrades);
    });

    test('filters out purchased upgrades', () => {
      const mockUpgrades: Upgrade[] = [
        { id: 'up-1', name: 'Test', description: '', scrapCost: 10, type: 'scrap-per-pet', effectValue: 1 },
        { id: 'up-2', name: 'Test 2', description: '', scrapCost: 20, type: 'pets-per-feed', effectValue: 1 },
      ];

      gameState$.upgrades.set(mockUpgrades);
      gameState$.purchasedUpgrades.set(['up-1']);

      const available = availableUpgrades$.get();
      expect(available).toHaveLength(1);
      expect(available[0].id).toBe('up-2');
    });

    test('returns empty array when all upgrades purchased', () => {
      const mockUpgrades: Upgrade[] = [
        { id: 'up-1', name: 'Test', description: '', scrapCost: 10, type: 'scrap-per-pet', effectValue: 1 },
      ];

      gameState$.upgrades.set(mockUpgrades);
      gameState$.purchasedUpgrades.set(['up-1']);

      expect(availableUpgrades$.get()).toEqual([]);
    });

    test('returns empty array when no upgrades exist', () => {
      gameState$.upgrades.set([]);
      gameState$.purchasedUpgrades.set([]);

      expect(availableUpgrades$.get()).toEqual([]);
    });
  });

  describe('getScrapMultiplier (legacy tests)', () => {
    beforeEach(() => {
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('returns 1.0 baseline when no upgrades purchased', () => {
      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.0);
    });

    test('returns 1.0 when no upgrades exist', () => {
      gameState$.upgrades.set([]);
      gameState$.purchasedUpgrades.set([]);

      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.0);
    });

    test('ignores petBonus upgrades', () => {
      gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);

      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.0);
    });

    test('calculates correct multiplier with one scrapMultiplier upgrade', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1']); // +0.1

      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.1);
    });

    test('calculates correct multiplier with multiple scrapMultiplier upgrades', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2']); // +0.1 + 0.15

      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.25);
    });

    test('only counts purchased upgrades', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1']); // Only purchased first one

      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.1);
    });
  });

  describe('scrapRate$ with upgrades', () => {
    beforeEach(() => {
      gameState$.petCount.set(0);
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('uses baseline multiplier when no upgrades', () => {
      gameState$.petCount.set(10);

      const rate = scrapRate$.get();
      expect(rate).toBe(10); // 10 pets * 1.0 multiplier
    });

    test('uses upgraded multiplier when scrapMultiplier purchased', () => {
      gameState$.petCount.set(10);
      gameState$.purchasedUpgrades.set(['scrap-boost-1']); // +0.1 = 1.1x multiplier

      const rate = scrapRate$.get();
      expect(rate).toBe(11); // 10 pets * 1.1 multiplier
    });

    test('scrapRate$ updates reactively when upgrade purchased', () => {
      gameState$.petCount.set(10);

      const rateBefore = scrapRate$.get();
      expect(rateBefore).toBe(10); // No upgrades yet

      gameState$.purchasedUpgrades.set(['scrap-boost-2']); // +0.15 = 1.15x multiplier

      const rateAfter = scrapRate$.get();
      expect(rateAfter).toBe(11); // Math.floor(10 * 1.15) = 11
    });
  });

  describe('Upgrade State', () => {
    beforeEach(() => {
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('initializes with upgrade definitions', () => {
      expect(gameState$.upgrades.get()).toHaveLength(5);
    });

    test('initializes with empty purchased upgrades', () => {
      expect(gameState$.purchasedUpgrades.get()).toEqual([]);
    });

    test('allows adding purchased upgrade IDs', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1']);
      expect(gameState$.purchasedUpgrades.get()).toContain('scrap-boost-1');
    });

    test('upgrades observable is reactive', () => {
      const upgrades = gameState$.upgrades.get();
      expect(upgrades).toBe(UPGRADE_DEFINITIONS);
    });
  });

  describe('totalScrapBonus$', () => {
    beforeEach(() => {
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('returns 0 when no upgrades purchased', () => {
      expect(totalScrapBonus$.get()).toBe(0);
    });

    test('calculates bonus from single scrap upgrade', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1']); // +0.1
      expect(totalScrapBonus$.get()).toBe(0.1);
    });

    test('sums multiple scrap upgrades', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2']); // +0.1 + 0.15
      expect(totalScrapBonus$.get()).toBe(0.25);
    });

    test('ignores pet upgrades', () => {
      gameState$.purchasedUpgrades.set(['pet-boost-1']);
      expect(totalScrapBonus$.get()).toBe(0);
    });

    test('updates reactively when purchases change', () => {
      expect(totalScrapBonus$.get()).toBe(0);

      gameState$.purchasedUpgrades.set(['scrap-boost-1']);
      expect(totalScrapBonus$.get()).toBe(0.1);

      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-3']);
      expect(totalScrapBonus$.get()).toBe(0.35); // 0.1 + 0.25
    });

    test('calculates all three scrap upgrades correctly', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2', 'scrap-boost-3']);
      expect(totalScrapBonus$.get()).toBe(0.5); // 0.1 + 0.15 + 0.25
    });
  });

  describe('totalPetBonus$', () => {
    beforeEach(() => {
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('returns 0 when no upgrades purchased', () => {
      expect(totalPetBonus$.get()).toBe(0);
    });

    test('calculates bonus from single pet upgrade', () => {
      gameState$.purchasedUpgrades.set(['pet-boost-1']); // +1
      expect(totalPetBonus$.get()).toBe(1);
    });

    test('sums multiple pet upgrades', () => {
      gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']); // +1 + 2
      expect(totalPetBonus$.get()).toBe(3);
    });

    test('ignores scrap upgrades', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1']);
      expect(totalPetBonus$.get()).toBe(0);
    });

    test('updates reactively when purchases change', () => {
      expect(totalPetBonus$.get()).toBe(0);

      gameState$.purchasedUpgrades.set(['pet-boost-1']);
      expect(totalPetBonus$.get()).toBe(1);

      gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);
      expect(totalPetBonus$.get()).toBe(3);
    });
  });

  describe('getScrapMultiplier with upgrades', () => {
    beforeEach(() => {
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('returns 1.0 baseline when no upgrades', () => {
      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.0);
    });

    test('returns 1.1 with 10% upgrade', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1']);
      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.1);
    });

    test('returns 1.5 with all scrap upgrades', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2', 'scrap-boost-3']);
      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.5); // 1.0 + 0.1 + 0.15 + 0.25
    });

    test('ignores pet upgrades', () => {
      gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);
      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.0);
    });
  });

  describe('purchaseUpgrade', () => {
    beforeEach(() => {
      gameState$.scrap.set(1000);
      gameState$.purchasedUpgrades.set([]);
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
    });

    test('successfully purchases upgrade with sufficient scrap', async () => {
      const result = await purchaseUpgrade('scrap-boost-1');

      expect(result.success).toBe(true);
      expect(gameState$.scrap.get()).toBe(900); // 1000 - 100
      expect(gameState$.purchasedUpgrades.get()).toContain('scrap-boost-1');
    });

    test('fails with insufficient scrap', async () => {
      gameState$.scrap.set(50); // Less than 100 needed

      const result = await purchaseUpgrade('scrap-boost-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe(PurchaseError.INSUFFICIENT_SCRAP);
      expect(gameState$.scrap.get()).toBe(50); // No change
      expect(gameState$.purchasedUpgrades.get()).toEqual([]); // No change
    });

    test('fails if already purchased', async () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1']);

      const result = await purchaseUpgrade('scrap-boost-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe(PurchaseError.ALREADY_PURCHASED);
      expect(gameState$.scrap.get()).toBe(1000); // No deduction
    });

    test('fails with invalid upgrade ID', async () => {
      const result = await purchaseUpgrade('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe(PurchaseError.INVALID_UPGRADE_ID);
    });

    test('deducts exact scrap cost', async () => {
      await purchaseUpgrade('scrap-boost-2'); // Costs 500

      expect(gameState$.scrap.get()).toBe(500); // 1000 - 500
    });

    test('can purchase multiple upgrades sequentially', async () => {
      await purchaseUpgrade('scrap-boost-1'); // -100
      await purchaseUpgrade('pet-boost-1');   // -200

      expect(gameState$.scrap.get()).toBe(700); // 1000 - 100 - 200
      expect(gameState$.purchasedUpgrades.get()).toEqual(['scrap-boost-1', 'pet-boost-1']);
    });

    test('purchase updates totalScrapBonus$', async () => {
      expect(totalScrapBonus$.get()).toBe(0);

      await purchaseUpgrade('scrap-boost-1');

      expect(totalScrapBonus$.get()).toBe(0.1);
    });

    test('purchase updates totalPetBonus$', async () => {
      expect(totalPetBonus$.get()).toBe(0);

      await purchaseUpgrade('pet-boost-1');

      expect(totalPetBonus$.get()).toBe(1);
    });
  });

  describe('Purchase Helper Functions', () => {
    beforeEach(() => {
      gameState$.scrap.set(500);
      gameState$.purchasedUpgrades.set(['scrap-boost-1']);
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
    });

    describe('canAffordUpgrade', () => {
      test('returns true when player can afford upgrade', () => {
        expect(canAffordUpgrade('scrap-boost-1')).toBe(true); // Costs 100, have 500
      });

      test('returns false when player cannot afford upgrade', () => {
        expect(canAffordUpgrade('scrap-boost-3')).toBe(false); // Costs 2000, have 500
      });

      test('returns false for invalid upgrade ID', () => {
        expect(canAffordUpgrade('invalid-id')).toBe(false);
      });
    });

    describe('isUpgradePurchased', () => {
      test('returns true for purchased upgrade', () => {
        expect(isUpgradePurchased('scrap-boost-1')).toBe(true);
      });

      test('returns false for unpurchased upgrade', () => {
        expect(isUpgradePurchased('scrap-boost-2')).toBe(false);
      });

      test('returns false for invalid upgrade ID', () => {
        expect(isUpgradePurchased('invalid-id')).toBe(false);
      });
    });

    describe('getPurchaseErrorMessage', () => {
      test('returns message for insufficient scrap', () => {
        const message = getPurchaseErrorMessage(PurchaseError.INSUFFICIENT_SCRAP);
        expect(message).toMatch(/not enough scrap/i);
      });

      test('returns message for already purchased', () => {
        const message = getPurchaseErrorMessage(PurchaseError.ALREADY_PURCHASED);
        expect(message).toMatch(/already own/i);
      });

      test('returns message for invalid upgrade ID', () => {
        const message = getPurchaseErrorMessage(PurchaseError.INVALID_UPGRADE_ID);
        expect(message).toMatch(/not found/i);
      });

      test('returns message for persistence failed', () => {
        const message = getPurchaseErrorMessage(PurchaseError.PERSISTENCE_FAILED);
        expect(message).toMatch(/failed to save/i);
      });

      test('returns default message for undefined error', () => {
        const message = getPurchaseErrorMessage(undefined);
        expect(message).toMatch(/unknown error/i);
      });
    });
  });

  describe('Persistence Integration', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    describe('initializePurchases', () => {
      test('loads purchases from storage', async () => {
        (loadPurchases as jest.Mock).mockResolvedValue(['scrap-boost-1', 'pet-boost-1']);

        await initializePurchases();

        expect(loadPurchases).toHaveBeenCalled();
        expect(gameState$.purchasedUpgrades.get()).toEqual(['scrap-boost-1', 'pet-boost-1']);
      });

      test('handles empty storage gracefully', async () => {
        (loadPurchases as jest.Mock).mockResolvedValue([]);

        await initializePurchases();

        expect(gameState$.purchasedUpgrades.get()).toEqual([]);
      });

      test('handles load errors gracefully', async () => {
        (loadPurchases as jest.Mock).mockRejectedValue(new Error('Load failed'));

        await expect(initializePurchases()).resolves.not.toThrow();
        expect(gameState$.purchasedUpgrades.get()).toEqual([]);
      });
    });
  });
});
