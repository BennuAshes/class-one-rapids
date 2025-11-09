#!/bin/bash
# Test script to send a trace through OTEL collector to Langfuse
# Usage: ./test-trace-otel.sh

set -e

# Generate random IDs (32 hex chars for trace, 16 for span)
TRACE_ID=$(xxd -l 16 -p /dev/urandom | tr -d '\n')
SPAN_ID=$(xxd -l 8 -p /dev/urandom | tr -d '\n')
TIMESTAMP=$(date +%s%N)
END_TIMESTAMP=$((TIMESTAMP + 1000000000))
TEST_TIME=$(date '+%Y-%m-%d %H:%M:%S')
TEST_NAME="otel-test-$(date '+%H%M%S')"

# Prepare the JSON payload
BODY=$(cat <<EOF
{
  "resourceSpans": [{
    "resource": {
      "attributes": [{
        "key": "service.name",
        "value": {"stringValue": "test-script-otel"}
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
        "attributes": [
          {
            "key": "test.time",
            "value": {"stringValue": "$TEST_TIME"}
          },
          {
            "key": "test.via",
            "value": {"stringValue": "otel-collector"}
          }
        ]
      }]
    }]
  }]
}
EOF
)

echo ""
echo "==============================================="
echo " OTEL Collector -> Langfuse Trace Test"
echo "==============================================="
echo ""
echo "Sending test trace to OTEL Collector..."
echo "  Trace ID: $TRACE_ID"
echo "  OTEL Endpoint: http://localhost:4318/v1/traces"
echo ""

# Send the trace to OTEL Collector which will forward to Langfuse
HTTP_STATUS=$(curl -s -o /tmp/otel-response.txt -w "%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$BODY" \
  http://localhost:4318/v1/traces)

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 204 ]; then
    echo "✓ Trace sent successfully to OTEL Collector!"
    echo ""
    echo "Trace flow:"
    echo "  1. Test Script → OTEL Collector (port 4318)"
    echo "  2. OTEL Collector → Langfuse (port 3000)"
    echo ""
    echo "Next steps:"
    echo "  1. Check OTEL collector logs: docker logs otel-collector --tail 20"
    echo "  2. Wait 10-30 seconds for processing"
    echo "  3. Go to Langfuse: http://localhost:3000"
    echo "  4. Click 'Traces' in the sidebar"
    echo "  5. Look for trace: $TEST_NAME"
    echo ""
else
    echo "✗ Failed with HTTP status: $HTTP_STATUS"
    echo ""
    echo "Response:"
    cat /tmp/otel-response.txt
    echo ""
    echo ""
    echo "Check if OTEL collector is running:"
    echo "  docker ps | grep otel"
    exit 1
fi

# Clean up
rm -f /tmp/otel-response.txt