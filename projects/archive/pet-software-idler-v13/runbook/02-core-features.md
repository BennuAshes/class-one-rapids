# Phase 2: Core Features Implementation

## 🎯 Objectives
- Implement core game loop with 60 FPS target
- Create currency and valuation system
- Build employee management
- Develop base UI components

## 📋 Tasks

### 2.1 Game Loop Implementation
Create `src/core/services/gameLoop.ts`:
```typescript
import { gameState$ } from '../state/gameState';
import { batch } from '@legendapp/state';

class GameLoop {
  private intervalId: NodeJS.Timeout | null = null;
  private lastUpdate = Date.now();
  
  start() {
    this.intervalId = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - this.lastUpdate) / 1000;
      this.lastUpdate = now;
      
      batch(() => {
        this.update(deltaTime);
      });
    }, 1000 / 60); // 60 FPS
  }
  
  update(deltaTime: number) {
    const state = gameState$.peek();
    // Update money based on employees
    const moneyPerSecond = this.calculateIncome(state);
    gameState$.money.set(state.money + moneyPerSecond * deltaTime);
  }
  
  calculateIncome(state: any): number {
    return state.employees.reduce((sum: number, emp: any) => 
      sum + emp.productivity, 0);
  }
}

export const gameLoop = new GameLoop();
```

### 2.2 Currency System
Create `src/features/currency/currencyService.ts`:
```typescript
import { computed } from '@legendapp/state';
import { gameState$ } from '@core/state/gameState';

export const currencyService = {
  // Format money with K, M, B suffixes
  formatMoney: (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  },
  
  // Computed income per second
  incomePerSecond$: computed(() => {
    const employees = gameState$.employees.get();
    return employees.reduce((sum, emp) => sum + emp.productivity, 0);
  })
};
```

### 2.3 Employee Management
Create `src/features/employees/Employee.tsx`:
```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { observer } from '@legendapp/state/react';
import { gameState$ } from '@core/state/gameState';

export const EmployeeCard = observer(({ employee }: { employee: any }) => {
  const upgradeCost = employee.level * 100;
  const canAfford = gameState$.money.use() >= upgradeCost;
  
  const handleUpgrade = () => {
    if (canAfford) {
      gameState$.money.set(prev => prev - upgradeCost);
      employee.level++;
      employee.productivity *= 1.5;
    }
  };
  
  return (
    <TouchableOpacity 
      onPress={handleUpgrade}
      disabled={!canAfford}
      style={{ padding: 16, backgroundColor: canAfford ? '#4CAF50' : '#ccc' }}
    >
      <Text>{employee.name}</Text>
      <Text>Level: {employee.level}</Text>
      <Text>Productivity: ${employee.productivity}/s</Text>
      <Text>Upgrade: ${upgradeCost}</Text>
    </TouchableOpacity>
  );
});
```

### 2.4 Base UI Components
Create `src/shared/components/GameHeader.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { observer } from '@legendapp/state/react';
import { gameState$ } from '@core/state/gameState';
import { currencyService } from '@features/currency/currencyService';

export const GameHeader = observer(() => {
  const money = gameState$.money.use();
  const incomePerSecond = currencyService.incomePerSecond$.use();
  
  return (
    <View style={styles.container}>
      <Text style={styles.money}>
        {currencyService.formatMoney(money)}
      </Text>
      <Text style={styles.income}>
        {currencyService.formatMoney(incomePerSecond)}/s
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#2196F3'
  },
  money: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white'
  },
  income: {
    fontSize: 18,
    color: 'white'
  }
});
```

## 🧪 Validation
```bash
# Test game loop performance
# Should maintain 60 FPS
# Money should increase based on employees

# Run app and verify:
npx expo start

# Check performance with React DevTools
# FPS counter should stay at 60
```

## ⏱️ Time Estimate
- Game loop: 2 hours
- Currency system: 2 hours
- Employee management: 2 hours
- UI components: 2 hours
- Total: **8 hours**

## ✅ Success Criteria
- [ ] 60 FPS game loop running
- [ ] Money increases automatically
- [ ] Employees can be upgraded
- [ ] UI updates reactively
- [ ] No performance issues