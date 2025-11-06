# Salvage & Tinkering System Technical Design Document

## Document Control
| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Generated | 2025-11-02 | Draft | Initial TDD from feature description |

## Executive Summary
A progressive automation system for mobile idle game salvaging and equipment upgrading, built on React Native/Expo. The system transitions players from manual clicking (satisfying immediate feedback) to strategic automation management (optimization gameplay), following proven idle game patterns while maintaining player agency throughout.

## 1. Overview & Context

### Problem Statement
Mobile idle games struggle with balancing immediate tactile satisfaction against long-term automation gameplay. Players either:
- Get bored with repetitive clicking (no automation)
- Feel disconnected when automation removes all interaction
- Miss the progression from "doing" to "managing"

This system solves the problem by creating a natural progression from manual crafting to automation empire building, where each automation unlock feels earned and players remain engaged across all phases.

### Solution Approach
A three-phase progressive system:
1. **Phase 1 (Levels 1-10)**: Manual clicking with immediate visual/audio feedback - teaches mechanics
2. **Phase 2 (Levels 11-25)**: Hybrid manual/auto gameplay - introduces strategy
3. **Phase 3 (Level 26+)**: Full automation with optimization focus - provides endgame depth

Technical implementation uses React Native with Legend State for reactive state management, Reanimated 3 for 60fps animations, and a modular upgrade system that scales from single-item processing to 100 items/second.

### Success Criteria
| Metric | Target | Measurement |
|--------|--------|-------------|
| Animation Performance | 60fps on mid-tier devices | React Native Performance Monitor |
| State Update Latency | <16ms for salvage action | Performance.now() instrumentation |
| Offline Calculation Time | <2s for 24hr progression | Jest performance tests |
| Battery Impact | <5% drain per hour active play | Device profiling |
| Retention at Day 7 | >40% of players reaching Level 15 | Analytics events |

## 2. Requirements Analysis

### Functional Requirements

#### FR1: Manual Salvaging System (Phase 1)
- User taps inventory item → triggers 0.5s animation
- Materials "burst out" with particle effects
- Materials auto-collect after 2s or on tap
- Counter updates with animated number popup
- Support for 10+ simultaneous salvage animations
- Different particle colors per material type

#### FR2: Manual Tinkering System (Phase 1)
- Drag materials to equipment slot
- Hold-to-channel interaction (2s minimum)
- Visual progress bar during channeling
- 100% success rate in Phase 1
- Power level updates with screen shake/flash
- Support for 10+ equipment slots simultaneously

#### FR3: Progressive Automation Unlocks (Phase 2)
- Level-gated unlock system (Levels 5, 8, 10, 11, 13, 15, 18, 20, 22, 26, 30, 35, 40)
- Automation runs in background (Web Worker for computation)
- Configurable automation speed (0.33 items/sec → 100 items/sec)
- Priority queue system for automation targeting
- Manual override capabilities with bonus modifiers

#### FR4: Hybrid Gameplay Mechanics (Phase 2)
- Manual clicks 2x faster than automation
- Combo system: 10 sequential clicks → speed burst
- Critical hits: 5% chance 5x materials
- Manual tinkering 50% cheaper than auto
- Real-time switching between manual/auto modes

#### FR5: Advanced Automation (Phase 3)
- Offline progression calculation (up to 48 hours)
- Prestige system every 1000 salvages
- Auto-refining materials (combine 3→1 upgrade)
- Smart AI suggestions using past player behavior
- Queue management (up to 10,000 items)

#### FR6: UI Evolution System
- Dynamic UI layout based on player level
- Phase 1: Grid-based tap interface
- Phase 2: Management dashboard with controls
- Phase 3: Command center with statistics
- Smooth transitions between UI modes

### Non-Functional Requirements

#### Performance
- **Animation Frame Rate**: Maintain 60fps during up to 20 simultaneous particle effects
- **State Update Throughput**: Process 100 item salvages/second at max automation
- **Memory Footprint**: <150MB RAM for entire salvage system
- **Startup Time**: Salvage system ready <1s after app launch
- **Offline Calculation**: Calculate 24hr offline progress in <2s

#### Security
- **Client-Side State Validation**: Checksum verification for progression data
- **Anti-Cheat**: Rate limiting on salvage actions (max 1000/minute manual)
- **Data Persistence**: Encrypted AsyncStorage for local save
- **Cloud Sync**: Optional encrypted cloud backup with conflict resolution

#### Scalability
- **Player Growth**: System scales from Level 1 to 100+
- **Item Volume**: Handle 10,000+ items in salvage queue
- **Material Types**: Extensible to 50+ material types
- **Equipment Slots**: Support 20+ equipment pieces

#### Accessibility
- **Color Blindness**: Material particles use both color + shape
- **Reduced Motion**: Option to disable particle effects
- **Large Touch Targets**: Minimum 44x44pt tap areas
- **Screen Reader**: Announce salvage results and material counts

#### Device Support
- **iOS**: 13.0+ (React Native 0.73+ requirement)
- **Android**: API 21+ (Android 5.0+)
- **Performance Tiers**: Graceful degradation for low-end devices
  - High: Full particle effects, 60fps
  - Medium: Reduced particles, 30fps
  - Low: Minimal effects, functional only

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐    │
│  │ Salvage UI   │  │ Tinkering UI  │  │ Automation   │    │
│  │ Components   │  │ Components    │  │ Control UI   │    │
│  └──────┬───────┘  └───────┬───────┘  └──────┬───────┘    │
│         │                   │                  │             │
│  ┌──────▼───────────────────▼──────────────────▼───────┐   │
│  │         Legend State (Global State Store)           │   │
│  │  - salvageQueue$, materials$, equipment$            │   │
│  │  - automationSettings$, playerLevel$                │   │
│  └──────┬────────────────────────────────────┬─────────┘   │
│         │                                     │              │
│  ┌──────▼──────────┐                 ┌───────▼──────────┐  │
│  │ Game Logic      │                 │ Animation        │  │
│  │ Services        │                 │ Engine           │  │
│  │                 │                 │ (Reanimated 3)   │  │
│  │ - SalvageEngine │                 │                  │  │
│  │ - TinkerEngine  │                 │ - Particle Sys   │  │
│  │ - AutomationMgr │                 │ - Number Popups  │  │
│  │ - ProgressionMgr│                 │ - Transitions    │  │
│  └──────┬──────────┘                 └──────────────────┘  │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────┐   │
│  │         Persistence Layer (AsyncStorage)             │   │
│  │  - PlayerProgress, Materials, Equipment              │   │
│  │  - AutomationSettings, LastSaveTimestamp             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘

External:
┌──────────────────┐
│ Cloud Sync API   │  (Optional, future enhancement)
│ (Firebase/AWS)   │
└──────────────────┘
```

### Component Design

#### SalvageEngine
- **Purpose**: Core business logic for item salvaging
- **Responsibilities**:
  - Process individual item salvage
  - Calculate material yields (base + bonuses)
  - Trigger animations via events
  - Apply manual vs auto modifiers
  - Track combos and critical hits
- **Interfaces**:
  ```typescript
  interface SalvageEngine {
    salvageItem(itemId: string, manual: boolean): SalvageResult;
    calculateYield(item: Item, bonuses: Bonus[]): Material[];
    processBatch(itemIds: string[]): SalvageResult[];
  }
  ```
- **Dependencies**:
  - Legend State (materials$, inventory$)
  - Random number generator (seeded for consistency)
  - Animation event emitter

#### TinkerEngine
- **Purpose**: Equipment upgrade logic
- **Responsibilities**:
  - Validate material requirements
  - Apply upgrades to equipment
  - Calculate success rates (100% Phase 1, variable Phase 3)
  - Manage upgrade costs and scaling
  - Emit upgrade events for UI feedback
- **Interfaces**:
  ```typescript
  interface TinkerEngine {
    canUpgrade(equipmentId: string): boolean;
    performUpgrade(equipmentId: string, materials: Material[]): UpgradeResult;
    calculateCost(currentLevel: number): MaterialCost;
    getUpgradePower(currentLevel: number): number;
  }
  ```
- **Dependencies**:
  - Legend State (equipment$, materials$)
  - Game balance configuration

#### AutomationManager
- **Purpose**: Manage all automation processes
- **Responsibilities**:
  - Run automation loops (requestAnimationFrame based)
  - Manage priority queues for items
  - Calculate automation speeds based on unlocks
  - Handle offline progression calculations
  - Enforce rate limits and caps
- **Interfaces**:
  ```typescript
  interface AutomationManager {
    startAutomation(type: 'salvage' | 'tinker'): void;
    stopAutomation(type: 'salvage' | 'tinker'): void;
    setSpeed(itemsPerSecond: number): void;
    setPriority(itemIds: string[]): void;
    calculateOfflineProgress(deltaMs: number): ProgressResult;
  }
  ```
- **Dependencies**:
  - SalvageEngine, TinkerEngine
  - Legend State (automationSettings$)
  - Web Worker (future optimization)

#### ProgressionManager
- **Purpose**: Level and unlock system
- **Responsibilities**:
  - Track player XP and level
  - Unlock features at level thresholds
  - Manage prestige system
  - Award level-up bonuses
  - Validate unlock prerequisites
- **Interfaces**:
  ```typescript
  interface ProgressionManager {
    addXP(amount: number): LevelResult;
    checkUnlocks(newLevel: number): Unlock[];
    canPrestige(): boolean;
    performPrestige(choice: PrestigeOption): PrestigeResult;
  }
  ```
- **Dependencies**:
  - Legend State (playerLevel$, unlocks$)
  - Game balance configuration

#### ParticleSystem (Reanimated)
- **Purpose**: High-performance particle effects
- **Responsibilities**:
  - Render material burst particles (60fps)
  - Animate material collection paths
  - Display number popups with physics
  - Screen shake/flash effects
  - Optimize particle count based on device tier
- **Interfaces**:
  ```typescript
  interface ParticleSystem {
    emitBurst(position: {x, y}, materials: Material[]): void;
    animateCollection(from: {x, y}, to: {x, y}): void;
    showNumberPopup(value: number, position: {x, y}): void;
    applyScreenEffect(type: 'shake' | 'flash'): void;
  }
  ```
- **Dependencies**:
  - React Native Reanimated 3
  - Device performance tier detector

### Data Flow

#### Salvage Flow (Manual)
```
User Tap → SalvageUI Component
    ↓
Dispatch salvageItem(id, manual=true)
    ↓
SalvageEngine.salvageItem()
    ↓ (emit events)
    ├→ ParticleSystem.emitBurst()  (visual feedback)
    ├→ materials$.set()             (update state)
    └→ ProgressionManager.addXP()   (gain XP)
    ↓
UI auto-updates via Legend State reactivity
```

#### Automation Flow (Background)
```
AutomationManager.tick() (every frame)
    ↓
Check: time since last process >= interval?
    ↓ YES
Get next item from priority queue
    ↓
SalvageEngine.salvageItem(id, manual=false)
    ↓
materials$.set() (batched updates)
    ↓
UI updates every 100ms (throttled)
```

#### Offline Progression Flow
```
App Launch
    ↓
Calculate deltaMs = now - lastSaveTimestamp
    ↓
AutomationManager.calculateOfflineProgress(deltaMs)
    ↓
Simulate automation ticks in fast-forward
    ↓ (cap at 48 hours)
Apply results to materials$ and equipment$
    ↓
Show "Welcome Back" screen with earnings
```

## 4. API Design

### Internal APIs

All state access via Legend State observables, no traditional REST APIs. Event-driven architecture.

#### State Observables

| Observable | Type | Purpose | Subscribers |
|------------|------|---------|-------------|
| `materials$` | `Observable<Record<MaterialType, number>>` | Track all material quantities | UI, Engines, Persistence |
| `inventory$` | `Observable<Item[]>` | Player's salvageable items | SalvageUI, SalvageEngine |
| `equipment$` | `Observable<Equipment[]>` | Equipment pieces + levels | TinkerUI, TinkerEngine |
| `automationSettings$` | `Observable<AutomationConfig>` | Auto speeds, priorities, toggles | AutomationManager, UI |
| `playerLevel$` | `Observable<number>` | Current player level | ProgressionManager, All UIs |
| `unlocks$` | `Observable<Set<UnlockType>>` | Unlocked features | UI guards, Engines |

#### Event System

| Event | Payload | Purpose | Listeners |
|-------|---------|---------|-----------|
| `salvage:complete` | `{itemId, materials[], critical}` | Item salvaged | ParticleSystem, AudioManager |
| `tinker:success` | `{equipmentId, newLevel, power}` | Upgrade succeeded | TinkerUI, AudioManager |
| `level:up` | `{newLevel, unlocks[]}` | Player leveled up | AllUIs, ProgressionManager |
| `automation:toggle` | `{type, enabled}` | Automation state change | AutomationUI, AutomationManager |
| `prestige:available` | `{options[]}` | Prestige ready | PrestigeUI |

### External Integrations

#### Analytics (Future)
- Firebase Analytics for event tracking
- Events: `salvage_item`, `tinker_success`, `level_up`, `automation_unlock`, `prestige_complete`
- Custom parameters: `item_type`, `material_type`, `level`, `manual_vs_auto`

#### Cloud Save (Future, Optional)
- Platform: Firebase Firestore or AWS AppSync
- Sync strategy: Last-write-wins with timestamp
- Conflict resolution: Server wins for cross-device conflicts
- Data structure: Player state snapshot every 5 minutes when dirty

## 5. Data Model

### Entity Design

#### Item
```typescript
interface Item {
  id: string;              // UUID
  type: ItemType;          // Determines materials
  rarity: Rarity;          // Common | Rare | Epic | Legendary
  salvageValue: number;    // Base material multiplier
  iconId: string;          // Asset reference
}

enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable'
}

enum Rarity {
  COMMON = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4
}
```

#### Material
```typescript
interface Material {
  type: MaterialType;
  quantity: number;
}

enum MaterialType {
  IRON = 'iron',
  WOOD = 'wood',
  LEATHER = 'leather',
  GEMS = 'gems',
  RARE_IRON = 'rare_iron',
  RARE_WOOD = 'rare_wood',
  EPIC_CRYSTAL = 'epic_crystal',
  // ... extensible to 50+ types
}

// Color mapping for accessibility
const MATERIAL_COLORS: Record<MaterialType, {color: string, shape: ParticleShape}> = {
  IRON: { color: '#888888', shape: 'square' },
  WOOD: { color: '#8B4513', shape: 'circle' },
  GEMS: { color: '#4169E1', shape: 'diamond' },
  // ...
};
```

#### Equipment
```typescript
interface Equipment {
  id: string;
  slot: EquipmentSlot;      // Helmet, Chest, Weapon, etc.
  level: number;            // Current upgrade level
  power: number;            // Calculated from level
  nextUpgradeCost: Material[]; // Dynamically calculated
  iconId: string;
}

