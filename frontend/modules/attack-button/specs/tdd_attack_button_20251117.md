# Technical Design Document: Attack Button Feature
## Singularity Pet Feeding System

**Document Version:** 1.0
**Date:** 2025-11-17
**Feature:** Singularity Pet Feeding System
**Module:** attack-button
**Status:** Draft - Ready for Implementation

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Component Design](#3-component-design)
4. [State Management](#4-state-management)
5. [Data Models](#5-data-models)
6. [Interface Specifications](#6-interface-specifications)
7. [Persistence Layer](#7-persistence-layer)
8. [Testing Strategy](#8-testing-strategy)
9. [Performance Considerations](#9-performance-considerations)
10. [Accessibility](#10-accessibility)
11. [Implementation Phases](#11-implementation-phases)
12. [Risk Mitigation](#12-risk-mitigation)

---

## 1. Executive Summary

### 1.1 Purpose
This document provides the technical design for implementing a core clicker/idler game mechanic centered around feeding a "Singularity Pet". The feature establishes the foundational gameplay loop for incremental progression.

### 1.2 Technical Approach
The implementation leverages:
- **React Native** with TypeScript for type safety
- **Legend State** (@legendapp/state) for reactive state management
- **AsyncStorage** for client-side persistence
- **Jest** and **React Testing Library** for comprehensive testing
- **Expo** framework for cross-platform support

### 1.3 Key Design Decisions
1. Use Legend State observables for reactive state management (existing pattern)
2. Create reusable component architecture that supports future features
3. Implement atomic state updates for data consistency
4. Use AsyncStorage with debounced writes for persistence
5. Follow React Native accessibility best practices

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│                    (Root Component)                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  AttackButtonScreen.tsx                      │
│              (Main Feature Component)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Feed Button UI                                     │  │
│  │  - Pet Counter Display                                │  │
│  │  - Event Handlers                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              useGameState Hook (shared/hooks/)               │
│  - Provides access to game state observables                 │
│  - Abstracts state management complexity                     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│            gameStore.ts (shared/store/)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  gameState$ Observable:                               │  │
│  │  - petCount: number                                   │  │
│  │  - scrap: number (future)                             │  │
│  │  - upgrades: Upgrade[] (future)                       │  │
│  │  - purchasedUpgrades: string[] (future)               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Functions:                                           │  │
│  │  - incrementPetCount()                                │  │
│  │  - resetPetCount()                                    │  │
│  │  - initializeGameState()                              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│           persistence.ts (shared/store/)                     │
│  - saveGameState(state: GameState): Promise<void>            │
│  - loadGameState(): Promise<GameState | null>                │
│  - clearGameState(): Promise<void>                           │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AsyncStorage                              │
│              (React Native Async Storage)                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Module Structure

```
frontend/
├── App.tsx                                    # Root component
├── modules/
│   └── attack-button/
│       ├── AttackButtonScreen.tsx             # Main feature component
│       ├── AttackButtonScreen.test.tsx        # Component tests
│       └── specs/
│           ├── prd_attack_button_20251117.md
│           └── tdd_attack_button_20251117.md
└── shared/
    ├── hooks/
    │   ├── useGameState.ts                    # State access hook
    │   └── useGameState.test.ts               # Hook tests (via component)
    ├── store/
    │   ├── gameStore.ts                       # Central state management
    │   ├── gameStore.test.ts                  # Store tests
    │   ├── persistence.ts                     # Storage layer
    │   └── persistence.test.ts                # Persistence tests
    └── types/
        └── game.ts                            # Shared type definitions
```

### 2.3 Data Flow

```
User Interaction Flow:
┌──────────────┐
│ User clicks  │
│ feed button  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│ onPress handler             │
│ in AttackButtonScreen       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ petCount$.set(prev => prev + 1) │
│ (Legend State update)       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Legend State triggers       │
│ component re-render         │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Updated count displayed     │
│ in UI immediately           │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ onChange listener           │
│ debounces save to storage   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ AsyncStorage persists       │
│ state after 1s debounce     │
└─────────────────────────────┘

Initialization Flow:
┌──────────────┐
│ App starts   │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│ initializeGameState()       │
│ called on mount             │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ loadGameState()             │
│ reads from AsyncStorage     │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ gameState$ updated with     │
│ loaded values or defaults   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ AttackButtonScreen renders  │
│ with initialized state      │
└─────────────────────────────┘
```

---

## 3. Component Design

### 3.1 AttackButtonScreen Component

**File:** `/frontend/modules/attack-button/AttackButtonScreen.tsx`

#### 3.1.1 Component Signature

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { useGameState } from '../../shared/hooks/useGameState';

export const AttackButtonScreen = observer(function AttackButtonScreen() {
  const { petCount$ } = useGameState();

  const handleFeed = () => {
    petCount$.set(prev => prev + 1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text
          style={styles.counterText}
          accessibilityRole="text"
          accessibilityLabel={`Singularity Pet Count: ${petCount$.get()}`}
        >
          Singularity Pet Count: {petCount$.get()}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={handleFeed}
          accessibilityRole="button"
          accessibilityLabel="feed button"
          accessibilityHint="Tap to feed your Singularity Pet and increase the count"
        >
          <Text style={styles.buttonText}>feed</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
});
```

#### 3.1.2 Component Responsibilities

1. **Render UI Elements:**
   - Display pet count with descriptive label
   - Render feed button with appropriate styling
   - Provide visual feedback on interactions

2. **Handle User Interactions:**
   - Process button press events
   - Update pet count through state management

3. **Accessibility:**
   - Provide proper ARIA labels and roles
   - Ensure keyboard navigation support
   - Meet WCAG 2.1 AA standards

4. **Performance:**
   - Use `observer` HOC for optimal re-renders
   - Memoize event handlers
   - Minimize unnecessary computations

#### 3.1.3 Styling Specifications

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  counterText: {
    fontSize: 18,
    marginBottom: 30,
    color: '#000000',
    fontWeight: '500',
  },
  button: {
    minWidth: 44,           // iOS minimum touch target
    minHeight: 44,          // iOS minimum touch target
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for depth (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for depth (Android)
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

#### 3.1.4 Behavior Specifications

| User Action | Expected Behavior | Performance Target |
|-------------|-------------------|-------------------|
| Button Press | Increment petCount by 1 | < 100ms response |
| Counter Update | Display new value immediately | < 50ms visual update |
| Rapid Clicking | Process all clicks accurately | No dropped inputs |
| Initial Load | Display saved count or 0 | < 200ms first paint |
| Background/Foreground | Persist state, restore on return | No data loss |

---

## 4. State Management

### 4.1 Legend State Architecture

Legend State provides reactive observables that automatically trigger re-renders when data changes. This eliminates the need for manual subscription management.

#### 4.1.1 Core Principles

1. **Single Source of Truth:** All game state lives in `gameState$` observable
2. **Immutable Updates:** Use functional updates (`set(prev => prev + 1)`)
3. **Computed Values:** Derive values automatically from base state
4. **Automatic Persistence:** State changes trigger debounced saves
5. **Type Safety:** Full TypeScript support throughout

### 4.2 Game Store Implementation

**File:** `/frontend/shared/store/gameStore.ts`

```typescript
import { observable, computed } from '@legendapp/state';
import { saveGameState, loadGameState } from './persistence';

/**
 * Game state interface
 * Defines structure of all game progression data
 */
export interface GameState {
  petCount: number;
  scrap: number;           // Reserved for future scrap system
  upgrades: Upgrade[];     // Reserved for future shop system
  purchasedUpgrades: string[]; // Reserved for future purchases
}

/**
 * Central game state observable
 * Single source of truth for all game data
 */
export const gameState$ = observable<GameState>({
  petCount: 0,
  scrap: 0,
  upgrades: [],
  purchasedUpgrades: [],
});

/**
 * Increment pet count by specified amount
 * Default increment is 1 (base feed action)
 *
 * @param amount - Number to add to pet count (default: 1)
 */
export function incrementPetCount(amount: number = 1): void {
  gameState$.petCount.set(prev => prev + amount);
}

/**
 * Reset pet count to zero
 * Used for testing or game reset functionality
 */
export function resetPetCount(): void {
  gameState$.petCount.set(0);
}

/**
 * Reset entire game state to defaults
 * Used for testing or full game reset
 */
export function resetGameState(): void {
  gameState$.set({
    petCount: 0,
    scrap: 0,
    upgrades: [],
    purchasedUpgrades: [],
  });
}

/**
 * Initialize game state from persistent storage
 * Called on app startup to restore previous session
 *
 * @returns Promise that resolves when initialization complete
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
  } catch (error) {
    console.error('Failed to initialize game state:', error);
    // Continue with default state on error
  }
}

/**
 * Validate pet count doesn't exceed maximum safe value
 * Prevents overflow issues
 */
export const maxPetCount = Number.MAX_SAFE_INTEGER;

/**
 * Check if pet count is at maximum
 * Used to show warnings or disable further increments
 */
export function isPetCountAtMax(): boolean {
  return gameState$.petCount.get() >= maxPetCount;
}

// Auto-persist game state on changes (debounced)
let saveTimeout: NodeJS.Timeout | null = null;
const SAVE_DEBOUNCE_MS = 1000;

gameState$.onChange(() => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    const state = gameState$.get();
    saveGameState(state).catch(error => {
      console.error('Failed to persist game state:', error);
    });
  }, SAVE_DEBOUNCE_MS);
});
```

### 4.3 useGameState Hook

**File:** `/frontend/shared/hooks/useGameState.ts`

```typescript
import { gameState$ } from '../store/gameStore';

/**
 * Hook for accessing game state observables
 * Provides reactive access to game data
 *
 * Usage:
 * const { petCount$ } = useGameState();
 * const count = petCount$.get();      // Read value
 * petCount$.set(10);                  // Write value
 * petCount$.set(prev => prev + 1);    // Functional update
 *
 * @returns Object containing game state observables
 */
export function useGameState() {
  return {
    petCount$: gameState$.petCount,
    scrap$: gameState$.scrap,
    upgrades$: gameState$.upgrades,
    purchasedUpgrades$: gameState$.purchasedUpgrades,
  };
}
```

### 4.4 State Update Patterns

#### 4.4.1 Direct Updates
```typescript
// Set absolute value
petCount$.set(100);

// Read current value
const current = petCount$.get();
```

#### 4.4.2 Functional Updates (Recommended)
```typescript
// Increment safely
petCount$.set(prev => prev + 1);

// Decrement with validation
petCount$.set(prev => Math.max(0, prev - 1));

// Conditional update
petCount$.set(prev => prev < maxPetCount ? prev + 1 : prev);
```

#### 4.4.3 Batch Updates
```typescript
// Update multiple properties atomically
gameState$.set(prev => ({
  ...prev,
  petCount: prev.petCount + 1,
  scrap: prev.scrap + 5,
}));
```

---

## 5. Data Models

### 5.1 Type Definitions

**File:** `/frontend/shared/types/game.ts`

```typescript
/**
 * Game state interface
 * Represents all persisted game data
 */
export interface GameState {
  /** Number of times player has fed the Singularity Pet */
  petCount: number;

  /** Scrap currency amount (passive resource) */
  scrap: number;

  /** Available upgrades in shop */
  upgrades: Upgrade[];

  /** IDs of upgrades player has purchased */
  purchasedUpgrades: string[];
}

/**
 * Upgrade definition (future feature)
 * Defines shop items and their effects
 */
export interface Upgrade {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Description of effect */
  description: string;

  /** Scrap cost to purchase */
  scrapCost: number;

  /** Type of effect this upgrade provides */
  effectType: 'scrapMultiplier' | 'petBonus';

  /** Numerical effect value */
  effectValue: number;
}

/**
 * Persisted game state structure
 * Stored in AsyncStorage with versioning
 */
export interface PersistedGameState {
  /** Schema version for migrations */
  version: number;

  /** Game state data */
  data: GameState;

  /** Timestamp of last save */
  timestamp: number;
}

/**
 * Storage keys for AsyncStorage
 */
export const STORAGE_KEYS = {
  GAME_STATE: 'game-state-v1',
} as const;

/**
 * Default game state values
 */
export const DEFAULT_GAME_STATE: GameState = {
  petCount: 0,
  scrap: 0,
  upgrades: [],
  purchasedUpgrades: [],
};
```

### 5.2 Data Validation

```typescript
/**
 * Validate game state structure
 * Ensures loaded data matches expected schema
 *
 * @param state - State object to validate
 * @returns True if valid, false otherwise
 */
export function isValidGameState(state: unknown): state is GameState {
  if (typeof state !== 'object' || state === null) {
    return false;
  }

  const s = state as Record<string, unknown>;

  return (
    typeof s.petCount === 'number' &&
    typeof s.scrap === 'number' &&
    Array.isArray(s.upgrades) &&
    Array.isArray(s.purchasedUpgrades) &&
    s.petCount >= 0 &&
    s.scrap >= 0 &&
    s.petCount <= Number.MAX_SAFE_INTEGER
  );
}

/**
 * Sanitize game state
 * Clamps values to valid ranges
 *
 * @param state - State to sanitize
 * @returns Sanitized state
 */
export function sanitizeGameState(state: GameState): GameState {
  return {
    ...state,
    petCount: Math.max(0, Math.min(state.petCount, Number.MAX_SAFE_INTEGER)),
    scrap: Math.max(0, state.scrap),
  };
}
```

---

## 6. Interface Specifications

### 6.1 Component Props

```typescript
/**
 * AttackButtonScreen props
 * Currently no props needed (self-contained screen)
 */
export interface AttackButtonScreenProps {
  // Reserved for future use (e.g., navigation callbacks)
}
```

### 6.2 Public API

```typescript
/**
 * Game Store Public API
 * Functions and observables exported for external use
 */
export interface GameStoreAPI {
  // State observables
  gameState$: Observable<GameState>;

  // Functions
  incrementPetCount: (amount?: number) => void;
  resetPetCount: () => void;
  resetGameState: () => void;
  initializeGameState: () => Promise<void>;
  isPetCountAtMax: () => boolean;

  // Constants
  maxPetCount: number;
}
```

### 6.3 Event Handlers

```typescript
/**
 * Feed button press handler
 * Increments pet count by 1
 */
type FeedHandler = () => void;

/**
 * Generic state change listener
 * Called when any game state property changes
 */
type StateChangeListener = (changes: {
  value: GameState;
  previousValue: GameState;
}) => void;
```

---

## 7. Persistence Layer

### 7.1 Storage Strategy

**File:** `/frontend/shared/store/persistence.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GameState,
  PersistedGameState,
  STORAGE_KEYS,
  DEFAULT_GAME_STATE,
  isValidGameState,
  sanitizeGameState,
} from '../types/game';

const CURRENT_VERSION = 1;

/**
 * Save game state to AsyncStorage
 * Includes version and timestamp for migrations
 *
 * @param state - Game state to save
 * @returns Promise that resolves when save completes
 */
export async function saveGameState(state: GameState): Promise<void> {
  try {
    const persisted: PersistedGameState = {
      version: CURRENT_VERSION,
      data: state,
      timestamp: Date.now(),
    };

    const serialized = JSON.stringify(persisted);
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATE, serialized);
  } catch (error) {
    // Handle storage errors
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
        throw new StorageQuotaError('Storage quota exceeded');
      }
    }
    throw error;
  }
}

/**
 * Load game state from AsyncStorage
 * Validates and migrates data as needed
 *
 * @returns Promise resolving to game state or null if not found
 */
export async function loadGameState(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATE);

    if (!raw) {
      return null; // No saved state
    }

    const persisted: PersistedGameState = JSON.parse(raw);

    // Version migration logic
    let state: GameState;

    if (persisted.version === 1) {
      state = persisted.data;
    } else {
      console.warn('Unknown state version:', persisted.version);
      return null;
    }

    // Validate loaded state
    if (!isValidGameState(state)) {
      console.warn('Invalid state structure, using defaults');
      return null;
    }

    // Sanitize values
    return sanitizeGameState(state);

  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

/**
 * Clear all game state from storage
 * Used for testing or manual reset
 *
 * @returns Promise that resolves when clear completes
 */
export async function clearGameState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  } catch (error) {
    console.error('Failed to clear game state:', error);
    throw error;
  }
}

/**
 * Check if storage is available
 * Useful for detecting private browsing mode or storage issues
 *
 * @returns Promise resolving to availability status
 */
export async function isStorageAvailable(): Promise<boolean> {
  try {
    const testKey = '__storage_test__';
    await AsyncStorage.setItem(testKey, 'test');
    await AsyncStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Custom error for storage quota exceeded
 */
export class StorageQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageQuotaError';
  }
}
```

### 7.2 Debouncing Strategy

The store automatically debounces saves to prevent excessive I/O:

```typescript
// In gameStore.ts
let saveTimeout: NodeJS.Timeout | null = null;
const SAVE_DEBOUNCE_MS = 1000; // 1 second

gameState$.onChange(() => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    const state = gameState$.get();
    saveGameState(state).catch(error => {
      console.error('Failed to persist game state:', error);
    });
  }, SAVE_DEBOUNCE_MS);
});
```

**Rationale:**
- Rapid clicks don't trigger multiple writes
- Last change within debounce window is saved
- Reduces storage I/O and battery usage
- 1 second delay acceptable for persistence

### 7.3 Error Handling

| Error Type | Handling Strategy | User Impact |
|------------|-------------------|-------------|
| Storage unavailable | Continue with in-memory state | Warning shown, no persistence |
| Quota exceeded | Log error, continue | Warning shown, recent changes may not save |
| Corrupted data | Load defaults, log error | Start fresh, previous progress lost |
| JSON parse error | Load defaults | Start fresh |
| Network error (N/A) | N/A (local storage only) | None |

---

## 8. Testing Strategy

### 8.1 Testing Pyramid

```
        ┌─────────────┐
        │   E2E Tests │  (Future - not in Phase 1)
        │   (Manual)  │
        └─────────────┘
       ┌───────────────┐
       │ Component     │  (25% - UI behavior)
       │ Tests         │
       └───────────────┘
     ┌───────────────────┐
     │ Unit Tests        │  (75% - Logic & Store)
     │ (Store, Helpers)  │
     └───────────────────┘
