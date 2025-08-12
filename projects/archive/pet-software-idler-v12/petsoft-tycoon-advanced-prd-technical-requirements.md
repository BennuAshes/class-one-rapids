# PetSoft Tycoon: Technical Requirements Document
## Version 1.0 | Mobile-First Architecture with React Native & Expo

---

## Executive Summary

This technical requirements document transforms the PetSoft Tycoon web-based PRD into a comprehensive mobile-first implementation using React Native with Expo and Legend State v3. The architecture prioritizes 60 FPS performance, offline-first capabilities, and cross-platform deployment while maintaining the core idle game mechanics.

### Key Architectural Decisions
- **Platform Migration**: Web-based vanilla JavaScript → React Native with Expo Router
- **State Management**: Legend State v3 with MMKV persistence
- **Performance Target**: 60 FPS on mid-tier devices (maintained from PRD)
- **Bundle Size**: <10MB (adjusted for mobile platform)
- **Load Time**: <3 seconds initial app launch

---

## Architecture Specifications

### Core Technology Stack

#### Foundation Layer
| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| **Framework** | React Native | 0.79.x | New Architecture support, Hermes engine |
| **Platform** | Expo | ~53.0.0 | Zero native config, cloud builds, universal deployment |
| **Routing** | Expo Router | ^4.0.0 | File-based routing, static analysis benefits |
| **Language** | TypeScript | ^5.8.0 | Type safety, modern module resolution |
| **State Management** | Legend State v3 | ^3.0.0-beta | Fine-grained reactivity, 4kb bundle size |
| **Persistence** | MMKV | ^3.0.2 | 30x faster than AsyncStorage |

#### Development Tools
| Tool | Purpose | Configuration |
|------|---------|--------------|
| **ESLint** | Code quality | Expo preset + strict TypeScript rules |
| **Jest** | Unit testing | React Native preset with Legend State integration |
| **Flipper** | Debugging | React Native + Legend State plugins |
| **EAS Build** | CI/CD | Cloud builds for iOS/Android |

### Performance Requirements

#### Target Device Specifications
```typescript
// Minimum performance target
const PERFORMANCE_TARGETS = {
  device: {
    cpu: 'Snapdragon 660 / A10 Bionic equivalent',
    ram: '4GB',
    storage: '64GB',
    gpu: 'Adreno 512 / PowerVR equivalent'
  },
  metrics: {
    fps: 60,
    loadTime: 3000, // milliseconds
    memoryUsage: 75, // MB maximum
    bundleSize: 10 * 1024 * 1024, // 10MB
    responseTime: 50 // milliseconds for interactions
  }
} as const;
```

#### Performance Optimization Strategy
1. **Legend State Fine-Grained Reactivity**: Only re-render components with changed observables
2. **MMKV Synchronous Persistence**: Eliminate async storage bottlenecks
3. **Expo Router Code Splitting**: Dynamic import for non-essential features
4. **React Native New Architecture**: Fabric renderer + TurboModules
5. **Hermes Engine**: Pre-compilation and memory optimization

---

## Data Models & State Management

### Legend State v3 Observable Architecture

#### Core Game State Structure
```typescript
interface GameState {
  player: PlayerState;
  departments: DepartmentStore;
  progression: ProgressionState;
  ui: UIState;
  persistence: PersistenceState;
  
  // Computed properties
  totalValuation: () => number;
  currentRevenue: () => number;
  nextPrestigeAvailable: () => boolean;
  
  // Actions
  actions: GameActions;
}

interface PlayerState {
  currency: number;
  linesOfCode: number;
  features: {
    basic: number;
    advanced: number;
    premium: number;
  };
  startTime: number;
  lastActiveTime: number;
}

interface DepartmentStore {
  development: DevelopmentDepartment;
  sales: SalesDepartment;
  marketing: MarketingDepartment;
  hr: HRDepartment;
  finance: FinanceDepartment;
  operations: OperationsDepartment;
  executive: ExecutiveDepartment;
}

interface DevelopmentDepartment {
  employees: {
    junior: number;
    mid: number;
    senior: number;
    techLead: number;
  };
  upgrades: {
    betterIde: number; // 0-3 levels
    pairProgramming: boolean;
    codeReviews: boolean;
  };
  production: {
    linesPerSecond: number;
    efficiency: number;
  };
}
```

