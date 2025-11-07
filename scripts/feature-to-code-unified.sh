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
AUTO_APPLY_FEEDBACK="${AUTO_APPLY_FEEDBACK:-false}"
AUTO_RETRY_AFTER_FEEDBACK="${AUTO_RETRY_AFTER_FEEDBACK:-false}"
SHOW_FILE_CHANGES="${SHOW_FILE_CHANGES:-true}"
REQUIRE_COMMAND_APPROVAL="${REQUIRE_COMMAND_APPROVAL:-true}"

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
echo -e "Auto-Apply Feedback: ${GREEN}$([ "$AUTO_APPLY_FEEDBACK" = true ] && echo "ENABLED" || echo "DISABLED")${NC}"
echo -e "Command Approval Required: ${GREEN}$([ "$REQUIRE_COMMAND_APPROVAL" = true ] && echo "YES" || echo "NO")${NC}"
echo -e "File Change Tracking: ${GREEN}$([ "$SHOW_FILE_CHANGES" = true ] && echo "ENABLED" || echo "DISABLED")${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to send telemetry if enabled
send_telemetry() {
  if [ "$TELEMETRY_ENABLED" = true ]; then
    local step_name=$1
    local status=$2
    local metadata=$3

    # Just log telemetry events (actual tracking happens via approval server)
    echo -e "${YELLOW}[Telemetry] Tracking: $step_name - $status${NC}"
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

# Function to capture git changes for file tracking
capture_git_changes() {
  local work_dir=$1

  # Initialize git if not already initialized
  if [ ! -d "$work_dir/.git" ]; then
    git -C "$work_dir" init -q > /dev/null 2>&1
    git -C "$work_dir" config user.name "Workflow" > /dev/null 2>&1
    git -C "$work_dir" config user.email "workflow@localhost" > /dev/null 2>&1
    git -C "$work_dir" add -A > /dev/null 2>&1
    git -C "$work_dir" commit -q -m "Initial workflow state" > /dev/null 2>&1
  fi

  # Capture current git status
  local status_output=$(git -C "$work_dir" status --porcelain 2>/dev/null || echo "")
  local diff_output=$(git -C "$work_dir" diff HEAD 2>/dev/null || echo "")

  # Parse status into JSON array of changed files using Python
  local changed_files=""
  if [ -n "$PYTHON_CMD" ]; then
    changed_files=$(echo "$status_output" | $PYTHON_CMD -c '
import sys
import json

files = []
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    status_code = line[:2].strip()
    filepath = line[3:]

    file_status = "modified"
    if status_code in ["??", "A"]:
        file_status = "created"
    elif status_code == "D":
        file_status = "deleted"
    elif status_code == "M":
        file_status = "modified"

    files.append({
        "path": filepath,
        "status": file_status
    })

print(json.dumps(files))
' 2>/dev/null || echo '[]')
  else
    # Fallback if Python not available
    changed_files='[]'
  fi

  # Build file tree structure
  local file_tree=""
  if [ -n "$PYTHON_CMD" ] && [ "$changed_files" != "[]" ]; then
    file_tree=$(echo "$changed_files" | $PYTHON_CMD -c '
import json
import sys

try:
    files = json.loads(sys.stdin.read())
except:
    files = []

tree = {}

for file_obj in files:
    parts = file_obj["path"].split("/")
    current = tree

    for i, part in enumerate(parts):
        if part not in current:
            if i == len(parts) - 1:
                # It is a file
                current[part] = {"type": "file", "status": file_obj["status"]}
            else:
                # It is a directory
                current[part] = {"type": "directory", "children": {}}
        if "children" in current.get(part, {}):
            current = current[part]["children"]

def dict_to_list(d):
    result = []
    for name, data in d.items():
        node = {"name": name, "type": data["type"]}
        if "children" in data:
            node["children"] = dict_to_list(data["children"])
        if "status" in data:
            node["status"] = data["status"]
        result.append(node)
    return result

print(json.dumps(dict_to_list(tree)))
' 2>/dev/null || echo '[]')
  else
    # Fallback if Python not available or no files
    file_tree='[]'
  fi

  # Return results separated by a delimiter
  # Using printf to properly handle empty values and special characters
  printf '%s\037%s\037%s' "$changed_files" "$diff_output" "$file_tree"
}

# Function to create approval request (keeping original functionality)
create_approval_request() {
  local checkpoint=$1
  local file=$2
  local approval_file="$WORK_DIR/.approval_${checkpoint// /_}.json"

  local preview_text=$(head -n 20 "$file" 2>/dev/null || echo "")
  local preview_json=$(python3 -c "import json; print(json.dumps('''$preview_text'''))" 2>/dev/null || echo '""')

  # Capture file changes if enabled
  local changed_files_json='[]'
  local git_diff_json='""'
  local file_tree_json='[]'

  if [ "$SHOW_FILE_CHANGES" = "true" ]; then
    local git_changes=$(capture_git_changes "$WORK_DIR")

    # Split the results using ASCII Unit Separator (0x1F)
    IFS=$'\037' read -r changed_files diff_output file_tree <<< "$git_changes"

    # Escape for JSON (already JSON from Python)
    changed_files_json="${changed_files:-[]}"
    file_tree_json="${file_tree:-[]}"

    # Escape diff output for JSON
    if [ -n "$PYTHON_CMD" ] && [ -n "$diff_output" ]; then
      git_diff_json=$(echo "$diff_output" | $PYTHON_CMD -c "import sys, json; print(json.dumps(sys.stdin.read()))" 2>/dev/null || echo '""')
    else
      git_diff_json='""'
    fi

    # Commit changes to track for next checkpoint
    if [ -d "$WORK_DIR/.git" ]; then
      git -C "$WORK_DIR" add -A > /dev/null 2>&1
      git -C "$WORK_DIR" commit -q -m "Checkpoint: $checkpoint" > /dev/null 2>&1 || true
    fi
  fi

  cat > "$approval_file" << EOF
{
  "execution_id": "$EXECUTION_ID",
  "checkpoint": "$checkpoint",
  "file": "$file",
  "timestamp": "$(date -Iseconds)",
  "status": "pending",
  "timeout_seconds": $APPROVAL_TIMEOUT,
  "preview": $preview_json,
  "changed_files": $changed_files_json,
  "git_diff": $git_diff_json,
  "file_tree": $file_tree_json,
  "feedback_requested": true,
  "feedback_template": {
    "specific_issues": "What specific issues did you find?",
    "missing_elements": "What's missing or unclear?",
    "suggested_improvements": "How should this be improved?",
    "rating": "Rate the quality (1-5 stars)"
  }
}
EOF

  echo "$approval_file"
}

# Function to generate proposed command changes (dry-run apply-reflect)
generate_proposed_command_changes() {
  local checkpoint=$1
  local reflection_file=$2
  local command_file=""

  # Map checkpoint to command file
  case $checkpoint in
    "PRD")
      command_file="prd.md"
      ;;
    "Technical Design")
      command_file="design.md"
      ;;
    "Task List")
      command_file="tasks.md"
      ;;
    *)
      echo -e "${RED}Error: Unknown checkpoint for command improvement: $checkpoint${NC}"
      return 1
      ;;
  esac

  echo -e "${BLUE}Generating proposed command changes...${NC}"

  # Create temporary file for proposed changes
  local proposed_file="$WORK_DIR/.claude_commands_flow_${command_file}.proposed"
  local original_file=".claude/commands/flow/$command_file"

  # Check if original command file exists
  if [ ! -f "$original_file" ]; then
    echo -e "${RED}Error: Command file not found: $original_file${NC}"
    return 1
  fi

  # Run apply-reflect to generate proposed changes (save to temp file)
  # We'll simulate this by copying the existing file and noting that actual apply-reflect would modify it
  cp "$original_file" "$proposed_file" 2>/dev/null || {
    echo -e "${RED}Error: Could not create proposed file${NC}"
    return 1
  }

  # Actually run apply-reflect to the proposed file
  echo -e "${YELLOW}Running apply-reflect in dry-run mode...${NC}"

  # Create a temporary script to apply changes to proposed file
  local apply_output="$WORK_DIR/apply_reflect_dryrun_$(date +%Y%m%d_%H%M%S).log"

  # We need to temporarily copy the proposed file to the actual location,
  # run apply-reflect, then move it back to proposed
  cp "$original_file" "$original_file.backup_dryrun" 2>/dev/null
  cp "$proposed_file" "$original_file" 2>/dev/null

  # Run apply-reflect
  if claude /flow:apply-reflect "$checkpoint" "$reflection_file" > "$apply_output" 2>&1; then
    # Move the modified file to proposed location
    mv "$original_file" "$proposed_file" 2>/dev/null
    # Restore original
    mv "$original_file.backup_dryrun" "$original_file" 2>/dev/null

    echo -e "${GREEN}✓ Proposed changes generated${NC}"
  else
    # Restore original on failure
    mv "$original_file.backup_dryrun" "$original_file" 2>/dev/null
    echo -e "${RED}✗ Failed to generate proposed changes${NC}"
    return 1
  fi

  # Generate diff between original and proposed
  local diff_output=$(diff -u "$original_file" "$proposed_file" 2>/dev/null || true)

  if [ -z "$diff_output" ]; then
    echo -e "${YELLOW}No changes would be made to the command file${NC}"
    rm -f "$proposed_file"
    return 1
  fi

  # Extract change summary from reflection file
  local change_summary=""
  if [ -f "$reflection_file" ] && [ -n "$PYTHON_CMD" ]; then
    change_summary=$($PYTHON_CMD -c "
import re

with open('$reflection_file', 'r') as f:
    content = f.read()

# Extract specific changes or improvements mentioned
changes = []
patterns = [
    r'Specific changes:.*?(?=\n\n|\Z)',
    r'Changes to make:.*?(?=\n\n|\Z)',
    r'Improvements:.*?(?=\n\n|\Z)',
    r'\d+\.\s+.*?(?=\n\d+\.|\n\n|\Z)'
]

for pattern in patterns:
    matches = re.findall(pattern, content, re.DOTALL | re.MULTILINE)
    if matches:
        changes.extend([m.strip() for m in matches[:3]])  # Limit to 3 items
        break

if not changes:
    # Fallback: get first few lines after 'Specific' or 'Changes'
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'specific' in line.lower() or 'changes' in line.lower():
            changes = lines[i+1:i+4]
            break

# Clean and format
changes = [c.strip('- ').strip() for c in changes if c.strip()][:3]
print('\\n'.join(changes))
" 2>/dev/null || echo "")
  fi

  # Return paths and diff using ASCII Unit Separator
  printf '%s\037%s\037%s\037%s' "$proposed_file" "$diff_output" "$change_summary" "$command_file"
}

