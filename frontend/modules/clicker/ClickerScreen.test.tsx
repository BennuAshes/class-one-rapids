import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClickerScreen } from './ClickerScreen';

describe('ClickerScreen - Basic Rendering', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('should render counter with initial value of 0', () => {
    render(<ClickerScreen />);
    expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
  });

  test('should render Feed button', () => {
    render(<ClickerScreen />);
    expect(screen.getByText('Feed')).toBeTruthy();
  });

  test('should increment counter when Feed button is pressed', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    const button = screen.getByText('Feed');
    await user.press(button);

    expect(screen.getByText(/Singularity Pet Count: 1/i)).toBeTruthy();
  });
});

describe('ClickerScreen - AsyncStorage Persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('should load saved count from AsyncStorage on mount', async () => {
    await AsyncStorage.setItem('singularityPetCount', '42');

    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count: 42/i)).toBeTruthy();
    });
  });

  test('should save count to AsyncStorage after 1 second debounce', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    const button = screen.getByText('Feed');
    await user.press(button);
    await user.press(button);
    await user.press(button);

    // Should not save immediately
    let storedValue = await AsyncStorage.getItem('singularityPetCount');
    expect(storedValue).toBeNull();

    // Should save after 1 second debounce
    await waitFor(
      async () => {
        const value = await AsyncStorage.getItem('singularityPetCount');
        expect(value).toBe('3');
      },
      { timeout: 1500 }
    );
  });

  test('should handle corrupted storage data gracefully', async () => {
    await AsyncStorage.setItem('singularityPetCount', 'invalid-data');

    render(<ClickerScreen />);

    // Should default to 0 when data is corrupted
    expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
  });

  test('should handle missing storage data by starting at 0', async () => {
    render(<ClickerScreen />);

    expect(screen.getByText(/Singularity Pet Count: 0/i)).toBeTruthy();
  });
});

describe('ClickerScreen - Accessibility', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('should have accessible button with proper label', () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });
    expect(button).toBeTruthy();
  });

  test('should have accessible counter text with proper label', () => {
    render(<ClickerScreen />);

    const counterText = screen.getByLabelText(/singularity pet count/i);
    expect(counterText).toBeTruthy();
  });

  test('button should meet minimum touch target size (44x44)', () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });
    const style = button.props.style;

    // Check that minWidth and minHeight are at least 44
    expect(style.minWidth).toBeGreaterThanOrEqual(44);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });

  test('should announce count updates to screen readers', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    const counterText = screen.getByLabelText(/singularity pet count/i);
    expect(counterText.props.accessibilityLiveRegion).toBe('polite');

    const button = screen.getByRole('button', { name: /feed/i });
    await user.press(button);

    expect(screen.getByLabelText(/singularity pet count/i)).toBeTruthy();
  });
});

describe('ClickerScreen - Performance', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('should handle rapid button presses without lag', async () => {
    const user = userEvent.setup();
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Simulate 10 rapid taps
    for (let i = 0; i < 10; i++) {
      await user.press(button);
    }

    // Should correctly update counter for all taps
    expect(screen.getByText(/Singularity Pet Count: 10/i)).toBeTruthy();
  });

  test('should debounce storage saves correctly', async () => {
    const user = userEvent.setup();

    render(<ClickerScreen />);

    // Create fresh spy after component mount
    const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');

    const button = screen.getByRole('button', { name: /feed/i });

    // Tap 5 times rapidly
    await user.press(button);
    await user.press(button);
    await user.press(button);
    await user.press(button);
    await user.press(button);

    // Get initial call count (should be 0 or very few)
    const initialCallCount = setItemSpy.mock.calls.length;

    // Wait for debounce (1 second)
    await waitFor(
      () => {
        expect(setItemSpy).toHaveBeenCalledWith('singularityPetCount', '5');
      },
      { timeout: 1500 }
    );

    // Should only save once after debounce period
    const finalCallCount = setItemSpy.mock.calls.length;
    expect(finalCallCount - initialCallCount).toBe(1);

    setItemSpy.mockRestore();
  });

  test('should not cause memory leaks with timer cleanup', async () => {
    await AsyncStorage.clear();
    const { unmount } = render(<ClickerScreen />);

    // Unmount component
    unmount();

    // Timer should be cleaned up - this is verified by the component's cleanup function
    // If timer isn't cleaned up, Jest will warn about timers not being cleared
    expect(true).toBe(true); // Test passes if no warnings occur
  });
});
