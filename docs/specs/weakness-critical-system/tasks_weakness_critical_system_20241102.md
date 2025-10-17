# Weakness & Critical Hit System Implementation Tasks

## Document Metadata
- **Source TDD**: tdd_weakness_critical_system_20241102.md
- **Generated**: 2024-11-02 20:15:00 UTC
- **Total Tasks**: 9 tasks (all delivering user-visible functionality)

## Phase 1: Basic Weakness Spot with Critical Damage
*Duration: 2 days | Priority: P0 | Prerequisites: None*

**LEAN PRINCIPLE**: First task delivers immediate playable functionality - users can tap weakness spots for critical damage.

### Task 1.1: Implement Visible Weakness Spot with 2x Damage
**ROLE**: You are a senior React Native developer implementing the first user-visible critical hit feature

**CONTEXT**: Based on the TDD section 3 (System Architecture), we need to add a weakness spot overlay to the existing enemy in App.tsx that players can tap for double damage.

**OBJECTIVE**: Add a tappable weakness spot that appears on the enemy and grants 2x damage when hit

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
// App.test.tsx - ADD to existing file
describe('Weakness Spot - Basic Critical Hit', () => {
  test('should display weakness spot on enemy', () => {
    const { getByTestId } = render(<App />);
    const weaknessSpot = getByTestId('weakness-spot');
    expect(weaknessSpot).toBeTruthy();
  });

  test('should deal 2x damage when weakness spot is tapped', async () => {
    const { getByTestId, findByText } = render(<App />);
    const weaknessSpot = getByTestId('weakness-spot');

    fireEvent.press(weaknessSpot);

    // Assuming base damage is around 10-20 with power=1
    const damageNumber = await findByText(/[2-4][0-9]/);
    expect(damageNumber).toBeTruthy();
  });
});
```

#### Step 2: Minimal Implementation in App.tsx
- Add weakness spot state: `const [weaknessPosition, setWeaknessPosition] = useState({x: 150, y: 200});`
- Add `WeaknessSpot` component inline in App.tsx (no separate file yet)
- Modify `handleEnemyTap` to check if tap coordinates hit weakness spot
- Apply 2x multiplier to damage calculation when weakness is hit

**VISUAL REQUIREMENTS**:
```yaml
visual_requirements:
  component_name: "WeaknessSpot"

  dimensions:
    width: "60px"
    height: "60px"
    shape: "circle"

  colors:
    primary: "#FFD700"  # Golden yellow
    glow: "rgba(255, 215, 0, 0.3)"

  animations:
    type: "pulse"
    duration: "2000ms"
    scale: "1.0 to 1.2"

  position:
    relative_to: "enemy-container"
    initial: "{x: 150, y: 200}"
```

**ACCEPTANCE CRITERIA**:
- [ ] Golden circle appears on enemy
- [ ] Tapping weakness spot deals 2x damage (visible in damage numbers)
- [ ] Tapping outside weakness deals normal damage
- [ ] Visual pulse animation on weakness spot
- [ ] Tests pass for weakness display and damage multiplier

**DELIVERABLE**: Players can now tap a glowing spot for critical damage, making combat more engaging

---

### Task 1.2: Add "CRITICAL!" Feedback Text
**ROLE**: You are implementing visual feedback for successful critical hits

**CONTEXT**: Players need clear feedback when they successfully hit the weakness spot (TDD Section 5 - Requirement 7)

**OBJECTIVE**: Display "CRITICAL!" text above damage numbers when weakness spot is hit

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
// App.test.tsx - ADD to weakness tests
test('should display CRITICAL text on weakness hit', async () => {
  const { getByTestId, findByText } = render(<App />);
  const weaknessSpot = getByTestId('weakness-spot');

  fireEvent.press(weaknessSpot);

  const criticalText = await findByText('CRITICAL!');
  expect(criticalText).toBeTruthy();
});
```

#### Step 2: Implementation
- Add `isCritical` property to DamageNumber interface
- Pass `isCritical: true` when weakness is hit
- Render "CRITICAL!" text in AnimatedDamageNumber component when `isCritical` is true

**VISUAL REQUIREMENTS**:
| Property | Value | Notes |
|----------|-------|-------|
| **Text** | "CRITICAL!" | Above damage number |
| **Color** | #FFD700 | Golden, matching weakness |
| **Size** | 24px | Larger than damage text |
| **Duration** | 1000ms | Fades with damage |
| **Position** | y - 20px from damage | Stacked above |

