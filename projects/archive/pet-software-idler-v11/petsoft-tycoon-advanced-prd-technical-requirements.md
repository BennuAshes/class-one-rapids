# PetSoft Tycoon: Technical Requirements Document
## React Native with Expo SDK 53+ Implementation Specification

---

## 1. Technical Architecture Overview

### Core Technology Stack
- **Framework**: React Native with Expo SDK 53+
- **Language**: TypeScript 5.8+ with strict mode
- **State Management**: TanStack Query v5 for server state, Zustand for client state
- **Navigation**: Expo Router (file-based routing)
- **Animation**: React Native Reanimated 3.0+ for 60 FPS animations
- **Audio**: Expo AV for sound effects and music
- **Storage**: Expo SecureStore for save data with AsyncStorage fallback
- **Testing**: Jest + React Native Testing Library

### Architecture Pattern: Vertical Slicing
Following the pattern from quick-ref.md, all features use vertical slicing:

```
src/features/[feature-name]/
├── index.ts              # Barrel export
├── [Feature]Screen.tsx   # Main component
├── use[Feature].ts       # Custom hook with TanStack Query
├── [feature].types.ts    # Feature-specific types
├── [feature]Api.ts       # API calls/business logic
├── components/           # Feature-specific components
│   ├── [Component].tsx
│   └── index.ts
└── __tests__/           # Feature tests
    ├── [Feature].test.tsx
    └── [feature]Api.test.ts
```

---

## 2. Project Structure & Component Hierarchy

### Expo Router App Structure
```
app/
├── _layout.tsx           # Root layout with providers
├── index.tsx             # Main game screen
├── (tabs)/               # Tab navigation group
│   ├── _layout.tsx       # Tab bar layout
│   ├── game.tsx          # Primary gameplay
│   ├── stats.tsx         # Statistics screen
│   └── settings.tsx      # Settings screen
├── modal.tsx             # Achievement/prestige modals
└── +not-found.tsx        # 404 screen

src/
├── core/                 # Core game systems
│   ├── state/           # Global state management
│   │   ├── gameStore.ts # Zustand store for game state
│   │   └── index.ts
│   ├── game-loop/       # Game loop and timing
│   │   ├── GameLoop.tsx
│   │   └── index.ts
│   ├── save-system/     # Save/load functionality
│   │   ├── SaveSystem.ts
│   │   └── index.ts
│   └── analytics/       # Performance monitoring
│       ├── PerformanceMonitor.ts
│       └── index.ts
├── features/            # Vertical slice features
│   ├── departments/     # Department management
│   ├── prestige/        # Prestige system
│   ├── achievements/    # Achievement system
│   └── settings/        # User settings
└── shared/              # Shared components & utilities
    ├── components/      # Reusable UI components
    ├── hooks/          # Shared custom hooks
    ├── utils/          # Utility functions
    └── types/          # Global type definitions
```

---

## 3. Performance Requirements & Optimization

### Performance Targets
- **Frame Rate**: Sustained 60 FPS during all animations
- **Response Time**: <50ms for all user interactions
- **Load Time**: <3 seconds on 4G connection
- **Memory Usage**: <100MB peak memory on device
- **Battery Impact**: <5% drain per hour of active play

### Optimization Strategies

#### Game Loop Implementation
```typescript
// Core game loop using requestAnimationFrame
class GameLoop {
  private lastUpdate = 0;
  private accumulator = 0;
  private readonly FIXED_TIMESTEP = 16.67; // 60 FPS

  update = (timestamp: number) => {
    const deltaTime = Math.min(timestamp - this.lastUpdate, 100);
    this.lastUpdate = timestamp;
    
    this.accumulator += deltaTime;
    
    // Fixed timestep for consistent game logic
    while (this.accumulator >= this.FIXED_TIMESTEP) {
      this.gameLogic.update(this.FIXED_TIMESTEP);
      this.accumulator -= this.FIXED_TIMESTEP;
    }
    
    // Render with interpolation factor
    this.render(this.accumulator / this.FIXED_TIMESTEP);
    
    requestAnimationFrame(this.update);
  };
}
```

