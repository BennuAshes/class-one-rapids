#!/bin/bash
#
# Feature to Code Workflow - Simplified Wrapper
#
# This is a thin wrapper around the Python implementation.
# All logic is handled in Python for maintainability.
#
# Usage:
#   workflow "feature description"
#   workflow feature.md
#   workflow --help
#

# Ensure we're in the right directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Pass Langfuse config from environment if available
export LANGFUSE_PUBLIC_KEY="${LANGFUSE_PUBLIC_KEY:-pk-lf-e7b25b9c-356f-4268-96cf-07318a4a5ee4}"
export LANGFUSE_SECRET_KEY="${LANGFUSE_SECRET_KEY:-sk-lf-980bcde7-ff84-40b2-b127-1e68a0b6c406}"
export LANGFUSE_HOST="${LANGFUSE_HOST:-http://localhost:3000}"

# Execute Python workflow with all arguments
exec python3 "$SCRIPT_DIR/scripts/workflow.py" "$@"