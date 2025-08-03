---
epic: 1
story: 1.4
title: "First Automation Unlock"
status: "backlog"
assigned: ""
blocked_by: ["1.1", "1.3"]
blocks: ["2.1", "3.1"]
estimated_hours: 6
actual_hours: 0
completion_date: null
last_updated: "2025-08-03T03:45:00.000Z"
---

# Story 1.4: First Automation Unlock

## User Story
**As a** player, **I want** to automate repetitive tasks **so that** I can focus on strategy and watch my business grow automatically.

## Acceptance Criteria
- [ ] First Junior Developer hireable at $10
- [ ] Automated code generation (0.1 lines/sec)
- [ ] Visual representation of developer working
- [ ] Clear indication that automation is active
- [ ] Progression path to more automation visible
- [ ] Developer production scales with time
- [ ] Hire button disabled when insufficient funds

## Technical Design

### Automation System Architecture
```typescript
interface AutomationSystem {
  employees: Employee[];
  productionRate: number;
  lastUpdateTime: number;
  isActive: boolean;
}

interface Employee {
  id: string;
  type: 'junior' | 'mid' | 'senior' | 'lead';
  productionRate: number; // lines per second
  cost: number;
  hired: boolean;
}
```

### Production Calculation
```typescript
const automationState$ = observable({
  juniorDevs: 0,
  totalProduction: () => automationState$.juniorDevs.get() * 0.1,
  lastUpdate: Date.now(),
  accumulatedLines: 0
});

// Production calculation with delta time
const calculateProduction = (deltaTime: number): number => {
  const rate = automationState$.totalProduction.get();
  return rate * deltaTime;
};
```

## Implementation Plan

### Step 1: Basic Automation
1. Create employee state management
2. Implement hire/fire functionality
3. Add production calculation system
4. Create basic UI for hiring

### Step 2: Visual Feedback
1. Add developer sprite animation
2. Create production indicators
3. Implement progress visualization
4. Add automation status display

## Tasks

### Phase 1: Core Automation (3 hours)
- [ ] **Task 1.1:** Implement employee state and hiring logic (Estimate: 1.5 hours)
- [ ] **Task 1.2:** Create production calculation with game loop integration (Estimate: 1.5 hours)

### Phase 2: Visual Implementation (3 hours)
- [ ] **Task 2.1:** Create developer sprite and animation system (Estimate: 1.5 hours)
- [ ] **Task 2.2:** Add hiring UI and production displays (Estimate: 1.5 hours)

**Total Estimated Time: 6 hours**

## Dependencies

### Blocks
- **Story 2.1**: Development Department - expands on automation concept
- **Story 3.1**: Employee Hiring System - builds on basic hiring

### Blocked by
- **Story 1.1**: Project Architecture Setup - requires game loop framework
- **Story 1.3**: Resource System Foundation - requires money for hiring

## Definition of Done
- [ ] Players can hire first Junior Developer for $10
- [ ] Developer automatically generates 0.1 lines of code per second
- [ ] Visual animation shows developer working
- [ ] Production continues during app backgrounding (up to 12 hours)
- [ ] Hire button states clearly indicate affordability