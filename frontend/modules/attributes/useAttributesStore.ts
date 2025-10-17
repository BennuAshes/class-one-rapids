import { use$ } from '@legendapp/state/react';
import {
  attributes$,
  allocatePoint as allocatePointAction,
  getDamageBonus,
  getCriticalChance,
  getOfflineEfficiency,
  grantAttributePoints
} from './attributesStore';

/**
 * Hook to access and modify the attributes store using Legend-State v3
 * This replaces the previous React Context approach
 */
export const useAttributesStore = () => {
  // Use the Legend-State v3 use$ hook for reactive updates
  const strength = use$(attributes$.strength);
  const coordination = use$(attributes$.coordination);
  const endurance = use$(attributes$.endurance);
  const unallocatedPoints = use$(attributes$.unallocatedPoints);

  return {
    // Current values (reactive)
    strength,
    coordination,
    endurance,
    unallocatedPoints,

    // Actions
    allocatePoint: allocatePointAction,
    grantPoints: grantAttributePoints,

    // Computed values
    getDamageBonus,
    getCriticalChance,
    getOfflineEfficiency,
  };
};