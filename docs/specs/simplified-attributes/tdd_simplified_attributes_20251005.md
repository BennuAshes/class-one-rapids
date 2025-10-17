# Simplified Attributes System Technical Design Document

## Document Control
| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | Claude | 2025-10-05 | Draft | Initial TDD from PRD |

## Executive Summary
Implementing a three-attribute character progression system (Strength, Coordination, Endurance) to replace the single Power metric, enabling player customization while maintaining idle game simplicity. The system will use React Native state management with AsyncStorage persistence and follow strict TDD practices for all implementations.

## 1. Overview & Context

### Problem Statement
The current linear Power progression provides no player agency in character development. Technical implementation lacks modularity for different playstyles, resulting in identical gameplay experiences for all players at the same level, contributing to 60% player drop-off between levels 15-25.

### Solution Approach
Implement a modular attribute system with three distinct progression paths, each affecting different game mechanics. Use component-based architecture to separate attribute management, UI, and game mechanic integrations while maintaining backward compatibility with existing Power-based calculations.

### Success Criteria
- Attribute allocation response time <200ms
- Zero data loss on attribute persistence
- 80%+ test coverage for all attribute components
- Seamless migration for existing players without progress loss
- Support for 100,000+ concurrent users with <1KB data per player

## 2. Requirements Analysis

### Functional Requirements
Mapped from PRD user stories:

1. **Attribute Point System**
   - Grant 1 point per level automatically
   - Track unallocated points separately
   - Prevent allocation beyond available points
   - Support future expansion to 10 attributes

2. **Strength Mechanics**
   - Modify damage calculation: `(10 + random(0-5)) + (Strength × 5)`
   - Apply immediately to combat
   - No upper limit on Strength value

3. **Coordination Mechanics**
   - Calculate critical chance: `min(10 + (Coordination × 2), 90)`
   - Integrate with existing WeaknessSpot component
   - Cap at 90% maximum critical chance

4. **Endurance Mechanics**
   - Calculate offline efficiency: `min(25 + (Endurance × 2.5), 75)`
   - Store for future offline progression implementation
   - Cap at 75% maximum efficiency

5. **Player Migration**
   - Convert existing Power to attribute points
   - Display one-time migration tutorial
   - Maintain or improve current damage output

### Non-Functional Requirements
- **Performance**: <200ms allocation response, <10ms damage calculation
- **Scalability**: Support 100,000+ players, <1KB data per player
- **Security**: Validate all inputs, prevent negative/non-integer values
- **Availability**: 99.9% uptime for attribute services
- **Accessibility**: WCAG 2.1 AA compliance, 44×44px minimum touch targets

## 3. System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────┐
│                    App.tsx                          │
│  ┌──────────────────────────────────────────────┐  │
│  │           AttributeContext                    │  │
│  │  - attributes: {str, coord, end}             │  │
│  │  - unallocatedPoints: number                 │  │
│  │  - allocatePoint(attr): void                 │  │
│  └──────────────────────────────────────────────┘  │
│                         │                           │
│    ┌────────────────────┼────────────────────┐     │
│    │                    │                    │     │
│ ┌──────────┐   ┌────────────────┐   ┌──────────┐  │
│ │Attributes│   │  CombatSystem   │   │ Storage  │  │
│ │  Panel   │   │  - useDamage()  │   │ Service  │  │
│ │Component │   │  - useCritical()│   │  - save  │  │
│ └──────────┘   └────────────────┘   └──────────┘  │
└─────────────────────────────────────────────────────┘
```

### Component Design

#### AttributeContext
- **Purpose**: Central state management for attributes
- **Responsibilities**:
  - Track attribute values and unallocated points
  - Handle point allocation logic
  - Trigger persistence on changes
  - Calculate derived values (damage bonus, crit chance, etc.)
- **Interfaces**:
  ```typescript
  interface AttributeState {
    strength: number;
    coordination: number;
    endurance: number;
    unallocatedPoints: number;
  }

  interface AttributeContextValue extends AttributeState {
    allocatePoint: (attribute: AttributeType) => void;
    getDamageBonus: () => number;
    getCriticalChance: () => number;
    getOfflineEfficiency: () => number;
  }
  ```
- **Dependencies**: AsyncStorage, React Context API

#### AttributesPanel
- **Purpose**: UI for attribute allocation and display
- **Responsibilities**:
  - Display current attribute values
  - Show available points
  - Handle allocation interactions
  - Provide visual feedback
- **Interfaces**:
  ```typescript
  interface AttributesPanelProps {
    visible: boolean;
    onClose: () => void;
  }
  ```
- **Dependencies**: AttributeContext, React Native Reanimated

#### AttributeStorage
- **Purpose**: Persistence layer for attribute data
- **Responsibilities**:
  - Save attributes to AsyncStorage
  - Load attributes on app start
  - Handle migration for existing players
  - Validate data integrity
- **Interfaces**:
  ```typescript
  interface StorageService {
    saveAttributes(state: AttributeState): Promise<void>;
    loadAttributes(): Promise<AttributeState | null>;
    migrateFromPower(level: number): Promise<AttributeState>;
  }
  ```
- **Dependencies**: AsyncStorage, Data validation utilities

### Data Flow
```
User Tap [+] → AttributesPanel → AttributeContext.allocatePoint()
                                           ↓
                                   Update State
                                           ↓
                                   Storage.save()
                                           ↓
                                   Recalculate Derived Values
                                           ↓
                                   Update Combat System
