import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

interface DeveloperUnit {
  id: string;
  type: 'junior' | 'mid' | 'senior' | 'lead';
  count: number;
  baseCost: number;
  production: number;
}

const DEVELOPER_CONFIGS = {
  junior: { baseCost: 10, production: 0.1 },
  mid: { baseCost: 100, production: 0.5 },
  senior: { baseCost: 1000, production: 2.0 },
  lead: { baseCost: 10000, production: 5.0 },
};

const developmentState$ = observable({
  linesOfCode: 0,
  developers: Object.entries(DEVELOPER_CONFIGS).map(([type, config]) => ({
    id: type,
    type: type as keyof typeof DEVELOPER_CONFIGS,
    count: 0,
    baseCost: config.baseCost,
    production: config.production,
  })),
  
  upgrades: {
    ides: 0,
    pairProgramming: false,
    codeReviews: false,
  },
  
  // Computed values
  totalProduction: () => {
    const developers = developmentState$.developers.get();
    return developers.reduce((total, dev) => {
      const upgradeMultiplier = 1 + (developmentState$.upgrades.ides.get() * 0.1);
      return total + (dev.count * dev.production * upgradeMultiplier);
    }, 0);
  },
  
  currentDeveloperCost: (type: keyof typeof DEVELOPER_CONFIGS) => {
    const developers = developmentState$.developers.get();
    const dev = developers.find(d => d.type === type);
    if (!dev) return 0;
    
    // Cost scaling: baseCost * 1.15^owned
    return Math.floor(dev.baseCost * Math.pow(1.15, dev.count));
  },
});

export const useDevelopment = () => {
  const hireDeveloper = (type: keyof typeof DEVELOPER_CONFIGS, playerMoney: number): boolean => {
    const cost = developmentState$.currentDeveloperCost(type);
    
    if (playerMoney < cost) {
      return false;
    }
    
    // Find and update developer count
    const developers = developmentState$.developers.get();
    const devIndex = developers.findIndex(d => d.type === type);
    
    if (devIndex >= 0) {
      developmentState$.developers[devIndex].count.set(prev => prev + 1);
      
      // Emit event for global state update
      gameEvents.emit('developer.hired', { type, cost });
      gameEvents.emit('money.earned', { amount: -cost, source: 'developer_purchase' });
      
      return true;
    }
    
    return false;
  };
  
  const upgradeIdes = (playerMoney: number): boolean => {
    const cost = 1000 * Math.pow(2, developmentState$.upgrades.ides.get());
    
    if (playerMoney >= cost) {
      developmentState$.upgrades.ides.set(prev => prev + 1);
      gameEvents.emit('money.earned', { amount: -cost, source: 'ide_upgrade' });
      return true;
    }
    
    return false;
  };
  
  const writeCode = (): void => {
    const production = developmentState$.totalProduction.get();
    const codeAmount = Math.max(1, Math.floor(production));
    
    developmentState$.linesOfCode.set(prev => prev + codeAmount);
    gameEvents.emit('code.written', { amount: codeAmount, developerType: 'manual' });
  };
  
  return {
    // Read-only state
    linesOfCode: developmentState$.linesOfCode,
    developers: developmentState$.developers,
    totalProduction: developmentState$.totalProduction,
    upgrades: developmentState$.upgrades,
    currentDeveloperCost: developmentState$.currentDeveloperCost,
    
    // Actions
    hireDeveloper,
    upgradeIdes,
    writeCode,
  };
};