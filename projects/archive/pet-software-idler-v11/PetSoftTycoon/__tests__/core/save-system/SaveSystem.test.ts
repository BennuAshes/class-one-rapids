import { SaveSystem } from '../../../src/core/save-system/SaveSystem';
import { BigNumber } from '../../../src/shared/utils/BigNumber';
import type { GameState } from '../../../src/core/state/gameStore';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
}));

const mockGameState: GameState = {
  money: new BigNumber(500),
  departments: [],
  statistics: {
    totalClicks: 10,
    totalEarned: new BigNumber(1000),
    playTime: 5000,
  },
  settings: {
    soundEnabled: true,
    musicEnabled: false,
  },
};

describe('SaveSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save game state successfully', async () => {
    await expect(SaveSystem.save(mockGameState)).resolves.not.toThrow();
  });

  it('should handle save failures gracefully', async () => {
    const SecureStore = require('expo-secure-store');
    SecureStore.setItemAsync.mockRejectedValueOnce(new Error('Storage error'));
    
    await expect(SaveSystem.save(mockGameState)).rejects.toThrow('Failed to save game progress');
  });

  it('should return null when no save data exists', async () => {
    const result = await SaveSystem.load();
    expect(result).toBeNull();
  });
});