# PetSoft Tycoon: Technical Requirements Document
## Advanced Mobile Idle Game Implementation

### Document Information
- **Product**: PetSoft Tycoon
- **Version**: 1.0 MVP
- **Date**: August 2025
- **Status**: Implementation Ready
- **Derived From**: Advanced PRD v1.0
- **Target Platforms**: iOS 12+, Android 8+ (API 26+)

---

## Executive Technical Summary

PetSoft Tycoon is a premium mobile idle game built with React Native (0.76+) and Expo SDK 52, utilizing Legend State v3 (@beta) for reactive state management. The application must maintain 60 FPS performance on 5-year-old devices while providing exceptional user experience through smooth animations, responsive controls, and intelligent offline progression.

### Key Technical Constraints
- **Performance**: 60 FPS minimum, <50ms input response
- **Memory**: <200MB RAM consumption on target devices
- **Storage**: <100MB total app size after installation
- **Load Time**: <3 seconds from launch to gameplay
- **Battery**: <5% drain per 30-minute session
- **Offline**: 12-hour progression cap with instant catchup

---

## Architecture Specifications

### Core Technology Stack

```typescript
// Primary Dependencies (package.json)
{
  "expo": "~52.0.0",                    // Latest SDK with New Architecture
  "react-native": "0.76.0",             // Fabric + TurboModules
  "@legendapp/state": "^3.0.0-beta.0",  // Reactive state management
  "react-native-reanimated": "~4.0.0",  // 60fps animations
  "expo-av": "~14.0.0",                 // Audio system
  "expo-haptics": "~13.0.0",            // Tactile feedback
  "react-native-safe-area-context": "4.14.0",
  "@expo/vector-icons": "^14.0.0"
}
```

### Project Structure (Vertical Slicing)

```
/projects/pet-software-idler/
├── PetSoftTycoon/                  # Application root
│   ├── app/                        # Expo Router (file-based)
│   │   ├── (tabs)/                 # Tab navigation
│   │   │   ├── _layout.tsx         # Tab layout
│   │   │   ├── index.tsx           # Game screen
│   │   │   ├── departments.tsx     # Department details
│   │   │   ├── achievements.tsx    # Progress tracking
│   │   │   └── settings.tsx        # App settings
│   │   ├── _layout.tsx             # Root layout
│   │   └── +not-found.tsx          # Error boundary
│   ├── src/
│   │   ├── core/                   # Core game systems
│   │   │   ├── services/           # Game loop, save/load
│   │   │   └── state/              # Global game state
│   │   ├── features/               # Feature modules (vertical)
│   │   │   ├── departments/        # Department management
│   │   │   │   ├── components/     # UI components
│   │   │   │   ├── state/          # Department state
│   │   │   │   └── services/       # Department logic
│   │   │   ├── employees/          # Employee management
│   │   │   ├── prestige/           # Investor rounds
│   │   │   ├── achievements/       # Achievement system
│   │   │   └── audio/              # Audio management
│   │   ├── shared/                 # Shared utilities
│   │   │   ├── components/         # Reusable UI
│   │   │   ├── constants/          # Game configuration
│   │   │   ├── hooks/              # Custom hooks
│   │   │   └── utils/              # Helper functions
│   │   └── types/                  # TypeScript definitions
│   ├── assets/                     # Images, audio, fonts
│   ├── eas.json                    # Build configuration
│   ├── app.json                    # Expo configuration
│   ├── metro.config.js             # Bundler configuration
│   └── tsconfig.json               # TypeScript configuration
```

### State Management Architecture (Legend State v3)

```typescript
// Core state structure using Legend State
// src/core/state/gameState.ts
import { observable, computed } from '@legendapp/state';

interface GameState {
  resources: ResourcesState;
  departments: DepartmentState[];
  progression: ProgressionState;
  settings: SettingsState;
  offline: OfflineState;
}

export const gameState = observable<GameState>({
  resources: {
    linesOfCode: 0,
    features: { basic: 0, advanced: 0, premium: 0 },
    money: 0,
    customerLeads: 0,
    reputation: 0
  },
  departments: [
    // Department configurations loaded from constants
  ],
  progression: {
    totalEarnings: 0,
    prestigePoints: 0,
    currentPrestigeLevel: 0,
    achievementsUnlocked: [],
    statisticsTracking: {}
  },
  settings: {
    audioEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: true,
    performanceMode: 'auto'
  },
  offline: {
    lastSaveTime: Date.now(),
    offlineEarnings: 0,
    maxOfflineHours: 12
  }
});

// Performance-optimized computed values
export const gameComputed = {
  // Total production per second across all departments
  totalProductionPerSecond: computed(() => {
    return gameState.departments.get().reduce((total, dept) => {
      return total + dept.employees.reduce((deptTotal, emp) => 
        deptTotal + (emp.count * emp.baseProduction * emp.multiplier), 0);
    }, 0);
  }),
  
  // Department efficiency multipliers
  departmentEfficiency: computed(() => {
    const deps = gameState.departments.get();
    return deps.map(dept => ({
      id: dept.id,
      efficiency: calculateDepartmentEfficiency(dept)
    }));
  }),
  
  // Next unlock requirements
  nextUnlocks: computed(() => {
    return calculateNextUnlocks(gameState.resources.money.get());
  })
};
```

### Component Hierarchy & Organization

```typescript
// Feature-based component organization
// src/features/departments/components/DepartmentView.tsx
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { departmentStore } from '../state/departmentStore';

interface DepartmentViewProps {
  departmentId: string;
}

export const DepartmentView = memo<DepartmentViewProps>(({ departmentId }) => {
  // Legend State reactive subscriptions
  const department = departmentStore.departments[departmentId].use();
  const efficiency = departmentStore.efficiency[departmentId].use();
  
  return (
    <View style={styles.container}>
      <DepartmentHeader department={department} />
      <EmployeeList 
        employees={department.employees}
        onHire={handleEmployeeHire}
        onUpgrade={handleEmployeeUpgrade}
      />
      <EfficiencyMeter value={efficiency} />
    </View>
  );
});

// Reusable UI components with performance optimization
// src/shared/components/AnimatedButton.tsx
import React, { memo, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from 'react-native-reanimated';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
}

export const AnimatedButton = memo<AnimatedButtonProps>(({
  title, onPress, disabled = false, style
}) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  const handlePress = useCallback(() => {
    if (disabled) return;
    
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
      runOnJS(onPress)();
    });
  }, [disabled, onPress]);
  
  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled}>
      <Animated.View style={[styles.button, animatedStyle, style]}>
        <Text style={[styles.text, disabled && styles.disabled]}>
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
});
```

