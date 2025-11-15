---
description: "Execute tasks from task list using Test-Driven Development (TDD) methodology"
argument-hint: "<task-list-file-path via stdin> [task-id|phase-name]"
allowed-tools: "TodoWrite, Read, Write, MultiEdit, Edit, Bash(npm:*), Bash(npx:*), Bash(node:*), Bash(git status:*), Bash(git diff:*), Grep, Glob, Task"
---

# TDD Task Executor Agent

The task list file path is $ARGUMENTS.

---

## 🚨 IMMEDIATE ACTION REQUIRED: CODE GENERATION

**YOU MUST NOW GENERATE CODE** for all tasks in the task list. This is NOT an analysis or planning phase - this is the EXECUTION phase where you write tests and implementation code.

**Your mission**:
1. ✅ **Write actual test files** using Write/Edit tools
2. ✅ **Write actual implementation files** (components, hooks, stores, utilities)
3. ✅ **Run tests** using Bash to verify they pass
4. ✅ **Continue until ALL tasks are completed** or you hit a blocker

**DO NOT STOP after reading the task list.** Reading and planning are just the first steps - you must proceed to actual code generation.

---

## Initial Validation Process

Before beginning code generation:

1. Read the file to get the task list file path
2. Validate the file path is not empty
3. Check if file exists
4. Load task list contents using Read tool

### Step 2: Load and Validate Task List Contents

ONLY proceed if validation passes:

1. Use Read tool to load task list file contents
2. Verify task list contains valid tasks
3. Parse tasks and phases

**CRITICAL**: Never start task execution if ANY validation step fails. Report errors clearly and exit.

### Step 3: Codebase Exploration & Integration Planning

**CRITICAL**: Before writing ANY code, understand the existing codebase and plan integration.

1. **Explore Existing Code**:
   - Use Glob/Grep to find components/screens mentioned in task
   - Example: Task mentions "ShopScreen" → Search: `Glob **/*Shop*.tsx`
   - Read existing files to understand current implementation
   - Identify integration points (App.tsx, navigation, existing screens)

2. **Architectural Decision**:
   For EACH component/feature in the task, decide:

   **Decision Tree**:
   ```
   Does component with this name/purpose already exist?
   ├─ YES → Should I update existing or create new?
   │   ├─ Same purpose → UPDATE existing component
   │   │   └─ Document: "UPDATING: modules/shop/ShopScreen.tsx (adding upgrade functionality)"
   │   └─ Different purpose → CREATE new with distinct name
   │       └─ Document: "CREATING: modules/upgrades/UpgradeManagementScreen.tsx (distinct from shop)"
   │
   └─ NO → Where should new component live?
       ├─ Task spec location (modules/upgrades/) if it's primary owner
       ├─ Related module (modules/shop/) if it extends existing feature
       └─ Shared location if used across features
   ```

3. **Integration Plan Document**:
   Before writing code, create mental model:
   ```
   INTEGRATION PLAN:
   ✓ Explored: modules/shop/ShopScreen.tsx exists (currently shows empty state)
   ✓ Analyzed: App.tsx imports from modules/shop/ShopScreen.tsx
   ✓ Decision: UPDATE existing ShopScreen to show upgrades
   ✓ Location: modules/shop/ShopScreen.tsx (owns shop UI)
   ✓ New files: modules/upgrades/components/UpgradeCard.tsx (reusable component)
   ✓ Rationale: Shop screen is the integration point, upgrades are feature components
   ```

4. **Validation**:
   - Verify integration points are wired correctly
   - Confirm component will be visible to user (not orphaned)
   - Check module boundaries make architectural sense

5. **Default Location Fallback**:
   - If no existing integration point found, extract module directory from task file path
   - Task file location: `<module-path>/specs/<task-file>.md`
   - Default implementation directory: `<module-path>/` (parent of specs folder)
   - But ALWAYS prefer architectural fit over task file location

---

## 📚 MANDATORY ARCHITECTURE GUIDES

**Read and follow these guides before ANY implementation**:

1. **Lean Development**: @docs/architecture/lean-task-generation-guide.md

   - Prioritize user-visible features
   - Create infrastructure only when needed
   - Just-in-time everything


