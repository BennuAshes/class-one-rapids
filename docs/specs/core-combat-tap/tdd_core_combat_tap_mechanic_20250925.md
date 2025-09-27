# Core Combat Tap Mechanic Technical Design Document

## Document Control
| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude AI | 2025-09-25 | Draft | Initial TDD from PRD |

## Executive Summary
Design and implement a high-performance, responsive tap-based combat system for Asheron's Call Idler using React Native and Expo, delivering sub-100ms input latency with visual feedback that creates visceral player satisfaction through weakness targeting and combo mechanics.

## 1. Overview & Context

### Problem Statement
Mobile idle games suffer from passive, unengaging combat that results in 15% D7 retention rates. Players lack agency in combat outcomes, leading to disconnection from gameplay and reduced monetization. From a technical perspective, this requires building a responsive input system with complex visual feedback while maintaining 60 FPS performance on mobile devices.

### Solution Approach
Implement a React Native-based tap combat system using React Native Gesture Handler for low-latency input processing, React Native Reanimated 3 for smooth 60 FPS animations, and MSW for testable API mocking. The system will use a component-based architecture with immediate visual feedback through floating damage numbers, particle effects, and haptic responses.

### Success Criteria
- Input-to-visual latency < 100ms measured via performance profiling
- Maintain 60 FPS during combat with 10+ simultaneous particle effects
- Memory usage < 150MB for combat system components
- Test coverage > 80% using React Native Testing Library
- Zero rage quits due to input lag in first 1000 sessions

## 2. Requirements Analysis

### Functional Requirements
**Combat Input Processing**
- Single tap damage dealing with gesture recognition
- Multitouch handling with primary tap precedence
- Weakness spot hit detection with 44x44px minimum touch targets
- Combo tracking for consecutive weakness hits

**Visual Feedback System**
- Floating damage numbers with 1.5s duration
- Impact particle effects at tap location
- Enemy sprite deformation animations
- Screen shake proportional to damage (0-5px amplitude)

**Damage Calculation Engine**
- Base damage = Player Power × (1.0-1.5 random)
- Weakness multiplier = 2.0x-3.0x based on upgrades
- Combo multiplier = 1.0 + (0.5 × combo), max 5.0x
- Server-side validation for anti-cheat

**Loot & Collection System**
- Pyreal drops on enemy defeat (1-5 based on level)
- Auto-collection within 100px radius
- 10-second persistence before forced collection

### Non-Functional Requirements
- **Performance**: 60 FPS on iPhone 11+ and Pixel 4+
- **Latency**: < 50ms input registration, < 100ms total feedback loop
- **Memory**: < 150MB heap usage for combat components
- **Battery**: < 5% drain per 10-minute session
- **Security**: Server-side damage validation, anti-automation (>20 taps/sec detection)
- **Accessibility**: WCAG 2.1 AA compliance, colorblind modes, 66x66px large touch mode

## 3. System Architecture

### High-Level Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Input Layer    │────▶│  Game Logic      │────▶│  Render Layer   │
│  (Gestures)     │     │  (State/Combat)  │     │  (React Native) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                         │
        ▼                       ▼                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Haptic Service │     │  Audio Service   │     │  Animation Svc  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Component Design

#### TapHandler Component
- **Purpose**: Process touch inputs and determine hit locations
- **Responsibilities**: Gesture recognition, hit detection, multitouch filtering
- **Interfaces**: onTap(x, y, timestamp), onWeaknessHit(spotId)
- **Dependencies**: react-native-gesture-handler, enemy position data

#### CombatEngine Service
- **Purpose**: Calculate damage and manage combat state
- **Responsibilities**: Damage calculation, combo tracking, loot generation
- **Interfaces**: calculateDamage(tapData), updateCombo(hit), dropLoot(enemyId)
- **Dependencies**: Player stats, enemy data, RNG service

#### FeedbackRenderer Component
- **Purpose**: Display visual and audio feedback
- **Responsibilities**: Damage numbers, particles, screen shake, audio playback
- **Interfaces**: showDamage(amount, position), playImpact(intensity)
- **Dependencies**: react-native-reanimated, expo-av, expo-haptics

