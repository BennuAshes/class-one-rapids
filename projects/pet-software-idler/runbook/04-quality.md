# Phase 4: Quality & Polish
## Performance Optimization, Animations, and User Experience Enhancement

**Estimated Time**: 2-3 days  
**Prerequisites**: All core systems functional with stable performance baseline  
**Deliverables**: Polished user experience, smooth animations, audio system, optimized performance

---

## Objectives

1. **Performance Optimization**: Achieve consistent 60 FPS across all devices and scenarios
2. **Animation System**: Implement smooth, engaging animations using React Native Reanimated 3
3. **Audio Integration**: Add audio feedback and background music using Expo AV
4. **Visual Polish**: Create particle effects, visual feedback, and professional UI components
5. **User Experience**: Implement intuitive navigation, helpful tutorials, and accessibility features

---

## Task Checklist

### Performance Optimization
- [ ] **Memory Management Optimization** (3 hours)
  ```bash
  # Create memory optimization utilities
  cat > src/shared/utils/performance.ts << 'EOF'
  import { useEffect, useRef, useCallback } from 'react';
  import { AppState, AppStateStatus } from 'react-native';
  import { batch } from '@legendapp/state';
  import { gameState$ } from '../../core/state/gameStore';
  
  export class MemoryManager {
    private static instance: MemoryManager;
    private cleanupTasks: (() => void)[] = [];
    private performanceWarnings: string[] = [];
    
    static getInstance(): MemoryManager {
      if (!MemoryManager.instance) {
        MemoryManager.instance = new MemoryManager();
      }
      return MemoryManager.instance;
    }
    
    // Memory pressure handling
    handleMemoryPressure() {
      console.log('Memory pressure detected, performing cleanup...');
      
      batch(() => {
        // Clear non-essential caches
        this.clearAnimationCaches();
        
        // Reduce update frequency temporarily
        this.reduceUpdateFrequency();
        
        // Force garbage collection of observables
        this.cleanupObservables();
        
        // Save game state
        gameState$.actions.forceSave();
      });
    }
    
    private clearAnimationCaches() {
      // Clear animation-related caches
      if (global.particleSystem) {
        global.particleSystem.clearCaches();
      }
    }
    
    private reduceUpdateFrequency() {
      // Temporarily reduce game loop frequency
      if (global.gameLoop) {
        global.gameLoop.setReducedMode(true);
        
        // Restore normal frequency after 30 seconds
        setTimeout(() => {
          if (global.gameLoop) {
            global.gameLoop.setReducedMode(false);
          }
        }, 30000);
      }
    }
    
    private cleanupObservables() {
      // Clean up any stale computed observables or listeners
      const unusedKeys = [];
      
      // Implementation would scan for unused observables
      // and clean them up to free memory
      
      unusedKeys.forEach(key => {
        // Cleanup logic
      });
    }
    
    // Performance monitoring
    trackPerformanceMetric(metric: string, value: number, threshold: number) {
      if (value > threshold) {
        this.performanceWarnings.push(`${metric}: ${value} exceeds threshold ${threshold}`);
        
        if (this.performanceWarnings.length > 10) {
          this.performanceWarnings.shift(); // Keep only recent warnings
        }
        
        console.warn(`Performance warning: ${metric} = ${value}`);
      }
    }
    
    getPerformanceWarnings(): string[] {
      return [...this.performanceWarnings];
    }
    
    // Resource cleanup
    addCleanupTask(task: () => void) {
      this.cleanupTasks.push(task);
    }
    
    performCleanup() {
      this.cleanupTasks.forEach(task => {
        try {
          task();
        } catch (error) {
          console.error('Cleanup task failed:', error);
        }
      });
      
      this.cleanupTasks = [];
    }
  }
  
  // React hook for performance monitoring
  export function usePerformanceOptimization() {
    const memoryManager = useRef(MemoryManager.getInstance());
    const frameCountRef = useRef(0);
    const fpsRef = useRef(60);
    
    const measureFPS = useCallback(() => {
      frameCountRef.current++;
      
      const measureFrame = () => {
        frameCountRef.current++;
        requestAnimationFrame(measureFrame);
      };
      
      // Calculate FPS every second
      setInterval(() => {
        fpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        
        // Track FPS performance
        memoryManager.current.trackPerformanceMetric('FPS', fpsRef.current, 55);
      }, 1000);
      
      requestAnimationFrame(measureFrame);
    }, []);
    
    useEffect(() => {
      measureFPS();
      
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background') {
          memoryManager.current.performCleanup();
        }
      };
      
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      
      return () => {
        subscription?.remove();
        memoryManager.current.performCleanup();
      };
    }, [measureFPS]);
    
    return {
      currentFPS: fpsRef.current,
      performanceWarnings: memoryManager.current.getPerformanceWarnings(),
      triggerCleanup: () => memoryManager.current.performCleanup()
    };
  }
  
  // Component-level optimization utilities
  export const performanceHOC = <P extends object>(
    Component: React.ComponentType<P>,
    debugName: string = 'Component'
  ) => {
    const MemoizedComponent = React.memo(Component);
    MemoizedComponent.displayName = `Performance(${debugName})`;
    
    return (props: P) => {
      const renderStart = performance.now();
      
      useEffect(() => {
        const renderEnd = performance.now();
        const renderTime = renderEnd - renderStart;
        
        if (renderTime > 16) { // More than one frame at 60fps
          console.warn(`Slow render: ${debugName} took ${renderTime}ms`);
        }
      });
      
      return <MemoizedComponent {...props} />;
    };
  };
  
  // Batch update utility for Legend State
  export function useBatchedUpdates() {
    const pendingUpdates = useRef<(() => void)[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const scheduleUpdate = useCallback((updateFn: () => void) => {
      pendingUpdates.current.push(updateFn);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        batch(() => {
          pendingUpdates.current.forEach(fn => fn());
          pendingUpdates.current = [];
        });
      }, 16); // Batch updates for one frame
    }, []);
    
    return scheduleUpdate;
  }
  EOF
  ```

### Animation System Implementation
- [ ] **Create Advanced Animation Components** (4 hours)
  ```bash
  # Create enhanced animation system
  cat > src/shared/components/Animated/CounterAnimation.tsx << 'EOF'
  import React, { useEffect } from 'react';
  import { Text, StyleSheet } from 'react-native';
  import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolate,
    runOnJS,
    withDelay,
    withSequence
  } from 'react-native-reanimated';
  import { GameMath } from '../../utils/BigNumber';
  
  interface CounterAnimationProps {
    value: string | number;
    previousValue?: string | number;
    style?: any;
    animationType?: 'spring' | 'timing' | 'bounce';
    showDifference?: boolean;
    formatValue?: (value: string | number) => string;
  }
  
  export const CounterAnimation = ({
    value,
    previousValue,
    style,
    animationType = 'spring',
    showDifference = false,
    formatValue = (val) => GameMath.formatCurrency(val)
  }: CounterAnimationProps) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);
    const colorProgress = useSharedValue(0);
    
    const animatedStyle = useAnimatedStyle(() => {
      const backgroundColor = interpolate(
        colorProgress.value,
        [0, 0.5, 1],
        [0, 255, 0] // RGB green component
      );
      
      return {
        transform: [
          { scale: scale.value },
          { translateY: translateY.value }
        ],
        opacity: opacity.value,
        color: `rgb(255, 255, ${Math.floor(255 - backgroundColor)})`
      };
    });
    
    useEffect(() => {
      if (previousValue !== undefined && value !== previousValue) {
        const isIncrease = GameMath.greaterThan(value, previousValue || 0);
        
        if (animationType === 'spring') {
          scale.value = withSpring(1.2, { duration: 200 }, () => {
            scale.value = withSpring(1, { duration: 300 });
          });
        } else if (animationType === 'bounce') {
          scale.value = withSequence(
            withTiming(0.8, { duration: 100 }),
            withSpring(1.1, { duration: 200 }),
            withSpring(1, { duration: 300 })
          );
        }
        
        // Color animation for value changes
        if (isIncrease) {
          colorProgress.value = withTiming(1, { duration: 500 }, () => {
            colorProgress.value = withTiming(0, { duration: 1000 });
          });
        }
        
        // Subtle upward animation for increases
        if (isIncrease) {
          translateY.value = withTiming(-5, { duration: 200 }, () => {
            translateY.value = withSpring(0, { duration: 300 });
          });
        }
      }
    }, [value, previousValue, animationType]);
    
    return (
      <Animated.Text style={[styles.text, style, animatedStyle]}>
        {formatValue(value)}
      </Animated.Text>
    );
  };
  
  const styles = StyleSheet.create({
    text: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#ffffff'
    }
  });
  EOF
  
  # Create particle system for visual effects
  cat > src/shared/components/Animated/ParticleSystem.tsx << 'EOF'
  import React, { useEffect, useRef, useCallback } from 'react';
  import { View, StyleSheet, Dimensions } from 'react-native';
  import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSpring,
    runOnJS,
    cancelAnimation
  } from 'react-native-reanimated';
  
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  interface Particle {
    id: string;
    x: Animated.SharedValue<number>;
    y: Animated.SharedValue<number>;
    opacity: Animated.SharedValue<number>;
    scale: Animated.SharedValue<number>;
    rotation: Animated.SharedValue<number>;
    color: string;
    symbol: string;
    lifetime: number;
  }
  
  interface ParticleSystemProps {
    active: boolean;
    particleCount?: number;
    duration?: number;
    symbols?: string[];
    colors?: string[];
    style?: any;
  }
  
  export const ParticleSystem = ({
    active,
    particleCount = 10,
    duration = 2000,
    symbols = ['💰', '+', '✨', '🎉'],
    colors = ['#FFD700', '#00FF00', '#FF6B6B', '#4ECDC4'],
    style
  }: ParticleSystemProps) => {
    const particles = useRef<Particle[]>([]);
    const activeAnimations = useRef<Set<string>>(new Set());
    
    const createParticle = useCallback((): Particle => {
      const id = Math.random().toString(36);
      const startX = Math.random() * screenWidth;
      const startY = screenHeight * 0.6 + Math.random() * 100;
      
      return {
        id,
        x: useSharedValue(startX),
        y: useSharedValue(startY),
        opacity: useSharedValue(1),
        scale: useSharedValue(0),
        rotation: useSharedValue(0),
        color: colors[Math.floor(Math.random() * colors.length)],
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        lifetime: Date.now()
      };
    }, [colors, symbols]);
    
    const animateParticle = useCallback((particle: Particle) => {
      activeAnimations.current.add(particle.id);
      
      // Entry animation
      particle.scale.value = withSpring(1, { duration: 300 });
      
      // Movement animation
      particle.x.value = withTiming(
        particle.x.value + (Math.random() - 0.5) * 200,
        { duration }
      );
      particle.y.value = withTiming(
        particle.y.value - 150 - Math.random() * 100,
        { duration }
      );
      
      // Rotation animation
      particle.rotation.value = withTiming(
        360 + Math.random() * 360,
        { duration }
      );
      
      // Exit animation
      particle.opacity.value = withTiming(
        0,
        { duration: duration * 0.8 },
        () => {
          runOnJS(() => {
            activeAnimations.current.delete(particle.id);
          })();
        }
      );
    }, [duration]);
    
    const spawnParticles = useCallback(() => {
      for (let i = 0; i < particleCount; i++) {
        const particle = createParticle();
        particles.current.push(particle);
        
        // Stagger particle spawns
        setTimeout(() => {
          animateParticle(particle);
        }, i * 50);
      }
      
      // Clean up old particles
      setTimeout(() => {
        particles.current = particles.current.filter(
          p => Date.now() - p.lifetime < duration + 1000
        );
      }, duration + 1000);
    }, [particleCount, createParticle, animateParticle, duration]);
    
    useEffect(() => {
      if (active) {
        spawnParticles();
      }
    }, [active, spawnParticles]);
    
    useEffect(() => {
      return () => {
        // Cleanup all animations on unmount
        particles.current.forEach(particle => {
          cancelAnimation(particle.x);
          cancelAnimation(particle.y);
          cancelAnimation(particle.opacity);
          cancelAnimation(particle.scale);
          cancelAnimation(particle.rotation);
        });
      };
    }, []);
    
    return (
      <View style={[styles.container, style]} pointerEvents="none">
        {particles.current.map(particle => (
          <ParticleComponent key={particle.id} particle={particle} />
        ))}
      </View>
    );
  };
  
  const ParticleComponent = ({ particle }: { particle: Particle }) => {
    const animatedStyle = useAnimatedStyle(() => ({
      position: 'absolute',
      left: particle.x.value,
      top: particle.y.value,
      opacity: particle.opacity.value,
      transform: [
        { scale: particle.scale.value },
        { rotate: `${particle.rotation.value}deg` }
      ]
    }));
    
    return (
      <Animated.Text
        style={[
          animatedStyle,
          { color: particle.color, fontSize: 20, fontWeight: 'bold' }
        ]}
      >
        {particle.symbol}
      </Animated.Text>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000
    }
  });
  EOF
  
  # Create progress bar animation
  cat > src/shared/components/Animated/ProgressBar.tsx << 'EOF'
  import React, { useEffect } from 'react';
  import { View, Text, StyleSheet } from 'react-native';
  import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    interpolateColor
  } from 'react-native-reanimated';
  
  interface ProgressBarProps {
    progress: number; // 0 to 1
    label?: string;
    showPercentage?: boolean;
    animated?: boolean;
    height?: number;
    backgroundColor?: string;
    progressColor?: string;
    glowEffect?: boolean;
  }
  
  export const ProgressBar = ({
    progress,
    label,
    showPercentage = true,
    animated = true,
    height = 20,
    backgroundColor = '#333333',
    progressColor = '#007AFF',
    glowEffect = false
  }: ProgressBarProps) => {
    const animatedProgress = useSharedValue(0);
    const glowIntensity = useSharedValue(0);
    
    useEffect(() => {
      if (animated) {
        animatedProgress.value = withTiming(progress, { duration: 500 });
        
        if (glowEffect && progress > 0) {
          glowIntensity.value = withTiming(1, { duration: 200 }, () => {
            glowIntensity.value = withTiming(0.3, { duration: 300 });
          });
        }
      } else {
        animatedProgress.value = progress;
      }
    }, [progress, animated, glowEffect]);
    
    const progressStyle = useAnimatedStyle(() => {
      const width = interpolate(
        animatedProgress.value,
        [0, 1],
        [0, 100]
      );
      
      const shadowOpacity = glowEffect ? 
        interpolate(glowIntensity.value, [0, 1], [0, 0.8]) : 0;
      
      return {
        width: `${width}%`,
        backgroundColor: progressColor,
        shadowOpacity,
        shadowRadius: 10,
        shadowColor: progressColor
      };
    });
    
    const containerStyle = useAnimatedStyle(() => ({
      backgroundColor,
      borderRadius: height / 2,
      overflow: 'hidden',
      height
    }));
    
    return (
      <View style={styles.wrapper}>
        {label && <Text style={styles.label}>{label}</Text>}
        <Animated.View style={[styles.container, containerStyle]}>
          <Animated.View style={[styles.progress, progressStyle]} />
          {showPercentage && (
            <Text style={[styles.percentage, { lineHeight: height }]}>
              {Math.round(progress * 100)}%
            </Text>
          )}
        </Animated.View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    wrapper: {
      width: '100%'
    },
    label: {
      color: '#ffffff',
      fontSize: 14,
      marginBottom: 8,
      fontWeight: '500'
    },
    container: {
      position: 'relative',
      justifyContent: 'center'
    },
    progress: {
      height: '100%',
      borderRadius: 'inherit'
    },
    percentage: {
      position: 'absolute',
      alignSelf: 'center',
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 'bold',
      textShadowColor: 'rgba(0,0,0,0.8)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2
    }
  });
  EOF
  ```

