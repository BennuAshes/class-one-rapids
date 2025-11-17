# Shop Upgrades System Implementation Task List

## Document Control

| Version | Author | Date | Status | Source TDD |
|---------|--------|------|--------|------------|
| v1.0 | Claude Code | 2025-11-16 | Active | `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/specs/tdd_upgrades_20251116.md` |

## Overview

This task list provides granular, agent-executable tasks for implementing the Shop Upgrades System following Test-Driven Development (TDD) methodology. Each task specifies exact files to modify/create, test requirements, implementation requirements, and acceptance criteria.

**Implementation Approach**: TDD (Test First)
- Write failing tests first
- Implement minimal code to pass tests
- Refactor while keeping tests green

---

## Phase 1: Type System and Data Layer

### Task 1.1: Create Upgrade Type Definitions

**Task ID**: UPGRADE-001
**Phase**: 1 - Type System and Data Layer
**Dependencies**: None
**Estimated Effort**: 20 minutes

**Description**: Create TypeScript type definitions for the upgrade system including effect types, categories, and interfaces

**Files to Create**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/types.ts`

**Test Requirements**:
- **Test File**: None (TypeScript compilation serves as test)
- TypeScript must compile without errors

**Implementation Requirements**:
1. Create types.ts file with all type definitions:
   ```typescript
   /**
    * Type of effect an upgrade provides
    * - scrapMultiplier: Percentage bonus to scrap generation (0.1 = +10%)
    * - petBonus: Flat addition to pets gained per feed (1 = +1 pet)
    */
   export type UpgradeEffectType = 'scrapMultiplier' | 'petBonus';

   /**
    * Category of upgrade for UI grouping
    */
   export type UpgradeCategory = 'Scrap Efficiency' | 'Pet Acquisition';

   /**
    * Complete upgrade definition
    * Immutable after creation
    */
   export interface Upgrade {
     /** Unique identifier (e.g., "scrap-boost-1") */
     id: string;

     /** Display name (e.g., "Scrap Finder") */
     name: string;

     /** Effect description for UI (e.g., "+10% scrap generation from AI Pets") */
     description: string;

     /** Cost in scrap currency */
     scrapCost: number;

     /** Type of effect this upgrade provides */
     effectType: UpgradeEffectType;

     /** Numeric value of effect (meaning depends on effectType) */
     effectValue: number;

     /** Category for UI grouping */
     category: UpgradeCategory;
   }

   /**
    * Purchase state
    * Persisted to AsyncStorage
    */
   export interface PurchaseState {
     /** Array of purchased upgrade IDs */
     purchasedUpgrades: string[];

     /** Version for migration compatibility */
     version: number;

     /** Timestamp of last save */
     timestamp?: number;
   }

   /**
    * Purchase result
    * Returned from purchase transaction
    */
   export interface PurchaseResult {
     success: boolean;
     error?: PurchaseError;
   }

   /**
    * Purchase error types
    */
   export enum PurchaseError {
     INSUFFICIENT_SCRAP = 'INSUFFICIENT_SCRAP',
     ALREADY_PURCHASED = 'ALREADY_PURCHASED',
     INVALID_UPGRADE_ID = 'INVALID_UPGRADE_ID',
     PERSISTENCE_FAILED = 'PERSISTENCE_FAILED',
   }
   ```

**Acceptance Criteria**:
- [ ] File created at correct location
- [ ] TypeScript compiles without errors
- [ ] All types properly exported
- [ ] JSDoc comments present for all types

---

### Task 1.2: Create Upgrade Definitions Catalog

**Task ID**: UPGRADE-002
**Phase**: 1 - Type System and Data Layer
**Dependencies**: UPGRADE-001
**Estimated Effort**: 25 minutes

**Description**: Create immutable catalog of all 5 upgrade definitions with helper functions

**Files to Create**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/upgradeDefinitions.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/upgradeDefinitions.test.ts`
- **Tests to Add**:
  ```typescript
  import { UPGRADE_DEFINITIONS, getUpgradeById, getUpgradesByCategory } from './upgradeDefinitions';
  import { UpgradeCategory } from './types';

  describe('upgradeDefinitions', () => {
    test('exports exactly 5 upgrades', () => {
      expect(UPGRADE_DEFINITIONS).toHaveLength(5);
    });

    test('all upgrades have unique IDs', () => {
      const ids = UPGRADE_DEFINITIONS.map(u => u.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(UPGRADE_DEFINITIONS.length);
    });

    test('all upgrades have required fields', () => {
      UPGRADE_DEFINITIONS.forEach(upgrade => {
        expect(upgrade.id).toBeTruthy();
        expect(upgrade.name).toBeTruthy();
        expect(upgrade.description).toBeTruthy();
        expect(upgrade.scrapCost).toBeGreaterThan(0);
        expect(upgrade.effectType).toMatch(/scrapMultiplier|petBonus/);
        expect(upgrade.effectValue).toBeGreaterThan(0);
        expect(upgrade.category).toMatch(/Scrap Efficiency|Pet Acquisition/);
      });
    });

    test('has 3 scrap efficiency upgrades', () => {
      const scrapUpgrades = UPGRADE_DEFINITIONS.filter(
        u => u.category === 'Scrap Efficiency'
      );
      expect(scrapUpgrades).toHaveLength(3);
    });

    test('has 2 pet acquisition upgrades', () => {
      const petUpgrades = UPGRADE_DEFINITIONS.filter(
        u => u.category === 'Pet Acquisition'
      );
      expect(petUpgrades).toHaveLength(2);
    });

    test('scrap efficiency upgrades have scrapMultiplier effect', () => {
      const scrapUpgrades = UPGRADE_DEFINITIONS.filter(
        u => u.category === 'Scrap Efficiency'
      );
      scrapUpgrades.forEach(upgrade => {
        expect(upgrade.effectType).toBe('scrapMultiplier');
      });
    });

    test('pet acquisition upgrades have petBonus effect', () => {
      const petUpgrades = UPGRADE_DEFINITIONS.filter(
        u => u.category === 'Pet Acquisition'
      );
      petUpgrades.forEach(upgrade => {
        expect(upgrade.effectType).toBe('petBonus');
      });
    });

    test('getUpgradeById returns correct upgrade', () => {
      const upgrade = getUpgradeById('scrap-boost-1');
      expect(upgrade?.name).toBe('Scrap Finder');
      expect(upgrade?.scrapCost).toBe(100);
    });

    test('getUpgradeById returns undefined for invalid ID', () => {
      const upgrade = getUpgradeById('invalid-id');
      expect(upgrade).toBeUndefined();
    });

    test('getUpgradesByCategory returns scrap efficiency upgrades', () => {
      const upgrades = getUpgradesByCategory('Scrap Efficiency');
      expect(upgrades).toHaveLength(3);
      expect(upgrades.every(u => u.category === 'Scrap Efficiency')).toBe(true);
    });

    test('getUpgradesByCategory returns pet acquisition upgrades', () => {
      const upgrades = getUpgradesByCategory('Pet Acquisition');
      expect(upgrades).toHaveLength(2);
      expect(upgrades.every(u => u.category === 'Pet Acquisition')).toBe(true);
    });
  });
  ```

**Implementation Requirements**:
1. Create upgradeDefinitions.ts with complete catalog:
   ```typescript
   import { Upgrade, UpgradeCategory } from './types';

   /**
    * Complete catalog of all upgrades in the game
    * Immutable and exhaustive
    */
   export const UPGRADE_DEFINITIONS: Upgrade[] = [
     // Scrap Efficiency Upgrades
     {
       id: 'scrap-boost-1',
       name: 'Scrap Finder',
       description: '+10% scrap generation from AI Pets',
       scrapCost: 100,
       effectType: 'scrapMultiplier',
       effectValue: 0.1,
       category: 'Scrap Efficiency',
     },
     {
       id: 'scrap-boost-2',
       name: 'Scrap Magnet',
       description: '+15% scrap generation from AI Pets',
       scrapCost: 500,
       effectType: 'scrapMultiplier',
       effectValue: 0.15,
       category: 'Scrap Efficiency',
     },
     {
       id: 'scrap-boost-3',
       name: 'Scrap Amplifier',
       description: '+25% scrap generation from AI Pets',
       scrapCost: 2000,
       effectType: 'scrapMultiplier',
       effectValue: 0.25,
       category: 'Scrap Efficiency',
     },
     // Pet Acquisition Upgrades
     {
       id: 'pet-boost-1',
       name: 'Extra Feed',
       description: '+1 AI Pet per feed button press',
       scrapCost: 200,
       effectType: 'petBonus',
       effectValue: 1,
       category: 'Pet Acquisition',
     },
     {
       id: 'pet-boost-2',
       name: 'Double Feed',
       description: '+2 AI Pets per feed button press',
       scrapCost: 1000,
       effectType: 'petBonus',
       effectValue: 2,
       category: 'Pet Acquisition',
     },
   ];

   /**
    * Get upgrade by ID
    * @param id - Upgrade ID
    * @returns Upgrade definition or undefined if not found
    */
   export function getUpgradeById(id: string): Upgrade | undefined {
     return UPGRADE_DEFINITIONS.find(u => u.id === id);
   }

   /**
    * Get upgrades by category
    * @param category - Category to filter by
    * @returns Array of upgrades in category
    */
   export function getUpgradesByCategory(category: UpgradeCategory): Upgrade[] {
     return UPGRADE_DEFINITIONS.filter(u => u.category === category);
   }
   ```

**Acceptance Criteria**:
- [ ] All 11 tests pass
- [ ] Exactly 5 upgrades defined
- [ ] All upgrades have unique IDs
- [ ] Helper functions work correctly
- [ ] TypeScript compiles without errors

---

### Task 1.3: Create Persistence Layer

**Task ID**: UPGRADE-003
**Phase**: 1 - Type System and Data Layer
**Dependencies**: UPGRADE-001
**Estimated Effort**: 35 minutes

