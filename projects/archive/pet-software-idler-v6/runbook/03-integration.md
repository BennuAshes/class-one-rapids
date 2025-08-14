# Phase 3: Integration

## Objective
Connect features, implement department synergies, achievement system, and offline progression mechanics.

## Work Packages

### WP 3.1: Department Synergies

#### Task 3.1.1: Design Synergy Rules
- **Steps:**
  1. Define cross-department bonuses
  2. Create synergy calculation matrix
  3. Set milestone thresholds (25, 50, 100 units)
  4. Document multiplier stacking rules
- **Synergy examples:**
  ```typescript
  const synergies = {
    devSales: { // Dev + Sales combo
      threshold: 10,
      bonus: 1.5,
      affects: ['features', 'customerLeads']
    },
    qaDesign: { // QA + Design combo
      threshold: 15,
      bonus: 1.3,
      affects: ['quality', 'userSatisfaction']
    }
  };
  ```
- **Validation:** Bonuses calculate correctly
- **Time estimate:** 45 minutes

#### Task 3.1.2: Implement Synergy Calculator
- **Steps:**
  1. Create synergy detection system
  2. Calculate cumulative bonuses
  3. Apply to production rates
  4. Update in real-time
- **Implementation pattern:**
  ```typescript
  const calculateSynergies = () => {
    const synergies = [];
    
    // Check each department pair
    departments.forEach((dept1, dept2) => {
      if (meetsThreshold(dept1, dept2)) {
        synergies.push(calculateBonus(dept1, dept2));
      }
    });
    
    return combineSynergies(synergies);
  };
  ```
- **Test criteria:** Multiple synergies stack correctly
- **Time estimate:** 1 hour

#### Task 3.1.3: Create Synergy UI Indicators
- **Steps:**
  1. Show active synergies
  2. Display bonus percentages
  3. Add visual connections between departments
  4. Highlight when new synergy unlocks
- **Validation:** Players understand active bonuses
- **Time estimate:** 1 hour

### WP 3.2: Manager Automation

#### Task 3.2.1: Implement Manager System
- **Steps:**
  1. Create manager types per department
  2. Set automation rules
  3. Configure manager costs ($50k milestone)
  4. Add to department state
- **Manager model:**
  ```typescript
  interface Manager {
    departmentId: string;
    automationRate: number; // actions per second
    cost: number;
    efficiency: number;
  }
  ```
- **Time estimate:** 45 minutes

#### Task 3.2.2: Build Automation Engine
- **Steps:**
  1. Auto-click conversions
  2. Auto-hire when affordable
  3. Auto-upgrade departments
  4. Respect player preferences
- **Automation logic:**
  ```typescript
  const runAutomation = (delta: number) => {
    departments.forEach(dept => {
      if (dept.hasManager) {
        autoConvertResources(dept, delta);
        autoHireEmployees(dept, delta);
      }
    });
  };
  ```
- **Validation:** Automation continues when idle
- **Time estimate:** 1.5 hours

#### Task 3.2.3: Create Manager UI Controls
- **Steps:**
  1. Purchase manager button
  2. Automation toggle switches
  3. Automation rate display
  4. Manager efficiency indicators
- **Test criteria:** Players can control automation
- **Time estimate:** 45 minutes

### WP 3.3: Offline Progression

#### Task 3.3.1: Implement Offline Calculator
- **Steps:**
  1. Track last save timestamp
  2. Calculate time difference on load
  3. Simulate production for offline time
  4. Cap at 12 hours maximum
- **Calculation approach:**
  ```typescript
  const calculateOfflineProgress = (offlineSeconds: number) => {
    const cappedTime = Math.min(offlineSeconds, 12 * 3600);
    const progress = {
      linesOfCode: 0,
      money: 0,
      features: 0
    };
    
    // Simulate each department's production
    departments.forEach(dept => {
      if (dept.hasManager) {
        progress[dept.resource] += dept.rate * cappedTime;
      }
    });
    
    return progress;
  };
  ```
- **Validation:** Accurate within 0.1% of real-time
- **Time estimate:** 1.5 hours

#### Task 3.3.2: Create Offline Progress UI
- **Steps:**
  1. Show welcome back screen
  2. Display resources earned
  3. Animate resource addition
  4. Show time away duration
- **UI example:**
  ```typescript
  const OfflineProgressModal = ({ progress, timeAway }) => (
    <Modal>
      <h2>Welcome Back!</h2>
      <p>You were away for {formatTime(timeAway)}</p>
      <p>You earned:</p>
      <ul>
        <li>+{formatNumber(progress.money)} money</li>
        <li>+{formatNumber(progress.code)} lines</li>
      </ul>
    </Modal>
  );
  ```
