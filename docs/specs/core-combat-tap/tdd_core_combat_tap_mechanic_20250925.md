# Technical Design Document: Core Combat Tap Mechanic

## Document Information
| Version | Author | Date | Status |
|---------|--------|------|--------|
| v1.0 | Engineering Team | 2025-09-25 | Draft |

**Executive Summary**: Technical design for implementing the core tap-based combat system using React Native/Expo with Test-Driven Development principles, focusing on sub-100ms response times, visual feedback systems, and scalable architecture.

## Requirements Analysis

### Extracted Functional Requirements

#### Input System Requirements
- **INP-001**: Register tap inputs with <50ms latency on supported devices
- **INP-002**: Support multitouch with primary tap taking precedence
- **INP-003**: Provide haptic feedback within 20ms of tap on supported devices
- **INP-004**: Handle automated tapping detection (>20 taps/second triggers anti-cheat)

#### Enemy Weakness System Requirements
- **EWS-001**: Display 1-3 weakness spots per enemy based on enemy type
- **EWS-002**: Rotate weakness spots every 2-3 seconds with 0.5s fade transition
- **EWS-003**: Weakness spots minimum 44x44 pixels for accessibility
- **EWS-004**: Provide 0.5s visual telegraph before weakness spot appears

#### Damage Calculation Requirements
- **DMG-001**: Base damage = Player Power × (1.0 - 1.5 random multiplier)
- **DMG-002**: Weakness multiplier = 2.0x base, scaling to 3.0x with upgrades
- **DMG-003**: Combo multiplier = 1.0 + (0.5 × combo count), max 5.0x
- **DMG-004**: Display damage numbers for 1.5s with float animation

#### Feedback Systems Requirements
- **FBK-001**: Play impact particle effect at tap location lasting 0.3s
- **FBK-002**: Enemy sprite deformation (squash/stretch) over 0.2s
- **FBK-003**: Screen shake proportional to damage (0-5 pixels amplitude)
- **FBK-004**: Audio feedback with 3 tiers based on damage amount

#### Loot System Requirements
- **LOT-001**: Drop 1-5 Pyreal on enemy defeat based on enemy level
- **LOT-002**: Auto-collect loot within 100 pixels of drop location
- **LOT-003**: Display collection animation and "+X Pyreal" text
- **LOT-004**: Loot persists for 10 seconds before auto-collection

### Non-Functional Requirements
- **NFR-001**: Maintain 60 FPS on devices from 2020 or newer
- **NFR-002**: Input latency <100ms from tap to visual feedback
- **NFR-003**: Memory usage <150MB for combat system
- **NFR-004**: Battery drain <5% per 10-minute session
- **NFR-005**: Support 100+ simultaneous particle effects
- **NFR-006**: Handle 1000+ damage calculations per minute

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                   │
├─────────────────────────────────────────────────────────────┤
│  CombatScreen │ EnemyComponent │ ParticleSystem │ UIOverlay │
├─────────────────────────────────────────────────────────────┤
│                        Business Logic Layer                 │
├─────────────────────────────────────────────────────────────┤
│ InputHandler │ DamageCalculator │ ComboManager │ LootSystem │
├─────────────────────────────────────────────────────────────┤
│                        State Management Layer               │
├─────────────────────────────────────────────────────────────┤
│    CombatState │ EnemyState │ PlayerState │ AnimationState  │
├─────────────────────────────────────────────────────────────┤
│                        Core Services Layer                  │
├─────────────────────────────────────────────────────────────┤
│ AudioManager │ HapticManager │ AnimationEngine │ PerfMonitor│
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Framework**: React Native 0.70+ with Expo SDK 48+
- **State Management**: Zustand for performance-critical combat state
- **Animation**: React Native Reanimated 3.x for 60 FPS animations
- **Gesture Handling**: React Native Gesture Handler for low-latency input
- **Audio**: Expo AV with AudioContext for low-latency audio
- **Testing**: React Native Testing Library + Jest + Detox for E2E

## Component Architecture

### Core Components

#### 1. CombatScreen Component
**Responsibility**: Main container managing combat flow and layout

```typescript
interface CombatScreenProps {
  enemy: Enemy;
  player: Player;
  onEnemyDefeat: (enemy: Enemy, loot: Loot[]) => void;
  onCombatEnd: () => void;
}

interface CombatScreenState {
  isActive: boolean;
  isPaused: boolean;
  combatMetrics: CombatMetrics;
}
```

