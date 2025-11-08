"""
Telemetry integration service.

Wraps the existing workflow_telemetry.py module to provide telemetry
tracking for the Python workflow.
"""

import sys
from pathlib import Path
from typing import Optional

# Add scripts directory to path to import workflow_telemetry
scripts_dir = Path(__file__).parent.parent.parent
if str(scripts_dir) not in sys.path:
    sys.path.insert(0, str(scripts_dir))

try:
    from workflow_telemetry import WorkflowObserver, track_approval_checkpoint
    TELEMETRY_AVAILABLE = True
except ImportError:
    TELEMETRY_AVAILABLE = False
    WorkflowObserver = None  # type: ignore
    track_approval_checkpoint = None  # type: ignore


class TelemetryTracker:
    """
    Telemetry tracker for workflow execution.

    Wraps the existing Langfuse telemetry with a clean interface.
    """

    def __init__(self, execution_id: str, enabled: bool = True):
        """
        Initialize telemetry tracker.

        Args:
            execution_id: Workflow execution ID
            enabled: Whether telemetry is enabled
        """
        self.execution_id = execution_id
        self.enabled = enabled and TELEMETRY_AVAILABLE
        self.observer = None

        if self.enabled and WorkflowObserver:
            try:
                self.observer = WorkflowObserver(execution_id)
            except Exception as e:
                print(f"Warning: Failed to initialize telemetry: {e}")
                self.enabled = False

    def track_step_start(self, step_name: str) -> None:
        """
        Track workflow step start.

        Args:
            step_name: Name of the step starting
        """
        if not self.enabled or not self.observer:
            return

        try:
            self.observer.start_step(step_name)
        except Exception as e:
            print(f"Warning: Failed to track step start: {e}")

    def track_step_complete(
        self,
        step_name: str,
        duration_seconds: float,
        success: bool,
        metadata: Optional[dict] = None
    ) -> None:
        """
        Track workflow step completion.

        Args:
            step_name: Name of the step that completed
            duration_seconds: How long the step took
            success: Whether the step succeeded
            metadata: Optional metadata to track
        """
        if not self.enabled or not self.observer:
            return

        try:
            self.observer.complete_step(
                step_name,
                success=success,
                duration=duration_seconds,
                metadata=metadata or {}
            )
        except Exception as e:
            print(f"Warning: Failed to track step completion: {e}")

    def track_approval(
        self,
        checkpoint: str,
        status: str,
        duration_seconds: float,
        reviewer: Optional[str] = None,
        reason: Optional[str] = None
    ) -> None:
        """
        Track approval checkpoint.

        Args:
            checkpoint: Checkpoint name
            status: Approval status (approved/rejected/timeout)
            duration_seconds: How long approval took
            reviewer: Optional reviewer name
            reason: Optional reason for decision
        """
        if not self.enabled or not track_approval_checkpoint:
            return

        try:
            track_approval_checkpoint(
                execution_id=self.execution_id,
                checkpoint=checkpoint,
                status=status,
                duration_seconds=duration_seconds,
                reviewer=reviewer,
                reason=reason,
                add_score=True
            )
        except Exception as e:
            print(f"Warning: Failed to track approval: {e}")

    def flush(self) -> None:
        """Flush any pending telemetry data."""
        if not self.enabled or not self.observer:
            return

        try:
            if hasattr(self.observer, 'flush'):
                self.observer.flush()
        except Exception as e:
            print(f"Warning: Failed to flush telemetry: {e}")
