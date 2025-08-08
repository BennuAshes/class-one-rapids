#!/bin/bash

# Runbook Progress Tracking Script
# Track and update progress through implementation phases

RUNBOOK_DIR="./runbook"
PROGRESS_FILE="$RUNBOOK_DIR/progress.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize progress file if it doesn't exist
init_progress() {
    if [ ! -f "$PROGRESS_FILE" ]; then
        cat > "$PROGRESS_FILE" << 'EOF'
{
  "phases": {
    "0": {
      "name": "Analysis",
      "status": "completed",
      "tasks": {},
      "completedAt": "2025-08-07"
    },
    "1": {
      "name": "Foundation",
      "status": "pending",
      "tasks": {
        "1.1.1": {"name": "Initialize Project", "status": "pending"},
        "1.1.2": {"name": "Install Core Dependencies", "status": "pending"},
        "1.1.3": {"name": "Configure TypeScript", "status": "pending"},
        "1.2.1": {"name": "Create Directory Structure", "status": "pending"},
        "1.2.2": {"name": "Define Core Types", "status": "pending"},
        "1.3.1": {"name": "Initialize Legend State Store", "status": "pending"},
        "1.3.2": {"name": "Create State Hooks", "status": "pending"},
        "1.4.1": {"name": "Create Main Game Layout", "status": "pending"},
        "1.4.2": {"name": "Implement Resource Display", "status": "pending"},
        "1.5.1": {"name": "Configure Testing Framework", "status": "pending"},
        "1.5.2": {"name": "Write Initial Tests", "status": "pending"},
        "1.6.1": {"name": "Set Up Development Scripts", "status": "pending"},
        "1.6.2": {"name": "Configure Git Hooks", "status": "pending"}
      }
    },
    "2": {
      "name": "Core Features",
      "status": "pending",
      "tasks": {
        "2.1.1": {"name": "Create WriteCodeButton Component", "status": "pending"},
        "2.1.2": {"name": "Add Click Feedback System", "status": "pending"},
        "2.1.3": {"name": "Implement Click Rate Limiting", "status": "pending"},
        "2.2.1": {"name": "Create Feature Conversion Logic", "status": "pending"},
        "2.2.2": {"name": "Implement Feature-to-Money Conversion", "status": "pending"},
        "2.2.3": {"name": "Create Conversion UI Components", "status": "pending"},
        "2.3.1": {"name": "Create Employee Data Structure", "status": "pending"},
        "2.3.2": {"name": "Implement Hiring Mechanics", "status": "pending"},
        "2.3.3": {"name": "Build Hiring UI", "status": "pending"},
        "2.4.1": {"name": "Implement Game Loop", "status": "pending"},
        "2.4.2": {"name": "Calculate Production Rates", "status": "pending"},
        "2.4.3": {"name": "Create Production Display", "status": "pending"},
        "2.5.1": {"name": "Create Department Structure", "status": "pending"},
        "2.5.2": {"name": "Implement Department Unlocking", "status": "pending"},
        "2.5.3": {"name": "Build Department Panel UI", "status": "pending"},
        "2.6.1": {"name": "Implement Auto-Save", "status": "pending"},
        "2.6.2": {"name": "Create Load System", "status": "pending"}
      }
    },
    "3": {
      "name": "Integration",
      "status": "pending",
      "tasks": {
        "3.1.1": {"name": "Design Synergy Rules", "status": "pending"},
        "3.1.2": {"name": "Implement Synergy Calculator", "status": "pending"},
        "3.1.3": {"name": "Create Synergy UI Indicators", "status": "pending"},
        "3.2.1": {"name": "Implement Manager System", "status": "pending"},
        "3.2.2": {"name": "Build Automation Engine", "status": "pending"},
        "3.2.3": {"name": "Create Manager UI Controls", "status": "pending"},
        "3.3.1": {"name": "Implement Offline Calculator", "status": "pending"},
        "3.3.2": {"name": "Create Offline Progress UI", "status": "pending"},
        "3.4.1": {"name": "Define Achievement Data", "status": "pending"},
        "3.4.2": {"name": "Build Achievement Tracker", "status": "pending"},
        "3.4.3": {"name": "Create Achievement UI", "status": "pending"},
        "3.5.1": {"name": "Implement Prestige Logic", "status": "pending"},
        "3.5.2": {"name": "Create Prestige UI", "status": "pending"},
        "3.6.1": {"name": "Implement Retention Mechanics", "status": "pending"},
        "3.6.2": {"name": "Build Customer UI Elements", "status": "pending"}
      }
    },
    "4": {
      "name": "Quality",
      "status": "pending",
      "tasks": {
        "4.1.1": {"name": "Test Game Logic", "status": "pending"},
        "4.1.2": {"name": "Test State Management", "status": "pending"},
        "4.1.3": {"name": "Test Components", "status": "pending"},
        "4.2.1": {"name": "Test Game Flows", "status": "pending"},
        "4.2.2": {"name": "Test Save/Load Cycle", "status": "pending"},
        "4.3.1": {"name": "Profile and Optimize", "status": "pending"},
        "4.3.2": {"name": "Memory Management", "status": "pending"},
        "4.3.3": {"name": "Bundle Optimization", "status": "pending"},
        "4.4.1": {"name": "Test Browser Compatibility", "status": "pending"},
        "4.4.2": {"name": "Fix Compatibility Issues", "status": "pending"},
        "4.5.1": {"name": "Implement Keyboard Navigation", "status": "pending"},
        "4.5.2": {"name": "Add Screen Reader Support", "status": "pending"},
        "4.6.1": {"name": "Visual Polish", "status": "pending"},
        "4.6.2": {"name": "Audio Polish", "status": "pending"},
        "4.6.3": {"name": "Fix Critical Bugs", "status": "pending"}
      }
    },
    "5": {
      "name": "Deployment",
      "status": "pending",
      "tasks": {
        "5.1.1": {"name": "Configure Production Build", "status": "pending"},
        "5.1.2": {"name": "Optimize Assets", "status": "pending"},
        "5.1.3": {"name": "Create Build Pipeline", "status": "pending"},
        "5.2.1": {"name": "Configure Hosting", "status": "pending"},
        "5.2.2": {"name": "Set Up CDN", "status": "pending"},
        "5.3.1": {"name": "Implement Error Tracking", "status": "pending"},
        "5.3.2": {"name": "Add Performance Monitoring", "status": "pending"},
        "5.3.3": {"name": "Set Up Analytics", "status": "pending"},
        "5.4.1": {"name": "Create Player Guide", "status": "pending"},
        "5.4.2": {"name": "Technical Documentation", "status": "pending"},
        "5.5.1": {"name": "Pre-Launch Checklist", "status": "pending"},
        "5.5.2": {"name": "Create Backup Plan", "status": "pending"},
        "5.5.3": {"name": "Soft Launch", "status": "pending"},
        "5.6.1": {"name": "Monitor Launch Metrics", "status": "pending"},
        "5.6.2": {"name": "Prepare Hotfix Process", "status": "pending"}
      }
    }
  },
  "metadata": {
    "startDate": "2025-08-07",
    "lastUpdated": "2025-08-07",
    "totalTasks": 71,
    "completedTasks": 0,
    "currentPhase": 1
  }
}
EOF
        echo -e "${GREEN}✓${NC} Progress file initialized"
    fi
}

