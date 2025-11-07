# Salvage & Tinkering System - Technical Design Document

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [State Management](#state-management)
5. [Core Systems](#core-systems)
6. [UI Components](#ui-components)
7. [Animation & Feedback](#animation--feedback)
8. [Progression System](#progression-system)
9. [Persistence](#persistence)
10. [Testing Strategy](#testing-strategy)
11. [Performance Considerations](#performance-considerations)
12. [Implementation Phases](#implementation-phases)

---

## Overview

### Purpose
The Salvage & Tinkering System implements a progressive idle game mechanic where players manually salvage items for materials and tinker equipment, gradually unlocking automation features as they level up.

### Design Principles
- **Progressive Complexity**: Start simple, add features as player levels increase
- **Satisfying Feedback**: Every action produces immediate visual/haptic response
- **Earned Automation**: Automation is a reward, not a default
- **State-First Architecture**: Use Legend State for reactive, observable state management
- **Mobile-First**: Optimized for React Native with smooth 60 FPS animations
- **Test-Driven**: Comprehensive test coverage for all business logic

### Tech Stack
- **Framework**: React Native 0.81.4 with Expo 54
- **State Management**: @legendapp/state v3.0.0-beta.35
- **Animations**: react-native-reanimated v4.1.1 + react-native-worklets v0.5.1
- **Haptics**: expo-haptics v15.0.7
- **Audio**: expo-audio v1.0.13
- **Persistence**: @react-native-async-storage/async-storage v2.2.0
- **Testing**: Jest 29.7.0 + @testing-library/react-native v13.3.3

---

## Architecture

### High-Level Structure

```
frontend/
├── modules/
│   ├── salvage/                    # Salvage system module
│   │   ├── types.ts               # TypeScript interfaces
│   │   ├── salvageStore.ts        # Legend State store
│   │   ├── salvageLogic.ts        # Business logic
│   │   ├── SalvageButton.tsx      # Manual salvage button
│   │   ├── SalvageQueue.tsx       # Queue display
│   │   ├── SalvageAutomation.tsx  # Automation controls
│   │   └── __tests__/
│   │
│   ├── tinkering/                  # Tinkering system module
│   │   ├── types.ts
│   │   ├── tinkeringStore.ts
│   │   ├── tinkeringLogic.ts
│   │   ├── TinkerButton.tsx
│   │   ├── EquipmentGrid.tsx
│   │   ├── TinkerAutomation.tsx
│   │   └── __tests__/
│   │
│   ├── inventory/                  # Inventory system
│   │   ├── types.ts
│   │   ├── inventoryStore.ts
│   │   ├── InventoryGrid.tsx
│   │   ├── ItemCard.tsx
│   │   └── __tests__/
│   │
│   ├── materials/                  # Materials system
│   │   ├── types.ts
│   │   ├── materialsStore.ts
│   │   ├── MaterialsDisplay.tsx
│   │   ├── MaterialCounter.tsx
│   │   └── __tests__/
│   │
│   ├── equipment/                  # Equipment system
│   │   ├── types.ts
│   │   ├── equipmentStore.ts
│   │   ├── EquipmentSlot.tsx
│   │   └── __tests__/
│   │
│   ├── automation/                 # Automation system
│   │   ├── types.ts
│   │   ├── automationStore.ts
│   │   ├── automationEngine.ts
│   │   ├── AutomationTree.tsx
│   │   └── __tests__/
│   │
│   └── progression/                # Progression system
│       ├── types.ts
│       ├── progressionStore.ts
│       ├── progressionLogic.ts
│       └── __tests__/
│
├── screens/
│   ├── SalvageScreen.tsx          # Main salvage interface
│   └── TinkeringScreen.tsx        # Main tinkering interface
│
└── App.tsx                        # Root component
```

### Modular Design Philosophy

Each module follows this structure:
- **types.ts**: TypeScript interfaces and type definitions
- **{module}Store.ts**: Legend State observables
- **{module}Logic.ts**: Pure business logic functions (testable)
- **Components**: React components that observe state
- **__tests__/**: Comprehensive test suite

---

## Data Models

### Core Types

```typescript
// modules/salvage/types.ts

/**
 * Rarity levels for items and materials
 */
export enum Rarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary'
}

/**
 * Item that can be salvaged
 */
export interface Item {
  id: string;
  name: string;
  rarity: Rarity;
  level: number;
  salvageTime: number; // milliseconds
  materials: MaterialDrop[]; // What this item salvages into
  icon?: string; // Asset reference
}

/**
 * Material dropped from salvaging
 */
export interface MaterialDrop {
  materialId: string;
  minAmount: number;
  maxAmount: number;
  dropChance: number; // 0-1
}

/**
 * Material resource
 */
export interface Material {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  icon?: string;
}

/**
 * Player's material inventory
 */
export interface MaterialInventory {
  [materialId: string]: number;
}

/**
 * Item in player's inventory
 */
export interface InventoryItem extends Item {
  quantity: number;
  acquiredAt: number; // timestamp
}

/**
 * Salvage queue entry
 */
export interface SalvageQueueEntry {
  id: string;
  item: Item;
  startTime: number;
  endTime: number;
  progress: number; // 0-1
  autoSalvaged: boolean;
}

/**
 * Salvage automation configuration
 */
export interface SalvageAutomation {
  enabled: boolean;
  itemsPerSecond: number;
  maxQueueSize: number;
  filters: SalvageFilter[];
  upgradeLevel: number; // 0-10 (Basic Assistant → Salvage Factory)
}

/**
 * Filter for auto-salvage
 */
export interface SalvageFilter {
  enabled: boolean;
  rarityThreshold: Rarity;
  levelThreshold: number;
  specificItems: string[]; // Item IDs
  excludeItems: string[]; // Item IDs
}
```

```typescript
// modules/tinkering/types.ts

/**
 * Equipment piece that can be tinkered
 */
export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  baseStats: Stats;
  currentStats: Stats;
  tinkerLevel: number; // 0-100+
  materials: MaterialCost[];
  icon?: string;
}

export enum EquipmentSlot {
  Weapon = 'weapon',
  Helmet = 'helmet',
  Chest = 'chest',
  Gloves = 'gloves',
  Legs = 'legs',
  Boots = 'boots'
}

/**
 * Stats for equipment
 */
export interface Stats {
  attack: number;
  defense: number;
  health: number;
  critChance: number;
  critDamage: number;
}

/**
 * Material cost for tinkering
 */
export interface MaterialCost {
  materialId: string;
  amount: number;
}

/**
 * Tinkering queue entry
 */
export interface TinkerQueueEntry {
  id: string;
  equipment: Equipment;
  startTime: number;
  endTime: number;
  progress: number; // 0-1
  successChance: number; // 0-1 (Phase 1: always 1.0)
  autoTinkered: boolean;
}

/**
 * Tinkering automation configuration
 */
export interface TinkeringAutomation {
  enabled: boolean;
  priorityQueue: string[]; // Equipment IDs in priority order
  autoDistribute: boolean;
  smartMode: boolean; // AI suggestions (Phase 2+)
  upgradeLevel: number; // 0-10
}

/**
 * Tinkering result
 */
export interface TinkerResult {
  success: boolean;
  equipment: Equipment;
  materialsUsed: MaterialCost[];
  statGains: Stats;
}
```

```typescript
// modules/automation/types.ts

/**
 * Automation unlock
 */
export interface AutomationUnlock {
  id: string;
  name: string;
  description: string;
  levelRequired: number;
  cost: MaterialCost[];
  type: AutomationType;
  effect: AutomationEffect;
  unlocked: boolean;
  active: boolean;
}

export enum AutomationType {
  Salvage = 'salvage',
  Tinkering = 'tinkering',
  Refinement = 'refinement',
  Global = 'global'
}

/**
 * Effect of automation upgrade
 */
export interface AutomationEffect {
  speedMultiplier?: number;
  queueSizeIncrease?: number;
  efficiency?: number; // Material bonus
  unlockFeature?: string; // Feature flag to enable
}

/**
 * Automation upgrade tree node
 */
export interface AutomationNode {
  id: string;
  unlock: AutomationUnlock;
  position: { x: number; y: number };
  prerequisites: string[]; // Node IDs
  children: string[]; // Node IDs
}
```

```typescript
// modules/progression/types.ts

/**
 * Player progression state
 */
export interface PlayerProgression {
  level: number;
  currentPhase: ProgressionPhase;
  unlockedFeatures: string[];
  achievements: Achievement[];
  statistics: PlayerStatistics;
}

export enum ProgressionPhase {
  Phase1_Manual = 'phase1_manual',           // Levels 1-10
  Phase2_Assisted = 'phase2_assisted',       // Levels 11-25
  Phase3_FullAuto = 'phase3_full_auto'       // Levels 26+
}

/**
 * Player statistics for tracking
 */
export interface PlayerStatistics {
  totalItemsSalvaged: number;
  totalManualSalvages: number;
  totalAutoSalvages: number;
  totalTinkeringAttempts: number;
  totalTinkeringSuccesses: number;
  totalMaterialsCollected: MaterialInventory;
  totalPlayTime: number; // seconds
  sessionCount: number;
  clickCount: number;
  comboCount: number;
  maxCombo: number;
}

/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: AchievementCondition;
  reward: AchievementReward;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface AchievementCondition {
  type: 'salvage_count' | 'tinker_count' | 'material_count' | 'level' | 'combo';
  target: number;
  specificId?: string;
}

export interface AchievementReward {
  materials?: MaterialCost[];
  automationUnlock?: string;
  statBoost?: Stats;
}
```

---

## State Management

### Legend State Architecture

Using Legend State's observable pattern for reactive, performant state management.

```typescript
// modules/salvage/salvageStore.ts

import { observable } from '@legendapp/state';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import { syncObservable } from '@legendapp/state/sync';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Salvage system state
 */
export const salvageStore$ = observable({
  // Inventory
  inventory: [] as InventoryItem[],

  // Queue
  queue: [] as SalvageQueueEntry[],

  // Automation
  automation: {
    enabled: false,
    itemsPerSecond: 0,
    maxQueueSize: 1,
    filters: [],
    upgradeLevel: 0
  } as SalvageAutomation,

  // UI state
  selectedItems: [] as string[],
  isProcessing: false,
  lastSalvageTime: 0,

  // Combo system
  combo: {
    count: 0,
    multiplier: 1,
    lastClickTime: 0,
    expiresAt: 0
  }
});

// Persist to AsyncStorage
syncObservable(salvageStore$, {
  persist: {
    name: 'salvageStore',
    plugin: ObservablePersistAsyncStorage({
      AsyncStorage
    })
  }
});
```

```typescript
// modules/tinkering/tinkeringStore.ts

export const tinkeringStore$ = observable({
  // Equipment
  equipment: [] as Equipment[],

  // Queue
  queue: [] as TinkerQueueEntry[],

  // Automation
  automation: {
    enabled: false,
    priorityQueue: [],
    autoDistribute: false,
    smartMode: false,
    upgradeLevel: 0
  } as TinkeringAutomation,

  // UI state
  selectedEquipment: null as Equipment | null,
  isProcessing: false,
  lastTinkerTime: 0,

  // Preview
  previewResult: null as TinkerResult | null
});

syncObservable(tinkeringStore$, {
  persist: {
    name: 'tinkeringStore',
    plugin: ObservablePersistAsyncStorage({
      AsyncStorage
    })
  }
});
```

```typescript
// modules/materials/materialsStore.ts

export const materialsStore$ = observable({
  // Materials inventory
  inventory: {} as MaterialInventory,

  // Material definitions
  materials: [] as Material[],

  // Recently gained (for UI feedback)
  recentGains: [] as Array<{
    materialId: string;
    amount: number;
    timestamp: number;
  }>
});

syncObservable(materialsStore$, {
  persist: {
    name: 'materialsStore',
    plugin: ObservablePersistAsyncStorage({
      AsyncStorage
    })
  }
});
```

```typescript
// modules/automation/automationStore.ts

export const automationStore$ = observable({
  // Unlocks
  unlocks: [] as AutomationUnlock[],

  // Tree structure
  tree: [] as AutomationNode[],

  // Active automations
  activeAutomations: [] as string[],

  // Upgrade points
  upgradePoints: 0
});

syncObservable(automationStore$, {
  persist: {
    name: 'automationStore',
    plugin: ObservablePersistAsyncStorage({
      AsyncStorage
    })
  }
});
```

```typescript
// modules/progression/progressionStore.ts

export const progressionStore$ = observable({
  progression: {
    level: 1,
    currentPhase: ProgressionPhase.Phase1_Manual,
    unlockedFeatures: ['manual_salvage', 'manual_tinkering'],
    achievements: [],
    statistics: {
      totalItemsSalvaged: 0,
      totalManualSalvages: 0,
      totalAutoSalvages: 0,
      totalTinkeringAttempts: 0,
      totalTinkeringSuccesses: 0,
      totalMaterialsCollected: {},
      totalPlayTime: 0,
      sessionCount: 0,
      clickCount: 0,
      comboCount: 0,
      maxCombo: 0
    }
  } as PlayerProgression
});

syncObservable(progressionStore$, {
  persist: {
    name: 'progressionStore',
    plugin: ObservablePersistAsyncStorage({
      AsyncStorage
    })
  }
});
```

### State Access Patterns

```typescript
// Reading state (reactive)
import { observer } from '@legendapp/react';

const MyComponent = observer(() => {
  // Component re-renders when these values change
  const itemCount = salvageStore$.inventory.length.get();
  const isEnabled = salvageStore$.automation.enabled.get();

  return <Text>{itemCount} items</Text>;
});

// Writing state
salvageStore$.inventory.push(newItem);
salvageStore$.automation.enabled.set(true);

// Batching updates
import { batch } from '@legendapp/state';

batch(() => {
  salvageStore$.queue.push(entry1);
  salvageStore$.queue.push(entry2);
  salvageStore$.combo.count.set((prev) => prev + 1);
});

// Computed values
import { computed } from '@legendapp/state';

const totalMaterials$ = computed(() => {
  const inventory = materialsStore$.inventory.get();
  return Object.values(inventory).reduce((sum, count) => sum + count, 0);
});
```

---

## Core Systems

### 1. Salvage System

#### Salvage Logic (`modules/salvage/salvageLogic.ts`)

```typescript
import { Item, MaterialDrop, SalvageQueueEntry } from './types';
import { materialsStore$ } from '../materials/materialsStore';
import { salvageStore$ } from './salvageStore';
import { progressionStore$ } from '../progression/progressionStore';

/**
 * Calculate materials from salvaging an item
 */
export function calculateSalvageMaterials(item: Item): Map<string, number> {
  const results = new Map<string, number>();

  for (const drop of item.materials) {
    // Check drop chance
    if (Math.random() > drop.dropChance) continue;

    // Roll amount
    const amount = Math.floor(
      Math.random() * (drop.maxAmount - drop.minAmount + 1) + drop.minAmount
    );

    results.set(drop.materialId, (results.get(drop.materialId) || 0) + amount);
  }

  return results;
}

/**
 * Execute salvage operation (manual)
 */
export function salvageItem(item: Item): void {
  const materials = calculateSalvageMaterials(item);

  // Add materials to inventory
  materials.forEach((amount, materialId) => {
    const current = materialsStore$.inventory[materialId].peek() || 0;
    materialsStore$.inventory[materialId].set(current + amount);

    // Track recent gain for UI
    materialsStore$.recentGains.push({
      materialId,
      amount,
      timestamp: Date.now()
    });
  });

  // Update statistics
  progressionStore$.progression.statistics.totalItemsSalvaged.set((v) => v + 1);
  progressionStore$.progression.statistics.totalManualSalvages.set((v) => v + 1);

  // Update combo
  updateCombo();
}

/**
 * Update combo system
 */
function updateCombo(): void {
  const now = Date.now();
  const lastClick = salvageStore$.combo.lastClickTime.peek();
  const comboWindow = 1000; // 1 second window

  if (now - lastClick < comboWindow) {
    // Continue combo
    salvageStore$.combo.count.set((v) => v + 1);
    const count = salvageStore$.combo.count.peek();

    // Update multiplier (every 10 clicks)
    if (count % 10 === 0) {
      salvageStore$.combo.multiplier.set(Math.min(count / 10 + 1, 5)); // Max 5x
    }

    salvageStore$.combo.expiresAt.set(now + comboWindow);
  } else {
    // Reset combo
    salvageStore$.combo.count.set(1);
    salvageStore$.combo.multiplier.set(1);
    salvageStore$.combo.expiresAt.set(now + comboWindow);
  }

  salvageStore$.combo.lastClickTime.set(now);
}

/**
 * Add item to salvage queue
 */
export function queueSalvage(item: Item, auto: boolean = false): string {
  const now = Date.now();
  const entry: SalvageQueueEntry = {
    id: `salvage_${now}_${Math.random()}`,
    item,
    startTime: now,
    endTime: now + item.salvageTime,
    progress: 0,
    autoSalvaged: auto
  };

  salvageStore$.queue.push(entry);
  return entry.id;
}

/**
 * Process salvage queue (called by automation engine)
 */
export function processSalvageQueue(deltaTime: number): void {
  const queue = salvageStore$.queue.peek();
  const now = Date.now();

  queue.forEach((entry, index) => {
    const elapsed = now - entry.startTime;
    const progress = Math.min(elapsed / (entry.endTime - entry.startTime), 1);

    salvageStore$.queue[index].progress.set(progress);

    if (progress >= 1) {
      // Complete salvage
      salvageItem(entry.item);

      // Remove from queue
      salvageStore$.queue.splice(index, 1);

      // Update statistics
      if (entry.autoSalvaged) {
        progressionStore$.progression.statistics.totalAutoSalvages.set((v) => v + 1);
      }
    }
  });
}

/**
 * Batch salvage multiple items
 */
export function batchSalvage(items: Item[]): void {
  items.forEach(item => queueSalvage(item, false));
}

/**
 * Check if item matches salvage filters
 */
export function matchesSalvageFilters(item: Item): boolean {
  const filters = salvageStore$.automation.filters.peek();

  return filters.some(filter => {
    if (!filter.enabled) return false;

    // Check rarity threshold
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const itemRarityIndex = rarityOrder.indexOf(item.rarity);
    const thresholdIndex = rarityOrder.indexOf(filter.rarityThreshold);

    if (itemRarityIndex > thresholdIndex) return false;

    // Check level threshold
    if (item.level > filter.levelThreshold) return false;

    // Check specific items
    if (filter.specificItems.length > 0 && !filter.specificItems.includes(item.id)) {
      return false;
    }

    // Check excluded items
    if (filter.excludeItems.includes(item.id)) return false;

    return true;
  });
}
```

#### Automation Engine (`modules/automation/automationEngine.ts`)

```typescript
import { salvageStore$ } from '../salvage/salvageStore';
import { tinkeringStore$ } from '../tinkering/tinkeringStore';
import { processSalvageQueue } from '../salvage/salvageLogic';
import { processTinkeringQueue } from '../tinkering/tinkeringLogic';
import { queueSalvage, matchesSalvageFilters } from '../salvage/salvageLogic';

/**
 * Main automation engine - runs on interval
 */
export class AutomationEngine {
  private intervalId: NodeJS.Timeout | null = null;
  private lastUpdateTime = Date.now();

  /**
   * Start automation engine
   */
  start(): void {
    if (this.intervalId) return;

    this.lastUpdateTime = Date.now();

    // Run at 60 FPS for smooth progress bars
    this.intervalId = setInterval(() => {
      this.update();
    }, 16); // ~60 FPS
  }

  /**
   * Stop automation engine
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Update automation systems
   */
  private update(): void {
    const now = Date.now();
    const deltaTime = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    // Process queues
    processSalvageQueue(deltaTime);
    processTinkeringQueue(deltaTime);

    // Auto-salvage
    this.autoSalvage();

    // Auto-tinker
    this.autoTinker();
  }

  /**
   * Automatic salvaging
   */
  private autoSalvage(): void {
    const automation = salvageStore$.automation.peek();
    if (!automation.enabled) return;

    const queue = salvageStore$.queue.peek();
    const inventory = salvageStore$.inventory.peek();

    // Check if queue has space
    if (queue.length >= automation.maxQueueSize) return;

    // Find items matching filters
    const matchingItems = inventory.filter(invItem =>
      matchesSalvageFilters(invItem)
    );

    // Add items to queue based on speed
    const itemsToAdd = Math.min(
      matchingItems.length,
      automation.maxQueueSize - queue.length
    );

    for (let i = 0; i < itemsToAdd; i++) {
      queueSalvage(matchingItems[i], true);
    }
  }

  /**
   * Automatic tinkering
   */
  private autoTinker(): void {
    const automation = tinkeringStore$.automation.peek();
    if (!automation.enabled) return;

    // Implementation in tinkering system
  }
}

// Singleton instance
export const automationEngine = new AutomationEngine();
```

### 2. Tinkering System

#### Tinkering Logic (`modules/tinkering/tinkeringLogic.ts`)

```typescript
import { Equipment, TinkerQueueEntry, TinkerResult, MaterialCost } from './types';
import { materialsStore$ } from '../materials/materialsStore';
import { tinkeringStore$ } from './tinkeringStore';
import { progressionStore$ } from '../progression/progressionStore';

/**
 * Calculate material costs for tinkering
 */
export function calculateTinkerCost(equipment: Equipment): MaterialCost[] {
  const level = equipment.tinkerLevel;

  // Cost scales: base * (1 + level * 0.1)
  return equipment.materials.map(cost => ({
    materialId: cost.materialId,
    amount: Math.ceil(cost.amount * (1 + level * 0.1))
  }));
}

/**
 * Check if player has materials for tinkering
 */
export function canAffordTinker(costs: MaterialCost[]): boolean {
  const inventory = materialsStore$.inventory.peek();

  return costs.every(cost => {
    const available = inventory[cost.materialId] || 0;
    return available >= cost.amount;
  });
}

/**
 * Consume materials for tinkering
 */
export function consumeMaterials(costs: MaterialCost[]): void {
  costs.forEach(cost => {
    const current = materialsStore$.inventory[cost.materialId].peek() || 0;
    materialsStore$.inventory[cost.materialId].set(current - cost.amount);
  });
}

/**
 * Calculate stat gains from tinkering
 */
export function calculateStatGains(equipment: Equipment): Stats {
  // Base gains: 1-2 per stat, increases with tinker level
  const baseGain = Math.floor(Math.random() * 2) + 1;
  const levelBonus = Math.floor(equipment.tinkerLevel / 10);

  return {
    attack: baseGain + levelBonus,
    defense: baseGain + levelBonus,
    health: (baseGain + levelBonus) * 5, // Health scales 5x
    critChance: 0.1, // 0.1% per tinker
    critDamage: 0.5  // 0.5% per tinker
  };
}

/**
 * Execute tinker operation
 */
export function tinkerEquipment(equipment: Equipment): TinkerResult {
  const costs = calculateTinkerCost(equipment);

  if (!canAffordTinker(costs)) {
    throw new Error('Insufficient materials');
  }

  // Consume materials
  consumeMaterials(costs);

  // Calculate gains
  const gains = calculateStatGains(equipment);

  // Apply gains
  const newStats = {
    attack: equipment.currentStats.attack + gains.attack,
    defense: equipment.currentStats.defense + gains.defense,
    health: equipment.currentStats.health + gains.health,
    critChance: equipment.currentStats.critChance + gains.critChance,
    critDamage: equipment.currentStats.critDamage + gains.critDamage
  };

  // Update equipment
  const updatedEquipment: Equipment = {
    ...equipment,
    currentStats: newStats,
    tinkerLevel: equipment.tinkerLevel + 1
  };

  // Update store
  const equipmentIndex = tinkeringStore$.equipment.peek().findIndex(e => e.id === equipment.id);
  if (equipmentIndex !== -1) {
    tinkeringStore$.equipment[equipmentIndex].set(updatedEquipment);
  }

  // Update statistics
  progressionStore$.progression.statistics.totalTinkeringAttempts.set((v) => v + 1);
  progressionStore$.progression.statistics.totalTinkeringSuccesses.set((v) => v + 1);

  return {
    success: true,
    equipment: updatedEquipment,
    materialsUsed: costs,
    statGains: gains
  };
}

/**
 * Add equipment to tinkering queue
 */
export function queueTinker(equipment: Equipment, auto: boolean = false): string {
  const now = Date.now();
  const tinkerTime = 2000; // 2 seconds base time

  const entry: TinkerQueueEntry = {
    id: `tinker_${now}_${Math.random()}`,
    equipment,
    startTime: now,
    endTime: now + tinkerTime,
    progress: 0,
    successChance: 1.0, // Phase 1: always succeed
    autoTinkered: auto
  };

  tinkeringStore$.queue.push(entry);
  return entry.id;
}

/**
 * Process tinkering queue
 */
export function processTinkeringQueue(deltaTime: number): void {
  const queue = tinkeringStore$.queue.peek();
  const now = Date.now();

  queue.forEach((entry, index) => {
    const elapsed = now - entry.startTime;
    const progress = Math.min(elapsed / (entry.endTime - entry.startTime), 1);

    tinkeringStore$.queue[index].progress.set(progress);

    if (progress >= 1) {
      // Complete tinker
      try {
        tinkerEquipment(entry.equipment);
      } catch (error) {
        console.error('Tinkering failed:', error);
      }

      // Remove from queue
      tinkeringStore$.queue.splice(index, 1);
    }
  });
}
```

### 3. Progression System

#### Progression Logic (`modules/progression/progressionLogic.ts`)

```typescript
import { progressionStore$ } from './progressionStore';
import { automationStore$ } from '../automation/automationStore';
import { ProgressionPhase, AutomationUnlock } from './types';

/**
 * Check and update progression phase
 */
export function updateProgressionPhase(): void {
  const level = progressionStore$.progression.level.peek();
  const currentPhase = progressionStore$.progression.currentPhase.peek();

  let newPhase = currentPhase;

  if (level >= 26 && currentPhase !== ProgressionPhase.Phase3_FullAuto) {
    newPhase = ProgressionPhase.Phase3_FullAuto;
    onPhaseTransition(newPhase);
  } else if (level >= 11 && currentPhase === ProgressionPhase.Phase1_Manual) {
    newPhase = ProgressionPhase.Phase2_Assisted;
    onPhaseTransition(newPhase);
  }

  if (newPhase !== currentPhase) {
    progressionStore$.progression.currentPhase.set(newPhase);
  }
}

/**
 * Handle phase transition
 */
function onPhaseTransition(phase: ProgressionPhase): void {
  switch (phase) {
    case ProgressionPhase.Phase2_Assisted:
      unlockFeature('batch_select');
      unlockFeature('salvage_filters');
      break;

    case ProgressionPhase.Phase3_FullAuto:
      unlockFeature('offline_progress');
      unlockFeature('smart_tinkering');
      unlockFeature('prestige_system');
      break;
  }
}

/**
 * Unlock a feature
 */
export function unlockFeature(featureId: string): void {
  const features = progressionStore$.progression.unlockedFeatures.peek();
  if (!features.includes(featureId)) {
    progressionStore$.progression.unlockedFeatures.push(featureId);
  }
}

/**
 * Check if feature is unlocked
 */
export function isFeatureUnlocked(featureId: string): boolean {
  return progressionStore$.progression.unlockedFeatures.peek().includes(featureId);
}

/**
 * Check and unlock automations based on level
 */
export function checkAutomationUnlocks(level: number): void {
  const unlocks = automationStore$.unlocks.peek();

  unlocks.forEach((unlock, index) => {
    if (!unlock.unlocked && level >= unlock.levelRequired) {
      automationStore$.unlocks[index].unlocked.set(true);

      // Show notification
      // TODO: Add notification system
    }
  });
}

/**
 * Level up handler
 */
export function onLevelUp(newLevel: number): void {
  progressionStore$.progression.level.set(newLevel);

  // Check progression phase
  updateProgressionPhase();

  // Check automation unlocks
  checkAutomationUnlocks(newLevel);

  // Check achievements
  checkAchievements();
}

/**
 * Check and award achievements
 */
export function checkAchievements(): void {
  const achievements = progressionStore$.progression.achievements.peek();
  const stats = progressionStore$.progression.statistics.peek();

  achievements.forEach((achievement, index) => {
    if (achievement.unlocked) return;

    let conditionMet = false;

    switch (achievement.condition.type) {
      case 'salvage_count':
        conditionMet = stats.totalItemsSalvaged >= achievement.condition.target;
        break;
      case 'tinker_count':
        conditionMet = stats.totalTinkeringSuccesses >= achievement.condition.target;
        break;
      case 'level':
        conditionMet = progressionStore$.progression.level.peek() >= achievement.condition.target;
        break;
      case 'combo':
        conditionMet = stats.maxCombo >= achievement.condition.target;
        break;
    }

    if (conditionMet) {
      progressionStore$.progression.achievements[index].unlocked.set(true);
      progressionStore$.progression.achievements[index].unlockedAt.set(Date.now());

      // Award rewards
      // TODO: Implement reward system
    }
  });
}
```

---

## UI Components

### Phase 1: Manual Interface Components

```typescript
// modules/salvage/SalvageButton.tsx

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { observer } from '@legendapp/react';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  runOnJS
} from 'react-native-reanimated';

interface SalvageButtonProps {
  item: Item;
  onSalvage: (item: Item) => void;
}

export const SalvageButton = observer(({ item, onSalvage }: SalvageButtonProps) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animation
    scale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );

    rotation.value = withSequence(
      withSpring(-5, { damping: 15 }),
      withSpring(5, { damping: 15 }),
      withSpring(0, { damping: 15 }, () => {
        runOnJS(onSalvage)(item);
      })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ]
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        style={[styles.button, styles[`${item.rarity}Button`]]}
      >
        {/* Item rendering */}
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2
  },
  commonButton: {
    backgroundColor: '#9E9E9E',
    borderColor: '#757575'
  },
  uncommonButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C'
  },
  rareButton: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2'
  },
  epicButton: {
    backgroundColor: '#9C27B0',
    borderColor: '#7B1FA2'
  },
  legendaryButton: {
    backgroundColor: '#FF9800',
    borderColor: '#F57C00'
  }
});
```

```typescript
// modules/materials/MaterialCounter.tsx

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { observer } from '@legendapp/react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence
} from 'react-native-reanimated';
import { materialsStore$ } from './materialsStore';

