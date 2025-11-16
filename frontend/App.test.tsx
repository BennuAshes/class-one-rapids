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
});
