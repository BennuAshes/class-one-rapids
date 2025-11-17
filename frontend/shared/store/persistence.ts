import AsyncStorage from '@react-native-async-storage/async-storage';
import { PurchaseState } from '../../modules/upgrades/types';

const STORAGE_KEY = 'purchased-upgrades-v1';
const DEBOUNCE_MS = 1000;

let saveTimeout: NodeJS.Timeout | null = null;

/**
 * Save purchased upgrades to AsyncStorage with debounce
 * Multiple rapid calls within debounce window will batch into single write
 */
export async function savePurchases(purchasedUpgrades: string[]): Promise<void> {
  // Clear existing timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Schedule save after debounce period
  return new Promise((resolve, reject) => {
    saveTimeout = setTimeout(async () => {
      try {
        const data: PurchaseState = {
          version: 1,
          purchasedUpgrades,
          timestamp: Date.now(),
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        resolve();
      } catch (error) {
        console.error('Failed to save purchases:', error);
        reject(error);
      }
    }, DEBOUNCE_MS);
  });
}

/**
 * Load purchased upgrades from AsyncStorage
 * Called on app initialization
 */
export async function loadPurchases(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return []; // No purchases yet
    }

    const data: PurchaseState = JSON.parse(raw);

    // Version migration logic (future-proofing)
    if (data.version === 1) {
      return data.purchasedUpgrades;
    }

    // Unknown version: return empty to avoid corruption
    console.warn('Unknown purchase data version:', data.version);
    return [];
  } catch (error) {
    console.error('Failed to load purchases:', error);
    return []; // Fail gracefully
  }
}

/**
 * Clear all purchases (debug/testing only)
 */
export async function clearPurchases(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear purchases:', error);
  }
}
