# Phase 2: Core Feature Implementation

## Objective
Implement primary game mechanics including code production, feature conversion, department automation, and sales operations to establish the core gameplay loop.

## Work Packages

### WP 2.1: Basic Code Production System (US-001)

#### Task 2.1.1: Implement WriteCode Button Component
**Priority:** Critical - Core mechanic foundation
- **Create WriteCodeButton component:**
  ```typescript
  // src/features/codeProduction/components/WriteCodeButton.tsx
  const WriteCodeButton = () => {
    const { linesOfCode, writeCode } = useCodeProduction();
    
    return (
      <Pressable onPress={writeCode} style={styles.button}>
        <Text>WRITE CODE</Text>
      </Pressable>
    );
  };
  ```
- **Implement useCodeProduction custom hook**
- **Add immediate visual feedback (<50ms response)**
- **Include audio feedback with Web Audio API**
- **Validation:** Button click increases lines of code with visual/audio feedback
- **Time Estimate:** 3-4 hours
- **Files:** `src/features/codeProduction/components/WriteCodeButton/`

#### Task 2.1.2: Create Code Production Logic
- **Implement click-to-produce mechanics:**
  ```typescript
  // src/features/codeProduction/hooks/useCodeProduction.ts
  const useCodeProduction = () => {
    const linesOfCode = use$(gameState$.player.resources.linesOfCode);
    
    const writeCode = useCallback(() => {
      batch(() => {
        gameState$.player.resources.linesOfCode.set(c => c + 1);
        triggerFeedback('writeCode');
      });
    }, []);
    
    return { linesOfCode, writeCode };
  };
  ```
- **Add particle effect system for visual feedback**
- **Implement sound effect triggering**
- **Setup performance monitoring for rapid clicking**
- **Validation:** Maintains 60 FPS during 1000 rapid clicks
- **Time Estimate:** 4-5 hours
- **Files:** `src/features/codeProduction/hooks/`, `src/shared/effects/`

#### Task 2.1.3: Implement Junior Developer Hiring
- **Create hire button that appears after 5 clicks:**
  ```typescript
  const canHireJuniorDev = linesOfCode >= 5 && money >= 10;
  ```
- **Implement automatic code production (0.1 lines/second)**
- **Add department employee display**
- **Setup automated production loop integration**
- **Validation:** Junior dev produces code automatically after hiring
- **Time Estimate:** 3-4 hours
- **Files:** `src/features/departmentManagement/components/DevelopmentDept/`

### WP 2.2: Feature Conversion System (US-002)

#### Task 2.2.1: Create Feature Conversion Component
- **Implement "Ship Feature" button:**
  ```typescript
  const canShipFeature = linesOfCode >= 10;
  const shipFeature = () => {
    batch(() => {
      gameState$.player.resources.linesOfCode.set(c => c - 10);
      gameState$.player.resources.features.set(f => f + 1);
      gameState$.player.resources.money.set(m => m + 15);
    });
  };
  ```
- **Add conversion animation and cash register sound**
- **Display money counter when first earned**
- **Implement upgrade options visibility logic**
- **Validation:** 10 lines convert to 1 feature + $15 with proper feedback
- **Time Estimate:** 3-4 hours
- **Files:** `src/features/codeProduction/components/FeatureConversion/`

#### Task 2.2.2: Implement Resource Display System
- **Create ResourceDisplay widget:**
  ```typescript
  // src/widgets/ResourceDisplay/ResourceDisplay.tsx
  const ResourceDisplay = () => {
    const { linesOfCode, features, money } = useGameResources();
    
    return (
      <View style={styles.container}>
        <Text>Lines of Code: {formatNumber(linesOfCode)}</Text>
        <Text>Features: {formatNumber(features)}</Text>
        {money > 0 && <Text>Money: ${formatNumber(money)}</Text>}
      </View>
    );
  };
  ```
