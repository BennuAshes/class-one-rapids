"""
Task execution step executor.

Executes the /flow:execute-task command to actually implement the tasks.
"""

from datetime import datetime
from pathlib import Path
from typing import Optional, Any

from ..types import WorkflowState, StepResult, StepName
from ..services.claude_cli import run_claude_execute
from ..utils.file_ops import async_find_workflow_file, async_read_file


async def execute(
    state: WorkflowState,
    input_data: Optional[Any] = None
) -> StepResult:
    """
    Execute tasks step.

    This is the critical step that actually writes code to files.
    Always requires approval even in auto mode.

    Args:
        state: Current workflow state
        input_data: Optional override for tasks file path

    Returns:
        StepResult with success/failure
    """
    config = state.config

    # Get tasks file path (from input_data or from previous step)
    tasks_file: Optional[Path] = None
    if input_data:
        tasks_file = Path(input_data) if isinstance(input_data, str) else input_data
    else:
        # Get from previous step
        tasks_step = state.get_step(StepName.GENERATE_TASKS)
        if tasks_step and tasks_step.output_file:
            tasks_file = tasks_step.output_file
        else:
            # Try to find in work directory
            tasks_file = await async_find_workflow_file(config.work_dir, "tasks_")

    if not tasks_file or not tasks_file.exists():
        return StepResult(
            success=False,
            error_message="Tasks file not found. Cannot execute without tasks."
        )

    # Prefer extracted tasks file if available (cleaner, no JSON logs)
    tasks_input_path = str(tasks_file)
    if config.auto_extract and config.extract_to_specs:
        # Check for extracted version in docs/specs
        extracted_dir = Path("docs/specs") / config.work_dir.name
        extracted_tasks = extracted_dir / f"tasks_{datetime.now():%Y%m%d}.md"

        if extracted_tasks.exists():
            # Verify it's actually clean (contains markdown headers)
            try:
                content = await async_read_file(extracted_tasks)
                if content.strip().startswith('#'):
                    tasks_input_path = str(extracted_tasks)
            except:
                pass  # Use original if verification fails

    try:
        # Execute claude CLI (async subprocess)
        result = await run_claude_execute(
            tasks_file_path=tasks_input_path,
            execution_id=config.execution_id
        )

        if result.success:
            return StepResult(
                success=True,
                metadata={
                    **result.metadata,
                    "tasks_input": tasks_input_path
                },
                duration_seconds=result.duration
            )
        else:
            return StepResult(
                success=False,
                error_message=f"Task execution failed: {result.stderr}",
                metadata=result.metadata,
                duration_seconds=result.duration
            )

    except Exception as e:
        return StepResult(
            success=False,
            error_message=f"Task execution exception: {str(e)}",
            metadata={"exception_type": type(e).__name__}
        )