**Key Features**:
- Manages overall combat lifecycle
- Coordinates between input, animation, and state systems
- Handles performance monitoring and metrics collection

#### 2. EnemyComponent
**Responsibility**: Renders enemy with weakness spots and handles visual feedback

```typescript
interface EnemyComponentProps {
  enemy: Enemy;
  weaknessSpots: WeaknessSpot[];
  onTap: (position: Position, isWeakness: boolean) => void;
  animationState: EnemyAnimationState;
}

interface WeaknessSpot {
  id: string;
  position: Position;
  radius: number;
  multiplier: number;
  isVisible: boolean;
  timeRemaining: number;
}
```

**Key Features**:
- Renders enemy sprite with real-time deformation
- Manages weakness spot visualization and timing
- Handles tap detection with precise hit testing
- Supports accessibility requirements (minimum touch targets)

#### 3. InputHandler Service
**Responsibility**: Low-latency input processing and gesture recognition

```typescript
interface InputHandlerConfig {
  maxLatency: number; // 50ms target
  multiTouchMode: 'primary' | 'all' | 'disabled';
  hapticEnabled: boolean;
  antiCheatThreshold: number; // 20 taps/second
}

interface TapEvent {
  id: string;
  position: Position;
  timestamp: number;
  force?: number; // iOS 3D Touch support
}
```

**Key Features**:
- Uses React Native Gesture Handler for minimal latency
- Implements touch debouncing and anti-cheat detection
- Provides immediate haptic feedback
- Tracks input metrics for performance analysis

#### 4. DamageCalculator Service
**Responsibility**: Server-authoritative damage computation

```typescript
interface DamageCalculationInput {
  basePower: number;
  isWeaknessHit: boolean;
  weaknessMultiplier: number;
  comboCount: number;
  randomSeed?: number; // For deterministic testing
}

interface DamageResult {
  finalDamage: number;
  isCritical: boolean;
  multipliers: {
    base: number;
    weakness: number;
    combo: number;
    random: number;
  };
  effectType: 'normal' | 'critical' | 'mega';
}
```

**Key Features**:
- Implements all damage calculation formulas from PRD
- Provides deterministic results for testing
- Supports damage type classification for visual effects
- Thread-safe for high-frequency calculations

#### 5. ComboManager Service
**Responsibility**: Combo tracking and multiplier calculation

```typescript
interface ComboState {
  count: number;
  multiplier: number;
  lastHitTimestamp: number;
  isActive: boolean;
  maxCombo: number;
}

interface ComboConfig {
  baseMultiplier: number; // 0.5 per combo level
  maxMultiplier: number; // 5.0x cap
  decayTime: number; // Time before combo resets
  milestoneThresholds: number[]; // [10, 25, 50] for special effects
}
```

**Key Features**:
- Tracks consecutive weakness hits
- Calculates combo multipliers with configurable caps
- Handles combo decay and reset logic
- Triggers milestone effects for UI feedback

### Animation System Architecture

#### ParticleSystem Component
**Responsibility**: High-performance particle effects for combat feedback

```typescript
interface ParticleSystemProps {
  effects: ParticleEffect[];
  maxParticles: number; // 100+ simultaneous
  poolSize: number;
  performanceMode: 'high' | 'balanced' | 'battery';
}

interface ParticleEffect {
  type: 'impact' | 'damage_number' | 'loot_drop' | 'combo_burst';
  position: Position;
  duration: number;
  intensity: number;
  color: string;
  customData?: any;
}
```

**Key Features**:
- Object pooling for memory efficiency
- Batch rendering for performance
- Configurable quality levels for different devices
- Support for custom particle types and behaviors

#### AnimationEngine Service
**Responsibility**: Coordinates all combat animations for 60 FPS performance

```typescript
interface AnimationConfig {
  targetFPS: number; // 60 FPS
  enableScreenShake: boolean;
  particleQuality: 'low' | 'medium' | 'high';
  reducedMotion: boolean; // Accessibility
}

interface AnimationState {
  activeAnimations: Animation[];
  performanceMetrics: {
    frameTime: number;
    droppedFrames: number;
    memoryUsage: number;
  };
}
```

