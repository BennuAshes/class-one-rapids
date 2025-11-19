#!/usr/bin/env tsx

/**
 * Compare Evaluation Runs
 *
 * Compares two experiment runs and shows improvements/regressions.
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExperimentRun {
  runId: string;
  experimentName: string;
  timestamp: string;
  metadata: Record<string, any>;
  results: Array<{
    testCaseId: string;
    score: number;
    success: boolean;
    metrics?: any;
  }>;
  summary: {
    totalTests: number;
    successCount: number;
    failureCount: number;
    avgScore: number;
    avgDuration: number;
    totalDuration: number;
  };
}

const RESULTS_DIR = path.join(process.cwd(), '.claude', 'evaluation_results');

function loadRun(runId: string): ExperimentRun {
  const filePath = path.join(RESULTS_DIR, `${runId}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Run not found: ${runId}`);
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function compareRuns(run1: ExperimentRun, run2: ExperimentRun): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 COMPARING RUNS`);
  console.log(`${'='.repeat(80)}\n`);

  // Run 1 info
  console.log(`Run 1: ${run1.experimentName}`);
  console.log(`  Run ID: ${run1.runId}`);
  console.log(`  Timestamp: ${run1.timestamp}`);
  console.log(`  Avg Score: ${Math.round(run1.summary.avgScore * 100)}/100`);
  console.log(`  Success Rate: ${run1.summary.successCount}/${run1.summary.totalTests}`);
  if (run1.metadata.promptVersion) {
    console.log(`  Prompt Version: ${run1.metadata.promptVersion}`);
  }

  console.log();

  // Run 2 info
  console.log(`Run 2: ${run2.experimentName}`);
  console.log(`  Run ID: ${run2.runId}`);
  console.log(`  Timestamp: ${run2.timestamp}`);
  console.log(`  Avg Score: ${Math.round(run2.summary.avgScore * 100)}/100`);
  console.log(`  Success Rate: ${run2.summary.successCount}/${run2.summary.totalTests}`);
  if (run2.metadata.promptVersion) {
    console.log(`  Prompt Version: ${run2.metadata.promptVersion}`);
  }

  console.log();

  // Overall delta
  const scoreDelta = run2.summary.avgScore - run1.summary.avgScore;
  const scorePercent = ((scoreDelta / run1.summary.avgScore) * 100).toFixed(1);
  const arrow = scoreDelta > 0 ? '⬆️' : scoreDelta < 0 ? '⬇️' : '➡️';
  const sign = scoreDelta > 0 ? '+' : '';

  console.log(`Overall Change:`);
  console.log(`  Score: ${sign}${(scoreDelta * 100).toFixed(1)} points (${sign}${scorePercent}%) ${arrow}`);

  const successDelta = run2.summary.successCount - run1.summary.successCount;
  if (successDelta !== 0) {
    console.log(`  Success Rate: ${successDelta > 0 ? '+' : ''}${successDelta} tests`);
  }

  console.log();

  // Test case breakdown
  console.log(`${'='.repeat(80)}`);
  console.log(`Test Case Breakdown:`);
  console.log(`${'='.repeat(80)}\n`);

  // Match test cases by ID
  const testCaseMap = new Map<string, { run1Score: number; run2Score: number }>();

  run1.results.forEach(r => {
    testCaseMap.set(r.testCaseId, { run1Score: r.score, run2Score: 0 });
  });

  run2.results.forEach(r => {
    const existing = testCaseMap.get(r.testCaseId);
    if (existing) {
      existing.run2Score = r.score;
    } else {
      testCaseMap.set(r.testCaseId, { run1Score: 0, run2Score: r.score });
    }
  });

  // Sort by delta (biggest improvements first)
  const sorted = Array.from(testCaseMap.entries())
    .map(([id, scores]) => ({
      id,
      ...scores,
      delta: scores.run2Score - scores.run1Score
    }))
    .sort((a, b) => b.delta - a.delta);

  // Print results
  sorted.forEach(({ id, run1Score, run2Score, delta }) => {
    const score1 = Math.round(run1Score * 100);
    const score2 = Math.round(run2Score * 100);
    const deltaPts = Math.round(delta * 100);
    const sign = delta > 0 ? '+' : '';

    let icon = '➡️';
    if (delta > 0.05) icon = '✅';
    else if (delta < -0.05) icon = '❌';

    console.log(`${icon} ${id.padEnd(25)} ${String(score1).padStart(3)} → ${String(score2).padStart(3)}  (${sign}${deltaPts})`);
  });

  console.log();

  // Summary
  const improvements = sorted.filter(t => t.delta > 0.05).length;
  const regressions = sorted.filter(t => t.delta < -0.05).length;
  const unchanged = sorted.length - improvements - regressions;

  console.log(`Summary:`);
  console.log(`  Improvements: ${improvements}`);
  console.log(`  Regressions: ${regressions}`);
  console.log(`  Unchanged: ${unchanged}`);
  console.log();
}

// CLI
function main() {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.error('Usage: compare-runs.ts <run_id_1> <run_id_2>');
    console.error('\nExample:');
    console.error('  compare-runs.ts baseline_1731843000 improved_1731844000');
    console.error('\nAvailable runs:');

    const indexPath = path.join(RESULTS_DIR, 'index.json');
    if (fs.existsSync(indexPath)) {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      index.forEach((run: any) => {
        console.error(`  - ${run.runId} (${run.experimentName}, ${run.timestamp})`);
      });
    }

    process.exit(1);
  }

  const [runId1, runId2] = args;

  try {
    const run1 = loadRun(runId1);
    const run2 = loadRun(runId2);
    compareRuns(run1, run2);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { compareRuns };
