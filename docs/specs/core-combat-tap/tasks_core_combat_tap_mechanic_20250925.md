# Core Combat Tap Mechanic Implementation Tasks

## Document Metadata
- **Source TDD**: `/docs/specs/core-combat-tap/tdd_core_combat_tap_mechanic_20250925.md`
- **Generated**: 2025-09-25 16:00:00 UTC
- **Total Tasks**: 24 Core Tasks + 8 Optional Enhancement Tasks
- **Architecture Reference**: `/docs/architecture/organizing_expo_apps_by_feature_20250921_113000.md`

## LEAN IMPLEMENTATION PRINCIPLES (CRITICAL)
**Every task must deliver user-visible functionality. NO infrastructure-only tasks.**

## Phase 1: First Playable Tap (Day 1)
*Duration: 1 day | Priority: P0 | Prerequisites: None*
*GOAL: User can tap and see damage numbers immediately*

### Task 1.1: Implement Basic Tap-to-Damage in App.tsx
**ROLE**: You are a React Native developer implementing the simplest working combat feature

**CONTEXT**: Starting with a fresh Expo project, we need the most basic tap interaction that delivers immediate user value. No folders, no structure, just working code in App.tsx.

**OBJECTIVE**: Modify App.tsx to show an enemy that takes damage when tapped, displaying floating damage numbers

**REQUIREMENTS**:
```typescript
// In App.tsx - the ONLY file we modify in Task 1.1
// User can:
// 1. See an enemy on screen (just a colored box is fine)
// 2. Tap the enemy to deal damage
// 3. See floating damage numbers
// 4. See enemy health bar decrease
```

**TDD IMPLEMENTATION** (Red-Green-Refactor):
1. **RED - Write failing test first**:
   ```typescript
   // App.test.tsx
   test('enemy takes damage when tapped', async () => {
     render(<App />);
     const enemy = screen.getByTestId('enemy');
     const initialHealth = 1000;

     fireEvent.press(enemy);

     // Should show damage number
     await waitFor(() => {
       expect(screen.getByText(/\d+/)).toBeTruthy();
     });
   });
   ```

2. **GREEN - Minimal implementation in App.tsx**:
   ```typescript
   // Just enough code to make the test pass
   // No optimization, no extra features
   ```

3. **REFACTOR - Only if needed to reduce duplication**

**ACCEPTANCE CRITERIA**:
- [ ] Enemy visible on screen (can be just a rectangle)
- [ ] Tap on enemy shows damage number
- [ ] Damage number floats upward and fades
- [ ] Enemy health bar decreases
- [ ] Works on iOS and Android
- [ ] Test passes

**DELIVERABLES**:
1. Modified App.tsx with tap combat
2. App.test.tsx with passing test
3. Working demo after `npm start`

**VALIDATION COMMAND**:
```bash
npm test App.test.tsx
npm start  # Then tap enemy in simulator
```

---

### Task 1.2: Add Haptic Feedback and Sound
**ROLE**: You are enhancing the tap experience with immediate sensory feedback

**CONTEXT**: We have basic tap working. Now add the visceral feedback that makes it satisfying.

**OBJECTIVE**: Add haptic vibration and impact sound to the existing tap in App.tsx

**TDD IMPLEMENTATION**:
1. **RED - Test for feedback**:
   ```typescript
   test('tap triggers haptic feedback', async () => {
     render(<App />);
     fireEvent.press(screen.getByTestId('enemy'));

     expect(Haptics.impactAsync).toHaveBeenCalled();
   });

   test('tap plays impact sound', async () => {
     render(<App />);
     fireEvent.press(screen.getByTestId('enemy'));

     expect(Audio.Sound.createAsync).toHaveBeenCalled();
   });
   ```

2. **GREEN - Add feedback to tap handler**
3. **REFACTOR - Extract feedback into a function if needed**

**REQUIREMENTS**:
- Use expo-haptics (already installed)
- Use expo-av for sound (already installed)
- Feedback must trigger within 20ms of tap

**ACCEPTANCE CRITERIA**:
- [ ] Device vibrates on tap (if supported)
- [ ] Impact sound plays on tap
- [ ] No delay between tap and feedback
- [ ] Tests pass

---

## Phase 2: Weakness Spots & Visual Polish (Day 2-3)
*Duration: 2 days | Priority: P0 | Prerequisites: Phase 1*
*GOAL: Add skill-based gameplay with weakness targeting*

