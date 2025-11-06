---
description: "Analyze feedback from workflow rejection and suggest command improvements"
argument-hint: "<feedback-file-or-description>"
allowed-tools: "Read, Grep, Glob"
---

# Reflect on Workflow Feedback

Analyze feedback from rejected workflow checkpoints and provide specific, actionable suggestions for improving flow commands.

## Role Context

Act as a workflow analyzer specializing in continuous improvement. Analyze feedback from rejected checkpoints and provide specific suggestions for improving the corresponding flow commands.

# Phase 1: Parse Feedback

## Input Analysis
Parse the feedback provided in $ARGUMENTS.

Determine feedback type:
- JSON feedback file (contains structured feedback fields)
- Text description of issues
- Reference to a specific checkpoint failure

## Extract Key Information

Extract from structured feedback:
- **Checkpoint**: Which step was rejected (PRD, Design, Tasks)
- **Specific Issues**: Concrete problems identified
- **Missing Elements**: Absent or incomplete content
- **Suggested Improvements**: User recommendations
- **Rating**: Quality score if provided

# Phase 2: Analyze Current Commands

## Command Flow Review

Read all files in @.claude/commands/flow/ to understand:
1. Current command structure and prompts
2. How commands interconnect
3. Specific command that generated the rejected output

**CRITICAL**: Also read @scripts/feature-to-code-unified.sh to understand:
1. How the workflow script invokes each flow command
2. What arguments or input it passes to commands
3. If the invocation pattern matches what commands expect
4. Command input processing (stdin vs arguments vs file paths)

## Root Cause Analysis

Identify based on feedback:
- Which specific command needs improvement
- What sections of the command led to the issues
- Gaps in the current prompts or templates
- Ambiguous or unclear instructions

**CRITICAL**: Also check for invocation mismatches:
- Does the workflow script pass input the way the command expects it?
- Are file paths being passed correctly (stdin pipe vs argument)?
- Does the command receive the expected input format?
- Are there any GitHub issues with slash command argument handling?

## Common Patterns to Check

### Input Processing Pattern
Commands should use **stdin piping** for file paths (like `/flow:prd`):
```bash
# CORRECT: Pipe file path via stdin
echo "$FILE_PATH" | claude /flow:command > output.md

# INCORRECT: Pass as argument (doesn't work reliably)
claude /flow:command "$FILE_PATH" > output.md
```

### Command File Input Processing
Commands should read from stdin first line:
```markdown
The file path will be provided as the first line of stdin input.

**Error Handling**:
- If no path provided in stdin:
  - STOP execution immediately
  - Output: "ERROR: File path required. Usage: echo '/path/to/file.md' | claude /flow:command"
  - DO NOT create any output files
  - EXIT
```

# Phase 3: Generate Improvement Suggestions

## Specific Command Changes

For the command that needs improvement:

### Structural Improvements
- New sections to add
- Existing sections to enhance
- Template modifications needed
- Validation checks to include

### Prompt Enhancements
- Clearer instructions for specific areas
- Additional context or examples
- More detailed requirements
- Better output formatting guidelines

### Quality Controls
- Completeness checks
- Consistency requirements
- Technical depth guidelines
- Review criteria

## Implementation Strategy

Provide step-by-step changes:
1. **Immediate fixes**: Quick wins addressing critical issues
2. **Structural changes**: Larger modifications to command flow
3. **Enhancement opportunities**: Additional improvements for better quality

# Phase 4: Actionable Output

## Suggested Modifications

Generate specific recommendations in this format:

```markdown
### Command Files to Modify

Command: [prd.md | design.md | tasks.md]

Specific changes:
1. [Section/Line]: Current issue → Suggested improvement
2. [Section/Line]: Missing element → Addition needed
3. [Section/Line]: Quality issue → Enhancement required

Example improved sections:
[Provide concrete examples of improved prompts/templates]

### Workflow Script Changes

File: scripts/feature-to-code-unified.sh

If invocation pattern mismatch detected:
1. [Line number]: Current invocation → Corrected invocation
2. Show before/after code snippets
3. Explain why the change is needed

Example:
```bash
# BEFORE (line 1440):
claude /flow:design "$PRD_INPUT" > "$DESIGN_FILE"

# AFTER:
echo "$PRD_INPUT" | claude /flow:design > "$DESIGN_FILE"
```

Rationale: Commands receive input via stdin, not arguments
```

## Validation Checklist

Verify before applying changes:
- [ ] Changes directly address the feedback
- [ ] No breaking changes to command interface
- [ ] Improvements are specific and implementable
- [ ] Enhanced clarity without excessive complexity
- [ ] Command invocation patterns match between script and command files
- [ ] Input processing is consistent (stdin piping pattern)
- [ ] All invocation points in workflow script are updated if needed

## Expected Outcomes

Anticipated results after applying suggestions:
- Specific issues mentioned will be resolved
- Missing elements will be included
- Output quality will improve significantly
- Future rejections for similar reasons will decrease
- Commands will receive input correctly from workflow script
- No more empty file path errors or error messages saved as output

# Phase 5: Next Steps

## Recommended Actions

1. **Apply command improvements**: Use `/apply-reflect` command to update flow command files
2. **Apply script fixes**: If workflow script changes are needed, apply them using Edit tool
3. **Retry workflow**: Re-run the rejected step with improved command and script
4. **Monitor results**: Verify output meets expectations
5. **Iterate if needed**: Collect additional feedback for further refinement

**Important**: If both command files AND the workflow script need changes, apply BOTH before retrying:
- Command file changes ensure proper input processing and validation
- Script changes ensure correct invocation pattern (stdin piping)
- Both must be aligned for the workflow to succeed

## Continuous Improvement

Enable through this feedback loop:
- Progressive command enhancement
- Learning from rejection patterns
- Building more robust workflows
- Reducing manual intervention over time

---
**Analysis complete - Ready to apply improvements**
 