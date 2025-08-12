# PetSoft Tycoon: Technical Requirements Document
## Advanced Architecture Specifications

### Document Version: 1.0
### Date: August 11, 2025
### Status: Development Ready

---

## Executive Summary

This technical requirements document translates the PetSoft Tycoon PRD into specific implementation guidelines using React Native with Expo, Legend State for state management, and modern cross-platform best practices. The architecture prioritizes 60 FPS performance, sub-3-second load times, and seamless cross-platform deployment.

---

## Architecture Overview

### Technology Stack

**Core Framework**
- **React Native**: 0.76+ (New Architecture with Fabric + TurboModules)
- **Expo SDK**: 53+ (latest with New Architecture default)
- **TypeScript**: ES2022 target for modern JavaScript features
- **Metro**: Latest with platform-specific bundling

**State Management**
- **Legend State v3**: Primary state management solution
- **Observable patterns**: Reactive state updates for real-time game mechanics
- **Persistence**: Legend State's built-in persistence for save/load system

**Cross-Platform Support**
- **iOS**: Native iOS app via Expo
- **Android**: Native Android app via Expo  
- **Web**: React Native Web with PWA capabilities
- **Responsive Design**: Tablet and desktop optimized

### Project Structure

```
PetSoftTycoon/
├── app/                          # Expo Router (file-based routing)
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation layout
│   │   ├── index.tsx            # Game screen (main)
│   │   ├── statistics.tsx       # Statistics and achievements
│   │   └── settings.tsx         # Settings and save management
│   ├── _layout.tsx              # Root layout with providers
│   └── index.tsx                # Entry redirect
├── src/
│   ├── core/                    # Core game systems
│   │   ├── services/
│   │   │   ├── gameLoop.ts      # Main game loop (60 FPS)
│   │   │   ├── saveSystem.ts    # Save/load with corruption protection
│   │   │   └── offlineProgress.ts # Offline calculation engine
│   │   └── state/
│   │       ├── gameState.ts     # Root Legend State store
│   │       └── persistConfig.ts # Persistence configuration
│   ├── features/                # Feature-based vertical slicing
│   │   ├── departments/
│   │   │   ├── components/
│   │   │   │   ├── DepartmentCard.tsx
│   │   │   │   ├── EmployeeList.tsx
│   │   │   │   └── UpgradeButton.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDepartmentProgress.ts
│   │   │   │   └── useAutomation.ts
│   │   │   └── state/
│   │   │       └── departmentStore.ts
│   │   ├── employees/
│   │   │   ├── components/
│   │   │   │   ├── EmployeeHirePage.tsx
│   │   │   │   └── ManagerControls.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useEmployeeEfficiency.ts
│   │   │   └── state/
│   │   │       └── employeeStore.ts
│   │   ├── prestige/
│   │   │   ├── components/
│   │   │   │   ├── PrestigeModal.tsx
│   │   │   │   └── InvestorPointsDisplay.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePrestigeCalculation.ts
│   │   │   └── state/
│   │   │       └── prestigeStore.ts
│   │   └── achievements/
│   │       ├── components/
│   │       │   └── AchievementNotification.tsx
│   │       ├── hooks/
│   │       │   └── useAchievementTracking.ts
│   │       └── data/
│   │           └── achievementDefinitions.ts
│   ├── components/common/        # Shared UI components
│   │   ├── Button.tsx
│   │   ├── NumberDisplay.tsx     # Formatted large numbers
│   │   ├── ProgressBar.tsx
│   │   └── LoadingSpinner.tsx
│   ├── hooks/                   # Shared custom hooks
│   │   ├── useGameLoop.ts
│   │   ├── usePerformanceMonitor.ts
│   │   └── useNumberFormatter.ts
│   └── shared/
│       ├── constants/
│       │   ├── gameConfig.ts     # Balance and configuration
│       │   └── animations.ts     # Animation constants
│       ├── utils/
│       │   ├── mathUtils.ts      # Game calculations
│       │   ├── formatters.ts     # Number and text formatting
│       │   └── performance.ts    # Performance optimization utilities
│       └── types/
│           ├── gameTypes.ts      # TypeScript interfaces
│           └── stateTypes.ts     # State shape definitions
├── assets/                      # Static assets
│   ├── images/
│   ├── sounds/
│   └── fonts/
├── eas.json                     # Build configuration
├── app.json                     # Expo configuration
├── metro.config.js              # Bundle configuration
└── tsconfig.json               # TypeScript configuration
```

