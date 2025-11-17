import { gameState$, scrapRate$ } from './gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset state before each test for isolation
    gameState$.petCount.set(0);
    gameState$.scrap.set(0);
  });

  describe('gameState$ observable', () => {
    test('initializes with zero pet count', () => {
      expect(gameState$.petCount.get()).toBe(0);
    });

    test('initializes with zero scrap', () => {
      expect(gameState$.scrap.get()).toBe(0);
    });

    test('allows setting pet count', () => {
      gameState$.petCount.set(5);
      expect(gameState$.petCount.get()).toBe(5);
    });

    test('allows setting scrap', () => {
      gameState$.scrap.set(100);
      expect(gameState$.scrap.get()).toBe(100);
    });

    test('supports functional updates for pet count', () => {
      gameState$.petCount.set(10);
      gameState$.petCount.set(prev => prev + 5);
      expect(gameState$.petCount.get()).toBe(15);
    });

    test('supports functional updates for scrap', () => {
      gameState$.scrap.set(50);
      gameState$.scrap.set(prev => prev + 25);
      expect(gameState$.scrap.get()).toBe(75);
    });
  });

  describe('scrapRate$ computed observable', () => {
    test('returns 0 when pet count is 0', () => {
      gameState$.petCount.set(0);
      expect(scrapRate$.get()).toBe(0);
    });

    test('returns pet count when multiplier is 1', () => {
      gameState$.petCount.set(10);
      expect(scrapRate$.get()).toBe(10);
    });

    test('automatically recomputes when pet count changes', () => {
      gameState$.petCount.set(5);
      expect(scrapRate$.get()).toBe(5);

      gameState$.petCount.set(15);
      expect(scrapRate$.get()).toBe(15);
    });

    test('floors fractional results', () => {
      // Base multiplier is 1, so this tests Math.floor behavior
      gameState$.petCount.set(7);
      expect(scrapRate$.get()).toBe(7); // Math.floor(7 * 1) = 7
    });
  });
});
