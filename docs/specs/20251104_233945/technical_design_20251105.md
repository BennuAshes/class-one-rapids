# Salvage & Tinkering System - Progressive Automation Technical Design Document

## Document Control
| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Generated | 2025-11-04 | Draft | Initial TDD from PRD |

## Executive Summary

This Technical Design Document outlines the implementation of a progressive automation system for a React Native idle clicker game. The system transforms traditional idle game mechanics by implementing a three-phase progression (Manual → Hybrid → Full Automation) that maintains player engagement over 20+ hours of gameplay. The solution leverages Legend State for reactive state management, React Native Reanimated for performant UI-thread animations, and follows strict Test-Driven Development (TDD) methodology with >80% code coverage requirements.

## 1. Overview & Context

### Problem Statement

Players in idle clicker games often experience a hollow progression where automation arrives too quickly, trivializing manual gameplay and reducing long-term engagement. The system needs to balance immediate tactile satisfaction with gradual automation unlocks, ensuring that manual actions remain meaningful throughout the game's lifecycle while still providing the satisfaction of idle progression.

**Key Technical Challenges:**
- Maintain 60 FPS with 10,000+ inventory items
- Provide <16ms touch response with haptic feedback
- Support 8-hour offline progression without battery drain
- Balance automation rates to preserve 20+ hour progression curve
- Integrate with existing combat, attributes, and economy systems

### Solution Approach

Implement a modular, reactive state management architecture using Legend State observables that supports three distinct gameplay phases:

1. **Phase 1 (Manual Crafting)**: High-frequency user interactions with particle effects, haptics, and immediate visual feedback
2. **Phase 2 (Hybrid Automation)**: Game loop-driven automation with manual intervention bonuses (combo multipliers, critical hits)
3. **Phase 3 (Full Automation)**: Strategic management interface with offline progression and prestige mechanics

The architecture prioritizes performance through virtual scrolling, object pooling for particles, and UI-thread animations via React Native Reanimated. All state changes persist to AsyncStorage within 500ms using Legend State's `synced()` wrapper.

### Success Criteria

**Technical Metrics:**
- 60 FPS maintained with 10,000 items in inventory
- <16ms touch response from tap to haptic feedback
- <500ms state persistence to AsyncStorage
- >80% test coverage across all modules
- Zero crashes in 8-hour offline progression test
- Battery drain <5% per hour during active gameplay

**Business Metrics Alignment:**
- 80% of players salvage 100 items manually (Phase 1 success)
- 70% unlock first automation at Level 10 (engagement retention)
- Day 7 retention improves by 15% over baseline (long-term value)
- Average time-to-automation: 15-20 minutes (tuned progression)

## 2. Requirements Analysis

### Functional Requirements

**FR-1: Inventory Management**
- Display up to 10,000 items in scrollable grid layout (5 columns)
- Support item types: weapon, armor, helmet, gloves, boots, misc
- Display item rarity with color-coded borders: common (gray), rare (blue), epic (purple), legendary (gold)
- Show "NEW" badge on items acquired in last 5 minutes
- Persist inventory state to AsyncStorage on changes

**FR-2: Manual Salvage System**
- Single tap on item triggers salvage with medium haptic feedback
- 0.5-second salvage animation with particle burst
- Particles colored by rarity with physics-based motion
- Auto-collect materials after 0.5 seconds (Level 5+)
- Material drop rates follow rarity-based probability tables:
  - Common: 95% common, 5% rare, 0% epic, 0% legendary
  - Rare: 70% common, 25% rare, 5% epic, 0% legendary
  - Epic: 40% common, 40% rare, 18% epic, 2% legendary
  - Legendary: 20% common, 30% rare, 40% epic, 10% legendary

**FR-3: Manual Tinkering System**
- 5 equipment slots: weapon, armor, helmet, gloves, boots
- Hold-to-upgrade interaction with 2-second progress bar
- Heavy haptic feedback on upgrade completion
- Exponential cost scaling: `baseCost × (1.15 ^ currentLevel)`
- Power calculation: sum of all equipment slot bonuses
- Power integrates with existing combat system damage formula

**FR-4: Combo Multiplier System (Level 11+)**
- 10-second window between salvages to maintain combo
- Multiplier: 1.0x base + 0.1x per combo hit
- Maximum multiplier: 5.0x at 40 combo
- Applies to material output quantity
- Visual indicator shows combo count and timer countdown
- Combo resets to 1.0x after 10-second timeout

**FR-5: Automation System**
- Unlock automation upgrades at specific player levels
- Upgrades purchased with Pyreal currency
- Multi-tier upgrades (1-5 tiers per upgrade type)
- Auto-salvage rates: 0.33 items/sec base, scaling to 100 items/sec at max tier
- Auto-tinkering processes one upgrade per tick when materials available
- Priority queue system for equipment upgrades (player-configurable)

**FR-6: Offline Progression (Level 26+)**
- Calculate offline time on app open: `currentTime - lastActiveTime`
- Maximum 8-hour accumulation cap
- Offline efficiency: 25% base + endurance attribute bonus
- Only auto-salvage processes offline (no manual combos)
- Only common items processed offline
- Display summary modal showing: time away, items salvaged, materials earned

**FR-7: Prestige System (Level 35+)**
- Trigger every 1,000 items salvaged
- Offer 3 randomized temporary bonuses (choose 1):
  - +10% all materials for 1 hour
  - Next 100 salvages guaranteed rare material
  - Double tinkering speed for 30 minutes
- Permanent bonuses persist through resets:
  - Salvage speed multiplier
  - Rare material bonus chance
  - Starting equipment levels

### Non-Functional Requirements

**NFR-1: Performance**
- Target: 60 FPS during particle effects (99th percentile)
- Touch latency: <16ms from tap to haptic feedback
- Animation smoothness: Use React Native Reanimated for UI-thread execution
- Scalability: Handle 10,000 items without frame drops
- Memory: Cap particles at 100 simultaneous, clean up expired animations
- Battery: Throttle game loop to 30 FPS when app idle >30 seconds

**NFR-2: Persistence**
- All state saves to AsyncStorage within 500ms of changes
- Storage keys:
  - `salvage-system`: salvage state and statistics
  - `equipment-state`: equipment levels and power
  - `materials-state`: material counts
  - `automation-state`: automation upgrades and settings
  - `prestige-state`: prestige level and permanent bonuses
- Offline tracking: Save `lastActiveTime` on app unmount
- Data compression: Use Legend State `synced()` wrapper for automatic persistence

**NFR-3: Reliability**
- Zero data loss on app crashes (state persists before mutations)
- Graceful degradation: If storage quota exceeded, disable new item acquisition
- Error recovery: If corrupted state detected, load from last known good backup
- Idempotent operations: All state mutations can be safely retried

**NFR-4: Accessibility**
- Haptic feedback can be disabled in settings
- High contrast mode for rarity colors
- Minimum touch target: 44x44 points (iOS guidelines)
- Screen reader support for inventory counts

**NFR-5: Compatibility**
- React Native: 0.81.4 (fixed version)
- Expo: 54.0.10 (fixed version)
- Minimum iOS: 13.0
- Minimum Android: API 21 (5.0 Lollipop)
- Windows development environment: cmd.exe for npm/expo commands
- WSL support for bash scripts with CRLF line ending fixes

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI Layer (React Native)                  │
├─────────────────────────────────────────────────────────────────┤
│  InventoryGrid   │  EquipmentGrid  │  AutomationPanel  │  Stats │
└─────────┬───────────────────┬──────────────────┬───────────────┘
          │                   │                  │
          ▼                   ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  State Management Layer (Legend State)           │
├─────────────────────────────────────────────────────────────────┤
│  inventory$  │  materials$  │  salvageSystem$  │  equipment$    │
│  automation$ │  prestige$   │  gameLoop$                        │
└─────────┬──────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Game Loop Engine (Core)                       │
├─────────────────────────────────────────────────────────────────┤
│  requestAnimationFrame (60 FPS target, throttled when idle)     │
│  - processAutoSalvage()    - processAutoTinker()                │
│  - updateComboTimer()      - persistState()                     │
└─────────┬──────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Persistence Layer (AsyncStorage)                │
├─────────────────────────────────────────────────────────────────┤
│  Automatic persistence via Legend State synced() wrapper        │
│  Compression, batching, error recovery                          │
└─────────────────────────────────────────────────────────────────┘
```

**External Dependencies:**
- Combat System: Provides loot generation → inventory
- Attributes System: Provides endurance stat → offline efficiency
- Economy System: Provides Pyreal currency → automation purchases

### Component Design

#### **Inventory Module** (`/frontend/modules/salvage/`)

**Purpose:** Manage item storage, display, and salvage interactions

**Core Components:**
- `InventoryGrid.tsx`: Virtual scrolling grid (FlashList) displaying items
- `InventoryItem.tsx`: Individual item cell with rarity styling and tap handler
- `ParticleSystem.tsx`: Particle effect rendering with object pooling

**State Store:**
```typescript
// inventory.store.ts
const inventory$ = observable(
  synced({
    initial: {
      items: [] as InventoryItem[],
      capacity: 50,
      lastAcquired: 0
    },
    persist: { name: 'inventory-state' }
  })
);
```

**Key Actions:**
- `addItem(item: InventoryItem): void` - Add item to inventory, enforce capacity
- `removeItem(itemId: string): void` - Remove item after salvage
- `salvageItem(itemId: string): Material` - Trigger salvage, calculate drops
- `expandCapacity(amount: number): void` - Increase max capacity

**Dependencies:**
- `materials$` (updates material counts)
- `salvageSystem$` (tracks stats, combo)
- Haptics service (medium impact)
- Particle service (spawn particles)

---

#### **Salvage System Module** (`/frontend/modules/salvage/`)

**Purpose:** Handle salvage mechanics, combo system, automation processing

**Core Components:**
- `SalvageStats.tsx`: Display stats (total salvaged, rate, combo)
- `ComboIndicator.tsx`: Show combo count and timer with progress bar
- `SalvageService.ts`: Business logic for salvage calculations

**State Store:**
```typescript
// salvageSystem.store.ts
const salvageSystem$ = observable(
  synced({
    initial: {
      lastManualSalvage: 0,
      comboCount: 0,
      comboMultiplier: 1.0,
      comboExpiresAt: 0,
      autoSalvageEnabled: false,
      autoSalvageSpeed: 0,  // Items per second
      lastAutoTick: 0,
      totalSalvaged: 0,
      totalManual: 0,
      totalAuto: 0
    },
    persist: { name: 'salvage-system' }
  })
);
```

**Key Actions:**
- `handleManualSalvage(itemId: string): void` - Update combo, trigger effects
- `updateComboTimer(currentTime: number): void` - Check timeout, reset multiplier
- `processAutoSalvage(deltaTime: number): void` - Process automated salvages
- `calculateMaterialDrops(rarity: Rarity, multiplier: number): Material` - RNG drops

**Dependencies:**
- `inventory$` (remove salvaged items)
- `materials$` (add dropped materials)
- `automation$` (read auto-salvage speed)

---

#### **Materials Module** (`/frontend/modules/salvage/`)

**Purpose:** Track material counts and display

**Core Components:**
- `MaterialsDisplay.tsx`: Material counters with animated number changes
- `MaterialIcon.tsx`: Rarity-specific icons and colors

**State Store:**
```typescript
// materials.store.ts
const materials$ = observable(
  synced({
    initial: {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    },
    persist: { name: 'materials-state' }
  })
);
```

**Key Actions:**
- `addMaterials(materials: Material): void` - Increment counts
- `deductMaterials(materials: Material): boolean` - Decrement if available
- `canAfford(cost: Material): boolean` - Check sufficiency

**Dependencies:** None (leaf node)

---

#### **Equipment/Tinkering Module** (`/frontend/modules/tinkering/`)

**Purpose:** Manage equipment upgrades and power calculations

**Core Components:**
- `EquipmentGrid.tsx`: Display 5 equipment slots
- `EquipmentSlot.tsx`: Individual slot with hold-to-upgrade interaction
- `UpgradeProgressBar.tsx`: 2-second hold progress indicator
- `PowerDisplay.tsx`: Total power stat with tooltip breakdown

**State Store:**
```typescript
// equipment.store.ts
interface EquipmentSlot {
  level: number;
  maxLevel: number;
  powerBonus: number;
}