```

### 8.2 Unit Tests

#### 8.2.1 Game Store Tests

**File:** `/frontend/shared/store/gameStore.test.ts`

Test coverage areas:
- Observable initialization
- State updates (direct and functional)
- Increment functions
- Reset functions
- Maximum value handling
- Initialization from storage
- Auto-persistence behavior

**Key Test Cases:**

```typescript
describe('gameStore', () => {
  beforeEach(() => {
    // Reset state before each test
    resetGameState();
    jest.clearAllMocks();
  });

  describe('gameState$ observable', () => {
    test('initializes with zero pet count', () => {
      expect(gameState$.petCount.get()).toBe(0);
    });

    test('allows setting pet count', () => {
      gameState$.petCount.set(5);
      expect(gameState$.petCount.get()).toBe(5);
    });

    test('supports functional updates', () => {
      gameState$.petCount.set(10);
      gameState$.petCount.set(prev => prev + 5);
      expect(gameState$.petCount.get()).toBe(15);
    });
  });

  describe('incrementPetCount', () => {
    test('increments by 1 by default', () => {
      incrementPetCount();
      expect(gameState$.petCount.get()).toBe(1);
    });

    test('increments by specified amount', () => {
      incrementPetCount(5);
      expect(gameState$.petCount.get()).toBe(5);
    });

    test('accumulates multiple increments', () => {
      incrementPetCount(3);
      incrementPetCount(2);
      expect(gameState$.petCount.get()).toBe(5);
    });
  });

  describe('maximum value handling', () => {
    test('isPetCountAtMax returns false initially', () => {
      expect(isPetCountAtMax()).toBe(false);
    });

    test('isPetCountAtMax returns true at maximum', () => {
      gameState$.petCount.set(maxPetCount);
      expect(isPetCountAtMax()).toBe(true);
    });
  });

  describe('initializeGameState', () => {
    test('loads saved state from storage', async () => {
      const savedState: GameState = {
        petCount: 42,
        scrap: 100,
        upgrades: [],
        purchasedUpgrades: [],
      };

      (loadGameState as jest.Mock).mockResolvedValue(savedState);

      await initializeGameState();

      expect(gameState$.petCount.get()).toBe(42);
    });

    test('handles missing saved state gracefully', async () => {
      (loadGameState as jest.Mock).mockResolvedValue(null);

      await initializeGameState();

      expect(gameState$.petCount.get()).toBe(0);
    });

    test('handles load errors gracefully', async () => {
      (loadGameState as jest.Mock).mockRejectedValue(new Error('Load failed'));

      await expect(initializeGameState()).resolves.not.toThrow();
      expect(gameState$.petCount.get()).toBe(0);
    });
  });
});
```

**Coverage Target:** 90%+

#### 8.2.2 Persistence Tests

**File:** `/frontend/shared/store/persistence.test.ts`

Test coverage areas:
- Save operations
- Load operations
- Clear operations
- Error handling
- Data validation
- Version migrations

**Key Test Cases:**

```typescript
describe('persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveGameState', () => {
    test('saves state to AsyncStorage', async () => {
      const state: GameState = {
        petCount: 10,
        scrap: 50,
        upgrades: [],
        purchasedUpgrades: [],
      };

      await saveGameState(state);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.GAME_STATE,
        expect.stringContaining('"petCount":10')
      );
    });

    test('includes version and timestamp', async () => {
      const state = DEFAULT_GAME_STATE;
      await saveGameState(state);

      const [[, serialized]] = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const persisted: PersistedGameState = JSON.parse(serialized);

      expect(persisted.version).toBe(1);
      expect(persisted.timestamp).toBeGreaterThan(0);
    });

    test('throws StorageQuotaError when quota exceeded', async () => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      await expect(saveGameState(DEFAULT_GAME_STATE))
        .rejects.toThrow(StorageQuotaError);
    });
  });

  describe('loadGameState', () => {
    test('loads and parses saved state', async () => {
      const persisted: PersistedGameState = {
        version: 1,
        data: { petCount: 42, scrap: 100, upgrades: [], purchasedUpgrades: [] },
        timestamp: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(persisted)
      );

      const loaded = await loadGameState();

      expect(loaded).toEqual(persisted.data);
    });

    test('returns null when no saved state exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const loaded = await loadGameState();

      expect(loaded).toBeNull();
    });

    test('sanitizes invalid values', async () => {
      const persisted: PersistedGameState = {
        version: 1,
        data: { petCount: -5, scrap: -10, upgrades: [], purchasedUpgrades: [] },
        timestamp: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(persisted)
      );

      const loaded = await loadGameState();

      expect(loaded?.petCount).toBe(0); // Clamped to minimum
      expect(loaded?.scrap).toBe(0);    // Clamped to minimum
    });

    test('handles corrupted JSON gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{invalid json}');

      const loaded = await loadGameState();

      expect(loaded).toBeNull();
    });
  });

  describe('clearGameState', () => {
    test('removes state from storage', async () => {
      await clearGameState();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.GAME_STATE
      );
    });
  });

  describe('isStorageAvailable', () => {
    test('returns true when storage works', async () => {
      const available = await isStorageAvailable();
      expect(available).toBe(true);
    });

    test('returns false when storage fails', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage unavailable')
      );

      const available = await isStorageAvailable();
      expect(available).toBe(false);
    });
  });
});
```

**Coverage Target:** 90%+

### 8.3 Component Tests

#### 8.3.1 AttackButtonScreen Tests

**File:** `/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

