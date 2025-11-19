# Task List: Shop Upgrades System
**Generated From:** tdd_upgrades_20251117.md
**Date:** 2025-11-17
**Status:** Ready for Execution
**Methodology:** Test-Driven Development (TDD)

---

## Overview

This task list breaks down the implementation of the Shop Upgrades System feature into atomic, agent-executable tasks following TDD methodology. Each task is clearly defined with specific file paths, code requirements, and dependencies.

**Key Principles:**
1. Write test first, then implement
2. Each task is atomic and independently testable
3. Tasks build upon each other sequentially
4. All tests must pass using cmd.exe as per project guidelines

---

## Phase 1: Type System Updates

### Task 1.1: Update Upgrade Interface - Rename scrapCost to cost
**Status:** Pending
**Priority:** HIGH
**Dependencies:** None
**Estimated Time:** 15 minutes

**Objective:** Update the Upgrade interface to rename scrapCost to cost and add optional category field.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/types/game.ts`

**Implementation Details:**
1. Locate the `Upgrade` interface definition
2. Change `scrapCost: number;` to `cost: number;`
3. Add optional field: `category?: 'scrapEfficiency' | 'petAcquisition';`
4. Update JSDoc comments to document the cost field:
   ```typescript
   /** Cost in scrap to purchase this upgrade (renamed from scrapCost) */
   cost: number;
   ```
5. Add JSDoc for effectValue explaining the values:
   ```typescript
   /**
    * Numeric value of the effect:
    * - For scrapMultiplier: decimal multiplier (0.1 = 10%, 0.15 = 15%)
    * - For petBonus: flat integer bonus (1 = +1 pet, 2 = +2 pets)
    */
   effectValue: number;
   ```
6. Add JSDoc for category field explaining its purpose

**Acceptance Criteria:**
- [ ] scrapCost renamed to cost
- [ ] category field added as optional
- [ ] JSDoc comments comprehensive
- [ ] TypeScript compiles (will show errors in files using scrapCost - expected)

---

### Task 1.2: Search and Update All scrapCost References
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 1.1
**Estimated Time:** 20 minutes

**Objective:** Find and update all references from scrapCost to cost throughout the codebase.

**Files to Modify:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

**Implementation Details:**
1. Search for all occurrences of `scrapCost` in the frontend directory
2. In ShopScreen.tsx, update these locations:
   - Line ~74: `Cost: {upgrade.cost} scrap`
   - Line ~82: accessibilityLabel cost reference
   - Line ~141: canPurchase function comparison
   - Line ~154: getButtonLabel function comparison
   - Line ~172: handlePurchase validation
   - Line ~178: handlePurchase deduction
3. In ShopScreen.test.tsx:
   - Update all mock upgrade objects to use `cost` instead of `scrapCost`
   - Update any test assertions checking cost values
4. Run global find/replace: `scrapCost` → `cost` (carefully review each change)

**Acceptance Criteria:**
- [ ] All scrapCost references updated to cost
- [ ] ShopScreen.tsx updated (6 locations)
- [ ] ShopScreen.test.tsx updated
- [ ] TypeScript compiles without errors
- [ ] No remaining scrapCost references in codebase

---

### Task 1.3: Run TypeScript Compilation Check
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 1.2
**Estimated Time:** 5 minutes

**Objective:** Verify TypeScript compilation is error-free after type system changes.

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npx tsc --noEmit"
```

**Acceptance Criteria:**
- [ ] TypeScript compiles without errors
- [ ] No type warnings related to Upgrade interface
- [ ] All imports resolve correctly

---

## Phase 2: Upgrade Definitions

### Task 2.1: Write Tests for upgradeDefinitions - Data Integrity
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 1.3
**Estimated Time:** 30 minutes

**Objective:** Write tests for upgrade definitions before creating the file.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.test.ts`

**Implementation Details:**
1. Create test file at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.test.ts`
2. Import testing utilities and types
3. Create test suite: `describe('UPGRADES', () => { ... })`
4. Add nested suite: `describe('Data Integrity', () => { ... })`
5. Write tests:
   - Test: 'exports exactly 5 upgrades'
   - Test: 'all upgrades have unique IDs'
   - Test: 'all upgrades have required properties'
   - Test: 'all upgrades have valid categories'

**Test Code Reference:**
```typescript
import { UPGRADES, getUpgradeById, getUpgradesByCategory, getUpgradesByEffectType } from './upgradeDefinitions';
import { Upgrade } from '../../shared/types/game';

describe('UPGRADES', () => {
  describe('Data Integrity', () => {
    test('exports exactly 5 upgrades', () => {
      expect(UPGRADES).toHaveLength(5);
    });

    test('all upgrades have unique IDs', () => {
      const ids = UPGRADES.map(u => u.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('all upgrades have required properties', () => {
      UPGRADES.forEach(upgrade => {
        expect(upgrade.id).toBeTruthy();
        expect(typeof upgrade.id).toBe('string');
        expect(upgrade.name).toBeTruthy();
        expect(typeof upgrade.name).toBe('string');
        expect(upgrade.cost).toBeTruthy();
        expect(typeof upgrade.cost).toBe('number');
        expect(upgrade.cost).toBeGreaterThan(0);
        expect(upgrade.effectType).toBeTruthy();
        expect(['scrapMultiplier', 'petBonus']).toContain(upgrade.effectType);
        expect(upgrade.effectValue).toBeTruthy();
        expect(typeof upgrade.effectValue).toBe('number');
        expect(upgrade.effectValue).toBeGreaterThan(0);
      });
    });

    test('all upgrades have valid categories', () => {
      UPGRADES.forEach(upgrade => {
        expect(['scrapEfficiency', 'petAcquisition']).toContain(upgrade.category);
      });
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Test file compiles with TypeScript
- [ ] Data integrity scenarios covered

---

### Task 2.2: Write Tests for upgradeDefinitions - Scrap Efficiency Path
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.1
**Estimated Time:** 25 minutes

**Objective:** Write tests for the three scrap efficiency upgrades.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.test.ts`

