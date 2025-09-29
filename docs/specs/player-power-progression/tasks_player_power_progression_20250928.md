# Player Power Progression Implementation Tasks

## Document Metadata
- **Source TDD**: tdd_player_power_progression_20250928.md
- **Generated**: 2025-09-28T20:00:00Z
- **Total Tasks**: 8 (Lean, user-focused tasks)

## Implementation Status Check
Based on current codebase scan:
- Frontend structure: Single-file architecture (App.tsx, App.test.tsx)
- No modular structure yet (will emerge as needed per lean principles)
- Existing test setup with Jest and React Native Testing Library

---

## Phase 1: First User-Visible Feature - Power-Based Damage
*Duration: 1 day | Priority: P0 | Prerequisites: None*

**LEAN PRINCIPLE**: First task MUST deliver working functionality a user can interact with. NO infrastructure-only tasks.

### Task 1.1: Implement Power-Based Damage with TDD
**ROLE**: You are a senior React Native developer implementing the core Power mechanic using strict TDD methodology

**CONTEXT**: Based on TDD section 7 (Test-Driven Development Strategy) and section 3 (Component Design), we need to implement the PowerManager that multiplies damage by a Power value.

**OBJECTIVE**: Users can see and interact with Power-based damage that scales their tap effectiveness

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Test
```typescript
// In App.test.tsx - Test for Power-based damage
describe('Power System', () => {
  test('should display Power value of 1 initially', () => {
    render(<App />);
    expect(screen.getByText(/Power: 1/)).toBeTruthy();
  });

  test('should apply Power multiplier to damage', async () => {
    render(<App />);
    const enemy = screen.getByTestId('enemy');

    // Get initial health
    const initialHealth = 500;

    // Tap enemy
    const user = userEvent.setup();
    await user.press(enemy);

    // Damage should be between 10-15 (base) × 1 (power)
    const healthText = await screen.findByText(/HP:/);
    const newHealth = parseInt(healthText.children[0]);
    const damage = initialHealth - newHealth;

    expect(damage).toBeGreaterThanOrEqual(10);
    expect(damage).toBeLessThanOrEqual(15);
  });
});
```

#### Step 2: Minimal Implementation
- Add Power state to App.tsx (start at 1)
- Create calculateDamageWithPower function
- Display Power value on screen
- Apply Power multiplier when enemy is tapped

#### Step 3: Refactor (if needed)
- Extract Power calculation logic if it grows complex
- Keep all logic in App.tsx for now (no premature abstraction)

**FILES TO CREATE**: None - modify existing App.tsx and App.test.tsx

**DEPENDENCIES TO ADD**: None - use existing React Native components

**ACCEPTANCE CRITERIA**:
- [ ] User sees "Power: 1" displayed on screen
- [ ] Damage dealt equals Power × (10-15 random base)
- [ ] All tests pass
- [ ] Enemy takes variable damage based on Power

**DELIVERABLE**: Players can see their Power value and it directly affects damage output

---

### Task 1.2: Add XP Gain from Enemy Defeats
**ROLE**: You are implementing XP accumulation to enable progression

**CONTEXT**: Per TDD section 2 (Functional Requirements), defeating enemies grants XP equal to enemy_level × 10

**OBJECTIVE**: Players earn XP when defeating enemies, seeing their progress accumulate

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Test
```typescript
test('should gain XP when defeating enemy', async () => {
  render(<App />);

  // Find XP display (should show 0 initially)
  expect(screen.getByText(/XP: 0/)).toBeTruthy();

  // Defeat an enemy (level 1 enemy = 10 XP)
  const enemy = screen.getByTestId('enemy');

  // Tap until enemy defeated (mock or reduce HP for test)
  // ... defeat enemy ...

  // Should gain 10 XP
  await waitFor(() => {
    expect(screen.getByText(/XP: 10/)).toBeTruthy();
  });
});
```

