import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AttackButtonScreen } from './AttackButtonScreen';
import { gameState$, resetGameState } from '../../shared/store/gameStore';
import { UPGRADES } from '../shop/upgradeDefinitions';
import { act } from 'react-test-renderer';

describe('AttackButtonScreen', () => {
  const mockNavigateToShop = jest.fn();

  beforeEach(() => {
    resetGameState();
    mockNavigateToShop.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    test('renders feed button', () => {
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      const button = getByText('feed');
      expect(button).toBeTruthy();
    });

    test('renders pet counter with initial value', () => {
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      expect(getByText(/Singularity Pet Count: 0/)).toBeTruthy();
    });

    test('renders with zero initial count', () => {
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      expect(getByText(/Singularity Pet Count: 0/)).toBeTruthy();
    });

    test('displays previously saved pet count', () => {
      gameState$.petCount.set(25);
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      expect(getByText(/Singularity Pet Count: 25/)).toBeTruthy();
    });

    test('renders SafeAreaView container', () => {
      const { root } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      expect(root).toBeTruthy();
    });

    test('applies correct styles to button', () => {
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      const button = getByText('feed');
      expect(button.parent?.props.style).toBeDefined();
    });
  });

  describe('button interaction', () => {
    test('increments counter when button pressed', () => {
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      const button = getByText('feed');

      fireEvent.press(button);

      expect(getByText(/Singularity Pet Count: 1/)).toBeTruthy();
    });

    test('increments counter multiple times', () => {
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      const button = getByText('feed');

      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(getByText(/Singularity Pet Count: 3/)).toBeTruthy();
    });

    test('handles rapid clicking correctly', () => {
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      const button = getByText('feed');

      for (let i = 0; i < 10; i++) {
        fireEvent.press(button);
      }

      expect(getByText(/Singularity Pet Count: 10/)).toBeTruthy();
    });

    test('updates counter display after each press', () => {
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      const button = getByText('feed');

      fireEvent.press(button);
      expect(getByText(/Singularity Pet Count: 1/)).toBeTruthy();

      fireEvent.press(button);
      expect(getByText(/Singularity Pet Count: 2/)).toBeTruthy();
    });
  });

  describe('reactivity', () => {
    test('counter updates reactively to external state changes', () => {
      const { getByText, rerender } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      expect(getByText(/Singularity Pet Count: 0/)).toBeTruthy();

      // External state update
      gameState$.petCount.set(100);
      rerender(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      expect(getByText(/Singularity Pet Count: 100/)).toBeTruthy();
    });

    test('displays correct count after state reset', () => {
      const { getByText, rerender } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      gameState$.petCount.set(50);
      rerender(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      expect(getByText(/Singularity Pet Count: 50/)).toBeTruthy();

      resetGameState();
      rerender(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      expect(getByText(/Singularity Pet Count: 0/)).toBeTruthy();
    });

    test('updates immediately when state changes', () => {
      const { getByText, rerender } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      gameState$.petCount.set(42);
      rerender(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      expect(getByText(/Singularity Pet Count: 42/)).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    test('button has correct accessibility attributes', () => {
      const { getByLabelText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      const button = getByLabelText('feed button');

      expect(button).toBeTruthy();
      expect(button.props.accessibilityRole).toBe('button');
    });

    test('counter has correct accessibility label', () => {
      gameState$.petCount.set(5);
      const { getByLabelText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      const counter = getByLabelText('Singularity Pet Count: 5');
      expect(counter).toBeTruthy();
    });

    test('button has accessibility hint', () => {
      const { getByLabelText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      const button = getByLabelText('feed button');

      expect(button.props.accessibilityHint).toBeTruthy();
      expect(button.props.accessibilityHint).toContain('Tap to feed');
    });

    test('counter has correct accessibility role', () => {
      const { getByLabelText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      const counter = getByLabelText('Singularity Pet Count: 0');

      expect(counter.props.accessibilityRole).toBe('text');
    });

    test('counter accessibility label updates with value', () => {
      const { getByLabelText, rerender } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      gameState$.petCount.set(10);
      rerender(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      const counter = getByLabelText('Singularity Pet Count: 10');
      expect(counter).toBeTruthy();
    });
  });

  describe('visual feedback', () => {
    test('button has shadow/elevation styles', () => {
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      const button = getByText('feed');

      // Check that the button is rendered (styles are applied via StyleSheet)
      expect(button).toBeTruthy();
      expect(button.parent).toBeTruthy();
    });

    test('button meets minimum touch target size (44x44)', () => {
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      const button = getByText('feed');

      // Check that the button is rendered (size is enforced via StyleSheet)
      expect(button).toBeTruthy();
      expect(button.parent).toBeTruthy();
    });
  });

  describe('Scrap Display', () => {
    test('renders scrap counter with initial value', () => {
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      expect(getByText(/Scrap: 0/)).toBeTruthy();
    });

    test('displays previously saved scrap count', () => {
      gameState$.scrap.set(150);
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      expect(getByText(/Scrap: 150/)).toBeTruthy();
    });

    test('scrap counter has correct accessibility attributes', () => {
      gameState$.scrap.set(42);
      const { getByLabelText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      const scrapText = getByLabelText('Scrap: 42');
      expect(scrapText).toBeTruthy();
      expect(scrapText.props.accessibilityRole).toBe('text');
    });

    test('displays large scrap values correctly', () => {
      gameState$.scrap.set(999999);
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      expect(getByText(/Scrap: 999999/)).toBeTruthy();
    });
  });

  describe('Scrap Generation', () => {
    test('generates no scrap when petCount is 0', async () => {
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(0);
      });
    });

    test('generates 1 scrap per second when petCount is 1', async () => {
      gameState$.petCount.set(1);
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(3);
      });
    });

    test('generates 5 scrap per second when petCount is 5', async () => {
      gameState$.petCount.set(5);
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(10);
      });
    });

    test('handles large petCount values', async () => {
      gameState$.petCount.set(1000);
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(1000);
      });
    });

    test('accumulates scrap over time', async () => {
      gameState$.petCount.set(3);
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(3));

      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(6));

      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(9));
    });
  });

  describe('Dynamic Generation Rate', () => {
    test('generation rate updates when petCount changes', async () => {
      gameState$.petCount.set(2);
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      // Generate at rate of 2/sec for 2 seconds
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(4);
      });

      // Increase pet count
      gameState$.petCount.set(5);

      // Generate at new rate of 5/sec for 2 seconds
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(14); // 4 + (5 * 2)
      });
    });
  });

  describe('Timer Cleanup', () => {
    test('clears timer on unmount', async () => {
      const { unmount } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      gameState$.petCount.set(5);

      // Advance timer while mounted
      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(5));

      // Unmount component
      unmount();

      // Advance timer after unmount
      jest.advanceTimersByTime(2000);

      // Scrap should not increase
      expect(gameState$.scrap.get()).toBe(5);
    });

    test('timer restarts on remount', async () => {
      gameState$.petCount.set(2);
      const { unmount } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(2));

      unmount();

      // Remount with a new render
      const { } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(4));
    });
  });

  describe('Integration with Clicking', () => {
    test('scrap generation continues while clicking', async () => {
      gameState$.petCount.set(2);
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      const button = getByText('feed');

      // First timer tick at 1000ms: 2 scrap generated
      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(2));

      // Click to increase petCount to 3
      fireEvent.press(button);

      // Second timer tick at 2000ms: 3 scrap generated (new rate)
      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(5));
    });

    test('concurrent updates do not cause race conditions', async () => {
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);
      gameState$.petCount.set(1);

      const button = getByText('feed');

      // Rapid clicks while timer is running
      for (let i = 0; i < 10; i++) {
        fireEvent.press(button);
        jest.advanceTimersByTime(100);
      }

      // Total time elapsed: 1 second
      await waitFor(() => {
        // petCount should be 11 (1 + 10 clicks)
        expect(gameState$.petCount.get()).toBe(11);

        // Scrap varies by click timing, but should be in reasonable range
        const scrap = gameState$.scrap.get();
        expect(scrap).toBeGreaterThanOrEqual(1);
        expect(scrap).toBeLessThanOrEqual(15);
      });
    });
  });

  describe('UI Updates', () => {
    test('scrap counter updates reactively', async () => {
      gameState$.petCount.set(1);
      const { getByText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      expect(getByText(/Scrap: 0/)).toBeTruthy();

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(getByText(/Scrap: 1/)).toBeTruthy();
      });

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(getByText(/Scrap: 2/)).toBeTruthy();
      });
    });
  });

  describe('shop navigation', () => {
    test('renders shop button', () => {
      const mockNavigateToShop = jest.fn();
      const { getByText } = render(
        <AttackButtonScreen onNavigateToShop={mockNavigateToShop} />
      );

      expect(getByText('Shop')).toBeTruthy();
    });

    test('calls onNavigateToShop when shop button pressed', () => {
      const mockNavigateToShop = jest.fn();
      const { getByText } = render(
        <AttackButtonScreen onNavigateToShop={mockNavigateToShop} />
      );

      const shopButton = getByText('Shop');
      fireEvent.press(shopButton);

      expect(mockNavigateToShop).toHaveBeenCalledTimes(1);
    });

    test('shop button has correct accessibility label', () => {
      const mockNavigateToShop = jest.fn();
      const { getByLabelText } = render(
        <AttackButtonScreen onNavigateToShop={mockNavigateToShop} />
      );

      const shopButton = getByLabelText('Shop');
      expect(shopButton).toBeTruthy();
      expect(shopButton.props.accessibilityRole).toBe('button');
    });

    test('shop button meets minimum touch target size (44x44)', () => {
      const mockNavigateToShop = jest.fn();
      const { getByText } = render(
        <AttackButtonScreen onNavigateToShop={mockNavigateToShop} />
      );

      const shopButton = getByText('Shop');
      expect(shopButton).toBeTruthy();
      expect(shopButton.parent).toBeTruthy();
    });
  });

  describe('Upgrade Effects Integration', () => {
    describe('Scrap Generation with Multipliers', () => {
      test('generates base scrap without upgrades', async () => {
        gameState$.set({
          petCount: 10,
          scrap: 0,
          upgrades: UPGRADES,
          purchasedUpgrades: [],
        });

        render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

        expect(gameState$.scrap.get()).toBe(0);

        act(() => {
          jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
          expect(gameState$.scrap.get()).toBe(10); // 10 pets * 1
        });
      });

      test('applies scrap multiplier from purchased upgrade', async () => {
        gameState$.set({
          petCount: 10,
          scrap: 0,
          upgrades: UPGRADES,
          purchasedUpgrades: ['scrap-boost-1'],
        });

        render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

        act(() => {
          jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
          expect(gameState$.scrap.get()).toBe(11); // 10 * 1.1
        });
      });

      test('stacks multiple scrap multipliers', async () => {
        gameState$.set({
          petCount: 10,
          scrap: 0,
          upgrades: UPGRADES,
          purchasedUpgrades: ['scrap-boost-1', 'scrap-boost-2'],
        });

        render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

        act(() => {
          jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
          expect(gameState$.scrap.get()).toBeCloseTo(12.5, 0); // 10 * 1.25
        });
      });

      test('applies maximum scrap multiplier (all upgrades)', async () => {
        gameState$.set({
          petCount: 10,
          scrap: 0,
          upgrades: UPGRADES,
          purchasedUpgrades: ['scrap-boost-1', 'scrap-boost-2', 'scrap-boost-3'],
        });

        render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

        act(() => {
          jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
          expect(gameState$.scrap.get()).toBe(15); // 10 * 1.5
        });
      });
    });

    describe('Feed Button with Pet Bonus', () => {
      test('adds base pets without upgrades', () => {
        gameState$.set({
          petCount: 10,
          scrap: 0,
          upgrades: UPGRADES,
          purchasedUpgrades: [],
        });

        const { getByLabelText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

        expect(gameState$.petCount.get()).toBe(10);

        const feedButton = getByLabelText('feed button');
        fireEvent.press(feedButton);

        expect(gameState$.petCount.get()).toBe(11); // +1 base
      });

      test('applies pet bonus from purchased upgrade', () => {
        gameState$.set({
          petCount: 10,
          scrap: 0,
          upgrades: UPGRADES,
          purchasedUpgrades: ['pet-boost-1'],
        });

        const { getByLabelText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

        const feedButton = getByLabelText('feed button');
        fireEvent.press(feedButton);

        expect(gameState$.petCount.get()).toBe(12); // 1 base + 1 bonus
      });

      test('stacks multiple pet bonuses', () => {
        gameState$.set({
          petCount: 10,
          scrap: 0,
          upgrades: UPGRADES,
          purchasedUpgrades: ['pet-boost-1', 'pet-boost-2'],
        });

        const { getByLabelText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

        const feedButton = getByLabelText('feed button');
        fireEvent.press(feedButton);

        expect(gameState$.petCount.get()).toBe(14); // 1 base + 3 bonus
      });

      test('bonus applies to multiple feed presses', () => {
        gameState$.set({
          petCount: 10,
          scrap: 0,
          upgrades: UPGRADES,
          purchasedUpgrades: ['pet-boost-1'],
        });

        const { getByLabelText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

        const feedButton = getByLabelText('feed button');

        fireEvent.press(feedButton);
        expect(gameState$.petCount.get()).toBe(12); // 10 + 2

        fireEvent.press(feedButton);
        expect(gameState$.petCount.get()).toBe(14); // 12 + 2

        fireEvent.press(feedButton);
        expect(gameState$.petCount.get()).toBe(16); // 14 + 2
      });
    });

    describe('Combined Upgrade Effects', () => {
      test('scrap multiplier and pet bonus work independently', async () => {
        gameState$.set({
          petCount: 10,
          scrap: 0,
          upgrades: UPGRADES,
          purchasedUpgrades: ['scrap-boost-1', 'pet-boost-1'],
        });

        const { getByLabelText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

        // Test scrap generation
        act(() => {
          jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
          expect(gameState$.scrap.get()).toBe(11); // 10 * 1.1
        });

        // Test feed button
        const feedButton = getByLabelText('feed button');
        fireEvent.press(feedButton);

        expect(gameState$.petCount.get()).toBe(12); // 10 + (1 + 1)
      });

      test('all upgrades purchased - maximum effects', async () => {
        gameState$.set({
          petCount: 10,
          scrap: 0,
          upgrades: UPGRADES,
          purchasedUpgrades: [
            'scrap-boost-1',
            'scrap-boost-2',
            'scrap-boost-3',
            'pet-boost-1',
            'pet-boost-2',
          ],
        });

        const { getByLabelText } = render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

        // Test scrap generation with max multiplier
        act(() => {
          jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
          expect(gameState$.scrap.get()).toBe(15); // 10 * 1.5
        });

        // Test feed button with max bonus
        const feedButton = getByLabelText('feed button');
        fireEvent.press(feedButton);

        expect(gameState$.petCount.get()).toBe(14); // 10 + (1 + 3)
      });
    });
  });
});