#### EnemyManager Component
- **Purpose**: Manage enemy state and weakness spots
- **Responsibilities**: Health tracking, weakness rotation, death handling
- **Interfaces**: takeDamage(amount), rotateWeakness(), checkDefeat()
- **Dependencies**: Enemy definitions, animation service

### Data Flow
```
User Tap → GestureHandler → HitDetection → CombatEngine
    ↓                           ↓              ↓
HapticFeedback          WeaknessCheck    DamageCalc
    ↓                           ↓              ↓
AudioFeedback           ComboUpdate      StateUpdate
    ↓                           ↓              ↓
ParticleEffect          DamageNumber     HealthBar
```

## 4. API Design

### Internal APIs

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| /combat/tap | POST | Process tap input | {x, y, timestamp, enemyId} | {damage, isWeakness, combo, loot} |
| /combat/state | GET | Get combat state | - | {enemies, playerStats, combo} |
| /enemy/spawn | POST | Spawn new enemy | {type, level} | {enemyId, health, weaknessSpots} |
| /loot/collect | POST | Collect dropped loot | {lootId, position} | {collected, pyreal, items} |

### External Integrations
- **Analytics Service**: Combat metrics tracking via Amplitude/Mixpanel
- **Leaderboard Service**: High score submission with damage validation
- **IAP Service**: Premium damage multiplier purchases

## 5. Data Model

### Entity Design

```typescript
interface Enemy {
  id: string;
  type: EnemyType;
  health: number;
  maxHealth: number;
  position: { x: number; y: number };
  weaknessSpots: WeaknessSpot[];
  level: number;
  lootTable: LootEntry[];
}

interface WeaknessSpot {
  id: string;
  position: { x: number; y: number };
  radius: number;
  multiplier: number;
  activeUntil: number;
  isVisible: boolean;
}

interface CombatState {
  combo: number;
  lastHitTime: number;
  totalDamage: number;
  weaknessStreak: number;
  activeBuffs: Buff[];
}

interface DamageEvent {
  amount: number;
  position: { x: number; y: number };
  type: 'normal' | 'weakness' | 'critical';
  combo: number;
  timestamp: number;
}
```

### Database Schema
```sql
-- Local SQLite for offline play
CREATE TABLE combat_sessions (
  id INTEGER PRIMARY KEY,
  start_time TIMESTAMP,
  total_damage INTEGER,
  max_combo INTEGER,
  pyreal_earned INTEGER,
  enemies_defeated INTEGER
);

CREATE TABLE damage_events (
  id INTEGER PRIMARY KEY,
  session_id INTEGER,
  enemy_id TEXT,
  damage INTEGER,
  is_weakness BOOLEAN,
  combo_level INTEGER,
  timestamp TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES combat_sessions(id)
);

-- Indexes for performance
CREATE INDEX idx_damage_timestamp ON damage_events(timestamp);
CREATE INDEX idx_session_start ON combat_sessions(start_time);
```

### Data Access Patterns
- **Write-heavy**: Damage events (100+ per minute)
- **Read patterns**: Session stats, high scores, recent damage
- **Caching**: Enemy stats in memory, damage numbers in circular buffer
- **Sync strategy**: Batch upload damage events every 30 seconds

## 6. Security Design

### Authentication & Authorization
- **Method**: JWT tokens via Expo SecureStore
- **Session**: 7-day refresh tokens, 1-hour access tokens
- **Validation**: Server-side damage calculation verification

### Data Security
- **Encryption at rest**: iOS Keychain / Android Keystore for sensitive data
- **Encryption in transit**: TLS 1.3 for all API calls
- **Anti-cheat**: Server-side validation of damage ranges, tap frequency limits
- **Audit logging**: Combat events logged with timestamps and session IDs

### Security Controls
```typescript
// Input validation
const MAX_TAPS_PER_SECOND = 20;
const MAX_DAMAGE_MULTIPLIER = 10;
const MIN_TAP_INTERVAL_MS = 50;

// Rate limiting
const tapRateLimiter = new RateLimiter({
  maxRequests: 20,
  windowMs: 1000,
  penalty: 5000 // 5 second cooldown on violation
});
```

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)
**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools
- **Framework**: React Native Testing Library
- **Reference**: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Test Runner**: Jest with React Native preset
- **Mocking**: MSW for API mocking, Jest mocks for native modules
- **E2E**: Detox for critical user flows

