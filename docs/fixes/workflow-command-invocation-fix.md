# Workflow Command Invocation Fix

## Issue Summary

The `feature-to-code-unified.sh` workflow script had **multiple issues** preventing slash commands from receiving the feature description:

1. **Timing Issue**: Using `mktemp` and deleting files before Claude could process them
2. **Argument Passing Bug**: GitHub Issue #1048 - slash command arguments (`$ARGUMENTS`, `$1`, `$2`) are unreliable and sometimes arrive empty

This resulted in the error: "Could you please provide the feature description?"

### Root Causes

**Issue #1 - Timing Problem:**
The script was using `mktemp` to create a temporary file, then deleting it immediately after invoking the command - before Claude could read it:

**Issue #2 - Argument Interpolation Bug:**
Even with persistent files, passing file paths as arguments doesn't work reliably due to GitHub Issue #1048 where `$1` and `$ARGUMENTS` arrive empty.

**❌ INCORRECT - Attempt #1 (Timing Issue):**

```bash
# Creating temp file and deleting it immediately
TEMP_FEATURE_FILE=$(mktemp)
echo "$FEATURE_DESC" > "$TEMP_FEATURE_FILE"

# Invoke command (happens asynchronously)
claude /flow:prd "$TEMP_FEATURE_FILE" > "$PRD_FILE"

# Delete file BEFORE Claude can read it!
rm -f "$TEMP_FEATURE_FILE"
```

**❌ INCORRECT - Attempt #2 (Argument Bug):**

```bash
# Use persistent file in work directory
FEATURE_INPUT_FILE="$WORK_DIR/feature-description.md"
echo "$FEATURE_DESC" > "$FEATURE_INPUT_FILE"

# Pass file path as argument - but $1 arrives empty due to GitHub Issue #1048!
claude /flow:prd "$FEATURE_INPUT_FILE" --output-format stream-json > "$PRD_FILE"
```

**✅ CORRECT (Final Fix - Use Stdin):**

```bash
# Save feature description to file for workflow artifacts
FEATURE_INPUT_FILE="$WORK_DIR/feature-description.md"
echo "$FEATURE_DESC" > "$FEATURE_INPUT_FILE"

# Pipe content directly via stdin (avoids argument passing bugs)
echo "$FEATURE_DESC" | claude /flow:prd --output-format stream-json --verbose > "$PRD_FILE"
```

## Commands Structure

The commands in `.claude/commands/` are designed to be invoked via the Claude CLI:

### 1. PRD Command (`prd.md`)

- **Invocation**: `claude /prd <feature-description>`
- **Accepts**: Inline text or file path containing feature description
- **Generates**: Product Requirements Document

### 2. Design Command (`design.md`)

- **Invocation**: `claude /design <prd-file-path>`
- **Accepts**: Path to PRD file
- **Generates**: Technical Design Document

### 3. Tasks Command (`tasks.md`)

- **Invocation**: `claude /tasks <tdd-file-path>`
- **Accepts**: Path to TDD file
- **Generates**: Executable task list

### 4. Execute Task Command (`execute-task.md`)

- **Invocation**: `claude /execute-task <task-list-file-path> [task-id]`
- **Accepts**: Path to task list file, optional task ID
- **Executes**: Tasks from the list using TDD methodology

## Changes Made

### Step 1: PRD Generation (Lines 1383-1399)

**CRITICAL ISSUE**: The script was creating a temporary file with `mktemp`, passing it to the Claude command, and then **immediately deleting it** before Claude could read it. Since Claude commands execute asynchronously, by the time Claude tried to read `$ARGUMENTS` (which contained the temp file path), the file no longer existed.

**Fix**: Use a persistent file in the work directory instead of a temp file

```bash
# Create persistent file for feature description (don't delete it!)
FEATURE_INPUT_FILE="$WORK_DIR/feature-description.md"
echo "$FEATURE_DESC" > "$FEATURE_INPUT_FILE"

# Invoke command - file will still exist when Claude reads it
claude /flow:prd "$FEATURE_INPUT_FILE" --output-format stream-json > "$PRD_FILE"

# Keep the file as part of workflow artifacts (don't delete)
```

### Step 2: TDD Generation (Lines 577-628)

**Change**: Invoke `/design` command with PRD file path

```bash
# Extract PRD if it's in JSON format
PRD_INPUT="$PRD_FILE"
if grep -q '^{' "$PRD_FILE" 2>/dev/null; then
  if [ -f "scripts/extract-artifacts.py" ]; then
    python3 scripts/extract-artifacts.py "$WORK_DIR" > /dev/null 2>&1
    if [ -f "$PRD_FILE.extracted.md" ]; then
      PRD_INPUT="$PRD_FILE.extracted.md"
    fi
  fi
fi

# Use the /design command with file path
claude /design "$PRD_INPUT" --output-format stream-json > "$DESIGN_FILE"
```

