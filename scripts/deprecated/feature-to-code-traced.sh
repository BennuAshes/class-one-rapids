#!/bin/bash
#
# Feature to Code Workflow with Telemetry
# This version uses the Python wrapper for proper telemetry tracking
#
# Usage:
#   ./feature-to-code-traced.sh "feature description"
#   ./feature-to-code-traced.sh /path/to/feature/spec.md
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INPUT="$1"
EXECUTION_ID=$(date +%Y%m%d_%H%M%S)
WORK_DIR="$(pwd)/workflow-outputs/$EXECUTION_ID"
TIMESTAMP=$(date -Iseconds)

# Validate input
if [ -z "$INPUT" ]; then
  echo -e "${RED}Error: Feature description or file path is required${NC}"
  echo "Usage: $0 \"feature description\""
  echo "       $0 /path/to/feature/spec.md"
  exit 1
fi

# Check if Python and required packages are available
if ! command -v python3 &>/dev/null; then
  echo -e "${RED}Error: Python 3 is required${NC}"
  exit 1
fi

# Check if langfuse is installed
if ! python3 -c "import langfuse" &>/dev/null; then
  echo -e "${YELLOW}Installing langfuse SDK...${NC}"
  pip install langfuse
fi

# Create working directory
mkdir -p "$WORK_DIR"

# Check if input is a file or a feature description
if [ -f "$INPUT" ]; then
  echo -e "${BLUE}Reading feature specification from file: $INPUT${NC}"
  FEATURE_DESC=$(cat "$INPUT")
  FEATURE_SOURCE="file: $(basename "$INPUT")"
else
  FEATURE_DESC="$INPUT"
  FEATURE_SOURCE="command line"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Feature to Code Workflow (with Telemetry)${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Execution ID: ${GREEN}$EXECUTION_ID${NC}"
echo -e "Feature Source: ${GREEN}$FEATURE_SOURCE${NC}"
echo -e "Working Directory: ${GREEN}$WORK_DIR${NC}"
echo -e "Timestamp: ${GREEN}$TIMESTAMP${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Configure Langfuse environment
export LANGFUSE_PUBLIC_KEY="pk-lf-e7b25b9c-356f-4268-96cf-07318a4a5ee4"
export LANGFUSE_SECRET_KEY="sk-lf-980bcde7-ff84-40b2-b127-1e68a0b6c406"
export LANGFUSE_HOST="http://localhost:3000"

echo -e "${GREEN}✓ Langfuse telemetry configured${NC}"
echo -e "  Langfuse Host: http://localhost:3000"
echo -e "  Execution ID: $EXECUTION_ID\n"

# Create workflow status file
cat > "$WORK_DIR/workflow-status.json" << EOF
{
  "execution_id": "$EXECUTION_ID",
  "feature_source": "$FEATURE_SOURCE",
  "status": "initializing",
  "started_at": "$(date -Iseconds)",
  "working_directory": "$WORK_DIR",
  "telemetry": "langfuse-sdk",
  "steps": [
    {"name": "Generate PRD", "status": "pending"},
    {"name": "Generate Technical Design", "status": "pending"},
    {"name": "Generate Task List", "status": "pending"},
    {"name": "Execute Tasks", "status": "pending"},
    {"name": "Generate Summary", "status": "pending"}
  ]
}
EOF

# Step 1: Generate PRD
echo -e "${BLUE}[1/5] Starting: Generate Product Requirements Document${NC}"
PRD_FILE="$WORK_DIR/prd_$(date +%Y%m%d).md"

python3 scripts/claude-with-telemetry.py \
  "Generate a comprehensive PRD following the template in .claude/commands/prd.md for the following feature specification:\n\n$FEATURE_DESC" \
  "$EXECUTION_ID" \
  "Generate PRD" > "$PRD_FILE"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}[1/5] ✓ Completed: Generate Product Requirements Document${NC}"
  echo -e "  Output: $PRD_FILE"
  echo -e "  Size: $(wc -c < "$PRD_FILE") bytes\n"
else
  echo -e "${RED}[1/5] ✗ Failed: Generate Product Requirements Document${NC}"
  exit 1
fi

# Step 2: Generate Technical Design
echo -e "${BLUE}[2/5] Starting: Generate Technical Design Document${NC}"
DESIGN_FILE="$WORK_DIR/tdd_$(date +%Y%m%d).md"

TEMP_PROMPT=$(mktemp)
cat > "$TEMP_PROMPT" <<EOF
Read the PRD below and generate a comprehensive Technical Design Document following the template in .claude/commands/design.md.

PRD:
$(cat "$PRD_FILE")
EOF

