#!/usr/bin/env tsx

/**
 * Custom Evaluation Runner for Claude Code Generations
 *
 * This script runs code generation experiments and tracks scores.
 * Results are saved to JSON files for analysis and visualization.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

interface TestCase {
  id: string;
  description: string;
  expectedFeatures: string[];
  complexity: 'simple' | 'medium' | 'complex';
}

interface Metrics {
  testPassRate: number;
  testsPassed: number;
  testsTotal: number;
  coverage: number;
  typeErrors: number;
  lintErrors: number;
  lintWarnings: number;
  buildSuccess: boolean;
}

interface TestCaseResult {
  testCaseId: string;
  testCase: TestCase;
  success: boolean;
  metrics: Metrics | null;
  score: number;
  error?: string;
  generatedFiles?: string[];
  duration: number;
}

interface ExperimentRun {
  runId: string;
  experimentName: string;
  timestamp: string;
  metadata: {
    promptVersion?: string;
    notes?: string;
    [key: string]: any;
  };
  results: TestCaseResult[];
  summary: {
    totalTests: number;
    successCount: number;
    failureCount: number;
    avgScore: number;
    avgDuration: number;
    totalDuration: number;
  };
}

// ============================================================================
// Configuration
// ============================================================================

const RESULTS_DIR = path.join(process.cwd(), '.claude', 'evaluation_results');
const DATASET_PATH = path.join(process.cwd(), '.claude', 'evaluation-dataset.json');

// Ensure results directory exists
fs.mkdirSync(RESULTS_DIR, { recursive: true });

// ============================================================================
// Metric Gathering
// ============================================================================

function gatherMetrics(): Metrics {
  console.log('    📊 Gathering metrics...');

  const metrics: Metrics = {
    testPassRate: 0,
    testsPassed: 0,
    testsTotal: 0,
    coverage: 0,
    typeErrors: 0,
    lintErrors: 0,
    lintWarnings: 0,
    buildSuccess: true
  };

  // Run tests
  try {
    const testOutput = execSync('npm test -- --json --coverage', {
      encoding: 'utf-8',
      cwd: path.join(process.cwd(), 'frontend')
    });

    const testResults = JSON.parse(testOutput);
    metrics.testsPassed = testResults.numPassedTests || 0;
    metrics.testsTotal = testResults.numTotalTests || 1;
    metrics.testPassRate = metrics.testsPassed / metrics.testsTotal;
    metrics.coverage = testResults.coverage?.lines || 0;

    console.log(`    ✅ Tests: ${metrics.testsPassed}/${metrics.testsTotal} (${Math.round(metrics.testPassRate * 100)}%)`);
    console.log(`    ✅ Coverage: ${metrics.coverage}%`);
  } catch (error) {
    console.log(`    ❌ Tests failed`);
    metrics.buildSuccess = false;
  }

  // Type check
  try {
    execSync('npx tsc --noEmit', {
      encoding: 'utf-8',
      cwd: path.join(process.cwd(), 'frontend'),
      stdio: 'pipe'
    });
    console.log(`    ✅ Type check: 0 errors`);
  } catch (error: any) {
    const stderr = error.stderr?.toString() || '';
    metrics.typeErrors = (stderr.match(/error TS\d+/g) || []).length;
    console.log(`    ⚠️  Type check: ${metrics.typeErrors} errors`);
  }

  // Lint check
  try {
    execSync('npm run lint', {
      encoding: 'utf-8',
      cwd: path.join(process.cwd(), 'frontend'),
      stdio: 'pipe'
    });
    console.log(`    ✅ Lint: 0 issues`);
  } catch (error: any) {
    const stdout = error.stdout?.toString() || '';
    const errorMatch = stdout.match(/(\d+) error/);
    const warningMatch = stdout.match(/(\d+) warning/);
    metrics.lintErrors = errorMatch ? parseInt(errorMatch[1]) : 0;
    metrics.lintWarnings = warningMatch ? parseInt(warningMatch[1]) : 0;
    console.log(`    ⚠️  Lint: ${metrics.lintErrors} errors, ${metrics.lintWarnings} warnings`);
  }

  return metrics;
}

// ============================================================================
// Score Calculation
// ============================================================================

function calculateScore(metrics: Metrics): number {
  // Weighted scoring
  const weights = {
    tests: 0.4,      // 40% - Tests passing
    coverage: 0.25,  // 25% - Test coverage
    types: 0.20,     // 20% - Type safety
    lint: 0.15       // 15% - Code quality (lint)
  };

  const testScore = metrics.testPassRate;
  const coverageScore = metrics.coverage / 100;
  const typeScore = metrics.typeErrors === 0 ? 1 : 0;
  const lintScore = Math.max(0, 1 - (metrics.lintErrors * 0.2) - (metrics.lintWarnings * 0.05));

  const totalScore = (
    testScore * weights.tests +
    coverageScore * weights.coverage +
    typeScore * weights.types +
    lintScore * weights.lint
  );

  return Math.round(totalScore * 100) / 100;
}

// ============================================================================
// Git Helpers
// ============================================================================

function getGeneratedFiles(): string[] {
  try {
    const output = execSync('git diff --name-only HEAD', {
      encoding: 'utf-8'
    });
    return output.trim().split('\n').filter(f => f.length > 0);
  } catch {
    return [];
  }
}

function resetRepository(): void {
  try {
    execSync('git reset --hard HEAD', { stdio: 'pipe' });
    execSync('git clean -fd', { stdio: 'pipe' });
  } catch (error) {
    console.log('    ⚠️  Could not reset repository');
  }
}

// ============================================================================
// Test Case Execution
// ============================================================================

async function runTestCase(testCase: TestCase): Promise<TestCaseResult> {
  const startTime = Date.now();

  console.log(`\n  🧪 Test Case: ${testCase.id}`);
  console.log(`    Description: ${testCase.description}`);

  try {
    // Run the flow
    console.log(`    🚀 Running /flow:full-flow...`);
    execSync(
      `echo "${testCase.description}" | claude-code /flow:full-flow`,
      {
        encoding: 'utf-8',
        stdio: 'pipe'
      }
    );

    // Gather metrics
    const metrics = gatherMetrics();

    // Get generated files
    const generatedFiles = getGeneratedFiles();
    console.log(`    📝 Generated ${generatedFiles.length} files`);

    // Calculate score
    const score = calculateScore(metrics);
    console.log(`    ⭐ Score: ${Math.round(score * 100)}/100`);

    const duration = Date.now() - startTime;

    // Reset for next test
    console.log(`    🔄 Resetting repository...`);
    resetRepository();

    return {
      testCaseId: testCase.id,
      testCase,
      success: true,
      metrics,
      score,
      generatedFiles,
      duration
    };

  } catch (error: any) {
    const duration = Date.now() - startTime;

    console.log(`    ❌ Failed: ${error.message}`);

    // Still try to reset
    resetRepository();

    return {
      testCaseId: testCase.id,
      testCase,
      success: false,
      metrics: null,
      score: 0,
      error: error.message,
      duration
    };
  }
}

// ============================================================================
// Experiment Runner
// ============================================================================

async function runExperiment(
  experimentName: string,
  testCases: TestCase[],
  metadata: Record<string, any> = {}
): Promise<ExperimentRun> {
  const runId = `${experimentName}_${Date.now()}`;
  const timestamp = new Date().toISOString();

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 EXPERIMENT: ${experimentName}`);
  console.log(`📅 ${timestamp}`);
  console.log(`📊 Test Cases: ${testCases.length}`);
  console.log(`${'='.repeat(80)}\n`);

  const results: TestCaseResult[] = [];

  for (let i = 0; i < testCases.length; i++) {
    console.log(`\n[${"Progress " + (i + 1) + "/" + testCases.length}]`);
    const result = await runTestCase(testCases[i]);
    results.push(result);
  }

  // Calculate summary
  const successCount = results.filter(r => r.success).length;
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  const experimentRun: ExperimentRun = {
    runId,
    experimentName,
    timestamp,
    metadata,
    results,
    summary: {
      totalTests: testCases.length,
      successCount,
      failureCount: testCases.length - successCount,
      avgScore: Math.round(avgScore * 100) / 100,
      avgDuration: Math.round(avgDuration),
      totalDuration
    }
  };

  // Save results
  const resultsFile = path.join(RESULTS_DIR, `${runId}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(experimentRun, null, 2));

  // Append to index
  updateIndex(experimentRun);

  // Print summary
  printSummary(experimentRun);

  return experimentRun;
}

// ============================================================================
// Index Management
// ============================================================================

function updateIndex(experimentRun: ExperimentRun): void {
  const indexPath = path.join(RESULTS_DIR, 'index.json');

  let index: any[] = [];
  if (fs.existsSync(indexPath)) {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  }

  index.push({
    runId: experimentRun.runId,
    experimentName: experimentRun.experimentName,
    timestamp: experimentRun.timestamp,
    metadata: experimentRun.metadata,
    summary: experimentRun.summary
  });

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
}

// ============================================================================
// Output
// ============================================================================

function printSummary(experimentRun: ExperimentRun): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`✅ EXPERIMENT COMPLETE: ${experimentRun.experimentName}`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`📊 Summary:`);
  console.log(`  Total Tests: ${experimentRun.summary.totalTests}`);
  console.log(`  Success: ${experimentRun.summary.successCount}`);
  console.log(`  Failures: ${experimentRun.summary.failureCount}`);
  console.log(`  Average Score: ${Math.round(experimentRun.summary.avgScore * 100)}/100`);
  console.log(`  Average Duration: ${Math.round(experimentRun.summary.avgDuration / 1000)}s`);
  console.log(`  Total Duration: ${Math.round(experimentRun.summary.totalDuration / 1000)}s`);

  console.log(`\n📈 Results by Test Case:`);
  experimentRun.results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const score = Math.round(result.score * 100);
    console.log(`  ${icon} ${result.testCaseId}: ${score}/100`);
  });

  console.log(`\n💾 Results saved to:`);
  console.log(`  ${path.join(RESULTS_DIR, `${experimentRun.runId}.json`)}`);
  console.log(`\n`);
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const experimentName = args[0] || 'baseline';
  const promptVersion = args[1] || 'v1';

  // Load dataset
  if (!fs.existsSync(DATASET_PATH)) {
    console.error(`❌ Dataset not found: ${DATASET_PATH}`);
    console.error(`Create a dataset file with test cases.`);
    process.exit(1);
  }

  const testCases: TestCase[] = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf-8'));

  if (testCases.length === 0) {
    console.error(`❌ Dataset is empty`);
    process.exit(1);
  }

  // Run experiment
  await runExperiment(experimentName, testCases, {
    promptVersion,
    nodeVersion: process.version,
    platform: process.platform
  });
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export { runExperiment, TestCase, ExperimentRun };
