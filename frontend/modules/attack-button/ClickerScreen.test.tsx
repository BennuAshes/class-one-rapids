import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ClickerScreen } from './ClickerScreen';

describe('ClickerScreen', () => {
  const mockOnNavigateToShop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      render(<ClickerScreen onNavigateToShop={mockOnNavigateToShop} />);

      // Screen should render successfully
      expect(screen.toJSON()).toBeTruthy();
    });

    test('renders SingularityPet component', () => {
      render(<ClickerScreen onNavigateToShop={mockOnNavigateToShop} />);

      // Verify SingularityPet is rendered (check for its distinctive text)
      expect(screen.getByText(/Singularity Pet Count:/i)).toBeTruthy();
      expect(screen.getByText('feed')).toBeTruthy();
    });

    test('renders shop navigation button', () => {
      render(<ClickerScreen onNavigateToShop={mockOnNavigateToShop} />);

      // Verify shop button is present
      expect(screen.getByText(/shop/i)).toBeTruthy();
    });
  });

  describe('Layout', () => {
    test('renders with proper layout structure', () => {
      const { root } = render(<ClickerScreen onNavigateToShop={mockOnNavigateToShop} />);

      // Verify component tree contains View elements
      const views = root.findAllByType('View');
      expect(views.length).toBeGreaterThan(0);
    });

    test('centers content in container', () => {
      const { root } = render(<ClickerScreen onNavigateToShop={mockOnNavigateToShop} />);

      // Verify container has centering styles
      const views = root.findAllByType('View');
      const containerView = views.find(view =>
        view.props.style?.justifyContent === 'center' &&
        view.props.style?.alignItems === 'center'
      );
      expect(containerView).toBeTruthy();
    });
  });

  describe('Integration', () => {
    test('SingularityPet component is functional within screen', async () => {
      const { getByText } = render(<ClickerScreen onNavigateToShop={mockOnNavigateToShop} />);

      // Verify initial state
      expect(getByText(/Singularity Pet Count: 0/i)).toBeTruthy();

      // This confirms SingularityPet is properly integrated
    });

    test('shop button calls onNavigateToShop when pressed', () => {
      render(<ClickerScreen onNavigateToShop={mockOnNavigateToShop} />);

      const shopButton = screen.getByText(/shop/i);
      fireEvent.press(shopButton);

      // Verify navigation callback was called
      expect(mockOnNavigateToShop).toHaveBeenCalledTimes(1);
    });
  });
});
