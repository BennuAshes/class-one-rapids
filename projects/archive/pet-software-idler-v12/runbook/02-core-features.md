# Phase 2: Core Features
## Core Game Loop and Basic Gameplay Implementation

**Estimated Time**: 5-7 days  
**Prerequisites**: Completed foundation phase with functional Legend State integration  
**Deliverables**: Core gameplay loop, manual mechanics, save/load system, basic progression

---

## Objectives

1. **Implement Core Game Loop**: Fixed timestep game loop with consistent updates
2. **Create Manual Gameplay**: Click-to-code and ship-feature mechanics
3. **Build Save/Load System**: Robust persistence with corruption recovery and offline progress
4. **Add Basic Progression**: Currency system, feature shipping, basic upgrade paths
5. **Establish Performance Baselines**: Maintain 60 FPS during gameplay with proper memory management

---

## Task Checklist

### Core Game Loop Implementation
- [ ] **Create Fixed Timestep Game Loop** (4 hours)
  ```bash
  # Create game loop component
  cat > src/core/game-loop/GameLoop.tsx << 'EOF'
  import React, { useEffect, useRef } from 'react';
  import { batch } from '@legendapp/state';
  import { useAnimationFrame } from 'react-native-reanimated';
  import { gameState$, gameActions } from '../state/gameStore';
  import { performanceMonitor } from '../analytics';
  import { BigNumber } from 'bignumber.js';
  
  const FIXED_TIMESTEP = 1000 / 60; // 60 FPS timestep (16.67ms)
  const MAX_FRAME_SKIP = 5; // Prevent spiral of death
  
  export function GameLoop({ children }: { children: React.ReactNode }) {
    const lastUpdateRef = useRef(0);
    const accumulatorRef = useRef(0);
    const isRunningRef = useRef(false);
  
    const updateGameLogic = (deltaTime: number) => {
      batch(() => {
        updateIdleProduction(deltaTime);
        updateDepartmentEfficiency(deltaTime);
        updateProgressiveValues(deltaTime);
        
        // Update last active time
        gameState$.player.lastActiveTime.set(Date.now());
      });
    };
  
    const updateIdleProduction = (deltaTime: number) => {
      const dev = gameState$.departments.development.peek();
      const currentLines = new BigNumber(gameState$.player.linesOfCode.peek());
      const currentCurrency = new BigNumber(gameState$.player.currency.peek());
      
      // Calculate production per second
      const linesPerSecond = dev.production.linesPerSecond * dev.production.efficiency;
      const currencyPerSecond = calculateCurrencyGeneration();
      
      // Apply delta time (convert to seconds)
      const deltaSeconds = deltaTime / 1000;
      const newLines = currentLines.plus(new BigNumber(linesPerSecond * deltaSeconds));
      const newCurrency = currentCurrency.plus(new BigNumber(currencyPerSecond * deltaSeconds));
      
      // Update state
      gameState$.player.linesOfCode.set(newLines.toString());
      gameState$.player.currency.set(newCurrency.toString());
    };
  
    const updateDepartmentEfficiency = (deltaTime: number) => {
      const dev = gameState$.departments.development.peek();
      
      // Apply upgrade bonuses
      let efficiency = 1;
      
      // Better IDE upgrade bonus
      if (dev.upgrades.betterIde > 0) {
        efficiency *= (1 + dev.upgrades.betterIde * 0.25); // 25% per level
      }
      
      // Pair programming bonus
      if (dev.upgrades.pairProgramming) {
        efficiency *= 1.5; // 50% efficiency boost
      }
      
      // Code reviews bonus
      if (dev.upgrades.codeReviews) {
        efficiency *= 1.3; // 30% efficiency boost
      }
      
      gameState$.departments.development.production.efficiency.set(efficiency);
    };
  
    const updateProgressiveValues = (deltaTime: number) => {
      // Update features based on lines of code
      const linesOfCode = new BigNumber(gameState$.player.linesOfCode.peek());
      const features = gameState$.player.features.peek();
      
      // Simple feature generation: every 100 lines = 1 basic feature
      const newBasicFeatures = Math.floor(linesOfCode.div(100).toNumber());
      if (newBasicFeatures > features.basic) {
        gameState$.player.features.basic.set(newBasicFeatures);
      }
      
      // Every 1000 lines = 1 advanced feature
      const newAdvancedFeatures = Math.floor(linesOfCode.div(1000).toNumber());
      if (newAdvancedFeatures > features.advanced) {
        gameState$.player.features.advanced.set(newAdvancedFeatures);
      }
      
      // Every 10000 lines = 1 premium feature
      const newPremiumFeatures = Math.floor(linesOfCode.div(10000).toNumber());
      if (newPremiumFeatures > features.premium) {
        gameState$.player.features.premium.set(newPremiumFeatures);
      }
    };
  
    const calculateCurrencyGeneration = (): number => {
      const features = gameState$.player.features.peek();
      
      // Currency generation from features
      let currencyPerSecond = 0;
      currencyPerSecond += features.basic * 1; // $1/sec per basic feature
      currencyPerSecond += features.advanced * 10; // $10/sec per advanced feature  
      currencyPerSecond += features.premium * 100; // $100/sec per premium feature
      
      return currencyPerSecond;
    };
  
    const gameLoop = () => {
      'worklet';
      
      if (!isRunningRef.current) return;
      
      const currentTime = performance.now();
      let deltaTime = currentTime - lastUpdateRef.current;
      lastUpdateRef.current = currentTime;
      
      // Prevent huge delta times (e.g., when app was backgrounded)
      if (deltaTime > 250) deltaTime = 250;
      
      accumulatorRef.current += deltaTime;
      
      let updates = 0;
      while (accumulatorRef.current >= FIXED_TIMESTEP && updates < MAX_FRAME_SKIP) {
        // Run game update on JS thread
        runOnJS(updateGameLogic)(FIXED_TIMESTEP);
        accumulatorRef.current -= FIXED_TIMESTEP;
        updates++;
      }
      
      // Performance monitoring
      runOnJS(performanceMonitor.recordFrame)(currentTime);
    };
  
    useEffect(() => {
      isRunningRef.current = true;
      lastUpdateRef.current = performance.now();
      performanceMonitor.start();
      
      return () => {
        isRunningRef.current = false;
        performanceMonitor.stop();
      };
    }, []);
  
    // Use Reanimated's useAnimationFrame for consistent timing
    useAnimationFrame(gameLoop, true);
  
    return <>{children}</>;
  }
  EOF
  ```