### Task 2.1: Add Weakness Spot System (Still in App.tsx)
**ROLE**: You are adding the core skill mechanic to combat

**CONTEXT**: Players need a reason to aim their taps. Weakness spots provide skill-based gameplay.

**OBJECTIVE**: Add glowing weakness spots that give 2x damage when hit

**TDD IMPLEMENTATION**:
1. **RED - Test weakness detection**:
   ```typescript
   test('weakness spot gives 2x damage', async () => {
     render(<App />);
     const weaknessSpot = screen.getByTestId('weakness-spot');

     fireEvent.press(weaknessSpot);

     const damageText = await screen.findByText(/\d+/);
     const damage = parseInt(damageText.props.children);
     expect(damage).toBeGreaterThanOrEqual(200); // 2x base
   });
   ```

2. **GREEN - Add weakness spot to enemy**
3. **REFACTOR - Clean up position calculations**

**VISUAL REQUIREMENTS**:
```typescript
// Weakness spot properties
{
  size: 44x44 pixels minimum (accessibility)
  color: Glowing yellow/gold
  duration: 2-3 seconds visible
  position: Random on enemy body
  animation: Pulsing glow effect
}
```

**ACCEPTANCE CRITERIA**:
- [ ] Weakness spot appears on enemy
- [ ] Spot glows and pulses
- [ ] Tapping spot gives 2x damage
- [ ] Spot moves every 2-3 seconds
- [ ] Visual feedback when hit (flash effect)
- [ ] Tests pass

---

### Task 2.2: Add Floating Damage Number Polish
**ROLE**: You are making damage feedback more satisfying

**CONTEXT**: Current damage numbers need polish to feel impactful

**OBJECTIVE**: Enhance damage numbers with color coding, size variation, and smooth animations

**TDD IMPLEMENTATION**:
1. **RED - Test damage number variations**:
   ```typescript
   test('critical hits show larger red numbers', async () => {
     render(<App />);
     // Force a critical hit
     fireEvent.press(screen.getByTestId('weakness-spot'));

     const damageNumber = await screen.findByTestId('damage-number');
     expect(damageNumber.props.style.color).toBe('red');
     expect(damageNumber.props.style.fontSize).toBeGreaterThan(24);
   });
   ```

**ANIMATION SPECS** (using react-native-reanimated):
```typescript
// Normal hit: White, 18px, float up 50px over 1.5s
// Weakness hit: Yellow, 24px, float up 70px over 1.5s
// Critical: Red, 32px, float up 100px with shake
```

**ACCEPTANCE CRITERIA**:
- [ ] Normal damage: white numbers
- [ ] Weakness damage: yellow, larger
- [ ] Random crits: red, even larger
- [ ] Smooth float animation
- [ ] Numbers fade out gracefully
- [ ] Multiple numbers don't overlap
- [ ] Tests pass

---

### Task 2.3: Create Modular Structure (Refactor)
**ROLE**: You are refactoring the code into a proper modular structure

**CONTEXT**: App.tsx is getting large. Time to organize into modules following the architecture guide.

**OBJECTIVE**: Extract combat logic into proper feature modules without breaking functionality

**FILE STRUCTURE TO CREATE**:
```
src/
├── app/
│   └── index.tsx  (Move App.tsx content here)
├── modules/
│   └── combat/
│       ├── components/
│       │   ├── Enemy.tsx
│       │   ├── DamageNumber.tsx
│       │   └── WeaknessSpot.tsx
│       ├── hooks/
│       │   └── useCombat.ts
│       ├── services/
│       │   └── damageCalculator.ts
│       ├── stores/
│       │   └── combatStore.ts
│       └── types/
│           └── combat.types.ts
└── shared/
    └── services/
        ├── haptics.ts
        └── audio.ts
```

**REFACTORING STEPS**:
1. Create folder structure
2. Extract Enemy component with tests
3. Extract DamageNumber component with tests
4. Extract combat logic to useCombat hook
5. Move haptics/audio to shared services
6. Ensure all tests still pass
7. Update imports in app/index.tsx

**ACCEPTANCE CRITERIA**:
- [ ] All functionality still works
- [ ] Tests reorganized and passing
- [ ] No code in App.tsx (moved to app/index.tsx)
- [ ] Clean separation of concerns
- [ ] Can still run `npm start` and play

---

