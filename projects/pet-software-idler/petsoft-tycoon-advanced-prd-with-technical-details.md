# PetSoft Tycoon: Technical Requirements Document
*Version 1.0 | Generated: 2025-08-14*
*Based on PRD v1.0 with vertical slicing architecture patterns*

## Executive Summary

This document specifies the technical implementation requirements for PetSoft Tycoon, a mobile idle clicker game built using modern React Native architecture patterns. The system follows vertical slicing principles with per-feature state management, avoiding centralized global state and event bus patterns.

### Architecture Philosophy
- **Vertical Slicing**: Each feature owns its complete stack from UI to persistence
- **Per-Feature State**: Individual observable stores per department/feature
- **Modern React Native**: 0.76+ with new architecture (JSI, Fabric, Hermes)
- **Performance First**: Optimized for 30+ FPS on Android 5.0+ devices

## Technical Stack

### Core Technologies
- **React Native**: 0.76+ with new architecture enabled
- **Expo**: SDK 53 with managed workflow
- **State Management**: @legendapp/state@beta with observable patterns
- **Build System**: EAS Build for production deployments
- **JavaScript Engine**: Hermes (default in RN 0.76+)
- **Rendering**: Fabric rendering system
- **Bridge**: JSI for direct synchronous communication

### Development Tools
- **Testing**: Jest for unit tests, future Cypress for E2E
- **Type Safety**: TypeScript with strict configuration
- **Linting**: ESLint with React Native community config
- **Formatting**: Prettier with consistent rules
- **Version Control**: Git with conventional commits

## Architecture Specifications

### Project Structure (Vertical Slicing)
```
src/
├── features/                    # Vertical slices - complete feature stacks
│   ├── development/            # Code generation & developer management
│   │   ├── state/              # developmentStore.ts
│   │   ├── components/         # DeveloperList.tsx, DevelopmentTab.tsx
│   │   ├── hooks/              # useDevelopment.ts, useCodeGeneration.ts
│   │   ├── handlers/           # hireDeveloper.ts, upgradeUnits.ts
│   │   ├── validators/         # validateHiring.ts
│   │   └── index.ts            # Public API exports
│   ├── sales/                  # Lead generation & revenue conversion
│   │   ├── state/              # salesStore.ts
│   │   ├── components/         # LeadGeneration.tsx, RevenueDisplay.tsx
│   │   ├── hooks/              # useSales.ts, useRevenue.ts
│   │   ├── handlers/           # convertRevenue.ts, hireReps.ts
│   │   └── index.ts
│   ├── customer-exp/           # Support tickets & retention systems
│   │   ├── state/              # customerStore.ts
│   │   ├── components/         # SupportDashboard.tsx, TicketQueue.tsx
│   │   ├── hooks/              # useSupport.ts, useTickets.ts
│   │   └── index.ts
│   ├── product/                # Feature enhancement & roadmap
│   │   ├── state/              # productStore.ts
│   │   ├── components/         # ProductInsights.tsx, FeatureEnhancer.tsx
│   │   └── index.ts
│   ├── design/                 # Polish & user experience systems
│   │   ├── state/              # designStore.ts
│   │   ├── components/         # DesignSystem.tsx, ExperienceTracker.tsx
│   │   └── index.ts
│   ├── qa/                     # Bug detection & prevention
│   │   ├── state/              # qaStore.ts
│   │   ├── components/         # BugTracker.tsx, QualityMetrics.tsx
│   │   └── index.ts
│   ├── marketing/              # Brand building & lead multiplication
│   │   ├── state/              # marketingStore.ts
│   │   ├── components/         # CampaignManager.tsx, BrandTracker.tsx
│   │   └── index.ts
│   └── core/                   # Cross-cutting concerns
│       ├── state/              # playerStore.ts, prestigeStore.ts
│       ├── components/         # MainClicker.tsx, PrestigeModal.tsx
│       └── index.ts
├── shared/                     # Reusable utilities (no business logic)
│   ├── ui/                     # Pure UI components
│   │   ├── AnimatedNumber.tsx  # Smooth number transitions
│   │   ├── ProgressBar.tsx     # Department progress indicators
│   │   ├── Button.tsx          # Themed button component
│   │   └── Modal.tsx           # Base modal component
│   ├── audio/                  # Sound management
│   │   ├── AudioManager.ts     # Central audio coordination
│   │   ├── SoundEffects.ts     # Sound effect definitions
│   │   └── AudioContext.tsx    # React context for audio
│   ├── persistence/            # Save/load system
│   │   ├── SaveManager.ts      # Local storage operations
│   │   ├── GameStateSchema.ts  # Save format definitions
│   │   └── MigrationManager.ts # Version migration logic
│   ├── utils/                  # Pure utility functions
│   │   ├── calculations.ts     # Game math (cost scaling, etc.)
│   │   ├── formatting.ts       # Number/currency formatting
│   │   └── timing.ts           # Offline progression calculations
│   └── types/                  # Shared TypeScript definitions
│       ├── GameState.ts        # Core game state interfaces
│       ├── Resources.ts        # Resource type definitions
│       └── Events.ts           # Audio/animation event types
└── app/                        # Root application setup
    ├── App.tsx                 # Main app component
    ├── navigation/             # Navigation structure
    ├── themes/                 # Theme definitions
    └── config/                 # App configuration
```

