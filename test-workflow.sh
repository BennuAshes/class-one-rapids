#!/bin/bash
#
# Workflow Testing Script
#
# Tests the workflow system with mock LLM responses to validate:
# - Basic execution
# - Approval flow
# - State management
# - Mock mode functionality
#

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Workflow System Test Suite${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Cleaning up test artifacts...${NC}"
    rm -rf workflow-outputs/test_*
    rm -f /tmp/workflow_test_*.log
    echo -e "${GREEN}✓ Cleanup complete${NC}"
}

# Trap cleanup on exit
trap cleanup EXIT

# Test 1: Basic Mock Workflow
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 1: Basic Mock Workflow${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

echo -e "${YELLOW}Running workflow with mock mode and minimal approval...${NC}"
START_TIME=$(date +%s)

./workflow --mock --approval test --no-telemetry test-feature.md 2>&1 | tee /tmp/workflow_test_1.log

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Check for errors or warnings
ERROR_COUNT=$(grep -i "error" /tmp/workflow_test_1.log | grep -v "error_message\|Fix any errors" | wc -l || true)
WARNING_COUNT=$(grep -i "warning" /tmp/workflow_test_1.log | grep -v "⚠️" | wc -l || true)

echo
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo -e "${RED}✗ Test 1 found ${ERROR_COUNT} errors${NC}"
    grep -i "error" /tmp/workflow_test_1.log | grep -v "error_message\|Fix any errors"
    exit 1
elif [ "$WARNING_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠  Test 1 found ${WARNING_COUNT} warnings${NC}"
    grep -i "warning" /tmp/workflow_test_1.log | grep -v "⚠️"
else
    echo -e "${GREEN}✓ Test 1 passed in ${DURATION} seconds (no errors or warnings)${NC}"
fi
echo

# Test 2: State Persistence
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 2: State Persistence${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

echo -e "${YELLOW}Running workflow...${NC}"
./workflow --mock --approval test --no-telemetry test-feature.md > /tmp/workflow_test_2.log 2>&1

# Find the latest workflow directory
LATEST_WORKFLOW=$(ls -td workflow-outputs/*/ | head -1)

if [ -f "${LATEST_WORKFLOW}workflow-status.json" ]; then
    echo -e "${GREEN}✓ workflow-status.json exists${NC}"

    # Check JSON is valid
    if python3 -c "import json; json.load(open('${LATEST_WORKFLOW}workflow-status.json'))" 2>/dev/null; then
        echo -e "${GREEN}✓ workflow-status.json is valid JSON${NC}"
    else
        echo -e "${RED}✗ workflow-status.json is invalid${NC}"
        exit 1
    fi

    # Check for required fields
    STATUS=$(python3 -c "import json; print(json.load(open('${LATEST_WORKFLOW}workflow-status.json')).get('status', 'missing'))")
    echo -e "${GREEN}✓ Workflow status: ${STATUS}${NC}"
else
    echo -e "${RED}✗ workflow-status.json not found${NC}"
    exit 1
fi
echo

# Test 3: Mock Mode Speed
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 3: Mock Mode Speed${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

echo -e "${YELLOW}Testing different mock delays...${NC}"

# Test with instant (0s delay)
echo -e "\n  Testing instant mock (--mock-delay 0)..."
START_TIME=$(date +%s)
./workflow --mock --mock-delay 0 --approval minimal --no-telemetry test-feature.md > /tmp/workflow_test_3a.log 2>&1
INSTANT_TIME=$(($(date +%s) - START_TIME))
echo -e "  ${GREEN}✓ Completed in ${INSTANT_TIME}s${NC}"

# Test with default delay (0.1s)
echo -e "\n  Testing default mock (--mock-delay 0.1)..."
START_TIME=$(date +%s)
./workflow --mock --mock-delay 0.1 --approval minimal --no-telemetry test-feature.md > /tmp/workflow_test_3b.log 2>&1
DEFAULT_TIME=$(($(date +%s) - START_TIME))
echo -e "  ${GREEN}✓ Completed in ${DEFAULT_TIME}s${NC}"

echo
echo -e "${GREEN}✓ Test 3 passed${NC}"
echo

# Test 4: Output Validation
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 4: Output Validation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

echo -e "${YELLOW}Checking generated artifacts...${NC}"
LATEST_WORKFLOW=$(ls -td workflow-outputs/*/ | head -1)

# Check for required output files (mock versions)
FILES_TO_CHECK=(
    "prd_*.md"
    "tdd_*.md"
    "tasks_*.md"
)
for pattern in "${FILES_TO_CHECK[@]}"; do
    if ls ${LATEST_WORKFLOW}${pattern} 1> /dev/null 2>&1; then
        FILE=$(ls ${LATEST_WORKFLOW}${pattern} | head -1)
        SIZE=$(wc -c < "$FILE")
        echo -e "${GREEN}✓ Found $(basename "$FILE") (${SIZE} bytes)${NC}"
    else
        echo -e "${RED}✗ Missing file matching pattern: ${pattern}${NC}"
        exit 1
    fi
done

echo
echo -e "${GREEN}✓ Test 4 passed${NC}"
echo

# Test 5: Feature Folder Extraction
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 5: Feature Folder Extraction${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

echo -e "${YELLOW}Testing feature folder organization...${NC}"

# Clean up any existing test feature folder
rm -rf docs/specs/test-feature-simple-calculator-api/

# Run workflow (should extract to feature folder)
./workflow --mock --approval minimal --no-telemetry test-feature.md > /tmp/workflow_test_5.log 2>&1

# Expected feature folder name (generated from test-feature.md content)
FEATURE_FOLDER="docs/specs/test-feature-simple-calculator-api"

if [ -d "$FEATURE_FOLDER" ]; then
    echo -e "${GREEN}✓ Feature folder created: $FEATURE_FOLDER${NC}"

    # Check for extracted artifacts
    EXTRACTED_FILES=0

    if ls ${FEATURE_FOLDER}/prd_extracted_*.md 1> /dev/null 2>&1; then
        echo -e "${GREEN}✓ Found extracted PRD${NC}"
        EXTRACTED_FILES=$((EXTRACTED_FILES + 1))
    else
        echo -e "${RED}✗ Missing extracted PRD${NC}"
    fi

    if ls ${FEATURE_FOLDER}/technical_design_*.md 1> /dev/null 2>&1; then
        echo -e "${GREEN}✓ Found extracted Technical Design${NC}"
        EXTRACTED_FILES=$((EXTRACTED_FILES + 1))
    else
        echo -e "${RED}✗ Missing extracted Technical Design${NC}"
    fi

    if ls ${FEATURE_FOLDER}/tasks_*.md 1> /dev/null 2>&1; then
        echo -e "${GREEN}✓ Found extracted Tasks${NC}"
        EXTRACTED_FILES=$((EXTRACTED_FILES + 1))
    else
        echo -e "${RED}✗ Missing extracted Tasks${NC}"
    fi

    # Check metadata files
    if ls ${FEATURE_FOLDER}/*.metadata.json 1> /dev/null 2>&1; then
        METADATA_COUNT=$(ls ${FEATURE_FOLDER}/*.metadata.json | wc -l)
        echo -e "${GREEN}✓ Found ${METADATA_COUNT} metadata files${NC}"
    fi

    if [ $EXTRACTED_FILES -eq 3 ]; then
        echo -e "${GREEN}✓ All artifacts successfully extracted${NC}"
        echo -e "${GREEN}✓ Test 5 passed${NC}"
    else
        echo -e "${RED}✗ Only ${EXTRACTED_FILES}/3 artifacts extracted${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Feature folder not created at: $FEATURE_FOLDER${NC}"
    echo -e "${YELLOW}Checking workflow output for clues...${NC}"
    grep -i "extract" /tmp/workflow_test_5.log | head -10
    exit 1
fi
echo

# Test 6: Telemetry Integration (Optional)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 6: Telemetry Integration (Optional)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# Check if Langfuse is available (docker containers running)
LANGFUSE_AVAILABLE=false
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/public/health 2>/dev/null | grep -q "200"; then
    LANGFUSE_AVAILABLE=true
    echo -e "${GREEN}✓ Langfuse service detected (http://localhost:3000)${NC}"
else
    echo -e "${YELLOW}⚠  Langfuse service not available - skipping telemetry test${NC}"
    echo -e "  ${YELLOW}To enable: cd observability && ./start.sh${NC}"
fi

if [ "$LANGFUSE_AVAILABLE" = true ]; then
    echo -e "${YELLOW}Running workflow with telemetry enabled...${NC}"
    START_TIME=$(date +%s)

    # Run with telemetry enabled (no --no-telemetry flag)
    ./workflow --mock --approval test test-feature.md > /tmp/workflow_test_6.log 2>&1
    TELEMETRY_EXIT_CODE=$?

    TELEMETRY_TIME=$(($(date +%s) - START_TIME))

    # Check for telemetry errors
    TELEMETRY_ERRORS=$(grep -i "telemetry.*error\|langfuse.*error" /tmp/workflow_test_6.log | wc -l || true)

    if [ $TELEMETRY_EXIT_CODE -eq 0 ]; then
        if [ "$TELEMETRY_ERRORS" -gt 0 ]; then
            echo -e "${YELLOW}⚠  Workflow completed but with telemetry errors${NC}"
            grep -i "telemetry.*error\|langfuse.*error" /tmp/workflow_test_6.log
            echo -e "${YELLOW}✓ Test 6 passed with warnings (${TELEMETRY_TIME}s)${NC}"
        else
            echo -e "${GREEN}✓ Workflow completed with telemetry (${TELEMETRY_TIME}s)${NC}"
            echo -e "${GREEN}✓ Test 6 passed${NC}"
        fi
    else
        echo -e "${RED}✗ Workflow failed with telemetry enabled${NC}"
        tail -20 /tmp/workflow_test_6.log
        exit 1
    fi
else
    echo -e "${GREEN}✓ Test 6 skipped (Langfuse not available)${NC}"
fi
echo

# Final Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo
echo -e "${GREEN}✓ All tests passed!${NC}"
echo
echo -e "Test Results:"
echo -e "  ${GREEN}✓ Basic workflow execution (${DURATION}s)${NC}"
echo -e "  ${GREEN}✓ State persistence${NC}"
echo -e "  ${GREEN}✓ Mock mode speed (instant: ${INSTANT_TIME}s, default: ${DEFAULT_TIME}s)${NC}"
echo -e "  ${GREEN}✓ Output validation${NC}"
echo -e "  ${GREEN}✓ Feature folder extraction${NC}"
if [ "$LANGFUSE_AVAILABLE" = true ]; then
    echo -e "  ${GREEN}✓ Telemetry integration (${TELEMETRY_TIME}s)${NC}"
else
    echo -e "  ${YELLOW}⊘ Telemetry test skipped (Langfuse not running)${NC}"
fi
echo
echo -e "${GREEN}🎉 Workflow system is working correctly!${NC}"
echo
