#!/bin/bash

# Test script for the new chunked runbook generation

echo "=== Testing Chunked Runbook Generation ==="
echo ""

# Clean up any previous test
rm -rf ./test-runbook

echo "1. Testing basic generation (analysis phase only)..."
echo "Command: create-development-runbook-v2.md test-prd-sample.md --phases analysis --output-dir ./test-runbook"
echo ""
echo "This would generate:"
echo "  - ./test-runbook/00-analysis.md"
echo "  - ./test-runbook/index.md"
echo "  - ./test-runbook/progress.json"
echo ""

echo "2. Testing specific phases generation..."
echo "Command: create-development-runbook-v2.md test-prd-sample.md --phases foundation,core --output-dir ./test-runbook"
echo ""
echo "This would generate:"
echo "  - ./test-runbook/01-foundation.md"
echo "  - ./test-runbook/02-core-features.md"
echo ""

echo "3. Testing progress tracking..."
./runbook-progress.sh ./test-runbook status 2>/dev/null || echo "(Would show progress once runbook is generated)"
echo ""

echo "4. Available commands with runbook-progress.sh:"
echo "  - ./runbook-progress.sh ./test-runbook status    # Show progress"
echo "  - ./runbook-progress.sh ./test-runbook list      # List phase files"
echo "  - ./runbook-progress.sh ./test-runbook view core # View specific phase"
echo "  - ./runbook-progress.sh ./test-runbook mark 1.1.1 # Mark task complete"
echo "  - ./runbook-progress.sh ./test-runbook generate  # Check missing phases"
echo ""

echo "=== Benefits of this approach ==="
echo "✓ Each phase is generated separately (no token limit issues)"
echo "✓ Can regenerate specific phases without affecting others"
echo "✓ Progress tracking across phases"
echo "✓ Flexible phase selection"
echo "✓ Clear file organization"
echo ""

echo "To actually run the generation, use:"
echo "claude code .claude/commands/prp/create-development-runbook-v2.md test-prd-sample.md --output-dir ./test-runbook"