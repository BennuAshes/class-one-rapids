import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePurchases, loadPurchases, clearPurchases } from './persistence';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('savePurchases', () => {
    test('writes to AsyncStorage with correct key', async () => {
      const savePromise = savePurchases(['scrap-boost-1', 'pet-boost-1']);

      jest.advanceTimersByTime(1000);
      await savePromise;

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'purchased-upgrades-v1',
        expect.stringContaining('"scrap-boost-1"')
      );
    });

    test('debounces multiple rapid saves', async () => {
      savePurchases(['scrap-boost-1']);
      savePurchases(['scrap-boost-1', 'scrap-boost-2']);
      const finalSave = savePurchases(['scrap-boost-1', 'scrap-boost-2', 'pet-boost-1']);

      jest.advanceTimersByTime(1000);
      await finalSave;

      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    });

    test('includes version and timestamp in saved data', async () => {
      const savePromise = savePurchases(['scrap-boost-1']);

      jest.advanceTimersByTime(1000);
      await savePromise;

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(savedData);

      expect(parsed.version).toBe(1);
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.purchasedUpgrades).toEqual(['scrap-boost-1']);
    });

    test('handles save errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage full'));

      const savePromise = savePurchases(['scrap-boost-1']);
      jest.advanceTimersByTime(1000);

      await expect(savePromise).rejects.toThrow();
    });
  });

  describe('loadPurchases', () => {
    test('reads from AsyncStorage with correct key', async () => {
      const mockData = {
        version: 1,
        purchasedUpgrades: ['scrap-boost-1'],
        timestamp: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      const purchases = await loadPurchases();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('purchased-upgrades-v1');
      expect(purchases).toEqual(['scrap-boost-1']);
    });

    test('returns empty array if no data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const purchases = await loadPurchases();

      expect(purchases).toEqual([]);
    });

    test('handles corrupted data gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const purchases = await loadPurchases();

      expect(purchases).toEqual([]);
    });

    test('handles unknown version gracefully', async () => {
      const mockData = {
        version: 999,
        purchasedUpgrades: ['scrap-boost-1'],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      const purchases = await loadPurchases();

      expect(purchases).toEqual([]);
    });

    test('handles load errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Read error'));

      const purchases = await loadPurchases();

      expect(purchases).toEqual([]);
    });
  });

  describe('clearPurchases', () => {
    test('removes data from AsyncStorage', async () => {
      await clearPurchases();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('purchased-upgrades-v1');
    });

    test('handles clear errors gracefully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Clear error'));

      await expect(clearPurchases()).resolves.not.toThrow();
    });
  });
});