- [ ] **Create Performance Monitor Hook** (2 hours)
  ```bash
  # Create performance monitoring hook
  cat > src/shared/hooks/usePerformanceMonitor.ts << 'EOF'
  import { useEffect, useState } from 'react';
  import { performanceMonitor, PerformanceMetrics } from '../../core/analytics';
  
  export function usePerformanceMonitor(intervalMs: number = 1000) {
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [isRunning, setIsRunning] = useState(false);
  
    useEffect(() => {
      if (!isRunning) return;
  
      const interval = setInterval(() => {
        const latestMetrics = performanceMonitor.getLatestMetrics();
        setMetrics(latestMetrics);
      }, intervalMs);
  
      return () => clearInterval(interval);
    }, [isRunning, intervalMs]);
  
    const startMonitoring = () => {
      performanceMonitor.start();
      setIsRunning(true);
    };
  
    const stopMonitoring = () => {
      performanceMonitor.stop();
      setIsRunning(false);
    };
  
    const getAverageMetrics = (seconds?: number) => {
      return performanceMonitor.getAverageMetrics(seconds);
    };
  
    return {
      metrics,
      isRunning,
      startMonitoring,
      stopMonitoring,
      getAverageMetrics
    };
  }
  EOF
  ```

### Manual Gameplay Mechanics
- [ ] **Implement Enhanced Manual Actions** (3 hours)
  ```bash
  # Update gameStore with manual actions
  cat >> src/core/state/gameStore.ts << 'EOF'
  
  // Enhanced game actions
  export const enhancedGameActions = {
    ...gameActions,
    
    shipFeature: (featureType: 'basic' | 'advanced' | 'premium') => {
      const features = gameState$.player.features.peek();
      const currentCurrency = new BigNumber(gameState$.player.currency.peek());
      
      if (features[featureType] > 0) {
        const revenue = getFeatureRevenue(featureType);
        
        batch(() => {
          // Reduce feature count by 1
          gameState$.player.features[featureType].set(prev => prev - 1);
          
          // Add revenue
          const newCurrency = currentCurrency.plus(revenue);
          gameState$.player.currency.set(newCurrency.toString());
          
          // Update last active time
          gameState$.player.lastActiveTime.set(Date.now());
        });
      }
    },
    
    writeCodeBurst: (multiplier: number = 10) => {
      batch(() => {
        const currentLines = new BigNumber(gameState$.player.linesOfCode.peek());
        const newLines = currentLines.plus(multiplier);
        gameState$.player.linesOfCode.set(newLines.toString());
        gameState$.player.lastActiveTime.set(Date.now());
      });
    },
    
    purchaseUpgrade: (department: string, upgradeType: string, level?: number) => {
      const cost = getUpgradeCost(department, upgradeType, level);
      const currentCurrency = new BigNumber(gameState$.player.currency.peek());
      
      if (currentCurrency.gte(cost)) {
        batch(() => {
          gameState$.player.currency.set(currentCurrency.minus(cost).toString());
          
          // Apply upgrade based on type
          if (department === 'development') {
            const dev = gameState$.departments.development.peek();
            
            if (upgradeType === 'betterIde') {
              gameState$.departments.development.upgrades.betterIde.set(
                Math.min(dev.upgrades.betterIde + 1, 3)
              );
            } else if (upgradeType === 'pairProgramming') {
              gameState$.departments.development.upgrades.pairProgramming.set(true);
            } else if (upgradeType === 'codeReviews') {
              gameState$.departments.development.upgrades.codeReviews.set(true);
            }
          }
        });
      }
    }
  };
  
  function getFeatureRevenue(featureType: 'basic' | 'advanced' | 'premium'): BigNumber {
    const baseRevenues = {
      basic: 100,
      advanced: 1000,
      premium: 10000
    };
    
    return new BigNumber(baseRevenues[featureType]);
  }
  
  function getUpgradeCost(department: string, upgradeType: string, level?: number): BigNumber {
    const baseCosts: Record<string, Record<string, number>> = {
      development: {
        betterIde: 5000,
        pairProgramming: 25000,
        codeReviews: 50000
      }
    };
    
    const baseCost = baseCosts[department]?.[upgradeType] || 1000;
    const multiplier = level ? Math.pow(2, level - 1) : 1;
    
    return new BigNumber(baseCost * multiplier);
  }
  EOF
  ```

