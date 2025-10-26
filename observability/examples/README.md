# Langfuse Tracing Examples

This directory contains examples of how to use the Langfuse SDK for direct tracing in your workflows.

## Overview

While Claude Code sends telemetry via OpenTelemetry (OTLP), you can also use the Langfuse SDK directly for:

- **Custom workflows** - Trace your own automation scripts
- **Application monitoring** - Monitor your React Native app
- **LLM call tracking** - Track Claude API calls with token usage
- **Complex workflows** - Create nested spans for detailed observability

## Available Examples

### Python - `langfuse-tracing-python.py`

Demonstrates:
- ✅ `@observe` decorator pattern (recommended)
- ✅ Manual trace creation
- ✅ LLM call tracing with token usage
- ✅ Automatic nested spans

**Run it:**
```bash
# Install dependencies
pip install langfuse

# Run the example (environment variables are already set by feature-to-code.sh)
python observability/examples/langfuse-tracing-python.py
```

### TypeScript - `langfuse-tracing-typescript.ts`

Demonstrates:
- ✅ Manual trace and span creation
- ✅ LLM call tracing
- ✅ Nested workflows
- ✅ Error tracking
- ✅ Integration with existing workflows

**Run it:**
```bash
# Install dependencies
npm install langfuse ts-node @types/node

# Run the example
npx ts-node observability/examples/langfuse-tracing-typescript.ts
```

## Environment Variables

The `feature-to-code.sh` script automatically sets these:

```bash
LANGFUSE_PUBLIC_KEY="pk-lf-e7b25b9c-356f-4268-96cf-07318a4a5ee4"
LANGFUSE_SECRET_KEY="sk-lf-980bcde7-ff84-40b2-b127-1e68a0b6c406"
LANGFUSE_HOST="http://localhost:3000"
```

These are the same keys used by the OTEL collector, so all traces go to the same Langfuse instance.

## Use Cases

### 1. Trace Custom Scripts

```python
from langfuse.decorators import observe

@observe()
def my_automation_step():
    # Your code here
    pass
```

### 2. Track LLM Calls

```python
@observe()
def call_claude(prompt):
    # Call Claude API
    response = anthropic.messages.create(...)

    # Token usage is automatically tracked if you update the observation
    langfuse_context.update_current_observation(
        usage={
            "input": response.usage.input_tokens,
            "output": response.usage.output_tokens,
            "total": response.usage.input_tokens + response.usage.output_tokens,
        }
    )

    return response
```

### 3. Build Workflow Visibility

```python
@observe()
def feature_workflow(feature_desc):
    prd = generate_prd(feature_desc)  # Automatically traced
    design = generate_design(prd)    # Automatically traced
    tasks = generate_tasks(design)   # Automatically traced
    return tasks
```

### 4. Monitor React Native App

```typescript
import { Langfuse } from "langfuse";

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_HOST,
});

// Track user actions
function trackUserAction(action: string, metadata: any) {
  const trace = langfuse.trace({
    name: "user-action",
    userId: currentUser.id,
    metadata: { action, ...metadata },
  });
}
```

## Viewing Traces

1. Open Langfuse: http://localhost:3000
2. Navigate to your project
3. Click **Traces** tab
4. Search by:
   - Execution ID
   - Session ID
   - Tags (e.g., "workflow", "llm")
   - User ID

## Best Practices

### 1. Use Descriptive Names
```python
# Good
@observe(name="generate-technical-design")
def create_design():
    pass

# Bad
@observe(name="step2")
def create_design():
    pass
```

### 2. Add Rich Metadata
```python
langfuse_context.update_current_observation(
    metadata={
        "feature": feature_name,
        "step": "3/5",
        "file_size": file_size,
    },
    tags=["workflow", "automated", "prd"]
)
```

### 3. Track Errors
```python
@observe()
def risky_operation():
    try:
        # Your code
        pass
    except Exception as e:
        langfuse_context.update_current_observation(
            level="ERROR",
            status_message=str(e),
            metadata={"error": str(e)}
        )
        raise
```

### 4. Use Sessions for Workflows
```python
# Group related traces by execution ID
langfuse_context.update_current_trace(
    session_id=execution_id,
    tags=["workflow"]
)
```

## Combining with OTLP

Your workflows get **dual tracking**:

1. **OTLP (automatic)** - Claude Code's native telemetry
2. **Langfuse SDK (manual)** - Your custom tracing

Both appear in the same Langfuse instance, giving you complete observability!

## Resources

- [Langfuse Python SDK](https://langfuse.com/docs/sdk/python)
- [Langfuse JS/TS SDK](https://langfuse.com/docs/sdk/typescript)
- [Langfuse Tracing Guide](https://langfuse.com/docs/observability/get-started)
- [OpenTelemetry Integration](https://langfuse.com/docs/integrations/opentelemetry)

## Troubleshooting

### No traces appearing?

1. Check environment variables are set:
   ```bash
   echo $LANGFUSE_PUBLIC_KEY
   echo $LANGFUSE_SECRET_KEY
   ```

2. Verify Langfuse is running:
   ```bash
   curl http://localhost:3000
   ```

3. Check for errors in your script output

4. Flush traces explicitly:
   ```python
   langfuse.flush()  # Python
   await langfuse.flushAsync()  // TypeScript
   ```

### Rate limiting?

Langfuse batches traces. If you're sending many traces quickly, add a flush:

```python
for i in range(100):
    trace_something()
    if i % 10 == 0:
        langfuse.flush()  # Flush every 10 traces
```
