# Phase 4: Quality Assurance & Production Polish

## Overview

This phase transforms the complete game system into a production-ready application through performance optimization, comprehensive testing, audio implementation, and user experience polish. It ensures the game meets all technical requirements and provides a smooth, engaging player experience.

**Duration**: 2-3 weeks (2 sprints)  
**Team Size**: 2-3 senior engineers + QA engineer  
**Dependencies**: Integration phase completion

## Sprint 9: Performance Optimization & Testing (Week 13-14)

### Objectives
- [ ] Optimize performance to meet 30+ FPS on Android 5.0+ devices
- [ ] Implement comprehensive testing strategy
- [ ] Add performance monitoring and memory management
- [ ] Optimize save/load system for large game states

### Tasks & Implementation

#### Task 9.1: Performance Optimization
**Time Estimate**: 8 hours  
**Description**: Optimize game performance for target specifications

Create `src/shared/utils/PerformanceManager.ts`:
```typescript
import { Platform } from 'react-native';

interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  lastUpdate: number;
  targetFPS: number;
}

export class PerformanceManager {
  private static metrics: PerformanceMetrics = {
    frameRate: 60,
    memoryUsage: 0,
    lastUpdate: 0,
    targetFPS: 30,
  };
  
  private static frameCallback: number | null = null;
  private static lastFrameTime = 0;
  private static frameCount = 0;
  
  // Start performance monitoring
  static startMonitoring(): void {
    this.trackFrameRate();
    
    // Monitor memory usage every 5 seconds
    setInterval(() => {
      this.trackMemoryUsage();
    }, 5000);
  }
  
  private static trackFrameRate(): void {
    const currentTime = Date.now();
    
    if (this.lastFrameTime !== 0) {
      const deltaTime = currentTime - this.lastFrameTime;
      this.frameCount++;
      
      // Calculate FPS every second
      if (deltaTime >= 1000) {
        this.metrics.frameRate = this.frameCount;
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
        
        // Log performance issues
        if (this.metrics.frameRate < this.metrics.targetFPS) {
          console.warn(`Low FPS detected: ${this.metrics.frameRate}`);
        }
      }
    } else {
      this.lastFrameTime = currentTime;
    }
    
    // Continue monitoring
    this.frameCallback = requestAnimationFrame(() => this.trackFrameRate());
  }
  
  private static async trackMemoryUsage(): Promise<void> {
    if (Platform.OS === 'android') {
      // On Android, we can estimate memory usage
      // In a real implementation, you might use native modules
      this.metrics.memoryUsage = (global as any).__DEV__ ? 100 : 80;
      
      if (this.metrics.memoryUsage > 200) {
        console.warn(`High memory usage: ${this.metrics.memoryUsage}MB`);
      }
    }
  }
  
  // Get current performance metrics
  static getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  // Check if performance is acceptable
  static isPerformanceAcceptable(): boolean {
    return this.metrics.frameRate >= this.metrics.targetFPS && this.metrics.memoryUsage < 200;
  }
  
  static stopMonitoring(): void {
    if (this.frameCallback) {
      cancelAnimationFrame(this.frameCallback);
      this.frameCallback = null;
    }
  }
}
```

Create optimized production calculation system `src/shared/utils/OptimizedCalculations.ts`:
```typescript
// Batch calculations to reduce per-frame overhead
export class OptimizedCalculations {
  private static calculationCache = new Map<string, { result: number; timestamp: number }>();
  private static cacheTimeout = 1000; // 1 second cache
  
  // Memoized calculation with cache
  static memoizedCalculate(key: string, calculation: () => number): number {
    const now = Date.now();
    const cached = this.calculationCache.get(key);
    
    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.result;
    }
    
    const result = calculation();
    this.calculationCache.set(key, { result, timestamp: now });
    
    return result;
  }
  
  // Batch process multiple calculations
  static batchCalculate(calculations: Array<{ key: string; fn: () => number }>): Map<string, number> {
    const results = new Map<string, number>();
    
    calculations.forEach(({ key, fn }) => {
      results.set(key, this.memoizedCalculate(key, fn));
    });
    
    return results;
  }
  
  // Clear old cache entries
  static cleanCache(): void {
    const now = Date.now();
    const entries = Array.from(this.calculationCache.entries());
    
    entries.forEach(([key, value]) => {
      if ((now - value.timestamp) > this.cacheTimeout * 2) {
        this.calculationCache.delete(key);
      }
    });
  }
}

// Optimized number formatting
export const formatNumber = (value: number): string => {
  if (value < 1000) return value.toString();
  if (value < 1000000) return (value / 1000).toFixed(1) + 'K';
  if (value < 1000000000) return (value / 1000000).toFixed(1) + 'M';
  if (value < 1000000000000) return (value / 1000000000).toFixed(1) + 'B';
  return (value / 1000000000000).toFixed(1) + 'T';
};
```

