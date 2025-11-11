# File Organization Patterns and Anti-Patterns

## CRITICAL: No Barrel Exports

### What Are Barrel Exports?
Barrel exports are `index.ts` or `index.js` files that re-export multiple modules from a directory.

### Why We Don't Use Them
1. **Unnecessary abstraction** - Modern IDEs handle direct imports perfectly
2. **Circular dependency risk** - Can create hard-to-debug import cycles
3. **Maintenance overhead** - Extra file to update for every new export
4. **Violates lean principles** - Infrastructure without immediate user value
5. **Performance impact** - Can prevent tree-shaking optimizations

## Test File Organization

### Co-location Rule
Tests MUST be placed next to the files they test, not in separate directories.

### Naming Convention
- Use `.test.tsx` for all test files (components, hooks, utilities)
- Match the name of the file being tested
- Consistent extension simplifies tooling and avoids confusion

### Examples

✅ **CORRECT** (Co-located tests):
```
modules/combat/
├── Enemy.tsx
├── Enemy.test.tsx              # Test next to component
├── useEnemy.ts
├── useEnemy.test.tsx           # Test next to hook
├── damageCalculator.ts
├── damageCalculator.test.tsx   # Test next to utility
└── types.ts                    # Types don't need tests
```

❌ **WRONG** (Separate test directory):
```
modules/combat/
├── Enemy.tsx
├── useEnemy.ts
├── damageCalculator.ts
├── types.ts
└── __tests__/              # DON'T DO THIS
    ├── Enemy.test.tsx
    ├── useEnemy.test.tsx
    └── damageCalculator.test.tsx
```

## Feature Module Organization

### Decision Rule: Item Count
Count all items in a feature (components + hooks + utilities + types).

### Organization Based on Size

#### Small Features (< 10 items): Flat Structure
Keep all files at the feature root level.

```
modules/player-stats/
├── PlayerStats.tsx
├── PlayerStats.test.tsx
├── usePlayerStats.ts
├── usePlayerStats.test.tsx
├── statsCalculator.ts
├── statsCalculator.test.tsx
└── types.ts
```

#### Large Features (≥ 10 items): Organized by Behavior
Group files into subdirectories by their behavior.

```
modules/inventory/
├── components/
│   ├── InventoryGrid.tsx
│   ├── InventoryGrid.test.tsx
│   ├── ItemSlot.tsx
│   ├── ItemSlot.test.tsx
│   ├── ItemTooltip.tsx
│   └── ItemTooltip.test.tsx
├── hooks/
│   ├── useInventory.ts
│   ├── useInventory.test.tsx
│   ├── useItemDrag.ts
│   └── useItemDrag.test.tsx
├── utils/
│   ├── itemSorting.ts
│   └── itemSorting.test.tsx
└── types.ts
```

## State Management File Patterns

### Hooks Over Services
Always prefer hooks for stateful logic instead of service classes.

❌ **WRONG** (Service Class):
```typescript
// enemyService.ts
export class EnemyService {
  private enemies: Enemy[] = [];

  addEnemy(enemy: Enemy) {
    this.enemies.push(enemy);
  }

  getEnemies() {
    return this.enemies;
  }
}
```

✅ **CORRECT** (Custom Hook):
```typescript
// useEnemies.ts
export const useEnemies = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);

  const addEnemy = (enemy: Enemy) => {
    setEnemies(prev => [...prev, enemy]);
  };

  return {
    enemies,
    addEnemy
  };
};
```

### State Management Hierarchy

1. **Component State** (`useState`)
   - For state local to a single component
   - File: `Component.tsx`

2. **Custom Hooks**
   - For reusable stateful logic
   - File: `useFeatureName.ts`

3. **Legend-State Store** (preferred over Zustand)
   - ONLY when state needs cross-feature sharing
   - File: `featureName.store.ts`
   - Must document why global state is needed
   - Use Legend-State, NOT Zustand

## File Naming Conventions

### Components
- PascalCase: `PlayerHealth.tsx`
- Test: `PlayerHealth.test.tsx`

### Hooks
- camelCase with 'use' prefix: `usePlayerHealth.ts`
- Test: `usePlayerHealth.test.tsx`

### Utilities
- camelCase: `damageCalculator.ts`
- Test: `damageCalculator.test.tsx`

### Types
- camelCase or PascalCase: `types.ts` or `CombatTypes.ts`
- No tests needed for type-only files

### Stores (Legend-State)
- camelCase with '.store' suffix: `player.store.ts`
- Test: `player.store.test.tsx`

## Import Organization

### Import Order
1. External libraries
2. Absolute imports from `@/`
3. Relative imports from `./`
4. Type imports

### Example
```typescript
// External libraries
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

// Absolute imports
import { Button } from '@/shared/components/Button';
import { usePlayer } from '@/modules/player/usePlayer';

// Relative imports
import { Enemy } from './Enemy';
import { calculateDamage } from './damageCalculator';

// Type imports
import type { CombatStats } from './types';
```

## Anti-Patterns to Avoid

### ❌ Barrel Exports
Never create `index.ts` files that just re-export

### ❌ Separate Test Directories
Don't create `__tests__` or `tests` directories

### ❌ Service Classes
Don't create classes for state management

### ❌ Deeply Nested Structures
Avoid more than 2 levels of nesting in modules

### ❌ Mixed Organization
Don't mix flat and organized structures in the same feature

### ❌ Premature Organization
Don't create subdirectories until you have ≥ 10 items

## Verification Checklist

Before committing code, verify:
- [ ] No `index.ts` barrel export files created
- [ ] Tests are co-located with implementation files
- [ ] Using hooks instead of service classes
- [ ] Following the < 10 items flat, ≥ 10 items organized rule
- [ ] Imports are direct, not through barrel exports
- [ ] State management follows the hierarchy (useState → hooks → store)