**Key Features**:
- Uses React Native Reanimated for native thread animations
- Implements screen shake with configurable intensity
- Manages animation queues and priority system
- Provides performance monitoring and automatic quality adjustment

## State Management Design

### Combat State Schema

```typescript
interface CombatState {
  // Combat Flow
  phase: 'idle' | 'active' | 'victory' | 'defeat';
  startTime: number;
  isAutoPilotEnabled: boolean;

  // Enemy State
  currentEnemy: Enemy | null;
  enemyHealth: number;
  maxEnemyHealth: number;
  weaknessSpots: WeaknessSpot[];
  lastWeaknessRotation: number;

  // Player State
  basePower: number;
  totalDamageDealt: number;
  totalTaps: number;
  accuracy: number; // weakness hits / total taps

  // Combo System
  currentCombo: ComboState;
  comboHistory: number[]; // For analytics

  // Loot System
  pendingLoot: LootDrop[];
  sessionEarnings: number;

  // Performance Metrics
  metrics: {
    averageInputLatency: number;
    currentFPS: number;
    memoryUsage: number;
    batteryImpact: number;
  };
}
```

### State Management Pattern

Using Zustand with performance optimizations:

```typescript
// Combat store with selective subscriptions
const useCombatStore = create<CombatState>((set, get) => ({
  // State initialization
  phase: 'idle',
  currentEnemy: null,
  // ... other initial state

  // Actions
  actions: {
    handleTap: (position: Position) => {
      const startTime = performance.now();

      // Immediate state update for responsiveness
      set((state) => ({
        totalTaps: state.totalTaps + 1,
        // ... other immediate updates
      }));

      // Async processing for complex calculations
      requestAnimationFrame(() => {
        // Damage calculation and effects
        const endTime = performance.now();
        const latency = endTime - startTime;

        // Update performance metrics
        set((state) => ({
          metrics: {
            ...state.metrics,
            averageInputLatency: (state.metrics.averageInputLatency + latency) / 2
          }
        }));
      });
    },

    updateWeaknessSpots: () => {
      // Weakness spot rotation logic
    },

    calculateDamage: (input: DamageCalculationInput) => {
      // Damage calculation with combo multipliers
    }
  }
}));

// Selective subscriptions for performance
const useEnemyHealth = () => useCombatStore((state) => state.enemyHealth);
const useComboCount = () => useCombatStore((state) => state.currentCombo.count);
const useCombatActions = () => useCombatStore((state) => state.actions);
```

## Test-Driven Development Strategy

### Testing Pyramid

```
┌─────────────────────────────────────────┐
│              E2E Tests (5%)             │
│            Full Combat Flow             │
├─────────────────────────────────────────┤
│         Integration Tests (15%)         │
│      Component + Service Integration    │
├─────────────────────────────────────────┤
│           Unit Tests (80%)              │
│    Services, Utilities, Components     │
└─────────────────────────────────────────┘
```

### Unit Test Categories

#### 1. Input Handler Tests
```typescript
describe('InputHandler', () => {
  describe('tap detection', () => {
    it('should register tap with <50ms latency', async () => {
      const handler = new InputHandler(mockConfig);
      const startTime = performance.now();

      const result = await handler.handleTap(mockTapEvent);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
      expect(result.isValid).toBe(true);
    });

    it('should trigger haptic feedback within 20ms', async () => {
      const hapticSpy = jest.spyOn(Haptics, 'impactAsync');
      const handler = new InputHandler({ hapticEnabled: true });

      await handler.handleTap(mockTapEvent);

      expect(hapticSpy).toHaveBeenCalledWithin(20);
    });

    it('should detect automated tapping >20 taps/second', () => {
      const handler = new InputHandler(mockConfig);
      const rapidTaps = generateRapidTaps(25, 1000); // 25 taps in 1 second

      const result = handler.validateTapPattern(rapidTaps);

      expect(result.isAutomated).toBe(true);
      expect(result.suspiciousActivity).toBe(true);
    });
  });
});
```

