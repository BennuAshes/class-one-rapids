# PetSoft Tycoon Technical Architecture Specifications

## 1. Executive Summary

This document provides comprehensive technical architecture specifications for PetSoft Tycoon, a React Native idle/incremental game. The architecture leverages research-driven insights including Legend State v3 for state management, MMKV for persistence, and vertical slice organization for feature-driven development. The specifications target 60 FPS performance on 5-year-old devices with <50MB RAM usage and <3MB initial download.

## 2. Architecture Overview

### 2.1 Core Technology Stack

**Primary Stack:**
- **Runtime**: React Native 0.79.5 (Expo SDK 52+)
- **Language**: TypeScript 5.x for type safety and developer experience
- **State Management**: Legend State v3 with MMKV persistence
- **Build System**: Expo with EAS Build and Updates
- **Testing**: Jest + React Native Testing Library + Detox

**Secondary Tools:**
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with consistent configuration
- **Performance**: Flipper integration for development profiling
- **Analytics**: Expo Analytics for production monitoring

### 2.2 Architectural Principles

1. **Vertical Slice Architecture**: Features organized as complete, end-to-end functionality
2. **Performance-First Design**: 60 FPS stability with efficient calculation patterns
3. **Type-Safe Development**: TypeScript throughout to prevent calculation errors
4. **Immutable State Management**: Observable patterns with efficient reactivity
5. **Mobile-Optimized**: Battery efficiency and memory management for long sessions

## 3. Project Structure & Organization

### 3.1 Root Directory Structure

```
src/
├── core/                           # Core game systems
│   ├── gameLoop/                   # Game loop and timing
│   ├── state/                      # State management setup
│   ├── events/                     # Event system
│   └── performance/                # Performance monitoring
├── features/                       # Vertical slice features
│   ├── clicking/                   # Epic 1: Core gameplay
│   ├── departments/                # Epic 2: Department systems
│   ├── progression/                # Epic 3: Prestige and progression
│   ├── audioVisual/               # Epic 4: Polish and feedback
│   └── persistence/               # Epic 5: Save/load system
├── shared/                        # Shared utilities and types
│   ├── types/                     # TypeScript interfaces
│   ├── utils/                     # Helper functions
│   ├── constants/                 # Game balance constants
│   └── hooks/                     # Reusable React hooks
├── ui/                           # UI component library
│   ├── components/               # Reusable components
│   ├── layouts/                  # Screen layouts
│   ├── animations/               # Animation utilities
│   └── theme/                    # Design system
└── __tests__/                    # Test organization
    ├── unit/                     # Unit tests by feature
    ├── integration/              # Integration tests
    └── e2e/                      # End-to-end tests
```

### 3.2 Feature-Based Vertical Slices

Each feature follows the vertical slice pattern with complete functionality:

```
features/clicking/                 # Example: Core clicking feature
├── index.ts                      # Public API exports
├── types.ts                      # Feature-specific types
├── state.ts                      # State management
├── components/                   # UI components
│   ├── ClickButton.tsx
│   ├── ResourceDisplay.tsx
│   └── index.ts
├── hooks/                        # Feature hooks
│   ├── useClicking.ts
│   └── useResourceCalculation.ts
├── utils/                        # Feature utilities
│   ├── calculations.ts
│   └── formatters.ts
├── constants.ts                  # Feature constants
└── __tests__/                    # Feature tests
    ├── state.test.ts
    ├── calculations.test.ts
    └── components/
```

### 3.3 File Naming Conventions

**Component Naming:**
- React Components: `PascalCase.tsx` (e.g., `ClickButton.tsx`)
- Hook files: `use*.ts` (e.g., `useClicking.ts`)
- Utility files: `camelCase.ts` (e.g., `calculations.ts`)
- Type files: `types.ts` or `*.types.ts`
- Constants: `constants.ts` or `*.constants.ts`

**State and Logic:**
- State files: `*.state.ts` (e.g., `game.state.ts`)
- Service files: `*.service.ts` (e.g., `persistence.service.ts`)
- Event files: `*.events.ts` (e.g., `department.events.ts`)

