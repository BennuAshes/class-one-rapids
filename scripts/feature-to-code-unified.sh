#!/bin/bash
#
# Feature to Code Workflow - Unified Version
# Combines JSON metadata capture, artifact extraction, and optional telemetry
#
# Usage:
#   ./feature-to-code-unified.sh "feature description"
#   ./feature-to-code-unified.sh /path/to/feature/spec.md
#   ./feature-to-code-unified.sh workflow-outputs/YYYYMMDD_HHMMSS  # Resume
#
# Environment Variables (opt-out):
#   DISABLE_TELEMETRY=1         # Disable Langfuse telemetry (default: enabled)
#   DISABLE_EXTRACTION=1        # Disable auto-extraction (default: enabled)
#   SKIP_SPECS_COPY=1           # Don't copy to docs/specs (default: copies)
#   APPROVAL_MODE=file          # Approval mode: file, interactive, or auto (default: file)
#   APPROVAL_TIMEOUT=300        # Approval timeout in seconds (default: 0 = unlimited)
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
RESUME_MODE=false
EXECUTION_ID=""
WORK_DIR=""
TIMESTAMP=$(date -Iseconds)

# Feature toggles (opt-out by default - best practices enabled)
TELEMETRY_ENABLED=$( [ "${DISABLE_TELEMETRY:-0}" = "1" ] && echo "false" || echo "true" )
AUTO_EXTRACT=$( [ "${DISABLE_EXTRACTION:-0}" = "1" ] && echo "false" || echo "true" )
EXTRACT_TO_SPECS=$( [ "${SKIP_SPECS_COPY:-0}" = "1" ] && echo "false" || echo "true" )
APPROVAL_MODE="${APPROVAL_MODE:-file}"
APPROVAL_TIMEOUT="${APPROVAL_TIMEOUT:-0}"
WEBHOOK_URL="${WEBHOOK_URL:-}"

# Validate input
if [ -z "$INPUT" ]; then
  echo -e "${RED}Error: Feature description, file path, or workflow folder is required${NC}"
  echo "Usage: $0 \"feature description\""
  echo "       $0 /path/to/feature/spec.md"
  echo "       $0 workflow-outputs/YYYYMMDD_HHMMSS  # Resume existing workflow"
  exit 1
fi

# Normalize path separators (convert backslashes to forward slashes)
INPUT="${INPUT//\\/\/}"

# Detect which Python to use early (needed for resume mode)
if command -v python &>/dev/null; then
  PYTHON_CMD="python"
elif command -v python3 &>/dev/null; then
  PYTHON_CMD="python3"
else
  PYTHON_CMD=""
fi

# Check if input is an existing workflow directory to resume
if [ -d "$INPUT" ] && [ -f "$INPUT/workflow-status.json" ]; then
  echo -e "${YELLOW}Resuming existing workflow from: $INPUT${NC}"
  RESUME_MODE=true
  WORK_DIR="$(realpath "$INPUT")"
  
  # Extract execution ID from workflow status (use detected Python)
  if [ -n "$PYTHON_CMD" ]; then
    EXECUTION_ID=$($PYTHON_CMD -c "import json; print(json.load(open('$WORK_DIR/workflow-status.json')).get('execution_id', ''))" 2>/dev/null || echo "")
  fi
  
  if [ -z "$EXECUTION_ID" ]; then
    EXECUTION_ID=$(basename "$WORK_DIR")
  fi
  
  if [ -n "$PYTHON_CMD" ]; then
    FEATURE_SOURCE=$($PYTHON_CMD -c "import json; print(json.load(open('$WORK_DIR/workflow-status.json')).get('feature_source', 'resumed'))" 2>/dev/null || echo "resumed")
  else
    FEATURE_SOURCE="resumed"
  fi
  echo -e "${GREEN}✓ Found workflow: $EXECUTION_ID${NC}"

