---
description: "Execute tasks from task list using Test-Driven Development (TDD) methodology"
argument-hint: "<task-list-file-path> [task-id|phase-name]"
allowed-tools: "TodoWrite, Read, Write, MultiEdit, Edit, Bash(npm:*), Bash(npx:*), Bash(node:*), Bash(git status:*), Bash(git diff:*), Grep, Glob, Task"
---

# TDD Task Executor Agent

Execute tasks from the task list at: **$1**
Target: $2 (optional: specific task ID or phase name)

**IMPORTANT**: Follow @docs/guides/lean-task-generation-guide.md principles - prioritize user-visible features, create infrastructure only when needed.

## CRITICAL: Architecture and Path Rules
**MANDATORY**: Read and follow these guides before ANY file operations:
1. @docs/architecture/working-directory-context.md - Working directory and path rules
2. @docs/architecture/file-organization-patterns.md - File patterns (NO barrel exports, co-located tests)

**Key Rules**:
- You are in `c:\dev\class-one-rapids\frontend\`
- NEVER create `frontend/frontend/` nested structures
- NO barrel exports (index.ts files)
- Tests ALWAYS co-located with implementation

## Phase 1: Initialize Execution Context

First, I'll set up the execution environment and understand the task requirements.

1. **Read Task List**: Load and parse the task list from $1
2. **Check Task Status**: Look for [COMPLETED] or [PARTIAL] prefixes in task titles
3. **Identify Target**: Determine which tasks to execute based on $2 (if provided)
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
   - Plan test file structure

## Phase 3: Test-Driven Development Execution

**Pre-execution Check**: For each task, verify it's not already implemented:
```bash
# Check if component/hook exists (NO services - use hooks!)
test -f src/modules/[feature]/ComponentName.tsx
test -f src/modules/[feature]/useFeatureName.ts

# Check for existing tests (co-located, NOT in __tests__)
test -f src/modules/[feature]/ComponentName.test.tsx
test -f src/modules/[feature]/useFeatureName.test.ts
```

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
  status: completed  # was: not_started
  completed:
    - List of implemented features
  evidence:
    - src/modules/[feature]/implementation.ts
    - src/modules/[feature]/implementation.test.ts  # Co-located test
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

2. **Component Structure** (with co-located tests):

   ```
   src/modules/[feature]/
   ├── ComponentName.tsx
   ├── ComponentName.test.tsx      # Test co-located with component
   ├── useFeature.ts               # Hook (NOT service)
   ├── useFeature.test.ts          # Test co-located with hook
   ├── feature.types.ts            # TypeScript types
   └── feature.store.ts            # Legend-State store (only if needed)
   ```

3. **Test Placement Rule**:
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
