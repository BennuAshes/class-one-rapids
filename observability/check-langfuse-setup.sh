#!/bin/bash
# Check Langfuse setup and authentication
# Usage: ./check-langfuse-setup.sh

set -e

echo ""
echo "==============================================="
echo " Langfuse Setup Verification"
echo "==============================================="
echo ""

# The base64 encoded auth from your config
AUTH_HEADER="Basic cGstbGYtZTdiMjViOWMtMzU2Zi00MjY4LTk2Y2YtMDczMThhNGE1ZWU0OnNrLWxmLTk4MGJjZGU3LWZmODQtNDBiMi1iMTI3LTFlNjhhMGI2YzQwNg=="

# Decode the auth to show the keys (without revealing secret)
echo "Checking authentication..."
AUTH_DECODED=$(echo "$AUTH_HEADER" | sed 's/Basic //' | base64 -d)
PUBLIC_KEY=$(echo "$AUTH_DECODED" | cut -d: -f1)
echo "  Public Key: $PUBLIC_KEY"
echo ""

# Test 1: Check health endpoint (no auth needed)
echo "1. Testing Langfuse health endpoint..."
HEALTH_STATUS=$(curl -s http://localhost:3000/api/public/health)
echo "   Response: $HEALTH_STATUS"
echo ""

# Test 2: Try to get project info with auth
echo "2. Testing authentication with project endpoint..."
PROJECT_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: $AUTH_HEADER" \
  http://localhost:3000/api/public/projects)

HTTP_STATUS=$(echo "$PROJECT_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$PROJECT_RESPONSE" | grep -v "HTTP_STATUS")

echo "   HTTP Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "   ✓ Authentication successful!"
    echo "   Projects: $BODY"
else
    echo "   ✗ Authentication failed"
    echo "   Response: $BODY"
fi
echo ""

# Test 3: Send a simple trace with the same auth
echo "3. Testing trace ingestion..."
TRACE_ID=$(xxd -l 16 -p /dev/urandom | tr -d '\n')
SPAN_ID=$(xxd -l 8 -p /dev/urandom | tr -d '\n')
TIMESTAMP=$(date +%s%N)
TEST_NAME="auth-test-$(date '+%H%M%S')"

TRACE_BODY=$(cat <<EOF
{
  "resourceSpans": [{
    "resource": {
      "attributes": [{
        "key": "service.name",
        "value": {"stringValue": "auth-test"}
      }]
    },
    "scopeSpans": [{
      "spans": [{
        "traceId": "$TRACE_ID",
        "spanId": "$SPAN_ID",
        "name": "$TEST_NAME",
        "kind": 1,
        "startTimeUnixNano": "$TIMESTAMP",
        "endTimeUnixNano": "$((TIMESTAMP + 1000000000))"
      }]
    }]
  }]
}
EOF
)

TRACE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Authorization: $AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "$TRACE_BODY" \
  http://localhost:3000/api/public/otel/v1/traces)

TRACE_HTTP_STATUS=$(echo "$TRACE_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
TRACE_BODY=$(echo "$TRACE_RESPONSE" | grep -v "HTTP_STATUS")

echo "   HTTP Status: $TRACE_HTTP_STATUS"
if [ "$TRACE_HTTP_STATUS" -eq 200 ] || [ "$TRACE_HTTP_STATUS" -eq 204 ]; then
    echo "   ✓ Trace accepted!"
    echo "   Trace ID: $TRACE_ID"
    echo "   Trace name: $TEST_NAME"
else
    echo "   ✗ Trace rejected"
    echo "   Response: $TRACE_BODY"
fi
echo ""

# Test 4: Check if we need to create a project first
echo "4. Checking if project initialization is needed..."
echo ""
echo "To check your traces in Langfuse:"
echo "  1. Go to http://localhost:3000"
echo "  2. If this is first time, you may need to:"
echo "     - Sign up/login"
echo "     - Create a project"
echo "     - Generate API keys"
echo "  3. Once logged in, navigate to 'Traces' section"
echo ""

# Test 5: Check OTEL collector to Langfuse connection
echo "5. Testing OTEL Collector → Langfuse connection..."
OTEL_TEST_TRACE_ID=$(xxd -l 16 -p /dev/urandom | tr -d '\n')
OTEL_TEST_NAME="otel-auth-test-$(date '+%H%M%S')"

OTEL_TRACE_BODY=$(cat <<EOF
{
  "resourceSpans": [{
    "resource": {
      "attributes": [{
        "key": "service.name",
        "value": {"stringValue": "otel-auth-test"}
      }]
    },
    "scopeSpans": [{
      "spans": [{
        "traceId": "$OTEL_TEST_TRACE_ID",
        "spanId": "$(xxd -l 8 -p /dev/urandom | tr -d '\n')",
        "name": "$OTEL_TEST_NAME",
        "kind": 1,
        "startTimeUnixNano": "$(date +%s%N)",
        "endTimeUnixNano": "$(($(date +%s%N) + 1000000000))"
      }]
    }]
  }]
}
EOF
)

OTEL_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$OTEL_TRACE_BODY" \
  http://localhost:4318/v1/traces)

OTEL_HTTP_STATUS=$(echo "$OTEL_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

echo "   OTEL Collector Status: $OTEL_HTTP_STATUS"
if [ "$OTEL_HTTP_STATUS" -eq 200 ] || [ "$OTEL_HTTP_STATUS" -eq 204 ]; then
    echo "   ✓ Sent to OTEL Collector"
    echo "   Check docker logs: docker logs otel-collector --tail 5"
else
    echo "   ✗ Failed to send to OTEL Collector"
fi
echo ""

echo "Summary:"
echo "--------"
echo "If you're not seeing traces in Langfuse UI, possible issues:"
echo "  1. API keys may be incorrect (regenerate in Langfuse UI)"
echo "  2. Project may not be initialized (login to Langfuse first)"
echo "  3. Check OTEL collector logs for errors: docker logs otel-collector"
echo "  4. Check Langfuse logs: docker logs langfuse-web"
echo ""