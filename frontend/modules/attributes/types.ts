export type AttributeType = 'strength' | 'coordination' | 'endurance';

export interface AttributeState {
  strength: number;
  coordination: number;
  endurance: number;
  unallocatedPoints: number;
}

export interface DerivedStats {
  damageBonus: number;
  criticalChance: number;
  offlineEfficiency: number;
}