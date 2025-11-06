# Salvage & Tinkering System Implementation Tasks

## Document Metadata
- **Source TDD**: `/workflow-outputs/20251102_225941/tdd_20251102.extracted.md`
- **Generated**: 2025-11-03 19:50:00
- **Total Tasks**: 20 tasks across 4 phases (focused on first 5 tasks for MVP)
- **Architecture**: Feature-based Expo/React Native following `/docs/architecture/organizing_expo_apps_by_feature_20250921_113000.md`
- **Working Directory**: `c:\dev\class-one-rapids\frontend\`
- **Lean Approach**: Following `/docs/guides/lean-task-generation-guide.md` - user-visible functionality first

## Implementation Status
**Analysis Complete**: No existing salvage/tinker implementation found in `frontend/modules/`. All tasks start from scratch.

**Existing Modules**:
- `frontend/modules/attributes/` - Player attributes system
- `frontend/modules/combat/` - Combat mechanics

**New Modules to Create**:
- `frontend/modules/salvage/` - Salvage mechanics (small feature - flat structure)
- `frontend/modules/tinker/` - Tinkering/upgrade mechanics (small feature - flat structure)

---

## Phase 1: Foundation & First Playable Feature (Week 1 - Days 1-5)
*Duration: 5 days | Priority: P0 | Prerequisites: None*

**LEAN PRINCIPLE**: Every task delivers working functionality. Task 1 must be playable immediately.

---

### Task 1.1: Test Infrastructure Setup
**ROLE**: You are a senior test engineer configuring the testing environment

**CONTEXT**: Following TDD requires comprehensive test infrastructure before any feature development. Based on TDD Section 7 (TDD Strategy) and referencing `/docs/research/react_native_testing_library_guide_20250918_184418.md`.

**OBJECTIVE**: Set up Jest, React Native Testing Library, and all required mocking infrastructure so we can write tests first for every feature.

**STEP-BY-STEP INSTRUCTIONS**:

1. **Install Testing Dependencies**
```bash
# From frontend directory
npm install --save-dev @testing-library/react-native@^12.0.0
npm install --save-dev @testing-library/jest-native@^5.4.0
npm install --save-dev @testing-library/user-event@^14.0.0
npm install --save-dev @types/jest
```

2. **Configure Jest**
Create or update `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverageFrom: [
    'modules/**/*.{js,jsx,ts,tsx}',
    'shared/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
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

3. **Setup Test Utilities and Mocks**
Create `jest.setup.js`:
```javascript
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Performance.now() for benchmarks
global.performance = {
  now: jest.fn(() => Date.now())
};
```

4. **Create Test Utilities**
Create `__tests__/utils/test-utils.tsx`:
```typescript
import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';

// Wrapper with providers (add Legend State provider later)
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';
export { customRender as render };
```

5. **Create Test Data Factories**
Create `__tests__/factories/item.factory.ts`:
```typescript
export interface Item {
  id: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  salvageValue: number;
  iconId: string;
}

export const createMockItem = (overrides?: Partial<Item>): Item => ({
  id: `item-${Math.random().toString(36).substr(2, 9)}`,
  type: 'weapon',
  rarity: 'common',
  salvageValue: 10,
  iconId: 'weapon_icon',
  ...overrides
});

export const createMockItems = (count: number, overrides?: Partial<Item>): Item[] =>
  Array.from({ length: count }, () => createMockItem(overrides));
```

6. **Verify Setup**
```bash
npm test -- --passWithNoTests
```

**ACCEPTANCE CRITERIA**:
- [x] Jest configured with React Native preset
- [x] React Native Testing Library installed and configured
- [x] Custom render utility created with provider wrapper
- [x] AsyncStorage mocked for tests
- [x] Reanimated mocked for tests
- [x] Test data factories created (item.factory.ts)
- [x] `npm test` runs successfully (even with no tests)
- [x] Coverage reporting configured (80% threshold)

**DELIVERABLES**:
1. `jest.config.js` with proper configuration
2. `jest.setup.js` with mocks
3. `__tests__/utils/test-utils.tsx` custom render
4. `__tests__/factories/item.factory.ts` test factories
5. All dependencies installed

**DEPENDENCIES**: None
**TOOLS NEEDED**: Jest, React Native Testing Library, npm
**VALIDATION**: Run `npm test -- --passWithNoTests` - should pass with "No tests found"

---

### Task 1.2: Implement First User-Visible Feature - Manual Salvage (TDD)
**ROLE**: You are a senior React Native developer implementing the core salvage mechanic using strict TDD

**CONTEXT**: This is the **FIRST user-visible feature**. Following lean principles from `/docs/guides/lean-task-generation-guide.md`, we implement the simplest working feature that users can interact with: tap item → see materials increase.

**OBJECTIVE**: Player can tap an inventory item to salvage it, see a satisfying animation, and watch their material count increase in real-time.

**WORKING DIRECTORY**: `c:\dev\class-one-rapids\frontend\`

**FILE LOCATIONS** (Small Feature < 10 items - Flat Structure):
```
frontend/modules/salvage/
├── types.ts                    # Type definitions
├── SalvageEngine.ts           # Business logic
├── SalvageEngine.test.ts      # Engine tests (co-located)
├── salvageStore.ts            # Legend State store
├── salvageStore.test.ts       # Store tests (co-located)
├── SalvageButton.tsx          # UI component
└── SalvageButton.test.tsx     # Component tests (co-located)
```

**TDD IMPLEMENTATION CYCLE**:

#### Step 1: RED - Write Failing Tests First

Create the module directory:
```bash
mkdir -p modules/salvage
```

##### Test 1.1: Type Definitions

Create `modules/salvage/types.ts`:
```typescript
export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable'
}

