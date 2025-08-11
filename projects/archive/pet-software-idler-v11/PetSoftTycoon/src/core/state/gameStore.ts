import { create } from 'zustand';
import { BigNumber } from '../../shared/utils/BigNumber';

export interface Department {
  id: string;
  name: string;
  type: DepartmentType;
  units: Unit[];
  production: ProductionState;
}

export interface Unit {
  id: string;
  type: UnitType;
  count: number;
  cost: BigNumber;
  production: BigNumber;
}

export interface ProductionState {
  baseRate: BigNumber;
  multiplier: number;
  currentRate: BigNumber;
}

export type DepartmentType = 'development' | 'sales' | 'customerExperience' | 
  'product' | 'design' | 'qa' | 'marketing';

export type UnitType = 'juniorDev' | 'midDev' | 'seniorDev' | 'techLead';

export interface GameState {
  money: BigNumber;
  departments: Department[];
  statistics: {
    totalClicks: number;
    totalEarned: BigNumber;
    playTime: number;
  };
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
}

export interface GameActions {
  addMoney: (amount: BigNumber) => void;
  hireDeveloper: (departmentId: string, unitType: UnitType) => void;
  updateProduction: (deltaTime: number) => void;
  click: () => void;
  reset: () => void;
}

const initialState: GameState = {
  money: new BigNumber(100), // Starting money
  departments: [],
  statistics: {
    totalClicks: 0,
    totalEarned: new BigNumber(0),
    playTime: 0,
  },
  settings: {
    soundEnabled: true,
    musicEnabled: true,
  },
};

export const useGameStore = create<GameState & GameActions>()((set, get) => ({
  ...initialState,
  
  addMoney: (amount: BigNumber) => set((state) => ({
    money: state.money.add(amount),
    statistics: {
      ...state.statistics,
      totalEarned: state.statistics.totalEarned.add(amount),
    },
  })),
  
  click: () => set((state) => {
    const clickValue = new BigNumber(1); // Base click value
    return {
      money: state.money.add(clickValue),
      statistics: {
        ...state.statistics,
        totalClicks: state.statistics.totalClicks + 1,
        totalEarned: state.statistics.totalEarned.add(clickValue),
      },
    };
  }),
  
  updateProduction: (deltaTime: number) => set((state) => {
    let newMoney = state.money;
    let newTotalEarned = state.statistics.totalEarned;
    
    // Calculate production for all departments
    for (const department of state.departments) {
      const production = department.production.currentRate.multiply(deltaTime / 1000);
      newMoney = newMoney.add(production);
      newTotalEarned = newTotalEarned.add(production);
    }
    
    return {
      money: newMoney,
      statistics: {
        ...state.statistics,
        playTime: state.statistics.playTime + deltaTime,
        totalEarned: newTotalEarned,
      },
    };
  }),
  
  hireDeveloper: (departmentId: string, unitType: UnitType) => set((state) => {
    const departmentIndex = state.departments.findIndex(d => d.id === departmentId);
    if (departmentIndex === -1) return state;
    
    const department = state.departments[departmentIndex]!;
    const unitIndex = department.units.findIndex(u => u.type === unitType);
    if (unitIndex === -1) return state;
    
    const unit = department.units[unitIndex]!;
    
    if (!state.money.greaterThan(unit.cost)) return state;
    
    const updatedUnits = [...department.units];
    updatedUnits[unitIndex] = {
      ...unit,
      count: unit.count + 1,
      cost: unit.cost.multiply(1.15),
    };
    
    // Recalculate department production
    const newCurrentRate = updatedUnits.reduce((total, u) => 
      total.add(u.production.multiply(u.count)), new BigNumber(0)
    );
    
    const updatedDepartments = [...state.departments];
    updatedDepartments[departmentIndex] = {
      ...department,
      units: updatedUnits,
      production: {
        ...department.production,
        currentRate: newCurrentRate,
      },
    };
    
    return {
      ...state,
      money: state.money.add(unit.cost.multiply(-1)),
      departments: updatedDepartments,
    };
  }),
  
  reset: () => set(() => ({ ...initialState })),
}));