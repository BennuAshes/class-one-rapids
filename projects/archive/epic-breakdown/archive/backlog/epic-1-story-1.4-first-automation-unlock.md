---
epic: 1
story: 1.4
title: "First Automation Unlock"
status: "backlog"
assigned: ""
blocked_by: []
blocks: []
estimated_hours: 0
actual_hours: 0
completion_date: null
last_updated: 2025-08-03T01:40:04Z
---

# Story 1.4: First Automation Unlock

## User Story
**As a** player, **I want** to hire my first developer **so that** I experience automation satisfaction.


## Acceptance Criteria
- [ ] Junior Dev purchasable for $10 after 5 clicks
- [ ] Produces 0.1 lines/second with visual confirmation
- [ ] Animated dev sprite typing at desk
- [ ] Cost scaling formula: base * 1.15^owned
- [ ] Purchase confirmation with celebration effect


## Technical Design

### Automation System Design
```typescript
interface AutomationUnit {
  id: string;
  type: 'junior-dev' | 'mid-dev' | 'senior-dev' | 'tech-lead';
  baseCost: number;
  productionRate: number;
  owned: number;
  
  // Computed properties
  currentCost: number;
  totalProduction: number;
  efficiencyMultiplier: number;
}

interface AutomationSystem {
  units: Map<string, AutomationUnit>;
  totalProduction: number;
  
  purchase(unitType: string): PurchaseResult;
  update(deltaTime: number): void;
  calculateProduction(): number;
}
```

### Cost Scaling System
```typescript
interface CostCalculator {
  calculateCost(baseCost: number, owned: number): number;
  calculateBulkCost(baseCost: number, owned: number, quantity: number): number;
  getNextCost(unitType: string): number;
}

// Formula: cost = baseCost * (1.15 ^ owned)
// Examples:
// 1st Junior Dev: $10 * 1.15^0 = $10
// 2nd Junior Dev: $10 * 1.15^1 = $11.50
// 3rd Junior Dev: $10 * 1.15^2 = $13.23
```

### Production System
```typescript
interface ProductionCalculator {
  calculateUnitProduction(unit: AutomationUnit): number;
  calculateTotalProduction(units: AutomationUnit[]): number;
  applyEfficiencyMultipliers(baseProduction: number): number;
  processProduction(deltaTime: number): ResourceUpdate[];
}

interface ProductionTick {
  unitId: string;
  resourcesGenerated: number;
  timestamp: number;
  efficiency: number;
}
```

## API Contracts

### Automation Management Interface
```typescript
export interface IAutomationManager {
  purchaseUnit(unitType: string, quantity: number): PurchaseResult;
  getUnitInfo(unitType: string): AutomationUnit;
  getTotalProduction(): number;
  canAffordUnit(unitType: string): boolean;
  update(deltaTime: number): void;
}

export interface PurchaseResult {
  success: boolean;
  unitsPurchased: number;
  costPaid: number;
  errorMessage?: string;
}
```

### Visual System Integration
```typescript
export interface IAutomationVisuals {
  showPurchaseAnimation(unitType: string): void;
  updateUnitCount(unitType: string, count: number): void;
  animateProduction(unitType: string, amount: number): void;
  showUnlockCelebration(unitType: string): void;
}

export interface UnitAnimation {
  sprite: HTMLElement;
  animationState: 'idle' | 'working' | 'celebration';
  productionParticles: ParticleSystem;
}
```

### Achievement Integration
```typescript
export interface AutomationMilestone {
  unitType: string;
  threshold: number;
  achievement: string;
  reward?: Bonus;
}
```


## Implementation Plan

### Step 1: Automation Core System
1. Create automation unit data structures and management
2. Implement cost calculation with exponential scaling
3. Add purchase validation and resource deduction
4. Create production calculation and resource generation
5. Integrate with game loop for continuous production

### Step 2: Junior Developer Implementation
1. Define Junior Dev unit with $10 base cost and 0.1/sec production
2. Implement purchase unlock after 5 clicks (when player can afford)
3. Add purchase confirmation and success feedback
4. Create unit count display and management
5. Add purchase button with cost display and availability

### Step 3: Visual Automation System
1. Create animated sprite system for developer units
2. Implement typing animation at desk visualization
3. Add production visualization (code flowing from dev)
4. Create purchase celebration effects
5. Add visual feedback for production rate

### Step 4: Production Integration
1. Integrate automated production with resource system
2. Add production rate display and statistics
3. Create efficiency calculation and display
4. Implement production pause/resume functionality
5. Add production history tracking

### Step 5: Scaling Foundation
1. Create flexible system for additional automation units
2. Implement cost scaling formula validation
3. Add bulk purchase calculation framework
4. Create automation statistics and analytics
5. Prepare system for department expansion


