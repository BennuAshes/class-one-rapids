#!/usr/bin/env tsx

/**
 * Generate HTML Visualization for Evaluation Results
 *
 * Creates an interactive dashboard using D3.js to visualize:
 * - Score trends over time
 * - Test case performance comparison
 * - Success/failure distribution
 */

import * as fs from 'fs';
import * as path from 'path';

const RESULTS_DIR = path.join(process.cwd(), '.claude', 'evaluation_results');
const OUTPUT_PATH = path.join(RESULTS_DIR, 'dashboard.html');

interface ExperimentSummary {
  runId: string;
  experimentName: string;
  timestamp: string;
  metadata: Record<string, any>;
  summary: {
    totalTests: number;
    successCount: number;
    failureCount: number;
    avgScore: number;
    avgDuration: number;
  };
}

function loadIndex(): ExperimentSummary[] {
  const indexPath = path.join(RESULTS_DIR, 'index.json');

  if (!fs.existsSync(indexPath)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
}

function loadFullRun(runId: string): any {
  const filePath = path.join(RESULTS_DIR, `${runId}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function generateHTML(experiments: ExperimentSummary[]): string {
  // Load full run data for detailed charts
  const fullRuns = experiments.map(exp => loadFullRun(exp.runId));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Generation Evaluation Dashboard</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      padding: 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: #fff;
    }

    .subtitle {
      color: #888;
      margin-bottom: 30px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 20px;
    }

    .stat-label {
      color: #888;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #fff;
    }

    .stat-change {
      font-size: 14px;
      margin-top: 8px;
    }

    .stat-change.positive {
      color: #4ade80;
    }

    .stat-change.negative {
      color: #f87171;
    }

    .chart-container {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }

    .chart-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #fff;
    }

    .axis text {
      fill: #888;
      font-size: 12px;
    }

    .axis line,
    .axis path {
      stroke: #333;
    }

    .grid line {
      stroke: #222;
      stroke-dasharray: 2,2;
    }

    .tooltip {
      position: absolute;
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 4px;
      padding: 10px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      font-size: 13px;
    }

    .line {
      fill: none;
      stroke-width: 2px;
    }

    .dot {
      cursor: pointer;
      transition: r 0.2s;
    }

    .dot:hover {
      r: 6 !important;
    }

    .bar {
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .bar:hover {
      opacity: 0.8;
    }

    .experiment-list {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 20px;
    }

    .experiment-item {
      padding: 15px;
      border-bottom: 1px solid #2a2a2a;
      cursor: pointer;
      transition: background 0.2s;
    }

    .experiment-item:hover {
      background: #222;
    }

    .experiment-item:last-child {
      border-bottom: none;
    }

    .experiment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .experiment-name {
      font-weight: 600;
      color: #fff;
    }

    .experiment-score {
      font-size: 24px;
      font-weight: bold;
    }

    .experiment-meta {
      color: #666;
      font-size: 13px;
    }

    .success-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;
    }

    .success-badge.high {
      background: #064e3b;
      color: #6ee7b7;
    }

    .success-badge.medium {
      background: #78350f;
      color: #fbbf24;
    }

    .success-badge.low {
      background: #7f1d1d;
      color: #fca5a5;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 Code Generation Evaluation Dashboard</h1>
    <p class="subtitle">Track quality metrics across experiments</p>

    <div class="stats-grid" id="statsGrid"></div>

    <div class="chart-container">
      <div class="chart-title">Score Trends Over Time</div>
      <svg id="trendChart" width="100%" height="300"></svg>
    </div>

    <div class="chart-container">
      <div class="chart-title">Test Case Performance (Latest Run)</div>
      <svg id="testCaseChart" width="100%" height="400"></svg>
    </div>

    <div class="experiment-list">
      <div class="chart-title">All Experiments</div>
      <div id="experimentList"></div>
    </div>
  </div>

  <div class="tooltip" id="tooltip"></div>

  <script>
    const data = ${JSON.stringify(fullRuns)};

    // Stats Grid
    function renderStats() {
      const statsGrid = d3.select('#statsGrid');

      if (data.length === 0) {
        statsGrid.html('<p>No experiment data available yet.</p>');
        return;
      }

      const latest = data[data.length - 1];
      const previous = data.length > 1 ? data[data.length - 2] : null;

      const stats = [
        {
          label: 'Latest Score',
          value: Math.round(latest.summary.avgScore * 100) + '/100',
          change: previous ? Math.round((latest.summary.avgScore - previous.summary.avgScore) * 100) : null
        },
        {
          label: 'Total Experiments',
          value: data.length,
          change: null
        },
        {
          label: 'Success Rate',
          value: Math.round((latest.summary.successCount / latest.summary.totalTests) * 100) + '%',
          change: previous ? Math.round(((latest.summary.successCount / latest.summary.totalTests) - (previous.summary.successCount / previous.summary.totalTests)) * 100) : null
        },
        {
          label: 'Avg Duration',
          value: Math.round(latest.summary.avgDuration / 1000) + 's',
          change: null
        }
      ];

      const cards = statsGrid.selectAll('.stat-card')
        .data(stats)
        .join('div')
        .attr('class', 'stat-card');

      cards.html(d => \`
        <div class="stat-label">\${d.label}</div>
        <div class="stat-value">\${d.value}</div>
        \${d.change !== null ? \`
          <div class="stat-change \${d.change >= 0 ? 'positive' : 'negative'}">
            \${d.change >= 0 ? '↑' : '↓'} \${Math.abs(d.change)} from previous
          </div>
        \` : ''}
      \`);
    }

    // Trend Chart
    function renderTrendChart() {
      if (data.length === 0) return;

      const margin = {top: 20, right: 30, bottom: 40, left: 50};
      const svg = d3.select('#trendChart');
      const container = svg.node().parentNode;
      const width = container.clientWidth - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      svg.selectAll('*').remove();

      const g = svg.append('g')
        .attr('transform', \`translate(\${margin.left},\${margin.top})\`);

      const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.timestamp)))
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);

      // Grid
      g.append('g')
        .attr('class', 'grid')
        .attr('transform', \`translate(0,\${height})\`)
        .call(d3.axisBottom(x).tickSize(-height).tickFormat(''));

      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

      // Axes
      g.append('g')
        .attr('class', 'axis')
        .attr('transform', \`translate(0,\${height})\`)
        .call(d3.axisBottom(x).ticks(5));

      g.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).tickFormat(d => Math.round(d * 100)));

      // Line
      const line = d3.line()
        .x(d => x(new Date(d.timestamp)))
        .y(d => y(d.summary.avgScore));

      g.append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('d', line)
        .attr('stroke', '#6366f1')
        .attr('stroke-width', 2);

      // Dots
      const tooltip = d3.select('#tooltip');

      g.selectAll('.dot')
        .data(data)
        .join('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(new Date(d.timestamp)))
        .attr('cy', d => y(d.summary.avgScore))
        .attr('r', 4)
        .attr('fill', '#6366f1')
        .on('mouseover', (event, d) => {
          tooltip
            .style('opacity', 1)
            .html(\`
              <strong>\${d.experimentName}</strong><br/>
              Score: \${Math.round(d.summary.avgScore * 100)}/100<br/>
              Success: \${d.summary.successCount}/\${d.summary.totalTests}<br/>
              \${new Date(d.timestamp).toLocaleString()}
            \`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });
    }

    // Test Case Chart
    function renderTestCaseChart() {
      if (data.length === 0) return;

      const latest = data[data.length - 1];
      const margin = {top: 20, right: 30, bottom: 100, left: 50};
      const svg = d3.select('#testCaseChart');
      const container = svg.node().parentNode;
      const width = container.clientWidth - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      svg.selectAll('*').remove();

      const g = svg.append('g')
        .attr('transform', \`translate(\${margin.left},\${margin.top})\`);

      const x = d3.scaleBand()
        .domain(latest.results.map(d => d.testCaseId))
        .range([0, width])
        .padding(0.2);

      const y = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);

      // Grid
      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

      // Axes
      g.append('g')
        .attr('class', 'axis')
        .attr('transform', \`translate(0,\${height})\`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      g.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).tickFormat(d => Math.round(d * 100)));

      // Bars
      const tooltip = d3.select('#tooltip');

      g.selectAll('.bar')
        .data(latest.results)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.testCaseId))
        .attr('y', d => y(d.score))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.score))
        .attr('fill', d => d.success ? '#10b981' : '#ef4444')
        .on('mouseover', (event, d) => {
          tooltip
            .style('opacity', 1)
            .html(\`
              <strong>\${d.testCaseId}</strong><br/>
              Score: \${Math.round(d.score * 100)}/100<br/>
              Status: \${d.success ? '✅ Success' : '❌ Failed'}<br/>
              \${d.metrics ? \`Tests: \${d.metrics.testsPassed}/\${d.metrics.testsTotal}\` : ''}
            \`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });
    }

    // Experiment List
    function renderExperimentList() {
      const list = d3.select('#experimentList');

      if (data.length === 0) {
        list.html('<p>No experiments yet.</p>');
        return;
      }

      const items = list.selectAll('.experiment-item')
        .data(data.reverse())
        .join('div')
        .attr('class', 'experiment-item');

      items.html(d => {
        const score = Math.round(d.summary.avgScore * 100);
        const successRate = Math.round((d.summary.successCount / d.summary.totalTests) * 100);
        const badgeClass = successRate >= 80 ? 'high' : successRate >= 50 ? 'medium' : 'low';

        return \`
          <div class="experiment-header">
            <div>
              <span class="experiment-name">\${d.experimentName}</span>
              <span class="success-badge \${badgeClass}">\${successRate}% success</span>
            </div>
            <div class="experiment-score" style="color: \${score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'}">\${score}</div>
          </div>
          <div class="experiment-meta">
            \${new Date(d.timestamp).toLocaleString()} •
            \${d.summary.totalTests} tests •
            \${d.metadata.promptVersion || 'no version'}
          </div>
        \`;
      });
    }

    // Render all
    renderStats();
    renderTrendChart();
    renderTestCaseChart();
    renderExperimentList();

    // Responsive resize
    window.addEventListener('resize', () => {
      renderTrendChart();
      renderTestCaseChart();
    });
  </script>
</body>
</html>`;
}

function main() {
  console.log('📊 Generating visualization...\n');

  const experiments = loadIndex();

  if (experiments.length === 0) {
    console.log('⚠️  No experiment data found.');
    console.log('Run an experiment first: npx tsx scripts/run-evaluation.ts baseline\n');
    return;
  }

  const html = generateHTML(experiments);
  fs.writeFileSync(OUTPUT_PATH, html);

  console.log(`✅ Dashboard generated!`);
  console.log(`📁 ${OUTPUT_PATH}`);
  console.log(`\nOpen in browser: file://${OUTPUT_PATH}\n`);
}

if (require.main === module) {
  main();
}
