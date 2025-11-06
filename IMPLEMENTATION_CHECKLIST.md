# Implementation Checklist - Salvage & Tinkering System
## TDD-Based Task Breakdown

**Project**: Salvage & Tinkering System - Progressive Automation Design
**Framework**: React Native + Expo
**Methodology**: Test-Driven Development (TDD)
**Target**: 15 days (3 weeks)

---

## Phase 1: Foundation & First Feature (Week 1 - 5 Days)

### Day 1: Test Infrastructure Setup
- [ ] Configure Jest with React Native preset (`jest.config.js`)
- [ ] Setup React Native Testing Library
- [ ] Create custom render utility with Legend State provider
- [ ] Configure Reanimated mocks for tests
- [ ] Setup AsyncStorage mock
- [ ] Create test data factories (mockItem, mockEquipment, mockPlayer)
- [ ] Add test script to `package.json`
- [ ] **Verify**: `npm test` runs without errors

### Day 2: Core Salvage Feature (TDD)
**RED Phase - Write Failing Tests**:
- [ ] Test: renders inventory item with salvage button
- [ ] Test: pressing salvage button removes item from inventory
- [ ] Test: salvage adds materials to player total
- [ ] Test: salvage button is disabled during animation
- [ ] Test: displays material gain popup after salvage

**GREEN Phase - Minimal Implementation**:
- [ ] Create `SalvageEngine` service with `salvageItem()` method
- [ ] Create `materials$` Legend State observable
- [ ] Create `inventory$` state
- [ ] Build `SalvageButton` component (basic)
- [ ] Wire up state updates on salvage

**REFACTOR Phase**:
- [ ] Extract material calculation logic
- [ ] Add dependency injection for testing
- [ ] Implement proper error handling
- [ ] **Verify**: 100% test coverage for salvage flow

### Day 3: Tinkering Feature (TDD)
**RED Phase - Write Failing Tests**:
- [ ] Test: displays equipment with upgrade button
- [ ] Test: shows material cost for next upgrade
- [ ] Test: upgrade button disabled when insufficient materials
- [ ] Test: clicking upgrade consumes materials and increases level
- [ ] Test: displays power increase animation

**GREEN Phase - Minimal Implementation**:
- [ ] Create `TinkerEngine` service
- [ ] Create `equipment$` state
- [ ] Build `TinkerButton` component
- [ ] Implement upgrade cost calculation (exponential scaling)
- [ ] Connect material consumption

**REFACTOR Phase**:
- [ ] Extract cost calculation to formula
- [ ] Add equipment level validation
- [ ] **Verify**: Complete tinkering flow with tests

### Day 4: Visual Polish (TDD for Animations)
**RED Phase - Write Failing Tests**:
- [ ] Test: particle effect triggers on salvage
- [ ] Test: materials animate from item to counter
- [ ] Test: number popup appears with correct value
- [ ] Test: screen shake on equipment upgrade

**GREEN Phase - Minimal Implementation**:
- [ ] Create `ParticleSystem` with Reanimated 3
- [ ] Build material collection animation (0.5-1s)
- [ ] Add number popup component
- [ ] Implement screen shake effect

**REFACTOR Phase**:
- [ ] Optimize particle count for performance
- [ ] Extract animation constants
- [ ] Test on device (target: 60fps)
- [ ] **Verify**: Smooth 60fps animations on mid-tier devices

### Day 5: First Unlock - Auto-Collect (TDD)
**RED Phase - Write Failing Tests**:
- [ ] Test: auto-collect unlocks at level 5
- [ ] Test: materials auto-collect after 0.5 seconds
- [ ] Test: manual collection still works
- [ ] Test: unlock notification appears
- [ ] Test: player gains XP from salvage

**GREEN Phase - Minimal Implementation**:
- [ ] Create `ProgressionManager` service
- [ ] Implement XP gain logic (per salvage/tinkering)
- [ ] Add level-up logic with exponential XP scaling
- [ ] Create unlock system with level thresholds
- [ ] Build auto-collect timer (2s → 0.5s)

**REFACTOR Phase**:
- [ ] Extract XP calculation formula
- [ ] Create unlock event system
- [ ] **Verify**: Player reaches Level 5 and auto-collect activates

---

## Phase 2: Automation System (Week 2 - 5 Days)

### Day 6: Basic Automation (TDD)
**RED Phase - Write Failing Tests**:
- [ ] Test: automation toggle appears at Level 10
- [ ] Test: enabling automation processes items automatically
- [ ] Test: automation runs at 1 item per 3 seconds
- [ ] Test: manual clicks still work during automation
- [ ] Test: automation stops when queue is empty