#### Observable Implementation
```typescript
import { observable, computed, batch } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';

// Main game observable
export const gameState$ = observable<GameState>({
  player: {
    currency: 0,
    linesOfCode: 0,
    features: { basic: 0, advanced: 0, premium: 0 },
    startTime: Date.now(),
    lastActiveTime: Date.now()
  },
  
  departments: {
    development: {
      employees: { junior: 0, mid: 0, senior: 0, techLead: 0 },
      upgrades: { betterIde: 0, pairProgramming: false, codeReviews: false },
      production: { linesPerSecond: 0, efficiency: 1 }
    },
    // ... other departments
  },
  
  // Computed total company valuation
  totalValuation: computed(() => {
    const player = gameState$.player.get();
    const deps = gameState$.departments.get();
    
    return Math.floor(
      player.currency * 0.1 +
      Object.values(deps).reduce((sum, dept) => 
        sum + calculateDepartmentValue(dept), 0
      )
    );
  }),
  
  // Game actions
  actions: {
    writeCode: () => {
      batch(() => {
        gameState$.player.linesOfCode.set(prev => prev + 1);
        gameState$.player.lastActiveTime.set(Date.now());
      });
    },
    
    hireDeveloper: (type: keyof DevelopmentDepartment['employees']) => {
      const cost = getDeveloperCost(type, gameState$.departments.development.employees[type].peek());
      
      if (gameState$.player.currency.peek() >= cost) {
        batch(() => {
          gameState$.player.currency.set(prev => prev - cost);
          gameState$.departments.development.employees[type].set(prev => prev + 1);
          updateProductionRates();
        });
      }
    }
  }
});

// Persistence configuration
syncObservable(gameState$, {
  persist: {
    name: 'petsoft-tycoon-save',
    plugin: ObservablePersistMMKV,
    transform: {
      // Custom serialization for performance
      save: (value) => JSON.stringify(value),
      load: (value) => JSON.parse(value)
    }
  }
});
```

### Save/Load System Implementation

#### Auto-Save Strategy
```typescript
import { when, observe } from '@legendapp/state';

class SaveSystem {
  private saveInterval: NodeJS.Timeout | null = null;
  private pendingSave = false;
  
  initialize() {
    // Auto-save every 30 seconds
    this.saveInterval = setInterval(() => {
      this.performSave();
    }, 30000);
    
    // Save on significant events
    observe(gameState$.player.currency, (currency) => {
      if (currency.get() % 1000 === 0) {
        this.performSave();
      }
    });
    
    // Save on app state changes
    observe(gameState$.departments, () => {
      this.scheduleSave();
    });
  }
  
  private scheduleSave() {
    if (!this.pendingSave) {
      this.pendingSave = true;
      // Debounce saves to avoid excessive writes
      setTimeout(() => {
        this.performSave();
        this.pendingSave = false;
      }, 5000);
    }
  }
  
  private async performSave() {
    try {
      const saveData = {
        ...gameState$.peek(),
        metadata: {
          version: '1.0',
          saveTime: Date.now(),
          platform: Platform.OS
        }
      };
      
      // MMKV handles the actual persistence automatically
      // via Legend State sync configuration
      
      __DEV__ && console.log('Game saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      // Implement retry logic here
    }
  }
  
  async loadSave(): Promise<boolean> {
    try {
      // Wait for Legend State to load persisted data
      await when(syncState$.isLoaded);
      
      // Perform offline progress calculation
      this.calculateOfflineProgress();
      
      return true;
    } catch (error) {
      console.error('Load failed:', error);
      return false;
    }
  }
  
  private calculateOfflineProgress() {
    const now = Date.now();
    const lastActive = gameState$.player.lastActiveTime.peek();
    const offlineTime = Math.min(now - lastActive, 12 * 60 * 60 * 1000); // 12h cap
    
    if (offlineTime > 60000) { // More than 1 minute
      const offlineGains = this.calculateIdleProduction(offlineTime);
      
      batch(() => {
        gameState$.player.currency.set(prev => prev + offlineGains.currency);
        gameState$.player.linesOfCode.set(prev => prev + offlineGains.linesOfCode);
        gameState$.player.lastActiveTime.set(now);
      });
      
      // Show offline progress modal
      this.showOfflineProgress(offlineGains, offlineTime);
    }
  }
}
```

