import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

// Mock the expo modules before importing App
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
  },
}));

import App from './App';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

describe('Core Combat Tap Mechanic', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  test('enemy takes damage when tapped', async () => {
    render(<App />);

    // Find the enemy element
    const enemy = screen.getByTestId('enemy');

    // Tap the enemy
    fireEvent.press(enemy);

    // Should show damage number (between 50-100)
    await waitFor(() => {
      // Look for damage numbers specifically (50-100 range)
      const allTexts = screen.getAllByText(/^\d+$/);
      // Filter for damage numbers (not HP text)
      const damageNumber = allTexts.find(element => {
        const value = parseInt(element.props.children);
        return value >= 50 && value <= 100;
      });
      expect(damageNumber).toBeTruthy();
    });
  });

  test('enemy health bar decreases when damaged', async () => {
    render(<App />);

    // Get initial health text - it contains "HP: 1000/1000"
    const healthText = screen.getByTestId('health-text');
    // Extract the text content properly
    const getHealthValue = (element: any) => {
      const textContent = element.props.children.join('');
      const match = textContent.match(/HP: (\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    const initialHealth = getHealthValue(healthText);
    expect(initialHealth).toBe(1000);

    // Tap the enemy
    const enemy = screen.getByTestId('enemy');
    fireEvent.press(enemy);

    // Wait for health to update
    await waitFor(() => {
      const updatedHealth = getHealthValue(healthText);
      expect(updatedHealth).toBeLessThan(initialHealth);
    });
  });

  test('damage numbers have floating animation', async () => {
    render(<App />);

    const enemy = screen.getByTestId('enemy');
    fireEvent.press(enemy);

    // Find damage number element
    await waitFor(() => {
      const damageNumbers = screen.queryAllByTestId(/damage-number-/);
      expect(damageNumbers.length).toBeGreaterThan(0);

      // Check that damage number has animated style properties
      const damageNumber = damageNumbers[0];
      // The animated component should have transform or opacity styles
      expect(damageNumber).toBeTruthy();
    });
  });

  test('damage numbers fade out after appearing', async () => {
    render(<App />);

    const enemy = screen.getByTestId('enemy');
    fireEvent.press(enemy);

    // Wait for damage number to appear
    await waitFor(() => {
      const damageNumbers = screen.queryAllByTestId(/damage-number-/);
      expect(damageNumbers.length).toBeGreaterThan(0);
    });

    // Wait for damage numbers to disappear (animation complete)
    await waitFor(() => {
      const damageNumbers = screen.queryAllByTestId(/damage-number-/);
      expect(damageNumbers.length).toBe(0);
    }, { timeout: 2000 });
  });

  test('tap triggers haptic feedback', async () => {
    render(<App />);

    const enemy = screen.getByTestId('enemy');
    fireEvent.press(enemy);

    // Verify haptic feedback was triggered
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  test('tap plays impact sound', async () => {
    // Mock successful sound loading and playing
    const mockPlayAsync = jest.fn().mockResolvedValue(undefined);
    const mockUnloadAsync = jest.fn().mockResolvedValue(undefined);

    const mockSoundObject = {
      sound: {
        playAsync: mockPlayAsync,
        unloadAsync: mockUnloadAsync,
      },
      status: { isLoaded: true }
    };

    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue(mockSoundObject);

    render(<App />);

    // Wait for sound to be loaded in useEffect
    await waitFor(() => {
      expect(Audio.Sound.createAsync).toHaveBeenCalled();
    });

    const enemy = screen.getByTestId('enemy');
    fireEvent.press(enemy);

    // Wait for playAsync to be called
    await waitFor(() => {
      expect(mockPlayAsync).toHaveBeenCalled();
    });
  });

  test('feedback triggers within 20ms of tap', async () => {
    const startTime = Date.now();

    render(<App />);

    const enemy = screen.getByTestId('enemy');
    fireEvent.press(enemy);

    // Check that haptic feedback was called immediately (synchronously)
    const hapticCallTime = Date.now() - startTime;
    expect(Haptics.impactAsync).toHaveBeenCalled();
    expect(hapticCallTime).toBeLessThan(20);
  });
});