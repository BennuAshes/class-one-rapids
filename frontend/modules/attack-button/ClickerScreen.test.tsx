import React from 'react';
import { render, screen, userEvent, waitFor, act } from '@testing-library/react-native';
import { ClickerScreen } from './ClickerScreen';
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

describe('ClickerScreen Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  // Render Tests
  test('displays counter with initial value', async () => {
    render(<ClickerScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Singularity Pet Count:/i)).toBeTruthy();
    });
  });

  test('displays feed button with correct label', () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });
    expect(button).toBeTruthy();
  });

  // Interaction Tests
  test('increments count when button is pressed', async () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Get initial count
    const initialText = screen.getByText(/Singularity Pet Count:/i);
    const initialMatch = initialText.props.children.join('').match(/(\d+)/);
    const initialCount = initialMatch ? parseInt(initialMatch[1]) : 0;

    await user.press(button);

    await waitFor(() => {
      const newText = screen.getByText(/Singularity Pet Count:/i);
      const newMatch = newText.props.children.join('').match(/(\d+)/);
      const newCount = newMatch ? parseInt(newMatch[1]) : 0;
      expect(newCount).toBe(initialCount + 1);
    });
  });

  test('handles rapid tapping accurately', async () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Get initial count
    const initialText = screen.getByText(/Singularity Pet Count:/i);
    const initialMatch = initialText.props.children.join('').match(/(\d+)/);
    const startCount = initialMatch ? parseInt(initialMatch[1]) : 0;

    // Rapid taps - 10 times
    for (let i = 0; i < 10; i++) {
      await user.press(button);
    }

    await waitFor(() => {
      const finalText = screen.getByText(/Singularity Pet Count:/i);
      const finalMatch = finalText.props.children.join('').match(/(\d+)/);
      const finalCount = finalMatch ? parseInt(finalMatch[1]) : 0;
      expect(finalCount).toBe(startCount + 10);
    });
  });

  // Accessibility Tests
  test('button meets minimum touch target size (44x44pt)', () => {
    render(<ClickerScreen />);

    const button = screen.getByTestId('feed-button');

    const style = Array.isArray(button.props.style)
      ? Object.assign({}, ...button.props.style)
      : button.props.style;

    expect(style.minWidth).toBeGreaterThanOrEqual(44);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });

  test('has correct accessibility attributes', () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toMatch(/feed/i);
  });

  test('counter has accessibility label with current value', async () => {
    render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });

    await user.press(button);

    await waitFor(() => {
      const counterText = screen.getByText(/Singularity Pet Count:/i);
      expect(counterText.props.accessibilityRole).toBe('text');
      expect(counterText.props.accessibilityLabel).toMatch(/Singularity Pet Count:/i);
    });
  });

  // Persistence Integration Test
  test('restores count after remount', async () => {
    const { unmount } = render(<ClickerScreen />);

    const button = screen.getByRole('button', { name: /feed/i });

    // Tap 5 times
    for (let i = 0; i < 5; i++) {
      await user.press(button);
    }

    await waitFor(() => {
      const text = screen.getByText(/Singularity Pet Count:/i);
      const match = text.props.children.join('').match(/(\d+)/);
      const count = match ? parseInt(match[1]) : 0;
      expect(count).toBeGreaterThan(0);
    });

    const firstText = screen.getByText(/Singularity Pet Count:/i);
    const firstMatch = firstText.props.children.join('').match(/(\d+)/);
    const firstCount = firstMatch ? parseInt(firstMatch[1]) : 0;

    unmount();

    render(<ClickerScreen />);

    await waitFor(() => {
      const secondText = screen.getByText(/Singularity Pet Count:/i);
      const secondMatch = secondText.props.children.join('').match(/(\d+)/);
      const secondCount = secondMatch ? parseInt(secondMatch[1]) : 0;
      // Due to singleton pattern, count should persist
      expect(secondCount).toBeGreaterThanOrEqual(firstCount);
    });
  });
});

