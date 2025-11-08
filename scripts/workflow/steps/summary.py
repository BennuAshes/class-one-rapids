"""
Summary generation step executor.

Generates a workflow summary after all steps complete.
"""

from datetime import datetime
from pathlib import Path
from typing import Optional, Any

from ..types import WorkflowState, StepResult, StepName
from ..utils.file_ops import async_write_file


async def execute(
    state: WorkflowState,
    input_data: Optional[Any] = None
) -> StepResult:
    """
    Execute summary generation step.

    Generates a markdown summary of the workflow execution with:
    - All steps completed
    - File locations
    - Duration
    - Status

    Args:
        state: Current workflow state (contains all step info)
        input_data: Unused

    Returns:
        StepResult with success/failure and summary file path
    """
    config = state.config
    output_file = config.work_dir / "workflow-summary.md"

    try:
        # Build summary content
        summary_lines = [
            f"# Workflow Summary",
            f"",
            f"**Execution ID**: `{config.execution_id}`",
            f"**Feature Source**: {config.feature_source}",
            f"**Started**: {state.started_at.strftime('%Y-%m-%d %H:%M:%S')}",
        ]

        if state.completed_at:
            duration = (state.completed_at - state.started_at).total_seconds()
            summary_lines.append(f"**Completed**: {state.completed_at.strftime('%Y-%m-%d %H:%M:%S')}")
            summary_lines.append(f"**Total Duration**: {duration:.1f} seconds")

        summary_lines.extend([
            f"**Status**: {state.status}",
            "",
            "## Steps",
            ""
        ])

        # Add each step
        for step in state.steps:
            status_emoji = "✅" if step.status.value == "completed" else "❌" if step.status.value == "failed" else "⏳"
            summary_lines.append(f"### {status_emoji} {step.name.value}")
            summary_lines.append(f"- **Status**: {step.status.value}")

            if step.started_at:
                summary_lines.append(f"- **Started**: {step.started_at.strftime('%Y-%m-%d %H:%M:%S')}")

            if step.updated_at:
                summary_lines.append(f"- **Updated**: {step.updated_at.strftime('%Y-%m-%d %H:%M:%S')}")

            if step.output_file:
                summary_lines.append(f"- **Output**: `{step.output_file}`")

            if step.error_message:
                summary_lines.append(f"- **Error**: {step.error_message}")

            summary_lines.append("")

        # Add files generated
        summary_lines.extend([
            "## Files Generated",
            ""
        ])

        for step in state.steps:
            if step.output_file and step.output_file.exists():
                size_kb = step.output_file.stat().st_size / 1024
                summary_lines.append(f"- `{step.output_file.name}` ({size_kb:.1f} KB)")

        # Write summary
        summary_content = "\n".join(summary_lines)
        await async_write_file(output_file, summary_content)

        return StepResult(
            success=True,
            output_file=output_file,
            metadata={"lines": len(summary_lines)}
        )

    except Exception as e:
        return StepResult(
            success=False,
            error_message=f"Summary generation exception: {str(e)}",
            metadata={"exception_type": type(e).__name__}
        )
