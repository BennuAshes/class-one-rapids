# PetSoft Tycoon: Technical Requirements Document

## Executive Summary

### Architecture Overview
PetSoft Tycoon will be built as a React Native application with Expo managed workflow, implementing vertical-slicing architecture for maximum maintainability and performance. The application targets cross-platform deployment (iOS, Android, Web) with offline-first functionality and 60fps performance requirements.

### Technology Stack
- **Framework:** React Native 0.76+ with New Architecture enabled
- **Development Platform:** Expo SDK 53 with managed workflow
- **State Management:** @legendapp/state@beta for optimal performance
- **Build System:** EAS Build for cross-platform deployment
- **JavaScript Engine:** Hermes (default in RN 0.76+)

### Performance Targets
- <50ms input response time
- 60fps sustained animations
- <256MB peak memory usage
- <100MB total app size
- <5% battery drain per hour

## Architecture Specifications

### Vertical-Slicing Pattern Implementation

Following research best practices, the application will use feature-based vertical slicing where each feature owns its complete stack:

```
src/
├── features/
│   ├── development/           # Development department
│   │   ├── state/            # Department-specific state
│   │   ├── components/       # UI components
│   │   ├── hooks/           # Business logic hooks
│   │   ├── handlers/        # Event handlers
│   │   ├── validators/      # Input validation
│   │   └── index.ts         # Public API
│   ├── sales/               # Sales department
│   ├── customerExperience/  # Customer Experience
│   ├── product/            # Product department
│   ├── design/             # Design department
│   ├── qa/                 # QA department
│   ├── marketing/          # Marketing department
│   ├── prestige/           # Investor rounds system
│   └── core/               # Shared game mechanics
├── shared/                 # Truly shared utilities only
│   ├── ui/                # Reusable UI components
│   ├── audio/             # Audio system
│   ├── persistence/       # Save/load system
│   └── utils/             # Common utilities
└── App.tsx
```

### React Native New Architecture

The application leverages React Native 0.76+ New Architecture features:

#### Core Components
- **JSI (JavaScript Interface):** Direct synchronous JS-native communication for performance-critical calculations
- **Fabric:** New rendering system for improved UI performance
- **TurboModules:** Enhanced native module system for audio and persistence
- **Hermes:** Default JavaScript engine with optimized bytecode

#### Configuration
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  // Enable New Architecture
  config.resolver.unstable_enablePackageExports = true;
  
  return config;
})();
```

```properties
# android/gradle.properties
newArchEnabled=true
hermesEnabled=true
```

## State Management Architecture

### @legendapp/state@beta Implementation

Based on research showing 40% performance improvement, the application uses @legendapp/state with per-feature observable stores:

```typescript
// features/development/state/developmentStore.ts
import { observable } from '@legendapp/state';

interface DeveloperUnit {
  id: string;
  type: 'junior' | 'mid' | 'senior' | 'lead';
  count: number;
  cost: number;
  production: number;
}

const developmentState$ = observable({
  // Private state
  linesOfCode: 0,
  developers: [] as DeveloperUnit[],
  upgrades: {
    ides: 0,
    pairProgramming: false,
    codeReviews: false,
  },
  // Computed values
  totalProduction: () => {
    return developmentState$.developers.get().reduce((total, dev) => 
      total + (dev.count * dev.production), 0
    );
  }
});