**Testing:**
- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

## 4. State Management Architecture

### 4.1 Legend State v3 Integration

**Installation and Setup:**
```bash
npm install @legendapp/state@beta react-native-mmkv
```

**Core State Structure:**
```typescript
// src/core/state/gameState.ts
import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';

export interface GameState {
  // Core resources (Epic 1)
  resources: {
    linesOfCode: number;
    features: number;
    money: number;
    lastUpdate: number;
  };
  
  // Department systems (Epic 2)
  departments: {
    [departmentId: string]: DepartmentState;
  };
  
  // Progression systems (Epic 3)
  progression: {
    investorPoints: number;
    totalResets: number;
    achievements: { [achievementId: string]: Achievement };
    statistics: GameStatistics;
  };
  
  // Game settings and meta
  settings: {
    audioEnabled: boolean;
    particlesEnabled: boolean;
    notificationsEnabled: boolean;
    qualityLevel: 'low' | 'medium' | 'high';
  };
  
  // Meta information
  meta: {
    version: string;
    firstPlayTime: number;
    totalPlayTime: number;
    lastSaveTime: number;
  };
}

// Create the main game state observable
export const gameState$ = observable<GameState>({
  resources: {
    linesOfCode: 0,
    features: 0,
    money: 0,
    lastUpdate: Date.now()
  },
  departments: {},
  progression: {
    investorPoints: 0,
    totalResets: 0,
    achievements: {},
    statistics: {
      totalClicks: 0,
      totalProduction: 0,
      // ... other stats
    }
  },
  settings: {
    audioEnabled: true,
    particlesEnabled: true,
    notificationsEnabled: true,
    qualityLevel: 'medium'
  },
  meta: {
    version: '1.0.0',
    firstPlayTime: Date.now(),
    totalPlayTime: 0,
    lastSaveTime: Date.now()
  }
});
```

**MMKV Persistence Setup:**
```typescript
// src/core/state/persistence.ts
import { MMKV } from 'react-native-mmkv';
import { configureSynced } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';

// Create MMKV storage instance
export const storage = new MMKV({
  id: 'petsoft-tycoon-game-data',
  encryptionKey: 'petsoft-secure-key-2025'
});

// Configure persistence
export const persistConfig = {
  plugin: ObservablePersistMMKV,
  mmkv: storage,
  transform: {
    save: (value: any) => {
      // Compress save data
      return JSON.stringify(value);
    },
    load: (value: string) => {
      // Decompress and validate save data
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
  }
};

// Sync game state with persistence
syncObservable(gameState$, {
  persist: {
    name: 'gameState',
    ...persistConfig
  },
  retry: {
    infinite: true,
    delay: 1000
  }
});
```

### 4.2 Computed Values and Derivations

```typescript
// src/features/departments/state.ts
import { computed } from '@legendapp/state';

// Production rate calculations
export const productionRates$ = computed(() => {
  const departments = gameState$.departments.get();
  
  return Object.entries(departments).reduce((rates, [deptId, dept]) => {
    const baseRate = calculateDepartmentBaseProduction(dept);
    const bonuses = calculateDepartmentBonuses(dept, departments);
    const synergies = calculateSynergies(deptId, departments);
    
    rates[deptId] = {
      base: baseRate,
      total: baseRate * bonuses * synergies,
      bonuses,
      synergies
    };
    
    return rates;
  }, {} as ProductionRates);
});

// Resource calculations
export const resourcePerSecond$ = computed(() => {
  const rates = productionRates$.get();
  
  return {
    linesOfCode: rates.development?.total || 0,
    features: Math.floor(gameState$.resources.linesOfCode.get() / 10),
    money: calculateRevenuePerSecond(rates)
  };
});
```

### 4.3 Action System