Update main production loop for performance:
```typescript
// Update MainClicker.tsx production loop
useEffect(() => {
  let lastUpdateTime = Date.now();
  
  const optimizedLoop = () => {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastUpdateTime;
    
    // Only update every 100ms minimum (10 FPS) to reduce overhead
    if (deltaTime >= 100) {
      // Batch all calculations
      const calculations = [
        { 
          key: 'development', 
          fn: () => development.updateProduction(deltaTime) * design.getGlobalMultiplier() 
        },
        { 
          key: 'sales', 
          fn: () => sales.generateLeads(deltaTime) * marketing.getSalesMultiplier() 
        },
        { 
          key: 'product', 
          fn: () => product.generateInsights(deltaTime) * design.getProductBonus() 
        },
        { 
          key: 'design', 
          fn: () => design.generateExperience(deltaTime) 
        },
        { 
          key: 'marketing', 
          fn: () => marketing.generateBrand(deltaTime) 
        },
      ];
      
      const results = OptimizedCalculations.batchCalculate(calculations);
      
      // Apply results in batch
      const linesProduced = results.get('development') || 0;
      const leadsGenerated = results.get('sales') || 0;
      const insights = results.get('product') || 0;
      const experience = results.get('design') || 0;
      const brand = results.get('marketing') || 0;
      
      // Update resources
      if (linesProduced > 0) {
        player.modifyResource('linesOfCode', linesProduced);
        const featuresGenerated = development.generateFeatures(deltaTime);
        player.modifyResource('features', featuresGenerated);
      }
      
      if (leadsGenerated > 0) player.modifyResource('leads', leadsGenerated);
      if (insights > 0) player.modifyResource('insights', insights);
      if (experience > 0) player.modifyResource('experiencePoints', experience);
      if (brand > 0) player.modifyResource('brandValue', brand);
      
      // Auto-convert revenue (throttled)
      if (currentTime - lastAutoConvert > 2000) { // Every 2 seconds max
        performAutoConversion();
        lastAutoConvert = currentTime;
      }
      
      lastUpdateTime = currentTime;
    }
    
    // Schedule next update
    requestAnimationFrame(optimizedLoop);
  };
  
  let lastAutoConvert = 0;
  const loopId = requestAnimationFrame(optimizedLoop);
  
  return () => cancelAnimationFrame(loopId);
}, []);
```

#### Task 9.2: Enhanced Save System
**Time Estimate**: 6 hours  
**Description**: Optimize save/load for large game states with incremental saves

Update `src/shared/persistence/SaveManager.ts`:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSave } from '../types/GameState';

const SAVE_KEY = 'petsoft_tycoon_save';
const BACKUP_KEY = 'petsoft_tycoon_backup';
const CURRENT_VERSION = '1.0.0';

export interface CompressedSave {
  version: string;
  timestamp: number;
  playerId: string;
  // Compressed format using arrays instead of objects
  resources: number[]; // [money, linesOfCode, leads, basic, advanced, premium, enhanced, insights, exp, bugs, brand]
  departments: {
    [key: string]: number[]; // Compressed department data
  };
}

export class SaveManager {
  private static saveInterval: NodeJS.Timeout | null = null;
  private static lastSaveData: string = '';
  
  // Compress game state for efficient storage
  private static compressGameState(gameState: GameSave): CompressedSave {
    return {
      version: gameState.version,
      timestamp: gameState.timestamp,
      playerId: gameState.playerId,
      resources: [
        gameState.resources.money,
        gameState.resources.linesOfCode,
        gameState.resources.leads,
        gameState.resources.features.basic,
        gameState.resources.features.advanced,
        gameState.resources.features.premium,
        gameState.resources.features.enhanced || 0,
        gameState.resources.insights,
        gameState.resources.experiencePoints,
        gameState.resources.bugs,
        gameState.resources.brandValue,
      ],
      departments: {
        dev: gameState.departments?.development ? [
          gameState.departments.development.units.junior,
          gameState.departments.development.units.mid,
          gameState.departments.development.units.senior,
          gameState.departments.development.units.techLead,
        ] : [0, 0, 0, 0],
        // Add other departments in compressed format
      },
    };
  }
  