// Public interface only
export const useDevelopment = () => {
  const hireDeveloper = (type: DeveloperUnit['type']) => {
    // Implementation
  };
  
  const upgradeIdes = () => {
    // Implementation
  };
  
  return {
    // Read-only state
    linesOfCode: developmentState$.linesOfCode,
    developers: developmentState$.developers,
    totalProduction: developmentState$.totalProduction,
    // Actions
    hireDeveloper,
    upgradeIdes,
  };
};
```

### State Architecture Principles
1. **Per-feature stores:** Each department manages its own state
2. **Observable patterns:** Reactive updates for UI synchronization
3. **Computed values:** Derived state for performance optimization
4. **Public interfaces:** Controlled access to prevent direct state mutation
5. **No cross-feature imports:** Maintain loose coupling

## Component Hierarchy and Organization

### Core Game Loop Components

```typescript
// App.tsx - Main application container
├── GameScreen
│   ├── DepartmentTabs
│   │   ├── DevelopmentTab
│   │   │   ├── CodeCounter
│   │   │   ├── DeveloperList
│   │   │   │   └── DeveloperUnit (FlatList optimized)
│   │   │   ├── UpgradeButtons
│   │   │   └── ProductionDisplay
│   │   ├── SalesTab
│   │   ├── CustomerExperienceTab
│   │   └── [Other Department Tabs]
│   ├── TopBar
│   │   ├── MoneyCounter
│   │   ├── ValuationDisplay
│   │   └── PrestigeButton
│   └── BottomActions
│       ├── WriteCodeButton
│       ├── ShipFeatureButton
│       └── SettingsButton
```

### Performance-Optimized List Components

Using FlatList for efficient rendering of large lists (following research recommendations):

```typescript
// features/development/components/DeveloperList.tsx
import React, { useMemo } from 'react';
import { FlatList } from 'react-native';

const DeveloperList = () => {
  const { developers } = useDevelopment();
  
  const renderDeveloper = useMemo(() => ({ item, index }) => (
    <DeveloperUnit 
      key={item.id}
      developer={item}
      onHire={() => hireDeveloper(item.type)}
    />
  ), []);
  
  const keyExtractor = useMemo(() => (item) => item.id, []);
  
  return (
    <FlatList
      data={developers.get()}
      renderItem={renderDeveloper}
      keyExtractor={keyExtractor}
      getItemLayout={(data, index) => ({
        length: 80, // Fixed height for performance
        offset: 80 * index,
        index,
      })}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={21}
    />
  );
};
```

## Data Models and Game Mechanics

### Core Game State Structure

```typescript
// shared/types/GameState.ts
export interface GameState {
  player: {
    money: number;
    valuation: number;
    investmentPoints: number;
    startTime: number;
    lastSave: number;
  };
  
  departments: {
    development: DevelopmentState;
    sales: SalesState;
    customerExperience: CustomerExperienceState;
    product: ProductState;
    design: DesignState;
    qa: QAState;
    marketing: MarketingState;
  };
  
  progression: {
    features: Feature[];
    achievements: Achievement[];
    milestones: Milestone[];
    currentPrestigeTier: number;
  };
  
  settings: {
    audioEnabled: boolean;
    musicVolume: number;
    effectsVolume: number;
    autoSaveInterval: number;
  };
}
```

### Mathematical Balance Formulas

#### Cost Scaling Formula
```typescript
// Base cost × 1.15^owned units
const calculateUnitCost = (baseCost: number, owned: number): number => {
  return Math.floor(baseCost * Math.pow(1.15, owned));
};
```

#### Production Calculations
```typescript
// Department synergy bonuses
const calculateDepartmentBonus = (investmentPoints: number): number => {
  return 1 + (Math.floor(investmentPoints / 10) * 0.02); // 2% per 10 IP
};

// Feature value calculation
const calculateFeatureValue = (
  linesOfCode: number,
  leads: number,
  featureType: 'basic' | 'advanced' | 'premium'
): number => {
  const baseValues = { basic: 50, advanced: 500, premium: 5000 };
  return baseValues[featureType] * Math.min(linesOfCode / 10, leads);
};
```

#### Offline Progression
```typescript
// Accurate offline calculation up to 7 days
const calculateOfflineProgress = (
  lastSaveTime: number,
  currentTime: number,
  productionRate: number
): number => {
  const maxOfflineTime = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  const offlineTime = Math.min(currentTime - lastSaveTime, maxOfflineTime);
  return Math.floor((offlineTime / 1000) * productionRate);
};
```

## Animation and Audio System Requirements

### Animation Architecture

Using React Native's Animated API with performance optimizations:

```typescript
// shared/ui/animations/NumberCounter.tsx
import React, { useRef, useEffect } from 'react';
import { Animated, Text } from 'react-native';