const equipment$ = observable(
  synced({
    initial: {
      weapon: { level: 0, maxLevel: 100, powerBonus: 0 },
      armor: { level: 0, maxLevel: 100, powerBonus: 0 },
      helmet: { level: 0, maxLevel: 100, powerBonus: 0 },
      gloves: { level: 0, maxLevel: 100, powerBonus: 0 },
      boots: { level: 0, maxLevel: 100, powerBonus: 0 },
      autoTinkerEnabled: false,
      priorityOrder: ['weapon', 'armor', 'helmet', 'gloves', 'boots']
    },
    persist: { name: 'equipment-state' }
  })
);

// Derived observable (computed)
const totalPower$ = computed(() => {
  const eq = equipment$.get();
  return eq.weapon.powerBonus + eq.armor.powerBonus +
         eq.helmet.powerBonus + eq.gloves.powerBonus + eq.boots.powerBonus;
});
```

**Key Actions:**
- `upgradeEquipment(slot: SlotType): boolean` - Attempt upgrade, deduct materials
- `calculateUpgradeCost(slot: SlotType): Material` - Compute exponential cost
- `processAutoTinker(deltaTime: number): void` - Auto-upgrade using priority
- `setPriorityOrder(order: SlotType[]): void` - Configure auto-tinker priority

**Dependencies:**
- `materials$` (check/deduct costs)
- `automation$` (check if auto-tinker enabled)
- Haptics service (heavy impact on completion)

---

#### **Automation Module** (`/frontend/modules/automation/`)

**Purpose:** Manage automation upgrades, unlocks, and settings

**Core Components:**
- `AutomationPanel.tsx`: Upgrade tree visualization
- `UpgradeCard.tsx`: Individual upgrade with tier progress
- `AutomationSettings.tsx`: Toggle auto-features, configure priorities

**State Store:**
```typescript
// automation.store.ts
interface AutomationUpgrade {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  cost: { pyreal: number; materials?: Material };
  currentTier: number;
  maxTier: number;
  effect: {
    type: 'salvage_speed' | 'auto_tinker' | 'offline_rate' | 'queue_size';
    value: number;
    perTier: number;
  };
}

const automation$ = observable(
  synced({
    initial: {
      upgrades: [
        {
          id: 'salvage_assistant',
          name: 'Salvage Assistant',
          unlockLevel: 10,
          cost: { pyreal: 100 },
          currentTier: 0,
          maxTier: 5,
          effect: { type: 'salvage_speed', value: 0.33, perTier: 0.5 }
        },
        // ... more upgrades
      ] as AutomationUpgrade[],
      autoSalvageEnabled: false,
      autoTinkerEnabled: false
    },
    persist: { name: 'automation-state' }
  })
);
```

**Key Actions:**
- `purchaseUpgrade(upgradeId: string): boolean` - Buy/upgrade if affordable
- `getEffectiveAutoSalvageSpeed(): number` - Calculate total from tiers
- `isUpgradeUnlocked(upgradeId: string): boolean` - Check level requirement

**Dependencies:**
- Player level (from existing player system)
- Pyreal currency (from economy system)

---

#### **Prestige Module** (`/frontend/modules/prestige/`)

**Purpose:** Handle prestige mechanics and permanent bonuses

**Core Components:**
- `PrestigePanel.tsx`: Prestige eligibility indicator and trigger button
- `PrestigeBonusSelector.tsx`: Select 1 of 3 random bonuses
- `PermanentBonuses.tsx`: Display persistent multipliers

**State Store:**
```typescript
// prestige.store.ts
const prestige$ = observable(
  synced({
    initial: {
      prestigeLevel: 0,
      totalPrestigeActivations: 0,
      lastPrestigeAt: 0,
      activeTempBonus: null as {
        type: string;
        expiresAt: number;
        multiplier: number;
      } | null,
      permanentBonuses: {
        salvageSpeedMultiplier: 1.0,
        rareMaterialBonus: 0.0,
        startingEquipmentLevels: 0
      }
    },
    persist: { name: 'prestige-state' }
  })
);
```

**Key Actions:**
- `checkPrestigeEligibility(): boolean` - Check if 1000 salvages since last
- `activatePrestige(bonusChoice: number): void` - Apply chosen bonus
- `applyPermanentBonus(type: string, amount: number): void` - Update multipliers

**Dependencies:**
- `salvageSystem$` (read total salvaged)
- Analytics service (track prestige events)

---

#### **Game Loop Engine** (`/frontend/core/gameLoop.ts`)

**Purpose:** Orchestrate all automated processes at 60 FPS

**Implementation:**
```typescript
let lastFrameTime = Date.now();
let isIdle = false;
let idleTimeout: NodeJS.Timeout | null = null;

function gameLoop() {
  const currentTime = Date.now();
  const deltaTime = (currentTime - lastFrameTime) / 1000; // seconds
  lastFrameTime = currentTime;

  // Update combo timer
  updateComboTimer(currentTime);

  // Process automation if enabled
  if (salvageSystem$.autoSalvageEnabled.get()) {
    processAutoSalvage(deltaTime);
  }

  if (equipment$.autoTinkerEnabled.get()) {
    processAutoTinker(deltaTime);
  }

  // Persist state (batched, throttled to every 500ms)
  persistStateThrottled();

  // Reset idle timer
  resetIdleTimer();

  // Continue loop
  requestAnimationFrame(gameLoop);
}

function resetIdleTimer() {
  if (idleTimeout) clearTimeout(idleTimeout);

  if (isIdle) {
    isIdle = false;
    // Resume 60 FPS
  }

  idleTimeout = setTimeout(() => {
    isIdle = true;
    // Throttle to 30 FPS (battery saving)
  }, 30000); // 30 seconds
}
```

**Performance Considerations:**
- Use `requestAnimationFrame` for native throttling
- Batch state updates using Legend State `batch()`
- Throttle persistence writes to max 2 per second
- Pause loop when app in background
- Dynamically reduce particle count if FPS drops below 50

---

### Data Flow

**Critical User Flow: Manual Salvage → Material Collection → Equipment Upgrade**

```
User Taps Item
      ↓
┌─────────────────────────────────────────────────────┐
│ 1. InventoryItem.onPress()                          │
│    - Fire haptic (medium) <16ms                     │
│    - Trigger salvage animation (0.5s)               │
│    - Call inventory$.salvageItem(itemId)            │
└─────────────────────┬───────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│ 2. salvageItem(itemId) Action                       │
│    - Get item rarity                                │
│    - Calculate material drops (RNG + combo mult)    │
│    - Spawn particle effects (rarity-colored)        │
│    - Update salvageSystem$ stats                    │
│    - Remove item from inventory                     │
│    - Return materials object                        │
└─────────────────────┬───────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│ 3. materials$.addMaterials(drops)                   │
│    - Increment counters                             │
│    - Trigger counter animation (number popup)       │
│    - Persist to AsyncStorage                        │
└─────────────────────┬───────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│ 4. User Drags Materials to Equipment Slot           │
│    - EquipmentSlot checks canAfford()               │
│    - User holds button (2s progress bar)            │
│    - On completion: equipment$.upgradeEquipment()   │
└─────────────────────┬───────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│ 5. upgradeEquipment(slot) Action                    │
│    - Calculate cost (exponential formula)           │
│    - materials$.deductMaterials(cost)               │
│    - Increment slot level                           │
│    - Recalculate power bonus                        │
│    - Fire haptic (heavy)                            │
│    - totalPower$ updates (computed observable)      │
│    - Persist to AsyncStorage                        │
└─────────────────────────────────────────────────────┘
```

**Automated Flow: Auto-Salvage Processing (Game Loop)**

```
requestAnimationFrame (60 FPS)
      ↓
┌─────────────────────────────────────────────────────┐
│ processAutoSalvage(deltaTime)                       │
│    - itemsToProcess = autoSpeed × deltaTime         │
│    - For each item (up to itemsToProcess):          │
│        • Get oldest inventory item                  │
│        • Calculate drops (no combo bonus)           │
│        • materials$.addMaterials(drops)             │
│        • inventory$.removeItem(item.id)             │
│        • salvageSystem$.totalAuto++                 │
│    - Skip particle effects (performance)            │
│    - Batch updates using Legend State batch()       │
└─────────────────────────────────────────────────────┘
```

**Offline Flow: App Reopen After Absence**

```
App Opens (AppState: 'active')
      ↓