# Show overall progress
show_progress() {
    if [ ! -f "$PROGRESS_FILE" ]; then
        init_progress
    fi
    
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}     PetSoft Tycoon Implementation Progress${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo
    
    # Parse progress file using Python for JSON handling
    python3 - <<EOF
import json
import sys

with open('$PROGRESS_FILE', 'r') as f:
    data = json.load(f)

phases = data['phases']
metadata = data['metadata']

print(f"Started: {metadata['startDate']}")
print(f"Last Updated: {metadata['lastUpdated']}")
print(f"Total Progress: {metadata['completedTasks']}/{metadata['totalTasks']} tasks")
print()

for phase_id in sorted(phases.keys()):
    phase = phases[phase_id]
    tasks = phase.get('tasks', {})
    completed = sum(1 for t in tasks.values() if t['status'] == 'completed')
    total = len(tasks)
    
    # Status indicator
    if phase['status'] == 'completed':
        status = "✅"
        color = "\033[0;32m"  # Green
    elif phase['status'] == 'in_progress':
        status = "🔄"
        color = "\033[1;33m"  # Yellow
    else:
        status = "⏳"
        color = "\033[0;34m"  # Blue
    
    # Progress bar
    if total > 0:
        progress = int((completed / total) * 20)
        bar = "█" * progress + "░" * (20 - progress)
        percent = int((completed / total) * 100)
    else:
        bar = "█" * 20
        percent = 100
    
    print(f"{color}Phase {phase_id}: {phase['name']:<15} {status} [{bar}] {percent:3}% ({completed}/{total})\033[0m")
    
    # Show current tasks if phase is in progress
    if phase['status'] == 'in_progress' and tasks:
        for task_id, task in sorted(tasks.items()):
            if task['status'] == 'in_progress':
                print(f"         └─ 🔄 {task_id}: {task['name']}")

print()
print("Legend: ✅ Complete | 🔄 In Progress | ⏳ Pending")
EOF
}

