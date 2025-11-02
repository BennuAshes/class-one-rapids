---
description: "Deep analysis of command system issues with actionable improvements"
argument-hint: "[issues or focus area to analyze]"
allowed-tools: "Read, Write, Edit"
---

# Deep Reflection on Command System

I'll perform a comprehensive analysis of the command system to identify and resolve issues. This focuses on making commands more effective and reducing the need for user corrections.

Analysis Focus: $ARGUMENTS

---

## Phase 1: Read Current Command System

Read the core command system files to understand current state:

### Core Files to Analyze:
1. **CLAUDE.md** - Project rules and critical constraints
2. **.claude/commands/prd.md** - Product Requirements generation
3. **.claude/commands/design.md** - Technical Design generation
4. **.claude/commands/tasks.md** - Task list generation
5. **.claude/commands/execute-task.md** - Task execution with TDD

---

## Phase 2: Issue Pattern Detection

Based on the analysis focus provided, identify patterns:

### 2.1 Stated Issues Analysis
Breaking down the issues mentioned in $ARGUMENTS:
- **What's the symptom?** [What user observed going wrong]
- **Where does it occur?** [Which command(s) or workflow stage]
- **How frequent?** [One-time vs recurring pattern]
- **Impact level?** [Critical, High, Medium, Low]

### 2.2 Root Cause Identification

For each issue, determining:

**Is this a...**
- **Knowledge gap?** Command doesn't know about project patterns/preferences
- **Process gap?** Command skips verification or discipline steps
- **Verification gap?** Command doesn't check if something exists first
- **Communication gap?** Command doesn't explain reasoning or ask when uncertain
- **Target selection error?** Command updates wrong file/location
- **Judgment gap?** Command doesn't recognize high-impact changes

### 2.3 Command Chain Analysis

Analyzing the PRD → Design → Tasks → Execute chain:

**PRD Command Issues:**
- Does it capture user intent accurately?
- Does it include enough technical constraints?
- Does it reference existing architecture patterns?

**Design Command Issues:**
- Does it check existing patterns before suggesting new ones?
- Does it follow project-specific architecture preferences?
- Does it provide decision rationale for non-obvious choices?

**Tasks Command Issues:**
- Does it generate lean, feature-focused tasks?
- Does it avoid infrastructure-first approach?
- Does it include proper verification steps?

**Execute-Task Command Issues:**
- Does it check for existing patterns before creating new files?
- Does it verify working directory before operations?
- Does it follow TDD discipline (test-first)?
- Does it avoid creating unnecessary infrastructure?
- Does it reference architecture docs for patterns?

---

## Phase 3: Cross-Reference with Known Patterns

Checking against documented anti-patterns and best practices:

### 3.1 Critical Rules Compliance
Reviewing CLAUDE.md critical section:
- Are commands respecting "NEVER without approval" rules?
- Are version changes being prevented?
- Are configuration files being protected?

### 3.2 Architecture Alignment
Checking docs/architecture/ for relevant patterns:
- Are commands referencing project-specific patterns?
- Are commands using correct state management approach (Legend-State vs Context)?
- Are commands following file organization (by-feature vs by-type)?
- Are commands enforcing co-located tests?

### 3.3 Anti-Pattern Prevention
Reviewing what commands should NOT do:
- Creating service classes instead of hooks
- Using React Context for cross-feature state
- Creating __tests__ folders instead of co-located tests
- Generating barrel exports (index.ts) unless needed
- Creating infrastructure before user-facing features
- Nesting directories (frontend/frontend/)

---

## Phase 4: Comparison with User Guidance Patterns

Referencing the deep analysis of user corrections:

### 4.1 Top Guidance Patterns Check

For each command, checking if it addresses:

1. **Wrong target selection** - Does command clearly identify where changes should go?
2. **Destructive operations** - Does command require approval for major changes?
3. **Efficiency vs thoroughness** - Does command use judgment about when to read files?
4. **Project context** - Does command check architecture docs automatically?
5. **Decision explanation** - Does command explain non-obvious choices proactively?
6. **Process discipline** - Does command include verification steps (pwd, ls)?
7. **Architectural corrections** - Does command reference project-specific patterns?
8. **Resource awareness** - Does command state model/resource usage?
9. **DRY principles** - Does command suggest extracting duplication?
10. **Pre-implementation checks** - Does command verify existing patterns first?

### 4.2 Red Flag Prevention

For each command, checking if it prevents:

1. **Assumption errors** - "I couldn't find X, so I'll assume Y"
2. **Immediate execution** - Starting without confirming understanding
3. **False success claims** - Claiming completion without verification
4. **Premature infrastructure** - Creating stores/types/utils before needed
5. **Scope creep** - Adding features beyond the ask
6. **Content duplication** - Copying instead of referencing
7. **Config changes** - Modifying setup files without asking

### 4.3 Proactive Behavior Integration

For each command, checking if it includes:

1. **Explain non-obvious decisions** before user asks why
2. **Check for existing patterns** before creating new
3. **Verify understanding** before complex operations
4. **Suggest extracting duplication** when copying content
5. **State assumptions upfront** rather than discovering issues mid-execution
6. **Reference project docs** before suggesting patterns
7. **Warn about impact** before destructive operations
8. **Confirm working directory** before file operations
9. **Search multiple locations** before claiming "couldn't find"
10. **Ask instead of assume** when uncertain

---

## Phase 5: Specific Issue Deep Dive

For the issues mentioned in $ARGUMENTS, performing deep analysis:

### 5.1 Issue-Specific Root Cause

**Issue**: [Restate specific issue]

**Current Behavior**:
- What the command currently does
- Where in the command this happens
- Why it produces the wrong outcome

**Expected Behavior**:
- What should happen instead
- What information/check is missing
- What decision logic is flawed

**Gap Analysis**:
- Knowledge: What does the command not know?
- Process: What step is being skipped?
- Verification: What check is missing?
- Communication: What should be explained/asked?

### 5.2 Example Scenarios

**Scenario 1: When it goes wrong**
```
User request: [example]
Command does: [current wrong behavior]
Result: [problem that occurs]
User correction: [what user has to say]
```

**Scenario 2: When it should work**
```
User request: [same example]
Command should do: [correct behavior with new improvements]
Result: [successful outcome]
No correction needed because: [what prevention was added]
```

---

## Phase 6: Solution Design

For each identified issue, designing specific fixes:

### 6.1 CLAUDE.md Updates

**If the issue requires new project-level rules:**

```markdown
## [Section Name - e.g., Critical, Project Context, etc.]

- [New rule based on issue analysis]
  - Why: [Reason this rule is needed]
  - Example: [What this prevents or enables]
  - See: [Reference to relevant docs if applicable]
```

**Priority**: [Critical/High/Medium/Low]
**Reason**: [Why this level of priority]

### 6.2 Command-Specific Updates

For each command that needs changes:

#### Command: [command-name].md

**Issue**: [What goes wrong in this command]

**Root Cause**: [Why it happens - reference line numbers if possible]

**Proposed Fix**:

**Option A - Add Verification Step:**
```markdown
## [Section in command where this should go]

### Before [action]:
1. Check [what to verify]
   ```bash
   [specific command to run]
   ```
2. If [condition], then [action]
3. If uncertain, ask: "[specific question to pose to user]"
```

**Option B - Add Decision Tree:**
```markdown
## [Section in command]

### Deciding [what decision]:

**If** [condition 1]:
- Use [approach A]
- Reason: [why this is right for this case]

**Else if** [condition 2]:
- Use [approach B]
- Reason: [why this is right for this case]

**Otherwise**:
- Ask user: "[specific question]"
```

**Option C - Add Anti-Pattern:**
```markdown
## [Section in command]

### What NOT to Do:

❌ **DON'T** [problematic pattern]
- Why not: [reason]
- Instead: [correct pattern]
- Example: [reference to codebase]
```

**Option D - Add Proactive Explanation:**
```markdown
## [Section in command]

When [performing action], explain your reasoning:
- "I'm choosing [X] over [Y] because [reason]"
- "This might seem [counterintuitive/complex] but [explanation]"
- "The reason I'm [approach] is [rationale]"
```

**Recommended Option**: [Which option(s) to implement]
**Priority**: [Critical/High/Medium/Low]

### 6.3 Architecture Documentation Updates

**If the issue reveals missing architecture documentation:**

#### New Document: docs/architecture/[topic].md

**Purpose**: [Why this doc is needed - what gap it fills]

**Should Include**:
1. **Pattern Overview**: [What this pattern is and when to use it]
2. **Project-Specific Approach**: [How THIS project does it vs common alternatives]
3. **Decision Rationale**: [Why this approach was chosen]
4. **Code Examples**: [References to existing implementation in codebase]
5. **Anti-Patterns**: [What NOT to do and why]
6. **Related Patterns**: [Links to other architecture docs]

**Referenced By**:
- Commands: [List which commands should @reference this]
- CLAUDE.md: [Which section should link to it]

**Priority**: [High/Medium/Low]

### 6.4 Research Document Needs

**If the issue reveals knowledge gaps:**

#### Research Needed: [topic]

