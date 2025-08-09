# PetSoft Tycoon: Technical Requirements Document
## Version 8.0 | React Native + Legend State Architecture

### Document Overview
This technical requirements document translates the PetSoft Tycoon PRD into detailed implementation specifications using React Native with Expo and Legend State for optimal performance and cross-platform support.

---

## 1. Architecture Specifications

### 1.1 Core Technology Stack
| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| Framework | React Native | 0.76+ | New Architecture mandatory for performance |
| Development Platform | Expo | ~52.0.0 | SDK52 provides latest RN features |
| State Management | Legend State | @beta | 40% performance improvement over Redux |
| Animation Engine | React Native Reanimated | 3.x | Hardware-accelerated 60 FPS animations |
| Audio System | Expo AV | Latest | Cross-platform audio with pitch variation |
| Storage | Expo SecureStore + AsyncStorage | Latest | Secure saves + fast access |
| Navigation | Expo Router | ~4.0.0 | File-based routing for scalability |
| TypeScript | ^5.8.0 | Latest | Strict mode for reliability |

### 1.2 Architecture Pattern: Vertical Slicing
```
src/
├── features/
│   ├── game-core/
│   │   ├── components/         # GameView, ResourceCounter
│   │   ├── hooks/             # useGameLoop(), useClickHandling()
│   │   ├── state/             # gameState$, resourceState$
│   │   └── services/          # gameEngine, saveManager
│   ├── departments/
│   │   ├── components/        # DepartmentCard, EmployeeList
│   │   ├── hooks/             # useDepartment(), useEmployee()
│   │   ├── state/             # departmentState$
│   │   └── services/          # departmentLogic
│   ├── prestige/
│   │   ├── components/        # PrestigeModal, InvestorPanel
│   │   ├── hooks/             # usePrestige()
│   │   ├── state/             # prestigeState$
│   │   └── services/          # prestigeCalculator
│   ├── achievements/
│   │   ├── components/        # AchievementToast
│   │   ├── hooks/             # useAchievements()
│   │   ├── state/             # achievementState$
│   │   └── services/          # achievementChecker
│   └── ui/
│       ├── components/        # Button, Modal, Counter
│       ├── hooks/             # useAnimation(), useSound()
│       └── theme/             # colors, typography, spacing
├── app/                       # Expo Router file-based routing
└── types/                     # Global TypeScript definitions
```

### 1.3 Configuration Requirements
```typescript
// metro.config.js (MANDATORY for Legend State)
module.exports = {
  resolver: {
    unstable_enablePackageExports: true,
    unstable_conditionNames: ['react-native'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

// babel.config.js (REQUIRED for Reanimated)
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin'],
};

// tsconfig.json (STRICT mode enforced)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

---

## 2. Performance Requirements

### 2.1 Benchmarks and Targets
| Metric | Target | Measurement Method | Fallback Strategy |
|--------|--------|-------------------|-------------------|
| Initial Load Time | <3 seconds | Time to first interaction | Progressive loading |
| Frame Rate | 60 FPS minimum | React DevTools Profiler | Auto-quality adjustment |
| Memory Usage | <50MB active | Flipper Memory Inspector | Garbage collection optimization |
| Battery Usage | <5% per hour | Device battery stats | Reduce animation frequency |
| Bundle Size | <3MB initial | Expo bundle analyzer | Code splitting by feature |

### 2.2 Performance Implementation Strategy
```typescript
// Hermes Engine (30% performance boost)
// android/app/build.gradle
project.ext.react = [
    enableHermes: true
]

// Bundle Splitting with Expo Router
// app/_layout.tsx
import { lazy } from 'react';
const GameScreen = lazy(() => import('../features/game-core/components/GameView'));

// Legend State Batch Updates (40% performance improvement)
import { batch } from '@legendapp/state';

