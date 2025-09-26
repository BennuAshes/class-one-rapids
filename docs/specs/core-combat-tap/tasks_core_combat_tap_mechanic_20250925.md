# Core Combat Tap Mechanic Implementation Tasks

## Document Metadata
- **Source TDD**: tdd_core_combat_tap_mechanic_20250925.md
- **Generated**: 2025-09-25
- **Total Tasks**: 15 functional tasks
- **Approach**: Lean TDD - Every task delivers working functionality

## Implementation Philosophy
- **NO infrastructure-only tasks** - Create folders/files only when needed
- **Just-in-time dependencies** - Install packages only when first used
- **Progressive enhancement** - Start simple, add complexity incrementally
- **Always deliver functionality** - Each task ends with working, tested feature

---

## Phase 1: Basic Combat (Simplest Working Feature)
*Duration: 3 days | Priority: P0 | Prerequisites: None*

### Task 1.1: Basic Tap-to-Damage with TDD
**ROLE**: You are a senior React Native developer implementing the first working feature

**CONTEXT**: Starting from existing React Native setup in `/src/`, implement the simplest possible combat: tap enemy to deal damage

**OBJECTIVE**: Create minimal working combat where tapping reduces enemy health

**TDD IMPLEMENTATION**:

#### Step 1: Write First Failing Test
```typescript
// Create this test file first:
// src/App.test.tsx

import { render, fireEvent, screen } from '@testing-library/react-native';
import App from './App';

describe('Basic Combat', () => {
  test('tapping enemy deals damage', () => {
    render(<App />);

    // Enemy should start at full health
    expect(screen.getByText('Health: 100')).toBeTruthy();

    // Tap the enemy
    const enemy = screen.getByTestId('enemy-sprite');
    fireEvent.press(enemy);

    // Health should decrease
    expect(screen.getByText('Health: 90')).toBeTruthy();
  });
});
```

#### Step 2: Minimal Implementation
```typescript
// Modify existing App.tsx - no new files yet!
export default function App() {
  const [enemyHealth, setEnemyHealth] = useState(100);

  const handleTap = () => {
    setEnemyHealth(prev => Math.max(0, prev - 10));
  };

  return (
    <View>
      <Text>Health: {enemyHealth}</Text>
      <TouchableOpacity
        testID="enemy-sprite"
        onPress={handleTap}
        style={styles.enemy}
      >
        <Text>ENEMY</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**WHAT TO CREATE** (only as needed):
- Modify existing `App.tsx`
- Create `App.test.tsx` for tests
- Install testing library if not present: `npm install --save-dev @testing-library/react-native`

**ACCEPTANCE CRITERIA**:
- [ ] Test passes: tapping reduces health
- [ ] Enemy displays on screen
- [ ] Health updates visually
- [ ] App runs without errors

**DELIVERABLE**: Working app where you can tap to damage enemy

---

### Task 1.2: Add Visual Damage Feedback with TDD
**ROLE**: You are implementing visual feedback for combat

**CONTEXT**: Enemy takes damage but player needs visual confirmation

**OBJECTIVE**: Show floating damage numbers when enemy is hit

**TDD IMPLEMENTATION**:

#### Step 1: Test for Damage Numbers
```typescript
// Add to App.test.tsx
test('shows damage number when enemy is hit', async () => {
  render(<App />);

  const enemy = screen.getByTestId('enemy-sprite');
  fireEvent.press(enemy);

  // Damage number should appear
  await waitFor(() => {
    expect(screen.getByText('10')).toBeTruthy();
  });

  // Should disappear after animation
  await waitFor(() => {
    expect(screen.queryByText('10')).toBeFalsy();
  }, { timeout: 2000 });
});
```

#### Step 2: Implement Damage Numbers
```typescript
// Still in App.tsx - add damage number display
const [damageNumbers, setDamageNumbers] = useState([]);

const handleTap = () => {
  const damage = 10;
  setEnemyHealth(prev => Math.max(0, prev - damage));

  // Add damage number
  const id = Date.now();
  setDamageNumbers(prev => [...prev, { id, value: damage }]);

  // Remove after 1.5s
  setTimeout(() => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id));
  }, 1500);
};

// In render, add floating numbers
{damageNumbers.map(dmg => (
  <Animated.Text key={dmg.id} style={floatingStyle}>
    {dmg.value}
  </Animated.Text>
))}
```

**NEW DEPENDENCIES** (install only now):
```bash
npm install react-native-reanimated
```

**ACCEPTANCE CRITERIA**:
- [ ] Damage numbers appear on tap
- [ ] Numbers float upward
- [ ] Numbers disappear after 1.5s
- [ ] Multiple taps show multiple numbers

**DELIVERABLE**: Combat with visual damage feedback

---

### Task 1.3: Add Enemy Health Bar with TDD
**ROLE**: You are adding enemy health visualization

**CONTEXT**: Players need to see enemy health status

**OBJECTIVE**: Display visual health bar that depletes as enemy takes damage

**TDD IMPLEMENTATION**:

#### Step 1: Test for Health Bar
```typescript
test('displays health bar that depletes', () => {
  render(<App />);

  const healthBar = screen.getByTestId('health-bar-fill');
  expect(healthBar.props.style.width).toBe('100%');

  const enemy = screen.getByTestId('enemy-sprite');
  fireEvent.press(enemy);

  expect(healthBar.props.style.width).toBe('90%');
});
```

#### Step 2: Implement Health Bar
```typescript
// Add to App.tsx
<View testID="health-bar" style={styles.healthBar}>
  <View
    testID="health-bar-fill"
    style={[
      styles.healthBarFill,
      { width: `${enemyHealth}%` }
    ]}
  />
</View>
```

**FOLDER CREATION** (first time we need styles):
- Create `App.styles.ts` for style definitions

**ACCEPTANCE CRITERIA**:
- [ ] Health bar displays above enemy
- [ ] Bar depletes proportionally
- [ ] Smooth width animation
- [ ] Shows empty state at 0 health

**DELIVERABLE**: Enemy with visual health bar

---

## Phase 2: Damage Calculation System
*Duration: 3 days | Priority: P0 | Prerequisites: Phase 1*

### Task 2.1: Variable Damage with Power Scaling
**ROLE**: You are implementing damage calculation logic

**CONTEXT**: Current damage is fixed at 10, needs to be variable based on player power

**OBJECTIVE**: Implement damage formula: Power × (1.0-1.5 random)

**TDD IMPLEMENTATION**:

#### Step 1: Test Damage Calculation
```typescript
// Create first service test:
// src/services/DamageCalculator.test.ts

describe('DamageCalculator', () => {
  test('calculates damage within range', () => {
    const calculator = new DamageCalculator();
    const damage = calculator.calculate({
      basePower: 100,
      randomSeed: 0.5 // For testing
    });

    expect(damage).toBeGreaterThanOrEqual(100);
    expect(damage).toBeLessThanOrEqual(150);
  });
});
```

#### Step 2: Create Calculator Service
```typescript
// Create src/services/DamageCalculator.ts (first service!)
export class DamageCalculator {
  calculate({ basePower, randomSeed }) {
    const random = randomSeed ?? Math.random();
    return basePower * (1.0 + random * 0.5);
  }
}
```

**FOLDER CREATION**:
- Create `src/services/` (first time we need it)
- Create `DamageCalculator.ts` and test file

**INTEGRATION**: Update App.tsx to use calculator

**ACCEPTANCE CRITERIA**:
- [ ] Damage varies between 1.0x-1.5x power
- [ ] Each tap shows different damage
- [ ] Calculator has 100% test coverage

**DELIVERABLE**: Combat with variable damage

---

### Task 2.2: Add Combo System for Consecutive Hits
**ROLE**: You are implementing combo multipliers

**CONTEXT**: Players should be rewarded for consecutive hits

**OBJECTIVE**: Track combos and apply multiplier: 1.0 + (0.5 × combo)

**TDD IMPLEMENTATION**:

#### Step 1: Test Combo Tracking
```typescript
// Add to App.test.tsx
test('builds combo with consecutive hits', () => {
  render(<App />);

  const enemy = screen.getByTestId('enemy-sprite');

  // First hit - no combo
  fireEvent.press(enemy);
  expect(screen.queryByText('1x COMBO')).toBeFalsy();

  // Second hit - start combo
  fireEvent.press(enemy);
  expect(screen.getByText('2x COMBO')).toBeTruthy();

  // Third hit - increase combo
  fireEvent.press(enemy);
  expect(screen.getByText('3x COMBO')).toBeTruthy();
});
```

#### Step 2: Add Combo State
```typescript
// In App.tsx
const [combo, setCombo] = useState(0);

const handleTap = () => {
  const newCombo = combo + 1;
  setCombo(newCombo);

  const comboMultiplier = 1.0 + (0.5 * Math.min(newCombo, 8)); // Cap at 5x
  const damage = calculator.calculate({
    basePower: 10,
    comboMultiplier
  });

  // ... rest of tap handling
};

// Display combo
{combo > 1 && <Text>{combo}x COMBO</Text>}
```

**NO NEW FILES**: Just modify existing App.tsx and calculator

**ACCEPTANCE CRITERIA**:
- [ ] Combo increases on consecutive hits
- [ ] Multiplier applied to damage
- [ ] Combo display appears at 2+
- [ ] Max combo capped at 5x

**DELIVERABLE**: Combat with working combo system

---

## Phase 3: Weakness Spot System
*Duration: 4 days | Priority: P0 | Prerequisites: Phase 2*

### Task 3.1: Add Weakness Spots with Higher Damage
**ROLE**: You are implementing the weakness spot mechanic

**CONTEXT**: Enemy should have glowing spots that deal extra damage

**OBJECTIVE**: Add 1-3 weakness spots with 2x damage multiplier

**TDD IMPLEMENTATION**:

#### Step 1: Test Weakness Detection
```typescript
test('weakness spot deals double damage', () => {
  render(<App />);

  // Tap normal area
  const enemy = screen.getByTestId('enemy-sprite');
  fireEvent.press(enemy, { nativeEvent: { locationX: 10, locationY: 10 }});
  expect(screen.getByText('10')).toBeTruthy(); // Normal damage

  // Tap weakness spot
  const weakness = screen.getByTestId('weakness-spot-0');
  fireEvent.press(weakness);
  expect(screen.getByText('20')).toBeTruthy(); // Double damage
});
```

#### Step 2: Create Weakness Component
```typescript
// Create src/components/WeaknessSpot.tsx (first component!)
export const WeaknessSpot = ({ onHit, position }) => {
  return (
    <TouchableOpacity
      testID="weakness-spot-0"
      style={[styles.weakness, { left: position.x, top: position.y }]}
      onPress={() => onHit(true)}
    >
      <View style={styles.glowEffect} />
    </TouchableOpacity>
  );
};
```

**FOLDER CREATION**:
- Create `src/components/` (first time needed)
- Create `WeaknessSpot.tsx`

**ACCEPTANCE CRITERIA**:
- [ ] Weakness spots appear on enemy
- [ ] Spots glow to indicate target
- [ ] 2x damage when hit
- [ ] Normal damage elsewhere

**DELIVERABLE**: Enemy with targetable weakness spots

---

### Task 3.2: Rotating Weakness Spots
**ROLE**: You are adding weakness spot rotation

**CONTEXT**: Weakness spots should move to create challenge

**OBJECTIVE**: Rotate spots every 2-3 seconds

**TDD IMPLEMENTATION**:

#### Step 1: Test Rotation
```typescript
test('weakness spots rotate position', async () => {
  jest.useFakeTimers();
  render(<App />);

  const spot = screen.getByTestId('weakness-spot-0');
  const initialPosition = spot.props.style.left;

  // Advance time
  jest.advanceTimersByTime(2500);

  await waitFor(() => {
    const rotatedSpot = screen.getByTestId('weakness-spot-0');
    expect(rotatedSpot.props.style.left).not.toBe(initialPosition);
  });
});
```

#### Step 2: Add Rotation Logic
```typescript
// In App.tsx
useEffect(() => {
  const interval = setInterval(() => {
    setWeaknessPositions(generateRandomPositions());
  }, 2500);

  return () => clearInterval(interval);
}, []);
```

**NO NEW FILES**: Update existing components

**ACCEPTANCE CRITERIA**:
- [ ] Spots change position every 2-3s
- [ ] Smooth transition animation
- [ ] Spots stay within enemy bounds

**DELIVERABLE**: Dynamic weakness spot system

---

### Task 3.3: Combo Bonus for Weakness Hits
**ROLE**: You are linking weakness hits to combo system

**CONTEXT**: Hitting weakness spots should build combo, missing should reset

**OBJECTIVE**: Only weakness hits maintain combo streak

**TDD IMPLEMENTATION**:

#### Step 1: Test Combo Rules
```typescript
test('combo increases only on weakness hits', () => {
  render(<App />);

  // Hit weakness - combo starts
  const weakness = screen.getByTestId('weakness-spot-0');
  fireEvent.press(weakness);
  expect(screen.getByText('1x COMBO')).toBeTruthy();

  // Hit normal - combo resets
  const enemy = screen.getByTestId('enemy-sprite');
  fireEvent.press(enemy, { nativeEvent: { locationX: 10, locationY: 10 }});
  expect(screen.queryByText('COMBO')).toBeFalsy();
});
```

#### Step 2: Update Combo Logic
```typescript
const handleTap = (isWeakness) => {
  if (isWeakness) {
    setCombo(prev => prev + 1);
  } else {
    setCombo(0); // Reset on miss
  }
  // ... rest of logic
};
```

**NO NEW FILES**: Modify existing tap handlers

**ACCEPTANCE CRITERIA**:
- [ ] Combo only builds on weakness hits
- [ ] Normal hits reset combo
- [ ] Visual feedback for combo state

**DELIVERABLE**: Skill-based combo system

---

## Phase 4: Polish & Effects
*Duration: 4 days | Priority: P1 | Prerequisites: Phase 3*

### Task 4.1: Add Hit Impact Effects
**ROLE**: You are adding visual polish to combat

**CONTEXT**: Hits need more satisfying visual feedback

**OBJECTIVE**: Add particle effects and screen shake

**TDD IMPLEMENTATION**:

#### Step 1: Test Screen Shake
```typescript
test('screen shakes on hit', () => {
  render(<App />);

  const container = screen.getByTestId('game-container');
  expect(container.props.style.transform).toBeUndefined();

  const enemy = screen.getByTestId('enemy-sprite');
  fireEvent.press(enemy);

  expect(container.props.style.transform).toContainEqual(
    expect.objectContaining({ translateX: expect.any(Number) })
  );
});
```

#### Step 2: Implement Effects
```typescript
// Create src/hooks/useScreenShake.ts (first hook!)
export const useScreenShake = () => {
  const shakeAnimation = useSharedValue(0);

  const shake = (intensity) => {
    shakeAnimation.value = withSequence(
      withTiming(intensity, { duration: 50 }),
      withTiming(-intensity, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  return { shake, shakeAnimation };
};
```

**NEW DEPENDENCIES**:
```bash
npm install react-native-reanimated  # If not already installed
```

**FOLDER CREATION**:
- Create `src/hooks/` (first custom hook)

**ACCEPTANCE CRITERIA**:
- [ ] Screen shakes on hit
- [ ] Shake intensity scales with damage
- [ ] Smooth animation at 60 FPS

**DELIVERABLE**: Polished hit feedback

---

### Task 4.2: Add Sound Effects
**ROLE**: You are implementing audio feedback

**CONTEXT**: Combat needs audio for satisfying feedback

**OBJECTIVE**: Add impact sounds with 3 intensity tiers

**TDD IMPLEMENTATION**:

#### Step 1: Test Audio Playback
```typescript
test('plays sound on hit', async () => {
  const audioSpy = jest.spyOn(Audio, 'Sound');
  render(<App />);

  const enemy = screen.getByTestId('enemy-sprite');
  fireEvent.press(enemy);

  expect(audioSpy).toHaveBeenCalled();
});
```

#### Step 2: Add Audio System
```typescript
// Create src/services/AudioManager.ts
import { Audio } from 'expo-av';

export class AudioManager {
  async playHitSound(damage) {
    const soundFile = damage > 30 ? 'heavy.mp3' :
                     damage > 15 ? 'medium.mp3' : 'light.mp3';
    const { sound } = await Audio.Sound.createAsync(
      require(`../assets/sounds/${soundFile}`)
    );
    await sound.playAsync();
  }
}
```

**NEW DEPENDENCIES**:
```bash
npx expo install expo-av
```

**ASSET CREATION**:
- Create `src/assets/sounds/`
- Add placeholder sound files

**ACCEPTANCE CRITERIA**:
- [ ] Sound plays on every hit
- [ ] 3 different sound intensities
- [ ] No audio delay or glitches

**DELIVERABLE**: Combat with sound effects

---

### Task 4.3: Add Haptic Feedback
**ROLE**: You are adding tactile feedback

**CONTEXT**: Mobile devices support haptic feedback for better game feel

**OBJECTIVE**: Trigger haptics within 20ms of tap

**TDD IMPLEMENTATION**:

#### Step 1: Test Haptic Timing
```typescript
test('triggers haptic feedback quickly', async () => {
  const hapticSpy = jest.spyOn(Haptics, 'impactAsync');
  render(<App />);

  const startTime = performance.now();
  const enemy = screen.getByTestId('enemy-sprite');
  fireEvent.press(enemy);

  await waitFor(() => {
    expect(hapticSpy).toHaveBeenCalled();
    const callTime = performance.now() - startTime;
    expect(callTime).toBeLessThan(20);
  });
});
```

#### Step 2: Add Haptics
```typescript
// In handleTap
import * as Haptics from 'expo-haptics';

const handleTap = async (isWeakness) => {
  // Trigger haptic immediately
  Haptics.impactAsync(
    isWeakness ?
    Haptics.ImpactFeedbackStyle.Heavy :
    Haptics.ImpactFeedbackStyle.Light
  );

  // ... rest of logic
};
```

**NEW DEPENDENCIES**:
```bash
npx expo install expo-haptics
```

**ACCEPTANCE CRITERIA**:
- [ ] Haptics trigger on tap
- [ ] Different intensities for weakness/normal
- [ ] Works on supported devices

**DELIVERABLE**: Tactile combat feedback

---

## Phase 5: Performance & State Management
*Duration: 3 days | Priority: P0 | Prerequisites: Phase 4*

### Task 5.1: Extract State to Zustand Store
**ROLE**: You are optimizing state management

**CONTEXT**: App.tsx is getting complex, need proper state management

**OBJECTIVE**: Move combat state to Zustand for better performance

**TDD IMPLEMENTATION**:

#### Step 1: Test State Store
```typescript
// Create src/stores/combatStore.test.ts
import { useCombatStore } from './combatStore';

test('store manages combat state', () => {
  const { result } = renderHook(() => useCombatStore());

  expect(result.current.enemyHealth).toBe(100);

  act(() => {
    result.current.dealDamage(10);
  });

  expect(result.current.enemyHealth).toBe(90);
});
```

#### Step 2: Create Store
```typescript
// Create src/stores/combatStore.ts
import { create } from 'zustand';

export const useCombatStore = create((set) => ({
  enemyHealth: 100,
  combo: 0,

  dealDamage: (damage) => set((state) => ({
    enemyHealth: Math.max(0, state.enemyHealth - damage)
  })),

  incrementCombo: () => set((state) => ({
    combo: state.combo + 1
  })),

  resetCombo: () => set({ combo: 0 })
}));
```

**NEW DEPENDENCIES**:
```bash
npm install zustand
```

**FOLDER CREATION**:
- Create `src/stores/` (first store)

**REFACTOR**: Update App.tsx to use store

**ACCEPTANCE CRITERIA**:
- [ ] State moved to Zustand
- [ ] No unnecessary re-renders
- [ ] All tests still pass

**DELIVERABLE**: Optimized state management

---

### Task 5.2: Add Performance Monitoring
**ROLE**: You are ensuring performance targets are met

**CONTEXT**: Need to verify <100ms latency and 60 FPS

**OBJECTIVE**: Add performance tracking and optimization

**TDD IMPLEMENTATION**:

#### Step 1: Test Performance Metrics
```typescript
test('maintains 60 FPS during combat', async () => {
  const { getByTestId } = render(<App />);

  // Simulate rapid tapping
  const enemy = getByTestId('enemy-sprite');
  for (let i = 0; i < 20; i++) {
    fireEvent.press(enemy);
    await new Promise(r => setTimeout(r, 50));
  }

  const fpsDisplay = getByTestId('fps-counter');
  const fps = parseInt(fpsDisplay.props.children);
  expect(fps).toBeGreaterThanOrEqual(55);
});
```

#### Step 2: Add Performance Monitor
```typescript
// Create src/hooks/usePerformanceMonitor.ts
export const usePerformanceMonitor = () => {
  const [fps, setFps] = useState(60);
  const [inputLatency, setInputLatency] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime > 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(measureFPS);
    };

    measureFPS();
  }, []);

  return { fps, inputLatency };
};
```

**ACCEPTANCE CRITERIA**:
- [ ] FPS counter shows real-time performance
- [ ] Input latency tracked and displayed
- [ ] Performance stays within targets

**DELIVERABLE**: Performance monitoring system

---

### Task 5.3: Optimize for Low-End Devices
**ROLE**: You are ensuring broad device compatibility

**CONTEXT**: Must work on 2020+ devices with limited resources

**OBJECTIVE**: Add adaptive quality based on device performance

**TDD IMPLEMENTATION**:

#### Step 1: Test Adaptive Quality
```typescript
test('reduces quality on low performance', () => {
  // Mock low FPS
  jest.spyOn(performance, 'now').mockReturnValue(/* simulate low FPS */);

  render(<App />);

  // Check reduced particle count
  const particles = screen.queryAllByTestId(/particle-/);
  expect(particles.length).toBeLessThan(10);
});
```

#### Step 2: Implement Adaptive System
```typescript
// In App.tsx or performance hook
const adaptQuality = (currentFPS) => {
  if (currentFPS < 30) {
    setQuality('low');  // Fewer particles, no screen shake
  } else if (currentFPS < 50) {
    setQuality('medium');  // Reduced effects
  } else {
    setQuality('high');  // Full effects
  }
};
```

**ACCEPTANCE CRITERIA**:
- [ ] Quality adjusts automatically
- [ ] Low-end devices maintain playability
- [ ] Smooth degradation of effects

**DELIVERABLE**: Adaptive performance system

---

## Summary

### Lean Implementation Approach
- **15 functional tasks** (down from 42 infrastructure-heavy tasks)
- **Every task delivers working functionality**
- **Infrastructure created only when needed**
- **Dependencies installed just-in-time**
- **Progressive enhancement from simplest to complex**

### Key Differences from Previous Approach
1. **No setup-only tasks** - First task delivers working tap-to-damage
2. **Folders created with first file** - No empty structure
3. **Dependencies installed when used** - Not all upfront
4. **Continuous refactoring** - Structure emerges from needs
5. **Always shippable** - Every task ends with working feature

### Task Progression
1. **Phase 1**: Basic working combat (3 tasks)
2. **Phase 2**: Damage system (2 tasks)
3. **Phase 3**: Weakness mechanics (3 tasks)
4. **Phase 4**: Polish effects (3 tasks)
5. **Phase 5**: Optimization (3 tasks)

### Final Architecture (Emerges Naturally)
```
src/
├── App.tsx                    # Modified incrementally
├── App.test.tsx              # Created in Task 1.1
├── App.styles.ts             # Created in Task 1.3
├── components/               # Created in Task 3.1
│   └── WeaknessSpot.tsx
├── services/                 # Created in Task 2.1
│   ├── DamageCalculator.ts
│   └── AudioManager.ts      # Created in Task 4.2
├── hooks/                    # Created in Task 4.1
│   ├── useScreenShake.ts
│   └── usePerformanceMonitor.ts
├── stores/                   # Created in Task 5.1
│   └── combatStore.ts
└── assets/                   # Existing
    └── sounds/              # Created in Task 4.2
```

---
*Generated: 2025-09-25*
*Approach: Lean TDD - Infrastructure emerges from features*