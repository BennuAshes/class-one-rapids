import { gameState$, productionRates$ } from './gameState';
import { batch } from '@legendapp/state';

// Auto-save every 30 seconds
export const startAutoSave = () => {
  const interval = setInterval(() => {
    saveGame();
  }, 30000);
  
  return () => clearInterval(interval);
};

export const saveGame = () => {
  batch(() => {
    gameState$.stats.lastSaveTime.set(Date.now());
  });
  // Legend State automatically persists with MMKV
  console.log('Game saved at', new Date().toISOString());
};

// Calculate offline progress
export const calculateOfflineProgress = () => {
  const lastSave = gameState$.stats.lastSaveTime.get();
  const now = Date.now();
  const offlineSeconds = Math.min((now - lastSave) / 1000, 12 * 60 * 60); // Cap at 12 hours
  
  if (offlineSeconds > 0) {
    const rates = productionRates$.get();
    
    batch(() => {
      gameState$.resources.linesOfCode.set(current => 
        current + (rates.linesPerSecond * offlineSeconds)
      );
      gameState$.resources.customerLeads.set(current =>
        current + (rates.leadsPerSecond * offlineSeconds)
      );
      
      // Update stats
      gameState$.stats.totalLinesWritten.set(current =>
        current + (rates.linesPerSecond * offlineSeconds)
      );
    });
    
    return {
      timeOffline: offlineSeconds,
      linesEarned: rates.linesPerSecond * offlineSeconds,
      leadsEarned: rates.leadsPerSecond * offlineSeconds,
    };
  }
  
  return null;
};