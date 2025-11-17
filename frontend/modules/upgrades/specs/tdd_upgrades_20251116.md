# Technical Design Document: Shop Upgrades System

| Version | Author | Date | Status |
|---------|--------|------|--------|
| v1.0 | Claude Code | 2025-11-16 | Draft |

**Source PRD**: `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/specs/prd_upgrades_20251116.md`

---

## Executive Summary

This Technical Design Document provides a comprehensive implementation blueprint for the Shop Upgrades System, which enables players to purchase permanent enhancements using scrap currency. The system introduces 5 distinct upgrades across 2 categories (Scrap Efficiency and Pet Acquisition), with one-time purchases providing permanent passive bonuses.

The design leverages the existing Legend State architecture with computed observables for reactive effect calculations, integrates with the current shop UI infrastructure, and uses AsyncStorage for persistence. Implementation follows established patterns from the core clicker and shop systems.

**Key Technical Components**:
- Upgrade definitions and type system in TypeScript
- Purchase validation and transaction logic
- Effect calculation using computed observables
- Persistence layer with AsyncStorage and debouncing
- UI components for upgrade display and purchase interaction
- Integration with existing scrap generation and pet acquisition systems

**Timeline**: 3-4 weeks for full implementation, testing, and launch

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Design](#system-design)
3. [Data Models](#data-models)
4. [Component Design](#component-design)
5. [State Management](#state-management)
6. [API/Interface Specifications](#apiinterface-specifications)
7. [Business Logic](#business-logic)
8. [Persistence Strategy](#persistence-strategy)
9. [Integration Points](#integration-points)
10. [Testing Strategy](#testing-strategy)
11. [Performance Considerations](#performance-considerations)
12. [Accessibility Requirements](#accessibility-requirements)
13. [Error Handling](#error-handling)
14. [Migration & Rollout](#migration--rollout)
15. [Open Questions & Decisions](#open-questions--decisions)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐         ┌──────────────────────────┐     │
│  │  ShopScreen   │────────▶│  UpgradeListItem (×5)    │     │
│  │  (existing)   │         │  - Name, Description     │     │
│  │               │         │  - Cost, Effect Display  │     │
│  │  - Header     │         │  - Purchase Button       │     │
│  │  - Scrap      │         │  - State Indicators      │     │
│  │  - Upgrades   │         └──────────────────────────┘     │
│  └───────────────┘                                           │
│         │                                                     │
│         │ useGameState()                                     │
│         ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           gameStore$ (Legend State)                  │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │  Observable State                           │    │    │
│  │  │  - petCount: number                         │    │    │
│  │  │  - scrap: number                            │    │    │
│  │  │  - upgrades: Upgrade[]                      │    │    │
│  │  │  - purchasedUpgrades: string[]              │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │                                                       │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │  Computed Observables                       │    │    │
│  │  │  - scrapRate$: petCount × scrapMultiplier  │    │    │
│  │  │  - availableUpgrades$: filter purchased    │    │    │
│  │  │  - totalScrapBonus$: sum scrap upgrades    │    │    │
│  │  │  - totalPetBonus$: sum pet upgrades        │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │                                                       │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │  Actions                                     │    │    │
│  │  │  - purchaseUpgrade(id)                      │    │    │
│  │  │  - loadUpgrades()                           │    │    │
│  │  │  - initializePurchases()                    │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│         │                                                     │
│         │ persistSync()                                      │
│         ▼                                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         AsyncStorage (Persistence Layer)              │   │
│  │  - Key: "purchased-upgrades-v1"                      │   │
│  │  - Debounce: 1000ms                                  │   │
│  │  - Retry: exponential backoff                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Integration Points                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ClickerScreen.tsx                    AI Pet Generation      │
│  ┌────────────────┐                  ┌──────────────────┐   │
│  │ Feed Button    │                  │ Scrap Timer      │   │
│  │ +1 base pet    │                  │ scrapRate$ ──┐   │   │
│  │ +petBonus$     │                  │              │   │   │
│  └────────────────┘                  └──────────────│───┘   │
│         │                                            │       │
│         │ uses totalPetBonus$                       │       │
│         └────────────────────────────────────────────┘       │
│                     uses getScrapMultiplier()                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App.tsx
└── ClickerScreen or ShopScreen (conditional render)
    └── ShopScreen
        ├── Header (existing)
        │   ├── BackButton
        │   ├── Title
        │   └── ScrapBalance
        └── Content
            ├── EmptyState (when no upgrades)
            └── UpgradeList
                ├── CategoryHeader ("Scrap Efficiency")
                ├── UpgradeListItem (Scrap Finder)
                ├── UpgradeListItem (Scrap Magnet)
                ├── UpgradeListItem (Scrap Amplifier)
                ├── CategoryHeader ("Pet Acquisition")
                ├── UpgradeListItem (Extra Feed)
                └── UpgradeListItem (Double Feed)
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| UI Framework | React Native | Cross-platform mobile UI |
| State Management | Legend State | Reactive observables with computed values |
| Persistence | AsyncStorage | Local device storage for purchased upgrades |
| Testing | Jest + React Native Testing Library | Unit and integration tests |
| Type System | TypeScript | Type safety and IDE support |
| Styling | StyleSheet API | React Native styling |

---

## System Design

### Design Principles

1. **Reactive State Management**: Use Legend State observables and computed values for automatic reactivity
2. **Single Source of Truth**: All upgrade state lives in `gameStore$`
3. **Immutable Upgrades**: Upgrade definitions are immutable; only purchase state changes
4. **Atomic Transactions**: Purchase operations are atomic (scrap deduction + purchase recording)
5. **Persistence First**: All purchases persist to AsyncStorage with debounce
6. **Component Isolation**: Components read state via `useGameState()` hook
7. **Accessibility by Default**: All interactive elements meet WCAG AA standards

### Data Flow

```
User Interaction → Component Event → Purchase Action → State Update → Side Effects
                                                             ↓
                                                    ┌────────┴─────────┐
                                                    │                  │
                                            Persistence          UI Reactivity
                                         (AsyncStorage)        (re-render)
                                                    │                  │
                                                    └────────┬─────────┘
                                                             ↓
                                                    Effect Calculation
                                                  (scrap rate, pet bonus)
```

**Purchase Flow Example**:
1. User taps "Purchase" button on "Scrap Finder" (100 scrap)
2. `UpgradeListItem` calls `onPurchase('scrap-boost-1')`
3. Purchase handler validates:
   - Sufficient scrap? (scrap >= 100)
   - Not already purchased? (!purchasedUpgrades.includes('scrap-boost-1'))
4. If valid:
   - Deduct scrap: `gameState$.scrap.set(prev => prev - 100)`
   - Record purchase: `gameState$.purchasedUpgrades.set(prev => [...prev, 'scrap-boost-1'])`
5. Side effects:
   - AsyncStorage write (debounced 1000ms)
   - `availableUpgrades$` recomputes (filters out purchased)
   - `scrapRate$` recomputes (includes new +10% multiplier)
   - UI re-renders with updated state

---

## Data Models

### Core Types

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

### Upgrade Definitions

**File**: `/frontend/modules/upgrades/upgradeDefinitions.ts`

```typescript
import { Upgrade } from './types';

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

### State Shape

```typescript
// Within gameStore.ts
export const gameState$ = observable({
  petCount: 0,
  scrap: 0,
  upgrades: UPGRADE_DEFINITIONS,  // Immutable catalog (NEW)
  purchasedUpgrades: [] as string[],  // Mutable purchase state (NEW)
});
```

---

## Component Design

### UpgradeListItem Component

**File**: `/frontend/modules/upgrades/components/UpgradeListItem.tsx`

**Purpose**: Display a single upgrade with purchase interaction

**Props**:
```typescript
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
```

**Visual States**:
1. **Available (can afford)**: Green/blue button, normal opacity
2. **Insufficient Scrap**: Grayed out, disabled button, shows deficit
3. **Purchased**: Checkmark icon, "Purchased" badge, no button
4. **Purchasing**: Button disabled, loading indicator

**Layout**:
```
┌────────────────────────────────────────────────────┐
│  [Icon]  Scrap Finder                              │
│          +10% scrap generation from AI Pets        │
│          100 scrap                        [Button] │
└────────────────────────────────────────────────────┘

States:
- Available:   [Purchase] (blue button)
- Insufficient: [Need 50 more] (gray button, disabled)
- Purchased:   [✓ Purchased] (green badge)
```

**Accessibility**:
- `accessibilityLabel`: "Scrap Finder, +10% scrap generation, costs 100 scrap"
- `accessibilityHint`: "Double tap to purchase" (if available)
- `accessibilityState`: { disabled: !canAfford || isPurchased }
- Touch target: minimum 44×44pt

**Component Implementation Sketch**:
```typescript
export const UpgradeListItem = observer(function UpgradeListItem({
  upgrade,
  canAfford,
  isPurchased,
  currentScrap,
  onPurchase,
  isPurchasing = false,
}: UpgradeListItemProps) {
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

  return (
    <View
      style={styles.container}
      accessibilityLabel={`${upgrade.name}, ${upgrade.description}, costs ${upgrade.scrapCost} scrap`}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{upgrade.name}</Text>
        <Text style={styles.description}>{upgrade.description}</Text>
        <Text style={styles.cost}>{upgrade.scrapCost} scrap</Text>
      </View>
      <View style={styles.actionArea}>
        {renderButton()}
      </View>
    </View>
  );
});
```

### UpgradeList Component

**File**: `/frontend/modules/upgrades/components/UpgradeList.tsx`

**Purpose**: Display all upgrades grouped by category

**Props**:
```typescript
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
```

**Implementation Strategy**:
- Group upgrades by category
- Render category headers
- Filter out purchased upgrades (based on UX decision - see Open Questions)
- Pass derived props to UpgradeListItem

```typescript
export const UpgradeList = observer(function UpgradeList({
  upgrades,
  purchasedUpgrades,
  currentScrap,
  onPurchase,
}: UpgradeListProps) {
  const categories: UpgradeCategory[] = ['Scrap Efficiency', 'Pet Acquisition'];

  return (
    <ScrollView style={styles.container}>
      {categories.map(category => {
        const categoryUpgrades = upgrades.filter(u => u.category === category);

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
```

### Updated ShopScreen Component

**File**: `/frontend/modules/shop/ShopScreen.tsx` (modifications)

**Changes Required**:
1. Import `UpgradeList` component
2. Replace placeholder with `UpgradeList`
3. Add purchase handler that calls purchase action
4. Handle purchase feedback (success/error toast)

```typescript
export const ShopScreen = observer(function ShopScreen({
  onNavigateBack
}: ShopScreenProps) {
  const {
    scrap$,
    availableUpgrades$,
    purchasedUpgrades$,
  } = useGameState();

  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handlePurchase = useCallback(async (upgradeId: string) => {
    setPurchasingId(upgradeId);
    try {
      const result = await purchaseUpgrade(upgradeId);
      if (!result.success) {
        // Show error feedback (toast/alert)
        Alert.alert('Purchase Failed', getPurchaseErrorMessage(result.error));
      }
    } finally {
      setPurchasingId(null);
    }
  }, []);

  const allUpgrades = UPGRADE_DEFINITIONS; // or from gameState$.upgrades.get()

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {/* Existing header code */}
      </View>

      <View style={styles.content}>
        {availableUpgrades$.get().length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
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
    </SafeAreaView>
  );
});
```

---

## State Management

### Legend State Integration

**File**: `/frontend/shared/store/gameStore.ts` (modifications)

#### State Shape Updates

```typescript
export const gameState$ = observable({
  petCount: 0,
  scrap: 0,
  upgrades: UPGRADE_DEFINITIONS,  // NEW: Immutable catalog
  purchasedUpgrades: [] as string[],  // NEW: Mutable purchase state
});
```

#### Computed Observables

**1. Total Scrap Multiplier**

```typescript
/**
 * Computed total scrap multiplier from all purchased scrapMultiplier upgrades
 * Base: 1.0 (no bonuses)
 * With upgrades: 1.0 + sum of all purchased scrapMultiplier effectValues
 *
 * @example
 * Purchased: Scrap Finder (0.1) + Scrap Magnet (0.15)
 * Result: 1.0 + 0.1 + 0.15 = 1.25 (25% bonus)
 */
export const totalScrapBonus$ = computed(() => {
  const purchasedIds = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  const scrapUpgrades = upgrades.filter(
    u => u.effectType === 'scrapMultiplier' && purchasedIds.includes(u.id)
  );

  return scrapUpgrades.reduce((sum, upgrade) => sum + upgrade.effectValue, 0);
});

/**
 * Helper function for scrap multiplier calculation
 * Used in scrapRate$ computed observable
 */
export function getScrapMultiplier(): number {
  return 1.0 + totalScrapBonus$.get();
}
```

**2. Total Pet Bonus**

```typescript
/**
 * Computed total pet bonus from all purchased petBonus upgrades
 * Base: 0 (no bonuses, just base 1 pet per feed)
 * With upgrades: sum of all purchased petBonus effectValues
 *
 * @example
 * Purchased: Extra Feed (1) + Double Feed (2)
 * Result: 0 + 1 + 2 = 3 bonus pets
 * Total per feed: 1 (base) + 3 (bonus) = 4 pets
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

**3. Updated Scrap Rate** (existing, already uses getScrapMultiplier)

```typescript
/**
 * Computed scrap generation rate (scrap per second)
 * Auto-recomputes when petCount or purchased upgrades change
 */
export const scrapRate$ = computed(() => {
  const petCount = gameState$.petCount.get();
  const scrapMultiplier = getScrapMultiplier();
  return Math.floor(petCount * scrapMultiplier);
});
```

**4. Available Upgrades** (existing)

```typescript
/**
 * Computed observable that filters out purchased upgrades
 * Returns only upgrades that haven't been purchased yet
 */
export const availableUpgrades$ = computed(() => {
  const allUpgrades = gameState$.upgrades.get();
  const purchased = gameState$.purchasedUpgrades.get();
  return allUpgrades.filter(u => !purchased.includes(u.id));
});
```

#### Purchase Action

```typescript
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

    // Persistence happens automatically via persistSync (see Persistence Strategy)

    return { success: true };
  } catch (error) {
    // Rollback if anything fails (shouldn't happen, but safety)
    console.error('Purchase transaction failed:', error);
    return { success: false, error: PurchaseError.PERSISTENCE_FAILED };
  }
}
```

#### Hook Updates

**File**: `/frontend/shared/hooks/useGameState.ts`

```typescript
export function useGameState() {
  return {
    petCount$: gameState$.petCount,
    scrap$: gameState$.scrap,
    scrapRate$: scrapRate$,
    upgrades$: gameState$.upgrades,
    purchasedUpgrades$: gameState$.purchasedUpgrades,
    availableUpgrades$: availableUpgrades$,
    totalScrapBonus$: totalScrapBonus$,  // NEW
    totalPetBonus$: totalPetBonus$,      // NEW
  };
}
```

---

## API/Interface Specifications

### Purchase API

```typescript
/**
 * Purchase an upgrade by ID
 * @param upgradeId - Unique upgrade identifier
 * @returns Promise resolving to purchase result
 */
export async function purchaseUpgrade(upgradeId: string): Promise<PurchaseResult>;

/**
 * Check if player can afford an upgrade
 * @param upgradeId - Unique upgrade identifier
 * @returns True if player has sufficient scrap
 */
export function canAffordUpgrade(upgradeId: string): boolean;

/**
 * Check if upgrade is already purchased
 * @param upgradeId - Unique upgrade identifier
 * @returns True if upgrade is owned
 */
export function isUpgradePurchased(upgradeId: string): boolean;

/**
 * Get human-readable error message for purchase failure
 * @param error - Purchase error enum value
 * @returns User-friendly error message
 */
export function getPurchaseErrorMessage(error?: PurchaseError): string;
```

### Persistence API

```typescript
/**
 * Save purchased upgrades to AsyncStorage
 * Debounced to prevent excessive writes
 * @returns Promise resolving when save completes
 */
export async function savePurchases(): Promise<void>;

/**
 * Load purchased upgrades from AsyncStorage
 * Called on app initialization
 * @returns Promise resolving to array of purchased upgrade IDs
 */
export async function loadPurchases(): Promise<string[]>;

/**
 * Clear all purchased upgrades (debug/testing only)
 * @returns Promise resolving when clear completes
 */
export async function clearPurchases(): Promise<void>;
```

### Effect Calculation API

```typescript
/**
 * Calculate total scrap multiplier from purchased upgrades
 * @returns Multiplier value (e.g., 1.5 for 50% bonus)
 */
export function getScrapMultiplier(): number;

/**
 * Calculate total pet bonus from purchased upgrades
 * @returns Bonus pets per feed (e.g., 3 for +3 pets)
 */
export function getPetBonus(): number;

/**
 * Calculate effective scrap rate with upgrades
 * @param basePetCount - Number of AI Pets owned
 * @returns Scrap per second after multipliers
 */
export function calculateScrapRate(basePetCount: number): number;

/**
 * Calculate effective pets per feed with upgrades
 * @returns Total pets gained per feed button press
 */
export function calculatePetsPerFeed(): number;
```

---

## Business Logic

### Purchase Validation

**Pre-Purchase Checks** (synchronous):
1. Upgrade exists in catalog
2. Upgrade not already purchased
3. Player has sufficient scrap

**Transaction Execution** (atomic):
1. Deduct scrap from balance
2. Add upgrade ID to purchased list
3. Trigger persistence (debounced)

**Post-Purchase Effects** (automatic via computed observables):
1. `availableUpgrades$` updates (filters out purchased)
2. `totalScrapBonus$` or `totalPetBonus$` updates
3. `scrapRate$` recomputes (if scrap upgrade)
4. UI re-renders with new state

### Effect Calculation Logic

**Scrap Multiplier Calculation**:
```
Base Multiplier: 1.0
For each purchased scrapMultiplier upgrade:
  Add effectValue to multiplier

Example:
- No upgrades: 1.0
- Scrap Finder (0.1): 1.0 + 0.1 = 1.1
- + Scrap Magnet (0.15): 1.1 + 0.15 = 1.25
- + Scrap Amplifier (0.25): 1.25 + 0.25 = 1.5

Scrap Rate: petCount × multiplier
- 100 pets × 1.5 = 150 scrap/sec
```

**Pet Bonus Calculation**:
```
Base Pets Per Feed: 1
For each purchased petBonus upgrade:
  Add effectValue to bonus

Example:
- No upgrades: 1 + 0 = 1 pet per feed
- Extra Feed (1): 1 + 1 = 2 pets per feed
- + Double Feed (2): 1 + 1 + 2 = 4 pets per feed
```

### Integration with Existing Systems

**AI Pet Scrap Generation** (ClickerScreen.tsx):

Current implementation:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const rate = scrapRate$.get();
    scrap$.set(prev => prev + rate);
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

No changes required! `scrapRate$` is already a computed observable that uses `getScrapMultiplier()`, which now factors in purchased upgrades.

**Feed Button** (ClickerScreen.tsx):

Current implementation:
```typescript
onPress={() => petCount$.set(prev => prev + 1)}
```

**Required Change**:
```typescript
onPress={() => {
  const basePets = 1;
  const bonus = totalPetBonus$.get();
  petCount$.set(prev => prev + basePets + bonus);
}}
```

---

## Persistence Strategy

### Storage Schema

**Key**: `"purchased-upgrades-v1"`

**Format**:
```json
{
  "version": 1,
  "purchasedUpgrades": ["scrap-boost-1", "pet-boost-1"],
  "timestamp": 1700000000000
}
```

### Persistence Implementation

**File**: `/frontend/shared/store/persistence.ts` (new file)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

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

### Persistence Integration

**In gameStore.ts**:

```typescript
import { savePurchases, loadPurchases } from './persistence';

// Initialize purchases from storage on app launch
export async function initializePurchases(): Promise<void> {
  const savedPurchases = await loadPurchases();
  gameState$.purchasedUpgrades.set(savedPurchases);
}

// Auto-persist purchases when they change (with debounce)
gameState$.purchasedUpgrades.onChange((changes) => {
  const newPurchases = changes.value;
  savePurchases(newPurchases); // Debounced internally
});
```

**In App.tsx** (initialization):

```typescript
useEffect(() => {
  // Load upgrades on mount
  gameState$.upgrades.set(UPGRADE_DEFINITIONS);

  // Load purchases from AsyncStorage
  initializePurchases();
}, []);
```

### Error Handling & Retry Logic

```typescript
/**
 * Save with retry logic
 * Attempts save up to 3 times with exponential backoff
 */
export async function savePurchasesWithRetry(
  purchasedUpgrades: string[],
  maxRetries = 3
): Promise<void> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await savePurchases(purchasedUpgrades);
      return; // Success
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error; // Give up after max retries
      }

      // Exponential backoff: 100ms, 200ms, 400ms
      const backoff = Math.pow(2, attempt) * 100;
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
}
```

---

## Integration Points

### 1. ClickerScreen Feed Button

**File**: `/frontend/modules/attack-button/ClickerScreen.tsx`

**Current Code**:
```typescript
onPress={() => petCount$.set(prev => prev + 1)}
```

**Updated Code**:
```typescript
import { totalPetBonus$ } from '../../shared/store/gameStore';

// In component:
const { petCount$, totalPetBonus$ } = useGameState();

// Feed button:
onPress={() => {
  const basePets = 1;
  const bonus = totalPetBonus$.get();
  petCount$.set(prev => prev + basePets + bonus);
}}
```

**Display Update** (optional enhancement):
```typescript
<Text style={styles.buttonText}>
  feed (+{1 + totalPetBonus$.get()} pets)
</Text>
```

### 2. Scrap Generation Timer

**File**: `/frontend/modules/attack-button/ClickerScreen.tsx`

**Current Code** (no changes needed):
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const rate = scrapRate$.get();
    scrap$.set(prev => prev + rate);
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

**Why No Changes?**: `scrapRate$` is already a computed observable that calls `getScrapMultiplier()`, which now includes upgrade bonuses automatically.

### 3. ShopScreen Upgrade Display

**File**: `/frontend/modules/shop/ShopScreen.tsx`

**Integration**: Replace placeholder with `UpgradeList` component (see Component Design section)

---

## Testing Strategy

### Unit Tests

**1. Upgrade Definitions Tests**

File: `/frontend/modules/upgrades/upgradeDefinitions.test.ts`

```typescript
describe('upgradeDefinitions', () => {
  test('exports 5 upgrades', () => {
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
  });

  test('getUpgradeById returns undefined for invalid ID', () => {
    const upgrade = getUpgradeById('invalid-id');
    expect(upgrade).toBeUndefined();
  });
});
```

**2. Purchase Logic Tests**

File: `/frontend/shared/store/gameStore.test.ts` (additions)

```typescript
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
});
```

**3. Effect Calculation Tests**

File: `/frontend/shared/store/gameStore.test.ts` (additions)

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
    gameState$.purchasedUpgrades.set(['pet-boost-1']); // Should not affect scrap bonus
    expect(totalScrapBonus$.get()).toBe(0);
  });

  test('updates reactively when purchases change', () => {
    expect(totalScrapBonus$.get()).toBe(0);

    gameState$.purchasedUpgrades.set(['scrap-boost-1']);
    expect(totalScrapBonus$.get()).toBe(0.1);

    gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-3']);
    expect(totalScrapBonus$.get()).toBe(0.35); // 0.1 + 0.25
  });
});

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
    gameState$.purchasedUpgrades.set(['scrap-boost-1']); // Should not affect pet bonus
    expect(totalPetBonus$.get()).toBe(0);
  });
});
```

**4. Persistence Tests**

File: `/frontend/shared/store/persistence.test.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePurchases, loadPurchases, clearPurchases } from './persistence';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('savePurchases writes to AsyncStorage', async () => {
    await savePurchases(['scrap-boost-1', 'pet-boost-1']);

    await new Promise(resolve => setTimeout(resolve, 1100)); // Wait for debounce

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'purchased-upgrades-v1',
      expect.stringContaining('"scrap-boost-1"')
    );
  });

  test('loadPurchases reads from AsyncStorage', async () => {
    const mockData = {
      version: 1,
      purchasedUpgrades: ['scrap-boost-1'],
      timestamp: Date.now(),
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

    const purchases = await loadPurchases();

    expect(purchases).toEqual(['scrap-boost-1']);
  });

  test('loadPurchases returns empty array if no data', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const purchases = await loadPurchases();

    expect(purchases).toEqual([]);
  });

  test('loadPurchases handles corrupted data gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

    const purchases = await loadPurchases();

    expect(purchases).toEqual([]);
  });

  test('clearPurchases removes data from AsyncStorage', async () => {
    await clearPurchases();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('purchased-upgrades-v1');
  });
});
```

### Component Tests

**5. UpgradeListItem Tests**

File: `/frontend/modules/upgrades/components/UpgradeListItem.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { UpgradeListItem } from './UpgradeListItem';

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
  test('renders upgrade name and description', () => {
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
    expect(screen.getByText('+50% test bonus')).toBeTruthy();
  });

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

  test('disables button during purchase', () => {
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

  test('has accessibility label', () => {
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
});
```

### Integration Tests

**6. End-to-End Purchase Flow**

File: `/frontend/modules/upgrades/upgrades.integration.test.ts`

```typescript
import { gameState$, purchaseUpgrade, totalScrapBonus$, totalPetBonus$ } from '../../shared/store/gameStore';
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
    const initialAvailable = availableUpgrades$.get().length;
    expect(initialAvailable).toBe(5);

    await purchaseUpgrade('scrap-boost-1');

    const newAvailable = availableUpgrades$.get().length;
    expect(newAvailable).toBe(4);

    const ids = availableUpgrades$.get().map(u => u.id);
    expect(ids).not.toContain('scrap-boost-1');
  });

  test('purchasing all upgrades results in empty available list', async () => {
    for (const upgrade of UPGRADE_DEFINITIONS) {
      await purchaseUpgrade(upgrade.id);
    }

    expect(availableUpgrades$.get()).toEqual([]);
  });

  test('scrap deducted correctly for each purchase', async () => {
    await purchaseUpgrade('scrap-boost-1'); // -100
    expect(gameState$.scrap.get()).toBe(4900);

    await purchaseUpgrade('scrap-boost-2'); // -500
    expect(gameState$.scrap.get()).toBe(4400);
  });
});
```

### Manual Testing Checklist

```markdown
## Upgrade Purchase Testing

### Purchase Flow
- [ ] Can purchase upgrade with exact scrap amount
- [ ] Can purchase upgrade with excess scrap
- [ ] Cannot purchase with insufficient scrap
- [ ] Cannot double-purchase by rapid tapping
- [ ] Cannot purchase already-owned upgrade

### UI States
- [ ] Available upgrade shows "Purchase" button (blue)
- [ ] Insufficient scrap upgrade shows "Need X more" (grayed)
- [ ] Purchased upgrade shows "✓ Purchased" badge
- [ ] Purchase button disabled during transaction

### Effect Application
- [ ] Scrap Finder increases scrap rate by 10%
- [ ] Scrap Magnet increases scrap rate by 15%
- [ ] Scrap Amplifier increases scrap rate by 25%
- [ ] Extra Feed adds +1 pet per feed
- [ ] Double Feed adds +2 pets per feed
- [ ] Multiple scrap upgrades stack correctly
- [ ] Multiple pet upgrades stack correctly

### Persistence
- [ ] Purchases persist after app restart
- [ ] Purchases persist after force quit
- [ ] Effects apply immediately after loading

### Accessibility
- [ ] All buttons meet 44×44pt minimum touch target
- [ ] Upgrade names readable (contrast ratio 4.5:1+)
- [ ] Screen reader announces upgrade details
- [ ] Disabled states communicated to screen reader

### Performance
- [ ] Purchase completes within 100ms
- [ ] No frame drops during purchase
- [ ] List scrolls smoothly with all 5 upgrades
- [ ] AsyncStorage write completes within 200ms
```

---

## Performance Considerations

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Purchase Transaction Time | <100ms | Time from button press to state update |
| AsyncStorage Write Time | <200ms | Time from state change to storage completion |
| UI Frame Rate | 60fps | During purchase and list scrolling |
| Effect Recalculation | <10ms | Time to recompute scrapRate$ or petBonus$ |

### Optimization Strategies

**1. Debounced Persistence**
- Batch rapid state changes into single AsyncStorage write
- 1000ms debounce window prevents excessive writes
- Reduces I/O overhead during rapid purchases (unlikely but possible)

**2. Computed Observables**
- Legend State automatically memoizes computed values
- `scrapRate$` only recomputes when `petCount` or `purchasedUpgrades` change
- Avoids unnecessary recalculations on every render

**3. Immutable Upgrade Catalog**
- `UPGRADE_DEFINITIONS` is constant, never changes
- No need to re-validate or re-filter catalog
- Safe to reference directly in components

**4. Filter Purchased Upgrades**
- `availableUpgrades$` computed observable filters out purchased
- Reduces list size over time (5 → 0 upgrades)
- Smaller lists = faster rendering

**5. Atomic State Updates**
- Single `gameState$.scrap.set()` call (not multiple)
- Single `gameState$.purchasedUpgrades.set()` call (not multiple)
- Minimizes Legend State observer notifications

### Performance Testing

```typescript
// Performance test for purchase transaction
test('purchase completes within 100ms', async () => {
  gameState$.scrap.set(1000);
  gameState$.purchasedUpgrades.set([]);

  const start = performance.now();
  await purchaseUpgrade('scrap-boost-1');
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(100);
});

// Performance test for effect calculation
test('scrapRate$ recomputes within 10ms', () => {
  gameState$.petCount.set(100);
  gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2']);

  const start = performance.now();
  const rate = scrapRate$.get();
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(10);
  expect(rate).toBeGreaterThan(0); // Sanity check
});
```

---

## Accessibility Requirements

### WCAG AA Compliance

**Text Contrast**:
- Upgrade names: 4.5:1 minimum (normal text)
- Descriptions: 4.5:1 minimum (normal text)
- Scrap costs: 4.5:1 minimum (normal text)
- Button text: 4.5:1 minimum (normal text)

**Touch Targets**:
- Purchase buttons: minimum 44×44pt
- Upgrade list items: minimum 44pt height
- Back button: minimum 44×44pt

**Screen Reader Support**:
```typescript
// Upgrade list item
accessibilityLabel={`${upgrade.name}, ${upgrade.description}, costs ${upgrade.scrapCost} scrap`}
accessibilityHint={canAfford && !isPurchased ? "Double tap to purchase" : undefined}
accessibilityState={{ disabled: !canAfford || isPurchased }}

// Purchase button
accessibilityRole="button"
accessibilityLabel={`Purchase ${upgrade.name} for ${upgrade.scrapCost} scrap`}

// Purchased badge
accessibilityLabel={`${upgrade.name} already purchased`}
```

### Accessibility Testing

**VoiceOver (iOS)**:
1. Navigate to shop screen
2. Swipe through upgrade list
3. Verify each upgrade announces name, description, cost
4. Verify available upgrades announce "Double tap to purchase"
5. Verify purchased upgrades announce "already purchased"
6. Verify insufficient scrap upgrades announce disabled state

**TalkBack (Android)**:
1. Same as VoiceOver tests
2. Verify touch exploration works for all buttons
3. Verify focus order is logical (top to bottom)

---

## Error Handling

### Error Types & User Feedback

| Error | User Message | Recovery |
|-------|-------------|----------|
| INSUFFICIENT_SCRAP | "Not enough scrap. You need X more scrap to purchase this upgrade." | Dismiss, continue playing |
| ALREADY_PURCHASED | "You already own this upgrade." | Dismiss (shouldn't happen if UI correct) |
| INVALID_UPGRADE_ID | "Upgrade not found. Please restart the app." | Restart app |
| PERSISTENCE_FAILED | "Purchase successful, but failed to save. Your purchase may be lost if you close the app. Please contact support." | Continue playing, retry save |

### Error Handling Implementation

```typescript
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

// In component:
const handlePurchase = async (upgradeId: string) => {
  const result = await purchaseUpgrade(upgradeId);

  if (!result.success) {
    Alert.alert(
      'Purchase Failed',
      getPurchaseErrorMessage(result.error),
      [{ text: 'OK' }]
    );
  }
};
```

### Logging & Debugging

```typescript
// Purchase function with logging
export async function purchaseUpgrade(upgradeId: string): Promise<PurchaseResult> {
  console.log('[PURCHASE] Attempting to purchase:', upgradeId);

  const upgrade = gameState$.upgrades.get().find(u => u.id === upgradeId);

  if (!upgrade) {
    console.error('[PURCHASE] Invalid upgrade ID:', upgradeId);
    return { success: false, error: PurchaseError.INVALID_UPGRADE_ID };
  }

  const alreadyPurchased = gameState$.purchasedUpgrades.get().includes(upgradeId);
  if (alreadyPurchased) {
    console.warn('[PURCHASE] Already purchased:', upgradeId);
    return { success: false, error: PurchaseError.ALREADY_PURCHASED };
  }

  const currentScrap = gameState$.scrap.get();
  if (currentScrap < upgrade.scrapCost) {
    console.warn('[PURCHASE] Insufficient scrap:', { currentScrap, required: upgrade.scrapCost });
    return { success: false, error: PurchaseError.INSUFFICIENT_SCRAP };
  }

  try {
    gameState$.scrap.set(prev => prev - upgrade.scrapCost);
    gameState$.purchasedUpgrades.set(prev => [...prev, upgradeId]);

    console.log('[PURCHASE] Success:', upgradeId);
    return { success: true };
  } catch (error) {
    console.error('[PURCHASE] Transaction failed:', error);
    return { success: false, error: PurchaseError.PERSISTENCE_FAILED };
  }
}
```

---

## Migration & Rollout

### Pre-Launch Checklist

**Code Readiness**:
- [ ] All 5 upgrades defined in `upgradeDefinitions.ts`
- [ ] Purchase logic implemented and tested
- [ ] Effect calculations implemented (scrap multiplier, pet bonus)
- [ ] Persistence layer integrated with AsyncStorage
- [ ] UI components created (UpgradeListItem, UpgradeList)
- [ ] ShopScreen integration complete
- [ ] ClickerScreen feed button updated with pet bonus

**Testing**:
- [ ] Unit tests pass (100% coverage for purchase logic)
- [ ] Component tests pass (UpgradeListItem, UpgradeList)
- [ ] Integration tests pass (end-to-end purchase flow)
- [ ] Manual testing complete (see checklist above)
- [ ] Accessibility testing complete (VoiceOver, TalkBack)
- [ ] Performance testing complete (purchase <100ms, 60fps)

**Documentation**:
- [ ] Code comments complete
- [ ] README updated with upgrade system overview
- [ ] User-facing help text added (if needed)

### Launch Plan

**Phase 1: Soft Launch (Week 1)**
- Deploy to internal testers (5-10 users)
- Monitor crash reports, AsyncStorage errors
- Collect feedback on upgrade costs and effects
- Verify persistence works across devices

**Phase 2: Beta Launch (Week 2)**
- Deploy to beta testers (50-100 users)
- Monitor purchase metrics (which upgrades purchased first)
- Track path diversity (scrap-first vs pet-first strategies)
- Adjust costs/effects if balance issues found

**Phase 3: Production Launch (Week 3)**
- Deploy to all users
- Monitor success metrics (see PRD Success Metrics section)
- Track error rates (purchase failures, persistence failures)
- Prepare hotfix if critical issues found

### Rollback Plan

**If Critical Bug Discovered**:
1. Revert deployment to previous version
2. Investigate issue in staging environment
3. Fix bug and re-test
4. Re-deploy with fix

**If Balance Issues Found**:
1. Do NOT revert (would lose user purchases)
2. Adjust upgrade costs/effects in next patch
3. Consider one-time scrap refund for affected users
4. Communicate changes to users via in-app announcement

### Data Migration

**Current State** (before upgrade system):
- No upgrade data exists
- No AsyncStorage key for purchases

**Migration Strategy**:
- No migration needed (new feature, no existing data)
- First-time users: empty purchased upgrades array
- Existing users: empty purchased upgrades array (everyone starts equal)

**Future Migrations** (if upgrade definitions change):
- Versioned storage key: `purchased-upgrades-v1`, `purchased-upgrades-v2`, etc.
- Migration logic in `loadPurchases()` to handle version changes
- Example: If upgrade IDs change, map old IDs to new IDs

---

## Open Questions & Decisions

### UX Decisions

**Q1: Should purchased upgrades remain visible in the shop?**

Options:
- **A**: Show purchased upgrades with "✓ Purchased" badge (lets players review what they own)
- **B**: Hide purchased upgrades completely (cleaner UI, shorter list)

**Recommendation**: Option A (show purchased)
- **Rationale**: Players may forget what they've purchased; showing purchased upgrades provides reminder and sense of progression
- **Implementation**: Filter `availableUpgrades$` in component logic (option to show all vs available only)

**Q2: Should we show a purchase confirmation dialog?**

Options:
- **A**: No confirmation (single-tap purchase)
- **B**: Confirmation dialog ("Are you sure you want to purchase X for Y scrap?")

**Recommendation**: Option A (no confirmation)
- **Rationale**: Purchases are permanent but not destructive; scrap is easily re-earned; confirmation adds friction
- **Future**: Add undo within 5 seconds if accidental taps become issue

**Q3: Should unaffordable upgrades show deficit or just be grayed?**

Options:
- **A**: Show "Need X more scrap" text
- **B**: Just gray out with no specific message

**Recommendation**: Option A (show deficit)
- **Rationale**: Helps players understand how far they are from affording upgrade; provides goal

**Q4: Should we show total bonuses in a stats screen?**

Options:
- **A**: Add stats screen showing "Total scrap multiplier: +25%", "Total pet bonus: +3"
- **B**: No stats screen, effects visible only in gameplay

**Recommendation**: Option B for MVP, Option A for P1
- **Rationale**: Stats screen nice-to-have but not critical; can add later if user feedback requests it

### Technical Decisions

**Q5: Should we use AsyncStorage or a database for persistence?**

**Decision**: AsyncStorage
- **Rationale**: Small data size (5 upgrade IDs max, ~50 bytes), no complex queries needed, simpler implementation

**Q6: Should we add analytics tracking for purchases?**

**Decision**: Not in MVP, add in P1
- **Rationale**: Focus on core functionality first; analytics can be layered on after launch

**Q7: Should we validate upgrade catalog integrity on app launch?**

**Decision**: Yes (in development mode only)
- **Rationale**: Catch definition errors early; no performance cost in production

```typescript
if (__DEV__) {
  // Validate upgrade definitions
  const ids = UPGRADE_DEFINITIONS.map(u => u.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== UPGRADE_DEFINITIONS.length) {
    console.error('Duplicate upgrade IDs detected!');
  }
}
```

**Q8: How should we handle AsyncStorage quota exceeded?**

**Decision**: Unlikely to occur (5 IDs = ~200 bytes, quota = 6MB), but handle gracefully
- **Implementation**: Catch quota exceeded error, alert user, continue with in-memory state only

---

## File Structure

```
frontend/
├── modules/
│   ├── upgrades/
│   │   ├── components/
│   │   │   ├── UpgradeListItem.tsx          [NEW]
│   │   │   ├── UpgradeListItem.test.tsx     [NEW]
│   │   │   ├── UpgradeList.tsx              [NEW]
│   │   │   └── UpgradeList.test.tsx         [NEW]
│   │   ├── specs/
│   │   │   ├── prd_upgrades_20251116.md     [EXISTING]
│   │   │   ├── tdd_upgrades_20251116.md     [THIS FILE]
│   │   │   └── feature-upgrades.md          [EXISTING]
│   │   ├── types.ts                          [NEW]
│   │   ├── upgradeDefinitions.ts             [NEW]
│   │   ├── upgradeDefinitions.test.ts        [NEW]
│   │   └── upgrades.integration.test.ts      [NEW]
│   │
│   ├── shop/
│   │   ├── ShopScreen.tsx                    [MODIFY]
│   │   └── ShopScreen.test.tsx               [MODIFY]
│   │
│   └── attack-button/
│       ├── ClickerScreen.tsx                 [MODIFY]
│       └── ClickerScreen.test.tsx            [MODIFY]
│
└── shared/
    ├── store/
    │   ├── gameStore.ts                       [MODIFY]
    │   ├── gameStore.test.ts                  [MODIFY]
    │   ├── persistence.ts                     [NEW]
    │   └── persistence.test.ts                [NEW]
    └── hooks/
        ├── useGameState.ts                    [MODIFY]
        └── useGameState.test.ts               [MODIFY]
```

---

## Implementation Checklist

### Phase 1: Data Layer (Days 1-2)

- [ ] Create `/frontend/modules/upgrades/types.ts` with type definitions
- [ ] Create `/frontend/modules/upgrades/upgradeDefinitions.ts` with 5 upgrades
- [ ] Write unit tests for upgrade definitions
- [ ] Create `/frontend/shared/store/persistence.ts` with AsyncStorage logic
- [ ] Write unit tests for persistence layer

### Phase 2: State Management (Days 3-4)

- [ ] Modify `gameStore.ts`: add `upgrades` and `purchasedUpgrades` observables
- [ ] Implement `totalScrapBonus$` computed observable
- [ ] Implement `totalPetBonus$` computed observable
- [ ] Update `getScrapMultiplier()` to use `totalScrapBonus$`
- [ ] Implement `purchaseUpgrade()` action
- [ ] Write unit tests for purchase logic
- [ ] Write unit tests for effect calculations
- [ ] Update `useGameState()` hook to expose new observables
- [ ] Add persistence onChange handler to gameStore

### Phase 3: UI Components (Days 5-7)

- [ ] Create `UpgradeListItem` component
- [ ] Write tests for `UpgradeListItem`
- [ ] Create `UpgradeList` component
- [ ] Write tests for `UpgradeList`
- [ ] Update `ShopScreen` to integrate `UpgradeList`
- [ ] Update `ShopScreen` tests
- [ ] Add purchase handler and error feedback to `ShopScreen`

### Phase 4: Game Integration (Days 8-9)

- [ ] Update `ClickerScreen` feed button to use `totalPetBonus$`
- [ ] Update `ClickerScreen` tests for pet bonus
- [ ] Verify scrap generation uses updated `scrapRate$` (no changes needed)
- [ ] Initialize upgrade definitions in `App.tsx`
- [ ] Initialize purchased upgrades from AsyncStorage in `App.tsx`

### Phase 5: Testing & Polish (Days 10-12)

- [ ] Write integration tests for end-to-end purchase flow
- [ ] Run full test suite (unit + component + integration)
- [ ] Manual testing on iOS device
- [ ] Manual testing on Android device
- [ ] Accessibility testing (VoiceOver, TalkBack)
- [ ] Performance testing (purchase speed, frame rate)
- [ ] Fix bugs and polish UI

### Phase 6: Documentation & Launch (Days 13-14)

- [ ] Update README with upgrade system overview
- [ ] Add code comments to complex logic
- [ ] Create launch plan document
- [ ] Deploy to internal testers
- [ ] Collect feedback and iterate
- [ ] Deploy to production

**Total Timeline: ~3 weeks (14 working days)**

---

## Appendix

### Legend State Patterns Reference

**Observable Creation**:
```typescript
export const gameState$ = observable({
  petCount: 0,
  scrap: 0,
});
```

**Computed Observable**:
```typescript
export const scrapRate$ = computed(() => {
  const petCount = gameState$.petCount.get();
  const multiplier = getScrapMultiplier();
  return Math.floor(petCount * multiplier);
});
```

**Reading Values**:
```typescript
const currentScrap = gameState$.scrap.get();
```

**Setting Values**:
```typescript
gameState$.scrap.set(100); // Absolute
gameState$.scrap.set(prev => prev + 50); // Functional
```

**Observing Changes**:
```typescript
gameState$.scrap.onChange((changes) => {
  console.log('Scrap changed:', changes.value);
});
```

**Using in Components** (with `observer` HOC):
```typescript
export const MyComponent = observer(function MyComponent() {
  const { scrap$ } = useGameState();

  return <Text>Scrap: {scrap$.get()}</Text>;
  // Component auto-re-renders when scrap$ changes
});
```

### AsyncStorage API Reference

**Set Item**:
```typescript
await AsyncStorage.setItem(key, JSON.stringify(value));
```

**Get Item**:
```typescript
const raw = await AsyncStorage.getItem(key);
const value = raw ? JSON.parse(raw) : null;
```

**Remove Item**:
```typescript
await AsyncStorage.removeItem(key);
```

**Error Handling**:
```typescript
try {
  await AsyncStorage.setItem(key, value);
} catch (error) {
  if (error.code === 'QUOTA_EXCEEDED') {
    // Handle quota exceeded
  }
}
```

### React Native Testing Library Patterns

**Rendering Components**:
```typescript
const { getByText, getByRole } = render(<MyComponent />);
```

**Querying Elements**:
```typescript
const button = screen.getByRole('button', { name: /purchase/i });
const text = screen.getByText(/scrap finder/i);
```

**Firing Events**:
```typescript
fireEvent.press(button);
fireEvent.changeText(input, 'new text');
```

**Async Utilities**:
```typescript
await waitFor(() => {
  expect(screen.getByText('Success')).toBeTruthy();
});
```

---

**Document Version**: v1.0
**Last Updated**: 2025-11-16
**Author**: Claude Code
**Status**: Ready for Implementation
