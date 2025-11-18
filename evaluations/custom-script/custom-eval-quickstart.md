# Custom Evaluation System - Quick Start

A simple, self-contained evaluation harness for tracking code generation quality.

## What You Get

✅ **Automated test runner** - Runs `/flow:full-flow` on a dataset
✅ **Metric collection** - Tests, coverage, types, lint
✅ **Score calculation** - Weighted quality scores
✅ **Comparison tool** - See improvements/regressions
✅ **D3.js dashboard** - Interactive visualizations
✅ **Zero dependencies** - Just TypeScript + D3 (CDN)

## File Structure

```
scripts/
├── run-evaluation.ts         # Main experiment runner
├── compare-runs.ts            # Compare two runs
└── generate-visualization.ts  # Generate HTML dashboard

.claude/
├── evaluation-dataset.json    # Test cases
└── evaluation_results/        # Results (auto-created)
    ├── index.json             # Index of all runs
    ├── baseline_*.json        # Individual run results
    └── dashboard.html         # Generated dashboard
```

## Quick Start (5 Minutes)

### Step 1: Review Test Dataset

```bash
cat .claude/evaluation-dataset.json
```

Add more test cases as needed (format is self-explanatory).

### Step 2: Run Your First Experiment

```bash
npx tsx scripts/run-evaluation.ts baseline v1
```

This will:
1. Run `/flow:full-flow` for each test case
2. Gather metrics (tests, coverage, types, lint)
3. Calculate scores
4. Save results to `.claude/evaluation_results/`

**Example output:**
```
🧪 EXPERIMENT: baseline
📊 Test Cases: 5

[Progress 1/5]
  🧪 Test Case: dark-mode
    Description: Add a dark mode toggle to the settings screen
    🚀 Running /flow:full-flow...
    📊 Gathering metrics...
    ✅ Tests: 12/12 (100%)
    ✅ Coverage: 85%
    ✅ Type check: 0 errors
    ⚠️  Lint: 2 warnings
    📝 Generated 4 files
    ⭐ Score: 87/100
    🔄 Resetting repository...

[Progress 2/5]
...

✅ EXPERIMENT COMPLETE: baseline
  Total Tests: 5
  Success: 5
  Failures: 0
  Average Score: 84/100
  Average Duration: 45s
  Total Duration: 225s

📈 Results by Test Case:
  ✅ dark-mode: 87/100
  ✅ undo-redo: 82/100
  ✅ achievements: 85/100
  ✅ sound-effects: 78/100
  ✅ statistics-screen: 88/100

💾 Results saved to:
  .claude/evaluation_results/baseline_1731843000.json
```

### Step 3: Make Changes & Run Experiment 2

```bash
# Edit your prompts/workflow in .claude/commands/flow/...
# Then run another experiment

npx tsx scripts/run-evaluation.ts improved-prompts v2
```

### Step 4: Compare Runs

```bash
npx tsx scripts/compare-runs.ts baseline_1731843000 improved-prompts_1731844000
```

**Example output:**
```
📊 COMPARING RUNS

Run 1: baseline
  Avg Score: 84/100
  Success Rate: 5/5
  Prompt Version: v1

Run 2: improved-prompts
  Avg Score: 89/100
  Success Rate: 5/5
  Prompt Version: v2

Overall Change:
  Score: +5.0 points (+6.0%) ⬆️

Test Case Breakdown:
✅ statistics-screen      88 → 95  (+7)
✅ dark-mode             87 → 90  (+3)
➡️ achievements           85 → 85  (+0)
✅ undo-redo             82 → 87  (+5)
✅ sound-effects         78 → 88  (+10)

Summary:
  Improvements: 4
  Regressions: 0
  Unchanged: 1
```

### Step 5: Generate Dashboard

```bash
npx tsx scripts/generate-visualization.ts
```

Then open `.claude/evaluation_results/dashboard.html` in your browser.

**You'll see:**
- 📊 Score trends over time (line chart)
- 📈 Test case performance (bar chart)
- 📋 List of all experiments
- 🎯 Key stats (latest score, success rate, etc.)

## How It Works

### Scoring Algorithm