---

## Performance Requirements

### Frame Rate Specifications
- **Target**: 60 FPS sustained during all gameplay
- **Minimum**: 55 FPS (anything lower is visually noticeable lag)
- **Critical Threshold**: 50 FPS unacceptable
- **Monitoring**: Real-time FPS tracking with performance warnings

### Load Time Requirements
- **Initial App Load**: <3 seconds to playable state
- **Save Game Load**: <1 second for save file processing
- **Asset Loading**: Progressive loading with core gameplay first
- **Offline Calculation**: <500ms for up to 12 hours of offline progress

### Memory Usage
- **Target**: <200MB RAM usage during normal gameplay
- **Maximum**: <500MB peak memory usage
- **Garbage Collection**: Minimize allocations in game loop
- **Asset Management**: Efficient texture and audio memory management

### Bundle Size
- **Web Build**: <50MB initial download
- **Mobile App**: <100MB maximum app size
- **Progressive Loading**: Core features available immediately
- **Asset Optimization**: Compressed textures and audio files

### Response Time
- **Input Latency**: <50ms for all user interactions
- **Animation Response**: Immediate visual feedback on tap
- **State Updates**: <16ms for game state calculations (60 FPS budget)
- **Save Operations**: <100ms for automatic saves

---

## Data Models & State Management

### Legend State Architecture

**Root State Structure**
```typescript
// src/core/state/gameState.ts
export const gameState = observable({
  // Core game progress
  core: {
    money: 0,
    linesOfCode: 0,
    currentTime: Date.now(),
    lastSaveTime: Date.now(),
    gameStartTime: Date.now(),
    totalPlaytime: 0,
  },

  // Department system
  departments: {
    development: {
      employees: [/* employee objects */],
      manager: null,
      productivity: 1.0,
      automationLevel: 0,
      unlocked: true,
    },
    sales: {
      employees: [],
      manager: null,
      productivity: 1.0,
      automationLevel: 0,
      unlocked: false,
    },
    // ... other 5 departments
  },

  // Prestige system
  prestige: {
    totalRuns: 0,
    investorPoints: 0,
    currentRunValue: 0,
    bonusMultipliers: {
      production: 1.0,
      cost: 1.0,
      offline: 1.0,
    },
  },

  // Achievement tracking
  achievements: {
    unlocked: new Set<string>(),
    progress: new Map<string, number>(),
    notifications: [],
  },

  // Settings and preferences
  settings: {
    audioEnabled: true,
    animationsEnabled: true,
    autoSave: true,
    offlineProgressEnabled: true,
    numberFormat: 'scientific', // 'scientific' | 'engineering' | 'letters'
  },

  // Performance monitoring
  performance: {
    fps: 60,
    frameTimeHistory: [],
    memoryUsage: 0,
    lastOptimization: 0,
  },
});
```

**State Persistence Configuration**
```typescript
// src/core/state/persistConfig.ts
import { persistObservable } from '@legendapp/state/persist';

persistObservable(gameState, {
  local: 'PetSoftTycoon_SaveGame',
  transform: {
    // Custom serialization for Sets and Maps
    save: (value) => ({
      ...value,
      achievements: {
        ...value.achievements,
        unlocked: Array.from(value.achievements.unlocked),
        progress: Object.fromEntries(value.achievements.progress),
      },
    }),
    load: (value) => ({
      ...value,
      achievements: {
        ...value.achievements,
        unlocked: new Set(value.achievements.unlocked || []),
        progress: new Map(Object.entries(value.achievements.progress || {})),
      },
    }),
  },
  pluginLocal: {
    AsyncStorage: true, // For React Native
    localStorage: true, // For Web
  },
});
```

### Department Data Models