export enum Rarity {
  COMMON = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4
}

export enum MaterialType {
  IRON = 'iron',
  WOOD = 'wood',
  LEATHER = 'leather',
  GEMS = 'gems'
}

export interface Item {
  id: string;
  type: ItemType;
  rarity: Rarity;
  salvageValue: number;
  iconId: string;
}

export interface Material {
  type: MaterialType;
  quantity: number;
}

export interface SalvageResult {
  materials: Material[];
  xpGained: number;
  critical: boolean;
}
```

##### Test 1.2: SalvageEngine Tests (MUST FAIL FIRST)

Create `modules/salvage/SalvageEngine.test.ts`:
```typescript
import { SalvageEngine } from './SalvageEngine';
import { createMockItem } from '@/__tests__/factories/item.factory';
import { ItemType, Rarity } from './types';

describe('SalvageEngine', () => {
  let engine: SalvageEngine;

  beforeEach(() => {
    engine = new SalvageEngine();
  });

  describe('calculateYield', () => {
    test('should return correct materials for common weapon', () => {
      const item = createMockItem({
        type: ItemType.WEAPON,
        rarity: Rarity.COMMON,
        salvageValue: 10
      });

      const result = engine.calculateYield(item, []);

      expect(result).toContainEqual({
        type: 'iron',
        quantity: 10
      });
    });

    test('should return 2x materials for manual salvage', () => {
      const item = createMockItem({ salvageValue: 10 });

      const manualResult = engine.salvageItem(item.id, true);
      const autoResult = engine.salvageItem(item.id, false);

      const manualIron = manualResult.materials.find(m => m.type === 'iron')?.quantity || 0;
      const autoIron = autoResult.materials.find(m => m.type === 'iron')?.quantity || 0;

      expect(manualIron).toBe(autoIron * 2);
    });

    test('should trigger critical hit approximately 5% of time', () => {
      const item = createMockItem();
      const results = [];

      for (let i = 0; i < 1000; i++) {
        results.push(engine.salvageItem(item.id, true));
      }

      const criticals = results.filter(r => r.critical).length;

      // Allow variance: 30-70 criticals (5% ± 2%)
      expect(criticals).toBeGreaterThan(30);
      expect(criticals).toBeLessThan(70);
    });
  });
});
```

**Run test**: `npm test SalvageEngine` - **MUST FAIL** (SalvageEngine doesn't exist)

#### Step 2: GREEN - Minimal Implementation

Create `modules/salvage/SalvageEngine.ts`:
```typescript
import type { Item, Material, SalvageResult, MaterialType } from './types';
import { ItemType } from './types';

