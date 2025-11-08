"""
Workflow orchestrator.

Main coordination logic for executing the workflow steps in sequence,
handling approvals, telemetry, and state management.
"""

import asyncio
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

from .types import (
    WorkflowConfig,
    WorkflowState,
    StepRecord,
    StepName,
    StepStatus,
    StepResult,
    ApprovalRequest,
    ApprovalStatus,
    FileChange,
    dataclass_replace
)
from .services.telemetry import TelemetryTracker
from .services.approval import request_approval
from .services.artifact_extraction import extract_artifacts
from .utils.file_ops import async_write_json, async_read_json, async_file_exists

# Import step executors
from .steps import prd, design, tasks, execute, summary


# Map step names to executor modules
STEP_EXECUTORS = {
    StepName.GENERATE_PRD: prd,
    StepName.GENERATE_DESIGN: design,
    StepName.GENERATE_TASKS: tasks,
    StepName.EXECUTE_TASKS: execute,
    StepName.GENERATE_SUMMARY: summary
}


def create_initial_state(config: WorkflowConfig) -> WorkflowState:
    """
    Create initial workflow state.

    Pure function that creates the starting state with all steps pending.

    Args:
        config: Workflow configuration

    Returns:
        Initial WorkflowState
    """
    steps = tuple(
        StepRecord(name=step_name, status=StepStatus.PENDING)
        for step_name in StepName
    )

    return WorkflowState(
        config=config,
        steps=steps,
        status="initializing",
        started_at=datetime.now()
    )


async def load_workflow_state(work_dir: Path) -> Optional[WorkflowState]:
    """
    Load workflow state from disk.

    Args:
        work_dir: Workflow working directory

    Returns:
        WorkflowState if found and valid, None otherwise
    """
    status_file = work_dir / "workflow-status.json"

    if not await async_file_exists(status_file):
        return None

    try:
        data = await async_read_json(status_file)

        # Parse config
        config = WorkflowConfig(
            execution_id=data["execution_id"],
            work_dir=work_dir,
            feature_source=data.get("feature_source", ""),
            feature_description=data.get("feature_description", ""),
            telemetry_enabled=data.get("telemetry_enabled", True),
            auto_extract=data.get("auto_extract", True),
            approval_mode=data.get("approval_mode", "file")
        )

        # Parse steps
        steps = tuple(
            StepRecord(
                name=StepName(step_data["name"]),
                status=StepStatus(step_data.get("status", "pending")),
                started_at=_parse_datetime(step_data.get("started_at")),
                updated_at=_parse_datetime(step_data.get("updated_at")),
                output_file=Path(step_data["output_file"]) if "output_file" in step_data else None,
                error_message=step_data.get("error_message")
            )
            for step_data in data.get("steps", [])
        )

        return WorkflowState(
            config=config,
            steps=steps,
            status=data.get("status", "resumed"),
            started_at=_parse_datetime(data["started_at"]),
            completed_at=_parse_datetime(data.get("completed_at"))
        )

    except Exception as e:
        print(f"Failed to load workflow state: {e}")
        return None


async def save_workflow_state(state: WorkflowState) -> None:
    """
    Save workflow state to disk.

    Args:
        state: Current workflow state
    """
    status_file = state.config.work_dir / "workflow-status.json"

    data = {
        "execution_id": state.config.execution_id,
        "feature_source": state.config.feature_source,
        "feature_description": state.config.feature_description,
        "approval_mode": state.config.approval_mode.value,
        "telemetry_enabled": state.config.telemetry_enabled,
        "auto_extract": state.config.auto_extract,
        "status": state.status,
        "started_at": state.started_at.isoformat(),
        "completed_at": state.completed_at.isoformat() if state.completed_at else None,
        "working_directory": str(state.config.work_dir),
        "steps": [
            {
                "name": step.name.value,
                "status": step.status.value,
                "started_at": step.started_at.isoformat() if step.started_at else None,
                "updated_at": step.updated_at.isoformat() if step.updated_at else None,
                "output_file": str(step.output_file) if step.output_file else None,
                "error_message": step.error_message
            }
            for step in state.steps
        ]
    }

    await async_write_json(status_file, data)


async def run_workflow(
    config: WorkflowConfig,
    resume_from: Optional[WorkflowState] = None
) -> WorkflowState:
    """
    Main workflow orchestration.

    Executes all workflow steps in sequence with approval gates and
    telemetry tracking.

    Args:
        config: Workflow configuration
        resume_from: Optional state to resume from

    Returns:
        Final workflow state after all steps complete
    """
    # Initialize or resume state
    state = resume_from or create_initial_state(config)
    state = dataclass_replace(state, status="running")

    # Initialize telemetry
    telemetry = TelemetryTracker(
        execution_id=config.execution_id,
        enabled=config.telemetry_enabled
    )

    # Save initial state
    await save_workflow_state(state)

    # Execute steps in sequence
    for step_name in StepName:
        # Skip if already completed (resume case)
        if state.is_step_completed(step_name):
            print(f"[{step_name.value}] ✓ Skipping (already completed)")
            continue

        # Execute step
        state = await _execute_step(state, step_name, telemetry)

        # Save state after each step
        await save_workflow_state(state)

        # Check for failure
        step = state.get_step(step_name)
        if step and step.status == StepStatus.FAILED:
            state = dataclass_replace(state, status="failed")
            await save_workflow_state(state)
            telemetry.flush()
            return state

    # Mark workflow complete
    state = dataclass_replace(
        state,
        status="completed",
        completed_at=datetime.now()
    )
    await save_workflow_state(state)
    telemetry.flush()

    return state