**Employee Hierarchy**
```typescript
// src/shared/types/gameTypes.ts
export interface Employee {
  id: string;
  type: EmployeeType;
  department: DepartmentType;
  level: number;
  productionRate: number;
  cost: number;
  efficiency: number;
  hiredAt: number;
  experience: number;
}

export type EmployeeType = 
  | 'junior_dev' | 'mid_dev' | 'senior_dev' | 'tech_lead'
  | 'sales_rep' | 'account_manager' | 'sales_director' | 'vp_sales'
  | 'support_agent' | 'cx_specialist' | 'cx_manager' | 'cx_director'
  | 'product_analyst' | 'product_manager' | 'senior_pm' | 'cpo'
  | 'ui_designer' | 'ux_designer' | 'design_lead' | 'creative_director'
  | 'qa_tester' | 'qa_engineer' | 'qa_lead' | 'qa_director'
  | 'content_writer' | 'marketing_manager' | 'growth_hacker' | 'cmo';

export interface Manager extends Employee {
  automationCapability: number;
  managementBonus: number;
  autoUpgradeEnabled: boolean;
}
```

**Department Configuration**
```typescript
// src/shared/constants/gameConfig.ts
export const DEPARTMENTS = {
  development: {
    name: 'Development',
    description: 'Core resource generation (Lines of Code)',
    unlockCost: 0,
    baseProduction: 1,
    employees: [
      {
        type: 'junior_dev',
        baseCost: 100,
        baseProduction: 1,
        costMultiplier: 1.15,
      },
      // ... other employee types
    ],
    synergies: ['sales', 'product', 'design'],
  },
  // ... other departments
} as const;
```

---

## Component Hierarchy & Organization

### Screen-Level Components

**Main Game Screen (app/(tabs)/index.tsx)**
```typescript
export default function GameScreen() {
  const { fps } = usePerformanceMonitor();
  const gameLoop = useGameLoop();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#1a1a2e" />
      
      {/* Performance Overlay (dev mode) */}
      {__DEV__ && <PerformanceOverlay fps={fps} />}
      
      {/* Header with money and core stats */}
      <GameHeader />
      
      {/* Main scrollable content */}
      <ScrollView style={styles.content}>
        <DepartmentGrid />
        <UpgradeSection />
        <PrestigeSection />
      </ScrollView>
      
      {/* Achievement notifications */}
      <AchievementNotifications />
      
      {/* Floating action for manual production */}
      <FloatingActionButton />
    </SafeAreaView>
  );
}
```

### Feature Components

**Department Card Component**
```typescript
// src/features/departments/components/DepartmentCard.tsx
export const DepartmentCard = memo(({ departmentId }: { departmentId: DepartmentType }) => {
  const department = useObservable(gameState.departments[departmentId]);
  const { totalProduction, efficiency } = useDepartmentProgress(departmentId);
  const { isAutomated, managerLevel } = useAutomation(departmentId);
  
  const handleHireEmployee = useCallback((employeeType: EmployeeType) => {
    hireDepartmentEmployee(departmentId, employeeType);
  }, [departmentId]);

  if (!department.unlocked.get()) return null;

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <DepartmentHeader 
        name={departmentId} 
        isAutomated={isAutomated}
        efficiency={efficiency}
      />
      
      <EmployeeList 
        employees={department.employees.get()}
        onHire={handleHireEmployee}
      />
      
      <ProductionDisplay 
        currentRate={totalProduction}
        projectedIncome={calculateProjectedIncome(departmentId)}
      />
      
      {managerLevel === 0 && (
        <ManagerHireButton 
          cost={getManagerCost(departmentId)}
          onHire={() => hireManager(departmentId)}
        />
      )}
    </Animated.View>
  );
});
```

### Performance-Optimized List Components
```typescript
// src/components/common/OptimizedFlatList.tsx
export const OptimizedFlatList = <T,>({ 
  data, 
  renderItem, 
  itemHeight,
  ...props 
}: OptimizedFlatListProps<T>) => {
  const keyExtractor = useCallback((item: T, index: number) => 
    `${(item as any).id || index}`, []);
  
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }), [itemHeight]);

  const memoizedRenderItem = useCallback(renderItem, [renderItem]);

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
      {...props}
    />
  );
};
```

---

## Animation & Audio System

### Animation Architecture

