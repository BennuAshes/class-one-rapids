# Using Claude CLI for LLM-as-Judge Evaluations

## Overview

The Langfuse evaluators now use the **local Claude CLI** (`claude -p`) instead of requiring separate API keys. This provides a seamless, consistent authentication experience across the entire feature-to-code workflow.

## Benefits

✅ **No Additional API Keys**: Uses the same Claude CLI authentication as your workflow  
✅ **Consistent Approach**: Same method used in `feature-to-code-unified.sh`  
✅ **Simplified Setup**: No need to manage `ANTHROPIC_API_KEY`  
✅ **Local Control**: Leverages your existing Claude CLI configuration

## How It Works

### Before (API-based)

```python
# Required ANTHROPIC_API_KEY environment variable
import anthropic
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
message = client.messages.create(...)
```

### After (CLI-based)

```python
# Uses local Claude CLI authentication
import subprocess
result = subprocess.run(['claude', '-p', prompt_file], ...)
```

## Architecture

```
┌─────────────────────────────────────────────┐
│  langfuse_evaluators.py                     │
│                                              │
│  evaluate_prd(content)                      │
│  evaluate_design(content)                   │
│  evaluate_tasks(content)                    │
│         ↓                                    │
│  call_llm_judge(prompt)                     │
│         ↓                                    │
│  subprocess.run(['claude', '-p', file])     │
│         ↓                                    │
│  Parse JSON response                        │
│         ↓                                    │
│  Return Score objects                       │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│  Claude CLI (local)                         │
│  - Uses your authentication                 │
│  - Same as workflow uses                    │
│  - Returns JSON evaluation                  │
└─────────────────────────────────────────────┘
```

## Setup

### Prerequisites

1. **Claude CLI Installed and Authenticated**

   ```bash
   claude --version
   # Should show version, indicating CLI is working
   ```

2. **Langfuse Running** (for logging scores)

   ```bash
   cd observability
   docker-compose up -d
   ```

3. **Environment Variables Set**
   ```bash
   export LANGFUSE_PUBLIC_KEY="pk-lf-e7b25b9c-356f-4268-96cf-07318a4a5ee4"
   export LANGFUSE_SECRET_KEY="sk-lf-980bcde7-ff84-40b2-b127-1e68a0b6c406"
   export LANGFUSE_HOST="http://localhost:3000"
   # Note: NO ANTHROPIC_API_KEY needed!
   ```

### Dependencies

```bash
# Install Python dependencies
pip install langfuse pyyaml requests

# anthropic package is NO LONGER required
# Claude CLI handles authentication separately
```

## Usage

### Basic Evaluation

```python
from scripts.langfuse_evaluators import evaluate_prd

# Read your PRD
prd_content = open("workflow-outputs/20251026_183132/prd_20251026.md").read()

# Evaluate using Claude CLI
scores = evaluate_prd(prd_content)

print(f"Completeness: {scores.completeness}/10")
print(f"Clarity: {scores.clarity}/10")
print(f"Technical Depth: {scores.technical_depth}/10")
print(f"Overall: {scores.overall}")
print(f"Reasoning: {scores.reasoning}")
```

### Integrated with Langfuse

```python
from langfuse import Langfuse
from scripts.langfuse_evaluators import evaluate_prd

langfuse = Langfuse()

# Create trace
trace = langfuse.trace(
    name="prd-evaluation",
    session_id="my-workflow-123"
)

# Evaluate PRD
scores = evaluate_prd(prd_content)

# Log scores to Langfuse
langfuse.score(
    trace_id=trace.id,
    name="prd_completeness",
    value=scores.completeness,
    comment=scores.reasoning
)
```

## How Scores Are Generated

1. **Prompt Creation**: Evaluator formats a structured prompt with evaluation criteria
2. **CLI Invocation**: `claude -p prompt.txt` is called via subprocess
3. **LLM Analysis**: Claude reads the artifact and criteria, generates scores
4. **JSON Response**: Claude returns structured JSON with scores
5. **Parsing**: JSON is parsed into Score objects
6. **Langfuse Logging**: Scores are logged to Langfuse for tracking

### Example Prompt Flow