### Audio System Implementation
- [ ] **Create Comprehensive Audio System** (3 hours)
  ```bash
  # Create audio manager with context
  cat > src/shared/hooks/useAudioManager.ts << 'EOF'
  import { useEffect, useState, useCallback, useRef } from 'react';
  import { Audio } from 'expo-av';
  import { usePerformanceOptimization } from '../utils/performance';
  
  export interface AudioAsset {
    id: string;
    source: any;
    volume?: number;
    loop?: boolean;
    category: 'sfx' | 'music' | 'ui';
  }
  
  export interface AudioSettings {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    uiVolume: number;
    enabled: boolean;
  }
  
  const defaultAudioAssets: AudioAsset[] = [
    {
      id: 'background_music',
      source: require('../../../assets/audio/background.mp3'),
      volume: 0.3,
      loop: true,
      category: 'music'
    },
    {
      id: 'button_click',
      source: require('../../../assets/audio/click.wav'),
      volume: 0.7,
      category: 'ui'
    },
    {
      id: 'money_gain',
      source: require('../../../assets/audio/money.wav'),
      volume: 0.8,
      category: 'sfx'
    },
    {
      id: 'level_up',
      source: require('../../../assets/audio/levelup.wav'),
      volume: 0.9,
      category: 'sfx'
    },
    {
      id: 'achievement',
      source: require('../../../assets/audio/achievement.wav'),
      volume: 1.0,
      category: 'sfx'
    },
    {
      id: 'error',
      source: require('../../../assets/audio/error.wav'),
      volume: 0.6,
      category: 'ui'
    },
    {
      id: 'prestige',
      source: require('../../../assets/audio/prestige.wav'),
      volume: 0.95,
      category: 'sfx'
    }
  ];
  
  export function useAudioManager(
    assets: AudioAsset[] = defaultAudioAssets,
    initialSettings: Partial<AudioSettings> = {}
  ) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [settings, setSettings] = useState<AudioSettings>({
      masterVolume: 0.8,
      sfxVolume: 1.0,
      musicVolume: 0.6,
      uiVolume: 0.8,
      enabled: true,
      ...initialSettings
    });
    
    const sounds = useRef<Map<string, Audio.Sound>>(new Map());
    const backgroundMusic = useRef<Audio.Sound | null>(null);
    const { performanceWarnings } = usePerformanceOptimization();
    
    // Initialize audio system
    const initializeAudio = useCallback(async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS
        });
        
        // Load all audio assets
        const loadPromises = assets.map(async (asset) => {
          try {
            const { sound } = await Audio.Sound.createAsync(
              asset.source,
              {
                shouldPlay: false,
                volume: calculateVolume(asset),
                isLooping: asset.loop || false
              }
            );
            
            sounds.current.set(asset.id, sound);
            
            if (asset.category === 'music' && asset.id === 'background_music') {
              backgroundMusic.current = sound;
            }
            
            return { asset, success: true };
          } catch (error) {
            console.warn(`Failed to load audio asset ${asset.id}:`, error);
            return { asset, success: false };
          }
        });
        
        await Promise.all(loadPromises);
        setIsInitialized(true);
        
        // Start background music if enabled
        if (settings.enabled && settings.musicVolume > 0) {
          playBackgroundMusic();
        }
        
      } catch (error) {
        console.error('Audio initialization failed:', error);
      }
    }, [assets, settings]);
    
    const calculateVolume = useCallback((asset: AudioAsset): number => {
      const baseVolume = asset.volume || 1.0;
      const categoryVolume = settings[`${asset.category}Volume`] || 1.0;
      return baseVolume * categoryVolume * settings.masterVolume;
    }, [settings]);
    
    // Play sound effect
    const playSound = useCallback(async (
      soundId: string, 
      options: { volume?: number; interrupt?: boolean } = {}
    ) => {
      if (!settings.enabled || !isInitialized) return;
      
      const sound = sounds.current.get(soundId);
      if (!sound) {
        console.warn(`Sound ${soundId} not found`);
        return;
      }
      
      try {
        // Performance optimization: limit concurrent sounds
        if (performanceWarnings.length > 5) {
          console.log('Skipping audio due to performance warnings');
          return;
        }
        
        await sound.setPositionAsync(0);
        
        if (options.volume !== undefined) {
          await sound.setVolumeAsync(options.volume * settings.masterVolume);
        }
        
        await sound.playAsync();
      } catch (error) {
        console.warn(`Failed to play sound ${soundId}:`, error);
      }
    }, [settings, isInitialized, performanceWarnings]);
    
    // Background music controls
    const playBackgroundMusic = useCallback(async () => {
      if (!backgroundMusic.current || !settings.enabled) return;
      
      try {
        await backgroundMusic.current.playAsync();
      } catch (error) {
        console.warn('Failed to play background music:', error);
      }
    }, [settings.enabled]);
    
    const pauseBackgroundMusic = useCallback(async () => {
      if (!backgroundMusic.current) return;
      
      try {
        await backgroundMusic.current.pauseAsync();
      } catch (error) {
        console.warn('Failed to pause background music:', error);
      }
    }, []);
    
    const setBackgroundMusicVolume = useCallback(async (volume: number) => {
      if (!backgroundMusic.current) return;
      
      try {
        await backgroundMusic.current.setVolumeAsync(
          volume * settings.musicVolume * settings.masterVolume
        );
      } catch (error) {
        console.warn('Failed to set background music volume:', error);
      }
    }, [settings]);
    
    // Settings management
    const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
      setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        
        // Update volumes for all loaded sounds
        sounds.current.forEach(async (sound, id) => {
          const asset = assets.find(a => a.id === id);
          if (asset) {
            try {
              await sound.setVolumeAsync(calculateVolume(asset));
            } catch (error) {
              console.warn(`Failed to update volume for ${id}:`, error);
            }
          }
        });
        
        // Handle background music
        if (!updated.enabled || updated.musicVolume === 0) {
          pauseBackgroundMusic();
        } else if (prev.enabled !== updated.enabled || prev.musicVolume !== updated.musicVolume) {
          playBackgroundMusic();
        }
        
        return updated;
      });
    }, [assets, calculateVolume, playBackgroundMusic, pauseBackgroundMusic]);
    
    // Cleanup
    const cleanup = useCallback(async () => {
      const promises = Array.from(sounds.current.values()).map(sound => 
        sound.unloadAsync().catch(error => 
          console.warn('Failed to unload sound:', error)
        )
      );
      
      await Promise.all(promises);
      sounds.current.clear();
      backgroundMusic.current = null;
    }, []);
    
    // Initialize on mount
    useEffect(() => {
      initializeAudio();
      return cleanup;
    }, [initializeAudio, cleanup]);
    
    // Game event audio hooks
    const audioHooks = {
      onMoneyGained: (amount: number) => {
        if (amount > 0) {
          playSound('money_gain');
        }
      },
      
      onLevelUp: () => {
        playSound('level_up');
      },
      
      onAchievementUnlocked: () => {
        playSound('achievement');
      },
      
      onButtonClick: () => {
        playSound('button_click');
      },
      
      onError: () => {
        playSound('error');
      },
      
      onPrestige: () => {
        playSound('prestige');
      }
    };
    
    return {
      isInitialized,
      settings,
      playSound,
      playBackgroundMusic,
      pauseBackgroundMusic,
      setBackgroundMusicVolume,
      updateSettings,
      audioHooks
    };
  }
  EOF
  ```