### Critical Anti-Patterns to Avoid
Based on research validation:

❌ **Centralized Global State**
```typescript
// DON'T: Single game store
src/store/gameStore.ts  // ❌ Violates vertical slicing
```

❌ **Horizontal Component Layers**
```typescript
// DON'T: Shared business logic components
src/components/shared/GameLogic.tsx  // ❌ Cross-feature coupling
```

❌ **EventBus Patterns**
```typescript
// DON'T: Central event system
EventBus.emit('departmentUpdate', data);  // ❌ Not mentioned in research
```

❌ **Cross-Feature Imports**
```typescript
// DON'T: Direct feature imports
import { salesStore } from '../sales/state/salesStore';  // ❌ Tight coupling
```

## State Management Architecture

### Per-Feature Observable Stores
Each feature maintains its own observable state using Legend State @beta:

```typescript
// features/development/state/developmentStore.ts
import { observable } from '@legendapp/state';

interface DevelopmentState {
  developers: {
    junior: number;
    mid: number;
    senior: number;
    techLead: number;
  };
  upgrades: {
    betterIdes: boolean;
    pairProgramming: boolean;
    codeReviews: boolean;
  };
  production: {
    linesPerSecond: number;
    totalProduced: number;
  };
}

const developmentState$ = observable<DevelopmentState>({
  developers: { junior: 0, mid: 0, senior: 0, techLead: 0 },
  upgrades: { betterIdes: false, pairProgramming: false, codeReviews: false },
  production: { linesPerSecond: 0, totalProduced: 0 }
});

// Public interface only
export const useDevelopment = () => {
  return {
    // Read-only state access
    developers: developmentState$.developers.get(),
    production: developmentState$.production.get(),
    
    // Actions
    hireDeveloper: (type: DeveloperType) => {
      // Implementation with validation
    },
    calculateProduction: () => {
      // Production calculation logic
    }
  };
};

// No direct state export - encapsulation maintained
```

### Resource Management Pattern
Resources flow through features without centralized coordination:

