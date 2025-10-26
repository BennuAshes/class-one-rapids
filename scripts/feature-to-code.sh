#!/bin/bash
#
# Feature to Code Workflow
# Automated workflow from feature description/spec to executable code
# Uses Claude Code's native OpenTelemetry support to track the entire workflow
#
# Usage:
#   ./feature-to-code.sh "feature description"
#   ./feature-to-code.sh /path/to/feature/spec.md
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INPUT="$1"
EXECUTION_ID=$(date +%Y%m%d_%H%M%S)
WORK_DIR="$(pwd)/workflow-outputs/$EXECUTION_ID"
TIMESTAMP=$(date -Iseconds)

# Validate input
if [ -z "$INPUT" ]; then
  echo -e "${RED}Error: Feature description or file path is required${NC}"
  echo "Usage: $0 \"feature description\""
  echo "       $0 /path/to/feature/spec.md"
  exit 1
fi

# Check if input is a file or a feature description
if [ -f "$INPUT" ]; then
  echo -e "${BLUE}Reading feature specification from file: $INPUT${NC}"
  FEATURE_DESC=$(cat "$INPUT")
  FEATURE_SOURCE="file: $(basename "$INPUT")"
else
  FEATURE_DESC="$INPUT"
  FEATURE_SOURCE="command line"
fi

# Create working directory
mkdir -p "$WORK_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Feature to Code Workflow${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Execution ID: ${GREEN}$EXECUTION_ID${NC}"
echo -e "Feature Source: ${GREEN}$FEATURE_SOURCE${NC}"
echo -e "Working Directory: ${GREEN}$WORK_DIR${NC}"
echo -e "Timestamp: ${GREEN}$TIMESTAMP${NC}"
echo -e "Approval Mode: ${GREEN}$APPROVAL_MODE${NC}"
if [ "$APPROVAL_MODE" = "file" ]; then
  if [ "$APPROVAL_TIMEOUT" -eq 0 ]; then
    echo -e "Approval Timeout: ${GREEN}Unlimited${NC}"
  else
    echo -e "Approval Timeout: ${GREEN}${APPROVAL_TIMEOUT}s${NC}"
  fi
fi
if [ -n "$WEBHOOK_URL" ]; then
  echo -e "Webhook URL: ${GREEN}$WEBHOOK_URL${NC}"
fi
echo -e "${BLUE}========================================${NC}\n"

# Create initial workflow status file
cat > "$WORK_DIR/workflow-status.json" << EOF
{
  "execution_id": "$EXECUTION_ID",
  "feature_source": "$FEATURE_SOURCE",
  "approval_mode": "$APPROVAL_MODE",
  "status": "initializing",
  "started_at": "$(date -Iseconds)",
  "working_directory": "$WORK_DIR",
  "steps": [
    {"name": "Generate PRD", "status": "pending"},
    {"name": "Generate Technical Design", "status": "pending"},
    {"name": "Generate Task List", "status": "pending"},
    {"name": "Execute Tasks", "status": "pending"},
    {"name": "Generate Summary", "status": "pending"}
  ]
}
EOF

# Configure OpenTelemetry for Claude Code
echo -e "${YELLOW}Configuring OpenTelemetry...${NC}"
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"

# Add execution metadata as resource attributes
export OTEL_RESOURCE_ATTRIBUTES="service.name=feature-to-code,execution.id=$EXECUTION_ID,feature.source=$FEATURE_SOURCE"

# Configure Langfuse SDK (for direct tracing via SDK)
export LANGFUSE_PUBLIC_KEY="pk-lf-e7b25b9c-356f-4268-96cf-07318a4a5ee4"
export LANGFUSE_SECRET_KEY="sk-lf-980bcde7-ff84-40b2-b127-1e68a0b6c406"
export LANGFUSE_HOST="http://localhost:3000"

echo -e "${GREEN}✓ OpenTelemetry configured${NC}"
echo -e "  Endpoint: http://localhost:4318"
echo -e "  Langfuse Host: http://localhost:3000"
echo -e "  Execution ID: $EXECUTION_ID\n"

# Function to log workflow steps
log_step() {
  local step_num=$1
  local step_name=$2
  local status=$3

  if [ "$status" = "start" ]; then
    echo -e "${BLUE}[$step_num/5] Starting: $step_name${NC}"
  elif [ "$status" = "complete" ]; then
    echo -e "${GREEN}[$step_num/5] ✓ Completed: $step_name${NC}\n"
  elif [ "$status" = "error" ]; then
    echo -e "${RED}[$step_num/5] ✗ Failed: $step_name${NC}\n"
  fi
}

