# Product Requirements Document: Shop Upgrades System

**Version:** 1.0
**Date:** 2025-11-17
**Feature:** Shop Upgrades System
**Module:** `/frontend/modules/upgrades`

---

## 1. Overview

### 1.1 Executive Summary
The Shop Upgrades System provides a comprehensive suite of permanent, one-time purchase enhancements that players can acquire using scrap currency. This feature creates meaningful progression paths by allowing players to invest their accumulated scrap into permanent bonuses that enhance core gameplay mechanics, specifically scrap generation efficiency and pet acquisition rates.

### 1.2 Background
The shop infrastructure exists but contains no upgrade definitions. Players can accumulate scrap through AI Pet passive generation (1 scrap per pet per second) but have limited options for spending this currency. The Upgrades System fills this gap by introducing five carefully balanced upgrades across two progression paths: Scrap Efficiency (enhancing passive income) and Pet Acquisition (accelerating active progression). This creates strategic decision-making opportunities and long-term goals for players.

### 1.3 Objectives
- Define and implement 5 specific upgrade items with balanced costs and effects
- Create two distinct upgrade progression paths (Scrap Efficiency and Pet Acquisition)
- Implement scrap multiplier mechanics that increase passive scrap generation from AI Pets
- Implement pet bonus mechanics that increase AI Pets gained per feed button press
- Establish upgrade data structure and definitions in a centralized location
- Integrate upgrade effects with existing game mechanics (scrap generation, pet feeding)
- Ensure proper calculation and application of cumulative upgrade bonuses
- Maintain backward compatibility with existing save data and state management

---

## 2. User Stories

### 2.1 Core User Stories

**US-1: Purchase Scrap Efficiency Upgrades**
As a player, I want to purchase upgrades that increase my passive scrap generation, so that I can accumulate resources faster over time.

**Acceptance Criteria:**
- Three scrap efficiency upgrades are available in the shop
- Upgrades are named: "Scrap Finder", "Scrap Magnet", "Scrap Amplifier"
- Each upgrade increases scrap generation by a specific percentage (10%, 15%, 25%)
- Upgrades cost 100, 500, and 2000 scrap respectively
- Purchasing an upgrade immediately applies its multiplier effect
- Multiple scrap upgrades stack additively (10% + 15% = 25% total)
- Effect is visible in real-time scrap accumulation rate

**US-2: Purchase Pet Acquisition Upgrades**
As a player, I want to purchase upgrades that increase AI Pets gained from feeding, so that I can grow my pet collection faster.

**Acceptance Criteria:**
- Two pet acquisition upgrades are available in the shop
- Upgrades are named: "Extra Feed", "Double Feed"
- Each upgrade increases pets gained per feed press by +1 and +2 respectively
- Upgrades cost 200 and 1000 scrap respectively
- Purchasing an upgrade immediately increases pets gained when pressing feed button
- Multiple pet upgrades stack additively (+1 + +2 = +3 total bonus)
- Effect is visible immediately on next feed button press

**US-3: View Upgrade Effects in Shop**
As a player, I want to see exactly what each upgrade does before purchasing, so that I can make informed decisions.

**Acceptance Criteria:**
- Each upgrade displays its effect type (Scrap Multiplier or Pet Bonus)
- Effect values are clearly stated (e.g., "+10% scrap generation" or "+1 AI Pet per feed")
- Upgrades are categorized visually or textually (Scrap Efficiency, Pet Acquisition)
- Description text clearly explains the upgrade's benefit
- Cost is prominently displayed for each upgrade

**US-4: Experience Cumulative Upgrade Effects**
As a player, I want my purchased upgrades to stack together, so that I can build powerful combinations.

**Acceptance Criteria:**
- All scrap multiplier upgrades combine additively
- All pet bonus upgrades combine additively
- Total bonuses are calculated automatically when any upgrade is purchased
- Effects apply immediately without requiring app restart
- Cumulative effects persist across app sessions

**US-5: See Upgrade Progression Path**
As a player, I want to understand the progression path for each upgrade category, so that I can plan my spending strategy.

**Acceptance Criteria:**
- Scrap efficiency upgrades have increasing costs and effects
- Pet acquisition upgrades have increasing costs and effects
- Upgrade pricing follows exponential growth (5x, 4x multipliers)
- Later upgrades provide better value per cost invested
- All upgrades in a path are visible from the start (not locked)

### 2.2 Secondary User Stories

**US-6: Optimize for Passive vs Active Play**
As a player, I want to choose between passive income upgrades and active clicking upgrades, so that I can match my playstyle.

**Acceptance Criteria:**
- Scrap efficiency path emphasizes idle/passive gameplay
- Pet acquisition path emphasizes active clicking gameplay
- Both paths are viable strategies at different game stages
- No "optimal" path forces a specific playstyle

**US-7: Long-term Investment Goals**
As a player, I want expensive upgrades that require saving, so that I have long-term goals to work toward.

**Acceptance Criteria:**
- Most expensive upgrade costs 2000 scrap
- Reaching full upgrade suite requires 3800 total scrap investment
- Progression provides sense of achievement at multiple milestones
- Early upgrades are affordable (100-200 scrap) for quick wins

---

## 3. Functional Requirements

### 3.1 Upgrade Definitions

**FR-1: Scrap Finder Upgrade**
- **Unique ID:** `scrap-boost-1`
- **Name:** "Scrap Finder"
- **Description:** "Your AI Pets are better at finding scrap. Increases scrap generation by 10%."
- **Cost:** 100 scrap
- **Effect Type:** `scrapMultiplier`
- **Effect Value:** 0.1 (representing 10%)
- **Category:** Scrap Efficiency

**FR-2: Scrap Magnet Upgrade**
- **Unique ID:** `scrap-boost-2`
- **Name:** "Scrap Magnet"
- **Description:** "AI Pets attract scrap from further away. Increases scrap generation by 15%."
- **Cost:** 500 scrap
- **Effect Type:** `scrapMultiplier`
- **Effect Value:** 0.15 (representing 15%)
- **Category:** Scrap Efficiency

**FR-3: Scrap Amplifier Upgrade**
- **Unique ID:** `scrap-boost-3`
- **Name:** "Scrap Amplifier"
- **Description:** "Advanced technology amplifies scrap collection. Increases scrap generation by 25%."
- **Cost:** 2000 scrap
- **Effect Type:** `scrapMultiplier`
- **Effect Value:** 0.25 (representing 25%)
- **Category:** Scrap Efficiency

