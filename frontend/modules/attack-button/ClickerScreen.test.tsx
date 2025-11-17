import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { userEvent } from '@testing-library/react-native';
import { ClickerScreen } from './ClickerScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('ClickerScreen Component', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('renders feed button with correct accessibility attributes', () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });
    expect(button).toBeTruthy();
    expect(button.props.accessibilityLabel).toBe('Feed');
  });

  test('renders counter display with initial value 0', async () => {
    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
    });
  });

  test('increments counter when button pressed', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });
    await user.press(button);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });
  });

  test('handles rapid taps accurately', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Tap 10 times rapidly
    for (let i = 0; i < 10; i++) {
      await user.press(button);

      await waitFor(() => {
        expect(screen.getByText(`Singularity Pet Count: ${i + 1}`)).toBeTruthy();
      });
    }

    // Final verification
    expect(screen.getByText(/Singularity Pet Count: 10/i)).toBeTruthy();
  });

  test('button meets accessibility touch target size', () => {
    render(<ClickerScreen />);

    const button = screen.getByTestId('feed-button');
    const style = Array.isArray(button.props.style)
      ? Object.assign({}, ...button.props.style)
      : button.props.style;

    expect(style.minWidth).toBeGreaterThanOrEqual(44);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });

  test('counter text has correct accessibility attributes', async () => {
    render(<ClickerScreen />);

    await waitFor(() => {
      const counter = screen.getByText(/Singularity Pet Count: 0/i);
      expect(counter.props.accessibilityRole).toBe('text');
    });
  });
});
