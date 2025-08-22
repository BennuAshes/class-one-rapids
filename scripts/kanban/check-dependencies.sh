#!/bin/bash
# Usage: ./check-dependencies.sh <story-identifier>
# Examples: 
#   ./check-dependencies.sh 1.1
#   ./check-dependencies.sh epic-1-story-1-1-project-architecture.md

STORY_INPUT=$1

# Validate input
if [ -z "$STORY_INPUT" ]; then
    echo "Usage: ./check-dependencies.sh <story-identifier>"
    echo ""
    echo "Story identifier can be:"
    echo "  - Shorthand: 1.1, 2.3, etc. (epic.story)"
    echo "  - Full filename: epic-1-story-1-1-project-architecture.md"
    exit 1
fi

# Function to resolve story identifier to filename
resolve_story_file() {
    local input=$1
    
    # If input looks like a shorthand (e.g., "1.1", "2.3")
    if [[ $input =~ ^[0-9]+\.[0-9]+$ ]]; then
        # Find matching file in kanban folders
        local pattern="epic-*-story-${input}-*.md"
        local found_file=$(find kanban -name "$pattern" -type f 2>/dev/null | head -1)
        
        if [ -n "$found_file" ]; then
            echo "$found_file"
        else
            echo ""
        fi
    else
        # Assume it's already a filename, find its path
        local found_file=$(find kanban -name "$input" -type f 2>/dev/null | head -1)
        echo "$found_file"
    fi
}

# Function to check if a story is completed
is_story_done() {
    local story_id=$1
    local pattern="epic-*-story-${story_id}-*.md"
    local story_file=$(find kanban/done -name "$pattern" -type f 2>/dev/null | head -1)
    
    if [ -n "$story_file" ]; then
        return 0  # true
    else
        return 1  # false
    fi
}

# Function to get story status
get_story_status() {
    local story_id=$1
    local pattern="epic-*-story-${story_id}-*.md"
    local story_file=$(find kanban -name "$pattern" -type f 2>/dev/null | head -1)
    
    if [ -n "$story_file" ]; then
        grep "^status:" "$story_file" | sed 's/status: "//' | sed 's/"$//'
    else
        echo "not-found"
    fi
}

# Resolve the story file
STORY_FILE=$(resolve_story_file "$STORY_INPUT")

if [ -z "$STORY_FILE" ]; then
    echo "❌ Could not find story for identifier: $STORY_INPUT"
    exit 1
fi

# Extract story info
STORY_ID=$(grep "^story:" "$STORY_FILE" | sed 's/story: //')
STORY_TITLE=$(grep "^title:" "$STORY_FILE" | sed 's/title: "//' | sed 's/"$//')
CURRENT_STATUS=$(grep "^status:" "$STORY_FILE" | sed 's/status: "//' | sed 's/"$//')

echo "🔍 Checking dependencies for Story $STORY_ID: $STORY_TITLE"
echo "Current Status: $CURRENT_STATUS"
echo ""

# Extract blocked_by dependencies
BLOCKED_BY=$(grep "^blocked_by:" "$STORY_FILE" | sed 's/blocked_by: \[//' | sed 's/\]$//' | sed 's/"//g' | tr ',' '\n' | sed 's/^ *//' | sed '/^$/d')

if [ -z "$BLOCKED_BY" ]; then
    echo "✅ No dependencies - Story is ready to start!"
    exit 0
fi

echo "📋 Dependencies to check:"
all_clear=true

while IFS= read -r dep; do
    if [ -n "$dep" ]; then
        status=$(get_story_status "$dep")
        case $status in
            "done")
                echo "  ✅ Story $dep: Completed"
                ;;
            "not-found")
                echo "  ❓ Story $dep: Not found"
                all_clear=false
                ;;
            *)
                echo "  ❌ Story $dep: $status (needs to be 'done')"
                all_clear=false
                ;;
        esac
    fi
done <<< "$BLOCKED_BY"

echo ""

if $all_clear; then
    echo "🎉 All dependencies satisfied! Story $STORY_ID is ready to start."
    
    if [ "$CURRENT_STATUS" = "backlog" ]; then
        echo ""
        echo "💡 To start working on this story, run:"
        echo "   ./move-story.sh $STORY_ID in-progress"
    fi
    
    exit 0
else
    echo "🚫 Dependencies not met. Cannot start Story $STORY_ID yet."
    echo ""
    echo "📝 Next available stories (no blocking dependencies):"
    
    # Find stories with no dependencies or all dependencies met
    for file in kanban/backlog/*.md; do
        if [ -f "$file" ]; then
            file_story_id=$(grep "^story:" "$file" | sed 's/story: //')
            file_blocked_by=$(grep "^blocked_by:" "$file" | sed 's/blocked_by: \[//' | sed 's/\]$//' | sed 's/"//g')
            
            # Skip if it has dependencies
            if [ -n "$file_blocked_by" ] && [ "$file_blocked_by" != " " ]; then
                # Check if all dependencies are met
                deps_met=true
                while IFS= read -r dep; do
                    if [ -n "$dep" ]; then
                        dep_status=$(get_story_status "$dep")
                        if [ "$dep_status" != "done" ]; then
                            deps_met=false
                            break
                        fi
                    fi
                done <<< "$(echo "$file_blocked_by" | tr ',' '\n' | sed 's/^ *//' | sed '/^$/d')"
                
                if ! $deps_met; then
                    continue
                fi
            fi
            
            # This story is available
            file_title=$(grep "^title:" "$file" | sed 's/title: "//' | sed 's/"$//')
            echo "  📋 Story $file_story_id: $file_title"
        fi
    done
    
    exit 1
fi