---

## Performance Requirements & Optimization

### Target Performance Metrics

| Metric | Target | Critical Threshold | Measurement Method |
|--------|--------|-------------------|-------------------|
| Frame Rate | 60 FPS | 55 FPS minimum | React DevTools Profiler |
| Input Response | <50ms | <100ms maximum | Touch event to visual feedback |
| Memory Usage | <200MB | <300MB maximum | Flipper Memory tab |
| CPU Usage | <15% | <25% maximum | Device performance monitor |
| Bundle Size | <50MB | <75MB maximum | Expo build analyzer |
| Startup Time | <3s | <5s maximum | App launch to interaction |
| Battery Drain | <5% | <8% per 30min | Device battery monitor |

### Game Loop Optimization

```typescript
// High-performance game loop implementation
// src/core/services/gameLoop.ts
import { Observable } from '@legendapp/state';

class GameLoop {
  private frameId: number = 0;
  private lastUpdate: number = 0;
  private readonly TARGET_FPS = 60;
  private readonly FRAME_TIME = 1000 / this.TARGET_FPS;
  
  // Performance monitoring
  private frameTimeHistory: number[] = [];
  private performanceMode: 'high' | 'balanced' | 'battery' = 'balanced';
  
  start() {
    this.lastUpdate = Date.now();
    this.loop();
  }
  
  private loop = () => {
    const now = Date.now();
    const deltaTime = now - this.lastUpdate;
    
    // Track frame performance
    this.trackFrameTime(deltaTime);
    
    // Adaptive performance scaling
    this.adjustPerformanceMode();
    
    // Update game state (optimized for 60fps)
    this.updateGameState(deltaTime);
    
    this.lastUpdate = now;
    this.frameId = requestAnimationFrame(this.loop);
  };
  
  private updateGameState(deltaTime: number) {
    // Batch state updates for performance
    Observable.batch(() => {
      // Resource production calculations
      this.updateResourceProduction(deltaTime);
      
      // Department efficiency calculations
      this.updateDepartmentEfficiencies();
      
      // Achievement progress checks (throttled)
      if (this.frameId % 30 === 0) { // Check every 30 frames (0.5s)
        this.checkAchievements();
      }
      
      // Auto-save (every 30 seconds)
      if (this.frameId % 1800 === 0) { // 30s at 60fps
        this.triggerAutoSave();
      }
    });
  }
  
  private trackFrameTime(deltaTime: number) {
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }
  }
  
  private adjustPerformanceMode() {
    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) 
                         / this.frameTimeHistory.length;
    
    if (avgFrameTime > 20 && this.performanceMode !== 'battery') {
      // Dropping below 50fps, reduce visual effects
      this.performanceMode = 'battery';
      gameState.settings.performanceMode.set('battery');
    } else if (avgFrameTime < 12 && this.performanceMode !== 'high') {
      // Smooth performance, enable full effects
      this.performanceMode = 'high';
      gameState.settings.performanceMode.set('high');
    }
  }
}

// Optimized resource production calculations
class ProductionCalculator {
  static calculateDepartmentProduction(department: Department): number {
    // Use memoization for expensive calculations
    return this.memoizedCalculation(department.id, () => {
      return department.employees.reduce((total, employee) => {
        const baseProduction = employee.baseProduction * employee.count;
        const multiplier = this.calculateMultiplier(employee, department);
        return total + (baseProduction * multiplier);
      }, 0);
    });
  }
  
  private static memoizedCalculation(key: string, calculation: () => number): number {
    // Simple memoization with cache invalidation
    if (!this.cache[key] || this.shouldInvalidateCache(key)) {
      this.cache[key] = {
        value: calculation(),
        timestamp: Date.now()
      };
    }
    return this.cache[key].value;
  }
}
```

### Memory Management

```typescript
// Memory-efficient list rendering
// src/shared/components/VirtualizedList.tsx
import React, { memo, useMemo, useCallback } from 'react';
import { FlatList, ListRenderItem } from 'react-native';

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  itemHeight: number;
}

export const VirtualizedList = memo<VirtualizedListProps<any>>(({
  data, renderItem, keyExtractor, itemHeight
}) => {
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }), [itemHeight]);
  
  const memoizedRenderItem = useCallback(renderItem, []);
  
  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
    />
  );
});
```

---

## Data Models & State Structure

### Core Data Types

```typescript
// src/types/gameTypes.ts
export interface GameState {
  resources: ResourcesState;
  departments: DepartmentState[];
  progression: ProgressionState;
  settings: SettingsState;
  offline: OfflineState;
}

export interface ResourcesState {
  linesOfCode: number;
  features: {
    basic: number;
    advanced: number;
    premium: number;
  };
  money: number;
  customerLeads: number;
  reputation: number;
  // Department-specific resources
  polishPoints: number;
  qualityScore: number;
  brandAwareness: number;
}

export interface DepartmentState {
  id: DepartmentId;
  name: string;
  unlocked: boolean;
  employees: EmployeeState[];
  upgrades: UpgradeState[];
  efficiency: number;
  managerHired: boolean;
  totalProduction: number;
}

export interface EmployeeState {
  id: string;
  type: EmployeeType;
  count: number;
  baseProduction: number;
  baseCost: number;
  currentCost: number;
  multiplier: number;
  unlocked: boolean;
}

export interface ProgressionState {
  totalEarnings: number;
  prestigePoints: number;
  currentPrestigeLevel: number;
  achievementsUnlocked: string[];
  statisticsTracking: {
    totalClicks: number;
    totalPlayTime: number;
    prestigeCount: number;
    departmentsUnlocked: number;
    employeesHired: number;
  };
}

// Department-specific types
export type DepartmentId = 
  | 'development' 
  | 'sales' 
  | 'customerExperience' 
  | 'product' 
  | 'design' 
  | 'qa' 
  | 'marketing';

export type EmployeeType = 
  | 'junior' 
  | 'mid' 
  | 'senior' 
  | 'lead' 
  | 'director' 
  | 'vp';
```