**Description**: Create AsyncStorage persistence layer with debouncing and error handling

**Files to Create**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.test.ts`
- **Tests to Add**:
  ```typescript
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { savePurchases, loadPurchases, clearPurchases } from './persistence';

  // Mock AsyncStorage
  jest.mock('@react-native-async-storage/async-storage');

  describe('persistence', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    describe('savePurchases', () => {
      test('writes to AsyncStorage with correct key', async () => {
        const savePromise = savePurchases(['scrap-boost-1', 'pet-boost-1']);

        jest.advanceTimersByTime(1000);
        await savePromise;

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'purchased-upgrades-v1',
          expect.stringContaining('"scrap-boost-1"')
        );
      });

      test('debounces multiple rapid saves', async () => {
        savePurchases(['scrap-boost-1']);
        savePurchases(['scrap-boost-1', 'scrap-boost-2']);
        const finalSave = savePurchases(['scrap-boost-1', 'scrap-boost-2', 'pet-boost-1']);

        jest.advanceTimersByTime(1000);
        await finalSave;

        expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
      });

      test('includes version and timestamp in saved data', async () => {
        const savePromise = savePurchases(['scrap-boost-1']);

        jest.advanceTimersByTime(1000);
        await savePromise;

        const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
        const parsed = JSON.parse(savedData);

        expect(parsed.version).toBe(1);
        expect(parsed.timestamp).toBeDefined();
        expect(parsed.purchasedUpgrades).toEqual(['scrap-boost-1']);
      });

      test('handles save errors gracefully', async () => {
        (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage full'));

        const savePromise = savePurchases(['scrap-boost-1']);
        jest.advanceTimersByTime(1000);

        await expect(savePromise).rejects.toThrow();
      });
    });

    describe('loadPurchases', () => {
      test('reads from AsyncStorage with correct key', async () => {
        const mockData = {
          version: 1,
          purchasedUpgrades: ['scrap-boost-1'],
          timestamp: Date.now(),
        };

        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

        const purchases = await loadPurchases();

        expect(AsyncStorage.getItem).toHaveBeenCalledWith('purchased-upgrades-v1');
        expect(purchases).toEqual(['scrap-boost-1']);
      });

      test('returns empty array if no data exists', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

        const purchases = await loadPurchases();

        expect(purchases).toEqual([]);
      });

      test('handles corrupted data gracefully', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

        const purchases = await loadPurchases();

        expect(purchases).toEqual([]);
      });

      test('handles unknown version gracefully', async () => {
        const mockData = {
          version: 999,
          purchasedUpgrades: ['scrap-boost-1'],
        };

        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

        const purchases = await loadPurchases();

        expect(purchases).toEqual([]);
      });

      test('handles load errors gracefully', async () => {
        (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Read error'));

        const purchases = await loadPurchases();

        expect(purchases).toEqual([]);
      });
    });

    describe('clearPurchases', () => {
      test('removes data from AsyncStorage', async () => {
        await clearPurchases();

        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('purchased-upgrades-v1');
      });

      test('handles clear errors gracefully', async () => {
        (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Clear error'));

        await expect(clearPurchases()).resolves.not.toThrow();
      });
    });
  });
  ```

**Implementation Requirements**:
1. Create persistence.ts with debounced AsyncStorage operations:
   ```typescript
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { PurchaseState } from '../../modules/upgrades/types';

   const STORAGE_KEY = 'purchased-upgrades-v1';
   const DEBOUNCE_MS = 1000;

   let saveTimeout: NodeJS.Timeout | null = null;

   /**
    * Save purchased upgrades to AsyncStorage with debounce
    * Multiple rapid calls within debounce window will batch into single write
    */
   export async function savePurchases(purchasedUpgrades: string[]): Promise<void> {
     // Clear existing timeout
     if (saveTimeout) {
       clearTimeout(saveTimeout);
     }

     // Schedule save after debounce period
     return new Promise((resolve, reject) => {
       saveTimeout = setTimeout(async () => {
         try {
           const data: PurchaseState = {
             version: 1,
             purchasedUpgrades,
             timestamp: Date.now(),
           };

           await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
           resolve();
         } catch (error) {
           console.error('Failed to save purchases:', error);
           reject(error);
         }
       }, DEBOUNCE_MS);
     });
   }

   /**
    * Load purchased upgrades from AsyncStorage
    * Called on app initialization
    */
   export async function loadPurchases(): Promise<string[]> {
     try {
       const raw = await AsyncStorage.getItem(STORAGE_KEY);

       if (!raw) {
         return []; // No purchases yet
       }

       const data: PurchaseState = JSON.parse(raw);

       // Version migration logic (future-proofing)
       if (data.version === 1) {
         return data.purchasedUpgrades;
       }

       // Unknown version: return empty to avoid corruption
       console.warn('Unknown purchase data version:', data.version);
       return [];
     } catch (error) {
       console.error('Failed to load purchases:', error);
       return []; // Fail gracefully
     }
   }

   /**
    * Clear all purchases (debug/testing only)
    */
   export async function clearPurchases(): Promise<void> {
     try {
       await AsyncStorage.removeItem(STORAGE_KEY);
     } catch (error) {
       console.error('Failed to clear purchases:', error);
     }
   }
   ```

**Acceptance Criteria**:
- [ ] All 11 tests pass
- [ ] Debouncing works correctly (1000ms)
- [ ] Error handling graceful
- [ ] Version support implemented
- [ ] TypeScript compiles without errors

---

## Phase 2: State Management Integration

### Task 2.1: Add Upgrade State to gameStore

**Task ID**: UPGRADE-004
**Phase**: 2 - State Management Integration
**Dependencies**: UPGRADE-002
**Estimated Effort**: 20 minutes

**Description**: Add upgrades and purchasedUpgrades observables to gameStore

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`
- **Tests to Add**:
  ```typescript
  import { UPGRADE_DEFINITIONS } from '../../modules/upgrades/upgradeDefinitions';

  describe('Upgrade State', () => {
    beforeEach(() => {
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('initializes with upgrade definitions', () => {
      expect(gameState$.upgrades.get()).toHaveLength(5);
    });

    test('initializes with empty purchased upgrades', () => {
      expect(gameState$.purchasedUpgrades.get()).toEqual([]);
    });

    test('allows adding purchased upgrade IDs', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1']);
      expect(gameState$.purchasedUpgrades.get()).toContain('scrap-boost-1');
    });

    test('upgrades observable is reactive', () => {
      const upgrades = gameState$.upgrades.get();
      expect(upgrades).toBe(UPGRADE_DEFINITIONS);
    });
  });
  ```

**Implementation Requirements**:
1. Import Upgrade type and UPGRADE_DEFINITIONS
2. Update gameState$ observable:
   ```typescript
   import { Upgrade } from '../../modules/upgrades/types';
   import { UPGRADE_DEFINITIONS } from '../../modules/upgrades/upgradeDefinitions';

   export const gameState$ = observable({
     petCount: 0,
     scrap: 0,
     upgrades: UPGRADE_DEFINITIONS as Upgrade[],
     purchasedUpgrades: [] as string[],
   });
   ```

**Acceptance Criteria**:
- [ ] All 4 tests pass
- [ ] No regressions in existing gameStore tests
- [ ] Observables properly typed
- [ ] TypeScript compiles without errors

---

### Task 2.2: Add totalScrapBonus$ Computed Observable

**Task ID**: UPGRADE-005
**Phase**: 2 - State Management Integration
**Dependencies**: UPGRADE-004
**Estimated Effort**: 30 minutes

**Description**: Create computed observable that calculates total scrap multiplier from purchased upgrades

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`
- **Tests to Add**:
  ```typescript
  describe('totalScrapBonus$', () => {
    beforeEach(() => {
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('returns 0 when no upgrades purchased', () => {
      expect(totalScrapBonus$.get()).toBe(0);
    });

    test('calculates bonus from single scrap upgrade', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1']); // +0.1
      expect(totalScrapBonus$.get()).toBe(0.1);
    });

    test('sums multiple scrap upgrades', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2']); // +0.1 + 0.15
      expect(totalScrapBonus$.get()).toBe(0.25);
    });

    test('ignores pet upgrades', () => {
      gameState$.purchasedUpgrades.set(['pet-boost-1']);
      expect(totalScrapBonus$.get()).toBe(0);
    });

    test('updates reactively when purchases change', () => {
      expect(totalScrapBonus$.get()).toBe(0);

      gameState$.purchasedUpgrades.set(['scrap-boost-1']);
      expect(totalScrapBonus$.get()).toBe(0.1);

      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-3']);
      expect(totalScrapBonus$.get()).toBe(0.35); // 0.1 + 0.25
    });

    test('calculates all three scrap upgrades correctly', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2', 'scrap-boost-3']);
      expect(totalScrapBonus$.get()).toBe(0.5); // 0.1 + 0.15 + 0.25
    });
  });
  ```

**Implementation Requirements**:
1. Add computed observable after scrapRate$:
   ```typescript
   /**
    * Computed total scrap multiplier from all purchased scrapMultiplier upgrades
    * Base: 1.0 (no bonuses)
    * With upgrades: 1.0 + sum of all purchased scrapMultiplier effectValues
    */
   export const totalScrapBonus$ = computed(() => {
     const purchasedIds = gameState$.purchasedUpgrades.get();
     const upgrades = gameState$.upgrades.get();

     const scrapUpgrades = upgrades.filter(
       u => u.effectType === 'scrapMultiplier' && purchasedIds.includes(u.id)
     );

     return scrapUpgrades.reduce((sum, upgrade) => sum + upgrade.effectValue, 0);
   });
   ```

2. Export the computed observable

**Acceptance Criteria**:
- [ ] All 6 tests pass
- [ ] Computed updates reactively
- [ ] Correctly filters by effectType
- [ ] Correctly sums effectValue
- [ ] No regressions in existing tests

---

### Task 2.3: Add totalPetBonus$ Computed Observable

**Task ID**: UPGRADE-006
**Phase**: 2 - State Management Integration
**Dependencies**: UPGRADE-005
**Estimated Effort**: 25 minutes

**Description**: Create computed observable that calculates total pet bonus from purchased upgrades

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`
- **Tests to Add**:
  ```typescript
  describe('totalPetBonus$', () => {
    beforeEach(() => {
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('returns 0 when no upgrades purchased', () => {
      expect(totalPetBonus$.get()).toBe(0);
    });

    test('calculates bonus from single pet upgrade', () => {
      gameState$.purchasedUpgrades.set(['pet-boost-1']); // +1
      expect(totalPetBonus$.get()).toBe(1);
    });

    test('sums multiple pet upgrades', () => {
      gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']); // +1 + 2
      expect(totalPetBonus$.get()).toBe(3);
    });

    test('ignores scrap upgrades', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1']);
      expect(totalPetBonus$.get()).toBe(0);
    });

    test('updates reactively when purchases change', () => {
      expect(totalPetBonus$.get()).toBe(0);

      gameState$.purchasedUpgrades.set(['pet-boost-1']);
      expect(totalPetBonus$.get()).toBe(1);

      gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);
      expect(totalPetBonus$.get()).toBe(3);
    });
  });
  ```

