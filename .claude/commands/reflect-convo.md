---
description: "Analyze chat to suggest CLAUDE.md updates, prompt improvements, and research needs"
argument-hint: "[specific-focus-area]"
allowed-tools: "Read, Write, Edit"
---

# Reflect on Current Chat Session

I'll analyze our conversation to identify patterns, root causes, and actionable improvements. This reflection focuses on understanding what guidance you had to provide and how to make the system more proactive.

Focus area: $ARGUMENTS (or comprehensive analysis if not specified)

---

## Phase 1: Automatic Pattern Detection

Let me scan the conversation for key patterns that indicate areas for improvement:

### 1.1 Correction Patterns
Scanning for user corrections:
- Messages containing: "no", "stop", "wait", "wrong", "instead", "actually", "should have"
- Classification: Factual corrections, approach corrections, target selection errors
- Frequency: Are the same corrections appearing multiple times?

### 1.2 Question Patterns
Scanning for user questions seeking clarification:
- "Why did you..." → I made an unexplained or questionable decision
- "How did you decide..." → My decision-making process wasn't transparent
- "Can you help me understand..." → User seeking reasoning for my choices
- "Did you check..." → I skipped a verification step

### 1.3 Reminder Patterns
Scanning for context I should have known:
- "Remember..." → I forgot documented information
- "This project uses..." → I didn't check architecture docs
- "As I mentioned..." → I didn't retain conversation context
- "Don't forget..." → User preemptively correcting expected behavior

### 1.4 Process Violation Detection
Checking if I followed proper discipline:
- **Pre-execution checks**: Did I run `pwd` and `ls` before file operations?
- **TDD discipline**: Did I write tests before implementation?
- **Existing pattern check**: Did I search for similar functionality before creating new?
- **Documentation reference**: Did I check relevant architecture docs?
- **Understanding verification**: Did I confirm complex tasks before executing?

### 1.5 Red Flag Detection
Critical error patterns:
- **Assumption errors**: Did I say "I couldn't find X" then make assumptions?
- **Wrong target selection**: Did you say "You should have changed Y, not X"?
- **Unapproved changes**: Did I modify config files or packages without asking?
- **Scope creep**: Did I add features/changes that weren't requested?
- **Duplication**: Did I copy same content to multiple files instead of extracting?

---

## Phase 2: Root Cause Analysis

For each detected pattern, I'll identify the underlying issue:

### 2.1 Issue Classification

For each correction/question/reminder, determining:

**Category**:
- Knowledge gap: I didn't know about project preferences/patterns
- Process gap: I skipped verification or discipline steps
- Verification gap: I didn't check if something existed first
- Communication gap: I didn't explain my reasoning
- Target selection error: I updated the wrong file/location
- Judgment gap: I made high-impact changes without recognizing them

**Severity**:
- Critical: User said "Stop" or "NEVER without approval"
- High: Same correction repeated multiple times
- Medium: Single correction with clear fix
- Low: Minor clarification or refinement

### 2.2 Prevention Point Analysis

For each issue, identifying where it should have been prevented:

**CLAUDE.md Rule Needed?**
- Is this a "NEVER without approval" situation?
- Is this a project-specific preference to document?
- Should this be in the Critical section?

**Command Update Needed?**
- Which command led to this issue?
- What verification step should be added?
- Should anti-patterns be documented?
- Is a decision tree needed?

**Architecture Documentation Needed?**
- Is this a pattern that appears in multiple contexts?
- Should this be centralized in docs/architecture/?
- Are there examples in the codebase to reference?

**Research Document Needed?**
- Is there a knowledge gap about best practices?
- Would research prevent future similar issues?

---

## Phase 3: Conversation Analysis

### 3.1 Main Tasks and Requests
Listing what you asked me to do:
[Chronological summary of user requests]

### 3.2 Confusion Points
Identifying where clarification was needed:
[Points where I misunderstood or you had to clarify]

### 3.3 Error Patterns
Categorizing mistakes I made:
[Types of errors and their frequency]

