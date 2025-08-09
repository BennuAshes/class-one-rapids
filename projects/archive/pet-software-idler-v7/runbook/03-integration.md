# Phase 3: Integration

## Objective
Connect features, implement department synergies, automation systems, offline progression, and ensure seamless cross-feature coordination.

## Prerequisites
- [ ] Core mechanics operational (Phase 2)
- [ ] Department system functional
- [ ] Resource management working
- [ ] Game loop running smoothly

## Work Packages

### WP 3.1: Department Synergies

#### Task 3.1.1: Create Synergy State Management
Create `src/features/synergies/state/synergyState.ts`:
```typescript
import { observable, computed } from '@legendapp/state';
import { departmentState$ } from '@features/departments/state';

export const synergyState$ = observable({
  bonuses: {
    developmentSales: 0,      // Dev + Sales combo
    designQA: 0,              // Design + QA combo
    fullStack: 0,             // All departments bonus
  },
  milestones: {
    25: { multiplier: 2, achieved: new Set<string>() },
    50: { multiplier: 3, achieved: new Set<string>() },
    100: { multiplier: 5, achieved: new Set<string>() }
  }
});

// Compute active synergies
export const activeSynergies$ = computed(() => {
  const depts = departmentState$.departments.get();
  const synergies = [];
  
  // Development + Sales synergy
  if (depts.development.workers >= 10 && depts.sales.workers >= 5) {
    synergies.push({
      name: 'Dev-Sales Combo',
      bonus: 1.5,
      description: 'Features sell for 50% more'
    });
  }
  
  // Check department milestones
  Object.values(depts).forEach(dept => {
    if (dept.workers >= 25 && !synergyState$.milestones[25].achieved.has(dept.id)) {
      synergyState$.milestones[25].achieved.add(dept.id);
      dept.efficiency *= 2;
    }
  });
  
  return synergies;
});
```
**Validation:** Synergies calculate and apply correctly
**Time:** 45 minutes

#### Task 3.1.2: Implement Cross-Department Effects
Create `src/features/synergies/services/synergyService.ts`:
```typescript
import { batch } from '@legendapp/state';
import { activeSynergies$ } from '../state/synergyState';
import { featureShippingState$ } from '@features/featureShipping/state';

export function applySynergies() {
  const synergies = activeSynergies$.get();
  
  batch(() => {
    // Reset multipliers
    featureShippingState$.conversionMultiplier.set(1);
    
    // Apply active synergies
    synergies.forEach(synergy => {
      switch (synergy.name) {
        case 'Dev-Sales Combo':
          featureShippingState$.conversionMultiplier.set(prev => 
            prev * synergy.bonus
          );
          break;
        // Add other synergy effects
      }
    });
  });
}

// Run synergy checks periodically
export function updateSynergies() {
  applySynergies();
  checkMilestones();
}
```
**Validation:** Synergies affect game mechanics
**Time:** 30 minutes

### WP 3.2: Manager Automation System

#### Task 3.2.1: Create Manager State
Update department state with manager functionality:
```typescript
// Add to departmentState.ts
export const managerState$ = observable({
  managers: {
    development: { 
      hired: false, 
      cost: new Decimal(50000),
      autoClickRate: 10 // clicks per second
    },
    sales: { 
      hired: false, 
      cost: new Decimal(75000),
      autoConvertRate: 1 // features per second
    }
    // Other departments...
  }
});

export function hireManager(departmentId: string): boolean {
  const manager = managerState$.managers[departmentId];
  const money = resourceState$.money.get();
  
  if (manager.hired || money.lt(manager.cost)) {
    return false;
  }
  
  batch(() => {
    resourceState$.money.set(prev => prev.minus(manager.cost));
    managerState$.managers[departmentId].hired.set(true);
  });
  
  return true;
}
```
**Validation:** Managers can be hired
**Time:** 30 minutes

#### Task 3.2.2: Implement Manager Automation
Create `src/features/departments/hooks/useManagerAutomation.ts`:
```typescript
import { useEffect } from 'react';
import { managerState$ } from '../state/departmentState';
import { codeProductionActions } from '@features/codeProduction/state';
import { shipFeature } from '@features/featureShipping/services';

export function useManagerAutomation() {
  useEffect(() => {
    const interval = setInterval(() => {
      const managers = managerState$.managers.get();
      
      // Development manager auto-clicks
      if (managers.development.hired) {
        for (let i = 0; i < managers.development.autoClickRate / 10; i++) {
          codeProductionActions.writeCode();
        }
      }
      
      // Sales manager auto-ships features
      if (managers.sales.hired && canShipFeature$.get()) {
        shipFeature();
      }
      
      // Other manager automations...
    }, 100); // Check 10 times per second
    
    return () => clearInterval(interval);
  }, []);
}
```
**Validation:** Managers automate their departments
**Time:** 30 minutes

