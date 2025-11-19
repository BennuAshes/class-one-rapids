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

## 🎯 CRITICAL SUCCESS CRITERIA

**YOU MUST COMPLETE ALL TASKS** - There is NO time limit, NO token budget concern, NO complexity excuse to stop early.

**COMPLETION REQUIREMENTS**:
- ✅ **Execute ALL tasks** in the task list sequentially
- ✅ **Complete ALL phases** (Phase 1, 2, 3, 4, 5, etc.)
- ✅ **Implement ALL components** mentioned in the task list
- ✅ **Run ALL tests** and ensure they pass
- ❌ **DO NOT STOP** after completing only some phases

**VALID REASONS TO STOP** (only these):
- ✅ Actual technical blocker (missing external API, user input required for ambiguous requirement)
- ✅ External dependency doesn't exist and cannot be created
- ✅ Explicit user request to stop

**INVALID REASONS TO STOP** (keep working):
- ❌ "Time constraints" - **there is NO time limit**
- ❌ "Token budget concerns" - you have 200k tokens available, use them
- ❌ "Complexity" - break complex tasks into smaller steps
- ❌ "Remaining work is UI only" - UI implementation is REQUIRED
- ❌ "Core functionality complete" - ALL tasks must be complete, not just core

**If you find yourself wanting to stop early, ask**:
1. Have I completed ALL tasks in the task list? If NO → CONTINUE
2. Is there an actual technical blocker? If NO → CONTINUE
3. Has the user explicitly asked me to stop? If NO → CONTINUE

**TASK LIST FILE TRACKING (MANDATORY)**:

The task list file contains a "📋 TASK COMPLETION TRACKING" section that you MUST keep updated:

1. **When starting a task**: Use Edit tool to check `[x]` the "🔄 In Progress" box
2. **When completing a task**: Use Edit tool to check `[x]` the "✅ Completed" box
3. **After each completion**: Update the progress counter (e.g., "Progress: 5/23 tasks completed (22%)")

**This serves as**:
- Visual progress indicator for user
- Audit trail of what was actually completed
- State persistence if execution is interrupted
- Forcing function to prevent skipping tasks

**Example Task List Tracking Update**:
```markdown
### Phase 1: Data Layer
- [x] 🔄 Task 1.1: Create type definitions - [x] ✅ Completed
- [x] 🔄 Task 1.2: Create upgrade catalog - [ ] ✅ Completed  ← Currently working on this
- [ ] 🔄 Task 1.3: Create persistence layer - [ ] ✅ Completed

**Progress**: 1/23 tasks completed (4%)
```

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
   - Example: Task mentions "TodoListScreen" → Search: `Glob **/*TodoList*.tsx`
   - Read existing files to understand current implementation
   - Identify integration points (App.tsx, navigation, existing screens)

2. **Architectural Decision**:
   For EACH component/feature in the task, decide:

   **Decision Tree**:
   ```
   Does component with this name/purpose already exist?
   ├─ YES → Should I update existing or create new?
   │   ├─ Same purpose → UPDATE existing component
   │   │   └─ Document: "UPDATING: modules/todo/TodoListScreen.tsx (adding filtering functionality)"
   │   └─ Different purpose → CREATE new with distinct name
   │       └─ Document: "CREATING: modules/todo/TodoManagementScreen.tsx (distinct from list)"
   │
   └─ NO → Where should new component live?
       ├─ Task spec location (modules/todo/) if it's primary owner
       ├─ Related module (modules/filters/) if it extends existing feature
       └─ Shared location if used across features
   ```

3. **Integration Plan Document**:
   Before writing code, create mental model:
   ```
   INTEGRATION PLAN:
   ✓ Explored: modules/todo/TodoListScreen.tsx exists (currently shows empty state)
   ✓ Analyzed: App.tsx imports from modules/todo/TodoListScreen.tsx
   ✓ Decision: UPDATE existing TodoListScreen to show items
   ✓ Location: modules/todo/TodoListScreen.tsx (owns list UI)
   ✓ New files: modules/todo/components/TodoCard.tsx (reusable component)
   ✓ Rationale: Todo list screen is the integration point, todo items are feature components
   ```

   **Integration Simplicity Check**:
   - Does the original feature request mention navigation/multiple screens?
   - NO → Use MINIMAL integration (direct mount in App.tsx, no new screens)
   - YES → Plan full navigation integration

   Example:
   - Request: "button and counter" → Mount SingularityPet directly in App.tsx
   - Request: "todo list screen with filters" → Create screen + navigation

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
   - **Effect hooks**: See §🔄 Advanced Hook Patterns - Effect Hooks Pattern

