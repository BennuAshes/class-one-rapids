# Technical Design Document (TDD) Summary
## Salvage & Tinkering System

**Source**: `/mnt/c/dev/class-one-rapids/workflow-outputs/20251102_225941/tdd_20251102.extracted.md`
**Document Version**: v1.0
**Date**: 2025-11-02
**Status**: Draft

---

## 1. Feature Name and Overview

### System Name
**Salvage & Tinkering System - Progressive Automation Design**

### Executive Summary
A progressive automation system for mobile idle game salvaging and equipment upgrading, built on React Native/Expo. The system transitions players from manual clicking (satisfying immediate feedback) to strategic automation management (optimization gameplay), following proven idle game patterns while maintaining player agency throughout.

### Core Philosophy: Manual → Semi-Auto → Full Automation
The system follows the proven idle game pattern of starting with satisfying manual actions that gradually unlock automation, making each automation upgrade feel like a meaningful achievement rather than removing gameplay.

---

## 2. System Components

### Major Architecture Components

#### Core Game Engines
1. **SalvageEngine** - Item salvaging logic and material extraction
2. **TinkerEngine** - Equipment upgrade system and cost management
3. **AutomationManager** - Background automation processing and optimization
4. **ProgressionManager** - Level/XP tracking, unlock system, and prestige

#### Animation & Visual Systems
5. **ParticleSystem** (Reanimated 3) - Material burst particles, collection animations, popups
6. **UI Components Layer** - Dynamic UI evolution across phases

#### State Management
7. **Legend State** - Reactive global state store for all game data
8. **Persistence Layer** - AsyncStorage integration for save/load

#### Integration Points
9. **Audio Manager** - Sound effects and feedback (future)
10. **Analytics Service** - Event tracking (future)
11. **Cloud Sync API** - Optional Firebase/AWS backup (future)

### UI Component Hierarchy
- **Phase 1 UI**: Grid-based tap interface for manual actions
- **Phase 2 UI**: Management dashboard with automation controls
- **Phase 3 UI**: Command center with advanced statistics

---

## 3. Development Phases

### Phase 1: Manual Crafting (Tutorial → Level 10)
**Timeline**: Week 1 (5 days)
**Goal**: Player can manually salvage items and see materials increase with satisfying feedback

**Key Unlocks**:
- Level 5: Auto-Collect (materials fly to inventory automatically)
- Level 8: Batch Select (multi-item selection)
- Level 10: Salvage Assistant (first automation)

### Phase 2: Assisted Automation (Levels 11-25)
**Timeline**: Week 2 (5 days)
**Goal**: Introduce hybrid manual/auto gameplay with strategic depth

**Key Unlocks**:
- Level 11-22: Salvage automation progression (1 item/3sec → 10 items/sec)
- Level 12-20: Tinkering automation (auto-tinker, priority system, smart AI)
- Level 15: Material refinement (combine 3 common → 1 rare)
- Level 18: Salvage filters (control what gets auto-salvaged)

### Phase 3: Full Automation (Level 26+)
**Timeline**: Week 3+ (ongoing)
**Goal**: Optimize the machine, push boundaries with prestige system

**Key Unlocks**:
- Level 26: Master Salvager (100 items/sec, 10K queue)
- Level 30: Grand Tinkermaster (full auto tinkering)
- Level 35-40: Prestige system with cumulative bonuses
- Level 45+: Endgame optimization and resets

---

## 4. Data Models

### Core Entities

#### Item (Salvageable)
```typescript
interface Item {
  id: string;              // UUID
  type: ItemType;          // weapon, armor, accessory, consumable
  rarity: Rarity;          // common (1), rare (2), epic (3), legendary (4)
  salvageValue: number;    // Base material multiplier
  iconId: string;          // Asset reference
}
```

**Item Types**: Weapon, Armor, Accessory, Consumable

#### Material
```typescript
interface Material {
  type: MaterialType;
  quantity: number;
}

// Types: IRON, WOOD, LEATHER, GEMS, RARE_IRON, RARE_WOOD, EPIC_CRYSTAL (+ 45+ more)
// Color-coded with accessibility: color + shape (square, circle, diamond)
```

