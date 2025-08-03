---
epic: 2
story: 2.2
title: "Sales Department"
status: "backlog"
assigned: ""
blocked_by: ["1.3", "1.5", "2.1"]
blocks: ["3.2", "3.4"]
estimated_hours: 12
actual_hours: 0
completion_date: null
last_updated: "2025-08-03T03:45:00.000Z"
---

# Story 2.2: Sales Department

## User Story
**As a** player, **I want** to convert features into revenue **so that** I can fund expansion and grow my business profitably.

## Acceptance Criteria
- [ ] Sales team generates customer leads at specified rates
- [ ] Lead + Feature conversion system generates revenue (1 Lead + 1 Basic Feature = $50)
- [ ] Four sales roles: Rep, Account Manager, Sales Director, VP Sales
- [ ] Sales process visualization showing lead generation and conversion
- [ ] Customer relationship management mechanics
- [ ] Revenue optimization through team upgrades (CRM, Training, Partnerships)
- [ ] Sales performance metrics and analytics

## Technical Design

### Sales Department Architecture
```typescript
interface SalesDepartment {
  employees: SalesEmployees;
  leads: CustomerLead[];
  conversions: SalesConversion[];
  upgrades: SalesUpgrade[];
  metrics: SalesMetrics;
}

interface SalesEmployees {
  reps: { count: number, rate: 0.2, baseCost: 100 };
  accountManagers: { count: number, rate: 1.0, baseCost: 1000 };
  directors: { count: number, rate: 5.0, baseCost: 10000 };
  vpSales: { count: number, rate: 20.0, baseCost: 100000 };
}

interface CustomerLead {
  id: string;
  value: number;
  conversionTime: number;
  source: string;
}
```

### Revenue Conversion System
```typescript
const salesState$ = observable({
  employees: {
    reps: 0,
    accountManagers: 0,
    directors: 0,
    vpSales: 0
  },
  leads: 0,
  conversions: {
    basicFeature: 50,   // 1 Lead + 1 Basic Feature = $50
    advancedFeature: 500, // 1 Lead + 1 Advanced Feature = $500
    premiumFeature: 5000  // 1 Lead + 1 Premium Feature = $5000
  },
  // Computed lead generation rate
  leadGeneration: () => {
    const reps = salesState$.employees.reps.get() * 0.2;
    const managers = salesState$.employees.accountManagers.get() * 1.0;
    const directors = salesState$.employees.directors.get() * 5.0;
    const vp = salesState$.employees.vpSales.get() * 20.0;
    return reps + managers + directors + vp;
  }
});
```

## Implementation Plan

### Step 1: Sales Team Structure
1. Implement sales department state management
2. Create four employee types with lead generation rates
3. Add lead accumulation and storage system
4. Implement basic sales hiring interface
5. Create lead generation calculations

### Step 2: Conversion Mechanics
1. Design feature + lead conversion system
2. Implement three conversion tiers (Basic/Advanced/Premium)
3. Add conversion process visualization
4. Create customer pipeline management
5. Implement revenue calculation and tracking

### Step 3: Sales Upgrades
1. Add CRM system upgrade (+30% lead generation)
2. Implement Sales Training (2x multiplier at 25 reps)
3. Create Partnership Deals (+50% revenue per sale)
4. Add upgrade unlock conditions and costs
5. Integrate upgrade effects with calculations

## Tasks

### Phase 1: Department Structure (4 hours)
- [ ] **Task 1.1:** Implement sales department state and employee types (Estimate: 2 hours)
- [ ] **Task 1.2:** Create lead generation system with accumulation (Estimate: 2 hours)

### Phase 2: Conversion System (4 hours)
- [ ] **Task 2.1:** Implement lead + feature conversion mechanics (Estimate: 2 hours)
- [ ] **Task 2.2:** Create conversion visualization and customer pipeline (Estimate: 2 hours)

### Phase 3: Upgrades and Optimization (4 hours)
- [ ] **Task 3.1:** Add three sales upgrades with effects (Estimate: 2 hours)
- [ ] **Task 3.2:** Implement sales metrics and performance analytics (Estimate: 2 hours)

**Total Estimated Time: 12 hours**

## Dependencies

### Blocks
- **Story 3.2**: Employee Types and Roles - sales establishes role patterns
- **Story 3.4**: Department Synergies - sales synergizes with development

### Blocked by
- **Story 1.3**: Resource System Foundation - requires features for conversion
- **Story 1.5**: UI Foundation System - needs UI for sales interface
- **Story 2.1**: Development Department - features come from development

## Definition of Done
- [ ] Sales team generates leads at specified rates per employee type
- [ ] Lead + feature conversion produces correct revenue amounts
- [ ] Sales upgrades provide meaningful productivity improvements
- [ ] Sales process visualization clearly shows pipeline flow