#### Step 2: Minimal Implementation
- Add currentXP state to App.tsx
- Display "XP: {currentXP}" on screen
- When enemy HP reaches 0, add (enemyLevel × 10) to currentXP
- Show XP gain animation/text briefly

**FILES TO CREATE**: None - extend App.tsx

**DEPENDENCIES TO ADD**: None

**ACCEPTANCE CRITERIA**:
- [ ] User sees current XP displayed
- [ ] XP increases by enemyLevel × 10 when enemy defeated
- [ ] XP persists during session
- [ ] Visual feedback when XP gained

**DELIVERABLE**: Players gain and see XP accumulation from defeating enemies

---

## Phase 2: Level-Up System
*Duration: 1 day | Priority: P0 | Prerequisites: Phase 1*

### Task 2.1: Implement Level-Up with Power Increase
**ROLE**: You are implementing the core progression loop with level-ups

**CONTEXT**: Per TDD section 2, level threshold = level × 100 XP, and Power increases by 1 per level

**OBJECTIVE**: Players level up when reaching XP thresholds, immediately gaining Power

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Test
```typescript
test('should level up at XP threshold', async () => {
  render(<App />);

  // Start at level 1
  expect(screen.getByText(/Level: 1/)).toBeTruthy();
  expect(screen.getByText(/Power: 1/)).toBeTruthy();

  // Simulate gaining 100 XP (threshold for level 2)
  // ... defeat enemies to gain 100 XP ...

  await waitFor(() => {
    expect(screen.getByText(/Level: 2/)).toBeTruthy();
    expect(screen.getByText(/Power: 2/)).toBeTruthy();
    expect(screen.getByText('LEVEL UP!')).toBeTruthy();
  });
});
```

#### Step 2: Minimal Implementation
- Add level state (starts at 1)
- Calculate XP threshold: level × 100
- Check for level-up after each XP gain
- On level-up: increment level, set Power = level, reset currentXP
- Display "LEVEL UP!" message for 1.5 seconds

**FILES TO CREATE**: None - extend existing App.tsx

**DEPENDENCIES TO ADD**: None

**ACCEPTANCE CRITERIA**:
- [ ] User sees current Level displayed
- [ ] Level increases when XP threshold reached
- [ ] Power equals current level
- [ ] "LEVEL UP!" celebration appears
- [ ] XP resets to 0 after level-up

**DELIVERABLE**: Complete level-up system with Power progression

---

### Task 2.2: Add XP Progress Bar Visualization
**ROLE**: You are creating visual feedback for progression

**CONTEXT**: Per TDD section 3, ProgressionDisplay component shows XP progress

**OBJECTIVE**: Players see visual progress toward next level

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Test
```typescript
test('should display XP progress bar', () => {
  render(<App />);

  // Should show progress bar
  const progressBar = screen.getByRole('progressbar');
  expect(progressBar).toBeTruthy();

  // Should show XP text
  expect(screen.getByText(/0\/100/)).toBeTruthy(); // Level 1 threshold
});

test('should animate XP bar on progress', async () => {
  render(<App />);

  // Gain some XP
  // ... defeat enemy for 10 XP ...

  await waitFor(() => {
    expect(screen.getByText(/10\/100/)).toBeTruthy();
    // Progress bar should be at 10%
  });
});
```

#### Step 2: Minimal Implementation
- Create XPBar component in App.tsx (not separate file yet)
- Use View with dynamic width based on percentage
- Display "currentXP/requiredXP" text
- Add smooth width animation
- Glow effect when > 90% (optional polish)

#### Step 3: Install Animation Library (if needed)
- Install react-native-reanimated ONLY if native Animated API insufficient

**FILES TO CREATE**: None initially (component in App.tsx)

**DEPENDENCIES TO ADD**: react-native-reanimated (only if needed for smooth animations)

**ACCEPTANCE CRITERIA**:
- [ ] Progress bar shows XP percentage visually
- [ ] Text displays current/required XP
- [ ] Bar animates smoothly on XP gain
- [ ] Bar resets on level-up

