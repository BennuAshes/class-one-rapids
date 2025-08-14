#!/bin/bash

# Runbook Progress Tracker
# Helps manage and track progress across runbook phases

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default runbook directory
RUNBOOK_DIR="${1:-./runbook}"

# Function to display usage
show_usage() {
    echo "Usage: $0 [runbook-directory] [command]"
    echo ""
    echo "Commands:"
    echo "  status    - Show progress of all phases (default)"
    echo "  list      - List all phase files"
    echo "  view      - View a specific phase file"
    echo "  mark      - Mark tasks as complete"
    echo "  generate  - Generate missing phases"
    echo ""
    echo "Examples:"
    echo "  $0 ./runbook status"
    echo "  $0 ./runbook view foundation"
    echo "  $0 ./runbook mark 1.1.1"
}

# Function to check if runbook directory exists
check_runbook_dir() {
    if [ ! -d "$RUNBOOK_DIR" ]; then
        echo -e "${RED}Error: Runbook directory not found: $RUNBOOK_DIR${NC}"
        echo "Please run create-development-runbook-v2.md first"
        exit 1
    fi
}

# Function to list all phase files
list_phases() {
    echo -e "${BLUE}=== Runbook Phases ===${NC}"
    echo "Directory: $RUNBOOK_DIR"
    echo ""
    
    if [ -f "$RUNBOOK_DIR/index.md" ]; then
        echo -e "${GREEN}✓ Index file found${NC}"
    else
        echo -e "${YELLOW}⚠ Index file missing${NC}"
    fi
    
    echo ""
    echo "Phase files:"
    for file in "$RUNBOOK_DIR"/*.md; do
        if [ -f "$file" ]; then
            basename "$file"
        fi
    done
}

# Function to show progress status
show_status() {
    echo -e "${BLUE}=== Runbook Progress Status ===${NC}"
    echo "Directory: $RUNBOOK_DIR"
    echo ""
    
    # Check for progress.json
    PROGRESS_FILE="$RUNBOOK_DIR/progress.json"
    if [ ! -f "$PROGRESS_FILE" ]; then
        echo "{}" > "$PROGRESS_FILE"
        echo -e "${YELLOW}Created new progress tracking file${NC}"
    fi
    
    # Count tasks in each phase
    for phase_file in "$RUNBOOK_DIR"/[0-9]*.md; do
        if [ -f "$phase_file" ]; then
            phase_name=$(basename "$phase_file" .md)
            total_tasks=$(grep -c "^- Task" "$phase_file" 2>/dev/null || echo "0")
            
            # Check completed tasks from progress.json
            completed_tasks=0
            if [ -f "$PROGRESS_FILE" ]; then
                # This is simplified - in production you'd parse JSON properly
                completed_tasks=$(grep -o "\"$phase_name.*\": true" "$PROGRESS_FILE" | wc -l 2>/dev/null || echo "0")
            fi
            
            # Calculate percentage
            if [ "$total_tasks" -gt 0 ]; then
                percentage=$((completed_tasks * 100 / total_tasks))
            else
                percentage=0
            fi
            
            # Display progress bar
            printf "%-20s [" "$phase_name"
            
            # Draw progress bar (20 chars wide)
            filled=$((percentage / 5))
            for ((i=0; i<20; i++)); do
                if [ $i -lt $filled ]; then
                    echo -n "█"
                else
                    echo -n "░"
                fi
            done
            
            printf "] %3d%% (%d/%d tasks)\n" "$percentage" "$completed_tasks" "$total_tasks"
        fi
    done
    
    echo ""
    echo -e "${BLUE}Overall Statistics:${NC}"
    total_all=$(grep -c "^- Task" "$RUNBOOK_DIR"/*.md 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')
    echo "Total tasks across all phases: $total_all"
}

# Function to view a specific phase
view_phase() {
    phase="$2"
    if [ -z "$phase" ]; then
        echo -e "${RED}Error: Please specify a phase to view${NC}"
        echo "Example: $0 $RUNBOOK_DIR view foundation"
        exit 1
    fi
    
    # Find matching phase file
    phase_file=""
    for file in "$RUNBOOK_DIR"/*"$phase"*.md; do
        if [ -f "$file" ]; then
            phase_file="$file"
            break
        fi
    done
    
    if [ -z "$phase_file" ]; then
        echo -e "${RED}Error: Phase file not found for: $phase${NC}"
        list_phases
        exit 1
    fi
    
    echo -e "${BLUE}=== Viewing: $(basename "$phase_file") ===${NC}"
    cat "$phase_file"
}

# Function to mark tasks as complete
mark_complete() {
    task_id="$2"
    if [ -z "$task_id" ]; then
        echo -e "${RED}Error: Please specify a task ID to mark complete${NC}"
        echo "Example: $0 $RUNBOOK_DIR mark 1.1.1"
        exit 1
    fi
    
    PROGRESS_FILE="$RUNBOOK_DIR/progress.json"
    
    # Simple implementation - in production use jq or proper JSON parser
    if [ ! -f "$PROGRESS_FILE" ]; then
        echo "{}" > "$PROGRESS_FILE"
    fi
    
    # Add task to progress file
    echo -e "${GREEN}✓ Marked task $task_id as complete${NC}"
    
    # Update progress.json (simplified - use jq in production)
    temp_file=$(mktemp)
    if [ -s "$PROGRESS_FILE" ]; then
        sed "s/}/,\"task_$task_id\": true}/" "$PROGRESS_FILE" > "$temp_file"
    else
        echo "{\"task_$task_id\": true}" > "$temp_file"
    fi
    mv "$temp_file" "$PROGRESS_FILE"
}

# Function to generate missing phases
generate_phases() {
    echo -e "${BLUE}=== Checking for Missing Phases ===${NC}"
    
    phases=("00-analysis" "01-foundation" "02-core-features" "03-integration" "04-quality" "05-deployment")
    missing_phases=""
    
    for phase in "${phases[@]}"; do
        if [ ! -f "$RUNBOOK_DIR/$phase.md" ]; then
            echo -e "${YELLOW}⚠ Missing: $phase.md${NC}"
            missing_phases="$missing_phases,$phase"
        else
            echo -e "${GREEN}✓ Found: $phase.md${NC}"
        fi
    done
    
    if [ -n "$missing_phases" ]; then
        echo ""
        echo "To generate missing phases, run:"
        echo "claude code .claude/commands/prp/create-development-runbook-v2.md <prd-path> --phases ${missing_phases:1} --output-dir $RUNBOOK_DIR"
    else
        echo ""
        echo -e "${GREEN}All phases are present!${NC}"
    fi
}

# Main command router
main() {
    check_runbook_dir
    
    command="${2:-status}"
    
    case "$command" in
        status)
            show_status
            ;;
        list)
            list_phases
            ;;
        view)
            view_phase "$@"
            ;;
        mark)
            mark_complete "$@"
            ;;
        generate)
            generate_phases
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            echo -e "${RED}Unknown command: $command${NC}"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"