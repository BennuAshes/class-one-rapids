#!/bin/bash
# Creates a new story in the kanban format
# Usage: ./create-story.sh <epic> <story> <name> <title>
# Example: ./create-story.sh 2 2.3 customer-experience "Customer Experience Department"

EPIC=$1
STORY=$2
NAME=$3
TITLE=$4

if [ -z "$EPIC" ] || [ -z "$STORY" ] || [ -z "$NAME" ] || [ -z "$TITLE" ]; then
    echo "Usage: ./create-story.sh <epic> <story> <name> <title>"
    echo "Example: ./create-story.sh 2 2.3 customer-experience \"Customer Experience Department\""
    echo ""
    echo "After creation, you can use shorthand to move the story:"
    echo "  ./move-story.sh $EPIC.$STORY in-progress"
    exit 1
fi

FILENAME="epic-${EPIC}-story-${STORY}-${NAME}.md"
FILEPATH="kanban/backlog/${FILENAME}"

if [ -f "$FILEPATH" ]; then
    echo "Story already exists: $FILEPATH"
    exit 1
fi

# Create story file
cat > "$FILEPATH" << EOF
---
epic: ${EPIC}
story: ${STORY}
title: "${TITLE}"
status: "backlog"
assigned: ""
blocked_by: []
blocks: []
estimated_hours: 0
actual_hours: 0
completion_date: null
last_updated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
---

# Story ${STORY}: ${TITLE}

## User Story
**As a** player, **I want** [goal] **so that** [benefit].

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]
- [ ] [Criterion 4]
- [ ] [Criterion 5]

## Technical Design

### Overview
[Technical architecture and design decisions]

### Key Interfaces
\`\`\`typescript
// Define main interfaces and types
\`\`\`

### Integration Points
[How this story integrates with other systems]

## Implementation Plan

### Step 1: [Phase Name]
1. [Task 1]
2. [Task 2]
3. [Task 3]

### Step 2: [Phase Name]
1. [Task 1]
2. [Task 2]
3. [Task 3]

## Tasks

### Phase 1: [Phase Name] (X hours)
- [ ] [Task description] (Estimate: Xh)
- [ ] [Task description] (Estimate: Xh)
- [ ] [Task description] (Estimate: Xh)

### Phase 2: [Phase Name] (X hours)
- [ ] [Task description] (Estimate: Xh)
- [ ] [Task description] (Estimate: Xh)

**Total Estimated Time: X hours**

## Dependencies
- **Blocks:** [List stories this blocks]
- **Blocked by:** [List blocking stories]

## Definition of Done
- [ ] [Acceptance criterion met]
- [ ] [Tests passing]
- [ ] [Performance requirements met]
- [ ] [Integration complete]
- [ ] [Documentation updated]

## Notes
- [Any additional notes or considerations]
EOF

echo "✓ Created story: $FILEPATH"
echo ""
echo "Next steps:"
echo "  ./move-story.sh $EPIC.$STORY in-progress    # Start working"
echo "  ./list-stories.sh epic $EPIC               # See epic stories"
echo "  ./generate-dashboard.sh                    # Check progress"
echo ""
echo "Edit the file to fill in the template details."