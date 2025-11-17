import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUpgrades } from './useUpgrades';
import type { Upgrade } from '../types/upgrade';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock usePersistedCounter for scrap balance
jest.mock('../../attack-button/hooks/usePersistedCounter');

describe('useUpgrades Hook', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();

    // Default mock: 100 scrap available
    require('../../attack-button/hooks/usePersistedCounter').usePersistedCounter.mockReturnValue({
      count$: {
        get: () => 100,
        set: jest.fn()
      },
      actions: {
        increment: jest.fn(),
        decrement: jest.fn(),
        reset: jest.fn()
      }
    });
  });

  test('initializes with empty upgrades list', async () => {
    const { result } = renderHook(() => useUpgrades());

    await waitFor(() => {
      expect(result.current.availableUpgrades$.get()).toEqual([]);
      expect(result.current.purchasedUpgrades$.get().size).toBe(0);
    });
  });

  test('adds upgrade to available list', async () => {
    const { result } = renderHook(() => useUpgrades());

    const mockUpgrade: Upgrade = {
      id: 'upgrade-1',
      name: 'Test Upgrade',
      description: 'Test description',
      cost: 10,
      effectType: 'scrapPerPet',
      effectValue: 1
    };

    act(() => {
      result.current.actions.addUpgrade(mockUpgrade);
    });

    await waitFor(() => {
      expect(result.current.availableUpgrades$.get()).toHaveLength(1);
      expect(result.current.availableUpgrades$.get()[0].id).toBe('upgrade-1');
    });
  });

  test('purchases upgrade when sufficient scrap available', async () => {
    const { result } = renderHook(() => useUpgrades());

    const mockUpgrade: Upgrade = {
      id: 'upgrade-1',
      name: 'Test Upgrade',
      description: 'Test description',
      cost: 10,
      effectType: 'scrapPerPet',
      effectValue: 1
    };

    act(() => {
      result.current.actions.addUpgrade(mockUpgrade);
    });

    let purchaseSuccess = false;
    act(() => {
      purchaseSuccess = result.current.actions.purchaseUpgrade('upgrade-1', 10);
    });

    expect(purchaseSuccess).toBe(true);

    await waitFor(() => {
      expect(result.current.purchasedUpgrades$.get().has('upgrade-1')).toBe(true);
    });
  });

  test('rejects purchase when insufficient scrap', async () => {
    // Mock low scrap balance
    require('../../attack-button/hooks/usePersistedCounter').usePersistedCounter.mockReturnValue({
      count$: {
        get: () => 5,  // Only 5 scrap
        set: jest.fn()
      },
      actions: {
        increment: jest.fn(),
        decrement: jest.fn(),
        reset: jest.fn()
      }
    });

    const { result } = renderHook(() => useUpgrades());

    let purchaseSuccess = true;
    act(() => {
      purchaseSuccess = result.current.actions.purchaseUpgrade('upgrade-1', 10);
    });

    expect(purchaseSuccess).toBe(false);

    await waitFor(() => {
      expect(result.current.purchasedUpgrades$.get().has('upgrade-1')).toBe(false);
    });
  });

  test('deducts scrap cost on successful purchase', async () => {
    const mockSetScrap = jest.fn();
    require('../../attack-button/hooks/usePersistedCounter').usePersistedCounter.mockReturnValue({
      count$: {
        get: () => 100,
        set: mockSetScrap
      },
      actions: {
        increment: jest.fn(),
        decrement: jest.fn(),
        reset: jest.fn()
      }
    });

    const { result } = renderHook(() => useUpgrades());

    act(() => {
      result.current.actions.purchaseUpgrade('upgrade-1', 10);
    });

    expect(mockSetScrap).toHaveBeenCalledWith(90);
  });

  test('filters purchased upgrades from available list', async () => {
    const { result } = renderHook(() => useUpgrades());

    const mockUpgrades: Upgrade[] = [
      {
        id: 'upgrade-1',
        name: 'Upgrade 1',
        description: 'Test 1',
        cost: 10,
        effectType: 'scrapPerPet',
        effectValue: 1
      },
      {
        id: 'upgrade-2',
        name: 'Upgrade 2',
        description: 'Test 2',
        cost: 20,
        effectType: 'petsPerFeed',
        effectValue: 1
      }
    ];

    act(() => {
      mockUpgrades.forEach(u => result.current.actions.addUpgrade(u));
    });

    await waitFor(() => {
      expect(result.current.filteredUpgrades$.get()).toHaveLength(2);
    });

    act(() => {
      result.current.actions.purchaseUpgrade('upgrade-1', 10);
    });

    await waitFor(() => {
      const filtered = result.current.filteredUpgrades$.get();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('upgrade-2');
    });
  });

  test('persists purchased upgrades to AsyncStorage', async () => {
    const { result } = renderHook(() => useUpgrades());

    act(() => {
      result.current.actions.purchaseUpgrade('upgrade-1', 10);
    });

    await waitFor(() => {
      expect(result.current.purchasedUpgrades$.get().has('upgrade-1')).toBe(true);
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'purchased-upgrades',
        expect.any(String)
      );
    }, { timeout: 2000 });
  });

  test('loads persisted purchased upgrades on mount', async () => {
    await AsyncStorage.setItem('purchased-upgrades', JSON.stringify(['upgrade-1', 'upgrade-2']));

    const { result } = renderHook(() => useUpgrades());

    await waitFor(() => {
      const purchased = result.current.purchasedUpgrades$.get();
      expect(purchased.has('upgrade-1')).toBe(true);
      expect(purchased.has('upgrade-2')).toBe(true);
    }, { timeout: 2000 });
  });

  test('reset action clears purchased upgrades', async () => {
    const { result } = renderHook(() => useUpgrades());

    act(() => {
      result.current.actions.purchaseUpgrade('upgrade-1', 10);
      result.current.actions.purchaseUpgrade('upgrade-2', 20);
    });

    await waitFor(() => {
      expect(result.current.purchasedUpgrades$.get().size).toBe(2);
    });

    act(() => {
      result.current.actions.reset();
    });

    await waitFor(() => {
      expect(result.current.purchasedUpgrades$.get().size).toBe(0);
    });
  });
});
