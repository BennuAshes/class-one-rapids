# Core Combat Tap Mechanic Technical Design Document

## Document Control
| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude | 2025-09-28 | Draft | Initial TDD from PRD |

## Executive Summary
Design and implement a high-performance tap-based combat system for Asheron's Call Idler using React Native and Expo, delivering sub-100ms response times with visceral feedback through particles, combos, and weakness mechanics that drive 65% D1 retention.

## 1. Overview & Context

### Problem Statement
Current mobile idle games fail to deliver satisfying combat interactions, with 67% of players abandoning within 48 hours. The technical challenge is implementing a responsive tap combat system in React Native that maintains 60 FPS while handling rapid multi-touch inputs, particle effects, and real-time damage calculations.

### Solution Approach
Build a gesture-driven combat engine using React Native's PanResponder API combined with react-native-reanimated for 60 FPS animations, react-native-skia for particle effects, and MSW for testable API mocking. Architecture follows component-based design with TDD ensuring every feature works before optimization.

### Success Criteria
- Touch-to-feedback latency < 100ms measured via Performance API
- Maintain 60 FPS with 10+ particle effects using InteractionManager
- 65% D1 retention tracked via analytics events
- 80%+ test coverage enforced via CI/CD pipeline

## 2. Requirements Analysis

### Functional Requirements
**From PRD User Stories:**
1. **Basic Tap Combat**: Register taps, calculate damage, display feedback
2. **Weakness System**: Detect weakness hits, apply 2x multiplier, rotate spots
3. **Combo Mechanics**: Track consecutive hits, escalate multipliers, break on miss
4. **Visual Feedback**: Particles, damage numbers, screen shake, deformation
5. **Reward System**: Drop Pyreal, auto-collect, update currency

### Non-Functional Requirements
- **Performance**: <100ms latency, 60 FPS, <50MB memory
- **Scalability**: 1-10 enemies, 1000 damage/minute
- **Security**: Server validation, rate limiting (20 taps/sec)
- **Availability**: 99.9% uptime for combat features
- **Accessibility**: One-handed play, colorblind support, screen readers

## 3. System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────┐
│            React Native App              │
├─────────────────────────────────────────┤
│  Presentation Layer (Components)         │
│  ├── CombatScreen                       │
│  ├── Enemy                              │
│  ├── DamageNumber                       │
│  └── ComboDisplay                       │
├─────────────────────────────────────────┤
│  Business Logic Layer (Hooks/Context)    │
│  ├── useCombatEngine                    │
│  ├── useComboSystem                     │
│  ├── useWeaknessDetection               │
│  └── useParticleEffects                 │
├─────────────────────────────────────────┤
│  Data Layer (State Management)           │
│  ├── Legend State (Global State)        │
│  └── React Query (Server State)         │
├─────────────────────────────────────────┤
│  Infrastructure Layer                    │
│  ├── React Native Reanimated            │
│  ├── React Native Skia                  │
│  └── Expo Haptics                       │
└─────────────────────────────────────────┘
```

### Component Design

#### CombatScreen Component
- **Purpose**: Main container for combat interactions
- **Responsibilities**: Manage enemy spawning, coordinate combat state
- **Interfaces**:
  - Props: `{ enemies: Enemy[], playerPower: number }`
  - Events: `onEnemyDefeat`, `onPyrealCollect`
- **Dependencies**: Enemy, DamageCalculator, ParticleSystem

#### Enemy Component
- **Purpose**: Render enemy with health and weakness spots
- **Responsibilities**: Handle tap detection, display health bar, animate weakness
- **Interfaces**:
  - Props: `{ id: string, health: number, maxHealth: number, weaknessSpots: Position[] }`
  - Events: `onTap(position)`, `onDefeat()`
- **Dependencies**: DamageNumber, WeaknessIndicator, HealthBar

#### DamageCalculator Service
- **Purpose**: Calculate damage with all modifiers
- **Responsibilities**: Apply base damage, combo multipliers, weakness bonus
- **Interfaces**:
  - `calculateDamage(basePower: number, combo: number, isWeakness: boolean): number`
- **Dependencies**: Player stats, combo state

### Data Flow
```
User Tap → PanResponder → Hit Detection → Damage Calculation
    ↓                                            ↓