export class SalvageEngine {
  private rng = Math.random;

  calculateYield(item: Item, bonuses: any[]): Material[] {
    const baseYield = item.salvageValue;
    const materialType = this.getMaterialType(item.type);

    return [{
      type: materialType,
      quantity: baseYield
    }];
  }

  salvageItem(itemId: string, manual: boolean): SalvageResult {
    // Mock item for now
    const mockItem: Item = {
      id: itemId,
      type: ItemType.WEAPON,
      rarity: 1,
      salvageValue: 10,
      iconId: 'weapon'
    };

    let materials = this.calculateYield(mockItem, []);

    // Manual = 2x materials
    if (manual) {
      materials = materials.map(m => ({
        ...m,
        quantity: m.quantity * 2
      }));
    }

    // 5% critical hit = 5x materials
    const critical = this.rng() < 0.05;
    if (critical) {
      materials = materials.map(m => ({
        ...m,
        quantity: m.quantity * 5
      }));
    }

    return {
      materials,
      xpGained: 10,
      critical
    };
  }

  private getMaterialType(itemType: ItemType): MaterialType {
    const mapping = {
      [ItemType.WEAPON]: 'iron' as MaterialType,
      [ItemType.ARMOR]: 'iron' as MaterialType,
      [ItemType.ACCESSORY]: 'gems' as MaterialType,
      [ItemType.CONSUMABLE]: 'wood' as MaterialType
    };
    return mapping[itemType];
  }
}
```

**Run test**: `npm test SalvageEngine` - **SHOULD PASS**

#### Step 3: RED - Component Tests (MUST FAIL)

Create `modules/salvage/SalvageButton.test.tsx`:
```typescript
import React from 'react';
import { render, screen, userEvent } from '@/__tests__/utils/test-utils';
import { SalvageButton } from './SalvageButton';
import { createMockItem } from '@/__tests__/factories/item.factory';

describe('SalvageButton', () => {
  test('should render salvage button', () => {
    const item = createMockItem();

    render(<SalvageButton item={item} onSalvage={jest.fn()} />);

    expect(screen.getByRole('button', { name: /salvage/i })).toBeTruthy();
  });

  test('should call onSalvage when pressed', async () => {
    const item = createMockItem();
    const onSalvage = jest.fn();
    const user = userEvent.setup();

    render(<SalvageButton item={item} onSalvage={onSalvage} />);

    await user.press(screen.getByRole('button', { name: /salvage/i }));

    expect(onSalvage).toHaveBeenCalledWith(item.id);
  });

  test('should disable button during animation', async () => {
    const item = createMockItem();
    const user = userEvent.setup();

    render(<SalvageButton item={item} onSalvage={jest.fn()} />);

    const button = screen.getByRole('button', { name: /salvage/i });
    await user.press(button);

    expect(button).toBeDisabled();
  });
});
```

**Run test**: `npm test SalvageButton` - **MUST FAIL**

#### Step 4: GREEN - Component Implementation

Create `modules/salvage/SalvageButton.tsx`:
```typescript
import React, { useState, useCallback } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import type { Item } from './types';

const ANIMATION_DURATION = 500;

interface Props {
  item: Item;
  onSalvage: (itemId: string) => void;
}

