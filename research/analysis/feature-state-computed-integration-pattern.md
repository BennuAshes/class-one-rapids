# Feature State with Computed Integration Pattern

## Pattern Overview

A state management architecture that combines feature-local observable state with a centralized computed integration layer, enabling both isolation and interconnection of game systems.

## Architecture Structure

```typescript
src/
├── features/
│   ├── development/
│   │   ├── DevelopmentScreen.tsx
│   │   ├── WriteCodeButton.tsx
│   │   └── state.ts  // Local development state
│   └── sales/
│       ├── SalesScreen.tsx
│       ├── LeadGenerator.tsx
│       └── state.ts  // Local sales state
└── game-state/
    ├── resources/
    │   ├── money.ts      // Money calculations across all features
    │   ├── code.ts       // Code production computations
    │   └── features.ts   // Feature conversion logic
    ├── departments/
    │   ├── synergies.ts  // Cross-department bonuses
    │   └── totals.ts     // Aggregate calculations
    ├── progression/
    │   ├── milestones.ts // Milestone detection
    │   ├── unlocks.ts    // What's available to unlock
    │   └── prestige.ts   // Prestige calculations
    └── index.ts          // Root game state composition
```

## Core Principles

### 1. Feature Isolation
Each feature owns its local state completely:
```typescript
// features/development/state.ts
export const developmentState$ = observable({
  units: {
    juniorDevs: 0,
    seniorDevs: 0,
  },
  upgrades: {
    betterIDE: false,
    pairProgramming: false,
  }
})
```

### 2. Computed Integration
Cross-feature dependencies are handled through computed observables:
```typescript
// game-state/resources/code.ts
import { developmentState$ } from '@/features/development/state'
import { developmentBonus$ } from '../departments/synergies'

export const codePerSecond$ = computed(() => {
  const juniors = developmentState$.units.juniorDevs.get()
  const seniors = developmentState$.units.seniorDevs.get()
  const bonus = developmentBonus$.get()
  
  const baseProduction = (juniors * 0.1) + (seniors * 2.5)
  return baseProduction * bonus
})
```

### 3. Explicit Dependencies
Data flow is traceable through imports and computed chains:
```typescript
// Clear dependency graph
revenuePerSecond$ 
  ← totalCodeProduction$ 
    ← developmentState$.units
    ← developmentState$.productivity
  ← salesState$.conversionRate
```

## Benefits

### 1. Testability
Each piece is small and focused:
```typescript
// Test development in isolation
test('development production', () => {
  const state$ = observable({ units: { juniorDevs: 10 }, productivity: 2 })
  const production$ = computeDevelopmentProduction(state$)
  expect(production$.get()).toBe(2.0)
})

// Test integration separately
test('revenue calculation', () => {
  const mockProd$ = observable(10)
  const mockRate$ = observable(0.1)
  const revenue$ = computeRevenue(mockProd$, mockRate$)
  expect(revenue$.get()).toBe(10)
})
```

### 2. Refactoring Safety
- Change feature internals without breaking computations
- Change computation logic without touching features
- The interface (computed observable) remains stable

### 3. Performance Optimization
- Legend-state only recalculates when dependencies change
- No unnecessary React re-renders
- Computed observables cache results automatically

### 4. Clear Mental Model
- **Features**: Own their UI and local state
- **Game-State**: Owns cross-cutting business logic
- **Clean boundary**: Features don't directly reference each other

## Organization Strategies

### Strategy 1: By Resource Type
```typescript
game-state/
├── resources/     // Things you collect
├── producers/     // Things that generate
├── multipliers/   // Things that modify
└── validators/    // Things that check conditions
```

### Strategy 2: By Game System
```typescript
game-state/
├── economy/       // Money flow
├── production/    // Resource generation  
├── progression/   // Unlocks and advancement
└── meta/         // Prestige, achievements
```

### Strategy 3: By Computation Type
```typescript
game-state/
├── aggregations/  // Sums, totals, counts
├── rates/        // Per-second calculations
├── conversions/  // Resource transformations
└── conditions/   // Unlock checks, milestones
```

## Implementation Example

