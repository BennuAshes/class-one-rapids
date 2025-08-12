# PetSoft Tycoon - Technical Requirements Document
Version 1.0 | Date: August 11, 2025

## Executive Summary

This document defines the technical architecture and implementation requirements for PetSoft Tycoon, an idle simulation game built with React Native, Expo, and Legend State. The architecture prioritizes performance (60 FPS), fast load times (<3s), and maintainable code through vertical feature slicing.

## Architecture Specifications

### Technology Stack
- **Framework**: React Native 0.76+ with New Architecture enabled
- **Runtime**: Expo SDK ~52.0.0 for cross-platform compatibility
- **State Management**: @legendapp/state@beta for optimal performance
- **Animation**: React Native Reanimated 3.x for 60 FPS animations
- **Audio**: Expo Audio API with Web Audio API fallbacks
- **Storage**: AsyncStorage for game saves with automatic backup
- **Build System**: EAS Build with optimized Metro bundler configuration

### Architecture Patterns

#### Vertical Feature Slicing
```
features/
  departments/
    state/departmentStore.ts      # Department-specific state
    components/                   # Department UI components
    hooks/useDepartmentLogic.ts   # Department business logic
    types/department.types.ts     # Department data models
  
  employees/
    state/employeeStore.ts        # Employee-specific state
    components/                   # Employee UI components
    hooks/useEmployeeLogic.ts     # Employee business logic
    types/employee.types.ts       # Employee data models
  
  prestige/
    state/prestigeStore.ts        # Prestige system state
    components/                   # Prestige UI components
    hooks/usePrestigeLogic.ts     # Prestige calculations
    types/prestige.types.ts       # Prestige data models
```

#### State Management Architecture
```typescript
// features/departments/state/departmentStore.ts
import { observable } from '@legendapp/state';

export const departmentState$ = observable({
  departments: [] as Department[],
  selectedDepartmentId: null as string | null,
  productionRates: {} as Record<string, number>,
  totalProduction: 0,
  isAutoManagerEnabled: false
});

// Features can subscribe to specific slices
export const useDepartmentProduction = () => {
  const production = departmentState$.totalProduction.use();
  const rates = departmentState$.productionRates.use();
  return { production, rates };
};
```

## Performance Requirements

### Frame Rate Targets
- **Minimum**: 60 FPS on 5-year-old devices (iPhone 8, Galaxy S8)
- **Target**: Consistent 60 FPS with complex animations
- **Measurement**: React DevTools Profiler integration for monitoring

### Memory Management
- **Target**: <200MB RAM usage during gameplay
- **Critical**: <500MB absolute maximum
- **Strategy**: Object pooling for frequently created/destroyed elements

### Load Time Optimization
- **Target**: <3 seconds initial load on 3G connection
- **Bundle Size**: <50MB total, <3MB critical path
- **Strategy**: Code splitting by feature with lazy loading

### Implementation Patterns
```typescript
// Optimized FlatList for large department lists
<FlatList
  data={departments}
  renderItem={renderDepartmentItem}
  keyExtractor={item => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={5}
  getItemLayout={(data, index) => ({
    length: DEPARTMENT_HEIGHT,
    offset: DEPARTMENT_HEIGHT * index,
    index,
  })}
/>

// Memoized expensive calculations
const calculateDepartmentProduction = useMemo(() => {
  return departments.reduce((total, dept) => 
    total + (dept.employees * dept.baseRate * dept.multiplier), 0
  );
}, [departments]);
```

## Data Models and State Structure

### Core Game State
```typescript
// Game-wide state (minimal shared state)
interface GameState {
  money: number;
  valuation: number;
  gameSpeed: number;
  lastSaveTime: number;
  prestigeLevel: number;
  investorPoints: number;
}

// Department data model
interface Department {
  id: string;
  name: string;
  type: DepartmentType;
  employees: Employee[];
  level: number;
  baseProductionRate: number;
  currentMultiplier: number;
  upgrades: Upgrade[];
  isAutoManagerActive: boolean;
  unlockCost: number;
  isUnlocked: boolean;
}

// Employee data model
interface Employee {
  id: string;
  departmentId: string;
  type: EmployeeType;
  level: number;
  baseRate: number;
  cost: number;
  quantity: number;
}

// Upgrade system
interface Upgrade {
  id: string;
  departmentId: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number;
  isUnlocked: boolean;
  isPurchased: boolean;
  requirements: UpgradeRequirement[];
}
```

