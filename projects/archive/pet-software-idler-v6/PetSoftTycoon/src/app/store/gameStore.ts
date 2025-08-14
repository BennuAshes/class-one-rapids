import { observable, batch } from '@legendapp/state';
import { enableReactNativeComponents } from '@legendapp/state/config/enableReactNativeComponents';
import type { GameState } from '@shared/types';

// Enable React Native optimizations
enableReactNativeComponents();

// Initial game state
const initialState: GameState = {
  resources: {
    linesOfCode: 0,
    features: 0,
    money: 0,
    customerLeads: 0,
  },
  departments: {
    development: {
      id: 'development',
      name: 'Development',
      employees: 0,
      managers: 0,
      efficiency: 1.0,
      productionRate: 0,
      unlocked: true,
      unlockCost: 0,
    },
    sales: {
      id: 'sales',
      name: 'Sales',
      employees: 0,
      managers: 0,
      efficiency: 1.0,
      productionRate: 0,
      unlocked: false,
      unlockCost: 500,
    },
    customerExperience: {
      id: 'customerExperience',
      name: 'Customer Experience',
      employees: 0,
      managers: 0,
      efficiency: 1.0,
      productionRate: 0,
      unlocked: false,
      unlockCost: 2000,
    },
    product: {
      id: 'product',
      name: 'Product',
      employees: 0,
      managers: 0,
      efficiency: 1.0,
      productionRate: 0,
      unlocked: false,
      unlockCost: 5000,
    },
    design: {
      id: 'design',
      name: 'Design',
      employees: 0,
      managers: 0,
      efficiency: 1.0,
      productionRate: 0,
      unlocked: false,
      unlockCost: 10000,
    },
    qa: {
      id: 'qa',
      name: 'QA',
      employees: 0,
      managers: 0,
      efficiency: 1.0,
      productionRate: 0,
      unlocked: false,
      unlockCost: 25000,
    },
    marketing: {
      id: 'marketing',
      name: 'Marketing',
      employees: 0,
      managers: 0,
      efficiency: 1.0,
      productionRate: 0,
      unlocked: false,
      unlockCost: 50000,
    },
  },
  employees: [],
  settings: {
    audioEnabled: true,
    autoSaveInterval: 30000,
    particleEffects: true,
  },
  prestige: {
    investorPoints: 0,
    totalPrestigesCompleted: 0,
    permanentBonuses: {
      capitalBonus: 0,
      speedBonus: 0,
    },
  },
  statistics: {
    totalEarned: 0,
    totalLinesWritten: 0,
    totalFeaturesShipped: 0,
    playTime: 0,
    lastSaveTime: Date.now(),
  },
};

// Create the main game state observable
export const gameState$ = observable<GameState>(initialState);

// Game actions
export const gameActions = {
  writeCode: () => {
    batch(() => {
      gameState$.resources.linesOfCode.set(prev => prev + 1);
      gameState$.statistics.totalLinesWritten.set(prev => prev + 1);
    });
  },
  
  shipFeature: () => {
    const codeRequired = 10;
    const moneyEarned = 15;
    
    batch(() => {
      const currentCode = gameState$.resources.linesOfCode.get();
      if (currentCode >= codeRequired) {
        gameState$.resources.linesOfCode.set(currentCode - codeRequired);
        gameState$.resources.features.set(prev => prev + 1);
        gameState$.resources.money.set(prev => prev + moneyEarned);
        gameState$.statistics.totalFeaturesShipped.set(prev => prev + 1);
        gameState$.statistics.totalEarned.set(prev => prev + moneyEarned);
      }
    });
  },
  
  updateProduction: (deltaTime: number) => {
    batch(() => {
      // Calculate production for each department
      const departments = gameState$.departments.get();
      Object.values(departments).forEach(dept => {
        if (dept.unlocked && dept.productionRate > 0) {
          const production = dept.productionRate * deltaTime;
          
          switch (dept.id) {
            case 'development':
              gameState$.resources.linesOfCode.set(prev => prev + production);
              gameState$.statistics.totalLinesWritten.set(prev => prev + production);
              break;
            case 'sales':
              gameState$.resources.customerLeads.set(prev => prev + production);
              break;
            // Add other department productions as needed
          }
        }
      });
    });
  },
  
  resetGame: () => {
    gameState$.set(initialState);
  },
};