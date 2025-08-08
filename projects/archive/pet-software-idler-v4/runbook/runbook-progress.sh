#!/bin/bash

# Runbook Progress Tracking Script
# Usage: ./runbook-progress.sh [runbook_directory]

RUNBOOK_DIR="${1:-./}"
PROGRESS_FILE="$RUNBOOK_DIR/progress.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize progress file if it doesn't exist
init_progress_file() {
    if [ ! -f "$PROGRESS_FILE" ]; then
        cat > "$PROGRESS_FILE" << 'EOF'
{
  "phases": {
    "foundation": {
      "status": "pending",
      "completed_tasks": 0,
      "total_tasks": 10,
      "tasks": []
    },
    "core_features": {
      "status": "pending",
      "completed_tasks": 0,
      "total_tasks": 15,
      "tasks": []
    },
    "integration": {
      "status": "pending",
      "completed_tasks": 0,
      "total_tasks": 12,
      "tasks": []
    },
    "quality": {
      "status": "pending",
      "completed_tasks": 0,
      "total_tasks": 10,
      "tasks": []
    },
    "deployment": {
      "status": "pending",
      "completed_tasks": 0,
      "total_tasks": 8,
      "tasks": []
    }
  },
  "overall": {
    "started_at": null,
    "last_updated": null,
    "total_progress": 0
  }
}
EOF
        echo -e "${GREEN}✓${NC} Initialized progress.json"
    fi
}

# Display progress bar
progress_bar() {
    local current=$1
    local total=$2
    local width=30
    
    if [ $total -eq 0 ]; then
        percent=0
    else
        percent=$((current * 100 / total))
    fi
    
    completed=$((width * current / total))
    remaining=$((width - completed))
    
    printf "["
    printf "%${completed}s" | tr ' ' '█'
    printf "%${remaining}s" | tr ' ' '░'
    printf "] %3d%%" $percent
}

# Display phase status
display_phase_status() {
    local phase_name=$1
    local status=$2
    local completed=$3
    local total=$4
    
    case $status in
        "completed")
            echo -e "${GREEN}✓${NC} $phase_name $(progress_bar $completed $total)"
            ;;
        "in_progress")
            echo -e "${YELLOW}⚡${NC} $phase_name $(progress_bar $completed $total)"
            ;;
        "pending")
            echo -e "${BLUE}○${NC} $phase_name $(progress_bar $completed $total)"
            ;;
        *)
            echo -e "${RED}✗${NC} $phase_name $(progress_bar $completed $total)"
            ;;
    esac
}