### State Management Implementation

```typescript
// Department-specific state management
// src/features/departments/state/departmentStore.ts
import { observable, computed } from '@legendapp/state';
import { DEPARTMENT_CONFIG } from '@/shared/constants/gameConfig';

interface DepartmentStoreState {
  departments: Record<DepartmentId, DepartmentState>;
  activeTab: DepartmentId;
  purchaseQueue: PurchaseAction[];
}

export const departmentStore = observable<DepartmentStoreState>({
  departments: Object.keys(DEPARTMENT_CONFIG).reduce((acc, id) => {
    acc[id as DepartmentId] = createInitialDepartmentState(id as DepartmentId);
    return acc;
  }, {} as Record<DepartmentId, DepartmentState>),
  
  activeTab: 'development',
  purchaseQueue: []
});

// Computed values for performance
export const departmentComputed = {
  // Calculate total production for each department
  departmentProduction: computed(() => {
    const deps = departmentStore.departments.get();
    return Object.entries(deps).reduce((acc, [id, dept]) => {
      acc[id as DepartmentId] = calculateDepartmentProduction(dept);
      return acc;
    }, {} as Record<DepartmentId, number>);
  }),
  
  // Calculate department synergy bonuses
  synergyBonuses: computed(() => {
    const deps = departmentStore.departments.get();
    return calculateSynergyBonuses(deps);
  }),
  
  // Check affordable purchases
  affordablePurchases: computed(() => {
    const money = gameState.resources.money.get();
    const deps = departmentStore.departments.get();
    
    return Object.entries(deps).reduce((acc, [deptId, dept]) => {
      acc[deptId as DepartmentId] = dept.employees.filter(emp => 
        emp.currentCost <= money && emp.unlocked
      );
      return acc;
    }, {} as Record<DepartmentId, EmployeeState[]>);
  })
};

// Action creators for state mutations
export const departmentActions = {
  hireEmployee: (departmentId: DepartmentId, employeeId: string) => {
    const department = departmentStore.departments[departmentId];
    const employee = department.employees.find(e => e.id === employeeId);
    
    if (employee && gameState.resources.money.get() >= employee.currentCost) {
      // Update state atomically
      Observable.batch(() => {
        // Deduct cost
        gameState.resources.money.set(prev => prev - employee.currentCost);
        
        // Increase count
        employee.count.set(prev => prev + 1);
        
        // Update cost (exponential scaling)
        employee.currentCost.set(prev => 
          Math.floor(prev * COST_MULTIPLIER)
        );
        
        // Trigger achievement checks
        achievementActions.checkEmployeeAchievements(departmentId, employeeId);
        
        // Update statistics
        gameState.progression.statisticsTracking.employeesHired.set(prev => prev + 1);
      });
    }
  },
  
  purchaseUpgrade: (departmentId: DepartmentId, upgradeId: string) => {
    const department = departmentStore.departments[departmentId];
    const upgrade = department.upgrades.find(u => u.id === upgradeId);
    
    if (upgrade && !upgrade.purchased && 
        gameState.resources.money.get() >= upgrade.cost) {
      
      Observable.batch(() => {
        gameState.resources.money.set(prev => prev - upgrade.cost);
        upgrade.purchased.set(true);
        
        // Apply upgrade effects
        applyUpgradeEffects(departmentId, upgrade);
        
        // Check for unlock cascades
        checkUpgradeUnlocks(departmentId);
      });
    }
  },
  
  hireManager: (departmentId: DepartmentId) => {
    const department = departmentStore.departments[departmentId];
    const managerCost = MANAGER_COSTS[departmentId];
    
    if (!department.managerHired && 
        gameState.resources.money.get() >= managerCost) {
      
      Observable.batch(() => {
        gameState.resources.money.set(prev => prev - managerCost);
        department.managerHired.set(true);
        
        // Enable automation
        startDepartmentAutomation(departmentId);
      });
    }
  }
};
```

---

## Animation System (React Native Reanimated 3)

### Core Animation Principles