---

## Component Hierarchy & Organization

### Vertical Slicing Architecture

Following the research best practices, the app structure uses vertical slicing with feature co-location:

```
src/
├── core/
│   ├── state/
│   │   ├── gameStore.ts         # Main Legend State observable
│   │   ├── saveSystem.ts        # Save/load logic
│   │   └── gameLoop.ts          # Main game loop
│   ├── game-loop/
│   │   ├── GameLoop.tsx         # Game loop component
│   │   ├── PerformanceMonitor.ts # FPS monitoring
│   │   └── index.ts
│   └── utils/
│       ├── calculations.ts      # Game math utilities
│       ├── formatting.ts        # Number formatting
│       └── BigNumber.ts         # Large number handling
│
├── features/
│   ├── departments/
│   │   ├── DepartmentScreen.tsx
│   │   ├── DepartmentCard.tsx
│   │   ├── EmployeeList.tsx
│   │   ├── useDepartment.ts
│   │   ├── department.types.ts
│   │   └── index.ts
│   │
│   ├── progression/
│   │   ├── ProgressionScreen.tsx
│   │   ├── PrestigeModal.tsx
│   │   ├── AchievementList.tsx
│   │   ├── useProgression.ts
│   │   └── index.ts
│   │
│   └── dashboard/
│       ├── DashboardScreen.tsx
│       ├── StatsSummary.tsx
│       ├── QuickActions.tsx
│       └── index.ts
│
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Animated/
│   │   │       ├── CounterAnimation.tsx
│   │   │       ├── ProgressBar.tsx
│   │   │       └── ParticleSystem.tsx
│   │   └── game/
│   │       ├── CurrencyDisplay.tsx
│   │       ├── ProductionRate.tsx
│   │       └── ActionButton.tsx
│   │
│   ├── hooks/
│   │   ├── useGameLoop.ts
│   │   ├── usePerformanceMonitor.ts
│   │   └── useAudioManager.ts
│   │
│   └── utils/
│       ├── constants.ts
│       ├── validation.ts
│       └── performance.ts
│
└── app/
    ├── (tabs)/
    │   ├── _layout.tsx          # Tab navigator
    │   ├── index.tsx            # Dashboard
    │   ├── departments.tsx      # Departments screen
    │   ├── progression.tsx      # Progression screen
    │   └── settings.tsx         # Settings screen
    │
    ├── modal/
    │   ├── prestige.tsx         # Prestige modal
    │   ├── achievements.tsx     # Achievements modal
    │   └── offline-progress.tsx # Offline progress modal
    │
    ├── _layout.tsx              # Root layout
    └── +not-found.tsx           # 404 handler
```

### Component Implementation Patterns

#### Fine-Grained Reactive Components
```typescript
import { observer, Memo, Show, For } from '@legendapp/state/react';
import { $Text, $View, $Pressable } from '@legendapp/state/react-native';

// Department employee list with optimized rendering
function EmployeeList({ department$ }: { department$: Observable<DevelopmentDepartment> }) {
  return (
    <$View style={styles.employeeContainer}>
      <For each={Object.entries(department$.employees.peek())}>
        {([type, count$], index) => (
          <Memo key={type}>
            {() => (
              <$View style={styles.employeeRow}>
                <$Text style={styles.employeeType}>
                  {formatEmployeeType(type)}
                </$Text>
                <$Text style={styles.employeeCount}>
                  {count$.get()}
                </$Text>
                <$Pressable
                  onPress={() => gameState$.actions.hireDeveloper(type)}
                  style={styles.hireButton}
                >
                  <$Text>Hire (+{getHireCost(type, count$.get())})</$Text>
                </$Pressable>
              </$View>
            )}
          </Memo>
        )}
      </For>
    </$View>
  );
}

// Conditional rendering for upgrades
function DepartmentUpgrades({ department$ }: { department$: Observable<DevelopmentDepartment> }) {
  return (
    <$View style={styles.upgradesContainer}>
      <Show if={() => department$.employees.junior.get() >= 10}>
        <UpgradeButton
          title="Better IDE (Level 1)"
          cost={5000}
          purchased={department$.upgrades.betterIde.get() >= 1}
          onPurchase={() => purchaseUpgrade('betterIde', 1)}
        />
      </Show>
      
      <Show if={() => department$.employees.junior.get() >= 25}>
        <UpgradeButton
          title="Pair Programming"
          cost={25000}
          purchased={department$.upgrades.pairProgramming.get()}
          onPurchase={() => purchaseUpgrade('pairProgramming')}
        />
      </Show>
    </$View>
  );
}
```

