import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { BigNumber } from '../../shared/utils/BigNumber';
import type { GameState } from '../state/gameStore';

export interface SaveData {
  version: string;
  timestamp: number;
  checksum: string;
  gameState: SerializedGameState;
}

export interface SerializedGameState {
  money: { value: number; exponent: number };
  departments: any[]; // Will expand in later phases
  statistics: {
    totalClicks: number;
    totalEarned: { value: number; exponent: number };
    playTime: number;
  };
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
}

export class SaveSystem {
  private static readonly SAVE_KEY = 'petsoft_tycoon_save';
  private static readonly BACKUP_KEYS = ['save_backup_1', 'save_backup_2'];
  
  static async save(gameState: GameState): Promise<void> {
    try {
      const saveData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        checksum: '',
        gameState: this.serializeGameState(gameState),
      };
      
      // Generate simple checksum
      saveData.checksum = this.generateChecksum(saveData);
      
      const serialized = JSON.stringify(saveData);
      
      // Save to secure store
      await SecureStore.setItemAsync(this.SAVE_KEY, serialized);
      
      // Rotate backups
      await this.rotateBackups(serialized);
      
    } catch (error) {
      console.error('Save failed:', error);
      throw new Error('Failed to save game progress');
    }
  }
  
  static async load(): Promise<GameState | null> {
    const saveKeys = [this.SAVE_KEY, ...this.BACKUP_KEYS];
    
    for (const key of saveKeys) {
      try {
        const serialized = await SecureStore.getItemAsync(key);
        if (!serialized) continue;
        
        const saveData: SaveData = JSON.parse(serialized);
        
        // Verify checksum
        if (!this.verifyChecksum(saveData)) {
          console.warn(`Corrupted save detected: ${key}`);
          continue;
        }
        
        return this.deserializeGameState(saveData.gameState);
        
      } catch (error) {
        console.warn(`Failed to load from ${key}:`, error);
      }
    }
    
    return null;
  }
  
  private static serializeGameState(gameState: GameState): SerializedGameState {
    return {
      money: gameState.money.serialize(),
      departments: [], // Will expand in later phases
      statistics: {
        totalClicks: gameState.statistics.totalClicks,
        totalEarned: gameState.statistics.totalEarned.serialize(),
        playTime: gameState.statistics.playTime,
      },
      settings: gameState.settings,
    };
  }
  
  private static deserializeGameState(data: SerializedGameState): GameState {
    return {
      money: BigNumber.deserialize(data.money),
      departments: [], // Will expand in later phases
      statistics: {
        totalClicks: data.statistics.totalClicks,
        totalEarned: BigNumber.deserialize(data.statistics.totalEarned),
        playTime: data.statistics.playTime,
      },
      settings: data.settings,
    };
  }
  
  private static generateChecksum(saveData: SaveData): string {
    const stateString = JSON.stringify(saveData.gameState);
    // Simple hash - in production use crypto library
    return btoa(stateString).slice(0, 16);
  }
  
  private static verifyChecksum(saveData: SaveData): boolean {
    const expectedChecksum = this.generateChecksum({
      ...saveData,
      checksum: '',
    });
    return expectedChecksum === saveData.checksum;
  }
  
  private static async rotateBackups(saveData: string): Promise<void> {
    try {
      // Move backup_1 to backup_2
      const backup1 = await SecureStore.getItemAsync(this.BACKUP_KEYS[0]!);
      if (backup1) {
        await SecureStore.setItemAsync(this.BACKUP_KEYS[1]!, backup1);
      }
      
      // Save current as backup_1
      await SecureStore.setItemAsync(this.BACKUP_KEYS[0]!, saveData);
    } catch (error) {
      console.warn('Backup rotation failed:', error);
    }
  }
}