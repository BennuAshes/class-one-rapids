#!/bin/bash
#
# Observable Next Feature Full Flow
# Uses Claude Code's native OpenTelemetry support to track the entire workflow
#
# Usage: ./next-feature-full-flow-observable.sh "feature description"
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FEATURE_DESC="$1"
EXECUTION_ID=$(date +%Y%m%d_%H%M%S)
WORK_DIR="$(pwd)/workflow-outputs/$EXECUTION_ID"
TIMESTAMP=$(date -Iseconds)

# Validate input
if [ -z "$FEATURE_DESC" ]; then
  echo -e "${RED}Error: Feature description is required${NC}"
  echo "Usage: $0 \"feature description\""
  exit 1
fi

# Create working directory
mkdir -p "$WORK_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Observable Workflow Execution${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Execution ID: ${GREEN}$EXECUTION_ID${NC}"
echo -e "Feature: ${GREEN}$FEATURE_DESC${NC}"
echo -e "Working Directory: ${GREEN}$WORK_DIR${NC}"
echo -e "Timestamp: ${GREEN}$TIMESTAMP${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Configure OpenTelemetry for Claude Code
echo -e "${YELLOW}Configuring OpenTelemetry...${NC}"
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"

# Add execution metadata as resource attributes
export OTEL_RESOURCE_ATTRIBUTES="service.name=next-feature-full-flow,execution.id=$EXECUTION_ID,feature.description=$FEATURE_DESC"

echo -e "${GREEN}✓ OpenTelemetry configured${NC}"
echo -e "  Endpoint: http://localhost:4318"
echo -e "  Execution ID: $EXECUTION_ID\n"

# Function to log workflow steps
log_step() {
  local step_num=$1
  local step_name=$2
  local status=$3

  if [ "$status" = "start" ]; then
    echo -e "${BLUE}[$step_num/6] Starting: $step_name${NC}"
  elif [ "$status" = "complete" ]; then
    echo -e "${GREEN}[$step_num/6] ✓ Completed: $step_name${NC}\n"
  elif [ "$status" = "error" ]; then
    echo -e "${RED}[$step_num/6] ✗ Failed: $step_name${NC}\n"
  fi
}

# Function to request human approval
request_approval() {
  local checkpoint=$1
  local file=$2

  echo -e "${YELLOW}========================================${NC}"
  echo -e "${YELLOW}APPROVAL CHECKPOINT: $checkpoint${NC}"
  echo -e "${YELLOW}========================================${NC}"
  echo -e "Review the generated file: ${GREEN}$file${NC}"
  echo ""
  echo "Preview:"
  echo -e "${BLUE}----------------------------------------${NC}"
  head -n 20 "$file"
  echo -e "${BLUE}----------------------------------------${NC}"
  echo ""

  read -p "Approve and continue? (y/n/e to edit): " approval

  case $approval in
    y|Y)
      echo -e "${GREEN}✓ Approved - continuing workflow${NC}\n"
      return 0
      ;;
    e|E)
      echo -e "${YELLOW}Opening file for editing...${NC}"
      ${EDITOR:-nano} "$file"
      echo -e "${GREEN}✓ Edits saved - continuing workflow${NC}\n"
      return 0
      ;;
    *)
      echo -e "${RED}✗ Rejected - workflow stopped${NC}"
      exit 1
      ;;
  esac
}

# Step 1: Generate feature description
log_step 1 "Generate feature description" "start"
FEATURE_FILE="$WORK_DIR/feature-description.md"

claude -p "You are helping plan a new feature. Generate a detailed feature description for: '$FEATURE_DESC'. Include: 1) Overview, 2) User needs addressed, 3) Key capabilities, 4) Success criteria. Output markdown." \
  --output-format stream-json > "$FEATURE_FILE"

if [ $? -eq 0 ]; then
  log_step 1 "Generate feature description" "complete"
  echo -e "  Output: $FEATURE_FILE"
  echo -e "  Size: $(wc -c < "$FEATURE_FILE") bytes"
else
  log_step 1 "Generate feature description" "error"
  exit 1
fi

# Approval checkpoint
request_approval "Feature Description" "$FEATURE_FILE"

# Step 2: Generate PRD
log_step 2 "Generate Product Requirements Document" "start"
PRD_FILE="$WORK_DIR/prd_$(date +%Y%m%d).md"

claude -p "Read the feature description and generate a comprehensive PRD following the template in .claude/commands/prd.md. Feature description: $(cat "$FEATURE_FILE")" \
  --output-format stream-json > "$PRD_FILE"

if [ $? -eq 0 ]; then
  log_step 2 "Generate Product Requirements Document" "complete"
  echo -e "  Output: $PRD_FILE"
  echo -e "  Size: $(wc -c < "$PRD_FILE") bytes"
