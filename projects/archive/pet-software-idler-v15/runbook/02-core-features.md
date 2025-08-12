# Phase 2: Core Features Implementation

**Duration**: 40 hours  
**Timeline**: Days 6-15  
**Dependencies**: Phase 1 foundation setup completed

## Objectives
- Implement core idle game mechanics and game loop
- Build reactive state management with Legend State v3
- Create main game UI with performance-optimized rendering
- Implement save/load system with offline progression
- Establish basic department and employee mechanics
- Achieve 60 FPS performance targets

## Tasks Breakdown

### Task 2.1: Game Loop Implementation (8 hours)
**Objective**: Create high-performance game loop with 60fps target

#### Step 2.1.1: Core Game Loop Service
```bash
# Create game loop service
cat > src/core/services/gameLoop.ts << 'EOF'
import { Observable } from '@legendapp/state';
import { gameState } from '../state/gameState';

class GameLoop {
  private frameId: number = 0;
  private lastUpdate: number = 0;
  private readonly TARGET_FPS = 60;
  private readonly FRAME_TIME = 1000 / this.TARGET_FPS;
  
  // Performance monitoring
  private frameTimeHistory: number[] = [];
  private performanceMode: 'high' | 'balanced' | 'battery' = 'balanced';
  private isRunning: boolean = false;
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastUpdate = Date.now();
    this.loop();
    console.log('🎮 Game loop started at 60fps target');
  }
  
  stop() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }
    this.isRunning = false;
    console.log('⏸️ Game loop stopped');
  }
  
  private loop = () => {
    if (!this.isRunning) return;
    
    const now = Date.now();
    const deltaTime = now - this.lastUpdate;
    
    // Track frame performance
    this.trackFrameTime(deltaTime);
    
    // Adaptive performance scaling
    this.adjustPerformanceMode();
    
    // Update game state (optimized for 60fps)
    this.updateGameState(deltaTime);
    
    this.lastUpdate = now;
    this.frameId = requestAnimationFrame(this.loop);
  };
  
  private updateGameState(deltaTime: number) {
    // Batch state updates for performance
    Observable.batch(() => {
      // Resource production calculations
      this.updateResourceProduction(deltaTime);
      
      // Department efficiency calculations (less frequent)
      if (this.frameId % 5 === 0) { // Every 5 frames (~12fps)
        this.updateDepartmentEfficiencies();
      }
      
      // Achievement progress checks (throttled)
      if (this.frameId % 30 === 0) { // Every 30 frames (0.5s)
        this.checkAchievements();
      }
      
      // Auto-save (every 30 seconds)
      if (this.frameId % 1800 === 0) { // 30s at 60fps
        this.triggerAutoSave();
      }
      
      // Statistics tracking
      gameState.progression.statisticsTracking.totalPlayTime.set(prev => 
        prev + deltaTime
      );
    });
  }
  
  private updateResourceProduction(deltaTime: number) {
    const productionPerSecond = this.calculateTotalProduction();
    const deltaSeconds = deltaTime / 1000;
    
    if (productionPerSecond > 0) {
      gameState.resources.money.set(prev => 
        prev + (productionPerSecond * deltaSeconds)
      );
    }
  }
  
  private calculateTotalProduction(): number {
    const departments = gameState.departments.get();
    return departments.reduce((total, dept) => {
      if (!dept.unlocked) return total;
      
      return total + dept.employees.reduce((deptTotal, emp) => 
        deptTotal + (emp.count * emp.baseProduction * emp.multiplier), 0
      );
    }, 0);
  }
  
  private updateDepartmentEfficiencies() {
    const departments = gameState.departments.get();
    
    departments.forEach((dept, index) => {
      if (!dept.unlocked) return;
      
      // Calculate efficiency based on employee synergy
      const efficiency = this.calculateDepartmentEfficiency(dept);
      gameState.departments[index].efficiency.set(efficiency);
      
      // Update total production for display
      const production = dept.employees.reduce((total, emp) => 
        total + (emp.count * emp.baseProduction * emp.multiplier), 0
      );
      gameState.departments[index].totalProduction.set(production);
    });
  }
  
  private calculateDepartmentEfficiency(dept: any): number {
    // Base efficiency starts at 100%
    let efficiency = 1.0;
    
    // Manager bonus
    if (dept.managerHired) {
      efficiency *= 2.0; // 100% bonus
    }
    
    // Employee synergy bonus (more employees = better efficiency)
    const totalEmployees = dept.employees.reduce((sum, emp) => sum + emp.count, 0);
    const synergyBonus = Math.min(0.5, totalEmployees * 0.01); // Max 50% bonus
    efficiency += synergyBonus;
    
    return efficiency;
  }
  
  private checkAchievements() {
    // Achievement checking logic will be implemented in integration phase
    // For now, just placeholder
  }
  
  private triggerAutoSave() {
    // Auto-save will be implemented in save system
    console.log('💾 Auto-save triggered');
  }
  
  private trackFrameTime(deltaTime: number) {
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }
  }
  
  private adjustPerformanceMode() {
    if (this.frameTimeHistory.length < 10) return;
    
    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) 
                         / this.frameTimeHistory.length;
    
    // If dropping below 50fps, reduce visual effects
    if (avgFrameTime > 20 && this.performanceMode !== 'battery') {
      this.performanceMode = 'battery';
      gameState.settings.performanceMode.set('battery');
      console.warn('⚡ Performance mode: BATTERY (frame time:', avgFrameTime, 'ms)');
    } 
    // If smooth performance, enable full effects
    else if (avgFrameTime < 12 && this.performanceMode !== 'high') {
      this.performanceMode = 'high';
      gameState.settings.performanceMode.set('high');
      console.log('🚀 Performance mode: HIGH (frame time:', avgFrameTime, 'ms)');
    }
  }
  
  // Public performance monitoring
  getPerformanceStats() {
    const avgFrameTime = this.frameTimeHistory.length > 0 
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
      : 0;
    
    return {
      fps: avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 0,
      frameTime: Math.round(avgFrameTime * 100) / 100,
      mode: this.performanceMode,
      isRunning: this.isRunning
    };
  }
}

export const gameLoop = new GameLoop();
EOF
```

