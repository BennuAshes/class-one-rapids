export interface GameState {
  resources: {
    linesOfCode: number;
    money: number;
    features: number;
    customers: number;
  };
  departments: Record<DepartmentType, Department>;
  progression: {
    totalEarned: number;
    prestigeLevel: number;
    prestigePoints: number;
    achievements: string[];
  };
  gameConfig: {
    audioEnabled: boolean;
    hapticsEnabled: boolean;
    performanceMode: 'high' | 'balanced' | 'performance';
    userId?: string;
  };
  gameLoop: {
    currentTime: number;
    deltaTime: number;
    isPaused: boolean;
    frameCount: number;
  };
}

export type DepartmentType = 
  | 'development' 
  | 'sales' 
  | 'customerExperience' 
  | 'product' 
  | 'design' 
  | 'qa' 
  | 'marketing';

export interface Department {
  id: DepartmentType;
  name: string;
  units: Unit[];
  managers: Manager[];
  unlocked: boolean;
  unlockThreshold: number;
  baseProductionRate: number;
  synergyMultipliers: number[];
}

export interface Unit {
  id: string;
  type: string;
  name: string;
  baseCost: number;
  currentCost: number;
  productionRate: number;
  owned: number;
  description: string;
}

export interface Manager {
  id: string;
  name: string;
  cost: number;
  hired: boolean;
  autoEnabled: boolean;
  department: DepartmentType;
}