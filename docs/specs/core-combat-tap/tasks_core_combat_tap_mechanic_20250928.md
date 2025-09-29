# Core Combat Tap Mechanic Implementation Tasks

## Document Metadata
- **Source TDD**: `/docs/specs/core-combat-tap/tdd_core_combat_tap_mechanic_20250928.md`
- **Generated**: 2025-09-28
- **Total Tasks**: 14

## Phase 1: First User-Visible Feature (LEAN - Day 1)
*Duration: 1 day | Priority: P0 | Prerequisites: None*

**LEAN PRINCIPLE**: First task MUST deliver working functionality a user can interact with. NO infrastructure-only tasks.

### Task 1.1: [PARTIAL: missing tests and combo logic] Basic Tap-to-Damage with TDD
**ROLE**: You are a senior React Native developer implementing the first user-visible combat feature

**CONTEXT**: The frontend already has App.tsx with basic enemy tapping and damage numbers. We need to add TDD tests and complete the combat foundation based on TDD section 11 Phase 1 requirements.

**OBJECTIVE**: Complete the tap-to-damage feature with full TDD coverage in existing App.tsx

**CURRENT STATE**:
- ✅ App.tsx exists with basic enemy component
- ✅ Damage numbers animate upward
- ✅ Haptic feedback on tap
- ⚠️ Missing: Comprehensive tests
- ⚠️ Missing: Damage calculation logic
- ⚠️ Missing: Enemy health system

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Tests
```typescript
// frontend/App.test.tsx - ADD to existing file
describe('Combat - Basic Tap Damage', () => {
  test('enemy takes damage when tapped', async () => {
    const { getByTestId } = render(<App />);
    const enemy = getByTestId('enemy');

    fireEvent.press(enemy);

    // Should show damage number
    await waitFor(() => {
      expect(getByText(/10/)).toBeTruthy();
    });
  });

  test('enemy health decreases on tap', async () => {
    const { getByTestId, getByLabelText } = render(<App />);
    const enemy = getByTestId('enemy');

    // Initial health
    expect(getByLabelText('Enemy health: 100')).toBeTruthy();

    // Tap enemy
    fireEvent.press(enemy);

    // Health should decrease
    await waitFor(() => {
      expect(getByLabelText('Enemy health: 90')).toBeTruthy();
    });
  });
});
```

#### Step 2: Enhance App.tsx Implementation
- Add enemy health state management
- Calculate damage based on player power (base: 10)
- Display health bar above enemy
- Keep existing animation and haptic feedback

**FILES TO MODIFY**:
- `frontend/App.tsx` - Add health system
- `frontend/App.test.tsx` - Add comprehensive tests

**ACCEPTANCE CRITERIA**:
- [x] User can tap enemy to deal damage
- [ ] Damage numbers float up (already implemented)
- [ ] Enemy health bar shows current health
- [ ] Tests cover tap → damage → health reduction flow
- [ ] All tests pass

**DELIVERABLE**: Working tap combat with health system and tests

---

### Task 1.2: Enemy Defeat Mechanic with TDD
**ROLE**: You are implementing enemy defeat conditions

**CONTEXT**: Building on Task 1.1, enemies need to be defeatable when health reaches zero

**OBJECTIVE**: Add defeat mechanics when enemy health depletes

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
// frontend/App.test.tsx - ADD test
test('enemy is defeated when health reaches zero', async () => {
  const { getByTestId, queryByTestId, getByText } = render(<App />);
  const enemy = getByTestId('enemy');

  // Tap enemy 10 times (100 health / 10 damage)
  for (let i = 0; i < 10; i++) {
    fireEvent.press(enemy);
    await waitFor(() => {});
  }

  // Enemy should disappear
  await waitFor(() => {
    expect(queryByTestId('enemy')).toBeNull();
  });

  // Victory message should appear
  expect(getByText('Victory!')).toBeTruthy();
});
```

#### Step 2: Implement Defeat Logic
- Check health after each damage
- Trigger defeat animation at 0 health
- Show victory message
- Respawn new enemy after 2 seconds

**FILES TO MODIFY**:
- `frontend/App.tsx` - Add defeat conditions
- `frontend/App.test.tsx` - Add defeat tests

**ACCEPTANCE CRITERIA**:
- [ ] Enemy disappears when health = 0
- [ ] Victory message displays
- [ ] New enemy spawns after delay
- [ ] Tests verify full defeat flow

**DELIVERABLE**: Defeatable enemies with respawn

---

### Task 1.3: Pyreal Currency Drops with TDD
**ROLE**: You are implementing the reward system

**CONTEXT**: Defeated enemies should drop Pyreal currency (from TDD section 5)

**OBJECTIVE**: Add currency drops and collection on enemy defeat

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
test('enemy drops Pyreal when defeated', async () => {
  const { getByTestId, getByText } = render(<App />);

  // Defeat enemy
  await defeatEnemy(getByTestId('enemy'));

  // Check Pyreal dropped
  await waitFor(() => {
    expect(getByText('+5 Pyreal')).toBeTruthy();
  });

  // Check currency counter updated
  expect(getByTestId('pyreal-counter')).toHaveTextContent('5');
});
```