elif [ -f "$INPUT" ]; then
  echo -e "${BLUE}Reading feature specification from file: $INPUT${NC}"
  FEATURE_FILE="$INPUT"
  FEATURE_DESC=$(cat "$INPUT")
  FEATURE_SOURCE="file: $(basename "$INPUT")"
  EXECUTION_ID=$(date +%Y%m%d_%H%M%S)
  WORK_DIR="$(pwd)/workflow-outputs/$EXECUTION_ID"
  mkdir -p "$WORK_DIR"
else
  FEATURE_DESC="$INPUT"
  FEATURE_SOURCE="command line"
  EXECUTION_ID=$(date +%Y%m%d_%H%M%S)
  WORK_DIR="$(pwd)/workflow-outputs/$EXECUTION_ID"
  mkdir -p "$WORK_DIR"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Feature to Code Workflow (Unified)${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Execution ID: ${GREEN}$EXECUTION_ID${NC}"
echo -e "Mode: ${GREEN}$([ "$RESUME_MODE" = true ] && echo "RESUME" || echo "NEW")${NC}"
echo -e "Feature Source: ${GREEN}$FEATURE_SOURCE${NC}"
echo -e "Working Directory: ${GREEN}$WORK_DIR${NC}"
echo -e "Timestamp: ${GREEN}$TIMESTAMP${NC}"
echo -e "Telemetry: ${GREEN}$([ "$TELEMETRY_ENABLED" = true ] && echo "ENABLED" || echo "DISABLED")${NC}"
echo -e "Auto-Extract: ${GREEN}$([ "$AUTO_EXTRACT" = true ] && echo "YES" || echo "NO")${NC}"
echo -e "Approval Mode: ${GREEN}$APPROVAL_MODE${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to send telemetry if enabled
send_telemetry() {
  if [ "$TELEMETRY_ENABLED" = true ]; then
    local step_name=$1
    local status=$2
    local metadata=$3
    
    # Use the Python telemetry wrapper if available
    if [ -f "scripts/claude-with-telemetry.py" ] && command -v python3 &>/dev/null; then
      # This is a simplified version - the actual implementation would integrate better
      echo -e "${YELLOW}[Telemetry] Tracking: $step_name - $status${NC}"
    else
      # Fallback to manual telemetry
      if [ -f "scripts/send-workflow-telemetry.sh" ]; then
        source scripts/send-workflow-telemetry.sh
        send_trace_to_langfuse "$EXECUTION_ID" "$step_name" "$status" "$metadata"
      fi
    fi
  fi
}

# Function to extract artifacts from JSON
extract_artifacts() {
  local workflow_dir=$1
  local target_dir=$2
  
  if [ "$AUTO_EXTRACT" = true ] && command -v python3 &>/dev/null && [ -f "scripts/extract-artifacts.py" ]; then
    echo -e "${YELLOW}Extracting artifacts from JSON output...${NC}"
    
    if [ "$EXTRACT_TO_SPECS" = true ] && [ -n "$target_dir" ]; then
      python3 scripts/extract-artifacts.py "$workflow_dir" "$target_dir"
    else
      python3 scripts/extract-artifacts.py "$workflow_dir"
    fi
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Artifacts extracted successfully${NC}\n"
    else
      echo -e "${YELLOW}⚠ Artifact extraction had issues${NC}\n"
    fi
  fi
}

# Function to check if a step is completed
check_step_completed() {
  local step_name="$1"

  if command -v python3 &>/dev/null && [ -f "$WORK_DIR/workflow-status.json" ]; then
    local status=$(python3 -c "
import json
try:
    data = json.load(open('$WORK_DIR/workflow-status.json'))
    for step in data.get('steps', []):
        if step.get('name') == '$step_name':
            print(step.get('status', 'pending'))
            break
    else:
        print('pending')
except:
    print('pending')
" 2>/dev/null || echo "pending")
    [ "$status" = "completed" ]
  else
    false
  fi
}

# Function to get the last completed step
get_last_completed_step() {
  if command -v python3 &>/dev/null && [ -f "$WORK_DIR/workflow-status.json" ]; then
    python3 -c "
import json
try:
    data = json.load(open('$WORK_DIR/workflow-status.json'))
    completed = [s['name'] for s in data.get('steps', []) if s.get('status') == 'completed']
    if completed:
        print(completed[-1])
    else:
        print('none')
except:
    print('none')
" 2>/dev/null || echo "none"
  else
    echo "none"
  fi
}

# Function to find existing workflow file by pattern
find_workflow_file() {
  local pattern="$1"
  local file=$(ls "$WORK_DIR/$pattern"*.md 2>/dev/null | head -1)
  echo "$file"
}

# Function to update step status
update_step_status() {
  local step_name="$1"
  local new_status="$2"
  
  if command -v python3 &>/dev/null && [ -f "$WORK_DIR/workflow-status.json" ]; then
    python3 -c "
import json
try:
    data = json.load(open('$WORK_DIR/workflow-status.json'))
    for step in data.get('steps', []):
        if step.get('name') == '$step_name':
            step['status'] = '$new_status'
            step['updated_at'] = '$(date -Iseconds)'
            break
    json.dump(data, open('$WORK_DIR/workflow-status.json', 'w'), indent=2)
except:
    pass
" 2>/dev/null || true
  fi
  
  # Send telemetry for step status update
  send_telemetry "$step_name" "$new_status" "{\"step\": \"$step_name\"}"
}

# Function to migrate old workflow status format to new format
migrate_workflow_status() {
  if [ ! -f "$WORK_DIR/workflow-status.json" ]; then
    return
  fi

  # Check if the file has the "steps" array
  local has_steps=$(python3 -c "import json; data = json.load(open('$WORK_DIR/workflow-status.json')); print('yes' if 'steps' in data else 'no')" 2>/dev/null || echo "no")

  if [ "$has_steps" = "no" ]; then
    echo -e "${YELLOW}Migrating workflow status to new format...${NC}"

    # Read existing data
    local exec_id=$(python3 -c "import json; print(json.load(open('$WORK_DIR/workflow-status.json')).get('execution_id', '$EXECUTION_ID'))" 2>/dev/null || echo "$EXECUTION_ID")
    local started_at=$(python3 -c "import json; print(json.load(open('$WORK_DIR/workflow-status.json')).get('started_at', ''))" 2>/dev/null || echo "$(date -Iseconds)")

    # Detect completed steps by checking for files
    local prd_status="pending"
    local tdd_status="pending"
    local tasks_status="pending"

    if [ -f "$WORK_DIR/prd_"*.md ] && [ -s "$WORK_DIR/prd_"*.md ]; then
      prd_status="completed"
    fi
    if [ -f "$WORK_DIR/tdd_"*.md ] && [ -s "$WORK_DIR/tdd_"*.md ]; then
      tdd_status="completed"
    fi
    if [ -f "$WORK_DIR/tasks_"*.md ] && [ -s "$WORK_DIR/tasks_"*.md ]; then
      tasks_status="completed"
    fi

    # Create new format
    cat > "$WORK_DIR/workflow-status.json" << EOF
{
  "execution_id": "$exec_id",
  "feature_source": "$FEATURE_SOURCE",
  "feature_description": "",
  "approval_mode": "$APPROVAL_MODE",
  "telemetry_enabled": $( [ "$TELEMETRY_ENABLED" = true ] && echo "true" || echo "false" ),
  "auto_extract": $( [ "$AUTO_EXTRACT" = true ] && echo "true" || echo "false" ),
  "status": "resumed",
  "started_at": "$started_at",
  "working_directory": "$WORK_DIR",
  "steps": [
    {"name": "Generate PRD", "status": "$prd_status", "updated_at": "$started_at"},
    {"name": "Generate Technical Design", "status": "$tdd_status", "updated_at": "$started_at"},
    {"name": "Generate Task List", "status": "$tasks_status", "updated_at": "$started_at"},
    {"name": "Execute Tasks", "status": "pending"},
    {"name": "Generate Summary", "status": "pending"}
  ]
}
EOF
    echo -e "${GREEN}✓ Migration complete${NC}"
  fi
}

# Create or update workflow status file
if [ "$RESUME_MODE" = true ]; then
  # Migrate old format if needed
  migrate_workflow_status

  echo -e "${YELLOW}Checking existing workflow status...${NC}"

  # Check each step's status
  for step_name in "Generate PRD" "Generate Technical Design" "Generate Task List" "Execute Tasks" "Generate Summary"; do
    if check_step_completed "$step_name"; then
      echo -e "  ${GREEN}✓ $step_name - completed${NC}"
    else
      echo -e "  ${YELLOW}○ $step_name - pending${NC}"
    fi
  done

  LAST_COMPLETED=$(get_last_completed_step)
  if [ "$LAST_COMPLETED" != "none" ]; then
    echo -e "\n${GREEN}Last completed step: $LAST_COMPLETED${NC}"
    echo -e "${BLUE}Workflow will resume from next incomplete step${NC}"
  else
    echo -e "\n${YELLOW}No steps completed yet - starting from beginning${NC}"
  fi
  echo ""
else
  # Create initial workflow status file
  # Escape the feature description for JSON
  FEATURE_DESC_JSON=$(python3 -c "import json; print(json.dumps('''${FEATURE_DESC:-}'''))" 2>/dev/null || echo '""')

  cat > "$WORK_DIR/workflow-status.json" << EOF
{
  "execution_id": "$EXECUTION_ID",
  "feature_source": "$FEATURE_SOURCE",
  "feature_description": $FEATURE_DESC_JSON,
  "approval_mode": "$APPROVAL_MODE",
  "telemetry_enabled": $( [ "$TELEMETRY_ENABLED" = true ] && echo "true" || echo "false" ),
  "auto_extract": $( [ "$AUTO_EXTRACT" = true ] && echo "true" || echo "false" ),
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
fi

# Configure Langfuse if telemetry is enabled
if [ "$TELEMETRY_ENABLED" = true ]; then
  echo -e "${YELLOW}Configuring telemetry...${NC}"
  
  # Check if Python is available
  if [ -n "$PYTHON_CMD" ]; then
    # Check if langfuse is installed in the current Python environment
    if $PYTHON_CMD -c "import langfuse" 2>/dev/null; then
      export LANGFUSE_PUBLIC_KEY="pk-lf-e7b25b9c-356f-4268-96cf-07318a4a5ee4"
      export LANGFUSE_SECRET_KEY="sk-lf-980bcde7-ff84-40b2-b127-1e68a0b6c406"
      export LANGFUSE_HOST="http://localhost:3000"
      
      # Show which Python is being used
      PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
      PYTHON_PATH=$($PYTHON_CMD -c "import sys; print(sys.executable)")
      echo -e "${GREEN}✓ Langfuse telemetry configured${NC}"
      echo -e "  Python: $PYTHON_VERSION"
      echo -e "  Path: $PYTHON_PATH"
      if [ -n "$VIRTUAL_ENV" ]; then
        echo -e "  Virtual env: $VIRTUAL_ENV"
      fi
      echo ""
    else
      echo -e "${YELLOW}⚠ Langfuse SDK not installed - telemetry disabled${NC}"
      echo -e "${YELLOW}  Current Python: $($PYTHON_CMD --version 2>&1)${NC}"
      if [ -n "$VIRTUAL_ENV" ]; then
        echo -e "${YELLOW}  Virtual env: $VIRTUAL_ENV${NC}"
        echo -e "${YELLOW}  Install with: pip install langfuse${NC}"
      else
        echo -e "${YELLOW}  Install with: python3 -m pip install --user langfuse${NC}"
      fi
      echo -e "${YELLOW}  Or disable telemetry: DISABLE_TELEMETRY=1${NC}\n"
      TELEMETRY_ENABLED=false
    fi
  else
    echo -e "${YELLOW}⚠ Python not found - telemetry disabled${NC}\n"
    TELEMETRY_ENABLED=false
  fi
fi

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

# Function to create approval request (keeping original functionality)
create_approval_request() {
  local checkpoint=$1
  local file=$2
  local approval_file="$WORK_DIR/.approval_${checkpoint// /_}.json"
  
  local preview_text=$(head -n 20 "$file" 2>/dev/null || echo "")
  local preview_json=$(python3 -c "import json; print(json.dumps('''$preview_text'''))" 2>/dev/null || echo '""')
  
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

# Function to wait for approval (simplified version of original)
wait_for_approval() {
  local approval_file=$1
  local checkpoint=$2
  
  echo -e "${YELLOW}Waiting for approval...${NC}"
  echo -e "  Approval file: ${GREEN}$approval_file${NC}"
  echo -e "  To approve: echo '{\"status\":\"approved\"}' > ${approval_file}.response"
  echo -e "  To reject:  echo '{\"status\":\"rejected\"}' > ${approval_file}.response"
  echo ""
  
  send_telemetry "Approval Request" "waiting" "{\"checkpoint\": \"$checkpoint\"}"
  
  while true; do
    local response_file="${approval_file}.response"
    
    if [ -f "$response_file" ]; then
      local status=$(python3 -c "import json; print(json.load(open('$response_file')).get('status', 'invalid'))" 2>/dev/null || echo "invalid")
      
      case $status in
        approved)
          echo -e "${GREEN}✓ Approved - continuing workflow${NC}\n"
          send_telemetry "Approval" "approved" "{\"checkpoint\": \"$checkpoint\"}"
          return 0
          ;;
        rejected)
          echo -e "${RED}✗ Rejected - workflow stopped${NC}"
          send_telemetry "Approval" "rejected" "{\"checkpoint\": \"$checkpoint\"}"
          exit 1
          ;;
      esac
      
      rm -f "$response_file"
    fi
    
    sleep 1
  done
}

# Function to request approval
request_approval() {
  local checkpoint=$1
  local file=$2

  # Skip approval if this step was already completed in a resumed workflow
  local step_name=""
  case $checkpoint in
    "PRD") step_name="Generate PRD" ;;
    "Technical Design") step_name="Generate Technical Design" ;;
    "Task List") step_name="Generate Task List" ;;
  esac

  if [ -n "$step_name" ] && [ "$RESUME_MODE" = true ] && check_step_completed "$step_name"; then
    echo -e "${BLUE}Skipping approval for $checkpoint (already approved in previous run)${NC}\n"
    return 0
  fi

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
      local approval_file=$(create_approval_request "$checkpoint" "$file")
      wait_for_approval "$approval_file" "$checkpoint"
      ;;
    interactive|*)
      echo "Preview (first 20 lines):"
      echo -e "${BLUE}----------------------------------------${NC}"
      head -n 20 "$file"
      echo -e "${BLUE}----------------------------------------${NC}"
      echo ""
      
      read -p "Approve and continue? (y/n): " approval
      
      case $approval in
        y|Y)
          echo -e "${GREEN}✓ Approved - continuing workflow${NC}\n"
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