#### Big Number Handling
```typescript
// Custom BigNumber implementation for values >10^15
class BigNumber {
  private value: number;
  private exponent: number;
  
  constructor(value: number, exponent = 0) {
    this.normalize(value, exponent);
  }
  
  private normalize(value: number, exponent: number) {
    while (value >= 1000 && exponent < 308) {
      value /= 1000;
      exponent += 3;
    }
    this.value = value;
    this.exponent = exponent;
  }
  
  toString(): string {
    if (this.exponent === 0) return this.value.toFixed(2);
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp'];
    const suffixIndex = this.exponent / 3;
    return `${this.value.toFixed(2)}${suffixes[suffixIndex] || `e${this.exponent}`}`;
  }
}
```

#### Memory Management
- Object pooling for particles and animations
- Virtualized lists for long department lists  
- Lazy loading of department assets
- Aggressive cleanup of unused components

---

## 4. State Management Architecture

### Global State with Zustand
```typescript
// Core game state store
interface GameState {
  money: BigNumber;
  departments: Department[];
  upgrades: Upgrade[];
  prestige: PrestigeState;
  statistics: Statistics;
  settings: UserSettings;
}

const useGameStore = create<GameState & GameActions>((set, get) => ({
  // State
  money: new BigNumber(0),
  departments: [],
  upgrades: [],
  prestige: { investorPoints: 0, level: 0 },
  statistics: { totalClicks: 0, totalEarned: new BigNumber(0) },
  settings: { soundEnabled: true, musicEnabled: true },
  
  // Actions
  addMoney: (amount: BigNumber) => set(state => ({
    money: state.money.add(amount),
    statistics: {
      ...state.statistics,
      totalEarned: state.statistics.totalEarned.add(amount)
    }
  })),
  
  hireDeveloper: (departmentId: string, unitType: UnitType) => set(state => {
    const cost = calculateUnitCost(unitType, state.departments);
    if (state.money.greaterThan(cost)) {
      return {
        money: state.money.subtract(cost),
        departments: state.departments.map(dept =>
          dept.id === departmentId
            ? { ...dept, units: [...dept.units, createUnit(unitType)] }
            : dept
        )
      };
    }
    return state;
  }),
}));
```

### TanStack Query v5 Integration
```typescript
// Query key factories for type safety
export const gameQueries = {
  all: ['game'] as const,
  save: () => [...gameQueries.all, 'save'] as const,
  statistics: () => [...gameQueries.all, 'statistics'] as const,
  achievements: () => [...gameQueries.all, 'achievements'] as const,
};

// Save system queries
export function useSaveGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (saveData: SaveData) => {
      return await SaveSystem.save(saveData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameQueries.save() });
    },
    onError: (error) => {
      console.error('Save failed:', error);
      // Implement retry logic
    },
  });
}

export function useLoadGame() {
  return useQuery({
    queryKey: gameQueries.save(),
    queryFn: () => SaveSystem.load(),
    staleTime: Infinity, // Save data doesn't go stale
    retry: 3,
  });
}
```

---

## 5. Data Models & Type Definitions

### Core Game Types
```typescript
// Primary game entities
interface Department {
  id: string;
  name: string;
  type: DepartmentType;
  units: Unit[];
  upgrades: DepartmentUpgrade[];
  production: ProductionState;
  synergies: SynergyBonus[];
}

interface Unit {
  id: string;
  type: UnitType;
  level: number;
  production: BigNumber;
  cost: BigNumber;
  purchased: number;
  multiplier: number;
}

interface ProductionState {
  baseRate: BigNumber;
  multiplier: number;
  bonuses: ProductionBonus[];
  currentRate: BigNumber;
}

// Department-specific types
type DepartmentType = 
  | 'development' 
  | 'sales' 
  | 'customerExperience' 
  | 'product' 
  | 'design' 
  | 'qa' 
  | 'marketing';

type UnitType = 
  | 'juniorDev' | 'midDev' | 'seniorDev' | 'techLead'
  | 'salesRep' | 'accountManager' | 'salesDirector' | 'vpSales'
  | 'supportAgent' | 'cxSpecialist' | 'cxManager' | 'cxDirector'
  | 'productAnalyst' | 'productManager' | 'seniorPM' | 'cpo'
  | 'uiDesigner' | 'uxDesigner' | 'designLead' | 'creativeDirector'
  | 'qaTester' | 'qaEngineer' | 'qaLead' | 'qaDirector'
  | 'contentWriter' | 'marketingManager' | 'growthHacker' | 'cmo';

// Prestige system types
interface PrestigeState {
  investorPoints: BigNumber;
  level: number;
  bonuses: PrestigeBonus[];
  availableUpgrades: PrestigeUpgrade[];
}

interface PrestigeBonus {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  cost: BigNumber;
  purchased: boolean;
}
```

