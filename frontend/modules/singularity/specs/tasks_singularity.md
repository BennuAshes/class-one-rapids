# Task List for Singularity System

This task list provides explicit, agent-executable tasks derived from the Technical Design Document (`tdd_singularity.md`). Each task follows Test-Driven Development (TDD) methodology and includes clear acceptance criteria.

---

## Phase 1: Type System and State Extensions

### Task 1.1: Extend GameState Interface
**Status**: pending
**Depends On**: none
**Description**: Add singularity-specific fields to the GameState interface in the shared types file. This includes bigPetCount, singularityPetCount, skills array, unlockedSkills array, and activeSkills array.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/types/game.ts` - Add new fields to GameState interface and update DEFAULT_GAME_STATE constant

**Acceptance Criteria**:
- [ ] GameState interface includes bigPetCount: number
- [ ] GameState interface includes singularityPetCount: number
- [ ] GameState interface includes skills: Skill[]
- [ ] GameState interface includes unlockedSkills: string[]
- [ ] GameState interface includes activeSkills: string[]
- [ ] DEFAULT_GAME_STATE initializes all new fields with appropriate defaults
- [ ] TypeScript compiler shows no errors

**Test Command**: `npx tsc --noEmit`

---

### Task 1.2: Create Skill Type Definitions
**Status**: pending
**Depends On**: none
**Description**: Define TypeScript types for the skill system including SkillRequirementType, SkillRequirement, SkillEffectType, and Skill interfaces.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/types/game.ts` - Add Skill, SkillRequirement, SkillRequirementType, and SkillEffectType type definitions

**Acceptance Criteria**:
- [ ] SkillRequirementType union type defined with 'singularityPetCount', 'totalPets', 'upgrade', 'time'
- [ ] SkillRequirement interface defined with type and value fields
- [ ] SkillEffectType union type defined with 'visualTrail', 'other'
- [ ] Skill interface defined with id, name, description, unlockRequirement, effectType, and optional effectConfig
- [ ] TypeScript compiler shows no errors

**Test Command**: `npx tsc --noEmit`

---

### Task 1.3: Extend Upgrade Interface
**Status**: pending
**Depends On**: none
**Description**: Add new effect types to the Upgrade interface to support singularity rate multipliers and combination unlock upgrades.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/types/game.ts` - Extend Upgrade interface effectType with 'singularityRateMultiplier' and 'unlockCombination', add new categories

**Acceptance Criteria**:
- [ ] Upgrade effectType includes 'singularityRateMultiplier'
- [ ] Upgrade effectType includes 'unlockCombination'
- [ ] Upgrade category includes 'singularityAcceleration'
- [ ] Upgrade category includes 'petCombination'
- [ ] TypeScript compiler shows no errors
- [ ] Existing upgrade definitions still compile

**Test Command**: `npx tsc --noEmit`

---

### Task 1.4: Update Type Guard Functions
**Status**: pending
**Depends On**: 1.1, 1.2, 1.3
**Description**: Update isValidGameState type guard and sanitizeGameState function to validate and sanitize the new singularity fields.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/types/game.ts` - Update isValidGameState and sanitizeGameState functions

**Acceptance Criteria**:
- [ ] isValidGameState checks bigPetCount is a number
- [ ] isValidGameState checks singularityPetCount is a number
- [ ] isValidGameState checks skills is an array
- [ ] isValidGameState checks unlockedSkills is a string array
- [ ] isValidGameState checks activeSkills is a string array
- [ ] sanitizeGameState clamps bigPetCount between 0 and MAX_SAFE_INTEGER
- [ ] sanitizeGameState clamps singularityPetCount between 0 and MAX_SAFE_INTEGER
- [ ] sanitizeGameState provides defaults for all new fields
- [ ] TypeScript compiler shows no errors

**Test Command**: `npx tsc --noEmit`

---

## Phase 2: Core Singularity Logic (TDD)

### Task 2.1: Create Singularity Configuration File
**Status**: pending
**Depends On**: none
**Description**: Create singularityConfig.ts with all configuration constants for singularity rates, scrap rates, combination costs, and visual effect limits.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityConfig.ts` - Create new file with SINGULARITY_CONFIG constant

**Acceptance Criteria**:
- [ ] SINGULARITY_CONFIG.BASE_AI_PET_SINGULARITY_RATE = 0.0001
- [ ] SINGULARITY_CONFIG.BASE_BIG_PET_SINGULARITY_RATE = 0.01
- [ ] SINGULARITY_CONFIG.AI_PET_SCRAP_RATE = 1.0
- [ ] SINGULARITY_CONFIG.BIG_PET_SCRAP_RATE = 0.5
- [ ] SINGULARITY_CONFIG.SINGULARITY_PET_SCRAP_RATE = 0
- [ ] SINGULARITY_CONFIG.COMBINE_COST = 10
- [ ] SINGULARITY_CONFIG.FEEDING_SINGULARITY_BOOST_CHANCE = 0.01
- [ ] All config values are exported as const
- [ ] TypeScript compiler shows no errors

**Test Command**: `npx tsc --noEmit`

---

### Task 2.2: Write Tests for Singularity Engine
**Status**: pending
**Depends On**: 2.1, 1.1
**Description**: Write comprehensive unit tests for singularityEngine.ts covering getEffectiveSingularityRate, processSingularityTick, and applySingularityBoostFromFeeding. These tests should FAIL initially (TDD red phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityEngine.test.ts` - Create new test file with comprehensive test cases

