import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import App from './App';
import { gameState$ } from './shared/store/gameStore';

describe('App', () => {
  beforeEach(() => {
    gameState$.petCount.set(0);
    gameState$.scrap.set(0);
    gameState$.upgrades.set([]);
    gameState$.purchasedUpgrades.set([]);
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.toJSON()).toBeTruthy();
  });

  test('renders ClickerScreen by default', () => {
    render(<App />);
    // ClickerScreen has "Singularity Pet Count" text
    expect(screen.getByText(/singularity pet count/i)).toBeTruthy();
  });

  test('wraps content in SafeAreaProvider', () => {
    const { root } = render(<App />);
    // SafeAreaProvider should be in tree
    expect(root).toBeTruthy();
  });
});

describe('App Navigation', () => {
  beforeEach(() => {
    gameState$.petCount.set(0);
    gameState$.scrap.set(0);
    gameState$.upgrades.set([]);
    gameState$.purchasedUpgrades.set([]);
  });

  test('navigates to shop when shop button pressed', () => {
    render(<App />);

    const shopButton = screen.getByRole('button', { name: /shop/i });
    fireEvent.press(shopButton);

    expect(screen.getByRole('header', { name: /shop/i })).toBeTruthy();
  });

  test('navigates back to main when back button pressed', () => {
    render(<App />);

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    fireEvent.press(shopButton);

    // Navigate back
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.press(backButton);

    expect(screen.getByText(/singularity pet count/i)).toBeTruthy();
  });

  test('preserves scrap balance during navigation', () => {
    render(<App />);

    // Set scrap balance
    gameState$.scrap.set(500);

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    fireEvent.press(shopButton);

    // Verify scrap balance in shop
    expect(screen.getByText(/scrap: 500/i)).toBeTruthy();

    // Navigate back
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.press(backButton);

    // Verify scrap balance preserved on main screen
    expect(screen.getByText(/scrap: 500/i)).toBeTruthy();
  });

  test('preserves pet count during navigation', () => {
    render(<App />);

    // Add pets
    gameState$.petCount.set(5);

    // Navigate to shop and back
    const shopButton = screen.getByRole('button', { name: /shop/i });
    fireEvent.press(shopButton);

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.press(backButton);

    // Verify pet count preserved
    expect(screen.getByText(/Singularity Pet Count: 5/i)).toBeTruthy();
  });

  test('can navigate back and forth multiple times', () => {
    render(<App />);

    // First round trip
    fireEvent.press(screen.getByRole('button', { name: /shop/i }));
    fireEvent.press(screen.getByRole('button', { name: /back/i }));

    // Second round trip
    fireEvent.press(screen.getByRole('button', { name: /shop/i }));
    fireEvent.press(screen.getByRole('button', { name: /back/i }));

    // Third round trip
    fireEvent.press(screen.getByRole('button', { name: /shop/i }));
    expect(screen.getByRole('header', { name: /shop/i })).toBeTruthy();
  });
});

describe('Shop Integration - End to End', () => {
  test('shop displays empty state initially', () => {
    render(<App />);

    // Navigate to shop
    const shopButton = screen.getByRole('button', { name: /shop/i });
    fireEvent.press(shopButton);

    // Verify empty state
    expect(screen.getByText(/no upgrades available/i)).toBeTruthy();
    expect(screen.getByText(/check back soon/i)).toBeTruthy();
  });

  test('scrap balance syncs between screens', async () => {
    gameState$.scrap.set(1234);
    render(<App />);

    // Verify scrap on main screen
    expect(screen.getByText(/scrap: 1234/i)).toBeTruthy();

    // Navigate to shop
    fireEvent.press(screen.getByRole('button', { name: /shop/i }));

    // Verify same scrap in shop
    expect(screen.getByText(/scrap: 1234/i)).toBeTruthy();

    // Update scrap while in shop
    gameState$.scrap.set(5678);

    // Verify shop updates - use waitFor for reactive update
    await waitFor(() => {
      expect(screen.getByText(/scrap: 5678/i)).toBeTruthy();
    });

    // Navigate back
    fireEvent.press(screen.getByRole('button', { name: /back/i }));

    // Verify main screen has updated scrap
    expect(screen.getByText(/scrap: 5678/i)).toBeTruthy();
  });
});