**Reanimated 3 Integration**
```typescript
// src/shared/utils/animations.ts
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS,
  useDerivedValue
} from 'react-native-reanimated';

export const useNumberCountUp = (targetValue: number, duration: number = 1000) => {
  const animatedValue = useSharedValue(0);
  
  const animatedProps = useDerivedValue(() => {
    return {
      text: Math.floor(animatedValue.value).toString(),
    };
  });
  
  const startAnimation = useCallback(() => {
    animatedValue.value = withTiming(targetValue, { duration });
  }, [targetValue, duration]);
  
  return { animatedProps, startAnimation };
};

export const SPRING_CONFIGS = {
  gentle: { damping: 15, stiffness: 120 },
  bouncy: { damping: 8, stiffness: 200 },
  immediate: { damping: 20, stiffness: 400 },
} as const;
```

**Performance-First Animation Strategy**
```typescript
// src/components/common/AnimatedNumberDisplay.tsx
export const AnimatedNumberDisplay = ({ value, formatType = 'currency' }) => {
  const displayValue = useSharedValue(value);
  const { animatedProps } = useNumberCountUp(value);
  
  // Only animate significant changes (>5% difference)
  const shouldAnimate = Math.abs(value - displayValue.value) / displayValue.value > 0.05;
  
  useEffect(() => {
    if (shouldAnimate) {
      displayValue.value = withTiming(value, { duration: 800 });
    } else {
      displayValue.value = value; // Instant update for small changes
    }
  }, [value, shouldAnimate]);
  
  return (
    <AnimatedText 
      style={styles.numberText}
      animatedProps={animatedProps}
    />
  );
};
```

### Audio System Architecture

**Web Audio API Integration**
```typescript
// src/core/services/audioSystem.ts
class AudioSystem {
  private context: AudioContext;
  private sounds: Map<string, AudioBuffer> = new Map();
  private masterGain: GainNode;
  private sfxGain: GainNode;
  private musicGain: GainNode;

  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.setupGainNodes();
  }

  private setupGainNodes() {
    this.masterGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    
    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);
  }

  async loadSound(name: string, url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
    }
  }

  playSound(name: string, volume: number = 1, pitch: number = 1) {
    const sound = this.sounds.get(name);
    if (!sound) return;

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    
    source.buffer = sound;
    source.playbackRate.value = pitch;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.sfxGain);
    
    source.start();
  }

  // Dynamic audio mixing for game events
  playProgressionSound(amount: number, baseFrequency: number = 440) {
    // Higher amounts = higher pitch and volume
    const pitch = 1 + (Math.log10(amount) * 0.1);
    const volume = Math.min(0.8, 0.2 + (Math.log10(amount) * 0.1));
    
    this.playSound('coin', volume, pitch);
  }
}

export const audioSystem = new AudioSystem();
```

**Sound Asset Management**
```typescript
// src/shared/constants/audio.ts
export const SOUND_LIBRARY = {
  ui: {
    click: 'assets/sounds/ui/click.wav',
    hover: 'assets/sounds/ui/hover.wav',
    success: 'assets/sounds/ui/success.wav',
    error: 'assets/sounds/ui/error.wav',
  },
  game: {
    coin: 'assets/sounds/game/coin.wav',
    purchase: 'assets/sounds/game/purchase.wav',
    levelUp: 'assets/sounds/game/level-up.wav',
    achievement: 'assets/sounds/game/achievement.wav',
    prestige: 'assets/sounds/game/prestige.wav',
  },
  ambient: {
    office: 'assets/sounds/ambient/office-background.mp3',
    typing: 'assets/sounds/ambient/keyboard-typing.wav',
  },
} as const;

// Preload priority sounds
export const PRELOAD_SOUNDS = [
  'ui.click',
  'game.coin',
  'game.purchase',
] as const;
```

---

## Save/Load System Implementation

### Multi-Layer Save Architecture