export const AnimatedNumber = ({ value, duration = 300 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false, // Required for text animations
    }).start();
  }, [value]);
  
  return (
    <Animated.Text>
      {animatedValue.interpolate({
        inputRange: [0, value],
        outputRange: [0, value],
        extrapolate: 'clamp',
      })}
    </Animated.Text>
  );
};
```

### Visual Feedback Systems

```typescript
// Particle system for milestone achievements
const ParticleSystem = {
  createParticles: (count: number, position: { x: number, y: number }) => {
    // Create visual particles for major achievements
  },
  
  screenShake: (intensity: number) => {
    // Screen shake for milestone achievements
  },
  
  numberPopup: (value: number, color: 'white' | 'green' | 'gold') => {
    // Flying number animations
  }
};
```

### Audio System Implementation

```typescript
// shared/audio/AudioManager.ts
import { Audio } from 'expo-av';

class AudioManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private lastPlayTimes: Map<string, number> = new Map();
  
  async loadSounds() {
    const soundFiles = {
      keyboardClick: require('./sounds/keyboard-click.wav'),
      cashRegister: require('./sounds/cash-register.wav'),
      notification: require('./sounds/notification.wav'),
      milestone: require('./sounds/milestone.wav'),
    };
    
    for (const [key, uri] of Object.entries(soundFiles)) {
      const { sound } = await Audio.Sound.createAsync(uri);
      this.sounds.set(key, sound);
    }
  }
  
  playSound(soundKey: string, volume: number = 1.0) {
    const now = Date.now();
    const lastPlay = this.lastPlayTimes.get(soundKey) || 0;
    
    // Prevent sound repetition within 500ms
    if (now - lastPlay < 500) return;
    
    const sound = this.sounds.get(soundKey);
    if (sound) {
      sound.setVolumeAsync(volume);
      sound.replayAsync();
      this.lastPlayTimes.set(soundKey, now);
    }
  }
}
```

## Save/Load System Implementation

### Local Storage Architecture

```typescript
// shared/persistence/SaveManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SaveData {
  version: string;
  timestamp: number;
  gameState: GameState;
  checksum: string;
}

class SaveManager {
  private readonly SAVE_KEY = 'petsoft_tycoon_save';
  private readonly BACKUP_KEY = 'petsoft_tycoon_backup';
  private readonly SAVE_VERSION = '1.0.0';
  
  async saveGame(gameState: GameState): Promise<void> {
    try {
      // Create backup of current save
      const currentSave = await this.loadGame();
      if (currentSave) {
        await AsyncStorage.setItem(this.BACKUP_KEY, JSON.stringify(currentSave));
      }
      
      const saveData: SaveData = {
        version: this.SAVE_VERSION,
        timestamp: Date.now(),
        gameState,
        checksum: this.generateChecksum(gameState),
      };
      
      await AsyncStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
    } catch (error) {
      console.error('Save failed:', error);
      throw new Error('Failed to save game');
    }
  }
  
  async loadGame(): Promise<GameState | null> {
    try {
      const saveString = await AsyncStorage.getItem(this.SAVE_KEY);
      if (!saveString) return null;
      
      const saveData: SaveData = JSON.parse(saveString);
      
      // Verify checksum
      if (saveData.checksum !== this.generateChecksum(saveData.gameState)) {
        throw new Error('Save data corrupted');
      }
      
      // Handle version migration if needed
      return this.migrateGameState(saveData);
    } catch (error) {
      console.error('Load failed:', error);
      // Attempt to load backup
      return this.loadBackup();
    }
  }
  
  private generateChecksum(gameState: GameState): string {
    // Simple checksum for save integrity
    return btoa(JSON.stringify(gameState)).slice(0, 16);
  }
  
  private async loadBackup(): Promise<GameState | null> {
    try {
      const backupString = await AsyncStorage.getItem(this.BACKUP_KEY);
      if (!backupString) return null;
      
      const backupData: SaveData = JSON.parse(backupString);
      return this.migrateGameState(backupData);
    } catch (error) {
      console.error('Backup load failed:', error);
      return null;
    }
  }
  