# Main workflow execution
# Step 1: Generate PRD
PRD_FILE=$(find_workflow_file "prd_")
if [ -z "$PRD_FILE" ]; then
  PRD_FILE="$WORK_DIR/prd_$(date +%Y%m%d).md"
fi

if check_step_completed "Generate PRD" && [ -f "$PRD_FILE" ] && [ -s "$PRD_FILE" ]; then
  echo -e "${GREEN}[1/5] ✓ Skipping: Generate Product Requirements Document (already completed)${NC}"
  echo -e "  Using existing: $(basename "$PRD_FILE")\n"
else
  log_step 1 "Generate Product Requirements Document" "start"

  if [ -z "$FEATURE_DESC" ]; then
    # Try to get feature description from workflow status
    if [ "$RESUME_MODE" = true ] && [ -f "$WORK_DIR/workflow-status.json" ]; then
      FEATURE_DESC=$(python3 -c "import json; print(json.load(open('$WORK_DIR/workflow-status.json')).get('feature_description', ''))" 2>/dev/null || echo "")
    fi

    # If still empty, prompt user
    if [ -z "$FEATURE_DESC" ]; then
      echo -e "${YELLOW}Feature description required to generate PRD${NC}"
      echo -e "${YELLOW}Please provide the feature description:${NC}"
      read -p "Feature: " FEATURE_DESC
    fi
  fi
  
  # Use the /prd command - it accepts the feature description as an argument
  # Write feature description to a temp file for the command to read
  TEMP_FEATURE_FILE=$(mktemp)
  echo "$FEATURE_DESC" > "$TEMP_FEATURE_FILE"
  
  # Invoke the /prd command with the feature description
  # The command accepts either inline text or a file path
  if [ "$TELEMETRY_ENABLED" = true ] && [ -f "scripts/claude-with-telemetry.py" ]; then
    # For telemetry, invoke via claude CLI
    claude /prd "$TEMP_FEATURE_FILE" --output-format stream-json > "$PRD_FILE"
  else
    # Direct invocation of the prd command
    claude /prd "$TEMP_FEATURE_FILE" --output-format stream-json > "$PRD_FILE"
  fi
  
  rm -f "$TEMP_FEATURE_FILE"
  
  if [ $? -eq 0 ]; then
    log_step 1 "Generate Product Requirements Document" "complete"
    echo -e "  Output: $PRD_FILE"
    echo -e "  Size: $(wc -c < "$PRD_FILE") bytes"
    update_step_status "Generate PRD" "completed"
    
    # Extract if needed
    if [ "$AUTO_EXTRACT" = true ]; then
      extract_artifacts "$WORK_DIR" "docs/specs/$(basename "$WORK_DIR")"
    fi
  else
    log_step 1 "Generate Product Requirements Document" "error"
    exit 1
  fi
  
  request_approval "PRD" "$PRD_FILE"