# Function to create command improvement approval request
create_command_improvement_approval() {
  local original_checkpoint=$1
  local reflection_file=$2
  local proposed_file=$3
  local diff_output=$4
  local change_summary=$5
  local command_file=$6

  local approval_file="$WORK_DIR/.approval_Command_Improvements_${original_checkpoint// /_}.json"

  # Escape the diff for JSON
  local diff_json=""
  if [ -n "$PYTHON_CMD" ] && [ -n "$diff_output" ]; then
    diff_json=$(echo "$diff_output" | $PYTHON_CMD -c "import sys, json; print(json.dumps(sys.stdin.read()))" 2>/dev/null || echo '""')
  else
    diff_json='""'
  fi

  # Create preview from reflection file
  local preview_text=""
  if [ -f "$reflection_file" ]; then
    preview_text=$(head -n 30 "$reflection_file" 2>/dev/null || echo "")
  fi
  local preview_json=""
  if [ -n "$PYTHON_CMD" ] && [ -n "$preview_text" ]; then
    preview_json=$(echo "$preview_text" | $PYTHON_CMD -c "import sys, json; print(json.dumps(sys.stdin.read()))" 2>/dev/null || echo '""')
  else
    preview_json='""'
  fi

  # Format change summary for JSON
  local change_summary_json="[]"
  if [ -n "$PYTHON_CMD" ] && [ -n "$change_summary" ]; then
    change_summary_json=$(echo "$change_summary" | $PYTHON_CMD -c "
import sys, json
lines = [line.strip() for line in sys.stdin.read().strip().split('\\n') if line.strip()]
print(json.dumps(lines[:5]))  # Limit to 5 items
" 2>/dev/null || echo '[]')
  fi

  # Get original feedback if available
  local original_feedback=""
  local feedback_file="$WORK_DIR/.feedback_${original_checkpoint// /_}.json"
  if [ -f "$feedback_file" ] && [ -n "$PYTHON_CMD" ]; then
    original_feedback=$($PYTHON_CMD -c "
import json
try:
    with open('$feedback_file', 'r') as f:
        data = json.load(f)
        summary = []
        if 'specific_issues' in data and data['specific_issues']:
            summary.append('Issues: ' + data['specific_issues'][:100])
        if 'missing_elements' in data and data['missing_elements']:
            summary.append('Missing: ' + data['missing_elements'][:100])
        print(' | '.join(summary)[:200])
except:
    print('')
" 2>/dev/null || echo "")
  fi

  cat > "$approval_file" << EOF
{
  "execution_id": "$EXECUTION_ID",
  "checkpoint": "Command Improvements: $original_checkpoint",
  "file": "$reflection_file",
  "timestamp": "$(date -Iseconds)",
  "status": "pending",
  "timeout_seconds": 0,
  "preview": $preview_json,
  "changed_files": [
    {
      "path": ".claude/commands/flow/$command_file",
      "status": "modified"
    }
  ],
  "git_diff": $diff_json,
  "file_tree": [
    {
      "name": ".claude",
      "type": "directory",
      "children": [
        {
          "name": "commands",
          "type": "directory",
          "children": [
            {
              "name": "flow",
              "type": "directory",
              "children": [
                {
                  "name": "$command_file",
                  "type": "file",
                  "status": "modified"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "approval_type": "command_improvement",
  "command_improvement_metadata": {
    "target_command": "$command_file",
    "original_checkpoint": "$original_checkpoint",
    "reflection_file": "$reflection_file",
    "proposed_file": "$proposed_file",
    "change_summary": $change_summary_json,
    "original_feedback": "$(echo "$original_feedback" | sed 's/"/\\"/g')",
    "what_if_rejected": "Command will not be modified. You can manually edit .claude/commands/flow/$command_file or re-run the workflow with the current command."
  },
  "feedback_requested": false
}
EOF

  echo "$approval_file"
}

# Function to wait for command improvement approval
wait_for_command_improvement_approval() {
  local approval_file=$1
  local checkpoint=$2
  local proposed_file=$3

  echo -e "${YELLOW}Waiting for command improvement approval...${NC}"
  echo -e "  Approval file: $(basename "$approval_file")"

  # Same logic as wait_for_approval but specific to command improvements
  local max_wait=0
  if [ "$APPROVAL_TIMEOUT" -gt 0 ]; then
    max_wait=$APPROVAL_TIMEOUT
  fi

  local start_time=$(date +%s)
  local response_file="${approval_file}.response"

  while true; do
    if [ -f "$response_file" ]; then
      local status=$(grep -o '"status":\s*"[^"]*"' "$response_file" | sed 's/.*"status":\s*"\([^"]*\)".*/\1/')

      if [ "$status" = "approved" ]; then
        echo -e "${GREEN}✓ Command improvements approved${NC}"

        # Apply the approved changes
        local command_file=""
        case $checkpoint in
          "PRD") command_file="prd.md" ;;
          "Technical Design") command_file="design.md" ;;
          "Task List") command_file="tasks.md" ;;
        esac

        if [ -n "$command_file" ] && [ -f "$proposed_file" ]; then
          cp "$proposed_file" ".claude/commands/flow/$command_file"
          echo -e "${GREEN}✓ Command file updated: $command_file${NC}"
          rm -f "$proposed_file"
        fi

        return 0
      elif [ "$status" = "rejected" ]; then
        local reason=$(grep -o '"reason":\s*"[^"]*"' "$response_file" | sed 's/.*"reason":\s*"\([^"]*\)".*/\1/')
        echo -e "${RED}✗ Command improvements rejected${NC}"
        echo -e "  Reason: $reason"

        # Clean up proposed file
        rm -f "$proposed_file"

        return 1
      fi
    fi

    # Check timeout
    if [ "$max_wait" -gt 0 ]; then
      local elapsed=$(($(date +%s) - start_time))
      if [ "$elapsed" -ge "$max_wait" ]; then
        echo -e "${RED}✗ Approval timeout after ${max_wait} seconds${NC}"
        rm -f "$proposed_file"
        return 1
      fi
    fi

    sleep 2
  done
}

# Function to invoke reflect command with feedback
invoke_reflect_with_feedback() {
  local checkpoint=$1
  local feedback_file=$2

  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}Reflection & Improvement Phase${NC}"
  echo -e "${BLUE}========================================${NC}"

  # Extract feedback content
  local feedback_content=$(cat "$feedback_file" 2>/dev/null || echo "{}")

  # Map checkpoint to command file
  local command_to_improve=""
  case $checkpoint in
    "PRD")
      command_to_improve="prd"
      ;;
    "Technical Design")
      command_to_improve="design"
      ;;
    "Task List")
      command_to_improve="tasks"
      ;;
  esac

  # Create a comprehensive feedback message
  local reflect_input=$(cat <<EOF
The $checkpoint was rejected with the following feedback:

$feedback_content

Please analyze:
1. What went wrong in the $command_to_improve command
2. How the command at .claude/commands/flow/$command_to_improve.md should be improved
3. Specific changes needed to address the feedback

Focus on making the $command_to_improve command better so it generates higher quality output next time.
EOF
)

  # Save reflection input to temp file
  local reflect_input_file="$WORK_DIR/.reflect_input_${checkpoint// /_}.txt"
  echo "$reflect_input" > "$reflect_input_file"

  # Call the reflect command
  echo -e "${YELLOW}Running reflection analysis...${NC}"
  local reflect_output_file="$WORK_DIR/reflection_${checkpoint// /_}_$(date +%Y%m%d_%H%M%S).md"

  # Invoke reflect command via claude CLI
  if claude /reflect "$reflect_input_file" > "$reflect_output_file" 2>&1; then
    echo -e "${GREEN}✓ Reflection complete${NC}"
    echo -e "  Output saved to: $reflect_output_file"

    # Show summary of reflection
    echo -e "\n${YELLOW}Reflection Summary:${NC}"
    head -n 30 "$reflect_output_file"
    echo -e "${BLUE}...${NC}"

    # Check if we should automatically apply feedback
    if [ "$AUTO_APPLY_FEEDBACK" = "true" ]; then
      echo -e "${BLUE}Auto-apply feedback is enabled${NC}"

      # Check if command approval is required
      if [ "$REQUIRE_COMMAND_APPROVAL" = "true" ]; then
        echo -e "${YELLOW}Command approval is required before applying changes${NC}"

        # Generate proposed changes
        local proposed_result=$(generate_proposed_command_changes "$checkpoint" "$reflect_output_file")

        if [ $? -eq 0 ] && [ -n "$proposed_result" ]; then
          # Parse the result using ASCII Unit Separator
          IFS=$'\037' read -r proposed_file diff_output change_summary command_file <<< "$proposed_result"

          # Create approval request for command improvements
          local cmd_approval_file=$(create_command_improvement_approval \
            "$checkpoint" \
            "$reflect_output_file" \
            "$proposed_file" \
            "$diff_output" \
            "$change_summary" \
            "$command_file")

          echo -e "${YELLOW}Command improvement approval requested${NC}"
          echo -e "  Approval file: $(basename "$cmd_approval_file")"

          # Wait for approval
          if wait_for_command_improvement_approval "$cmd_approval_file" "$checkpoint" "$proposed_file"; then
            echo -e "${GREEN}✓ Command improvements applied${NC}"

            # Now optionally retry the step
            if [ "$AUTO_RETRY_AFTER_FEEDBACK" = "true" ]; then
              echo -e "${BLUE}Auto-retrying step with improved command...${NC}"
              retry_step "$checkpoint"
            else
              echo -e "${YELLOW}Command updated. To retry the step:${NC}"
              echo -e "  Resume the workflow with: $0 $WORK_DIR"
            fi
          else
            echo -e "${RED}Command improvements not applied${NC}"
            echo -e "${YELLOW}To apply manually:${NC}"
            echo -e "  claude /flow:apply-reflect \"$checkpoint\" \"$reflect_output_file\""
          fi
        else
          echo -e "${YELLOW}No changes to apply or generation failed${NC}"
        fi
      else
        # Original behavior: apply immediately without approval
        apply_feedback_and_retry "$checkpoint" "$reflect_output_file"
      fi
    elif [ "$APPROVAL_MODE" = "interactive" ]; then
      echo ""
      read -p "Apply suggested improvements to the command? (y/n): " apply_improvements

      if [ "$apply_improvements" = "y" ] || [ "$apply_improvements" = "Y" ]; then
        echo -e "${YELLOW}Applying improvements...${NC}"

        # Also check if command approval is required in interactive mode
        if [ "$REQUIRE_COMMAND_APPROVAL" = "true" ]; then
          # Generate and approve changes
          local proposed_result=$(generate_proposed_command_changes "$checkpoint" "$reflect_output_file")

          if [ $? -eq 0 ] && [ -n "$proposed_result" ]; then
            IFS=$'\037' read -r proposed_file diff_output change_summary command_file <<< "$proposed_result"

            echo -e "${YELLOW}Review proposed changes:${NC}"
            echo "$diff_output" | head -50
            echo ""
            read -p "Apply these changes? (y/n): " confirm_changes

            if [ "$confirm_changes" = "y" ] || [ "$confirm_changes" = "Y" ]; then
              cp "$proposed_file" ".claude/commands/flow/$command_file"
              rm -f "$proposed_file"
              echo -e "${GREEN}✓ Command file updated${NC}"

              if [ "$AUTO_RETRY_AFTER_FEEDBACK" = "true" ]; then
                retry_step "$checkpoint"
              fi
            else
              rm -f "$proposed_file"
              echo -e "${YELLOW}Changes not applied${NC}"
            fi
          fi
        else
          apply_feedback_and_retry "$checkpoint" "$reflect_output_file"
        fi
      fi
    else
      echo -e "${YELLOW}To apply improvements manually:${NC}"
      echo -e "  claude /flow:apply-reflect \"$checkpoint\" \"$reflect_output_file\""
      echo -e "${YELLOW}To retry the step after applying:${NC}"
      echo -e "  Resume the workflow with: $0 $WORK_DIR"
    fi
  else
    echo -e "${RED}✗ Reflection command failed${NC}"
    echo "Error output:"
    cat "$reflect_output_file" 2>/dev/null || echo "No error output available"
  fi

  # Update workflow status with feedback information
  if [ -n "$PYTHON_CMD" ] && [ -f "$WORK_DIR/workflow-status.json" ]; then
    $PYTHON_CMD -c "
import json
try:
    with open('$WORK_DIR/workflow-status.json', 'r') as f:
        data = json.load(f)

    # Find the step and add feedback info
    for step in data.get('steps', []):
        if step.get('name') == 'Generate $checkpoint':
            step['feedback_received'] = True
            step['feedback_file'] = '$feedback_file'
            step['reflection_file'] = '$reflect_output_file'
            step['feedback_timestamp'] = '$(date -Iseconds)'
            break

    with open('$WORK_DIR/workflow-status.json', 'w') as f:
        json.dump(data, f, indent=2)
except Exception as e:
    print(f'Failed to update workflow status: {e}')
" 2>/dev/null || true
  fi

  send_telemetry "Reflection" "completed" "{\"checkpoint\": \"$checkpoint\", \"feedback_processed\": true}"
}

# Function to apply feedback and retry the workflow step
apply_feedback_and_retry() {
  local checkpoint=$1
  local reflection_file=$2

  echo -e "${YELLOW}========================================${NC}"
  echo -e "${YELLOW}Auto-Applying Feedback Improvements${NC}"
  echo -e "${YELLOW}========================================${NC}"

  # Invoke apply-reflect command to update the flow command
  echo -e "${BLUE}Applying improvements to command...${NC}"

  # The apply-reflect command expects the checkpoint and suggestions file
  if claude /flow:apply-reflect "$checkpoint" "$reflection_file" > "$WORK_DIR/apply_feedback_$(date +%Y%m%d_%H%M%S).log" 2>&1; then
    echo -e "${GREEN}✓ Command improvements applied successfully${NC}"

    # Update workflow status
    update_step_status "Generate $checkpoint" "feedback_applied"

    # Check if we should retry the step
    if [ "$APPROVAL_MODE" = "interactive" ]; then
      echo ""
      read -p "Retry the step with improved command? (y/n): " retry_choice
      if [ "$retry_choice" = "y" ] || [ "$retry_choice" = "Y" ]; then
        retry_step "$checkpoint"
      fi
    elif [ "$AUTO_RETRY_AFTER_FEEDBACK" = "true" ]; then
      echo -e "${BLUE}Auto-retrying step with improved command...${NC}"
      retry_step "$checkpoint"
    else
      echo -e "${YELLOW}Step not retried automatically. Workflow stopped for manual review.${NC}"
      echo -e "${YELLOW}To retry manually, restart the workflow.${NC}"
    fi
  else
    echo -e "${RED}✗ Failed to apply improvements${NC}"
    echo "Check the log file for details: $WORK_DIR/apply_feedback_*.log"
  fi
}

# Function to retry a specific workflow step
retry_step() {
  local checkpoint=$1

  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}Retrying Step: $checkpoint${NC}"
  echo -e "${BLUE}========================================${NC}"

  # Update workflow status to indicate retry
  update_step_status "Generate $checkpoint" "retrying"

  case $checkpoint in
    "PRD")
      echo -e "${YELLOW}Re-generating Product Requirements Document...${NC}"

      # Re-run PRD generation
      PRD_FILE="$WORK_DIR/prd_retry_$(date +%Y%m%d_%H%M%S).md"

      if [ -n "$FEATURE_FILE" ]; then
        claude /flow:prd < "$FEATURE_FILE" > "$PRD_FILE" 2>&1
      else
        echo "$FEATURE_DESC" | claude /flow:prd > "$PRD_FILE" 2>&1
      fi

      if [ -s "$PRD_FILE" ]; then
        echo -e "${GREEN}✓ PRD regenerated successfully${NC}"
        echo -e "  Output: $PRD_FILE"
        update_step_status "Generate PRD" "retry_completed"

        # Request approval for the new PRD
        request_approval "PRD" "$PRD_FILE"
      else
        echo -e "${RED}✗ PRD regeneration failed${NC}"
        update_step_status "Generate PRD" "retry_failed"
      fi
      ;;

    "Technical Design")
      echo -e "${YELLOW}Re-generating Technical Design Document...${NC}"

      # Find the PRD file
      local prd_file=$(find_workflow_file "prd_")
      if [ -z "$prd_file" ]; then
        echo -e "${RED}Error: PRD file not found${NC}"
        return 1
      fi

      # Re-run Technical Design generation (FIXED: pipe file path)
      TDD_FILE="$WORK_DIR/tdd_retry_$(date +%Y%m%d_%H%M%S).md"

      echo "$prd_file" | claude /flow:design > "$TDD_FILE" 2>&1

      if [ -s "$TDD_FILE" ]; then
        echo -e "${GREEN}✓ Technical Design regenerated successfully${NC}"
        echo -e "  Output: $TDD_FILE"
        update_step_status "Generate Technical Design" "retry_completed"

        # Request approval for the new design
        request_approval "Technical Design" "$TDD_FILE"
      else
        echo -e "${RED}✗ Technical Design regeneration failed${NC}"
        update_step_status "Generate Technical Design" "retry_failed"
      fi
      ;;

    "Task List")
      echo -e "${YELLOW}Re-generating Task List...${NC}"

      # Find the TDD file
      local tdd_file=$(find_workflow_file "tdd_")
      if [ -z "$tdd_file" ]; then
        echo -e "${RED}Error: Technical Design file not found${NC}"
        return 1
      fi

      # Re-run Task List generation (FIXED: pipe file path)
      TASKS_FILE="$WORK_DIR/tasks_retry_$(date +%Y%m%d_%H%M%S).md"

      echo "$tdd_file" | claude /flow:tasks > "$TASKS_FILE" 2>&1

      if [ -s "$TASKS_FILE" ]; then
        echo -e "${GREEN}✓ Task List regenerated successfully${NC}"
        echo -e "  Output: $TASKS_FILE"
        update_step_status "Generate Task List" "retry_completed"

        # Request approval for the new task list
        request_approval "Task List" "$TASKS_FILE"
      else
        echo -e "${RED}✗ Task List regeneration failed${NC}"
        update_step_status "Generate Task List" "retry_failed"
      fi
      ;;

    *)
      echo -e "${RED}Error: Unknown checkpoint '$checkpoint'${NC}"
      return 1
      ;;
  esac
}