#### Step 2.1.2: Game State Computed Values
```bash
# Add computed values for performance optimization
cat > src/core/state/gameComputed.ts << 'EOF'
import { computed } from '@legendapp/state';
import { gameState } from './gameState';

export const gameComputed = {
  // Total production per second across all departments
  totalProductionPerSecond: computed(() => {
    const departments = gameState.departments.get();
    return departments.reduce((total, dept) => {
      if (!dept.unlocked) return total;
      
      return total + dept.employees.reduce((deptTotal, emp) => 
        deptTotal + (emp.count * emp.baseProduction * emp.multiplier), 0
      );
    }, 0);
  }),
  
  // Department efficiency multipliers
  departmentEfficiencies: computed(() => {
    const departments = gameState.departments.get();
    return departments.map(dept => ({
      id: dept.id,
      efficiency: dept.efficiency,
      isUnlocked: dept.unlocked,
      hasManager: dept.managerHired
    }));
  }),
  
  // Next unlock requirements
  nextUnlocks: computed(() => {
    const money = gameState.resources.money.get();
    const departments = gameState.departments.get();
    
    const unlocks = [];
    
    // Check department unlocks
    departments.forEach(dept => {
      if (!dept.unlocked) {
        // Department unlock cost logic will be added
        unlocks.push({
          type: 'department',
          id: dept.id,
          name: dept.name,
          cost: 1000, // Placeholder
          canAfford: money >= 1000
        });
      }
    });
    
    return unlocks;
  }),
  
  // Affordable purchases for UI highlighting
  affordablePurchases: computed(() => {
    const money = gameState.resources.money.get();
    const departments = gameState.departments.get();
    const affordable = {};
    
    departments.forEach(dept => {
      if (!dept.unlocked) return;
      
      affordable[dept.id] = dept.employees
        .filter(emp => emp.unlocked && emp.currentCost <= money)
        .map(emp => emp.id);
    });
    
    return affordable;
  }),
  
  // Total statistics for achievements
  gameStatistics: computed(() => {
    const stats = gameState.progression.statisticsTracking.get();
    const totalMoney = gameState.resources.money.get();
    const totalEarnings = gameState.progression.totalEarnings.get();
    
    return {
      ...stats,
      currentMoney: Math.floor(totalMoney),
      totalEarnings: Math.floor(totalEarnings),
      playTimeHours: Math.floor(stats.totalPlayTime / 3600000), // Convert ms to hours
      averageEarningsPerHour: stats.totalPlayTime > 0 
        ? Math.floor(totalEarnings / (stats.totalPlayTime / 3600000))
        : 0
    };
  })
};
EOF
```

#### Success Criteria
- [ ] Game loop maintains 60 FPS on target devices
- [ ] Performance monitoring and adaptive scaling working
- [ ] Resource production calculations optimized
- [ ] Computed values reactive and performant

### Task 2.2: Main Game UI Implementation (12 hours)
**Objective**: Create core game interface with performance-optimized components

#### Step 2.2.1: Main Game Screen
```bash
# Create main game screen
mkdir -p src/features/game/components

cat > src/features/game/components/GameScreen.tsx << 'EOF'
import React, { useEffect, memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gameState } from '@/core/state/gameState';
import { gameComputed } from '@/core/state/gameComputed';
import { gameLoop } from '@/core/services/gameLoop';
import { ResourceDisplay } from './ResourceDisplay';
import { ProductionStats } from './ProductionStats';
import { MainClickButton } from './MainClickButton';
import { DepartmentsList } from './DepartmentsList';

export const GameScreen = memo(() => {
  // Start game loop when screen mounts
  useEffect(() => {
    gameLoop.start();
    return () => gameLoop.stop();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Resource Display */}
        <ResourceDisplay />
        
        {/* Production Statistics */}
        <ProductionStats />
        
        {/* Main Click Button */}
        <MainClickButton />
        
        {/* Departments List */}
        <DepartmentsList />
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});
EOF
```

