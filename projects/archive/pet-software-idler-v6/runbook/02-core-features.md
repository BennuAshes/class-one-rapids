# Phase 2: Core Feature Implementation

## Objective
Implement primary game mechanics: code production, resource conversion, department basics, and employee hiring.

## Work Packages

### WP 2.1: Write Code Button

#### Task 2.1.1: Create WriteCodeButton Component
- **Steps:**
  1. Create component file structure
  2. Implement click handler
  3. Connect to Legend State
  4. Add visual feedback
- **Code structure:**
  ```typescript
  // src/features/codeProduction/components/WriteCodeButton.tsx
  const WriteCodeButton = () => {
    const handleClick = () => {
      gameState$.resources.linesOfCode.set(prev => prev + 1);
      // Trigger visual/audio feedback
    };
    return <button onClick={handleClick}>WRITE CODE</button>;
  };
  ```
- **Test criteria:** Each click increases lines of code by 1
- **Dependencies:** State management from Phase 1
- **Time estimate:** 45 minutes

#### Task 2.1.2: Add Click Feedback System
- **Steps:**
  1. Create floating number animation
  2. Add button press animation
  3. Implement haptic feedback (mobile)
  4. Add click sound effect
- **Animation example:**
  ```css
  @keyframes float-up {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-50px); opacity: 0; }
  }
  ```
- **Validation:** Feedback occurs within 50ms
- **Time estimate:** 1 hour

#### Task 2.1.3: Implement Click Rate Limiting
- **Steps:**
  1. Add debouncing for rapid clicks
  2. Prevent double-click issues
  3. Track clicks per second
  4. Add anti-cheat basic protection
- **Validation:** Handles 20+ clicks/second smoothly
- **Time estimate:** 30 minutes

### WP 2.2: Resource Conversion System

#### Task 2.2.1: Create Feature Conversion Logic
- **Steps:**
  1. Define conversion rates (10 code = 1 feature)
  2. Create conversion function
  3. Update state atomically
  4. Add conversion button component
- **Logic implementation:**
  ```typescript
  const convertToFeature = () => {
    batch(() => {
      const cost = 10;
      if (gameState$.resources.linesOfCode.get() >= cost) {
        gameState$.resources.linesOfCode.set(prev => prev - cost);
        gameState$.resources.features.set(prev => prev + 1);
      }
    });
  };
  ```
- **Test criteria:** Correct resource deduction and addition
- **Time estimate:** 45 minutes

#### Task 2.2.2: Implement Feature-to-Money Conversion
- **Steps:**
  1. Create ship feature function
  2. Calculate money earned (base: $15/feature)
  3. Add transaction animation
  4. Update UI to show money
- **Validation:** Money counter appears after first conversion
- **Time estimate:** 45 minutes

#### Task 2.2.3: Create Conversion UI Components
- **Steps:**
  1. Build ConversionPanel component
  2. Show available conversions
  3. Disable when insufficient resources
  4. Add progress bars for visual clarity
- **Component structure:**
  ```typescript
  const ConversionPanel = () => {
    const canConvert = use$(() => 
      gameState$.resources.linesOfCode.get() >= 10
    );
    return (
      <button disabled={!canConvert}>
        Ship Feature (10 code → $15)
      </button>
    );
  };
  ```
- **Time estimate:** 1 hour

### WP 2.3: Employee System Foundation

#### Task 2.3.1: Create Employee Data Structure
- **Steps:**
  1. Define employee types (Junior Dev, Senior Dev, etc.)
  2. Create employee cost calculations
  3. Set production rates per employee type
  4. Implement employee state management
- **Data model:**
  ```typescript
  interface EmployeeType {
    id: string;
    name: string;
    baseCost: number;
    baseProduction: number;
    costMultiplier: 1.15;
  }
  ```
- **Time estimate:** 30 minutes

#### Task 2.3.2: Implement Hiring Mechanics
- **Steps:**
  1. Create hire employee function
  2. Calculate dynamic costs (base * 1.15^owned)
  3. Update production rates
  4. Add employee to department
- **Hiring logic:**
  ```typescript
  const hireEmployee = (type: EmployeeType, department: string) => {
    const cost = calculateCost(type, getEmployeeCount(type));
    if (gameState$.resources.money.get() >= cost) {
      // Deduct money and add employee
    }
  };
  ```
- **Validation:** Cost increases correctly with each purchase
- **Time estimate:** 1 hour

#### Task 2.3.3: Build Hiring UI
- **Steps:**
  1. Create EmployeeCard component
  2. Display cost, production rate, owned count
  3. Enable/disable based on affordability
  4. Add purchase confirmation animation
- **Test criteria:** UI updates immediately on purchase
- **Time estimate:** 45 minutes

### WP 2.4: Automatic Production System

#### Task 2.4.1: Implement Game Loop
- **Steps:**
  1. Create RequestAnimationFrame loop
  2. Calculate delta time between frames
  3. Update resources based on production rates
  4. Batch state updates for performance
