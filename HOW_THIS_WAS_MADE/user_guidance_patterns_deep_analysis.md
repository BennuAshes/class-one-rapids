# User Guidance Patterns: Deep Analysis
## Making the /reflect-convo Command More Proactive

**Analysis Date**: October 18, 2025
**Conversations Analyzed**: 123 conversation files
**Data Points Extracted**: 792 guidance patterns, 498 corrections, 213 questions, 394 reflective moments

---

## Executive Summary

This analysis examined 123 conversations to identify **what questions and guidance the user had to provide for things to work**. The goal is to make the `/reflect-convo` command more proactive by understanding when Claude needs prompting versus acting independently.

### Key Findings

1. **Most Common Correction**: Factual corrections (399 instances) - Claude made wrong assumptions or missed context
2. **Most Common User Question**: Clarifying Claude's decision-making process ("Why did you...")
3. **Critical Pattern**: User repeatedly had to say "Why did you only change X instead of Y?" - indicating Claude focused on wrong targets
4. **Red Flag**: When Claude couldn't find something, it often made assumptions rather than asking
5. **Missing Proactive Behavior**: Claude rarely paused to verify it understood the task correctly before executing

---

## 1. Top 10 User Guidance Patterns

These are the most frequent things the user had to tell Claude, ranked by frequency and impact:

### #1: "Why did you only change X? You should have changed Y instead"
**Frequency**: Very High
**Example**:
> "Why did you only change CLAUDE.md? I feel like that should have maybe been the last one to update, if at all. Can you help me understand why you chose this place instead of specific commands?"

