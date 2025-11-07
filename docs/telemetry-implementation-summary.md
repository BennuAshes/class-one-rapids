# Workflow Telemetry Implementation Summary

## Changes Made

### 1. CLAUDE.md Documentation

Added comprehensive documentation about Langfuse OTLP limitations:

**Key Points:**
- Langfuse **ONLY** supports OTLP traces, NOT logs or metrics
- Claude Code sends telemetry as OTLP logs, which cannot be sent to Langfuse
- Solution: Use Langfuse Python SDK directly via `scripts/workflow_telemetry.py`

**Sources:**
- [Langfuse OTLP Documentation](https://langfuse.com/docs/opentelemetry/get-started)
- [GitHub Discussion #8275](https://github.com/orgs/langfuse/discussions/8275)

### 2. Workflow Telemetry Implementation

#### New Files Created:

**`scripts/track-workflow-step.py`**
- Simple CLI wrapper for workflow telemetry tracking
- Commands:
  - `start <execution_id> <step_name>` - Start tracking a step
  - `complete <execution_id> <step_name> [duration]` - Mark step complete
  - `error <execution_id> <step_name> <error_msg> [duration]` - Mark step failed
  - `approval <execution_id> <checkpoint> <status> <duration> [reason]` - Track approval

#### Modified Files:

**`scripts/feature-to-code-unified.sh`**

1. **Updated `send_telemetry()` function:**
   - Now calls `track-workflow-step.py` for all telemetry
   - Tracks start, complete, and error states
   - Properly handles duration tracking

2. **Updated `log_step()` function:**
   - Calls `send_telemetry()` for each step state change
   - Passes duration when available

3. **Updated `wait_for_approval()` function:**
   - Tracks approval start time
   - Calculates approval duration
   - Calls `track-workflow-step.py approval` with:
     - Execution ID
     - Checkpoint name
     - Status (approved/rejected)
     - Duration in seconds
     - Reason (if rejected)

#### How It Works:

1. Workflow script calls `send_telemetry()` at each step
2. `send_telemetry()` calls `track-workflow-step.py` with appropriate command
3. `track-workflow-step.py` imports `workflow_telemetry.py`
4. `workflow_telemetry.py` uses Langfuse SDK to create traces/spans
5. Data appears in Langfuse UI at http://localhost:3000

### 3. Feedback Scoring Enhancement

#### Modified Files:

**`workflow-approval-server.py`**

1. **Enhanced `track_approval_in_langfuse()` function:**
   - Added `feedback` parameter
   - Creates two scores per rejection:
     - `approval_{checkpoint}`: Binary score (0.0 for rejected, 1.0 for approved)
     - `feedback_rating_{checkpoint}`: Normalized rating (0-1 scale from 1-5 stars)
   - Includes feedback metadata in spans

2. **Updated `reject_request()` call:**
   - Now passes `feedback` dict to tracking function
   - Enables automatic rating scoring

#### Feedback Rating Normalization:

User ratings (1-5 stars) are normalized to 0-1 scale:
- 1 star = 0.0
- 2 stars = 0.25
- 3 stars = 0.5
- 4 stars = 0.75
- 5 stars = 1.0

Formula: `(rating - 1) / 4`

#### What Gets Tracked:

**For All Approvals:**
- Checkpoint name
- Status (approved/rejected)
- Duration in seconds
- Reason (if rejected)
- Timestamp

**For Rejections with Feedback:**
- User rating (1-5 stars) → Creates `feedback_rating_{checkpoint}` score
- Specific issues
- Missing elements
- Suggested improvements

## Usage

### Running a Workflow with Telemetry:

```bash
# Ensure Langfuse env vars are set
export LANGFUSE_PUBLIC_KEY="pk-lf-..."
export LANGFUSE_SECRET_KEY="sk-lf-..."
export LANGFUSE_HOST="http://localhost:3000"

# Run workflow with telemetry enabled (default)
./scripts/feature-to-code-unified.sh "your feature description"

# Disable telemetry
DISABLE_TELEMETRY=1 ./scripts/feature-to-code-unified.sh "your feature"
```

### Viewing Telemetry Data:

1. Open Langfuse: http://localhost:3000
2. Navigate to your project
3. View traces filtered by session ID (execution_id)
4. See:
   - Workflow steps (PRD, Design, Tasks)
   - Approval checkpoints with durations
   - Feedback ratings as scores

### Scoring in Langfuse:

Each approval creates scores:
- **Approval Score**: Binary (0 or 1)
- **Feedback Rating**: Normalized (0-1) - only for rejections with ratings

Access scores in Langfuse:
- Scores tab in trace view
- Filter by score name
- Compare ratings across checkpoints

## Testing

To test the telemetry integration:

```bash
# 1. Ensure Langfuse is running
cd observability
docker-compose ps  # Check if services are up

# 2. Run a simple workflow
cd ..
./scripts/feature-to-code-unified.sh "Add a hello world function"

# 3. Approve or reject with feedback
# For file-based approval:
echo '{"status":"rejected","reason":"Needs improvement","feedback":{"rating":3,"specific_issues":["Too simple"]}}' > workflow-outputs/YYYYMMDD_HHMMSS/.approval_PRD.json.response

# 4. Check Langfuse
# Open http://localhost:3000
# Find your execution ID in traces
# Verify spans and scores appear
```

## Troubleshooting

**Telemetry not appearing in Langfuse:**
1. Check Langfuse SDK is installed: `pip install langfuse`
2. Verify environment variables are set
3. Check `track-workflow-step.py` is executable: `chmod +x scripts/track-workflow-step.py`
4. Look for errors in workflow output
5. Check Langfuse is running: `curl http://localhost:3000/api/public/health`

**Approval server not tracking feedback scores:**
1. Rebuild approval server: `docker-compose up -d --build approval-server`
2. Check server logs: `docker-compose logs approval-server`
3. Verify Langfuse env vars are set for docker-compose
4. Ensure feedback includes `rating` field

**Duration tracking issues:**
1. Ensure bash supports date arithmetic (`date +%s`)
2. Check Python is available (`python3 --version`)
3. Verify `$PYTHON_CMD` is set in workflow script

## Next Steps

Potential enhancements:
1. Add cost tracking per step
2. Track file change metrics
3. Add quality scores from automated checks
4. Create Langfuse dashboard for workflow analytics
5. Set up alerts for high rejection rates
6. Track token usage per step

## Architecture

```
Workflow Script (Bash)
    │
    ├──> send_telemetry()
    │       │
    │       └──> track-workflow-step.py
    │               │
    │               └──> workflow_telemetry.py
    │                       │
    │                       └──> Langfuse SDK
    │                               │
    │                               └──> Langfuse API
    │
    └──> Approval Server (Python)
            │
            └──> track_approval_in_langfuse()
                    │
                    └──> Langfuse SDK
                            │
                            └──> Langfuse API
```

Both paths use the Langfuse Python SDK to bypass OTLP limitations and send data directly to Langfuse's native API.