- **Add number formatting utilities (Big.js integration)**
- **Implement counting animations for number changes**
- **Add conditional visibility for resources**
- **Validation:** Resources display with proper formatting and animations
- **Time Estimate:** 2-3 hours
- **Files:** `src/widgets/ResourceDisplay/`, `src/shared/lib/numberUtils.ts`

#### Task 2.2.3: Create Bulk Conversion System
- **Implement "Ship All Features" functionality:**
  - Convert maximum possible lines to features
  - Batch operations for performance
  - Visual feedback for bulk operations
- **Add conversion rate calculations**
- **Implement conversion history tracking**
- **Validation:** Bulk conversion processes efficiently without frame drops
- **Time Estimate:** 2-3 hours

### WP 2.3: Department Automation System (US-003)

#### Task 2.3.1: Implement Manager Hiring System
- **Create manager unlock at $50,000 milestone:**
  ```typescript
  const canHireManagers = totalEarningsAllTime >= 50000;
  ```
- **Implement manager purchase UI for each department**
- **Add manager efficiency calculations**
- **Setup automation toggle functionality**
- **Validation:** Managers unlock at milestone and enable automation
- **Time Estimate:** 4-5 hours
- **Files:** `src/features/departmentManagement/components/ManagerHiring/`

#### Task 2.3.2: Create Offline Progression Calculator
- **Implement offline time calculation:**
  ```typescript
  // src/shared/services/offlineProgression.ts
  const calculateOfflineProgress = (lastSaveTime: number) => {
    const offlineTime = Math.min(Date.now() - lastSaveTime, 12 * 60 * 60 * 1000); // 12h cap
    const offlineProduction = calculateProductionRate() * (offlineTime / 1000);
    return { offlineTime, offlineProduction };
  };
  ```
- **Add offline progress popup when returning**
- **Implement 12-hour offline progression cap**
- **Setup accurate time-based calculations**
- **Validation:** Offline progression accurate within 0.1% of real-time
- **Time Estimate:** 5-6 hours
- **Files:** `src/shared/services/offlineProgression.ts`, `src/components/OfflineProgressModal/`

#### Task 2.3.3: Implement Department Production Automation
- **Create automated production loops:**
  - Development department: Lines of code generation
  - Automated feature conversion when managers present
  - Production rate calculations based on employees and efficiency
- **Add production rate display UI**
- **Implement automation status indicators**
- **Validation:** Departments produce resources automatically with managers
- **Time Estimate:** 4-5 hours

### WP 2.4: Sales Department Operations (US-004)

#### Task 2.4.1: Create Sales Department Unlock System
- **Implement sales unlock at $500 total earned:**
  ```typescript
  const canUnlockSales = totalEarningsAllTime >= 500;
  ```
- **Add office expansion animation/visual**
- **Create sales department UI section**
- **Implement sales rep hiring mechanics**
- **Validation:** Sales department unlocks with visual expansion at milestone
- **Time Estimate:** 3-4 hours
- **Files:** `src/features/departmentManagement/components/SalesDept/`

#### Task 2.4.2: Implement Customer Lead Generation
- **Create lead generation mechanics:**
  ```typescript
  const salesProduction = () => {
    const salesReps = gameState$.player.departments.sales.employees.get();
    const leadsPerSecond = salesReps * 0.2;
    gameState$.player.resources.customerLeads.set(l => l + leadsPerSecond);
  };
  ```
- **Add customer leads resource to display**
- **Implement sales rep efficiency calculations**
- **Setup automated lead generation loop**
- **Validation:** Sales reps generate 0.2 leads/second per employee
- **Time Estimate:** 3-4 hours

#### Task 2.4.3: Create Lead-Feature Revenue Combination
- **Implement enhanced revenue from lead-feature combinations:**
  ```typescript
  const sellFeatureWithLeads = () => {
    if (features > 0 && customerLeads > 0) {
      const revenue = baseFeaturePrice * leadMultiplier;
      // Process enhanced sale
    }
  };
  ```
