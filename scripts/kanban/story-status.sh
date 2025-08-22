#!/bin/bash
# Usage: ./story-status.sh [story-identifier]
# Examples: 
#   ./story-status.sh           # Show kanban board overview
#   ./story-status.sh 1.1       # Show specific story details

STORY_INPUT=$1

# If no story specified, show kanban board overview
if [ -z "$STORY_INPUT" ]; then
    echo "📋 Kanban Board Overview"
    echo "Generated: $(date -u +"%Y-%m-%d %H:%M UTC")"
    echo ""
    
    # Count stories by status
    declare -A status_counts
    status_counts["backlog"]=0
    status_counts["in-progress"]=0
    status_counts["review"]=0
    status_counts["blocked"]=0
    status_counts["done"]=0
    
    total_stories=0
    total_estimated=0
    total_actual=0
    
    # Collect statistics
    for file in kanban/*/*.md; do
        if [ -f "$file" ]; then
            status=$(grep "^status:" "$file" | sed 's/status: "//' | sed 's/"$//')
            estimated=$(grep "^estimated_hours:" "$file" | sed 's/estimated_hours: //')
            actual=$(grep "^actual_hours:" "$file" | sed 's/actual_hours: //')
            
            status_counts["$status"]=$((${status_counts["$status"]} + 1))
            total_stories=$((total_stories + 1))
            total_estimated=$((total_estimated + estimated))
            total_actual=$((total_actual + actual))
        fi
    done
    
    # Display statistics
    echo "📊 Statistics:"
    echo "  Total Stories: $total_stories"
    echo "  Estimated Hours: $total_estimated"
    echo "  Actual Hours: $total_actual"
    
    if [ $total_estimated -gt 0 ]; then
        completion_pct=$((total_actual * 100 / total_estimated))
        echo "  Progress: $completion_pct% ($total_actual/$total_estimated hours)"
    fi
    echo ""
    
    # Display status breakdown
    echo "🏗️  Status Breakdown:"
    for status in "backlog" "in-progress" "review" "blocked" "done"; do
        count=${status_counts["$status"]}
        case $status in
            "done") icon="✅" ;;
            "in-progress") icon="🔄" ;;
            "review") icon="👀" ;;
            "blocked") icon="🚫" ;;
            "backlog") icon="📋" ;;
        esac
        echo "  $icon $status: $count stories"
    done
    echo ""
    
    # Show current work
    echo "🔄 Currently In Progress:"
    for file in kanban/in-progress/*.md; do
        if [ -f "$file" ]; then
            story_id=$(grep "^story:" "$file" | sed 's/story: //')
            title=$(grep "^title:" "$file" | sed 's/title: "//' | sed 's/"$//')
            assigned=$(grep "^assigned:" "$file" | sed 's/assigned: "//' | sed 's/"$//')
            
            echo -n "  [$story_id] $title"
            if [ -n "$assigned" ] && [ "$assigned" != '""' ] && [ "$assigned" != "" ]; then
                echo " (@$assigned)"
            else
                echo " (unassigned)"
            fi
        fi
    done
    
    if [ ! -f kanban/in-progress/*.md ]; then
        echo "  No stories currently in progress"
    fi
    echo ""
    
    # Show next available stories
    echo "📋 Next Available (Ready to Start):"
    ready_count=0
    
    for file in kanban/backlog/*.md; do
        if [ -f "$file" ]; then
            story_id=$(grep "^story:" "$file" | sed 's/story: //')
            blocked_by=$(grep "^blocked_by:" "$file" | sed 's/blocked_by: \[//' | sed 's/\]$//' | sed 's/"//g')
            
            # Check if dependencies are met
            deps_met=true
            if [ -n "$blocked_by" ] && [ "$blocked_by" != " " ]; then
                while IFS= read -r dep; do
                    if [ -n "$dep" ]; then
                        dep_file=$(find kanban/done -name "epic-*-story-${dep}-*.md" -type f 2>/dev/null | head -1)
                        if [ -z "$dep_file" ]; then
                            deps_met=false
                            break
                        fi
                    fi
                done <<< "$(echo "$blocked_by" | tr ',' '\n' | sed 's/^ *//' | sed '/^$/d')"
            fi
            
            if $deps_met; then
                title=$(grep "^title:" "$file" | sed 's/title: "//' | sed 's/"$//')
                estimated=$(grep "^estimated_hours:" "$file" | sed 's/estimated_hours: //')
                echo "  [$story_id] $title (${estimated}h)"
                ready_count=$((ready_count + 1))
            fi
        fi
    done
    
    if [ $ready_count -eq 0 ]; then
        echo "  No stories ready to start (all have unmet dependencies)"
    fi
    
    exit 0
fi