**Primary Save System (Legend State + LocalStorage)**
```typescript
// src/core/services/saveSystem.ts
class SaveSystem {
  private readonly SAVE_VERSION = 1;
  private readonly MAX_BACKUP_SLOTS = 5;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.setupAutoSave();
    this.setupCorruptionDetection();
  }

  private setupAutoSave() {
    // Auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      if (gameState.settings.autoSave.get()) {
        this.saveGame();
      }
    }, 30000);
  }

  async saveGame(): Promise<SaveResult> {
    try {
      const saveData = {
        version: this.SAVE_VERSION,
        timestamp: Date.now(),
        gameState: this.serializeGameState(),
        checksum: '', // Will be calculated
      };
      
      // Calculate checksum for corruption detection
      saveData.checksum = this.calculateChecksum(saveData.gameState);
      
      // Create backup before saving
      await this.createBackup();
      
      // Save to primary location
      localStorage.setItem('PetSoftTycoon_SaveGame', JSON.stringify(saveData));
      
      // Update last save time
      gameState.core.lastSaveTime.set(Date.now());
      
      return { success: true, message: 'Game saved successfully' };
    } catch (error) {
      console.error('Save failed:', error);
      return { success: false, message: 'Save failed: ' + error.message };
    }
  }

  async loadGame(): Promise<LoadResult> {
    try {
      const savedData = localStorage.getItem('PetSoftTycoon_SaveGame');
      if (!savedData) {
        return { success: false, message: 'No save data found' };
      }

      const saveData = JSON.parse(savedData);
      
      // Verify save integrity
      const isValid = this.verifySaveIntegrity(saveData);
      if (!isValid) {
        return this.attemptRecovery();
      }

      // Load and apply save data
      this.deserializeGameState(saveData.gameState);
      
      // Calculate offline progress
      const offlineTime = Date.now() - saveData.timestamp;
      if (offlineTime > 60000) { // 1 minute minimum
        const progress = calculateOfflineProgress(offlineTime);
        this.applyOfflineProgress(progress);
      }

      return { success: true, message: 'Game loaded successfully' };
    } catch (error) {
      console.error('Load failed:', error);
      return this.attemptRecovery();
    }
  }

  private calculateChecksum(data: any): string {
    // Simple checksum using JSON string hash
    const jsonString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private async createBackup(): Promise<void> {
    const currentSave = localStorage.getItem('PetSoftTycoon_SaveGame');
    if (!currentSave) return;

    // Rotate backups (keep last 5)
    for (let i = this.MAX_BACKUP_SLOTS - 1; i > 0; i--) {
      const backup = localStorage.getItem(`PetSoftTycoon_Backup_${i}`);
      if (backup) {
        localStorage.setItem(`PetSoftTycoon_Backup_${i + 1}`, backup);
      }
    }

    localStorage.setItem('PetSoftTycoon_Backup_1', currentSave);
  }

  exportSave(): string {
    const saveData = localStorage.getItem('PetSoftTycoon_SaveGame');
    if (!saveData) throw new Error('No save data to export');
    
    // Compress and encode for easy sharing
    return btoa(JSON.stringify({
      data: saveData,
      exported: Date.now(),
      version: this.SAVE_VERSION,
    }));
  }

  async importSave(encodedSave: string): Promise<ImportResult> {
    try {
      const decoded = JSON.parse(atob(encodedSave));
      
      // Verify import format
      if (!decoded.data || decoded.version !== this.SAVE_VERSION) {
        throw new Error('Invalid save format');
      }

      // Create backup before importing
      await this.createBackup();
      
      // Apply imported data
      localStorage.setItem('PetSoftTycoon_SaveGame', decoded.data);
      
      return { success: true, message: 'Save imported successfully' };
    } catch (error) {
      return { success: false, message: 'Import failed: ' + error.message };
    }
  }
}

export const saveSystem = new SaveSystem();
```

### Offline Progress Calculation

