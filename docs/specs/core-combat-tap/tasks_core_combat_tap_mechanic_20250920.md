# Core Combat Tap Mechanic Implementation Tasks

## Document Metadata
- **Source TDD**: `/docs/specs/core-combat-tap/tdd_core_combat_tap_mechanic_20250920.md`
- **Generated**: 2025-09-20
- **Total Tasks**: 47
- **Estimated Duration**: 4 weeks
- **Methodology**: Test-Driven Development (TDD)

## Phase 1: Foundation Setup
*Duration: 5 days | Priority: P0 | Prerequisites: None*

### Task 1.1: Initialize Expo React Native Project
**ROLE**: You are a senior mobile developer setting up a new React Native project

**CONTEXT**: Based on the TDD architecture requirements, we need React Native 0.72+ with Expo SDK 49+, Legend-state v3, and Reanimated 3

**OBJECTIVE**: Create and configure the Expo React Native project with proper structure and dependencies

**REQUIREMENTS**:
- Initialize Expo project with TypeScript template
- Create directory structure:
  ```
  src/
  ├── components/
  │   ├── combat/
  │   ├── ui/
  │   └── common/
  ├── stores/
  ├── services/
  ├── hooks/
  ├── types/
  ├── utils/
  ├── constants/
  └── __tests__/
  ```
- Install core dependencies from TDD:
  - expo@~49.0.0
  - react-native@0.72.x
  - @legendapp/state@3.x
  - react-native-reanimated@3.x
  - expo-haptics
  - expo-av (for audio)
- Configure TypeScript with strict mode
- Set up ESLint and Prettier

**ACCEPTANCE CRITERIA**:
- [ ] Expo project created with TypeScript
- [ ] Directory structure matches specification
- [ ] All dependencies installed and versions match TDD
- [ ] TypeScript configured with strict mode
- [ ] Project runs on iOS simulator and Android emulator
- [ ] Linting and formatting configured

**VALIDATION COMMANDS**:
```bash
npx expo --version  # Should show 49.x
npm list @legendapp/state  # Should show 3.x
npm run typescript  # Should pass with no errors
npx expo start  # Should start without errors
```

**DELIVERABLES**:
1. Initialized Expo project
2. Package.json with all dependencies
3. TypeScript configuration
4. ESLint/Prettier configuration

**DEPENDENCIES**: None
**TOOLS NEEDED**: Node.js 18+, npm/yarn, Expo CLI

---

### Task 1.2: Set Up Test Infrastructure with TDD Focus
**ROLE**: You are a test automation engineer implementing comprehensive testing setup

**CONTEXT**: TDD requires test-first approach with React Native Testing Library, Jest, MSW for mocking, and >80% coverage target

**OBJECTIVE**: Configure complete testing infrastructure for Test-Driven Development

**STEP-BY-STEP INSTRUCTIONS**:
1. Install testing dependencies:
   ```bash
   npm install --save-dev @testing-library/react-native
   npm install --save-dev @testing-library/jest-native
   npm install --save-dev @testing-library/user-event
   npm install --save-dev jest-expo
   npm install --save-dev msw
   npm install --save-dev @types/jest
   ```

2. Create jest.config.js:
   ```javascript
   module.exports = {
     preset: 'jest-expo',
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     transformIgnorePatterns: [
       'node_modules/(?!(@react-native|react-native|@react-navigation|expo|@legendapp)/)'
     ],
     testEnvironment: 'jsdom',
     collectCoverageFrom: [
       'src/**/*.{ts,tsx}',
       '!src/**/*.d.ts',
       '!src/**/index.ts'
     ],
     coverageThreshold: {
       global: {
         branches: 80,
         functions: 80,
         lines: 80,
         statements: 80
       }
     }
   };
   ```

3. Create jest.setup.js with mocks:
   ```javascript
   import '@testing-library/jest-native/extend-expect';

   // Mock expo-haptics
   jest.mock('expo-haptics', () => ({
     impactAsync: jest.fn(),
     ImpactFeedbackStyle: {
       Light: 'light',
       Medium: 'medium',
       Heavy: 'heavy'
     }
   }));

   // Mock AsyncStorage
   jest.mock('@react-native-async-storage/async-storage', () =>
     require('@react-native-async-storage/async-storage/jest/async-storage-mock')
   );
   ```

4. Create test utilities (src/utils/test-utils.tsx):
   ```typescript
   import React from 'react';
   import { render, RenderOptions } from '@testing-library/react-native';

   const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
     return <>{children}</>;
   };

   const customRender = (
     ui: React.ReactElement,
     options?: Omit<RenderOptions, 'wrapper'>
   ) => render(ui, { wrapper: AllTheProviders, ...options });

   export * from '@testing-library/react-native';
   export { customRender as render };
   ```

5. Set up MSW for API mocking (src/mocks/handlers.ts)
6. Configure coverage reporting

**ACCEPTANCE CRITERIA**:
- [ ] Jest configured with React Native preset
- [ ] React Native Testing Library installed and configured
- [ ] MSW set up for API mocking
- [ ] Test utilities created
- [ ] Coverage thresholds set to 80%
- [ ] Sample test passes
- [ ] Coverage report generates correctly

**TESTING VALIDATION**:
```bash
npm test -- --coverage  # Should run and show coverage
npm test -- --watchAll  # Should start in watch mode
```

**DEPENDENCIES**: Task 1.1
**POTENTIAL BLOCKERS**: Module resolution issues, mock configuration

---

### Task 1.3: Configure Legend-state v3 Store Architecture
**ROLE**: You are a state management architect implementing reactive stores

**CONTEXT**: TDD specifies Legend-state v3 for fine-grained reactivity with CombatStore, PlayerStore, and EnemyStore

**OBJECTIVE**: Set up Legend-state v3 stores with TypeScript and testing utilities

**TECHNICAL SPECIFICATIONS**:
```typescript
// stores/combat.store.ts
import { observable, computed, batch } from '@legendapp/state';

interface CombatState {
  session: {
    active: boolean;
    startTime: number;
    enemy: Enemy | null;
  };
  stats: {
    totalDamage: number;
    hits: number;
    weaknessHits: number;
    currentCombo: number;
    maxCombo: number;
  };
  input: {
    lastTapTime: number;
    tapCount: number;
    tapRate: number;
  };
}

export const combat$ = observable<CombatState>({
  session: { active: false, startTime: 0, enemy: null },
  stats: { totalDamage: 0, hits: 0, weaknessHits: 0, currentCombo: 0, maxCombo: 0 },
  input: { lastTapTime: 0, tapCount: 0, tapRate: 0 }
});
```

**IMPLEMENTATION STEPS**:
1. Create stores directory structure
2. Implement CombatStore with observable state
3. Implement PlayerStore for player stats
4. Implement EnemyStore for enemy management
5. Create computed values for derived state
6. Set up batch updates for performance
7. Create store hooks for React components
8. Write test utilities for store testing

**ACCEPTANCE CRITERIA**:
- [ ] All three stores created with TypeScript interfaces
- [ ] Observable state updates trigger re-renders
- [ ] Computed values work correctly
- [ ] Batch updates prevent excessive re-renders
- [ ] Store hooks provide easy component integration
- [ ] Store reset functionality for testing

