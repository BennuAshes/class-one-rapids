import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import App from './App';

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
