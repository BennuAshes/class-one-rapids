# Phase 2: Core Game Features

## Objectives
- Implement fundamental game loop mechanics
- Create resource management system with Legend State
- Build click interaction and automation
- Develop essential UI components with animations

## Prerequisites
- Phase 1 Foundation completed ✅
- Basic Expo project running ✅
- Legend State configured and tested ✅

## Tasks Checklist

### 1. Core Game Loop Implementation

- [ ] **Create Game Engine Service**
  ```typescript
  // src/features/game-core/services/gameEngine.ts
  import { gameState$ } from '../state/gameState$';
  import { departmentState$ } from '../../departments/state/departmentState$';
  import { batch } from '@legendapp/state';
  
  export class GameEngine {
    private static gameLoopInterval: NodeJS.Timeout | null = null;
    
    static start() {
      this.gameLoopInterval = setInterval(() => {
        this.updateProduction();
      }, 100); // 10 FPS game logic update
    }
    
    static stop() {
      if (this.gameLoopInterval) {
        clearInterval(this.gameLoopInterval);
        this.gameLoopInterval = null;
      }
    }
    
    private static updateProduction() {
      const departments = departmentState$.get();
      let codeProduction = 0;
      let featureProduction = 0;
      let moneyProduction = 0;
      let leadProduction = 0;
      
      // Calculate production from all departments
      Object.entries(departments).forEach(([deptName, dept]) => {
        if (!dept.unlocked) return;
        
        Object.entries(dept.employees).forEach(([empType, emp]) => {
          const count = emp.count;
          const baseProduction = emp.production;
          
          // Apply manager bonuses
          const managerMultiplier = dept.manager?.hired ? 2.0 : 1.0;
          const production = baseProduction * count * managerMultiplier;
          
          // Department-specific resource allocation
          switch (deptName) {
            case 'development':
              codeProduction += production;
              break;
            case 'sales':
              leadProduction += production;
              moneyProduction += production * 0.5;
              break;
            // Add other departments...
          }
        });
      });
      
      // Batch update for 40% performance improvement
      batch(() => {
        gameState$.resources.code.set(prev => prev + (codeProduction * 0.1));
        gameState$.resources.features.set(prev => prev + (featureProduction * 0.1));
        gameState$.resources.money.set(prev => prev + (moneyProduction * 0.1));
        gameState$.resources.leads.set(prev => prev + (leadProduction * 0.1));
      });
    }
  }
  ```

- [ ] **Create Game Loop Hook**
  ```typescript
  // src/features/game-core/hooks/useGameLoop.ts
  import { useEffect } from 'react';
  import { GameEngine } from '../services/gameEngine';
  import { gameState$ } from '../state/gameState$';
  
  export const useGameLoop = () => {
    useEffect(() => {
      GameEngine.start();
      
      return () => {
        GameEngine.stop();
      };
    }, []);
    
    // Return current game state for components
    return {
      resources: gameState$.resources.get(),
      performance: gameState$.performance.get(),
      settings: gameState$.settings.get()
    };
  };
  ```

### 2. Click Mechanics and Progression

- [ ] **Implement Click Handler**
  ```typescript
  // src/features/game-core/hooks/useClickHandling.ts
  import { useCallback } from 'react';
  import { gameState$ } from '../state/gameState$';
  import { batch } from '@legendapp/state';
  
  export const useClickHandling = () => {
    const handleClick = useCallback(() => {
      const currentCode = gameState$.resources.code.get();
      const clickPower = 1 + Math.floor(currentCode / 100) * 0.1; // Scale with progress
      
      batch(() => {
        gameState$.resources.code.set(prev => prev + clickPower);
        gameState$.meta.totalClicks.set(prev => prev + 1);
      });
      
      // Trigger click animation and sound
      return { clickPower, position: { x: 0, y: 0 } };
    }, []);
    
    return { handleClick };
  };
  ```

