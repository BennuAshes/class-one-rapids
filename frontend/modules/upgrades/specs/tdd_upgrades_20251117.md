# Technical Design Document: Shop Upgrades System

**Version:** 1.0
**Date:** 2025-11-17
**Feature:** Shop Upgrades System
**Module:** `/frontend/modules/upgrades`
**Related PRD:** `prd_upgrades_20251117.md`

---

## 1. Executive Summary

This Technical Design Document provides detailed implementation specifications for the Shop Upgrades System. The system introduces 5 permanent, one-time purchase upgrades that enhance core gameplay mechanics through scrap multipliers (passive income) and pet bonuses (active progression). This document translates the PRD requirements into concrete technical specifications, including data structures, algorithms, integration points, and testing strategies.

**Key Technical Components:**
1. Type system updates to the `Upgrade` interface
2. Centralized upgrade definitions in `upgradeDefinitions.ts`
3. Computed observables for effect calculation in `gameStore.ts`
4. Integration with scrap generation timer
5. Integration with feed button handler
6. Comprehensive test coverage

**Implementation Approach:**
- Leverage existing Legend State observable patterns
- Maintain backward compatibility with existing save data
- Follow established codebase conventions and patterns
- Prioritize reactivity and performance

---

## 2. Architecture Overview

### 2.1 System Context

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│                  (Initialization Layer)                      │
│  - Calls initializeGameState()                              │
│  - Populates gameState$.upgrades from UPGRADES definition   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├───────────────┬─────────────────┐
                            ▼               ▼                 ▼
┌──────────────────────────────┐ ┌────────────────┐ ┌────────────────┐
│   AttackButtonScreen.tsx     │ │ShopScreen.tsx  │ │  gameStore.ts  │
│  (Scrap Generation + Feed)   │ │(Purchase Flow) │ │ (State & Logic)│
│                              │ │                │ │                │
│ - Scrap gen timer uses       │ │ - Displays     │ │ - gameState$   │
│   totalScrapMultiplier$      │ │   upgrades     │ │ - Computed:    │
│ - Feed button uses           │ │ - Handles      │ │   * totalScrap-│
│   totalPetBonus$             │ │   purchases    │ │     Multiplier$│
└──────────────────────────────┘ └────────────────┘ │   * totalPet-  │
                                                     │     Bonus$     │
                                                     └────────────────┘
                                                             │
                            ┌────────────────────────────────┴───────┐
                            ▼                                        ▼
                ┌───────────────────────┐              ┌──────────────────────┐
                │upgradeDefinitions.ts  │              │   persistence.ts     │
                │  (Data Source)        │              │ (AsyncStorage Layer) │
                │                       │              │                      │
                │ - UPGRADES constant   │              │ - Auto-saves changes │
                │ - 5 upgrade objects   │              │ - Debounced (1000ms) │
                └───────────────────────┘              └──────────────────────┘
```

### 2.2 Data Flow

**Initialization Flow:**
```
App Mount
  → initializeGameState()
    → Load persisted data from AsyncStorage
    → Populate gameState$ with saved state
    → Check if gameState$.upgrades is empty
      → If empty: Set to UPGRADES array
      → If populated: Preserve existing data
  → Computed observables automatically calculate from purchasedUpgrades
```

**Purchase Flow:**
```
User clicks "Buy" in ShopScreen
  → handlePurchase(upgrade)
    → Validate: !isOwned(upgrade.id)
    → Validate: scrap >= upgrade.cost
    → scrap$.set(prev => prev - upgrade.cost)
    → purchasedUpgrades$.set(prev => [...prev, upgrade.id])
      → Triggers computed observable recalculation
        → totalScrapMultiplier$ updates
        → totalPetBonus$ updates
      → Triggers persistence (debounced 1s)
        → saveGameState() writes to AsyncStorage
```

**Effect Application Flow:**
```
Scrap Generation (AttackButtonScreen):
  setInterval(1000ms)
    → petCount = petCount$.get()
    → multiplier = totalScrapMultiplier$.get()
    → scrapGenerated = petCount * (1 + multiplier)
    → scrap$.set(prev => prev + scrapGenerated)

Feed Button (AttackButtonScreen):
  handleFeed()
    → bonus = totalPetBonus$.get()
    → petsToAdd = 1 + bonus
    → petCount$.set(prev => prev + petsToAdd)
```

### 2.3 Module Structure

```
/frontend/
├── modules/
│   ├── shop/
│   │   ├── upgradeDefinitions.ts        # NEW: Upgrade data source
│   │   ├── upgradeDefinitions.test.ts   # NEW: Definition tests
│   │   ├── ShopScreen.tsx               # MODIFIED: Update scrapCost → cost
│   │   └── ShopScreen.test.tsx          # MODIFIED: Update tests
│   ├── attack-button/
│   │   ├── AttackButtonScreen.tsx       # MODIFIED: Apply multiplier & bonus
│   │   └── AttackButtonScreen.test.tsx  # MODIFIED: Test integrations
│   └── upgrades/
│       └── specs/
│           ├── prd_upgrades_20251117.md
│           └── tdd_upgrades_20251117.md # THIS DOCUMENT
├── shared/
│   ├── store/
│   │   ├── gameStore.ts                 # MODIFIED: Add computed observables
│   │   ├── gameStore.test.ts            # MODIFIED: Test calculations
│   │   └── persistence.ts               # UNCHANGED
│   └── types/
│       └── game.ts                      # MODIFIED: Update Upgrade interface
└── App.tsx                               # MODIFIED: Populate upgrades on init
```

---

## 3. Data Models

### 3.1 Type Definitions

#### 3.1.1 Updated Upgrade Interface

**Location:** `/frontend/shared/types/game.ts`

**Current State:**
```typescript
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  scrapCost: number;  // ← RENAME TO cost
  effectType: 'scrapMultiplier' | 'petBonus';
  effectValue: number;
}
```

**New State:**
```typescript
export interface Upgrade {
  /** Unique identifier for the upgrade (e.g., "scrap-boost-1") */
  id: string;

  /** Display name shown in shop (e.g., "Scrap Finder") */
  name: string;

  /** User-facing description explaining the upgrade's benefit */
  description: string;

  /** Cost in scrap to purchase this upgrade (renamed from scrapCost) */
  cost: number;

  /** Type of effect this upgrade provides */
  effectType: 'scrapMultiplier' | 'petBonus';

  /**
   * Numeric value of the effect:
   * - For scrapMultiplier: decimal multiplier (0.1 = 10%, 0.15 = 15%)
   * - For petBonus: flat integer bonus (1 = +1 pet, 2 = +2 pets)
   */
  effectValue: number;

  /**
   * Optional category for UI grouping and filtering
   * - scrapEfficiency: Upgrades that boost passive scrap generation
   * - petAcquisition: Upgrades that boost active pet gains
   */
  category?: 'scrapEfficiency' | 'petAcquisition';
}
```

**Migration Requirements:**
- Update ALL references from `upgrade.scrapCost` to `upgrade.cost`
- Files affected:
  - `/frontend/modules/shop/ShopScreen.tsx` (lines 74, 82, 141, 154, 172, 178)
  - `/frontend/modules/shop/ShopScreen.test.tsx` (if exists)
  - Any other files referencing `scrapCost`

**Validation Function (Optional Enhancement):**
```typescript
/**
 * Type guard to validate if an object conforms to the Upgrade interface.
 * Useful for runtime validation of upgrade definitions.
 */
export function isValidUpgrade(obj: unknown): obj is Upgrade {
  if (!obj || typeof obj !== 'object') return false;

  const u = obj as Record<string, unknown>;

  return (
    typeof u.id === 'string' && u.id.length > 0 &&
    typeof u.name === 'string' && u.name.length > 0 &&
    typeof u.description === 'string' && u.description.length > 0 &&
    typeof u.cost === 'number' && u.cost > 0 &&
    (u.effectType === 'scrapMultiplier' || u.effectType === 'petBonus') &&
    typeof u.effectValue === 'number' && u.effectValue > 0 &&
    (!u.category || u.category === 'scrapEfficiency' || u.category === 'petAcquisition')
  );
}
```

#### 3.1.2 GameState Interface (Unchanged)

**Location:** `/frontend/shared/types/game.ts`

```typescript
export interface GameState {
  petCount: number;
  scrap: number;
  upgrades: Upgrade[];              // Populated on initialization
  purchasedUpgrades: string[];      // IDs of owned upgrades
}
```

**No changes required** - interface already supports upgrades system.

---

## 4. Upgrade Definitions

### 4.1 upgradeDefinitions.ts

**Location:** `/frontend/modules/shop/upgradeDefinitions.ts`

**Full Implementation:**

```typescript
/**
 * Upgrade definitions for the Shop Upgrades System.
 *
 * This module contains the canonical source of truth for all upgrade data.
 * Upgrades are permanent, one-time purchases that enhance gameplay mechanics.
 *
 * @module upgradeDefinitions
 */

import { Upgrade } from '../../shared/types/game';

