#!/bin/bash
# Usage: ./update-story.sh <story-identifier> <field> <value>
# Examples: 
#   ./update-story.sh 1.1 assigned "john-doe"
#   ./update-story.sh 1.1 actual_hours 6.5
#   ./update-story.sh 1.1 completion_date "2024-12-03T18:00:00.000Z"

STORY_INPUT=$1
FIELD=$2
VALUE=$3

# Validate inputs
if [ -z "$STORY_INPUT" ] || [ -z "$FIELD" ] || [ -z "$VALUE" ]; then
    echo "Usage: ./update-story.sh <story-identifier> <field> <value>"
    echo ""
    echo "Story identifier can be:"
    echo "  - Shorthand: 1.1, 2.3, etc. (epic.story)"
    echo "  - Full filename: epic-1-story-1-1-project-architecture.md"
    echo ""
    echo "Common fields:"
    echo "  - status (backlog, in-progress, review, blocked, done)"
    echo "  - assigned (developer name)"
    echo "  - actual_hours (numeric value)"
    echo "  - completion_date (ISO timestamp or null)"
    echo "  - last_updated (ISO timestamp)"
    exit 1
fi

# Function to resolve story identifier to full path
resolve_story_file() {
    local input=$1
    
    # If input looks like a shorthand (e.g., "1.1", "2.3")
    if [[ $input =~ ^[0-9]+\.[0-9]+$ ]]; then
        # Find matching file in kanban folders
        local pattern="epic-*-story-${input}-*.md"
        local found_file=$(find kanban -name "$pattern" -type f 2>/dev/null | head -1)
        echo "$found_file"
    else
        # Assume it's already a filename, find its path
        local found_file=$(find kanban -name "$input" -type f 2>/dev/null | head -1)
        echo "$found_file"
    fi
}

# Resolve the story file
STORY_FILE=$(resolve_story_file "$STORY_INPUT")

if [ -z "$STORY_FILE" ]; then
    echo "❌ Could not find story for identifier: $STORY_INPUT"
    exit 1
fi

# Extract current story info for display
STORY_ID=$(grep "^story:" "$STORY_FILE" | sed 's/story: //')
STORY_TITLE=$(grep "^title:" "$STORY_FILE" | sed 's/title: "//' | sed 's/"$//')

echo "📝 Updating Story $STORY_ID: $STORY_TITLE"
echo "Field: $FIELD"
echo "Value: $VALUE"

# Handle different field types and formatting
format_value() {
    local field=$1
    local value=$2
    
    case $field in
        "status"|"assigned"|"title")
            # String fields - add quotes
            echo "\"$value\""
            ;;
        "actual_hours"|"estimated_hours"|"epic"|"story")
            # Numeric fields - no quotes
            echo "$value"
            ;;
        "completion_date"|"last_updated")
            # Date fields - add quotes, handle null
            if [ "$value" = "null" ]; then
                echo "null"
            else
                echo "\"$value\""
            fi
            ;;
        "blocked_by"|"blocks")
            # Array fields - handle as JSON array
            if [ "$value" = "[]" ] || [ "$value" = "" ]; then
                echo "[]"
            else
                # Convert comma-separated to JSON array
                echo "[$value]" | sed 's/,/, /g'
            fi
            ;;
        *)
            # Default - add quotes for safety
            echo "\"$value\""
            ;;
    esac
}

# Format the value properly
FORMATTED_VALUE=$(format_value "$FIELD" "$VALUE")

# Update the field in the YAML frontmatter
if grep -q "^${FIELD}:" "$STORY_FILE"; then
    # Field exists, update it
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^${FIELD}:.*/${FIELD}: ${FORMATTED_VALUE}/" "$STORY_FILE"
    else
        # Linux
        sed -i "s/^${FIELD}:.*/${FIELD}: ${FORMATTED_VALUE}/" "$STORY_FILE"
    fi
    echo "✅ Updated $FIELD to $FORMATTED_VALUE"
else
    echo "❌ Field '$FIELD' not found in story file"
    echo ""
    echo "Available fields in this story:"
    grep "^[a-z_]*:" "$STORY_FILE" | sed 's/:.*$//' | sed 's/^/  - /'
    exit 1
fi

# Always update the last_updated timestamp when any field changes
if [ "$FIELD" != "last_updated" ]; then
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/^last_updated:.*/last_updated: \"${TIMESTAMP}\"/" "$STORY_FILE"
    else
        sed -i "s/^last_updated:.*/last_updated: \"${TIMESTAMP}\"/" "$STORY_FILE"
    fi
    echo "🕒 Updated last_updated to $TIMESTAMP"
fi

echo ""
echo "📋 Current story status:"
echo "---"
head -15 "$STORY_FILE" | tail -12
echo "---"