#!/bin/bash
#
# Send telemetry data for workflow steps to Langfuse
# This can be called after each step in the feature-to-code.sh workflow
#

send_trace_to_langfuse() {
  local execution_id=$1
  local step_name=$2
  local status=$3
  local metadata=$4
  
  # Generate IDs
  local trace_id=$(xxd -l 16 -p /dev/urandom | tr -d '\n')
  local span_id=$(xxd -l 8 -p /dev/urandom | tr -d '\n')
  local timestamp=$(date +%s%N)
  local end_timestamp=$((timestamp + 1000000))
  
  # Build JSON payload
  local body=$(cat <<EOF
{
  "resourceSpans": [{
    "resource": {
      "attributes": [
        {"key": "service.name", "value": {"stringValue": "feature-to-code"}},
        {"key": "execution.id", "value": {"stringValue": "$execution_id"}}
      ]
    },
    "scopeSpans": [{
      "spans": [{
        "traceId": "$trace_id",
        "spanId": "$span_id",
        "name": "$step_name",
        "kind": 1,
        "startTimeUnixNano": "$timestamp",
        "endTimeUnixNano": "$end_timestamp",
        "attributes": [
          {"key": "workflow.step", "value": {"stringValue": "$step_name"}},
          {"key": "workflow.status", "value": {"stringValue": "$status"}},
          {"key": "workflow.metadata", "value": {"stringValue": "$metadata"}}
        ]
      }]
    }]
  }]
}
EOF
)
  
  # Send to OTEL Collector
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$body" \
    http://localhost:4318/v1/traces > /dev/null
}

# Example usage:
# send_trace_to_langfuse "20241026_123456" "Generate PRD" "completed" '{"file": "prd_20241026.md", "size": 5432}'