enum EquipmentSlot {
  HELMET = 'helmet',
  CHEST = 'chest',
  LEGS = 'legs',
  BOOTS = 'boots',
  WEAPON = 'weapon',
  SHIELD = 'shield',
  RING1 = 'ring1',
  RING2 = 'ring2',
  NECKLACE = 'necklace',
  // ... extensible to 20+
}
```

#### AutomationConfig
```typescript
interface AutomationConfig {
  salvageEnabled: boolean;
  salvageSpeed: number;        // Items per second
  salvagePriority: string[];   // Item IDs in priority order
  salvageFilters: ItemFilter[]; // Auto-salvage rules

  tinkerEnabled: boolean;
  tinkerTarget: string | null; // Equipment ID or null for smart AI
  tinkerPriorities: Record<string, number>; // equipmentId -> priority

  offlineProgressionEnabled: boolean;
  lastTickTimestamp: number;   // For offline calculations
}

interface ItemFilter {
  rarityMax: Rarity;           // e.g., "Auto-salvage Common items"
  typeInclude?: ItemType[];
  typeExclude?: ItemType[];
}
```

#### PlayerProgress
```typescript
interface PlayerProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;

  totalSalvaged: number;       // Lifetime counter
  totalTinkered: number;
  prestigeCount: number;

  unlocks: Set<UnlockType>;
  activeBonuses: ActiveBonus[];
}

enum UnlockType {
  AUTO_COLLECT = 'auto_collect',          // Level 5
  BATCH_SELECT = 'batch_select',          // Level 8
  SALVAGE_ASSISTANT = 'salvage_assistant', // Level 10
  AUTO_TINKER = 'auto_tinker',            // Level 12
  MATERIAL_REFINEMENT = 'material_refinement', // Level 15
  // ... all phase unlocks
}

interface ActiveBonus {
  type: BonusType;
  multiplier: number;
  expiresAt: number;           // Timestamp
}
```

### Database Schema

**Storage**: React Native AsyncStorage (key-value store)

#### Keys & Structure
```typescript
// Main save data (single key, full state snapshot)
'@salvage_save_v1': {
  playerProgress: PlayerProgress,
  materials: Record<MaterialType, number>,
  equipment: Equipment[],
  inventory: Item[],
  automationConfig: AutomationConfig,
  lastSaveTimestamp: number,
  checksum: string  // MD5 hash for anti-cheat
}

// Separate keys for large data
'@salvage_history_v1': {
  recentSalvages: SalvageEvent[],  // Last 100 for statistics
  prestigeHistory: PrestigeChoice[]
}

// Settings
'@salvage_settings_v1': {
  soundEnabled: boolean,
  musicEnabled: boolean,
  particleQuality: 'high' | 'medium' | 'low',
  reducedMotion: boolean
}
```

#### Indexes for Performance
- AsyncStorage is flat key-value, no traditional indexes
- In-memory indexes built on app launch:
  - `equipmentBySlot`: Map<EquipmentSlot, Equipment>
  - `itemsByType`: Map<ItemType, Item[]>
  - `materialsByRarity`: Map<Rarity, Material[]>

### Data Access Patterns

#### Common Queries
1. **Get all materials** → `materials$.get()` → O(1) state access
2. **Get equipment by slot** → `equipment$.get().find(e => e.slot === slot)` → O(n), cached
3. **Get next salvage item** → `inventory$.get()[0]` with priority sort → O(1) amortized
4. **Calculate upgrade cost** → `TinkerEngine.calculateCost(level)` → O(1) formula

#### Caching Strategy
- **Legend State Observables**: Act as in-memory cache, auto-update UI
- **Computed Values**: Use Legend State `computed()` for derived state
  ```typescript
  const totalPower$ = computed(() =>
    equipment$.get().reduce((sum, e) => sum + e.power, 0)
  );
  ```
- **Persistence**: Debounced save every 5 seconds when dirty, plus on app background

#### Data Consistency
- **Single Source of Truth**: Legend State observables
- **Transactional Updates**: Batch state changes in single tick
  ```typescript
  batch(() => {
    materials$.iron.set(materials$.iron.get() + 10);
    inventory$.set(inventory => inventory.filter(i => i.id !== salvaged.id));
  });
  ```
- **Validation**: Checksum on save/load to detect tampering
- **Rollback**: Keep previous state snapshot for 1 generation

## 6. Security Design

### Authentication & Authorization
- **No server authentication** in Phase 1 (local-only game)
- **Future cloud sync**: Firebase Auth with email/password or social login
- **Session management**: Not applicable for local-only mode
- **Future multiplayer**: JWT tokens with 1-hour expiry

### Data Security

#### Encryption at Rest
- **Method**: AES-256 encryption via `react-native-encrypted-storage`
- **Key derivation**: Device-specific hardware key (iOS Keychain, Android KeyStore)
- **Data encrypted**: Full save state, NOT settings (low sensitivity)

#### Encryption in Transit
- **Phase 1**: N/A (no network)
- **Future cloud sync**: HTTPS only, TLS 1.3+, certificate pinning

#### PII Handling
- **No PII collected** in Phase 1
- **Future analytics**: Device ID only (Firebase Anonymous Auth)
- **GDPR compliance**: Data export/deletion via settings menu

#### Audit Logging
- **Local logs**: Last 1000 game events in debug mode only
- **Production**: No logging to avoid performance impact
- **Future server**: Audit log for prestige actions, purchases

### Security Controls

#### Input Validation
```typescript
// Validate salvage action
function validateSalvageAction(itemId: string, manual: boolean): ValidationResult {
  // Item exists in inventory
  if (!inventory$.get().find(i => i.id === itemId)) {
    return { valid: false, reason: 'ITEM_NOT_FOUND' };
  }

  // Rate limiting (anti-macro)
  const now = Date.now();
  const recentActions = actionTimestamps.filter(t => now - t < 1000);
  if (manual && recentActions.length > 20) {  // Max 20 clicks/sec
    return { valid: false, reason: 'RATE_LIMIT_EXCEEDED' };
  }

  // State checksum match
  if (!validateChecksum(gameState)) {
    return { valid: false, reason: 'CHECKSUM_MISMATCH' };
  }

  return { valid: true };
}
```

#### Rate Limiting
- **Manual salvage**: Max 20 actions/second (humanly possible)
- **Automation**: Enforced by unlock level (0.33 → 100 items/sec)
- **Save writes**: Max 1/second to prevent AsyncStorage thrashing
- **Offline progression**: Capped at 48 hours to prevent exploits

#### Anti-Cheat Measures
1. **Checksum validation**: MD5 hash of save state
2. **Timestamp validation**: Detect time manipulation for offline gains
3. **Progression gates**: Cannot skip unlocks or levels
4. **Sanity checks**: Material quantities, levels within expected ranges
5. **Code obfuscation**: React Native Hermes with bytecode (future)

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)
All implementation follows **Red-Green-Refactor**. No code without tests first.

### Testing Framework & Tools
- **Framework**: React Native Testing Library
- **Reference**: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Test Runner**: Jest 29 with React Native preset
- **Mocking**:
  - MSW (Mock Service Worker) for future API calls
  - Jest mocks for AsyncStorage, Reanimated
  - `@testing-library/react-native` for component mocks
- **Performance**: Jest benchmarks with `performance.now()`

### TDD Implementation Process

#### Example: Salvage Button Feature (Phase 1)

##### 1. RED Phase - Write Failing Test First
```typescript
// SalvageButton.test.tsx
import { render, screen, userEvent } from '@testing-library/react-native';
import { SalvageButton } from './SalvageButton';
import { materials$ } from '../state/materials';