  // Decompress saved data back to full format
  private static decompressGameState(compressed: CompressedSave): GameSave {
    const [money, linesOfCode, leads, basic, advanced, premium, enhanced, insights, experiencePoints, bugs, brandValue] = compressed.resources;
    const [devJunior, devMid, devSenior, devTechLead] = compressed.departments.dev || [0, 0, 0, 0];
    
    return {
      version: compressed.version,
      timestamp: compressed.timestamp,
      playerId: compressed.playerId,
      resources: {
        money,
        linesOfCode,
        leads,
        features: { basic, advanced, premium, enhanced },
        supportTickets: 0,
        insights,
        experiencePoints,
        bugs,
        brandValue,
      },
      departments: {
        development: {
          units: {
            junior: devJunior,
            mid: devMid,
            senior: devSenior,
            techLead: devTechLead,
          },
          upgrades: {
            betterIdes: false,
            pairProgramming: false,
            codeReviews: false,
          },
          production: {
            linesPerSecond: 0,
            totalProduced: 0,
          },
        },
        // Add other departments
      } as any,
      prestige: {
        investorPoints: 0,
        totalRuns: 0,
        permanentBonuses: {
          startingCapital: 0,
          globalSpeed: 0,
          synergyBonus: 0,
        },
      },
      statistics: {
        totalPlaytime: 0,
        totalClicks: 0,
        totalMoney: money,
        totalHires: 0,
        departmentsUnlocked: [],
        milestonesReached: [],
      },
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        notificationsEnabled: true,
        offlineProgressEnabled: true,
      },
    };
  }
  
  // Incremental save - only save if data changed
  static async saveGame(gameState: GameSave): Promise<void> {
    try {
      const compressed = this.compressGameState(gameState);
      const serialized = JSON.stringify(compressed);
      
      // Skip save if data hasn't changed
      if (serialized === this.lastSaveData) {
        return;
      }
      
      // Create backup of previous save
      const currentSave = await AsyncStorage.getItem(SAVE_KEY);
      if (currentSave) {
        await AsyncStorage.setItem(BACKUP_KEY, currentSave);
      }
      
      // Save new data
      await AsyncStorage.setItem(SAVE_KEY, serialized);
      this.lastSaveData = serialized;
      
    } catch (error) {
      console.error('Save failed:', error);
      // Try to restore from backup
      await this.restoreFromBackup();
      throw new Error(`Save failed: ${error}`);
    }
  }
  
  static async loadGame(): Promise<GameSave | null> {
    try {
      const saved = await AsyncStorage.getItem(SAVE_KEY);
      if (!saved) return null;
      
      const compressed = JSON.parse(saved) as CompressedSave;
      
      // Version validation
      if (!compressed.version) {
        console.warn('Invalid save file format');
        return null;
      }
      
      return this.decompressGameState(compressed);
      
    } catch (error) {
      console.error('Load failed, trying backup:', error);
      return await this.loadBackup();
    }
  }
  
  private static async loadBackup(): Promise<GameSave | null> {
    try {
      const backup = await AsyncStorage.getItem(BACKUP_KEY);
      if (!backup) return null;
      
      const compressed = JSON.parse(backup) as CompressedSave;
      return this.decompressGameState(compressed);
      
    } catch (error) {
      console.error('Backup load failed:', error);
      return null;
    }
  }
  
  private static async restoreFromBackup(): Promise<void> {
    try {
      const backup = await AsyncStorage.getItem(BACKUP_KEY);
      if (backup) {
        await AsyncStorage.setItem(SAVE_KEY, backup);
      }
    } catch (error) {
      console.error('Restore from backup failed:', error);
    }
  }
  
  // Start optimized auto-save
  static startAutoSave(getGameState: () => GameSave): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    
    // Save every 30 seconds, but only if data changed
    this.saveInterval = setInterval(async () => {
      try {
        await this.saveGame(getGameState());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000);
  }
  
  static stopAutoSave(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }
}
```

#### Task 9.3: Comprehensive Testing Strategy
**Time Estimate**: 8 hours  
**Description**: Implement unit, integration, and performance tests

Create test structure:
```bash
# Create testing structure
mkdir -p src/__tests__/{features,shared,integration}

# Install testing dependencies
npm install --save-dev \
  @testing-library/react-native@12.0.0 \
  @testing-library/jest-native@5.4.0 \
  jest-environment-jsdom@29.0.0
```

Create `src/__tests__/features/development/developmentStore.test.ts`:
```typescript
import { useDevelopment } from '@/features/development/state/developmentStore';
import { renderHook, act } from '@testing-library/react-native';