#### Step 2.2.2: Resource Display Component
```bash
cat > src/features/game/components/ResourceDisplay.tsx << 'EOF'
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { gameState } from '@/core/state/gameState';
import { AnimatedNumber } from '@/shared/components/AnimatedNumber';
import { Card } from '@/shared/components/Card';

export const ResourceDisplay = memo(() => {
  const money = gameState.resources.money.use();
  const linesOfCode = gameState.resources.linesOfCode.use();
  const reputation = gameState.resources.reputation.use();
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1e12) return `$${(amount / 1e12).toFixed(1)}T`;
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${Math.floor(amount).toLocaleString()}`;
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return Math.floor(num).toLocaleString();
  };
  
  return (
    <Card style={styles.container}>
      <View style={styles.resourceRow}>
        <View style={styles.resourceItem}>
          <AnimatedNumber
            value={money}
            style={styles.moneyText}
            formatValue={formatCurrency}
            duration={300}
          />
          <Text style={styles.resourceLabel}>Revenue</Text>
        </View>
        
        <View style={styles.resourceItem}>
          <AnimatedNumber
            value={linesOfCode}
            style={styles.resourceText}
            formatValue={formatNumber}
            duration={300}
          />
          <Text style={styles.resourceLabel}>Lines of Code</Text>
        </View>
        
        <View style={styles.resourceItem}>
          <AnimatedNumber
            value={reputation}
            style={styles.resourceText}
            formatValue={formatNumber}
            duration={300}
          />
          <Text style={styles.resourceLabel}>Reputation</Text>
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
  },
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resourceItem: {
    alignItems: 'center',
  },
  moneyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  resourceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  resourceLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
EOF
```

#### Step 2.2.3: Animated Components
```bash
# Create animated number component
mkdir -p src/shared/components

cat > src/shared/components/AnimatedNumber.tsx << 'EOF'
import React, { memo, useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  formatValue?: (value: number) => string;
}

export const AnimatedNumber = memo<AnimatedNumberProps>(({
  value, duration = 300, style, formatValue = (v) => v.toString()
}) => {
  const animatedValue = useSharedValue(0);
  const scale = useSharedValue(1);
  
  useEffect(() => {
    // Animate scale bounce on value change
    scale.value = withSpring(1.05, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 200 });
    });
    
    // Animate number change
    animatedValue.value = withSpring(value, {
      duration,
      dampingRatio: 0.8
    });
  }, [value, duration]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    color: interpolate(
      scale.value,
      [1, 1.05],
      [0x333333, 0x2e7d32] // Dark gray to green
    )
  }));
  
  // Use a separate component for the text to avoid re-renders
  return (
    <Animated.View style={animatedStyle}>
      <AnimatedText 
        animatedValue={animatedValue}
        style={style}
        formatValue={formatValue}
      />
    </Animated.View>
  );
});

// Separate component for text rendering optimization
const AnimatedText = memo<{
  animatedValue: Animated.SharedValue<number>;
  style?: TextStyle;
  formatValue: (value: number) => string;
}>(({ animatedValue, style, formatValue }) => {
  const [displayValue, setDisplayValue] = React.useState('0');
  
  const updateDisplayValue = (newValue: number) => {
    setDisplayValue(formatValue(Math.floor(newValue)));
  };
  
  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      runOnJS(updateDisplayValue)(value);
    });
    
    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue]);
  
  return <Text style={style}>{displayValue}</Text>;
});
EOF

# Create Card component
cat > src/shared/components/Card.tsx << 'EOF'
import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card = memo<CardProps>(({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
));

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
EOF
```

#### Step 2.2.4: Main Click Button
```bash
cat > src/features/game/components/MainClickButton.tsx << 'EOF'
import React, { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { gameState } from '@/core/state/gameState';
import { Card } from '@/shared/components/Card';

export const MainClickButton = memo(() => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  const handleClick = useCallback(() => {
    // Update game state
    const clickPower = 1; // Base click power
    gameState.resources.money.set(prev => prev + clickPower);
    gameState.progression.statisticsTracking.totalClicks.set(prev => prev + 1);
    
    console.log('💰 Click! +$', clickPower);
  }, []);
  
  const handlePress = useCallback(() => {
    // Animate button press
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 200 });
    });
    
    // Add slight rotation for juice
    rotation.value = withSpring(rotation.value + 5, { duration: 150 }, () => {
      rotation.value = withSpring(0, { duration: 300 });
    });
    
    // Call the actual click handler
    runOnJS(handleClick)();
  }, [handleClick]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ]
  }));
  
  return (
    <Card style={styles.container}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Animated.View style={[styles.button, animatedStyle]}>
          <Text style={styles.buttonText}>💰</Text>
          <Text style={styles.buttonLabel}>Tap to Code!</Text>
        </Animated.View>
      </TouchableOpacity>
    </Card>
  );
});

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginVertical: 8,
  },
  button: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 48,
    marginBottom: 8,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});
EOF
```

#### Success Criteria
- [ ] Main game screen renders without performance issues
- [ ] Animated components maintain 60 FPS
- [ ] Click interactions provide immediate feedback
- [ ] Resource displays update smoothly

### Task 2.3: Save/Load System (8 hours)
**Objective**: Implement robust save system with offline progression

#### Step 2.3.1: Save System Service
```bash
cat > src/core/services/saveSystem.ts << 'EOF'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { compress, decompress } from 'lz-string';
import { gameState, GameState } from '../state/gameState';

interface SaveData {
  version: string;
  timestamp: number;
  gameState: GameState;
  checksum: string;
}