python3 scripts/claude-with-telemetry.py \
  "$(cat "$TEMP_PROMPT")" \
  "$EXECUTION_ID" \
  "Generate Technical Design" > "$DESIGN_FILE"
rm -f "$TEMP_PROMPT"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}[2/5] ✓ Completed: Generate Technical Design Document${NC}"
  echo -e "  Output: $DESIGN_FILE"
  echo -e "  Size: $(wc -c < "$DESIGN_FILE") bytes\n"
else
  echo -e "${RED}[2/5] ✗ Failed: Generate Technical Design Document${NC}"
  exit 1
fi

# Step 3: Generate Task List
echo -e "${BLUE}[3/5] Starting: Generate Task List${NC}"
TASKS_FILE="$WORK_DIR/tasks_$(date +%Y%m%d).md"

TEMP_PROMPT=$(mktemp)
cat > "$TEMP_PROMPT" <<EOF
Read the Technical Design Document below and generate an executable task list following the template in .claude/commands/tasks.md.

TDD:
$(cat "$DESIGN_FILE")
EOF

python3 scripts/claude-with-telemetry.py \
  "$(cat "$TEMP_PROMPT")" \
  "$EXECUTION_ID" \
  "Generate Task List" > "$TASKS_FILE"
rm -f "$TEMP_PROMPT"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}[3/5] ✓ Completed: Generate Task List${NC}"
  echo -e "  Output: $TASKS_FILE"
  echo -e "  Size: $(wc -c < "$TASKS_FILE") bytes\n"
else
  echo -e "${RED}[3/5] ✗ Failed: Generate Task List${NC}"
  exit 1
fi

# Step 4: Execute Tasks (simplified for this example)
echo -e "${BLUE}[4/5] Starting: Execute Tasks${NC}"
echo -e "${YELLOW}Task execution would happen here...${NC}"
echo -e "${GREEN}[4/5] ✓ Completed: Execute Tasks (simulated)${NC}\n"

# Step 5: Generate Summary
echo -e "${BLUE}[5/5] Starting: Generate Workflow Summary${NC}"
SUMMARY_FILE="$WORK_DIR/workflow-summary.md"

# Use Python to create summary with final telemetry trace
python3 << EOF
import os
from datetime import datetime
from langfuse import Langfuse
from langfuse.decorators import observe, langfuse_context

langfuse = Langfuse()

@observe()
def generate_summary(execution_id, work_dir):
    langfuse_context.update_current_trace(
        name="generate-workflow-summary",
        session_id=execution_id,
        tags=["workflow", "summary"],
        metadata={
            "execution_id": execution_id,
            "step": "5/5"
        }
    )
    
    summary = f"""# Workflow Execution Summary

**Execution ID**: {execution_id}
**Timestamp**: {datetime.now().isoformat()}
**Telemetry**: Langfuse SDK

## Generated Artifacts

1. **Product Requirements Document**: \`prd_$(date +%Y%m%d).md\`
2. **Technical Design Document**: \`tdd_$(date +%Y%m%d).md\`
3. **Task List**: \`tasks_$(date +%Y%m%d).md\`

## Working Directory

All files are located in: \`{work_dir}\`

## Observability

View traces and metrics:
- **Langfuse**: http://localhost:3000
- Search for execution ID: \`{execution_id}\`

## Telemetry Note

This workflow used the Langfuse Python SDK for telemetry tracking.
Each step of the workflow has been traced and is visible in the Langfuse UI.

---
*Generated by Feature to Code Workflow with Telemetry*
*Execution completed at: {datetime.now().isoformat()}*
"""
    
    with open(f"{work_dir}/workflow-summary.md", "w") as f:
        f.write(summary)
    
    langfuse_context.update_current_observation(
        output="Summary generated successfully",
        metadata={"file": f"{work_dir}/workflow-summary.md"}
    )
    
    return summary

# Generate summary
summary = generate_summary("$EXECUTION_ID", "$WORK_DIR")
print("✓ Summary generated")

# Ensure all traces are sent
langfuse.flush()
print("✓ All telemetry data sent to Langfuse")
EOF

echo -e "${GREEN}[5/5] ✓ Completed: Generate Workflow Summary${NC}\n"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Workflow Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Execution ID: ${BLUE}$EXECUTION_ID${NC}"
echo -e "Working Directory: ${BLUE}$WORK_DIR${NC}"
echo -e "Summary: ${BLUE}$SUMMARY_FILE${NC}"
echo ""
echo -e "${YELLOW}View telemetry data:${NC}"
echo -e "  Langfuse: ${BLUE}http://localhost:3000${NC}"
echo -e "  Search for execution ID: ${GREEN}$EXECUTION_ID${NC}"
echo ""
echo -e "Generated files:"
ls -lh "$WORK_DIR"
echo ""