### State Management Strategy
```typescript
// Feature-owned stores with computed values
export const gameProgressState$ = observable({
  money: 0,
  valuation: 0,
  gameSpeed: 1,
  
  // Computed properties for performance
  get totalProduction() {
    return departmentState$.departments.get()
      .reduce((sum, dept) => sum + dept.currentProduction, 0);
  },
  
  get canAffordUpgrade() {
    return (cost: number) => this.money >= cost;
  }
});

// Cross-feature computed values
export const businessMetrics$ = observable({
  get revenuePerSecond() {
    return departmentState$.totalProduction.get() * 
           salesState$.conversionRate.get();
  },
  
  get timeToNextMilestone() {
    const current = gameProgressState$.valuation.get();
    const target = getNextMilestone(current);
    const rate = this.revenuePerSecond;
    return rate > 0 ? (target - current) / rate : Infinity;
  }
});
```

## Component Hierarchy and Organization

### Screen-Level Architecture
```
screens/
  GameScreen.tsx                 # Main game container
    components/
      GameHeader.tsx             # Money, valuation display
      DepartmentTabs.tsx         # Department navigation
      ProductionDisplay.tsx      # Real-time production stats
      UpgradePanel.tsx           # Available upgrades
      PrestigeButton.tsx         # Prestige/investor options

features/departments/components/
  DepartmentView.tsx             # Individual department view
    EmployeeList.tsx             # Employee management
    UpgradeList.tsx              # Department upgrades
    ProductionChart.tsx          # Visual production feedback
    
features/prestige/components/
  PrestigeModal.tsx              # Prestige decision interface
    InvestorPointsDisplay.tsx    # IP calculation and benefits
    PrestigeConfirmation.tsx     # Reset confirmation
    PostPrestigeBonus.tsx        # Applied bonuses display
```

### Component Communication Patterns
```typescript
// Parent-child prop passing (minimal)
interface DepartmentViewProps {
  departmentId: string;
  isActive: boolean;
}

// State-driven communication (preferred)
const DepartmentView = ({ departmentId }: { departmentId: string }) => {
  const department = departmentState$.departments[departmentId].use();
  const production = useDepartmentProduction(departmentId);
  
  return (
    <View>
      <ProductionDisplay value={production} />
      <EmployeeList departmentId={departmentId} />
    </View>
  );
};

// Event-driven actions
const purchaseEmployee = (departmentId: string, employeeType: string) => {
  const cost = calculateEmployeeCost(departmentId, employeeType);
  
  if (gameProgressState$.money.get() >= cost) {
    gameProgressState$.money.set(prev => prev - cost);
    departmentState$.departments[departmentId].employees.push({
      type: employeeType,
      level: 1,
      hiredAt: Date.now()
    });
  }
};
```

## Animation and Audio System Requirements

### Animation Architecture
```typescript
// Smooth number incrementing for money display
const useAnimatedNumber = (targetValue: number, duration = 1000) => {
  const animatedValue = useSharedValue(0);
  const displayValue = useDerivedValue(() => 
    Math.round(animatedValue.value)
  );
  
  useEffect(() => {
    animatedValue.value = withTiming(targetValue, { duration });
  }, [targetValue]);
  
  return displayValue;
};

// Particle system for visual feedback
const ProductionParticles = ({ isActive, rate }) => {
  const particles = useSharedValue([]);
  
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        particles.value = [
          ...particles.value,
          createParticle(rate)
        ].slice(-MAX_PARTICLES);
      }, 1000 / rate);
      
      return () => clearInterval(interval);
    }
  }, [isActive, rate]);
  
  return (
    <Canvas>
      {particles.value.map(particle => 
        <Circle key={particle.id} {...particle} />
      )}
    </Canvas>
  );
};
```