```typescript
// Smooth 60fps animations with Reanimated 3
// src/shared/components/animations/NumberCounter.tsx
import React, { memo, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

interface NumberCounterProps {
  value: number;
  duration?: number;
  style?: any;
  formatValue?: (value: number) => string;
}

export const NumberCounter = memo<NumberCounterProps>(({
  value, duration = 300, style, formatValue = (v) => v.toString()
}) => {
  const animatedValue = useSharedValue(0);
  const scale = useSharedValue(1);
  
  useEffect(() => {
    // Animate number change with scale bounce
    scale.value = withSequence(
      withSpring(1.1, { duration: 100 }),
      withSpring(1, { duration: 200 })
    );
    
    animatedValue.value = withSpring(value, {
      duration,
      dampingRatio: 0.8
    });
  }, [value]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  const textStyle = useAnimatedStyle(() => {
    const displayValue = Math.floor(animatedValue.value);
    return {
      // Text color animation based on value changes
      color: interpolate(
        scale.value,
        [1, 1.1],
        [0x333333, 0x00AA00], // Dark to green
        'extend'
      )
    };
  });
  
  return (
    <Animated.View style={animatedStyle}>
      <Animated.Text style={[styles.text, style, textStyle]}>
        {formatValue(Math.floor(animatedValue.value))}
      </Animated.Text>
    </Animated.View>
  );
});

// Particle system for celebrations
// src/features/audio/components/ParticleSystem.tsx
import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  runOnJS
} from 'react-native-reanimated';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

interface ParticleSystemProps {
  active: boolean;
  particleCount: number;
  duration: number;
  colors: string[];
}

export const ParticleSystem = memo<ParticleSystemProps>(({
  active, particleCount, duration, colors
}) => {
  const particles = useRef<Particle[]>([]);
  const animationFrame = useSharedValue(0);
  
  useEffect(() => {
    if (active) {
      // Initialize particles
      particles.current = Array.from({ length: particleCount }, (_, i) => ({
        id: `particle-${i}`,
        x: Math.random() * Dimensions.get('window').width,
        y: Dimensions.get('window').height,
        vx: (Math.random() - 0.5) * 200,
        vy: -Math.random() * 300 - 100,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0
      }));
      
      // Start animation
      animationFrame.value = withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.linear
        }),
        1,
        false,
        () => runOnJS(cleanupParticles)()
      );
    }
    
    return () => {
      cancelAnimation(animationFrame);
    };
  }, [active]);
  
  const cleanupParticles = () => {
    particles.current = [];
  };
  
  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map(particle => (
        <ParticleRenderer 
          key={particle.id}
          particle={particle}
          animationProgress={animationFrame}
        />
      ))}
    </View>
  );
});

// Individual particle renderer
const ParticleRenderer = memo<{
  particle: Particle;
  animationProgress: Animated.SharedValue<number>;
}>(({ particle, animationProgress }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const progress = animationProgress.value;
    const x = particle.x + (particle.vx * progress);
    const y = particle.y + (particle.vy * progress) + (0.5 * 500 * progress * progress); // Gravity
    const opacity = 1 - progress;
    
    return {
      position: 'absolute',
      left: x,
      top: y,
      width: particle.size,
      height: particle.size,
      backgroundColor: particle.color,
      borderRadius: particle.size / 2,
      opacity,
      transform: [
        { scale: 1 - progress * 0.5 }
      ]
    };
  });
  
  return <Animated.View style={animatedStyle} />;
});

// UI transition animations
// src/shared/components/animations/SlideInPanel.tsx
export const SlideInPanel = memo<{
  visible: boolean;
  children: React.ReactNode;
  direction: 'left' | 'right' | 'up' | 'down';
}>(({ visible, children, direction }) => {
  const translateX = useSharedValue(direction === 'left' ? -300 : direction === 'right' ? 300 : 0);
  const translateY = useSharedValue(direction === 'up' ? -300 : direction === 'down' ? 300 : 0);
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    if (visible) {
      translateX.value = withSpring(0, { dampingRatio: 0.8 });
      translateY.value = withSpring(0, { dampingRatio: 0.8 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      const targetX = direction === 'left' ? -300 : direction === 'right' ? 300 : 0;
      const targetY = direction === 'up' ? -300 : direction === 'down' ? 300 : 0;
      
      translateX.value = withSpring(targetX);
      translateY.value = withSpring(targetY);
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value }
    ],
    opacity: opacity.value
  }));
  
  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
});
```

---

## Audio System Requirements (expo-av)

### Audio Architecture