const updateResources = (gold: number, code: number) => {
  batch(() => {
    gameState$.resources.gold.set(prev => prev + gold);
    gameState$.resources.code.set(prev => prev + code);
    gameState$.statistics.totalEarned.set(prev => prev + gold);
  });
};

// List Virtualization for Large Datasets
import { FlashList } from '@shopify/flash-list';
// Use FlashList instead of FlatList for 90% memory reduction
```

### 2.3 Device Compatibility Matrix
| Device Category | Min Specs | Expected Performance | Fallback Options |
|-----------------|-----------|---------------------|------------------|
| High-end (2020+) | 4GB RAM, A13/SD855 | 60 FPS, all effects | Full quality |
| Mid-range (2018+) | 3GB RAM, A11/SD660 | 60 FPS, reduced particles | Medium quality |
| Low-end (2016+) | 2GB RAM, A9/SD625 | 30 FPS, minimal effects | Low quality |

---

## 3. Data Models and State Management

### 3.1 Core State Architecture with Legend State
```typescript
// gameState$.ts - Central game observable
import { observable } from '@legendapp/state';

export const gameState$ = observable({
  // Core Resources
  resources: {
    code: 0,
    features: 0,
    money: 0,
    leads: 0,
    // Computed total value
    get totalValue() {
      return this.money + (this.features * 15) + (this.leads * 5);
    }
  },
  
  // Game Meta
  meta: {
    startTime: Date.now(),
    lastSave: Date.now(),
    prestigeCount: 0,
    investorPoints: 0,
    version: '8.0.0'
  },
  
  // Performance tracking
  performance: {
    fps: 60,
    frameDrops: 0,
    memoryUsage: 0
  },
  
  // Settings
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    particlesEnabled: true,
    autoSaveInterval: 30000,
    qualityLevel: 'auto' as 'low' | 'medium' | 'high' | 'auto'
  }
});

// departmentState$.ts - Department management
export const departmentState$ = observable({
  development: {
    unlocked: true,
    employees: {
      junior: { count: 0, cost: 10, production: 0.1 },
      mid: { count: 0, cost: 100, production: 1 },
      senior: { count: 0, cost: 1000, production: 10 },
      lead: { count: 0, cost: 10000, production: 100 }
    },
    manager: { unlocked: false, hired: false, cost: 50000 },
    // Dynamic cost calculation
    get juniorCost() {
      return Math.floor(10 * Math.pow(1.15, this.employees.junior.count));
    }
  },
  
  sales: {
    unlocked: false,
    unlockThreshold: 500,
    employees: {
      rep: { count: 0, cost: 25, production: 0.2 },
      manager: { count: 0, cost: 500, production: 2 },
      director: { count: 0, cost: 5000, production: 20 }
    }
  },
  // ... other departments
});