## Tasks

### Phase 1: Automation System Foundation (4 hours)
- [ ] **Task 1.1:** Create automation unit data structures and TypeScript interfaces (Estimate: 1 hour)
- [ ] **Task 1.2:** Implement cost scaling calculator (base * 1.15^owned formula) (Estimate: 1.5 hours)
- [ ] **Task 1.3:** Create purchase validation and resource deduction system (Estimate: 1 hour)
- [ ] **Task 1.4:** Add automation state management integration (Estimate: 0.5 hours)

### Phase 2: Junior Developer Implementation (3 hours)
- [ ] **Task 2.1:** Define Junior Dev unit ($10 base cost, 0.1/sec production) (Estimate: 0.5 hours)
- [ ] **Task 2.2:** Implement purchase unlock logic (available after 5 clicks) (Estimate: 1 hour)
- [ ] **Task 2.3:** Create purchase button with cost display and availability (Estimate: 1 hour)
- [ ] **Task 2.4:** Add purchase confirmation and celebration effects (Estimate: 0.5 hours)

### Phase 3: Production System (4 hours)
- [ ] **Task 3.1:** Implement continuous production calculation engine (Estimate: 1.5 hours)
- [ ] **Task 3.2:** Integrate production with game loop (delta time handling) (Estimate: 1 hour)
- [ ] **Task 3.3:** Add production rate display and real-time updates (Estimate: 1 hour)
- [ ] **Task 3.4:** Create production statistics tracking (Estimate: 0.5 hours)

### Phase 4: Visual Automation System (4 hours)
- [ ] **Task 4.1:** Create animated developer sprite typing at desk (Estimate: 2 hours)
- [ ] **Task 4.2:** Implement production visualization (code flowing from dev) (Estimate: 1.5 hours)
- [ ] **Task 4.3:** Add visual feedback for unit count and efficiency (Estimate: 0.5 hours)

### Phase 5: Integration and Polish (2 hours)
- [ ] **Task 5.1:** Integrate automation with resource system and display (Estimate: 1 hour)
- [ ] **Task 5.2:** Add automation pause/resume functionality (Estimate: 0.5 hours)
- [ ] **Task 5.3:** Create automation tutorial tooltips and guidance (Estimate: 0.5 hours)

### Phase 6: Testing and Validation (2 hours)
- [ ] **Task 6.1:** Create unit tests for cost calculation and production math (Estimate: 1 hour)
- [ ] **Task 6.2:** Performance testing for automation with multiple units (Estimate: 1 hour)

**Total Estimated Time: 19 hours**


## Dependencies

### Blocks
- **Story 1.5**: UI foundation needs automation interface components
- **Epic 2**: Department systems build on automation framework
- All future automation features depend on this foundation

### Blocked by
- **Story 1.2**: Needs click system to track clicks for unlock timing
- **Story 1.3**: Requires resource system for purchase costs and production

### Technical Dependencies
- Animation system for sprite movements
- Resource management for purchase validation
- Game loop integration for continuous production
- State persistence for automation state


## Definition of Done

### Core Functionality
- [ ] Junior Dev purchasable for $10 after player has enough money
- [ ] Junior Dev produces 0.1 lines of code per second continuously
- [ ] Cost scaling works correctly: 2nd dev costs $11.50, 3rd costs $13.23
- [ ] Purchase button shows current cost and availability
- [ ] Production runs automatically and updates resources

### Visual Requirements
- [ ] Animated developer sprite typing at desk
- [ ] Visual confirmation of production (particles, numbers)
- [ ] Purchase celebration effect feels rewarding
- [ ] Unit count displayed clearly
- [ ] Production rate visible and updates in real-time

### Mathematical Accuracy
- [ ] Cost scaling formula: baseCost * (1.15 ^ owned) implemented correctly
- [ ] Production rate: 0.1 lines/second per Junior Dev verified
- [ ] Resource integration maintains precision
- [ ] No floating point errors in cost calculations
- [ ] Production accumulates correctly over time

### Performance Standards
- [ ] Production calculations efficient for up to 100 units
- [ ] Visual animations maintain 60 FPS
- [ ] Purchase operations respond within 50ms
- [ ] No memory leaks during extended automation
- [ ] Save/load includes automation state correctly

### User Experience
- [ ] First automation purchase feels like meaningful progression
- [ ] Automation provides clear value over manual clicking
- [ ] Cost progression creates anticipation for next purchase
- [ ] Visual feedback makes automation feel alive and productive
- [ ] Unlock timing feels appropriately paced (not too early/late)


## Notes
- Migrated from 3-file format