**Implementation Requirements**:
1. Add computed observable after totalScrapBonus$:
   ```typescript
   /**
    * Computed total pet bonus from all purchased petBonus upgrades
    * Base: 0 (no bonuses, just base 1 pet per feed)
    * With upgrades: sum of all purchased petBonus effectValues
    */
   export const totalPetBonus$ = computed(() => {
     const purchasedIds = gameState$.purchasedUpgrades.get();
     const upgrades = gameState$.upgrades.get();

     const petUpgrades = upgrades.filter(
       u => u.effectType === 'petBonus' && purchasedIds.includes(u.id)
     );

     return petUpgrades.reduce((sum, upgrade) => sum + upgrade.effectValue, 0);
   });
   ```

2. Export the computed observable

**Acceptance Criteria**:
- [ ] All 5 tests pass
- [ ] Computed updates reactively
- [ ] Correctly filters by effectType
- [ ] Correctly sums effectValue
- [ ] No regressions in existing tests

---

### Task 2.4: Update getScrapMultiplier to Use totalScrapBonus$

**Task ID**: UPGRADE-007
**Phase**: 2 - State Management Integration
**Dependencies**: UPGRADE-005
**Estimated Effort**: 20 minutes

**Description**: Update existing getScrapMultiplier function to incorporate upgrade bonuses

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`
- **Tests to Add**:
  ```typescript
  describe('getScrapMultiplier with upgrades', () => {
    beforeEach(() => {
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('returns 1.0 baseline when no upgrades', () => {
      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.0);
    });

    test('returns 1.1 with 10% upgrade', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1']);
      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.1);
    });

    test('returns 1.5 with all scrap upgrades', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2', 'scrap-boost-3']);
      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.5); // 1.0 + 0.1 + 0.15 + 0.25
    });

    test('ignores pet upgrades', () => {
      gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);
      const multiplier = getScrapMultiplier();
      expect(multiplier).toBe(1.0);
    });
  });
  ```

**Implementation Requirements**:
1. Update getScrapMultiplier function (if it exists, otherwise create it):
   ```typescript
   /**
    * Helper function for scrap multiplier calculation
    * Used in scrapRate$ computed observable
    */
   export function getScrapMultiplier(): number {
     return 1.0 + totalScrapBonus$.get();
   }
   ```

**Acceptance Criteria**:
- [ ] All 4 tests pass
- [ ] Function uses totalScrapBonus$
- [ ] Existing scrapRate$ tests still pass
- [ ] No regressions in scrap generation

---

### Task 2.5: Add Purchase Action

**Task ID**: UPGRADE-008
**Phase**: 2 - State Management Integration
**Dependencies**: UPGRADE-007, UPGRADE-006
**Estimated Effort**: 40 minutes

**Description**: Implement purchaseUpgrade action with validation and atomic transaction

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`
- **Tests to Add**:
  ```typescript
  import { PurchaseError } from '../../modules/upgrades/types';

  describe('purchaseUpgrade', () => {
    beforeEach(() => {
      gameState$.scrap.set(1000);
      gameState$.purchasedUpgrades.set([]);
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
    });

    test('successfully purchases upgrade with sufficient scrap', async () => {
      const result = await purchaseUpgrade('scrap-boost-1');

      expect(result.success).toBe(true);
      expect(gameState$.scrap.get()).toBe(900); // 1000 - 100
      expect(gameState$.purchasedUpgrades.get()).toContain('scrap-boost-1');
    });

    test('fails with insufficient scrap', async () => {
      gameState$.scrap.set(50); // Less than 100 needed

      const result = await purchaseUpgrade('scrap-boost-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe(PurchaseError.INSUFFICIENT_SCRAP);
      expect(gameState$.scrap.get()).toBe(50); // No change
      expect(gameState$.purchasedUpgrades.get()).toEqual([]); // No change
    });

    test('fails if already purchased', async () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1']);

      const result = await purchaseUpgrade('scrap-boost-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe(PurchaseError.ALREADY_PURCHASED);
      expect(gameState$.scrap.get()).toBe(1000); // No deduction
    });

    test('fails with invalid upgrade ID', async () => {
      const result = await purchaseUpgrade('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe(PurchaseError.INVALID_UPGRADE_ID);
    });

    test('deducts exact scrap cost', async () => {
      await purchaseUpgrade('scrap-boost-2'); // Costs 500

      expect(gameState$.scrap.get()).toBe(500); // 1000 - 500
    });

    test('can purchase multiple upgrades sequentially', async () => {
      await purchaseUpgrade('scrap-boost-1'); // -100
      await purchaseUpgrade('pet-boost-1');   // -200

      expect(gameState$.scrap.get()).toBe(700); // 1000 - 100 - 200
      expect(gameState$.purchasedUpgrades.get()).toEqual(['scrap-boost-1', 'pet-boost-1']);
    });

    test('purchase updates totalScrapBonus$', async () => {
      expect(totalScrapBonus$.get()).toBe(0);

      await purchaseUpgrade('scrap-boost-1');

      expect(totalScrapBonus$.get()).toBe(0.1);
    });

    test('purchase updates totalPetBonus$', async () => {
      expect(totalPetBonus$.get()).toBe(0);

      await purchaseUpgrade('pet-boost-1');

      expect(totalPetBonus$.get()).toBe(1);
    });
  });
  ```

**Implementation Requirements**:
1. Add purchaseUpgrade function:
   ```typescript
   import { PurchaseResult, PurchaseError } from '../../modules/upgrades/types';

   /**
    * Purchase an upgrade
    * Validates affordability and purchase state, then commits transaction
    *
    * @param upgradeId - ID of upgrade to purchase
    * @returns Purchase result with success status and optional error
    */
   export async function purchaseUpgrade(upgradeId: string): Promise<PurchaseResult> {
     const upgrade = gameState$.upgrades.get().find(u => u.id === upgradeId);

     // Validation: upgrade exists
     if (!upgrade) {
       return { success: false, error: PurchaseError.INVALID_UPGRADE_ID };
     }

     // Validation: not already purchased
     const alreadyPurchased = gameState$.purchasedUpgrades.get().includes(upgradeId);
     if (alreadyPurchased) {
       return { success: false, error: PurchaseError.ALREADY_PURCHASED };
     }

     // Validation: sufficient scrap
     const currentScrap = gameState$.scrap.get();
     if (currentScrap < upgrade.scrapCost) {
       return { success: false, error: PurchaseError.INSUFFICIENT_SCRAP };
     }

     // Atomic transaction: deduct scrap and record purchase
     try {
       gameState$.scrap.set(prev => prev - upgrade.scrapCost);
       gameState$.purchasedUpgrades.set(prev => [...prev, upgradeId]);

       return { success: true };
     } catch (error) {
       console.error('Purchase transaction failed:', error);
       return { success: false, error: PurchaseError.PERSISTENCE_FAILED };
     }
   }
   ```

2. Export the function

**Acceptance Criteria**:
- [ ] All 8 tests pass
- [ ] Validation works correctly
- [ ] Transaction is atomic
- [ ] Computed observables update
- [ ] No regressions in existing tests

---

### Task 2.6: Add Helper Functions for Purchase Validation

**Task ID**: UPGRADE-009
**Phase**: 2 - State Management Integration
**Dependencies**: UPGRADE-008
**Estimated Effort**: 25 minutes

