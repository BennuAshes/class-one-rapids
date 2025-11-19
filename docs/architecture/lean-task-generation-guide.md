# Lean Task Generation Guide

## Purpose
This guide defines how to generate implementation tasks that follow lean development principles. Every task must deliver working functionality, with infrastructure emerging naturally from feature needs.

## Core Principles

### 1. No Infrastructure-Only Tasks
**❌ BAD**: "Set up project folder structure"
**✅ GOOD**: "Implement tap-to-damage feature (creating services/DamageCalculator.ts as needed)"

### 2. Start with Simplest Working Feature
The first task must deliver user-visible functionality using existing files where possible.

**❌ BAD First Task**:
```
Task 1.1: Initialize Project Repository
- Create folder structure
- Install dependencies
- Configure tools
```

**✅ GOOD First Task**:
```
Task 1.1: Basic Tap-to-Damage with TDD
- Write failing test in App.test.tsx
- Modify existing App.tsx to pass test
- User can tap enemy to deal damage
```

### 3. Just-In-Time Everything
- **Dependencies**: Install only when first used in a feature
- **Folders**: Create only when adding first file
- **Configuration**: Setup only when feature needs it
- **Abstractions**: Extract only when duplication appears

### 4. Every Task Delivers Functionality
Each task must:
1. Start with a failing test for user-visible behavior
2. Implement minimal code to pass the test
3. End with working, shippable functionality
4. Document what was created as side effects

### 5. Progressive Enhancement
Build complexity incrementally:
- Task 1: Simplest possible version (tap reduces health)
- Task 2: Add one layer (damage varies)
- Task 3: Add another layer (combo system)

## Task Generation Template

```markdown
### Task [#]: [User-Visible Feature Name]
**ROLE**: You are a [role] implementing [what user can do]

**CONTEXT**: [Current state and why this feature is next]

**OBJECTIVE**: [Specific user-facing functionality to deliver]

**TDD IMPLEMENTATION**:
#### Step 1: Write Failing Test
```[language]
// Test for user-visible behavior
test('[what user sees/does]', () => {
  // Arrange
  // Act
  // Assert user-visible outcome
});
```

#### Step 2: Minimal Implementation
```[language]
// Simplest code to make test pass
// Use existing files where possible
```

#### Step 3: Refactor (if needed)
- Clean up while keeping tests green

**FILES TO CREATE** (only if needed):
- [Only list files that don't exist yet]
- [Create folders only with first file]

**DEPENDENCIES TO ADD** (only if needed):
- [Package] - for [specific feature need]

**ACCEPTANCE CRITERIA**:
- [ ] User can [do something]
- [ ] [Visible outcome] happens
- [ ] Tests pass
- [ ] Feature works end-to-end

**DELIVERABLE**: [What user can now do that they couldn't before]
```

## Validation Checklist

Before accepting a generated task list, verify:

### Task Quality
- [ ] First task delivers working functionality?
- [ ] Every task has user-visible outcome?
- [ ] No pure setup/infrastructure tasks?
- [ ] Each task includes TDD cycle?

### Lean Principles
- [ ] Dependencies installed only when used?
- [ ] Folders created only with files?
- [ ] Using existing files where possible?
- [ ] Complexity added incrementally?

### Task Count
- [ ] Minimized number of tasks?
- [ ] Combined related work where sensible?
- [ ] No artificial task splitting?

## Examples of Transformation

### Before (Infrastructure-Heavy):
```
Phase 1: Setup
- Task 1.1: Create folder structure
- Task 1.2: Install all dependencies
- Task 1.3: Configure testing

Phase 2: Implementation
- Task 2.1: Create services
- Task 2.2: Create components
- Task 2.3: Wire everything together
```

### After (Lean/Functional):
```
Phase 1: Working Features
- Task 1.1: Tap enemy to deal damage (modify App.tsx)
- Task 1.2: Add damage numbers (install reanimated when needed)
- Task 1.3: Add health bar (create first component)
```

## Anti-Patterns to Avoid

### 1. Premature Structure
❌ Creating folders before files
❌ Setting up "proper architecture" upfront
✅ Let structure emerge from needs

### 2. Big Bang Dependencies
❌ Installing all packages in task 1
❌ "We'll need these later"
✅ Install each package with feature that uses it

### 3. Setup Theater
❌ Tasks that only move files around
❌ Tasks that only install things
✅ Every task changes user experience

### 4. Waterfall Phases
❌ Phase 1: All setup, Phase 2: All implementation
✅ Each phase delivers working features

## Task Generation Process

1. **Identify Simplest Valuable Feature**
   - What's the minimum user can interact with?
   - Can it be done in existing files?

2. **Write First Task**
   - Test for user behavior
   - Minimal implementation
   - Note any files/deps created

3. **Identify Next Enhancement**
   - What makes feature slightly better?
   - Build on existing code

4. **Repeat Until Complete**
   - Each task adds functionality
   - Structure emerges naturally
   - Dependencies added as needed

## Metrics for Success

Good task lists have:
- **Fewer tasks** (15 vs 42)
- **Faster time to first feature** (Task 1 vs Task 5)
- **No empty folders/files**
- **Every task demo-able**
- **Natural architecture emergence**

## Key Phrases for Task Generation

Use these phrases in prompts:
- "Deliver working functionality in every task"
- "Start with simplest user-visible feature"
- "Create files only when implementing features"
- "Install dependencies just-in-time"
- "No infrastructure-only tasks"
- "Modify existing files where possible"
- "Every task must be demo-able"

## Applying to Different Project Types

### Frontend/UI Projects
- First task: Simplest screen with interaction
- Add complexity: State, routing, API calls

### API/Backend Projects
- First task: Single endpoint that works
- Add complexity: Validation, auth, database

### CLI Tools
- First task: Simplest command that runs
- Add complexity: Options, config, output formats

### Libraries
- First task: Core function that works
- Add complexity: Edge cases, utilities, types

---
*This guide should be referenced whenever generating task lists from TDDs or PRDs*