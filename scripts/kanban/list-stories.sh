#!/bin/bash
# Quick story listing without full dashboard overhead
# Usage: ./list-stories.sh [filter] [value]
# Examples:
#   ./list-stories.sh                    # All stories
#   ./list-stories.sh epic 2            # Only Epic 2 stories
#   ./list-stories.sh state in-progress # Only in-progress stories
#   ./list-stories.sh assigned john     # Only stories assigned to john

FILTER=$1
VALUE=$2

echo "# Story List"
echo "Generated: $(date -u +"%Y-%m-%d %H:%M UTC")"
echo ""

# Function to extract story info
extract_story_info() {
    local file=$1
    local story=$(grep "^story:" "$file" | sed 's/story: //')
    local title=$(grep "^title:" "$file" | sed 's/title: "//' | sed 's/"$//')
    local status=$(grep "^status:" "$file" | sed 's/status: "//' | sed 's/"$//')
    local assigned=$(grep "^assigned:" "$file" | sed 's/assigned: "//' | sed 's/"$//')
    local epic=$(grep "^epic:" "$file" | sed 's/epic: //')
    
    # Apply filters
    case $FILTER in
        "epic")
            if [ "$epic" != "$VALUE" ]; then
                return 1
            fi
            ;;
        "state")
            if [ "$status" != "$VALUE" ]; then
                return 1
            fi
            ;;
        "assigned")
            if [ "$assigned" != "$VALUE" ]; then
                return 1
            fi
            ;;
    esac
    
    # Format output
    local status_icon
    case $status in
        "done") status_icon="✅" ;;
        "in-progress") status_icon="🔄" ;;
        "review") status_icon="👀" ;;
        "blocked") status_icon="🚫" ;;
        "backlog") status_icon="📋" ;;
        *) status_icon="❓" ;;
    esac
    
    echo -n "[$story] $status_icon $title"
    if [ -n "$assigned" ] && [ "$assigned" != '""' ]; then
        echo " (@$assigned)"
    else
        echo ""
    fi
}

# Count and list stories
total_count=0
for file in kanban/*/*.md; do
    if [ -f "$file" ]; then
        if extract_story_info "$file"; then
            total_count=$((total_count + 1))
        fi
    fi
done

echo ""
echo "Total: $total_count stories"

if [ $total_count -eq 0 ]; then
    echo ""
    echo "No stories match the filter criteria."
    if [ -n "$FILTER" ]; then
        echo ""
        echo "Available values for $FILTER:"
        case $FILTER in
            "epic")
                find kanban -name "*.md" -exec grep -H "^epic:" {} \; | sed 's/.*epic: //' | sort -u
                ;;
            "state")
                echo "  backlog, in-progress, review, blocked, done"
                ;;
            "assigned")
                find kanban -name "*.md" -exec grep -H "^assigned:" {} \; | sed 's/.*assigned: "//' | sed 's/"$//' | grep -v "^$" | sort -u
                ;;
        esac
    fi
fi