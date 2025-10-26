#!/bin/bash
#
# Workflow Monitor and Approval Tool
# Monitor and interact with feature-to-code workflow approvals
#
# Usage:
#   ./workflow-monitor.sh                    # List all workflows
#   ./workflow-monitor.sh <execution_id>     # Monitor specific workflow
#   ./workflow-monitor.sh approve <file>     # Approve a pending request
#   ./workflow-monitor.sh reject <file>      # Reject a pending request
#   ./workflow-monitor.sh watch              # Watch for pending approvals
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

WORKFLOW_DIR="$(pwd)/workflow-outputs"

# Function to list all workflows
list_workflows() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}All Workflow Executions${NC}"
  echo -e "${BLUE}========================================${NC}\n"

  if [ ! -d "$WORKFLOW_DIR" ]; then
    echo -e "${YELLOW}No workflows found${NC}"
    return
  fi

  for dir in "$WORKFLOW_DIR"/*; do
    if [ -d "$dir" ]; then
      local exec_id=$(basename "$dir")
      local status_file="$dir/workflow-status.json"

      if [ -f "$status_file" ]; then
        local status=$(jq -r '.status' "$status_file" 2>/dev/null || echo "unknown")
        local started=$(jq -r '.started_at' "$status_file" 2>/dev/null || echo "unknown")
        local current_step=$(jq -r '.current_step // "none"' "$status_file" 2>/dev/null)

        case $status in
          awaiting_approval)
            echo -e "[$exec_id] ${YELLOW}⏳ Awaiting Approval${NC} - Step: $current_step"
            ;;
          approved|completed)
            echo -e "[$exec_id] ${GREEN}✓ $status${NC}"
            ;;
          rejected|failed|timeout)
            echo -e "[$exec_id] ${RED}✗ $status${NC}"
            ;;
          *)
            echo -e "[$exec_id] ${CYAN}● $status${NC}"
            ;;
        esac
        echo -e "  Started: $started"
        echo ""
      fi
    fi
  done
}

# Function to monitor specific workflow
monitor_workflow() {
  local exec_id=$1
  local work_dir="$WORKFLOW_DIR/$exec_id"

  if [ ! -d "$work_dir" ]; then
    echo -e "${RED}Error: Workflow $exec_id not found${NC}"
    exit 1
  fi

  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}Workflow: $exec_id${NC}"
  echo -e "${BLUE}========================================${NC}\n"

  # Show workflow status
  local status_file="$work_dir/workflow-status.json"
  if [ -f "$status_file" ]; then
    echo -e "${CYAN}Status:${NC}"
    jq '.' "$status_file"
    echo ""
  fi

  # Check for pending approvals
  echo -e "${CYAN}Approval Requests:${NC}"
  for approval_file in "$work_dir"/.approval_*.json; do
    if [ -f "$approval_file" ]; then
      local checkpoint=$(jq -r '.checkpoint' "$approval_file")
      local status=$(jq -r '.status' "$approval_file")
      local timestamp=$(jq -r '.timestamp' "$approval_file")

      case $status in
        pending)
          echo -e "  ${YELLOW}⏳ PENDING${NC}: $checkpoint"
          echo -e "     File: $approval_file"
          echo -e "     Created: $timestamp"
          echo -e "     To approve: ${GREEN}$0 approve $approval_file${NC}"
          echo -e "     To reject:  ${RED}$0 reject $approval_file${NC}"
          ;;
        approved)
          echo -e "  ${GREEN}✓ APPROVED${NC}: $checkpoint"
          ;;
        rejected)
          echo -e "  ${RED}✗ REJECTED${NC}: $checkpoint"
          ;;
        timeout)
          echo -e "  ${RED}⏱ TIMEOUT${NC}: $checkpoint"
          ;;
      esac
    fi
  done
  echo ""

  # Show generated files
  echo -e "${CYAN}Generated Files:${NC}"
  for file in "$work_dir"/*.md; do
    if [ -f "$file" ]; then
      echo -e "  $(basename "$file") ($(wc -c < "$file") bytes)"
    fi
  done
}

# Function to approve a pending request
approve_request() {
  local approval_file=$1

  if [ ! -f "$approval_file" ]; then
    echo -e "${RED}Error: Approval file not found${NC}"
    exit 1
  fi

  local status=$(jq -r '.status' "$approval_file")
  if [ "$status" != "pending" ]; then
    echo -e "${YELLOW}Warning: Request is not pending (status: $status)${NC}"
    exit 1
  fi

  # Create response file
  echo '{"status":"approved"}' > "${approval_file}.response"
  echo -e "${GREEN}✓ Approval sent${NC}"

  # Show what was approved
  local checkpoint=$(jq -r '.checkpoint' "$approval_file")
  echo -e "Approved: ${GREEN}$checkpoint${NC}"
}

# Function to reject a pending request
reject_request() {
  local approval_file=$1
  local reason="${2:-No reason provided}"

  if [ ! -f "$approval_file" ]; then
    echo -e "${RED}Error: Approval file not found${NC}"
    exit 1
  fi

  local status=$(jq -r '.status' "$approval_file")
  if [ "$status" != "pending" ]; then
    echo -e "${YELLOW}Warning: Request is not pending (status: $status)${NC}"
    exit 1
  fi

  # Create response file
  cat > "${approval_file}.response" << EOF
{
  "status": "rejected",
  "reason": "$reason"
}
EOF
  echo -e "${RED}✗ Rejection sent${NC}"

  # Show what was rejected
  local checkpoint=$(jq -r '.checkpoint' "$approval_file")
  echo -e "Rejected: ${RED}$checkpoint${NC}"
  echo -e "Reason: $reason"
}

# Function to watch for pending approvals
watch_approvals() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}Watching for Pending Approvals${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"

  while true; do
    local found_pending=false

    for dir in "$WORKFLOW_DIR"/*; do
      if [ -d "$dir" ]; then
        for approval_file in "$dir"/.approval_*.json; do
          if [ -f "$approval_file" ]; then
            local status=$(jq -r '.status' "$approval_file" 2>/dev/null)
            if [ "$status" = "pending" ]; then
              if [ "$found_pending" = false ]; then
                echo -e "\n${CYAN}=== Pending Approvals ($(date '+%H:%M:%S')) ===${NC}"
                found_pending=true
              fi

              local exec_id=$(basename "$dir")
              local checkpoint=$(jq -r '.checkpoint' "$approval_file")
              local timestamp=$(jq -r '.timestamp' "$approval_file")
              local file=$(jq -r '.file' "$approval_file")

              echo -e "\n${YELLOW}⏳ PENDING APPROVAL${NC}"
              echo -e "  Execution: $exec_id"
              echo -e "  Checkpoint: $checkpoint"
              echo -e "  File: $(basename "$file")"
              echo -e "  Since: $timestamp"
              echo -e "  ${GREEN}Approve:${NC} $0 approve $approval_file"
              echo -e "  ${RED}Reject:${NC}  $0 reject $approval_file \"reason\""
            fi
          fi
        done
      fi
    done

    if [ "$found_pending" = false ]; then
      echo -ne "\r${CYAN}No pending approvals... ($(date '+%H:%M:%S'))${NC}"
    fi

    sleep 5
  done
}

# Main command handling
case "${1:-list}" in
  list)
    list_workflows
    ;;

  watch)
    watch_approvals
    ;;

  approve)
    if [ -z "$2" ]; then
      echo -e "${RED}Error: Approval file required${NC}"
      echo "Usage: $0 approve <approval_file>"
      exit 1
    fi
    approve_request "$2"
    ;;

  reject)
    if [ -z "$2" ]; then
      echo -e "${RED}Error: Approval file required${NC}"
      echo "Usage: $0 reject <approval_file> [reason]"
      exit 1
    fi
    reject_request "$2" "${3:-No reason provided}"
    ;;

  *)
    # Assume it's an execution ID
    monitor_workflow "$1"
    ;;
esac