**Description**: Create helper functions and error message formatter for purchase operations

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`
- **Tests to Add**:
  ```typescript
  describe('Purchase Helper Functions', () => {
    beforeEach(() => {
      gameState$.scrap.set(500);
      gameState$.purchasedUpgrades.set(['scrap-boost-1']);
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
    });

    describe('canAffordUpgrade', () => {
      test('returns true when player can afford upgrade', () => {
        expect(canAffordUpgrade('scrap-boost-1')).toBe(true); // Costs 100, have 500
      });

      test('returns false when player cannot afford upgrade', () => {
        expect(canAffordUpgrade('scrap-boost-3')).toBe(false); // Costs 2000, have 500
      });

      test('returns false for invalid upgrade ID', () => {
        expect(canAffordUpgrade('invalid-id')).toBe(false);
      });
    });

    describe('isUpgradePurchased', () => {
      test('returns true for purchased upgrade', () => {
        expect(isUpgradePurchased('scrap-boost-1')).toBe(true);
      });

      test('returns false for unpurchased upgrade', () => {
        expect(isUpgradePurchased('scrap-boost-2')).toBe(false);
      });

      test('returns false for invalid upgrade ID', () => {
        expect(isUpgradePurchased('invalid-id')).toBe(false);
      });
    });

    describe('getPurchaseErrorMessage', () => {
      test('returns message for insufficient scrap', () => {
        const message = getPurchaseErrorMessage(PurchaseError.INSUFFICIENT_SCRAP);
        expect(message).toMatch(/not enough scrap/i);
      });

      test('returns message for already purchased', () => {
        const message = getPurchaseErrorMessage(PurchaseError.ALREADY_PURCHASED);
        expect(message).toMatch(/already own/i);
      });

      test('returns message for invalid upgrade ID', () => {
        const message = getPurchaseErrorMessage(PurchaseError.INVALID_UPGRADE_ID);
        expect(message).toMatch(/not found/i);
      });

      test('returns message for persistence failed', () => {
        const message = getPurchaseErrorMessage(PurchaseError.PERSISTENCE_FAILED);
        expect(message).toMatch(/failed to save/i);
      });

      test('returns default message for undefined error', () => {
        const message = getPurchaseErrorMessage(undefined);
        expect(message).toMatch(/unknown error/i);
      });
    });
  });
  ```

**Implementation Requirements**:
1. Add helper functions:
   ```typescript
   /**
    * Check if player can afford an upgrade
    * @param upgradeId - Unique upgrade identifier
    * @returns True if player has sufficient scrap
    */
   export function canAffordUpgrade(upgradeId: string): boolean {
     const upgrade = gameState$.upgrades.get().find(u => u.id === upgradeId);
     if (!upgrade) return false;

     const currentScrap = gameState$.scrap.get();
     return currentScrap >= upgrade.scrapCost;
   }

   /**
    * Check if upgrade is already purchased
    * @param upgradeId - Unique upgrade identifier
    * @returns True if upgrade is owned
    */
   export function isUpgradePurchased(upgradeId: string): boolean {
     return gameState$.purchasedUpgrades.get().includes(upgradeId);
   }

   /**
    * Get human-readable error message for purchase failure
    * @param error - Purchase error enum value
    * @returns User-friendly error message
    */
   export function getPurchaseErrorMessage(error?: PurchaseError): string {
     switch (error) {
       case PurchaseError.INSUFFICIENT_SCRAP:
         return "Not enough scrap to purchase this upgrade.";
       case PurchaseError.ALREADY_PURCHASED:
         return "You already own this upgrade.";
       case PurchaseError.INVALID_UPGRADE_ID:
         return "Upgrade not found. Please restart the app.";
       case PurchaseError.PERSISTENCE_FAILED:
         return "Purchase successful, but failed to save. Your purchase may be lost.";
       default:
         return "An unknown error occurred.";
     }
   }
   ```

2. Export all functions

**Acceptance Criteria**:
- [ ] All 11 tests pass
- [ ] Helper functions work correctly
- [ ] Error messages are user-friendly
- [ ] All functions exported

---

### Task 2.7: Integrate Persistence with gameStore

**Task ID**: UPGRADE-010
**Phase**: 2 - State Management Integration
**Dependencies**: UPGRADE-003, UPGRADE-008
**Estimated Effort**: 30 minutes

**Description**: Add persistence onChange handler and initialization function to gameStore

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.test.ts`
- **Tests to Add**:
  ```typescript
  import { loadPurchases, savePurchases } from './persistence';

  // Mock persistence module
  jest.mock('./persistence');

  describe('Persistence Integration', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    describe('initializePurchases', () => {
      test('loads purchases from storage', async () => {
        (loadPurchases as jest.Mock).mockResolvedValue(['scrap-boost-1', 'pet-boost-1']);

        await initializePurchases();

        expect(loadPurchases).toHaveBeenCalled();
        expect(gameState$.purchasedUpgrades.get()).toEqual(['scrap-boost-1', 'pet-boost-1']);
      });

      test('handles empty storage gracefully', async () => {
        (loadPurchases as jest.Mock).mockResolvedValue([]);

        await initializePurchases();

        expect(gameState$.purchasedUpgrades.get()).toEqual([]);
      });

      test('handles load errors gracefully', async () => {
        (loadPurchases as jest.Mock).mockRejectedValue(new Error('Load failed'));

        await expect(initializePurchases()).resolves.not.toThrow();
        expect(gameState$.purchasedUpgrades.get()).toEqual([]);
      });
    });
  });
  ```

**Implementation Requirements**:
1. Import persistence functions
2. Add initialization function:
   ```typescript
   import { savePurchases, loadPurchases } from './persistence';

   /**
    * Initialize purchases from storage on app launch
    */
   export async function initializePurchases(): Promise<void> {
     try {
       const savedPurchases = await loadPurchases();
       gameState$.purchasedUpgrades.set(savedPurchases);
     } catch (error) {
       console.error('Failed to initialize purchases:', error);
       gameState$.purchasedUpgrades.set([]);
     }
   }

   // Auto-persist purchases when they change (with debounce)
   gameState$.purchasedUpgrades.onChange((changes) => {
     const newPurchases = changes.value;
     savePurchases(newPurchases).catch(error => {
       console.error('Failed to persist purchases:', error);
     });
   });
   ```

3. Export initializePurchases function

**Acceptance Criteria**:
- [ ] All 3 tests pass
- [ ] Purchases load on initialization
- [ ] onChange handler saves purchases
- [ ] Error handling graceful
- [ ] Function exported

---

### Task 2.8: Update useGameState Hook

**Task ID**: UPGRADE-011
**Phase**: 2 - State Management Integration
**Dependencies**: UPGRADE-006, UPGRADE-007
**Estimated Effort**: 20 minutes

**Description**: Add upgrade-related observables to useGameState hook return object

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useGameState.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useGameState.test.ts`
- **Tests to Add**:
  ```typescript
  import { UPGRADE_DEFINITIONS } from '../../modules/upgrades/upgradeDefinitions';

  describe('useGameState upgrade state access', () => {
    beforeEach(() => {
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('exposes upgrades$ observable', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.upgrades$).toBeDefined();
      expect(result.current.upgrades$.get()).toHaveLength(5);
    });

    test('exposes purchasedUpgrades$ observable', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.purchasedUpgrades$).toBeDefined();
      expect(result.current.purchasedUpgrades$.get()).toEqual([]);
    });

    test('exposes availableUpgrades$ computed', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.availableUpgrades$).toBeDefined();
      expect(result.current.availableUpgrades$.get()).toHaveLength(5);
    });

    test('exposes totalScrapBonus$ computed', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.totalScrapBonus$).toBeDefined();
      expect(result.current.totalScrapBonus$.get()).toBe(0);
    });

    test('exposes totalPetBonus$ computed', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.totalPetBonus$).toBeDefined();
      expect(result.current.totalPetBonus$.get()).toBe(0);
    });
  });
  ```

**Implementation Requirements**:
1. Import upgrade observables from gameStore
2. Update return object:
   ```typescript
   import {
     gameState$,
     scrapRate$,
     availableUpgrades$,
     totalScrapBonus$,
     totalPetBonus$,
   } from '../store/gameStore';

   export function useGameState() {
     return {
       petCount$: gameState$.petCount,
       scrap$: gameState$.scrap,
       scrapRate$: scrapRate$,
       upgrades$: gameState$.upgrades,
       purchasedUpgrades$: gameState$.purchasedUpgrades,
       availableUpgrades$: availableUpgrades$,
       totalScrapBonus$: totalScrapBonus$,
       totalPetBonus$: totalPetBonus$,
     };
   }
   ```

**Acceptance Criteria**:
- [ ] All 5 tests pass
- [ ] All existing useGameState tests still pass
- [ ] All observables properly exposed
- [ ] TypeScript compiles without errors

---

## Phase 3: UI Components

### Task 3.1: Create UpgradeListItem Component Structure

**Task ID**: UPGRADE-012
**Phase**: 3 - UI Components
**Dependencies**: UPGRADE-001
**Estimated Effort**: 30 minutes

**Description**: Create UpgradeListItem component with props interface and basic structure

**Files to Create**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/components/UpgradeListItem.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/components/UpgradeListItem.test.tsx`
- **Tests to Add**:
  ```typescript
  import React from 'react';
  import { render, screen } from '@testing-library/react-native';
  import { UpgradeListItem } from './UpgradeListItem';
  import { Upgrade } from '../types';

  const mockUpgrade: Upgrade = {
    id: 'test-upgrade',
    name: 'Test Upgrade',
    description: '+50% test bonus',
    scrapCost: 100,
    effectType: 'scrapMultiplier',
    effectValue: 0.5,
    category: 'Scrap Efficiency',
  };

  describe('UpgradeListItem', () => {
    describe('Initial Render', () => {
      test('renders without crashing', () => {
        render(
          <UpgradeListItem
            upgrade={mockUpgrade}
            canAfford={true}
            isPurchased={false}
            currentScrap={200}
            onPurchase={() => {}}
          />
        );
        expect(screen.toJSON()).toBeTruthy();
      });

      test('renders upgrade name', () => {
        render(
          <UpgradeListItem
            upgrade={mockUpgrade}
            canAfford={true}
            isPurchased={false}
            currentScrap={200}
            onPurchase={() => {}}
          />
        );
        expect(screen.getByText('Test Upgrade')).toBeTruthy();
      });

      test('renders upgrade description', () => {
        render(
          <UpgradeListItem
            upgrade={mockUpgrade}
            canAfford={true}
            isPurchased={false}
            currentScrap={200}
            onPurchase={() => {}}
          />
        );
        expect(screen.getByText('+50% test bonus')).toBeTruthy();
      });
    });
  });
  ```