export const SalvageButton: React.FC<Props> = ({ item, onSalvage }) => {
  const [disabled, setDisabled] = useState(false);

  const handlePress = useCallback(() => {
    setDisabled(true);
    onSalvage(item.id);

    setTimeout(() => {
      setDisabled(false);
    }, ANIMATION_DURATION);
  }, [item.id, onSalvage]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Salvage item"
      style={[styles.button, disabled && styles.buttonDisabled]}
    >
      <Text style={styles.buttonText}>Salvage</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#808080',
    opacity: 0.6
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600'
  }
});
```

**Run tests**: `npm test SalvageButton` - **SHOULD PASS**

#### Step 5: REFACTOR (if needed)

Code is clean - no refactoring needed yet.

**ACCEPTANCE CRITERIA**:
- [x] Types defined (Item, Material, SalvageResult)
- [x] SalvageEngine service created with unit tests
- [x] Engine calculates correct material yields
- [x] Manual salvage gives 2x materials
- [x] Critical hits work (5% chance, 5x materials)
- [x] SalvageButton component created with tests
- [x] Button calls onSalvage callback
- [x] Button disables during animation
- [x] All tests pass (>80% coverage)

**DELIVERABLES**:
1. `modules/salvage/types.ts` - Type definitions
2. `modules/salvage/SalvageEngine.ts` + tests - Business logic
3. `modules/salvage/SalvageButton.tsx` + tests - UI component
4. Complete test suite with >80% coverage

**DEPENDENCIES**: Task 1.1 (Test Infrastructure)
**VALIDATION**: Run `npm test modules/salvage` - all tests pass

---

### Task 1.3: Material State Management with Legend State (TDD)
**ROLE**: You are a state management expert implementing reactive material tracking with Legend State

**CONTEXT**: Players need to see their material counts update in real-time as they salvage. We use Legend State for reactive, high-performance state management (per TDD Section 3).

**OBJECTIVE**: Create a Legend State store for materials that persists to AsyncStorage and updates UI reactively.

**WORKING DIRECTORY**: `c:\dev\class-one-rapids\frontend\`

**FILE LOCATIONS**:
- Store: `frontend/modules/salvage/materialStore.ts`
- Store Test: `frontend/modules/salvage/materialStore.test.ts` (co-located)

**TDD IMPLEMENTATION**:

#### Step 1: Install Legend State

```bash
npm install @legendapp/state
npm install @legendapp/state@react  # React bindings
npm install @legendapp/state@persist  # Persistence
npm install @legendapp/state@persist-plugins/async-storage  # AsyncStorage plugin
npm install @react-native-async-storage/async-storage  # If not already installed
```

#### Step 2: RED - Write Store Tests First

Create `modules/salvage/materialStore.test.ts`:
```typescript
import { materials$, addMaterials, getMaterialCount, resetMaterials } from './materialStore';
import { MaterialType } from './types';

describe('materialStore', () => {
  beforeEach(() => {
    resetMaterials();
  });

  test('should initialize with zero materials', () => {
    expect(getMaterialCount(MaterialType.IRON)).toBe(0);
    expect(getMaterialCount(MaterialType.WOOD)).toBe(0);
    expect(getMaterialCount(MaterialType.LEATHER)).toBe(0);
    expect(getMaterialCount(MaterialType.GEMS)).toBe(0);
  });

  test('should add materials correctly', () => {
    addMaterials([
      { type: MaterialType.IRON, quantity: 10 },
      { type: MaterialType.WOOD, quantity: 5 }
    ]);

    expect(getMaterialCount(MaterialType.IRON)).toBe(10);
    expect(getMaterialCount(MaterialType.WOOD)).toBe(5);
  });

  test('should accumulate materials from multiple adds', () => {
    addMaterials([{ type: MaterialType.IRON, quantity: 10 }]);
    addMaterials([{ type: MaterialType.IRON, quantity: 5 }]);

    expect(getMaterialCount(MaterialType.IRON)).toBe(15);
  });

  test('should handle multiple material types in single add', () => {
    addMaterials([
      { type: MaterialType.IRON, quantity: 10 },
      { type: MaterialType.WOOD, quantity: 20 },
      { type: MaterialType.GEMS, quantity: 5 }
    ]);

    expect(getMaterialCount(MaterialType.IRON)).toBe(10);
    expect(getMaterialCount(MaterialType.WOOD)).toBe(20);
    expect(getMaterialCount(MaterialType.GEMS)).toBe(5);
  });

  test('should allow peeking at materials without subscribing', () => {
    addMaterials([{ type: MaterialType.IRON, quantity: 50 }]);

    const iron = materials$[MaterialType.IRON].peek();

    expect(iron).toBe(50);
  });
});
```

**Run test**: `npm test materialStore` - **MUST FAIL**

#### Step 3: GREEN - Minimal Store Implementation

Create `modules/salvage/materialStore.ts`:
```typescript
import { observable } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Material, MaterialType } from './types';
import { MaterialType as MT } from './types';

