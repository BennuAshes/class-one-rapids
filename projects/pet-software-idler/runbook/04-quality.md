# Phase 4: Quality Assurance

## Objective
Ensure code quality through comprehensive testing, performance optimization, polish implementation, and bug fixes to achieve production-ready status.

## Prerequisites
- [ ] All core features implemented (Phases 1-3)
- [ ] Integration complete
- [ ] Basic game loop functional
- [ ] Save system operational

## Work Packages

### WP 4.1: Unit Testing Coverage

#### Task 4.1.1: Test State Management
Create comprehensive tests for Legend State observables:
```typescript
// src/features/codeProduction/__tests__/codeProductionState.test.ts
import { codeProductionState$, codeProductionActions } from '../state/codeProductionState';
import { batch } from '@legendapp/state';

describe('Code Production State', () => {
  beforeEach(() => {
    // Reset state before each test
    batch(() => {
      codeProductionState$.linesOfCode.set(new Decimal(0));
      codeProductionState$.workers.juniorDevs.count.set(0);
    });
  });
  
  describe('Manual Production', () => {
    test('writeCode increments by click power', () => {
      codeProductionState$.clickPower.set(5);
      codeProductionActions.writeCode();
      
      expect(codeProductionState$.linesOfCode.get().toNumber()).toBe(5);
    });
    
    test('tracks total lines produced', () => {
      const initial = codeProductionState$.totalLinesProduced.get();
      codeProductionActions.writeCode();
      codeProductionActions.writeCode();
      
      const total = codeProductionState$.totalLinesProduced.get();
      expect(total.minus(initial).toNumber()).toBe(2);
    });
  });
  
  describe('Worker Management', () => {
    test('purchasing worker deducts correct cost', () => {
      codeProductionState$.linesOfCode.set(new Decimal(100));
      const success = purchaseWorker('juniorDevs');
      
      expect(success).toBe(true);
      expect(codeProductionState$.linesOfCode.get().toNumber()).toBe(90);
      expect(codeProductionState$.workers.juniorDevs.count.get()).toBe(1);
    });
    
    test('cannot purchase worker without funds', () => {
      codeProductionState$.linesOfCode.set(new Decimal(5));
      const success = purchaseWorker('juniorDevs');
      
      expect(success).toBe(false);
      expect(codeProductionState$.workers.juniorDevs.count.get()).toBe(0);
    });
  });
});
```
**Validation:** All state mutations tested
**Time:** 60 minutes

#### Task 4.1.2: Test Business Logic
Create tests for game mechanics:
```typescript
// src/features/featureShipping/__tests__/conversionService.test.ts
describe('Feature Shipping Service', () => {
  test('ships feature with correct resource exchange', () => {
    codeProductionState$.linesOfCode.set(new Decimal(50));
    resourceState$.money.set(new Decimal(0));
    
    const success = shipFeature();
    
    expect(success).toBe(true);
    expect(codeProductionState$.linesOfCode.get().toNumber()).toBe(40);
    expect(resourceState$.money.get().toNumber()).toBe(15);
  });
  
  test('applies synergy multipliers', () => {
    featureShippingState$.conversionMultiplier.set(2);
    codeProductionState$.linesOfCode.set(new Decimal(10));
    
    shipFeature();
    
    expect(resourceState$.money.get().toNumber()).toBe(30); // 15 * 2
  });
});
```
**Validation:** Business logic works correctly
**Time:** 45 minutes

### WP 4.2: Integration Testing

#### Task 4.2.1: Test Feature Interactions
```typescript
// src/__tests__/integration/gameFlow.test.ts
describe('Game Flow Integration', () => {
  test('complete early game progression', async () => {
    // Start fresh
    resetGameState();
    
    // Manual clicking phase
    for (let i = 0; i < 10; i++) {
      codeProductionActions.writeCode();
    }
    expect(codeProductionState$.linesOfCode.get().toNumber()).toBe(10);
    
    // Ship first feature
    const shipped = shipFeature();
    expect(shipped).toBe(true);
    expect(resourceState$.money.get().toNumber()).toBe(15);
    
    // Buy first worker
    codeProductionState$.linesOfCode.set(new Decimal(10));
    purchaseWorker('juniorDevs');
    
    // Simulate time passing
    await simulateGameTime(10); // 10 seconds
    
    // Check auto-production worked
    expect(codeProductionState$.linesOfCode.get().gt(0)).toBe(true);
  });
  
  test('department unlocking flow', () => {
    resourceState$.money.set(new Decimal(500));
    
    const unlocked = unlockDepartment('sales');
    expect(unlocked).toBe(true);
    expect(departmentState$.departments.sales.unlocked.get()).toBe(true);
    
    // Check event was emitted
    expect(eventBus$.events.get()).toContainEqual(
      expect.objectContaining({ type: 'DEPARTMENT_UNLOCKED' })
    );
  });
});
```
**Validation:** Features work together correctly
**Time:** 45 minutes