#### Equipment
```typescript
interface Equipment {
  id: string;
  slot: EquipmentSlot;     // Helmet, Chest, Weapon, etc. (9+ slots)
  level: number;           // Current upgrade level
  power: number;           // Calculated from level
  nextUpgradeCost: Material[];
  iconId: string;
}
```

**Equipment Slots**: Helmet, Chest, Legs, Boots, Weapon, Shield, 2 Rings, Necklace (extensible to 20+)

#### AutomationConfig
```typescript
interface AutomationConfig {
  salvageEnabled: boolean;
  salvageSpeed: number;        // Items per second
  salvagePriority: string[];   // Item IDs in priority order
  salvageFilters: ItemFilter[];

  tinkerEnabled: boolean;
  tinkerTarget: string | null; // Equipment ID or null for AI
  tinkerPriorities: Record<string, number>;

  offlineProgressionEnabled: boolean;
  lastTickTimestamp: number;
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
```

**Unlock Types by Level**:
- Level 5: AUTO_COLLECT
- Level 8: BATCH_SELECT
- Level 10: SALVAGE_ASSISTANT
- Level 12: AUTO_TINKER
- Level 15: MATERIAL_REFINEMENT
- Level 18: SALVAGE_FILTERS
- Level 20: SMART_TINKERING
- Level 26: MASTER_SALVAGER
- Level 30: GRAND_TINKERMASTER
- Level 35+: PRESTIGE

### State Management (Legend State Observables)

| Observable | Type | Purpose |
|-----------|------|---------|
| `materials$` | Record<MaterialType, number> | All material quantities |
| `inventory$` | Item[] | Salvageable items |
| `equipment$` | Equipment[] | Equipment pieces + levels |
| `automationSettings$` | AutomationConfig | Automation settings |
| `playerLevel$` | PlayerProgress | Player level, XP, unlocks |
| `unlocks$` | Set<UnlockType> | Unlocked features |

### Persistence (AsyncStorage)

**Primary Save** (`@salvage_save_v1`):
- PlayerProgress, Materials, Equipment, Inventory, AutomationConfig
- MD5 checksum for anti-cheat

**Secondary Data** (`@salvage_history_v1`):
- Recent salvages (last 100 for statistics)
- Prestige history

**Settings** (`@salvage_settings_v1`):
- Sound/music toggles, particle quality, reduced motion option

---

## 5. Core Features by Phase

### Phase 1: Manual Crafting (Levels 1-10)

**Salvaging Mechanics (FR1)**
- Click item → 0.5s animation → materials burst out
- Auto-collect after 2s or manual tap
- Counter updates with animated number popup
- Support 10+ simultaneous salvage animations
- Different particle colors per material type

**Tinkering Mechanics (FR2)**
- Drag materials to equipment → 2s channel animation
- 100% success rate (no failure)
- Power level increases with screen shake/flash
- Support 10+ equipment slots simultaneously

**First Unlocks**
- Level 5: Auto-collect materials
- Level 8: Batch select multiple items
- Level 10: Salvage Assistant (first automation)

**Gameplay Loop**
- Each click produces immediate, visible feedback
- Materials counter grows with satisfying popups
- Rare materials trigger special effects (flash, sound)

---

### Phase 2: Assisted Automation (Levels 11-25)

**Hybrid Gameplay (FR4)**
- Manual clicks 2x faster than automation
- Combo system: 10 sequential clicks → speed burst
- Critical hits: 5% chance for 5x materials
- Manual tinkering 50% cheaper than auto
- Real-time switching between modes

**Progressive Automation (FR3)**
```
Salvage Line: 1/3s → 1/2s → 1/1s → 3/s → 10/s
Tinkering Line: Basic toggle → Priority system → Smart AI suggestions
```

**Advanced Systems**
- Material refinement (combine 3 common → 1 rare)
- Salvage filters (auto-salvage rules)
- Priority queue management
- Manual override with bonuses

