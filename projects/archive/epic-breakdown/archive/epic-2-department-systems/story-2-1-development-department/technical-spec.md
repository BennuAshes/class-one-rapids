# Story 2.1: Development Department Core - Technical Specification

## Story Overview
**As a** player, **I want** to build a development team **so that** I can scale code production efficiently.

## Acceptance Criteria
- [ ] Four unit types: Junior Dev ($10), Mid Dev ($100), Senior Dev ($1K), Tech Lead ($10K)
- [ ] Production rates: 0.1, 0.5, 2.5, 10 lines/second respectively
- [ ] Tech Lead provides 10% department boost
- [ ] Three upgrade tiers: Better IDEs (+25/50/100% speed)
- [ ] Visual department panel with unit count display

## Technical Architecture

### Department System Design
```typescript
interface Department {
  id: string;
  name: string;
  unlockThreshold: number;
  isUnlocked: boolean;
  units: DepartmentUnit[];
  upgrades: DepartmentUpgrade[];
  efficiency: number;
  totalProduction: number;
}

interface DepartmentUnit {
  id: string;
  name: string;
  baseCost: number;
  productionRate: number;
  owned: number;
  departmentBonus: number;
}

interface DepartmentUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number;
  isUnlocked: boolean;
  isPurchased: boolean;
}
```

### Development Department Specification
```typescript
const DevelopmentDepartment: Department = {
  id: 'development',
  name: 'Development',
  unlockThreshold: 0, // Available from start
  units: [
    {
      id: 'junior-dev',
      name: 'Junior Developer',
      baseCost: 10,
      productionRate: 0.1, // lines per second
      departmentBonus: 0
    },
    {
      id: 'mid-dev', 
      name: 'Mid Developer',
      baseCost: 100,
      productionRate: 0.5,
      departmentBonus: 0
    },
    {
      id: 'senior-dev',
      name: 'Senior Developer', 
      baseCost: 1000,
      productionRate: 2.5,
      departmentBonus: 0
    },
    {
      id: 'tech-lead',
      name: 'Tech Lead',
      baseCost: 10000,
      productionRate: 10,
      departmentBonus: 0.1 // 10% boost to entire department
    }
  ],
  upgrades: [
    {
      id: 'better-ides-1',
      name: 'Better IDEs',
      description: '+25% coding speed',
      cost: 5000,
      multiplier: 1.25
    },
    {
      id: 'better-ides-2', 
      name: 'Advanced IDEs',
      description: '+50% coding speed',
      cost: 50000,
      multiplier: 1.5
    },
    {
      id: 'better-ides-3',
      name: 'Premium IDEs', 
      description: '+100% coding speed',
      cost: 500000,
      multiplier: 2.0
    }
  ]
};
```

## API Contracts

### Department Management Interface
```typescript
export interface IDepartmentManager {
  getDepartment(id: string): Department;
  purchaseUnit(departmentId: string, unitId: string, quantity: number): PurchaseResult;
  purchaseUpgrade(departmentId: string, upgradeId: string): PurchaseResult;
  calculateProduction(departmentId: string): number;
  applyDepartmentBonuses(departmentId: string): number;
}

export interface DepartmentProduction {
  departmentId: string;
  baseProduction: number;
  bonusMultiplier: number;
  totalProduction: number;
  breakdown: ProductionBreakdown[];
}
```

## Security & Compliance
- **Cost Validation**: Verify upgrade and unit costs are mathematically correct
- **Production Integrity**: Ensure production calculations match specifications  
- **State Consistency**: Department state remains valid across operations
- **Balance Protection**: Prevent exploit through department manipulation

## Research Context
- **Idle Game Mechanics**: Adventure Capitalist department patterns
- **Automation Extension**: Builds on Epic 1 automation foundation
- **Department Synergies**: Foundation for Epic 2.8 cross-department bonuses
- **Visual Feedback**: Clear production visualization like Egg Inc