# Player Power Progression System Technical Design Document

## Document Control
| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Generated | 2025-09-28 | Draft | Initial TDD from PRD |

## Executive Summary
Implement a single-attribute Power progression system for Asheron's Call Idler that multiplies damage output based on player level, creating the core retention loop through XP-based advancement while maintaining React Native performance and TDD development practices.

## 1. Overview & Context

### Problem Statement
Players currently experience static damage output (50-100) with no character progression, resulting in 73% abandonment rate after 10 minutes due to lack of growth mechanics, directly impacting D7 retention (82% below industry standard).

### Solution Approach
Implement a linear Power progression system where defeating enemies grants XP leading to level-ups, each increasing Power by 1, which directly multiplies damage calculation. Built using React Native with AsyncStorage persistence, following strict TDD methodology with React Native Testing Library.

### Success Criteria
- Session length increases from 3 to 12 minutes within 2 weeks
- 80% of players reach level 10 in first session
- D1 retention improves from 15% to 45%
- All features implemented with >80% test coverage
- Performance maintains 60 FPS during calculations

## 2. Requirements Analysis

### Functional Requirements
**Core Progression Mechanics**
- Power attribute starting at 1, increasing by 1 per level
- XP gain formula: `enemy_level × 10` per defeat
- Level threshold formula: `level × 100` XP required
- Damage formula: `Power × (10 + Math.random() * 5)`
- Immediate level-up upon XP threshold
- AsyncStorage persistence of Level, Power, and current XP

**Visual Feedback System**
- Real-time display of Level and Power values
- Animated XP progress bar with percentage text
- Level-up celebration with particle effects (1.5 seconds)
- Damage number scaling based on Power magnitude

### Non-Functional Requirements
- **Performance**: <5ms Power calculation overhead, 60 FPS maintained
- **Scalability**: Support levels 1-9999 without overflow
- **Security**: Validate integer-only Power values with checksums
- **Availability**: Offline capability with local storage
- **Compatibility**: React Native 0.72+, iOS 12+, Android 8+

## 3. System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────┐
│                  Frontend (React Native)         │
├─────────────────────────────────────────────────┤
│  UI Layer        │  Game Logic    │  State Mgmt │
│  ├─ LevelDisplay │  ├─ PowerCalc  │  ├─ Context │
│  ├─ XPBar        │  ├─ XPManager  │  ├─ Reducer │
│  └─ LevelUpFX    │  └─ DamageCalc │  └─ Actions │
├─────────────────────────────────────────────────┤
│              Storage Layer (AsyncStorage)        │
│  ├─ SaveManager                                  │
│  └─ DataValidator                                │
└─────────────────────────────────────────────────┘
```

### Component Design

#### PowerManager
- **Purpose**: Manages Power attribute and level progression
- **Responsibilities**: Calculate Power from level, validate Power values, handle level-up events
- **Interfaces**:
  - `getCurrentPower(): number`
  - `calculateDamage(baseDamage: number): number`
  - `onLevelUp(newLevel: number): void`
- **Dependencies**: None (pure logic)

#### XPManager
- **Purpose**: Tracks XP accumulation and level thresholds
- **Responsibilities**: Add XP from defeats, check level-up conditions, calculate progress percentage
- **Interfaces**:
  - `addXP(amount: number): boolean` (returns true if leveled)
  - `getProgressToNextLevel(): {current: number, required: number, percentage: number}`
  - `getXPForLevel(level: number): number`
- **Dependencies**: PowerManager (for level-up notifications)

#### ProgressionDisplay
- **Purpose**: Visual representation of progression state
- **Responsibilities**: Render level/Power text, animate XP bar, trigger celebration effects
- **Interfaces**: React component props
  - `level: number`
  - `power: number`
  - `currentXP: number`
  - `requiredXP: number`
  - `onLevelUp: () => void`
- **Dependencies**: React Native Reanimated for animations

#### SaveManager
- **Purpose**: Persist and restore progression data
- **Responsibilities**: Save on state changes, load on app launch, handle corruption recovery
- **Interfaces**:
  - `saveProgression(data: ProgressionData): Promise<void>`
  - `loadProgression(): Promise<ProgressionData | null>`
  - `resetProgression(): Promise<void>`
- **Dependencies**: AsyncStorage, DataValidator

### Data Flow
```
User Taps Enemy → DamageCalculator → Apply Power Multiplier → Deal Damage
                                          ↑