**Acceptance Criteria**:
- [ ] Tests for getEffectiveSingularityRate with no upgrades
- [ ] Tests for getEffectiveSingularityRate with multiplier upgrades
- [ ] Tests for processSingularityTick when probability fails
- [ ] Tests for processSingularityTick when AI Pets transition
- [ ] Tests for processSingularityTick when Big Pets transition
- [ ] Tests for applySingularityBoostFromFeeding successful trigger
- [ ] Tests for applySingularityBoostFromFeeding failed trigger
- [ ] Tests use proper mocking of Math.random
- [ ] All tests initially FAIL (implementation not created yet)

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- singularityEngine.test"`

---

### Task 2.3: Implement Singularity Engine Functions
**Status**: pending
**Depends On**: 2.2
**Description**: Implement singularityEngine.ts with getEffectiveSingularityRate, processSingularityTick, and applySingularityBoostFromFeeding functions to make the tests pass (TDD green phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityEngine.ts` - Create new file with core singularity logic

**Acceptance Criteria**:
- [ ] getEffectiveSingularityRate calculates base rate * (1 + multiplier)
- [ ] processSingularityTick rolls probability for each AI Pet
- [ ] processSingularityTick rolls probability for each Big Pet
- [ ] processSingularityTick atomically updates pet counts
- [ ] applySingularityBoostFromFeeding checks boost chance
- [ ] applySingularityBoostFromFeeding promotes random pet when triggered
- [ ] All singularityEngine.test.ts tests pass
- [ ] Code coverage ≥ 90% for singularityEngine.ts

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- singularityEngine.test"`

---

### Task 2.4: Refactor Singularity Engine
**Status**: pending
**Depends On**: 2.3
**Description**: Refactor singularityEngine.ts for clarity, add JSDoc comments, and ensure code quality (TDD refactor phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityEngine.ts` - Refactor and document

**Acceptance Criteria**:
- [ ] All exported functions have JSDoc comments
- [ ] Complex logic has inline comments
- [ ] No code duplication
- [ ] Variable names are descriptive
- [ ] All tests still pass after refactoring
- [ ] TypeScript compiler shows no errors

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- singularityEngine.test"`

---

## Phase 3: Pet Combination Logic (TDD)

### Task 3.1: Write Tests for Combination Logic
**Status**: pending
**Depends On**: 2.1, 1.1
**Description**: Write unit tests for combinationLogic.ts covering canCombinePets, combinePets, and getCombineCost. Tests should FAIL initially (TDD red phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/combinationLogic.test.ts` - Create new test file

**Acceptance Criteria**:
- [ ] Tests for canCombinePets when insufficient AI Pets
- [ ] Tests for canCombinePets when sufficient AI Pets
- [ ] Tests for combinePets throwing error with insufficient pets
- [ ] Tests for combinePets deducting AI Pets and adding Big Pet
- [ ] Tests for multiple sequential combinations
- [ ] Tests for getCombineCost returning correct value
- [ ] All tests initially FAIL (implementation not created yet)

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- combinationLogic.test"`

---

### Task 3.2: Implement Combination Logic Functions
**Status**: pending
**Depends On**: 3.1
**Description**: Implement combinationLogic.ts with canCombinePets, combinePets, and getCombineCost functions (TDD green phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/combinationLogic.ts` - Create new file with pet combination logic

**Acceptance Criteria**:
- [ ] canCombinePets checks petCount >= COMBINE_COST
- [ ] combinePets validates sufficient pets and throws error if not
- [ ] combinePets atomically updates petCount and bigPetCount
- [ ] getCombineCost returns SINGULARITY_CONFIG.COMBINE_COST
- [ ] All combinationLogic.test.ts tests pass
- [ ] Code coverage ≥ 90% for combinationLogic.ts

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- combinationLogic.test"`

---

### Task 3.3: Refactor Combination Logic
**Status**: pending
**Depends On**: 3.2
**Description**: Refactor combinationLogic.ts, add documentation, and improve code quality (TDD refactor phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/combinationLogic.ts` - Refactor and document

**Acceptance Criteria**:
- [ ] All exported functions have JSDoc comments
- [ ] Error messages are clear and helpful
- [ ] Code is clean and readable
- [ ] All tests still pass after refactoring
- [ ] TypeScript compiler shows no errors

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- combinationLogic.test"`

---

## Phase 4: Skill System Logic (TDD)

### Task 4.1: Create Skill Definitions
**Status**: pending
**Depends On**: 1.2
**Description**: Create skillDefinitions.ts with the SKILLS array containing the Painting skill definition and getSkillById helper function.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/skillDefinitions.ts` - Create new file with skill definitions

**Acceptance Criteria**:
- [ ] SKILLS array contains painting skill with id 'painting'
- [ ] Painting skill has correct name and description
- [ ] Painting skill unlockRequirement is singularityPetCount: 1
- [ ] Painting skill effectType is 'visualTrail'
- [ ] Painting skill effectConfig has colors array and configuration
- [ ] getSkillById function retrieves skill by ID
- [ ] TypeScript compiler shows no errors

**Test Command**: `npx tsc --noEmit`

---

### Task 4.2: Write Tests for Skill Engine
**Status**: pending
**Depends On**: 4.1, 1.1, 1.2
**Description**: Write unit tests for skillEngine.ts covering checkSkillRequirement, checkAndUnlockSkills, toggleSkill, isSkillUnlocked, and isSkillActive. Tests should FAIL initially (TDD red phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/skillEngine.test.ts` - Create new test file

**Acceptance Criteria**:
- [ ] Tests for checkSkillRequirement with singularityPetCount type
- [ ] Tests for checkSkillRequirement with totalPets type
- [ ] Tests for checkSkillRequirement with upgrade type
- [ ] Tests for checkAndUnlockSkills when requirements met
- [ ] Tests for checkAndUnlockSkills when requirements not met
- [ ] Tests for checkAndUnlockSkills not re-unlocking already unlocked skills
- [ ] Tests for toggleSkill activating and deactivating
- [ ] Tests for toggleSkill not activating locked skills
- [ ] All tests initially FAIL (implementation not created yet)

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- skillEngine.test"`

---

### Task 4.3: Implement Skill Engine Functions
**Status**: pending
**Depends On**: 4.2
**Description**: Implement skillEngine.ts with all skill management functions (TDD green phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/skillEngine.ts` - Create new file with skill engine logic

**Acceptance Criteria**:
- [ ] checkSkillRequirement handles all requirement types
- [ ] checkAndUnlockSkills iterates through locked skills
- [ ] checkAndUnlockSkills auto-enables newly unlocked skills
- [ ] toggleSkill adds/removes skill from activeSkills
- [ ] toggleSkill validates skill is unlocked before activating
- [ ] isSkillUnlocked checks unlockedSkills array
- [ ] isSkillActive checks activeSkills array
- [ ] All skillEngine.test.ts tests pass
- [ ] Code coverage ≥ 90% for skillEngine.ts

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- skillEngine.test"`

---

### Task 4.4: Refactor Skill Engine
**Status**: pending
**Depends On**: 4.3
**Description**: Refactor skillEngine.ts for clarity and add comprehensive documentation (TDD refactor phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/skillEngine.ts` - Refactor and document

**Acceptance Criteria**:
- [ ] All exported functions have JSDoc comments
- [ ] Switch statement in checkSkillRequirement has clear cases
- [ ] Console warnings for unimplemented features are appropriate
- [ ] Code is maintainable and extensible
- [ ] All tests still pass after refactoring
- [ ] TypeScript compiler shows no errors

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- skillEngine.test"`

---

## Phase 5: State Management Integration

### Task 5.1: Update Game Store with Singularity Observables
**Status**: pending
**Depends On**: 1.1, 4.1
**Description**: Update gameStore.ts to initialize the new singularity fields in gameState$ observable and populate skills array on initialization.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts` - Add bigPetCount, singularityPetCount, skills, unlockedSkills, activeSkills to initial state and update initializeGameState

**Acceptance Criteria**:
- [ ] gameState$ observable initializes all new fields with defaults
- [ ] initializeGameState populates skills array from SKILLS definition
- [ ] Skills populate even if state load fails
- [ ] TypeScript compiler shows no errors
- [ ] Existing functionality not broken

**Test Command**: `npx tsc --noEmit`

---

### Task 5.2: Add Computed Observables for Singularity
**Status**: pending
**Depends On**: 5.1, 1.3
**Description**: Create computed observables for totalSingularityRateMultiplier$, isCombinationUnlocked$, and totalPets$ in gameStore.ts.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts` - Add computed observables

**Acceptance Criteria**:
- [ ] totalSingularityRateMultiplier$ sums all singularityRateMultiplier effects
- [ ] isCombinationUnlocked$ checks for unlockCombination upgrade
- [ ] totalPets$ sums petCount + bigPetCount + singularityPetCount
- [ ] Computed observables update reactively
- [ ] TypeScript compiler shows no errors

**Test Command**: `npx tsc --noEmit`

---

### Task 5.3: Update Scrap Calculation for Multi-Tier Pets
**Status**: pending
**Depends On**: 5.1, 2.1
**Description**: Modify calculateScrapPerSecond function to account for AI Pets, Big Pets, and Singularity Pets with different scrap rates.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts` - Update calculateScrapPerSecond function

**Acceptance Criteria**:
- [ ] AI Pets generate 1.0 scrap/second each
- [ ] Big Pets generate 0.5 scrap/second each
- [ ] Singularity Pets generate 0 scrap/second
- [ ] Total scrap multiplied by upgrade multipliers
- [ ] Function uses values from SINGULARITY_CONFIG
- [ ] TypeScript compiler shows no errors

**Test Command**: `npx tsc --noEmit`

---

### Task 5.4: Update useGameState Hook
**Status**: pending
**Depends On**: 5.1
**Description**: Extend useGameState hook to expose new singularity observables.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/hooks/useGameState.ts` - Add bigPetCount$, singularityPetCount$, skills$, unlockedSkills$, activeSkills$ to returned object

**Acceptance Criteria**:
- [ ] Hook returns bigPetCount$ observable
- [ ] Hook returns singularityPetCount$ observable
- [ ] Hook returns skills$ observable
- [ ] Hook returns unlockedSkills$ observable
- [ ] Hook returns activeSkills$ observable
- [ ] TypeScript compiler shows no errors

**Test Command**: `npx tsc --noEmit`

---

### Task 5.5: Write Integration Tests for State Management
**Status**: pending
**Depends On**: 5.1, 5.2, 5.3, 5.4
**Description**: Create integration tests verifying state initialization, computed observables, and persistence of new fields.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityIntegration.test.ts` - Create new integration test file

**Acceptance Criteria**:
- [ ] Tests verify skills array populates on initialization
- [ ] Tests verify computed observables calculate correctly
- [ ] Tests verify new fields persist to AsyncStorage
- [ ] Tests verify new fields restore from AsyncStorage
- [ ] All integration tests pass

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- singularityIntegration.test"`

---

## Phase 6: AttackButtonScreen Updates (TDD)

### Task 6.1: Write Tests for Updated AttackButtonScreen
**Status**: pending
**Depends On**: 5.4, 2.3, 4.3
**Description**: Write component tests for AttackButtonScreen with new pet count displays, game loop integration, and updated feed handler. Tests should FAIL initially (TDD red phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx` - Update existing test file with new test cases

**Acceptance Criteria**:
- [ ] Tests verify AI Pet count displays
- [ ] Tests verify Big Pet count displays
- [ ] Tests verify Singularity Pet count displays
- [ ] Tests verify feed button triggers singularity boost
- [ ] Tests verify game loop runs scrap generation
- [ ] Tests verify game loop runs singularity progression
- [ ] Tests verify game loop checks skill unlocks
- [ ] Tests initially FAIL (implementation not updated yet)

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- AttackButtonScreen.test"`

---

### Task 6.2: Integrate Game Loop in AttackButtonScreen
**Status**: pending
**Depends On**: 6.1, 2.3, 4.3, 5.3
**Description**: Add useEffect hook to AttackButtonScreen that runs game loop every 1 second for scrap generation, singularity progression, and skill unlock checks.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx` - Add game loop useEffect

**Acceptance Criteria**:
- [ ] useEffect sets up interval with 1000ms timing
- [ ] Interval calls calculateScrapPerSecond and updates scrap
- [ ] Interval calls processSingularityTick with 1.0 delta
- [ ] Interval calls checkAndUnlockSkills
- [ ] Interval cleanup on component unmount
- [ ] Game loop tests pass

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- AttackButtonScreen.test"`

---

### Task 6.3: Update Feed Handler with Singularity Boost
**Status**: pending
**Depends On**: 6.1, 2.3
**Description**: Modify handleFeed function in AttackButtonScreen to call applySingularityBoostFromFeeding after adding pets.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx` - Update handleFeed function

**Acceptance Criteria**:
- [ ] handleFeed adds pets with bonus (existing logic)
- [ ] handleFeed calls applySingularityBoostFromFeeding (new)
- [ ] Feed handler tests pass
- [ ] Singularity boost can trigger on feed

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- AttackButtonScreen.test"`

---

### Task 6.4: Add Pet Counts Display to AttackButtonScreen
**Status**: pending
**Depends On**: 6.1, 5.4
**Description**: Update AttackButtonScreen JSX to display AI Pet count, Big Pet count, and Singularity Pet count separately with appropriate styling.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx` - Add pet counts container and Text elements with styles

**Acceptance Criteria**:
- [ ] AI Pet count displays with gray color (#666666)
- [ ] Big Pet count displays with orange color (#FF9500)
- [ ] Singularity Pet count displays with blue color (#007AFF)
- [ ] Counts update reactively from observables
- [ ] Styling matches design specifications
- [ ] Pet count display tests pass

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- AttackButtonScreen.test"`

---

### Task 6.5: Refactor AttackButtonScreen
**Status**: pending
**Depends On**: 6.2, 6.3, 6.4
**Description**: Refactor AttackButtonScreen for clarity, ensure proper React hooks usage, and verify all tests pass (TDD refactor phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx` - Refactor and clean up

**Acceptance Criteria**:
- [ ] Code is organized and readable
- [ ] No duplicate logic
- [ ] Hooks follow React best practices
- [ ] All AttackButtonScreen tests pass
- [ ] TypeScript compiler shows no errors

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- AttackButtonScreen.test"`

---

## Phase 7: Combine Button and Dialog (TDD)

### Task 7.1: Write Tests for CombineConfirmationDialog
**Status**: pending
**Depends On**: none
**Description**: Write component tests for CombineConfirmationDialog covering rendering, user interactions, and callbacks. Tests should FAIL initially (TDD red phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/components/CombineConfirmationDialog.test.tsx` - Create new test file

**Acceptance Criteria**:
- [ ] Tests verify dialog renders when visible=true
- [ ] Tests verify dialog hidden when visible=false
- [ ] Tests verify cost and current count display
- [ ] Tests verify confirm button calls onConfirm
- [ ] Tests verify cancel button calls onCancel
- [ ] Tests verify modal closes on request
- [ ] Tests initially FAIL (component not created yet)

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- CombineConfirmationDialog.test"`

---

### Task 7.2: Implement CombineConfirmationDialog Component
**Status**: pending
**Depends On**: 7.1
**Description**: Create CombineConfirmationDialog.tsx component with modal, message, info box, and confirm/cancel buttons (TDD green phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/components/CombineConfirmationDialog.tsx` - Create new component file

**Acceptance Criteria**:
- [ ] Modal appears with transparent overlay
- [ ] Dialog shows cost and current count
- [ ] Info box explains Big Pet benefits and trade-offs
- [ ] Confirm button triggers onConfirm callback
- [ ] Cancel button triggers onCancel callback
- [ ] Modal supports onRequestClose
- [ ] All CombineConfirmationDialog tests pass
- [ ] Accessibility labels present

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- CombineConfirmationDialog.test"`

---

### Task 7.3: Write Tests for Combine Button in AttackButtonScreen
**Status**: pending
**Depends On**: 7.2, 3.2
**Description**: Write tests for combine button functionality in AttackButtonScreen including enabling/disabling and confirmation flow. Tests should FAIL initially (TDD red phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx` - Add combine button test cases

**Acceptance Criteria**:
- [ ] Tests verify combine button renders
- [ ] Tests verify button disabled when petCount < COMBINE_COST
- [ ] Tests verify button enabled when petCount >= COMBINE_COST
- [ ] Tests verify button press shows confirmation dialog
- [ ] Tests verify dialog confirm executes combination
- [ ] Tests verify dialog cancel closes without combining
- [ ] Tests initially FAIL (button not added yet)

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- AttackButtonScreen.test"`

---

### Task 7.4: Add Combine Button to AttackButtonScreen
**Status**: pending
**Depends On**: 7.3, 7.2, 3.2
**Description**: Add combine button to AttackButtonScreen with state management for dialog, handlers for combine/confirm/cancel, and CombineConfirmationDialog integration (TDD green phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx` - Add combine button, dialog state, and handlers

**Acceptance Criteria**:
- [ ] Pressable button shows combine cost and result
- [ ] Button disabled when canCombinePets() returns false
- [ ] Button press sets showCombineDialog to true
- [ ] handleCombineConfirm calls combinePets() and closes dialog
- [ ] handleCombineCancel closes dialog without combining
- [ ] CombineConfirmationDialog receives correct props
- [ ] All combine button tests pass
- [ ] Button styling matches design specifications

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- AttackButtonScreen.test"`

---

### Task 7.5: Refactor Combine Button Implementation
**Status**: pending
**Depends On**: 7.4
**Description**: Refactor combine button and dialog integration for clarity and error handling (TDD refactor phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx` - Refactor combine implementation
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/components/CombineConfirmationDialog.tsx` - Refactor if needed

**Acceptance Criteria**:
- [ ] Error handling in handleCombineConfirm
- [ ] Clean separation of concerns
- [ ] Proper TypeScript types
- [ ] All tests still pass after refactoring
- [ ] Code is maintainable

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- AttackButtonScreen.test CombineConfirmationDialog.test"`

---

## Phase 8: SkillsScreen Implementation (TDD)

### Task 8.1: Write Tests for SkillsScreen
**Status**: pending
**Depends On**: 4.3, 5.4
**Description**: Write component tests for SkillsScreen covering rendering, navigation, empty state, and skills list. Tests should FAIL initially (TDD red phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/SkillsScreen.test.tsx` - Create new test file

**Acceptance Criteria**:
- [ ] Tests verify header with back button renders
- [ ] Tests verify back button calls onNavigateBack
- [ ] Tests verify empty state when no skills
- [ ] Tests verify skills list renders when skills present
- [ ] Tests verify locked skills display correctly
- [ ] Tests verify unlocked skills display correctly
- [ ] Tests initially FAIL (component not created yet)

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- SkillsScreen.test"`

---

### Task 8.2: Implement SkillsScreen Skeleton
**Status**: pending
**Depends On**: 8.1
**Description**: Create SkillsScreen.tsx with basic structure including header, back button, and ScrollView (TDD green phase - partial).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/SkillsScreen.tsx` - Create new screen component

**Acceptance Criteria**:
- [ ] SafeAreaView container
- [ ] Header with back button and title
- [ ] Back button triggers onNavigateBack
- [ ] ScrollView for skills list
- [ ] Empty state when skills.length === 0
- [ ] Skills list maps over skills array
- [ ] Basic SkillsScreen tests pass
- [ ] TypeScript compiler shows no errors

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- SkillsScreen.test"`

---

### Task 8.3: Write Tests for SkillCard Component
**Status**: pending
**Depends On**: 8.2
**Description**: Write tests for SkillCard subcomponent covering locked state, unlocked state, toggle functionality, and requirement display. Tests should FAIL initially (TDD red phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/SkillsScreen.test.tsx` - Add SkillCard test cases

**Acceptance Criteria**:
- [ ] Tests verify SkillCard renders skill name and description
- [ ] Tests verify locked state shows lock indicator
- [ ] Tests verify locked state disables toggle
- [ ] Tests verify unlocked state shows toggle switch
- [ ] Tests verify toggle switch reflects active state
- [ ] Tests verify toggle calls onToggle callback
- [ ] Tests verify requirement display
- [ ] Tests initially FAIL (SkillCard not implemented yet)

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- SkillsScreen.test"`

---

### Task 8.4: Implement SkillCard Component
**Status**: pending
**Depends On**: 8.3
**Description**: Implement SkillCard subcomponent in SkillsScreen.tsx with skill info, lock status, requirements, and toggle switch (TDD green phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/SkillsScreen.tsx` - Implement SkillCard component

**Acceptance Criteria**:
- [ ] SkillCard displays skill name and description
- [ ] Lock indicator shows when isUnlocked is false
- [ ] Unlock requirement text displays using formatRequirement
- [ ] Toggle switch shows when isUnlocked is true
- [ ] Switch value reflects isActive prop
- [ ] Switch onValueChange calls onToggle
- [ ] Switch disabled when skill locked
- [ ] All SkillCard tests pass
- [ ] Accessibility labels present

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- SkillsScreen.test"`

---

### Task 8.5: Add Skills Button to AttackButtonScreen
**Status**: pending
**Depends On**: 8.2
**Description**: Add Skills navigation button to AttackButtonScreen that calls onNavigateToSkills callback.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx` - Add Skills button next to Shop button

**Acceptance Criteria**:
- [ ] Skills button renders in navigation area
- [ ] Button press calls onNavigateToSkills prop
- [ ] Button styling matches Shop button
- [ ] Accessibility labels present
- [ ] TypeScript compiler shows no errors

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- AttackButtonScreen.test"`

---

### Task 8.6: Update App.tsx with Skills Screen Routing
**Status**: pending
**Depends On**: 8.5, 8.2
**Description**: Add SkillsScreen to App.tsx navigation with screen state management and navigation handlers.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/App.tsx` - Add SkillsScreen to navigation, add screen state, add handlers

**Acceptance Criteria**:
- [ ] Import SkillsScreen component
- [ ] Add 'skills' to screen state union type
- [ ] Add handleNavigateToSkills handler
- [ ] Add handleNavigateBackFromSkills handler
- [ ] Render SkillsScreen when currentScreen === 'skills'
- [ ] Pass onNavigateBack callback to SkillsScreen
- [ ] Pass onNavigateToSkills to AttackButtonScreen
- [ ] Navigation works bidirectionally
- [ ] TypeScript compiler shows no errors

**Test Command**: `npx tsc --noEmit`

---

### Task 8.7: Refactor SkillsScreen
**Status**: pending
**Depends On**: 8.4, 8.6
**Description**: Refactor SkillsScreen for code quality, extract formatRequirement if needed, and ensure maintainability (TDD refactor phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/SkillsScreen.tsx` - Refactor and improve

**Acceptance Criteria**:
- [ ] formatRequirement extracted to helper or utils if reused
- [ ] SkillCard could be extracted to separate file for reusability
- [ ] Styles organized and clear
- [ ] All SkillsScreen tests pass
- [ ] Code is maintainable and extensible

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- SkillsScreen.test"`

---

## Phase 9: Painting Skill Effect (TDD)

### Task 9.1: Write Tests for PaintingCanvas
**Status**: pending
**Depends On**: 4.1
**Description**: Write component tests for PaintingCanvas covering trail rendering, fade-out, active state, and performance limits. Tests should FAIL initially (TDD red phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/components/PaintingCanvas.test.tsx` - Create new test file

**Acceptance Criteria**:
- [ ] Tests verify canvas renders when isActive=true
- [ ] Tests verify canvas hidden when isActive=false
- [ ] Tests verify trails appear when addTrail called
- [ ] Tests verify trails fade out over time
- [ ] Tests verify max trail limit enforced
- [ ] Tests verify random colors from skill config
- [ ] Tests verify cleanup on unmount
- [ ] Tests initially FAIL (component not created yet)

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- PaintingCanvas.test"`

---

### Task 9.2: Implement PaintingCanvas Component
**Status**: pending
**Depends On**: 9.1, 4.1
**Description**: Create PaintingCanvas.tsx component with trail state, addTrail method, fade-out animation, and cleanup (TDD green phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/components/PaintingCanvas.tsx` - Create new component

**Acceptance Criteria**:
- [ ] Component manages trails state array
- [ ] Exposes addTrail method via useImperativeHandle or prop
- [ ] addTrail creates TrailPoint with random color from config
- [ ] addTrail enforces maxTrails limit
- [ ] useEffect cleans up old trails based on fadeDuration
- [ ] Trails render as View elements with opacity fade
- [ ] Canvas returns null when isActive is false
- [ ] pointerEvents="none" on canvas overlay
- [ ] All PaintingCanvas tests pass

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- PaintingCanvas.test"`

---

### Task 9.3: Integrate PaintingCanvas with Feed Button
**Status**: pending
**Depends On**: 9.2, 6.3
**Description**: Add PaintingCanvas to AttackButtonScreen and call addTrail on feed button press when painting skill is active.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx` - Import and integrate PaintingCanvas

**Acceptance Criteria**:
- [ ] PaintingCanvas component added to JSX
- [ ] Canvas receives isActive prop based on painting skill active state
- [ ] Ref created to access canvas addTrail method
- [ ] handleFeed calls addTrail with button coordinates
- [ ] Trails appear at feed button location
- [ ] Integration works end-to-end
- [ ] TypeScript compiler shows no errors

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- AttackButtonScreen.test"`

---

### Task 9.4: Performance Test PaintingCanvas
**Status**: pending
**Depends On**: 9.3
**Description**: Test PaintingCanvas performance with maximum trails (50) and verify smooth 60 FPS rendering.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/components/PaintingCanvas.test.tsx` - Add performance test cases

**Acceptance Criteria**:
- [ ] Test rapidly adds 50 trails
- [ ] Test verifies trail limit enforced
- [ ] Test verifies cleanup prevents memory leaks
- [ ] Manual testing confirms smooth performance
- [ ] No frame drops with max trails
- [ ] Performance tests pass

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- PaintingCanvas.test"`

---

### Task 9.5: Refactor PaintingCanvas
**Status**: pending
**Depends On**: 9.4
**Description**: Refactor PaintingCanvas for optimal performance, clean up code, and add documentation (TDD refactor phase).

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/components/PaintingCanvas.tsx` - Refactor and optimize

**Acceptance Criteria**:
- [ ] Code optimized for performance
- [ ] Cleanup interval tuned appropriately
- [ ] JSDoc comments added
- [ ] All tests still pass
- [ ] No memory leaks verified

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- PaintingCanvas.test"`

---

## Phase 10: Shop Integration

### Task 10.1: Add Singularity Upgrades to Upgrade Definitions
**Status**: pending
**Depends On**: 1.3
**Description**: Add singularity-related upgrades to upgradeDefinitions.ts including singularityRateMultiplier upgrades and unlockCombination upgrade.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/upgradeDefinitions.ts` - Add new upgrade definitions

**Acceptance Criteria**:
- [ ] At least one unlockCombination upgrade added
- [ ] At least two singularityRateMultiplier upgrades added
- [ ] Upgrades have appropriate costs
- [ ] Upgrades have clear names and descriptions
- [ ] effectType and effectValue set correctly
- [ ] category set to 'singularityAcceleration' or 'petCombination'
- [ ] TypeScript compiler shows no errors

**Test Command**: `npx tsc --noEmit`

---

### Task 10.2: Update ShopScreen Display Logic
**Status**: pending
**Depends On**: 10.1
**Description**: Update ShopScreen.tsx to display effect descriptions for new singularity upgrade types.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx` - Update effect display logic to handle singularityRateMultiplier and unlockCombination

**Acceptance Criteria**:
- [ ] singularityRateMultiplier displays percentage increase
- [ ] unlockCombination displays unlock message
- [ ] Effect text is clear and informative
- [ ] Existing upgrade types still display correctly
- [ ] TypeScript compiler shows no errors

**Test Command**: `npx tsc --noEmit`

---

### Task 10.3: Write Tests for Shop Singularity Integration
**Status**: pending
**Depends On**: 10.2
**Description**: Write or update tests for ShopScreen to verify singularity upgrades display and purchase correctly.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx` - Add test cases for singularity upgrades

**Acceptance Criteria**:
- [ ] Tests verify singularity upgrades render in shop
- [ ] Tests verify purchase updates purchasedUpgrades
- [ ] Tests verify effects apply after purchase
- [ ] Tests verify isCombinationUnlocked$ updates
- [ ] Tests verify totalSingularityRateMultiplier$ updates
- [ ] All shop integration tests pass

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- ShopScreen.test"`

---

### Task 10.4: Verify Upgrade Effects Apply Correctly
**Status**: pending
**Depends On**: 10.3, 5.2
**Description**: Integration test to verify purchased singularity upgrades correctly affect singularity rates and combination unlock.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityIntegration.test.ts` - Add upgrade effect tests

**Acceptance Criteria**:
- [ ] Test purchases singularityRateMultiplier upgrade
- [ ] Test verifies getEffectiveSingularityRate reflects multiplier
- [ ] Test purchases unlockCombination upgrade
- [ ] Test verifies canCombinePets only works after unlock
- [ ] Test verifies multiple upgrades stack correctly
- [ ] All upgrade effect tests pass

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- singularityIntegration.test"`

---

## Phase 11: Integration Testing

### Task 11.1: Write Full Flow Integration Test (AI → Big → Singularity → Skill)
**Status**: pending
**Depends On**: 2.3, 3.2, 4.3
**Description**: Write comprehensive integration test that simulates full progression flow from AI Pets through Big Pets to Singularity Pets and skill unlock.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityIntegration.test.ts` - Add full flow test

**Acceptance Criteria**:
- [ ] Test starts with AI Pets
- [ ] Test combines AI Pets into Big Pets
- [ ] Test simulates singularity transitions
- [ ] Test verifies painting skill unlocks at 1 singularity pet
- [ ] Test verifies skill auto-enables on unlock
- [ ] Full flow test passes
- [ ] Test covers happy path end-to-end

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- singularityIntegration.test"`

---

### Task 11.2: Write Multiple Upgrades Stacking Test
**Status**: pending
**Depends On**: 10.4
**Description**: Write integration test verifying multiple singularityRateMultiplier upgrades stack correctly and compound effects.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityIntegration.test.ts` - Add upgrade stacking test

**Acceptance Criteria**:
- [ ] Test purchases multiple singularityRateMultiplier upgrades
- [ ] Test verifies totalSingularityRateMultiplier$ sums correctly
- [ ] Test verifies effective rate increases multiplicatively
- [ ] Test verifies singularity transitions increase with upgrades
- [ ] Upgrade stacking test passes

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- singularityIntegration.test"`

---

### Task 11.3: Write Persistence and Restoration Test
**Status**: pending
**Depends On**: 5.5
**Description**: Write integration test that verifies all singularity state persists to AsyncStorage and restores correctly.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityIntegration.test.ts` - Add persistence test

**Acceptance Criteria**:
- [ ] Test sets bigPetCount, singularityPetCount, unlockedSkills, activeSkills
- [ ] Test triggers save to AsyncStorage
- [ ] Test clears gameState$ observable
- [ ] Test loads from AsyncStorage
- [ ] Test verifies all fields restored correctly
- [ ] Test verifies skills array repopulated
- [ ] Persistence test passes

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- singularityIntegration.test"`

---

### Task 11.4: Write Performance Test with Large Pet Counts
**Status**: pending
**Depends On**: 2.3, 5.3
**Description**: Write performance test to verify game loop handles large pet counts (1000+ pets) efficiently.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityIntegration.test.ts` - Add performance test

**Acceptance Criteria**:
- [ ] Test sets petCount to 1000
- [ ] Test sets bigPetCount to 100
- [ ] Test measures processSingularityTick execution time
- [ ] Test measures calculateScrapPerSecond execution time
- [ ] Test verifies tick completes in < 10ms
- [ ] Test verifies no performance degradation
- [ ] Performance test passes

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- singularityIntegration.test"`

---

### Task 11.5: Verify No Race Conditions in State Updates
**Status**: pending
**Depends On**: 11.1, 11.2, 11.3
**Description**: Write tests to verify atomic state updates and no race conditions in concurrent singularity transitions or combinations.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityIntegration.test.ts` - Add race condition tests

**Acceptance Criteria**:
- [ ] Test rapid sequential processSingularityTick calls
- [ ] Test concurrent combination and singularity transition
- [ ] Test verifies pet counts remain consistent
- [ ] Test verifies no negative pet counts
- [ ] Test verifies total pets conserved during transitions
- [ ] Race condition tests pass

**Test Command**: `cmd.exe /c "cd /d C:\\dev\\class-one-rapids && npm test -- singularityIntegration.test"`

---

## Phase 12: Polish and Accessibility

### Task 12.1: Add Accessibility Labels to All New Components
**Status**: pending
**Depends On**: 7.2, 8.4, 9.2
**Description**: Review and add comprehensive accessibility labels to all buttons, switches, and interactive elements in new components.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx` - Add accessibility labels to combine button and skills button
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/SkillsScreen.tsx` - Add accessibility labels to all interactive elements
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/components/CombineConfirmationDialog.tsx` - Add accessibility labels to buttons

**Acceptance Criteria**:
- [ ] All Pressable elements have accessibilityRole
- [ ] All Pressable elements have accessibilityLabel
- [ ] All Switch elements have accessibilityLabel
- [ ] Modal has accessibilityLabel
- [ ] Labels are descriptive and helpful
- [ ] TypeScript compiler shows no errors

**Test Command**: `npx tsc --noEmit`

---

### Task 12.2: Verify Touch Target Sizes
**Status**: pending
**Depends On**: 7.4, 8.4
**Description**: Review all interactive elements to ensure touch targets meet minimum 44pt x 44pt accessibility standard.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx` - Verify and adjust button sizes
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/SkillsScreen.tsx` - Verify and adjust button sizes
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/components/CombineConfirmationDialog.tsx` - Verify and adjust button sizes

**Acceptance Criteria**:
- [ ] All buttons have minWidth: 44 and minHeight: 44
- [ ] Combine button meets size requirements
- [ ] Skills button meets size requirements
- [ ] Dialog buttons meet size requirements
- [ ] SkillCard toggle area meets size requirements
- [ ] Visual verification confirms touch targets

**Test Command**: Manual testing and visual inspection

---

### Task 12.3: Polish Animations and Transitions
**Status**: pending
**Depends On**: 9.2, 7.2
**Description**: Review and enhance animations for painting trails, modal transitions, and any other visual effects.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/components/PaintingCanvas.tsx` - Polish trail fade animation
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/components/CombineConfirmationDialog.tsx` - Verify modal animation

**Acceptance Criteria**:
- [ ] Painting trails fade smoothly
- [ ] Modal appears/disappears smoothly
- [ ] No visual glitches during animations
- [ ] Animations feel responsive and polished
- [ ] Performance remains smooth (60 FPS)

**Test Command**: Manual testing and visual inspection

---

### Task 12.4: Add Loading States If Needed
**Status**: pending
**Depends On**: 5.1
**Description**: Review state initialization and add loading states if needed to prevent rendering issues during initialization.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/shared/store/gameStore.ts` - Review initialization
- `/mnt/c/dev/class-one-rapids/frontend/App.tsx` - Add loading state if needed

**Acceptance Criteria**:
- [ ] State initializes before rendering
- [ ] Skills array populated before SkillsScreen renders
- [ ] No flash of incomplete data
- [ ] Loading indicators if async initialization required
- [ ] Smooth user experience from app start

**Test Command**: Manual testing on app launch

---

## Phase 13: Documentation

### Task 13.1: Add JSDoc Comments to All Exported Functions
**Status**: pending
**Depends On**: 2.4, 3.3, 4.4
**Description**: Review all exported functions in singularity modules and ensure comprehensive JSDoc comments are present.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityEngine.ts` - Verify JSDoc completeness
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/combinationLogic.ts` - Verify JSDoc completeness
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/skillEngine.ts` - Verify JSDoc completeness
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/skillDefinitions.ts` - Add JSDoc

**Acceptance Criteria**:
- [ ] All exported functions have JSDoc comments
- [ ] JSDoc includes parameter descriptions
- [ ] JSDoc includes return value descriptions
- [ ] JSDoc includes usage examples where helpful
- [ ] Complex types have descriptive comments

**Test Command**: `npx tsc --noEmit`

---

### Task 13.2: Document Complex Algorithms
**Status**: pending
**Depends On**: 13.1
**Description**: Add detailed comments explaining complex algorithms like singularity tick processing and probabilistic mechanics.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityEngine.ts` - Add algorithm explanations

**Acceptance Criteria**:
- [ ] processSingularityTick algorithm explained
- [ ] Probability calculation logic documented
- [ ] Multi-tier rate calculations explained
- [ ] Comments explain "why" not just "what"
- [ ] Future maintainers can understand the logic

**Test Command**: Code review

---

### Task 13.3: Add Inline Comments for Unclear Logic
**Status**: pending
**Depends On**: 13.2
**Description**: Review all singularity code and add inline comments where logic may be unclear to future developers.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/singularityEngine.ts` - Add inline comments
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/skillEngine.ts` - Add inline comments
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/components/PaintingCanvas.tsx` - Add inline comments

**Acceptance Criteria**:
- [ ] Tricky logic has explanatory comments
- [ ] Magic numbers explained
- [ ] Edge cases documented
- [ ] Performance optimizations explained
- [ ] Code is self-documenting where possible

**Test Command**: Code review

---

### Task 13.4: Update README or Add Module Documentation
**Status**: pending
**Depends On**: 13.3
**Description**: Create or update documentation explaining the singularity system architecture and how to extend it.

**Files to Create/Modify**:
- `/mnt/c/dev/class-one-rapids/frontend/modules/singularity/README.md` - Create module README (optional, only if helpful)

**Acceptance Criteria**:
- [ ] Singularity system overview documented
- [ ] File structure explained
- [ ] How to add new skills documented
- [ ] How to add new pet tiers documented (if extensible)
- [ ] Configuration tuning guide referenced
- [ ] Only create if it adds value beyond TDD

**Test Command**: Documentation review

---

## Summary

**Total Tasks**: 67 tasks across 13 phases
**Estimated Effort**: 40-50 hours total
**Methodology**: Test-Driven Development (TDD) - Red, Green, Refactor

**Key Dependencies**:
- Phase 1 (Types) must complete before Phase 2-5
- Phase 2-4 (Core Logic) can proceed in parallel after Phase 1
- Phase 5 (State) depends on Phase 1 and uses Phase 2-4
- Phase 6-9 (UI) depend on Phase 5 and core logic
- Phase 10 (Shop) can proceed after Phase 1 and Phase 5
- Phase 11 (Integration) depends on all implementation phases
- Phase 12-13 (Polish/Docs) depend on implementation phases

**Testing Guidelines**:
- Use cmd.exe for running Jest tests (per CLAUDE.md)
- Test hooks through components, not standalone
- Follow TDD: Write tests first, implement to pass, then refactor
- Maintain ≥90% code coverage for business logic
- Integration tests verify end-to-end flows

**File Paths**:
All file paths in this task list are absolute paths starting from `/mnt/c/dev/class-one-rapids/`.
