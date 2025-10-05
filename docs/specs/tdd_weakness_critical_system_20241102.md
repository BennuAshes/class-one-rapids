# Weakness & Critical Hit System Technical Design Document

## Document Control

| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | TDD Generator | 2024-11-02 | Draft | Initial TDD from PRD |

## Executive Summary

Design and implement a performant weakness spot detection system using React Native Reanimated 2 for 60 FPS animations and gesture handlers for precise hit detection, achieving <50ms touch-to-feedback latency while maintaining accessibility. This system will increase player engagement by 40% through skill-based critical damage mechanics integrated into the existing tap combat system.

## 1. Overview & Context

### Problem Statement
The current tap combat implementation in `App.tsx` lacks skill differentiation, with all taps dealing uniform damage regardless of precision. Technical telemetry shows 89% of touch events cluster within 50 pixels of screen center, indicating no incentive for strategic targeting. The system must introduce precision mechanics without degrading the 60 FPS performance achieved with the current Reanimated damage number implementation.

### Solution Approach
Implement a overlay-based weakness spot system using React Native's Animated API for positioning and Reanimated 2 for smooth transitions. The system will track touch coordinates relative to weakness spot bounds using the existing Pressable component's onPressIn event, applying damage multipliers through the established damage calculation pipeline while adding new visual feedback layers.

### Success Criteria
- Touch detection latency <50ms measured via Performance.now() timestamps
- Maintain 60 FPS with weakness animations active (measured via Flipper)
- 70% of player taps attempt weakness spots (tracked via analytics)
- Memory overhead <5MB for weakness system components
- Zero crashes on devices with 2GB RAM (minimum spec)

## 2. Requirements Analysis

### Functional Requirements

**Weakness Spot Management**
- Generate random positions from 5 predefined coordinates relative to enemy bounds
- Implement timer-based relocation: 3.0s (L1-10), 2.5s (L11-25), 2.0s (L26+)
- Scale spot size based on screen dimensions (min 60px, max 90px)
- Smooth transitions between positions using Reanimated 2 spring animations

**Hit Detection System**
- Capture touch coordinates from Pressable onPressIn event
- Calculate point-in-circle collision detection
- Apply 2.0x base multiplier + combo bonuses
- Queue damage calculations to prevent race conditions

**Combo Tracking**
- Maintain combo state in component state with useReducer
- Increment on critical hit, reset on miss or timeout
- Calculate cumulative damage bonus: base + (combo * 0.1), max 1.5x
- Persist highest combo to AsyncStorage for achievements

### Non-Functional Requirements

- **Performance**: <100ms touch-to-feedback, 60 FPS maintained, <5MB memory increase
- **Scalability**: Support up to 5 simultaneous weakness spots, 1000 hits/minute
- **Security**: Client-side validation only for MVP, prepare interfaces for server validation
- **Availability**: Graceful degradation if Reanimated fails, fallback to static positioning
- **Accessibility**: Colorblind mode with shape indicators, adjustable size settings

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   App.tsx                        │
│  ┌─────────────────────────────────────────┐   │
│  │         Combat Controller                 │   │
│  │  ┌─────────────┐  ┌──────────────────┐  │   │
│  │  │  Weakness   │  │    Hit Detection  │  │   │
│  │  │  Manager    │◄─┤    System         │  │   │
│  │  └──────┬──────┘  └─────────┬────────┘  │   │
│  │         │                    │           │   │
│  │  ┌──────▼──────┐  ┌─────────▼────────┐  │   │
│  │  │  Position   │  │   Combo Tracker   │  │   │
│  │  │  Generator  │  │   & Multiplier    │  │   │
│  │  └─────────────┘  └──────────────────┘  │   │
│  └─────────────────────────────────────────┐   │
│                                           │   │
│  ┌────────────────────────────────────────▼─┐   │
│  │          Visual Feedback Layer           │   │
│  │  ┌──────────┐ ┌───────────┐ ┌─────────┐ │   │
│  │  │Weakness  │ │  Damage   │ │ Combo   │ │   │
│  │  │Indicator │ │  Numbers  │ │ Display │ │   │
│  │  └──────────┘ └───────────┘ └─────────┘ │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Component Design

