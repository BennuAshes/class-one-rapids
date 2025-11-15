---
description: "Generate task list from feature description (streamlined - no PRD/TDD docs)"
argument-hint: "<feature-file>"
allowed-tools: "Write, Read, Edit, Bash(date:*), Grep, Glob, Task"
---

# Streamlined Feature to Task List Generator

Generate an executable task list from feature description. **No PRD/TDD documentation** - just actionable tasks with embedded exploration results.

**Input**: Feature description file at $ARGUMENTS
**Output**: Task list with TDD requirements and architecture decisions

---

## Input Validation

**Follow Standard Input Validation Pattern** (see @.claude/commands/flow/prd.md - Shared Patterns)

## Architecture Guides

**See Architecture Guide Index** in @.claude/commands/flow/prd.md for full descriptions.

**Critical for planning**:
1. **Lean Development**: First task MUST be user-visible, no infrastructure-only tasks
2. **File Organization**: Co-located tests, NO __tests__ folders, NO barrel exports
3. **State Management**: Behavior-based hooks, when to use useState vs hooks vs stores
4. **Testing**: TDD best practices, test through components not standalone hooks

---

## Phase 1: Codebase Exploration (CRITICAL)

**MANDATORY**: You MUST complete codebase exploration before generating tasks.

**Why**: Prevents duplicate components, ensures correct store property names, determines UPDATE vs CREATE decisions.

### Step 1: Read Feature Description

Extract from feature description:
- Core functionality needed
- Components/screens mentioned
- Data/state requirements
- Integration points

### Step 2: Launch Explore Subagent

Use Task tool to launch comprehensive exploration:

```typescript
Task({
  subagent_type: "Explore",
  description: "Explore codebase for feature planning",
  model: "haiku",
  prompt: `
I'm planning implementation for this feature:
[FEATURE DESCRIPTION]

**Components/Features to implement**:
- [List extracted from feature description]

**MISSION**: Find existing implementations, verify store properties, determine architecture decisions.

**THOROUGHNESS**: very thorough

**FOR EACH COMPONENT/SCREEN**:

1. **Global Search**:
   - Glob **/*{ComponentName}*.{tsx,ts}
   - Glob **/*{component-name}*.{tsx,ts}

2. **If Found**:
   - Read file to understand current purpose
   - Determine if same purpose (UPDATE) or different (CREATE new with distinct name)

3. **Integration Discovery**:
   - Read App.tsx or app/_layout.tsx
   - Check imports and navigation structure
   - Verify how users access this feature

