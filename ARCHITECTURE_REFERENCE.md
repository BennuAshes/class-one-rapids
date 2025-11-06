# Architecture Reference - Salvage & Tinkering System

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      React Native App (Expo)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────── UI Layer ───────────────────────────┐   │
│  │                                                               │   │
│  │  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐     │   │
│  │  │ Salvage UI   │  │ Tinkering UI  │  │ Automation   │     │   │
│  │  │ Components   │  │ Components    │  │ Control UI   │     │   │
│  │  │              │  │               │  │              │     │   │
│  │  │ - SalvageBtn │  │ - TinkerBtn   │  │ - Toggle     │     │   │
│  │  │ - Inventory  │  │ - EquipmentUI │  │ - Settings   │     │   │
│  │  │ - Particles  │  │ - CostDisplay │  │ - Speedometer│     │   │
│  │  └──────┬───────┘  └───────┬───────┘  └──────┬───────┘     │   │
│  └─────────┼──────────────────┼──────────────────┼─────────────┘   │
│            │                  │                  │                  │
│  ┌─────────▼──────────────────▼──────────────────▼──────────────┐  │
│  │          Legend State (Global Reactive Store)                │  │
│  │                                                               │  │
│  │  Observables:                                                │  │
│  │  • materials$ : Record<MaterialType, number>                │  │
│  │  • inventory$ : Item[]                                       │  │
│  │  • equipment$ : Equipment[]                                  │  │
│  │  • automationSettings$ : AutomationConfig                   │  │
│  │  • playerLevel$ : PlayerProgress                            │  │
│  │  • unlocks$ : Set<UnlockType>                               │  │
│  │                                                               │  │
│  │  Events:                                                      │  │
│  │  • salvage:complete → {itemId, materials[], critical}       │  │
│  │  • tinker:success → {equipmentId, newLevel, power}          │  │
│  │  • level:up → {newLevel, unlocks[]}                         │  │
│  │  • automation:toggle → {type, enabled}                      │  │
│  │  • prestige:available → {options[]}                         │  │
│  └─────────┬──────────────────────────────────────┬────────────┘   │
│            │                                      │                 │
│  ┌─────────▼────────────────┐        ┌──────────▼──────────────┐  │
│  │ Game Logic Services      │        │ Animation Engine        │  │
│  │                          │        │ (Reanimated 3)          │  │
│  │ • SalvageEngine          │        │                         │  │
│  │   - salvageItem()        │        │ • ParticleSystem        │  │
│  │   - calculateYield()     │        │   - emitBurst()         │  │
│  │   - processBatch()       │        │   - animateCollection() │  │
│  │                          │        │   - showNumberPopup()   │  │
│  │ • TinkerEngine           │        │   - applyScreenEffect() │  │
│  │   - canUpgrade()         │        │                         │  │
│  │   - performUpgrade()     │        │ • Optimization:         │  │
│  │   - calculateCost()      │        │   - Adaptive quality    │  │
│  │   - getUpgradePower()    │        │   - Device tier detect  │  │
│  │                          │        │   - 60fps target        │  │
│  │ • AutomationManager      │        │                         │  │
│  │   - startAutomation()    │        │ Dependencies:           │  │
│  │   - setSpeed()           │        │ • React Native Reanimated │  │
│  │   - calculateOfflineProgress() │  │ • Performance.now()     │  │
│  │                          │        │ • requestAnimationFrame │  │
│  │ • ProgressionManager     │        │                         │  │
│  │   - addXP()              │        └─────────────────────────┘  │
│  │   - checkUnlocks()       │                                      │
│  │   - performPrestige()    │        ┌──────────────────────────┐  │
│  │   - canPrestige()        │        │ Audio Manager (Future)   │  │
│  │                          │        │ • Play salvage effects   │  │
│  │ Dependencies:            │        │ • Play upgrade sounds    │  │
│  │ • Legend State           │        │ • Play level-up fanfare  │  │
│  │ • Game config            │        └──────────────────────────┘  │
│  │ • RNG (seeded)           │                                      │
│  │ • Animation event emitter│        ┌──────────────────────────┐  │
│  └──────────┬───────────────┘        │ Analytics Service (Future)
│             │                        │ • Event tracking         │
│             │                        │ • Firebase Analytics     │
│  ┌──────────▼────────────────────────────────────────────────────┐ │
│  │      Persistence Layer (AsyncStorage + Device Storage)        │ │
│  │                                                                │ │
│  │  Keys:                                                         │ │
│  │  • @salvage_save_v1                                            │ │
│  │    - playerProgress (level, xp, unlocks)                       │ │
│  │    - materials (all quantities)                                │ │
│  │    - equipment (pieces + levels)                               │ │
│  │    - inventory (salvageable items)                             │ │
│  │    - automationConfig (settings)                               │ │
│  │    - checksum (MD5 anti-cheat)                                 │ │
│  │                                                                │ │
│  │  • @salvage_history_v1                                         │ │
│  │    - recentSalvages (last 100 events)                          │ │
│  │    - prestigeHistory (past choices)                            │ │
│  │                                                                │ │
│  │  • @salvage_settings_v1                                        │ │
│  │    - soundEnabled, musicEnabled, particleQuality              │ │
│  │    - reducedMotion, theme                                      │ │
│  │                                                                │ │
│  │  Features:                                                     │ │
│  │  • Encryption: AES-256 (hardware key)                         │ │
│  │  • Auto-save: Debounced 5s                                    │ │
│  │  • Background save on app suspend                             │ │
│  │  • Checksum validation on load                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

