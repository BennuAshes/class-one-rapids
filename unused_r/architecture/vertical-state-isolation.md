# Vertical State Isolation: Feature-Based State Architecture

## Executive Summary

Vertical state isolation extends vertical slicing principles to state management, ensuring each feature owns its state completely. This eliminates global state anti-patterns, enables true feature independence, and allows teams to work autonomously without coordination overhead.

## Key Principles

### 1. State Ownership
- **Each feature owns its state completely** - No shared mutable state
- **State is private by default** - Only expose read-only projections
- **Features expose capabilities, not data** - Methods over properties

### 2. Communication Patterns
- **Event-driven coordination** - Features communicate through events
- **Computed projections** - Cross-cutting views derived from multiple features
- **Saga orchestration** - Complex workflows coordinate multiple features

### 3. Anti-Patterns to Avoid
- **Global state objects** - Single state tree shared across features
- **Direct cross-feature imports** - Features importing other features' state
- **Shared mutable state** - Multiple features modifying same state

## Implementation Patterns

### Feature Service Pattern
```typescript
// ✅ CORRECT: Feature encapsulates its state
// features/player/service.ts
class PlayerService {
  #state$ = observable({
    currency: 1000,
    linesOfCode: 0
  });
  
  // Expose capabilities, not state
  canAfford(amount: number): boolean {
    return this.#state$.currency.peek() >= amount;
  }
  
  spend(amount: number): Result<void, InsufficientFundsError> {
    if (!this.canAfford(amount)) {
      return Result.err(new InsufficientFundsError());
    }
    this.#state$.currency.set(c => c - amount);
    return Result.ok();
  }
  
  // Read-only observable for UI
  readonly currency$ = computed(() => this.#state$.currency.get());
}

// ❌ WRONG: Global state anti-pattern
const gameState$ = observable({
  player: { currency: 1000 },
  departments: { ... }
});
```

### Event Bus Pattern
```typescript
// core/events/bus.ts
class EventBus {
  emit<T>(event: string, payload: T): void;
  on<T>(event: string, handler: (payload: T) => void): Unsubscribe;
}

// features/departments/service.ts
class DepartmentService {
  constructor(private events: EventBus) {}
  
  hireDeveloper(type: string) {
    const cost = this.calculateCost(type);
    
    // Request funds through event
    this.events.emit('funds.requested', { 
      amount: cost,
      purpose: 'hire-developer',
      requestId: uuid()
    });
  }
}

// features/player/service.ts
class PlayerService {
  constructor(private events: EventBus) {
    events.on('funds.requested', this.handleFundsRequest);
  }
  
  handleFundsRequest = (request: FundsRequest) => {
    if (this.canAfford(request.amount)) {
      this.spend(request.amount);
      this.events.emit('funds.approved', request);
    } else {
      this.events.emit('funds.denied', request);
    }
  }
}
```

### Computed Projections Pattern
```typescript
// features/analytics/projections.ts
class GameAnalytics {
  constructor(
    private player: PlayerService,
    private departments: DepartmentService
  ) {}
  
  // Computed view across features
  readonly totalValuation$ = computed(() => {
    const playerValue = this.player.currency$.get() * 10;
    const departmentValue = this.departments.employeeCount$.get() * 1000;
    return playerValue + departmentValue;
  });
}
```

## Directory Structure

```
features/
├── player/
│   ├── service.ts        # Core service with private state
│   ├── events.ts         # Event definitions
│   ├── components/       # UI components
│   └── index.ts          # Public API (service only)
├── departments/
│   ├── service.ts
│   ├── events.ts
│   ├── components/
│   └── index.ts
└── orchestration/
    ├── hire-saga.ts      # Cross-feature workflow
    └── prestige-saga.ts
```

## Testing Benefits

