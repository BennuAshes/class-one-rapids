# Simplified Attributes System Implementation Tasks

## Document Metadata
- **Source TDD**: tdd_simplified_attributes_20251005.md
- **Generated**: 2025-10-05
- **Total Tasks**: 15
- **Architecture**: Feature-based organization (no barrel exports, co-located tests)
- **Testing**: Strict TDD with React Native Testing Library

## Phase 1: First User-Visible Feature - Attribute Display & Allocation
*Duration: 2 days | Priority: P0 | Prerequisites: None*

**LEAN PRINCIPLE**: First task delivers working attribute allocation that users can interact with immediately.

### Task 1.1: Implement Basic Attribute Display with Allocation Button
**ROLE**: You are a senior React Native developer implementing the first user-visible attribute feature

**CONTEXT**: Based on TDD requirements for attribute point allocation system. The app currently has Power progression but no attribute system.

**OBJECTIVE**: Create visible attribute display showing Strength/Coordination/Endurance with working [+] buttons that users can tap

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Test First
```typescript
// frontend/modules/attributes/AttributesDisplay.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AttributesDisplay } from './AttributesDisplay';

describe('AttributesDisplay', () => {
  test('should display all three attributes with values', () => {
    render(<AttributesDisplay />);

    expect(screen.getByText(/Strength: 0/)).toBeTruthy();
    expect(screen.getByText(/Coordination: 0/)).toBeTruthy();
    expect(screen.getByText(/Endurance: 0/)).toBeTruthy();
  });

  test('should show available points when player has them', () => {
    render(<AttributesDisplay unallocatedPoints={3} />);

    expect(screen.getByText(/3 points available/)).toBeTruthy();
  });
});
```

#### Step 2: Minimal Implementation
- Create `frontend/modules/attributes/AttributesDisplay.tsx`
- Display three attributes with current values
- Show unallocated points
- Add [+] buttons (functional in next task)

**VISUAL REQUIREMENTS**:
```yaml
visual_requirements:
  component_name: "AttributesDisplay"

  layout:
    container_style: "horizontal row below enemy"
    spacing: "12px between attributes"

  attribute_display:
    icon_size: "32x32px"
    text_size: "14px"
    colors:
      strength: "#FF4444"      # Red
      coordination: "#4444FF"   # Blue
      endurance: "#44FF44"      # Green

  allocation_button:
    size: "44x44px"            # WCAG minimum
    text: "[+]"
    disabled_opacity: 0.3
    enabled_opacity: 1.0
```

**ACCEPTANCE CRITERIA**:
- [ ] User sees Strength, Coordination, Endurance values
- [ ] User sees available points if any
- [ ] [+] buttons visible next to each attribute
- [ ] Component renders in App.tsx below enemy
- [ ] Tests pass for display functionality

**DELIVERABLE**: Users can see their attributes and available points

---

### Task 1.2: Implement Point Allocation Logic
**ROLE**: You are implementing the core attribute allocation functionality

**CONTEXT**: Display is complete, now make allocation functional with immediate visual feedback

**OBJECTIVE**: Enable users to allocate points by tapping [+] buttons with instant updates

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Test
```typescript
// frontend/modules/attributes/useAttributes.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useAttributes } from './useAttributes';

describe('useAttributes', () => {
  test('should allocate point to strength', () => {
    const { result } = renderHook(() => useAttributes(1)); // 1 unallocated point

    act(() => {
      result.current.allocatePoint('strength');
    });

    expect(result.current.strength).toBe(1);
    expect(result.current.unallocatedPoints).toBe(0);
  });

  test('should not allocate when no points available', () => {
    const { result } = renderHook(() => useAttributes(0));

    act(() => {
      result.current.allocatePoint('strength');
    });

    expect(result.current.strength).toBe(0);
  });
});
```

#### Step 2: Implementation
- Create `frontend/modules/attributes/useAttributes.ts` hook
- Implement allocation logic with validation
- Add haptic feedback on successful allocation
- Connect to AttributesDisplay component

**FILES TO CREATE**:
- `frontend/modules/attributes/useAttributes.ts`
- `frontend/modules/attributes/useAttributes.test.ts`
- `frontend/modules/attributes/types.ts`

**ACCEPTANCE CRITERIA**:
- [ ] Tapping [+] allocates 1 point to attribute
- [ ] Visual update happens immediately (<100ms)
- [ ] Haptic feedback on successful allocation
- [ ] Button disabled when no points available
- [ ] All allocation tests pass

**DELIVERABLE**: Users can allocate attribute points with immediate feedback

