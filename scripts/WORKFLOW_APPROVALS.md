# Workflow Approval System Documentation

## Overview

The `feature-to-code.sh` workflow now includes a flexible file-based approval system that allows for:

- Non-blocking workflow execution
- Real-time monitoring and approval via multiple interfaces
- Integration with external systems via webhooks
- Persistent approval state tracking

## Components

### 1. Main Workflow Script: `feature-to-code.sh`

Converts feature descriptions or specifications into executable code through a multi-step workflow.

**Usage:**

```bash
# With inline feature description
./scripts/feature-to-code.sh "Add user authentication with OAuth"

# With feature specification file
./scripts/feature-to-code.sh /path/to/feature-spec.md
```

### 2. Approval Modes

The workflow supports three approval modes, controlled by the `APPROVAL_MODE` environment variable:

#### File Mode (Default)

```bash
APPROVAL_MODE=file ./scripts/feature-to-code.sh "feature"
```

- Creates JSON approval request files
- Waits for response files to be created
- Supports timeout configuration
- Perfect for automation and external integrations

#### Interactive Mode

```bash
APPROVAL_MODE=interactive ./scripts/feature-to-code.sh "feature"
```

- Traditional terminal-based approval prompts
- Good for manual, attended workflows

#### Auto Mode

```bash
APPROVAL_MODE=auto ./scripts/feature-to-code.sh "feature"
```

- Automatically approves all checkpoints
- Useful for testing and trusted workflows

### 3. Configuration Options

```bash
# Set approval timeout (seconds, default: 0 = unlimited)
# Set to a positive number if you want a timeout
APPROVAL_TIMEOUT=600 ./scripts/feature-to-code.sh "feature"

# Configure webhook for notifications
WEBHOOK_URL="https://your-webhook.com/endpoint" ./scripts/feature-to-code.sh "feature"

# Combine options (with timeout if needed)
APPROVAL_MODE=file APPROVAL_TIMEOUT=900 WEBHOOK_URL="https://..." ./scripts/feature-to-code.sh "feature"
```

## Approval Interfaces

### 1. Command Line Monitor: `workflow-monitor.sh`

Monitor and manage approvals from the terminal.

```bash
# List all workflows
./scripts/workflow-monitor.sh

# Monitor specific workflow
./scripts/workflow-monitor.sh 20241020_143022

# Watch for pending approvals (real-time)
./scripts/workflow-monitor.sh watch

# Approve a pending request
./scripts/workflow-monitor.sh approve /path/to/.approval_file.json

# Reject with reason
./scripts/workflow-monitor.sh reject /path/to/.approval_file.json "Not ready yet"
```

### 2. REST API Server: `workflow-approval-server.py`

Provides HTTP API for workflow management.

```bash
# Start the API server (default port 8080)
python3 ./scripts/workflow-approval-server.py

# Start on custom port
python3 ./scripts/workflow-approval-server.py 3000
```

**API Endpoints:**

- `GET /workflows` - List all workflows
- `GET /workflows/{id}` - Get workflow details
- `GET /workflows/{id}/approvals` - Get workflow approvals
- `GET /approvals/pending` - Get all pending approvals
- `POST /approvals/{file}/approve` - Approve a request
- `POST /approvals/{file}/reject` - Reject a request
- `GET /events` - Server-sent events for real-time updates
- `GET /health` - Health check

### 3. Web UI: `workflow-approval-ui.html`

Real-time web dashboard for approval management.

```bash
# Open in browser (after starting API server)
open ./scripts/workflow-approval-ui.html
# or
xdg-open ./scripts/workflow-approval-ui.html  # Linux
```

Features:

- Real-time pending approval notifications
- Workflow status overview
- Preview of generated documents
- One-click approve/reject actions
- Auto-refresh and SSE updates

## File Structure

When a workflow runs, it creates the following structure:

```
workflow-outputs/
└── 20241020_143022/                    # Execution ID
    ├── workflow-status.json             # Overall workflow status
    ├── .approval_PRD.json              # Approval request for PRD
    ├── .approval_PRD.json.response     # Approval response (created by approver)
    ├── prd_20241020.md                 # Generated PRD
    ├── tdd_20241020.md                 # Generated Technical Design
    ├── tasks_20241020.md               # Generated Task List
    └── workflow-summary.md             # Final summary
```

