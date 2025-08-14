export interface GameEvents {
  'code.written': { amount: number; developerType: string };
  'feature.shipped': { value: number; featureType: string };
  'developer.hired': { type: string; cost: number };
  'money.earned': { amount: number; source: string };
  'milestone.reached': { milestone: string; reward: number };
}