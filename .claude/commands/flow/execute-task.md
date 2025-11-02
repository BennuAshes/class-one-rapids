---
description: "Execute tasks from task list using Test-Driven Development (TDD) methodology"
argument-hint: "<task-list-file-path> [task-id|phase-name]"
allowed-tools: "TodoWrite, Read, Write, MultiEdit, Edit, Bash(npm:*), Bash(npx:*), Bash(node:*), Bash(git status:*), Bash(git diff:*), Grep, Glob, Task"
---

# TDD Task Executor Agent

Execute tasks from the task list at: **$1**
Target: $2 (optional: specific task ID or phase name)

**IMPORTANT**: Follow @docs/guides/lean-task-generation-guide.md principles - prioritize user-visible features, create infrastructure only when needed.

---

## 🚀 QUICK DECISION REFERENCE

### Before Writing Any Code

**State Management**: See @docs/architecture/file-organization-patterns.md (lines 156-171)

- Single component → `useState` | Complex logic → Custom hook | Multiple features → Legend-State store

**File Organization**: See @docs/architecture/file-organization-patterns.md (lines 3-70)

- Co-located tests | No barrel exports | No `__tests__` folders

**Testing (TDD Methodology):**

- ✅ Write test FIRST (RED)
- ✅ Implement minimal code (GREEN)
- ✅ Refactor with tests passing (REFACTOR)

**Legend-State Guide**: See @docs/research/expo_legend_state_v3_guide_20250917_225656.md

---

## CRITICAL: Architecture and Path Rules

**MANDATORY**: Read and follow these guides before ANY file operations:

1. @docs/architecture/working-directory-context.md - Working directory and path rules
2. @docs/architecture/file-organization-patterns.md - File patterns (NO barrel exports, co-located tests)

**Key Rules**:

- You are in `c:\dev\class-one-rapids\frontend\`
- NEVER create `frontend/frontend/` nested structures
- NO barrel exports (index.ts files)
- Tests ALWAYS co-located with implementation

## ⚠️ COMMON STATE MANAGEMENT PITFALLS TO AVOID

### Anti-Patterns (What NOT to do)

1. **DON'T use React Context** for cross-feature state

   ```typescript
   // ❌ WRONG
   const AttributeContext = createContext();

   // ✅ RIGHT - Legend-State v3 store with hook
   // attributesStore.ts
   import { observable } from "@legendapp/state";
   export const attributes$ = observable({ strength: 0 });

   // useAttributes.ts - Hook to use the store (Legend-State v3)
   import { use$ } from "@legendapp/state/react";
   import { attributes$ } from "./attributesStore";

   export const useAttributes = () => {
     const attributes = use$(attributes$);
     return {
       ...attributes,
       allocatePoint: (attr: string) => {
         attributes$[attr].set((prev) => prev + 1);
       },
     };
   };
   ```

2. **DON'T create service classes** for state management

   ```typescript
   // ❌ WRONG
   class AttributeService {
     private strength = 0;
     getAllocate() { ... }
   }

   // ✅ RIGHT
   export const useAttributes = () => {
     const [strength, setStrength] = useState(0);
     // ...
   };
   ```

3. **DON'T pass callbacks through multiple components** (prop drilling)

   ```typescript
   // ❌ WRONG
   <App>
     <GameScreen onDamage={handleDamage}>
       <Enemy onHit={onDamage}>
         <HealthBar />
       </Enemy>
     </GameScreen>
   </App>;

   // ✅ RIGHT - Use Legend-State v3 with hook
   // combatStore.ts
   import { observable } from "@legendapp/state";
   export const combat$ = observable({ damage: 0 });

   // useCombat.ts
   import { use$ } from "@legendapp/state/react";
   export const useCombat = () => {
     const damage = use$(() => combat$.damage);
     return {
       damage,
       dealDamage: (amount: number) => combat$.damage.set(amount),
     };
   };
   ```

4. **DON'T lift state up unnecessarily**

   ```typescript
   // ❌ WRONG - Lifting everything to App
   function App() {
     const [enemyHealth, setEnemyHealth] = useState(1000);
     const [attributes, setAttributes] = useState({...});
     const [inventory, setInventory] = useState([]);
     // Passing all as props...
   }

   // ✅ RIGHT - Use stores for shared state
   // Each module manages its own store
   ```

### Red Flags That You Need Legend-State

You should use Legend-State when you observe any of these:

- ⚠️ Multiple components need to read the same state
- ⚠️ State changes in one component must affect another component
- ⚠️ You're considering creating a React Context
- ⚠️ You're passing callbacks through 2+ component levels
- ⚠️ Different features need to coordinate based on shared data
- ⚠️ You type `createContext` or `useContext`

### When NOT to Use Legend-State

Keep it simple with hooks/useState when:

- ✅ State is only used within a single component
- ✅ State doesn't need to persist
- ✅ No other components care about this state
- ✅ Logic is simple and doesn't need extraction

### Real Examples from This Project

| Feature                             | State Type      | Solution           | Why                                 |
| ----------------------------------- | --------------- | ------------------ | ----------------------------------- |
| **Attributes** (strength/coord/end) | Cross-feature   | Legend-State store | Combat, UI, offline all need access |
| **Enemy health**                    | Component-local | useState           | Only Enemy component cares          |
| **Weakness spot position**          | Component-local | useState           | Only WeaknessSpot component         |
| **Player inventory**                | Cross-feature   | Legend-State store | Multiple screens access             |
| **Form input**                      | Component-local | useState           | Single form component               |

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

## CRITICAL: State Management Architecture Decision

Before implementing ANY stateful feature, follow this decision tree:

### State Management Hierarchy (MANDATORY)

**Decision Flow:**

1. **Is state used by only one component?**

   - YES → Use `useState` in component
   - NO → Continue to step 2

2. **Is the logic complex or reusable?**

   - YES → Continue to step 3
   - NO → Use `useState` with inline logic

3. **Is state shared across multiple features/modules?**
   - YES → Use **Legend-State store** (`featureStore.ts`)
   - NO → Use **Custom Hook** (`useFeatureName.ts`)

### State Management Hierarchy Table

| State Type               | Example                     | Solution     | File                   |
| ------------------------ | --------------------------- | ------------ | ---------------------- |
| Component-local, simple  | Button clicked state        | `useState`   | In component           |
| Component-local, complex | Form validation logic       | Custom hook  | `useFormValidation.ts` |
| Cross-feature shared     | Attributes affecting damage | Legend-State | `attributesStore.ts`   |
| Global app config        | Theme, settings             | Legend-State | `settingsStore.ts`     |

### NEVER Use

- ❌ React Context API for state management (use Legend-State)
- ❌ Service classes (use hooks or stores)
- ❌ Redux, MobX, or other state libraries (use Legend-State)

### Example Scenarios

**Attributes System** (affects damage, crits, offline progression):

```typescript
// ✅ CORRECT: Legend-State v3 store
// frontend/modules/attributes/attributesStore.ts
import { observable } from "@legendapp/state";

