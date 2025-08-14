# Phase 00: Analysis - Requirements Analysis and Architecture Overview

## Objectives

- Complete requirements analysis from PRD
- Design vertical slicing architecture 
- Define feature boundaries and event contracts
- Establish development patterns and conventions
- Create technical foundation blueprints

## Success Criteria

- [ ] Feature map with clear boundaries identified
- [ ] Event schema designed for cross-feature communication
- [ ] Service contracts defined for each major feature
- [ ] Architecture patterns documented with examples
- [ ] Development conventions established

## Time Estimate: 1 Week

---

## Task 1: Requirements Decomposition

### 1.1 Extract Core Game Loop (2 hours)

**Objective**: Map the fundamental game mechanics from PRD

**Steps**:
1. Identify the primary resource flow:
   - Lines of Code → Features → Revenue
   - Employee hiring → Automation
   - Revenue → Upgrades → Efficiency

2. Define the core user actions:
   - Click "WRITE CODE" button
   - Purchase employees/upgrades
   - Navigate between departments
   - Trigger prestige reset

3. Map unlock progression:
   - $500: Sales department
   - $50K: Manager automation
   - $10M: Prestige system
   - Department thresholds for each unlock

**Validation**: Can trace complete gameplay flow from first click to prestige

### 1.2 Feature Boundary Analysis (3 hours)

**Objective**: Define clear boundaries for vertical slicing

**Feature Breakdown**:

```
Core Features (Bounded Contexts):
├── clicking/           # Click mechanics, feedback, multipliers
├── currency/          # Resource management (lines, features, revenue)
├── employees/         # Hiring, cost scaling, production
├── departments/       # Department unlocks, specialization
├── upgrades/          # Purchase system, effects, prerequisites
├── managers/          # Automation system, AI purchasing
├── prestige/          # Reset mechanics, IP bonuses
├── progression/       # Unlock system, thresholds, milestones
├── ui/               # Interface, navigation, feedback
└── persistence/      # Save/load, offline calculation
```

**Dependencies Matrix**:
| Feature | Depends On | Provides To |
|---------|------------|-------------|
| clicking | currency | currency (generates lines) |
| employees | currency | currency (automated production) |
| departments | employees, progression | employees (department-specific types) |
| upgrades | currency, employees | employees (efficiency bonuses) |
| managers | currency, employees | employees (automated purchasing) |
| prestige | progression | ALL (reset + bonuses) |

**Validation**: Each feature can be developed independently with mocked dependencies

---

## Task 2: Event-Driven Architecture Design

### 2.1 Event Schema Definition (3 hours)

**Objective**: Design comprehensive event system for feature coordination

**Event Categories**:

```typescript
// Resource Events
'resources.generated' { type: string, amount: number, source: string }
'resources.consumed' { type: string, amount: number, purpose: string }
'resources.insufficient' { type: string, required: number, available: number }

// Employee Events  
'employee.hired' { department: string, type: string, cost: number }
'employee.production' { department: string, rate: number, deltaTime: number }

// Department Events
'department.unlocked' { department: string, milestone: number }
'department.efficiency' { department: string, multiplier: number }

// Upgrade Events
'upgrade.purchased' { upgradeId: string, cost: number, effects: Effect[] }
'upgrade.effect.applied' { target: string, effect: Effect }

// Progression Events
'milestone.reached' { type: string, value: number, unlocks: string[] }
'prestige.triggered' { valuation: number, ipGain: number }

// UI Events
'ui.click' { element: string, position: Point }
'ui.navigation' { from: string, to: string }
'ui.notification' { message: string, type: string, duration: number }
```

**Event Bus Interface**:
```typescript
interface EventBus {
  emit<T>(event: string, data: T): Promise<void>
  on<T>(event: string, handler: (data: T) => void): () => void
  once<T>(event: string, handler: (data: T) => void): () => void
  off(event: string, handler?: Function): void
}
```

### 2.2 Service Contract Design (4 hours)

