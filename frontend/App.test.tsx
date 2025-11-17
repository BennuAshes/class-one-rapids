import { render, screen, fireEvent } from '@testing-library/react-native';
import App from './App';

describe('App Integration', () => {
  test('renders without import errors', () => {
    // This test FAILS if ClickerScreen module doesn't exist
    expect(() => render(<App />)).not.toThrow();
  });

  test('displays clicker screen by default', () => {
    render(<App />);

    // Verify ClickerScreen is rendered (not "Hello World")
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy();
  });

  test('can interact with feed button from app root', () => {
    render(<App />);

    // Verify button exists and is interactive
    const feedButton = screen.getByRole('button', { name: /feed/i });
    fireEvent.press(feedButton);

    // Verify state update works
    expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
  });
});