**Offline Revenue Engine**
```typescript
// src/core/services/offlineProgress.ts
export function calculateOfflineProgress(offlineTimeMs: number): OfflineProgress {
  const offlineHours = Math.min(offlineTimeMs / (1000 * 60 * 60), 12); // 12 hour cap
  const currentState = gameState.get();
  
  let totalProduction = 0;
  let totalRevenue = 0;
  
  // Calculate production for each department
  for (const [deptId, dept] of Object.entries(currentState.departments)) {
    if (!dept.unlocked) continue;
    
    const deptProduction = calculateDepartmentProduction(dept);
    const deptRevenue = calculateDepartmentRevenue(dept, deptProduction);
    
    // Apply offline efficiency penalty (90% efficiency)
    const offlineEfficiency = 0.9;
    totalProduction += deptProduction * offlineHours * offlineEfficiency;
    totalRevenue += deptRevenue * offlineHours * offlineEfficiency;
  }
  
  // Apply prestige bonuses
  const prestigeMultiplier = currentState.prestige.bonusMultipliers.offline;
  totalRevenue *= prestigeMultiplier;
  
  // Diminishing returns for longer offline periods
  const diminishingFactor = Math.pow(0.95, Math.max(0, offlineHours - 4));
  totalRevenue *= diminishingFactor;
  
  return {
    duration: offlineTimeMs,
    durationHours: offlineHours,
    linesOfCodeGenerated: Math.floor(totalProduction),
    revenueGenerated: Math.floor(totalRevenue),
    efficiencyRating: offlineEfficiency * diminishingFactor,
  };
}
```

---

## Cross-Platform Considerations

### Platform-Specific Configurations

**App Configuration (app.json)**
```json
{
  "expo": {
    "name": "PetSoft Tycoon",
    "slug": "petsoft-tycoon",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "platforms": ["ios", "android", "web"],
    
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1a2e"
    },
    
    "assetBundlePatterns": [
      "**/*"
    ],
    
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.petsoft.tycoon",
      "buildNumber": "1.0.0",
      "requireFullScreen": false,
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1a1a2e"
      },
      "package": "com.petsoft.tycoon",
      "versionCode": 1,
      "permissions": [],
      "config": {
        "googleServicesFile": "./google-services.json"
      }
    },
    
    "web": {
      "favicon": "./assets/favicon.png",
      "name": "PetSoft Tycoon",
      "shortName": "PetSoft",
      "description": "Build your pet software empire",
      "backgroundColor": "#1a1a2e",
      "themeColor": "#16213e",
      "display": "standalone",
      "orientation": "portrait-primary",
      "startUrl": "/",
      "lang": "en"
    },
    
    "plugins": [
      "expo-router",
      [
        "expo-screen-orientation",
        {
          "initialOrientation": "PORTRAIT_UP"
        }
      ]
    ],
    
    "experiments": {
      "typedRoutes": true
    },
    
    "extra": {
      "router": {
        "origin": false
      }
    }
  }
}
```

**Platform-Specific Styling**
```typescript
// src/shared/styles/platformStyles.ts
export const createPlatformStyles = () => {
  return StyleSheet.create({
    shadow: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
        android: {
          elevation: 8,
        },
        web: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        },
      }),
    },
    
    buttonPress: {
      ...Platform.select({
        ios: {
          transform: [{ scale: 0.95 }],
        },
        android: {
          opacity: 0.8,
        },
        web: {
          transform: [{ scale: 0.98 }],
        },
      }),
    },
    
    safeArea: {
      ...Platform.select({
        ios: {
          paddingTop: 0, // SafeAreaView handles this
        },
        android: {
          paddingTop: StatusBar.currentHeight || 0,
        },
        web: {
          paddingTop: 0,
        },
      }),
    },
    
    text: {
      fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }),
    },
  });
};
```

### Responsive Design Strategy

**Adaptive Layout System**
```typescript
// src/hooks/useResponsiveLayout.ts
export const useResponsiveLayout = () => {
  const { width, height } = useWindowDimensions();
  
  const layout = useMemo(() => {
    // Phone portrait
    if (width < 768) {
      return {
        type: 'mobile',
        departmentColumns: 1,
        maxModalWidth: width * 0.95,
        fontSize: {
          small: 12,
          medium: 16,
          large: 20,
          xlarge: 24,
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
        },
      };
    }
    
    // Tablet portrait or phone landscape
    if (width < 1024) {
      return {
        type: 'tablet',
        departmentColumns: 2,
        maxModalWidth: 600,
        fontSize: {
          small: 14,
          medium: 18,
          large: 22,
          xlarge: 26,
        },
        spacing: {
          xs: 6,
          sm: 12,
          md: 20,
          lg: 28,
        },
      };
    }
    
    // Desktop/tablet landscape
    return {
      type: 'desktop',
      departmentColumns: 3,
      maxModalWidth: 800,
      fontSize: {
        small: 16,
        medium: 20,
        large: 24,
        xlarge: 28,
      },
      spacing: {
        xs: 8,
        sm: 16,
        md: 24,
        lg: 32,
      },
    };
  }, [width, height]);
  
  return layout;
};
```

