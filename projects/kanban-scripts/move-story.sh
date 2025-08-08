#!/bin/bash
# Usage: ./move-story.sh <story-identifier> <new-state>
# Examples: 
#   ./move-story.sh 1.1 in-progress
#   ./move-story.sh epic-1-story-1-1-project-architecture.md in-progress

STORY_INPUT=$1
NEW_STATE=$2
VALID_STATES=("backlog" "in-progress" "review" "blocked" "done")

# Validate inputs
if [ -z "$STORY_INPUT" ] || [ -z "$NEW_STATE" ]; then
    echo "Usage: ./move-story.sh <story-identifier> <new-state>"
    echo ""
    echo "Story identifier can be:"
    echo "  - Shorthand: 1.1, 2.3, etc. (epic.story)"
    echo "  - Full filename: epic-1-story-1-1-project-architecture.md"
    echo ""
    echo "States: backlog, in-progress, review, blocked, done"
    exit 1
fi

# Function to resolve story identifier to filename
resolve_story_file() {
    local input=$1
    
    # If input looks like a shorthand (e.g., "1.1", "2.3")
    if [[ $input =~ ^[0-9]+\.[0-9]+$ ]]; then
        # Find matching file in kanban folders
        # Convert 1.2 to epic-1-story-1.2-*.md pattern
        local pattern="epic-*-story-${input}-*.md"
        local found_file=$(find kanban -name "$pattern" -type f 2>/dev/null | head -1)
        
        if [ -n "$found_file" ]; then
            basename "$found_file"
        else
            echo ""
        fi
    else
        # Assume it's already a filename
        echo "$input"
    fi
}

# Resolve the story file
STORY_FILE=$(resolve_story_file "$STORY_INPUT")

if [ -z "$STORY_FILE" ]; then
    echo "Could not find story for identifier: $STORY_INPUT"
    echo ""
    echo "Available stories:"
    find kanban -name "*.md" -type f | while read file; do
        filename=$(basename "$file")
        # Extract epic and story numbers for shorthand display
        if [[ $filename =~ epic-([0-9]+)-story-([0-9]+\.[0-9]+)- ]]; then
            epic="${BASH_REMATCH[1]}"
            story="${BASH_REMATCH[2]}"
            echo "  $story: $filename"
        fi
    done
    exit 1
fi

# Validate state
if [[ ! " ${VALID_STATES[@]} " =~ " ${NEW_STATE} " ]]; then
    echo "Invalid state. Use: backlog, in-progress, review, blocked, done"
    exit 1
fi

# Find current location
CURRENT_PATH=$(find kanban -name "$STORY_FILE" -type f 2>/dev/null | head -1)

if [ -z "$CURRENT_PATH" ]; then
    echo "Story file not found: $STORY_FILE"
    exit 1
fi

# Move file
mv "$CURRENT_PATH" "kanban/$NEW_STATE/$STORY_FILE"

# Update status in file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/status: \".*\"/status: \"$NEW_STATE\"/" "kanban/$NEW_STATE/$STORY_FILE"
else
    # Linux
    sed -i "s/status: \".*\"/status: \"$NEW_STATE\"/" "kanban/$NEW_STATE/$STORY_FILE"
fi

# Update timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/last_updated: .*/last_updated: $TIMESTAMP/" "kanban/$NEW_STATE/$STORY_FILE"
else
    sed -i "s/last_updated: .*/last_updated: $TIMESTAMP/" "kanban/$NEW_STATE/$STORY_FILE"
fi

echo "✓ Moved $STORY_FILE to $NEW_STATE"