- **Game loop pattern:**
  ```typescript
  let lastTime = Date.now();
  const gameLoop = () => {
    const now = Date.now();
    const delta = (now - lastTime) / 1000;
    
    batch(() => {
      updateProduction(delta);
      updateVisuals(delta);
    });
    
    lastTime = now;
    requestAnimationFrame(gameLoop);
  };
  ```
- **Validation:** Consistent 60 FPS
- **Time estimate:** 1 hour

#### Task 2.4.2: Calculate Production Rates
- **Steps:**
  1. Sum employee contributions
  2. Apply department multipliers
  3. Include efficiency bonuses
  4. Update resources per tick
- **Calculation example:**
  ```typescript
  const calculateCodeProduction = () => {
    let rate = 0;
    rate += juniorDevs * 0.1;
    rate += seniorDevs * 0.5;
    rate *= departmentEfficiency;
    return rate;
  };
  ```
- **Test criteria:** Production matches expected rates
- **Time estimate:** 45 minutes

#### Task 2.4.3: Create Production Display
- **Steps:**
  1. Show production rates per second
  2. Display department contributions
  3. Add visual indicators for active production
  4. Include production multipliers
- **Validation:** Rates update in real-time
- **Time estimate:** 30 minutes

### WP 2.5: Department Basics

#### Task 2.5.1: Create Department Structure
- **Steps:**
  1. Define 7 departments (Dev, Sales, CX, Product, Design, QA, Marketing)
  2. Set unlock conditions
  3. Create department state
  4. Implement department components
- **Department model:**
  ```typescript
  interface Department {
    id: string;
    name: string;
    unlocked: boolean;
    unlockCost: number;
    employees: Map<string, number>;
    productionType: ResourceType;
  }
  ```
- **Time estimate:** 1 hour

#### Task 2.5.2: Implement Department Unlocking
- **Steps:**
  1. Create unlock triggers ($500 for Sales, etc.)
  2. Show locked departments grayed out
  3. Add unlock animation
  4. Update UI on unlock
- **Unlock logic:**
  ```typescript
  const checkDepartmentUnlocks = () => {
    if (totalEarned >= 500 && !departments.sales.unlocked) {
      unlockDepartment('sales');
    }
  };
  ```
- **Validation:** Departments unlock at correct thresholds
- **Time estimate:** 45 minutes

#### Task 2.5.3: Build Department Panel UI
- **Steps:**
  1. Create tabbed interface for departments
  2. Show department-specific employees
  3. Display production info
  4. Add visual distinction per department
- **Test criteria:** All departments accessible when unlocked
- **Time estimate:** 1.5 hours

### WP 2.6: Save System Foundation

#### Task 2.6.1: Implement Auto-Save
- **Steps:**
  1. Create save function with Legend State
  2. Set 30-second interval
  3. Add save indicator
  4. Handle save errors gracefully
- **Save implementation:**
  ```typescript
  const saveGame = () => {
    const saveData = gameState$.get();
    localStorage.setItem('petsoft_save', JSON.stringify(saveData));
    showSaveIndicator();
  };
  
  setInterval(saveGame, 30000);
  ```
- **Validation:** Game saves and loads correctly
- **Time estimate:** 45 minutes

#### Task 2.6.2: Create Load System
- **Steps:**
  1. Load save on game start
  2. Validate save data integrity
  3. Handle corrupted saves
  4. Merge with default state
- **Test criteria:** Game resumes from last save
- **Time estimate:** 45 minutes

## Deliverables Checklist

- [ ] Write Code button working with feedback
- [ ] Resource conversion system functional
- [ ] Employee hiring implemented
- [ ] Automatic production calculating correctly
- [ ] All 7 departments defined
- [ ] Department unlocking working
- [ ] Basic save/load system operational
- [ ] UI components for all features
- [ ] Production rates displaying
- [ ] Game loop running at 60 FPS

## Integration Points

### State Management Integration
- All features connected to Legend State
- Computed observables for derived values
- Batch updates in game loop

### UI/UX Integration  
- Consistent visual language
- Responsive to all interactions
- Feedback within 50ms

### Performance Targets
- 60 FPS maintained
- <5ms state updates
- <50MB memory usage

## Next Phase Dependencies
Phase 3 requires:
- Working production system
- Multiple departments operational
- Save system foundation
- Stable game loop

## Time Summary
- **Total estimated time:** 12-14 hours
- **Critical path:** Game loop → Production → Departments
- **Parallelizable:** UI components, save system

## Testing Checklist

### Unit Tests Required
- [ ] Resource calculations
- [ ] Cost formulas  
- [ ] Production rates
- [ ] State updates

### Integration Tests Required
- [ ] Click → Resource flow
- [ ] Hire → Production flow
- [ ] Save → Load cycle
- [ ] Department unlocks

### Performance Tests Required
- [ ] 1000 rapid clicks
- [ ] 100+ employees
- [ ] Extended play session
- [ ] Memory leak detection