// prestigeState$.ts - Prestige system
export const prestigeState$ = observable({
  currentRun: {
    valuation: 0,
    startTime: Date.now(),
    achievementsUnlocked: []
  },
  lifetime: {
    totalInvestorPoints: 0,
    totalRuns: 0,
    fastestIPO: Infinity,
    // Permanent bonuses
    get startingCapitalBonus() {
      return this.totalInvestorPoints * 0.1; // +10% per IP
    },
    get globalSpeedBonus() {
      return this.totalInvestorPoints * 0.01; // +1% per IP
    }
  }
});
```

### 3.2 Data Persistence Strategy
```typescript
// saveManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export class SaveManager {
  private static SAVE_KEY = 'petsoft_tycoon_save';
  private static BACKUP_KEY = 'petsoft_tycoon_backup';
  
  static async autoSave() {
    try {
      const gameData = {
        version: '8.0.0',
        timestamp: Date.now(),
        gameState: gameState$.peek(),
        departmentState: departmentState$.peek(),
        prestigeState: prestigeState$.peek()
      };
      
      // Compress and encrypt save data
      const compressed = await this.compressSave(gameData);
      const encrypted = await this.encryptSave(compressed);
      
      // Dual save strategy
      await AsyncStorage.setItem(this.SAVE_KEY, encrypted);
      await SecureStore.setItemAsync(this.BACKUP_KEY, encrypted);
      
      gameState$.meta.lastSave.set(Date.now());
    } catch (error) {
      console.error('Save failed:', error);
      // Fallback to uncompressed save
      await this.fallbackSave();
    }
  }
  
  static async loadGame(): Promise<boolean> {
    try {
      let saveData = await AsyncStorage.getItem(this.SAVE_KEY);
      
      // Try backup if main save fails
      if (!saveData) {
        saveData = await SecureStore.getItemAsync(this.BACKUP_KEY);
      }
      
      if (saveData) {
        const decrypted = await this.decryptSave(saveData);
        const decompressed = await this.decompressSave(decrypted);
        
        // Validate save integrity
        if (this.validateSave(decompressed)) {
          this.applySaveData(decompressed);
          return true;
        }
      }
    } catch (error) {
      console.error('Load failed:', error);
    }
    return false;
  }
}
```

---

## 4. Component Hierarchy and Organization

### 4.1 Component Architecture
```typescript
// Main App Structure
App
├── GameScreen                 # Primary game interface
│   ├── ResourceBar           # Top resources display
│   │   ├── ResourceCounter   # Individual resource
│   │   └── PrestigeButton    # Quick prestige access
│   ├── MainGameArea          # Central interaction zone
│   │   ├── ClickButton       # Primary click interaction
│   │   ├── ProgressBars      # Feature/automation progress
│   │   └── OfficeView        # Visual office representation
│   ├── DepartmentTabs        # Department navigation
│   │   └── DepartmentPanel   # Individual department
│   │       ├── EmployeeList  # Hireable employees
│   │       ├── ManagerCard   # Department automation
│   │       └── StatsDisplay  # Department statistics
│   └── BottomNavigation      # Achievement, stats, settings
├── PrestigeModal            # Investor round interface
├── AchievementToast         # Achievement notifications
├── SettingsModal           # Game configuration
└── StatisticsModal         # Detailed game statistics

// Component Props Interface Design
interface GameScreenProps {
  initializing: boolean;
  offlineEarnings?: number;
}

interface DepartmentPanelProps {
  department: 'development' | 'sales' | 'cx' | 'product' | 'design' | 'qa' | 'marketing';
  unlocked: boolean;
  onEmployeeHire: (type: string, quantity: number) => void;
  onManagerHire: () => void;
}

interface ResourceCounterProps {
  type: 'code' | 'features' | 'money' | 'leads';
  value: number;
  growth: number;
  formatter: (value: number) => string;
}
```

### 4.2 Component Performance Optimization
```typescript
// Memoization Strategy
import { memo, useMemo } from 'react';
import { observer } from '@legendapp/state/react';

// Observer pattern for Legend State reactivity
export const ResourceCounter = observer(memo(({ type }: { type: ResourceType }) => {
  const value = gameState$.resources[type].get();
  const formattedValue = useMemo(() => formatNumber(value), [value]);
  
  return (
    <Animated.View style={counterStyles}>
      <Text>{formattedValue}</Text>
    </Animated.View>
  );
}));

// Heavy computation memoization
export const DepartmentEfficiency = observer(() => {
  const efficiency = useMemo(() => {
    return calculateDepartmentSynergy(
      departmentState$.development.employees.get(),
      departmentState$.sales.employees.get()
    );
  }, [
    departmentState$.development.employees.get(),
    departmentState$.sales.employees.get()
  ]);
  
  return <EfficiencyDisplay value={efficiency} />;
});
```

---

## 5. Animation and Audio System Requirements

### 5.1 Animation Architecture
```typescript
// animationConfig.ts - Performance-optimized animations
import { Easing } from 'react-native-reanimated';

