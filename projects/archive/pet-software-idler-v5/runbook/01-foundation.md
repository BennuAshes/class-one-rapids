# Phase 1: Foundation Setup

## Objective
Establish core infrastructure, development environment, and architectural patterns for the PetSoft Tycoon idle game.

## Work Packages

### WP 1.1: Architecture Decision and Project Setup

#### Task 1.1.1: Resolve Technology Stack Architecture
**Priority:** Critical - Blocks all development
- **Action:** Conduct stakeholder alignment meeting on technology choice
- **Options:** 
  - Vanilla JavaScript (PRD specification)
  - React + Legend State (recommended for maintainability)
  - React Native/Expo (cross-platform expansion)
- **Decision Criteria:** Performance targets, development velocity, team expertise
- **Validation:** Signed architecture decision record (ADR)
- **Time Estimate:** 2-4 hours (meeting + documentation)
- **Dependencies:** None
- **Deliverable:** `docs/architecture-decision-record.md`

#### Task 1.1.2: Initialize Project Structure
**Prerequisites:** Architecture decision completed
- **Create feature-based directory structure:**
  ```
  src/
  ├── features/
  │   ├── codeProduction/
  │   ├── departmentManagement/
  │   ├── prestigeSystem/
  │   └── achievements/
  ├── shared/
  │   ├── types/
  │   ├── utils/
  │   └── constants/
  └── app/
      ├── store/
      └── components/
  ```
- **Setup files:** package.json, tsconfig.json, jest.config.js
- **Validation:** `npm run build` succeeds without errors
- **Time Estimate:** 1-2 hours
- **Files Created:** Project structure, configuration files

#### Task 1.1.3: Configure Development Environment
- **Install core dependencies:**
  - React Native/Expo OR React (based on architecture decision)
  - Legend State v3 for reactive state management
  - TypeScript 5.0+ with strict configuration
  - Testing framework (React Native Testing Library/React Testing Library)
- **Setup development tools:**
  - ESLint with React/accessibility rules
  - Prettier for code formatting
  - Pre-commit hooks with lint-staged
- **Validation:** `npm run lint`, `npm run typecheck` pass
- **Time Estimate:** 2-3 hours
- **Dependencies:** Architecture decision

### WP 1.2: State Management Foundation

#### Task 1.2.1: Implement Core Game State Structure
- **Create base observable state using Legend State:**
  ```typescript
  const gameState$ = observable({
    player: {
      resources: {
        linesOfCode: 0,
        features: 0,
        money: 0,
        customerLeads: 0
      },
      departments: {
        development: { employees: 0, managers: 0, efficiency: 1.0 },
        sales: { employees: 0, managers: 0, efficiency: 1.0 }
      }
    },
    gameMetadata: {
      startTime: Date.now(),
      lastSaveTime: Date.now(),
      version: '1.0.0'
    }
  });
  ```
- **Implement computed observables for derived values**
- **Setup batch update patterns for performance**
- **Validation:** State updates trigger reactive UI updates
- **Time Estimate:** 3-4 hours
- **File:** `src/app/store/gameStore.ts`

#### Task 1.2.2: Create State Persistence Layer
- **Implement save/load system with Legend State sync:**
  - Auto-save every 30 seconds
  - Save data compression using LZ-String
  - Version migration support
- **Add data integrity validation:**
  - Cryptographic hashing for save files
  - Corruption detection and recovery
- **Setup offline calculation framework**
- **Validation:** Save/load operations complete in <100ms
- **Time Estimate:** 4-5 hours
- **Files:** `src/shared/services/persistence.ts`, `src/shared/utils/saveData.ts`

### WP 1.3: Performance Infrastructure

#### Task 1.3.1: Setup Performance Monitoring
- **Implement frame rate monitoring:**
  - 60 FPS target tracking
  - Performance budget enforcement
  - Memory usage monitoring
- **Create performance testing utilities:**
  - Automated performance regression detection
  - Load testing for rapid user interactions
- **Setup development performance warnings**
- **Validation:** Performance metrics display in development mode
- **Time Estimate:** 2-3 hours
- **File:** `src/shared/utils/performanceMonitor.ts`