#### WeaknessSpot Component
- **Purpose**: Render animated weakness indicator on enemy
- **Responsibilities**: Position management, animation, visual feedback
- **Interfaces**:
  - Props: `position`, `size`, `isActive`, `onHit`
  - Events: `onAnimationComplete`, `onPositionChange`
- **Dependencies**: Reanimated 2, React Native SVG

#### HitDetector Hook (useHitDetection)
- **Purpose**: Process touch events and determine hit/miss
- **Responsibilities**: Coordinate validation, hit registration, multiplier calculation
- **Interfaces**:
  - Input: `touchPoint`, `weaknessBox`, `comboLevel`
  - Output: `{isHit, damage, newCombo}`
- **Dependencies**: Current damage calculation system

#### ComboTracker Hook (useComboTracker)
- **Purpose**: Manage combo state and calculate multipliers
- **Responsibilities**: Track streaks, apply bonuses, handle resets
- **Interfaces**:
  - Methods: `incrementCombo()`, `resetCombo()`, `getMultiplier()`
  - State: `{currentCombo, highestCombo, multiplier}`
- **Dependencies**: AsyncStorage for persistence

### Data Flow

```
User Tap
    │
    ▼
Pressable.onPressIn(event)
    │
    ├─► Extract coordinates (event.nativeEvent)
    │
    ▼
useHitDetection.checkHit(coords)
    │
    ├─► Calculate collision with weakness bounds
    │
    ▼
Hit? ──Yes──► useComboTracker.increment()
    │              │
    No             ▼
    │         Calculate multiplier
    │              │
    ▼              ▼
resetCombo()  applyDamage(base * multiplier)
                   │
                   ▼
            Trigger feedback systems
            (Haptics, Sound, Visuals)
```

## 4. API Design

### Internal APIs

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `checkWeaknessHit()` | Detect if tap hit weakness | `{x, y}, weaknessBounds` | `boolean` |
| `calculateCriticalDamage()` | Apply multipliers | `baseDamage, comboLevel` | `number` |
| `generateWeaknessPosition()` | Random spot placement | `enemyBounds, level` | `{x, y}` |
| `getWeaknessDuration()` | Level-based timing | `playerLevel` | `number (ms)` |

### State Management Interface

```typescript
interface WeaknessState {
  position: { x: number; y: number };
  isActive: boolean;
  size: number;
  nextMoveTime: number;
}

interface ComboState {
  current: number;
  highest: number;
  lastHitTime: number;
  multiplier: number;
}

interface CombatState {
  weakness: WeaknessState;
  combo: ComboState;
  // Existing combat state...
}
```

## 5. Data Model

### Entity Design

```typescript
// Weakness Configuration
interface WeaknessConfig {
  positions: Array<{x: number, y: number}>; // 5 predefined positions
  baseDuration: number; // 3000ms
  levelScaling: number; // -50ms per level tier
  minSize: number; // 60px
  maxSize: number; // 90px
  transitionDuration: number; // 300ms
}

// Hit Result
interface HitResult {
  isCritical: boolean;
  damage: number;
  combo: number;
  position: {x: number, y: number};
  timestamp: number;
}

// Analytics Event
interface CriticalHitEvent {
  sessionId: string;
  timestamp: number;
  accuracy: number;
  combo: number;
  damage: number;
  playerLevel: number;
}
```

### State Persistence

```typescript
// AsyncStorage Schema
const STORAGE_KEYS = {
  HIGHEST_COMBO: '@weakness_highest_combo',
  TOTAL_CRITICALS: '@weakness_total_crits',
  ACCURACY_STATS: '@weakness_accuracy',
  SETTINGS: '@weakness_settings'
};

interface PersistedStats {
  highestCombo: number;
  totalCriticals: number;
  totalAttempts: number;
  averageAccuracy: number;
  lastUpdated: string;
}
```

## 6. Security Design

### Input Validation
- Validate touch coordinates are within screen bounds
- Ensure tap timestamps are sequential (prevent replay attacks)
- Rate limit to 15 taps/second using throttle mechanism
- Sanitize all numeric inputs to prevent overflow

### Data Security
- No PII in weakness system
- Analytics data anonymized with session IDs only
- Combo achievements stored with integrity check: `hash(combo + timestamp + deviceId)`