- [ ] **Create Interactive UI Components** (4 hours)
  ```bash
  # Create base button component
  cat > src/shared/components/ui/BaseButton.tsx << 'EOF'
  import React from 'react';
  import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
  import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
  
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  
  interface BaseButtonProps {
    title: string;
    subtitle?: string;
    onPress: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'success' | 'warning';
    style?: ViewStyle;
  }
  
  export function BaseButton({ 
    title, 
    subtitle, 
    onPress, 
    disabled = false, 
    variant = 'primary',
    style 
  }: BaseButtonProps) {
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }]
    }));
    
    const handlePress = () => {
      if (disabled) return;
      
      scale.value = withSpring(0.95, { duration: 100 }, () => {
        scale.value = withSpring(1, { duration: 200 });
      });
      
      onPress();
    };
    
    return (
      <AnimatedPressable
        style={[
          styles.button,
          styles[variant],
          disabled && styles.disabled,
          animatedStyle,
          style
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <Text style={[styles.title, disabled && styles.disabledText]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, disabled && styles.disabledText]}>
            {subtitle}
          </Text>
        )}
      </AnimatedPressable>
    );
  }
  
  const styles = StyleSheet.create({
    button: {
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
      minHeight: 60
    },
    primary: {
      backgroundColor: '#007AFF'
    },
    secondary: {
      backgroundColor: '#5856D6'
    },
    success: {
      backgroundColor: '#34C759'
    },
    warning: {
      backgroundColor: '#FF9500'
    },
    disabled: {
      backgroundColor: '#3A3A3C',
      opacity: 0.6
    },
    title: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold'
    },
    subtitle: {
      color: '#ffffff',
      fontSize: 14,
      opacity: 0.8,
      marginTop: 4
    },
    disabledText: {
      color: '#8E8E93'
    }
  });
  EOF
  
  # Create currency display component
  cat > src/shared/components/game/CurrencyDisplay.tsx << 'EOF'
  import React from 'react';
  import { View, Text, StyleSheet } from 'react-native';
  import { use$, observer } from '@legendapp/state/react';
  import { BigNumber } from 'bignumber.js';
  import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
  
  interface CurrencyDisplayProps {
    value: string | number;
    label: string;
    prefix?: string;
    suffix?: string;
    animated?: boolean;
  }
  
  export const CurrencyDisplay = observer(({ 
    value, 
    label, 
    prefix = '', 
    suffix = '',
    animated = true 
  }: CurrencyDisplayProps) => {
    const scale = useSharedValue(1);
    
    const formatValue = (val: string | number) => {
      const bn = new BigNumber(val);
      if (bn.lt(1000)) return bn.toFixed(0);
      if (bn.lt(1000000)) return bn.div(1000).toFixed(1) + 'K';
      if (bn.lt(1000000000)) return bn.div(1000000).toFixed(2) + 'M';
      if (bn.lt(1000000000000)) return bn.div(1000000000).toFixed(2) + 'B';
      return bn.div(1000000000000).toFixed(2) + 'T';
    };
    
    // Animate when value changes
    React.useEffect(() => {
      if (animated) {
        scale.value = withSpring(1.1, { duration: 200 }, () => {
          scale.value = withSpring(1, { duration: 300 });
        });
      }
    }, [value, animated]);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }]
    }));
    
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Animated.View style={animatedStyle}>
          <Text style={styles.value}>
            {prefix}{formatValue(value)}{suffix}
          </Text>
        </Animated.View>
      </View>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#1a1a1a',
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#333333',
      minWidth: 120
    },
    label: {
      color: '#8E8E93',
      fontSize: 14,
      marginBottom: 4
    },
    value: {
      color: '#ffffff',
      fontSize: 20,
      fontWeight: 'bold'
    }
  });
  EOF
  ```