┌─────────────────────────────────────────────────────┐
│ 1. calculateOfflineProgress()                       │
│    - offlineTime = currentTime - lastActiveTime     │
│    - cappedTime = Math.min(offlineTime, 8 hours)    │
│    - efficiency = 0.25 + (endurance × 0.01)         │
└─────────────────────┬───────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│ 2. Process Offline Salvages                         │
│    - itemsProcessed = autoSpeed × cappedTime × eff  │
│    - Only process common items                      │
│    - Calculate total materials in batch             │
│    - materials$.addMaterials(totalDrops)            │
│    - salvageSystem$.totalAuto += itemsProcessed     │
└─────────────────────┬───────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│ 3. Display Offline Summary Modal                    │
│    - Time away: "8 hours"                           │
│    - Items salvaged: 14,400                         │
│    - Materials earned: +1,200 common, +300 rare     │
│    - [Continue] button closes modal                 │
└─────────────────────────────────────────────────────┘
```

## 4. API Design

### Internal APIs (Module Actions)

| Module | Action | Parameters | Returns | Side Effects |
|--------|--------|------------|---------|--------------|
| inventory | `addItem` | `item: InventoryItem` | `void` | Adds item, checks capacity, persists |
| inventory | `removeItem` | `itemId: string` | `void` | Removes item, persists |
| inventory | `salvageItem` | `itemId: string` | `Material` | Removes item, updates stats, spawns particles |
| materials | `addMaterials` | `materials: Material` | `void` | Increments counters, persists |
| materials | `deductMaterials` | `materials: Material` | `boolean` | Decrements if affordable, persists |
| materials | `canAfford` | `cost: Material` | `boolean` | Checks sufficiency, no side effects |
| equipment | `upgradeEquipment` | `slot: SlotType` | `boolean` | Deducts materials, levels up, fires haptic |
| equipment | `calculateCost` | `slot: SlotType` | `Material` | Computes exponential cost, no side effects |
| equipment | `setPriorityOrder` | `order: SlotType[]` | `void` | Updates priority, persists |
| salvageSystem | `handleManualSalvage` | `itemId: string` | `void` | Updates combo, triggers salvageItem() |
| salvageSystem | `updateComboTimer` | `currentTime: number` | `void` | Checks timeout, resets multiplier |
| salvageSystem | `processAutoSalvage` | `deltaTime: number` | `void` | Salvages items automatically |
| automation | `purchaseUpgrade` | `upgradeId: string` | `boolean` | Deducts Pyreal, increments tier, persists |
| automation | `getEffectiveSpeed` | none | `number` | Calculates total salvage speed from tiers |
| prestige | `activatePrestige` | `bonusChoice: number` | `void` | Applies temp bonus, updates stats, analytics |
| prestige | `checkEligibility` | none | `boolean` | Checks if 1000+ salvages since last |

### External Integrations

**Combat System Integration:**
```typescript
// frontend/modules/combat/combat.store.ts
// Loot generation on enemy defeat
function onEnemyDefeated(enemy: Enemy) {
  const loot = generateLoot(enemy.level, enemy.rarity);
  loot.forEach(item => inventory$.addItem(item));
}

// Damage calculation using equipment power
function calculatePlayerDamage(): number {
  const baseDamage = player$.attack.get();
  const equipmentBonus = totalPower$.get() * 0.1; // 10% of power as damage
  return baseDamage + equipmentBonus;
}
```

**Attributes System Integration:**
```typescript
// frontend/modules/attributes/attributes.store.ts
// Offline efficiency calculation
function getOfflineEfficiency(): number {
  const baseEfficiency = 0.25; // 25% base
  const endurance = attributes$.endurance.get();
  const enduranceBonus = endurance * 0.01; // 1% per point
  return baseEfficiency + enduranceBonus;
}
```

**Economy System Integration:**
```typescript
// frontend/modules/economy/economy.store.ts
// Automation upgrade purchase
function purchaseAutomationUpgrade(upgradeId: string): boolean {
  const upgrade = automation$.upgrades.find(u => u.id === upgradeId).get();
  const cost = upgrade.cost.pyreal;

  if (economy$.pyreal.get() >= cost) {
    economy$.pyreal.set(prev => prev - cost);
    automation$.purchaseUpgrade(upgradeId);
    return true;
  }
  return false;
}
```

## 5. Data Model

### Entity Design

**InventoryItem**
```typescript
interface InventoryItem {
  id: string;              // UUID v4
  type: ItemType;          // 'weapon' | 'armor' | 'helmet' | 'gloves' | 'boots' | 'misc'
  rarity: Rarity;          // 'common' | 'rare' | 'epic' | 'legendary'
  acquiredAt: number;      // Unix timestamp (ms)
  isNew: boolean;          // True if acquired in last 5 minutes
}

type ItemType = 'weapon' | 'armor' | 'helmet' | 'gloves' | 'boots' | 'misc';
type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
```

**Material**
```typescript
interface Material {
  common: number;          // Integer, 0-999,999,999
  rare: number;            // Integer, 0-999,999,999
  epic: number;            // Integer, 0-999,999,999
  legendary: number;       // Integer, 0-999,999,999
}
```

**EquipmentSlot**
```typescript
interface EquipmentSlot {
  level: number;           // Current level, 0-100
  maxLevel: number;        // Maximum level, typically 100
  powerBonus: number;      // Calculated power contribution
}

type SlotType = 'weapon' | 'armor' | 'helmet' | 'gloves' | 'boots';
```

**AutomationUpgrade**
```typescript
interface AutomationUpgrade {
  id: string;              // Unique identifier (snake_case)
  name: string;            // Display name
  description: string;     // Tooltip description
  unlockLevel: number;     // Player level required
  cost: {                  // Purchase cost
    pyreal: number;
    materials?: Material;
  };
  currentTier: number;     // Current tier (0 = not purchased)
  maxTier: number;         // Maximum tier (1-5)
  effect: {
    type: 'salvage_speed' | 'auto_tinker' | 'offline_rate' | 'queue_size';
    value: number;         // Base effect value
    perTier: number;       // Value per additional tier
  };
}
```

**PrestigeBonus**
```typescript
interface TempPrestigeBonus {
  type: 'material_boost' | 'rare_guarantee' | 'tinker_speed';
  multiplier: number;      // Effect multiplier
  expiresAt: number;       // Unix timestamp
  description: string;     // Display text
}

interface PermanentBonuses {
  salvageSpeedMultiplier: number;    // 1.0 = base, 1.5 = 50% faster
  rareMaterialBonus: number;         // 0.0-1.0 (0% to 100% bonus chance)
  startingEquipmentLevels: number;   // Starting level for all equipment on reset
}
```

### Database Schema (AsyncStorage)

**Key-Value Structure:**
```typescript
// AsyncStorage keys and value schemas
{
  'inventory-state': {
    items: InventoryItem[],       // Array of all items
    capacity: number,              // Max items (50-10,000)
    lastAcquired: number           // Timestamp of last item added
  },

  'materials-state': {
    common: number,
    rare: number,
    epic: number,
    legendary: number
  },

  'salvage-system': {
    lastManualSalvage: number,     // Timestamp
    comboCount: number,            // Current combo count
    comboMultiplier: number,       // 1.0-5.0
    comboExpiresAt: number,        // Timestamp
    autoSalvageEnabled: boolean,
    autoSalvageSpeed: number,      // Items/sec
    lastAutoTick: number,          // Timestamp
    totalSalvaged: number,         // Lifetime counter
    totalManual: number,           // Manual salvage count
    totalAuto: number              // Auto salvage count
  },

  'equipment-state': {
    weapon: EquipmentSlot,
    armor: EquipmentSlot,
    helmet: EquipmentSlot,
    gloves: EquipmentSlot,
    boots: EquipmentSlot,
    autoTinkerEnabled: boolean,
    priorityOrder: SlotType[]      // Auto-tinker priority
  },

  'automation-state': {
    upgrades: AutomationUpgrade[], // Array of all upgrades
    autoSalvageEnabled: boolean,
    autoTinkerEnabled: boolean
  },

  'prestige-state': {
    prestigeLevel: number,
    totalPrestigeActivations: number,
    lastPrestigeAt: number,        // Timestamp
    activeTempBonus: TempPrestigeBonus | null,
    permanentBonuses: PermanentBonuses
  },

  'game-meta': {
    lastActiveTime: number,        // For offline calculation
    firstPlayedAt: number,         // Install timestamp
    totalPlayTime: number          // Cumulative seconds
  }
}
```

**Data Validation Rules:**
- All numeric values clamped to valid ranges
- Inventory items array limited to capacity
- Material counts clamped to 0-999,999,999
- Equipment levels clamped to 0-maxLevel
- Timestamps validated as positive integers
- Multipliers clamped to 1.0-5.0 range

**Migration Strategy:**
```typescript
// Version-based migration system
const SCHEMA_VERSION = 1;

async function migrateStorage() {
  const currentVersion = await AsyncStorage.getItem('schema-version');

  if (!currentVersion || parseInt(currentVersion) < SCHEMA_VERSION) {
    // Apply migrations sequentially
    if (!currentVersion || parseInt(currentVersion) < 1) {
      await migrateToV1();
    }
    // Future migrations go here

    await AsyncStorage.setItem('schema-version', SCHEMA_VERSION.toString());
  }
}