export const AnimationConfig = {
  // Button interactions - <50ms response
  buttonPress: {
    duration: 100,
    easing: Easing.out(Easing.quad),
  },
  
  // Resource counters - smooth increments
  counterUpdate: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  
  // Panel transitions - premium feel
  panelSlide: {
    duration: 400,
    easing: Easing.out(Easing.back(1.1)),
  },
  
  // Particle effects - scale with performance
  particles: {
    duration: 800,
    count: gameState$.settings.qualityLevel.get() === 'high' ? 20 : 5,
  },
  
  // Screen shake for milestones
  screenShake: {
    intensity: 2,
    duration: 200,
    frequency: 10,
  }
};

// useAnimation.ts - Performance-aware animation hook
export const useAnimation = () => {
  const qualityLevel = useSelector(gameState$.settings.qualityLevel);
  
  const createClickAnimation = useCallback(() => {
    'worklet';
    return {
      scale: withSequence(
        withTiming(1.1, { duration: 50 }),
        withTiming(1.0, { duration: 100 })
      ),
      opacity: withSequence(
        withTiming(0.8, { duration: 50 }),
        withTiming(1.0, { duration: 100 })
      )
    };
  }, []);
  
  const createParticleAnimation = useCallback((value: number) => {
    'worklet';
    const count = qualityLevel === 'low' ? 1 : Math.min(value / 100, 10);
    return Array.from({ length: count }, (_, i) => ({
      translateY: withTiming(-50, { duration: 800 }),
      opacity: withTiming(0, { duration: 800 }),
      rotation: withTiming(Math.random() * 360, { duration: 800 })
    }));
  }, [qualityLevel]);
  
  return { createClickAnimation, createParticleAnimation };
};
```

### 5.2 Audio System Implementation
```typescript
// audioManager.ts - Sophisticated audio management
import { Audio } from 'expo-av';

export class AudioManager {
  private static sounds: Map<string, Audio.Sound> = new Map();
  private static musicInstance: Audio.Sound | null = null;
  private static lastPlayTime: Map<string, number> = new Map();
  
  // Preload all sounds for instant playback
  static async initialize() {
    const soundsToLoad = [
      { key: 'click', file: require('../assets/audio/click.wav') },
      { key: 'buy', file: require('../assets/audio/purchase.wav') },
      { key: 'milestone', file: require('../assets/audio/achievement.wav') },
      { key: 'prestige', file: require('../assets/audio/prestige.wav') },
    ];
    
    for (const { key, file } of soundsToLoad) {
      const { sound } = await Audio.Sound.createAsync(file);
      this.sounds.set(key, sound);
    }
  }
  
  // Intelligent sound playing with anti-spam protection
  static async playSound(key: string, options?: { 
    pitch?: number; 
    volume?: number; 
    cooldown?: number 
  }) {
    if (!gameState$.settings.soundEnabled.get()) return;
    
    const now = Date.now();
    const lastPlay = this.lastPlayTime.get(key) || 0;
    const cooldown = options?.cooldown || 50;
    
    if (now - lastPlay < cooldown) return;
    
    const sound = this.sounds.get(key);
    if (sound) {
      await sound.setPositionAsync(0);
      
      if (options?.pitch) {
        await sound.setPitchCorrectionQualityAsync(Audio.PitchCorrectionQuality.High);
        await sound.setRateAsync(options.pitch, true);
      }
      
      if (options?.volume) {
        await sound.setVolumeAsync(options.volume);
      }
      
      await sound.playAsync();
      this.lastPlayTime.set(key, now);
    }
  }
  
  // Dynamic pitch variation to prevent repetition
  static getClickPitch(clickCount: number): number {
    const basePitch = 1.0;
    const variation = 0.2;
    const frequency = clickCount % 8;
    return basePitch + (Math.sin(frequency * Math.PI / 4) * variation);
  }
  