**FR-4: Extra Feed Upgrade**
- **Unique ID:** `pet-boost-1`
- **Name:** "Extra Feed"
- **Description:** "Your feeding technique improves. Gain +1 additional AI Pet when feeding."
- **Cost:** 200 scrap
- **Effect Type:** `petBonus`
- **Effect Value:** 1
- **Category:** Pet Acquisition

**FR-5: Double Feed Upgrade**
- **Unique ID:** `pet-boost-2`
- **Name:** "Double Feed"
- **Description:** "Master the art of feeding. Gain +2 additional AI Pets when feeding."
- **Cost:** 1000 scrap
- **Effect Type:** `petBonus`
- **Effect Value:** 2
- **Category:** Pet Acquisition

### 3.2 Upgrade Data Structure

**FR-6: Upgrade Interface**
Each upgrade MUST conform to the following structure:
```typescript
interface Upgrade {
  id: string;                                    // Unique identifier
  name: string;                                  // Display name
  description: string;                           // User-facing explanation
  cost: number;                                  // Scrap cost (renamed from scrapCost)
  effectType: 'scrapMultiplier' | 'petBonus';   // Type of effect
  effectValue: number;                           // Magnitude of effect
  category?: 'scrapEfficiency' | 'petAcquisition'; // Optional grouping
}
```

**FR-7: Upgrade Definitions File**
- All upgrades MUST be defined in `/frontend/modules/shop/upgradeDefinitions.ts`
- Definitions MUST be exported as a constant array `UPGRADES`
- Array MUST be the single source of truth for upgrade data
- Definitions MUST be immutable (no runtime modification)

**FR-8: Integration with Game State**
- Upgrades array MUST be populated into `gameState$.upgrades` on app initialization
- If `gameState$.upgrades` is already populated, MUST preserve existing data
- MUST NOT duplicate or overwrite upgrades if they already exist
- Integration MUST happen before shop screen can be accessed

### 3.3 Effect Calculation System

**FR-9: Total Scrap Multiplier Calculation**
```typescript
totalScrapMultiplier = sum of all purchased scrapMultiplier upgrade effectValues
// Example: If player owns scrap-boost-1 (0.1) and scrap-boost-2 (0.15)
// totalScrapMultiplier = 0.1 + 0.15 = 0.25 (25% bonus)
```
- MUST be calculated dynamically based on `purchasedUpgrades` array
- MUST recalculate automatically when new upgrades are purchased
- MUST return 0 if no scrap multiplier upgrades are owned
- MUST use computed observable pattern for reactivity

**FR-10: Total Pet Bonus Calculation**
```typescript
totalPetBonus = sum of all purchased petBonus upgrade effectValues
// Example: If player owns pet-boost-1 (1) and pet-boost-2 (2)
// totalPetBonus = 1 + 2 = 3 (3 extra pets per feed)
```
- MUST be calculated dynamically based on `purchasedUpgrades` array
- MUST recalculate automatically when new upgrades are purchased
- MUST return 0 if no pet bonus upgrades are owned
- MUST use computed observable pattern for reactivity

**FR-11: Scrap Generation Application**
```typescript
scrapPerSecond = petCount * (1 + totalScrapMultiplier)
// Base: 1 scrap per pet per second
// With 25% multiplier: 1 * 1.25 = 1.25 scrap per pet per second
```
- MUST apply multiplier to passive scrap generation
- MUST update scrap increment rate in real-time when upgrades purchased
- MUST use formula: `baseRate * (1 + multiplierBonus)`
- MUST NOT affect scrap from other sources (if added in future)

**FR-12: Pet Feeding Application**
```typescript
petsGained = basePetGain + totalPetBonus
// Base: 1 pet per feed button press (assuming default)
// With +3 bonus: 1 + 3 = 4 pets per feed press
```
- MUST apply bonus to feed button press action
- MUST add bonus pets immediately when feed button is pressed
- MUST use formula: `baseGain + petBonus`
- MUST work regardless of base pet gain value

### 3.4 Purchase and Persistence

**FR-13: Purchase Flow Integration**
- Purchasing an upgrade MUST follow existing shop purchase logic
- MUST validate player has sufficient scrap before purchase
- MUST validate upgrade hasn't already been purchased
- MUST deduct scrap cost from player balance
- MUST add upgrade ID to `purchasedUpgrades` array
- MUST trigger effect recalculation automatically (via computed observables)

**FR-14: State Persistence**
- Purchased upgrade IDs MUST persist via existing persistence layer
- MUST use Legend State with AsyncStorage persistence
- MUST use existing debounce delay (1000ms)
- MUST store in `purchasedUpgrades` array (no separate storage needed)
- MUST load persisted purchases on app restart
- MUST recalculate effects from persisted purchases on load

**FR-15: Backward Compatibility**
- MUST NOT break existing save data without purchases
- MUST initialize `purchasedUpgrades` as empty array if not present
- MUST handle transition from empty upgrades array to populated array
- MUST support incremental upgrade additions in future updates

---

## 4. Technical Requirements

### 4.1 Architecture

**TR-1: File Structure**
```
/frontend/modules/
├── shop/
│   ├── upgradeDefinitions.ts       # New: Upgrade data definitions
│   ├── upgradeDefinitions.test.ts  # New: Definition tests
│   ├── ShopScreen.tsx              # Existing: Displays upgrades
│   └── ShopScreen.test.tsx         # Existing: Shop tests
├── upgrades/
│   └── specs/
│       ├── feature-upgrades.md     # Existing: Feature description
│       └── prd_upgrades_20251117.md # This document
└── shared/
    ├── store/
    │   ├── gameStore.ts            # Modified: Add effect calculations
    │   └── gameStore.test.ts       # Modified: Test calculations
    └── types/
        └── game.ts                 # Modified: Update Upgrade interface
```

**TR-2: Type System Updates**
- Update `Upgrade` interface in `/frontend/shared/types/game.ts`
- Change `scrapCost` to `cost` for consistency
- Add optional `category` property for UI grouping
- Ensure `effectType` union includes `'scrapMultiplier' | 'petBonus'`
- Ensure `effectValue` is typed as `number`

