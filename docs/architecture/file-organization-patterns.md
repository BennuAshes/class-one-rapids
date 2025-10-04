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

### Examples

❌ **NEVER DO THIS** (Barrel Export):
```typescript
// src/modules/combat/index.ts
export { Enemy } from './Enemy';
export { useEnemy } from './useEnemy';
export { calculateDamage } from './damageCalculator';
export type { CombatStats } from './types';
```

✅ **ALWAYS DO THIS** (Direct Imports):
```typescript
// Import directly from source files
import { Enemy } from '@/modules/combat/Enemy';
import { useEnemy } from '@/modules/combat/useEnemy';
import { calculateDamage } from '@/modules/combat/damageCalculator';
import type { CombatStats } from '@/modules/combat/types';
```

## Test File Organization

### Co-location Rule
Tests MUST be placed next to the files they test, not in separate directories.

### Naming Convention
- Use `.test.ts` for TypeScript files
- Use `.test.tsx` for React components
- Match the name of the file being tested

### Examples

✅ **CORRECT** (Co-located tests):
```
src/modules/combat/
├── Enemy.tsx
├── Enemy.test.tsx           # Test next to component
├── useEnemy.ts
├── useEnemy.test.ts         # Test next to hook
├── damageCalculator.ts
├── damageCalculator.test.ts # Test next to utility
└── types.ts                 # Types don't need tests
```

❌ **WRONG** (Separate test directory):
```
src/modules/combat/
├── Enemy.tsx
├── useEnemy.ts
├── damageCalculator.ts
├── types.ts
└── __tests__/              # DON'T DO THIS
    ├── Enemy.test.tsx
    ├── useEnemy.test.ts
    └── damageCalculator.test.ts
```

## Feature Module Organization

### Decision Rule: Item Count
Count all items in a feature (components + hooks + utilities + types).

### Organization Based on Size

#### Small Features (< 10 items): Flat Structure
Keep all files at the feature root level.

```
src/modules/player-stats/
├── PlayerStats.tsx
├── PlayerStats.test.tsx
├── usePlayerStats.ts
├── usePlayerStats.test.ts
├── statsCalculator.ts
├── statsCalculator.test.ts
└── types.ts
```

#### Large Features (≥ 10 items): Organized by Type
Group files into subdirectories by their type.

```
src/modules/inventory/
├── components/
│   ├── InventoryGrid.tsx
│   ├── InventoryGrid.test.tsx
│   ├── ItemSlot.tsx
│   ├── ItemSlot.test.tsx
│   ├── ItemTooltip.tsx
│   └── ItemTooltip.test.tsx
├── hooks/
│   ├── useInventory.ts
│   ├── useInventory.test.ts
│   ├── useItemDrag.ts
│   └── useItemDrag.test.ts
├── utils/
│   ├── itemSorting.ts
│   └── itemSorting.test.ts
├── stores/              # Only if state needs cross-feature sharing
│   └── inventory.store.ts
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
- Test: `usePlayerHealth.test.ts`

### Utilities
- camelCase: `damageCalculator.ts`
- Test: `damageCalculator.test.ts`

### Types
- camelCase or PascalCase: `types.ts` or `CombatTypes.ts`
- No tests needed for type-only files

### Stores (Legend-State)
- camelCase with '.store' suffix: `player.store.ts`
- Test: `player.store.test.ts`

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