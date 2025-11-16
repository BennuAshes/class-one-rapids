import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import App from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

describe('Core Clicker E2E Flow', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('complete user session with persistence', async () => {
    // Session 1: User opens app, taps 5 times
    (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([]);

    const { unmount } = render(<App />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Get initial count
    const initialText = screen.getByText(/Singularity Pet Count:/i);
    const initialMatch = initialText.props.children.join('').match(/(\d+)/);
    const startCount = initialMatch ? parseInt(initialMatch[1]) : 0;

    // User taps 5 times
    for (let i = 0; i < 5; i++) {
      await user.press(button);
    }

    await waitFor(() => {
      const text = screen.getByText(/Singularity Pet Count:/i);
      const match = text.props.children.join('').match(/(\d+)/);
      const count = match ? parseInt(match[1]) : 0;
      expect(count).toBe(startCount + 5);
    });

    const session1Text = screen.getByText(/Singularity Pet Count:/i);
    const session1Match = session1Text.props.children.join('').match(/(\d+)/);
    const session1Count = session1Match ? parseInt(session1Match[1]) : 0;

    // Wait for persistence (debounced 1 second)
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    }, { timeout: 2000 });

    // User closes app
    unmount();

    // Session 2: User reopens app (using same observable due to singleton)
    render(<App />);

    // Counter restored from previous session (singleton pattern)
    await waitFor(() => {
      const session2Text = screen.getByText(/Singularity Pet Count:/i);
      const session2Match = session2Text.props.children.join('').match(/(\d+)/);
      const session2Count = session2Match ? parseInt(session2Match[1]) : 0;
      expect(session2Count).toBe(session1Count);
    });

    const buttonSession2 = screen.getByRole('button', { name: /feed/i });

    // User continues from where they left off
    await user.press(buttonSession2);

    await waitFor(() => {
      const finalText = screen.getByText(/Singularity Pet Count:/i);
      const finalMatch = finalText.props.children.join('').match(/(\d+)/);
      const finalCount = finalMatch ? parseInt(finalMatch[1]) : 0;
      expect(finalCount).toBe(session1Count + 1);
    });
  });

  test('handles rapid tapping at target rate (30 taps/minute)', async () => {
    (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([]);

    render(<App />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Get initial count
    const initialText = screen.getByText(/Singularity Pet Count:/i);
    const initialMatch = initialText.props.children.join('').match(/(\d+)/);
    const startCount = initialMatch ? parseInt(initialMatch[1]) : 0;

    // Simulate rapid tapping (30 taps)
    for (let i = 0; i < 30; i++) {
      await user.press(button);
    }

    // Verify final count is accurate
    await waitFor(() => {
      const finalText = screen.getByText(/Singularity Pet Count:/i);
      const finalMatch = finalText.props.children.join('').match(/(\d+)/);
      const finalCount = finalMatch ? parseInt(finalMatch[1]) : 0;
      expect(finalCount).toBe(startCount + 30);
    });
  });

  test('recovers gracefully from AsyncStorage failures', async () => {
    // Storage fails to load
    (AsyncStorage.multiGet as jest.Mock).mockRejectedValue(new Error('Storage unavailable'));

    render(<App />);

    // App should still work
    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count:/i)).toBeTruthy();
    });

    const button = screen.getByRole('button', { name: /feed/i });

    // Get initial count
    const initialText = screen.getByText(/Singularity Pet Count:/i);
    const initialMatch = initialText.props.children.join('').match(/(\d+)/);
    const startCount = initialMatch ? parseInt(initialMatch[1]) : 0;

    // User can still interact
    await user.press(button);

    await waitFor(() => {
      const newText = screen.getByText(/Singularity Pet Count:/i);
      const newMatch = newText.props.children.join('').match(/(\d+)/);
      const newCount = newMatch ? parseInt(newMatch[1]) : 0;
      expect(newCount).toBe(startCount + 1);
    });
  });

  test('persists multiple increments with debounce', async () => {
    (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([]);

    render(<App />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Get initial count
    const initialText = screen.getByText(/Singularity Pet Count:/i);
    const initialMatch = initialText.props.children.join('').match(/(\d+)/);
    const startCount = initialMatch ? parseInt(initialMatch[1]) : 0;

    // Rapid taps (within debounce window)
    await user.press(button);
    await user.press(button);
    await user.press(button);

    await waitFor(() => {
      const text = screen.getByText(/Singularity Pet Count:/i);
      const match = text.props.children.join('').match(/(\d+)/);
      const count = match ? parseInt(match[1]) : 0;
      expect(count).toBe(startCount + 3);
    });

    // Wait for debounced persist
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    }, { timeout: 2000 });
  });
});