**TR-3: Upgrade Definitions Implementation**
```typescript
// /frontend/modules/shop/upgradeDefinitions.ts

import { Upgrade } from '../../shared/types/game';

export const UPGRADES: Upgrade[] = [
  {
    id: 'scrap-boost-1',
    name: 'Scrap Finder',
    description: 'Your AI Pets are better at finding scrap. Increases scrap generation by 10%.',
    cost: 100,
    effectType: 'scrapMultiplier',
    effectValue: 0.1,
    category: 'scrapEfficiency',
  },
  {
    id: 'scrap-boost-2',
    name: 'Scrap Magnet',
    description: 'AI Pets attract scrap from further away. Increases scrap generation by 15%.',
    cost: 500,
    effectType: 'scrapMultiplier',
    effectValue: 0.15,
    category: 'scrapEfficiency',
  },
  {
    id: 'scrap-boost-3',
    name: 'Scrap Amplifier',
    description: 'Advanced technology amplifies scrap collection. Increases scrap generation by 25%.',
    cost: 2000,
    effectType: 'scrapMultiplier',
    effectValue: 0.25,
    category: 'scrapEfficiency',
  },
  {
    id: 'pet-boost-1',
    name: 'Extra Feed',
    description: 'Your feeding technique improves. Gain +1 additional AI Pet when feeding.',
    cost: 200,
    effectType: 'petBonus',
    effectValue: 1,
    category: 'petAcquisition',
  },
  {
    id: 'pet-boost-2',
    name: 'Double Feed',
    description: 'Master the art of feeding. Gain +2 additional AI Pets when feeding.',
    cost: 1000,
    effectType: 'petBonus',
    effectValue: 2,
    category: 'petAcquisition',
  },
];
```

### 4.2 Effect Calculation Implementation

**TR-4: Game Store Computed Observables**
```typescript
// /frontend/shared/store/gameStore.ts

// Add computed observables for effect totals
export const totalScrapMultiplier$ = computed(() => {
  const purchased = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  return upgrades
    .filter(u => purchased.includes(u.id) && u.effectType === 'scrapMultiplier')
    .reduce((sum, u) => sum + u.effectValue, 0);
});

export const totalPetBonus$ = computed(() => {
  const purchased = gameState$.purchasedUpgrades.get();
  const upgrades = gameState$.upgrades.get();

  return upgrades
    .filter(u => purchased.includes(u.id) && u.effectType === 'petBonus')
    .reduce((sum, u) => sum + u.effectValue, 0);
});
```

**TR-5: Scrap Generation Integration**
```typescript
// Modified scrap generation logic (in relevant component or store)

// Current implementation (example):
// scrapPerSecond = petCount * 1

// New implementation:
const multiplier = totalScrapMultiplier$.get();
scrapPerSecond = petCount * (1 + multiplier);

// Example: 10 pets, 25% multiplier
// scrapPerSecond = 10 * (1 + 0.25) = 12.5 scrap/second
```

**TR-6: Pet Feeding Integration**
```typescript
// Modified feed button logic (in AttackButtonScreen or relevant component)

// Current implementation (example):
// const handleFeed = () => {
//   gameState$.petCount.set(prev => prev + 1);
// };

// New implementation:
const handleFeed = () => {
  const bonus = totalPetBonus$.get();
  const petsToAdd = 1 + bonus; // Base 1 + bonus
  gameState$.petCount.set(prev => prev + petsToAdd);
};
```

### 4.3 Initialization and Loading

**TR-7: Upgrade Array Population**
```typescript
// In App.tsx or game initialization logic

import { UPGRADES } from './modules/shop/upgradeDefinitions';

// On app start or after persistence load:
if (gameState$.upgrades.get().length === 0) {
  gameState$.upgrades.set(UPGRADES);
}
```

**TR-8: Persistence Schema**
- `purchasedUpgrades` already persists as part of `gameState$`
- No additional persistence configuration required
- Existing storage key: Use existing game state storage
- Existing debounce: 1000ms (no change needed)

### 4.4 Testing Requirements

**TR-9: Upgrade Definitions Tests**
```typescript
// /frontend/modules/shop/upgradeDefinitions.test.ts

describe('UPGRADES', () => {
  test('exports exactly 5 upgrades', () => {
    expect(UPGRADES).toHaveLength(5);
  });

  test('all upgrades have unique IDs', () => {
    const ids = UPGRADES.map(u => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all upgrades have required properties', () => {
    UPGRADES.forEach(upgrade => {
      expect(upgrade.id).toBeTruthy();
      expect(upgrade.name).toBeTruthy();
      expect(upgrade.description).toBeTruthy();
      expect(upgrade.cost).toBeGreaterThan(0);
      expect(['scrapMultiplier', 'petBonus']).toContain(upgrade.effectType);
      expect(upgrade.effectValue).toBeGreaterThan(0);
    });
  });

  test('scrap efficiency upgrades have correct values', () => {
    const scrapBoost1 = UPGRADES.find(u => u.id === 'scrap-boost-1');
    expect(scrapBoost1?.cost).toBe(100);
    expect(scrapBoost1?.effectValue).toBe(0.1);

    const scrapBoost2 = UPGRADES.find(u => u.id === 'scrap-boost-2');
    expect(scrapBoost2?.cost).toBe(500);
    expect(scrapBoost2?.effectValue).toBe(0.15);

    const scrapBoost3 = UPGRADES.find(u => u.id === 'scrap-boost-3');
    expect(scrapBoost3?.cost).toBe(2000);
    expect(scrapBoost3?.effectValue).toBe(0.25);
  });

  test('pet acquisition upgrades have correct values', () => {
    const petBoost1 = UPGRADES.find(u => u.id === 'pet-boost-1');
    expect(petBoost1?.cost).toBe(200);
    expect(petBoost1?.effectValue).toBe(1);

    const petBoost2 = UPGRADES.find(u => u.id === 'pet-boost-2');
    expect(petBoost2?.cost).toBe(1000);
    expect(petBoost2?.effectValue).toBe(2);
  });
});
```