**Implementation Requirements**:
1. Create component file with basic structure:
   ```typescript
   import React from 'react';
   import { View, Text, Pressable, StyleSheet } from 'react-native';
   import { observer } from '@legendapp/state/react';
   import { Upgrade } from '../types';

   interface UpgradeListItemProps {
     /** Upgrade definition to display */
     upgrade: Upgrade;

     /** Whether player can afford this upgrade */
     canAfford: boolean;

     /** Whether upgrade is already purchased */
     isPurchased: boolean;

     /** Current scrap balance for "need X more" calculation */
     currentScrap: number;

     /** Purchase callback */
     onPurchase: (upgradeId: string) => void;

     /** Loading state during purchase transaction */
     isPurchasing?: boolean;
   }

   export const UpgradeListItem = observer(function UpgradeListItem({
     upgrade,
     canAfford,
     isPurchased,
     currentScrap,
     onPurchase,
     isPurchasing = false,
   }: UpgradeListItemProps) {
     return (
       <View style={styles.container}>
         <View style={styles.content}>
           <Text style={styles.name}>{upgrade.name}</Text>
           <Text style={styles.description}>{upgrade.description}</Text>
           <Text style={styles.cost}>{upgrade.scrapCost} scrap</Text>
         </View>
       </View>
     );
   });

   const styles = StyleSheet.create({
     container: {
       flexDirection: 'row',
       padding: 16,
       borderBottomWidth: 1,
       borderBottomColor: '#E0E0E0',
     },
     content: {
       flex: 1,
     },
     name: {
       fontSize: 18,
       fontWeight: 'bold',
       color: '#000000',
       marginBottom: 4,
     },
     description: {
       fontSize: 14,
       color: '#666666',
       marginBottom: 8,
     },
     cost: {
       fontSize: 14,
       color: '#000000',
     },
   });
   ```

**Acceptance Criteria**:
- [ ] All 3 tests pass
- [ ] Component renders name, description, cost
- [ ] TypeScript compiles without errors
- [ ] Component wrapped with observer

---

### Task 3.2: Add Purchase Button States to UpgradeListItem

**Task ID**: UPGRADE-013
**Phase**: 3 - UI Components
**Dependencies**: UPGRADE-012
**Estimated Effort**: 40 minutes

**Description**: Implement purchase button with different visual states (available, insufficient, purchased, purchasing)

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/components/UpgradeListItem.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/components/UpgradeListItem.test.tsx`
- **Tests to Add**:
  ```typescript
  import { fireEvent } from '@testing-library/react-native';

  describe('UpgradeListItem Purchase Button', () => {
    test('shows purchase button when can afford', () => {
      render(
        <UpgradeListItem
          upgrade={mockUpgrade}
          canAfford={true}
          isPurchased={false}
          currentScrap={200}
          onPurchase={() => {}}
        />
      );

      expect(screen.getByText('Purchase')).toBeTruthy();
    });

    test('calls onPurchase when button pressed', () => {
      const mockPurchase = jest.fn();

      render(
        <UpgradeListItem
          upgrade={mockUpgrade}
          canAfford={true}
          isPurchased={false}
          currentScrap={200}
          onPurchase={mockPurchase}
        />
      );

      fireEvent.press(screen.getByText('Purchase'));

      expect(mockPurchase).toHaveBeenCalledWith('test-upgrade');
    });

    test('shows deficit when cannot afford', () => {
      render(
        <UpgradeListItem
          upgrade={mockUpgrade}
          canAfford={false}
          isPurchased={false}
          currentScrap={50}
          onPurchase={() => {}}
        />
      );

      expect(screen.getByText(/need 50 more/i)).toBeTruthy();
    });

    test('shows purchased badge when purchased', () => {
      render(
        <UpgradeListItem
          upgrade={mockUpgrade}
          canAfford={true}
          isPurchased={true}
          currentScrap={200}
          onPurchase={() => {}}
        />
      );

      expect(screen.getByText(/purchased/i)).toBeTruthy();
      expect(screen.queryByText('Purchase')).toBeNull();
    });

    test('shows purchasing state', () => {
      render(
        <UpgradeListItem
          upgrade={mockUpgrade}
          canAfford={true}
          isPurchased={false}
          currentScrap={200}
          onPurchase={() => {}}
          isPurchasing={true}
        />
      );

      expect(screen.getByText('Purchasing...')).toBeTruthy();
    });

    test('does not call onPurchase when cannot afford', () => {
      const mockPurchase = jest.fn();

      render(
        <UpgradeListItem
          upgrade={mockUpgrade}
          canAfford={false}
          isPurchased={false}
          currentScrap={50}
          onPurchase={mockPurchase}
        />
      );

      const button = screen.getByText(/need 50 more/i);
      fireEvent.press(button);

      expect(mockPurchase).not.toHaveBeenCalled();
    });
  });
  ```

**Implementation Requirements**:
1. Add button rendering logic:
   ```typescript
   const deficit = Math.max(0, upgrade.scrapCost - currentScrap);

   const handlePress = () => {
     if (canAfford && !isPurchased && !isPurchasing) {
       onPurchase(upgrade.id);
     }
   };

   const renderButton = () => {
     if (isPurchased) {
       return (
         <View style={styles.purchasedBadge}>
           <Text style={styles.purchasedText}>✓ Purchased</Text>
         </View>
       );
     }

     if (!canAfford) {
       return (
         <View style={styles.disabledButton}>
           <Text style={styles.disabledButtonText}>
             Need {deficit} more
           </Text>
         </View>
       );
     }

     return (
       <Pressable
         style={({ pressed }) => [
           styles.purchaseButton,
           pressed && styles.purchaseButtonPressed,
         ]}
         onPress={handlePress}
         disabled={isPurchasing}
         accessibilityRole="button"
         accessibilityLabel={`Purchase ${upgrade.name} for ${upgrade.scrapCost} scrap`}
       >
         <Text style={styles.purchaseButtonText}>
           {isPurchasing ? 'Purchasing...' : 'Purchase'}
         </Text>
       </Pressable>
     );
   };

   // In return:
   return (
     <View style={styles.container}>
       <View style={styles.content}>
         {/* ... existing content ... */}
       </View>
       <View style={styles.actionArea}>
         {renderButton()}
       </View>
     </View>
   );
   ```

2. Add styles:
   ```typescript
   actionArea: {
     justifyContent: 'center',
     marginLeft: 16,
   },
   purchaseButton: {
     minWidth: 44,
     minHeight: 44,
     backgroundColor: '#007AFF',
     paddingHorizontal: 16,
     paddingVertical: 8,
     borderRadius: 8,
     justifyContent: 'center',
     alignItems: 'center',
   },
   purchaseButtonPressed: {
     opacity: 0.7,
   },
   purchaseButtonText: {
     fontSize: 14,
     fontWeight: 'bold',
     color: '#FFFFFF',
   },
   disabledButton: {
     minWidth: 44,
     minHeight: 44,
     backgroundColor: '#CCCCCC',
     paddingHorizontal: 16,
     paddingVertical: 8,
     borderRadius: 8,
     justifyContent: 'center',
     alignItems: 'center',
   },
   disabledButtonText: {
     fontSize: 14,
     color: '#666666',
   },
   purchasedBadge: {
     minHeight: 44,
     paddingHorizontal: 16,
     paddingVertical: 8,
     backgroundColor: '#34C759',
     borderRadius: 8,
     justifyContent: 'center',
     alignItems: 'center',
   },
   purchasedText: {
     fontSize: 14,
     fontWeight: 'bold',
     color: '#FFFFFF',
   },
   ```

**Acceptance Criteria**:
- [ ] All 6 tests pass
- [ ] Button shows correct state
- [ ] Purchase callback fires correctly
- [ ] Deficit calculation accurate
- [ ] Accessibility attributes present

---

### Task 3.3: Add Accessibility to UpgradeListItem

**Task ID**: UPGRADE-014
**Phase**: 3 - UI Components
**Dependencies**: UPGRADE-013
**Estimated Effort**: 25 minutes

**Description**: Add comprehensive accessibility attributes to UpgradeListItem

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/components/UpgradeListItem.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/components/UpgradeListItem.test.tsx`
- **Tests to Add**:
  ```typescript
  describe('UpgradeListItem Accessibility', () => {
    test('container has accessibility label', () => {
      const { getByLabelText } = render(
        <UpgradeListItem
          upgrade={mockUpgrade}
          canAfford={true}
          isPurchased={false}
          currentScrap={200}
          onPurchase={() => {}}
        />
      );

      expect(
        getByLabelText(/test upgrade.*50% test bonus.*100 scrap/i)
      ).toBeTruthy();
    });

    test('purchase button has accessible label', () => {
      render(
        <UpgradeListItem
          upgrade={mockUpgrade}
          canAfford={true}
          isPurchased={false}
          currentScrap={200}
          onPurchase={() => {}}
        />
      );

      const button = screen.getByRole('button');
      expect(button.props.accessibilityLabel).toMatch(/purchase test upgrade for 100 scrap/i);
    });

    test('button meets minimum touch target size', () => {
      render(
        <UpgradeListItem
          upgrade={mockUpgrade}
          canAfford={true}
          isPurchased={false}
          currentScrap={200}
          onPurchase={() => {}}
        />
      );

      const button = screen.getByRole('button');
      const style = Array.isArray(button.props.style)
        ? button.props.style.reduce((acc, s) => ({ ...acc, ...s }), {})
        : button.props.style;

      expect(style.minWidth).toBeGreaterThanOrEqual(44);
      expect(style.minHeight).toBeGreaterThanOrEqual(44);
    });

    test('purchased badge has accessible label', () => {
      render(
        <UpgradeListItem
          upgrade={mockUpgrade}
          canAfford={true}
          isPurchased={true}
          currentScrap={200}
          onPurchase={() => {}}
        />
      );

      const badge = screen.getByText(/purchased/i);
      expect(badge.parent?.props.accessibilityLabel).toMatch(/test upgrade already purchased/i);
    });
  });
  ```

**Implementation Requirements**:
1. Add accessibility to container:
   ```typescript
   <View
     style={styles.container}
     accessibilityLabel={`${upgrade.name}, ${upgrade.description}, costs ${upgrade.scrapCost} scrap`}
   >
   ```

2. Update renderButton accessibility:
   ```typescript
   if (isPurchased) {
     return (
       <View
         style={styles.purchasedBadge}
         accessibilityLabel={`${upgrade.name} already purchased`}
       >
         <Text style={styles.purchasedText}>✓ Purchased</Text>
       </View>
     );
   }
   ```