### Save/Load System Implementation
- [ ] **Create Advanced Save System** (4 hours)
  ```bash
  # Create comprehensive save system
  cat > src/core/save-system/SaveSystem.ts << 'EOF'
  import { gameState$ } from '../state/gameStore';
  import { observe, when } from '@legendapp/state';
  import { MMKV } from 'react-native-mmkv';
  import { BigNumber } from 'bignumber.js';
  
  export interface SaveMetadata {
    version: string;
    saveTime: number;
    platform: string;
    playTime: number;
    checksum: string;
  }
  
  export interface GameSaveData {
    gameState: any;
    metadata: SaveMetadata;
  }
  
  export class SaveSystem {
    private storage: MMKV;
    private autoSaveInterval: NodeJS.Timeout | null = null;
    private pendingSave = false;
    private readonly SAVE_KEY = 'petsoft-tycoon-save';
    private readonly BACKUP_PREFIX = 'petsoft-backup-';
    private readonly MAX_BACKUPS = 5;
  
    constructor() {
      this.storage = new MMKV({
        id: 'petsoft-tycoon',
        encryptionKey: 'petsoft-encryption-key'
      });
      
      this.initializeAutoSave();
    }
  
    private initializeAutoSave() {
      // Auto-save every 30 seconds
      this.autoSaveInterval = setInterval(() => {
        this.performSave();
      }, 30000);
  
      // Save on significant game events
      observe(gameState$.player.currency, (currency) => {
        const value = new BigNumber(currency.get());
        // Save every time currency increases by 10000 or more
        if (value.mod(10000).eq(0)) {
          this.scheduleSave();
        }
      });
  
      // Save when employees are hired
      observe(gameState$.departments.development.employees, () => {
        this.scheduleSave();
      });
  
      // Save when upgrades are purchased
      observe(gameState$.departments.development.upgrades, () => {
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
  
    async performSave(): Promise<boolean> {
      try {
        const currentState = gameState$.peek();
        const saveData: GameSaveData = {
          gameState: currentState,
          metadata: {
            version: '1.0.0',
            saveTime: Date.now(),
            platform: 'mobile',
            playTime: Date.now() - currentState.player.startTime,
            checksum: this.generateChecksum(currentState)
          }
        };
  
        // Create backups before saving
        this.rotateBackups();
        
        // Save to primary location
        this.storage.set(this.SAVE_KEY, JSON.stringify(saveData));
        
        // Save to backup location
        this.storage.set(
          `${this.BACKUP_PREFIX}${Date.now()}`, 
          JSON.stringify(saveData)
        );
  
        __DEV__ && console.log('Game saved successfully');
        return true;
      } catch (error) {
        console.error('Save failed:', error);
        return false;
      }
    }
  
    async loadSave(): Promise<boolean> {
      try {
        // Try primary save first
        const saveDataStr = this.storage.getString(this.SAVE_KEY);
        
        if (saveDataStr) {
          const saveData: GameSaveData = JSON.parse(saveDataStr);
          
          // Validate save integrity
          if (this.validateSave(saveData)) {
            this.applySave(saveData.gameState);
            this.calculateOfflineProgress();
            return true;
          }
        }
        
        // Try backups if primary save is corrupted
        return this.loadFromBackup();
      } catch (error) {
        console.error('Load failed:', error);
        return this.loadFromBackup();
      }
    }
  
    private async loadFromBackup(): Promise<boolean> {
      const backupKeys = this.storage.getAllKeys()
        .filter(key => key.startsWith(this.BACKUP_PREFIX))
        .sort()
        .reverse(); // Most recent first
  
      for (const backupKey of backupKeys) {
        try {
          const backupDataStr = this.storage.getString(backupKey);
          if (backupDataStr) {
            const backupData: GameSaveData = JSON.parse(backupDataStr);
            
            if (this.validateSave(backupData)) {
              console.log('Loaded from backup:', backupKey);
              this.applySave(backupData.gameState);
              this.calculateOfflineProgress();
              return true;
            }
          }
        } catch (error) {
          console.warn('Backup load failed:', backupKey, error);
        }
      }
      
      console.log('No valid saves found, starting fresh');
      return false;
    }
  
    private validateSave(saveData: GameSaveData): boolean {
      try {
        // Basic structure validation
        if (!saveData.gameState || !saveData.metadata) return false;
        
        // Checksum validation
        const expectedChecksum = this.generateChecksum(saveData.gameState);
        if (expectedChecksum !== saveData.metadata.checksum) {
          console.warn('Save checksum mismatch');
          return false;
        }
        
        // Version compatibility check
        if (saveData.metadata.version !== '1.0.0') {
          console.warn('Save version incompatible');
          return false;
        }
        
        // Required fields validation
        const required = ['player', 'departments', 'progression', 'ui'];
        for (const field of required) {
          if (!saveData.gameState[field]) return false;
        }
        
        return true;
      } catch (error) {
        console.error('Save validation failed:', error);
        return false;
      }
    }
  
    private applySave(saveState: any) {
      gameState$.set(saveState);
    }
  
    private calculateOfflineProgress() {
      const now = Date.now();
      const lastActive = gameState$.player.lastActiveTime.peek();
      const offlineTime = Math.min(now - lastActive, 12 * 60 * 60 * 1000); // 12h cap
  
      if (offlineTime > 60000) { // More than 1 minute
        const offlineGains = this.calculateIdleProduction(offlineTime);
        
        batch(() => {
          const currentCurrency = new BigNumber(gameState$.player.currency.peek());
          const currentLines = new BigNumber(gameState$.player.linesOfCode.peek());
          
          gameState$.player.currency.set(
            currentCurrency.plus(offlineGains.currency).toString()
          );
          gameState$.player.linesOfCode.set(
            currentLines.plus(offlineGains.linesOfCode).toString()
          );
          gameState$.player.lastActiveTime.set(now);
          gameState$.ui.showOfflineProgress.set(true);
        });
        
        // Store offline gains for display
        this.storage.set('offline-gains', JSON.stringify(offlineGains));
      }
    }
  
    private calculateIdleProduction(offlineTimeMs: number): {
      currency: string;
      linesOfCode: string;
      timeAway: number;
    } {
      const offlineSeconds = offlineTimeMs / 1000;
      const dev = gameState$.departments.development.peek();
      const features = gameState$.player.features.peek();
      
      // Calculate production rates
      const linesPerSecond = dev.production.linesPerSecond * dev.production.efficiency;
      const currencyPerSecond = 
        features.basic * 1 + 
        features.advanced * 10 + 
        features.premium * 100;
      
      // Apply offline multiplier (reduced efficiency when offline)
      const offlineMultiplier = 0.5;
      
      return {
        currency: new BigNumber(currencyPerSecond * offlineSeconds * offlineMultiplier).toString(),
        linesOfCode: new BigNumber(linesPerSecond * offlineSeconds * offlineMultiplier).toString(),
        timeAway: offlineTimeMs
      };
    }
  
    private generateChecksum(gameState: any): string {
      // Simple checksum based on key values
      const key = `${gameState.player.currency}_${gameState.player.linesOfCode}_${gameState.player.startTime}`;
      return btoa(key).slice(0, 16);
    }
  
    private rotateBackups() {
      const backupKeys = this.storage.getAllKeys()
        .filter(key => key.startsWith(this.BACKUP_PREFIX))
        .sort();
      
      // Remove oldest backups if we exceed the limit
      while (backupKeys.length >= this.MAX_BACKUPS) {
        const oldestKey = backupKeys.shift();
        if (oldestKey) {
          this.storage.delete(oldestKey);
        }
      }
    }
  
    getOfflineGains(): any {
      const gainsStr = this.storage.getString('offline-gains');
      if (gainsStr) {
        this.storage.delete('offline-gains');
        return JSON.parse(gainsStr);
      }
      return null;
    }
  
    exportSave(): string {
      const saveDataStr = this.storage.getString(this.SAVE_KEY);
      return saveDataStr || '';
    }
  
    importSave(saveDataStr: string): boolean {
      try {
        const saveData: GameSaveData = JSON.parse(saveDataStr);
        if (this.validateSave(saveData)) {
          this.applySave(saveData.gameState);
          this.performSave(); // Save the imported data
          return true;
        }
        return false;
      } catch (error) {
        console.error('Import failed:', error);
        return false;
      }
    }
  
    clearSave() {
      this.storage.clearAll();
    }
  
    destroy() {
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
      }
    }
  }
  
  // Export singleton instance
  export const saveSystem = new SaveSystem();
  EOF
  ```