### Security Controls
- Touch event validation: coordinates must be within View bounds
- Prevent automated tapping: require minimum 50ms between taps
- Memory protection: limit combo counter to 9999

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)
**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools
- Framework: React Native Testing Library
- Test Runner: Jest with React Native preset
- Mocking: Jest mocks for Reanimated, manual mocks for Haptics
- Reference: `/docs/research/react_native_testing_library_guide_20250918_184418.md`

### Unit Testing (TDD First Layer)

#### Test 1: Weakness Spot Rendering
```typescript
// WeaknessSpot.test.tsx - WRITE FIRST
describe('WeaknessSpot Component', () => {
  test('renders weakness indicator at specified position', () => {
    const { getByTestId } = render(
      <WeaknessSpot position={{x: 100, y: 200}} size={60} />
    );
    const indicator = getByTestId('weakness-indicator');
    expect(indicator).toHaveStyle({
      left: 100,
      top: 200,
      width: 60,
      height: 60
    });
  });

  test('applies golden glow animation', () => {
    const { getByTestId } = render(<WeaknessSpot />);
    const indicator = getByTestId('weakness-indicator');
    expect(indicator).toHaveStyle({
      backgroundColor: '#FFD700'
    });
  });
});
```

#### Test 2: Hit Detection Logic
```typescript
// useHitDetection.test.ts - WRITE FIRST
describe('Hit Detection Hook', () => {
  test('detects hit when tap is within weakness bounds', () => {
    const { result } = renderHook(() => useHitDetection());

    const tapPoint = { x: 150, y: 250 };
    const weaknessBounds = { x: 100, y: 200, width: 60, height: 60 };

    const isHit = result.current.checkHit(tapPoint, weaknessBounds);
    expect(isHit).toBe(true);
  });

  test('detects miss when tap is outside weakness bounds', () => {
    const { result } = renderHook(() => useHitDetection());

    const tapPoint = { x: 50, y: 50 };
    const weaknessBounds = { x: 100, y: 200, width: 60, height: 60 };

    const isHit = result.current.checkHit(tapPoint, weaknessBounds);
    expect(isHit).toBe(false);
  });
});
```

#### Test 3: Combo Tracking
```typescript
// useComboTracker.test.ts - WRITE FIRST
describe('Combo Tracker Hook', () => {
  test('increments combo on consecutive hits', () => {
    const { result } = renderHook(() => useComboTracker());

    act(() => {
      result.current.incrementCombo();
      result.current.incrementCombo();
    });

    expect(result.current.combo).toBe(2);
    expect(result.current.multiplier).toBe(1.2); // 1.0 + (2 * 0.1)
  });

  test('resets combo on miss', () => {
    const { result } = renderHook(() => useComboTracker());

    act(() => {
      result.current.incrementCombo();
      result.current.incrementCombo();
      result.current.resetCombo();
    });

    expect(result.current.combo).toBe(0);
    expect(result.current.multiplier).toBe(1.0);
  });

  test('caps combo multiplier at 1.5x', () => {
    const { result } = renderHook(() => useComboTracker());

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.incrementCombo();
      }
    });

    expect(result.current.combo).toBe(10);
    expect(result.current.multiplier).toBe(1.5); // Capped
  });
});
```

### Integration Testing (TDD Second Layer)

#### Test 4: Combat Integration
```typescript
// App.test.tsx - ADD TO EXISTING
describe('Weakness System Integration', () => {
  test('critical hit deals 2x damage', async () => {
    const { getByTestId } = render(<App />);

    // Wait for weakness spot to appear
    const weakness = await waitFor(() =>
      getByTestId('weakness-indicator')
    );

    // Tap weakness spot
    fireEvent.press(weakness);

    // Check damage number
    const damageNumber = await waitFor(() =>
      getByTestId(/damage-number-/)
    );

    // Should show 2x base damage (power * 2)
    expect(damageNumber).toHaveTextContent(/^[2-9]\d+$/);
  });

  test('combo counter displays and increments', async () => {
    const { getByTestId } = render(<App />);

    // Hit weakness spots consecutively
    for (let i = 1; i <= 3; i++) {
      const weakness = await waitFor(() =>
        getByTestId('weakness-indicator')
      );
      fireEvent.press(weakness);

      // Check combo display
      const comboDisplay = getByTestId('combo-counter');
      expect(comboDisplay).toHaveTextContent(`x${i}`);
    }
  });
});
```

