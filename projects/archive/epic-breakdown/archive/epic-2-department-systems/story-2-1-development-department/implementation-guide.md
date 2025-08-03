# Story 2.1: Development Department Core - Implementation Guide

## Development Workflow

### Step 1: Department Framework Extension
1. Extend automation system to support department structure
2. Create department unit types with unique properties
3. Implement department bonus calculations
4. Add department efficiency tracking
5. Create department state management

### Step 2: Development Units Implementation
1. Define all four development unit types with costs and production
2. Implement unit purchase and management
3. Add visual representation for each unit type
4. Create unit count displays and statistics
5. Implement unit production visualization

### Step 3: Department Upgrades System
1. Create upgrade framework for department improvements
2. Implement Better IDEs upgrades with stacking multipliers
3. Add upgrade purchase validation and effects
4. Create upgrade progress display
5. Add upgrade impact visualization

### Step 4: Production Calculation Engine
1. Implement base production calculation per unit
2. Add department bonus calculations (Tech Lead 10% boost)
3. Create upgrade multiplier application
4. Implement total department production aggregation
5. Add production breakdown and analytics

### Step 5: Visual Department Panel
1. Create department overview interface
2. Add unit purchase interfaces with costs
3. Implement production rate displays
4. Create upgrade purchase interface
5. Add department efficiency visualization

## Code Organization

### Department Module Structure
```
src/features/departments/
├── core/
│   ├── departmentManager.ts       # Central department coordination
│   ├── departmentState.ts         # Department state management
│   └── productionCalculator.ts    # Production mathematics
├── development/
│   ├── developmentDepartment.ts   # Development-specific logic
│   ├── developmentUnits.ts        # Unit definitions and behavior
│   ├── developmentUpgrades.ts     # Upgrade system
│   └── developmentUI.ts           # Visual interface
├── shared/
│   ├── departmentBase.ts          # Base department class
│   ├── unitBase.ts                # Base unit class
│   └── upgradeBase.ts             # Base upgrade class
└── index.ts                       # Feature exports
```

## Testing Strategy

### Unit Testing Focus
1. Test unit cost scaling and purchase validation
2. Validate production calculation accuracy
3. Test department bonus application
4. Verify upgrade effects and stacking
5. Test department state persistence

### Integration Testing
1. Test department integration with resource system
2. Verify UI updates with department changes
3. Test department unlock progression
4. Validate cross-department interactions
5. Test save/load with department state

### Balance Testing
1. Validate unit cost progression feels appropriate
2. Test production scaling across unit types
3. Verify upgrade value provides meaningful improvement
4. Test department efficiency optimization
5. Validate progression pacing

## Quality Assurance

### Production Accuracy
1. Verify each unit produces exactly specified rate
2. Test department bonus calculations (10% from Tech Lead)
3. Validate upgrade multipliers apply correctly
4. Ensure production aggregation is mathematically correct
5. Test production with multiple units and upgrades

### User Experience
1. Department panel clearly shows all relevant information
2. Unit purchases feel meaningful and progressive
3. Upgrades provide noticeable improvement
4. Visual feedback makes production rates clear
5. Department progression feels rewarding

## Integration Points

### With Automation System (Epic 1)
- Extends automation framework with department structure
- Department units use same purchase and production patterns
- Production calculations integrate with resource generation
- Visual feedback extends automation visualization

### With Resource System (Epic 1)
- Department production generates resources
- Department purchases consume resources
- Resource formatting used in department displays
- Resource validation prevents invalid purchases

### With Future Departments (Epic 2)
- Development department serves as template for others
- Department framework supports all seven departments
- Production patterns reused across departments
- UI patterns extended to other department types