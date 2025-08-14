# Phase 02: Core Features - Game Loop, Clicking, Currency

## Objectives

- Implement satisfying click mechanics with visual/audio feedback
- Create resource management system (Lines of Code → Features → Revenue)
- Build basic employee hiring and automation
- Establish core game loop progression
- Implement Development department with 4 employee types

## Success Criteria

- [ ] Click button responds in <50ms with animation
- [ ] Resource conversion chains working (10 lines = 1 basic feature)
- [ ] Cost scaling formula implemented (baseCost × 1.15^owned)
- [ ] Development department fully functional
- [ ] Automation reducing manual clicking
- [ ] Real-time counters updating smoothly

## Time Estimate: 1 Week

---

## Task 1: Clicking Mechanics Implementation

### 1.1 Core Clicking Service (2 hours)

**Objective**: Implement responsive, satisfying click mechanics

**Create src/features/clicking/ClickingService.ts**:
```typescript
import { observable, computed } from '@legendapp/state';
import { BaseService } from '../../core/StateManager';
import { eventBus } from '../../core/EventBus';
import { Result } from '../../core/Result';
import type { ClickingState, ClickResult, ClickAnimation } from './types/ClickingTypes';

export class ClickingService extends BaseService {
  protected _state$ = observable<ClickingState>({
    clickPower: 1,
    comboCount: 0,
    comboTimer: null,
    isButtonPressed: false,
    pendingAnimations: [],
    audioSettings: {
      enabled: true,
      volume: 0.7,
      pitchVariation: true
    },
    statistics: {
      totalClicks: 0,
      criticalHits: 0,
      bestCombo: 0
    }
  });

  private _displayData$ = computed(() => {
    const state = this._state$.peek();
    return {
      clickPower: state.clickPower,
      comboCount: state.comboCount,
      comboActive: state.comboCount >= 10,
      isButtonPressed: state.isButtonPressed,
      totalClicks: state.statistics.totalClicks
    };
  });

  constructor() {
    super();
    this._setupEventListeners();
  }

  public executeClick(position: { x: number; y: number }): Result<ClickResult, Error> {
    try {
      const state = this._state$.peek();
      
      // Calculate click value
      const isCritical = Math.random() < 0.05; // 5% critical chance
      const baseValue = state.clickPower;
      const criticalMultiplier = isCritical ? 10 : 1;
      const comboMultiplier = this._calculateComboMultiplier();
      const finalValue = Math.floor(baseValue * criticalMultiplier * comboMultiplier);

      // Update state
      this._state$.statistics.totalClicks.set(c => c + 1);
      if (isCritical) {
        this._state$.statistics.criticalHits.set(c => c + 1);
      }

      // Update combo
      this._updateCombo();

      // Create result
      const result: ClickResult = {
        value: finalValue,
        isCritical,
        comboMultiplier,
        position,
        timestamp: Date.now()
      };

      // Trigger animations and events
      this._triggerAnimation(result);
      this._emitEvents(result);

      return Result.ok(result);
    } catch (error) {
      return Result.err(error as Error);
    }
  }

  public setClickPower(power: number): void {
    this._state$.clickPower.set(power);
  }

  public getDisplayData() {
    return this._displayData$.peek();
  }

  public subscribe(callback: (data: any) => void) {
    return this._displayData$.onChange(callback);
  }

  private _calculateComboMultiplier(): number {
    const comboCount = this._state$.comboCount.peek();
    if (comboCount >= 10) {
      return 2.0; // 2x multiplier for combo
    }
    return 1.0;
  }

  private _updateCombo(): void {
    // Clear existing timer
    const currentTimer = this._state$.comboTimer.peek();
    if (currentTimer) {
      clearTimeout(currentTimer);
    }

    // Increment combo
    this._state$.comboCount.set(c => c + 1);

    // Update best combo
    const currentCombo = this._state$.comboCount.peek();
    const bestCombo = this._state$.statistics.bestCombo.peek();
    if (currentCombo > bestCombo) {
      this._state$.statistics.bestCombo.set(currentCombo);
    }

    // Set reset timer (5 seconds)
    const newTimer = setTimeout(() => {
      this._state$.comboCount.set(0);
      this._state$.comboTimer.set(null);
    }, 5000);

    this._state$.comboTimer.set(newTimer);
  }

  private _triggerAnimation(result: ClickResult): void {
    const animation: ClickAnimation = {
      id: Date.now().toString(),
      type: result.isCritical ? 'critical' : 'normal',
      value: result.value,
      position: result.position,
      startTime: Date.now(),
      duration: result.isCritical ? 1000 : 500
    };

    this._state$.pendingAnimations.set(animations => [...animations, animation]);

    // Remove animation after duration
    setTimeout(() => {
      this._state$.pendingAnimations.set(animations => 
        animations.filter(a => a.id !== animation.id)
      );
    }, animation.duration);
  }

  private _emitEvents(result: ClickResult): void {
    // Emit resource generation
    eventBus.emit('resources.generated', {
      type: 'linesOfCode',
      amount: result.value,
      source: 'click'
    });

    // Emit click event for other systems
    eventBus.emit('click.executed', {
      value: result.value,
      isCritical: result.isCritical,
      position: result.position
    });

    // Emit combo achievement
    const comboCount = this._state$.comboCount.peek();
    if (comboCount === 10) {
      eventBus.emit('combo.achieved', {
        comboCount,
        multiplier: 2.0
      });
    }
  }

  private _setupEventListeners(): void {
    // Listen for click power updates from upgrades
    eventBus.on('upgrade.clickPower', (data: { multiplier: number }) => {
      this._state$.clickPower.set(current => current * data.multiplier);
    });
  }

  public destroy(): void {
    const timer = this._state$.comboTimer.peek();
    if (timer) {
      clearTimeout(timer);
    }
    super.destroy();
  }
}
```