2. **File Organization**: @docs/architecture/file-organization-patterns.md

   - Co-located tests (NO `__tests__` folders)
   - NO barrel exports (index.ts files)
   - Component structure patterns

3. **Working Directory Context**: @docs/architecture/working-directory-context.md

   - You are in `c:\dev\class-one-rapids\frontend\`
   - NEVER create `frontend/frontend/` nested structures
   - Path rules and conventions

4. **State Management**: @docs/architecture/state-management-hooks-guide.md

   - Hook-based architecture
   - When to use useState vs custom hooks vs Legend-State stores
   - Fine-grained reactivity patterns
   - **Effect hooks**: See §🔄 Advanced Hook Patterns - Effect Hooks Pattern (lines 759-830)

5. **Legend-State Implementation**: @docs/research/expo_legend_state_v3_guide_20250917_225656.md
   - Legend-State v3 patterns
   - Observable primitives
   - React integration

---

## 🚀 QUICK DECISION TREE

### State Management (see @docs/architecture/state-management-hooks-guide.md for details)

**Decision Flow**:

1. Is state used by only ONE component? → `useState` in component
2. Is logic complex but single-feature? → Custom hook (`useFeatureName.ts`)
3. Is state shared across features? → Legend-State store (`featureStore.ts`) + hook

**Red Flags for Legend-State**:

- Multiple components need the same state
- Callbacks passed through 2+ component levels
- You're typing `createContext` or `useContext`

**NEVER Use**:

- ❌ React Context API for state (use Legend-State)
- ❌ Service classes (use hooks)
- ❌ Redux, MobX (use Legend-State)

### Testing (TDD Methodology)

- ✅ Write test FIRST (RED)
- ✅ Implement minimal code (GREEN)
- ✅ Refactor with tests passing (REFACTOR)

**Test Execution Environment**:

- ⚠️ **Use cmd.exe to run jest tests** due to performance issues with WSL and Windows
- Example: `cmd.exe /c "cd /d C:\path\to\frontend && node node_modules/jest/bin/jest.js test-file.test.ts"`

## Phase 1: Initialize Execution Context

**FIRST, SET UP YOUR EXECUTION ENVIRONMENT:**

1. **Read Task List**: Load and parse the task list from the file path received via stdin (validated in Step 1-2 above)
2. **Determine Implementation Directory**: Extract module directory from task file path (validated in Step 3 above)
   - Parse the task file path to find the parent of `specs/` folder
   - This is WHERE ALL implementation files will be created
   - Example: `modules/attack-button/specs/tasks.md` → implement in `modules/attack-button/`
3. **Check Task Status**: Look for [COMPLETED] or [PARTIAL] prefixes in task titles
4. **Identify Target**: Determine which tasks to execute (all tasks from the list)
5. **Skip Completed Tasks**: Tasks marked [COMPLETED] should be skipped
6. **Validate Prerequisites**: Check that required tools, dependencies, and environment are ready
7. **USE TodoWrite tool NOW**: Create todo items for each task from the task list
   - Set all tasks to "pending" status initially
   - You will update these to "in_progress" and "completed" as you work

## Phase 1.5: MANDATORY Codebase Exploration with Subagent

**CRITICAL**: You CANNOT proceed to Phase 3 (code generation) without completing this exploration.

**Why This Matters**:
- Prevents creating duplicate components (e.g., modules/upgrades/ShopScreen.tsx when modules/shop/ShopScreen.tsx exists)
- Ensures correct property names (e.g., scrap vs scrapCount)
- Identifies integration points (App.tsx, navigation)
- Determines UPDATE vs CREATE decisions

**STEP 1: Extract Components from Task List**

From the task list, identify all components/screens/hooks/stores to be implemented:
```
Example from task list:
- Components: ShopScreen, UpgradeCard, ClickerScreen
- Hooks: useShopActions, useUpgradeEffects
- Stores: shopStore, scrapStore
```

**STEP 2: Launch Explore Subagent**

Use the Task tool to launch an Explore subagent:

```typescript
Task({
  subagent_type: "Explore",
  description: "Explore codebase architecture",
  model: "haiku", // Fast and cost-effective
  prompt: `
I'm about to implement these components from the task list:
${componentListFromTasks}

**MISSION**: Comprehensive codebase exploration to prevent duplicates and ensure correct integration.

**THOROUGHNESS**: very thorough

**FOR EACH COMPONENT, SEARCH**:

1. **Global Search** (find existing implementations):
   - Glob **/*{ComponentName}*.tsx
   - Glob **/*{component-name}*.tsx
   - Glob **/*{ComponentName}*.ts

2. **If Found**:
   - Read file to understand purpose
   - Note current implementation state
   - Identify if this is THE component or a different one

3. **Integration Discovery**:
   - Read App.tsx (or app/_layout.tsx)
   - Grep "import.*{ComponentName}"
   - Map navigation structure

4. **Store Property Verification**:
   - For each store: Glob **/${storeName}.store.ts
   - Read store file
   - List EXACT property names (critical for Legend-State)

**RETURN FORMAT**:

## EXPLORATION RESULTS

### Components Found
${componentName}:
- Exists: YES at modules/shop/ShopScreen.tsx
- Purpose: Main shop UI (currently shows empty state)
- Integration: App.tsx line 9 imports this
- Decision: UPDATE this file (shop module owns shop UI)

OR

- Exists: NO
- Decision: CREATE at modules/upgrades/UpgradeCard.tsx
- Rationale: New reusable component, belongs in upgrades module

### Store Properties (EXACT)
scrapStore (modules/scrap/stores/scrap.store.ts):
- scrap: Observable<number> (line 25) ✅
- lastTickTime: number (line 32) ✅

shopStore (modules/shop/stores/shop.store.ts):
- availableUpgrades: Observable<Upgrade[]> (line 34) ✅
- purchasedUpgrades: Observable<string[]> (line 37) ✅

### Integration Map
App.tsx:
- Current screens: ClickerScreen (default), ShopScreen (via navigation)
- Navigation: onNavigateToShop callback pattern
- ShopScreen imported from: modules/shop/ShopScreen

### Conflicts/Risks
- ⚠️ ShopScreen exists in modules/shop/ AND tasks want to create in modules/upgrades/
  → RESOLUTION: Update existing modules/shop/ShopScreen.tsx

## CRITICAL QUESTIONS ANSWERED
- Are there duplicate/similar components that would conflict?
- Which module owns shop UI? (creates vs displays)
- Will new components be accessible to users (wired to navigation)?
`
})
```

**STEP 3: Document Exploration Decisions**

After subagent returns, create your integration plan:

```markdown
## 🔍 INTEGRATION PLAN (from Explore subagent)

