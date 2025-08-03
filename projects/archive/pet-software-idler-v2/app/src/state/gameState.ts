import { observable, batch } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { syncObservable } from '@legendapp/state/sync';
import type { GameState } from '@/types/game';
import { storage } from './storage';

// Initial state factory
const createInitialState = (): GameState => ({
  resources: {
    linesOfCode: 0,
    money: 0,
    customerLeads: 0,
  },
  units: {
    developers: {
      junior: 0,
      mid: 0,
      senior: 0,
    },
    sales: {
      rep: 0,
      manager: 0,
    },
  },
  stats: {
    totalLinesWritten: 0,
    totalMoneyEarned: 0,
    totalFeaturesShipped: 0,
    gameStartTime: Date.now(),
    lastSaveTime: Date.now(),
  },
  unlocks: {
    juniorDevUnlocked: false,
    salesDepartmentUnlocked: false,
    midDevUnlocked: false,
    seniorDevUnlocked: false,
  },
  settings: {
    soundEnabled: true,
    particlesEnabled: true,
  },
});

// Create the main game state observable
export const gameState$ = observable<GameState>(createInitialState());

// Set up persistence with MMKV
syncObservable(gameState$, {
  persist: {
    name: 'pet-software-idler-save',
    plugin: ObservablePersistMMKV,
    mmkv: storage,
  },
});

// Computed values using Legend State v3 lazy evaluation
export const productionRates$ = observable(() => {
  const devs = gameState$.units.developers.get();
  const sales = gameState$.units.sales.get();
  
  return {
    linesPerSecond: 
      devs.junior * 0.1 + 
      devs.mid * 0.5 + 
      devs.senior * 2.5,
    leadsPerSecond:
      sales.rep * 0.2 +
      sales.manager * 1.0,
    moneyPerSecond: 0, // Calculated based on features + leads
  };
});

// Helper functions for state mutations
export const gameActions = {
  addLinesOfCode: (amount: number) => {
    batch(() => {
      gameState$.resources.linesOfCode.set(current => current + amount);
      gameState$.stats.totalLinesWritten.set(current => current + amount);
    });
  },
  
  addMoney: (amount: number) => {
    batch(() => {
      gameState$.resources.money.set(current => current + amount);
      gameState$.stats.totalMoneyEarned.set(current => current + amount);
    });
  },
  
  purchaseUnit: (unitType: 'developers' | 'sales', unitTier: string) => {
    batch(() => {
      if (unitType === 'developers') {
        if (unitTier === 'junior') {
          gameState$.units.developers.junior.set((current: number) => current + 1);
        } else if (unitTier === 'mid') {
          gameState$.units.developers.mid.set((current: number) => current + 1);
        } else if (unitTier === 'senior') {
          gameState$.units.developers.senior.set((current: number) => current + 1);
        }
      } else if (unitType === 'sales') {
        if (unitTier === 'rep') {
          gameState$.units.sales.rep.set((current: number) => current + 1);
        } else if (unitTier === 'manager') {
          gameState$.units.sales.manager.set((current: number) => current + 1);
        }
      }
    });
  },
  
  resetGame: () => {
    gameState$.set(createInitialState());
  },
};