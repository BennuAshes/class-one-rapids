# Phase 01: Foundation & Core Game Loop

**Duration:** Weeks 2-3  
**Objective:** Implement MVP with core game mechanics and development department  
**Dependencies:** Phase 00 completed, project structure established

## Objectives

- [ ] Core game loop implementation (write code → earn money)
- [ ] Development department vertical slice complete
- [ ] Basic UI with performance optimizations
- [ ] Save/load system functional
- [ ] Audio system integrated
- [ ] Cross-platform compatibility verified

## Core Game Loop Implementation

### 1. Game State Foundation (Week 2, Days 1-2)

```bash
# Create core game state structure
mkdir -p src/core
mkdir -p src/shared/{types,utils,ui,persistence,audio}
```

**Core State Implementation:**
```bash
# Create shared types
cat > src/shared/types/GameState.ts << 'EOF'
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
    // Other departments will be added in Phase 02
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

export interface DevelopmentState {
  linesOfCode: number;
  developers: DeveloperUnit[];
  upgrades: {
    ides: number;
    pairProgramming: boolean;
    codeReviews: boolean;
  };
}

export interface DeveloperUnit {
  id: string;
  type: 'junior' | 'mid' | 'senior' | 'lead';
  count: number;
  cost: number;
  production: number;
}
EOF
```

### 2. Core Event System (Week 2, Days 2-3)

```bash
# Create event bus for game systems
cat > src/core/EventBus.ts << 'EOF'
type EventCallback<T = any> = (data: T) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();
  
  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.events.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }
  
  emit<T>(event: string, data?: T): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const gameEvents = new EventBus();
EOF

# Create event types
cat > src/core/EventTypes.ts << 'EOF'
export interface GameEvents {
  'code.written': { amount: number; developerType: string };
  'feature.shipped': { value: number; featureType: string };
  'developer.hired': { type: string; cost: number };
  'money.earned': { amount: number; source: string };
  'milestone.reached': { milestone: string; reward: number };
}
EOF
```

### 3. Development Department Implementation (Week 2, Days 3-5)

```bash
# Create development department structure
mkdir -p src/features/development/{state,components,hooks,handlers,validators}
```

**State Management:**
```bash
cat > src/features/development/state/developmentStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

interface DeveloperUnit {
  id: string;
  type: 'junior' | 'mid' | 'senior' | 'lead';
  count: number;
  baseCost: number;
  production: number;
}

const DEVELOPER_CONFIGS = {
  junior: { baseCost: 10, production: 0.1 },
  mid: { baseCost: 100, production: 0.5 },
  senior: { baseCost: 1000, production: 2.0 },
  lead: { baseCost: 10000, production: 5.0 },
};

const developmentState$ = observable({
  linesOfCode: 0,
  developers: Object.entries(DEVELOPER_CONFIGS).map(([type, config]) => ({
    id: type,
    type: type as keyof typeof DEVELOPER_CONFIGS,
    count: 0,
    baseCost: config.baseCost,
    production: config.production,
  })),
  
  upgrades: {
    ides: 0,
    pairProgramming: false,
    codeReviews: false,
  },
  
  // Computed values
  totalProduction: () => {
    const developers = developmentState$.developers.get();
    return developers.reduce((total, dev) => {
      const upgradeMultiplier = 1 + (developmentState$.upgrades.ides.get() * 0.1);
      return total + (dev.count * dev.production * upgradeMultiplier);
    }, 0);
  },
  
  currentDeveloperCost: (type: keyof typeof DEVELOPER_CONFIGS) => {
    const developers = developmentState$.developers.get();
    const dev = developers.find(d => d.type === type);
    if (!dev) return 0;
    
    // Cost scaling: baseCost * 1.15^owned
    return Math.floor(dev.baseCost * Math.pow(1.15, dev.count));
  },
});

export const useDevelopment = () => {
  const hireDeveloper = (type: keyof typeof DEVELOPER_CONFIGS, playerMoney: number): boolean => {
    const cost = developmentState$.currentDeveloperCost(type).get();
    
    if (playerMoney < cost) {
      return false;
    }
    
    // Find and update developer count
    const developers = developmentState$.developers.get();
    const devIndex = developers.findIndex(d => d.type === type);
    
    if (devIndex >= 0) {
      developmentState$.developers[devIndex].count.set(prev => prev + 1);
      
      // Emit event for global state update
      gameEvents.emit('developer.hired', { type, cost });
      gameEvents.emit('money.earned', { amount: -cost, source: 'developer_purchase' });
      
      return true;
    }
    
    return false;
  };
  
  const upgradeIdes = (playerMoney: number): boolean => {
    const cost = 1000 * Math.pow(2, developmentState$.upgrades.ides.get());
    
    if (playerMoney >= cost) {
      developmentState$.upgrades.ides.set(prev => prev + 1);
      gameEvents.emit('money.earned', { amount: -cost, source: 'ide_upgrade' });
      return true;
    }
    
    return false;
  };
  
  const writeCode = (): void => {
    const production = developmentState$.totalProduction.get();
    const codeAmount = Math.max(1, Math.floor(production));
    
    developmentState$.linesOfCode.set(prev => prev + codeAmount);
    gameEvents.emit('code.written', { amount: codeAmount, developerType: 'manual' });
  };
  
  return {
    // Read-only state
    linesOfCode: developmentState$.linesOfCode,
    developers: developmentState$.developers,
    totalProduction: developmentState$.totalProduction,
    upgrades: developmentState$.upgrades,
    currentDeveloperCost: developmentState$.currentDeveloperCost,
    
    // Actions
    hireDeveloper,
    upgradeIdes,
    writeCode,
  };
};
EOF
```