```
┌──────────────────────────────────────────────────────┐
│ You are evaluating a PRD...                          │
│                                                       │
│ Evaluate on these criteria (0-10):                   │
│ 1. Completeness: Does it have all required sections? │
│ 2. Clarity: Is the language clear and specific?      │
│ 3. Technical Depth: Sufficient technical detail?     │
│                                                       │
│ PRD to evaluate:                                      │
│ [actual PRD content]                                  │
│                                                       │
│ Respond ONLY with JSON:                              │
│ {                                                     │
│   "completeness": <0-10>,                            │
│   "clarity": <0-10>,                                 │
│   "technical_depth": <0-10>,                         │
│   "overall": "<excellent|good|...>",                 │
│   "reasoning": "..."                                 │
│ }                                                     │
└──────────────────────────────────────────────────────┘
         ↓ (written to temp file)
         ↓
    claude -p prompt.txt
         ↓
         ↓ (reads prompt, analyzes, generates JSON)
         ↓
┌──────────────────────────────────────────────────────┐
│ {                                                     │
│   "completeness": 8,                                 │
│   "clarity": 9,                                      │
│   "technical_depth": 7,                              │
│   "overall": "good",                                 │
│   "reasoning": "Well-structured but lacks timeline"  │
│ }                                                     │
└──────────────────────────────────────────────────────┘
```

## Error Handling

The evaluator gracefully handles:

- **CLI not found**: Clear error message
- **Authentication issues**: Delegates to Claude CLI's error handling
- **Malformed JSON**: Attempts to extract JSON from response
- **Missing fields**: Validation in Score dataclasses

## Testing

```bash
# Run evaluator tests
python -m pytest tests/test_langfuse_evaluators.py -v

# All tests use mocking, so no actual Claude calls are made
# Tests verify the structure, not the actual LLM responses
```

## Comparison: API vs CLI

| Aspect               | API (Old)                      | CLI (New)                        |
| -------------------- | ------------------------------ | -------------------------------- |
| **Authentication**   | Separate `ANTHROPIC_API_KEY`   | Same Claude CLI auth as workflow |
| **Setup Complexity** | Manage two sets of credentials | Single authentication            |
| **Consistency**      | Different method from workflow | Same method as workflow          |
| **Dependencies**     | `anthropic` Python package     | Claude CLI (already installed)   |
| **Model Control**    | Direct via API parameter       | Uses CLI default                 |
| **Cost Tracking**    | Via API metadata               | Via Claude CLI's tracking        |

## Integration with Workflow

The evaluators are designed to integrate seamlessly with `feature-to-code-unified.sh`:

```bash
# In feature-to-code-unified.sh
# After PRD generation:
if [ "$TELEMETRY_ENABLED" = true ]; then
  python3 scripts/evaluate_and_score.py \
    --artifact "$PRD_FILE" \
    --type prd \
    --execution-id "$EXECUTION_ID"
fi
```

This allows for:

- Automatic quality evaluation after each artifact generation
- Scores logged to Langfuse with proper trace correlation
- Human review triggered for low-scoring artifacts
- Historical quality tracking across workflow runs

## Troubleshooting

### "claude: command not found"

**Solution**: Install Claude CLI

```bash
# Check if installed
claude --version

# If not installed, follow Claude CLI installation guide
```

### "Authentication failed"

**Solution**: Authenticate Claude CLI

```bash
# Re-authenticate
claude auth login
```

### "JSON parsing failed"

**Cause**: Claude sometimes wraps JSON in markdown or adds commentary

**Solution**: The evaluator automatically tries to extract JSON from the response. If it continues failing, check the prompt formatting in `scripts/judge_prompts.py`.

### "Evaluations are slow"

**Cause**: CLI invocation has some overhead

**Solution**: This is expected. Each evaluation makes an LLM call. For faster feedback:

- Use async evaluation (future enhancement)
- Evaluate only critical artifacts
- Cache evaluation results

## Future Enhancements

Potential improvements:

1. **Async Evaluation**: Evaluate multiple artifacts concurrently
2. **Caching**: Cache scores for unchanged artifacts
3. **Model Selection**: Pass model preference to Claude CLI
4. **Batch Evaluation**: Evaluate multiple artifacts in one call
5. **Streaming**: Stream evaluation results for faster feedback

## See Also

- [Langfuse Scores and Observations Guide](./LANGFUSE_SCORES_OBSERVATIONS_GUIDE.md)
- [Implementation Summary](./LANGFUSE_IMPLEMENTATION_SUMMARY.md)
- [Judge Prompts](../../scripts/judge_prompts.py)
- [Evaluators Implementation](../../scripts/langfuse_evaluators.py)
- [Example Usage](../../observability/examples/langfuse-scores-example.py)