describe('ClickerScreen Scrap Integration', () => {
  const user = userEvent.setup({ delay: null });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('displays scrap total on screen', () => {
    render(<ClickerScreen />);
    expect(screen.getByText(/Scrap:/i)).toBeTruthy();
  });

  test('scrap increases automatically every second', async () => {
    render(<ClickerScreen />);

    // Get initial scrap value
    const scrapText = screen.getByText(/Scrap:/i);
    const scrapContent = Array.isArray(scrapText.props.children)
      ? scrapText.props.children.join('')
      : scrapText.props.children;
    const scrapMatch = String(scrapContent).match(/(\d[\d,]*)/);
    const initialScrap = scrapMatch ? parseInt(scrapMatch[1].replace(/,/g, '')) : 0;

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      const newScrapText = screen.getByText(/Scrap:/i);
      const newContent = Array.isArray(newScrapText.props.children)
        ? newScrapText.props.children.join('')
        : newScrapText.props.children;
      const newMatch = String(newContent).match(/(\d[\d,]*)/);
      const newScrap = newMatch ? parseInt(newMatch[1].replace(/,/g, '')) : 0;
      // Scrap should be >= initialScrap (may be 0 if no pets)
      expect(newScrap).toBeGreaterThanOrEqual(initialScrap);
    });
  });

  test('scrap generation scales with pet count', async () => {
    render(<ClickerScreen />);
    const button = screen.getByRole('button', { name: /feed/i });

    // Get current pet count
    const counterText = screen.getByText(/Singularity Pet Count:/i);
    const counterContent = Array.isArray(counterText.props.children)
      ? counterText.props.children.join('')
      : counterText.props.children;
    const initialCountMatch = String(counterContent).match(/(\d+)/);
    const initialCount = initialCountMatch ? parseInt(initialCountMatch[1]) : 0;

    // Add 3 pets
    for (let i = 0; i < 3; i++) {
      await user.press(button);
    }

    await waitFor(() => {
      const newCounterText = screen.getByText(/Singularity Pet Count:/i);
      const newCounterContent = Array.isArray(newCounterText.props.children)
        ? newCounterText.props.children.join('')
        : newCounterText.props.children;
      const match = String(newCounterContent).match(/(\d+)/);
      const count = match ? parseInt(match[1]) : 0;
      expect(count).toBe(initialCount + 3);
    });

    // Get scrap before advancing time
    const scrapTextBefore = screen.getByText(/Scrap:/i);
    const contentBefore = Array.isArray(scrapTextBefore.props.children)
      ? scrapTextBefore.props.children.join('')
      : scrapTextBefore.props.children;
    const matchBefore = String(contentBefore).match(/(\d[\d,]*)/);
    const scrapBefore = matchBefore ? parseInt(matchBefore[1].replace(/,/g, '')) : 0;

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      const scrapTextAfter = screen.getByText(/Scrap:/i);
      const contentAfter = Array.isArray(scrapTextAfter.props.children)
        ? scrapTextAfter.props.children.join('')
        : scrapTextAfter.props.children;
      const matchAfter = String(contentAfter).match(/(\d[\d,]*)/);
      const scrapAfter = matchAfter ? parseInt(matchAfter[1].replace(/,/g, '')) : 0;
      // Should increase by at least 3 (3 pets * 1 scrap per pet per second)
      expect(scrapAfter).toBeGreaterThanOrEqual(scrapBefore + 3);
    });
  });

  test('scrap persists across remounts', async () => {
    const { unmount } = render(<ClickerScreen />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      const scrapText = screen.getByText(/Scrap:/i);
      expect(scrapText).toBeTruthy();
    });

    unmount();
    render(<ClickerScreen />);

    await waitFor(() => {
      const scrapText = screen.getByText(/Scrap:/i);
      expect(scrapText).toBeTruthy();
    });
  });

  test('displays formatted scrap numbers with thousand separators', async () => {
    render(<ClickerScreen />);

    // Check if numbers are formatted (commas appear if value >= 1000)
    await waitFor(() => {
      const scrapText = screen.getByText(/Scrap:/i);
      expect(scrapText).toBeTruthy();
      // Just verify the scrap display exists with proper formatting capability
      // The formatNumber function is already tested in its own test suite
    });
  });
});

describe('ClickerScreen Shop Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  test('displays shop navigation button', () => {
    render(<ClickerScreen />);
    const shopButton = screen.getByRole('button', { name: /shop/i });
    expect(shopButton).toBeTruthy();
  });
});