**Acceptance Criteria**:
- [ ] All 4 tests pass
- [ ] All elements have proper labels
- [ ] Touch targets meet 44x44pt minimum
- [ ] Screen reader friendly

---

### Task 3.4: Create UpgradeList Component

**Task ID**: UPGRADE-015
**Phase**: 3 - UI Components
**Dependencies**: UPGRADE-014
**Estimated Effort**: 35 minutes

**Description**: Create UpgradeList component that groups upgrades by category

**Files to Create**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/components/UpgradeList.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/components/UpgradeList.test.tsx`
- **Tests to Add**:
  ```typescript
  import React from 'react';
  import { render, screen } from '@testing-library/react-native';
  import { UpgradeList } from './UpgradeList';
  import { UPGRADE_DEFINITIONS } from '../upgradeDefinitions';

  describe('UpgradeList', () => {
    test('renders without crashing', () => {
      render(
        <UpgradeList
          upgrades={UPGRADE_DEFINITIONS}
          purchasedUpgrades={[]}
          currentScrap={1000}
          onPurchase={() => {}}
        />
      );
      expect(screen.toJSON()).toBeTruthy();
    });

    test('renders all 5 upgrades', () => {
      render(
        <UpgradeList
          upgrades={UPGRADE_DEFINITIONS}
          purchasedUpgrades={[]}
          currentScrap={1000}
          onPurchase={() => {}}
        />
      );

      expect(screen.getByText('Scrap Finder')).toBeTruthy();
      expect(screen.getByText('Scrap Magnet')).toBeTruthy();
      expect(screen.getByText('Scrap Amplifier')).toBeTruthy();
      expect(screen.getByText('Extra Feed')).toBeTruthy();
      expect(screen.getByText('Double Feed')).toBeTruthy();
    });

    test('renders category headers', () => {
      render(
        <UpgradeList
          upgrades={UPGRADE_DEFINITIONS}
          purchasedUpgrades={[]}
          currentScrap={1000}
          onPurchase={() => {}}
        />
      );

      expect(screen.getByText('Scrap Efficiency')).toBeTruthy();
      expect(screen.getByText('Pet Acquisition')).toBeTruthy();
    });

    test('groups upgrades by category', () => {
      const { getAllByText } = render(
        <UpgradeList
          upgrades={UPGRADE_DEFINITIONS}
          purchasedUpgrades={[]}
          currentScrap={1000}
          onPurchase={() => {}}
        />
      );

      // Should have category header before upgrades in that category
      const scrapHeader = screen.getByText('Scrap Efficiency');
      const scrapFinder = screen.getByText('Scrap Finder');

      expect(scrapHeader).toBeTruthy();
      expect(scrapFinder).toBeTruthy();
    });

    test('filters out purchased upgrades', () => {
      render(
        <UpgradeList
          upgrades={UPGRADE_DEFINITIONS}
          purchasedUpgrades={['scrap-boost-1']}
          currentScrap={1000}
          onPurchase={() => {}}
        />
      );

      expect(screen.queryByText('Scrap Finder')).toBeNull();
      expect(screen.getByText('Scrap Magnet')).toBeTruthy();
    });

    test('hides category when all upgrades purchased', () => {
      render(
        <UpgradeList
          upgrades={UPGRADE_DEFINITIONS}
          purchasedUpgrades={['pet-boost-1', 'pet-boost-2']}
          currentScrap={1000}
          onPurchase={() => {}}
        />
      );

      expect(screen.queryByText('Pet Acquisition')).toBeNull();
      expect(screen.getByText('Scrap Efficiency')).toBeTruthy();
    });
  });
  ```

**Implementation Requirements**:
1. Create UpgradeList component:
   ```typescript
   import React from 'react';
   import { ScrollView, View, Text, StyleSheet } from 'react-native';
   import { observer } from '@legendapp/state/react';
   import { Upgrade, UpgradeCategory } from '../types';
   import { UpgradeListItem } from './UpgradeListItem';

   interface UpgradeListProps {
     /** All upgrade definitions */
     upgrades: Upgrade[];

     /** Set of purchased upgrade IDs */
     purchasedUpgrades: string[];

     /** Current scrap balance */
     currentScrap: number;

     /** Purchase handler */
     onPurchase: (upgradeId: string) => void;
   }

   export const UpgradeList = observer(function UpgradeList({
     upgrades,
     purchasedUpgrades,
     currentScrap,
     onPurchase,
   }: UpgradeListProps) {
     const categories: UpgradeCategory[] = ['Scrap Efficiency', 'Pet Acquisition'];

     // Filter out purchased upgrades
     const availableUpgrades = upgrades.filter(u => !purchasedUpgrades.includes(u.id));

     return (
       <ScrollView style={styles.container}>
         {categories.map(category => {
           const categoryUpgrades = availableUpgrades.filter(u => u.category === category);

           if (categoryUpgrades.length === 0) return null;

           return (
             <View key={category} style={styles.category}>
               <Text style={styles.categoryHeader}>{category}</Text>
               {categoryUpgrades.map(upgrade => (
                 <UpgradeListItem
                   key={upgrade.id}
                   upgrade={upgrade}
                   canAfford={currentScrap >= upgrade.scrapCost}
                   isPurchased={purchasedUpgrades.includes(upgrade.id)}
                   currentScrap={currentScrap}
                   onPurchase={onPurchase}
                 />
               ))}
             </View>
           );
         })}
       </ScrollView>
     );
   });

   const styles = StyleSheet.create({
     container: {
       flex: 1,
     },
     category: {
       marginBottom: 24,
     },
     categoryHeader: {
       fontSize: 20,
       fontWeight: 'bold',
       color: '#000000',
       paddingHorizontal: 16,
       paddingVertical: 12,
       backgroundColor: '#F5F5F5',
     },
   });
   ```

**Acceptance Criteria**:
- [ ] All 6 tests pass
- [ ] Upgrades grouped by category
- [ ] Category headers displayed
- [ ] Purchased upgrades filtered
- [ ] Empty categories hidden

---

### Task 3.5: Integrate UpgradeList into ShopScreen

**Task ID**: UPGRADE-016
**Phase**: 3 - UI Components
**Dependencies**: UPGRADE-015, UPGRADE-011
**Estimated Effort**: 35 minutes

**Description**: Replace ShopScreen placeholder with UpgradeList component and add purchase handling

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`
- **Tests to Add**:
  ```typescript
  import { UPGRADE_DEFINITIONS } from '../../upgrades/upgradeDefinitions';
  import { gameState$ } from '../../../shared/store/gameStore';
  import { fireEvent, waitFor } from '@testing-library/react-native';

  describe('ShopScreen with Upgrades', () => {
    beforeEach(() => {
      gameState$.scrap.set(1000);
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('displays upgrade list when upgrades available', () => {
      render(<ShopScreen onNavigateBack={() => {}} />);

      expect(screen.getByText('Scrap Finder')).toBeTruthy();
      expect(screen.queryByText(/no upgrades available/i)).toBeNull();
    });

    test('displays empty state when all upgrades purchased', () => {
      gameState$.purchasedUpgrades.set([
        'scrap-boost-1',
        'scrap-boost-2',
        'scrap-boost-3',
        'pet-boost-1',
        'pet-boost-2',
      ]);

      render(<ShopScreen onNavigateBack={() => {}} />);

      expect(screen.getByText(/all upgrades purchased/i)).toBeTruthy();
      expect(screen.queryByText('Scrap Finder')).toBeNull();
    });

    test('purchase button triggers purchase', async () => {
      render(<ShopScreen onNavigateBack={() => {}} />);

      const purchaseButton = screen.getAllByText('Purchase')[0];
      fireEvent.press(purchaseButton);

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBeLessThan(1000);
      });
    });

    test('shows purchasing state during transaction', async () => {
      render(<ShopScreen onNavigateBack={() => {}} />);

      const purchaseButton = screen.getAllByText('Purchase')[0];
      fireEvent.press(purchaseButton);

      expect(screen.getByText('Purchasing...')).toBeTruthy();
    });

    test('removes purchased upgrade from list', async () => {
      render(<ShopScreen onNavigateBack={() => {}} />);

      expect(screen.getByText('Scrap Finder')).toBeTruthy();

      const purchaseButton = screen.getAllByText('Purchase')[0];
      fireEvent.press(purchaseButton);

      await waitFor(() => {
        expect(screen.queryByText('Scrap Finder')).toBeNull();
      });
    });
  });
  ```

**Implementation Requirements**:
1. Import UpgradeList and necessary functions:
   ```typescript
   import { UpgradeList } from '../../upgrades/components/UpgradeList';
   import { purchaseUpgrade, getPurchaseErrorMessage } from '../../../shared/store/gameStore';
   import { useState, useCallback } from 'react';
   import { Alert } from 'react-native';
   ```

2. Add purchase handler:
   ```typescript
   const [purchasingId, setPurchasingId] = useState<string | null>(null);

   const handlePurchase = useCallback(async (upgradeId: string) => {
     setPurchasingId(upgradeId);
     try {
       const result = await purchaseUpgrade(upgradeId);
       if (!result.success) {
         Alert.alert('Purchase Failed', getPurchaseErrorMessage(result.error));
       }
     } finally {
       setPurchasingId(null);
     }
   }, []);
   ```

3. Update content rendering:
   ```typescript
   <View style={styles.content}>
     {availableUpgrades$.get().length === 0 ? (
       <View style={styles.emptyState}>
         <Text style={styles.emptyText} accessibilityRole="text">
           All upgrades purchased!
         </Text>
         <Text style={styles.emptySubtext}>
           You own all available upgrades.
         </Text>
       </View>
     ) : (
       <UpgradeList
         upgrades={availableUpgrades$.get()}
         purchasedUpgrades={purchasedUpgrades$.get()}
         currentScrap={scrap$.get()}
         onPurchase={handlePurchase}
       />
     )}
   </View>
   ```

