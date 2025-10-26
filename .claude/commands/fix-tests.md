---
description: "Comprehensively investigate and fix all test failures systematically"
argument-hint: "[test-path-pattern]"
allowed-tools: "Read, Write, Edit, Bash, Grep, Glob"
---

# Comprehensive Test Fix Command

Fix all test failures for: ${1:-"all tests"}

## Phase 1: Deep Investigation (BEFORE any fixes)

### 1.1 Capture Complete Test State
!`npm test ${1:-} 2>&1 | tee /tmp/test-output-full.txt`

### 1.2 Analyze ALL Error Patterns
Extract and categorize all unique error types:
- Group similar errors (e.g., all "Element type is invalid")
- Count occurrences of each error pattern
- Map errors to affected test files

### 1.3 Trace Import Dependencies
For each failing test file:
1. Read the test file completely
2. Read the component/module being tested
3. List ALL imports from both files
4. Identify ALL external dependencies that need mocking

### 1.4 Pattern Recognition
- If multiple tests have same error → identify root cause
- If error mentions missing module/component → check ALL tests for same issue
- If mock is incomplete → find ALL usages across codebase

## Phase 2: Comprehensive Solution Design

### 2.1 Create Fix Categories
Based on investigation, group fixes by type:
- **Missing Mocks**: List ALL components/modules needing mocks
- **Incorrect Mock Types**: String mocks that should be React components
- **Export Issues**: Missing named/default exports
- **Configuration**: Jest config, setup files, host components
- **Async/Timing**: Timer issues, async cleanup, waitFor problems
- **Native Modules**: React Navigation, Animated, Linking, etc.

### 2.2 Estimate Impact
For each fix category:
- How many tests will this fix?
- Are there cascading dependencies?
- Will this break other tests?

## Phase 3: Systematic Implementation

### 3.1 Fix Order Strategy
1. **Infrastructure first**: Jest config, setup files
2. **Common mocks second**: Components used everywhere
3. **Specific mocks last**: Test-specific issues

### 3.2 Implement ALL Related Fixes Together
For each category:
- Implement complete solution (not incremental)
- Include all variations/sub-components
- Test the fix broadly

Example: If mocking react-native-paper:
- Mock ALL used components at once
- Include sub-components (Card.Title, Appbar.Header, etc.)
- Export all name variations (Provider/PaperProvider)

## Phase 4: Verification & Iteration

### 4.1 Run Tests After Each Category
!`npm test ${1:-} 2>&1 | tee /tmp/test-output-iteration-$ITERATION.txt`

### 4.2 Compare Results
- Tests passing before: X
- Tests passing now: Y
- Improvement: Y-X (should be significant, not incremental)

### 4.3 Analyze Remaining Failures
If tests still fail:
- Are they the same errors? (fix incomplete)
- New errors? (fix caused regression)
- Different category? (move to next fix)

## Phase 5: Iteration Loop

Repeat until one of these conditions:
1. **Success**: ≥95% tests passing
2. **Plateau**: No improvement in 2 iterations
3. **Max iterations**: 5 attempts reached

For each iteration:
- Re-investigate remaining failures
- Check if initial investigation missed patterns
- Look for new error types introduced by fixes

## Phase 6: Final Report

### 6.1 Success Report (if ≥95% passing)
```
✅ TEST FIX COMPLETE
- Initial: X/Y tests passing (Z%)
- Final: A/Y tests passing (B%)
- Improvement: +C tests fixed

Key fixes implemented:
1. [Category]: [Description] (+N tests)
2. [Category]: [Description] (+N tests)
...
```

### 6.2 Failure Analysis (if <95% passing)

```
⚠️ PARTIAL FIX - Manual Intervention Needed

Progress:
- Initial: X/Y tests passing (Z%)
- Final: A/Y tests passing (B%)
- Improvement: +C tests fixed

Remaining Issues (23 tests):
┌─────────────────────────────────────────┐
│ Test File                   │ Failures │
├─────────────────────────────────────────┤
│ ComponentA.test.tsx         │ 3        │
│ ComponentB.test.tsx         │ 5        │
└─────────────────────────────────────────┘

Attempted Solutions:
1. ❌ Mock ComponentX as React element
   - Error persists: "Cannot read property 'foo'"
   - Likely cause: Nested dependency not mocked

2. ❌ Add Timer mocks
   - Error persists: "Exceeded timeout"
   - Likely cause: Promises not resolving in fake timers

3. ❌ Mock Navigation context
   - Error persists: "No navigator"
   - Likely cause: Test needs NavigationContainer wrapper

Root Cause Analysis:
- Category 1 (8 tests): Missing native module X
  Tried: Mock X, Mock Y that imports X
  Hypothesis: Need to mock at different level

- Category 2 (10 tests): Async cleanup issues
  Tried: waitFor, act, cleanup
  Hypothesis: Component has unhandled promise

- Category 3 (5 tests): Context providers
  Tried: Mock provider, wrap in provider
  Hypothesis: Multiple contexts required

Recommended Next Steps:
1. For native module issues: Check node_modules/.../X for actual exports
2. For async issues: Add console logs to identify hanging promise
3. For context issues: Wrap tests in all required providers
```

## Implementation Guidelines

### DO:
- Read ENTIRE error output before fixing anything
- Fix ALL instances of a pattern at once
- Test broadly after each fix category
- Document what was tried and why it failed

### DON'T:
- Fix one error, run test, fix next error (incremental)
- Assume one component mock fixes one test
- Stop at first error in a category
- Make changes without understanding impact

### Key Patterns to Recognize:
1. **"Element type is invalid"** → Component mock is wrong type
2. **"Cannot read properties of undefined"** → Missing mock or wrong export
3. **"Native module not available"** → Need native module mock
4. **"No provider"** → Missing context wrapper
5. **"Timeout exceeded"** → Async/timer issue
6. **"Unable to find"** → Query issue or component not rendering

## Investigation Commands

Use these to gather comprehensive data:

```bash
# Find all imports of a package
grep -r "from 'react-native-paper'" src/ --include="*.tsx" --include="*.ts"

# Find all test files
find src -name "*.test.tsx" -o -name "*.test.ts"

# Count error occurrences
grep -c "Element type is invalid" /tmp/test-output-full.txt

# List all unique errors
grep -E "●|Error:|TypeError:|ReferenceError:" /tmp/test-output-full.txt | sort -u
```

## Success Metrics

A successful run should achieve:
- **First iteration**: Fix 40-60% of failures (infrastructure/common issues)
- **Second iteration**: Fix 20-30% more (specific mocks)
- **Third iteration**: Fix 10-15% more (edge cases)
- **Total**: 85-95% of all tests passing

If not achieving these metrics, investigation was insufficient.

Remember: **Investigation depth BEFORE fixes, not incremental discovery during fixes.**