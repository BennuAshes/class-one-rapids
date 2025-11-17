# Evaluation Trigger Flow - Complete Guide

**Created**: November 16, 2025
**Purpose**: Separate, independently-triggered code evaluation workflow

---

## What is an Evaluation Trigger?

An **evaluation trigger** is a **separate n8n workflow** that:
1. **Listens** for code generation completion events (via webhook)
2. **Automatically runs** quality checks independently
3. **Reports results** asynchronously (doesn't block main workflow)
4. **Saves reports** to file system for later review
5. **Optionally notifies** via Slack/email

---

## Architecture: Two-Workflow System

### Workflow 1: Code Generator (with Trigger)
**File**: `claude_code_feature_generator_with_trigger.json`

```
User Request → Generate Code → Trigger Evaluation → Return Immediately
                                       ↓
                                  (async call)
```

**Key Point**: Returns to user BEFORE evaluation completes

### Workflow 2: Evaluation Trigger (Separate)
**File**: `claude_code_evaluation_trigger_workflow.json`

```
Evaluation Webhook → Run Tests → Run Lint → Run TypeCheck → Save Report → Notify
```

**Key Point**: Runs completely independently

---

## How It Works

### Step-by-Step Flow

1. **User triggers code generation**:
   ```bash
   curl -X POST http://localhost:5678/webhook/generate-feature \
     -d '{"feature_description": "...", "codebase_path": "..."}'
   ```

2. **Code Generator Workflow**:
   - Generates execution ID: `exec_1700000000_abc123`
   - Runs PRD → Design → Tasks → Code
   - **Triggers evaluation** via HTTP POST to evaluation webhook
   - **Returns immediately** to user with execution ID

3. **Evaluation Trigger Workflow** (running separately):
   - Receives trigger with execution ID
   - Sends 202 Accepted acknowledgment
   - Waits 5 seconds for file system sync
   - Runs tests, linting, type checking
   - Saves report to `.claude/evaluation_results/eval_exec_1700000000_abc123.json`
   - Optionally notifies Slack

4. **User checks results later**:
   ```bash
   cat .claude/evaluation_results/eval_exec_1700000000_abc123.json
   ```

---

## Files Created

| File | Purpose |
|------|---------|
| `claude_code_feature_generator_with_trigger.json` | Main workflow that triggers evaluation |
| `claude_code_evaluation_trigger_workflow.json` | Separate evaluation workflow |

---

## Setup Instructions

### 1. Import Both Workflows

```bash
# In n8n UI:
# 1. Import claude_code_feature_generator_with_trigger.json
# 2. Import claude_code_evaluation_trigger_workflow.json
# 3. Activate BOTH workflows
```

### 2. Note the Evaluation Webhook URL

After activating the evaluation trigger workflow:
- Click on the webhook trigger node
- Copy the webhook URL (e.g., `http://localhost:5678/webhook/evaluate-code`)

### 3. (Optional) Configure Custom Webhook URL

If your evaluation workflow is on a different n8n instance, pass the URL:

```bash
curl -X POST http://localhost:5678/webhook/generate-feature \
  -H "Content-Type: application/json" \
  -d '{
    "feature_description": "Add settings screen",
    "codebase_path": "/path/to/project",
    "evaluation_webhook_url": "https://other-n8n.com/webhook/evaluate-code"
  }'
```

Default: `http://localhost:5678/webhook/evaluate-code`

### 4. Create Evaluation Results Directory

```bash
cd /path/to/your/project
mkdir -p .claude/evaluation_results
```

---

## Usage Examples

### Example 1: Trigger Code Generation

```bash
curl -X POST http://localhost:5678/webhook/generate-feature \
  -H "Content-Type: application/json" \
  -d '{
    "feature_description": "Create a user profile screen",
    "codebase_path": "/home/dev/my-app"
  }'
```

**Response** (immediate):
```json
{
  "status": "success",
  "message": "Feature code generated successfully",
  "execution_id": "exec_1700000000_abc123",
  "prd_file": "prd_user_profile_20251116.md",
  "tdd_file": "tdd_user_profile_20251116.md",
  "tasks_file": "tasks_user_profile_20251116.md",
  "timestamp": "2025-11-16T15:30:45.123Z",
  "evaluation": {
    "triggered": true,
    "message": "Evaluation workflow triggered asynchronously",
    "check_results_at": ".claude/evaluation_results/eval_exec_1700000000_abc123.json"
  }
}
```

### Example 2: Check Evaluation Results

**Wait a few minutes, then**:

```bash
# Check evaluation report
cat .claude/evaluation_results/eval_exec_1700000000_abc123.json
```

**Evaluation Report**:
```json
{
  "execution_id": "exec_1700000000_abc123",
  "codebase_path": "/home/dev/my-app",
  "feature_description": "Create a user profile screen",
  "evaluation_score": 92,
  "quality_level": "Excellent",
  "all_checks_passed": true,
  "evaluation_result": "PASSED",
  "test_summary": {
    "passed": true,
    "run": 18,
    "failed": 0,
    "coverage": "85.3"
  },
  "lint_summary": {
    "passed": true,
    "errors": 0,
    "warnings": 3
  },
  "typecheck_summary": {
    "passed": true,
    "errors": 0
  },
  "evaluation_timestamp": "2025-11-16T15:35:12.456Z",
  "details": {
    "test_output": "...",
    "lint_output": "...",
    "typecheck_output": "..."
  }
}
```

### Example 3: Automated Polling

```javascript
const axios = require('axios');
const fs = require('fs');

async function generateAndWaitForEvaluation(description, path) {
  // Step 1: Trigger generation
  const response = await axios.post('http://localhost:5678/webhook/generate-feature', {
    feature_description: description,
    codebase_path: path
  });

  const { execution_id, evaluation } = response.data;
  const reportPath = `${path}/${evaluation.check_results_at}`;

  console.log(`Code generated! Execution ID: ${execution_id}`);
  console.log(`Waiting for evaluation...`);

  // Step 2: Poll for evaluation results
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

      console.log(`\n✅ Evaluation complete!`);
      console.log(`Score: ${report.evaluation_score}/100 (${report.quality_level})`);
      console.log(`Result: ${report.evaluation_result}`);

      if (report.all_checks_passed) {
        console.log('🎉 All quality checks passed!');
      } else {
        console.warn('⚠️ Some quality checks failed:');
        if (!report.test_summary.passed) {
          console.warn(`  - Tests: ${report.test_summary.failed} failed`);
        }
        if (!report.lint_summary.passed) {
          console.warn(`  - Lint: ${report.lint_summary.errors} errors`);
        }
        if (!report.typecheck_summary.passed) {
          console.warn(`  - Types: ${report.typecheck_summary.errors} errors`);
        }
      }

      return report;
    }

    attempts++;
  }

  throw new Error('Evaluation timed out after 5 minutes');
}

// Usage
generateAndWaitForEvaluation(
  'Add dark mode toggle',
  '/home/dev/my-app'
).catch(console.error);
```

---

## Key Differences from Inline Evaluation

| Feature | Inline Evaluation | Evaluation Trigger |
|---------|------------------|-------------------|
| **Architecture** | Single workflow | Two separate workflows |
| **Execution** | Sequential (blocking) | Asynchronous (non-blocking) |
| **Response Time** | Slow (waits for evaluation) | Fast (returns immediately) |
| **Failure Impact** | Delays user response | No impact on user |
| **Use Case** | Synchronous CI/CD | Background quality checks |
| **Scalability** | Limited (long-running) | Better (decoupled) |

---

## Evaluation Trigger Workflow Details

### Node Breakdown

#### 1. Webhook Trigger
- **Endpoint**: `/webhook/evaluate-code`
- **Method**: POST
- **Accepts**:
  ```json
  {
    "execution_id": "exec_123",
    "codebase_path": "/path",
    "feature_description": "...",
    "prd_file": "prd_*.md",
    "tdd_file": "tdd_*.md",
    "tasks_file": "tasks_*.md"
  }
  ```

#### 2. Validation
- Checks required fields: `execution_id`, `codebase_path`
- Returns 400 if validation fails

#### 3. Acknowledgment (202 Accepted)
- Immediately responds with 202 status
- Indicates evaluation started
- User doesn't wait for completion

#### 4. Wait Node (5 seconds)
- Allows file system to sync
- Ensures generated files are available

#### 5-7. Quality Checks
- Runs tests, linting, type checking
- Parses results from each

#### 8. Aggregation
- Combines all results
- Calculates quality score
- Determines pass/fail

#### 9. Quality Threshold Check
- Branches based on pass/fail
- Routes to different save/notify paths

#### 10-11. Save Report
- Saves JSON report to `.claude/evaluation_results/`
- Filename includes execution ID for correlation

#### 12-13. Slack Notifications (Optional)
- Disabled by default
- Enable and configure for team notifications
- Different messages for pass/fail

---

## Slack Integration (Optional)

### Setup Slack Notifications

1. **Enable Slack nodes** in evaluation trigger workflow:
   - Find "Notify - Slack (Passed)" node
   - Set `disabled: false`
   - Repeat for "Notify - Slack (Failed)" node

2. **Configure Slack credentials**:
   - In n8n, go to Credentials
   - Add new Slack OAuth2 credential
   - Authorize with your workspace

3. **Set channel**:
   - Edit Slack nodes
   - Change `channelId` to your channel (e.g., `#dev-notifications`)

### Slack Message Format

**Passed**:
```
✅ Code Evaluation PASSED

Score: 95/100 (Excellent)
Execution ID: exec_1700000000_abc123

Tests: 20 passed
Lint: 0 errors, 2 warnings
Types: 0 errors
```

**Failed**:
```
⚠️ Code Evaluation FAILED

Score: 62/100 (Fair)
Execution ID: exec_1700000000_abc123

❌ Tests: 3 failed
❌ Lint: 5 errors
❌ Types: 2 errors

Review required!
```

---

## Advanced: CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/feature-generation.yml
name: Generate Feature with Evaluation

on:
  workflow_dispatch:
    inputs:
      feature_description:
        description: 'Feature to generate'
        required: true

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Trigger Feature Generation
        id: generate
        run: |
          RESPONSE=$(curl -s -X POST ${{ secrets.N8N_GENERATION_WEBHOOK }} \
            -H "Content-Type: application/json" \
            -d '{
              "feature_description": "${{ github.event.inputs.feature_description }}",
              "codebase_path": "${{ github.workspace }}"
            }')

          echo "response=$RESPONSE" >> $GITHUB_OUTPUT

          EXEC_ID=$(echo $RESPONSE | jq -r '.execution_id')
          echo "execution_id=$EXEC_ID" >> $GITHUB_OUTPUT

      - name: Wait for Evaluation
        run: |
          EXEC_ID="${{ steps.generate.outputs.execution_id }}"
          REPORT_PATH=".claude/evaluation_results/eval_${EXEC_ID}.json"

          for i in {1..60}; do
            if [ -f "$REPORT_PATH" ]; then
              echo "Evaluation complete!"
              cat "$REPORT_PATH"

              PASSED=$(jq -r '.all_checks_passed' "$REPORT_PATH")
              if [ "$PASSED" = "true" ]; then
                echo "✅ All checks passed"
                exit 0
              else
                echo "❌ Quality checks failed"
                exit 1
              fi
            fi

            echo "Waiting for evaluation... ($i/60)"
            sleep 5
          done

          echo "❌ Evaluation timeout"
          exit 1

      - name: Commit Generated Code
        if: success()
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "feat: ${{ github.event.inputs.feature_description }}"
          git push
```

---

## Monitoring & Analytics

### Track Evaluation History

Add a database logging node to the evaluation trigger workflow:

```json
{
  "parameters": {
    "operation": "insert",
    "table": "code_evaluations",
    "columns": "execution_id,timestamp,feature,score,quality_level,tests_passed,lint_errors,type_errors",
    "values": "={{$json.execution_id}},={{$json.evaluation_timestamp}},={{$json.feature_description}},={{$json.evaluation_score}},={{$json.quality_level}},={{$json.test_summary.passed}},={{$json.lint_summary.errors}},={{$json.typecheck_summary.errors}}"
  },
  "name": "📊 Log - Evaluation to Database",
  "type": "n8n-nodes-base.postgres"
}
```

### Dashboard Queries

```sql
-- Average quality score over time
SELECT
  DATE(timestamp) as date,
  AVG(score) as avg_score,
  COUNT(*) as total_evaluations
FROM code_evaluations
GROUP BY DATE(timestamp)
ORDER BY date DESC
LIMIT 30;

-- Pass rate by week
SELECT
  DATE_TRUNC('week', timestamp) as week,
  COUNT(*) as total,
  SUM(CASE WHEN tests_passed AND lint_errors = 0 AND type_errors = 0 THEN 1 ELSE 0 END) as passed,
  ROUND(100.0 * SUM(CASE WHEN tests_passed THEN 1 ELSE 0 END) / COUNT(*), 2) as pass_rate
FROM code_evaluations
GROUP BY week
ORDER BY week DESC;

-- Most common failure reasons
SELECT
  CASE
    WHEN NOT tests_passed THEN 'Test Failures'
    WHEN lint_errors > 0 THEN 'Lint Errors'
    WHEN type_errors > 0 THEN 'Type Errors'
  END as failure_reason,
  COUNT(*) as count
FROM code_evaluations
WHERE NOT (tests_passed AND lint_errors = 0 AND type_errors = 0)
GROUP BY failure_reason
ORDER BY count DESC;
```

---

## Troubleshooting

### Issue: Evaluation Never Completes

**Check**:
1. Is the evaluation trigger workflow activated?
2. Did the HTTP request succeed? (check main workflow logs)
3. Is the evaluation webhook URL correct?

**Debug**:
```bash
# Manually trigger evaluation
curl -X POST http://localhost:5678/webhook/evaluate-code \
  -H "Content-Type: application/json" \
  -d '{
    "execution_id": "test_123",
    "codebase_path": "/path/to/project",
    "feature_description": "Test"
  }'