**GREEN Phase - Minimal Implementation**:
- [ ] Create `AutomationManager` service
- [ ] Build automation loop using `requestAnimationFrame`
- [ ] Add toggle UI component
- [ ] Implement item queue system (FIFO)
- [ ] Connect to SalvageEngine

**REFACTOR Phase**:
- [ ] Implement priority queue (for future)
- [ ] Add automation state persistence
- [ ] **Verify**: Automation processes items at correct rate

### Day 7: Manual Bonuses (TDD)
**RED Phase - Write Failing Tests**:
- [ ] Test: manual salvage yields 2x materials
- [ ] Test: combo system activates after 10 clicks
- [ ] Test: critical hit triggers ~5% of time (allow variance)
- [ ] Test: combo UI shows current streak

**GREEN Phase - Minimal Implementation**:
- [ ] Add manual multiplier (2x) to SalvageEngine
- [ ] Implement combo tracking (counter + timer)
- [ ] Add critical hit RNG with seeded randomness
- [ ] Build combo UI component

**REFACTOR Phase**:
- [ ] Extract RNG to utility function
- [ ] Implement combo reset on timeout
- [ ] Add audio cues (optional)
- [ ] **Verify**: Manual clicking yields 2x, critical at ~5%

### Day 8: Automation Upgrades (TDD)
**RED Phase - Write Failing Tests**:
- [ ] Test: Level 11 increases speed to 1 item per 2 sec
- [ ] Test: Level 13 increases speed to 1 item per 1 sec
- [ ] Test: Level 15 increases speed to 3 items per sec
- [ ] Test: speed upgrade reflected in UI
- [ ] Test: automation settings persist after app restart

**GREEN Phase - Minimal Implementation**:
- [ ] Add automation speed tiers to ProgressionManager
- [ ] Update AutomationManager to use variable speed
- [ ] Build automation speed UI
- [ ] Implement AsyncStorage save/load for settings

**REFACTOR Phase**:
- [ ] Create speed tier configuration object
- [ ] Extract speed calculation logic
- [ ] **Verify**: Speed increases at levels 11, 13, 15, 18, 22

### Day 9: Tinkering Automation (TDD)
**RED Phase - Write Failing Tests**:
- [ ] Test: auto-tinker toggle appears at Level 12
- [ ] Test: auto-tinker automatically upgrades equipment
- [ ] Test: priority system (Level 16) distributes materials correctly
- [ ] Test: smart AI suggestions (Level 20) appear
- [ ] Test: material refinement (Level 15) combines 3→1

**GREEN Phase - Minimal Implementation**:
- [ ] Add auto-tinker toggle to UI
- [ ] Implement basic auto-tinker loop
- [ ] Create priority order system
- [ ] Build smart suggestions using history
- [ ] Implement material refinement (3 common → 1 rare)

**REFACTOR Phase**:
- [ ] Extract priority calculation
- [ ] Add AI suggestion algorithm
- [ ] **Verify**: Complete hybrid tinkering gameplay

### Day 10: Polish & Integration Testing (TDD)
**Integration Tests**:
- [ ] Test: Complete salvage flow (tap → particle → material → popup)
- [ ] Test: Complete tinkering flow (select material → upgrade → animation)
- [ ] Test: Automation with hybrid manual gameplay
- [ ] Test: Level progression (1 → 25) with unlocks

**E2E Tests**:
- [ ] Test: Player journey Level 1 → 10 (manual phase)
- [ ] Test: Player journey Level 10 → 25 (automation phase)
- [ ] Test: Save/load persistence

**Performance Benchmarks**:
- [ ] Benchmark: Salvage action completes in <16ms
- [ ] Benchmark: 60fps with 20 particle effects
- [ ] Benchmark: State updates are batched

**Device Testing**:
- [ ] Test on iOS device/simulator (60fps target)
- [ ] Test on Android device/simulator (30fps acceptable)
- [ ] Profile memory usage (<150MB)
- [ ] **Verify**: Ready for Phase 3

---

## Phase 3: Full Automation & Endgame (Week 3+ - Ongoing)

### Advanced Features (Days 11-15+)

**Master Salvager (Level 26)**
- [ ] Implement 100 items/second processing
- [ ] Create 10,000+ item queue management
- [ ] Add offline progression calculation (up to 48 hours)
- [ ] Build "Welcome Back" screen with earnings display