/**
 * Complete list of all available upgrades in the game.
 *
 * Upgrade Progression Paths:
 * 1. Scrap Efficiency (3 upgrades, 2600 total cost):
 *    - Increases passive scrap generation from AI Pets
 *    - Multipliers stack additively (10% + 15% + 25% = 50% total)
 *
 * 2. Pet Acquisition (2 upgrades, 1200 total cost):
 *    - Increases AI Pets gained per feed button press
 *    - Bonuses stack additively (+1 + +2 = +3 total)
 *
 * Total investment for all upgrades: 3800 scrap
 *
 * @constant
 * @type {Upgrade[]}
 */
export const UPGRADES: Upgrade[] = [
  // Scrap Efficiency Path
  {
    id: 'scrap-boost-1',
    name: 'Scrap Finder',
    description: 'Your AI Pets are better at finding scrap. Increases scrap generation by 10%.',
    cost: 100,
    effectType: 'scrapMultiplier',
    effectValue: 0.1,
    category: 'scrapEfficiency',
  },
  {
    id: 'scrap-boost-2',
    name: 'Scrap Magnet',
    description: 'AI Pets attract scrap from further away. Increases scrap generation by 15%.',
    cost: 500,
    effectType: 'scrapMultiplier',
    effectValue: 0.15,
    category: 'scrapEfficiency',
  },
  {
    id: 'scrap-boost-3',
    name: 'Scrap Amplifier',
    description: 'Advanced technology amplifies scrap collection. Increases scrap generation by 25%.',
    cost: 2000,
    effectType: 'scrapMultiplier',
    effectValue: 0.25,
    category: 'scrapEfficiency',
  },

  // Pet Acquisition Path
  {
    id: 'pet-boost-1',
    name: 'Extra Feed',
    description: 'Your feeding technique improves. Gain +1 additional AI Pet when feeding.',
    cost: 200,
    effectType: 'petBonus',
    effectValue: 1,
    category: 'petAcquisition',
  },
  {
    id: 'pet-boost-2',
    name: 'Double Feed',
    description: 'Master the art of feeding. Gain +2 additional AI Pets when feeding.',
    cost: 1000,
    effectType: 'petBonus',
    effectValue: 2,
    category: 'petAcquisition',
  },
];

/**
 * Helper function to get an upgrade by its ID.
 *
 * @param id - The unique identifier of the upgrade
 * @returns The upgrade object if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const upgrade = getUpgradeById('scrap-boost-1');
 * if (upgrade) {
 *   console.log(upgrade.name); // "Scrap Finder"
 * }
 * ```
 */
export function getUpgradeById(id: string): Upgrade | undefined {
  return UPGRADES.find(upgrade => upgrade.id === id);
}

/**
 * Helper function to get all upgrades of a specific category.
 *
 * @param category - The category to filter by
 * @returns Array of upgrades in the specified category
 *
 * @example
 * ```typescript
 * const scrapUpgrades = getUpgradesByCategory('scrapEfficiency');
 * console.log(scrapUpgrades.length); // 3
 * ```
 */
export function getUpgradesByCategory(
  category: 'scrapEfficiency' | 'petAcquisition'
): Upgrade[] {
  return UPGRADES.filter(upgrade => upgrade.category === category);
}

/**
 * Helper function to get all upgrades of a specific effect type.
 *
 * @param effectType - The effect type to filter by
 * @returns Array of upgrades with the specified effect type
 *
 * @example
 * ```typescript
 * const multiplierUpgrades = getUpgradesByEffectType('scrapMultiplier');
 * console.log(multiplierUpgrades.length); // 3
 * ```
 */
export function getUpgradesByEffectType(
  effectType: 'scrapMultiplier' | 'petBonus'
): Upgrade[] {
  return UPGRADES.filter(upgrade => upgrade.effectType === effectType);
}
```

**Design Rationale:**
- **Immutable Constant:** `UPGRADES` is a constant array, preventing accidental runtime modification
- **Single Source of Truth:** All upgrade data centralized in one file
- **Order Matters:** Upgrades ordered by progression (early → late within each path)
- **Helper Functions:** Optional utilities for querying upgrades (not required for MVP but useful)
- **Documentation:** Comprehensive JSDoc comments for maintainability

---

## 5. State Management

### 5.1 Game Store Updates

**Location:** `/frontend/shared/store/gameStore.ts`

#### 5.1.1 Computed Observable: totalScrapMultiplier$

**Add after gameState$ declaration:**

```typescript
import { observable, computed } from '@legendapp/state';
import { GameState } from '../types/game';
import { loadGameState, saveGameState } from './persistence';

// ... existing gameState$ declaration ...

/**
 * Computed observable that calculates the total scrap multiplier bonus
 * from all purchased scrapMultiplier upgrades.
 *
 * This value represents the ADDITIVE bonus percentage (not the final multiplier).
 * For example, if the result is 0.25, the final scrap generation rate is
 * petCount * (1 + 0.25) = petCount * 1.25
 *
 * The computation automatically updates whenever:
 * - gameState$.upgrades changes (new upgrades loaded)
 * - gameState$.purchasedUpgrades changes (upgrade purchased)
 *
 * @returns Total additive multiplier bonus (e.g., 0.25 for 25% bonus)
 *
 * @example
 * ```typescript
 * // Player owns scrap-boost-1 (0.1) and scrap-boost-2 (0.15)
 * const multiplier = totalScrapMultiplier$.get();
 * console.log(multiplier); // 0.25
 *
 * // Applied to scrap generation:
 * const scrapPerSecond = petCount * (1 + multiplier);
 * // With 10 pets: 10 * 1.25 = 12.5 scrap/second
 * ```
 */
export const totalScrapMultiplier$ = computed(() => {
  const purchased = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  return upgrades
    .filter(u => purchased.includes(u.id) && u.effectType === 'scrapMultiplier')
    .reduce((sum, u) => sum + u.effectValue, 0);
});
```

#### 5.1.2 Computed Observable: totalPetBonus$

**Add after totalScrapMultiplier$:**

```typescript
/**
 * Computed observable that calculates the total pet bonus
 * from all purchased petBonus upgrades.
 *
 * This value represents the ADDITIVE bonus count (not a multiplier).
 * For example, if the result is 3, the feed button gives
 * basePetGain + 3 pets per press.
 *
 * The computation automatically updates whenever:
 * - gameState$.upgrades changes (new upgrades loaded)
 * - gameState$.purchasedUpgrades changes (upgrade purchased)
 *
 * @returns Total additive pet bonus (e.g., 3 for +3 pets per feed)
 *
 * @example
 * ```typescript
 * // Player owns pet-boost-1 (1) and pet-boost-2 (2)
 * const bonus = totalPetBonus$.get();
 * console.log(bonus); // 3
 *
 * // Applied to feed button:
 * const petsToAdd = 1 + bonus; // 1 (base) + 3 (bonus) = 4 pets
 * petCount$.set(prev => prev + petsToAdd);
 * ```
 */
export const totalPetBonus$ = computed(() => {
  const purchased = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  return upgrades
    .filter(u => purchased.includes(u.id) && u.effectType === 'petBonus')
    .reduce((sum, u) => sum + u.effectValue, 0);
});
```

#### 5.1.3 Initialization Enhancement

**Update initializeGameState function:**

```typescript
import { UPGRADES } from '../../modules/shop/upgradeDefinitions';

