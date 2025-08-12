# Phase 3: Department Integration

## 🎯 Objectives
- Implement seven department systems
- Create progression mechanics
- Build prestige system
- Develop save/load functionality

## 📋 Tasks

### 3.1 Department System
Create `src/features/departments/departmentConfig.ts`:
```typescript
export const DEPARTMENTS = {
  engineering: {
    id: 'engineering',
    name: 'Engineering',
    icon: '⚙️',
    baseCost: 100,
    baseProduction: 1,
    multiplier: 1.15,
    description: 'Builds the software products'
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    icon: '📢',
    baseCost: 500,
    baseProduction: 5,
    multiplier: 1.14,
    description: 'Promotes products to customers'
  },
  sales: {
    id: 'sales',
    name: 'Sales',
    icon: '💼',
    baseCost: 2500,
    baseProduction: 25,
    multiplier: 1.13,
    description: 'Closes deals with clients'
  },
  support: {
    id: 'support',
    name: 'Customer Support',
    icon: '🎧',
    baseCost: 12500,
    baseProduction: 125,
    multiplier: 1.12,
    description: 'Keeps customers happy'
  },
  hr: {
    id: 'hr',
    name: 'Human Resources',
    icon: '👥',
    baseCost: 62500,
    baseProduction: 625,
    multiplier: 1.11,
    description: 'Manages company culture'
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    icon: '💰',
    baseCost: 312500,
    baseProduction: 3125,
    multiplier: 1.10,
    description: 'Handles the money flow'
  },
  executive: {
    id: 'executive',
    name: 'Executive',
    icon: '👔',
    baseCost: 1562500,
    baseProduction: 15625,
    multiplier: 1.09,
    description: 'Strategic leadership'
  }
};
```

### 3.2 Department Component
Create `src/features/departments/DepartmentCard.tsx`:
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { observer } from '@legendapp/state/react';
import { gameState$ } from '@core/state/gameState';
import { computed } from '@legendapp/state';

export const DepartmentCard = observer(({ departmentId }: { departmentId: string }) => {
  const dept = gameState$.departments[departmentId];
  const config = DEPARTMENTS[departmentId];
  
  const level = dept.level.use();
  const cost = computed(() => 
    config.baseCost * Math.pow(config.multiplier, level)
  ).use();
  
  const production = computed(() => 
    config.baseProduction * level * (1 + gameState$.prestige.level.get() * 0.1)
  ).use();
  
  const canAfford = gameState$.money.use() >= cost;
  
  const handlePurchase = () => {
    if (canAfford) {
      gameState$.money.set(prev => prev - cost);
      dept.level.set(prev => prev + 1);
    }
  };
  
  return (
    <TouchableOpacity 
      onPress={handlePurchase}
      disabled={!canAfford}
      style={[styles.container, !canAfford && styles.disabled]}
    >
      <Text style={styles.icon}>{config.icon}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{config.name} (Lvl {level})</Text>
        <Text style={styles.production}>+${production.toFixed(2)}/s</Text>
        <Text style={styles.cost}>Cost: ${cost.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#4CAF50',
    marginVertical: 8,
    borderRadius: 8
  },
  disabled: {
    backgroundColor: '#ccc'
  },
  icon: {
    fontSize: 32,
    marginRight: 16
  },
  info: {
    flex: 1
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  production: {
    fontSize: 14,
    color: '#fff'
  },
  cost: {
    fontSize: 14,
    color: '#fff'
  }
});
```

### 3.3 Prestige System
Create `src/features/prestige/prestigeService.ts`:
```typescript
import { gameState$ } from '@core/state/gameState';
import { batch } from '@legendapp/state';

export const prestigeService = {
  calculatePrestigePoints(): number {
    const valuation = gameState$.valuation.get();
    return Math.floor(Math.sqrt(valuation / 1e6));
  },
  
  canPrestige(): boolean {
    return this.calculatePrestigePoints() > gameState$.prestige.points.get();
  },
  
  doPrestige() {
    const points = this.calculatePrestigePoints();
    
    batch(() => {
      // Reset game state
      gameState$.money.set(0);
      gameState$.valuation.set(0);
      gameState$.employees.set([]);
      
      // Reset departments
      Object.keys(gameState$.departments.get()).forEach(key => {
        gameState$.departments[key].level.set(0);
      });
      
      // Award prestige
      gameState$.prestige.level.set(prev => prev + 1);
      gameState$.prestige.points.set(points);
    });
  }
};
```

### 3.4 Save/Load System
Create `src/core/services/saveService.ts`:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameState$ } from '../state/gameState';

export const saveService = {
  SAVE_KEY: 'petsoft_tycoon_save',
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  
  async save() {
    try {
      const state = gameState$.get();
      const saveData = {
        ...state,
        timestamp: Date.now(),
        version: '1.0.0'
      };
      await AsyncStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      return false;
    }
  },
  
  async load() {
    try {
      const data = await AsyncStorage.getItem(this.SAVE_KEY);
      if (data) {
        const saveData = JSON.parse(data);
        gameState$.set(saveData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Load failed:', error);
      return false;
    }
  },
  
  startAutoSave() {
    setInterval(() => {
      if (gameState$.settings.autoSave.get()) {
        this.save();
      }
    }, this.AUTO_SAVE_INTERVAL);
  }
};
```

## 🧪 Validation
```bash
# Test department purchasing
# Test prestige reset and bonuses
# Test save/load functionality

npx expo start

# Verify:
# - All 7 departments purchasable
# - Prestige resets game properly
# - Save persists after app restart
```

## ⏱️ Time Estimate
- Department system: 3 hours
- Department UI: 3 hours
- Prestige system: 3 hours
- Save/load: 3 hours
- Total: **12 hours**

## ✅ Success Criteria
- [ ] All 7 departments functional
- [ ] Progression feels balanced
- [ ] Prestige system works
- [ ] Save/load reliable
- [ ] No data loss issues