# Configuration for approval system
APPROVAL_MODE="${APPROVAL_MODE:-file}"  # Can be "file", "interactive", or "auto"
APPROVAL_TIMEOUT="${APPROVAL_TIMEOUT:-0}"  # Default unlimited (0 = no timeout)
WEBHOOK_URL="${WEBHOOK_URL:-}"  # Optional webhook for notifications

# Function to send webhook notification (if configured)
send_webhook() {
  local event=$1
  local data=$2

  if [ -n "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"event\":\"$event\",\"execution_id\":\"$EXECUTION_ID\",\"data\":$data}" \
      2>/dev/null || true
  fi
}

# Function to create approval request
create_approval_request() {
  local checkpoint=$1
  local file=$2
  local approval_file="$WORK_DIR/.approval_${checkpoint// /_}.json"

  # Get preview - escape it properly for JSON
  local preview_text=$(head -n 20 "$file" 2>/dev/null || echo "")
  
  # Escape the preview text for JSON (handles quotes, newlines, backslashes)
  # This works without jq by using python which is more commonly available
  local preview_json=$(python3 -c "import json; print(json.dumps('''$preview_text'''))" 2>/dev/null || echo '""')

  # Create approval request file with proper JSON
  cat > "$approval_file" << EOF
{
  "execution_id": "$EXECUTION_ID",
  "checkpoint": "$checkpoint",
  "file": "$file",
  "timestamp": "$(date -Iseconds)",
  "status": "pending",
  "timeout_seconds": $APPROVAL_TIMEOUT,
  "preview": $preview_json
}
EOF

  echo "$approval_file"
}

# Function to wait for file-based approval
wait_for_approval() {
  local approval_file=$1
  local checkpoint=$2
  local timeout=$APPROVAL_TIMEOUT
  local start_time=$(date +%s)

  echo -e "${YELLOW}Waiting for approval...${NC}"
  echo -e "  Approval file: ${GREEN}$approval_file${NC}"
  echo -e "  To approve: echo '{\"status\":\"approved\"}' > ${approval_file}.response"
  echo -e "  To reject:  echo '{\"status\":\"rejected\"}' > ${approval_file}.response"
  echo -e "  To edit:    echo '{\"status\":\"edit\",\"file\":\"path/to/edited.md\"}' > ${approval_file}.response"
  echo ""

  # Send webhook notification if configured
  send_webhook "approval_requested" "{\"checkpoint\":\"$checkpoint\",\"file\":\"$approval_file\"}"

  # Wait for approval response file
  while true; do
    local response_file="${approval_file}.response"

    if [ -f "$response_file" ]; then
      # Try to read status using python (fallback to grep if python fails)
      local status=$(python3 -c "import json; print(json.load(open('$response_file')).get('status', 'invalid'))" 2>/dev/null || grep -o '"status"[[:space:]]*:[[:space:]]*"[^"]*"' "$response_file" | cut -d'"' -f4 || echo "invalid")

      case $status in
        approved)
          echo -e "${GREEN}✓ Approved - continuing workflow${NC}\n"
          # Update approval file status (optional, not critical for workflow)
          python3 -c "import json; d=json.load(open('$approval_file')); d['status']='approved'; json.dump(d, open('$approval_file', 'w'))" 2>/dev/null || true
          send_webhook "approval_granted" "{\"checkpoint\":\"$checkpoint\"}"
          return 0
          ;;
        rejected)
          echo -e "${RED}✗ Rejected - workflow stopped${NC}"
          local reason=$(python3 -c "import json; print(json.load(open('$response_file')).get('reason', 'No reason provided'))" 2>/dev/null || echo "No reason provided")
          echo -e "${RED}Reason: $reason${NC}"
          python3 -c "import json; d=json.load(open('$approval_file')); d['status']='rejected'; json.dump(d, open('$approval_file', 'w'))" 2>/dev/null || true
          send_webhook "approval_rejected" "{\"checkpoint\":\"$checkpoint\",\"reason\":\"$reason\"}"
          exit 1
          ;;
        edit)
          local edited_file=$(python3 -c "import json; print(json.load(open('$response_file')).get('file', ''))" 2>/dev/null || echo "")
          if [ -f "$edited_file" ]; then
            echo -e "${YELLOW}Applying edits from: $edited_file${NC}"
            cp "$edited_file" "$2"
            echo -e "${GREEN}✓ Edits applied - continuing workflow${NC}\n"
            python3 -c "import json; d=json.load(open('$approval_file')); d['status']='approved'; d['edited']=True; json.dump(d, open('$approval_file', 'w'))" 2>/dev/null || true
            return 0
          else
            echo -e "${RED}Error: Edited file not found${NC}"
          fi
          ;;
      esac

      # Remove response file after processing
      rm -f "$response_file"
    fi

    # Check timeout (if configured)
    local current_time=$(date +%s)
    local elapsed=$((current_time - start_time))

    if [ $timeout -gt 0 ] && [ $elapsed -ge $timeout ]; then
      echo -e "${RED}✗ Approval timeout after ${timeout} seconds${NC}"
      python3 -c "import json; d=json.load(open('$approval_file')); d['status']='timeout'; json.dump(d, open('$approval_file', 'w'))" 2>/dev/null || true
      send_webhook "approval_timeout" "{\"checkpoint\":\"$checkpoint\"}"
      exit 1
    fi

    # Show progress every 10 seconds
    if [ $((elapsed % 10)) -eq 0 ]; then
      if [ $timeout -gt 0 ]; then
        echo -e "${YELLOW}Still waiting... (${elapsed}/${timeout}s)${NC}"
      else
        echo -e "${YELLOW}Still waiting... (${elapsed}s elapsed)${NC}"
      fi
    fi

    sleep 1
  done
}