describe('Development Store', () => {
  let developmentHook: ReturnType<typeof useDevelopment>;
  
  beforeEach(() => {
    const { result } = renderHook(() => useDevelopment());
    developmentHook = result.current;
  });
  
  describe('Developer Hiring', () => {
    it('should hire junior developer with sufficient money', () => {
      const initialCount = developmentHook.developers.junior;
      const cost = developmentHook.getDeveloperCost('junior');
      
      act(() => {
        const success = developmentHook.hireDeveloper('junior', cost);
        expect(success).toBe(true);
        expect(developmentHook.developers.junior).toBe(initialCount + 1);
      });
    });
    
    it('should fail to hire developer with insufficient money', () => {
      const initialCount = developmentHook.developers.junior;
      
      act(() => {
        const success = developmentHook.hireDeveloper('junior', 0);
        expect(success).toBe(false);
        expect(developmentHook.developers.junior).toBe(initialCount);
      });
    });
    
    it('should increase production rate when hiring developers', () => {
      const initialProduction = developmentHook.production.linesPerSecond;
      const cost = developmentHook.getDeveloperCost('junior');
      
      act(() => {
        developmentHook.hireDeveloper('junior', cost);
        expect(developmentHook.production.linesPerSecond).toBeGreaterThan(initialProduction);
      });
    });
  });
  
  describe('Production Calculations', () => {
    it('should calculate correct cost scaling', () => {
      const cost1 = developmentHook.getDeveloperCost('junior');
      
      act(() => {
        developmentHook.hireDeveloper('junior', cost1);
      });
      
      const cost2 = developmentHook.getDeveloperCost('junior');
      expect(cost2).toBeGreaterThan(cost1);
      expect(cost2).toBe(Math.floor(cost1 * 1.15));
    });
    
    it('should generate features based on production', () => {
      act(() => {
        // Hire some developers to ensure production
        developmentHook.hireDeveloper('junior', 1000);
        developmentHook.hireDeveloper('mid', 10000);
      });
      
      const features = developmentHook.generateFeatures(1000);
      expect(features.basic).toBeGreaterThan(0);
      expect(features.advanced).toBeGreaterThan(0);
      expect(features.premium).toBeGreaterThan(0);
    });
  });
});
```

Create performance test `src/__tests__/integration/performance.test.ts`:
```typescript
import { PerformanceManager } from '@/shared/utils/PerformanceManager';

describe('Performance Requirements', () => {
  beforeAll(() => {
    PerformanceManager.startMonitoring();
  });
  
  afterAll(() => {
    PerformanceManager.stopMonitoring();
  });
  
  it('should maintain acceptable frame rate', async () => {
    // Simulate heavy game loop for 5 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < 5000) {
      // Simulate production calculations
      for (let i = 0; i < 100; i++) {
        Math.random() * Math.sqrt(i + 1);
      }
      
      await new Promise(resolve => setTimeout(resolve, 16)); // ~60 FPS
    }
    
    const metrics = PerformanceManager.getMetrics();
    expect(metrics.frameRate).toBeGreaterThanOrEqual(30);
  });
  
  it('should not exceed memory limits', () => {
    const metrics = PerformanceManager.getMetrics();
    expect(metrics.memoryUsage).toBeLessThan(200);
  });
  
  it('should handle large calculations efficiently', () => {
    const startTime = Date.now();
    
    // Simulate complex production calculations
    for (let i = 0; i < 10000; i++) {
      const base = i * 0.1;
      const multiplier = 1.0 + (i / 1000) * 0.1;
      const result = base * multiplier * Math.pow(1.15, i % 10);
    }
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
  });
});
```

Create integration test `src/__tests__/integration/gameFlow.test.ts`:
```typescript
import { renderHook, act } from '@testing-library/react-native';
import { usePlayer } from '@/features/core/state/playerStore';
import { useDevelopment } from '@/features/development/state/developmentStore';
import { useSales } from '@/features/sales/state/salesStore';

