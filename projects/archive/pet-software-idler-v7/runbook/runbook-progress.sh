#!/bin/bash

# PetSoft Tycoon Runbook Progress Tracker
# Usage: ./runbook-progress.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "jq is required but not installed. Install with: apt-get install jq"
    exit 1
fi

# Check if progress.json exists
if [ ! -f "progress.json" ]; then
    echo "progress.json not found in current directory"
    exit 1
fi

# Read progress data
PROGRESS_DATA=$(cat progress.json)

# Extract metadata
TOTAL_TASKS=$(echo "$PROGRESS_DATA" | jq -r '.metadata.totalTasks')
COMPLETED_TASKS=$(echo "$PROGRESS_DATA" | jq -r '.metadata.completedTasks')
CURRENT_PHASE=$(echo "$PROGRESS_DATA" | jq -r '.metadata.currentPhase')
START_DATE=$(echo "$PROGRESS_DATA" | jq -r '.metadata.startDate')
TARGET_DATE=$(echo "$PROGRESS_DATA" | jq -r '.metadata.targetCompletion')
PLATFORM=$(echo "$PROGRESS_DATA" | jq -r '.metadata.platformDecision')

# Calculate progress percentage
if [ "$TOTAL_TASKS" -gt 0 ]; then
    PROGRESS_PERCENT=$((COMPLETED_TASKS * 100 / TOTAL_TASKS))
else
    PROGRESS_PERCENT=0
fi

# Display header
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           PetSoft Tycoon - Runbook Progress               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Display metadata
echo -e "${BLUE}Project Information:${NC}"
echo "  Platform: $PLATFORM"
echo "  Start Date: $START_DATE"
echo "  Target Completion: $TARGET_DATE"
echo ""

# Display overall progress
echo -e "${BLUE}Overall Progress:${NC}"
echo -n "  ["
for i in $(seq 1 20); do
    if [ $((i * 5)) -le $PROGRESS_PERCENT ]; then
        echo -n "█"
    else
        echo -n "░"
    fi
done
echo "] ${PROGRESS_PERCENT}% ($COMPLETED_TASKS/$TOTAL_TASKS tasks)"
echo ""

# Display phase status
echo -e "${BLUE}Phase Status:${NC}"
for phase in 0 1 2 3 4 5; do
    PHASE_NAME=$(echo "$PROGRESS_DATA" | jq -r ".phases.\"$phase\".name")
    PHASE_STATUS=$(echo "$PROGRESS_DATA" | jq -r ".phases.\"$phase\".status")
    
    # Count tasks in phase
    PHASE_TASKS=$(echo "$PROGRESS_DATA" | jq -r ".phases.\"$phase\".tasks | length")
    if [ "$PHASE_TASKS" = "null" ]; then
        PHASE_TASKS=0
    fi
    
    PHASE_COMPLETED=0
    if [ "$PHASE_TASKS" -gt 0 ]; then
        PHASE_COMPLETED=$(echo "$PROGRESS_DATA" | jq -r ".phases.\"$phase\".tasks | to_entries | map(select(.value.status == \"completed\")) | length")
    fi
    
    # Choose color based on status
    case $PHASE_STATUS in
        "completed")
            COLOR=$GREEN
            ICON="✓"
            ;;
        "in_progress")
            COLOR=$YELLOW
            ICON="→"
            ;;
        *)
            COLOR=$NC
            ICON=" "
            ;;
    esac
    
    # Display phase info
    printf "  ${COLOR}[%s] Phase %d: %-20s" "$ICON" "$phase" "$PHASE_NAME"
    if [ "$PHASE_TASKS" -gt 0 ]; then
        printf "(%d/%d tasks)${NC}\n" "$PHASE_COMPLETED" "$PHASE_TASKS"
    else
        printf "${NC}\n"
    fi
done

echo ""

# Display current phase details if in progress
for phase in 0 1 2 3 4 5; do
    PHASE_STATUS=$(echo "$PROGRESS_DATA" | jq -r ".phases.\"$phase\".status")
    if [ "$PHASE_STATUS" = "in_progress" ]; then
        PHASE_NAME=$(echo "$PROGRESS_DATA" | jq -r ".phases.\"$phase\".name")
        echo -e "${BLUE}Current Phase Details - $PHASE_NAME:${NC}"
        
        # List tasks in current phase
        TASKS=$(echo "$PROGRESS_DATA" | jq -r ".phases.\"$phase\".tasks | to_entries | .[]")
        
        echo "$TASKS" | jq -r '. | "\(.key): \(.value.name) [\(.value.status)]"' | while IFS= read -r line; do
            if [[ "$line" == *"[completed]"* ]]; then
                echo -e "  ${GREEN}✓ $line${NC}"
            elif [[ "$line" == *"[in_progress]"* ]]; then
                echo -e "  ${YELLOW}→ $line${NC}"
            else
                echo "    $line"
            fi
        done
        break
    fi
done

echo ""

# Display important notes
NOTES=$(echo "$PROGRESS_DATA" | jq -r '.notes | to_entries | .[] | "  • \(.key): \(.value)"')
if [ -n "$NOTES" ]; then
    echo -e "${BLUE}Important Notes:${NC}"
    echo "$NOTES"
    echo ""
fi

# Display next actions
echo -e "${BLUE}Next Actions:${NC}"
FOUND_NEXT=false
for phase in 0 1 2 3 4 5; do
    PHASE_STATUS=$(echo "$PROGRESS_DATA" | jq -r ".phases.\"$phase\".status")
    if [ "$PHASE_STATUS" != "completed" ] && [ "$FOUND_NEXT" = false ]; then
        PHASE_NAME=$(echo "$PROGRESS_DATA" | jq -r ".phases.\"$phase\".name")
        
        # Find next pending task
        NEXT_TASK=$(echo "$PROGRESS_DATA" | jq -r ".phases.\"$phase\".tasks | to_entries | map(select(.value.status == \"pending\")) | .[0]")
        
        if [ "$NEXT_TASK" != "null" ]; then
            TASK_ID=$(echo "$NEXT_TASK" | jq -r '.key')
            TASK_NAME=$(echo "$NEXT_TASK" | jq -r '.value.name')
            echo "  1. Start Task $TASK_ID: $TASK_NAME (Phase $phase: $PHASE_NAME)"
            echo "  2. Refer to $(printf "%02d" $phase)-*.md for implementation details"
            FOUND_NEXT=true
        fi
    fi
done

if [ "$FOUND_NEXT" = false ]; then
    if [ "$PROGRESS_PERCENT" -eq 100 ]; then
        echo -e "  ${GREEN}✓ All tasks completed! Ready for launch!${NC}"
    else
        echo "  Review progress.json for task status"
    fi
fi

echo ""
echo "════════════════════════════════════════════════════════════"