### Save Data Structure
```typescript
interface SaveData {
  version: string;
  timestamp: number;
  checksum: string;
  gameState: {
    money: SerializedBigNumber;
    departments: SerializedDepartment[];
    upgrades: SerializedUpgrade[];
    prestige: SerializedPrestigeState;
    statistics: SerializedStatistics;
    settings: UserSettings;
  };
  metadata: {
    playTime: number;
    lastSave: number;
    platform: string;
  };
}

// Serialization helpers
type SerializedBigNumber = {
  value: number;
  exponent: number;
};

function serializeBigNumber(bn: BigNumber): SerializedBigNumber {
  return { value: bn.getValue(), exponent: bn.getExponent() };
}

function deserializeBigNumber(data: SerializedBigNumber): BigNumber {
  return new BigNumber(data.value, data.exponent);
}
```

---

## 6. Animation & Audio Systems

### Animation Architecture with Reanimated 3
```typescript
// Department production animation
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withRepeat,
  withSequence,
  runOnJS
} from 'react-native-reanimated';

function ProductionAnimation({ isActive, onComplete }: ProductionAnimationProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  useEffect(() => {
    if (isActive) {
      // Pulse animation for active production
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1.0, { duration: 500 })
        ),
        -1,
        true
      );
      
      opacity.value = withTiming(1.0, { duration: 300 });
    } else {
      scale.value = withTiming(1.0, { duration: 300 });
      opacity.value = withTiming(0.7, { duration: 300 });
    }
  }, [isActive]);
  
  return (
    <Animated.View style={animatedStyle}>
      {/* Production content */}
    </Animated.View>
  );
}
```

### Audio System Implementation
```typescript
// Audio manager with Expo AV
class AudioManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private music: Audio.Sound | null = null;
  private isEnabled = true;
  private musicEnabled = true;
  
  async loadSounds() {
    const soundAssets = {
      click: require('../assets/audio/click.mp3'),
      purchase: require('../assets/audio/purchase.mp3'),
      achievement: require('../assets/audio/achievement.mp3'),
      prestige: require('../assets/audio/prestige.mp3'),
      background: require('../assets/audio/background.mp3'),
    };
    
    for (const [name, asset] of Object.entries(soundAssets)) {
      try {
        const { sound } = await Audio.Sound.createAsync(asset);
        this.sounds.set(name, sound);
      } catch (error) {
        console.error(`Failed to load sound ${name}:`, error);
      }
    }
  }
  
  playSound(name: string, options?: { volume?: number; rate?: number }) {
    if (!this.isEnabled) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      sound.replayAsync();
      if (options?.volume) sound.setVolumeAsync(options.volume);
      if (options?.rate) sound.setRateAsync(options.rate, true);
    }
  }
  
  async playMusic(loop = true) {
    if (!this.musicEnabled || this.music) return;
    
    try {
      const music = this.sounds.get('background');
      if (music) {
        await music.setIsLoopingAsync(loop);
        await music.playAsync();
        this.music = music;
      }
    } catch (error) {
      console.error('Failed to play background music:', error);
    }
  }
}
```

### Particle System for Celebrations
```typescript
// Particle effect for achievements and milestones
interface Particle {
  id: string;
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  rotation: Animated.SharedValue<number>;
}

function ParticleSystem({ trigger, count = 20 }: ParticleSystemProps) {
  const particles = useRef<Particle[]>([]);
  
  const createParticle = useCallback((): Particle => ({
    id: Math.random().toString(),
    x: useSharedValue(Math.random() * width),
    y: useSharedValue(height),
    scale: useSharedValue(0),
    opacity: useSharedValue(1),
    rotation: useSharedValue(0),
  }), []);
  
  const animateParticles = useCallback(() => {
    particles.current.forEach(particle => {
      particle.scale.value = withTiming(1, { duration: 300 });
      particle.y.value = withTiming(-100, { duration: 2000 });
      particle.rotation.value = withTiming(360, { duration: 2000 });
      particle.opacity.value = withTiming(0, { duration: 1500 });
    });
  }, []);
  
  useEffect(() => {
    if (trigger) {
      particles.current = Array(count).fill(null).map(() => createParticle());
      animateParticles();
    }
  }, [trigger]);
  
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.current.map(particle => (
        <ParticleComponent key={particle.id} particle={particle} />
      ))}
    </View>
  );
}
```

---