describe('SalvageButton', () => {
  beforeEach(() => {
    materials$.set({ iron: 0, wood: 0, leather: 0 });
  });

  test('should salvage item and add materials when tapped', async () => {
    const mockItem = {
      id: 'item1',
      type: 'weapon',
      salvageValue: 10
    };

    render(<SalvageButton item={mockItem} />);

    // Initially no materials
    expect(materials$.iron.get()).toBe(0);

    // Tap the button
    const button = screen.getByRole('button', { name: /salvage/i });
    await userEvent.press(button);

    // Should have gained materials
    expect(materials$.iron.get()).toBeGreaterThan(0);

    // Button should show disabled state during animation
    expect(button).toBeDisabled();
  });
});
```
**This test MUST fail initially** - SalvageButton doesn't exist yet.

##### 2. GREEN Phase - Minimal Implementation
```typescript
// SalvageButton.tsx
import React from 'react';
import { Pressable, Text } from 'react-native';
import { SalvageEngine } from '../services/SalvageEngine';

export const SalvageButton: React.FC<{item: Item}> = ({ item }) => {
  const [disabled, setDisabled] = React.useState(false);

  const handleSalvage = () => {
    setDisabled(true);
    const result = SalvageEngine.salvageItem(item.id, true);

    // Apply materials
    materials$.iron.set(materials$.iron.get() + result.materials.iron);

    setTimeout(() => setDisabled(false), 500);  // Simple timer
  };

  return (
    <Pressable onPress={handleSalvage} disabled={disabled} accessibilityRole="button">
      <Text>Salvage</Text>
    </Pressable>
  );
};
```
**Tests now pass** - minimal code only.

##### 3. REFACTOR Phase - Improve Code
```typescript
// Refactor to use state management properly
export const SalvageButton: React.FC<{item: Item}> = ({ item }) => {
  const [disabled, setDisabled] = React.useState(false);
  const salvageEngine = useSalvageEngine();  // Dependency injection

  const handleSalvage = useCallback(() => {
    setDisabled(true);
    salvageEngine.salvageItem(item.id, true);  // Engine updates state
    setTimeout(() => setDisabled(false), ANIMATION_DURATION);
  }, [item.id, salvageEngine]);

  return (
    <Pressable onPress={handleSalvage} disabled={disabled}>
      <Text>Salvage</Text>
    </Pressable>
  );
};
```
**All tests still pass** - cleaner architecture.

### Test Categories (in order of implementation)

#### Unit Testing (TDD First Layer)

**SalvageEngine Tests:**
```typescript
describe('SalvageEngine', () => {
  test('calculates correct material yield for common weapon', () => {
    const item = createMockItem({ type: 'weapon', rarity: 'common' });
    const result = SalvageEngine.calculateYield(item, []);

    expect(result).toContainEqual({ type: 'iron', quantity: 10 });
  });

  test('applies 2x multiplier for manual salvage', () => {
    const item = createMockItem({ salvageValue: 10 });
    const manual = SalvageEngine.salvageItem(item.id, true);
    const auto = SalvageEngine.salvageItem(item.id, false);

    expect(manual.materials.iron).toBe(auto.materials.iron * 2);
  });

  test('triggers critical hit 5% of time', () => {
    const results = [];
    for (let i = 0; i < 1000; i++) {
      results.push(SalvageEngine.salvageItem('item', true));
    }

    const criticals = results.filter(r => r.critical).length;
    expect(criticals).toBeGreaterThan(30);  // ~50 expected, allow variance
    expect(criticals).toBeLessThan(70);
  });
});
```

**TinkerEngine Tests:**
```typescript
describe('TinkerEngine', () => {
  test('upgrades equipment and increases power', () => {
    const equipment = createMockEquipment({ level: 1, power: 10 });
    materials$.set({ iron: 100 });

    const result = TinkerEngine.performUpgrade(equipment.id, [
      { type: 'iron', quantity: 50 }
    ]);

    expect(result.success).toBe(true);
    expect(equipment$.get().find(e => e.id === equipment.id).level).toBe(2);
    expect(materials$.iron.get()).toBe(50);  // Consumed materials
  });

  test('manual tinkering costs 50% less than auto', () => {
    const manualCost = TinkerEngine.calculateCost(5, true);
    const autoCost = TinkerEngine.calculateCost(5, false);

    expect(manualCost.iron).toBe(autoCost.iron * 0.5);
  });
});
```

**Coverage target**: >80% for all services

#### Integration Testing (TDD Second Layer)

**Salvage Flow Integration:**
```typescript
describe('Salvage Flow Integration', () => {
  test('complete salvage updates inventory, materials, and XP', async () => {
    const { getByRole } = render(<SalvageScreen />);

    // Setup initial state
    inventory$.set([createMockItem({ id: 'weapon1' })]);
    materials$.set({ iron: 0 });
    playerLevel$.set({ level: 1, xp: 0 });

    // Salvage item
    const button = getByRole('button', { name: /salvage weapon1/i });
    await userEvent.press(button);

    // Wait for animation
    await waitFor(() => {
      expect(inventory$.get()).toHaveLength(0);  // Item removed
      expect(materials$.iron.get()).toBeGreaterThan(0);  // Materials gained
      expect(playerLevel$.xp.get()).toBeGreaterThan(0);  // XP gained
    }, { timeout: 1000 });
  });
});
```

**Automation Integration:**
```typescript
describe('Automation System Integration', () => {
  test('automation processes items at configured speed', async () => {
    // Setup
    inventory$.set(createMockItems(100));
    automationSettings$.set({
      salvageEnabled: true,
      salvageSpeed: 10  // 10 items/sec
    });

    // Start automation
    AutomationManager.startAutomation('salvage');

    // Wait 2 seconds
    await new Promise(r => setTimeout(r, 2000));

    // Should have processed ~20 items (10/sec * 2sec)
    const remaining = inventory$.get().length;
    expect(remaining).toBeGreaterThan(75);  // Allow variance
    expect(remaining).toBeLessThan(85);

    AutomationManager.stopAutomation('salvage');
  });
});
```

#### End-to-End Testing (TDD Third Layer)

**Complete Player Journey:**
```typescript
describe('Player Progression E2E', () => {
  test('player can progress from Level 1 to Level 10 and unlock automation', async () => {
    // Start fresh
    resetGameState();

    const { getByRole, getByText } = render(<App />);

    // Phase 1: Manual salvaging
    for (let i = 0; i < 50; i++) {
      const salvageButton = getByRole('button', { name: /salvage/i });
      await userEvent.press(salvageButton);
      await waitFor(() => expect(salvageButton).not.toBeDisabled());
    }

    // Should have leveled up
    await waitFor(() => {
      expect(playerLevel$.level.get()).toBeGreaterThanOrEqual(5);
    });

    // Auto-collect unlocked at Level 5
    expect(getByText(/auto-collect unlocked/i)).toBeTruthy();

    // Continue to Level 10
    // ... more salvaging ...

    // Salvage Assistant unlocked
    expect(unlocks$.get().has(UnlockType.SALVAGE_ASSISTANT)).toBe(true);

    // Automation UI visible
    expect(getByRole('switch', { name: /automation/i })).toBeTruthy();
  });
});
```

**Performance Benchmarks:**
```typescript
describe('Performance Benchmarks', () => {
  test('salvage 100 items in <1 second', () => {
    const items = createMockItems(100);
    const start = performance.now();

    items.forEach(item => SalvageEngine.salvageItem(item.id, false));

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000);
  });

  test('offline progression for 24 hours completes in <2 seconds', () => {
    setupAutomation(10);  // 10 items/sec
    const start = performance.now();

    const result = AutomationManager.calculateOfflineProgress(
      24 * 60 * 60 * 1000  // 24 hours
    );

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000);
    expect(result.itemsProcessed).toBe(10 * 60 * 60 * 24);  // Max rate
  });
});
```

### TDD Checklist for Each Component
- [x] First test written before any implementation code
- [x] Each test covers one specific behavior
- [x] Tests use React Native Testing Library patterns (`screen`, `userEvent`)
- [x] No testIds unless absolutely necessary (prefer `getByRole`, `getByText`)
- [x] Tests query by user-visible content
- [x] Async operations use `waitFor`/`findBy`
- [x] All tests pass before next feature
- [x] Mock external dependencies (AsyncStorage, Reanimated)
- [x] Performance tests for critical paths

## 8. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|--------------|---------------|
| Client Device | iOS 13+ / Android 5.0+ | React Native 0.73+ requirement |
| RAM | 150MB dedicated | Particle system + state + animations |
| Storage | 50MB app + 10MB save data | Assets + compressed textures |
| CPU | 2+ cores recommended | Background automation thread |
| GPU | OpenGL ES 2.0+ | Reanimated particle rendering |

**Server Infrastructure**: None in Phase 1 (local-only)

**Future Cloud Sync**:
- Firebase: Firestore (NoSQL), Cloud Functions, Auth
- AWS Alternative: AppSync (GraphQL), Lambda, Cognito
- CDN: CloudFront for asset delivery
- Cost estimate: $5-50/month for 10k users

### Deployment Architecture

#### Environment Strategy
- **Development**: Local simulators/emulators, Metro bundler
- **Staging**: TestFlight (iOS), Internal Testing (Android), Expo EAS builds
- **Production**: App Store, Google Play, Expo OTA updates for JS changes

#### Container Strategy
- **Not applicable**: Mobile app, not containerized
- **Expo Application Services (EAS)**: Cloud build service
  - Build iOS/Android native binaries
  - Manage code signing and certificates
  - Submit to app stores automatically

#### CI/CD Pipeline Design
```
GitHub Push → GitHub Actions
    ↓