Visual Feedback ← State Update ← Damage Applied
    ↓
Particle Effects + Damage Numbers + Screen Shake
```

## 4. API Design

### Internal APIs

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| /combat/damage | POST | Apply damage to enemy | `{ enemyId, damage, position }` | `{ newHealth, defeated, pyreal }` |
| /combat/combo | GET | Get current combo | - | `{ count, multiplier, timeLeft }` |
| /combat/weakness | GET | Get weakness positions | `{ enemyId }` | `{ spots: Position[] }` |

### External Integrations
- **Analytics**: Segment/Mixpanel for retention metrics
- **Crash Reporting**: Sentry for error tracking
- **Performance**: Firebase Performance Monitoring

## 5. Data Model

### Entity Design

```typescript
// Enemy Entity
interface Enemy {
  id: string;
  type: EnemyType;
  health: number;
  maxHealth: number;
  level: number;
  weaknessSpots: WeaknessSpot[];
  position: Position;
  status: 'active' | 'dying' | 'dead';
}

// Weakness Spot
interface WeaknessSpot {
  id: string;
  position: Position;
  radius: number;
  activeUntil: number;
  multiplier: number;
}

// Combat State
interface CombatState {
  enemies: Enemy[];
  combo: ComboState;
  totalDamage: number;
  pyrealEarned: number;
}

// Combo State
interface ComboState {
  count: number;
  multiplier: number;
  lastHitTime: number;
  maxCombo: number;
}
```

### Database Schema
Using Legend State for local state management:
```typescript
const combatStore = observable({
  enemies: [] as Enemy[],
  combo: {
    count: 0,
    multiplier: 1,
    lastHitTime: 0,
    maxCombo: 0
  },
  player: {
    power: 10,
    pyreal: 0
  }
});
```

### Data Access Patterns
- **Read**: Direct observable access via `combatStore.enemies.get()`
- **Write**: Atomic updates via `combatStore.enemies[id].set()`
- **Computed**: Derived values using `computed(() => ...)`
- **Persistence**: AsyncStorage for game state recovery

## 6. Security Design

### Authentication & Authorization
- **Method**: JWT tokens for future multiplayer features
- **Storage**: Expo SecureStore for sensitive data
- **Session**: 7-day refresh tokens

### Data Security
- **Damage Validation**: Server-side verification for leaderboards
- **Rate Limiting**: Max 20 taps/second enforced client-side
- **Anti-Cheat**: Hash-based state verification
- **Encryption**: TLS for all API calls

### Security Controls
```typescript
// Input validation
const validateTap = (position: Position): boolean => {
  const now = Date.now();
  const timeSinceLastTap = now - lastTapTime;

  if (timeSinceLastTap < 50) return false; // 20 taps/sec max
  if (!isWithinBounds(position)) return false;
  if (tapCount > MAX_TAPS_PER_SECOND) return false;

  return true;
};
```

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)
**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools
- **Framework**: React Native Testing Library
- **Reference**: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Test Runner**: Jest with React Native preset
- **Mocking**: MSW for API mocking, Jest mocks for native modules
- **Coverage Target**: >80% for all new code

#### TDD Implementation Process

For each feature/component, follow this strict order:

1. **RED Phase - Write Failing Test First**
   ```typescript
   // Test for tap damage feature
   test('should deal damage when enemy is tapped', async () => {
     const { getByTestId } = render(<Enemy health={100} />);
     const enemy = getByTestId('enemy');

     await fireEvent.press(enemy);

     expect(screen.getByText(/^[0-9]+$/)).toBeTruthy(); // damage number
   });
   ```

2. **GREEN Phase - Minimal Implementation**
   ```typescript
   // Just enough to pass
   const Enemy = ({ health }) => {
     const [damage, setDamage] = useState(null);

     return (
       <Pressable onPress={() => setDamage(10)} testID="enemy">
         {damage && <Text>{damage}</Text>}
       </Pressable>
     );
   };
   ```

3. **REFACTOR Phase - Improve Code**
   - Extract damage calculation
   - Add animations
   - Optimize performance

### Unit Testing (TDD First Layer)

```typescript
// Enemy.test.tsx - Component Tests
describe('Enemy Component', () => {
  test('renders with health bar', () => {
    render(<Enemy health={100} maxHealth={100} />);
    expect(screen.getByLabelText('Enemy health: 100')).toBeTruthy();
  });

  test('displays weakness spots', () => {
    const weaknessSpots = [{ x: 50, y: 50, radius: 20 }];
    render(<Enemy weaknessSpots={weaknessSpots} />);
    expect(screen.getByTestId('weakness-spot-0')).toBeTruthy();
  });

  test('triggers damage on tap', async () => {
    const onDamage = jest.fn();
    render(<Enemy onDamage={onDamage} />);

    await fireEvent.press(screen.getByTestId('enemy'));
    expect(onDamage).toHaveBeenCalled();
  });
});

