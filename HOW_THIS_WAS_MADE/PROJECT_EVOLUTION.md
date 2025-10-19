# Project Evolution: Class One Rapids

## Executive Summary

**Class One Rapids** is an experimental project answering the question: _"How to create an agentic, spec-driven development system using modern context engineering techniques?"_ The project evolved from September 2025 through October 2025 as a meta-development exercise—using Claude Code to build both:

1. A custom workflow system (slash commands for PRD → Design → Tasks → Execution)
2. An idle/clicker mobile game as the test application

The development followed an iterative "meta-learning" approach where the system improved itself through reflection commands and conversation analysis.

This document focuses on the v2 development that began September 20, 2025. For v1 history and experiments (August 3-20, 2025), see [V1_HISTORY.md](V1_HISTORY.md).

---

## Timeline: Major Milestones

### Phase 1: Foundation & Command System (September 16-20, 2025)

**September 16-18: Command System Crystallization**
The earliest conversations show intensive work on the command system:

**September 16** (`c32484e2-53fc-4f17-afd7-aca097ff1915.jsonl`):

- Created comprehensive `/research` command with multi-phase methodology
- Established template for research documents
- Researched PRD best practices and Claude Code command creation patterns

**September 17** (`38dc211e-1873-4bce-a484-cd8ef4cba237.jsonl`):

- Created `/prd` command from scratch using synthesized research
- Research guides utilized:
  - PRD Guide (`prd_guide_20250917_021835.md`)
  - Claude Code Commands Guide (`claude_code_commands_guide_20250916_060309.md`)
  - TDD Guide (`technical_design_doc_guide_20250917_211332.md`)
  - LLM Task Description Guide (`llm_task_description_guide_20250917_203619.md`)
- Established core workflow: Feature Description → /prd → /design → /tasks

### Phase 2: Application Implementation (September 17-29, 2025)

**The Test Application**
Research documents show the target application chosen:

- Mobile idle/clicker game as a test case for the development system
- Core mechanic: Simple tap interactions with visual feedback
- Progression: Multiple attribute system for player advancement
- MVP focused on "traditional fun" - one perfect mechanic polished extremely well

**September 17-18: React Native Architecture Research**

- Researched Legend-State for fine-grained state management
- Expo SDK 54 setup and testing configuration
- React Native Testing Library patterns
- Feature-based file organization patterns

**September 18-21: Testing Setup Struggles**
Conversations show extensive work on:

- Jest configuration with Expo
- `react-test-renderer` version conflicts
- Setting up Testing Library properly
- Solution eventually documented in README

**September 20: Major Pivot**

- "v2 - quick save before redoing tech design doc/task generation"
- Recognition that task generation needed improvement
- Began refining how TDD → Tasks conversion worked

**September 21-25: Architecture Documentation**

- Created `organizing_expo_apps_by_feature_20250921_113000.md`
- Established file organization patterns
- **Critical lesson learned**: NO barrel exports (`index.ts`), co-located tests
- Feature-based modules structure:
  ```
  src/modules/[feature]/
    Component.tsx
    Component.test.tsx  # Co-located!
    useFeature.ts
    useFeature.test.ts
  ```

**September 25-28: First Feature Implementations**

- "2025-09-25 - used this run to tweak /tasks to avoid infrastructure only tasks"
- Implemented power progression system
- "power progression feature complete" (September 28)
- Created `/execute-task` command for TDD-driven implementation

**September 28-29: Debugging & Iteration**

- Largest conversation file (2.2MB) dated September 29
- Extensive debugging of a Python web scraper (unrelated side project)
- Multiple refinements to task execution flow

### Phase 3: Reflection & Refinement (September 25 - October 5, 2025)

**September 25-26: Test Infrastructure**

- "Success run! Committing test 20250925 before starting a new test after changes to core scripts"
- "test tools successfully installed" (September 26)
- Established repeatable testing patterns

**October 2-5: State Management Crisis & Resolution**
The attributes system implementation exposed critical gaps:

**The Problem Encountered** (`execute-task-state-management-improvements.md`):

- Agent used React Context API instead of Legend-State
- State management guidance was "buried in the middle" of execute-task.md
- Resulted in incorrect architecture requiring refactoring

**The Solution Implemented** (October 5 analysis document):