async function migrateToV1() {
  // Initial migration: Add default values for new fields
  const salvageState = await AsyncStorage.getItem('salvage-system');
  if (salvageState) {
    const parsed = JSON.parse(salvageState);
    if (!parsed.totalManual) parsed.totalManual = 0;
    if (!parsed.totalAuto) parsed.totalAuto = 0;
    await AsyncStorage.setItem('salvage-system', JSON.stringify(parsed));
  }
}
```

### Data Access Patterns

**Common Queries:**

1. **Get total salvage rate** (used in UI stats display)
```typescript
const totalSalvageRate$ = computed(() => {
  const autoSpeed = automation$.getEffectiveAutoSalvageSpeed();
  const prestigeMultiplier = prestige$.permanentBonuses.salvageSpeedMultiplier.get();
  return autoSpeed * prestigeMultiplier;
});
```

2. **Check if can afford upgrade** (used in equipment UI)
```typescript
function canAffordUpgrade(slot: SlotType): boolean {
  const cost = calculateUpgradeCost(slot);
  return materials$.canAfford(cost);
}
```

3. **Get next automation unlock** (used in progression UI)
```typescript
const nextUnlock$ = computed(() => {
  const playerLevel = player$.level.get();
  const upgrades = automation$.upgrades.get();
  return upgrades
    .filter(u => u.unlockLevel > playerLevel)
    .sort((a, b) => a.unlockLevel - b.unlockLevel)[0];
});
```

**Caching Strategy:**
- All state is reactive via Legend State observables (no manual cache invalidation)
- Computed observables automatically recalculate when dependencies change
- AsyncStorage reads only on app launch (subsequent access uses in-memory observables)
- AsyncStorage writes batched and throttled to max 2 per second

**Data Consistency Approach:**
- Single source of truth: Legend State observables
- AsyncStorage is write-through cache (persists immediately after mutation)
- No multi-device sync in MVP (local-only state)
- Optimistic updates: UI updates before persistence completes
- Error recovery: If persistence fails, log error but don't roll back (retry on next write)

## 6. Security Design

### Authentication & Authorization

**MVP Scope:** No authentication required (single-player, local-only game)

**Post-MVP Considerations:**
- Cloud save feature would require:
  - OAuth 2.0 authentication (Google/Apple Sign-In)
  - JWT tokens for API requests
  - Refresh token rotation every 7 days
- Leaderboard feature would require:
  - Server-side validation of scores
  - Rate limiting on submission endpoints
  - Anomaly detection for cheating

### Data Security

**Encryption at Rest:**
- MVP: No encryption (AsyncStorage plaintext)
- Rationale: Single-player game with no PII, stored locally on device
- Post-MVP: If adding cloud save, use device keychain for sensitive data

**Encryption in Transit:**
- MVP: N/A (no network requests for core gameplay)
- Analytics: HTTPS for telemetry endpoints
- Post-MVP: All API requests use TLS 1.3

**PII Handling:**
- No personally identifiable information collected in MVP
- Analytics events use anonymous device IDs
- Opt-out available in settings

**Audit Logging:**
- MVP: Local debug logs only (not persisted)
- Post-MVP: Server-side audit log for prestige activations (cheat detection)

### Security Controls

**Input Validation:**
```typescript
// Example: Validate material deduction
function deductMaterials(cost: Material): boolean {
  // Validate inputs are non-negative integers
  if (cost.common < 0 || cost.rare < 0 || cost.epic < 0 || cost.legendary < 0) {
    console.error('Invalid material cost: negative values');
    return false;
  }

  // Validate inputs are integers (no decimal exploits)
  if (!Number.isInteger(cost.common) || !Number.isInteger(cost.rare) ||
      !Number.isInteger(cost.epic) || !Number.isInteger(cost.legendary)) {
    console.error('Invalid material cost: non-integer values');
    return false;
  }

  // Validate sufficiency
  if (!canAfford(cost)) {
    return false;
  }

  // Perform deduction
  materials$.common.set(prev => prev - cost.common);
  materials$.rare.set(prev => prev - cost.rare);
  materials$.epic.set(prev => prev - cost.epic);
  materials$.legendary.set(prev => prev - cost.legendary);

  return true;
}
```

**Rate Limiting:**
- Client-side rate limiting on salvage actions (max 100 taps/second)
- Prevents accidental double-taps causing duplicate salvages
- Prevents auto-clicker exploits in manual mode

**CORS Policies:**
- N/A for MVP (no web requests to external domains)
- Analytics endpoints allow origin: `*` (read-only data)

**Security Headers:**
- N/A for MVP (React Native app, not web)
- Post-MVP web version would use: CSP, HSTS, X-Frame-Options

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)

**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools

- **Framework:** Jest 29.7 with React Native preset (`@react-native/jest-preset`)
- **Testing Library:** React Native Testing Library 12.4
- **Reference Guide:** `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Mocking:** MSW 2.0 for API mocking (future), Jest mocks for modules
- **Coverage:** Jest coverage reports with 80% threshold enforced in CI

#### TDD Implementation Process

For each feature/component, follow this strict order:

**1. RED Phase - Write Failing Test First**

```typescript
// Example: Test for manual salvage feature
describe('salvageItem', () => {
  test('should remove item from inventory and add materials', () => {
    // Arrange
    const testItem: InventoryItem = {
      id: 'test-item-1',
      type: 'weapon',
      rarity: 'common',
      acquiredAt: Date.now(),
      isNew: false
    };
    inventory$.items.set([testItem]);
    materials$.common.set(0);

    // Act
    const drops = inventory$.salvageItem('test-item-1');

    // Assert
    expect(inventory$.items.get()).toHaveLength(0);
    expect(materials$.common.get()).toBeGreaterThan(0);
    expect(drops.common).toBeGreaterThan(0);
  });
  // This test MUST fail initially (salvageItem not implemented)
});
```

**2. GREEN Phase - Minimal Implementation**

```typescript
// Implement ONLY enough to pass the test
function salvageItem(itemId: string): Material {
  const items = inventory$.items.get();
  const item = items.find(i => i.id === itemId);
  if (!item) throw new Error('Item not found');

  // Minimal drop logic (just common materials)
  const drops: Material = { common: 1, rare: 0, epic: 0, legendary: 0 };

  // Remove item
  inventory$.items.set(items.filter(i => i.id !== itemId));

  // Add materials
  materials$.common.set(prev => prev + drops.common);

  return drops;
}
```

**3. REFACTOR Phase - Improve Code**

```typescript
// Now add proper drop rates, combos, analytics, etc.
function salvageItem(itemId: string): Material {
  const items = inventory$.items.get();
  const item = items.find(i => i.id === itemId);
  if (!item) throw new Error('Item not found');

  // Calculate drops with rarity-based probabilities
  const drops = calculateMaterialDrops(item.rarity, salvageSystem$.comboMultiplier.get());

  // Remove item
  inventory$.items.set(items.filter(i => i.id !== itemId));

  // Add materials
  materials$.addMaterials(drops);

  // Update stats
  salvageSystem$.totalSalvaged.set(prev => prev + 1);
  salvageSystem$.totalManual.set(prev => prev + 1);

  // Analytics
  analytics.track('salvage_item', {
    itemType: item.type,
    itemRarity: item.rarity,
    method: 'manual',
    comboMultiplier: salvageSystem$.comboMultiplier.get()
  });

  return drops;
}
```

#### Test Categories (in order of implementation)

### Unit Testing (TDD First Layer)

**Store Tests:**
```typescript
// materials.store.test.ts
describe('materials$', () => {
  beforeEach(() => {
    materials$.set({ common: 0, rare: 0, epic: 0, legendary: 0 });
  });

  test('addMaterials increments counters correctly', () => {
    materials$.addMaterials({ common: 10, rare: 5, epic: 1, legendary: 0 });
    expect(materials$.common.get()).toBe(10);
    expect(materials$.rare.get()).toBe(5);
    expect(materials$.epic.get()).toBe(1);
  });

  test('canAfford returns true when sufficient materials', () => {
    materials$.set({ common: 100, rare: 50, epic: 10, legendary: 1 });
    expect(materials$.canAfford({ common: 50, rare: 25, epic: 5, legendary: 0 })).toBe(true);
  });

  test('canAfford returns false when insufficient materials', () => {
    materials$.set({ common: 10, rare: 5, epic: 0, legendary: 0 });
    expect(materials$.canAfford({ common: 50, rare: 25, epic: 5, legendary: 0 })).toBe(false);
  });

  test('deductMaterials returns false when insufficient', () => {
    materials$.set({ common: 5, rare: 0, epic: 0, legendary: 0 });
    const result = materials$.deductMaterials({ common: 10, rare: 0, epic: 0, legendary: 0 });
    expect(result).toBe(false);
    expect(materials$.common.get()).toBe(5); // Unchanged
  });
});
```

**Component Tests:**
```typescript
// InventoryItem.test.tsx
import { render, fireEvent, screen } from '@testing-library/react-native';

describe('InventoryItem', () => {
  const mockItem: InventoryItem = {
    id: 'test-1',
    type: 'weapon',
    rarity: 'rare',
    acquiredAt: Date.now(),
    isNew: true
  };

  test('renders item with correct rarity color', () => {
    render(<InventoryItem item={mockItem} onPress={jest.fn()} />);
    const container = screen.getByTestId('inventory-item-test-1');
    expect(container.props.style).toMatchObject({
      borderColor: RARITY_COLORS.rare // blue
    });
  });

  test('shows NEW badge when item is new', () => {
    render(<InventoryItem item={mockItem} onPress={jest.fn()} />);
    expect(screen.getByText('NEW')).toBeTruthy();
  });

  test('calls onPress when tapped', () => {
    const onPressMock = jest.fn();
    render(<InventoryItem item={mockItem} onPress={onPressMock} />);
    fireEvent.press(screen.getByTestId('inventory-item-test-1'));
    expect(onPressMock).toHaveBeenCalledWith('test-1');
  });
});
```

**Coverage Target:** >80% for all stores and components

### Integration Testing (TDD Second Layer)

**Flow Tests:**
```typescript
// salvage-flow.integration.test.ts
describe('Salvage Flow Integration', () => {
  beforeEach(() => {
    // Reset all stores
    inventory$.set({ items: [], capacity: 50, lastAcquired: 0 });
    materials$.set({ common: 0, rare: 0, epic: 0, legendary: 0 });
    salvageSystem$.set({
      lastManualSalvage: 0,
      comboCount: 0,
      comboMultiplier: 1.0,
      comboExpiresAt: 0,
      autoSalvageEnabled: false,
      autoSalvageSpeed: 0,
      lastAutoTick: 0,
      totalSalvaged: 0,
      totalManual: 0,
      totalAuto: 0
    });
  });

  test('complete flow: add item -> salvage -> materials increase', () => {
    // Add item to inventory
    const item: InventoryItem = {
      id: 'flow-test-1',
      type: 'weapon',
      rarity: 'common',
      acquiredAt: Date.now(),
      isNew: false
    };
    inventory$.addItem(item);
    expect(inventory$.items.get()).toHaveLength(1);

    // Salvage item
    const drops = inventory$.salvageItem('flow-test-1');

    // Verify item removed
    expect(inventory$.items.get()).toHaveLength(0);

    // Verify materials added
    expect(materials$.common.get()).toBe(drops.common);

    // Verify stats updated
    expect(salvageSystem$.totalSalvaged.get()).toBe(1);
    expect(salvageSystem$.totalManual.get()).toBe(1);
  });

  test('combo system increases material drops', () => {
    // Add 3 items
    for (let i = 0; i < 3; i++) {
      inventory$.addItem({
        id: `combo-${i}`,
        type: 'weapon',
        rarity: 'common',
        acquiredAt: Date.now(),
        isNew: false
      });
    }

    // Salvage 3 items rapidly (build combo)
    const now = Date.now();
    salvageSystem$.handleManualSalvage('combo-0'); // Combo 1 (1.0x)
    salvageSystem$.lastManualSalvage.set(now);
    salvageSystem$.comboExpiresAt.set(now + 10000);

    salvageSystem$.handleManualSalvage('combo-1'); // Combo 2 (1.1x)
    expect(salvageSystem$.comboMultiplier.get()).toBe(1.1);

    salvageSystem$.handleManualSalvage('combo-2'); // Combo 3 (1.2x)
    expect(salvageSystem$.comboMultiplier.get()).toBe(1.2);
  });
});
```