### Feature State
```typescript
// features/development/state.ts
export const developmentState$ = observable({
  units: {
    juniorDevs: 0,
    seniorDevs: 0,
  },
  upgrades: {
    betterIDE: false,
    pairProgramming: false,
  }
})

// features/sales/state.ts  
export const salesState$ = observable({
  units: {
    salesReps: 0,
    accountManagers: 0,
  },
  conversionRate: 0.1
})
```

### Computed Integration
```typescript
// game-state/resources/code.ts
export const codePerSecond$ = computed(() => {
  const juniors = developmentState$.units.juniorDevs.get()
  const seniors = developmentState$.units.seniorDevs.get()
  const bonus = developmentBonus$.get()
  
  const baseProduction = (juniors * 0.1) + (seniors * 2.5)
  return baseProduction * bonus
})

// game-state/resources/money.ts
export const moneyPerSecond$ = computed(() => {
  const code = codePerSecond$.get()
  const conversion = salesState$.conversionRate.get()
  const featureValue = 10 // $10 per feature
  
  return (code / 10) * conversion * featureValue
})
```

### Cross-Department Synergies
```typescript
// game-state/departments/synergies.ts
export const developmentBonus$ = computed(() => {
  const devCount = developmentState$.units.total.get()
  const qaCount = qaState$.units.total.get()
  
  // QA improves development efficiency
  if (qaCount >= 10 && devCount >= 25) {
    return 2.0 // 100% bonus
  }
  return 1.0
})
```

## Persistence Strategy

Distributed state with centralized persistence:
```typescript
// game-state/persistence.ts
export function saveGameState() {
  // Collect all feature states
  const fullState = {
    development: developmentState$.get(),
    sales: salesState$.get(),
    // ... all features
    timestamp: Date.now()
  }
  
  // Single persistence point
  return syncObservable(observable(fullState), {
    persist: { name: 'game-save', plugin: ObservablePersistMMKV }
  })
}
```

## Evolution Path

### Early Stage
```typescript
// game-state/index.ts (early)
export { moneyPerSecond$ } from './money'
export { codeProduction$ } from './code'
```

### Growth Stage
```typescript
// game-state/index.ts (later)
export * from './resources'
export * from './departments'
export * from './progression'
export * from './achievements'
export * from './analytics'
```

## Comparison to Other Patterns

### vs. Centralized State
- ✅ Better: Feature isolation and testability
- ✅ Better: Smaller, focused pieces of state
- ❌ Worse: More complex initial setup
- ❌ Worse: Need to manage multiple observable roots

### vs. Pure Vertical Slicing
- ✅ Better: Explicit integration layer for cross-cutting concerns
- ✅ Better: Clear place for game-wide calculations
- ❌ Worse: Additional abstraction layer
- ❌ Worse: Features aren't fully self-contained

### vs. Traditional Redux
- ✅ Better: Fine-grained reactivity (only re-render what changes)
- ✅ Better: Less boilerplate
- ❌ Worse: Less tooling support
- ❌ Worse: Pattern less familiar to developers

## Key Insights

1. **Computed observables act as the API between features**, creating loose coupling with strong contracts

2. **Separation AND Integration** - Features are isolated but connected through computed observables

3. **Dependencies are explicit** through imports, making the data flow traceable

4. **Performance is optimized** through Legend-state's fine-grained reactivity

5. **Testing boundaries are natural** - test features in isolation, computations separately, integration through computed observables

## Recommendations

### When to Use This Pattern
- Complex idle/incremental games with many interdependent systems
- Games where everything affects everything else
- Projects requiring high testability and maintainability
- Teams comfortable with reactive programming concepts

### When to Avoid
- Simple games with minimal state
- Projects with developers unfamiliar with observables
- Games with mostly independent features
- Prototypes where rapid iteration is more important than architecture

## Conclusion

The Feature State with Computed Integration pattern provides an elegant solution for managing complex game state by combining the benefits of feature isolation with the necessity of cross-feature integration. By using computed observables as the integration layer, we achieve loose coupling, explicit dependencies, optimal performance, and excellent testability.

This pattern is particularly well-suited for idle/incremental games like PetSoft Tycoon where multiple systems (departments, resources, progression) need to interact while maintaining clear boundaries and responsibilities.