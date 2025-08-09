export * from './GameState';

// Action types for game operations
export type GameAction = 
  | { type: 'WRITE_CODE' }
  | { type: 'SHIP_FEATURE' }
  | { type: 'HIRE_EMPLOYEE'; payload: { type: string; department: string } }
  | { type: 'UNLOCK_DEPARTMENT'; payload: { departmentId: string } }
  | { type: 'PRESTIGE' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<import('./GameState').GameSettings> };

// Conversion rates and constants
export const GAME_CONSTANTS = {
  CODE_PER_FEATURE: 10,
  BASE_MONEY_PER_FEATURE: 15,
  EMPLOYEE_COST_MULTIPLIER: 1.15,
  DEPARTMENT_UNLOCK_MULTIPLIER: 10,
  MAX_OFFLINE_HOURS: 12,
  AUTOSAVE_INTERVAL: 30000, // 30 seconds
  TARGET_FPS: 60,
} as const;