```

## 4. API Design

### Internal APIs

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `allocatePoint(attr)` | Allocate point to attribute | `AttributeType` | `void` |
| `getDamageBonus()` | Calculate Strength damage | none | `number` |
| `getCriticalChance()` | Calculate crit percentage | none | `number (0-90)` |
| `getOfflineEfficiency()` | Calculate offline rate | none | `number (25-75)` |
| `resetAttributes()` | Reset for testing | none | `void` |
| `migratePlayer(level)` | Convert Power to points | `number` | `AttributeState` |

### External Integrations
- **AsyncStorage**: React Native async storage for persistence
- **Haptics**: Expo haptics for allocation feedback
- **Reanimated**: Animation library for UI transitions

## 5. Data Model

### Entity Design
```typescript
// Core attribute types
type AttributeType = 'strength' | 'coordination' | 'endurance';

// Attribute state entity
interface AttributeState {
  strength: number;        // 0 to unlimited
  coordination: number;    // 0 to unlimited
  endurance: number;       // 0 to unlimited
  unallocatedPoints: number; // 0 to current level
}

// Derived calculations
interface DerivedStats {
  damageBonus: number;     // strength * 5
  criticalChance: number;  // min(10 + coord * 2, 90)
  offlineEfficiency: number; // min(25 + end * 2.5, 75)
}