---

## Animation & Audio System Requirements

### Animation Framework
Built on React Native Reanimated 3 with Legend State integration:

```typescript
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';

// Currency animation system
class CurrencyAnimationSystem {
  private animationQueue: Array<{
    amount: number;
    type: 'gain' | 'loss';
    source: string;
  }> = [];
  
  animateValueChange(
    currentValue: SharedValue<number>,
    newValue: number,
    duration = 500
  ) {
    currentValue.value = withTiming(newValue, {
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
  }
  
  createCounterAnimation() {
    const displayValue = useSharedValue(0);
    
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: withSpring(displayValue.value > 0 ? 1 : 0.7),
      transform: [
        {
          scale: withSpring(displayValue.value > 0 ? 1.1 : 1, {
            damping: 15,
            stiffness: 200
          })
        }
      ]
    }));
    
    return { displayValue, animatedStyle };
  }
}

// Particle system for visual feedback
class ParticleEffectSystem {
  createFloatingText(
    x: number,
    y: number,
    text: string,
    color: string = '#00ff00'
  ) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      position: 'absolute',
      left: x,
      top: y + translateY.value,
      opacity: opacity.value,
      zIndex: 1000
    }));
    
    // Animate upward and fade out
    translateY.value = withTiming(-50, { duration: 1500 });
    opacity.value = withTiming(0, { duration: 1500 });
    
    return animatedStyle;
  }
  
  createButtonPressEffect() {
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }]
    }));
    
    const triggerEffect = () => {
      scale.value = withSpring(0.95, { duration: 100 }, () => {
        scale.value = withSpring(1, { duration: 200 });
      });
    };
    
    return { animatedStyle, triggerEffect };
  }
}
```

### Audio System Architecture
```typescript
import { Audio } from 'expo-av';

interface AudioAssets {
  background: string;
  buttonClick: string;
  moneyGain: string;
  levelUp: string;
  achievement: string;
  error: string;
}

class AudioManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private backgroundMusic: Audio.Sound | null = null;
  private isEnabled = true;
  private volume = 0.7;
  
  async initialize() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false
    });
    
    // Preload all sound effects
    const soundAssets: AudioAssets = {
      background: require('../assets/audio/background.mp3'),
      buttonClick: require('../assets/audio/click.wav'),
      moneyGain: require('../assets/audio/money.wav'),
      levelUp: require('../assets/audio/levelup.wav'),
      achievement: require('../assets/audio/achievement.wav'),
      error: require('../assets/audio/error.wav')
    };
    
    for (const [key, asset] of Object.entries(soundAssets)) {
      const { sound } = await Audio.Sound.createAsync(asset, {
        shouldPlay: false,
        volume: key === 'background' ? 0.3 : this.volume
      });
      this.sounds.set(key, sound);
    }
    
    this.backgroundMusic = this.sounds.get('background');
    if (this.backgroundMusic) {
      await this.backgroundMusic.setIsLoopingAsync(true);
    }
  }
  
  async playSound(soundKey: string, options?: { volume?: number; interrupt?: boolean }) {
    if (!this.isEnabled) return;
    
    const sound = this.sounds.get(soundKey);
    if (sound) {
      try {
        await sound.setPositionAsync(0);
        if (options?.volume) {
          await sound.setVolumeAsync(options.volume);
        }
        await sound.playAsync();
      } catch (error) {
        console.warn('Audio play failed:', error);
      }
    }
  }
  
  async playBackgroundMusic() {
    if (this.backgroundMusic && this.isEnabled) {
      await this.backgroundMusic.playAsync();
    }
  }
  
  async pauseBackgroundMusic() {
    if (this.backgroundMusic) {
      await this.backgroundMusic.pauseAsync();
    }
  }
}
```

