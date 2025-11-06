# Salvage & Tinkering System - Technical Design Document

## Document Control
| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude | 2025-11-04 | Draft | Initial TDD from PRD |

## Executive Summary
This document details the technical implementation of a progressive salvage and tinkering system for the idle clicker game. The system follows the proven idle game pattern: starting with satisfying manual actions that gradually unlock automation, making each automation upgrade feel like a meaningful achievement. Built on the existing React Native/Expo architecture using Legend State for reactive state management.

## 1. Overview & Context

### Problem Statement
Players need a compelling progression system beyond combat that:
- Provides immediate tactile satisfaction (manual crafting)
- Gradually introduces automation as earned rewards
- Maintains player engagement across 20+ hours
- Enables idle gameplay while respecting player agency

### Solution Approach
Implement a three-phase progressive system:
1. **Phase 1 (Levels 1-10)**: Manual salvaging and tinkering with 100% success rates
2. **Phase 2 (Levels 11-25)**: Hybrid automation with strategic decisions
3. **Phase 3 (Levels 26+)**: Full automation with optimization focus

### Success Criteria
- 80% of players salvage 100 items manually (Phase 1)
- 70% unlock first automation (Phase 2)
- 50% reach full automation (Phase 3)
- Average session length increases by 10+ minutes
- Retention improves by 15% at 1-week mark

## 2. Requirements Analysis

### Functional Requirements

#### Core Mechanics
1. **Inventory System**: Hold 50-10,000 items (expandable)
2. **Salvage System**: Convert items → materials with visual feedback
3. **Tinkering System**: Apply materials to equipment for power gains
4. **Automation System**: Unlock and upgrade automated processes
5. **Prestige System**: High-level reset mechanics with permanent bonuses

#### User Flows
1. Player defeats enemy → receives loot item
2. Player clicks item → salvage animation (0.5s)
3. Materials burst out → auto-collect or click collect
4. Player drags materials to equipment → hold to upgrade (2s)
5. Equipment level increases → power stat updates

### Non-Functional Requirements
- **Performance**: 60 FPS during particle effects, <16ms touch response
- **Scalability**: Handle 10,000 items in inventory without lag
- **Persistence**: All state saved to AsyncStorage within 500ms
- **Offline**: Accumulate resources while app closed (endurance-based)
- **Haptics**: <20ms feedback on every interaction

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              React Native UI Layer              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Inventory│  │ Equipment│  │Automation│      │
│  │  View    │  │   View   │  │   Panel  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
└───────┼─────────────┼─────────────┼─────────────┘
        │             │             │
┌───────▼─────────────▼─────────────▼─────────────┐
│        Legend State Observable Store            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │inventory$│  │equipment$│  │automation$      │
│  │materials$│  │  level$  │  │  speeds$  │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  ┌──────────────────────────────────────┐      │
│  │  Game Loop Engine (requestAnimationFrame)  │
│  │  - Process automation ticks            │
│  │  - Update offline accumulation         │
│  │  - Trigger particle effects           │
│  └──────────────────────────────────────┘      │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────┐
│          AsyncStorage Persistence               │
│  - inventory-state                              │
│  - equipment-state                              │
│  - automation-state                             │
│  - prestige-state                               │
└─────────────────────────────────────────────────┘
```

### Component Design

#### InventoryManager Component
- **Purpose**: Display and manage player's salvageable items
- **Responsibilities**:
  - Render grid of items (react-native-gesture-handler)
  - Handle tap-to-salvage interactions
  - Animate material bursts (react-native-reanimated)
  - Show item rarities with color coding
- **Interfaces**: `inventory$` observable
- **Dependencies**: `salvageSystem$`, haptics, audio

#### SalvageSystem Store
- **Purpose**: Core salvage logic and automation
- **Responsibilities**:
  - Process manual salvage requests
  - Run automated salvage at specified intervals
  - Calculate material outputs by rarity
  - Track combo bonuses for manual clicks
- **State Schema**:
```typescript
interface SalvageState {
  manualSpeed: number;        // Items per second (manual)
  autoSpeed: number;          // Items per second (auto)
  comboMultiplier: number;    // 1.0 - 5.0
  comboTimer: number;         // Seconds remaining
  totalSalvaged: number;      // Lifetime counter
  prestigeLevel: number;      // Prestige resets
}
```

#### EquipmentManager Component
- **Purpose**: Display equipment and tinkering interface
- **Responsibilities**:
  - Show 5 equipment slots (weapon, armor, helmet, gloves, boots)
  - Handle material drag-and-drop
  - Display hold-to-upgrade progress bar
  - Show current/max levels and costs
- **Interfaces**: `equipment$`, `materials$` observables
- **Dependencies**: `tinkeringSystem$`, haptics

#### TinkeringSystem Store
- **Purpose**: Equipment upgrade logic
- **Responsibilities**:
  - Validate material costs
  - Apply upgrades with animation
  - Calculate power bonuses
  - Track upgrade history for analytics
- **State Schema**:
```typescript
interface EquipmentState {
  slots: {
    weapon: EquipmentSlot;
    armor: EquipmentSlot;
    helmet: EquipmentSlot;
    gloves: EquipmentSlot;
    boots: EquipmentSlot;
  };
  autoTinkerEnabled: boolean;
  priorityList: string[];  // Order of auto-upgrade
}