**UI Evolution**
- Progression from simple tap → management dashboard
- Automation control panel appears at Level 10
- Stats and optimization tools introduced

---

### Phase 3: Full Automation (Level 26+)

**Extreme Automation (FR5)**
- Process up to 100 items/second
- Queue holds 10,000+ items
- Offline progression (up to 48 hours)
- Prestige system (reset with cumulative bonuses)
- Auto-refining materials

**Advanced Features**
- Smart AI suggestions using player behavior patterns
- One-click acceptance of AI recommendations
- Command center UI with real-time statistics
- Endgame optimization and perfect the machine

**Meta-Gameplay**
- Big number watching (idle game satisfaction)
- Optimization challenges
- Prestige resets with increasing bonuses
- Cumulative progression across prestiges

---

## 6. Testing Requirements

### TDD Approach (Mandatory)
All implementation follows **Red-Green-Refactor**. No code without tests first.

### Testing Framework
- **Test Runner**: Jest 29 (React Native preset)
- **Component Testing**: React Native Testing Library
- **Mocking**: Jest mocks for AsyncStorage, Reanimated, Legend State
- **Performance**: Jest benchmarks with `performance.now()`
- **Target Coverage**: >80% for all services

### Test Categories (in order of implementation)

#### Unit Testing (Service Layer)
**SalvageEngine Tests**:
- Material yield calculation per item type/rarity
- 2x manual multiplier verification
- Critical hit RNG (5% occurrence)
- Batch processing

**TinkerEngine Tests**:
- Equipment upgrade mechanics
- Cost calculation and scaling
- 100% Phase 1 success rate
- 50% manual tinkering discount

**AutomationManager Tests**:
- Automation speed tiers
- Queue processing rates
- Offline progression calculation
- Rate limiting enforcement

**ProgressionManager Tests**:
- XP gain and level-up logic
- Unlock prerequisites
- Prestige system flow
- Bonus application

#### Integration Testing (Feature Flows)
**Salvage Flow Integration**:
- Complete salvage updates inventory, materials, XP
- Particle effects trigger correctly
- State updates are consistent
- Animations play without lag

**Automation Integration**:
- Automation processes items at configured speed
- Manual clicks still work during automation
- Queue management works correctly
- Offline progression calculates accurately

**Level Up & Unlock Flow**:
- Level-up triggers unlock notifications
- New UI appears after unlock
- Player can immediately use new feature

#### End-to-End Testing (Player Journey)
**Complete Player Progression E2E**:
- Player progresses Level 1 → Level 10
- Each unlock appears at correct level
- Manual gameplay works before automation
- Can transition to automation at Level 10

**Performance Benchmarks**:
- Salvage action completes <16ms
- 60fps maintained with 20 particle effects
- Offline calculation <2s for 24hr progress
- State saves don't block UI (debounced 5s)

---

## 7. Dependencies

### Core Framework Dependencies

| Dependency | Type | Risk | Mitigation | Status |
|-----------|------|------|------------|--------|
| React Native 0.73+ | Framework | Breaking changes | Pin version, test before upgrade | Active |
| Expo SDK 50+ | Platform | API deprecations | Follow Expo release cycle | Active |
| Legend State 2.x | State Mgmt | Niche library | Contribute to library, fork if needed | Active |
| React Native Reanimated 3.x | Animation | Performance issues | Fallback to Animated API | Active |
| AsyncStorage | Persistence | 6MB size limit (iOS) | Implement compression, cloud sync | Active |

### Development Dependencies

| Dependency | Purpose | Version |
|-----------|---------|---------|
| Jest 29 | Test runner | 29.0+ |
| React Native Testing Library | Component testing | 11.0+ |
| @testing-library/react | Test utilities | 13.0+ |
| TypeScript | Type safety | 5.0+ |
| ESLint | Code quality | 8.0+ |

### Testing Infrastructure
- **Mock Service Worker (MSW)**: Future API mocking
- **Reanimated Mocks**: Tested component animations
- **Custom Render Utility**: Legend State provider setup
- **Test Data Factories**: mockItem, mockEquipment, mockPlayer