---

## Cross-Platform Considerations

### Platform-Specific Adaptations

#### iOS Considerations
```typescript
import { Platform } from 'react-native';

const iosSpecificConfig = {
  // Safe Area handling
  useSafeAreaInsets: true,
  
  // Haptic feedback
  hapticFeedback: {
    enabled: true,
    types: {
      light: 'impactLight',
      medium: 'impactMedium',
      heavy: 'impactHeavy'
    }
  },
  
  // Performance optimizations
  performance: {
    removeClippedSubviews: Platform.OS === 'ios',
    maxToRenderPerBatch: Platform.OS === 'ios' ? 10 : 5,
    windowSize: Platform.OS === 'ios' ? 21 : 10
  }
};
```

#### Android Considerations
```typescript
const androidSpecificConfig = {
  // Hardware back button handling
  backHandler: {
    enabled: true,
    preventDefault: ['PrestigeModal', 'SettingsScreen']
  },
  
  // Status bar configuration
  statusBar: {
    backgroundColor: '#1a1a1a',
    barStyle: 'light-content',
    translucent: true
  },
  
  // Performance optimizations for lower-end devices
  performance: {
    renderAheadOfTime: false,
    removeClippedSubviews: true,
    collapsable: false
  }
};
```

#### Web Considerations (Expo Web)
```typescript
const webSpecificConfig = {
  // Responsive design breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },
  
  // Keyboard shortcuts
  shortcuts: {
    'Space': 'writeCode',
    'Enter': 'shipFeature',
    'P': 'prestige',
    'S': 'save'
  },
  
  // PWA configuration
  pwa: {
    enabled: true,
    offline: true,
    installPrompt: true
  }
};
```

### Universal Styling System
```typescript
import { StyleSheet } from 'react-native';

const createStyles = () => StyleSheet.create({
  // Base styles that work across platforms
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: Platform.select({
      ios: 16,
      android: 16,
      web: 24
    })
  },
  
  button: {
    paddingVertical: Platform.select({
      ios: 12,
      android: 16,
      web: 14
    }),
    paddingHorizontal: 24,
    borderRadius: Platform.select({
      ios: 8,
      android: 4,
      web: 6
    }),
    backgroundColor: '#007AFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
        cursor: 'pointer'
      }
    })
  }
});
```

---

## Pattern Reconciliation: Expo Router vs Vertical Slicing

### Challenge Analysis
The integration of Expo Router (file-based routing) with Vertical Slicing (feature-based organization) creates potential architectural conflicts:

1. **Expo Router**: Expects routes in `/app` directory with specific naming conventions
2. **Vertical Slicing**: Organizes code by features, potentially scattering routes
3. **Navigation Logic**: Route definitions vs. feature-specific navigation needs

### Reconciliation Strategy

#### Hybrid Architecture Approach
```
app/                          # Expo Router requirements
├── (tabs)/                   # Tab-based navigation
│   ├── _layout.tsx          # Tab configuration
│   ├── index.tsx            # Dashboard route (imports from features)
│   ├── departments.tsx      # Department route (imports from features)
│   └── progression.tsx      # Progression route (imports from features)
│
├── modal/                   # Modal routes
│   ├── prestige.tsx         # Prestige modal route
│   └── achievements.tsx     # Achievements modal route
│
└── _layout.tsx              # Root layout

features/                     # Vertical slicing
├── dashboard/
│   ├── DashboardScreen.tsx   # Actual screen component
│   ├── components/          # Feature-specific components
│   ├── hooks/              # Feature-specific hooks
│   └── index.ts            # Barrel export
│
├── departments/
│   ├── DepartmentsScreen.tsx
│   ├── components/
│   ├── hooks/
│   └── index.ts
│
└── progression/
    ├── ProgressionScreen.tsx
    ├── components/
    ├── hooks/
    └── index.ts
```