**Components Implementation:**
```bash
# Animated counter component
cat > src/shared/ui/AnimatedNumber.tsx << 'EOF'
import React, { useRef, useEffect } from 'react';
import { Animated, Text, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  formatter?: (value: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 300,
  style,
  formatter = (v) => v.toLocaleString(),
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
  }, [value, duration]);
  
  return (
    <Animated.Text style={style}>
      {animatedValue.interpolate({
        inputRange: [0, value || 1],
        outputRange: ['0', formatter(value)],
        extrapolate: 'clamp',
      })}
    </Animated.Text>
  );
};
EOF

# Main development tab component
cat > src/features/development/components/DevelopmentTab.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDevelopment } from '../state/developmentStore';
import { usePlayer } from '../../core/state/playerStore'; // Will create in next step
import { AnimatedNumber } from '../../../shared/ui/AnimatedNumber';
import { DeveloperList } from './DeveloperList';

export const DevelopmentTab: React.FC = () => {
  const { linesOfCode, writeCode } = useDevelopment();
  const { money } = usePlayer();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Development Department</Text>
        <AnimatedNumber 
          value={linesOfCode.get()} 
          style={styles.counter}
          formatter={(v) => `${v.toLocaleString()} lines of code`}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.writeCodeButton}
        onPress={() => writeCode()}
      >
        <Text style={styles.buttonText}>Write Code</Text>
      </TouchableOpacity>
      
      <DeveloperList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  counter: {
    fontSize: 18,
    color: '#2196F3',
  },
  writeCodeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
EOF
```

### 4. Player State & Game Loop (Week 3, Days 1-2)

```bash
# Create player state management
cat > src/features/core/state/playerStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

const playerState$ = observable({
  money: 100,
  valuation: 1000,
  investmentPoints: 0,
  startTime: Date.now(),
  lastSave: Date.now(),
  
  // Computed values
  moneyPerSecond: () => {
    // Calculate passive income from all sources
    return 0; // Will be implemented with automated systems
  },
});

// Listen to game events for state updates
gameEvents.on('money.earned', ({ amount }) => {
  playerState$.money.set(prev => Math.max(0, prev + amount));
});

gameEvents.on('feature.shipped', ({ value }) => {
  playerState$.money.set(prev => prev + value);
  playerState$.valuation.set(prev => prev + value * 10);
});

export const usePlayer = () => {
  const canAfford = (cost: number): boolean => {
    return playerState$.money.get() >= cost;
  };
  
  const spendMoney = (amount: number): boolean => {
    if (canAfford(amount)) {
      playerState$.money.set(prev => prev - amount);
      return true;
    }
    return false;
  };
  
  return {
    // Read-only state
    money: playerState$.money,
    valuation: playerState$.valuation,
    investmentPoints: playerState$.investmentPoints,
    moneyPerSecond: playerState$.moneyPerSecond,
    
    // Actions
    canAfford,
    spendMoney,
  };
};
EOF
```

### 5. Save/Load System Implementation (Week 3, Days 2-3)

