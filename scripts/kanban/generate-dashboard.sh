#!/bin/bash
# Generates progress dashboard from current kanban state

DASHBOARD_FILE="reports/progress-dashboard.md"

# Header
echo "# PetSoft Tycoon - Epic Breakdown Progress Dashboard" > "$DASHBOARD_FILE"
echo "Generated: $(date -u +"%Y-%m-%d %H:%M UTC")" >> "$DASHBOARD_FILE"
echo "" >> "$DASHBOARD_FILE"

# Calculate overall progress
total_stories=23
done_count=$(find kanban/done -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
in_progress_count=$(find kanban/in-progress -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
review_count=$(find kanban/review -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
blocked_count=$(find kanban/blocked -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
backlog_count=$(find kanban/backlog -name "*.md" 2>/dev/null | wc -l | tr -d ' ')

progress=$((done_count * 100 / total_stories))

# Overall Progress Bar
echo "## Overall Progress: $progress% Complete" >> "$DASHBOARD_FILE"
echo -n "[" >> "$DASHBOARD_FILE"
for i in {1..20}; do
    if [ $i -le $((progress / 5)) ]; then
        echo -n "█" >> "$DASHBOARD_FILE"
    else
        echo -n "░" >> "$DASHBOARD_FILE"
    fi
done
echo "] $done_count/$total_stories stories" >> "$DASHBOARD_FILE"
echo "" >> "$DASHBOARD_FILE"

# Summary Statistics
echo "## Summary" >> "$DASHBOARD_FILE"
echo "| State | Count | Percentage |" >> "$DASHBOARD_FILE"
echo "|-------|-------|------------|" >> "$DASHBOARD_FILE"
echo "| ✅ Done | $done_count | $((done_count * 100 / total_stories))% |" >> "$DASHBOARD_FILE"
echo "| 🔄 In Progress | $in_progress_count | $((in_progress_count * 100 / total_stories))% |" >> "$DASHBOARD_FILE"
echo "| 👀 Review | $review_count | $((review_count * 100 / total_stories))% |" >> "$DASHBOARD_FILE"
echo "| 🚫 Blocked | $blocked_count | $((blocked_count * 100 / total_stories))% |" >> "$DASHBOARD_FILE"
echo "| 📋 Backlog | $backlog_count | $((backlog_count * 100 / total_stories))% |" >> "$DASHBOARD_FILE"
echo "" >> "$DASHBOARD_FILE"

# Epic Progress
echo "## Epic Progress" >> "$DASHBOARD_FILE"
echo "" >> "$DASHBOARD_FILE"

# Function to count stories by epic
count_epic_stories() {
    local epic_num=$1
    local state=$2
    find "kanban/$state" -name "epic-${epic_num}-story-*.md" 2>/dev/null | wc -l | tr -d ' '
}

# Epic details
declare -a epic_names=("Core Gameplay Foundation" "Department Systems" "Progression & Prestige" "Audio-Visual Polish" "Persistence & Performance")
declare -a epic_totals=(5 8 3 4 3)

for i in {1..5}; do
    epic_done=$(count_epic_stories $i "done")
    epic_total=${epic_totals[$((i-1))]}
    epic_name=${epic_names[$((i-1))]}
    epic_progress=$((epic_done * 100 / epic_total))
    
    echo "### Epic $i: $epic_name" >> "$DASHBOARD_FILE"
    echo -n "Progress: [" >> "$DASHBOARD_FILE"
    for j in {1..10}; do
        if [ $j -le $((epic_progress / 10)) ]; then
            echo -n "█" >> "$DASHBOARD_FILE"
        else
            echo -n "░" >> "$DASHBOARD_FILE"
        fi
    done
    echo "] $epic_done/$epic_total ($epic_progress%)" >> "$DASHBOARD_FILE"
    echo "" >> "$DASHBOARD_FILE"
done

# Detailed State Sections
for state in done in-progress review blocked backlog; do
    count=$(find "kanban/$state" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    
    case $state in
        "done") icon="✅"; label="Done" ;;
        "in-progress") icon="🔄"; label="In Progress" ;;
        "review") icon="👀"; label="In Review" ;;
        "blocked") icon="🚫"; label="Blocked" ;;
        "backlog") icon="📋"; label="Backlog" ;;
    esac
    
    echo "## $icon $label ($count stories)" >> "$DASHBOARD_FILE"
    echo "" >> "$DASHBOARD_FILE"
    
    if [ $count -gt 0 ]; then
        for file in kanban/$state/*.md; do
            if [ -f "$file" ]; then
                # Extract metadata
                story=$(grep "^story:" "$file" | sed 's/story: //')
                title=$(grep "^title:" "$file" | sed 's/title: "//' | sed 's/"$//')
                assigned=$(grep "^assigned:" "$file" | sed 's/assigned: "//' | sed 's/"$//')
                
                # Format entry using just the story field (which already contains epic.story format)
                echo -n "- **[$story]** $title" >> "$DASHBOARD_FILE"
                if [ -n "$assigned" ] && [ "$assigned" != '""' ]; then
                    echo " (assigned: $assigned)" >> "$DASHBOARD_FILE"
                else
                    echo "" >> "$DASHBOARD_FILE"
                fi
                
                # Show blockers if in blocked state
                if [ "$state" = "blocked" ]; then
                    blocked_by=$(grep "^blocked_by:" "$file" | sed 's/blocked_by: //')
                    if [ "$blocked_by" != "[]" ]; then
                        echo "  - ⚠️ Blocked by: $blocked_by" >> "$DASHBOARD_FILE"
                    fi
                fi
            fi
        done
    else
        echo "*No stories in this state*" >> "$DASHBOARD_FILE"
    fi
    echo "" >> "$DASHBOARD_FILE"
done

echo "✓ Dashboard generated at $DASHBOARD_FILE"