**TR-10: Effect Calculation Tests**
```typescript
// /frontend/shared/store/gameStore.test.ts (additions)

describe('totalScrapMultiplier$', () => {
  test('returns 0 when no upgrades purchased', () => {
    gameState$.purchasedUpgrades.set([]);
    expect(totalScrapMultiplier$.get()).toBe(0);
  });

  test('sums scrap multiplier upgrades correctly', () => {
    gameState$.upgrades.set(UPGRADES);
    gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2']);
    expect(totalScrapMultiplier$.get()).toBe(0.25); // 0.1 + 0.15
  });

  test('ignores pet bonus upgrades', () => {
    gameState$.upgrades.set(UPGRADES);
    gameState$.purchasedUpgrades.set(['scrap-boost-1', 'pet-boost-1']);
    expect(totalScrapMultiplier$.get()).toBe(0.1); // Only scrap-boost-1
  });

  test('includes all three scrap upgrades', () => {
    gameState$.upgrades.set(UPGRADES);
    gameState$.purchasedUpgrades.set(['scrap-boost-1', 'scrap-boost-2', 'scrap-boost-3']);
    expect(totalScrapMultiplier$.get()).toBe(0.5); // 0.1 + 0.15 + 0.25
  });
});

describe('totalPetBonus$', () => {
  test('returns 0 when no upgrades purchased', () => {
    gameState$.purchasedUpgrades.set([]);
    expect(totalPetBonus$.get()).toBe(0);
  });

  test('sums pet bonus upgrades correctly', () => {
    gameState$.upgrades.set(UPGRADES);
    gameState$.purchasedUpgrades.set(['pet-boost-1', 'pet-boost-2']);
    expect(totalPetBonus$.get()).toBe(3); // 1 + 2
  });

  test('ignores scrap multiplier upgrades', () => {
    gameState$.upgrades.set(UPGRADES);
    gameState$.purchasedUpgrades.set(['scrap-boost-1', 'pet-boost-1']);
    expect(totalPetBonus$.get()).toBe(1); // Only pet-boost-1
  });
});
```

**TR-11: Integration Tests**
- Test scrap generation increases when scrap multiplier upgrades purchased
- Test pet feeding increases when pet bonus upgrades purchased
- Test effects persist across app restart
- Test effects stack correctly with multiple purchases
- Test shop displays correct available/owned status for upgrades

**TR-12: Test Environment**
- Run tests using cmd.exe (per project guidelines)
- Use Jest with React Native Testing Library
- Mock Legend State observables where needed
- Follow existing test patterns from gameStore.test.ts

---

## 5. Design Specifications

### 5.1 Shop Display Integration

**Shop Screen Upgrade Cards:**
- Scrap efficiency upgrades SHOULD display with a distinct visual indicator (e.g., icon or color)
- Pet acquisition upgrades SHOULD display with a distinct visual indicator
- Upgrade categories MAY be grouped or labeled in the UI
- Effect descriptions MUST be clear and user-friendly
- Cost-to-benefit ratio should be visually apparent

### 5.2 Typography and Icons

**Upgrade Names:**
- Font: 18px, bold (600)
- Color: #000000 (primary text)

**Upgrade Descriptions:**
- Font: 14px, regular (400)
- Color: #666666 (secondary text)

**Effect Labels:**
- Font: 14px, medium (500)
- Scrap multipliers: #007AFF (blue - matches passive income theme)
- Pet bonuses: #34C759 (green - matches active action theme)

**Category Labels (Optional):**
- "Scrap Efficiency" category: Icon 🔧 or similar
- "Pet Acquisition" category: Icon 🎯 or similar

### 5.3 Effect Display Format

**Scrap Multiplier Display:**
- Format: "Effect: +{value}% scrap generation"
- Example: "Effect: +10% scrap generation"
- Alternative: "Scrap Multiplier: +10%"

**Pet Bonus Display:**
- Format: "Effect: +{value} AI Pet per feed"
- Example: "Effect: +1 AI Pet per feed"
- Alternative: "Pet Bonus: +1"

### 5.4 Cost Display

**Pricing Format:**
- Display: "Cost: {amount} scrap"
- Example: "Cost: 100 scrap"
- Color: #FF9500 (orange - warning/cost color)
- Font: 14px, medium (500)

---

## 6. Success Metrics

### 6.1 Technical Metrics

**SM-1: Data Integrity**
- 100% accuracy in upgrade definition data (5 upgrades with correct values)
- 100% accuracy in effect calculations (scrap multiplier, pet bonus)
- 100% persistence success rate for purchased upgrades
- Zero calculation errors or edge cases

**SM-2: Performance**
- Effect calculation overhead < 1ms per purchase
- No frame drops when applying upgrade effects
- Scrap generation maintains 1-second interval precision
- State updates remain debounced (1 save per second max)

**SM-3: Test Coverage**
- Minimum 95% code coverage for upgradeDefinitions.ts
- 100% coverage for effect calculation functions
- All upgrade purchase flows tested
- All effect application scenarios tested

### 6.2 Balance Metrics

**SM-4: Progression Balance**
- Total cost for all upgrades: 3,800 scrap
- Cost curve follows exponential growth pattern
- Early upgrades (100-200) accessible within 2-5 minutes of play
- Late upgrades (2000) require 20-30 minutes of passive generation
- No single upgrade provides overwhelming advantage

**SM-5: Value Proposition**
- Scrap efficiency path ROI: 50% total multiplier for 2,600 scrap
- Pet acquisition path ROI: +3 pets per click for 1,200 scrap
- Both paths provide meaningful progression
- Late upgrades offer better value per cost (25% for 2000 vs 10% for 100)

### 6.3 User Experience Metrics

**SM-6: Clarity**
- Upgrade effects immediately visible in gameplay
- No confusion about what upgrades do
- Cost-to-benefit ratio is clear before purchase
- Progression paths are intuitive

**SM-7: Engagement**
- Upgrades create meaningful short-term and long-term goals
- Strategic decision-making between upgrade paths
- Sense of progression and achievement
- Replay value through optimization strategies

---

## 7. Dependencies and Assumptions

### 7.1 Dependencies

**DP-1: Existing Systems**
- Shop screen implementation (ShopScreen.tsx)
- Game state management (gameStore.ts)
- Persistence layer (persistence.ts)
- Type definitions (game.ts)
- Legend State (`@legendapp/state`)
- Existing purchase flow logic

**DP-2: Game Mechanics**
- Scrap generation system (1 scrap per pet per second)
- Feed button functionality (adds AI Pets)
- Pet count tracking
- Scrap balance tracking

