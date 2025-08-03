# Story 1.4: First Automation Unlock - Technical Specification

## Story Overview
**As a** player, **I want** to hire my first developer **so that** I experience automation satisfaction.

## Acceptance Criteria
- [ ] Junior Dev purchasable for $10 after 5 clicks
- [ ] Produces 0.1 lines/second with visual confirmation
- [ ] Animated dev sprite typing at desk
- [ ] Cost scaling formula: base * 1.15^owned
- [ ] Purchase confirmation with celebration effect

## Technical Architecture

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

## Security & Compliance
- **Purchase Validation**: Verify sufficient resources before purchase
- **Cost Calculation**: Prevent floating point precision errors
- **Production Integrity**: Ensure production rates match specifications
- **State Consistency**: Maintain automation state across saves/loads

## Research Context
- **Idle Game Mechanics**: Adventure Capitalist automation patterns
- **Performance**: Efficient production calculation for many units
- **State Management**: Automation state integrated with game state
- **Visual Feedback**: Satisfying automation visualization from Egg Inc patterns