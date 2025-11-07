# Salvage & Tinkering System - Technical Design Document

## Document Control
| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude (Generated) | 2025-11-06 | Draft | Initial TDD from PRD |

## Executive Summary

This Technical Design Document outlines the implementation strategy for a Salvage & Tinkering System featuring progressive automation across three distinct phases. The system transforms from tactile, click-based interactions (Phase 1) through strategic automation management (Phase 2) to full optimization gameplay (Phase 3). Built on React Native for mobile platforms, the architecture emphasizes Test-Driven Development, offline capability, and seamless UI evolution to support 20+ hours of engaging progression.

## 1. Overview & Context

### Problem Statement

Mobile idle games often suffer from two critical design flaws:
1. **Premature Automation**: Players receive full automation too early, eliminating satisfying manual gameplay
2. **Engagement Cliff**: After automation unlocks, player agency disappears, leading to abandonment

This system solves both problems by implementing a graduated progression where automation is earned through mastery, and manual actions remain valuable throughout the entire player journey.

### Solution Approach

**Three-Phase Architecture:**
- **Phase 1 (Manual)**: Direct click-to-reward gameplay establishes core loops and teaches mechanics
- **Phase 2 (Hybrid)**: Introduces automation while maintaining manual advantages and strategic choices
- **Phase 3 (Optimization)**: Full automation with high-level strategy and prestige systems

**Technical Foundation:**
- React Native for cross-platform mobile deployment
- Redux for predictable state management across automation states
- React Native Reanimated for 60fps animations
- AsyncStorage + SQLite for offline progression and state persistence
- Event-driven architecture for automation timing

### Success Criteria

**Technical Metrics:**
- UI response time <16ms (60fps) for all manual interactions
- Animation frame rate: 60fps sustained during particle effects
- Offline sync accuracy: 100% of expected resources calculated
- State persistence: <500ms save time, <1s load time
- Memory footprint: <150MB on mid-tier devices (Android 8+, iOS 12+)

**Business Metrics (from PRD):**
- Phase 1: 80% complete first manual salvage session
- Phase 2: 70% unlock first automation
- Phase 3: 30% return daily for 30+ days
- Average session time progression: 10min → 20min → 30min

## 2. Requirements Analysis

### Functional Requirements

**FR-1: Salvage System**
- FR-1.1: Click/tap to salvage items with 0.5s animation
- FR-1.2: Material particle effects with rarity-based colors (common: gray, rare: blue, epic: purple, legendary: gold)
- FR-1.3: Material collection with 2-second auto-collect fallback
- FR-1.4: Progressive automation unlocks at levels 5, 8, 10, 11, 13, 15, 18, 22, 26
- FR-1.5: Automation speeds: 1 item/3s → 1/2s → 1/1s → 3/s → 10/s → 100/s
- FR-1.6: Queue management supporting up to 10,000 items (Level 26+)

**FR-2: Tinkering System**
- FR-2.1: Drag-and-drop material application to equipment
- FR-2.2: 2-second channeling animation with progress indicator
- FR-2.3: 100% success rate Phase 1, introduce failure mechanics Phase 2 (optional)
- FR-2.4: Equipment power level visualization
- FR-2.5: Auto-tinker unlocks at Level 12 with priority system at Level 16
- FR-2.6: Smart AI suggestions at Level 20

**FR-3: Material System**
- FR-3.1: Four rarity tiers: Common, Rare, Epic, Legendary
- FR-3.2: Material refinement: 3x Common → 1x Rare (Level 15+)
- FR-3.3: Auto-refiner unlock at Level 20
- FR-3.4: Material counter UI with running totals

**FR-4: Progression System**
- FR-4.1: Level-based unlocks from 1-40
- FR-4.2: Offline progression accumulation (Level 26+)
- FR-4.3: Prestige system at Level 35 (1000 items = prestige choice)
- FR-4.4: Forge mastery cycles every 2 hours (Level 40)

**FR-5: UI Evolution**
- FR-5.1: Phase 1 UI: Inventory grid, salvage button, material counters
- FR-5.2: Phase 2 UI: Automation dashboard, progress bars, priority controls
- FR-5.3: Phase 3 UI: Command center with statistics, efficiency metrics, streaming numbers

### Non-Functional Requirements

**Performance:**
- NFR-1: 60fps sustained during salvage animations (16.67ms frame budget)
- NFR-2: Particle system supporting 50 simultaneous particles without frame drops
- NFR-3: State updates <100ms for all user actions
- NFR-4: Offline calculation: compute up to 24 hours in <2 seconds on app resume

**Scalability:**
- NFR-5: Support 10,000 queued items with efficient data structures
- NFR-6: Handle 100 items/second automation rate without performance degradation
- NFR-7: State tree size <5MB for serialization

**Availability:**
- NFR-8: 100% offline playability (no internet required after initial download)
- NFR-9: State persistence every 30 seconds during active play
- NFR-10: Crash recovery with state restoration to last save

**Usability:**
- NFR-11: Touch target size minimum 44x44pt (iOS HIG compliance)
- NFR-12: Haptic feedback on all manual actions (iOS/Android)
- NFR-13: Accessibility: Dynamic type support, VoiceOver/TalkBack compatible
- NFR-14: Animations skippable via settings

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │ Game Logic   │  │  Automation  │      │
│  │  (Screens)   │◄─┤   Services   │◄─┤    Engine    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼────────┐   │
│  │           Redux Store (Single Source of Truth)       │   │
│  │  • player state    • materials    • automation config│   │
│  │  • equipment state • queue        • timers           │   │
│  └────────────────────────┬──────────────────────────────┘   │
│                            │                                  │
│  ┌─────────────────────────▼─────────────────────────────┐  │
│  │              Persistence Layer                         │  │
│  │  • AsyncStorage (settings, small data)                │  │
│  │  • SQLite (game state, history, offline sync)         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Component Design