/**
 * Initializes the game state from persistent storage.
 *
 * This function:
 * 1. Loads saved state from AsyncStorage
 * 2. Merges saved data with current defaults
 * 3. Populates upgrades array if empty (first run or no upgrades in save)
 * 4. Never throws errors - failures are logged and gracefully handled
 *
 * @async
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeGameState(): Promise<void> {
  try {
    const savedState = await loadGameState();

    if (savedState) {
      // Merge saved state with current state
      gameState$.set({
        ...gameState$.get(),
        ...savedState,
      });
    }

    // Populate upgrades array if empty
    // This handles both first-time initialization and backward compatibility
    // with saves that don't have upgrade definitions yet
    if (gameState$.upgrades.get().length === 0) {
      gameState$.upgrades.set(UPGRADES);
    }

    // If savedState is null, continue with current defaults
  } catch (error) {
    console.error('Error initializing game state:', error);

    // On error, ensure upgrades are still populated for a working game
    if (gameState$.upgrades.get().length === 0) {
      gameState$.upgrades.set(UPGRADES);
    }
  }
}
```

**Important Notes:**
- Check `gameState$.upgrades.get().length === 0` rather than just truthy check
- This preserves any existing upgrade data while populating empty arrays
- Handles both new users and users with existing saves gracefully
- If load fails but upgrades array is empty, still populate UPGRADES for playable game

---

## 6. Integration Points

### 6.1 Scrap Generation Integration

**Location:** `/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Current Implementation (lines 33-46):**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const petCount = petCount$.get();
    const scrapGenerated = petCount * 1;  // ← Hardcoded multiplier

    if (scrapGenerated > 0) {
      scrap$.set((prev) => prev + scrapGenerated);
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

**Updated Implementation:**
```typescript
import { useGameState } from '../../shared/hooks/useGameState';
import { totalScrapMultiplier$ } from '../../shared/store/gameStore';

export const AttackButtonScreen = observer(({ onNavigateToShop }: AttackButtonScreenProps) => {
  const { petCount$, scrap$ } = useGameState();

  /**
   * Scrap generation timer with upgrade multiplier support.
   *
   * Generates scrap passively based on current petCount and purchased upgrades.
   * Base rate: 1 scrap per pet per second
   * Modified rate: petCount * (1 + totalScrapMultiplier)
   *
   * Timer runs for the entire component lifetime (empty dependency array).
   * Uses .get() to read latest values on each tick (no need to depend on observables).
   * Updates scrap using functional update to avoid race conditions.
   * Cleanup function ensures timer is cleared on unmount.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const petCount = petCount$.get();
      const multiplier = totalScrapMultiplier$.get();
      const scrapGenerated = petCount * (1 + multiplier);

      // Only update state if scrap would actually be generated
      // This avoids unnecessary state updates, re-renders, and saves when petCount = 0
      if (scrapGenerated > 0) {
        scrap$.set((prev) => prev + scrapGenerated);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array - timer persists for component lifetime

  // ... rest of component
});
```

**Technical Details:**
- **Multiplier Application:** `petCount * (1 + multiplier)` ensures base rate of 1x when multiplier = 0
- **Performance:** `.get()` calls are lightweight and don't trigger re-renders
- **Reactivity:** Computed observable automatically recalculates when purchases happen
- **Decimal Support:** Fractional scrap (e.g., 12.5) accumulates correctly in state

**Example Scenarios:**
```typescript
// No upgrades purchased:
multiplier = 0
scrapGenerated = 10 * (1 + 0) = 10 scrap/second

// Scrap Finder purchased:
multiplier = 0.1
scrapGenerated = 10 * (1 + 0.1) = 11 scrap/second

// Scrap Finder + Scrap Magnet:
multiplier = 0.25 (0.1 + 0.15)
scrapGenerated = 10 * (1 + 0.25) = 12.5 scrap/second

// All scrap upgrades:
multiplier = 0.5 (0.1 + 0.15 + 0.25)
scrapGenerated = 10 * (1 + 0.5) = 15 scrap/second
```

### 6.2 Feed Button Integration

**Location:** `/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Current Implementation (lines 18-20):**
```typescript
const handleFeed = () => {
  petCount$.set((prev) => prev + 1);  // ← Hardcoded +1
};
```

**Updated Implementation:**
```typescript
import { totalPetBonus$ } from '../../shared/store/gameStore';

export const AttackButtonScreen = observer(({ onNavigateToShop }: AttackButtonScreenProps) => {
  const { petCount$, scrap$ } = useGameState();

  /**
   * Handles feed button press with upgrade bonus support.
   *
   * Base gain: 1 AI Pet per press
   * Modified gain: 1 + totalPetBonus
   *
   * The bonus automatically includes all purchased petBonus upgrades.
   * Effect is immediate - no delay or animation.
   */
  const handleFeed = () => {
    const bonus = totalPetBonus$.get();
    const petsToAdd = 1 + bonus;
    petCount$.set((prev) => prev + petsToAdd);
  };

  // ... rest of component
});
```

**Technical Details:**
- **Base Gain:** Hardcoded to 1 (could be extracted to constant if needed)
- **Bonus Application:** `1 + bonus` ensures base of 1 pet when bonus = 0
- **Synchronous:** No async operations, immediate state update
- **Reactivity:** Reads latest bonus value on each press

**Example Scenarios:**
```typescript
// No upgrades purchased:
bonus = 0
petsToAdd = 1 + 0 = 1 pet per press

// Extra Feed purchased:
bonus = 1
petsToAdd = 1 + 1 = 2 pets per press

// Extra Feed + Double Feed:
bonus = 3 (1 + 2)
petsToAdd = 1 + 3 = 4 pets per press
```

### 6.3 Shop Screen Updates

**Location:** `/frontend/modules/shop/ShopScreen.tsx`

**Required Changes:**

1. **Update property references** (6 locations):

```typescript
// Line 74 - UpgradeCard component (change 1)
Cost: {upgrade.cost} scrap

// Line 82 - UpgradeCard accessibility label (change 2)
accessibilityLabel={`Buy ${upgrade.name} for ${upgrade.cost} scrap`}

// Line 141 - canPurchase function (change 3)
const canPurchase = (upgrade: Upgrade): boolean => {
  return !isOwned(upgrade.id) && scrap >= upgrade.cost;
};

// Line 154 - getButtonLabel function (change 4)
if (scrap < upgrade.cost) {
  return 'Not enough scrap';
}

// Line 172 - handlePurchase validation (change 5)
if (scrap < upgrade.cost) {
  console.warn('Insufficient scrap for upgrade:', upgrade.id);
  return;
}

// Line 178 - handlePurchase deduction (change 6)
scrap$.set((prev) => prev - upgrade.cost);
```

**No other changes required** - the shop screen already supports the upgrade system architecture.

**Optional Enhancement - Category Display:**

If you want to display upgrade categories in the UI:

```typescript
// Add to UpgradeCard component
const getCategoryLabel = (category?: string): string => {
  switch (category) {
    case 'scrapEfficiency':
      return 'Scrap Efficiency';
    case 'petAcquisition':
      return 'Pet Acquisition';
    default:
      return '';
  }
};

// Add before effect container
{upgrade.category && (
  <View style={styles.categoryContainer}>
    <Text style={styles.categoryLabel}>
      {getCategoryLabel(upgrade.category)}
    </Text>
  </View>
)}

// Add to styles
categoryContainer: {
  marginBottom: 8,
},
categoryLabel: {
  fontSize: 12,
  fontWeight: '600',
  color: '#999999',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

#### 7.1.1 upgradeDefinitions.test.ts

**Location:** `/frontend/modules/shop/upgradeDefinitions.test.ts`

**Full Test Suite:**

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
        expect(upgrade.id.length).toBeGreaterThan(0);

        expect(upgrade.name).toBeTruthy();
        expect(typeof upgrade.name).toBe('string');
        expect(upgrade.name.length).toBeGreaterThan(0);

        expect(upgrade.description).toBeTruthy();
        expect(typeof upgrade.description).toBe('string');
        expect(upgrade.description.length).toBeGreaterThan(0);

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

    test('scrap-boost-2 has correct values', () => {
      const upgrade = UPGRADES.find(u => u.id === 'scrap-boost-2');

      expect(upgrade).toBeDefined();
      expect(upgrade?.name).toBe('Scrap Magnet');
      expect(upgrade?.cost).toBe(500);
      expect(upgrade?.effectType).toBe('scrapMultiplier');
      expect(upgrade?.effectValue).toBe(0.15);
      expect(upgrade?.category).toBe('scrapEfficiency');
    });

    test('scrap-boost-3 has correct values', () => {
      const upgrade = UPGRADES.find(u => u.id === 'scrap-boost-3');

      expect(upgrade).toBeDefined();
      expect(upgrade?.name).toBe('Scrap Amplifier');
      expect(upgrade?.cost).toBe(2000);
      expect(upgrade?.effectType).toBe('scrapMultiplier');
      expect(upgrade?.effectValue).toBe(0.25);
      expect(upgrade?.category).toBe('scrapEfficiency');
    });

    test('scrap efficiency path totals', () => {
      const scrapUpgrades = UPGRADES.filter(u => u.effectType === 'scrapMultiplier');

      expect(scrapUpgrades).toHaveLength(3);

      const totalCost = scrapUpgrades.reduce((sum, u) => sum + u.cost, 0);
      expect(totalCost).toBe(2600); // 100 + 500 + 2000

      const totalEffect = scrapUpgrades.reduce((sum, u) => sum + u.effectValue, 0);
      expect(totalEffect).toBeCloseTo(0.5, 5); // 0.1 + 0.15 + 0.25 = 0.5 (50%)
    });
  });

  describe('Pet Acquisition Upgrades', () => {
    test('pet-boost-1 has correct values', () => {
      const upgrade = UPGRADES.find(u => u.id === 'pet-boost-1');

      expect(upgrade).toBeDefined();
      expect(upgrade?.name).toBe('Extra Feed');
      expect(upgrade?.cost).toBe(200);
      expect(upgrade?.effectType).toBe('petBonus');
      expect(upgrade?.effectValue).toBe(1);
      expect(upgrade?.category).toBe('petAcquisition');
    });

    test('pet-boost-2 has correct values', () => {
      const upgrade = UPGRADES.find(u => u.id === 'pet-boost-2');

      expect(upgrade).toBeDefined();
      expect(upgrade?.name).toBe('Double Feed');
      expect(upgrade?.cost).toBe(1000);
      expect(upgrade?.effectType).toBe('petBonus');
      expect(upgrade?.effectValue).toBe(2);
      expect(upgrade?.category).toBe('petAcquisition');
    });

    test('pet acquisition path totals', () => {
      const petUpgrades = UPGRADES.filter(u => u.effectType === 'petBonus');

      expect(petUpgrades).toHaveLength(2);

      const totalCost = petUpgrades.reduce((sum, u) => sum + u.cost, 0);
      expect(totalCost).toBe(1200); // 200 + 1000

      const totalEffect = petUpgrades.reduce((sum, u) => sum + u.effectValue, 0);
      expect(totalEffect).toBe(3); // 1 + 2
    });
  });

  describe('Balance Validation', () => {
    test('total investment for all upgrades', () => {
      const totalCost = UPGRADES.reduce((sum, u) => sum + u.cost, 0);
      expect(totalCost).toBe(3800); // 100 + 500 + 2000 + 200 + 1000
    });

    test('costs follow progression curve', () => {
      const scrapCosts = UPGRADES
        .filter(u => u.effectType === 'scrapMultiplier')
        .map(u => u.cost)
        .sort((a, b) => a - b);

      expect(scrapCosts).toEqual([100, 500, 2000]);

      const petCosts = UPGRADES
        .filter(u => u.effectType === 'petBonus')
        .map(u => u.cost)
        .sort((a, b) => a - b);

      expect(petCosts).toEqual([200, 1000]);
    });
  });

  describe('Helper Functions', () => {
    describe('getUpgradeById', () => {
      test('returns upgrade when ID exists', () => {
        const upgrade = getUpgradeById('scrap-boost-1');
        expect(upgrade).toBeDefined();
        expect(upgrade?.id).toBe('scrap-boost-1');
      });

      test('returns undefined when ID does not exist', () => {
        const upgrade = getUpgradeById('nonexistent-id');
        expect(upgrade).toBeUndefined();
      });
    });

    describe('getUpgradesByCategory', () => {
      test('returns scrap efficiency upgrades', () => {
        const upgrades = getUpgradesByCategory('scrapEfficiency');
        expect(upgrades).toHaveLength(3);
        upgrades.forEach(u => {
          expect(u.category).toBe('scrapEfficiency');
        });
      });

      test('returns pet acquisition upgrades', () => {
        const upgrades = getUpgradesByCategory('petAcquisition');
        expect(upgrades).toHaveLength(2);
        upgrades.forEach(u => {
          expect(u.category).toBe('petAcquisition');
        });
      });
    });

    describe('getUpgradesByEffectType', () => {
      test('returns scrap multiplier upgrades', () => {
        const upgrades = getUpgradesByEffectType('scrapMultiplier');
        expect(upgrades).toHaveLength(3);
        upgrades.forEach(u => {
          expect(u.effectType).toBe('scrapMultiplier');
        });
      });

      test('returns pet bonus upgrades', () => {
        const upgrades = getUpgradesByEffectType('petBonus');
        expect(upgrades).toHaveLength(2);
        upgrades.forEach(u => {
          expect(u.effectType).toBe('petBonus');
        });
      });
    });
  });
});
```

**Test Execution:**
```bash
# Run in cmd.exe (per CLAUDE.md guidelines)
cd frontend
npm test -- upgradeDefinitions.test.ts
```

#### 7.1.2 gameStore.test.ts Additions

**Location:** `/frontend/shared/store/gameStore.test.ts`

**Add to existing test suite:**

```typescript
import { gameState$, totalScrapMultiplier$, totalPetBonus$ } from './gameStore';
import { UPGRADES } from '../../modules/shop/upgradeDefinitions';