**Create src/features/clicking/types/ClickingTypes.ts**:
```typescript
export interface ClickingState {
  clickPower: number;
  comboCount: number;
  comboTimer: NodeJS.Timeout | null;
  isButtonPressed: boolean;
  pendingAnimations: ClickAnimation[];
  audioSettings: AudioSettings;
  statistics: ClickStatistics;
}

export interface ClickResult {
  value: number;
  isCritical: boolean;
  comboMultiplier: number;
  position: { x: number; y: number };
  timestamp: number;
}

export interface ClickAnimation {
  id: string;
  type: 'normal' | 'critical';
  value: number;
  position: { x: number; y: number };
  startTime: number;
  duration: number;
}

export interface AudioSettings {
  enabled: boolean;
  volume: number;
  pitchVariation: boolean;
}

export interface ClickStatistics {
  totalClicks: number;
  criticalHits: number;
  bestCombo: number;
}
```

### 1.2 Click Button Component (2 hours)

**Objective**: Create responsive, animated click button

**Create src/features/clicking/components/ClickButton.tsx**:
```typescript
import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  Text,
  StyleSheet,
  View,
  Dimensions,
  GestureResponderEvent
} from 'react-native';
import { observer } from '@legendapp/state/react';
import { ClickingService } from '../ClickingService';
import { NumberPopup } from './NumberPopup';

interface ClickButtonProps {
  clickingService: ClickingService;
}

export const ClickButton = observer(({ clickingService }: ClickButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const displayData = clickingService.getDisplayData();

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.0,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handlePress = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    const result = clickingService.executeClick({ x: locationX, y: locationY });
    
    if (!result.success) {
      console.error('Click failed:', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          style={[
            styles.button,
            displayData.comboActive && styles.comboButton
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
        >
          <Text style={styles.buttonText}>WRITE CODE</Text>
          <Text style={styles.powerText}>+{displayData.clickPower} lines</Text>
          
          {displayData.comboActive && (
            <View style={styles.comboIndicator}>
              <Text style={styles.comboText}>COMBO x2!</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* Floating number animations */}
      <NumberPopup clickingService={clickingService} />
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Total Clicks: {displayData.totalClicks.toLocaleString()}
        </Text>
        {displayData.comboCount > 0 && (
          <Text style={styles.comboCountText}>
            Combo: {displayData.comboCount}
          </Text>
        )}
      </View>
    </View>
  );
});

const { width } = Dimensions.get('window');
const BUTTON_SIZE = width * 0.6;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#45a049',
  },
  comboButton: {
    backgroundColor: '#FF9800',
    borderColor: '#F57C00',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  powerText: {
    fontSize: 16,
    color: 'white',
    marginTop: 8,
    opacity: 0.9,
  },
  comboIndicator: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comboText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  comboCountText: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: 'bold',
    marginTop: 4,
  },
});
```

**Create src/features/clicking/components/NumberPopup.tsx**:
```typescript
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { observer } from '@legendapp/state/react';
import { ClickingService } from '../ClickingService';

interface NumberPopupProps {
  clickingService: ClickingService;
}

export const NumberPopup = observer(({ clickingService }: NumberPopupProps) => {
  const animations = useRef(new Map<string, Animated.Value>()).current;

  useEffect(() => {
    const subscription = clickingService.subscribe((data) => {
      // This will be called when animations are added
    });

    return subscription;
  }, [clickingService]);

  // This would be better implemented with a proper animation system
  // For now, we'll use a simpler approach

  return (
    <View style={styles.container}>
      {/* Number popup animations will be rendered here */}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
});
```

**Validation**: Click button responds immediately with smooth animation

---

## Task 2: Currency System Implementation

### 2.1 Currency Service (2.5 hours)

**Objective**: Implement complete resource management system

**Create src/features/currency/CurrencyService.ts**:
```typescript
import { observable, computed } from '@legendapp/state';
import { BaseService } from '../../core/StateManager';
import { eventBus } from '../../core/EventBus';
import { Result, InsufficientFundsError } from '../../core/Result';
import type { CurrencyState, ResourceType } from './types/CurrencyTypes';

export class CurrencyService extends BaseService {
  protected _state$ = observable<CurrencyState>({
    resources: {
      linesOfCode: 0,
      basicFeatures: 0,
      advancedFeatures: 0,
      premiumFeatures: 0,
      revenue: 1000, // Starting money
      leads: 0,
      tickets: 0,
      insights: 0,
      intellectualProperty: 0
    },
    conversionRates: {
      linesToBasic: 10,
      linesToAdvanced: 100,
      linesToPremium: 1000,
      basicToRevenue: 50,
      advancedToRevenue: 500,
      premiumToRevenue: 5000
    },
    statistics: {
      totalGenerated: new Map(),
      totalSpent: new Map(),
      allTimeHigh: new Map()
    }
  });

  private _displayData$ = computed(() => {
    const state = this._state$.peek();
    return {
      linesOfCode: this._formatNumber(state.resources.linesOfCode),
      basicFeatures: this._formatNumber(state.resources.basicFeatures),
      advancedFeatures: this._formatNumber(state.resources.advancedFeatures),
      premiumFeatures: this._formatNumber(state.resources.premiumFeatures),
      revenue: this._formatCurrency(state.resources.revenue),
      totalFeatures: state.resources.basicFeatures + 
                    state.resources.advancedFeatures + 
                    state.resources.premiumFeatures,
      canConvertToBasic: state.resources.linesOfCode >= state.conversionRates.linesToBasic,
      canConvertToAdvanced: state.resources.linesOfCode >= state.conversionRates.linesToAdvanced,
      canConvertToPremium: state.resources.linesOfCode >= state.conversionRates.linesToPremium
    };
  });

  constructor() {
    super();
    this._setupEventListeners();
    this._startConversionLoop();
  }

  public addResource(type: ResourceType, amount: number): Result<void, Error> {
    try {
      this._state$.resources[type].set(current => current + amount);
      this._updateStatistics(type, amount, 'generated');
      
      // Check for new all-time high
      const newValue = this._state$.resources[type].peek();
      const currentHigh = this._state$.statistics.allTimeHigh.get(type) || 0;
      if (newValue > currentHigh) {
        this._state$.statistics.allTimeHigh.set(type, newValue);
        
        eventBus.emit('milestone.reached', {
          type: 'resource_high',
          resource: type,
          value: newValue
        });
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error as Error);
    }
  }

  public spendResource(type: ResourceType, amount: number): Result<void, InsufficientFundsError> {
    const available = this._state$.resources[type].peek();
    
    if (available < amount) {
      return Result.err(new InsufficientFundsError(amount, available));
    }

    try {
      this._state$.resources[type].set(current => current - amount);
      this._updateStatistics(type, amount, 'spent');
      
      eventBus.emit('resources.consumed', {
        type,
        amount,
        purpose: 'purchase'
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error as Error);
    }
  }

  public canAfford(type: ResourceType, amount: number): boolean {
    return this._state$.resources[type].peek() >= amount;
  }

  public getBalance(type: ResourceType): number {
    return this._state$.resources[type].peek();
  }

  public convertResources(): void {
    const state = this._state$.peek();
    
    // Convert lines to premium features (highest value first)
    if (state.resources.linesOfCode >= state.conversionRates.linesToPremium) {
      const conversions = Math.floor(state.resources.linesOfCode / state.conversionRates.linesToPremium);
      this._state$.resources.linesOfCode.set(current => 
        current - (conversions * state.conversionRates.linesToPremium)
      );
      this._state$.resources.premiumFeatures.set(current => current + conversions);
      
      eventBus.emit('resources.converted', {
        from: 'linesOfCode',
        to: 'premiumFeatures',
        amount: conversions
      });
    }
    
    // Convert lines to advanced features
    else if (state.resources.linesOfCode >= state.conversionRates.linesToAdvanced) {
      const conversions = Math.floor(state.resources.linesOfCode / state.conversionRates.linesToAdvanced);
      this._state$.resources.linesOfCode.set(current => 
        current - (conversions * state.conversionRates.linesToAdvanced)
      );
      this._state$.resources.advancedFeatures.set(current => current + conversions);
      
      eventBus.emit('resources.converted', {
        from: 'linesOfCode',
        to: 'advancedFeatures',
        amount: conversions
      });
    }
    
    // Convert lines to basic features
    else if (state.resources.linesOfCode >= state.conversionRates.linesToBasic) {
      const conversions = Math.floor(state.resources.linesOfCode / state.conversionRates.linesToBasic);
      this._state$.resources.linesOfCode.set(current => 
        current - (conversions * state.conversionRates.linesToBasic)
      );
      this._state$.resources.basicFeatures.set(current => current + conversions);
      
      eventBus.emit('resources.converted', {
        from: 'linesOfCode',
        to: 'basicFeatures',
        amount: conversions
      });
    }
  }

  public getDisplayData() {
    return this._displayData$.peek();
  }

  public subscribe(callback: (data: any) => void) {
    return this._displayData$.onChange(callback);
  }

  private _setupEventListeners(): void {
    eventBus.on('resources.generated', (data: { type: ResourceType; amount: number }) => {
      this.addResource(data.type, data.amount);
    });

    eventBus.on('funds.requested', async (data: { amount: number; purpose: string }) => {
      const result = this.spendResource('revenue', data.amount);
      eventBus.emit('funds.response', {
        success: result.success,
        error: result.success ? undefined : result.error.message
      });
    });
  }

  private _startConversionLoop(): void {
    // Auto-convert resources every 100ms
    setInterval(() => {
      this.convertResources();
    }, 100);
  }

  private _updateStatistics(type: ResourceType, amount: number, operation: 'generated' | 'spent'): void {
    const mapKey = operation === 'generated' ? 'totalGenerated' : 'totalSpent';
    const currentMap = this._state$.statistics[mapKey].peek();
    const currentValue = currentMap.get(type) || 0;
    currentMap.set(type, currentValue + amount);
  }

  private _formatNumber(value: number): string {
    if (value >= 1e12) return (value / 1e12).toFixed(2) + 'T';
    if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
    return Math.floor(value).toLocaleString();
  }

  private _formatCurrency(value: number): string {
    return '$' + this._formatNumber(value);
  }

  public destroy(): void {
    // Cleanup will be handled by intervals being cleared automatically
    super.destroy();
  }
}
```

**Create src/features/currency/types/CurrencyTypes.ts**:
```typescript
export type ResourceType = 
  | 'linesOfCode' 
  | 'basicFeatures' 
  | 'advancedFeatures' 
  | 'premiumFeatures' 
  | 'revenue'
  | 'leads'
  | 'tickets'
  | 'insights'
  | 'intellectualProperty';

export interface CurrencyState {
  resources: Record<ResourceType, number>;
  conversionRates: {
    linesToBasic: number;
    linesToAdvanced: number;
    linesToPremium: number;
    basicToRevenue: number;
    advancedToRevenue: number;
    premiumToRevenue: number;
  };
  statistics: {
    totalGenerated: Map<ResourceType, number>;
    totalSpent: Map<ResourceType, number>;
    allTimeHigh: Map<ResourceType, number>;
  };
}

export interface ResourceConversionEvent {
  from: ResourceType;
  to: ResourceType;
  amount: number;
}
```

### 2.2 Currency Display Component (1.5 hours)

**Objective**: Create real-time resource counter display

**Create src/features/currency/components/CurrencyDisplay.tsx**:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { observer } from '@legendapp/state/react';
import { CurrencyService } from '../CurrencyService';

interface CurrencyDisplayProps {
  currencyService: CurrencyService;
}

export const CurrencyDisplay = observer(({ currencyService }: CurrencyDisplayProps) => {
  const data = currencyService.getDisplayData();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ResourceCounter 
          label="Lines of Code" 
          value={data.linesOfCode}
          color="#2196F3"
        />
        <ResourceCounter 
          label="Revenue" 
          value={data.revenue}
          color="#4CAF50"
        />
      </View>
      
      <View style={styles.row}>
        <ResourceCounter 
          label="Basic Features" 
          value={data.basicFeatures}
          color="#FF9800"
        />
        <ResourceCounter 
          label="Advanced Features" 
          value={data.advancedFeatures}
          color="#9C27B0"
        />
      </View>
      
      <View style={styles.row}>
        <ResourceCounter 
          label="Premium Features" 
          value={data.premiumFeatures}
          color="#F44336"
        />
        <ResourceCounter 
          label="Total Features" 
          value={data.totalFeatures.toString()}
          color="#607D8B"
        />
      </View>
    </View>
  );
});

interface ResourceCounterProps {
  label: string;
  value: string;
  color: string;
}

const ResourceCounter = ({ label, value, color }: ResourceCounterProps) => (
  <View style={[styles.counter, { borderLeftColor: color }]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  counter: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

**Validation**: Counters update in real-time as resources change

---

## Task 3: Employee System Implementation

### 3.1 Employee Service (3 hours)

**Objective**: Implement hiring, cost scaling, and production

**Create src/features/employees/EmployeesService.ts**:
```typescript
import { observable, computed } from '@legendapp/state';
import { BaseService } from '../../core/StateManager';
import { eventBus } from '../../core/EventBus';
import { Result, InsufficientFundsError } from '../../core/Result';
import { EmployeeType, EmployeesState, DepartmentName } from './types/EmployeesTypes';

export class EmployeesService extends BaseService {
  protected _state$ = observable<EmployeesState>({
    departments: {
      development: {
        juniorDev: { owned: 0, baseCost: 10, productionRate: 0.1 },
        midDev: { owned: 0, baseCost: 100, productionRate: 0.5 },
        seniorDev: { owned: 0, baseCost: 1000, productionRate: 2.5 },
        techLead: { owned: 0, baseCost: 10000, productionRate: 10 }
      }
    },
    productionRates: {
      development: 0
    },
    statistics: {
      totalHired: 0,
      totalSpent: 0,
      productionHistory: []
    }
  });

  private _displayData$ = computed(() => {
    const state = this._state$.peek();
    const devDept = state.departments.development;
    
    return {
      development: {
        juniorDev: {
          owned: devDept.juniorDev.owned,
          cost: this._calculateCost('development', 'juniorDev'),
          production: devDept.juniorDev.owned * devDept.juniorDev.productionRate
        },
        midDev: {
          owned: devDept.midDev.owned,
          cost: this._calculateCost('development', 'midDev'),
          production: devDept.midDev.owned * devDept.midDev.productionRate
        },
        seniorDev: {
          owned: devDept.seniorDev.owned,
          cost: this._calculateCost('development', 'seniorDev'),
          production: devDept.seniorDev.owned * devDept.seniorDev.productionRate
        },
        techLead: {
          owned: devDept.techLead.owned,
          cost: this._calculateCost('development', 'techLead'),
          production: devDept.techLead.owned * devDept.techLead.productionRate
        }
      },
      totalProduction: this._calculateTotalProduction('development'),
      canAffordAny: this._getAffordableEmployees()
    };
  });

  constructor() {
    super();
    this._setupEventListeners();
    this._startProductionLoop();
  }

  public hireEmployee(department: DepartmentName, employeeType: string): Result<void, Error> {
    const cost = this._calculateCost(department, employeeType);
    
    // Request funds
    return new Promise<Result<void, Error>>((resolve) => {
      const subscription = eventBus.once('funds.response', (response: { success: boolean; error?: string }) => {
        if (response.success) {
          // Hire the employee
          this._state$.departments[department][employeeType].owned.set(current => current + 1);
          this._state$.statistics.totalHired.set(current => current + 1);
          this._state$.statistics.totalSpent.set(current => current + cost);
          
          // Update production rate
          this._updateProductionRate(department);
          
          // Emit hired event
          eventBus.emit('employee.hired', {
            department,
            employeeType,
            cost,
            newCount: this._state$.departments[department][employeeType].owned.peek()
          });
          
          resolve(Result.ok(undefined));
        } else {
          resolve(Result.err(new InsufficientFundsError(cost, 0)));
        }
      });
      
      // Request the funds
      eventBus.emit('funds.requested', {
        amount: cost,
        purpose: 'hire_employee',
        requester: 'employees'
      });
    });
  }

  public getCost(department: DepartmentName, employeeType: string): number {
    return this._calculateCost(department, employeeType);
  }

  public getProductionRate(department: DepartmentName): number {
    return this._state$.productionRates[department].peek();
  }

  public getDisplayData() {
    return this._displayData$.peek();
  }

  public subscribe(callback: (data: any) => void) {
    return this._displayData$.onChange(callback);
  }

  private _calculateCost(department: DepartmentName, employeeType: string): number {
    const employee = this._state$.departments[department][employeeType].peek();
    // Cost scaling formula: baseCost × 1.15^owned
    return Math.floor(employee.baseCost * Math.pow(1.15, employee.owned));
  }

  private _calculateTotalProduction(department: DepartmentName): number {
    const dept = this._state$.departments[department].peek();
    let total = 0;
    
    Object.entries(dept).forEach(([employeeType, employee]) => {
      total += employee.owned * employee.productionRate;
    });
    
    return total;
  }

  private _updateProductionRate(department: DepartmentName): void {
    const totalProduction = this._calculateTotalProduction(department);
    this._state$.productionRates[department].set(totalProduction);
  }

  private _getAffordableEmployees(): string[] {
    // This would check current funds and return which employees can be hired
    // For now, return empty array - will be implemented when currency integration is complete
    return [];
  }

  private _setupEventListeners(): void {
    // No specific event listeners needed for base implementation
  }

  private _startProductionLoop(): void {
    // Production loop - generates resources every second
    setInterval(() => {
      const developmentRate = this._state$.productionRates.development.peek();
      
      if (developmentRate > 0) {
        eventBus.emit('resources.generated', {
          type: 'linesOfCode',
          amount: developmentRate,
          source: 'employees',
          deltaTime: 1000
        });
        
        eventBus.emit('employee.production', {
          department: 'development',
          amount: developmentRate,
          rate: developmentRate,
          deltaTime: 1000
        });
      }
    }, 1000);
  }

  public destroy(): void {
    // Production interval will be cleaned up automatically
    super.destroy();
  }
}
```

**Create src/features/employees/types/EmployeesTypes.ts**:
```typescript
export type DepartmentName = 'development';

export interface EmployeeType {
  owned: number;
  baseCost: number;
  productionRate: number;
}

export interface DepartmentData {
  [employeeType: string]: EmployeeType;
}

export interface EmployeesState {
  departments: {
    [K in DepartmentName]: DepartmentData;
  };
  productionRates: {
    [K in DepartmentName]: number;
  };
  statistics: {
    totalHired: number;
    totalSpent: number;
    productionHistory: ProductionRecord[];
  };
}

export interface ProductionRecord {
  timestamp: number;
  department: DepartmentName;
  amount: number;
  rate: number;
}

export interface EmployeeHiredEvent {
  department: DepartmentName;
  employeeType: string;
  cost: number;
  newCount: number;
}
```

### 3.2 Development Department Component (2 hours)

**Objective**: Create hiring interface for development department

**Create src/features/employees/components/DevelopmentDepartment.tsx**:
```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { observer } from '@legendapp/state/react';
import { EmployeesService } from '../EmployeesService';
import { CurrencyService } from '../../currency/CurrencyService';
import { HireButton } from './HireButton';

interface DevelopmentDepartmentProps {
  employeesService: EmployeesService;
  currencyService: CurrencyService;
}

export const DevelopmentDepartment = observer(({ 
  employeesService, 
  currencyService 
}: DevelopmentDepartmentProps) => {
  const employeeData = employeesService.getDisplayData();
  const currencyData = currencyService.getDisplayData();

  const employees = [
    {
      id: 'juniorDev',
      name: 'Junior Developer',
      description: 'Fresh out of coding bootcamp, eager to learn',
      data: employeeData.development.juniorDev
    },
    {
      id: 'midDev',
      name: 'Mid-Level Developer',
      description: 'Experienced developer with solid skills',
      data: employeeData.development.midDev
    },
    {
      id: 'seniorDev',
      name: 'Senior Developer',
      description: 'Expert developer who mentors others',
      data: employeeData.development.seniorDev
    },
    {
      id: 'techLead',
      name: 'Tech Lead',
      description: 'Leads the team and provides 10% department boost',
      data: employeeData.development.techLead
    }
  ];

  const handleHire = async (employeeType: string) => {
    const result = await employeesService.hireEmployee('development', employeeType);
    if (!result.success) {
      console.log('Cannot hire:', result.error.message);
    }
  };

  const canAfford = (cost: number) => {
    return currencyService.canAfford('revenue', cost);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Development Department</Text>
        <Text style={styles.subtitle}>
          Total Production: {employeeData.totalProduction.toFixed(1)} lines/sec
        </Text>
      </View>

      {employees.map((employee) => (
        <View key={employee.id} style={styles.employeeCard}>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{employee.name}</Text>
            <Text style={styles.employeeDescription}>{employee.description}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Owned</Text>
                <Text style={styles.statValue}>{employee.data.owned}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Production</Text>
                <Text style={styles.statValue}>
                  {employee.data.production.toFixed(1)}/sec
                </Text>
              </View>
            </View>
          </View>

          <HireButton
            cost={employee.data.cost}
            canAfford={canAfford(employee.data.cost)}
            onPress={() => handleHire(employee.id)}
          />
        </View>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  employeeCard: {
    backgroundColor: 'white',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  employeeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
  },
  stat: {
    marginRight: 20,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
```

**Create src/features/employees/components/HireButton.tsx**:
```typescript
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface HireButtonProps {
  cost: number;
  canAfford: boolean;
  onPress: () => void;
}

export const HireButton = ({ cost, canAfford, onPress }: HireButtonProps) => {
  const formatCurrency = (value: number): string => {
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
    if (value >= 1e3) return '$' + (value / 1e3).toFixed(1) + 'K';
    return '$' + value.toLocaleString();
  };

  return (
    <Pressable
      style={[
        styles.button,
        canAfford ? styles.buttonEnabled : styles.buttonDisabled
      ]}
      onPress={canAfford ? onPress : undefined}
      disabled={!canAfford}
    >
      <Text style={[
        styles.buttonText,
        canAfford ? styles.textEnabled : styles.textDisabled
      ]}>
        Hire
      </Text>
      <Text style={[
        styles.costText,
        canAfford ? styles.textEnabled : styles.textDisabled
      ]}>
        {formatCurrency(cost)}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  costText: {
    fontSize: 12,
  },
  textEnabled: {
    color: 'white',
  },
  textDisabled: {
    color: '#999',
  },
});
```

**Validation**: Employees can be hired, cost scales correctly, production increases

---

## Task 4: Game Loop Integration

### 4.1 Main Game Screen (2 hours)

**Objective**: Integrate all systems into cohesive game screen

**Create src/screens/GameScreen.tsx**:
```typescript
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { ClickButton } from '../features/clicking/components/ClickButton';
import { CurrencyDisplay } from '../features/currency/components/CurrencyDisplay';
import { DevelopmentDepartment } from '../features/employees/components/DevelopmentDepartment';

// Services
import { ClickingService } from '../features/clicking/ClickingService';
import { CurrencyService } from '../features/currency/CurrencyService';
import { EmployeesService } from '../features/employees/EmployeesService';

export const GameScreen = () => {
  const [services] = useState(() => ({
    clicking: new ClickingService(),
    currency: new CurrencyService(),
    employees: new EmployeesService()
  }));

  useEffect(() => {
    // Cleanup services on unmount
    return () => {
      Object.values(services).forEach(service => service.destroy());
    };
  }, [services]);

  return (
    <SafeAreaView style={styles.container}>
      <CurrencyDisplay currencyService={services.currency} />
      
      <View style={styles.gameArea}>
        <View style={styles.clickArea}>
          <ClickButton clickingService={services.clicking} />
        </View>
        
        <View style={styles.departmentArea}>
          <DevelopmentDepartment 
            employeesService={services.employees}
            currencyService={services.currency}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gameArea: {
    flex: 1,
  },
  clickArea: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  departmentArea: {
    flex: 0.4,
  },
});
```

### 4.2 Update App.tsx (30 minutes)

**Objective**: Wire game screen into main app

**Update App.tsx**:
```typescript
import React from 'react';
import { GameScreen } from './src/screens/GameScreen';

export default function App() {
  return <GameScreen />;
}
```

**Validation**: Complete game loop functional from click to automation

---

## Deliverables

### Clicking System
- [ ] Responsive click button with <50ms response time
- [ ] Visual feedback with scale animations
- [ ] Combo system with 2x multiplier at 10 clicks
- [ ] Critical hits at 5% chance for 10x value
- [ ] Click statistics tracking

### Currency System
- [ ] Resource management for lines, features, revenue
- [ ] Automatic conversion chains (10 lines = 1 basic feature)
- [ ] Real-time counter displays with proper formatting
- [ ] Statistics tracking for all resources
- [ ] Event-driven resource updates

### Employee System
- [ ] Development department with 4 employee types
- [ ] Cost scaling formula (baseCost × 1.15^owned)
- [ ] Automated production system (lines/sec)
- [ ] Hiring interface with cost display
- [ ] Production rate calculations

### Game Loop Integration
- [ ] Complete flow from click → resources → employees → automation
- [ ] Cross-feature communication via EventBus
- [ ] Real-time UI updates
- [ ] Service lifecycle management

---

## Validation Checklist

- [ ] Click button responds in <50ms consistently
- [ ] Resource counters update in real-time
- [ ] Employee costs scale correctly per formula
- [ ] Automated production generates resources
- [ ] Can progress from manual clicking to automation
- [ ] All features communicate via events only
- [ ] No performance issues during continuous play
- [ ] Services clean up properly on app close

---

## Troubleshooting

### Performance Issues
```bash
# Profile React Native performance
npx react-native log-android  # View logs
npx expo start --dev-client   # Use development client
```

### State Updates Not Showing
```typescript
// Ensure components are wrapped with observer
import { observer } from '@legendapp/state/react';
export const Component = observer(() => { ... });

// Check state is being mutated correctly
state$.value.set(newValue);  // ✅ Correct
state$.value = newValue;     // ❌ Wrong
```

### EventBus Issues
```typescript
// Check event names match exactly
eventBus.emit('resources.generated', data);
eventBus.on('resources.generated', handler);  // Must match exactly

// Verify event handlers are properly unsubscribed
const subscription = eventBus.on('event', handler);
return () => subscription.unsubscribe();  // In useEffect cleanup
```

### Cost Scaling Problems
```typescript
// Verify formula implementation
const cost = baseCost * Math.pow(1.15, ownedCount);

// Check for floating point precision
const cost = Math.floor(baseCost * Math.pow(1.15, ownedCount));
```

---

**Next Phase**: Proceed to [03-integration.md](./03-integration.md) for department systems and upgrades implementation.