- Added "State Management Decision Tree" early in execute-task.md
- Created "Common Pitfalls" section with anti-patterns
- Established clear hierarchy:
  - Single component? → `useState`
  - Complex but local? → Custom hook
  - **Multiple features? → Legend-State store**
  - NEVER React Context for state management

**October 3: Meta-Improvement**

- "resolved some 'lessons' learned by reflection by updating command directly and moving content out of claude.md"
- Used `/reflect-convo` to analyze what went wrong
- Updated commands based on reflection insights
- Moved excessive guidance out of CLAUDE.md into focused documents

**October 5: Simplified Attributes Implementation**
Created comprehensive PRD for attributes system (`prd_simplified_attributes_20251005.md`):

- Problem: Single "Power" metric lacked player agency
- Solution: Three attributes (Strength/Coordination/Endurance)
- Success metrics defined
- Full TDD and task list generated

### Phase 4: Command Ecosystem Maturity (October 2025)

**Final Command Set**:

1. `/research` - Comprehensive research with multiple perspectives
2. `/research-technical` - Technical documentation and API research
3. `/prd` - Generate Product Requirements Documents
4. `/design` - Generate Technical Design Documents with TDD strategy
5. `/tasks` - Generate explicit, agent-executable task lists
6. `/execute-task` - TDD-driven feature implementation
7. `/reflect` - Analyze issues and update commands
8. `/reflect-convo` - Analyze conversation history for improvements
9. `/reflect-bug` - Root cause analysis for bugs
10. `/next-feature` - Identify next feature to implement
11. `/next-feature-full-flow` - Full PRD→Design→Tasks→Execute flow
12. `/add-docs` - Add documentation (experimental)
13. `/refactor` - Extract features into modules (experimental)

---

## Research & Command Development Progression

### How Research Shaped Development Process

Conversations reveal a critical pattern: every major breakthrough came from targeted research that directly informed command creation. Research flowed into practical implementation through:

**Research → Discovery → Implementation Cycle**:

1. Problem identification (e.g., "How to create commands?")
2. Focused research (created research documents)
3. Extract actionable patterns from research
4. Implement patterns in commands
5. Test with real features
6. Reflect and refine based on failures

### Timeline: Research → Commands Development

#### **September 16, 2025: Foundation Research**

**1. Claude Code Commands Research** (`claude_code_commands_guide_20250916_060309.md`)

- **Initial Problem**: JavaScript command attempts kept failing
- **Research Focus**: Official Claude Code command structure and best practices
- **Key Discovery**: Commands are markdown files in `.claude/commands/` with optional YAML frontmatter
- **Implementation**: JavaScript approach abandoned, markdown adopted
- **Result**: `/research` command - first working command that could generate focused research documents
- **Lesson**: Tool's native approach often simpler than assumptions

#### **September 17, 2025: Specification Research Phase**

**2. PRD Guide Research** (`prd_guide_20250917_021835.md`)

- **Problem**: Needed structured way to capture requirements that agents could understand
- **Research Sources**: Product Requirements Document best practices from Lean Startup, Agile
- **Key Elements Extracted**: User stories, acceptance criteria, success metrics
- **Application**: Created `/prd` command template with these exact sections
- **Result**: Consistent PRDs that translate cleanly to technical designs

**3. LLM Task Description Guide** (`llm_task_description_guide_20250917_203619.md`)

- **Problem**: Tasks too vague, agents kept misinterpreting them
- **Research Focus**: How to write instructions that AI agents execute correctly
- **Key Discovery**: Specificity + context + clear acceptance criteria = success
- **Implementation**: Built these patterns into `/tasks` command output format
- **Result**: Task execution success rate dramatically improved

**4. Technical Design Document Guide** (`technical_design_doc_guide_20250917_211332.md`)

- **Problem**: Gap between PRD requirements and actual implementation
- **Research**: Industry-standard TDD practices and architecture documentation
- **Key Elements**: System architecture, API design, testing strategy
- **Applied As**: `/design` command that bridges PRD → implementation
- **Result**: Clear architectural decisions before coding begins

**5. Expo Legend-State v3 Guide** (`expo_legend_state_v3_guide_20250917_225656.md`)