# Function to wait for approval (enhanced with feedback support)
wait_for_approval() {
  local approval_file=$1
  local checkpoint=$2

  echo -e "${YELLOW}Waiting for approval...${NC}"
  echo -e "  Approval file: ${GREEN}$approval_file${NC}"
  echo -e "  To approve: echo '{\"status\":\"approved\"}' > ${approval_file}.response"
  echo -e "  To reject:  echo '{\"status\":\"rejected\"}' > ${approval_file}.response"
  echo -e "  To reject with feedback: echo '{\"status\":\"rejected\", \"feedback\": {...}}' > ${approval_file}.response"
  echo ""

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
          # Check if feedback was provided
          local has_feedback=$(python3 -c "import json; print('yes' if 'feedback' in json.load(open('$response_file')) else 'no')" 2>/dev/null || echo "no")

          if [ "$has_feedback" = "yes" ]; then
            echo -e "${YELLOW}✗ Rejected with feedback - processing feedback...${NC}"

            # Extract and process feedback
            local feedback=$(python3 -c "import json; print(json.dumps(json.load(open('$response_file')).get('feedback', {})))" 2>/dev/null || echo "{}")

            # Save feedback to a file
            local feedback_file="$WORK_DIR/.feedback_${checkpoint// /_}.json"
            echo "$feedback" > "$feedback_file"

            echo -e "${YELLOW}Feedback received:${NC}"
            echo "$feedback" | python3 -m json.tool 2>/dev/null || echo "$feedback"

            send_telemetry "Approval" "rejected_with_feedback" "{\"checkpoint\": \"$checkpoint\", \"has_feedback\": true}"

            # Invoke reflect command with feedback
            if [ -f "$feedback_file" ]; then
              echo -e "\n${YELLOW}Invoking reflection on feedback...${NC}"
              invoke_reflect_with_feedback "$checkpoint" "$feedback_file"
            fi
          else
            echo -e "${RED}✗ Rejected - workflow stopped${NC}"
            send_telemetry "Approval" "rejected" "{\"checkpoint\": \"$checkpoint\"}"
          fi

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
    "Execute Tasks") step_name="Execute Tasks" ;;
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
      # Special handling: Execute Tasks checkpoint ALWAYS requires approval
      if [ "$checkpoint" = "Execute Tasks" ]; then
        echo -e "${YELLOW}⚠️  Execute Tasks checkpoint requires explicit approval (safety measure)${NC}"
        local approval_file=$(create_approval_request "$checkpoint" "$file")
        wait_for_approval "$approval_file" "$checkpoint"
      else
        echo -e "${GREEN}✓ Auto-approved (APPROVAL_MODE=auto)${NC}\n"

        # Track auto-approval in Langfuse
        if [ "$TELEMETRY_ENABLED" = true ]; then
          python3 scripts/track-workflow-step.py approval \
            "$EXECUTION_ID" \
            "$checkpoint" \
            "approved" \
            "0" \
            "Auto-approved via APPROVAL_MODE=auto" 2>/dev/null || true
        fi

        return 0
      fi
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

      read -p "Approve and continue? (y/n/f for feedback): " approval

      case $approval in
        y|Y)
          echo -e "${GREEN}✓ Approved - continuing workflow${NC}\n"
          return 0
          ;;
        f|F)
          echo -e "${YELLOW}Please provide feedback:${NC}"
          echo -n "Specific issues: "
          read specific_issues
          echo -n "Missing elements: "
          read missing_elements
          echo -n "Suggested improvements: "
          read suggested_improvements
          echo -n "Rating (1-5): "
          read rating

          # Create feedback JSON
          local feedback_file="$WORK_DIR/.feedback_${checkpoint// /_}.json"
          cat > "$feedback_file" << EOF
{
  "specific_issues": "$specific_issues",
  "missing_elements": "$missing_elements",
  "suggested_improvements": "$suggested_improvements",
  "rating": "$rating",
  "timestamp": "$(date -Iseconds)"
}
EOF

          echo -e "${YELLOW}Processing feedback...${NC}"
          invoke_reflect_with_feedback "$checkpoint" "$feedback_file"
          echo -e "${RED}Workflow stopped for improvements${NC}"
          exit 1
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
  
  # Use the /prd command - pass feature description directly via stdin
  # Save feature description to file for workflow artifacts
  FEATURE_INPUT_FILE="$WORK_DIR/feature-description.md"
  echo "$FEATURE_DESC" > "$FEATURE_INPUT_FILE"

  # Invoke the /flow:prd command by piping the feature description directly
  # This avoids GitHub Issue #1048 with slash command argument passing
  if [ "$TELEMETRY_ENABLED" = true ] && [ -f "scripts/claude-with-telemetry.py" ]; then
    # For telemetry, pipe feature description directly
    echo "$FEATURE_DESC" | claude /flow:prd > "$PRD_FILE" 2>&1
  else
    # Direct invocation by piping content
    echo "$FEATURE_DESC" | claude /flow:prd > "$PRD_FILE" 2>&1
  fi
  
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
  
  # FIXED: Pipe the file path via stdin instead of using arguments
  # This matches the input processing method in design.md
  if [ "$TELEMETRY_ENABLED" = true ] && [ -f "scripts/claude-with-telemetry.py" ]; then
    # For telemetry, pipe the file path
    echo "$PRD_INPUT" | claude /flow:design > "$DESIGN_FILE" 2>&1
  else
    # Direct invocation by piping file path
    echo "$PRD_INPUT" | claude /flow:design > "$DESIGN_FILE" 2>&1
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
  
  # FIXED: Pipe the file path via stdin instead of using arguments
  # This matches the input processing method in tasks.md
  if [ "$TELEMETRY_ENABLED" = true ] && [ -f "scripts/claude-with-telemetry.py" ]; then
    # For telemetry, pipe the file path
    echo "$TDD_INPUT" | claude /flow:tasks > "$TASKS_FILE" 2>&1
  else
    # Direct invocation by piping file path
    echo "$TDD_INPUT" | claude /flow:tasks > "$TASKS_FILE" 2>&1
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

