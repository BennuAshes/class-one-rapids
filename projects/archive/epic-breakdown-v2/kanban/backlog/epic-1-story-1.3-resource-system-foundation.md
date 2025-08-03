---
epic: 1
story: 1.3
title: "Resource System Foundation"
status: "backlog"
assigned: ""
blocked_by: ["1.1", "1.2"]
blocks: ["1.4", "2.1", "2.2"]
estimated_hours: 8
actual_hours: 0
completion_date: null
last_updated: "2025-08-03T03:45:00.000Z"
---

# Story 1.3: Resource System Foundation

## User Story
**As a** player, **I want** clear resource management **so that** I understand how to progress and make strategic decisions about resource allocation.

## Acceptance Criteria
- [ ] Lines of Code primary resource with real-time display
- [ ] Money secondary resource generated from features
- [ ] Resource conversion system (10 lines = 1 feature)
- [ ] Clear visual indicators for resource flow
- [ ] Persistent resource storage between sessions
- [ ] Large number formatting (1K, 1M, 1B notation)
- [ ] Resource counter animations smooth at 60 FPS
- [ ] Conversion animations show resource transformation

## Technical Design

### Resource System Architecture
```typescript
// Core resource management with validation and persistence
interface ResourceSystem {
  lines: number;
  money: number;
  features: number;
  conversionRates: ConversionRates;
  history: ResourceTransaction[];
}

interface ConversionRates {
  linesToFeatures: number; // 10 lines = 1 feature
  featuresToMoney: number; // 1 feature = $15 base
  upgradeMultipliers: Record<string, number>;
}
```

### State Management Design
```typescript
// Resource state with computed values and validation
const resourceState$ = observable({
  lines: 0,
  money: 0,
  features: 0,
  conversionRates: {
    linesToFeatures: 10,
    featuresToMoney: 15
  },
  // Computed values for efficiency
  canAfford: (cost: number) => resourceState$.money.get() >= cost,
  canConvert: (lines: number) => resourceState$.lines.get() >= lines,
  totalValue: () => {
    const lines = resourceState$.lines.get();
    const money = resourceState$.money.get();
    const features = resourceState$.features.get();
    return lines + (money / 15) + (features * 10);
  }
});
```

## API Contracts

### Resource Service Interface
```typescript
export interface IResourceService {
  readonly state$: Observable<ResourceState>;
  addLines(amount: number): void;
  addMoney(amount: number): void;
  convertLinesToFeatures(lineAmount: number): boolean;
  convertFeaturesToMoney(featureAmount: number): boolean;
  canAfford(cost: number): boolean;
  formatNumber(value: number): string;
  validateResourceIntegrity(): boolean;
}

export interface ResourceTransaction {
  id: string;
  timestamp: number;
  type: 'add' | 'spend' | 'convert';
  resource: 'lines' | 'money' | 'features';
  amount: number;
  source: string;
}
```

## Implementation Plan

### Step 1: Core Resource State
1. Implement base resource observable state with Legend State
2. Create resource validation and bounds checking
3. Add persistence integration with MMKV storage
4. Implement resource transaction logging
5. Create computed values for resource calculations

### Step 2: Conversion System
1. Design and implement lines-to-features conversion
2. Create features-to-money conversion system
3. Add conversion rate management and upgrades
4. Implement batch conversion operations
5. Add conversion validation and error handling

### Step 3: Display and Formatting
1. Create large number formatting system (K, M, B notation)
2. Implement real-time resource counter displays
3. Add smooth counter animations and transitions
4. Create visual flow indicators for conversions
5. Implement accessibility features for resource displays

### Step 4: Persistence and Integrity
1. Integrate resource state with save system
2. Add resource integrity validation on load
3. Implement backup and recovery for resource corruption
4. Create migration system for resource format changes
5. Add debugging tools for resource tracking

## Tasks

### Phase 1: State Management (3 hours)
- [ ] **Task 1.1:** Implement resource observable state with validation (Estimate: 1.5 hours)
- [ ] **Task 1.2:** Create persistence integration with MMKV (Estimate: 1 hour)
- [ ] **Task 1.3:** Add transaction logging and audit trail (Estimate: 0.5 hours)

### Phase 2: Conversion Logic (2 hours)
- [ ] **Task 2.1:** Implement lines-to-features conversion system (Estimate: 1 hour)
- [ ] **Task 2.2:** Create features-to-money conversion with rate management (Estimate: 1 hour)

### Phase 3: Display System (2 hours)
- [ ] **Task 3.1:** Create number formatting and display components (Estimate: 1 hour)
- [ ] **Task 3.2:** Implement animated resource counters with smooth transitions (Estimate: 1 hour)

### Phase 4: Integration (1 hour)
- [ ] **Task 4.1:** Integrate with clicking system for line generation (Estimate: 0.5 hours)
- [ ] **Task 4.2:** Add resource integrity validation and error recovery (Estimate: 0.5 hours)

**Total Estimated Time: 8 hours**

## Dependencies

### Blocks
- **Story 1.4**: First Automation Unlock - requires money for hiring developers
- **Story 2.1**: Development Department - departments consume and produce resources
- **Story 2.2**: Sales Department - sales converts features to money

### Blocked by
- **Story 1.1**: Project Architecture Setup - requires state management foundation
- **Story 1.2**: Instant Click Gratification - clicking generates lines of code

### Technical Dependencies
- Legend State v3 for reactive resource state management
- MMKV for fast resource persistence
- React Native Reanimated for smooth counter animations
- Number formatting utilities for large values

## Definition of Done

### Core Functionality
- [ ] Players can accumulate Lines of Code through clicking
- [ ] Resource conversion works: 10 lines → 1 feature → $15
- [ ] Resource displays update in real-time with smooth animations
- [ ] All resources persist correctly between game sessions

### Performance Standards
- [ ] Resource calculations complete in < 1ms for normal operations
- [ ] Counter animations maintain 60 FPS during rapid changes
- [ ] Resource state saves/loads in < 100ms
- [ ] Memory usage for resource system < 5MB

### Integration Completeness
- [ ] Clicking system properly adds lines to resource pool
- [ ] Conversion buttons appear when resources are available
- [ ] Large numbers display correctly (1.23K, 4.56M format)
- [ ] Resource integrity validation prevents save corruption

## Notes
- Resource system is core to entire game progression - ensure rock-solid reliability
- Focus on clear visual feedback so players understand resource flow
- Consider players who may be colorblind for resource differentiation
- Ensure resource calculations remain accurate at very large numbers (> 1e15)
- Plan for future resource types (premium currency, reputation, etc.)