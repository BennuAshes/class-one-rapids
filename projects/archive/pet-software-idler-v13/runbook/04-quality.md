# Phase 4: Quality & Polish

## 🎯 Objectives
- Optimize performance to 60 FPS
- Add animation polish
- Integrate audio system
- Implement comprehensive testing

## 📋 Tasks

### 4.1 Performance Optimization
Create `src/core/utils/performance.ts`:
```typescript
import { enableBatching } from '@legendapp/state';
import { InteractionManager } from 'react-native';

export const performanceOptimizations = {
  // Enable Legend State batching
  initialize() {
    enableBatching({
      mode: 'auto',
      delay: 16 // One frame at 60fps
    });
  },
  
  // Defer expensive operations
  deferredUpdate(callback: () => void) {
    InteractionManager.runAfterInteractions(callback);
  },
  
  // Object pooling for particles
  particlePool: {
    pool: [] as any[],
    maxSize: 100,
    
    get() {
      return this.pool.pop() || this.create();
    },
    
    release(particle: any) {
      if (this.pool.length < this.maxSize) {
        particle.reset();
        this.pool.push(particle);
      }
    },
    
    create() {
      return { x: 0, y: 0, velocity: 0, active: false };
    }
  }
};
```

### 4.2 Animation Polish
Create `src/shared/animations/moneyAnimation.ts`:
```typescript
import { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  Easing
} from 'react-native-reanimated';

export const useMoneyAnimation = () => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  
  const trigger = () => {
    scale.value = withSpring(1.2, {}, () => {
      scale.value = withSpring(1);
    });
    
    rotate.value = withTiming(360, {
      duration: 500,
      easing: Easing.out(Easing.cubic)
    }, () => {
      rotate.value = 0;
    });
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` }
    ]
  }));
  
  return { animatedStyle, trigger };
};
```

### 4.3 Audio Integration
Create `src/core/services/audioService.ts`:
```typescript
import { Audio } from 'expo-av';
import { gameState$ } from '../state/gameState';

export const audioService = {
  sounds: {} as Record<string, Audio.Sound>,
  
  async initialize() {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false
    });
    
    await this.loadSounds();
  },
  
  async loadSounds() {
    const soundFiles = {
      click: require('../../../assets/sounds/click.mp3'),
      purchase: require('../../../assets/sounds/purchase.mp3'),
      levelUp: require('../../../assets/sounds/levelup.mp3'),
      prestige: require('../../../assets/sounds/prestige.mp3')
    };
    
    for (const [key, file] of Object.entries(soundFiles)) {
      const { sound } = await Audio.Sound.createAsync(file);
      this.sounds[key] = sound;
    }
  },
  
  async play(soundName: string) {
    if (!gameState$.settings.sfxEnabled.get()) return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  }
};
```

### 4.4 Testing Suite
Create `__tests__/gameLogic.test.ts`:
```typescript
import { gameState$ } from '../src/core/state/gameState';
import { currencyService } from '../src/features/currency/currencyService';
import { prestigeService } from '../src/features/prestige/prestigeService';

describe('Game Logic Tests', () => {
  beforeEach(() => {
    // Reset state
    gameState$.set({
      money: 0,
      valuation: 0,
      employees: [],
      departments: {},
      prestige: { level: 0, points: 0 },
      settings: { sfxEnabled: true, musicEnabled: true, autoSave: true }
    });
  });
  
  test('Currency formatting', () => {
    expect(currencyService.formatMoney(999)).toBe('$999.00');
    expect(currencyService.formatMoney(1500)).toBe('$1.50K');
    expect(currencyService.formatMoney(1500000)).toBe('$1.50M');
    expect(currencyService.formatMoney(1500000000)).toBe('$1.50B');
  });
  
  test('Income calculation', () => {
    gameState$.employees.set([
      { id: '1', productivity: 10, level: 1 },
      { id: '2', productivity: 20, level: 1 }
    ]);
    
    expect(currencyService.incomePerSecond$.get()).toBe(30);
  });
  
  test('Prestige points calculation', () => {
    gameState$.valuation.set(1000000);
    expect(prestigeService.calculatePrestigePoints()).toBe(1);
    
    gameState$.valuation.set(4000000);
    expect(prestigeService.calculatePrestigePoints()).toBe(2);
  });
  
  test('Department cost scaling', () => {
    const baseCost = 100;
    const multiplier = 1.15;
    const level = 10;
    
    const cost = baseCost * Math.pow(multiplier, level);
    expect(cost).toBeCloseTo(404.56, 2);
  });
});
```

### 4.5 Performance Monitoring
Create `src/core/utils/performanceMonitor.ts`:
```typescript
export const performanceMonitor = {
  frameCount: 0,
  lastTime: Date.now(),
  fps: 60,
  
  start() {
    const measure = () => {
      this.frameCount++;
      const now = Date.now();
      
      if (now - this.lastTime >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastTime = now;
        
        if (this.fps < 55) {
          console.warn(`Low FPS detected: ${this.fps}`);
        }
      }
      
      requestAnimationFrame(measure);
    };
    
    measure();
  }
};
```

## 🧪 Validation
```bash
# Run tests
npm test

# Performance profiling
npx react-native-performance

# Check bundle size
npx expo export --platform all --output-dir dist
du -sh dist/

# Verify 60 FPS with performance monitor
```

## ⏱️ Time Estimate
- Performance optimization: 2 hours
- Animation polish: 2 hours  
- Audio integration: 1 hour
- Testing setup: 1 hour
- Total: **6 hours**

## ✅ Success Criteria
- [ ] Consistent 60 FPS
- [ ] Smooth animations
- [ ] Audio feedback working
- [ ] >80% test coverage
- [ ] Bundle size <10MB