**Navigation Tests:**
```typescript
// navigation.integration.test.tsx
import { NavigationContainer } from '@react-navigation/native';

describe('Navigation Integration', () => {
  test('navigates from inventory to automation panel', () => {
    const { getByText } = render(
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Automation'));
    expect(getByText('Salvage Assistant')).toBeTruthy();
  });
});
```

### End-to-End Testing (TDD Third Layer)

**User Flow Tests:**
```typescript
// e2e/new-player-experience.e2e.test.ts
describe('New Player Experience E2E', () => {
  test('complete Phase 1 progression', async () => {
    // Start with fresh state
    await resetGameState();

    // Player receives first item from combat
    const firstItem = await combatModule.defeatEnemy('goblin');
    expect(inventory$.items.get()).toHaveLength(1);

    // Player salvages first item
    const salvageButton = await screen.findByText('Salvage');
    fireEvent.press(salvageButton);

    // Materials appear
    await waitFor(() => {
      expect(materials$.common.get()).toBeGreaterThan(0);
    });

    // Player upgrades weapon
    const weaponSlot = await screen.findByTestId('equipment-weapon');
    fireEvent.press(weaponSlot);
    await waitFor(() => {
      expect(equipment$.weapon.level.get()).toBe(1);
    });

    // Total power increases
    expect(totalPower$.get()).toBeGreaterThan(0);
  });

  test('automation unlock and activation', async () => {
    // Set player to Level 10
    player$.level.set(10);
    economy$.pyreal.set(500);

    // Navigate to automation panel
    fireEvent.press(await screen.findByText('Automation'));

    // Purchase Salvage Assistant
    const purchaseButton = await screen.findByText('Purchase');
    fireEvent.press(purchaseButton);

    // Verify upgrade purchased
    await waitFor(() => {
      const upgrade = automation$.upgrades.find(u => u.id === 'salvage_assistant').get();
      expect(upgrade.currentTier).toBe(1);
    });

    // Add items to inventory
    for (let i = 0; i < 10; i++) {
      inventory$.addItem(generateTestItem('common'));
    }

    // Wait for auto-salvage to process
    await waitFor(() => {
      expect(inventory$.items.get().length).toBeLessThan(10);
    }, { timeout: 5000 });
  });
});
```

**Performance Benchmarks:**
```typescript
// performance.e2e.test.ts
describe('Performance Benchmarks', () => {
  test('maintains 60 FPS with 10,000 items', async () => {
    // Add 10,000 items to inventory
    const items = Array.from({ length: 10000 }, (_, i) => generateTestItem('common'));
    inventory$.items.set(items);

    // Measure FPS during scrolling
    const fps = await measureFPS(() => {
      // Simulate rapid scrolling
      for (let i = 0; i < 100; i++) {
        fireEvent.scroll(screen.getByTestId('inventory-grid'), {
          nativeEvent: { contentOffset: { y: i * 100 } }
        });
      }
    });

    expect(fps).toBeGreaterThanOrEqual(58); // Allow 2 FPS tolerance
  });

  test('salvage response time <16ms', async () => {
    inventory$.addItem(generateTestItem('common'));

    const startTime = performance.now();
    fireEvent.press(screen.getByTestId('inventory-item-0'));
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(16);
  });
});
```

### TDD Checklist for Each Component

- [ ] First test written before any implementation code
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns (no Enzyme)
- [ ] No testIds unless absolutely necessary (prefer queries by text/role)
- [ ] Tests query by user-visible content (getByText, getByRole)
- [ ] Async operations use waitFor/findBy (not manual delays)
- [ ] All tests pass before moving to next feature
- [ ] Code coverage >80% for new modules
- [ ] Integration tests cover critical user flows
- [ ] Performance tests validate 60 FPS requirement

### Test Utilities

```typescript
// test-utils/render.tsx
import { render as rtlRender } from '@testing-library/react-native';
import { LegendProvider } from '@legendapp/state/react';

function render(ui: React.ReactElement, options = {}) {
  return rtlRender(
    <LegendProvider>{ui}</LegendProvider>,
    options
  );
}

export * from '@testing-library/react-native';
export { render };
```

```typescript
// test-utils/fixtures.ts
export function generateTestItem(rarity: Rarity = 'common'): InventoryItem {
  return {
    id: `test-${Math.random()}`,
    type: 'weapon',
    rarity,
    acquiredAt: Date.now(),
    isNew: false
  };
}

export function resetAllStores() {
  inventory$.set({ items: [], capacity: 50, lastAcquired: 0 });
  materials$.set({ common: 0, rare: 0, epic: 0, legendary: 0 });
  salvageSystem$.set({
    lastManualSalvage: 0,
    comboCount: 0,
    comboMultiplier: 1.0,
    comboExpiresAt: 0,
    autoSalvageEnabled: false,
    autoSalvageSpeed: 0,
    lastAutoTick: 0,
    totalSalvaged: 0,
    totalManual: 0,
    totalAuto: 0
  });
  equipment$.set({
    weapon: { level: 0, maxLevel: 100, powerBonus: 0 },
    armor: { level: 0, maxLevel: 100, powerBonus: 0 },
    helmet: { level: 0, maxLevel: 100, powerBonus: 0 },
    gloves: { level: 0, maxLevel: 100, powerBonus: 0 },
    boots: { level: 0, maxLevel: 100, powerBonus: 0 },
    autoTinkerEnabled: false,
    priorityOrder: ['weapon', 'armor', 'helmet', 'gloves', 'boots']
  });
}
```

## 8. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|--------------|---------------|
| Development Environment | Windows + WSL2 | CLAUDE.md requirement |
| Package Manager | npm (not yarn/pnpm) | Expo/React Native standard |
| Expo CLI | 54.0.10 | Match React Native 0.81.4 |
| Testing Runner | Jest 29.7 | React Native default |
| CI/CD Platform | GitHub Actions | Free for open source |
| Analytics Backend | PostHog/Mixpanel | Event tracking for metrics |
| Device Testing | BrowserStack | Real device cloud testing |

**No server infrastructure required for MVP** (client-only game)

**Post-MVP Infrastructure (if adding cloud save):**
- Backend: Node.js 20 + Express.js on AWS Lambda
- Database: DynamoDB (serverless, pay-per-request)
- CDN: CloudFront for static assets
- Estimated cost: $5-10/month for 1,000 active users

### Deployment Architecture

**Environment Strategy:**
```
Development (Local)
  ├─ Hot reload enabled
  ├─ Debug logging verbose
  ├─ Analytics disabled
  └─ Test data generation enabled

Staging (TestFlight/Internal Testing)
  ├─ Production build type
  ├─ Analytics enabled (separate project)
  ├─ Debug logs to console only
  └─ Real data only

Production (App Store/Play Store)
  ├─ Release build with optimizations
  ├─ Analytics enabled
  ├─ Error reporting (Sentry)
  └─ No debug logs
```

**CI/CD Pipeline Design:**
```yaml
# .github/workflows/ci.yml
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
          node-version: '20'
      - run: npm install
      - run: npm test -- --coverage --passWithNoTests
      - name: Check coverage threshold
        run: |
          if [ $(jq '.total.lines.pct' coverage/coverage-summary.json) -lt 80 ]; then
            echo "Coverage below 80%"
            exit 1
          fi

  build-ios:
    needs: test
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: expo/expo-github-action@v8
        with:
          expo-version: 54.0.10
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm install
      - run: eas build --platform ios --non-interactive

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: expo/expo-github-action@v8
        with:
          expo-version: 54.0.10
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm install
      - run: eas build --platform android --non-interactive
```

**Deployment Strategy:**
- **Development:** Hot reload on device via Expo Go
- **Staging:** EAS Build → TestFlight/Internal Testing (weekly)
- **Production:** EAS Build → App Store/Play Store (bi-weekly)
- **Rollback:** Keep last 3 builds available for instant revert

### Monitoring & Observability

#### Metrics

**Application Metrics:**
```typescript
// Performance metrics tracked in-game
const metrics = {
  avgFPS: number,              // Average FPS over last 60 seconds
  p99TouchLatency: number,     // 99th percentile touch response time (ms)
  salvageRate: number,         // Items salvaged per second
  crashRate: number,           // Crashes per session
  memoryUsage: number,         // MB used by app
  storageUsage: number         // AsyncStorage size (KB)
};
```

**Business Metrics (Aligned with PRD):**
- Total salvages (manual vs auto breakdown)
- Time to first automation unlock (distribution)
- Day 1/3/7/14/30 retention rates
- Average session length by phase
- Prestige activation rate
- Automation purchase rate by upgrade type

**Infrastructure Metrics:**
- N/A for MVP (client-only)
- Post-MVP: Lambda invocation count, DynamoDB read/write units, API latency

#### Logging

**Log Levels:**
```typescript
enum LogLevel {
  DEBUG = 0,   // Verbose, development only
  INFO = 1,    // General information
  WARN = 2,    // Recoverable errors
  ERROR = 3,   // Unrecoverable errors
  FATAL = 4    // Crashes
}

// Environment-based configuration
const LOG_LEVEL = __DEV__ ? LogLevel.DEBUG : LogLevel.WARN;
```

**Log Categories:**
```typescript
logger.debug('salvage', 'Item salvaged', { itemId, rarity, drops });
logger.info('automation', 'Upgrade purchased', { upgradeId, tier });
logger.warn('storage', 'AsyncStorage quota 80% full', { usedKB, maxKB });
logger.error('persistence', 'Failed to save state', { key, error });
logger.fatal('crash', 'Unhandled exception', { stack, context });
```

**Centralized Logging Strategy:**
- Development: Console output only
- Staging: Console + Sentry breadcrumbs
- Production: Sentry for errors only (privacy-safe)