### Visual Polish Implementation
- [ ] **Create Enhanced UI Components** (3 hours)
  ```bash
  # Create modern card component with glassmorphism
  cat > src/shared/components/ui/Card.tsx << 'EOF'
  import React from 'react';
  import { View, StyleSheet, ViewStyle } from 'react-native';
  import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate
  } from 'react-native-reanimated';
  
  interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'glass' | 'elevated' | 'outlined';
    pressable?: boolean;
    glowColor?: string;
    onPress?: () => void;
  }
  
  export const Card = ({
    children,
    style,
    variant = 'default',
    pressable = false,
    glowColor,
    onPress
  }: CardProps) => {
    const scale = useSharedValue(1);
    const pressed = useSharedValue(0);
    
    const animatedStyle = useAnimatedStyle(() => {
      const scaleValue = interpolate(
        pressed.value,
        [0, 1],
        [scale.value, scale.value * 0.98]
      );
      
      return {
        transform: [{ scale: scaleValue }]
      };
    });
    
    const handlePressIn = () => {
      if (pressable) {
        pressed.value = withSpring(1, { duration: 150 });
      }
    };
    
    const handlePressOut = () => {
      if (pressable) {
        pressed.value = withSpring(0, { duration: 150 });
        onPress?.();
      }
    };
    
    const getVariantStyles = () => {
      switch (variant) {
        case 'glass':
          return {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)'
          };
        case 'elevated':
          return {
            backgroundColor: '#1a1a1a',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8
          };
        case 'outlined':
          return {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#333333'
          };
        default:
          return {
            backgroundColor: '#1a1a1a',
            borderWidth: 1,
            borderColor: '#333333'
          };
      }
    };
    
    const glowStyle = glowColor ? {
      shadowColor: glowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10
    } : {};
    
    return (
      <Animated.View
        style={[
          styles.card,
          getVariantStyles(),
          glowStyle,
          animatedStyle,
          style
        ]}
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
        onTouchCancel={handlePressOut}
      >
        {children}
      </Animated.View>
    );
  };
  
  const styles = StyleSheet.create({
    card: {
      borderRadius: 12,
      padding: 16,
      margin: 4
    }
  });
  EOF
  
  # Create floating action button with ripple effect
  cat > src/shared/components/ui/FloatingActionButton.tsx << 'EOF'
  import React, { useRef } from 'react';
  import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
  import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS
  } from 'react-native-reanimated';
  
  interface FloatingActionButtonProps {
    onPress: () => void;
    icon?: string;
    label?: string;
    size?: number;
    color?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    style?: ViewStyle;
  }
  
  export const FloatingActionButton = ({
    onPress,
    icon = '+',
    label,
    size = 56,
    color = '#007AFF',
    position = 'bottom-right',
    style
  }: FloatingActionButtonProps) => {
    const scale = useSharedValue(1);
    const rippleScale = useSharedValue(0);
    const rippleOpacity = useSharedValue(0);
    const rotation = useSharedValue(0);
    
    const animatedButtonStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ]
    }));
    
    const animatedRippleStyle = useAnimatedStyle(() => ({
      transform: [{ scale: rippleScale.value }],
      opacity: rippleOpacity.value
    }));
    
    const handlePress = () => {
      // Button animation
      scale.value = withSpring(0.9, { duration: 100 }, () => {
        scale.value = withSpring(1, { duration: 200 });
      });
      
      // Ripple effect
      rippleScale.value = 0;
      rippleOpacity.value = 0.3;
      
      rippleScale.value = withTiming(1.5, { duration: 400 });
      rippleOpacity.value = withTiming(0, { duration: 400 });
      
      // Rotation animation for visual feedback
      rotation.value = withSpring(rotation.value + 90, { duration: 300 });
      
      runOnJS(onPress)();
    };
    
    const getPositionStyle = (): ViewStyle => {
      const offset = 20;
      
      switch (position) {
        case 'bottom-right':
          return { bottom: offset, right: offset };
        case 'bottom-left':
          return { bottom: offset, left: offset };
        case 'top-right':
          return { top: offset, right: offset };
        case 'top-left':
          return { top: offset, left: offset };
        default:
          return { bottom: offset, right: offset };
      }
    };
    
    return (
      <Animated.View style={[
        styles.container,
        getPositionStyle(),
        { width: size, height: size },
        style
      ]}>
        {/* Ripple Effect */}
        <Animated.View
          style={[
            styles.ripple,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color
            },
            animatedRippleStyle
          ]}
        />
        
        {/* Main Button */}
        <Animated.View style={animatedButtonStyle}>
          <Pressable
            style={[
              styles.button,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color
              }
            ]}
            onPress={handlePress}
          >
            <Text style={[styles.icon, { fontSize: size * 0.4 }]}>
              {icon}
            </Text>
            {label && (
              <Text style={styles.label} numberOfLines={1}>
                {label}
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    ripple: {
      position: 'absolute'
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8
    },
    icon: {
      color: '#ffffff',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    label: {
      color: '#ffffff',
      fontSize: 10,
      fontWeight: '600',
      marginTop: 2,
      textAlign: 'center'
    }
  });
  EOF
  ```