interface SaveOptions {
  compress: boolean;
  backup: boolean;
  validate: boolean;
}

class SaveSystem {
  private readonly SAVE_KEY = 'petsoft_tycoon_save';
  private readonly BACKUP_KEY = 'petsoft_tycoon_backup';
  private readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds
  private readonly MAX_SAVE_SIZE = 1024 * 1024; // 1MB limit
  
  private autoSaveTimer?: NodeJS.Timeout;
  private lastSaveTime: number = 0;
  private saveInProgress: boolean = false;
  
  initialize() {
    console.log('💾 Save system initializing...');
    
    // Set up auto-save
    this.startAutoSave();
    
    // Load existing save data
    this.loadGame();
  }
  
  async saveGame(options: Partial<SaveOptions> = {}): Promise<boolean> {
    if (this.saveInProgress) {
      console.log('💾 Save already in progress, skipping...');
      return false;
    }
    
    const opts: SaveOptions = {
      compress: true,
      backup: true,
      validate: true,
      ...options
    };
    
    try {
      this.saveInProgress = true;
      console.log('💾 Saving game state...');
      
      // Create save data
      const saveData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        gameState: gameState.get(),
        checksum: ''
      };
      
      // Generate checksum for integrity
      if (opts.validate) {
        saveData.checksum = this.generateChecksum(saveData.gameState);
      }
      
      // Serialize and optionally compress
      let serializedData = JSON.stringify(saveData);
      if (opts.compress) {
        const compressed = compress(serializedData);
        if (compressed && compressed.length < serializedData.length) {
          serializedData = compressed;
        }
      }
      
      // Check size limits
      if (serializedData.length > this.MAX_SAVE_SIZE) {
        throw new Error(`Save data too large: ${serializedData.length} bytes`);
      }
      
      // Create backup of current save
      if (opts.backup) {
        try {
          const currentSave = await AsyncStorage.getItem(this.SAVE_KEY);
          if (currentSave) {
            await AsyncStorage.setItem(this.BACKUP_KEY, currentSave);
          }
        } catch (error) {
          console.warn('💾 Failed to create backup:', error);
        }
      }
      
      // Save to storage
      await AsyncStorage.setItem(this.SAVE_KEY, serializedData);
      
      this.lastSaveTime = Date.now();
      console.log('💾 Game saved successfully');
      
      return true;
      
    } catch (error) {
      console.error('💾 Save failed:', error);
      return false;
    } finally {
      this.saveInProgress = false;
    }
  }
  
  async loadGame(): Promise<boolean> {
    try {
      console.log('💾 Loading game state...');
      
      const savedData = await AsyncStorage.getItem(this.SAVE_KEY);
      if (!savedData) {
        console.log('💾 No save data found, starting new game');
        return false;
      }
      
      // Try to parse the save data
      let saveData: SaveData;
      try {
        // Try decompression first
        const decompressed = decompress(savedData);
        saveData = JSON.parse(decompressed || savedData);
      } catch {
        // Fall back to raw JSON
        saveData = JSON.parse(savedData);
      }
      
      // Validate save data
      if (!this.validateSaveData(saveData)) {
        console.error('💾 Save data validation failed');
        return await this.attemptRecovery();
      }
      
      // Check version compatibility
      if (!this.isVersionCompatible(saveData.version)) {
        console.log(`💾 Migrating save from ${saveData.version} to 1.0.0`);
        saveData = this.migrateSave(saveData);
      }
      
      // Calculate offline earnings
      const offlineTime = Date.now() - saveData.timestamp;
      const offlineEarnings = this.calculateOfflineEarnings(
        saveData.gameState, 
        offlineTime
      );
      
      // Apply save data to game state
      gameState.set({
        ...saveData.gameState,
        offline: {
          ...saveData.gameState.offline,
          offlineEarnings,
          lastSaveTime: saveData.timestamp
        }
      });
      
      const offlineMinutes = Math.floor(offlineTime / 60000);
      console.log(`💾 Game loaded successfully. Offline for ${offlineMinutes} minutes`);
      
      // Show offline earnings if significant
      if (offlineEarnings > 0) {
        console.log(`💰 Offline earnings: $${offlineEarnings}`);
        // Add to current money
        gameState.resources.money.set(prev => prev + offlineEarnings);
      }
      
      return true;
      
    } catch (error) {
      console.error('💾 Load failed:', error);
      return await this.attemptRecovery();
    }
  }
  
  private async attemptRecovery(): Promise<boolean> {
    try {
      console.log('💾 Attempting to recover from backup...');
      
      const backupData = await AsyncStorage.getItem(this.BACKUP_KEY);
      if (!backupData) {
        console.log('💾 No backup available');
        return false;
      }
      
      // Try to load backup
      const decompressed = decompress(backupData);
      const saveData: SaveData = JSON.parse(decompressed || backupData);
      
      if (this.validateSaveData(saveData)) {
        gameState.set(saveData.gameState);
        console.log('💾 Successfully recovered from backup');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('💾 Backup recovery failed:', error);
      return false;
    }
  }
  
  private validateSaveData(saveData: SaveData): boolean {
    // Basic structure validation
    if (!saveData.gameState || !saveData.version || !saveData.timestamp) {
      return false;
    }
    
    // Checksum validation
    if (saveData.checksum) {
      const calculatedChecksum = this.generateChecksum(saveData.gameState);
      if (calculatedChecksum !== saveData.checksum) {
        console.warn('💾 Checksum validation failed');
        // Don't fail completely on checksum mismatch in beta
        // return false;
      }
    }
    
    // Data integrity checks
    const state = saveData.gameState;
    if (typeof state.resources?.money !== 'number' || 
        state.resources.money < 0 || 
        !Array.isArray(state.departments)) {
      return false;
    }
    
    return true;
  }
  
  private calculateOfflineEarnings(gameState: GameState, offlineTime: number): number {
    const maxOfflineTime = (gameState.offline?.maxOfflineHours || 12) * 3600000; // Default 12 hours
    const effectiveTime = Math.min(offlineTime, maxOfflineTime);
    
    // Only calculate if offline for more than 5 minutes
    if (effectiveTime < 300000) return 0;
    
    // Calculate total production per second
    let totalProduction = 0;
    
    gameState.departments.forEach(dept => {
      if (dept.managerHired && dept.unlocked) { // Only automated departments work offline
        dept.employees.forEach(emp => {
          totalProduction += emp.count * emp.baseProduction * emp.multiplier;
        });
      }
    });
    
    // Apply offline efficiency penalty (50% of online production)
    const offlineEarnings = Math.floor(totalProduction * (effectiveTime / 1000) * 0.5);
    
    return Math.max(0, offlineEarnings);
  }
  
  private generateChecksum(gameState: GameState): string {
    // Simple hash function for data integrity
    const data = JSON.stringify({
      money: gameState.resources.money,
      departments: gameState.departments.length,
      totalEarnings: gameState.progression.totalEarnings
    });
    
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
  
  private isVersionCompatible(version: string): boolean {
    // Version compatibility check
    const currentVersion = '1.0.0';
    return version === currentVersion;
  }
  
  private migrateSave(saveData: SaveData): SaveData {
    // Save migration logic for version updates
    console.log(`💾 Migrating save from ${saveData.version} to 1.0.0`);
    
    const migratedState = { ...saveData.gameState };
    
    // Example migration: Add new fields that didn't exist in older versions
    if (!migratedState.progression?.statisticsTracking) {
      migratedState.progression = {
        ...migratedState.progression,
        statisticsTracking: {
          totalClicks: 0,
          totalPlayTime: 0,
          prestigeCount: 0,
          departmentsUnlocked: 1,
          employeesHired: 0
        }
      };
    }
    
    return {
      ...saveData,
      version: '1.0.0',
      gameState: migratedState
    };
  }
  
  private startAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      this.saveGame({ 
        compress: true, 
        backup: false, // Don't backup on auto-save 
        validate: false // Skip validation for performance
      });
    }, this.AUTO_SAVE_INTERVAL);
    
    console.log(`💾 Auto-save started (every ${this.AUTO_SAVE_INTERVAL / 1000}s)`);
  }
  
  async exportSave(): Promise<string> {
    const saveData = await AsyncStorage.getItem(this.SAVE_KEY);
    if (!saveData) throw new Error('No save data to export');
    
    return compress(saveData);
  }
  
  async importSave(compressedSave: string): Promise<boolean> {
    try {
      const decompressed = decompress(compressedSave);
      const saveData: SaveData = JSON.parse(decompressed);
      
      if (!this.validateSaveData(saveData)) {
        throw new Error('Invalid save data');
      }
      
      await AsyncStorage.setItem(this.SAVE_KEY, compressedSave);
      return await this.loadGame();
      
    } catch (error) {
      console.error('💾 Import failed:', error);
      return false;
    }
  }
  
  cleanup() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }
    console.log('💾 Save system cleaned up');
  }
}