```typescript
// Complete isolation - no global state setup
describe('PlayerService', () => {
  it('should handle spending', () => {
    const service = new PlayerService();
    
    const result = service.spend(100);
    expect(result.isOk()).toBe(true);
    expect(service.currency$.get()).toBe(900);
  });
});

// No mocking required for unit tests
describe('DepartmentService', () => {
  it('should calculate productivity', () => {
    const service = new DepartmentService();
    service.addEmployee('junior');
    
    expect(service.productivity$.get()).toBe(1.5);
  });
});
```

## Migration Path from Global State

### Step 1: Identify Bounded Contexts
```typescript
// Analyze current global state
gameState$ = {
  player: {...},      // → PlayerService
  departments: {...}, // → DepartmentService  
  achievements: {...} // → AchievementService
}
```

### Step 2: Extract Services
```typescript
// Before
gameState$.player.currency -= 100;

// After
playerService.spend(100);
```

### Step 3: Replace Direct Access with Events
```typescript
// Before
if (gameState$.player.currency >= cost) {
  gameState$.player.currency -= cost;
  gameState$.departments.employees.junior++;
}

// After
eventBus.emit('hire.requested', { type: 'junior', cost });
// Services handle through event subscriptions
```

## Performance Advantages

1. **Fine-grained reactivity** - Only affected features re-render
2. **No unnecessary updates** - Features don't trigger cross-feature renders
3. **Memory efficiency** - Features can be lazy-loaded
4. **Parallel development** - No state contention between teams

## Legend State v3 Integration

```typescript
// Each feature gets its own observable root
const playerState$ = observable({...});
const deptState$ = observable({...});

// NOT one global observable
// ❌ const gameState$ = observable({...});

// Batch updates within feature
batch(() => {
  playerState$.currency.set(c => c - 100);
  playerState$.lastAction.set(Date.now());
});

// Computed across features via service layer
const totalValue$ = computed(() => 
  playerService.valuation$.get() + 
  deptService.valuation$.get()
);
```

## Critical Success Factors

1. **No shared mutable state** - Ever.
2. **Events for coordination** - Not direct method calls
3. **Services own their domain** - Complete encapsulation
4. **UI binds to projections** - Not internal state
5. **Test in isolation** - No global setup required

## Common Pitfalls

### Pitfall 1: Exposing Internal State
```typescript
// ❌ WRONG
class PlayerService {
  state$ = observable({...}); // Public state
}

// ✅ RIGHT  
class PlayerService {
  #state$ = observable({...}); // Private state
  readonly currency$ = computed(() => this.#state$.currency.get());
}
```

### Pitfall 2: Direct Cross-Feature Dependencies
```typescript
// ❌ WRONG
class DepartmentService {
  constructor(private player: PlayerService) {
    // Direct dependency
  }
}

// ✅ RIGHT
class DepartmentService {
  constructor(private events: EventBus) {
    // Event-based coordination
  }
}
```

### Pitfall 3: Synchronous Coupling
```typescript
// ❌ WRONG
hireDeveloper() {
  if (playerService.canAfford(cost)) {
    playerService.spend(cost);
    this.addEmployee();
  }
}

// ✅ RIGHT
async hireDeveloper() {
  const result = await this.requestFunds(cost);
  if (result.approved) {
    this.addEmployee();
  }
}
```

## Validation Rules

```typescript
// Architecture test
test('no global state', () => {
  const files = glob('**/*.ts');
  const globalStatePattern = /export const \w+State\$ = observable\({[\s\S]*player[\s\S]*departments/;
  
  files.forEach(file => {
    const content = readFile(file);
    expect(content).not.toMatch(globalStatePattern);
  });
});

test('features are isolated', () => {
  const imports = analyzeImports();
  const crossFeatureImports = imports.filter(i => 
    i.from.includes('/features/') && 
    i.to.includes('/features/') &&
    !i.to.includes('/events')
  );
  
  expect(crossFeatureImports).toEqual([]);
});
```

## Conclusion

Vertical state isolation is not optional for true vertical slicing - it's essential. Without it, features remain coupled, teams remain dependent, and the architecture degrades into a distributed monolith. With it, teams achieve true autonomy, features scale independently, and the architecture maintains its integrity over time.