# Show specific story details
resolve_story_file() {
    local input=$1
    
    if [[ $input =~ ^[0-9]+\.[0-9]+$ ]]; then
        local pattern="epic-*-story-${input}-*.md"
        local found_file=$(find kanban -name "$pattern" -type f 2>/dev/null | head -1)
        echo "$found_file"
    else
        local found_file=$(find kanban -name "$input" -type f 2>/dev/null | head -1)
        echo "$found_file"
    fi
}

STORY_FILE=$(resolve_story_file "$STORY_INPUT")

if [ -z "$STORY_FILE" ]; then
    echo "❌ Could not find story for identifier: $STORY_INPUT"
    exit 1
fi

# Extract and display story details
STORY_ID=$(grep "^story:" "$STORY_FILE" | sed 's/story: //')
EPIC_ID=$(grep "^epic:" "$STORY_FILE" | sed 's/epic: //')
TITLE=$(grep "^title:" "$STORY_FILE" | sed 's/title: "//' | sed 's/"$//')
STATUS=$(grep "^status:" "$STORY_FILE" | sed 's/status: "//' | sed 's/"$//')
ASSIGNED=$(grep "^assigned:" "$STORY_FILE" | sed 's/assigned: "//' | sed 's/"$//')
ESTIMATED=$(grep "^estimated_hours:" "$STORY_FILE" | sed 's/estimated_hours: //')
ACTUAL=$(grep "^actual_hours:" "$STORY_FILE" | sed 's/actual_hours: //')
BLOCKED_BY=$(grep "^blocked_by:" "$STORY_FILE" | sed 's/blocked_by: \[//' | sed 's/\]$//' | sed 's/"//g')
BLOCKS=$(grep "^blocks:" "$STORY_FILE" | sed 's/blocks: \[//' | sed 's/\]$//' | sed 's/"//g')
COMPLETION_DATE=$(grep "^completion_date:" "$STORY_FILE" | sed 's/completion_date: //')
LAST_UPDATED=$(grep "^last_updated:" "$STORY_FILE" | sed 's/last_updated: "//' | sed 's/"$//')

echo "📖 Story Details: $STORY_ID"
echo "=================================="
echo "Epic: $EPIC_ID"
echo "Title: $TITLE"
echo "Status: $STATUS"

if [ -n "$ASSIGNED" ] && [ "$ASSIGNED" != '""' ] && [ "$ASSIGNED" != "" ]; then
    echo "Assigned: $ASSIGNED"
else
    echo "Assigned: (unassigned)"
fi

echo "Estimated Hours: $ESTIMATED"
echo "Actual Hours: $ACTUAL"

if [ "$COMPLETION_DATE" != "null" ]; then
    echo "Completion Date: $COMPLETION_DATE"
fi

echo "Last Updated: $LAST_UPDATED"
echo ""

# Show dependencies
if [ -n "$BLOCKED_BY" ] && [ "$BLOCKED_BY" != " " ]; then
    echo "🔒 Blocked By:"
    while IFS= read -r dep; do
        if [ -n "$dep" ]; then
            dep_file=$(find kanban -name "epic-*-story-${dep}-*.md" -type f 2>/dev/null | head -1)
            if [ -n "$dep_file" ]; then
                dep_status=$(grep "^status:" "$dep_file" | sed 's/status: "//' | sed 's/"$//')
                dep_title=$(grep "^title:" "$dep_file" | sed 's/title: "//' | sed 's/"$//')
                
                case $dep_status in
                    "done") icon="✅" ;;
                    "in-progress") icon="🔄" ;;
                    "review") icon="👀" ;;
                    "blocked") icon="🚫" ;;
                    "backlog") icon="📋" ;;
                esac
                echo "  $icon [$dep] $dep_title ($dep_status)"
            else
                echo "  ❓ [$dep] (not found)"
            fi
        fi
    done <<< "$(echo "$BLOCKED_BY" | tr ',' '\n' | sed 's/^ *//' | sed '/^$/d')"
else
    echo "🔓 No blocking dependencies"
fi

echo ""

# Show what this story blocks
if [ -n "$BLOCKS" ] && [ "$BLOCKS" != " " ]; then
    echo "🏗️  Blocks:"
    while IFS= read -r blocked; do
        if [ -n "$blocked" ]; then
            blocked_file=$(find kanban -name "epic-*-story-${blocked}-*.md" -type f 2>/dev/null | head -1)
            if [ -n "$blocked_file" ]; then
                blocked_title=$(grep "^title:" "$blocked_file" | sed 's/title: "//' | sed 's/"$//')
                echo "  📋 [$blocked] $blocked_title"
            else
                echo "  ❓ [$blocked] (not found)"
            fi
        fi
    done <<< "$(echo "$BLOCKS" | tr ',' '\n' | sed 's/^ *//' | sed '/^$/d')"
else
    echo "🔓 Does not block other stories"
fi

echo ""
echo "📄 File Location: $STORY_FILE"