#### 1. UI Layer Components

**SalvageScreen.tsx**
- **Purpose**: Main salvage interface for Phase 1-3
- **Responsibilities**:
  - Render inventory grid (dynamic based on player level)
  - Handle touch events for manual salvage
  - Display particle animations on salvage
  - Show automation controls when unlocked
- **State Dependencies**: `inventory`, `materials`, `automationState`
- **Key Methods**:
  - `handleItemPress(itemId: string): void` - Manual salvage trigger
  - `renderParticles(itemType: ItemRarity): AnimatedView[]` - Particle effect generation

**TinkeringScreen.tsx**
- **Purpose**: Equipment upgrade interface
- **Responsibilities**:
  - Drag-and-drop material application
  - Channel progress visualization
  - Equipment power display
  - Auto-tinker controls (Phase 2+)
- **State Dependencies**: `equipment`, `materials`, `tinkerConfig`
- **Key Methods**:
  - `handleMaterialDrag(materialId: string, equipmentSlot: string): void`
  - `startChanneling(equipment: Equipment, materials: Material[]): Promise<void>`

**AutomationDashboard.tsx**
- **Purpose**: Phase 2+ automation management UI
- **Responsibilities**:
  - Display current automation status
  - Queue visualization
  - Priority configuration
  - Efficiency metrics
- **State Dependencies**: `automationState`, `queue`, `stats`

**CommandCenter.tsx**
- **Purpose**: Phase 3 optimization interface
- **Responsibilities**:
  - Real-time statistics streaming
  - Prestige option display
  - Forge mastery controls
  - Advanced settings
- **State Dependencies**: `prestigeState`, `forgeState`, `analytics`

#### 2. Game Logic Services

**SalvageService.ts**
- **Purpose**: Core salvage logic
- **Responsibilities**:
  - Item-to-materials conversion calculations
  - Rarity roll algorithms
  - Combo bonus tracking
  - Critical hit resolution (5% chance for 5x)
- **Interfaces**:
```typescript
interface ISalvageService {
  salvageItem(item: Item): SalvageResult;
  calculateMaterials(item: Item, bonuses: Bonus[]): Material[];
  applyCritical(materials: Material[]): Material[];
}
```

**TinkeringService.ts**
- **Purpose**: Equipment upgrade logic
- **Responsibilities**:
  - Material consumption validation
  - Power level calculations
  - Success rate determination (Phase 2+)
  - Stat distribution
- **Interfaces**:
```typescript
interface ITinkeringService {
  canApplyMaterials(equipment: Equipment, materials: Material[]): boolean;
  applyTinker(equipment: Equipment, materials: Material[]): Equipment;
  calculatePowerGain(materials: Material[]): number;
}
```

**ProgressionService.ts**
- **Purpose**: Level and unlock management
- **Responsibilities**:
  - Experience tracking
  - Level-up calculations
  - Feature unlock detection
  - Prestige logic
- **Interfaces**:
```typescript
interface IProgressionService {
  addExperience(amount: number): LevelUpResult | null;
  checkUnlocks(level: number): Unlock[];
  canPrestige(): boolean;
  applyPrestige(choice: PrestigeChoice): void;
}
```

#### 3. Automation Engine

**AutomationController.ts**
- **Purpose**: Central automation orchestrator
- **Responsibilities**:
  - Timer management for automated actions
  - Queue processing
  - Rate limiting (items/second)
  - Offline time calculation
- **Architecture Pattern**: Event-driven with React hooks
- **Key Methods**:
```typescript
interface IAutomationController {
  startAutomation(type: AutomationType, config: AutomationConfig): void;
  pauseAutomation(type: AutomationType): void;
  processQueue(): void;
  calculateOfflineProgress(timeAwayMs: number): OfflineResult;
}
```

**Implementation Detail: Offline Calculation**
```typescript
calculateOfflineProgress(timeAwayMs: number): OfflineResult {
  const maxOfflineTime = 24 * 60 * 60 * 1000; // 24 hours
  const effectiveTime = Math.min(timeAwayMs, maxOfflineTime);

  const salvageRate = this.getSalvageRatePerMs();
  const itemsSalvaged = Math.floor(effectiveTime * salvageRate);

  // Simulate salvage for accumulated items
  const materials = this.simulateSalvages(itemsSalvaged);

  // Apply auto-tinker if enabled
  if (this.autoTinkerEnabled) {
    this.simulateAutoTinker(materials, effectiveTime);
  }

  return { itemsSalvaged, materials, timeProcessed: effectiveTime };
}
```

**Timer.ts**
- **Purpose**: High-precision interval management
- **Responsibilities**:
  - Frame-rate independent timing
  - Drift correction
  - Pause/resume support
- **Implementation**: Uses `setInterval` with drift compensation

#### 4. State Management (Redux)

**Store Structure:**
```typescript
interface RootState {
  player: PlayerState;
  inventory: InventoryState;
  materials: MaterialsState;
  equipment: EquipmentState;
  automation: AutomationState;
  progression: ProgressionState;
  ui: UIState;
}

interface PlayerState {
  id: string;
  level: number;
  experience: number;
  prestigeLevel: number;
  stats: PlayerStats;
}

interface AutomationState {
  salvageAutomation: {
    enabled: boolean;
    tier: number; // 0-9 (none, basic, skilled, expert, team, factory, master)
    ratePerSecond: number;
  };
  tinkerAutomation: {
    enabled: boolean;
    priority: EquipmentSlot[];
    smartMode: boolean;
  };
  queue: QueuedItem[];
  timers: ActiveTimer[];
}
```