### Audio System Implementation
```typescript
// Audio manager with performance optimization
class AudioManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private isEnabled = true;
  
  async preloadSounds() {
    const soundFiles = {
      click: require('../assets/audio/click.wav'),
      purchase: require('../assets/audio/purchase.wav'),
      levelUp: require('../assets/audio/levelup.wav'),
      prestige: require('../assets/audio/prestige.wav')
    };
    
    for (const [key, file] of Object.entries(soundFiles)) {
      const sound = new Audio.Sound();
      await sound.loadAsync(file);
      this.sounds.set(key, sound);
    }
  }
  
  playSound(soundName: string, volume = 1.0) {
    if (!this.isEnabled) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.setVolumeAsync(volume);
      sound.replayAsync();
    }
  }
}

// Usage in components
const PurchaseButton = ({ onPurchase, cost }) => {
  const audioManager = useAudioManager();
  
  const handlePurchase = () => {
    audioManager.playSound('purchase');
    onPurchase();
  };
  
  return (
    <TouchableOpacity onPress={handlePurchase}>
      <Text>Buy for ${formatCurrency(cost)}</Text>
    </TouchableOpacity>
  );
};
```

## Save/Load System Implementation

### Auto-Save Architecture
```typescript
// Auto-save system with error recovery
class SaveManager {
  private saveInterval: NodeJS.Timeout;
  private maxBackups = 5;
  
  startAutoSave() {
    this.saveInterval = setInterval(() => {
      this.saveGameState();
    }, 30000); // 30 second intervals
  }
  
  async saveGameState() {
    try {
      const gameState = this.collectGameState();
      const saveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        data: gameState,
        checksum: this.calculateChecksum(gameState)
      };
      
      await AsyncStorage.setItem('gameState', JSON.stringify(saveData));
      await this.rotateBackups(saveData);
    } catch (error) {
      console.error('Save failed:', error);
      // Attempt backup save location
      await this.emergencyBackupSave();
    }
  }
  
  async loadGameState(): Promise<GameState | null> {
    try {
      const saveDataString = await AsyncStorage.getItem('gameState');
      if (!saveDataString) return null;
      
      const saveData = JSON.parse(saveDataString);
      
      // Verify save integrity
      if (!this.verifySaveIntegrity(saveData)) {
        return await this.attemptBackupRecovery();
      }
      
      return this.migrateSaveIfNeeded(saveData.data);
    } catch (error) {
      console.error('Load failed:', error);
      return await this.attemptBackupRecovery();
    }
  }
  
  private collectGameState() {
    return {
      game: gameProgressState$.get(),
      departments: departmentState$.get(),
      employees: employeeState$.get(),
      upgrades: upgradeState$.get(),
      prestige: prestigeState$.get()
    };
  }
}
```

### Export/Import System
```typescript
// Save file export/import for user control
export const useSaveExport = () => {
  const exportSave = async () => {
    const gameState = saveManager.collectGameState();
    const exportData = {
      version: SAVE_VERSION,
      exportTime: Date.now(),
      playerData: gameState
    };
    
    const exportString = btoa(JSON.stringify(exportData));
    return exportString;
  };
  
  const importSave = async (importString: string) => {
    try {
      const importData = JSON.parse(atob(importString));
      
      if (importData.version !== SAVE_VERSION) {
        throw new Error('Incompatible save version');
      }
      
      await saveManager.loadFromData(importData.playerData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  return { exportSave, importSave };
};
```

## Cross-Platform Considerations

### Platform-Specific Optimizations
```typescript
// Platform-aware performance settings
const getPlatformConfig = () => {
  const isAndroid = Platform.OS === 'android';
  const isLowEndDevice = DeviceInfo.getTotalMemorySync() < 2000000000; // <2GB RAM
  
  return {
    particleCount: isLowEndDevice ? 10 : 50,
    animationDuration: isAndroid ? 200 : 300,
    updateInterval: isLowEndDevice ? 200 : 100,
    enableHaptics: Platform.OS === 'ios',
    audioChannels: isLowEndDevice ? 2 : 8
  };
};

// Responsive design system
const useResponsiveDimensions = () => {
  const { width, height } = useWindowDimensions();
  
  return {
    isTablet: width > 768,
    departmentColumns: width > 768 ? 2 : 1,
    buttonSize: width > 768 ? 60 : 48,
    fontSize: {
      small: width > 768 ? 14 : 12,
      medium: width > 768 ? 16 : 14,
      large: width > 768 ? 20 : 18
    }
  };
};
```