## Phase 3: Combo System & Enemy Variety (Day 4-5)
*Duration: 2 days | Priority: P0 | Prerequisites: Phase 2*
*GOAL: Add progression mechanics that reward skill*

### Task 3.1: Implement Combo Counter
**ROLE**: You are adding a combo system to reward consecutive weakness hits

**CONTEXT**: Players need feedback for skilled play. Combos provide this progression.

**OBJECTIVE**: Track and display combo multiplier for consecutive weakness hits

**LOCATION**: `src/modules/combat/components/ComboCounter.tsx`

**TDD IMPLEMENTATION**:
1. **RED - Test combo building**:
   ```typescript
   test('consecutive weakness hits build combo', async () => {
     render(<CombatScreen />);

     // Hit weakness 3 times
     for (let i = 0; i < 3; i++) {
       fireEvent.press(screen.getByTestId('weakness-spot'));
       await waitFor(() => {
         expect(screen.getByText(`${i + 1}x COMBO`)).toBeTruthy();
       });
     }
   });

   test('missing weakness resets combo', async () => {
     render(<CombatScreen />);

     // Build combo
     fireEvent.press(screen.getByTestId('weakness-spot'));
     await waitFor(() => expect(screen.getByText('1x COMBO')).toBeTruthy());

     // Miss weakness
     fireEvent.press(screen.getByTestId('enemy-body'));
     await waitFor(() => {
       expect(screen.queryByText(/COMBO/)).toBeFalsy();
     });
   });
   ```

**COMBO MECHANICS**:
```typescript
// Combo multiplier formula
damageMultiplier = 1.0 + (0.5 * comboCount)  // max 5.0x at 8 combo

// Visual feedback
1-2 combo: White text
3-4 combo: Yellow text + small shake
5-7 combo: Orange text + medium shake
8+ combo: Red text + screen shake + "ON FIRE!" text
```

**ACCEPTANCE CRITERIA**:
- [ ] Combo counter displays on screen
- [ ] Increases with consecutive weakness hits
- [ ] Resets on miss or timeout (3 seconds)
- [ ] Damage increases with combo
- [ ] Visual effects scale with combo
- [ ] Tests pass

---

### Task 3.2: Add Multiple Enemy Types
**ROLE**: You are adding enemy variety to create different combat challenges

**CONTEXT**: Single enemy type is boring. Different enemies create varied gameplay.

**OBJECTIVE**: Implement 3 enemy types with different weakness patterns

**LOCATION**: `src/modules/combat/components/enemies/`

**TDD IMPLEMENTATION**:
1. **RED - Test enemy behaviors**:
   ```typescript
   test('Grunt has 1 weakness spot', () => {
     render(<Enemy type="grunt" />);
     expect(screen.getAllByTestId('weakness-spot')).toHaveLength(1);
   });

   test('Elite has 2 weakness spots', () => {
     render(<Enemy type="elite" />);
     expect(screen.getAllByTestId('weakness-spot')).toHaveLength(2);
   });

   test('Boss has 3 rotating weakness spots', async () => {
     render(<Enemy type="boss" />);
     expect(screen.getAllByTestId('weakness-spot')).toHaveLength(3);

     // Wait for rotation
     await waitFor(() => {
       // Positions should change
     }, { timeout: 3000 });
   });
   ```

**ENEMY SPECIFICATIONS**:
```typescript
interface EnemyType {
  grunt: {
    health: 500,
    weaknessSpots: 1,
    rotationSpeed: 3000, // 3 seconds
    size: 'medium',
    color: 'gray'
  },
  elite: {
    health: 1000,
    weaknessSpots: 2,
    rotationSpeed: 2000, // 2 seconds
    size: 'large',
    color: 'purple'
  },
  boss: {
    health: 2500,
    weaknessSpots: 3,
    rotationSpeed: 1500, // 1.5 seconds
    size: 'huge',
    color: 'red'
  }
}
```

**ACCEPTANCE CRITERIA**:
- [ ] Three enemy types render correctly
- [ ] Each has correct number of weakness spots
- [ ] Weakness rotation speeds differ
- [ ] Visual distinction between types
- [ ] Health scales appropriately
- [ ] Tests pass for all types

---

### Task 3.3: Implement Loot System
**ROLE**: You are adding rewards for defeating enemies

**CONTEXT**: Players need rewards. Pyreal currency provides progression incentive.

**OBJECTIVE**: Drop and auto-collect Pyreal when enemies are defeated

**LOCATION**: `src/modules/combat/components/LootDrop.tsx`

