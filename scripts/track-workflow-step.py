#!/usr/bin/env python3
"""
Simple CLI wrapper for workflow telemetry tracking

Usage:
  python3 track-workflow-step.py start <execution_id> <step_name>
  python3 track-workflow-step.py complete <execution_id> <step_name> [duration_seconds]
  python3 track-workflow-step.py error <execution_id> <step_name> <error_message> [duration_seconds]
  python3 track-workflow-step.py approval <execution_id> <checkpoint> <status> <duration_seconds> [reason]
"""

import sys
import os
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from workflow_telemetry import (
        WorkflowObserver,
        track_approval_checkpoint,
        LANGFUSE_AVAILABLE
    )
except ImportError as e:
    print(f"Warning: Could not import workflow_telemetry: {e}", file=sys.stderr)
    sys.exit(0)  # Silent exit if not available


def cmd_start(execution_id: str, step_name: str):
    """Initialize workflow trace"""
    if not LANGFUSE_AVAILABLE:
        return

    with WorkflowObserver(execution_id) as observer:
        trace = observer.create_trace(
            name="Feature to Code Workflow",
            metadata={
                "step": step_name,
                "status": "started"
            }
        )
        if trace:
            print(f"Started tracking: {step_name}", file=sys.stderr)


def cmd_complete(execution_id: str, step_name: str, duration_seconds: str = "0"):
    """Mark step as complete"""
    if not LANGFUSE_AVAILABLE:
        return

    with WorkflowObserver(execution_id) as observer:
        trace = observer.create_trace(
            name="Feature to Code Workflow",
            metadata={
                "step": step_name,
                "status": "completed",
                "duration_seconds": float(duration_seconds)
            }
        )
        if trace:
            span = trace.span(
                name=step_name,
                metadata={
                    "status": "completed",
                    "duration_seconds": float(duration_seconds)
                }
            )
            span.end()
            print(f"Completed tracking: {step_name}", file=sys.stderr)


def cmd_error(execution_id: str, step_name: str, error_message: str, duration_seconds: str = "0"):
    """Mark step as failed"""
    if not LANGFUSE_AVAILABLE:
        return

    with WorkflowObserver(execution_id) as observer:
        trace = observer.create_trace(
            name="Feature to Code Workflow",
            metadata={
                "step": step_name,
                "status": "error",
                "error": error_message,
                "duration_seconds": float(duration_seconds)
            }
        )
        if trace:
            span = trace.span(
                name=step_name,
                level="ERROR",
                status_message=error_message,
                metadata={
                    "status": "error",
                    "duration_seconds": float(duration_seconds)
                }
            )
            span.end()
            print(f"Error tracking: {step_name}", file=sys.stderr)


def cmd_approval(execution_id: str, checkpoint: str, status: str, duration_seconds: str, reason: str = ""):
    """Track approval checkpoint"""
    if not LANGFUSE_AVAILABLE:
        return

    track_approval_checkpoint(
        execution_id=execution_id,
        checkpoint=checkpoint,
        status=status,
        duration_seconds=float(duration_seconds),
        reason=reason or None
    )
    print(f"Tracked approval: {checkpoint} = {status}", file=sys.stderr)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1]
    args = sys.argv[2:]

    if command == "start" and len(args) >= 2:
        cmd_start(args[0], args[1])
    elif command == "complete" and len(args) >= 2:
        cmd_complete(args[0], args[1], args[2] if len(args) > 2 else "0")
    elif command == "error" and len(args) >= 3:
        cmd_error(args[0], args[1], args[2], args[3] if len(args) > 3 else "0")
    elif command == "approval" and len(args) >= 4:
        cmd_approval(args[0], args[1], args[2], args[3], args[4] if len(args) > 4 else "")
    else:
        print(f"Unknown command or invalid arguments: {command}", file=sys.stderr)
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