interface EquipmentSlot {
  level: number;
  maxLevel: number;
  costToUpgrade: MaterialCost[];
  powerBonus: number;
}
```

#### AutomationPanel Component
- **Purpose**: Display and manage automation unlocks
- **Responsibilities**:
  - Show unlock tree (react-native-svg)
  - Handle upgrade purchases
  - Display current automation speeds
  - Show offline accumulation stats
- **Interfaces**: `automation$` observable
- **Dependencies**: `economy$` for costs

#### MaterialsDisplay Component
- **Purpose**: Show current material counts
- **Responsibilities**:
  - Render material counters with icons
  - Animate number changes (CountUp effect)
  - Color-code by rarity (common=gray, rare=blue, epic=purple, legendary=gold)
  - Show refinery conversion rates
- **Interfaces**: `materials$` observable

### Data Flow

#### Salvage Flow (Manual)
```
User taps item
  ↓
Haptics.impactAsync(Medium)
  ↓
SalvageSystem.salvageItem(itemId)
  ↓
- Check combo timer
- Roll for material type (weighted)
- Apply combo multiplier
- Update materials$ observable
  ↓
MaterialParticle animation spawns
  ↓
After 0.5s: auto-collect or click
  ↓
Update totalSalvaged counter
  ↓
Check for automation unlocks
```

#### Tinkering Flow (Manual)
```
User drags material to equipment
  ↓
TinkeringSystem.validateCost()
  ↓
If valid:
  ↓
User holds button (2 seconds)
  ↓
Progress bar fills (Animated.timing)
  ↓
At 100%:
  - Haptics.impactAsync(Heavy)
  - Deduct materials
  - Increment equipment level
  - Update power stat
  - Play upgrade sound
  ↓
AttributesDisplay updates (derived stat)
```

## 4. Data Model

### Primary Entities

#### Inventory Item
```typescript
interface InventoryItem {
  id: string;              // UUID
  type: ItemType;          // 'weapon' | 'armor' | 'misc'
  rarity: Rarity;          // 'common' | 'rare' | 'epic' | 'legendary'
  acquiredAt: number;      // Timestamp
  isNew: boolean;          // Show "new" badge
}

type ItemType = 'weapon' | 'armor' | 'helmet' | 'gloves' | 'boots' | 'misc';
type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
```

#### Material
```typescript
interface Material {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
}

// Material drop rates by item rarity
const DROP_RATES = {
  common: { common: 0.95, rare: 0.05, epic: 0.0, legendary: 0.0 },
  rare: { common: 0.7, rare: 0.25, epic: 0.05, legendary: 0.0 },
  epic: { common: 0.4, rare: 0.4, epic: 0.18, legendary: 0.02 },
  legendary: { common: 0.2, rare: 0.3, epic: 0.4, legendary: 0.1 }
};
```

#### Automation Upgrade
```typescript
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

// Example upgrades
const AUTOMATION_TREE = [
  {
    id: 'salvage_assistant',
    name: 'Salvage Assistant',
    unlockLevel: 10,
    cost: { pyreal: 100 },
    maxTier: 5,
    effect: { type: 'salvage_speed', value: 0.33, perTier: 0.5 }  // 1 item/3s → 3 item/1s
  },
  {
    id: 'auto_tinker',
    name: 'Auto-Tinkering',
    unlockLevel: 12,
    cost: { pyreal: 500 },
    maxTier: 1,
    effect: { type: 'auto_tinker', value: 1, perTier: 0 }  // Boolean unlock
  },
  // ... more upgrades
];
```

### State Observables

#### salvageSystem$ Store
```typescript
const salvageSystem$ = observable(
  synced({
    initial: {
      // Manual state
      lastManualSalvage: 0,
      comboCount: 0,
      comboMultiplier: 1.0,
      comboExpiresAt: 0,

      // Automation state
      autoSalvageEnabled: false,
      autoSalvageSpeed: 0,  // Items per second
      lastAutoTick: 0,

      // Stats
      totalSalvaged: 0,
      totalManual: 0,
      totalAuto: 0,

      // Prestige
      prestigeLevel: 0,
      permanentBonuses: {
        salvageSpeedMultiplier: 1.0,
        rareMaterialBonus: 0.0
      }
    },
    persist: { name: 'salvage-system' }
  })
);
```

#### equipment$ Store
```typescript
const equipment$ = observable(
  synced({
    initial: {
      weapon: { level: 0, maxLevel: 100, powerBonus: 0 },
      armor: { level: 0, maxLevel: 100, powerBonus: 0 },
      helmet: { level: 0, maxLevel: 100, powerBonus: 0 },
      gloves: { level: 0, maxLevel: 100, powerBonus: 0 },
      boots: { level: 0, maxLevel: 100, powerBonus: 0 },

      autoTinkerEnabled: false,
      priorityOrder: ['weapon', 'armor', 'helmet', 'gloves', 'boots'],

      totalPower: 0  // Computed: sum of all powerBonus
    },
    persist: { name: 'equipment-state' }
  })
);
```

#### materials$ Store
```typescript
const materials$ = observable(
  synced({
    initial: {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,

      // Lifetime stats
      totalCommonEarned: 0,
      totalRareEarned: 0,
      totalEpicEarned: 0,
      totalLegendaryEarned: 0
    },
    persist: { name: 'materials-state' }
  })
);
```

## 5. API Design

### Internal Action APIs

#### Salvage Actions
```typescript
// Salvage a single item manually
function salvageItem(itemId: string): void {
  const item = inventory$.items[itemId].get();

  // 1. Remove from inventory
  inventory$.items[itemId].delete();

  // 2. Check for combo bonus
  const now = Date.now();
  if (now < salvageSystem$.comboExpiresAt.get()) {
    salvageSystem$.comboCount.set(prev => prev + 1);
    salvageSystem$.comboMultiplier.set(
      Math.min(5.0, 1.0 + (salvageSystem$.comboCount.get() * 0.1))
    );
  } else {
    salvageSystem$.comboCount.set(1);
    salvageSystem$.comboMultiplier.set(1.0);
  }

  // Reset combo timer (10 seconds)
  salvageSystem$.comboExpiresAt.set(now + 10000);

  // 3. Roll for materials
  const materialType = rollMaterialDrop(item.rarity);
  const baseAmount = 1;
  const bonusAmount = Math.floor(baseAmount * salvageSystem$.comboMultiplier.get());

  // 4. Add materials
  materials$[materialType].set(prev => prev + bonusAmount);
  materials$[`total${capitalize(materialType)}Earned`].set(prev => prev + bonusAmount);

  // 5. Stats
  salvageSystem$.totalSalvaged.set(prev => prev + 1);
  salvageSystem$.totalManual.set(prev => prev + 1);

  // 6. Haptics & particles
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  spawnMaterialParticles(materialType, bonusAmount);
}