# Step 4: Execute Tasks (requires explicit approval)
log_step 4 "Execute Tasks" "start"

# Create a summary file for the Execute Tasks approval
EXECUTE_SUMMARY_FILE="$WORK_DIR/execute_tasks_summary.md"
cat > "$EXECUTE_SUMMARY_FILE" << EOF
# Task Execution Summary

## Ready to Execute Tasks

The following task list has been generated and approved:
- **Task List File**: $(basename "$TASKS_FILE")
- **Total Tasks**: $(grep -c "^##" "$TASKS_FILE" 2>/dev/null || echo "Unknown")
- **Timestamp**: $(date -Iseconds)

## What Will Happen

Upon approval, the system will:
1. Invoke the /execute-task command with the generated task list
2. Execute each task in sequence using TDD methodology
3. Generate test files and implementation code
4. Run tests and ensure all pass
5. Provide a complete execution report

## Safety Notice

⚠️ **This approval will trigger actual code generation and execution.**
- Review the task list carefully before approving
- Ensure you have backups if needed
- The process may create/modify multiple files

## Task List Preview

$(head -n 50 "$TASKS_FILE")

---
*Full task list available at: $TASKS_FILE*
EOF

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}⚠️  FINAL APPROVAL: Execute Tasks${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}This approval will trigger actual code execution!${NC}"
echo ""