interface MaterialCounterProps {
  materialId: string;
  showAnimation?: boolean;
}

export const MaterialCounter = observer(({
  materialId,
  showAnimation = true
}: MaterialCounterProps) => {
  const count = materialsStore$.inventory[materialId].get() || 0;
  const material = materialsStore$.materials.get().find(m => m.id === materialId);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Animate on count change
  useEffect(() => {
    if (showAnimation && count > 0) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
    }
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  if (!material) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.name}>{material.name}</Text>
      <Text style={styles.count}>{count}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 4
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1
  },
  count: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50'
  }
});
```

### Phase 2: Automation Components

```typescript
// modules/automation/AutomationTree.tsx

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { observer } from '@legendapp/react';
import { automationStore$ } from './automationStore';
import { progressionStore$ } from '../progression/progressionStore';
import * as Haptics from 'expo-haptics';

export const AutomationTree = observer(() => {
  const unlocks = automationStore$.unlocks.get();
  const level = progressionStore$.progression.level.get();

  const handleUnlockPress = (unlock: AutomationUnlock) => {
    if (!unlock.unlocked || unlock.active) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // TODO: Activate automation
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Automation Upgrades</Text>

      {unlocks.map((unlock) => {
        const isUnlocked = unlock.unlocked;
        const canUnlock = level >= unlock.levelRequired;
        const isActive = unlock.active;

        return (
          <Pressable
            key={unlock.id}
            onPress={() => handleUnlockPress(unlock)}
            style={[
              styles.unlockCard,
              !isUnlocked && styles.locked,
              isActive && styles.active
            ]}
            disabled={!isUnlocked}
          >
            <View style={styles.unlockHeader}>
              <Text style={styles.unlockName}>{unlock.name}</Text>
              <Text style={styles.levelRequired}>Lv. {unlock.levelRequired}</Text>
            </View>

            <Text style={styles.description}>{unlock.description}</Text>

            {isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>ACTIVE</Text>
              </View>
            )}

            {!isUnlocked && canUnlock && (
              <View style={styles.unlockable}>
                <Text style={styles.unlockableText}>Unlockable!</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  unlockCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0'
  },
  locked: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5'
  },
  active: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9'
  },
  unlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  unlockName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  levelRequired: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  description: {
    fontSize: 14,
    color: '#666'
  },
  activeBadge: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  },
  unlockable: {
    marginTop: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  unlockableText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12
  }
});
```

---

## Animation & Feedback

### Haptic Feedback Strategy

```typescript
// utils/haptics.ts

import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback patterns
 */
export const HapticPatterns = {
  // Basic interactions
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  press: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavyPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

  // Game events
  salvageComplete: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  tinkerSuccess: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  tinkerFail: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  levelUp: () => {
    // Triple heavy impact for celebration
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
  },

  // Combo system
  combo: (multiplier: number) => {
    const style = multiplier >= 3
      ? Haptics.ImpactFeedbackStyle.Heavy
      : Haptics.ImpactFeedbackStyle.Medium;
    Haptics.impactAsync(style);
  }
};
```

### Sound Effects

```typescript
// utils/sounds.ts

import { Audio } from 'expo-audio';

export class SoundManager {
  private sounds: Map<string, Audio.Sound> = new Map();

  async loadSound(id: string, source: any): Promise<void> {
    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: false
    });
    this.sounds.set(id, sound);
  }

  async playSound(id: string): Promise<void> {
    const sound = this.sounds.get(id);
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        console.error(`Failed to play sound ${id}:`, error);
      }
    }
  }

  async unloadAll(): Promise<void> {
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();
  }
}