**DP-3: State Structure**
- `gameState$.upgrades` array exists
- `gameState$.purchasedUpgrades` array exists
- `gameState$.scrap` observable exists
- `gameState$.petCount` observable exists

### 7.2 Assumptions

**AS-1: Game Balance**
- Base scrap generation rate is 1 per pet per second
- Base pet gain from feeding is 1 pet per press (or similar small value)
- Players will play in sessions long enough to afford at least one upgrade
- 50% scrap multiplier is balanced (not too weak, not too strong)
- +3 pets per click is balanced (not game-breaking)

**AS-2: User Behavior**
- Players will purchase upgrades in various orders (not necessarily sequential)
- Some players will focus on one path, others will diversify
- Players understand percentage multipliers (+10% is intuitive)
- Players understand additive bonuses (+1 pet is clear)

**AS-3: Technical Assumptions**
- Computed observables update efficiently (no performance issues)
- Effect calculations can run every time an upgrade is purchased (minimal overhead)
- Scrap generation timer can access computed multiplier value
- Feed button handler can access computed pet bonus value

**AS-4: Future Scope**
- More upgrades may be added later (extensible system)
- Upgrade categories may be used for UI grouping in future
- Upgrade effects are permanent (no time-limited or consumable upgrades)
- No upgrade refunds or respec functionality planned

### 7.3 Constraints

**CS-1: Scope Limitations**
- NO additional upgrade types beyond scrapMultiplier and petBonus
- NO upgrade levels or tier systems (each upgrade is one-time purchase)
- NO conditional upgrades (all visible from start)
- NO prerequisite/unlock chains (all upgrades available immediately)
- NO upgrade animations beyond standard purchase flow
- NO upgrade preview/simulation tools

**CS-2: Technical Constraints**
- MUST use existing Upgrade interface structure
- MUST maintain backward compatibility with existing saves
- MUST NOT modify persistence layer or debounce timing
- MUST NOT add new external dependencies
- MUST use cmd.exe for running tests (per CLAUDE.md)

**CS-3: Balance Constraints**
- MUST NOT create pay-to-win scenarios (no real money)
- MUST maintain meaningful choice between upgrade paths
- MUST NOT make game trivially easy with all upgrades
- MUST NOT make upgrades feel mandatory vs optional

---

## 8. Open Questions and Decisions

**Q-1:** Should upgrade costs scale exponentially or follow a different curve?
**Decision:** Use exponential scaling (5x, 4x multipliers) to create meaningful saving goals and prevent linear progression.

**Q-2:** Should all upgrades be visible from the start or unlock progressively?
**Decision:** All visible from start. Creates clarity and allows strategic planning. No unlock confusion.

**Q-3:** Should scrap multipliers stack additively or multiplicatively?
**Decision:** Additively (0.1 + 0.15 = 0.25, not 1.1 × 1.15 = 1.265). Simpler to understand and balance.

**Q-4:** Should pet bonuses stack additively or multiplicatively?
**Decision:** Additively (+1 + +2 = +3, not 2 × 3 = 6). Consistent with scrap multiplier approach.

**Q-5:** Should there be a category for upgrades or just effect types?
**Decision:** Include optional category property for future UI grouping, but not required for MVP.

**Q-6:** What should base pet gain from feeding be if not explicitly defined?
**Decision:** Assume base gain of 1 pet per feed press. Pet bonus adds to this base value.

**Q-7:** Should effects apply retroactively to existing scrap/pets?
**Decision:** No retroactive application. Effects apply to future generation/gains only. Simpler and more performant.

**Q-8:** Should there be visual feedback when effects are actively applying?
**Decision:** Out of scope for this feature. Effects are always active once purchased. Visual feedback in shop only.

**Q-9:** How should rounding work for fractional scrap per second (e.g., 1.25)?
**Decision:** Let existing scrap generation system handle rounding. Assume it supports decimal accumulation.

**Q-10:** Should category be required or optional in Upgrade interface?
**Decision:** Optional (category?) for backward compatibility and flexibility. Shop can function without it.

---

## 9. Out of Scope

The following items are explicitly excluded from this implementation:

1. **Additional Upgrades:** Only the 5 defined upgrades (3 scrap, 2 pet) will be implemented
2. **Upgrade Levels:** No multi-level or repeatable purchases of same upgrade
3. **Unlock Systems:** No prerequisites, achievements, or progression gates for upgrades
4. **Conditional Upgrades:** No time-limited, event-based, or special condition upgrades
5. **Upgrade Refunds:** No selling, refunding, or respec functionality
6. **Visual Effects:** No particles, animations, or special effects when upgrades are active
7. **Sound/Haptics:** No audio or vibration feedback for upgrade application
8. **Stat Preview:** No calculator or simulator showing effect of purchases before buying
9. **Upgrade Comparison:** No tools to compare multiple upgrades side-by-side
10. **Analytics:** No tracking of which upgrades are most/least purchased
11. **Dynamic Pricing:** Costs are fixed, no discounts or sales
12. **Upgrade Bundles:** No package deals or combo purchases
13. **Achievement System:** No rewards or badges for purchasing upgrades
14. **Upgrade Tooltips:** No advanced hover/long-press details beyond basic description
15. **Effect Visualization:** No in-game indicators showing multipliers actively working

---

## 10. Implementation Plan

### 10.1 Development Phases

**Phase 1: Type System Updates (Priority: High)**
- Update `Upgrade` interface in `/frontend/shared/types/game.ts`
- Change `scrapCost` to `cost`
- Add optional `category` property
- Verify all existing code compiles with updated types

**Phase 2: Upgrade Definitions (Priority: High)**
- Create `/frontend/modules/shop/upgradeDefinitions.ts`
- Define all 5 upgrades with correct data
- Export as `UPGRADES` constant array
- Verify data structure matches interface

**Phase 3: Effect Calculation System (Priority: High)**
- Add `totalScrapMultiplier$` computed observable to gameStore
- Add `totalPetBonus$` computed observable to gameStore
- Ensure reactivity works with Legend State patterns
- Test calculations with mock data

**Phase 4: Game Mechanic Integration (Priority: High)**
- Integrate scrap multiplier into scrap generation logic
- Integrate pet bonus into feed button logic
- Verify effects apply correctly in real gameplay
- Test edge cases (0 upgrades, all upgrades, mixed)