**Redux Slices:**
1. `playerSlice.ts` - Player level, XP, prestige
2. `inventorySlice.ts` - Item management
3. `materialsSlice.ts` - Material counts and operations
4. `equipmentSlice.ts` - Equipment state and power levels
5. `automationSlice.ts` - Automation configuration and state
6. `progressionSlice.ts` - Unlocks, milestones, achievements

**Redux Middleware:**
- `automationMiddleware.ts` - Intercepts actions to trigger automation events
- `persistenceMiddleware.ts` - Debounced state saving (every 30s or on significant changes)
- `analyticsMiddleware.ts` - Tracks events for metrics

### Data Flow

**Manual Salvage Flow:**
```
User Tap → SalvageScreen.handleItemPress()
           ↓
       dispatch(salvageItem(itemId))
           ↓
       Reducer: inventory.removeItem() + materials.addMaterials()
           ↓
       Middleware: persistenceMiddleware.debounceSave()
           ↓
       UI Updates: Material counter animates, particles render
```

**Automated Salvage Flow:**
```
Timer Tick (every 1/rate seconds)
       ↓
AutomationController.processQueue()
       ↓
   Get next item from queue
       ↓
SalvageService.salvageItem(item)
       ↓
dispatch(batchSalvageComplete(results))
       ↓
Reducer: Update materials in batch
       ↓
UI: Streaming number updates (Phase 3)
```

**Offline Sync Flow:**
```
App Launch → Check last saved timestamp
       ↓
Calculate time away (now - lastSave)
       ↓
AutomationController.calculateOfflineProgress(timeAway)
       ↓
Simulate all automated actions
       ↓
dispatch(applyOfflineResults(results))
       ↓
Show "Welcome Back" modal with gains
```

## 4. API Design

### Internal APIs

Since this is a mobile game with no backend initially, all APIs are internal TypeScript modules.

**SalvageService API:**
```typescript
class SalvageService {
  /**
   * Salvages an item and returns materials
   * @param item - The item to salvage
   * @param bonuses - Active bonuses (combo, prestige, etc.)
   * @returns SalvageResult with materials and XP
   */
  salvageItem(item: Item, bonuses: Bonus[] = []): SalvageResult;

  /**
   * Calculates critical hit chance (5% base)
   * @returns boolean indicating if critical occurred
   */
  rollCritical(): boolean;

  /**
   * Applies combo multiplier based on consecutive manual salvages
   * @param comboCount - Number of recent manual salvages
   * @returns Multiplier value (1.0 - 2.0)
   */
  getComboMultiplier(comboCount: number): number;
}
```

**Automation API:**
```typescript
interface IAutomationAPI {
  // Salvage Automation
  startSalvageAutomation(tier: AutomationTier): void;
  stopSalvageAutomation(): void;
  setSalvageFilter(filter: ItemFilter): void;

  // Tinker Automation
  startAutoTinker(config: TinkerConfig): void;
  stopAutoTinker(): void;
  setPriority(slots: EquipmentSlot[]): void;
  enableSmartMode(enabled: boolean): void;

  // Queue Management
  getQueueStatus(): QueueStatus;
  clearQueue(): void;
  pauseQueue(): void;
  resumeQueue(): void;
}
```

### External Integrations

**Phase 1 (MVP):** No external integrations

**Phase 2 (Post-Launch):**
- **Analytics**: Firebase Analytics for event tracking
- **Crash Reporting**: Sentry for error monitoring
- **Cloud Save** (optional): Firebase Firestore for cross-device sync

## 5. Data Model

### Entity Design

**Item**
```typescript
interface Item {
  id: string;              // UUID
  type: ItemType;          // weapon, armor, accessory
  rarity: ItemRarity;      // common, rare, epic, legendary
  level: number;           // 1-40
  source: string;          // where it came from
  acquiredAt: number;      // timestamp
}

enum ItemRarity {
  Common = 'common',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary'
}
```

**Material**
```typescript
interface Material {
  id: string;
  rarity: ItemRarity;
  count: number;
}

// Stored as record in state:
materials: Record<ItemRarity, number>
```

**Equipment**
```typescript
interface Equipment {
  id: string;
  slot: EquipmentSlot;      // weapon, helmet, chest, legs, boots, accessory
  basePower: number;
  tinkerLevel: number;      // 0-100+
  materialsInvested: Record<ItemRarity, number>;
  totalPower: number;       // basePower + (tinkerLevel * multiplier)
}

enum EquipmentSlot {
  Weapon = 'weapon',
  Helmet = 'helmet',
  Chest = 'chest',
  Legs = 'legs',
  Boots = 'boots',
  Accessory = 'accessory'
}
```

**AutomationConfig**
```typescript
interface AutomationConfig {
  salvage: {
    enabled: boolean;
    tier: number;           // 0-9
    ratePerSecond: number;  // derived from tier
    filter: {
      autoSalvageCommon: boolean;
      autoSalvageRare: boolean;
      keepEpicPlus: boolean;
    };
  };
  tinker: {
    enabled: boolean;
    priority: EquipmentSlot[];
    smartMode: boolean;
    targetLevels: Record<EquipmentSlot, number>;
  };
}
```

**ProgressionState**
```typescript
interface ProgressionState {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  unlockedFeatures: string[];  // feature IDs
  prestigeLevel: number;
  prestigeBonuses: PrestigeBonus[];
  forgeLevel: number;
  nextForgeCycle: number;      // timestamp
}
```

### Database Schema (SQLite)