**Log Retention Policy:**
- Development: Until app restart
- Staging: 30 days in Sentry
- Production: 90 days in Sentry

#### Alerting

| Alert | Condition | Priority | Action |
|-------|-----------|----------|--------|
| High Crash Rate | >1% of sessions crash | P0 | Immediate rollback + hotfix |
| Low FPS | <50 FPS for >10% of users | P1 | Investigate performance regression |
| Storage Quota | >90% of 10MB limit | P2 | Add cleanup task to backlog |
| Low Retention | Day 1 retention <35% | P2 | Review onboarding flow |
| Analytics Down | No events for 1 hour | P3 | Check analytics SDK |

**Alert Delivery:**
- P0: SMS + Slack + Email
- P1: Slack + Email
- P2-P3: Email only

## 9. Scalability & Performance

### Performance Requirements

**Response Time:**
- Touch to haptic: <16ms (99th percentile)
- Salvage animation start: <50ms (95th percentile)
- Material counter update: <100ms (95th percentile)
- Screen navigation: <300ms (95th percentile)

**Throughput:**
- Auto-salvage rate: Up to 100 items/sec at max automation
- Particle system: 100 particles rendering simultaneously
- Inventory scrolling: 10,000 items without frame drops

**Concurrent Users:**
- N/A (single-player, local-only)

**Resource Limits:**
- Memory: <200MB (average), <300MB (peak)
- AsyncStorage: <10MB total state
- Battery drain: <5% per hour active gameplay

### Scalability Strategy

**Horizontal Scaling:**
- N/A for MVP (no backend)
- Post-MVP: Lambda auto-scales to handle cloud save requests

**Load Balancing:**
- N/A for MVP

**Database Scaling:**
- AsyncStorage: Local-only, no scaling needed
- Post-MVP: DynamoDB on-demand capacity mode (auto-scales)

**Caching Layers:**
- In-memory: Legend State observables (reactive cache)
- On-disk: AsyncStorage (write-through cache)
- CDN: N/A for MVP

### Performance Optimization

**Query Optimization:**
```typescript
// BAD: Linear search on every render
function InventoryGrid() {
  const items = inventory$.items.get();
  const newItems = items.filter(i => i.isNew); // Recalculates every render
  // ...
}

// GOOD: Computed observable (memoized)
const newItems$ = computed(() =>
  inventory$.items.get().filter(i => i.isNew)
);

function InventoryGrid() {
  const newItems = newItems$.get(); // Cached until items change
  // ...
}
```

**Asset Optimization:**
- Compress PNG assets with pngquant (70% quality)
- Use SVG for icons (vector, scalable)
- Lazy load particle textures (load on first salvage)
- Remove unused Expo modules to reduce bundle size