#### Task 4.2.2: Test Save/Load Integrity
```typescript
describe('Save System Integration', () => {
  test('saves and restores complete game state', async () => {
    // Set up game state
    codeProductionState$.linesOfCode.set(new Decimal(12345));
    departmentState$.departments.sales.unlocked.set(true);
    achievementState$.unlocked.add('first_feature');
    
    // Save game
    await saveGame();
    
    // Reset state
    resetGameState();
    expect(codeProductionState$.linesOfCode.get().toNumber()).toBe(0);
    
    // Load game
    await loadGame();
    
    // Verify restoration
    expect(codeProductionState$.linesOfCode.get().toNumber()).toBe(12345);
    expect(departmentState$.departments.sales.unlocked.get()).toBe(true);
    expect(achievementState$.unlocked.has('first_feature')).toBe(true);
  });
});
```
**Validation:** Save/load preserves all data
**Time:** 30 minutes

### WP 4.3: End-to-End Testing with Maestro

#### Task 4.3.1: Set Up Maestro for Expo
```bash
# Install Maestro CLI
curl -Ls "https://get.maestro.mobile.dev" | bash

# Create maestro directory
mkdir maestro
cd maestro
```

Create `maestro/early-game.yaml`:
```yaml
appId: com.yourcompany.petsofttycoon
---
- launchApp

# Test initial clicking
- assertVisible: "PetSoft Tycoon"
- assertVisible: "Lines of Code: 0"

- tapOn: "WRITE CODE"
- assertVisible: "Lines of Code: 1"

# Rapid clicking
- repeat:
    times: 10
    commands:
      - tapOn: "WRITE CODE"

- assertVisible: 
    text: "Lines of Code: 11"

# Ship first feature
- tapOn: "Ship Feature"
- assertVisible:
    text: "Money: $15"

# Purchase worker
- tapOn: "Hire Junior Dev"
- assertVisible: "Junior Devs: 1"

# Wait for auto-production
- wait:
    seconds: 5
    
- assertNotVisible:
    text: "Lines of Code: 0"
```
**Validation:** E2E tests pass on device
**Time:** 45 minutes

#### Task 4.3.2: Create Critical Path Tests
Create `maestro/critical-paths.yaml`:
```yaml
appId: com.yourcompany.petsofttycoon
---
# Test department unlocking
- launchApp
- runScript: scripts/give-money.js
- tapOn: "Sales"
- tapOn: "Unlock Department"
- assertVisible: "Sales Department"

# Test manager automation
- tapOn: "Hire Manager"
- wait:
    seconds: 10
- assertNotVisible: "Lines of Code: 0"

# Test prestige flow
- runScript: scripts/reach-prestige.js
- tapOn: "Prestige"
- tapOn: "Confirm Reset"
- assertVisible: "Investor Points: 10"
```
**Validation:** Critical paths work end-to-end
**Time:** 45 minutes

### WP 4.4: Performance Optimization

#### Task 4.4.1: Profile and Optimize Renders
```typescript
// Add React DevTools profiling
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  if (actualDuration > 16) { // More than one frame
    console.warn(`Slow render in ${id}: ${actualDuration}ms`);
  }
}

// Wrap components in Profiler
<Profiler id="GameScreen" onRender={onRenderCallback}>
  <GameScreen />
</Profiler>

// Optimize with React.memo
export const ResourceDisplay = React.memo(
  ResourceDisplayComponent,
  (prevProps, nextProps) => {
    // Custom comparison for performance
    return prevProps.value === nextProps.value;
  }
);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  codeProductionActions.writeCode();
}, []);
```
**Validation:** Renders stay under 16ms
**Time:** 60 minutes

#### Task 4.4.2: Optimize State Updates
```typescript
// Batch related updates
export function complexGameAction() {
  batch(() => {
    // All state changes in one batch
    codeProductionState$.linesOfCode.set(prev => prev.minus(100));
    resourceState$.money.set(prev => prev.plus(150));
    statisticsState$.actionsPerformed.set(prev => prev + 1);
  });
}

// Use shallow selectors
const linesOfCode = useSelector(() => 
  codeProductionState$.linesOfCode.get().toNumber()
);

// Throttle rapid updates
const throttledUpdate = useMemo(
  () => throttle(updateFunction, 100),
  []
);
```
**Validation:** State updates are performant
**Time:** 45 minutes

### WP 4.5: Polish and Animations

#### Task 4.5.1: Add Smooth Animations
```typescript
// src/shared/feedback/animations.ts
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export function usePulseAnimation() {
  const scale = useSharedValue(1);
  
  const pulse = () => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
  };
  
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return { pulse, style };
}

// Number ticker animation
export function NumberTicker({ value }: { value: number }) {
  const animatedValue = useSharedValue(0);
  
  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);
  
  const animatedProps = useAnimatedProps(() => ({
    text: Math.floor(animatedValue.value).toString(),
  }));
  
  return <AnimatedText animatedProps={animatedProps} />;
}
```
**Validation:** Animations are smooth at 60 FPS
**Time:** 45 minutes

#### Task 4.5.2: Add Audio Feedback
```typescript
// src/shared/feedback/audio.ts
import { Audio } from 'expo-av';

const sounds = new Map<string, Audio.Sound>();

export async function loadSounds() {
  const soundFiles = {
    click: require('@assets/sounds/click.mp3'),
    cashRegister: require('@assets/sounds/cash.mp3'),
    achievement: require('@assets/sounds/achievement.mp3'),
    // ... other sounds
  };
  
  for (const [key, file] of Object.entries(soundFiles)) {
    const { sound } = await Audio.Sound.createAsync(file);
    sounds.set(key, sound);
  }
}

export async function playSound(name: string) {
  const sound = sounds.get(name);
  if (sound) {
    await sound.replayAsync();
  }
}

// Haptic feedback
import * as Haptics from 'expo-haptics';

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  const impactType = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
  };
  
  Haptics.impactAsync(impactType[type]);
}
```
**Validation:** Audio and haptics work correctly
**Time:** 30 minutes

### WP 4.6: Bug Fixes and Edge Cases

#### Task 4.6.1: Handle Edge Cases
```typescript
// Prevent negative values
export function safeSubtract(current: Decimal, amount: Decimal): Decimal {
  const result = current.minus(amount);
  return result.lt(0) ? new Decimal(0) : result;
}

// Handle very large numbers
export function formatLargeNumber(value: Decimal): string {
  if (value.gte('1e308')) return '∞';
  if (value.gte('1e100')) {
    const exp = value.e;
    const mantissa = value.div(new Decimal(10).pow(exp));
    return `${mantissa.toFixed(2)}e${exp}`;
  }
  // Standard formatting for smaller numbers
  return formatNumber(value);
}

// Validate save data
export function validateSaveData(data: any): boolean {
  try {
    // Check required fields
    if (!data.version || !data.timestamp) return false;
    
    // Check data types
    if (typeof data.gameState !== 'object') return false;
    
    // Check ranges
    const money = new Decimal(data.gameState.resources?.money || 0);
    if (money.lt(0) || money.gt('1e308')) return false;
    
    return true;
  } catch {
    return false;
  }
}
```
**Validation:** Edge cases handled gracefully
**Time:** 30 minutes

## Testing Checklist

### Unit Tests
- [ ] State management tests >80% coverage
- [ ] Business logic tests complete
- [ ] Utility function tests
- [ ] Component tests with React Native Testing Library

### Integration Tests
- [ ] Feature interaction tests
- [ ] Save/load integrity tests
- [ ] Synergy system tests
- [ ] Event system tests

### E2E Tests
- [ ] Early game progression
- [ ] Department unlocking
- [ ] Manager automation
- [ ] Prestige flow

### Performance
- [ ] 60 FPS during gameplay
- [ ] Render times <16ms
- [ ] Memory usage stable
- [ ] No memory leaks

### Polish
- [ ] Animations smooth
- [ ] Audio feedback working
- [ ] Haptic feedback on iOS
- [ ] Loading states handled

## Success Metrics
- Test coverage >80%
- Zero critical bugs
- Performance targets met
- Polish features functional
- E2E tests passing

## Next Phase Dependencies
Phase 5 (Deployment) requires:
- All tests passing
- Performance optimized
- Critical bugs fixed
- Polish complete

## Time Summary
**Total Estimated Time:** 7 hours
**Recommended Schedule:** Complete over 2-3 days with thorough testing