  private migrateGameState(saveData: SaveData): GameState {
    // Handle save version migrations
    let gameState = saveData.gameState;
    
    if (saveData.version !== this.SAVE_VERSION) {
      // Apply migration logic
      gameState = this.applyMigrations(gameState, saveData.version);
    }
    
    return gameState;
  }
}
```

### Auto-Save Implementation

```typescript
// Auto-save every 30 seconds with atomic writes
class AutoSaveManager {
  private saveInterval: NodeJS.Timeout | null = null;
  private saveManager: SaveManager;
  
  startAutoSave(getGameState: () => GameState, intervalMs: number = 30000) {
    this.saveInterval = setInterval(async () => {
      try {
        const gameState = getGameState();
        await this.saveManager.saveGame(gameState);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, intervalMs);
  }
  
  stopAutoSave() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }
}
```

## Cross-Platform Considerations

### Expo Configuration for Multi-Platform

```json
// app.json
{
  "expo": {
    "name": "PetSoft Tycoon",
    "slug": "petsoft-tycoon",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.petsoft.tycoon",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.petsoft.tycoon",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro",
      "display": "standalone",
      "orientation": "portrait"
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

```typescript
// shared/utils/platform.ts
import { Platform, Dimensions } from 'react-native';

export const PlatformUtils = {
  isWeb: Platform.OS === 'web',
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  
  getScreenDimensions: () => Dimensions.get('window'),
  
  getOptimalListItemHeight: () => {
    // Optimize list performance per platform
    if (Platform.OS === 'ios') return 80;
    if (Platform.OS === 'android') return 72;
    return 88; // web
  },
  
  getSafeAreaInsets: () => {
    // Handle safe area for different platforms
    if (Platform.OS === 'web') return { top: 0, bottom: 0 };
    // Use react-native-safe-area-context for mobile
  }
};
```

## Performance Optimization Strategy

### Memory Management

```typescript
// Efficient number formatting for large values
export const formatNumber = (value: number): string => {
  if (value < 1000) return value.toString();
  if (value < 1000000) return `${(value / 1000).toFixed(1)}K`;
  if (value < 1000000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value < 1000000000000) return `${(value / 1000000000).toFixed(1)}B`;
  return `${(value / 1000000000000).toFixed(1)}T`;
};

// BigNumber handling for very large values
import BigNumber from 'bignumber.js';

export const formatBigNumber = (value: BigNumber): string => {
  if (value.lt(1000)) return value.toString();
  // Continue with scientific notation for extreme values
};
```

### FlatList Performance Optimizations

```typescript
// Optimized department unit rendering
const DepartmentUnitList = ({ units, onPurchase }) => {
  const renderUnit = useCallback(({ item, index }) => (
    <MemoizedUnitCard 
      unit={item} 
      onPurchase={onPurchase}
      index={index}
    />
  ), [onPurchase]);
  
  const getItemLayout = useCallback((data, index) => ({
    length: UNIT_HEIGHT,
    offset: UNIT_HEIGHT * index,
    index,
  }), []);
  
  return (
    <FlatList
      data={units}
      renderItem={renderUnit}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={8}
      windowSize={10}
      initialNumToRender={6}
    />
  );
};
```

## Package Versions and Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "expo": "~53.0.0",
    "react-native": "0.76.3",
    "@legendapp/state": "^3.0.0-beta.15",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-native-web": "~0.19.12",
    "@react-native-async-storage/async-storage": "1.25.0",
    "expo-av": "~15.0.1",
    "bignumber.js": "^9.1.2"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~18.3.3",
    "typescript": "~5.3.3",
    "eslint": "^8.57.0",
    "prettier": "^3.0.0"
  }
}
```

### Build Configuration

```javascript
// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      'react-native-reanimated/plugin',
    ],
  };
};
```

## Testing Strategy

### Unit Testing with Jest

```typescript
// features/development/__tests__/developmentStore.test.ts
import { useDevelopment } from '../state/developmentStore';