5. **Legend-State Sync & Persistence**: @docs/architecture/legend-state-sync.md
   - Observable basics: `observable()`, `computed()`, `.set()`, `.get()`
   - Manual persistence patterns with AsyncStorage
   - Debouncing saves with `onChange()` listeners

6. **React Native UI Guidelines**: @docs/architecture/react-native-ui-guidelines.md
   - **CRITICAL**: Use SafeAreaView from 'react-native-safe-area-context', NOT from 'react-native'
   - Component selection (Pressable over TouchableOpacity)
   - Accessibility requirements (44pt touch targets)
   - Layout component decision tree

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
2. **Locate Completion Tracking Section**: Find the "📋 TASK COMPLETION TRACKING" section at the top of the task list file
3. **Determine Implementation Directory**: Extract module directory from task file path (validated in Step 3 above)
   - Parse the task file path to find the parent of `specs/` folder
   - This is WHERE ALL implementation files will be created
   - Example: `modules/todo/specs/tasks.md` → implement in `modules/todo/`
4. **Check Task Status**: Look for checked boxes in the completion tracking section AND [COMPLETED] or [PARTIAL] prefixes in task titles
5. **Identify Target**: Determine which tasks to execute (all unchecked tasks from the list)
6. **Skip Completed Tasks**: Tasks with ✅ Completed box checked OR marked [COMPLETED] should be skipped
7. **Validate Prerequisites**: Check that required tools, dependencies, and environment are ready
8. **USE TodoWrite tool NOW**: Create todo items for each task from the task list
   - Set all tasks to "pending" status initially
   - You will update these to "in_progress" and "completed" as you work

## Phase 1.5: Read Architecture Decisions from Task List

**CRITICAL**: The task list contains a summary of TDD Section 2 "Codebase Exploration & Integration Analysis" in its header. This section contains all architectural decisions made during the design phase.

**What the Task List Header Contains** (from TDD Section 2):
- **Architecture Decisions Summary**: UPDATE vs CREATE for each component
- **File Paths**: Exact paths for all components
- **Store Properties**: Verified property names from store files
- **Integration Points**: How components wire together
- **Module Ownership**: Which module owns which features

**STEP 1: Extract Architecture Decisions from Task List Header**

The task list should have a section like:

```markdown
## 🔍 Architecture Decisions (from TDD Section 2)

Based on codebase exploration in TDD:
- UPDATE: modules/todo/TodoListScreen.tsx (todo module owns list UI)
- CREATE: modules/todo/components/TodoCard.tsx (new component)
- CREATE: modules/todo/hooks/useTodoActions.ts (new logic)

Store Properties (verified in TDD):
- todoStore.items (NOT itemList)
- todoStore.completed
- todoStore.active
```

**STEP 2: Use These Decisions Throughout Execution**

When implementing each task:
- **Trust the architectural decisions** from TDD Section 2
- Use exact file paths specified
- Use exact property names from verified stores
- UPDATE existing files when specified
- CREATE new files only when specified

**STEP 3: Light Validation Only (Optional)**

If you want to double-check before implementing:
- Read the file mentioned (e.g., verify `modules/todo/TodoListScreen.tsx` exists)
- Verify basic structure matches expectations
- **DO NOT** run full exploration or duplicate the design phase work

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

**Pre-Task Validation (REQUIRED BEFORE writing any code)**:

For EACH task, you MUST complete these validation steps before starting implementation:

**1. Trust TDD Section 2 Architectural Decisions**:
   - Task list header contains UPDATE vs CREATE decisions from TDD Section 2
   - Use the file paths and decisions specified
   - **DO NOT** re-search for duplicates or re-make architectural decisions
   - Those decisions were made during design phase with comprehensive exploration

**2. Dependency Check**:
   - If task mentions updating an existing file, verify it exists:
     - Example: `Read modules/todo/TodoListScreen.tsx` to confirm it exists
   - If file doesn't exist when it should, flag for user review
   - Check file existence only, not full analysis

