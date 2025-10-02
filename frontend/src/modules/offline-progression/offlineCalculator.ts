import { PlayerState, OfflineRewards } from './types';

export const calculateOfflineRewards = (
  minutesOffline: number,
  state: PlayerState
): OfflineRewards | null => {
  // Cap at 8 hours (480 minutes)
  const cappedMinutes = Math.min(minutesOffline, 480);

  // Only calculate if offline for 1+ minutes
  if (cappedMinutes < 1) return null;

  const efficiency = 0.25;
  const enemiesDefeated = Math.floor(
    (state.power * 2) * (cappedMinutes / 60) * efficiency
  );

  const xpGained = enemiesDefeated * 2.5;
  const pyrealGained = enemiesDefeated * (Math.random() * 4 + 1) * efficiency;

  return {
    timeOffline: cappedMinutes,
    enemiesDefeated,
    xpGained: Math.floor(xpGained),
    pyrealGained: Math.floor(pyrealGained)
  };
};