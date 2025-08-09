# Phase 4: Quality & Polish

## Objectives
- Implement sophisticated audio system with dynamic sound
- Create premium animations and particle effects
- Optimize performance for all target devices
- Build robust save/load system with corruption protection
- Add comprehensive testing and quality assurance

## Prerequisites
- Phase 3 Department Integration completed ✅
- All 7 departments functional ✅
- Prestige system working correctly ✅

## Tasks Checklist

### 1. Audio System Implementation

- [ ] **Install and Configure Audio Dependencies**
  ```bash
  npx expo install expo-av
  npx expo install expo-asset
  ```

- [ ] **Create Audio Manager Service**
  ```typescript
  // src/features/ui/services/audioManager.ts
  import { Audio } from 'expo-av';
  import { gameState$ } from '../../game-core/state/gameState$';
  
  export class AudioManager {
    private static sounds: Map<string, Audio.Sound> = new Map();
    private static musicInstance: Audio.Sound | null = null;
    private static lastPlayTime: Map<string, number> = new Map();
    private static initialized = false;
    
    static async initialize() {
      if (this.initialized) return;
      
      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Preload sounds for instant playback
      const soundsToLoad = [
        { key: 'click', file: require('../../../assets/audio/click.mp3') },
        { key: 'buy', file: require('../../../assets/audio/purchase.mp3') },
        { key: 'milestone', file: require('../../../assets/audio/achievement.mp3') },
        { key: 'prestige', file: require('../../../assets/audio/prestige.mp3') },
        { key: 'unlock', file: require('../../../assets/audio/unlock.mp3') },
      ];
      
      for (const { key, file } of soundsToLoad) {
        try {
          const { sound } = await Audio.Sound.createAsync(file, {
            shouldPlay: false,
            isLooping: false,
            volume: 0.5,
          });
          this.sounds.set(key, sound);
        } catch (error) {
          console.warn(`Failed to load sound: ${key}`, error);
        }
      }
      
      // Load background music
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../../assets/audio/background.mp3'),
          {
            shouldPlay: false,
            isLooping: true,
            volume: 0.3,
          }
        );
        this.musicInstance = sound;
      } catch (error) {
        console.warn('Failed to load background music', error);
      }
      
      this.initialized = true;
    }
    
    static async playSound(key: string, options?: { 
      pitch?: number; 
      volume?: number; 
      cooldown?: number 
    }) {
      if (!gameState$.settings.soundEnabled.get() || !this.initialized) return;
      
      const now = Date.now();
      const lastPlay = this.lastPlayTime.get(key) || 0;
      const cooldown = options?.cooldown || 50;
      
      // Anti-spam protection
      if (now - lastPlay < cooldown) return;
      
      const sound = this.sounds.get(key);
      if (!sound) return;
      
      try {
        await sound.setPositionAsync(0);
        
        if (options?.pitch) {
          await sound.setPitchCorrectionQualityAsync(Audio.PitchCorrectionQuality.High);
          await sound.setRateAsync(options.pitch, true);
        }
        
        if (options?.volume !== undefined) {
          await sound.setVolumeAsync(options.volume);
        }
        
        await sound.playAsync();
        this.lastPlayTime.set(key, now);
      } catch (error) {
        console.warn(`Failed to play sound: ${key}`, error);
      }
    }
    
    // Dynamic pitch variation to prevent repetition
    static getClickPitch(clickCount: number): number {
      const basePitch = 1.0;
      const variation = 0.3;
      const frequency = clickCount % 12;
      return basePitch + (Math.sin(frequency * Math.PI / 6) * variation);
    }
    
    // Adaptive music based on game pace
    static async updateMusicTempo(gameSpeed: number) {
      if (!this.musicInstance || !gameState$.settings.musicEnabled.get()) return;
      
      try {
        const tempo = Math.min(1.5, Math.max(0.8, 1.0 + (gameSpeed - 1) * 0.2));
        await this.musicInstance.setRateAsync(tempo, true);
      } catch (error) {
        console.warn('Failed to update music tempo', error);
      }
    }
    
    static async startBackgroundMusic() {
      if (!this.musicInstance || !gameState$.settings.musicEnabled.get()) return;
      
      try {
        const status = await this.musicInstance.getStatusAsync();
        if (!status.isLoaded || status.isPlaying) return;
        
        await this.musicInstance.playAsync();
      } catch (error) {
        console.warn('Failed to start background music', error);
      }
    }
    
    static async stopBackgroundMusic() {
      if (!this.musicInstance) return;
      
      try {
        await this.musicInstance.stopAsync();
      } catch (error) {
        console.warn('Failed to stop background music', error);
      }
    }
  }
  ```

