# Phase 1: Foundation Setup

**Duration**: 3-5 days  
**Status**: Not Started  
**Prerequisites**: Phase 0 (Analysis) completed

## Objectives

1. Initialize Expo project with SDK 53+ and TypeScript
2. Configure development environment and project structure
3. Implement core game systems foundation
4. Set up state management with Zustand and TanStack Query v5
5. Create basic save/load system with SecureStore
6. Establish testing framework and initial tests

## Tasks Overview

### Day 1: Project Initialization
- [ ] Create Expo project with TypeScript template
- [ ] Install and configure essential packages
- [ ] Set up project directory structure
- [ ] Configure TypeScript with strict settings

### Day 2-3: Core Systems
- [ ] Implement game loop architecture  
- [ ] Create Zustand store for game state
- [ ] Set up TanStack Query for async operations
- [ ] Build BigNumber class for large values

### Day 4-5: Persistence & Testing
- [ ] Implement save/load system with SecureStore
- [ ] Set up performance monitoring
- [ ] Create testing framework and initial tests
- [ ] Validate foundation architecture

## Detailed Implementation

### Step 1: Project Initialization

#### 1.1 Create Expo Project
```bash
# Navigate to the PetSoftTycoon directory (should already exist)
cd /mnt/c/dev/class-one-rapids/projects/pet-software-idler/PetSoftTycoon

# Verify the project exists and has basic Expo structure
ls -la

# If project needs initialization (only if not done already):
# npx create-expo-app@latest . --template typescript
```

**Validation**: 
```bash
# Verify package.json exists and contains Expo dependencies
cat package.json | grep expo

# Verify app/ directory exists for Expo Router
ls -la app/
```

#### 1.2 Install Core Dependencies
```bash
# CRITICAL: Always use npx expo install for React Native packages
npx expo install react-native-reanimated
npx expo install react-native-screens  
npx expo install react-native-safe-area-context
npx expo install react-native-gesture-handler
npx expo install expo-av
npx expo install expo-secure-store
npx expo install expo-haptics
npx expo install expo-constants
npx expo install expo-device

# Use npm/yarn for pure JavaScript packages
npm install @tanstack/react-query
npm install zustand
npm install immer
npm install date-fns

# Development dependencies
npm install --save-dev jest @types/jest
npm install --save-dev @testing-library/react-native
npm install --save-dev @typescript-eslint/eslint-plugin
npm install --save-dev @typescript-eslint/parser
```

**Validation**:
```bash
# Verify no legacy peer deps warnings
npm ls --depth=0 | grep -i peer

# Verify TypeScript packages are installed
npm ls typescript @types/jest @testing-library/react-native
```

#### 1.3 Configure TypeScript
```bash
# Update tsconfig.json with strict configuration
```