**TDD IMPLEMENTATION**:
1. **RED - Test loot drops**:
   ```typescript
   test('enemy drops Pyreal on defeat', async () => {
     render(<CombatScreen />);
     const enemy = screen.getByTestId('enemy');

     // Defeat enemy (mock or actually reduce health to 0)
     defeatEnemy(enemy);

     await waitFor(() => {
       expect(screen.getByText(/\+\d+ Pyreal/)).toBeTruthy();
     });
   });

   test('loot auto-collects after delay', async () => {
     render(<CombatScreen />);
     defeatEnemy(screen.getByTestId('enemy'));

     const initialPyreal = getPyrealCount();

     // Wait for auto-collection
     await waitFor(() => {
       expect(getPyrealCount()).toBeGreaterThan(initialPyreal);
     }, { timeout: 10000 });
   });
   ```

**LOOT MECHANICS**:
```typescript
// Drop amounts by enemy type
grunt: 1-3 Pyreal
elite: 3-7 Pyreal
boss: 10-25 Pyreal

// Auto-collection
- Instant if within 100px
- After 10 seconds otherwise
- Float animation toward collection
```

**ACCEPTANCE CRITERIA**:
- [ ] Pyreal drops on enemy defeat
- [ ] Amount based on enemy type
- [ ] Visual drop animation
- [ ] "+X Pyreal" text on collection
- [ ] Auto-collection works
- [ ] Pyreal counter updates
- [ ] Tests pass

---

## Phase 4: State Management & Persistence (Day 6)
*Duration: 1 day | Priority: P0 | Prerequisites: Phase 3*
*GOAL: Save player progress and manage complex state*

### Task 4.1: Implement Legend State Store
**ROLE**: You are implementing centralized state management

**CONTEXT**: Combat state is getting complex. Legend State provides reactive, performant state management.

**OBJECTIVE**: Migrate combat state to Legend State with persistence

**LOCATION**: `src/modules/combat/stores/combatStore.ts`

**TDD IMPLEMENTATION**:
1. **RED - Test state management**:
   ```typescript
   test('combat store tracks all combat state', () => {
     const store = useCombatStore();

     expect(store.combo.get()).toBe(0);
     expect(store.totalDamage.get()).toBe(0);
     expect(store.enemiesDefeated.get()).toBe(0);
   });

   test('state persists between sessions', async () => {
     const store = useCombatStore();
     store.pyreal.set(100);

     // Simulate app restart
     await restartApp();

     const newStore = useCombatStore();
     expect(newStore.pyreal.get()).toBe(100);
   });
   ```

**STATE STRUCTURE**:
```typescript
const combatStore = observable({
  // Combat state
  combo: 0,
  maxCombo: 0,
  totalDamage: 0,

  // Player state
  pyreal: 0,
  playerPower: 100,

  // Enemy state
  currentEnemy: null as Enemy | null,
  enemiesDefeated: 0,

  // Session state
  sessionStartTime: Date.now(),
  tapsThisSession: 0,

  // Computed values
  damageMultiplier: computed(() => 1 + (0.5 * combatStore.combo.get())),
  averageDamage: computed(() =>
    combatStore.totalDamage.get() / Math.max(1, combatStore.tapsThisSession.get())
  )
});

// Persistence
persistObservable(combatStore, {
  local: 'combatState',
  persistLocal: ['pyreal', 'playerPower', 'maxCombo', 'enemiesDefeated']
});
```

**ACCEPTANCE CRITERIA**:
- [ ] All combat state in Legend State
- [ ] Computed values update automatically
- [ ] Selected state persists
- [ ] Performance: <1ms state updates
- [ ] React components re-render efficiently
- [ ] Tests pass

---

### Task 4.2: Add Combat Statistics Tracking
**ROLE**: You are implementing analytics and statistics

**CONTEXT**: Players want to see their performance. Statistics provide goals and achievement.

**OBJECTIVE**: Track and display comprehensive combat statistics

**LOCATION**: `src/modules/combat/components/StatsPanel.tsx`

**TDD IMPLEMENTATION**:
1. **RED - Test statistics tracking**:
   ```typescript
   test('tracks session statistics', async () => {
     render(<StatsPanel />);

     expect(screen.getByText(/Session Time:/)).toBeTruthy();
     expect(screen.getByText(/Taps:/)).toBeTruthy();
     expect(screen.getByText(/Max Combo:/)).toBeTruthy();
     expect(screen.getByText(/Enemies Defeated:/)).toBeTruthy();
   });
   ```

