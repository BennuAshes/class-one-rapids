import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { ClickerScreen } from './ClickerScreen';
import { gameState$ } from '../../shared/store/gameStore';

describe('ClickerScreen', () => {
  beforeEach(() => {
    // Reset shared state before each test (ensures test isolation)
    gameState$.petCount.set(0);
    gameState$.scrap.set(0);
  });
  describe('Initial Render', () => {
    test('displays "Singularity Pet Count" label', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
    });

    test('displays initial count of zero', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
    });

    test('displays feed button', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const feedButton = screen.getByRole('button', { name: /feed/i });
      expect(feedButton).toBeTruthy();
    });

    test('feed button contains text "feed"', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const feedButton = screen.getByRole('button', { name: /feed/i });
      expect(feedButton).toHaveTextContent(/feed/i);
    });
  });

  describe('Button Interaction', () => {
    test('increments count by 1 when feed button is pressed', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      fireEvent.press(feedButton);

      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });

    test('increments count multiple times', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      fireEvent.press(feedButton);
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);

      expect(screen.getByText(/Singularity Pet Count: 3/i)).toBeTruthy();
    });

    test('handles rapid tapping accurately', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      // Simulate 10 rapid taps
      for (let i = 0; i < 10; i++) {
        fireEvent.press(feedButton);
      }

      expect(screen.getByText(/Singularity Pet Count: 10/i)).toBeTruthy();
    });

    test('count persists across multiple increments', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      fireEvent.press(feedButton); // count = 1
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();

      fireEvent.press(feedButton); // count = 2
      expect(screen.getByText(/Singularity Pet Count: 2/i)).toBeTruthy();

      fireEvent.press(feedButton); // count = 3
      expect(screen.getByText(/Singularity Pet Count: 3/i)).toBeTruthy();
    });
  });

  describe('Counter Display', () => {
    test('formats count correctly with no leading zeros', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      fireEvent.press(feedButton);

      expect(screen.queryByText(/Singularity Pet Count: 01/i)).toBeNull();
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });

    test('handles large numbers without visual breaking', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      // Simulate reaching 100+
      for (let i = 0; i < 150; i++) {
        fireEvent.press(feedButton);
      }

      expect(screen.getByText(/Singularity Pet Count: 150/i)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    test('feed button has correct accessibility role', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const feedButton = screen.getByRole('button', { name: /feed/i });
      expect(feedButton.props.accessibilityRole).toBe('button');
    });

    test('feed button has accessible label', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const feedButton = screen.getByRole('button', { name: /feed/i });
      expect(feedButton.props.accessibilityLabel).toMatch(/feed/i);
    });

    test('counter has text accessibility role', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const counter = screen.getByText(/Singularity Pet Count/i);
      expect(counter.props.accessibilityRole).toBe('text');
    });

    test('counter has dynamic accessibility label with count', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      fireEvent.press(feedButton);

      const counter = screen.getByText(/Singularity Pet Count: 1/i);
      expect(counter.props.accessibilityLabel).toMatch(/Singularity Pet Count: 1/);
    });
  });

  describe('Layout', () => {
    test('renders without SafeAreaView errors', () => {
      // SafeAreaProvider must be wrapping in App.tsx
      expect(() => render(<ClickerScreen />)).not.toThrow();
    });

    test('button and counter are both visible', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);

      expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
      expect(screen.getByRole('button', { name: /feed/i })).toBeTruthy();
    });
  });

  describe('Shared State Integration', () => {
    test('pet count uses shared state (not local useState)', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const feedButton = screen.getByRole('button', { name: /feed/i });

      fireEvent.press(feedButton);

      // Verify shared state updated
      expect(gameState$.petCount.get()).toBe(1);
    });

    test('displays initial pet count from shared state', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
      // Verify shared state is used
      expect(gameState$.petCount.get()).toBe(0);
    });
  });

  describe('Scrap Display', () => {
    test('displays initial scrap count of zero', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      expect(screen.getByText(/Scrap: 0/i)).toBeTruthy();
    });

    test('displays scrap label clearly', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      expect(screen.getByText(/Scrap:/i)).toBeTruthy();
    });

    test('updates scrap display when scrap changes', () => {
      const { rerender } = render(<ClickerScreen onNavigateToShop={() => {}} />);

      // Manually update scrap (simulates timer tick)
      gameState$.scrap.set(25);
      rerender(<ClickerScreen onNavigateToShop={() => {}} />);

      expect(screen.getByText(/Scrap: 25/i)).toBeTruthy();
    });

    test('handles large scrap numbers without breaking', () => {
      const { rerender } = render(<ClickerScreen onNavigateToShop={() => {}} />);

      gameState$.scrap.set(999999);
      rerender(<ClickerScreen onNavigateToShop={() => {}} />);

      expect(screen.getByText(/Scrap: 999999/i)).toBeTruthy();
    });
  });

  describe('Scrap Display Accessibility', () => {
    test('scrap display has text accessibility role', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const scrapText = screen.getByText(/Scrap:/i);
      expect(scrapText.props.accessibilityRole).toBe('text');
    });

    test('scrap display has accessible label with current value', () => {
      const { rerender } = render(<ClickerScreen onNavigateToShop={() => {}} />);

      gameState$.scrap.set(42);
      rerender(<ClickerScreen onNavigateToShop={() => {}} />);

      const scrapText = screen.getByText(/Scrap: 42/i);
      expect(scrapText.props.accessibilityLabel).toMatch(/Scrap: 42/);
    });
  });

  describe('Scrap Generation Timer', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    test('generates scrap after 1 second with 1 pet', () => {
      jest.useFakeTimers();
      render(<ClickerScreen onNavigateToShop={() => {}} />);

      // User has 1 pet
      const feedButton = screen.getByRole('button', { name: /feed/i });
      fireEvent.press(feedButton);

      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should generate 1 scrap
      expect(screen.getByText(/Scrap: 1/i)).toBeTruthy();
    });

    test('generates scrap after 1 second with 10 pets', () => {
      jest.useFakeTimers();
      render(<ClickerScreen onNavigateToShop={() => {}} />);

      // User has 10 pets
      const feedButton = screen.getByRole('button', { name: /feed/i });
      for (let i = 0; i < 10; i++) {
        fireEvent.press(feedButton);
      }

      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should generate 10 scrap
      expect(screen.getByText(/Scrap: 10/i)).toBeTruthy();
    });

    test('generates 0 scrap when pet count is 0', () => {
      jest.useFakeTimers();
      render(<ClickerScreen onNavigateToShop={() => {}} />);

      // No pets (count = 0)

      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should still be 0 scrap
      expect(screen.getByText(/Scrap: 0/i)).toBeTruthy();
    });

    test('generates scrap continuously over multiple ticks', () => {
      jest.useFakeTimers();
      render(<ClickerScreen onNavigateToShop={() => {}} />);

      // User has 3 pets
      const feedButton = screen.getByRole('button', { name: /feed/i });
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);

      // Tick 1: +3 scrap
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 3/i)).toBeTruthy();

      // Tick 2: +3 scrap (total: 6)
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 6/i)).toBeTruthy();

      // Tick 3: +3 scrap (total: 9)
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 9/i)).toBeTruthy();
    });

    test('updates scrap rate when pet count changes mid-session', () => {
      jest.useFakeTimers();
      render(<ClickerScreen onNavigateToShop={() => {}} />);

      const feedButton = screen.getByRole('button', { name: /feed/i });

      // Start with 2 pets
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);

      // Tick 1: +2 scrap
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 2/i)).toBeTruthy();

      // Add 3 more pets (total: 5 pets)
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);

      // Tick 2: +5 scrap (total: 7)
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 7/i)).toBeTruthy();
    });

    test('timer cleans up on component unmount', () => {
      jest.useFakeTimers();
      const { unmount } = render(<ClickerScreen onNavigateToShop={() => {}} />);

      // User has 5 pets
      const feedButton = screen.getByRole('button', { name: /feed/i });
      for (let i = 0; i < 5; i++) {
        fireEvent.press(feedButton);
      }

      // Tick while mounted
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(gameState$.scrap.get()).toBe(5);

      // Unmount component
      unmount();

      // Advance timer after unmount (should NOT generate scrap)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Scrap should still be 5 (no additional generation)
      expect(gameState$.scrap.get()).toBe(5);
    });
  });

  describe('Integration: Pet Count & Scrap', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    test('pet count increment immediately affects next scrap tick', () => {
      jest.useFakeTimers();
      render(<ClickerScreen onNavigateToShop={() => {}} />);

      const feedButton = screen.getByRole('button', { name: /feed/i });

      // Start with 0 pets
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 0/i)).toBeTruthy();

      // Add 1 pet
      fireEvent.press(feedButton);

      // Next tick should use new count
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Scrap: 1/i)).toBeTruthy();
    });

    test('scrap generation does not affect pet count', () => {
      jest.useFakeTimers();
      render(<ClickerScreen onNavigateToShop={() => {}} />);

      const feedButton = screen.getByRole('button', { name: /feed/i });
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);

      // Pet count = 2
      expect(screen.getByText(/Singularity Pet Count: 2/i)).toBeTruthy();

      // Advance timer (generate scrap)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Pet count should still be 2 (unchanged)
      expect(screen.getByText(/Singularity Pet Count: 2/i)).toBeTruthy();
    });
  });

  describe('ClickerScreen props', () => {
    test('accepts onNavigateToShop prop', () => {
      const mockNavigate = jest.fn();
      render(<ClickerScreen onNavigateToShop={mockNavigate} />);
      expect(screen.toJSON()).toBeTruthy();
    });

    test('renders without error when onNavigateToShop provided', () => {
      expect(() => {
        render(<ClickerScreen onNavigateToShop={() => {}} />);
      }).not.toThrow();
    });
  });

  describe('ClickerScreen Navigation', () => {
    test('displays shop button', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const shopButton = screen.getByRole('button', { name: /shop/i });
      expect(shopButton).toBeTruthy();
    });

    test('calls onNavigateToShop when shop button pressed', () => {
      const mockNavigateToShop = jest.fn();
      render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />);

      const shopButton = screen.getByRole('button', { name: /shop/i });
      fireEvent.press(shopButton);

      expect(mockNavigateToShop).toHaveBeenCalledTimes(1);
    });

    test('shop button has accessible label', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const shopButton = screen.getByRole('button', { name: /shop/i });
      expect(shopButton.props.accessibilityLabel).toMatch(/shop/i);
    });

    test('shop button meets minimum touch target size', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);
      const shopButton = screen.getByRole('button', { name: /shop/i });

      const style = Array.isArray(shopButton.props.style)
        ? shopButton.props.style.reduce((acc, s) => ({ ...acc, ...s }), {})
        : shopButton.props.style;

      expect(style.minWidth).toBeGreaterThanOrEqual(44);
      expect(style.minHeight).toBeGreaterThanOrEqual(44);
    });
  });
});