- **Problem**: React Context causing performance issues and complex code
- **Research Focus**: Modern state management solutions for React Native
- **Why Legend-State Selected**: Fine-grained reactivity, computed values, persistence
- **Implementation**: Made mandatory in `/execute-task` command
- **Result**: Cleaner state management (after initial Context API failure)

#### **September 18, 2025: Testing & Architecture Research**

**6. React Native Testing Library Guide** (`react_native_testing_library_guide_20250918_184418.md`)

- **Goal**: Establish testing patterns for React Native
- **Key Patterns**: Component testing, async handling, mocking
- **Impact**: TDD approach in `/execute-task` command

#### **Application Design Research (Various dates)**

**7. Game Mechanics Research**

- Researched classic RPG mechanics and progression systems
- Multi-attribute systems for character development
- Skill trees and specialization patterns

**8. Mobile Game Best Practices**

- Progression mechanics
- Offline calculation patterns
- Prestige systems

**9. Traditional Fun Game Design**

- Focus on "one perfect mechanic polished extremely well"
- MVP approach for mobile games

#### **October 12, 2025: Meta-Research**

**10. AI Agent Evaluation Best Practices** (`ai_agent_evaluation_best_practices_20251012.md`)

- **Need**: Learn how to evaluate and improve agent performance
- **Impact**: Influenced `/reflect` and `/reflect-convo` commands

### Command Creation Sequence

Based on research, commands were created as follows:

1. **`/research`** (Sep 16)

   - First command created
   - Based on Claude Code command structure research
   - Multi-phase methodology: Initial exploration → Multiple perspectives → Deep investigation → Critical analysis → Synthesis

2. **`/prd`** (Sep 17)

   - Based on PRD Guide research
   - Structure: Business context → Problem statement → Requirements → Success metrics

3. **`/design`** (Sep 17-18)

   - Based on Technical Design Document Guide
   - Includes: Architecture → API design → Testing strategy → TDD approach

4. **`/tasks`** (Sep 18-20)

   - Based on LLM Task Description Guide
   - Evolution: Initially created infrastructure tasks → Refined to start with user-visible features

5. **`/execute-task`** (Sep 25-28)

   - Based on React Native Testing Library Guide + Legend-State research
   - TDD methodology: RED → GREEN → REFACTOR
   - Major refinement after attributes system failure (Oct 5)

6. **`/reflect`** (Late September)

   - Based on iterative learning from failures
   - Analyzes what went wrong and updates commands

7. **`/reflect-convo`** (October)

   - Based on AI Agent Evaluation research
   - Analyzes conversation history for patterns

8. **`/next-feature`** (October)

   - Emerged from need to identify what to build next
   - References high-level docs and existing implementation

9. **`/next-feature-full-flow`** (October)
   - Automation of entire pipeline
   - Chains: next-feature → prd → design → tasks → execute

### Key Pattern Discovered: Research → Command → Refinement

The progression shows a clear pattern:

1. **Research Phase**: Gather best practices and patterns
2. **Command Creation**: Implement command based on research
3. **Real-World Testing**: Use command on actual features
4. **Failure Analysis**: Identify what went wrong
5. **Refinement**: Update command with lessons learned

### Most Impactful Research

1. **Claude Code Commands Guide**: Without this, JavaScript/Python scripts would have continued failing
2. **PRD Guide**: Established specification-driven approach
3. **Legend-State Research**: Solved state management architecture issues
4. **Testing Library Guide**: Enabled TDD methodology

---

## Key Patterns & Evolution

### 1. Meta-Learning Approach

The project demonstrates "self-improving development":

- Conversations analyzed to identify failure patterns
- Commands updated based on reflection insights
- Architecture guides created from learned lessons
- Each iteration improved the system itself

### 2. Research-Driven Development

Every major decision backed by research:

- PRD best practices (from Lean Startup, Agile methodologies)
- TDD workflows (from React Native Testing Library)
- State management (Legend-State v3 guide)
- File organization (feature-based architecture)
- Idle game design (from successful mobile games)

### 3. Command Evolution Patterns

**Early Commands** (August):

- Monolithic, trying to do too much
- Verbose prompts
- Unclear tool boundaries

**Mature Commands** (September-October):

- Focused, single-responsibility
- Reference external architecture documents with `@` syntax
- Clear phase-based execution
- Mandatory checklists
- CRITICAL sections for common mistakes