### WP 3.3: Offline Progression System

#### Task 3.3.1: Create Offline Calculator
Create `src/features/saving/services/offlineProgression.ts`:
```typescript
import { batch } from '@legendapp/state';
import Decimal from 'decimal.js';

const MAX_OFFLINE_HOURS = 12;

export function calculateOfflineProgress(lastSaveTime: number): OfflineReport {
  const now = Date.now();
  const offlineMs = Math.min(
    now - lastSaveTime,
    MAX_OFFLINE_HOURS * 60 * 60 * 1000
  );
  const offlineSeconds = offlineMs / 1000;
  
  const report: OfflineReport = {
    timeAway: offlineSeconds,
    codeProduced: new Decimal(0),
    featuresShipped: 0,
    moneyEarned: new Decimal(0),
    departmentProgress: {}
  };
  
  // Calculate code production
  const prodRate = productionRate$.get();
  report.codeProduced = prodRate.times(offlineSeconds);
  
  // Calculate automated feature shipping
  if (managerState$.managers.sales.hired.get()) {
    const shipsPerSecond = 0.1; // Reduced rate for offline
    const potentialShips = Math.floor(offlineSeconds * shipsPerSecond);
    const codeAvailable = report.codeProduced.plus(
      codeProductionState$.linesOfCode.get()
    );
    const maxShips = codeAvailable.div(
      featureShippingState$.codePerFeature.get()
    ).floor();
    
    report.featuresShipped = Math.min(potentialShips, maxShips.toNumber());
    report.moneyEarned = new Decimal(report.featuresShipped).times(
      featureShippingState$.moneyPerFeature.get()
    );
  }
  
  return report;
}
```
**Validation:** Offline calculations are accurate
**Time:** 45 minutes

#### Task 3.3.2: Apply Offline Progress on Load
Update `src/features/saving/services/saveService.ts`:
```typescript
export async function loadGame() {
  try {
    const saveData = await AsyncStorage.getItem('petsoft-tycoon-save');
    if (!saveData) return false;
    
    const parsed = JSON.parse(saveData);
    const lastSave = parsed.timestamp;
    
    // Load saved state
    batch(() => {
      // Restore all state from save
      restoreGameState(parsed.gameState);
    });
    
    // Calculate and apply offline progress
    const offlineReport = calculateOfflineProgress(lastSave);
    applyOfflineProgress(offlineReport);
    
    // Show offline progress modal
    showOfflineProgressModal(offlineReport);
    
    return true;
  } catch (error) {
    console.error('Failed to load game:', error);
    return false;
  }
}

function applyOfflineProgress(report: OfflineReport) {
  batch(() => {
    codeProductionState$.linesOfCode.set(prev => 
      prev.plus(report.codeProduced)
    );
    resourceState$.money.set(prev => 
      prev.plus(report.moneyEarned)
    );
    // Apply other offline gains...
  });
}
```
**Validation:** Offline progress applies on game load
**Time:** 30 minutes

### WP 3.4: Save System Enhancement

#### Task 3.4.1: Implement Comprehensive Save State
Create `src/features/saving/services/saveStateBuilder.ts`:
```typescript
export function buildSaveState(): SaveData {
  return {
    version: '1.0.0',
    timestamp: Date.now(),
    gameState: {
      codeProduction: {
        linesOfCode: codeProductionState$.linesOfCode.get().toString(),
        totalLinesProduced: codeProductionState$.totalLinesProduced.get().toString(),
        workers: codeProductionState$.workers.get()
      },
      departments: Object.entries(departmentState$.departments.get()).reduce(
        (acc, [id, dept]) => ({
          ...acc,
          [id]: {
            unlocked: dept.unlocked,
            workers: dept.workers,
            managers: dept.managers,
            efficiency: dept.efficiency
          }
        }),
        {}
      ),
      resources: {
        money: resourceState$.money.get().toString(),
        customerLeads: resourceState$.customerLeads.get().toString(),
        // Other resources...
      },
      achievements: achievementState$.unlocked.get(),
      prestige: prestigeState$.get(),
      statistics: statisticsState$.get()
    }
  };
}
```
**Validation:** Save state captures all game data
**Time:** 30 minutes

#### Task 3.4.2: Add Save Validation and Migration
Create `src/features/saving/services/saveMigration.ts`:
```typescript
export function validateAndMigrateSave(saveData: any): SaveData | null {
  // Validate save structure
  if (!saveData.version || !saveData.timestamp || !saveData.gameState) {
    console.error('Invalid save structure');
    return null;
  }
  
  // Migrate old save versions
  let migrated = saveData;
  
  if (saveData.version === '0.9.0') {
    migrated = migrateFrom090(saveData);
  }
  
  if (saveData.version === '0.9.5') {
    migrated = migrateFrom095(migrated);
  }
  
  // Validate data ranges
  if (!validateDataRanges(migrated)) {
    console.error('Save data out of valid ranges');
    return null;
  }
  
  return migrated;
}

function validateDataRanges(data: SaveData): boolean {
  // Check for negative values
  const money = new Decimal(data.gameState.resources.money);
  if (money.lt(0)) return false;
  
  // Check for unrealistic values
  if (money.gt('1e308')) return false;
  
  // Validate other ranges...
  return true;
}
```
**Validation:** Save system handles corruption and migration
**Time:** 30 minutes

### WP 3.5: Cross-Feature Integration

#### Task 3.5.1: Create Event Bus for Feature Communication
Create `src/shared/events/eventBus.ts`:
```typescript
import { observable } from '@legendapp/state';

type GameEvent = 
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievement: string }
  | { type: 'DEPARTMENT_UNLOCKED'; department: string }
  | { type: 'MILESTONE_REACHED'; milestone: string }
  | { type: 'PRESTIGE_ACTIVATED' };

const eventBus$ = observable({
  events: [] as GameEvent[],
  listeners: new Map<string, Set<(event: GameEvent) => void>>()
});

export function emitEvent(event: GameEvent) {
  eventBus$.events.push(event);
  
  const listeners = eventBus$.listeners.get(event.type);
  if (listeners) {
    listeners.forEach(listener => listener(event));
  }
}

export function onEvent(
  type: string,
  callback: (event: GameEvent) => void
): () => void {
  if (!eventBus$.listeners.has(type)) {
    eventBus$.listeners.set(type, new Set());
  }
  
  eventBus$.listeners.get(type)!.add(callback);
  
  // Return cleanup function
  return () => {
    eventBus$.listeners.get(type)?.delete(callback);
  };
}
```
**Validation:** Events propagate between features
**Time:** 30 minutes

#### Task 3.5.2: Integrate Features via Events
Update features to use event system:
```typescript
// In department unlock
export function unlockDepartment(id: string) {
  // ... unlock logic
  
  emitEvent({
    type: 'DEPARTMENT_UNLOCKED',
    department: id
  });
}

// In achievements, listen for events
useEffect(() => {
  const cleanup = onEvent('DEPARTMENT_UNLOCKED', (event) => {
    checkAchievement('first_department');
    if (getAllDepartmentsUnlocked()) {
      checkAchievement('all_departments');
    }
  });
  
  return cleanup;
}, []);
```
**Validation:** Features communicate via events
**Time:** 30 minutes

## Testing Requirements

### Integration Tests
```typescript
describe('Department Synergies', () => {
  test('dev-sales synergy increases feature value', () => {
    // Set up departments
    departmentState$.departments.development.workers.set(10);
    departmentState$.departments.sales.workers.set(5);
    
    // Check synergy active
    const synergies = activeSynergies$.get();
    expect(synergies).toContainEqual(
      expect.objectContaining({ name: 'Dev-Sales Combo' })
    );
    
    // Verify multiplier applied
    expect(featureShippingState$.conversionMultiplier.get()).toBe(1.5);
  });
});

describe('Offline Progression', () => {
  test('calculates correct offline gains', () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const report = calculateOfflineProgress(oneHourAgo);
    
    expect(report.timeAway).toBe(3600);
    expect(report.codeProduced.gt(0)).toBe(true);
  });
});
```

## Phase Completion Checklist

### Synergies
- [ ] Department combinations provide bonuses
- [ ] Milestone multipliers work
- [ ] Synergy UI shows active bonuses
- [ ] Effects apply to game mechanics

### Automation
- [ ] Managers can be hired
- [ ] Automation runs when managers active
- [ ] Different automation per department
- [ ] Performance remains smooth

### Offline Progression
- [ ] Calculates accurate offline gains
- [ ] Shows offline report on return
- [ ] Respects 12-hour maximum
- [ ] Applies gains correctly

### Save System
- [ ] Saves all game state
- [ ] Loads without data loss
- [ ] Handles save migration
- [ ] Validates against corruption

### Integration
- [ ] Event system works
- [ ] Features communicate properly
- [ ] No circular dependencies
- [ ] State updates are batched

## Success Metrics
- Synergies provide meaningful choices
- Automation feels responsive
- Offline progression is balanced
- Save/load is instantaneous
- No memory leaks from event listeners

## Next Phase Dependencies
Phase 4 (Quality) can focus on:
- Comprehensive testing
- Performance optimization
- Polish and animations
- Bug fixes
- Balance adjustments

## Time Summary
**Total Estimated Time:** 5.5 hours
**Recommended Schedule:** Complete over 2 days with integration testing