import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

const playerState$ = observable({
  money: 100,
  valuation: 1000,
  investmentPoints: 0,
  startTime: Date.now(),
  lastSave: Date.now(),
  
  // Computed values
  moneyPerSecond: () => {
    // Calculate passive income from all sources
    return 0; // Will be implemented with automated systems
  },
});

// Listen to game events for state updates
gameEvents.on<{ amount: number; source: string }>('money.earned', ({ amount }) => {
  playerState$.money.set(prev => Math.max(0, prev + amount));
});

gameEvents.on<{ value: number; featureType: string }>('feature.shipped', ({ value }) => {
  playerState$.money.set(prev => prev + value);
  playerState$.valuation.set(prev => prev + value * 10);
});

export const usePlayer = () => {
  const canAfford = (cost: number): boolean => {
    return playerState$.money.get() >= cost;
  };
  
  const spendMoney = (amount: number): boolean => {
    if (canAfford(amount)) {
      playerState$.money.set(prev => prev - amount);
      return true;
    }
    return false;
  };
  
  return {
    // Read-only state
    money: playerState$.money,
    valuation: playerState$.valuation,
    investmentPoints: playerState$.investmentPoints,
    moneyPerSecond: playerState$.moneyPerSecond,
    
    // Actions
    canAfford,
    spendMoney,
  };
};