## 7. Save/Load System Implementation

### Secure Save System
```typescript
class SaveSystem {
  private static readonly SAVE_KEY = 'petsoft_tycoon_save';
  private static readonly BACKUP_KEYS = ['save_backup_1', 'save_backup_2', 'save_backup_3'];
  
  static async save(gameState: GameState): Promise<void> {
    try {
      const saveData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        checksum: '',
        gameState: this.serializeGameState(gameState),
        metadata: {
          playTime: gameState.statistics.playTime,
          lastSave: Date.now(),
          platform: Platform.OS,
        },
      };
      
      // Generate checksum for integrity
      saveData.checksum = this.generateChecksum(saveData);
      
      // Compress save data
      const compressed = this.compress(JSON.stringify(saveData));
      
      // Save to secure store with backup rotation
      await SecureStore.setItemAsync(this.SAVE_KEY, compressed);
      await this.rotateBackups(compressed);
      
    } catch (error) {
      console.error('Save failed:', error);
      throw new Error('Failed to save game progress');
    }
  }
  
  static async load(): Promise<GameState | null> {
    try {
      // Try main save first, then backups
      const saveKeys = [this.SAVE_KEY, ...this.BACKUP_KEYS];
      
      for (const key of saveKeys) {
        try {
          const compressed = await SecureStore.getItemAsync(key);
          if (!compressed) continue;
          
          const decompressed = this.decompress(compressed);
          const saveData: SaveData = JSON.parse(decompressed);
          
          // Verify checksum
          if (!this.verifyChecksum(saveData)) {
            console.warn(`Corrupted save detected: ${key}`);
            continue;
          }
          
          // Migrate save data if needed
          const migrated = this.migrateSaveData(saveData);
          return this.deserializeGameState(migrated.gameState);
          
        } catch (error) {
          console.warn(`Failed to load from ${key}:`, error);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Load failed:', error);
      return null;
    }
  }
  
  private static compress(data: string): string {
    // Simple LZW compression implementation
    // In production, use a proper compression library
    return data; // Simplified for example
  }
  
  private static generateChecksum(saveData: SaveData): string {
    // Generate SHA-256 hash of game state
    const stateString = JSON.stringify(saveData.gameState);
    return btoa(stateString).slice(0, 16); // Simplified hash
  }
  
  private static async rotateBackups(saveData: string): Promise<void> {
    // Rotate backup saves (keep 3 most recent)
    const backups = [...this.BACKUP_KEYS].reverse();
    
    for (let i = backups.length - 1; i > 0; i--) {
      try {
        const prevBackup = await SecureStore.getItemAsync(backups[i - 1]);
        if (prevBackup) {
          await SecureStore.setItemAsync(backups[i], prevBackup);
        }
      } catch (error) {
        console.warn(`Backup rotation failed for ${backups[i]}:`, error);
      }
    }
    
    // Save current as first backup
    await SecureStore.setItemAsync(backups[0], saveData);
  }
}
```

### Offline Progress Calculation
```typescript
class OfflineProgressCalculator {
  static calculate(gameState: GameState, offlineTime: number): GameState {
    // Cap offline time to 12 hours (43,200,000 ms)
    const cappedTime = Math.min(offlineTime, 12 * 60 * 60 * 1000);
    
    // Apply diminishing returns
    const efficiency = this.getOfflineEfficiency(cappedTime);
    const effectiveTime = cappedTime * efficiency;
    
    let updatedState = { ...gameState };
    
    // Calculate production for each department
    for (const department of updatedState.departments) {
      const production = this.calculateDepartmentProduction(department, effectiveTime);
      updatedState.money = updatedState.money.add(production);
    }
    
    // Update statistics
    updatedState.statistics = {
      ...updatedState.statistics,
      offlineEarnings: updatedState.statistics.offlineEarnings.add(production),
      totalOfflineTime: updatedState.statistics.totalOfflineTime + cappedTime,
    };
    
    return updatedState;
  }
  
  private static getOfflineEfficiency(time: number): number {
    // 100% efficiency for first hour, then diminishing returns
    const hours = time / (60 * 60 * 1000);
    
    if (hours <= 1) return 1.0;
    if (hours <= 4) return 0.5;
    if (hours <= 8) return 0.25;
    return 0.1;
  }
}
```

---

## 8. Cross-Platform Considerations

### Platform-Specific Optimizations

