import { renderHook, act } from '@testing-library/react-native';
import { useNavigation } from './useNavigation';

describe('useNavigation Hook', () => {
  test('initializes to clicker screen', () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.currentScreen$.get()).toBe('clicker');
  });

  test('navigates to shop', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.actions.navigateToShop();
    });

    expect(result.current.currentScreen$.get()).toBe('shop');
  });

  test('navigates back to clicker', () => {
    const { result } = renderHook(() => useNavigation());

    // Navigate to shop first
    act(() => {
      result.current.actions.navigateToShop();
    });

    expect(result.current.currentScreen$.get()).toBe('shop');

    // Navigate back to clicker
    act(() => {
      result.current.actions.navigateToClicker();
    });

    expect(result.current.currentScreen$.get()).toBe('clicker');
  });
});