// DamageCalculator.test.ts - Service Tests
describe('DamageCalculator', () => {
  test('calculates base damage', () => {
    const damage = calculateDamage(10, 1, false);
    expect(damage).toBe(10);
  });

  test('applies combo multiplier', () => {
    const damage = calculateDamage(10, 3, false);
    expect(damage).toBe(30);
  });

  test('applies weakness bonus', () => {
    const damage = calculateDamage(10, 1, true);
    expect(damage).toBe(20);
  });
});
```

### Integration Testing (TDD Second Layer)

```typescript
// CombatFlow.test.tsx
describe('Combat Flow Integration', () => {
  test('complete tap-to-defeat flow', async () => {
    const { getByTestId } = render(<CombatScreen />);

    // Enemy spawns
    await waitFor(() => {
      expect(getByTestId('enemy-0')).toBeTruthy();
    });

    // Tap enemy multiple times
    const enemy = getByTestId('enemy-0');
    for (let i = 0; i < 10; i++) {
      await fireEvent.press(enemy);
      await waitFor(() => {
        expect(screen.getByText(/\d+/)).toBeTruthy(); // damage number
      });
    }

    // Enemy defeated
    await waitFor(() => {
      expect(screen.getByText(/Victory/)).toBeTruthy();
      expect(screen.getByText(/\+\d+ Pyreal/)).toBeTruthy();
    });
  });

  test('combo system integration', async () => {
    render(<CombatScreen />);

    const enemy = await screen.findByTestId('enemy-0');

    // Build combo
    for (let i = 0; i < 5; i++) {
      await fireEvent.press(enemy);
      await waitFor(() => {
        expect(screen.getByText(`Combo x${i + 1}`)).toBeTruthy();
      });
    }

    // Break combo by waiting
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
    });

    await fireEvent.press(enemy);
    expect(screen.getByText('Combo x1')).toBeTruthy();
  });
});
```

### End-to-End Testing (TDD Third Layer)

```typescript
// e2e/combat.test.ts
describe('Combat E2E', () => {
  test('player completes full combat session', async () => {
    // Launch app
    await device.launchApp();

    // Navigate to combat
    await element(by.text('Battle')).tap();

    // Defeat 3 enemies
    for (let enemy = 0; enemy < 3; enemy++) {
      // Tap until defeated
      while (await element(by.id(`enemy-${enemy}`)).exists()) {
        await element(by.id(`enemy-${enemy}`)).tap();
        await waitFor(element(by.text(/\d+/))).toBeVisible();
      }

      // Verify Pyreal collection
      await expect(element(by.text(/\+\d+ Pyreal/))).toBeVisible();
    }

    // Check total earnings
    await expect(element(by.id('pyreal-counter'))).toHaveText(/\d+/);
  });
});
```

### TDD Checklist for Each Component
- [x] First test written before any implementation code
- [x] Each test covers one specific behavior
- [x] Tests use React Native Testing Library patterns
- [x] No testIds unless absolutely necessary
- [x] Tests query by user-visible content
- [x] Async operations use waitFor/findBy
- [x] All tests pass before next feature

## 8. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|--------------|---------------|
| Compute | 2 vCPU, 4GB RAM | Handle build processes |
| Storage | 10GB SSD | Store builds and assets |
| CDN | CloudFront/Fastly | Serve OTA updates |
| Analytics | 1M events/month | Track user metrics |

### Deployment Architecture
- **Build System**: Expo EAS Build for iOS/Android
- **Distribution**: TestFlight (iOS), Google Play Console (Android)
- **OTA Updates**: Expo Updates for hot fixes
- **CI/CD**: GitHub Actions with automated testing

```yaml
# .github/workflows/test.yml
name: Test and Build
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run lint
      - run: npm run typecheck
