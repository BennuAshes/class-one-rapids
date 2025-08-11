# Phase 4: Quality & Polish

**Duration**: 5-7 days  
**Status**: Not Started  
**Prerequisites**: Phase 3 (Integration) completed

## Objectives

1. Implement comprehensive animation system with React Native Reanimated 3
2. Integrate audio system with sound effects and background music
3. Optimize performance for sustained 60 FPS on target devices
4. Add visual polish with particle effects and micro-interactions
5. Implement responsive design for different screen sizes
6. Add offline progress calculation and notification system
7. Comprehensive cross-platform testing and bug fixes

## Tasks Overview

### Day 1-2: Animation Polish
- [ ] Implement production animations and visual feedback
- [ ] Add particle effects for achievements and milestones
- [ ] Create smooth transitions between game states
- [ ] Add micro-interactions for enhanced user experience

### Day 3: Audio Integration
- [ ] Implement audio system with Expo AV
- [ ] Add sound effects for all user interactions
- [ ] Integrate background music with loop capability
- [ ] Create audio settings and volume controls

### Day 4-5: Performance Optimization
- [ ] Optimize game loop for consistent 60 FPS
- [ ] Implement virtualization for large department lists
- [ ] Add memory management and cleanup systems
- [ ] Optimize BigNumber operations for performance

### Day 6: Responsive Design & Cross-Platform
- [ ] Implement responsive design for different screen sizes
- [ ] Add platform-specific optimizations (iOS/Android/Web)
- [ ] Test and fix cross-platform compatibility issues
- [ ] Implement platform-specific features (haptics, etc.)

### Day 7: Final Polish & Testing
- [ ] Add offline progress calculation system
- [ ] Implement push notifications for offline earnings
- [ ] Final bug fixes and edge case handling
- [ ] Comprehensive testing across all features

## Detailed Implementation

### Step 1: Advanced Animation System

#### 1.1 Create Money Animation Component
**File**: `src/shared/components/AnimatedMoney.tsx`

```typescript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { BigNumber } from '../utils/BigNumber';

interface AnimatedMoneyProps {
  amount: BigNumber;
  change?: BigNumber;
  size?: 'small' | 'medium' | 'large';
  showChange?: boolean;
}

export function AnimatedMoney({ 
  amount, 
  change, 
  size = 'medium',
  showChange = false 
}: AnimatedMoneyProps) {
  const scale = useSharedValue(1);
  const changeOpacity = useSharedValue(0);
  const changeY = useSharedValue(0);
  
  useEffect(() => {
    if (change && showChange && change.greaterThan(new BigNumber(0))) {
      // Animate main money scale
      scale.value = withSequence(
        withSpring(1.05, { duration: 200 }),
        withSpring(1, { duration: 200 })
      );
      
      // Animate change indicator
      changeOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 500 })
      );
      
      changeY.value = withSequence(
        withTiming(0, { duration: 200 }),
        withTiming(-30, { duration: 1500 })
      );
    }
  }, [change?.toString()]);
  
  const mainStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const changeStyle = useAnimatedStyle(() => ({
    opacity: changeOpacity.value,
    transform: [{ translateY: changeY.value }],
  }));
  
  return (
    <View style={styles.container}>
      <Animated.Text style={[
        styles.amount,
        styles[size],
        mainStyle
      ]}>
        ${amount.toString()}
      </Animated.Text>
      
      {change && showChange && (
        <Animated.View style={[styles.changeContainer, changeStyle]}>
          <Text style={[styles.changeText, styles[`${size}Change`]]}>
            +${change.toString()}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  amount: {
    fontWeight: '700',
    color: '#1D1D1F',
  },
  small: {
    fontSize: 16,
  },
  medium: {
    fontSize: 24,
  },
  large: {
    fontSize: 32,
  },
  changeContainer: {
    position: 'absolute',
    top: 0,
  },
  changeText: {
    fontWeight: '600',
    color: '#34C759',
  },
  smallChange: {
    fontSize: 12,
  },
  mediumChange: {
    fontSize: 16,
  },
  largeChange: {
    fontSize: 20,
  },
});
```

#### 1.2 Create Particle System for Celebrations
**File**: `src/shared/components/ParticleSystem.tsx`

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: string;
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  rotation: Animated.SharedValue<number>;
  emoji: string;
}

interface ParticleSystemProps {
  trigger: boolean;
  particleCount?: number;
  duration?: number;
  emojis?: string[];
}