describe('Effect Calculation Observables', () => {
  beforeEach(() => {
    // Reset state before each test
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

    test('returns 0 when upgrades array is empty', () => {
      gameState$.upgrades.set([]);
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

    test('includes all three scrap upgrades', () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set([
        'scrap-boost-1',
        'scrap-boost-2',
        'scrap-boost-3',
      ]);

      expect(totalScrapMultiplier$.get()).toBeCloseTo(0.5, 5); // 0.1 + 0.15 + 0.25
    });

    test('ignores pet bonus upgrades', () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'pet-boost-1']);

      expect(totalScrapMultiplier$.get()).toBe(0.1); // Only scrap-boost-1
    });

    test('ignores non-existent upgrade IDs', () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'nonexistent-id']);

      expect(totalScrapMultiplier$.get()).toBe(0.1); // Only scrap-boost-1
    });

    test('updates reactively when purchases change', () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set([]);

      expect(totalScrapMultiplier$.get()).toBe(0);

      gameState$.purchasedUpgrades.set(['scrap-boost-1']);
      expect(totalScrapMultiplier$.get()).toBe(0.1);

      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2']);
      expect(totalScrapMultiplier$.get()).toBeCloseTo(0.25, 5);
    });
  });

  describe('totalPetBonus$', () => {
    test('returns 0 when no upgrades are purchased', () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set([]);

      expect(totalPetBonus$.get()).toBe(0);
    });

    test('returns 0 when upgrades array is empty', () => {
      gameState$.upgrades.set([]);
      gameState$.purchasedUpgrades.set([]);

      expect(totalPetBonus$.get()).toBe(0);
    });

    test('calculates single pet bonus upgrade correctly', () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set(['pet-boost-1']);

      expect(totalPetBonus$.get()).toBe(1);
    });

    test('sums multiple pet bonus upgrades additively', () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);

      expect(totalPetBonus$.get()).toBe(3); // 1 + 2
    });

    test('ignores scrap multiplier upgrades', () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set(['pet-boost-1', 'scrap-boost-1']);

      expect(totalPetBonus$.get()).toBe(1); // Only pet-boost-1
    });

    test('ignores non-existent upgrade IDs', () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set(['pet-boost-1', 'nonexistent-id']);

      expect(totalPetBonus$.get()).toBe(1); // Only pet-boost-1
    });

    test('updates reactively when purchases change', () => {
      gameState$.upgrades.set(UPGRADES);
      gameState$.purchasedUpgrades.set([]);

      expect(totalPetBonus$.get()).toBe(0);

      gameState$.purchasedUpgrades.set(['pet-boost-1']);
      expect(totalPetBonus$.get()).toBe(1);

      gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);
      expect(totalPetBonus$.get()).toBe(3);
    });
  });

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
});
```

**Test Execution:**
```bash
# Run in cmd.exe
cd frontend
npm test -- gameStore.test.ts
```

### 7.2 Integration Tests

#### 7.2.1 ShopScreen Integration Tests

**Location:** `/frontend/modules/shop/ShopScreen.test.tsx`

**Update existing tests + add new ones:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ShopScreen } from './ShopScreen';
import { gameState$, totalScrapMultiplier$, totalPetBonus$ } from '../../shared/store/gameStore';
import { UPGRADES } from './upgradeDefinitions';

describe('ShopScreen - Upgrade Effects Integration', () => {
  beforeEach(() => {
    // Reset state and populate upgrades
    gameState$.set({
      petCount: 0,
      scrap: 5000, // Enough to buy all upgrades
      upgrades: UPGRADES,
      purchasedUpgrades: [],
    });
  });

  test('purchasing scrap multiplier upgrade updates computed observable', () => {
    const mockNavigateBack = jest.fn();
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    // Find and purchase Scrap Finder
    const buyButton = screen.getByLabelText(/Buy Scrap Finder/i);
    fireEvent.press(buyButton);

    // Check that computed observable updated
    expect(totalScrapMultiplier$.get()).toBe(0.1);

    // Check that scrap was deducted
    expect(gameState$.scrap.get()).toBe(4900); // 5000 - 100

    // Check that upgrade was marked as purchased
    expect(gameState$.purchasedUpgrades.get()).toContain('scrap-boost-1');
  });

  test('purchasing pet bonus upgrade updates computed observable', () => {
    const mockNavigateBack = jest.fn();
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    // Find and purchase Extra Feed
    const buyButton = screen.getByLabelText(/Buy Extra Feed/i);
    fireEvent.press(buyButton);

    // Check that computed observable updated
    expect(totalPetBonus$.get()).toBe(1);

    // Check that scrap was deducted
    expect(gameState$.scrap.get()).toBe(4800); // 5000 - 200

    // Check that upgrade was marked as purchased
    expect(gameState$.purchasedUpgrades.get()).toContain('pet-boost-1');
  });

  test('purchasing multiple upgrades stacks effects', () => {
    const mockNavigateBack = jest.fn();
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    // Purchase scrap-boost-1 and scrap-boost-2
    fireEvent.press(screen.getByLabelText(/Buy Scrap Finder/i));
    fireEvent.press(screen.getByLabelText(/Buy Scrap Magnet/i));

    // Check stacking
    expect(totalScrapMultiplier$.get()).toBeCloseTo(0.25, 5); // 0.1 + 0.15
    expect(gameState$.scrap.get()).toBe(4400); // 5000 - 100 - 500
  });

  test('cannot purchase upgrade without enough scrap', () => {
    gameState$.scrap.set(50); // Not enough for any upgrade

    const mockNavigateBack = jest.fn();
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    // All buy buttons should be disabled
    const buyButtons = screen.getAllByText(/Not enough scrap/i);
    expect(buyButtons.length).toBeGreaterThan(0);

    // Attempt purchase (button is disabled, but test the handler)
    fireEvent.press(buyButtons[0]);

    // State should not change
    expect(gameState$.scrap.get()).toBe(50);
    expect(gameState$.purchasedUpgrades.get()).toHaveLength(0);
  });

  test('cannot purchase already owned upgrade', () => {
    gameState$.purchasedUpgrades.set(['scrap-boost-1']);

    const mockNavigateBack = jest.fn();
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    // Find Scrap Finder (should show "Owned")
    const ownedButton = screen.getByText('Owned');
    expect(ownedButton).toBeTruthy();

    // Attempt purchase (button is disabled)
    fireEvent.press(ownedButton);

    // Scrap should not be deducted
    expect(gameState$.scrap.get()).toBe(5000);
  });

  test('displays all 5 upgrades from definitions', () => {
    const mockNavigateBack = jest.fn();
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    // Check that all upgrade names appear
    expect(screen.getByText('Scrap Finder')).toBeTruthy();
    expect(screen.getByText('Scrap Magnet')).toBeTruthy();
    expect(screen.getByText('Scrap Amplifier')).toBeTruthy();
    expect(screen.getByText('Extra Feed')).toBeTruthy();
    expect(screen.getByText('Double Feed')).toBeTruthy();
  });
});
```

