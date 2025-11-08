"""
Claude CLI subprocess wrapper.

Provides async interface for executing claude CLI commands with proper
error handling, telemetry, and stream-json support.
"""

import asyncio
from pathlib import Path
from typing import Optional
from datetime import datetime

from ..types import ClaudeCommandResult
from ..utils.file_ops import async_write_file


async def run_claude_command(
    command: str,
    stdin_input: Optional[str] = None,
    output_file: Optional[Path] = None,
    execution_id: Optional[str] = None,
    telemetry_enabled: bool = False,
    use_stream_json: bool = True,
    timeout_seconds: Optional[int] = None
) -> ClaudeCommandResult:
    """
    Run claude CLI command as subprocess.

    This is the core function for executing all workflow steps that use
    the claude CLI. It handles subprocess execution, output capture,
    and optional stream-json formatting.

    Args:
        command: Claude command to run (e.g., "/flow:prd")
        stdin_input: Input to pipe to command via stdin
        output_file: If specified, write stdout to this file
        execution_id: Workflow execution ID for tracking
        telemetry_enabled: Whether telemetry is enabled
        use_stream_json: Use --output-format stream-json --verbose
        timeout_seconds: Command timeout in seconds (None = no timeout)

    Returns:
        ClaudeCommandResult with execution details

    Raises:
        asyncio.TimeoutError: If command exceeds timeout
        Exception: If command execution fails unexpectedly
    """
    start_time = asyncio.get_event_loop().time()

    # Build command parts
    cmd_parts = ["claude", command]

    # Add stream-json flags if requested
    if use_stream_json:
        cmd_parts.extend(["--output-format", "stream-json", "--verbose"])

    try:
        # Create subprocess
        proc = await asyncio.create_subprocess_exec(
            *cmd_parts,
            stdin=asyncio.subprocess.PIPE if stdin_input else None,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=None  # Use current working directory
        )

        # Prepare stdin input
        stdin_bytes = stdin_input.encode('utf-8') if stdin_input else None

        # Wait for completion with optional timeout
        if timeout_seconds:
            stdout_bytes, stderr_bytes = await asyncio.wait_for(
                proc.communicate(input=stdin_bytes),
                timeout=timeout_seconds
            )
        else:
            stdout_bytes, stderr_bytes = await proc.communicate(input=stdin_bytes)

        # Decode output
        stdout = stdout_bytes.decode('utf-8', errors='replace')
        stderr = stderr_bytes.decode('utf-8', errors='replace')

        # Write output to file if specified
        if output_file and proc.returncode == 0:
            await async_write_file(output_file, stdout)

        # Calculate duration
        duration = asyncio.get_event_loop().time() - start_time

        # Build result
        return ClaudeCommandResult(
            success=proc.returncode == 0,
            stdout=stdout,
            stderr=stderr,
            exit_code=proc.returncode or 0,
            duration=duration,
            metadata={
                "command": command,
                "execution_id": execution_id,
                "telemetry_enabled": telemetry_enabled,
                "use_stream_json": use_stream_json,
                "output_file": str(output_file) if output_file else None,
                "timestamp": datetime.now().isoformat()
            }
        )

    except asyncio.TimeoutError:
        # Kill process on timeout
        try:
            proc.kill()
            await proc.wait()
        except:
            pass

        duration = asyncio.get_event_loop().time() - start_time

        return ClaudeCommandResult(
            success=False,
            stdout="",
            stderr=f"Command timed out after {timeout_seconds} seconds",
            exit_code=-1,
            duration=duration,
            metadata={
                "command": command,
                "execution_id": execution_id,
                "error": "timeout",
                "timeout_seconds": timeout_seconds
            }
        )

    except Exception as e:
        duration = asyncio.get_event_loop().time() - start_time

        return ClaudeCommandResult(
            success=False,
            stdout="",
            stderr=f"Command execution failed: {str(e)}",
            exit_code=-2,
            duration=duration,
            metadata={
                "command": command,
                "execution_id": execution_id,
                "error": "exception",
                "exception_type": type(e).__name__,
                "exception_message": str(e)
            }
        )


async def run_claude_prd(
    feature_description: str,
    output_file: Path,
    execution_id: str
) -> ClaudeCommandResult:
    """
    Run /flow:prd command.

    Args:
        feature_description: Feature description to generate PRD from
        output_file: Where to write the PRD output
        execution_id: Workflow execution ID

    Returns:
        Command execution result
    """
    return await run_claude_command(
        command="/flow:prd",
        stdin_input=feature_description,
        output_file=output_file,
        execution_id=execution_id,
        use_stream_json=True
    )


async def run_claude_design(
    prd_file_path: str,
    output_file: Path,
    execution_id: str
) -> ClaudeCommandResult:
    """
    Run /flow:design command.

    Args:
        prd_file_path: Path to PRD file (piped as stdin)
        output_file: Where to write the design output
        execution_id: Workflow execution ID

    Returns:
        Command execution result
    """
    return await run_claude_command(
        command="/flow:design",
        stdin_input=prd_file_path,
        output_file=output_file,
        execution_id=execution_id,
        use_stream_json=True
    )


async def run_claude_tasks(
    tdd_file_path: str,
    output_file: Path,
    execution_id: str
) -> ClaudeCommandResult:
    """
    Run /flow:tasks command.

    Args:
        tdd_file_path: Path to TDD file (piped as stdin)
        output_file: Where to write the tasks output
        execution_id: Workflow execution ID

    Returns:
        Command execution result
    """
    return await run_claude_command(
        command="/flow:tasks",
        stdin_input=tdd_file_path,
        output_file=output_file,
        execution_id=execution_id,
        use_stream_json=True
    )


async def run_claude_execute(
    tasks_file_path: str,
    execution_id: str
) -> ClaudeCommandResult:
    """
    Run /flow:execute-task command.

    Args:
        tasks_file_path: Path to tasks file (piped as stdin)
        execution_id: Workflow execution ID

    Returns:
        Command execution result
    """
    return await run_claude_command(
        command="/flow:execute-task",
        stdin_input=tasks_file_path,
        execution_id=execution_id,
        use_stream_json=False  # Execute doesn't need stream-json
    )