else
  log_step 2 "Generate Product Requirements Document" "error"
  exit 1
fi

# Approval checkpoint
request_approval "PRD" "$PRD_FILE"

# Step 3: Generate Technical Design
log_step 3 "Generate Technical Design Document" "start"
DESIGN_FILE="$WORK_DIR/tdd_$(date +%Y%m%d).md"

claude -p "Read the PRD and generate a comprehensive Technical Design Document following the template in .claude/commands/design.md. PRD: $(cat "$PRD_FILE")" \
  --output-format stream-json > "$DESIGN_FILE"

if [ $? -eq 0 ]; then
  log_step 3 "Generate Technical Design Document" "complete"
  echo -e "  Output: $DESIGN_FILE"
  echo -e "  Size: $(wc -c < "$DESIGN_FILE") bytes"
else
  log_step 3 "Generate Technical Design Document" "error"
  exit 1
fi

# Approval checkpoint
request_approval "Technical Design" "$DESIGN_FILE"

# Step 4: Generate Task List
log_step 4 "Generate Task List" "start"
TASKS_FILE="$WORK_DIR/tasks_$(date +%Y%m%d).md"

claude -p "Read the Technical Design Document and generate an executable task list following the template in .claude/commands/tasks.md. TDD: $(cat "$DESIGN_FILE")" \
  --output-format stream-json > "$TASKS_FILE"

if [ $? -eq 0 ]; then
  log_step 4 "Generate Task List" "complete"
  echo -e "  Output: $TASKS_FILE"
  echo -e "  Size: $(wc -c < "$TASKS_FILE") bytes"
else
  log_step 4 "Generate Task List" "error"
  exit 1
fi

# Approval checkpoint
request_approval "Task List" "$TASKS_FILE"

# Step 5: Execute Tasks (optional - user can run separately)
log_step 5 "Execute Tasks" "start"
echo -e "${YELLOW}Task execution is optional. You can:${NC}"
echo -e "  1. Review tasks manually: $TASKS_FILE"
echo -e "  2. Execute tasks: /execute-tasks $TASKS_FILE"
echo ""
read -p "Execute tasks now? (y/n): " execute_now

if [ "$execute_now" = "y" ] || [ "$execute_now" = "Y" ]; then
  echo -e "${BLUE}Executing tasks...${NC}"
  # This would call the execute-tasks command
  # For now, we'll skip actual execution to avoid unintended changes
  echo -e "${YELLOW}Note: Task execution integration pending${NC}"
  log_step 5 "Execute Tasks" "complete"
else
  echo -e "${YELLOW}Skipping task execution${NC}"
  log_step 5 "Execute Tasks" "complete"
fi

# Step 6: Workflow Summary
log_step 6 "Generate Workflow Summary" "start"
SUMMARY_FILE="$WORK_DIR/workflow-summary.md"

cat > "$SUMMARY_FILE" << EOF
# Workflow Execution Summary

**Execution ID**: $EXECUTION_ID
**Feature**: $FEATURE_DESC
**Timestamp**: $TIMESTAMP

## Generated Artifacts

1. **Feature Description**: \`$(basename "$FEATURE_FILE")\`
2. **Product Requirements Document**: \`$(basename "$PRD_FILE")\`
3. **Technical Design Document**: \`$(basename "$DESIGN_FILE")\`
4. **Task List**: \`$(basename "$TASKS_FILE")\`

## Working Directory

All files are located in: \`$WORK_DIR\`

## Observability

View traces and metrics:
- **Langfuse**: http://localhost:3000
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090

Search for execution ID: \`$EXECUTION_ID\`

## Next Steps

1. Review all generated documents
2. Execute tasks: \`/execute-tasks $TASKS_FILE\`
3. Analyze workflow metrics in observability dashboards
4. Iterate based on feedback

---
*Generated by Observable Next Feature Full Flow*
*Execution completed at: $(date -Iseconds)*
EOF

log_step 6 "Generate Workflow Summary" "complete"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Workflow Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Execution ID: ${BLUE}$EXECUTION_ID${NC}"
echo -e "Working Directory: ${BLUE}$WORK_DIR${NC}"
echo -e "Summary: ${BLUE}$SUMMARY_FILE${NC}"
echo ""
echo -e "${YELLOW}View observability data:${NC}"
echo -e "  Langfuse: ${BLUE}http://localhost:3000${NC}"
echo -e "  Grafana:  ${BLUE}http://localhost:3001${NC}"
echo -e "  Search for execution ID: ${GREEN}$EXECUTION_ID${NC}"
echo ""
echo -e "Generated files:"
ls -lh "$WORK_DIR"
echo ""