#### Task 1.3.2: Implement Game Loop Foundation
- **Create RequestAnimationFrame-based game loop:**
  - 60 FPS target maintenance
  - Efficient batch updates
  - Performance-optimized state propagation
- **Setup object pooling for particle effects**
- **Implement timing utilities for consistent gameplay**
- **Validation:** Game loop maintains 58+ FPS under normal load
- **Time Estimate:** 3-4 hours
- **File:** `src/app/gameLoop.ts`

### WP 1.4: Testing Framework Setup

#### Task 1.4.1: Configure Testing Infrastructure
- **Setup React Testing Library with game-specific utilities:**
  - Custom render function with Legend State providers
  - Game state testing utilities
  - Performance testing helpers
- **Configure Jest with React Native/React environment**
- **Setup test coverage reporting (90% target)**
- **Create testing documentation and patterns**
- **Validation:** `npm run test` executes successfully
- **Time Estimate:** 2-3 hours
- **Files:** `jest.config.js`, `src/test/testUtils.ts`

#### Task 1.4.2: Implement Core Testing Patterns
- **Create example test for game state:**
  ```typescript
  describe('Game State', () => {
    it('should update lines of code when writeCode action is called', () => {
      const initialState = createTestGameState();
      initialState.actions.writeCode();
      expect(initialState.player.resources.linesOfCode.get()).toBe(1);
    });
  });
  ```
- **Setup integration testing patterns for user interactions**
- **Create performance testing examples**
- **Validation:** All foundation tests pass
- **Time Estimate:** 2-3 hours
- **Files:** `src/app/store/__tests__/gameStore.test.ts`

### WP 1.5: Development Tooling

#### Task 1.5.1: Configure Build System
- **Setup Vite/Metro bundler with optimizations:**
  - Code splitting for features
  - Asset optimization
  - Bundle size monitoring
- **Configure development server with HMR**
- **Setup environment variable management**
- **Validation:** Build produces <3MB bundle, dev server starts in <10 seconds
- **Time Estimate:** 2-3 hours
- **Files:** `vite.config.ts` or `metro.config.js`

#### Task 1.5.2: Setup Code Quality Tools
- **Configure ESLint with game-specific rules:**
  - Performance-focused linting rules
  - Accessibility linting for UI components
  - Legend State usage patterns
- **Setup Prettier with consistent formatting**
- **Configure pre-commit hooks for quality enforcement**
- **Validation:** All code quality checks pass in CI
- **Time Estimate:** 1-2 hours
- **Files:** `.eslintrc.js`, `.prettierrc`, `.husky/`

## Phase 1 Validation Checklist

### Technical Validation
- [ ] Project builds successfully with zero warnings
- [ ] All linting and type checking passes
- [ ] Game state updates trigger reactive UI changes
- [ ] Save/load operations complete in <100ms
- [ ] Performance monitoring displays accurate metrics
- [ ] Game loop maintains 58+ FPS in development

### Quality Validation
- [ ] Test suite runs with 100% passing tests
- [ ] Code coverage setup and reporting works
- [ ] Pre-commit hooks prevent quality issues
- [ ] Development workflow documented

### Architecture Validation
- [ ] Feature-based directory structure implemented
- [ ] Legend State patterns correctly established
- [ ] Performance patterns established for 60 FPS target
- [ ] Testing patterns documented and exemplified

## Estimated Timeline
- **Total Phase 1 Duration:** 5-7 days
- **Parallel Work Opportunities:** Tasks 1.3.1 and 1.4.1 can run parallel to 1.2.x tasks
- **Critical Path:** Architecture Decision → Project Setup → State Management → Testing

## Dependencies for Next Phase
- **Phase 1 outputs required for Phase 2:**
  - Functional game state system
  - Working save/load mechanism
  - Performance monitoring active
  - Testing framework operational
  - Build system producing optimized bundles

## Risk Mitigation
- **Architecture Decision Delay:** Have contingency plans for each technology option
- **Performance Setup Complexity:** Start with basic monitoring, enhance iteratively
- **State Management Learning Curve:** Create comprehensive documentation and examples
- **Tool Configuration Issues:** Maintain reference configurations and troubleshooting guides