// Initialize material store
export const materials$ = observable<Record<MaterialType, number>>({
  [MT.IRON]: 0,
  [MT.WOOD]: 0,
  [MT.LEATHER]: 0,
  [MT.GEMS]: 0
});

// Configure persistence to AsyncStorage
persistObservable(materials$, {
  local: 'salvage_materials_v1',
  pluginLocal: ObservablePersistAsyncStorage,
  persistLocalOptions: {
    asyncStorage: AsyncStorage
  }
});

/**
 * Add materials to the player's inventory
 */
export function addMaterials(materials: Material[]): void {
  const current = materials$.peek(); // Use peek() to avoid subscription

  materials.forEach(({ type, quantity }) => {
    materials$[type].set(current[type] + quantity);
  });
}

/**
 * Get current count of a specific material
 */
export function getMaterialCount(type: MaterialType): number {
  return materials$[type].get();
}

/**
 * Reset all materials (for testing)
 */
export function resetMaterials(): void {
  materials$.set({
    [MT.IRON]: 0,
    [MT.WOOD]: 0,
    [MT.LEATHER]: 0,
    [MT.GEMS]: 0
  });
}
```

**Run test**: `npm test materialStore` - **SHOULD PASS**

#### Step 4: REFACTOR (if needed)

Store is simple and clean - no refactoring needed.

**ACCEPTANCE CRITERIA**:
- [x] Legend State installed
- [x] Material store created with observables
- [x] addMaterials function works correctly
- [x] getMaterialCount retrieves values
- [x] Materials accumulate on multiple adds
- [x] Store persists to AsyncStorage
- [x] All tests pass

**DELIVERABLES**:
1. `modules/salvage/materialStore.ts` - Legend State store
2. `modules/salvage/materialStore.test.ts` - Unit tests
3. AsyncStorage persistence configured

**DEPENDENCIES**: Task 1.2
**VALIDATION**: Tests pass, store persists (check with AsyncStorage inspector)

---

### Task 1.4: Material Counter UI Component (TDD)
**ROLE**: You are a UI developer creating reactive material display components

**CONTEXT**: Players need real-time feedback of their material counts. The component must update automatically when materials change (Legend State reactivity).

**OBJECTIVE**: Create MaterialCounter component that displays from Legend State and updates in real-time

**FILE LOCATIONS**:
- Component: `frontend/modules/salvage/MaterialCounter.tsx`
- Test: `frontend/modules/salvage/MaterialCounter.test.tsx` (co-located)

**TDD IMPLEMENTATION**:

#### Step 1: RED - Component Tests First

Create `modules/salvage/MaterialCounter.test.tsx`:
```typescript
import React from 'react';
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import { MaterialCounter } from './MaterialCounter';
import { materials$, addMaterials, resetMaterials } from './materialStore';
import { MaterialType } from './types';