- **Add combination revenue calculations**
- **Display revenue comparison (with vs without leads)**
- **Implement optimal selling strategies UI hints**
- **Validation:** Lead-feature combinations generate higher revenue than features alone
- **Time Estimate:** 3-4 hours

### WP 2.5: Save/Load System Implementation (US-010)

#### Task 2.5.1: Implement Auto-Save System
- **Create auto-save every 30 seconds:**
  ```typescript
  // src/shared/services/autoSave.ts
  const setupAutoSave = () => {
    setInterval(() => {
      const saveData = serializeGameState(gameState$.get());
      localStorage.setItem('petsoft-tycoon-save', saveData);
      gameState$.gameMetadata.lastSaveTime.set(Date.now());
    }, 30000);
  };
  ```
- **Add save data compression with LZ-String**
- **Implement save data versioning**
- **Add save status indicator in UI**
- **Validation:** Game saves automatically every 30 seconds with compression
- **Time Estimate:** 3-4 hours
- **Files:** `src/shared/services/autoSave.ts`, `src/shared/services/persistence.ts`

#### Task 2.5.2: Create Save Data Integrity System
- **Implement save data validation:**
  - Cryptographic hashing for tampering detection
  - Schema validation for save data structure
  - Corruption recovery with backup saves
- **Add import/export functionality for save files**
- **Create multiple save slot system**
- **Validation:** Save data integrity maintained, corruption detected and recovered
- **Time Estimate:** 4-5 hours

#### Task 2.5.3: Implement Game Loading System
- **Create game state restoration on app load:**
  ```typescript
  const loadGame = () => {
    const saveData = localStorage.getItem('petsoft-tycoon-save');
    if (saveData) {
      const gameData = deserializeGameState(saveData);
      gameState$.set(gameData);
      calculateOfflineProgress(gameData.gameMetadata.lastSaveTime);
    }
  };
  ```
- **Add loading screen with progress indicators**
- **Implement graceful handling of corrupted saves**
- **Setup new game initialization**
- **Validation:** Game loads in <100ms, handles corrupted saves gracefully
- **Time Estimate:** 2-3 hours

## Phase 2 Validation Checklist

### Core Mechanics Validation
- [ ] WriteCode button responds within 50ms with feedback
- [ ] Game maintains 60 FPS during rapid clicking (1000+ clicks)
- [ ] Feature conversion works correctly (10 lines → 1 feature + $15)
- [ ] Junior dev hiring unlocks at 5 clicks and produces automatically
- [ ] Sales department unlocks at $500 with proper UI expansion

### Automation Validation
- [ ] Managers unlock at $50,000 milestone
- [ ] Offline progression calculates accurately for up to 12 hours
- [ ] Automated departments continue producing when away
- [ ] Sales reps generate 0.2 customer leads per second

### Data Persistence Validation
- [ ] Auto-save occurs every 30 seconds without performance impact
- [ ] Save/load operations complete in <100ms
- [ ] Offline progression modal displays accurate calculations
- [ ] Save data corruption is detected and handled gracefully

### Performance Validation
- [ ] All interactions maintain <50ms response time
- [ ] Memory usage remains stable during extended play
- [ ] No frame rate drops during automated production
- [ ] Bulk operations process efficiently

## Estimated Timeline
- **Total Phase 2 Duration:** 8-10 days
- **Parallel Work Opportunities:** 
  - WP 2.1 and WP 2.2 can be developed simultaneously
  - WP 2.4 can start once WP 2.1 is complete
  - WP 2.5 can be developed parallel to other work packages

## Dependencies for Next Phase
- **Phase 2 outputs required for Phase 3:**
  - Functional core game mechanics (code → features → money)
  - Working department automation system
  - Sales department with lead generation
  - Reliable save/load system with offline progression
  - Performance monitoring confirming 60 FPS gameplay

## Critical Success Factors
- **Performance:** All mechanics must maintain 60 FPS target
- **Feedback:** Sub-50ms response time for all user interactions
- **Automation:** Offline progression must be mathematically accurate
- **Persistence:** Zero data loss tolerance for save/load operations