**ACCEPTANCE CRITERIA**:
- [ ] "CRITICAL!" text appears on weakness hits
- [ ] Text is golden colored and prominent
- [ ] Text animates with damage number
- [ ] No text appears on normal hits
- [ ] Test passes for critical text display

**DELIVERABLE**: Clear visual confirmation when players successfully hit weakness spots

---

## Phase 2: Dynamic Weakness Movement & Timing
*Duration: 2 days | Priority: P0 | Prerequisites: Phase 1*

### Task 2.1: Implement Weakness Spot Movement
**ROLE**: You are implementing dynamic weakness positioning

**CONTEXT**: Static weakness spots become predictable. Per TDD Section 3, weakness spots should move every 2-3 seconds to random positions.

**OBJECTIVE**: Make weakness spots relocate periodically to maintain challenge

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
// App.test.tsx
test('should move weakness spot after duration', async () => {
  const { getByTestId } = render(<App />);
  const initialSpot = getByTestId('weakness-spot');
  const initialPosition = {
    x: parseInt(initialSpot.props.style.left),
    y: parseInt(initialSpot.props.style.top)
  };

  // Wait for movement (using 3 seconds for level 1-10)
  await waitFor(() => {
    const movedSpot = getByTestId('weakness-spot');
    const newPosition = {
      x: parseInt(movedSpot.props.style.left),
      y: parseInt(movedSpot.props.style.top)
    };
    expect(newPosition).not.toEqual(initialPosition);
  }, { timeout: 3500 });
});
```

#### Step 2: Implementation
- Define 5 preset positions relative to enemy bounds
- Add `useEffect` timer to move weakness spot every 3 seconds
- Use `Animated.timing` for smooth position transitions (300ms)
- Generate next random position excluding current position

**ACCEPTANCE CRITERIA**:
- [ ] Weakness spot changes position every 3 seconds
- [ ] Smooth animated transition between positions
- [ ] Position is randomly selected from 5 presets
- [ ] Timer resets on each move
- [ ] Test verifies position changes

**DELIVERABLE**: Dynamic weakness spots that keep combat engaging and unpredictable

---

### Task 2.2: Level-Based Duration Scaling
**ROLE**: You are implementing progressive difficulty

**CONTEXT**: TDD Section 3 specifies duration should decrease with player level: 3.0s (L1-10), 2.5s (L11-25), 2.0s (L26+)

**OBJECTIVE**: Make weakness spots move faster as players level up

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
test('should scale weakness duration based on level', () => {
  // Test level 5 (should be 3 seconds)
  const { rerender } = render(<App />);
  // Mock or set level to 5
  expect(getWeaknessDuration(5)).toBe(3000);

  // Test level 15 (should be 2.5 seconds)
  expect(getWeaknessDuration(15)).toBe(2500);

  // Test level 30 (should be 2 seconds)
  expect(getWeaknessDuration(30)).toBe(2000);
});
```

#### Step 2: Implementation
- Create `getWeaknessDuration(level)` function with level thresholds
- Update timer to use dynamic duration based on current level
- Pass player level from existing state to weakness timing logic

**ACCEPTANCE CRITERIA**:
- [ ] Duration is 3s for levels 1-10
- [ ] Duration is 2.5s for levels 11-25
- [ ] Duration is 2s for levels 26+
- [ ] Weakness timer updates when level changes
- [ ] Tests verify all duration thresholds

**DELIVERABLE**: Progressive difficulty that scales with player progression

---

## Phase 3: Combo System
*Duration: 2 days | Priority: P0 | Prerequisites: Phase 2*

### Task 3.1: Implement Combo Counter
**ROLE**: You are implementing the combo tracking system

**CONTEXT**: TDD Section 3 requires tracking consecutive critical hits with visible counter and damage bonuses

