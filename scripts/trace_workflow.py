#!/usr/bin/env python3
"""
Workflow Execution Tracer

Instruments the workflow code to trace where time is being spent.
Uses Python's built-in profiling and custom timing decorators.
"""

import sys
import asyncio
import time
from pathlib import Path
from datetime import datetime
import json

# Add scripts to path
sys.path.insert(0, str(Path(__file__).parent))

from workflow.types import WorkflowConfig, ApprovalMode
from workflow.orchestrator_v2 import WorkflowOrchestrator

# Timing decorator
def trace_async(name):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            start = time.time()
            print(f"[TRACE] {name} - START", file=sys.stderr)
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start
                print(f"[TRACE] {name} - END ({duration:.3f}s)", file=sys.stderr)
                return result
            except Exception as e:
                duration = time.time() - start
                print(f"[TRACE] {name} - ERROR ({duration:.3f}s): {e}", file=sys.stderr)
                raise
        return wrapper
    return decorator

# Monkey-patch key workflow methods to trace them
async def main():
    print("=" * 80, file=sys.stderr)
    print("WORKFLOW EXECUTION TRACER", file=sys.stderr)
    print("=" * 80, file=sys.stderr)
    print(file=sys.stderr)

    # Create minimal test configuration
    execution_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    work_dir = Path("workflow-outputs") / f"trace_{execution_id}"
    work_dir.mkdir(parents=True, exist_ok=True)

    config = WorkflowConfig(
        execution_id=execution_id,
        work_dir=work_dir,
        feature_source="trace test",
        feature_description="Test feature for tracing",
        telemetry_enabled=False,
        approval_mode=ApprovalMode.AUTO,
        approval_timeout=0,
        mock_mode=True,
        mock_delay=0.0,
        skip_execute_approval=True
    )

    # Patch methods with timing
    print("Installing trace hooks...", file=sys.stderr)

    original_execute_step = WorkflowOrchestrator._execute_step
    async def traced_execute_step(self, state, step_name):
        start = time.time()
        print(f"\n[TRACE] ========== STEP: {step_name.value} ==========", file=sys.stderr)

        result = await original_execute_step(self, state, step_name)

        duration = time.time() - start
        print(f"[TRACE] ========== STEP {step_name.value} COMPLETE: {duration:.3f}s ==========\n", file=sys.stderr)
        return result

    WorkflowOrchestrator._execute_step = traced_execute_step

    # Patch git operations
    original_get_git_changes = WorkflowOrchestrator._get_git_changes
    async def traced_get_git_changes(self):
        start = time.time()
        result = await original_get_git_changes(self)
        duration = time.time() - start
        print(f"[TRACE]   _get_git_changes: {duration:.3f}s", file=sys.stderr)
        return result

    WorkflowOrchestrator._get_git_changes = traced_get_git_changes

    # Patch file preview
    original_get_file_preview = WorkflowOrchestrator._get_file_preview
    async def traced_get_file_preview(self, file_path, lines=20):
        start = time.time()
        result = await original_get_file_preview(self, file_path, lines)
        duration = time.time() - start
        print(f"[TRACE]   _get_file_preview: {duration:.3f}s", file=sys.stderr)
        return result

    WorkflowOrchestrator._get_file_preview = traced_get_file_preview

    # Patch save state
    original_save_state = WorkflowOrchestrator._save_state
    async def traced_save_state(self, state):
        start = time.time()
        await original_save_state(self, state)
        duration = time.time() - start
        print(f"[TRACE]   _save_state: {duration:.3f}s", file=sys.stderr)

    WorkflowOrchestrator._save_state = traced_save_state

    # Patch approval handling
    original_handle_approval = WorkflowOrchestrator._handle_approval
    async def traced_handle_approval(self, state, step_name, result):
        start = time.time()
        new_state = await original_handle_approval(self, state, step_name, result)
        duration = time.time() - start
        print(f"[TRACE]   _handle_approval: {duration:.3f}s", file=sys.stderr)
        return new_state

    WorkflowOrchestrator._handle_approval = traced_handle_approval

    print("Trace hooks installed.", file=sys.stderr)
    print("=" * 80, file=sys.stderr)
    print(file=sys.stderr)

    # Run workflow
    orchestrator = WorkflowOrchestrator(config)

    overall_start = time.time()
    success = await orchestrator.run()
    overall_duration = time.time() - overall_start

    print(file=sys.stderr)
    print("=" * 80, file=sys.stderr)
    print(f"WORKFLOW COMPLETE: {overall_duration:.3f}s", file=sys.stderr)
    print(f"Success: {success}", file=sys.stderr)
    print("=" * 80, file=sys.stderr)

    return success

if __name__ == "__main__":
    sys.exit(0 if asyncio.run(main()) else 1)