External Systems (Optional Future):
┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────┐
│ Cloud Sync API   │  │ Analytics API    │  │ Audio Streaming     │
│ (Firebase/AWS)   │  │ (Firebase)       │  │ (Spotify/Apple)     │
├──────────────────┤  ├──────────────────┤  ├─────────────────────┤
│ Conflict Res:    │  │ Events:          │  │ License:            │
│ Last-write-wins  │  │ salvage_item     │  │ Background music    │
│ Timestamp sync   │  │ tinker_success   │  │ Ambient effects     │
│ Encryption: TLS  │  │ level_up         │  │                     │
│                  │  │ automation_*     │  │                     │
└──────────────────┘  └──────────────────┘  └─────────────────────┘
```

---

## Data Flow Diagrams

### Salvage Flow (User Taps Item)

```
┌─────────────┐
│ User Taps   │
│ Salvage     │
│ Button      │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│ SalvageUI.handleSalvage()            │
│ - Dispatch salvage action            │
│ - Disable button during animation    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ SalvageEngine.salvageItem(            │
│   itemId: string,                    │
│   manual: boolean                    │
│ )                                     │
│                                      │
│ Logic:                               │
│ 1. Validate item exists              │
│ 2. Get item rarity & type            │
│ 3. Calculate base yield              │
│ 4. Apply manual multiplier (2x)      │
│ 5. Check critical hit (5%)           │
│ 6. Return SalvageResult              │
└──────┬───────────────────────────────┘
       │
       ├──► Emit 'salvage:complete' event
       │
       ├──► Update materials$ state (async)
       │    materials$.iron += result.quantity
       │
       ├──► Update inventory$ state
       │    inventory$ = inventory$.filter(i => i.id !== itemId)
       │
       └──► Add XP (async)
            ProgressionManager.addXP(itemValue)

       ▼ (Parallel)
┌──────────────────────────────────────┐
│ ParticleSystem Event Listener        │
│ On 'salvage:complete':               │
│ 1. emitBurst(itemPos, materials[])   │
│ 2. Play particles for 1s             │
│ 3. Animate materials to counter      │
│ 4. showNumberPopup(totalQuantity)    │
│ 5. Play audio (future)               │
└──────────────────────────────────────┘

       ▼ (After animation)
┌──────────────────────────────────────┐
│ UI Auto-Updates via Legend State     │
│ Reactivity                            │
│ - materials$ subscribers updated      │
│ - Material counter shows new total    │
│ - inventory$ subscribers updated      │
│ - Item disappears from list           │
└──────────────────────────────────────┘

       ▼
┌──────────────────────────────────────┐
│ SalvageUI.handleSalvage() cleanup    │
│ - Re-enable button                   │
│ - Reset state for next click         │
└──────────────────────────────────────┘
```

**Timeline**: ~1 second total (0.5s item animation + 0.5s particle effects)

---

### Automation Flow (Background Processing)

```
AutomationManager.tick() ← Called every frame by requestAnimationFrame

       ▼
┌──────────────────────────────────┐
│ Check automation enabled?         │
└──────────┬───────────────────────┘
           │ YES
           ▼
┌──────────────────────────────────┐
│ Calculate time since last process │
│ (using automationSettings$.      │
│  lastTickTimestamp)              │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Calculate required time interval  │
│ baseInterval = 1000 / speedIps    │
│ (if speed = 10 items/sec,        │
│  interval = 100ms)               │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Check: elapsed >= interval?       │
└──────────┬──────────┬────────────┘
           │ NO       │ YES
           │          ▼
           │    ┌──────────────────────────┐
           │    │ Get next item from queue │
           │    │ inventory$[0]            │
           │    └──────────┬───────────────┘
           │               │
           │               ▼
           │    ┌──────────────────────────┐
           │    │ SalvageEngine.           │
           │    │ salvageItem(id, false)   │
           │    │ (auto mode)              │
           │    └──────────┬───────────────┘
           │               │
           │               ├──► Update materials$
           │               │    (batched updates)
           │               │
           │               ├──► Remove from inventory$
           │               │
           │               ├──► Add XP
           │               │
           │               └──► Emit event (throttled UI update every 100ms)
           │
           └──► Continue to next frame

