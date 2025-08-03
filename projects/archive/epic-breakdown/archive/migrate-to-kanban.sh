#!/bin/bash
# Migrates existing 3-file stories to single-file kanban format

echo "Starting migration to kanban format..."

# Function to merge 3 files into 1
merge_story_files() {
    local epic_num=$1
    local story_num=$2
    local story_name=$3
    local story_title=$4
    local status=${5:-"done"}  # Default to done for completed stories
    
    local tech_spec_file="epic-${epic_num}-core-gameplay/story-${story_num}-${story_name}/technical-spec.md"
    local impl_guide_file="epic-${epic_num}-core-gameplay/story-${story_num}-${story_name}/implementation-guide.md"
    local dev_tasks_file="epic-${epic_num}-core-gameplay/story-${story_num}-${story_name}/development-tasks.md"
    
    local output_file="kanban/${status}/epic-${epic_num}-story-${story_num}-${story_name}.md"
    
    if [ -f "$tech_spec_file" ] && [ -f "$impl_guide_file" ] && [ -f "$dev_tasks_file" ]; then
        echo "Migrating Story ${epic_num}.${story_num}: ${story_title}"
        
        # Create merged file with YAML frontmatter
        cat > "$output_file" << EOF
---
epic: ${epic_num}
story: ${story_num}
title: "${story_title}"
status: "${status}"
assigned: ""
blocked_by: []
blocks: []
estimated_hours: 0
actual_hours: 0
completion_date: null
last_updated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
---

# Story ${story_num}: ${story_title}

EOF
        
        # Extract user story from technical spec
        echo "## User Story" >> "$output_file"
        sed -n '/## Story Overview/,/## Acceptance Criteria/p' "$tech_spec_file" | grep -v "## Acceptance Criteria" | tail -n +2 >> "$output_file"
        echo "" >> "$output_file"
        
        # Extract acceptance criteria
        echo "## Acceptance Criteria" >> "$output_file"
        sed -n '/## Acceptance Criteria/,/## Technical Architecture/p' "$tech_spec_file" | grep -v "## Technical Architecture" | tail -n +2 >> "$output_file"
        echo "" >> "$output_file"
        
        # Extract technical design
        echo "## Technical Design" >> "$output_file"
        sed -n '/## Technical Architecture/,/## API Contracts/p' "$tech_spec_file" | grep -v "## API Contracts" | tail -n +2 >> "$output_file"
        sed -n '/## API Contracts/,/## Security/p' "$tech_spec_file" | grep -v "## Security" >> "$output_file"
        echo "" >> "$output_file"
        
        # Extract implementation plan
        echo "## Implementation Plan" >> "$output_file"
        sed -n '/## Development Workflow/,/## Code Organization/p' "$impl_guide_file" | grep -v "## Code Organization" | tail -n +2 >> "$output_file"
        echo "" >> "$output_file"
        
        # Extract tasks
        echo "## Tasks" >> "$output_file"
        sed -n '/## Task Breakdown/,/## Dependencies/p' "$dev_tasks_file" | grep -v "## Dependencies" | tail -n +2 >> "$output_file"
        echo "" >> "$output_file"
        
        # Extract dependencies
        echo "## Dependencies" >> "$output_file"
        sed -n '/## Dependencies/,/## Definition of Done/p' "$dev_tasks_file" | grep -v "## Definition of Done" | tail -n +2 >> "$output_file"
        echo "" >> "$output_file"
        
        # Extract DoD
        echo "## Definition of Done" >> "$output_file"
        sed -n '/## Definition of Done/,/## Resources Required/p' "$dev_tasks_file" | grep -v "## Resources Required" | tail -n +2 >> "$output_file"
        echo "" >> "$output_file"
        
        # Add notes section
        echo "## Notes" >> "$output_file"
        echo "- Migrated from 3-file format" >> "$output_file"
        
        echo "✓ Created $output_file"
    fi
}

# Migrate Epic 1 stories (already completed)
merge_story_files 1 "1-1" "project-architecture" "Project Architecture Setup" "done"
merge_story_files 1 "1-2" "instant-click-gratification" "Instant Click Gratification" "done"
merge_story_files 1 "1-3" "resource-system-foundation" "Resource System Foundation" "done"
merge_story_files 1 "1-4" "first-automation-unlock" "First Automation Unlock" "done"
merge_story_files 1 "1-5" "ui-foundation-system" "UI Foundation System" "done"

# Note: Epic 2 Story 2.1 exists but others need to be created
echo ""
echo "Migration complete for existing stories!"
echo "Note: Only Epic 1 stories were found in the old format."
echo "Use the create-story.sh script to add new stories in the kanban format."