#### TDD Implementation Process

1. **RED Phase - Write Failing Test First**
   ```typescript
   // Test: Enemy takes damage when tapped
   test('should deal damage when enemy is tapped', async () => {
     const { getByTestId } = render(
       <CombatScreen enemy={mockEnemy} playerPower={100} />
     );

     const enemy = getByTestId('enemy-sprite');
     const initialHealth = 1000;

     fireEvent.press(enemy);

     await waitFor(() => {
       expect(screen.getByText(/\d+/)).toBeTruthy(); // Damage number appears
       expect(mockEnemy.takeDamage).toHaveBeenCalled();
     });
   });
   ```

2. **GREEN Phase - Minimal Implementation**
   ```typescript
   const handleEnemyTap = (event) => {
     const damage = calculateDamage(playerPower);
     enemy.takeDamage(damage);
     showDamageNumber(damage, event.nativeEvent);
   };
   ```

3. **REFACTOR Phase - Improve Code**
   ```typescript
   const handleEnemyTap = useCallback((event) => {
     const tapPosition = extractTapPosition(event);
     const damage = combatEngine.processTap(tapPosition, enemy, player);
     feedbackSystem.trigger(damage, tapPosition);
   }, [enemy, player, combatEngine, feedbackSystem]);
   ```

### Unit Testing (TDD First Layer)

**Combat Components Tests**
```typescript
describe('TapHandler', () => {
  test('registers tap within 50ms', async () => {
    const onTap = jest.fn();
    render(<TapHandler onTap={onTap} />);

    const startTime = Date.now();
    fireEvent.press(screen.getByTestId('tap-area'));

    await waitFor(() => {
      expect(onTap).toHaveBeenCalled();
      expect(Date.now() - startTime).toBeLessThan(50);
    });
  });

  test('detects weakness spot hits', () => {
    const weaknessSpot = { x: 100, y: 100, radius: 30 };
    render(<Enemy weaknessSpots={[weaknessSpot]} />);

    fireEvent.press(screen.getByTestId('enemy'), {
      nativeEvent: { locationX: 100, locationY: 100 }
    });

    expect(screen.getByText(/WEAKNESS!/)).toBeTruthy();
  });
});

describe('DamageCalculation', () => {
  test('applies weakness multiplier correctly', () => {
    const baseDamage = 100;
    const weaknessMultiplier = 2.5;

    const result = calculateDamage({
      base: baseDamage,
      isWeaknessHit: true,
      weaknessMultiplier
    });

    expect(result).toBe(250);
  });

  test('combo multiplier increases damage', () => {
    const damages = [];
    for (let combo = 0; combo < 5; combo++) {
      damages.push(calculateDamage({ base: 100, combo }));
    }

    // Each combo level should increase damage
    for (let i = 1; i < damages.length; i++) {
      expect(damages[i]).toBeGreaterThan(damages[i - 1]);
    }
  });
});
```

### Integration Testing (TDD Second Layer)

**Combat Flow Tests**
```typescript
describe('Combat Integration', () => {
  test('complete tap-to-damage flow', async () => {
    const { getByTestId } = render(<GameScreen />);

    // Enemy appears
    await waitFor(() => expect(getByTestId('enemy-1')).toBeTruthy());

    // Tap enemy
    fireEvent.press(getByTestId('enemy-1'));

    // Verify feedback chain
    await waitFor(() => {
      expect(screen.getByText(/\d+/)).toBeTruthy(); // Damage number
      expect(Haptics.impactAsync).toHaveBeenCalled(); // Haptic
      expect(Audio.Sound.createAsync).toHaveBeenCalled(); // Sound
    });

    // Health decreases
    const healthBar = getByTestId('enemy-health-bar');
    expect(healthBar.props.value).toBeLessThan(1.0);
  });

  test('combo system builds and resets', async () => {
    render(<CombatScreen enemy={mockEnemyWithWeakness} />);

    // Hit weakness spots to build combo
    for (let i = 0; i < 3; i++) {
      fireEvent.press(screen.getByTestId('weakness-spot'));
      await waitFor(() => {
        expect(screen.getByText(`Combo x${i + 1}`)).toBeTruthy();
      });
    }

    // Miss weakness to reset combo
    fireEvent.press(screen.getByTestId('enemy-body'));
    await waitFor(() => {
      expect(screen.queryByText(/Combo/)).toBeFalsy();
    });
  });
});
```