---

## Phase 2: Combat Integration - Make Attributes Affect Gameplay
*Duration: 2 days | Priority: P0 | Prerequisites: Phase 1*

### Task 2.1: Integrate Strength with Damage Calculation
**ROLE**: You are integrating attributes with the existing combat system

**CONTEXT**: Attributes exist but don't affect gameplay. TDD specifies damage formula: `(10 + random(0-5)) + (Strength × 5)`

**OBJECTIVE**: Make Strength immediately affect damage dealt to enemies

**TDD IMPLEMENTATION**:

#### Step 1: Write Integration Test
```typescript
// frontend/App.test.tsx (add to existing)
test('should apply strength bonus to damage', () => {
  const { getByTestId } = render(<App />);

  // Simulate having 5 strength
  // Tap enemy
  // Verify damage includes strength bonus

  const damageNumber = getByTestId(/damage-number-/);
  const damage = parseInt(damageNumber.props.children);
  expect(damage).toBeGreaterThanOrEqual(35); // 10 base + 25 strength bonus minimum
});
```

#### Step 2: Implementation
- Modify `frontend/App.tsx` handleEnemyTap function
- Import useAttributes hook
- Apply formula: `(10 + random(0-5)) + (strength × 5)`
- Update damage display to show bonus

**FILES TO MODIFY**:
- `frontend/App.tsx` - Update damage calculation
- `frontend/App.test.tsx` - Add integration tests

**ACCEPTANCE CRITERIA**:
- [ ] Damage increases by 5 per Strength point
- [ ] Damage numbers reflect new calculation
- [ ] Existing combat functionality preserved
- [ ] Integration tests pass

**DELIVERABLE**: Users see immediate damage increase from Strength

---

### Task 2.2: Integrate Coordination with Critical Hits
**ROLE**: You are implementing critical hit chance based on Coordination

**CONTEXT**: WeaknessSpot component exists. TDD specifies: `critChance = min(10 + (Coordination × 2), 90)`

**OBJECTIVE**: Make Coordination affect critical hit chance when hitting weakness spots

**TDD IMPLEMENTATION**:

#### Step 1: Write Test
```typescript
// frontend/modules/attributes/useCriticalChance.test.ts
test('should calculate critical chance from coordination', () => {
  const { result } = renderHook(() => useCriticalChance(10)); // 10 coordination

  expect(result.current.criticalChance).toBe(30); // 10 base + 20 from coord
});
```

#### Step 2: Implementation
- Create `useCriticalChance` hook
- Integrate with WeaknessSpot component
- Show critical chance in UI (optional but helpful)
- Apply 2x damage on critical hits

**FILES TO CREATE**:
- `frontend/modules/attributes/useCriticalChance.ts`
- `frontend/modules/attributes/useCriticalChance.test.ts`

**FILES TO MODIFY**:
- `frontend/modules/combat/WeaknessSpot.tsx` - Use critical chance
- `frontend/App.tsx` - Apply critical damage multiplier

**ACCEPTANCE CRITERIA**:
- [ ] Critical chance increases with Coordination
- [ ] Critical hits deal 2x damage
- [ ] Visual feedback on critical hit (CRITICAL! text)
- [ ] Chance capped at 90%

**DELIVERABLE**: Users see higher critical rate with Coordination

---

## Phase 3: Data Persistence - Save Progress
*Duration: 1 day | Priority: P0 | Prerequisites: Phase 2*

### Task 3.1: Implement Attribute Persistence with AsyncStorage
**ROLE**: You are implementing data persistence for attributes

**CONTEXT**: Attributes reset on app restart. Need AsyncStorage persistence per TDD.

**OBJECTIVE**: Save and load attribute state automatically

**TDD IMPLEMENTATION**:

#### Step 1: Write Storage Test
```typescript
// frontend/modules/attributes/AttributeStorage.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AttributeStorage } from './AttributeStorage';

describe('AttributeStorage', () => {
  test('should save attributes to AsyncStorage', async () => {
    const storage = new AttributeStorage();
    const state = {
      strength: 5,
      coordination: 3,
      endurance: 2,
      unallocatedPoints: 0
    };

    await storage.saveAttributes(state);

    const saved = await AsyncStorage.getItem('@attributes:state');
    expect(JSON.parse(saved!)).toEqual(state);
  });
});
```

#### Step 2: Implementation
- Create AttributeStorage service
- Auto-save on allocation
- Load on app start
- Handle errors gracefully

**FILES TO CREATE**:
- `frontend/modules/attributes/AttributeStorage.ts`
- `frontend/modules/attributes/AttributeStorage.test.ts`