**Pattern**: Claude focused on the wrong target when given a task about improving the system.
- User asked to implement suggestions from a reflection document
- Claude updated CLAUDE.md (general guidance)
- **Should have**: Updated the specific command files (.claude/commands/*.md) where the problems actually occurred

**Why This Matters**: Claude defaulted to high-level guidance when the real issues were in execution-level prompts.

**Reflection Trigger**: When asked to "fix" or "improve" something based on analysis, pause and ask: "Where is the problem actually happening? Where is this pattern being executed?"

---

### #2: "Stop. This is a MAJOR change. Ask me first."
**Frequency**: High
**Example**:
> "Stop. Why are you reverting all the versions? This is a MAJOR change in infrastructure. What can I add to claude.md to prevent you from doing this without talking to me first?"

**Pattern**: Claude made destructive or high-impact changes without asking for approval.
- User caught Claude trying to change package versions
- This violated the implicit understanding that infrastructure changes need approval
- Led to explicit rule in CLAUDE.md: "NEVER change package versions without explicit user approval"

**Why This Matters**: Some changes look like simple fixes but have cascading consequences.

**Reflection Trigger**: Before making changes to:
- Package versions or dependencies
- Configuration files (jest.setup.js, babel.config.js, etc.)
- Git operations (checkout, stash, reset)
- File deletions or moves

Ask yourself: "Is this a reversible change? Could this break existing functionality? Should I ask first?"

---

### #3: "Don't read each file, just make a best guess based on the title. If you're unsure, ask."
**Frequency**: High
**Example**:
> "Update @ARGUMENTS with appropriate documentation for what its doing. Don't read each file, just make a best guess based on the title. If you're unsure, ask."

**Pattern**: User had to explicitly tell Claude to be efficient and not over-analyze.
- Claude's default is to read everything
- Sometimes this is wasteful when file names/titles are descriptive
- User wants Claude to use judgment and ask when truly uncertain

**Why This Matters**: Reading files costs time and tokens. User values efficiency when the task doesn't require deep analysis.

**Reflection Trigger**: When asked to document or describe multiple files:
1. Check if the file names/titles are descriptive enough
2. If yes, work from names and ask only when truly uncertain
3. If no, read the files

---

### #4: "Remember, this project uses X"
**Frequency**: Moderate
**Example**:
> "This project uses Legend-State, not Zustand"
> "Remember, we organize by feature, not by type"

**Pattern**: Claude forgot or didn't check existing project patterns.
- User had to remind Claude about architectural decisions already made
- This happened even when the information was in documentation
- Suggests Claude needs to check project context more consistently

**Why This Matters**: Each reminder is a friction point. Claude should proactively check architecture docs before suggesting patterns.

**Reflection Trigger**: Before suggesting state management, file organization, or architectural patterns:
1. Check docs/architecture/ for existing patterns
2. Check existing code for examples
3. Check CLAUDE.md for project preferences

---

### #5: "Can you help me understand why you chose X?"
**Frequency**: Moderate
**Examples**:
> "Can you help me understand why you chose this place instead of specific commands?"
> "Why is this referencing a provider?"
> "Why do the lines here have 'echo' in the name?"

**Pattern**: User requesting Claude explain its reasoning.
- User wanted to understand Claude's decision-making process
- Sometimes Claude's choices made sense but weren't obvious
- Other times Claude made mistakes that became clear when explained

**Why This Matters**: Being able to explain reasoning helps catch mistakes and builds trust.

**Reflection Trigger**: When making non-obvious decisions, proactively explain:
- "I'm choosing X over Y because..."
- "This might seem counterintuitive, but..."
- "The reason I'm starting with X is..."

---

### #6: "First do A, then B, don't skip C"
**Frequency**: Moderate
**Examples**:
> "Before you create files, verify the parent directory exists"
> "Write the test FIRST, then implement"

**Pattern**: User had to enforce process discipline.
- Claude sometimes skipped verification steps
- User valued TDD discipline (test-first) but Claude didn't always follow
- Verification steps (pwd, ls) were seen as crucial but Claude treated them as optional

**Why This Matters**: Process discipline prevents errors. User shouldn't have to remind Claude of the process.

**Reflection Trigger**: Before file operations, automatically:
1. Verify working directory (pwd)
2. Check parent directories exist (ls)
3. Only then create files

Before implementation:
1. Write failing test
2. Implement minimal code
3. Refactor

---

### #7: "Instead of X, do Y"
**Frequency**: Moderate
**Examples**:
> "Don't use React Context for state, use Legend-State"
> "Don't create service classes, use hooks"
> "Tests should be co-located, not in __tests__ folders"

**Pattern**: User correcting architectural approach.
- Claude suggested patterns that were valid in general but wrong for this project
- Often these were common patterns (Context, services, __tests__ folders)
- Project had specific preferences that diverged from common practice

**Why This Matters**: Claude needs to learn project-specific preferences and apply them consistently.

**Reflection Trigger**: When suggesting architecture, check:
1. Is this a common pattern that the project explicitly avoids?
2. Have I checked project conventions in docs/architecture/?
3. Are there examples in the codebase I should match?

---

### #8: "Wait, are you actually using [wrong model]?"
**Frequency**: Low but Critical
**Example**:
> "Wait are you actually using sonnet3.5 for all of this"

**Pattern**: User caught Claude using wrong configuration.
- User expected certain tasks to use specific models
- Claude didn't verify or communicate what model was being used
- This matters for cost and capability trade-offs

**Why This Matters**: Resource usage should match task requirements. User should be informed of trade-offs.

**Reflection Trigger**: For expensive or long-running operations, state:
- "I'll use [model] for this task because..."
- "This will take approximately X time/tokens"
- "Would you prefer I use a faster/cheaper approach?"

---

### #9: "Lets add this to a separate file and reference it"
**Frequency**: Moderate
**Example**:
> "lets add the rules for working directory context to a separate file and reference it by the current places that use it you just updated"

**Pattern**: User suggesting refactoring for maintainability.
- Claude duplicated content across multiple files
- User recognized this created maintenance burden
- User suggested DRY (Don't Repeat Yourself) refactor

**Why This Matters**: User cares about maintainability. When content appears in multiple places, suggest extracting it.

**Reflection Trigger**: After making similar changes to multiple files:
- "I notice this content appears in X places. Would you like me to extract it to a shared file?"
- Proactively suggest creating shared documentation when duplication emerges

---

### #10: "You should have checked for existing state management patterns BEFORE creating new files"
**Frequency**: Moderate
**Example from execute-task.md**:
```bash
# Check for existing state management (BEFORE creating new files)
echo "Checking for existing state management patterns..."

# Check for Legend-State stores
find src/modules/*/[feature]Store.ts 2>/dev/null

# Check for custom hooks
find src/modules/*/use*.ts 2>/dev/null
```

**Pattern**: User had to add explicit pre-checks to commands.
- Claude created new files without checking if similar functionality existed
- This led to duplication and inconsistent patterns
- User encoded this as a mandatory step in execute-task.md

**Why This Matters**: Always check what exists before creating something new.

**Reflection Trigger**: Before creating any state management, components, or utilities:
1. Search for existing similar functionality
2. Check if the feature already has a store/hook
3. Ask if unsure whether to extend existing or create new

---

## 2. Red Flags - Patterns That Indicate Claude Is About to Make a Mistake

These patterns signal that Claude is operating on wrong assumptions and should pause:

### Red Flag #1: "I couldn't find X, so I'll assume Y"
**Signal**: Claude says it can't find something and makes an assumption instead of asking.

**Example**:
> "I couldn't find the command files - When I searched for /tasks and /execute-task command definitions, I didn't find them as separate .md files... I incorrectly assumed these were built-in Claude Code commands that couldn't be modified"

**What Actually Happened**: The files existed at `.claude/commands/*.md` but Claude didn't check there.

**Correct Behavior**: When you can't find something that should exist:
1. Try multiple search strategies (.claudecode/commands/, .claude/commands/, etc.)
2. Ask the user where it's located
3. Never assume and proceed - that compounds the error

---

### Red Flag #2: Starting execution immediately without confirming understanding
**Signal**: Claude jumps straight into implementation without summarizing the task or checking assumptions.

**Example**: User says "execute a plan that reflects the suggestions made here" and Claude immediately starts editing CLAUDE.md without:
- Summarizing what the suggestions were
- Identifying where they should be implemented
- Asking if the approach is correct

**Correct Behavior**: When given a complex task:
1. Read and analyze the requirements
2. Summarize your understanding: "I see X suggestions: A, B, C. I plan to..."
3. Identify where changes should go: "These should be applied to [files/locations]"
4. Ask if anything is unclear before executing

---

### Red Flag #3: Providing a summary that claims success without verification
**Signal**: Claude says "✅ Completed Updates" but hasn't run tests or verified the changes work.

**Example**:
```markdown
## Summary
I've successfully implemented the critical updates to CLAUDE.md based on the reflection document's recommendations:

### ✅ Completed Updates:
1. **Project Structure and Paths Section** - Prevents nested directory issues...
```

Then user immediately catches that the wrong files were changed.

**Correct Behavior**: Before claiming completion:
1. Verify changes were applied to the right targets
2. Run relevant tests if applicable
3. Use language like "I've made these changes..." not "Successfully implemented"
4. List what was changed and invite review

---

### Red Flag #4: Creating infrastructure before it's needed
**Signal**: Claude creates stores/, types/, utils/ folders or barrel exports when implementing a simple feature.

**Example**: User wants a single component, Claude creates:
- ComponentName.tsx
- ComponentName.test.tsx
- index.ts (barrel export)
- types.ts
- stores/componentStore.ts

**Correct Behavior**: Start minimal:
1. Create only what the immediate requirement needs
2. Use useState in component initially
3. Extract to custom hook only when logic gets complex
4. Create store only when state needs to be shared across features
5. No barrel exports unless explicitly requested

---

### Red Flag #5: Making "helpful" changes that weren't requested
**Signal**: Claude adds extra features or improvements beyond the ask.

**Example**: User asks to fix a test, Claude also:
- Refactors the implementation
- Adds additional test cases
- Updates related documentation
- "Improves" variable names

**Correct Behavior**:
1. Do exactly what was asked, nothing more
2. After completing the ask, offer additional improvements: "I noticed X, would you like me to also..."
3. Respect that the user may have specific reasons for the current state

---

### Red Flag #6: Duplicating content across files instead of referencing
**Signal**: Claude copies the same content to multiple files.

**Example**: Adding working directory context to:
- CLAUDE.md
- tasks.md
- execute-task.md
- design.md

**Correct Behavior**: When the same content needs to be in multiple places:
1. Create it once in a logical location (e.g., docs/architecture/working-directory-context.md)
2. Reference it from other places with @ notation
3. This makes maintenance easier and prevents drift

---

### Red Flag #7: Changing configuration files without asking
**Signal**: Claude modifies jest.setup.js, babel.config.js, package.json, etc.

**Example from CLAUDE.md**:
> "NEVER remove/replace code in test setup files (jest.setup.js, etc)"

This rule exists because Claude was doing this without asking.

**Correct Behavior**: Configuration files are special:
1. Never modify without explicit permission
2. ADD to config, don't replace
3. If change is needed, explain why and ask first
4. If unsure about existing config code, leave it unchanged

---

## 3. Missing Proactive Behaviors

Things Claude should do without being asked:

### Proactive Behavior #1: Explain non-obvious decisions
**Current**: Claude makes decisions and only explains when asked "why?"
**Should**: Proactively explain reasoning for non-obvious choices

**Example**:
```
Current: *Creates featureStore.ts*

Better: "I'm creating a Legend-State store instead of using useState because this state
will be accessed by multiple features (combat, UI, offline progression). If this feature
only needed local state, I'd use useState instead."
```

---

### Proactive Behavior #2: Check for existing patterns before creating new ones
**Current**: Claude creates new files without checking what exists
**Should**: Always search for existing patterns first

**Example**:
```
Current: *Creates attributesStore.ts*

Better:
*Runs: find src/modules -name "*Store.ts" -o -name "use*.ts"*
"I found existing stores for inventory and player. I'll create attributesStore.ts
following the same pattern I see in inventoryStore.ts"
```

---

### Proactive Behavior #3: Verify understanding before complex tasks
**Current**: Claude starts executing immediately
**Should**: Summarize understanding and confirm approach

**Example**:
```
Current: *Immediately starts editing files*

Better: "Let me make sure I understand:
1. The reflection document identified issues in command files, not CLAUDE.md
2. I need to update .claude/commands/tasks.md and execute-task.md
3. Key fixes: working directory context, no barrel exports, co-located tests
Is this correct?"
```

---

### Proactive Behavior #4: Suggest extracting duplication
**Current**: Claude duplicates content when asked to add it to multiple places
**Should**: Suggest creating shared content and referencing it

**Example**:
```
Current: *Copies working directory context to 3 different files*

Better: "I notice this working directory context is needed in multiple commands.
Would you like me to create docs/architecture/working-directory-context.md and
reference it from the commands instead? This would make it easier to maintain."
```

---

### Proactive Behavior #5: State assumptions and constraints upfront
**Current**: Claude discovers issues mid-execution
**Should**: Identify constraints before starting

**Example**:
```
Current: *Starts creating files, then realizes wrong directory*

Better: "Before I start, let me verify:
- Current working directory: /frontend/ (confirmed with pwd)
- Target location: src/modules/combat/
- Will create: Enemy.tsx and Enemy.test.tsx (co-located)
Proceeding..."
```

---

### Proactive Behavior #6: Reference project documentation automatically
**Current**: Claude often ignores or forgets project docs
**Should**: Check relevant docs before suggesting patterns

**Example**:
```
Current: "Let's use React Context for this shared state"

Better: "Let me check the project's state management patterns first...
*Reads docs/architecture/state-management-hooks-guide.md*
I see this project uses Legend-State for shared state, not Context. I'll create
a Legend-State store following the pattern in attributesStore.ts"
```

---

### Proactive Behavior #7: Warn about impact before destructive operations
**Current**: Claude makes breaking changes and reports them after
**Should**: Warn before operations that could break things

**Example**:
```
Current: *Changes package versions* "I've updated React Native to latest version"

Better: "⚠️ I notice the test setup imports from react-native-testing-library which
depends on specific React Native versions. Changing package versions could break tests.
Should I proceed with updating React Native, or should we check compatibility first?"
```

---

## 4. Reflection Triggers - When to Pause and Think

The improved `/reflect-convo` command should watch for these situations and trigger deeper reflection:

### Trigger #1: User says "Why did you..."
**Signal**: User is questioning Claude's decision-making
**Meaning**: Claude made a non-obvious choice or a mistake
**Reflection Action**:
- Analyze what decision was made
- Identify if it was wrong or just unexplained
- Suggest adding guardrails or explanations to prevent recurrence

---

### Trigger #2: User says "Stop" or "Wait"
**Signal**: Claude is doing something unexpected or wrong
**Meaning**: Claude didn't confirm understanding or is making dangerous changes
**Reflection Action**:
- Identify what Claude was about to do
- Determine if this should require user approval
- Add to CLAUDE.md critical rules if it's a category of change (like package versions)

---

### Trigger #3: User says "Remember" or "This project uses"
**Signal**: Claude forgot or didn't check existing patterns
**Meaning**: Claude needs to reference documentation more consistently
**Reflection Action**:
- Identify which documentation contains this information
- Add reminder to relevant commands to check this doc
- Consider if this should be in CLAUDE.md for visibility

---

### Trigger #4: User says "Instead of X, do Y"
**Signal**: Claude suggested a valid but wrong-for-this-project pattern
**Meaning**: Project has specific preferences that diverge from common practice
**Reflection Action**:
- Document the preference in architecture docs
- Update commands to explicitly mention this preference
- Add examples of the correct pattern

---

### Trigger #5: User corrects the same thing multiple times
**Signal**: Pattern of repeated corrections
**Meaning**: The rule isn't encoded effectively or isn't being checked
**Reflection Action**:
- Create a new "Critical" section in CLAUDE.md
- Add verification steps to relevant commands
- Consider if this needs a research document

---

### Trigger #6: User asks "Did you check X?"
**Signal**: Claude skipped a verification step
**Meaning**: There are expected checks that weren't performed
**Reflection Action**:
- Identify what should have been checked
- Add explicit verification step to relevant command
- Make it a mandatory step, not optional

---

### Trigger #7: User creates or updates command files
**Signal**: User is encoding guidance directly into commands
**Meaning**: Previous guidance wasn't specific enough or wasn't being followed
**Reflection Action**:
- Analyze what the user added
- This is direct evidence of what Claude should have done automatically
- Treat command additions as lessons learned

---

### Trigger #8: User says "ask me first" or "without approval"
**Signal**: Claude made a change that needed permission
**Meaning**: Category of changes needs to be gated behind approval
**Reflection Action**:
- Add to CLAUDE.md: "NEVER do X without explicit user approval"
- Identify related changes that should also need approval
- Create a checklist of "always ask first" operations

---

## 5. CLAUDE.md Evolution - How User Guidance Translated Into Rules

By examining git history and conversation patterns, we can see how user corrections became encoded rules:

### Evolution Pattern #1: From Repeated Correction to Critical Rule

**Initial State**: Claude occasionally changed package versions
**User Correction**: "Stop. Why are you reverting all the versions? This is a MAJOR change in infrastructure."
**Question**: "What can I add to claude.md to prevent you from doing this without talking to me first?"
**Encoded Rule**:
```markdown
## Critical
- NEVER change package versions (React, React Native, Expo, etc) without explicit user approval
- Version mismatches should be reported to user, not auto-fixed
```

**Pattern**: User caught a mistake → Asked how to prevent it → Added explicit "NEVER" rule

---

### Evolution Pattern #2: From Confusion to Explicit Guidance

**Initial State**: Claude created nested frontend/frontend/ directories
**User Correction**: Multiple conversations about wrong file locations
**Analysis**: User created reflection document analyzing the root cause
**Encoded Solution**:
1. Created docs/architecture/working-directory-context.md
2. Added references to it in execute-task.md and tasks.md
3. Added explicit "You are operating in: frontend/" statements

**Pattern**: Repeated problem → Root cause analysis → Centralized documentation + command integration

---

### Evolution Pattern #3: From Architectural Mistake to Structural Guidance

**Initial State**: Claude created service classes and barrel exports
**User Correction**: "uses 'services' instead of hooks - hooks should be used"
**Reflection**: User realized commands were showing wrong patterns
**Encoded Solution**: Updated execute-task.md with:
```markdown
### Anti-Patterns (What NOT to do)
1. **DON'T use React Context** for cross-feature state
2. **DON'T create service classes** for state management
3. **DON'T pass callbacks through multiple components** (prop drilling)
```

**Pattern**: Wrong pattern used → Identify where pattern came from → Add "What NOT to do" section with correct alternatives

---

### Evolution Pattern #4: From Implicit Expectation to Explicit Process

**Initial State**: Claude skipped pre-checks before file creation
**User Expectation**: Directory verification should be automatic
**Encoded Solution**: Added to execute-task.md:
```markdown
### Before ANY file creation:
1. Run `pwd` to verify you're in the frontend directory
2. Use `ls` to check if parent directories exist
3. Create files at `src/modules/[feature]/` NOT `frontend/src/modules/[feature]/`
```

**Pattern**: Implicit expectation → Made explicit → Turned into mandatory checklist

---

### Evolution Pattern #5: From Tool Misuse to Safety Rule

**Initial State**: Claude modified jest.setup.js by replacing content
**User Correction**: Caught Claude breaking test infrastructure
**Encoded Rule**:
```markdown
## Configuration Safety
- NEVER remove/replace code in test setup files (jest.setup.js, etc)
- ADD to existing config, don't replace
- If unsure about config code, leave it unchanged
```

**Pattern**: Destructive action → Category of files identified as sensitive → "NEVER replace" rule

---

### Evolution Meta-Pattern: The Reflection Loop

1. **User catches mistake** (correction)
2. **User asks "why?" or "how to prevent?"** (seeking understanding)
3. **Analysis of root cause** (often in reflection documents)
4. **Encoding the lesson**:
   - Simple mistakes → Add to CLAUDE.md Critical section
   - Process failures → Add verification steps to commands
   - Architectural issues → Create/update architecture docs
   - Tool misuse → Add to CLAUDE.md safety rules

---

## 6. Command Development Feedback Loops

How commands evolved through user feedback:

### Loop #1: /execute-task Command - State Management

**Version 1**: Generic "create stores for state management"
**User Feedback**: "uses services instead of hooks - hooks should be used"
**Version 2**: Added hook examples, but still mentioned stores
**User Feedback**: Wanted clear decision tree for when to use what
**Version 3**: Created explicit decision flow:
```
Is state local? → useState
Complex logic? → Custom hook (useFeatureName.ts)
Shared across features? → Legend-State store
```
**User Feedback**: Needed anti-patterns to show what NOT to do
**Version 4 (Current)**: Added "Anti-Patterns" section with:
- DON'T use React Context
- DON'T create service classes
- DON'T prop drill

**Pattern**: General → Specific → Decision Tree → Anti-Patterns

---

### Loop #2: /execute-task Command - File Organization

**Version 1**: Showed __tests__ folders in examples
**User Feedback**: "Tests should be co-located"
**Version 2**: Updated examples but still showed both patterns
**User Feedback**: Confusion about when to use which
**Version 3**: Made co-location mandatory:
```markdown
**Test Placement Rule**:
- Tests ALWAYS go next to the file they test
- Use `.test.ts` or `.test.tsx` extension
- No separate `__tests__` folders
```
**User Feedback**: Needed working directory context to prevent nesting
**Version 4 (Current)**: Added explicit working directory section and verification steps

**Pattern**: Multiple patterns shown → Confusion → Pick one and make it mandatory → Add guardrails

---

### Loop #3: /tasks Command - Task Generation

**Version 1**: "Create feature structure with all files"
**User Feedback**: "Too much infrastructure, not lean enough"
**Version 2**: Added lean-task-generation-guide.md
**User Feedback**: Still generating infrastructure-first tasks
**Version 3**: Updated to "User-visible features first, infrastructure only when needed"
**User Feedback**: First task was still "Set up state management stores/"
**Version 4 (Current)**: Removed template that started with infrastructure, changed to start with user-facing features

**Pattern**: Over-engineering → Add lean principles → Still over-engineering → Remove infrastructure templates entirely

---

### Loop #4: /reflect-convo Command Evolution (Meta)

**Version 1**: Simple "analyze the conversation and suggest improvements"
**User Feedback**: Reflections were too generic, didn't lead to actionable changes
**Version 2**: Added structure for CLAUDE.md suggestions and command improvements
**User Feedback**: Still not specific enough about root causes
**Current Task**: User requesting analysis of what questions/guidance were needed
**Version 3 (This Document)**: Deep pattern analysis to make reflection more proactive

**Pattern**: Generic → Structured → Still not specific → Analyze user guidance patterns to understand gaps

---

### Common Feedback Loop Patterns

1. **Overgeneralization → Specificity**
   - Commands started generic ("create state management")
   - User feedback made them specific ("use Legend-State for shared, hooks for local")

2. **Multiple Options → Single Path**
   - Commands showed multiple patterns
   - User feedback: pick one, make it the standard

3. **Implicit → Explicit**
   - Commands assumed understanding
   - User feedback: make steps explicit, add verification

4. **Permissive → Restrictive**
   - Commands allowed flexibility
   - User feedback: add "NEVER" rules for problematic patterns

5. **Examples → Anti-Patterns**
   - Commands showed what to do
   - User feedback: also show what NOT to do

---

## 7. Recommended Reflection Prompts for Improved /reflect-convo

The improved command should ask these questions:

### Section 1: Error Pattern Analysis
```markdown
## Pattern Detection

1. **Correction Frequency**
   - How many times did the user correct the same type of mistake?
   - What were the top 3 most-corrected patterns?

2. **Red Flag Moments**
   - Did I say "I couldn't find X" and then assume something?
   - Did I start executing without confirming understanding?
   - Did I make changes to config files without asking?

3. **Critical Interruptions**
   - Did the user say "Stop" or "Wait"?
   - If yes, what was I about to do that needed stopping?
```

### Section 2: Missing Context Analysis
```markdown
## Context Gaps

1. **Documentation References**
   - Which project docs did I fail to check that I should have?
   - Did user say "Remember, this project uses X"?
   - What architecture docs exist that relate to this task?

2. **Existing Pattern Detection**
   - Did I create something new without checking if similar exists?
   - Should I have searched for existing state management/components/utilities first?

3. **Project Preferences**
   - Did user correct me with "Instead of X, do Y"?
   - Is this a project-specific preference that should be documented?
```

### Section 3: Decision-Making Analysis
```markdown
## Reasoning Quality

1. **Unexplained Decisions**
   - Did user ask "Why did you do X?"
   - What decisions did I make without explaining?
   - Which non-obvious choices should I have explained proactively?

2. **Wrong Target Selection**
   - Did user say "You should have changed Y, not X"?
   - How did I identify the wrong target?
   - What analysis should I have done first to find the right target?

3. **Assumption Validation**
   - What assumptions did I make without verifying?
   - Where should I have asked instead of assuming?
```

### Section 4: Process Adherence Analysis
```markdown
## Process Discipline

1. **Verification Steps**
   - Did I skip pwd/ls checks before creating files?
   - Did I verify working directory context?
   - Did I check for existing patterns before creating new?

2. **TDD Adherence**
   - Did I write tests first?
   - Did I implement minimal code to pass tests?
   - Did I skip any RED-GREEN-REFACTOR steps?

3. **Scope Creep**
   - Did I add features that weren't requested?
   - Did I make "helpful" changes beyond the ask?
   - Should I have asked before adding extras?
```

### Section 5: Communication Analysis
```markdown
## User Interaction Quality

1. **Clarity Issues**
   - Did user need to rephrase or clarify instructions?
   - What was unclear about their original request?

2. **Expectation Gaps**
   - What did user expect me to do that I didn't?
   - What implicit expectations did I miss?

3. **Proactive Communication**
   - Where should I have asked for clarification upfront?
   - Where should I have explained my approach before executing?
```

### Section 6: Impact Assessment
```markdown
## Change Impact

1. **CLAUDE.md Updates**
   - Do any corrections warrant a new "NEVER" rule?
   - Should anything be added to Critical section?
   - Are there new safety guidelines needed?

2. **Command Updates**
   - Which commands led to the issues?
   - What verification steps should be added?
   - Should anti-patterns be documented?

3. **Documentation Gaps**
   - What architecture documentation is missing?
   - Should a research document be created?
   - Are there undocumented project preferences?
```

### Section 7: Meta-Learning
```markdown
## Learning Extraction

1. **Root Cause Identification**
   - What was the underlying cause of repeated mistakes?
   - Is it a knowledge gap, process gap, or verification gap?

2. **Systemic Improvements**
   - What one change would prevent the most issues?
   - Should this be in CLAUDE.md, command files, or architecture docs?

3. **Future Prevention**
   - What checks should be automatic going forward?
   - What new reflection triggers should be added?
```

---

## 8. Specific Examples from Conversations

### Example 1: The "Wrong Target" Pattern

**Conversation**: 7d50831a-685a-4d57-8211-fb3b2c218c6a.jsonl

**User Request**:
> "look at @docs/analysis/claude-md-and-commands-reflection.md and execute a plan that reflects the suggestions made here"

**What Claude Did**: Updated CLAUDE.md

**User Correction**:
> "Why did you only change CLAUDE.md? I feel like that should have maybe been the last one to update, if at all. Can you help me understand why you chose this place instead of specific commands?"

**Claude's Realization**:
> "You're absolutely right! I made a significant error in my approach. I should have focused on the actual command definitions rather than just CLAUDE.md... I couldn't find the command files and incorrectly assumed these were built-in."

**Root Cause**:
- Claude searched for commands in wrong location
- When not found, assumed they were built-in instead of asking
- Defaulted to updating general guidance instead of execution-level prompts

**What Should Have Happened**:
1. Read the reflection document carefully (it referenced line numbers in commands)
2. Realize line numbers mean these files exist somewhere
3. Search multiple locations (.claudecode/, .claude/, etc.)
4. If still not found, ask: "Where are the command files located?"
5. Once found, update the actual execution prompts, not just general guidance

**Lesson for /reflect-convo**:
- Watch for "I couldn't find X" → assumption pattern
- When references include line numbers, files definitely exist
- Wrong target selection is a critical error category
- Should trigger: "Did I focus on the right target? Did I update where the problem actually occurs?"

---

### Example 2: The "Slow Down" Pattern

**Conversation**: Reference in correction patterns

**User Interruption**:
> "Stop. Why are you reverting all the versions? This is a MAJOR change in infrastructure."

**Context**: Claude was trying to "fix" version mismatches by updating package.json

**User Follow-up**:
> "What can I add to claude.md to prevent you from doing this without talking to me first?"

**Result**: New CLAUDE.md rule:
```markdown
## Critical
- NEVER change package versions (React, React Native, Expo, etc) without explicit user approval
- Version mismatches should be reported to user, not auto-fixed
```

**Root Cause**:
- Claude saw a problem (version mismatch)
- Immediately tried to fix it
- Didn't recognize this as a high-impact change
- Didn't ask for approval

**What Should Have Happened**:
1. Notice version mismatch
2. Recognize this affects dependencies, builds, tests
3. Report: "I notice a version mismatch in [packages]. This could affect X, Y, Z. Should I update the versions or would you prefer to handle this manually?"
4. Wait for approval before changing

**Lesson for /reflect-convo**:
- "Stop" or "Wait" indicates critical error in judgment
- Track what categories of changes trigger these interruptions
- These should become "NEVER without approval" rules
- Should trigger: "Did I make high-impact changes without asking? What changes should always need approval?"

---

### Example 3: The "Efficiency vs Thoroughness" Pattern

**User Guidance**:
> "Update @ARGUMENTS with appropriate documentation for what its doing. Don't read each file, just make a best guess based on the title. If you're unsure, ask."

**Context**: User wanted documentation added to multiple command files

**What This Reveals**:
- User values efficiency when the task doesn't require deep analysis
- File names/titles are often descriptive enough
- "If unsure, ask" shows user prefers questions over over-analysis

**Pattern**: User is coaching Claude to use judgment about when to be thorough vs. efficient

**Lesson for /reflect-convo**:
- Not every task requires reading all files
- Use judgment: are filenames descriptive enough?
- When in doubt, ask rather than spend time over-analyzing
- Should trigger: "Am I reading more than necessary for this task? Could I work from titles/names and ask if unsure?"

---

### Example 4: The "Remember Project Context" Pattern

**Conversation**: Multiple instances of user reminding Claude about project decisions

**Examples**:
- "Remember, this project uses Legend-State, not Context"
- "We organize by feature, not by type"
- "Tests should be co-located, not in __tests__ folders"

**Pattern**: User had to repeatedly remind Claude about architectural decisions

**Root Cause**: Claude wasn't consistently checking project documentation before suggesting patterns

**What Should Happen**: Before suggesting any architecture pattern:
1. Check docs/architecture/ for existing guidelines
2. Check existing code for examples to match
3. Check CLAUDE.md for preferences
4. Only then suggest a pattern

**Lesson for /reflect-convo**:
- "Remember" indicates Claude forgot or didn't check context
- Track which areas need remembering (state management, file org, testing)
- These should trigger automatic doc checks
- Should trigger: "Did I check project architecture docs before suggesting patterns? What did I forget that I should have referenced?"

---

### Example 5: The "Extract and Reference" Pattern

**User Suggestion**:
> "lets add the rules for working directory context to a separate file and reference it by the current places that use it you just updated"

**Context**: Claude had just duplicated working directory guidance across multiple command files

**User's Intent**:
- Don't maintain the same content in multiple places
- Extract to shared file
- Reference from multiple locations

**What This Reveals**: User thinks about maintainability and DRY principles

**Lesson for /reflect-convo**:
- After adding same content to multiple files, ask: "Should this be extracted?"
- Watch for duplication as a signal to refactor
- Should trigger: "Did I duplicate content across files? Should I suggest extracting to a shared location?"

---

## 9. Synthesis: Making /reflect-convo More Proactive

Based on this analysis, here's what the improved `/reflect-convo` command should do:

### Phase 1: Automatic Pattern Detection (Before User Review)

Run these checks automatically:

```markdown
## Auto-Detection Phase

### 1. Correction Pattern Detection
- Scan for user messages containing: "no", "stop", "wait", "wrong", "instead"
- Count frequency by category
- Identify if same correction appears multiple times

### 2. Question Pattern Detection
- Scan for user messages with "why did you", "how did you decide"
- Extract the decisions being questioned
- Identify if these should have been explained proactively

### 3. Reminder Pattern Detection
- Scan for "remember", "this project uses", "as I mentioned"
- Extract what Claude forgot or didn't check
- Identify which docs should have been referenced

### 4. Process Violation Detection
- Check if Claude skipped verification steps (pwd, ls)
- Check if tests were written before implementation
- Check if existing patterns were checked before creating new

### 5. Scope Creep Detection
- Compare user request to Claude's actions
- Identify additions that weren't requested
- Flag "helpful" changes that should have been asked about

### 6. Configuration Change Detection
- Check if any config files were modified (package.json, jest.setup.js, etc.)
- Check if user approval was sought
- Flag as critical if changed without approval

### 7. Documentation Reference Check
- List which architecture docs were referenced
- List which docs should have been referenced but weren't
- Identify missing doc references for the task type
```

### Phase 2: Root Cause Analysis

For each detected pattern:

```markdown
## Root Cause Analysis

For each correction/question/reminder:

### 1. Classify the Issue
- Knowledge gap: Claude didn't know about X
- Process gap: Claude skipped verification step
- Verification gap: Claude didn't check if X existed
- Communication gap: Claude didn't explain reasoning
- Target selection error: Claude updated wrong file/location

### 2. Identify Prevention Point
- Could this be prevented by a CLAUDE.md rule?
- Could this be prevented by command verification steps?
- Could this be prevented by checking architecture docs?
- Could this be prevented by asking upfront?

### 3. Impact Assessment
- One-time mistake vs. systemic issue?
- Localized to this task vs. affects multiple task types?
- Easy fix vs. requires structural change?
```

### Phase 3: Actionable Recommendations

Generate specific, implementable fixes:

```markdown
## Recommended Actions

### Immediate (CLAUDE.md Updates)
If user said "Stop" or "never without approval":
- Add to Critical section: "NEVER [action] without explicit user approval"

If user said "Remember, this project uses X":
- Add to project-specific section: "This project uses X for Y"

### Short-term (Command Updates)
If user corrected approach multiple times:
- Add verification step to relevant command
- Add anti-pattern documentation
- Add decision tree for when to use what

If Claude selected wrong target:
- Add "Before starting, identify where the issue actually occurs" step
- Add examples of right vs wrong targets

### Long-term (Documentation Creation)
If information was scattered:
- Create centralized doc (e.g., architecture/working-directory-context.md)
- Update commands to reference centralized doc

If pattern is project-specific and repeated:
- Create architecture guide for this pattern
- Add examples from codebase
- Reference from relevant commands

### Structural (Process Improvements)
If verification steps were skipped:
- Make them mandatory, not optional
- Add to command checklist
- Make them BEFORE action, not during

If existing patterns weren't checked:
- Add "check for existing X" as first step
- Provide search commands to run
- Make it explicit, not assumed
```

### Phase 4: Meta-Learning Extraction

```markdown
## Session Lessons

### Top Pattern
[The most frequent correction type in this session]

### Critical Moment
[The "Stop" or high-impact error if any]

### Missing Check
[The verification that was skipped and caused issues]

### Key Insight
[What one thing would have prevented most issues?]

### Evolution Point
[How should this change CLAUDE.md, commands, or docs?]

### Future Trigger
[What should trigger reflection in future similar situations?]
```

---

## 10. Implementation Checklist for Improved /reflect-convo

### Must Have Features:

- [x] Automatic pattern detection (corrections, questions, reminders)
- [x] Root cause classification (knowledge/process/verification/communication gaps)
- [x] Impact assessment (one-time vs. systemic)
- [x] Specific recommendations (CLAUDE.md updates, command updates, doc creation)
- [x] Meta-learning extraction (session lessons, evolution points)

### Pattern Recognition:

- [x] "Why did you..." → Unexplained decision, should have been proactive
- [x] "Stop/Wait" → High-impact change, needs approval process
- [x] "Remember..." → Forgot context, should have checked docs
- [x] "Instead of..." → Wrong pattern, need anti-pattern docs
- [x] "I couldn't find X" (Claude) → Assumption error, should have asked
- [x] Duplicate content across files → Should suggest extraction

### Automatic Checks:

- [x] Were verification steps (pwd, ls) performed before file operations?
- [x] Were tests written before implementation?
- [x] Were existing patterns checked before creating new?
- [x] Were architecture docs referenced when suggesting patterns?
- [x] Were config files modified? Was approval sought?
- [x] Was reasoning explained for non-obvious decisions?

### Recommendation Quality:

- [x] Specific file paths for updates
- [x] Exact rule text to add
- [x] Before/After examples
- [x] Clear priority (Critical/High/Medium/Low)
- [x] Implementation order (Immediate/Short-term/Long-term)

---

## Conclusion

The analysis of 123 conversations reveals a clear pattern: **Claude needs to be more proactive about verification, explanation, and context-checking**.

### The Core Issues:

1. **Claude assumes instead of asking** when it can't find something
2. **Claude acts immediately instead of confirming understanding** for complex tasks
3. **Claude forgets project context** that's documented in architecture files
4. **Claude doesn't explain non-obvious decisions** proactively
5. **Claude makes high-impact changes without asking** for approval

### The Solution:

The improved `/reflect-convo` command should:

1. **Automatically detect patterns** in user corrections and questions
2. **Identify root causes** (knowledge/process/verification/communication gaps)
3. **Generate specific recommendations** (not generic suggestions)
4. **Extract meta-lessons** that prevent future issues
5. **Update the right targets** (commands where issues occur, not just CLAUDE.md)

### The Ultimate Goal:

Reduce the frequency of:
- "Why did you only change X?"
- "Stop, this is a major change"
- "Remember, this project uses..."
- "Instead of X, do Y"
- "You should have checked for..."

By making Claude:
- **Verify** before acting (pwd, ls, check for existing patterns)
- **Explain** reasoning proactively
- **Check** documentation automatically
- **Ask** instead of assume
- **Confirm** understanding before complex tasks

This deep analysis should serve as the foundation for a significantly improved reflection system that learns from user guidance patterns and prevents recurring issues.

---

**Document Stats**:
- Conversations analyzed: 123
- Correction patterns: 498
- User questions: 213
- Reflective moments: 394
- Command feedback instances: 300
- Analysis date: October 18, 2025
