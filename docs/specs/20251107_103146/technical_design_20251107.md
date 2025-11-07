# Technical Design Document: Salvage & Tinkering System
## Progressive Automation Idle Game Mechanic

**Version:** 1.0
**Date:** 2025-11-07
**Status:** Design Phase
**Author:** System Architect

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Data Models](#data-models)
4. [State Management](#state-management)
5. [Module Design](#module-design)
6. [Core Systems](#core-systems)
7. [UI/UX Architecture](#uiux-architecture)
8. [Performance Specifications](#performance-specifications)
9. [Testing Strategy](#testing-strategy)
10. [Implementation Phases](#implementation-phases)
11. [Technical Risks & Mitigation](#technical-risks--mitigation)

---

## 1. Executive Summary

### 1.1 Overview
The Salvage & Tinkering System is a progressive automation idle game mechanic for a React Native mobile game. It implements a three-phase progression system where players transition from manual item salvaging and equipment tinkering to full automation with offline progress capabilities.

### 1.2 Core Design Philosophy
**"Manual → Semi-Auto → Full Automation"**

- **Phase 1 (L1-10)**: Manual foundation - direct player engagement
- **Phase 2 (L11-25)**: Assisted automation - hybrid manual + auto gameplay
- **Phase 3 (L26+)**: Full automation - offline progression and prestige

### 1.3 Technical Stack
```typescript
// Core Framework
React Native: 0.81.4
Expo SDK: 54.0.10
TypeScript: 5.9.2

// State Management
@legendapp/state: 3.0.0-beta.35
@legendapp/state/sync: (persistence)
@legendapp/state/persist-plugins/async-storage

// Animation & Effects
react-native-reanimated: 4.1.1
react-native-worklets: 0.5.1

// Device Features
expo-haptics: 15.0.7
expo-audio: 1.0.13

// Storage
@react-native-async-storage/async-storage: 2.2.0

// Testing
jest: 29.7.0
@testing-library/react-native: 13.3.3
jest-expo: 54.0.12
```

### 1.4 Performance Targets
| Metric | Target | Critical |
|--------|--------|----------|
| Frame Rate | 60 FPS | Yes |
| Load Time | <2 seconds | Yes |
| Memory Usage | <150MB | Yes |
| Crash Rate | <0.1% | Yes |
| Queue Processing | 60 FPS (16ms intervals) | Yes |
| AsyncStorage Writes | Max 1/second | No |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    App.tsx (Root)                        │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Game UI    │  │ Auto Manager │  │  Persistence │  │
│  │  Container  │  │   (60 FPS)   │  │    Layer     │  │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼────────────────┼──────────────────┼──────────┘
          │                │                  │
    ┌─────┴────────────────┴──────────────────┴─────┐
    │         Legend State Observable Store           │
    │                                                  │
    │  ┌───────────┐  ┌──────────┐  ┌────────────┐  │
    │  │ Salvage$  │  │Tinkering$│  │ Inventory$ │  │
    │  │           │  │          │  │            │  │
    │  └───────────┘  └──────────┘  └────────────┘  │
    │                                                  │
    │  ┌───────────┐  ┌──────────┐  ┌────────────┐  │
    │  │Materials$ │  │Equipment$│  │Automation$ │  │
    │  │           │  │          │  │            │  │
    │  └───────────┘  └──────────┘  └────────────┘  │
    │                                                  │
    │  ┌───────────────────────────────────────────┐ │
    │  │         Progression$                       │ │
    │  └───────────────────────────────────────────┘ │
    └──────────────────────────────────────────────────┘
                      │
            ┌─────────┴──────────┐
            │                    │
    ┌───────▼─────────┐  ┌──────▼────────┐
    │  AsyncStorage   │  │ Device APIs   │
    │  (Persistence)  │  │ (Haptics/Audio│
    └─────────────────┘  └───────────────┘
```

### 2.2 Module Structure

Following the existing codebase pattern (see `/frontend/modules/attributes/`), each system module follows this structure:

```
modules/
├── salvage/
│   ├── types.ts              # TypeScript interfaces
│   ├── salvageStore.ts       # Observable store + actions
│   ├── salvageLogic.ts       # Pure business logic
│   ├── SalvageView.tsx       # Main component
│   ├── components/
│   │   ├── SalvageQueue.tsx
│   │   ├── MaterialBurst.tsx
│   │   └── ComboIndicator.tsx
│   └── __tests__/
│       ├── salvageStore.test.ts
│       ├── salvageLogic.test.ts
│       └── SalvageView.test.tsx
│
├── tinkering/
│   ├── types.ts
│   ├── tinkeringStore.ts
│   ├── tinkeringLogic.ts
│   ├── TinkeringView.tsx
│   ├── components/
│   │   ├── EquipmentSlot.tsx
│   │   ├── TinkerButton.tsx
│   │   └── StatDisplay.tsx
│   └── __tests__/
│
├── inventory/
│   ├── types.ts
│   ├── inventoryStore.ts
│   ├── inventoryLogic.ts
│   ├── InventoryView.tsx
│   ├── components/
│   │   ├── ItemGrid.tsx
│   │   ├── ItemCard.tsx
│   │   └── FilterPanel.tsx
│   └── __tests__/
│
├── materials/
│   ├── types.ts
│   ├── materialsStore.ts
│   ├── materialsLogic.ts
│   ├── MaterialsView.tsx
│   ├── components/
│   │   ├── MaterialCounter.tsx
│   │   └── RefinementUI.tsx
│   └── __tests__/
│
├── equipment/
│   ├── types.ts
│   ├── equipmentStore.ts
│   ├── equipmentLogic.ts
│   ├── EquipmentView.tsx
│   ├── components/
│   │   ├── EquipmentGrid.tsx
│   │   └── StatUpgradeIndicator.tsx
│   └── __tests__/
│
├── automation/
│   ├── types.ts
│   ├── automationStore.ts
│   ├── automationEngine.ts  # 60 FPS processing
│   ├── AutomationDashboard.tsx
│   ├── components/
│   │   ├── AutoToggle.tsx
│   │   ├── UpgradeTree.tsx
│   │   ├── QueueViewer.tsx
│   │   └── PrioritySelector.tsx
│   └── __tests__/
│
└── progression/
    ├── types.ts
    ├── progressionStore.ts
    ├── progressionLogic.ts
    ├── ProgressionView.tsx
    ├── components/
    │   ├── LevelDisplay.tsx
    │   ├── UnlockNotification.tsx
    │   └── PrestigeModal.tsx
    └── __tests__/
```

### 2.3 Design Patterns

#### State-First Architecture (Legend State)
```typescript
// Pattern: Observable Store + Pure Logic + Actions

// 1. Define types (types.ts)
export interface SalvageState {
  queue: SalvageQueueItem[];
  comboMultiplier: number;
  lastClickTime: number;
}

// 2. Create observable store (salvageStore.ts)
export const salvage$ = observable<SalvageState>(
  synced({
    initial: { queue: [], comboMultiplier: 1, lastClickTime: 0 },
    persist: { name: 'salvage-storage' }
  })
);

// 3. Pure logic functions (salvageLogic.ts)
export const calculateSalvageTime = (
  baseTime: number,
  automationLevel: number
): number => {
  return baseTime * Math.pow(0.9, automationLevel);
};

// 4. Actions (salvageStore.ts)
export const startSalvage = (item: InventoryItem) => {
  const queueItem = createSalvageQueueItem(item);
  salvage$.queue.set(prev => [...prev, queueItem]);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};
```

#### Separation of Concerns
- **Types**: Pure TypeScript interfaces (no runtime code)
- **Stores**: State management + actions (side effects allowed)
- **Logic**: Pure functions (testable, no side effects)
- **Components**: React components (UI only)

---

## 3. Data Models

### 3.1 Core Type Definitions

#### Inventory Types
```typescript
// modules/inventory/types.ts

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemBase {
  id: string;                    // Unique item template ID
  name: string;                  // Display name
  description: string;           // Tooltip text
  rarity: ItemRarity;            // Rarity tier
  level: number;                 // Item level (for filtering)
  salvageTime: number;           // Base salvage time (seconds)
  materials: MaterialDrop[];     // What materials this drops
}

export interface MaterialDrop {
  materialId: string;            // References MaterialType.id
  minAmount: number;             // Minimum drop amount
  maxAmount: number;             // Maximum drop amount
  dropChance: number;            // Probability (0-1)
}

export interface InventoryItem extends ItemBase {
  instanceId: string;            // Unique instance identifier
  acquiredAt: number;            // Timestamp
  selected?: boolean;            // For batch operations
}

export interface InventoryState {
  items: InventoryItem[];        // All inventory items
  maxSlots: number;              // Inventory capacity
  filters: InventoryFilters;     // Active filters
}

export interface InventoryFilters {
  rarityThreshold?: ItemRarity;  // Show items >= this rarity
  levelThreshold?: number;       // Show items >= this level
  specificItems?: string[];      // Whitelist item IDs
  excludedItems?: string[];      // Blacklist item IDs
  enabled: boolean;              // Filters active
}
```

#### Salvage Types
```typescript
// modules/salvage/types.ts

export type SalvageStatus = 'queued' | 'processing' | 'completed';

export interface SalvageQueueItem {
  id: string;                    // Unique queue item ID
  itemInstanceId: string;        // References InventoryItem.instanceId
  itemBase: ItemBase;            // Copy of item data
  status: SalvageStatus;         // Current status
  progress: number;              // 0-1 completion percentage
  startTime: number;             // Timestamp started
  expectedEndTime: number;       // Timestamp expected completion
  comboMultiplier: number;       // Snapshot of combo at queue time
  autoSalvaged: boolean;         // Manually or auto-salvaged
}

export interface ComboState {
  multiplier: number;            // Current combo multiplier (1-5)
  clickCount: number;            // Clicks in current window
  lastClickTime: number;         // Last click timestamp
}

export interface SalvageState {
  queue: SalvageQueueItem[];     // Processing queue
  comboState: ComboState;        // Combo tracking
  totalSalvaged: number;         // Lifetime counter
  recentGains: MaterialGain[];   // Last 20 material gains
}

export interface MaterialGain {
  materialId: string;
  amount: number;
  timestamp: number;
  fromCombo?: boolean;           // Gained via combo bonus
}
```

#### Material Types
```typescript
// modules/materials/types.ts

export type MaterialRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface MaterialType {
  id: string;                    // Unique material ID
  name: string;                  // Display name
  description: string;           // Tooltip
  rarity: MaterialRarity;        // Rarity tier
  icon: string;                  // Icon asset path
  refinable: boolean;            // Can be refined
}

export interface MaterialInventory {
  [materialId: string]: number;  // Material ID -> quantity
}

export interface MaterialsState {
  inventory: MaterialInventory;  // Current material counts
  totalGained: MaterialInventory; // Lifetime totals
  recentGains: MaterialGain[];   // Last 20 gains (visual feedback)
}

export interface RefinementRecipe {
  inputMaterialId: string;       // Material to consume
  inputAmount: number;           // How many required
  outputMaterialId: string;      // Material to produce
  outputAmount: number;          // How many produced
  successRate: number;           // Probability (0-1)
}
```

#### Equipment Types
```typescript
// modules/equipment/types.ts

export type EquipmentSlot =
  | 'weapon'
  | 'helmet'
  | 'chest'
  | 'gloves'
  | 'legs'
  | 'boots';

export interface EquipmentStats {
  attack: number;
  defense: number;
  health: number;
  critChance: number;            // Percentage (0-100)
  critDamage: number;            // Multiplier (1.0+)
}

export interface Equipment {
  slot: EquipmentSlot;
  baseStats: EquipmentStats;     // Never changes
  currentStats: EquipmentStats;  // Modified by tinkering
  tinkerLevel: number;           // Number of successful tinkers
  totalTinkerAttempts: number;   // Includes failures
}

export interface EquipmentState {
  equipment: { [slot in EquipmentSlot]: Equipment };
  selectedSlot: EquipmentSlot | null;  // For tinkering UI
}
```

#### Tinkering Types
```typescript
// modules/tinkering/types.ts

export type TinkerStatus = 'idle' | 'selecting' | 'confirming' | 'processing';
export type TinkerResult = 'success' | 'failure' | 'critical';

export interface TinkerCost {
  [materialId: string]: number;  // Material requirements
}

export interface TinkerAttempt {
  id: string;
  slot: EquipmentSlot;
  cost: TinkerCost;
  result: TinkerResult | null;  // Null until resolved
  statGains?: Partial<EquipmentStats>; // Only if success
  timestamp: number;
  automated: boolean;
}

export interface TinkeringState {
  status: TinkerStatus;
  selectedSlot: EquipmentSlot | null;
  attemptHistory: TinkerAttempt[];  // Last 50 attempts
  totalAttempts: number;
  successCount: number;
  failureCount: number;
}
```

#### Automation Types
```typescript
// modules/automation/types.ts

export type AutomationType = 'salvage' | 'tinkering' | 'refinement';

export interface AutomationUnlock {
  id: string;                    // Unique unlock ID
  name: string;                  // Display name
  description: string;           // Tooltip
  type: AutomationType;          // What it automates
  unlockLevel: number;           // Required player level
  baseSpeed: number;             // Items per second
  queueSize: number;             // Max queue capacity
  cost: number;                  // Pyreal cost to unlock
}

export interface AutomationUpgrade {
  unlockId: string;              // Parent unlock
  level: number;                 // Current upgrade level
  maxLevel: number;              // Maximum level
  speedMultiplier: number;       // Speed increase per level
  queueIncrease: number;         // Queue size increase per level
  upgradeCost: number;           // Pyreal cost per level
}

export interface AutomationInstance {
  unlockId: string;              // Which automation
  enabled: boolean;              // Active/inactive
  currentLevel: number;          // Upgrade level
  processingSpeed: number;       // Current items/sec
  queueSize: number;             // Current max queue
  priority?: TinkerPriority;     // For tinkering automation
}

export interface AutomationState {
  unlocks: { [id: string]: AutomationUnlock };
  instances: { [id: string]: AutomationInstance };
  upgrades: { [id: string]: AutomationUpgrade };
  globalEnabled: boolean;        // Master on/off switch
}

export type TinkerPriority =
  | 'lowestFirst'    // Tinker equipment with lowest stats first
  | 'highestFirst'   // Tinker equipment with highest stats first
  | 'balancedStats'  // Prioritize equipment with uneven stats
  | 'specific';      // User-selected slot priority

export interface TinkeringPriorityState {
  mode: TinkerPriority;
  specificOrder?: EquipmentSlot[]; // If mode === 'specific'
}
```

#### Progression Types
```typescript
// modules/progression/types.ts

export interface PlayerLevel {
  current: number;               // Current level
  currentXP: number;             // XP in current level
  xpToNextLevel: number;         // XP required for next level
}

export interface PrestigeBonus {
  id: string;                    // Unique bonus ID
  name: string;                  // Display name
  description: string;           // Effect description
  duration: number;              // Seconds (0 = permanent)
  effect: PrestigeEffect;        // What it does
}

export type PrestigeEffectType =
  | 'materialBonus'    // Increase material gains
  | 'guaranteedRare'   // Guarantee rare drops
  | 'tinkerSpeed'      // Speed up tinkering
  | 'salvageSpeed'     // Speed up salvaging
  | 'xpBonus';         // Increase XP gains

export interface PrestigeEffect {
  type: PrestigeEffectType;
  value: number;                 // Magnitude of effect
}

export interface ActivePrestigeBonus {
  bonus: PrestigeBonus;
  activatedAt: number;           // Timestamp
  expiresAt: number;             // Timestamp (or Infinity)
}

export interface ProgressionState {
  level: PlayerLevel;
  prestigeCount: number;         // Times prestiged
  itemsSalvagedSincePrestige: number;
  activePrestigeBonuses: ActivePrestigeBonus[];
  unlockedFeatures: string[];    // Feature IDs unlocked
}
```

#### Offline Progress Types
```typescript
// modules/offline/types.ts

export interface OfflineSession {
  startTime: number;             // When app went background
  endTime: number;               // When app came foreground
  duration: number;              // Milliseconds offline
  cappedDuration: number;        // After 8-hour cap
}

export interface OfflineGains {
  itemsSalvaged: number;
  materialsGained: MaterialInventory;
  equipmentTinkered: { [slot in EquipmentSlot]?: number };
  xpGained: number;
  levelsGained: number;
}

export interface OfflineState {
  lastActiveTime: number;        // Last foreground timestamp
  totalOfflineTime: number;      // Lifetime offline time
  offlineSessions: OfflineSession[]; // Last 10 sessions
}
```

### 3.2 Derived/Computed State

```typescript
// Not stored - computed on-demand

export interface DerivedSalvageStats {
  currentQueueSize: number;      // salvage$.queue.length
  estimatedCompletionTime: number; // Based on queue
  itemsPerSecond: number;        // Current processing rate
  averageSalvageTime: number;    // Historical average
}

export interface DerivedTinkeringStats {
  totalCostForSlot: TinkerCost;  // Cost to tinker selected slot
  successProbability: number;    // Current success chance
  estimatedStatGains: EquipmentStats; // Expected gains
  canAfford: boolean;            // Has materials?
}

export interface DerivedProgressionStats {
  nextUnlock: AutomationUnlock | null; // Next feature to unlock
  levelsUntilNextUnlock: number;
  overallPower: number;          // Sum of equipment stats
  prestigeReady: boolean;        // 1000 items salvaged?
}
```

---

## 4. State Management

### 4.1 Legend State Architecture

Following the pattern established in `/frontend/modules/attributes/attributesStore.ts`, we use Legend State for reactive state management with AsyncStorage persistence.

#### Core Principles
1. **Observable-First**: All state is observable
2. **Automatic Persistence**: Synced to AsyncStorage
3. **Fine-Grained Reactivity**: Components re-render only when observed state changes
4. **Type-Safe**: Full TypeScript support

### 4.2 Store Configuration

#### Global Configuration
```typescript
// modules/shared/storeConfig.ts

import { configureSynced, synced } from '@legendapp/state/sync';
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure synced with AsyncStorage persistence
export const gameSynced = configureSynced(synced, {
  persist: {
    plugin: observablePersistAsyncStorage({ AsyncStorage })
  }
});

// Batch writes to AsyncStorage (max 1/second)
export const batchedGameSynced = configureSynced(synced, {
  persist: {
    plugin: observablePersistAsyncStorage({
      AsyncStorage,
      // Batch writes to reduce AsyncStorage calls
      onSetTimeout: (fn) => {
        if (batchTimeout) clearTimeout(batchTimeout);
        batchTimeout = setTimeout(fn, 1000); // Write at most every 1 second
      }
    })
  }
});

let batchTimeout: NodeJS.Timeout | null = null;
```

### 4.3 Store Implementations

#### Salvage Store
```typescript
// modules/salvage/salvageStore.ts

import { observable } from '@legendapp/state';
import { gameSynced } from '../shared/storeConfig';
import { SalvageState, SalvageQueueItem } from './types';
import * as Haptics from 'expo-haptics';
import {
  calculateSalvageTime,
  updateComboState,
  processSalvageProgress
} from './salvageLogic';
import { inventory$ } from '../inventory/inventoryStore';
import { materials$ } from '../materials/materialsStore';

// Observable store with persistence
export const salvage$ = observable<SalvageState>(
  gameSynced({
    initial: {
      queue: [],
      comboState: {
        multiplier: 1,
        clickCount: 0,
        lastClickTime: 0
      },
      totalSalvaged: 0,
      recentGains: []
    },
    persist: { name: 'salvage-storage' }
  })
);

// Actions

export const startManualSalvage = (itemInstanceId: string) => {
  const item = inventory$.items.get().find(i => i.instanceId === itemInstanceId);
  if (!item) return;

  // Update combo state
  const now = Date.now();
  const currentCombo = salvage$.comboState.get();
  const newCombo = updateComboState(currentCombo, now);
  salvage$.comboState.set(newCombo);

  // Create queue item
  const queueItem: SalvageQueueItem = {
    id: `salvage-${Date.now()}-${Math.random()}`,
    itemInstanceId: item.instanceId,
    itemBase: item,
    status: 'queued',
    progress: 0,
    startTime: now,
    expectedEndTime: now + (item.salvageTime * 1000),
    comboMultiplier: newCombo.multiplier,
    autoSalvaged: false
  };

  // Add to queue
  salvage$.queue.set(prev => [...prev, queueItem]);

  // Remove from inventory
  inventory$.items.set(prev => prev.filter(i => i.instanceId !== itemInstanceId));

  // Haptic feedback
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export const startAutoSalvage = (itemInstanceId: string) => {
  // Similar to manual but autoSalvaged: true, no combo bonus
  const item = inventory$.items.get().find(i => i.instanceId === itemInstanceId);
  if (!item) return;

  const now = Date.now();
  const queueItem: SalvageQueueItem = {
    id: `salvage-${Date.now()}-${Math.random()}`,
    itemInstanceId: item.instanceId,
    itemBase: item,
    status: 'queued',
    progress: 0,
    startTime: now,
    expectedEndTime: now + (item.salvageTime * 1000),
    comboMultiplier: 1, // No combo for auto
    autoSalvaged: true
  };

  salvage$.queue.set(prev => [...prev, queueItem]);
  inventory$.items.set(prev => prev.filter(i => i.instanceId !== itemInstanceId));
};

export const processSalvageQueue = () => {
  // Called by automation engine at 60 FPS
  const now = Date.now();
  const queue = salvage$.queue.get();

  queue.forEach((item, index) => {
    if (item.status === 'completed') {
      // Complete and award materials
      completeSalvageItem(item);
      // Remove from queue
      salvage$.queue[index].set(null as any); // Marks for deletion
    } else {
      // Update progress
      const newProgress = processSalvageProgress(item, now);
      salvage$.queue[index].progress.set(newProgress);
      if (newProgress >= 1.0) {
        salvage$.queue[index].status.set('completed');
      }
    }
  });

  // Clean up completed items
  salvage$.queue.set(prev => prev.filter(item => item !== null));
};

const completeSalvageItem = (queueItem: SalvageQueueItem) => {
  // Roll for materials
  const materialsGained: MaterialGain[] = [];

  queueItem.itemBase.materials.forEach(materialDrop => {
    if (Math.random() < materialDrop.dropChance) {
      const baseAmount = Math.floor(
        Math.random() * (materialDrop.maxAmount - materialDrop.minAmount + 1)
        + materialDrop.minAmount
      );
      const finalAmount = Math.floor(baseAmount * queueItem.comboMultiplier);

      // Add to materials inventory
      materials$.inventory[materialDrop.materialId].set(prev => prev + finalAmount);

      materialsGained.push({
        materialId: materialDrop.materialId,
        amount: finalAmount,
        timestamp: Date.now(),
        fromCombo: queueItem.comboMultiplier > 1
      });
    }
  });

  // Update stats
  salvage$.totalSalvaged.set(prev => prev + 1);
  salvage$.recentGains.set(prev => {
    const updated = [...materialsGained, ...prev];
    return updated.slice(0, 20); // Keep last 20
  });

  // Haptic feedback
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// Computed values
export const getSalvageQueueSize = () => salvage$.queue.get().length;
export const isComboActive = () => salvage$.comboState.multiplier.get() > 1;
```

#### Tinkering Store
```typescript
// modules/tinkering/tinkeringStore.ts

import { observable } from '@legendapp/state';
import { gameSynced } from '../shared/storeConfig';
import { TinkeringState, TinkerAttempt, TinkerResult } from './types';
import { equipment$ } from '../equipment/equipmentStore';
import { materials$ } from '../materials/materialsStore';
import {
  calculateTinkerCost,
  calculateStatGains,
  rollTinkerSuccess
} from './tinkeringLogic';
import * as Haptics from 'expo-haptics';

export const tinkering$ = observable<TinkeringState>(
  gameSynced({
    initial: {
      status: 'idle',
      selectedSlot: null,
      attemptHistory: [],
      totalAttempts: 0,
      successCount: 0,
      failureCount: 0
    },
    persist: { name: 'tinkering-storage' }
  })
);

// Actions

export const selectSlotForTinkering = (slot: EquipmentSlot) => {
  tinkering$.selectedSlot.set(slot);
  tinkering$.status.set('selecting');
};

export const attemptTinker = (slot: EquipmentSlot, automated: boolean = false) => {
  const equipmentPiece = equipment$.equipment[slot].get();
  const cost = calculateTinkerCost(equipmentPiece.tinkerLevel);

  // Check materials
  const canAfford = Object.entries(cost).every(([matId, amount]) => {
    return (materials$.inventory[matId].get() || 0) >= amount;
  });

  if (!canAfford) {
    if (!automated) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    return false;
  }

  // Consume materials
  Object.entries(cost).forEach(([matId, amount]) => {
    materials$.inventory[matId].set(prev => prev - amount);
  });

  // Roll for success
  const result: TinkerResult = rollTinkerSuccess(equipmentPiece.tinkerLevel);

  const attempt: TinkerAttempt = {
    id: `tinker-${Date.now()}-${Math.random()}`,
    slot,
    cost,
    result,
    timestamp: Date.now(),
    automated
  };

  if (result === 'success' || result === 'critical') {
    const statGains = calculateStatGains(equipmentPiece.tinkerLevel, result === 'critical');
    attempt.statGains = statGains;

    // Apply stat gains
    Object.entries(statGains).forEach(([stat, value]) => {
      equipment$.equipment[slot].currentStats[stat as keyof EquipmentStats].set(
        prev => prev + value
      );
    });

    // Increment tinker level
    equipment$.equipment[slot].tinkerLevel.set(prev => prev + 1);

    tinkering$.successCount.set(prev => prev + 1);

    if (!automated) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } else {
    // Failure
    tinkering$.failureCount.set(prev => prev + 1);

    if (!automated) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  // Update history
  tinkering$.totalAttempts.set(prev => prev + 1);
  equipment$.equipment[slot].totalTinkerAttempts.set(prev => prev + 1);
  tinkering$.attemptHistory.set(prev => {
    const updated = [attempt, ...prev];
    return updated.slice(0, 50); // Keep last 50
  });

  return true;
};

// Computed values
export const canAffordTinker = (slot: EquipmentSlot): boolean => {
  const equipmentPiece = equipment$.equipment[slot].get();
  const cost = calculateTinkerCost(equipmentPiece.tinkerLevel);
  return Object.entries(cost).every(([matId, amount]) => {
    return (materials$.inventory[matId].get() || 0) >= amount;
  });
};
```

#### Automation Store
```typescript
// modules/automation/automationStore.ts

import { observable } from '@legendapp/state';
import { gameSynced } from '../shared/storeConfig';
import { AutomationState, AutomationInstance } from './types';
import { AUTOMATION_UNLOCKS } from './automationData';

export const automation$ = observable<AutomationState>(
  gameSynced({
    initial: {
      unlocks: AUTOMATION_UNLOCKS,
      instances: {},
      upgrades: {},
      globalEnabled: false
    },
    persist: { name: 'automation-storage' }
  })
);

// Actions

export const unlockAutomation = (unlockId: string): boolean => {
  const unlock = automation$.unlocks[unlockId].get();
  if (!unlock) return false;

  // Check if already unlocked
  if (automation$.instances[unlockId].get()) return false;

  // Create instance
  const instance: AutomationInstance = {
    unlockId,
    enabled: true,
    currentLevel: 1,
    processingSpeed: unlock.baseSpeed,
    queueSize: unlock.queueSize,
  };

  automation$.instances[unlockId].set(instance);
  automation$.globalEnabled.set(true);

  return true;
};

export const toggleAutomation = (unlockId: string) => {
  const instance = automation$.instances[unlockId];
  if (!instance.get()) return;

  instance.enabled.set(prev => !prev);
};

export const upgradeAutomation = (unlockId: string): boolean => {
  const instance = automation$.instances[unlockId].get();
  if (!instance) return false;

  const upgrade = automation$.upgrades[unlockId].get();
  if (upgrade && instance.currentLevel >= upgrade.maxLevel) return false;

  // Upgrade logic here (cost checking, etc.)

  automation$.instances[unlockId].currentLevel.set(prev => prev + 1);

  return true;
};

export const setTinkeringPriority = (unlockId: string, priority: TinkerPriority) => {
  const instance = automation$.instances[unlockId];
  if (!instance.get()) return;

  instance.priority.set(priority);
};

// Computed values
export const isAutomationUnlocked = (unlockId: string): boolean => {
  return !!automation$.instances[unlockId].get();
};

export const getActiveAutomations = (): AutomationInstance[] => {
  return Object.values(automation$.instances.get()).filter(inst => inst.enabled);
};
```

### 4.4 Persistence Strategy

#### Batched Writes
```typescript
// modules/shared/persistenceManager.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

class PersistenceManager {
  private writeQueue: Map<string, any> = new Map();
  private writeTimeout: NodeJS.Timeout | null = null;
  private readonly WRITE_DELAY = 1000; // 1 second

  queueWrite(key: string, value: any) {
    this.writeQueue.set(key, value);

    if (this.writeTimeout) {
      clearTimeout(this.writeTimeout);
    }

    this.writeTimeout = setTimeout(() => {
      this.flushWrites();
    }, this.WRITE_DELAY);
  }

  async flushWrites() {
    if (this.writeQueue.size === 0) return;

    const writes = Array.from(this.writeQueue.entries()).map(([key, value]) =>
      [key, JSON.stringify(value)] as [string, string]
    );

    try {
      await AsyncStorage.multiSet(writes);
      this.writeQueue.clear();
    } catch (error) {
      console.error('Failed to persist state:', error);
      // Retry logic could go here
    }
  }

  async loadAll(keys: string[]): Promise<Map<string, any>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result = new Map();

      pairs.forEach(([key, value]) => {
        if (value) {
          try {
            result.set(key, JSON.parse(value));
          } catch (e) {
            console.error(`Failed to parse stored value for ${key}:`, e);
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to load state:', error);
      return new Map();
    }
  }
}

export const persistenceManager = new PersistenceManager();
```

---

## 5. Module Design

### 5.1 Salvage Module

#### Salvage Logic (Pure Functions)
```typescript
// modules/salvage/salvageLogic.ts

import { ComboState, SalvageQueueItem } from './types';

const COMBO_WINDOW = 1000; // 1 second
const MAX_COMBO_MULTIPLIER = 5;
const CLICKS_PER_COMBO_LEVEL = 10;

export const updateComboState = (
  currentCombo: ComboState,
  clickTime: number
): ComboState => {
  const timeSinceLastClick = clickTime - currentCombo.lastClickTime;

  if (timeSinceLastClick > COMBO_WINDOW) {
    // Combo expired
    return {
      multiplier: 1,
      clickCount: 1,
      lastClickTime: clickTime
    };
  }

  // Increment click count
  const newClickCount = currentCombo.clickCount + 1;
  const newMultiplier = Math.min(
    Math.floor(newClickCount / CLICKS_PER_COMBO_LEVEL) + 1,
    MAX_COMBO_MULTIPLIER
  );

  return {
    multiplier: newMultiplier,
    clickCount: newClickCount,
    lastClickTime: clickTime
  };
};

export const calculateSalvageTime = (
  baseTime: number,
  automationLevel: number
): number => {
  // Each automation level reduces time by 10%
  return baseTime * Math.pow(0.9, automationLevel);
};

export const processSalvageProgress = (
  queueItem: SalvageQueueItem,
  currentTime: number
): number => {
  const elapsed = currentTime - queueItem.startTime;
  const total = queueItem.expectedEndTime - queueItem.startTime;
  return Math.min(elapsed / total, 1.0);
};

export const shouldTriggerComboEffect = (comboState: ComboState): boolean => {
  return comboState.multiplier > 1 &&
         comboState.clickCount % CLICKS_PER_COMBO_LEVEL === 0;
};
```

#### Salvage Components
```typescript
// modules/salvage/components/SalvageQueue.tsx

import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { observer } from '@legendapp/state/react';
import { salvage$ } from '../salvageStore';
import { SalvageQueueItem as QueueItemComponent } from './SalvageQueueItem';

export const SalvageQueue = observer(() => {
  const queue = salvage$.queue.use(); // Reactive hook

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Salvage Queue ({queue.length})
      </Text>
      <FlatList
        data={queue}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <QueueItemComponent queueItem={item} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Queue is empty</Text>
        }
      />
    </View>
  );
});

// modules/salvage/components/SalvageQueueItem.tsx

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';
import { SalvageQueueItem as QueueItemType } from '../types';

interface Props {
  queueItem: QueueItemType;
}

export const SalvageQueueItem: React.FC<Props> = ({ queueItem }) => {
  const progress = useSharedValue(queueItem.progress);

  useEffect(() => {
    progress.value = withTiming(queueItem.progress, { duration: 16 }); // 60 FPS
  }, [queueItem.progress]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`
  }));

  return (
    <View style={styles.item}>
      <Text style={styles.itemName}>{queueItem.itemBase.name}</Text>
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, progressBarStyle]} />
      </View>
      {queueItem.comboMultiplier > 1 && (
        <Text style={styles.combo}>x{queueItem.comboMultiplier}</Text>
      )}
    </View>
  );
};

// modules/salvage/components/ComboIndicator.tsx

import React from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { observer } from '@legendapp/state/react';
import { salvage$ } from '../salvageStore';

export const ComboIndicator = observer(() => {
  const comboState = salvage$.comboState.use();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (comboState.multiplier > 1) {
      scale.value = withSequence(
        withTiming(1.3, { duration: 100 }),
        withTiming(1.0, { duration: 100 })
      );
    }
  }, [comboState.multiplier]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  if (comboState.multiplier <= 1) return null;

  return (
    <Animated.View style={[styles.comboContainer, animatedStyle]}>
      <Text style={styles.comboText}>
        COMBO x{comboState.multiplier}
      </Text>
      <Text style={styles.comboSubtext}>
        {comboState.clickCount} clicks
      </Text>
    </Animated.View>
  );
});
```

### 5.2 Automation Module

#### Automation Engine (60 FPS Processing)
```typescript
// modules/automation/automationEngine.ts

import { salvage$, processSalvageQueue } from '../salvage/salvageStore';
import { tinkering$, attemptTinker } from '../tinkering/tinkeringStore';
import { automation$, getActiveAutomations } from './automationStore';
import { inventory$ } from '../inventory/inventoryStore';
import { applyInventoryFilters } from '../inventory/inventoryLogic';

class AutomationEngine {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly TARGET_FPS = 60;
  private readonly FRAME_TIME = 1000 / this.TARGET_FPS;

  private lastFrameTime = 0;
  private frameCount = 0;
  private actualFPS = 60;

  start() {
    if (this.intervalId) return; // Already running

    this.lastFrameTime = Date.now();
    this.intervalId = setInterval(() => {
      this.processFrame();
    }, this.FRAME_TIME);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private processFrame() {
    const now = Date.now();
    const deltaTime = now - this.lastFrameTime;

    // Update FPS counter
    this.frameCount++;
    if (this.frameCount % 60 === 0) {
      this.actualFPS = 1000 / deltaTime;
    }

    // Check if automation is globally enabled
    if (!automation$.globalEnabled.get()) {
      this.lastFrameTime = now;
      return;
    }

    // Process all active automations
    const activeAutomations = getActiveAutomations();

    activeAutomations.forEach(automation => {
      const unlock = automation$.unlocks[automation.unlockId].get();

      switch (unlock.type) {
        case 'salvage':
          this.processSalvageAutomation(automation, deltaTime);
          break;
        case 'tinkering':
          this.processTinkeringAutomation(automation, deltaTime);
          break;
        case 'refinement':
          this.processRefinementAutomation(automation, deltaTime);
          break;
      }
    });

    // Always process salvage queue (manual + auto)
    processSalvageQueue();

    this.lastFrameTime = now;
  }

  private processSalvageAutomation(
    automation: AutomationInstance,
    deltaTime: number
  ) {
    const currentQueueSize = salvage$.queue.get().length;

    // Don't add more if queue is full
    if (currentQueueSize >= automation.queueSize) return;

    // Calculate how many items to process this frame
    const itemsPerMs = automation.processingSpeed / 1000;
    const itemsThisFrame = itemsPerMs * deltaTime;

    // Only process if we've accumulated enough time for at least 1 item
    if (itemsThisFrame < 1 && Math.random() > itemsThisFrame) return;

    // Get filtered inventory items
    const inventory = inventory$.items.get();
    const filters = inventory$.filters.get();
    const eligibleItems = filters.enabled
      ? applyInventoryFilters(inventory, filters)
      : inventory;

    if (eligibleItems.length === 0) return;

    // Add items to salvage queue
    const itemsToAdd = Math.min(
      Math.floor(itemsThisFrame),
      automation.queueSize - currentQueueSize,
      eligibleItems.length
    );

    for (let i = 0; i < itemsToAdd; i++) {
      startAutoSalvage(eligibleItems[i].instanceId);
    }
  }

  private tinkeringAccumulator = 0;

  private processTinkeringAutomation(
    automation: AutomationInstance,
    deltaTime: number
  ) {
    // Tinkering is slower, accumulate time
    this.tinkeringAccumulator += deltaTime;

    const msPerAttempt = 1000 / automation.processingSpeed;

    if (this.tinkeringAccumulator < msPerAttempt) return;

    this.tinkeringAccumulator -= msPerAttempt;

    // Determine which slot to tinker based on priority
    const slot = this.selectTinkeringSlot(automation.priority);
    if (slot) {
      attemptTinker(slot, true); // true = automated
    }
  }

  private selectTinkeringSlot(
    priority: TinkerPriority | undefined
  ): EquipmentSlot | null {
    const equipment = equipment$.equipment.get();
    const slots: EquipmentSlot[] = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots'];

    switch (priority) {
      case 'lowestFirst':
        return slots.reduce((lowest, slot) => {
          const current = equipment[slot].tinkerLevel;
          const lowestLevel = equipment[lowest].tinkerLevel;
          return current < lowestLevel ? slot : lowest;
        });

      case 'highestFirst':
        return slots.reduce((highest, slot) => {
          const current = equipment[slot].tinkerLevel;
          const highestLevel = equipment[highest].tinkerLevel;
          return current > highestLevel ? slot : highest;
        });

      case 'balancedStats':
        // Find equipment with most uneven stats
        return slots.reduce((mostUneven, slot) => {
          const stats = Object.values(equipment[slot].currentStats);
          const variance = this.calculateVariance(stats);
          const currentVariance = this.calculateVariance(
            Object.values(equipment[mostUneven].currentStats)
          );
          return variance > currentVariance ? slot : mostUneven;
        });

      case 'specific':
        // Use specificOrder if provided
        const specificOrder = automation.get().priority?.specificOrder;
        if (specificOrder && specificOrder.length > 0) {
          return specificOrder[0]; // First in priority list
        }
        return slots[0];

      default:
        return slots[0]; // Default to weapon
    }
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return variance;
  }

  private processRefinementAutomation(
    automation: AutomationInstance,
    deltaTime: number
  ) {
    // Phase 2+ feature - refines common materials to rare
    // Implementation similar to tinkering automation
  }

  // Public getters
  getCurrentFPS(): number {
    return this.actualFPS;
  }
}

export const automationEngine = new AutomationEngine();

// Start engine when app launches
export const initializeAutomationEngine = () => {
  automationEngine.start();
};
```

#### Automation UI
```typescript
// modules/automation/components/AutomationDashboard.tsx

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { observer } from '@legendapp/state/react';
import { automation$ } from '../automationStore';
import { AutomationCard } from './AutomationCard';

export const AutomationDashboard = observer(() => {
  const instances = automation$.instances.use();
  const globalEnabled = automation$.globalEnabled.use();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Automation Dashboard</Text>
        <MasterToggle
          enabled={globalEnabled}
          onToggle={() => automation$.globalEnabled.set(!globalEnabled)}
        />
      </View>

      <View style={styles.automationList}>
        {Object.values(instances).map(instance => (
          <AutomationCard
            key={instance.unlockId}
            instance={instance}
          />
        ))}
      </View>
    </ScrollView>
  );
});

// modules/automation/components/AutomationCard.tsx

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AutomationInstance } from '../types';
import { toggleAutomation, upgradeAutomation } from '../automationStore';

interface Props {
  instance: AutomationInstance;
}

export const AutomationCard: React.FC<Props> = ({ instance }) => {
  const unlock = automation$.unlocks[instance.unlockId].use();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{unlock.name}</Text>
        <ToggleSwitch
          enabled={instance.enabled}
          onToggle={() => toggleAutomation(instance.unlockId)}
        />
      </View>

      <Text style={styles.description}>{unlock.description}</Text>

      <View style={styles.stats}>
        <StatRow label="Speed" value={`${instance.processingSpeed.toFixed(2)}/s`} />
        <StatRow label="Queue" value={`${instance.queueSize}`} />
        <StatRow label="Level" value={`${instance.currentLevel}`} />
      </View>

      <Pressable
        style={styles.upgradeButton}
        onPress={() => upgradeAutomation(instance.unlockId)}
      >
        <Text style={styles.upgradeText}>Upgrade</Text>
      </Pressable>
    </View>
  );
};
```

### 5.3 Testing Module Structure

#### Unit Tests Example
```typescript
// modules/salvage/__tests__/salvageLogic.test.ts

import {
  updateComboState,
  calculateSalvageTime,
  processSalvageProgress,
  shouldTriggerComboEffect
} from '../salvageLogic';
import { ComboState, SalvageQueueItem } from '../types';

describe('salvageLogic', () => {
  describe('updateComboState', () => {
    it('should start combo at multiplier 1', () => {
      const initialCombo: ComboState = {
        multiplier: 1,
        clickCount: 0,
        lastClickTime: 0
      };

      const result = updateComboState(initialCombo, 1000);

      expect(result.multiplier).toBe(1);
      expect(result.clickCount).toBe(1);
      expect(result.lastClickTime).toBe(1000);
    });

    it('should increase multiplier after 10 clicks', () => {
      let combo: ComboState = {
        multiplier: 1,
        clickCount: 9,
        lastClickTime: 1000
      };

      combo = updateComboState(combo, 1500);

      expect(combo.multiplier).toBe(2);
      expect(combo.clickCount).toBe(10);
    });

    it('should reset combo after window expires', () => {
      const combo: ComboState = {
        multiplier: 3,
        clickCount: 25,
        lastClickTime: 1000
      };

      const result = updateComboState(combo, 3000); // 2 seconds later

      expect(result.multiplier).toBe(1);
      expect(result.clickCount).toBe(1);
    });

    it('should cap multiplier at 5', () => {
      let combo: ComboState = {
        multiplier: 5,
        clickCount: 50,
        lastClickTime: 1000
      };

      combo = updateComboState(combo, 1500);

      expect(combo.multiplier).toBe(5); // Should not exceed 5
    });
  });

  describe('calculateSalvageTime', () => {
    it('should return base time at level 0', () => {
      expect(calculateSalvageTime(1.0, 0)).toBe(1.0);
    });

    it('should reduce time by 10% per level', () => {
      expect(calculateSalvageTime(1.0, 1)).toBeCloseTo(0.9);
      expect(calculateSalvageTime(1.0, 2)).toBeCloseTo(0.81);
      expect(calculateSalvageTime(1.0, 5)).toBeCloseTo(0.59);
    });
  });

  describe('processSalvageProgress', () => {
    it('should calculate progress correctly', () => {
      const queueItem: SalvageQueueItem = {
        id: 'test',
        itemInstanceId: 'item-1',
        itemBase: {} as any,
        status: 'processing',
        progress: 0,
        startTime: 1000,
        expectedEndTime: 2000,
        comboMultiplier: 1,
        autoSalvaged: false
      };

      expect(processSalvageProgress(queueItem, 1000)).toBe(0.0);
      expect(processSalvageProgress(queueItem, 1500)).toBe(0.5);
      expect(processSalvageProgress(queueItem, 2000)).toBe(1.0);
      expect(processSalvageProgress(queueItem, 2500)).toBe(1.0); // Capped
    });
  });
});

// modules/salvage/__tests__/salvageStore.test.ts

import { salvage$, startManualSalvage } from '../salvageStore';
import { inventory$ } from '../../inventory/inventoryStore';
import { InventoryItem } from '../../inventory/types';

describe('salvageStore', () => {
  beforeEach(() => {
    // Reset stores
    salvage$.set({
      queue: [],
      comboState: { multiplier: 1, clickCount: 0, lastClickTime: 0 },
      totalSalvaged: 0,
      recentGains: []
    });

    inventory$.items.set([]);
  });

  describe('startManualSalvage', () => {
    it('should add item to queue and remove from inventory', () => {
      const testItem: InventoryItem = {
        id: 'sword-1',
        instanceId: 'sword-instance-1',
        name: 'Rusty Sword',
        description: 'An old sword',
        rarity: 'common',
        level: 1,
        salvageTime: 0.5,
        materials: [],
        acquiredAt: Date.now()
      };

      inventory$.items.set([testItem]);

      startManualSalvage('sword-instance-1');

      expect(salvage$.queue.get().length).toBe(1);
      expect(inventory$.items.get().length).toBe(0);
      expect(salvage$.queue.get()[0].itemInstanceId).toBe('sword-instance-1');
    });

    it('should update combo state on consecutive clicks', () => {
      const testItem: InventoryItem = {
        id: 'sword-1',
        instanceId: 'sword-instance-1',
        name: 'Rusty Sword',
        description: 'An old sword',
        rarity: 'common',
        level: 1,
        salvageTime: 0.5,
        materials: [],
        acquiredAt: Date.now()
      };

      inventory$.items.set([testItem, { ...testItem, instanceId: 'sword-instance-2' }]);

      startManualSalvage('sword-instance-1');
      startManualSalvage('sword-instance-2');

      const combo = salvage$.comboState.get();
      expect(combo.clickCount).toBe(2);
    });
  });
});
```

---

## 6. Core Systems

### 6.1 Combat Integration

The Salvage & Tinkering system integrates with the existing combat system to provide items for salvaging and utilize equipment stats.

```typescript
// modules/combat/combatIntegration.ts

import { inventory$ } from '../inventory/inventoryStore';
import { equipment$, getTotalStats } from '../equipment/equipmentStore';
import { InventoryItem } from '../inventory/types';
import { ITEM_DROP_TABLES } from './dropTables';

export const onEnemyDefeated = (enemyId: string, enemyLevel: number) => {
  // Roll for item drops
  const droppedItems = rollItemDrops(enemyId, enemyLevel);

  // Add to inventory
  droppedItems.forEach(item => {
    addItemToInventory(item);
  });
};

export const calculatePlayerDamage = (baseDamage: number): number => {
  const totalStats = getTotalStats();

  let damage = baseDamage + totalStats.attack;

  // Roll for critical hit
  if (Math.random() * 100 < totalStats.critChance) {
    damage *= totalStats.critDamage;
  }

  return Math.floor(damage);
};

const rollItemDrops = (enemyId: string, enemyLevel: number): InventoryItem[] => {
  const dropTable = ITEM_DROP_TABLES[enemyId] || ITEM_DROP_TABLES.default;
  const drops: InventoryItem[] = [];

  dropTable.forEach(dropEntry => {
    if (Math.random() < dropEntry.chance) {
      const item = createItemInstance(dropEntry.itemId, enemyLevel);
      drops.push(item);
    }
  });

  return drops;
};

const createItemInstance = (itemId: string, level: number): InventoryItem => {
  const template = ITEM_TEMPLATES[itemId];

  return {
    ...template,
    instanceId: `${itemId}-${Date.now()}-${Math.random()}`,
    level,
    acquiredAt: Date.now()
  };
};

const addItemToInventory = (item: InventoryItem) => {
  const currentItems = inventory$.items.get();
  const maxSlots = inventory$.maxSlots.get();

  if (currentItems.length >= maxSlots) {
    // Inventory full - could trigger notification
    return;
  }

  inventory$.items.set(prev => [...prev, item]);
};
```

### 6.2 Progression System

```typescript
// modules/progression/progressionLogic.ts

export const calculateXPForLevel = (level: number): number => {
  // Exponential scaling: 100 * (1.15 ^ (level - 1))
  return Math.floor(100 * Math.pow(1.15, level - 1));
};

export const addXP = (amount: number) => {
  let currentXP = progression$.level.currentXP.get() + amount;
  let currentLevel = progression$.level.current.get();
  let xpForNext = progression$.level.xpToNextLevel.get();

  // Level up loop
  while (currentXP >= xpForNext) {
    currentXP -= xpForNext;
    currentLevel += 1;
    xpForNext = calculateXPForLevel(currentLevel + 1);

    // Handle level up
    onLevelUp(currentLevel);
  }

  // Update state
  progression$.level.current.set(currentLevel);
  progression$.level.currentXP.set(currentXP);
  progression$.level.xpToNextLevel.set(xpForNext);
};

const onLevelUp = (newLevel: number) => {
  // Grant attribute points
  grantAttributePoints(1);

  // Check for automation unlocks
  checkAutomationUnlocks(newLevel);

  // Show level up notification
  showLevelUpNotification(newLevel);

  // Haptic feedback
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

const checkAutomationUnlocks = (level: number) => {
  const unlocks = automation$.unlocks.get();

  Object.values(unlocks).forEach(unlock => {
    if (unlock.unlockLevel === level && !isAutomationUnlocked(unlock.id)) {
      // Show unlock notification
      showUnlockNotification(unlock);

      // Add to unlocked features list
      progression$.unlockedFeatures.set(prev => [...prev, unlock.id]);
    }
  });
};
```

### 6.3 Offline Progress System

```typescript
// modules/offline/offlineManager.ts

import { AppState, AppStateStatus } from 'react-native';
import { offline$, progression$ } from './stores';
import { automationEngine } from '../automation/automationEngine';

class OfflineManager {
  private appStateSubscription: any;

  initialize() {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        this.handleAppForeground();
      } else if (nextAppState === 'background') {
        this.handleAppBackground();
      }
    });
  }

  private handleAppBackground() {
    const now = Date.now();
    offline$.lastActiveTime.set(now);

    // Stop automation engine to save battery
    automationEngine.stop();
  }

  private handleAppForeground() {
    const now = Date.now();
    const lastActiveTime = offline$.lastActiveTime.get();

    // Restart automation engine
    automationEngine.start();

    // Check if player qualifies for offline progress (Phase 3, Level 26+)
    const playerLevel = progression$.level.current.get();
    if (playerLevel < 26) return;

    const offlineDuration = now - lastActiveTime;
    const cappedDuration = Math.min(offlineDuration, 8 * 60 * 60 * 1000); // 8 hours max

    if (cappedDuration < 60000) return; // Less than 1 minute, skip

    // Calculate offline gains
    const gains = this.calculateOfflineGains(cappedDuration);

    // Apply gains
    this.applyOfflineGains(gains);

    // Show offline progress UI
    showOfflineProgressModal(gains, cappedDuration);

    // Record session
    const session: OfflineSession = {
      startTime: lastActiveTime,
      endTime: now,
      duration: offlineDuration,
      cappedDuration
    };

    offline$.offlineSessions.set(prev => {
      const updated = [session, ...prev];
      return updated.slice(0, 10); // Keep last 10
    });
  }

  private calculateOfflineGains(duration: number): OfflineGains => {
    // Simulate automation running for the offline duration
    // Use current automation settings

    const activeAutomations = getActiveAutomations();
    let itemsSalvaged = 0;
    let materialsGained: MaterialInventory = {};
    let equipmentTinkered: { [slot in EquipmentSlot]?: number } = {};

    // Calculate salvage gains
    const salvageAutomation = activeAutomations.find(a =>
      automation$.unlocks[a.unlockId].get().type === 'salvage'
    );

    if (salvageAutomation) {
      const durationSeconds = duration / 1000;
      itemsSalvaged = Math.floor(salvageAutomation.processingSpeed * durationSeconds);

      // Estimate materials (simplified)
      // In real implementation, simulate actual salvaging
      materialsGained = estimateMaterialGains(itemsSalvaged);
    }

    // Calculate tinkering gains
    const tinkerAutomation = activeAutomations.find(a =>
      automation$.unlocks[a.unlockId].get().type === 'tinkering'
    );

    if (tinkerAutomation) {
      const durationSeconds = duration / 1000;
      const totalAttempts = Math.floor(tinkerAutomation.processingSpeed * durationSeconds);
      equipmentTinkered = distributeAttempts(totalAttempts);
    }

    // Calculate XP gains
    const xpGained = itemsSalvaged * 10; // 10 XP per item salvaged
    const levelsGained = calculateLevelsGained(xpGained);

    return {
      itemsSalvaged,
      materialsGained,
      equipmentTinkered,
      xpGained,
      levelsGained
    };
  }

  private applyOfflineGains(gains: OfflineGains) {
    // Add materials
    Object.entries(gains.materialsGained).forEach(([matId, amount]) => {
      materials$.inventory[matId].set(prev => prev + amount);
    });

    // Apply equipment tinkers
    Object.entries(gains.equipmentTinkered).forEach(([slot, attempts]) => {
      if (attempts) {
        // Simulate tinker attempts
        for (let i = 0; i < attempts; i++) {
          attemptTinker(slot as EquipmentSlot, true);
        }
      }
    });

    // Add XP
    addXP(gains.xpGained);

    // Update salvage counter
    salvage$.totalSalvaged.set(prev => prev + gains.itemsSalvaged);
  }

  cleanup() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}

export const offlineManager = new OfflineManager();
```

### 6.4 Prestige System

```typescript
// modules/prestige/prestigeManager.ts

import { progression$, salvage$ } from './stores';
import { PrestigeBonus, ActivePrestigeBonus } from './types';

const PRESTIGE_THRESHOLD = 1000; // Items salvaged

const PRESTIGE_BONUS_POOL: PrestigeBonus[] = [
  {
    id: 'material-boost',
    name: 'Material Windfall',
    description: '+10% all materials for 1 hour',
    duration: 3600,
    effect: { type: 'materialBonus', value: 0.10 }
  },
  {
    id: 'guaranteed-rare',
    name: 'Rare Streak',
    description: 'Next 100 salvages guaranteed rare material',
    duration: 0, // Counter-based, not time-based
    effect: { type: 'guaranteedRare', value: 100 }
  },
  {
    id: 'tinker-speed',
    name: 'Master Craftsman',
    description: 'Double tinkering speed for 30 minutes',
    duration: 1800,
    effect: { type: 'tinkerSpeed', value: 2.0 }
  },
  {
    id: 'salvage-speed',
    name: 'Speed Salvager',
    description: 'Triple salvage speed for 15 minutes',
    duration: 900,
    effect: { type: 'salvageSpeed', value: 3.0 }
  },
  {
    id: 'xp-bonus',
    name: 'Experience Surge',
    description: '+50% XP for 2 hours',
    duration: 7200,
    effect: { type: 'xpBonus', value: 0.50 }
  }
];

export const checkPrestigeEligibility = (): boolean => {
  const itemsSincePrestige = progression$.itemsSalvagedSincePrestige.get();
  return itemsSincePrestige >= PRESTIGE_THRESHOLD;
};

export const triggerPrestigeChoice = () => {
  if (!checkPrestigeEligibility()) return;

  // Select 3 random bonuses
  const shuffled = [...PRESTIGE_BONUS_POOL].sort(() => Math.random() - 0.5);
  const choices = shuffled.slice(0, 3);

  // Show prestige modal with choices
  showPrestigeModal(choices, (selectedBonus: PrestigeBonus) => {
    activatePrestigeBonus(selectedBonus);
  });
};

const activatePrestigeBonus = (bonus: PrestigeBonus) => {
  const now = Date.now();
  const expiresAt = bonus.duration > 0 ? now + (bonus.duration * 1000) : Infinity;

  const activeBonus: ActivePrestigeBonus = {
    bonus,
    activatedAt: now,
    expiresAt
  };

  progression$.activePrestigeBonuses.set(prev => [...prev, activeBonus]);
  progression$.itemsSalvagedSincePrestige.set(0);
  progression$.prestigeCount.set(prev => prev + 1);

  // Start expiration timer if applicable
  if (bonus.duration > 0) {
    setTimeout(() => {
      removePrestigeBonus(bonus.id);
    }, bonus.duration * 1000);
  }

  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

const removePrestigeBonus = (bonusId: string) => {
  progression$.activePrestigeBonuses.set(prev =>
    prev.filter(ab => ab.bonus.id !== bonusId)
  );
};

export const getActiveBonusMultiplier = (type: PrestigeEffectType): number => {
  const activeBonuses = progression$.activePrestigeBonuses.get();

  let multiplier = 1.0;

  activeBonuses.forEach(ab => {
    if (ab.bonus.effect.type === type) {
      multiplier += ab.bonus.effect.value;
    }
  });

  return multiplier;
};
```

---

## 7. UI/UX Architecture

### 7.1 Screen Structure

```
App.tsx
  ├── NavigationContainer
  │   ├── TabNavigator
  │   │   ├── CombatScreen (existing)
  │   │   ├── InventoryScreen
  │   │   │   ├── ItemGrid
  │   │   │   ├── FilterPanel
  │   │   │   └── BatchActions
  │   │   ├── SalvageScreen
  │   │   │   ├── SalvageQueue
  │   │   │   ├── ComboIndicator
  │   │   │   └── MaterialBurst (overlay)
  │   │   ├── TinkeringScreen
  │   │   │   ├── EquipmentGrid
  │   │   │   ├── MaterialCostDisplay
  │   │   │   ├── StatPreview
  │   │   │   └── TinkerButton
  │   │   ├── AutomationScreen
  │   │   │   ├── AutomationDashboard
  │   │   │   ├── UpgradeTree
  │   │   │   └── PrioritySettings
  │   │   └── ProgressionScreen
  │   │       ├── LevelDisplay
  │   │       ├── UnlockTimeline
  │   │       └── PrestigePanel
  │   └── Modals
  │       ├── LevelUpModal
  │       ├── PrestigeModal
  │       ├── OfflineProgressModal
  │       └── UnlockNotificationModal
  └── GlobalEffects
      ├── ParticleSystem
      └── HapticManager
```

### 7.2 Animation Specifications

#### Material Burst Effect
```typescript
// modules/materials/components/MaterialBurst.tsx

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS
} from 'react-native-reanimated';

interface Particle {
  id: string;
  materialId: string;
  amount: number;
  x: number;
  y: number;
}

interface Props {
  particles: Particle[];
  onComplete: (particleId: string) => void;
}

export const MaterialBurst: React.FC<Props> = ({ particles, onComplete }) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(particle => (
        <MaterialParticle
          key={particle.id}
          particle={particle}
          onComplete={() => onComplete(particle.id)}
        />
      ))}
    </View>
  );
};

const MaterialParticle: React.FC<{
  particle: Particle;
  onComplete: () => void;
}> = ({ particle, onComplete }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Random upward burst
    const randomAngle = (Math.random() - 0.5) * Math.PI / 2; // -45° to +45°
    const distance = 100 + Math.random() * 50;
    const finalX = Math.sin(randomAngle) * distance;
    const finalY = -Math.cos(randomAngle) * distance;

    // Animate trajectory
    translateX.value = withTiming(finalX, { duration: 1000 });
    translateY.value = withTiming(finalY, { duration: 1000 });

    // Fade out
    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 700 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      })
    );

    // Scale pulse
    scale.value = withSequence(
      withTiming(1.5, { duration: 200 }),
      withTiming(1.0, { duration: 800 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: particle.x, top: particle.y },
        animatedStyle
      ]}
    >
      <Text style={styles.particleText}>+{particle.amount}</Text>
    </Animated.View>
  );
};
```

#### Progress Bar Animation
```typescript
// modules/shared/components/AnimatedProgressBar.tsx

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';

interface Props {
  progress: number; // 0-1
  color?: string;
  height?: number;
}

export const AnimatedProgressBar: React.FC<Props> = ({
  progress,
  color = '#4CAF50',
  height = 8
}) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 16 }); // 60 FPS smooth
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
    backgroundColor: color
  }));

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.fill, progressStyle]} />
    </View>
  );
};
```

### 7.3 Haptic Patterns

```typescript
// modules/shared/hapticManager.ts

import * as Haptics from 'expo-haptics';

// Throttle haptics to prevent overwhelming feedback
let lastHapticTime = 0;
const HAPTIC_THROTTLE = 50; // ms

const throttledHaptic = (fn: () => void) => {
  const now = Date.now();
  if (now - lastHapticTime >= HAPTIC_THROTTLE) {
    fn();
    lastHapticTime = now;
  }
};

export const HapticPatterns = {
  // UI Interactions
  buttonTap: () => {
    throttledHaptic(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    );
  },

  buttonPress: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  heavyPress: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  // Salvage Events
  salvageStart: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  salvageComplete: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  comboTrigger: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  // Tinkering Events
  tinkerStart: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  tinkerSuccess: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  tinkerFailure: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  tinkerCritical: () => {
    // Triple heavy impact for critical success
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100
    );
    setTimeout(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200
    );
  },

  // Progression Events
  levelUp: () => {
    // Triple heavy for level up
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 150
    );
    setTimeout(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300
    );
  },

  unlockFeature: () => {
    // Notification + Heavy impact
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100
    );
  },

  // Error States
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
};
```

### 7.4 Sound System

```typescript
// modules/shared/soundManager.ts

import { Audio } from 'expo-audio';

class SoundManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private loaded: boolean = false;

  async loadSounds() {
    if (this.loaded) return;

    const soundAssets = {
      // UI Sounds
      buttonTap: require('../../assets/sounds/ui/tap.mp3'),
      buttonPress: require('../../assets/sounds/ui/press.mp3'),

      // Salvage Sounds
      salvageStart: require('../../assets/sounds/salvage/start.mp3'),
      salvageComplete: require('../../assets/sounds/salvage/complete.mp3'),
      materialGain: require('../../assets/sounds/salvage/material.mp3'),
      comboTrigger: require('../../assets/sounds/salvage/combo.mp3'),

      // Tinkering Sounds
      tinkerStart: require('../../assets/sounds/tinker/hammer.mp3'),
      tinkerSuccess: require('../../assets/sounds/tinker/success.mp3'),
      tinkerFailure: require('../../assets/sounds/tinker/failure.mp3'),
      tinkerCritical: require('../../assets/sounds/tinker/critical.mp3'),

      // Progression Sounds
      levelUp: require('../../assets/sounds/progression/levelup.mp3'),
      unlockFeature: require('../../assets/sounds/progression/unlock.mp3'),
      prestige: require('../../assets/sounds/progression/prestige.mp3'),
    };

    await Promise.all(
      Object.entries(soundAssets).map(async ([key, asset]) => {
        const { sound } = await Audio.Sound.createAsync(asset);
        this.sounds.set(key, sound);
      })
    );

    this.loaded = true;
  }

  async play(soundKey: string, volume: number = 1.0) {
    const sound = this.sounds.get(soundKey);
    if (!sound) return;

    try {
      await sound.setPositionAsync(0); // Reset to start
      await sound.setVolumeAsync(volume);
      await sound.playAsync();
    } catch (error) {
      console.error(`Failed to play sound: ${soundKey}`, error);
    }
  }

  async unloadSounds() {
    await Promise.all(
      Array.from(this.sounds.values()).map(sound => sound.unloadAsync())
    );
    this.sounds.clear();
    this.loaded = false;
  }
}

export const soundManager = new SoundManager();
```

---

## 8. Performance Specifications

### 8.1 Target Metrics

| Metric | Phase 1 | Phase 2 | Phase 3 | Critical |
|--------|---------|---------|---------|----------|
| Frame Rate | 60 FPS | 60 FPS | 60 FPS | Yes |
| Queue Processing | 16ms | 16ms | 16ms | Yes |
| Memory Usage | <100MB | <120MB | <150MB | Yes |
| AsyncStorage Writes | 1/sec | 1/sec | 1/sec | No |
| Particle Limit | 20 | 30 | 50 | No |
| Haptic Throttle | 50ms | 50ms | 50ms | No |

### 8.2 Optimization Strategies

#### Memory Management
```typescript
// Limit array sizes
export const MAX_RECENT_GAINS = 20;
export const MAX_ATTEMPT_HISTORY = 50;
export const MAX_OFFLINE_SESSIONS = 10;
export const MAX_PARTICLES = 50;

// Clean up completed queue items immediately
export const cleanupCompletedSalvages = () => {
  salvage$.queue.set(prev =>
    prev.filter(item => item.status !== 'completed')
  );
};

// Unload sounds when app backgrounds
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'background') {
    soundManager.unloadSounds();
  } else if (nextAppState === 'active') {
    soundManager.loadSounds();
  }
});
```

#### Rendering Optimization
```typescript
// Use React.memo for static components
export const ItemCard = React.memo<ItemCardProps>(({ item }) => {
  // Component implementation
});

// Use FlatList with proper optimization props
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.instanceId}
  removeClippedSubviews={true}           // Unload offscreen items
  maxToRenderPerBatch={10}               // Render 10 at a time
  updateCellsBatchingPeriod={50}         // Update every 50ms
  initialNumToRender={15}                // Initial render count
  windowSize={21}                        // Buffer size
  getItemLayout={(data, index) => ({     // Skip measurement for scrolling
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index
  })}
/>
```

#### Worklet Optimization
```typescript
// Use worklets for animations (runs on UI thread)
import { useSharedValue, useAnimatedStyle, runOnUI } from 'react-native-reanimated';

const progressAnimation = useSharedValue(0);

// This runs on UI thread, doesn't block JS thread
const animatedStyle = useAnimatedStyle(() => {
  return {
    width: `${progressAnimation.value * 100}%`
  };
});

// Update from JS thread
runOnUI(() => {
  progressAnimation.value = withTiming(newProgress);
})();
```

### 8.3 Performance Monitoring

```typescript
// modules/shared/performanceMonitor.ts

class PerformanceMonitor {
  private frameCount = 0;
  private lastFrameTime = Date.now();
  private fps = 60;
  private memoryUsage = 0;

  startMonitoring() {
    // Monitor FPS
    setInterval(() => {
      const now = Date.now();
      const deltaTime = now - this.lastFrameTime;
      this.fps = 1000 / deltaTime;
      this.lastFrameTime = now;
      this.frameCount++;

      if (this.frameCount % 60 === 0) {
        this.logMetrics();
      }
    }, 16); // 60 FPS

    // Monitor memory (if available)
    if (performance && performance.memory) {
      setInterval(() => {
        this.memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
      }, 1000);
    }
  }

  private logMetrics() {
    console.log(`[Performance] FPS: ${this.fps.toFixed(1)}, Memory: ${this.memoryUsage.toFixed(1)}MB`);

    if (this.fps < 50) {
      console.warn('[Performance] Low FPS detected!');
    }

    if (this.memoryUsage > 150) {
      console.warn('[Performance] High memory usage detected!');
    }
  }

  getCurrentFPS(): number {
    return this.fps;
  }

  getMemoryUsage(): number {
    return this.memoryUsage;
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

---

## 9. Testing Strategy

### 9.1 Test Coverage Goals

| Module | Unit Tests | Integration Tests | Component Tests | E2E Tests |
|--------|------------|-------------------|-----------------|-----------|
| Salvage | 90%+ | ✓ | ✓ | ✓ |
| Tinkering | 90%+ | ✓ | ✓ | ✓ |
| Inventory | 85%+ | ✓ | ✓ | - |
| Materials | 85%+ | ✓ | ✓ | - |
| Equipment | 85%+ | ✓ | ✓ | - |
| Automation | 95%+ | ✓ | ✓ | ✓ |
| Progression | 90%+ | ✓ | ✓ | - |
| Offline | 90%+ | ✓ | - | ✓ |
| Prestige | 85%+ | ✓ | ✓ | - |

### 9.2 Test Structure

#### Unit Tests (Pure Logic)
```typescript
// modules/tinkering/__tests__/tinkeringLogic.test.ts

import {
  calculateTinkerCost,
  calculateStatGains,
  rollTinkerSuccess
} from '../tinkeringLogic';

describe('tinkeringLogic', () => {
  describe('calculateTinkerCost', () => {
    it('should return base cost for level 0', () => {
      const cost = calculateTinkerCost(0);
      expect(cost).toEqual({
        'iron-ore': 10,
        'wood': 5
      });
    });

    it('should scale cost with level', () => {
      const cost = calculateTinkerCost(5);
      // base * (1 + level * 0.1) = 10 * (1 + 5 * 0.1) = 15
      expect(cost['iron-ore']).toBe(15);
    });

    it('should handle fractional costs correctly', () => {
      const cost = calculateTinkerCost(3);
      // base * (1 + 3 * 0.1) = 10 * 1.3 = 13
      expect(cost['iron-ore']).toBe(13);
    });
  });

  describe('rollTinkerSuccess', () => {
    it('should always succeed in Phase 1', () => {
      const result = rollTinkerSuccess(0); // Level 0 = Phase 1
      expect(result).toBe('success');
    });

    it('should have failure chance in Phase 2', () => {
      const results = new Set();
      for (let i = 0; i < 100; i++) {
        results.add(rollTinkerSuccess(15)); // Level 15 = Phase 2
      }
      // Should have both success and failure
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('calculateStatGains', () => {
    it('should return gains for normal success', () => {
      const gains = calculateStatGains(0, false);
      expect(gains.attack).toBeGreaterThanOrEqual(1);
      expect(gains.attack).toBeLessThanOrEqual(2);
    });

    it('should double gains for critical success', () => {
      const normalGains = calculateStatGains(0, false);
      const criticalGains = calculateStatGains(0, true);
      // Critical should be roughly 2x (with randomness)
      expect(criticalGains.attack).toBeGreaterThan(normalGains.attack);
    });
  });
});
```

#### Integration Tests (Store Interactions)
```typescript
// modules/automation/__tests__/automationIntegration.test.ts

import { automation$, unlockAutomation, toggleAutomation } from '../automationStore';
import { progression$ } from '../../progression/progressionStore';
import { salvage$ } from '../../salvage/salvageStore';
import { inventory$ } from '../../inventory/inventoryStore';
import { automationEngine } from '../automationEngine';

describe('Automation Integration', () => {
  beforeEach(() => {
    // Reset all stores
    automation$.set({
      unlocks: AUTOMATION_UNLOCKS,
      instances: {},
      upgrades: {},
      globalEnabled: false
    });

    salvage$.queue.set([]);
    inventory$.items.set([]);
  });

  it('should unlock automation when level requirement met', () => {
    progression$.level.current.set(10); // Meet requirement

    const result = unlockAutomation('basic-assistant');

    expect(result).toBe(true);
    expect(automation$.instances['basic-assistant'].get()).toBeDefined();
    expect(automation$.globalEnabled.get()).toBe(true);
  });

  it('should process salvage queue via automation', async () => {
    // Setup
    unlockAutomation('basic-assistant');

    // Add items to inventory
    const testItems = Array.from({ length: 10 }, (_, i) => createTestItem(i));
    inventory$.items.set(testItems);

    // Start automation engine
    automationEngine.start();

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds

    // Verify items were salvaged
    expect(salvage$.queue.get().length).toBeGreaterThan(0);
    expect(inventory$.items.get().length).toBeLessThan(10);

    automationEngine.stop();
  });

  it('should respect queue size limits', () => {
    const queueSizeLimit = 5;

    unlockAutomation('basic-assistant');
    const instance = automation$.instances['basic-assistant'].get();
    instance.queueSize = queueSizeLimit;

    // Add many items
    const testItems = Array.from({ length: 20 }, (_, i) => createTestItem(i));
    inventory$.items.set(testItems);

    // Process
    automationEngine.processFrame();

    // Queue should not exceed limit
    expect(salvage$.queue.get().length).toBeLessThanOrEqual(queueSizeLimit);
  });
});
```

#### Component Tests
```typescript
// modules/salvage/__tests__/SalvageQueue.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SalvageQueue } from '../components/SalvageQueue';
import { salvage$ } from '../salvageStore';

describe('SalvageQueue Component', () => {
  beforeEach(() => {
    salvage$.queue.set([]);
  });

  it('should render empty state when queue is empty', () => {
    const { getByText } = render(<SalvageQueue />);
    expect(getByText('Queue is empty')).toBeDefined();
  });

  it('should render queue items', () => {
    const testItems = [
      createTestQueueItem('item-1', 'Iron Sword'),
      createTestQueueItem('item-2', 'Wooden Shield')
    ];

    salvage$.queue.set(testItems);

    const { getByText } = render(<SalvageQueue />);
    expect(getByText('Iron Sword')).toBeDefined();
    expect(getByText('Wooden Shield')).toBeDefined();
  });

  it('should show combo multiplier when active', () => {
    const testItem = createTestQueueItem('item-1', 'Iron Sword');
    testItem.comboMultiplier = 3;

    salvage$.queue.set([testItem]);

    const { getByText } = render(<SalvageQueue />);
    expect(getByText('x3')).toBeDefined();
  });

  it('should update progress bar as item processes', async () => {
    const testItem = createTestQueueItem('item-1', 'Iron Sword');
    testItem.progress = 0.5;

    salvage$.queue.set([testItem]);

    const { getByTestId } = render(<SalvageQueue />);

    // Check progress bar width (requires testID on progress bar)
    // This is a simplified check; actual implementation may vary
    const progressBar = getByTestId('progress-bar-item-1');
    expect(progressBar.props.style).toMatchObject({ width: '50%' });
  });
});
```

#### E2E Tests
```typescript
// e2e/salvage-tinkering-flow.test.ts

describe('Salvage and Tinkering Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete full salvage-to-tinker flow', async () => {
    // Navigate to inventory
    await element(by.id('nav-inventory')).tap();

    // Select an item to salvage
    await element(by.id('item-rusty-sword-1')).tap();
    await element(by.id('button-salvage')).tap();

    // Wait for salvage to complete
    await waitFor(element(by.id('salvage-complete-notification')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify materials were gained
    await element(by.id('nav-materials')).tap();
    await expect(element(by.id('material-iron-ore'))).toBeVisible();

    // Navigate to tinkering
    await element(by.id('nav-tinkering')).tap();

    // Select equipment slot
    await element(by.id('equipment-slot-weapon')).tap();

    // Attempt tinker
    await element(by.id('button-tinker')).tap();

    // Verify tinker success
    await expect(element(by.id('tinker-success-notification'))).toBeVisible();

    // Verify stats increased
    await expect(element(by.id('stat-attack'))).toHaveText(/\d+/); // Any number
  });

  it('should unlock automation at level 10', async () => {
    // Mock level to 10
    await device.sendUserActivity({
      type: 'setLevel',
      level: 10
    });

    // Navigate to automation
    await element(by.id('nav-automation')).tap();

    // Verify basic assistant is unlocked
    await expect(element(by.id('automation-basic-assistant'))).toBeVisible();

    // Enable automation
    await element(by.id('toggle-basic-assistant')).tap();

    // Verify automation is running
    await expect(element(by.id('automation-status-active'))).toBeVisible();
  });
});
```

### 9.3 Mocking Strategy

```typescript
// modules/__mocks__/stores.ts

import { observable } from '@legendapp/state';

export const createMockSalvageStore = () => observable({
  queue: [],
  comboState: { multiplier: 1, clickCount: 0, lastClickTime: 0 },
  totalSalvaged: 0,
  recentGains: []
});

export const createMockInventoryStore = () => observable({
  items: [],
  maxSlots: 50,
  filters: { enabled: false }
});

// modules/__mocks__/expo-haptics.ts

export const impactAsync = jest.fn();
export const notificationAsync = jest.fn();

export const ImpactFeedbackStyle = {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy'
};

export const NotificationFeedbackType = {
  Success: 'success',
  Warning: 'warning',
  Error: 'error'
};
```

---

## 10. Implementation Phases

### 10.1 Phase 1: Core Data Models & Salvage (Week 1)

**Days 1-2: Data Models & Store Setup**
- [ ] Define all TypeScript interfaces (types.ts for all modules)
- [ ] Set up global store configuration
- [ ] Implement persistence manager
- [ ] Create inventory store + basic logic
- [ ] Create materials store + basic logic
- [ ] Write unit tests for stores

**Days 3-4: Salvage System**
- [ ] Implement salvage logic (combo, queue processing)
- [ ] Create salvage store with actions
- [ ] Build SalvageQueue component
- [ ] Build ComboIndicator component
- [ ] Build MaterialBurst particle effect
- [ ] Write tests for salvage system
- [ ] Integrate with inventory

**Days 5-6: Tinkering System**
- [ ] Implement tinkering logic (cost calc, stat gains, success rolls)
- [ ] Create equipment store
- [ ] Create tinkering store
- [ ] Build TinkeringView UI
- [ ] Build EquipmentGrid component
- [ ] Write tests for tinkering system
- [ ] Integrate with materials store

**Day 7: Integration & Polish**
- [ ] Connect combat system to drop items
- [ ] Integrate equipment stats with combat damage
- [ ] Add haptic feedback to all actions
- [ ] Add sound effects
- [ ] End-to-end testing
- [ ] Bug fixes

**Deliverable**: Working manual salvage and tinkering with 100% success rate, combo system, and material drops.

---

### 10.2 Phase 2: Automation Engine (Week 2)

**Days 8-9: Automation Engine Core**
- [ ] Implement automation engine (60 FPS processing)
- [ ] Create automation store with unlock system
- [ ] Implement queue processing for salvage automation
- [ ] Implement tinkering automation with priority system
- [ ] Write comprehensive tests for automation engine
- [ ] Performance profiling and optimization

**Days 10-11: Automation UI**
- [ ] Build AutomationDashboard
- [ ] Build UnlockTree component
- [ ] Build AutomationCard with upgrade UI
- [ ] Build PrioritySelector for tinkering
- [ ] Add master toggle for global automation
- [ ] Write component tests

**Days 12-13: Filtering & Batch Operations**
- [ ] Implement inventory filtering logic
- [ ] Build FilterPanel UI
- [ ] Implement batch selection
- [ ] Add batch salvage actions
- [ ] Build RefinementUI (material conversion)
- [ ] Write tests for filtering

**Day 14: Integration & Testing**
- [ ] Test all automation types
- [ ] Test priority systems
- [ ] Performance testing under heavy load
- [ ] End-to-end automation flow tests
- [ ] Bug fixes and polish

**Deliverable**: Working automation system with salvage and tinkering bots, filtering, batch operations, and upgrade tree.

---

### 10.3 Phase 3: Offline Progress & Prestige (Week 3)

**Days 15-16: Offline Progress System**
- [ ] Implement OfflineManager with AppState tracking
- [ ] Create offline calculation logic
- [ ] Implement 8-hour cap system
- [ ] Build OfflineProgressModal UI
- [ ] Test offline session tracking
- [ ] Test offline gains calculation

**Days 17-18: Prestige System**
- [ ] Implement prestige logic (threshold, bonus pool)
- [ ] Create prestige store
- [ ] Build PrestigeModal with choice UI
- [ ] Implement prestige bonus activation
- [ ] Implement prestige bonus expiration
- [ ] Test prestige flow end-to-end

**Days 19-20: Achievements & Statistics**
- [ ] Create statistics tracking system
- [ ] Implement achievement definitions
- [ ] Build StatisticsView UI
- [ ] Build AchievementList UI
- [ ] Add achievement unlock notifications
- [ ] Write tests for achievements

**Day 21: Final Integration**
- [ ] Test full Phase 3 progression
- [ ] Test offline progress with prestige
- [ ] Performance testing with full feature set
- [ ] Bug fixes
- [ ] Documentation updates

**Deliverable**: Complete offline progress system, prestige mechanics with bonus choices, and achievement tracking.

---

### 10.4 Phase 4: Polish & Optimization (Week 4)

**Days 22-23: Performance Optimization**
- [ ] Profile app performance (FPS, memory)
- [ ] Optimize animation worklets
- [ ] Optimize FlatList rendering
- [ ] Reduce AsyncStorage write frequency
- [ ] Implement particle pooling
- [ ] Test on low-end devices

**Days 24-25: Progression Balancing**
- [ ] Balance salvage times
- [ ] Balance material drop rates
- [ ] Balance tinkering costs
- [ ] Balance automation speeds
- [ ] Tune XP curves
- [ ] Playtest and adjust

**Days 26-27: UI Polish**
- [ ] Add loading states
- [ ] Add error states
- [ ] Improve animations
- [ ] Add tutorial/onboarding
- [ ] Polish all visual effects
- [ ] Accessibility improvements

**Day 28: Final Testing & Launch Prep**
- [ ] Full regression testing
- [ ] E2E test suite execution
- [ ] Performance validation
- [ ] Documentation finalization
- [ ] Prepare release notes
- [ ] Deploy to staging

**Deliverable**: Production-ready Salvage & Tinkering System with optimized performance, balanced progression, and polished UX.

---

## 11. Technical Risks & Mitigation

### 11.1 Performance Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Automation engine drops below 60 FPS** | High | Medium | - Implement worklets for heavy processing<br>- Use batching for state updates<br>- Profile and optimize hot paths<br>- Limit particle count |
| **AsyncStorage writes block UI** | Medium | Low | - Batch writes (max 1/second)<br>- Use background thread if available<br>- Implement write queue |
| **Memory leak from observers** | High | Medium | - Clean up observers on unmount<br>- Limit stored history arrays<br>- Monitor memory usage |
| **FlatList performance with large inventories** | Medium | Medium | - Use `getItemLayout` for fixed heights<br>- Implement virtualization properly<br>- Add pagination if needed |

### 11.2 State Management Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **State sync conflicts between stores** | High | Medium | - Use single source of truth<br>- Implement proper action ordering<br>- Add state validation checks |
| **Persistence corruption** | Critical | Low | - Implement state migration system<br>- Add versioning to persisted data<br>- Validate on load with fallback to defaults |
| **Race conditions in automation** | Medium | Medium | - Use atomic operations<br>- Implement proper locking<br>- Test concurrent scenarios |

### 11.3 User Experience Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Progression too slow/fast** | High | High | - Implement telemetry for player progression<br>- Add configurable balance parameters<br>- Plan for balance patches |
| **Automation removes gameplay** | Critical | Medium | - Maintain manual bonus (2x speed)<br>- Require active choices (priorities)<br>- Add endgame manual mechanics (God Click) |
| **Offline progress feels unfair** | Medium | Medium | - Cap at 8 hours<br>- Require automation unlocks<br>- Show transparent calculations |

### 11.4 Technical Debt Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Test coverage below targets** | Medium | High | - Enforce coverage gates in CI<br>- Write tests alongside features<br>- Conduct code reviews |
| **Inconsistent module patterns** | Low | Medium | - Create module templates<br>- Document patterns clearly<br>- Code review for adherence |
| **Poor documentation** | Medium | Medium | - Write inline comments<br>- Maintain this TDD up-to-date<br>- Generate API docs |

---

## 12. Appendices

### 12.1 Automation Unlock Definitions

```typescript
// modules/automation/automationData.ts

export const AUTOMATION_UNLOCKS: { [id: string]: AutomationUnlock } = {
  'basic-assistant': {
    id: 'basic-assistant',
    name: 'Basic Assistant',
    description: 'Automatically salvages 1 item every 3 seconds',
    type: 'salvage',
    unlockLevel: 10,
    baseSpeed: 1 / 3, // items per second
    queueSize: 5,
    cost: 1000
  },
  'improved-salvager': {
    id: 'improved-salvager',
    name: 'Improved Salvager',
    description: 'Faster salvaging: 1 item per second',
    type: 'salvage',
    unlockLevel: 13,
    baseSpeed: 1,
    queueSize: 10,
    cost: 5000
  },
  'rapid-processor': {
    id: 'rapid-processor',
    name: 'Rapid Processor',
    description: 'Processes 5 items per second',
    type: 'salvage',
    unlockLevel: 18,
    baseSpeed: 5,
    queueSize: 50,
    cost: 25000
  },
  'salvage-factory': {
    id: 'salvage-factory',
    name: 'Salvage Factory',
    description: 'Industrial salvaging: 10 items per second',
    type: 'salvage',
    unlockLevel: 22,
    baseSpeed: 10,
    queueSize: 100,
    cost: 100000
  },
  'master-salvager': {
    id: 'master-salvager',
    name: 'Master Salvager',
    description: 'Ultimate salvaging: 100 items per second',
    type: 'salvage',
    unlockLevel: 30,
    baseSpeed: 100,
    queueSize: 10000,
    cost: 1000000
  },

  // Tinkering Automation
  'apprentice-smith': {
    id: 'apprentice-smith',
    name: 'Apprentice Smith',
    description: 'Auto-tinkers 1 item every 5 seconds',
    type: 'tinkering',
    unlockLevel: 12,
    baseSpeed: 1 / 5,
    queueSize: 6, // Equipment slots
    cost: 2000
  },
  'journeyman-smith': {
    id: 'journeyman-smith',
    name: 'Journeyman Smith',
    description: 'Tinkers 1 item per second with smart prioritization',
    type: 'tinkering',
    unlockLevel: 16,
    baseSpeed: 1,
    queueSize: 6,
    cost: 15000
  },
  'master-smith': {
    id: 'master-smith',
    name: 'Master Smith',
    description: 'Tinkers 5 items per second',
    type: 'tinkering',
    unlockLevel: 20,
    baseSpeed: 5,
    queueSize: 6,
    cost: 75000
  },

  // Refinement Automation (Phase 2+)
  'material-refiner': {
    id: 'material-refiner',
    name: 'Material Refiner',
    description: 'Automatically refines common materials to rare',
    type: 'refinement',
    unlockLevel: 15,
    baseSpeed: 0.5, // Refinements per second
    queueSize: 20,
    cost: 10000
  }
};
```

### 12.2 Material Type Definitions

```typescript
// modules/materials/materialData.ts

export const MATERIAL_TYPES: { [id: string]: MaterialType } = {
  // Common Materials
  'wood': {
    id: 'wood',
    name: 'Wood',
    description: 'Common crafting material',
    rarity: 'common',
    icon: 'assets/materials/wood.png',
    refinable: true
  },
  'iron-ore': {
    id: 'iron-ore',
    name: 'Iron Ore',
    description: 'Basic metal ore',
    rarity: 'common',
    icon: 'assets/materials/iron-ore.png',
    refinable: true
  },
  'leather': {
    id: 'leather',
    name: 'Leather',
    description: 'Cured animal hide',
    rarity: 'common',
    icon: 'assets/materials/leather.png',
    refinable: true
  },

  // Uncommon Materials
  'steel-ingot': {
    id: 'steel-ingot',
    name: 'Steel Ingot',
    description: 'Refined metal ingot',
    rarity: 'uncommon',
    icon: 'assets/materials/steel-ingot.png',
    refinable: true
  },
  'hardened-leather': {
    id: 'hardened-leather',
    name: 'Hardened Leather',
    description: 'Reinforced leather',
    rarity: 'uncommon',
    icon: 'assets/materials/hardened-leather.png',
    refinable: true
  },

  // Rare Materials
  'mithril-ore': {
    id: 'mithril-ore',
    name: 'Mithril Ore',
    description: 'Rare silvery metal',
    rarity: 'rare',
    icon: 'assets/materials/mithril-ore.png',
    refinable: true
  },
  'enchanted-cloth': {
    id: 'enchanted-cloth',
    name: 'Enchanted Cloth',
    description: 'Magically infused fabric',
    rarity: 'rare',
    icon: 'assets/materials/enchanted-cloth.png',
    refinable: true
  },

  // Epic Materials
  'adamantine': {
    id: 'adamantine',
    name: 'Adamantine',
    description: 'Incredibly hard metal',
    rarity: 'epic',
    icon: 'assets/materials/adamantine.png',
    refinable: true
  },
  'dragon-scale': {
    id: 'dragon-scale',
    name: 'Dragon Scale',
    description: 'Scale from an ancient dragon',
    rarity: 'epic',
    icon: 'assets/materials/dragon-scale.png',
    refinable: false
  },

  // Legendary Materials
  'celestial-ore': {
    id: 'celestial-ore',
    name: 'Celestial Ore',
    description: 'Ore from the heavens',
    rarity: 'legendary',
    icon: 'assets/materials/celestial-ore.png',
    refinable: false
  },
  'void-crystal': {
    id: 'void-crystal',
    name: 'Void Crystal',
    description: 'Crystal from the void between worlds',
    rarity: 'legendary',
    icon: 'assets/materials/void-crystal.png',
    refinable: false
  }
};

// Refinement recipes
export const REFINEMENT_RECIPES: RefinementRecipe[] = [
  {
    inputMaterialId: 'wood',
    inputAmount: 3,
    outputMaterialId: 'hardened-leather',
    outputAmount: 1,
    successRate: 0.8
  },
  {
    inputMaterialId: 'iron-ore',
    inputAmount: 3,
    outputMaterialId: 'steel-ingot',
    outputAmount: 1,
    successRate: 0.8
  },
  {
    inputMaterialId: 'steel-ingot',
    inputAmount: 5,
    outputMaterialId: 'mithril-ore',
    outputAmount: 1,
    successRate: 0.6
  },
  // ... more recipes
];
```

### 12.3 Equipment Base Stats

```typescript
// modules/equipment/equipmentData.ts

export const BASE_EQUIPMENT_STATS: { [slot in EquipmentSlot]: EquipmentStats } = {
  weapon: {
    attack: 10,
    defense: 0,
    health: 0,
    critChance: 5,
    critDamage: 1.5
  },
  helmet: {
    attack: 0,
    defense: 5,
    health: 20,
    critChance: 0,
    critDamage: 1.0
  },
  chest: {
    attack: 0,
    defense: 10,
    health: 50,
    critChance: 0,
    critDamage: 1.0
  },
  gloves: {
    attack: 3,
    defense: 2,
    health: 10,
    critChance: 2,
    critDamage: 1.1
  },
  legs: {
    attack: 0,
    defense: 7,
    health: 30,
    critChance: 0,
    critDamage: 1.0
  },
  boots: {
    attack: 2,
    defense: 3,
    health: 15,
    critChance: 1,
    critDamage: 1.0
  }
};
```

---

## Document Metadata

**Document Version:** 1.0
**Last Updated:** 2025-11-07
**Estimated Implementation Time:** 4 weeks
**Estimated Lines of Code:** ~15,000
**Dependencies:** React Native 0.81.4, Expo 54, Legend State 3.0.0-beta.35
**Target Platform:** iOS & Android (React Native)
**Minimum Requirements:** 2GB RAM, iOS 13+ / Android 8+

---

## Next Steps

1. **Review & Approval**: Stakeholders review this TDD
2. **Technical Kickoff**: Development team reviews architecture
3. **Environment Setup**: Configure development environment
4. **Phase 1 Start**: Begin implementation according to timeline
5. **Weekly Check-ins**: Review progress against milestones

---

**End of Technical Design Document**