// Sound IDs
export const SoundIds = {
  SALVAGE_CLICK: 'salvage_click',
  SALVAGE_COMPLETE: 'salvage_complete',
  MATERIAL_GAIN: 'material_gain',
  TINKER_CLICK: 'tinker_click',
  TINKER_COMPLETE: 'tinker_complete',
  LEVEL_UP: 'level_up',
  UNLOCK: 'unlock'
};
```

### Particle Effects

```typescript
// components/ParticleSystem.tsx

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface ParticleSystemProps {
  particles: Particle[];
  onComplete: (id: string) => void;
}

const AnimatedParticle = ({
  particle,
  onComplete
}: {
  particle: Particle;
  onComplete: () => void;
}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Burst upward
    translateY.value = withTiming(-100, {
      duration: 1000,
      easing: Easing.out(Easing.cubic)
    });

    // Fade out
    opacity.value = withDelay(
      500,
      withTiming(0, { duration: 500 }, () => {
        onComplete();
      })
    );

    // Pulse
    scale.value = withTiming(1.5, {
      duration: 300,
      easing: Easing.out(Easing.quad)
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          borderRadius: particle.size / 2
        },
        animatedStyle
      ]}
    />
  );
};

export const ParticleSystem = ({ particles, onComplete }: ParticleSystemProps) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(particle => (
        <AnimatedParticle
          key={particle.id}
          particle={particle}
          onComplete={() => onComplete(particle.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000
  },
  particle: {
    position: 'absolute'
  }
});
```

---

## Persistence

### AsyncStorage Strategy

```typescript
// utils/persistence.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys
 */
export const StorageKeys = {
  SALVAGE_STORE: 'salvageStore',
  TINKERING_STORE: 'tinkeringStore',
  MATERIALS_STORE: 'materialsStore',
  AUTOMATION_STORE: 'automationStore',
  PROGRESSION_STORE: 'progressionStore',
  LAST_OFFLINE_TIME: 'lastOfflineTime'
};

/**
 * Calculate offline progress
 */
export async function calculateOfflineProgress(): Promise<void> {
  try {
    const lastOfflineTimeStr = await AsyncStorage.getItem(StorageKeys.LAST_OFFLINE_TIME);
    if (!lastOfflineTimeStr) return;

    const lastOfflineTime = parseInt(lastOfflineTimeStr, 10);
    const now = Date.now();
    const offlineTime = now - lastOfflineTime;

    // Only calculate if Phase 3 unlocked
    const progression = progressionStore$.progression.peek();
    if (progression.currentPhase !== ProgressionPhase.Phase3_FullAuto) return;

    // Calculate offline gains (capped at 8 hours)
    const maxOfflineTime = 8 * 60 * 60 * 1000; // 8 hours
    const effectiveOfflineTime = Math.min(offlineTime, maxOfflineTime);

    // Simulate salvaging
    const automation = salvageStore$.automation.peek();
    if (automation.enabled) {
      const itemsPerSecond = automation.itemsPerSecond;
      const totalItems = Math.floor((effectiveOfflineTime / 1000) * itemsPerSecond);

      // TODO: Award offline progress
      console.log(`Offline progress: ${totalItems} items salvaged`);
    }

  } catch (error) {
    console.error('Failed to calculate offline progress:', error);
  }
}

/**
 * Save offline time on app background
 */
export async function saveOfflineTime(): Promise<void> {
  try {
    await AsyncStorage.setItem(
      StorageKeys.LAST_OFFLINE_TIME,
      Date.now().toString()
    );
  } catch (error) {
    console.error('Failed to save offline time:', error);
  }
}
```

---

## Testing Strategy

### Test Coverage Goals
- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: All store interactions
- **Component Tests**: Critical user interactions
- **E2E Tests**: Core user flows

### Example Test Suite

```typescript
// modules/salvage/__tests__/salvageLogic.test.ts

import { calculateSalvageMaterials, salvageItem, updateCombo } from '../salvageLogic';
import { salvageStore$ } from '../salvageStore';
import { materialsStore$ } from '../../materials/materialsStore';
import { Rarity, Item } from '../types';

describe('Salvage Logic', () => {
  beforeEach(() => {
    // Reset stores
    salvageStore$.set({
      inventory: [],
      queue: [],
      automation: {
        enabled: false,
        itemsPerSecond: 0,
        maxQueueSize: 1,
        filters: [],
        upgradeLevel: 0
      },
      selectedItems: [],
      isProcessing: false,
      lastSalvageTime: 0,
      combo: {
        count: 0,
        multiplier: 1,
        lastClickTime: 0,
        expiresAt: 0
      }
    });

    materialsStore$.inventory.set({});
  });

  describe('calculateSalvageMaterials', () => {
    it('should return materials based on drop chances', () => {
      const item: Item = {
        id: 'test_sword',
        name: 'Test Sword',
        rarity: Rarity.Common,
        level: 1,
        salvageTime: 1000,
        materials: [
          {
            materialId: 'iron',
            minAmount: 1,
            maxAmount: 3,
            dropChance: 1.0
          }
        ]
      };

      const materials = calculateSalvageMaterials(item);

      expect(materials.has('iron')).toBe(true);
      const ironAmount = materials.get('iron')!;
      expect(ironAmount).toBeGreaterThanOrEqual(1);
      expect(ironAmount).toBeLessThanOrEqual(3);
    });

    it('should respect drop chances', () => {
      const item: Item = {
        id: 'test_item',
        name: 'Test Item',
        rarity: Rarity.Common,
        level: 1,
        salvageTime: 1000,
        materials: [
          {
            materialId: 'rare_gem',
            minAmount: 1,
            maxAmount: 1,
            dropChance: 0.0 // Never drops
          }
        ]
      };

      const materials = calculateSalvageMaterials(item);
      expect(materials.has('rare_gem')).toBe(false);
    });
  });

  describe('salvageItem', () => {
    it('should add materials to inventory', () => {
      const item: Item = {
        id: 'test_item',
        name: 'Test Item',
        rarity: Rarity.Common,
        level: 1,
        salvageTime: 1000,
        materials: [
          {
            materialId: 'wood',
            minAmount: 5,
            maxAmount: 5,
            dropChance: 1.0
          }
        ]
      };

      salvageItem(item);

      const woodCount = materialsStore$.inventory.wood.peek();
      expect(woodCount).toBe(5);
    });

    it('should update statistics', () => {
      const item: Item = {
        id: 'test_item',
        name: 'Test Item',
        rarity: Rarity.Common,
        level: 1,
        salvageTime: 1000,
        materials: []
      };

      const beforeCount = progressionStore$.progression.statistics.totalItemsSalvaged.peek();

      salvageItem(item);

      const afterCount = progressionStore$.progression.statistics.totalItemsSalvaged.peek();
      expect(afterCount).toBe(beforeCount + 1);
    });
  });

  describe('combo system', () => {
    it('should increase combo on rapid clicks', () => {
      const item: Item = {
        id: 'test_item',
        name: 'Test Item',
        rarity: Rarity.Common,
        level: 1,
        salvageTime: 1000,
        materials: []
      };

      salvageItem(item);
      const combo1 = salvageStore$.combo.count.peek();
      expect(combo1).toBe(1);

      // Click within combo window
      salvageItem(item);
      const combo2 = salvageStore$.combo.count.peek();
      expect(combo2).toBe(2);
    });

    it('should increase multiplier every 10 clicks', () => {
      const item: Item = {
        id: 'test_item',
        name: 'Test Item',
        rarity: Rarity.Common,
        level: 1,
        salvageTime: 1000,
        materials: []
      };

      // Click 10 times rapidly
      for (let i = 0; i < 10; i++) {
        salvageItem(item);
      }

      const multiplier = salvageStore$.combo.multiplier.peek();
      expect(multiplier).toBe(2);
    });
  });
});
```

---

## Performance Considerations

### Optimization Strategies

1. **State Updates**
   - Use Legend State's batching for multiple updates
   - Avoid unnecessary re-renders with `observer()`
   - Use `.peek()` for non-reactive reads

2. **Animations**
   - Use `react-native-reanimated` for 60 FPS animations
   - Run animations on UI thread with worklets
   - Limit simultaneous particle effects (max 50)

3. **Queue Processing**
   - Process queues at 60 FPS (16ms intervals)
   - Batch AsyncStorage writes (max 1/second)
   - Throttle haptic feedback (max 1 per 50ms)

4. **Memory Management**
   - Clean up completed queue entries
   - Limit recent gains array (max 20 items)
   - Unload sound assets when backgrounded

5. **Offline Progress**
   - Cap offline time calculation (8 hours max)
   - Calculate on app foreground only
   - Cache results for session

---

## Implementation Phases

### Phase 1: Manual Foundation (Week 1)
**Goal**: Implement core manual salvage and tinkering mechanics

#### Sprint 1.1: Core Data Models
- Create TypeScript interfaces for all systems
- Set up Legend State stores
- Implement persistence with AsyncStorage
- Write unit tests for data models

**Deliverables**:
- `modules/*/types.ts` files
- `modules/*/Store.ts` files
- Test coverage: 80%+

#### Sprint 1.2: Salvage Logic
- Implement `salvageLogic.ts`
- Material calculation algorithm
- Combo system
- Statistics tracking

**Deliverables**:
- Working salvage logic
- Combo multiplier system
- Test coverage: 90%+

#### Sprint 1.3: Salvage UI
- `SalvageButton` component
- `MaterialCounter` component
- `InventoryGrid` component
- Haptic feedback integration

**Deliverables**:
- Tappable salvage interface
- Material display with animations
- Satisfying feedback loops

#### Sprint 1.4: Tinkering Logic
- Implement `tinkeringLogic.ts`
- Cost calculation
- Stat gain algorithm
- Equipment upgrades

**Deliverables**:
- Working tinkering logic
- Material consumption
- Test coverage: 90%+

#### Sprint 1.5: Tinkering UI
- `TinkerButton` component
- `EquipmentGrid` component
- Hold-to-tinker mechanic
- Success animations

**Deliverables**:
- Interactive tinkering interface
- Visual feedback for upgrades

### Phase 2: Automation System (Week 2)
**Goal**: Implement progressive automation unlocks

#### Sprint 2.1: Automation Engine
- `automationEngine.ts`
- Queue processing at 60 FPS
- Auto-salvage logic
- Auto-tinker logic

**Deliverables**:
- Working automation engine
- Background processing
- Test coverage: 85%+

#### Sprint 2.2: Automation Unlocks
- Unlock tree structure
- Level-based unlocks
- Automation upgrade logic
- Feature flag system

**Deliverables**:
- Automation unlock system
- Progressive feature unlocks

#### Sprint 2.3: Automation UI
- `AutomationTree` component
- `SalvageAutomation` controls
- `TinkeringAutomation` controls
- Filter configuration UI

**Deliverables**:
- Automation management interface
- Visual unlock tree

#### Sprint 2.4: Batch & Filters
- Batch salvage logic
- Salvage filter system
- Priority queue for tinkering
- Smart suggestions (Phase 3 prep)

**Deliverables**:
- Working batch operations
- Configurable filters

### Phase 3: Advanced Features (Week 3)
**Goal**: Implement full automation and optimization features

#### Sprint 3.1: Offline Progress
- Offline time tracking
- Offline gain calculation
- Result presentation UI
- Cap and balancing

**Deliverables**:
- Working offline progression
- Rewards on app return

#### Sprint 3.2: Prestige System
- Prestige logic
- Bonus selection
- Forge mastery cycles
- God Click mechanic

**Deliverables**:
- Prestige system
- Endgame bonuses

#### Sprint 3.3: Statistics & Achievements
- Comprehensive stat tracking
- Achievement system
- Reward distribution
- Achievement UI

**Deliverables**:
- Achievement system
- Statistics dashboard

### Phase 4: Polish & Balance (Week 4)
**Goal**: Refinement, optimization, and balancing

#### Sprint 4.1: Performance Optimization
- Profile rendering performance
- Optimize animation count
- Reduce memory usage
- Improve AsyncStorage writes

**Deliverables**:
- 60 FPS on mid-range devices
- Smooth animations throughout

#### Sprint 4.2: Progression Balancing
- Tune XP requirements
- Balance material drop rates
- Adjust automation speeds
- Test progression pacing

**Deliverables**:
- Balanced progression curve
- Player testing feedback

#### Sprint 4.3: UI Polish
- Visual refinements
- Animation tweaks
- Sound effects
- Particle effects

**Deliverables**:
- Polished visual experience
- Satisfying feedback loops

#### Sprint 4.4: Testing & Bug Fixes
- Comprehensive QA
- Edge case testing
- Performance testing
- Bug fixes

**Deliverables**:
- Production-ready code
- Zero critical bugs

---

## Success Metrics

### Technical Metrics
- **Test Coverage**: 80%+ across all modules
- **Performance**: 60 FPS on React Native
- **Load Time**: <2 seconds to interactive
- **Crash Rate**: <0.1% of sessions
- **Memory Usage**: <150MB on mid-range devices

### Gameplay Metrics (from PRD)
- **Phase 1**: 80% salvage 100 items, 90% complete first tinker
- **Phase 2**: 70% unlock first automation, 60% use hybrid play
- **Phase 3**: 50% reach full automation, 30% engage with prestige

### Engagement Metrics
- **Session Length**: Phase 1: 10-15min, Phase 2: 20-30min, Phase 3: varied
- **Retention**: D1: 40%, D7: 20%, D30: 10%
- **Automation Unlock**: 70% of players reach Level 10

---

## Conclusion

This technical design document provides a comprehensive blueprint for implementing the Salvage & Tinkering System. The architecture leverages React Native best practices, Legend State for reactive state management, and progressive feature unlocking to create an engaging idle game experience.

**Key Principles**:
- Modular, testable code structure
- Progressive complexity matching player skill
- Satisfying feedback at every interaction
- Performance-first implementation
- State-driven reactive UI

**Next Steps**:
1. Review and approve this TDD
2. Set up project structure
3. Begin Phase 1 implementation
4. Iterate based on testing feedback

---

**Document Version**: 1.0
**Last Updated**: 2025-11-07
**Author**: Claude Code Assistant
**Status**: Ready for Review
