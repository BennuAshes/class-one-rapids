// Game configuration constants
export const GAME_CONFIG = {
  // Performance targets
  TARGET_FPS: 60,
  GAME_LOOP_INTERVAL: 1000 / 60, // 60 FPS
  
  // Game balance
  STARTING_MONEY: 1000,
  BASE_SALARY: 50,
  BASE_PRODUCTIVITY: 1,
  
  // Department configuration
  DEPARTMENTS: {
    DEVELOPMENT: { name: 'Development', baseRevenue: 100, unlockCost: 0 },
    DESIGN: { name: 'Design', baseRevenue: 80, unlockCost: 5000 },
    TESTING: { name: 'Testing', baseRevenue: 60, unlockCost: 10000 },
    MARKETING: { name: 'Marketing', baseRevenue: 120, unlockCost: 15000 }
  },
  
  // Employee types
  EMPLOYEE_TYPES: {
    JUNIOR: { name: 'Junior', baseSalary: 50, baseProductivity: 1, multiplier: 1 },
    SENIOR: { name: 'Senior', baseSalary: 100, baseProductivity: 2, multiplier: 1.5 },
    LEAD: { name: 'Lead', baseSalary: 200, baseProductivity: 3, multiplier: 2 },
    MANAGER: { name: 'Manager', baseSalary: 300, baseProductivity: 1, multiplier: 3 }
  },
  
  // Prestige system
  PRESTIGE: {
    BASE_REQUIREMENT: 1000000, // $1M valuation for first prestige
    MULTIPLIER: 1.5,
    BASE_POINTS_PER_PRESTIGE: 1
  }
} as const;