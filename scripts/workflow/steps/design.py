"""
Technical Design generation step executor.

Executes the /flow:design command to generate a Technical Design Document
from the PRD.
"""

from datetime import datetime
from pathlib import Path
from typing import Optional, Any

from ..types import WorkflowState, StepResult, StepName
from ..services.claude_cli import run_claude_design
from ..utils.file_ops import async_find_workflow_file, async_read_file


async def execute(
    state: WorkflowState,
    input_data: Optional[Any] = None
) -> StepResult:
    """
    Execute Technical Design generation step.

    Args:
        state: Current workflow state
        input_data: Optional override for PRD file path

    Returns:
        StepResult with success/failure and output file path
    """
    config = state.config

    # Get PRD file path (from input_data or from previous step)
    prd_file: Optional[Path] = None
    if input_data:
        prd_file = Path(input_data) if isinstance(input_data, str) else input_data
    else:
        # Get from previous step
        prd_step = state.get_step(StepName.GENERATE_PRD)
        if prd_step and prd_step.output_file:
            prd_file = prd_step.output_file
        else:
            # Try to find in work directory
            prd_file = await async_find_workflow_file(config.work_dir, "prd_")

    if not prd_file or not prd_file.exists():
        return StepResult(
            success=False,
            error_message="PRD file not found. Cannot generate design without PRD."
        )

    # Check if PRD needs extraction (is it JSON format?)
    prd_input_path = str(prd_file)
    try:
        content = await async_read_file(prd_file)
        if content.startswith('{'):
            # It's JSON format, check for extracted version
            extracted_prd = prd_file.parent / f"prd_extracted_{datetime.now():%Y%m%d}.md"
            if extracted_prd.exists():
                prd_input_path = str(extracted_prd)
    except:
        pass  # Use original file if check fails

    # Determine output path
    output_file = config.work_dir / f"tdd_{datetime.now():%Y%m%d}.md"

    try:
        # Execute claude CLI (async subprocess)
        result = await run_claude_design(
            prd_file_path=prd_input_path,
            output_file=output_file,
            execution_id=config.execution_id
        )

        if result.success:
            return StepResult(
                success=True,
                output_file=output_file,
                metadata={
                    **result.metadata,
                    "prd_input": prd_input_path,
                    "file_size": output_file.stat().st_size if output_file.exists() else 0
                },
                duration_seconds=result.duration
            )
        else:
            return StepResult(
                success=False,
                error_message=f"Design generation failed: {result.stderr}",
                metadata=result.metadata,
                duration_seconds=result.duration
            )

    except Exception as e:
        return StepResult(
            success=False,
            error_message=f"Design generation exception: {str(e)}",
            metadata={"exception_type": type(e).__name__}
        )
