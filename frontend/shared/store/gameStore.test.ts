import { gameState$, incrementPetCount, resetPetCount, resetGameState, maxPetCount, isPetCountAtMax, initializeGameState, totalScrapMultiplier$, totalPetBonus$ } from './gameStore';
import { loadGameState, saveGameState } from './persistence';
import { GameState } from '../types/game';
import { UPGRADES } from '../../modules/shop/upgradeDefinitions';

// Mock persistence functions
jest.mock('./persistence');

describe('gameStore', () => {
  beforeEach(() => {
    // Reset state before each test
    resetGameState();
    jest.clearAllMocks();
  });

  describe('gameState$ observable', () => {
    test('initializes with zero pet count', () => {
      expect(gameState$.petCount.get()).toBe(0);
    });

    test('allows setting pet count', () => {
      gameState$.petCount.set(5);
      expect(gameState$.petCount.get()).toBe(5);
    });

    test('supports functional updates', () => {
      gameState$.petCount.set(10);
      gameState$.petCount.set((prev) => prev + 5);
      expect(gameState$.petCount.get()).toBe(15);
    });

    test('initializes with empty scrap', () => {
      expect(gameState$.scrap.get()).toBe(0);
    });

    test('initializes with empty upgrades array', () => {
      expect(gameState$.upgrades.get()).toEqual([]);
    });

    test('initializes with empty purchasedUpgrades array', () => {
      expect(gameState$.purchasedUpgrades.get()).toEqual([]);
    });
  });

  describe('incrementPetCount', () => {
    test('increments by 1 by default', () => {
      incrementPetCount();
      expect(gameState$.petCount.get()).toBe(1);
    });

    test('increments by specified amount', () => {
      incrementPetCount(5);
      expect(gameState$.petCount.get()).toBe(5);
    });

    test('accumulates multiple increments', () => {
      incrementPetCount(3);
      incrementPetCount(7);
      incrementPetCount(2);
      expect(gameState$.petCount.get()).toBe(12);
    });
  });

  describe('resetPetCount', () => {
    test('resets pet count to zero', () => {
      gameState$.petCount.set(100);
      resetPetCount();
      expect(gameState$.petCount.get()).toBe(0);
    });

    test('resets from non-zero value', () => {
      gameState$.petCount.set(42);
      resetPetCount();
      expect(gameState$.petCount.get()).toBe(0);
    });
  });

  describe('resetGameState', () => {
    test('resets all state to defaults', () => {
      gameState$.petCount.set(100);
      gameState$.scrap.set(50);
      gameState$.purchasedUpgrades.set(['upgrade1', 'upgrade2']);

      resetGameState();

      expect(gameState$.petCount.get()).toBe(0);
      expect(gameState$.scrap.get()).toBe(0);
      expect(gameState$.upgrades.get()).toEqual([]);
      expect(gameState$.purchasedUpgrades.get()).toEqual([]);
    });

    test('resets petCount, scrap, upgrades, and purchasedUpgrades', () => {
      gameState$.set({
        petCount: 999,
        scrap: 888,
        upgrades: [],
        purchasedUpgrades: ['id1', 'id2', 'id3'],
      });

      resetGameState();

      const state = gameState$.get();
      expect(state).toEqual({
        petCount: 0,
        scrap: 0,
        upgrades: [],
        purchasedUpgrades: [],
      });
    });
  });

  describe('maximum value handling', () => {
    test('isPetCountAtMax returns false initially', () => {
      expect(isPetCountAtMax()).toBe(false);
    });

    test('isPetCountAtMax returns true at maximum', () => {
      gameState$.petCount.set(Number.MAX_SAFE_INTEGER);
      expect(isPetCountAtMax()).toBe(true);
    });

    test('maxPetCount equals Number.MAX_SAFE_INTEGER', () => {
      expect(maxPetCount).toBe(Number.MAX_SAFE_INTEGER);
    });

    test('isPetCountAtMax returns true when exceeding maximum', () => {
      gameState$.petCount.set(Number.MAX_SAFE_INTEGER + 1);
      expect(isPetCountAtMax()).toBe(true);
    });
  });

  describe('initializeGameState', () => {
    test('loads saved state from storage', async () => {
      const savedState: GameState = {
        petCount: 42,
        scrap: 100,
        upgrades: [],
        purchasedUpgrades: [],
      };

      (loadGameState as jest.Mock).mockResolvedValue(savedState);

      await initializeGameState();

      expect(gameState$.petCount.get()).toBe(42);
      expect(gameState$.scrap.get()).toBe(100);
    });

    test('merges saved state with current state', async () => {
      const savedState: GameState = {
        petCount: 10,
        scrap: 20,
        upgrades: [],
        purchasedUpgrades: ['upgrade1'],
      };

      (loadGameState as jest.Mock).mockResolvedValue(savedState);

      await initializeGameState();

      const state = gameState$.get();
      expect(state).toEqual(savedState);
    });

    test('handles missing saved state gracefully', async () => {
      (loadGameState as jest.Mock).mockResolvedValue(null);

      await initializeGameState();

      // Should keep default state
      expect(gameState$.petCount.get()).toBe(0);
      expect(gameState$.scrap.get()).toBe(0);
    });

    test('handles load errors gracefully', async () => {
      (loadGameState as jest.Mock).mockRejectedValue(new Error('Load error'));

      // Should not throw
      await expect(initializeGameState()).resolves.not.toThrow();
    });

    test('continues with default state on error', async () => {
      (loadGameState as jest.Mock).mockRejectedValue(new Error('Load error'));

      await initializeGameState();

      // State should remain at defaults
      expect(gameState$.petCount.get()).toBe(0);
    });

    test('does not throw on initialization failure', async () => {
      (loadGameState as jest.Mock).mockRejectedValue(new Error('Critical error'));

      const initPromise = initializeGameState();

      await expect(initPromise).resolves.toBeUndefined();
    });
  });

  describe('auto-persistence', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      (saveGameState as jest.Mock).mockResolvedValue(undefined);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('debounces storage writes', async () => {
      incrementPetCount();
      incrementPetCount();
      incrementPetCount();

      // Should not save immediately
      expect(saveGameState).not.toHaveBeenCalled();

      // Advance past debounce delay
      jest.advanceTimersByTime(1000);

      // Flush promises
      await Promise.resolve();

      // Should save once
      expect(saveGameState).toHaveBeenCalledTimes(1);
    });

    test('does not save immediately after state change', () => {
      incrementPetCount();

      expect(saveGameState).not.toHaveBeenCalled();
    });

    test('saves after 1 second debounce delay', async () => {
      gameState$.petCount.set(5);

      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(saveGameState).toHaveBeenCalled();
    });

    test('cancels previous save timeout on rapid changes', async () => {
      incrementPetCount();
      jest.advanceTimersByTime(500);

      incrementPetCount();
      jest.advanceTimersByTime(500);

      // First timeout should be cancelled, no save yet
      expect(saveGameState).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);
      await Promise.resolve();

      // Now should save
      expect(saveGameState).toHaveBeenCalledTimes(1);
    });

    test('saves only once for multiple rapid changes', async () => {
      for (let i = 0; i < 10; i++) {
        incrementPetCount();
        jest.advanceTimersByTime(100);
      }

      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(saveGameState).toHaveBeenCalledTimes(1);
    });

    test('handles save errors gracefully', async () => {
      (saveGameState as jest.Mock).mockRejectedValue(new Error('Save failed'));

      incrementPetCount();
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // Should not throw, error should be logged
      expect(saveGameState).toHaveBeenCalled();
    });
  });

  describe('Effect Calculation Observables', () => {
    beforeEach(() => {
      resetGameState();
    });

    describe('totalScrapMultiplier$', () => {
      test('returns 0 when no upgrades are purchased', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set([]);

        expect(totalScrapMultiplier$.get()).toBe(0);
      });

      test('returns 0 when upgrades array is empty', () => {
        gameState$.upgrades.set([]);
        gameState$.purchasedUpgrades.set(['scrap-boost-1']);

        expect(totalScrapMultiplier$.get()).toBe(0);
      });

      test('calculates single scrap multiplier upgrade correctly', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set(['scrap-boost-1']);

        expect(totalScrapMultiplier$.get()).toBe(0.1);
      });

      test('sums multiple scrap multiplier upgrades additively', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2']);

        expect(totalScrapMultiplier$.get()).toBeCloseTo(0.25, 5); // 0.1 + 0.15
      });

      test('includes all three scrap upgrades', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2', 'scrap-boost-3']);

        expect(totalScrapMultiplier$.get()).toBeCloseTo(0.5, 5); // 0.1 + 0.15 + 0.25
      });

      test('ignores pet bonus upgrades', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);

        expect(totalScrapMultiplier$.get()).toBe(0);
      });

      test('ignores non-existent upgrade IDs', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set(['non-existent-id', 'scrap-boost-1']);

        expect(totalScrapMultiplier$.get()).toBe(0.1);
      });

      test('updates reactively when purchases change', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set([]);

        expect(totalScrapMultiplier$.get()).toBe(0);

        gameState$.purchasedUpgrades.set(['scrap-boost-1']);
        expect(totalScrapMultiplier$.get()).toBe(0.1);

        gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2']);
        expect(totalScrapMultiplier$.get()).toBeCloseTo(0.25, 5);
      });
    });

    describe('totalPetBonus$', () => {
      test('returns 0 when no upgrades are purchased', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set([]);

        expect(totalPetBonus$.get()).toBe(0);
      });

      test('returns 0 when upgrades array is empty', () => {
        gameState$.upgrades.set([]);
        gameState$.purchasedUpgrades.set(['pet-boost-1']);

        expect(totalPetBonus$.get()).toBe(0);
      });

      test('calculates single pet bonus upgrade correctly', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set(['pet-boost-1']);

        expect(totalPetBonus$.get()).toBe(1);
      });

      test('sums multiple pet bonus upgrades additively', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);

        expect(totalPetBonus$.get()).toBe(3); // 1 + 2
      });

      test('ignores scrap multiplier upgrades', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2', 'scrap-boost-3']);

        expect(totalPetBonus$.get()).toBe(0);
      });

      test('ignores non-existent upgrade IDs', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set(['non-existent-id', 'pet-boost-1']);

        expect(totalPetBonus$.get()).toBe(1);
      });

      test('updates reactively when purchases change', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set([]);

        expect(totalPetBonus$.get()).toBe(0);

        gameState$.purchasedUpgrades.set(['pet-boost-1']);
        expect(totalPetBonus$.get()).toBe(1);

        gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);
        expect(totalPetBonus$.get()).toBe(3);
      });
    });

    describe('Combined Effects', () => {
      test('both computed observables work independently', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set([
          'scrap-boost-1',
          'scrap-boost-2',
          'pet-boost-1',
        ]);

        expect(totalScrapMultiplier$.get()).toBeCloseTo(0.25, 5); // 0.1 + 0.15
        expect(totalPetBonus$.get()).toBe(1);
      });

      test('full upgrade suite calculates correctly', () => {
        gameState$.upgrades.set(UPGRADES);
        gameState$.purchasedUpgrades.set([
          'scrap-boost-1',
          'scrap-boost-2',
          'scrap-boost-3',
          'pet-boost-1',
          'pet-boost-2',
        ]);

        expect(totalScrapMultiplier$.get()).toBeCloseTo(0.5, 5); // 50% total
        expect(totalPetBonus$.get()).toBe(3); // +3 pets total
      });
    });
  });
});
