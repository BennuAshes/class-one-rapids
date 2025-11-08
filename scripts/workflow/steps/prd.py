"""
PRD generation step executor.

Executes the /flow:prd command to generate a Product Requirements Document
from the feature description.
"""

from datetime import datetime
from pathlib import Path
from typing import Optional, Any

from ..types import WorkflowState, StepResult
from ..services.claude_cli import run_claude_prd


async def execute(
    state: WorkflowState,
    input_data: Optional[Any] = None
) -> StepResult:
    """
    Execute PRD generation step.

    Pure function wrapper around async subprocess call. Takes immutable
    state, returns immutable result.

    Args:
        state: Current workflow state
        input_data: Optional override for feature description

    Returns:
        StepResult with success/failure and output file path
    """
    config = state.config
    feature_desc = input_data if input_data is not None else config.feature_description

    # Determine output path
    output_file = config.work_dir / f"prd_{datetime.now():%Y%m%d}.md"

    try:
        # Execute claude CLI (async subprocess)
        result = await run_claude_prd(
            feature_description=feature_desc,
            output_file=output_file,
            execution_id=config.execution_id
        )

        if result.success:
            return StepResult(
                success=True,
                output_file=output_file,
                metadata={
                    **result.metadata,
                    "file_size": output_file.stat().st_size if output_file.exists() else 0
                },
                duration_seconds=result.duration
            )
        else:
            return StepResult(
                success=False,
                error_message=f"PRD generation failed: {result.stderr}",
                metadata=result.metadata,
                duration_seconds=result.duration
            )

    except Exception as e:
        return StepResult(
            success=False,
            error_message=f"PRD generation exception: {str(e)}",
            metadata={"exception_type": type(e).__name__}
        )