#### iOS Specific
```typescript
// iOS haptic feedback
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';

function useHapticFeedback() {
  const playHaptic = useCallback((style: ImpactFeedbackStyle = ImpactFeedbackStyle.Medium) => {
    if (Platform.OS === 'ios') {
      impactAsync(style);
    }
  }, []);
  
  return { playHaptic };
}
```

#### Android Specific
```typescript
// Android hardware back button handling
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

function useAndroidBackHandler(handler: () => boolean) {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;
      
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handler);
      return () => backHandler.remove();
    }, [handler])
  );
}
```

#### Web Specific
```typescript
// Web-specific keyboard shortcuts
useEffect(() => {
  if (Platform.OS !== 'web') return;
  
  const handleKeyPress = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        handleClick();
        break;
      case 'KeyS':
        if (event.ctrlKey) {
          event.preventDefault();
          handleSave();
        }
        break;
    }
  };
  
  document.addEventListener('keydown', handleKeyPress);
  return () => document.removeEventListener('keydown', handleKeyPress);
}, []);
```

### Responsive Design Implementation
```typescript
// Screen size breakpoints
const breakpoints = {
  small: 0,
  medium: 768,
  large: 1024,
  xlarge: 1440,
} as const;

function useBreakpoint() {
  const dimensions = useWindowDimensions();
  
  const breakpoint = useMemo(() => {
    if (dimensions.width >= breakpoints.xlarge) return 'xlarge';
    if (dimensions.width >= breakpoints.large) return 'large';
    if (dimensions.width >= breakpoints.medium) return 'medium';
    return 'small';
  }, [dimensions.width]);
  
  return {
    breakpoint,
    isSmall: breakpoint === 'small',
    isMedium: breakpoint === 'medium',
    isLarge: breakpoint === 'large',
    isXLarge: breakpoint === 'xlarge',
    width: dimensions.width,
    height: dimensions.height,
  };
}
```

---

## 9. Development Setup & Package Installation

### Package Installation (CRITICAL)
```bash
# Initialize Expo project
npx create-expo-app@latest PetSoftTycoon --template typescript

cd PetSoftTycoon

# ALWAYS use npx expo install for React Native packages
npx expo install react-native-reanimated
npx expo install react-native-screens
npx expo install react-native-safe-area-context
npx expo install react-native-gesture-handler
npx expo install expo-av
npx expo install expo-secure-store
npx expo install expo-haptics
npx expo install expo-constants
npx expo install expo-device

# Use npm/yarn for pure JS packages only
npm install @tanstack/react-query
npm install zustand
npm install immer
npm install date-fns

# Development dependencies
npm install --save-dev jest @types/jest
npm install --save-dev @testing-library/react-native
npm install --save-dev @typescript-eslint/eslint-plugin
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "lib": ["ES2022", "dom"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/shared/components/*"],
      "@/hooks/*": ["src/shared/hooks/*"],
      "@/types/*": ["src/shared/types/*"],
      "@/utils/*": ["src/shared/utils/*"]
    }
  },
  "extends": "expo/tsconfig.base",
  "include": ["src", "app", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

### Expo Configuration (app.json)
```json
{
  "expo": {
    "name": "PetSoft Tycoon",
    "slug": "petsoft-tycoon",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "petsoft-tycoon",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.petsofttycoon",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.petsofttycoon",
      "versionCode": 1
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "react-native-reanimated/plugin"
    ]
  }
}
```

---

## 10. Testing Strategy

### Unit Testing Setup
```typescript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-setup.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// src/test-setup.ts
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Expo modules
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
}));
```

### Example Test Cases
```typescript
// __tests__/core/state/gameStore.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useGameStore } from '../../../src/core/state/gameStore';
import { BigNumber } from '../../../src/shared/utils/BigNumber';

describe('GameStore', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });
  
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGameStore());
    
    expect(result.current.money.toString()).toBe('0.00');
    expect(result.current.departments).toHaveLength(0);
  });
  
  it('should add money correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.addMoney(new BigNumber(100));
    });
    
    expect(result.current.money.toString()).toBe('100.00');
  });
  
  it('should hire developer when sufficient funds', () => {
    const { result } = renderHook(() => useGameStore());
    
    // Setup initial state
    act(() => {
      result.current.addMoney(new BigNumber(1000));
      result.current.addDepartment('development');
    });
    
    act(() => {
      result.current.hireDeveloper('development', 'juniorDev');
    });
    
    const devDepartment = result.current.departments.find(d => d.id === 'development');
    expect(devDepartment?.units).toHaveLength(1);
    expect(result.current.money.lessThan(new BigNumber(1000))).toBe(true);
  });
});
```

---

## 11. Performance Monitoring & Analytics

### Performance Monitor Implementation
```typescript
class PerformanceMonitor {
  private metrics: {
    frameRate: number[];
    memoryUsage: number[];
    renderTime: number[];
    interactionTime: number[];
  } = {
    frameRate: [],
    memoryUsage: [],
    renderTime: [],
    interactionTime: [],
  };
  