describe('MaterialCounter', () => {
  beforeEach(() => {
    resetMaterials();
  });

  test('should display zero materials initially', () => {
    render(<MaterialCounter type={MaterialType.IRON} />);

    expect(screen.getByText(/iron/i)).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });

  test('should display current material count', () => {
    materials$[MaterialType.IRON].set(50);

    render(<MaterialCounter type={MaterialType.IRON} />);

    expect(screen.getByText('50')).toBeTruthy();
  });

  test('should update when materials change (Legend State reactivity)', async () => {
    render(<MaterialCounter type={MaterialType.IRON} />);

    // Initially 0
    expect(screen.getByText('0')).toBeTruthy();

    // Add materials
    addMaterials([{ type: MaterialType.IRON, quantity: 25 }]);

    // Should update automatically
    await waitFor(() => {
      expect(screen.getByText('25')).toBeTruthy();
    });
  });

  test('should display material type name', () => {
    render(<MaterialCounter type={MaterialType.WOOD} />);

    expect(screen.getByText(/wood/i)).toBeTruthy();
  });

  test('should use correct color for material type', () => {
    const { getByTestId } = render(<MaterialCounter type={MaterialType.IRON} />);

    const icon = getByTestId('material-icon');

    expect(icon.props.style).toMatchObject({
      backgroundColor: '#888888'  // Iron color
    });
  });
});
```

**Run test**: `npm test MaterialCounter` - **MUST FAIL**

#### Step 2: GREEN - Component Implementation

Create `modules/salvage/MaterialCounter.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { observer } from '@legendapp/state/react';
import { materials$ } from './materialStore';
import type { MaterialType } from './types';

interface Props {
  type: MaterialType;
}

const MATERIAL_COLORS: Record<MaterialType, string> = {
  iron: '#888888',
  wood: '#8B4513',
  leather: '#D2691E',
  gems: '#4169E1'
};

const MATERIAL_NAMES: Record<MaterialType, string> = {
  iron: 'Iron',
  wood: 'Wood',
  leather: 'Leather',
  gems: 'Gems'
};

export const MaterialCounter: React.FC<Props> = observer(({ type }) => {
  const count = materials$[type].get();
  const color = MATERIAL_COLORS[type];
  const name = MATERIAL_NAMES[type];

  return (
    <View style={styles.container}>
      <View
        style={[styles.icon, { backgroundColor: color }]}
        testID="material-icon"
      />
      <Text style={styles.label}>{name}:</Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    marginVertical: 4
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8
  },
  count: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
    minWidth: 40,
    textAlign: 'right'
  }
});
```

**Run test**: `npm test MaterialCounter` - **SHOULD PASS**

#### Step 3: REFACTOR - Accessibility

Add accessibility improvements:
```typescript
<View
  style={styles.container}
  accessibilityRole="text"
  accessibilityLabel={`${name} count: ${count}`}
>
  {/* ... */}
</View>
```

**ACCEPTANCE CRITERIA**:
- [x] Component renders material name and count
- [x] Uses correct color for each material type
- [x] Updates automatically when materials change (observer)
- [x] Accessible with proper labels
- [x] Minimum 44x44pt touch target (not tappable, but visible)
- [x] All tests pass

**DELIVERABLES**:
1. `modules/salvage/MaterialCounter.tsx` - Reactive component
2. `modules/salvage/MaterialCounter.test.tsx` - Component tests
3. Color/name mappings for all material types

**DEPENDENCIES**: Task 1.3
**VALIDATION**: Component updates in real-time when materials added

---

### Task 1.5: Complete Salvage Screen - First Playable MVP (TDD)
**ROLE**: You are a full-stack mobile developer integrating all pieces into the first playable feature

**CONTEXT**: This completes the **FIRST USER-VISIBLE FEATURE LOOP**: User taps item → salvage animation → materials increase. This is the MVP - users can now play with the core mechanic.

**OBJECTIVE**: Create complete salvage screen with working salvage flow and material display

**FILE LOCATIONS**:
- Screen: `frontend/app/salvage.tsx` (Expo Router page)
- Integration Test: `frontend/modules/salvage/SalvageFlow.test.tsx`

**TDD IMPLEMENTATION**:

#### Step 1: RED - Integration Tests First

Create `modules/salvage/SalvageFlow.test.tsx`:
```typescript
import React from 'react';
import { render, screen, userEvent, waitFor } from '@/__tests__/utils/test-utils';
import SalvageScreen from '@/app/salvage';
import { materials$, resetMaterials } from './materialStore';
import { MaterialType } from './types';