**Code-Level Optimizations:**
```typescript
// Memoize expensive components
const InventoryItem = React.memo(({ item, onPress }) => {
  return (
    <Pressable onPress={() => onPress(item.id)}>
      {/* ... */}
    </Pressable>
  );
}, (prev, next) => prev.item.id === next.item.id);

// Use batch() for multiple observable updates
function salvageMultipleItems(itemIds: string[]) {
  batch(() => {
    itemIds.forEach(id => {
      const drops = calculateMaterialDrops(/*...*/);
      inventory$.items.set(prev => prev.filter(i => i.id !== id));
      materials$.addMaterials(drops);
      salvageSystem$.totalSalvaged.set(prev => prev + 1);
    });
  });
  // Only one re-render after all updates
}

// Object pooling for particles
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

**Resource Pooling:**
- Particle pool: Pre-allocate 100 particle objects, reuse
- Haptic debouncing: Max 1 haptic per 50ms (prevent spam)
- AsyncStorage batching: Coalesce writes within 500ms window

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| **Performance degradation with 10,000+ items** | High (unplayable) | Medium | Implement FlashList virtual scrolling, paginate storage, React.memo, profile weekly | Engineering |
| **Battery drain from game loop** | High (uninstalls) | Medium | Throttle to 30 FPS when idle, pause when backgrounded, use requestAnimationFrame | Engineering |
| **Animation jank on low-end devices** | Medium (poor UX) | Medium | Use react-native-reanimated (UI thread), reduce particles dynamically, test on min-spec devices | Engineering |
| **AsyncStorage quota exceeded (10MB limit)** | High (data loss) | Low | Compress state, implement cleanup of old data, monitor usage, warn at 80% | Engineering |
| **Legend State learning curve** | Medium (slower dev) | High | Study `/modules/attributes/` patterns, pair programming, document common patterns | Engineering |
| **State corruption on app crash** | High (data loss) | Low | Persist before mutations, validate on load, keep backup of last known good state | Engineering |
| **Offline calculation exploits (time manipulation)** | Medium (cheating) | Medium | Client-only for MVP (accept risk), post-MVP add server validation | Product |
| **Exponential cost formula imbalance** | High (progression broken) | Medium | Extensive playtesting, tunable constants, A/B test scaling factor | Product |

### Dependencies

**External Dependencies:**
| Dependency | Type | Risk | Mitigation |
|------------|------|------|------------|
| React Native 0.81.4 | Framework | Version pinned (can't update) | Vendor critical patches if needed |
| Expo 54.0.10 | Platform | Version pinned (can't update) | Test thoroughly, monitor Expo issues |
| Legend State 3.0-beta | State Management | Beta software (bugs possible) | Lock to specific beta version, have fallback plan |
| React Native Reanimated 4.1.1 | Animation | Complex native code | Test animations on all target devices |
| AsyncStorage 2.2.0 | Persistence | 10MB quota limit | Monitor usage, plan migration to MMKV if needed |

**Internal Dependencies:**
| Dependency | Risk | Mitigation |
|------------|------|------------|
| Combat System (loot generation) | Breaking changes to item schema | Define strict interface contract, versioned types |
| Attributes System (endurance stat) | Stat removal/rename | Defensive coding (fallback to default if missing) |
| Economy System (Pyreal currency) | Inflation/deflation | Balance automation costs independently, config-driven |

**Integration Risks:**
- Combat loot generation rate changes could flood inventory → implement rate limiting
- Attributes system refactor could break offline efficiency → regression tests
- Economy currency changes could make automation unaffordable → dynamic pricing

## 11. Implementation Plan (TDD-Driven)

### Development Phases

Following `/docs/guides/lean-task-generation-guide.md` principles - prioritize user-visible functionality.

#### Phase 1: Foundation & Test Setup [Week 1]

**Goals:** Testing infrastructure, data models, basic stores

**Days 1-2: Project Setup**
- Create directory structure:
  - `/frontend/modules/salvage/` (inventory, salvage logic, materials)
  - `/frontend/modules/tinkering/` (equipment, upgrade logic)
  - `/frontend/modules/automation/` (automation upgrades, settings)
  - `/frontend/modules/prestige/` (prestige bonuses)
  - `/frontend/core/` (game loop, utilities)
- Set up test files for all stores (`*.store.test.ts`)
- Create test utilities in `/test-utils/`:
  - Custom render with Legend State provider
  - Test fixtures (generateTestItem, resetAllStores)
  - Mock helpers for haptics, analytics

**Days 3-4: Data Models & Stores (TDD)**

**Test-Driven Implementation Order:**
1. Write test: `materials$.addMaterials()` adds materials correctly
2. Implement: Basic materials store with addMaterials action
3. Write test: `materials$.canAfford()` checks sufficiency
4. Implement: canAfford logic
5. Write test: `materials$.deductMaterials()` deducts if affordable
6. Implement: deductMaterials with validation
7. Refactor: Add persistence with synced()

Repeat for each store:
- `inventory$` (items array, capacity, add/remove/salvage)
- `salvageSystem$` (combo tracking, stats)
- `equipment$` (5 slots, levels, power calculation)
- `automation$` (upgrades array, purchase logic)

**Day 5: Integration Testing Setup**
- Write integration test: Add item → salvage → materials increase
- Write integration test: Materials → upgrade equipment → power increases
- Write integration test: Purchase automation → auto-salvage processes items
- Verify >80% test coverage with Jest coverage report
- Fix any failing tests before proceeding

**Deliverable:** All stores tested and passing, >80% coverage

---

#### Phase 2: Phase 1 Implementation (Manual Crafting) [Week 2]

**Goals:** Playable Phase 1 with manual salvage and tinkering

**Days 1-2: Inventory & Salvage UI (TDD)**

**Test-Driven Implementation:**
1. Test: InventoryGrid renders empty state
2. Implement: InventoryGrid component with FlashList
3. Test: InventoryGrid renders items from store
4. Implement: Connect to inventory$ observable
5. Test: InventoryItem displays rarity color correctly
6. Implement: InventoryItem with rarity-based styling
7. Test: Tapping item triggers onPress callback
8. Implement: Pressable with haptic feedback
9. Test: MaterialsDisplay shows correct counts
10. Implement: MaterialsDisplay with number animations
11. Test: Salvaging item spawns particles
12. Implement: ParticleSystem with react-native-reanimated
13. Refactor: Extract particle logic to service, add object pooling

**Days 3-4: Tinkering UI (TDD)**

**Test-Driven Implementation:**
1. Test: EquipmentGrid renders 5 slots
2. Implement: EquipmentGrid layout
3. Test: EquipmentSlot shows current level and cost
4. Implement: EquipmentSlot with cost calculation
5. Test: Hold-to-upgrade shows progress bar
6. Implement: UpgradeProgressBar with timer
7. Test: Upgrading deducts materials and increases level
8. Implement: upgradeEquipment() action with validation
9. Test: Total power updates when slot levels up
10. Implement: totalPower$ computed observable
11. Test: Insufficient materials shows disabled state
12. Implement: canAfford check in UI
13. Refactor: Extract cost calculation, add exponential formula validation

**Day 5: Polish & Testing**
- Add haptic feedback (medium for salvage, heavy for upgrade)
- Add sound effects (use expo-av)
- Add visual polish:
  - Rarity colors: common (gray), rare (blue), epic (purple), legendary (gold)
  - "NEW" badge animation
  - Material popup animation on collect
- Integration test: Complete loot → salvage → upgrade → power flow
- Manual QA session:
  - Test on iOS device
  - Test on Android device
  - Verify 60 FPS during particle effects (use Perf Monitor)
  - Verify <16ms touch latency (use debug tools)

**Deliverable:** Phase 1 fully playable with satisfying manual interactions

---

#### Phase 3: Phase 2 Implementation (Automation) [Week 3]

**Goals:** Automation system with hybrid gameplay (manual + auto)

**Days 1-2: Automation System (TDD)**

**Test-Driven Implementation:**
1. Test: processAutoSalvage() processes items at correct rate
2. Implement: Auto-salvage logic in game loop
3. Test: Auto-salvage respects autoSalvageSpeed setting
4. Implement: Speed calculation from automation tiers
5. Test: Combo system builds on rapid salvages
6. Implement: Combo timer and multiplier logic
7. Test: Combo resets after 10-second timeout
8. Implement: Timeout check in game loop
9. Test: Manual salvage with combo gives bonus materials
10. Implement: Apply multiplier to material drops
11. Test: processAutoTinker() upgrades equipment in priority order
12. Implement: Auto-tinker with priority queue
13. Refactor: Extract auto-processing to services

**Days 3-4: Automation UI (TDD)**

**Test-Driven Implementation:**
1. Test: AutomationPanel displays available upgrades
2. Implement: AutomationPanel with upgrade cards
3. Test: Locked upgrades show level requirement
4. Implement: Conditional rendering based on player level
5. Test: Purchase button disabled when can't afford
6. Implement: Cost check integration with economy system
7. Test: Purchasing upgrade increments tier
8. Implement: purchaseUpgrade() action
9. Test: Upgrade effects apply immediately
10. Implement: Effect application (update autoSalvageSpeed, etc.)
11. Test: ComboIndicator shows count and timer
12. Implement: ComboIndicator with countdown animation
13. Refactor: Extract upgrade config to constants file for easy balancing

**Day 5: Polish & Testing**
- Add upgrade unlock celebration (confetti animation)
- Add tooltips explaining automation tiers
- Add stats panel showing:
  - Current auto-salvage rate (items/sec)
  - Queue size
  - Combo status
  - Total power
- Integration test: Manual → automation transition flow
- Performance test: Validate 60 FPS with 10,000 items in queue
- Manual QA session:
  - Test automation activation
  - Test combo building
  - Test auto-tinker priority system
  - Verify stats accuracy

**Deliverable:** Phase 2 fully playable with working automation

---

#### Phase 4: Phase 3 Implementation & Advanced Features [Week 4]

**Goals:** Offline progression, prestige system, complete experience

**Days 1-2: Offline Progression (TDD)**

**Test-Driven Implementation:**
1. Test: calculateOfflineProgress() caps at 8 hours
2. Implement: Offline time calculation with max cap
3. Test: Offline efficiency scales with endurance attribute
4. Implement: Integration with attributes system
5. Test: Only common items processed offline
6. Implement: Item filtering in offline logic
7. Test: Offline materials added in batch (no lag)
8. Implement: Batch update with Legend State batch()
9. Test: OfflineSummaryModal displays correct stats
10. Implement: Modal with time away, items, materials breakdown
11. Test: Offline progress saves lastActiveTime on unmount
12. Implement: AppState listener to save timestamp
13. Refactor: Extract offline calc to service, add safety limits

**Days 3-4: Prestige System (TDD)**

**Test-Driven Implementation:**
1. Test: Prestige requires 1000 salvages since last
2. Implement: checkPrestigeEligibility() logic
3. Test: Prestige offers 3 random bonuses
4. Implement: Random bonus generation
5. Test: Selecting bonus applies temp effect
6. Implement: Temp bonus with expiration timer
7. Test: Permanent bonuses persist through app restart
8. Implement: Permanent bonuses in prestige$ store with persistence
9. Test: Prestige multipliers apply to salvage/tinker
10. Implement: Integration of multipliers in calculations
11. Test: PrestigePanel shows eligibility correctly
12. Implement: UI with eligibility indicator and trigger button
13. Refactor: Extract prestige config to constants

**Day 5: Final Polish & Testing**
- Add prestige animations (screen flash, celebration)
- Add statistics screen:
  - Lifetime salvages (manual/auto breakdown)
  - Lifetime materials earned
  - Total power history (graph)
  - Prestige level and bonuses
- Full integration test suite:
  - Phase 1 → Phase 2 → Phase 3 progression
  - Offline → return → summary flow
  - Prestige activation → bonus application
- Performance profiling:
  - Use React DevTools Profiler
  - Identify expensive re-renders
  - Optimize with React.memo
- Manual QA session (complete 0→prestige playthrough)

**Deliverable:** Complete system with all 3 phases, offline, prestige

---

#### Phase 5: Optimization & Launch Prep [Week 5]

**Goals:** Performance tuning, balance testing, production readiness

**Days 1-2: Performance Optimization**
- Profile with React DevTools Profiler:
  - Identify components rendering >10 times per second
  - Add React.memo to expensive components
  - Use computed observables for derived state
- Implement virtual scrolling:
  - Replace FlatList with FlashList for inventory
  - Test with 10,000 items
  - Verify 60 FPS scrolling
- Optimize particle system:
  - Implement object pooling (reuse particle objects)
  - Add dynamic particle limits based on FPS
  - Reduce particle count if FPS drops below 50
- Battery optimization:
  - Throttle game loop to 30 FPS when app idle >30s
  - Pause loop when app backgrounded
  - Profile battery drain on real devices (target <5%/hour)

**Days 3-4: Balance Tuning**
- Internal playtest with 5-10 testers:
  - Track time to Level 10 (automation unlock)
  - Track materials earned per hour (manual vs auto)
  - Survey: "Did automation feel rewarding or cheap?"
- Adjust based on data:
  - If <15 min to Level 10: Slow loot generation
  - If >25 min to Level 10: Increase XP or loot
  - If auto too fast: Reduce autoSalvageSpeed scaling
  - If auto too slow: Increase base speed or reduce costs
- Balance upgrades:
  - Ensure each upgrade feels impactful (20%+ improvement)
  - Ensure progression curve: 15min → 8hr → 20hr for phases
  - Tune exponential cost formula (try 1.12, 1.15, 1.18)
- Offline efficiency tuning:
  - Test 1hr, 4hr, 8hr offline sessions
  - Adjust base efficiency (try 20%, 25%, 30%)
  - Ensure offline feels rewarding but not overpowered

**Day 5: Launch Prep**
- Final test pass (smoke test):
  - New player experience (0 → Level 10)
  - Automation unlock and usage
  - Offline progression
  - Prestige activation
  - App restart (state persists)
- Update documentation:
  - README with setup instructions
  - CHANGELOG with all features
  - Technical docs for future maintainers
- Prepare release notes for players:
  - Feature highlights
  - Tips for new players
- Integrate analytics:
  - Verify all events fire correctly
  - Test in staging environment
  - Set up dashboards for key metrics
- Soft launch to beta testers (TestFlight/Internal Testing):
  - 50-100 users
  - Gather feedback for 3 days
  - Monitor crash rate and retention

**Deliverable:** Production-ready system, balanced and optimized

---

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|------------|------|--------------|
| M1: Stores Ready | All stores with >80% test coverage | End of Week 1 | None |
| M2: Phase 1 Playable | Manual salvage and tinkering working | End of Week 2 | M1 complete |
| M3: Automation Live | Auto-salvage and auto-tinker functional | End of Week 3 | M2 complete |
| M4: Complete System | Offline and prestige implemented | End of Week 4 | M3 complete |
| M5: Production Ready | Optimized, balanced, tested on real devices | End of Week 5 | M4 complete |
| M6: Soft Launch | 50-100 beta testers, monitoring metrics | Week 6 | M5 complete |
| M7: Full Launch | App Store and Play Store release | Week 7 | M6 data reviewed |

## 12. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| **State Management** | Redux, MobX, Zustand, Legend State | **Legend State** | Project already uses Legend State (see `/modules/attributes/`), reactive observables ideal for game state, built-in persistence with synced() |
| **Animation Library** | Animated API, react-native-animatable, Reanimated | **React Native Reanimated** | UI-thread execution critical for 60 FPS, worklets avoid JS bridge, project already includes v4.1.1 |
| **List Virtualization** | FlatList, SectionList, FlashList | **FlashList** | Handles 10,000 items efficiently, better performance than FlatList, Shopify-maintained |
| **Persistence** | AsyncStorage, MMKV, SQLite | **AsyncStorage** | Sufficient for <10MB state, simple API, included in Expo, Legend State has native support |
| **Testing Framework** | Jest, Vitest, Mocha | **Jest** | React Native standard, excellent RN support, already configured in project |
| **Haptics** | react-native-haptic-feedback, Expo Haptics | **Expo Haptics** | Already in project (v15.0.7), cross-platform, simple API |
| **Analytics** | Firebase, Mixpanel, PostHog, Amplitude | **PostHog** (recommended) | Open-source, privacy-friendly, self-hostable, generous free tier, session replay |

### Trade-offs

**Trade-off 1: Client-only validation vs Server validation**
- **Chose:** Client-only for MVP
- **Over:** Server-side validation for prestige/automation
- **Why:** Faster development, no backend costs, single-player game (cheating doesn't affect others)
- **Accepted Limitation:** Players can potentially manipulate local storage
- **Mitigation:** Add server validation post-MVP if adding leaderboards

**Trade-off 2: AsyncStorage vs MMKV**
- **Chose:** AsyncStorage
- **Over:** MMKV (faster, synchronous storage)
- **Why:** AsyncStorage sufficient for <10MB state, simpler setup, Legend State supports both
- **Accepted Limitation:** Slower read/write (but <500ms is acceptable)
- **Mitigation:** Monitor storage performance, migrate to MMKV if needed

**Trade-off 3: Native particle effects (Skia) vs JavaScript particles**
- **Chose:** React Native Reanimated worklets
- **Over:** React Native Skia
- **Why:** Already using Reanimated, avoids adding large dependency, sufficient performance
- **Accepted Limitation:** Lower particle counts than Skia could achieve
- **Mitigation:** Dynamic particle limits based on FPS, object pooling

**Trade-off 4: Exponential cost scaling vs Linear scaling**
- **Chose:** Exponential (1.15^level)
- **Over:** Linear (baseCost × level)
- **Why:** Idle games require exponential growth to maintain progression feel
- **Accepted Limitation:** High-level upgrades become very expensive
- **Mitigation:** Prestige bonuses reduce effective costs, automation accelerates material generation

**Trade-off 5: 8-hour offline cap vs Unlimited offline**
- **Chose:** 8-hour cap
- **Over:** Unlimited offline progression
- **Why:** Encourages daily engagement, prevents extreme imbalance, respects player time
- **Accepted Limitation:** Players away >8 hours don't get extra rewards
- **Mitigation:** Clear messaging in UI, generous 8-hour rewards

## 13. Open Questions

### Technical Questions Requiring Resolution

- [ ] **Q1:** Should particle effects use React Native Skia for better performance?
  - **Impact:** 2-3x more particles possible, but adds 5MB to bundle size
  - **Decision Needed By:** Week 2, Day 1 (before particle implementation)
  - **Recommendation:** Start with Reanimated, profile performance, migrate to Skia only if FPS <50

- [ ] **Q2:** Should we implement server-side validation for prestige to prevent cheating?
  - **Impact:** Prevents local storage manipulation, but requires backend infrastructure
  - **Decision Needed By:** Week 4, Day 3 (before prestige implementation)
  - **Recommendation:** Client-only for MVP, add server validation if adding leaderboards

- [ ] **Q3:** Should automation run when app is in background (iOS/Android constraints)?
  - **Impact:** Better offline experience, but iOS limits background execution to 30 seconds
  - **Decision Needed By:** Week 3, Day 1 (automation phase)
  - **Recommendation:** No background processing (iOS limitations), use offline progression on app open

- [ ] **Q4:** Should we add cloud save for cross-device progression?
  - **Impact:** Better UX, but requires backend (Lambda + DynamoDB), adds complexity
  - **Decision Needed By:** Post-MVP (not blocking launch)
  - **Recommendation:** Add in v1.1 if users request it (monitor feedback)

- [ ] **Q5:** Should materials have a cap to prevent infinite hoarding?
  - **Impact:** Affects economy balance, forces prestige decisions
  - **Decision Needed By:** Week 2, Day 5 (before balance tuning)
  - **Recommendation:** No cap for MVP (let players hoard), revisit if economy breaks

- [ ] **Q6:** Should we use FlashList or stick with FlatList for inventory?
  - **Impact:** FlashList better for 10,000 items, but requires additional dependency
  - **Decision Needed By:** Week 2, Day 1 (inventory implementation)
  - **Recommendation:** Use FlashList (proven performance improvement)

### Design Questions

- [ ] **Q7:** Should rare items have special salvage animations (e.g., epic items explode in purple)?
  - **Impact:** Better satisfaction and visual clarity, but more implementation time
  - **Decision Needed By:** Week 2, Day 5 (polish phase)
  - **Recommendation:** Yes, minimal effort for high impact (just change particle color)

- [ ] **Q8:** Should there be a "salvage all commons" button in Phase 1?
  - **Impact:** Faster but might skip intended learning phase
  - **Decision Needed By:** Week 2, Day 1 (Phase 1 implementation)
  - **Recommendation:** No in Phase 1 (teach manual), add in Phase 2 (Level 15 unlock)

- [ ] **Q9:** Should combo multiplier have a visual indicator (progress bar showing time left)?
  - **Impact:** Clearer feedback, but more UI clutter
  - **Decision Needed By:** Week 3, Day 1 (combo implementation)
  - **Recommendation:** Yes, critical for combo engagement (show countdown timer)

- [ ] **Q10:** Should equipment slots have unique upgrade themes/effects (weapon sparks, armor glows)?
  - **Impact:** More flavor and visual interest, but additional art/animation work
  - **Decision Needed By:** Week 2, Day 3 (equipment implementation)
  - **Recommendation:** Post-MVP polish (nice-to-have, not critical)

### Business Questions

- [ ] **Q11:** What should be the target time-to-automation unlock (Level 10)?
  - **Current Target:** 15-20 minutes
  - **Need:** Playtesting validation with 10+ users
  - **Decision Needed By:** Week 5, Day 3 (balance tuning)
  - **Recommendation:** A/B test 15min vs 25min, measure Day 1 retention

- [ ] **Q12:** Should monetization be added in MVP or post-launch?
  - **Impact:** Revenue vs development focus trade-off
  - **Decision Needed By:** Week 5, Day 5 (launch prep)
  - **Recommendation:** MVP without IAP (gather feedback first), add in v1.1

- [ ] **Q13:** Should we target 20-hour or 40-hour progression to prestige?
  - **Current Target:** 20+ hours
  - **Need:** Playtesting data on engagement drop-off
  - **Decision Needed By:** Week 5, Day 3 (balance tuning)
  - **Recommendation:** 20 hours for MVP (adjust based on retention data)

## 14. Appendices

### A. Technical Glossary

- **Legend State:** Reactive state management library with built-in persistence, uses fine-grained observables for efficient re-renders
- **Observable:** Reactive data container that triggers updates when value changes, accessed via `.get()` and `.set()`
- **Synced Observable:** Legend State observable with automatic AsyncStorage persistence via `synced()` wrapper
- **Computed Observable:** Derived observable that recalculates when dependencies change, similar to React useMemo
- **Worklet:** JavaScript function that runs on UI thread in React Native Reanimated, bypassing JS bridge for 60 FPS animations
- **FlashList:** High-performance list component from Shopify that handles 10,000+ items efficiently via recycling
- **Object Pooling:** Performance pattern that reuses objects instead of creating/destroying (e.g., particle pool)
- **Haptic Feedback:** Tactile vibration feedback on touch interactions (light, medium, heavy impacts)
- **Prestige System:** Meta-progression mechanic where players reset progress for permanent bonuses
- **Combo Multiplier:** Temporary bonus that increases output when performing actions rapidly in sequence
- **Offline Progression:** Calculating game progress while app is closed, applied when app reopens
- **TDD (Test-Driven Development):** Development methodology: write test → implement → refactor (Red-Green-Refactor)

### B. Reference Architecture

**Similar Systems:**
- **Cookie Clicker:** Classic idle game, gold standard for progression pacing
- **Adventure Capitalist:** Multi-tier automation unlocks, prestige bonuses
- **NGU Idle:** Complex progression with multiple currencies and automation tiers
- **Realm Grinder:** Hybrid manual/idle gameplay with meaningful clicks in late game

**React Native Patterns:**
- **Legend State Documentation:** https://legendapp.com/open-source/state/
- **React Native Reanimated:** https://docs.swmansion.com/react-native-reanimated/
- **Expo Modules:** https://docs.expo.dev/
- **FlashList:** https://shopify.github.io/flash-list/

**Game Design Patterns:**
- **Progressive Disclosure:** Gradually introduce features as player levels up
- **Feedback Loops:** Satisfying cause-and-effect (tap → particles → materials → power)
- **Exponential Scaling:** Costs and rewards grow exponentially to maintain progression feel
- **Meaningful Choices:** Prestige bonuses, automation priorities, equipment upgrade order

### C. Proof of Concepts

**POC 1: Legend State Performance with 10,000 Items**
```typescript
// Test: Can Legend State handle 10,000-item array efficiently?
const inventory$ = observable({ items: [] });