```

### Monitoring & Observability

#### Metrics
- **Performance**: Frame rate, input latency, memory usage
- **Business**: Taps per session, combo completion rate, retention
- **Errors**: Crash rate, error frequency, stack traces

#### Logging
```typescript
// Structured logging
const logger = {
  combat: (event: string, data: any) => {
    analytics.track('combat_event', {
      event,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      ...data
    });
  }
};
```

#### Alerting
| Alert | Condition | Priority | Action |
|-------|-----------|----------|--------|
| High Crash Rate | >5% sessions | P0 | Rollback build |
| Low Frame Rate | <30 FPS for >10% | P1 | Investigate performance |
| API Errors | >1% failure rate | P1 | Check backend |

## 9. Scalability & Performance

### Performance Requirements
- **Touch Response**: <100ms from tap to visual feedback
- **Frame Rate**: 60 FPS with 10+ particles
- **Memory**: <50MB for combat system
- **Battery**: <10% drain per hour

### Scalability Strategy
```typescript
// Object pooling for performance
class ParticlePool {
  private pool: Particle[] = [];
  private active: Set<Particle> = new Set();

  acquire(): Particle {
    const particle = this.pool.pop() || new Particle();
    this.active.add(particle);
    return particle;
  }

  release(particle: Particle): void {
    particle.reset();
    this.active.delete(particle);
    this.pool.push(particle);
  }
}

// Virtualization for many enemies
const EnemyList = () => {
  return (
    <FlashList
      data={enemies}
      renderItem={({ item }) => <Enemy {...item} />}
      estimatedItemSize={200}
      recycleItems={true}
    />
  );
};
```

### Performance Optimization
- **React Native Reanimated**: UI thread animations
- **React Native Skia**: GPU-accelerated particles
- **Memoization**: React.memo for expensive components
- **Lazy Loading**: Dynamic imports for heavy features

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Touch latency on older devices | High | Medium | Implement performance mode, reduce particles | Dev Team |
| Memory leaks from particles | High | Low | Object pooling, automatic cleanup | Dev Team |
| Combo timing issues | Medium | Medium | Client-side prediction with server validation | Dev Team |
| React Native performance | High | Low | Native modules for critical paths | Dev Team |

### Dependencies
- **React Native 0.72+**: Required for new architecture
- **Expo SDK 49+**: Managed workflow benefits
- **Legend State**: Reactive state management
- **React Native Reanimated 3**: Smooth animations

## 11. Implementation Plan (TDD-Driven)

### Development Phases
Following lean task generation principles - each task delivers user-visible functionality:

#### Phase 1: Core Combat with TDD [Week 1]

**Task 1.1: Basic Tap-to-Damage with TDD** (4 hours)
```typescript
// Step 1: Write failing test in App.test.tsx
test('user can tap enemy to deal damage', async () => {
  render(<App />);
  const enemy = await screen.findByTestId('enemy');

  fireEvent.press(enemy);

  expect(screen.getByText(/10/)).toBeTruthy(); // damage number
});

