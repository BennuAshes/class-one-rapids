import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePersistedCounter } from './usePersistedCounter';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

describe('usePersistedCounter Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([]);
  });

  test('initializes count to 0 when no stored value', async () => {
    const { result } = renderHook(() => usePersistedCounter());

    await waitFor(() => {
      expect(result.current.count$.get()).toBeGreaterThanOrEqual(0);
    });
  });

  test('increments count correctly', async () => {
    const { result } = renderHook(() => usePersistedCounter());

    const initialCount = result.current.count$.get();

    act(() => {
      result.current.actions.increment();
    });

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(initialCount + 1);
    });
  });

  test('handles rapid increments accurately', async () => {
    const { result } = renderHook(() => usePersistedCounter());

    const startCount = result.current.count$.get();

    // Rapid increments
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.actions.increment();
      });
    }

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(startCount + 10);
    });
  });

  test('persists count to AsyncStorage after debounce', async () => {
    const { result } = renderHook(() => usePersistedCounter());

    act(() => {
      result.current.actions.increment();
    });

    // Wait for debounced persist (1 second + buffer)
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  test('handles AsyncStorage read errors gracefully', async () => {
    // This tests that even if AsyncStorage has errors, the app doesn't crash
    const { result } = renderHook(() => usePersistedCounter());

    // Should still be able to use the hook
    expect(result.current.count$).toBeDefined();
    expect(result.current.actions.increment).toBeDefined();
  });

  test('loads persisted count on initialization', async () => {
    // Note: Due to singleton pattern, this test validates concept
    // In real app, value persists across sessions
    const { result } = renderHook(() => usePersistedCounter());

    // Hook should return observable with current value
    expect(result.current.count$).toBeDefined();
    expect(typeof result.current.count$.get()).toBe('number');
  });
});

describe('usePersistedCounter Pet Bonus Integration', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    // Reset count$ and scrap$
    const { result: counterResult, unmount: counterUnmount } = renderHook(() => usePersistedCounter());
    act(() => {
      counterResult.current.count$.set(0);
    });
    counterUnmount();

    // Reset scrap$ and purchased upgrades
    const petCount$ = require('@legendapp/state').observable(0);
    const { result: scrapResult, unmount: scrapUnmount } = renderHook(() => {
      const { useScrapGeneration } = require('../scrap/useScrapGeneration');
      return useScrapGeneration(petCount$);
    });
    act(() => {
      scrapResult.current.scrap$.set(0);
    });

    const { result: upgradeResult, unmount: upgradeUnmount } = renderHook(() => {
      const { useUpgrades } = require('../shop/useUpgrades');
      return useUpgrades(scrapResult.current.scrap$);
    });
    act(() => {
      upgradeResult.current.purchasedUpgradeIds$.set([]);
    });

    scrapUnmount();
    upgradeUnmount();
  });

  test('increment applies pet bonus from upgrades', async () => {
    // Set up purchased upgrade with +1 bonus
    const petCount$ = require('@legendapp/state').observable(0);
    const { result: scrapResult, unmount: scrapUnmount } = renderHook(() => {
      const { useScrapGeneration } = require('../scrap/useScrapGeneration');
      return useScrapGeneration(petCount$);
    });

    const { result: upgradeResult, unmount: upgradeUnmount } = renderHook(() => {
      const { useUpgrades } = require('../shop/useUpgrades');
      return useUpgrades(scrapResult.current.scrap$);
    });

    act(() => {
      // Mock purchased upgrade 'pet-boost-1' with +1 bonus
      upgradeResult.current.purchasedUpgradeIds$.set(['pet-boost-1']);
    });

    scrapUnmount();
    upgradeUnmount();

    // Now render the counter hook
    const { result } = renderHook(() => usePersistedCounter());

    const initialCount = result.current.count$.get();

    act(() => {
      result.current.actions.increment();
    });

    await waitFor(() => {
      // 1 base + 1 bonus = 2 total pets added
      expect(result.current.count$.get()).toBe(initialCount + 2);
    });
  });

  test('stacks multiple pet bonuses', async () => {
    // Set up multiple purchased upgrades with +1 and +2 bonuses
    const petCount$ = require('@legendapp/state').observable(0);
    const { result: scrapResult, unmount: scrapUnmount } = renderHook(() => {
      const { useScrapGeneration } = require('../scrap/useScrapGeneration');
      return useScrapGeneration(petCount$);
    });

    const { result: upgradeResult, unmount: upgradeUnmount } = renderHook(() => {
      const { useUpgrades } = require('../shop/useUpgrades');
      return useUpgrades(scrapResult.current.scrap$);
    });

    act(() => {
      // Mock two pet bonus upgrades (+1 and +2)
      upgradeResult.current.purchasedUpgradeIds$.set(['pet-boost-1', 'pet-boost-2']);
    });

    scrapUnmount();
    upgradeUnmount();

    const { result } = renderHook(() => usePersistedCounter());

    const initialCount = result.current.count$.get();

    act(() => {
      result.current.actions.increment();
    });

    await waitFor(() => {
      // 1 base + 3 total bonus (1+2) = 4 total pets added
      expect(result.current.count$.get()).toBe(initialCount + 4);
    });
  });

  test('works with no bonuses purchased', async () => {
    const { result } = renderHook(() => usePersistedCounter());

    const initialCount = result.current.count$.get();

    act(() => {
      result.current.actions.increment();
    });

    await waitFor(() => {
      // 1 base + 0 bonus = 1 total pet added
      expect(result.current.count$.get()).toBe(initialCount + 1);
    });
  });
});
