# Feature to Code Script Migration Guide

## Overview

The original `feature-to-code.sh` script has been replaced with `feature-to-code-unified.sh` which fixes several issues and adds new capabilities:

### Key Improvements

1. **Preserves JSON Metadata** - Keeps the valuable streaming JSON output with full conversation history
2. **Automatic Artifact Extraction** - Extracts readable documents from JSON automatically
3. **Optional Telemetry** - Integrates with Langfuse when enabled
4. **Backwards Compatible** - Works exactly like the original by default

## Migration Steps

### 1. Update Your Commands

Replace:

```bash
./scripts/feature-to-code.sh "your feature"
```

With:

```bash
./scripts/feature-to-code-unified.sh "your feature"
```

### 2. Environment Variables

The new script has **best practices enabled by default** with opt-out environment variables:

```bash
# Disable Langfuse telemetry (enabled by default)
DISABLE_TELEMETRY=1 ./scripts/feature-to-code-unified.sh "feature"

# Disable auto-extraction (enabled by default)
DISABLE_EXTRACTION=1 ./scripts/feature-to-code-unified.sh "feature"

# Skip copying to docs/specs folder (copies by default)
SKIP_SPECS_COPY=1 ./scripts/feature-to-code-unified.sh "feature"

# Change approval mode (default: file)
APPROVAL_MODE=auto ./scripts/feature-to-code-unified.sh "feature"

# Set approval timeout (default: unlimited)
APPROVAL_TIMEOUT=300 ./scripts/feature-to-code-unified.sh "feature"
```

### 3. Understanding the Output

The unified script creates:

- **JSON files** (`prd_*.md`, `tdd_*.md`, `tasks_*.md`) - Contains full metadata
- **Extracted files** (`*.extracted.md`) - Human-readable documents
- **Metadata files** (`*.metadata.json`) - Token usage, costs, model info

## Why Keep JSON Format?

The JSON streaming format provides:

- Complete conversation history
- Token usage and cost tracking
- Model and timing information
- Debugging capabilities
- Future telemetry integration

## Manual Extraction

If auto-extraction is disabled or you need to re-extract:

```bash
# Extract in place
python3 scripts/extract-artifacts.py workflow-outputs/20251025_215307

# Extract to specific location
python3 scripts/extract-artifacts.py workflow-outputs/20251025_215307 docs/specs/my-feature
```

## Telemetry

When telemetry is enabled:

1. Workflow steps are tracked in Langfuse
2. Each step appears as a span
3. Execution IDs link all steps together
4. View at http://localhost:3000

## Default Behavior

By default, the unified script follows best practices:

- ✅ Keeps JSON format (preserves metadata)
- ✅ Auto-extracts readable documents
- ✅ Telemetry enabled (tracks workflow in Langfuse)
- ✅ Copies extracted docs to `docs/specs/[execution_id]/`

This gives you full observability and proper artifact management out of the box.

## Troubleshooting

### No readable documents

- Check if extraction was disabled: `DISABLE_EXTRACTION=1`
- Run extraction manually if needed: `python3 scripts/extract-artifacts.py workflow-outputs/YYYYMMDD_HHMMSS`

### Don't want documents in docs/specs

- Set `SKIP_SPECS_COPY=1` to keep them only in workflow-outputs

### Don't want telemetry

- Set `DISABLE_TELEMETRY=1`
- Or ensure Langfuse is not running (telemetry will fail gracefully)

### Old workflow resume

- Works the same: `./scripts/feature-to-code-unified.sh workflow-outputs/YYYYMMDD_HHMMSS`

### Running without Langfuse

If Langfuse isn't running, telemetry will fail gracefully and the workflow continues. To avoid warnings:

```bash
DISABLE_TELEMETRY=1 ./scripts/feature-to-code-unified.sh "feature"
```