### Device Support Requirements

| Platform | Min Version | Performance Tier |
|----------|------------|------------------|
| iOS | 13.0+ | High/Medium/Low degradation |
| Android | API 21+ (5.0) | High/Medium/Low degradation |

**Graceful Degradation**:
- High: Full particle effects, 60fps
- Medium: Reduced particles, 30fps
- Low: Minimal effects, functional only

### External Integrations (Future)

**Analytics** (Firebase Analytics)
- Events: salvage_item, tinker_success, level_up, automation_unlock, prestige_complete
- Custom parameters: item_type, material_type, level, manual_vs_auto

**Cloud Sync** (Firebase Firestore or AWS AppSync)
- Last-write-wins with timestamp conflict resolution
- Sync every 5 minutes when dirty
- End-to-end encryption of save data

**Audio** (React Native Audio)
- Particle burst effects
- Upgrade success sounds
- Level-up fanfare

---

## 8. Non-Functional Requirements

### Performance Targets

**Animation & Rendering**
- Maintain 60fps during up to 20 simultaneous particle effects
- State update latency: <16ms for salvage action
- Startup time: Salvage system ready <1s after app launch
- Memory footprint: <150MB RAM for entire salvage system

**Offline Progression**
- Calculate 24hr offline progress in <2s
- Support offline mode up to 48 hours
- Battery impact: <5% drain per hour active play

### Security

**Anti-Cheat Measures**
1. Checksum validation (MD5 hash of save state)
2. Timestamp validation (detect time manipulation)
3. Progression gates (cannot skip unlocks/levels)
4. Sanity checks (material quantities within expected ranges)
5. Rate limiting (max 20 manual clicks/sec, max 1000/minute)

**Data Protection**
- Client-side state validation and checksum verification
- Encrypted AsyncStorage (AES-256 via react-native-encrypted-storage)
- Device-specific hardware key (iOS Keychain, Android KeyStore)
- Future: HTTPS only, TLS 1.3+, certificate pinning

### Accessibility

**Color Blindness**
- Material particles use both color + shape (square, circle, diamond)
- No functionality dependent on color alone

**Reduced Motion**
- Option to disable particle effects
- Alternative animations for mandatory feedback

**Touch Targets**
- Minimum 44x44pt tap areas for all buttons

**Screen Reader**
- Announce salvage results
- Read material counts
- Provide context for all UI interactions

---

## 9. Implementation Timeline

### Detailed Breakdown

#### Week 1: Foundation & First Feature (5 days)
**Day 1**: Test Infrastructure Setup
- Configure Jest + React Native Testing Library
- Create custom render utility with Legend State
- Mock Reanimated and AsyncStorage
- **Deliverable**: `npm test` runs successfully

**Day 2**: Core Salvage Feature (TDD)
- Write failing tests for salvage flow
- Implement SalvageEngine service
- Create materials$ and inventory$ state
- Build SalvageButton component
- **Deliverable**: User can tap item, see materials increase, 100% coverage

**Day 3**: Tinkering Feature (TDD)
- Write failing tests for upgrade flow
- Implement TinkerEngine service
- Create equipment$ state
- Build TinkerButton component
- **Deliverable**: User can spend materials to upgrade equipment

**Day 4**: Visual Polish (TDD for Animations)
- Create ParticleSystem with Reanimated
- Implement material collection animation
- Add number popup component
- Screen shake effect
- **Deliverable**: Satisfying visual feedback for all actions

**Day 5**: First Unlock - Auto-Collect (TDD)
- Create ProgressionManager service
- Implement XP gain and level-up logic
- Build unlock system
- Auto-collect timer
- **Deliverable**: Player reaches Level 5, unlocks auto-collect

#### Week 2: Automation System (5 days)
**Day 6**: Basic Automation (TDD)
- Create AutomationManager service
- Build automation loop (requestAnimationFrame)
- Add toggle UI component
- Implement item queue system
- **Deliverable**: Automation processes items in background