### BigNumber Integration
- [ ] **Create BigNumber Utilities** (2 hours)
  ```bash
  # Create BigNumber utility functions
  cat > src/shared/utils/BigNumber.ts << 'EOF'
  import { BigNumber } from 'bignumber.js';
  
  // Configure BigNumber for game usage
  BigNumber.config({
    DECIMAL_PLACES: 2,
    ROUNDING_MODE: BigNumber.ROUND_DOWN,
    EXPONENTIAL_AT: [-9, 20],
    RANGE: [-1e+9, 1e+9],
    CRYPTO: false,
    MODULO_MODE: BigNumber.ROUND_DOWN,
    POW_PRECISION: 0,
    FORMAT: {
      prefix: '',
      decimalSeparator: '.',
      groupSeparator: ',',
      groupSize: 3,
      secondaryGroupSize: 0,
      fractionGroupSeparator: ' ',
      fractionGroupSize: 0,
      suffix: ''
    }
  });
  
  export class GameMath {
    // Create BigNumber from various inputs
    static currency(value: string | number | BigNumber): BigNumber {
      return new BigNumber(value || 0);
    }
  
    // Format currency for display
    static formatCurrency(value: string | number | BigNumber): string {
      const bn = this.currency(value);
      
      if (bn.isNaN() || !bn.isFinite()) return '0';
      
      if (bn.lt(1000)) return bn.toFixed(0);
      if (bn.lt(1000000)) return bn.div(1000).toFixed(1) + 'K';
      if (bn.lt(1000000000)) return bn.div(1000000).toFixed(2) + 'M';
      if (bn.lt(1000000000000)) return bn.div(1000000000).toFixed(2) + 'B';
      if (bn.lt(1000000000000000)) return bn.div(1000000000000).toFixed(2) + 'T';
      if (bn.lt(1000000000000000000)) return bn.div(1000000000000000).toFixed(2) + 'Qa';
      if (bn.lt(new BigNumber('1e21'))) return bn.div(new BigNumber('1e18')).toFixed(2) + 'Qi';
      
      // Scientific notation for extremely large numbers
      return bn.toExponential(2);
    }
  
    // Format numbers without currency symbol
    static formatNumber(value: string | number | BigNumber): string {
      return this.formatCurrency(value);
    }
  
    // Safe arithmetic operations
    static add(a: string | number | BigNumber, b: string | number | BigNumber): BigNumber {
      return this.currency(a).plus(this.currency(b));
    }
  
    static subtract(a: string | number | BigNumber, b: string | number | BigNumber): BigNumber {
      return this.currency(a).minus(this.currency(b));
    }
  
    static multiply(a: string | number | BigNumber, b: string | number | BigNumber): BigNumber {
      const result = this.currency(a).multipliedBy(this.currency(b));
      if (result.isNaN() || !result.isFinite()) {
        throw new Error('Calculation overflow detected');
      }
      return result;
    }
  
    static divide(a: string | number | BigNumber, b: string | number | BigNumber): BigNumber {
      const divisor = this.currency(b);
      if (divisor.eq(0)) {
        throw new Error('Division by zero');
      }
      return this.currency(a).div(divisor);
    }
  
    // Comparison operations
    static greaterThan(a: string | number | BigNumber, b: string | number | BigNumber): boolean {
      return this.currency(a).gt(this.currency(b));
    }
  
    static greaterThanOrEqual(a: string | number | BigNumber, b: string | number | BigNumber): boolean {
      return this.currency(a).gte(this.currency(b));
    }
  
    static lessThan(a: string | number | BigNumber, b: string | number | BigNumber): boolean {
      return this.currency(a).lt(this.currency(b));
    }
  
    static lessThanOrEqual(a: string | number | BigNumber, b: string | number | BigNumber): boolean {
      return this.currency(a).lte(this.currency(b));
    }
  
    static equal(a: string | number | BigNumber, b: string | number | BigNumber): boolean {
      return this.currency(a).eq(this.currency(b));
    }
  
    // Game-specific calculations
    static calculateUpgradeCost(baseCost: number, currentLevel: number, multiplier: number = 1.15): BigNumber {
      return this.currency(baseCost).multipliedBy(new BigNumber(multiplier).pow(currentLevel));
    }
  
    static calculatePrestigePoints(companyValuation: string | number | BigNumber): BigNumber {
      const valuation = this.currency(companyValuation);
      const minValuation = this.currency(10000000); // $10M minimum
      
      if (valuation.lt(minValuation)) {
        return this.currency(0);
      }
      
      // Formula: sqrt(valuation / 1M) for prestige points
      return valuation.div(1000000).sqrt().integerValue(BigNumber.ROUND_DOWN);
    }
  
    // Validation helpers
    static isValid(value: any): boolean {
      try {
        const bn = this.currency(value);
        return !bn.isNaN() && bn.isFinite();
      } catch {
        return false;
      }
    }
  
    static max(...values: Array<string | number | BigNumber>): BigNumber {
      return BigNumber.maximum(...values.map(v => this.currency(v)));
    }
  
    static min(...values: Array<string | number | BigNumber>): BigNumber {
      return BigNumber.minimum(...values.map(v => this.currency(v)));
    }
  
    // Performance optimized peek function for reactive contexts
    static peek(observable: any): BigNumber {
      return this.currency(observable.peek());
    }
  }
  EOF
  ```

