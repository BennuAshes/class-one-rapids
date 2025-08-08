import { observable } from '@legendapp/state';
import { GameState, DepartmentType } from '../../shared/types';

// Initial game state following PRD specifications
const initialGameState: GameState = {
  resources: {
    linesOfCode: 0,
    money: 0,
    features: 0,
    customers: 0,
  },
  departments: {
    development: {
      id: 'development',
      name: 'Development',
      units: [],
      managers: [],
      unlocked: true, // First department always unlocked
      unlockThreshold: 0,
      baseProductionRate: 0,
      synergyMultipliers: [],
    },
    sales: {
      id: 'sales',
      name: 'Sales',
      units: [],
      managers: [],
      unlocked: false,
      unlockThreshold: 500,
      baseProductionRate: 0,
      synergyMultipliers: [],
    },
    customerExperience: {
      id: 'customerExperience',
      name: 'Customer Experience',
      units: [],
      managers: [],
      unlocked: false,
      unlockThreshold: 5000,
      baseProductionRate: 0,
      synergyMultipliers: [],
    },
    product: {
      id: 'product',
      name: 'Product',
      units: [],
      managers: [],
      unlocked: false,
      unlockThreshold: 25000,
      baseProductionRate: 0,
      synergyMultipliers: [],
    },
    design: {
      id: 'design',
      name: 'Design',
      units: [],
      managers: [],
      unlocked: false,
      unlockThreshold: 100000,
      baseProductionRate: 0,
      synergyMultipliers: [],
    },
    qa: {
      id: 'qa',
      name: 'QA',
      units: [],
      managers: [],
      unlocked: false,
      unlockThreshold: 500000,
      baseProductionRate: 0,
      synergyMultipliers: [],
    },
    marketing: {
      id: 'marketing',
      name: 'Marketing',
      units: [],
      managers: [],
      unlocked: false,
      unlockThreshold: 2000000,
      baseProductionRate: 0,
      synergyMultipliers: [],
    },
  },
  progression: {
    totalEarned: 0,
    prestigeLevel: 0,
    prestigePoints: 0,
    achievements: [],
  },
  gameConfig: {
    audioEnabled: true,
    hapticsEnabled: true,
    performanceMode: 'balanced',
  },
  gameLoop: {
    currentTime: 0,
    deltaTime: 0,
    isPaused: false,
    frameCount: 0,
  },
};

// Create observable game state with Legend State v3
export const gameState$ = observable(initialGameState);

// TODO: Configure MMKV persistence after API verification
// For now, state will be memory-only during development

// Game actions following senior engineering patterns
export const gameActions = {
  addLinesOfCode: (amount: number) => {
    gameState$.resources.linesOfCode.set(prev => Math.max(0, prev + amount));
  },
  
  addMoney: (amount: number) => {
    const currentMoney = gameState$.resources.money.get();
    const newMoney = Math.max(0, currentMoney + amount);
    gameState$.resources.money.set(newMoney);
    
    // Track total earned for progression (only positive amounts)
    if (amount > 0) {
      gameState$.progression.totalEarned.set(prev => prev + amount);
    }
  },
  
  addFeatures: (amount: number) => {
    gameState$.resources.features.set(prev => Math.max(0, prev + amount));
  },
  
  addCustomers: (amount: number) => {
    gameState$.resources.customers.set(prev => Math.max(0, prev + amount));
  },
  
  purchaseUnit: (department: DepartmentType, unitType: string) => {
    const dept = gameState$.departments[department];
    const units = dept.units.get();
    const unit = units.find(u => u.type === unitType);
    const currentMoney = gameState$.resources.money.get();
    
    if (!unit || currentMoney < unit.currentCost) {
      return { success: false, reason: unit ? 'insufficient_funds' : 'unit_not_found' };
    }
    
    // Deduct cost
    gameActions.addMoney(-unit.currentCost);
    
    // Increase owned count
    const unitIndex = units.findIndex(u => u.type === unitType);
    if (unitIndex !== -1 && dept.units[unitIndex]) {
      dept.units[unitIndex]!.owned.set(prev => prev + 1);
      
      // Update cost using exponential formula: Base * 1.15^owned
      const newOwned = dept.units[unitIndex]!.owned.get();
      const newCost = Math.floor(unit.baseCost * Math.pow(1.15, newOwned));
      dept.units[unitIndex]!.currentCost.set(newCost);
    }
    
    return { success: true, unitType, newOwned: unit.owned + 1 };
  },
  
  checkDepartmentUnlocks: () => {
    const totalEarned = gameState$.progression.totalEarned.get();
    
    Object.values(gameState$.departments.get()).forEach(department => {
      if (!department.unlocked && totalEarned >= department.unlockThreshold) {
        gameState$.departments[department.id].unlocked.set(true);
      }
    });
  },
  
  resetGame: () => {
    gameState$.set(initialGameState);
  },
};