#### 2. Damage Calculator Tests
```typescript
describe('DamageCalculator', () => {
  describe('base damage calculation', () => {
    it('should calculate damage within specified range', () => {
      const calculator = new DamageCalculator();
      const input: DamageCalculationInput = {
        basePower: 100,
        isWeaknessHit: false,
        weaknessMultiplier: 1.0,
        comboCount: 0,
        randomSeed: 0.5 // Fixed for testing
      };

      const result = calculator.calculate(input);

      expect(result.finalDamage).toBeGreaterThanOrEqual(100);
      expect(result.finalDamage).toBeLessThanOrEqual(150);
      expect(result.multipliers.base).toBe(1.0);
    });

    it('should apply weakness multiplier correctly', () => {
      const calculator = new DamageCalculator();
      const input: DamageCalculationInput = {
        basePower: 100,
        isWeaknessHit: true,
        weaknessMultiplier: 2.0,
        comboCount: 0,
        randomSeed: 0.5
      };

      const result = calculator.calculate(input);

      expect(result.multipliers.weakness).toBe(2.0);
      expect(result.finalDamage).toBeGreaterThanOrEqual(200);
    });

    it('should cap combo multiplier at 5.0x', () => {
      const calculator = new DamageCalculator();
      const input: DamageCalculationInput = {
        basePower: 100,
        isWeaknessHit: false,
        weaknessMultiplier: 1.0,
        comboCount: 20, // Would be 11.0x without cap
        randomSeed: 0.5
      };

      const result = calculator.calculate(input);

      expect(result.multipliers.combo).toBe(5.0);
    });
  });
});
```

#### 3. Combo Manager Tests
```typescript
describe('ComboManager', () => {
  describe('combo tracking', () => {
    it('should increment combo on weakness hit', () => {
      const manager = new ComboManager();

      manager.recordHit(true); // weakness hit

      expect(manager.getComboState().count).toBe(1);
      expect(manager.getComboState().multiplier).toBe(1.5);
    });

    it('should reset combo on normal hit', () => {
      const manager = new ComboManager();
      manager.recordHit(true); // weakness hit
      manager.recordHit(false); // normal hit

      expect(manager.getComboState().count).toBe(0);
      expect(manager.getComboState().multiplier).toBe(1.0);
    });

    it('should trigger milestone effects', () => {
      const manager = new ComboManager();
      const milestoneCallback = jest.fn();
      manager.onMilestone(milestoneCallback);

      // Hit 10 combo milestone
      for (let i = 0; i < 10; i++) {
        manager.recordHit(true);
      }

      expect(milestoneCallback).toHaveBeenCalledWith(10);
    });
  });
});
```

### Integration Test Strategy

#### Component Integration Tests
```typescript
describe('CombatScreen Integration', () => {
  it('should complete full tap-to-feedback cycle within 100ms', async () => {
    const { getByTestId } = render(
      <CombatScreen
        enemy={mockEnemy}
        player={mockPlayer}
        onEnemyDefeat={jest.fn()}
        onCombatEnd={jest.fn()}
      />
    );

    const enemy = getByTestId('enemy-component');
    const startTime = performance.now();

    fireEvent.press(enemy, { nativeEvent: { pageX: 100, pageY: 100 } });

    await waitFor(() => {
      expect(getByTestId('damage-number')).toBeVisible();
    });

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('should handle weakness spot hit with correct multiplier', async () => {
    const onEnemyDefeat = jest.fn();
    const { getByTestId } = render(
      <CombatScreen
        enemy={{ ...mockEnemy, health: 50 }}
        player={mockPlayer}
        onEnemyDefeat={onEnemyDefeat}
        onCombatEnd={jest.fn()}
      />
    );

    // Tap on weakness spot
    const weaknessSpot = getByTestId('weakness-spot-0');
    fireEvent.press(weaknessSpot);

    await waitFor(() => {
      const damageNumber = getByTestId('damage-number');
      expect(damageNumber).toHaveTextContent(/2[0-9][0-9]/); // 2x multiplier
    });
  });
});
```

### End-to-End Test Scenarios

#### Critical User Journeys
```typescript
describe('Combat E2E Tests', () => {
  it('should complete basic combat encounter', async () => {
    await device.launchApp();
    await element(by.id('combat-button')).tap();

    // Wait for combat screen to load
    await waitFor(element(by.id('enemy-component')))
      .toBeVisible()
      .withTimeout(2000);

    // Tap enemy multiple times
    for (let i = 0; i < 10; i++) {
      await element(by.id('enemy-component')).tap();
      await sleep(100); // Realistic user tapping
    }

    // Verify enemy defeat
    await waitFor(element(by.id('victory-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Verify loot collection
    await expect(element(by.id('loot-animation'))).toBeVisible();
  });

  it('should maintain performance during extended combat', async () => {
    await device.launchApp();
    await element(by.id('combat-button')).tap();

    // Rapid tapping for 60 seconds
    const startTime = Date.now();
    while (Date.now() - startTime < 60000) {
      await element(by.id('enemy-component')).tap();
      await sleep(50); // 20 taps per second
    }

    // Check performance metrics
    const fpsText = await element(by.id('fps-counter')).getAttributes();
    const fps = parseInt(fpsText.text);
    expect(fps).toBeGreaterThanOrEqual(55); // Allow 5 FPS tolerance
  });
});
```