4. **Store Property Verification**:
   - For each store mentioned: Glob **/*{storeName}.store.ts
   - Read store files
   - List EXACT property names (e.g., "scrap" not "scrapCount")

**RETURN FORMAT**:

## 🔍 EXPLORATION RESULTS

### Components Analysis
**ComponentName**:
- Exists: YES at path/to/Component.tsx
- Purpose: [current purpose]
- Decision: UPDATE (same purpose) or CREATE at different/path
- Rationale: [why this decision]

OR

- Exists: NO
- Decision: CREATE at path/to/NewComponent.tsx
- Rationale: [module ownership reasoning]

### Store Properties (EXACT NAMES)
**storeName.store.ts**:
- propertyName: Observable<Type> ✅
- anotherProperty: Observable<Type> ✅

### Integration Map
**App.tsx** or **app/_layout.tsx**:
- Current screens: [list]
- Navigation pattern: [describe]
- How feature will integrate: [describe]

### Architecture Decisions Summary
- UPDATE: path/to/existing.tsx (reason: owns this responsibility)
- CREATE: path/to/new.tsx (reason: new feature component)
- CREATE: path/to/hook.ts (reason: new business logic)

Store Properties Verified:
- storeName.property ✅ (NOT wrongName)

Integration Verified:
- ✅ Feature accessible via [navigation path]
`
})
```

### Step 3: Validate Exploration Results

Check subagent results for:
- [ ] Every component has UPDATE or CREATE decision
- [ ] Store property names are exact (from actual file reads)
- [ ] Integration points are clear and functional
- [ ] No duplicate file path conflicts

**RED FLAG - STOP IF**:
- Multiple components with same name found (conflict unclear)
- Store properties uncertain or guessed
- Integration path not clear

---

## Phase 2: Extract Requirements (Minimal)

From feature description, extract only what drives code:

**1. Core Problem**: What user problem does this solve?

**2. User Stories** (2-5 max, focus on testable behaviors):
```
As a [user type]
I want to [action]
So that I can [benefit]

Acceptance Criteria:
- Given [context], when [action], then [outcome]
- [Additional testable criteria]
```

**3. Functional Requirements** (what code must do):
- Specific behaviors and interactions
- Data transformations
- User interface elements

**4. Non-Functional Requirements** (how code must perform):
- Performance: Response times, load times
- Testing: Coverage requirements, test types
- Accessibility: Touch targets, screen readers

**5. MVP Scope** (prioritize deliverables):
- **P0 (Must Have)**: Core user-visible features only
- **P1 (Nice to Have)**: Enhancements
- **Out of Scope**: Explicitly excluded

---

## Phase 3: Generate Task List

### Task Structure (Lean & TDD-Focused)

Each task should include:

**1. Title & Status**
```markdown
### Task X: [ACTION VERB] [Feature Name]
**Status**: [COMPLETED/PARTIAL/new] (mark existing work)
```

**2. Objective** (clear, measurable)
```markdown
**Objective**: Implement [specific feature] with [specific outcome]
```

**3. Architecture Decision** (from Phase 1 exploration)
```markdown
**Files** (from exploration):
- UPDATE: path/to/existing.tsx (reason: owns this UI)
- CREATE: path/to/new.tsx (reason: new component)
- CREATE: path/to/hook.ts (reason: business logic)

**Store Properties** (verified):
- storeName.property (NOT wrongName) ✅
```

**4. TDD Requirements** (RED-GREEN-REFACTOR)
```markdown
**TDD Cycle**:
1. RED: Write failing tests for:
   - [Behavior 1]
   - [Behavior 2]
2. GREEN: Implement minimal code to pass
3. REFACTOR: Clean up while keeping tests green

**Test Through**: Components (NOT standalone hooks per CLAUDE.md)
**Use Real Stores**: With verified property names
```

**5. Acceptance Criteria** (testable)
```markdown
**Acceptance Criteria**:
- [ ] [Specific testable outcome 1]
- [ ] [Specific testable outcome 2]
- [ ] Test coverage > 80%
- [ ] All existing tests still pass
```

**6. Dependencies**
```markdown
**Dependencies**: Task Y (if file created there is needed here)
```

### Task Ordering (Lean Principle)

**CRITICAL**: First task MUST deliver user-visible functionality.

- ❌ NO: "Set up infrastructure"
- ❌ NO: "Create store boilerplate"
- ✅ YES: "Implement [visible feature] with basic functionality"

**Validation**:
- [ ] Task 1 allows user to DO something visible
- [ ] Each task independently demo-able
- [ ] Infrastructure created just-in-time within feature tasks

### Quality Gates

**Good Task**:
- Clear objective (one specific deliverable)
- Architecture decisions from exploration (UPDATE/CREATE)
- TDD requirements with specific tests
- Testable acceptance criteria
- Dependencies listed

**Bad Task**:
- Vague objective ("improve performance")
- No architecture decisions (guess where files go)
- No test requirements
- Acceptance criteria not measurable

---

## Output Format

Generate task list markdown file with this structure:

```markdown
# [Feature Name] Implementation Tasks

**Generated**: [timestamp]
**Source**: [feature description file]

---

## 🔍 Codebase Exploration Results

[Paste EXACT output from Explore subagent here]

### Architecture Decisions Summary

Based on exploration:
- UPDATE: path/to/existing.tsx (reason)
- CREATE: path/to/new.tsx (reason)

Store Properties (verified):
- storeName.property ✅ (NOT wrongName)

Integration:
- ✅ [How feature integrates with existing app]

---

## 📋 Task List

### Task 1: [User-Visible Feature] (Lean Principle)

**Objective**: [Clear deliverable]

**Files** (from exploration):
- UPDATE/CREATE: [paths with reasons]

**TDD Cycle**:
1. RED: Test [behaviors]
2. GREEN: Implement
3. REFACTOR: Clean up

**Acceptance Criteria**:
- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
- [ ] Coverage > 80%

**Dependencies**: None (first task)

---

### Task 2: [Next Feature]

[Same structure...]

---

## 📊 Task Summary

- **Total Tasks**: X
- **P0 (Must Have)**: Y tasks
- **P1 (Nice to Have)**: Z tasks
- **First Task Delivers**: [User-visible feature name]
```

### Save Output

**Filename**: `tasks_[feature_name_snake_case]_[YYYYMMDD].md`
**Location**: Same directory as feature description file
**Include**: Generation timestamp, source reference

**CRITICAL**: Ensure exploration results are EMBEDDED in the output file so `/plan-act:act` can use cached decisions.

---

## Success Criteria

Task list is ready when:
- ✅ Codebase exploration completed (UPDATE/CREATE decisions made)
- ✅ Store property names verified (exact names from files)
- ✅ Task 1 delivers user-visible functionality (Lean principle)
- ✅ Each task has TDD requirements and acceptance criteria
- ✅ All exploration results embedded in output file
- ✅ No duplicate file paths or architectural conflicts