describe('Development Store', () => {
  beforeEach(() => {
    // Reset store state
  });
  
  it('should calculate production correctly', () => {
    const { hireDeveloper, totalProduction } = useDevelopment();
    
    hireDeveloper('junior'); // 0.1 lines/sec
    hireDeveloper('mid');    // 0.5 lines/sec
    
    expect(totalProduction.get()).toBe(0.6);
  });
  
  it('should apply cost scaling formula', () => {
    const { hireDeveloper, getDeveloperCost } = useDevelopment();
    
    expect(getDeveloperCost('junior')).toBe(10);
    hireDeveloper('junior');
    expect(getDeveloperCost('junior')).toBe(12); // 10 * 1.15^1
  });
});
```

### Integration Testing

```typescript
// __tests__/gameLoop.integration.test.ts
describe('Core Game Loop Integration', () => {
  it('should complete full cycle: code → feature → revenue', async () => {
    const { writeCode, shipFeature } = useGameLoop();
    
    // Write code
    await writeCode();
    expect(getLinesOfCode()).toBe(1);
    
    // Ship feature
    await shipFeature();
    expect(getMoney()).toBeGreaterThan(0);
  });
});
```

## Definition of Done Criteria

### Feature Completion Requirements

Each vertical slice must meet these criteria before completion:

1. **Functionality**
   - [ ] All acceptance criteria implemented
   - [ ] Unit tests with >90% coverage
   - [ ] Integration tests pass
   - [ ] Performance requirements met (<50ms response)

2. **Quality**
   - [ ] Code review completed
   - [ ] ESLint/Prettier formatting applied
   - [ ] No TypeScript errors
   - [ ] Memory leaks tested and resolved

3. **User Experience**
   - [ ] Visual feedback implemented
   - [ ] Audio feedback working
   - [ ] Accessibility requirements met
   - [ ] Cross-platform testing completed

4. **Documentation**
   - [ ] Component documentation updated
   - [ ] API changes documented
   - [ ] Known issues noted

## Deployment Configuration

### EAS Build Setup

```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Build Commands

```bash
# Development build
npx eas build --profile development --platform all

# Production build
npx eas build --profile production --platform all

# Web deployment
npx expo export --platform web
npx serve dist
```

## Risk Mitigation Strategies

### Performance Monitoring

```typescript
// shared/monitoring/PerformanceMonitor.ts
class PerformanceMonitor {
  private frameDrops = 0;
  private lastFrameTime = performance.now();
  
  startMonitoring() {
    const monitor = () => {
      const currentTime = performance.now();
      const frameDelta = currentTime - this.lastFrameTime;
      
      // Detect frame drops (>16.67ms for 60fps)
      if (frameDelta > 20) {
        this.frameDrops++;
      }
      
      this.lastFrameTime = currentTime;
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }
  
  getPerformanceMetrics() {
    return {
      frameDrops: this.frameDrops,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
    };
  }
}
```

### Error Boundaries

```typescript
// shared/ui/ErrorBoundary.tsx
export class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('Game Error:', error, errorInfo);
    
    // Attempt to save game state before crash
    this.emergencySave();
  }
  
  emergencySave = async () => {
    try {
      const gameState = getGlobalGameState();
      await new SaveManager().saveGame(gameState);
    } catch (saveError) {
      console.error('Emergency save failed:', saveError);
    }
  };
  
  render() {
    if (this.state.hasError) {
      return <ErrorScreen onRestart={this.handleRestart} />;
    }
    
    return this.props.children;
  }
}
```

## Conclusion

This technical requirements document provides a comprehensive foundation for implementing PetSoft Tycoon following modern React Native best practices and vertical-slicing architecture. The architecture prioritizes performance, maintainability, and cross-platform compatibility while delivering the engaging idle game experience outlined in the PRD.

Key implementation priorities:
1. **Foundation Phase:** Core game loop with development department
2. **Department Systems:** Vertical slices for each game department
3. **Polish Phase:** Audio, visual effects, and performance optimization
4. **Quality Assurance:** Testing, optimization, and cross-platform validation

The vertical-slicing approach ensures each department can be developed independently while maintaining system cohesion through well-defined interfaces and shared state management patterns.

---

**Document Version:** 1.0  
**Last Updated:** 2025-08-14  
**Technology Stack:** React Native 0.76+ • Expo SDK 53 • @legendapp/state@beta  
**Architecture Pattern:** Vertical Slicing with Feature-Based Organization