**Implementation Details:**
1. Add nested suite: `describe('Scrap Efficiency Upgrades', () => { ... })`
2. Write tests for each upgrade:
   - Test: 'scrap-boost-1 has correct values' (cost: 100, effectValue: 0.1)
   - Test: 'scrap-boost-2 has correct values' (cost: 500, effectValue: 0.15)
   - Test: 'scrap-boost-3 has correct values' (cost: 2000, effectValue: 0.25)
3. Write totals test:
   - Test: 'scrap efficiency path totals' (total cost: 2600, total effect: 0.5)

**Test Code Reference:**
```typescript
describe('Scrap Efficiency Upgrades', () => {
  test('scrap-boost-1 has correct values', () => {
    const upgrade = UPGRADES.find(u => u.id === 'scrap-boost-1');

    expect(upgrade).toBeDefined();
    expect(upgrade?.name).toBe('Scrap Finder');
    expect(upgrade?.cost).toBe(100);
    expect(upgrade?.effectType).toBe('scrapMultiplier');
    expect(upgrade?.effectValue).toBe(0.1);
    expect(upgrade?.category).toBe('scrapEfficiency');
  });

  test('scrap efficiency path totals', () => {
    const scrapUpgrades = UPGRADES.filter(u => u.effectType === 'scrapMultiplier');

    expect(scrapUpgrades).toHaveLength(3);

    const totalCost = scrapUpgrades.reduce((sum, u) => sum + u.cost, 0);
    expect(totalCost).toBe(2600); // 100 + 500 + 2000

    const totalEffect = scrapUpgrades.reduce((sum, u) => sum + u.effectValue, 0);
    expect(totalEffect).toBeCloseTo(0.5, 5); // 0.1 + 0.15 + 0.25
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] All three scrap upgrades tested
- [ ] Totals validated

---

### Task 2.3: Write Tests for upgradeDefinitions - Pet Acquisition Path
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.2
**Estimated Time:** 20 minutes

**Objective:** Write tests for the two pet acquisition upgrades.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.test.ts`

**Implementation Details:**
1. Add nested suite: `describe('Pet Acquisition Upgrades', () => { ... })`
2. Write tests for each upgrade:
   - Test: 'pet-boost-1 has correct values' (cost: 200, effectValue: 1)
   - Test: 'pet-boost-2 has correct values' (cost: 1000, effectValue: 2)
3. Write totals test:
   - Test: 'pet acquisition path totals' (total cost: 1200, total effect: 3)

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Both pet upgrades tested
- [ ] Totals validated

---

### Task 2.4: Write Tests for upgradeDefinitions - Balance and Helper Functions
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.3
**Estimated Time:** 20 minutes

**Objective:** Write tests for overall balance and helper functions.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.test.ts`

**Implementation Details:**
1. Add nested suite: `describe('Balance Validation', () => { ... })`
2. Write tests:
   - Test: 'total investment for all upgrades' (3800 total)
   - Test: 'costs follow progression curve'
3. Add nested suite: `describe('Helper Functions', () => { ... })`
4. Write tests for helper functions:
   - Test: 'getUpgradeById returns upgrade when ID exists'
   - Test: 'getUpgradeById returns undefined when ID does not exist'
   - Test: 'getUpgradesByCategory returns scrap efficiency upgrades'
   - Test: 'getUpgradesByCategory returns pet acquisition upgrades'
   - Test: 'getUpgradesByEffectType returns scrap multiplier upgrades'
   - Test: 'getUpgradesByEffectType returns pet bonus upgrades'

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Balance tests comprehensive
- [ ] Helper function tests complete

---

### Task 2.5: Implement upgradeDefinitions.ts
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.4
**Estimated Time:** 40 minutes

**Objective:** Create upgrade definitions file to pass all tests from Tasks 2.1-2.4.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.ts`

