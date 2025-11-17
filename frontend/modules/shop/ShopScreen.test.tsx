import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ShopScreen } from './ShopScreen';
import { gameState$, resetGameState, totalScrapMultiplier$, totalPetBonus$ } from '../../shared/store/gameStore';
import { Upgrade } from '../../shared/types/game';
import { UPGRADES } from './upgradeDefinitions';

const mockUpgrade: Upgrade = {
  id: 'test-upgrade-1',
  name: 'Test Upgrade',
  description: 'A test upgrade',
  cost: 100,
  effectType: 'scrapMultiplier',
  effectValue: 2,
};

describe('ShopScreen', () => {
  const mockNavigateBack = jest.fn();

  beforeEach(() => {
    resetGameState();
    mockNavigateBack.mockClear();
  });

  describe('header rendering', () => {
    test('renders shop title', () => {
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);
      expect(screen.getByText('Shop')).toBeTruthy();
    });

    test('renders back button', () => {
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);
      expect(screen.getByText('← Back')).toBeTruthy();
    });

    test('renders scrap balance in header', () => {
      gameState$.scrap.set(500);
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);
      expect(screen.getByText('500')).toBeTruthy();
    });

    test('calls onNavigateBack when back button pressed', () => {
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);
      const backButton = screen.getByText('← Back');
      fireEvent.press(backButton);
      expect(mockNavigateBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty state', () => {
    test('displays empty state when no upgrades available', () => {
      gameState$.upgrades.set([]);
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      expect(screen.getByText('No upgrades available yet.')).toBeTruthy();
      expect(screen.getByText('Check back soon for new upgrades!')).toBeTruthy();
    });

    test('does not display empty state when upgrades exist', () => {
      gameState$.upgrades.set([mockUpgrade]);
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      expect(screen.queryByText('No upgrades available yet.')).toBeNull();
    });
  });

  describe('upgrade card rendering', () => {
    test('renders upgrade name, description, and cost', () => {
      gameState$.upgrades.set([mockUpgrade]);
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      expect(screen.getByText('Test Upgrade')).toBeTruthy();
      expect(screen.getByText('A test upgrade')).toBeTruthy();
      expect(screen.getByText('Cost: 100 scrap')).toBeTruthy();
    });

    test('renders upgrade effect for scrapMultiplier', () => {
      gameState$.upgrades.set([mockUpgrade]);
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      expect(screen.getByText(/Scrap Multiplier x2/)).toBeTruthy();
    });

    test('renders upgrade effect for petBonus', () => {
      const petBonusUpgrade: Upgrade = {
        id: 'pet-bonus-1',
        name: 'Pet Bonus',
        description: 'Bonus for pets',
        cost: 50,
        effectType: 'petBonus',
        effectValue: 5,
      };

      gameState$.upgrades.set([petBonusUpgrade]);
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      expect(screen.getByText(/Pet Bonus \+5/)).toBeTruthy();
    });

    test('renders multiple upgrade cards', () => {
      const upgrade1: Upgrade = { ...mockUpgrade, id: 'up1', name: 'Upgrade 1' };
      const upgrade2: Upgrade = { ...mockUpgrade, id: 'up2', name: 'Upgrade 2' };

      gameState$.upgrades.set([upgrade1, upgrade2]);
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      expect(screen.getByText('Upgrade 1')).toBeTruthy();
      expect(screen.getByText('Upgrade 2')).toBeTruthy();
    });
  });

  describe('purchase button states', () => {
    test('shows "Buy" button when scrap is sufficient and not owned', () => {
      gameState$.scrap.set(200);
      gameState$.upgrades.set([mockUpgrade]);
      gameState$.purchasedUpgrades.set([]);

      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      expect(screen.getByText('Buy')).toBeTruthy();
    });

    test('shows "Not enough scrap" when scrap is insufficient', () => {
      gameState$.scrap.set(50);
      gameState$.upgrades.set([mockUpgrade]);
      gameState$.purchasedUpgrades.set([]);

      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      expect(screen.getByText('Not enough scrap')).toBeTruthy();
    });

    test('shows "Owned" when upgrade already purchased', () => {
      gameState$.scrap.set(200);
      gameState$.upgrades.set([mockUpgrade]);
      gameState$.purchasedUpgrades.set(['test-upgrade-1']);

      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      expect(screen.getByText('Owned')).toBeTruthy();
    });
  });

  describe('purchase flow', () => {
    test('deducts scrap when purchase button pressed', () => {
      gameState$.scrap.set(200);
      gameState$.upgrades.set([mockUpgrade]);
      gameState$.purchasedUpgrades.set([]);

      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      const buyButton = screen.getByText('Buy');
      fireEvent.press(buyButton);

      expect(gameState$.scrap.get()).toBe(100);
    });

    test('adds upgrade to purchasedUpgrades when purchased', () => {
      gameState$.scrap.set(200);
      gameState$.upgrades.set([mockUpgrade]);
      gameState$.purchasedUpgrades.set([]);

      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      const buyButton = screen.getByText('Buy');
      fireEvent.press(buyButton);

      expect(gameState$.purchasedUpgrades.get()).toContain('test-upgrade-1');
    });

    test('prevents double purchase', () => {
      gameState$.scrap.set(200);
      gameState$.upgrades.set([mockUpgrade]);
      gameState$.purchasedUpgrades.set([]);

      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      const buyButton = screen.getByText('Buy');
      fireEvent.press(buyButton);
      fireEvent.press(buyButton);

      expect(gameState$.purchasedUpgrades.get().length).toBe(1);
      expect(gameState$.scrap.get()).toBe(100);
    });

    test('allows purchase when scrap equals cost', () => {
      gameState$.scrap.set(100);
      gameState$.upgrades.set([mockUpgrade]);
      gameState$.purchasedUpgrades.set([]);

      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      const buyButton = screen.getByText('Buy');
      fireEvent.press(buyButton);

      expect(gameState$.scrap.get()).toBe(0);
      expect(gameState$.purchasedUpgrades.get()).toContain('test-upgrade-1');
    });
  });

  describe('reactive updates', () => {
    test('scrap display updates when scrap changes', () => {
      gameState$.scrap.set(100);
      const { rerender } = render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      expect(screen.getByText('100')).toBeTruthy();

      gameState$.scrap.set(200);
      rerender(<ShopScreen onNavigateBack={mockNavigateBack} />);

      expect(screen.getByText('200')).toBeTruthy();
    });

    test('button label changes from "Buy" to "Owned" after purchase', () => {
      gameState$.scrap.set(200);
      gameState$.upgrades.set([mockUpgrade]);
      gameState$.purchasedUpgrades.set([]);

      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      expect(screen.getByText('Buy')).toBeTruthy();

      const buyButton = screen.getByText('Buy');
      fireEvent.press(buyButton);

      expect(screen.getByText('Owned')).toBeTruthy();
      expect(screen.queryByText('Buy')).toBeNull();
    });
  });

  describe('accessibility', () => {
    test('back button has correct accessibility attributes', () => {
      const { getByLabelText } = render(
        <ShopScreen onNavigateBack={mockNavigateBack} />
      );

      const backButton = getByLabelText('Back to main screen');
      expect(backButton).toBeTruthy();
      expect(backButton.props.accessibilityRole).toBe('button');
    });

    test('purchase button has correct accessibility label', () => {
      gameState$.scrap.set(200);
      gameState$.upgrades.set([mockUpgrade]);
      gameState$.purchasedUpgrades.set([]);

      const { getByLabelText } = render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      const button = getByLabelText(`Buy ${mockUpgrade.name} for ${mockUpgrade.cost} scrap`);
      expect(button).toBeTruthy();
      expect(button.props.accessibilityRole).toBe('button');
    });
  });

  describe('Upgrade Effects Integration', () => {
    beforeEach(() => {
      gameState$.set({
        petCount: 0,
        scrap: 5000,
        upgrades: UPGRADES,
        purchasedUpgrades: [],
      });
    });

    test('purchasing scrap multiplier upgrade updates computed observable', () => {
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      const buyButton = screen.getByLabelText(/Buy Scrap Finder/i);
      fireEvent.press(buyButton);

      expect(totalScrapMultiplier$.get()).toBe(0.1);
      expect(gameState$.scrap.get()).toBe(4900); // 5000 - 100
      expect(gameState$.purchasedUpgrades.get()).toContain('scrap-boost-1');
    });

    test('purchasing pet bonus upgrade updates computed observable', () => {
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      const buyButton = screen.getByLabelText(/Buy Extra Feed/i);
      fireEvent.press(buyButton);

      expect(totalPetBonus$.get()).toBe(1);
      expect(gameState$.scrap.get()).toBe(4800); // 5000 - 200
      expect(gameState$.purchasedUpgrades.get()).toContain('pet-boost-1');
    });

    test('purchasing multiple upgrades stacks effects', () => {
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      fireEvent.press(screen.getByLabelText(/Buy Scrap Finder/i));
      fireEvent.press(screen.getByLabelText(/Buy Scrap Magnet/i));

      expect(totalScrapMultiplier$.get()).toBeCloseTo(0.25, 5); // 0.1 + 0.15
      expect(gameState$.scrap.get()).toBe(4400); // 5000 - 100 - 500
    });

    test('displays all 5 upgrades from definitions', () => {
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);

      expect(screen.getByText('Scrap Finder')).toBeTruthy();
      expect(screen.getByText('Scrap Magnet')).toBeTruthy();
      expect(screen.getByText('Scrap Amplifier')).toBeTruthy();
      expect(screen.getByText('Extra Feed')).toBeTruthy();
      expect(screen.getByText('Double Feed')).toBeTruthy();
    });
  });
});