#### Implementation Pattern
```typescript
// app/(tabs)/departments.tsx - Route file (minimal)
import { DepartmentsScreen } from '../../features/departments';
export default DepartmentsScreen;

// features/departments/DepartmentsScreen.tsx - Actual implementation
export function DepartmentsScreen() {
  const departments = use$(gameState$.departments);
  
  return (
    <ScrollView style={styles.container}>
      <For each={Object.entries(departments)}>
        {([key, department$]) => (
          <DepartmentCard
            key={key}
            department$={department$}
            type={key}
          />
        )}
      </For>
    </ScrollView>
  );
}

// features/departments/index.ts - Barrel export
export { DepartmentsScreen } from './DepartmentsScreen';
export { DepartmentCard } from './components/DepartmentCard';
export { useDepartment } from './hooks/useDepartment';
export type { DepartmentType } from './types';
```

This pattern maintains Expo Router's file-based routing while preserving the benefits of vertical slicing for feature organization.

---

## Deep Reflection: Edge Cases & Potential Issues

### Performance Edge Cases

#### Memory Pressure Scenarios
```typescript
// Scenario: Long-running game sessions with memory accumulation
const MemoryOptimization = {
  // Issue: Legend State observable growth
  prevention: {
    // Limit observable history
    observableConfig: { history: 10 },
    
    // Periodic cleanup of unused computed values
    cleanup: () => {
      // Remove stale computeds every 5 minutes
      setInterval(() => {
        Object.keys(gameState$).forEach(key => {
          if (key.startsWith('_computed_') && isStale(key)) {
            delete gameState$[key];
          }
        });
      }, 300000);
    }
  },
  
  // Issue: Animation memory leaks
  animationCleanup: {
    componentUnmount: () => {
      // Cancel all running animations
      animationRefs.current.forEach(ref => {
        ref.cancel?.();
      });
    }
  }
};

// Scenario: Rapid state changes overwhelming render cycle
const RenderOptimization = {
  // Batch rapid updates
  batchUpdates: (updates: Array<() => void>) => {
    batch(() => {
      updates.forEach(update => update());
    });
  },
  
  // Debounce expensive computations
  debouncedComputed: (fn: () => any, delay = 100) => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fn, delay);
    };
  }
};
```

#### Large Number Handling
```typescript
// Issue: JavaScript number precision limits (idle games reach large values)
import { BigNumber } from 'bignumber.js';

class GameMath {
  static currency(value: string | number | BigNumber): BigNumber {
    return new BigNumber(value);
  }
  
  static formatCurrency(value: BigNumber): string {
    if (value.lt(1000)) return value.toFixed(0);
    if (value.lt(1000000)) return `${value.div(1000).toFixed(1)}K`;
    if (value.lt(1000000000)) return `${value.div(1000000).toFixed(2)}M`;
    if (value.lt(1000000000000)) return `${value.div(1000000000).toFixed(2)}B`;
    return `${value.div(1000000000000).toFixed(2)}T`;
  }
  
  // Prevent overflow in calculations
  static safeMultiply(a: BigNumber, b: BigNumber): BigNumber {
    const result = a.multipliedBy(b);
    if (result.isNaN() || !result.isFinite()) {
      throw new Error('Calculation overflow detected');
    }
    return result;
  }
}
```

### Data Consistency Issues

#### Save Data Corruption
```typescript
class SaveValidation {
  static validateSaveData(data: any): boolean {
    const schema = {
      player: {
        currency: 'number',
        linesOfCode: 'number',
        startTime: 'number'
      },
      departments: 'object',
      version: 'string'
    };
    
    return this.deepValidate(data, schema);
  }
  
  static createBackupSave(data: GameState): void {
    const backup = {
      ...data,
      backup: true,
      timestamp: Date.now()
    };
    
    // Store multiple backup versions
    for (let i = 2; i >= 0; i--) {
      const current = storage.getString(`save_backup_${i}`);
      if (current) {
        storage.set(`save_backup_${i + 1}`, current);
      }
    }
    
    storage.set('save_backup_0', JSON.stringify(backup));
  }
  
  static recoverFromBackup(): GameState | null {
    for (let i = 0; i < 3; i++) {
      const backup = storage.getString(`save_backup_${i}`);
      if (backup) {
        try {
          const data = JSON.parse(backup);
          if (this.validateSaveData(data)) {
            return data;
          }
        } catch (e) {
          continue;
        }
      }
    }
    return null;
  }
}
```