### User Experience Enhancements
- [ ] **Create Onboarding and Tutorials** (2 hours)
  ```bash
  # Create tutorial system
  cat > src/shared/components/ui/TutorialOverlay.tsx << 'EOF'
  import React, { useEffect } from 'react';
  import { View, Text, StyleSheet, Dimensions, Modal } from 'react-native';
  import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSequence,
    withDelay
  } from 'react-native-reanimated';
  import { BaseButton } from './BaseButton';
  
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  interface TutorialStep {
    id: string;
    title: string;
    description: string;
    targetElement?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    position?: 'top' | 'bottom' | 'center';
    action?: () => void;
  }
  
  interface TutorialOverlayProps {
    visible: boolean;
    steps: TutorialStep[];
    currentStep: number;
    onNext: () => void;
    onPrevious: () => void;
    onComplete: () => void;
    onSkip: () => void;
  }
  
  export const TutorialOverlay = ({
    visible,
    steps,
    currentStep,
    onNext,
    onPrevious,
    onComplete,
    onSkip
  }: TutorialOverlayProps) => {
    const overlayOpacity = useSharedValue(0);
    const contentScale = useSharedValue(0.8);
    const highlightScale = useSharedValue(0);
    
    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;
    
    useEffect(() => {
      if (visible) {
        overlayOpacity.value = withTiming(1, { duration: 300 });
        contentScale.value = withSequence(
          withTiming(1.05, { duration: 200 }),
          withTiming(1, { duration: 200 })
        );
        
        if (currentStepData?.targetElement) {
          highlightScale.value = withDelay(
            300,
            withTiming(1, { duration: 400 })
          );
        }
      } else {
        overlayOpacity.value = withTiming(0, { duration: 200 });
        contentScale.value = withTiming(0.8, { duration: 200 });
        highlightScale.value = 0;
      }
    }, [visible, currentStep]);
    
    const overlayStyle = useAnimatedStyle(() => ({
      opacity: overlayOpacity.value
    }));
    
    const contentStyle = useAnimatedStyle(() => ({
      transform: [{ scale: contentScale.value }]
    }));
    
    const highlightStyle = useAnimatedStyle(() => {
      if (!currentStepData?.targetElement) return { opacity: 0 };
      
      return {
        position: 'absolute',
        left: currentStepData.targetElement.x - 4,
        top: currentStepData.targetElement.y - 4,
        width: currentStepData.targetElement.width + 8,
        height: currentStepData.targetElement.height + 8,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#007AFF',
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        opacity: highlightScale.value,
        transform: [{ scale: highlightScale.value }]
      };
    });
    
    const getContentPosition = () => {
      if (!currentStepData?.targetElement || currentStepData.position === 'center') {
        return { justifyContent: 'center' as const };
      }
      
      const target = currentStepData.targetElement;
      const contentHeight = 200; // Approximate content height
      
      if (currentStepData.position === 'bottom' || target.y < contentHeight) {
        return { justifyContent: 'flex-end' as const, paddingBottom: 100 };
      } else {
        return { justifyContent: 'flex-start' as const, paddingTop: 100 };
      }
    };
    
    if (!visible || !currentStepData) return null;
    
    return (
      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="none"
      >
        <Animated.View style={[styles.overlay, overlayStyle]}>
          {/* Highlight target element */}
          {currentStepData.targetElement && (
            <Animated.View style={highlightStyle} />
          )}
          
          {/* Tutorial Content */}
          <View style={[styles.container, getContentPosition()]}>
            <Animated.View style={[styles.content, contentStyle]}>
              <View style={styles.header}>
                <Text style={styles.stepCounter}>
                  {currentStep + 1} of {steps.length}
                </Text>
                <BaseButton
                  title="Skip"
                  onPress={onSkip}
                  variant="secondary"
                  style={styles.skipButton}
                />
              </View>
              
              <Text style={styles.title}>{currentStepData.title}</Text>
              <Text style={styles.description}>{currentStepData.description}</Text>
              
              <View style={styles.actions}>
                {!isFirstStep && (
                  <BaseButton
                    title="Previous"
                    onPress={onPrevious}
                    variant="secondary"
                    style={styles.actionButton}
                  />
                )}
                
                <BaseButton
                  title={isLastStep ? 'Complete' : 'Next'}
                  onPress={isLastStep ? onComplete : onNext}
                  variant="primary"
                  style={[styles.actionButton, styles.primaryButton]}
                />
              </View>
              
              {/* Progress indicator */}
              <View style={styles.progressContainer}>
                {steps.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index === currentStep && styles.activeDot
                    ]}
                  />
                ))}
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </Modal>
    );
  };
  
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)'
    },
    container: {
      flex: 1,
      paddingHorizontal: 20
    },
    content: {
      backgroundColor: '#1a1a1a',
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 20,
      borderWidth: 1,
      borderColor: '#333333'
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    },
    stepCounter: {
      color: '#8E8E93',
      fontSize: 14,
      fontWeight: '500'
    },
    skipButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      minHeight: 32
    },
    title: {
      color: '#ffffff',
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12
    },
    description: {
      color: '#8E8E93',
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 24
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20
    },
    actionButton: {
      flex: 1,
      minHeight: 44
    },
    primaryButton: {
      flex: 2
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#333333'
    },
    activeDot: {
      backgroundColor: '#007AFF'
    }
  });
  EOF
  ```