1. Run Jest Tests (Unit + Integration)
    ↓ (if pass)
2. Run ESLint + TypeScript checks
    ↓ (if pass)
3. Build Expo app (EAS Build)
    ↓ (if pass)
4. Deploy to Staging (TestFlight/Internal Testing)
    ↓ (manual approval)
5. Deploy to Production (App Stores)
    ↓
6. Expo OTA update for JS-only changes
```

**GitHub Actions Workflow**:
```yaml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- --coverage --maxWorkers=2
      - run: npm run lint
      - run: npm run typecheck

  build-ios:
    needs: test
    runs-on: macos-latest
    steps:
      - uses: expo/expo-github-action@v8
      - run: eas build --platform ios --profile preview

  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: expo/expo-github-action@v8
      - run: eas build --platform android --profile preview
```

#### Blue-Green Deployment
- **Mobile app context**: Not applicable (users update at their own pace)
- **OTA updates**: Can roll back via Expo EAS Update channels
- **Feature flags**: Use `expo-constants` + remote config for gradual rollout

### Monitoring & Observability

#### Metrics

**Application Metrics:**
| Metric | Collection | Alert Threshold |
|--------|-----------|-----------------|
| Salvage operations/min | Analytics event | N/A (informational) |
| Animation frame drops | `Systrace` / Flipper | >5% frames dropped |
| Memory usage | `Performance.memory` | >200MB sustained |
| Crash rate | Sentry / Crashlytics | >0.1% sessions |
| App launch time | Performance.now() | >3 seconds |

**Business Metrics:**
| Metric | Source | Target |
|--------|--------|--------|
| Daily Active Users (DAU) | Analytics | Growth +10% MoM |
| Level 10 unlock rate | Progression events | >80% of D1 users |
| Average session length | Analytics | 15-20 minutes |
| Retention D1/D7/D30 | Analytics | 60%/40%/20% |

**Infrastructure Metrics** (Future):
- API response time (Firebase): <500ms p95
- Cloud function cold starts: <2s
- Firestore read/write throughput

#### Logging

**Log Levels:**
- `DEBUG`: Detailed game events (dev only)
- `INFO`: User actions (salvage, tinker, level up)
- `WARN`: Recoverable errors (failed offline calc, checksum mismatch)
- `ERROR`: Crashes, unhandled exceptions

**Implementation**:
```typescript
import { logger } from './utils/logger';

logger.info('salvage_complete', {
  itemId,
  materials,
  manual,
  level: playerLevel$.level.get()
});