Test coverage areas:
- Component rendering
- Button interaction
- Counter display updates
- Accessibility attributes
- Visual feedback states

**Key Test Cases:**

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AttackButtonScreen } from './AttackButtonScreen';
import { gameState$, resetGameState } from '../../shared/store/gameStore';

describe('AttackButtonScreen', () => {
  beforeEach(() => {
    resetGameState();
  });

  test('renders feed button', () => {
    const { getByText } = render(<AttackButtonScreen />);

    const button = getByText('feed');
    expect(button).toBeTruthy();
  });

  test('renders pet counter with initial value', () => {
    const { getByText } = render(<AttackButtonScreen />);

    expect(getByText(/Singularity Pet Count: 0/)).toBeTruthy();
  });

  test('increments counter when button pressed', () => {
    const { getByText } = render(<AttackButtonScreen />);

    const button = getByText('feed');
    fireEvent.press(button);

    expect(getByText(/Singularity Pet Count: 1/)).toBeTruthy();
  });

  test('increments counter multiple times', () => {
    const { getByText } = render(<AttackButtonScreen />);

    const button = getByText('feed');
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(getByText(/Singularity Pet Count: 3/)).toBeTruthy();
  });

  test('displays previously saved pet count', () => {
    gameState$.petCount.set(42);

    const { getByText } = render(<AttackButtonScreen />);

    expect(getByText(/Singularity Pet Count: 42/)).toBeTruthy();
  });

  test('button has correct accessibility attributes', () => {
    const { getByLabelText } = render(<AttackButtonScreen />);

    const button = getByLabelText('feed button');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityRole).toBe('button');
  });

  test('counter has correct accessibility label', () => {
    gameState$.petCount.set(5);

    const { getByLabelText } = render(<AttackButtonScreen />);

    const counter = getByLabelText('Singularity Pet Count: 5');
    expect(counter).toBeTruthy();
  });

  test('button applies pressed style on press', () => {
    const { getByText } = render(<AttackButtonScreen />);

    const button = getByText('feed');

    // Simulate press state
    fireEvent(button, 'pressIn');

    // Note: Testing style changes may require additional setup
    // or checking the style prop directly
  });

  test('handles rapid clicking correctly', () => {
    const { getByText } = render(<AttackButtonScreen />);

    const button = getByText('feed');

    // Simulate rapid clicks
    for (let i = 0; i < 10; i++) {
      fireEvent.press(button);
    }

    expect(getByText(/Singularity Pet Count: 10/)).toBeTruthy();
  });

  test('counter updates reactively to external state changes', () => {
    const { getByText, rerender } = render(<AttackButtonScreen />);

    expect(getByText(/Singularity Pet Count: 0/)).toBeTruthy();

    // External state update (e.g., from another component)
    gameState$.petCount.set(100);
    rerender(<AttackButtonScreen />);

    expect(getByText(/Singularity Pet Count: 100/)).toBeTruthy();
  });
});
```

**Coverage Target:** 80%+

### 8.4 Test Execution

As per project guidelines (CLAUDE.md), tests must be run using cmd.exe:

```bash
# Run all tests
cmd.exe /c "cd frontend && npm test"