- [ ] **Create Audio Hook for Components**
  ```typescript
  // src/features/ui/hooks/useAudio.ts
  import { useCallback } from 'react';
  import { AudioManager } from '../services/audioManager';
  import { gameState$ } from '../../game-core/state/gameState$';
  
  export const useAudio = () => {
    const playClickSound = useCallback((clickCount = 0) => {
      const pitch = AudioManager.getClickPitch(clickCount);
      AudioManager.playSound('click', { pitch, volume: 0.6 });
    }, []);
    
    const playPurchaseSound = useCallback(() => {
      AudioManager.playSound('buy', { volume: 0.8 });
    }, []);
    
    const playMilestoneSound = useCallback(() => {
      AudioManager.playSound('milestone', { volume: 1.0 });
    }, []);
    
    const playPrestigeSound = useCallback(() => {
      AudioManager.playSound('prestige', { volume: 1.0 });
    }, []);
    
    const playUnlockSound = useCallback(() => {
      AudioManager.playSound('unlock', { volume: 0.9 });
    }, []);
    
    return {
      playClickSound,
      playPurchaseSound,
      playMilestoneSound,
      playPrestigeSound,
      playUnlockSound,
    };
  };
  ```

### 2. Advanced Animation System

- [ ] **Create Animation Configuration**
  ```typescript
  // src/features/ui/config/animationConfig.ts
  import { Easing } from 'react-native-reanimated';
  import { gameState$ } from '../../game-core/state/gameState$';
  
  export const AnimationConfig = {
    // Button interactions - <50ms response
    buttonPress: {
      duration: 100,
      easing: Easing.out(Easing.quad),
    },
    
    // Resource counters - smooth increments
    counterUpdate: {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    },
    
    // Panel transitions - premium feel
    panelSlide: {
      duration: 400,
      easing: Easing.out(Easing.back(1.1)),
    },
    
    // Particle effects - scale with performance
    particles: {
      duration: 800,
      get count() {
        const quality = gameState$.settings.qualityLevel.get();
        switch (quality) {
          case 'high': return 20;
          case 'medium': return 10;
          case 'low': return 3;
          default: return 10;
        }
      },
    },
    
    // Screen shake for milestones
    screenShake: {
      intensity: 3,
      duration: 200,
      frequency: 8,
    },
    
    // Achievement toasts
    achievementToast: {
      slideInDuration: 300,
      displayDuration: 3000,
      slideOutDuration: 300,
      easing: Easing.out(Easing.back(1.5)),
    },
  };
  ```

- [ ] **Create Particle Effect Component**
  ```typescript
  // src/features/ui/components/ParticleEffect.tsx
  import React, { useEffect } from 'react';
  import { View, StyleSheet } from 'react-native';
  import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withDelay,
    runOnJS,
  } from 'react-native-reanimated';
  import { AnimationConfig } from '../config/animationConfig';
  
  interface Particle {
    id: string;
    startX: number;
    startY: number;
    color: string;
    size: number;
  }
  
  interface ParticleEffectProps {
    trigger: number;
    origin: { x: number; y: number };
    value?: number;
    onComplete?: () => void;
  }
  
  const ParticleEffect: React.FC<ParticleEffectProps> = ({
    trigger,
    origin,
    value = 1,
    onComplete,
  }) => {
    const particles = React.useMemo(() => {
      const count = Math.min(AnimationConfig.particles.count, Math.ceil(value / 10));
      return Array.from({ length: count }, (_, i) => ({
        id: `particle-${i}`,
        startX: origin.x + (Math.random() - 0.5) * 40,
        startY: origin.y + (Math.random() - 0.5) * 40,
        color: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'][Math.floor(Math.random() * 4)],
        size: 4 + Math.random() * 6,
      }));
    }, [trigger, value, origin]);
    
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {particles.map(particle => (
          <ParticleBubble
            key={particle.id}
            particle={particle}
            trigger={trigger}
            onComplete={onComplete}
          />
        ))}
      </View>
    );
  };
  
  const ParticleBubble: React.FC<{
    particle: Particle;
    trigger: number;
    onComplete?: () => void;
  }> = ({ particle, trigger, onComplete }) => {
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0);
    
    const animatedStyle = useAnimatedStyle(() => ({
      position: 'absolute',
      left: particle.startX,
      top: particle.startY,
      width: particle.size,
      height: particle.size,
      borderRadius: particle.size / 2,
      backgroundColor: particle.color,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    }));
    
    useEffect(() => {
      if (trigger === 0) return;
      
      const randomX = (Math.random() - 0.5) * 100;
      const randomY = -50 - Math.random() * 50;
      
      scale.value = withTiming(1, { duration: 100 });
      opacity.value = withTiming(1, { duration: 100 });
      
      translateX.value = withTiming(randomX, {
        duration: AnimationConfig.particles.duration,
      });
      
      translateY.value = withTiming(randomY, {
        duration: AnimationConfig.particles.duration,
      });
      
      opacity.value = withDelay(
        200,
        withTiming(0, {
          duration: AnimationConfig.particles.duration - 200,
        }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        })
      );
    }, [trigger]);
    
    return <Animated.View style={animatedStyle} />;
  };
  
  export default ParticleEffect;
  ```