**Grand Tinkermaster (Level 30)**
- [ ] Full automatic tinkering without player input
- [ ] Advanced AI equipment optimization
- [ ] Prestige system preparation

**Prestige System (Level 35+)**
- [ ] Implement prestige reset mechanics
- [ ] Add cumulative bonus calculations
- [ ] Create prestige choice UI
- [ ] Track prestige count and history

**Endgame Features (Level 40+)**
- [ ] Command center UI with advanced statistics
- [ ] Optimization challenges
- [ ] Leaderboard preparation (future cloud)

---

## Testing Coverage Checklist

### Unit Tests (Service Layer)
- [ ] SalvageEngine - 15+ tests (yield calculation, bonuses, combos)
- [ ] TinkerEngine - 12+ tests (upgrades, costs, scaling)
- [ ] AutomationManager - 10+ tests (speeds, queues, offline calc)
- [ ] ProgressionManager - 8+ tests (XP, levels, unlocks)
- [ ] ParticleSystem - 8+ tests (effects, animations, performance)

### Integration Tests (Feature Flows)
- [ ] Salvage flow - 5+ tests (complete cycle)
- [ ] Tinkering flow - 5+ tests (complete cycle)
- [ ] Automation integration - 5+ tests (background processing)
- [ ] Level progression - 4+ tests (unlock triggers)

### E2E Tests (Player Journey)
- [ ] Level 1-10 progression - manual phase complete
- [ ] Level 10-25 progression - automation phase complete
- [ ] Save/load persistence - state consistency

### Performance Tests
- [ ] Action latency <16ms
- [ ] 60fps with particles
- [ ] Offline calc <2s
- [ ] Memory <150MB

**Total Target**: >80% code coverage

---

## Dependency Management Checklist

### Core Dependencies (Already in Expo)
- [x] React Native 0.73+
- [x] Expo SDK 50+
- [ ] Install: `npm install legend-state`
- [ ] Install: `npm install react-native-reanimated@3`

### Development Dependencies
- [ ] `npm install --save-dev @testing-library/react-native`
- [ ] `npm install --save-dev @testing-library/react`
- [ ] Verify Jest 29 configured

### Optional (Future)
- [ ] Firebase Analytics (week 3+)
- [ ] React Native Encrypted Storage (week 3+)
- [ ] MSW (Mock Service Worker) for API testing

---

## Code Quality Checklist

- [ ] All code has comments explaining logic
- [ ] Service layer completely decoupled from UI
- [ ] No state mutations (use immutable updates)
- [ ] Error handling for all user actions
- [ ] Proper TypeScript types for all data
- [ ] ESLint passes without warnings
- [ ] Code is formatted consistently

---

## Performance & Device Testing Checklist

### iOS Testing
- [ ] Test on iPhone 12 (mid-tier)
- [ ] Test on iPhone 8 (older device)
- [ ] Verify 60fps animations
- [ ] Profile memory usage
- [ ] Check battery impact

### Android Testing
- [ ] Test on Pixel 4 (mid-tier)
- [ ] Test on Pixel 3 (older device)
- [ ] Verify 30fps acceptable
- [ ] Check for ANR issues
- [ ] Verify offline progression calculation

---

## Documentation Checklist

- [ ] README.md with setup instructions
- [ ] Architecture overview diagram
- [ ] Component hierarchy documentation
- [ ] API documentation (state observables, services)
- [ ] Testing guide for new features
- [ ] Deployment instructions

---

## Final Verification (Before Release)

- [ ] All tests passing (`npm test`)
- [ ] No ESLint warnings
- [ ] 80%+ code coverage
- [ ] Performance benchmarks met
- [ ] Device testing complete
- [ ] E2E player journey works Level 1 → 25
- [ ] Save/load persistence verified
- [ ] Offline progression calculates correctly
- [ ] Memory usage <150MB
- [ ] Battery impact acceptable

---

## Notes

**TDD Methodology**: Each day follows Red-Green-Refactor
- **RED**: Write failing tests first (always fail initially)
- **GREEN**: Implement minimal code to pass tests
- **REFACTOR**: Improve code quality while keeping tests green

**Key Principles**:
- No code without tests
- Tests serve as documentation
- Refactor freely with test safety net
- Keep iterations small (one feature per day)
- Test failure acceptance criteria in user terms

**Checkpoint Days**: Days 5 and 10 include integration testing to verify phases work

---

**Last Updated**: 2025-11-02
**Estimated Effort**: 15 days (5 per phase minimum)
**Team Size**: 1 full-time developer recommended