```typescript
// features/core/state/playerStore.ts
import { observable } from '@legendapp/state';

interface PlayerResources {
  linesOfCode: number;
  money: number;
  features: {
    basic: number;
    advanced: number;
    premium: number;
    enhanced: number;  // From product department
  };
  leads: number;
  supportTickets: number;
  insights: number;    // From product department
  experiencePoints: number;  // From design department
  bugs: number;        // From qa department
  brandValue: number;  // From marketing department
}

const playerState$ = observable<PlayerResources>({
  linesOfCode: 0,
  money: 0,
  features: { basic: 0, advanced: 0, premium: 0, enhanced: 0 },
  leads: 0,
  supportTickets: 0,
  insights: 0,
  experiencePoints: 0,
  bugs: 0,
  brandValue: 0
});

export const usePlayer = () => {
  return {
    resources: playerState$.get(),
    modifyResource: (type: keyof PlayerResources, amount: number) => {
      // Validation and modification logic
    }
  };
};
```

### State Synchronization Pattern
Features coordinate through shared resource modifications:

```typescript
// features/sales/handlers/convertRevenue.ts
import { usePlayer } from '../../core/state/playerStore';
import { useSales } from '../state/salesStore';

export const convertRevenue = () => {
  const player = usePlayer();
  const sales = useSales();
  
  const { leads } = player.resources;
  const { basic, advanced, premium } = player.resources.features;
  
  // Revenue conversion logic
  const revenue = calculateRevenue(leads, { basic, advanced, premium });
  
  // Update resources without cross-feature imports
  player.modifyResource('money', revenue);
  player.modifyResource('leads', -leads);
  player.modifyResource('features', /* consumed features */);
};
```

## Component Architecture

### Feature-Based Component Organization
Components are organized within their feature boundaries:

```typescript
// features/development/components/DevelopmentTab.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useDevelopment } from '../state/developmentStore';
import { DeveloperList } from './DeveloperList';
import { ProductionDisplay } from './ProductionDisplay';

export const DevelopmentTab: React.FC = () => {
  const { developers, production } = useDevelopment();
  
  return (
    <View style={styles.container}>
      <ProductionDisplay 
        linesPerSecond={production.linesPerSecond}
        totalProduced={production.totalProduced}
      />
      <DeveloperList developers={developers} />
    </View>
  );
};
```

### Shared UI Components Pattern
Pure UI components with no business logic:

```typescript
// shared/ui/AnimatedNumber.tsx
import React, { useEffect, useRef } from 'react';
import { Text, Animated } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  formatter?: (n: number) => string;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  formatter = (n) => n.toLocaleString(),
  duration = 500
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(0);
  
  useEffect(() => {
    const animation = Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false
    });
    
    const listener = animatedValue.addListener(({ value: currentValue }) => {
      displayValue.current = Math.round(currentValue);
    });
    
    animation.start();
    
    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value]);
  
  return (
    <Animated.View>
      <Text>{formatter(displayValue.current)}</Text>
    </Animated.View>
  );
};
```

## Data Models and Persistence

### Game State Schema
Comprehensive save format supporting all features:

```typescript
// shared/types/GameState.ts
export interface GameSave {
  version: string;
  timestamp: number;
  playerId: string;
  
  // Core resources
  resources: {
    linesOfCode: number;
    money: number;
    features: {
      basic: number;
      advanced: number;
      premium: number;
      enhanced: number;
    };
    leads: number;
    supportTickets: number;
    insights: number;
    experiencePoints: number;
    bugs: number;
    brandValue: number;
  };
  
  // Per-department state
  departments: {
    development: {
      units: {
        junior: number;
        mid: number;
        senior: number;
        techLead: number;
      };
      upgrades: {
        betterIdes: boolean;
        pairProgramming: boolean;
        codeReviews: boolean;
      };
      production: {
        linesPerSecond: number;
        totalProduced: number;
      };
    };
    
    sales: {
      units: {
        rep: number;
        manager: number;
        director: number;
        vpSales: number;
      };
      metrics: {
        leadsPerSecond: number;
        totalRevenue: number;
        conversionRates: {
          basic: number;
          advanced: number;
          premium: number;
        };
      };
    };
    
    customerExp: {
      units: {
        support: number;
        specialist: number;
        manager: number;
        director: number;
      };
      metrics: {
        ticketsResolved: number;
        satisfactionMultiplier: number;
        referralLeads: number;
      };
    };
    
    product: {
      units: {
        analyst: number;
        manager: number;
        senior: number;
        cpo: number;
      };
      metrics: {
        insightsPerSecond: number;
        enhancedFeatures: number;
        roadmapBonuses: number;
      };
    };
    
    design: {
      units: {
        designer: number;
        senior: number;
        lead: number;
        director: number;
      };
      metrics: {
        experiencePerSecond: number;
        polishMultiplier: number;
        systemsBonus: number;
      };
    };
    
    qa: {
      units: {
        tester: number;
        automation: number;
        lead: number;
        director: number;
      };
      metrics: {
        bugsPerSecond: number;
        preventionRate: number;
        qualityMultiplier: number;
      };
    };
    
    marketing: {
      units: {
        specialist: number;
        manager: number;
        director: number;
        cmo: number;
      };
      metrics: {
        brandPerSecond: number;
        campaignMultipliers: number;
        viralCoefficient: number;
      };
    };
  };
  
  // Prestige system
  prestige: {
    investorPoints: number;
    totalRuns: number;
    permanentBonuses: {
      startingCapital: number;
      globalSpeed: number;
      synergyBonus: number;
    };
  };
  
  // Statistics and achievements
  statistics: {
    totalPlaytime: number;
    totalClicks: number;
    totalMoney: number;
    totalHires: number;
    departmentsUnlocked: string[];
    milestonesReached: string[];
  };
  
  // Settings
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    notificationsEnabled: boolean;
    offlineProgressEnabled: boolean;
  };
}
```

### Save System Implementation
Automatic persistence with validation:

```typescript
// shared/persistence/SaveManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSave } from '../types/GameState';

const SAVE_KEY = 'petsoft_tycoon_save';
const CURRENT_VERSION = '1.0.0';

export class SaveManager {
  private static saveInterval: NodeJS.Timeout | null = null;
  
  // Automatic save every 30 seconds
  static startAutoSave(getGameState: () => GameSave) {
    this.saveInterval = setInterval(async () => {
      try {
        await this.saveGame(getGameState());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000); // 30 seconds
  }
  
  static stopAutoSave() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }
  
  static async saveGame(gameState: GameSave): Promise<void> {
    try {
      gameState.version = CURRENT_VERSION;
      gameState.timestamp = Date.now();
      
      const serialized = JSON.stringify(gameState);
      await AsyncStorage.setItem(SAVE_KEY, serialized);
    } catch (error) {
      throw new Error(`Save failed: ${error}`);
    }
  }
  
  static async loadGame(): Promise<GameSave | null> {
    try {
      const saved = await AsyncStorage.getItem(SAVE_KEY);
      if (!saved) return null;
      
      const gameState = JSON.parse(saved) as GameSave;
      
      // Version migration if needed
      if (gameState.version !== CURRENT_VERSION) {
        return this.migrateGameState(gameState);
      }
      
      return gameState;
    } catch (error) {
      console.error('Load failed:', error);
      return null;
    }
  }
  
  private static migrateGameState(gameState: GameSave): GameSave {
    // Handle version migrations
    // Future versions would implement migration logic here
    return gameState;
  }
  
  // Manual save on critical events
  static async saveOnPrestige(gameState: GameSave): Promise<void> {
    await this.saveGame(gameState);
  }
  
  static async saveOnAppBackground(gameState: GameSave): Promise<void> {
    await this.saveGame(gameState);
  }
}
```

## Animation and Audio System

### Audio Architecture
Centralized audio management with feature integration:

```typescript
// shared/audio/AudioManager.ts
import { Audio } from 'expo-av';

export type SoundEffect = 
  | 'keyboard_click' 
  | 'cash_register' 
  | 'notification' 
  | 'level_up' 
  | 'prestige';

interface SoundConfig {
  file: string;
  volume: number;
  pitchVariation?: boolean;
  cooldown?: number; // Prevent duplicate sounds within timeframe
}

export class AudioManager {
  private static sounds: Map<SoundEffect, Audio.Sound> = new Map();
  private static lastPlayed: Map<SoundEffect, number> = new Map();
  private static enabled: boolean = true;
  
  private static soundConfigs: Record<SoundEffect, SoundConfig> = {
    keyboard_click: {
      file: require('../../assets/audio/keyboard_click.wav'),
      volume: 0.3,
      pitchVariation: true,
      cooldown: 100
    },
    cash_register: {
      file: require('../../assets/audio/cash_register.wav'),
      volume: 0.5,
      pitchVariation: true,
      cooldown: 200
    },
    notification: {
      file: require('../../assets/audio/notification.wav'),
      volume: 0.7,
      cooldown: 500
    },
    level_up: {
      file: require('../../assets/audio/level_up.wav'),
      volume: 0.8,
      cooldown: 1000
    },
    prestige: {
      file: require('../../assets/audio/prestige.wav'),
      volume: 1.0,
      cooldown: 2000
    }
  };
  
  static async initialize(): Promise<void> {
    try {
      // Load all sound effects
      for (const [soundType, config] of Object.entries(this.soundConfigs)) {
        const { sound } = await Audio.Sound.createAsync(config.file);
        await sound.setVolumeAsync(config.volume);
        this.sounds.set(soundType as SoundEffect, sound);
      }
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }
  
  static async playSound(
    soundType: SoundEffect, 
    options: { pitch?: number; volume?: number } = {}
  ): Promise<void> {
    if (!this.enabled) return;
    
    const config = this.soundConfigs[soundType];
    const now = Date.now();
    const lastPlayed = this.lastPlayed.get(soundType) || 0;
    
    // Respect cooldown period
    if (config.cooldown && now - lastPlayed < config.cooldown) {
      return;
    }
    
    const sound = this.sounds.get(soundType);
    if (!sound) return;
    
    try {
      // Stop previous instance if still playing
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      
      // Apply pitch variation if enabled
      if (config.pitchVariation && options.pitch) {
        await sound.setRateAsync(options.pitch, true);
      }
      
      // Apply volume override if provided
      if (options.volume !== undefined) {
        await sound.setVolumeAsync(options.volume);
      }
      
      await sound.playAsync();
      this.lastPlayed.set(soundType, now);
    } catch (error) {
      console.error(`Failed to play sound ${soundType}:`, error);
    }
  }
  
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  static async cleanup(): Promise<void> {
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();
  }
}
```

### Audio Integration in Features
Features trigger audio through the centralized manager:

```typescript
// features/development/hooks/useDevelopment.ts
import { AudioManager } from '../../../shared/audio/AudioManager';

export const useDevelopment = () => {
  const hireDeveloper = async (type: DeveloperType) => {
    // Hiring logic...
    
    // Play level up sound with pitch based on developer cost
    const pitch = type === 'junior' ? 0.8 : type === 'senior' ? 1.2 : 1.0;
    await AudioManager.playSound('level_up', { pitch });
  };
  
  // Other methods...
};
```

### Animation System
Smooth animations using React Native Animated API:

```typescript
// shared/ui/ProductionAnimation.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface ProductionAnimationProps {
  isProducing: boolean;
  rate: number;
}

export const ProductionAnimation: React.FC<ProductionAnimationProps> = ({
  isProducing,
  rate
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isProducing) {
      // Pulse animation based on production rate
      const pulseDuration = Math.max(500, 2000 / rate);
      
      const pulseSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: pulseDuration / 2,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: pulseDuration / 2,
            useNativeDriver: true
          })
        ])
      );
      
      pulseSequence.start();
      
      return () => pulseSequence.stop();
    }
  }, [isProducing, rate]);
  
  return (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }]
      }}
    >
      {/* Production indicator content */}
    </Animated.View>
  );
};
```

## Performance Requirements and Optimization