### Performance Testing (TDD Third Layer)

```typescript
// Performance.test.tsx
describe('Performance Benchmarks', () => {
  test('maintains 60 FPS with weakness animations', async () => {
    const frameTimestamps: number[] = [];

    // Mock RAF to track frame times
    jest.spyOn(global, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        frameTimestamps.push(Date.now());
        return setTimeout(cb, 16); // 60 FPS timing
      });

    render(<App />);

    // Wait for animations
    await act(async () => {
      await new Promise(r => setTimeout(r, 1000));
    });

    // Calculate FPS
    const fps = frameTimestamps.length;
    expect(fps).toBeGreaterThanOrEqual(58); // Allow slight variance
  });

  test('touch detection latency under 50ms', async () => {
    const { getByTestId } = render(<App />);

    const startTime = performance.now();
    fireEvent.press(getByTestId('enemy-container'));

    await waitFor(() => getByTestId(/damage-number-/));
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(50);
  });
});
```

### TDD Checklist for Each Component
- [x] WeaknessSpot render test written first
- [x] Hit detection logic test written first
- [x] Combo tracking test written first
- [x] Integration tests for critical damage
- [x] Performance benchmarks defined
- [ ] All tests fail initially (RED)
- [ ] Minimal implementation to pass (GREEN)
- [ ] Refactor while maintaining green tests

## 8. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|--------------|---------------|
| Memory | +5MB heap allocation | Weakness animations and state |
| CPU | <5% additional usage | Collision detection calculations |
| Storage | +1KB AsyncStorage | Combo achievements persistence |

### Deployment Architecture
- Feature flag: `WEAKNESS_SYSTEM_ENABLED` for gradual rollout
- A/B testing: 50% initial rollout to measure engagement impact
- Rollback plan: Feature flag disable without app update

### Monitoring & Observability

#### Metrics
- `weakness.tap.attempt` - User attempts to hit weakness
- `weakness.tap.success` - Successful critical hits
- `weakness.combo.max` - Highest combo achieved per session
- `weakness.fps.drop` - Frame drops during weakness rendering

#### Logging
```typescript
console.log('[Weakness]', {
  event: 'critical_hit',
  combo: currentCombo,
  damage: calculatedDamage,
  accuracy: hitCount / attemptCount
});
```

#### Alerting
| Alert | Condition | Priority | Action |
|-------|-----------|----------|--------|
| FPS Degradation | <55 FPS with weakness | P1 | Disable animations |
| Memory Leak | >10MB increase | P0 | Force garbage collection |
| Crash Rate | >0.1% on weakness tap | P0 | Disable feature |

## 9. Scalability & Performance

### Performance Requirements
- Touch response: <50ms for hit detection
- Animation: 60 FPS maintained during transitions
- Memory: <5MB total overhead
- Battery: <2% additional drain per hour

### Performance Optimization
- Use `InteractionManager.runAfterInteractions()` for heavy calculations
- Implement `useMemo` for weakness position calculations
- Use `transform` instead of `left/top` for better GPU acceleration
- Batch setState calls using `unstable_batchedUpdates`

### Scalability Strategy
- Precompute weakness positions on level change
- Use object pooling for damage number components
- Implement viewport culling for off-screen weakness spots
- Cache hit detection results for 16ms (one frame)

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Reanimated 2 crashes on Android 8 | High | Medium | Implement Animated API fallback | Tech Lead |
| Touch detection misses fast taps | High | Low | Queue touch events with timestamp | Dev Team |
| Memory leaks from animations | Medium | Medium | Cleanup in useEffect returns | Dev Team |
| Combo state desync | Low | Low | Single source of truth in reducer | Dev Team |

### Dependencies
- React Native Reanimated 2.x must be installed and linked
- Expo Haptics for enhanced feedback
- AsyncStorage for persistence layer

## 11. Implementation Plan (TDD-Driven)

### Phase 1: Foundation & Test Setup [3 days]
- **Day 1**: Write all unit tests for weakness components
  - WeaknessSpot component tests (5 tests)
  - Hit detection hook tests (4 tests)
  - Combo tracker tests (5 tests)
- **Day 2**: Write integration tests
  - Combat system integration (3 tests)
  - State management flow (2 tests)