4. Update useGameState destructuring:
   ```typescript
   const {
     scrap$,
     availableUpgrades$,
     purchasedUpgrades$,
   } = useGameState();
   ```

**Acceptance Criteria**:
- [ ] All 5 tests pass
- [ ] UpgradeList displays correctly
- [ ] Purchase handler works
- [ ] Empty state when all purchased
- [ ] Error handling present

---

## Phase 4: Game Integration

### Task 4.1: Update ClickerScreen Feed Button with Pet Bonus

**Task ID**: UPGRADE-017
**Phase**: 4 - Game Integration
**Dependencies**: UPGRADE-006
**Estimated Effort**: 30 minutes

**Description**: Modify feed button to add totalPetBonus$ to pet count increment

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/ClickerScreen.test.tsx`
- **Tests to Add**:
  ```typescript
  import { totalPetBonus$, gameState$ } from '../../shared/store/gameStore';
  import { UPGRADE_DEFINITIONS } from '../upgrades/upgradeDefinitions';

  describe('ClickerScreen Feed Button with Pet Bonus', () => {
    beforeEach(() => {
      gameState$.petCount.set(0);
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('adds 1 pet when no upgrades', () => {
      render(<ClickerScreen onNavigateToShop={() => {}} />);

      const feedButton = screen.getByRole('button', { name: /feed/i });
      fireEvent.press(feedButton);

      expect(gameState$.petCount.get()).toBe(1);
    });

    test('adds 2 pets with +1 bonus upgrade', () => {
      gameState$.purchasedUpgrades.set(['pet-boost-1']);

      render(<ClickerScreen onNavigateToShop={() => {}} />);

      const feedButton = screen.getByRole('button', { name: /feed/i });
      fireEvent.press(feedButton);

      expect(gameState$.petCount.get()).toBe(2); // 1 base + 1 bonus
    });

    test('adds 4 pets with all pet upgrades', () => {
      gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);

      render(<ClickerScreen onNavigateToShop={() => {}} />);

      const feedButton = screen.getByRole('button', { name: /feed/i });
      fireEvent.press(feedButton);

      expect(gameState$.petCount.get()).toBe(4); // 1 base + 1 + 2 bonus
    });

    test('displays pet count with bonus in button text', () => {
      gameState$.purchasedUpgrades.set(['pet-boost-1']);

      render(<ClickerScreen onNavigateToShop={() => {}} />);

      expect(screen.getByText(/feed.*\+2 pets/i)).toBeTruthy();
    });

    test('ignores scrap upgrades for pet bonus', () => {
      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2']);

      render(<ClickerScreen onNavigateToShop={() => {}} />);

      const feedButton = screen.getByRole('button', { name: /feed/i });
      fireEvent.press(feedButton);

      expect(gameState$.petCount.get()).toBe(1); // No pet bonuses
    });
  });
  ```

**Implementation Requirements**:
1. Import totalPetBonus$ in ClickerScreen
2. Update feed button onPress:
   ```typescript
   const { petCount$, scrap$, scrapRate$, totalPetBonus$ } = useGameState();

   // In feed button:
   onPress={() => {
     const basePets = 1;
     const bonus = totalPetBonus$.get();
     petCount$.set(prev => prev + basePets + bonus);
   }}
   ```

3. Update button text to show bonus:
   ```typescript
   <Text style={styles.buttonText}>
     feed (+{1 + totalPetBonus$.get()} pets)
   </Text>
   ```

**Acceptance Criteria**:
- [ ] All 5 tests pass
- [ ] Feed button adds bonus pets
- [ ] Button text shows total pets per feed
- [ ] No regressions in existing tests
- [ ] Scrap upgrades don't affect pet count

---

### Task 4.2: Initialize Upgrades in App.tsx

**Task ID**: UPGRADE-018
**Phase**: 4 - Game Integration
**Dependencies**: UPGRADE-010
**Estimated Effort**: 25 minutes

**Description**: Add upgrade initialization logic to App.tsx on mount

**Files to Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/App.tsx`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/App.test.tsx`
- **Tests to Add**:
  ```typescript
  import { initializePurchases, gameState$ } from './shared/store/gameStore';
  import { UPGRADE_DEFINITIONS } from './modules/upgrades/upgradeDefinitions';

  // Mock initializePurchases
  jest.mock('./shared/store/gameStore', () => ({
    ...jest.requireActual('./shared/store/gameStore'),
    initializePurchases: jest.fn(),
  }));

  describe('App Upgrade Initialization', () => {
    test('initializes upgrade definitions on mount', () => {
      render(<App />);

      expect(gameState$.upgrades.get()).toHaveLength(5);
    });

    test('calls initializePurchases on mount', () => {
      render(<App />);

      expect(initializePurchases).toHaveBeenCalled();
    });

    test('initializes upgrades before rendering screens', () => {
      const { getByText } = render(<App />);

      // Shop button should be available (meaning ClickerScreen rendered)
      expect(screen.getByRole('button', { name: /shop/i })).toBeTruthy();

      // Upgrades should be initialized
      expect(gameState$.upgrades.get()).toEqual(UPGRADE_DEFINITIONS);
    });
  });
  ```

**Implementation Requirements**:
1. Import necessary functions and data:
   ```typescript
   import { useEffect } from 'react';
   import { gameState$, initializePurchases } from './shared/store/gameStore';
   import { UPGRADE_DEFINITIONS } from './modules/upgrades/upgradeDefinitions';
   ```

2. Add initialization useEffect:
   ```typescript
   export default function App() {
     const [currentScreen, setCurrentScreen] = useState<Screen>('main');

     useEffect(() => {
       // Initialize upgrade definitions
       gameState$.upgrades.set(UPGRADE_DEFINITIONS);

       // Load purchased upgrades from AsyncStorage
       initializePurchases();
     }, []);

     // ... rest of component
   }
   ```

**Acceptance Criteria**:
- [ ] All 3 tests pass
- [ ] Upgrades initialized on mount
- [ ] Purchases loaded from storage
- [ ] No regressions in existing tests
- [ ] App renders correctly

---

## Phase 5: Integration Testing

### Task 5.1: Add End-to-End Purchase Flow Test

**Task ID**: UPGRADE-019
**Phase**: 5 - Integration Testing
**Dependencies**: UPGRADE-016, UPGRADE-017, UPGRADE-018
**Estimated Effort**: 40 minutes

**Description**: Create comprehensive integration test for complete purchase flow

**Files to Create**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/upgrades.integration.test.ts`

**Test Requirements**:
- **Test File**: `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/upgrades.integration.test.ts`
- **Tests to Add**:
  ```typescript
  import { gameState$, purchaseUpgrade, scrapRate$, totalScrapBonus$, totalPetBonus$ } from '../../shared/store/gameStore';
  import { UPGRADE_DEFINITIONS } from './upgradeDefinitions';

  describe('Upgrade Purchase Integration', () => {
    beforeEach(() => {
      gameState$.scrap.set(5000);
      gameState$.petCount.set(10);
      gameState$.upgrades.set(UPGRADE_DEFINITIONS);
      gameState$.purchasedUpgrades.set([]);
    });

    test('purchasing scrap upgrade increases scrap rate', async () => {
      const initialRate = scrapRate$.get();
      expect(initialRate).toBe(10); // 10 pets × 1.0 multiplier

      await purchaseUpgrade('scrap-boost-1'); // +10%

      const newRate = scrapRate$.get();
      expect(newRate).toBe(11); // 10 pets × 1.1 multiplier
    });

    test('purchasing multiple scrap upgrades stacks effects', async () => {
      await purchaseUpgrade('scrap-boost-1'); // +10%
      await purchaseUpgrade('scrap-boost-2'); // +15%

      const rate = scrapRate$.get();
      expect(rate).toBe(12); // 10 pets × 1.25 multiplier (floor)
    });

    test('purchasing pet upgrade increases pets per feed', async () => {
      const basePets = 1;

      await purchaseUpgrade('pet-boost-1'); // +1

      const bonus = totalPetBonus$.get();
      expect(basePets + bonus).toBe(2);
    });

    test('purchased upgrades removed from available list', async () => {
      const initialAvailable = gameState$.upgrades.get().length;
      expect(initialAvailable).toBe(5);

      await purchaseUpgrade('scrap-boost-1');

      // Note: availableUpgrades$ filters, but gameState$.upgrades is immutable
      const purchased = gameState$.purchasedUpgrades.get();
      expect(purchased).toContain('scrap-boost-1');
    });

    test('purchasing all upgrades', async () => {
      for (const upgrade of UPGRADE_DEFINITIONS) {
        await purchaseUpgrade(upgrade.id);
      }

      expect(gameState$.purchasedUpgrades.get()).toHaveLength(5);
    });

    test('scrap deducted correctly for each purchase', async () => {
      await purchaseUpgrade('scrap-boost-1'); // -100
      expect(gameState$.scrap.get()).toBe(4900);

      await purchaseUpgrade('scrap-boost-2'); // -500
      expect(gameState$.scrap.get()).toBe(4400);
    });

    test('all scrap upgrades give maximum 50% bonus', async () => {
      await purchaseUpgrade('scrap-boost-1'); // +0.1
      await purchaseUpgrade('scrap-boost-2'); // +0.15
      await purchaseUpgrade('scrap-boost-3'); // +0.25

      expect(totalScrapBonus$.get()).toBe(0.5);
    });

    test('all pet upgrades give +3 pets', async () => {
      await purchaseUpgrade('pet-boost-1'); // +1
      await purchaseUpgrade('pet-boost-2'); // +2

      expect(totalPetBonus$.get()).toBe(3);
    });

    test('scrap and pet upgrades work together', async () => {
      gameState$.petCount.set(100);

      // Buy scrap upgrade
      await purchaseUpgrade('scrap-boost-1'); // +10%
      expect(scrapRate$.get()).toBe(110); // 100 × 1.1

      // Buy pet upgrade
      await purchaseUpgrade('pet-boost-1'); // +1
      expect(totalPetBonus$.get()).toBe(1);

      // Scrap rate should be unchanged by pet upgrade
      expect(scrapRate$.get()).toBe(110);
    });
  });
  ```

**Implementation Requirements**:
- No code changes required
- Tests verify complete integration

**Acceptance Criteria**:
- [ ] All 10 tests pass
- [ ] Purchase flow works end-to-end
- [ ] Effects apply correctly
- [ ] Multiple purchases work
- [ ] Scrap and pet upgrades independent

---

### Task 5.2: Run Full Test Suite

**Task ID**: UPGRADE-020
**Phase**: 5 - Integration Testing
**Dependencies**: UPGRADE-019
**Estimated Effort**: 20 minutes

**Description**: Run complete test suite using cmd.exe and verify coverage

**Files to Modify**:
- None (verification task)

**Test Requirements**:
- **Command to Run**: `cmd.exe /c "npm test -- --coverage --watchAll=false"`
- **Expected Results**:
  - All tests pass (0 failures)
  - Coverage > 80% for new files:
    - All upgrades module files
    - Updated gameStore.ts
    - Updated useGameState.ts
    - Updated ClickerScreen.tsx
    - Updated App.tsx
  - No regressions in existing tests

**Implementation Requirements**:
1. Run test command via cmd.exe (per CLAUDE.md)
2. Review coverage report
3. Identify any gaps in coverage
4. Add additional tests if coverage < 80%

**Acceptance Criteria**:
- [ ] All tests pass with 0 failures
- [ ] Upgrade module coverage > 80%
- [ ] gameStore upgrade code coverage > 80%
- [ ] No regressions in existing features
- [ ] Test execution completes successfully

---

### Task 5.3: Manual Testing Checklist

**Task ID**: UPGRADE-021
**Phase**: 5 - Integration Testing
**Dependencies**: UPGRADE-020
**Estimated Effort**: 45 minutes

**Description**: Perform comprehensive manual testing on iOS and Android

**Files to Modify**:
- None (manual testing task)

**Test Requirements**:
- **Manual Test Cases**:

  **Purchase Flow**:
  1. Navigate to shop
  2. Verify all 5 upgrades display
  3. Verify scrap balance shown
  4. Purchase Scrap Finder (100 scrap)
  5. Verify scrap deducted
  6. Verify upgrade removed from list
  7. Return to main screen
  8. Verify scrap generation increased
  9. Purchase Extra Feed (200 scrap)
  10. Feed button should add 2 pets instead of 1
  11. Purchase multiple upgrades
  12. Verify effects stack correctly

  **Error Handling**:
  1. Try to purchase with insufficient scrap
  2. Verify error message shown
  3. Verify no scrap deducted
  4. Verify no upgrade recorded

  **Persistence**:
  1. Purchase 2-3 upgrades
  2. Close app completely
  3. Reopen app
  4. Verify upgrades still owned
  5. Verify effects still apply
  6. Navigate to shop
  7. Verify purchased upgrades not shown

  **UI/UX**:
  1. Verify category headers display
  2. Verify deficit shown when cannot afford
  3. Verify "Purchased" badge on owned upgrades
  4. Verify purchasing state during transaction
  5. Verify empty state when all purchased
  6. Verify smooth navigation
  7. Verify no UI glitches

**Implementation Requirements**:
- Test on iOS simulator
- Test on Android emulator
- Document any issues found
- Fix critical issues before proceeding

**Acceptance Criteria**:
- [ ] All purchase flows work correctly
- [ ] Error handling works
- [ ] Persistence works across app restarts
- [ ] UI displays correctly
- [ ] No crashes or freezes
- [ ] Performance acceptable (<100ms navigation)

---

### Task 5.4: Accessibility Audit

**Task ID**: UPGRADE-022
**Phase**: 5 - Integration Testing
**Dependencies**: UPGRADE-021
**Estimated Effort**: 30 minutes

**Description**: Test with screen readers and verify accessibility compliance

**Files to Modify**:
- None (accessibility testing task)

**Test Requirements**:
- **iOS VoiceOver Test Cases**:
  1. Enable VoiceOver
  2. Navigate to shop
  3. Swipe through upgrade list
  4. Verify each upgrade announces name, description, cost
  5. Verify purchase button announces action
  6. Verify purchased badge announces ownership
  7. Verify deficit message announces amount needed
  8. Test purchase with VoiceOver
  9. Verify focus order logical

  **Android TalkBack Test Cases**:
  1. Enable TalkBack
  2. Navigate to shop
  3. Test same scenarios as VoiceOver
  4. Verify touch exploration works
  5. Verify focus order

  **Touch Target Validation**:
  1. Verify all buttons ≥ 44x44pt
  2. Test on small screen device
  3. Verify no accidental taps

  **Color Contrast**:
  1. Verify all text meets WCAG AA (4.5:1)
  2. Check purchase button contrast
  3. Check disabled state contrast
  4. Check purchased badge contrast

**Implementation Requirements**:
- Test with VoiceOver (iOS)
- Test with TalkBack (Android)
- Measure touch targets
- Check color contrast ratios
- Fix any accessibility issues found

**Acceptance Criteria**:
- [ ] VoiceOver announces all content
- [ ] TalkBack announces all content
- [ ] Focus order is logical
- [ ] All touch targets ≥ 44x44pt
- [ ] Color contrast meets WCAG AA
- [ ] No accessibility warnings

---

### Task 5.5: Code Review and Cleanup

**Task ID**: UPGRADE-023
**Phase**: 5 - Integration Testing
**Dependencies**: UPGRADE-022
**Estimated Effort**: 30 minutes

**Description**: Final code review, remove debug code, ensure code quality

**Files to Review**:
- All files modified or created during implementation

**Test Requirements**:
- **Code Quality Checklist**:
  1. Remove all console.log statements
  2. Remove commented-out code
  3. Verify TypeScript strict mode compliance
  4. Check for unused imports
  5. Verify consistent code formatting
  6. Check for TODO comments
  7. Verify all functions have proper types
  8. Check for any hardcoded values
  9. Verify error handling complete
  10. Check all exports are necessary

**Implementation Requirements**:
1. Review each modified file
2. Remove debug code
3. Organize imports
4. Verify code formatting
5. Run tests again after cleanup

**Acceptance Criteria**:
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] All imports used and organized
- [ ] TypeScript strict mode compliance
- [ ] Consistent code formatting
- [ ] No TODO comments
- [ ] All tests still pass after cleanup
- [ ] Code is production-ready

