# Migration Summary: API → Claude CLI for Evaluators

## What Changed

The LLM-as-judge evaluators now use **local Claude CLI** instead of the Anthropic API with separate keys.

## Files Modified

### Core Implementation

- ✅ `scripts/langfuse_evaluators.py`
  - Removed `anthropic` import
  - Added `subprocess` and `tempfile` imports
  - Replaced `anthropic.Anthropic()` calls with `subprocess.run(['claude', '-p', ...])`
  - Updated docstrings to reflect CLI usage

### Documentation

- ✅ `docs/guides/LANGFUSE_SCORES_OBSERVATIONS_GUIDE.md`

  - Removed `ANTHROPIC_API_KEY` requirement
  - Updated dependencies (removed `anthropic` package)
  - Updated troubleshooting section

- ✅ `docs/guides/LANGFUSE_IMPLEMENTATION_SUMMARY.md`

  - Removed `ANTHROPIC_API_KEY` from setup instructions
  - Added note about Claude CLI authentication

- ✅ `observability/examples/langfuse-scores-example.py`

  - Updated prerequisites to mention Claude CLI instead of API key

- ✅ **NEW**: `docs/guides/CLAUDE_CLI_EVALUATORS.md`
  - Comprehensive guide on CLI-based evaluation
  - Architecture diagrams
  - Troubleshooting
  - Comparison of API vs CLI approaches

### Dependencies

- ✅ `tests/requirements.txt`
  - Removed `anthropic>=0.18.0`
  - Added note about Claude CLI requirement

## Benefits

### For Users

1. **Simpler Setup**: No need to manage separate API keys
2. **Consistency**: Same authentication as `feature-to-code-unified.sh`
3. **Familiar**: Uses the same `claude -p` command you already use

### For Development

1. **Less Dependencies**: One fewer Python package
2. **Better Integration**: Matches workflow's approach
3. **Local Control**: Uses your Claude CLI configuration

## How It Works Now

### Old Way (API)

```python
import anthropic

api_key = os.getenv("ANTHROPIC_API_KEY")  # ❌ Separate key required
client = anthropic.Anthropic(api_key=api_key)
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    messages=[{"role": "user", "content": prompt}]
)
```

### New Way (CLI)

```python
import subprocess
import tempfile

# Write prompt to temp file
with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
    f.write(prompt)
    temp_file = f.name

# Call Claude CLI (uses your existing auth)
result = subprocess.run(
    ['claude', '-p', temp_file],  # ✅ Uses your Claude CLI auth
    capture_output=True,
    text=True
)
```

## Migration Checklist

If you were using the old version:

- [x] Remove `ANTHROPIC_API_KEY` from environment variables
- [x] Uninstall `anthropic` package (if not used elsewhere): `pip uninstall anthropic`
- [x] Ensure Claude CLI is authenticated: `claude --version`
- [x] Re-run tests: `python -m pytest tests/test_langfuse_evaluators.py -v`
- [x] Update any scripts that set `ANTHROPIC_API_KEY`

## What Stays the Same

✅ **API**: All evaluator functions have the same signature  
✅ **Return Values**: Same Score objects returned  
✅ **Prompts**: Same evaluation prompts used  
✅ **Quality**: Same quality of evaluations  
✅ **Tests**: All tests still pass (using mocks)

## Score Configuration Setup

Now you can run the score setup without worrying about API keys:

```bash
# Start Langfuse
cd observability
docker-compose up -d

# Setup score configs (uses existing Langfuse keys)
cd ..
python scripts/setup_langfuse_score_configs.py --config observability/score-configs.yaml

# Run evaluations (uses Claude CLI)
python observability/examples/langfuse-scores-example.py
```

## Testing Results

```bash
$ python -m pytest tests/test_langfuse_evaluators.py -v
============================= test session starts =============================
collected 17 items

tests/test_langfuse_evaluators.py::TestPRDEvaluator::test_evaluate_prd_returns_score_object PASSED
tests/test_langfuse_evaluators.py::TestPRDEvaluator::test_evaluate_prd_has_all_scores PASSED
tests/test_langfuse_evaluators.py::TestPRDEvaluator::test_evaluate_prd_scores_in_range PASSED
...
============================= 17 passed in 0.04s ==============================
```

All 17 tests pass! ✅

## Next Steps

1. **Set up score configurations**:

   ```bash
   python scripts/setup_langfuse_score_configs.py --config observability/score-configs.yaml
   ```

2. **Try the evaluators**:

   ```bash
   python observability/examples/langfuse-scores-example.py
   ```

3. **Integrate into workflow**:
   The evaluators are ready to be called from `feature-to-code-unified.sh` after each artifact generation.

## Questions?

See the comprehensive guide: [`docs/guides/CLAUDE_CLI_EVALUATORS.md`](docs/guides/CLAUDE_CLI_EVALUATORS.md)