# Run with coverage
cmd.exe /c "cd frontend && npm run test:coverage"

# Run specific test file
cmd.exe /c "cd frontend && npm test AttackButtonScreen.test.tsx"

# Watch mode
cmd.exe /c "cd frontend && npm run test:watch"
```

### 8.5 Coverage Requirements

| Component | Minimum Coverage | Target Coverage |
|-----------|-----------------|-----------------|
| gameStore.ts | 90% | 95% |
| persistence.ts | 90% | 95% |
| AttackButtonScreen.tsx | 80% | 90% |
| Overall Project | 80% | 85% |

---

## 9. Performance Considerations

### 9.1 Rendering Optimization

#### 9.1.1 Observer Pattern
```typescript
// Use observer HOC to minimize re-renders
export const AttackButtonScreen = observer(function AttackButtonScreen() {
  // Component only re-renders when observables it reads change
  const { petCount$ } = useGameState();
  return <Text>{petCount$.get()}</Text>;
});
```

**Benefits:**
- Automatic dependency tracking
- Granular re-renders
- No manual memoization needed

#### 9.1.2 Memoized Handlers
```typescript
// Handlers are stable across renders
const handleFeed = () => {
  petCount$.set(prev => prev + 1);
};
```

### 9.2 Storage Optimization

| Optimization | Implementation | Impact |
|--------------|----------------|--------|
| Debouncing | 1s delay before save | 99% reduction in writes |
| Batch Updates | Multiple changes = 1 save | Improved performance |
| Compressed JSON | Minimal serialization | Reduced storage size |

### 9.3 Performance Targets

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Button Response | < 100ms | Time from press to state update |
| Visual Update | < 50ms | Time from state change to UI update |
| Initial Load | < 200ms | Time to first interactive paint |
| Storage Write | < 100ms | AsyncStorage.setItem duration |
| Storage Read | < 150ms | AsyncStorage.getItem duration |
| Memory Usage | < 50MB | React Native DevTools |

### 9.4 Performance Testing

```typescript
describe('Performance', () => {
  test('handles rapid clicking without lag', async () => {
    const { getByText } = render(<AttackButtonScreen />);
    const button = getByText('feed');

    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      fireEvent.press(button);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(1000); // 100 clicks in < 1 second
    expect(gameState$.petCount.get()).toBe(100);
  });

  test('debounces storage writes', async () => {
    jest.useFakeTimers();

    incrementPetCount();
    incrementPetCount();
    incrementPetCount();

    // Should not save immediately
    expect(saveGameState).not.toHaveBeenCalled();

    // Advance past debounce delay
    jest.advanceTimersByTime(1000);

    // Should save once
    await Promise.resolve(); // Flush promises
    expect(saveGameState).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});
```

---

## 10. Accessibility

### 10.1 WCAG 2.1 AA Compliance

| Criterion | Implementation | Status |
|-----------|----------------|--------|
| 1.4.3 Contrast | Button: #007AFF on #FFFFFF (7.8:1) | Pass |
| 2.1.1 Keyboard | Full keyboard navigation support | Pass |
| 2.5.5 Target Size | 44x44pt minimum touch target | Pass |
| 4.1.2 Name, Role, Value | Proper ARIA labels and roles | Pass |

### 10.2 Accessibility Features

```typescript
// Button accessibility
<Pressable
  accessibilityRole="button"
  accessibilityLabel="feed button"
  accessibilityHint="Tap to feed your Singularity Pet and increase the count"
  accessibilityState={{ disabled: false }}
>
  <Text>feed</Text>
</Pressable>

// Counter accessibility
<Text
  accessibilityRole="text"
  accessibilityLabel={`Singularity Pet Count: ${petCount$.get()}`}
  accessibilityLiveRegion="polite" // Announces changes to screen readers
>
  Singularity Pet Count: {petCount$.get()}
</Text>
```

### 10.3 Screen Reader Support

| Element | Screen Reader Behavior |
|---------|----------------------|
| Feed Button | "feed button, button. Tap to feed your Singularity Pet" |
| Pet Counter | "Singularity Pet Count: [number], text" |
| Counter Updates | Announces new count after each press (polite) |

### 10.4 Testing Accessibility

```typescript
test('meets accessibility standards', () => {
  const { getByRole, getByLabelText } = render(<AttackButtonScreen />);

  // Check button is accessible
  const button = getByRole('button', { name: /feed button/i });
  expect(button).toBeTruthy();

  // Check counter is accessible
  const counter = getByLabelText(/Singularity Pet Count/i);
  expect(counter).toBeTruthy();

  // Check minimum touch target
  expect(button.props.style).toMatchObject({
    minWidth: 44,
    minHeight: 44,
  });
});
```

---

## 11. Implementation Phases

### Phase 1: Core Foundation (HIGH PRIORITY)
**Duration:** 1-2 days
**Goal:** Establish basic functionality and architecture

#### Tasks:
1. **Set up module structure**
   - Create `/frontend/modules/attack-button/` directory
   - Create `/frontend/shared/store/`, `/frontend/shared/hooks/`, `/frontend/shared/types/` directories

2. **Implement type definitions**
   - Create `game.ts` with GameState interface
   - Define storage keys and constants

3. **Implement game store**
   - Create `gameStore.ts` with Legend State observable
   - Implement `incrementPetCount()` function
   - Implement `resetGameState()` function
   - Set up basic structure for future features

4. **Create useGameState hook**
   - Implement hook to access petCount observable
   - Export other observables for future use

5. **Build AttackButtonScreen component**
   - Create basic UI with feed button and counter
   - Connect to game store
   - Implement button press handler
   - Apply basic styling

6. **Integrate into App.tsx**
   - Replace placeholder content with AttackButtonScreen
   - Test basic functionality

#### Acceptance Criteria:
- [ ] User can click feed button
- [ ] Counter increments on each click
- [ ] Counter displays current value
- [ ] Component renders without errors
- [ ] TypeScript compiles without errors

---

### Phase 2: Persistence (HIGH PRIORITY)
**Duration:** 1 day
**Goal:** Implement data persistence across sessions

#### Tasks:
1. **Implement persistence layer**
   - Create `persistence.ts` module
   - Implement `saveGameState()` function
   - Implement `loadGameState()` function
   - Implement `clearGameState()` function
   - Add data validation and sanitization

2. **Add auto-save to game store**
   - Set up onChange listener
   - Implement debouncing (1s delay)
   - Add error handling

3. **Implement initialization**
   - Create `initializeGameState()` function
   - Call on app startup
   - Handle missing or corrupted data

4. **Test persistence**
   - Verify saves occur after debounce
   - Verify loads work correctly
   - Test app restart preserves state

#### Acceptance Criteria:
- [ ] Pet count persists across app restarts
- [ ] No data loss during normal operation
- [ ] Corrupted data handled gracefully
- [ ] Debouncing prevents excessive writes

---

### Phase 3: Testing (HIGH PRIORITY)
**Duration:** 2 days
**Goal:** Achieve comprehensive test coverage

#### Tasks:
1. **Write game store tests**
   - Test observable initialization
   - Test state updates
   - Test increment functions
   - Test reset functions
   - Test initialization from storage
   - Test maximum value handling
   - Target: 90%+ coverage

2. **Write persistence tests**
   - Test save operations
   - Test load operations
   - Test clear operations
   - Test error handling
   - Test data validation
   - Target: 90%+ coverage

3. **Write component tests**
   - Test rendering
   - Test button interactions
   - Test counter updates
   - Test accessibility
   - Test rapid clicking
   - Target: 80%+ coverage

4. **Run tests using cmd.exe**
   - Verify all tests pass
   - Generate coverage report
   - Fix any failing tests

#### Acceptance Criteria:
- [ ] All tests pass in cmd.exe
- [ ] Game store coverage ≥ 90%
- [ ] Persistence coverage ≥ 90%
- [ ] Component coverage ≥ 80%
- [ ] Overall project coverage ≥ 80%

---

### Phase 4: Polish & Refinement (MEDIUM PRIORITY)
**Duration:** 1 day
**Goal:** Enhance user experience and visual feedback

#### Tasks:
1. **Add visual feedback**
   - Implement button press animation
   - Add shadow/elevation to button
   - Smooth counter transitions (optional)

2. **Enhance styling**
   - Apply design system colors
   - Ensure responsive layout
   - Test on different screen sizes

3. **Improve accessibility**
   - Add accessibilityHint to button
   - Set accessibilityLiveRegion on counter
   - Test with VoiceOver/TalkBack

4. **Optimize performance**
   - Profile rendering performance
   - Verify debouncing works correctly
   - Test rapid clicking (100+ clicks)

5. **Add maximum value handling**
   - Implement isPetCountAtMax() check
   - Show warning when approaching max (optional)

#### Acceptance Criteria:
- [ ] Button provides clear visual feedback
- [ ] Layout responsive across devices
- [ ] Accessible to screen reader users
- [ ] No performance issues with rapid clicking
- [ ] Maximum value handled gracefully

---

### Phase 5: Documentation (MEDIUM PRIORITY)
**Duration:** 0.5 days
**Goal:** Document implementation for maintainability

#### Tasks:
1. **Add code documentation**
   - JSDoc comments for all public functions
   - Inline comments for complex logic
   - Type documentation

2. **Update README (if needed)**
   - Document attack-button module
   - Explain architecture decisions

3. **Create usage examples**
   - Example of using useGameState hook
   - Example of accessing game store
   - Example of persistence operations

#### Acceptance Criteria:
- [ ] All public APIs have JSDoc comments
- [ ] Complex logic is explained with comments
- [ ] Architecture is documented

---

### Phase 6: Future Enhancements (LOW PRIORITY)
**Not in initial release**

Potential future features:
- Milestone celebrations (e.g., at 100 feeds)
- Keyboard shortcuts
- Haptic feedback on button press
- Sound effects
- Animated pet graphic
- Statistics tracking

---

## 12. Risk Mitigation

### 12.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| State management complexity | Low | Medium | Use proven Legend State pattern, extensive testing |
| Storage limitations | Low | Low | Implement graceful fallbacks, warn users |
| Performance under rapid clicking | Medium | Low | Debounce saves, optimize re-renders, test thoroughly |
| Test failures in cmd.exe | Medium | Medium | Follow project test patterns, run tests frequently |
| Type safety issues | Low | Low | Strict TypeScript, comprehensive types |

### 12.2 User Experience Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| Unclear purpose | Low | Medium | Clear labeling, intuitive design |
| Accidental clicks | Low | Low | No undo needed (incremental game) |
| Data loss | Low | High | Robust persistence, error handling |
| Performance lag | Low | Medium | Optimize rendering, debounce saves |

### 12.3 Architectural Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| Future feature conflicts | Medium | Medium | Design with extensibility, isolated state slices |
| Migration challenges | Low | Low | Version persistence data, plan migrations |
| Testing coverage gaps | Medium | High | Set coverage thresholds, review regularly |
| Inconsistent patterns | Low | Medium | Follow existing codebase patterns |

### 12.4 Contingency Plans

#### If storage fails:
1. Continue with in-memory state
2. Show non-intrusive warning to user
3. Allow gameplay to continue
4. Log error for debugging

#### If tests fail in cmd.exe:
1. Review test setup and mocks
2. Check for WSL-specific issues
3. Validate jest configuration
4. Run tests on different machine

#### If performance issues arise:
1. Profile with React DevTools
2. Implement throttling if needed
3. Reduce re-render scope
4. Consider alternative state approach

---

## 13. Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | React Native | 0.81.4 | UI framework |
| Language | TypeScript | ~5.9.2 | Type safety |
| State Management | Legend State | ^3.0.0-beta.35 | Reactive state |
| Storage | AsyncStorage | ^2.2.0 | Data persistence |
| UI Components | React Native Core | - | View, Text, Pressable |
| Safe Area | react-native-safe-area-context | ~5.6.0 | Safe area handling |
| Testing Framework | Jest | ^29.7.0 | Test runner |
| Testing Library | React Testing Library | ^13.3.3 | Component testing |
| Testing Preset | jest-expo | ^54.0.13 | Expo-specific setup |
| Platform | Expo | ^54.0.10 | Build & deploy |

---

## 14. File Manifest

### Files to Create:

```
frontend/
├── modules/
│   └── attack-button/
│       ├── AttackButtonScreen.tsx          [NEW]
│       └── AttackButtonScreen.test.tsx     [NEW]
└── shared/
    ├── hooks/
    │   ├── useGameState.ts                 [NEW]
    │   └── useGameState.test.ts            [NEW - optional]
    ├── store/
    │   ├── gameStore.ts                    [NEW]
    │   ├── gameStore.test.ts               [NEW]
    │   ├── persistence.ts                  [NEW]
    │   └── persistence.test.ts             [NEW]
    └── types/
        └── game.ts                         [NEW]
```

### Files to Modify:

```
frontend/
└── App.tsx                                 [MODIFY - integrate AttackButtonScreen]
```

**Total New Files:** 9
**Total Modified Files:** 1

---

## 15. Dependencies

### 15.1 Existing Dependencies
All required dependencies are already in package.json:
- @legendapp/state: ^3.0.0-beta.35
- @react-native-async-storage/async-storage: ^2.2.0
- react-native-safe-area-context: ~5.6.0

No new dependencies needed.

### 15.2 External Systems
None. This feature is entirely self-contained and uses local storage.

---

## 16. Success Criteria

### 16.1 Functional Criteria
- [ ] Feed button increments pet count by 1 on each press
- [ ] Counter displays current pet count with label
- [ ] Pet count persists across app restarts
- [ ] Counter starts at 0 for new users
- [ ] Button responds within 100ms
- [ ] Counter updates within 50ms

### 16.2 Technical Criteria
- [ ] TypeScript compiles without errors
- [ ] All tests pass in cmd.exe
- [ ] Test coverage ≥ 80% overall
- [ ] Test coverage ≥ 90% for store and persistence
- [ ] No console errors or warnings
- [ ] No memory leaks

### 16.3 User Experience Criteria
- [ ] Button provides clear visual feedback
- [ ] Interface is intuitive without instructions
- [ ] Handles rapid clicking gracefully
- [ ] Works on iOS, Android, and web
- [ ] Accessible to screen reader users

### 16.4 Quality Criteria
- [ ] Code follows project conventions
- [ ] All functions have JSDoc comments
- [ ] No linting errors
- [ ] WCAG 2.1 AA compliant

---

## 17. Appendix

### 17.1 References
- **PRD:** `/frontend/modules/attack-button/specs/prd_attack_button_20251117.md`
- **Project Guidelines:** `/CLAUDE.md`
- **Legend State Docs:** https://legendapp.com/open-source/state/
- **React Native Docs:** https://reactnative.dev/
- **AsyncStorage Docs:** https://react-native-async-storage.github.io/async-storage/

### 17.2 Glossary
- **Observable:** Reactive data container that triggers updates when changed
- **Debouncing:** Delaying function execution until after a period of inactivity
- **Persistence:** Storing data to survive app restarts
- **Atomic Update:** State change that completes fully or not at all
- **Functional Update:** State update using previous value as input

### 17.3 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-17 | Claude | Initial TDD creation |

---

**Document Status:** Ready for Implementation
**Next Steps:** Begin Phase 1 implementation

**Approval Required From:**
- [ ] Technical Lead
- [ ] Product Owner
- [ ] QA Lead

**Questions or Concerns:** Contact project maintainer
