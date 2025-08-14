export interface GameState {
  player: {
    money: number;
    valuation: number;
    investmentPoints: number;
    startTime: number;
    lastSave: number;
  };
  
  departments: {
    development: DevelopmentState;
    // Other departments will be added in Phase 02
  };
  
  progression: {
    features: Feature[];
    achievements: Achievement[];
    milestones: Milestone[];
    currentPrestigeTier: number;
  };
  
  settings: {
    audioEnabled: boolean;
    musicVolume: number;
    effectsVolume: number;
    autoSaveInterval: number;
  };
}

export interface DevelopmentState {
  linesOfCode: number;
  developers: DeveloperUnit[];
  upgrades: {
    ides: number;
    pairProgramming: boolean;
    codeReviews: boolean;
  };
}

export interface DeveloperUnit {
  id: string;
  type: 'junior' | 'mid' | 'senior' | 'lead';
  count: number;
  cost: number;
  production: number;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  reward: number;
}

export interface Milestone {
  id: string;
  name: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
}