```bash
# Create save manager
cat > src/shared/persistence/SaveManager.ts << 'EOF'
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SaveData {
  version: string;
  timestamp: number;
  gameState: {
    player: any;
    departments: any;
    progression: any;
    settings: any;
  };
  checksum: string;
}

class SaveManager {
  private readonly SAVE_KEY = 'petsoft_tycoon_save';
  private readonly BACKUP_KEY = 'petsoft_tycoon_backup';
  private readonly SAVE_VERSION = '1.0.0';
  
  async saveGame(gameState: SaveData['gameState']): Promise<void> {
    try {
      // Create backup of current save
      const currentSave = await AsyncStorage.getItem(this.SAVE_KEY);
      if (currentSave) {
        await AsyncStorage.setItem(this.BACKUP_KEY, currentSave);
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
  
  async loadGame(): Promise<SaveData['gameState'] | null> {
    try {
      const saveString = await AsyncStorage.getItem(this.SAVE_KEY);
      if (!saveString) return null;
      
      const saveData: SaveData = JSON.parse(saveString);
      
      // Verify checksum
      if (saveData.checksum !== this.generateChecksum(saveData.gameState)) {
        console.warn('Save data corrupted, attempting backup');
        return this.loadBackup();
      }
      
      return saveData.gameState;
    } catch (error) {
      console.error('Load failed:', error);
      return this.loadBackup();
    }
  }
  
  private generateChecksum(gameState: SaveData['gameState']): string {
    return btoa(JSON.stringify(gameState)).slice(0, 16);
  }
  
  private async loadBackup(): Promise<SaveData['gameState'] | null> {
    try {
      const backupString = await AsyncStorage.getItem(this.BACKUP_KEY);
      if (!backupString) return null;
      
      const backupData: SaveData = JSON.parse(backupString);
      return backupData.gameState;
    } catch (error) {
      console.error('Backup load failed:', error);
      return null;
    }
  }
}

export const saveManager = new SaveManager();

// Auto-save functionality
export class AutoSaveManager {
  private saveInterval: NodeJS.Timeout | null = null;
  
  startAutoSave(getGameState: () => SaveData['gameState'], intervalMs: number = 30000) {
    this.saveInterval = setInterval(async () => {
      try {
        const gameState = getGameState();
        await saveManager.saveGame(gameState);
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
EOF
```

### 6. Audio System Integration (Week 3, Days 3-4)

```bash
# Install audio dependencies
npm install expo-av

# Create audio manager
cat > src/shared/audio/AudioManager.ts << 'EOF'
import { Audio } from 'expo-av';

class AudioManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private lastPlayTimes: Map<string, number> = new Map();
  private enabled: boolean = true;
  private volume: number = 1.0;
  
  async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      });
      
      await this.loadSounds();
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }
  
  private async loadSounds(): Promise<void> {
    const soundFiles = {
      keyboardClick: require('./sounds/keyboard-click.wav'),
      cashRegister: require('./sounds/cash-register.wav'),
      notification: require('./sounds/notification.wav'),
      milestone: require('./sounds/milestone.wav'),
    };
    
    for (const [key, uri] of Object.entries(soundFiles)) {
      try {
        const { sound } = await Audio.Sound.createAsync(uri);
        this.sounds.set(key, sound);
      } catch (error) {
        console.error(`Failed to load sound ${key}:`, error);
      }
    }
  }
  
  playSound(soundKey: string, volume: number = this.volume): void {
    if (!this.enabled) return;
    
    const now = Date.now();
    const lastPlay = this.lastPlayTimes.get(soundKey) || 0;
    
    // Prevent sound spam (max once per 100ms)
    if (now - lastPlay < 100) return;
    
    const sound = this.sounds.get(soundKey);
    if (sound) {
      sound.setVolumeAsync(volume);
      sound.replayAsync().catch(error => 
        console.error(`Failed to play sound ${soundKey}:`, error)
      );
      this.lastPlayTimes.set(soundKey, now);
    }
  }
  
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}

export const audioManager = new AudioManager();

// Hook for easy component usage
export const useAudio = () => {
  return {
    playSound: audioManager.playSound.bind(audioManager),
    setEnabled: audioManager.setEnabled.bind(audioManager),
    setVolume: audioManager.setVolume.bind(audioManager),
  };
};
EOF
```

### 7. Main App Integration (Week 3, Days 4-5)

```bash
# Update App.tsx
cat > App.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { DevelopmentTab } from './src/features/development/components/DevelopmentTab';
import { audioManager } from './src/shared/audio/AudioManager';
import { saveManager, AutoSaveManager } from './src/shared/persistence/SaveManager';
import { usePlayer } from './src/features/core/state/playerStore';
import { useDevelopment } from './src/features/development/state/developmentStore';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { money } = usePlayer();
  const autoSaveManager = new AutoSaveManager();
  
  useEffect(() => {
    initialize();
    
    return () => {
      autoSaveManager.stopAutoSave();
    };
  }, []);
  
  const initialize = async () => {
    try {
      // Initialize audio
      await audioManager.initialize();
      
      // Load saved game
      const savedGame = await saveManager.loadGame();
      if (savedGame) {
        // Apply saved state to stores
        // Implementation depends on state restoration pattern
      }
      
      // Start auto-save
      autoSaveManager.startAutoSave(() => ({
        player: { money: money.get() },
        departments: { /* department states */ },
        progression: { /* progression state */ },
        settings: { /* settings state */ },
      }));
      
      setIsLoaded(true);
    } catch (error) {
      console.error('App initialization failed:', error);
      setIsLoaded(true); // Continue with default state
    }
  };
  
  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading PetSoft Tycoon...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PetSoft Tycoon</Text>
        <Text style={styles.money}>${money.get().toLocaleString()}</Text>
      </View>
      
      <DevelopmentTab />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  money: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
  },
});
EOF
```