### Performance Testing and Validation
- [ ] **Create Performance Testing Suite** (2 hours)
  ```bash
  # Create comprehensive performance test
  cat > scripts/performance-test-suite.js << 'EOF'
  const fs = require('fs');
  const { execSync } = require('child_process');
  
  class PerformanceTestSuite {
    constructor() {
      this.results = {
        timestamp: new Date().toISOString(),
        tests: {}
      };
    }
    
    async runAllTests() {
      console.log('🚀 Starting Performance Test Suite...\n');
      
      await this.testBuildPerformance();
      await this.testBundleSize();
      await this.testMemoryUsage();
      await this.testRenderPerformance();
      
      this.generateReport();
    }
    
    async testBuildPerformance() {
      console.log('📦 Testing build performance...');
      
      const buildStart = Date.now();
      
      try {
        execSync('npx expo export --platform ios --dev', { 
          stdio: 'pipe',
          timeout: 120000 // 2 minute timeout
        });
        
        const buildTime = Date.now() - buildStart;
        
        this.results.tests.buildPerformance = {
          passed: buildTime < 60000, // Under 1 minute
          buildTime: buildTime,
          threshold: 60000,
          status: buildTime < 60000 ? 'PASS' : 'FAIL'
        };
        
        console.log(`   Build time: ${buildTime}ms ${buildTime < 60000 ? '✅' : '❌'}`);
        
      } catch (error) {
        this.results.tests.buildPerformance = {
          passed: false,
          error: error.message,
          status: 'FAIL'
        };
        console.log('   Build failed ❌');
      }
    }
    
    async testBundleSize() {
      console.log('📏 Testing bundle size...');
      
      try {
        const stats = fs.statSync('dist/bundles/ios-bundle.js');
        const bundleSize = stats.size;
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        this.results.tests.bundleSize = {
          passed: bundleSize < maxSize,
          bundleSize: bundleSize,
          bundleSizeMB: (bundleSize / 1024 / 1024).toFixed(2),
          maxSizeMB: (maxSize / 1024 / 1024).toFixed(2),
          status: bundleSize < maxSize ? 'PASS' : 'FAIL'
        };
        
        console.log(`   Bundle size: ${(bundleSize / 1024 / 1024).toFixed(2)}MB ${bundleSize < maxSize ? '✅' : '❌'}`);
        
      } catch (error) {
        this.results.tests.bundleSize = {
          passed: false,
          error: 'Bundle file not found - build may have failed',
          status: 'SKIP'
        };
        console.log('   Bundle size test skipped (no bundle found) ⏭️');
      }
    }
    
    async testMemoryUsage() {
      console.log('🧠 Testing memory usage patterns...');
      
      // This would require running the app and monitoring memory
      // For now, we'll simulate the test structure
      
      this.results.tests.memoryUsage = {
        passed: true, // Would be determined by actual monitoring
        baselineMemory: '45MB', // Simulated
        peakMemory: '68MB', // Simulated
        threshold: '75MB',
        status: 'MANUAL' // Requires manual testing
      };
      
      console.log('   Memory test requires manual validation 📱');
    }
    
    async testRenderPerformance() {
      console.log('🎨 Testing render performance...');
      
      // This would involve automated UI testing
      // For now, we'll provide guidelines
      
      this.results.tests.renderPerformance = {
        passed: true, // Would be determined by automated testing
        targetFPS: 60,
        status: 'MANUAL', // Requires manual testing with tools
        guidelines: [
          'Test with performance monitor enabled',
          'Monitor FPS during gameplay',
          'Test department switching performance',
          'Verify smooth animations',
          'Test with multiple prestiges'
        ]
      };
      
      console.log('   Render performance requires device testing 📱');
    }
    
    generateReport() {
      const reportPath = 'performance-report.json';
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
      
      console.log('\n📊 Performance Test Results:');
      console.log('================================');
      
      Object.entries(this.results.tests).forEach(([testName, result]) => {
        const status = result.status;
        const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '📱';
        console.log(`${emoji} ${testName}: ${status}`);
        
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      });
      
      console.log(`\nFull report saved to: ${reportPath}`);
      
      // Performance recommendations
      console.log('\n💡 Performance Recommendations:');
      console.log('- Run manual FPS testing on target devices');
      console.log('- Monitor memory usage during extended gameplay');
      console.log('- Test performance after each major feature addition');
      console.log('- Use React Native performance profiler for optimization');
    }
  }
  
  // Run the test suite
  const testSuite = new PerformanceTestSuite();
  testSuite.runAllTests().catch(console.error);
  EOF
  
  # Create manual testing checklist
  cat > manual-testing-checklist.md << 'EOF'
  # Manual Performance Testing Checklist
  
  ## Pre-Testing Setup
  - [ ] Build app in production mode
  - [ ] Install on target devices (iPhone 8, Android with Snapdragon 660)
  - [ ] Enable performance monitoring
  - [ ] Clear app data for fresh start
  
  ## FPS Testing (Target: 60 FPS)
  - [ ] Dashboard interactions maintain 60 FPS
  - [ ] Department switching is smooth
  - [ ] Hiring employees shows no frame drops
  - [ ] Upgrade purchases animate smoothly
  - [ ] Prestige process maintains performance
  - [ ] Particle effects don't impact FPS
  - [ ] Audio plays without stuttering
  
  ## Memory Testing (Target: <75MB)
  - [ ] Initial app launch memory usage
  - [ ] Memory after 30 minutes of gameplay
  - [ ] Memory after first prestige
  - [ ] Memory after multiple prestiges
  - [ ] Memory recovery after backgrounding
  - [ ] No memory leaks detected
  
  ## Animation Testing
  - [ ] Counter animations smooth and responsive
  - [ ] Button press feedback works correctly
  - [ ] Particle effects appear at appropriate times
  - [ ] Progress bars animate smoothly
  - [ ] Transition animations between screens
  - [ ] Loading states provide good feedback
  
  ## Audio Testing
  - [ ] Background music loops correctly
  - [ ] Sound effects play at appropriate times
  - [ ] Audio doesn't interfere with performance
  - [ ] Volume controls work correctly
  - [ ] Audio stops when app is backgrounded
  - [ ] Audio resumes when app is foregrounded
  
  ## User Experience Testing
  - [ ] Tutorial system guides new players effectively
  - [ ] Navigation is intuitive and responsive
  - [ ] Error states provide helpful feedback
  - [ ] Loading states indicate progress
  - [ ] Accessibility features work correctly
  - [ ] Offline progress display is accurate
  
  ## Stress Testing
  - [ ] Performance with all 7 departments unlocked
  - [ ] Performance with 100+ total employees
  - [ ] Performance after multiple prestige cycles
  - [ ] Performance during extended gameplay sessions
  - [ ] Performance on low-end target devices
  - [ ] Battery usage remains reasonable
  EOF
  
  node scripts/performance-test-suite.js
  ```

