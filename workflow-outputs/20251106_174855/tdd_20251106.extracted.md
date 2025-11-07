# Salvage & Tinkering System - Technical Design Document

## Document Control
| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude Agent | 2025-11-06 | Draft | Initial TDD from PRD |

## Executive Summary

This Technical Design Document specifies the implementation of a progressive automation system for salvaging items and tinkering with equipment in a React Native idle/incremental game. The system transitions players from manual clicking (Levels 1-10) through hybrid automation (Levels 11-25) to full automation (Level 26+), following proven idle game patterns where each automation unlock feels earned and impactful rather than removing gameplay engagement.

**Core Technical Philosophy**: Build a performant, scalable state machine that processes up to 100 items/second while maintaining 60fps UI responsiveness, supporting offline progression up to 24 hours, and enabling seamless transitions between manual, hybrid, and fully automated gameplay modes.

## 1. Overview & Context

### Problem Statement

Idle/incremental games face a fundamental design challenge: players crave both the tactile satisfaction of manual actions (clicking/tapping) and the optimization depth of automation systems. Implementing automation too early removes satisfying gameplay; implementing it too late causes player frustration and abandonment. The technical challenge is to create a state machine and UI system that gracefully transitions between three distinct gameplay modes while maintaining performance, fairness (anti-cheat), and player satisfaction.

### Solution Approach

We will implement a **tick-based automation engine** with three progressive automation tiers, each with distinct technical characteristics:

1. **Phase 1 (Levels 1-10)**: Manual actions with immediate visual feedback - optimized for responsiveness and satisfaction
2. **Phase 2 (Levels 11-25)**: Hybrid automation with manual boost mechanics - balanced tick rates and event-driven bonuses
3. **Phase 3 (Level 26+)**: Full automation with optimization tools - high-throughput processing and offline calculation

The technical foundation uses React Native with Zustand for state management, React Native Reanimated for 60fps animations, and a custom tick-based automation engine that can be paused, resumed, and serialized for offline progression.

### Success Criteria

**Performance Benchmarks**:
- UI maintains 60fps with 100 items/second automation rate
- Animation frame drops < 1% of total frames
- Load time < 3 seconds on iPhone 11 / Samsung Galaxy S10 equivalent
- Memory usage < 150MB on mobile devices
- Auto-save completes in < 100ms

**Functional Completeness**:
- All three progression phases implemented with distinct mechanics
- Offline progression accurate to within 1% of real-time gains (up to 24hr)
- Save data corruption rate < 0.01%
- Zero exploitable progression skips or duplication bugs

## 2. Requirements Analysis

### Functional Requirements

#### Phase 1 Requirements (Levels 1-10)
**Primary Focus**: Responsive click mechanics with satisfying feedback

- **FR-P1-001**: Manual salvaging with 0.5s animation, particle effects, material collection
- **FR-P1-002**: Material tracking system (Common, Rare, Epic tiers with persistence)
- **FR-P1-003**: Manual tinkering with 2s channeling, 100% success rate, visible +1 upgrades
- **FR-P1-004**: Auto-collect unlock at Level 5 (materials auto-fly after 0.5s)
- **FR-P1-005**: Batch select at Level 8 (multi-select with "Salvage All" button)
- **FR-P1-006**: First Salvage Assistant at Level 10 (1 item/3sec automation)

**Technical Implication**: Need gesture recognition, animation pooling, and low-latency state updates.

#### Phase 2 Requirements (Levels 11-25)
**Primary Focus**: Automation progression with manual bonuses

- **FR-P2-001**: Five-tier salvage automation (1 item/3s → 10 items/s)
- **FR-P2-002**: Auto-tinker system with player-set targets
- **FR-P2-003**: Priority queue system for automated tinkering
- **FR-P2-004**: Smart AI suggestions for material distribution
- **FR-P2-005**: Hybrid bonuses (2x manual speed, combos, 5% critical chance)
- **FR-P2-006**: Material refinement (3 common → 1 rare, auto-refiner at Level 20)
- **FR-P2-007**: Salvage filters (rarity/type-based auto-salvage rules)

**Technical Implication**: Need priority queue data structure, combo detection system, and rule engine for filters.

#### Phase 3 Requirements (Levels 26+)
**Primary Focus**: Full automation with optimization depth