### 3.4 Context Gaps
Missing information that would have helped:
[What I should have known or checked but didn't]

### 3.5 Command Effectiveness
If commands were used, evaluating:
[What worked, what failed, why]

---

## Phase 4: Actionable Recommendations

### 4.1 CLAUDE.md Updates (Immediate Priority)

Based on the session patterns, here are specific additions needed:

#### Critical Section Updates
[If user said "Stop" or "never without approval"]

```markdown
## Critical [or update to existing section]

- NEVER [specific action] without explicit user approval
  - Reason: [why this needs approval]
  - Alternative: [what to do instead - report and ask]
```

#### Project-Specific Context
[If user said "Remember, this project uses..."]

```markdown
## Project Context [or new relevant section]

- This project uses [X] for [Y] (not [common alternative])
  - Example: [reference to existing code]
  - See: [link to architecture doc]
```

#### Process Requirements
[If I skipped verification steps]

```markdown
## Required Verification Steps

Before [type of operation]:
1. [Specific check to run]
2. [What to verify]
3. [When to ask vs. proceed]
```

### 4.2 Command Updates (Short-term Priority)

For each command that led to issues:

#### Command: [command-name]
**File**: `.claude/commands/[command-name].md`

**Issue Identified**: [What went wrong]

**Root Cause**: [Why it happened]

**Recommended Fix**:
```markdown
[Specific text to add to command, with line numbers if possible]

Example additions:
- Add verification step: "Before creating files, check for existing similar functionality"
- Add anti-pattern: "DON'T [wrong pattern] - instead use [correct pattern]"
- Add decision tree: "If X then Y, if Z then A"
- Add explanation requirement: "When doing [action], explain why you chose [approach]"
```

**Priority**: [Critical/High/Medium/Low]

### 4.3 Documentation Creation (Long-term Priority)

New documentation needed:

#### 1. [Document Title]
**Path**: `docs/architecture/[topic].md` or `docs/research/[topic].md`

**Purpose**: [Why this document is needed]

**Content Should Include**:
- [Key point 1]
- [Key point 2]
- [Examples from codebase]
- [When to use vs. when not to use]

**Referenced By**: [Which commands or CLAUDE.md sections should reference this]

---

## Phase 5: Meta-Learning Extraction

### 5.1 Session Summary

**Top Pattern**: [Most frequent correction/question type in this session]

**Critical Moment**: [Any "Stop" or high-impact error - quote user's words]

**Most Important Missing Check**: [The verification I skipped that caused the most issues]

**Wrong Target**: [If I updated the wrong file/location, what and why]

**Context I Forgot**: [Project preferences/patterns I should have remembered]

### 5.2 Key Insights

**What One Thing Would Have Prevented Most Issues?**
[The single most impactful change - could be a check, a rule, or a behavior]

**What Should I Do Automatically Going Forward?**
[Specific behaviors that should become standard practice]

**What Should Trigger Me to Pause and Ask?**
[Situations where I should stop and verify before proceeding]

### 5.3 Evolution Recommendations

**CLAUDE.md Evolution**:
- [ ] Add to Critical section: [specific rule]
- [ ] Add to Project Context: [specific preference]
- [ ] Add process requirement: [specific verification]

**Command Evolution**:
- [ ] Update [command]: [specific addition]
- [ ] Add anti-pattern to [command]: [what not to do]
- [ ] Add verification step to [command]: [what to check]

**Documentation Evolution**:
- [ ] Create: docs/architecture/[topic].md
- [ ] Update: [existing doc] with [addition]
- [ ] Extract duplicated content to: [new shared doc]

### 5.4 Future Reflection Triggers

Based on this session, in future conversations I should pause and reflect when:

1. [Specific trigger - e.g., "When I can't find something that should exist"]
2. [Specific trigger - e.g., "Before modifying any config files"]
3. [Specific trigger - e.g., "When about to create new state management"]

---

## Phase 6: Comparison with Previous Reflections

### 6.1 Recurring Issues Check

Let me check if any issues from this session have appeared in previous reflections:

[Check docs/analysis/ for similar patterns in past reflection documents]

**New Issues** (first time seeing these):
- [Issues unique to this session]

**Recurring Issues** (seen before):
- [Issues that keep appearing despite previous fixes]
- Why they recurred: [Analysis of why previous fix didn't work]
- Stronger fix needed: [More robust solution]

### 6.2 Progress Assessment

**Improvements Since Last Reflection**:
- [Things that went better this time]

**Regressions Since Last Reflection**:
- [Things that got worse or reappeared]

---

## Phase 7: Implementation Plan

### Immediate Actions (Do Now)

1. **Update CLAUDE.md**
   - Section: [specific section]
   - Addition: [specific rule/context]
   - Priority: Critical/High
   - Reason: [why this is immediate]

2. **Update Command Files**
   - File: `.claude/commands/[name].md`
   - Addition: [specific verification/anti-pattern]
   - Priority: Critical/High
   - Reason: [why this is immediate]

### Short-term Actions (This Week)

3. **Create/Update Documentation**
   - File: `docs/architecture/[name].md`
   - Content: [what to document]
   - Priority: Medium/High
   - Reason: [impact on future work]

4. **Extract Duplication** (if applicable)
   - Current: [content duplicated across X files]
   - Create: [new shared file]
   - Update: [files to reference new shared content]

### Long-term Improvements (Next Sessions)

5. **Research Needs**
   - Topic: [what to research]
   - Why: [knowledge gap identified]
   - Expected output: [what the research should provide]

6. **Process Changes**
   - Current process: [what I do now]
   - Improved process: [what I should do instead]
   - Trigger: [when to use improved process]

---

## Phase 8: Create Permanent Record

### 8.1 Generate Analysis Document

**Primary Focus**: [main topic/issue from this session]
**Key Patterns**: [2-3 most important patterns]
**Date**: [YYYYMMDD format]

**Filename**: `docs/analysis/[focus-keyword]-reflection-[YYYYMMDD].md`

### 8.2 Document Contents

The permanent analysis document will include:

1. **Executive Summary**: Top 3 issues and their fixes
2. **Detailed Pattern Analysis**: All corrections/questions with context
3. **Root Cause Analysis**: Why each issue occurred
4. **Specific Recommendations**: Exact changes to make with file paths and line numbers
5. **Implementation Tracking**: Checklist of what was implemented
6. **Meta-Learning**: Lessons for improving the development process

[Create the comprehensive analysis document]

---

## Phase 9: Proactive Behavior Checklist

Before concluding, let me verify I'm identifying the key proactive improvements needed:

### Did I Miss These Proactive Behaviors?

- [ ] **Explain non-obvious decisions** before you asked why?
- [ ] **Check for existing patterns** before creating new files/features?
- [ ] **Verify understanding** before complex tasks?
- [ ] **Suggest extracting duplication** when copying content?
- [ ] **State assumptions upfront** rather than discovering issues mid-execution?
- [ ] **Reference project docs** before suggesting patterns?
- [ ] **Warn about impact** before destructive operations?
- [ ] **Confirm working directory** before file operations?
- [ ] **Search multiple locations** before claiming "couldn't find"?
- [ ] **Ask instead of assume** when uncertain?

### For Each Missed Behavior:

**What should trigger this behavior automatically?**
[Specific conditions that should make me proactive]

**How to encode this?**
[CLAUDE.md rule, command checklist, or reflection trigger]

---

## Summary

### Session Scorecard

**Corrections Needed**: [count]
**Questions About Decisions**: [count]
**Reminders About Context**: [count]
**Process Violations**: [count]
**Critical Interruptions**: [count]

### Most Critical Fix

**The one change that would have prevented the most issues**:
[Specific, actionable fix - could be a rule, a check, or a behavior]

### Success Patterns

**What worked well that should be repeated**:
[Positive patterns to reinforce]

### Next Steps

**Immediate**: [1-2 critical updates to make now]
**Short-term**: [2-3 important improvements this week]
**Long-term**: [Systemic improvements for future sessions]

---

This reflection has identified **[X]** areas for improvement that should reduce the need for corrections by approximately **[Y]%** in similar future sessions.

The analysis has been saved to `docs/analysis/[filename].md` for permanent reference and continuous improvement tracking.
