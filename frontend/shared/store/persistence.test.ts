import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveGameState, loadGameState, clearGameState, isStorageAvailable, StorageQuotaError } from './persistence';
import { GameState, PersistedGameState, STORAGE_KEYS } from '../types/game';
import { gameState$, initializeGameState } from './gameStore';
import { UPGRADES } from '../../modules/shop/upgradeDefinitions';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveGameState', () => {
    test('saves state to AsyncStorage', async () => {
      const state: GameState = {
        petCount: 10,
        scrap: 50,
        upgrades: [],
        purchasedUpgrades: [],
      };

      await saveGameState(state);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.GAME_STATE,
        expect.stringContaining('"petCount":10')
      );
    });

    test('includes version and timestamp', async () => {
      const state: GameState = {
        petCount: 5,
        scrap: 0,
        upgrades: [],
        purchasedUpgrades: [],
      };

      await saveGameState(state);

      const savedCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(savedCall[1]);

      expect(savedData.version).toBe(1);
      expect(typeof savedData.timestamp).toBe('number');
      expect(savedData.timestamp).toBeGreaterThan(0);
    });

    test('serializes state as JSON', async () => {
      const state: GameState = {
        petCount: 42,
        scrap: 100,
        upgrades: [],
        purchasedUpgrades: ['upgrade1'],
      };

      await saveGameState(state);

      const savedCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(savedCall[1]);

      expect(savedData.data).toEqual(state);
    });

    test('throws StorageQuotaError when quota exceeded', async () => {
      const state: GameState = {
        petCount: 1,
        scrap: 0,
        upgrades: [],
        purchasedUpgrades: [],
      };

      const quotaError = new Error('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(quotaError);

      await expect(saveGameState(state)).rejects.toThrow(StorageQuotaError);
    });

    test('saves with correct storage key', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const state: GameState = {
        petCount: 0,
        scrap: 0,
        upgrades: [],
        purchasedUpgrades: [],
      };

      await saveGameState(state);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.GAME_STATE,
        expect.any(String)
      );
    });
  });

  describe('loadGameState', () => {
    test('loads and parses saved state', async () => {
      const persisted: PersistedGameState = {
        version: 1,
        data: { petCount: 42, scrap: 100, upgrades: [], purchasedUpgrades: [] },
        timestamp: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(persisted)
      );

      const loaded = await loadGameState();

      expect(loaded?.petCount).toBe(42);
      expect(loaded?.scrap).toBe(100);
    });

    test('returns null when no saved state exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const loaded = await loadGameState();

      expect(loaded).toBeNull();
    });

    test('sanitizes invalid values (negative numbers)', async () => {
      const persisted: PersistedGameState = {
        version: 1,
        data: { petCount: -5, scrap: -10, upgrades: [], purchasedUpgrades: [] },
        timestamp: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(persisted)
      );

      const loaded = await loadGameState();

      expect(loaded?.petCount).toBe(0); // Clamped to minimum
      expect(loaded?.scrap).toBe(0);
    });

    test('handles corrupted JSON gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        'invalid json {{{}'
      );

      const loaded = await loadGameState();

      expect(loaded).toBeNull();
    });

    test('returns null for invalid state structure', async () => {
      const invalidState = {
        version: 1,
        data: { notAGameState: true },
        timestamp: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(invalidState)
      );

      const loaded = await loadGameState();

      expect(loaded).toBeNull();
    });

    test('returns null for unknown version', async () => {
      const futureVersion: PersistedGameState = {
        version: 999,
        data: { petCount: 10, scrap: 0, upgrades: [], purchasedUpgrades: [] },
        timestamp: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(futureVersion)
      );

      const loaded = await loadGameState();

      expect(loaded).toBeNull();
    });

    test('validates petCount is within safe integer range', async () => {
      const persisted: PersistedGameState = {
        version: 1,
        data: {
          petCount: Number.MAX_SAFE_INTEGER + 1000,
          scrap: 0,
          upgrades: [],
          purchasedUpgrades: [],
        },
        timestamp: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(persisted)
      );

      const loaded = await loadGameState();

      expect(loaded?.petCount).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('clearGameState', () => {
    test('removes state from storage', async () => {
      await clearGameState();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.GAME_STATE
      );
    });

    test('uses correct storage key', async () => {
      await clearGameState();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.GAME_STATE
      );
    });

    test('handles errors gracefully', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(error);

      await expect(clearGameState()).rejects.toThrow('Storage error');
    });
  });

  describe('isStorageAvailable', () => {
    test('returns true when storage works', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      const available = await isStorageAvailable();

      expect(available).toBe(true);
    });

    test('returns false when storage fails', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage unavailable')
      );

      const available = await isStorageAvailable();

      expect(available).toBe(false);
    });

    test('cleans up test key after check', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await isStorageAvailable();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('__storage_test__');
    });
  });

  describe('Upgrade Persistence', () => {
    beforeEach(async () => {
      await AsyncStorage.clear();
      gameState$.set({
        petCount: 0,
        scrap: 0,
        upgrades: [],
        purchasedUpgrades: [],
      });
    });

    test('purchased upgrades persist across sessions', async () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'pet-boost-1']);
      gameState$.scrap.set(500);

      await saveGameState(gameState$.get());

      // Reset state (simulate app restart)
      gameState$.set({
        petCount: 0,
        scrap: 0,
        upgrades: [],
        purchasedUpgrades: [],
      });

      const loaded = await loadGameState();
      if (loaded) {
        gameState$.set({
          ...gameState$.get(),
          ...loaded,
        });
      }

      await initializeGameState();

      expect(gameState$.purchasedUpgrades.get()).toEqual([
        'scrap-boost-1',
        'pet-boost-1',
      ]);
      expect(gameState$.scrap.get()).toBe(500);
      expect(gameState$.upgrades.get()).toHaveLength(5);
    });

    test('upgrades array populates on first load', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await initializeGameState();

      expect(gameState$.upgrades.get()).toHaveLength(5);
      expect(gameState$.upgrades.get()).toEqual(UPGRADES);
    });
  });
});
