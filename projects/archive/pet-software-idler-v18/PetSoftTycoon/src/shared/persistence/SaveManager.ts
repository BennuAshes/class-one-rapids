import AsyncStorage from '@react-native-async-storage/async-storage';

interface SaveData {
  version: string;
  timestamp: number;
  gameState: {
    player: any;
    departments: any;
    progression: any;
    settings: any;
  };
  checksum: string;
}

class SaveManager {
  private readonly SAVE_KEY = 'petsoft_tycoon_save';
  private readonly BACKUP_KEY = 'petsoft_tycoon_backup';
  private readonly SAVE_VERSION = '1.0.0';
  
  async saveGame(gameState: SaveData['gameState']): Promise<void> {
    try {
      // Create backup of current save
      const currentSave = await AsyncStorage.getItem(this.SAVE_KEY);
      if (currentSave) {
        await AsyncStorage.setItem(this.BACKUP_KEY, currentSave);
      }
      
      const saveData: SaveData = {
        version: this.SAVE_VERSION,
        timestamp: Date.now(),
        gameState,
        checksum: this.generateChecksum(gameState),
      };
      
      await AsyncStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
    } catch (error) {
      console.error('Save failed:', error);
      throw new Error('Failed to save game');
    }
  }
  
  async loadGame(): Promise<SaveData['gameState'] | null> {
    try {
      const saveString = await AsyncStorage.getItem(this.SAVE_KEY);
      if (!saveString) return null;
      
      const saveData: SaveData = JSON.parse(saveString);
      
      // Verify checksum
      if (saveData.checksum !== this.generateChecksum(saveData.gameState)) {
        console.warn('Save data corrupted, attempting backup');
        return this.loadBackup();
      }
      
      return saveData.gameState;
    } catch (error) {
      console.error('Load failed:', error);
      return this.loadBackup();
    }
  }
  
  private generateChecksum(gameState: SaveData['gameState']): string {
    return btoa(JSON.stringify(gameState)).slice(0, 16);
  }
  
  private async loadBackup(): Promise<SaveData['gameState'] | null> {
    try {
      const backupString = await AsyncStorage.getItem(this.BACKUP_KEY);
      if (!backupString) return null;
      
      const backupData: SaveData = JSON.parse(backupString);
      return backupData.gameState;
    } catch (error) {
      console.error('Backup load failed:', error);
      return null;
    }
  }
}

export const saveManager = new SaveManager();

// Auto-save functionality
export class AutoSaveManager {
  private saveInterval: NodeJS.Timeout | null = null;
  
  startAutoSave(getGameState: () => SaveData['gameState'], intervalMs: number = 30000) {
    this.saveInterval = setInterval(async () => {
      try {
        const gameState = getGameState();
        await saveManager.saveGame(gameState);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, intervalMs);
  }
  
  stopAutoSave() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }
}