**DEPENDENCIES TO ADD**:
- `@react-native-async-storage/async-storage` - for persistence

**ACCEPTANCE CRITERIA**:
- [ ] Attributes persist between app sessions
- [ ] Save happens within 500ms of allocation
- [ ] Load happens on app start
- [ ] Error handling for storage failures

**DELIVERABLE**: User progress saves automatically

---

## Phase 4: Enhanced UI/UX - Polish & Feedback
*Duration: 2 days | Priority: P1 | Prerequisites: Phase 3*

### Task 4.1: Create Animated Attributes Panel
**ROLE**: You are creating a polished UI for attribute management

**CONTEXT**: Current display is basic. Need dedicated panel per TDD design.

**OBJECTIVE**: Create expandable panel with animations and better layout

**TDD IMPLEMENTATION**:

#### Step 1: Write UI Test
```typescript
// frontend/modules/attributes/AttributesPanel.test.tsx
test('should toggle panel visibility', () => {
  const { getByText, queryByText } = render(<AttributesPanel />);

  fireEvent.press(getByText('Attributes'));
  expect(getByText('Strength: 5')).toBeTruthy();

  fireEvent.press(getByText('Close'));
  expect(queryByText('Strength: 5')).toBeFalsy();
});
```

#### Step 2: Implementation
- Create AttributesPanel component
- Add slide-up animation with Reanimated
- Show detailed stats (damage bonus, crit%, etc.)
- Include attribute descriptions

**FILES TO CREATE**:
- `frontend/modules/attributes/AttributesPanel.tsx`
- `frontend/modules/attributes/AttributesPanel.test.tsx`

**VISUAL REQUIREMENTS**:
```yaml
visual_requirements:
  component_name: "AttributesPanel"

  panel:
    position: "bottom sheet"
    height: "50% of screen"
    background: "rgba(0,0,0,0.9)"
    animation: "slide up 300ms"

  attribute_row:
    layout: "horizontal"
    padding: "16px"
    components:
      - icon: "40x40px"
      - name_and_value: "flex 1"
      - effect_text: "muted color"
      - allocate_button: "44x44px"

  colors:
    strength_row: "rgba(255,68,68,0.1)"
    coordination_row: "rgba(68,68,255,0.1)"
    endurance_row: "rgba(68,255,68,0.1)"
```

**ACCEPTANCE CRITERIA**:
- [ ] Panel slides up/down smoothly
- [ ] Shows all attribute details
- [ ] Allocation works within panel
- [ ] Responsive to different screen sizes

**DELIVERABLE**: Polished attribute management UI

---

### Task 4.2: Add Level-Up Integration
**ROLE**: You are connecting attributes to the leveling system

**CONTEXT**: Players level up but don't receive attribute points automatically

**OBJECTIVE**: Grant 1 attribute point per level and show notification

**TDD IMPLEMENTATION**:

#### Step 1: Write Integration Test
```typescript
// frontend/App.test.tsx
test('should grant attribute point on level up', () => {
  // Simulate gaining enough XP to level
  // Verify unallocated points increase
  // Verify notification appears
});
```

#### Step 2: Implementation
- Modify level-up logic in App.tsx
- Increment unallocated points
- Show "Attribute Point Available!" notification
- Add visual indicator on Attributes button

**FILES TO MODIFY**:
- `frontend/App.tsx` - Grant points on level up
- `frontend/modules/attributes/useAttributes.ts` - Add point increment method

**ACCEPTANCE CRITERIA**:
- [ ] Player receives 1 point per level
- [ ] Notification shows on level up
- [ ] Visual indicator for available points
- [ ] Integration with existing XP system

**DELIVERABLE**: Automatic attribute points from leveling

---

## Phase 5: Player Migration - Convert Existing Progress
*Duration: 1 day | Priority: P0 | Prerequisites: Phase 4*

### Task 5.1: Implement Power-to-Attributes Migration
**ROLE**: You are implementing the migration system for existing players

**CONTEXT**: Players have Power that needs converting to attribute points

**OBJECTIVE**: One-time migration giving players points equal to their level

**TDD IMPLEMENTATION**:

#### Step 1: Write Migration Test
```typescript
// frontend/modules/attributes/AttributeMigration.test.ts
test('should convert level 20 player to 20 attribute points', async () => {
  // Set up player with level 20
  // Run migration
  // Verify 20 unallocated points
  // Verify migration only runs once
});
```