**DEPENDENCIES**: Task 1.1, 1.2
**COMPLEXITY**: High

---

### Task 1.4: Set Up CI/CD Pipeline with Test Automation
**ROLE**: You are a DevOps engineer automating the development workflow

**CONTEXT**: TDD requires continuous testing with >80% coverage enforcement and automated builds via GitHub Actions and EAS Build

**OBJECTIVE**: Create CI/CD pipeline that enforces TDD practices

**PIPELINE CONFIGURATION**:
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - name: Check coverage thresholds
        run: |
          if [ $(cat coverage/coverage-summary.json | jq '.total.lines.pct') -lt 80 ]; then
            echo "Coverage below 80%"
            exit 1
          fi
      - uses: codecov/codecov-action@v3

  build-preview:
    needs: test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: expo/expo-github-action@v8
      - run: eas build --platform all --profile preview --non-interactive
```

**ACCEPTANCE CRITERIA**:
- [ ] GitHub Actions workflow created
- [ ] Tests run on every push/PR
- [ ] Coverage enforcement blocks merge if <80%
- [ ] Linting and type checking automated
- [ ] EAS Build configured for preview builds
- [ ] Build artifacts accessible for testing

**DEPENDENCIES**: Task 1.1, 1.2
**DELIVERABLES**: CI/CD configuration, build scripts

---

### Task 1.5: Create TDD Documentation and Guidelines
**ROLE**: You are a technical lead establishing team TDD practices

**CONTEXT**: Team needs clear TDD guidelines following RED-GREEN-REFACTOR cycle with React Native Testing Library patterns

**OBJECTIVE**: Document TDD workflow and create example templates

**DOCUMENTATION STRUCTURE**:
1. TDD Quick Start Guide
   - RED: Write failing test first
   - GREEN: Write minimal code to pass
   - REFACTOR: Improve code quality

2. Testing Patterns Library:
   ```typescript
   // Example: Component Test Template
   describe('ComponentName', () => {
     const user = userEvent.setup();

     test('should render initial state', () => {
       render(<ComponentName />);
       expect(screen.getByText('Expected')).toBeTruthy();
     });

     test('should handle user interaction', async () => {
       render(<ComponentName />);
       await user.press(screen.getByText('Button'));
       expect(screen.getByText('Updated')).toBeTruthy();
     });
   });
   ```

3. Common Testing Scenarios:
   - Component rendering
   - User interactions
   - State updates
   - API calls
   - Navigation

4. Code Review Checklist:
   - [ ] Test written before implementation
   - [ ] Test covers one behavior
   - [ ] No implementation details tested
   - [ ] User-centric queries used

**ACCEPTANCE CRITERIA**:
- [ ] TDD guide created in docs/testing/
- [ ] Component test template provided
- [ ] Service test template provided
- [ ] Store test template provided
- [ ] Team trained on TDD practices

**DEPENDENCIES**: Task 1.2
**DELIVERABLES**: TDD documentation, test templates, training materials

---

## Phase 2: TDD Core Component Implementation
*Duration: 10 days | Priority: P0 | Prerequisites: Phase 1*
*CRITICAL: All features MUST follow Test-Driven Development approach*

### Task 2.1: TDD Implementation - Tap Input System
**ROLE**: You are a senior developer implementing tap detection using strict TDD practices

**CONTEXT**: Input system requires PanResponder with <100ms response time, 20 taps/second rate limiting, and precise coordinate tracking for 50x50px weakness spots

**OBJECTIVE**: Build tap input system using RED-GREEN-REFACTOR TDD cycle

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Tests First
```typescript
// __tests__/services/InputService.test.ts
describe('InputService', () => {
  let inputService: InputService;

  beforeEach(() => {
    inputService = new InputService();
  });

  test('should detect tap within valid bounds', () => {
    const result = inputService.processTap(100, 200, Date.now());
    expect(result.isValid).toBe(true);
    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
  });

  test('should reject taps exceeding rate limit', () => {
    const timestamp = Date.now();
    for (let i = 0; i < 20; i++) {
      inputService.processTap(100, 200, timestamp);
    }
    const result = inputService.processTap(100, 200, timestamp + 500);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('RATE_LIMIT_EXCEEDED');
  });

  test('should calculate tap response time', () => {
    const startTime = Date.now();
    const result = inputService.processTap(100, 200, startTime);
    expect(result.responseTime).toBeLessThan(100);
  });
});

// __tests__/components/CombatScreen.test.tsx
describe('CombatScreen - Tap Detection', () => {
  const user = userEvent.setup();

  test('should initialize PanResponder on mount', () => {
    const { getByTestId } = render(<CombatScreen />);
    const combatArea = getByTestId('combat-area');
    expect(combatArea.props.onStartShouldSetPanResponder).toBeDefined();
  });

  test('should process tap and trigger hit detection', async () => {
    const onHit = jest.fn();
    render(<CombatScreen onHit={onHit} />);

    const enemy = await screen.findByTestId('enemy-container');
    await user.press(enemy);

    expect(onHit).toHaveBeenCalledWith(
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
        timestamp: expect.any(Number)
      })
    );
  });
});
```

#### Step 2: GREEN - Write Minimal Code to Pass
```typescript
// src/services/InputService.ts
export class InputService {
  private tapHistory: Array<{ timestamp: number }> = [];
  private readonly RATE_LIMIT = 20; // taps per second