// Migration data
interface MigrationState {
  hasMigrated: boolean;
  previousPower: number;
  migrationDate: string;
}
```

### Database Schema
AsyncStorage Keys:
```
@attributes:state       - Current attribute values
@attributes:migration   - Migration status
@attributes:version     - Schema version for future updates
```

Data Structure:
```json
{
  "@attributes:state": {
    "strength": 5,
    "coordination": 3,
    "endurance": 2,
    "unallocatedPoints": 0
  },
  "@attributes:migration": {
    "hasMigrated": true,
    "previousPower": 10,
    "migrationDate": "2025-11-04T12:00:00Z"
  },
  "@attributes:version": "1.0.0"
}
```

### Data Access Patterns
- **Read on startup**: Load attributes once on app launch
- **Write on change**: Save immediately after allocation
- **Atomic updates**: Use transactions for multi-field updates
- **Cache in memory**: Keep current state in React Context

## 6. Security Design

### Authentication & Authorization
- No external auth required (local single-player game)
- Attribute modifications only through validated functions
- No direct state manipulation exposed

### Data Security
- **Validation Rules**:
  - Points cannot be negative
  - Unallocated points cannot exceed level
  - Total allocated points must equal level - unallocated
  - Attributes must be integers
- **Anti-cheat**:
  ```typescript
  function validateAllocation(state: AttributeState, level: number): boolean {
    const total = state.strength + state.coordination +
                  state.endurance + state.unallocatedPoints;
    return total === level &&
           state.unallocatedPoints >= 0 &&
           Number.isInteger(state.strength) &&
           Number.isInteger(state.coordination) &&
           Number.isInteger(state.endurance);
  }
  ```

### Security Controls
- Input sanitization for all numeric inputs
- Bounds checking on calculations
- No eval() or dynamic code execution
- Secure random for damage calculations

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)
**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools
- **Framework**: React Native Testing Library
- **Test Runner**: Jest with React Native preset
- **Mocking**: Jest mocks for AsyncStorage, MSW for future API calls
- **Coverage Tool**: Jest coverage reports (target >80%)

#### TDD Implementation Process

### Phase 1: Core Attribute Logic Tests (Write First!)

```typescript
// Test 1: RED - Attribute allocation
describe('AttributeContext', () => {
  test('should allocate point to strength', () => {
    const { result } = renderHook(() => useAttributes());

    act(() => {
      result.current.allocatePoint('strength');
    });

    expect(result.current.strength).toBe(1);
    expect(result.current.unallocatedPoints).toBe(0);
  });

  // Test 2: RED - Prevent over-allocation
  test('should not allocate when no points available', () => {
    const { result } = renderHook(() => useAttributes());

    act(() => {
      result.current.allocatePoint('strength');
      result.current.allocatePoint('strength'); // Should fail
    });

    expect(result.current.strength).toBe(1);
  });

  // Test 3: RED - Damage calculation
  test('should calculate damage bonus from strength', () => {
    const { result } = renderHook(() => useAttributes());

    act(() => {
      // Simulate 5 strength
      for(let i = 0; i < 5; i++) {
        result.current.allocatePoint('strength');
      }
    });

    expect(result.current.getDamageBonus()).toBe(25);
  });
});
```

### Phase 2: UI Component Tests

```typescript
// Test 4: RED - Panel rendering
describe('AttributesPanel', () => {
  test('should display current attributes', () => {
    render(<AttributesPanel visible={true} />);

    expect(screen.getByText('Strength: 0')).toBeTruthy();
    expect(screen.getByText('Coordination: 0')).toBeTruthy();
    expect(screen.getByText('Endurance: 0')).toBeTruthy();
  });

  // Test 5: RED - Allocation button
  test('should show [+] button when points available', () => {
    render(<AttributesPanel visible={true} />);

    const plusButtons = screen.getAllByText('[+]');
    expect(plusButtons).toHaveLength(3);
  });

  // Test 6: RED - Button interaction
  test('should allocate point on button press', () => {
    render(<AttributesPanel visible={true} />);

    const strengthButton = screen.getAllByText('[+]')[0];
    fireEvent.press(strengthButton);

    expect(screen.getByText('Strength: 1')).toBeTruthy();
  });
});
```

### Phase 3: Persistence Tests

```typescript
// Test 7: RED - Save to storage
describe('AttributeStorage', () => {
  test('should persist attributes to AsyncStorage', async () => {
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

  // Test 8: RED - Load from storage
  test('should load attributes on startup', async () => {
    const storage = new AttributeStorage();
    await storage.saveAttributes({
      strength: 5,
      coordination: 3,
      endurance: 2,
      unallocatedPoints: 0
    });

    const loaded = await storage.loadAttributes();
    expect(loaded?.strength).toBe(5);
  });
});
```

### Phase 4: Integration Tests

```typescript
// Test 9: RED - Combat integration
describe('Combat Integration', () => {
  test('should apply strength bonus to damage', () => {
    const { getByTestId } = render(<App />);

    // Allocate 5 strength points
    // Tap enemy
    // Verify damage includes +25 bonus

    const damageText = getByTestId('damage-number');
    const damage = parseInt(damageText.props.children);
    expect(damage).toBeGreaterThanOrEqual(35); // 10 base + 25 bonus
  });

  // Test 10: RED - Critical integration
  test('should apply coordination to critical chance', () => {
    // Test critical hits occur at expected rate
  });
});
```

### Phase 5: Migration Tests

```typescript
// Test 11: RED - Player migration
describe('Migration', () => {
  test('should convert Power to attribute points', async () => {
    // Set up player with level 20, Power 20
    await AsyncStorage.setItem('@player:level', '20');
    await AsyncStorage.setItem('@player:power', '20');

    const migrator = new AttributeMigrator();
    const result = await migrator.migrate();

    expect(result.unallocatedPoints).toBe(20);
    expect(result.strength).toBe(0);
  });
});
```

### Test Categories Summary

#### Unit Testing (80% coverage required)
- Attribute allocation logic (10 tests)
- Damage calculations (5 tests)
- Critical calculations (5 tests)
- Validation logic (8 tests)
- Storage operations (6 tests)

#### Integration Testing
- Combat system integration (5 tests)
- UI state synchronization (4 tests)
- Persistence flow (3 tests)
- Migration process (3 tests)

#### End-to-End Testing
- Complete level-up to allocation flow
- Combat with different builds
- App restart with persistence
- Migration from old version

### TDD Checklist for Implementation
- [ ] Write failing test for attribute allocation
- [ ] Implement minimal code to pass
- [ ] Write test for UI display
- [ ] Implement UI component
- [ ] Write test for persistence
- [ ] Implement storage layer
- [ ] Write integration tests
- [ ] Connect all components
- [ ] Write migration tests
- [ ] Implement migration logic
- [ ] All tests green before moving to next feature

## 8. Infrastructure & Deployment

### Infrastructure Requirements
| Component | Specification | Justification |
|-----------|--------------|---------------|
| Client Storage | 1KB per player | Attribute data storage |
| Memory | <1MB additional | UI and state management |
| CPU | Negligible | Simple calculations |

### Deployment Architecture
- **Build Process**: Expo EAS Build
- **Distribution**: App Store / Google Play
- **Updates**: OTA updates via Expo Updates
- **Rollback**: Version pinning in app.json

### Monitoring & Observability

#### Metrics
- Attribute allocation rate per session
- Distribution of points across attributes
- Migration success rate
- Performance metrics (allocation response time)

#### Error Tracking
```typescript
// Sentry integration for production
Sentry.captureException(error, {
  tags: {
    feature: 'attributes',
    action: 'allocation'
  },
  extra: {
    attribute: attributeType,
    currentState: state
  }
});
```

## 9. Scalability & Performance

### Performance Requirements
- **Allocation Response**: <200ms including persistence
- **UI Animation**: 60 FPS for panel transitions
- **Damage Calculation**: <10ms with attributes
- **Storage Operations**: <500ms for save/load

### Performance Optimization
```typescript
// Memoize expensive calculations
const damageBonus = useMemo(() => strength * 5, [strength]);
const critChance = useMemo(() => Math.min(10 + coordination * 2, 90), [coordination]);

// Batch storage updates
const debouncedSave = useDebouncedCallback(
  (state) => storage.saveAttributes(state),
  500
);
```

## 10. Risk Assessment & Mitigation

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Players don't understand attributes | High | Medium | Interactive tutorial, clear descriptions | UX Team |
| Migration fails for existing players | High | Low | Thorough testing, rollback plan | Dev Team |
| Performance degrades with calculations | Medium | Low | Memoization, profiling | Dev Team |
| Balance issues between builds | Medium | High | Analytics monitoring, quick patches | Game Design |
| Storage corruption | High | Low | Validation, backup state | Dev Team |

## 11. Implementation Plan (TDD-Driven)

### Phase 1: Foundation & Test Setup [3 days]
**Day 1: Test Infrastructure**
- [ ] Configure React Native Testing Library
- [ ] Set up test utilities for attributes
- [ ] Create mock AsyncStorage
- [ ] Write first 5 failing tests

**Day 2: Core Logic Implementation**
- [ ] Implement AttributeContext (TDD)
- [ ] Implement allocation logic (TDD)
- [ ] Implement validation (TDD)
- [ ] All Phase 1 tests green

**Day 3: Calculation Tests**
- [ ] Write damage calculation tests
- [ ] Write critical calculation tests
- [ ] Implement calculations
- [ ] Refactor for clarity

### Phase 2: UI Implementation [4 days]
**Day 4-5: Panel Component**
- [ ] Write UI rendering tests
- [ ] Write interaction tests
- [ ] Implement AttributesPanel
- [ ] Add animations (after tests pass)

**Day 6-7: Integration**
- [ ] Write combat integration tests
- [ ] Connect to existing damage system
- [ ] Connect to WeaknessSpot component
- [ ] Test full combat flow

### Phase 3: Persistence & Migration [3 days]
**Day 8: Storage Layer**
- [ ] Write storage tests
- [ ] Implement AttributeStorage
- [ ] Test save/load cycle
- [ ] Add error handling

**Day 9-10: Migration**
- [ ] Write migration tests
- [ ] Implement migration logic
- [ ] Test with various player states
- [ ] Add tutorial flow

### Phase 4: Polish & Release [4 days]
**Day 11-12: Polish**
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Visual polish
- [ ] Sound effects

**Day 13-14: Release Prep**
- [ ] Final testing pass
- [ ] Documentation
- [ ] Release notes
- [ ] Monitoring setup

### Technical Milestones
| Milestone | Deliverable | Date | Dependencies |
|-----------|------------|------|--------------|
| M1 | Core attribute system with tests | Day 3 | Test setup |
| M2 | UI fully functional | Day 7 | Core system |
| M3 | Persistence complete | Day 10 | UI complete |
| M4 | Production ready | Day 14 | All tests pass |

## 12. Decision Log

### Architecture Decisions
| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| State Management | Redux, Context, MobX | React Context | Simpler, built-in, sufficient for scope |
| Storage | AsyncStorage, MMKV, SQLite | AsyncStorage | Already in use, simple key-value sufficient |
| Animation | Native Driver, Reanimated | Reanimated 2 | Better performance, more control |
| Testing | Enzyme, RTL, Native Testing | React Native Testing Library | Community standard, better practices |

### Trade-offs
- **Simplicity over Flexibility**: Fixed 3 attributes vs configurable system
- **Performance over Features**: No complex interactions between attributes
- **Immediate Feedback over Confirmation**: No undo/confirm dialogs
- **Local Storage over Cloud**: Faster, simpler, no backend needed

## 13. Open Questions

- [ ] Should we add haptic feedback for allocation? (Yes - adds satisfaction)
- [ ] How many particles for level-up celebration? (Test with users)
- [ ] Should tutorial be skippable? (Yes, with "Don't show again")
- [ ] Cache calculations or compute on-demand? (Memoize for performance)
- [ ] Add achievement for maxing an attribute? (Future feature)

## 14. Appendices

### A. Technical Glossary
- **TDD**: Test-Driven Development (Red-Green-Refactor cycle)
- **Memoization**: Caching computation results
- **Context**: React's built-in state management
- **AsyncStorage**: React Native's persistent storage API

### B. Code Examples

#### Attribute Allocation Implementation
```typescript
const allocatePoint = useCallback((attribute: AttributeType) => {
  if (unallocatedPoints <= 0) return;

  setState(prev => ({
    ...prev,
    [attribute]: prev[attribute] + 1,
    unallocatedPoints: prev.unallocatedPoints - 1
  }));

  // Haptic feedback
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}, [unallocatedPoints]);
```

#### Damage Integration
```typescript
const calculateDamage = (baseMax: number): number => {
  const { strength } = useContext(AttributeContext);
  const damageBonus = strength * 5;
  const baseDamage = 10 + Math.random() * 5;
  return Math.floor(baseDamage + damageBonus);
};
```

### C. Related Documents
- Product Requirements Document: `/docs/specs/simplified-attributes/prd_simplified_attributes_20251005.md`
- React Native Testing Guide: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- Original MVP: `/docs/research/gamedev/asherons-call-idler-mvp.md`

---
*Generated from PRD: prd_simplified_attributes_20251005.md*
*Generation Date: 2025-10-05 | TDD Generator v1.0*