```typescript
Score = (
  testPassRate * 0.40 +     // 40% - Tests passing
  coverage * 0.25 +          // 25% - Test coverage
  typeCheck * 0.20 +         // 20% - Type safety
  lintQuality * 0.15         // 15% - Code quality
)
```

### Workflow

1. **For each test case:**
   - Run `/flow:full-flow` with the description
   - Run `npm test -- --coverage`
   - Run `npx tsc --noEmit`
   - Run `npm run lint`
   - Calculate weighted score
   - Reset git repo (`git reset --hard HEAD`)

2. **Save results:**
   - Individual run: `.claude/evaluation_results/{runId}.json`
   - Index: `.claude/evaluation_results/index.json`

3. **Generate visualizations:**
   - Read all runs from index
   - Create D3.js charts
   - Output static HTML file

## Customization

### Adjust Scoring Weights

Edit `scripts/run-evaluation.ts`, function `calculateScore()`:

```typescript
const weights = {
  tests: 0.4,      // Change to 0.5 for more test emphasis
  coverage: 0.25,  // Change to 0.2 for less coverage emphasis
  types: 0.20,
  lint: 0.15
};
```

### Add More Metrics

In `gatherMetrics()`, add:

```typescript
// Example: Check bundle size
const bundleSize = execSync('du -sh frontend/dist').toString();
metrics.bundleSize = parseInt(bundleSize);
```

### Customize Dashboard

Edit `scripts/generate-visualization.ts`:
- Change colors: Search for `#6366f1` (primary color)
- Add charts: Use D3.js patterns in the existing code
- Modify layout: Edit the CSS grid in `<style>` section

## Data Format

### Test Case
```json
{
  "id": "unique-id",
  "description": "What to generate",
  "expectedFeatures": ["Feature 1", "Feature 2"],
  "complexity": "simple" | "medium" | "complex"
}
```

### Experiment Result
```json
{
  "runId": "baseline_1731843000",
  "experimentName": "baseline",
  "timestamp": "2025-11-17T10:00:00Z",
  "metadata": {
    "promptVersion": "v1",
    "notes": "Baseline run"
  },
  "results": [
    {
      "testCaseId": "dark-mode",
      "success": true,
      "score": 0.87,
      "metrics": {
        "testPassRate": 1.0,
        "coverage": 85,
        "typeErrors": 0,
        "lintErrors": 0,
        "lintWarnings": 2
      },
      "generatedFiles": ["...", "..."],
      "duration": 45000
    }
  ],
  "summary": {
    "totalTests": 5,
    "successCount": 5,
    "avgScore": 0.84
  }
}
```

## Tips

### Run Experiments in Parallel

```bash
# If you have multiple machines or want to test different prompts
npx tsx scripts/run-evaluation.ts experiment-a v2 &
npx tsx scripts/run-evaluation.ts experiment-b v3 &
wait
```

### Filter Test Cases

Edit the runner to test specific cases:

```typescript
// In run-evaluation.ts, before running experiment:
const filteredCases = testCases.filter(tc => tc.complexity === 'simple');
await runExperiment(experimentName, filteredCases, metadata);
```

### Export Data

```bash
# Export to CSV
cat .claude/evaluation_results/index.json | \
  jq -r '.[] | [.runId, .experimentName, .summary.avgScore, .timestamp] | @csv' \
  > results.csv
```

## Next Steps

1. **Add more test cases** to `.claude/evaluation-dataset.json`
2. **Run baseline** to establish initial scores
3. **Iterate on prompts** in `.claude/commands/flow/`
4. **Run experiments** and compare results
5. **Build custom visualizations** with D3.js

## Advanced: Add LLM Judge

Want semantic code quality assessment? Add this to `gatherMetrics()`:

```typescript
import Anthropic from '@anthropic-ai/sdk';

async function evaluateWithLLM(code: string): Promise<number> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Evaluate this code quality 0-1:\n\n${code}`
    }]
  });

  // Parse response, return score
  return parseFloat(response.content[0].text);
}
```

Then include in score calculation.

---

**That's it!** You now have a complete evaluation harness with ~500 lines of code.