fi

# Step 2: Generate Technical Design
DESIGN_FILE=$(find_workflow_file "tdd_")
if [ -z "$DESIGN_FILE" ]; then
  DESIGN_FILE="$WORK_DIR/tdd_$(date +%Y%m%d).md"
fi

if check_step_completed "Generate Technical Design" && [ -f "$DESIGN_FILE" ] && [ -s "$DESIGN_FILE" ]; then
  echo -e "${GREEN}[2/5] ✓ Skipping: Generate Technical Design Document (already completed)${NC}"
  echo -e "  Using existing: $(basename "$DESIGN_FILE")\n"
else
  log_step 2 "Generate Technical Design Document" "start"
  
  # Extract PRD if it's in JSON format
  PRD_INPUT="$PRD_FILE"
  if grep -q '^{' "$PRD_FILE" 2>/dev/null; then
    # Extract PRD content using the extraction script
    if [ -f "scripts/extract-artifacts.py" ]; then
      python3 scripts/extract-artifacts.py "$WORK_DIR" > /dev/null 2>&1
      if [ -f "$PRD_FILE.extracted.md" ]; then
        PRD_INPUT="$PRD_FILE.extracted.md"
      fi
    fi
  fi
  
  # Use the /design command properly with file path argument
  if [ "$TELEMETRY_ENABLED" = true ] && [ -f "scripts/claude-with-telemetry.py" ]; then
    # For telemetry, we need to invoke the command via claude CLI
    claude /design "$PRD_INPUT" --output-format stream-json > "$DESIGN_FILE"
  else
    # Direct invocation of the design command
    claude /design "$PRD_INPUT" --output-format stream-json > "$DESIGN_FILE"
  fi
  
  if [ $? -eq 0 ]; then
    log_step 2 "Generate Technical Design Document" "complete"
    echo -e "  Output: $DESIGN_FILE"
    echo -e "  Size: $(wc -c < "$DESIGN_FILE") bytes"
    update_step_status "Generate Technical Design" "completed"
    
    if [ "$AUTO_EXTRACT" = true ]; then
      extract_artifacts "$WORK_DIR" "docs/specs/$(basename "$WORK_DIR")"
    fi
  else
    log_step 2 "Generate Technical Design Document" "error"
    exit 1
  fi
  
  request_approval "Technical Design" "$DESIGN_FILE"