```typescript
// src/core/state/actions.ts
import { batch } from '@legendapp/state';

export const gameActions = {
  // Core clicking action
  clickForCode: () => {
    batch(() => {
      gameState$.resources.linesOfCode.set(prev => prev + 1);
      gameState$.progression.statistics.totalClicks.set(prev => prev + 1);
      
      // Trigger achievement checks
      checkAchievements();
    });
  },
  
  // Purchase department unit
  purchaseUnit: (departmentId: string, unitType: string) => {
    const cost = calculateUnitCost(departmentId, unitType);
    const money = gameState$.resources.money.get();
    
    if (money >= cost) {
      batch(() => {
        gameState$.resources.money.set(prev => prev - cost);
        gameState$.departments[departmentId].units[unitType].set(prev => prev + 1);
        
        // Update statistics
        gameState$.progression.statistics.totalSpent.set(prev => prev + cost);
      });
    }
  },
  
  // Prestige reset
  performPrestige: () => {
    const currentMoney = gameState$.resources.money.get();
    const investorPoints = calculateInvestorPoints(currentMoney);
    
    if (investorPoints > 0) {
      batch(() => {
        // Reset game state but keep progression
        gameState$.resources.set({
          linesOfCode: 0,
          features: 0,
          money: 0,
          lastUpdate: Date.now()
        });
        
        gameState$.departments.set({});
        
        // Add investor points
        gameState$.progression.investorPoints.set(prev => prev + investorPoints);
        gameState$.progression.totalResets.set(prev => prev + 1);
      });
    }
  }
};
```

## 5. Game Loop Architecture

### 5.1 Core Game Loop

```typescript
// src/core/gameLoop/GameLoop.ts
import { useEffect, useRef, useCallback } from 'react';

interface GameLoopConfig {
  targetFPS: number;
  maxDeltaTime: number;
  enableBackground: boolean;
}

export class GameLoop {
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private deltaTime = 0;
  private isRunning = false;
  
  constructor(private config: GameLoopConfig) {}
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }
  
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  private loop = () => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    this.deltaTime = Math.min(
      (currentTime - this.lastTime) / 1000,
      this.config.maxDeltaTime
    );
    this.lastTime = currentTime;
    
    // Update game systems in order
    this.updateSystems(this.deltaTime);
    
    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.loop);
  };
  
  private updateSystems(deltaTime: number) {
    // Update production
    this.updateProduction(deltaTime);
    
    // Update achievements
    this.updateAchievements();
    
    // Update animations
    this.updateAnimations(deltaTime);
    
    // Auto-save periodically
    this.updateAutoSave(deltaTime);
  }
  
  private updateProduction(deltaTime: number) {
    const rates = resourcePerSecond$.get();
    
    batch(() => {
      gameState$.resources.linesOfCode.set(prev => 
        prev + rates.linesOfCode * deltaTime
      );
      gameState$.resources.money.set(prev => 
        prev + rates.money * deltaTime
      );
      gameState$.resources.lastUpdate.set(Date.now());
    });
  }
}

// Hook for game loop management
export const useGameLoop = () => {
  const gameLoopRef = useRef<GameLoop>();
  
  useEffect(() => {
    gameLoopRef.current = new GameLoop({
      targetFPS: 60,
      maxDeltaTime: 1/30, // Cap at 30 FPS minimum
      enableBackground: true
    });
    
    gameLoopRef.current.start();
    
    return () => {
      gameLoopRef.current?.stop();
    };
  }, []);
  
  return gameLoopRef.current;
};
```

### 5.2 Offline Progression

```typescript
// src/features/persistence/offlineProgression.ts
export const calculateOfflineProgress = (lastUpdateTime: number) => {
  const now = Date.now();
  const timeDiff = (now - lastUpdateTime) / 1000; // seconds
  const maxOfflineTime = 12 * 60 * 60; // 12 hours cap
  
  const offlineTime = Math.min(timeDiff, maxOfflineTime);
  
  if (offlineTime < 60) return null; // Minimum 1 minute offline
  
  const rates = resourcePerSecond$.peek();
  
  return {
    timeOffline: offlineTime,
    resources: {
      linesOfCode: rates.linesOfCode * offlineTime,
      money: rates.money * offlineTime,
      features: Math.floor(rates.features * offlineTime)
    },
    efficiency: Math.min(offlineTime / 3600, 1) // Reduced efficiency for longer offline periods
  };
};
```

## 6. Component Architecture

### 6.1 UI Component Hierarchy