### Metro Configuration (Required)
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Required for @legendapp/state optimization
config.resolver.moduleMap = {
  '@legendapp/state': '@legendapp/state/dist/index.js',
};

// Performance optimizations
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true,
  },
};

module.exports = config;
```

## Testing Strategy and CI/CD Requirements

### Testing Architecture
```typescript
// Unit tests for game logic
describe('Department Production Calculations', () => {
  it('calculates production rate correctly', () => {
    const department = createMockDepartment({
      employees: [
        { type: 'junior', quantity: 5, rate: 0.1 },
        { type: 'senior', quantity: 2, rate: 1.0 }
      ],
      multiplier: 1.5
    });
    
    const production = calculateDepartmentProduction(department);
    expect(production).toBe((5 * 0.1 + 2 * 1.0) * 1.5);
  });
});

// Integration tests for save/load
describe('Save System Integration', () => {
  it('preserves game state through save/load cycle', async () => {
    const originalState = createGameState();
    await saveManager.saveGameState();
    
    // Reset state
    resetAllStores();
    
    const loadedState = await saveManager.loadGameState();
    expect(loadedState).toEqual(originalState);
  });
});

// Performance tests
describe('Performance Requirements', () => {
  it('maintains 60fps with 100 active employees', () => {
    const startTime = performance.now();
    
    // Simulate 100 employees producing for 1 second
    for (let i = 0; i < 60; i++) {
      updateAllDepartmentProduction();
    }
    
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(1000); // Should complete in <1s
  });
});
```

### CI/CD Pipeline Configuration
```yaml
# .github/workflows/test-and-build.yml
name: Test and Build

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install -g @expo/eas-cli
          npx expo install
      
      - name: Run tests
        run: |
          npm test
          npm run lint
      
      - name: Performance tests
        run: npm run test:performance
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build for production
        run: |
          eas build --platform all --non-interactive
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: production-builds
          path: builds/
```

### Quality Assurance Requirements
- **Code Coverage**: >80% for game logic, >90% for save system
- **Performance Monitoring**: Automated FPS monitoring in tests
- **Memory Leak Detection**: Automated memory profiling
- **Save Integrity**: Comprehensive save/load testing
- **Cross-Platform Testing**: iOS and Android device testing

## Development Setup and Configuration

### Required Package Versions
```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "react-native": "0.76.0",
    "@legendapp/state": "beta",
    "react-native-reanimated": "~3.8.0",
    "expo-audio": "~14.0.0",
    "@react-native-async-storage/async-storage": "1.23.0"
  },
  "devDependencies": {
    "@testing-library/react-native": "^12.0.0",
    "jest": "^29.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0"
  }
}
```

### EAS Build Configuration
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "production": {
      "node": "18.18.0",
      "ios": {
        "resourceClass": "m1-medium"
      },
      "android": {
        "resourceClass": "medium"
      }
    }
  }
}
```

## Key Technical Decisions Summary

### Architecture Decisions
1. **Vertical Feature Slicing**: Chosen over horizontal layering for maintainability and team scalability
2. **Legend State**: Selected for 40% performance improvement over Zustand/Redux
3. **React Native 0.76+**: New Architecture enables better performance and future compatibility
4. **Expo Managed Workflow**: Provides reliable cross-platform builds and updates

### Performance Decisions
1. **Object Pooling**: For frequently created game objects (particles, animations)
2. **Computed Values**: Cached calculations for expensive operations
3. **Lazy Loading**: Feature-based code splitting reduces initial bundle size
4. **FlatList Optimization**: Proper virtualization for large lists

### State Management Decisions
1. **Feature-Owned State**: Each feature manages its own state slice
2. **Minimal Shared State**: Only truly global data in shared stores
3. **Reactive Updates**: Observable patterns for automatic UI updates
4. **Save State Separation**: Game state separate from UI state

### Cross-Platform Decisions
1. **Responsive Design**: Single codebase with platform-aware optimizations
2. **Performance Scaling**: Device capability detection for adaptive performance
3. **Progressive Enhancement**: Core functionality works on low-end devices
4. **Platform-Specific Audio**: Native audio APIs for best performance

This technical architecture ensures PetSoft Tycoon meets all performance requirements while maintaining code quality and development velocity through proven patterns and optimization strategies.