  // Adaptive music based on game pace
  static async updateMusicTempo(gameSpeed: number) {
    if (this.musicInstance && gameState$.settings.musicEnabled.get()) {
      const tempo = Math.min(1.5, Math.max(0.8, gameSpeed));
      await this.musicInstance.setRateAsync(tempo, true);
    }
  }
}
```

---

## 6. Save/Load System Implementation

### 6.1 Robust Save System Architecture
```typescript
// saveSystem.ts - Industrial-grade save management
export interface SaveData {
  version: string;
  timestamp: number;
  checksum: string;
  gameState: any;
  departmentState: any;
  prestigeState: any;
  achievementState: any;
}

export class SaveSystem {
  private static readonly CURRENT_VERSION = '8.0.0';
  private static readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds
  private static autoSaveTimer: NodeJS.Timeout | null = null;
  
  // Migration system for version compatibility
  private static migrations: Record<string, (data: any) => any> = {
    '7.0.0': (data) => {
      // Migrate from v7 to v8
      return {
        ...data,
        version: '8.0.0',
        gameState: {
          ...data.gameState,
          performance: { fps: 60, frameDrops: 0, memoryUsage: 0 }
        }
      };
    }
  };
  
  // Comprehensive save validation
  private static validateSave(data: any): data is SaveData {
    if (!data || typeof data !== 'object') return false;
    if (!data.version || !data.timestamp || !data.checksum) return false;
    if (!data.gameState || !data.departmentState || !data.prestigeState) return false;
    
    // Checksum validation
    const calculatedChecksum = this.calculateChecksum(data);
    if (data.checksum !== calculatedChecksum) {
      console.warn('Save file checksum mismatch');
      return false;
    }
    
    return true;
  }
  
  // Incremental save system - only save changed data
  private static lastSaveHash: string = '';
  
  static async performAutoSave(): Promise<boolean> {
    try {
      const currentData = this.gatherSaveData();
      const currentHash = this.calculateHash(currentData);
      
      // Skip save if nothing changed
      if (currentHash === this.lastSaveHash) {
        return true;
      }
      
      const saveData: SaveData = {
        version: this.CURRENT_VERSION,
        timestamp: Date.now(),
        checksum: this.calculateChecksum(currentData),
        ...currentData
      };
      
      // Triple-save strategy: main, backup, cloud-ready
      const promises = [
        AsyncStorage.setItem('main_save', JSON.stringify(saveData)),
        AsyncStorage.setItem('backup_save', JSON.stringify(saveData)),
        this.prepareCloudSave(saveData) // Ready for cloud sync
      ];
      
      await Promise.all(promises);
      
      this.lastSaveHash = currentHash;
      gameState$.meta.lastSave.set(Date.now());
      
      return true;
    } catch (error) {
      console.error('Auto-save failed:', error);
      return false;
    }
  }
  
  // Offline progression calculation
  static calculateOfflineProgress(timeAway: number): OfflineEarnings {
    const maxOfflineTime = 12 * 60 * 60 * 1000; // 12 hours
    const effectiveTime = Math.min(timeAway, maxOfflineTime);
    const offlineEfficiency = 0.7; // 70% efficiency offline
    
    const currentProduction = this.calculateCurrentProduction();
    const offlineEarnings = {
      code: currentProduction.code * (effectiveTime / 1000) * offlineEfficiency,
      money: currentProduction.money * (effectiveTime / 1000) * offlineEfficiency,
      features: Math.floor(currentProduction.features * (effectiveTime / 1000) * offlineEfficiency),
      timeAway: effectiveTime
    };
    
    return offlineEarnings;
  }
  
  // Export/Import for cross-device play
  static async exportSave(): Promise<string> {
    const saveData = this.gatherSaveData();
    const compressed = await this.compressSave(saveData);
    return btoa(compressed); // Base64 encode for sharing
  }
  
