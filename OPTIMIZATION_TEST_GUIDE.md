# Workflow Optimization Test Guide

This guide demonstrates how to test the new workflow optimizations: caching, parallel execution, and structured feedback.

## Prerequisites

1. Ensure Python 3.7+ is installed
2. Claude CLI is configured
3. Optional: Langfuse running for telemetry

## Testing Step-Level Caching

Caching provides instant results for repeated workflow runs with the same input.

### First Run (Cache Miss)
```bash
# Run workflow normally - this will cache results
./workflow --approval minimal test-feature.md
```

Expected output:
- Each step executes normally
- You'll see: `💾 Cached output for Generate PRD`
- Cache stats show 0 hits, increasing writes

### Second Run (Cache Hit)
```bash
# Run again with same input - should use cache
./workflow --approval minimal test-feature.md
```

Expected output:
- You'll see: `✨ Cache hit for Generate PRD (hits: 1, key: xxx)`
- Steps complete instantly: `⚡ Using cached result (instant)`
- Dramatic speed improvement (90%+ faster)

### View Cache Statistics
```bash
ls -la workflow-outputs/*/cache/
cat workflow-outputs/*/cache/cache_stats.json
```

### Clear Cache
```bash
rm -rf .workflow-cache/
# Or selectively: rm -rf workflow-outputs/*/.cache/
```

## Testing Parallel Execution

Parallel execution can reduce workflow time by 30-50% (when we have multiple variants).

### Enable Parallel Mode
```bash
./workflow --parallel --approval minimal test-feature.md
```

Expected output:
- You'll see: `⚡ Parallel Execution: Enabled`
- Currently, steps still run sequentially (default dependency graph)
- Future: Multiple PRD variants will run concurrently

### Future Parallel Scenarios

With enhanced configurations:
1. **Multiple PRD variants**: Generate 3 alternatives simultaneously
2. **Research + PRD**: Run research and PRD generation in parallel
3. **Parallel task execution**: Execute independent tasks concurrently

## Testing Structured Feedback

The new feedback system provides categorized, actionable feedback.

### Interactive Mode with Feedback
```bash
./workflow --approval interactive test-feature.md
```

When prompted for approval:
1. Type `n` to reject
2. Provide structured feedback

### File-Based Structured Feedback

Create a rejection with structured feedback:

```bash
# Start workflow
./workflow test-feature.md

# In another terminal, create structured rejection:
cat > workflow-outputs/*/approval_Generate_PRD.json.response << 'EOF'
{
  "status": "rejected",
  "reason": "PRD needs more detail",
  "structured_feedback": [
    {
      "category": "INCOMPLETE",
      "description": "Missing API authentication details",
      "severity": "high",
      "suggestions": [
        "Add JWT authentication requirements",
        "Specify rate limiting needs",
        "Include API key management"
      ]
    },
    {
      "category": "MISSING_CONTEXT",
      "description": "No performance requirements specified",
      "severity": "medium",
      "suggestions": [
        "Add response time targets",
        "Specify concurrent user limits"
      ]
    }
  ]
}
EOF
```

Expected output:
```
📊 Structured feedback received:
  🔴 [INCOMPLETE] Missing API authentication details
    💡 Add JWT authentication requirements
    💡 Specify rate limiting needs
    💡 Include API key management
  🟡 [MISSING_CONTEXT] No performance requirements specified
    💡 Add response time targets
    💡 Specify concurrent user limits
```

## Combined Test: All Optimizations

### Test Scenario 1: Fast Development Iteration
```bash
# First run - builds cache
./workflow --approval minimal --parallel test-feature.md

# Second run - uses cache (instant)
./workflow --approval minimal --parallel test-feature.md

# Modify feature slightly and run again
echo "\nAdd metrics endpoint" >> test-feature.md
./workflow --approval minimal --parallel test-feature.md
```

### Test Scenario 2: Quality Improvement Flow
```bash
# Start with standard approval
./workflow --approval standard test-feature.md

# Reject with structured feedback (see above)
# System processes feedback and suggests improvements

# Resume workflow
./workflow workflow-outputs/[execution_id]
```

## Performance Metrics

### Measure Cache Impact
```bash
# Without cache (first run)
time ./workflow --approval minimal test-feature.md

# With cache (second run)
time ./workflow --approval minimal test-feature.md
```

Expected improvements:
- First run: ~30-60 seconds per step
- Cached run: <1 second per cached step
- Overall: 90%+ faster for unchanged inputs

### Measure Parallel Impact (Future)
```bash
# Sequential
time ./workflow --approval minimal test-feature.md

# Parallel (when variants are implemented)
time ./workflow --parallel --approval minimal test-feature.md
```

Expected improvements:
- Sequential: Sum of all step times
- Parallel: Max time of parallel group
- Overall: 30-50% faster

## Troubleshooting

### Cache Not Working
- Check cache directory exists: `ls -la workflow-outputs/*/.cache/`
- Verify cache service initialized: Look for `📊 Git tracking initialized`
- Clear corrupted cache: `rm -rf workflow-outputs/*/.cache/`

### Parallel Execution Issues
- Check Python asyncio compatibility
- Verify no file locks on output directory
- Review logs for concurrency errors

### Feedback Not Processing
- Ensure feedback file is valid JSON
- Check feedback categories match enum values
- Verify approval response file location

## Advanced Usage

### Custom Cache TTL
Edit `orchestrator_v2.py`:
```python
self.cache_service = await get_cache_service(
    cache_dir=cache_dir,
    enabled=True,
    max_age_hours=24  # Change to desired hours
)
```

### Force Cache Refresh
```bash
# Delete specific step cache
rm -rf workflow-outputs/*/.cache/Generate_PRD/

# Run workflow - will rebuild this step's cache
./workflow --approval minimal test-feature.md
```

### Export Cache Statistics
```python
# Get cache stats programmatically
from scripts.workflow.services.cache import get_cache_service

cache = await get_cache_service()
stats = await cache.get_stats()
print(f"Cache hit rate: {stats['hit_rate']}")
```

## Summary

The optimizations provide:

1. **Caching**: 90%+ speed improvement for repeated runs
2. **Parallel Execution**: 30-50% faster (when fully implemented)
3. **Structured Feedback**: Better learning and improvement signals

Best practices:
- Use `--approval minimal` for rapid iteration
- Enable caching for development workflows
- Provide structured feedback for quality improvements
- Clear cache periodically to avoid stale results