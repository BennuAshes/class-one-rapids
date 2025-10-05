import { calculateOfflineRewards } from './offlineCalculator';
import { PlayerState } from './types';

describe('calculateOfflineRewards', () => {
  const mockPlayerState: PlayerState = {
    power: 10,
    level: 5,
    xp: 50,
    pyreal: 100
  };

  test('calculates offline rewards based on power and time', () => {
    // 2 hours (120 minutes) with power 10
    const rewards = calculateOfflineRewards(120, mockPlayerState);

    expect(rewards).toBeDefined();
    expect(rewards!.timeOffline).toBe(120);
    expect(rewards!.enemiesDefeated).toBe(10); // (10 * 2) * (120/60) * 0.25 = 10
    expect(rewards!.xpGained).toBe(25); // 10 * 2.5 = 25
    expect(rewards!.pyrealGained).toBeGreaterThan(0);
  });

  test('caps offline time at 8 hours (480 minutes)', () => {
    const rewards = calculateOfflineRewards(600, mockPlayerState); // 10 hours

    expect(rewards!.timeOffline).toBe(480); // Capped at 8 hours
  });

  test('returns null for less than 1 minute offline', () => {
    const rewards = calculateOfflineRewards(0.5, mockPlayerState);

    expect(rewards).toBeNull();
  });

  test('scales with player power', () => {
    const lowPowerState = { ...mockPlayerState, power: 1 };
    const highPowerState = { ...mockPlayerState, power: 20 };

    const lowRewards = calculateOfflineRewards(60, lowPowerState);
    const highRewards = calculateOfflineRewards(60, highPowerState);

    expect(highRewards!.enemiesDefeated).toBeGreaterThan(lowRewards!.enemiesDefeated);
    expect(highRewards!.xpGained).toBeGreaterThan(lowRewards!.xpGained);
  });

  test('has correct efficiency rate', () => {
    // 1 hour with power 4 should give 2 enemies (4 * 2 * 1 * 0.25 = 2)
    const rewards = calculateOfflineRewards(60, { ...mockPlayerState, power: 4 });

    expect(rewards!.enemiesDefeated).toBe(2);
  });
});