**Implementation Details:**
1. Create file at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.ts`
2. Import Upgrade type from shared/types/game
3. Define UPGRADES constant array with 5 upgrades (see TDD document section 4.1):
   ```typescript
   export const UPGRADES: Upgrade[] = [
     {
       id: 'scrap-boost-1',
       name: 'Scrap Finder',
       description: 'Your AI Pets are better at finding scrap. Increases scrap generation by 10%.',
       cost: 100,
       effectType: 'scrapMultiplier',
       effectValue: 0.1,
       category: 'scrapEfficiency',
     },
     // ... remaining 4 upgrades
   ];
   ```
4. Implement helper functions:
   - `getUpgradeById(id: string): Upgrade | undefined`
   - `getUpgradesByCategory(category): Upgrade[]`
   - `getUpgradesByEffectType(effectType): Upgrade[]`
5. Add comprehensive JSDoc comments to all exports

**Acceptance Criteria:**
- [ ] Tests from Tasks 2.1-2.4 pass
- [ ] All 5 upgrades defined correctly
- [ ] Helper functions implemented
- [ ] JSDoc comments complete
- [ ] TypeScript compiles without errors

---

### Task 2.6: Run upgradeDefinitions Tests
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.5
**Estimated Time:** 5 minutes

**Objective:** Verify all upgrade definition tests pass.

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test -- upgradeDefinitions.test.ts"
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] 100% coverage for upgradeDefinitions.ts
- [ ] No test failures or errors

---

## Phase 3: Computed Observables

### Task 3.1: Write Tests for totalScrapMultiplier$ Observable
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.6
**Estimated Time:** 30 minutes

**Objective:** Write tests for totalScrapMultiplier$ computed observable before implementation.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`

**Implementation Details:**
1. Add imports for UPGRADES and new observables
2. Add nested suite: `describe('Effect Calculation Observables', () => { ... })`
3. Add beforeEach hook to reset game state
4. Add nested suite: `describe('totalScrapMultiplier$', () => { ... })`
5. Write tests:
   - Test: 'returns 0 when no upgrades are purchased'
   - Test: 'returns 0 when upgrades array is empty'
   - Test: 'calculates single scrap multiplier upgrade correctly'
   - Test: 'sums multiple scrap multiplier upgrades additively'
   - Test: 'includes all three scrap upgrades'
   - Test: 'ignores pet bonus upgrades'
   - Test: 'ignores non-existent upgrade IDs'
   - Test: 'updates reactively when purchases change'

**Test Code Reference:**
```typescript
import { gameState$, totalScrapMultiplier$, totalPetBonus$ } from './gameStore';
import { UPGRADES } from '../../modules/shop/upgradeDefinitions';

describe('Effect Calculation Observables', () => {
  beforeEach(() => {
    gameState$.set({
      petCount: 0,
      scrap: 0,
      upgrades: [],
      purchasedUpgrades: [],
    });
  });

  describe('totalScrapMultiplier$', () => {
    test('returns 0 when no upgrades are purchased', () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set([]);

      expect(totalScrapMultiplier$.get()).toBe(0);
    });

    test('calculates single scrap multiplier upgrade correctly', () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set(['scrap-boost-1']);

      expect(totalScrapMultiplier$.get()).toBe(0.1);
    });

    test('sums multiple scrap multiplier upgrades additively', () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2']);

      expect(totalScrapMultiplier$.get()).toBeCloseTo(0.25, 5); // 0.1 + 0.15
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] All calculation scenarios covered
- [ ] Edge cases tested
- [ ] Reactive behavior tested

---

### Task 3.2: Write Tests for totalPetBonus$ Observable
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 3.1
**Estimated Time:** 25 minutes

**Objective:** Write tests for totalPetBonus$ computed observable before implementation.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`

**Implementation Details:**
1. Add nested suite: `describe('totalPetBonus$', () => { ... })`
2. Write tests:
   - Test: 'returns 0 when no upgrades are purchased'
   - Test: 'returns 0 when upgrades array is empty'
   - Test: 'calculates single pet bonus upgrade correctly'
   - Test: 'sums multiple pet bonus upgrades additively'
   - Test: 'ignores scrap multiplier upgrades'
   - Test: 'ignores non-existent upgrade IDs'
   - Test: 'updates reactively when purchases change'

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] All calculation scenarios covered
- [ ] Edge cases tested
- [ ] Reactive behavior tested

---

### Task 3.3: Write Tests for Combined Effects
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 3.2
**Estimated Time:** 15 minutes