### Web-Specific Optimizations

**PWA Configuration**
```typescript
// src/core/services/pwaService.ts
class PWAService {
  private deferredPrompt: any = null;
  
  constructor() {
    this.setupPWAHandlers();
  }
  
  private setupPWAHandlers() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });
    
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.deferredPrompt = null;
    });
  }
  
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    this.deferredPrompt = null;
    return outcome === 'accepted';
  }
  
  canInstall(): boolean {
    return !!this.deferredPrompt;
  }
}

export const pwaService = new PWAService();
```

---

## Build Configuration & Deployment

### EAS Build Configuration
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { 
        "resourceClass": "m-medium",
        "simulator": true 
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    
    "preview": {
      "distribution": "internal",
      "ios": { 
        "simulator": true,
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    
    "production": {
      "ios": { 
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "NODE_ENV": "production"
      }
    },
    
    "production-web": {
      "extends": "production",
      "platform": "web",
      "config": "webpack.config.js"
    }
  },
  
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### Metro Configuration for Performance
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable New Architecture support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Optimize bundle size
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
    output: {
      comments: false,
    },
  },
};

// Asset resolution
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'wav', 'mp3', 'ogg', // Audio files
];

// Performance optimizations
config.serializer = {
  ...config.serializer,
  customSerializer: require('metro-symbolicate/src/symbolicate').customSerializer,
};

module.exports = config;
```

---

## Performance Monitoring & Optimization

### Real-Time Performance Tracking
```typescript
// src/hooks/usePerformanceMonitor.ts
export const usePerformanceMonitor = () => {
  const frameTimeHistory = useRef<number[]>([]);
  const lastFrameTime = useRef<number>(performance.now());
  const fps = useSharedValue(60);
  
  const measurePerformance = useCallback(() => {
    const now = performance.now();
    const frameTime = now - lastFrameTime.current;
    lastFrameTime.current = now;
    
    frameTimeHistory.current.push(frameTime);
    if (frameTimeHistory.current.length > 60) {
      frameTimeHistory.current.shift();
    }
    
    // Calculate average FPS over last 60 frames
    const averageFrameTime = frameTimeHistory.current.reduce((a, b) => a + b, 0) / frameTimeHistory.current.length;
    const currentFps = 1000 / averageFrameTime;
    
    fps.value = withTiming(currentFps, { duration: 100 });
    
    // Performance warnings
    if (currentFps < 50) {
      console.warn(`Performance warning: ${currentFps.toFixed(1)} FPS`);
      // Trigger performance optimization
      triggerPerformanceOptimization();
    }
    
    // Update game state performance metrics
    runOnJS(() => {
      gameState.performance.fps.set(Math.round(currentFps));
      gameState.performance.frameTimeHistory.set([...frameTimeHistory.current]);
    })();
  }, []);
  
  useEffect(() => {
    const interval = setInterval(measurePerformance, 1000 / 60); // 60 FPS monitoring
    return () => clearInterval(interval);
  }, [measurePerformance]);
  
  return {
    fps: fps.value,
    frameTimeHistory: frameTimeHistory.current,
    averageFrameTime: frameTimeHistory.current.reduce((a, b) => a + b, 0) / frameTimeHistory.current.length,
  };
};
```

### Memory Management
```typescript
// src/shared/utils/memoryManager.ts
class MemoryManager {
  private memoryUsage = new Map<string, number>();
  private cleanupCallbacks = new Set<() => void>();
  
  registerCleanupCallback(callback: () => void) {
    this.cleanupCallbacks.add(callback);
  }
  
  unregisterCleanupCallback(callback: () => void) {
    this.cleanupCallbacks.delete(callback);
  }
  