- [ ] **Create Screen Shake Effect**
  ```typescript
  // src/features/ui/hooks/useScreenShake.ts
  import { useSharedValue } from 'react-native-reanimated';
  import { AnimationConfig } from '../config/animationConfig';
  import { useCallback } from 'react';
  import { withSequence, withTiming } from 'react-native-reanimated';
  
  export const useScreenShake = () => {
    const shakeX = useSharedValue(0);
    const shakeY = useSharedValue(0);
    
    const triggerShake = useCallback((intensity: number = 1) => {
      const shakeIntensity = AnimationConfig.screenShake.intensity * intensity;
      const duration = AnimationConfig.screenShake.duration / 4;
      
      shakeX.value = withSequence(
        withTiming(shakeIntensity, { duration }),
        withTiming(-shakeIntensity, { duration }),
        withTiming(shakeIntensity * 0.5, { duration }),
        withTiming(0, { duration })
      );
      
      shakeY.value = withSequence(
        withTiming(shakeIntensity * 0.5, { duration }),
        withTiming(-shakeIntensity * 0.3, { duration }),
        withTiming(shakeIntensity * 0.2, { duration }),
        withTiming(0, { duration })
      );
    }, []);
    
    return {
      shakeX,
      shakeY,
      triggerShake,
    };
  };
  ```

### 3. Performance Optimization System

