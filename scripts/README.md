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
| `WORKFLOW_ENGINE`    | `bash`  | Set to `python` to use Python workflow implementation |
| `DISABLE_TELEMETRY`  | `0`     | Set to `1` to disable Langfuse telemetry         |
| `DISABLE_EXTRACTION` | `0`     | Set to `1` to skip auto-extraction               |
| `SKIP_SPECS_COPY`    | `0`     | Set to `1` to keep docs only in workflow-outputs |
| `APPROVAL_MODE`      | `file`  | Set to `auto` or `interactive` (auto still requires Execute Tasks approval) |
| `APPROVAL_TIMEOUT`   | `0`     | Timeout in seconds (0 = unlimited)               |
| `AUTO_APPLY_FEEDBACK` | `false` | Set to `true` to automatically apply feedback improvements |
| `AUTO_RETRY_AFTER_FEEDBACK` | `false` | Set to `true` to retry steps after applying feedback |
| `SHOW_FILE_CHANGES` | `true`  | Set to `false` to disable file change tracking |
| `REQUIRE_COMMAND_APPROVAL` | `true` | Set to `false` to skip approval for command improvements |

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

### Python Workflow (Recommended)

Use the new Python implementation for better reliability and features:

```bash
# Enable Python workflow engine
WORKFLOW_ENGINE=python ./scripts/feature-to-code-unified.sh "feature description"

# Or run directly
python3 -m scripts.workflow.cli "feature description"

# With auto-approval
python3 -m scripts.workflow.cli --approval-mode auto feature.md

# Interactive mode
python3 -m scripts.workflow.cli --approval-mode interactive feature.md
```

**Benefits:**
- ✅ Fixes stream-json output issues
- ✅ Type-safe implementation
- ✅ Better error handling
- ✅ Resumable workflows
- ✅ Async I/O for better performance

### Extract Artifacts

Extract readable documents from JSON streaming output:

```bash
# Extract in place (creates .extracted.md files)
python3 scripts/utils/extract-artifacts.py workflow-outputs/20251026_123456

# Extract to specific location
python3 scripts/utils/extract-artifacts.py workflow-outputs/20251026_123456 docs/specs/my-feature
```

### Claude with Telemetry

Wrapper for `claude -p` that adds Langfuse telemetry:

```bash
python3 scripts/utils/claude-with-telemetry.py "Your prompt" "execution_id" "step_name"
```

### Check Approvals

Diagnostic tool for troubleshooting approval files:

```bash
python3 scripts/utils/check-approvals.py workflow-outputs/20251026_123456
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

- Automatically approves all checkpoints EXCEPT "Execute Tasks"
- Set with: `APPROVAL_MODE=auto`
- **⚠️ Important:** The "Execute Tasks" approval always requires explicit user confirmation, even in auto mode

### Special: Execute Tasks Approval

The **"Execute Tasks"** checkpoint is a special safety measure that:
- **Always requires explicit approval**, regardless of approval mode
- Appears after the Task List is approved
- Is visually highlighted in both UIs with:
  - Red borders and pulsing animation
  - "⚠️ FINAL APPROVAL" badge
  - Warning text about code execution
- Triggers actual code generation and test execution via `/execute-task` command
- Cannot be bypassed with `APPROVAL_MODE=auto`

This ensures users always have final control before code execution begins.

### Automatic Feedback Application

When workflows are rejected with feedback, the system can automatically improve the commands and retry:

**Enable Auto-Apply Feedback:**
```bash
AUTO_APPLY_FEEDBACK=true ./scripts/feature-to-code-unified.sh "feature"
```

**Enable Auto-Retry After Feedback:**
```bash
AUTO_APPLY_FEEDBACK=true AUTO_RETRY_AFTER_FEEDBACK=true ./scripts/feature-to-code-unified.sh "feature"
```

**How it works:**
1. When a checkpoint is rejected with feedback
2. The `/reflect` command analyzes the feedback
3. If `AUTO_APPLY_FEEDBACK=true`, `/flow:apply-reflect` updates the command
4. If `AUTO_RETRY_AFTER_FEEDBACK=true`, the step is retried with the improved command
5. Otherwise, workflow stops for manual review

### Command Improvement Approval

When feedback is applied to improve commands, the system can require approval before modifying the flow commands:

**Features:**
- When `REQUIRE_COMMAND_APPROVAL=true` (default), command changes require explicit approval
- Shows a diff of proposed changes to `.claude/commands/flow/*.md` files
- Displays context about why changes are needed (original feedback)
- Lists specific improvements being made
- Special purple/blue theme in UI to distinguish from regular approvals
- "🔧 COMMAND UPDATE" badge for easy identification

**Enable Command Approval (default):**
```bash
AUTO_APPLY_FEEDBACK=true REQUIRE_COMMAND_APPROVAL=true ./scripts/feature-to-code-unified.sh "feature"
```

**Skip Command Approval (trust automatic improvements):**
```bash
AUTO_APPLY_FEEDBACK=true REQUIRE_COMMAND_APPROVAL=false ./scripts/feature-to-code-unified.sh "feature"
```

**Workflow with Command Approval:**
1. Checkpoint gets rejected with feedback
2. System runs `/reflect` to generate improvement suggestions
3. **NEW**: System generates proposed command changes (dry-run)
4. **NEW**: Creates approval request showing command diff
5. **NEW**: You review the exact changes that will be made
6. If approved: Command file is updated with improvements
7. Optionally: System retries the step with improved command

This gives you full visibility and control over how your flow commands are modified based on feedback.

### File Change Tracking

The approval system now shows which files will be created or modified:

**Features:**
- Shows list of changed files with status (created/modified/deleted)
- Displays hierarchical file tree structure
- Includes git diff preview for code changes
- Visible in both web UI and mobile app

**Disable if not needed:**
```bash
SHOW_FILE_CHANGES=false ./scripts/feature-to-code-unified.sh "feature"
```

**Implementation:**
- Uses git to track changes in workflow directory
- Commits after each checkpoint for accurate tracking
- File changes included in approval JSON
- UI components display file tree with status badges

## Observability

### Full Stack (Langfuse + Approval Server)

The observability stack includes both Langfuse telemetry and the workflow approval server:

1. Start stack: `cd observability && docker-compose up -d`
2. Run workflow normally
3. View traces at http://localhost:3000 (Langfuse)
4. **Manage approvals at http://localhost:8080 (Web Dashboard)**

The approval server runs automatically as part of the docker-compose stack and includes a full web UI for managing workflow approvals. Just open http://localhost:8080 in your browser!

### Langfuse Integration

When telemetry is enabled (default):

1. Tracks each workflow step (PRD, Design, Tasks)
2. Records approval checkpoints with timing
3. Logs model usage and costs
4. Captures custom metadata

### What Gets Tracked

- Each workflow step (PRD, Design, Tasks)
- Approval checkpoints with duration
- Timing and performance metrics
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
├── feature-to-code-unified.sh      # Main CLI entry point (delegates to Python or runs bash)
├── README.md                       # This file
├── PYTHON_INSTALL_GUIDE.md         # Python setup guide
├── WORKFLOW_APPROVALS.md           # Approval system reference
│
├── workflow/                       # Python workflow implementation (NEW)
│   ├── cli.py                      # Command-line interface
│   ├── orchestrator.py             # Main workflow coordination
│   ├── types.py                    # Type definitions
│   ├── services/                   # Reusable services
│   │   ├── claude_cli.py           # Claude subprocess wrapper (with stream-json)
│   │   ├── approval.py             # Approval flows (file/auto/interactive)
│   │   ├── telemetry.py            # Langfuse telemetry integration
│   │   └── artifact_extraction.py  # Artifact extraction service
│   ├── steps/                      # Workflow step executors
│   │   ├── prd.py                  # PRD generation
│   │   ├── design.py               # Technical design generation
│   │   ├── tasks.py                # Task list generation
│   │   ├── execute.py              # Task execution
│   │   └── summary.py              # Summary generation
│   └── utils/                      # Utilities
│       └── file_ops.py             # Async file operations
│
├── utils/                          # Standalone utilities
│   ├── extract-artifacts.py        # Extract docs from JSON
│   ├── claude-with-telemetry.py    # Claude CLI wrapper with telemetry
│   ├── check-approvals.py          # Diagnostic tool for approval files
│   └── track-workflow-step.py      # Manual workflow step tracking
│
├── langfuse/                       # Langfuse-specific libraries
│   ├── judge_prompts.py            # LLM judge prompts
│   ├── langfuse_evaluators.py      # Evaluation functions
│   └── setup_langfuse_score_configs.py  # Scoring configuration
│
├── setup/                          # Setup & diagnostic scripts
│   ├── install-telemetry-deps.sh   # Install Langfuse SDK dependencies
│   ├── verify-telemetry-setup.sh   # Check telemetry configuration
│   ├── setup-telemetry-env.sh      # Configure environment variables
│   └── test-telemetry.sh           # Test telemetry connectivity
│
├── libs/                           # Shared libraries
│   └── workflow_telemetry.py       # Telemetry library (used by bash)
│
├── deprecated/                     # Archived scripts (see deprecated/README.md)
│   ├── feature-to-code.sh
│   ├── feature-to-code-traced.sh
│   ├── send-workflow-telemetry.sh
│   └── workflow-approval-ui.html
│
└── docs/                           # Archived documentation (see docs/README.md)
    ├── FEATURE_TO_CODE_MIGRATION.md
    ├── APPROVAL_SYSTEM_FIXES.md
    └── PERFORMANCE_IMPROVEMENTS.md

(Root level)
├── workflow-approval-server.py     # Approval UI server (runs in docker-compose)
└── Dockerfile.approval-server      # Docker image for approval server
```

## Best Practices

1. **Keep JSON files** - They contain valuable metadata
2. **Use telemetry** - Track workflow performance and costs
3. **Review extracted docs** - JSON is for machines, extracted is for humans
4. **Organize in docs/specs** - Default behavior copies there
5. **Use execution IDs** - Link all artifacts and traces together