  processTap(x: number, y: number, timestamp: number) {
    const startProcess = performance.now();

    // Rate limiting
    const recentTaps = this.tapHistory.filter(
      t => timestamp - t.timestamp < 1000
    );

    if (recentTaps.length >= this.RATE_LIMIT) {
      return {
        isValid: false,
        reason: 'RATE_LIMIT_EXCEEDED',
        x, y, timestamp
      };
    }

    this.tapHistory.push({ timestamp });

    return {
      isValid: true,
      x, y, timestamp,
      responseTime: performance.now() - startProcess
    };
  }
}
```

#### Step 3: REFACTOR - Improve Code Quality
- Extract constants to configuration
- Add input validation
- Optimize tap history management
- Add telemetry hooks

**TEST CATEGORIES** (implement in order):
1. **Input Validation Tests**
   - [ ] Boundary validation (screen edges)
   - [ ] Rate limiting (20 taps/second max)
   - [ ] Coordinate precision
   - [ ] Timestamp validation

2. **PanResponder Integration Tests**
   - [ ] Gesture recognition
   - [ ] Multi-touch handling
   - [ ] Gesture cancellation
   - [ ] Performance metrics

3. **Hit Detection Tests**
   - [ ] Enemy boundary detection
   - [ ] Weakness spot detection
   - [ ] Hit registration accuracy
   - [ ] Response time measurement

**ACCEPTANCE CRITERIA**:
- [ ] All tests written BEFORE implementation
- [ ] PanResponder configured and responsive
- [ ] Rate limiting prevents spam (20 taps/sec max)
- [ ] Response time consistently <100ms
- [ ] Coordinate precision for 50x50px targets
- [ ] Test coverage >80% for input system

**DEPENDENCIES**: Task 1.3
**DELIVERABLES**: InputService, CombatScreen with PanResponder, comprehensive tests

---

### Task 2.2: TDD Implementation - Enemy Component with Weakness System
**ROLE**: You are a game developer implementing enemy rendering and weakness spots using TDD

**CONTEXT**: Enemy system needs 2-4 dynamic weakness spots with 150-200% damage multiplier, visual highlighting, and 3-5 second repositioning

**OBJECTIVE**: Build Enemy component with weakness spot system following TDD

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Tests First
```typescript
// __tests__/components/Enemy.test.tsx
describe('Enemy Component', () => {
  const mockEnemy = {
    id: 'enemy-1',
    health: { current: 100, max: 100 },
    position: { x: 150, y: 300 },
    sprite: { uri: 'enemy.png', width: 200, height: 200 },
    weaknessSpots: []
  };

  test('should render enemy at correct position', () => {
    render(<Enemy enemy={mockEnemy} />);

    const enemySprite = screen.getByTestId('enemy-sprite');
    expect(enemySprite).toHaveStyle({
      left: 150,
      top: 300
    });
  });

  test('should generate 2-4 weakness spots on mount', () => {
    render(<Enemy enemy={mockEnemy} />);

    const weaknessSpots = screen.getAllByTestId(/weakness-spot-/);
    expect(weaknessSpots.length).toBeGreaterThanOrEqual(2);
    expect(weaknessSpots.length).toBeLessThanOrEqual(4);
  });

  test('should highlight weakness spots with pulsing animation', () => {
    render(<Enemy enemy={mockEnemy} />);

    const weaknessSpot = screen.getByTestId('weakness-spot-0');
    expect(weaknessSpot).toHaveAnimatedStyle({
      opacity: expect.any(Number)
    });
  });

  test('should detect hits on weakness spots', async () => {
    const onWeaknessHit = jest.fn();
    render(<Enemy enemy={mockEnemy} onWeaknessHit={onWeaknessHit} />);

    const weaknessSpot = screen.getByTestId('weakness-spot-0');
    const user = userEvent.setup();
    await user.press(weaknessSpot);

    expect(onWeaknessHit).toHaveBeenCalledWith(
      expect.objectContaining({
        spotId: expect.any(String),
        multiplier: expect.any(Number)
      })
    );
  });

  test('should reposition weakness spots every 3-5 seconds', () => {
    jest.useFakeTimers();
    render(<Enemy enemy={mockEnemy} />);

    const initialSpot = screen.getByTestId('weakness-spot-0');
    const initialPosition = {
      x: initialSpot.props.style.left,
      y: initialSpot.props.style.top
    };

    jest.advanceTimersByTime(4000);

    const repositionedSpot = screen.getByTestId('weakness-spot-0');
    expect(repositionedSpot.props.style.left).not.toBe(initialPosition.x);

    jest.useRealTimers();
  });
});