- [ ] **Create Performance Adapter**
  ```typescript
  // src/features/game-core/services/performanceAdapter.ts
  import { gameState$ } from '../state/gameState$';
  
  export class PerformanceAdapter {
    private static frameDropCounter = 0;
    private static lastFrameTime = 0;
    private static memoryCheckInterval: NodeJS.Timeout | null = null;
    private static performanceHistory: number[] = [];
    
    static initialize() {
      // Start performance monitoring
      const monitor = () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        if (deltaTime > 0) {
          const fps = Math.round(1000 / deltaTime);
          gameState$.performance.fps.set(fps);
          
          // Track performance history
          this.performanceHistory.push(fps);
          if (this.performanceHistory.length > 60) { // Keep last 60 frames
            this.performanceHistory.shift();
          }
          
          // Detect frame drops
          if (deltaTime > 20) { // >20ms = <50 FPS
            this.frameDropCounter++;
            gameState$.performance.frameDrops.set(prev => prev + 1);
            
            // Auto-adjust quality after persistent issues
            if (this.frameDropCounter > 15) {
              this.degradeQuality();
              this.frameDropCounter = 0;
            }
          } else if (deltaTime < 16) { // <16ms = >60 FPS
            this.frameDropCounter = Math.max(0, this.frameDropCounter - 1);
          }
        }
        
        this.lastFrameTime = currentTime;
        requestAnimationFrame(monitor);
      };
      
      requestAnimationFrame(monitor);
      
      // Memory monitoring
      this.memoryCheckInterval = setInterval(() => {
        this.checkMemoryUsage();
      }, 5000);
      
      return () => {
        if (this.memoryCheckInterval) {
          clearInterval(this.memoryCheckInterval);
        }
      };
    }
    
    private static degradeQuality() {
      const current = gameState$.settings.qualityLevel.get();
      
      switch (current) {
        case 'high':
          gameState$.settings.qualityLevel.set('medium');
          console.log('Performance: Quality reduced to Medium');
          break;
        case 'medium':
          gameState$.settings.qualityLevel.set('low');
          console.log('Performance: Quality reduced to Low');
          break;
        case 'auto':
          gameState$.settings.qualityLevel.set('low');
          console.log('Performance: Auto mode set to Low');
          break;
      }
    }
    
    private static checkMemoryUsage() {
      // Estimate memory usage (React Native doesn't have direct access)
      const estimate = this.estimateMemoryUsage();
      gameState$.performance.memoryUsage.set(estimate);
      
      if (estimate > 80) { // >80MB estimated usage
        this.triggerGarbageCollection();
      }
    }
    
    private static estimateMemoryUsage(): number {
      // Rough estimation based on game state complexity
      const resources = gameState$.resources.get();
      const totalResources = Object.values(resources).reduce((sum, val) => sum + val, 0);
      
      // Base usage + resource complexity
      let estimate = 25; // Base 25MB
      estimate += Math.floor(totalResources / 10000); // Resource impact
      estimate += this.performanceHistory.length * 0.1; // History impact
      
      return estimate;
    }
    
    private static triggerGarbageCollection() {
      // Clean up performance history
      this.performanceHistory = this.performanceHistory.slice(-30);
      
      // Reset frame drop counter
      this.frameDropCounter = 0;
      
      console.log('Performance: Memory cleanup triggered');
    }
    
    static getAveragePerformance(): { fps: number; stability: number } {
      if (this.performanceHistory.length === 0) {
        return { fps: 60, stability: 1.0 };
      }
      
      const avgFps = this.performanceHistory.reduce((sum, fps) => sum + fps, 0) / this.performanceHistory.length;
      const variance = this.performanceHistory.reduce((sum, fps) => sum + Math.pow(fps - avgFps, 2), 0) / this.performanceHistory.length;
      const stability = Math.max(0, 1 - (variance / 400)); // 400 = 20^2 (20fps variance = 0 stability)
      
      return { fps: Math.round(avgFps), stability };
    }
  }
  ```

- [ ] **Create Quality Settings Component**
  ```typescript
  // src/features/ui/components/QualitySettings.tsx
  import React from 'react';
  import { View, Text, StyleSheet } from 'react-native';
  import { observer } from '@legendapp/state/react';
  import { gameState$ } from '../../game-core/state/gameState$';
  import { Picker } from '@react-native-picker/picker';
  
  const QualitySettings = observer(() => {
    const settings = gameState$.settings.get();
    const performance = gameState$.performance.get();
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Performance Settings</Text>
        
        <View style={styles.setting}>
          <Text style={styles.label}>Graphics Quality</Text>
          <Picker
            selectedValue={settings.qualityLevel}
            style={styles.picker}
            onValueChange={(value) => gameState$.settings.qualityLevel.set(value)}
          >
            <Picker.Item label="Auto" value="auto" />
            <Picker.Item label="High" value="high" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Low" value="low" />
          </Picker>
        </View>
        
        <View style={styles.performanceInfo}>
          <Text style={styles.perfLabel}>Current FPS: {performance.fps}</Text>
          <Text style={styles.perfLabel}>Frame Drops: {performance.frameDrops}</Text>
          <Text style={styles.perfLabel}>Memory: ~{performance.memoryUsage}MB</Text>
        </View>
        
        <View style={styles.toggles}>
          <View style={styles.toggle}>
            <Text style={styles.toggleLabel}>Sound Effects</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => gameState$.settings.soundEnabled.set(value)}
            />
          </View>
          
          <View style={styles.toggle}>
            <Text style={styles.toggleLabel}>Background Music</Text>
            <Switch
              value={settings.musicEnabled}
              onValueChange={(value) => gameState$.settings.musicEnabled.set(value)}
            />
          </View>
          
          <View style={styles.toggle}>
            <Text style={styles.toggleLabel}>Particle Effects</Text>
            <Switch
              value={settings.particlesEnabled}
              onValueChange={(value) => gameState$.settings.particlesEnabled.set(value)}
            />
          </View>
        </View>
      </View>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    setting: {
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
    },
    picker: {
      height: 50,
      backgroundColor: '#f0f0f0',
    },
    performanceInfo: {
      backgroundColor: '#f8f9fa',
      padding: 15,
      borderRadius: 8,
      marginVertical: 15,
    },
    perfLabel: {
      fontSize: 14,
      color: '#666',
      marginBottom: 5,
    },
    toggles: {
      marginTop: 10,
    },
    toggle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    toggleLabel: {
      fontSize: 16,
    },
  });
  
  export default QualitySettings;
  ```

