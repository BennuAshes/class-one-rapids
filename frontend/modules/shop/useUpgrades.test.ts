import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUpgrades } from './useUpgrades';
import { observable } from '@legendapp/state';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('useUpgrades Hook', () => {
  let scrap$: any;

  beforeEach(() => {
    jest.clearAllMocks();
    scrap$ = observable(500);
  });

  test('initializes with no purchased upgrades', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useUpgrades(scrap$));

    // Clear any previous state first
    act(() => {
      result.current.purchasedUpgradeIds$.set([]);
    });

    await waitFor(() => {
      expect(result.current.purchasedUpgradeIds$.get()).toEqual([]);
    });
  });

  test('loads persisted purchased upgrades', async () => {
    const { result: setupResult } = renderHook(() => useUpgrades(scrap$));
    act(() => {
      setupResult.current.purchasedUpgradeIds$.set([]);
    });

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(['scrap-boost-1'])
    );

    // Manually set to simulate loading from storage
    act(() => {
      setupResult.current.purchasedUpgradeIds$.set(['scrap-boost-1']);
    });

    await waitFor(() => {
      expect(setupResult.current.purchasedUpgradeIds$.get()).toEqual(['scrap-boost-1']);
    });
  });

  test('computes available upgrades excluding purchased', async () => {
    const { result } = renderHook(() => useUpgrades(scrap$));

    // Clear and set state to simulate loaded upgrades
    act(() => {
      result.current.purchasedUpgradeIds$.set(['scrap-boost-1']);
    });

    await waitFor(() => {
      const available = result.current.availableUpgrades$.get();
      expect(available.find(u => u.id === 'scrap-boost-1')).toBeUndefined();
      expect(available.length).toBeGreaterThan(0);
    });
  });

  test('successfully purchases affordable upgrade', async () => {
    const { result } = renderHook(() => useUpgrades(scrap$));

    // Clear state
    act(() => {
      result.current.purchasedUpgradeIds$.set([]);
    });

    const initialScrap = scrap$.get();
    const upgradeId = 'scrap-boost-1';

    let success: boolean = false;
    act(() => {
      success = result.current.actions.purchase(upgradeId);
    });

    await waitFor(() => {
      expect(success).toBe(true);
      expect(scrap$.get()).toBe(initialScrap - 100);
      expect(result.current.purchasedUpgradeIds$.get()).toContain(upgradeId);
    });
  });

  test('rejects purchase with insufficient scrap', async () => {
    scrap$.set(50);
    const { result } = renderHook(() => useUpgrades(scrap$));

    // Clear state
    act(() => {
      result.current.purchasedUpgradeIds$.set([]);
    });

    let success: boolean = false;
    act(() => {
      success = result.current.actions.purchase('scrap-boost-1');
    });

    await waitFor(() => {
      expect(success).toBe(false);
      expect(scrap$.get()).toBe(50);
      expect(result.current.purchasedUpgradeIds$.get()).not.toContain('scrap-boost-1');
    });
  });

  test('rejects duplicate purchase', async () => {
    const { result } = renderHook(() => useUpgrades(scrap$));

    // Clear state
    act(() => {
      result.current.purchasedUpgradeIds$.set([]);
    });

    act(() => {
      result.current.actions.purchase('scrap-boost-1');
    });

    await waitFor(() => {
      expect(result.current.purchasedUpgradeIds$.get()).toContain('scrap-boost-1');
    });

    const scrapAfterFirst = scrap$.get();

    let success: boolean = false;
    act(() => {
      success = result.current.actions.purchase('scrap-boost-1');
    });

    await waitFor(() => {
      expect(success).toBe(false);
      expect(scrap$.get()).toBe(scrapAfterFirst);
    });
  });

  test('calculates total scrap multiplier', async () => {
    const { result } = renderHook(() => useUpgrades(scrap$));

    // Set state to simulate loaded upgrades
    act(() => {
      result.current.purchasedUpgradeIds$.set(['scrap-boost-1']);
    });

    await waitFor(() => {
      expect(result.current.totalScrapMultiplier$.get()).toBe(0.1);
    });
  });

  test('calculates total pet bonus', async () => {
    const { result } = renderHook(() => useUpgrades(scrap$));

    // Set state to simulate loaded upgrades
    act(() => {
      result.current.purchasedUpgradeIds$.set(['pet-boost-1']);
    });

    await waitFor(() => {
      expect(result.current.totalPetBonus$.get()).toBe(1);
    });
  });

  test('persists purchased upgrades to AsyncStorage', async () => {
    const { result } = renderHook(() => useUpgrades(scrap$));

    // Clear state
    act(() => {
      result.current.purchasedUpgradeIds$.set([]);
    });

    act(() => {
      result.current.actions.purchase('scrap-boost-1');
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'purchased-upgrades-v1',
        JSON.stringify(['scrap-boost-1'])
      );
    }, { timeout: 2000 });
  });
});
