export interface GameResources {
  linesOfCode: number;
  features: number;
  money: number;
  customerLeads: number;
}

export interface Department {
  id: string;
  name: string;
  employees: number;
  managers: number;
  efficiency: number;
  productionRate: number;
  unlocked: boolean;
  unlockCost: number;
}

export interface Employee {
  id: string;
  type: 'junior' | 'senior' | 'lead';
  department: string;
  productionRate: number;
  cost: number;
}

export interface GameSettings {
  audioEnabled: boolean;
  autoSaveInterval: number;
  particleEffects: boolean;
}

export interface PrestigeData {
  investorPoints: number;
  totalPrestigesCompleted: number;
  permanentBonuses: {
    capitalBonus: number;
    speedBonus: number;
  };
}

export interface GameState {
  resources: GameResources;
  departments: Record<string, Department>;
  employees: Employee[];
  settings: GameSettings;
  prestige: PrestigeData;
  statistics: {
    totalEarned: number;
    totalLinesWritten: number;
    totalFeaturesShipped: number;
    playTime: number;
    lastSaveTime: number;
  };
}