### Enhanced Dashboard Implementation
- [ ] **Update Dashboard with Core Features** (3 hours)
  ```bash
  # Update dashboard with enhanced functionality
  cat > src/features/dashboard/DashboardScreen.tsx << 'EOF'
  import React, { useEffect } from 'react';
  import { View, ScrollView, StyleSheet } from 'react-native';
  import { use$, observer } from '@legendapp/state/react';
  import { gameState$, enhancedGameActions, totalValuation$, currentRevenue$ } from '../../core/state/gameStore';
  import { CurrencyDisplay } from '../../shared/components/game/CurrencyDisplay';
  import { BaseButton } from '../../shared/components/ui/BaseButton';
  import { GameMath } from '../../shared/utils/BigNumber';
  import { saveSystem } from '../../core/save-system/SaveSystem';
  import { usePerformanceMonitor } from '../../shared/hooks/usePerformanceMonitor';
  
  const DashboardScreen = observer(() => {
    const player = use$(gameState$.player);
    const features = use$(gameState$.player.features);
    const totalValuation = use$(totalValuation$);
    const currentRevenue = use$(currentRevenue$);
    const { metrics, startMonitoring } = usePerformanceMonitor();
  
    useEffect(() => {
      // Load save on component mount
      saveSystem.loadSave();
      startMonitoring();
    }, []);
  
    const canShipFeature = (type: 'basic' | 'advanced' | 'premium') => {
      return features[type] > 0;
    };
  
    const getFeatureRevenue = (type: 'basic' | 'advanced' | 'premium') => {
      const revenues = { basic: 100, advanced: 1000, premium: 10000 };
      return revenues[type];
    };
  
    return (
      <ScrollView style={styles.container}>
        {/* Performance Display (Dev Mode) */}
        {__DEV__ && metrics && (
          <View style={styles.debugContainer}>
            <CurrencyDisplay 
              value={metrics.fps} 
              label="FPS" 
              animated={false}
            />
            <CurrencyDisplay 
              value={metrics.memoryUsage.toFixed(1)} 
              label="Memory" 
              suffix=" MB"
              animated={false}
            />
          </View>
        )}
        
        {/* Main Stats */}
        <View style={styles.statsGrid}>
          <CurrencyDisplay 
            value={player.currency} 
            label="Currency"
            prefix="$"
          />
          <CurrencyDisplay 
            value={player.linesOfCode} 
            label="Lines of Code"
          />
          <CurrencyDisplay 
            value={totalValuation} 
            label="Company Value"
            prefix="$"
          />
          <CurrencyDisplay 
            value={currentRevenue} 
            label="Revenue/sec"
            prefix="$"
          />
        </View>
        
        {/* Features Display */}
        <View style={styles.featuresContainer}>
          <View style={styles.featuresGrid}>
            <CurrencyDisplay 
              value={features.basic} 
              label="Basic Features"
            />
            <CurrencyDisplay 
              value={features.advanced} 
              label="Advanced Features"
            />
            <CurrencyDisplay 
              value={features.premium} 
              label="Premium Features"
            />
          </View>
        </View>
        
        {/* Manual Actions */}
        <View style={styles.actionsContainer}>
          <BaseButton
            title="Write Code"
            subtitle="+1 line of code"
            onPress={enhancedGameActions.writeCode}
            variant="primary"
            style={styles.actionButton}
          />
          
          <BaseButton
            title="Code Sprint"
            subtitle="+10 lines of code"
            onPress={() => enhancedGameActions.writeCodeBurst(10)}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
        
        {/* Feature Shipping */}
        <View style={styles.shippingContainer}>
          <BaseButton
            title="Ship Basic Feature"
            subtitle={`+$${GameMath.formatCurrency(getFeatureRevenue('basic'))} (${features.basic} available)`}
            onPress={() => enhancedGameActions.shipFeature('basic')}
            disabled={!canShipFeature('basic')}
            variant="success"
            style={styles.shipButton}
          />
          
          <BaseButton
            title="Ship Advanced Feature"
            subtitle={`+$${GameMath.formatCurrency(getFeatureRevenue('advanced'))} (${features.advanced} available)`}
            onPress={() => enhancedGameActions.shipFeature('advanced')}
            disabled={!canShipFeature('advanced')}
            variant="success"
            style={styles.shipButton}
          />
          
          <BaseButton
            title="Ship Premium Feature"
            subtitle={`+$${GameMath.formatCurrency(getFeatureRevenue('premium'))} (${features.premium} available)`}
            onPress={() => enhancedGameActions.shipFeature('premium')}
            disabled={!canShipFeature('premium')}
            variant="warning"
            style={styles.shipButton}
          />
        </View>
        
        {/* Save Controls */}
        <View style={styles.saveContainer}>
          <BaseButton
            title="Save Game"
            subtitle="Force save progress"
            onPress={() => saveSystem.performSave()}
            variant="secondary"
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0a0a0a',
      padding: 16
    },
    debugContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
      opacity: 0.7
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 24
    },
    featuresContainer: {
      marginBottom: 24
    },
    featuresGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8
    },
    actionsContainer: {
      gap: 12,
      marginBottom: 24
    },
    actionButton: {
      minHeight: 70
    },
    shippingContainer: {
      gap: 8,
      marginBottom: 24
    },
    shipButton: {
      minHeight: 60
    },
    saveContainer: {
      marginBottom: 24
    },
    saveButton: {
      minHeight: 50
    }
  });
  
  export default DashboardScreen;
  EOF
  ```