### Performance Testing Strategy

#### Automated Performance Tests
```typescript
describe('Performance Tests', () => {
  it('should handle 100+ simultaneous particle effects', async () => {
    const particleSystem = new ParticleSystem({
      maxParticles: 150,
      poolSize: 200,
      performanceMode: 'high'
    });

    // Generate 150 simultaneous effects
    const effects = Array.from({ length: 150 }, (_, i) => ({
      type: 'impact' as const,
      position: { x: Math.random() * 400, y: Math.random() * 800 },
      duration: 300,
      intensity: 1.0,
      color: '#FF0000'
    }));

    const startTime = performance.now();
    particleSystem.addEffects(effects);

    // Simulate one frame of animation
    particleSystem.update(16.67); // 60 FPS frame time

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(16.67); // Must complete within frame budget
  });

  it('should maintain memory usage under 150MB', async () => {
    const initialMemory = await getMemoryUsage();

    // Simulate extended combat session
    for (let i = 0; i < 1000; i++) {
      await simulateTapAndEffects();
    }

    const finalMemory = await getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;

    expect(memoryIncrease).toBeLessThan(150 * 1024 * 1024); // 150MB in bytes
  });
});
```

## Performance Optimization Plan

### Input Latency Optimization

#### 1. Native Module Integration
```typescript
// Custom native module for ultra-low latency input
interface NativeInputModule {
  registerTapHandler: (callback: (event: NativeTapEvent) => void) => void;
  enableHapticPreload: () => void; // Pre-warm haptic engine
  getInputMetrics: () => Promise<InputMetrics>;
}

// Implementation strategy:
// - Bypass React Native bridge for critical path
// - Direct native event handling with 1-2ms latency
// - Batch non-critical updates to main thread
```

#### 2. Gesture Handler Optimization
```typescript
// Optimized tap gesture configuration
const tapGestureConfig = {
  shouldCancelWhenOutside: false,
  enabled: true,
  hitSlop: { top: 5, bottom: 5, left: 5, right: 5 },
  numberOfTaps: 1,
  maxDelayMs: 0, // Immediate recognition
  simultaneousHandlers: [], // Prevent conflicts
};

// Use simultaneous gestures for weakness spots
const weaknessGestureConfig = {
  ...tapGestureConfig,
  id: 'weakness-tap',
  priority: 1, // Higher priority than base tap
};
```

### Animation Performance

#### 1. Reanimated Worklets
```typescript
// Move critical animations to UI thread
const damageNumberAnimation = useSharedValue(0);

const animateDamageNumber = (damage: number) => {
  'worklet';

  // All animation logic runs on UI thread
  damageNumberAnimation.value = withSequence(
    withTiming(1, { duration: 100 }),
    withDelay(1400, withTiming(0, { duration: 100 }))
  );
};

// Derived values for position and scale
const animatedStyle = useAnimatedStyle(() => ({
  opacity: damageNumberAnimation.value,
  transform: [
    { translateY: interpolate(damageNumberAnimation.value, [0, 1], [0, -50]) },
    { scale: interpolate(damageNumberAnimation.value, [0, 0.1, 1], [0, 1.2, 1]) }
  ],
}));
```

#### 2. Particle System Optimization
```typescript
// Object pooling for particle effects
class ParticlePool {
  private pool: Particle[] = [];
  private active: Particle[] = [];

  constructor(size: number) {
    for (let i = 0; i < size; i++) {
      this.pool.push(new Particle());
    }
  }

  acquire(): Particle | null {
    if (this.pool.length === 0) return null;

    const particle = this.pool.pop()!;
    this.active.push(particle);
    return particle;
  }

  release(particle: Particle): void {
    particle.reset();
    const index = this.active.indexOf(particle);
    if (index !== -1) {
      this.active.splice(index, 1);
      this.pool.push(particle);
    }
  }
}
```

