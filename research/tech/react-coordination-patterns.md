# React-Idiomatic Coordination Patterns for Vertical Slicing
*Created: 2025-08-13*
*Purpose: Document React-native alternatives to EventBus for feature coordination*

## Do not use EventBus

EventBus feels foreign in React applications because:
- React has built-in composition patterns (props, context, hooks)
- EventBus adds a non-React communication channel
- Debugging becomes harder (events are implicit, not visible in React DevTools)
- TypeScript support is weaker with events vs props/context

## React-Idiomatic Coordination Patterns

### 1. Composed Observables (Legend-State Preferred)

**Pattern**: Features expose observable state that can be composed at usage points.

```typescript
// features/player/PlayerService.ts
class PlayerService {
  #state$ = observable({ currency: 1000 });
  
  // Expose as read-only observable
  readonly currency$ = computed(() => this.#state$.currency.get());
  
  spend(amount: number): boolean {
    if (this.#state$.currency.peek() >= amount) {
      this.#state$.currency.set(c => c - amount);
      return true;
    }
    return false;
  }
}

// features/departments/DepartmentService.ts  
class DepartmentService {
  #state$ = observable({ 
    employees: 0,
    hireCost: 10 
  });
  
  readonly hireCost$ = computed(() => 
    this.#state$.hireCost.get()
  );
}

// components/HireButton.tsx - Composition happens here!
function HireButton() {
  const playerCurrency = useObservable(playerService.currency$);
  const hireCost = useObservable(deptService.hireCost$);
  
  // Composed state - reactive and efficient
  const canAfford = playerCurrency >= hireCost;
  
  return (
    <Button 
      disabled={!canAfford}
      onPress={() => {
        if (playerService.spend(hireCost)) {
          deptService.hire();
        }
      }}
    >
      Hire ({hireCost} coins)
    </Button>
  );
}
```

**Benefits**:
- Type-safe with full TypeScript support
- Reactive updates via Legend-State
- Visible data flow in components
- No hidden event subscriptions

### 2. Capability Interfaces Pattern

**Pattern**: Services depend on interfaces, not concrete implementations.

```typescript
// shared/interfaces.ts
interface FundsProvider {
  checkBalance(amount: number): boolean;
  requestFunds(amount: number, purpose: string): Promise<boolean>;
}

interface NotificationService {
  show(message: string, type: 'success' | 'error'): void;
}

// features/player/PlayerService.ts
class PlayerService implements FundsProvider {
  checkBalance(amount: number): boolean {
    return this.#state$.currency.peek() >= amount;
  }
  
  async requestFunds(amount: number, purpose: string): Promise<boolean> {
    if (this.checkBalance(amount)) {
      this.#state$.currency.set(c => c - amount);
      // Log for analytics
      analytics.track('funds.spent', { amount, purpose });
      return true;
    }
    return false;
  }
}

// features/departments/DepartmentService.ts
class DepartmentService {
  constructor(
    private funds: FundsProvider,
    private notify: NotificationService
  ) {}
  
  async hire() {
    const cost = this.getHireCost();
    if (await this.funds.requestFunds(cost, 'hire-employee')) {
      this.#state$.employees.set(e => e + 1);
      this.notify.show('Employee hired!', 'success');
    } else {
      this.notify.show('Insufficient funds', 'error');
    }
  }
}
```

**Benefits**:
- Clear contracts between features
- Easy to test with mock implementations
- Dependencies are explicit
- No global imports needed

### 3. React Context for Cross-Cutting Concerns

**Pattern**: Use Context for legitimate shared services.

```typescript
// Legitimate shared services (not feature state!)
const SharedServicesContext = React.createContext({
  auth: authService,
  persistence: saveLoadService,
  audio: audioService,
  analytics: analyticsService,
});

// Feature services in their own contexts
const PlayerContext = React.createContext(playerService);
const DepartmentContext = React.createContext(departmentService);

// App root composition
function App() {
  return (
    <SharedServicesContext.Provider value={sharedServices}>
      <PlayerContext.Provider value={playerService}>
        <DepartmentContext.Provider value={departmentService}>
          <GameScreen />
        </DepartmentContext.Provider>
      </PlayerContext.Provider>
    </SharedServicesContext.Provider>
  );
}

// Usage in components
function SaveButton() {
  const { persistence } = useContext(SharedServicesContext);
  const player = useContext(PlayerContext);
  
  return (
    <Button onPress={() => persistence.save(player.getState())}>
      Save Game
    </Button>
  );
}
```

**Benefits**:
- Standard React pattern
- Works with React DevTools
- Clear provider hierarchy
- Easy to mock in tests

### 4. Hooks for Shared Logic

**Pattern**: Custom hooks encapsulate cross-feature logic.

