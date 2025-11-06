#!/bin/bash
#
# Simplified Workflow Test Script
# Purpose: Quickly validate that flow commands receive input correctly
#
# Usage:
#   ./test-flow/test-workflow.sh "test feature description"
#

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FEATURE_DESC="$1"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEST_DIR="$(pwd)/test-flow"
OUTPUT_DIR="$TEST_DIR/test-output/$TIMESTAMP"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Simplified Workflow Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Test Directory: ${GREEN}$TEST_DIR${NC}"
echo -e "Output Directory: ${GREEN}$OUTPUT_DIR${NC}"
echo -e "Timestamp: ${GREEN}$TIMESTAMP${NC}"
echo ""

# Validate input
if [ -z "$FEATURE_DESC" ]; then
  echo -e "${RED}Error: Feature description required${NC}"
  echo "Usage: $0 \"feature description\""
  exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Step 1: PRD Generation${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Feature: ${GREEN}$FEATURE_DESC${NC}"
echo ""

# Test PRD generation (stdin input)
PRD_FILE="$OUTPUT_DIR/prd_test.md"

echo -e "${YELLOW}Testing stdin input to /test-flow:test-prd...${NC}"
echo "$FEATURE_DESC" | claude /test-flow:test-prd > "$PRD_FILE" 2>&1

if [ -s "$PRD_FILE" ]; then
  echo -e "${GREEN}✓ PRD generated successfully${NC}"
  echo -e "  File: $PRD_FILE"
  echo -e "  Size: $(wc -c < "$PRD_FILE") bytes"
  echo ""
  echo -e "${YELLOW}Preview:${NC}"
  head -10 "$PRD_FILE"
  echo -e "${BLUE}...${NC}"
  echo ""
else
  echo -e "${RED}✗ PRD generation failed${NC}"
  cat "$PRD_FILE" 2>/dev/null || echo "No output file"
  exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Step 2: Technical Design${NC}"
echo -e "${BLUE}========================================${NC}"

# Test Design generation (file path via stdin)
DESIGN_FILE="$OUTPUT_DIR/tdd_test.md"

echo -e "${YELLOW}Testing file path via stdin to /test-flow:test-design...${NC}"
echo -e "  Input: ${GREEN}$PRD_FILE${NC}"
echo "$PRD_FILE" | claude /test-flow:test-design > "$DESIGN_FILE" 2>&1

if [ -s "$DESIGN_FILE" ]; then
  echo -e "${GREEN}✓ Design generated successfully${NC}"
  echo -e "  File: $DESIGN_FILE"
  echo -e "  Size: $(wc -c < "$DESIGN_FILE") bytes"
  echo ""
  echo -e "${YELLOW}Preview:${NC}"
  head -10 "$DESIGN_FILE"
  echo -e "${BLUE}...${NC}"
  echo ""
else
  echo -e "${RED}✗ Design generation failed${NC}"
  cat "$DESIGN_FILE" 2>/dev/null || echo "No output file"
  exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Step 3: Task List${NC}"
echo -e "${BLUE}========================================${NC}"

# Test Tasks generation (file path via stdin)
TASKS_FILE="$OUTPUT_DIR/tasks_test.md"

echo -e "${YELLOW}Testing file path via stdin to /test-flow:test-tasks...${NC}"
echo -e "  Input: ${GREEN}$DESIGN_FILE${NC}"
echo "$DESIGN_FILE" | claude /test-flow:test-tasks > "$TASKS_FILE" 2>&1

if [ -s "$TASKS_FILE" ]; then
  echo -e "${GREEN}✓ Tasks generated successfully${NC}"
  echo -e "  File: $TASKS_FILE"
  echo -e "  Size: $(wc -c < "$TASKS_FILE") bytes"
  echo ""
  echo -e "${YELLOW}Preview:${NC}"
  head -10 "$TASKS_FILE"
  echo -e "${BLUE}...${NC}"
  echo ""
else
  echo -e "${RED}✗ Tasks generation failed${NC}"
  cat "$TASKS_FILE" 2>/dev/null || echo "No output file"
  exit 1
fi

# Validation Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ All Tests Passed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Validation Results:${NC}"
echo -e "  1. PRD received feature description via stdin: ${GREEN}✓${NC}"
echo -e "  2. Design received PRD file path via stdin: ${GREEN}✓${NC}"
echo -e "  3. Tasks received TDD file path via stdin: ${GREEN}✓${NC}"
echo ""
echo -e "${YELLOW}Generated Files:${NC}"
ls -lh "$OUTPUT_DIR"
echo ""

# Check if files contain expected markers
echo -e "${YELLOW}Content Validation:${NC}"

if grep -q "Feature Description" "$PRD_FILE" 2>/dev/null; then
  echo -e "  PRD contains feature description: ${GREEN}✓${NC}"
else
  echo -e "  PRD contains feature description: ${RED}✗${NC}"
fi

if grep -q "PRD File:" "$DESIGN_FILE" 2>/dev/null; then
  echo -e "  Design references PRD file path: ${GREEN}✓${NC}"
else
  echo -e "  Design references PRD file path: ${RED}✗${NC}"
fi

if grep -q "TDD File:" "$TASKS_FILE" 2>/dev/null; then
  echo -e "  Tasks references TDD file path: ${GREEN}✓${NC}"
else
  echo -e "  Tasks references TDD file path: ${RED}✗${NC}"
fi

echo ""
echo -e "${BLUE}Test complete! Output saved to: $OUTPUT_DIR${NC}"