**Objective:** Write tests for both computed observables working together.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`

**Implementation Details:**
1. Add nested suite: `describe('Combined Effects', () => { ... })`
2. Write tests:
   - Test: 'both computed observables work independently'
   - Test: 'full upgrade suite calculates correctly'

**Test Code Reference:**
```typescript
describe('Combined Effects', () => {
  test('both computed observables work independently', () => {
    gameState$.upgrades.set(UPGRADES);
    gameState$.purchasedUpgrades.set([
      'scrap-boost-1',
      'scrap-boost-2',
      'pet-boost-1',
    ]);

    expect(totalScrapMultiplier$.get()).toBeCloseTo(0.25, 5); // 0.1 + 0.15
    expect(totalPetBonus$.get()).toBe(1);
  });

  test('full upgrade suite calculates correctly', () => {
    gameState$.upgrades.set(UPGRADES);
    gameState$.purchasedUpgrades.set([
      'scrap-boost-1',
      'scrap-boost-2',
      'scrap-boost-3',
      'pet-boost-1',
      'pet-boost-2',
    ]);

    expect(totalScrapMultiplier$.get()).toBeCloseTo(0.5, 5); // 50% total
    expect(totalPetBonus$.get()).toBe(3); // +3 pets total
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Combined effect scenarios tested

---

### Task 3.4: Implement Computed Observables in gameStore.ts
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 3.3
**Estimated Time:** 30 minutes

**Objective:** Implement totalScrapMultiplier$ and totalPetBonus$ computed observables to pass tests.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Implementation Details:**
1. Import `computed` from '@legendapp/state' (if not already imported)
2. After gameState$ declaration, add totalScrapMultiplier$ (see TDD document section 5.1.1):
   ```typescript
   export const totalScrapMultiplier$ = computed(() => {
     const purchased = gameState$.purchasedUpgrades.get();
     const upgrades = gameState$.upgrades.get();

     return upgrades
       .filter(u => purchased.includes(u.id) && u.effectType === 'scrapMultiplier')
       .reduce((sum, u) => sum + u.effectValue, 0);
   });
   ```
3. Add totalPetBonus$ (see TDD document section 5.1.2):
   ```typescript
   export const totalPetBonus$ = computed(() => {
     const purchased = gameState$.purchasedUpgrades.get();
     const upgrades = gameState$.upgrades.get();

     return upgrades
       .filter(u => purchased.includes(u.id) && u.effectType === 'petBonus')
       .reduce((sum, u) => sum + u.effectValue, 0);
   });
   ```
4. Add comprehensive JSDoc comments to both observables

**Acceptance Criteria:**
- [ ] Tests from Tasks 3.1-3.3 pass
- [ ] Both observables implemented correctly
- [ ] Computed observables reactive
- [ ] JSDoc comments complete
- [ ] TypeScript compiles without errors

---

### Task 3.5: Run gameStore Tests
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 3.4
**Estimated Time:** 5 minutes

**Objective:** Verify all gameStore tests pass including new computed observable tests.

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test -- gameStore.test.ts"
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] 100% coverage for new computed observables
- [ ] No test failures or errors

---

## Phase 4: Initialization

### Task 4.1: Update initializeGameState Function
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 3.5
**Estimated Time:** 20 minutes

**Objective:** Update initializeGameState to populate upgrades array from UPGRADES definition.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Implementation Details:**
1. Import UPGRADES from upgradeDefinitions:
   ```typescript
   import { UPGRADES } from '../../modules/shop/upgradeDefinitions';
   ```
2. Update initializeGameState function (see TDD document section 5.1.3):
   ```typescript
   export async function initializeGameState(): Promise<void> {
     try {
       const savedState = await loadGameState();

       if (savedState) {
         gameState$.set({
           ...gameState$.get(),
           ...savedState,
         });
       }

       // Populate upgrades array if empty
       if (gameState$.upgrades.get().length === 0) {
         gameState$.upgrades.set(UPGRADES);
       }
     } catch (error) {
       console.error('Error initializing game state:', error);

       // On error, ensure upgrades are still populated
       if (gameState$.upgrades.get().length === 0) {
         gameState$.upgrades.set(UPGRADES);
       }
     }
   }
   ```
3. Update JSDoc comments to document upgrade population behavior

**Acceptance Criteria:**
- [ ] Upgrades populated on first load
- [ ] Existing upgrade data preserved
- [ ] Error handling maintains playable state
- [ ] JSDoc comments updated
- [ ] TypeScript compiles without errors

---

### Task 4.2: Test Initialization Manually
**Status:** Pending
**Priority:** MEDIUM
**Dependencies:** Task 4.1
**Estimated Time:** 10 minutes

**Objective:** Manually verify initialization works correctly in various scenarios.

**Test Scenarios:**
1. **Fresh Install:**
   - Clear AsyncStorage
   - Launch app
   - Verify UPGRADES populates
   - Verify shop shows 5 upgrades

2. **Existing User (No Upgrades in Save):**
   - Simulate old save data: `{ petCount: 100, scrap: 500, upgrades: [], purchasedUpgrades: [] }`
   - Launch app
   - Verify UPGRADES populates
   - Verify existing data preserved

**Acceptance Criteria:**
- [ ] Fresh install populates upgrades
- [ ] Existing data preserved
- [ ] No errors during initialization

---

## Phase 5: Scrap Generation Integration

### Task 5.1: Write Tests for AttackButtonScreen - Scrap Generation with Multipliers
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.2
**Estimated Time:** 35 minutes

**Objective:** Write tests for scrap generation with multiplier upgrades before implementation.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Implementation Details:**
1. Import UPGRADES and totalScrapMultiplier$
2. Add nested suite: `describe('Scrap Generation with Multipliers', () => { ... })`
3. Add beforeEach hook to use fake timers
4. Add afterEach hook to restore real timers
5. Write tests:
   - Test: 'generates base scrap without upgrades'
   - Test: 'applies scrap multiplier from purchased upgrade'
   - Test: 'stacks multiple scrap multipliers'
   - Test: 'applies maximum scrap multiplier (all upgrades)'

**Test Code Reference:**
```typescript
import { UPGRADES } from '../shop/upgradeDefinitions';
import { act } from 'react-test-renderer';

describe('AttackButtonScreen - Upgrade Effects Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    gameState$.set({
      petCount: 10,
      scrap: 0,
      upgrades: UPGRADES,
      purchasedUpgrades: [],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Scrap Generation with Multipliers', () => {
    test('generates base scrap without upgrades', async () => {
      const mockNavigateToShop = jest.fn();
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      expect(gameState$.scrap.get()).toBe(0);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(10); // 10 pets * 1
      });
    });

    test('applies scrap multiplier from purchased upgrade', async () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1']);

      const mockNavigateToShop = jest.fn();
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(11); // 10 * 1.1
      });
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] All multiplier scenarios covered
- [ ] Timer-based tests work correctly

---

### Task 5.2: Implement Scrap Multiplier in AttackButtonScreen
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 5.1
**Estimated Time:** 20 minutes

**Objective:** Integrate totalScrapMultiplier$ into scrap generation timer.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Implementation Details:**
1. Import totalScrapMultiplier$ from gameStore:
   ```typescript
   import { totalScrapMultiplier$ } from '../../shared/store/gameStore';
   ```
2. Update scrap generation timer useEffect (see TDD document section 6.1):
   ```typescript
   useEffect(() => {
     const interval = setInterval(() => {
       const petCount = petCount$.get();
       const multiplier = totalScrapMultiplier$.get();
       const scrapGenerated = petCount * (1 + multiplier);

       if (scrapGenerated > 0) {
         scrap$.set((prev) => prev + scrapGenerated);
       }
     }, 1000);

     return () => clearInterval(interval);
   }, []);
   ```
3. Add JSDoc comments explaining the multiplier application

**Acceptance Criteria:**
- [ ] Tests from Task 5.1 pass
- [ ] Multiplier applied correctly
- [ ] Base rate maintained when no upgrades
- [ ] Decimal scrap values handled correctly
- [ ] JSDoc comments added

---

### Task 5.3: Run AttackButtonScreen Tests (Scrap Generation)
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 5.2
**Estimated Time:** 5 minutes

**Objective:** Verify scrap generation tests pass.

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test -- AttackButtonScreen.test.tsx"
```

**Acceptance Criteria:**
- [ ] All scrap generation tests pass
- [ ] No test failures or errors

---

## Phase 6: Feed Button Integration

### Task 6.1: Write Tests for AttackButtonScreen - Feed Button with Pet Bonus
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 5.3
**Estimated Time:** 30 minutes

**Objective:** Write tests for feed button with pet bonus upgrades before implementation.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Implementation Details:**
1. Add nested suite: `describe('Feed Button with Pet Bonus', () => { ... })`
2. Write tests:
   - Test: 'adds base pets without upgrades'
   - Test: 'applies pet bonus from purchased upgrade'
   - Test: 'stacks multiple pet bonuses'
   - Test: 'bonus applies to multiple feed presses'

**Test Code Reference:**
```typescript
describe('Feed Button with Pet Bonus', () => {
  test('adds base pets without upgrades', () => {
    const mockNavigateToShop = jest.fn();
    render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

    expect(gameState$.petCount.get()).toBe(10);

    const feedButton = screen.getByLabelText('feed button');
    fireEvent.press(feedButton);

    expect(gameState$.petCount.get()).toBe(11); // +1 base
  });

  test('applies pet bonus from purchased upgrade', () => {
    gameState$.purchasedUpgrades.set(['pet-boost-1']);

    const mockNavigateToShop = jest.fn();
    render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

    const feedButton = screen.getByLabelText('feed button');
    fireEvent.press(feedButton);

    expect(gameState$.petCount.get()).toBe(12); // 1 base + 1 bonus
  });

  test('stacks multiple pet bonuses', () => {
    gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);

    const mockNavigateToShop = jest.fn();
    render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

    const feedButton = screen.getByLabelText('feed button');
    fireEvent.press(feedButton);

    expect(gameState$.petCount.get()).toBe(14); // 1 base + 3 bonus
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] All bonus scenarios covered
- [ ] Multiple presses tested

---

### Task 6.2: Implement Pet Bonus in AttackButtonScreen
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 6.1
**Estimated Time:** 15 minutes

**Objective:** Integrate totalPetBonus$ into feed button handler.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Implementation Details:**
1. Import totalPetBonus$ from gameStore:
   ```typescript
   import { totalScrapMultiplier$, totalPetBonus$ } from '../../shared/store/gameStore';
   ```
2. Update handleFeed function (see TDD document section 6.2):
   ```typescript
   const handleFeed = () => {
     const bonus = totalPetBonus$.get();
     const petsToAdd = 1 + bonus;
     petCount$.set((prev) => prev + petsToAdd);
   };
   ```
3. Add JSDoc comments explaining the bonus application

**Acceptance Criteria:**
- [ ] Tests from Task 6.1 pass
- [ ] Bonus applied correctly
- [ ] Base gain maintained when no upgrades
- [ ] JSDoc comments added

---

### Task 6.3: Write Tests for Combined Upgrade Effects
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 6.2
**Estimated Time:** 20 minutes

**Objective:** Write tests for both scrap multiplier and pet bonus working together.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Implementation Details:**
1. Add nested suite: `describe('Combined Upgrade Effects', () => { ... })`
2. Write tests:
   - Test: 'scrap multiplier and pet bonus work independently'
   - Test: 'all upgrades purchased - maximum effects'

**Test Code Reference:**
```typescript
describe('Combined Upgrade Effects', () => {
  test('scrap multiplier and pet bonus work independently', async () => {
    gameState$.purchasedUpgrades.set(['scrap-boost-1', 'pet-boost-1']);

    const mockNavigateToShop = jest.fn();
    render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

    // Test scrap generation
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(gameState$.scrap.get()).toBe(11); // 10 * 1.1
    });

    // Test feed button
    const feedButton = screen.getByLabelText('feed button');
    fireEvent.press(feedButton);

    expect(gameState$.petCount.get()).toBe(12); // 10 + (1 + 1)
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Combined effects tested
- [ ] Independence verified

---

### Task 6.4: Run AttackButtonScreen Tests (All)
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 6.3
**Estimated Time:** 5 minutes

**Objective:** Verify all AttackButtonScreen tests pass including upgrade integrations.

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test -- AttackButtonScreen.test.tsx"
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Coverage ≥ 90% for modified code
- [ ] No test failures or errors

---

## Phase 7: Shop Integration Tests

### Task 7.1: Write Tests for ShopScreen - Upgrade Effects Integration
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 6.4
**Estimated Time:** 35 minutes

**Objective:** Write tests for shop purchase flow updating computed observables.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

**Implementation Details:**
1. Import UPGRADES and computed observables
2. Add nested suite: `describe('Upgrade Effects Integration', () => { ... })`
3. Update beforeEach to set upgrades to UPGRADES
4. Write tests:
   - Test: 'purchasing scrap multiplier upgrade updates computed observable'
   - Test: 'purchasing pet bonus upgrade updates computed observable'
   - Test: 'purchasing multiple upgrades stacks effects'
   - Test: 'displays all 5 upgrades from definitions'

**Test Code Reference:**
```typescript
import { totalScrapMultiplier$, totalPetBonus$ } from '../../shared/store/gameStore';
import { UPGRADES } from './upgradeDefinitions';

describe('ShopScreen - Upgrade Effects Integration', () => {
  beforeEach(() => {
    gameState$.set({
      petCount: 0,
      scrap: 5000,
      upgrades: UPGRADES,
      purchasedUpgrades: [],
    });
  });

  test('purchasing scrap multiplier upgrade updates computed observable', () => {
    const mockNavigateBack = jest.fn();
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    const buyButton = screen.getByLabelText(/Buy Scrap Finder/i);
    fireEvent.press(buyButton);

    expect(totalScrapMultiplier$.get()).toBe(0.1);
    expect(gameState$.scrap.get()).toBe(4900); // 5000 - 100
    expect(gameState$.purchasedUpgrades.get()).toContain('scrap-boost-1');
  });

  test('purchasing multiple upgrades stacks effects', () => {
    const mockNavigateBack = jest.fn();
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    fireEvent.press(screen.getByLabelText(/Buy Scrap Finder/i));
    fireEvent.press(screen.getByLabelText(/Buy Scrap Magnet/i));

    expect(totalScrapMultiplier$.get()).toBeCloseTo(0.25, 5); // 0.1 + 0.15
    expect(gameState$.scrap.get()).toBe(4400); // 5000 - 100 - 500
  });

  test('displays all 5 upgrades from definitions', () => {
    const mockNavigateBack = jest.fn();
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.getByText('Scrap Finder')).toBeTruthy();
    expect(screen.getByText('Scrap Magnet')).toBeTruthy();
    expect(screen.getByText('Scrap Amplifier')).toBeTruthy();
    expect(screen.getByText('Extra Feed')).toBeTruthy();
    expect(screen.getByText('Double Feed')).toBeTruthy();
  });
});
```

**Acceptance Criteria:**
- [ ] Tests pass (ShopScreen already supports upgrades)
- [ ] Integration verified
- [ ] All 5 upgrades display

---

### Task 7.2: Run ShopScreen Tests
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 7.1
**Estimated Time:** 5 minutes

**Objective:** Verify all ShopScreen tests pass including upgrade integration tests.

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test -- ShopScreen.test.tsx"
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Coverage ≥ 95% for ShopScreen
- [ ] No test failures or errors

---

## Phase 8: Persistence Tests

### Task 8.1: Write Tests for Upgrade Persistence
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 7.2
**Estimated Time:** 30 minutes

**Objective:** Write tests for upgrade data persisting across sessions.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.test.ts`

**Implementation Details:**
1. Import UPGRADES and necessary modules
2. Add nested suite: `describe('Upgrade Persistence', () => { ... })`
3. Add beforeEach hook to clear AsyncStorage and reset state
4. Write tests:
   - Test: 'purchased upgrades persist across sessions'
   - Test: 'upgrades array populates on first load'
   - Test: 'effect calculations work after persistence load'
   - Test: 'handles corrupted purchase data gracefully'

**Test Code Reference:**
```typescript
import { UPGRADES } from '../../modules/shop/upgradeDefinitions';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Upgrade Persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    gameState$.set({
      petCount: 0,
      scrap: 0,
      upgrades: [],
      purchasedUpgrades: [],
    });
  });

  test('purchased upgrades persist across sessions', async () => {
    gameState$.upgrades.set(UPGRADES);
    gameState$.purchasedUpgrades.set(['scrap-boost-1', 'pet-boost-1']);
    gameState$.scrap.set(500);

    await saveGameState(gameState$.get());

    // Reset state (simulate app restart)
    gameState$.set({
      petCount: 0,
      scrap: 0,
      upgrades: [],
      purchasedUpgrades: [],
    });

    await initializeGameState();

    expect(gameState$.purchasedUpgrades.get()).toEqual([
      'scrap-boost-1',
      'pet-boost-1',
    ]);
    expect(gameState$.scrap.get()).toBe(500);
    expect(gameState$.upgrades.get()).toHaveLength(5);
  });

  test('upgrades array populates on first load', async () => {
    await initializeGameState();

    expect(gameState$.upgrades.get()).toHaveLength(5);
    expect(gameState$.upgrades.get()).toEqual(UPGRADES);
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Persistence scenarios covered
- [ ] First load tested
- [ ] Corrupted data handling tested

---

### Task 8.2: Run Persistence Tests
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 8.1
**Estimated Time:** 5 minutes

**Objective:** Verify persistence tests pass (implementation already done in Task 4.1).

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test -- persistence.test.ts"
```

**Acceptance Criteria:**
- [ ] All persistence tests pass
- [ ] Upgrade data persists correctly
- [ ] No test failures or errors

---

## Phase 9: Full Testing

### Task 9.1: Run Full Test Suite with Coverage
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 8.2
**Estimated Time:** 10 minutes

**Objective:** Run complete test suite and verify coverage targets met.

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test -- --coverage --watchAll=false"
```

**Coverage Targets:**
- upgradeDefinitions.ts: 100%
- gameStore.ts (new code): 100%
- AttackButtonScreen.tsx: ≥ 90%
- ShopScreen.tsx: ≥ 95%

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Coverage targets met
- [ ] No failing tests
- [ ] No console errors

---

### Task 9.2: Manual Testing - Purchase and Effects
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 9.1
**Estimated Time:** 20 minutes

**Objective:** Manually test the complete upgrade purchase and effect flow.

**Test Scenarios:**
1. **Purchase Scrap Upgrade:**
   - Launch app
   - Accumulate 100+ scrap
   - Navigate to shop
   - Purchase "Scrap Finder"
   - Return to main screen
   - Verify scrap generation increased by 10%

2. **Purchase Pet Upgrade:**
   - Accumulate 200+ scrap
   - Navigate to shop
   - Purchase "Extra Feed"
   - Return to main screen
   - Press feed button
   - Verify +2 pets gained (1 base + 1 bonus)

3. **Purchase Multiple Upgrades:**
   - Purchase multiple scrap upgrades
   - Verify effects stack additively
   - Purchase multiple pet upgrades
   - Verify effects stack additively

4. **Persistence:**
   - Purchase upgrades
   - Close app completely
   - Reopen app
   - Verify upgrades still owned
   - Verify effects still apply

**Acceptance Criteria:**
- [ ] All purchase scenarios work
- [ ] Effects apply correctly
- [ ] Stacking works
- [ ] Persistence works

---

### Task 9.3: Manual Testing - Edge Cases
**Status:** Pending
**Priority:** MEDIUM
**Dependencies:** Task 9.2
**Estimated Time:** 15 minutes

**Objective:** Test edge cases and boundary conditions.

**Test Scenarios:**
1. **Exact Scrap Amount:**
   - Set scrap to exactly 100
   - Purchase Scrap Finder
   - Verify scrap goes to 0
   - Verify purchase succeeds

2. **All Upgrades Purchased:**
   - Purchase all 5 upgrades
   - Verify maximum effects (50% scrap multiplier, +3 pet bonus)
   - Verify all show "Owned"

3. **Fresh Install:**
   - Clear app data
   - Launch app
   - Navigate to shop
   - Verify 5 upgrades display
   - Verify all show "Buy"

**Acceptance Criteria:**
- [ ] Edge cases handled gracefully
- [ ] Maximum effects work
- [ ] Fresh install works

---

## Phase 10: Documentation & Finalization

### Task 10.1: Add JSDoc Comments to Computed Observables
**Status:** Pending
**Priority:** MEDIUM
**Dependencies:** Task 9.3
**Estimated Time:** 15 minutes

**Objective:** Ensure computed observables have comprehensive JSDoc comments.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Implementation Details:**
1. Verify JSDoc on totalScrapMultiplier$ is complete (see TDD document section 5.1.1)
2. Verify JSDoc on totalPetBonus$ is complete (see TDD document section 5.1.2)
3. Add usage examples to JSDoc
4. Document the reactive behavior

**Acceptance Criteria:**
- [ ] JSDoc comments comprehensive
- [ ] Usage examples provided
- [ ] Reactive behavior documented

---

### Task 10.2: Add Inline Comments to Integration Code
**Status:** Pending
**Priority:** LOW
**Dependencies:** Task 10.1
**Estimated Time:** 10 minutes

**Objective:** Add inline comments explaining integration logic.

**Files to Modify:**
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Areas to Comment:**
1. Scrap generation timer multiplier application
2. Feed button bonus application
3. Upgrade initialization logic

**Acceptance Criteria:**
- [ ] Complex logic commented
- [ ] Integration points explained
- [ ] Comments explain "why" not just "what"

---

### Task 10.3: Final TypeScript Compilation Check
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 10.2
**Estimated Time:** 5 minutes

**Objective:** Verify TypeScript compilation is error-free.

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npx tsc --noEmit"
```

**Acceptance Criteria:**
- [ ] TypeScript compiles without errors
- [ ] No type warnings
- [ ] All imports resolve correctly

---

### Task 10.4: Final Test Run
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 10.3
**Estimated Time:** 5 minutes

**Objective:** Run all tests one final time to ensure everything still passes.

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test -- --coverage --watchAll=false"
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Coverage meets all targets
- [ ] No flaky tests
- [ ] Test suite runs cleanly

---

## Summary

### Total Tasks: 44

**By Phase:**
- Phase 1 (Type System Updates): 3 tasks
- Phase 2 (Upgrade Definitions): 6 tasks
- Phase 3 (Computed Observables): 5 tasks
- Phase 4 (Initialization): 2 tasks
- Phase 5 (Scrap Generation Integration): 3 tasks
- Phase 6 (Feed Button Integration): 4 tasks
- Phase 7 (Shop Integration Tests): 2 tasks
- Phase 8 (Persistence Tests): 2 tasks
- Phase 9 (Full Testing): 3 tasks
- Phase 10 (Documentation): 4 tasks

**By Priority:**
- HIGH: 34 tasks
- MEDIUM: 8 tasks
- LOW: 2 tasks

**Estimated Total Time:** 9-10 hours

### Key Success Metrics

1. **Functionality:**
   - ✓ 5 upgrades defined with correct values
   - ✓ Scrap multiplier affects generation
   - ✓ Pet bonus affects feed button
   - ✓ Effects stack additively
   - ✓ Purchases persist across restarts

2. **Testing:**
   - ✓ All tests pass in cmd.exe
   - ✓ Coverage targets met (≥90% for new code)
   - ✓ No console errors

3. **Quality:**
   - ✓ TypeScript compiles without errors
   - ✓ Code properly documented
   - ✓ No linting errors

4. **User Experience:**
   - ✓ Effects immediately noticeable
   - ✓ Progression balanced
   - ✓ State persists correctly

### Dependencies Graph

```
Task 1.1 (Update Upgrade Interface)
    ↓
Task 1.2 (Update scrapCost References)
    ↓
Task 1.3 (TypeScript Check)
    ↓
Task 2.1 (Tests - Data Integrity)
    ↓
Task 2.2 (Tests - Scrap Efficiency)
    ↓
Task 2.3 (Tests - Pet Acquisition)
    ↓
Task 2.4 (Tests - Balance & Helpers)
    ↓
Task 2.5 (Implement upgradeDefinitions.ts)
    ↓
Task 2.6 (Run Tests)
    ↓
Task 3.1 (Tests - totalScrapMultiplier$)
    ↓
Task 3.2 (Tests - totalPetBonus$)
    ↓
Task 3.3 (Tests - Combined Effects)
    ↓
Task 3.4 (Implement Computed Observables)
    ↓
Task 3.5 (Run gameStore Tests)
    ↓
Task 4.1 (Update initializeGameState)
    ↓
Task 4.2 (Test Initialization)
    ↓
Task 5.1 (Tests - Scrap Generation)
    ↓
Task 5.2 (Implement Scrap Multiplier)
    ↓
Task 5.3 (Run Tests)
    ↓
Task 6.1 (Tests - Feed Button)
    ↓
Task 6.2 (Implement Pet Bonus)
    ↓
Task 6.3 (Tests - Combined Effects)
    ↓
Task 6.4 (Run Tests)
    ↓
Task 7.1 (Tests - Shop Integration)
    ↓
Task 7.2 (Run ShopScreen Tests)
    ↓
Task 8.1 (Tests - Persistence)
    ↓
Task 8.2 (Run Persistence Tests)
    ↓
Task 9.1 (Full Test Suite)
    ↓
Task 9.2 (Manual Testing - Effects)
    ↓
Task 9.3 (Manual Testing - Edge Cases)
    ↓
Task 10.1 (JSDoc Comments)
    ↓
Task 10.2 (Inline Comments)
    ↓
Task 10.3 (TypeScript Check)
    ↓
Task 10.4 (Final Test Run)
```

### Notes for Execution

1. **TDD Workflow:**
   - Always write tests before implementation
   - Run tests after each implementation task
   - Expect tests to fail initially (red phase)
   - Implement minimal code to pass tests (green phase)
   - Refactor if needed (refactor phase)

2. **Testing with cmd.exe:**
   - Per project guidelines, always use cmd.exe to run Jest tests
   - Format: `cmd.exe /c "cd /mnt/c/dev/class-one-rapids/frontend && npm test"`
   - This avoids WSL/Windows slowness issues

3. **Hook Testing:**
   - Per project guidelines, test hooks through components
   - Don't create standalone hook tests
   - Integration tests are preferred

4. **File Paths:**
   - All file paths are absolute
   - Base path: `/mnt/c/dev/class-one-rapids/frontend/`
   - Ensure correct directory structure

5. **TypeScript:**
   - All code must be TypeScript
   - Strict type checking
   - No `any` types unless absolutely necessary

6. **State Management:**
   - Use Legend State observables
   - Prefer functional updates for safety
   - Wrap components with `observer` HOC

7. **Error Handling:**
   - Validate purchases before executing
   - Log warnings for invalid operations
   - Graceful degradation

8. **Integration with Existing Code:**
   - Upgrades integrate with existing gameStore
   - Uses existing types from shared/types/game.ts
   - Uses existing persistence layer
   - Shop already supports upgrade system

9. **Key Formula Reference:**
   - Scrap generation: `petCount * (1 + totalScrapMultiplier)`
   - Feed button: `1 + totalPetBonus`
   - Scrap multiplier: Sum of all scrapMultiplier effectValues
   - Pet bonus: Sum of all petBonus effectValues

---

**Ready for Execution:** This task list can be executed sequentially by an agent or developer. Each task is atomic, well-defined, and includes specific acceptance criteria.
