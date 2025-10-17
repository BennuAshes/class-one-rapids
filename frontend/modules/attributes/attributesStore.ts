import { observable } from '@legendapp/state';
import { configureSynced, synced } from '@legendapp/state/sync';
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export type AttributeType = 'strength' | 'coordination' | 'endurance';

interface AttributesState {
  strength: number;
  coordination: number;
  endurance: number;
  unallocatedPoints: number;
}

// Configure persistence globally for attributes
const mySynced = configureSynced(synced, {
  persist: {
    plugin: observablePersistAsyncStorage({ AsyncStorage })
  }
});

// Create the global attributes store with persistence
export const attributes$ = observable<AttributesState>(
  mySynced({
    initial: {
      strength: 0,
      coordination: 0,
      endurance: 0,
      unallocatedPoints: 0,
    },
    persist: { name: 'attributes-storage' }
  })
);

// Actions
export const allocatePoint = (attribute: AttributeType) => {
  const currentPoints = attributes$.unallocatedPoints.get();

  if (currentPoints <= 0) {
    return; // No points available
  }

  // Trigger haptic feedback for successful allocation
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  // Update the attribute and decrease unallocated points
  attributes$[attribute].set(prev => prev + 1);
  attributes$.unallocatedPoints.set(currentPoints - 1);
};

// Computed values
export const getDamageBonus = () => {
  return attributes$.strength.get() * 1; // +1 damage per strength point
};

export const getCriticalChance = () => {
  const base = 10;
  const bonus = attributes$.coordination.get() * 2;
  return Math.min(base + bonus, 90); // Cap at 90%
};

export const getOfflineEfficiency = () => {
  const base = 25;
  const bonus = attributes$.endurance.get() * 2.5;
  return Math.min(base + bonus, 75); // Cap at 75%
};

// Function to grant attribute points (for level-ups)
export const grantAttributePoints = (points: number) => {
  attributes$.unallocatedPoints.set(prev => prev + points);
};

// Function for migration from old Power system
export const migrateFromPower = (level: number) => {
  // Only migrate if attributes haven't been set yet
  const currentState = attributes$.get();
  const totalAllocated = currentState.strength + currentState.coordination +
                         currentState.endurance + currentState.unallocatedPoints;

  if (totalAllocated === 0 && level > 1) {
    // Grant points equal to level for migration
    attributes$.unallocatedPoints.set(level);
    return true; // Migration performed
  }

  return false; // No migration needed
};