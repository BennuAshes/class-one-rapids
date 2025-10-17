import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { AttributeType, AttributeState } from './types';

export const useAttributes = (initialUnallocatedPoints: number = 0) => {
  const [state, setState] = useState<AttributeState>({
    strength: 0,
    coordination: 0,
    endurance: 0,
    unallocatedPoints: initialUnallocatedPoints,
  });

  const allocatePoint = useCallback((attribute: AttributeType) => {
    setState(prev => {
      if (prev.unallocatedPoints <= 0) {
        return prev; // No points available
      }

      // Trigger haptic feedback for successful allocation
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      return {
        ...prev,
        [attribute]: prev[attribute] + 1,
        unallocatedPoints: prev.unallocatedPoints - 1,
      };
    });
  }, []);

  const getDamageBonus = useCallback(() => {
    return state.strength * 5;
  }, [state.strength]);

  const getCriticalChance = useCallback(() => {
    const base = 10;
    const bonus = state.coordination * 2;
    return Math.min(base + bonus, 90); // Cap at 90%
  }, [state.coordination]);

  const getOfflineEfficiency = useCallback(() => {
    const base = 25;
    const bonus = state.endurance * 2.5;
    return Math.min(base + bonus, 75); // Cap at 75%
  }, [state.endurance]);

  return {
    ...state,
    allocatePoint,
    getDamageBonus,
    getCriticalChance,
    getOfflineEfficiency,
  };
};