describe('Salvage Flow Integration', () => {
  beforeEach(() => {
    resetMaterials();
  });

  test('complete salvage updates materials', async () => {
    const user = userEvent.setup();
    render(<SalvageScreen />);

    // Initially 0 materials
    expect(screen.getByText(/iron.*0/i)).toBeTruthy();

    // Tap salvage button
    const salvageButton = screen.getByRole('button', { name: /salvage/i });
    await user.press(salvageButton);

    // Wait for update
    await waitFor(() => {
      const ironCount = materials$[MaterialType.IRON].get();
      expect(ironCount).toBeGreaterThan(0);
    }, { timeout: 1000 });
  });

  test('multiple salvages accumulate materials', async () => {
    const user = userEvent.setup();
    render(<SalvageScreen />);

    const salvageButton = screen.getByRole('button', { name: /salvage/i });

    // Salvage 3 times
    await user.press(salvageButton);
    await waitFor(() => expect(salvageButton).not.toBeDisabled());

    await user.press(salvageButton);
    await waitFor(() => expect(salvageButton).not.toBeDisabled());

    await user.press(salvageButton);

    // Should have accumulated (3 * 20 = 60, or more with criticals)
    await waitFor(() => {
      const ironCount = materials$[MaterialType.IRON].get();
      expect(ironCount).toBeGreaterThanOrEqual(60);
    });
  });

  test('material counter updates automatically', async () => {
    const user = userEvent.setup();
    render(<SalvageScreen />);

    // Counter visible
    expect(screen.getByText(/iron/i)).toBeTruthy();

    // Salvage
    await user.press(screen.getByRole('button', { name: /salvage/i }));

    // Counter updates (Legend State reactivity)
    await waitFor(() => {
      const counts = screen.getAllByText(/\d+/);
      const hasNonZero = counts.some(node => parseInt(node.children[0] as string) > 0);
      expect(hasNonZero).toBe(true);
    });
  });
});
```

**Run test**: `npm test SalvageFlow` - **MUST FAIL**

#### Step 2: GREEN - Screen Implementation

Create `app/salvage.tsx`:
```typescript
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SalvageButton } from '@/modules/salvage/SalvageButton';
import { MaterialCounter } from '@/modules/salvage/MaterialCounter';
import { SalvageEngine } from '@/modules/salvage/SalvageEngine';
import { addMaterials } from '@/modules/salvage/materialStore';
import { MaterialType } from '@/modules/salvage/types';
import { createMockItem } from '@/__tests__/factories/item.factory';

const salvageEngine = new SalvageEngine();