### Memory Management

#### 1. Component Memoization
```typescript
// Memoize expensive components
const EnemyComponent = React.memo<EnemyComponentProps>(({
  enemy,
  weaknessSpots,
  animationState
}) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.enemy.id === nextProps.enemy.id &&
    prevProps.enemy.health === nextProps.enemy.health &&
    prevProps.weaknessSpots.length === nextProps.weaknessSpots.length &&
    prevProps.animationState.isAnimating === nextProps.animationState.isAnimating
  );
});

// Memoize expensive calculations
const useDamageCalculation = (basePower: number, combo: number) => {
  return useMemo(() => {
    return new DamageCalculator(basePower, combo);
  }, [basePower, Math.floor(combo / 5)]); // Only recalculate every 5 combo levels
};
```

#### 2. Cleanup Strategies
```typescript
// Automatic cleanup for animations and effects
const useCleanupOnUnmount = (cleanupFn: () => void) => {
  useEffect(() => {
    return cleanupFn;
  }, []);
};

// Component with comprehensive cleanup
const CombatScreen: React.FC<CombatScreenProps> = (props) => {
  const animationRef = useRef<AnimationEngine | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);

  useCleanupOnUnmount(() => {
    animationRef.current?.dispose();
    particleSystemRef.current?.dispose();
  });

  // Component implementation
};
```

### Battery Optimization

#### 1. Adaptive Quality System
```typescript
interface PerformanceConfig {
  targetFPS: number;
  particleCount: number;
  effectQuality: 'low' | 'medium' | 'high';
  enableScreenShake: boolean;
  enableHaptics: boolean;
}

class AdaptivePerformanceManager {
  private config: PerformanceConfig;
  private batteryLevel = 1.0;
  private isLowPowerMode = false;

  adjustForBatteryLevel(level: number): void {
    this.batteryLevel = level;

    if (level < 0.2) { // Below 20%
      this.config = {
        targetFPS: 30,
        particleCount: 20,
        effectQuality: 'low',
        enableScreenShake: false,
        enableHaptics: false
      };
    } else if (level < 0.5) { // Below 50%
      this.config = {
        targetFPS: 45,
        particleCount: 50,
        effectQuality: 'medium',
        enableScreenShake: true,
        enableHaptics: false
      };
    }
    // Full quality above 50%
  }
}
```

#### 2. Background Mode Handling
```typescript
// Pause non-essential systems when app backgrounds
const useBatteryOptimization = () => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // Pause particle effects
        ParticleSystem.pauseAll();

        // Reduce animation frame rate
        AnimationEngine.setTargetFPS(1);

        // Disable haptics and audio
        HapticManager.disable();
        AudioManager.pauseAll();
      } else if (nextAppState === 'active') {
        // Resume full performance
        ParticleSystem.resumeAll();
        AnimationEngine.setTargetFPS(60);
        HapticManager.enable();
        AudioManager.resumeAll();
      }

      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);
};
```

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
**Deliverables**: Basic tap input and damage system

#### Week 1: Core Architecture Setup
- [ ] **Setup project structure with Expo SDK 48+**
  - Initialize React Native project with required dependencies
  - Configure TypeScript and ESLint rules
  - Setup testing environment (Jest + React Native Testing Library)

- [ ] **Implement basic InputHandler service**
  - Create touch gesture recognition with React Native Gesture Handler
  - Implement haptic feedback integration
  - Add basic anti-cheat detection for automated tapping

- [ ] **Create DamageCalculator service with TDD**
  - Implement base damage formula: Power × (1.0-1.5 random)
  - Add weakness multiplier calculation (2.0x-3.0x)
  - Create comprehensive unit tests for all damage scenarios

#### Week 2: Basic Combat Loop
- [ ] **Develop EnemyComponent with hit detection**
  - Create enemy sprite rendering with health bar
  - Implement precise tap-to-coordinate mapping
  - Add basic visual feedback for successful hits

- [ ] **Implement state management with Zustand**
  - Design combat state schema with performance optimization
  - Create selective subscriptions for different UI components
  - Add state persistence for combat metrics

- [ ] **Create basic damage number display**
  - Implement floating damage numbers with animations
  - Add color coding for different damage types
  - Ensure 60 FPS performance during number animations