```typescript
// Comprehensive audio management system
// src/features/audio/services/AudioManager.ts
import { Audio, AVPlaybackStatus } from 'expo-av';
import { gameState } from '@/core/state/gameState';

interface AudioConfig {
  volume: number;
  loop: boolean;
  maxInstances?: number;
  cooldown?: number;
}

interface SoundInstance {
  sound: Audio.Sound;
  lastPlayed: number;
  isPlaying: boolean;
}

class AudioManager {
  private sounds: Map<string, SoundInstance[]> = new Map();
  private soundConfig: Map<string, AudioConfig> = new Map();
  private masterVolume: number = 1.0;
  private audioEnabled: boolean = true;
  
  async initialize() {
    // Configure audio session
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false
    });
    
    // Load and configure all sound effects
    await this.loadSounds();
    
    // Subscribe to settings changes
    gameState.settings.audioEnabled.subscribe(enabled => {
      this.audioEnabled = enabled;
      if (!enabled) {
        this.stopAllSounds();
      }
    });
  }
  
  private async loadSounds() {
    const soundConfigs = {
      // Core gameplay sounds
      'click': {
        file: require('@/assets/audio/click.mp3'),
        config: { volume: 0.3, loop: false, maxInstances: 5, cooldown: 50 }
      },
      'purchase': {
        file: require('@/assets/audio/purchase.mp3'),
        config: { volume: 0.5, loop: false, maxInstances: 3, cooldown: 100 }
      },
      'levelUp': {
        file: require('@/assets/audio/levelup.mp3'),
        config: { volume: 0.7, loop: false, maxInstances: 2, cooldown: 500 }
      },
      'achievement': {
        file: require('@/assets/audio/achievement.mp3'),
        config: { volume: 0.8, loop: false, maxInstances: 1, cooldown: 1000 }
      },
      'prestige': {
        file: require('@/assets/audio/prestige.mp3'),
        config: { volume: 1.0, loop: false, maxInstances: 1, cooldown: 2000 }
      },
      
      // Ambient sounds
      'office_ambient': {
        file: require('@/assets/audio/office_ambient.mp3'),
        config: { volume: 0.2, loop: true, maxInstances: 1 }
      },
      'keyboard_typing': {
        file: require('@/assets/audio/keyboard.mp3'),
        config: { volume: 0.1, loop: false, maxInstances: 3, cooldown: 200 }
      }
    };
    
    for (const [soundId, { file, config }] of Object.entries(soundConfigs)) {
      await this.loadSound(soundId, file, config);
    }
  }
  
  private async loadSound(soundId: string, file: any, config: AudioConfig) {
    const instances: SoundInstance[] = [];
    const maxInstances = config.maxInstances || 1;
    
    // Pre-load multiple instances for frequently used sounds
    for (let i = 0; i < maxInstances; i++) {
      const { sound } = await Audio.Sound.createAsync(file, {
        shouldPlay: false,
        isLooping: config.loop,
        volume: config.volume
      });
      
      instances.push({
        sound,
        lastPlayed: 0,
        isPlaying: false
      });
    }
    
    this.sounds.set(soundId, instances);
    this.soundConfig.set(soundId, config);
  }
  
  playSound(soundId: string, volume?: number, pitch?: number) {
    if (!this.audioEnabled) return;
    
    const instances = this.sounds.get(soundId);
    const config = this.soundConfig.get(soundId);
    
    if (!instances || !config) {
      console.warn(`Sound ${soundId} not found`);
      return;
    }
    
    // Check cooldown
    const now = Date.now();
    const lastPlayTime = Math.max(...instances.map(i => i.lastPlayed));
    if (config.cooldown && (now - lastPlayTime) < config.cooldown) {
      return;
    }
    
    // Find available instance
    const availableInstance = instances.find(instance => !instance.isPlaying);
    if (!availableInstance) {
      // All instances busy, stop oldest
      const oldestInstance = instances.reduce((oldest, current) => 
        current.lastPlayed < oldest.lastPlayed ? current : oldest
      );
      await oldestInstance.sound.stopAsync();
      availableInstance = oldestInstance;
    }
    
    if (availableInstance) {
      this.playInstance(availableInstance, volume || config.volume, pitch);
    }
  }
  
  private async playInstance(instance: SoundInstance, volume: number, pitch?: number) {
    try {
      instance.isPlaying = true;
      instance.lastPlayed = Date.now();
      
      await instance.sound.setVolumeAsync(volume * this.masterVolume);
      
      if (pitch) {
        await instance.sound.setRateAsync(pitch, true);
      }
      
      const status = await instance.sound.playAsync();
      
      // Set up completion callback
      instance.sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          instance.isPlaying = false;
        }
      });
      
    } catch (error) {
      console.error(`Error playing sound:`, error);
      instance.isPlaying = false;
    }
  }
  
  // Dynamic audio feedback based on game state
  playContextualSound(action: string, context: any) {
    switch (action) {
      case 'hire_employee':
        // Vary pitch based on employee level
        const pitch = 1 + (context.employeeLevel * 0.1);
        this.playSound('purchase', undefined, pitch);
        break;
        
      case 'earn_money':
        // Volume based on amount earned
        const volume = Math.min(0.8, context.amount / 1000);
        this.playSound('click', volume);
        break;
        
      case 'department_unlock':
        this.playSound('levelUp');
        // Add ambient sound for new department
        this.playSound('office_ambient');
        break;
        
      case 'milestone_reached':
        this.playSound('achievement');
        // Trigger success particle effect
        break;
    }
  }
  
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    // Update all currently loaded sounds
    this.sounds.forEach((instances) => {
      instances.forEach(async (instance) => {
        const config = this.soundConfig.get('defaultVolume') || { volume: 1.0 };
        await instance.sound.setVolumeAsync(config.volume * this.masterVolume);
      });
    });
  }
  
  async stopAllSounds() {
    for (const instances of this.sounds.values()) {
      for (const instance of instances) {
        if (instance.isPlaying) {
          await instance.sound.stopAsync();
          instance.isPlaying = false;
        }
      }
    }
  }
  
  async cleanup() {
    await this.stopAllSounds();
    
    for (const instances of this.sounds.values()) {
      for (const instance of instances) {
        await instance.sound.unloadAsync();
      }
    }
    
    this.sounds.clear();
    this.soundConfig.clear();
  }
}

export const audioManager = new AudioManager();
```

---

## Save/Load System Implementation

### Data Persistence Architecture

