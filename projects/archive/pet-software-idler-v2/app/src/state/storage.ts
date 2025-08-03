import { MMKV } from 'react-native-mmkv';

// Create MMKV storage instance for the game
export const storage = new MMKV({
  id: 'pet-software-idler-storage',
});

// Helper to clear all game data (for reset functionality)
export const clearGameStorage = () => {
  storage.clearAll();
};