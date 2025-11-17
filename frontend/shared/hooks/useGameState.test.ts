import { renderHook } from '@testing-library/react-native';
import { useGameState } from './useGameState';
import { gameState$ } from '../store/gameStore';

describe('useGameState', () => {
  beforeEach(() => {
    // Reset game state before each test
    gameState$.petCount.set(0);
    gameState$.scrap.set(0);
  });

  test('returns petCount$ observable', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.petCount$).toBeDefined();
    expect(result.current.petCount$.get()).toBe(0);
  });

  test('returns scrap$ observable', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.scrap$).toBeDefined();
    expect(result.current.scrap$.get()).toBe(0);
  });

  test('returns scrapRate$ computed observable', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.scrapRate$).toBeDefined();
    expect(result.current.scrapRate$.get()).toBe(0);
  });

  test('petCount$ observable is reactive', () => {
    const { result } = renderHook(() => useGameState());

    result.current.petCount$.set(10);
    expect(result.current.petCount$.get()).toBe(10);
  });

  test('scrap$ observable is reactive', () => {
    const { result } = renderHook(() => useGameState());

    result.current.scrap$.set(50);
    expect(result.current.scrap$.get()).toBe(50);
  });

  test('scrapRate$ recomputes when petCount changes', () => {
    const { result } = renderHook(() => useGameState());

    result.current.petCount$.set(5);
    expect(result.current.scrapRate$.get()).toBe(5);

    result.current.petCount$.set(12);
    expect(result.current.scrapRate$.get()).toBe(12);
  });
});
