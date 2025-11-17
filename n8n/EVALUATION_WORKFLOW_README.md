# Claude Code Feature Generator with Evaluation - n8n Workflow

**Version**: 1.0
**Created**: November 16, 2025
**Purpose**: Automated feature code generation with quality evaluation using Claude Code CLI

---

## Overview

This enhanced n8n workflow extends the base feature generator by adding **automated code quality evaluation** after code generation. It runs tests, linting, and type checking to validate the generated code quality.

### What's New in This Version

✨ **Automated Quality Checks**:
- Test execution with coverage reporting
- Linting for code style and potential issues
- TypeScript type checking
- Quality scoring (0-100 scale)
- Pass/Fail evaluation

🎯 **Optional Evaluation**:
- Enable/disable evaluation via request parameter
- Non-blocking - workflow completes even if quality checks fail
- Detailed evaluation report in response

---

## Workflow Architecture

### Extended Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                    📥 INPUT VALIDATION                              │
├─────────────────────────────────────────────────────────────────────┤
│ Webhook → Validate Input → Verify Codebase Path                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  🤖 FLOW EXECUTION PIPELINE                         │
├─────────────────────────────────────────────────────────────────────┤
│ PRD Generation → Design → Tasks → Code Generation                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│           🔀 EVALUATION BRANCH (Optional)                           │
├─────────────────────────────────────────────────────────────────────┤
│ IF enable_evaluation = true:                                        │
│   ├─ Run Tests → Parse Test Results                                │
│   ├─ Run Linter → Parse Lint Results                               │
│   ├─ Run TypeCheck → Parse TypeCheck Results                       │
│   ├─ Aggregate Results → Calculate Score                           │
│   └─ Quality Threshold Check → Pass/Fail                           │
│                                                                     │
│ IF enable_evaluation = false:                                       │
│   └─ Skip to Cleanup                                                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   📤 OUTPUT & CLEANUP                               │
├─────────────────────────────────────────────────────────────────────┤
│ Cleanup → Format Response (with evaluation) → Send Response        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## New Features

### 1. Evaluation Toggle

Control evaluation via request body:

```json
{
  "feature_description": "Add settings screen",
  "codebase_path": "/path/to/project",
  "enable_evaluation": true  // ← New parameter
}
```

### 2. Quality Scoring System

**Scoring Breakdown** (Total: 100 points):

| Check | Max Points | Deduction |
|-------|-----------|-----------|
| **Tests** | 40 | -5 per failed test |
| **Linting** | 30 | -3 per error, -1 per warning |
| **Type Checking** | 30 | -2 per type error |

**Quality Levels**:
- **Excellent**: 90-100 points
- **Good**: 75-89 points
- **Fair**: 60-74 points
- **Poor**: 0-59 points

### 3. Comprehensive Evaluation Report

The response includes detailed evaluation metrics:

```json
{
  "status": "success",
  "message": "Feature code generated successfully",
  "prd_file": "prd_settings_screen_20251116.md",
  "tdd_file": "tdd_settings_screen_20251116.md",
  "tasks_file": "tasks_settings_screen_20251116.md",
  "execution_summary": "...",
  "timestamp": "2025-11-16T15:30:45.123Z",
  "evaluation": {
    "enabled": true,
    "result": "PASSED",
    "score": 95,
    "quality_level": "Excellent",
    "all_checks_passed": true,
    "test_summary": {
      "passed": true,
      "run": 25,
      "failed": 0,
      "coverage": "87.5"
    },
    "lint_summary": {
      "passed": true,
      "errors": 0,
      "warnings": 2
    },
    "typecheck_summary": {
      "passed": true,
      "errors": 0
    }
  }
}
```

---

## New Nodes Reference

### Evaluation Branch Nodes

#### 🔀 Check - Evaluation Enabled
- **Type**: IF Node
- **Purpose**: Determines if quality evaluation should run
- **Condition**: `enable_evaluation === true`
- **Branches**:
  - **True**: Proceeds to test execution
  - **False**: Skips to cleanup

#### 🧪 Execute - Run Tests
- **Type**: Execute Command
- **Purpose**: Runs test suite
- **Command**: `npm test`
- **Timeout**: 10 minutes (600 seconds)
- **Output**: Test results, coverage reports

#### 📊 Parse - Test Results
- **Type**: Code Node (JavaScript)
- **Purpose**: Extracts test metrics from output
- **Extracts**:
  - Tests passed/failed count
  - Code coverage percentage
  - Test errors and failures