### End-to-End Testing (TDD Third Layer)

**User Flow Tests**
```typescript
describe('E2E Combat Scenarios', () => {
  test('defeat enemy and collect loot', async () => {
    await device.launchApp();

    // Start combat
    await element(by.id('start-combat')).tap();

    // Tap enemy until defeated
    const enemy = element(by.id('enemy'));
    while (await enemy.exists()) {
      await enemy.tap();
      await waitFor(element(by.text(/\d+/))).toBeVisible();
    }

    // Verify loot drops
    await expect(element(by.text(/\+\d+ Pyreal/))).toBeVisible();

    // Auto-collection after delay
    await device.pause(1000);
    await expect(element(by.id('pyreal-counter'))).toHaveText(/[1-9]\d*/);
  });
});
```

### TDD Checklist for Each Component
- [x] First test written before any implementation code
- [x] Each test covers one specific behavior
- [x] Tests use React Native Testing Library patterns
- [x] No testIds unless absolutely necessary (accessibility fallback)
- [x] Tests query by user-visible content
- [x] Async operations use waitFor/findBy
- [x] All tests pass before next feature
- [x] Coverage > 80% for new code

## 8. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|--------------|---------------|
| API Server | 2 vCPU, 4GB RAM | Handle 1000 req/s damage validation |
| Database | PostgreSQL 14, 20GB SSD | Store combat sessions and events |
| Cache | Redis 6, 1GB RAM | Session state and rate limiting |
| CDN | CloudFront | Serve game assets globally |
| Analytics | Amplitude | Track combat metrics in real-time |

### Deployment Architecture

```yaml
# Expo EAS Build Configuration
build:
  production:
    env:
      EXPO_PUBLIC_API_URL: https://api.asherons-idler.com
    ios:
      buildConfiguration: Release
      bundleIdentifier: com.asheronsidler.game
    android:
      buildType: release
      package: com.asheronsidler.game

# CI/CD Pipeline
workflow:
  - test: npm test -- --coverage
  - lint: npm run lint
  - type-check: npm run type-check
  - build: eas build --platform all
  - deploy: eas submit --platform all
```

### Monitoring & Observability

#### Metrics
- **Application**: Tap latency p50/p95/p99, FPS distribution, crash rate
- **Business**: DAU, session length, taps per session, combo achievements
- **Infrastructure**: API response time, error rate, database query time

#### Logging
```typescript
// Structured logging with context
logger.info('combat.tap', {
  sessionId: session.id,
  enemyId: enemy.id,
  damage: result.damage,
  isWeakness: result.isWeakness,
  combo: state.combo,
  timestamp: Date.now()
});
```

#### Alerting

| Alert | Condition | Priority | Action |
|-------|-----------|----------|--------|
| High Input Latency | p95 > 150ms | P0 | Page on-call, rollback |
| Low FPS | < 30 FPS for > 1% users | P1 | Investigate performance |
| Combo Exploit | > 100x combo achieved | P1 | Review anti-cheat logs |
| Memory Leak | Heap > 200MB | P2 | Schedule fix for next release |

## 9. Scalability & Performance

### Performance Requirements
- **Response time**: < 100ms tap-to-feedback for 95th percentile
- **Frame rate**: 60 FPS with 10+ simultaneous effects
- **Throughput**: 20 taps/second per session
- **Concurrent users**: 10,000 simultaneous players

### Scalability Strategy

