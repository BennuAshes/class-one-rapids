# Workflow Command Invocation Fix

## Issue Summary

The `feature-to-code-unified.sh` workflow script was **not properly invoking Claude commands** defined in `.claude/commands/`. This caused the Technical Design Document (TDD) and Task List generation to fail with error messages like "I need to understand what PRD you'd like me to work with" instead of generating actual content.

### Root Cause

The script was creating generic prompts that embedded file content instead of properly invoking the commands with file path arguments:

**❌ INCORRECT (Old Approach):**

```bash
# Embedding content in a prompt
cat > "$TEMP_PROMPT" <<EOF
Read the PRD below and generate a comprehensive Technical Design Document...

PRD:
$PRD_CONTENT
EOF

cat "$TEMP_PROMPT" | claude -p --verbose --output-format stream-json > "$DESIGN_FILE"
```

**✅ CORRECT (Fixed Approach):**

```bash
# Properly invoking the command with file path argument
claude /design "$PRD_INPUT" --output-format stream-json > "$DESIGN_FILE"
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

### Step 1: PRD Generation (Lines 522-575)

**Change**: Use proper command invocation

```bash
# Create temp file for feature description
TEMP_FEATURE_FILE=$(mktemp)
echo "$FEATURE_DESC" > "$TEMP_FEATURE_FILE"

# Invoke command
claude /prd "$TEMP_FEATURE_FILE" --output-format stream-json > "$PRD_FILE"

rm -f "$TEMP_FEATURE_FILE"
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

### Before Fix

1. **PRD**: ✅ Generated correctly (was already using a working approach)
2. **TDD**: ❌ Showed error: "I need to understand what PRD you'd like me to work with"
3. **Tasks**: ❌ Showed error: "Which TDD file would you like me to convert into a task list?"

### After Fix

1. **PRD**: ✅ Uses proper command invocation
2. **TDD**: ✅ Receives PRD file path as argument per `design.md` command spec
3. **Tasks**: ✅ Receives TDD file path as argument per `tasks.md` command spec

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

**Fixed**: 2025-10-27
**Impact**: All three document generation steps now work correctly
**Files Modified**: `scripts/feature-to-code-unified.sh`