#### 🔍 Execute - Run Linter
- **Type**: Execute Command
- **Purpose**: Runs linting checks
- **Command**: `npm run lint`
- **Timeout**: 2 minutes (120 seconds)
- **Output**: Lint errors and warnings

#### 📊 Parse - Lint Results
- **Type**: Code Node (JavaScript)
- **Purpose**: Extracts linting metrics
- **Extracts**:
  - Error count
  - Warning count
  - Lint pass/fail status

#### ⚙️ Execute - Type Check
- **Type**: Execute Command
- **Purpose**: Runs TypeScript type checking
- **Command**: `npx tsc --noEmit`
- **Timeout**: 2 minutes (120 seconds)
- **Output**: Type errors

#### 📊 Parse - TypeCheck Results
- **Type**: Code Node (JavaScript)
- **Purpose**: Extracts type checking metrics
- **Extracts**:
  - Type error count
  - Type check pass/fail status

#### 📈 Aggregate - Evaluation Results
- **Type**: Code Node (JavaScript)
- **Purpose**: Combines all evaluation metrics
- **Calculations**:
  - Overall quality score (0-100)
  - Quality level (Excellent/Good/Fair/Poor)
  - All checks passed boolean
  - Detailed summaries for each check

#### 🎯 Check - Quality Threshold
- **Type**: IF Node
- **Purpose**: Determines if code meets quality standards
- **Condition**: All checks passed
- **Branches**:
  - **True**: Evaluation PASSED
  - **False**: Evaluation FAILED

#### ✅ Set - Evaluation Passed
- **Type**: Set Node
- **Purpose**: Marks evaluation as passed
- **Sets**: `evaluation_result = "PASSED"`

#### ❌ Set - Evaluation Failed
- **Type**: Set Node
- **Purpose**: Marks evaluation as failed
- **Sets**: `evaluation_result = "FAILED"`

---

## Usage Examples

### Example 1: Basic Code Generation (No Evaluation)

```bash
curl -X POST http://localhost:5678/webhook/generate-feature \
  -H "Content-Type: application/json" \
  -d '{
    "feature_description": "Add a profile screen",
    "codebase_path": "/home/user/projects/my-app"
  }'
```

**Response** (evaluation disabled by default):
```json
{
  "status": "success",
  "message": "Feature code generated successfully",
  "evaluation": {
    "enabled": false
  }
}
```

### Example 2: With Quality Evaluation

```bash
curl -X POST http://localhost:5678/webhook/generate-feature \
  -H "Content-Type: application/json" \
  -d '{
    "feature_description": "Add dark mode toggle",
    "codebase_path": "/home/user/projects/my-app",
    "enable_evaluation": true
  }'
```

**Response** (with evaluation):
```json
{
  "status": "success",
  "evaluation": {
    "enabled": true,
    "result": "PASSED",
    "score": 92,
    "quality_level": "Excellent",
    "all_checks_passed": true,
    "test_summary": {
      "passed": true,
      "run": 15,
      "failed": 0,
      "coverage": "85.3"
    },
    "lint_summary": {
      "passed": true,
      "errors": 0,
      "warnings": 1
    },
    "typecheck_summary": {
      "passed": true,
      "errors": 0
    }
  }
}
```

### Example 3: Node.js Integration

```javascript
const axios = require('axios');

async function generateAndEvaluateFeature(description, path) {
  try {
    const response = await axios.post(
      'http://localhost:5678/webhook/generate-feature',
      {
        feature_description: description,
        codebase_path: path,
        enable_evaluation: true
      }
    );

    const { evaluation } = response.data;

    if (evaluation.enabled) {
      console.log(`Quality Score: ${evaluation.score}/100`);
      console.log(`Quality Level: ${evaluation.quality_level}`);
      console.log(`All Checks Passed: ${evaluation.all_checks_passed}`);

      if (evaluation.result === 'FAILED') {
        console.error('⚠️ Code quality checks failed!');
        console.error('Test Summary:', evaluation.test_summary);
        console.error('Lint Summary:', evaluation.lint_summary);
        console.error('Type Summary:', evaluation.typecheck_summary);
      } else {
        console.log('✅ Code quality checks passed!');
      }
    }

    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Usage
generateAndEvaluateFeature(
  'Create a search bar with autocomplete',
  '/Users/dev/projects/webapp'
);
```

---

## Quality Check Details

### Test Execution