### 4. Robust Save/Load System

- [ ] **Create Advanced Save Manager**
  ```typescript
  // src/features/game-core/services/saveManager.ts
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import * as SecureStore from 'expo-secure-store';
  import { gameState$ } from '../state/gameState$';
  import { departmentState$ } from '../../departments/state/departmentState$';
  import { prestigeState$ } from '../../prestige/state/prestigeState$';
  import { achievementState$ } from '../../achievements/state/achievementState$';
  
  interface SaveData {
    version: string;
    timestamp: number;
    checksum: string;
    gameState: any;
    departmentState: any;
    prestigeState: any;
    achievementState: any;
  }
  
  export class SaveManager {
    private static readonly CURRENT_VERSION = '8.0.0';
    private static readonly SAVE_KEY = 'petsoft_tycoon_save';
    private static readonly BACKUP_KEY = 'petsoft_tycoon_backup';
    private static readonly EXPORT_KEY = 'petsoft_tycoon_export';
    private static autoSaveTimer: NodeJS.Timeout | null = null;
    private static lastSaveHash: string = '';
    
    // Version migrations for backward compatibility
    private static migrations: Record<string, (data: any) => any> = {
      '7.0.0': (data) => ({
        ...data,
        version: '8.0.0',
        gameState: {
          ...data.gameState,
          performance: { fps: 60, frameDrops: 0, memoryUsage: 0 }
        }
      })
    };
    
    static startAutoSave(interval: number = 30000) {
      this.stopAutoSave();
      
      this.autoSaveTimer = setInterval(async () => {
        const success = await this.performAutoSave();
        if (success) {
          console.log('Auto-save completed');
        } else {
          console.warn('Auto-save failed');
        }
      }, interval);
    }
    
    static stopAutoSave() {
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer);
        this.autoSaveTimer = null;
      }
    }
    
    static async performAutoSave(): Promise<boolean> {
      try {
        const currentData = this.gatherSaveData();
        const currentHash = this.calculateHash(currentData);
        
        // Skip save if nothing changed (performance optimization)
        if (currentHash === this.lastSaveHash) {
          return true;
        }
        
        const saveData: SaveData = {
          version: this.CURRENT_VERSION,
          timestamp: Date.now(),
          checksum: this.calculateChecksum(currentData),
          ...currentData
        };
        
        // Triple-save strategy for maximum reliability
        const savePromises = [
          AsyncStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData)),
          AsyncStorage.setItem(this.BACKUP_KEY, JSON.stringify(saveData)),
          this.saveToSecureStore(saveData)
        ];
        
        await Promise.allSettled(savePromises);
        
        this.lastSaveHash = currentHash;
        gameState$.meta.lastSave.set(Date.now());
        
        return true;
      } catch (error) {
        console.error('Auto-save failed:', error);
        return false;
      }
    }
    
    private static async saveToSecureStore(saveData: SaveData): Promise<void> {
      try {
        // Compress data for secure store
        const compressed = JSON.stringify(saveData);
        await SecureStore.setItemAsync('save_secure', compressed);
      } catch (error) {
        console.warn('Secure store save failed:', error);
      }
    }
    
    static async loadGame(): Promise<boolean> {
      try {
        let saveData = await this.loadFromStorage();
        
        if (!saveData) {
          console.log('No save data found, starting fresh game');
          return false;
        }
        
        // Validate save integrity
        if (!this.validateSave(saveData)) {
          console.warn('Save validation failed, attempting backup');
          saveData = await this.loadBackup();
          
          if (!saveData || !this.validateSave(saveData)) {
            console.error('All save recovery attempts failed');
            return false;
          }
        }
        
        // Apply migrations if needed
        if (saveData.version !== this.CURRENT_VERSION) {
          saveData = this.migrateSave(saveData);
        }
        
        // Restore game state
        this.applySaveData(saveData);
        
        console.log('Game loaded successfully');
        return true;
      } catch (error) {
        console.error('Load game failed:', error);
        return false;
      }
    }
    
    private static async loadFromStorage(): Promise<SaveData | null> {
      try {
        const saveString = await AsyncStorage.getItem(this.SAVE_KEY);
        return saveString ? JSON.parse(saveString) : null;
      } catch (error) {
        console.warn('Primary save load failed:', error);
        return null;
      }
    }
    
    private static async loadBackup(): Promise<SaveData | null> {
      try {
        // Try backup in AsyncStorage
        let saveString = await AsyncStorage.getItem(this.BACKUP_KEY);
        if (saveString) {
          return JSON.parse(saveString);
        }
        
        // Try secure store backup
        saveString = await SecureStore.getItemAsync('save_secure');
        return saveString ? JSON.parse(saveString) : null;
      } catch (error) {
        console.warn('Backup load failed:', error);
        return null;
      }
    }
    
    private static gatherSaveData() {
      return {
        gameState: gameState$.peek(),
        departmentState: departmentState$.peek(),
        prestigeState: prestigeState$.peek(),
        achievementState: achievementState$.peek(),
      };
    }
    
    private static calculateChecksum(data: any): string {
      // Simple checksum for integrity verification
      const str = JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString();
    }
    
    private static calculateHash(data: any): string {
      return JSON.stringify(data).length.toString();
    }
    
    private static validateSave(data: any): data is SaveData {
      if (!data || typeof data !== 'object') return false;
      if (!data.version || !data.timestamp || !data.checksum) return false;
      if (!data.gameState || !data.departmentState || !data.prestigeState) return false;
      
      // Verify checksum
      const expectedChecksum = this.calculateChecksum({
        gameState: data.gameState,
        departmentState: data.departmentState,
        prestigeState: data.prestigeState,
        achievementState: data.achievementState,
      });
      
      if (data.checksum !== expectedChecksum) {
        console.warn('Save file checksum mismatch');
        return false;
      }
      
      return true;
    }
    
    private static migrateSave(saveData: SaveData): SaveData {
      let migrated = saveData;
      
      for (const [version, migration] of Object.entries(this.migrations)) {
        if (saveData.version === version) {
          migrated = migration(migrated);
          break;
        }
      }
      
      return migrated;
    }
    
    private static applySaveData(saveData: SaveData) {
      gameState$.set(saveData.gameState);
      departmentState$.set(saveData.departmentState);
      prestigeState$.set(saveData.prestigeState);
      
      if (saveData.achievementState) {
        achievementState$.set(saveData.achievementState);
      }
    }
    
    // Export/Import for cross-device play
    static async exportSave(): Promise<string | null> {
      try {
        const saveData = {
          version: this.CURRENT_VERSION,
          timestamp: Date.now(),
          checksum: '',
          ...this.gatherSaveData()
        };
        
        saveData.checksum = this.calculateChecksum(saveData);
        
        // Base64 encode for sharing
        return btoa(JSON.stringify(saveData));
      } catch (error) {
        console.error('Export failed:', error);
        return null;
      }
    }
    
    static async importSave(saveCode: string): Promise<boolean> {
      try {
        const saveData = JSON.parse(atob(saveCode));
        
        if (!this.validateSave(saveData)) {
          console.error('Invalid save code');
          return false;
        }
        
        this.applySaveData(saveData);
        await this.performAutoSave(); // Save the imported data
        
        console.log('Save imported successfully');
        return true;
      } catch (error) {
        console.error('Import failed:', error);
        return false;
      }
    }
  }
  ```

