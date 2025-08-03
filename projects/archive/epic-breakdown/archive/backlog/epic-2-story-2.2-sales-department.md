---
epic: 2
story: 2.2
title: "Sales Department Integration"
status: "backlog"
assigned: ""
blocked_by: ["2.1"]
blocks: ["2.8"]
estimated_hours: 16
actual_hours: 0
completion_date: null
last_updated: 2025-08-03T01:40:15Z
---

# Story 2.2: Sales Department Integration

## User Story
**As a** player, **I want** to convert features into revenue **so that** I can fund expansion.

## Acceptance Criteria
- [ ] Unlocks at $500 total revenue
- [ ] Four unit types: Sales Rep ($100), Account Manager ($1K), Sales Director ($10K), VP Sales ($100K)
- [ ] Lead generation: 0.2, 1, 5, 20 leads/second respectively
- [ ] Revenue conversion: Lead + Feature = $50 (Basic), $500 (Advanced), $5K (Premium)
- [ ] VP Sales provides 15% department boost

## Technical Design

### Sales Department Specification
```typescript
interface SalesDepartment extends Department {
  leadGeneration: number;
  conversionRate: number;
  revenueMultiplier: number;
  
  generateLeads(deltaTime: number): number;
  convertToRevenue(leads: number, features: number): number;
}

const SalesDepartmentConfig = {
  id: 'sales',
  name: 'Sales',
  unlockThreshold: 500,
  units: [
    {
      id: 'sales-rep',
      name: 'Sales Rep',
      baseCost: 100,
      productionRate: 0.2, // leads per second
      departmentBonus: 0
    },
    {
      id: 'account-manager', 
      name: 'Account Manager',
      baseCost: 1000,
      productionRate: 1,
      departmentBonus: 0
    },
    {
      id: 'sales-director',
      name: 'Sales Director', 
      baseCost: 10000,
      productionRate: 5,
      departmentBonus: 0
    },
    {
      id: 'vp-sales',
      name: 'VP Sales',
      baseCost: 100000,
      productionRate: 20,
      departmentBonus: 0.15 // 15% boost
    }
  ]
};
```

### Conversion Mechanics
```typescript
interface ConversionTier {
  featureType: 'basic' | 'advanced' | 'premium';
  leadCost: number;
  featureCost: number;
  revenueGenerated: number;
}

const conversionTiers: ConversionTier[] = [
  { featureType: 'basic', leadCost: 1, featureCost: 1, revenueGenerated: 50 },
  { featureType: 'advanced', leadCost: 1, featureCost: 10, revenueGenerated: 500 },
  { featureType: 'premium', leadCost: 1, featureCost: 100, revenueGenerated: 5000 }
];
```

## Implementation Plan

### Step 1: Department Extension
1. Extend department framework from Story 2.1
2. Create sales-specific resource types (leads)
3. Implement lead generation mechanics
4. Add conversion system for leads + features → revenue
5. Create department unlock logic at $500

### Step 2: Sales Units Implementation
1. Define all four sales unit types with costs and production
2. Implement lead generation rates per unit
3. Add VP Sales 15% department bonus
4. Create visual representation for sales activity
5. Implement unit count and efficiency displays

### Step 3: Revenue Conversion System
1. Create lead pool management system
2. Implement conversion tiers (basic/advanced/premium)
3. Add automatic conversion optimization
4. Create revenue generation visualization
5. Integrate with resource system for money updates

### Step 4: Sales Department UI
1. Create sales department panel extending UI framework
2. Add lead generation rate display
3. Show conversion statistics and efficiency
4. Create purchase interfaces for sales units
5. Add unlock celebration when reaching $500

## Tasks

### Phase 1: Department Framework Integration (3 hours)
- [ ] Extend department system to support sales mechanics (1h)
- [ ] Create lead resource type and management (1h)
- [ ] Implement department unlock at $500 revenue (1h)

### Phase 2: Sales Units Implementation (4 hours)
- [ ] Define Sales Rep unit ($100, 0.2 leads/sec) (1h)
- [ ] Implement Account Manager ($1K, 1 lead/sec) (1h)
- [ ] Create Sales Director ($10K, 5 leads/sec) (1h)
- [ ] Add VP Sales with 15% department boost ($100K, 20 leads/sec) (1h)

### Phase 3: Conversion Mechanics (4 hours)
- [ ] Implement lead + feature conversion system (1.5h)
- [ ] Create three conversion tiers (basic/advanced/premium) (1.5h)
- [ ] Add automatic conversion optimization logic (1h)

### Phase 4: Visual Integration (3 hours)
- [ ] Create sales department UI panel (1.5h)
- [ ] Add lead generation visualization (1h)
- [ ] Implement revenue flow animations (0.5h)

### Phase 5: Testing and Balance (2 hours)
- [ ] Test conversion rates and revenue generation (1h)
- [ ] Validate department unlock progression (1h)

**Total Estimated Time: 16 hours**

## Dependencies
- **Blocks:** Story 2.8 (Department Synergies - needs all departments)
- **Blocked by:** Story 2.1 (Development Department - framework required)

## Definition of Done
- [ ] Sales department unlocks exactly at $500 revenue
- [ ] All four unit types purchasable with correct costs
- [ ] Lead generation rates match specifications
- [ ] Conversion system generates correct revenue amounts
- [ ] VP Sales provides exactly 15% department boost
- [ ] Visual feedback shows lead generation and conversions
- [ ] Department integrates smoothly with existing systems

## Notes
- Conversion optimization could be manual or automatic (design decision pending)
- Consider visual feedback for successful conversions (particle effects?)
- Balance lead generation vs feature production rates
- Future enhancement: different customer types with varied conversion rates