Enemy Defeated → XPManager → Check Threshold → Level Up → PowerManager
                     ↓                              ↓
                SaveManager ← Update State ← Update Context
                     ↓
               AsyncStorage
```

## 4. API Design

### Internal APIs

#### Game State Management
| Method | Purpose | Input | Output |
|--------|---------|-------|--------|
| `calculateDamage` | Apply Power to base damage | `{baseDamage: number, power: number}` | `number` |
| `processEnemyDefeat` | Award XP and check level | `{enemyLevel: number}` | `{xpGained: number, leveledUp: boolean}` |
| `getCurrentStats` | Get player progression | None | `{level: number, power: number, currentXP: number}` |
| `triggerLevelUp` | Handle level-up sequence | `{newLevel: number}` | `void` |

#### Storage Operations
| Method | Purpose | Input | Output |
|--------|---------|-------|--------|
| `persistProgression` | Save to AsyncStorage | `ProgressionData` | `Promise<void>` |
| `restoreProgression` | Load from AsyncStorage | None | `Promise<ProgressionData>` |
| `validateSaveData` | Check data integrity | `unknown` | `boolean` |

### External Integrations
None required for MVP - all functionality is self-contained within the app.

## 5. Data Model

### Entity Design
```typescript
interface ProgressionData {
  level: number;           // 1-9999
  power: number;          // 1-9999 (always equals level)
  currentXP: number;      // 0 to threshold
  totalXP: number;        // lifetime accumulation
  lastSaved: number;      // timestamp
  checksum: string;       // SHA-256 of critical values
}

interface EnemyData {
  id: string;
  level: number;          // matches player level
  maxHealth: number;      // scaled by level brackets
  xpReward: number;       // level × 10
  pyrealReward: number;   // level × 5
}

interface DamageEvent {
  baseDamage: number;     // 10-15 range
  powerMultiplier: number;// player's Power
  finalDamage: number;    // calculated result
  isWeakness: boolean;    // 2x multiplier
  comboMultiplier?: number;
}
```

### Database Schema
Using AsyncStorage (key-value store):
```
Key: "@progression_data"
Value: JSON.stringify(ProgressionData)

Key: "@progression_backup"
Value: JSON.stringify(ProgressionData) // Previous save

Key: "@session_stats"
Value: JSON.stringify({
  sessionStart: number,
  enemiesDefeated: number,
  levelsGained: number
})
```

### Data Access Patterns
- **Read on Launch**: Load progression data once at app start
- **Write on Change**: Save after each XP gain or level-up
- **Backup Strategy**: Keep previous save as backup
- **Cache in Memory**: All active data in React Context
- **Validation**: Checksum verification on load

## 6. Security Design

### Authentication & Authorization
Not applicable for single-player offline progression.

### Data Security
- **Checksum Validation**: SHA-256 hash of `level + power + totalXP + secret`
- **Input Validation**: Ensure all values are positive integers
- **Max Value Caps**: Level/Power capped at 9999
- **Type Guards**: TypeScript strict validation
```typescript
const isValidProgression = (data: unknown): data is ProgressionData => {
  return typeof data === 'object' &&
         Number.isInteger(data.level) &&
         data.level >= 1 && data.level <= 9999 &&
         data.power === data.level;
};
```

### Security Controls
- Prevent negative XP values
- Validate Power equals Level (no manipulation)
- Reset on checksum mismatch
- No network transmission of progression data

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)
**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools
- **Framework**: React Native Testing Library
- **Test Runner**: Jest with React Native preset
- **Mocking**: Jest mocks for AsyncStorage
- **Reference**: `/docs/research/react_native_testing_library_guide_20250918_184418.md`

#### TDD Implementation Process

### Phase 1: Core Logic Tests (Red-Green-Refactor)

**Test Set 1: Power Calculation**
```typescript
// RED: Write failing test first
describe('PowerManager', () => {
  test('should start with Power of 1 at level 1', () => {
    const power = PowerManager.getPowerForLevel(1);
    expect(power).toBe(1);
  });

  test('should calculate damage with Power multiplier', () => {
    const damage = PowerManager.calculateDamage(10, 5);
    expect(damage).toBeGreaterThanOrEqual(50);
    expect(damage).toBeLessThanOrEqual(75);
  });
});

