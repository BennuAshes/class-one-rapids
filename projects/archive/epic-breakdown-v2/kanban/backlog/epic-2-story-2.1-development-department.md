---
epic: 2
story: 2.1
title: "Development Department"
status: "backlog"
assigned: ""
blocked_by: ["1.4", "1.5", "1.6"]
blocks: ["2.2", "3.1", "3.4"]
estimated_hours: 14
actual_hours: 0
completion_date: null
last_updated: "2025-08-03T03:45:00.000Z"
---

# Story 2.1: Development Department

## User Story
**As a** player, **I want** to build and manage a development team **so that** I can produce software features efficiently and scale my business.

## Acceptance Criteria
- [ ] Four developer types with unique production rates (Junior, Mid, Senior, Tech Lead)
- [ ] Upgrade system for enhanced productivity (IDEs, pair programming, code reviews)
- [ ] Visual representation of team working with animations
- [ ] Department synergies with other teams
- [ ] Scaling economics (costs increase with team size)
- [ ] Team efficiency bonuses at milestone counts (25, 50, 100 developers)
- [ ] Production rate calculations update in real-time

## Technical Design

### Department Architecture
```typescript
interface DevelopmentDepartment {
  employees: Record<EmployeeType, number>;
  upgrades: DepartmentUpgrade[];
  productivity: ProductivityMetrics;
  synergies: SynergyBonus[];
}

interface EmployeeType {
  junior: { rate: 0.1, baseCost: 10 };
  mid: { rate: 0.5, baseCost: 100 };
  senior: { rate: 2.5, baseCost: 1000 };
  techLead: { rate: 10, baseCost: 10000 };
}

interface DepartmentUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: UpgradeEffect;
  unlocked: boolean;
}
```

### Production System Design
```typescript
const developmentState$ = observable({
  employees: {
    junior: 0,
    mid: 0,
    senior: 0,
    techLead: 0
  },
  upgrades: {
    betterIDEs: false,
    pairProgramming: false,
    codeReviews: false
  },
  // Computed total production
  totalProduction: () => {
    const junior = developmentState$.employees.junior.get() * 0.1;
    const mid = developmentState$.employees.mid.get() * 0.5;
    const senior = developmentState$.employees.senior.get() * 2.5;
    const techLead = developmentState$.employees.techLead.get() * 10;
    
    let base = junior + mid + senior + techLead;
    
    // Apply upgrades
    if (developmentState$.upgrades.betterIDEs.get()) base *= 1.25;
    if (developmentState$.upgrades.pairProgramming.get()) base *= 2.0;
    if (developmentState$.upgrades.codeReviews.get()) base *= 1.5;
    
    return base;
  }
});
```

## API Contracts

### Development Service Interface
```typescript
export interface IDevelopmentService {
  readonly state$: Observable<DevelopmentState>;
  hireEmployee(type: EmployeeType, count: number): Promise<boolean>;
  fireEmployee(type: EmployeeType, count: number): boolean;
  purchaseUpgrade(upgradeId: string): Promise<boolean>;
  calculateProductionRate(): number;
  calculateHiringCost(type: EmployeeType, count: number): number;
  getTeamEfficiencyBonus(): number;
}

export interface ProductionCalculation {
  baseRate: number;
  upgradeMultiplier: number;
  synergyBonus: number;
  efficiencyBonus: number;
  finalRate: number;
}
```

## Implementation Plan

### Step 1: Core Department Structure
1. Implement development department state management
2. Create employee hiring and management system
3. Add basic production rate calculations
4. Implement cost scaling for employee types
5. Create department UI layout and navigation

### Step 2: Employee Management
1. Add four employee types with unique characteristics
2. Implement hiring cost progression (base * 1.15^owned)
3. Create employee management interface
4. Add visual representation of team members
5. Implement firing/downsizing functionality

### Step 3: Upgrade System
1. Design and implement department upgrades
2. Create upgrade unlock conditions and costs
3. Add upgrade effects to production calculations
4. Implement upgrade purchase interface
5. Create upgrade visualization and feedback

### Step 4: Advanced Features
1. Add team efficiency bonuses at milestones
2. Implement department synergy system
3. Create production optimization analytics
4. Add department statistics and metrics
5. Integrate with achievement system

## Tasks

### Phase 1: Department Foundation (4 hours)
- [ ] **Task 1.1:** Implement development department state and basic structure (Estimate: 2 hours)
- [ ] **Task 1.2:** Create employee hiring system with cost calculations (Estimate: 2 hours)

### Phase 2: Employee Types (4 hours)
- [ ] **Task 2.1:** Add four employee types with unique rates and costs (Estimate: 2 hours)
- [ ] **Task 2.2:** Implement visual representation and animations (Estimate: 2 hours)

### Phase 3: Upgrade System (3 hours)
- [ ] **Task 3.1:** Create upgrade system with Better IDEs, Pair Programming, Code Reviews (Estimate: 2 hours)
- [ ] **Task 3.2:** Implement upgrade effects and production bonuses (Estimate: 1 hour)

### Phase 4: Advanced Features (3 hours)
- [ ] **Task 4.1:** Add team efficiency bonuses at 25/50/100 employee milestones (Estimate: 1.5 hours)
- [ ] **Task 4.2:** Implement basic department synergy system (Estimate: 1.5 hours)

**Total Estimated Time: 14 hours**

## Dependencies

### Blocks
- **Story 2.2**: Sales Department - sales team needs features from development
- **Story 3.1**: Employee Hiring System - builds on basic hiring established here
- **Story 3.4**: Department Synergies - development is core to synergy system

### Blocked by
- **Story 1.4**: First Automation Unlock - establishes basic hiring concept
- **Story 1.5**: UI Foundation System - requires UI components for department interface
- **Story 1.6**: Feedback System - needs audio/visual feedback for department actions

### Technical Dependencies
- Legend State v3 for reactive department state
- Game loop integration for continuous production
- UI component library for department interface
- Animation system for employee visual representation

## Definition of Done

### Core Functionality
- [ ] Players can hire Junior, Mid, Senior developers and Tech Leads
- [ ] Each employee type has correct production rate and scaling cost
- [ ] Production calculations update in real-time and persist between sessions
- [ ] Three upgrade types (IDEs, Pair Programming, Code Reviews) function correctly

### Performance Standards
- [ ] Department calculations complete in < 5ms per frame
- [ ] UI remains responsive with 100+ employees
- [ ] Visual animations maintain 60 FPS with active team
- [ ] Memory usage scales linearly with employee count

### Integration Completeness
- [ ] Integrates properly with resource system for code production
- [ ] Connects with achievement system for department milestones
- [ ] Provides foundation for other departments to reference
- [ ] Works with save system for department persistence

## Notes
- Development department is the core of the game - establish patterns other departments will follow
- Focus on clear visual feedback so players understand team productivity
- Ensure upgrade effects feel meaningful and worth the investment
- Plan for future expansion with additional employee types and upgrades
- Consider accessibility in employee management interface design