**Table: game_state**
```sql
CREATE TABLE game_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),  -- Singleton
  player_data TEXT NOT NULL,    -- JSON blob of player state
  inventory_data TEXT NOT NULL, -- JSON blob of inventory
  equipment_data TEXT NOT NULL, -- JSON blob of equipment
  automation_data TEXT NOT NULL,-- JSON blob of automation state
  last_saved_at INTEGER NOT NULL,
  version TEXT NOT NULL         -- Schema version for migrations
);
```

**Table: salvage_history** (for analytics/statistics)
```sql
CREATE TABLE salvage_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_rarity TEXT NOT NULL,
  materials_gained TEXT NOT NULL,  -- JSON array
  was_critical BOOLEAN NOT NULL,
  was_manual BOOLEAN NOT NULL,
  timestamp INTEGER NOT NULL
);

CREATE INDEX idx_salvage_timestamp ON salvage_history(timestamp);
```

**Table: progression_log**
```sql
CREATE TABLE progression_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,  -- level_up, unlock, prestige
  level INTEGER NOT NULL,
  details TEXT,              -- JSON blob
  timestamp INTEGER NOT NULL
);
```

### Data Access Patterns

**Read Patterns:**
1. **Load Game State** (on app launch)
   - Query: `SELECT * FROM game_state WHERE id = 1`
   - Frequency: Once per session
   - Cache: In-memory (Redux store)

2. **Query Salvage Statistics** (for UI displays)
   - Query: `SELECT COUNT(*), SUM(was_critical) FROM salvage_history WHERE timestamp > ?`
   - Frequency: On dashboard load
   - Cache: 60-second cache

**Write Patterns:**
1. **Save Game State** (periodic)
   - Update: `UPDATE game_state SET player_data = ?, ... WHERE id = 1`
   - Frequency: Every 30 seconds (debounced)
   - Transaction: Yes (ACID compliance)

2. **Log Salvage Event** (for analytics)
   - Insert: `INSERT INTO salvage_history (...) VALUES (...)`
   - Frequency: Every salvage (batched every 10 salvages)
   - Transaction: No (fire-and-forget)

**Caching Strategy:**
- **Primary Cache**: Redux store (in-memory)
- **Secondary Cache**: SQLite for persistence
- **Cache Invalidation**: On any state mutation
- **Write-Through**: Debounced writes to SQLite every 30s

**Data Consistency:**
- **Approach**: Optimistic UI updates with guaranteed eventual consistency
- **Conflict Resolution**: Last-write-wins (single device)
- **Validation**: Schema validation on load (Zod/Yup)

## 6. Security Design

### Authentication & Authorization

**Phase 1 (Offline-First):**
- No authentication required
- Local device storage only
- Data tied to device

**Phase 2 (Cloud Save - Optional):**
- Anonymous Firebase Auth for device-agnostic saves
- Optional email/social login for account recovery
- JWT tokens with 7-day refresh cycle

### Data Security

**Encryption at Rest:**
- Sensitive data (future IAP receipts): AES-256 via `react-native-keychain`
- Game state: Not encrypted (no sensitive PII)
- Obfuscation: JSON blobs minified

**Encryption in Transit:**
- All cloud communication over HTTPS/TLS 1.3
- Certificate pinning for production API calls

**PII Handling:**
- Minimal PII collected (device ID only for analytics)
- Compliance: GDPR/CCPA data deletion requests supported
- Analytics: Anonymized UUIDs only

**Audit Logging:**
- Critical actions logged to `progression_log` table
- IAP transactions (future) logged with receipts
- No user behavior tracking beyond aggregated analytics

### Security Controls

**Input Validation:**
```typescript
// Example: Validating material counts before tinkering
function validateTinkerRequest(materials: Material[], equipment: Equipment): boolean {
  // Prevent integer overflow
  if (materials.some(m => m.count > MAX_SAFE_INTEGER)) return false;

  // Prevent negative counts
  if (materials.some(m => m.count < 0)) return false;

  // Check player actually has materials
  const playerMaterials = store.getState().materials;
  for (const material of materials) {
    if (playerMaterials[material.rarity] < material.count) return false;
  }

  return true;
}
```

**Rate Limiting:**
- Manual salvage: Max 10/second (debounce)
- API calls (future): 100 requests/minute per device
- Prevents accidental infinite loops

**Anti-Cheat:**
- Client-side validation of all state transitions
- Server-side validation (future) for cloud saves
- Checksum validation on save file load
- Detect time manipulation for offline progress (max 24 hours)

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

**All implementation follows Red-Green-Refactor cycle:**

1. **RED**: Write failing test
2. **GREEN**: Implement minimal code to pass
3. **REFACTOR**: Clean up while keeping tests green

### Testing Framework & Tools

- **Framework**: Jest + React Native Testing Library
- **Reference**: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Mocking**: MSW for future API mocking
- **Coverage**: Target >80% for all new code

### TDD Implementation Process

#### RED Phase Example (Salvage Feature)
```typescript
// __tests__/SalvageService.test.ts
describe('SalvageService', () => {
  test('should return common materials for common item', () => {
    const service = new SalvageService();
    const commonItem: Item = {
      id: '123',
      type: ItemType.Weapon,
      rarity: ItemRarity.Common,
      level: 1
    };

    const result = service.salvageItem(commonItem);

    expect(result.materials).toHaveLength(1);
    expect(result.materials[0].rarity).toBe(ItemRarity.Common);
    expect(result.materials[0].count).toBeGreaterThan(0);
  });
});

// This test MUST fail initially (RED)
```

#### GREEN Phase Example
```typescript
// src/services/SalvageService.ts
class SalvageService {
  salvageItem(item: Item): SalvageResult {
    // Minimal implementation to pass test
    return {
      materials: [{
        id: generateId(),
        rarity: item.rarity,
        count: 1
      }],
      experience: 10
    };
  }
}

// Test now passes (GREEN)
```