**Command**: `npm test`

**What It Checks**:
- All unit tests pass
- Integration tests pass
- Test coverage meets threshold
- No test failures or errors

**Scoring Impact**:
- Full 40 points: All tests pass
- Partial: 40 - (failed_tests × 5)
- Minimum: 0 points

**Example Output Parsing**:
```
Tests:       15 passed, 15 total
Coverage:    85.3% statements
```

### Linting

**Command**: `npm run lint`

**What It Checks**:
- ESLint rules compliance
- Code style consistency
- Potential bugs and anti-patterns
- Best practices adherence

**Scoring Impact**:
- Full 30 points: No errors or warnings
- Deductions: -3 per error, -1 per warning
- Minimum: 0 points

**Example Output Parsing**:
```
✖ 2 problems (1 error, 1 warning)
  1 error and 1 warning potentially fixable with the `--fix` option.
```

### Type Checking

**Command**: `npx tsc --noEmit`

**What It Checks**:
- TypeScript type correctness
- No type errors
- Proper type annotations
- Interface compliance

**Scoring Impact**:
- Full 30 points: No type errors
- Deductions: -2 per type error
- Minimum: 0 points

**Example Output Parsing**:
```
Found 0 errors. Watching for file changes.
```

---

## Timeout Configuration

| Check | Timeout | Rationale |
|-------|---------|-----------|
| Run Tests | 10min | Comprehensive test suites can be slow |
| Run Linter | 2min | Quick static analysis |
| Type Check | 2min | Fast compilation check |

**Note**: Adjust timeouts based on your codebase size.

---

## Customization

### Adjusting Quality Thresholds

Edit the **Aggregate Evaluation Results** node to change scoring:

```javascript
// Current scoring
let score = 0;

// Tests: 40 points max
if (testResults.tests_passed) {
  score += 40;
} else {
  score += Math.max(0, 40 - (testResults.tests_failed * 5));
}

// Customize: Change weights or deductions
// Example: Make tests worth 50 points instead
if (testResults.tests_passed) {
  score += 50;  // Changed from 40
} else {
  score += Math.max(0, 50 - (testResults.tests_failed * 3));  // Adjusted
}
```

### Adding More Checks

Add additional quality gates after type checking:

**Example: Security Scan**

```json
{
  "parameters": {
    "command": "cd \"={{$json.body.codebase_path}}\" && npm audit --audit-level=moderate",
    "timeout": 60000
  },
  "name": "🔒 Execute - Security Audit",
  "type": "n8n-nodes-base.executeCommand"
}
```

**Example: Complexity Analysis**

```json
{
  "parameters": {
    "command": "cd \"={{$json.body.codebase_path}}\" && npx complexity-report --format json src/",
    "timeout": 120000
  },
  "name": "📐 Execute - Complexity Analysis",
  "type": "n8n-nodes-base.executeCommand"
}
```

### Custom Quality Levels

Edit quality level thresholds:

```javascript
// Current
let quality_level = 'Poor';
if (score >= 90) quality_level = 'Excellent';
else if (score >= 75) quality_level = 'Good';
else if (score >= 60) quality_level = 'Fair';

// Custom: Stricter thresholds
let quality_level = 'Unacceptable';
if (score >= 95) quality_level = 'Outstanding';
else if (score >= 85) quality_level = 'Excellent';
else if (score >= 70) quality_level = 'Acceptable';
else if (score >= 50) quality_level = 'Needs Improvement';
```

---

## Continuous Integration

### GitHub Actions Integration

Create a webhook in GitHub Actions to trigger evaluation on push:

```yaml
# .github/workflows/evaluate-code.yml
name: Evaluate Generated Code

on:
  push:
    branches: [feature/*]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Trigger n8n Evaluation
        run: |
          curl -X POST ${{ secrets.N8N_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{
              "feature_description": "${{ github.event.head_commit.message }}",
              "codebase_path": "${{ github.workspace }}",
              "enable_evaluation": true
            }'
```

### Blocking Low Quality Code

Add a quality gate that fails the workflow if score is too low:

1. Edit **Check Quality Threshold** node
2. Change condition to check score instead of `all_checks_passed`
3. Set minimum acceptable score (e.g., 75)

```javascript
// In Check Quality Threshold IF node
{
  "conditions": {
    "number": [
      {
        "value1": "={{$json.evaluation_score}}",
        "operation": "largerEqual",
        "value2": 75  // Minimum acceptable score
      }
    ]
  }
}
```

