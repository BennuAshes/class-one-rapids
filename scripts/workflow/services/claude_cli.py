"""
Claude CLI subprocess wrapper.

Provides async interface for executing claude CLI commands with proper
error handling, telemetry, and stream-json support.
"""

import asyncio
import json
from pathlib import Path
from typing import Optional, Tuple, Dict, Any
from datetime import datetime

from ..types import ClaudeCommandResult
from ..utils.file_ops import async_write_file


def extract_content_from_stream_json(stream_json_output: str) -> Tuple[Optional[str], Dict[str, Any]]:
    """
    Extract the final generated content from Claude's stream-json output.

    Parses stream-json format (one JSON object per line) and extracts:
    1. Content from Write tool use blocks (preferred)
    2. Final result text (fallback)

    Args:
        stream_json_output: Raw stream-json string from Claude CLI

    Returns:
        Tuple of (extracted_content, metadata)
    """
    metadata = {
        'session_id': None,
        'model': None,
        'total_tokens': 0,
        'generated_file': None
    }

    lines = stream_json_output.strip().split('\n')

    # First pass: Look for Write tool use operations (actual content)
    for line in lines:
        line = line.strip()
        if not line:
            continue

        try:
            data = json.loads(line)

            # Extract metadata from system init
            if data.get('type') == 'system' and data.get('subtype') == 'init':
                metadata['session_id'] = data.get('session_id')
                metadata['model'] = data.get('model')

            # Look for file write operations (the actual content)
            if data.get('type') == 'assistant' and 'message' in data:
                message = data['message']
                if 'content' in message:
                    for content_item in message['content']:
                        if content_item.get('name') == 'Write' and 'input' in content_item:
                            # Found a file write operation
                            file_path = content_item['input'].get('file_path')
                            file_content = content_item['input'].get('content', '')

                            if file_path and file_content:
                                metadata['generated_file'] = file_path
                                return file_content, metadata

        except json.JSONDecodeError:
            # Skip malformed JSON lines
            continue

    # Second pass: If no Write operation found, look for final result or text blocks
    for line in lines:
        line = line.strip()
        if not line:
            continue

        try:
            data = json.loads(line)

            # Check for result type
            if data.get('type') == 'result' and 'result' in data:
                return data['result'], metadata

            # Check for simple text blocks
            if data.get('type') == 'text' and 'text' in data:
                return data['text'], metadata

        except json.JSONDecodeError:
            continue

    return None, metadata


async def _run_mock_claude_command(
    command: str,
    stdin_input: Optional[str] = None,
    output_file: Optional[Path] = None
) -> ClaudeCommandResult:
    """
    Mock Claude CLI command with realistic stream-json output.

    This simulates what the actual Claude CLI returns, including:
    - System init message
    - Assistant messages with text blocks
    - Realistic stream-json format (one JSON object per line)

    The output goes through the same extraction logic as real Claude CLI responses.
    """
    # Simulate a small delay
    await asyncio.sleep(0.05)

    # Generate mock content based on command
    if "/flow:prd" in command or "prd" in command.lower():
        content = f"""# Product Requirements Document

## Feature Overview
{stdin_input if stdin_input else "Feature description"}

## Objectives
1. Deliver high-quality implementation
2. Meet user requirements
3. Ensure scalability

## Success Metrics
- Feature completeness: 100%
- User satisfaction: >90%

*Mock PRD generated for testing*
"""
    elif "/flow:design" in command or "design" in command.lower():
        content = """# Technical Design Document

## Architecture Overview
Component-based architecture with clear separation of concerns.

## Implementation Plan
1. Core module implementation
2. Integration testing
3. Documentation

*Mock TDD generated for testing*
"""
    elif "/flow:tasks" in command or "tasks" in command.lower():
        content = """# Task List

## Phase 1: Setup
- [ ] Initialize project structure
- [ ] Setup dependencies

## Phase 2: Implementation
- [ ] Implement core features
- [ ] Add tests

*Mock tasks generated for testing*
"""
    else:
        content = f"# Mock Output\n\nCommand: {command}\n\nGenerated mock response for testing."

    # Generate realistic stream-json output (multiple JSON objects, one per line)
    # This matches the format that real Claude CLI returns
    stream_json_lines = [
        # System init message
        json.dumps({
            "type": "system",
            "subtype": "init",
            "session_id": "mock-session-001",
            "model": "claude-sonnet-4-5-20250929"
        }),
        # Assistant message with text content
        json.dumps({
            "type": "text",
            "text": content
        })
    ]

    stream_json_output = "\n".join(stream_json_lines) + "\n"

    # Return result WITHOUT writing to file - let run_claude_command() handle extraction and writing
    return ClaudeCommandResult(
        success=True,
        stdout=stream_json_output,
        stderr="",
        exit_code=0,
        duration=0.05,
        metadata={"mock": True, "command": f"claude {command}"}
    )