**STATISTICS TO TRACK**:
```typescript
// Session stats (reset on app launch)
- Session duration
- Taps this session
- Damage this session
- Enemies defeated this session
- Max combo this session

// Lifetime stats (persisted)
- Total play time
- Total taps
- Total damage dealt
- Total enemies defeated
- Highest combo ever
- Most Pyreal held
- Average damage per tap
- Weakness hit accuracy %
```

**ACCEPTANCE CRITERIA**:
- [ ] Stats panel displays current statistics
- [ ] Updates in real-time during combat
- [ ] Session stats reset on launch
- [ ] Lifetime stats persist
- [ ] Clean, readable UI
- [ ] Tests pass

---

## Phase 5: Performance Optimization (Day 7)
*Duration: 1 day | Priority: P0 | Prerequisites: Phase 4*
*GOAL: Ensure 60 FPS performance on target devices*

### Task 5.1: Optimize Animations with Reanimated Worklets
**ROLE**: You are optimizing performance for smooth 60 FPS

**CONTEXT**: Multiple animations can cause frame drops. Worklets run on UI thread for better performance.

**OBJECTIVE**: Convert all animations to Reanimated 3 worklets

**LOCATION**: `src/modules/combat/animations/`

**PERFORMANCE REQUIREMENTS**:
- Maintain 60 FPS with 10+ damage numbers
- <100ms input latency
- <150MB memory usage

**OPTIMIZATION CHECKLIST**:
```typescript
// Convert to worklets
- [ ] Damage number animations
- [ ] Weakness spot pulsing
- [ ] Screen shake effect
- [ ] Combo counter animations
- [ ] Loot collection animations

// Performance improvements
- [ ] Use SharedValues for all animated values
- [ ] Implement object pooling for damage numbers
- [ ] Batch state updates with runOnJS
- [ ] Lazy load heavy components
- [ ] Memoize expensive calculations
```

**VALIDATION**:
```bash
# Run performance profiling
npx react-native-performance

# Check FPS
# Should maintain 60 FPS during combat

# Memory profiling
# Should stay under 150MB
```

**ACCEPTANCE CRITERIA**:
- [ ] 60 FPS during combat with effects
- [ ] <100ms tap-to-feedback latency
- [ ] <150MB memory usage
- [ ] No jank or stuttering
- [ ] Smooth on iPhone 11 / Pixel 4
- [ ] Performance tests pass

---

### Task 5.2: Implement Particle Effect System
**ROLE**: You are adding visual polish with optimized particles

**CONTEXT**: Impact effects make combat feel satisfying but must be performant

**OBJECTIVE**: Add particle effects using object pooling for performance

**LOCATION**: `src/modules/combat/effects/ParticleSystem.tsx`

**TDD IMPLEMENTATION**:
1. **RED - Test particle spawning**:
   ```typescript
   test('spawns particles on impact', async () => {
     const { getByTestId } = render(<CombatScreen />);

     fireEvent.press(getByTestId('enemy'));

     await waitFor(() => {
       expect(screen.getAllByTestId('particle').length).toBeGreaterThan(0);
     });
   });
   ```

**PARTICLE SPECIFICATIONS**:
```typescript
class ParticlePool {
  private pool: Particle[] = [];
  private active: Set<Particle> = new Set();

  constructor(size: number = 50) {
    // Pre-allocate particles
    for (let i = 0; i < size; i++) {
      this.pool.push(new Particle());
    }
  }

  spawn(position: { x: number, y: number }, type: ParticleType) {
    const particle = this.pool.pop();
    if (!particle) return null; // Pool exhausted

    particle.reset(position, type);
    this.active.add(particle);
    return particle;
  }
}
```

**ACCEPTANCE CRITERIA**:
- [ ] Particles spawn on tap impact
- [ ] Different effects for normal/weakness/critical
- [ ] Object pooling prevents memory leaks
- [ ] No frame drops with particles
- [ ] Particles fade smoothly
- [ ] Tests pass

---

## Phase 6: Testing & Polish (Day 8-9)
*Duration: 2 days | Priority: P0 | Prerequisites: Phase 5*
*GOAL: Ensure quality and completeness*

### Task 6.1: Complete Test Coverage
**ROLE**: You are ensuring comprehensive test coverage

**CONTEXT**: TDD requires 80%+ test coverage for confidence in code quality