# Function to request human approval
request_approval() {
  local checkpoint=$1
  local file=$2

  echo -e "${YELLOW}========================================${NC}"
  echo -e "${YELLOW}APPROVAL CHECKPOINT: $checkpoint${NC}"
  echo -e "${YELLOW}========================================${NC}"
  echo -e "Review the generated file: ${GREEN}$file${NC}"
  echo ""

  case $APPROVAL_MODE in
    auto)
      echo -e "${GREEN}✓ Auto-approved (APPROVAL_MODE=auto)${NC}\n"
      return 0
      ;;

    file)
      # Create approval request and wait for response
      local approval_file=$(create_approval_request "$checkpoint" "$file")

      # Read the started_at from existing workflow status
      local started_at=$(python3 -c "import json; print(json.load(open('$WORK_DIR/workflow-status.json')).get('started_at', '$(date -Iseconds)'))" 2>/dev/null || echo "$(date -Iseconds)")

      # Update workflow status (preserve started_at)
      cat > "$WORK_DIR/workflow-status.json" << EOF
{
  "execution_id": "$EXECUTION_ID",
  "current_step": "$checkpoint",
  "status": "awaiting_approval",
  "approval_file": "$approval_file",
  "started_at": "$started_at",
  "updated_at": "$(date -Iseconds)"
}
EOF

      wait_for_approval "$approval_file" "$checkpoint"

      # Update workflow status (preserve started_at)
      cat > "$WORK_DIR/workflow-status.json" << EOF
{
  "execution_id": "$EXECUTION_ID",
  "current_step": "$checkpoint",
  "status": "approved",
  "started_at": "$started_at",
  "updated_at": "$(date -Iseconds)"
}
EOF
      ;;

    interactive|*)
      # Original interactive approval
      echo "Preview:"
      echo -e "${BLUE}----------------------------------------${NC}"
      head -n 20 "$file"
      echo -e "${BLUE}----------------------------------------${NC}"
      echo ""

      read -p "Approve and continue? (y/n/e to edit): " approval

      case $approval in
        y|Y)
          echo -e "${GREEN}✓ Approved - continuing workflow${NC}\n"
          return 0
          ;;
        e|E)
          echo -e "${YELLOW}Opening file for editing...${NC}"
          ${EDITOR:-nano} "$file"
          echo -e "${GREEN}✓ Edits saved - continuing workflow${NC}\n"
          return 0
          ;;
        *)
          echo -e "${RED}✗ Rejected - workflow stopped${NC}"
          exit 1
          ;;
      esac
      ;;
  esac
}

# Step 1: Generate PRD
log_step 1 "Generate Product Requirements Document" "start"
PRD_FILE="$WORK_DIR/prd_$(date +%Y%m%d).md"

claude -p "Generate a comprehensive PRD following the template in .claude/commands/prd.md for the following feature specification:

$FEATURE_DESC" \
  --verbose --output-format stream-json > "$PRD_FILE"

if [ $? -eq 0 ]; then
  log_step 1 "Generate Product Requirements Document" "complete"
  echo -e "  Output: $PRD_FILE"
  echo -e "  Size: $(wc -c < "$PRD_FILE") bytes"
else
  log_step 1 "Generate Product Requirements Document" "error"
  exit 1
fi

# Approval checkpoint
request_approval "PRD" "$PRD_FILE"

# Step 2: Generate Technical Design
log_step 2 "Generate Technical Design Document" "start"
DESIGN_FILE="$WORK_DIR/tdd_$(date +%Y%m%d).md"