```

### Issue: Report File Not Created

**Check**:
1. Does `.claude/evaluation_results/` directory exist?
2. Does n8n have write permissions?

**Fix**:
```bash
mkdir -p .claude/evaluation_results
chmod 755 .claude/evaluation_results
```

### Issue: Evaluation Fails on Tests

**Check**: Can tests run manually?
```bash
cd /path/to/project
npm test
```

If tests fail manually, fix them before relying on automated evaluation.

---

## Benefits of Evaluation Trigger Pattern

✅ **Non-Blocking**: User gets immediate response
✅ **Resilient**: Evaluation failures don't break generation
✅ **Scalable**: Evaluation can run on separate server
✅ **Flexible**: Easy to add/remove quality checks
✅ **Auditable**: All evaluations saved to files
✅ **Notifiable**: Team gets alerts without blocking workflow

---

## When to Use Which Approach

### Use Inline Evaluation When:
- CI/CD pipeline requires synchronous feedback
- Must block on quality gates
- Single-server deployment
- Simple use case

### Use Evaluation Trigger When:
- User experience matters (fast response)
- Evaluation is time-consuming
- Distributed n8n instances
- Background quality monitoring
- Need evaluation history/auditing

---

## Files Reference

| File | Description |
|------|-------------|
| `claude_code_feature_generator_with_trigger.json` | Main workflow with trigger capability |
| `claude_code_evaluation_trigger_workflow.json` | Separate evaluation workflow |
| `claude_code_feature_generator_with_evaluation.json` | Inline evaluation (alternative) |
| `claude_code_feature_generator_workflow.json` | Base workflow (no evaluation) |

---

## Summary

The **evaluation trigger pattern** separates concerns:

1. **Code Generation Workflow**: Fast, user-facing, triggers evaluation
2. **Evaluation Workflow**: Slow, background, saves results

This architecture provides:
- **Better UX**: Immediate responses
- **Better scalability**: Decoupled execution
- **Better resilience**: Independent failure domains

---

**Version**: 1.0
**Last Updated**: 2025-11-16
**Recommended For**: Production deployments with quality monitoring
