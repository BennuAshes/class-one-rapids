# Phase 2: Core Game Features

**Duration**: 8-10 days  
**Status**: Not Started  
**Prerequisites**: Phase 1 (Foundation) completed

## Objectives

1. Implement core click mechanics and manual revenue generation
2. Create Development department with 4 unit types (Junior Dev, Mid Dev, Senior Dev, Tech Lead)
3. Build automated production system with idle generation
4. Implement employee hiring system with cost scaling
5. Create basic game UI with responsive design
6. Add department production visualization and animations

## Tasks Overview

### Day 1-2: Click Mechanics & UI Foundation
- [ ] Create main game screen with click interface
- [ ] Implement money display with BigNumber formatting
- [ ] Add click feedback with haptics and animations
- [ ] Create basic button components and styling

### Day 3-4: Development Department
- [ ] Implement Development department model
- [ ] Create 4 unit types with cost progression
- [ ] Add hiring interface and purchase validation
- [ ] Implement production rate calculations

### Day 5-6: Automation System  
- [ ] Build automated production calculations
- [ ] Add production rate display and progress tracking
- [ ] Implement idle progression with time-based income
- [ ] Create production visualization components

### Day 7-8: UI Polish & Integration
- [ ] Design department management interface
- [ ] Add production animations and visual feedback
- [ ] Implement responsive design for different screen sizes
- [ ] Add sound effects for interactions

### Day 9-10: Testing & Optimization
- [ ] Comprehensive testing of game mechanics
- [ ] Performance optimization for animations
- [ ] Bug fixes and edge case handling
- [ ] User experience refinements

## Detailed Implementation

### Step 1: Core Click Mechanics

#### 1.1 Create Shared Button Component
**File**: `src/shared/components/BaseButton.tsx`

```typescript
import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  PressableStateCallbackType 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface BaseButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BaseButton({ 
  title, 
  onPress, 
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style 
}: BaseButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(disabled ? 0.5 : 1);
  
  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };
  
  const handlePress = () => {
    if (!disabled) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  return (
    <AnimatedPressable
      style={[
        styles.button,
        styles[variant],
        styles[size],
        animatedStyle,
        style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
        {title}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Variants
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#8E8E93',
  },
  success: {
    backgroundColor: '#34C759',
  },
  warning: {
    backgroundColor: '#FF9500',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 56,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  successText: {
    color: '#FFFFFF',
  },
  warningText: {
    color: '#FFFFFF',
  },
  
  // Text sizes
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
```

#### 1.2 Create Money Display Component
**File**: `src/shared/components/MoneyDisplay.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  useAnimatedProps
} from 'react-native-reanimated';
import { BigNumber } from '../utils/BigNumber';

interface MoneyDisplayProps {
  amount: BigNumber;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const AnimatedText = Animated.createAnimatedComponent(Text);

export function MoneyDisplay({ 
  amount, 
  label = '$', 
  size = 'medium',
  animated = true 
}: MoneyDisplayProps) {
  const scale = useSharedValue(1);
  
  React.useEffect(() => {
    if (animated) {
      scale.value = withSpring(1.1, { duration: 200 }, () => {
        scale.value = withSpring(1, { duration: 200 });
      });
    }
  }, [amount.toString(), animated]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const formattedAmount = amount.toString();
  
  return (
    <View style={styles.container}>
      <AnimatedText style={[
        styles.text,
        styles[size],
        animated && animatedStyle
      ]}>
        {label}{formattedAmount}
      </AnimatedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    color: '#1D1D1F',
    fontFamily: 'System',
  },
  small: {
    fontSize: 16,
  },
  medium: {
    fontSize: 24,
  },
  large: {
    fontSize: 32,
  },
});
```

#### 1.3 Create Main Game Screen
**File**: `app/(tabs)/index.tsx`

```typescript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useGameStore } from '../../src/core/state/gameStore';
import { BaseButton } from '../../src/shared/components/BaseButton';
import { MoneyDisplay } from '../../src/shared/components/MoneyDisplay';
import { DepartmentView } from '../../src/features/departments/components/DepartmentView';

const { width } = Dimensions.get('window');

export default function GameScreen() {
  const { money, click, statistics, departments } = useGameStore();
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Money Display */}
        <View style={styles.moneySection}>
          <MoneyDisplay amount={money} size="large" />
          <Text style={styles.subtitle}>Company Revenue</Text>
        </View>
        
        {/* Click Button */}
        <View style={styles.clickSection}>
          <BaseButton
            title="💰 Earn Money"
            onPress={click}
            variant="success"
            size="large"
            style={styles.clickButton}
          />
          <Text style={styles.clickStats}>
            Total Clicks: {statistics.totalClicks}
          </Text>
        </View>
        
        {/* Departments Section */}
        <View style={styles.departmentsSection}>
          <Text style={styles.sectionTitle}>Departments</Text>
          {departments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No departments yet. Hire your first developer to get started!
              </Text>
            </View>
          ) : (
            departments.map(department => (
              <DepartmentView 
                key={department.id} 
                department={department} 
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  moneySection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
  clickSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
    marginTop: 16,
  },
  clickButton: {
    width: width * 0.6,
    minHeight: 60,
    borderRadius: 30,
  },
  clickStats: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 12,
  },
  departmentsSection: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
});
```

### Step 2: Development Department Implementation

#### 2.1 Update Game Store with Department Logic
**File**: `src/core/state/gameStore.ts` (Add to existing)

```typescript
// Add these interfaces and update the store
export interface Unit {
  id: string;
  type: UnitType;
  count: number;
  baseCost: BigNumber;
  currentCost: BigNumber;
  baseProduction: BigNumber;
}

export type UnitType = 'juniorDev' | 'midDev' | 'seniorDev' | 'techLead';

export const UNIT_CONFIG: Record<UnitType, {
  name: string;
  baseCost: BigNumber;
  baseProduction: BigNumber;
  costMultiplier: number;
  emoji: string;
}> = {
  juniorDev: {
    name: 'Junior Developer',
    baseCost: new BigNumber(10),
    baseProduction: new BigNumber(1),
    costMultiplier: 1.15,
    emoji: '👨‍💻',
  },
  midDev: {
    name: 'Mid-Level Developer', 
    baseCost: new BigNumber(100),
    baseProduction: new BigNumber(10),
    costMultiplier: 1.15,
    emoji: '👩‍💻',
  },
  seniorDev: {
    name: 'Senior Developer',
    baseCost: new BigNumber(1000),
    baseProduction: new BigNumber(100),
    costMultiplier: 1.15,
    emoji: '🧑‍💼',
  },
  techLead: {
    name: 'Tech Lead',
    baseCost: new BigNumber(10000),
    baseProduction: new BigNumber(1000),
    costMultiplier: 1.15,
    emoji: '👨‍🚀',
  },
};

// Add these actions to the store
initializeDevelopmentDepartment: () => set(state => {
  if (state.departments.find(d => d.id === 'development')) return;
  
  const units: Unit[] = Object.entries(UNIT_CONFIG).map(([type, config]) => ({
    id: type,
    type: type as UnitType,
    count: 0,
    baseCost: config.baseCost,
    currentCost: config.baseCost,
    baseProduction: config.baseProduction,
  }));
  
  const newDepartment: Department = {
    id: 'development',
    name: 'Development Team',
    type: 'development',
    units,
    production: {
      baseRate: new BigNumber(0),
      multiplier: 1,
      currentRate: new BigNumber(0),
    },
  };
  
  state.departments.push(newDepartment);
}),

hireDeveloper: (unitType: UnitType) => set(state => {
  const department = state.departments.find(d => d.type === 'development');
  if (!department) return;
  
  const unit = department.units.find(u => u.type === unitType);
  if (!unit) return;
  
  if (state.money.greaterThan(unit.currentCost)) {
    // Deduct money
    state.money = state.money.subtract(unit.currentCost);
    
    // Add unit
    unit.count += 1;
    
    // Increase cost for next purchase
    const config = UNIT_CONFIG[unitType];
    unit.currentCost = unit.currentCost.multiply(config.costMultiplier);
    
    // Recalculate department production
    const totalProduction = department.units.reduce((total, u) => 
      total.add(u.baseProduction.multiply(u.count)), new BigNumber(0)
    );
    
    department.production.currentRate = totalProduction.multiply(department.production.multiplier);
  }
}),
```

#### 2.2 Create Department View Component
**File**: `src/features/departments/components/DepartmentView.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Department } from '../../../core/state/gameStore';
import { UnitRow } from './UnitRow';
import { MoneyDisplay } from '../../../shared/components/MoneyDisplay';

interface DepartmentViewProps {
  department: Department;
}

export function DepartmentView({ department }: DepartmentViewProps) {
  const totalEmployees = department.units.reduce((sum, unit) => sum + unit.count, 0);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏢 {department.name}</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>
            {totalEmployees} employee{totalEmployees !== 1 ? 's' : ''}
          </Text>
          <MoneyDisplay 
            amount={department.production.currentRate} 
            label="$"
            size="small"
          />
          <Text style={styles.rateLabel}>per second</Text>
        </View>
      </View>
      
      <View style={styles.unitsContainer}>
        {department.units.map(unit => (
          <UnitRow key={unit.id} unit={unit} departmentId={department.id} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  rateLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  unitsContainer: {
    gap: 12,
  },
});
```

#### 2.3 Create Unit Row Component
**File**: `src/features/departments/components/UnitRow.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Unit, UnitType, UNIT_CONFIG, useGameStore } from '../../../core/state/gameStore';
import { BaseButton } from '../../../shared/components/BaseButton';
import { MoneyDisplay } from '../../../shared/components/MoneyDisplay';

interface UnitRowProps {
  unit: Unit;
  departmentId: string;
}

export function UnitRow({ unit }: UnitRowProps) {
  const { money, hireDeveloper } = useGameStore();
  const config = UNIT_CONFIG[unit.type as UnitType];
  const canAfford = money.greaterThan(unit.currentCost);
  
  const handleHire = () => {
    hireDeveloper(unit.type as UnitType);
  };
  
  const totalProduction = unit.baseProduction.multiply(unit.count);
  
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{config.emoji}</Text>
          <View style={styles.details}>
            <Text style={styles.name}>{config.name}</Text>
            <Text style={styles.count}>
              Owned: {unit.count}
              {unit.count > 0 && (
                <Text style={styles.production}>
                  {' • '}
                  <MoneyDisplay 
                    amount={totalProduction} 
                    size="small" 
                    animated={false}
                  />
                  /sec
                </Text>
              )}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actions}>
        <View style={styles.costContainer}>
          <MoneyDisplay 
            amount={unit.currentCost} 
            size="small" 
            animated={false}
          />
        </View>
        <BaseButton
          title="Hire"
          onPress={handleHire}
          disabled={!canAfford}
          variant={canAfford ? 'primary' : 'secondary'}
          size="small"
          style={styles.hireButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  count: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  production: {
    color: '#34C759',
  },
  actions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  costContainer: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  hireButton: {
    minWidth: 60,
  },
});
```

### Step 3: Initialize Development Department

#### 3.1 Update Main Screen to Initialize Department
**File**: `app/(tabs)/index.tsx` (Update existing)

```typescript
// Add this to the component
const { money, click, statistics, departments, initializeDevelopmentDepartment } = useGameStore();

React.useEffect(() => {
  // Initialize development department on first render
  initializeDevelopmentDepartment();
}, []);
```

### Step 4: Production Visualization

#### 4.1 Create Production Progress Component  
**File**: `src/shared/components/ProductionProgress.tsx`

```typescript
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { BigNumber } from '../utils/BigNumber';

interface ProductionProgressProps {
  isActive: boolean;
  rate: BigNumber;
}

export function ProductionProgress({ isActive, rate }: ProductionProgressProps) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0.3);
  
  useEffect(() => {
    if (isActive && rate.greaterThan(new BigNumber(0))) {
      // Animate progress bar
      progress.value = withRepeat(
        withTiming(1, { duration: 2000 }), 
        -1, 
        false
      );
      
      // Fade in
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      progress.value = 0;
      opacity.value = withTiming(0.3, { duration: 300 });
    }
  }, [isActive, rate.toString()]);
  
  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
  }));
  
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.progress, progressStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 2,
  },
});
```

### Step 5: Testing Implementation

#### 5.1 Create Unit Tests for Core Features
**File**: `__tests__/shared/components/BaseButton.test.tsx`

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BaseButton } from '../../../src/shared/components/BaseButton';

describe('BaseButton', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(
      <BaseButton title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });
  
  it('calls onPress when pressed', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <BaseButton title="Test Button" onPress={mockPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });
  
  it('does not call onPress when disabled', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <BaseButton title="Test Button" onPress={mockPress} disabled />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockPress).not.toHaveBeenCalled();
  });
});
```

#### 5.2 Create Integration Tests
**File**: `__tests__/features/departments/hiring.test.tsx`

```typescript
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useGameStore, BigNumber } from '../../../src/core/state/gameStore';

describe('Developer Hiring', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.reset();
      result.current.initializeDevelopmentDepartment();
    });
  });
  
  it('should hire junior developer when affordable', () => {
    const { result } = renderHook(() => useGameStore());
    
    // Give player enough money
    act(() => {
      result.current.addMoney(new BigNumber(100));
    });
    
    // Hire junior developer
    act(() => {
      result.current.hireDeveloper('juniorDev');
    });
    
    const devDepartment = result.current.departments.find(d => d.type === 'development');
    const juniorDevUnit = devDepartment?.units.find(u => u.type === 'juniorDev');
    
    expect(juniorDevUnit?.count).toBe(1);
    expect(result.current.money.toString()).toBe('90.00'); // 100 - 10
  });
  
  it('should increase cost after hiring', () => {
    const { result } = renderHook(() => useGameStore());
    
    // Give player enough money for multiple hires
    act(() => {
      result.current.addMoney(new BigNumber(1000));
    });
    
    const devDepartment = result.current.departments.find(d => d.type === 'development');
    const juniorDevUnit = devDepartment?.units.find(u => u.type === 'juniorDev');
    const initialCost = juniorDevUnit?.currentCost.toString();
    
    // Hire first developer
    act(() => {
      result.current.hireDeveloper('juniorDev');
    });
    
    const newCost = juniorDevUnit?.currentCost.toString();
    expect(newCost).not.toBe(initialCost);
  });
  
  it('should not hire when insufficient funds', () => {
    const { result } = renderHook(() => useGameStore());
    
    // Don't add extra money (starts with 100)
    const initialMoney = result.current.money.toString();
    
    // Try to hire expensive developer
    act(() => {
      result.current.hireDeveloper('techLead'); // Costs 10,000
    });
    
    const devDepartment = result.current.departments.find(d => d.type === 'development');
    const techLeadUnit = devDepartment?.units.find(u => u.type === 'techLead');
    
    expect(techLeadUnit?.count).toBe(0);
    expect(result.current.money.toString()).toBe(initialMoney); // No change
  });
});
```

## Performance Optimization

### Animation Performance
```typescript
// Use native driver for all animations
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }], // ✅ Runs on native thread
  // opacity: opacity.value,            // ✅ Runs on native thread
}));

// Avoid layout animations for performance
const badStyle = useAnimatedStyle(() => ({
  width: width.value, // ❌ Triggers layout on main thread
}));
```

### Memory Management
```typescript
// Clean up animations and listeners
useEffect(() => {
  return () => {
    // Cancel running animations
    cancelAnimation(scale);
    cancelAnimation(opacity);
  };
}, []);
```

## Validation & Testing

### Phase 2 Completion Checklist

#### Core Features Validation
```bash
# Verify click mechanics work
npm test -- BaseButton.test.tsx

# Verify department system  
npm test -- hiring.test.tsx

# Verify BigNumber operations
npm test -- BigNumber.test.ts

# Run full test suite
npm test -- --coverage
```

#### Performance Validation
```bash
# Start performance monitoring
npm run dev

# Check frame rate in development
# Should maintain >55 FPS during interactions
```

#### UI/UX Validation
```bash
# Test on different screen sizes
npx expo start --dev-client

# Verify responsive design
# Verify haptic feedback (device only)
# Verify animations are smooth
```

## Phase 2 Completion Criteria

- [ ] Click mechanics implemented with haptic feedback and animations
- [ ] Money display shows formatted BigNumbers with animation
- [ ] Development department with 4 unit types fully functional
- [ ] Employee hiring system with cost scaling implemented
- [ ] Automated production system calculating idle income
- [ ] UI responsive design working on different screen sizes
- [ ] Production visualization with progress animations
- [ ] Sound effects for interactions (basic)
- [ ] Comprehensive test coverage >70% for new features
- [ ] Performance maintains >55 FPS during all interactions
- [ ] Save/load system preserves game state correctly

## Troubleshooting Common Issues

### Issue: Animations causing frame drops
**Solution**: 
- Use `runOnUI` for complex calculations
- Reduce animation complexity
- Use native driver properties only

### Issue: BigNumber operations slow
**Solution**:
- Cache frequently accessed values
- Optimize normalize() function calls
- Use lazy evaluation for display strings

### Issue: Memory leaks in game loop
**Solution**:
- Proper cleanup in useEffect
- Cancel animations on unmount
- Monitor memory usage during testing

## Next Steps

Upon Phase 2 completion:

1. **Update progress.json**: Mark Phase 2 as completed
2. **Proceed to Phase 3**: [03-integration.md](./03-integration.md)  
3. **Performance validation**: Confirm >55 FPS maintained
4. **User testing**: Gather feedback on core mechanics

## Time Estimation

- **Day 1-2**: Click mechanics & UI foundation (16 hours)
- **Day 3-4**: Development department implementation (16 hours) 
- **Day 5-6**: Automation system (16 hours)
- **Day 7-8**: UI polish & integration (16 hours)
- **Day 9-10**: Testing & optimization (16 hours)

**Total Estimated Time**: 80 hours over 10 days