### Testing Implementation
- [ ] **Create Core Feature Tests** (3 hours)
  ```bash
  # Create comprehensive tests for core features
  cat > src/core/state/__tests__/gameActions.test.ts << 'EOF'
  import { gameState$, enhancedGameActions } from '../gameStore';
  import { GameMath } from '../../../shared/utils/BigNumber';
  
  describe('Core Game Actions', () => {
    beforeEach(() => {
      // Reset to initial state before each test
      gameState$.set({
        player: {
          currency: '0',
          linesOfCode: '0',
          features: { basic: 0, advanced: 0, premium: 0 },
          startTime: Date.now(),
          lastActiveTime: Date.now()
        },
        departments: {
          development: {
            employees: { junior: 0, mid: 0, senior: 0, techLead: 0 },
            upgrades: { betterIde: 0, pairProgramming: false, codeReviews: false },
            production: { linesPerSecond: 0, efficiency: 1 }
          }
        },
        progression: {
          investorPoints: '0',
          prestigeCount: 0,
          lastPrestigeTime: 0,
          achievements: []
        },
        ui: {
          activeScreen: 'dashboard',
          showOfflineProgress: false,
          lastSaveTime: Date.now()
        }
      });
    });
  
    test('writeCode increases lines of code', () => {
      const initialLines = gameState$.player.linesOfCode.peek();
      enhancedGameActions.writeCode();
      const newLines = gameState$.player.linesOfCode.peek();
      
      expect(GameMath.subtract(newLines, initialLines).eq(1)).toBe(true);
    });
  
    test('writeCodeBurst increases lines by multiplier', () => {
      const initialLines = gameState$.player.linesOfCode.peek();
      enhancedGameActions.writeCodeBurst(10);
      const newLines = gameState$.player.linesOfCode.peek();
      
      expect(GameMath.subtract(newLines, initialLines).eq(10)).toBe(true);
    });
  
    test('shipFeature reduces feature count and increases currency', () => {
      // Set up initial state with features
      gameState$.player.features.basic.set(5);
      gameState$.player.currency.set('1000');
      
      const initialFeatures = gameState$.player.features.basic.peek();
      const initialCurrency = gameState$.player.currency.peek();
      
      enhancedGameActions.shipFeature('basic');
      
      const newFeatures = gameState$.player.features.basic.peek();
      const newCurrency = gameState$.player.currency.peek();
      
      expect(newFeatures).toBe(initialFeatures - 1);
      expect(GameMath.subtract(newCurrency, initialCurrency).eq(100)).toBe(true);
    });
  
    test('cannot ship feature when none available', () => {
      gameState$.player.features.basic.set(0);
      gameState$.player.currency.set('1000');
      
      const initialCurrency = gameState$.player.currency.peek();
      enhancedGameActions.shipFeature('basic');
      const newCurrency = gameState$.player.currency.peek();
      
      expect(newCurrency).toBe(initialCurrency);
    });
  
    test('hireDeveloper increases employee count and decreases currency', () => {
      gameState$.player.currency.set('1000');
      
      const initialJuniors = gameState$.departments.development.employees.junior.peek();
      const initialCurrency = gameState$.player.currency.peek();
      
      enhancedGameActions.hireDeveloper('junior');
      
      const newJuniors = gameState$.departments.development.employees.junior.peek();
      const newCurrency = gameState$.player.currency.peek();
      
      expect(newJuniors).toBe(initialJuniors + 1);
      expect(GameMath.lessThan(newCurrency, initialCurrency)).toBe(true);
    });
  });
  EOF
  
  # Create BigNumber utility tests
  cat > src/shared/utils/__tests__/BigNumber.test.ts << 'EOF'
  import { GameMath } from '../BigNumber';
  import { BigNumber } from 'bignumber.js';
  
  describe('GameMath Utilities', () => {
    test('formatCurrency handles various number sizes', () => {
      expect(GameMath.formatCurrency(0)).toBe('0');
      expect(GameMath.formatCurrency(999)).toBe('999');
      expect(GameMath.formatCurrency(1000)).toBe('1.0K');
      expect(GameMath.formatCurrency(1500)).toBe('1.5K');
      expect(GameMath.formatCurrency(1000000)).toBe('1.00M');
      expect(GameMath.formatCurrency(1000000000)).toBe('1.00B');
    });
  
    test('arithmetic operations work correctly', () => {
      const result = GameMath.add('100.5', '200.3');
      expect(result.eq(300.8)).toBe(true);
      
      const multiplication = GameMath.multiply('10', '5.5');
      expect(multiplication.eq(55)).toBe(true);
    });
  
    test('comparison operations work correctly', () => {
      expect(GameMath.greaterThan('100', '50')).toBe(true);
      expect(GameMath.lessThan('25', '30')).toBe(true);
      expect(GameMath.equal('100', '100')).toBe(true);
    });
  
    test('calculateUpgradeCost scales properly', () => {
      const cost0 = GameMath.calculateUpgradeCost(100, 0);
      const cost1 = GameMath.calculateUpgradeCost(100, 1);
      const cost2 = GameMath.calculateUpgradeCost(100, 2);
      
      expect(cost0.eq(100)).toBe(true);
      expect(cost1.eq(115)).toBe(true);
      expect(cost2.toFixed(2)).toBe('132.25');
    });
  
    test('handles invalid inputs gracefully', () => {
      expect(GameMath.isValid('invalid')).toBe(false);
      expect(GameMath.isValid(NaN)).toBe(false);
      expect(GameMath.isValid('100')).toBe(true);
      
      expect(() => GameMath.divide(100, 0)).toThrow('Division by zero');
    });
  });
  EOF
  
  # Run tests
  npm test -- src/core/state/__tests__/gameActions.test.ts
  npm test -- src/shared/utils/__tests__/BigNumber.test.ts
  ```

