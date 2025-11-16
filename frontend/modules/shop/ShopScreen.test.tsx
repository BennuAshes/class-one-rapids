import React from 'react';
import { render, screen, userEvent, waitFor, renderHook, act } from '@testing-library/react-native';
import { ShopScreen } from './ShopScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

describe('ShopScreen Component', () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    // Reset scrap$ to 0 by rendering and unmounting
    const { result, unmount } = renderHook(() => {
      const { count$ } = require('../attack-button/usePersistedCounter').usePersistedCounter();
      return require('../scrap/useScrapGeneration').useScrapGeneration(count$);
    });
    await waitFor(() => {
      result.current.scrap$.set(0);
    });
    unmount();
  });

  test('displays "Available Upgrades" heading', () => {
    render(<ShopScreen />);
    expect(screen.getByText(/Available Upgrades/i)).toBeTruthy();
  });

  test('displays back button', () => {
    render(<ShopScreen />);
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeTruthy();
  });

  test('displays scrap balance', async () => {
    // Set scrap directly via the hook
    const { result, unmount } = renderHook(() => {
      const { count$ } = require('../attack-button/usePersistedCounter').usePersistedCounter();
      return require('../scrap/useScrapGeneration').useScrapGeneration(count$);
    });

    act(() => {
      result.current.scrap$.set(500);
    });
    unmount();

    render(<ShopScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Scrap:/i)).toBeTruthy();
      expect(screen.getByText(/Scrap: 500/i)).toBeTruthy();
    });
  });

  test('displays available upgrades', async () => {
    render(<ShopScreen />);

    await waitFor(() => {
      // Should show at least one upgrade name from UPGRADE_DEFINITIONS
      expect(screen.getByText(/Scrap Finder/i)).toBeTruthy();
    });
  });

  test('purchase button disabled when insufficient scrap', async () => {
    // Set scrap to low amount
    const { result, unmount } = renderHook(() => {
      const { count$ } = require('../attack-button/usePersistedCounter').usePersistedCounter();
      return require('../scrap/useScrapGeneration').useScrapGeneration(count$);
    });

    act(() => {
      result.current.scrap$.set(50);
    });
    unmount();

    render(<ShopScreen />);

    await waitFor(() => {
      // Find the first upgrade's purchase button
      const purchaseButtons = screen.getAllByRole('button', { name: /Purchase/i });
      // At least one button should be disabled due to insufficient scrap
      const disabledButton = purchaseButtons.find(
        btn => btn.props.accessibilityState?.disabled === true
      );
      expect(disabledButton).toBeTruthy();
    });
  });

  test('completes purchase flow successfully', async () => {
    // Set scrap to 500
    const { result, unmount } = renderHook(() => {
      const { count$ } = require('../attack-button/usePersistedCounter').usePersistedCounter();
      return require('../scrap/useScrapGeneration').useScrapGeneration(count$);
    });

    act(() => {
      result.current.scrap$.set(500);
    });
    unmount();

    render(<ShopScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Scrap Finder/i)).toBeTruthy();
    });

    // Find and press the purchase button for the first affordable upgrade
    const purchaseButton = screen.getByRole('button', { name: /Purchase Scrap Finder/i });
    await user.press(purchaseButton);

    await waitFor(() => {
      // Scrap should be deducted (500 - 100 = 400)
      expect(screen.getByText(/400/)).toBeTruthy();
    });
  });

  test('purchased upgrade no longer appears in list', async () => {
    // Set scrap and purchased upgrades
    const { result: scrapResult, unmount: scrapUnmount } = renderHook(() => {
      const { count$ } = require('../attack-button/usePersistedCounter').usePersistedCounter();
      return require('../scrap/useScrapGeneration').useScrapGeneration(count$);
    });

    const { result: upgradeResult, unmount: upgradeUnmount } = renderHook(() => {
      return require('./useUpgrades').useUpgrades(scrapResult.current.scrap$);
    });

    act(() => {
      scrapResult.current.scrap$.set(1000);
      upgradeResult.current.purchasedUpgradeIds$.set(['scrap-boost-1']);
    });

    scrapUnmount();
    upgradeUnmount();

    render(<ShopScreen />);

    await waitFor(() => {
      // "Scrap Finder" (id: scrap-boost-1) should not be in the list
      expect(screen.queryByText(/Scrap Finder/i)).toBeNull();
      // But other upgrades should still be there
      expect(screen.getByText(/Extra Feed/i)).toBeTruthy();
    });
  });
});