#### Synchronization Race Conditions
```typescript
class StateSync {
  private syncQueue: Array<() => Promise<void>> = [];
  private isSyncing = false;
  
  async queueSync(operation: () => Promise<void>) {
    this.syncQueue.push(operation);
    
    if (!this.isSyncing) {
      this.processSyncQueue();
    }
  }
  
  private async processSyncQueue() {
    this.isSyncing = true;
    
    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue.shift()!;
      try {
        await operation();
      } catch (error) {
        console.error('Sync operation failed:', error);
        // Implement retry logic
      }
    }
    
    this.isSyncing = false;
  }
}
```

### Platform-Specific Edge Cases

#### iOS Background App Refresh
```typescript
import { AppState } from 'react-native';

class BackgroundHandler {
  private backgroundTime: number = 0;
  
  initialize() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }
  
  private handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'background') {
      this.backgroundTime = Date.now();
      // Save immediately before going to background
      gameState$.actions.forceSave();
    } else if (nextAppState === 'active') {
      if (this.backgroundTime > 0) {
        const backgroundDuration = Date.now() - this.backgroundTime;
        // Handle potential offline progress
        this.processBackgroundTime(backgroundDuration);
      }
    }
  };
}
```

#### Android Memory Pressure
```typescript
import { DeviceEventEmitter } from 'react-native';

class AndroidMemoryHandler {
  initialize() {
    DeviceEventEmitter.addListener('memoryWarning', this.handleMemoryWarning);
  }
  
  private handleMemoryWarning = () => {
    // Aggressive cleanup on memory pressure
    this.clearCaches();
    this.pauseNonEssentialAnimations();
    this.forceSave();
  };
  
  private clearCaches() {
    // Clear animation caches
    // Dispose of unused observables
    // Reduce particle effects
  }
}
```

### Business Logic Edge Cases

#### Prestige Calculation Overflow
```typescript
class PrestigeSystem {
  calculateInvestorPoints(valuation: BigNumber): BigNumber {
    // Prevent calculation errors at extreme values
    if (valuation.lt(10000000)) {
      return new BigNumber(0);
    }
    
    const baseIP = valuation.div(1000000).floor();
    
    // Cap IP to prevent game-breaking values
    const maxIP = new BigNumber(1000000);
    return BigNumber.min(baseIP, maxIP);
  }
  
  validatePrestigeEligibility(state: GameState): {
    eligible: boolean;
    reason?: string;
  } {
    const valuation = this.calculateValuation(state);
    
    if (valuation.lt(10000000)) {
      return { 
        eligible: false, 
        reason: 'Minimum valuation not reached ($10M required)' 
      };
    }
    
    if (state.progression.lastPrestigeTime && 
        Date.now() - state.progression.lastPrestigeTime < 300000) {
      return { 
        eligible: false, 
        reason: 'Must wait 5 minutes between prestiges' 
      };
    }
    
    return { eligible: true };
  }
}
```

---

## Conclusion

This technical requirements document provides a comprehensive foundation for implementing PetSoft Tycoon as a mobile-first application using modern React Native architecture. The combination of Expo Router, Legend State v3, and MMKV persistence creates a powerful, performant foundation that can achieve the specified 60 FPS performance targets while maintaining offline-first capabilities.

Key architectural decisions prioritize:
1. **Performance**: Fine-grained reactivity with Legend State v3
2. **Developer Experience**: Expo Router with vertical slicing reconciliation
3. **Cross-platform Support**: Universal styling and platform-specific optimizations
4. **Data Integrity**: Robust save/load system with corruption recovery
5. **Scalability**: Proper handling of large numbers and memory optimization

The deep reflection phase identifies critical edge cases that must be addressed during implementation to ensure a stable, high-quality user experience across all target platforms.