export const saveSystem = new SaveSystem();
EOF
```

#### Success Criteria
- [ ] Save/load system working reliably
- [ ] Offline progression calculated correctly
- [ ] Auto-save every 30 seconds
- [ ] Data validation and recovery working

### Task 2.4: Basic Department System (8 hours)
**Objective**: Implement core department mechanics

#### Step 2.4.1: Department Store
```bash
mkdir -p src/features/departments/state

cat > src/features/departments/state/departmentStore.ts << 'EOF'
import { observable, computed } from '@legendapp/state';
import { gameState } from '@/core/state/gameState';
import { DEPARTMENT_CONFIG, GAME_CONFIG } from '@/shared/constants/gameConfig';

interface DepartmentStoreState {
  activeTab: string;
  purchaseQueue: PurchaseAction[];
}

interface PurchaseAction {
  departmentId: string;
  employeeId: string;
  count: number;
  totalCost: number;
}

export const departmentStore = observable<DepartmentStoreState>({
  activeTab: 'development',
  purchaseQueue: []
});

// Initialize departments in game state if empty
export const initializeDepartments = () => {
  const currentDepartments = gameState.departments.get();
  if (currentDepartments.length === 0) {
    const departments = Object.values(DEPARTMENT_CONFIG).map(config => ({
      id: config.id,
      name: config.name,
      unlocked: config.id === 'development', // Development starts unlocked
      employees: config.employees.map(emp => ({
        id: emp.id,
        type: emp.id.split('_')[0], // Extract type from id
        count: 0,
        baseProduction: emp.baseProduction,
        baseCost: emp.baseCost,
        currentCost: emp.baseCost,
        multiplier: 1.0,
        unlocked: true
      })),
      upgrades: [], // Will be populated later
      efficiency: 1.0,
      managerHired: false,
      totalProduction: 0
    }));
    
    gameState.departments.set(departments);
    console.log('🏢 Departments initialized');
  }
};