**OBJECTIVE**: Write missing tests to achieve 80% coverage

**TEST CATEGORIES TO COMPLETE**:
```bash
# Unit Tests
src/modules/combat/services/__tests__/damageCalculator.test.ts
src/modules/combat/stores/__tests__/combatStore.test.ts
src/modules/combat/hooks/__tests__/useCombat.test.ts

# Component Tests
src/modules/combat/components/__tests__/Enemy.test.tsx
src/modules/combat/components/__tests__/WeaknessSpot.test.tsx
src/modules/combat/components/__tests__/DamageNumber.test.tsx
src/modules/combat/components/__tests__/ComboCounter.test.tsx

# Integration Tests
src/modules/combat/__tests__/CombatFlow.integration.test.tsx

# E2E Tests (optional but recommended)
e2e/combat.e2e.test.ts
```

**COVERAGE REQUIREMENTS**:
- Statements: 80%+
- Branches: 80%+
- Functions: 80%+
- Lines: 80%+

**VALIDATION**:
```bash
npm test -- --coverage
# All metrics should be >80%
```

**ACCEPTANCE CRITERIA**:
- [ ] 80%+ coverage on all metrics
- [ ] All edge cases tested
- [ ] Error scenarios covered
- [ ] Async operations tested
- [ ] Mocks properly configured
- [ ] All tests pass

---

### Task 6.2: Accessibility Implementation
**ROLE**: You are ensuring the game is accessible to all players

**CONTEXT**: WCAG 2.1 AA compliance required per TDD

**OBJECTIVE**: Implement accessibility features for combat

**ACCESSIBILITY CHECKLIST**:
- [ ] Minimum touch targets 44x44px (66x66px in large mode)
- [ ] Contrast ratio 4.5:1 for normal text
- [ ] Contrast ratio 3:1 for large text
- [ ] Screen reader labels for all interactive elements
- [ ] Colorblind mode for weakness spots
- [ ] Haptic feedback alternatives for deaf players
- [ ] Font size scaling support

**TDD IMPLEMENTATION**:
```typescript
test('weakness spots meet minimum touch target', () => {
  render(<WeaknessSpot />);
  const spot = screen.getByTestId('weakness-spot');
  const { width, height } = spot.props.style;

  expect(width).toBeGreaterThanOrEqual(44);
  expect(height).toBeGreaterThanOrEqual(44);
});

test('colorblind mode uses patterns', () => {
  render(<WeaknessSpot colorblindMode={true} />);
  // Should have pattern/shape in addition to color
  expect(screen.getByTestId('weakness-pattern')).toBeTruthy();
});
```

**ACCEPTANCE CRITERIA**:
- [ ] All touch targets meet size requirements
- [ ] Contrast ratios pass WCAG AA
- [ ] Screen reader announces all actions
- [ ] Colorblind mode fully functional
- [ ] Settings accessible
- [ ] Tests pass

---

## Phase 7: Production Readiness (Day 10)
*Duration: 1 day | Priority: P0 | Prerequisites: Phase 6*
*GOAL: Prepare for deployment*

### Task 7.1: Error Handling & Recovery
**ROLE**: You are implementing robust error handling

**CONTEXT**: Production apps need graceful error handling

**OBJECTIVE**: Add comprehensive error boundaries and recovery

**ERROR HANDLING REQUIREMENTS**:
```typescript
// Error boundary for combat module
class CombatErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to analytics
    analytics.logError('combat_error', {
      error: error.toString(),
      stack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return <CombatRecoveryScreen onRetry={this.retry} />;
    }
    return this.props.children;
  }
}
```

**ACCEPTANCE CRITERIA**:
- [ ] Error boundaries catch component crashes
- [ ] Graceful degradation for missing features
- [ ] Network error handling
- [ ] State recovery after crash
- [ ] User-friendly error messages
- [ ] Analytics logging for errors

---

### Task 7.2: Performance Monitoring Setup
**ROLE**: You are implementing production monitoring

**CONTEXT**: Need visibility into production performance

**OBJECTIVE**: Add performance monitoring and analytics

**MONITORING IMPLEMENTATION**:
```typescript
// Performance tracking
const trackPerformance = {
  tapLatency: (startTime: number) => {
    const latency = Date.now() - startTime;
    analytics.track('tap_latency', { latency, device: Device.modelName });
  },

  fps: () => {
    // Track frame rate during combat
    analytics.track('combat_fps', { fps: currentFPS });
  },

  memoryUsage: () => {
    // Track memory consumption
    analytics.track('memory_usage', { usage: getMemoryUsage() });
  }
};
```

