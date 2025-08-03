# Workflow Management Plan for Epic Breakdown

## Current Issues with 3-File-Per-Story Approach

### Problems Identified
1. **File Proliferation**: 23 stories × 3 files = 69 files is unwieldy
2. **No State Tracking**: Cannot see at a glance which stories are in progress, blocked, or complete
3. **Difficult Navigation**: Too many files make finding specific stories challenging
4. **No Visual Progress**: Unlike a kanban board, current structure doesn't show workflow state

## Proposed Solution: Single File Per Story with State Management

### Core Concept
- **One Markdown file per story** containing all necessary information
- **Folder-based state management** mimicking kanban columns
- **File naming conventions** for quick state identification
- **YAML frontmatter** for metadata and state tracking

### Proposed Structure

```
epic-breakdown/
├── kanban/
│   ├── backlog/
│   │   ├── epic-1-story-1-1-project-architecture.md
│   │   └── epic-2-story-2-1-development-department.md
│   ├── in-progress/
│   │   └── epic-1-story-1-2-instant-click.md
│   ├── review/
│   │   └── epic-1-story-1-3-resource-system.md
│   ├── blocked/
│   │   └── epic-2-story-2-2-sales-department.md
│   └── done/
│       └── epic-1-story-1-4-automation.md
├── epics/
│   ├── epic-1-core-gameplay.md
│   ├── epic-2-departments.md
│   └── epic-3-progression.md
└── reports/
    ├── progress-dashboard.md
    └── dependencies.md
```

### Story File Format

Each story file would contain:

```markdown
---
epic: 1
story: 1.1
title: "Project Architecture Setup"
status: "backlog"
assigned: ""
blocked_by: []
blocks: ["1.2", "1.3", "1.4", "1.5"]
estimated_hours: 20
actual_hours: 0
completion_date: null
---

# Story 1.1: Project Architecture Setup

## User Story
**As a** developer, **I want** a robust technical foundation **so that** I can build features efficiently with excellent performance.

## Acceptance Criteria
- [ ] Vanilla JavaScript/TypeScript project with no external dependencies
- [ ] 60 FPS game loop using RequestAnimationFrame
- [ ] Modular architecture supporting feature addition
- [ ] Performance monitoring built-in
- [ ] Cross-browser compatibility

## Technical Design
[Technical specification content]

## Implementation Plan
[Implementation guide content]

## Tasks
- [ ] Create project directory structure (0.5h)
- [ ] Initialize TypeScript configuration (1h)
- [ ] Set up development server (1h)
- [ ] Implement game loop (2h)
- [ ] Create state management (2h)

## Notes
[Development notes, blockers, decisions]
```

## State Management System

### Kanban States
1. **backlog**: Stories not yet started
2. **in-progress**: Actively being worked on
3. **review**: Implementation complete, needs review
4. **blocked**: Cannot proceed due to dependencies
5. **done**: Fully complete and integrated

### State Transition Rules
```
backlog → in-progress → review → done
     ↓                      ↓
  blocked ←─────────────────┘
```

### File Naming Convention
```
epic-[#]-story-[#]-[short-name].md

Examples:
epic-1-story-1-1-project-architecture.md
epic-2-story-2-1-development-department.md
```

## Automation and Tooling

### Shell Scripts for State Management

#### move-story.sh
```bash
#!/bin/bash
# Usage: ./move-story.sh <story-file> <new-state>
# Example: ./move-story.sh epic-1-story-1-1-project-architecture.md in-progress

STORY_FILE=$1
NEW_STATE=$2
VALID_STATES=("backlog" "in-progress" "review" "blocked" "done")

# Validate state
if [[ ! " ${VALID_STATES[@]} " =~ " ${NEW_STATE} " ]]; then
    echo "Invalid state. Use: backlog, in-progress, review, blocked, done"
    exit 1
fi

# Find current location
CURRENT_PATH=$(find kanban -name "$STORY_FILE" -type f)

# Move file
mv "$CURRENT_PATH" "kanban/$NEW_STATE/$STORY_FILE"

# Update status in file
sed -i "s/status: \".*\"/status: \"$NEW_STATE\"/" "kanban/$NEW_STATE/$STORY_FILE"

echo "Moved $STORY_FILE to $NEW_STATE"
```

#### generate-dashboard.sh
```bash
#!/bin/bash
# Generates progress dashboard from current state

echo "# Project Progress Dashboard" > reports/progress-dashboard.md
echo "Generated: $(date)" >> reports/progress-dashboard.md
echo "" >> reports/progress-dashboard.md

for state in backlog in-progress review blocked done; do
    count=$(find kanban/$state -name "*.md" | wc -l)
    echo "## $state ($count stories)" >> reports/progress-dashboard.md
    
    for file in kanban/$state/*.md; do
        if [ -f "$file" ]; then
            title=$(grep "title:" "$file" | sed 's/title: "//' | sed 's/"//')
            echo "- $title" >> reports/progress-dashboard.md
        fi
    done
    echo "" >> reports/progress-dashboard.md
done
```

### Visual Progress Indicators

#### Progress Bar Generation
```bash
# Add to dashboard generation
total_stories=23
done_count=$(find kanban/done -name "*.md" | wc -l)
progress=$((done_count * 100 / total_stories))

echo "## Overall Progress: $progress%" >> reports/progress-dashboard.md
echo -n "[" >> reports/progress-dashboard.md
for i in {1..20}; do
    if [ $i -le $((progress / 5)) ]; then
        echo -n "█"
    else
        echo -n "░"
    fi
done
echo "] $done_count/$total_stories complete" >> reports/progress-dashboard.md
```

## Benefits of This Approach

### Advantages
1. **Single Source of Truth**: Each story has one file with all information
2. **Visual State Management**: Folder structure shows progress at a glance
3. **Easy Navigation**: Clear file naming and organization
4. **Scriptable Workflow**: Shell scripts for common operations
5. **Git-Friendly**: File moves are tracked in version control
6. **Dashboard Generation**: Automatic progress reporting

### Integration with Development Workflow
1. Developer picks story from backlog
2. Moves to in-progress when starting work
3. Updates task checkboxes as work progresses
4. Moves to review when implementation complete
5. Moves to done after review and integration

## Migration Plan

### Phase 1: Setup Structure
1. Create kanban folder structure
2. Create automation scripts
3. Test workflow with one epic

### Phase 2: Content Migration
1. Combine existing 3-file stories into single files
2. Add YAML frontmatter with metadata
3. Place files in appropriate state folders

### Phase 3: Process Implementation
1. Train team on new workflow
2. Implement daily dashboard generation
3. Add git hooks for state validation

## Alternative Approaches Considered

### Option A: Markdown Tables
- Single file with all stories in a table
- ❌ Poor for detailed content
- ❌ Difficult to track changes

### Option B: JSON/YAML Database
- Structured data file with all stories
- ❌ Not human-readable
- ❌ Requires tooling to edit

### Option C: GitHub Issues/Projects
- Use GitHub's built-in project management
- ✅ Great features
- ❌ Requires internet connection
- ❌ Not file-based

### Selected: Folder-Based Kanban
- ✅ Visual and intuitive
- ✅ Works offline
- ✅ Git-trackable
- ✅ Scriptable
- ✅ No external dependencies

## Implementation Timeline

### Immediate Actions
1. Create folder structure
2. Write automation scripts
3. Create first epic as proof of concept

### Next Steps
1. Migrate existing stories to new format
2. Generate initial dashboard
3. Document workflow for team

This approach provides a file-based kanban system that maintains the benefits of markdown documentation while adding visual state management and progress tracking capabilities.