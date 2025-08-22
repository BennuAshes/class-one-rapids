#!/bin/bash

# Claude Code conversation export hook
# Exports conversation after each request/response

# Directory for exported conversations
EXPORT_DIR="${CLAUDE_PROJECT_DIR}/convos"
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")

# Create export directory if it doesn't exist
mkdir -p "$EXPORT_DIR"

# Read the hook input (JSON from stdin)
HOOK_INPUT=$(cat)

# Extract relevant fields from the JSON input
SESSION_ID=$(echo "$HOOK_INPUT" | jq -r '.sessionId // "unknown"')
EVENT_TYPE=$(echo "$HOOK_INPUT" | jq -r '.eventType // "unknown"')

# Define export filename based on session and timestamp
EXPORT_FILE="${EXPORT_DIR}/session-${SESSION_ID}-${TIMESTAMP}.json"

# For UserPromptSubmit and Stop events, export the conversation
if [[ "$EVENT_TYPE" == "UserPromptSubmit" ]] || [[ "$EVENT_TYPE" == "Stop" ]]; then
    # Get the current conversation from the session data
    CONVERSATION_FILE="${CLAUDE_PROJECT_DIR}/.claude/sessions/${SESSION_ID}/conversation.json"
    
    if [[ -f "$CONVERSATION_FILE" ]]; then
        # Copy the conversation to our export directory
        cp "$CONVERSATION_FILE" "$EXPORT_FILE"
        
        # Also create a human-readable markdown version
        MARKDOWN_FILE="${EXPORT_DIR}/session-${SESSION_ID}-${TIMESTAMP}.md"
        
        # Convert JSON to markdown format
        echo "# Claude Code Conversation Export" > "$MARKDOWN_FILE"
        echo "**Session ID:** ${SESSION_ID}" >> "$MARKDOWN_FILE"
        echo "**Timestamp:** $(date)" >> "$MARKDOWN_FILE"
        echo "**Event:** ${EVENT_TYPE}" >> "$MARKDOWN_FILE"
        echo "" >> "$MARKDOWN_FILE"
        echo "---" >> "$MARKDOWN_FILE"
        echo "" >> "$MARKDOWN_FILE"
        
        # Parse conversation messages (simplified - you may need to adjust based on actual format)
        jq -r '.messages[]? | "## \(.role // "unknown")\n\n\(.content // "")\n\n---\n"' "$CONVERSATION_FILE" >> "$MARKDOWN_FILE" 2>/dev/null || true
        
        # Log the export
        echo "[$(date)] Exported conversation to: $EXPORT_FILE and $MARKDOWN_FILE" >> "${EXPORT_DIR}/export.log"
    else
        # If no conversation file exists yet, save the current input
        echo "$HOOK_INPUT" > "$EXPORT_FILE"
        echo "[$(date)] Saved hook input to: $EXPORT_FILE" >> "${EXPORT_DIR}/export.log"
    fi
fi

# Always allow the operation to continue
exit 0