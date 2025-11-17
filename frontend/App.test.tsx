import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { userEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetNavigation } from './shared/hooks/useNavigation';
import App from './App';

describe('App Navigation Integration', () => {
  test('renders without import errors', () => {
    // This test FAILS if ClickerScreen module doesn't exist or has import errors
    expect(() => render(<App />)).not.toThrow();
  });

  test('displays clicker screen by default', () => {
    render(<App />);

    // This test FAILS if ClickerScreen doesn't render or lacks these elements
    expect(screen.getByRole('button', { name: /feed/i })).toBeTruthy();
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('clicker screen is accessible from app root', () => {
    render(<App />);

    // Verify counter display is present (validates integration)
    const counter = screen.getByText(/Singularity Pet Count: 0/i);
    expect(counter).toBeTruthy();
  });
});

describe('App Multi-Screen Navigation Integration', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    resetNavigation();
  });

  test('renders without import errors', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  test('displays clicker screen by default', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /feed/i })).toBeTruthy();
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('displays shop navigation button on clicker screen', () => {
    render(<App />);
    const shopButton = screen.getByRole('button', { name: /shop/i });
    expect(shopButton).toBeTruthy();
  });

  test('navigates to shop screen when shop button pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      expect(screen.getByText(/scrap:/i)).toBeTruthy();
      expect(screen.queryByRole('button', { name: /feed/i })).toBeNull();
    });
  });

  test('navigates back to clicker when back button pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      expect(screen.getByText(/scrap:/i)).toBeTruthy();
    });

    // Navigate back
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.press(backButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /feed/i })).toBeTruthy();
    });
  });

  test('preserves scrap balance across screen navigation', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Feed to generate scrap
    const feedButton = screen.getByRole('button', { name: /feed/i });
    await user.press(feedButton);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      expect(screen.getByText(/scrap: 1/i)).toBeTruthy();
    });

    // Navigate back
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.press(backButton);

    // Navigate to shop again
    await user.press(screen.getByRole('button', { name: /shop/i }));

    await waitFor(() => {
      expect(screen.getByText(/scrap: 1/i)).toBeTruthy();
    });
  });
});