**Objective**: Define public APIs for each feature service

**Example Service Contracts**:

```typescript
// Currency Service Contract
interface ICurrencyService {
  // Queries (safe to call anytime)
  getBalance(type: ResourceType): number
  canAfford(cost: Cost): boolean
  
  // Commands (may fail)
  spend(cost: Cost): Result<void, InsufficientFundsError>
  earn(amount: ResourceAmount): Result<void, OverflowError>
  
  // Events (for coordination)
  onBalanceChanged(handler: (balance: ResourceBalance) => void): Unsubscribe
}

// Employee Service Contract  
interface IEmployeeService {
  // Queries
  getCount(department: string, type: string): number
  getCost(department: string, type: string): number
  getProduction(department: string): ProductionRate
  
  // Commands
  hire(department: string, type: string): Result<void, HiringError>
  
  // Events
  onHired(handler: (employee: EmployeeHiredEvent) => void): Unsubscribe
  onProduction(handler: (production: ProductionEvent) => void): Unsubscribe
}
```

**Validation**: Each contract can be implemented independently and mocked for testing

---

## Task 3: Architecture Patterns

### 3.1 Vertical Slice Structure (2 hours)

**Objective**: Establish consistent feature organization

**Standard Feature Structure**:
```
features/[featureName]/
├── [FeatureName]Service.ts     # Core business logic, private state
├── [FeatureName]Events.ts      # Event type definitions
├── components/                 # UI components
│   ├── [Feature]Panel.tsx     # Main UI component
│   ├── [Feature]Controls.tsx  # Interactive elements
│   └── [Feature]Display.tsx   # Information display
├── types/                     # Feature-specific types
│   ├── [Feature]Types.ts      # Domain types
│   └── [Feature]Events.ts     # Event types
├── utils/                     # Feature-specific utilities
│   ├── calculations.ts        # Business logic helpers
│   └── formatters.ts          # Display formatting
└── index.ts                   # Public API export
```

**Service Implementation Pattern**:
```typescript
class FeatureService {
  // Private state - never exposed
  #state$ = observable({
    // All feature state here
  });
  
  // Private methods
  #internalLogic(): void { }
  
  // Public capabilities only
  public performAction(): Result<void, Error> { }
  public getDisplayData(): DisplayData { }
  public subscribe(handler: Handler): Unsubscribe { }
}
```

### 3.2 Legend-State Integration (3 hours)

**Objective**: Establish state management patterns

**Observable State Pattern**:
```typescript
import { observable, computed } from '@legendapp/state'

class CurrencyService {
  // Private observable state
  #state$ = observable({
    linesOfCode: 0,
    basicFeatures: 0,
    advancedFeatures: 0,
    premiumFeatures: 0,
    revenue: 0
  });
  
  // Computed values for UI
  #displayValues$ = computed(() => ({
    linesFormatted: formatNumber(this.#state$.linesOfCode.peek()),
    totalFeatures: this.#state$.basicFeatures.peek() + 
                   this.#state$.advancedFeatures.peek() + 
                   this.#state$.premiumFeatures.peek(),
    revenueFormatted: formatCurrency(this.#state$.revenue.peek())
  }));
  
  // Public capabilities
  public generateLines(amount: number): void {
    this.#state$.linesOfCode.set(current => current + amount);
    eventBus.emit('resources.generated', { 
      type: 'linesOfCode', 
      amount, 
      source: 'click' 
    });
  }
  
  // Public display data (computed)
  public getDisplayData() {
    return this.#displayValues$.peek();
  }
}
```

**Validation**: State updates are reactive and isolated per feature

---

## Task 4: Development Environment Setup

### 4.1 Tool Configuration (2 hours)

**Objective**: Prepare development environment

**Commands**:
```bash
# Verify Node.js version
node --version  # Should be 18+

# Verify Expo CLI
npx expo --version

# Check React Native setup
npx expo doctor

# Install development dependencies
npm install -g @expo/eas-cli  # For building
```

