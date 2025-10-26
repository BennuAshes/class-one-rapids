#!/bin/bash
# Quick test script to send a trace to Langfuse
# Usage: ./test-trace.sh

set -e

# Generate random IDs (32 hex chars for trace, 16 for span)
# Use xxd for more reliable hex generation
TRACE_ID=$(xxd -l 16 -p /dev/urandom | tr -d '\n')
SPAN_ID=$(xxd -l 8 -p /dev/urandom | tr -d '\n')
TIMESTAMP=$(date +%s%N)
END_TIMESTAMP=$((TIMESTAMP + 1000000000))
TEST_TIME=$(date '+%Y-%m-%d %H:%M:%S')
TEST_NAME="manual-test-$(date '+%H%M%S')"

# Prepare the JSON payload
BODY=$(cat <<EOF
{
  "resourceSpans": [{
    "resource": {
      "attributes": [{
        "key": "service.name",
        "value": {"stringValue": "test-script"}
      }]
    },
    "scopeSpans": [{
      "spans": [{
        "traceId": "$TRACE_ID",
        "spanId": "$SPAN_ID",
        "name": "$TEST_NAME",
        "kind": 1,
        "startTimeUnixNano": "$TIMESTAMP",
        "endTimeUnixNano": "$END_TIMESTAMP",
        "attributes": [{
          "key": "test.time",
          "value": {"stringValue": "$TEST_TIME"}
        }]
      }]
    }]
  }]
}
EOF
)

echo ""
echo "==============================================="
echo " Langfuse Trace Test"
echo "==============================================="
echo ""
echo "Sending test trace to Langfuse..."
echo "  Trace ID: $TRACE_ID"
echo ""

# Send the trace to Langfuse
HTTP_STATUS=$(curl -s -o /tmp/langfuse-response.json -w "%{http_code}" \
  -X POST \
  -H "Authorization: Basic cGstbGYtZTdiMjViOWMtMzU2Zi00MjY4LTk2Y2YtMDczMThhNGE1ZWU0OnNrLWxmLTk4MGJjZGU3LWZmODQtNDBiMi1iMTI3LTFlNjhhMGI2YzQwNg==" \
  -H "Content-Type: application/json" \
  -d "$BODY" \
  http://localhost:3000/api/public/otel/v1/traces)

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✓ Trace sent successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Wait 10-30 seconds for async processing"
    echo "  2. Go to: http://localhost:3000"
    echo "  3. Select your project"
    echo "  4. Click 'Traces' in the sidebar"
    echo "  5. Look for trace: $TEST_NAME"
    echo ""
else
    echo "✗ Failed with HTTP status: $HTTP_STATUS"
    echo ""
    echo "Response:"
    cat /tmp/langfuse-response.json
    echo ""
    echo ""
    echo "Check if services are running:"
    echo "  docker-compose ps"
    exit 1
fi

# Clean up
rm -f /tmp/langfuse-response.json