```typescript
// Robust save/load system with validation
// src/core/services/SaveSystem.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameState, GameState } from '@/core/state/gameState';
import { compress, decompress } from 'lz-string';

interface SaveData {
  version: string;
  timestamp: number;
  gameState: GameState;
  checksum: string;
}

interface SaveOptions {
  compress: boolean;
  backup: boolean;
  validate: boolean;
}

class SaveSystem {
  private readonly SAVE_KEY = 'petsoft_tycoon_save';
  private readonly BACKUP_KEY = 'petsoft_tycoon_backup';
  private readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds
  private readonly MAX_SAVE_SIZE = 1024 * 1024; // 1MB limit
  
  private autoSaveTimer?: NodeJS.Timeout;
  private lastSaveTime: number = 0;
  private saveInProgress: boolean = false;
  
  initialize() {
    // Set up auto-save
    this.startAutoSave();
    
    // Save on app state changes
    this.setupAppStateHandlers();
  }
  
  async saveGame(options: Partial<SaveOptions> = {}): Promise<boolean> {
    if (this.saveInProgress) return false;
    
    const opts: SaveOptions = {
      compress: true,
      backup: true,
      validate: true,
      ...options
    };
    
    try {
      this.saveInProgress = true;
      
      // Create save data
      const saveData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        gameState: gameState.get(),
        checksum: ''
      };
      
      // Generate checksum for integrity
      if (opts.validate) {
        saveData.checksum = await this.generateChecksum(saveData.gameState);
      }
      
      // Serialize and optionally compress
      let serializedData = JSON.stringify(saveData);
      if (opts.compress) {
        serializedData = compress(serializedData);
      }
      
      // Check size limits
      if (serializedData.length > this.MAX_SAVE_SIZE) {
        throw new Error('Save data exceeds maximum size limit');
      }
      
      // Create backup of current save
      if (opts.backup) {
        const currentSave = await AsyncStorage.getItem(this.SAVE_KEY);
        if (currentSave) {
          await AsyncStorage.setItem(this.BACKUP_KEY, currentSave);
        }
      }
      
      // Save to storage
      await AsyncStorage.setItem(this.SAVE_KEY, serializedData);
      
      this.lastSaveTime = Date.now();
      console.log('Game saved successfully');
      
      return true;
      
    } catch (error) {
      console.error('Save failed:', error);
      return false;
    } finally {
      this.saveInProgress = false;
    }
  }
  
  async loadGame(): Promise<boolean> {
    try {
      const savedData = await AsyncStorage.getItem(this.SAVE_KEY);
      if (!savedData) {
        console.log('No save data found, starting new game');
        return false;
      }
      
      // Try to parse the save data
      let saveData: SaveData;
      try {
        // Try decompression first
        const decompressed = decompress(savedData);
        saveData = JSON.parse(decompressed || savedData);
      } catch {
        // Fall back to raw JSON
        saveData = JSON.parse(savedData);
      }
      
      // Validate save data
      if (!this.validateSaveData(saveData)) {
        console.error('Save data validation failed');
        return await this.attemptRecovery();
      }
      
      // Check version compatibility
      if (!this.isVersionCompatible(saveData.version)) {
        console.log('Save version incompatible, attempting migration');
        saveData = await this.migrateSave(saveData);
      }
      
      // Calculate offline earnings
      const offlineTime = Date.now() - saveData.timestamp;
      const offlineEarnings = this.calculateOfflineEarnings(
        saveData.gameState, 
        offlineTime
      );
      
      // Apply save data to game state
      gameState.set({
        ...saveData.gameState,
        offline: {
          ...saveData.gameState.offline,
          offlineEarnings,
          lastSaveTime: saveData.timestamp
        }
      });
      
      console.log(`Game loaded successfully. Offline for ${Math.floor(offlineTime / 60000)} minutes`);
      return true;
      
    } catch (error) {
      console.error('Load failed:', error);
      return await this.attemptRecovery();
    }
  }
  
  private async attemptRecovery(): Promise<boolean> {
    try {
      console.log('Attempting to recover from backup...');
      
      const backupData = await AsyncStorage.getItem(this.BACKUP_KEY);
      if (!backupData) {
        console.log('No backup available');
        return false;
      }
      
      // Try to load backup
      const decompressed = decompress(backupData);
      const saveData: SaveData = JSON.parse(decompressed || backupData);
      
      if (this.validateSaveData(saveData)) {
        gameState.set(saveData.gameState);
        console.log('Successfully recovered from backup');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Backup recovery failed:', error);
      return false;
    }
  }
  
  private validateSaveData(saveData: SaveData): boolean {
    // Basic structure validation
    if (!saveData.gameState || !saveData.version || !saveData.timestamp) {
      return false;
    }
    
    // Checksum validation
    if (saveData.checksum) {
      const calculatedChecksum = this.generateChecksum(saveData.gameState);
      if (calculatedChecksum !== saveData.checksum) {
        console.warn('Checksum validation failed');
        return false;
      }
    }
    
    // Data integrity checks
    const state = saveData.gameState;
    if (typeof state.resources?.money !== 'number' || 
        state.resources.money < 0 || 
        !Array.isArray(state.departments)) {
      return false;
    }
    
    return true;
  }
  
  private calculateOfflineEarnings(gameState: GameState, offlineTime: number): number {
    const maxOfflineTime = gameState.offline?.maxOfflineHours * 3600000 || 43200000; // 12 hours
    const effectiveTime = Math.min(offlineTime, maxOfflineTime);
    
    // Calculate total production per second
    let totalProduction = 0;
    
    gameState.departments.forEach(dept => {
      if (dept.managerHired) { // Only automated departments work offline
        dept.employees.forEach(emp => {
          totalProduction += emp.count * emp.baseProduction * emp.multiplier;
        });
      }
    });
    
    // Apply offline efficiency penalty (50% of online production)
    return Math.floor(totalProduction * (effectiveTime / 1000) * 0.5);
  }
  
  private generateChecksum(gameState: GameState): string {
    // Simple hash function for data integrity
    const data = JSON.stringify(gameState);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
  
  private isVersionCompatible(version: string): boolean {
    // Version compatibility check
    const currentVersion = '1.0.0';
    return version === currentVersion;
  }
  
  private async migrateSave(saveData: SaveData): Promise<SaveData> {
    // Save migration logic for version updates
    console.log(`Migrating save from ${saveData.version} to 1.0.0`);
    
    // Apply migrations based on version differences
    const migratedState = { ...saveData.gameState };
    
    // Example migration: Add new fields that didn't exist in older versions
    if (!migratedState.progression?.statisticsTracking) {
      migratedState.progression = {
        ...migratedState.progression,
        statisticsTracking: {
          totalClicks: 0,
          totalPlayTime: 0,
          prestigeCount: 0,
          departmentsUnlocked: 1,
          employeesHired: 0
        }
      };
    }
    
    return {
      ...saveData,
      version: '1.0.0',
      gameState: migratedState
    };
  }
  
  private startAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      this.saveGame({ compress: true, backup: false, validate: false });
    }, this.AUTO_SAVE_INTERVAL);
  }
  
  private setupAppStateHandlers() {
    // Save when app goes to background
    // Implementation depends on React Native's AppState
  }
  
  async exportSave(): Promise<string> {
    const saveData = await AsyncStorage.getItem(this.SAVE_KEY);
    if (!saveData) throw new Error('No save data to export');
    
    return compress(saveData);
  }
  
  async importSave(compressedSave: string): Promise<boolean> {
    try {
      const decompressed = decompress(compressedSave);
      const saveData: SaveData = JSON.parse(decompressed);
      
      if (!this.validateSaveData(saveData)) {
        throw new Error('Invalid save data');
      }
      
      await AsyncStorage.setItem(this.SAVE_KEY, compressedSave);
      return await this.loadGame();
      
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }
  
  cleanup() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }
}

export const saveSystem = new SaveSystem();
```

---

## Cross-Platform Considerations

### iOS & Android Compatibility