**METRICS TO TRACK**:
- Tap-to-feedback latency
- Frame rate during combat
- Memory usage over time
- Crash rate
- Session length
- Feature usage

**ACCEPTANCE CRITERIA**:
- [ ] Analytics integrated
- [ ] Key metrics tracked
- [ ] Performance budgets enforced
- [ ] Crash reporting configured
- [ ] Dashboard configured
- [ ] Alerts set up

---

## Phase 8: Optional Enhancements
*Duration: Variable | Priority: P1-P2 | Prerequisites: Phase 7*
*These tasks can be implemented after MVP launch*

### Task 8.1: [OPTIONAL] Advanced Particle Effects
- Implement element-based particles (fire, ice, lightning)
- Add combo milestone effects
- Create boss-specific impact effects

### Task 8.2: [OPTIONAL] Achievement System
- Track combat achievements
- Display achievement notifications
- Persist achievement progress

### Task 8.3: [OPTIONAL] Damage Type System
- Implement physical/magical/elemental damage
- Add enemy resistances
- Create type-advantage mechanics

### Task 8.4: [OPTIONAL] Special Abilities
- Add cooldown-based special attacks
- Implement area-of-effect abilities
- Create combo finishers

### Task 8.5: [OPTIONAL] Enemy AI Patterns
- Add movement patterns for enemies
- Implement defensive behaviors
- Create attack patterns for bosses

### Task 8.6: [OPTIONAL] Multiplayer Features
- Add damage leaderboards
- Implement cooperative combat
- Create PvP damage competitions

### Task 8.7: [OPTIONAL] Monetization
- Add damage multiplier purchases
- Implement cosmetic effects store
- Create premium enemy types

### Task 8.8: [OPTIONAL] Tutorial System
- Interactive combat tutorial
- Weakness spot training
- Combo practice mode

---

## Task Execution Guidelines

### For Development Team
1. **Follow TDD strictly**: Write test first, then code, then refactor
2. **Start with Task 1.1**: Get something playable immediately
3. **Each task should be demoable**: Show progress after each task
4. **Maintain test coverage**: Keep >80% coverage throughout
5. **Performance first**: Profile regularly, optimize early
6. **Commit after each task**: Small, focused commits

### For AI Agents
1. Execute tasks sequentially within phases
2. Always write tests before implementation
3. Validate all acceptance criteria
4. Run test coverage reports
5. Performance profile after optimization tasks
6. Report completion with test results

### Critical Success Factors
- **Day 1 must have playable combat**: No exceptions
- **Every feature must have tests**: TDD is mandatory
- **60 FPS is non-negotiable**: Profile and optimize
- **Accessibility is required**: Not optional
- **State must persist**: Players expect progress to save

## Implementation Commands

### Quick Start
```bash
# Start development
npm start

# Run tests with coverage
npm test -- --coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Performance profiling
npx react-native-performance
```

### Validation Checklist
Before marking any task complete:
- [ ] All tests written and passing
- [ ] Coverage >80% for new code
- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] Performance validated
- [ ] Accessibility checked
- [ ] Works on iOS and Android

## Risk Mitigation

### Risk: Input Latency on Low-End Devices
**Mitigation**: Use native gesture handlers, profile on minimum spec devices

### Risk: Memory Leaks from Animations
**Mitigation**: Implement object pooling, cleanup in useEffect returns

### Risk: State Management Complexity
**Mitigation**: Use Legend State computed values, keep state minimal

### Risk: Test Maintenance Burden
**Mitigation**: Test behavior not implementation, use testing utilities

---

## Summary Statistics

- **Total Core Tasks**: 24
- **Total Optional Tasks**: 8
- **Estimated Duration**: 10 days for MVP
- **Critical Path**: Tasks 1.1 → 2.1 → 3.1 → 4.1 → 5.1
- **Parallel Potential**: 30% (within phases)
- **Test Coverage Target**: 80%
- **Performance Target**: 60 FPS, <100ms latency

---

*Generated from TDD: `/docs/specs/core-combat-tap/tdd_core_combat_tap_mechanic_20250925.md`*
*Generation timestamp: 2025-09-25 16:00:00 UTC*
*Optimized for: Lean TDD development with immediate playability*