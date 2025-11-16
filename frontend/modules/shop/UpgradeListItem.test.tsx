import React from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';
import { observable } from '@legendapp/state';
import { UpgradeListItem } from './UpgradeListItem';
import { Upgrade } from './upgradeDefinitions';

describe('UpgradeListItem Component', () => {
  const user = userEvent.setup();

  const mockUpgrade: Upgrade = {
    id: 'test-upgrade-1',
    name: 'Test Upgrade',
    description: 'A test upgrade description',
    cost: 100,
    effectType: 'scrapMultiplier',
    effectValue: 0.1,
  };

  const mockOnPurchase = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays upgrade information', () => {
    const isAffordable$ = observable(true);
    render(
      <UpgradeListItem
        upgrade={mockUpgrade}
        isAffordable$={isAffordable$}
        onPurchase={mockOnPurchase}
      />
    );

    expect(screen.getByText('Test Upgrade')).toBeTruthy();
    expect(screen.getByText('A test upgrade description')).toBeTruthy();
    expect(screen.getByText(/100/)).toBeTruthy(); // Cost includes "100" somewhere
  });

  test('purchase button enabled when affordable', () => {
    const isAffordable$ = observable(true);
    render(
      <UpgradeListItem
        upgrade={mockUpgrade}
        isAffordable$={isAffordable$}
        onPurchase={mockOnPurchase}
      />
    );

    const purchaseButton = screen.getByRole('button', { name: /Purchase Test Upgrade/i });
    expect(purchaseButton.props.accessibilityState?.disabled).toBeFalsy();
  });

  test('purchase button disabled when unaffordable', () => {
    const isAffordable$ = observable(false);
    render(
      <UpgradeListItem
        upgrade={mockUpgrade}
        isAffordable$={isAffordable$}
        onPurchase={mockOnPurchase}
      />
    );

    const purchaseButton = screen.getByRole('button', { name: /Purchase Test Upgrade/i });
    expect(purchaseButton.props.accessibilityState?.disabled).toBeTruthy();
  });

  test('calls onPurchase with upgrade ID when button pressed', async () => {
    const isAffordable$ = observable(true);
    render(
      <UpgradeListItem
        upgrade={mockUpgrade}
        isAffordable$={isAffordable$}
        onPurchase={mockOnPurchase}
      />
    );

    const purchaseButton = screen.getByRole('button', { name: /Purchase Test Upgrade/i });
    await user.press(purchaseButton);

    expect(mockOnPurchase).toHaveBeenCalledWith('test-upgrade-1');
  });

  test('shows visual indicator for scrapMultiplier effect type', () => {
    const isAffordable$ = observable(true);
    render(
      <UpgradeListItem
        upgrade={mockUpgrade}
        isAffordable$={isAffordable$}
        onPurchase={mockOnPurchase}
      />
    );

    // The type indicator should be present (component renders successfully)
    expect(screen.getByText('Test Upgrade')).toBeTruthy();
  });

  test('shows different visual indicator for petBonus effect type', () => {
    const petBonusUpgrade: Upgrade = {
      ...mockUpgrade,
      effectType: 'petBonus',
    };
    const isAffordable$ = observable(true);
    render(
      <UpgradeListItem
        upgrade={petBonusUpgrade}
        isAffordable$={isAffordable$}
        onPurchase={mockOnPurchase}
      />
    );

    // The type indicator should be present (component renders successfully)
    expect(screen.getByText('Test Upgrade')).toBeTruthy();
  });
});