```typescript
// Platform-specific optimizations and adaptations
// src/shared/utils/platformUtils.ts
import { Platform, Dimensions, StatusBar } from 'react-native';
import Constants from 'expo-constants';

export const PlatformUtils = {
  // Performance adaptations
  getOptimalSettings() {
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const isOldDevice = this.isOldDevice();
    
    return {
      // Animation settings
      enableParticles: !isOldDevice,
      particleCount: isOldDevice ? 20 : 50,
      animationDuration: isOldDevice ? 200 : 300,
      
      // Rendering settings
      maxRenderItems: isTablet ? 20 : 15,
      enableShadows: !isOldDevice,
      enableBlur: !isOldDevice && Platform.OS === 'ios',
      
      // Audio settings
      maxAudioChannels: isOldDevice ? 4 : 8,
      
      // Memory management
      aggressiveCleanup: isOldDevice,
      backgroundThrottling: isOldDevice ? 5000 : 10000 // ms
    };
  },
  
  isOldDevice(): boolean {
    if (Platform.OS === 'ios') {
      // Check iOS version and device capabilities
      const majorVersion = parseInt(Platform.Version as string, 10);
      return majorVersion < 14;
    } else {
      // Android API level check
      return Platform.Version < 28;
    }
  },
  
  getSafeAreaInsets() {
    const statusBarHeight = Platform.OS === 'ios' 
      ? Constants.statusBarHeight 
      : StatusBar.currentHeight || 0;
      
    return {
      top: statusBarHeight,
      bottom: Platform.OS === 'ios' ? 34 : 0, // iPhone X+ home indicator
      left: 0,
      right: 0
    };
  },
  
  // Haptic feedback with platform differences
  triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error') {
    if (Platform.OS === 'ios') {
      // iOS has more nuanced haptic options
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } else {
      // Android uses vibration patterns
      const patterns = {
        light: 50,
        medium: 100,
        heavy: 200,
        success: [100, 50, 100],
        error: [200, 100, 200]
      };
      
      const pattern = patterns[type];
      if (typeof pattern === 'number') {
        Vibration.vibrate(pattern);
      } else {
        Vibration.vibrate(pattern);
      }
    }
  }
};

// Platform-specific styling
// src/shared/styles/platformStyles.ts
import { StyleSheet, Platform } from 'react-native';

export const platformStyles = StyleSheet.create({
  // Shadow styles that work on both platforms
  cardShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  
  // Safe area handling
  safeContainer: {
    flex: 1,
    paddingTop: PlatformUtils.getSafeAreaInsets().top,
    paddingBottom: PlatformUtils.getSafeAreaInsets().bottom,
  },
  
  // Platform-specific button styles
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: Platform.OS === 'ios' ? 8 : 4,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    minHeight: 44, // iOS HIG minimum touch target
  },
  
  // Text styles with platform fonts
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
  },
  
  // Navigation styles
  headerStyle: {
    backgroundColor: Platform.OS === 'ios' ? '#F8F8F8' : '#2196F3',
    borderBottomWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
});

// Performance monitoring per platform
// src/shared/services/PerformanceMonitor.ts
class PerformanceMonitor {
  private frameDrops: number = 0;
  private memoryWarnings: number = 0;
  private lastMemoryCheck: number = Date.now();
  
  startMonitoring() {
    if (__DEV__) {
      // Development-only monitoring
      this.monitorFrameRate();
      this.monitorMemoryUsage();
    }
  }
  
  private monitorFrameRate() {
    // Use requestAnimationFrame to detect frame drops
    let lastFrame = Date.now();
    
    const checkFrame = () => {
      const now = Date.now();
      const frameDelta = now - lastFrame;
      
      if (frameDelta > 20) { // 50fps threshold
        this.frameDrops++;
        if (this.frameDrops > 10) {
          // Trigger performance mode adjustment
          gameState.settings.performanceMode.set('battery');
          console.warn('Performance degradation detected, switching to battery mode');
        }
      }
      
      lastFrame = now;
      requestAnimationFrame(checkFrame);
    };
    
    requestAnimationFrame(checkFrame);
  }
  
  private monitorMemoryUsage() {
    setInterval(() => {
      // Platform-specific memory checks
      if (Platform.OS === 'android') {
        // Android memory monitoring
        this.checkAndroidMemory();
      } else {
        // iOS memory monitoring
        this.checkIOSMemory();
      }
    }, 30000); // Check every 30 seconds
  }
  
  private checkAndroidMemory() {
    // Android-specific memory pressure detection
    // This would require native module implementation
  }
  
  private checkIOSMemory() {
    // iOS-specific memory pressure detection
    // This would require native module implementation
  }
}
```

---

## TypeScript Configuration

### Strict Mode Setup

```json
// tsconfig.json - Production-ready TypeScript configuration
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    // Strict type checking
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    
    // Modern JavaScript features
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    
    // Path mapping for clean imports
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/shared/components/*"],
      "@/features/*": ["src/features/*"],
      "@/core/*": ["src/core/*"],
      "@/types/*": ["src/types/*"],
      "@/assets/*": ["assets/*"]
    },
    
    // Output configuration
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "importHelpers": true,
    
    // React configuration
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    
    // Performance
    "skipLibCheck": true,
    "incremental": true
  },
  "include": [
    "src/**/*",
    "App.tsx",
    "app/**/*",
    "assets/**/*",
    "types/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ]
}
```

### Type Definitions

```typescript
// src/types/global.d.ts - Global type definitions
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      EXPO_DEV_CLIENT: string;
    }
  }
  
  // Extend Window for web-specific APIs
  interface Window {
    __PETSOFT_TYCOON_DEBUG__?: boolean;
  }
}

// Game-specific utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Type guards for runtime safety
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

// Branded types for IDs to prevent mixing
export type DepartmentId = string & { __brand: 'DepartmentId' };
export type EmployeeId = string & { __brand: 'EmployeeId' };
export type AchievementId = string & { __brand: 'AchievementId' };

// Helper to create branded types
export function createDepartmentId(id: string): DepartmentId {
  return id as DepartmentId;
}

export function createEmployeeId(id: string): EmployeeId {
  return id as EmployeeId;
}

// Event system types
export interface GameEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

export type EventHandler<T = any> = (event: GameEvent<T>) => void;

// Performance monitoring types
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  stateUpdateTime: number;
}
```

---

## Build Optimization Strategies

### EAS Build Configuration