```typescript
// src/ui/components/base/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'upgrade';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  cost?: number;
  canAfford?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  cost,
  canAfford = true
}) => {
  const theme = useTheme();
  
  const handlePress = useCallback(() => {
    if (!disabled && canAfford) {
      // Add haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  }, [disabled, canAfford, onPress]);
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        !canAfford && styles.cantAfford
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {title}
      </Text>
      {cost && (
        <Text style={styles.cost}>
          ${formatNumber(cost)}
        </Text>
      )}
    </TouchableOpacity>
  );
};
```

### 6.2 Feature Components

```typescript
// src/features/clicking/components/ClickButton.tsx
import React from 'react';
import { observer } from '@legendapp/state/react';
import { Button } from '../../../ui/components';
import { gameActions } from '../../../core/state/actions';
import { gameState$ } from '../../../core/state/gameState';

export const ClickButton = observer(() => {
  const linesOfCode = gameState$.resources.linesOfCode.use();
  
  return (
    <Button
      title={`Write Code (+1 line)`}
      onPress={gameActions.clickForCode}
      variant="primary"
      size="large"
    />
  );
});
```

### 6.3 Screen Layouts

```typescript
// src/ui/layouts/GameScreen.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { observer } from '@legendapp/state/react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResourceDisplay } from '../../features/clicking/components';
import { DepartmentList } from '../../features/departments/components';
import { ProgressionPanel } from '../../features/progression/components';

export const GameScreen = observer(() => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ResourceDisplay />
      </View>
      
      <ScrollView style={styles.content}>
        <DepartmentList />
        <ProgressionPanel />
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  content: {
    flex: 1,
    padding: 16
  }
});
```

## 7. Performance Optimization

### 7.1 Memory Management

```typescript
// src/core/performance/MemoryManager.ts
export class MemoryManager {
  private objectPools = new Map<string, ObjectPool>();
  
  getPool<T>(name: string, factory: () => T): ObjectPool<T> {
    if (!this.objectPools.has(name)) {
      this.objectPools.set(name, new ObjectPool(factory));
    }
    return this.objectPools.get(name) as ObjectPool<T>;
  }
  
  // Monitor memory usage
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
  
  // Garbage collection hints
  requestGC() {
    if (global.gc) {
      global.gc();
    }
  }
}

class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  
  constructor(factory: () => T) {
    this.factory = factory;
  }
  
  acquire(): T {
    return this.pool.pop() || this.factory();
  }
  
  release(obj: T) {
    this.pool.push(obj);
  }
}
```

### 7.2 Calculation Optimization

```typescript
// src/shared/utils/calculations.ts
import { memoize } from 'lodash';

// Memoized expensive calculations
export const calculateDepartmentProduction = memoize(
  (units: UnitCounts, upgrades: UpgradeState) => {
    let production = 0;
    
    Object.entries(units).forEach(([unitType, count]) => {
      const baseProduction = UNIT_PRODUCTION_RATES[unitType];
      const upgradeMultiplier = calculateUpgradeMultiplier(unitType, upgrades);
      production += baseProduction * count * upgradeMultiplier;
    });
    
    return production;
  },
  // Cache key function
  (units, upgrades) => `${JSON.stringify(units)}-${JSON.stringify(upgrades)}`
);

// Efficient number formatting for large numbers
export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num < 1000000000000) return `${(num / 1000000000).toFixed(1)}B`;
  return `${(num / 1000000000000).toFixed(1)}T`;
};

// Battery-efficient background calculations
export const throttleCalculations = (fn: Function, interval: number) => {
  let lastRun = 0;
  
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastRun > interval) {
      lastRun = now;
      return fn(...args);
    }
  };
};
```

### 7.3 Rendering Optimization