### Target Performance Metrics
- **Frame Rate**: Minimum 30 FPS on Android 5.0+ devices
- **Memory Usage**: Under 200MB RAM on low-end devices
- **Response Time**: Interactive elements respond within 50ms
- **Load Time**: App launches in under 3 seconds
- **Battery Impact**: Minimal background processing

### Performance Optimization Strategies

#### 1. Efficient List Rendering
Use FlatList for large data sets:

```typescript
// features/development/components/DeveloperList.tsx
import React from 'react';
import { FlatList } from 'react-native';

interface Developer {
  id: string;
  type: DeveloperType;
  count: number;
  cost: number;
}

export const DeveloperList: React.FC<{ developers: Developer[] }> = ({ developers }) => {
  const renderDeveloper = React.useCallback(({ item }: { item: Developer }) => (
    <DeveloperItem 
      key={item.id}
      developer={item}
      onHire={() => hireDeveloper(item.type)}
    />
  ), []);
  
  return (
    <FlatList
      data={developers}
      renderItem={renderDeveloper}
      keyExtractor={(item) => item.id}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={5}
      getItemLayout={(data, index) => ({
        length: 60, // Fixed item height
        offset: 60 * index,
        index
      })}
    />
  );
};
```

#### 2. Memoization for Expensive Calculations
Cache production calculations:

```typescript
// shared/utils/calculations.ts
import { useMemo } from 'react';

export const useProductionCalculations = (units: DeveloperUnits, upgrades: Upgrades) => {
  return useMemo(() => {
    const baseProduction = 
      units.junior * 0.1 +
      units.mid * 0.5 +
      units.senior * 2.5 +
      units.techLead * 10;
    
    let multiplier = 1.0;
    
    // Apply upgrades
    if (upgrades.betterIdes) multiplier *= 1.25;
    if (upgrades.pairProgramming) multiplier *= 2.0;
    
    // Tech Lead department bonus
    if (units.techLead > 0) multiplier *= 1.1;
    
    return baseProduction * multiplier;
  }, [units, upgrades]);
};
```

#### 3. Lazy Loading for Features
Load features on demand:

```typescript
// app/navigation/MainTabs.tsx
import React, { Suspense, lazy } from 'react';

// Lazy load heavy features
const DevelopmentTab = lazy(() => import('../features/development/components/DevelopmentTab'));
const SalesTab = lazy(() => import('../features/sales/components/SalesTab'));
const ProductTab = lazy(() => import('../features/product/components/ProductTab'));

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Development">
        {() => (
          <Suspense fallback={<LoadingSpinner />}>
            <DevelopmentTab />
          </Suspense>
        )}
      </Tab.Screen>
      {/* Other tabs... */}
    </Tab.Navigator>
  );
};
```

#### 4. Offline Progression Optimization
Efficient background calculations:

```typescript
// shared/utils/offlineProgression.ts
export class OfflineProgressionCalculator {
  static calculateOfflineGains(
    lastSaveTime: number,
    currentTime: number,
    gameState: GameSave
  ): GameSave {
    const offlineTime = Math.min(currentTime - lastSaveTime, 24 * 60 * 60 * 1000); // Max 24 hours
    const offlineHours = offlineTime / (60 * 60 * 1000);
    const offlineEfficiency = 0.1; // 10% efficiency while offline
    
    const newState = { ...gameState };
    
    // Calculate production for each department
    Object.entries(gameState.departments).forEach(([deptName, deptState]) => {
      const productionRate = this.calculateDepartmentProduction(deptState);
      const offlineProduction = productionRate * offlineHours * offlineEfficiency;
      
      // Apply gains to appropriate resources
      this.applyOfflineGains(newState, deptName, offlineProduction);
    });
    
    return newState;
  }
  
  private static calculateDepartmentProduction(departmentState: any): number {
    // Department-specific production calculation
    // Optimized for performance - no complex object iterations
    return 0; // Implementation varies by department
  }
  
  private static applyOfflineGains(gameState: GameSave, department: string, gains: number): void {
    // Apply gains to the appropriate resource based on department
    switch (department) {
      case 'development':
        gameState.resources.linesOfCode += Math.floor(gains);
        break;
      case 'sales':
        gameState.resources.money += Math.floor(gains);
        break;
      // Other departments...
    }
  }
}
```