  trackMemoryUsage(component: string, bytes: number) {
    this.memoryUsage.set(component, bytes);
    this.checkMemoryPressure();
  }
  
  private checkMemoryPressure() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      
      // Trigger cleanup at 400MB usage
      if (usedMB > 400) {
        this.triggerMemoryCleanup();
      }
    }
  }
  
  private triggerMemoryCleanup() {
    console.log('Triggering memory cleanup...');
    
    // Run all registered cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Cleanup callback failed:', error);
      }
    });
    
    // Force garbage collection if available
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
  }
  
  getMemoryReport() {
    return {
      components: Object.fromEntries(this.memoryUsage),
      total: Array.from(this.memoryUsage.values()).reduce((sum, bytes) => sum + bytes, 0),
      browser: typeof window !== 'undefined' && 'memory' in performance 
        ? (performance as any).memory 
        : null,
    };
  }
}

export const memoryManager = new MemoryManager();
```

---

## Development & Testing Strategy

### Test Configuration
```typescript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Performance Testing
```typescript
// __tests__/performance.test.ts
import { measureRender } from '@callstack/reassure';
import { DepartmentCard } from '../src/features/departments/components/DepartmentCard';

describe('Performance Tests', () => {
  test('DepartmentCard renders efficiently with large employee list', async () => {
    const largeDepartment = {
      employees: Array(1000).fill(null).map((_, i) => ({
        id: `emp_${i}`,
        type: 'junior_dev',
        level: 1,
        productionRate: 1,
        cost: 100,
      })),
    };
    
    await measureRender(
      <DepartmentCard department={largeDepartment} />,
      { runs: 10 }
    );
  });
  
  test('Game loop maintains 60 FPS under load', () => {
    const startTime = performance.now();
    const frames = [];
    
    // Simulate 1 second of game loop
    for (let i = 0; i < 60; i++) {
      const frameStart = performance.now();
      
      // Simulate game calculations
      calculateAllDepartmentProduction();
      updateGameState();
      
      const frameEnd = performance.now();
      frames.push(frameEnd - frameStart);
    }
    
    const averageFrameTime = frames.reduce((a, b) => a + b, 0) / frames.length;
    const fps = 1000 / averageFrameTime;
    
    expect(fps).toBeGreaterThan(55); // Allow 5 FPS margin
    expect(Math.max(...frames)).toBeLessThan(20); // No frame should take >20ms
  });
});
```

---

## Technical Decision Summary

### Core Architecture Decisions
1. **React Native 0.76+ with New Architecture**: Leverages Fabric and TurboModules for superior performance
2. **Legend State v3**: Observable state management with built-in persistence and optimistic updates
3. **Expo SDK 53+**: Modern development tooling with seamless cross-platform deployment
4. **File-based routing**: Expo Router for scalable navigation architecture

### Performance Optimizations
1. **60 FPS Target**: Real-time monitoring with automatic optimization triggers
2. **Memory Management**: Proactive cleanup and garbage collection strategies
3. **Bundle Optimization**: Platform-specific builds with tree shaking and minification
4. **Progressive Loading**: Core gameplay available within 3 seconds

### Cross-Platform Strategy
1. **Platform-Agnostic Core**: Shared business logic across all platforms
2. **Adaptive UI**: Responsive design system for mobile, tablet, and desktop
3. **Native Performance**: Platform-specific optimizations where needed
4. **PWA Support**: Web version with app-like experience

### State Management Architecture
1. **Vertical Feature Slicing**: Department-based state organization
2. **Observable Patterns**: Reactive updates for real-time gameplay
3. **Persistence Layer**: Automatic saves with corruption detection and recovery
4. **Performance Monitoring**: Built-in metrics tracking and optimization

### Quality Assurance
1. **TypeScript**: Strong typing for reduced runtime errors
2. **Performance Testing**: Automated FPS and memory usage validation
3. **Cross-Platform Testing**: Consistent behavior across iOS, Android, and Web
4. **Save System Reliability**: Multiple backup layers with integrity verification

This technical architecture provides a solid foundation for building PetSoft Tycoon as a premium idle game experience that meets all performance requirements while maintaining code quality and development efficiency across all target platforms.