#### 7.2.2 AttackButtonScreen Integration Tests

**Location:** `/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Add new integration tests:**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AttackButtonScreen } from './AttackButtonScreen';
import { gameState$, totalScrapMultiplier$, totalPetBonus$ } from '../../shared/store/gameStore';
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

      // Initial scrap
      expect(gameState$.scrap.get()).toBe(0);

      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // With 10 pets and no multiplier: 10 * 1 = 10 scrap
      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(10);
      });
    });

    test('applies scrap multiplier from purchased upgrade', async () => {
      // Purchase scrap-boost-1 (10% bonus)
      gameState$.purchasedUpgrades.set(['scrap-boost-1']);

      const mockNavigateToShop = jest.fn();
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // With 10 pets and 10% multiplier: 10 * 1.1 = 11 scrap
      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(11);
      });
    });

    test('stacks multiple scrap multipliers', async () => {
      // Purchase scrap-boost-1 and scrap-boost-2 (25% total bonus)
      gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2']);

      const mockNavigateToShop = jest.fn();
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // With 10 pets and 25% multiplier: 10 * 1.25 = 12.5 scrap
      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(12.5);
      });
    });

    test('applies maximum scrap multiplier (all upgrades)', async () => {
      // Purchase all scrap upgrades (50% total bonus)
      gameState$.purchasedUpgrades.set([
        'scrap-boost-1',
        'scrap-boost-2',
        'scrap-boost-3',
      ]);

      const mockNavigateToShop = jest.fn();
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // With 10 pets and 50% multiplier: 10 * 1.5 = 15 scrap
      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(15);
      });
    });
  });

  describe('Feed Button with Pet Bonus', () => {
    test('adds base pets without upgrades', () => {
      const mockNavigateToShop = jest.fn();
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      // Initial pet count
      expect(gameState$.petCount.get()).toBe(10);

      // Press feed button
      const feedButton = screen.getByLabelText('feed button');
      fireEvent.press(feedButton);

      // Should add 1 pet
      expect(gameState$.petCount.get()).toBe(11);
    });

    test('applies pet bonus from purchased upgrade', () => {
      // Purchase pet-boost-1 (+1 bonus)
      gameState$.purchasedUpgrades.set(['pet-boost-1']);

      const mockNavigateToShop = jest.fn();
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      // Press feed button
      const feedButton = screen.getByLabelText('feed button');
      fireEvent.press(feedButton);

      // Should add 2 pets (1 base + 1 bonus)
      expect(gameState$.petCount.get()).toBe(12);
    });

    test('stacks multiple pet bonuses', () => {
      // Purchase both pet upgrades (+3 total bonus)
      gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);

      const mockNavigateToShop = jest.fn();
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      // Press feed button
      const feedButton = screen.getByLabelText('feed button');
      fireEvent.press(feedButton);

      // Should add 4 pets (1 base + 3 bonus)
      expect(gameState$.petCount.get()).toBe(14);
    });

    test('bonus applies to multiple feed presses', () => {
      gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);

      const mockNavigateToShop = jest.fn();
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      const feedButton = screen.getByLabelText('feed button');

      // Press 3 times
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);
      fireEvent.press(feedButton);

      // Should add 12 pets total (4 per press × 3)
      expect(gameState$.petCount.get()).toBe(22); // 10 initial + 12
    });
  });

  describe('Combined Upgrade Effects', () => {
    test('scrap multiplier and pet bonus work independently', async () => {
      // Purchase one of each type
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

    test('all upgrades purchased - maximum effects', async () => {
      // Purchase everything
      gameState$.purchasedUpgrades.set([
        'scrap-boost-1',
        'scrap-boost-2',
        'scrap-boost-3',
        'pet-boost-1',
        'pet-boost-2',
      ]);

      const mockNavigateToShop = jest.fn();
      render(<AttackButtonScreen onNavigateToShop={mockNavigateToShop} />);

      // Test maximum scrap generation
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(15); // 10 * 1.5
      });

      // Test maximum pet bonus
      const feedButton = screen.getByLabelText('feed button');
      fireEvent.press(feedButton);

      expect(gameState$.petCount.get()).toBe(14); // 10 + (1 + 3)
    });
  });
});
```

**Test Execution:**
```bash
# Run in cmd.exe
cd frontend
npm test -- AttackButtonScreen.test.tsx
```

### 7.3 Persistence Tests

**Location:** `/frontend/shared/store/persistence.test.ts` (additions)

```typescript
import { gameState$, initializeGameState } from './gameStore';
import { saveGameState, loadGameState } from './persistence';
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
    // Set up initial state with purchases
    gameState$.upgrades.set(UPGRADES);
    gameState$.purchasedUpgrades.set(['scrap-boost-1', 'pet-boost-1']);
    gameState$.scrap.set(500);

    // Save state
    await saveGameState(gameState$.get());

    // Reset state (simulate app restart)
    gameState$.set({
      petCount: 0,
      scrap: 0,
      upgrades: [],
      purchasedUpgrades: [],
    });

    // Load state
    await initializeGameState();

    // Verify purchased upgrades were restored
    expect(gameState$.purchasedUpgrades.get()).toEqual([
      'scrap-boost-1',
      'pet-boost-1',
    ]);
    expect(gameState$.scrap.get()).toBe(500);
    expect(gameState$.upgrades.get()).toHaveLength(5); // UPGRADES populated
  });

  test('upgrades array populates on first load', async () => {
    // Simulate first-time user (no saved state)
    await initializeGameState();

    // Upgrades should be populated from definitions
    expect(gameState$.upgrades.get()).toHaveLength(5);
    expect(gameState$.upgrades.get()).toEqual(UPGRADES);
  });

  test('effect calculations work after persistence load', async () => {
    // Save state with purchases
    gameState$.upgrades.set(UPGRADES);
    gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2']);
    await saveGameState(gameState$.get());

    // Reset
    gameState$.set({
      petCount: 0,
      scrap: 0,
      upgrades: [],
      purchasedUpgrades: [],
    });

    // Load
    await initializeGameState();

    // Verify computed observables work
    const { totalScrapMultiplier$ } = require('./gameStore');
    expect(totalScrapMultiplier$.get()).toBeCloseTo(0.25, 5); // 0.1 + 0.15
  });

  test('handles corrupted purchase data gracefully', async () => {
    // Save state with invalid purchase IDs
    gameState$.upgrades.set(UPGRADES);
    gameState$.purchasedUpgrades.set([
      'scrap-boost-1',
      'invalid-id',
      'another-invalid',
    ]);
    await saveGameState(gameState$.get());

    // Reset and load
    gameState$.set({
      petCount: 0,
      scrap: 0,
      upgrades: [],
      purchasedUpgrades: [],
    });
    await initializeGameState();

    // Verify only valid purchases are counted
    const { totalScrapMultiplier$ } = require('./gameStore');
    expect(totalScrapMultiplier$.get()).toBe(0.1); // Only scrap-boost-1
  });
});
```

### 7.4 Test Coverage Goals

**Coverage Targets:**
- `upgradeDefinitions.ts`: 100% (data definitions, should be fully testable)
- `gameStore.ts` (new code): 100% (computed observables must be fully tested)
- `AttackButtonScreen.tsx` (modified code): 90%+ (integration with upgrades)
- `ShopScreen.tsx` (modified code): 95%+ (purchase flow with effects)

**Running Full Test Suite:**
```bash
# Run in cmd.exe
cd frontend
npm test -- --coverage --watchAll=false
```

---

## 8. Performance Considerations

### 8.1 Computed Observable Performance

**Optimization Strategy:**
- Legend State's `computed()` memoizes results automatically
- Recalculation only occurs when dependencies change:
  - `gameState$.purchasedUpgrades` changes (upgrade purchased)
  - `gameState$.upgrades` changes (definitions loaded)
- `.get()` calls in timers/handlers are O(1) lookups (no recalculation unless dependencies changed)

**Benchmark Expectations:**
```typescript
// Computed observable recalculation time
totalScrapMultiplier$.get() // < 0.1ms (5 upgrades, simple filter+reduce)
totalPetBonus$.get()        // < 0.1ms (5 upgrades, simple filter+reduce)
```

**Scaling:**
- Current: 5 upgrades → negligible performance impact
- Future: 50+ upgrades → still < 1ms per calculation
- Break-even point: ~1000 upgrades (not realistic for this game)

### 8.2 Scrap Generation Timer

**Current Implementation:**
```typescript
setInterval(() => {
  const petCount = petCount$.get();        // O(1)
  const multiplier = totalScrapMultiplier$.get(); // O(1) cached
  const scrapGenerated = petCount * (1 + multiplier); // O(1)

  if (scrapGenerated > 0) {
    scrap$.set((prev) => prev + scrapGenerated); // O(1)
  }
}, 1000);
```