# Request explicit approval for task execution (always required, even in auto mode)
request_approval "Execute Tasks" "$EXECUTE_SUMMARY_FILE"

# If we reach here, the user approved execution
echo -e "${GREEN}✓ Task execution approved by user${NC}"
echo -e "${BLUE}Invoking task execution command...${NC}"
echo ""

# Actually execute the tasks using the /execute-task command
if command -v claude &> /dev/null; then
  # Use extracted tasks file if available (cleaner, no JSON logs)
  TASKS_INPUT="$TASKS_FILE"
  if [ "$AUTO_EXTRACT" = true ]; then
    EXTRACTED_TASKS="docs/specs/$(basename "$WORK_DIR")/tasks_$(basename "$TASKS_FILE" | grep -oP '\d{8}').md"
    if [ -f "$EXTRACTED_TASKS" ] && [ -s "$EXTRACTED_TASKS" ]; then
      # Check if extracted file is actually clean (not just error message)
      if grep -q "^#" "$EXTRACTED_TASKS" 2>/dev/null; then
        TASKS_INPUT="$EXTRACTED_TASKS"
        echo -e "${GREEN}Using extracted tasks file: $EXTRACTED_TASKS${NC}"
      fi
    fi
  fi

  echo -e "${BLUE}Running: claude /flow:execute-task -p (piping: $TASKS_INPUT)${NC}"
  echo "$TASKS_INPUT" | claude /flow:execute-task -p
  execution_result=$?

  if [ $execution_result -eq 0 ]; then
    log_step 4 "Execute Tasks" "complete"
    update_step_status "Execute Tasks" "completed"
    echo -e "${GREEN}✓ Task execution completed successfully${NC}"
  else
    log_step 4 "Execute Tasks" "error"
    update_step_status "Execute Tasks" "failed"
    echo -e "${RED}✗ Task execution failed with exit code: $execution_result${NC}"
  fi
else
  echo -e "${YELLOW}Claude CLI not found. Manual execution required:${NC}"
  echo -e "${YELLOW}Run: echo \"$TASKS_FILE\" | claude /flow:execute-task -p${NC}"
  log_step 4 "Execute Tasks" "complete"
  update_step_status "Execute Tasks" "manual_required"
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
3. Execute tasks: \`echo "$TASKS_FILE" | claude /flow:execute-task -p\`
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

