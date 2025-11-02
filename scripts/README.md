# Scripts Directory

## Feature to Code Workflow

### Quick Start

Run the unified workflow script (best practices enabled by default):

```bash
./scripts/feature-to-code-unified.sh "Your feature description"
```

This will:

- ✅ Generate PRD, Technical Design, and Task List
- ✅ Preserve full JSON metadata (conversation history, costs, tokens)
- ✅ Auto-extract readable documents
- ✅ Copy extracted docs to `docs/specs/[execution_id]/`
- ✅ Track workflow in Langfuse (if running)

### Environment Variables

All features are **enabled by default**. Use these to opt-out:

| Variable             | Default | Description                                      |
| -------------------- | ------- | ------------------------------------------------ |
| `DISABLE_TELEMETRY`  | `0`     | Set to `1` to disable Langfuse telemetry         |
| `DISABLE_EXTRACTION` | `0`     | Set to `1` to skip auto-extraction               |
| `SKIP_SPECS_COPY`    | `0`     | Set to `1` to keep docs only in workflow-outputs |
| `APPROVAL_MODE`      | `file`  | Set to `auto` or `interactive`                   |
| `APPROVAL_TIMEOUT`   | `0`     | Timeout in seconds (0 = unlimited)               |

### Examples

**Minimal observability (no telemetry, no specs copy):**

```bash
DISABLE_TELEMETRY=1 SKIP_SPECS_COPY=1 ./scripts/feature-to-code-unified.sh "feature"
```

**Auto-approve everything:**

```bash
APPROVAL_MODE=auto ./scripts/feature-to-code-unified.sh "feature"
```

**From a spec file:**

```bash
./scripts/feature-to-code-unified.sh docs/specs/my-feature/spec.md
```

**Resume existing workflow:**

```bash
./scripts/feature-to-code-unified.sh workflow-outputs/20251026_123456
```

## Utility Scripts

### Extract Artifacts

Extract readable documents from JSON streaming output:

```bash
# Extract in place (creates .extracted.md files)
python3 scripts/extract-artifacts.py workflow-outputs/20251026_123456

# Extract to specific location
python3 scripts/extract-artifacts.py workflow-outputs/20251026_123456 docs/specs/my-feature
```

### Claude with Telemetry

Wrapper for `claude -p` that adds Langfuse telemetry:

```bash
python3 scripts/claude-with-telemetry.py "Your prompt" "execution_id" "step_name"
```

### Send Workflow Telemetry

Manually send telemetry data for workflow steps:

```bash
source scripts/send-workflow-telemetry.sh
send_trace_to_langfuse "$EXECUTION_ID" "Step Name" "completed" '{"metadata": "value"}'
```

## Workflow Approval System

The workflow includes approval checkpoints at:

1. After PRD generation
2. After Technical Design generation
3. After Task List generation

### Approval Modes

**File-based (default):**

- Script creates `.approval_*.json` files
- Respond with `.approval_*.json.response` files
- Approve: `echo '{"status":"approved"}' > .approval_PRD.json.response`
- Reject: `echo '{"status":"rejected","reason":"..."}' > .approval_PRD.json.response`

**Interactive:**

- Prompts in terminal for y/n
- Set with: `APPROVAL_MODE=interactive`

**Auto:**

- Automatically approves all checkpoints
- Set with: `APPROVAL_MODE=auto`

## Observability

### Langfuse Integration

When telemetry is enabled (default):

1. Start Langfuse: `cd observability && docker-compose up -d`
2. Run workflow normally
3. View traces at http://localhost:3000
4. Search by execution ID

### What Gets Tracked

- Each workflow step (PRD, Design, Tasks)
- Approval checkpoints
- Timing and duration
- Model usage and costs
- Custom metadata

## Migration from Old Script

The original `feature-to-code.sh` is deprecated and redirects to the unified script. See `FEATURE_TO_CODE_MIGRATION.md` for details.

## Troubleshooting

**Langfuse not running:**

- Telemetry fails gracefully, workflow continues
- Disable with: `DISABLE_TELEMETRY=1`

**Python not found:**

- Extraction and telemetry require Python 3
- Install: `apt install python3` or `brew install python3`

**Langfuse SDK missing:**

- Quick install: `./scripts/install-telemetry-deps.sh` (tries multiple methods)
- Manual install: `python3 -m pip install --user langfuse`
- For externally-managed environments: See installation script output for options

**Approval timeout:**

- Set timeout: `APPROVAL_TIMEOUT=300` (5 minutes)
- Default is unlimited (0)

## File Structure

```
scripts/
├── feature-to-code-unified.sh      # Main workflow script
├── feature-to-code.sh              # Deprecated (redirects to unified)
├── extract-artifacts.py            # Extract docs from JSON
├── claude-with-telemetry.py        # Claude CLI wrapper with telemetry
├── send-workflow-telemetry.sh      # Manual telemetry helper
├── workflow-approval-server.py     # Approval UI server
├── FEATURE_TO_CODE_MIGRATION.md    # Migration guide
└── README.md                       # This file
```

## Best Practices

1. **Keep JSON files** - They contain valuable metadata
2. **Use telemetry** - Track workflow performance and costs
3. **Review extracted docs** - JSON is for machines, extracted is for humans
4. **Organize in docs/specs** - Default behavior copies there
5. **Use execution IDs** - Link all artifacts and traces together
