docs/implementation/custom-eval-quickstart.md

This file contains:

- ✅ Quick start guide (5 minutes)
- ✅ How it works (workflow explanation)
- ✅ Scoring algorithm details
- ✅ File structure
- ✅ Example outputs
- ✅ Customization guide
- ✅ Data format specifications

Quick Summary from that Doc:

The Process:

1. Reads test cases from .claude/evaluation-dataset.json
2. For each test case:


    - Runs /flow:full-flow with the description
    - Gathers metrics (tests, coverage, types, lint)
    - Calculates weighted score
    - Resets git repo

3. Saves results to .claude/evaluation_results/{runId}.json
4. Updates index at .claude/evaluation_results/index.json

The Scripts:

- scripts/run-evaluation.ts - Main runner (experiment execution)
- scripts/compare-runs.ts - Comparison tool
- scripts/generate-visualization.ts - Dashboard generator

Read this file for the full details:
cat docs/implementation/custom-eval-quickstart.md

Or if you want the overview of all the research I did:

- docs/research/llm_as_judge_scoring_systems_research_20251117.md - Full research
- docs/implementation/scoring-system-implementation-guide.md - Options comparison
- docs/implementation/langfuse-vs-braintrust-corrected.md - Tool comparison

The quickstart is the best place to start though!
