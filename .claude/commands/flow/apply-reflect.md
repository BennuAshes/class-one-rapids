---
description: "Apply feedback-driven improvements to flow commands"
argument-hint: "<checkpoint> <suggestions-file-or-text>"
allowed-tools: "Read, Write, Edit, Bash(cp:*)"
model: "claude-3-5-sonnet-20241022"
---

# Apply Feedback Suggestions

Apply feedback-driven improvements to flow commands based on checkpoint and suggestions.

## Phase 1: Parse Input

Parse arguments from $ARGUMENTS:
- First argument: Checkpoint name (PRD, Design, or Tasks)
- Remaining arguments: Suggestions (file path or inline text)

Validate checkpoint and map to command file:
- "PRD" → `prd.md`
- "Technical Design" or "Design" → `design.md`
- "Task List" or "Tasks" → `tasks.md`

If checkpoint is invalid:
- Report error: "Invalid checkpoint. Must be PRD, Design, or Tasks"
- Exit with error status

Identify target command in @.claude/commands/flow/

## Phase 2: Read Current Command

Identify target command file based on checkpoint mapping.

Read current command content:
- PRD checkpoint: @.claude/commands/flow/prd.md
- Design checkpoint: @.claude/commands/flow/design.md
- Tasks checkpoint: @.claude/commands/flow/tasks.md

Analyze current structure:
- YAML frontmatter configuration
- Prompt sections and phases
- Template requirements
- Output format specifications

## Phase 3: Extract Improvement Suggestions

Parse suggestions to identify:

### Specific Issues Found
- Problems in prompt structure
- Misleading or vague instructions
- Ambiguous sections requiring clarification

### Missing Elements
- Absent required sections
- Lacking validation checks
- Missing context or requirements

### Quality Improvements
- Opportunities for enhanced clarity
- Areas needing more detail
- Technical depth enhancements

### Structural Changes
- Modifications to command flow
- Template structure updates
- New sections to add

## Phase 4: Generate Improved Command

Create improved version addressing feedback:

### Fix Specific Issues
- Correct identified problems in prompt structure
- Replace misleading or vague instructions
- Clarify ambiguous sections

### Add Missing Elements
- Include new required sections
- Add validation checks
- Incorporate missing context

### Enhance Quality
- Improve prompt clarity and specificity
- Add detailed examples or templates
- Strengthen technical requirements

### Preserve Compatibility
- Maintain command's core functionality
- Keep same input/output format
- Ensure backward compatibility

## Phase 5: Backup and Save

### Create Backup
Execute backup before modifications:
!`cp .claude/commands/flow/$TARGET_FILE .claude/commands/flow/$TARGET_FILE.backup`

Where `$TARGET_FILE` is the identified command file (prd.md, design.md, or tasks.md).

### Validate Changes
Verify before saving:
- Command syntax is valid
- All required YAML frontmatter fields present
- File references use correct @ syntax
- Improvements address the feedback
- No breaking changes introduced

### Save Updated Command
Write improved command to original location using Edit or Write tool.

Confirm file was updated successfully.

## Phase 6: Report Changes

### Changes Applied
Document specific improvements made:
- Modified sections and rationale
- Added elements and their purpose
- Enhanced features and expected impact

### Expected Impact
Anticipated results:
- Higher quality command output
- Better coverage of requirements
- Improved clarity and completeness
- Reduced need for manual corrections

### Next Steps
Recommend actions:
1. Retry the failed workflow step with improved command
2. Monitor output quality from updated command
3. Collect additional feedback for further refinement

---
**Command improved based on feedback**
**Ready to retry workflow step with enhanced instructions**