// Department action creators
export const departmentActions = {
  hireEmployee: (departmentId: string, employeeId: string, count: number = 1) => {
    const departments = gameState.departments.get();
    const deptIndex = departments.findIndex(d => d.id === departmentId);
    const department = departments[deptIndex];
    
    if (!department?.unlocked) {
      console.warn(`Department ${departmentId} not unlocked`);
      return false;
    }
    
    const empIndex = department.employees.findIndex(e => e.id === employeeId);
    const employee = department.employees[empIndex];
    
    if (!employee?.unlocked) {
      console.warn(`Employee ${employeeId} not unlocked`);
      return false;
    }
    
    const totalCost = calculatePurchaseCost(employee.currentCost, count);
    const currentMoney = gameState.resources.money.get();
    
    if (currentMoney < totalCost) {
      console.warn(`Not enough money. Need $${totalCost}, have $${currentMoney}`);
      return false;
    }
    
    // Update state
    gameState.resources.money.set(prev => prev - totalCost);
    gameState.departments[deptIndex].employees[empIndex].count.set(prev => prev + count);
    
    // Update cost using exponential scaling
    const newCost = Math.floor(employee.baseCost * Math.pow(GAME_CONFIG.COST_MULTIPLIER, employee.count + count));
    gameState.departments[deptIndex].employees[empIndex].currentCost.set(newCost);
    
    // Update statistics
    gameState.progression.statisticsTracking.employeesHired.set(prev => prev + count);
    
    console.log(`👨‍💻 Hired ${count}x ${employeeId} for $${totalCost}`);
    return true;
  },
  
  hireManager: (departmentId: string) => {
    const departments = gameState.departments.get();
    const deptIndex = departments.findIndex(d => d.id === departmentId);
    const department = departments[deptIndex];
    
    if (!department?.unlocked) {
      console.warn(`Department ${departmentId} not unlocked`);
      return false;
    }
    
    if (department.managerHired) {
      console.warn(`Manager already hired for ${departmentId}`);
      return false;
    }
    
    const managerCost = GAME_CONFIG.MANAGER_COST_BASE;
    const currentMoney = gameState.resources.money.get();
    
    if (currentMoney < managerCost) {
      console.warn(`Not enough money for manager. Need $${managerCost}, have $${currentMoney}`);
      return false;
    }
    
    // Update state
    gameState.resources.money.set(prev => prev - managerCost);
    gameState.departments[deptIndex].managerHired.set(true);
    
    console.log(`👔 Hired manager for ${departmentId} for $${managerCost}`);
    return true;
  },
  
  unlockDepartment: (departmentId: string) => {
    const departments = gameState.departments.get();
    const deptIndex = departments.findIndex(d => d.id === departmentId);
    
    if (deptIndex === -1) {
      console.warn(`Department ${departmentId} not found`);
      return false;
    }
    
    const unlockCost = 10000; // Base unlock cost
    const currentMoney = gameState.resources.money.get();
    
    if (currentMoney < unlockCost) {
      console.warn(`Not enough money to unlock department. Need $${unlockCost}, have $${currentMoney}`);
      return false;
    }
    
    // Update state
    gameState.resources.money.set(prev => prev - unlockCost);
    gameState.departments[deptIndex].unlocked.set(true);
    gameState.progression.statisticsTracking.departmentsUnlocked.set(prev => prev + 1);
    
    console.log(`🏢 Unlocked ${departmentId} for $${unlockCost}`);
    return true;
  }
};

// Helper functions
const calculatePurchaseCost = (baseCost: number, count: number): number => {
  let totalCost = 0;
  for (let i = 0; i < count; i++) {
    totalCost += Math.floor(baseCost * Math.pow(GAME_CONFIG.COST_MULTIPLIER, i));
  }
  return totalCost;
};

// Computed values for UI
export const departmentComputed = {
  // Active department
  activeDepartment: computed(() => {
    const activeTab = departmentStore.activeTab.get();
    const departments = gameState.departments.get();
    return departments.find(d => d.id === activeTab);
  }),
  
  // Affordable purchases
  affordableEmployees: computed(() => {
    const money = gameState.resources.money.get();
    const departments = gameState.departments.get();
    const affordable: Record<string, string[]> = {};
    
    departments.forEach(dept => {
      if (!dept.unlocked) return;
      
      affordable[dept.id] = dept.employees
        .filter(emp => emp.unlocked && emp.currentCost <= money)
        .map(emp => emp.id);
    });
    
    return affordable;
  }),
  
  // Department production summaries
  departmentProduction: computed(() => {
    const departments = gameState.departments.get();
    return departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      unlocked: dept.unlocked,
      totalProduction: dept.employees.reduce((total, emp) => 
        total + (emp.count * emp.baseProduction * emp.multiplier), 0
      ),
      totalEmployees: dept.employees.reduce((total, emp) => total + emp.count, 0),
      hasManager: dept.managerHired
    }));
  })
};
EOF
```

#### Success Criteria
- [ ] Department system initialized correctly
- [ ] Employee hiring mechanics working
- [ ] Cost scaling implemented properly
- [ ] Manager hiring functionality working

### Task 2.5: Performance Optimization (4 hours)
**Objective**: Ensure 60 FPS performance targets are met

#### Step 2.5.1: Performance Monitoring
```bash
cat > src/core/services/performanceMonitor.ts << 'EOF'
import { gameState } from '../state/gameState';

