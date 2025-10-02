# Task Generation Prompt Addition

## Add This to Task Generation Commands

When generating task lists from TDDs, PRDs, or any specification, INSERT this section to replace infrastructure-heavy approaches:

---

### CRITICAL: Lean Task Generation Requirements

**OVERRIDE DEFAULT BEHAVIOR**: Do not create infrastructure-only tasks. Follow these rules:

#### Rule 1: First Task Delivers Functionality
The FIRST task must implement the simplest possible working feature that users can interact with.

```markdown
Task 1.1: [Simplest User Feature]
- Modify existing files where possible (e.g., App.tsx)
- Create new files ONLY if feature requires them
- Install dependencies ONLY if feature uses them
- END RESULT: User can perform an action and see results
```

#### Rule 2: No Infrastructure Tasks
FORBIDDEN task types:
- ❌ "Set up folder structure"
- ❌ "Install dependencies"
- ❌ "Configure environment"
- ❌ "Initialize project"
- ❌ "Set up testing infrastructure"

REQUIRED approach:
- ✅ "Implement [feature] (creating [file] as needed)"
- ✅ "Add [feature] (installing [package] for this feature)"

#### Rule 3: Task Structure Template
EVERY task must follow this structure:

```markdown
### Task X: [User-Visible Feature]
**OBJECTIVE**: Implement [what user can do]

**TDD CYCLE**:
1. Test: Write failing test for user behavior
2. Code: Minimal implementation to pass
3. Refactor: Clean up if needed

**SIDE EFFECTS** (created only if needed):
- Files: [new files created for THIS feature]
- Dependencies: [packages installed for THIS feature]
- Folders: [directories created when adding first file]

**DELIVERABLE**: Working [feature] that user can [action]
```

#### Rule 4: Progressive Enhancement
Structure tasks as progressive enhancement:
1. Simplest working version
2. Add one complexity
3. Add another complexity
4. Continue building on working code

#### Rule 5: Validation Questions
Before finalizing each task, ask:
- Can the user DO something new after this task?
- Could we demo this task's result?
- Are we creating files/folders that won't be used immediately?
- Are we installing packages that won't be used in this task?

If ANY answer is wrong, redesign the task.

#### Example Transformation

**OLD Approach (42 tasks)**:
```
Phase 1: Foundation Setup
- Task 1.1: Initialize repository
- Task 1.2: Set up dependencies
- Task 1.3: Create folder structure
- Task 1.4: Configure testing
[User still can't do anything]

Phase 2: Core Implementation
- Task 2.1: Create services
- Task 2.2: Create components
[User still waiting...]
```

**NEW Approach (15 tasks)**:
```
Phase 1: Basic Combat
- Task 1.1: Tap enemy to deal damage (modify App.tsx)
  DELIVERABLE: User can tap and see health decrease
- Task 1.2: Show damage numbers (add animation)
  DELIVERABLE: User sees floating damage feedback
- Task 1.3: Add health bar (create first component)
  DELIVERABLE: User sees visual health status
[User can play basic game after 3 tasks!]
```

#### File Creation Strategy

When a feature needs a new file:

```markdown
**CREATING**: `src/services/DamageCalculator.ts`
**BECAUSE**: This feature needs damage calculation logic
**COULD NOT**: Use existing App.tsx because logic is reusable
```

Never create files "for later organization" - only for immediate feature needs.

---

## Usage Instructions

1. **For `/tasks` command**: Insert the "CRITICAL: Lean Task Generation Requirements" section at the beginning of task generation

2. **For manual task creation**: Reference this guide before writing any task

3. **For task review**: Use Rule 5 validation questions on every generated task

4. **For PRD/TDD analysis**: Start by identifying the simplest user-visible feature, not the architecture

## Quick Reference Card

```
LEAN TASK CHECKLIST:
□ First task = working feature?
□ Every task = user can do something new?
□ No setup-only tasks?
□ Files created only when used?
□ Dependencies installed only when needed?
□ Using existing files where possible?
□ Tasks build on each other?
□ Could demo after each task?
□ Minimal task count?
□ TDD cycle in each task?
```

## Command Modification

For the `/tasks [tdd-file]` command, add this parameter:

```
--lean-tasks: Generate minimal task list where every task delivers functionality
```

This should become the DEFAULT behavior, with an option for verbose/infrastructure-heavy if ever needed:

```
--with-infrastructure: Include setup tasks (not recommended)
```