function ParticleComponent({ particle }: { particle: Particle }) {
  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: particle.x.value,
    top: particle.y.value,
    transform: [
      { scale: particle.scale.value },
      { rotate: `${particle.rotation.value}deg` }
    ],
    opacity: particle.opacity.value,
  }));
  
  return (
    <Animated.Text style={[styles.particle, animatedStyle]}>
      {particle.emoji}
    </Animated.Text>
  );
}

export function ParticleSystem({ 
  trigger, 
  particleCount = 15,
  duration = 2000,
  emojis = ['💰', '💵', '💸', '✨', '🎉', '🚀']
}: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const createParticle = (): Particle => ({
    id: Math.random().toString(),
    x: useSharedValue(Math.random() * width),
    y: useSharedValue(height),
    scale: useSharedValue(0),
    opacity: useSharedValue(1),
    rotation: useSharedValue(0),
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
  });
  
  const animateParticles = (particleList: Particle[]) => {
    particleList.forEach((particle, index) => {
      const delay = index * 50;
      
      // Scale animation
      particle.scale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 300 }, () => {
          particle.scale.value = withTiming(0, { duration: 300 });
        })
      );
      
      // Position animation
      particle.y.value = withTiming(
        -100, 
        { duration: duration + delay }
      );
      
      particle.x.value = withTiming(
        particle.x.value + (Math.random() - 0.5) * 200,
        { duration: duration + delay }
      );
      
      // Rotation animation
      particle.rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
      
      // Opacity animation
      particle.opacity.value = withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: duration - 500 + delay })
      );
    });
    
    // Clean up particles after animation
    setTimeout(() => {
      setParticles([]);
    }, duration + 1000);
  };
  
  useEffect(() => {
    if (trigger) {
      const newParticles = Array(particleCount)
        .fill(null)
        .map(() => createParticle());
      
      setParticles(newParticles);
      animateParticles(newParticles);
    }
  }, [trigger]);
  
  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(particle => (
        <ParticleComponent key={particle.id} particle={particle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  particle: {
    fontSize: 24,
    textAlign: 'center',
  },
});
```

#### 1.3 Create Production Animation Component
**File**: `src/features/departments/components/ProductionAnimation.tsx`

```typescript
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { BigNumber } from '../../../shared/utils/BigNumber';

interface ProductionAnimationProps {
  isProducing: boolean;
  rate: BigNumber;
  color?: string;
}

export function ProductionAnimation({ 
  isProducing, 
  rate,
  color = '#34C759'
}: ProductionAnimationProps) {
  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);
  const opacity = useSharedValue(0.3);
  
  useEffect(() => {
    if (isProducing && rate.greaterThan(new BigNumber(0))) {
      // Progress bar animation
      progress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0, { duration: 100 })
        ),
        -1,
        false
      );
      
      // Pulse effect
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
      
      // Fade in
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      progress.value = withTiming(0, { duration: 200 });
      pulse.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(0.3, { duration: 300 });
    }
  }, [isProducing, rate.toString()]);
  
  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
    backgroundColor: color,
  }));
  
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: pulse.value }],
  }));
  
  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>
      
      {/* Animated dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <AnimatedDot 
            key={index} 
            delay={index * 200} 
            isActive={isProducing}
            color={color}
          />
        ))}
      </View>
    </Animated.View>
  );
}

function AnimatedDot({ delay, isActive, color }: {
  delay: number;
  isActive: boolean;
  color: string;
}) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0.3);
  
  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.5, { duration: 300 })
        ),
        -1,
        true
      );
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withTiming(0.5, { duration: 200 });
      opacity.value = withTiming(0.3, { duration: 200 });
    }
  }, [isActive]);
  
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    backgroundColor: color,
  }));
  
  return (
    <Animated.View style={[styles.dot, dotStyle]} />
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
```

### Step 2: Audio System Implementation

#### 2.1 Create Audio Manager
**File**: `src/core/audio/AudioManager.ts`

```typescript
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface SoundEffect {
  name: string;
  sound: Audio.Sound;
  volume: number;
}

export class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, Audio.Sound> = new Map();
  private music: Audio.Sound | null = null;
  private soundEnabled = true;
  private musicEnabled = true;
  private musicVolume = 0.3;
  private sfxVolume = 0.7;
  
  private readonly soundAssets = {
    click: require('../../assets/audio/click.mp3'),
    purchase: require('../../assets/audio/purchase.mp3'),
    achievement: require('../../assets/audio/achievement.mp3'),
    prestige: require('../../assets/audio/prestige.mp3'),
    department_unlock: require('../../assets/audio/department_unlock.mp3'),
    money_earned: require('../../assets/audio/money_earned.mp3'),
    background: require('../../assets/audio/background.mp3'),
  };
  
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }
  
  async initialize(): Promise<void> {
    try {
      // Set audio mode for mobile
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
          playThroughEarpieceAndroid: false,
        });
      }
      
      // Load all sound effects
      for (const [name, asset] of Object.entries(this.soundAssets)) {
        try {
          const { sound } = await Audio.Sound.createAsync(asset, {
            shouldPlay: false,
            volume: name === 'background' ? this.musicVolume : this.sfxVolume,
          });
          
          this.sounds.set(name, sound);
          
          if (name === 'background') {
            this.music = sound;
            await sound.setIsLoopingAsync(true);
          }
        } catch (error) {
          console.warn(`Failed to load sound ${name}:`, error);
        }
      }
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }
  
  async playSound(name: string, options?: { volume?: number; rate?: number }): Promise<void> {
    if (!this.soundEnabled && name !== 'background') return;
    if (!this.musicEnabled && name === 'background') return;
    
    try {
      const sound = this.sounds.get(name);
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        
        if (options?.volume !== undefined) {
          await sound.setVolumeAsync(options.volume);
        }
        
        if (options?.rate !== undefined) {
          await sound.setRateAsync(options.rate, true);
        }
        
        await sound.playAsync();
      }
    } catch (error) {
      console.warn(`Failed to play sound ${name}:`, error);
    }
  }
  
  async playMusic(): Promise<void> {
    if (!this.musicEnabled || !this.music) return;
    
    try {
      const status = await this.music.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await this.music.playAsync();
      }
    } catch (error) {
      console.warn('Failed to play background music:', error);
    }
  }
  
  async pauseMusic(): Promise<void> {
    if (!this.music) return;
    
    try {
      await this.music.pauseAsync();
    } catch (error) {
      console.warn('Failed to pause background music:', error);
    }
  }
  
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }
  
  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    
    if (!enabled && this.music) {
      this.pauseMusic();
    } else if (enabled) {
      this.playMusic();
    }
  }
  
  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    
    // Update volume for all non-music sounds
    this.sounds.forEach(async (sound, name) => {
      if (name !== 'background') {
        try {
          await sound.setVolumeAsync(this.sfxVolume);
        } catch (error) {
          console.warn(`Failed to set volume for ${name}:`, error);
        }
      }
    });
  }
  
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    if (this.music) {
      try {
        this.music.setVolumeAsync(this.musicVolume);
      } catch (error) {
        console.warn('Failed to set music volume:', error);
      }
    }
  }
  
  async cleanup(): Promise<void> {
    try {
      for (const sound of this.sounds.values()) {
        await sound.unloadAsync();
      }
      this.sounds.clear();
      this.music = null;
    } catch (error) {
      console.warn('Audio cleanup failed:', error);
    }
  }
}

// Global instance
export const audioManager = AudioManager.getInstance();
```

#### 2.2 Create Audio Hook
**File**: `src/shared/hooks/useAudio.ts`

```typescript
import { useCallback, useEffect } from 'react';
import { audioManager } from '../../core/audio/AudioManager';

export function useAudio() {
  useEffect(() => {
    // Initialize audio on first use
    audioManager.initialize();
    
    return () => {
      // Cleanup on unmount
      audioManager.cleanup();
    };
  }, []);
  
  const playSound = useCallback((name: string, options?: { volume?: number; rate?: number }) => {
    audioManager.playSound(name, options);
  }, []);
  
  const playClick = useCallback(() => {
    audioManager.playSound('click');
  }, []);
  
  const playPurchase = useCallback(() => {
    audioManager.playSound('purchase');
  }, []);
  
  const playAchievement = useCallback(() => {
    audioManager.playSound('achievement');
  }, []);
  
  const playMoneyEarned = useCallback(() => {
    audioManager.playSound('money_earned', { volume: 0.3 });
  }, []);
  
  const setSoundEnabled = useCallback((enabled: boolean) => {
    audioManager.setSoundEnabled(enabled);
  }, []);
  
  const setMusicEnabled = useCallback((enabled: boolean) => {
    audioManager.setMusicEnabled(enabled);
  }, []);
  
  return {
    playSound,
    playClick,
    playPurchase,
    playAchievement,
    playMoneyEarned,
    setSoundEnabled,
    setMusicEnabled,
  };
}
```

### Step 3: Performance Optimization

#### 3.1 Optimize BigNumber Operations
**File**: `src/shared/utils/BigNumber.ts` (Performance improvements)

```typescript
export class BigNumber {
  private value: number;
  private exponent: number;
  private _stringCache?: string; // Cache for toString()
  private _hashCache?: string;   // Cache for comparison operations
  
  constructor(value: number = 0, exponent: number = 0) {
    this.normalize(value, exponent);
    this._invalidateCache();
  }
  
  private _invalidateCache(): void {
    this._stringCache = undefined;
    this._hashCache = undefined;
  }
  
  private _getHash(): string {
    if (!this._hashCache) {
      this._hashCache = `${this.value}_${this.exponent}`;
    }
    return this._hashCache;
  }
  
  // Optimized comparison - use hash for quick equality check
  equals(other: BigNumber): boolean {
    return this._getHash() === other._getHash();
  }
  
  // Cached string conversion
  toString(): string {
    if (this._stringCache) {
      return this._stringCache;
    }
    
    if (this.exponent === 0) {
      this._stringCache = this.value.toFixed(2);
      return this._stringCache;
    }
    
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp'];
    const suffixIndex = this.exponent / 3;
    
    if (suffixIndex < suffixes.length) {
      this._stringCache = `${this.value.toFixed(2)}${suffixes[suffixIndex]}`;
    } else {
      this._stringCache = `${this.value.toFixed(2)}e${this.exponent}`;
    }
    
    return this._stringCache;
  }
  
  // Optimized addition with early returns
  add(other: BigNumber): BigNumber {
    if (other.value === 0) return this;
    if (this.value === 0) return other;
    
    if (this.exponent === other.exponent) {
      return new BigNumber(this.value + other.value, this.exponent);
    }
    
    // Rest of addition logic...
    const [larger, smaller] = this.exponent > other.exponent ? 
      [this, other] : [other, this];
    
    const exponentDiff = larger.exponent - smaller.exponent;
    const adjustedSmaller = smaller.value / Math.pow(1000, exponentDiff / 3);
    
    return new BigNumber(larger.value + adjustedSmaller, larger.exponent);
  }
  
  // Fast multiplication for common cases
  multiply(multiplier: number): BigNumber {
    if (multiplier === 1) return this;
    if (multiplier === 0) return new BigNumber(0);
    
    return new BigNumber(this.value * multiplier, this.exponent);
  }
}
```

#### 3.2 Optimize Game Loop Performance
**File**: `src/core/game-loop/GameLoop.tsx` (Performance improvements)

```typescript
export class GameLoopEngine {
  private lastUpdate = 0;
  private accumulator = 0;
  private readonly FIXED_TIMESTEP = 16.67; // 60 FPS
  private isRunning = false;
  private animationFrame?: number;
  private performanceMonitor = true;
  private frameCount = 0;
  private lastFpsCheck = 0;
  
  constructor(private updateCallback: (deltaTime: number) => void) {}
  
  private update = (timestamp: number): void => {
    if (!this.isRunning) return;
    
    const deltaTime = Math.min(timestamp - this.lastUpdate, 100);
    this.lastUpdate = timestamp;
    
    this.accumulator += deltaTime;
    
    // Performance monitoring
    if (this.performanceMonitor) {
      this.frameCount++;
      if (timestamp - this.lastFpsCheck > 1000) {
        const fps = this.frameCount;
        this.frameCount = 0;
        this.lastFpsCheck = timestamp;
        
        if (fps < 55) {
          console.warn(`Low FPS detected: ${fps}`);
        }
      }
    }
    
    // Fixed timestep with performance safeguards
    let updateCount = 0;
    const maxUpdates = 5; // Prevent spiral of death
    
    while (this.accumulator >= this.FIXED_TIMESTEP && updateCount < maxUpdates) {
      this.updateCallback(this.FIXED_TIMESTEP);
      this.accumulator -= this.FIXED_TIMESTEP;
      updateCount++;
    }
    
    // If we hit max updates, skip remaining accumulated time
    if (updateCount >= maxUpdates) {
      this.accumulator = 0;
    }
    
    this.animationFrame = requestAnimationFrame(this.update);
  };
}
```

### Step 4: Offline Progress System

#### 4.1 Create Offline Progress Calculator
**File**: `src/core/offline/OfflineProgress.ts`

```typescript
import { GameState, Department } from '../state/gameStore';
import { BigNumber } from '../../shared/utils/BigNumber';

export interface OfflineProgress {
  timeAway: number;
  totalEarnings: BigNumber;
  departmentEarnings: Array<{
    departmentId: string;
    earnings: BigNumber;
  }>;
}

export class OfflineProgressCalculator {
  static calculate(gameState: GameState, timeAway: number): OfflineProgress {
    // Cap offline time to 24 hours
    const cappedTime = Math.min(timeAway, 24 * 60 * 60 * 1000);
    
    // Apply efficiency curve (full efficiency for 1 hour, then diminishing returns)
    const efficiency = this.calculateEfficiency(cappedTime);
    const effectiveTime = cappedTime * efficiency;
    
    let totalEarnings = new BigNumber(0);
    const departmentEarnings: Array<{
      departmentId: string;
      earnings: BigNumber;
    }> = [];
    
    // Calculate earnings for each department
    for (const department of gameState.departments) {
      const earnings = this.calculateDepartmentOfflineEarnings(
        department, 
        effectiveTime
      );
      
      totalEarnings = totalEarnings.add(earnings);
      departmentEarnings.push({
        departmentId: department.id,
        earnings,
      });
    }
    
    return {
      timeAway: cappedTime,
      totalEarnings,
      departmentEarnings,
    };
  }
  
  private static calculateEfficiency(timeAway: number): number {
    const hours = timeAway / (60 * 60 * 1000);
    
    // Efficiency curve: 100% for 1 hour, then exponential decay
    if (hours <= 1) return 1.0;
    if (hours <= 4) return 0.75;
    if (hours <= 8) return 0.5;
    if (hours <= 16) return 0.25;
    return 0.1; // Minimum 10% efficiency
  }
  
  private static calculateDepartmentOfflineEarnings(
    department: Department,
    timeMs: number
  ): BigNumber {
    const timeSeconds = timeMs / 1000;
    const productionRate = department.production.currentRate;
    
    return productionRate.multiply(timeSeconds);
  }
  
  static formatOfflineTime(timeMs: number): string {
    const hours = Math.floor(timeMs / (60 * 60 * 1000));
    const minutes = Math.floor((timeMs % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
```

#### 4.2 Create Offline Progress Modal
**File**: `src/features/offline/OfflineProgressModal.tsx`

```typescript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { OfflineProgress } from '../../core/offline/OfflineProgress';
import { BaseButton } from '../../shared/components/BaseButton';
import { MoneyDisplay } from '../../shared/components/MoneyDisplay';
import { ParticleSystem } from '../../shared/components/ParticleSystem';

const { width, height } = Dimensions.get('window');

interface OfflineProgressModalProps {
  progress: OfflineProgress;
  visible: boolean;
  onClaim: () => void;
}

export function OfflineProgressModal({
  progress,
  visible,
  onClaim,
}: OfflineProgressModalProps) {
  const [showParticles, setShowParticles] = React.useState(false);
  
  const handleClaim = () => {
    setShowParticles(true);
    setTimeout(() => {
      onClaim();
      setShowParticles(false);
    }, 1000);
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            You were away for {OfflineProgressCalculator.formatOfflineTime(progress.timeAway)}
          </Text>
          
          <View style={styles.earningsContainer}>
            <Text style={styles.earningsLabel}>You earned:</Text>
            <MoneyDisplay
              amount={progress.totalEarnings}
              size="large"
              animated={false}
            />
          </View>
          
          <View style={styles.departmentBreakdown}>
            <Text style={styles.breakdownTitle}>Department Breakdown:</Text>
            {progress.departmentEarnings
              .filter(dept => dept.earnings.greaterThan(new BigNumber(0)))
              .map(dept => (
                <View key={dept.departmentId} style={styles.departmentRow}>
                  <Text style={styles.departmentName}>
                    {dept.departmentId}
                  </Text>
                  <MoneyDisplay
                    amount={dept.earnings}
                    size="small"
                    animated={false}
                  />
                </View>
              ))
            }
          </View>
          
          <BaseButton
            title="Claim Earnings"
            onPress={handleClaim}
            variant="success"
            size="large"
            style={styles.claimButton}
          />
        </View>
      </View>
      
      <ParticleSystem 
        trigger={showParticles}
        emojis={['💰', '💵', '💸', '🤑']}
        particleCount={20}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  earningsContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    width: '100%',
  },
  earningsLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  departmentBreakdown: {
    width: '100%',
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  departmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  departmentName: {
    fontSize: 14,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
  claimButton: {
    width: '100%',
  },
});
```

### Step 5: Responsive Design System

#### 5.1 Create Responsive Hooks
**File**: `src/shared/hooks/useResponsive.ts`

```typescript
import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export interface ScreenSize {
  width: number;
  height: number;
  isPhone: boolean;
  isTablet: boolean;
  isLandscape: boolean;
}

export interface BreakpointSizes {
  xs: boolean; // < 576px
  sm: boolean; // 576px - 768px
  md: boolean; // 768px - 992px
  lg: boolean; // 992px - 1200px
  xl: boolean; // > 1200px
}

export function useResponsive() {
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    const { width, height } = Dimensions.get('window');
    return {
      width,
      height,
      isPhone: width < 768,
      isTablet: width >= 768,
      isLandscape: width > height,
    };
  });
  
  const [breakpoints, setBreakpoints] = useState<BreakpointSizes>(() => {
    const { width } = Dimensions.get('window');
    return {
      xs: width < 576,
      sm: width >= 576 && width < 768,
      md: width >= 768 && width < 992,
      lg: width >= 992 && width < 1200,
      xl: width >= 1200,
    };
  });
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      const newScreenSize: ScreenSize = {
        width: window.width,
        height: window.height,
        isPhone: window.width < 768,
        isTablet: window.width >= 768,
        isLandscape: window.width > window.height,
      };
      
      const newBreakpoints: BreakpointSizes = {
        xs: window.width < 576,
        sm: window.width >= 576 && window.width < 768,
        md: window.width >= 768 && window.width < 992,
        lg: window.width >= 992 && window.width < 1200,
        xl: window.width >= 1200,
      };
      
      setScreenSize(newScreenSize);
      setBreakpoints(newBreakpoints);
    });
    
    return () => subscription?.remove();
  }, []);
  
  const getColumns = (defaultColumns: number = 1): number => {
    if (breakpoints.xl) return Math.min(defaultColumns * 3, 4);
    if (breakpoints.lg) return Math.min(defaultColumns * 2, 3);
    if (breakpoints.md) return Math.min(defaultColumns * 2, 2);
    return defaultColumns;
  };
  
  const getSpacing = (base: number = 16): number => {
    if (breakpoints.xs) return base * 0.75;
    if (breakpoints.xl) return base * 1.5;
    return base;
  };
  
  return {
    screenSize,
    breakpoints,
    getColumns,
    getSpacing,
  };
}
```

## Phase 4 Completion Criteria

- [ ] Advanced animation system with particle effects implemented
- [ ] Audio system with sound effects and background music functional
- [ ] Performance optimized to maintain 60 FPS on target devices
- [ ] Offline progress system calculating and displaying idle earnings
- [ ] Responsive design working on phones, tablets, and web
- [ ] Cross-platform compatibility tested and verified
- [ ] Memory management and performance monitoring active
- [ ] All animations using native driver for smooth performance
- [ ] Audio settings allowing users to control sound/music
- [ ] Comprehensive visual polish applied throughout UI

## Performance Validation

### Frame Rate Testing
```bash
# Monitor FPS during gameplay
npm run dev -- --mode performance

# Check animation performance
# Target: >55 FPS during all interactions
# Target: <100MB memory usage
```

### Audio Testing
```bash
# Test all sound effects
# Verify background music loops properly
# Test audio settings persistence
```

### Cross-Platform Testing
```bash
# iOS testing
npx expo run:ios

# Android testing
npx expo run:android

# Web testing
npx expo run:web
```

## Next Steps

Upon Phase 4 completion:

1. **Update progress.json**: Mark Phase 4 as completed
2. **Proceed to Phase 5**: [05-deployment.md](./05-deployment.md)
3. **Final performance validation**: Ensure all targets met
4. **User experience testing**: Validate smooth gameplay flow

## Time Estimation

- **Day 1-2**: Animation system implementation (16 hours)
- **Day 3**: Audio system integration (8 hours)
- **Day 4-5**: Performance optimization (16 hours)  
- **Day 6**: Responsive design & cross-platform (8 hours)
- **Day 7**: Final polish & testing (8 hours)

**Total Estimated Time**: 56 hours over 7 days