```typescript
// src/ui/animations/ParticleSystem.tsx
import React, { useRef, useEffect } from 'react';
import { Animated, View } from 'react-native';
import { observer } from '@legendapp/state/react';

interface Particle {
  id: string;
  x: number;
  y: number;
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
}

export const ParticleSystem = observer(() => {
  const particles = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  
  const updateParticles = useCallback(() => {
    particles.current = particles.current.filter(particle => {
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.life -= 16; // Assuming 60 FPS
      
      return particle.life > 0;
    });
    
    // Limit particle count for performance
    if (particles.current.length > 100) {
      particles.current = particles.current.slice(-100);
    }
  }, []);
  
  useEffect(() => {
    const animate = () => {
      updateParticles();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateParticles]);
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.current.map(particle => (
        <ParticleComponent key={particle.id} particle={particle} />
      ))}
    </View>
  );
});
```

## 8. Testing Strategy

### 8.1 Testing Organization

```
__tests__/
├── unit/                          # Unit tests
│   ├── calculations/              # Pure function tests
│   ├── state/                     # State management tests
│   └── utils/                     # Utility function tests
├── integration/                   # Integration tests
│   ├── features/                  # Feature integration tests
│   ├── persistence/               # Save/load tests
│   └── performance/               # Performance tests
└── e2e/                          # End-to-end tests
    ├── gameplay/                  # Core gameplay flows
    ├── progression/               # Progression system tests
    └── offline/                   # Offline progression tests
```

### 8.2 Unit Testing Examples

```typescript
// __tests__/unit/calculations/departmentProduction.test.ts
import { calculateDepartmentProduction } from '../../../src/shared/utils/calculations';

describe('Department Production Calculations', () => {
  it('should calculate base production correctly', () => {
    const units = { 'junior-dev': 5, 'senior-dev': 2 };
    const upgrades = {};
    
    const result = calculateDepartmentProduction(units, upgrades);
    
    expect(result).toBe(5 * 0.1 + 2 * 2.5); // Expected base rates
  });
  
  it('should apply upgrade multipliers correctly', () => {
    const units = { 'junior-dev': 10 };
    const upgrades = { 'better-ide': true };
    
    const result = calculateDepartmentProduction(units, upgrades);
    
    expect(result).toBe(10 * 0.1 * 1.25); // 25% IDE upgrade
  });
  
  it('should handle large numbers efficiently', () => {
    const start = performance.now();
    
    const units = { 'junior-dev': 1000000 };
    calculateDepartmentProduction(units, {});
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(10); // Should complete in <10ms
  });
});
```

### 8.3 Integration Testing

```typescript
// __tests__/integration/features/clicking.integration.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { gameState$ } from '../../../src/core/state/gameState';
import { gameActions } from '../../../src/core/state/actions';

describe('Clicking Feature Integration', () => {
  beforeEach(() => {
    // Reset game state
    gameState$.set({
      resources: { linesOfCode: 0, features: 0, money: 0, lastUpdate: Date.now() },
      departments: {},
      progression: { investorPoints: 0, totalResets: 0, achievements: {}, statistics: {} },
      settings: { audioEnabled: true, particlesEnabled: true, notificationsEnabled: true, qualityLevel: 'medium' },
      meta: { version: '1.0.0', firstPlayTime: Date.now(), totalPlayTime: 0, lastSaveTime: Date.now() }
    });
  });
  
  it('should increase lines of code when clicking', () => {
    act(() => {
      gameActions.clickForCode();
    });
    
    expect(gameState$.resources.linesOfCode.peek()).toBe(1);
    expect(gameState$.progression.statistics.totalClicks.peek()).toBe(1);
  });
  
  it('should convert lines to features correctly', () => {
    // Add 10 lines of code
    act(() => {
      gameState$.resources.linesOfCode.set(10);
    });
    
    // Features should be calculated as floor(linesOfCode / 10)
    expect(gameState$.resources.features.peek()).toBe(1);
  });
});
```

### 8.4 Performance Testing

