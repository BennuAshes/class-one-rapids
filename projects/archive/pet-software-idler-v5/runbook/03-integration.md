# Phase 3: Integration

## Objective
Connect features and implement advanced systems including customer experience, department synergies, prestige mechanics, and achievements.

## Work Packages

### WP 3.1: Customer Experience Integration (US-005)

#### Task 3.1.1: Implement Customer Support Department
- **Create support agent hiring system:**
  ```typescript
  // Unlocks when customers exist (after first sales)
  const canHireSupport = gameState$.player.resources.activeCustomers.get() > 0;
  ```
- **Add support ticket resolution mechanics**
- **Implement customer retention calculations**
- **Create support department UI with hiring controls**
- **Validation:** Support agents can be hired when customers exist
- **Time Estimate:** 3-4 hours
- **Files:** `src/features/departmentManagement/components/SupportDept/`

#### Task 3.1.2: Create Customer Retention System
- **Implement retention multiplier calculations:**
  ```typescript
  const calculateRetentionMultiplier = () => {
    const supportAgents = gameState$.player.departments.support.employees.get();
    const customers = gameState$.player.resources.activeCustomers.get();
    const supportRatio = supportAgents / Math.max(customers, 1);
    
    // Base 1.1x, scales up to 3x with optimal support
    return Math.min(1.1 + (supportRatio * 1.9), 3.0);
  };
  ```
- **Add retention multiplier display in UI**
- **Implement revenue multiplication from retention**
- **Create customer satisfaction indicators**
- **Validation:** Revenue multiplier increases from 1.1x to 3x with support investment
- **Time Estimate:** 4-5 hours

#### Task 3.1.3: Customer Lifecycle Management
- **Implement customer acquisition from leads:**
  - Convert leads to active customers through features
  - Track customer lifetime value
  - Handle customer churn based on support levels
- **Add customer metrics dashboard**
- **Create customer satisfaction feedback system**
- **Validation:** Customer acquisition/retention affects revenue appropriately
- **Time Estimate:** 3-4 hours

### WP 3.2: Department Synergy System (US-006)

#### Task 3.2.1: Implement Milestone-Based Synergies
- **Create 25-employee milestone bonuses:**
  ```typescript
  const calculateDepartmentBonus = (department: Department) => {
    const employees = department.employees.get();
    if (employees >= 50) return 2.5; // Enhanced bonus
    if (employees >= 25) return 2.0; // Base synergy bonus
    return 1.0; // No bonus
  };
  ```
- **Add milestone celebration effects**
- **Implement efficiency multiplier calculations**
- **Create synergy bonus display UI**
- **Validation:** Departments receive 2x efficiency at 25 employees, 2.5x at 50
- **Time Estimate:** 3-4 hours
- **Files:** `src/shared/services/synergyCalculations.ts`

#### Task 3.2.2: Cross-Department Interaction System
- **Implement department interdependency bonuses:**
  ```typescript
  const calculateCrossDepartmentSynergy = () => {
    const deptLevels = getDepartmentLevels();
    const synergies = {
      devSalesBonus: Math.min(deptLevels.development, deptLevels.sales) * 0.1,
      designDevBonus: Math.min(deptLevels.design, deptLevels.development) * 0.15,
      // Additional cross-department bonuses
    };
    return synergies;
  };
  ```
- **Add synergy visualization (connection lines between departments)**
- **Implement optimal department balance suggestions**
- **Create synergy bonus breakdown display**
- **Validation:** Cross-department bonuses activate when thresholds met
- **Time Estimate:** 4-5 hours

#### Task 3.2.3: Advanced Efficiency Calculations
- **Create comprehensive efficiency system:**
  - Base department efficiency
  - Manager efficiency bonuses
  - Synergy multipliers
  - Equipment/upgrade bonuses
- **Implement efficiency calculation caching for performance**
- **Add efficiency breakdown tooltips**
- **Validation:** Efficiency calculations maintain <5ms computation time
- **Time Estimate:** 3-4 hours

### WP 3.3: Prestige System Implementation (US-007)

#### Task 3.3.1: Create Prestige Eligibility System
- **Implement $10M valuation milestone:**
  ```typescript
  const calculateCompanyValuation = () => {
    const assets = calculateTotalAssets();
    const revenue = calculateMonthlyRevenue();
    return assets + (revenue * 12 * 3); // 3x revenue multiplier
  };
  
  const canPrestige = calculateCompanyValuation() >= 10_000_000;
  ```
- **Add "Investor Round" UI button with explanation**
- **Create prestige confirmation dialog with benefits preview**
- **Implement valuation calculation display**
- **Validation:** Prestige option appears at $10M valuation with accurate calculations
- **Time Estimate:** 3-4 hours
- **Files:** `src/features/prestigeSystem/components/PrestigeButton/`

#### Task 3.3.2: Implement Prestige Calculation and Reset
- **Create investor point calculation:**
  ```typescript
  const calculateInvestorPoints = () => {
    const valuation = calculateCompanyValuation();
    const basePoints = Math.floor(valuation / 1_000_000); // 1 IP per $1M
    const bonusPoints = calculatePrestigeBonuses();
    return basePoints + bonusPoints;
  };
  ```
- **Implement complete game state reset (except meta-progression)**
- **Add prestige animation and celebration effects**
- **Create prestige history tracking**
- **Validation:** Prestige awards correct IP and resets game state properly
- **Time Estimate:** 4-5 hours