export const attributes$ = observable({
  strength: 0,
  coordination: 0,
  endurance: 0,
});

// frontend/modules/attributes/useAttributes.ts
import { use$ } from "@legendapp/state/react";
import { attributes$ } from "./attributesStore";

export const useAttributes = () => {
  const strength = use$(attributes$.strength);
  const getDamageBonus = () => attributes$.strength.get() * 5;
  return { strength, getDamageBonus };
};
```

**Enemy Health** (single component):

```typescript
// ✅ CORRECT: useState
function Enemy() {
  const [health, setHealth] = useState(1000);
  // ...
}
```

**Complex Animation** (isolated but complex):

```typescript
// ✅ CORRECT: Custom hook
// frontend/modules/combat/useEnemyAnimation.ts
export const useEnemyAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  // Complex animation logic
  return { isAnimating, triggerAnimation };
};
```

## Phase 3: Test-Driven Development Execution

**Pre-execution Check**: For each task, verify it's not already implemented:

```bash
# Check if component/hook exists (NO services - use hooks!)
test -f src/modules/[feature]/ComponentName.tsx
test -f src/modules/[feature]/useFeatureName.ts

# Check for existing tests (co-located, NOT in __tests__)
test -f src/modules/[feature]/ComponentName.test.tsx
test -f src/modules/[feature]/useFeatureName.test.ts

# Check for existing state management (BEFORE creating new files)
echo "Checking for existing state management patterns..."

# Check for Legend-State stores
find src/modules/*/[feature]Store.ts 2>/dev/null

# Check for custom hooks
find src/modules/*/use*.ts 2>/dev/null

# Check for React Context (should be avoided for state)
grep -r "createContext" src/modules/ 2>/dev/null && echo "⚠️ WARNING: Context found - consider Legend-State instead"
```

### Pre-implementation State Management Check

BEFORE writing any code, answer:

1. **Will this state be accessed by multiple components?**

   - If YES → Plan for Legend-State store
   - If NO → Can use hooks or useState

2. **Does existing state management exist for this feature?**

   - Check: `src/modules/[feature]/*Store.ts`
   - Check: `src/modules/[feature]/use*.ts`

3. **What features will consume this state?**
   - List all components/modules that need access
   - If list > 1 feature → Legend-State required

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
    - src/modules/[feature]/implementation.ts
    - src/modules/[feature]/implementation.test.ts # Co-located test
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
   ├── useFeature.ts               # Hook (for complex local logic)
   ├── useFeature.test.ts          # Hook test (co-located)
   ├── featureStore.ts             # Legend-State store (when shared across features)
   ├── featureStore.test.ts        # Store test (co-located)
   └── feature.types.ts            # TypeScript types
   ```

### When to Create Each File Type

#### featureStore.ts (Legend-State Store)

**Create when:**

- Multiple features/modules need access to this state
- State affects behavior of unrelated components
- State needs persistence across app lifecycle

**Examples from this project:**

```typescript
// attributesStore.ts - Used by combat, UI, offline progression
import { observable } from "@legendapp/state";
export const attributes$ = observable({
  strength: 0,
  coordination: 0,
  endurance: 0,
  unallocatedPoints: 0,
});

// inventoryStore.ts - Used by inventory screen, combat, shop
export const inventory$ = observable({
  items: [],
  gold: 0,
});

// settingsStore.ts - Used by all screens
export const settings$ = observable({
  soundEnabled: true,
  theme: "dark",
});
```

#### useFeature.ts (Custom Hook)

**Create when:**

- Logic is complex but only used in one feature
- You want to extract reusable logic from components
- State is local but calculations are complex

**Examples:**

```typescript
// useEnemyAnimation.ts - Complex but isolated to combat
export const useEnemyAnimation = () => {
  const [state, setState] = useState("idle");
  // Complex animation logic
};

// useFormValidation.ts - Complex validation, single form
export const useFormValidation = (schema) => {
  const [errors, setErrors] = useState({});
  // Validation logic
};
```

### Quick Reference: State Management Files

| Pattern                 | When to Use                   | Example                                      |
| ----------------------- | ----------------------------- | -------------------------------------------- |
| `featureStore.ts`       | Shared across features        | `attributesStore.ts` (combat + UI + offline) |
| `useFeature.ts`         | Complex logic, single feature | `useEnemyAnimation.ts` (combat only)         |
| `useState` in component | Simple, component-local       | Button click states                          |

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