```typescript
// __tests__/integration/performance/gameLoop.performance.test.ts
import { GameLoop } from '../../../src/core/gameLoop/GameLoop';

describe('Game Loop Performance', () => {
  it('should maintain 60 FPS under load', async () => {
    const gameLoop = new GameLoop({
      targetFPS: 60,
      maxDeltaTime: 1/30,
      enableBackground: true
    });
    
    // Add significant load to the game state
    gameState$.departments.set(generateLargeDepartmentState());
    
    const frameTimings: number[] = [];
    const originalUpdate = gameLoop['updateSystems'];
    
    gameLoop['updateSystems'] = (deltaTime: number) => {
      const start = performance.now();
      originalUpdate.call(gameLoop, deltaTime);
      frameTimings.push(performance.now() - start);
    };
    
    gameLoop.start();
    
    // Run for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    gameLoop.stop();
    
    // Check that 95% of frames are under 16.67ms (60 FPS)
    const sortedTimings = frameTimings.sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimings.length * 0.95);
    
    expect(sortedTimings[p95Index]).toBeLessThan(16.67);
  });
});
```

## 9. Build Configuration

### 9.1 Expo Configuration

```json
// app.json
{
  "expo": {
    "name": "PetSoft Tycoon",
    "slug": "petsoft-tycoon",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.petsoft-tycoon",
      "infoPlist": {
        "UIBackgroundModes": ["background-processing"],
        "NSUserTrackingUsageDescription": "This allows us to optimize your gaming experience."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.petsoft_tycoon",
      "permissions": ["WAKE_LOCK"]
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "newArchEnabled": true
          },
          "ios": {
            "newArchEnabled": true
          }
        }
      ],
      "expo-font"
    ],
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### 9.2 TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-native",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/core/*": ["src/core/*"],
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"],
      "@/ui/*": ["src/ui/*"]
    },
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "src/**/*",
    "App.tsx",
    "index.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "__tests__/**/*"
  ]
}
```

### 9.3 Metro Configuration

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable new architecture
config.resolver.unstable_enablePackageExports = true;

// Optimize bundle size
config.transformer.minifierConfig = {
  mangle: true,
  keep_classnames: true,
  keep_fnames: true
};

// Add performance monitoring
config.serializer.customSerializer = require('./scripts/bundleAnalyzer');

module.exports = config;
```

### 9.4 EAS Build Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "NODE_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "env": {
        "NODE_ENV": "production"
      }
    },
    "production": {
      "channel": "production",
      "env": {
        "NODE_ENV": "production"
      },
      "cache": {
        "disabled": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 10. Monitoring and Analytics

### 10.1 Performance Monitoring

```typescript
// src/core/performance/PerformanceMonitor.ts
export class PerformanceMonitor {
  private metrics = {
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    renderTime: 0
  };
  
  private frameCount = 0;
  private lastFPSUpdate = 0;
  
  startMonitoring() {
    this.monitorFPS();
    this.monitorMemory();
    this.monitorRenderPerformance();
  }
  
  private monitorFPS() {
    const tick = () => {
      this.frameCount++;
      const now = performance.now();
      
      if (now - this.lastFPSUpdate >= 1000) {
        this.metrics.fps = this.frameCount;
        this.frameCount = 0;
        this.lastFPSUpdate = now;
        
        // Report low FPS
        if (this.metrics.fps < 30) {
          this.reportPerformanceIssue('Low FPS', this.metrics.fps);
        }
      }
      
      requestAnimationFrame(tick);
    };
    
    tick();
  }
  
  private reportPerformanceIssue(type: string, value: number) {
    // Log to analytics
    console.warn(`Performance Issue: ${type} - ${value}`);
    
    // Could integrate with Expo Analytics or other services
    // Analytics.track('performance_issue', { type, value });
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}
```

### 10.2 Game Analytics

```typescript
// src/core/analytics/GameAnalytics.ts
export class GameAnalytics {
  private events: AnalyticsEvent[] = [];
  
  track(eventName: string, properties: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      sessionId: this.getCurrentSessionId()
    };
    
    this.events.push(event);
    
    // Batch upload events
    if (this.events.length >= 50) {
      this.flushEvents();
    }
  }
  
  // Game-specific tracking methods
  trackPurchase(departmentId: string, unitType: string, cost: number) {
    this.track('unit_purchased', {
      department: departmentId,
      unit: unitType,
      cost,
      currentMoney: gameState$.resources.money.peek()
    });
  }
  