// Process automated salvage (called by game loop)
function processAutoSalvage(deltaTime: number): void {
  if (!salvageSystem$.autoSalvageEnabled.get()) return;

  const speed = salvageSystem$.autoSalvageSpeed.get();
  const itemsToProcess = Math.floor(speed * deltaTime);

  if (itemsToProcess === 0) return;

  // Get first N items from inventory
  const items = Object.values(inventory$.items.get()).slice(0, itemsToProcess);

  items.forEach(item => {
    salvageItemAuto(item.id);
  });
}

// Batch salvage selected items
function salvageSelected(itemIds: string[]): void {
  itemIds.forEach(id => salvageItem(id));
}
```

#### Tinkering Actions
```typescript
// Upgrade equipment piece
function upgradeEquipment(slot: EquipmentSlot): Promise<boolean> {
  const equipment = equipment$[slot].get();
  const cost = calculateUpgradeCost(equipment.level);

  // 1. Validate materials
  if (!hasEnoughMaterials(cost)) {
    return Promise.resolve(false);
  }

  // 2. Deduct materials
  deductMaterials(cost);

  // 3. Upgrade
  equipment$[slot].level.set(prev => prev + 1);

  // 4. Calculate new power bonus
  const newPower = calculatePowerBonus(equipment.level + 1);
  equipment$[slot].powerBonus.set(newPower);

  // 5. Update total power
  updateTotalPower();

  // 6. Haptics
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

  return Promise.resolve(true);
}

// Calculate upgrade cost (exponential scaling)
function calculateUpgradeCost(currentLevel: number): Material {
  const baseCost = {
    common: 10,
    rare: 5,
    epic: 1,
    legendary: 0
  };

  // Cost increases by 1.15x per level
  const multiplier = Math.pow(1.15, currentLevel);

  return {
    common: Math.floor(baseCost.common * multiplier),
    rare: Math.floor(baseCost.rare * multiplier),
    epic: Math.floor(baseCost.epic * multiplier),
    legendary: Math.floor(baseCost.legendary * multiplier)
  };
}

// Process auto-tinkering (called by game loop)
function processAutoTinker(deltaTime: number): void {
  if (!equipment$.autoTinkerEnabled.get()) return;

  const priorityOrder = equipment$.priorityOrder.get();

  for (const slot of priorityOrder) {
    const equipment = equipment$[slot].get();
    if (equipment.level >= equipment.maxLevel) continue;

    const cost = calculateUpgradeCost(equipment.level);
    if (hasEnoughMaterials(cost)) {
      await upgradeEquipment(slot);
      break;  // Only upgrade one per tick
    }
  }
}
```

#### Automation Actions
```typescript
// Purchase automation upgrade
function purchaseAutomationUpgrade(upgradeId: string): boolean {
  const upgrade = AUTOMATION_TREE.find(u => u.id === upgradeId);
  if (!upgrade) return false;

  // Check level requirement
  if (level$.get() < upgrade.unlockLevel) return false;

  // Check cost
  if (pyreal$.get() < upgrade.cost.pyreal) return false;

  // Deduct cost
  pyreal$.set(prev => prev - upgrade.cost.pyreal);

  // Apply effect
  switch (upgrade.effect.type) {
    case 'salvage_speed':
      salvageSystem$.autoSalvageSpeed.set(prev => prev + upgrade.effect.perTier);
      break;
    case 'auto_tinker':
      equipment$.autoTinkerEnabled.set(true);
      break;
    // ... other effects
  }

  // Track purchase
  automation$[upgradeId].currentTier.set(prev => prev + 1);

  return true;
}
```

## 6. UI/UX Implementation

### Phase 1 UI: Hands-On Interface

#### InventoryGrid Component
```typescript
<ScrollView contentContainerStyle={styles.inventoryGrid}>
  {Object.values(inventory$.items.get()).map(item => (
    <Pressable
      key={item.id}
      onPress={() => salvageItem(item.id)}
      style={[styles.inventorySlot, styles[`rarity${item.rarity}`]]}
    >
      <ItemIcon type={item.type} rarity={item.rarity} />
      {item.isNew && <Badge text="NEW" />}
    </Pressable>
  ))}
</ScrollView>

<MaterialCounters materials={materials$.get()} />
```

#### TinkeringInterface Component
```typescript
<View style={styles.equipmentGrid}>
  {['weapon', 'armor', 'helmet', 'gloves', 'boots'].map(slot => (
    <Pressable
      key={slot}
      onLongPress={() => startUpgrade(slot)}
      style={styles.equipmentSlot}
    >
      <Text>{capitalize(slot)}</Text>
      <Text>Level: {equipment$[slot].level.get()}</Text>
      <Text>Power: +{equipment$[slot].powerBonus.get()}</Text>

      {isUpgrading[slot] && (
        <Animated.View style={[styles.progressBar, { width: upgradeProgress }]}>
          <Text>Upgrading...</Text>
        </Animated.View>
      )}
    </Pressable>
  ))}