Offline Progression:
- App launches
- Calculate: deltaMs = now - lastSaveTimestamp
- Cap deltaMs at 48 hours
- Simulate automation ticks in fast-forward
- Apply accumulated results to state
- Show "Welcome Back" earnings screen
```

**Result**: Consistent processing rate (e.g., 10 items/sec = 600 items/minute)

---

### Level-Up & Unlock Flow

```
┌────────────────────────────────┐
│ Player gains XP                │
│ (from salvage/tinkering)       │
└──────┬───────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│ ProgressionManager.addXP(amt)  │
│                                │
│ 1. playerLevel$.xp += amt      │
│ 2. Check: xp >= xpToNextLevel? │
└──────┬───────────────────────────┘
       │
       ├─ NO ──► Return (no level up)
       │
       └─ YES ──┐
                ▼
        ┌────────────────────────────────┐
        │ Level up!                      │
        │ playerLevel$.level++           │
        │ playerLevel$.xp = 0            │
        │ playerLevel$.xpToNextLevel *= 1.1 (scaling)
        └──────┬───────────────────────────┘
               │
               ▼
        ┌────────────────────────────────┐
        │ Check unlocks for new level    │
        │ newUnlocks = checkUnlocks(newLevel)
        └──────┬───────────────────────────┘
               │
               ▼
        ┌────────────────────────────────┐
        │ For each unlock:                │
        │ 1. unlocks$.add(unlockType)    │
        │ 2. Emit 'level:up' event      │
        │ 3. Save to persistence         │
        └──────┬───────────────────────────┘
               │
               ▼
        ┌────────────────────────────────┐
        │ UI Components Listen:           │
        │ • ProgressionUI shows level up  │
        │ • New UI appears (auto-collect, │
        │   batch select, assistant)      │
        │ • Play celebration animation    │
        │ • Show unlock notification      │
        └──────────────────────────────────┘
```

**Example**:
- Level 4 (need 100 XP) → salvage 10 items (25 XP each) = 250 total
- Reach Level 5! Unlock AUTO_COLLECT
- Level 5 unlocked screen appears
- Materials now auto-collect after 0.5s

---

## Component Dependency Graph

```
Top-Level:
├─ App (Expo root)
│  └─ Legend State Provider setup
│
Main Screen:
├─ SalvageScreen
│  ├─ Uses: SalvageUI component
│  ├─ Uses: ProgressionUI component
│  ├─ Uses: ParticleSystem
│  └─ Listens: salvage:complete event
│
├─ TinkerScreen
│  ├─ Uses: TinkerUI component
│  ├─ Uses: EquipmentGrid
│  ├─ Uses: ParticleSystem
│  └─ Listens: tinker:success event
│
├─ AutomationScreen (unlocks at Level 10)
│  ├─ Uses: AutomationToggle
│  ├─ Uses: SpeedMeter
│  ├─ Uses: PriorityManager (Level 16+)
│  └─ Listens: automation:toggle event
│
└─ PrestigeScreen (unlocks at Level 35+)
   ├─ Uses: PrestigeChoice UI
   └─ Listens: prestige:available event

Services (Pure logic, no UI):
├─ SalvageEngine
│  ├─ Uses: materials$ state
│  ├─ Uses: inventory$ state
│  ├─ Emits: salvage:complete event
│  └─ Returns: SalvageResult
│
├─ TinkerEngine
│  ├─ Uses: equipment$ state
│  ├─ Uses: materials$ state
│  ├─ Emits: tinker:success event
│  └─ Returns: UpgradeResult
│
├─ AutomationManager
│  ├─ Uses: SalvageEngine
│  ├─ Uses: TinkerEngine
│  ├─ Uses: automationSettings$ state
│  ├─ Emits: automation:toggle event
│  └─ Runs: requestAnimationFrame loop
│
└─ ProgressionManager
   ├─ Uses: playerLevel$ state
   ├─ Uses: unlocks$ state
   ├─ Emits: level:up event
   └─ Emits: prestige:available event

State (Reactive):
├─ materials$ (observable)
├─ inventory$ (observable)
├─ equipment$ (observable)
├─ playerLevel$ (observable)
├─ unlocks$ (observable)
└─ automationSettings$ (observable)
   └─ All subscribers auto-update UI
```

---

## Testing Architecture

```
Test Stack:
├─ Jest (runner)
├─ React Native Testing Library (component testing)
├─ @testing-library/react (utilities)
└─ Custom test utilities
   ├─ custom-render (Legend State provider)
   ├─ test-data-factories (mockItem, mockEquipment)
   └─ jest-mocks (AsyncStorage, Reanimated)

