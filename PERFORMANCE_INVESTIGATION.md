# Performance Investigation Summary

## Problem Statement
Workflow tests taking 40+ seconds with mock mode enabled when they should complete in <5 seconds.

## Investigation Timeline

### Initial Hypothesis: Windows Defender / WSL Overhead
- **Evidence**: Running on `/mnt/c` (Windows filesystem via WSL)
- **Tests**:
  - File I/O: Fast (0.005s per write) ✓
  - Git operations: Fast (0.017s per status) ✓
  - Subprocess creation: Fast (0.001s per echo) ✓
  - Python imports: Fast after lazy init (0.04s) ✓
  - Workflow simulation: Fast (0.5s for 5 steps) ✓

**Conclusion**: WSL/Defender overhead is minimal for individual operations.

### Python Profiling Analysis
```
Total runtime: 19.6s
Time in epoll.poll(): 19.1s (97.5%)
Actual work: <0.5s
```

**Interpretation**: Event loop is idle-waiting, suggesting external process delay.

### Execution Tracing (BREAKTHROUGH)
Custom tracer revealed timing breakdown:
```
Step 1 (Generate PRD):     0.053s ✓
Step 2 (Generate Design):  0.057s ✓
Step 3 (Generate Tasks):   0.055s ✓
Step 4 (Execute Tasks):   16.833s ✗ ← BOTTLENECK
Step 5 (Generate Summary):  0.012s ✓
```

### Root Cause Analysis

**Bug Found in `claude_cli.py`:**

The `run_claude_execute()` function does NOT accept or pass the `mock_mode` parameter:

```python
# scripts/workflow/services/claude_cli.py:430
async def run_claude_execute(
    tasks_file_path: str,
    execution_id: str  # ← Missing mock_mode parameter!
) -> ClaudeCommandResult:
    return await run_claude_command(
        command="/flow:execute-task",
        stdin_input=tasks_file_path,
        execution_id=execution_id,
        use_stream_json=False  # ← Missing mock_mode argument!
    )
```

**Impact**: Execute Tasks step always attempts to run the real `claude /flow:execute-task` command, which:
1. Tries to spawn real Claude CLI subprocess
2. Waits for response that never comes (no approval server running)
3. Eventually times out or returns error after ~17 seconds

## Contributing Factors

### 1. Lazy Langfuse Initialization (FIXED ✓)
- **Before**: 3+ second subprocess timeout on every import
- **After**: 0.04s lazy import
- **Impact**: Reduced baseline overhead from 100+ seconds to <1 second

### 2. Unused MockLLMService
- Created but never called by step executors
- `--mock-delay` parameter has no effect
- Step executors call `run_claude_*` functions directly

### 3. Hardcoded Mock Delay
- `_run_mock_claude_command()` has hardcoded `await asyncio.sleep(0.05)`
- Not configurable via `--mock-delay` parameter

## Diagnostic Tools Created

### 1. Performance Diagnostic Tool (`scripts/diagnose_performance.py`)
Comprehensive test suite covering:
- File I/O performance
- Subprocess creation
- Git operations
- Asyncio event loop
- WSL/Windows Defender detection
- Workflow simulation
- Automated recommendations

**Usage**:
```bash
python3 scripts/diagnose_performance.py
```

### 2. Execution Tracer (`scripts/trace_workflow.py`)
Monkey-patches workflow methods to trace execution timing.

**Usage**:
```bash
python3 scripts/trace_workflow.py
```

## Research Findings: WSL Performance

### Windows Defender Impact
- Can reduce I/O speeds by 70x (from 130 MB/s to 1.8 MB/s)
- Scans all file operations on `/mnt/c` (Windows filesystem)
- Process exclusions automatically exclude folders the process accesses

### WSL2 File System Performance
- 9P protocol used for `/mnt/c` access is "insanely slow"
- Native Linux FS (`~/`) is 5-10x faster than Windows FS (`/mnt/c/`)
- Git operations particularly affected

### Recommendations from Community
1. **Move project to native Linux filesystem**: `~/dev/` instead of `/mnt/c/dev/`
2. **Add Defender exclusions**:
   - WSL distro path: `%USERPROFILE%\AppData\Local\Packages\CanonicalGroupLimited...\`
   - Python executable
   - Git executable
3. **Upgrade to WSL2** if on WSL1

## Action Plan

### Immediate Fixes (High Impact)

#### Fix 1: Add mock_mode to run_claude_execute
**File**: `scripts/workflow/services/claude_cli.py`

```python
async def run_claude_execute(
    tasks_file_path: str,
    execution_id: str,
    mock_mode: bool = False  # ← ADD THIS
) -> ClaudeCommandResult:
    return await run_claude_command(
        command="/flow:execute-task",
        stdin_input=tasks_file_path,
        execution_id=execution_id,
        use_stream_json=False,
        mock_mode=mock_mode  # ← ADD THIS
    )
