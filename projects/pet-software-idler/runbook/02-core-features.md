# Phase 2: Core Feature Implementation

## Objective
Implement primary gameplay mechanics including code production, feature shipping, department management, and basic automation following vertical slicing architecture.

## Prerequisites
- [ ] Phase 1 completed successfully
- [ ] Legend State configured with modular observables
- [ ] Basic UI components rendering
- [ ] Testing infrastructure operational

## Work Packages

### WP 2.1: Code Production System

#### Task 2.1.1: Enhance Code Production State
Update `src/features/codeProduction/state/codeProductionState.ts`:
```typescript
import { observable, computed } from '@legendapp/state';
import { batch } from '@legendapp/state';
import Decimal from 'decimal.js';

export const codeProductionState$ = observable({
  linesOfCode: new Decimal(0),
  totalLinesProduced: new Decimal(0),
  clickPower: 1,
  workers: {
    juniorDevs: { count: 0, baseProd: 0.1, cost: new Decimal(10) },
    seniorDevs: { count: 0, baseProd: 1, cost: new Decimal(100) },
    architects: { count: 0, baseProd: 10, cost: new Decimal(1000) }
  }
});

// Computed production rate
export const productionRate$ = computed(() => {
  const workers = codeProductionState$.workers.get();
  let rate = new Decimal(0);
  
  rate = rate.plus(workers.juniorDevs.count * workers.juniorDevs.baseProd);
  rate = rate.plus(workers.seniorDevs.count * workers.seniorDevs.baseProd);
  rate = rate.plus(workers.architects.count * workers.architects.baseProd);
  
  return rate;
});
```
**Validation:** Production rate updates with worker changes
**Time:** 45 minutes

#### Task 2.1.2: Implement Auto-Production Loop
Create `src/features/codeProduction/hooks/useAutoProduction.ts`:
```typescript
import { useEffect, useRef } from 'react';
import { productionRate$, codeProductionState$ } from '../state/codeProductionState';
import { batch } from '@legendapp/state';

export function useAutoProduction() {
  const lastUpdateRef = useRef(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;
      
      const rate = productionRate$.get();
      if (rate.gt(0)) {
        batch(() => {
          const produced = rate.times(deltaTime);
          codeProductionState$.linesOfCode.set(prev => 
            prev.plus(produced)
          );
          codeProductionState$.totalLinesProduced.set(prev => 
            prev.plus(produced)
          );
        });
      }
    }, 100); // Update 10 times per second
    
    return () => clearInterval(interval);
  }, []);
}
```
**Validation:** Lines of code increase automatically with workers
**Time:** 30 minutes

#### Task 2.1.3: Create Worker Purchase UI
Create `src/features/codeProduction/components/WorkerShop.tsx`:
```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSelector } from '@legendapp/state/react';
import { codeProductionState$, purchaseWorker } from '../state/codeProductionState';

export function WorkerShop() {
  const workers = useSelector(codeProductionState$.workers);
  const linesOfCode = useSelector(codeProductionState$.linesOfCode);
  
  return (
    <View style={styles.container}>
      <WorkerButton
        type="juniorDevs"
        name="Junior Dev"
        count={workers.juniorDevs.count}
        cost={workers.juniorDevs.cost}
        canAfford={linesOfCode.gte(workers.juniorDevs.cost)}
        onPurchase={() => purchaseWorker('juniorDevs')}
      />
      {/* Repeat for other worker types */}
    </View>
  );
}
```
**Validation:** Workers can be purchased when affordable
**Time:** 45 minutes

### WP 2.2: Feature Shipping System

#### Task 2.2.1: Create Feature Shipping State
Create `src/features/featureShipping/state/featureShippingState.ts`:
```typescript
import { observable, computed } from '@legendapp/state';
import Decimal from 'decimal.js';

export const featureShippingState$ = observable({
  featuresShipped: 0,
  totalFeatures: 0,
  codePerFeature: new Decimal(10),
  moneyPerFeature: new Decimal(15),
  conversionMultiplier: 1
});

export const canShipFeature$ = computed(() => {
  const linesOfCode = codeProductionState$.linesOfCode.get();
  const required = featureShippingState$.codePerFeature.get();
  return linesOfCode.gte(required);
});
```
**Validation:** Feature shipping state tracks correctly
**Time:** 30 minutes

#### Task 2.2.2: Implement Feature Conversion Logic
Create `src/features/featureShipping/services/conversionService.ts`:
```typescript
import { batch } from '@legendapp/state';
import { codeProductionState$ } from '@features/codeProduction/state';
import { featureShippingState$ } from '../state/featureShippingState';
import { resourceState$ } from '@features/resources/state';

export function shipFeature() {
  const canShip = canShipFeature$.get();
  if (!canShip) return false;
  
  batch(() => {
    // Deduct code
    const cost = featureShippingState$.codePerFeature.get();
    codeProductionState$.linesOfCode.set(prev => prev.minus(cost));
    
    // Add feature and money
    featureShippingState$.featuresShipped.set(prev => prev + 1);
    featureShippingState$.totalFeatures.set(prev => prev + 1);
    
    const earnings = featureShippingState$.moneyPerFeature.get()
      .times(featureShippingState$.conversionMultiplier.get());
    resourceState$.money.set(prev => prev.plus(earnings));
  });
  
  return true;
}
```
**Validation:** Features convert code to money correctly
**Time:** 30 minutes

#### Task 2.2.3: Create Ship Feature Button
Create `src/features/featureShipping/components/ShipFeatureButton.tsx`:
```typescript
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useSelector } from '@legendapp/state/react';
import { canShipFeature$ } from '../state/featureShippingState';
import { shipFeature } from '../services/conversionService';
import { playSound } from '@shared/feedback/audio';

export function ShipFeatureButton() {
  const canShip = useSelector(canShipFeature$);
  const scale = useSharedValue(1);
  
  const handlePress = async () => {
    if (shipFeature()) {
      scale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      await playSound('cashRegister');
    }
  };
  
  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <Pressable
        style={[styles.button, !canShip && styles.disabled]}
        onPress={handlePress}
        disabled={!canShip}
      >
        <Text style={styles.text}>Ship Feature 🚀</Text>
      </Pressable>
    </Animated.View>
  );
}
```
**Validation:** Button ships features with feedback
**Time:** 30 minutes

### WP 2.3: Department System Foundation

#### Task 2.3.1: Create Department State Structure
Create `src/features/departments/state/departmentState.ts`:
```typescript
import { observable } from '@legendapp/state';
import Decimal from 'decimal.js';

export interface Department {
  id: string;
  name: string;
  unlocked: boolean;
  unlockCost: Decimal;
  workers: number;
  managers: number;
  baseProduction: number;
  efficiency: number;
}

export const departmentState$ = observable({
  departments: {
    development: {
      id: 'development',
      name: 'Development',
      unlocked: true,
      unlockCost: new Decimal(0),
      workers: 0,
      managers: 0,
      baseProduction: 0.1,
      efficiency: 1
    },
    sales: {
      id: 'sales',
      name: 'Sales',
      unlocked: false,
      unlockCost: new Decimal(500),
      workers: 0,
      managers: 0,
      baseProduction: 0.2,
      efficiency: 1
    },
    customerExperience: {
      id: 'customerExperience',
      name: 'Customer Experience',
      unlocked: false,
      unlockCost: new Decimal(2000),
      workers: 0,
      managers: 0,
      baseProduction: 0.15,
      efficiency: 1
    }
    // Add remaining departments...
  }
});
```
**Validation:** Department state structure correct
**Time:** 45 minutes

#### Task 2.3.2: Implement Department Unlocking
Create `src/features/departments/services/departmentService.ts`:
```typescript
import { batch } from '@legendapp/state';
import { departmentState$ } from '../state/departmentState';
import { resourceState$ } from '@features/resources/state';

export function unlockDepartment(departmentId: string): boolean {
  const dept = departmentState$.departments[departmentId].get();
  const money = resourceState$.money.get();
  
  if (!dept || dept.unlocked || money.lt(dept.unlockCost)) {
    return false;
  }
  
  batch(() => {
    resourceState$.money.set(prev => prev.minus(dept.unlockCost));
    departmentState$.departments[departmentId].unlocked.set(true);
  });
  
  // Trigger unlock animation/celebration
  return true;
}

export function hireDepartmentWorker(departmentId: string): boolean {
  const dept = departmentState$.departments[departmentId].get();
  if (!dept?.unlocked) return false;
  
  const cost = calculateWorkerCost(dept.workers);
  const money = resourceState$.money.get();
  
  if (money.lt(cost)) return false;
  
  batch(() => {
    resourceState$.money.set(prev => prev.minus(cost));
    departmentState$.departments[departmentId].workers.set(prev => prev + 1);
  });
  
  return true;
}
```
**Validation:** Departments unlock and hire correctly
**Time:** 45 minutes

#### Task 2.3.3: Create Department UI Components
Create `src/features/departments/components/DepartmentCard.tsx`:
```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSelector } from '@legendapp/state/react';
import { Department } from '../state/departmentState';

interface Props {
  departmentId: string;
}

export function DepartmentCard({ departmentId }: Props) {
  const dept = useSelector(departmentState$.departments[departmentId]);
  const money = useSelector(resourceState$.money);
  
  if (!dept.unlocked && money.lt(dept.unlockCost)) {
    return (
      <View style={[styles.card, styles.locked]}>
        <Text style={styles.lockedText}>
          🔒 Unlock for ${dept.unlockCost.toString()}
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{dept.name}</Text>
      <Text>Workers: {dept.workers}</Text>
      <Text>Managers: {dept.managers}</Text>
      <Text>Production: {calculateProduction(dept)}/s</Text>
      
      <Pressable
        style={styles.hireButton}
        onPress={() => hireDepartmentWorker(departmentId)}
      >
        <Text>Hire Worker</Text>
      </Pressable>
    </View>
  );
}
```
**Validation:** Department cards display and interact correctly
**Time:** 45 minutes

### WP 2.4: Resource Management System

#### Task 2.4.1: Create Unified Resource State
Create `src/features/resources/state/resourceState.ts`:
```typescript
import { observable, computed } from '@legendapp/state';
import Decimal from 'decimal.js';

export const resourceState$ = observable({
  money: new Decimal(0),
  customerLeads: new Decimal(0),
  bugs: new Decimal(0),
  designs: new Decimal(0),
  testCoverage: 0,
  marketingReach: new Decimal(0)
});

// Computed values for UI display
export const formattedResources$ = computed(() => {
  const resources = resourceState$.get();
  return {
    money: formatNumber(resources.money),
    customerLeads: formatNumber(resources.customerLeads),
    // ... other formatted values
  };
});

function formatNumber(value: Decimal): string {
  if (value.gte(1e12)) return `${value.div(1e12).toFixed(2)}T`;
  if (value.gte(1e9)) return `${value.div(1e9).toFixed(2)}B`;
  if (value.gte(1e6)) return `${value.div(1e6).toFixed(2)}M`;
  if (value.gte(1e3)) return `${value.div(1e3).toFixed(2)}K`;
  return value.toFixed(0);
}
```
**Validation:** Resources track and format correctly
**Time:** 30 minutes

#### Task 2.4.2: Create Resource Display Component
Create `src/features/resources/components/ResourceDisplay.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from '@legendapp/state/react';
import { formattedResources$ } from '../state/resourceState';
import { codeProductionState$ } from '@features/codeProduction/state';

export function ResourceDisplay() {
  const resources = useSelector(formattedResources$);
  const linesOfCode = useSelector(() => 
    formatNumber(codeProductionState$.linesOfCode.get())
  );
  
  return (
    <View style={styles.container}>
      <ResourceItem icon="💵" label="Money" value={resources.money} />
      <ResourceItem icon="💻" label="Code" value={linesOfCode} />
      <ResourceItem icon="👥" label="Leads" value={resources.customerLeads} />
    </View>
  );
}

function ResourceItem({ icon, label, value }) {
  return (
    <View style={styles.item}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}
```
**Validation:** Resources display with proper formatting
**Time:** 30 minutes

### WP 2.5: Basic Game Loop Integration

#### Task 2.5.1: Create Game Loop Manager
Create `src/app/services/gameLoop.ts`:
```typescript
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { batch } from '@legendapp/state';
import { updateDepartmentProduction } from '@features/departments/services';
import { checkAchievements } from '@features/achievements/services';
import { saveGame } from '@features/saving/services';

export function useGameLoop() {
  const lastUpdateRef = useRef(Date.now());
  const saveTimerRef = useRef(0);
  
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;
      
      batch(() => {
        // Update all department productions
        updateDepartmentProduction(deltaTime);
        
        // Check achievements
        checkAchievements();
      });
      
      // Auto-save every 30 seconds
      saveTimerRef.current += deltaTime;
      if (saveTimerRef.current >= 30) {
        saveGame();
        saveTimerRef.current = 0;
      }
    }, 100);
    
    // Handle app state changes
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background') {
        saveGame();
      }
    });
    
    return () => {
      clearInterval(gameLoop);
      subscription.remove();
    };
  }, []);
}
```
**Validation:** Game loop updates all systems
**Time:** 45 minutes

#### Task 2.5.2: Integrate Game Loop in App
Update `App.tsx`:
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GameScreen } from '@app/screens/GameScreen';
import { useGameLoop } from '@app/services/gameLoop';
import { useAutoProduction } from '@features/codeProduction/hooks';
import { loadGame } from '@features/saving/services';

const Stack = createNativeStackNavigator();

export default function App() {
  // Initialize game systems
  useGameLoop();
  useAutoProduction();
  
  React.useEffect(() => {
    loadGame();
  }, []);
  
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ title: 'PetSoft Tycoon' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```
**Validation:** App integrates all game systems
**Time:** 30 minutes

## Testing Requirements

### Unit Tests
Create tests for each feature:
- Code production calculations
- Feature shipping transactions
- Department unlocking logic
- Resource formatting

### Integration Tests
- Game loop updates all systems
- State persistence works
- Cross-feature interactions

## Phase Completion Checklist

### Core Mechanics
- [ ] Click to produce code working
- [ ] Auto-production with workers functional
- [ ] Feature shipping converts resources
- [ ] Money generation from features

### Department System
- [ ] Three departments implemented
- [ ] Unlock system working
- [ ] Worker hiring functional
- [ ] Production rates calculate correctly

### Resource Management
- [ ] All resource types tracked
- [ ] Number formatting works
- [ ] Resource display updates reactively
- [ ] Decimal.js prevents precision issues

### Game Loop
- [ ] Main loop runs at 10 FPS
- [ ] All systems update correctly
- [ ] Auto-save every 30 seconds
- [ ] Background save on app state change

### UI Components
- [ ] Code button with animations
- [ ] Ship feature button with feedback
- [ ] Department cards display correctly
- [ ] Resource display formatted properly

## Success Metrics
- 60 FPS maintained during gameplay
- All state updates are reactive
- No memory leaks after extended play
- Save/load preserves game state

## Next Phase Dependencies
Phase 3 can begin with:
- Department synergies
- Manager automation
- Offline progression
- Achievement system
- Prestige mechanics

## Time Summary
**Total Estimated Time:** 7.5 hours
**Recommended Schedule:** Complete over 2-3 days with testing between major features