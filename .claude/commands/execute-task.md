---
description: "Execute tasks from task list using TDD approach with test-first development"
argument-hint: "<task-file.yaml> [task-id] | <inline-task-definition>"
allowed-tools: "Read, Write, Edit, MultiEdit, Bash, Grep, Glob, TodoWrite, Task"

---

# Task Executor with Test-Driven Development

Execute tasks from a task list following Test-Driven Development (TDD) principles: **$ARGUMENTS**

## Phase 1: Task Loading and Analysis

### Load Task Definition
First, determine the task source:

1. If `$ARGUMENTS` contains `.yaml`:
   - Read the task file
   - Parse all tasks and dependencies
   - Build execution order respecting dependencies
2. If `$ARGUMENTS` contains specific task_id:
   - Load task file and find specific task
3. Otherwise:
   - Treat as inline task definition
   - Parse the task structure

### Parse Task Structure
Extract from each task:
- `task_id`: Unique identifier
- `name`: Task description
- `type`: [setup|implementation|testing|deployment]
- `agent_prompt`: COSTAR-formatted instructions
- `dependencies`: Required prerequisite tasks
- `validation_script`: Commands to verify completion
- `success_criteria`: List of verification checks
- `files_to_modify`: Existing files to change
- `files_to_create`: New files needed

## Phase 2: TDD Execution Workflow

For each task, follow this TDD cycle:

### Step 1: Analyze Requirements
From the agent_prompt, extract:
- **CONTEXT**: Current state and environment
- **OBJECTIVE**: Specific goal to achieve
- **SPECIFICATIONS**: Input/output contracts
- **VALIDATION**: How to verify success

### Step 2: Write Tests First

#### For React/React Native Components:
```typescript
// Generate test file BEFORE implementation
// [ComponentName].test.tsx

import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { [ComponentName] } from './[ComponentName]';

describe('[ComponentName]', () => {
  const user = userEvent.setup();

  // Test for basic rendering
  test('renders correctly with required props', () => {
    render(<[ComponentName] {...requiredProps} />);
    expect(screen.getByText('[expected text]')).toBeTruthy();
  });

  // Test for user interactions
  test('handles [interaction] correctly', async () => {
    const handle[Event] = jest.fn();
    render(<[ComponentName] on[Event]={handle[Event]} />);

    await user.press(screen.getByText('[button text]'));
    expect(handle[Event]).toHaveBeenCalledWith([expectedArgs]);
  });

  // Test for edge cases
  test('[edge case description]', () => {
    // Implementation based on specifications
  });
});
```

#### For API Endpoints:
```typescript
// Generate API test file first
// [endpoint].test.ts

import request from 'supertest';
import { app } from '../server';
import { mockDatabase } from '../test-utils';

describe('[HTTP_METHOD] [endpoint_path]', () => {
  beforeEach(() => {
    mockDatabase.reset();
  });

  test('returns [expected_status] with valid data', async () => {
    const response = await request(app)
      .[method]('[path]')
      .send({ [validPayload] })
      .expect([statusCode]);

    expect(response.body).toMatchObject({
      [expectedStructure]
    });
  });

  test('returns 400 for invalid input', async () => {
    const response = await request(app)
      .[method]('[path]')
      .send({ [invalidPayload] })
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  test('handles [edge_case]', async () => {
    // Edge case implementation
  });
});
```

#### For Utility Functions:
```typescript
// Generate utility test first
// [utilityName].test.ts

import { [functionName] } from './[utilityName]';

describe('[functionName]', () => {
  test('returns expected output for valid input', () => {
    const input = [testInput];
    const expected = [expectedOutput];

    expect([functionName](input)).toEqual(expected);
  });

  test('handles edge case: [description]', () => {
    expect([functionName]([edgeInput])).toBe([edgeOutput]);
  });

  test('throws error for invalid input', () => {
    expect(() => [functionName]([invalidInput]))
      .toThrow('[ExpectedError]');
  });
});
```