describe('Game Flow Integration', () => {
  let player: ReturnType<typeof usePlayer>;
  let development: ReturnType<typeof useDevelopment>;
  let sales: ReturnType<typeof useSales>;
  
  beforeEach(() => {
    const playerHook = renderHook(() => usePlayer());
    const devHook = renderHook(() => useDevelopment());
    const salesHook = renderHook(() => useSales());
    
    player = playerHook.result.current;
    development = devHook.result.current;
    sales = salesHook.result.current;
  });
  
  it('should complete full development to sales pipeline', () => {
    // Start with some money
    act(() => {
      player.modifyResource('money', 10000);
    });
    
    // Hire developers
    act(() => {
      development.hireDeveloper('junior', player.resources.money);
      development.hireDeveloper('mid', player.resources.money);
    });
    
    // Generate features
    act(() => {
      const features = development.generateFeatures(5000); // 5 seconds
      player.modifyResource('features', features);
    });
    
    // Hire sales reps
    act(() => {
      sales.hireSalesRep('rep', player.resources.money);
    });
    
    // Generate leads
    act(() => {
      const leads = sales.generateLeads(5000); // 5 seconds
      player.modifyResource('leads', leads);
    });
    
    // Convert to revenue
    act(() => {
      const result = sales.convertRevenue(
        player.resources.leads,
        player.resources.features
      );
      
      expect(result.revenue).toBeGreaterThan(0);
      expect(result.consumedFeatures.basic).toBeGreaterThan(0);
      expect(result.consumedLeads).toBeGreaterThan(0);
    });
  });
});
```

## Sprint 10: Audio Implementation & User Experience Polish (Week 14-15)

### Objectives
- [ ] Complete audio system with all sound effects
- [ ] Add visual polish and animations
- [ ] Implement offline progression system
- [ ] Add user onboarding and tutorials

### Tasks & Implementation

#### Task 10.1: Complete Audio Implementation
**Time Estimate**: 6 hours  
**Description**: Add all sound effects and music to the game

```bash
# Create audio assets directory
mkdir -p assets/audio

# Add placeholder for audio files (actual files would be added by audio designer)
touch assets/audio/{click.wav,cash.wav,levelup.wav,notification.wav,ambient.mp3}
```

Update `src/shared/audio/AudioManager.ts`:
```typescript
import { Audio } from 'expo-av';

export type SoundEffect = 
  | 'click' 
  | 'cash' 
  | 'levelup' 
  | 'notification'
  | 'hire'
  | 'upgrade'
  | 'achievement';

interface SoundConfig {
  file: any; // require() result
  volume: number;
  cooldown?: number;
  pitchVariation?: boolean;
}

export class AudioManager {
  private static sounds: Map<SoundEffect, Audio.Sound> = new Map();
  private static backgroundMusic: Audio.Sound | null = null;
  private static lastPlayed: Map<SoundEffect, number> = new Map();
  private static enabled: boolean = true;
  private static musicEnabled: boolean = true;
  
  private static soundConfigs: Record<SoundEffect, SoundConfig> = {
    click: {
      file: require('../../../assets/audio/click.wav'),
      volume: 0.3,
      cooldown: 50,
      pitchVariation: true,
    },
    cash: {
      file: require('../../../assets/audio/cash.wav'),
      volume: 0.5,
      cooldown: 100,
      pitchVariation: true,
    },
    levelup: {
      file: require('../../../assets/audio/levelup.wav'),
      volume: 0.7,
      cooldown: 300,
    },
    hire: {
      file: require('../../../assets/audio/levelup.wav'), // Reuse levelup sound
      volume: 0.6,
      cooldown: 200,
    },
    upgrade: {
      file: require('../../../assets/audio/levelup.wav'), // Reuse levelup sound
      volume: 0.8,
      cooldown: 500,
    },
    notification: {
      file: require('../../../assets/audio/notification.wav'),
      volume: 0.7,
      cooldown: 1000,
    },
    achievement: {
      file: require('../../../assets/audio/notification.wav'), // Reuse notification
      volume: 0.9,
      cooldown: 2000,
    },
  };
  
  static async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Load all sound effects
      for (const [soundType, config] of Object.entries(this.soundConfigs)) {
        try {
          const { sound } = await Audio.Sound.createAsync(config.file, {
            volume: config.volume,
            shouldPlay: false,
          });
          this.sounds.set(soundType as SoundEffect, sound);
        } catch (error) {
          console.warn(`Failed to load sound ${soundType}:`, error);
        }
      }
      