TEMP_PROMPT=$(mktemp)
cat > "$TEMP_PROMPT" <<EOF
Read the PRD below and generate a comprehensive Technical Design Document following the template in .claude/commands/design.md.

PRD:
$(cat "$PRD_FILE")
EOF

cat "$TEMP_PROMPT" | claude -p --verbose --output-format stream-json > "$DESIGN_FILE"
rm -f "$TEMP_PROMPT"

if [ $? -eq 0 ]; then
  log_step 2 "Generate Technical Design Document" "complete"
  echo -e "  Output: $DESIGN_FILE"
  echo -e "  Size: $(wc -c < "$DESIGN_FILE") bytes"
else
  log_step 2 "Generate Technical Design Document" "error"
  exit 1
fi

# Approval checkpoint
request_approval "Technical Design" "$DESIGN_FILE"

# Step 3: Generate Task List
log_step 3 "Generate Task List" "start"
TASKS_FILE="$WORK_DIR/tasks_$(date +%Y%m%d).md"

TEMP_PROMPT=$(mktemp)
cat > "$TEMP_PROMPT" <<EOF
Read the Technical Design Document below and generate an executable task list following the template in .claude/commands/tasks.md.

TDD:
$(cat "$DESIGN_FILE")
EOF

cat "$TEMP_PROMPT" | claude -p --verbose --output-format stream-json > "$TASKS_FILE"
rm -f "$TEMP_PROMPT"

if [ $? -eq 0 ]; then
  log_step 3 "Generate Task List" "complete"
  echo -e "  Output: $TASKS_FILE"
  echo -e "  Size: $(wc -c < "$TASKS_FILE") bytes"
else
  log_step 3 "Generate Task List" "error"
  exit 1
fi

# Approval checkpoint
request_approval "Task List" "$TASKS_FILE"

# Step 4: Execute Tasks (optional - user can run separately)
log_step 4 "Execute Tasks" "start"
echo -e "${YELLOW}Task execution is optional. You can:${NC}"
echo -e "  1. Review tasks manually: $TASKS_FILE"
echo -e "  2. Execute tasks: /execute-tasks $TASKS_FILE"
echo ""
read -p "Execute tasks now? (y/n): " execute_now

if [ "$execute_now" = "y" ] || [ "$execute_now" = "Y" ]; then
  echo -e "${BLUE}Executing tasks...${NC}"
  # This would call the execute-tasks command
  # For now, we'll skip actual execution to avoid unintended changes
  echo -e "${YELLOW}Note: Task execution integration pending${NC}"
  log_step 4 "Execute Tasks" "complete"
else
  echo -e "${YELLOW}Skipping task execution${NC}"
  log_step 4 "Execute Tasks" "complete"
fi

# Step 5: Workflow Summary
log_step 5 "Generate Workflow Summary" "start"
SUMMARY_FILE="$WORK_DIR/workflow-summary.md"

cat > "$SUMMARY_FILE" << EOF
# Workflow Execution Summary

**Execution ID**: $EXECUTION_ID
**Feature Source**: $FEATURE_SOURCE
**Timestamp**: $TIMESTAMP

## Generated Artifacts

1. **Product Requirements Document**: \`$(basename "$PRD_FILE")\`
2. **Technical Design Document**: \`$(basename "$DESIGN_FILE")\`
3. **Task List**: \`$(basename "$TASKS_FILE")\`

## Working Directory

All files are located in: \`$WORK_DIR\`

## Observability

View traces and metrics:
- **Langfuse**: http://localhost:3000
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090

Search for execution ID: \`$EXECUTION_ID\`

## Next Steps

1. Review all generated documents
2. Execute tasks: \`/execute-tasks $TASKS_FILE\`
3. Analyze workflow metrics in observability dashboards
4. Iterate based on feedback

---
*Generated by Feature to Code Workflow*
*Execution completed at: $(date -Iseconds)*
EOF

log_step 5 "Generate Workflow Summary" "complete"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Workflow Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Execution ID: ${BLUE}$EXECUTION_ID${NC}"
echo -e "Working Directory: ${BLUE}$WORK_DIR${NC}"
echo -e "Summary: ${BLUE}$SUMMARY_FILE${NC}"
echo ""
echo -e "${YELLOW}View observability data:${NC}"
echo -e "  Langfuse: ${BLUE}http://localhost:3000${NC}"
echo -e "  Grafana:  ${BLUE}http://localhost:3001${NC}"
echo -e "  Search for execution ID: ${GREEN}$EXECUTION_ID${NC}"
echo ""
echo -e "Generated files:"
ls -lh "$WORK_DIR"
echo ""