## Testing & Validation Tasks

### 1. Unit Testing Setup (Week 3, Day 5)

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# Create test for development store
cat > src/features/development/__tests__/developmentStore.test.ts << 'EOF'
import { useDevelopment } from '../state/developmentStore';

describe('Development Store', () => {
  beforeEach(() => {
    // Reset store state
  });
  
  it('should calculate production correctly', () => {
    const { hireDeveloper, totalProduction } = useDevelopment();
    
    hireDeveloper('junior', 100);
    expect(totalProduction.get()).toBe(0.1);
    
    hireDeveloper('mid', 1000);
    expect(totalProduction.get()).toBe(0.6);
  });
  
  it('should apply cost scaling formula', () => {
    const { hireDeveloper, currentDeveloperCost } = useDevelopment();
    
    expect(currentDeveloperCost('junior').get()).toBe(10);
    hireDeveloper('junior', 100);
    expect(currentDeveloperCost('junior').get()).toBe(12); // 10 * 1.15^1
  });
  
  it('should prevent hiring without sufficient funds', () => {
    const { hireDeveloper } = useDevelopment();
    
    const result = hireDeveloper('junior', 5); // Less than cost of 10
    expect(result).toBe(false);
  });
});
EOF

# Run tests
npm test
```

### 2. Cross-Platform Testing (Week 3, Day 5)

```bash
# Test on all platforms
npx expo start --ios
npx expo start --android
npx expo start --web

# Verify performance
npx expo export --platform all
# Check bundle sizes
ls -la dist/
```

## Performance Validation

### 1. Performance Metrics Collection

```bash
# Create performance monitor
cat > src/shared/monitoring/PerformanceMonitor.ts << 'EOF'
class PerformanceMonitor {
  private frameDrops = 0;
  private lastFrameTime = performance.now();
  private isMonitoring = false;
  
  startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    
    const monitor = () => {
      if (!this.isMonitoring) return;
      
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
  
  stopMonitoring(): void {
    this.isMonitoring = false;
  }
  
  getMetrics() {
    return {
      frameDrops: this.frameDrops,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
    };
  }
  
  reset(): void {
    this.frameDrops = 0;
    this.lastFrameTime = performance.now();
  }
}

export const performanceMonitor = new PerformanceMonitor();
EOF
```

## Validation Criteria

### Functional Requirements Met
- [ ] Write code button increments lines of code
- [ ] Developer hiring system functional with cost scaling
- [ ] Automated code production based on developer count
- [ ] Save/load system preserves game state
- [ ] Audio feedback on user interactions
- [ ] Cross-platform compatibility (iOS, Android, Web)

### Performance Requirements Met
- [ ] <50ms button response time measured
- [ ] 60fps maintained during animations
- [ ] Memory usage under 128MB for MVP
- [ ] App startup time under 3 seconds
- [ ] Bundle size under 50MB

### Code Quality Requirements Met
- [ ] >90% test coverage for core features
- [ ] ESLint passes with no warnings
- [ ] TypeScript strict mode enabled
- [ ] Vertical slicing pattern correctly implemented
- [ ] No cross-feature imports detected

## Deliverables

1. **Core Game Loop** - Functional write code → earn money cycle
2. **Development Department** - Complete vertical slice with all components
3. **Save/Load System** - Persistent game state with backup protection
4. **Audio System** - Sound effects for user interactions
5. **Performance Framework** - Monitoring and optimization tools
6. **Test Suite** - Unit tests with >90% coverage

## Next Phase

Upon completion, proceed to [02-Core Features](./02-core-features.md) for additional department implementations.

---

**Phase Completion Criteria:** All validation checkboxes marked, core game loop functional, MVP playable

**Research Dependencies:**
- vertical-slicing: Development department as complete independent slice
- @legendapp/state@beta: Reactive state management for performance
- FlatList optimization: Efficient rendering for developer lists
- new-architecture: RN 0.76+ performance benefits utilized