### 4. Testing Philosophy Evolution

**Initial State** (August-September):

- Testing seen as separate phase
- Configuration nightmares with Jest/Expo

**Final State** (October):

- Test-Driven Development mandatory
- Red-Green-Refactor cycle enforced
- Tests co-located with implementation
- Testing guide referenced in all implementation commands

### 5. Documentation Strategy

**The Problem**:

- Initial CLAUDE.md became bloated with too much guidance
- Commands referenced it but guidance wasn't at the right time

**The Solution**:

- Move detailed guides to `/docs/architecture/`
- Commands reference specific guides with `@` syntax
- CLAUDE.md keeps only project-specific rules
- Commands include CRITICAL sections for common mistakes

---

## Technical Insights

### State Management Lesson

**Critical Learning**: The attributes system implementation failure revealed that _when_ and _where_ architectural guidance appears matters more than _what_ it says.

**Before**:

- State management explained on line 300 of execute-task.md
- Agent missed it and used React Context

**After Fix**:

- Decision tree at line 20
- Common pitfalls section with examples
- Pre-execution checklist includes state management validation
- Clear hierarchy: useState → Custom Hook → Legend-State

### Command Design Philosophy Developed

**Declarative over Imperative**:

```markdown
# Bad

"You should think about creating a component that handles user input"

# Good

"Create UserInput.tsx component following:

- Co-locate test: UserInput.test.tsx
- Use useState for local form state
- Reference: @docs/architecture/organizing_expo_apps_by_feature.md"
```

**Context Engineering**:

- Commands inject role context ("You are a senior React Native developer")
- Reference specific sections of TDDs/PRDs
- Include acceptance criteria directly in tasks
- Provide examples of correct and incorrect approaches

### Lean Task Generation Discovery

Important lesson documented:

- **Old approach**: Generate infrastructure tasks first (folders, configs, setup)
- **New approach**: First task MUST deliver user-visible functionality
- **Rationale**: Keeps focus on value delivery, creates just-in-time infrastructure

Example:

```markdown
# Bad Task 1

"Set up project folder structure"

# Good Task 1

"Implement tap-to-attack enemy with immediate damage feedback"
(Creates necessary files/folders as part of feature implementation)
```

---

## Development Flow (Final Form)

### Workflow Pipeline

1. **Feature Ideation** → Research & Validate

   ```bash
   /research "idle game progression systems"
   /research-technical "React Native state management libraries"
   ```

2. **Requirements** → Generate PRD

   ```bash
   /prd "Add attribute system with strength/coordination/endurance"
   # Creates: docs/specs/[feature]/prd_feature_YYYYMMDD.md
   ```

3. **Design** → Generate TDD

   ```bash
   /design docs/specs/[feature]/prd_feature_YYYYMMDD.md
   # Creates: docs/specs/[feature]/tdd_feature_YYYYMMDD.md
   ```

4. **Planning** → Generate Tasks

   ```bash
   /tasks docs/specs/[feature]/tdd_feature_YYYYMMDD.md
   # Creates: docs/specs/[feature]/tasks_feature_YYYYMMDD.md
   ```

5. **Implementation** → Execute Tasks

   ```bash
   /execute-task docs/specs/[feature]/tasks_feature_YYYYMMDD.md [task-id]
   # Follows TDD: RED → GREEN → REFACTOR
   ```

6. **Validation** → Test & Build

   ```bash
   npm test
   # User validates feature works
   ```

7. **Reflection** → Improve System
   ```bash
   /reflect-convo "attributes implementation"
   # Analyzes what went wrong, updates commands
   ```

### Human-in-the-Loop Points

- After PRD generation: Validate requirements
- After TDD generation: Validate architecture decisions
- After each task execution: Test feature manually
- After feature complete: Run reflection to improve commands
- Before committing: Validate all tests pass

---

## Current State & Known Issues

### What's Working Well

- Command system is mature and well-documented
- Research → PRD → Design → Tasks pipeline is solid
- TDD-driven implementation enforced
- State management patterns established
- Architecture guides are comprehensive

### Known Todos

- Game balance needs tuning
- Docs folder needs organization

### Issues Discovered During v2 Development

These issues were observed during v2 implementation (September-October 2025) and informed command refinements:

#### Alternative Approaches Considered (but not implemented)

