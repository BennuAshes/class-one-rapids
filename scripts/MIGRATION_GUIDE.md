# Migration Guide: Simplified Python Workflow

## Overview

The workflow system has been simplified to use **Python-only** with a thin bash wrapper. This eliminates redundancy and improves maintainability.

## What's Changed

### 1. Single Entry Point

**Old:**
```bash
./scripts/feature-to-code-unified.sh "feature"
WORKFLOW_ENGINE=python ./scripts/feature-to-code-unified.sh "feature"
```

**New:**
```bash
./workflow "feature"
# OR
python3 scripts/workflow.py "feature"
```

### 2. Simplified Environment Variables

Most environment variables have been replaced with command-line arguments:

| Old Variable | New Approach |
|--------------|--------------|
| `WORKFLOW_ENGINE` | **Removed** - Python only |
| `DISABLE_TELEMETRY` | Use `--no-telemetry` flag |
| `DISABLE_EXTRACTION` | **Removed** - Always extract |
| `SKIP_SPECS_COPY` | **Removed** - Use `--output DIR` |
| `APPROVAL_MODE` | Use `--approval MODE` |
| `APPROVAL_TIMEOUT` | Use `--timeout SECONDS` |
| `AUTO_APPLY_FEEDBACK` | Part of approval profiles |
| `AUTO_RETRY_AFTER_FEEDBACK` | Part of approval profiles |
| `SHOW_FILE_CHANGES` | **Always enabled** |
| `REQUIRE_COMMAND_APPROVAL` | Part of approval profiles |
| `WEBHOOK_URL` | Use `--webhook URL` |

### 3. Approval Profiles

Instead of multiple flags, use approval profiles:

```bash
# Minimal - Auto-approve except Execute
./workflow --approval minimal "feature"

# Standard - File-based approval (default)
./workflow --approval standard "feature"

# Strict - Approve everything
./workflow --approval strict "feature"

# Interactive - Terminal prompts
./workflow --approval interactive "feature"
```

### 4. Langfuse Configuration

Still uses environment variables (for security):
- `LANGFUSE_PUBLIC_KEY`
- `LANGFUSE_SECRET_KEY`
- `LANGFUSE_HOST`

Default values are provided if not set.

## Migration Examples

### Example 1: Basic Usage

**Old:**
```bash
./scripts/feature-to-code-unified.sh "Add login feature"
```

**New:**
```bash
./workflow "Add login feature"
```

### Example 2: Auto-Approval

**Old:**
```bash
APPROVAL_MODE=auto ./scripts/feature-to-code-unified.sh "feature"
```

**New:**
```bash
./workflow --approval minimal "feature"
```

### Example 3: No Telemetry

**Old:**
```bash
DISABLE_TELEMETRY=1 ./scripts/feature-to-code-unified.sh "feature"
```

**New:**
```bash
./workflow --no-telemetry "feature"
```

### Example 4: Custom Output Directory

**Old:**
```bash
# Would output to workflow-outputs/YYYYMMDD_HHMMSS
./scripts/feature-to-code-unified.sh "feature"
```

**New:**
```bash
./workflow --output my-project "feature"
# Outputs to my-project/YYYYMMDD_HHMMSS
```

### Example 5: Full Automation with Feedback

**Old:**
```bash
APPROVAL_MODE=auto \
AUTO_APPLY_FEEDBACK=true \
AUTO_RETRY_AFTER_FEEDBACK=true \
./scripts/feature-to-code-unified.sh "feature"
```

**New:**
```bash
./workflow --approval minimal "feature"
# minimal profile includes auto_apply_feedback=true
```

### Example 6: Resume Workflow

**Old:**
```bash
./scripts/feature-to-code-unified.sh workflow-outputs/20251108_123456
```

**New:**
```bash
./workflow workflow-outputs/20251108_123456
```

## Backward Compatibility

For a transition period, the old `feature-to-code-unified.sh` can be updated to:

```bash
#!/bin/bash
# Compatibility wrapper
echo "Note: Redirecting to new workflow system..."

# Convert old environment variables to new flags
ARGS=()

if [ "${APPROVAL_MODE}" = "auto" ]; then
    ARGS+=("--approval" "minimal")
elif [ "${APPROVAL_MODE}" = "interactive" ]; then
    ARGS+=("--approval" "interactive")
fi

if [ "${DISABLE_TELEMETRY:-0}" = "1" ]; then
    ARGS+=("--no-telemetry")
fi

if [ -n "${APPROVAL_TIMEOUT}" ] && [ "${APPROVAL_TIMEOUT}" != "0" ]; then
    ARGS+=("--timeout" "${APPROVAL_TIMEOUT}")
fi

if [ -n "${WEBHOOK_URL}" ]; then
    ARGS+=("--webhook" "${WEBHOOK_URL}")
fi

# Execute new workflow
exec ./workflow "${ARGS[@]}" "$@"
```

## Benefits of New System

1. **Single Implementation** - No more bash/Python duplication
2. **Cleaner CLI** - Standard command-line arguments instead of environment variables
3. **Better Profiles** - Approval profiles bundle related settings
4. **Type Safety** - Python provides better error checking
5. **Async I/O** - Better performance with async operations
6. **Maintainability** - All logic in one place

## Getting Help

```bash
# Show all options
./workflow --help

# Show version
./workflow --version
```

## Cleanup

After migration, you can remove:
- `scripts/feature-to-code-unified.sh` (1755 lines)
- `scripts/workflow-monitor.sh`
- `scripts/deprecated/` directory
- `scripts/libs/workflow_telemetry.py`
- Old workflow CLI in `scripts/workflow/cli.py`
- Old orchestrator in `scripts/workflow/orchestrator.py`

Keep the new files:
- `workflow` (thin bash wrapper)
- `scripts/workflow.py` (main entry point)
- `scripts/workflow/orchestrator_v2.py` (enhanced orchestrator)
- Updated `scripts/workflow/types.py`