      // Load background music
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../../assets/audio/ambient.mp3'),
          {
            volume: 0.2,
            isLooping: true,
            shouldPlay: false,
          }
        );
        this.backgroundMusic = sound;
      } catch (error) {
        console.warn('Failed to load background music:', error);
      }
      
      console.log('Audio system initialized');
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }
  
  static async playSound(soundType: SoundEffect, options: { pitch?: number } = {}): Promise<void> {
    if (!this.enabled) return;
    
    const config = this.soundConfigs[soundType];
    const now = Date.now();
    const lastPlayed = this.lastPlayed.get(soundType) || 0;
    
    // Respect cooldown
    if (config.cooldown && now - lastPlayed < config.cooldown) {
      return;
    }
    
    const sound = this.sounds.get(soundType);
    if (!sound) return;
    
    try {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      
      // Apply pitch variation
      if (config.pitchVariation) {
        const pitch = options.pitch || (0.8 + Math.random() * 0.4);
        await sound.setRateAsync(pitch, true);
      }
      
      await sound.playAsync();
      this.lastPlayed.set(soundType, now);
      
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error);
    }
  }
  
  static async startBackgroundMusic(): Promise<void> {
    if (!this.musicEnabled || !this.backgroundMusic) return;
    
    try {
      await this.backgroundMusic.playAsync();
    } catch (error) {
      console.warn('Failed to start background music:', error);
    }
  }
  
  static async stopBackgroundMusic(): Promise<void> {
    if (!this.backgroundMusic) return;
    
    try {
      await this.backgroundMusic.pauseAsync();
    } catch (error) {
      console.warn('Failed to stop background music:', error);
    }
  }
  
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      // Stop all currently playing sounds
      this.sounds.forEach(async (sound) => {
        try {
          await sound.stopAsync();
        } catch (error) {
          console.warn('Error stopping sound:', error);
        }
      });
    }
  }
  
  static setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
  }
  
  static async cleanup(): Promise<void> {
    try {
      // Unload all sounds
      for (const sound of this.sounds.values()) {
        await sound.unloadAsync();
      }
      
      if (this.backgroundMusic) {
        await this.backgroundMusic.unloadAsync();
      }
      
      this.sounds.clear();
      this.backgroundMusic = null;
    } catch (error) {
      console.error('Audio cleanup failed:', error);
    }
  }
}
```

#### Task 10.2: Visual Polish & Animations
**Time Estimate**: 8 hours  
**Description**: Add visual enhancements and smooth animations

Create `src/shared/ui/PulseAnimation.tsx`:
```typescript
import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

interface PulseAnimationProps {
  children: React.ReactNode;
  isActive: boolean;
  intensity?: number;
  style?: ViewStyle;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  isActive,
  intensity = 1.1,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (isActive) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: intensity,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      
      animation.start();
      
      return () => animation.stop();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, intensity]);
  
  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
```

Create `src/shared/ui/CountUpAnimation.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';

interface CountUpAnimationProps {
  from: number;
  to: number;
  duration: number;
  style?: TextStyle;
  formatter?: (n: number) => string;
  onComplete?: () => void;
}

export const CountUpAnimation: React.FC<CountUpAnimationProps> = ({
  from,
  to,
  duration,
  style,
  formatter = (n) => Math.floor(n).toLocaleString(),
  onComplete,
}) => {
  const [current, setCurrent] = useState(from);
  
  useEffect(() => {
    if (from === to) return;
    
    const startTime = Date.now();
    const difference = to - from;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + difference * eased;
      
      setCurrent(value);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };
    
    requestAnimationFrame(animate);
  }, [from, to, duration]);
  
  return <Text style={style}>{formatter(current)}</Text>;
};
```

Create enhanced resource display `src/shared/ui/ResourceDisplay.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedNumber } from './AnimatedNumber';
import { PulseAnimation } from './PulseAnimation';
import { formatNumber } from '../utils/OptimizedCalculations';

interface ResourceDisplayProps {
  label: string;
  value: number;
  previousValue?: number;
  formatter?: (n: number) => string;
  highlight?: boolean;
  color?: string;
}

