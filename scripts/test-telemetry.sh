#!/bin/bash
#
# Test if Claude Code telemetry is working
#

set -e

echo "Testing Claude Code Telemetry Setup"
echo "===================================="
echo ""

# Step 1: Check if observability stack is running
echo "[1/4] Checking observability stack..."
if ! docker ps | grep -q "otel-collector"; then
  echo "❌ OTEL Collector is not running!"
  echo "   Start it with: cd observability && docker-compose up -d"
  exit 1
fi
echo "✓ OTEL Collector is running"
echo ""

# Step 2: Check if OTEL endpoint is accessible
echo "[2/4] Checking OTEL endpoint..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:4318/v1/traces | grep -q "405"; then
  echo "✓ OTEL endpoint is accessible (http://localhost:4318)"
else
  echo "❌ OTEL endpoint is not accessible"
  echo "   Check docker-compose logs: docker-compose logs otel-collector"
  exit 1
fi
echo ""

# Step 3: Check if Langfuse is accessible
echo "[3/4] Checking Langfuse..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
  echo "✓ Langfuse is accessible (http://localhost:3000)"
else
  echo "❌ Langfuse is not accessible"
  echo "   Check docker-compose logs: docker-compose logs langfuse-web"
  exit 1
fi
echo ""

# Step 4: Test a simple Claude command with telemetry
echo "[4/4] Testing Claude Code with telemetry..."
echo "   Setting environment variables..."
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
export OTEL_RESOURCE_ATTRIBUTES="service.name=telemetry-test,test=true"

echo "   Environment variables set:"
env | grep -E "(CLAUDE_CODE|OTEL_)" || true
echo ""

echo "   Running test Claude command..."
TEST_ID="test_$(date +%Y%m%d_%H%M%S)"
claude -p "Say 'Hello from telemetry test'" --output-format stream-json > "/tmp/telemetry-test-$TEST_ID.txt" 2>&1 || true

echo ""
echo "===================================="
echo "Telemetry Test Complete!"
echo "===================================="
echo ""
echo "Next steps:"
echo "1. Check Langfuse for traces: http://localhost:3000"
echo "2. Search for 'telemetry-test' in the Langfuse UI"
echo "3. If you see traces, telemetry is working!"
echo ""
echo "If you don't see traces:"
echo "- Check OTEL collector logs: docker-compose logs otel-collector"
echo "- Check Claude Code version supports OTEL"
echo "- Try setting OTEL_LOG_LEVEL=debug for more info"
echo ""