**Development Files Setup**:
```bash
# Create standard config files
touch .env.example
touch .eslintrc.js
touch prettier.config.js
touch tsconfig.json  # Will be updated by Expo
```

**Validation**: All tools installed and working correctly

### 4.2 Architecture Documentation (3 hours)

**Objective**: Create architectural decision records

**Create**:
1. `docs/architecture/ADR-001-vertical-slicing.md`
2. `docs/architecture/ADR-002-event-driven-communication.md`
3. `docs/architecture/ADR-003-legend-state-usage.md`
4. `docs/patterns/service-pattern.md`
5. `docs/patterns/event-pattern.md`

**Content Template**:
```markdown
# ADR-001: Vertical Slicing Architecture

## Status: Accepted

## Context
[Problem statement and requirements]

## Decision
[Chosen solution and rationale]

## Consequences
[Positive and negative outcomes]

## Implementation
[Specific implementation guidelines]
```

**Validation**: Team can reference architecture decisions consistently

---

## Task 5: Development Conventions

### 5.1 Code Standards (1 hour)

**Objective**: Establish consistent coding patterns

**Naming Conventions**:
- Services: `[Feature]Service.ts`
- Components: `[Feature][Purpose].tsx`
- Events: `[domain].[action]` (e.g., `currency.generated`)
- Files: PascalCase for components, camelCase for utilities

**Error Handling Pattern**:
```typescript
// Use Result type for error handling
type Result<T, E> = { success: true; data: T } | { success: false; error: E }

// Service methods return Results
public hire(type: EmployeeType): Result<void, HiringError> {
  if (!this.canAfford(type.cost)) {
    return { success: false, error: new InsufficientFundsError() };
  }
  // Success path
  return { success: true, data: undefined };
}
```

### 5.2 Testing Strategy (2 hours)

**Objective**: Define testing approach for vertical slices

**Test Structure**:
```
__tests__/
├── features/
│   ├── clicking/
│   │   ├── ClickingService.test.ts    # Unit tests
│   │   └── ClickingFlow.test.ts       # Integration tests
│   └── integration/
│       └── GameFlow.test.ts           # Cross-feature tests
```

**Testing Patterns**:
```typescript
// Service unit test example
describe('CurrencyService', () => {
  let service: CurrencyService;
  let mockEventBus: EventBus;
  
  beforeEach(() => {
    mockEventBus = new MockEventBus();
    service = new CurrencyService(mockEventBus);
  });
  
  it('should generate lines of code', () => {
    service.generateLines(10);
    expect(service.getBalance('linesOfCode')).toBe(10);
    expect(mockEventBus.lastEmit).toEqual({
      event: 'resources.generated',
      data: { type: 'linesOfCode', amount: 10, source: 'click' }
    });
  });
});
```

**Validation**: Testing strategy covers both isolation and integration

---

## Deliverables

### Architecture Documents
- [ ] Feature boundary map with dependencies
- [ ] Event schema with all event types defined
- [ ] Service contracts for each major feature
- [ ] Vertical slice structure template
- [ ] Legend-State integration patterns

### Development Setup
- [ ] Development environment verified and configured
- [ ] Code standards and conventions documented
- [ ] Testing strategy and structure defined
- [ ] Architecture Decision Records created

### Next Phase Preparation
- [ ] Foundation phase requirements mapped to architecture
- [ ] Initial project structure planned
- [ ] Key dependencies identified and validated

---

## Validation Checklist

- [ ] Can explain the game flow from click to prestige
- [ ] Each feature has clear boundaries and responsibilities
- [ ] Event system allows features to work independently
- [ ] Service contracts enable parallel development
- [ ] Architecture supports the full PRD requirements
- [ ] Development environment is production-ready
- [ ] Team can start implementation immediately

---

**Next Phase**: Proceed to [01-foundation.md](./01-foundation.md) for project setup and core infrastructure implementation.