**Success Criteria**:
- Tap-to-damage latency < 100ms measured
- All damage calculation tests passing
- Basic combat loop functional end-to-end

### Phase 2: Weakness System (Weeks 3-4)
**Deliverables**: Full weakness spot system with combo mechanics

#### Week 3: Weakness Spot Implementation
- [ ] **Create WeaknessSpot component with animations**
  - Implement glowing weakness spot visualization
  - Add 2-3 second visibility timer with fade transitions
  - Create 0.5s telegraph animation before spot appears

- [ ] **Implement weakness rotation system**
  - Create 1-3 weakness spots per enemy based on type
  - Add automatic rotation every 2-3 seconds
  - Ensure minimum 44x44 pixel touch targets for accessibility

- [ ] **Add precise hit detection for weakness spots**
  - Implement circular hit areas with configurable radius
  - Add visual feedback for weakness vs normal hits
  - Create hit accuracy tracking for analytics

#### Week 4: Combo System Development
- [ ] **Develop ComboManager service**
  - Implement combo tracking for consecutive weakness hits
  - Add combo multiplier calculation: 1.0 + (0.5 × count), max 5.0x
  - Create combo reset logic on normal hits or misses

- [ ] **Create combo UI display**
  - Design combo counter with animated updates
  - Add milestone celebration effects (10x, 25x, 50x combos)
  - Implement combo decay visualization

- [ ] **Integrate combo system with damage calculation**
  - Update DamageCalculator to include combo multipliers
  - Add combo state to damage result display
  - Create comprehensive integration tests

**Success Criteria**:
- Weakness spots appear and rotate correctly
- Combo system accurately tracks consecutive hits
- Damage multipliers calculate correctly with all factors

### Phase 3: Visual Polish & Effects (Weeks 5-6)
**Deliverables**: Complete visual feedback and particle systems

#### Week 5: Advanced Particle System
- [ ] **Implement ParticleSystem with object pooling**
  - Create particle effect components for impacts, combos, loot
  - Implement object pooling for 100+ simultaneous particles
  - Add configurable quality levels for different devices

- [ ] **Add enemy deformation animations**
  - Implement squash/stretch animations on hit (0.2s duration)
  - Create proportional screen shake effects (0-5 pixel amplitude)
  - Add impact ripple effects at tap locations

- [ ] **Create audio feedback system**
  - Integrate Expo AV for low-latency audio playback
  - Implement 3-tier audio feedback based on damage amount
  - Add haptic patterns that sync with audio effects

#### Week 6: Advanced Visual Effects
- [ ] **Implement critical hit effects**
  - Create special particle bursts for critical damage
  - Add enhanced screen shake for mega damage hits
  - Implement combo milestone celebrations

- [ ] **Add loot drop animations**
  - Create Pyreal drop physics simulation
  - Implement auto-collection within 100 pixel radius
  - Add loot collection animations and "+X Pyreal" display

- [ ] **Performance optimization pass**
  - Profile animation performance on target devices
  - Implement adaptive quality based on device capabilities
  - Add frame rate monitoring and automatic quality adjustment

**Success Criteria**:
- Consistent 60 FPS during intense particle effects
- Audio feedback plays within 50ms of events
- All visual effects meet design specifications

### Phase 4: Performance & Polish (Weeks 7-8)
**Deliverables**: Optimized performance and complete testing coverage

#### Week 7: Performance Optimization
- [ ] **Implement native input optimization**
  - Create native module for ultra-low latency input handling
  - Optimize gesture handler configuration for minimal delay
  - Add input latency monitoring and reporting

- [ ] **Memory and battery optimization**
  - Implement comprehensive cleanup systems
  - Add adaptive performance based on battery level
  - Create background mode optimizations

- [ ] **Advanced testing implementation**
  - Complete unit test suite with 90%+ coverage
  - Implement integration tests for all major user flows
  - Add performance benchmarking tests

#### Week 8: Final Polish & Testing
- [ ] **End-to-end testing on target devices**
  - Test on minimum spec devices (2020 Android/iOS)
  - Verify 60 FPS performance requirements
  - Validate memory usage stays under 150MB

- [ ] **Accessibility implementation**
  - Add colorblind support for weakness spots
  - Implement screen reader support for damage numbers
  - Add optional larger touch targets (66x66 pixels)