- **FR-P3-001**: Master Salvager (100 items/sec, 10k queue, offline progression)
- **FR-P3-002**: Grand Tinkermaster (simultaneous equipment management, AI optimization)
- **FR-P3-003**: Prestige system (every 1000 items = choice of 3 bonuses)
- **FR-P3-004**: Forge Mastery (2hr cycle with massive power spikes)
- **FR-P3-005**: Endgame clicking (God Click 1000 items/1hr CD, Perfect Salvage 50% legendary, Master's Touch)

**Technical Implication**: Need high-throughput processing, offline calculation algorithm, and bonus stacking system.

### Non-Functional Requirements

**NFR-001: Performance**
- 60fps at 100 items/sec processing
- < 1% frame drops
- < 3s load time
- < 150MB memory

**NFR-002: Offline Progression**
- Accurate calculation up to 24 hours
- Reasonable caps to prevent exploitation
- Summary screen on return

**NFR-003: Save Data Integrity**
- Auto-save every 30 seconds
- Cloud backup every 5 minutes
- Corruption detection with rollback
- Never lose > 30 seconds of progress

**NFR-004: Accessibility**
- Screen reader support
- Colorblind-friendly materials
- Adjustable text size
- Optional reduced motion
- 44x44pt touch targets

**NFR-005: Localization Ready**
- English at launch
- Architecture supports additional languages
- Locale-aware number formatting

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native UI Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Phase 1    │  │   Phase 2    │  │   Phase 3    │      │
│  │  Manual UI   │  │  Hybrid UI   │  │  Auto UI     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┴──────────────────┘               │
│                            │                                  │
├────────────────────────────┼──────────────────────────────────┤
│                    Zustand State Store                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  materials: MaterialState                            │   │
│  │  equipment: EquipmentState                           │   │
│  │  automation: AutomationState                         │   │
│  │  progression: ProgressionState                       │   │
│  │  prestige: PrestigeState                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                  │
├────────────────────────────┼──────────────────────────────────┤
│                    Business Logic Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Salvage     │  │  Tinkering   │  │  Automation  │      │
│  │  Engine      │  │  Engine      │  │  Engine      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┴──────────────────┘               │
│                            │                                  │
├────────────────────────────┼──────────────────────────────────┤
│                     Core Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Tick        │  │  Save/Load   │  │  Offline     │      │
│  │  Manager     │  │  Service     │  │  Calculator  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├───────────────────────────────────────────────────────────────┤
│                    External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Firebase/   │  │  RevenueCat  │  │  Analytics   │      │
│  │  Supabase    │  │  (IAP)       │  │  (Mixpanel)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────────────────────────────────────────┘
```

### Component Design

#### Salvage Engine
- **Purpose**: Process item salvaging (manual and automated)
- **Responsibilities**:
  - Execute salvage operations with configurable rates
  - Apply bonuses (manual 2x, critical 5% chance, combos)
  - Generate materials based on item rarity and bonuses
  - Trigger particle effects and animations
  - Track salvage statistics for prestige system
- **Interfaces**:
  - `salvageItem(itemId: string, isManual: boolean): MaterialReward`
  - `salvageBatch(itemIds: string[]): MaterialReward[]`
  - `getComboMultiplier(): number`
  - `applyCriticalChance(): boolean`
- **Dependencies**: MaterialStore, AutomationEngine, AnimationPool

#### Tinkering Engine
- **Purpose**: Apply materials to equipment for upgrades
- **Responsibilities**:
  - Validate material availability
  - Calculate upgrade cost and success rate
  - Apply upgrades to equipment (Phase 1: 100%, Phase 2+: configurable)
  - Manage priority queue for auto-tinkering
  - Execute AI suggestions for optimal distribution
- **Interfaces**:
  - `tinkerEquipment(equipId: string, materials: Materials): UpgradeResult`
  - `autoTinker(priorities: EquipmentPriority[]): void`
  - `getSuggestion(): TinkeringSuggestion`
  - `setManualOverride(equipId: string): void`
- **Dependencies**: MaterialStore, EquipmentStore, AutomationEngine

#### Automation Engine
- **Purpose**: Manage tick-based automation processing
- **Responsibilities**:
  - Execute salvage/tinkering operations at configured rates
  - Manage automation unlock progression (Level 10 → 26)
  - Handle automation speed multipliers
  - Serialize/deserialize automation state for offline calculations
  - Enforce queue limits (10k items for Level 26+)
- **Interfaces**:
  - `start(): void`
  - `stop(): void`
  - `setRate(itemsPerSecond: number): void`
  - `tick(deltaTime: number): void`
  - `getState(): AutomationState`
- **Dependencies**: TickManager, SalvageEngine, TinkeringEngine

#### Tick Manager
- **Purpose**: Central game loop coordinator
- **Responsibilities**:
  - Maintain 60fps game loop using requestAnimationFrame
  - Calculate delta time for frame-independent updates
  - Dispatch tick events to all subscribed systems
  - Throttle non-critical updates (analytics, save) to reduce overhead
- **Interfaces**:
  - `subscribe(callback: (deltaTime: number) => void): UnsubscribeFn`
  - `start(): void`
  - `pause(): void`
  - `resume(): void`
- **Dependencies**: None (core service)

#### Save/Load Service
- **Purpose**: Persist and restore player state
- **Responsibilities**:
  - Serialize Zustand store to JSON
  - Compress data using LZ-string
  - Save to AsyncStorage (local) and Firebase/Supabase (cloud)
  - Validate save data integrity using checksums
  - Rollback to previous save on corruption
  - Auto-save every 30 seconds
- **Interfaces**:
  - `saveLocal(): Promise<void>`
  - `saveCloud(): Promise<void>`
  - `load(): Promise<PlayerState>`
  - `validateSave(data: string): boolean`
  - `rollback(): Promise<PlayerState>`
- **Dependencies**: AsyncStorage, Firebase/Supabase, Zustand

#### Offline Calculator
- **Purpose**: Calculate progression during offline time
- **Responsibilities**:
  - Read last save timestamp
  - Calculate elapsed time (capped at 24 hours)
  - Simulate automation ticks at saved rates
  - Apply offline bonuses (if purchased)
  - Cap offline gains at reasonable limits (e.g., 2x of 1hr active play)
  - Generate summary report for UI display
- **Interfaces**:
  - `calculateOfflineGains(lastSave: timestamp): OfflineGains`
  - `applyCap(gains: OfflineGains, maxMultiplier: number): OfflineGains`
  - `getSummary(gains: OfflineGains): OfflineSummary`
- **Dependencies**: AutomationEngine, SalvageEngine, TinkeringEngine

### Data Flow

#### Sequence Diagram: Manual Salvage Click (Phase 1)
```
Player          UI Component    Salvage Engine    Material Store    Animation Pool
  │                  │                  │                  │                  │
  ├─ Click Item ────>│                  │                  │                  │
  │                  ├─ salvageItem() ──>│                  │                  │
  │                  │                  ├─ Generate Materials │                │
  │                  │                  ├─ addMaterials() ─>│                  │
  │                  │                  │                  ├─ Update Count    │
  │                  │                  ├─ spawnParticles()─────────────────>│
  │                  │                  │                  │                  ├─ Play Animation
  │                  │<── MaterialReward ┤                  │                  │
  │                  ├─ Update UI ──────┤                  │                  │
  │<─ Visual Feedback ┤                  │                  │                  │
```

#### Sequence Diagram: Automated Salvage (Phase 3)
```
Tick Manager    Automation Engine    Salvage Engine    Material Store    UI Component
  │                  │                  │                  │                  │
  ├─ tick(dt) ──────>│                  │                  │                  │
  │                  ├─ accumulator += dt│                  │                  │
  │                  ├─ while(accumulator >= tickRate) {   │                  │
  │                  ├─── salvageItem()─>│                  │                  │
  │                  │                  ├─ Generate Materials │                │
  │                  │                  ├─ addMaterials()─>│                  │
  │                  │                  │                  ├─ Batch Update    │
  │                  ├─ } (process batch)│                  │                  │
  │                  │                  │                  ├─ notify subscribers │
  │                  │                  │                  │                  │<─ Batch Render
```

## 4. API Design

### Internal APIs

#### SalvageEngine API

| Method | Parameters | Returns | Purpose |
|--------|-----------|---------|---------|
| `salvageItem` | `itemId: string, isManual: boolean` | `Promise<MaterialReward>` | Process single item salvage with bonuses |
| `salvageBatch` | `itemIds: string[]` | `Promise<MaterialReward[]>` | Process multiple items (for batch select) |
| `getComboMultiplier` | `recentClicks: number` | `number` | Calculate combo bonus (10 clicks = speed burst) |
| `applyCriticalChance` | `isManual: boolean` | `boolean` | Roll for 5% critical hit on manual salvage |
| `getSalvageStats` | - | `SalvageStatistics` | Get stats for prestige system (items salvaged, etc) |

#### TinkeringEngine API

| Method | Parameters | Returns | Purpose |
|--------|-----------|---------|---------|
| `tinkerEquipment` | `equipId: string, materials: Materials, isManual: boolean` | `Promise<UpgradeResult>` | Apply materials to equipment |
| `autoTinker` | `priorities: EquipmentPriority[]` | `void` | Start auto-tinkering with priority queue |
| `stopAutoTinker` | - | `void` | Stop automated tinkering |
| `getSuggestion` | `availableMaterials: Materials` | `TinkeringSuggestion` | AI-generated optimal distribution |
| `setManualOverride` | `equipId: string` | `void` | Override auto for specific equipment |
| `getPriorities` | - | `EquipmentPriority[]` | Get current priority order |
| `updatePriorities` | `priorities: EquipmentPriority[]` | `void` | Update priority queue |

#### AutomationEngine API

| Method | Parameters | Returns | Purpose |
|--------|-----------|---------|---------|
| `start` | - | `void` | Start automation engine |
| `stop` | - | `void` | Stop automation engine |
| `setRate` | `itemsPerSecond: number` | `void` | Update salvage rate (based on unlocks) |
| `tick` | `deltaTime: number` | `void` | Process automation tick |
| `getState` | - | `AutomationState` | Get current automation settings |
| `serialize` | - | `string` | Serialize for save/offline calc |
| `deserialize` | `state: string` | `void` | Restore from save |

### External Integrations

#### Firebase/Supabase Cloud Saves

**Endpoint**: `/api/saves`

- **POST /api/saves**: Upload compressed save data
  - Auth: Bearer token (Firebase Auth / Supabase Auth)
  - Body: `{ userId: string, saveData: string (compressed), timestamp: number, checksum: string }`
  - Response: `{ success: boolean, saveId: string }`

- **GET /api/saves/:userId**: Retrieve latest save
  - Auth: Bearer token
  - Response: `{ saveData: string, timestamp: number, checksum: string }`

- **GET /api/saves/:userId/history**: Get save history (last 5 saves)
  - Auth: Bearer token
  - Response: `{ saves: Array<{ saveId: string, timestamp: number }> }`

#### RevenueCat IAP

**SDK Integration**: RevenueCat React Native SDK

- `Purchases.setDebugLogsEnabled(true)`: Enable logging
- `Purchases.getOfferings()`: Fetch available IAP products
- `Purchases.purchasePackage(package)`: Process purchase
- `Purchases.getCustomerInfo()`: Check entitlements (VIP Pass, permanent purchases)
- `Purchases.restorePurchases()`: Restore previous purchases

#### Mixpanel Analytics

**Events Tracked**:

| Event Name | Properties | Trigger |
|-----------|-----------|---------|
| `salvage_item` | `{isManual, itemRarity, criticalHit, comboActive}` | Every salvage action |
| `tinker_equipment` | `{equipId, materialCost, isManual, upgradeLevel}` | Every tinkering action |
| `automation_unlocked` | `{automationLevel, itemsPerSecond}` | When automation tier unlocks |
| `prestige_triggered` | `{itemsSalvaged, bonusChosen, previousBonuses}` | When prestige activates |
| `offline_return` | `{timeOffline, materialsEarned, itemsSalvaged}` | When player returns after offline |
| `iap_purchase` | `{productId, priceUSD, phase}` | When purchase completes |

## 5. Data Model

### Entity Design

#### PlayerState (Root Entity)
```typescript
interface PlayerState {
  playerId: string;
  level: number;                    // Current player level (1-40+)
  experience: number;               // XP towards next level
  materials: MaterialInventory;     // Current material counts
  equipment: Equipment[];           // All equipment pieces
  automation: AutomationState;      // Automation configuration
  prestige: PrestigeState;          // Prestige progress and bonuses
  stats: PlayerStatistics;          // Lifetime stats
  settings: PlayerSettings;         // UI/accessibility settings
  lastSaveTimestamp: number;        // Unix timestamp (ms)
  totalPlayTime: number;            // Total play time (seconds)
}
```

#### MaterialInventory
```typescript
interface MaterialInventory {
  common: number;                   // Common materials (abundant)
  rare: number;                     // Rare materials (regular drops)
  epic: number;                     // Epic materials (exciting drops)
  legendary: number;                // Legendary materials (game-changing)
}
```

#### Equipment
```typescript
interface Equipment {
  id: string;                       // Unique equipment ID
  name: string;                     // Display name
  type: EquipmentType;              // 'weapon' | 'armor' | 'accessory'
  upgradeLevel: number;             // Current +level
  powerLevel: number;               // Calculated power
  tinkeringCost: Materials;         // Cost for next upgrade
  maxUpgradeLevel?: number;         // Optional cap (can exceed with Master's Touch)
  isAutoTinkerTarget: boolean;      // Auto-tinkering enabled
  priority: number;                 // Priority in auto-tinker queue (1 = highest)
}
```

#### AutomationState
```typescript
interface AutomationState {
  salvageSpeed: number;             // Items per second (0.33 at L10 → 100 at L26)
  salvageQueueSize: number;         // Max queue capacity (increases with level)
  autoTinkerEnabled: boolean;       // Auto-tinkering toggle
  priorities: EquipmentPriority[];  // Priority order for auto-tinkering
  filters: SalvageFilter[];         // Auto-salvage rules
  refineRulesEnabled: boolean;      // Auto-refinement toggle
  offlineProgressionEnabled: boolean; // Offline gains enabled (L26+)

  // Unlocks (tied to player level)
  unlocks: {
    autoCollect: boolean;           // L5
    batchSelect: boolean;           // L8
    salvageAssistant: boolean;      // L10
    autoTinker: boolean;            // L12
    materialRefinement: boolean;    // L15
    prioritySystem: boolean;        // L16
    salvageFilters: boolean;        // L18
    autoRefiner: boolean;           // L20
    smartTinkering: boolean;        // L20
    masterSalvager: boolean;        // L26
    grandTinkermaster: boolean;     // L30
    prestigeSalvaging: boolean;     // L35
    forgeMastery: boolean;          // L40
  };
}
```

#### PrestigeState
```typescript
interface PrestigeState {
  itemsSalvagedSinceLastPrestige: number;  // Resets to 0 after prestige
  totalPrestigesCompleted: number;         // Lifetime prestige count
  activePrestigeBonuses: PrestigeBonus[];  // Currently active bonuses with expiry
  availablePrestigeTokens: number;         // Premium currency for extra choices

  // Prestige bonus options
  bonusOptions: {
    materialBoost: { multiplier: 1.1, duration: 3600000 }, // +10% for 1 hour
    guaranteedRare: { count: 100, duration: null },        // Next 100 salvages
    tinkerSpeedBoost: { multiplier: 2.0, duration: 1800000 }, // 2x for 30 min
  };
}
```

#### PrestigeBonus
```typescript
interface PrestigeBonus {
  type: 'materialBoost' | 'guaranteedRare' | 'tinkerSpeedBoost';
  multiplier?: number;                // For materialBoost, tinkerSpeedBoost
  remainingCount?: number;            // For guaranteedRare
  expiresAt?: number;                 // Unix timestamp (ms), null for count-based
  appliedAt: number;                  // When bonus was activated
}
```

#### PlayerStatistics
```typescript
interface PlayerStatistics {
  totalItemsSalvaged: number;
  totalItemsSalvagedManually: number;
  totalMaterialsEarned: MaterialInventory;
  totalTinkerings: number;
  totalManualTinkerings: number;
  criticalHitsTriggered: number;
  combosTriggered: number;
  prestigesCompleted: number;
  godClicksUsed: number;
  offlineSessionsCount: number;
  totalOfflineTime: number;           // Seconds spent offline
}
```

### Database Schema

**Local Storage (AsyncStorage)**:
- Key: `playerState_${playerId}`
- Value: Compressed JSON string of `PlayerState`
- Size estimate: ~50KB compressed, ~200KB uncompressed

**Cloud Storage (Firebase Firestore / Supabase PostgreSQL)**:

#### Firestore Schema
```
/users/{userId}
  /saves/{saveId}
    - saveData: string (compressed)
    - timestamp: number
    - checksum: string
    - version: string
  /latest
    - saveData: string
    - timestamp: number
    - checksum: string
```

#### Supabase PostgreSQL Schema
```sql
CREATE TABLE player_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  save_data TEXT NOT NULL,  -- Compressed JSON
  checksum VARCHAR(64) NOT NULL,
  version VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_user_created (user_id, created_at DESC)
);