  static async importSave(saveCode: string): Promise<boolean> {
    try {
      const compressed = atob(saveCode);
      const saveData = await this.decompressSave(compressed);
      
      if (this.validateSave(saveData)) {
        await this.applySaveData(saveData);
        return true;
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
    return false;
  }
}
```

### 6.2 Cloud Save Preparation
```typescript
// cloudSaveInterface.ts - Ready for future cloud integration
export interface CloudSaveProvider {
  upload(saveData: SaveData): Promise<boolean>;
  download(): Promise<SaveData | null>;
  sync(): Promise<SyncResult>;
}

export class GooglePlaySaveProvider implements CloudSaveProvider {
  async upload(saveData: SaveData): Promise<boolean> {
    // Implementation ready for Google Play Games integration
    return true;
  }
  
  async download(): Promise<SaveData | null> {
    // Implementation ready for cloud download
    return null;
  }
  
  async sync(): Promise<SyncResult> {
    // Conflict resolution logic
    return { success: true, conflicts: [] };
  }
}
```

---

## 7. Cross-Platform Considerations

### 7.1 Platform-Specific Optimizations
```typescript
// platformConfig.ts - Handle platform differences
import { Platform, Dimensions } from 'react-native';

export const PlatformConfig = {
  // Performance settings per platform
  ios: {
    enableHermes: false, // iOS uses JSC
    enableFlipper: __DEV__,
    particleLimit: Platform.isPad ? 50 : 30,
    audioFormat: 'aac',
    saveLocation: 'keychain'
  },
  
  android: {
    enableHermes: true, // 30% performance boost
    enableFlipper: __DEV__,
    particleLimit: 40,
    audioFormat: 'mp3',
    saveLocation: 'encrypted_shared_preferences'
  },
  
  web: {
    enableHermes: false,
    enableFlipper: false,
    particleLimit: 20, // Lower for web compatibility
    audioFormat: 'mp3',
    saveLocation: 'local_storage'
  },
  
  // Screen size adaptations
  getLayoutConfig: () => {
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) > 600;
    const isPhone = Math.min(width, height) <= 600;
    
    return {
      isTablet,
      isPhone,
      columns: isTablet ? 3 : 2,
      departmentPanelHeight: isTablet ? 400 : 300,
      fontSize: {
        small: isTablet ? 14 : 12,
        medium: isTablet ? 18 : 16,
        large: isTablet ? 24 : 20
      }
    };
  }
};

// responsiveUtils.ts - Responsive design utilities
export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  const layout = useMemo(() => PlatformConfig.getLayoutConfig(), [dimensions]);
  
  return layout;
};
```

### 7.2 Device Performance Adaptation
```typescript
// performanceAdapter.ts - Dynamic quality adjustment
export class PerformanceAdapter {
  private static frameDropCounter = 0;
  private static lastFrameTime = 0;
  
  // Monitor performance and adapt quality
  static initialize() {
    const monitor = setInterval(() => {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastFrameTime;
      
      if (deltaTime > 20) { // Frame drop detected (>50ms = <20fps)
        this.frameDropCounter++;
        
        if (this.frameDropCounter > 10) {
          this.degradeQuality();
          this.frameDropCounter = 0;
        }
      } else if (deltaTime < 16 && this.frameDropCounter === 0) {
        // Good performance, potentially upgrade quality
        this.considerQualityUpgrade();
      }
      
      this.lastFrameTime = currentTime;
      gameState$.performance.fps.set(Math.round(1000 / deltaTime));
    }, 1000);
    
    return monitor;
  }
  
  private static degradeQuality() {
    const current = gameState$.settings.qualityLevel.get();
    
    switch (current) {
      case 'high':
        gameState$.settings.qualityLevel.set('medium');
        break;
      case 'medium':
        gameState$.settings.qualityLevel.set('low');
        break;
      case 'auto':
        gameState$.settings.qualityLevel.set('low');
        break;
    }
    
    console.log(`Quality degraded to: ${gameState$.settings.qualityLevel.get()}`);
  }
  