- [ ] **Anti-cheat and security measures**
  - Finalize automated tapping detection
  - Implement server-side damage validation for leaderboards
  - Add secure storage for player progression

**Success Criteria**:
- Input latency consistently < 50ms on target devices
- Memory usage never exceeds 150MB during extended play
- Battery drain < 5% per 10-minute session

### Phase 5: Launch Preparation (Week 9)
**Deliverables**: Production-ready combat system

#### Week 9: Launch Readiness
- [ ] **Final integration testing**
  - Complete end-to-end testing of all combat scenarios
  - Validate performance metrics meet all requirements
  - Test edge cases and error handling

- [ ] **Documentation and monitoring**
  - Complete technical documentation for maintenance team
  - Implement analytics tracking for combat metrics
  - Add crash reporting and performance monitoring

- [ ] **Production deployment preparation**
  - Create deployment scripts and configuration
  - Set up monitoring dashboards for launch metrics
  - Prepare rollback procedures if needed

**Success Criteria**:
- All acceptance criteria from PRD validated
- Performance requirements met on all target devices
- System ready for production deployment

## Risk Mitigation

### Technical Risks

#### 1. React Native Performance Limitations
**Risk**: RN bridge latency causing >100ms input delay
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Implement native modules for critical input path
- Use React Native Reanimated worklets for UI thread operations
- Fallback to reduced feature set if performance targets not met

#### 2. Device Fragmentation Issues
**Risk**: Performance varies significantly across Android devices
**Probability**: High
**Impact**: Medium
**Mitigation**:
- Implement adaptive quality system based on device capabilities
- Define minimum device requirements with graceful degradation
- Extensive testing on low-end devices from 2020

#### 3. Memory Leaks in Particle System
**Risk**: Extended gameplay causing memory growth and crashes
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Implement object pooling for all dynamic objects
- Add comprehensive cleanup in component lifecycle
- Memory profiling and automated leak detection in CI

### Design Risks

#### 4. Weakness Spot Visibility Balance
**Risk**: Spots too hard to see or too easy, affecting game balance
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- A/B testing with different visibility durations and sizes
- Configurable parameters for post-launch tuning
- Analytics tracking of hit/miss ratios for balance adjustments

#### 5. Combo System Exploitation
**Risk**: Players finding ways to maintain infinite combos
**Probability**: Low
**Impact**: High
**Mitigation**:
- Server-side validation of combo logic for leaderboards
- Automatic combo decay after time thresholds
- Analytics monitoring for suspicious combo patterns

### Timeline Risks

#### 6. Third-party Library Integration Delays
**Risk**: Audio or gesture libraries not working as expected
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Prototype key integrations in first week
- Identify fallback libraries for critical dependencies
- Built-in Expo APIs as last resort options

## Monitoring & Metrics

### Performance Metrics
- **Input Latency**: Target <50ms, Alert >80ms
- **Frame Rate**: Target 60 FPS, Alert <50 FPS
- **Memory Usage**: Target <100MB, Alert >140MB
- **Battery Impact**: Target <4%/10min, Alert >6%/10min

### User Engagement Metrics
- **Taps per Session**: Target 150+
- **Combo Achievement Rate**: Target 70% players achieve 10+ combo
- **Session Length**: Target 8+ minutes average
- **Accuracy Rate**: Target 60% weakness hit ratio

### Technical Health Metrics
- **Crash Rate**: Target <0.1% sessions
- **Load Time**: Target <2 seconds to combat ready
- **Network Errors**: Target <1% for leaderboard sync
- **Anti-cheat Triggers**: Monitor for <0.5% false positives

## Conclusion

This Technical Design Document provides a comprehensive blueprint for implementing the core combat tap mechanic with Test-Driven Development principles. The architecture prioritizes performance, maintainability, and scalability while meeting all functional requirements from the PRD.

Key success factors:
1. **Performance-first design** with native optimizations where needed
2. **Comprehensive testing strategy** ensuring reliability and maintainability
3. **Phased implementation** allowing for iterative feedback and refinement
4. **Risk mitigation** for known technical and design challenges
5. **Monitoring strategy** for post-launch optimization and maintenance

The 9-week timeline provides sufficient buffer for unexpected challenges while maintaining aggressive performance targets. The TDD approach ensures code quality and facilitates future feature development on this foundation.

---
*Generated: 2025-09-25 | TDD Generator v1.0*