During v2 development, these patterns were explored but ultimately not pursued:

- Consideration of a `/plan` command to replace `/prp` with 1 human in the loop for the plan that includes both product and tech overview
- Pros and cons to roles to narrow focus
- Making a `/plan` command (as well as context/prompting techniques for executing that plan)

**Why not implemented**: The existing flow of `/prd` → `/design` → `/tasks` already provided sufficient human-in-the-loop checkpoints, and combining product + tech into one step would reduce iteration flexibility.

#### General Development Patterns

1. **Folder Organization**: By-feature organization not common for small React apps as they tend to be small
2. **Fine-Grained State Management**: Difficulty with non-established patterns (led to Legend-State standardization)
3. **Starting New Projects**: Agent tends to overthink initial setup
4. **Config Management**: Creates configs ahead of time instead of incrementally
   - Should update configs step by step per item relevant to the step
   - Don't use a "standard config" - start with seed project and build on that
5. **MVP vs POC Terminology**: Big focus on marketing, metrics, and full testing suite when talking about "MVP" - should use "POC" instead
6. **Tooling Knowledge**: Tries adding babel config - no knowledge of babel-preset-expo or other modern built-in Expo options
7. **Code Validation**: Tries to validate code in ways that cause it to freeze/pause
8. **Jest Compatibility**: Ongoing challenges with Expo integration
9. **Research Bloat**: Research becomes bloated and overwhelming, too much can overwhelm context
10. **Memory Capabilities**: Memory limitations affect long conversations
11. **Persistence**: Hard time giving up, or realizing something isn't their fault
12. **Architecture Understanding**: Data flow and architecture understanding gaps
13. **Code Refactoring**: Tends toward weird folder structures
14. **Architecture Patterns**: Prefers services over hooks, classes over functions
15. **Performance Requirements**: Sometimes inappropriately strict for MVPs (e.g., 60 FPS focus from PRD generation)

---

## Lessons for Others Building Similar Systems

### 1. Start with the Command System

Don't build the app first. Build the development automation system and use a real app as the test case. The app validates whether the workflow works.

### 2. Research is Load-Bearing

High-quality, example-driven research documents are critical. They become the "knowledge base" that commands reference. Without them, commands must include everything inline (bloat).

### 3. Reflection is Not Optional

The `/reflect` commands enable self-improvement. Without systematic reflection, mistakes repeat.

### 4. Architecture Docs > CLAUDE.md

Don't put everything in CLAUDE.md. Create focused architecture guides that commands reference when needed. This keeps context lean and targeted.

### 5. Mandatory Sections Matter

The shift from "explained somewhere in the document" to "CRITICAL section at line 10 with decision tree" made the difference between success and failure.

### 6. Co-Located Tests are Non-Negotiable

Putting tests in `__tests__/` folders means they get forgotten. `Component.tsx` next to `Component.test.tsx` ensures they're maintained.

### 7. Lean Task Generation Changes Everything

First task delivering user-visible functionality completely changes how implementation proceeds. Infrastructure becomes just-in-time, not up-front.

### 8. State Management Must Be Obvious

The attributes system failure proves: if state management patterns aren't immediately visible and enforced, agents will use familiar but incorrect patterns (React Context).

### 9. Example-Driven Commands Win

Commands with code examples showing correct and incorrect approaches work better than abstract principles.

### 10. Iteration is The Process

The project shows 30+ commits over 2 months with continuous refinement. There's no "final" form—the system evolves with use.

---

## Conclusion

**Class One Rapids** demonstrates a successful experiment in meta-development: using AI-assisted tools to build better AI-assisted development workflows. The key insight: the _system_ is the product, not the game—though the game provides essential validation.

Evolution from confused JavaScript attempts to mature, reflection-driven command workflows shows that structured iteration with systematic reflection creates compounding improvements. Each analyzed mistake becomes a guard rail in future commands.

The project proves that spec-driven development with AI assistance is viable when:

1. Research establishes the knowledge foundation
2. Commands enforce architecture patterns
3. Reflection systematically improves the system
4. Human validation occurs at key decision points
5. Documentation is structured for machine consumption

The resulting workflow (Research → PRD → TDD → Tasks → Execute → Reflect) provides a template others can adapt for their own contexts and technology stacks.