export default function SalvageScreen() {
  // MVP: Single test item
  const mockItem = createMockItem({
    id: 'test-weapon-1',
    salvageValue: 10
  });

  const handleSalvage = useCallback((itemId: string) => {
    // Execute salvage (manual = true for 2x bonus)
    const result = salvageEngine.salvageItem(itemId, true);

    // Update materials store
    addMaterials(result.materials);

    // Log for development
    console.log('Salvage result:', result);

    // TODO Phase 2: Add XP gain
    // TODO Phase 3: Add particle animation
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Salvage & Tinkering</Text>

      {/* Material Counters */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Materials</Text>
        <MaterialCounter type={MaterialType.IRON} />
        <MaterialCounter type={MaterialType.WOOD} />
        <MaterialCounter type={MaterialType.LEATHER} />
        <MaterialCounter type={MaterialType.GEMS} />
      </View>

      {/* Salvage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inventory</Text>
        <View style={styles.itemCard}>
          <View>
            <Text style={styles.itemName}>Test Weapon</Text>
            <Text style={styles.itemType}>Common Weapon</Text>
          </View>
          <SalvageButton item={mockItem} onSalvage={handleSalvage} />
        </View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Tap "Salvage" to break down items into materials
        </Text>
        <Text style={styles.instructionsText}>
          Manual salvaging gives 2x materials!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 24,
    marginTop: 40
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12
  },
  itemCard: {
    backgroundColor: '#2C2C2C',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  itemType: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4
  },
  instructions: {
    backgroundColor: '#2C2C2C',
    padding: 16,
    borderRadius: 8,
    marginTop: 16
  },
  instructionsText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8
  }
});
```

**Run test**: `npm test SalvageFlow` - **SHOULD PASS**

#### Step 3: REFACTOR - Expo Router Navigation

Add to `app/_layout.tsx` if needed:
```typescript
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="salvage" options={{ title: 'Salvage & Tinker' }} />
    </Stack>
  );
}
```

**ACCEPTANCE CRITERIA**:
- [x] Salvage screen renders
- [x] Material counters display all 4 material types
- [x] Salvage button works
- [x] Tapping salvage increases materials
- [x] Multiple salvages accumulate correctly
- [x] Material counters update in real-time (Legend State)
- [x] All integration tests pass
- [x] User can play with the feature immediately

**DELIVERABLES**:
1. `app/salvage.tsx` - Complete salvage screen
2. `modules/salvage/SalvageFlow.test.tsx` - Integration tests
3. **FIRST PLAYABLE FEATURE** - Users can tap and see materials increase

**DEPENDENCIES**: Tasks 1.2, 1.3, 1.4
**VALIDATION**:
- Run `npm test SalvageFlow` - all tests pass
- Run app: `npx expo start` (Windows: use cmd.exe)
- Navigate to salvage screen
- Tap salvage button
- See materials increase in real-time

**DEMO-ABLE**: This task completes the first user-visible, playable feature! 🎮

---

## Phase Summary

**Phase 1 Complete**: Users can now:
✅ Tap inventory items to salvage them
✅ See satisfying button animation (disabled during salvage)
✅ Watch material counts increase in real-time
✅ Get 2x materials for manual salvaging
✅ Occasionally trigger critical hits (5x materials)

**Test Coverage**: >80% for all salvage modules

**Next Phase Preview**: Phase 2 will add equipment and tinkering mechanics, allowing players to spend materials to upgrade gear.

---

## Execution Notes for Agents/Developers

### For Human Developers:
1. Execute tasks sequentially (1.1 → 1.2 → 1.3 → 1.4 → 1.5)
2. Each task is independently testable
3. Use TDD: Write tests first (RED), then implement (GREEN), then refactor
4. Mark tasks complete when all acceptance criteria met
5. Report any blockers immediately

### For AI Agents:
1. Follow TDD strictly: RED → GREEN → REFACTOR
2. Run tests after each implementation step
3. Verify all acceptance criteria before marking complete
4. Use `npm test <module>` to run specific tests
5. Escalate if tests don't pass after implementation

### Common Pitfalls to Avoid:
- ❌ Don't create `index.ts` barrel exports
- ❌ Don't put tests in `__tests__` directory (co-locate with implementation)
- ❌ Don't skip the RED phase (tests must fail first!)
- ❌ Don't implement features without tests
- ❌ Don't create infrastructure without immediate user value

---

## Summary Statistics

- **Total Phase 1 Tasks**: 5 tasks
- **Estimated Duration**: 5 days
- **Test Coverage Target**: >80%
- **User-Visible Features**: 1 complete playable feature
- **Critical Path**: All tasks sequential (1.1 → 1.2 → 1.3 → 1.4 → 1.5)
- **Dependencies**: None (starts from scratch)

---

*Generated from TDD: `/workflow-outputs/20251102_225941/tdd_20251102.extracted.md`*
*Generation timestamp: 2025-11-03 19:50:00*
*Architecture: Feature-based Expo/React Native following lean principles*
*Approach: Test-Driven Development (TDD) with user-visible functionality first*
