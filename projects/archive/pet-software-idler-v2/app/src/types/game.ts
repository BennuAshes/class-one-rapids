export interface GameState {
  resources: {
    linesOfCode: number;
    money: number;
    customerLeads: number;
  };
  
  units: {
    developers: {
      junior: number;
      mid: number;
      senior: number;
    };
    sales: {
      rep: number;
      manager: number;
    };
  };
  
  stats: {
    totalLinesWritten: number;
    totalMoneyEarned: number;
    totalFeaturesShipped: number;
    gameStartTime: number;
    lastSaveTime: number;
  };
  
  unlocks: {
    juniorDevUnlocked: boolean;
    salesDepartmentUnlocked: boolean;
    midDevUnlocked: boolean;
    seniorDevUnlocked: boolean;
  };
  
  settings: {
    soundEnabled: boolean;
    particlesEnabled: boolean;
  };
}

export interface ProductionRates {
  linesPerSecond: number;
  leadsPerSecond: number;
  moneyPerSecond: number;
}

export interface UnitCost {
  base: number;
  scaling: number; // 1.15 for all units
}

export interface UnitDefinition {
  id: string;
  name: string;
  cost: UnitCost;
  production: number; // per second
  unlockRequirement?: () => boolean;
}