### Step 3: Tasks Generation (Lines 630-678)

**Change**: Invoke `/tasks` command with TDD file path

```bash
# Extract TDD if it's in JSON format
TDD_INPUT="$DESIGN_FILE"
if grep -q '^{' "$DESIGN_FILE" 2>/dev/null; then
  if [ -f "scripts/extract-artifacts.py" ]; then
    python3 scripts/extract-artifacts.py "$WORK_DIR" > /dev/null 2>&1
    if [ -f "$DESIGN_FILE.extracted.md" ]; then
      TDD_INPUT="$DESIGN_FILE.extracted.md"
    fi
  fi
fi

# Use the /tasks command with file path
claude /tasks "$TDD_INPUT" --output-format stream-json > "$TASKS_FILE"
```

## Why This Matters

### Before Fix (Issue discovered: 2025-11-02)

1. **PRD**: ❌ Showed error: "Could you please provide the feature description?" because temp file was deleted before Claude could read it
2. **TDD**: ✅ Works correctly (uses persistent files in work directory)
3. **Tasks**: ✅ Works correctly (uses persistent files in work directory)

### After Fix

1. **PRD**: ✅ Uses persistent file in work directory that exists when Claude reads it
2. **TDD**: ✅ Continues to work correctly with persistent files
3. **Tasks**: ✅ Continues to work correctly with persistent files

## Command Template Requirements

Each command in `.claude/commands/` has specific requirements:

### `prd.md`

```yaml
description: "Generate a comprehensive Product Requirements Document from feature description"
argument-hint: "<feature-description>"
```

- Expects: Feature description (text or file)
- Analyzes: Core problem, target users, business value
- Outputs: Comprehensive PRD with 12 sections

### `design.md`

```yaml
description: "Generate a comprehensive Technical Design Document from a Product Requirements Document"
argument-hint: "<prd-file-path>"
```

- Expects: Path to PRD file
- Reads: PRD to extract requirements
- Outputs: TDD with architecture, API design, data models, TDD strategy

### `tasks.md`

```yaml
description: "Generate explicit, agent-executable task list from Technical Design Document"
argument-hint: "<tdd-file-path>"
```

- Expects: Path to TDD file
- Analyzes: TDD to decompose into tasks
- Outputs: Phase-by-phase task list with TDD cycles

### `execute-task.md`

```yaml
description: "Execute tasks from task list using Test-Driven Development (TDD) methodology"
argument-hint: "<task-list-file-path> [task-id|phase-name]"
```

- Expects: Path to task list file, optional task/phase identifier
- Follows: RED-GREEN-REFACTOR TDD cycle
- Implements: Features with tests first

## Testing the Fix

To test that the fix works:

```bash
# Run workflow with a feature description
./scripts/feature-to-code-unified.sh docs/specs/my-feature.md

# Or resume an existing workflow
./scripts/feature-to-code-unified.sh workflow-outputs/20251027_HHMMSS
```

Expected output:

- PRD generates with proper content
- TDD generates based on PRD (not error message)
- Tasks generate based on TDD (not error message)
- All files extracted to `docs/specs/TIMESTAMP/`

## Related Files

- **Workflow Script**: `scripts/feature-to-code-unified.sh`
- **Commands**: `.claude/commands/{prd,design,tasks,execute-task}.md`
- **Extraction Script**: `scripts/extract-artifacts.py`
- **Telemetry Wrapper**: `scripts/claude-with-telemetry.py`

## Best Practices

1. **Always use command invocation**: Use `claude /command-name` syntax
2. **Pass file paths for chained commands**: TDD needs PRD path, Tasks need TDD path
3. **Extract JSON output first**: If files are in stream-json format, extract before passing
4. **Preserve metadata**: JSON format keeps conversation history, costs, timing
5. **Follow command specs**: Check `argument-hint` in command YAML header

---

**Issue Discovered**: 2025-11-02
**Fixed**: 2025-11-02 (multiple iterations)
**Root Causes**:
1. Temporary file deletion before async command execution
2. GitHub Issue #1048 - slash command argument passing unreliable

**Solution**: Pipe content via stdin instead of using arguments
**Impact**: PRD, TDD, and Tasks generation now work correctly
**Files Modified**:
- `scripts/feature-to-code-unified.sh` (lines 1383-1396)
- `.claude/commands/flow/prd.md`
- `docs/fixes/workflow-command-invocation-fix.md`

## Key Lesson Learned

**Slash command arguments (`$ARGUMENTS`, `$1`, `$2`) are unreliable.** Use stdin (piping) instead:

```bash
# ❌ DON'T: Pass arguments
claude /command "$ARG" > output.md

# ✅ DO: Pipe via stdin
echo "$CONTENT" | claude /command > output.md
```