## Approval File Formats

### Approval Request (`.approval_*.json`)

```json
{
  "execution_id": "20241020_143022",
  "checkpoint": "PRD",
  "file": "/path/to/prd_20241020.md",
  "timestamp": "2024-10-20T14:30:22",
  "status": "pending",
  "timeout_seconds": 0, // 0 = unlimited, set to positive number for timeout
  "preview": "First 20 lines of the file..."
}
```

### Approval Response (`.approval_*.json.response`)

```json
{
  "status": "approved", // or "rejected" or "edit"
  "reason": "Optional reason for rejection",
  "file": "/path/to/edited/file.md", // For edit responses
  "timestamp": "2024-10-20T14:35:00"
}
```

## Integration Examples

### 1. Programmatic Approval (Python)

```python
import json
import time

# Watch for approvals
approval_file = "/path/to/.approval_PRD.json"
while True:
    if os.path.exists(approval_file):
        with open(approval_file) as f:
            data = json.load(f)

        if data["status"] == "pending":
            # Review and approve
            response = {"status": "approved"}
            with open(f"{approval_file}.response", "w") as f:
                json.dump(response, f)
            break

    time.sleep(5)
```

### 2. Webhook Integration

```bash
# Configure webhook
export WEBHOOK_URL="https://slack.webhook.url/..."

# Webhook will receive POST requests with:
{
  "event": "approval_requested",
  "execution_id": "20241020_143022",
  "data": {
    "checkpoint": "PRD",
    "file": "/path/to/.approval_PRD.json"
  }
}
```

### 3. CI/CD Integration

```yaml
# GitHub Actions example
- name: Generate PRD
  run: |
    # Optional: Set APPROVAL_TIMEOUT if you need a time limit
    APPROVAL_MODE=file APPROVAL_TIMEOUT=1800 \
    ./scripts/feature-to-code.sh "${{ github.event.inputs.feature }}"

- name: Auto-approve in dev
  if: github.ref == 'refs/heads/dev'
  run: |
    APPROVAL_MODE=auto \
    ./scripts/feature-to-code.sh "${{ github.event.inputs.feature }}"
```

## Monitoring with Observability Stack

The workflow integrates with OpenTelemetry for tracing:

1. Traces are sent to the configured OTEL collector
2. View in Langfuse: http://localhost:3000
3. View in Grafana: http://localhost:3001
4. Search by execution ID for complete workflow traces

## Best Practices

1. **Use file mode for automation** - It's non-blocking and allows external integration
2. **Set timeouts if needed** - Default is unlimited; set APPROVAL_TIMEOUT for time-limited workflows
3. **Monitor with the web UI** - Best for real-time human oversight
4. **Use webhooks for notifications** - Integrate with Slack, Teams, etc.
5. **Preserve approval history** - Approval files serve as audit trail
6. **Test with auto mode first** - Validate workflow before requiring approvals

## Troubleshooting

### Workflow stuck at approval

```bash
# Check status
./scripts/workflow-monitor.sh <execution_id>

# Force approve if needed
echo '{"status":"approved"}' > /path/to/.approval_file.json.response
```

### API server connection issues

```bash
# Check if server is running
curl http://localhost:8080/health

# Check for port conflicts
lsof -i :8080
```

### View all pending approvals

```bash
find workflow-outputs -name ".approval_*.json" -exec jq -r 'select(.status=="pending") | .file_path' {} \;
```

## Security Considerations

1. **File permissions** - Ensure approval files are only writable by authorized users
2. **Webhook URLs** - Use HTTPS and authentication tokens
3. **API server** - Run behind reverse proxy with authentication in production
4. **Timeout values** - Default is unlimited; set a timeout if needed to prevent indefinite waiting

## Future Enhancements

Potential improvements to the approval system:

- [ ] Database backend for approval history
- [ ] Role-based access control
- [ ] Email notifications
- [ ] Approval delegation and escalation
- [ ] Mobile app for approvals
- [ ] Integration with enterprise approval systems
