import { observable } from '@legendapp/state';

// Core game state for global concerns only
// Feature-specific state is managed in their respective stores
export const gameState$ = observable({
  // Global resources
  money: 0,
  valuation: 0,
  
  // Game settings
  settings: {
    sfxEnabled: true,
    musicEnabled: true,
    autoSave: true,
    theme: 'light' as 'light' | 'dark'
  },
  
  // Game meta information
  meta: {
    gameStarted: false,
    lastSaveTime: 0,
    totalPlayTime: 0,
    version: '1.0.0'
  }
});