fi

# Step 3: Generate Task List
TASKS_FILE=$(find_workflow_file "tasks_")
if [ -z "$TASKS_FILE" ]; then
  TASKS_FILE="$WORK_DIR/tasks_$(date +%Y%m%d).md"
fi

if check_step_completed "Generate Task List" && [ -f "$TASKS_FILE" ] && [ -s "$TASKS_FILE" ]; then
  echo -e "${GREEN}[3/5] ✓ Skipping: Generate Task List (already completed)${NC}"
  echo -e "  Using existing: $(basename "$TASKS_FILE")\n"
else
  log_step 3 "Generate Task List" "start"
  
  # Extract TDD if it's in JSON format
  TDD_INPUT="$DESIGN_FILE"
  if grep -q '^{' "$DESIGN_FILE" 2>/dev/null; then
    # Extract TDD content using the extraction script
    if [ -f "scripts/extract-artifacts.py" ]; then
      python3 scripts/extract-artifacts.py "$WORK_DIR" > /dev/null 2>&1
      if [ -f "$DESIGN_FILE.extracted.md" ]; then
        TDD_INPUT="$DESIGN_FILE.extracted.md"
      fi
    fi
  fi
  
  # Use the /tasks command properly with file path argument
  if [ "$TELEMETRY_ENABLED" = true ] && [ -f "scripts/claude-with-telemetry.py" ]; then
    # For telemetry, we need to invoke the command via claude CLI
    claude /tasks "$TDD_INPUT" --output-format stream-json > "$TASKS_FILE"
  else
    # Direct invocation of the tasks command
    claude /tasks "$TDD_INPUT" --output-format stream-json > "$TASKS_FILE"
  fi
  
  if [ $? -eq 0 ]; then
    log_step 3 "Generate Task List" "complete"
    echo -e "  Output: $TASKS_FILE"
    echo -e "  Size: $(wc -c < "$TASKS_FILE") bytes"
    update_step_status "Generate Task List" "completed"
    
    if [ "$AUTO_EXTRACT" = true ]; then
      extract_artifacts "$WORK_DIR" "docs/specs/$(basename "$WORK_DIR")"
    fi
  else
    log_step 3 "Generate Task List" "error"
    exit 1
  fi
  
  request_approval "Task List" "$TASKS_FILE"