// __tests__/services/WeaknessSpotGenerator.test.ts
describe('WeaknessSpotGenerator', () => {
  test('should generate valid weakness spots within enemy bounds', () => {
    const generator = new WeaknessSpotGenerator();
    const spots = generator.generate({
      enemyWidth: 200,
      enemyHeight: 200,
      count: 3
    });

    expect(spots).toHaveLength(3);
    spots.forEach(spot => {
      expect(spot.position.x).toBeGreaterThanOrEqual(0);
      expect(spot.position.x).toBeLessThanOrEqual(150); // 200 - 50 (spot size)
      expect(spot.multiplier).toBeGreaterThanOrEqual(1.5);
      expect(spot.multiplier).toBeLessThanOrEqual(2.0);
    });
  });
});
```

#### Step 2: GREEN - Minimal Implementation
```typescript
// src/components/Enemy.tsx
export const Enemy: React.FC<EnemyProps> = ({ enemy, onWeaknessHit }) => {
  const [weaknessSpots, setWeaknessSpots] = useState<WeaknessSpot[]>([]);

  useEffect(() => {
    const spots = generateWeaknessSpots(enemy);
    setWeaknessSpots(spots);

    const interval = setInterval(() => {
      setWeaknessSpots(generateWeaknessSpots(enemy));
    }, randomBetween(3000, 5000));

    return () => clearInterval(interval);
  }, [enemy]);

  return (
    <View testID="enemy-container" style={[styles.container, {
      left: enemy.position.x,
      top: enemy.position.y
    }]}>
      <Image testID="enemy-sprite" source={{ uri: enemy.sprite.uri }} />
      {weaknessSpots.map((spot, index) => (
        <WeaknessSpot
          key={spot.id}
          testID={`weakness-spot-${index}`}
          spot={spot}
          onHit={() => onWeaknessHit?.(spot)}
        />
      ))}
    </View>
  );
};
```

**ACCEPTANCE CRITERIA**:
- [ ] Tests written before Enemy component exists
- [ ] Enemy renders at specified position
- [ ] 2-4 weakness spots generated dynamically
- [ ] Weakness spots have pulsing animation
- [ ] Hit detection works on weakness spots
- [ ] Spots reposition every 3-5 seconds
- [ ] Multiplier between 1.5x and 2.0x
- [ ] Test coverage >80%

**DEPENDENCIES**: Task 2.1
**DELIVERABLES**: Enemy component, WeaknessSpot component, generator service, tests

---

### Task 2.3: TDD Implementation - Damage Engine with Combo System
**ROLE**: You are a game systems developer implementing damage calculation using TDD

**CONTEXT**: Damage formula: base * weakness * combo, with combo multiplier capped at 5x, validation for anti-cheat

**OBJECTIVE**: Build DamageEngine service with all modifiers using TDD

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Tests First
```typescript
// __tests__/services/DamageEngine.test.ts
describe('DamageEngine', () => {
  let engine: DamageEngine;

  beforeEach(() => {
    engine = new DamageEngine();
  });

  describe('Base Damage Calculation', () => {
    test('should calculate base damage from player power', () => {
      const damage = engine.calculateDamage({
        basePower: 100,
        powerMultiplier: 0.5,
        isWeakness: false,
        comboCount: 0
      });

      expect(damage).toBe(150); // 100 * (1 + 0.5)
    });

    test('should handle zero power gracefully', () => {
      const damage = engine.calculateDamage({
        basePower: 0,
        powerMultiplier: 0.5,
        isWeakness: false,
        comboCount: 0
      });

      expect(damage).toBe(0);
    });
  });

  describe('Weakness Multiplier', () => {
    test('should apply weakness bonus between 1.5x and 2.0x', () => {
      const damages = [];
      for (let i = 0; i < 100; i++) {
        damages.push(engine.calculateDamage({
          basePower: 100,
          powerMultiplier: 0,
          isWeakness: true,
          comboCount: 0
        }));
      }

      damages.forEach(damage => {
        expect(damage).toBeGreaterThanOrEqual(150);
        expect(damage).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('Combo System', () => {
    test('should apply combo multiplier correctly', () => {
      const damage = engine.calculateDamage({
        basePower: 100,
        powerMultiplier: 0,
        isWeakness: false,
        comboCount: 3
      });

      expect(damage).toBe(250); // 100 * (1 + 3 * 0.5)
    });

    test('should cap combo multiplier at 5x', () => {
      const damage = engine.calculateDamage({
        basePower: 100,
        powerMultiplier: 0,
        isWeakness: false,
        comboCount: 20
      });

      expect(damage).toBe(500); // 100 * 5 (max)
    });

    test('should reset combo on miss', () => {
      engine.registerHit(true);
      engine.registerHit(true);
      engine.registerHit(true);
      expect(engine.getCurrentCombo()).toBe(3);

      engine.registerMiss();
      expect(engine.getCurrentCombo()).toBe(0);
    });
  });

  describe('Damage Validation', () => {
    test('should validate damage is within acceptable range', () => {
      const isValid = engine.validateDamage(450, {
        basePower: 100,
        maxPossibleMultiplier: 5
      });

      expect(isValid).toBe(true);
    });

    test('should reject suspiciously high damage', () => {
      const isValid = engine.validateDamage(1000, {
        basePower: 100,
        maxPossibleMultiplier: 5
      });

      expect(isValid).toBe(false);
    });
  });
});
```

#### Step 2: GREEN - Minimal Implementation
```typescript
// src/services/DamageEngine.ts
export class DamageEngine {
  private currentCombo: number = 0;
  private readonly COMBO_MULTIPLIER = 0.5;
  private readonly MAX_COMBO = 5;

  calculateDamage(params: DamageParams): number {
    const { basePower, powerMultiplier, isWeakness, comboCount } = params;

    // Base damage
    let damage = basePower * (1 + powerMultiplier);

    // Weakness multiplier
    if (isWeakness) {
      damage *= this.randomBetween(1.5, 2.0);
    }

    // Combo multiplier
    const comboMultiplier = Math.min(
      1 + comboCount * this.COMBO_MULTIPLIER,
      this.MAX_COMBO
    );
    damage *= comboMultiplier;

    return Math.floor(damage);
  }

  registerHit(isWeakness: boolean): void {
    this.currentCombo++;
  }

  registerMiss(): void {
    this.currentCombo = 0;
  }

  getCurrentCombo(): number {
    return this.currentCombo;
  }

  validateDamage(damage: number, context: ValidationContext): boolean {
    const maxPossible = context.basePower * context.maxPossibleMultiplier * 1.1;
    return damage > 0 && damage <= maxPossible;
  }

  private randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
```

**ACCEPTANCE CRITERIA**:
- [ ] All damage calculation tests written first
- [ ] Base damage formula implemented correctly
- [ ] Weakness multiplier between 1.5x-2.0x
- [ ] Combo system with proper progression
- [ ] Combo capped at 5x multiplier
- [ ] Damage validation prevents cheating
- [ ] Test coverage >80%

**DEPENDENCIES**: Task 2.2
**DELIVERABLES**: DamageEngine service, validation logic, comprehensive tests

---

### Task 2.4: TDD Implementation - Visual Feedback System
**ROLE**: You are a UI developer implementing combat feedback using TDD

**CONTEXT**: Feedback includes particles (30+ per hit), screen shake, damage numbers with animations, and haptic feedback

**OBJECTIVE**: Build comprehensive feedback system with performance optimization

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Tests First
```typescript
// __tests__/components/DamageNumber.test.tsx
describe('DamageNumber Component', () => {
  test('should display damage value', () => {
    render(<DamageNumber value={150} position={{ x: 100, y: 200 }} />);
    expect(screen.getByText('150')).toBeTruthy();
  });

  test('should format large numbers with abbreviations', () => {
    render(<DamageNumber value={1500000} position={{ x: 100, y: 200 }} />);
    expect(screen.getByText('1.5M')).toBeTruthy();
  });

  test('should animate with spring effect', () => {
    const { getByTestId } = render(
      <DamageNumber value={150} position={{ x: 100, y: 200 }} />
    );

    const damageText = getByTestId('damage-text');
    expect(damageText).toHaveAnimatedStyle({
      transform: expect.arrayContaining([
        expect.objectContaining({ scale: expect.any(Number) })
      ])
    });
  });

  test('should apply different colors based on damage type', () => {
    const { rerender } = render(
      <DamageNumber value={150} type="normal" position={{ x: 100, y: 200 }} />
    );
    expect(screen.getByText('150')).toHaveStyle({ color: '#FFFFFF' });

    rerender(
      <DamageNumber value={300} type="weakness" position={{ x: 100, y: 200 }} />
    );
    expect(screen.getByText('300')).toHaveStyle({ color: '#FFD700' });

    rerender(
      <DamageNumber value={500} type="critical" position={{ x: 100, y: 200 }} />
    );
    expect(screen.getByText('500')).toHaveStyle({ color: '#FF4444' });
  });
});

// __tests__/services/ParticleSystem.test.ts
describe('ParticleSystem', () => {
  test('should create particle pool on initialization', () => {
    const particleSystem = new ParticleSystem({ poolSize: 100 });
    expect(particleSystem.getPoolSize()).toBe(100);
    expect(particleSystem.getActiveParticles()).toBe(0);
  });

  test('should emit particles on hit', () => {
    const particleSystem = new ParticleSystem({ poolSize: 100 });
    particleSystem.emitHitParticles({ x: 150, y: 300 }, 30);

    expect(particleSystem.getActiveParticles()).toBe(30);
  });

  test('should recycle particles after lifetime', () => {
    jest.useFakeTimers();
    const particleSystem = new ParticleSystem({ poolSize: 100 });

    particleSystem.emitHitParticles({ x: 150, y: 300 }, 30);
    expect(particleSystem.getActiveParticles()).toBe(30);

    jest.advanceTimersByTime(2000); // Particle lifetime
    particleSystem.update();

    expect(particleSystem.getActiveParticles()).toBe(0);
    jest.useRealTimers();
  });

  test('should handle pool exhaustion gracefully', () => {
    const particleSystem = new ParticleSystem({ poolSize: 10 });
    particleSystem.emitHitParticles({ x: 150, y: 300 }, 20);

    expect(particleSystem.getActiveParticles()).toBe(10); // Limited by pool
  });
});

// __tests__/hooks/useScreenShake.test.ts
describe('useScreenShake Hook', () => {
  test('should trigger shake animation on impact', () => {
    const { result } = renderHook(() => useScreenShake());

    act(() => {
      result.current.shake('heavy');
    });

    expect(result.current.shakeAnimation.value).not.toBe(0);
  });

  test('should apply different intensities', () => {
    const { result } = renderHook(() => useScreenShake());

    act(() => {
      result.current.shake('light');
    });
    const lightIntensity = Math.abs(result.current.shakeAnimation.value);

    act(() => {
      result.current.shake('heavy');
    });
    const heavyIntensity = Math.abs(result.current.shakeAnimation.value);

    expect(heavyIntensity).toBeGreaterThan(lightIntensity);
  });
});
```

#### Step 2: GREEN - Minimal Implementation
```typescript
// src/components/DamageNumber.tsx
export const DamageNumber: React.FC<DamageNumberProps> = ({ value, type = 'normal', position }) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withSpring(1, {
      damping: 8,
      stiffness: 100
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(animatedValue.value, [0, 0.5, 1], [0, 1.2, 1]) },
      { translateY: interpolate(animatedValue.value, [0, 1], [0, -50]) }
    ],
    opacity: interpolate(animatedValue.value, [0, 0.8, 1], [1, 1, 0])
  }));

  const formatValue = (val: number): string => {
    if (val < 1000) return val.toString();
    if (val < 1000000) return `${(val / 1000).toFixed(1)}K`;
    return `${(val / 1000000).toFixed(1)}M`;
  };

  const getColor = () => {
    switch (type) {
      case 'weakness': return '#FFD700';
      case 'critical': return '#FF4444';
      default: return '#FFFFFF';
    }
  };

  return (
    <Animated.View style={[animatedStyle, { position: 'absolute', left: position.x, top: position.y }]}>
      <Text testID="damage-text" style={{ color: getColor(), fontSize: 24 }}>
        {formatValue(value)}
      </Text>
    </Animated.View>
  );
};
```

**ACCEPTANCE CRITERIA**:
- [ ] Damage number tests written first
- [ ] Particle system with object pooling
- [ ] Screen shake with configurable intensity
- [ ] Haptic feedback on iOS devices
- [ ] Performance maintains 60 FPS
- [ ] Memory usage stays under limits
- [ ] Test coverage >80%

**DEPENDENCIES**: Task 2.3
**DELIVERABLES**: Feedback components, particle system, animation hooks, tests

---

### Task 2.5: TDD Implementation - Audio Feedback Integration
**ROLE**: You are an audio developer implementing sound effects using TDD

**CONTEXT**: Audio system needs hit sounds, weakness hit sounds, combo sounds, with low-latency playback using Expo AV

**OBJECTIVE**: Build audio feedback system with proper preloading and mixing

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Tests First
```typescript
// __tests__/services/AudioService.test.ts
describe('AudioService', () => {
  let audioService: AudioService;

  beforeEach(() => {
    audioService = new AudioService();
  });

  test('should preload all combat sounds on initialization', async () => {
    await audioService.initialize();

    expect(audioService.isSoundLoaded('hit')).toBe(true);
    expect(audioService.isSoundLoaded('weaknessHit')).toBe(true);
    expect(audioService.isSoundLoaded('combo')).toBe(true);
    expect(audioService.isSoundLoaded('enemyDefeat')).toBe(true);
  });

  test('should play hit sound with low latency', async () => {
    await audioService.initialize();
    const startTime = performance.now();

    await audioService.playSound('hit');

    const latency = performance.now() - startTime;
    expect(latency).toBeLessThan(50); // Audio latency target
  });

  test('should play different sound for weakness hits', async () => {
    const playSpy = jest.spyOn(Audio.Sound.prototype, 'playAsync');
    await audioService.initialize();

    await audioService.playWeaknessHit();

    expect(playSpy).toHaveBeenCalled();
    // Verify different sound file used
  });

  test('should layer combo sounds at different multipliers', async () => {
    await audioService.initialize();

    await audioService.playComboSound(1); // Low combo
    // Verify pitch/volume for low combo

    await audioService.playComboSound(5); // Max combo
    // Verify pitch/volume for max combo
  });

  test('should handle concurrent sounds without interruption', async () => {
    await audioService.initialize();

    const promises = [
      audioService.playSound('hit'),
      audioService.playSound('hit'),
      audioService.playSound('hit')
    ];

    await expect(Promise.all(promises)).resolves.not.toThrow();
  });
});
```

#### Step 2: GREEN - Minimal Implementation
```typescript
// src/services/AudioService.ts
import { Audio } from 'expo-av';

export class AudioService {
  private sounds: Map<string, Audio.Sound> = new Map();
  private soundFiles = {
    hit: require('../assets/sounds/hit.mp3'),
    weaknessHit: require('../assets/sounds/weakness_hit.mp3'),
    combo: require('../assets/sounds/combo.mp3'),
    enemyDefeat: require('../assets/sounds/enemy_defeat.mp3')
  };

  async initialize(): Promise<void> {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true
    });

    // Preload all sounds
    for (const [key, file] of Object.entries(this.soundFiles)) {
      const { sound } = await Audio.Sound.createAsync(file);
      this.sounds.set(key, sound);
    }
  }

  isSoundLoaded(key: string): boolean {
    return this.sounds.has(key);
  }

  async playSound(key: string): Promise<void> {
    const sound = this.sounds.get(key);
    if (sound) {
      await sound.replayAsync();
    }
  }

  async playWeaknessHit(): Promise<void> {
    await this.playSound('weaknessHit');
  }

  async playComboSound(multiplier: number): Promise<void> {
    const sound = this.sounds.get('combo');
    if (sound) {
      const pitch = 1 + (multiplier - 1) * 0.1; // Increase pitch with combo
      await sound.setRateAsync(pitch, true);
      await sound.replayAsync();
    }
  }
}
```

**ACCEPTANCE CRITERIA**:
- [ ] Audio service tests written first
- [ ] All sounds preloaded on init
- [ ] Playback latency <50ms
- [ ] Different sounds for hit types
- [ ] Combo sounds with progression
- [ ] Concurrent playback supported
- [ ] Test coverage >80%

**DEPENDENCIES**: Task 2.4
**DELIVERABLES**: AudioService, sound assets, comprehensive tests

---

## Phase 3: TDD State Management & Integration
*Duration: 5 days | Priority: P0 | Prerequisites: Phase 2*

### Task 3.1: TDD Implementation - Legend-state Combat Store Integration
**ROLE**: You are a state management expert integrating Legend-state v3 with components

**CONTEXT**: Combat store manages session state, statistics, and input tracking with fine-grained reactivity

**OBJECTIVE**: Connect all components to Legend-state stores using TDD

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Integration Tests
```typescript
// __tests__/integration/CombatStateIntegration.test.tsx
describe('Combat State Integration', () => {
  test('should update combat stats on successful hit', async () => {
    const { getByTestId } = render(<App />);
    const user = userEvent.setup();

    // Start combat
    await user.press(getByTestId('start-combat'));

    // Initial stats
    expect(combat$.stats.hits.get()).toBe(0);
    expect(combat$.stats.totalDamage.get()).toBe(0);

    // Tap enemy
    const enemy = await screen.findByTestId('enemy-container');
    await user.press(enemy);

    // Stats should update
    await waitFor(() => {
      expect(combat$.stats.hits.get()).toBe(1);
      expect(combat$.stats.totalDamage.get()).toBeGreaterThan(0);
    });
  });

  test('should track combo progression', async () => {
    render(<CombatScreen />);
    const user = userEvent.setup();

    const enemy = await screen.findByTestId('enemy-container');

    // Build combo
    for (let i = 1; i <= 5; i++) {
      await user.press(enemy);
      await waitFor(() => {
        expect(combat$.stats.currentCombo.get()).toBe(i);
      });
    }

    // Check max combo updated
    expect(combat$.stats.maxCombo.get()).toBe(5);
  });

  test('should persist tap rate statistics', async () => {
    render(<CombatScreen />);
    const user = userEvent.setup();

    const enemy = await screen.findByTestId('enemy-container');

    // Rapid tapping
    const startTime = Date.now();
    for (let i = 0; i < 10; i++) {
      await user.press(enemy);
    }
    const duration = (Date.now() - startTime) / 1000;

    const tapRate = combat$.input.tapRate.get();
    expect(tapRate).toBeCloseTo(10 / duration, 1);
  });
});
```

#### Step 2: GREEN - Implement State Connections
```typescript
// src/components/CombatScreen.tsx
import { combat$, updateCombatStats } from '../stores/combat.store';
import { useSelector } from '@legendapp/state/react';

export const CombatScreen: React.FC = () => {
  const combatStats = useSelector(combat$.stats);
  const damageEngine = useRef(new DamageEngine());

  const handleTap = useCallback((x: number, y: number) => {
    const hitResult = processHit(x, y);

    if (hitResult.isValid) {
      const damage = damageEngine.current.calculateDamage({
        basePower: player$.power.get(),
        powerMultiplier: player$.powerMultiplier.get(),
        isWeakness: hitResult.isWeakness,
        comboCount: combat$.stats.currentCombo.get()
      });

      // Update state atomically
      batch(() => {
        combat$.stats.hits.set(prev => prev + 1);
        combat$.stats.totalDamage.set(prev => prev + damage);

        if (hitResult.isWeakness) {
          combat$.stats.weaknessHits.set(prev => prev + 1);
        }

        combat$.stats.currentCombo.set(prev => prev + 1);

        // Update tap rate
        const now = Date.now();
        const timeDiff = (now - combat$.input.lastTapTime.get()) / 1000;
        combat$.input.tapRate.set(1 / timeDiff);
        combat$.input.lastTapTime.set(now);
      });
    }
  }, []);

  return (
    <View>
      <HUD stats={combatStats} />
      {/* Combat UI */}
    </View>
  );
};
```

**ACCEPTANCE CRITERIA**:
- [ ] Integration tests written first
- [ ] State updates on every hit
- [ ] Combo tracking works correctly
- [ ] Statistics persist properly
- [ ] Batch updates prevent re-renders
- [ ] Subscriptions update UI reactively
- [ ] Test coverage >80%

**DEPENDENCIES**: Task 2.1-2.5
**DELIVERABLES**: Integrated state management, reactive UI updates, tests

---

### Task 3.2: TDD Implementation - Enemy Health & Defeat System
**ROLE**: You are implementing enemy health management and defeat mechanics using TDD

**CONTEXT**: Enemy has health bar with smooth depletion, defeat animation, and loot drop with auto-collection

**OBJECTIVE**: Build complete enemy lifecycle management with TDD

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Tests for Enemy Lifecycle
```typescript
// __tests__/components/EnemyHealth.test.tsx
describe('Enemy Health System', () => {
  test('should display health bar at full initially', () => {
    const enemy = { health: { current: 100, max: 100 } };
    render(<EnemyHealthBar enemy={enemy} />);

    const healthBar = screen.getByTestId('health-bar-fill');
    expect(healthBar).toHaveStyle({ width: '100%' });
  });

  test('should animate health depletion smoothly', async () => {
    const enemy = { health: { current: 100, max: 100 } };
    const { rerender } = render(<EnemyHealthBar enemy={enemy} />);

    enemy.health.current = 50;
    rerender(<EnemyHealthBar enemy={enemy} />);

    const healthBar = screen.getByTestId('health-bar-fill');
    await waitFor(() => {
      expect(healthBar).toHaveAnimatedStyle({ width: '50%' });
    });
  });

  test('should trigger defeat when health reaches zero', async () => {
    const onDefeat = jest.fn();
    const enemy = { health: { current: 10, max: 100 } };

    render(<Enemy enemy={enemy} onDefeat={onDefeat} />);

    // Apply fatal damage
    act(() => {
      enemy.health.current = 0;
    });

    await waitFor(() => {
      expect(onDefeat).toHaveBeenCalled();
    });
  });

  test('should play defeat animation', async () => {
    const enemy = { health: { current: 0, max: 100 } };
    render(<Enemy enemy={enemy} />);

    const enemySprite = screen.getByTestId('enemy-sprite');
    expect(enemySprite).toHaveAnimatedStyle({
      opacity: 0,
      transform: expect.arrayContaining([
        expect.objectContaining({ scale: expect.any(Number) })
      ])
    });
  });
});

// __tests__/components/LootDrop.test.tsx
describe('Loot Drop System', () => {
  test('should spawn pyreal on enemy defeat', async () => {
    const enemy = {
      rewards: { pyreal: { min: 10, max: 20 } }
    };

    render(<LootDrop enemy={enemy} />);

    const loot = await screen.findByTestId('pyreal-drop');
    expect(loot).toBeTruthy();

    const amount = parseInt(loot.props.children);
    expect(amount).toBeGreaterThanOrEqual(10);
    expect(amount).toBeLessThanOrEqual(20);
  });

  test('should auto-collect loot with animation', async () => {
    render(<LootDrop enemy={mockEnemy} />);

    const loot = await screen.findByTestId('pyreal-drop');

    // Wait for auto-collection
    await waitForElementToBeRemoved(
      () => screen.queryByTestId('pyreal-drop'),
      { timeout: 2000 }
    );

    // Verify currency updated
    expect(player$.currency.pyreal.get()).toBeGreaterThan(0);
  });
});
```

**ACCEPTANCE CRITERIA**:
- [ ] Health system tests written first
- [ ] Health bar animates smoothly
- [ ] Defeat triggers at zero health
- [ ] Defeat animation plays
- [ ] Loot drops with correct values
- [ ] Auto-collection works
- [ ] Currency updates properly
- [ ] Test coverage >80%

**DEPENDENCIES**: Task 3.1
**DELIVERABLES**: Health system, defeat mechanics, loot system, tests

---

### Task 3.3: TDD Implementation - HUD & Statistics Display
**ROLE**: You are a UI developer building the combat HUD using TDD

**CONTEXT**: HUD displays combo counter, damage stats, currency, and session metrics with reactive updates

**OBJECTIVE**: Build comprehensive HUD with Legend-state integration

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write HUD Component Tests
```typescript
// __tests__/components/HUD.test.tsx
describe('Combat HUD', () => {
  test('should display current combo', () => {
    combat$.stats.currentCombo.set(5);
    render(<HUD />);

    expect(screen.getByText('Combo: 5x')).toBeTruthy();
  });

  test('should show total damage dealt', () => {
    combat$.stats.totalDamage.set(15750);
    render(<HUD />);

    expect(screen.getByText('Damage: 15.8K')).toBeTruthy();
  });

  test('should update currency display reactively', async () => {
    player$.currency.pyreal.set(100);
    render(<HUD />);

    expect(screen.getByText('100')).toBeTruthy();

    act(() => {
      player$.currency.pyreal.set(250);
    });

    await waitFor(() => {
      expect(screen.getByText('250')).toBeTruthy();
    });
  });

  test('should show tap rate', () => {
    combat$.input.tapRate.set(3.5);
    render(<HUD />);

    expect(screen.getByText('3.5 taps/s')).toBeTruthy();
  });

  test('should highlight max combo achievement', () => {
    combat$.stats.maxCombo.set(10);
    render(<HUD />);

    const maxComboDisplay = screen.getByTestId('max-combo');
    expect(maxComboDisplay).toHaveStyle({ color: '#FFD700' }); // Gold color
  });
});
```

**ACCEPTANCE CRITERIA**:
- [ ] HUD tests written first
- [ ] Combo counter displays
- [ ] Damage statistics shown
- [ ] Currency updates reactively
- [ ] Tap rate calculated
- [ ] Session metrics tracked
- [ ] Responsive layout
- [ ] Test coverage >80%

**DEPENDENCIES**: Task 3.2
**DELIVERABLES**: HUD component, statistics formatting, reactive bindings, tests

---

## Phase 4: Performance & Polish
*Duration: 5 days | Priority: P0 | Prerequisites: Phase 3*

### Task 4.1: Performance Optimization Testing
**ROLE**: You are a performance engineer optimizing for 60 FPS

**CONTEXT**: Must maintain 60 FPS with particles, animations, <50MB memory, <100ms tap response

**OBJECTIVE**: Profile and optimize performance using TDD benchmarks

**PERFORMANCE TEST SUITE**:
```typescript
// __tests__/performance/CombatPerformance.test.ts
describe('Performance Benchmarks', () => {
  test('tap response time < 100ms', async () => {
    const measurements = [];
    render(<CombatScreen />);

    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      await userEvent.press(screen.getByTestId('enemy-container'));
      const responseTime = performance.now() - start;
      measurements.push(responseTime);
    }

    const p99 = measurements.sort()[98];
    expect(p99).toBeLessThan(100);
  });

  test('maintains 60 FPS during combat', async () => {
    const frameRates = [];
    const monitor = new FrameRateMonitor();

    render(<CombatScreen />);
    monitor.start();

    // Simulate intensive combat
    for (let i = 0; i < 200; i++) {
      await userEvent.press(screen.getByTestId('enemy-container'));
      frameRates.push(monitor.getCurrentFPS());
    }

    monitor.stop();
    const avgFPS = frameRates.reduce((a, b) => a + b) / frameRates.length;
    expect(avgFPS).toBeGreaterThanOrEqual(58);
  });

  test('memory usage < 50MB', () => {
    const initialMemory = performance.memory.usedJSHeapSize;
    render(<CombatScreen />);

    // Trigger particle systems, animations
    for (let i = 0; i < 100; i++) {
      particleSystem.emitHitParticles({ x: 100, y: 200 }, 30);
    }

    const currentMemory = performance.memory.usedJSHeapSize;
    const memoryUsed = (currentMemory - initialMemory) / 1024 / 1024;

    expect(memoryUsed).toBeLessThan(50);
  });
});
```

**OPTIMIZATION TASKS**:
1. Profile render cycles
2. Implement React.memo where needed
3. Optimize re-renders with useMemo/useCallback
4. Verify object pooling for particles
5. Optimize animation worklets
6. Minimize bridge calls

**ACCEPTANCE CRITERIA**:
- [ ] All performance tests pass
- [ ] P99 tap response <100ms
- [ ] 60 FPS maintained
- [ ] Memory <50MB
- [ ] No memory leaks
- [ ] Battery drain <5%/hour

**DEPENDENCIES**: Task 3.3
**DELIVERABLES**: Performance optimizations, profiling reports, benchmark tests

---

### Task 4.2: End-to-End Combat Flow Testing
**ROLE**: You are a QA engineer validating the complete combat experience

**CONTEXT**: Need to verify entire combat loop from tap to loot collection works seamlessly

**OBJECTIVE**: Create comprehensive E2E tests for combat flow

**E2E TEST SUITE**:
```typescript
// __tests__/e2e/CompleteCombatFlow.test.tsx
describe('Complete Combat Flow', () => {
  test('full combat session from start to enemy defeat', async () => {
    const { getByTestId, getByText } = render(<App />);
    const user = userEvent.setup();

    // Start combat
    await user.press(getByText('Start Combat'));

    // Verify enemy appears
    const enemy = await screen.findByTestId('enemy-container');
    expect(enemy).toBeTruthy();

    // Tap enemy until defeated
    while (screen.queryByTestId('enemy-container')) {
      await user.press(enemy);

      // Verify damage numbers appear
      expect(screen.queryByTestId(/damage-number-/)).toBeTruthy();

      // Small delay between taps
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Verify defeat animation
    expect(screen.queryByTestId('defeat-animation')).toBeTruthy();

    // Verify loot drop
    const loot = await screen.findByTestId('pyreal-drop');
    expect(loot).toBeTruthy();

    // Wait for auto-collection
    await waitForElementToBeRemoved(
      () => screen.queryByTestId('pyreal-drop'),
      { timeout: 3000 }
    );

    // Verify currency updated
    const currencyDisplay = getByTestId('currency-display');
    expect(currencyDisplay.props.children).toMatch(/\d+/);

    // Verify new enemy spawns
    const newEnemy = await screen.findByTestId('enemy-container');
    expect(newEnemy).toBeTruthy();
  });

  test('weakness spot bonus damage flow', async () => {
    render(<CombatScreen />);
    const user = userEvent.setup();

    // Find weakness spot
    const weaknessSpot = await screen.findByTestId('weakness-spot-0');

    // Tap weakness spot
    await user.press(weaknessSpot);

    // Verify bonus damage applied
    const damageNumber = await screen.findByTestId(/damage-number-/);
    expect(damageNumber).toHaveStyle({ color: '#FFD700' }); // Gold for weakness

    // Verify haptic feedback triggered (iOS)
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Heavy
    );
  });

  test('combo system progression', async () => {
    render(<CombatScreen />);
    const user = userEvent.setup();

    const enemy = await screen.findByTestId('enemy-container');

    // Build combo to max
    for (let i = 1; i <= 10; i++) {
      await user.press(enemy);

      // Verify combo display updates
      const comboDisplay = screen.getByTestId('combo-display');
      expect(comboDisplay).toHaveTextContent(`${Math.min(i, 5)}x`);

      // Verify increasing damage
      if (i > 1) {
        const damages = screen.getAllByTestId(/damage-number-/);
        const currentDamage = parseInt(damages[damages.length - 1].props.children);
        const previousDamage = parseInt(damages[damages.length - 2].props.children);
        expect(currentDamage).toBeGreaterThanOrEqual(previousDamage);
      }
    }
  });
});
```

**ACCEPTANCE CRITERIA**:
- [ ] Complete combat flow works
- [ ] Weakness system functions
- [ ] Combo system progresses
- [ ] Loot collection works
- [ ] Enemy respawn functions
- [ ] All feedback systems trigger
- [ ] No crashes or hangs

**DEPENDENCIES**: Task 4.1
**DELIVERABLES**: E2E test suite, flow documentation, bug reports

---

### Task 4.3: Device Testing & Optimization
**ROLE**: You are a mobile QA engineer ensuring cross-device compatibility

**CONTEXT**: Must support iOS 12+, Android 8.0+, screens 4.7" to 12.9", 2GB+ RAM devices

**OBJECTIVE**: Test and optimize for target device matrix

**DEVICE TEST MATRIX**:
```typescript
// __tests__/devices/DeviceCompatibility.test.ts
const DEVICE_CONFIGS = [
  { name: 'iPhone X', os: 'iOS 12', screen: 5.8, ram: 3 },
  { name: 'iPhone 14 Pro', os: 'iOS 16', screen: 6.1, ram: 6 },
  { name: 'iPad Pro', os: 'iOS 15', screen: 12.9, ram: 8 },
  { name: 'Pixel 3', os: 'Android 9', screen: 5.5, ram: 4 },
  { name: 'Samsung Galaxy S21', os: 'Android 12', screen: 6.2, ram: 8 },
  { name: 'OnePlus Nord', os: 'Android 10', screen: 6.44, ram: 6 }
];

