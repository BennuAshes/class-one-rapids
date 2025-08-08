# Phase 2: Core Feature Implementation

## Objective
Implement primary business functionality including core gameplay loop, department systems, prestige mechanics, and feedback systems.

## Work Packages

### WP 2.1: Core Gameplay Loop
#### Task 2.1.1: Implement "Write Code" button
- **Code example:**
  ```typescript
  // src/features/core-gameplay/components/WriteCodeButton.tsx
  const WriteCodeButton = () => {
    const { resources, actions } = useGameState();
    const handleClick = () => {
      actions.addLinesOfCode(1);
      playSound('keyboard_click');
      showFloatingNumber('+1');
    };
    return <PressableButton onPress={handleClick} />;
  };
  ```
- **Test criteria:**
  - Button increments lines of code by 1
  - Visual feedback appears within 50ms
  - Sound plays on click
- **Dependencies:** Foundation phase completed
- **Time estimate:** 1-2 hours

#### Task 2.1.2: Create Junior Developer automation
- **Implementation steps:**
  1. Create JuniorDev component in `src/features/core-gameplay/components/JuniorDev.tsx`
  2. Implement timer-based code generation (0.1 lines/second)
  3. Add purchase logic with exponential cost scaling
  4. Create visual representation (desk + sprite)
- **Test criteria:**
  - Automated generation works continuously
  - Cost follows 2.5x exponential scaling
  - Visual updates reflect automation status
- **Time estimate:** 2-3 hours

#### Task 2.1.3: Implement feature shipping mechanic
- **Code structure:**
  ```typescript
  // src/features/core-gameplay/hooks/useFeatureShipping.ts
  const useFeatureShipping = () => {
    const shipFeature = (linesRequired: number) => {
      if (resources.linesOfCode >= linesRequired) {
        resources.linesOfCode -= linesRequired;
        resources.money += calculateRevenue(linesRequired);
      }
    };
    return { shipFeature };
  };
  ```
- **Test criteria:**
  - Converts 10 lines → $15 revenue
  - Transaction is atomic (all or nothing)
  - UI updates immediately
- **Time estimate:** 1-2 hours

### WP 2.2: Department System Architecture
#### Task 2.2.1: Create department framework
- **Implementation:**
  1. Define Department interface in `src/features/departments/types.ts`
  2. Create DepartmentManager class
  3. Implement department unlock conditions
  4. Create department UI containers
- **File structure:**
  ```
  src/features/departments/
  ├── components/
  │   ├── DepartmentView.tsx
  │   └── DepartmentList.tsx
  ├── hooks/
  │   └── useDepartment.ts
  ├── state/
  │   └── departmentStore.ts
  └── types.ts
  ```
- **Test criteria:**
  - Departments unlock at correct thresholds
  - Each department has unique mechanics
  - Department state persists
- **Time estimate:** 3-4 hours

#### Task 2.2.2: Implement Development department
- **Features:**
  - Junior/Senior/Lead developer tiers
  - Laptop/Desktop/Server upgrades
  - Code quality multipliers
- **Test criteria:**
  - Each tier produces correct output
  - Upgrades apply multiplicative bonuses
  - Visual hierarchy clear
- **Time estimate:** 2-3 hours

#### Task 2.2.3: Implement Sales department
- **Features:**
  - Sales Rep hiring
  - Lead generation (0.2/second per rep)
  - Lead + Feature conversion bonuses
- **Test criteria:**
  - Lead generation rate accurate
  - Synergy bonuses calculate correctly
  - Department interaction visible
- **Time estimate:** 2-3 hours

### WP 2.3: Prestige System
#### Task 2.3.1: Create prestige state management
- **Implementation:**
  ```typescript
  // src/features/prestige/state/prestigeStore.ts
  const prestigeState$ = observable({
    investorPoints: 0,
    currentRound: 0,
    bonuses: {
      globalSpeed: computed(() => 1 + IP * 0.01),
      startingCapital: computed(() => IP * 0.1)
    }
  });
  ```
- **Test criteria:**
  - IP calculation accurate ($1M = 1 IP)
  - Bonuses apply correctly
  - State persists across resets
- **Time estimate:** 2-3 hours