```typescript
// Performance optimizations
const optimizations = {
  // Use InteractionManager for non-critical updates
  heavyOperation: () => {
    InteractionManager.runAfterInteractions(() => {
      // Update secondary UI elements
    });
  },

  // Batch state updates
  batchedUpdates: unstable_batchedUpdates(() => {
    setDamage(newDamage);
    setCombo(newCombo);
    setScore(newScore);
  }),

  // Memoize expensive calculations
  memoizedDamage: useMemo(() =>
    calculateDamage(power, modifiers), [power, modifiers]
  ),

  // Virtualize particle effects
  particlePool: new ObjectPool(ParticleEffect, 50)
};
```

### Performance Optimization
- **React Native**: Use Hermes engine, enable ProGuard/R8
- **Animations**: GPU-accelerated via Reanimated 3 worklets
- **Images**: WebP format, lazy loading, memory cache
- **Network**: Request batching, compression, offline mode

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Input latency on Android | High | Medium | Use direct native event handling via Gesture Handler | Tech Lead |
| Memory leaks from particles | High | Low | Implement object pooling, monitor heap | Performance Team |
| React Native bridge bottleneck | High | Medium | Move critical path to native modules | Platform Team |
| Battery drain from animations | Medium | Medium | Add quality settings, reduce effects | UX Team |
| Network latency affects feel | Low | High | Client-side prediction with reconciliation | Backend Team |

### Dependencies
- **React Native 0.72+**: Latest performance improvements
- **Expo SDK 49+**: Haptics and audio APIs
- **Reanimated 3**: Smooth 60 FPS animations
- **Gesture Handler 2+**: Low-latency input processing

## 11. Implementation Plan (TDD-Driven)

### Development Phases

#### Phase 1: Foundation & Test Setup [Week 1]
- **Day 1-2**: Set up Jest, React Native Testing Library, MSW
  - Configure test environment with React Native preset
  - Create test utilities for gesture simulation
  - Set up MSW handlers for combat API mocking

- **Day 3-4**: Create failing tests for core tap mechanic
  ```typescript
  // Write these tests FIRST - they must fail
  test('enemy takes damage when tapped');
  test('damage appears as floating number');
  test('haptic feedback triggers on tap');
  ```

- **Day 5**: Implement minimal tap handler to pass tests
  - Basic TouchableOpacity with onPress
  - Simple Text component for damage display
  - Mock haptic trigger

#### Phase 2: TDD Feature Implementation [Weeks 2-4]

**Week 2: Basic Combat (Red-Green-Refactor)**
- **Day 1**: Write ALL tests for basic combat
  ```typescript
  describe('BasicCombat', () => {
    test('tap reduces enemy health');
    test('damage calculation uses player power');
    test('enemy dies at zero health');
    test('loot drops on enemy death');
  });
  ```
- **Day 2-3**: Implement to pass tests
  - Enemy component with health state
  - Damage calculation function
  - Death detection and loot generation
- **Day 4-5**: Refactor and optimize
  - Extract CombatEngine service
  - Add proper TypeScript types
  - Performance profiling

**Week 3: Weakness System (TDD Cycle)**
- **Day 1**: Write weakness spot tests
  ```typescript
  test('weakness spots appear on enemy');
  test('weakness spots glow for 2-3 seconds');
  test('tapping weakness multiplies damage');
  test('weakness spots rotate positions');
  ```
- **Day 2-3**: Implement weakness mechanics
  - WeaknessSpot component with timer
  - Hit detection within radius
  - Multiplier application
- **Day 4-5**: Integration tests
  - Full weakness rotation cycle
  - Multiple weakness spots
  - Visual feedback for hits

**Week 4: Combo System (Test-First)**
- **Day 1**: Define combo behavior tests
  ```typescript
  test('consecutive weakness hits build combo');
  test('combo multiplier increases damage');
  test('missing weakness resets combo');
  test('combo counter displays on screen');
  ```
- **Day 2-3**: Build combo tracking
  - ComboTracker component
  - State management for streak
  - Multiplier calculation
- **Day 4-5**: Polish and effects
  - Combo milestone animations
  - Progressive visual feedback
  - Performance optimization

#### Phase 3: Enhancement with TDD [Weeks 5-6]

**Week 5: Visual Feedback System**
- Write tests for each effect type first
- Implement particles, screen shake, sprite deformation
- Optimize for 60 FPS performance