```

**File**: `scripts/workflow/steps/execute.py`

```python
result = await run_claude_execute(
    tasks_file_path=tasks_input_path,
    execution_id=config.execution_id,
    mock_mode=config.mock_mode  # ← ADD THIS
)
```

**Expected Impact**: Reduce test time from 40s to <1s

#### Fix 2: Make mock delay configurable
**File**: `scripts/workflow/services/claude_cli.py`

```python
async def _run_mock_claude_command(
    command: str,
    stdin_input: Optional[str] = None,
    output_file: Optional[Path] = None,
    delay: float = 0.05  # ← ADD THIS
) -> ClaudeCommandResult:
    # Simulate a small delay
    await asyncio.sleep(delay)  # ← USE PARAMETER
    ...
```

Pass `mock_delay` from config through the call chain.

### Performance Optimizations (Medium Impact)

#### Optimization 1: Skip git operations in mock mode
Git status/diff add ~0.02s per step unnecessarily in mock mode.

#### Optimization 2: Skip file preview generation in auto-approve mode
Preview generation is wasted work when auto-approving.

### Environmental Improvements (Optional)

#### Option 1: Move to Native Linux Filesystem (HIGHEST IMPACT)
```bash
cp -r /mnt/c/dev/class-one-rapids ~/dev/class-one-rapids
cd ~/dev/class-one-rapids
./workflow --mock --approval test --no-telemetry test-feature.md
```
**Expected**: 5-10x speedup for all file operations

#### Option 2: Windows Defender Exclusions
1. Open Windows Security
2. Virus & threat protection settings
3. Manage settings → Exclusions → Add exclusion
4. Add folders:
   - `/mnt/c/dev/class-one-rapids/workflow-outputs/`
   - `%USERPROFILE%\AppData\Local\Packages\CanonicalGroupLimited...`

## Expected Results After Fixes

### Before
```
Total time: 40-50 seconds
- Steps 1-3: 0.15s (fast)
- Execute Tasks: 40s (timeout/waiting)
- Step 5: 0.05s (fast)
```

### After (with mock_mode fix)
```
Total time: <1 second
- Steps 1-3: 0.15s
- Execute Tasks: 0.05s (mocked!)
- Step 5: 0.05s
```

### After (with all optimizations + native FS)
```
Total time: <0.5 seconds
- All steps: ~0.08s each
```

## ✅ ACTUAL RESULTS (FIX APPLIED)

### Fix Applied: 2025-11-09

**Changes Made**:
1. Added `mock_mode: bool = False` parameter to `run_claude_execute()` in `scripts/workflow/services/claude_cli.py:430-433`
2. Passed `mock_mode=mock_mode` to `run_claude_command()` in `claude_cli.py:451`
3. Passed `mock_mode=config.mock_mode` from `execute.py:75`

### Execution Tracer Results (After Fix)

```
Generate PRD:              0.054s ✓
Generate Technical Design: 0.063s ✓
Generate Task List:        0.055s ✓
Execute Tasks:             0.051s ✓ ← FIXED! (was 16.833s)
Generate Summary:          0.004s ✓
────────────────────────────────────
Total Workflow:            0.268s
```

### Test Suite Results (After Fix)

```bash
$ time ./test-workflow.sh
✓ All tests passed!
real    0m2.657s  # Includes 4 separate workflow runs + validation
```

### Performance Improvement

**Execute Tasks Step**:
- Before: 16.833 seconds
- After: 0.051 seconds
- **Improvement: 330x faster** (99.7% reduction)

**Full Workflow**:
- Before: ~17 seconds (traced) / 40+ seconds (with test suite overhead)
- After: 0.268 seconds (traced) / 2.657 seconds (full test suite)
- **Improvement: ~63x faster** (traced) / ~15x faster (test suite)

**Root Cause Confirmed**: Missing `mock_mode` parameter caused Execute Tasks to always attempt spawning real Claude CLI subprocess, which timed out waiting for response.

**Status**: ✅ **RESOLVED** - Mock mode now works correctly across all workflow steps.

## Testing Commands

```bash
# Run diagnostic
python3 scripts/diagnose_performance.py

# Run execution tracer
python3 scripts/trace_workflow.py

# Run workflow with timing
time ./workflow --mock --approval test --no-telemetry test-feature.md

# Run test suite
./test-workflow.sh

# Profile workflow
python3 -m cProfile -o /tmp/workflow.prof scripts/workflow.py --mock --approval test --no-telemetry test-feature.md
python3 -c "import pstats; pstats.Stats('/tmp/workflow.prof').sort_stats('cumulative').print_stats(20)"
```

## Conclusion

**Primary Issue**: Execute Tasks step not using mock mode due to missing parameter
**Secondary Issue**: WSL filesystem overhead (fixable by moving to native FS)
**Tertiary Issue**: Unused mock delay configuration

The investigation revealed a simple bug (missing `mock_mode` parameter) that was causing the 17-second delay in Execute Tasks. This was obscured by WSL overhead concerns, but the root cause was in the code itself.

**Estimated fix time**: 5 minutes
**Estimated impact**: 40x performance improvement (from 40s to <1s)