#### Task 3.3.3: Permanent Bonus System
- **Implement investor point bonuses:**
  ```typescript
  const calculatePrestigeBonuses = () => {
    const ip = gameState$.player.prestige.investorPoints.get();
    return {
      startingCapital: ip * 0.1, // +10% per IP
      globalSpeed: ip * 0.01,     // +1% per IP
      upgradeDiscount: Math.min(ip * 0.02, 0.5) // Up to 50% discount
    };
  };
  ```
- **Add bonus display in prestige UI**
- **Implement bonus application to new runs**
- **Create prestige upgrade tree (future expansion)**
- **Validation:** Bonuses apply correctly to new prestige runs
- **Time Estimate:** 3-4 hours

### WP 3.4: Achievement System (US-008)

#### Task 3.4.1: Create Achievement Framework
- **Implement achievement monitoring system:**
  ```typescript
  // src/features/achievements/services/achievementMonitor.ts
  const setupAchievementMonitoring = () => {
    // Monitor game state changes for achievement triggers
    observe(gameState$, () => {
      checkAchievements(gameState$.get());
    });
  };
  ```
- **Create achievement data structure and configuration**
- **Implement achievement unlock notifications**
- **Add achievement progress tracking**
- **Validation:** Achievements trigger correctly based on game actions
- **Time Estimate:** 4-5 hours
- **Files:** `src/features/achievements/`

#### Task 3.4.2: Implement Core Achievement Set
- **Create initial achievement set:**
  ```typescript
  const coreAchievements = {
    firstClick: { condition: () => linesOfCode >= 1, bonus: { startingBonus: 5 } },
    hundredLines: { condition: () => linesOfCode >= 100, bonus: { efficiency: 1.05 } },
    firstMillion: { condition: () => totalEarnings >= 1_000_000, bonus: { ipBonus: 1 } },
    // ... additional achievements
  };
  ```
- **Add achievement categories (progression, exploration, efficiency)**
- **Implement achievement bonus application**
- **Create achievement notification animations**
- **Validation:** 20+ achievements implemented with appropriate bonuses
- **Time Estimate:** 5-6 hours

#### Task 3.4.3: Achievement UI and Progress Tracking
- **Create achievement gallery UI:**
  - Completed achievements with unlock dates
  - Progress bars for incomplete achievements
  - Achievement bonus summaries
- **Implement achievement hints and tips**
- **Add achievement sharing functionality**
- **Validation:** Achievement UI displays progress and bonuses clearly
- **Time Estimate:** 3-4 hours

### WP 3.5: Advanced Feature Integration

#### Task 3.5.1: Implement Multi-Resource Conversions
- **Create complex production chains:**
  ```typescript
  const advancedFeatureProduction = () => {
    const canProduce = 
      linesOfCode >= 50 && 
      customerLeads >= 10 && 
      designAssets >= 5;
    
    if (canProduce) {
      // Produce premium feature with higher value
    }
  };
  ```
- **Add resource combination recipes**
- **Implement production efficiency optimizations**
- **Create optimal resource allocation suggestions**
- **Validation:** Multi-resource features provide higher value than simple conversions
- **Time Estimate:** 4-5 hours

#### Task 3.5.2: Create Department Specialization System
- **Implement department focus areas:**
  - Development: Code quality vs quantity
  - Sales: Lead generation vs conversion
  - Support: Ticket resolution vs retention
- **Add specialization choice UI**
- **Implement specialization bonus calculations**
- **Validation:** Specializations provide meaningful strategic choices
- **Time Estimate:** 3-4 hours

## Phase 3 Validation Checklist

### Customer Experience Validation
- [ ] Support department unlocks when customers exist
- [ ] Retention multiplier scales from 1.1x to 3x appropriately
- [ ] Customer lifecycle affects revenue as expected
- [ ] Customer satisfaction metrics display correctly

### Synergy System Validation
- [ ] Department bonuses activate at 25 and 50 employee milestones
- [ ] Cross-department synergies calculate correctly
- [ ] Efficiency calculations maintain <5ms performance
- [ ] Synergy UI displays accurate bonus breakdowns

### Prestige System Validation
- [ ] Prestige unlocks at $10M company valuation
- [ ] Investor points calculated correctly (1 IP per $1M)
- [ ] Game state resets properly while preserving meta-progression
- [ ] Permanent bonuses apply correctly to new runs

### Achievement System Validation
- [ ] Achievement monitoring triggers without performance impact
- [ ] 20+ achievements implemented across multiple categories
- [ ] Achievement bonuses apply correctly when unlocked
- [ ] Progress tracking displays accurate completion status

### Integration Validation
- [ ] All systems work together without conflicts
- [ ] Performance maintained with all systems active
- [ ] Save/load preserves all integration state
- [ ] No circular dependencies in calculation systems

## Estimated Timeline
- **Total Phase 3 Duration:** 6-8 days
- **Parallel Work Opportunities:**
  - WP 3.1 and WP 3.2 can be developed simultaneously
  - WP 3.4 can start early and run parallel to other work packages
  - WP 3.5 depends on completion of WP 3.1 and 3.2

## Dependencies for Next Phase
- **Phase 3 outputs required for Phase 4:**
  - Complete customer experience system
  - Working department synergies
  - Functional prestige system
  - Achievement framework with core achievement set
  - All integrations tested and validated

## Risk Mitigation
- **Calculation Complexity:** Implement comprehensive unit tests for all calculation systems
- **Performance Impact:** Profile all integration systems under load
- **State Management:** Ensure all new systems integrate properly with Legend State
- **Save Compatibility:** Maintain save data version compatibility through integration changes