**OBJECTIVE**: Track and display combo streaks for consecutive weakness hits

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
describe('Combo System', () => {
  test('should increment combo on consecutive critical hits', async () => {
    const { getByTestId, getByText } = render(<App />);

    // Hit weakness spot twice
    fireEvent.press(getByTestId('weakness-spot'));
    await waitFor(() => getByText('x1'));

    fireEvent.press(getByTestId('weakness-spot'));
    await waitFor(() => getByText('x2'));
  });

  test('should reset combo on miss', async () => {
    const { getByTestId, getByText, queryByText } = render(<App />);

    // Build combo
    fireEvent.press(getByTestId('weakness-spot'));
    await waitFor(() => getByText('x1'));

    // Miss (tap enemy outside weakness)
    fireEvent.press(getByTestId('enemy-container'));

    // Combo should be gone
    expect(queryByText(/x\d/)).toBeNull();
  });
});
```

#### Step 2: Implementation
- Add combo state: `const [combo, setCombo] = useState(0);`
- Create `useComboTracker` hook inline (can extract later)
- Increment on critical hit, reset on normal hit
- Display combo counter when combo > 0

**VISUAL REQUIREMENTS**:
```yaml
visual_requirements:
  component_name: "ComboCounter"

  position:
    top: "60px"
    right: "20px"

  typography:
    font_size: "28px"
    font_weight: "bold"

  colors:
    text: "#FFD700"
    shadow: "2px 2px 4px rgba(0,0,0,0.5)"

  format: "x{combo}"  # Shows as x1, x2, x3, etc