#### REFACTOR Phase Example
```typescript
// Refactor after test is green
class SalvageService {
  salvageItem(item: Item, bonuses: Bonus[] = []): SalvageResult {
    const baseMaterials = this.calculateBaseMaterials(item);
    const bonusedMaterials = this.applyBonuses(baseMaterials, bonuses);
    const experience = this.calculateExperience(item);

    return {
      materials: bonusedMaterials,
      experience
    };
  }

  private calculateBaseMaterials(item: Item): Material[] {
    const baseCount = this.getBaseCountForRarity(item.rarity);
    return [{
      id: generateId(),
      rarity: item.rarity,
      count: baseCount
    }];
  }

  private getBaseCountForRarity(rarity: ItemRarity): number {
    const rarityMultipliers = {
      [ItemRarity.Common]: 1,
      [ItemRarity.Rare]: 3,
      [ItemRarity.Epic]: 10,
      [ItemRarity.Legendary]: 50
    };
    return rarityMultipliers[rarity];
  }
}

// All tests still pass (REFACTOR complete)
```

### Test Categories

#### Unit Testing (TDD First Layer)

**SalvageService Tests:**
```typescript
describe('SalvageService Unit Tests', () => {
  test('common item yields 1-3 common materials');
  test('rare item yields 3-6 rare materials');
  test('critical hit multiplies materials by 5');
  test('combo bonus increases materials by 0-100%');
  test('prestigeBonus applies correctly');
});
```

**TinkeringService Tests:**
```typescript
describe('TinkeringService Unit Tests', () => {
  test('applying materials increases equipment power');
  test('tinker level increments correctly');
  test('cannot apply more materials than player has');
  test('smart mode suggests optimal equipment');
});
```

**AutomationController Tests:**
```typescript
describe('AutomationController Unit Tests', () => {
  test('processes queue at correct rate');
  test('offline calculation matches real-time results');
  test('pausing automation stops processing');
  test('queue respects max size (10,000 items)');
});
```

#### Integration Testing (TDD Second Layer)

**Component Integration:**
```typescript
describe('SalvageScreen Integration', () => {
  test('tapping item dispatches salvage action', async () => {
    const { getByTestId } = render(<SalvageScreen />);
    const item = getByTestId('inventory-item-0');

    fireEvent.press(item);

    await waitFor(() => {
      expect(store.getState().inventory.items).toHaveLength(0);
      expect(store.getState().materials.common).toBeGreaterThan(0);
    });
  });

  test('particles animate after salvage', async () => {
    // Test particle system triggers
  });
});
```

**Redux Integration:**
```typescript
describe('Redux Store Integration', () => {
  test('salvageItem action updates inventory and materials', () => {
    const initialState = {
      inventory: { items: [testItem] },
      materials: { common: 0 }
    };

    const action = salvageItem(testItem.id);
    const newState = rootReducer(initialState, action);

    expect(newState.inventory.items).toHaveLength(0);
    expect(newState.materials.common).toBeGreaterThan(0);
  });
});
```

**Persistence Integration:**
```typescript
describe('Persistence Integration', () => {
  test('saves state after salvage with debounce', async () => {
    jest.useFakeTimers();

    dispatch(salvageItem('item-1'));

    // Should not save immediately
    expect(mockSQLite.update).not.toHaveBeenCalled();

    jest.advanceTimersByTime(30000); // 30 seconds

    // Should save after debounce
    expect(mockSQLite.update).toHaveBeenCalledTimes(1);
  });
});
```

#### End-to-End Testing (TDD Third Layer)

**Complete User Flows:**
```typescript
describe('Complete Salvage to Tinker Flow (E2E)', () => {
  test('user can salvage item and apply materials to equipment', async () => {
    // 1. User salvages item
    const { getByText, getByTestId } = render(<App />);

    const item = getByTestId('inventory-item-0');
    fireEvent.press(item);

    await waitFor(() => {
      expect(getByText(/Materials:/)).toBeTruthy();
    });

    // 2. User navigates to tinkering
    fireEvent.press(getByText('Tinkering'));

    // 3. User applies materials to equipment
    const equipment = getByTestId('equipment-weapon');
    const material = getByTestId('material-common');

    fireEvent(material, 'dragStart');
    fireEvent(equipment, 'drop');

    // 4. Channeling animation completes
    await waitFor(() => {
      expect(getByText(/Power: 101/)).toBeTruthy(); // Power increased
    }, { timeout: 3000 });
  });
});
```

### TDD Checklist for Each Component

- [ ] Test written before implementation code
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns
- [ ] Avoid testIds unless absolutely necessary (prefer user-visible queries)
- [ ] Tests query by accessible content (text, role, label)
- [ ] Async operations use `waitFor`/`findBy`
- [ ] All tests pass before moving to next feature
- [ ] Coverage >80% for component

## 8. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|--------------|---------------|
| Compute | Device CPU (iOS A12+, Android SD 660+) | On-device processing only |
| Storage | 50MB app size, <10MB user data | Minimal assets, efficient data structures |
| Memory | 150MB RAM max | Support mid-tier devices (3GB+ total RAM) |
| Network | None required (offline-first) | Zero latency for gameplay |

### Deployment Architecture

**Environment Strategy:**
- **Development**: Local simulators (iOS Simulator, Android Emulator)
- **Staging**: Internal TestFlight/Play Store Beta
- **Production**: App Store + Google Play Store

**Release Process:**
1. Code freeze + full test suite
2. Build for iOS (Xcode) + Android (Gradle)
3. Manual QA on physical devices (iPhone 12, Samsung Galaxy S21)
4. Upload to TestFlight/Internal Testing
5. Beta testing (1 week)
6. Production release (phased rollout: 10% → 50% → 100%)

### CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run lint
      - run: npm run type-check

  build-ios:
    needs: test
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx react-native bundle --platform ios

  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx react-native bundle --platform android
```

### Monitoring & Observability

#### Metrics

**Application Metrics:**
- Salvage rate (items/second) - avg, p50, p95, p99
- Material gain rate (by rarity)
- Equipment power progression over time
- Automation adoption rate (% of players per level)

**Business Metrics:**
- Daily Active Users (DAU)
- Session length (avg, median)
- Retention: Day 1, Day 7, Day 30
- Progression funnel: Phase 1 → Phase 2 → Phase 3

**Performance Metrics:**
- Frame rate (FPS) - target: 60fps sustained
- Memory usage - target: <150MB
- App size - target: <50MB download
- Crash-free rate - target: >99.5%

#### Logging

**Log Levels:**
- `ERROR`: Crashes, unhandled exceptions
- `WARN`: Recoverable errors (e.g., corrupted save file, fallback loaded)
- `INFO`: Feature unlocks, level-ups, prestige events
- `DEBUG`: State transitions (dev builds only)

**Centralized Logging:**
- Development: Console logs
- Production: Sentry for error tracking

**Log Retention:**
- Local logs: Last 7 days (rotate daily)
- Remote logs: 30 days (Sentry)

#### Alerting

| Alert | Condition | Priority | Action |
|-------|-----------|----------|--------|
| High Crash Rate | >1% crashes in 1 hour | P0 | Immediate investigation, consider rollback |
| Low FPS | <45 FPS for >50% of sessions | P1 | Performance profiling, optimize |
| Save Corruption | >0.1% load failures | P1 | Investigate save logic, add validation |
| Offline Sync Bug | >5% complaints about lost progress | P1 | Check offline calculation logic |

## 9. Scalability & Performance

### Performance Requirements

**Response Times:**
- UI interaction to visual feedback: <16ms (60fps)
- Manual salvage animation: 500ms total
- State save to disk: <500ms
- Load game on launch: <1s (cold start), <500ms (warm start)

**Throughput:**
- Manual salvage: Up to 10 items/second (player limit)
- Automated salvage: Up to 100 items/second (Level 26+)
- Particle system: 50 concurrent particles without frame drops

**Concurrent Users:**
- N/A (single-player, offline)

### Scalability Strategy

**Data Structure Optimization:**
```typescript
// Bad: O(n) lookup
interface MaterialsState {
  materials: Material[]; // Array requires iteration
}

// Good: O(1) lookup
interface MaterialsState {
  materials: Record<ItemRarity, number>; // Direct key access
}
```

**Queue Management:**
```typescript
// Use efficient deque structure for queue (add to end, remove from front)
class ItemQueue {
  private items: Item[] = [];
  private head: number = 0;

  enqueue(item: Item) {
    this.items.push(item);
  }

  dequeue(): Item | undefined {
    if (this.head >= this.items.length) return undefined;
    const item = this.items[this.head];
    this.head++;

    // Garbage collect when head reaches 1000
    if (this.head > 1000) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }

    return item;
  }
}
```

**Batch Processing:**
```typescript
// Process multiple salvages in single state update
dispatch(batchSalvage(items.slice(0, 100))); // Batch of 100
// vs
items.forEach(item => dispatch(salvageItem(item))); // 100 dispatches (slow)
```

### Performance Optimization

**Animation Optimization:**
```typescript
// Use React Native Reanimated for 60fps animations
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring
} from 'react-native-reanimated';

// Particle animation runs on UI thread (not JS thread)
const ParticleView = ({ particle }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withTiming(particle.targetY, { duration: 500 }) },
      { translateX: withTiming(particle.targetX, { duration: 500 }) },
    ],
    opacity: withTiming(0, { duration: 500 }),
  }));

  return <Animated.View style={[styles.particle, animatedStyle]} />;
};
```

**Memoization:**
```typescript
// Memoize expensive calculations
import { useMemo } from 'react';

function EquipmentPowerDisplay({ equipment }) {
  const totalPower = useMemo(() => {
    return calculateEquipmentPower(equipment); // Expensive calculation
  }, [equipment.tinkerLevel, equipment.basePower]); // Only recalc when these change

  return <Text>{totalPower}</Text>;
}
```

**Lazy Loading:**
```typescript
// Lazy load Phase 3 components (only load when unlocked)
const CommandCenter = lazy(() => import('./screens/CommandCenter'));