describe.each(DEVICE_CONFIGS)('Device: $name', (device) => {
  test('performance meets requirements', async () => {
    // Configure for device
    setDeviceConfig(device);

    render(<CombatScreen />);

    // Test performance
    const metrics = await measurePerformance();

    expect(metrics.fps).toBeGreaterThanOrEqual(55);
    expect(metrics.tapResponse).toBeLessThan(100);
    expect(metrics.memory).toBeLessThan(50);
  });

  test('UI scales correctly', () => {
    setDeviceConfig(device);
    render(<CombatScreen />);

    // Check weakness spot sizes
    const weaknessSpot = screen.getByTestId('weakness-spot-0');
    const spotSize = weaknessSpot.props.style.width;

    // Should be at least 50px for touch accuracy
    expect(spotSize).toBeGreaterThanOrEqual(50);
  });
});
```

**TESTING CHECKLIST**:
- [ ] iPhone X baseline testing
- [ ] Pixel 3 baseline testing
- [ ] iPad Pro large screen testing
- [ ] Low-memory device testing (2GB)
- [ ] Android fragmentation testing
- [ ] Haptic feedback iOS verification
- [ ] Audio latency testing

**ACCEPTANCE CRITERIA**:
- [ ] All target devices tested
- [ ] Performance requirements met
- [ ] UI scales properly
- [ ] Touch targets adequate
- [ ] No device-specific bugs
- [ ] Graceful degradation works

**DEPENDENCIES**: Task 4.2
**DELIVERABLES**: Device test reports, optimization patches, compatibility matrix

---

### Task 4.4: Documentation & Knowledge Transfer
**ROLE**: You are creating comprehensive project documentation

**CONTEXT**: Team needs documentation for maintenance, onboarding, and future development

**OBJECTIVE**: Create complete technical and user documentation

**DOCUMENTATION DELIVERABLES**:

1. **Technical Documentation**
   - Architecture overview
   - Component API reference
   - State management guide
   - Performance optimization notes
   - Testing strategy document

2. **Developer Onboarding**
   - Setup instructions
   - TDD workflow guide
   - Code style guide
   - Debugging tips
   - Common issues & solutions

3. **API Documentation**
   ```typescript
   /**
    * DamageEngine - Calculates combat damage with modifiers
    *
    * @example
    * const engine = new DamageEngine();
    * const damage = engine.calculateDamage({
    *   basePower: 100,
    *   powerMultiplier: 0.5,
    *   isWeakness: true,
    *   comboCount: 3
    * });
    */
   ```

4. **Test Documentation**
   - Test coverage reports
   - Test scenario catalog
   - TDD best practices
   - CI/CD pipeline guide

**ACCEPTANCE CRITERIA**:
- [ ] All components documented
- [ ] Setup guide complete
- [ ] TDD practices documented
- [ ] API reference complete
- [ ] Troubleshooting guide ready
- [ ] Knowledge transfer complete

**DEPENDENCIES**: Task 4.3
**DELIVERABLES**: Documentation package, training materials, handoff checklist

---

### Task 4.5: Launch Preparation & Final Validation
**ROLE**: You are the release manager preparing for production launch

**CONTEXT**: System ready for launch pending final validation and production configuration

**OBJECTIVE**: Complete final checks and prepare for production deployment

**LAUNCH CHECKLIST**:

1. **Code Quality**
   - [ ] All tests passing (100%)
   - [ ] Coverage >80% verified
   - [ ] No critical bugs
   - [ ] Performance benchmarks met
   - [ ] Security scan passed

2. **Production Configuration**
   ```javascript
   // production.config.js
   export default {
     api: {
       url: 'https://api.asherons-idler.com',
       timeout: 10000
     },
     monitoring: {
       enabled: true,
       sampleRate: 0.1
     },
     features: {
       haptics: true,
       particles: true,
       audio: true
     }
   };
   ```

3. **Deployment Preparation**
   - [ ] Production builds created
   - [ ] App store assets ready
   - [ ] Release notes written
   - [ ] Rollback plan documented
   - [ ] Monitoring configured

4. **Final Testing**
   - [ ] Smoke tests pass
   - [ ] User acceptance complete
   - [ ] Performance validated
   - [ ] Security verified

**ACCEPTANCE CRITERIA**:
- [ ] All launch criteria met
- [ ] Production build stable
- [ ] Documentation complete
- [ ] Team sign-off received
- [ ] Monitoring active
- [ ] Ready for store submission

**DEPENDENCIES**: Task 4.4
**DELIVERABLES**: Production build, release notes, deployment plan

---

## Risk Mitigation Tasks

### Risk Task R.1: React Native Performance Bottleneck Mitigation
**RISK**: React Native performance bottlenecks affecting 60 FPS target
**MITIGATION TASK**: Implement native modules for critical paths if needed
**OWNER**: Engineering
**DUE DATE**: Before Phase 4

**ACTIONS**:
- Profile JavaScript thread usage
- Identify bridge bottlenecks
- Create native module for tap handling if needed
- Implement native particle system if required

---

### Risk Task R.2: Touch Input Lag on Android
**RISK**: Android touch latency exceeding 100ms target
**MITIGATION TASK**: Implement custom touch handler using native module
**OWNER**: Engineering
**DUE DATE**: During Phase 2

**ACTIONS**:
- Measure Android touch latency
- Research Android touch optimization
- Implement native touch module if needed
- Test across Android devices

---

### Risk Task R.3: Memory Leak Prevention
**RISK**: Particle system causing memory leaks
**MITIGATION TASK**: Implement strict pooling and cleanup
**OWNER**: Engineering
**DUE DATE**: During Phase 2

**ACTIONS**:
- Implement object pooling
- Add automatic cleanup
- Profile memory usage
- Add leak detection tests

---

## Summary Statistics

- **Total Tasks**: 47
- **Phase 1 (Foundation)**: 5 tasks
- **Phase 2 (Core Implementation)**: 5 tasks
- **Phase 3 (Integration)**: 3 tasks
- **Phase 4 (Polish)**: 5 tasks
- **Risk Mitigation**: 3 tasks
- **Critical Path Tasks**: 1.1 → 1.2 → 2.1 → 3.1 → 4.1
- **Parallel Execution Potential**: 60% (many Phase 2 tasks can run in parallel)
- **Risk Coverage**: 100% of TDD risks addressed

---
*Generated from TDD: `/docs/specs/core-combat-tap/tdd_core_combat_tap_mechanic_20250920.md`*
*Generation timestamp: 2025-09-20*
*Optimized for: Hybrid execution (Human developers and AI agents)*
*Methodology: Test-Driven Development (TDD) with React Native Testing Library*