```json
// eas.json - Optimized build configuration
{
  "cli": {
    "version": ">= 5.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true,
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      },
      "env": {
        "NODE_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "NODE_ENV": "production"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-large",
        "bundler": "metro"
      },
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      },
      "env": {
        "NODE_ENV": "production"
      }
    },
    "production-simulator": {
      "extends": "production",
      "ios": {
        "simulator": true,
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD1234EF"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json",
        "track": "production"
      }
    }
  }
}
```

### Metro Configuration for Performance

```javascript
// metro.config.js - Optimized bundler configuration
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable New Architecture support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Optimize bundle size
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Aggressive minification for production
    keep_fnames: false,
    mangle: {
      keep_fnames: false,
    },
    output: {
      comments: false,
    },
  },
  // Enable tree shaking
  enableBabelRCLookup: false,
  // Optimize asset handling
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

// Performance optimizations
config.serializer = {
  ...config.serializer,
  // Create separate chunks for better caching
  createModuleIdFactory: () => (path) => {
    // Stable module IDs for better caching
    let name = path
      .substr(__dirname.length + 1)
      .replace(/\//g, '_')
      .replace(/\./g, '')
      .replace(/-/g, '_');
    
    if (name.includes('node_modules')) {
      name = name.substr(name.indexOf('node_modules') + 'node_modules'.length + 1);
    }
    
    return name;
  },
};

// Asset optimization
config.resolver = {
  ...config.resolver,
  // Optimize image resolution
  assetExts: [
    ...config.resolver.assetExts,
    'webp', // Prefer WebP for smaller sizes
  ],
  // Source map optimization
  sourceExts: [
    ...config.resolver.sourceExts,
    'ts', 'tsx', 'js', 'jsx', 'json'
  ],
};

module.exports = config;
```

### App Configuration for Performance

```json
// app.json - Production-optimized configuration
{
  "expo": {
    "name": "PetSoft Tycoon",
    "slug": "petsoft-tycoon",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "platforms": ["ios", "android"],
    
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    
    "assetBundlePatterns": [
      "assets/images/**",
      "assets/audio/**",
      "assets/fonts/**"
    ],
    
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.petsofttycoon",
      "buildNumber": "1",
      "infoPlist": {
        "UIBackgroundModes": [],
        "NSCameraUsageDescription": "This app does not use the camera",
        "NSMicrophoneUsageDescription": "This app does not use the microphone"
      },
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.petsofttycoon",
      "versionCode": 1,
      "permissions": [],
      "blockedPermissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION"
      ]
    },
    
    "web": {
      "favicon": "./assets/favicon.png",
      "name": "PetSoft Tycoon",
      "shortName": "PetSoft",
      "description": "Build your pet software empire",
      "backgroundColor": "#ffffff",
      "themeColor": "#007AFF",
      "display": "standalone",
      "orientation": "portrait",
      "startUrl": "/",
      "bundler": "metro"
    },
    
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": true,
            "flipper": false
          },
          "android": {
            "newArchEnabled": true,
            "enableProguardInReleaseBuilds": true,
            "enableShrinkResourcesInReleaseBuilds": true
          }
        }
      ],
      "expo-router"
    ],
    
    "experiments": {
      "tsconfigPaths": true,
      "typedRoutes": true
    },
    
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### Package.json Scripts for Development

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "type-check": "tsc --noEmit",
    "build:eas": "eas build --platform all",
    "build:eas:ios": "eas build --platform ios",
    "build:eas:android": "eas build --platform android",
    "build:web": "expo export --platform web",
    "preview:ios": "eas build --profile preview --platform ios",
    "preview:android": "eas build --profile preview --platform android",
    "clean": "expo r -c",
    "clean:cache": "expo r -c && npm start -- --reset-cache",
    "doctor": "expo doctor",
    "upgrade": "expo install --fix",
    "analyze:bundle": "npx expo export --dump-assetmap && node scripts/analyze-bundle.js",
    "precommit": "npm run lint && npm run type-check && npm run test"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "@legendapp/state": "^3.0.0-beta.0",
    "react-native-reanimated": "~4.0.0",
    "expo-av": "~14.0.0",
    "expo-haptics": "~13.0.0",
    "expo-router": "~4.0.0",
    "react-native-safe-area-context": "4.14.0",
    "@expo/vector-icons": "^14.0.0",
    "@react-native-async-storage/async-storage": "~2.1.0",
    "lz-string": "^1.5.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~18.3.0",
    "@types/react-native": "~0.73.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "eslint-config-expo": "^7.0.0",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.0.0",
    "@testing-library/jest-native": "^5.4.0",
    "typescript": "^5.3.0"
  }
}
```

---

## Conclusion

This technical requirements document provides a comprehensive implementation guide for PetSoft Tycoon, focusing on modern React Native architecture with performance-first principles. The specification prioritizes:

### Key Implementation Principles
1. **Performance First**: 60 FPS target with aggressive optimization
2. **Reactive State Management**: Legend State v3 for efficient updates
3. **Vertical Architecture**: Feature-based organization for maintainability
4. **Cross-Platform Excellence**: Consistent experience across iOS and Android
5. **Production Ready**: Robust save system, error handling, and monitoring

### Critical Success Factors
- **Sub-50ms Input Response**: Immediate user feedback on all interactions
- **Efficient Memory Usage**: <200MB RAM on target devices
- **Smooth Animations**: React Native Reanimated 3 for 60fps experiences
- **Intelligent Audio**: Context-aware sound system with performance scaling
- **Bulletproof Saves**: Multiple backup layers with data validation

### Next Steps
1. **Environment Setup**: Configure Expo SDK 52 with TypeScript strict mode
2. **Core Architecture**: Implement Legend State structure and game loop
3. **Performance Baseline**: Establish monitoring and target benchmarks
4. **Feature Implementation**: Build departments using vertical slicing
5. **Polish Phase**: Audio, animations, and user experience refinement

This document serves as the definitive technical guide for development, with all specifications designed to deliver a premium mobile idle game that exceeds player expectations for performance and polish.