import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ShopScreen } from './ShopScreen';
import { gameState$ } from '../../shared/store/gameStore';

describe('ShopScreen', () => {
  beforeEach(() => {
    gameState$.scrap.set(0);
    gameState$.upgrades.set([]);
    gameState$.purchasedUpgrades.set([]);
  });

  describe('Initial Render', () => {
    test('renders without crashing', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.toJSON()).toBeTruthy();
    });

    test('accepts onNavigateBack prop', () => {
      const mockCallback = jest.fn();
      render(<ShopScreen onNavigateBack={mockCallback} />);
      // Component should render without error
      expect(screen.toJSON()).toBeTruthy();
    });
  });

  describe('Header', () => {
    test('displays shop title', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/shop/i)).toBeTruthy();
    });

    test('title has header accessibility role', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      const title = screen.getByRole('header');
      expect(title).toBeTruthy();
      expect(title.props.children).toMatch(/shop/i);
    });
  });

  describe('Navigation', () => {
    test('displays back button', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeTruthy();
    });

    test('calls onNavigateBack when back button pressed', () => {
      const mockNavigateBack = jest.fn();
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.press(backButton);

      expect(mockNavigateBack).toHaveBeenCalledTimes(1);
    });

    test('back button has accessible label', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton.props.accessibilityLabel).toMatch(/back/i);
    });
  });

  describe('Scrap Balance Display', () => {
    test('displays scrap balance', () => {
      gameState$.scrap.set(100);
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/scrap: 100/i)).toBeTruthy();
    });

    test('displays zero scrap initially', () => {
      gameState$.scrap.set(0);
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/scrap: 0/i)).toBeTruthy();
    });

    test('updates when scrap changes', () => {
      const { rerender } = render(<ShopScreen onNavigateBack={() => {}} />);

      gameState$.scrap.set(250);
      rerender(<ShopScreen onNavigateBack={() => {}} />);

      expect(screen.getByText(/scrap: 250/i)).toBeTruthy();
    });

    test('handles large scrap numbers', () => {
      gameState$.scrap.set(999999);
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/scrap: 999999/i)).toBeTruthy();
    });

    test('scrap balance has accessibility attributes', () => {
      gameState$.scrap.set(100);
      render(<ShopScreen onNavigateBack={() => {}} />);

      const scrapText = screen.getByText(/scrap: 100/i);
      expect(scrapText.props.accessibilityRole).toBe('text');
    });
  });

  describe('Empty State', () => {
    test('displays empty state when no upgrades', () => {
      gameState$.upgrades.set([]);
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/no upgrades available/i)).toBeTruthy();
    });

    test('displays empty state subtext', () => {
      gameState$.upgrades.set([]);
      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.getByText(/check back soon/i)).toBeTruthy();
    });

    test('empty state text has accessibility role', () => {
      gameState$.upgrades.set([]);
      render(<ShopScreen onNavigateBack={() => {}} />);

      const emptyText = screen.getByText(/no upgrades available/i);
      expect(emptyText.props.accessibilityRole).toBe('text');
    });

    test('does not display empty state when upgrades exist', () => {
      gameState$.upgrades.set([
        {
          id: 'test',
          name: 'Test Upgrade',
          description: 'Test',
          scrapCost: 100,
          type: 'scrap-per-pet',
          effectValue: 0.5,
        },
      ]);

      render(<ShopScreen onNavigateBack={() => {}} />);
      expect(screen.queryByText(/no upgrades available/i)).toBeNull();
    });
  });

  describe('Accessibility', () => {
    test('header has correct accessibility role', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      const header = screen.getByRole('header');
      expect(header.props.accessibilityRole).toBe('header');
    });

    test('back button has accessible label', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton.props.accessibilityLabel).toMatch(/back/i);
    });

    test('back button meets minimum touch target size', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);
      const backButton = screen.getByRole('button', { name: /back/i });

      // Extract style (may be array or object)
      const style = Array.isArray(backButton.props.style)
        ? backButton.props.style.reduce((acc, s) => ({ ...acc, ...s }), {})
        : backButton.props.style;

      expect(style.minWidth).toBeGreaterThanOrEqual(44);
      expect(style.minHeight).toBeGreaterThanOrEqual(44);
    });

    test('all text elements have appropriate roles', () => {
      gameState$.scrap.set(100);
      gameState$.upgrades.set([]);

      render(<ShopScreen onNavigateBack={() => {}} />);

      // Check header
      expect(screen.getByRole('header')).toBeTruthy();

      // Check text elements
      const textElements = screen.getAllByRole('text');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });
});