// GREEN: Minimal implementation
class PowerManager {
  static getPowerForLevel(level: number): number {
    return level;
  }

  static calculateDamage(base: number, power: number): number {
    return power * (base + Math.random() * 5);
  }
}

// REFACTOR: Clean up and optimize
```

**Test Set 2: XP Management**
```typescript
// RED: Test XP accumulation
test('should gain XP equal to enemy level × 10', () => {
  const xpManager = new XPManager();
  xpManager.addXP(3, 10); // enemy level 3
  expect(xpManager.getCurrentXP()).toBe(30);
});

test('should level up when XP threshold reached', () => {
  const xpManager = new XPManager(1, 180); // 20 XP from level 2
  const leveledUp = xpManager.addXP(2, 10); // +20 XP
  expect(leveledUp).toBe(true);
  expect(xpManager.getLevel()).toBe(2);
});
```

### Phase 2: Component Tests

**Test Set 3: Visual Components**
```typescript
// RED: Test progression display
test('should display current level and power', () => {
  render(<ProgressionDisplay level={5} power={5} />);
  expect(screen.getByText('Level 5')).toBeTruthy();
  expect(screen.getByText('Power: 5')).toBeTruthy();
});

test('should show XP progress bar', () => {
  render(<XPBar current={150} required={300} />);
  expect(screen.getByText('150/300')).toBeTruthy();
  expect(screen.getByLabelText('Experience: 150 of 300')).toBeTruthy();
});

test('should trigger celebration on level up', async () => {
  const {rerender} = render(<ProgressionDisplay level={1} />);
  rerender(<ProgressionDisplay level={2} />);
  expect(screen.getByText('LEVEL UP!')).toBeTruthy();
  await waitFor(() => {
    expect(screen.queryByText('LEVEL UP!')).toBeFalsy();
  }, {timeout: 1600});
});
```

### Phase 3: Integration Tests

**Test Set 4: Full Flow Testing**
```typescript
test('should persist progression across app restarts', async () => {
  const {result} = renderHook(() => useProgression());

  // Gain some levels
  act(() => result.current.addXP(500));
  expect(result.current.level).toBe(3);

  // Simulate app restart
  const saved = await AsyncStorage.getItem('@progression_data');
  const restored = JSON.parse(saved);
  expect(restored.level).toBe(3);
  expect(restored.power).toBe(3);
});

test('should calculate correct damage after multiple level-ups', () => {
  const game = new GameEngine();

  // Level up to 10
  for (let i = 0; i < 10; i++) {
    game.defeatEnemy(i + 1);
  }

  const damage = game.calculatePlayerDamage();
  expect(damage).toBeGreaterThanOrEqual(100); // Power 10 × base 10
  expect(damage).toBeLessThanOrEqual(150);     // Power 10 × base 15
});
```

### Test Categories

#### Unit Testing (80% coverage target)
- Power calculation accuracy
- XP threshold validation
- Level-up trigger conditions
- Save data validation
- Enemy scaling brackets

#### Integration Testing
- Component state updates
- AsyncStorage persistence
- Level-up animation flow
- XP bar progression
- Damage application to enemies

#### End-to-End Testing
- Complete combat → XP → level-up → Power increase flow
- Session persistence and restoration
- Performance at high levels (100+)

### TDD Checklist for Each Component
- [ ] First test written before implementation
- [ ] Test covers specific user-visible behavior
- [ ] No implementation detail testing
- [ ] Uses React Native Testing Library patterns
- [ ] Async operations use waitFor/findBy
- [ ] All tests pass before moving to next feature
- [ ] Refactoring maintains green tests

## 8. Infrastructure & Deployment

### Infrastructure Requirements
| Component | Specification | Justification |
|-----------|--------------|---------------|
| Device Storage | 1MB | AsyncStorage for progression data |
| Memory | 50MB additional | State management and animations |
| CPU | Minimal overhead | Simple arithmetic calculations |

### Deployment Architecture
- **Build System**: Expo EAS Build / React Native CLI
- **Distribution**: App Store / Google Play
- **Updates**: CodePush for hotfixes (optional)
- **Environments**: Development → Staging → Production

### Monitoring & Observability

#### Metrics
- Level distribution histogram
- Average session length by player level
- XP gain rate per minute
- Level-up frequency
- Save/load success rate

#### Logging
```typescript
Logger.info('Level up', {
  newLevel: level,
  power: power,
  timeToLevel: Date.now() - lastLevelTime
});
```

#### Error Tracking
- AsyncStorage failures
- Data corruption recovery
- Performance degradation alerts

## 9. Scalability & Performance

### Performance Requirements
- Power calculation: <5ms per damage event
- Level-up detection: <1 frame (16ms)
- XP bar animation: 60 FPS
- AsyncStorage operations: <50ms
- Memory usage: <50MB increase

### Scalability Strategy
- **Level Cap**: Hard limit at 9999 to prevent overflow
- **Damage Display**: Format as "1M+" above 999,999
- **XP Optimization**: Use BigInt if precision issues arise
- **Calculation Cache**: Memoize Power calculations

### Performance Optimization
```typescript
// Memoized Power lookup
const powerCache = new Map<number, number>();
const getPower = (level: number): number => {
  if (!powerCache.has(level)) {
    powerCache.set(level, level); // Simple now, but ready for complex formulas
  }
  return powerCache.get(level)!;
};

