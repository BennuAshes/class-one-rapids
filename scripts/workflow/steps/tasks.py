"""
Task List generation step executor.

Executes the /flow:tasks command to generate a task list from the TDD.
"""

from datetime import datetime
from pathlib import Path
from typing import Optional, Any

from ..types import WorkflowState, StepResult, StepName
from ..services.claude_cli import run_claude_tasks
from ..utils.file_ops import async_find_workflow_file, async_read_file


async def execute(
    state: WorkflowState,
    input_data: Optional[Any] = None
) -> StepResult:
    """
    Execute Task List generation step.

    Args:
        state: Current workflow state
        input_data: Optional override for TDD file path

    Returns:
        StepResult with success/failure and output file path
    """
    config = state.config

    # Get TDD file path (from input_data or from previous step)
    tdd_file: Optional[Path] = None
    if input_data:
        tdd_file = Path(input_data) if isinstance(input_data, str) else input_data
    else:
        # Get from previous step
        design_step = state.get_step(StepName.GENERATE_DESIGN)
        if design_step and design_step.output_file:
            tdd_file = design_step.output_file
        else:
            # Try to find in work directory
            tdd_file = await async_find_workflow_file(config.work_dir, "tdd_")

    if not tdd_file or not tdd_file.exists():
        return StepResult(
            success=False,
            error_message="TDD file not found. Cannot generate tasks without TDD."
        )

    # Use TDD file directly (extraction already happened in claude_cli layer)
    tdd_input_path = str(tdd_file)

    # Determine output path
    output_file = config.work_dir / f"tasks_{datetime.now():%Y%m%d}.md"

    try:
        # Execute claude CLI (async subprocess)
        result = await run_claude_tasks(
            tdd_file_path=tdd_input_path,
            output_file=output_file,
            execution_id=config.execution_id,
            mock_mode=config.mock_mode
        )

        if result.success:
            return StepResult(
                success=True,
                output_file=output_file,
                metadata={
                    **result.metadata,
                    "tdd_input": tdd_input_path,
                    "file_size": output_file.stat().st_size if output_file.exists() else 0
                },
                duration_seconds=result.duration
            )
        else:
            return StepResult(
                success=False,
                error_message=f"Tasks generation failed: {result.stderr}",
                metadata=result.metadata,
                duration_seconds=result.duration
            )

    except Exception as e:
        return StepResult(
            success=False,
            error_message=f"Tasks generation exception: {str(e)}",
            metadata={"exception_type": type(e).__name__}
        )
