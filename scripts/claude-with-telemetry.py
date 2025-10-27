#!/usr/bin/env python
"""
Claude CLI wrapper with Langfuse telemetry support
This script wraps claude CLI calls with proper telemetry tracking

Note: Uses 'python' (not 'python3') to respect virtual environments
"""

import os
import sys
import subprocess
import json
from datetime import datetime

# Try to import Langfuse, but fail gracefully if not available
try:
    from langfuse import observe, get_client
    LANGFUSE_AVAILABLE = True
    langfuse_client = get_client()
except ImportError:
    LANGFUSE_AVAILABLE = False
    print("Warning: Langfuse SDK not installed. Running without telemetry.", file=sys.stderr)
    print("Install with: pip install langfuse", file=sys.stderr)

    # Create dummy decorators that do nothing
    def observe():
        def decorator(func):
            return func
        return decorator

    class DummyClient:
        def update_current_trace(self, **kwargs):
            pass
        def update_current_span(self, **kwargs):
            pass
        def flush(self):
            pass

    langfuse_client = DummyClient()

@observe()
def run_claude_command(prompt, output_format="stream-json", execution_id=None, step_name=None):
    """
    Run claude CLI command with telemetry tracking
    Uses stdin to avoid command-line length limits with large prompts
    """
    # Build command - use -p flag without argument to read from stdin
    cmd = ["claude", "-p", "--verbose"]
    if output_format:
        cmd.extend(["--output-format", output_format])

    # Add metadata to trace
    if execution_id:
        langfuse_client.update_current_trace(
            session_id=execution_id,
            user_id="feature-to-code-script"
        )

    if step_name:
        langfuse_client.update_current_span(
            name=step_name,
            metadata={
                "command": " ".join(cmd) + " (via stdin)",
                "execution_id": execution_id,
                "step": step_name,
                "prompt_length": len(prompt)
            }
        )

    # Run the command with prompt via stdin
    try:
        result = subprocess.run(
            cmd,
            input=prompt,
            capture_output=True,
            text=True,
            check=True
        )

        # Update span with output
        langfuse_client.update_current_span(
            output=result.stdout[:1000],  # First 1000 chars for preview
            metadata={
                "exit_code": result.returncode,
                "output_length": len(result.stdout)
            }
        )

        return result.stdout

    except subprocess.CalledProcessError as e:
        # Track errors
        langfuse_client.update_current_span(
            level="ERROR",
            status_message=f"Command failed: {e}",
            metadata={
                "exit_code": e.returncode,
                "stderr": e.stderr[:1000] if e.stderr else None
            }
        )
        raise

@observe()
def feature_to_code_workflow(feature_desc, execution_id):
    """
    Main workflow with full telemetry
    """
    langfuse_client.update_current_trace(
        name="feature-to-code-workflow",
        session_id=execution_id,
        metadata={
            "execution_id": execution_id,
            "started_at": datetime.now().isoformat()
        }
    )

    # The script would handle the different workflow steps
    # This is a simplified example
    return {
        "status": "completed",
        "execution_id": execution_id
    }

if __name__ == "__main__":
    # Parse arguments
    if len(sys.argv) < 2:
        print("Usage: claude-with-telemetry.py <prompt> [execution_id] [step_name]")
        sys.exit(1)

    prompt = sys.argv[1]
    execution_id = sys.argv[2] if len(sys.argv) > 2 else datetime.now().strftime("%Y%m%d_%H%M%S")
    step_name = sys.argv[3] if len(sys.argv) > 3 else "claude-command"

    try:
        # Run command with telemetry
        output = run_claude_command(prompt, execution_id=execution_id, step_name=step_name)
        print(output)

        # Ensure traces are sent (if Langfuse is available)
        if LANGFUSE_AVAILABLE and langfuse_client:
            langfuse_client.flush()

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