**Phase 5: Initialization (Priority: High)**
- Add upgrade array population logic to app initialization
- Ensure upgrades load into gameState$.upgrades
- Handle empty array case and already-populated case
- Verify integration with persistence system

**Phase 6: Testing (Priority: High)**
- Write upgradeDefinitions.test.ts tests
- Write effect calculation tests in gameStore.test.ts
- Write integration tests for purchase → effect flow
- Write persistence tests
- Achieve 95%+ code coverage
- Manual testing on device

**Phase 7: Shop UI Updates (Priority: Medium)**
- Update ShopScreen to display upgrade categories (if applicable)
- Ensure effect types display correctly
- Verify all 5 upgrades appear correctly in shop
- Test visual distinction between upgrade types

**Phase 8: Documentation (Priority: Low)**
- Add JSDoc comments to upgradeDefinitions.ts
- Document effect calculation functions
- Update any relevant project documentation
- Create upgrade balance notes if needed

### 10.2 Testing Strategy

**Unit Tests:**
- Upgrade definitions structure and data correctness
- Effect calculation functions (scrap multiplier, pet bonus)
- Purchase flow with upgrade effects enabled
- Computed observable reactivity

**Integration Tests:**
- Upgrade purchase → effect calculation → game mechanic application flow
- Persistence of purchased upgrades → effect recalculation on load
- Multiple upgrade purchases → cumulative effect stacking
- Shop UI → upgrade data display consistency

**Balance Tests:**
- Scrap generation rate increases correctly with multipliers
- Pet feeding gains increase correctly with bonuses
- Cost progression provides meaningful milestones
- Both upgrade paths are viable strategies

**Manual Tests:**
- Visual verification of upgrade effects in gameplay
- Purchase flow feels responsive and immediate
- Effects persist across app restarts correctly
- Test with various playstyles (passive vs active focus)

**Test Data:**
- Test with 0 upgrades purchased (baseline gameplay)
- Test with 1 scrap upgrade purchased
- Test with all 3 scrap upgrades purchased (max multiplier)
- Test with 1 pet upgrade purchased
- Test with both pet upgrades purchased (max bonus)
- Test with mixed purchases from both paths
- Test with all 5 upgrades purchased (full progression)

---

## 11. Risks and Mitigations

### 11.1 Technical Risks

**RISK-001: Effect Calculation Performance**
- **Risk:** Computed observables recalculate too frequently, causing performance issues
- **Mitigation:** Legend State optimizes computed observables; recalculation only on purchasedUpgrades change
- **Likelihood:** Low
- **Impact:** Low

**RISK-002: Scrap Multiplier Rounding Errors**
- **Risk:** Fractional scrap accumulation causes precision errors over time
- **Mitigation:** Use consistent rounding strategy; test with long play sessions
- **Likelihood:** Medium
- **Impact:** Low (minor display/calculation discrepancies)

**RISK-003: Type Migration Breaking Changes**
- **Risk:** Changing `scrapCost` to `cost` breaks existing code
- **Mitigation:** Search codebase for all usages before changing; update all references
- **Likelihood:** Medium
- **Impact:** Medium (compilation errors, easy to fix)

**RISK-004: Persistence Backward Compatibility**
- **Risk:** Existing save data doesn't have `upgrades` array in expected format
- **Mitigation:** Initialize upgrades array on load if empty; don't overwrite existing data
- **Likelihood:** Low
- **Impact:** Medium (could reset player progress if handled incorrectly)

### 11.2 Balance Risks

**RISK-005: Upgrades Too Powerful**
- **Risk:** 50% scrap multiplier makes game too easy or trivial
- **Mitigation:** Exponential costs gate progression; balance can be tuned post-launch
- **Likelihood:** Low
- **Impact:** Medium (affects game enjoyment)

**RISK-006: Upgrades Too Weak**
- **Risk:** Upgrades don't feel impactful enough to justify costs
- **Mitigation:** Percentage values chosen for noticeable impact; playtest and adjust
- **Likelihood:** Low
- **Impact:** Medium (affects progression satisfaction)

**RISK-007: Optimal Path Too Obvious**
- **Risk:** One upgrade path is clearly superior, eliminating meaningful choice
- **Mitigation:** Both paths serve different playstyles; balance costs accordingly
- **Likelihood:** Medium
- **Impact:** Medium (reduces strategic depth)

### 11.3 User Experience Risks

**RISK-008: Unclear Effect Application**
- **Risk:** Players don't notice when upgrade effects are working
- **Mitigation:** Clear descriptions; effects are immediate and visible in scrap/pet changes
- **Likelihood:** Low
- **Impact:** Low (confusing but not game-breaking)

**RISK-009: Purchase Regret**
- **Risk:** Players purchase wrong upgrade and can't refund
- **Mitigation:** Clear descriptions and costs; no refunds keeps progression meaningful
- **Likelihood:** Low
- **Impact:** Low (part of strategic decision-making)

**RISK-010: Confusion About Stacking**
- **Risk:** Players don't understand how multiple upgrades combine
- **Mitigation:** Use additive stacking (simpler than multiplicative); document clearly
- **Likelihood:** Low
- **Impact:** Low

---

## 12. Future Enhancements

### 12.1 Potential Features (Post-MVP)

**Future Enhancement 1: Additional Upgrade Paths**
- New effect types beyond scrapMultiplier and petBonus
- Examples: scrapCapacity (increase max scrap storage), autoFeed (automatic feeding)
- New categories: Automation, Capacity, Speed, etc.

**Future Enhancement 2: Upgrade Tiers/Levels**
- Allow purchasing same upgrade multiple times for stacking benefits
- Increasing costs per tier (tier 1: 100, tier 2: 500, tier 3: 2000)
- Maximum tier limits to maintain balance

**Future Enhancement 3: Unlock Progression**
- Gate expensive upgrades behind achievements or progression milestones
- Example: "Unlock Scrap Amplifier after collecting 10,000 total scrap"
- Creates sense of progression and discovery

**Future Enhancement 4: Upgrade Synergies**
- Bonus effects when specific upgrade combinations are owned
- Example: "Own all scrap upgrades → unlock 'Scrap Master' bonus"
- Encourages diverse purchasing strategies