---

## Quality Gates & Validation

### Functional Validation
- [ ] **Core Gameplay Loop Testing**
  ```bash
  # Test basic gameplay flow
  echo "Testing core gameplay mechanics..."
  
  # Test 1: Manual clicking works
  # Test 2: Feature generation occurs
  # Test 3: Currency accumulation works
  # Test 4: Save/load preserves state
  # Test 5: Offline progress calculated correctly
  
  echo "Manual validation required - run app and verify:"
  echo "1. Click 'Write Code' increases lines"
  echo "2. Lines generate features automatically"
  echo "3. Features can be shipped for currency"
  echo "4. Save/load maintains progress"
  echo "5. Background app returns with offline gains"
  ```

### Performance Validation
- [ ] **Verify 60 FPS Target**
  - Run app for 10 minutes continuous gameplay
  - Monitor performance metrics display
  - Verify no frame drops during interactions
  - Check memory usage stays under 75MB

- [ ] **Memory Leak Detection**
  ```bash
  # Create memory leak test script
  cat > scripts/memory-leak-test.js << 'EOF'
  // Manual test procedure for memory leaks
  console.log('Memory Leak Test Procedure:');
  console.log('1. Start app and note initial memory usage');
  console.log('2. Play for 30 minutes continuously');
  console.log('3. Monitor memory usage every 5 minutes');
  console.log('4. Memory should not continuously increase');
  console.log('5. Check for memory cleanup during app backgrounding');
  
  // Automated memory monitoring could be added here
  EOF
  
  node scripts/memory-leak-test.js
  ```

### Save System Validation
- [ ] **Test Save/Load Reliability**
  ```bash
  # Create save system test
  echo "Testing save system reliability..."
  
  # Test cases:
  # 1. Normal save/load cycle
  # 2. Corrupted save recovery
  # 3. Import/export functionality
  # 4. Offline progress calculation
  # 5. Backup rotation system
  
  echo "Manual validation steps:"
  echo "1. Play game, force save, close app, reopen - progress preserved"
  echo "2. Manually corrupt save file - backup recovery works"
  echo "3. Background app for 5+ minutes - offline gains appear"
  ```

---

## Deliverables

### Required Outputs
1. **Functional Core Game Loop** with fixed timestep updates
2. **Manual Gameplay Mechanics** (write code, ship features, hire developers)
3. **Save/Load System** with corruption recovery and offline progress
4. **Enhanced UI Components** with animations and responsive feedback
5. **Performance Monitoring** integrated and displaying real-time metrics
6. **BigNumber Integration** handling large currency values correctly

### Documentation Updates
- [ ] **Update Technical Architecture**
  - Document actual game loop implementation
  - Record performance optimization decisions
  - Note any deviations from planned architecture

### Validation Checklist
- [ ] Core game loop maintains consistent 60 FPS
- [ ] Manual actions provide immediate feedback
- [ ] Features generate automatically based on lines of code
- [ ] Currency system works with large numbers
- [ ] Save/load preserves all game state correctly
- [ ] Offline progress calculated and displayed
- [ ] Memory usage remains stable during extended play
- [ ] All tests passing with good coverage
- [ ] Performance monitoring shows healthy metrics

---

**Time Tracking**: Record actual time vs estimates
- [ ] Game loop implementation: __ hours (est: 4)
- [ ] Manual gameplay mechanics: __ hours (est: 3)
- [ ] Save/load system: __ hours (est: 4)
- [ ] UI components: __ hours (est: 4)
- [ ] BigNumber integration: __ hours (est: 2)
- [ ] Dashboard enhancement: __ hours (est: 3)
- [ ] Testing: __ hours (est: 3)
- [ ] **Total Phase 2**: __ hours (est: 23-27 hours over 5-7 days)

**Critical Success Metrics**:
- [ ] 60 FPS maintained during all gameplay
- [ ] No memory leaks after 1 hour continuous play  
- [ ] Save/load 100% reliable with backup recovery
- [ ] BigNumber calculations handle values up to 1e15
- [ ] All core gameplay mechanics functional and engaging

**Next Phase**: [03-integration.md](./03-integration.md) - Department Systems and Idle Mechanics

**Go/No-Go Decision**: All performance targets must be met and core gameplay must be engaging before proceeding to full department implementation.