**Week 6: Audio & Haptics**
- Test audio playback timing
- Test haptic intensity variations
- Implement feedback systems

#### Phase 4: Hardening [Week 7]
- **Performance test suite**: FPS monitoring, memory profiling
- **Security testing**: Input validation, anti-cheat measures
- **Accessibility testing**: Screen reader, colorblind modes
- **Coverage review**: Ensure > 80% test coverage

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|------------|------|--------------|
| M1 | Working tap damage with tests | Week 1 | Test environment setup |
| M2 | Weakness system fully tested | Week 3 | Basic combat complete |
| M3 | Combo system with full coverage | Week 4 | Weakness system done |
| M4 | All effects at 60 FPS | Week 6 | Performance profiling |
| M5 | Launch-ready build | Week 7 | All tests passing |

## 12. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| State Management | Redux, MobX, Zustand, Context | Zustand | Minimal boilerplate, excellent React Native performance, 8KB bundle size |
| Animation Library | Animated API, Reanimated, Lottie | Reanimated 3 | Worklet-based animations run at 60 FPS on UI thread |
| Gesture Handling | PanResponder, Gesture Handler, TouchableOpacity | Gesture Handler 2 | Native thread processing, lowest latency, gesture composition |
| Testing Framework | Enzyme, Testing Library, Native Testing Library | React Native Testing Library | Best practices, user-centric testing, active maintenance |
| Database | AsyncStorage, SQLite, Realm | SQLite via Expo | Structured queries, good performance, offline support |

### Trade-offs
- **Performance over Features**: Limited to 50 particles to maintain 60 FPS
- **Battery over Effects**: Reduced haptic intensity to meet 5% per 10min target
- **Simplicity over Flexibility**: Fixed weakness spot sizes vs dynamic sizing
- **Coverage over Speed**: 80% test coverage requirement may slow initial development

## 13. Open Questions

Technical questions requiring resolution:
- [ ] Should we implement native modules for tap processing if JS thread becomes bottleneck?
- [ ] What's the optimal particle pool size for various device tiers?
- [ ] Should combo state persist between sessions or reset?
- [ ] How do we handle simultaneous taps on multiple enemies?
- [ ] Should damage numbers stack or spread when multiple hits occur rapidly?
- [ ] What's the fallback for devices without haptic support?

## 14. Appendices

### A. Technical Glossary
- **Worklet**: Reanimated function that runs on UI thread
- **Gesture Handler**: Native module for processing touch events
- **MSW**: Mock Service Worker for API mocking in tests
- **Object Pool**: Reusable object cache to reduce GC pressure
- **Bridge**: React Native JavaScript-to-native communication layer

### B. Reference Architecture
- [React Native Performance Guide](https://reactnative.dev/docs/performance)
- [Reanimated 3 Documentation](https://docs.swmansion.com/react-native-reanimated/)
- [Gesture Handler Docs](https://docs.swmansion.com/react-native-gesture-handler/)
- [Testing Library Best Practices](https://testing-library.com/docs/react-native-testing-library/intro)

### C. Proof of Concepts
```typescript
// Input latency measurement POC
const measureLatency = () => {
  const start = performance.now();

  return (event) => {
    const latency = performance.now() - start;
    analytics.track('input_latency', {
      latency,
      device: Device.modelName
    });
  };
};

// Particle pooling POC
class ParticlePool {
  constructor(size = 50) {
    this.pool = Array(size).fill(null).map(() => new Particle());
    this.available = [...this.pool];
    this.active = new Set();
  }

  spawn(position) {
    const particle = this.available.pop();
    if (particle) {
      particle.reset(position);
      this.active.add(particle);
      return particle;
    }
    return null; // Pool exhausted
  }
}
```

### D. Related Documents
- Product Requirements Document: `/docs/specs/core-combat-tap/prd_core_combat_tap_mechanic_20250925.md`
- React Native Testing Guide: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- Lean Task Generation Guide: `/docs/guides/lean-task-generation-guide.md`

---
*Generated from PRD: prd_core_combat_tap_mechanic_20250925.md*
*Generation Date: 2025-09-25 15:45:00 UTC*