#### Step 2: Implement Currency System
- Add Pyreal state to track total
- Drop 1-5 Pyreal on defeat (based on enemy level)
- Auto-collect after 1 second
- Display "+X Pyreal" floating text
- Update currency counter in UI

**FILES TO CREATE**:
- None - modify existing App.tsx

**ACCEPTANCE CRITERIA**:
- [ ] Pyreal drops on enemy defeat
- [ ] Auto-collection after 1 second
- [ ] Currency counter updates
- [ ] Tests verify drop and collection

**DELIVERABLE**: Working currency system

---

## Phase 2: Weakness System (Day 2)
*Duration: 1 day | Priority: P0 | Prerequisites: Phase 1*

### Task 2.1: Visual Weakness Spots with TDD
**ROLE**: You are implementing the weakness detection system

**CONTEXT**: Enemies need visible weak spots that players can target for bonus damage (TDD section 11 Phase 2)

**OBJECTIVE**: Add glowing weakness spots to enemies

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
test('enemy displays weakness spots', () => {
  const { getAllByTestId } = render(<App />);

  const weaknessSpots = getAllByTestId(/weakness-spot/);
  expect(weaknessSpots).toHaveLength(2); // 2 spots per enemy

  // Check visual properties
  weaknessSpots.forEach(spot => {
    expect(spot).toHaveStyle({
      backgroundColor: '#FFD700', // Gold color
    });
  });
});
```

#### Step 2: Implement Weakness Spots
- Add 2-3 glowing circles on enemy body
- Position randomly within enemy bounds
- Pulsing animation (1Hz frequency)
- 44x44px minimum tap target (accessibility)

**VISUAL REQUIREMENTS**:
```yaml
weakness_spot:
  size: "44x44px"
  color: "#FFD700"  # Glowing gold
  animation:
    type: "pulse"
    frequency: "1Hz"
    scale: "1.0 to 1.2"
  position: "random within enemy bounds"
  opacity: "0.8"
```

**FILES TO MODIFY**:
- `frontend/App.tsx` - Add weakness spot components

**ACCEPTANCE CRITERIA**:
- [ ] 2-3 weakness spots visible on enemy
- [ ] Spots have pulsing animation
- [ ] Minimum 44px tap targets
- [ ] Tests verify spot rendering

**DELIVERABLE**: Visible weakness indicators

---

### Task 2.2: Weakness Hit Detection with TDD
**ROLE**: You are implementing hit detection for weakness spots

**CONTEXT**: Tapping weakness spots should apply 2x damage multiplier

**OBJECTIVE**: Detect and reward weakness hits

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
test('hitting weakness spot deals double damage', async () => {
  const { getByTestId, getByText } = render(<App />);

  const weaknessSpot = getByTestId('weakness-spot-0');
  fireEvent.press(weaknessSpot);

  // Should show 2x damage (20 instead of 10)
  await waitFor(() => {
    expect(getByText('20')).toBeTruthy();
  });
});

test('weakness hit shows special effect', async () => {
  const { getByTestId } = render(<App />);

  const weaknessSpot = getByTestId('weakness-spot-0');
  fireEvent.press(weaknessSpot);

  // Should show critical hit indicator
  await waitFor(() => {
    expect(getByTestId('critical-hit-effect')).toBeTruthy();
  });
});
```

#### Step 2: Implement Detection Logic
- Check if tap coordinates hit weakness area
- Apply 2x damage multiplier
- Show special visual effect (flash/burst)
- Play distinct sound effect

**FILES TO MODIFY**:
- `frontend/App.tsx` - Add hit detection logic