**Performance Analysis:**
- Total operation: < 1ms per tick
- No frame drops expected
- Conditional update (`if (scrapGenerated > 0)`) avoids unnecessary state changes

### 8.3 Decimal Accumulation

**Concern:** Fractional scrap values (e.g., 12.5 scrap/second) could cause floating-point errors

**Mitigation:**
- JavaScript Number type uses IEEE 754 double precision (safe up to 2^53)
- Scrap accumulation is additive (no multiplication chains)
- Precision loss negligible for reasonable play sessions (< 0.0001 scrap over 1000 hours)

**Example:**
```typescript
// After 1 hour with 10 pets and 25% multiplier:
scrapGenerated = 10 * 1.25 = 12.5 per second
totalScrap = 12.5 * 3600 = 45000 scrap (exact, no precision loss)
```

**Optional Enhancement (Not Required):**
If precision becomes an issue in the future, consider integer-based accumulation:
```typescript
// Store scrap as integer cents (scrapCents / 100 = actual scrap)
const scrapGenerated = Math.round(petCount * (1 + multiplier) * 100);
scrapCents$.set(prev => prev + scrapGenerated);
```

### 8.4 Persistence Debouncing

**Current Setup:**
- Debounce delay: 1000ms (1 second)
- Triggers on any `gameState$` change

**Impact of Upgrades:**
- Purchasing an upgrade triggers 2 state changes:
  1. `scrap` decreases (cost deduction)
  2. `purchasedUpgrades` array updated
- Both changes batched within single debounce window
- Result: 1 save operation per purchase (optimal)

**No changes needed** - existing debounce strategy handles upgrades efficiently.

---

## 9. Error Handling

### 9.1 Initialization Errors

**Scenario:** Upgrade definitions fail to load or populate

**Handling:**
```typescript
export async function initializeGameState(): Promise<void> {
  try {
    const savedState = await loadGameState();
    // ... load logic ...
  } catch (error) {
    console.error('Error initializing game state:', error);

    // Ensure upgrades are still populated for a working game
    if (gameState$.upgrades.get().length === 0) {
      gameState$.upgrades.set(UPGRADES);
    }
  }
}
```

**Fallback:** Always populate UPGRADES on error to ensure playable state

### 9.2 Invalid Purchase Data

**Scenario:** Persisted `purchasedUpgrades` contains invalid IDs

**Handling:**
```typescript
// Computed observables naturally handle this via filter
export const totalScrapMultiplier$ = computed(() => {
  const purchased = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  // .filter() safely ignores IDs that don't match any upgrade
  return upgrades
    .filter(u => purchased.includes(u.id) && u.effectType === 'scrapMultiplier')
    .reduce((sum, u) => sum + u.effectValue, 0);
});
```

**Result:** Invalid IDs silently ignored, effects calculated from valid purchases only

### 9.3 Race Conditions

**Scenario:** User purchases upgrade while scrap generation timer is running

**Handling:**
- All state updates use functional setters: `set(prev => prev + amount)`
- Legend State ensures atomic updates (no race conditions)
- Computed observables recalculate synchronously after state change
- Next timer tick reads updated multiplier via `.get()`

**No additional handling needed** - Legend State architecture prevents races

### 9.4 Duplicate Purchases

**Scenario:** User attempts to purchase already-owned upgrade

**Handling:**
```typescript
const handlePurchase = (upgrade: Upgrade): void => {
  // Validation: prevent purchasing already owned upgrades
  if (isOwned(upgrade.id)) {
    console.warn('Upgrade already owned:', upgrade.id);
    return; // Early exit
  }

  // ... rest of purchase logic ...
};
```

**UI Prevention:**
- Button disabled when `isOwned(upgrade.id) === true`
- Button text shows "Owned" instead of "Buy"
- Accessibility state set to `disabled: true`

### 9.5 Insufficient Scrap

**Scenario:** User attempts to purchase without enough scrap

**Handling:**
```typescript
const handlePurchase = (upgrade: Upgrade): void => {
  // Validation: ensure player has enough scrap
  if (scrap < upgrade.cost) {
    console.warn('Insufficient scrap for upgrade:', upgrade.id);
    return; // Early exit
  }

  // ... rest of purchase logic ...
};
```

**UI Prevention:**
- Button disabled when `scrap < upgrade.cost`
- Button text shows "Not enough scrap" instead of "Buy"
- Accessibility state set to `disabled: true`

---

## 10. Migration and Backward Compatibility

### 10.1 Type Migration: scrapCost → cost

**Impact:** Breaking change for existing code

**Migration Steps:**

1. **Global Search:**
```bash
# Find all usages
grep -r "scrapCost" frontend/
```

2. **Files to Update:**
```
frontend/modules/shop/ShopScreen.tsx (6 occurrences)
frontend/modules/shop/ShopScreen.test.tsx (if exists)
```

3. **Find and Replace:**
```typescript
// Before
upgrade.scrapCost

// After
upgrade.cost
```

4. **Verification:**
- TypeScript compiler will catch any missed references
- Run `npm run tsc` to verify no compilation errors

### 10.2 Persisted Data Migration

**Scenario:** Existing save data with empty `upgrades` array

**Handling:**
```typescript
// In initializeGameState()
if (gameState$.upgrades.get().length === 0) {
  gameState$.upgrades.set(UPGRADES);
}
```

**Result:** Seamlessly upgrades old saves to new format

**Scenario:** Existing save data with populated `upgrades` array (different data)

**Handling:**
```typescript
// Length check prevents overwriting existing data
if (gameState$.upgrades.get().length === 0) {
  // Only populate if truly empty
}
```

**Result:** Preserves any custom or future upgrade data

### 10.3 Testing Migration

**Test Plan:**

1. **Fresh Install:**
   - Install app
   - Verify UPGRADES populates
   - Verify shop shows 5 upgrades

2. **Existing User (No Upgrades):**
   - Simulate old save data: `{ petCount: 100, scrap: 500, upgrades: [], purchasedUpgrades: [] }`
   - Load app
   - Verify UPGRADES populates
   - Verify existing petCount and scrap preserved

3. **Existing User (With Purchases):**
   - Simulate save data: `{ petCount: 100, scrap: 500, upgrades: UPGRADES, purchasedUpgrades: ['scrap-boost-1'] }`
   - Load app
   - Verify upgrade data preserved
   - Verify purchased upgrades still owned
   - Verify effects still apply

---

## 11. Implementation Checklist

### Phase 1: Type System Updates
- [ ] Update `Upgrade` interface in `/frontend/shared/types/game.ts`
  - [ ] Change `scrapCost: number` to `cost: number`
  - [ ] Add `category?: 'scrapEfficiency' | 'petAcquisition'`
  - [ ] Update JSDoc comments
- [ ] Search codebase for `scrapCost` references
  - [ ] Update `/frontend/modules/shop/ShopScreen.tsx` (6 locations)
  - [ ] Update `/frontend/modules/shop/ShopScreen.test.tsx` (if exists)
- [ ] Run `npm run tsc` to verify no compilation errors
- [ ] Commit: "refactor: rename scrapCost to cost in Upgrade interface"

### Phase 2: Upgrade Definitions
- [ ] Create `/frontend/modules/shop/upgradeDefinitions.ts`
  - [ ] Define `UPGRADES` constant array with 5 upgrades
  - [ ] Verify all IDs unique
  - [ ] Verify all costs correct (100, 500, 2000, 200, 1000)
  - [ ] Verify all effect values correct (0.1, 0.15, 0.25, 1, 2)
  - [ ] Add helper functions (optional)
  - [ ] Add JSDoc comments
- [ ] Create `/frontend/modules/shop/upgradeDefinitions.test.ts`
  - [ ] Test data integrity (5 upgrades, unique IDs, all properties present)
  - [ ] Test scrap efficiency upgrades (correct values)
  - [ ] Test pet acquisition upgrades (correct values)
  - [ ] Test balance (total costs, progression)
  - [ ] Test helper functions (if implemented)
- [ ] Run tests: `npm test -- upgradeDefinitions.test.ts`
- [ ] Verify 100% coverage for upgradeDefinitions.ts
- [ ] Commit: "feat: add upgrade definitions with 5 upgrades"

### Phase 3: Computed Observables
- [ ] Update `/frontend/shared/store/gameStore.ts`
  - [ ] Import `computed` from Legend State
  - [ ] Add `totalScrapMultiplier$` computed observable
  - [ ] Add `totalPetBonus$` computed observable
  - [ ] Add JSDoc comments for both
  - [ ] Export both observables
- [ ] Update `/frontend/shared/store/gameStore.test.ts`
  - [ ] Add test suite for `totalScrapMultiplier$`
    - [ ] Test with 0 upgrades
    - [ ] Test with 1 upgrade
    - [ ] Test with multiple upgrades (stacking)
    - [ ] Test with all 3 scrap upgrades
    - [ ] Test ignoring pet upgrades
    - [ ] Test reactive updates
  - [ ] Add test suite for `totalPetBonus$`
    - [ ] Test with 0 upgrades
    - [ ] Test with 1 upgrade
    - [ ] Test with both pet upgrades (stacking)
    - [ ] Test ignoring scrap upgrades
    - [ ] Test reactive updates
  - [ ] Add combined effects tests
