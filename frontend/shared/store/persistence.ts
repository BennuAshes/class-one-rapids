import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GameState,
  PersistedGameState,
  STORAGE_KEYS,
  isValidGameState,
  sanitizeGameState,
} from '../types/game';

/**
 * Current version of the persisted state schema.
 * Increment this when making breaking changes to the state structure.
 */
const CURRENT_VERSION = 1;

/**
 * Custom error thrown when storage quota is exceeded.
 */
export class StorageQuotaError extends Error {
  constructor(message: string = 'Storage quota exceeded') {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

/**
 * Saves the game state to AsyncStorage with versioning and timestamp.
 *
 * @param state - The game state to save
 * @throws {StorageQuotaError} When storage quota is exceeded
 */
export async function saveGameState(state: GameState): Promise<void> {
  try {
    const persisted: PersistedGameState = {
      version: CURRENT_VERSION,
      data: state,
      timestamp: Date.now(),
    };

    const serialized = JSON.stringify(persisted);
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATE, serialized);
  } catch (error) {
    // Handle quota exceeded errors specifically
    if (error && typeof error === 'object' && 'name' in error) {
      if (error.name === 'QuotaExceededError') {
        throw new StorageQuotaError('Storage quota exceeded while saving game state');
      }
    }
    throw error;
  }
}

/**
 * Loads the game state from AsyncStorage.
 * Returns null if no state exists or if the state is invalid/corrupted.
 *
 * @returns The loaded game state, or null if unavailable or invalid
 */
export async function loadGameState(): Promise<GameState | null> {
  try {
    const serialized = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATE);

    if (!serialized) {
      return null;
    }

    const persisted: PersistedGameState = JSON.parse(serialized);

    // Check version compatibility
    if (persisted.version !== CURRENT_VERSION) {
      console.warn(`Unsupported state version: ${persisted.version}`);
      return null;
    }

    // Validate state structure
    if (!isValidGameState(persisted.data)) {
      console.warn('Invalid game state structure');
      return null;
    }

    // Sanitize values to ensure they're within valid ranges
    return sanitizeGameState(persisted.data);
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
}

/**
 * Clears the saved game state from AsyncStorage.
 *
 * @throws Errors from AsyncStorage operations
 */
export async function clearGameState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  } catch (error) {
    console.error('Error clearing game state:', error);
    throw error;
  }
}

/**
 * Checks if AsyncStorage is available and functioning.
 * Uses a test key to verify read/write operations.
 *
 * @returns true if storage is available, false otherwise
 */
export async function isStorageAvailable(): Promise<boolean> {
  try {
    const testKey = '__storage_test__';
    await AsyncStorage.setItem(testKey, 'test');
    await AsyncStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}