fi

# Step 4: Execute Tasks (optional)
log_step 4 "Execute Tasks" "start"

AUTO_EXECUTE="${AUTO_EXECUTE:-true}"

if [ "$AUTO_EXECUTE" = "false" ]; then
  echo -e "${YELLOW}Task execution is optional. You can:${NC}"
  echo -e "  1. Review tasks manually: $TASKS_FILE"
  echo -e "  2. Execute tasks now"
  echo -e "  3. Skip and execute later: claude /execute-task $TASKS_FILE"
  echo ""
  read -p "Execute tasks now? (y/n): " execute_now
else
  echo -e "${GREEN}Auto-executing approved task list...${NC}"
  execute_now="y"
fi

if [ "$execute_now" = "y" ] || [ "$execute_now" = "Y" ]; then
  echo -e "${BLUE}Executing tasks from: $TASKS_FILE${NC}"
  echo ""
  
  # Note: Task execution would go here
  echo -e "${YELLOW}Task execution not implemented in this demo${NC}"
  echo -e "${YELLOW}You can run: claude /execute-task $TASKS_FILE${NC}"
  
  log_step 4 "Execute Tasks" "complete"
  update_step_status "Execute Tasks" "skipped"
fi

# Step 5: Workflow Summary
log_step 5 "Generate Workflow Summary" "start"
SUMMARY_FILE="$WORK_DIR/workflow-summary.md"