**Day 7**: Manual Bonuses (TDD)
- Add 2x manual multiplier
- Implement combo system (10 clicks)
- Add critical hit RNG (5%)
- Build combo UI
- **Deliverable**: Manual clicking remains valuable

**Day 8**: Automation Upgrades (TDD)
- Add automation speed tiers (Levels 11-22)
- Implement progression speed increases
- Build upgrade UI
- AsyncStorage save/load
- **Deliverable**: Smooth progression through automation tiers

**Day 9**: Tinkering Automation (TDD)
- Auto-tinker toggle (Level 12)
- Priority system (Level 16)
- Smart AI suggestions (Level 20)
- Material refinement system
- **Deliverable**: Hybrid tinkering gameplay

**Day 10**: Polish & Testing (TDD)
- Integration test complete flow
- E2E test Level 1 → Level 25
- Performance benchmarking
- Device testing
- **Deliverable**: Complete Phase 2, ready for Phase 3

#### Week 3+: Full Automation & Endgame
- Master Salvager (Level 26)
- Grand Tinkermaster (Level 30)
- Prestige system (Level 35+)
- Offline progression
- Cloud sync integration

---

## 10. Key Architectural Decisions

### State Management: Legend State
**Why**: Reactive, performant, minimal boilerplate for mobile
- Auto-updating UI without Redux/Zustand complexity
- Computed values for derived state
- Batched updates for consistency

### Animations: Reanimated 3
**Why**: 60fps performance on mobile
- GPU-accelerated transforms
- Gesture responder integration
- Fallback to Animated API if needed

### Testing: TDD-First Approach
**Why**: Prevents scope creep, ensures quality
- Write tests before implementation
- Clear acceptance criteria per day
- Continuous refactoring for clean code

### Offline Progression: Client-Side Calculation
**Why**: No server dependency for MVP
- Fast-forward simulation on app launch
- Capped at 48 hours to prevent exploits
- Future: Cloud sync for cross-device

---

## 11. Success Metrics

| Metric | Target | Measurement | Timeline |
|--------|--------|------------|----------|
| Animation Performance | 60fps on mid-tier devices | React Native Performance Monitor | Week 1 |
| State Update Latency | <16ms for salvage | performance.now() instrumentation | Week 1 |
| Offline Calc Time | <2s for 24hr progression | Jest performance tests | Week 2 |
| Test Coverage | >80% for services | Jest coverage report | Continuous |
| Player Retention D7 | >40% reach Level 15 | Analytics events | Week 3+ |
| Memory Footprint | <150MB RAM | Profiling tools | Ongoing |

---

## 12. Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Reanimated performance issues | Medium | High | Fallback to Animated API, test early |
| AsyncStorage size limits | Low | Medium | Implement compression, cloud sync |
| Legend State library instability | Low | High | Contribute upstream, maintain fork capability |
| Cross-device save sync issues | Medium | Medium | Last-write-wins strategy, user warning |
| Battery drain from background tasks | Medium | Medium | Throttle automation, reduce effects on low power |

---

## 13. File Structure

```
src/
├── services/
│   ├── SalvageEngine.ts
│   ├── TinkerEngine.ts
│   ├── AutomationManager.ts
│   ├── ProgressionManager.ts
│   └── ParticleSystem.ts
├── state/
│   ├── materials.ts
│   ├── inventory.ts
│   ├── equipment.ts
│   ├── automationSettings.ts
│   └── playerProgress.ts
├── components/
│   ├── SalvageUI/
│   ├── TinkerUI/
│   ├── AutomationUI/
│   └── ProgressionUI/
├── types/
│   └── game.ts (all interfaces)
├── utils/
│   ├── calculations.ts
│   └── validators.ts
└── __tests__/
    ├── services/
    ├── components/
    └── integration/
```

---

## Document Metadata

**Generated**: 2025-11-02 23:07 UTC
**Source TDD File**: `tdd_20251102.extracted.md` (61KB)
**Summary Created By**: Claude Agent
**Status**: Complete extraction and structured organization

