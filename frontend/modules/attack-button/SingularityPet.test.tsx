import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { userEvent } from '@testing-library/react-native';
import { SingularityPet } from './SingularityPet';

describe('SingularityPet Component', () => {
  describe('Rendering', () => {
    test('renders with initial count of 0', () => {
      render(<SingularityPet />);

      // Verify counter displays initial state
      expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
    });

    test('renders feed button with correct label', () => {
      render(<SingularityPet />);

      // Verify button exists with "feed" text
      expect(screen.getByText('feed')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    test('increments count by 1 when feed button is pressed', async () => {
      const user = userEvent.setup();
      render(<SingularityPet />);

      const feedButton = screen.getByText('feed');
      await user.press(feedButton);

      // Verify count incremented to 1
      expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
    });

    test('handles sequential clicks correctly', async () => {
      const user = userEvent.setup();
      render(<SingularityPet />);

      const feedButton = screen.getByText('feed');

      // Click 5 times
      await user.press(feedButton);
      await user.press(feedButton);
      await user.press(feedButton);
      await user.press(feedButton);
      await user.press(feedButton);

      // Verify count is 5
      expect(screen.getByText(/Singularity Pet Count: 5/i)).toBeTruthy();
    });

    test('handles rapid clicking without missing increments', async () => {
      const user = userEvent.setup();
      render(<SingularityPet />);

      const feedButton = screen.getByText('feed');

      // Rapid click 10 times (testing functional state updates)
      for (let i = 0; i < 10; i++) {
        await user.press(feedButton);
      }

      // Verify all clicks were counted
      expect(screen.getByText(/Singularity Pet Count: 10/i)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    test('button has correct accessibility attributes', () => {
      render(<SingularityPet />);

      const feedButton = screen.getByRole('button');

      // Verify accessibility role
      expect(feedButton).toBeTruthy();
      expect(feedButton.props.accessibilityRole).toBe('button');
      expect(feedButton.props.accessibilityLabel).toBeTruthy();
    });

    test('counter text is accessible to screen readers', () => {
      render(<SingularityPet />);

      const counterText = screen.getByText(/Singularity Pet Count: 0/i);

      // Verify counter has accessibility label
      expect(counterText.props.accessibilityLabel).toBeTruthy();
    });
  });

  describe('Counter Behavior', () => {
    test('displays large numbers correctly', async () => {
      const user = userEvent.setup();
      render(<SingularityPet />);

      const feedButton = screen.getByText('feed');

      // Click many times to reach larger number
      for (let i = 0; i < 50; i++) {
        await user.press(feedButton);
      }

      // Verify large number displays
      expect(screen.getByText(/Singularity Pet Count: 50/i)).toBeTruthy();
    }, 10000); // Increase timeout to 10 seconds for 50 clicks
  });
});