Test Organization:
├─ __tests__/
│  ├─ services/
│  │  ├─ SalvageEngine.test.ts
│  │  ├─ TinkerEngine.test.ts
│  │  ├─ AutomationManager.test.ts
│  │  ├─ ProgressionManager.test.ts
│  │  └─ ParticleSystem.test.ts
│  │
│  ├─ components/
│  │  ├─ SalvageUI.test.tsx
│  │  ├─ TinkerUI.test.tsx
│  │  ├─ AutomationUI.test.tsx
│  │  └─ ProgressionUI.test.tsx
│  │
│  ├─ integration/
│  │  ├─ salvage-flow.integration.test.ts
│  │  ├─ tinkering-flow.integration.test.ts
│  │  ├─ automation-system.integration.test.ts
│  │  └─ player-progression.integration.test.ts
│  │
│  ├─ e2e/
│  │  ├─ level-1-to-10.e2e.test.ts
│  │  ├─ level-10-to-25.e2e.test.ts
│  │  └─ save-load.e2e.test.ts
│  │
│  └─ performance/
│     ├─ salvage-latency.perf.test.ts
│     ├─ animation-fps.perf.test.ts
│     ├─ offline-calc-time.perf.test.ts
│     └─ memory-usage.perf.test.ts

TDD Flow:
1. RED: Write failing test (describes requirement)
2. GREEN: Minimal code to pass test
3. REFACTOR: Improve while tests stay green

Coverage Goals:
├─ Line: >80%
├─ Branch: >75%
├─ Function: >80%
└─ Statements: >80%
```

---

## Key Architecture Principles

### 1. **Reactive State Management (Legend State)**
- Single source of truth for all game state
- UI auto-updates when state changes
- No manual setState/dispatch needed
- Computed values for derived data

### 2. **Service Layer Decoupling**
- Game engines (Salvage, Tinker, Automation) independent of UI
- Can be tested in isolation
- Can be reused across different UIs
- Easy to mock for testing

### 3. **Event-Driven Architecture**
- Services emit events when something happens
- UI components listen to relevant events
- Loose coupling between services and UI
- Easy to add new listeners (audio, analytics)

### 4. **TDD-First Development**
- Tests define behavior before code
- Quick feedback loop
- Confidence for refactoring
- Tests serve as documentation

### 5. **Performance Optimization**
- Reanimated for 60fps animations (GPU)
- Batched state updates to reduce re-renders
- RequestAnimationFrame for smooth automation
- Graceful degradation for low-end devices

### 6. **Security by Design**
- Checksum validation for save data
- Rate limiting on user actions
- Timestamp validation for offline prog
- Sanity checks on state values

---

## File Organization

```
src/
├── services/
│   ├── SalvageEngine.ts         (salvage logic)
│   ├── TinkerEngine.ts          (upgrade logic)
│   ├── AutomationManager.ts     (background processing)
│   ├── ProgressionManager.ts    (levels, unlocks)
│   └── ParticleSystem.ts        (animations)
│
├── state/
│   ├── materials.ts             (Legend State)
│   ├── inventory.ts
│   ├── equipment.ts
│   ├── automationSettings.ts
│   └── playerProgress.ts
│
├── components/
│   ├── SalvageUI/
│   │   ├── SalvageButton.tsx
│   │   ├── Inventory.tsx
│   │   └── styles.ts
│   ├── TinkerUI/
│   │   ├── TinkerButton.tsx
│   │   ├── Equipment.tsx
│   │   └── styles.ts
│   ├── AutomationUI/
│   │   ├── AutomationToggle.tsx
│   │   ├── SpeedControl.tsx
│   │   └── styles.ts
│   └── Common/
│       ├── ParticleEffect.tsx
│       ├── NumberPopup.tsx
│       └── styles.ts
│
├── types/
│   └── game.ts                  (all interfaces)
│
├── utils/
│   ├── calculations.ts          (formulas)
│   ├── validators.ts            (validation)
│   ├── persistence.ts           (save/load)
│   └── RNG.ts                   (seeded random)
│
├── __tests__/
│   ├── services/
│   ├── components/
│   ├── integration/
│   ├── e2e/
│   └── performance/
│
└── App.tsx                       (root component)
```

---

## Performance Budgets

| Metric | Budget | Measurement | Tool |
|--------|--------|-------------|------|
| Salvage Action | <16ms | action start to state update | performance.now() |
| Particle FPS | 60fps | simultaneous effects | React Native Performance Monitor |
| Animation FPS | 60fps | any animation | Reanimated performance |
| Offline Calc | <2s | 24hr calculation | Jest timeout |
| State Save | <100ms | AsyncStorage write | performance.now() |
| Memory | <150MB | RAM usage peak | Device profiler |
| Battery | <5%/hr | active play drain | Device battery monitor |

---

**Last Updated**: 2025-11-02
**Version**: 1.0
**Status**: Reference Complete