#### For Custom Hooks:
```typescript
// Generate hook test first
// [useHookName].test.ts

import { renderHook, act } from '@testing-library/react-native';
import { [useHookName] } from './[useHookName]';

describe('[useHookName]', () => {
  test('initializes with correct default state', () => {
    const { result } = renderHook(() => [useHookName]());

    expect(result.current.[stateProp]).toBe([defaultValue]);
  });

  test('updates state when [action] is called', () => {
    const { result } = renderHook(() => [useHookName]());

    act(() => {
      result.current.[actionMethod]([args]);
    });

    expect(result.current.[stateProp]).toBe([expectedValue]);
  });

  test('handles async operations correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => [useHookName]());

    act(() => {
      result.current.[asyncMethod]();
    });

    await waitForNextUpdate();

    expect(result.current.[asyncResult]).toBeDefined();
  });
});
```

### Step 3: Run Tests to See Them Fail

```bash
# Run the newly created test
npm test [test-file-path] --no-coverage

# Expect RED - tests should fail because implementation doesn't exist
# This confirms tests are properly checking for the functionality
```

### Step 4: Implement Minimal Code to Pass

Based on the test requirements and agent_prompt, implement:

1. **Create the implementation file**
2. **Write minimal code** that satisfies the test
3. **Focus on passing tests** rather than perfection
4. **Use existing patterns** from the codebase

Implementation approach:
- Start with the simplest solution
- Add only what's needed to pass tests
- Avoid premature optimization
- Follow existing code conventions

### Step 5: Run Tests Again

```bash
# Run tests to verify they now pass
npm test [test-file-path]

# Expect GREEN - all tests should pass
# If any fail, fix implementation and re-run
```

### Step 6: Refactor if Needed

Once tests pass:
1. **Review code** for improvements
2. **Extract common logic** to utilities
3. **Improve naming** and structure
4. **Add type safety** where missing
5. **Run tests again** to ensure nothing broke

### Step 7: Run Full Validation

Execute the task's validation_script:
```bash
# Run validation commands from task definition
[validation_script commands]

# Run broader test suite
npm test
npm run typecheck
npm run lint
```

## Phase 3: Task Orchestration

### Dependency Management
```yaml
# Execute tasks in dependency order
execution_order:
  1. Check all dependencies completed
  2. Execute current task with TDD
  3. Mark task as completed
  4. Unlock dependent tasks
```

### Parallel Execution
When tasks have no interdependencies:
```yaml
parallel_groups:
  - [task_a, task_b]  # Can run simultaneously
  - [task_c]          # Depends on both a and b
```

### Error Handling
```yaml
on_failure:
  1. Capture error details
  2. Log failure reason
  3. Attempt recovery if possible
  4. Mark task as failed
  5. Stop dependent tasks
  6. Report status
```

## Phase 4: Implementation Patterns

### Pattern 1: Component Development
```typescript
// TDD Cycle for React Components
1. Write test describing expected behavior
2. Create component shell that fails test
3. Add props and basic structure
4. Implement logic to pass tests
5. Add styling and polish
6. Verify all tests still pass
```

### Pattern 2: API Development
```typescript
// TDD Cycle for API Endpoints
1. Write integration tests for endpoint
2. Create route that returns 404
3. Add basic handler returning mock data
4. Implement business logic
5. Add validation and error handling
6. Verify all status codes tested
```

### Pattern 3: State Management
```typescript
// TDD Cycle for State/Store
1. Write tests for state transitions
2. Create initial state structure
3. Implement actions/reducers
4. Add selectors and computed values
5. Test side effects and async operations
6. Verify state integrity maintained
```

### Pattern 4: Integration Features
```typescript
// TDD Cycle for Feature Integration
1. Write end-to-end test scenario
2. Implement UI components (with tests)
3. Implement API endpoints (with tests)
4. Connect UI to API
5. Add error handling and loading states
6. Run full integration test
```

## Phase 5: Quality Checks

### Test Coverage Requirements
```bash
# Ensure adequate coverage
npm test -- --coverage

# Check coverage meets thresholds:
- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%
```

