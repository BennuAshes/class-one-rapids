#!/bin/bash
#
# Feature to Code Workflow - Compatibility Wrapper
#
# This script provides backward compatibility for the old environment-variable
# based workflow system. It converts old-style invocations to the new CLI format.
#
# For new usage, please use: ./workflow --help
#

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 Note: Using compatibility mode for old workflow system"
echo "   Please migrate to: ./workflow --help"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# Get the input
INPUT="$1"
if [ -z "$INPUT" ]; then
    echo "Error: Feature description, file path, or workflow folder is required"
    echo "Usage: $0 \"feature description\""
    echo
    echo "For new system: ./workflow --help"
    exit 1
fi

# Build arguments array
ARGS=()

# Convert approval mode
if [ -n "${APPROVAL_MODE}" ]; then
    case "${APPROVAL_MODE}" in
        auto)
            ARGS+=("--approval" "minimal")
            echo "📝 Converting APPROVAL_MODE=auto → --approval minimal"
            ;;
        interactive)
            ARGS+=("--approval" "interactive")
            echo "📝 Converting APPROVAL_MODE=interactive → --approval interactive"
            ;;
        file)
            ARGS+=("--approval" "standard")
            echo "📝 Converting APPROVAL_MODE=file → --approval standard"
            ;;
    esac
else
    # Check for combined flags that suggest minimal mode
    if [ "${AUTO_APPLY_FEEDBACK}" = "true" ] && [ "${AUTO_RETRY_AFTER_FEEDBACK}" = "true" ]; then
        ARGS+=("--approval" "minimal")
        echo "📝 Converting AUTO_APPLY_FEEDBACK=true + AUTO_RETRY=true → --approval minimal"
    elif [ "${REQUIRE_COMMAND_APPROVAL}" = "false" ]; then
        ARGS+=("--approval" "minimal")
        echo "📝 Converting REQUIRE_COMMAND_APPROVAL=false → --approval minimal"
    fi
fi

# Convert telemetry setting
if [ "${DISABLE_TELEMETRY:-0}" = "1" ]; then
    ARGS+=("--no-telemetry")
    echo "📝 Converting DISABLE_TELEMETRY=1 → --no-telemetry"
fi

# Convert timeout
if [ -n "${APPROVAL_TIMEOUT}" ] && [ "${APPROVAL_TIMEOUT}" != "0" ]; then
    ARGS+=("--timeout" "${APPROVAL_TIMEOUT}")
    echo "📝 Converting APPROVAL_TIMEOUT=${APPROVAL_TIMEOUT} → --timeout ${APPROVAL_TIMEOUT}"
fi

# Convert webhook
if [ -n "${WEBHOOK_URL}" ]; then
    ARGS+=("--webhook" "${WEBHOOK_URL}")
    echo "📝 Converting WEBHOOK_URL → --webhook"
fi

# Handle workflow engine request
if [ "${WORKFLOW_ENGINE}" = "bash" ]; then
    echo
    echo "⚠️  Warning: WORKFLOW_ENGINE=bash is deprecated"
    echo "   The new system uses Python only for better reliability"
    echo
fi

# Show deprecated variables that are now ignored
if [ "${DISABLE_EXTRACTION:-0}" = "1" ]; then
    echo "⚠️  Warning: DISABLE_EXTRACTION is deprecated (extraction is now always enabled)"
fi

if [ "${SKIP_SPECS_COPY:-0}" = "1" ]; then
    echo "⚠️  Warning: SKIP_SPECS_COPY is deprecated (use --output to control output location)"
fi

if [ "${SHOW_FILE_CHANGES}" = "false" ]; then
    echo "⚠️  Warning: SHOW_FILE_CHANGES=false is deprecated (file tracking is now always enabled)"
fi

echo

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Execute new workflow
echo "🚀 Executing: workflow ${ARGS[@]} \"$INPUT\""
echo
exec "$SCRIPT_DIR/../workflow" "${ARGS[@]}" "$INPUT"