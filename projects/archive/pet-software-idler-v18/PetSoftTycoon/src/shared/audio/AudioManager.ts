import { Audio } from 'expo-av';

class AudioManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private lastPlayTimes: Map<string, number> = new Map();
  private enabled: boolean = true;
  private volume: number = 1.0;
  
  async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
      
      await this.loadSounds();
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }
  
  private async loadSounds(): Promise<void> {
    // Sound files would be loaded here when available
    // const soundFiles = {
    //   keyboardClick: require('./sounds/keyboard-click.wav'),
    //   cashRegister: require('./sounds/cash-register.wav'),
    //   notification: require('./sounds/notification.wav'),
    //   milestone: require('./sounds/milestone.wav'),
    // };
    
    console.log('Audio sounds would be loaded here');
  }
  
  playSound(soundKey: string, volume: number = this.volume): void {
    if (!this.enabled) return;
    
    const now = Date.now();
    const lastPlay = this.lastPlayTimes.get(soundKey) || 0;
    
    // Prevent sound spam (max once per 100ms)
    if (now - lastPlay < 100) return;
    
    const sound = this.sounds.get(soundKey);
    if (sound) {
      sound.setVolumeAsync(volume);
      sound.replayAsync().catch(error => 
        console.error(`Failed to play sound ${soundKey}:`, error)
      );
      this.lastPlayTimes.set(soundKey, now);
    } else {
      console.log(`Playing sound: ${soundKey}`);
    }
  }
  
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}

export const audioManager = new AudioManager();

// Hook for easy component usage
export const useAudio = () => {
  return {
    playSound: audioManager.playSound.bind(audioManager),
    setEnabled: audioManager.setEnabled.bind(audioManager),
    setVolume: audioManager.setVolume.bind(audioManager),
  };
};