```

**ACCEPTANCE CRITERIA**:
- [ ] Combo counter appears after first critical
- [ ] Counter increments on consecutive criticals
- [ ] Counter resets to 0 on miss
- [ ] Visual "x1", "x2", etc. display
- [ ] Tests verify increment and reset behavior

**DELIVERABLE**: Visible combo system that rewards consistent accuracy

---

### Task 3.2: Apply Combo Damage Multiplier
**ROLE**: You are implementing cumulative damage bonuses

**CONTEXT**: TDD specifies +10% damage per combo level, capped at +50% (5 combo)

**OBJECTIVE**: Make combos provide tangible damage increase

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```typescript
test('should apply combo damage multiplier', async () => {
  const { getByTestId, findByTestId } = render(<App />);

  // Build 3x combo (should be 1.3x multiplier on top of 2x crit)
  for (let i = 0; i < 3; i++) {
    fireEvent.press(getByTestId('weakness-spot'));
    await new Promise(r => setTimeout(r, 100));
  }

  // Next hit should show increased damage
  // Base ~10 * 2 (crit) * 1.3 (combo) = ~26
  fireEvent.press(getByTestId('weakness-spot'));
  const damageText = await findByTestId(/damage-number-/);
  const damage = parseInt(damageText.props.children);
  expect(damage).toBeGreaterThanOrEqual(26);
});
```

#### Step 2: Implementation
- Calculate combo multiplier: `1.0 + Math.min(combo * 0.1, 0.5)`
- Apply to damage calculation: `baseDamage * critMultiplier * comboMultiplier`
- Cap combo effect at 5 hits (+50% max)

**ACCEPTANCE CRITERIA**:
- [ ] Each combo level adds +10% damage
- [ ] Multiplier caps at +50% (5 combo)
- [ ] Damage numbers reflect combo bonus
- [ ] Combo multiplier stacks with critical multiplier
- [ ] Test verifies damage scaling

**DELIVERABLE**: Meaningful reward for maintaining combo streaks

---

## Phase 4: Enhanced Feedback
*Duration: 1 day | Priority: P1 | Prerequisites: Phase 3*

### Task 4.1: Enhanced Haptic Feedback
**ROLE**: You are enhancing the tactile experience

**CONTEXT**: TDD requires distinct haptic feedback for critical hits using Heavy impact

**OBJECTIVE**: Provide stronger haptic feedback for critical hits

**TDD IMPLEMENTATION**:
#### Step 1: Write Test (with mock)
```typescript
test('should trigger heavy haptic on critical hit', async () => {
  const hapticSpy = jest.spyOn(Haptics, 'impactAsync');
  const { getByTestId } = render(<App />);

  fireEvent.press(getByTestId('weakness-spot'));

  expect(hapticSpy).toHaveBeenCalledWith(
    Haptics.ImpactFeedbackStyle.Heavy
  );
});
```

#### Step 2: Implementation
- Modify handleEnemyTap to check if hit was critical
- Call `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)` for crits
- Keep `Medium` feedback for normal hits

**ACCEPTANCE CRITERIA**:
- [ ] Heavy haptic feedback on critical hits
- [ ] Medium feedback maintained for normal hits
- [ ] No delay in haptic response (<20ms)
- [ ] Test verifies correct haptic style
- [ ] Fallback for devices without haptics

**DELIVERABLE**: Satisfying tactile feedback that reinforces critical hit success

---

### Task 4.2: Critical Hit Sound Effect
**ROLE**: You are implementing audio feedback

**CONTEXT**: TDD specifies distinct sound at 1.2x pitch for critical hits

**OBJECTIVE**: Add satisfying audio confirmation for critical hits

**TDD IMPLEMENTATION**:
#### Step 1: Write Test (with mock)
```typescript
test('should play critical sound at higher pitch', async () => {
  const soundSpy = jest.spyOn(Audio.Sound.prototype, 'setRateAsync');
  const { getByTestId } = render(<App />);

  fireEvent.press(getByTestId('weakness-spot'));

  await waitFor(() => {
    expect(soundSpy).toHaveBeenCalledWith(1.2, true);
  });
});
```

#### Step 2: Implementation
- Load a critical hit sound file (can use existing with pitch change)
- Set playback rate to 1.2 for critical hits
- Reset rate to 1.0 for normal hits
- Handle sound loading/error states

**ACCEPTANCE CRITERIA**:
- [ ] Distinct sound plays on critical hit
- [ ] Sound is 1.2x pitch (higher/exciting)
- [ ] Normal hit sound unchanged
- [ ] No delay in audio feedback
- [ ] Silent fallback if sound fails

**DELIVERABLE**: Audio feedback that makes critical hits feel impactful

---

## Phase 5: Polish & Accessibility
*Duration: 1 day | Priority: P2 | Prerequisites: Phase 4*

### Task 5.1: Accessibility Features
**ROLE**: You are ensuring the feature is accessible to all players

**CONTEXT**: TDD Section 6 requires WCAG compliance and accessibility options

**OBJECTIVE**: Add accessibility options for weakness spots

**TDD IMPLEMENTATION**:
#### Step 1: Write Test
```typescript
test('should support larger weakness spots in accessibility mode', () => {
  // Set accessibility preference
  AsyncStorage.setItem('weakness_spot_size', 'large');

  const { getByTestId } = render(<App />);
  const spot = getByTestId('weakness-spot');

  expect(spot.props.style.width).toBe(90);
  expect(spot.props.style.height).toBe(90);
});
```

#### Step 2: Implementation
- Add settings to AsyncStorage for spot size preference
- Support 60px (default) and 90px (accessible) sizes
- Add screen reader labels to weakness spot
- Ensure color contrast meets WCAG AA (4.5:1)

**ACCEPTANCE CRITERIA**:
- [ ] Option for larger weakness spots (90px)
- [ ] Settings persist between sessions
- [ ] Screen reader announces "Weakness spot available"
- [ ] Golden color has sufficient contrast
- [ ] Tests verify size options work

**DELIVERABLE**: Inclusive gameplay that works for players with different needs

---

## Task Execution Guidelines

### For Development Team
1. Each task builds on the previous - complete in order within phases
2. Always write tests first (TDD approach)
3. Keep implementations minimal initially, refactor after tests pass
4. All code goes in App.tsx initially (we'll extract modules when needed)
5. Commit after each task completion with descriptive message

### Validation Commands
```bash
# After each task
npm test -- --coverage
npm run lint
npm run typecheck

# Run the app
npm start
```

## Risk Mitigation

**Risk**: Performance impact on older devices
**Mitigation**: Monitor FPS after Task 2.1, implement simpler animations if <55 FPS

**Risk**: Touch detection accuracy issues
**Mitigation**: Increase hit box by 10px radius beyond visual if accuracy <40%

## Summary Statistics

- **Total Tasks**: 9 (all user-facing features)
- **No Infrastructure Tasks**: 0 (all deliver functionality)
- **Phases**: 5 progressive enhancement phases
- **Timeline**: 6 days total
- **First Playable**: After Task 1.1 (Day 1)
- **MVP Complete**: After Task 3.2 (Day 4)

## Lean Validation ✅
- [x] Task 1.1 delivers immediate playable feature (tap weakness for 2x damage)
- [x] Every task adds user-visible functionality
- [x] No separate setup or infrastructure tasks
- [x] Files created only as needed (all in App.tsx initially)
- [x] Each task independently demo-able
- [x] Progressive enhancement from simple to complex

---
*Generated from TDD: tdd_weakness_critical_system_20241102.md*
*Generation timestamp: 2024-11-02 20:15:00 UTC*
*Optimized for: Human developer execution with TDD approach*