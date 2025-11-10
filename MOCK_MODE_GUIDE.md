# Mock Mode Testing Guide

## Overview

Mock mode allows you to test the entire workflow system **without making actual LLM API calls**. This is perfect for:

- **Testing workflow logic** - Validate caching, approval, state management
- **Development iterations** - Quickly test changes to the workflow system
- **CI/CD pipelines** - Run tests without API dependencies
- **Learning the system** - Explore features without costs
- **Performance testing** - Measure workflow overhead without LLM latency

## Quick Start

### Basic Mock Workflow

```bash
# Run with mock responses (instant, no API calls)
./workflow --mock --approval minimal test-feature.md
```

Expected output:
```
🎭 Mock mode enabled - using simulated LLM responses
...
🎭 Mock LLM response generated
```

### Run Test Suite

```bash
# Comprehensive automated tests
./test-workflow.sh
```

This validates:
- ✅ Basic workflow execution
- ✅ Cache performance
- ✅ State persistence
- ✅ Mock mode speed
- ✅ Output validation
- ✅ Cache statistics

## Features

### Realistic Mock Responses

Mock mode generates realistic outputs for each step:

**PRD (Product Requirements Document)**:
- Objectives and user stories
- Functional requirements
- Non-functional requirements
- Acceptance criteria
- Timeline

**Technical Design Document**:
- Architecture overview with diagrams
- API design and endpoints
- Data models
- Security considerations
- Testing strategy

**Task List**:
- Organized by phases
- Estimated time per task
- Dependencies clearly marked
- Acceptance criteria for each task

**Summary**:
- Workflow metrics
- Artifacts generated
- Quality indicators
- Next steps

### Configurable Performance

Control mock response delay to simulate different scenarios:

```bash
# Instant responses (0s delay)
./workflow --mock --mock-delay 0 --approval minimal test-feature.md

# Realistic delay (0.5s per step)
./workflow --mock --mock-delay 0.5 --approval minimal test-feature.md

# Slow responses for testing timeout logic
./workflow --mock --mock-delay 2 --approval minimal test-feature.md
```

## Testing Scenarios

### 1. Cache Performance Testing

```bash
# First run - builds cache
time ./workflow --mock --approval minimal test-feature.md

# Second run - uses cache (should be much faster)
time ./workflow --mock --approval minimal test-feature.md
```

Expected improvement: 90%+ faster on second run

### 2. Approval Flow Testing

```bash
# Standard approval mode (file-based)
./workflow --mock test-feature.md

# In another terminal, simulate approval:
echo '{"status":"approved"}' > workflow-outputs/*/approval_*.json.response
```

### 3. Structured Feedback Testing

```bash
# Start workflow
./workflow --mock test-feature.md &

# Reject with structured feedback
cat > workflow-outputs/*/approval_Generate_PRD.json.response << 'EOF'
{
  "status": "rejected",
  "structured_feedback": [
    {
      "category": "INCOMPLETE",
      "description": "Missing API versioning strategy",
      "severity": "high",
      "suggestions": [
        "Add versioning approach (URL vs header)",
        "Document breaking change policy"
      ]
    }
  ]
}
EOF
```

### 4. State Management Testing

```bash
# Run partial workflow
./workflow --mock --approval standard test-feature.md
# (approve only first step, then cancel)

# Resume from saved state
WORKFLOW_DIR=$(ls -td workflow-outputs/*/ | head -1)
./workflow --mock "$WORKFLOW_DIR"
```

### 5. Parallel Execution Framework

```bash
# Test parallel execution infrastructure
./workflow --mock --parallel --approval minimal test-feature.md
```

## Mock Mode vs Real Mode

| Feature | Mock Mode | Real Mode |
|---------|-----------|-----------|
| **Speed** | ~1s total | ~3-5 minutes |
| **API Calls** | None | Claude API |
| **Cost** | Free | API costs |
| **Response Quality** | Template-based | LLM-generated |
| **Deterministic** | Yes | No (varies) |
| **Cache Testing** | Perfect | Perfect |
| **Approval Testing** | Perfect | Perfect |
| **Best For** | Testing, CI/CD | Production use |

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Workflow Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'

      - name: Run workflow tests
        run: ./test-workflow.sh

      - name: Test with mock mode
        run: |
          ./workflow --mock --approval minimal test-feature.md
          # Validate outputs
          test -f workflow-outputs/*/prd_mock_*.md
          test -f workflow-outputs/*/tdd_mock_*.md