## Cross-Platform Considerations

### React Native New Architecture Benefits
- **JSI**: Direct synchronous communication between JavaScript and native code
- **Fabric**: Improved rendering performance and layout calculations
- **Hermes**: Optimized JavaScript engine with better memory usage
- **TurboModules**: Lazy loading of native modules

### Expo Configuration
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
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.petsofttycoon"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.petsofttycoon",
      "versionCode": 1
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
      ]
    ]
  }
}
```

### Platform-Specific Optimizations

#### iOS Optimizations
- Use UIKit components through React Native where appropriate
- Optimize for various screen sizes (iPhone/iPad)
- Handle safe area insets properly
- Respect iOS design guidelines

#### Android Optimizations
- Handle various screen densities and sizes
- Optimize for lower-end devices (Android 5.0+)
- Use Android-specific performance patterns
- Handle back button navigation

#### Web Support (Progressive Enhancement)
- Responsive design for desktop browsers
- Keyboard navigation support
- Mouse hover states where appropriate
- Web-specific performance optimizations

## Quality Assurance and Testing

### Testing Strategy
Following vertical slicing principles, each feature includes comprehensive tests:

```typescript
// features/development/hooks/__tests__/useDevelopment.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useDevelopment } from '../useDevelopment';

describe('useDevelopment', () => {
  beforeEach(() => {
    // Reset state before each test
  });
  
  it('should hire junior developer correctly', async () => {
    const { result } = renderHook(() => useDevelopment());
    
    await act(async () => {
      await result.current.hireDeveloper('junior');
    });
    
    expect(result.current.developers.junior).toBe(1);
    expect(result.current.production.linesPerSecond).toBeGreaterThan(0);
  });
  
  it('should calculate production correctly with upgrades', () => {
    const { result } = renderHook(() => useDevelopment());
    
    act(() => {
      // Setup test scenario with developers and upgrades
    });
    
    const expectedProduction = calculateExpectedProduction();
    expect(result.current.production.linesPerSecond).toBe(expectedProduction);
  });
});
```

### Performance Testing
- Load testing with large save files
- Memory leak detection
- Frame rate monitoring during gameplay
- Battery usage profiling

### Platform Testing
- iOS testing on various devices (iPhone 6s+ to latest)
- Android testing on API levels 21+ (Android 5.0+)
- Web browser compatibility testing
- Responsive design validation

## Deployment and Build Process

### EAS Build Configuration
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
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m1-medium"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### CI/CD Pipeline
- Automated testing on pull requests
- Build verification for all platforms
- Performance regression testing
- Automated deployment to internal testing

## Technical Risks and Mitigation

### Performance Risks
- **Risk**: Poor performance on low-end Android devices
- **Mitigation**: Performance budgets, early testing on target devices
- **Contingency**: Optional quality settings, simplified animation modes

### State Management Risks
- **Risk**: Legend State @beta stability issues
- **Mitigation**: Modular state design allows migration to alternative solutions
- **Contingency**: Fallback to Zustand or React Context patterns

### Platform Risks
- **Risk**: React Native breaking changes affecting new architecture
- **Mitigation**: Conservative dependency management, regular updates
- **Contingency**: Native development path if cross-platform fails

### Scalability Risks
- **Risk**: Feature complexity overwhelming new players
- **Mitigation**: Gradual unlock system, clear progression tutorials
- **Contingency**: Simplified game mode hiding advanced features

## Development Timeline and Milestones

### Phase 1: Foundation (Weeks 1-4)
**Sprint 1-2: Core Infrastructure**
- [ ] Expo project setup with React Native 0.76+ and new architecture
- [ ] Legend State integration and basic observable patterns
- [ ] Folder structure following vertical slicing principles
- [ ] Save/load system with AsyncStorage
- [ ] Audio system foundation with Expo AV
- [ ] Basic UI components and theme system

**Deliverable**: Playable clicking mechanic with sound and persistence

**Sprint 3-4: Development Department Complete**
- [ ] Development feature folder with full implementation
- [ ] Four developer types with exponential cost scaling
- [ ] Production calculations and UI displays
- [ ] Upgrade system with department bonuses
- [ ] Unit and integration tests for development feature

**Deliverable**: Fully functional automated code generation

### Phase 2: Core Departments (Weeks 5-8)
**Sprint 5-6: Sales Department**
- [ ] Sales feature implementation following vertical slicing
- [ ] Lead generation and revenue conversion systems
- [ ] Three revenue tiers with proper scaling
- [ ] Integration with development feature for feature consumption
- [ ] Sales metrics and UI components

**Deliverable**: Complete revenue generation loop

**Sprint 7-8: Customer Experience Department**
- [ ] Support ticket generation and resolution systems
- [ ] Revenue multiplication through customer satisfaction
- [ ] Referral lead generation mechanics
- [ ] Customer experience metrics and feedback systems

**Deliverable**: Advanced revenue optimization through customer service

### Phase 3: Advanced Systems (Weeks 9-12)
**Sprint 9-10: Product & Design Departments**
- [ ] Product insights and specification systems
- [ ] Enhanced feature creation (2x value mechanics)
- [ ] Design polish and experience point systems
- [ ] Cross-department synergy effects
- [ ] Global multipliers and bonuses

**Deliverable**: Feature enhancement and design systems

**Sprint 11-12: QA & Marketing Departments**
- [ ] Bug detection and prevention mechanics
- [ ] Marketing brand building and viral systems
- [ ] Campaign multipliers and automation features
- [ ] Complete seven-department ecosystem integration

**Deliverable**: Full department ecosystem with synergies

### Phase 4: Polish & Progression (Weeks 13-16)
**Sprint 13-14: Prestige System**
- [ ] Investor Points calculation and permanent bonuses
- [ ] Prestige reset functionality with confirmations
- [ ] Long-term progression balancing
- [ ] Super unit unlocks at high IP levels

**Deliverable**: Functional prestige enabling long-term play

**Sprint 15-16: Optimization & Launch Prep**
- [ ] Performance optimization for minimum spec devices
- [ ] UI/UX polish based on playtesting feedback
- [ ] Sound effect implementation and balancing
- [ ] Offline progression fine-tuning
- [ ] Final bug fixes and production deployment

**Deliverable**: Production-ready MVP

## Success Metrics and Validation

### Technical KPIs
- **Performance**: 30+ FPS maintained on Android 5.0+ devices
- **Stability**: <1% crash rate across all platforms
- **Load Times**: <3 seconds average app launch time
- **Memory Usage**: <200MB RAM usage on low-end devices
- **Battery Impact**: <10% drain per hour of active play

### Architecture Validation
- **Feature Independence**: Each department can be developed/tested independently
- **State Isolation**: No cross-feature state dependencies
- **Vertical Slicing Success**: Features deliver end-to-end value in single iterations
- **Scalability**: New features can be added without architectural changes

### User Experience Metrics
- **Progression Flow**: Time to first department unlock <5 minutes
- **Retention**: 7-day retention >40%, 30-day retention >15%
- **Engagement**: Average session length 8-12 minutes
- **Completion**: >70% prestige completion rate for users reaching $10M

---

*This technical requirements document provides comprehensive implementation guidance for PetSoft Tycoon, following modern React Native architecture patterns with vertical slicing principles. Each feature is designed to be independently valuable, testable, and maintainable, enabling efficient development and long-term scalability.*