- **Time estimate:** 1 hour

### WP 3.4: Achievement System

#### Task 3.4.1: Define Achievement Data
- **Steps:**
  1. Create 50 achievements
  2. Set unlock conditions
  3. Define rewards/bonuses
  4. Organize by category
- **Achievement structure:**
  ```typescript
  interface Achievement {
    id: string;
    name: string;
    description: string;
    condition: () => boolean;
    reward?: {
      type: 'multiplier' | 'resource' | 'unlock';
      value: number;
    };
    hidden?: boolean;
  }
  ```
- **Time estimate:** 1 hour

#### Task 3.4.2: Build Achievement Tracker
- **Steps:**
  1. Monitor game state for conditions
  2. Check achievements each game tick
  3. Trigger unlock when met
  4. Apply rewards immediately
- **Tracking pattern:**
  ```typescript
  const achievementTracker = () => {
    achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.condition()) {
        unlockAchievement(achievement);
        applyReward(achievement.reward);
      }
    });
  };
  ```
- **Validation:** Achievements unlock reliably
- **Time estimate:** 1 hour

#### Task 3.4.3: Create Achievement UI
- **Steps:**
  1. Achievement notification popup
  2. Achievement list screen
  3. Progress indicators
  4. Hidden achievement hints
- **Test criteria:** Clear feedback on unlock
- **Time estimate:** 1.5 hours

### WP 3.5: Prestige System

#### Task 3.5.1: Implement Prestige Logic
- **Steps:**
  1. Calculate prestige points ($1M = 1 IP)
  2. Create reset function
  3. Apply permanent bonuses
  4. Preserve meta-progression
- **Prestige calculation:**
  ```typescript
  const calculatePrestigePoints = () => {
    const valuation = calculateCompanyValue();
    return Math.floor(valuation / 1000000);
  };
  
  const prestige = () => {
    const points = calculatePrestigePoints();
    
    // Reset game state
    resetToDefaults();
    
    // Apply permanent bonuses
    gameState$.prestige.investorPoints.set(prev => prev + points);
    applyPrestigeBonuses();
  };
  ```
- **Validation:** Bonuses persist after reset
- **Time estimate:** 1.5 hours

#### Task 3.5.2: Create Prestige UI
- **Steps:**
  1. Prestige button at $10M
  2. Show potential rewards
  3. Confirmation dialog
  4. Prestige animation
- **Test criteria:** Clear value proposition
- **Time estimate:** 1 hour

### WP 3.6: Customer Retention System

#### Task 3.6.1: Implement Retention Mechanics
- **Steps:**
  1. Track customer satisfaction
  2. Calculate retention multipliers
  3. Apply to revenue calculations
  4. Create feedback loop
- **Retention formula:**
  ```typescript
  const retentionMultiplier = () => {
    const baseRetention = 1.0;
    const supportBonus = supportAgents * 0.01;
    const qualityBonus = qaTeam * 0.005;
    
    return Math.min(baseRetention + supportBonus + qualityBonus, 3.0);
  };
  ```
- **Time estimate:** 45 minutes

#### Task 3.6.2: Build Customer UI Elements
- **Steps:**
  1. Customer satisfaction meter
  2. Retention rate display
  3. Support ticket counter
  4. Revenue multiplier indicator
- **Validation:** Metrics update correctly
- **Time estimate:** 45 minutes

## Deliverables Checklist

- [ ] Department synergies calculating
- [ ] Manager automation working
- [ ] Offline progression accurate
- [ ] Achievement system tracking
- [ ] Prestige system functional
- [ ] Customer retention implemented
- [ ] All UI elements integrated
- [ ] Cross-feature interactions working
- [ ] Performance maintained at 60 FPS

## Integration Testing Points

### Critical Integrations
- Synergies affect production rates
- Managers automate while offline
- Achievements grant bonuses
- Prestige resets preserve progress
- All systems work together

### Performance Validation
- Complex calculations < 5ms
- UI updates smooth
- Memory usage stable
- Save size reasonable

## Next Phase Dependencies
Phase 4 requires:
- All systems integrated
- Stable game loop
- Complete feature set
- No critical bugs

## Time Summary
- **Total estimated time:** 10-12 hours
- **Critical path:** Offline → Prestige → Achievements
- **Parallelizable:** UI components, achievement definitions

## Common Integration Issues

### Issue: Circular Dependencies
- **Problem:** Systems reference each other
- **Solution:** Use event bus or mediator pattern

### Issue: State Synchronization
- **Problem:** Multiple systems updating same state
- **Solution:** Batch updates, single source of truth

### Issue: Performance Degradation
- **Problem:** Too many calculations per frame
- **Solution:** Throttle non-critical updates, use workers