**Future Enhancement 5: Dynamic Pricing**
- Costs adjust based on player progression or time
- Daily deals or limited-time discounts
- Seasonal or event-based upgrade availability

**Future Enhancement 6: Upgrade Specializations**
- Branch upgrades into multiple paths (choose A or B, not both)
- Creates replayability through different builds
- Example: "Scrap Finder" branches to "Finder+" or "Finder Pro"

**Future Enhancement 7: Visual Effect Indicators**
- Particle effects or animations when scrap multiplier is active
- Glow or highlight on feed button when pet bonus applies
- Stat overlay showing active bonuses

**Future Enhancement 8: Upgrade Statistics**
- Track total scrap saved from multipliers
- Track total bonus pets gained from pet upgrades
- Lifetime value/ROI calculations for each upgrade

### 12.2 Scalability Considerations

**Data Management:**
- Current system supports unlimited upgrades in definitions array
- If upgrade count exceeds 20-30, consider category tabs in shop UI
- If effect types expand beyond 5-10, consider effect registry system

**Performance Optimization:**
- Computed observables scale well up to 50+ upgrades
- If calculation becomes complex, consider memoization or caching
- Effect calculations should remain O(n) where n = purchased upgrades

**State Management:**
- Current structure supports easy addition of new upgrade types
- If upgrade state becomes complex (tiers, cooldowns, etc.), consider separate upgrade slice
- Persistence layer should scale with additional properties without changes

**Balance Management:**
- Create balance configuration file for easy tuning
- Consider balance tooling for simulating progression curves
- Implement analytics to track actual player progression vs intended

---

## 13. Acceptance Criteria

### 13.1 Feature Completion Checklist

**Must Have:**
- [ ] `upgradeDefinitions.ts` file created with all 5 upgrade definitions
- [ ] All upgrades have correct IDs, names, descriptions, costs, and effect values
- [ ] `Upgrade` interface updated with `cost` instead of `scrapCost`
- [ ] `category` property added as optional to `Upgrade` interface
- [ ] `totalScrapMultiplier$` computed observable implemented in gameStore
- [ ] `totalPetBonus$` computed observable implemented in gameStore
- [ ] Scrap generation applies scrap multiplier correctly
- [ ] Feed button applies pet bonus correctly
- [ ] Upgrades array populates into `gameState$.upgrades` on initialization
- [ ] Purchased upgrades persist across app restarts
- [ ] Effect calculations update reactively when upgrades purchased
- [ ] All 5 upgrades appear in shop screen correctly
- [ ] upgradeDefinitions.test.ts achieves 95%+ coverage
- [ ] gameStore.test.ts includes effect calculation tests
- [ ] All tests pass in cmd.exe environment

**Should Have:**
- [ ] Shop UI displays upgrade categories visually or textually
- [ ] Scrap multiplier effects are noticeable in scrap accumulation
- [ ] Pet bonus effects are noticeable in feed button behavior
- [ ] Cumulative effects from multiple upgrades work correctly
- [ ] Balance feels appropriate (costs vs benefits)

**Nice to Have:**
- [ ] JSDoc comments on upgrade definitions
- [ ] Balance notes or documentation on upgrade progression
- [ ] Manual testing confirms all upgrades work as intended

---

## 14. Acceptance Testing Scenarios

### 14.1 Happy Path Tests

**Test Case 1: Purchase Scrap Finder**
1. User has 100+ scrap
2. User views "Scrap Finder" in shop (not owned)
3. User purchases upgrade for 100 scrap
4. Expected: Scrap balance decreases by 100, upgrade marked as owned, scrap generation increases by 10%

**Test Case 2: Purchase All Scrap Upgrades**
1. User has 2600+ scrap
2. User purchases Scrap Finder (100), Scrap Magnet (500), Scrap Amplifier (2000)
3. Expected: Total scrap multiplier = 50% (0.1 + 0.15 + 0.25), scrap generation rate = petCount × 1.5

**Test Case 3: Purchase Extra Feed**
1. User has 200+ scrap
2. User purchases "Extra Feed" for 200 scrap
3. User presses feed button
4. Expected: User gains 2 AI Pets (base 1 + bonus 1)

**Test Case 4: Purchase Both Pet Upgrades**
1. User has 1200+ scrap
2. User purchases Extra Feed (200) and Double Feed (1000)
3. User presses feed button
4. Expected: User gains 4 AI Pets (base 1 + bonus 3)

**Test Case 5: Mixed Upgrade Path**
1. User purchases Scrap Finder (100) and Extra Feed (200)
2. Expected: Scrap generation increased by 10%, feed button gives +1 bonus pet

### 14.2 Edge Case Tests

**Test Case 6: Effect Calculation with No Upgrades**
1. User has purchased no upgrades
2. Expected: totalScrapMultiplier$ = 0, totalPetBonus$ = 0, base game mechanics unchanged

**Test Case 7: Effect Calculation with Only Scrap Upgrades**
1. User has purchased all 3 scrap upgrades
2. User has purchased no pet upgrades
3. Expected: totalScrapMultiplier$ = 0.5, totalPetBonus$ = 0

**Test Case 8: Effect Calculation with Only Pet Upgrades**
1. User has purchased both pet upgrades
2. User has purchased no scrap upgrades
3. Expected: totalScrapMultiplier$ = 0, totalPetBonus$ = 3

**Test Case 9: Persistence Test**
1. User purchases Scrap Magnet (500 scrap)
2. User closes app and reopens
3. Expected: Upgrade still owned, scrap multiplier still active (15% bonus)

**Test Case 10: Scrap Generation Rate Verification**
1. User has 10 AI Pets and no scrap upgrades
2. Base rate: 10 scrap/second
3. User purchases Scrap Finder (+10%)
4. Expected: New rate = 11 scrap/second (10 × 1.1)
5. User purchases Scrap Magnet (+15%)
6. Expected: New rate = 12.5 scrap/second (10 × 1.25)

**Test Case 11: Pet Feeding Rate Verification**
1. User has no pet upgrades, feed button gives 1 pet
2. User purchases Extra Feed (+1)
3. Expected: Feed button now gives 2 pets
4. User purchases Double Feed (+2)
5. Expected: Feed button now gives 4 pets (base 1 + 3 bonus)