// Optimized damage calculation
const calculateDamage = (power: number): number => {
  const base = 10 + (Math.random() * 5) | 0; // Bitwise for int
  return power * base;
};
```

## 10. Risk Assessment & Mitigation

### Technical Risks
| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| AsyncStorage corruption | High | Low | Implement backup save slot + validation | Dev Team |
| Performance at level 1000+ | Medium | Medium | Add calculation caching and profiling | Dev Team |
| Memory leaks from animations | High | Low | Cleanup animation listeners properly | Dev Team |
| Integer overflow at max level | Low | Low | Cap at 9999, use BigInt if needed | Dev Team |
| Save/load race conditions | Medium | Medium | Queue operations with mutex lock | Dev Team |

### Dependencies
- React Native AsyncStorage library stability
- Device storage availability
- React Native Reanimated performance

## 11. Implementation Plan (TDD-Driven)

Following lean task generation principles from `/docs/guides/lean-task-generation-guide.md`:

### Phase 1: Core Power System [2 days]

#### Task 1.1: Basic Power and Damage Calculation
**Delivers**: Enemies take variable damage based on Power level
- Write failing test for Power-based damage in App.test.tsx
- Modify App.tsx to apply Power multiplier to damage
- Display current Power value on screen
- **Creates**: PowerManager logic in App.tsx
- **User can**: See damage increase with Power value

#### Task 1.2: XP Gain from Enemy Defeats
**Delivers**: Players gain XP when defeating enemies
- Write test for XP accumulation on enemy defeat
- Add XP tracking to game state
- Show XP counter below Power display
- **Creates**: XP state management in App.tsx
- **User can**: See XP increase after each enemy defeat

### Phase 2: Level Progression [2 days]

#### Task 2.1: Level-Up System with Power Increase
**Delivers**: Players level up and gain Power
- Write test for level-up at XP threshold
- Implement level-up trigger when XP reaches threshold
- Increase Power by 1 on level-up
- Display "LEVEL UP!" message
- **Creates**: Level-up logic in existing components
- **User can**: Level up and see Power increase

#### Task 2.2: XP Progress Bar Visualization
**Delivers**: Visual feedback for progression
- Write test for XP bar rendering and updates
- Add animated XP bar component
- Show current/required XP text
- Install react-native-reanimated when needed
- **Creates**: XPBar.tsx component
- **User can**: See progress toward next level

### Phase 3: Persistence [1 day]

#### Task 3.1: Save and Load Progression
**Delivers**: Progress persists between sessions
- Write test for AsyncStorage save/load
- Save progression after each change
- Load progression on app start
- Handle corruption with reset
- **Uses**: AsyncStorage (already in project)
- **User can**: Continue from previous level

### Phase 4: Polish and Scaling [2 days]

#### Task 4.1: Level-Up Celebration Effects
**Delivers**: Satisfying level-up feedback
- Write test for celebration trigger
- Add particle effect animation
- Play celebration for 1.5 seconds
- Add glow effect to XP bar at 90%
- **Creates**: LevelUpEffect.tsx component
- **User can**: Experience rewarding level-up moment

#### Task 4.2: Enemy Scaling by Level Brackets
**Delivers**: Maintained challenge at higher levels
- Write test for enemy HP scaling
- Implement HP brackets (1-10, 11-25, 26-50)
- Scale XP and Pyreal rewards
- Update enemy spawn logic
- **Modifies**: Existing enemy system
- **User can**: Face appropriate challenges

### Technical Milestones
| Milestone | Deliverable | Date | Dependencies |
|-----------|------------|------|--------------|
| M1 | Working Power-based damage | Day 2 | None |
| M2 | Complete level-up system | Day 4 | M1 |
| M3 | Persistent progression | Day 5 | M2 |
| M4 | Full feature with polish | Day 7 | M3 |

## 12. Decision Log

### Architecture Decisions
| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| State Management | Context API, Redux, Zustand | Context API | Built-in, simple for single attribute |
| Storage | AsyncStorage, MMKV, SQLite | AsyncStorage | Sufficient for simple key-value data |
| Animation Library | Animated API, Reanimated, Lottie | Reanimated | Better performance for XP bar |
| Testing Approach | E2E only, Unit only, TDD | TDD with RNTL | Ensures quality and behavior focus |
| Level Formula | Linear, Exponential, Logarithmic | Linear (+1 per level) | Simple and predictable for players |

### Trade-offs
- **Simplicity over Complexity**: Single Power stat instead of multiple attributes for clearer progression
- **Performance over Accuracy**: Integer-only calculations to avoid floating point overhead
- **Local over Cloud**: AsyncStorage instead of cloud sync to avoid complexity
- **Immediate over Deferred**: Instant level-up instead of animation queue for responsiveness

## 13. Open Questions

Technical questions requiring resolution:
- [ ] Should we implement checksum validation for v1 or defer to v2?
- [ ] How to handle players who modified their save files?
- [ ] Should XP calculations use BigInt from start or wait for issues?
- [ ] What's the performance impact of particle effects on low-end devices?
- [ ] Should we cache Power calculations or compute on-demand?

## 14. Appendices

### A. Technical Glossary
- **Power**: Multiplier applied to base damage calculation
- **XP Threshold**: Amount of XP required to reach next level
- **Level Bracket**: Range of levels with same enemy HP
- **Checksum**: Hash validation of save data integrity
- **Memoization**: Caching calculation results

### B. Reference Architecture
- Cookie Clicker progression system
- Adventure Capitalist multiplier mechanics
- Idle Heroes power scaling formulas

### C. Code Examples

**Power Calculation Implementation**
```typescript
export class PowerSystem {
  private level: number = 1;
  private power: number = 1;

