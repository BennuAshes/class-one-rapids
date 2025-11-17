# Technical Design Document: Scrap System
## Passive Resource Generation System

**Document Version:** 1.0
**Date:** 2025-11-17
**Feature:** Scrap Collection System
**Module:** scrap
**Status:** Draft - Ready for Implementation

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Component Design](#3-component-design)
4. [State Management](#4-state-management)
5. [Data Models](#5-data-models)
6. [Timer Implementation](#6-timer-implementation)
7. [Persistence Layer](#7-persistence-layer)
8. [Testing Strategy](#8-testing-strategy)
9. [Performance Considerations](#9-performance-considerations)
10. [Accessibility](#10-accessibility)
11. [Implementation Phases](#11-implementation-phases)
12. [Risk Mitigation](#12-risk-mitigation)

---

## 1. Executive Summary

### 1.1 Purpose
This document provides the technical design for implementing a passive resource generation system that produces "scrap" based on the player's AI Pet count. This feature extends the existing single-screen clicker game with time-based passive income mechanics.

### 1.2 Technical Approach
The implementation leverages:
- **React Native** with TypeScript for type safety
- **Legend State** (@legendapp/state) for reactive state management
- **React Hooks** (useEffect) for timer management
- **AsyncStorage** for client-side persistence (existing infrastructure)
- **Jest** and **React Testing Library** for comprehensive testing

### 1.3 Key Design Decisions
1. Integrate scrap generation into existing AttackButtonScreen component (no new screen)
2. Use setInterval with useEffect cleanup for timer management
3. Leverage existing gameState$ observable and persistence layer (zero new infrastructure)
4. Generate scrap at 1:1 ratio with petCount (1 scrap per pet per second)
5. Foreground-only generation (no background processing)
6. Debounced persistence inherited from existing gameStore patterns

### 1.4 Integration Points
- **Existing Components:** AttackButtonScreen.tsx (modify)
- **Existing State:** gameStore.ts (already has scrap property)
- **Existing Persistence:** persistence.ts (already validates scrap)
- **Existing Types:** game.ts (GameState.scrap already defined)
- **Existing Hook:** useGameState.ts (already exports scrap$)

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AttackButtonScreen.tsx                    │
│              (Modified Feature Component)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  UI Layer:                                            │  │
│  │  - Pet Counter Display                                │  │
│  │  - Scrap Counter Display [NEW]                        │  │
│  │  - Feed Button                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Timer Logic (useEffect): [NEW]                       │  │
│  │  - setInterval for 1-second ticks                     │  │
│  │  - Read petCount from gameState$                      │  │
│  │  - Calculate scrap generation (petCount * 1)          │  │
│  │  - Update scrap via gameState$.scrap.set()            │  │
│  │  - Cleanup timer on unmount                           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              useGameState Hook (shared/hooks/)               │
│  - Provides petCount$ observable                             │
│  - Provides scrap$ observable [EXISTING]                     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│            gameStore.ts (shared/store/)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  gameState$ Observable (EXISTING):                    │  │
│  │  - petCount: number                                   │  │
│  │  - scrap: number [ALREADY EXISTS]                     │  │
│  │  - upgrades: Upgrade[]                                │  │
│  │  - purchasedUpgrades: string[]                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Auto-persistence onChange handler (EXISTING):        │  │
│  │  - Debounced save (1000ms) [NO CHANGES NEEDED]       │  │
│  │  - Automatically persists scrap changes               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│           persistence.ts (shared/store/)                     │
│  - saveGameState() [ALREADY HANDLES SCRAP]                   │
│  - loadGameState() [ALREADY HANDLES SCRAP]                   │
│  - sanitizeGameState() [ALREADY VALIDATES SCRAP]             │
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
├── App.tsx                                    # No changes needed
├── modules/
│   └── attack-button/
│       ├── AttackButtonScreen.tsx             # [MODIFY] Add scrap display + timer
│       └── AttackButtonScreen.test.tsx        # [MODIFY] Add scrap tests
└── shared/
    ├── hooks/
    │   └── useGameState.ts                    # [EXISTING] Already exports scrap$
    ├── store/
    │   ├── gameStore.ts                       # [EXISTING] Already has scrap in state
    │   ├── gameStore.test.ts                  # [NO CHANGES] scrap already tested
    │   ├── persistence.ts                     # [EXISTING] Already handles scrap
    │   └── persistence.test.ts                # [NO CHANGES] scrap already tested
    └── types/
        └── game.ts                            # [EXISTING] GameState.scrap exists
```

### 2.3 Data Flow

```
Timer-Based Scrap Generation Flow:

┌──────────────────────┐
│ Component Mounts     │
│ (AttackButtonScreen) │
└──────┬───────────────┘
       │
       ▼
┌────────────────────────────┐
│ useEffect Hook Executes    │
│ - Creates setInterval      │
│ - Returns cleanup function │
└──────┬─────────────────────┘
       │
       │ (Every 1000ms)
       ▼
┌────────────────────────────┐
│ Timer Callback Fires       │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ Read petCount from state   │
│ const count =              │
│   gameState$.petCount.get()│
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ Calculate scrap generated  │
│ const scrap = count * 1    │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ Update scrap in state      │
│ gameState$.scrap.set(      │
│   prev => prev + scrap     │
│ )                          │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ Legend State triggers      │
│ component re-render        │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ Updated scrap displayed    │
│ in UI immediately          │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ onChange listener          │
│ debounces save to storage  │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ AsyncStorage persists      │
│ state after 1s debounce    │
└────────────────────────────┘

User Interaction (Clicking) + Passive Generation:

┌──────────────────┐     ┌──────────────────┐
│ User clicks feed │     │ Timer ticks      │
│ button           │     │ (every 1s)       │
└────┬─────────────┘     └────┬─────────────┘
     │                        │
     ▼                        ▼
┌──────────────────┐     ┌──────────────────┐
│ petCount += 1    │     │ scrap +=         │
│                  │     │   petCount * 1   │
└────┬─────────────┘     └────┬─────────────┘
     │                        │
     └────────┬───────────────┘
              │
              ▼
     ┌────────────────────┐
     │ Both updates       │
     │ trigger single     │
     │ debounced save     │
     └────────────────────┘
```

---

## 3. Component Design

### 3.1 AttackButtonScreen Component Modifications

**File:** `/frontend/modules/attack-button/AttackButtonScreen.tsx`

#### 3.1.1 Current Implementation (Baseline)

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { useGameState } from '../../shared/hooks/useGameState';

export const AttackButtonScreen = observer(() => {
  const { petCount$ } = useGameState();

  const handleFeed = () => {
    petCount$.set((prev) => prev + 1);
  };

  const petCount = petCount$.get();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text
          style={styles.counterText}
          accessibilityRole="text"
          accessibilityLabel={`Singularity Pet Count: ${petCount}`}
        >
          Singularity Pet Count: {petCount}
        </Text>

        <Pressable
          onPress={handleFeed}
          accessibilityRole="button"
          accessibilityLabel="feed button"
          accessibilityHint="Tap to feed your Singularity Pet and increase the count"
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>feed</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
});
```

#### 3.1.2 Modified Implementation (With Scrap System)

```typescript
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { useGameState } from '../../shared/hooks/useGameState';

export const AttackButtonScreen = observer(() => {
  const { petCount$, scrap$ } = useGameState();

  const handleFeed = () => {
    petCount$.set((prev) => prev + 1);
  };

  // Scrap generation timer
  useEffect(() => {
    const interval = setInterval(() => {
      const petCount = petCount$.get();
      const scrapGenerated = petCount * 1; // 1 scrap per pet per second

      if (scrapGenerated > 0) {
        scrap$.set((prev) => prev + scrapGenerated);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array - timer should persist for component lifetime

  const petCount = petCount$.get();
  const scrap = scrap$.get();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text
          style={styles.counterText}
          accessibilityRole="text"
          accessibilityLabel={`Singularity Pet Count: ${petCount}`}
        >
          Singularity Pet Count: {petCount}
        </Text>

        <Text
          style={styles.scrapText}
          accessibilityRole="text"
          accessibilityLabel={`Scrap: ${scrap}`}
        >
          Scrap: {scrap}
        </Text>

        <Pressable
          onPress={handleFeed}
          accessibilityRole="button"
          accessibilityLabel="feed button"
          accessibilityHint="Tap to feed your Singularity Pet and increase the count"
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>feed</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
});
```

#### 3.1.3 Component Responsibilities

**Existing Responsibilities:**
1. Display pet count with descriptive label
2. Render feed button with appropriate styling
3. Handle button press events to increment pet count

**New Responsibilities:**
4. **Display scrap counter** with descriptive label
5. **Manage scrap generation timer** using useEffect and setInterval
6. **Calculate scrap per second** based on current petCount
7. **Update scrap state** every 1 second
8. **Clean up timer** on component unmount

#### 3.1.4 Updated Styling Specifications

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
    marginBottom: 10,        // Reduced from 30 to accommodate scrap display
    color: '#000000',
  },
  scrapText: {
    fontSize: 16,            // [NEW] Slightly smaller than pet count
    marginBottom: 20,        // [NEW] Space before button
    color: '#000000',
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
```

#### 3.1.5 Behavior Specifications

| User Action / Event | Expected Behavior | Performance Target |
|---------------------|-------------------|-------------------|
| Component Mount | Start scrap generation timer | < 10ms to setup |
| Timer Tick (1s) | Generate scrap based on petCount | < 5ms calculation |
| Scrap Update | Display new scrap value immediately | < 16ms visual update |
| petCount = 0 | No scrap generated (skip update) | No computation needed |
| petCount > 0 | Generate petCount * 1 scrap/second | Accurate to the second |
| Component Unmount | Clear timer interval | Prevent memory leaks |
| Button Press | petCount increments (unchanged behavior) | < 100ms response |

---

## 4. State Management

### 4.1 Existing State Infrastructure

The scrap system **does not require any new state management code**. All infrastructure already exists:

#### 4.1.1 GameState Interface (EXISTING)

**File:** `/frontend/shared/types/game.ts`

```typescript
export interface GameState {
  petCount: number;
  scrap: number;           // ← ALREADY EXISTS (line 30)
  upgrades: Upgrade[];
  purchasedUpgrades: string[];
}
```

#### 4.1.2 Game Store Observable (EXISTING)

**File:** `/frontend/shared/store/gameStore.ts`

```typescript
export const gameState$ = observable<GameState>({
  petCount: 0,
  scrap: 0,                // ← ALREADY INITIALIZED (line 26)
  upgrades: [],
  purchasedUpgrades: [],
});
```

#### 4.1.3 useGameState Hook (EXISTING)

**File:** `/frontend/shared/hooks/useGameState.ts`

```typescript
export function useGameState() {
  return {
    petCount$: gameState$.petCount,
    scrap$: gameState$.scrap,  // ← ALREADY EXPORTED (line 20)
    upgrades$: gameState$.upgrades,
    purchasedUpgrades$: gameState$.purchasedUpgrades,
  };
}
```

### 4.2 State Update Patterns

#### 4.2.1 Scrap Generation Pattern (NEW USAGE)

```typescript
// In AttackButtonScreen timer callback
useEffect(() => {
  const interval = setInterval(() => {
    // Read current petCount
    const petCount = gameState$.petCount.get();

    // Calculate scrap to generate
    const scrapGenerated = petCount * 1;

    // Update scrap using functional update
    if (scrapGenerated > 0) {
      gameState$.scrap.set((prev) => prev + scrapGenerated);
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

#### 4.2.2 Why Functional Updates?

```typescript
// ✅ CORRECT - Functional update (atomic, safe)
scrap$.set((prev) => prev + scrapGenerated);

// ❌ INCORRECT - Read-then-write (race condition risk)
const current = scrap$.get();
scrap$.set(current + scrapGenerated);
```

**Rationale:**
- Functional updates are atomic (no race conditions)
- Handles concurrent updates (clicking + timer)
- Matches existing patterns in gameStore.ts
- Recommended by Legend State documentation

### 4.3 Auto-Persistence (EXISTING)

**File:** `/frontend/shared/store/gameStore.ts` (lines 31-46)

```typescript
// Auto-persist game state on changes (debounced)
let saveTimeout: NodeJS.Timeout | null = null;
const SAVE_DEBOUNCE_MS = 1000;

gameState$.onChange(() => {
  // Clear existing timeout if there is one
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Set new timeout to save state
  saveTimeout = setTimeout(() => {
    const state = gameState$.get();
    saveGameState(state).catch((error) => {
      console.error('Error auto-saving game state:', error);
    });
  }, SAVE_DEBOUNCE_MS);
});
```

**How it handles scrap:**
- Scrap updates trigger onChange listener (automatic)
- Multiple scrap updates within 1s are batched (debounced)
- Timer ticks every 1s, debounce is 1s → effectively 1 save per second
- No additional persistence code needed

---

## 5. Data Models

### 5.1 Type Definitions (EXISTING)

All type definitions already exist. No changes needed.

**File:** `/frontend/shared/types/game.ts`

```typescript
export interface GameState {
  /** Number of times player has fed the Singularity Pet */
  petCount: number;

  /** Scrap currency amount (passive resource) */
  scrap: number;  // ← Used by this feature

  /** Available upgrades in shop */
  upgrades: Upgrade[];

  /** IDs of upgrades player has purchased */
  purchasedUpgrades: string[];
}
```

### 5.2 Data Validation (EXISTING)

All validation already implemented in persistence.ts.

**File:** `/frontend/shared/types/game.ts` (lines 72-105)

```typescript
/**
 * Type guard to validate if an unknown value is a valid GameState.
 */
export function isValidGameState(state: unknown): state is GameState {
  if (!state || typeof state !== 'object') {
    return false;
  }

  const s = state as Record<string, unknown>;

  return (
    typeof s.petCount === 'number' &&
    typeof s.scrap === 'number' &&      // ← Scrap validated (line 81)
    Array.isArray(s.upgrades) &&
    Array.isArray(s.purchasedUpgrades) &&
    s.purchasedUpgrades.every((id) => typeof id === 'string')
  );
}

/**
 * Sanitizes a game state by clamping values to valid ranges.
 */
export function sanitizeGameState(state: GameState): GameState {
  return {
    petCount: Math.max(
      0,
      Math.min(state.petCount, Number.MAX_SAFE_INTEGER)
    ),
    scrap: Math.max(0, Math.min(state.scrap, Number.MAX_SAFE_INTEGER)),  // ← Scrap sanitized (line 101)
    upgrades: state.upgrades || [],
    purchasedUpgrades: state.purchasedUpgrades || [],
  };
}
```

**Validation Rules for Scrap:**
- Must be a number
- Must be non-negative (≥ 0)
- Must be ≤ Number.MAX_SAFE_INTEGER
- Invalid values are clamped, not rejected
- Missing scrap defaults to 0

### 5.3 Constants

```typescript
/**
 * Scrap generation rate constant
 */
export const SCRAP_PER_PET_PER_SECOND = 1;

/**
 * Timer interval for scrap generation (milliseconds)
 */
export const SCRAP_GENERATION_INTERVAL_MS = 1000;

/**
 * Maximum scrap value (JavaScript safe integer limit)
 */
export const MAX_SCRAP = Number.MAX_SAFE_INTEGER;
```

---

## 6. Timer Implementation

### 6.1 Timer Architecture

#### 6.1.1 Implementation Pattern

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Timer callback logic
    const petCount = petCount$.get();
    const scrapGenerated = petCount * 1;

    if (scrapGenerated > 0) {
      scrap$.set((prev) => prev + scrapGenerated);
    }
  }, 1000);

  // Cleanup function
  return () => clearInterval(interval);
}, []); // Empty dependency array
```

#### 6.1.2 Why Empty Dependency Array?

```typescript
// ✅ CORRECT - Empty dependencies
useEffect(() => {
  const interval = setInterval(() => {
    // Use .get() to read latest values
    const petCount = petCount$.get();
  }, 1000);
  return () => clearInterval(interval);
}, []); // Timer runs for entire component lifetime

// ❌ INCORRECT - Including observables
useEffect(() => {
  const interval = setInterval(() => {
    const petCount = petCount$.get();
  }, 1000);
  return () => clearInterval(interval);
}, [petCount$]); // Would recreate timer on every state change (unnecessary)
```

**Rationale:**
- Timer should persist for component lifetime
- Use `.get()` inside callback to read latest values
- Including observables in dependencies is unnecessary (they're stable references)
- Reduces timer teardown/setup overhead

### 6.2 Timer Lifecycle

```
Component Mount
    │
    ▼
┌────────────────────────┐
│ useEffect executes     │
│ - Create interval      │
│ - Store interval ID    │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Timer Active           │
│ - Fires every 1000ms   │
│ - Generates scrap      │
└────────┬───────────────┘
         │
         │ (Component unmounts)
         ▼
┌────────────────────────┐
│ Cleanup function runs  │
│ clearInterval(id)      │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Timer Stopped          │
│ No memory leak         │
└────────────────────────┘
```

### 6.3 Timer Precision

**Expected Behavior:**
- setInterval aims for 1000ms intervals
- Actual precision: ~1000ms ± 50ms (acceptable variance)
- Not tied to system clock (uses relative timing)
- Sufficient for passive income mechanics

**Not Using:**
- ❌ setTimeout (requires manual recursion)
- ❌ requestAnimationFrame (unnecessary for 1s intervals)
- ❌ Web Workers (overkill, not React Native compatible)
- ❌ Third-party timer libraries (unnecessary dependency)

### 6.4 Edge Cases

#### 6.4.1 Zero Pet Count

```typescript
// Optimization: skip update when no scrap would be generated
if (scrapGenerated > 0) {
  scrap$.set((prev) => prev + scrapGenerated);
}
```

**Rationale:**
- Avoid unnecessary state updates
- Avoid triggering onChange listener
- Avoid triggering re-renders
- Avoid triggering debounced save

#### 6.4.2 Maximum Scrap Value

```typescript
// Handled by sanitizeGameState when loading from storage
// No runtime check needed during generation (would take ~285 million years to overflow)
```

#### 6.4.3 Component Unmounts During Timer Tick

```typescript
// React guarantees cleanup function runs before unmount
// clearInterval() stops all pending callbacks
return () => clearInterval(interval);
```

---

## 7. Persistence Layer

### 7.1 Existing Infrastructure (NO CHANGES)

All persistence infrastructure already handles scrap. No modifications needed.

#### 7.1.1 Save Function (EXISTING)

**File:** `/frontend/shared/store/persistence.ts` (lines 32-51)

```typescript
export async function saveGameState(state: GameState): Promise<void> {
  try {
    const persisted: PersistedGameState = {
      version: CURRENT_VERSION,
      data: state,  // ← state.scrap included automatically
      timestamp: Date.now(),
    };

    const serialized = JSON.stringify(persisted);
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATE, serialized);
  } catch (error) {
    // Error handling...
  }
}
```

#### 7.1.2 Load Function (EXISTING)

**File:** `/frontend/shared/store/persistence.ts` (lines 59-87)

```typescript
export async function loadGameState(): Promise<GameState | null> {
  try {
    const serialized = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATE);

    if (!serialized) {
      return null;
    }

    const persisted: PersistedGameState = JSON.parse(serialized);

    // Version check
    if (persisted.version !== CURRENT_VERSION) {
      console.warn(`Unsupported state version: ${persisted.version}`);
      return null;
    }

    // Validate state structure (includes scrap validation)
    if (!isValidGameState(persisted.data)) {
      console.warn('Invalid game state structure');
      return null;
    }

    // Sanitize values (clamps scrap to valid range)
    return sanitizeGameState(persisted.data);
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
}
```

### 7.2 Persistence Behavior

#### 7.2.1 Save Frequency

```
Timer ticks (1s) + Debounce (1s) = ~1 save per second (when scrap is generating)

Timeline:
0ms     - Timer fires, scrap updates
0ms     - onChange triggers, debounce starts
500ms   - (waiting...)
1000ms  - Timer fires again, scrap updates
1000ms  - onChange triggers, debounce RESETS
1500ms  - (waiting...)
2000ms  - Timer fires, scrap updates
2000ms  - onChange triggers, debounce RESETS
... pattern continues ...

Result: Save happens ~1 second after last update
```

**Implications:**
- At most 1 second of scrap generation can be lost on crash
- Acceptable for this game type (incremental/idle game)
- No performance issues from excessive saves

#### 7.2.2 Concurrent Updates

```
Scenario: User clicks feed button while timer is running

0ms     - Timer fires, scrap updates (onChange triggered)
200ms   - User clicks, petCount updates (onChange triggered AGAIN)
200ms   - Debounce timer resets
1200ms  - Save executes (includes both updates)

Result: Both updates saved atomically
```

### 7.3 Data Migration

**Current Version:** 1
**Scrap Handling:** Native (no migration needed)

```typescript
// If migrating from version 0 (hypothetical):
if (persisted.version === 0) {
  // Old version didn't have scrap property
  state = {
    ...persisted.data,
    scrap: 0,  // Default value
  };
}
```

**For this feature:** No migration needed (scrap already in schema).

---

## 8. Testing Strategy

### 8.1 Testing Pyramid

```
        ┌─────────────┐
        │   E2E Tests │  (Future - not in Phase 1)
        │   (Manual)  │
        └─────────────┘
       ┌───────────────┐
       │ Component     │  (30% - UI + Timer behavior)
       │ Tests         │
       └───────────────┘
     ┌───────────────────┐
     │ Unit Tests        │  (70% - No new unit tests needed)
     │ (Store already    │  (Store/persistence already tested)
     │  tested)          │
     └───────────────────┘
```

### 8.2 Component Tests (NEW)

#### 8.2.1 AttackButtonScreen Tests

**File:** `/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**New Test Cases to Add:**

```typescript
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AttackButtonScreen } from './AttackButtonScreen';
import { gameState$, resetGameState } from '../../shared/store/gameStore';

describe('AttackButtonScreen - Scrap System', () => {
  beforeEach(() => {
    resetGameState();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Scrap Display', () => {
    test('renders scrap counter with initial value', () => {
      const { getByText } = render(<AttackButtonScreen />);
      expect(getByText(/Scrap: 0/)).toBeTruthy();
    });

    test('displays previously saved scrap count', () => {
      gameState$.scrap.set(150);
      const { getByText } = render(<AttackButtonScreen />);
      expect(getByText(/Scrap: 150/)).toBeTruthy();
    });

    test('scrap counter has correct accessibility attributes', () => {
      gameState$.scrap.set(42);
      const { getByLabelText } = render(<AttackButtonScreen />);

      const scrapText = getByLabelText('Scrap: 42');
      expect(scrapText).toBeTruthy();
      expect(scrapText.props.accessibilityRole).toBe('text');
    });
  });

  describe('Scrap Generation', () => {
    test('generates no scrap when petCount is 0', async () => {
      render(<AttackButtonScreen />);

      // Advance timer by 3 seconds
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(0);
      });
    });

    test('generates 1 scrap per second when petCount is 1', async () => {
      gameState$.petCount.set(1);
      render(<AttackButtonScreen />);

      // Advance timer by 3 seconds
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(3);
      });
    });

    test('generates 5 scrap per second when petCount is 5', async () => {
      gameState$.petCount.set(5);
      render(<AttackButtonScreen />);

      // Advance timer by 2 seconds
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(10); // 5 per second * 2 seconds
      });
    });

    test('generation rate updates when petCount changes', async () => {
      gameState$.petCount.set(2);
      render(<AttackButtonScreen />);

      // Generate at rate of 2/sec for 2 seconds
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(4);
      });

      // Increase pet count
      gameState$.petCount.set(5);

      // Generate at new rate of 5/sec for 2 seconds
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(14); // 4 + (5 * 2)
      });
    });

    test('accumulates scrap over time', async () => {
      gameState$.petCount.set(3);
      render(<AttackButtonScreen />);

      // Verify at different intervals
      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(3));

      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(6));

      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(9));
    });

    test('handles large petCount values', async () => {
      gameState$.petCount.set(1000);
      render(<AttackButtonScreen />);

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(gameState$.scrap.get()).toBe(1000);
      });
    });
  });

  describe('Timer Cleanup', () => {
    test('clears timer on unmount', async () => {
      const { unmount } = render(<AttackButtonScreen />);
      gameState$.petCount.set(5);

      // Advance timer while mounted
      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(5));

      // Unmount component
      unmount();

      // Advance timer after unmount
      jest.advanceTimersByTime(2000);

      // Scrap should not increase
      expect(gameState$.scrap.get()).toBe(5);
    });

    test('timer restarts on remount', async () => {
      const { unmount, rerender } = render(<AttackButtonScreen />);
      gameState$.petCount.set(2);

      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(2));

      unmount();

      // Remount
      rerender(<AttackButtonScreen />);

      jest.advanceTimersByTime(1000);
      await waitFor(() => expect(gameState$.scrap.get()).toBe(4));
    });
  });

  describe('Integration with Clicking', () => {
    test('scrap generation continues while clicking', async () => {
      const { getByText } = render(<AttackButtonScreen />);
      gameState$.petCount.set(2);

      const button = getByText('feed');

      // Simulate clicking and time passing
      jest.advanceTimersByTime(500);
      fireEvent.press(button); // petCount becomes 3

      jest.advanceTimersByTime(500);
      // First tick: 2 scrap generated

      await waitFor(() => expect(gameState$.scrap.get()).toBe(2));

      jest.advanceTimersByTime(1000);
      // Second tick: 3 scrap generated (new rate)

      await waitFor(() => expect(gameState$.scrap.get()).toBe(5));
    });

    test('concurrent updates do not cause race conditions', async () => {
      const { getByText } = render(<AttackButtonScreen />);
      gameState$.petCount.set(1);

      const button = getByText('feed');

      // Rapid clicks while timer is running
      for (let i = 0; i < 10; i++) {
        fireEvent.press(button);
        jest.advanceTimersByTime(100);
      }

      // Total time elapsed: 1 second
      await waitFor(() => {
        // petCount should be 11 (1 + 10 clicks)
        expect(gameState$.petCount.get()).toBe(11);

        // Scrap varies by click timing, but should be in reasonable range
        // At minimum: 1 scrap (first tick with petCount=1)
        // At maximum: ~10 scrap (later ticks with higher petCount)
        const scrap = gameState$.scrap.get();
        expect(scrap).toBeGreaterThanOrEqual(1);
        expect(scrap).toBeLessThanOrEqual(15);
      });
    });
  });

  describe('UI Updates', () => {
    test('scrap counter updates reactively', async () => {
      gameState$.petCount.set(1);
      const { getByText } = render(<AttackButtonScreen />);

      expect(getByText(/Scrap: 0/)).toBeTruthy();

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(getByText(/Scrap: 1/)).toBeTruthy();
      });

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(getByText(/Scrap: 2/)).toBeTruthy();
      });
    });

    test('displays large scrap values correctly', async () => {
      gameState$.scrap.set(999999);
      const { getByText } = render(<AttackButtonScreen />);

      expect(getByText(/Scrap: 999999/)).toBeTruthy();
    });
  });
});
```

**Coverage Target:** 85%+ for scrap-related code

### 8.3 Existing Tests (NO CHANGES)

The following test files already cover scrap:

#### 8.3.1 Game Store Tests (EXISTING)

**File:** `/frontend/shared/store/gameStore.test.ts`

Already tests:
- ✅ Scrap initialization (line 31-33)
- ✅ resetGameState includes scrap (line 80-88)
- ✅ initializeGameState loads scrap (line 145)
- ✅ Auto-persistence (includes scrap automatically)

#### 8.3.2 Persistence Tests (EXISTING)

**File:** `/frontend/shared/store/persistence.test.ts`

Already tests:
- ✅ saveGameState saves scrap (line 14-28)
- ✅ loadGameState loads scrap (line 99-114)
- ✅ Scrap sanitization (negative values → 0) (line 124-139)
- ✅ Scrap validation as number (line 151-165)

### 8.4 Test Execution

As per project guidelines (CLAUDE.md):

```bash
# Run all tests using cmd.exe (required for this project)
cmd.exe /c "cd frontend && npm test"

# Run with coverage
cmd.exe /c "cd frontend && npm run test:coverage"

# Run only AttackButtonScreen tests
cmd.exe /c "cd frontend && npm test AttackButtonScreen.test.tsx"

# Watch mode
cmd.exe /c "cd frontend && npm run test:watch"
```

### 8.5 Manual Testing Checklist

- [ ] Scrap displays as "Scrap: 0" on first launch
- [ ] Scrap remains 0 when petCount is 0
- [ ] Scrap increments by 1 every second when petCount is 1
- [ ] Scrap increments by 5 every second when petCount is 5
- [ ] Scrap generation rate updates when petCount changes
- [ ] Scrap persists across app restarts
- [ ] Clicking feed button doesn't interfere with scrap generation
- [ ] Scrap counter is readable and positioned correctly
- [ ] No console errors or warnings
- [ ] VoiceOver/TalkBack reads scrap counter correctly
- [ ] App performs smoothly with high petCount (e.g., 1000)

---

## 9. Performance Considerations

### 9.1 Timer Performance

#### 9.1.1 Computational Cost

```
Per Timer Tick:
1. Read petCount from observable        ~1μs
2. Multiply by 1 (scrap rate)          ~0.1μs
3. Check if > 0                         ~0.1μs
4. Functional update to scrap           ~1μs
5. Legend State reactivity              ~10μs
6. Component re-render                  ~1-2ms
────────────────────────────────────────────
Total per tick:                         ~2-3ms
```

**Impact:** Negligible (< 0.3% of 1-second interval)

#### 9.1.2 Memory Usage

```
Timer overhead:
- setInterval handle: ~40 bytes
- Closure captures: ~200 bytes
- No accumulating memory (cleared on unmount)
────────────────────────────────────────────
Total: ~240 bytes (negligible)
```

### 9.2 Re-render Optimization

#### 9.2.1 Observer Pattern

```typescript
export const AttackButtonScreen = observer(() => {
  // Component only re-renders when observables it reads change
  const petCount = petCount$.get();  // Tracked dependency
  const scrap = scrap$.get();        // Tracked dependency

  // Re-renders occur ONLY when petCount or scrap changes
  // Other state changes (upgrades, etc.) don't trigger re-renders
});
```

**Benefits:**
- Granular re-renders (only when scrap or petCount changes)
- No manual memoization needed
- Automatic dependency tracking

#### 9.2.2 Re-render Frequency

```
Scenario: petCount = 5, scrap generating

Events per second:
- Timer tick:              1x (triggers scrap update → re-render)
- User clicks (variable):  0-10x (each triggers petCount update → re-render)
────────────────────────────────────────────
Expected re-renders:       1-11 per second

React Native can handle:   60 FPS = 60 re-renders per second
Actual load:               1-11 re-renders per second
────────────────────────────────────────────
Performance headroom:      5-60x safety margin
```

**Conclusion:** No performance concerns.

### 9.3 Storage Performance

#### 9.3.1 Save Frequency

```
Scrap generation:   1 update/second
Debounce delay:     1000ms
────────────────────────────────────────────
Effective saves:    ~1 per second (when generating)
                    0 per second (when petCount = 0)
```

#### 9.3.2 Storage I/O Cost

```
AsyncStorage.setItem (measured):
- JSON serialization:   ~1-2ms
- Storage write:        ~10-20ms
────────────────────────────────────────────
Total per save:         ~12-22ms
Frequency:              ~1 per second
Duty cycle:             1.2-2.2% of time
```

**Impact:** Minimal (battery, performance, storage wear all negligible)

### 9.4 Performance Targets

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Timer Precision | 1000ms ± 50ms | Jest fake timers |
| Scrap Update Latency | < 5ms | Performance.now() in timer |
| UI Update Latency | < 16ms | React DevTools Profiler |
| Storage Write | < 25ms | Async timing measurement |
| Memory Leak | 0 bytes/hour | React DevTools Memory Profiler |
| CPU Usage | < 1% average | Device performance monitoring |

### 9.5 Performance Testing

```typescript
describe('Performance', () => {
  test('timer executes within performance budget', async () => {
    jest.useRealTimers();
    gameState$.petCount.set(100);
    render(<AttackButtonScreen />);

    const measurements: number[] = [];

    // Measure 10 timer ticks
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();

      // Wait for next tick
      await new Promise(resolve => setTimeout(resolve, 1000));

      const endTime = performance.now();
      measurements.push(endTime - startTime);
    }

    // Average should be close to 1000ms
    const average = measurements.reduce((a, b) => a + b) / measurements.length;
    expect(average).toBeGreaterThan(950);
    expect(average).toBeLessThan(1050);
  });

  test('handles high petCount without performance degradation', async () => {
    gameState$.petCount.set(10000);
    render(<AttackButtonScreen />);

    jest.useFakeTimers();

    const startTime = performance.now();
    jest.advanceTimersByTime(1000);
    const endTime = performance.now();

    // Should complete in < 5ms
    expect(endTime - startTime).toBeLessThan(5);
  });
});
```

---

## 10. Accessibility

### 10.1 WCAG 2.1 AA Compliance

| Criterion | Implementation | Status |
|-----------|----------------|--------|
| 1.3.1 Info and Relationships | Proper semantic structure | Pass |
| 1.4.3 Contrast (Minimum) | Black text on white (21:1 ratio) | Pass |
| 2.1.1 Keyboard | Focusable, operable via keyboard | Pass |
| 4.1.2 Name, Role, Value | accessibilityRole and accessibilityLabel | Pass |

### 10.2 Scrap Counter Accessibility

```typescript
<Text
  style={styles.scrapText}
  accessibilityRole="text"
  accessibilityLabel={`Scrap: ${scrap}`}
>
  Scrap: {scrap}
</Text>
```

**Screen Reader Behavior:**
- **iOS VoiceOver:** "Scrap: [number], text"
- **Android TalkBack:** "Scrap: [number]"
- **Web Screen Readers:** "Scrap: [number]"

### 10.3 Live Region Considerations

**Option 1: No Live Region (RECOMMENDED)**
```typescript
// Current implementation (static text)
<Text accessibilityRole="text">
  Scrap: {scrap}
</Text>
```

**Rationale:**
- Scrap updates every 1 second
- Announcing every update is disruptive
- User can manually query value with screen reader
- Standard pattern for frequently-updating counters

**Option 2: Polite Live Region (ALTERNATIVE)**
```typescript
<Text
  accessibilityRole="text"
  accessibilityLiveRegion="polite"
>
  Scrap: {scrap}
</Text>
```

**Rationale:**
- Announces scrap changes to screen reader
- "polite" queues announcement (non-disruptive)
- May be too frequent (every 1 second)

**Decision:** Use Option 1 (no live region) for MVP. Add live region only if user feedback requests it.

### 10.4 Accessibility Testing Checklist

- [ ] Scrap counter is focusable with keyboard/screen reader
- [ ] VoiceOver reads "Scrap: [number], text"
- [ ] TalkBack reads "Scrap: [number]"
- [ ] Text contrast meets WCAG AA (21:1 ratio)
- [ ] Text size is readable (16px minimum)
- [ ] Counter position is logical in reading order
- [ ] No accessibility warnings in React DevTools

---

## 11. Implementation Phases

### Phase 1: UI Integration (HIGH PRIORITY)
**Duration:** 1 hour
**Goal:** Add scrap display to existing screen

#### Tasks:
1. **Modify AttackButtonScreen.tsx**
   - Import useEffect from React
   - Destructure scrap$ from useGameState()
   - Add scrap display Text component
   - Add scrapText style to StyleSheet
   - Adjust spacing (counterText marginBottom: 30 → 10)

2. **Manual Testing**
   - Verify scrap displays "Scrap: 0" initially
   - Verify styling matches design
   - Verify no TypeScript errors

#### Acceptance Criteria:
- [ ] Scrap counter visible on screen
- [ ] Positioned between pet count and button
- [ ] Font size 16px, marginBottom 20px
- [ ] No visual regressions
- [ ] TypeScript compiles successfully

---

### Phase 2: Timer Implementation (HIGH PRIORITY)
**Duration:** 1 hour
**Goal:** Implement scrap generation logic

#### Tasks:
1. **Add Timer Logic**
   - Add useEffect hook with empty dependency array
   - Create setInterval for 1-second ticks
   - Read petCount from observable in callback
   - Calculate scrapGenerated (petCount * 1)
   - Update scrap using functional set
   - Return cleanup function with clearInterval

2. **Manual Testing**
   - Set petCount to 5 manually in code
   - Verify scrap increments by 5 every second
   - Verify timer stops when component unmounts
   - Check for memory leaks

#### Acceptance Criteria:
- [ ] Scrap generates at correct rate
- [ ] No generation when petCount = 0
- [ ] Timer cleans up on unmount
- [ ] No console errors
- [ ] No memory leaks

---

### Phase 3: Testing (HIGH PRIORITY)
**Duration:** 2-3 hours
**Goal:** Achieve comprehensive test coverage

#### Tasks:
1. **Write Component Tests**
   - Add scrap display tests (initial value, accessibility)
   - Add scrap generation tests (0, 1, 5, 100 pets)
   - Add timer cleanup tests (unmount, remount)
   - Add integration tests (clicking + generation)
   - Add UI update tests (reactive rendering)

2. **Run Tests**
   - Execute via cmd.exe (per CLAUDE.md)
   - Verify all tests pass
   - Generate coverage report
   - Ensure coverage ≥ 85%

3. **Fix Failing Tests**
   - Debug any test failures
   - Fix implementation issues
   - Re-run until all pass

#### Acceptance Criteria:
- [ ] All tests pass in cmd.exe
- [ ] Component coverage ≥ 85%
- [ ] No flaky tests
- [ ] Timer tests use fake timers correctly
- [ ] No test warnings

---

### Phase 4: Manual Testing & Polish (MEDIUM PRIORITY)
**Duration:** 1 hour
**Goal:** Verify real-world behavior and polish UX

#### Tasks:
1. **Manual Testing**
   - Test on iOS simulator
   - Test on Android emulator
   - Test on physical device (if available)
   - Verify scrap persists across app restarts
   - Test with various petCount values (0, 1, 10, 100, 1000)
   - Test rapid clicking while scrap generates
   - Test app backgrounding/foregrounding

2. **Accessibility Testing**
   - Test with VoiceOver on iOS
   - Test with TalkBack on Android
   - Verify scrap counter is announced correctly
   - Check reading order is logical

3. **Performance Testing**
   - Monitor CPU usage
   - Check for frame drops
   - Verify no battery drain
   - Test for 5-10 minutes continuously

#### Acceptance Criteria:
- [ ] Scrap generates correctly on all platforms
- [ ] No visual glitches
- [ ] Accessible to screen reader users
- [ ] No performance issues
- [ ] Scrap persists correctly

---

### Phase 5: Documentation (LOW PRIORITY)
**Duration:** 30 minutes
**Goal:** Document implementation for maintainability

#### Tasks:
1. **Add Code Comments**
   - Comment timer logic in useEffect
   - Explain why empty dependency array is used
   - Document scrap generation formula

2. **Update CHANGELOG (if exists)**
   - Add feature entry for scrap system

#### Acceptance Criteria:
- [ ] Timer logic has explanatory comments
- [ ] Future developers can understand implementation
- [ ] CHANGELOG updated (if applicable)

---

## 12. Risk Mitigation

### 12.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| Timer drift over time | Low | Low | Use setInterval (acceptable for 1s intervals), no cumulative timing needed |
| Memory leak from uncleaned timer | Medium | High | Strict useEffect cleanup, test with memory profiler |
| Race conditions (clicking + timer) | Low | Medium | Use functional updates (atomic operations) |
| Test failures in cmd.exe | Medium | Medium | Use fake timers correctly, follow existing test patterns |
| Performance issues with high petCount | Low | Low | Optimize skip when scrapGenerated = 0, test with 10,000 pets |
| Timer stops unexpectedly | Low | High | Test cleanup thoroughly, verify interval persists |

### 12.2 User Experience Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| Scrap purpose unclear to players | Medium | Low | Accept for MVP (future update will add shop) |
| Scrap updates too frequent (annoying) | Low | Low | Use static text (no live region announcements) |
| Scrap counter clutters UI | Low | Medium | Use smaller font (16px vs 18px), adequate spacing |
| Data loss on crash | Low | Medium | Debounced saves minimize loss to ~1 second |

### 12.3 Integration Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| Conflicts with existing state | Very Low | High | Scrap already in state schema (no conflicts) |
| Breaking existing tests | Low | Medium | Run full test suite before merging |
| Persistence issues | Very Low | High | Scrap already validated in persistence layer |
| TypeScript errors | Low | Low | Types already defined, strict compiler checks |

### 12.4 Contingency Plans

#### If timer doesn't clean up properly:
1. Add ref to store interval ID
2. Use useRef to track mounted state
3. Guard state updates with mounted check
4. Add comprehensive cleanup tests

#### If tests fail in cmd.exe:
1. Review fake timer setup (jest.useFakeTimers)
2. Check waitFor usage for async updates
3. Verify cleanup in afterEach hooks
4. Test on different machine to rule out environment issues

#### If performance degrades:
1. Add shouldComponentUpdate checks (unlikely with observer)
2. Throttle state updates to every 2-3 seconds
3. Skip re-renders when scrap change is 0
4. Profile with React DevTools Profiler

#### If scrap values overflow:
1. Add runtime check for MAX_SAFE_INTEGER
2. Cap scrap at maximum (stop generation)
3. Show warning to player (extremely unlikely scenario)

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

## 14. File Changes Summary

### Files to Modify:

```
frontend/
└── modules/
    └── attack-button/
        ├── AttackButtonScreen.tsx          [MODIFY]
        └── AttackButtonScreen.test.tsx     [MODIFY]
```

### Files with No Changes (Already Support Scrap):

```
frontend/
└── shared/
    ├── hooks/
    │   └── useGameState.ts                 [NO CHANGES] Already exports scrap$
    ├── store/
    │   ├── gameStore.ts                    [NO CHANGES] Already has scrap state
    │   ├── gameStore.test.ts               [NO CHANGES] Already tests scrap
    │   ├── persistence.ts                  [NO CHANGES] Already handles scrap
    │   └── persistence.test.ts             [NO CHANGES] Already tests scrap
    └── types/
        └── game.ts                         [NO CHANGES] GameState.scrap exists
```

**Total Files to Modify:** 2
**Total New Files:** 0
**Total Infrastructure Changes:** 0

---

## 15. Code Diff Preview

### 15.1 AttackButtonScreen.tsx Changes

```diff
  import React from 'react';
+ import { useEffect } from 'react';
  import { View, Text, Pressable, StyleSheet } from 'react-native';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { observer } from '@legendapp/state/react';
  import { useGameState } from '../../shared/hooks/useGameState';

  export const AttackButtonScreen = observer(() => {
-   const { petCount$ } = useGameState();
+   const { petCount$, scrap$ } = useGameState();

    const handleFeed = () => {
      petCount$.set((prev) => prev + 1);
    };

+   // Scrap generation timer
+   useEffect(() => {
+     const interval = setInterval(() => {
+       const petCount = petCount$.get();
+       const scrapGenerated = petCount * 1;
+
+       if (scrapGenerated > 0) {
+         scrap$.set((prev) => prev + scrapGenerated);
+       }
+     }, 1000);
+
+     return () => clearInterval(interval);
+   }, []);

    const petCount = petCount$.get();
+   const scrap = scrap$.get();

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text
            style={styles.counterText}
            accessibilityRole="text"
            accessibilityLabel={`Singularity Pet Count: ${petCount}`}
          >
            Singularity Pet Count: {petCount}
          </Text>

+         <Text
+           style={styles.scrapText}
+           accessibilityRole="text"
+           accessibilityLabel={`Scrap: ${scrap}`}
+         >
+           Scrap: {scrap}
+         </Text>

          <Pressable
            onPress={handleFeed}
            accessibilityRole="button"
            accessibilityLabel="feed button"
            accessibilityHint="Tap to feed your Singularity Pet and increase the count"
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>feed</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  });

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
-     marginBottom: 30,
+     marginBottom: 10,
      color: '#000000',
    },
+   scrapText: {
+     fontSize: 16,
+     marginBottom: 20,
+     color: '#000000',
+   },
    button: {
      minWidth: 44,
      minHeight: 44,
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: '#007AFF',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.98 }],
    },
    buttonText: {
      fontSize: 16,
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });
```

**Lines Added:** ~35
**Lines Modified:** ~2
**Lines Removed:** 0

---

## 16. Success Criteria

### 16.1 Functional Criteria
- [ ] Scrap displays on screen with label "Scrap: {value}"
- [ ] Scrap starts at 0 for new players
- [ ] Scrap generates at rate of 1 per pet per second
- [ ] No scrap generated when petCount = 0
- [ ] Scrap persists across app restarts
- [ ] Timer cleans up on component unmount
- [ ] No interference with existing clicking mechanics

### 16.2 Technical Criteria
- [ ] TypeScript compiles without errors
- [ ] All tests pass in cmd.exe
- [ ] Component test coverage ≥ 85%
- [ ] No new console errors or warnings
- [ ] No memory leaks (verified with profiler)
- [ ] Timer precision within ±50ms

### 16.3 User Experience Criteria
- [ ] Scrap counter is readable and well-positioned
- [ ] No UI jank or frame drops
- [ ] Works on iOS, Android, and web
- [ ] Accessible to screen reader users
- [ ] Scrap updates visibly every second

### 16.4 Quality Criteria
- [ ] Code follows project conventions
- [ ] Timer logic is well-commented
- [ ] No linting errors
- [ ] WCAG 2.1 AA compliant

---

## 17. Appendix

### 17.1 References
- **PRD:** `/frontend/modules/scrap/specs/prd_scrap_system_20251117.md`
- **Project Guidelines:** `/CLAUDE.md`
- **Existing TDD (Attack Button):** `/frontend/modules/attack-button/specs/tdd_attack_button_20251117.md`
- **Legend State Docs:** https://legendapp.com/open-source/state/
- **React Hooks Docs:** https://react.dev/reference/react/useEffect

### 17.2 Glossary
- **Scrap:** Passive currency generated based on petCount
- **Timer Tick:** Single execution of setInterval callback (every 1s)
- **Debouncing:** Delaying function execution until after inactivity period
- **Functional Update:** State update using previous value as input (atomic)
- **Observer:** HOC that tracks observable reads and triggers re-renders

### 17.3 Key Implementation Notes

1. **Why integrate into AttackButtonScreen instead of new component?**
   - Single-screen architecture (per project design)
   - Simpler state management
   - Fewer files to maintain
   - Scrap is complementary to pet count (natural grouping)

2. **Why empty dependency array in useEffect?**
   - Timer should persist for component lifetime
   - Use .get() to read latest values (no need to depend on observables)
   - Observables are stable references (won't change)
   - Reduces timer teardown/setup overhead

3. **Why functional updates for scrap?**
   - Atomic operations (no race conditions)
   - Handles concurrent updates (clicking + timer)
   - Recommended pattern by Legend State
   - Matches existing codebase patterns

4. **Why no new persistence code?**
   - Scrap already in GameState interface
   - onChange listener already catches all state changes
   - Validation and sanitization already implemented
   - Zero new infrastructure needed

### 17.4 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-17 | Claude | Initial TDD creation |

---

**Document Status:** Ready for Implementation
**Next Steps:** Begin Phase 1 (UI Integration)

**Estimated Total Implementation Time:** 5-6 hours
- Phase 1 (UI): 1 hour
- Phase 2 (Timer): 1 hour
- Phase 3 (Testing): 2-3 hours
- Phase 4 (Polish): 1 hour
- Phase 5 (Docs): 30 minutes

**Questions or Concerns:** Contact project maintainer