---

## Monitoring & Analytics

### Tracking Evaluation Metrics

Add a node to log evaluation results to a database:

```json
{
  "parameters": {
    "operation": "insert",
    "table": "code_evaluations",
    "columns": "timestamp,feature,score,quality_level,tests_passed,lint_errors,type_errors",
    "values": "={{$json.evaluation_timestamp}},={{$json.feature_description}},={{$json.evaluation_score}},={{$json.quality_level}},={{$json.test_summary.passed}},={{$json.lint_summary.errors}},={{$json.typecheck_summary.errors}}"
  },
  "name": "📊 Log - Evaluation Metrics",
  "type": "n8n-nodes-base.postgres"
}
```

### Dashboard Example

Query evaluation history:

```sql
SELECT
  DATE(timestamp) as date,
  AVG(score) as avg_score,
  COUNT(*) as evaluations,
  SUM(CASE WHEN quality_level = 'Excellent' THEN 1 ELSE 0 END) as excellent_count
FROM code_evaluations
GROUP BY DATE(timestamp)
ORDER BY date DESC
LIMIT 30;
```

---

## Differences from Base Workflow

| Feature | Base Workflow | Evaluation Workflow |
|---------|--------------|---------------------|
| Code Generation | ✅ Yes | ✅ Yes |
| Test Execution | ❌ No | ✅ Yes (optional) |
| Linting | ❌ No | ✅ Yes (optional) |
| Type Checking | ❌ No | ✅ Yes (optional) |
| Quality Scoring | ❌ No | ✅ Yes |
| Evaluation Report | ❌ No | ✅ Yes |
| Response Size | Small | Larger (includes metrics) |
| Execution Time | Faster | Slower (with evaluation) |
| Use Case | Quick generation | Production-ready code |

---

## Best Practices

### When to Enable Evaluation

✅ **Enable for**:
- Production code generation
- CI/CD pipeline integration
- Quality-critical features
- Code review automation
- Team code standards enforcement

❌ **Skip for**:
- Rapid prototyping
- Experimental features
- Quick iterations
- Development/testing
- When speed is priority

### Handling Failed Evaluations

Even if evaluation fails, the code is still generated. Options:

1. **Manual Review**: Investigate failing checks
2. **Auto-Fix**: Run `npm run lint --fix` for auto-fixable issues
3. **Iteration**: Regenerate with refined description
4. **Acceptance**: Accept lower quality for prototypes

### Performance Optimization

For large codebases:

1. **Increase Timeouts**: Adjust based on test suite size
2. **Selective Testing**: Run only affected tests
3. **Parallel Execution**: Run checks in parallel (advanced)
4. **Caching**: Cache dependencies and test results

---

## Troubleshooting

### Issue: Evaluation Always Fails

**Check**:
- Are test scripts configured? (`npm test` works?)
- Is lint configured? (`npm run lint` works?)
- Is TypeScript configured? (`tsc` available?)

**Solution**: Ensure all quality tools are set up in codebase.

### Issue: Timeout Errors During Evaluation

**Solution**: Increase timeout values for slow checks:
- Tests: Increase beyond 10min if needed
- Adjust based on actual test suite duration

### Issue: Parsing Errors

**Check**: Command output format matches parsing regex

**Solution**: Update parsing regex in Code nodes to match your tools' output format.

---

## Migration from Base Workflow

To migrate from base workflow:

1. **Export Current Workflow**: Backup your existing workflow
2. **Import Evaluation Workflow**: Import this new workflow
3. **Update Webhook URL**: Update any clients calling the webhook
4. **Test with Evaluation Disabled**: Set `enable_evaluation: false` to verify base functionality
5. **Enable Gradually**: Turn on evaluation for specific features
6. **Monitor Performance**: Track execution times and adjust timeouts

---

## File Locations

- **Workflow JSON**: `n8n/claude_code_feature_generator_with_evaluation.json`
- **Base Workflow**: `n8n/claude_code_feature_generator_workflow.json`
- **Best Practices**: `n8n/n8n_workflow_best_practices_2025.md`

---

## Support

For issues or questions:
- Review base workflow README for common setup issues
- Check n8n execution logs for error details
- Verify quality tools are properly configured in codebase
- Test evaluation checks manually before using in workflow

---

**Version**: 1.0
**Last Updated**: 2025-11-16
**Compatible with**: n8n v1.0+, Claude Code latest
**License**: Same as base workflow