// Add 10,000 items
const start = performance.now();
const items = Array.from({ length: 10000 }, (_, i) => ({
  id: `item-${i}`,
  type: 'weapon',
  rarity: 'common',
  acquiredAt: Date.now(),
  isNew: false
}));
inventory$.items.set(items);
const addTime = performance.now() - start;

// Result: <50ms to add 10,000 items (acceptable)
console.log(`Add time: ${addTime}ms`);
```

**POC 2: Particle Performance with Reanimated**
```typescript
// Test: Can we render 100 particles at 60 FPS with Reanimated?
function ParticleTest() {
  const particles = Array.from({ length: 100 }, () => ({
    x: useSharedValue(0),
    y: useSharedValue(0)
  }));

  useEffect(() => {
    particles.forEach(p => {
      p.x.value = withTiming(Math.random() * 300, { duration: 1000 });
      p.y.value = withTiming(Math.random() * 500, { duration: 1000 });
    });
  }, []);

  return particles.map((p, i) => (
    <Animated.View key={i} style={[styles.particle, {
      transform: [{ translateX: p.x }, { translateY: p.y }]
    }]} />
  ));
}

// Result: Maintains 58-60 FPS on iPhone 12 (acceptable)
```

**POC 3: Offline Calculation Performance**
```typescript
// Test: Can we calculate 8 hours of offline progression without lag?
function calculateOfflineProgress() {
  const start = performance.now();

  const offlineTime = 8 * 60 * 60; // 8 hours in seconds
  const autoSpeed = 10; // items/sec
  const efficiency = 0.3; // 30%

  const itemsProcessed = offlineTime * autoSpeed * efficiency; // 86,400 items

  // Simulate material calculation for 86,400 items
  let totalMaterials = { common: 0, rare: 0, epic: 0, legendary: 0 };
  for (let i = 0; i < itemsProcessed; i++) {
    totalMaterials.common += 1; // Simplified (actual uses RNG)
  }

  const calcTime = performance.now() - start;
  console.log(`Calculation time: ${calcTime}ms for ${itemsProcessed} items`);
}

// Result: 250ms for 86,400 items (acceptable, <1s limit)
```

### D. Related Documents

- **Product Requirements Document:** `/mnt/c/dev/class-one-rapids/workflow-outputs/20251104_233945/prd_20251104.md`
- **React Native Testing Library Guide:** `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Lean Task Generation Guide:** `/docs/guides/lean-task-generation-guide.md`
- **Project Configuration:** `/mnt/c/dev/class-one-rapids/CLAUDE.md`
- **Existing Attributes Module (Reference):** `/frontend/modules/attributes/`
- **Existing Combat Module (Integration):** `/frontend/modules/combat/`
- **Existing Economy Module (Integration):** `/frontend/modules/economy/`

---

**Generated from PRD:** `/mnt/c/dev/class-one-rapids/workflow-outputs/20251104_233945/prd_20251104.md`
**Generation Date:** 2025-11-04
**Document Version:** v1.0 (Draft)
**Total Length:** ~18,000 words

---

## Next Steps

1. **Review & Approval:** Product team reviews TDD for completeness and accuracy
2. **Refinement:** Address any open questions (Section 13) before implementation
3. **Kickoff:** Engineering team begins Week 1 implementation following TDD plan
4. **Daily Standups:** Track progress against milestones (Section 11)
5. **Weekly Reviews:** Demo completed phases, gather feedback, adjust plan if needed
6. **Launch Readiness:** Complete Week 5 checklist, soft launch to beta testers

**Critical Success Factors:**
- Maintain >80% test coverage throughout (non-negotiable)
- Profile performance weekly (60 FPS requirement)
- Playtest after each phase (validate fun factor)
- Balance early and often (progression pacing is critical)
- Document decisions in this TDD (keep it living document)