async def run_claude_command(
    command: str,
    stdin_input: Optional[str] = None,
    output_file: Optional[Path] = None,
    execution_id: Optional[str] = None,
    telemetry_enabled: bool = False,
    use_stream_json: bool = True,
    timeout_seconds: Optional[int] = None,
    mock_mode: bool = False
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
        mock_mode: If True, return mock stream-json response

    Returns:
        ClaudeCommandResult with execution details

    Raises:
        asyncio.TimeoutError: If command exceeds timeout
        Exception: If command execution fails unexpectedly
    """
    start_time = asyncio.get_event_loop().time()

    # Mock mode - generate mock stream-json output
    if mock_mode:
        mock_result = await _run_mock_claude_command(command, stdin_input, output_file)
        stdout = mock_result.stdout
        stderr = mock_result.stderr
        returncode = mock_result.exit_code
    else:
        # Real mode - run actual Claude CLI subprocess
        try:
            # Build command parts
            cmd_parts = ["claude", command]

            # Add stream-json flags if requested
            if use_stream_json:
                cmd_parts.extend(["--output-format", "stream-json", "--verbose"])

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
            returncode = proc.returncode or 0

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

    # Extract content from stream-json if enabled (both mock and real modes)
    extracted_content = None
    if use_stream_json and returncode == 0:
        content, metadata = extract_content_from_stream_json(stdout)
        if content:
            extracted_content = content

    # Write output to file if specified (both mock and real modes)
    if output_file and returncode == 0:
        # Write extracted content if available, otherwise raw stdout
        content_to_write = extracted_content if extracted_content else stdout
        await async_write_file(output_file, content_to_write)

    # Calculate duration
    duration = asyncio.get_event_loop().time() - start_time

    # Build result
    return ClaudeCommandResult(
        success=returncode == 0,
        stdout=stdout,
        stderr=stderr,
        exit_code=returncode,
        duration=duration,
        metadata={
            "command": command,
            "execution_id": execution_id,
            "telemetry_enabled": telemetry_enabled,
            "use_stream_json": use_stream_json,
            "output_file": str(output_file) if output_file else None,
            "timestamp": datetime.now().isoformat(),
            "mock_mode": mock_mode
        }
    )


async def run_claude_prd(
    feature_description: str,
    output_file: Path,
    execution_id: str,
    mock_mode: bool = False
) -> ClaudeCommandResult:
    """
    Run /flow:prd command.

    Args:
        feature_description: Feature description to generate PRD from
        output_file: Where to write the PRD output
        execution_id: Workflow execution ID
        mock_mode: If True, use mock response

    Returns:
        Command execution result
    """
    return await run_claude_command(
        command="/flow:prd",
        stdin_input=feature_description,
        output_file=output_file,
        execution_id=execution_id,
        use_stream_json=True,
        mock_mode=mock_mode
    )


async def run_claude_design(
    prd_file_path: str,
    output_file: Path,
    execution_id: str,
    mock_mode: bool = False
) -> ClaudeCommandResult:
    """
    Run /flow:design command.

    Args:
        prd_file_path: Path to PRD file (piped as stdin)
        output_file: Where to write the design output
        execution_id: Workflow execution ID
        mock_mode: If True, use mock response

    Returns:
        Command execution result
    """
    return await run_claude_command(
        command="/flow:design",
        stdin_input=prd_file_path,
        output_file=output_file,
        execution_id=execution_id,
        use_stream_json=True,
        mock_mode=mock_mode
    )


async def run_claude_tasks(
    tdd_file_path: str,
    output_file: Path,
    execution_id: str,
    mock_mode: bool = False
) -> ClaudeCommandResult:
    """
    Run /flow:tasks command.

    Args:
        tdd_file_path: Path to TDD file (piped as stdin)
        output_file: Where to write the tasks output
        execution_id: Workflow execution ID
        mock_mode: If True, use mock response

    Returns:
        Command execution result
    """
    return await run_claude_command(
        command="/flow:tasks",
        stdin_input=tdd_file_path,
        output_file=output_file,
        execution_id=execution_id,
        use_stream_json=True,
        mock_mode=mock_mode
    )


async def run_claude_execute(
    tasks_file_path: str,
    execution_id: str,
    mock_mode: bool = False
) -> ClaudeCommandResult:
    """
    Run /flow:execute-task command.

    Args:
        tasks_file_path: Path to tasks file (piped as stdin)
        execution_id: Workflow execution ID
        mock_mode: Use mock LLM response instead of real Claude

    Returns:
        Command execution result
    """
    return await run_claude_command(
        command="/flow:execute-task",
        stdin_input=tasks_file_path,
        execution_id=execution_id,
        use_stream_json=False,  # Execute doesn't need stream-json
        mock_mode=mock_mode
    )