function MainApp({ playerLevel }) {
  return (
    <>
      {playerLevel >= 26 && (
        <Suspense fallback={<Loading />}>
          <CommandCenter />
        </Suspense>
      )}
    </>
  );
}
```

**Asset Optimization:**
- Images: WebP format (smaller than PNG)
- Animations: Lottie JSON (vector, scalable)
- Sounds: MP3 at 128kbps (balance quality/size)

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| **Offline sync bugs** (incorrect material calculation) | High | Medium | Extensive unit tests for offline logic, beta test with time manipulation | Backend Dev |
| **Performance degradation** at 100 items/sec | High | Medium | Performance profiling early, batch processing, React.memo | Frontend Dev |
| **Save file corruption** | High | Low | Schema validation on load, backup saves, rollback mechanism | Backend Dev |
| **Memory leaks** from animations | Medium | Medium | Detox tests for memory, cleanup animations properly, profiling | Frontend Dev |
| **Android fragmentation** issues | Medium | High | Test on wide range of devices, graceful degradation | QA + Dev |
| **Time-based exploits** (offline farming) | Low | High | Max 24h offline cap, checksum validation | Backend Dev |

### Dependencies

**External Dependencies:**
- React Native (v0.72+) - mobile framework
- Redux Toolkit - state management
- React Native Reanimated - animations
- React Native SQLite Storage - persistence
- AsyncStorage - settings storage

**Mitigation:**
- Lock versions in `package.json`
- Automated dependency updates (Dependabot)
- Test suite catches breaking changes

## 11. Implementation Plan (TDD-Driven)

### Development Phases

#### Phase 1: Foundation & Test Setup [2 weeks]

**Week 1: Project Setup**
- Initialize React Native project (Expo)
- Configure TypeScript, ESLint, Prettier
- Set up Jest + React Native Testing Library
- Create CI/CD pipeline (GitHub Actions)
- Set up SQLite + AsyncStorage
- Design Redux store structure

**Week 2: Core Testing Infrastructure**
- Create test utilities and custom renderers
- Mock factories for test data (items, materials, equipment)
- Set up Detox for E2E tests
- Document testing patterns in `/docs/testing-guide.md`

**Deliverables:**
- [ ] Project compiles and runs on iOS + Android
- [ ] Test suite runs successfully (0 tests initially)
- [ ] CI/CD pipeline green
- [ ] Database schema created

#### Phase 2: Phase 1 Feature Implementation (Manual Gameplay) [3 weeks]

**Week 3: Salvage System (TDD)**

**Day 1-2: Test Planning**
- Write failing tests for SalvageService
  - `test('salvages common item → 1-3 common materials')`
  - `test('salvages rare item → 3-6 rare materials')`
  - `test('critical hit multiplies by 5')`
  - `test('returns experience points')`

**Day 3-4: Implementation**
- Implement SalvageService (make tests green)
- Implement Redux slice: `materialsSlice`
- Implement Redux slice: `inventorySlice`
- Connect service to Redux

**Day 5: Integration**
- Build SalvageScreen UI component
- Wire up touch handlers
- Add particle animations (React Native Reanimated)
- E2E test: "User salvages item and sees materials"

**Week 4: Tinkering System (TDD)**

**Day 1-2: Test Planning**
- Write failing tests for TinkeringService
  - `test('applies materials to equipment')`
  - `test('increases equipment power')`
  - `test('validates material availability')`
  - `test('increments tinker level')`

**Day 3-4: Implementation**
- Implement TinkeringService (make tests green)
- Implement Redux slice: `equipmentSlice`
- Drag-and-drop UI component
- Channeling animation

**Day 5: Integration**
- Build TinkeringScreen UI
- E2E test: "User salvages and applies materials to equipment"

**Week 5: Progression & Polish**
- Implement ProgressionService (level-ups, XP)
- Implement unlock system (Level 5, 8, 10 unlocks)
- Add tutorial flow (first salvage, first tinker)
- Polish animations and haptics
- Test on physical devices

**Deliverables:**
- [ ] Manual salvage fully functional
- [ ] Tinkering system working
- [ ] Level-ups to Level 10
- [ ] 80% test coverage for Phase 1 features
- [ ] Tutorial guides new players

#### Phase 3: Phase 2 Feature Implementation (Automation) [3 weeks]

**Week 6: Salvage Automation**

**TDD Approach:**
- Write tests for AutomationController
  - `test('processes queue at correct rate')`
  - `test('respects automation tier speed')`
  - `test('stops when queue empty')`
  - `test('applies filters correctly')`

**Implementation:**
- Build AutomationController with timer system
- Implement automation tier unlocks (Level 11, 13, 15, 18, 22)
- Build automation UI controls
- Queue visualization component

**Week 7: Tinker Automation**

**TDD Approach:**
- Write tests for auto-tinker logic
  - `test('auto-tinkers when materials available')`
  - `test('respects priority order')`
  - `test('smart mode suggests optimal target')`

**Implementation:**
- Auto-tinker toggle
- Priority system UI
- Smart mode AI (simple heuristic: lowest power equipment first)

**Week 8: Hybrid Features**

**Implementation:**
- Combo system for manual salvages
- Critical hit visuals
- Material refinement system (Level 15)
- Salvage filters (Level 18)
- Phase 2 UI evolution (dashboard)

**Deliverables:**
- [ ] Automation unlocks at correct levels
- [ ] Hybrid gameplay (manual + auto)
- [ ] Auto-tinker functional
- [ ] 80% test coverage for Phase 2 features

#### Phase 4: Phase 3 Feature Implementation (Full Automation) [3 weeks]

**Week 9: Full Automation & Offline**

**TDD Approach:**
- Write tests for offline sync
  - `test('calculates 1 hour offline correctly')`
  - `test('caps at 24 hours')`
  - `test('applies auto-tinker during offline')`
  - `test('shows accurate "Welcome Back" summary')`

**Implementation:**
- Offline calculation algorithm
- Master Salvager (Level 26)
- Grand Tinkermaster (Level 30)
- 10,000-item queue support

**Week 10: Prestige & Forge**

**Implementation:**
- Prestige system (Level 35)
- Prestige bonus selection UI
- Forge mastery cycles (Level 40)
- Clicking endgame features (God Click, Perfect Salvage, Master's Touch)

**Week 11: Command Center & Optimization**

**Implementation:**
- Command Center UI
- Real-time statistics streaming
- Efficiency metrics
- Advanced settings panel
- Phase 3 UI evolution

**Deliverables:**
- [ ] Full automation working
- [ ] Offline sync accurate
- [ ] Prestige system functional
- [ ] Command Center complete
- [ ] 80% test coverage for Phase 3

#### Phase 5: Polish, Balance & Launch Prep [2 weeks]

**Week 12: Balancing**
- Play test extensively
- Adjust progression pacing (target: 15-20 hours to Level 30)
- Balance automation unlock times
- Tune material drop rates

**Week 13: Launch Prep**
- App Store assets (screenshots, video)
- Privacy policy + terms
- App Store Optimization (ASO)
- Beta testing (TestFlight/Play Store Beta)
- Performance optimization pass
- Final QA

**Deliverables:**
- [ ] Game balanced and fun
- [ ] No critical bugs
- [ ] App Store submission ready
- [ ] Analytics integrated

### Technical Milestones

| Milestone | Deliverable | Target Date | Dependencies |
|-----------|------------|-------------|--------------|
| M1: Foundation Complete | Project runs, tests pass, DB set up | Week 2 | None |
| M2: Phase 1 Playable | Manual salvage + tinkering works | Week 5 | M1 |
| M3: Phase 2 Playable | Automation + hybrid features work | Week 8 | M2 |
| M4: Phase 3 Playable | Full automation + prestige | Week 11 | M3 |
| M5: Beta Ready | Polished, balanced, tested | Week 13 | M4 |
| M6: Launch | Live on App Store + Play Store | Week 14 | M5 |

**Total Timeline: 14 weeks (~3.5 months)**

## 12. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| **Mobile Framework** | React Native, Flutter, Native (Swift/Kotlin) | React Native | Faster development, shared codebase, strong ecosystem |
| **State Management** | Redux, MobX, Zustand, Context API | Redux Toolkit | Predictable, great DevTools, middleware support |
| **Persistence** | AsyncStorage only, SQLite only, Realm | AsyncStorage + SQLite | AsyncStorage for settings, SQLite for game state (structured queries) |
| **Animation Library** | React Native Animated, Reanimated, Lottie | Reanimated v2 | 60fps on UI thread, best performance |
| **Offline-First** | Cloud-first, Offline-first, Hybrid | Offline-first | Core to gameplay, no latency, works anywhere |

### Trade-offs

**Trade-off 1: Offline-First vs Cloud-First**
- **Chose**: Offline-first
- **Over**: Cloud-first with real-time sync
- **Because**:
  - Zero latency for gameplay (critical for clicker genre)
  - Works without internet (better UX)
  - Simpler architecture (no backend initially)
  - Cloud save can be added later without refactoring
- **Accepted Limitation**: No cross-device sync at launch

**Trade-off 2: React Native vs Native**
- **Chose**: React Native
- **Over**: Native Swift/Kotlin
- **Because**:
  - 50% faster development (shared codebase)
  - Easier to iterate and test
  - Good enough performance for this game type
  - Larger talent pool (JavaScript developers)
- **Accepted Limitation**: Slightly larger app size (~5MB overhead)

**Trade-off 3: Automated Testing Coverage**
- **Chose**: 80% coverage target
- **Over**: 100% coverage
- **Because**:
  - Diminishing returns above 80%
  - UI tests are brittle and expensive
  - Focus on critical paths and business logic
- **Accepted Limitation**: Some edge cases untested

## 13. Open Questions

Technical questions requiring resolution:

- [ ] **Particle System Performance**: Can we render 50 particles at 60fps on low-end Android (SD 660)?
  - **Action**: Prototype particle system, test on target devices
  - **Owner**: Frontend Dev
  - **Due**: Week 3

- [ ] **Offline Sync Edge Cases**: How do we handle device time changes (user manipulates clock)?
  - **Action**: Implement server time check (future), cap offline at 24h for now
  - **Owner**: Backend Dev
  - **Due**: Week 9

- [ ] **Memory Usage at Scale**: How does memory grow with 10,000 queued items?
  - **Action**: Stress test with 10k items, profile memory
  - **Owner**: Performance Engineer
  - **Due**: Week 9

- [ ] **Accessibility**: How do we make particle effects accessible for visually impaired players?
  - **Action**: Research screen reader announcements, haptic alternatives
  - **Owner**: UX Designer + Frontend Dev
  - **Due**: Week 11

## 14. Appendices

### A. Technical Glossary

- **TDD (Test-Driven Development)**: Development methodology where tests are written before implementation
- **Redux**: Predictable state container for JavaScript apps
- **React Native Reanimated**: Animation library running animations on native UI thread
- **SQLite**: Embedded relational database
- **AsyncStorage**: Key-value storage for React Native
- **Prestige**: Mechanic where players reset progress for permanent bonuses
- **FPS (Frames Per Second)**: Measure of animation smoothness (target: 60)
- **Offline-First**: Architecture pattern prioritizing offline functionality

### B. Reference Architecture

**Similar Systems:**
- **Adventure Capitalist**: Idle game with progressive automation
- **Cookie Clicker**: Manual clicking with automation unlocks
- **Realm Grinder**: Prestige system with meta-progression
- **Melvor Idle**: Offline progression with queue management

**Architectural Patterns:**
- **Redux**: https://redux.js.org/tutorials/essentials/part-1-overview-concepts
- **Offline-First**: https://offlinefirst.org/
- **React Native Performance**: https://reactnative.dev/docs/performance

### C. Proof of Concepts

**POC 1: Particle System Performance**
- **Goal**: Validate 50 particles at 60fps
- **Status**: Not started
- **Timeline**: Week 3

**POC 2: Offline Calculation Accuracy**
- **Goal**: Ensure offline sync matches real-time play
- **Status**: Not started
- **Timeline**: Week 8

### D. Related Documents

- **Product Requirements Document**: `/workflow-outputs/20251106_075419/prd_20251106.extracted.md`
- **Testing Guide**: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **React Native Setup**: `/docs/setup/react-native-setup.md` (TBD)
- **Architecture Decision Records**: `/docs/adr/` (TBD)

---

*Generated from PRD: prd_20251106.extracted.md*
*Generation Date: 2025-11-06*
*TDD Version: 1.0*