**Test Case 12: Upgrade Definitions Data Integrity**
1. Load UPGRADES array
2. Expected: Exactly 5 upgrades with unique IDs
3. Expected: Scrap-boost-1, scrap-boost-2, scrap-boost-3, pet-boost-1, pet-boost-2
4. Expected: All costs and effect values match specification

**Test Case 13: Type Compatibility**
1. All code using `scrapCost` updated to use `cost`
2. Expected: No TypeScript compilation errors
3. Expected: Shop screen displays costs correctly

**Test Case 14: Initialization Test**
1. App starts with empty gameState$.upgrades
2. Expected: Upgrades array populates with 5 upgrades from UPGRADES
3. App restarts with existing gameState$.upgrades
4. Expected: Existing data preserved, no duplication

---

## 15. Appendix

### 15.1 Glossary

- **Upgrade:** A one-time permanent purchase that enhances gameplay mechanics
- **Scrap:** Currency earned passively based on AI Pet count (1 per pet per second)
- **Scrap Multiplier:** Percentage increase to passive scrap generation rate
- **Pet Bonus:** Flat increase to AI Pets gained when pressing feed button
- **Effect Type:** Category of upgrade effect (scrapMultiplier or petBonus)
- **Effect Value:** Numerical magnitude of upgrade effect (0.1 for 10%, 1 for +1 pet)
- **Scrap Efficiency:** Category of upgrades that increase scrap generation
- **Pet Acquisition:** Category of upgrades that increase pet gains
- **Additive Stacking:** Method of combining multiple upgrades (sum, not multiply)
- **Computed Observable:** Reactive value that recalculates when dependencies change

### 15.2 Related Documents

- Feature Description: `/mnt/c/dev/class-one-rapids/frontend/modules/upgrades/specs/feature-upgrades.md`
- Shop System PRD: `/mnt/c/dev/class-one-rapids/frontend/modules/shop/specs/prd_shop_20251117.md`
- Scrap System PRD: `/mnt/c/dev/class-one-rapids/frontend/modules/scrap/specs/prd_scrap_system_20251117.md`
- Game State Types: `/mnt/c/dev/class-one-rapids/frontend/shared/types/game.ts`
- Game Store Implementation: `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts`
- Persistence Layer: `/mnt/c/dev/class-one-rapids/frontend/shared/store/persistence.ts`

### 15.3 Code References

#### Upgrade Interface

```typescript
// From /frontend/shared/types/game.ts (updated)

export interface Upgrade {
  id: string;                                    // Unique identifier (e.g., "scrap-boost-1")
  name: string;                                  // Display name (e.g., "Scrap Finder")
  description: string;                           // User-facing explanation
  cost: number;                                  // Scrap cost (changed from scrapCost)
  effectType: 'scrapMultiplier' | 'petBonus';   // Type of effect
  effectValue: number;                           // Magnitude of effect
  category?: 'scrapEfficiency' | 'petAcquisition'; // Optional grouping
}
```

#### Upgrade Definitions Reference

```typescript
// Summary of all 5 upgrades

UPGRADES = [
  { id: 'scrap-boost-1', cost: 100,  effectType: 'scrapMultiplier', effectValue: 0.1  }, // +10%
  { id: 'scrap-boost-2', cost: 500,  effectType: 'scrapMultiplier', effectValue: 0.15 }, // +15%
  { id: 'scrap-boost-3', cost: 2000, effectType: 'scrapMultiplier', effectValue: 0.25 }, // +25%
  { id: 'pet-boost-1',   cost: 200,  effectType: 'petBonus',        effectValue: 1   }, // +1 pet
  { id: 'pet-boost-2',   cost: 1000, effectType: 'petBonus',        effectValue: 2   }, // +2 pets
];
```

#### Effect Calculation Formulas

```typescript
// Total scrap multiplier (sum of all purchased scrap upgrades)
totalScrapMultiplier = sum(upgrade.effectValue where upgrade.effectType === 'scrapMultiplier')

// Total pet bonus (sum of all purchased pet upgrades)
totalPetBonus = sum(upgrade.effectValue where upgrade.effectType === 'petBonus')

// Applied scrap generation
scrapPerSecond = petCount * (1 + totalScrapMultiplier)

// Applied pet feeding
petsGained = basePetGain + totalPetBonus
```

#### Balance Summary

| Upgrade Path      | Total Cost | Total Effect        | Value Ratio      |
|-------------------|------------|---------------------|------------------|
| Scrap Efficiency  | 2,600      | +50% scrap gen      | 0.019% per scrap |
| Pet Acquisition   | 1,200      | +3 pets per feed    | 0.0025 pets/scrap|
| **Full Suite**    | **3,800**  | **Both paths**      | **Mixed**        |

### 15.4 Balance Notes

**Progression Milestones:**
- **0-100 scrap:** Save for first upgrade (Scrap Finder)
- **100-500 scrap:** Decision point (save for Scrap Magnet or buy pet upgrades)
- **500-1000 scrap:** Mid-game progression (Scrap Magnet or Double Feed)
- **1000-2000 scrap:** Late-game saving for Scrap Amplifier
- **2000+ scrap:** End-game completion (all upgrades owned)

**Strategic Considerations:**
- **Early passive focus:** Buy Scrap Finder quickly for compounding returns
- **Early active focus:** Buy Extra Feed for immediate pet gains
- **Mid-game optimization:** Scrap Magnet provides best value (15% for 500)
- **Late-game power:** Scrap Amplifier is expensive but provides 25% boost
- **Balanced approach:** Mix of both paths for versatile progression

**Time-to-Acquire Estimates (with 10 AI Pets baseline):**
- Scrap Finder (100): ~10 seconds
- Extra Feed (200): ~20 seconds
- Scrap Magnet (500): ~50 seconds (or ~45s with Scrap Finder)
- Double Feed (1000): ~100 seconds
- Scrap Amplifier (2000): ~200 seconds (or ~160s with all scrap upgrades)

### 15.5 Revision History

| Version | Date       | Author  | Changes                              |
|---------|------------|---------|--------------------------------------|
| 1.0     | 2025-11-17 | Claude  | Initial PRD creation for upgrades    |

---

**Document Status:** Final - Ready for Implementation
**Next Steps:**
1. Review and approve PRD
2. Create Technical Design Document (TDD)
3. Generate task list for implementation
4. Begin development with type system updates and upgrade definitions