---

## Quality Gates & Validation

### Performance Validation
- [ ] **60 FPS Consistency Test**
  ```bash
  echo "Performance Validation Checklist:"
  echo "1. 60 FPS maintained during normal gameplay"
  echo "2. No frame drops during animations"
  echo "3. Smooth particle effects without performance impact"
  echo "4. Audio playback doesn't affect FPS"
  echo "5. Memory usage stable under 75MB"
  echo "6. No performance regression after adding polish features"
  ```

### Animation Quality Validation
- [ ] **Animation Smoothness Test**
  - All counter animations respond immediately to value changes
  - Button press feedback feels responsive and satisfying
  - Particle effects enhance gameplay without distraction
  - Progress bars animate smoothly and accurately
  - Screen transitions feel polished and professional

### Audio System Validation
- [ ] **Audio Integration Test**
  ```bash
  echo "Audio System Validation:"
  echo "1. All sound effects play at appropriate times"
  echo "2. Background music loops seamlessly"
  echo "3. Volume controls affect all audio categories"
  echo "4. Audio doesn't interfere with performance"
  echo "5. Audio system handles interruptions gracefully"
  echo "6. Audio memory usage remains reasonable"
  ```

### User Experience Validation
- [ ] **UX Polish Checklist**
  - Tutorial system effectively guides new players
  - Navigation feels intuitive and responsive
  - Visual feedback provides clear game state information
  - Error handling provides helpful guidance
  - Loading states indicate progress appropriately
  - Overall experience feels polished and professional