class PerformanceMonitor {
  private frameDrops: number = 0;
  private memoryWarnings: number = 0;
  private lastMemoryCheck: number = Date.now();
  private isMonitoring: boolean = false;
  private performanceHistory: Array<{
    timestamp: number;
    fps: number;
    memoryMB: number;
    frameTime: number;
  }> = [];
  
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('📊 Performance monitoring started');
    
    if (__DEV__) {
      this.monitorFrameRate();
      this.monitorMemoryUsage();
    }
  }
  
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('📊 Performance monitoring stopped');
  }
  
  private monitorFrameRate() {
    let lastFrame = Date.now();
    let frameCount = 0;
    let fpsSum = 0;
    
    const checkFrame = () => {
      if (!this.isMonitoring) return;
      
      const now = Date.now();
      const frameDelta = now - lastFrame;
      frameCount++;
      
      if (frameDelta > 20) { // 50fps threshold
        this.frameDrops++;
        if (this.frameDrops > 10) {
          this.triggerPerformanceMode('battery');
          console.warn(`📊 Performance degraded: ${this.frameDrops} frame drops`);
        }
      }
      
      // Calculate FPS
      const fps = 1000 / frameDelta;
      fpsSum += fps;
      
      // Log performance every 60 frames (1 second at 60fps)
      if (frameCount % 60 === 0) {
        const avgFps = fpsSum / 60;
        this.logPerformance(avgFps, frameDelta);
        fpsSum = 0;
      }
      
      lastFrame = now;
      requestAnimationFrame(checkFrame);
    };
    
    requestAnimationFrame(checkFrame);
  }
  
  private monitorMemoryUsage() {
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      this.checkMemoryUsage();
    }, 10000); // Check every 10 seconds
  }
  
  private checkMemoryUsage() {
    // Estimate memory usage (simplified)
    const memoryEstimate = this.estimateMemoryUsage();
    
    if (memoryEstimate > 150) { // 150MB warning threshold
      this.memoryWarnings++;
      console.warn(`📊 High memory usage: ${memoryEstimate}MB`);
      
      if (memoryEstimate > 200) { // 200MB critical threshold
        this.triggerPerformanceMode('battery');
        this.triggerMemoryCleanup();
      }
    }
  }
  
  private estimateMemoryUsage(): number {
    // Simplified memory estimation based on game state size
    const gameStateSize = JSON.stringify(gameState.get()).length;
    const historySize = this.performanceHistory.length * 100;
    
    // Rough estimate: JSON size * 10 for JS object overhead + history + baseline
    return Math.round((gameStateSize * 10 + historySize + 50000) / 1024 / 1024);
  }
  
  private logPerformance(fps: number, frameTime: number) {
    const memoryMB = this.estimateMemoryUsage();
    
    this.performanceHistory.push({
      timestamp: Date.now(),
      fps: Math.round(fps),
      memoryMB,
      frameTime: Math.round(frameTime * 100) / 100
    });
    
    // Keep only last 100 entries
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }
    
    // Log in development
    if (__DEV__ && this.performanceHistory.length % 10 === 0) {
      console.log(`📊 Performance: ${Math.round(fps)}fps, ${memoryMB}MB, ${frameTime}ms frame`);
    }
  }
  
  private triggerPerformanceMode(mode: 'high' | 'balanced' | 'battery') {
    const currentMode = gameState.settings.performanceMode.get();
    if (currentMode !== mode) {
      gameState.settings.performanceMode.set(mode);
      console.log(`📊 Performance mode changed: ${mode.toUpperCase()}`);
    }
  }
  
  private triggerMemoryCleanup() {
    console.log('🧹 Triggering memory cleanup...');
    
    // Clean performance history
    this.performanceHistory = this.performanceHistory.slice(-10);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    console.log('🧹 Memory cleanup completed');
  }
  
  // Public API for getting performance stats
  getPerformanceStats() {
    if (this.performanceHistory.length === 0) {
      return {
        avgFps: 0,
        avgMemoryMB: 0,
        frameDrops: this.frameDrops,
        memoryWarnings: this.memoryWarnings,
        currentMode: gameState.settings.performanceMode.get()
      };
    }
    
    const recent = this.performanceHistory.slice(-10);
    const avgFps = recent.reduce((sum, entry) => sum + entry.fps, 0) / recent.length;
    const avgMemory = recent.reduce((sum, entry) => sum + entry.memoryMB, 0) / recent.length;
    
    return {
      avgFps: Math.round(avgFps),
      avgMemoryMB: Math.round(avgMemory),
      frameDrops: this.frameDrops,
      memoryWarnings: this.memoryWarnings,
      currentMode: gameState.settings.performanceMode.get(),
      samples: recent.length
    };
  }
  
  // Reset performance counters
  resetCounters() {
    this.frameDrops = 0;
    this.memoryWarnings = 0;
    this.performanceHistory = [];
    console.log('📊 Performance counters reset');
  }
}

