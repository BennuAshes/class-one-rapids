import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WelcomeBackModal } from './WelcomeBackModal';
import { OfflineRewards } from './types';

describe('WelcomeBackModal', () => {
  const mockOnCollect = jest.fn();

  beforeEach(() => {
    mockOnCollect.mockClear();
  });

  test('shows nothing when not visible', () => {
    const { queryByText } = render(
      <WelcomeBackModal
        rewards={null}
        isVisible={false}
        onCollect={mockOnCollect}
      />
    );

    expect(queryByText('Welcome Back!')).toBeNull();
  });

  test('shows simple welcome message for time away without rewards', () => {
    const { getByText } = render(
      <WelcomeBackModal
        rewards={null}
        isVisible={true}
        onCollect={mockOnCollect}
        timeAway={5}
      />
    );

    expect(getByText('Welcome back! You were away for 5 minutes')).toBeTruthy();
    expect(getByText('Continue')).toBeTruthy();
  });

  test('shows detailed rewards when meaningful rewards exist', () => {
    const rewards: OfflineRewards = {
      timeOffline: 120,
      enemiesDefeated: 5,
      xpGained: 12,
      pyrealGained: 8
    };

    const { getByText } = render(
      <WelcomeBackModal
        rewards={rewards}
        isVisible={true}
        onCollect={mockOnCollect}
      />
    );

    expect(getByText('Welcome Back!')).toBeTruthy();
    expect(getByText('You were away for 120 minutes')).toBeTruthy();
    expect(getByText('5 Enemies Defeated')).toBeTruthy();
    expect(getByText('+12 XP')).toBeTruthy();
    expect(getByText('+8 Pyreal')).toBeTruthy();
    expect(getByText('Tap to Collect')).toBeTruthy();
  });

  test('calls onCollect when collect button is pressed', () => {
    const rewards: OfflineRewards = {
      timeOffline: 60,
      enemiesDefeated: 2,
      xpGained: 5,
      pyrealGained: 3
    };

    const { getByText } = render(
      <WelcomeBackModal
        rewards={rewards}
        isVisible={true}
        onCollect={mockOnCollect}
      />
    );

    fireEvent.press(getByText('Tap to Collect'));
    expect(mockOnCollect).toHaveBeenCalledTimes(1);
  });

  test('shows nothing when rewards exist but no enemies defeated', () => {
    const rewards: OfflineRewards = {
      timeOffline: 30,
      enemiesDefeated: 0,
      xpGained: 0,
      pyrealGained: 0
    };

    const { queryByText } = render(
      <WelcomeBackModal
        rewards={rewards}
        isVisible={true}
        onCollect={mockOnCollect}
      />
    );

    expect(queryByText('Welcome Back!')).toBeNull();
  });
});