  private static considerQualityUpgrade() {
    const current = gameState$.settings.qualityLevel.get();
    
    if (current === 'auto') {
      // Auto mode gradually increases quality
      setTimeout(() => {
        if (gameState$.performance.fps.get() > 55) {
          gameState$.settings.qualityLevel.set('high');
        }
      }, 5000);
    }
  }
}
```

### 7.3 Cross-Platform Testing Matrix
| Feature | iOS | Android | Web | Test Method |
|---------|-----|---------|-----|-------------|
| Save/Load | ✅ | ✅ | ✅ | Automated unit tests |
| Audio System | ✅ | ✅ | ⚠️ Web Audio API | Device testing |
| Animations | ✅ | ✅ | ⚠️ CSS fallback | Performance profiling |
| Touch/Click | ✅ | ✅ | ✅ | E2E automation |
| Offline Mode | ✅ | ✅ | ✅ | Network simulation |
| Memory Usage | ✅ | ✅ | ⚠️ Browser limits | Memory profiler |

---

## 8. Implementation Checklist

### 8.1 Phase 1: Foundation (Week 1)
- [ ] Project setup with Expo SDK 52
- [ ] TypeScript configuration with strict mode
- [ ] Legend State integration and testing
- [ ] Basic game loop implementation
- [ ] Core state management (resources, departments)
- [ ] Save/Load system foundation
- [ ] Performance monitoring setup

### 8.2 Phase 2: Core Features (Week 2)
- [ ] All seven department implementations
- [ ] Employee hiring and cost scaling
- [ ] Manager automation system
- [ ] Prestige system with investor points
- [ ] Achievement system framework
- [ ] Basic UI components with animations

### 8.3 Phase 3: Polish & Performance (Week 3)
- [ ] Audio system implementation
- [ ] Particle effects and screen shake
- [ ] Office evolution visuals
- [ ] Performance optimization and quality settings
- [ ] Cross-platform testing
- [ ] Memory leak detection and fixes

### 8.4 Phase 4: Launch Preparation (Week 4)
- [ ] Comprehensive testing on target devices
- [ ] Save corruption prevention and recovery
- [ ] Analytics integration (privacy-compliant)
- [ ] App store optimization
- [ ] Documentation and deployment

---

## 9. Risk Mitigation Strategies

### 9.1 Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Legend State Beta Issues | Medium | High | Thorough testing + Redux fallback |
| Performance on Low-End Devices | High | High | Quality settings + progressive enhancement |
| Save Corruption | Low | Critical | Triple-save strategy + validation |
| Cross-Platform Compatibility | Medium | Medium | Comprehensive testing matrix |

### 9.2 Performance Monitoring
```typescript
// performanceMonitor.ts - Production monitoring
export class PerformanceMonitor {
  static startMonitoring() {
    // Track critical metrics
    const metrics = {
      fps: new MovingAverage(60),
      memoryUsage: new MovingAverage(30),
      saveTime: new MovingAverage(10),
      loadTime: new MovingAverage(5)
    };
    
    // Report to analytics (privacy-compliant)
    setInterval(() => {
      const report = {
        avgFPS: metrics.fps.getAverage(),
        memoryUsage: metrics.memoryUsage.getAverage(),
        deviceInfo: this.getAnonymizedDeviceInfo()
      };
      
      // Only if user opted in
      if (gameState$.settings.analyticsEnabled.get()) {
        Analytics.track('performance_report', report);
      }
    }, 60000); // Every minute
  }
}
```

---

This technical requirements document provides a comprehensive blueprint for implementing PetSoft Tycoon with React Native, Expo, and Legend State, ensuring 60 FPS performance, robust cross-platform support, and exceptional game feel through detailed architecture specifications, performance optimization strategies, and risk mitigation approaches.