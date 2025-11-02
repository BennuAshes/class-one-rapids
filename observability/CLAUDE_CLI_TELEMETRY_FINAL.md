# Claude CLI Telemetry - Final Solution

## Executive Summary

The Claude CLI (`claude -p`) does not have built-in OpenTelemetry support. We've created a comprehensive solution that:

1. **Preserves valuable JSON metadata** from Claude CLI output
2. **Auto-extracts readable documents** for human consumption
3. **Integrates Langfuse telemetry** via Python SDK wrapper
4. **Enables best practices by default** with opt-out environment variables

## The Problem

The original `feature-to-code.sh` script used `--output-format stream-json` which:

- ✅ Captured full conversation history and metadata
- ❌ Made files unreadable (JSON format instead of markdown)
- ❌ No telemetry integration (Claude CLI doesn't support OTEL)

## The Solution

### 1. Unified Workflow Script

**File**: `scripts/feature-to-code-unified.sh`

**Features enabled by default:**

- Telemetry tracking in Langfuse
- Auto-extraction of readable documents
- Copying extracted docs to `docs/specs/[execution_id]/`
- Approval checkpoints

**Opt-out with environment variables:**

```bash
DISABLE_TELEMETRY=1          # Skip Langfuse tracking
DISABLE_EXTRACTION=1         # Keep only JSON files
SKIP_SPECS_COPY=1           # Don't copy to docs/specs
```

### 2. Artifact Extraction

**File**: `scripts/extract-artifacts.py`

Parses JSON streaming output and extracts:

- Readable markdown documents
- Metadata (costs, tokens, timing)
- Conversation history

### 3. Telemetry Integration

**Files**:

- `scripts/claude-with-telemetry.py` - Wrapper for claude CLI
- `scripts/send-workflow-telemetry.sh` - Manual telemetry helper

Tracks in Langfuse:

- Each workflow step (PRD, Design, Tasks)
- Approval checkpoints
- Timing and duration
- Model usage and costs

## Environment Variables (Best Practices)

| Variable             | Default         | Description                                 |
| -------------------- | --------------- | ------------------------------------------- |
| `DISABLE_TELEMETRY`  | `0` (enabled)   | Set to `1` to disable Langfuse              |
| `DISABLE_EXTRACTION` | `0` (enabled)   | Set to `1` to skip extraction               |
| `SKIP_SPECS_COPY`    | `0` (copies)    | Set to `1` to keep in workflow-outputs only |
| `APPROVAL_MODE`      | `file`          | `auto`, `interactive`, or `file`            |
| `APPROVAL_TIMEOUT`   | `0` (unlimited) | Timeout in seconds                          |

## Usage Examples

### Default (all best practices enabled)

```bash
./scripts/feature-to-code-unified.sh "Create user authentication system"
```

### Minimal (no telemetry, no specs copy)

```bash
DISABLE_TELEMETRY=1 SKIP_SPECS_COPY=1 ./scripts/feature-to-code-unified.sh "feature"
```

### Auto-approve everything

```bash
APPROVAL_MODE=auto ./scripts/feature-to-code-unified.sh "feature"
```

## What Gets Created

### In `workflow-outputs/[execution_id]/`:

```
prd_20251026.md              # JSON streaming output (full metadata)
prd_20251026.extracted.md    # Readable markdown document
prd_20251026.metadata.json   # Extracted metadata (costs, tokens)
tdd_20251026.md              # Technical design (JSON)
tdd_20251026.extracted.md    # Readable technical design
tasks_20251026.md            # Task list (JSON)
tasks_20251026.extracted.md  # Readable task list
workflow-status.json         # Workflow state
workflow-summary.md          # Summary report
```

### In `docs/specs/[execution_id]/`:

```
prd_extracted_20251026.md    # Copied from workflow-outputs
technical_design_20251026.md # Copied from workflow-outputs
tasks_20251026.md            # Copied from workflow-outputs
```

## Why This Approach?

### JSON Format Benefits

- Complete conversation history
- Token usage and cost tracking
- Model and timing information
- Debugging capabilities
- Reproducibility

### Extraction Benefits

- Human-readable documents
- Easy to review and edit
- Can be committed to git
- Shareable with team

### Telemetry Benefits

- Track workflow performance
- Monitor costs over time
- Debug failures
- Optimize prompts

## Migration from Old Script

The old `feature-to-code.sh`:

- Shows deprecation notice
- Auto-redirects to unified script after 3 seconds
- All arguments pass through unchanged

## Observability Stack

### Required Services

```bash
cd observability
docker-compose up -d
```

### Access Points

- **Langfuse UI**: http://localhost:3000
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090

### Search by Execution ID

Each workflow run has a unique execution ID (e.g., `20251026_123456`) that links:

- All workflow steps in Langfuse
- All files in workflow-outputs
- All extracted documents in docs/specs

## Troubleshooting

### Langfuse not running

- Telemetry fails gracefully
- Workflow continues normally
- Disable with: `DISABLE_TELEMETRY=1`

### Python dependencies missing

```bash
pip install langfuse
```

### Want to re-extract artifacts

```bash
python3 scripts/extract-artifacts.py workflow-outputs/20251026_123456
```

### Need to copy to different location

```bash
python3 scripts/extract-artifacts.py workflow-outputs/20251026_123456 docs/specs/my-feature
```

## Key Takeaways

1. **Claude CLI has no OTEL support** - We use Python SDK wrapper instead
2. **JSON format is valuable** - Preserves full metadata and history
3. **Best practices enabled by default** - Opt-out rather than opt-in
4. **Graceful degradation** - Works without Langfuse running
5. **Backwards compatible** - Old script redirects to new one

## Documentation

- **Quick Start**: `scripts/README.md`
- **Migration Guide**: `scripts/FEATURE_TO_CODE_MIGRATION.md`
- **Telemetry Solution**: `observability/CLAUDE_CLI_TELEMETRY_SOLUTION.md`
- **This Document**: `observability/CLAUDE_CLI_TELEMETRY_FINAL.md`

---

_Last Updated: 2025-10-26_
_Status: Production Ready_

