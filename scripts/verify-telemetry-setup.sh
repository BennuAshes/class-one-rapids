#!/bin/bash
#
# Verify Telemetry Setup
# Quick checks to ensure everything is configured correctly
#

echo "Telemetry Setup Verification"
echo "============================="
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

# Check 1: Docker running
echo -n "✓ Checking Docker... "
if docker ps > /dev/null 2>&1; then
  echo "OK"
  ((CHECKS_PASSED++))
else
  echo "FAILED (Docker not running)"
  ((CHECKS_FAILED++))
fi

# Check 2: OTEL Collector
echo -n "✓ Checking OTEL Collector... "
if docker ps | grep -q "otel-collector"; then
  echo "OK (running)"
  ((CHECKS_PASSED++))
else
  echo "FAILED (not running - run: cd observability && docker-compose up -d)"
  ((CHECKS_FAILED++))
fi

# Check 3: Langfuse
echo -n "✓ Checking Langfuse... "
if docker ps | grep -q "langfuse-web"; then
  echo "OK (running)"
  ((CHECKS_PASSED++))
else
  echo "FAILED (not running)"
  ((CHECKS_FAILED++))
fi

# Check 4: OTEL HTTP endpoint
echo -n "✓ Checking OTEL HTTP endpoint (4318)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4318/v1/traces -X POST -H "Content-Type: application/json" -d '{}' 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "405" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "OK (accessible)"
  ((CHECKS_PASSED++))
else
  echo "FAILED (got HTTP $HTTP_CODE)"
  ((CHECKS_FAILED++))
fi

# Check 5: Langfuse web UI
echo -n "✓ Checking Langfuse UI (3000)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo "OK (accessible)"
  ((CHECKS_PASSED++))
else
  echo "FAILED (got HTTP $HTTP_CODE)"
  ((CHECKS_FAILED++))
fi

# Check 6: OTEL collector config
echo -n "✓ Checking OTEL collector config... "
if [ -f "observability/otel-collector-config.yaml" ]; then
  if grep -q "otlphttp/langfuse" "observability/otel-collector-config.yaml"; then
    echo "OK (configured)"
    ((CHECKS_PASSED++))
  else
    echo "FAILED (Langfuse exporter not configured)"
    ((CHECKS_FAILED++))
  fi
else
  echo "FAILED (config file not found)"
  ((CHECKS_FAILED++))
fi

echo ""
echo "============================="
echo "Results: $CHECKS_PASSED passed, $CHECKS_FAILED failed"
echo "============================="
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo "✓ All checks passed! Telemetry should work."
  echo ""
  echo "To test telemetry, run:"
  echo "  ./scripts/feature-to-code.sh \"test feature\""
  echo ""
  echo "Then check Langfuse:"
  echo "  http://localhost:3000"
  echo ""
else
  echo "❌ Some checks failed. Fix the issues above before running telemetry."
  echo ""
  if ! docker ps | grep -q "otel-collector"; then
    echo "Quick fix: Start observability stack"
    echo "  cd observability && docker-compose up -d"
    echo ""
  fi
fi