### Code Quality Checks
```bash
# TypeScript validation
npm run typecheck

# Linting
npm run lint

# Format check
npm run format:check

# Security audit
npm audit
```

### Performance Validation
For React Native components:
```typescript
// Measure render performance
test('renders efficiently', () => {
  const { rerender } = render(<Component />);

  const start = performance.now();
  for (let i = 0; i < 10; i++) {
    rerender(<Component key={i} />);
  }
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(100); // <100ms for 10 renders
});
```

## Phase 6: Documentation

### Generate Documentation
For each implemented feature:
1. **API Documentation**: Endpoint contracts
2. **Component Documentation**: Props and usage
3. **Test Documentation**: What's being tested
4. **Integration Guide**: How pieces connect

### Update Project Files
- README.md: Add new features
- CHANGELOG.md: Document changes
- API.md: Update endpoint documentation
- TESTING.md: Add testing guidelines

## Phase 7: Task Completion

### Success Criteria Verification
```yaml
for each criterion in success_criteria:
  - Execute verification command
  - Check expected outcome
  - Document result
  - If failed, attempt fix and retry
```

### Final Validation
```bash
# Run complete test suite
npm test

# Build project
npm run build

# Run any task-specific validation
[validation_script from task]
```

### Status Reporting
```markdown
## Task Completion Report

**Task ID**: [task_id]
**Name**: [task_name]
**Status**: ✅ Completed | ❌ Failed | ⚠️ Partial

### Tests Written:
- [test_file_1]: X tests, all passing
- [test_file_2]: Y tests, all passing

### Files Created:
- [file_1]: Implementation
- [file_2]: Tests
- [file_3]: Documentation

### Validation Results:
- ✅ All tests passing
- ✅ TypeScript: No errors
- ✅ Linting: Clean
- ✅ Coverage: XX%

### Next Steps:
- [Dependent tasks now unblocked]
- [Recommendations for improvement]
```

## Execution Strategy

### For Individual Task:
```bash
# Execute single task with TDD
1. Load task definition
2. Write all tests first
3. Run tests (expect failure)
4. Implement code incrementally
5. Run tests until all pass
6. Refactor and optimize
7. Run final validation
```

### For Task List:
```bash
# Execute all tasks in order
1. Parse task dependency graph
2. For each task level:
   a. Execute independent tasks in parallel
   b. Each follows TDD cycle
   c. Wait for all to complete
   d. Move to next level
3. Run final integration tests
4. Generate completion report
```

## Best Practices

### DO:
✅ Always write tests before implementation
✅ Run tests to see them fail first
✅ Write minimal code to pass tests
✅ Refactor only after tests pass
✅ Use existing patterns from codebase
✅ Follow React Native Testing Library best practices
✅ Mock external dependencies properly
✅ Test user-visible behavior, not implementation
✅ Use userEvent for realistic interactions
✅ Handle async operations with waitFor

### DON'T:
❌ Skip the "Red" phase (failing tests)
❌ Write implementation before tests
❌ Test implementation details
❌ Use fireEvent when userEvent available
❌ Ignore test failures
❌ Skip validation steps
❌ Forget error scenarios
❌ Leave console.logs in code
❌ Commit without all tests passing
❌ Use .only() or .skip() in committed tests

## Error Recovery

If task execution fails:
1. **Identify failure point**: Test, implementation, or validation
2. **Analyze error**: Read error messages and stack traces
3. **Fix incrementally**: Address one issue at a time
4. **Re-run from failure point**: Don't restart entire task
5. **Update tests if needed**: Requirements may have been misunderstood
6. **Document issues**: Note any blockers or assumptions

## Success Metrics

Task execution succeeds when:
- ✅ All tests written before implementation
- ✅ All tests pass after implementation
- ✅ Code coverage meets thresholds
- ✅ No TypeScript errors
- ✅ No linting warnings
- ✅ Validation script passes
- ✅ Success criteria all met
- ✅ Documentation updated
- ✅ Code follows project conventions
- ✅ Performance benchmarks met (if applicable)

Execute the task(s) with discipline, following TDD principles throughout!