#### Task 2.3.2: Implement reset mechanics
- **Steps:**
  1. Create confirmation dialog
  2. Implement state reset logic
  3. Apply permanent bonuses
  4. Create prestige animation
- **Test criteria:**
  - Confirmation prevents accidental resets
  - Only transient state resets
  - Permanent bonuses remain
- **Time estimate:** 2-3 hours

#### Task 2.3.3: Add prestige UI elements
- **Components:**
  - Prestige button (appears at $10M)
  - IP display
  - Bonus summary panel
  - Prestige history
- **Test criteria:**
  - UI updates reflect prestige state
  - History tracks all resets
  - Bonuses clearly displayed
- **Time estimate:** 1-2 hours

### WP 2.4: Visual Feedback Systems
#### Task 2.4.1: Implement floating numbers
- **Implementation:**
  ```typescript
  // src/features/audio-visual/components/FloatingNumber.tsx
  const FloatingNumber = ({ value, position, color }) => {
    // Animate upward float and fade
    const translateY = useAnimatedValue(-50);
    const opacity = useAnimatedValue(0);
  };
  ```
- **Test criteria:**
  - Numbers appear at click position
  - Animation smooth at 60fps
  - Color scales with value
- **Time estimate:** 1-2 hours

#### Task 2.4.2: Create particle effects
- **Features:**
  - Click particles
  - Achievement explosions
  - Money rain effects
- **Test criteria:**
  - Particles don't impact performance
  - Effects scale with significance
  - Clean up after animation
- **Time estimate:** 2-3 hours

#### Task 2.4.3: Add screen shake effects
- **Implementation:**
  - Milestone achievements trigger shake
  - Intensity scales with importance
  - Smooth animation without jarring
- **Test criteria:**
  - Shake feels impactful but not disruptive
  - No motion sickness issues
  - Can be disabled in settings
- **Time estimate:** 1 hour

### WP 2.5: Audio System
#### Task 2.5.1: Implement sound manager
- **Code structure:**
  ```typescript
  // src/features/audio-visual/utils/soundManager.ts
  class SoundManager {
    private sounds: Map<string, Audio>;
    private lastPlayTime: Map<string, number>;
    
    playSound(soundId: string) {
      // Implement frequency limiting
      // Dynamic volume adjustment
    }
  }
  ```
- **Test criteria:**
  - Sounds don't repeat within 0.5s
  - Volume scales with frequency
  - Can mute/unmute globally
- **Time estimate:** 2-3 hours

#### Task 2.5.2: Add game sounds
- **Sound assets needed:**
  - keyboard_click.mp3 (coding)
  - cash_register.mp3 (sales)
  - achievement.mp3 (milestones)
  - upgrade.mp3 (purchases)
- **Test criteria:**
  - Each action has distinct sound
  - Sounds load without delay
  - Mobile compatibility verified
- **Time estimate:** 1-2 hours

### WP 2.6: Save System
#### Task 2.6.1: Implement auto-save
- **Implementation:**
  ```typescript
  // src/features/core-gameplay/hooks/useAutoSave.ts
  useEffect(() => {
    const interval = setInterval(() => {
      persistState(gameState$);
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);
  ```
- **Test criteria:**
  - Saves every 30 seconds
  - Manual save on significant actions
  - No performance impact
- **Time estimate:** 1 hour

#### Task 2.6.2: Add save validation
- **Features:**
  - Checksum validation
  - Corruption detection
  - Backup save slots
- **Test criteria:**
  - Detects corrupted saves
  - Recovers from corruption
  - Multiple backup slots work
- **Time estimate:** 1-2 hours

## Success Criteria
- [ ] Core gameplay loop fully functional
- [ ] All 7 departments implemented
- [ ] Prestige system working with bonuses
- [ ] Visual feedback smooth at 60fps
- [ ] Audio system with all sounds
- [ ] Save system reliable and validated

## Performance Benchmarks
- Click response: <50ms
- Automation calculations: <16ms per frame
- State updates: <5ms
- Save operation: <100ms

## Integration Points
- Department synergies require Phase 3
- Advanced prestige tiers in Phase 3
- Performance optimization in Phase 4

## Estimated Total Time: 25-35 hours