# Main display function
display_progress() {
    clear
    echo "════════════════════════════════════════════════════════════════"
    echo "                    RUNBOOK PROGRESS TRACKER                    "
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Directory: $RUNBOOK_DIR"
    echo ""
    
    if [ ! -f "$PROGRESS_FILE" ]; then
        echo -e "${RED}No progress.json found. Run with --init to create one.${NC}"
        exit 1
    fi
    
    # Parse JSON and display progress (using Python for JSON parsing)
    python3 << 'PYTHON_SCRIPT'
import json
import sys
import os

progress_file = os.environ.get('PROGRESS_FILE', 'progress.json')

try:
    with open(progress_file, 'r') as f:
        data = json.load(f)
    
    phases = data.get('phases', {})
    
    # Phase display names
    phase_names = {
        'foundation': '1. Foundation       ',
        'core_features': '2. Core Features    ',
        'integration': '3. Integration      ',
        'quality': '4. Quality          ',
        'deployment': '5. Deployment       '
    }
    
    total_completed = 0
    total_tasks = 0
    
    for phase_key, phase_name in phase_names.items():
        if phase_key in phases:
            phase = phases[phase_key]
            completed = phase.get('completed_tasks', 0)
            total = phase.get('total_tasks', 0)
            status = phase.get('status', 'pending')
            
            total_completed += completed
            total_tasks += total
            
            # Call bash function to display
            os.system(f"display_phase_status '{phase_name}' '{status}' {completed} {total}")
    
    print("\n────────────────────────────────────────────────────────────────")
    overall_percent = (total_completed * 100 // total_tasks) if total_tasks > 0 else 0
    print(f"\nOVERALL PROGRESS: {total_completed}/{total_tasks} tasks ({overall_percent}%)")
    
    # Display time tracking if available
    overall = data.get('overall', {})
    if overall.get('started_at'):
        print(f"Started: {overall['started_at']}")
    if overall.get('last_updated'):
        print(f"Last Updated: {overall['last_updated']}")
        
except FileNotFoundError:
    print(f"Error: {progress_file} not found")
    sys.exit(1)
except json.JSONDecodeError:
    print(f"Error: Invalid JSON in {progress_file}")
    sys.exit(1)
PYTHON_SCRIPT
    
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Commands:"
    echo "  ./runbook-progress.sh update <phase> <completed_tasks>"
    echo "  ./runbook-progress.sh complete <phase>"
    echo "  ./runbook-progress.sh reset"
    echo ""
}

# Update phase progress
update_phase() {
    local phase=$1
    local completed=$2
    
    python3 << PYTHON_SCRIPT
import json
import sys
from datetime import datetime

progress_file = "$PROGRESS_FILE"
phase = "$phase"
completed = int("$completed")

try:
    with open(progress_file, 'r') as f:
        data = json.load(f)
    
    if phase in data['phases']:
        data['phases'][phase]['completed_tasks'] = completed
        total = data['phases'][phase]['total_tasks']
        
        if completed == 0:
            data['phases'][phase]['status'] = 'pending'
        elif completed >= total:
            data['phases'][phase]['status'] = 'completed'
        else:
            data['phases'][phase]['status'] = 'in_progress'
        
        # Update overall tracking
        if not data['overall'].get('started_at'):
            data['overall']['started_at'] = datetime.now().isoformat()
        data['overall']['last_updated'] = datetime.now().isoformat()
        
        # Calculate total progress
        total_completed = sum(p['completed_tasks'] for p in data['phases'].values())
        total_tasks = sum(p['total_tasks'] for p in data['phases'].values())
        data['overall']['total_progress'] = (total_completed * 100 // total_tasks) if total_tasks > 0 else 0
        
        with open(progress_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"✓ Updated {phase}: {completed}/{total} tasks")
    else:
        print(f"Error: Unknown phase '{phase}'")
        sys.exit(1)
        
except Exception as e:
    print(f"Error updating progress: {e}")
    sys.exit(1)
PYTHON_SCRIPT
}

# Mark phase as complete
complete_phase() {
    local phase=$1
    
    python3 << PYTHON_SCRIPT
import json
import sys

progress_file = "$PROGRESS_FILE"
phase = "$phase"

try:
    with open(progress_file, 'r') as f:
        data = json.load(f)
    
    if phase in data['phases']:
        total = data['phases'][phase]['total_tasks']
        update_phase "$phase" "$total"
    else:
        print(f"Error: Unknown phase '{phase}'")
        sys.exit(1)
        
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
PYTHON_SCRIPT
}

# Reset progress
reset_progress() {
    rm -f "$PROGRESS_FILE"
    init_progress_file
    echo -e "${GREEN}✓${NC} Progress reset"
}

# Export functions for Python subprocess
export -f display_phase_status
export -f progress_bar
export PROGRESS_FILE

# Main script logic
case "${2:-display}" in
    "")
        init_progress_file
        display_progress
        ;;
    "update")
        if [ -z "$3" ] || [ -z "$4" ]; then
            echo "Usage: $0 update <phase> <completed_tasks>"
            exit 1
        fi
        update_phase "$3" "$4"
        display_progress
        ;;
    "complete")
        if [ -z "$3" ]; then
            echo "Usage: $0 complete <phase>"
            exit 1
        fi
        complete_phase "$3"
        display_progress
        ;;
    "reset")
        read -p "Are you sure you want to reset all progress? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            reset_progress
        fi
        ;;
    "--init")
        init_progress_file
        ;;
    *)
        echo "Unknown command: $2"
        echo "Usage: $0 [runbook_dir] [update|complete|reset|--init]"
        exit 1
        ;;
esac