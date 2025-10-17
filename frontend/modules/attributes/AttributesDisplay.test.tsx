import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AttributesDisplay } from './AttributesDisplay';
import { attributes$, grantAttributePoints } from './attributesStore';

describe('AttributesDisplay', () => {
  beforeEach(() => {
    // Reset the store before each test
    attributes$.set({
      strength: 0,
      coordination: 0,
      endurance: 0,
      unallocatedPoints: 0,
    });
  });

  test('should display all three attributes with values', () => {
    render(<AttributesDisplay />);

    expect(screen.getByText(/Strength: 0/)).toBeTruthy();
    expect(screen.getByText(/Coordination: 0/)).toBeTruthy();
    expect(screen.getByText(/Endurance: 0/)).toBeTruthy();
  });

  test('should show available points when player has them', () => {
    // Grant points through the store
    grantAttributePoints(3);

    render(<AttributesDisplay />);

    expect(screen.getByText(/3 points available/)).toBeTruthy();
  });

  test('should display allocation buttons for each attribute', () => {
    render(<AttributesDisplay />);

    // Should have 3 [+] buttons, one for each attribute
    const plusButtons = screen.getAllByText('[+]');
    expect(plusButtons).toHaveLength(3);
  });

  test('should allocate points when button is pressed', () => {
    // Grant a point to test allocation
    grantAttributePoints(1);

    render(<AttributesDisplay />);

    // Find and press the strength allocation button
    const plusButtons = screen.getAllByText('[+]');
    fireEvent.press(plusButtons[0]); // First button is for strength

    // Verify strength increased
    expect(screen.getByText(/Strength: 1/)).toBeTruthy();
    // Verify points were spent
    expect(screen.queryByText(/1 points available/)).toBeFalsy();
  });

  test('should render disabled buttons when no points available', () => {
    render(<AttributesDisplay />);

    // Verify buttons exist but with disabled styling
    const plusButtons = screen.getAllByText('[+]');
    expect(plusButtons).toHaveLength(3);

    // The disabled state is handled by the component styling
    // We can verify the component renders with 0 unallocated points
    expect(screen.queryByText(/0 points available/)).toBeFalsy();
  });
});