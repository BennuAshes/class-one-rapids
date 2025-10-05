import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

const STORAGE_KEY = '@last_close_time';

export class TimeTrackerService {
  private lastBackgroundTime: number | null = null;
  private subscription: any = null;

  startTracking(onResume: (minutesAway: number) => void) {
    this.subscription = AppState.addEventListener('change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background') {
          this.saveTimestamp();
        } else if (nextAppState === 'active') {
          this.calculateTimeAway().then(onResume);
        }
      }
    );

    // Check previous session
    this.calculateTimeAway().then(onResume);
  }

  async saveTimestamp() {
    const now = Date.now();
    this.lastBackgroundTime = now;
    await AsyncStorage.setItem(STORAGE_KEY, now.toString());
  }

  async calculateTimeAway(): Promise<number> {
    const savedTime = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedTime) {
      const timeAwayMs = Date.now() - parseInt(savedTime);
      return Math.floor(timeAwayMs / 60000); // minutes
    }
    return 0;
  }

  stopTracking() {
    this.subscription?.remove();
  }
}