**DELIVERABLE**: Visual XP progress bar showing advancement toward next level

---

## Phase 3: Data Persistence
*Duration: 0.5 days | Priority: P0 | Prerequisites: Phase 2*

### Task 3.1: Save and Load Progression with AsyncStorage
**ROLE**: You are implementing progression persistence across sessions

**CONTEXT**: Per TDD section 5 (Data Model), progression data must persist using AsyncStorage

**OBJECTIVE**: Players continue from their previous level when returning to game

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Test
```typescript
test('should save progression to AsyncStorage', async () => {
  const mockSetItem = jest.spyOn(AsyncStorage, 'setItem');

  render(<App />);

  // Level up to trigger save
  // ... gain XP and level up ...

  await waitFor(() => {
    expect(mockSetItem).toHaveBeenCalledWith(
      '@progression_data',
      expect.stringContaining('"level":2')
    );
  });
});

test('should load progression on app start', async () => {
  // Mock saved data
  jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(
    JSON.stringify({ level: 5, power: 5, currentXP: 250 })
  );

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/Level: 5/)).toBeTruthy();
    expect(screen.getByText(/Power: 5/)).toBeTruthy();
  });
});
```

#### Step 2: Minimal Implementation
- Save after each XP gain and level-up
- Load on component mount (useEffect)
- Handle null/corrupted data with defaults
- Simple JSON stringify/parse (no checksums yet)

**FILES TO CREATE**: None - add to App.tsx

**DEPENDENCIES TO ADD**: None - AsyncStorage already in React Native

**ACCEPTANCE CRITERIA**:
- [ ] Progress saves automatically
- [ ] Progress loads on app start
- [ ] Handles missing/corrupt data gracefully
- [ ] Tests verify save/load cycle

**DELIVERABLE**: Persistent progression across app sessions

---

## Phase 4: Polish and Feedback
*Duration: 1 day | Priority: P1 | Prerequisites: Phase 3*

### Task 4.1: Level-Up Celebration Effects
**ROLE**: You are adding satisfying feedback for progression moments

**CONTEXT**: Per TDD section 2, level-up should trigger 1.5-second celebration

**OBJECTIVE**: Players feel rewarded when leveling up

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Test
```typescript
test('should show celebration animation on level up', async () => {
  render(<App />);

  // Trigger level up
  // ... gain 100 XP ...

  // Celebration should appear
  await waitFor(() => {
    expect(screen.getByText('LEVEL UP!')).toBeTruthy();
    expect(screen.getByTestId('celebration-particles')).toBeTruthy();
  });

  // Should disappear after 1.5 seconds
  await waitFor(() => {
    expect(screen.queryByText('LEVEL UP!')).toBeFalsy();
  }, { timeout: 1600 });
});
```

#### Step 2: Minimal Implementation
- Create LevelUpEffect component (can be in App.tsx initially)
- Show "LEVEL UP!" text with scaling animation
- Add particle effects (simple animated Views)
- Auto-hide after 1.5 seconds
- Optional: screen flash, haptic feedback

**FILES TO CREATE**: LevelUpEffect.tsx (only if component gets complex)

**DEPENDENCIES TO ADD**: None initially (use Animated API)

**ACCEPTANCE CRITERIA**:
- [ ] "LEVEL UP!" appears prominently
- [ ] Particle effects animate
- [ ] Celebration lasts 1.5 seconds
- [ ] Doesn't block gameplay

**DELIVERABLE**: Rewarding level-up celebration experience

---

### Task 4.2: Enemy Scaling by Player Level
**ROLE**: You are implementing dynamic difficulty scaling

**CONTEXT**: Per TDD section 5, enemies scale with player level in brackets