- [ ] **Create Main Click Button Component**
  ```typescript
  // src/features/game-core/components/ClickButton.tsx
  import React from 'react';
  import { Pressable, Text, StyleSheet } from 'react-native';
  import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withSequence, 
    withTiming 
  } from 'react-native-reanimated';
  import { observer } from '@legendapp/state/react';
  import { useClickHandling } from '../hooks/useClickHandling';
  
  const ClickButton = observer(() => {
    const { handleClick } = useClickHandling();
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));
    
    const onPress = () => {
      const result = handleClick();
      
      // Animate button press
      scale.value = withSequence(
        withTiming(1.1, { duration: 50 }),
        withTiming(1.0, { duration: 100 })
      );
      
      opacity.value = withSequence(
        withTiming(0.8, { duration: 50 }),
        withTiming(1.0, { duration: 100 })
      );
    };
    
    return (
      <Pressable onPress={onPress}>
        <Animated.View style={[styles.button, animatedStyle]}>
          <Text style={styles.buttonText}>Code!</Text>
        </Animated.View>
      </Pressable>
    );
  });
  
  const styles = StyleSheet.create({
    button: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
  
  export default ClickButton;
  ```

### 3. Resource Management UI

- [ ] **Create Resource Counter Component**
  ```typescript
  // src/features/ui/components/ResourceCounter.tsx
  import React, { useMemo } from 'react';
  import { View, Text, StyleSheet } from 'react-native';
  import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withTiming 
  } from 'react-native-reanimated';
  import { observer } from '@legendapp/state/react';
  import { formatNumber } from '../utils/formatters';
  
  interface ResourceCounterProps {
    type: 'code' | 'features' | 'money' | 'leads';
    value: number;
    growth?: number;
    icon?: string;
  }
  
  const ResourceCounter = observer<ResourceCounterProps>(({ 
    type, 
    value, 
    growth = 0, 
    icon = '💰' 
  }) => {
    const formattedValue = useMemo(() => formatNumber(value), [value]);
    const scale = useSharedValue(1);
    
    // Animate on value change
    React.useEffect(() => {
      scale.value = withTiming(1.1, { duration: 100 }, () => {
        scale.value = withTiming(1.0, { duration: 100 });
      });
    }, [value]);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
    
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>{icon}</Text>
        <Animated.Text style={[styles.value, animatedStyle]}>
          {formattedValue}
        </Animated.Text>
        <Text style={styles.type}>{type.toUpperCase()}</Text>
        {growth > 0 && (
          <Text style={styles.growth}>+{formatNumber(growth)}/s</Text>
        )}
      </View>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      padding: 10,
      margin: 5,
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      minWidth: 80,
    },
    icon: {
      fontSize: 20,
      marginBottom: 4,
    },
    value: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    type: {
      fontSize: 10,
      color: '#666',
      marginTop: 2,
    },
    growth: {
      fontSize: 8,
      color: '#4CAF50',
      marginTop: 2,
    },
  });
  
  export default ResourceCounter;
  ```

- [ ] **Create Resource Bar Component**
  ```typescript
  // src/features/ui/components/ResourceBar.tsx
  import React from 'react';
  import { View, StyleSheet } from 'react-native';
  import { observer } from '@legendapp/state/react';
  import { gameState$ } from '../../game-core/state/gameState$';
  import ResourceCounter from './ResourceCounter';
  
  const ResourceBar = observer(() => {
    const resources = gameState$.resources.get();
    
    return (
      <View style={styles.container}>
        <ResourceCounter 
          type="code" 
          value={resources.code} 
          icon="💻"
        />
        <ResourceCounter 
          type="features" 
          value={resources.features} 
          icon="⚡"
        />
        <ResourceCounter 
          type="money" 
          value={resources.money} 
          icon="💰"
        />
        <ResourceCounter 
          type="leads" 
          value={resources.leads} 
          icon="📈"
        />
      </View>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: '#fff',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
  });
  
  export default ResourceBar;
  ```

### 4. Progress Tracking System