async def _execute_step(
    state: WorkflowState,
    step_name: StepName,
    telemetry: TelemetryTracker
) -> WorkflowState:
    """
    Execute a single workflow step.

    Handles step execution, approval flow, telemetry, and artifact extraction.

    Args:
        state: Current workflow state
        step_name: Step to execute
        telemetry: Telemetry tracker

    Returns:
        Updated workflow state
    """
    config = state.config

    print(f"\n[{step_name.value}] Starting...")

    # Update state: mark step as in progress
    state = state.with_step_update(
        step_name,
        status=StepStatus.IN_PROGRESS,
        started_at=datetime.now()
    )

    # Track start
    telemetry.track_step_start(step_name.value)

    # Get step executor
    executor = STEP_EXECUTORS.get(step_name)
    if not executor:
        error_msg = f"No executor found for step: {step_name}"
        print(f"[{step_name.value}] ✗ {error_msg}")
        return state.with_step_update(
            step_name,
            status=StepStatus.FAILED,
            error_message=error_msg,
            updated_at=datetime.now()
        )

    # Execute step
    try:
        result = await executor.execute(state)
    except Exception as e:
        error_msg = f"Step execution exception: {str(e)}"
        print(f"[{step_name.value}] ✗ {error_msg}")

        telemetry.track_step_complete(
            step_name.value,
            duration_seconds=0,
            success=False,
            metadata={"error": str(e)}
        )

        return state.with_step_update(
            step_name,
            status=StepStatus.FAILED,
            error_message=error_msg,
            updated_at=datetime.now()
        )

    # Update state based on result
    if result.is_success:
        state = state.with_step_update(
            step_name,
            status=StepStatus.COMPLETED,
            output_file=result.output_file,
            updated_at=datetime.now()
        )

        print(f"[{step_name.value}] ✓ Completed ({result.duration_seconds:.1f}s)")
        if result.output_file:
            print(f"  Output: {result.output_file}")

        # Track completion
        telemetry.track_step_complete(
            step_name.value,
            duration_seconds=result.duration_seconds,
            success=True,
            metadata=result.metadata
        )

        # Extract artifacts if needed
        if config.auto_extract and result.output_file:
            await _extract_step_artifacts(state, step_name, result.output_file)

        # Request approval
        state = await _request_step_approval(state, step_name, result, telemetry)

    else:
        state = state.with_step_update(
            step_name,
            status=StepStatus.FAILED,
            error_message=result.error_message,
            updated_at=datetime.now()
        )

        print(f"[{step_name.value}] ✗ Failed: {result.error_message}")

        telemetry.track_step_complete(
            step_name.value,
            duration_seconds=result.duration_seconds,
            success=False,
            metadata=result.metadata
        )

    return state


async def _extract_step_artifacts(
    state: WorkflowState,
    step_name: StepName,
    output_file: Path
) -> None:
    """
    Extract artifacts from step output if needed.

    Args:
        state: Current workflow state
        step_name: Step that was executed
        output_file: Step output file
    """
    config = state.config

    if not config.extract_to_specs:
        return

    specs_dir = Path("docs/specs")
    success, message = await extract_artifacts(config.work_dir, specs_dir)

    if not success and "not JSON format" not in message:
        print(f"  Warning: Artifact extraction failed: {message}")


async def _request_step_approval(
    state: WorkflowState,
    step_name: StepName,
    result: StepResult,
    telemetry: TelemetryTracker
) -> WorkflowState:
    """
    Request approval for completed step.

    Args:
        state: Current workflow state
        step_name: Step to approve
        result: Step execution result
        telemetry: Telemetry tracker

    Returns:
        Updated workflow state
    """
    config = state.config

    if not result.output_file or not result.output_file.exists():
        return state

    # Create approval request
    approval_request = ApprovalRequest(
        execution_id=config.execution_id,
        checkpoint=step_name.value,
        file=result.output_file,
        timestamp=datetime.now(),
        timeout_seconds=config.approval_timeout,
        preview=_get_file_preview(result.output_file)
    )

    # Request approval
    print(f"[{step_name.value}] Requesting approval...")
    approval_response = await request_approval(
        approval_request,
        config.approval_mode,
        config.approval_timeout
    )

    # Track approval
    telemetry.track_approval(
        checkpoint=step_name.value,
        status=approval_response.status.value,
        duration_seconds=approval_response.duration_seconds,
        reason=approval_response.reason
    )

    # Handle response
    if approval_response.status == ApprovalStatus.APPROVED:
        print(f"[{step_name.value}] ✓ Approved")
    elif approval_response.status == ApprovalStatus.REJECTED:
        print(f"[{step_name.value}] ✗ Rejected: {approval_response.reason}")
        # TODO: Handle feedback and retry logic
    elif approval_response.status == ApprovalStatus.TIMEOUT:
        print(f"[{step_name.value}] ⏱  Approval timeout")

    return state


def _get_file_preview(file_path: Path, lines: int = 20) -> str:
    """
    Get preview of file content.

    Args:
        file_path: File to preview
        lines: Number of lines to include

    Returns:
        Preview string
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            preview_lines = [f.readline() for _ in range(lines)]
            return ''.join(preview_lines)
    except:
        return ""


def _parse_datetime(dt_str: Optional[str]) -> Optional[datetime]:
    """Parse datetime string."""
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str)
    except:
        return None