- [ ] Run tests: `npm test -- gameStore.test.ts`
- [ ] Verify 100% coverage for new code
- [ ] Commit: "feat: add computed observables for upgrade effects"

### Phase 4: Initialization
- [ ] Update `/frontend/shared/store/gameStore.ts`
  - [ ] Import `UPGRADES` from upgradeDefinitions
  - [ ] Modify `initializeGameState()` function
  - [ ] Add upgrade population logic (if empty)
  - [ ] Add error handling for upgrade population
  - [ ] Update JSDoc comments
- [ ] Test initialization:
  - [ ] Clear AsyncStorage, launch app → upgrades populated
  - [ ] Save state, restart app → upgrades preserved
  - [ ] Manual testing in simulator/device
- [ ] Commit: "feat: populate upgrades on initialization"

### Phase 5: Scrap Generation Integration
- [ ] Update `/frontend/modules/attack-button/AttackButtonScreen.tsx`
  - [ ] Import `totalScrapMultiplier$` from gameStore
  - [ ] Modify scrap generation timer (line ~36)
  - [ ] Change `petCount * 1` to `petCount * (1 + multiplier)`
  - [ ] Update code comments
- [ ] Update `/frontend/modules/attack-button/AttackButtonScreen.test.tsx`
  - [ ] Add test: base scrap generation without upgrades
  - [ ] Add test: scrap generation with single multiplier
  - [ ] Add test: scrap generation with stacked multipliers
  - [ ] Add test: scrap generation with all scrap upgrades
- [ ] Manual testing:
  - [ ] Launch app, verify base scrap generation (1/second per pet)
  - [ ] Purchase scrap-boost-1, verify 10% increase
  - [ ] Purchase scrap-boost-2, verify 25% total increase
  - [ ] Purchase scrap-boost-3, verify 50% total increase
- [ ] Run tests: `npm test -- AttackButtonScreen.test.tsx`
- [ ] Commit: "feat: integrate scrap multiplier into generation"

### Phase 6: Feed Button Integration
- [ ] Update `/frontend/modules/attack-button/AttackButtonScreen.tsx`
  - [ ] Import `totalPetBonus$` from gameStore
  - [ ] Modify `handleFeed` function (line ~18)
  - [ ] Change `prev + 1` to `prev + (1 + bonus)`
  - [ ] Update code comments
- [ ] Update `/frontend/modules/attack-button/AttackButtonScreen.test.tsx`
  - [ ] Add test: feed button without upgrades
  - [ ] Add test: feed button with single bonus
  - [ ] Add test: feed button with both pet upgrades
  - [ ] Add test: multiple feed presses with bonus
- [ ] Manual testing:
  - [ ] Press feed button, verify +1 pet (no upgrades)
  - [ ] Purchase pet-boost-1, press feed, verify +2 pets
  - [ ] Purchase pet-boost-2, press feed, verify +4 pets
- [ ] Run tests: `npm test -- AttackButtonScreen.test.tsx`
- [ ] Commit: "feat: integrate pet bonus into feed button"

### Phase 7: Shop Integration Tests
- [ ] Update `/frontend/modules/shop/ShopScreen.test.tsx`
  - [ ] Add test: purchasing scrap upgrade updates computed observable
  - [ ] Add test: purchasing pet upgrade updates computed observable
  - [ ] Add test: purchasing multiple upgrades stacks effects
  - [ ] Add test: displays all 5 upgrades from definitions
  - [ ] Add test: cannot purchase without enough scrap
  - [ ] Add test: cannot purchase already owned upgrade
- [ ] Run tests: `npm test -- ShopScreen.test.tsx`
- [ ] Commit: "test: add shop integration tests for upgrades"

### Phase 8: Persistence Tests
- [ ] Update `/frontend/shared/store/persistence.test.ts`
  - [ ] Add test: purchased upgrades persist across sessions
  - [ ] Add test: upgrades array populates on first load
  - [ ] Add test: effect calculations work after load
  - [ ] Add test: handles corrupted purchase data gracefully
- [ ] Run tests: `npm test -- persistence.test.ts`
- [ ] Manual testing:
  - [ ] Purchase upgrades, close app, reopen → verify owned
  - [ ] Verify effects still apply after restart
- [ ] Commit: "test: add persistence tests for upgrades"

### Phase 9: Full Testing
- [ ] Run full test suite: `npm test -- --coverage --watchAll=false`
- [ ] Verify coverage meets targets:
  - [ ] upgradeDefinitions.ts: 100%
  - [ ] gameStore.ts (new code): 100%
  - [ ] AttackButtonScreen.tsx: 90%+
  - [ ] ShopScreen.tsx: 95%+
- [ ] Fix any failing tests
- [ ] Address any coverage gaps

### Phase 10: Manual Testing
- [ ] Test complete purchase flow:
  - [ ] Start fresh, accumulate scrap
  - [ ] Purchase scrap-boost-1, verify 10% increase
  - [ ] Purchase pet-boost-1, verify +1 pet per feed
  - [ ] Purchase remaining upgrades in various orders
  - [ ] Verify effects stack correctly
- [ ] Test edge cases:
  - [ ] Try purchasing with insufficient scrap
  - [ ] Try purchasing already owned upgrade
  - [ ] Verify cannot purchase duplicates
- [ ] Test persistence:
  - [ ] Purchase upgrades, close app completely
  - [ ] Reopen app, verify upgrades still owned
  - [ ] Verify effects still apply
  - [ ] Verify scrap balance preserved
- [ ] Test progression:
  - [ ] Play through early game (0-100 scrap)
  - [ ] Play through mid game (100-1000 scrap)
  - [ ] Play through late game (1000-2000 scrap)
  - [ ] Verify balance feels appropriate

### Phase 11: Documentation
- [ ] Add JSDoc comments to all new functions
- [ ] Update inline code comments
- [ ] Verify TDD is accurate and complete
- [ ] Create balance notes (optional)

### Phase 12: Final Review
- [ ] Code review checklist:
  - [ ] All TypeScript types correct
  - [ ] No console.log statements (only console.warn/error)
  - [ ] Consistent code style with existing codebase
  - [ ] All tests passing
  - [ ] No linting errors
  - [ ] Accessibility attributes present
- [ ] Performance checklist:
  - [ ] No frame drops during scrap generation
  - [ ] No lag when purchasing upgrades
  - [ ] Computed observables efficient
- [ ] UX checklist:
  - [ ] Upgrade effects feel impactful
  - [ ] Costs balanced (not too cheap, not too expensive)
  - [ ] Descriptions clear and helpful
  - [ ] Purchase flow smooth and intuitive

---

## 12. Future Considerations

### 12.1 Extensibility

**Adding New Upgrades:**
1. Add new object to `UPGRADES` array in `upgradeDefinitions.ts`
2. No changes needed to computed observables (they dynamically filter)
3. Shop screen automatically displays new upgrade
4. Add tests for new upgrade in `upgradeDefinitions.test.ts`

**Example:**
```typescript
{
  id: 'scrap-boost-4',
  name: 'Scrap Factory',
  description: 'Industrial-grade scrap collection. Increases scrap generation by 50%.',
  cost: 10000,
  effectType: 'scrapMultiplier',
  effectValue: 0.5,
  category: 'scrapEfficiency',
}
```

**Adding New Effect Types:**
1. Update `effectType` union in `Upgrade` interface
2. Create new computed observable in `gameStore.ts`
3. Integrate effect into relevant game mechanic
4. Update tests

**Example:**
```typescript
// Add to Upgrade interface
effectType: 'scrapMultiplier' | 'petBonus' | 'autoFeed' | 'scrapCapacity';

// Add new computed observable
export const totalAutoFeedRate$ = computed(() => {
  const purchased = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  return upgrades
    .filter(u => purchased.includes(u.id) && u.effectType === 'autoFeed')
    .reduce((sum, u) => sum + u.effectValue, 0);
});
```

### 12.2 Performance Optimization

**If upgrade count grows > 50:**
1. Consider indexing upgrades by ID in gameStore:
```typescript
const upgradesById$ = computed(() => {
  const upgrades = gameState$.upgrades.get();
  return new Map(upgrades.map(u => [u.id, u]));
});
```

2. Update computed observables to use index:
```typescript
export const totalScrapMultiplier$ = computed(() => {
  const purchased = gameState$.purchasedUpgrades.get();
  const byId = upgradesById$.get();

  return purchased
    .map(id => byId.get(id))
    .filter(u => u && u.effectType === 'scrapMultiplier')
    .reduce((sum, u) => sum + u.effectValue, 0);
});
```

**If effect calculation becomes complex:**
1. Consider memoization with custom equality check
2. Cache intermediate results
3. Debounce recalculation (only for non-critical paths)

### 12.3 UI/UX Enhancements

**Category Grouping:**
- Group upgrades by category in shop UI
- Add section headers ("Scrap Efficiency", "Pet Acquisition")
- Collapse/expand categories

**Visual Effects:**
- Pulse animation when upgrade effect applies
- Particle effects for scrap generation with multipliers
- Badge/icon on feed button showing current pet bonus