**OBJECTIVE**: Game remains challenging as players progress

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Test
```typescript
test('should scale enemy HP with player level', () => {
  // Test level 1-10 bracket
  const hp1 = calculateEnemyHP(1);
  expect(hp1).toBe(500);

  // Test level 11-25 bracket
  const hp15 = calculateEnemyHP(15);
  expect(hp15).toBeGreaterThan(500);

  // Test level 26-50 bracket
  const hp30 = calculateEnemyHP(30);
  expect(hp30).toBeGreaterThan(hp15);
});

test('should give scaled XP rewards', () => {
  const xp5 = calculateXPReward(5);
  expect(xp5).toBe(50); // level 5 × 10

  const xp20 = calculateXPReward(20);
  expect(xp20).toBe(200); // level 20 × 10
});
```

#### Step 2: Minimal Implementation
- Modify enemy spawn to use player level
- Scale HP based on brackets: 1-10, 11-25, 26-50, 51-100, 100+
- Enemy level matches player level
- XP reward = enemyLevel × 10
- Pyreal reward = enemyLevel × 5

**FILES TO CREATE**: None - modify existing enemy logic in App.tsx

**DEPENDENCIES TO ADD**: None

**ACCEPTANCE CRITERIA**:
- [ ] Enemy HP scales with player level
- [ ] XP rewards scale appropriately
- [ ] Enemies remain challenging at all levels
- [ ] Smooth difficulty progression

**DELIVERABLE**: Balanced gameplay at all progression levels

---

## Task Execution Guidelines

### For Human Developers
1. Follow TDD strictly - Red, Green, Refactor for each feature
2. Start with Task 1.1 - no skipping to "fun" tasks
3. Keep everything in App.tsx until it becomes unwieldy
4. Only create new files when components exceed 100 lines
5. Run tests continuously during development
6. Commit after each GREEN state

### For AI Agents
1. Execute tasks sequentially - each builds on previous
2. Write test FIRST, see it fail, then implement
3. Validate all tests pass before moving to next task
4. Keep implementations minimal - no premature optimization
5. Report test results with each task completion

## Critical Implementation Notes

### TDD Enforcement
- **MANDATORY**: Every task starts with a failing test
- Use React Native Testing Library patterns from guide
- Tests must check user-visible behavior, not implementation
- No implementation code before test exists

### Lean Development
- NO separate folders/files until needed
- NO installing libraries until feature requires them
- NO abstractions until duplication appears
- Every task must be demo-able to users

### Architecture Evolution
```
Starting Structure (Tasks 1-3):
frontend/
├── App.tsx (all logic here initially)
├── App.test.tsx (all tests here)
└── package.json

Evolved Structure (Tasks 4+, IF needed):
frontend/
├── App.tsx
├── App.test.tsx
├── components/
│   ├── XPBar.tsx (IF > 100 lines)
│   └── LevelUpEffect.tsx (IF complex)
└── package.json
```

## Success Metrics

- ✅ Task 1 delivers working Power-based damage
- ✅ Each task has user-visible outcome
- ✅ No pure infrastructure tasks
- ✅ Tests written before implementation
- ✅ Dependencies installed only when used
- ✅ File structure emerges from needs
- ✅ Every task independently demo-able

## Risk Mitigation

### Performance Risk
- Profile at Task 4.2 when implementing scaling
- Use React DevTools Profiler
- Optimize only if frame drops detected

### Save Data Corruption
- Task 3.1 includes corruption handling
- Add checksums only if corruption occurs in testing

### Animation Performance
- Start with Animated API (built-in)
- Only add Reanimated if performance issues

---

## Summary Statistics

- **Total Tasks**: 8 (all user-facing features)
- **Infrastructure Tasks**: 0 (created just-in-time)
- **Critical Path**: Tasks 1.1 → 1.2 → 2.1 (must be sequential)
- **Parallel Potential**: Tasks 2.2 and 3.1 can be parallel
- **First Demo**: After Task 1.1 (30 minutes)
- **MVP Complete**: After Task 3.1 (2.5 days)

---
*Generated from TDD: tdd_player_power_progression_20250928.md*
*Generation timestamp: 2025-09-28T20:00:00Z*
*Optimized for: TDD-driven development with lean principles*