**ACCEPTANCE CRITERIA**:
- [ ] Weakness hits deal 2x damage
- [ ] Special effect on weakness hit
- [ ] Normal hits still work
- [ ] Tests verify multiplier

**DELIVERABLE**: Functional weakness system

---

### Task 2.3: Rotating Weakness Positions with TDD
**ROLE**: You are implementing dynamic weakness repositioning

**CONTEXT**: Weakness spots should move every 3-5 seconds to add challenge

**OBJECTIVE**: Implement timed weakness rotation

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
test('weakness spots rotate position after timer', async () => {
  const { getByTestId } = render(<App />);

  const initialSpot = getByTestId('weakness-spot-0');
  const initialPosition = initialSpot.props.style.left;

  // Wait for rotation (3 seconds)
  await act(async () => {
    jest.advanceTimersByTime(3000);
  });

  const rotatedSpot = getByTestId('weakness-spot-0');
  const newPosition = rotatedSpot.props.style.left;

  expect(newPosition).not.toBe(initialPosition);
});
```

#### Step 2: Implement Rotation
- Set 3-5 second random timer
- Smoothly animate to new positions
- Ensure spots don't overlap
- Reset timer on rotation

**FILES TO MODIFY**:
- `frontend/App.tsx` - Add rotation logic

**ACCEPTANCE CRITERIA**:
- [ ] Spots move every 3-5 seconds
- [ ] Smooth transition animation
- [ ] New positions are valid
- [ ] Tests verify rotation

**DELIVERABLE**: Dynamic weakness targeting

---

## Phase 3: Combo System (Day 3)
*Duration: 1 day | Priority: P0 | Prerequisites: Phase 2*

### Task 3.1: Combo Counter Display with TDD
**ROLE**: You are implementing the combo tracking system

**CONTEXT**: Players need visual feedback for consecutive hits (TDD section 11 Phase 3)

**OBJECTIVE**: Track and display combo count

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
test('combo counter increases on consecutive hits', async () => {
  const { getByTestId, getByText } = render(<App />);
  const enemy = getByTestId('enemy');

  // First hit
  fireEvent.press(enemy);
  await waitFor(() => {
    expect(getByText('Combo x1')).toBeTruthy();
  });

  // Second hit
  fireEvent.press(enemy);
  await waitFor(() => {
    expect(getByText('Combo x2')).toBeTruthy();
  });
});
```

#### Step 2: Implement Counter
- Track consecutive hits
- Display "Combo x[N]" on screen
- Position in top-right corner
- Animate on increment

**VISUAL REQUIREMENTS**:
| Property | Value | Notes |
|----------|-------|-------|
| **Position** | Top-right corner | 16px padding |
| **Font Size** | 24px base, scales with combo | Max 48px |
| **Color** | White → Gold gradient | At 10+ combo |
| **Animation** | Bounce on increment | 300ms duration |

**FILES TO MODIFY**:
- `frontend/App.tsx` - Add combo state and UI

**ACCEPTANCE CRITERIA**:
- [ ] Combo count tracks hits
- [ ] UI shows current combo
- [ ] Animation on increment
- [ ] Tests verify counting

**DELIVERABLE**: Visible combo system

---

### Task 3.2: Combo Damage Multipliers with TDD
**ROLE**: You are implementing escalating damage bonuses

**CONTEXT**: Higher combos should reward increased damage (1x, 1.5x, 2x, 3x)

**OBJECTIVE**: Apply damage multipliers based on combo count

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
test('combo multiplies damage', async () => {
  const { getByTestId, getByText } = render(<App />);
  const enemy = getByTestId('enemy');

  // Build 3-hit combo
  fireEvent.press(enemy); // 10 damage (1x)
  fireEvent.press(enemy); // 15 damage (1.5x)
  fireEvent.press(enemy); // 20 damage (2x)

  // Verify escalating damage
  await waitFor(() => {
    expect(getByText('20')).toBeTruthy();
  });
});
```

#### Step 2: Implement Multipliers
- 0-4 hits: 1x multiplier
- 5-9 hits: 1.5x multiplier
- 10-19 hits: 2x multiplier
- 20+ hits: 3x multiplier

**FILES TO MODIFY**:
- `frontend/App.tsx` - Add multiplier calculation

**ACCEPTANCE CRITERIA**:
- [ ] Damage scales with combo
- [ ] Multiplier tiers work correctly
- [ ] Damage numbers reflect multiplier
- [ ] Tests verify scaling

**DELIVERABLE**: Combo damage bonuses

---

### Task 3.3: Combo Break Conditions with TDD
**ROLE**: You are implementing combo reset mechanics

**CONTEXT**: Combos should break on miss or 2+ second pause

**OBJECTIVE**: Add combo break conditions

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
test('combo breaks after 2 second pause', async () => {
  const { getByTestId, getByText, queryByText } = render(<App />);
  const enemy = getByTestId('enemy');

  // Build combo
  fireEvent.press(enemy);
  fireEvent.press(enemy);
  expect(getByText('Combo x2')).toBeTruthy();

  // Wait 2+ seconds
  await act(async () => {
    jest.advanceTimersByTime(2100);
  });

  // Combo should reset
  fireEvent.press(enemy);
  expect(getByText('Combo x1')).toBeTruthy();
});
```

