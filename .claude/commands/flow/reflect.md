---
description: "Analyze feedback from workflow rejection and suggest command improvements"
argument-hint: "<feedback-file-or-description>"
allowed-tools: "Read, Grep, Glob"
model: "claude-3-5-sonnet-20241022"
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

## Root Cause Analysis

Identify based on feedback:
- Which specific command needs improvement
- What sections of the command led to the issues
- Gaps in the current prompts or templates
- Ambiguous or unclear instructions

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

## Suggested Command Modifications

Generate specific recommendations in this format:

```markdown
Command to modify: [prd.md | design.md | tasks.md]

Specific changes:
1. [Section/Line]: Current issue → Suggested improvement
2. [Section/Line]: Missing element → Addition needed
3. [Section/Line]: Quality issue → Enhancement required

Example improved sections:
[Provide concrete examples of improved prompts/templates]
```

## Validation Checklist

Verify before applying changes:
- [ ] Changes directly address the feedback
- [ ] No breaking changes to command interface
- [ ] Improvements are specific and implementable
- [ ] Enhanced clarity without excessive complexity

## Expected Outcomes

Anticipated results after applying suggestions:
- Specific issues mentioned will be resolved
- Missing elements will be included
- Output quality will improve significantly
- Future rejections for similar reasons will decrease

# Phase 5: Next Steps

## Recommended Actions

1. **Apply suggestions**: Use `/apply-reflect` command with these recommendations
2. **Retry workflow**: Re-run the rejected step with improved command
3. **Monitor results**: Verify output meets expectations
4. **Iterate if needed**: Collect additional feedback for further refinement

## Continuous Improvement

Enable through this feedback loop:
- Progressive command enhancement
- Learning from rejection patterns
- Building more robust workflows
- Reducing manual intervention over time

---
**Analysis complete - Ready to apply improvements**
 