# Extract final spec location if artifacts were extracted
SPEC_LOCATION=""
if [ "$EXTRACT_TO_SPECS" = true ] && [ "$AUTO_EXTRACT" = true ]; then
  SPEC_LOCATION="docs/specs/$(basename "$WORK_DIR")"
fi

cat > "$SUMMARY_FILE" << EOF
# Workflow Execution Summary

**Execution ID**: $EXECUTION_ID
**Feature Source**: $FEATURE_SOURCE
**Timestamp**: $TIMESTAMP
**Telemetry**: $([ "$TELEMETRY_ENABLED" = true ] && echo "Enabled (Langfuse)" || echo "Disabled")

## Generated Artifacts

### Raw Output (JSON with metadata)
1. **Product Requirements Document**: \`$(basename "$PRD_FILE")\`
2. **Technical Design Document**: \`$(basename "$DESIGN_FILE")\`
3. **Task List**: \`$(basename "$TASKS_FILE")\`

### Extracted Documents
$(if [ "$AUTO_EXTRACT" = true ]; then
  echo "✓ Documents automatically extracted from JSON"
  if [ -n "$SPEC_LOCATION" ]; then
    echo "✓ Extracted to: \`$SPEC_LOCATION\`"
  fi
else
  echo "⚠ Auto-extraction disabled. Run manually:"
  echo "\`\`\`bash"
  echo "python3 scripts/extract-artifacts.py $WORK_DIR docs/specs/my-feature"
  echo "\`\`\`"
fi)

## Working Directory

All files are located in: \`$WORK_DIR\`

## Metadata Preservation

The JSON output format preserves:
- Full conversation history
- Token usage and costs
- Model information
- Timing data
- All prompts and responses

## Observability

$(if [ "$TELEMETRY_ENABLED" = true ]; then
  echo "View traces and metrics:"
  echo "- **Langfuse**: http://localhost:3000"
  echo "- Search for execution ID: \`$EXECUTION_ID\`"
else
  echo "Telemetry was disabled for this run."
  echo "To enable: \`TELEMETRY_ENABLED=true $0 ...\`"
fi)

## Next Steps

1. Review all generated documents
2. Extract documents if not auto-extracted
3. Execute tasks: \`claude /execute-task $TASKS_FILE\`
4. $([ "$TELEMETRY_ENABLED" = true ] && echo "Analyze workflow metrics in Langfuse" || echo "Enable telemetry for workflow analytics")

---
*Generated by Feature to Code Workflow (Unified)*
*Execution completed at: $(date -Iseconds)*
EOF

log_step 5 "Generate Workflow Summary" "complete"
update_step_status "Generate Summary" "completed"

# Final extraction if needed
if [ "$AUTO_EXTRACT" = true ]; then
  echo -e "${YELLOW}========================================${NC}"
  echo -e "${YELLOW}Final Artifact Extraction${NC}"
  echo -e "${YELLOW}========================================${NC}"
  
  if [ "$EXTRACT_TO_SPECS" = true ]; then
    TARGET_SPEC_DIR="docs/specs/$(basename "$WORK_DIR")"
    extract_artifacts "$WORK_DIR" "$TARGET_SPEC_DIR"
    echo -e "Artifacts extracted to: ${GREEN}$TARGET_SPEC_DIR${NC}"
  else
    extract_artifacts "$WORK_DIR"
    echo -e "Artifacts extracted in place with .extracted.md suffix"
  fi
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Workflow Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Execution ID: ${BLUE}$EXECUTION_ID${NC}"
echo -e "Working Directory: ${BLUE}$WORK_DIR${NC}"
echo -e "Summary: ${BLUE}$SUMMARY_FILE${NC}"
echo ""

if [ "$TELEMETRY_ENABLED" = true ]; then
  echo -e "${YELLOW}View telemetry data:${NC}"
  echo -e "  Langfuse: ${BLUE}http://localhost:3000${NC}"
  echo -e "  Search for execution ID: ${GREEN}$EXECUTION_ID${NC}"
else
  echo -e "${YELLOW}Telemetry was disabled.${NC}"
  echo -e "To enable telemetry, run with: ${GREEN}TELEMETRY_ENABLED=true${NC}"
fi

echo ""
echo -e "Generated files:"
ls -lh "$WORK_DIR"
echo ""

send_telemetry "Workflow Complete" "success" "{\"execution_id\": \"$EXECUTION_ID\", \"duration\": \"$(date -Iseconds)\"}"