- [ ] **Create Progress Bar Component**
  ```typescript
  // src/features/ui/components/ProgressBar.tsx
  import React from 'react';
  import { View, Text, StyleSheet } from 'react-native';
  import Animated, { 
    useAnimatedStyle, 
    withTiming 
  } from 'react-native-reanimated';
  
  interface ProgressBarProps {
    current: number;
    target: number;
    label: string;
    color?: string;
  }
  
  const ProgressBar: React.FC<ProgressBarProps> = ({ 
    current, 
    target, 
    label, 
    color = '#4CAF50' 
  }) => {
    const progress = Math.min(current / target, 1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      width: withTiming(`${progress * 100}%`, { duration: 300 }),
    }));
    
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.progressTrack}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { backgroundColor: color },
              animatedStyle
            ]} 
          />
        </View>
        <Text style={styles.fraction}>
          {Math.floor(current)}/{target}
        </Text>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      margin: 10,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 5,
    },
    progressTrack: {
      height: 8,
      backgroundColor: '#e0e0e0',
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    fraction: {
      fontSize: 12,
      color: '#666',
      textAlign: 'right',
      marginTop: 2,
    },
  });
  
  export default ProgressBar;
  ```

### 5. Basic Achievement System

- [ ] **Create Achievement State**
  ```typescript
  // src/features/achievements/state/achievementState$.ts
  import { observable } from '@legendapp/state';
  
  export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
    target: number;
    reward?: {
      type: 'multiplier' | 'bonus';
      value: number;
    };
  }
  
  export const achievementState$ = observable({
    achievements: [
      {
        id: 'first_click',
        title: 'First Steps',
        description: 'Write your first line of code',
        icon: '👶',
        unlocked: false,
        progress: 0,
        target: 1,
      },
      {
        id: 'code_master',
        title: 'Code Master',
        description: 'Write 1000 lines of code',
        icon: '💻',
        unlocked: false,
        progress: 0,
        target: 1000,
      },
      // Add more achievements...
    ] as Achievement[],
    
    get unlockedCount() {
      return this.achievements.filter(a => a.unlocked).length;
    },
    
    get totalCount() {
      return this.achievements.length;
    }
  });
  ```

- [ ] **Create Achievement Checker Service**
  ```typescript
  // src/features/achievements/services/achievementChecker.ts
  import { achievementState$ } from '../state/achievementState$';
  import { gameState$ } from '../../game-core/state/gameState$';
  
  export class AchievementChecker {
    static checkAchievements() {
      const resources = gameState$.resources.get();
      const achievements = achievementState$.achievements.get();
      
      achievements.forEach((achievement, index) => {
        if (achievement.unlocked) return;
        
        let progress = 0;
        
        switch (achievement.id) {
          case 'first_click':
            progress = resources.code > 0 ? 1 : 0;
            break;
          case 'code_master':
            progress = resources.code;
            break;
        }
        
        // Update progress
        achievementState$.achievements[index].progress.set(progress);
        
        // Check if unlocked
        if (progress >= achievement.target) {
          achievementState$.achievements[index].unlocked.set(true);
          this.triggerAchievementNotification(achievement);
        }
      });
    }
    
    private static triggerAchievementNotification(achievement: any) {
      // Trigger toast notification
      console.log(`Achievement unlocked: ${achievement.title}`);
    }
  }
  ```

### 6. Updated Main Game Screen

- [ ] **Enhanced Game Screen**
  ```typescript
  // app/game.tsx
  import React, { useEffect } from 'react';
  import { View, StyleSheet, SafeAreaView } from 'react-native';
  import { observer } from '@legendapp/state/react';
  import ResourceBar from '../src/features/ui/components/ResourceBar';
  import ClickButton from '../src/features/game-core/components/ClickButton';
  import { useGameLoop } from '../src/features/game-core/hooks/useGameLoop';
  import { AchievementChecker } from '../src/features/achievements/services/achievementChecker';
  
  const GameScreen = observer(() => {
    const { resources, performance } = useGameLoop();
    
    useEffect(() => {
      // Check achievements every second
      const achievementInterval = setInterval(() => {
        AchievementChecker.checkAchievements();
      }, 1000);
      
      return () => clearInterval(achievementInterval);
    }, []);
    
    return (
      <SafeAreaView style={styles.container}>
        <ResourceBar />
        
        <View style={styles.gameArea}>
          <ClickButton />
        </View>
        
        <View style={styles.debugInfo}>
          <Text>FPS: {performance.fps}</Text>
        </View>
      </SafeAreaView>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f9fa',
    },
    gameArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    debugInfo: {
      position: 'absolute',
      top: 50,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 5,
      borderRadius: 5,
    },
  });
  
  export default GameScreen;
  ```

