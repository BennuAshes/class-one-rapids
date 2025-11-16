import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import App from './App';

describe('App Navigation Integration', () => {
  test('renders without import errors', () => {
    // This test FAILS if ClickerScreen or ShopScreen imports cannot resolve
    expect(() => render(<App />)).not.toThrow();
  });

  test('displays clicker screen by default', () => {
    render(<App />);

    // This test FAILS until ClickerScreen is implemented with proper content
    expect(screen.getByText(/singularity pet count/i)).toBeTruthy();
  });

  test('renders feed button on clicker screen', () => {
    render(<App />);

    // This test FAILS until ClickerScreen has feed button
    expect(screen.getByText('feed')).toBeTruthy();
  });

  test('can navigate to shop screen', () => {
    render(<App />);

    // Find and press shop navigation button
    const shopButton = screen.getByText(/shop/i);
    fireEvent.press(shopButton);

    // Verify shop screen is displayed
    // This test FAILS until ShopScreen is implemented
    expect(screen.getByText(/shop screen/i)).toBeTruthy();
  });

  test('can navigate back to clicker screen from shop', () => {
    render(<App />);

    // Navigate to shop
    const shopButton = screen.getByText(/shop/i);
    fireEvent.press(shopButton);

    // Navigate back
    const backButton = screen.getByText(/back/i);
    fireEvent.press(backButton);

    // Verify clicker screen is displayed again
    expect(screen.getByText('feed')).toBeTruthy();
  });
});
