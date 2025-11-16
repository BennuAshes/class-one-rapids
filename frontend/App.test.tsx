import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { renderHook, act } from '@testing-library/react-native';
import App from './App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from './shared/hooks/useNavigation';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

describe('App Integration - Core Clicker', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  test('renders without import errors', () => {
    // This test FAILS if ClickerScreen doesn't exist or can't be imported
    expect(() => render(<App />)).not.toThrow();
  });

  test('displays Singularity Pet Count on launch', () => {
    render(<App />);

    // Verify clicker screen is visible to user
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('displays feed button', () => {
    render(<App />);

    const feedButton = screen.getByRole('button', { name: /feed/i });
    expect(feedButton).toBeTruthy();
  });

  test('increments count when feed button is tapped', async () => {
    render(<App />);

    const feedButton = screen.getByRole('button', { name: /feed/i });

    // Get initial count
    const initialText = screen.getByText(/Singularity Pet Count:/i);
    const initialMatch = initialText.props.children.join('').match(/(\d+)/);
    const initialCount = initialMatch ? parseInt(initialMatch[1]) : 0;

    await user.press(feedButton);

    await waitFor(() => {
      const newText = screen.getByText(/Singularity Pet Count:/i);
      const newMatch = newText.props.children.join('').match(/(\d+)/);
      const newCount = newMatch ? parseInt(newMatch[1]) : 0;
      expect(newCount).toBe(initialCount + 1);
    });
  });

  test('handles multiple taps accurately', async () => {
    render(<App />);

    const feedButton = screen.getByRole('button', { name: /feed/i });

    // Get initial count
    const initialText = screen.getByText(/Singularity Pet Count:/i);
    const initialMatch = initialText.props.children.join('').match(/(\d+)/);
    const startCount = initialMatch ? parseInt(initialMatch[1]) : 0;

    // Tap 3 times
    await user.press(feedButton);
    await user.press(feedButton);
    await user.press(feedButton);

    await waitFor(() => {
      const finalText = screen.getByText(/Singularity Pet Count:/i);
      const finalMatch = finalText.props.children.join('').match(/(\d+)/);
      const finalCount = finalMatch ? parseInt(finalMatch[1]) : 0;
      expect(finalCount).toBe(startCount + 3);
    });
  });
});

describe('App Navigation Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    // Reset navigation state before each test
    const { result } = renderHook(() => useNavigation());
    act(() => {
      result.current.actions.reset();
    });
  });

  test('starts on clicker screen', () => {
    render(<App />);
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('navigates to shop when shop button pressed', async () => {
    render(<App />);

    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      expect(screen.getByText(/available upgrades/i)).toBeTruthy();
    });
  });

  test('navigates back to clicker when back button pressed', async () => {
    render(<App />);

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    await user.press(shopButton);

    await waitFor(() => {
      expect(screen.getByText(/available upgrades/i)).toBeTruthy();
    });

    // Navigate back
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.press(backButton);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
    });
  });
});