### Files to UPDATE (existing):
✏️ modules/shop/ShopScreen.tsx
   - Current: Shows empty state
   - Change: Add upgrade list display
   - Reason: Shop module owns shop UI, wired to App.tsx

✏️ modules/attack-button/ClickerScreen.tsx
   - Current: Has Feed button
   - Change: Integrate upgrade effects
   - Reason: Feed button needs bonus calculation

### Files to CREATE (new):
✨ modules/upgrades/components/UpgradeCard.tsx
   - Reason: Reusable upgrade display component

✨ modules/upgrades/hooks/useUpgradeEffects.ts
   - Reason: New business logic for upgrade bonuses

### Store Properties (VERIFIED):
✅ scrapStore.scrap (NOT scrapCount)
✅ shopStore.availableUpgrades
✅ shopStore.purchasedUpgrades

### Integration Verified:
✅ ShopScreen accessible via ClickerScreen → onNavigateToShop → ShopScreen
✅ Navigation pattern exists and functional
```

**STEP 4: Validate Before Proceeding**

Before writing ANY code, verify:
- [ ] Every component has clear UPDATE vs CREATE decision
- [ ] No duplicate file paths
- [ ] Store property names are exact (from file reads, not guessed)
- [ ] Integration points are wired and functional
- [ ] Module ownership is clear (who owns what)

**RED FLAG - STOP IMMEDIATELY IF**:
- ❌ Subagent couldn't find clear answer for any component
- ❌ Multiple components with same name found (conflict)
- ❌ Store property names uncertain
- ❌ Integration points not wired (orphaned components)

**STEP 5: Use This Plan Throughout Execution**

When implementing each task:
- Refer to Integration Plan for decisions
- Use exact file paths from exploration
- Use exact property names from verification
- Update existing files when plan says UPDATE
- Create new files only when plan says CREATE

## Phase 2: Task Analysis & Planning

For the identified tasks:

1. **Extract Task Requirements**:

   - Task ID and description
   - Dependencies and prerequisites
   - Acceptance criteria
   - Test requirements
   - Deliverables

2. **Determine Execution Order**:

   - Resolve dependency graph
   - Identify parallelizable tasks
   - Create execution sequence

3. **Prepare Test Strategy**:

   - Identify test categories needed (unit, integration, e2e)
   - Determine testing tools and frameworks
   - Plan test file structure (co-located per @docs/architecture/file-organization-patterns.md)

4. **State Management Planning**:
   - Consult @docs/architecture/state-management-hooks-guide.md for architecture patterns
   - Determine if feature needs useState, custom hook, or Legend-State store
   - Plan hook structure and observable returns

## Phase 3: Test-Driven Development Execution

**YOU ARE NOW IN THE CODE GENERATION PHASE.** For each task, you will write actual files and run actual tests.

**MANDATORY Pre-Task Validation (BEFORE writing any code)**:

For EACH task, before starting implementation:

0. **Architecture Alignment Check** (NEW - MUST DO FIRST):
   ```
   For EACH file the task wants you to create:

   1. Search for existing files with same/similar name:
      - Glob: `**/*{ComponentName}*.{ts,tsx}`

   2. If found, decide:
      - Same purpose? → UPDATE existing, don't create new
      - Different purpose? → Use distinct name or different location
      - Integration point? → Code should live where it integrates

   3. Module ownership question:
      - Who owns this UI/feature?
      - Should this be in task's module or existing module?
      - Example: Upgrade display in shop → modules/shop/ owns it
                Upgrade calculation logic → modules/upgrades/ owns it

   4. Document decision:
      "DECISION: Updating modules/shop/ShopScreen.tsx instead of creating
       modules/upgrades/ShopScreen.tsx because shop module owns shop UI"
   ```

1. **Dependency Validation**:
   ```
   BEFORE implementing [feature that needs X]:
   - Use Read tool to check if X exists
   - Verify X is functional (not just present)
   - Examples:
     - Navigation task? Read App.tsx to verify navigation framework exists
     - Purchase task? Read store files to verify scrap store is functional
     - Integration task? Read both integration points
   ```

2. **Architectural Assumptions Check**:
   ```
   BEFORE assuming infrastructure exists:
   - Read the actual files mentioned in task description
   - Verify they have the structure/exports the task assumes
   - If task says "use existing X", verify X exists and works as described
   ```

3. **Just-In-Time Creation Decision**:
   ```
   IF dependency doesn't exist AND feature requires it:
   - Document: "CREATING JUST-IN-TIME: [dependency name]"
   - Add implementation of dependency to current task
   - Update deliverables to note infrastructure created
   - Verify it in functional test

   IF dependency doesn't exist AND feature can work without it:
   - Document: "SKIPPING OPTIONAL: [dependency name]"
   - Add TODO comment for future enhancement
   - Proceed with simplified implementation
   ```

**RED FLAG - STOP IMMEDIATELY IF**:
- Task assumes infrastructure that doesn't exist
- Task describes integration with non-existent systems
- You discover missing dependencies mid-implementation

**CORRECT ACTION**:
- Document the gap clearly
- Ask user or update task to create dependency first
- Never claim task is complete with broken integration

Then proceed to Pre-execution Check below:

**Pre-execution Check**: For each task, verify it's not already implemented:

1. **Global Duplicate Check** (CRITICAL):
   - Use Glob to search ENTIRE codebase for components/screens with same name
   - Example: Before creating `ShopScreen.tsx`, run `Glob **/*ShopScreen.tsx`
   - If duplicates found, STOP and analyze:
     - Is the existing component in a different module?
     - Should we UPDATE the existing component instead of creating new one?
     - Is there a naming conflict that needs resolution?
   - Document decision: "UPDATING EXISTING: modules/shop/ShopScreen.tsx" or "CREATING NEW: modules/upgrades/ShopScreen.tsx (distinct from shop screen)"

2. **Module-Specific Check**:
   Follow @docs/architecture/file-organization-patterns.md for locating files within target module. Use appropriate search tools (Glob, Grep) to check for:
   - Existing components, hooks, and utilities
   - Co-located test files
   - Existing state management (stores, hooks)
   - Anti-patterns (Context API usage, service classes, barrel exports)

**CRITICAL: Pre-execution Property Validation**

Before implementing ANY feature that reads from or writes to existing stores:

1. **USE Read tool to read the store file first**
   - Never assume or guess property names
   - Example: Read `scrap.store.ts` before using scrapStore
2. **Document the exact observable property names**
   - Example: Store defines `scrap` NOT `scrapCount`
   - Copy the exact property names from the file
3. **Use those exact names in implementation AND tests**
   - Both implementation and tests must use the same names as the store
4. **Verify in integration test with real store**
   - Don't mock the store in your first test
   - Test will fail immediately if property names don't match

**RED FLAG - STOP IMMEDIATELY IF**:
- You're guessing property names without reading the file
- You haven't used Read tool on the store file
- Your test uses different property names than the store defines
- You're creating new properties on a store (e.g., `store.newProp.set()` when store doesn't define `newProp`)

**Example of CORRECT validation**:
```typescript
// 1. Read scrap.store.ts first - see it defines: scrap: persist({...})
// 2. Use exact property name in implementation:
const currentScrap = scrapStore.scrap.get()  // ✅ Matches store
// 3. Use exact property name in test:
scrapStore.scrap.set(150)  // ✅ Matches store
```

**Example of WRONG approach (causes bugs)**:
```typescript
// ❌ Never read scrap.store.ts, guessed "scrapCount"
const currentScrap = scrapStore.scrapCount.get()  // Creates new property!
scrapStore.scrapCount.set(150)  // Test passes but feature broken
```

**Pre-implementation State Management Check** (see @docs/architecture/state-management-hooks-guide.md):

1. Will this state be accessed by multiple components/features?

   - YES → Legend-State store + hook (see state-management-hooks-guide.md §🏪 Private Store Implementation)
   - NO → Continue to step 2

2. Is the logic complex but single-feature?

   - YES → Custom hook (see state-management-hooks-guide.md §🪝 Hook Implementation)
   - NO → `useState` in component

3. Check for existing state management:
   - Look for Legend-State stores (`*.store.ts` files per @docs/architecture/file-organization-patterns.md)
   - Look for custom hooks (`use*.ts` files)
   - Reuse existing patterns before creating new ones

**NOW EXECUTE EACH TASK** in the sequence using the TDD cycle below:

**BEFORE STARTING EACH TASK:**
- **USE TodoWrite tool** to mark the task as "in_progress"
- Only ONE task should be "in_progress" at a time

### Step 1: RED - Write Failing Tests First

**CRITICAL**: Always write tests BEFORE implementation

**Hook Testing Strategy** (MANDATORY - per CLAUDE.md):

⚠️ **DO NOT create standalone hook test files** (e.g., `useFeature.test.ts`)

The guideline in CLAUDE.md states: "Don't make tests just for hooks, they should be tested through the component that uses them"

**Why This Rule Exists**:
- Standalone hook tests can use wrong property names in BOTH test and implementation
- Legend-State observables allow dynamic property creation: `store.wrongName.set(10)` creates a new property
- Tests pass because they're consistently wrong (both use `wrongName`)
- Real app breaks because actual store uses different property name (`rightName`)
- Component tests force integration with REAL stores, catching property name mismatches immediately

**Testing Hierarchy**:
1. ✅ **PRIMARY: Test hooks through components** - `FeatureScreen.test.tsx` tests `useFeature()` indirectly
2. ✅ **SECONDARY: Integration tests** - Multiple components using same store
3. ❌ **NEVER: Isolated hook tests** - `useFeature.test.ts` testing hook alone

**Example of BUG (what happened with scrapCount vs scrap)**:
```typescript
// ❌ BAD: Standalone hook test - BUG HIDDEN
// useShopActions.test.ts
beforeEach(() => {
  scrapStore.scrapCount.set(0)  // Creates NEW property (wrong name)
})
test('can afford upgrade', () => {
  scrapStore.scrapCount.set(150)  // Uses wrong property
  const { result } = renderHook(() => useShopActions())
  expect(result.current.canAfford(upgrade)).toBe(true)  // ✅ Passes!
})

// useShopActions.ts implementation
const canAfford = () => scrapStore.scrapCount.get() >= cost  // Wrong property

// RESULT: Test passes, but real app broken because actual store uses "scrap"
```

**Example of CORRECT approach**:
```typescript
// ✅ GOOD: Test through component using REAL store
// ShopScreen.test.tsx
beforeEach(() => {
  scrapStore.scrap.set(0)  // MUST use real property (from store file)
})
test('purchase button enabled when affordable', () => {
  scrapStore.scrap.set(150)  // Real property
  render(<ShopScreen />)  // Component uses useShopActions hook
  expect(screen.getByTestId('purchase-button').props.disabled).toBe(false)
})

// If implementation uses wrong property, test FAILS immediately:
// "Cannot read property 'get' of undefined" because scrapCount doesn't exist
```

**Test Structure**:
```typescript
// Example test structure based on React Native Testing Library guide
describe("[ComponentName]", () => {
  test("should [specific behavior from requirement]", async () => {
    // Test ONE specific behavior
    // Test MUST fail initially (component doesn't exist)
    // Use user-centric queries (getByText, getByRole, etc.)
    // Use REAL stores with VERIFIED property names (read store files first!)
  });
});
```

**YOU MUST NOW:**

1. **USE Read tool to read any store files** the feature depends on
2. **Document exact property names** from those stores
3. **USE Write tool** to create the test file in the appropriate location
   - For hooks: Test through component (e.g., `ComponentScreen.test.tsx`)
   - Use real stores with verified property names
4. **Write the test code** for the FIRST requirement only
5. **USE Bash tool** to run the test and confirm it fails with expected error
   - **IMPORTANT**: Use cmd.exe to run jest tests for better performance on Windows/WSL
   - Example: `cmd.exe /c "cd /d C:\dev\cor-worktrees\upgrade-factory\frontend && node node_modules/jest/bin/jest.js modules/path/to/test.test.ts"`
6. Only then proceed to GREEN phase

### Step 2: GREEN - Write Minimal Code to Pass

**RULE**: Write ONLY enough code to make the test pass

**State Management Priority**:

1. Start with `useState` for component-local state
2. Extract to custom hooks (e.g., `useEnemy()`) when logic gets complex
3. Use Legend-State ONLY when state needs sharing across features
4. NEVER create service classes - use hooks for stateful logic

**YOU MUST NOW:**

1. **USE Write/Edit tool** to create the implementation file (component, hook, store, or utility)
2. **Write minimal code** to make the test pass (prefer hooks over services)
3. **NO extra features** or premature optimization
4. **USE Bash tool** to run the test and confirm it now passes
   - **IMPORTANT**: Use cmd.exe to run jest tests for better performance on Windows/WSL
   - Example: `cmd.exe /c "cd /d C:\dev\cor-worktrees\upgrade-factory\frontend && node node_modules/jest/bin/jest.js modules/path/to/test.test.ts"`
5. Verify all existing tests still pass

### Step 3: REFACTOR - Improve Code Quality

**MAINTAIN**: All tests must remain green during refactoring

**IF REFACTORING IS NEEDED:**

1. **USE Edit tool** to extract constants and improve naming
2. Remove duplication
3. Improve code organization
4. **USE Bash tool** to run tests after each change to ensure they remain green
   - **IMPORTANT**: Use cmd.exe to run jest tests for better performance on Windows/WSL

### Step 4: Iterate for Next Requirement

**CONTINUE THE TDD CYCLE** - Repeat RED-GREEN-REFACTOR for each requirement:

1. **Add new failing test** for next behavior (USE Write/Edit tool)
2. **Implement code** to pass new test (USE Write/Edit tool)
3. **Refactor** if needed (USE Edit tool)
4. **USE Bash tool** to run tests
5. **Continue until ALL requirements have tests and implementation**

## Phase 4: Task Validation & Completion

### Validation Checklist

**AFTER COMPLETING EACH TASK:**
1. **Verify all criteria below are met**
2. **USE TodoWrite tool** to mark the task as "completed"
3. **Immediately move to the next task** (mark it "in_progress")

Before marking any task complete:

**CRITICAL PRE-COMPLETION VALIDATION**:

1. **Functional Integration Test**:
   - Run the actual feature manually or with integration test
   - Verify it works END-TO-END in the actual app context
   - For navigation: verify you can actually navigate, not just that buttons exist
   - For purchases: verify you can actually buy, not just that UI renders
   - **DO NOT** mark complete if feature only works in isolation/unit tests

2. **Dependency Verification**:
   - ALL required dependencies exist and are functional
   - No placeholders or mock implementations in production code
   - Integration points (App.tsx, navigation, stores) are actually wired up

3. **User Experience Validation**:
   - Feature is accessible from actual user flow (not just in tests)
   - User can complete the full workflow described in acceptance criteria
   - No missing wiring or integration steps

**ONLY AFTER** all three validations pass, proceed to test coverage validation below.

1. **Test Coverage Validation**:

   ```bash
   npm test -- --coverage
   ```

   - Coverage > 80% for new code
   - All requirements have corresponding tests
   - Tests document expected behavior clearly

2. **Code Quality Checks**:

   ```bash
   npm run typecheck
   npm run lint
   ```

   - No TypeScript errors
   - No linting violations
   - Code follows project conventions

3. **Acceptance Criteria Verification**:

   - [ ] Each criterion from task list is met
   - [ ] All deliverables are present
   - [ ] Dependencies are properly managed

4. **Documentation**:
   - Tests serve as living documentation
   - Complex logic has inline comments
   - API/Component has usage examples

## Phase 5: Progress Reporting

### Update Task Tracking File

After completing each task:

```yaml
# Update task-tracking.yaml
task_id:
  status: completed # was: not_started
  completed:
    - List of implemented features
  evidence:
    - modules/[feature]/implementation.ts
    - modules/[feature]/implementation.test.ts # Co-located test per @docs/architecture/file-organization-patterns.md
  completed_at: 2025-09-24T10:30:00Z
```

### Progress Tracking with TodoWrite

Maintain real-time task status:

- **pending**: Not started
- **in_progress**: Currently executing (only ONE at a time)
- **completed**: All criteria met and validated

### Execution Report Structure

For each completed task:

```markdown
## Task [ID]: [Name]

✅ Status: Completed
⏱️ Duration: [time]

### Tests Written:

- [Test file 1]: [X] test cases
- [Test file 2]: [Y] test cases

### Implementation:

- [Component/Module 1]
- [Component/Module 2]

### Coverage:

- Statements: X%
- Branches: Y%
- Functions: Z%

### Validation:

- ✅ All tests passing
- ✅ TypeScript check passed
- ✅ Lint check passed
- ✅ Acceptance criteria met
```

## Phase 6: Error Handling & Recovery

### When Tests Fail

1. **Analyze Failure**:

   - Is it a legitimate requirement change?
   - Is the test correctly written?
   - Is the implementation incomplete?

2. **Recovery Actions**:
   - Fix implementation (not the test!)
   - If test is wrong, document why and update
   - Create new task for unresolved issues

### When Blocked

1. **Document Blocker**:

   - What is preventing progress?
   - What information/resources are needed?

2. **Mitigation**:
   - Skip to next independent task
   - Create placeholder/mock for missing dependency
   - Request user intervention if critical

### When Dependencies Don't Exist
Can the feature work without it? If NO, create it. Never make testable-but-broken code:
**Critical Rule**: If a feature **requires** a dependency to function (e.g., "passive generation" needs a game tick), CREATE minimal just-in-time implementation. If it's optional (e.g., analytics), SKIP with TODO. The test is simple: **Can the feature work without it?** If NO, create it. Never implement "testable but non-functional" code - if the requirement says "automatic/passive", the implementation must actually be automatic, not require manual actions that only tests call. Document created infrastructure in deliverables with "CREATED JUST-IN-TIME" note.

## Execution Principles

### TDD Discipline

1. **Never write production code without a failing test**
2. **Write only enough production code to pass the test**
3. **Refactor only when tests are green**
4. **One behavior per test**
5. **Tests are first-class code (maintain them well)**

### Testing Best Practices (from React Native Testing Library)

1. **Query Priority**:

   - getByRole > getByLabelText > getByPlaceholderText > getByText
   - Avoid getByTestId unless absolutely necessary

2. **User Event over FireEvent**:

   ```typescript
   // Good
   const user = userEvent.setup();
   await user.press(button);

   // Avoid
   fireEvent.press(button);
   ```

3. **Async Handling**:

   ```typescript
   // Use waitFor for async operations
   await waitFor(() => {
     expect(screen.getByText("Loaded")).toBeTruthy();
   });
   ```

4. **Test What Users See**:
   - Don't test implementation details
   - Test behavior, not state
   - Test integration, not just units

### Code Generation Guidelines

1. **File Location** (CRITICAL):

   - Files go where they make ARCHITECTURAL SENSE (determined in Phase 1.5)
   - Prefer updating existing components over creating duplicates
   - If extending existing feature → update existing module (e.g., modules/shop/)
   - If new standalone feature → create in task's module (e.g., modules/upgrades/)
   - If reusable components → create in appropriate module based on ownership
   - Example: Task in `modules/upgrades/specs/` wants ShopScreen
     - Found existing: `modules/shop/ShopScreen.tsx`
     - Decision: UPDATE `modules/shop/ShopScreen.tsx` (shop owns UI)
     - Also CREATE: `modules/upgrades/components/UpgradeCard.tsx` (upgrades own component)

2. **Follow Existing Patterns**:

   - Check neighboring files for conventions
   - Use existing utilities and helpers
   - Match code style (indentation, naming, etc.)

3. **Component Structure**: See @docs/architecture/file-organization-patterns.md

   - Co-located tests (NO `__tests__` folders)
   - File naming conventions
   - Module organization

4. **State Management Files**: See @docs/architecture/state-management-hooks-guide.md

   - `featureStore.ts` - For cross-feature shared state
   - `useFeature.ts` - For complex single-feature logic
   - `useState` in component - For simple component-local state

5. **Test Placement**: Per @docs/architecture/file-organization-patterns.md
   - Tests ALWAYS go next to the file they test
   - Use `.test.ts` or `.test.tsx` extension
   - No separate `__tests__` folders
   - Import from same directory: `import { Component } from './Component'`

## Task Types & Strategies

### Frontend Component Tasks

1. Start with render tests
2. Add user interaction tests
3. Test state management
4. Test edge cases (loading, error, empty)

### API/Backend Tasks

1. Start with happy path tests
2. Add validation tests
3. Test error scenarios
4. Test edge cases and limits

### Infrastructure Tasks

1. Start with configuration validation
2. Test deployment scripts
3. Verify monitoring/alerting
4. Test rollback procedures

### Data Model Tasks

1. Start with schema validation tests
2. Test CRUD operations
3. Test relationships and constraints
4. Test migrations

## Success Metrics

Task execution is successful when:

1. ✅ All tests written before implementation
2. ✅ Test coverage > 80% for new code
3. ✅ All acceptance criteria validated
4. ✅ No regressions in existing tests
5. ✅ Code quality checks pass
6. ✅ Task marked complete in tracking

## Continuous Execution

**YOU MUST CONTINUE EXECUTING** until all tasks are complete or you hit a blocker:

1. **Execute tasks** in dependency order
2. **Validate each task** before moving to next
3. **Report progress** in real-time using TodoWrite
4. **Handle errors** gracefully - fix or document blockers
5. **Complete ALL tasks** in target scope

**DO NOT STOP** after setup or planning phases. The goal is WORKING CODE with PASSING TESTS.

## Final Output

Upon completion, provide:

1. Summary of all completed tasks
2. Test coverage report
3. Any blockers or issues encountered
4. Recommendations for next steps
5. Location of all generated code and tests

Remember: **Test-Driven Development is a discipline**. The temporary discomfort of writing tests first pays dividends in code quality, maintainability, and confidence.