logger.error('checksum_mismatch', {
  expected: calculatedChecksum,
  actual: storedChecksum
});
```

**Centralized Logging** (Future):
- **Development**: Console only
- **Production**: Sentry breadcrumbs (last 100 events before crash)
- **Log retention**: 30 days in Sentry

#### Alerting

| Alert | Condition | Priority | Action |
|-------|-----------|----------|--------|
| High crash rate | >0.5% sessions | P0 | Immediate rollback via OTA |
| Offline calc slow | >5s average | P1 | Optimize algorithm |
| Memory leak | Usage growing 10MB/min | P1 | Profile and fix |
| Asset load failure | >5% users | P2 | Check CDN/bundle |
| Save corruption | Checksum fails >1% | P0 | Revert save logic |

**Alert Channels**:
- P0: PagerDuty → SMS + Slack
- P1: Slack #alerts channel
- P2: Email digest

## 9. Scalability & Performance

### Performance Requirements

| Requirement | Target | Measurement | Mitigation if Missed |
|-------------|--------|-------------|----------------------|
| Animation Frame Rate | 60fps (16.67ms/frame) | React DevTools Profiler | Reduce particle count |
| State Update Latency | <16ms per salvage | `performance.now()` | Batch state updates |
| Salvage Throughput | 100 items/sec | Jest benchmark | Optimize SalvageEngine |
| Offline Calc Time | <2s for 24hr | Performance test | Cap at 12hr or chunk calculation |
| Memory Footprint | <150MB total | Xcode Instruments | Reduce cached particles |
| App Launch Time | <2s to interactive | Expo Performance Monitor | Lazy load non-critical modules |

### Scalability Strategy

#### Horizontal Scaling
- **Not applicable**: Mobile client runs on single device
- **Future multiplayer**: Server-side sharding by player region

#### Data Scaling
| Data Type | Current Limit | Scale Plan |
|-----------|--------------|------------|
| Inventory items | 10,000 | Virtualized list (react-native-flash-list) |
| Equipment slots | 20 | Fixed cap, no scaling needed |
| Material types | 50 | Extensible via enum, no limit |
| Save data size | 5MB | Compress with LZ4 if >1MB |
| Particle instances | 200 active | Pool particles, reuse instances |

#### Computation Scaling
- **Phase 1-2**: Main thread sufficient
- **Phase 3 (100 items/sec)**: Move automation to Web Worker
  ```typescript
  // AutomationWorker.ts
  self.addEventListener('message', (e) => {
    const { items, settings } = e.data;
    const results = items.map(item => SalvageEngine.salvageItem(item));
    self.postMessage({ results });
  });
  ```
- **Offline calculation**: Chunk 24hr into 1hr blocks, process progressively

### Performance Optimization

#### Query Optimization
- **State reads**: Use Legend State `peek()` to avoid subscriptions in loops
  ```typescript
  // BAD: Creates 1000 subscriptions
  items.forEach(item => {
    const material = materials$.iron.get();  // Subscribe
  });

  // GOOD: Single read
  const ironCount = materials$.iron.peek();
  items.forEach(item => {
    // Use ironCount
  });
  ```

#### Asset Optimization
- **Images**: Use WebP format, max 1024x1024
- **Sprite sheets**: Combine particle textures into atlas
- **Audio**: AAC format, <100KB per sound
- **Bundle size**: Code splitting for Phase 3 features
  ```typescript
  const PrestigeScreen = lazy(() => import('./screens/PrestigeScreen'));
  ```

#### Code-Level Optimizations
- **Memoization**: `React.memo()` for expensive components
  ```typescript
  export const ParticleEffect = React.memo(({ particles }) => {
    // Expensive particle rendering
  }, (prev, next) => prev.particles.length === next.particles.length);
  ```
- **Debouncing**: Save operations every 5s, not every state change
  ```typescript
  const debouncedSave = debounce(() => {
    AsyncStorage.setItem('@salvage_save_v1', JSON.stringify(gameState));
  }, 5000);
  ```
- **List virtualization**: Use `FlashList` for 1000+ items
  ```typescript
  <FlashList
    data={inventory}
    renderItem={renderItem}
    estimatedItemSize={60}
  />
  ```

#### Resource Pooling
- **Particle pool**: Reuse 200 particle instances
  ```typescript
  class ParticlePool {
    private pool: Particle[] = [];

    acquire(): Particle {
      return this.pool.pop() || new Particle();
    }

    release(particle: Particle) {
      particle.reset();
      this.pool.push(particle);
    }
  }
  ```
- **Animation pool**: Reuse Reanimated shared values

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| **Reanimated performance on low-end Android** | High - Core feature broken | Medium | Implement performance tiers (high/med/low), fallback to simple animations | Frontend Lead |
| **AsyncStorage data corruption** | High - Lost player progress | Low | Implement checksums, versioned saves, cloud backup | Backend Lead |
| **Offline calculation exploits** | Medium - Game economy broken | Medium | Timestamp validation, cap at 48hr, sanity checks | Game Designer |
| **Memory leaks in particle system** | High - App crashes | Medium | Particle pooling, strict cleanup, memory profiling | Frontend Lead |
| **Battery drain from automation** | Medium - Poor reviews | High | Use requestAnimationFrame throttling, optional 30fps mode | Mobile Lead |
| **React Native upgrade breaking changes** | Medium - Delayed updates | Low | Pin versions, thorough testing before upgrade | Tech Lead |
| **Legend State learning curve** | Low - Slower development | Medium | Team training, comprehensive docs, code reviews | Tech Lead |
| **Expo EAS build failures** | Medium - Deployment delays | Low | Local build fallback, multiple build machines | DevOps |

### Dependencies

| Dependency | Type | Risk | Mitigation | Status |
|------------|------|------|------------|--------|
| React Native 0.73+ | Framework | Breaking changes | Pin version, test before upgrade | Active |
| Expo SDK 50+ | Platform | API deprecations | Follow Expo release cycle | Active |
| Legend State 2.x | State Mgmt | Niche library | Contribute to library, fork if needed | Active |
| Reanimated 3.x | Animation | Performance issues | Fallback to Animated API | Active |
| AsyncStorage | Persistence | Size limits (6MB iOS) | Implement compression, cloud sync | Active |
| React Native Testing Library | Testing | API changes | Update with React Native version | Active |

## 11. Implementation Plan (TDD-Driven)

Following `@docs/guides/lean-task-generation-guide.md` principles - prioritize user-visible functionality.

### Development Phases

#### Phase 1: Foundation & First Feature (Week 1) - 5 days
**Goal**: Player can manually salvage one item and see materials increase.

**Day 1: Test Infrastructure Setup**
- [x] Configure Jest with React Native preset
- [x] Set up React Native Testing Library
- [x] Create custom render utility with Legend State provider
- [x] Configure Reanimated mocks for tests
- [x] Set up AsyncStorage mock
- [x] Create test data factories (mockItem, mockEquipment)
- **Deliverable**: `npm test` runs successfully

**Day 2: Core Salvage Feature (TDD)**
**Test Planning**:
```typescript
// Tests to write (RED phase):
test('renders inventory item with salvage button')
test('pressing salvage button removes item from inventory')
test('salvage adds materials to player total')
test('salvage button is disabled during animation')
test('displays material gain popup after salvage')
```

**Implementation** (GREEN phase):
- Create `SalvageEngine` service (tested first)
- Create `materials$` Legend State observable
- Create `inventory$` state
- Build `SalvageButton` component
- Wire up state updates

**Refactor**:
- Extract material calculation logic
- Add dependency injection for testing

**Deliverable**: User can tap item, see materials increase, 100% test coverage for salvage flow.

**Day 3: Tinkering Feature (TDD)**
**Test Planning**:
```typescript
test('displays equipment with upgrade button')
test('shows material cost for next upgrade')
test('upgrade button disabled when insufficient materials')
test('clicking upgrade consumes materials and increases level')
test('displays power increase animation')
```

**Implementation**:
- Create `TinkerEngine` service
- Create `equipment$` state
- Build `TinkerButton` component
- Implement upgrade cost calculation
- Connect material consumption

**Deliverable**: User can spend materials to upgrade equipment.

**Day 4: Visual Polish (TDD for Animations)**
**Test Planning**:
```typescript
test('particle effect triggers on salvage')
test('materials animate from item to counter')
test('number popup appears with correct value')
test('screen shake on equipment upgrade')
```

**Implementation**:
- Create `ParticleSystem` with Reanimated
- Build material collection animation
- Add number popup component
- Implement screen shake effect
- Test on device (60fps target)

**Deliverable**: Satisfying visual feedback for all actions.

**Day 5: First Unlock - Auto-Collect (TDD)**
**Test Planning**:
```typescript
test('auto-collect unlocks at level 5')
test('materials auto-collect after 0.5 seconds')
test('manual collection still works')
test('unlock notification appears')
```

**Implementation**:
- Create `ProgressionManager` service
- Implement XP gain from salvage
- Add level-up logic
- Create unlock system
- Build auto-collect timer

**Deliverable**: Player reaches Level 5, unlocks auto-collect, sees meaningful progression.

---

#### Phase 2: Automation System (Week 2) - 5 days
**Goal**: Player unlocks Salvage Assistant (Level 10) and experiences hybrid gameplay.

**Day 6: Basic Automation (TDD)**
**Test Planning**:
```typescript
test('automation toggle appears at Level 10')
test('enabling automation processes items automatically')
test('automation runs at 1 item per 3 seconds')
test('manual clicks still work during automation')
test('automation stops when queue is empty')
```

**Implementation**:
- Create `AutomationManager` service
- Build automation loop (requestAnimationFrame)
- Add toggle UI component
- Implement item queue system
- Connect to SalvageEngine

**Deliverable**: Automation processes items in background while player can still click.

**Day 7: Manual Bonuses (TDD)**
**Test Planning**:
```typescript
test('manual salvage yields 2x materials')
test('combo system activates after 10 clicks')
test('critical hit triggers 5% of the time')
test('combo UI shows current streak')
```

**Implementation**:
- Add manual multiplier to SalvageEngine
- Implement combo tracking
- Add critical hit RNG (seeded)
- Build combo UI component
- Add audio feedback

**Deliverable**: Manual clicking remains valuable despite automation.

**Day 8: Automation Upgrades (TDD)**
**Test Planning**:
```typescript
test('Level 13 increases speed to 1 item per 2 sec')
test('Level 15 increases speed to 1 item per 1 sec')
test('speed upgrade is reflected in UI')
test('automation settings persist after app restart')
```

**Implementation**:
- Add automation speed tiers to ProgressionManager
- Update AutomationManager to use variable speed
- Build upgrade UI
- Implement save/load for automation settings
- AsyncStorage integration

**Deliverable**: Automation gets faster as player levels up.

**Day 9: Priority System (TDD)**
**Test Planning**:
```typescript
test('player can set item priority order')
test('automation processes high-priority items first')
test('drag-and-drop reorders priority')
test('filters allow auto-salvage of commons only')
```

**Implementation**:
- Build priority queue data structure
- Add drag-and-drop UI (react-native-gesture-handler)
- Implement item filters
- Update AutomationManager to respect priority

**Deliverable**: Strategic control over automation behavior.

**Day 10: Auto-Tinker (TDD)**
**Test Planning**:
```typescript
test('auto-tinker unlocks at Level 12')
test('automatically spends materials on target equipment')
test('player can set target equipment')
test('manual tinkering costs 50% less than auto')
```

**Implementation**:
- Add tinker automation to AutomationManager
- Build target selection UI
- Implement cost modifiers
- Add manual cost discount

**Deliverable**: Full automation for both salvage and tinkering.

---

#### Phase 3: Advanced Features (Week 3) - 5 days
**Goal**: Complete progression system with prestige, offline gains, and endgame.

**Day 11: Offline Progression (TDD)**
**Test Planning**:
```typescript
test('calculates offline gains on app launch')
test('offline calculation completes in <2 seconds for 24hr')
test('caps offline gains at 48 hours')
test('detects time manipulation')
test('displays welcome back screen with summary')
```

**Implementation**:
- Build offline calculation algorithm
- Add timestamp validation
- Create chunked calculation (1hr blocks)
- Build welcome back UI
- Performance benchmark tests

**Deliverable**: Players can close app and still make progress.

**Day 12: Material Refinement (TDD)**
**Test Planning**:
```typescript
test('refinement unlocks at Level 15')
test('combines 3 common materials into 1 rare')
test('auto-refiner unlocks at Level 20')
test('refining awards XP')
```

**Implementation**:
- Add material conversion logic
- Build refinement UI
- Implement auto-refiner
- Add to automation system

**Deliverable**: New layer of material management.

**Day 13: Prestige System (TDD)**
**Test Planning**:
```typescript
test('prestige available every 1000 salvages')
test('displays 3 random bonus choices')
test('applying bonus gives correct effect')
test('bonus expires after duration')
test('prestige count tracked in stats')
```

**Implementation**:
- Create `PrestigeManager` service
- Build bonus application system
- Add timer-based expiry
- Create prestige UI
- Track prestige history

**Deliverable**: Endgame loop with meaningful choices.

**Day 14: Smart AI Suggestions (TDD)**
**Test Planning**:
```typescript
test('AI learns from player tinkering patterns')
test('suggests optimal material distribution')
test('one-click accepts suggestion')
test('AI improves with more data')
```

**Implementation**:
- Build pattern recognition (simple heuristics)
- Track player choices
- Calculate optimal distribution
- Build suggestion UI
- Add accept/reject actions

**Deliverable**: Intelligent automation assistance.

**Day 15: Endgame Features (TDD)**
**Test Planning**:
```typescript
test('God Click processes 1000 items instantly')
test('God Click has 1 hour cooldown')
test('Perfect Salvage has 50% legendary rate')
test('Master Touch exceeds normal limits')
```

**Implementation**:
- Add God Click ability
- Implement cooldown system
- Add Perfect Salvage bonus
- Build Master Touch mechanic
- Create endgame UI

**Deliverable**: Clicking remains relevant at max level.

---

#### Phase 4: Polish & Production (Week 4) - 5 days
**Goal**: Shippable product with analytics, monetization hooks, and balancing.

**Day 16: Performance Optimization**
- Profile with React DevTools Profiler
- Optimize particle count for low-end devices
- Implement performance tiers (high/med/low)
- Add memory leak detection
- Optimize AsyncStorage writes (debouncing)
- **Performance tests must pass**: 60fps, <2s offline calc

**Day 17: Analytics Integration**
- Set up Firebase Analytics
- Add event tracking (salvage, level_up, prestige, etc.)
- Track retention funnels
- Add crash reporting (Crashlytics)
- Create analytics dashboard
- **Deliverable**: Data-driven insights

**Day 18: Monetization Hooks**
- Design in-app purchase structure
- Implement boost items (Energy Boosts, Speed Demons)
- Add purchase flow (expo-in-app-purchases)
- Test purchases in sandbox
- Add restore purchases
- **Deliverable**: Monetization ready

**Day 19: Balance & Tuning**
- Playtest for pacing (15-20min to Level 10)
- Adjust XP curves
- Balance material drop rates
- Tune automation speeds
- Adjust upgrade costs
- **Deliverable**: Smooth progression curve

**Day 20: Final Testing & Release Prep**
- Full E2E test suite execution
- Device testing (5+ iOS, 5+ Android devices)
- Accessibility review
- Performance validation
- Prepare app store assets
- Submit to TestFlight/Internal Testing
- **Deliverable**: Ready for production

---

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|------------|------|--------------|
| M1: Core Loop | Manual salvage + tinker working | Day 5 | None |
| M2: First Automation | Level 10 unlock, automation works | Day 10 | M1 |
| M3: Full Progression | Offline, prestige, endgame | Day 15 | M2 |
| M4: Production Ready | Optimized, analytics, monetization | Day 20 | M3 |
| M5: App Store Launch | Live on iOS/Android | Day 25 | M4 |

## 12. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| **State Management** | Redux, Zustand, MobX, Legend State | **Legend State** | Reactive observables perfect for game state, minimal boilerplate, excellent performance |
| **Animation Library** | Animated API, Reanimated 2, Reanimated 3 | **Reanimated 3** | Runs on UI thread (60fps), shared values for particles, best performance |
| **Persistence** | AsyncStorage, SQLite, Realm, MMKV | **AsyncStorage** | Simple key-value sufficient for MVP, can migrate to MMKV later for speed |
| **Testing Framework** | Enzyme, React Testing Library, Detox | **React Native Testing Library** | Best practices for user-centric tests, aligns with TDD approach |
| **Build System** | Expo bare workflow, vanilla React Native, Expo managed | **Expo SDK 50** | Fast iteration, EAS builds, OTA updates, less native code management |
| **Cloud Backend** | Firebase, AWS Amplify, Supabase, None | **None (Phase 1)** | Local-only reduces complexity, can add Firebase later for cloud sync |
| **Monetization** | Ads, IAP, Subscription, Hybrid | **IAP (Boosts)** | Fits idle game model, non-intrusive, premium feel |

### Trade-offs

#### 1. Legend State vs Redux
- **Chose**: Legend State for reactive performance
- **Over**: Redux for ecosystem maturity
- **Because**: Game state updates 60fps (particle positions, counters), Redux would require excessive re-renders. Legend State's fine-grained reactivity only updates subscribed components.
- **Accepted limitation**: Smaller community, fewer plugins

#### 2. Local-only vs Cloud-first
- **Chose**: Local-only for MVP
- **Over**: Firebase integration from day 1
- **Because**: Faster development, no server costs, offline-first UX. Can add cloud sync later without refactor (state already centralized).
- **Accepted limitation**: No cross-device sync initially, no server-side anti-cheat

#### 3. Expo Managed vs Bare Workflow
- **Chose**: Expo SDK 50 managed workflow
- **Over**: Bare workflow with custom native modules
- **Because**: EAS builds save 80% native config time, OTA updates allow quick fixes, Expo modules cover 95% of needs.
- **Accepted limitation**: Locked to Expo SDK versions, slight app size increase

#### 4. Reanimated vs Animated API
- **Chose**: Reanimated 3 despite complexity
- **Over**: Simple Animated API
- **Because**: Particle system needs 60fps, Animated API runs on JS thread (30fps max). Reanimated's UI thread execution is essential.
- **Accepted limitation**: Steeper learning curve, harder to debug

#### 5. TDD-first vs "Tests later"
- **Chose**: Strict TDD (Red-Green-Refactor)
- **Over**: Write code first, test later
- **Because**: Game systems are complex (combos, prestige, offline calc), bugs compound. TDD catches issues early, forces good architecture, ensures coverage >80%.
- **Accepted limitation**: Slower initial development (offset by fewer bugs)

## 13. Open Questions

Technical questions requiring resolution:

### High Priority
- [ ] **Particle performance on Android 5.0-6.0**: Can we hit 60fps with 20 particles on API 21-23 devices? Need real device testing.
  - **Decision needed by**: Day 4 (visual polish)
  - **Fallback**: Reduce to 10 particles, or disable particles on low-end

- [ ] **AsyncStorage 6MB limit on iOS**: Will save data exceed limit with 10,000 items?
  - **Decision needed by**: Day 8 (persistence)
  - **Mitigation**: Implement LZ4 compression, or move to MMKV (no size limit)

- [ ] **Offline calculation accuracy**: How to prevent clock manipulation exploits?
  - **Decision needed by**: Day 11 (offline progression)
  - **Options**: Server timestamp validation (requires backend), device attestation, cap gains

### Medium Priority
- [ ] **Battery drain from automation loop**: Is requestAnimationFrame(60fps) too aggressive?
  - **Research needed**: Battery profiling on 3+ devices
  - **Options**: Throttle to 30fps when app backgrounded, use setInterval(1000ms)

- [ ] **Legend State persistence plugin**: Should we use official persistence or custom?
  - **Decision needed by**: Day 8
  - **Trade-off**: Official is maintained, custom gives more control over compression

- [ ] **Sound effects licensing**: Free sounds vs custom composition?
  - **Decision needed by**: Day 20
  - **Budget**: $0 (free) vs $500 (custom)

### Low Priority
- [ ] **Accessibility: VoiceOver for particles**: How to announce material gains without spam?
  - **Research**: iOS accessibility best practices
  - **Option**: Debounce announcements to every 2 seconds

- [ ] **Localization**: Which languages for v1.0?
  - **Market research**: Top countries for idle games
  - **MVP**: English only, add i18n structure for future

## 14. Appendices

### A. Technical Glossary

| Term | Definition |
|------|------------|
| **Legend State** | Reactive state management library using observables for fine-grained updates |
| **Reanimated** | React Native animation library running on UI thread for 60fps performance |
| **Particle System** | Visual effect system that spawns/animates small graphics (particles) |
| **Offline Progression** | Calculating game progress that occurred while app was closed |
| **Prestige System** | Endgame mechanic where players reset progress for permanent bonuses |
| **TDD (Test-Driven Development)** | Write tests first (RED), then code to pass (GREEN), then refactor |
| **Salvage** | Game action: destroy item to gain materials |
| **Tinker** | Game action: spend materials to upgrade equipment |
| **Automation** | Game system: background processes that perform actions without clicks |
| **Combo** | Sequential actions that trigger bonus (e.g., 10 clicks = speed burst) |
| **Critical Hit** | Random chance for enhanced outcome (5% → 5x materials) |

### B. Reference Architecture

**Similar Games**:
- **Idle Miner Tycoon**: Progressive automation, prestige system
- **Adventure Capitalist**: Manual → auto transition, offline progression
- **Tap Titans 2**: Active tapping with idle mechanics

**Technical References**:
- Legend State Docs: https://legendapp.com/open-source/state/
- Reanimated 3 Docs: https://docs.swmansion.com/react-native-reanimated/
- React Native Testing Library: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- Expo Documentation: https://docs.expo.dev

**Design Patterns**:
- **Observer Pattern**: Legend State observables
- **Command Pattern**: SalvageEngine, TinkerEngine actions
- **Strategy Pattern**: Automation algorithms (manual, basic, advanced)
- **Factory Pattern**: Test data factories (mockItem, mockEquipment)

### C. Proof of Concepts

**POC 1: Particle Performance** (Day 2-3)
- Goal: Validate 60fps with 20 particles on mid-tier Android
- Result: TBD
- Code: `/prototypes/particle-poc/`

**POC 2: Offline Calculation Speed** (Day 10-11)
- Goal: Calculate 24hr in <2s
- Approach: Chunked calculation, parallel processing
- Result: TBD
- Code: `/prototypes/offline-calc-poc/`

**POC 3: AsyncStorage Size Limits** (Day 7-8)
- Goal: Test 10,000 items save data size
- Result: TBD
- Mitigation: LZ4 compression if >5MB

### D. Related Documents

- **Product Requirements Document**: `/workflow-outputs/20251102_225941/feature-description.md`
- **Lean Task Generation Guide**: `/docs/guides/lean-task-generation-guide.md`
- **React Native Testing Library Guide**: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Architecture Decision Records**: `/docs/adr/` (to be created)
- **API Documentation**: Auto-generated from TypeScript types
- **Analytics Event Spec**: `/docs/analytics/event-spec.md` (to be created Day 17)

---

**Generated from Feature Description**: `/workflow-outputs/20251102_225941/feature-description.md`
**Generation Date**: 2025-11-02
**Version**: v1.0 Draft
**Next Steps**: Review with team → Approve → Begin Day 1 implementation (Test Infrastructure Setup)

---

## Summary of Key Technical Decisions

✅ **React Native + Expo SDK 50** - Fast iteration, managed builds
✅ **Legend State** - 60fps reactive state management
✅ **Reanimated 3** - UI-thread animations for particles
✅ **AsyncStorage** - Simple persistence, migrate to MMKV if needed
✅ **TDD-first approach** - Red-Green-Refactor for all features
✅ **Local-only MVP** - Add Firebase cloud sync in Phase 2
✅ **Progressive complexity** - Manual → Hybrid → Full automation over 20 hours
✅ **Performance tiers** - Graceful degradation for low-end devices
✅ **20-day implementation** - 4 weeks to production-ready app

**Critical Path**: Days 1-5 (Core loop) → Days 6-10 (Automation) → Days 11-15 (Progression) → Days 16-20 (Polish)