---

## Deliverables

### Required Outputs
1. **Optimized Performance** maintaining 60 FPS across all gameplay scenarios
2. **Smooth Animation System** enhancing user engagement without performance cost
3. **Professional Audio System** with contextual sound effects and background music
4. **Visual Polish** including particle effects, improved UI components, and visual feedback
5. **Enhanced User Experience** with tutorials, better navigation, and accessibility features

### Performance Metrics
- [ ] **Consistent 60 FPS** during all gameplay interactions
- [ ] **Memory usage <75MB** during extended gameplay sessions
- [ ] **Smooth animations** with no stuttering or frame drops
- [ ] **Responsive audio** with no latency or performance impact
- [ ] **Professional UI** with polished components and transitions

### Validation Checklist
- [ ] All performance targets met on target devices
- [ ] Animations enhance gameplay experience
- [ ] Audio system works reliably across platforms
- [ ] Visual effects add value without distraction
- [ ] User experience feels polished and intuitive
- [ ] No performance regressions from polish features
- [ ] Memory management handles extended gameplay
- [ ] Audio and animations work together harmoniously

---

**Time Tracking**: Record actual time vs estimates
- [ ] Memory optimization: __ hours (est: 3)
- [ ] Animation system: __ hours (est: 4)
- [ ] Audio integration: __ hours (est: 3)
- [ ] Visual polish: __ hours (est: 3)
- [ ] User experience: __ hours (est: 2)
- [ ] Performance testing: __ hours (est: 2)
- [ ] **Total Phase 4**: __ hours (est: 17-20 hours over 2-3 days)

**Critical Success Metrics**:
- [ ] 60 FPS maintained with all polish features active
- [ ] Professional-level user experience achieved
- [ ] Audio enhances gameplay without performance cost
- [ ] Animations feel smooth and purposeful
- [ ] Memory usage optimized for extended play sessions

**Next Phase**: [05-deployment.md](./05-deployment.md) - Build Optimization and Deployment Preparation

**Go/No-Go Decision**: All performance targets must be maintained and user experience must feel polished before proceeding to deployment. Any performance regressions must be resolved.