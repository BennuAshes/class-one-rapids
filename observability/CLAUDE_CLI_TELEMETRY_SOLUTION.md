# Claude CLI Telemetry Integration Solution

## Problem Summary

The `claude -p` CLI tool **does not have built-in OpenTelemetry support**, despite what some documentation might suggest. The environment variables like `CLAUDE_CODE_ENABLE_TELEMETRY` and `OTEL_EXPORTER_OTLP_ENDPOINT` are not recognized by the Claude CLI itself.

This is why traces from the `feature-to-code.sh` script are not appearing in Langfuse, even though:

- The observability stack is correctly configured
- Test traces sent directly to the OTEL collector work fine
- The environment variables are properly set

## Root Cause

The Claude CLI (`claude -p`) is a command-line tool that:

- Sends requests to Anthropic's API
- Returns responses to stdout
- Does **NOT** emit OpenTelemetry traces
- Does **NOT** recognize OTEL environment variables

The confusion likely stems from:

1. Documentation mixing up different Claude integrations (IDE extensions vs CLI)
2. Aspirational documentation about planned features
3. Misunderstanding about what "Claude Code" refers to

## Solutions

### Solution 1: Python Wrapper with Langfuse SDK (Recommended)

**File**: `scripts/claude-with-telemetry.py`

This wrapper:

- Uses the Langfuse Python SDK for proper telemetry
- Wraps `claude -p` calls with trace instrumentation
- Preserves the original CLI behavior
- Sends traces directly to Langfuse

**Usage**:

```bash
python3 scripts/claude-with-telemetry.py "Your prompt" "execution_id" "step_name"
```

**Modified workflow**: `scripts/feature-to-code-traced.sh`

- Uses the Python wrapper instead of direct `claude -p` calls
- Each workflow step is properly traced
- Execution ID links all steps together

### Solution 2: Manual Telemetry Injection

**File**: `scripts/send-workflow-telemetry.sh`

This approach:

- Sends OTLP traces manually after each step
- Works with the existing `feature-to-code.sh` script
- Minimal changes required

**Usage in feature-to-code.sh**:

```bash
# After each step:
source scripts/send-workflow-telemetry.sh
send_trace_to_langfuse "$EXECUTION_ID" "Generate PRD" "completed" '{"file": "prd.md"}'
```

### Solution 3: Direct Langfuse SDK Integration

For more complex workflows, integrate the Langfuse SDK directly:

```python
from langfuse import Langfuse
from langfuse.decorators import observe

langfuse = Langfuse()

@observe()
def workflow_step(name, prompt):
    # Run claude CLI
    result = subprocess.run(["claude", "-p", prompt], capture_output=True)
    return result.stdout
```

## How to Test

1. **Ensure Langfuse is running**:

   ```bash
   cd observability
   docker-compose ps
   ```

2. **Test the Python wrapper**:

   ```bash
   cd scripts
   python3 claude-with-telemetry.py "What is 2+2?" "test-123" "math-question"
   ```

3. **Run the traced workflow**:

   ```bash
   ./scripts/feature-to-code-traced.sh "Create a user authentication system"
   ```

4. **Check Langfuse**:
   - Go to http://localhost:3000
   - Look for traces with execution_id
   - Each workflow step should appear as a span

## Key Differences from Original Approach

| Original Assumption                  | Reality         | Solution               |
| ------------------------------------ | --------------- | ---------------------- |
| Claude CLI has OTEL support          | No OTEL support | Use wrapper or SDK     |
| `CLAUDE_CODE_ENABLE_TELEMETRY` works | Not recognized  | Use Langfuse SDK       |
| Traces sent automatically            | No traces sent  | Manual instrumentation |
| OTEL collector receives data         | No data sent    | Send via SDK or manual |

## Environment Variables That Actually Work

For Langfuse SDK (Python):

```bash
export LANGFUSE_PUBLIC_KEY="pk-lf-e7b25b9c-356f-4268-96cf-07318a4a5ee4"
export LANGFUSE_SECRET_KEY="sk-lf-980bcde7-ff84-40b2-b127-1e68a0b6c406"
export LANGFUSE_HOST="http://localhost:3000"
```

For manual OTLP traces:

```bash
# Send to OTEL Collector endpoint
OTEL_ENDPOINT="http://localhost:4318/v1/traces"
```

## Troubleshooting

1. **No traces in Langfuse**:

   - Check if Langfuse services are running
   - Verify SDK credentials are correct
   - Look for errors in Python output
   - Check docker logs: `docker logs langfuse-web`

2. **Python import errors**:

   ```bash
   pip install langfuse
   ```

3. **Claude CLI not found**:
   - Ensure `claude` is in PATH
   - Or use full path in the wrapper

## Conclusion

The Claude CLI does not have built-in telemetry support. To get observability for your `feature-to-code.sh` workflow, use one of the wrapper solutions provided. The Python wrapper with Langfuse SDK is the most robust solution and provides the best integration with your existing observability stack.

