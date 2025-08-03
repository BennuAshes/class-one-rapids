#!/bin/bash
# Fix initial story states after migration

echo "Fixing story states to reflect actual development status..."

# Move Epic 1 stories from done to backlog (since they're not actually implemented)
for story in epic-1-story-*.md; do
    if [ -f "kanban/done/$story" ]; then
        echo "Moving $story from done to backlog (not actually implemented yet)"
        mv "kanban/done/$story" "kanban/backlog/$story"
        
        # Update status in file
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' 's/status: "done"/status: "backlog"/' "kanban/backlog/$story"
        else
            sed -i 's/status: "done"/status: "backlog"/' "kanban/backlog/$story"
        fi
    fi
done

# If you want to mark Story 1.1 as in-progress since it's foundational:
# mv "kanban/backlog/epic-1-story-1-1-project-architecture.md" "kanban/in-progress/epic-1-story-1-1-project-architecture.md"
# sed -i 's/status: "backlog"/status: "in-progress"/' "kanban/in-progress/epic-1-story-1-1-project-architecture.md"

echo "Status fix complete!"
echo ""
echo "Current state:"
echo "- All stories moved to backlog (since no actual implementation exists)"
echo "- Run ./generate-dashboard.sh to see updated progress"
echo ""
echo "To start work on a story, use:"
echo "./move-story.sh <story-file> in-progress"