#### Step 2: Implement Break Logic
- Track time since last hit
- Reset combo after 2 seconds
- Show "Combo Lost!" message
- Play break sound effect

**FILES TO MODIFY**:
- `frontend/App.tsx` - Add timeout logic

**ACCEPTANCE CRITERIA**:
- [ ] Combo resets after 2s pause
- [ ] Visual feedback on break
- [ ] Timer resets on each hit
- [ ] Tests verify timeout

**DELIVERABLE**: Complete combo system

---

## Phase 4: Polish & Effects (Day 4)
*Duration: 1 day | Priority: P1 | Prerequisites: Phase 3*

### Task 4.1: Particle Effects System with TDD
**ROLE**: You are implementing visual particle effects

**CONTEXT**: Combat needs satisfying particle effects on hit (TDD section 11 Phase 4)

**OBJECTIVE**: Add particle bursts on enemy hits

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
test('hitting enemy spawns particles', async () => {
  const { getByTestId, getAllByTestId } = render(<App />);
  const enemy = getByTestId('enemy');

  fireEvent.press(enemy);

  // Should spawn 5-10 particles
  await waitFor(() => {
    const particles = getAllByTestId(/particle/);
    expect(particles.length).toBeGreaterThanOrEqual(5);
    expect(particles.length).toBeLessThanOrEqual(10);
  });
});
```

#### Step 2: Implement Particles
- Spawn 5-10 particles per hit
- Particles burst outward from impact point
- Fade out over 500ms
- Random colors (yellow/orange/red)
- Install react-native-skia if needed for GPU acceleration

**DEPENDENCIES TO ADD** (only if performance needs it):
- `react-native-skia` - GPU-accelerated particles

**FILES TO MODIFY**:
- `frontend/App.tsx` - Add particle system

**ACCEPTANCE CRITERIA**:
- [ ] Particles spawn on hit
- [ ] Smooth animation at 60 FPS
- [ ] Auto-cleanup after animation
- [ ] Tests verify spawning

**DELIVERABLE**: Impact particle effects

---

### Task 4.2: Screen Shake Effect with TDD
**ROLE**: You are adding visceral screen shake

**CONTEXT**: Screen shake adds impact feeling to hits

**OBJECTIVE**: Implement proportional screen shake

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
test('screen shakes on enemy hit', async () => {
  const { getByTestId } = render(<App />);
  const gameContainer = getByTestId('game-container');
  const enemy = getByTestId('enemy');

  // Get initial position
  const initialTransform = gameContainer.props.style.transform;

  fireEvent.press(enemy);

  // Should have shake transform applied
  await waitFor(() => {
    const currentTransform = gameContainer.props.style.transform;
    expect(currentTransform).not.toBe(initialTransform);
  });
});
```

#### Step 2: Implement Shake
- Shake intensity scales with damage
- 200ms duration
- Max 10px displacement
- Smooth ease-out animation

**FILES TO MODIFY**:
- `frontend/App.tsx` - Add shake animation

**ACCEPTANCE CRITERIA**:
- [ ] Screen shakes on hit
- [ ] Intensity scales with damage
- [ ] Smooth animation
- [ ] Tests verify shake

**DELIVERABLE**: Screen shake feedback

---

### Task 4.3: Audio Feedback System
**ROLE**: You are implementing combat audio

**CONTEXT**: Audio feedback enhances combat satisfaction

**OBJECTIVE**: Add sound effects for combat actions

**IMPLEMENTATION** (No TDD for audio - manual testing):
- Hit sound on enemy tap
- Critical sound on weakness hit
- Combo milestone sounds (10, 20, 30)
- Victory fanfare on defeat
- Use Expo Audio API (already installed)