CREATE TABLE player_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  event_properties JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_user_event (user_id, event_name, created_at)
);
```

### Data Access Patterns

**Common Queries**:
1. **Load Player State**: AsyncStorage.getItem → Decompress → Parse JSON
2. **Save Player State**: JSON.stringify → Compress → AsyncStorage.setItem + Cloud backup
3. **Calculate Offline Gains**: Load last save → Calculate elapsed time → Simulate automation
4. **Update Materials**: Zustand store update → Debounced save trigger (30s)
5. **Priority Queue Update**: Sort equipment by priority → Auto-tinker uses sorted order

**Caching Strategy**:
- **In-Memory Cache**: Zustand store holds entire game state (< 150MB)
- **AsyncStorage Cache**: Persists immediately on critical actions (save, unlock, purchase)
- **Cloud Cache**: Debounced updates every 5 minutes to reduce API calls

**Data Consistency Approach**:
- **Optimistic Updates**: UI updates immediately, background save catches up
- **Eventual Consistency**: Cloud saves lag by up to 5 minutes, acceptable for single-player game
- **Conflict Resolution**: Last-write-wins (player always on single device in session)

## 6. Security Design

### Authentication & Authorization

**Authentication Method**: Firebase Authentication (Anonymous + Optional Email/Social)

- **Anonymous Auth**: Players start with anonymous Firebase UID for cloud saves
- **Email/Social Upgrade**: Optional upgrade to email/Google/Apple for account recovery
- **Session Management**: Firebase SDK handles token refresh automatically

**Authorization Model**: No authorization needed (single-player game, all data is player-owned)

### Data Security

**Encryption at Rest**:
- **Local Storage**: Rely on OS-level encryption (iOS Keychain, Android Keystore for sensitive data)
- **Cloud Storage**: Firestore/Supabase encrypts data at rest by default

**Encryption in Transit**:
- **TLS/HTTPS**: All API calls to Firebase/Supabase use HTTPS
- **Certificate Pinning**: Not implemented initially (can add for V2)

**PII Handling**:
- **No PII Collected**: Only anonymous user ID, play statistics, and in-game data
- **GDPR/CCPA Compliance**: Provide data export and account deletion in settings

**Audit Logging**:
- **What's Logged**: IAP purchases, prestige events, major progression milestones
- **Retention**: 90 days in Firestore, then archived to Cloud Storage
- **Access**: Developers only, for fraud detection and support

### Security Controls

**Input Validation**:
- **Client-side**: Validate all user actions (salvage valid item, tinker with available materials)
- **Server-side**: Validate IAP receipts with RevenueCat webhooks

**Rate Limiting**:
- **Manual Actions**: No rate limit (encourage engagement)
- **Automation**: Enforced by tick rate (max 100 items/sec at L26)
- **API Calls**: Firebase SDK handles rate limits automatically

**CORS Policies**: N/A (mobile app, not web)

**Security Headers**: N/A (mobile app, not web)

**Anti-Cheat Measures**:
1. **Progression Rate Limits**: Detect impossible progression speeds (e.g., L1 → L40 in 1 minute)
2. **Save Data Checksums**: Detect save file tampering
3. **Sanity Checks**: Validate material counts don't exceed reasonable limits (e.g., 1B materials in 1 hour)
4. **Server-side IAP Validation**: All purchases verified through RevenueCat webhooks

**Exploit Prevention**:
- **Time Manipulation**: Offline calculator caps gains at 24 hours, validates device time isn't in future
- **Duplication**: Save data includes incrementing save ID, reject duplicate saves
- **Memory Editing**: Obfuscate critical values (XOR with random key, re-validate on critical actions)

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools
- **Framework**: React Native Testing Library
- **Reference**: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Test Runner**: Jest with React Native preset
- **Mocking**: MSW for API mocking, Jest mocks for modules
- **Coverage Tool**: Istanbul (built into Jest)

#### TDD Implementation Process

For each feature/component, follow this strict order:

**1. RED Phase - Write Failing Test First**
```typescript
// Example: Test for salvage engine
describe('SalvageEngine', () => {
  test('should generate common materials when salvaging a common item', () => {
    const item = { id: '1', rarity: 'common' };
    const result = salvageEngine.salvageItem(item, false);

    expect(result.materials.common).toBeGreaterThan(0);
    expect(result.materials.rare).toBe(0);
  });
});
// This test MUST fail initially (salvageEngine not implemented yet)
```

**2. GREEN Phase - Minimal Implementation**
```typescript
// salvageEngine.ts
export const salvageEngine = {
  salvageItem(item: Item, isManual: boolean): MaterialReward {
    // ONLY enough code to pass the test
    return {
      materials: {
        common: item.rarity === 'common' ? 5 : 0,
        rare: 0,
        epic: 0,
        legendary: 0,
      },
    };
  },
};
```

**3. REFACTOR Phase - Improve Code**
- Extract magic numbers to constants
- Add rarity-based material tables
- Improve readability
- **Maintain all green tests**

#### Test Categories (in order of implementation)

### Unit Testing (TDD First Layer)

**Component Tests**:
```typescript
// MaterialCounter.test.tsx
test('should display material count', () => {
  render(<MaterialCounter count={123} type="common" />);
  expect(screen.getByText('123')).toBeTruthy();
});