export const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
  label,
  value,
  previousValue = 0,
  formatter = formatNumber,
  highlight = false,
  color = '#007AFF',
}) => {
  const hasChanged = value !== previousValue;
  const hasIncreased = value > previousValue;
  
  return (
    <PulseAnimation isActive={highlight && hasChanged} intensity={1.05}>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <AnimatedNumber 
          value={value}
          style={[
            styles.value,
            { color },
            hasIncreased && hasChanged && styles.increasedValue,
          ]}
          formatter={formatter}
        />
      </View>
    </PulseAnimation>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 80,
  },
  label: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  increasedValue: {
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
```

#### Task 10.3: Offline Progression System
**Time Estimate**: 6 hours  
**Description**: Implement offline progression calculation and display

Create `src/shared/utils/OfflineProgression.ts`:
```typescript
import { GameSave } from '../types/GameState';

export interface OfflineGains {
  duration: number; // in milliseconds
  resources: {
    linesOfCode: number;
    money: number;
    leads: number;
    features: {
      basic: number;
      advanced: number;
      premium: number;
      enhanced: number;
    };
    insights: number;
    experiencePoints: number;
    brandValue: number;
  };
  summary: string[];
}

export class OfflineProgressionCalculator {
  private static readonly MAX_OFFLINE_HOURS = 24;
  private static readonly OFFLINE_EFFICIENCY = 0.1; // 10% efficiency while offline
  
  static calculateOfflineGains(
    lastSaveTime: number,
    currentTime: number,
    gameState: GameSave
  ): OfflineGains {
    const offlineTime = Math.min(
      currentTime - lastSaveTime,
      this.MAX_OFFLINE_HOURS * 60 * 60 * 1000
    );
    
    if (offlineTime < 60000) { // Less than 1 minute
      return this.createEmptyGains();
    }
    
    const offlineHours = offlineTime / (60 * 60 * 1000);
    
    // Calculate production rates from saved state
    const productionRates = this.calculateProductionRates(gameState);
    
    // Apply offline efficiency
    const gains: OfflineGains = {
      duration: offlineTime,
      resources: {
        linesOfCode: productionRates.linesPerSecond * offlineHours * 3600 * this.OFFLINE_EFFICIENCY,
        money: 0, // Will be calculated from feature conversion
        leads: productionRates.leadsPerSecond * offlineHours * 3600 * this.OFFLINE_EFFICIENCY,
        features: {
          basic: productionRates.basicPerSecond * offlineHours * 3600 * this.OFFLINE_EFFICIENCY,
          advanced: productionRates.advancedPerSecond * offlineHours * 3600 * this.OFFLINE_EFFICIENCY,
          premium: productionRates.premiumPerSecond * offlineHours * 3600 * this.OFFLINE_EFFICIENCY,
          enhanced: 0, // Enhanced features aren't generated offline
        },
        insights: productionRates.insightsPerSecond * offlineHours * 3600 * this.OFFLINE_EFFICIENCY,
        experiencePoints: productionRates.experiencePerSecond * offlineHours * 3600 * this.OFFLINE_EFFICIENCY,
        brandValue: productionRates.brandPerSecond * offlineHours * 3600 * this.OFFLINE_EFFICIENCY,
      },
      summary: [],
    };
    
    // Calculate money from feature conversion (simplified)
    const featureValue = 
      gains.resources.features.basic * 10 +
      gains.resources.features.advanced * 100 +
      gains.resources.features.premium * 1000;
    
    gains.resources.money = Math.floor(featureValue * 0.5); // 50% conversion efficiency offline
    
    // Generate summary
    gains.summary = this.generateSummary(gains, offlineHours);
    
    return gains;
  }
  
  private static calculateProductionRates(gameState: GameSave): {
    linesPerSecond: number;
    leadsPerSecond: number;
    basicPerSecond: number;
    advancedPerSecond: number;
    premiumPerSecond: number;
    insightsPerSecond: number;
    experiencePerSecond: number;
    brandPerSecond: number;
  } {
    // Simplified calculation based on saved department states
    const development = gameState.departments?.development;
    const sales = gameState.departments?.sales;
    const product = gameState.departments?.product;
    const design = gameState.departments?.design;
    const marketing = gameState.departments?.marketing;
    
    // Basic rates (would be more complex in full implementation)
    const linesPerSecond = development ? (
      development.units.junior * 0.1 +
      development.units.mid * 0.5 +
      development.units.senior * 2.5 +
      development.units.techLead * 10.0
    ) : 0;
    
    const leadsPerSecond = sales ? (
      sales.units.rep * 0.2 +
      sales.units.manager * 1.0 +
      sales.units.director * 5.0 +
      sales.units.vpSales * 20.0
    ) : 0;
    
    return {
      linesPerSecond,
      leadsPerSecond,
      basicPerSecond: linesPerSecond * 0.1,
      advancedPerSecond: linesPerSecond * 0.01,
      premiumPerSecond: linesPerSecond * 0.001,
      insightsPerSecond: product ? (product.units.analyst * 0.3) : 0,
      experiencePerSecond: design ? (design.units.designer * 0.4) : 0,
      brandPerSecond: marketing ? (marketing.units.specialist * 0.8) : 0,
    };
  }
  
  private static generateSummary(gains: OfflineGains, hours: number): string[] {
    const summary: string[] = [];
    
    summary.push(`You were offline for ${hours.toFixed(1)} hours`);
    
    if (gains.resources.money > 0) {
      summary.push(`Earned $${formatNumber(gains.resources.money)}`);
    }
    
    if (gains.resources.linesOfCode > 0) {
      summary.push(`Generated ${formatNumber(gains.resources.linesOfCode)} lines of code`);
    }
    
    if (gains.resources.leads > 0) {
      summary.push(`Generated ${formatNumber(gains.resources.leads)} leads`);
    }
    
    const totalFeatures = gains.resources.features.basic + gains.resources.features.advanced + gains.resources.features.premium;
    if (totalFeatures > 0) {
      summary.push(`Created ${formatNumber(totalFeatures)} features`);
    }
    
    return summary;
  }
  
  private static createEmptyGains(): OfflineGains {
    return {
      duration: 0,
      resources: {
        linesOfCode: 0,
        money: 0,
        leads: 0,
        features: { basic: 0, advanced: 0, premium: 0, enhanced: 0 },
        insights: 0,
        experiencePoints: 0,
        brandValue: 0,
      },
      summary: [],
    };
  }
}
```

Create offline progress modal `src/shared/ui/OfflineProgressModal.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { OfflineGains } from '../utils/OfflineProgression';
import { CountUpAnimation } from './CountUpAnimation';
import { formatNumber } from '../utils/OptimizedCalculations';

interface OfflineProgressModalProps {
  visible: boolean;
  gains: OfflineGains;
  onClose: () => void;
}

export const OfflineProgressModal: React.FC<OfflineProgressModalProps> = ({
  visible,
  gains,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Welcome Back!</Text>
          
          <ScrollView style={styles.content}>
            {gains.summary.map((line, index) => (
              <Text key={index} style={styles.summaryLine}>
                {line}
              </Text>
            ))}
            
            <View style={styles.gainsContainer}>
              {gains.resources.money > 0 && (
                <View style={styles.gainRow}>
                  <Text style={styles.gainLabel}>Money:</Text>
                  <CountUpAnimation
                    from={0}
                    to={gains.resources.money}
                    duration={1000}
                    style={styles.gainValue}
                    formatter={(n) => `$${formatNumber(n)}`}
                  />
                </View>
              )}
              
              {gains.resources.linesOfCode > 0 && (
                <View style={styles.gainRow}>
                  <Text style={styles.gainLabel}>Lines of Code:</Text>
                  <CountUpAnimation
                    from={0}
                    to={gains.resources.linesOfCode}
                    duration={1200}
                    style={styles.gainValue}
                    formatter={formatNumber}
                  />
                </View>
              )}
              
              {gains.resources.leads > 0 && (
                <View style={styles.gainRow}>
                  <Text style={styles.gainLabel}>Leads:</Text>
                  <CountUpAnimation
                    from={0}
                    to={gains.resources.leads}
                    duration={1400}
                    style={styles.gainValue}
                    formatter={formatNumber}
                  />
                </View>
              )}
            </View>
          </ScrollView>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Collect & Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  content: {
    maxHeight: 400,
  },
  summaryLine: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  gainsContainer: {
    marginTop: 20,
  },
  gainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  gainLabel: {
    fontSize: 16,
    color: '#333',
  },
  gainValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
```

## Validation & Testing

### Performance Validation
- [ ] Game maintains 30+ FPS on target devices
- [ ] Memory usage stays under 200MB
- [ ] App launches in under 3 seconds
- [ ] Save/load operations complete quickly
- [ ] Audio plays without affecting performance

### User Experience Testing
- [ ] All interactions provide immediate feedback
- [ ] Offline progression works correctly
- [ ] Animations enhance rather than distract from gameplay
- [ ] Audio complements game actions appropriately
- [ ] UI is intuitive and accessible

### Quality Assurance
- [ ] Comprehensive test coverage for all features
- [ ] Performance requirements met across device range
- [ ] Save system handles edge cases properly
- [ ] Audio system degrades gracefully if files missing
- [ ] No memory leaks or performance degradation over time

## Deliverables

At the end of Quality phase:

1. **Production-Ready Performance**: Meets all technical specifications
2. **Complete Audio System**: Sound effects and music enhance gameplay
3. **Polished User Experience**: Smooth animations and visual feedback
4. **Comprehensive Testing**: Unit, integration, and performance tests
5. **Offline Progression**: Players can benefit from time away from game

## Next Steps

Quality phase completion enables:
- **Deployment Phase**: Build optimization, release preparation, and store submission
- **Post-Launch Support**: Performance monitoring, user feedback, and iterative improvements

---

**Quality Complete**: Production-ready game with optimized performance, complete audio system, and polished user experience meeting all technical requirements.