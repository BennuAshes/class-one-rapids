# Package Installation Validation Test

## Test Case: Legend State Installation

### Runbook Says:
```bash
npm install @legendapp/state
```

### Research Says (from research/tech/legendstate-v3-research.md):
```bash
npm install @legendapp/state@beta
```

### Expected Behavior:
When `follow-runbook-with-senior-engineer` encounters the npm install command:

1. **Extract**: Package = `@legendapp/state`
2. **Search**: Find in `research/tech/legendstate-v3-research.md`
3. **Compare**: 
   - Runbook: `@legendapp/state` (no tag)
   - Research: `@legendapp/state@beta` (has @beta tag)
4. **Result**: **STOP EXECUTION**

### Output:
```
⚠️ VERSION CONFLICT DETECTED
Package: @legendapp/state
Runbook specifies: @legendapp/state
Research specifies: @legendapp/state@beta (from research/tech/legendstate-v3-research.md)

ACTION REQUIRED: Resolve conflict before proceeding
- Option 1: Update runbook to match research
- Option 2: Update research if runbook is correct
- Option 3: Investigate why they differ
```

## How This Prevents The Issue

With these changes:

1. **During runbook generation** (`create-development-runbook-v2`):
   - Would have searched research files
   - Found `@legendapp/state@beta`
   - Generated runbook with correct version

2. **During runbook execution** (`follow-runbook-with-senior-engineer`):
   - Even if generation missed it
   - Would detect the conflict
   - STOP before installing wrong version

## The Key Principle

**Research is the source of truth for package versions**
- Runbooks should incorporate research
- Execution validates consistency
- Conflicts stop execution for human review