---

## Task Summary

### Phase 1: Type System and Data Layer (3 tasks)
- UPGRADE-001: Create Type Definitions (20 min)
- UPGRADE-002: Create Upgrade Definitions (25 min)
- UPGRADE-003: Create Persistence Layer (35 min)

**Total Estimated Time**: 1 hour 20 minutes

### Phase 2: State Management Integration (8 tasks)
- UPGRADE-004: Add Upgrade State to gameStore (20 min)
- UPGRADE-005: Add totalScrapBonus$ (30 min)
- UPGRADE-006: Add totalPetBonus$ (25 min)
- UPGRADE-007: Update getScrapMultiplier (20 min)
- UPGRADE-008: Add Purchase Action (40 min)
- UPGRADE-009: Add Helper Functions (25 min)
- UPGRADE-010: Integrate Persistence (30 min)
- UPGRADE-011: Update useGameState Hook (20 min)

**Total Estimated Time**: 3 hours 30 minutes

### Phase 3: UI Components (5 tasks)
- UPGRADE-012: Create UpgradeListItem Structure (30 min)
- UPGRADE-013: Add Purchase Button States (40 min)
- UPGRADE-014: Add Accessibility (25 min)
- UPGRADE-015: Create UpgradeList (35 min)
- UPGRADE-016: Integrate into ShopScreen (35 min)

**Total Estimated Time**: 2 hours 45 minutes

### Phase 4: Game Integration (2 tasks)
- UPGRADE-017: Update Feed Button (30 min)
- UPGRADE-018: Initialize in App.tsx (25 min)

**Total Estimated Time**: 55 minutes

### Phase 5: Integration Testing (5 tasks)
- UPGRADE-019: End-to-End Test (40 min)
- UPGRADE-020: Run Full Test Suite (20 min)
- UPGRADE-021: Manual Testing (45 min)
- UPGRADE-022: Accessibility Audit (30 min)
- UPGRADE-023: Code Review (30 min)

**Total Estimated Time**: 2 hours 45 minutes

### Grand Total
**23 Tasks | ~11.5 Hours Total**

---

## Notes for Agent Execution

**TDD Methodology**:
1. Always write tests FIRST (before implementation)
2. Run tests to see them FAIL
3. Write minimal code to make tests PASS
4. Refactor while keeping tests GREEN
5. Never skip tests or write implementation first

**Testing Commands** (per CLAUDE.md):
- Run tests: `cmd.exe /c "npm test"`
- Run with coverage: `cmd.exe /c "npm test -- --coverage --watchAll=false"`
- Use cmd.exe due to WSL/Windows slowness issues

**File Paths**:
- All paths are absolute from `/mnt/c/dev/class-one-rapids/`
- Use exact paths as specified in tasks
- Create directories as needed

**Dependencies**:
- Each task lists dependencies by Task ID
- Complete tasks sequentially within phases
- Do not skip dependency tasks

**Acceptance Criteria**:
- All checkboxes must be satisfied before marking task complete
- If tests fail, fix implementation before moving on
- No partial completions

**Common Pitfalls**:
- Don't forget `observer` wrapper on components using Legend-State
- Don't forget accessibility attributes (role, label)
- Don't forget minimum 44x44pt touch targets
- Don't forget to reset state in beforeEach
- Don't forget to import types/interfaces

**Success Metrics**:
- All 23 tasks completed
- All tests passing (0 failures)
- Coverage > 80% on new code
- Manual testing successful
- Accessibility audit passed
- No regressions

---

Generated by Claude Code from TDD: `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/specs/tdd_upgrades_20251116.md`