  private lastFrameTime = 0;
  
  startMonitoring() {
    this.monitorFrameRate();
    this.monitorMemoryUsage();
  }
  
  private monitorFrameRate() {
    const measureFrame = (timestamp: number) => {
      if (this.lastFrameTime) {
        const fps = 1000 / (timestamp - this.lastFrameTime);
        this.metrics.frameRate.push(fps);
        
        // Keep only last 60 measurements (1 second at 60fps)
        if (this.metrics.frameRate.length > 60) {
          this.metrics.frameRate.shift();
        }
        
        // Alert if FPS drops below 50
        if (fps < 50) {
          this.reportPerformanceIssue('low_fps', { fps });
        }
      }
      
      this.lastFrameTime = timestamp;
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  }
  
  private monitorMemoryUsage() {
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        
        this.metrics.memoryUsage.push(usedMB);
        
        // Keep only last 60 measurements
        if (this.metrics.memoryUsage.length > 60) {
          this.metrics.memoryUsage.shift();
        }
        
        // Alert if memory usage exceeds 100MB
        if (usedMB > 100) {
          this.reportPerformanceIssue('high_memory', { memoryMB: usedMB });
        }
      }
    }, 1000);
  }
  
  measureInteraction(name: string, fn: () => void) {
    const startTime = performance.now();
    
    fn();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.metrics.interactionTime.push(duration);
    
    // Alert if interaction takes longer than 50ms
    if (duration > 50) {
      this.reportPerformanceIssue('slow_interaction', {
        interaction: name,
        duration,
      });
    }
  }
  
  private reportPerformanceIssue(type: string, data: any) {
    console.warn(`Performance issue: ${type}`, data);
    // In production, send to analytics service
  }
  
  getMetrics() {
    const avgFps = this.metrics.frameRate.reduce((a, b) => a + b, 0) / this.metrics.frameRate.length;
    const avgMemory = this.metrics.memoryUsage.reduce((a, b) => a + b, 0) / this.metrics.memoryUsage.length;
    
    return {
      averageFPS: avgFps || 0,
      averageMemoryMB: avgMemory || 0,
      frameDrops: this.metrics.frameRate.filter(fps => fps < 55).length,
      memoryPeakMB: Math.max(...this.metrics.memoryUsage, 0),
    };
  }
}
```

---

## 12. Summary & Implementation Checklist

### Critical Success Factors
1. **Performance First**: 60 FPS is non-negotiable - measure constantly
2. **Vertical Slicing**: Every feature is a complete vertical slice
3. **Type Safety**: Leverage TypeScript strictly, no `any` types
4. **Platform Optimization**: Specific optimizations for iOS/Android/Web
5. **Save Integrity**: Multiple backup saves with checksum validation

### Phase 1 Implementation Order
- [ ] Set up Expo project with TypeScript and essential packages
- [ ] Implement core game loop with 60 FPS target
- [ ] Create Zustand store for game state management
- [ ] Build save/load system with SecureStore
- [ ] Implement BigNumber class for large values
- [ ] Create Development department with 4 unit types
- [ ] Add basic click mechanics and automation
- [ ] Implement performance monitoring system

### Key Anti-Patterns to Avoid
- ❌ Never use `npm install --legacy-peer-deps`
- ❌ Never use `any` type in TypeScript
- ❌ Never implement horizontal layered architecture
- ❌ Never ignore performance monitoring
- ❌ Never skip save data validation

### Package Installation Commands
```bash
# Core packages (use npx expo install)
npx expo install react-native-reanimated react-native-screens expo-av expo-secure-store

# State management (use npm)
npm install @tanstack/react-query zustand immer

# Development (use npm)
npm install --save-dev jest @testing-library/react-native @typescript-eslint/eslint-plugin
```

This technical requirements document provides the complete blueprint for implementing PetSoft Tycoon using React Native with Expo SDK 53+, following vertical slicing architecture and meeting all performance targets specified in the PRD.