  trackPrestige(investorPoints: number, totalMoney: number) {
    this.track('prestige_performed', {
      investorPoints,
      totalMoney,
      playTime: gameState$.meta.totalPlayTime.peek()
    });
  }
  
  trackMilestone(milestone: string, value: number) {
    this.track('milestone_reached', {
      milestone,
      value,
      playTime: gameState$.meta.totalPlayTime.peek()
    });
  }
  
  private async flushEvents() {
    // Upload events to analytics service
    // Implementation depends on chosen analytics provider
  }
}
```

## 11. Deployment Strategy

### 11.1 Environment Configuration

```typescript
// src/config/environment.ts
const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    enableDebugMode: true,
    enablePerformanceMonitoring: true,
    logLevel: 'debug'
  },
  staging: {
    apiUrl: 'https://staging-api.petsoft-tycoon.com',
    enableDebugMode: false,
    enablePerformanceMonitoring: true,
    logLevel: 'info'
  },
  production: {
    apiUrl: 'https://api.petsoft-tycoon.com',
    enableDebugMode: false,
    enablePerformanceMonitoring: false,
    logLevel: 'error'
  }
};

export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return config[env as keyof typeof config];
};
```

### 11.2 Continuous Integration

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npx eas build --platform all --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## 12. Security Considerations

### 12.1 Data Protection

```typescript
// src/core/security/DataProtection.ts
import CryptoJS from 'crypto-js';

export class DataProtection {
  private readonly encryptionKey = 'petsoft-secure-2025';
  
  encryptSaveData(data: any): string {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, this.encryptionKey).toString();
  }
  
  decryptSaveData(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Failed to decrypt save data:', error);
      return null;
    }
  }
  
  validateSaveData(data: any): boolean {
    // Implement save data validation logic
    return this.isValidGameState(data);
  }
  
  private isValidGameState(state: any): boolean {
    return (
      state &&
      typeof state.resources === 'object' &&
      typeof state.departments === 'object' &&
      typeof state.progression === 'object' &&
      typeof state.meta === 'object'
    );
  }
}
```

### 12.2 Input Validation

```typescript
// src/shared/utils/validation.ts
export const validatePurchase = (
  departmentId: string,
  unitType: string,
  cost: number
): boolean => {
  // Validate department exists
  if (!VALID_DEPARTMENTS.includes(departmentId)) {
    return false;
  }
  
  // Validate unit type
  if (!VALID_UNIT_TYPES[departmentId]?.includes(unitType)) {
    return false;
  }
  
  // Validate cost matches expected calculation
  const expectedCost = calculateUnitCost(departmentId, unitType);
  if (Math.abs(cost - expectedCost) > 0.01) {
    return false;
  }
  
  return true;
};

export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.replace(/[<>]/g, '');
  }
  
  if (typeof input === 'number') {
    return Math.max(0, Math.min(input, Number.MAX_SAFE_INTEGER));
  }
  
  return input;
};
```

## 13. Conclusion

This technical architecture specification provides a comprehensive foundation for implementing PetSoft Tycoon as a high-performance React Native idle game. The architecture leverages:

- **Legend State v3** for efficient state management with MMKV persistence
- **Vertical slice organization** for feature-driven development
- **TypeScript** throughout for type safety and developer experience
- **Performance-first design** targeting 60 FPS on older devices
- **Comprehensive testing strategy** covering unit, integration, and performance testing
- **Modern React Native practices** with Expo SDK 52+ and new architecture

The modular design enables parallel development of features while maintaining code quality and performance standards. The specifications bridge research insights into concrete implementation patterns, providing clear guidance for development teams to build a successful mobile idle game.

Key deliverables achieved:
- ✅ Exact folder structures for game features
- ✅ Comprehensive naming conventions
- ✅ Clear component boundaries and separation of concerns
- ✅ Specific integration patterns for Legend State v3 and MMKV
- ✅ Game-specific testing strategies and performance validation
- ✅ 60 FPS performance targets with mobile optimization
- ✅ Complete Expo configuration for mobile deployment

This architecture supports the game's requirements for complex department interactions, prestige systems, and long-term progression while maintaining the simplicity and polish that makes idle games addictive.