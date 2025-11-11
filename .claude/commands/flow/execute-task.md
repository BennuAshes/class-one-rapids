---
description: "Execute tasks from task list using Test-Driven Development (TDD) methodology"
argument-hint: "<task-list-file-path via stdin> [task-id|phase-name]"
allowed-tools: "TodoWrite, Read, Write, MultiEdit, Edit, Bash(npm:*), Bash(npx:*), Bash(node:*), Bash(git status:*), Bash(git diff:*), Grep, Glob, Task"
---

# TDD Task Executor Agent

The task list file path is $ARGUMENTS.

**Process**:

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
   - Effect hooks in separate files

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

## Phase 1: Initialize Execution Context

First, I'll set up the execution environment and understand the task requirements.

1. **Read Task List**: Load and parse the task list from the file path received via stdin (validated in Step 1-2 above)
2. **Check Task Status**: Look for [COMPLETED] or [PARTIAL] prefixes in task titles
3. **Identify Target**: Determine which tasks to execute (all tasks from the list)
4. **Skip Completed Tasks**: Tasks marked [COMPLETED] should be skipped
5. **Validate Prerequisites**: Check that required tools, dependencies, and environment are ready
6. **Initialize Progress Tracking**: Set up TodoWrite for tracking task execution

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

**Pre-execution Check**: For each task, verify it's not already implemented:

Follow @docs/architecture/file-organization-patterns.md for locating files. Use appropriate search tools (Glob, Grep) to check for:

- Existing components, hooks, and utilities
- Co-located test files
- Existing state management (stores, hooks)
- Anti-patterns (Context API usage, service classes, barrel exports)

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

For each task in the execution sequence:

### Step 1: RED - Write Failing Tests First

**CRITICAL**: Always write tests BEFORE implementation

```typescript
// Example test structure based on React Native Testing Library guide
describe("[ComponentName]", () => {
  test("should [specific behavior from requirement]", async () => {
    // Test ONE specific behavior
    // Test MUST fail initially (component doesn't exist)
    // Use user-centric queries (getByText, getByRole, etc.)
  });
});
```

Actions:

1. Create test file in appropriate location
2. Write test for FIRST requirement only
3. Run test to confirm it fails with expected error
4. Commit the failing test (documents the requirement)

### Step 2: GREEN - Write Minimal Code to Pass

**RULE**: Write ONLY enough code to make the test pass

**State Management Priority**:

1. Start with `useState` for component-local state
2. Extract to custom hooks (e.g., `useEnemy()`) when logic gets complex
3. Use Legend-State ONLY when state needs sharing across features
4. NEVER create service classes - use hooks for stateful logic

Actions:

1. Implement minimal solution (prefer hooks over services)
2. No extra features or optimization
3. Run test to confirm it passes
4. Keep all existing tests passing

### Step 3: REFACTOR - Improve Code Quality

**MAINTAIN**: All tests must remain green during refactoring

Actions:

1. Extract constants and improve naming
2. Remove duplication
3. Improve code organization
4. Run tests after each change

### Step 4: Iterate for Next Requirement

Repeat RED-GREEN-REFACTOR for each requirement:

1. Add new failing test for next behavior
2. Implement code to pass new test
3. Refactor if needed
4. Continue until all requirements have tests

## Phase 4: Task Validation & Completion

### Validation Checklist

Before marking any task complete:

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

1. **Follow Existing Patterns**:

   - Check neighboring files for conventions
   - Use existing utilities and helpers
   - Match code style (indentation, naming, etc.)

2. **Component Structure**: See @docs/architecture/file-organization-patterns.md

   - Co-located tests (NO `__tests__` folders)
   - File naming conventions
   - Module organization

3. **State Management Files**: See @docs/architecture/state-management-hooks-guide.md

   - `featureStore.ts` - For cross-feature shared state
   - `useFeature.ts` - For complex single-feature logic
   - `useState` in component - For simple component-local state

4. **Test Placement**: Per @docs/architecture/file-organization-patterns.md
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

The agent will:

1. Execute tasks in dependency order
2. Validate each task before moving to next
3. Report progress in real-time
4. Handle errors gracefully
5. Complete all tasks in target scope

## Final Output

Upon completion, provide:

1. Summary of all completed tasks
2. Test coverage report
3. Any blockers or issues encountered
4. Recommendations for next steps
5. Location of all generated code and tests

Remember: **Test-Driven Development is a discipline**. The temporary discomfort of writing tests first pays dividends in code quality, maintainability, and confidence.
