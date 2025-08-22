# Vertical Slicing vs RDT Format Analysis

## The Core Tension

The Requirements-Design-Tasks (RDT) specification format and vertical slicing methodology have a fundamental conflict in how they approach task creation.

## The Format Conflict

### RDT Format Assumes Role Separation
- **requirements.md** = Product Owner perspective (WHAT)
- **design.md** = Architect perspective (HOW)
- **tasks.md** = Developer perspective (IMPLEMENT)

This creates a **horizontal layering** where each document represents a different layer of abstraction, handled by different roles in sequence.

### Vertical Slicing Demands Feature Integration
- Each task must deliver user value
- No separation between technical layers
- No "setup" or "infrastructure-only" tasks
- Technical implementation emerges from feature needs

## The Problem in Practice

### Current Task Generation Pattern (Anti-Pattern)
```markdown
- [ ] Create `src/shared/state/gameState.ts` with observable game state
- [ ] Set up navigation structure
- [ ] Implement game loop
- [ ] Create UI components
```

These are **horizontal tasks** focused on technical implementation layers.

### Vertical Slicing Pattern (Desired)
```markdown
- [ ] Player can click "WRITE CODE" and see persistent code count
- [ ] Player can buy developers that automatically produce code
- [ ] Player can switch between company and department views
```

These are **vertical tasks** focused on user capabilities.

## Why This Happens

Looking at SPECIFICATION_FORMAT_ANALYSIS.md lines 146-149:

> **tasks.md**:
> - Action-oriented, imperative language
> - Specific implementation verbs ("Create", "Implement", "Add", "Build")

The format encourages **implementation verbs** instead of **user outcome verbs**, leading to technical tasks rather than feature slices.

## Root Cause Analysis

### 1. Design Document Bleeding
The design.md contains specific technical implementation details (file paths, class names, structure) which the task generator literally translates into tasks.

### 2. Waterfall Heritage
The RDT format inherits from waterfall-friendly methodologies where:
- Requirements are fully defined first
- Design is completed before implementation
- Tasks implement the predetermined design

But vertical slicing requires **emergent design** where technical decisions arise from immediate feature needs.

### 3. Role-Based Thinking
The format assumes different people handle each phase:
- Product Owner writes requirements
- Architect writes design
- Developers execute tasks

Vertical slicing assumes **feature teams** where the same group handles all aspects of a feature slice.

## Solutions

### Solution 1: Redefine Task Language Pattern

Transform task language from implementation-focused to outcome-focused:

| ❌ Anti-Pattern | ✅ Vertical Slice |
|-----------------|-------------------|
| Create state management file | Enable code counter to persist between sessions |
| Implement game loop | Make developers produce code automatically |
| Add navigation structure | Allow players to switch between company and department views |
| Set up persistence layer | Ensure game progress saves and restores |

### Solution 2: Task Template Enforcement

Require all tasks to follow this template:
```markdown
- [ ] [User/Player] can [action] and [sees result]
  - Technical implementation details
  - Files created/modified as needed
  - _Requirements: X.Y_
```

### Solution 3: Hybrid Approach - Features with Technical Sub-bullets

Reframe tasks as mini user stories with implementation details as sub-items:

```markdown
- [ ] Player can click "WRITE CODE" and see persistent code count
  - Button shows and responds to clicks within 50ms
  - Number increases and displays with animation
  - State persists using Legend-State + MMKV (create gameState.ts as needed)
  - Verify persistence across app restarts
  - _Requirements: 1.1, 1.3_
```

### Solution 4: Add Validation Rules to Spec Generator

The spec command should validate each task:
1. Does this task mention a user-visible outcome?
2. Can you demo this to a non-technical person?
3. Does the task name avoid technical file paths?
4. What can the user do after this task they couldn't before?

If any answer indicates a horizontal task, regenerate it.

### Solution 5: Separate "How to Build" from "What to Build"

Use design.md as a **reference architecture** not a **build sequence**:
- Design shows the eventual technical structure
- Tasks build features that gradually create that structure
- Structure emerges from feature needs, not upfront creation

## Key Insights

### State Management Should Never Be Its Own Task
State management should emerge from implementing user-facing features. When you need to track something for a feature, that's when you create the state structure.

### The Design Paradox
Having a detailed design.md is valuable for technical coherence, but tasks.md should still be written as if we're discovering the design through feature implementation.

### Vertical Slicing is About Task Framing, Not Avoiding Planning
We can still have detailed technical designs, but tasks must be framed as complete user value deliveries, with technical work happening in service of that value.

## Recommendations

### For the Spec Command
1. Update task generation prompts to forbid infrastructure-only tasks
2. Add user outcome validation for each generated task
3. Include vertical slicing principles in the task generation context
4. Generate tasks that read like user stories, not technical todos

### For the Development Process
1. Treat design.md as a technical vision, not a build order
2. Allow technical structure to emerge from feature implementation
3. Always ask "what can the user do now?" after each task
4. Resist the urge to "set up" before delivering value

### For Documentation
1. Add a section to development-methodology.md about this tension
2. Update SPECIFICATION_FORMAT_ANALYSIS.md to note vertical slicing adaptation
3. Create examples of good vs bad task formulation
4. Document that tasks.md follows different principles than traditional RDT

## Conclusion

The tension between RDT format and vertical slicing is reconcilable by:
1. Maintaining the three-document structure for comprehensive planning
2. Adapting tasks.md to focus on user outcomes rather than technical implementation
3. Treating technical design as emergent from feature needs rather than prerequisite work
4. Validating all tasks against vertical slicing principles

The key is recognizing that **good architecture can be planned upfront, but should be built incrementally through user-valuable features**.