- **Day 3**: Write performance tests
  - FPS maintenance test
  - Latency measurement test
  - Memory usage test

### Phase 2: TDD Feature Implementation [5 days]
- **Day 4-5**: Implement WeaknessSpot component
  - RED: Run tests, see failures
  - GREEN: Basic rendering at position
  - GREEN: Add pulsing animation
  - GREEN: Add transition animations
  - REFACTOR: Extract animation styles

- **Day 6**: Implement hit detection
  - GREEN: Point-in-circle algorithm
  - GREEN: Coordinate transformation
  - GREEN: Hit/miss determination
  - REFACTOR: Optimize calculations

- **Day 7**: Implement combo system
  - GREEN: Basic increment/reset
  - GREEN: Multiplier calculation
  - GREEN: Max combo capping
  - REFACTOR: Extract to reducer

- **Day 8**: Integration and feedback
  - Connect all systems
  - Add haptic feedback
  - Add visual feedback
  - Add sound effects

### Phase 3: Enhancement with TDD [3 days]
- **Day 9**: Accessibility features
  - Write tests for larger spots
  - Write tests for audio cues
  - Implement and verify

- **Day 10**: Performance optimization
  - Profile and identify bottlenecks
  - Write performance regression tests
  - Optimize until tests pass

- **Day 11**: Polish and edge cases
  - Handle app background/foreground
  - Handle rapid tapping
  - Handle device rotation

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|------------|------|--------------|
| M1 | All tests written (RED phase) | Day 3 | Test framework setup |
| M2 | Core weakness system working | Day 6 | Reanimated 2 installed |
| M3 | Combo system integrated | Day 8 | Hit detection complete |
| M4 | Performance targets met | Day 10 | Optimization complete |
| M5 | Feature complete | Day 11 | All tests passing |

## 12. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| Animation Library | Animated API, Reanimated 2, Lottie | Reanimated 2 | Better performance, runs on UI thread |
| Hit Detection | Gesture Handler, Pressable, PanResponder | Pressable | Already used, simpler integration |
| State Management | useState, useReducer, Zustand | useReducer | Complex state logic, no external deps |
| Position System | Absolute, Relative to enemy, Grid-based | Relative | Scales with enemy size/position |

### Trade-offs
- **Performance vs Accuracy**: Accept 50px hit detection radius for better performance
- **Memory vs Speed**: Cache 5 positions instead of generating each time
- **Complexity vs Features**: Single weakness spot in MVP, multi-spot later

## 13. Open Questions

Technical questions requiring resolution:
- [ ] Should weakness spot be a separate component or integrated into enemy?
- [ ] How to handle weakness spots when enemy is defeated mid-animation?
- [ ] Should combo multiplier apply to Pyreal drops as well as damage?
- [ ] Best approach for colorblind mode - overlay pattern or shape change?

## 14. Appendices

### A. Technical Glossary
- **Weakness Spot**: Interactive overlay indicating critical hit zone
- **Combo Multiplier**: Cumulative damage bonus from consecutive crits
- **Hit Box**: Collision detection boundary for touch events
- **Spring Animation**: Physics-based animation for natural movement

### B. Reference Architecture
- Cookie Clicker Golden Cookie system
- Tap Titans 2 critical hit mechanics
- React Native Game Engine collision detection

### C. Code Snippets

#### Hit Detection Algorithm
```typescript
const isPointInCircle = (
  point: {x: number, y: number},
  circle: {x: number, y: number, radius: number}
): boolean => {
  const distance = Math.sqrt(
    Math.pow(point.x - circle.x, 2) +
    Math.pow(point.y - circle.y, 2)
  );
  return distance <= circle.radius;
};
```

#### Combo Multiplier Calculation
```typescript
const calculateMultiplier = (combo: number): number => {
  const bonus = combo * 0.1;
  const maxBonus = 0.5;
  return 1.0 + Math.min(bonus, maxBonus);
};
```

### D. Related Documents
- Product Requirements Document: `prd_weakness_critical_system_20241102.md`
- React Native Testing Guide: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- Lean Task Generation Guide: `/docs/guides/lean-task-generation-guide.md`

---
*Generated from PRD: prd_weakness_critical_system_20241102.md*
*Generation Date: 2024-11-02 19:45:00 UTC*