### 5. Achievement Toast System

- [ ] **Create Achievement Toast Component**
  ```typescript
  // src/features/achievements/components/AchievementToast.tsx
  import React, { useEffect } from 'react';
  import { View, Text, StyleSheet, Dimensions } from 'react-native';
  import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withDelay,
    withSequence,
    runOnJS,
  } from 'react-native-reanimated';
  import { AnimationConfig } from '../../ui/config/animationConfig';
  import { useAudio } from '../../ui/hooks/useAudio';
  
  interface AchievementToastProps {
    achievement: {
      title: string;
      description: string;
      icon: string;
    } | null;
    onComplete: () => void;
  }
  
  const { width } = Dimensions.get('window');
  
  const AchievementToast: React.FC<AchievementToastProps> = ({
    achievement,
    onComplete,
  }) => {
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);
    
    const { playMilestoneSound } = useAudio();
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    }));
    
    useEffect(() => {
      if (!achievement) {
        translateY.value = -100;
        opacity.value = 0;
        scale.value = 0.8;
        return;
      }
      
      // Play sound
      playMilestoneSound();
      
      // Slide in animation
      translateY.value = withTiming(0, {
        duration: AnimationConfig.achievementToast.slideInDuration,
        easing: AnimationConfig.achievementToast.easing,
      });
      
      opacity.value = withTiming(1, {
        duration: AnimationConfig.achievementToast.slideInDuration,
      });
      
      scale.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1.0, { duration: 100 })
      );
      
      // Auto-dismiss after display duration
      translateY.value = withDelay(
        AnimationConfig.achievementToast.displayDuration,
        withTiming(-100, {
          duration: AnimationConfig.achievementToast.slideOutDuration,
        }, (finished) => {
          if (finished) {
            runOnJS(onComplete)();
          }
        })
      );
      
      opacity.value = withDelay(
        AnimationConfig.achievementToast.displayDuration,
        withTiming(0, {
          duration: AnimationConfig.achievementToast.slideOutDuration,
        })
      );
    }, [achievement]);
    
    if (!achievement) return null;
    
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.content}>
          <Text style={styles.icon}>{achievement.icon}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{achievement.title}</Text>
            <Text style={styles.description}>{achievement.description}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 60,
      left: 20,
      right: 20,
      zIndex: 9999,
    },
    content: {
      backgroundColor: '#4CAF50',
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    icon: {
      fontSize: 32,
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      color: '#fff',
      opacity: 0.9,
    },
  });
  
  export default AchievementToast;
  ```