**AUDIO ASSETS NEEDED**:
- `hit.mp3` - Basic hit sound
- `critical.mp3` - Weakness hit
- `combo.mp3` - Combo milestone
- `victory.mp3` - Enemy defeat

**FILES TO MODIFY**:
- `frontend/App.tsx` - Add audio playback

**ACCEPTANCE CRITERIA**:
- [ ] Sound plays on each hit
- [ ] Different sounds for events
- [ ] Volume controls work
- [ ] No audio delays

**DELIVERABLE**: Complete audio feedback

---

## Phase 5: Performance & Optimization (Day 5)
*Duration: 1 day | Priority: P1 | Prerequisites: Phase 4*

### Task 5.1: Performance Optimization
**ROLE**: You are optimizing for 60 FPS gameplay

**CONTEXT**: Combat must maintain 60 FPS with all effects active

**OBJECTIVE**: Optimize rendering and animations

**OPTIMIZATION CHECKLIST**:
- [ ] Implement object pooling for damage numbers
- [ ] Use React.memo for expensive components
- [ ] Move animations to UI thread (useAnimatedStyle)
- [ ] Optimize particle system (limit to 10 active)
- [ ] Profile with React DevTools

**PERFORMANCE TARGETS**:
- Touch response: <100ms
- Frame rate: 60 FPS with 10 particles
- Memory: <50MB for combat system
- No frame drops during combo

**FILES TO MODIFY**:
- `frontend/App.tsx` - Performance optimizations

**VALIDATION**:
```bash
# Run performance profiling
npm run profile

# Check frame rate
adb shell dumpsys gfxinfo com.yourapp
```

**DELIVERABLE**: Optimized 60 FPS combat

---

### Task 5.2: Integration Testing Suite
**ROLE**: You are validating the complete combat system

**CONTEXT**: All features need end-to-end testing

**OBJECTIVE**: Create comprehensive integration tests

**TEST SCENARIOS**:
```typescript
// Complete combat flow test
test('complete combat session flow', async () => {
  // Spawn enemy
  // Build combo to 10+
  // Hit weakness for bonus
  // Defeat enemy
  // Collect Pyreal
  // Verify new enemy spawns
});

// Performance regression test
test('maintains 60fps with effects', async () => {
  // Spawn particles
  // Trigger screen shake
  // Verify no frame drops
});
```

**FILES TO CREATE**:
- `frontend/__tests__/combat.integration.test.tsx`

**ACCEPTANCE CRITERIA**:
- [ ] All features tested together
- [ ] Performance benchmarks verified
- [ ] Edge cases covered
- [ ] 80%+ code coverage

**DELIVERABLE**: Complete test suite

---

## Task Execution Guidelines

### For Development Team
1. **Follow TDD strictly**: Write test first, then code
2. **Each task is demo-able**: Show working feature after each task
3. **No infrastructure setup**: Use existing App.tsx first
4. **Install dependencies only when needed**: Not upfront
5. **Maintain 60 FPS**: Profile after each feature

### Testing Commands
```bash
# Run tests
cd frontend && npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- App.test.tsx

# Watch mode for TDD
npm test -- --watch
```

### Code Organization
Since this is a focused combat feature with <10 components, use flat structure in frontend:
- `frontend/App.tsx` - Main combat implementation
- `frontend/App.test.tsx` - All combat tests
- No need for separate modules yet (will refactor when app grows)

## Risk Mitigation

### Performance Risk
**RISK**: React Native performance on older devices
**MITIGATION**:
- Implement "Performance Mode" toggle
- Reduce particles to 5 maximum
- Disable screen shake option
- Test on 2019 device minimum

### Touch Latency Risk
**RISK**: Touch response >100ms
**MITIGATION**:
- Use PanResponder for better performance
- Implement touch prediction
- Queue inputs to prevent drops

## Summary Statistics

- **Total Tasks**: 14
- **Estimated Duration**: 5 days
- **Critical Path**: Tasks 1.1 → 1.2 → 1.3 → 2.1 → 2.2
- **Parallel Potential**: 30% (Polish tasks can parallelize)
- **Test Coverage Target**: >80%

---
*Generated from TDD: `/docs/specs/core-combat-tap/tdd_core_combat_tap_mechanic_20250928.md`*
*Generation timestamp: 2025-09-28*
*Optimized for: Human TDD execution with React Native*