#### Step 2: Implementation
- Create migration check on app start
- Convert current level to unallocated points
- Show one-time tutorial
- Mark migration complete

**FILES TO CREATE**:
- `frontend/modules/attributes/AttributeMigration.ts`
- `frontend/modules/attributes/AttributeMigration.test.ts`
- `frontend/modules/attributes/MigrationTutorial.tsx`

**ACCEPTANCE CRITERIA**:
- [ ] Existing players get points = level
- [ ] Tutorial explains new system
- [ ] Migration runs only once
- [ ] No loss of player progress

**DELIVERABLE**: Seamless transition for existing players

---

## Phase 6: Endurance & Future Features - Foundation
*Duration: 1 day | Priority: P2 | Prerequisites: Phase 5*

### Task 6.1: Implement Endurance Display (Offline Preparation)
**ROLE**: You are preparing for future offline progression

**CONTEXT**: Endurance affects offline efficiency (future feature). Calculate and display now.

**OBJECTIVE**: Show offline efficiency percentage based on Endurance

**TDD IMPLEMENTATION**:

#### Step 1: Write Test
```typescript
// frontend/modules/attributes/useOfflineEfficiency.test.ts
test('should calculate offline efficiency from endurance', () => {
  const { result } = renderHook(() => useOfflineEfficiency(10)); // 10 endurance

  expect(result.current.efficiency).toBe(50); // 25 base + 25 from endurance
});
```

#### Step 2: Implementation
- Create efficiency calculation hook
- Display in AttributesPanel
- Store for future offline system

**FILES TO CREATE**:
- `frontend/modules/attributes/useOfflineEfficiency.ts`
- `frontend/modules/attributes/useOfflineEfficiency.test.ts`

**ACCEPTANCE CRITERIA**:
- [ ] Efficiency calculates correctly
- [ ] Display shows percentage
- [ ] Capped at 75% maximum
- [ ] Ready for offline integration

**DELIVERABLE**: Visible offline efficiency stat

---

## Phase 7: Performance & Polish - Production Ready
*Duration: 1 day | Priority: P1 | Prerequisites: Phase 6*

### Task 7.1: Optimize Performance & Add Analytics
**ROLE**: You are optimizing for production deployment

**CONTEXT**: System functional but needs performance tuning

**OBJECTIVE**: Ensure <200ms response times and add metrics

**IMPLEMENTATION**:
- Memoize calculations with useMemo
- Add performance markers
- Implement analytics events for allocation
- Profile and optimize renders

**ACCEPTANCE CRITERIA**:
- [ ] Allocation response <200ms
- [ ] No unnecessary re-renders
- [ ] Analytics track attribute choices
- [ ] Memory usage within limits

**DELIVERABLE**: Production-ready performance

---

## Task Execution Guidelines

### For Developers
1. **Follow TDD strictly** - Write test first, then implement
2. **Use feature-based organization** - No barrel exports
3. **Co-locate tests** - Test files next to implementation
4. **Check existing code** - Reuse before creating new
5. **Validate accessibility** - 44px minimum touch targets

### Testing Checklist Per Task
- [ ] Unit tests written first (RED)
- [ ] Implementation passes tests (GREEN)
- [ ] Code refactored if needed (REFACTOR)
- [ ] Integration tests pass
- [ ] Manual testing on device
- [ ] Accessibility verified

### Architecture Reminders
- Working directory: `c:\dev\class-one-rapids\frontend\`
- Feature modules in `frontend/modules/[feature]/`
- Shared components in `frontend/shared/`
- NO `index.ts` barrel exports
- Tests co-located with `.test.ts(x)` extension

## Risk Mitigation

### Risk: Performance degradation with calculations
**Mitigation**: Use memoization, profile regularly, optimize hot paths

### Risk: Storage corruption loses progress
**Mitigation**: Validate data on load, implement backup state, error boundaries

### Risk: Players don't understand attributes
**Mitigation**: Clear descriptions, visual feedback, optional tutorial

## Summary Statistics

- **Total Tasks**: 10 core tasks + 1 optimization
- **Critical Path**: Tasks 1.1 → 1.2 → 2.1 → 3.1
- **Parallel Potential**: 40% (Tasks 2.1 & 2.2, 4.1 & 4.2)
- **First Playable**: After Task 1.2 (Day 1)
- **MVP Complete**: After Task 3.1 (Day 4)
- **Full Feature**: After Task 7.1 (Day 8)

---
*Generated from TDD: tdd_simplified_attributes_20251005.md*
*Generation timestamp: 2025-10-05*
*Optimized for: Lean development with immediate user value*