# Mark a task as complete
mark_complete() {
    local task_id=$1
    
    if [ -z "$task_id" ]; then
        echo -e "${RED}Error:${NC} Please provide a task ID (e.g., 1.1.1)"
        exit 1
    fi
    
    python3 - <<EOF
import json
import sys
from datetime import datetime

task_id = '$task_id'

with open('$PROGRESS_FILE', 'r') as f:
    data = json.load(f)

# Find the task
found = False
for phase_id, phase in data['phases'].items():
    if 'tasks' in phase and task_id in phase['tasks']:
        phase['tasks'][task_id]['status'] = 'completed'
        found = True
        
        # Update phase status if all tasks complete
        all_complete = all(t['status'] == 'completed' for t in phase['tasks'].values())
        if all_complete:
            phase['status'] = 'completed'
            phase['completedAt'] = datetime.now().strftime('%Y-%m-%d')
            
            # Start next phase
            next_phase = str(int(phase_id) + 1)
            if next_phase in data['phases']:
                data['phases'][next_phase]['status'] = 'in_progress'
                data['metadata']['currentPhase'] = int(next_phase)
        
        # Update metadata
        data['metadata']['lastUpdated'] = datetime.now().strftime('%Y-%m-%d')
        total = sum(1 for t in phase['tasks'].values() if t['status'] == 'completed')
        data['metadata']['completedTasks'] = sum(
            sum(1 for t in p.get('tasks', {}).values() if t['status'] == 'completed')
            for p in data['phases'].values()
        )
        
        print(f"✅ Task {task_id} marked as complete")
        break

if not found:
    print(f"❌ Task {task_id} not found")
    sys.exit(1)

with open('$PROGRESS_FILE', 'w') as f:
    json.dump(data, f, indent=2)
EOF
}

# Show specific phase details
show_phase() {
    local phase_id=$1
    
    python3 - <<EOF
import json

with open('$PROGRESS_FILE', 'r') as f:
    data = json.load(f)

phase_id = '$phase_id'
if phase_id not in data['phases']:
    print(f"❌ Phase {phase_id} not found")
    exit(1)

phase = data['phases'][phase_id]
tasks = phase.get('tasks', {})

print(f"\n📋 Phase {phase_id}: {phase['name']}")
print(f"Status: {phase['status']}")
if 'completedAt' in phase:
    print(f"Completed: {phase['completedAt']}")
print("\nTasks:")

for task_id, task in sorted(tasks.items()):
    if task['status'] == 'completed':
        symbol = "✅"
    elif task['status'] == 'in_progress':
        symbol = "🔄"
    else:
        symbol = "⏳"
    
    print(f"  {symbol} {task_id}: {task['name']}")
EOF
}

# Main script logic
case "${1:-}" in
    "")
        show_progress
        ;;
    "--complete"|"-c")
        mark_complete "$2"
        show_progress
        ;;
    "--phase"|"-p")
        show_phase "$2"
        ;;
    "--reset")
        rm -f "$PROGRESS_FILE"
        init_progress
        echo -e "${GREEN}✓${NC} Progress reset"
        ;;
    "--help"|"-h")
        echo "Runbook Progress Tracker"
        echo ""
        echo "Usage:"
        echo "  $0                    Show overall progress"
        echo "  $0 --complete 1.1.1   Mark task 1.1.1 as complete"
        echo "  $0 --phase 2          Show details for phase 2"
        echo "  $0 --reset            Reset all progress"
        echo "  $0 --help             Show this help"
        ;;
    *)
        echo -e "${RED}Unknown option:${NC} $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac