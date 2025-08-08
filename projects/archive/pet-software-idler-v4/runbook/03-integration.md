# Phase 3: Integration

## Objective
Connect features and external services, implement department synergies, and ensure all game systems work together seamlessly.

## Work Packages

### WP 3.1: Department Synergies
#### Task 3.1.1: Implement cross-department resource flow
- **Integration points:**
  ```typescript
  // src/features/departments/hooks/useSynergies.ts
  const calculateSynergy = (dept1: Department, dept2: Department) => {
    const baseOutput = dept1.output + dept2.output;
    const synergyBonus = dept1.employees * dept2.employees * 0.02;
    return baseOutput * (1 + synergyBonus);
  };
  ```
- **Departments to connect:**
  - Development ↔ Sales (features + leads)
  - Marketing ↔ Sales (brand awareness boost)
  - HR ↔ All (employee efficiency)
  - Support ↔ Sales (customer retention)
- **Testing approach:**
  - Unit test each synergy calculation
  - Integration test combined effects
  - Visual verification of connections
- **Time estimate:** 3-4 hours

#### Task 3.1.2: Create visual synergy indicators
- **Implementation:**
  1. Add connection lines between departments
  2. Animate flow of resources
  3. Show synergy multiplier badges
  4. Color-code efficiency levels
- **Validation:**
  - Lines render without performance impact
  - Animations smooth at 60fps
  - Colors update with efficiency changes
- **Time estimate:** 2-3 hours

#### Task 3.1.3: Balance synergy multipliers
- **Balancing tasks:**
  1. Test early game progression
  2. Verify mid-game doesn't stagnate
  3. Ensure late game remains challenging
  4. Document multiplier formulas
- **Target metrics:**
  - First prestige: 30-45 minutes
  - Second prestige: 2-3 hours
  - IPO achievement: 2-4 weeks
- **Time estimate:** 2-3 hours

### WP 3.2: Prestige Integration
#### Task 3.2.1: Apply prestige bonuses to all systems
- **Integration code:**
  ```typescript
  // src/features/prestige/hooks/usePrestigeBonus.ts
  const applyPrestigeBonus = (baseValue: number): number => {
    const globalSpeed = prestigeState$.bonuses.globalSpeed.get();
    const categoryBonus = getCategoryBonus();
    return baseValue * globalSpeed * categoryBonus;
  };
  ```
- **Systems to modify:**
  - Automation rates
  - Department efficiency
  - Resource generation
  - Cost calculations
- **Validation:**
  - Bonuses stack multiplicatively
  - UI reflects boosted values
  - Persists across sessions
- **Time estimate:** 2-3 hours

#### Task 3.2.2: Implement advanced prestige tiers
- **Tier implementation:**
  - Series A: $10M+ (1.5x IP conversion)
  - Series B: $100M+ (2x IP conversion)
  - IPO: $1B+ (3x IP conversion)
  - Super units at 100, 1K, 10K IP
- **Testing approach:**
  - Verify tier thresholds
  - Test IP conversion rates
  - Validate super unit unlocks
- **Time estimate:** 2-3 hours

### WP 3.3: Offline Progression
#### Task 3.3.1: Calculate offline earnings
- **Implementation:**
  ```typescript
  // src/features/core-gameplay/utils/offlineProgress.ts
  const calculateOfflineProgress = (lastSave: number) => {
    const offlineMs = Math.min(Date.now() - lastSave, 12 * 3600000);
    const offlineSeconds = offlineMs / 1000;
    
    return {
      linesOfCode: automationRate * offlineSeconds,
      money: incomeRate * offlineSeconds * 0.5, // 50% efficiency
      leads: leadGenRate * offlineSeconds * 0.5
    };
  };
  ```
- **Validation:**
  - 12-hour cap enforced
  - 50% efficiency applied
  - Resources added correctly
- **Time estimate:** 1-2 hours

#### Task 3.3.2: Create offline progress report
- **UI components:**
  - Welcome back modal
  - Offline earnings summary
  - Time away display
  - Collect button with animation
- **Test criteria:**
  - Modal appears on return
  - Calculations accurate
  - Animation smooth
- **Time estimate:** 1-2 hours

### WP 3.4: Office Evolution Integration
#### Task 3.4.1: Implement office growth triggers
- **Growth stages:**
  ```typescript
  const officeStages = [
    { threshold: 0, name: 'Garage', scale: 1 },
    { threshold: 10000, name: 'Small Office', scale: 1.5 },
    { threshold: 1000000, name: 'Medium Office', scale: 2 },
    { threshold: 100000000, name: 'Campus', scale: 3 },
    { threshold: 1000000000, name: 'Tech Giant HQ', scale: 4 }
  ];
  ```
- **Implementation:**
  1. Monitor revenue thresholds
  2. Trigger transition animation
  3. Scale UI appropriately
  4. Update department layouts
- **Time estimate:** 2-3 hours

#### Task 3.4.2: Add transition animations
- **Animation sequence:**
  1. Celebration effect
  2. Camera zoom out
  3. Office transformation
  4. Department repositioning
- **Validation:**
  - Smooth transitions at 60fps
  - No UI glitches during transition
  - State remains consistent
- **Time estimate:** 2-3 hours

### WP 3.5: Achievement System
#### Task 3.5.1: Create achievement framework
- **Structure:**
  ```typescript
  interface Achievement {
    id: string;
    name: string;
    description: string;
    condition: () => boolean;
    reward?: { type: string; value: number };
  }
  ```
- **Categories:**
  - Progression milestones
  - Speed achievements
  - Efficiency targets
  - Secret achievements
- **Time estimate:** 1-2 hours

#### Task 3.5.2: Implement achievement notifications
- **Features:**
  - Toast notifications
  - Achievement sound
  - Particle celebration
  - Progress tracking
- **Validation:**
  - Notifications don't stack overflow
  - Achievements unlock once only
  - Progress saves correctly
- **Time estimate:** 1-2 hours

### WP 3.6: Performance Integration
#### Task 3.6.1: Optimize render cycles
- **Optimization tasks:**
  1. Implement React.memo for static components
  2. Use Legend State selectors efficiently
  3. Batch state updates
  4. Virtualize long lists
- **Performance targets:**
  - 60 FPS with 100+ employees
  - <16ms frame time
  - <50MB memory usage
- **Time estimate:** 2-3 hours

#### Task 3.6.2: Add performance monitoring
- **Monitoring implementation:**
  ```typescript
  // src/shared/utils/performanceMonitor.ts
  const monitor = {
    fps: calculateFPS(),
    memory: performance.memory?.usedJSHeapSize,
    frameTime: performance.now() - lastFrame
  };
  ```
- **Validation:**
  - FPS counter accurate
  - Memory tracking works
  - No performance impact from monitoring
- **Time estimate:** 1 hour

## Success Criteria
- [ ] All department synergies functional
- [ ] Prestige bonuses applied correctly
- [ ] Offline progression calculated accurately
- [ ] Office evolution triggers smoothly
- [ ] Achievement system operational
- [ ] Performance targets met

## Integration Testing Checklist
- [ ] Department synergies compound correctly
- [ ] Prestige doesn't break game balance
- [ ] Offline progress doesn't exploit
- [ ] Office transitions preserve state
- [ ] Achievements unlock appropriately
- [ ] No memory leaks after hours of play

## Known Integration Challenges
| Challenge | Solution |
|-----------|----------|
| Synergy calculation complexity | Cache computed values, update on change only |
| Offline progress exploitation | Hard cap at 12 hours, validate calculations |
| Office transition state loss | Lock interactions during transition |
| Achievement spam | Queue notifications, show max 3 at once |

## Estimated Total Time: 20-28 hours