```

## Debugging with Mock Mode

### Enable Detailed Output

```bash
# Run with verbose output
./workflow --mock --approval minimal test-feature.md 2>&1 | tee workflow-debug.log
```

### Inspect Generated Files

```bash
# View mock outputs
ls -la workflow-outputs/*/

# Read PRD
cat workflow-outputs/*/prd_mock_*.md

# Check cache
cat workflow-outputs/*/.cache/cache_stats.json | python3 -m json.tool
```

### Verify State

```bash
# View workflow state
cat workflow-outputs/*/workflow-status.json | python3 -m json.tool

# Check step status
python3 << EOF
import json
with open('workflow-outputs/latest/workflow-status.json') as f:
    data = json.load(f)
    for step in data['steps']:
        print(f"{step['name']}: {step['status']}")
EOF
```

## Performance Benchmarking

### Measure Workflow Overhead

```bash
# Instant mock (measure pure workflow overhead)
time ./workflow --mock --mock-delay 0 --approval minimal test-feature.md

# With realistic delay
time ./workflow --mock --mock-delay 0.5 --approval minimal test-feature.md
```

### Cache Impact

```bash
# Clear cache
rm -rf workflow-outputs/*/.cache/

# First run (uncached)
time ./workflow --mock --approval minimal test-feature.md > /tmp/run1.txt

# Second run (cached)
time ./workflow --mock --approval minimal test-feature.md > /tmp/run2.txt

# Compare
diff /tmp/run1.txt /tmp/run2.txt
```

## Limitations

Mock mode **does not**:
- Test actual Claude API integration
- Validate prompt quality
- Test real-world LLM edge cases
- Generate production-quality outputs

Mock mode **does**:
- Test all workflow logic
- Validate caching system
- Test approval flows
- Verify state management
- Test parallel execution framework
- Validate error handling
- Measure performance overhead

## Best Practices

1. **Use mock mode for development**
   ```bash
   ./workflow --mock --approval minimal feature.md
   ```

2. **Run tests before commits**
   ```bash
   ./test-workflow.sh
   ```

3. **Test real mode periodically**
   ```bash
   ./workflow --approval minimal feature.md
   ```

4. **Use instant delays for CI/CD**
   ```bash
   ./workflow --mock --mock-delay 0 --approval minimal feature.md
   ```

5. **Test with realistic delays locally**
   ```bash
   ./workflow --mock --mock-delay 0.5 --approval minimal feature.md
   ```

## Troubleshooting

### Mock responses not appearing

Check that mock mode is enabled:
```bash
# Should see: 🎭 Mock mode enabled
./workflow --mock test-feature.md
```

### Cache not working in mock mode

Cache should work identically:
```bash
# First run
./workflow --mock test-feature.md

# Second run - should show cache hits
./workflow --mock test-feature.md
```

### Tests failing

Run with debug output:
```bash
bash -x ./test-workflow.sh
```

## Summary

Mock mode provides:
- **Instant feedback** - Test in seconds instead of minutes
- **Zero cost** - No API calls or charges
- **Deterministic** - Repeatable, consistent results
- **Complete coverage** - Tests all workflow logic
- **CI/CD friendly** - Perfect for automated testing

Use mock mode for development and testing, then validate with real mode before production use.

## Examples

### Quick Development Cycle

```bash
# Test changes instantly
./workflow --mock --approval minimal test-feature.md

# Make changes to workflow code
# ...

# Test again (instant)
./workflow --mock --approval minimal test-feature.md
```

### Full Validation

```bash
# Run automated test suite
./test-workflow.sh

# Test specific optimization
./workflow --mock --approval minimal test-feature.md  # First run
./workflow --mock --approval minimal test-feature.md  # Cached run

# Verify output quality
cat workflow-outputs/*/prd_mock_*.md
```