```typescript
// hooks/useTransaction.ts
function useTransaction() {
  const player = useContext(PlayerContext);
  const notifications = useContext(NotificationContext);
  
  return useCallback(async (
    amount: number, 
    operation: () => void,
    successMsg: string
  ) => {
    if (player.checkBalance(amount)) {
      player.spend(amount);
      operation();
      notifications.show(successMsg, 'success');
      return true;
    } else {
      notifications.show('Insufficient funds', 'error');
      return false;
    }
  }, [player, notifications]);
}

// Usage in any component
function UpgradeButton({ upgrade }) {
  const executeTransaction = useTransaction();
  
  const handleUpgrade = () => {
    executeTransaction(
      upgrade.cost,
      () => upgrade.apply(),
      `Upgraded ${upgrade.name}!`
    );
  };
  
  return <Button onPress={handleUpgrade}>Upgrade</Button>;
}
```

**Benefits**:
- Reusable transaction logic
- Composition via hooks
- Type-safe and testable
- Follows React patterns

## Legitimate Exceptions for Shared State

Not everything needs to be isolated. These are valid shared services:

### 1. Infrastructure Services
```typescript
// These cut across all features and don't belong to any one feature
- AuthenticationService (user session, login state)
- PersistenceService (save/load game state)
- NetworkService (API communication)
- CacheService (temporary data storage)
```

### 2. Platform Services
```typescript
// Platform-specific integrations
- AudioService (global audio state, music, sound effects)
- HapticsService (vibration feedback)
- NotificationService (in-app and push notifications)
- AnalyticsService (event tracking)
```

### 3. UI Services
```typescript
// UI-wide state that affects all features
- ThemeService (dark/light mode)
- LocalizationService (language settings)
- AccessibilityService (font size, screen reader)
- ModalService (global modals, alerts)
```

### 4. Game-Wide Systems (for games specifically)
```typescript
// Systems that inherently need global coordination
- TimeService (game time, pause state)
- SceneManager (scene transitions)
- InputManager (gesture recognition, input routing)
- PhysicsEngine (if using physics simulation)
```

## Choosing the Right Pattern

### Use Composed Observables When:
- Features need to react to each other's state
- You want reactive UI updates
- Using Legend-State or similar observable library
- State relationships are simple

### Use Capability Interfaces When:
- Features need to invoke operations on each other
- You want clear contracts between features
- Testing isolation is important
- Operations are async or complex

### Use Context When:
- Providing shared infrastructure services
- Services are truly app-wide
- You need React DevTools visibility
- Following standard React patterns

### Use Custom Hooks When:
- Encapsulating cross-feature workflows
- Reusing complex logic across components
- Combining multiple contexts/services
- Creating domain-specific operations

## Anti-Patterns to Avoid

### ❌ Global State Object
```typescript
// DON'T: Everything in one place
const gameState = {
  player: { currency: 1000 },
  departments: { list: [] },
  upgrades: { purchased: [] }
};
```

### ❌ Direct Cross-Feature Imports
```typescript
// DON'T: Features importing each other
import { playerState } from '../player/state';
import { departmentState } from '../departments/state';
```

### ❌ Prop Drilling
```typescript
// DON'T: Passing everything through props
<Game 
  player={player}
  departments={departments}
  upgrades={upgrades}
  onPlayerUpdate={...}
  onDepartmentUpdate={...}
  // ... 20 more props
/>
```

### ❌ Over-Using EventBus
```typescript
// DON'T: Events for everything
eventBus.emit('player.currency.check');
eventBus.emit('player.currency.spend');
eventBus.emit('department.employee.hire');
// Becomes hard to track data flow
```

## Implementation Guidelines

### 1. Start with Composed Observables
Most coordination needs can be met by composing observable state at the point of use.

### 2. Add Capability Interfaces for Operations
When features need to trigger operations in other features, use capability interfaces.

### 3. Use Context for Infrastructure
Shared services that don't belong to any feature go in Context.

### 4. Keep Events for Truly Decoupled Scenarios
Events still have their place for:
- Analytics tracking
- Achievements/progress tracking  
- Sound effect triggers
- Optional side effects

### 5. Document Your Coordination Strategy
Whatever patterns you choose, document them clearly so the team understands the data flow.

## Example: PetSoft Tycoon Coordination

```typescript
// Composed observables for reactive UI
const canHire$ = computed(() => 
  player.currency$.get() >= department.hireCost$.get()
);

// Capability interface for operations
interface FundsProvider {
  requestFunds(amount: number, purpose: string): Promise<boolean>;
}

// Context for infrastructure
const GameServices = React.createContext({
  save: saveLoadService,
  audio: audioService,
  analytics: analyticsService
});

// Hooks for workflows
function usePurchase() {
  // Combines player funds with notification feedback
}

// Limited events for achievements
achievementBus.emit('department.first-hire', { department: 'IT' });
```

## Summary

React applications don't need EventBus for most coordination. The combination of:
- Composed observables (Legend-State)
- Capability interfaces
- React Context
- Custom hooks

...provides more idiomatic, type-safe, and debuggable coordination patterns while still maintaining feature isolation and vertical slicing architecture.

The key insight: **Vertical slicing doesn't mean zero coordination** - it means features own their state and expose controlled interfaces for coordination.