  levelUp(): void {
    this.level++;
    this.power = this.level; // Linear progression
  }

  calculateDamage(baseDamage: number): number {
    const randomBonus = Math.random() * 5;
    return Math.floor(this.power * (baseDamage + randomBonus));
  }
}
```

**AsyncStorage Wrapper**
```typescript
export class ProgressionStorage {
  private static KEY = '@progression_data';

  static async save(data: ProgressionData): Promise<void> {
    try {
      const json = JSON.stringify({
        ...data,
        checksum: this.generateChecksum(data)
      });
      await AsyncStorage.setItem(this.KEY, json);
    } catch (error) {
      console.error('Failed to save progression:', error);
    }
  }

  static async load(): Promise<ProgressionData | null> {
    try {
      const json = await AsyncStorage.getItem(this.KEY);
      if (!json) return null;

      const data = JSON.parse(json);
      if (!this.validateChecksum(data)) {
        console.warn('Invalid checksum, resetting progression');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to load progression:', error);
      return null;
    }
  }
}
```

### D. Related Documents
- Product Requirements Document: `/docs/specs/player-power-progression/prd_player_power_progression_20250928.md`
- Lean Task Generation Guide: `/docs/guides/lean-task-generation-guide.md`
- React Native Testing Guide: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- Core Combat System: `/docs/specs/core-combat-tap/`

---
*Generated from PRD: prd_player_power_progression_20250928.md*
*Generation Date: 2025-09-28T19:45:00Z*