**Stats Screen:**
- Total scrap earned from multipliers
- Total bonus pets gained
- ROI calculations per upgrade
- Lifetime value tracking

**Upgrade Recommendations:**
- Suggest next upgrade based on playstyle
- Show estimated time to afford next upgrade
- Highlight "best value" upgrades

---

## 13. Risk Analysis

### 13.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| scrapCost → cost migration breaks code | Medium | High | Global search before change, TypeScript compiler catches errors |
| Computed observable performance issues | Low | Medium | Legend State optimized, benchmarking, load testing |
| Decimal scrap accumulation errors | Low | Low | JavaScript Number precision sufficient, test long sessions |
| Persistence backward compatibility issues | Low | Medium | Empty array check handles old saves, test migration paths |
| Race conditions in state updates | Very Low | High | Legend State prevents races, functional setters used throughout |

### 13.2 Balance Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Upgrades too powerful (game too easy) | Medium | Medium | Exponential costs gate progression, playtest and adjust |
| Upgrades too weak (not worth cost) | Medium | Medium | Percentage values chosen for noticeable impact, iterate based on feedback |
| One upgrade path clearly superior | Low | Medium | Both paths serve different playstyles, monitor usage analytics |
| Endgame reached too quickly | Low | Low | Total investment of 3800 scrap provides hours of content |

### 13.3 User Experience Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Players don't notice upgrade effects | Low | Medium | Clear descriptions, immediate visible impact in scrap/pet changes |
| Purchase flow confusing | Very Low | Low | Existing shop UI patterns, disabled state for unavailable upgrades |
| Regret over purchase (no refunds) | Low | Low | Clear descriptions before purchase, meaningful choice by design |
| Confusion about effect stacking | Low | Low | Additive stacking simpler than multiplicative, document clearly |

---

## 14. Success Metrics

### 14.1 Technical Success Criteria

**Code Quality:**
- [ ] 0 TypeScript compilation errors
- [ ] 0 linting errors
- [ ] 95%+ test coverage on new code
- [ ] All tests passing
- [ ] No console.log statements in production code

**Performance:**
- [ ] Computed observable calculation < 1ms
- [ ] No frame drops during scrap generation
- [ ] State persistence < 50ms
- [ ] Purchase flow responds < 100ms

**Reliability:**
- [ ] 0 crashes related to upgrade system
- [ ] 100% persistence success rate (upgrades not lost)
- [ ] Graceful handling of all error cases
- [ ] Backward compatibility maintained with old saves

### 14.2 Balance Success Criteria

**Progression:**
- [ ] First upgrade affordable within 2-5 minutes of play
- [ ] Mid-tier upgrades (500-1000) affordable within 10-15 minutes
- [ ] Most expensive upgrade (2000) requires 20-30 minutes
- [ ] Total progression time to all upgrades: 1-2 hours

**Value:**
- [ ] 50% scrap multiplier feels impactful (not overpowered)
- [ ] +3 pets per feed feels rewarding (not game-breaking)
- [ ] Both upgrade paths provide meaningful choices
- [ ] No single upgrade path dominates all situations

### 14.3 User Experience Success Criteria

**Clarity:**
- [ ] Players understand what each upgrade does before purchase
- [ ] Effects are immediately noticeable after purchase
- [ ] Cost-to-benefit ratio is clear
- [ ] No confusion about upgrade mechanics

**Engagement:**
- [ ] Players have short-term goals (next upgrade) and long-term goals (all upgrades)
- [ ] Strategic decisions between upgrade paths
- [ ] Sense of progression and achievement
- [ ] Replay value through different upgrade orders

---

## 15. Appendix

### 15.1 Formula Reference

**Scrap Multiplier Calculation:**
```typescript
totalScrapMultiplier = Σ(effectValue) for all purchased scrapMultiplier upgrades

Example:
Owned: scrap-boost-1 (0.1), scrap-boost-2 (0.15)
totalScrapMultiplier = 0.1 + 0.15 = 0.25 (25% bonus)
```

**Scrap Generation Formula:**
```typescript
scrapPerSecond = petCount * (1 + totalScrapMultiplier)

Example:
petCount = 10
totalScrapMultiplier = 0.25
scrapPerSecond = 10 * (1 + 0.25) = 10 * 1.25 = 12.5 scrap/second
```

**Pet Bonus Calculation:**
```typescript
totalPetBonus = Σ(effectValue) for all purchased petBonus upgrades

Example:
Owned: pet-boost-1 (1), pet-boost-2 (2)
totalPetBonus = 1 + 2 = 3 (3 extra pets)
```

**Feed Button Formula:**
```typescript
petsGained = basePetGain + totalPetBonus

Example:
basePetGain = 1
totalPetBonus = 3
petsGained = 1 + 3 = 4 pets per feed press
```

### 15.2 Upgrade Data Summary

| ID | Name | Cost | Effect Type | Effect Value | Category |
|----|------|------|-------------|--------------|----------|
| scrap-boost-1 | Scrap Finder | 100 | scrapMultiplier | 0.1 (10%) | scrapEfficiency |
| scrap-boost-2 | Scrap Magnet | 500 | scrapMultiplier | 0.15 (15%) | scrapEfficiency |
| scrap-boost-3 | Scrap Amplifier | 2000 | scrapMultiplier | 0.25 (25%) | scrapEfficiency |
| pet-boost-1 | Extra Feed | 200 | petBonus | 1 (+1 pet) | petAcquisition |
| pet-boost-2 | Double Feed | 1000 | petBonus | 2 (+2 pets) | petAcquisition |

**Progression Paths:**
- Scrap Efficiency: 2600 total cost → 50% total multiplier
- Pet Acquisition: 1200 total cost → +3 total pet bonus
- Full Suite: 3800 total cost → both maxed

### 15.3 State Structure Reference

```typescript
// gameState$ structure with upgrades
{
  petCount: number;              // Current number of AI Pets
  scrap: number;                 // Current scrap balance
  upgrades: Upgrade[];           // Array of 5 upgrade definitions (populated on init)
  purchasedUpgrades: string[];   // Array of owned upgrade IDs (e.g., ['scrap-boost-1'])
}

// Computed observables (derived from gameState$)
totalScrapMultiplier$: number;   // Sum of scrapMultiplier effectValues for owned upgrades
totalPetBonus$: number;          // Sum of petBonus effectValues for owned upgrades
```

### 15.4 File Change Summary

**New Files:**
- `/frontend/modules/shop/upgradeDefinitions.ts` - Upgrade data definitions
- `/frontend/modules/shop/upgradeDefinitions.test.ts` - Definition tests

**Modified Files:**
- `/frontend/shared/types/game.ts` - Update Upgrade interface (scrapCost → cost, add category)
- `/frontend/shared/store/gameStore.ts` - Add computed observables, update initialization
- `/frontend/shared/store/gameStore.test.ts` - Add tests for computed observables
- `/frontend/modules/shop/ShopScreen.tsx` - Update scrapCost → cost references (6 locations)
- `/frontend/modules/shop/ShopScreen.test.tsx` - Update tests, add integration tests
- `/frontend/modules/attack-button/AttackButtonScreen.tsx` - Integrate multiplier and bonus
- `/frontend/modules/attack-button/AttackButtonScreen.test.tsx` - Add integration tests
- `/frontend/shared/store/persistence.test.ts` - Add persistence tests

**Unchanged Files:**
- `/frontend/shared/store/persistence.ts` - No changes needed
- `/frontend/App.tsx` - Initialization already handled by gameStore

### 15.5 Command Reference

**Testing Commands:**
```bash
# Run all tests
npm test

# Run specific test file
npm test -- upgradeDefinitions.test.ts

# Run with coverage
npm test -- --coverage --watchAll=false

# Run in watch mode
npm test -- --watch

# Run TypeScript compiler check
npm run tsc
```

**Development Commands:**
```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Lint code
npm run lint

# Format code
npm run format
```

---

## 16. Conclusion

This Technical Design Document provides a complete blueprint for implementing the Shop Upgrades System. The design:

1. **Leverages existing architecture** - Uses Legend State patterns, existing shop UI, and established persistence layer
2. **Maintains backward compatibility** - Gracefully handles old save data and migrates seamlessly
3. **Prioritizes performance** - Computed observables are efficient, state updates are atomic, persistence is debounced
4. **Ensures testability** - Comprehensive test coverage across unit, integration, and persistence layers
5. **Scales for future growth** - Extensible design supports adding upgrades and effect types easily

**Next Steps:**
1. Review and approve this TDD
2. Generate task list using `/flow:tasks tdd_upgrades_20251117.md`
3. Begin implementation following the checklist in Section 11
4. Execute tests continuously as each phase completes
5. Conduct manual testing before final approval

**Estimated Implementation Time:**
- Type updates: 30 minutes
- Upgrade definitions: 1 hour
- Computed observables: 1 hour
- Integrations: 2 hours
- Testing: 3 hours
- Manual testing & polish: 2 hours
- **Total: 9-10 hours** (for experienced developer with codebase familiarity)

---

**Document Status:** Final - Ready for Implementation
**Author:** Claude (AI Assistant)
**Approved By:** [Pending Review]
**Implementation Start Date:** [TBD]