test('should animate when count increases', async () => {
  const { rerender } = render(<MaterialCounter count={100} type="common" />);
  rerender(<MaterialCounter count={150} type="common" />);

  await waitFor(() => {
    expect(screen.getByText('150')).toBeTruthy();
  });
});
```

**Engine Logic Tests**:
```typescript
// SalvageEngine.test.ts
test('should apply 2x multiplier for manual salvage', () => {
  const item = { id: '1', rarity: 'common', baseMaterials: 10 };
  const manualResult = salvageEngine.salvageItem(item, true);
  const autoResult = salvageEngine.salvageItem(item, false);

  expect(manualResult.materials.common).toBe(20);
  expect(autoResult.materials.common).toBe(10);
});

test('should trigger critical hit 5% of the time (statistical test)', () => {
  const item = { id: '1', rarity: 'common' };
  const trials = 1000;
  let criticalHits = 0;

  for (let i = 0; i < trials; i++) {
    const result = salvageEngine.salvageItem(item, true);
    if (result.isCritical) criticalHits++;
  }

  // Allow 3-7% range due to randomness (95% confidence interval)
  expect(criticalHits).toBeGreaterThan(30);
  expect(criticalHits).toBeLessThan(70);
});
```

**State Management Tests**:
```typescript
// materialStore.test.ts
test('should add materials to inventory', () => {
  const { result } = renderHook(() => useMaterialStore());

  act(() => {
    result.current.addMaterials({ common: 100, rare: 10, epic: 1, legendary: 0 });
  });

  expect(result.current.materials.common).toBe(100);
  expect(result.current.materials.rare).toBe(10);
  expect(result.current.materials.epic).toBe(1);
});
```

**Coverage target**: > 80% for new code

**Testing approach**: Test behavior, not implementation details

### Integration Testing (TDD Second Layer)

**Component Integration**:
```typescript
// SalvageFlow.test.tsx
test('should complete full salvage flow from click to material collection', async () => {
  const mockItem = { id: '1', rarity: 'common' };
  const { getByTestId, getByText } = render(<SalvageScreen items={[mockItem]} />);

  // Click item to salvage
  fireEvent.press(getByTestId('item-1'));

  // Wait for animation to complete
  await waitFor(() => {
    expect(getByText(/\+\d+ Common/)).toBeTruthy(); // Material popup
  });

  // Verify material was added to counter
  await waitFor(() => {
    expect(getByText(/Common: \d+/)).toBeTruthy();
  });
});
```

**API Integration** (MSW mocks):
```typescript
// cloudSave.test.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.post('/api/saves', (req, res, ctx) => {
    return res(ctx.json({ success: true, saveId: 'test-123' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('should upload save data to cloud', async () => {
  const saveService = new SaveService();
  const mockState = { playerId: 'test', level: 5 };

  const result = await saveService.saveCloud(mockState);

  expect(result.success).toBe(true);
  expect(result.saveId).toBe('test-123');
});
```

**Navigation Testing**:
```typescript
// navigation.test.tsx
test('should navigate to tinkering screen when equipment is tapped', async () => {
  const { getByTestId } = render(<GameScreen />);

  fireEvent.press(getByTestId('equipment-weapon-1'));

  await waitFor(() => {
    expect(screen.getByText('Tinkering')).toBeTruthy();
  });
});
```

**Context/State Management**:
```typescript
// automationContext.test.tsx
test('should update all subscribers when automation rate changes', () => {
  const callback1 = jest.fn();
  const callback2 = jest.fn();

  const { result } = renderHook(() => useAutomationStore());

  result.current.subscribe(callback1);
  result.current.subscribe(callback2);

  act(() => {
    result.current.setRate(10); // 10 items/sec
  });

  expect(callback1).toHaveBeenCalledWith(expect.objectContaining({ rate: 10 }));
  expect(callback2).toHaveBeenCalledWith(expect.objectContaining({ rate: 10 }));
});
```

### End-to-End Testing (TDD Third Layer)

**User Flows**:
```typescript
// e2e/progression.test.ts
test('should progress from Level 1 to Level 10 and unlock Salvage Assistant', async () => {
  // Start new game
  await device.launchApp({ newInstance: true });

  // Complete tutorial (salvage 5 items)
  for (let i = 0; i < 5; i++) {
    await element(by.id('salvage-button')).tap();
  }

  // Verify auto-collect unlocked at L5
  await waitFor(element(by.text('Auto-Collect Unlocked!'))).toBeVisible().withTimeout(5000);

  // Continue to L10
  await element(by.id('salvage-button')).multiTap(50);

  // Verify Salvage Assistant unlocked
  await waitFor(element(by.text('Salvage Assistant'))).toBeVisible().withTimeout(10000);

  // Verify automation is running
  const initialCount = await element(by.id('material-common')).getAttributes();
  await new Promise(resolve => setTimeout(resolve, 4000)); // Wait for automation
  const newCount = await element(by.id('material-common')).getAttributes();

  expect(Number(newCount.text)).toBeGreaterThan(Number(initialCount.text));
});
```

**Cross-Feature Integration**:
```typescript
// e2e/offlineProgression.test.ts
test('should calculate offline gains correctly', async () => {
  // Set up player at L26 with 10 items/sec automation
  await setupPlayer({ level: 26, automationRate: 10 });

  // Record current materials
  const initialMaterials = await getMaterialCount('common');

  // Simulate app going to background
  await device.sendToHome();

  // Wait 60 seconds (simulate offline time)
  await new Promise(resolve => setTimeout(resolve, 60000));

  // Reopen app
  await device.launchApp();

  // Verify offline summary appears
  await waitFor(element(by.text('Welcome Back!'))).toBeVisible();

  // Verify materials increased (10 items/sec * 60 sec = 600 items)
  const newMaterials = await getMaterialCount('common');
  const expectedGain = 600 * 5; // 5 common materials per item

  expect(newMaterials).toBeGreaterThanOrEqual(initialMaterials + expectedGain * 0.9); // 10% tolerance
});
```

**Performance Benchmarks**:
```typescript
// e2e/performance.test.ts
test('should maintain 60fps with 100 items/sec automation', async () => {
  await setupPlayer({ level: 26, automationRate: 100 });

  // Start FPS monitoring
  await device.enableFPSMonitoring();

  // Run for 60 seconds
  await new Promise(resolve => setTimeout(resolve, 60000));

  // Get FPS stats
  const fpsStats = await device.getFPSStats();

  expect(fpsStats.averageFPS).toBeGreaterThan(55); // Allow small margin
  expect(fpsStats.frameDropPercentage).toBeLessThan(1);
});
```

### TDD Checklist for Each Component

- [ ] First test written before any implementation code
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns (`screen`, `fireEvent`, `waitFor`)
- [ ] No testIds unless absolutely necessary (prefer accessible queries)
- [ ] Tests query by user-visible content (`getByText`, `getByRole`)
- [ ] Async operations use `waitFor` / `findBy` (not arbitrary `setTimeout`)
- [ ] All tests pass before next feature
- [ ] Coverage report reviewed (>80% coverage for new code)

## 8. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|--------------|---------------|
| Mobile Device (Minimum) | iPhone 11 / Galaxy S10 equivalent | Baseline for 60fps performance |
| Firebase Firestore | Pay-as-you-go plan | 10K daily active users ≈ $5/month |
| Firebase Authentication | Free tier (50K MAU) | No cost for initial launch |
| Firebase Cloud Functions | Blaze plan (pay-per-invocation) | For webhook handlers (IAP validation) |
| RevenueCat | Free tier (< $10K MRR) | No cost until monetization scales |
| Mixpanel | Free tier (20M events/month) | Sufficient for 10K DAU |
| Cloud Storage (Backups) | Firebase Storage 5GB | Save file backups, image assets |

### Deployment Architecture

**Environment Strategy**:
- **Development**: Local React Native dev server + Firebase emulator suite
- **Staging**: TestFlight (iOS) / Internal Testing (Android) + Firebase staging project
- **Production**: App Store / Google Play + Firebase production project

**Container Strategy**: Not applicable (mobile app, not containerized)

**CI/CD Pipeline Design**:

```
GitHub Actions Workflow
│
├─ On Push to `main`:
│  ├─ Run Jest unit tests (fail fast if < 80% coverage)
│  ├─ Run ESLint + TypeScript checks
│  ├─ Build iOS .ipa (Fastlane)
│  ├─ Build Android .apk/.aab (Fastlane)
│  ├─ Upload to TestFlight (iOS)
│  └─ Upload to Internal Testing (Android)
│
├─ On Tag `v*.*.*` (Production Release):
│  ├─ Run full test suite (unit + integration + e2e)
│  ├─ Build production builds
│  ├─ Upload to App Store Connect (iOS)
│  └─ Upload to Google Play Console (Android)
│
└─ Nightly:
   ├─ Run e2e test suite on real devices (AWS Device Farm)
   └─ Generate coverage report
```

**Blue-Green Deployment**: Not applicable for mobile apps (users control update)

**Rollout Strategy**:
- **Staged Rollout**: Google Play staged rollout (10% → 50% → 100% over 7 days)
- **iOS Phased Release**: App Store phased release (1% → 100% over 7 days)
- **Rollback**: Emergency patch release if critical bug detected

### Monitoring & Observability

#### Metrics

**Application Metrics**:
- Crash-free rate (Firebase Crashlytics): > 99.5%
- Average session length: 20-25 minutes
- Average FPS: > 55fps
- Memory usage: < 150MB average

**Business Metrics** (aligned with PRD):
- D1 / D7 / D30 retention rates
- Conversion rate (free to paying): 3-5%
- ARPU / ARPPU
- Phase completion rates (L10 / L20 / L30 milestones)

**Infrastructure Metrics**:
- Firebase API latency (p95): < 300ms
- Cloud Function execution time: < 2s
- Firestore read/write rates
- Cloud Storage bandwidth usage

**Dashboards**:
- **Real-time Dashboard**: Firebase Analytics dashboard (session count, active users, crashes)
- **Business Dashboard**: Mixpanel custom dashboard (retention, monetization, progression funnels)
- **Performance Dashboard**: Firebase Performance Monitoring (FPS, network latency, screen rendering)

#### Logging

**Log Levels and Categories**:
- **ERROR**: Crashes, save corruption, API failures
- **WARN**: Frame drops, slow saves, missing assets
- **INFO**: Level-ups, automation unlocks, prestige events
- **DEBUG**: Salvage actions, tinkering actions, tick rates (disabled in production)

**Centralized Logging Strategy**:
- **Firebase Crashlytics**: Crash logs with stack traces
- **Custom Logs**: Streamed to Firebase Cloud Logging (for server-side functions)
- **Log Retention Policy**: 30 days for INFO/DEBUG, 90 days for WARN/ERROR

**Example Logging**:
```typescript
import crashlytics from '@react-native-firebase/crashlytics';

try {
  salvageEngine.salvageItem(item, isManual);
} catch (error) {
  crashlytics().log(`Salvage failed: itemId=${item.id}, isManual=${isManual}`);
  crashlytics().recordError(error);
}
```

#### Alerting

| Alert | Condition | Priority | Action |
|-------|-----------|----------|--------|
| Crash Rate Spike | > 1% crashes in 1 hour | P0 | Page on-call, investigate immediately |
| Save Corruption | > 10 corrupted saves in 1 hour | P0 | Rollback deployment, investigate |
| API Failure Rate | > 5% API errors in 5 minutes | P1 | Check Firebase status, investigate |
| Low FPS | Average FPS < 50 for 10 minutes | P2 | Monitor, investigate during business hours |
| Retention Drop | D1 retention < 40% for 24 hours | P1 | Review recent changes, A/B test rollback |

**Alert Channels**:
- P0: PagerDuty (on-call engineer)
- P1: Slack #alerts channel
- P2: Email to engineering team

## 9. Scalability & Performance

### Performance Requirements

**Response Time**:
- UI interactions: < 100ms (tap to visual feedback)
- Salvage animation: 500ms (configurable)
- Save operation: < 100ms (local), < 2s (cloud)
- API calls: < 300ms p95

**Throughput**:
- 100 items/second automation rate at L26
- 60fps UI rendering
- 1000 concurrent players (Firebase scales automatically)

**Concurrent Users**: 10K DAU, 1K concurrent at peak

### Scalability Strategy

**Horizontal Scaling Approach**:
- **Firebase**: Auto-scales (no action needed)
- **Mobile App**: Scales per device (each user runs their own instance)

**Load Balancing Strategy**: Not applicable (Firebase handles this)

**Database Scaling**:
- **Read Replicas**: Not needed (Firestore scales reads automatically)
- **Sharding**: Firestore automatically shards by document ID
- **Indexing**: Create composite indexes for common queries (user_id + timestamp)

**Caching Layers**:
- **Local Cache**: Zustand store (in-memory)
- **AsyncStorage**: Device-level persistence
- **CDN**: Firebase CDN for static assets (images, sounds)

### Performance Optimization

**Query Optimization**:
- Use Firestore `.where()` filters to reduce data transfer
- Limit query results (`.limit(5)` for save history)
- Use indexes for sort operations

**Asset Optimization**:
- **Images**: Compress to WebP (50% smaller than PNG)
- **Sounds**: Use AAC format (smaller than MP3)
- **Animations**: Use Lottie JSON (vector-based, scalable)

**Code-level Optimizations**:
- **Memoization**: Use `React.memo` for expensive components
- **Lazy Loading**: Code-split large features (Prestige UI only loads at L35)
- **Debouncing**: Debounce save operations (every 30s, not every state change)
- **Object Pooling**: Reuse particle effect objects (create pool of 100, reuse)

**Resource Pooling**:
```typescript
// Particle pool example
const particlePool = new ObjectPool({
  create: () => new ParticleEffect(),
  reset: (particle) => particle.reset(),
  maxSize: 100,
});

function spawnParticle() {
  const particle = particlePool.acquire();
  particle.play();
  setTimeout(() => particlePool.release(particle), 1000);
}
```

**Performance Monitoring**:
- Use `@shopify/react-native-performance` for FPS tracking
- Firebase Performance Monitoring for network traces
- Custom metrics for salvage/tinker throughput

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| **Performance Degradation at 100 items/sec** | High (unplayable) | Medium | Benchmark early, optimize tick engine, use object pooling | Lead Dev |
| **Save Data Corruption** | Critical (data loss) | Low | Checksums, rollback, frequent cloud backups | Backend Dev |
| **Offline Calculation Exploits** | Medium (unfair advantage) | Medium | Cap offline gains, validate device time, sanity checks | Backend Dev |
| **Firebase Cost Overrun** | Medium (budget impact) | Low | Monitor usage, implement quotas, cache aggressively | DevOps |
| **IAP Fraud** | High (revenue loss) | Low | Server-side validation, RevenueCat fraud detection | Backend Dev |
| **Memory Leaks** | High (crashes) | Medium | Profiling, automated leak detection, React DevTools | Lead Dev |
| **Third-party SDK Breaking Changes** | Medium (app broken) | Medium | Pin dependency versions, test updates in staging | DevOps |
| **App Store Rejection** | Critical (no launch) | Low | Follow guidelines, avoid dark patterns, pre-submit review | Product |

### Dependencies

**Internal Dependencies** (from PRD):
- **Core Combat System**: Provides items to salvage
  - **Risk**: Delays in combat system delay salvage testing
  - **Mitigation**: Create mock item generator for isolated testing

- **Equipment System**: Receives tinkering upgrades
  - **Risk**: Equipment schema changes break tinkering
  - **Mitigation**: Define equipment interface contract early, version schema

- **Player Progression System**: Levels unlock automations
  - **Risk**: Level progression too fast/slow breaks automation pacing
  - **Mitigation**: Decouple automation unlocks from level (use XP thresholds)

- **Tutorial System**: Teaches mechanics
  - **Risk**: Tutorial doesn't cover automation well
  - **Mitigation**: Build tutorial-agnostic design, add in-game tips

**External Dependencies**:
- **Firebase**: Cloud saves, analytics, auth
  - **Risk**: Firebase outage prevents cloud saves
  - **Mitigation**: Local saves always work, queue cloud saves for retry

- **RevenueCat**: IAP management
  - **Risk**: RevenueCat API changes break purchases
  - **Mitigation**: Pin SDK version, abstract IAP logic behind interface

- **Mixpanel**: Analytics
  - **Risk**: Mixpanel outage loses event data
  - **Mitigation**: Non-critical, acceptable to lose some analytics

- **Expo**: React Native framework
  - **Risk**: Expo SDK breaking changes
  - **Mitigation**: Use Expo bare workflow for more control, test updates thoroughly

## 11. Implementation Plan (TDD-Driven)

Following @docs/guides/lean-task-generation-guide.md principles - prioritize user-visible functionality.

### Development Phases

#### Phase 1: Foundation & Test Setup [Week 1]
**Goal**: Set up project infrastructure and testing framework

**TDD Tasks**:
1. **Day 1-2: Project Setup**
   - Initialize Expo bare workflow project
   - Configure Jest + React Native Testing Library
   - Set up MSW for API mocking
   - Create test utilities and custom render function
   - Configure CI/CD pipeline (GitHub Actions)
   - Write initial test: "App renders without crashing"

2. **Day 3-4: Core Data Models (TDD)**
   - **Tests First**:
     - `test('PlayerState should initialize with default values')`
     - `test('MaterialInventory should support all four tiers')`
     - `test('Equipment should calculate power level correctly')`
   - **Implementation**: Create TypeScript interfaces and Zustand stores
   - **Refactor**: Extract validation logic, add helper functions

3. **Day 5: Save/Load Foundation (TDD)**
   - **Tests First**:
     - `test('should save player state to AsyncStorage')`
     - `test('should load player state from AsyncStorage')`
     - `test('should detect corrupted save data and rollback')`
   - **Implementation**: Minimal save service
   - **Refactor**: Add compression, checksums

**Deliverable**: Working test infrastructure, core data models, basic save/load

#### Phase 2: Phase 1 Manual Gameplay [Week 2-3]
**Goal**: Implement Levels 1-10 manual gameplay with TDD

**TDD Feature 1: Manual Salvaging (Week 2, Day 1-3)**

1. **Day 1: Write All Failing Tests**
   ```typescript
   describe('Manual Salvaging', () => {
     test('should salvage item when tapped', () => { ... });
     test('should generate materials based on item rarity', () => { ... });
     test('should show salvage animation for 0.5 seconds', () => { ... });
     test('should display material popup with +X Common', () => { ... });
     test('should add materials to inventory after salvage', () => { ... });
   });
   ```

2. **Day 2-3: Implement to Pass Tests**
   - Build SalvageEngine core logic
   - Create SalvageButton component
   - Integrate with MaterialStore
   - Add particle effects (using Lottie)

3. **Day 3: Refactor & Polish**
   - Extract rarity-to-materials mapping
   - Optimize animation performance
   - Add haptic feedback

**TDD Feature 2: Material Tracking (Week 2, Day 4-5)**

1. **Tests**:
   - `test('should display all four material tiers')`
   - `test('should animate counter when materials increase')`
   - `test('should trigger special effect for rare materials')`
   - `test('should persist materials between sessions')`

2. **Implementation**:
   - MaterialCounter component
   - Animated.Value for smooth counter transitions
   - Special particle effect for rare drops
   - Wire up to save system

**TDD Feature 3: Manual Tinkering (Week 3, Day 1-3)**

1. **Tests**:
   - `test('should show tinkering UI when equipment tapped')`
   - `test('should validate sufficient materials before tinker')`
   - `test('should apply +1 upgrade on successful tinker')`
   - `test('should show 2-second channeling animation')`
   - `test('should increase power level after upgrade')`

2. **Implementation**:
   - TinkeringEngine logic
   - TinkeringModal component
   - Material validation
   - Progress bar animation

**TDD Feature 4: First Automations (Week 3, Day 4-5)**

1. **Tests**:
   - `test('should unlock auto-collect at Level 5')`
   - `test('should unlock batch select at Level 8')`
   - `test('should unlock Salvage Assistant at Level 10')`
   - `test('Salvage Assistant should process 1 item every 3 seconds')`
   - `test('Manual clicks should still work with Assistant active')`

2. **Implementation**:
   - Automation unlock system
   - Tick-based automation engine (initial version)
   - Batch select UI
   - Celebration animations for unlocks

**Deliverable**: Fully playable Phase 1 (Levels 1-10), all tests green, >80% coverage

#### Phase 3: Phase 2 Hybrid Gameplay [Week 4-5]
**Goal**: Implement Levels 11-25 automation progression with hybrid mechanics

**TDD Feature 1: Automation Progression (Week 4, Day 1-3)**

1. **Tests**:
   - `test('should upgrade salvage speed at correct levels')`
   - `test('Level 11: 1 item/3sec → Level 22: 10 items/sec')`
   - `test('should display current automation rate in UI')`
   - `test('should show queue size and processing rate')`

2. **Implementation**:
   - Automation tier system
   - AutomationDashboard component
   - Upgrade unlock logic

**TDD Feature 2: Auto-Tinkering (Week 4, Day 4-5)**

1. **Tests**:
   - `test('should auto-tinker when toggle enabled')`
   - `test('should follow priority queue')`
   - `test('should allow manual override of auto-tinker')`
   - `test('should show progress bar for auto-tinkering')`

2. **Implementation**:
   - Auto-tinker engine
   - Priority queue data structure
   - PriorityManager component

**TDD Feature 3: Hybrid Bonuses (Week 5, Day 1-2)**

1. **Tests**:
   - `test('manual salvage should be 2x faster than auto')`
   - `test('combo: 10 clicks in 5 seconds triggers speed burst')`
   - `test('critical hit: 5% chance on manual salvage')`
   - `test('manual tinker: 50% cheaper than auto')`

2. **Implementation**:
   - Combo detection system
   - Critical hit RNG
   - Manual bonus multipliers

**TDD Feature 4: Material Refinement & Filters (Week 5, Day 3-5)**

1. **Tests**:
   - `test('should refine 3 common → 1 rare')`
   - `test('should prevent accidental refinement')`
   - `test('auto-refiner should work at Level 20')`
   - `test('salvage filters: auto-salvage commons only')`

2. **Implementation**:
   - Refinement engine
   - Filter rule system
   - FilterManager UI

**Deliverable**: Phase 2 complete, hybrid gameplay functional, all tests passing

#### Phase 4: Phase 3 Full Automation [Week 6-7]
**Goal**: Implement Levels 26+ full automation and endgame systems

**TDD Feature 1: Master Salvager & Offline Progression (Week 6, Day 1-3)**

1. **Tests**:
   - `test('should process 100 items/second at L26')`
   - `test('should calculate offline gains accurately')`
   - `test('offline gains capped at 24 hours')`
   - `test('should show offline summary on return')`

2. **Implementation**:
   - High-throughput automation (optimize tick engine)
   - Offline calculator algorithm
   - OfflineSummary modal

**TDD Feature 2: Prestige System (Week 6, Day 4-5)**

1. **Tests**:
   - `test('prestige triggers every 1000 items salvaged')`
   - `test('should present choice of 3 bonuses')`
   - `test('bonuses should have correct durations')`
   - `test('bonuses should stack with existing effects')`

2. **Implementation**:
   - Prestige tracking
   - PrestigeModal component
   - Bonus application logic

**TDD Feature 3: Endgame Features (Week 7, Day 1-3)**

1. **Tests**:
   - `test('God Click should process 1000 items instantly')`
   - `test('God Click cooldown: 1 hour')`
   - `test('Perfect Salvage: 50% legendary on manual')`
   - `test('Master\'s Touch: exceed normal upgrade limits')`

2. **Implementation**:
   - God Click ability
   - Cooldown system
   - Perfect Salvage RNG
   - Master's Touch logic

**TDD Feature 4: Grand Tinkermaster & Forge Mastery (Week 7, Day 4-5)**

1. **Tests**:
   - `test('should manage all equipment simultaneously')`
   - `test('should distribute materials optimally (no waste)')`
   - `test('Forge cycle should trigger every 2 hours')`
   - `test('Forge bonuses apply to all equipment')`

2. **Implementation**:
   - Multi-equipment optimization
   - Forge cycle timer
   - Bonus application

**Deliverable**: Full Phase 3 gameplay, endgame systems, all tests passing

#### Phase 5: UI Evolution & Polish [Week 8]
**Goal**: Implement three distinct UI phases with smooth transitions

**TDD Tasks**:
1. **Day 1-2: Phase-Specific UIs**
   - Tests for each UI rendering correctly
   - Tests for transition triggers
   - Implementation of three UI variants

2. **Day 3-4: Animations & Polish**
   - Particle effect pooling tests
   - Animation performance tests
   - Haptic feedback tests
   - Polish pass on all visuals

3. **Day 5: Accessibility**
   - Screen reader tests
   - Colorblind mode tests
   - Touch target size validation
   - Reduced motion tests

**Deliverable**: Polished UI for all three phases, accessible, 60fps

#### Phase 6: Monetization & Analytics [Week 9]
**Goal**: Integrate IAP and analytics

**TDD Tasks**:
1. **Day 1-2: RevenueCat Integration**
   - Tests for purchase flow
   - Tests for entitlement checks
   - Tests for restore purchases
   - Implementation

2. **Day 3-4: Analytics**
   - Tests for event tracking
   - Tests for funnel metrics
   - Mixpanel integration
   - Custom dashboard setup

3. **Day 5: Monetization Offers**
   - Tests for offer presentation
   - Tests for purchase success/failure
   - UI for purchase modals

**Deliverable**: IAP functional, analytics tracking, monetization offers

#### Phase 7: Hardening & Testing [Week 10]
**Goal**: Security, performance, and comprehensive testing

**TDD Tasks**:
1. **Day 1-2: Security**
   - Anti-cheat tests (progression rate limits)
   - Save data validation tests
   - IAP validation tests
   - Obfuscation implementation

2. **Day 3-4: Performance**
   - 100 items/sec performance test
   - Memory leak detection
   - FPS benchmarking
   - Optimization pass

3. **Day 5: E2E Test Suite**
   - Full progression flow test (L1 → L40)
   - Offline progression test
   - Prestige flow test
   - Coverage report review (>80%)

**Deliverable**: Hardened, tested, production-ready build

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|------------|------|--------------|
| M1 | Test infrastructure + core data models | Week 1 | None |
| M2 | Phase 1 gameplay (manual salvage/tinker) | Week 3 | M1 |
| M3 | Phase 2 gameplay (hybrid automation) | Week 5 | M2 |
| M4 | Phase 3 gameplay (full automation) | Week 7 | M3 |
| M5 | UI polish + accessibility | Week 8 | M4 |
| M6 | IAP + analytics integration | Week 9 | M5 |
| M7 | Production-ready build | Week 10 | M6 |

## 12. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| **State Management** | Redux, MobX, Zustand, Context API | **Zustand** | Simpler than Redux, better performance than Context API, TypeScript-first |
| **Animation Library** | React Native Animated, Reanimated 2, Lottie | **Reanimated 2 + Lottie** | Reanimated 2 for 60fps UI animations, Lottie for particle effects |
| **Backend** | Firebase, Supabase, Custom Backend | **Firebase** | Quick setup, scales automatically, generous free tier, proven for mobile games |
| **Testing Framework** | Enzyme, React Native Testing Library | **RNTL** | Recommended by React docs, focuses on user behavior not implementation |
| **IAP Management** | Direct SDK, RevenueCat, Adapty | **RevenueCat** | Handles cross-platform IAP, free tier, server-side validation |
| **Analytics** | Firebase Analytics, Mixpanel, Amplitude | **Mixpanel** | More powerful funnel analysis, better retention cohorts |
| **Tick Engine** | setInterval, requestAnimationFrame, setImmediate | **requestAnimationFrame** | Syncs with screen refresh (60fps), pauses when app backgrounds |
| **Offline Calculation** | Real-time simulation, Formula-based | **Real-time simulation** | More accurate, supports complex bonuses, prevents exploits better |
| **Save Format** | JSON, MessagePack, Protobuf | **JSON (compressed)** | Human-readable for debugging, LZ-string compression reduces size 70% |

### Trade-offs

**Trade-off 1**: Chose **tick-based automation** over **event-driven automation**
- **Benefit**: Simpler to implement, easier to serialize for offline calc, predictable performance
- **Limitation**: Fixed overhead every frame (but negligible with optimized tick loop)

**Trade-off 2**: Accepted **24-hour offline cap** instead of unlimited offline gains
- **Benefit**: Prevents exploitation (time manipulation), keeps game balanced, encourages daily engagement
- **Limitation**: Hardcore players may feel penalized for long breaks (but can purchase Offline Maximizer)

**Trade-off 3**: Chose **client-side progression logic** instead of **server-authoritative**
- **Benefit**: Works offline, faster response times, lower server costs
- **Limitation**: Vulnerable to memory editing (but mitigated with sanity checks and obfuscation)

**Trade-off 4**: Chose **React Native** over **native iOS/Android**
- **Benefit**: Single codebase, faster development, easier to maintain
- **Limitation**: Slight performance overhead (but optimized to meet 60fps requirement)

**Trade-off 5**: Accepted **5-minute cloud save delay** instead of real-time cloud sync
- **Benefit**: Reduces API calls (99% cost reduction), reduces battery drain
- **Limitation**: Could lose up to 5 minutes of progress if device destroyed (acceptable risk for single-player game)

## 13. Open Questions

Technical questions requiring resolution:

- [ ] **Particle Effect Budget**: How many simultaneous particles before FPS drops below 60? (Need benchmarking)
- [ ] **Offline Calculation Performance**: Can we simulate 24 hours of 100 items/sec in < 3 seconds on load? (Need profiling)
- [ ] **Save Data Size Limits**: What's the max save size before AsyncStorage issues on Android 8? (Need testing)
- [ ] **IAP Pricing**: Should Phase 3 monetization be priced higher due to higher player investment? (Need product input)
- [ ] **Accessibility Compliance**: Do we need WCAG AA compliance for mobile games? (Need legal review)
- [ ] **COPPA Compliance**: Are we targeting < 13 age group? (Need product decision)
- [ ] **Server-side Anti-cheat**: Should we add server-side validation for prestige events? (Need cost/benefit analysis)
- [ ] **Cross-platform Cloud Saves**: Enable cloud saves between iOS/Android? (Need product decision)
- [ ] **Localization Timeline**: When should we add additional languages beyond English? (Need roadmap planning)

## 14. Appendices

### A. Technical Glossary

- **Tick**: Single frame update in the game loop (60 ticks/second at 60fps)
- **Tick Engine**: System that processes automation actions at regular intervals
- **Object Pool**: Reusable collection of objects to reduce garbage collection overhead
- **Debouncing**: Delaying function execution until after a specified time has passed
- **Sanity Check**: Validation that data is within reasonable expected ranges
- **Offline Calculator**: Algorithm that simulates game progression during offline time
- **Prestige**: Meta-progression system that provides bonuses after milestones
- **TDD (Test-Driven Development)**: Red-Green-Refactor cycle (write test, implement, refactor)

### B. Reference Architecture

**Similar Systems / Patterns**:
- **Idle Game Tick Systems**: Cookie Clicker, AdVenture Capitalist
- **Progressive Automation**: Factorio (manual → semi-auto → full automation)
- **Hybrid Click + Automation**: Realm Grinder, NGU Idle
- **Prestige Systems**: Clicker Heroes, Egg Inc.

**React Native Performance Best Practices**:
- https://reactnative.dev/docs/performance
- https://shopify.github.io/react-native-performance/
- https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started

### C. Proof of Concepts

**POC 1: Tick Engine Performance** (Week 1)
- Test 100 items/sec processing with particle effects
- Measure FPS impact
- Result: < 60fps? → Optimize (object pooling, reduce particle count)

**POC 2: Offline Calculation Speed** (Week 2)
- Simulate 24 hours of 100 items/sec automation
- Measure calculation time on iPhone 11
- Result: > 3 seconds? → Optimize (formula-based approximation for long offline periods)

**POC 3: Save Data Compression** (Week 3)
- Test LZ-string compression ratio on realistic save data
- Measure compression/decompression time
- Result: Compression ratio 60-70%, < 50ms on mobile

### D. Related Documents

- **Product Requirements Document**: `/workflow-outputs/20251106_174855/prd_20251106.extracted.md`
- **React Native Testing Library Guide**: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Lean Task Generation Guide**: `@docs/guides/lean-task-generation-guide.md`
- **Architecture Decision Records**: (To be created in `/docs/adr/`)
- **API Documentation**: (To be created after implementation in `/docs/api/`)

---

*Generated from PRD: prd_20251106.extracted.md*
*Generation Date: 2025-11-06*
*TDD Version: 1.0*