### 7. Performance Optimization

- [ ] **Implement Batch Updates**
  ```typescript
  // src/features/game-core/services/batchUpdater.ts
  import { batch } from '@legendapp/state';
  import { gameState$ } from '../state/gameState$';
  
  export class BatchUpdater {
    private static updateQueue: (() => void)[] = [];
    private static isProcessing = false;
    
    static queueUpdate(updateFn: () => void) {
      this.updateQueue.push(updateFn);
      
      if (!this.isProcessing) {
        this.processQueue();
      }
    }
    
    private static processQueue() {
      this.isProcessing = true;
      
      requestAnimationFrame(() => {
        if (this.updateQueue.length > 0) {
          batch(() => {
            while (this.updateQueue.length > 0) {
              const update = this.updateQueue.shift();
              update?.();
            }
          });
        }
        
        this.isProcessing = false;
        
        if (this.updateQueue.length > 0) {
          this.processQueue();
        }
      });
    }
  }
  ```

### 8. Testing and Validation

- [ ] **Create Test Utilities**
  ```typescript
  // src/__tests__/testUtils.ts
  import { gameState$ } from '../features/game-core/state/gameState$';
  
  export const resetGameState = () => {
    gameState$.resources.set({
      code: 0,
      features: 0,
      money: 0,
      leads: 0,
    });
  };
  
  export const setTestResources = (resources: Partial<typeof gameState$.resources>) => {
    Object.entries(resources).forEach(([key, value]) => {
      gameState$.resources[key as keyof typeof gameState$.resources].set(value);
    });
  };
  ```

## Validation Criteria

### Must Pass ✅
- [ ] Game loop runs at consistent 10 FPS (logic updates)
- [ ] Click button responds with <50ms latency
- [ ] Resource counters animate smoothly on updates
- [ ] Performance monitor shows stable 60 FPS UI
- [ ] Achievement system triggers correctly

### Should Pass ⚠️
- [ ] Batch updates improve performance measurably
- [ ] Memory usage stays under target limits
- [ ] No animation stuttering on mid-range devices
- [ ] State persistence works between app restarts

### Nice to Have 💡
- [ ] Click animations feel satisfying and premium
- [ ] Resource growth calculations are mathematically sound
- [ ] Achievement unlock timing feels rewarding
- [ ] Debug information helps with development

## Testing Commands

```bash
# Performance testing
npm run android # Test on Android device
npm run ios     # Test on iOS simulator

# Component testing
npm test

# Memory leak detection
# Use React DevTools Profiler
```

## Troubleshooting

### Performance Issues
- **Symptom**: Frame drops below 60 FPS
- **Solution**: Check batch update implementation
- **Command**: Monitor with `performance.fps` value

### State Update Delays
- **Symptom**: UI not reflecting state changes
- **Solution**: Verify observer pattern usage
- **Command**: Check component is wrapped with `observer()`

### Animation Stuttering
- **Symptom**: Reanimated animations skip frames
- **Solution**: Use worklet functions for heavy calculations
- **Command**: Add `'worklet'` directive to animation functions

## Deliverables

### 1. Functional Game Core
- ✅ Working click mechanics with satisfying feedback
- ✅ Real-time resource tracking and display
- ✅ Game loop running efficiently

### 2. UI Components
- ✅ Resource bar with animated counters
- ✅ Click button with press animations
- ✅ Progress tracking components

### 3. Achievement System
- ✅ Basic achievement tracking
- ✅ Progress calculation and unlocking
- ✅ Foundation for notifications

## Next Phase
Once core features are working smoothly, proceed to **Phase 3: Department Systems** (`03-integration.md`)

**Estimated Duration**: 3-4 days
**Core Features Complete**: ✅/❌ (update after validation)