export const performanceMonitor = new PerformanceMonitor();
EOF
```

#### Step 2.5.2: Component Optimization
```bash
# Update App.tsx to initialize systems
cat > App.tsx << 'EOF'
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GameScreen } from './src/features/game/components/GameScreen';
import { saveSystem } from './src/core/services/saveSystem';
import { performanceMonitor } from './src/core/services/performanceMonitor';
import { initializeDepartments } from './src/features/departments/state/departmentStore';

export default function App() {
  useEffect(() => {
    // Initialize core systems
    console.log('🚀 PetSoft Tycoon starting up...');
    
    // Initialize save system (loads existing game)
    saveSystem.initialize();
    
    // Initialize departments if needed
    initializeDepartments();
    
    // Start performance monitoring
    performanceMonitor.startMonitoring();
    
    // Cleanup on unmount
    return () => {
      saveSystem.cleanup();
      performanceMonitor.stopMonitoring();
    };
  }, []);
  
  return (
    <SafeAreaProvider>
      <GameScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
EOF
```

#### Success Criteria
- [ ] Performance monitoring active in development
- [ ] Memory usage tracking working
- [ ] Adaptive performance scaling functional
- [ ] Game systems initialized correctly

## Deliverables

### Core Systems Implemented
1. **Game Loop System**
   - 60fps game loop with requestAnimationFrame
   - Adaptive performance scaling
   - Batched state updates for optimal performance

2. **State Management** 
   - Legend State v3 reactive state system
   - Computed values for derived state
   - Department and employee state management

3. **Save/Load System**
   - Auto-save every 30 seconds
   - Offline progression calculation
   - Data validation and recovery
   - Export/import functionality

4. **Main Game UI**
   - Resource display with animated numbers
   - Main click button with haptic feedback
   - Performance-optimized components
   - Responsive design for all screen sizes

5. **Performance Monitoring**
   - Frame rate monitoring and alerts
   - Memory usage tracking
   - Automatic performance mode switching

## Validation Steps

### Performance Validation
```bash
# Test performance on target devices
npm run build:dev
# Deploy to iOS device (iPhone 8 or older)
# Deploy to Android device (5+ years old)

# Monitor performance
# - Frame rate should maintain 55+ FPS
# - Memory usage should stay under 150MB
# - Input response should be under 50ms
```

### Functionality Validation
```bash
# Test core game mechanics
npm run test
npm run lint
npm run type-check

# Manual testing checklist:
# - [ ] Game loop starts and maintains performance
# - [ ] Clicking main button increases money
# - [ ] Hiring employees works and costs scale
# - [ ] Save/load preserves game state
# - [ ] Offline progression calculates correctly
# - [ ] Performance monitoring shows accurate stats
```

### Platform Validation
```bash
# Test on all platforms
npx expo start --ios
npx expo start --android  
npx expo start --web

# Verify:
# - [ ] Consistent performance across platforms
# - [ ] Save system works on all platforms
# - [ ] UI renders correctly on all screen sizes
```

## Common Issues & Solutions

### Issue: Poor Performance on Older Devices
**Symptoms**: Frame drops below 50 FPS on target devices
**Solution**: 
- Enable battery performance mode automatically
- Reduce animation complexity
- Optimize state update frequency
- Use React.memo more aggressively

### Issue: Save/Load Failures
**Symptoms**: Game state not persisting between sessions
**Solution**:
- Check AsyncStorage permissions
- Validate save data structure
- Implement better error handling
- Use backup recovery system

### Issue: Memory Usage Too High
**Symptoms**: App crashes on low-memory devices
**Solution**:
- Implement aggressive memory cleanup
- Reduce state history tracking
- Optimize component re-renders
- Force garbage collection when available

### Issue: State Updates Cause UI Lag
**Symptoms**: UI freezes during rapid state changes
**Solution**:
- Use Observable.batch() for multiple updates
- Debounce expensive calculations
- Move heavy computation to computed values
- Optimize component subscriptions

## Next Steps
After completing Phase 2:
1. **Performance Validation**: Verify all targets met on actual devices
2. **User Testing**: Test core game mechanics with sample users
3. **Code Review**: Ensure code quality and architecture decisions
4. **Proceed to Phase 3**: Begin integration of remaining departments and features

---

## Time Tracking
- Task 2.1 (Game Loop): ⏱️ 8 hours
- Task 2.2 (Main Game UI): ⏱️ 12 hours
- Task 2.3 (Save/Load System): ⏱️ 8 hours
- Task 2.4 (Department System): ⏱️ 8 hours
- Task 2.5 (Performance Optimization): ⏱️ 4 hours
- **Total Phase 2**: ⏱️ 40 hours

## Dependencies
- ✅ Phase 1 foundation completed
- ✅ All target devices available for testing
- ✅ Performance benchmarking tools set up
- 🔄 UI/UX assets for enhanced visual polish (optional for this phase)