**Gap Identified**: [What we don't know that we should]

**Research Questions**:
1. [Specific question 1]
2. [Specific question 2]
3. [Specific question 3]

**Expected Output**:
- Format: docs/research/[topic]_[YYYYMMDD].md
- Content: [What the research should document]
- Usage: [Which commands will reference this]

**Priority**: [High/Medium/Low]

---

## Phase 7: Implementation Recommendations

### 7.1 Prioritized Action Plan

**Immediate (Fix Now - Critical Issues):**

1. **Update CLAUDE.md**
   - Section: [specific section]
   - Add: [specific rule]
   - Why immediate: [impact if not fixed]

2. **Update [command].md**
   - File: `.claude/commands/[name].md`
   - Add: [specific verification/anti-pattern/decision tree]
   - Why immediate: [impact if not fixed]

**Short-term (This Week - High Priority):**

3. **Create architecture doc**
   - File: `docs/architecture/[topic].md`
   - Content: [what to document]
   - References: [commands to update]

4. **Update [command].md**
   - File: `.claude/commands/[name].md`
   - Add: [specific improvement]
   - Impact: [how this helps]

**Long-term (Next Sessions - Medium Priority):**

5. **Research and document**
   - Topic: [what to research]
   - Output: `docs/research/[topic].md`
   - Application: [where this knowledge gets used]

6. **Refactor command structure**
   - Current issue: [structural problem]
   - Proposed: [how to reorganize]
   - Benefit: [improvement this enables]

### 7.2 Specific File Updates

For each file that needs changes, providing exact updates:

#### File: [file-path]

**Current Content** (relevant section):
```markdown
[Current text that needs changing]
```

**Proposed Update**:
```markdown
[New text with improvements]
```

**Rationale**: [Why this specific change addresses the issue]

---

## Phase 8: Validation Strategy

### 8.1 How to Verify Fixes

For each proposed fix, defining validation:

**Fix**: [What was changed]

**Test Scenario**: [Specific situation to test]

**Success Criteria**:
- [ ] Command no longer produces [wrong behavior]
- [ ] Command now includes [verification step]
- [ ] User doesn't need to correct [specific pattern]

**Validation Method**:
- Try the command with: [specific input]
- Expected output: [what should happen]
- Red flag if: [what would indicate failure]

### 8.2 Regression Prevention

**What to watch for:**
- [Specific pattern that should not reappear]
- [Specific correction user should not need to make]
- [Specific mistake command should not repeat]

**How to monitor:**
- In next conversation, check if user says: "[pattern to watch for]"
- If detected, indicates fix didn't work and needs stronger solution

---

## Phase 9: Meta-Analysis

### 9.1 Pattern Synthesis

**Underlying Theme**: [What's the common thread across issues]

**Systemic Problem**: [Root cause that affects multiple commands]

**Architectural Insight**: [What this reveals about the system design]

### 9.2 Evolution Recommendations

**Command System Evolution**:
- Current approach: [how commands work now]
- Limitation: [what's not working]
- Evolution path: [how to improve structurally]

**Knowledge Management Evolution**:
- Current: [how knowledge is organized]
- Gap: [what's missing or scattered]
- Improvement: [better organization structure]

**Feedback Loop Evolution**:
- Current: [how improvements happen now]
- Enhancement: [how to make it more automatic]

---

## Phase 10: Document and Track

### 10.1 Create Analysis Document

**Filename**: `docs/analysis/[topic-keyword]-reflection-[YYYYMMDD].md`

**Contents**:
1. **Executive Summary**: Issues identified and top 3 fixes
2. **Detailed Analysis**: Root causes and evidence
3. **Solution Design**: Specific changes with rationale
4. **Implementation Plan**: Prioritized actions
5. **Validation Strategy**: How to verify fixes work
6. **Meta-Learning**: Systemic insights

[Create the comprehensive analysis document]

### 10.2 Implementation Tracking

Creating checklist in the analysis document:

```markdown
## Implementation Status

### Immediate Actions
- [ ] Update CLAUDE.md: [specific change]
- [ ] Update [command].md: [specific change]

### Short-term Actions
- [ ] Create docs/architecture/[topic].md
- [ ] Update [command].md: [specific change]

### Long-term Actions
- [ ] Research: [topic]
- [ ] Refactor: [structural change]

### Validation
- [ ] Test scenario 1: [description]
- [ ] Test scenario 2: [description]
- [ ] Monitor for: [regression pattern]
```

---

## Summary

### Analysis Results

**Issues Analyzed**: [count and categorization]

**Root Causes Identified**:
1. [Primary root cause]
2. [Secondary root cause]
3. [Tertiary root cause]

**Proposed Solutions**:
- CLAUDE.md updates: [count]
- Command updates: [count]
- Architecture docs: [count]
- Research needs: [count]

### Critical Insight

**The one systemic change that would prevent most of these issues**:
[Specific, actionable insight about what needs to change at the system level]

### Next Steps

**Immediate**: [1-2 critical fixes to apply now]
**Short-term**: [2-3 important improvements for this week]
**Long-term**: [Systemic improvements for future evolution]

---

The detailed analysis has been saved to `docs/analysis/[filename].md` with:
- Complete root cause analysis
- Specific file updates with exact text
- Prioritized implementation plan
- Validation criteria
- Tracking checklist

This reflection identified the core patterns causing the issues in $ARGUMENTS and provided actionable solutions to resolve them systematically.