</View>
```

### Phase 2 UI: Management Dashboard

#### AutomationPanel Component
```typescript
<ScrollView>
  <View style={styles.statsPanel}>
    <Text>Auto-Salvage: {salvageSystem$.autoSalvageSpeed.get()}/sec</Text>
    <Text>Queue: {inventory$.items.length.get()}</Text>
    <Text>Combo: {salvageSystem$.comboMultiplier.get().toFixed(1)}x</Text>
  </View>

  <View style={styles.upgradeTree}>
    {AUTOMATION_TREE.map(upgrade => (
      <AutomationUpgradeCard
        key={upgrade.id}
        upgrade={upgrade}
        onPurchase={() => purchaseAutomationUpgrade(upgrade.id)}
        isUnlocked={level$.get() >= upgrade.unlockLevel}
      />
    ))}
  </View>
</ScrollView>
```

### Phase 3 UI: Command Center

#### StatisticsPanel Component
```typescript
<View style={styles.commandCenter}>
  <View style={styles.metricsRow}>
    <MetricCard
      title="Salvage Rate"
      value={`${salvageSystem$.autoSalvageSpeed.get().toFixed(1)}/sec`}
      trend={+12.5}
    />
    <MetricCard
      title="Total Power"
      value={equipment$.totalPower.get()}
      trend={+247}
    />
    <MetricCard
      title="Efficiency"
      value={`${calculateEfficiency()}%`}
      trend={+3.2}
    />
  </View>

  <View style={styles.materialFlows}>
    <AnimatedNumber
      value={materials$.common.get()}
      label="Common"
      color="#888"
    />
    <AnimatedNumber
      value={materials$.rare.get()}
      label="Rare"
      color="#4A90E2"
    />
    <AnimatedNumber
      value={materials$.epic.get()}
      label="Epic"
      color="#9B59B6"
    />
    <AnimatedNumber
      value={materials$.legendary.get()}
      label="Legendary"
      color="#F1C40F"
    />
  </View>
</View>
```

## 7. Game Loop Architecture

### Core Game Loop
```typescript
let lastFrameTime = Date.now();
let accumulatedOfflineTime = 0;

function gameLoop() {
  const now = Date.now();
  const deltaTime = (now - lastFrameTime) / 1000;  // Convert to seconds
  lastFrameTime = now;

  // 1. Process offline accumulation (once on app open)
  if (accumulatedOfflineTime > 0) {
    processOfflineProgress(accumulatedOfflineTime);
    accumulatedOfflineTime = 0;
  }

  // 2. Process automated salvage
  processAutoSalvage(deltaTime);

  // 3. Process auto-tinkering
  processAutoTinker(deltaTime);

  // 4. Update combo timer
  if (Date.now() > salvageSystem$.comboExpiresAt.get()) {
    salvageSystem$.comboCount.set(0);
    salvageSystem$.comboMultiplier.set(1.0);
  }

  // 5. Trigger next frame
  requestAnimationFrame(gameLoop);
}

// Start game loop on app mount
useEffect(() => {
  // Calculate offline time
  const lastActiveTime = gameState$.lastActiveTime.get();
  if (lastActiveTime) {
    accumulatedOfflineTime = (Date.now() - lastActiveTime) / 1000;
  }

  // Start loop
  requestAnimationFrame(gameLoop);

  // Save last active time on unmount
  return () => {
    gameState$.lastActiveTime.set(Date.now());
  };
}, []);
```

### Offline Progression
```typescript
function processOfflineProgress(secondsElapsed: number) {
  // Cap offline time to 8 hours
  const cappedTime = Math.min(secondsElapsed, 8 * 60 * 60);

  // Calculate offline efficiency (25% + endurance bonus)
  const offlineEfficiency = getOfflineEfficiency();  // From attributes system

  // Process salvage at reduced rate
  const salvageSpeed = salvageSystem$.autoSalvageSpeed.get();
  const offlineSalvageSpeed = salvageSpeed * (offlineEfficiency / 100);
  const itemsSalvaged = Math.floor(offlineSalvageSpeed * cappedTime);

  // Simulate salvage (without animations)
  for (let i = 0; i < itemsSalvaged; i++) {
    const rarity = 'common';  // Offline only processes common items
    const materialType = rollMaterialDrop(rarity);
    materials$[materialType].set(prev => prev + 1);
  }

  // Show offline summary popup
  showOfflineSummary({
    timeAway: secondsElapsed,
    itemsSalvaged,
    materialsEarned: { /* ... */ }
  });
}
```

## 8. Animation & Particle System

### Material Burst Particles
```typescript
function spawnMaterialParticles(materialType: MaterialType, count: number) {
  const colors = {
    common: '#888888',
    rare: '#4A90E2',
    epic: '#9B59B6',
    legendary: '#F1C40F'
  };

  for (let i = 0; i < Math.min(count, 20); i++) {  // Cap at 20 particles
    const angle = (Math.PI * 2 * i) / count;
    const velocity = {
      x: Math.cos(angle) * 100,
      y: Math.sin(angle) * 100
    };

    particles$.push({
      id: `particle-${Date.now()}-${i}`,
      x: itemX,
      y: itemY,
      velocityX: velocity.x,
      velocityY: velocity.y,
      color: colors[materialType],
      lifetime: 1000,  // 1 second
      createdAt: Date.now()
    });
  }
}