## Validation Criteria

### Must Pass ✅
- [ ] Audio system works on all target platforms
- [ ] Animations maintain 60 FPS on mid-range devices
- [ ] Save/load system handles corruption gracefully
- [ ] Performance adapter adjusts quality automatically
- [ ] Achievement notifications feel satisfying

### Should Pass ⚠️
- [ ] Particle effects scale appropriately with device performance
- [ ] Memory usage stays under 50MB active
- [ ] Audio pitch variation prevents repetition fatigue
- [ ] Screen shake effects enhance milestone moments

### Nice to Have 💡
- [ ] Dynamic music tempo matches game pace
- [ ] Quality settings provide meaningful performance options
- [ ] Achievement toasts have premium feel
- [ ] Save export/import works for cross-device play

## Testing Commands

```bash
# Performance testing on low-end device simulation
# Reduce animation scale in developer options

# Memory leak testing
# Monitor with React DevTools

# Audio testing
# Test with sound enabled/disabled
# Verify pitch variations

# Save system stress testing
# Force app crashes during saves
# Test migration from old versions
```

## Troubleshooting

### Audio Issues
- **Symptom**: Sounds not playing
- **Solution**: Check expo-av configuration and permissions
- **Command**: Verify AudioManager initialization

### Performance Problems
- **Symptom**: FPS drops below 40
- **Solution**: Check particle count and animation complexity
- **Command**: Use performance adapter logs

### Save Corruption
- **Symptom**: Game state resets unexpectedly
- **Solution**: Check checksum validation and backup system
- **Command**: Inspect save data integrity

## Deliverables

### 1. Premium Audio Experience
- ✅ Dynamic sound effects with pitch variation
- ✅ Background music that adapts to game pace
- ✅ Anti-spam protection for audio events

### 2. Sophisticated Animation System
- ✅ Particle effects that scale with performance
- ✅ Screen shake for milestone moments
- ✅ Achievement toasts with satisfying timing

### 3. Robust Save System
- ✅ Triple-save strategy with corruption protection
- ✅ Version migration system for updates
- ✅ Export/import for cross-device play

### 4. Performance Optimization
- ✅ Automatic quality adjustment
- ✅ Memory usage monitoring
- ✅ Frame rate optimization

## Next Phase
Once quality and polish are complete, proceed to **Phase 5: Deployment Preparation** (`05-deployment.md`)

**Estimated Duration**: 3-4 days
**Quality & Polish Complete**: ✅/❌ (update after validation)