// Step 2: Modify App.tsx to pass test
// Step 3: User can tap enemy and see damage
```
- Files: Modify existing App.tsx
- Deliverable: Tappable enemy that shows damage

**Task 1.2: Enemy Health and Defeat** (3 hours)
- Write test for health reduction
- Add health bar to Enemy component
- Enemy disappears when health reaches 0
- Deliverable: Enemies can be defeated

**Task 1.3: Floating Damage Numbers** (3 hours)
- Test for animated damage numbers
- Install react-native-reanimated when needed
- Implement floating animation
- Deliverable: Damage numbers float up and fade

#### Phase 2: Weakness System [Week 2]

**Task 2.1: Weakness Spot Detection** (4 hours)
- Test for weakness spot rendering
- Add visual indicators to enemies
- Detect hits on weakness areas
- Deliverable: Visible weakness spots

**Task 2.2: Weakness Damage Bonus** (3 hours)
- Test for 2x damage on weakness
- Implement hit detection logic
- Apply damage multipliers
- Deliverable: Bonus damage on weak spots

**Task 2.3: Rotating Weakness Spots** (3 hours)
- Test for position changes
- Add timer-based rotation
- Smooth transition animations
- Deliverable: Dynamic weakness targeting

#### Phase 3: Combo System [Week 3]

**Task 3.1: Basic Combo Counter** (3 hours)
- Test for consecutive hit tracking
- Display combo count
- Reset on miss/timeout
- Deliverable: Visible combo counter

**Task 3.2: Combo Damage Multipliers** (3 hours)
- Test for escalating damage
- Implement multiplier tiers (1x, 1.5x, 2x, 3x)
- Update damage calculations
- Deliverable: Higher damage with combos

**Task 3.3: Combo Visual Feedback** (4 hours)
- Test for UI changes at milestones
- Add screen effects at 10+ combo
- Install haptics for feedback
- Deliverable: Exciting combo experience

#### Phase 4: Rewards & Polish [Week 4]

**Task 4.1: Pyreal Currency Drops** (3 hours)
- Test for currency on defeat
- Implement drop animation
- Auto-collect after delay
- Deliverable: Earn currency from battles

**Task 4.2: Particle Effects** (4 hours)
- Test for particle spawning
- Install react-native-skia when needed
- Add impact particles
- Deliverable: Satisfying hit effects

**Task 4.3: Screen Shake and Polish** (3 hours)
- Test for screen shake on hit
- Add enemy deformation
- Implement audio feedback
- Deliverable: Visceral combat feel

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|------------|------|--------------|
| M1 | Playable combat prototype | Week 1 | React Native setup |
| M2 | Weakness system complete | Week 2 | M1 completion |
| M3 | Combo system integrated | Week 3 | M2 completion |
| M4 | Polished combat ready | Week 4 | M3 + assets |

## 12. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| State Management | Redux, MobX, Legend State | Legend State | Best React Native performance, reactive |
| Animation Library | Animated API, Reanimated, Lottie | Reanimated 3 | UI thread animations, best performance |
| Particle System | Native, Reanimated, Skia | React Native Skia | GPU acceleration, cross-platform |
| Testing Framework | Detox, Appium, RNTL | React Native Testing Library | Fast, reliable, good DX |
| Gesture Handling | PanResponder, Gesture Handler | Gesture Handler 2 | Better performance, more features |

### Trade-offs
- **Performance over Features**: Limiting to 10 particles for 60 FPS
- **TDD over Speed**: Slower initial development for better quality
- **Native Feel over Web**: Using platform-specific UI components
- **Simplicity over Complexity**: Starting with basic damage before modifiers

## 13. Open Questions

Technical questions requiring resolution:
- [ ] Should we use native modules for particle system if Skia performance insufficient?
- [ ] How to handle simultaneous multi-touch on same enemy?
- [ ] Should combo state persist between enemies or reset?
- [ ] What's the optimal object pool size for damage numbers?
- [ ] How to test haptic feedback in unit tests?

## 14. Appendices

### A. Technical Glossary
- **TDD**: Test-Driven Development (Red-Green-Refactor cycle)
- **MSW**: Mock Service Worker for API mocking
- **Reanimated**: React Native animation library running on UI thread
- **Legend State**: Reactive state management optimized for React Native
- **EAS**: Expo Application Services for building and deploying

### B. Reference Architecture
- [React Native New Architecture](https://reactnative.dev/docs/new-architecture-intro)
- [Expo Managed Workflow](https://docs.expo.dev/workflow/managed-vs-bare/)
- [Legend State Docs](https://legendapp.com/open-source/state/)

### C. Proof of Concepts
```typescript
// Touch latency measurement POC
const measureLatency = () => {
  const start = performance.now();

  return {
    onTouchStart: () => {
      const latency = performance.now() - start;
      console.log(`Touch latency: ${latency}ms`);
    }
  };
};
```

### D. Related Documents
- Product Requirements Document: `/docs/specs/core-combat-tap/prd_core_combat_tap_mechanic_20250928.md`
- Testing Guide: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- Lean Task Guide: `/docs/guides/lean-task-generation-guide.md`

---
*Generated from PRD: prd_core_combat_tap_mechanic_20250928.md*
*Generation Date: 2025-09-28 | TDD Generator v1.0*