// Particle update loop (part of main game loop)
function updateParticles(deltaTime: number) {
  const now = Date.now();

  particles$.forEach((particle, index) => {
    const age = now - particle.createdAt;

    if (age > particle.lifetime) {
      particles$[index].delete();
      return;
    }

    // Apply physics
    particle.x += particle.velocityX * deltaTime;
    particle.y += particle.velocityY * deltaTime;
    particle.velocityY += 500 * deltaTime;  // Gravity

    // Fade out
    particle.opacity = 1.0 - (age / particle.lifetime);
  });
}

// Render particles
<View style={styles.particleLayer}>
  {particles$.map(particle => (
    <Animated.View
      key={particle.id}
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          backgroundColor: particle.color,
          opacity: particle.opacity
        }
      ]}
    />
  ))}
</View>
```

## 9. Test-Driven Development Strategy

### Testing Framework Setup
- **Framework**: React Native Testing Library + Jest
- **Mocking**: Mock Legend State observables, AsyncStorage, Haptics
- **Coverage Target**: >80% for all new code

### Phase 1 Tests (Manual Crafting)

#### Salvage System Tests
```typescript
describe('SalvageSystem - Phase 1', () => {
  beforeEach(() => {
    // Reset observables
    inventory$.set({ items: {} });
    materials$.set({ common: 0, rare: 0, epic: 0, legendary: 0 });
    salvageSystem$.set({ /* default state */ });
  });

  test('should salvage item and produce materials', () => {
    // ARRANGE
    const item = { id: '1', type: 'weapon', rarity: 'common' };
    inventory$.items['1'].set(item);

    // ACT
    salvageItem('1');

    // ASSERT
    expect(inventory$.items['1'].get()).toBeUndefined();
    expect(materials$.common.get()).toBeGreaterThan(0);
    expect(salvageSystem$.totalSalvaged.get()).toBe(1);
  });

  test('should trigger haptic feedback on salvage', async () => {
    const hapticsSpy = jest.spyOn(Haptics, 'impactAsync');
    const item = { id: '1', type: 'weapon', rarity: 'common' };
    inventory$.items['1'].set(item);

    salvageItem('1');

    expect(hapticsSpy).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  test('should build combo multiplier on rapid salvage', () => {
    // ARRANGE
    inventory$.items.set({
      '1': { id: '1', type: 'weapon', rarity: 'common' },
      '2': { id: '2', type: 'weapon', rarity: 'common' },
      '3': { id: '3', type: 'weapon', rarity: 'common' }
    });

    // ACT
    salvageItem('1');
    salvageItem('2');
    salvageItem('3');

    // ASSERT
    expect(salvageSystem$.comboCount.get()).toBe(3);
    expect(salvageSystem$.comboMultiplier.get()).toBeCloseTo(1.2, 1);
  });

  test('should reset combo after timeout', async () => {
    jest.useFakeTimers();

    inventory$.items['1'].set({ id: '1', type: 'weapon', rarity: 'common' });
    salvageItem('1');

    expect(salvageSystem$.comboMultiplier.get()).toBeGreaterThan(1.0);

    // Fast-forward past combo timer (10 seconds)
    jest.advanceTimersByTime(11000);

    expect(salvageSystem$.comboMultiplier.get()).toBe(1.0);

    jest.useRealTimers();
  });
});
```

#### Tinkering System Tests
```typescript
describe('TinkeringSystem - Phase 1', () => {
  test('should upgrade equipment when materials available', async () => {
    // ARRANGE
    materials$.set({ common: 100, rare: 50, epic: 10, legendary: 0 });
    equipment$.weapon.set({ level: 0, maxLevel: 100, powerBonus: 0 });

    // ACT
    const result = await upgradeEquipment('weapon');

    // ASSERT
    expect(result).toBe(true);
    expect(equipment$.weapon.level.get()).toBe(1);
    expect(equipment$.weapon.powerBonus.get()).toBeGreaterThan(0);
    expect(materials$.common.get()).toBeLessThan(100);
  });

  test('should fail upgrade when materials insufficient', async () => {
    // ARRANGE
    materials$.set({ common: 0, rare: 0, epic: 0, legendary: 0 });
    equipment$.weapon.set({ level: 0, maxLevel: 100, powerBonus: 0 });

    // ACT
    const result = await upgradeEquipment('weapon');

    // ASSERT
    expect(result).toBe(false);
    expect(equipment$.weapon.level.get()).toBe(0);
  });

  test('should calculate exponential upgrade costs', () => {
    expect(calculateUpgradeCost(0)).toEqual({ common: 10, rare: 5, epic: 1, legendary: 0 });
    expect(calculateUpgradeCost(10).common).toBeGreaterThan(10);
    expect(calculateUpgradeCost(50).common).toBeGreaterThan(calculateUpgradeCost(10).common);
  });
});
```

### Phase 2 Tests (Automation)

```typescript
describe('AutomationSystem - Phase 2', () => {
  test('should process auto-salvage at specified rate', () => {
    jest.useFakeTimers();

    // ARRANGE
    inventory$.items.set({
      '1': { id: '1', type: 'weapon', rarity: 'common' },
      '2': { id: '2', type: 'weapon', rarity: 'common' }
    });
    salvageSystem$.autoSalvageEnabled.set(true);
    salvageSystem$.autoSalvageSpeed.set(1.0);  // 1 item/second

    // ACT
    processAutoSalvage(2.0);  // Simulate 2 seconds

    // ASSERT
    expect(Object.keys(inventory$.items.get()).length).toBe(0);
    expect(salvageSystem$.totalAuto.get()).toBe(2);

    jest.useRealTimers();
  });

  test('should purchase automation upgrade when requirements met', () => {
    // ARRANGE
    level$.set(10);
    pyreal$.set(1000);

    // ACT
    const result = purchaseAutomationUpgrade('salvage_assistant');

    // ASSERT
    expect(result).toBe(true);
    expect(salvageSystem$.autoSalvageSpeed.get()).toBeGreaterThan(0);
    expect(pyreal$.get()).toBeLessThan(1000);
  });

  test('should deny upgrade purchase when level too low', () => {
    level$.set(5);
    pyreal$.set(1000);

    const result = purchaseAutomationUpgrade('salvage_assistant');

    expect(result).toBe(false);
    expect(pyreal$.get()).toBe(1000);  // No change
  });
});
```

### Integration Tests

```typescript
describe('Salvage & Tinkering Integration', () => {
  test('complete flow: loot → salvage → materials → upgrade', async () => {
    // 1. Player defeats enemy and gets loot
    const loot = generateLoot('common');
    inventory$.items[loot.id].set(loot);

    // 2. Player salvages item
    salvageItem(loot.id);

    // Verify materials added
    const materialsAfterSalvage = materials$.get();
    expect(Object.values(materialsAfterSalvage).some(v => v > 0)).toBe(true);

    // 3. Add enough materials for upgrade
    materials$.common.set(100);
    materials$.rare.set(50);

    // 4. Player upgrades weapon
    const initialLevel = equipment$.weapon.level.get();
    await upgradeEquipment('weapon');

    // ASSERT
    expect(equipment$.weapon.level.get()).toBe(initialLevel + 1);
    expect(equipment$.totalPower.get()).toBeGreaterThan(0);
  });

  test('automation flow: enable → process → upgrade', async () => {
    // Enable automation
    salvageSystem$.autoSalvageEnabled.set(true);
    salvageSystem$.autoSalvageSpeed.set(10.0);  // 10 items/sec
    equipment$.autoTinkerEnabled.set(true);

    // Add items
    for (let i = 0; i < 100; i++) {
      inventory$.items[`item-${i}`].set({
        id: `item-${i}`,
        type: 'weapon',
        rarity: 'common'
      });
    }

    // Add enough materials
    materials$.common.set(1000);
    materials$.rare.set(500);

    // Process one second of game loop
    processAutoSalvage(1.0);
    processAutoTinker(1.0);

    // ASSERT
    expect(Object.keys(inventory$.items.get()).length).toBeLessThan(100);
    expect(materials$.common.get()).toBeGreaterThan(1000);  // From salvage
    expect(equipment$.weapon.level.get()).toBeGreaterThan(0);  // From auto-tinker
  });
});
```

## 10. Performance Optimization

### Rendering Optimization
```typescript
// Use React.memo for expensive components
const InventorySlot = React.memo(({ item, onPress }) => (
  <Pressable onPress={onPress}>
    <ItemIcon type={item.type} rarity={item.rarity} />
  </Pressable>
), (prev, next) => prev.item.id === next.item.id);

// Virtual scrolling for large inventories
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={inventory$.items.get()}
  renderItem={({ item }) => <InventorySlot item={item} />}
  estimatedItemSize={80}
  numColumns={5}
/>
```

### Observable Optimization
```typescript
// Use batch() for multiple updates
import { batch } from '@legendapp/state';

function salvageMultiple(itemIds: string[]) {
  batch(() => {
    itemIds.forEach(id => {
      const item = inventory$.items[id].get();
      const materials = calculateMaterials(item);

      inventory$.items[id].delete();
      materials$.common.set(prev => prev + materials.common);
      materials$.rare.set(prev => prev + materials.rare);
    });
  });
}

// Use computed() for derived values
import { computed } from '@legendapp/state';

const totalPower$ = computed(() => {
  const equipment = equipment$.get();
  return Object.values(equipment.slots).reduce((sum, slot) => sum + slot.powerBonus, 0);
});
```

### Memory Management
```typescript
// Limit particle count
const MAX_PARTICLES = 100;

function spawnMaterialParticles(type: MaterialType, count: number) {
  const currentCount = particles$.length.get();
  if (currentCount >= MAX_PARTICLES) {
    // Remove oldest particles
    particles$.slice(0, count).forEach(p => p.delete());
  }

  // Spawn new particles
  // ...
}

// Clean up expired animations
function cleanupAnimations() {
  const now = Date.now();
  damageNumbers$.forEach((num, index) => {
    if (now - num.createdAt > 1500) {
      damageNumbers$[index].delete();
    }
  });
}
```

## 11. Implementation Roadmap

### Week 1: Foundation & Test Setup
**Goals**: Testing infrastructure, data models, basic stores

#### Day 1-2: Project Setup
- [ ] Create `/frontend/modules/salvage/` directory structure
- [ ] Create `/frontend/modules/tinkering/` directory structure
- [ ] Install dependencies (none needed, using existing stack)
- [ ] Set up test files for all stores

#### Day 3-4: Data Models & Stores
- [ ] Implement `inventory$` store with tests (TDD)
- [ ] Implement `materials$` store with tests (TDD)
- [ ] Implement `salvageSystem$` store with tests (TDD)
- [ ] Implement `equipment$` store with tests (TDD)
- [ ] Implement `automation$` store with tests (TDD)

#### Day 5: Integration Testing Setup
- [ ] Create test utilities for Legend State mocking
- [ ] Create test fixtures for items, materials, equipment
- [ ] Write integration test suite scaffolding

**Deliverable**: All stores tested and passing (>80% coverage)

### Week 2: Phase 1 Implementation (Manual Crafting)

#### Day 1-2: Inventory & Salvage UI
- [ ] Test: InventoryGrid renders items correctly
- [ ] Implement: InventoryGrid component
- [ ] Test: Tapping item triggers salvage
- [ ] Implement: salvageItem() action
- [ ] Test: Materials display updates
- [ ] Implement: MaterialsDisplay component
- [ ] Test: Particle effects spawn
- [ ] Implement: Material burst particle system

#### Day 3-4: Tinkering UI
- [ ] Test: Equipment slots display correctly
- [ ] Implement: EquipmentGrid component
- [ ] Test: Hold-to-upgrade interaction
- [ ] Implement: upgradeEquipment() action with progress bar
- [ ] Test: Cost validation
- [ ] Implement: Material cost checking
- [ ] Test: Power stat updates
- [ ] Implement: Power calculation and display

#### Day 5: Polish & Testing
- [ ] Add haptic feedback to all interactions
- [ ] Add sound effects for salvage/upgrade
- [ ] Add visual polish (rarities, animations)
- [ ] Integration test: Complete loot → salvage → upgrade flow
- [ ] Manual QA session

**Deliverable**: Phase 1 fully playable, all tests passing

### Week 3: Phase 2 Implementation (Automation)

#### Day 1-2: Automation System
- [ ] Test: Auto-salvage processes items at correct rate
- [ ] Implement: processAutoSalvage() game loop integration
- [ ] Test: Auto-tinker upgrades equipment in priority order
- [ ] Implement: processAutoTinker() with priority queue
- [ ] Test: Combo system rewards manual clicks
- [ ] Implement: Combo multiplier and timer

#### Day 3-4: Automation UI
- [ ] Test: AutomationPanel displays upgrades
- [ ] Implement: AutomationPanel component
- [ ] Test: Upgrade purchases work correctly
- [ ] Implement: purchaseAutomationUpgrade() action
- [ ] Test: Upgrade tree shows locked/unlocked states
- [ ] Implement: Upgrade tree visualization
- [ ] Test: Stats panel shows automation rates
- [ ] Implement: Real-time stats display

#### Day 5: Polish & Testing
- [ ] Add upgrade unlock celebrations
- [ ] Add tooltips explaining automation tiers
- [ ] Integration test: Manual → automation transition
- [ ] Performance test: 10,000 items in queue
- [ ] Manual QA session

**Deliverable**: Phase 2 fully playable, automation working smoothly

### Week 4: Phase 3 Implementation (Advanced Features)

#### Day 1-2: Offline Progression
- [ ] Test: Offline time calculates correctly
- [ ] Implement: processOfflineProgress() on app open
- [ ] Test: Offline efficiency scales with endurance
- [ ] Implement: Integration with attributes system
- [ ] Test: Offline summary popup displays
- [ ] Implement: OfflineSummaryModal component
- [ ] Test: Offline progress capped at 8 hours
- [ ] Implement: Time capping logic

#### Day 3-4: Prestige System
- [ ] Test: Prestige requirements met
- [ ] Implement: Prestige eligibility checking
- [ ] Test: Prestige resets appropriate state
- [ ] Implement: Prestige reset action
- [ ] Test: Permanent bonuses persist
- [ ] Implement: Prestige bonus system
- [ ] Test: Prestige UI shows benefits
- [ ] Implement: PrestigePanel component

#### Day 5: Final Polish & Testing
- [ ] Add prestige animations/celebration
- [ ] Add statistics screen (lifetime stats)
- [ ] Add achievements system (stretch goal)
- [ ] Full integration test suite
- [ ] Performance profiling (React DevTools)
- [ ] Manual QA session (all 3 phases)

**Deliverable**: Complete system, all phases implemented and tested

### Week 5: Optimization & Launch Prep

#### Day 1-2: Performance Optimization
- [ ] Profile with React DevTools Profiler
- [ ] Optimize re-renders with React.memo
- [ ] Implement virtual scrolling for inventory
- [ ] Optimize particle system (object pooling)
- [ ] Test 60 FPS performance on mid-range device

#### Day 3-4: Balance Tuning
- [ ] Collect metrics from playtest
- [ ] Adjust material drop rates
- [ ] Adjust upgrade costs
- [ ] Adjust automation unlock levels
- [ ] Adjust offline efficiency caps

#### Day 5: Launch Prep
- [ ] Final test pass on iOS/Android
- [ ] Update documentation
- [ ] Prepare release notes
- [ ] Analytics integration (track salvage/upgrade rates)
- [ ] Soft launch to small user group

**Deliverable**: Production-ready system, balanced and polished

## 12. Analytics & Metrics

### Key Metrics to Track

#### Engagement Metrics
```typescript
// Track with existing analytics system
analytics.track('salvage_item', {
  itemType: item.type,
  itemRarity: item.rarity,
  method: 'manual' | 'auto',
  comboMultiplier: salvageSystem$.comboMultiplier.get()
});

analytics.track('upgrade_equipment', {
  slot: 'weapon' | 'armor' | ...,
  level: equipment.level,
  method: 'manual' | 'auto',
  materialsCost: JSON.stringify(cost)
});

analytics.track('automation_purchased', {
  upgradeId: upgrade.id,
  playerLevel: level$.get(),
  tier: upgrade.currentTier
});

analytics.track('prestige_activated', {
  playerLevel: level$.get(),
  totalSalvaged: salvageSystem$.totalSalvaged.get(),
  totalPower: equipment$.totalPower.get()
});
```

#### Success Metrics (tracked per user cohort)
- % of players who complete Phase 1 (100 manual salvages)
- % of players who unlock first automation (Level 10)
- % of players who reach Phase 3 (Level 26)
- Average session length before/after each phase
- Retention at day 1, 3, 7, 14, 30
- Daily Active Users (DAU) / Monthly Active Users (MAU)

#### Balancing Metrics
- Average time to reach Level 10 (automation unlock)
- Materials earned per hour (manual vs auto)
- Equipment level distribution (identify progression bottlenecks)
- Pyreal economy (income vs automation costs)
- Combo multiplier usage rate (manual engagement indicator)

### A/B Testing Opportunities
- Automation unlock levels (Level 10 vs 12)
- Material drop rates (higher common vs more rare)
- Upgrade cost scaling (1.15x vs 1.2x per level)
- Offline efficiency cap (75% vs 50%)
- Prestige bonus magnitudes

## 13. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Performance degradation with 10,000+ items | High | Medium | Implement virtual scrolling, paginate storage | Engineering |
| Legend State learning curve | Medium | High | Create reusable patterns, documentation | Engineering |
| Battery drain from game loop | High | Medium | Throttle loop to 30 FPS, profile regularly | Engineering |
| AsyncStorage quota exceeded | High | Low | Compress state, implement cleanup | Engineering |
| Animation jank on low-end devices | Medium | Medium | Use react-native-reanimated, reduce particles | Engineering |

### Design Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Automation too slow (boring) | High | Medium | Playtest early, add balance levers | Product/Design |
| Automation too fast (trivializes gameplay) | High | Medium | Cap rates, add prestige sink | Product/Design |
| UI cluttered with too many systems | Medium | High | Phased rollout, progressive disclosure | Design |
| Confusing upgrade costs | Medium | Medium | Add tooltips, preview system | Design |

### Business Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Low engagement with salvage system | High | Low | Add rewards, integrate with combat | Product |
| Players ignore automation (prefer manual) | Medium | Low | Make automation feel powerful, add incentives | Product |
| Feature creep delays launch | Medium | High | Strict MVP scope, defer nice-to-haves | Product/PM |

## 14. Open Questions

Technical questions requiring resolution:
- [ ] Should particle effects use React Native Skia for better performance?
- [ ] Should we implement server-side validation for prestige (prevent cheating)?
- [ ] Should automation run when app is in background (iOS/Android constraints)?
- [ ] Should we add cloud save for cross-device progression?
- [ ] Should materials have a cap to prevent infinite hoarding?

Design questions:
- [ ] Should rare items have special salvage animations?
- [ ] Should there be a "salvage all commons" button in Phase 1?
- [ ] Should combo multiplier have a visual indicator (progress bar)?
- [ ] Should equipment slots have unique upgrade themes/effects?

## 15. Appendices

### A. Technical Glossary
- **Legend State**: Reactive state management library (observable pattern)
- **Synced**: Persistence wrapper for Legend State observables
- **Game Loop**: `requestAnimationFrame` loop processing automation
- **Combo System**: Multiplier for rapid manual actions (10s window)
- **Prestige**: High-level reset mechanic with permanent bonuses
- **Offline Efficiency**: % of automation speed while app closed

### B. Related Documents
- **Product Requirements Document**: [Original PRD in user message]
- **Existing Architecture**: `/frontend/modules/attributes/` (reference implementation)
- **React Native Testing Library Guide**: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- **Lean Task Generation Guide**: `/docs/guides/lean-task-generation-guide.md`

### C. File Structure

```
frontend/
├── modules/
│   ├── salvage/
│   │   ├── __tests__/
│   │   │   ├── salvageSystem.test.ts
│   │   │   ├── InventoryGrid.test.tsx
│   │   │   └── MaterialParticles.test.tsx
│   │   ├── salvageSystem.ts            # Core logic & store
│   │   ├── InventoryGrid.tsx           # UI component
│   │   ├── MaterialsDisplay.tsx        # Material counters
│   │   ├── MaterialParticles.tsx       # Particle effects
│   │   └── types.ts                    # Type definitions
│   │
│   ├── tinkering/
│   │   ├── __tests__/
│   │   │   ├── tinkeringSystem.test.ts
│   │   │   ├── EquipmentGrid.test.tsx
│   │   │   └── UpgradeAnimation.test.tsx
│   │   ├── tinkeringSystem.ts          # Core logic & store
│   │   ├── EquipmentGrid.tsx           # Equipment UI
│   │   ├── UpgradeButton.tsx           # Hold-to-upgrade
│   │   └── types.ts
│   │
│   ├── automation/
│   │   ├── __tests__/
│   │   │   ├── automationSystem.test.ts
│   │   │   ├── AutomationPanel.test.tsx
│   │   │   └── UpgradeTree.test.tsx
│   │   ├── automationSystem.ts         # Automation logic
│   │   ├── AutomationPanel.tsx         # UI component
│   │   ├── UpgradeTree.tsx             # Upgrade visualization
│   │   ├── upgrades.ts                 # Upgrade definitions
│   │   └── types.ts
│   │
│   └── game-loop/
│       ├── __tests__/
│       │   └── gameLoop.test.ts
│       ├── gameLoop.ts                 # Main loop logic
│       ├── offlineProgress.ts          # Offline calculations
│       └── types.ts
│
└── App.tsx                              # Integrate new systems
```

---
*Generated from PRD: Salvage & Tinkering System - Progressive Automation Design*
*Generation Date: 2025-11-04*
*Technical Stack: React Native 0.81, Expo 54, Legend State 3.0, TypeScript 5.9*