**Create/Update tsconfig.json**:
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
      "@/utils/*": ["src/shared/utils/*"],
      "@/features/*": ["src/features/*"],
      "@/core/*": ["src/core/*"]
    }
  },
  "extends": "expo/tsconfig.base",
  "include": ["src", "app", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

**Validation**:
```bash
# Verify TypeScript configuration
npx tsc --noEmit
```

### Step 2: Project Structure Setup

#### 2.1 Create Directory Structure
```bash
# Create core directory structure following vertical slicing pattern
mkdir -p src/core/state
mkdir -p src/core/game-loop  
mkdir -p src/core/save-system
mkdir -p src/core/analytics
mkdir -p src/features/departments
mkdir -p src/features/prestige
mkdir -p src/features/achievements
mkdir -p src/features/settings
mkdir -p src/shared/components
mkdir -p src/shared/hooks
mkdir -p src/shared/types
mkdir -p src/shared/utils
mkdir -p __tests__/core/state
mkdir -p __tests__/core/save-system
mkdir -p __tests__/shared/components
```

**Validation**:
```bash
# Verify directory structure matches specification
tree src/ -I 'node_modules'
```

#### 2.2 Create Barrel Export Files
```bash
# Create index.ts files for clean imports
touch src/core/index.ts
touch src/core/state/index.ts
touch src/core/game-loop/index.ts
touch src/core/save-system/index.ts
touch src/core/analytics/index.ts
touch src/shared/components/index.ts
touch src/shared/hooks/index.ts
touch src/shared/types/index.ts
touch src/shared/utils/index.ts
```

### Step 3: Core Game Systems

#### 3.1 Implement BigNumber Class
**File**: `src/shared/utils/BigNumber.ts`

```typescript
/**
 * Custom BigNumber implementation optimized for idle game values
 * Handles values from 0 to 10^308 with scientific notation display
 */
export class BigNumber {
  private value: number;
  private exponent: number;
  
  constructor(value: number = 0, exponent: number = 0) {
    this.normalize(value, exponent);
  }
  
  private normalize(value: number, exponent: number): void {
    if (value === 0) {
      this.value = 0;
      this.exponent = 0;
      return;
    }
    
    // Normalize to keep value between 1 and 1000
    while (value >= 1000 && exponent < 308) {
      value /= 1000;
      exponent += 3;
    }
    
    while (value < 1 && value > 0 && exponent > 0) {
      value *= 1000;
      exponent -= 3;
    }
    
    this.value = value;
    this.exponent = exponent;
  }
  
  add(other: BigNumber): BigNumber {
    if (this.exponent === other.exponent) {
      return new BigNumber(this.value + other.value, this.exponent);
    }
    
    // Convert to same exponent for addition
    const [larger, smaller] = this.exponent > other.exponent ? 
      [this, other] : [other, this];
    
    const exponentDiff = larger.exponent - smaller.exponent;
    const adjustedSmaller = smaller.value / Math.pow(1000, exponentDiff / 3);
    
    return new BigNumber(larger.value + adjustedSmaller, larger.exponent);
  }
  
  multiply(multiplier: number): BigNumber {
    return new BigNumber(this.value * multiplier, this.exponent);
  }
  
  greaterThan(other: BigNumber): boolean {
    if (this.exponent > other.exponent) return true;
    if (this.exponent < other.exponent) return false;
    return this.value > other.value;
  }
  
  toString(): string {
    if (this.exponent === 0) {
      return this.value.toFixed(2);
    }
    
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp'];
    const suffixIndex = this.exponent / 3;
    
    if (suffixIndex < suffixes.length) {
      return `${this.value.toFixed(2)}${suffixes[suffixIndex]}`;
    }
    
    return `${this.value.toFixed(2)}e${this.exponent}`;
  }
  
  // Serialization for save system
  serialize(): { value: number; exponent: number } {
    return { value: this.value, exponent: this.exponent };
  }
  
  static deserialize(data: { value: number; exponent: number }): BigNumber {
    return new BigNumber(data.value, data.exponent);
  }
}
```

#### 3.2 Implement Game Loop
**File**: `src/core/game-loop/GameLoop.tsx`

```typescript
import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../state/gameStore';

interface GameLoopProps {
  children: React.ReactNode;
}

export class GameLoopEngine {
  private lastUpdate = 0;
  private accumulator = 0;
  private readonly FIXED_TIMESTEP = 16.67; // 60 FPS
  private isRunning = false;
  private animationFrame?: number;
  
  constructor(private updateCallback: (deltaTime: number) => void) {}
  
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastUpdate = performance.now();
    this.accumulator = 0;
    this.update(this.lastUpdate);
  }
  
  stop(): void {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
  
  private update = (timestamp: number): void => {
    if (!this.isRunning) return;
    
    const deltaTime = Math.min(timestamp - this.lastUpdate, 100); // Cap at 100ms
    this.lastUpdate = timestamp;
    
    this.accumulator += deltaTime;
    
    // Fixed timestep for consistent game logic
    while (this.accumulator >= this.FIXED_TIMESTEP) {
      this.updateCallback(this.FIXED_TIMESTEP);
      this.accumulator -= this.FIXED_TIMESTEP;
    }
    
    this.animationFrame = requestAnimationFrame(this.update);
  };
}

export function GameLoop({ children }: GameLoopProps) {
  const gameLoopRef = useRef<GameLoopEngine | null>(null);
  const { updateProduction } = useGameStore();
  
  const handleUpdate = useCallback((deltaTime: number) => {
    updateProduction(deltaTime);
  }, [updateProduction]);
  
  useEffect(() => {
    gameLoopRef.current = new GameLoopEngine(handleUpdate);
    gameLoopRef.current.start();
    
    return () => {
      gameLoopRef.current?.stop();
    };
  }, [handleUpdate]);
  
  return <>{children}</>;
}
```

#### 3.3 Create Zustand Game Store  
**File**: `src/core/state/gameStore.ts`

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { BigNumber } from '../../shared/utils/BigNumber';

export interface Department {
  id: string;
  name: string;
  type: DepartmentType;
  units: Unit[];
  production: ProductionState;
}

export interface Unit {
  id: string;
  type: UnitType;
  count: number;
  cost: BigNumber;
  production: BigNumber;
}

export interface ProductionState {
  baseRate: BigNumber;
  multiplier: number;
  currentRate: BigNumber;
}

export type DepartmentType = 'development' | 'sales' | 'customerExperience' | 
  'product' | 'design' | 'qa' | 'marketing';

export type UnitType = 'juniorDev' | 'midDev' | 'seniorDev' | 'techLead';

export interface GameState {
  money: BigNumber;
  departments: Department[];
  statistics: {
    totalClicks: number;
    totalEarned: BigNumber;
    playTime: number;
  };
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
}

export interface GameActions {
  addMoney: (amount: BigNumber) => void;
  hireDeveloper: (departmentId: string, unitType: UnitType) => void;
  updateProduction: (deltaTime: number) => void;
  click: () => void;
  reset: () => void;
}

const initialState: GameState = {
  money: new BigNumber(100), // Starting money
  departments: [],
  statistics: {
    totalClicks: 0,
    totalEarned: new BigNumber(0),
    playTime: 0,
  },
  settings: {
    soundEnabled: true,
    musicEnabled: true,
  },
};

export const useGameStore = create<GameState & GameActions>()(
  immer((set, get) => ({
    ...initialState,
    
    addMoney: (amount: BigNumber) => set(state => {
      state.money = state.money.add(amount);
      state.statistics.totalEarned = state.statistics.totalEarned.add(amount);
    }),
    
    click: () => set(state => {
      const clickValue = new BigNumber(1); // Base click value
      state.money = state.money.add(clickValue);
      state.statistics.totalClicks += 1;
      state.statistics.totalEarned = state.statistics.totalEarned.add(clickValue);
    }),
    
    updateProduction: (deltaTime: number) => set(state => {
      state.statistics.playTime += deltaTime;
      
      // Calculate production for all departments
      for (const department of state.departments) {
        const production = department.production.currentRate.multiply(deltaTime / 1000);
        state.money = state.money.add(production);
        state.statistics.totalEarned = state.statistics.totalEarned.add(production);
      }
    }),
    
    hireDeveloper: (departmentId: string, unitType: UnitType) => set(state => {
      const department = state.departments.find(d => d.id === departmentId);
      if (!department) return;
      
      const unit = department.units.find(u => u.type === unitType);
      if (!unit) return;
      
      if (state.money.greaterThan(unit.cost)) {
        state.money = state.money.add(unit.cost.multiply(-1));
        unit.count += 1;
        // Increase cost by 15% for next purchase
        unit.cost = unit.cost.multiply(1.15);
        
        // Recalculate department production
        department.production.currentRate = department.units.reduce((total, u) => 
          total.add(u.production.multiply(u.count)), new BigNumber(0)
        );
      }
    }),
    
    reset: () => set(() => ({ ...initialState })),
  }))
);
```

### Step 4: TanStack Query Setup

#### 4.1 Create Query Client Provider
**File**: `app/_layout.tsx` (Update existing)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { GameLoop } from '../src/core/game-loop/GameLoop';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameLoop>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </GameLoop>
    </QueryClientProvider>
  );
}
```

### Step 5: Save/Load System Foundation

#### 5.1 Implement Save System
**File**: `src/core/save-system/SaveSystem.ts`

```typescript
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { BigNumber } from '../../shared/utils/BigNumber';
import type { GameState } from '../state/gameStore';

export interface SaveData {
  version: string;
  timestamp: number;
  checksum: string;
  gameState: SerializedGameState;
}

export interface SerializedGameState {
  money: { value: number; exponent: number };
  departments: any[]; // Will expand in later phases
  statistics: {
    totalClicks: number;
    totalEarned: { value: number; exponent: number };
    playTime: number;
  };
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
}

export class SaveSystem {
  private static readonly SAVE_KEY = 'petsoft_tycoon_save';
  private static readonly BACKUP_KEYS = ['save_backup_1', 'save_backup_2'];
  
  static async save(gameState: GameState): Promise<void> {
    try {
      const saveData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        checksum: '',
        gameState: this.serializeGameState(gameState),
      };
      
      // Generate simple checksum
      saveData.checksum = this.generateChecksum(saveData);
      
      const serialized = JSON.stringify(saveData);
      
      // Save to secure store
      await SecureStore.setItemAsync(this.SAVE_KEY, serialized);
      
      // Rotate backups
      await this.rotateBackups(serialized);
      
    } catch (error) {
      console.error('Save failed:', error);
      throw new Error('Failed to save game progress');
    }
  }
  
  static async load(): Promise<GameState | null> {
    const saveKeys = [this.SAVE_KEY, ...this.BACKUP_KEYS];
    
    for (const key of saveKeys) {
      try {
        const serialized = await SecureStore.getItemAsync(key);
        if (!serialized) continue;
        
        const saveData: SaveData = JSON.parse(serialized);
        
        // Verify checksum
        if (!this.verifyChecksum(saveData)) {
          console.warn(`Corrupted save detected: ${key}`);
          continue;
        }
        
        return this.deserializeGameState(saveData.gameState);
        
      } catch (error) {
        console.warn(`Failed to load from ${key}:`, error);
      }
    }
    
    return null;
  }
  
  private static serializeGameState(gameState: GameState): SerializedGameState {
    return {
      money: gameState.money.serialize(),
      departments: [], // Will expand in later phases
      statistics: {
        totalClicks: gameState.statistics.totalClicks,
        totalEarned: gameState.statistics.totalEarned.serialize(),
        playTime: gameState.statistics.playTime,
      },
      settings: gameState.settings,
    };
  }
  
  private static deserializeGameState(data: SerializedGameState): GameState {
    return {
      money: BigNumber.deserialize(data.money),
      departments: [], // Will expand in later phases
      statistics: {
        totalClicks: data.statistics.totalClicks,
        totalEarned: BigNumber.deserialize(data.statistics.totalEarned),
        playTime: data.statistics.playTime,
      },
      settings: data.settings,
    };
  }
  
  private static generateChecksum(saveData: SaveData): string {
    const stateString = JSON.stringify(saveData.gameState);
    // Simple hash - in production use crypto library
    return btoa(stateString).slice(0, 16);
  }
  
  private static verifyChecksum(saveData: SaveData): boolean {
    const expectedChecksum = this.generateChecksum({
      ...saveData,
      checksum: '',
    });
    return expectedChecksum === saveData.checksum;
  }
  
  private static async rotateBackups(saveData: string): Promise<void> {
    try {
      // Move backup_1 to backup_2
      const backup1 = await SecureStore.getItemAsync(this.BACKUP_KEYS[0]);
      if (backup1) {
        await SecureStore.setItemAsync(this.BACKUP_KEYS[1], backup1);
      }
      
      // Save current as backup_1
      await SecureStore.setItemAsync(this.BACKUP_KEYS[0], saveData);
    } catch (error) {
      console.warn('Backup rotation failed:', error);
    }
  }
}
```

### Step 6: Testing Framework

#### 6.1 Configure Jest
**File**: `jest.config.js`

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-setup.ts',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
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

#### 6.2 Create Test Setup
**File**: `src/test-setup.ts`

```typescript
import 'react-native-gesture-handler/jestSetup';

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Expo modules
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({ sound: {} })),
    },
  },
}));
```

#### 6.3 Create Initial Tests
**File**: `__tests__/core/state/gameStore.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useGameStore } from '../../../src/core/state/gameStore';
import { BigNumber } from '../../../src/shared/utils/BigNumber';

describe('GameStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.reset();
    });
  });
  
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGameStore());
    
    expect(result.current.money.toString()).toBe('100.00');
    expect(result.current.statistics.totalClicks).toBe(0);
  });
  
  it('should handle click interactions', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.click();
    });
    
    expect(result.current.money.toString()).toBe('101.00');
    expect(result.current.statistics.totalClicks).toBe(1);
  });
  
  it('should add money correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.addMoney(new BigNumber(50));
    });
    
    expect(result.current.money.toString()).toBe('150.00');
  });
});
```

### Step 7: Performance Monitoring Foundation

#### 7.1 Create Performance Monitor
**File**: `src/core/analytics/PerformanceMonitor.ts`

```typescript
export class PerformanceMonitor {
  private frameRates: number[] = [];
  private lastFrameTime = 0;
  private isMonitoring = false;
  
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorFrameRate();
  }
  
  stopMonitoring(): void {
    this.isMonitoring = false;
  }
  
  private monitorFrameRate(): void {
    const measureFrame = (timestamp: number) => {
      if (!this.isMonitoring) return;
      
      if (this.lastFrameTime) {
        const fps = 1000 / (timestamp - this.lastFrameTime);
        this.frameRates.push(fps);
        
        // Keep only last 60 measurements
        if (this.frameRates.length > 60) {
          this.frameRates.shift();
        }
        
        // Log warning if FPS drops below 50
        if (fps < 50) {
          console.warn(`Low FPS detected: ${fps.toFixed(2)}`);
        }
      }
      
      this.lastFrameTime = timestamp;
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  }
  
  getAverageFPS(): number {
    if (this.frameRates.length === 0) return 60;
    
    const sum = this.frameRates.reduce((a, b) => a + b, 0);
    return sum / this.frameRates.length;
  }
  
  getMetrics() {
    return {
      averageFPS: this.getAverageFPS(),
      frameDrops: this.frameRates.filter(fps => fps < 55).length,
      sampleCount: this.frameRates.length,
    };
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();
```

## Validation & Testing

### Foundation Validation Checklist

#### Environment Validation
```bash
# Verify TypeScript compilation
npx tsc --noEmit

# Verify Jest test execution  
npm test

# Verify Expo development server
npx expo start

# Verify package installations
npm ls --depth=1 | grep -E "(expo|@tanstack|zustand)"
```

#### Architecture Validation
```bash
# Verify directory structure
tree src/ -I 'node_modules'

# Verify barrel exports exist
find src/ -name "index.ts" -exec echo {} \;

# Verify no TypeScript errors
npx tsc --noEmit --strict
```

#### Functional Validation
```bash
# Run test suite
npm test -- --coverage

# Test game store functionality
npm test -- gameStore.test.ts

# Test BigNumber operations
npm test -- BigNumber.test.ts
```

## Phase 1 Completion Criteria

- [ ] Expo project initialized with SDK 53+ and TypeScript
- [ ] All core dependencies installed without legacy peer deps warnings
- [ ] Directory structure follows vertical slicing pattern
- [ ] TypeScript configuration set to strict mode with no compilation errors
- [ ] Zustand store implemented with basic game state
- [ ] TanStack Query v5 configured with providers
- [ ] BigNumber class implemented and tested
- [ ] Game loop architecture implemented with 60 FPS targeting
- [ ] Save/load system foundation implemented with SecureStore
- [ ] Testing framework configured with initial test coverage >70%
- [ ] Performance monitoring system initialized
- [ ] Development server runs without errors

## Troubleshooting Common Issues

### Issue: Metro bundler errors with path aliases
**Solution**: Verify `babel.config.js` includes path plugin:
```javascript
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
        },
      },
    ],
  ],
};
```

### Issue: TypeScript errors with Expo modules  
**Solution**: Ensure `@types/expo` packages are installed:
```bash
npx expo install --fix
```

### Issue: Test failures with React Native components
**Solution**: Verify `jest.config.js` includes proper preset and mocks

## Next Steps

Upon Phase 1 completion:

1. **Update progress.json**: Mark Phase 1 as completed
2. **Proceed to Phase 2**: [02-core-features.md](./02-core-features.md)
3. **Validate foundation**: Run all validation commands
4. **Performance baseline**: Record initial performance metrics

## Time Estimation

- **Day 1**: Project initialization and dependency installation (6-8 hours)
- **Day 2**: Core systems implementation (8 hours)
- **Day 3**: Game loop and state management (8 hours)  
- **Day 4**: Save system and performance monitoring (6-8 hours)
- **Day 5**: Testing framework and validation (6-8 hours)

**Total Estimated Time**: 34-40 hours over 5 days