**3. Just-In-Time Creation for Missing Dependencies**:
   ```
   IF task requires dependency that doesn't exist:
   - Document: "CREATING JUST-IN-TIME: [dependency name]"
   - Add implementation to current task
   - Update deliverables to note infrastructure created

   IF dependency is optional:
   - Document: "SKIPPING OPTIONAL: [dependency name]"
   - Add TODO comment for future enhancement
   ```

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
// 1. Read todo.store.ts first - see it defines: items: persist({...})
// 2. Use exact property name in implementation:
const currentItems = todoStore.items.get()  // ✅ Matches store
// 3. Use exact property name in test:
todoStore.items.set([...])  // ✅ Matches store
```

**Example of WRONG approach (causes bugs)**:
```typescript
// ❌ Never read todo.store.ts, guessed "itemList"
const currentItems = todoStore.itemList.get()  // Creates new property!
todoStore.itemList.set([...])  // Test passes but feature broken
```

**CRITICAL: Pre-execution Persistence Pattern Validation**

Before implementing ANY feature that persists data (AsyncStorage, database, files):

1. **USE Read tool to find existing persistence patterns**
   - Search for `persist({` or `AsyncStorage` in codebase
   - Example: `Grep "persist\(" --glob="**/*.ts" --glob="**/*.tsx"`
   - Example: Read `usePersistedCounter.ts` to see the pattern

2. **Document the persistence mechanism discovered**
   - Example: "Uses Legend-State persist() with AsyncStorage"
   - Example: "Uses custom useEffect + AsyncStorage.setItem"
   - Example: "Uses Legend-State syncObservable pattern"

3. **Copy the existing pattern exactly**
   - Don't invent new persistence approaches
   - Use the same API (persist() vs manual setItem)
   - Use the same debounce/batching strategy
   - Match the storage key naming convention

4. **Test persistence by LOAD, not by SAVE mock call checks**
   - If "loads persisted data on mount" test passes → persistence works
   - Don't add flaky "waitFor AsyncStorage.setItem called" tests
   - See "CRITICAL: Persistence Testing Exception" section above for details

**Example of finding and copying persistence pattern**:
```bash
# Step 1: Search for existing persistence
Grep "persist\(" modules/todo/

# Found: usePersistedTodos.ts uses:
# const todos$ = observable(persist({ items: [] }, { local: 'todo-items' }));

# Step 2: Copy this pattern for new feature
const completed$ = observable(
  persist(
    { items: [] },
    { local: 'completed-items' }  // Match naming: kebab-case
  )
);
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
- **USE Edit tool** to check the "🔄 In Progress" box in the task list file's completion tracking section
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

**Example of BUG (what happened with itemList vs items)**:
```typescript
// ❌ BAD: Standalone hook test - BUG HIDDEN
// useTodoActions.test.ts
beforeEach(() => {
  todoStore.itemList.set([])  // Creates NEW property (wrong name)
})
test('can add item', () => {
  todoStore.itemList.set([])  // Uses wrong property
  const { result } = renderHook(() => useTodoActions())
  result.current.addItem(item)
  expect(result.current.itemList.length).toBe(1)  // ✅ Passes!
})

// useTodoActions.ts implementation
const addItem = () => todoStore.itemList.set([...])  // Wrong property

// RESULT: Test passes, but real app broken because actual store uses "items"
```

**Example of CORRECT approach**:
```typescript
// ✅ GOOD: Test through component using REAL store
// TodoListScreen.test.tsx
beforeEach(() => {
  todoStore.items.set([])  // MUST use real property (from store file)
})
test('add button creates new item', () => {
  todoStore.items.set([])  // Real property
  render(<TodoListScreen />)  // Component uses useTodoActions hook
  fireEvent.press(screen.getByText('Add Item'))
  expect(screen.getAllByTestId('todo-card').length).toBe(1)
})

// If implementation uses wrong property, test FAILS immediately:
// "Cannot read property 'get' of undefined" because itemList doesn't exist
```

**CRITICAL: Persistence Testing Exception**

If a hook uses AsyncStorage, database, or other persistence:

❌ **NEVER test persistence by mocking AsyncStorage and checking call counts**
- Legend-State `persist()` may debounce/batch writes asynchronously
- Timing-based tests (`waitFor` with mock call checks) are unreliable
- Mocks don't validate actual persistence behavior
- You're testing the mock's behavior, not the real persistence

✅ **ALWAYS test persistence through integration**:
1. Test through component that uses the hook (or direct hook test is acceptable for persistence)
2. Use REAL AsyncStorage (or in-memory mock that actually stores data)
3. Test by unmounting/remounting and verifying data survives
4. Verify "loads persisted data on mount" test PASSES (proves persistence works bidirectionally)

**Example** (from useTodos persistence bug):
```typescript
// ❌ BAD: Mock call count test (flaky, timing-dependent)
test('persists completed items to AsyncStorage', async () => {
  act(() => {
    result.current.actions.completeItem('item-1');
  });

  // This is FLAKY - Legend-State persist() may debounce writes!
  await waitFor(() => {
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(...);  // UNRELIABLE!
  }, { timeout: 2000 });
});

// ✅ GOOD: Integration test proving persistence works
test('loads persisted completed items on mount', async () => {
  // Pre-populate AsyncStorage with real data
  await AsyncStorage.setItem('completed-items', JSON.stringify(['item-1']));

  // Hook should load this on mount
  const { result } = renderHook(() => useTodos());

  await waitFor(() => {
    expect(result.current.completedItems$.get().has('item-1')).toBe(true);
  });
  // ✅ This test PASSING proves persistence works bidirectionally!
});

// ✅ ALSO GOOD: Round-trip persistence test
test('persists and loads completed items', async () => {
  // First render: complete an item
  const { unmount, result } = renderHook(() => useTodos());
  act(() => {
    result.current.actions.completeItem('item-1');
  });

  // Wait for persistence (give it time to save)
  await new Promise(resolve => setTimeout(resolve, 100));
  unmount();

  // Second render: verify it loads
  const { result: result2 } = renderHook(() => useTodos());
  await waitFor(() => {
    expect(result2.current.completedItems$.get().has('item-1')).toBe(true);
  });
  // ✅ Proves data survived unmount/remount cycle
});
```

**If "loads on mount" test passes, persistence IS working** - don't add flaky mock call count tests.

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
   - Example: `cmd.exe /c "cd /d C:\path\to\project\frontend && node node_modules/jest/bin/jest.js modules/path/to/test.test.ts"`
6. Only then proceed to GREEN phase

### Step 2: GREEN - Write Minimal Code to Pass

**RULE**: Write ONLY enough code to make the test pass

**State Management Priority**:

1. Start with `useState` for component-local state
2. Extract to custom hooks (e.g., `useFilteredTodos()`) when logic gets complex
3. Use Legend-State ONLY when state needs sharing across features
4. NEVER create service classes - use hooks for stateful logic

**YOU MUST NOW:**

1. **USE Write/Edit tool** to create the implementation file (component, hook, store, or utility)
2. **Write minimal code** to make the test pass (prefer hooks over services)
3. **NO extra features** or premature optimization
4. **USE Bash tool** to run the test and confirm it now passes
   - **IMPORTANT**: Use cmd.exe to run jest tests for better performance on Windows/WSL
   - Example: `cmd.exe /c "cd /d C:\path\to\project\frontend && node node_modules/jest/bin/jest.js modules/path/to/test.test.ts"`
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
3. **USE Edit tool** to check the "✅ Completed" box in the task list file's completion tracking section
4. **USE Edit tool** to update the progress counter at the bottom of the completion tracking section
   - Example: "Progress: 5/23 tasks completed (22%)"
5. **Immediately move to the next task** (mark it "in_progress" in both TodoWrite AND task list file)

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

**YOU MUST CONTINUE EXECUTING** until all tasks are complete or you hit an ACTUAL TECHNICAL BLOCKER:

**VALID BLOCKERS ONLY**:
- ✅ Missing external API/service that doesn't exist and you cannot create
- ✅ External dependency failure (npm package doesn't exist, API is down)
- ✅ User input required for genuinely ambiguous requirements
- ✅ Explicit instruction to stop from user

**INVALID "BLOCKERS" - KEEP WORKING**:
- ❌ "Time constraints" - **there is NO time limit, continue working**
- ❌ "Token budget concerns" - you have 200k tokens, use them fully
- ❌ "Complexity" - break down into smaller steps and continue
- ❌ "Core functionality complete" - ALL tasks must be done, not just core
- ❌ "Remaining work is just UI" - UI implementation is REQUIRED
- ❌ "Fatigue" or "too many tasks" - agents don't get tired, keep executing

**EXECUTION REQUIREMENTS**:
1. **Execute tasks** in dependency order
2. **Validate each task** before moving to next
3. **Report progress** in real-time using TodoWrite
4. **Handle errors** gracefully - fix or document ACTUAL blockers
5. **Complete ALL tasks** in target scope - not just Phase 1-2

**DO NOT STOP** after setup or planning phases. The goal is WORKING CODE with PASSING TESTS for ALL phases.

## Final Output

Upon completion, provide:

1. **Summary of all completed tasks** (reference the task list file's completion tracking section)
2. **Final task list status**: Show the completed "📋 TASK COMPLETION TRACKING" section from the task list file
3. **Test coverage report**
4. **Any blockers or issues encountered**
5. **Recommendations for next steps**
6. **Location of all generated code and tests**
7. **Final progress**: X/Y tasks completed (Z%)

**VERIFICATION BEFORE DECLARING COMPLETION**:
- Open the task list file and verify ALL "✅ Completed" boxes are checked
- Verify progress counter shows 100% (e.g., "Progress: 23/23 tasks completed (100%)")
- If ANY task is unchecked, you are NOT done - continue working

Remember: **Test-Driven Development is a discipline**. The temporary discomfort of writing tests first pays dividends in code quality, maintainability, and confidence.
