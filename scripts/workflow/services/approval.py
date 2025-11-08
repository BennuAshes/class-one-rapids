"""
Approval service for workflow checkpoints.

Handles three approval modes:
- FILE: Create approval file, wait for approval server
- AUTO: Auto-approve (except Execute Tasks)
- INTERACTIVE: CLI prompts for approval
"""

import asyncio
from pathlib import Path
from datetime import datetime
from typing import Optional

from ..types import (
    ApprovalRequest,
    ApprovalResponse,
    ApprovalMode,
    ApprovalStatus
)
from ..utils.file_ops import async_write_json, async_read_json, async_file_exists


async def request_approval(
    request: ApprovalRequest,
    mode: ApprovalMode,
    timeout: int = 0
) -> ApprovalResponse:
    """
    Request approval for workflow checkpoint.

    Delegates to appropriate approval handler based on mode.

    Args:
        request: Approval request with checkpoint details
        mode: Approval mode (file/auto/interactive)
        timeout: Timeout in seconds (0 = unlimited)

    Returns:
        ApprovalResponse with decision and metadata
    """
    if mode == ApprovalMode.AUTO:
        # Special case: Execute Tasks always requires approval
        if request.checkpoint == "Execute Tasks":
            return await _file_approval_flow(request, timeout)
        else:
            return ApprovalResponse(status=ApprovalStatus.APPROVED)

    elif mode == ApprovalMode.FILE:
        return await _file_approval_flow(request, timeout)

    elif mode == ApprovalMode.INTERACTIVE:
        return await _interactive_approval_flow(request)

    else:
        raise ValueError(f"Unknown approval mode: {mode}")


async def _file_approval_flow(
    request: ApprovalRequest,
    timeout: int
) -> ApprovalResponse:
    """
    File-based approval flow.

    Creates approval JSON file and polls for response file from
    approval server.

    Args:
        request: Approval request
        timeout: Timeout in seconds (0 = unlimited)

    Returns:
        ApprovalResponse with decision
    """
    # Determine approval file paths
    work_dir = request.file.parent
    checkpoint_safe = request.checkpoint.replace(" ", "_")
    approval_file = work_dir / f".approval_{checkpoint_safe}.json"
    response_file = approval_file.with_suffix('.json.response')

    # Write approval request
    await async_write_json(approval_file, request.to_json_dict())

    start_time = asyncio.get_event_loop().time()

    # Poll for response
    while True:
        # Check for response file
        if await async_file_exists(response_file):
            try:
                response_data = await async_read_json(response_file)

                duration = asyncio.get_event_loop().time() - start_time

                # Parse response
                status = ApprovalStatus(response_data.get("status", "pending"))

                return ApprovalResponse(
                    status=status,
                    reason=response_data.get("reason"),
                    feedback=response_data.get("feedback"),
                    duration_seconds=duration
                )
            except Exception as e:
                # If response file is malformed, treat as error
                return ApprovalResponse(
                    status=ApprovalStatus.REJECTED,
                    reason=f"Invalid response file: {str(e)}",
                    duration_seconds=asyncio.get_event_loop().time() - start_time
                )

        # Check timeout
        if timeout > 0:
            elapsed = asyncio.get_event_loop().time() - start_time
            if elapsed >= timeout:
                return ApprovalResponse(
                    status=ApprovalStatus.TIMEOUT,
                    reason=f"No response received within {timeout} seconds",
                    duration_seconds=elapsed
                )

        # Sleep before next poll
        await asyncio.sleep(2)


async def _interactive_approval_flow(
    request: ApprovalRequest
) -> ApprovalResponse:
    """
    Interactive CLI approval flow.

    Prompts user in terminal for approval decision.

    Args:
        request: Approval request

    Returns:
        ApprovalResponse with user's decision
    """
    start_time = asyncio.get_event_loop().time()

    print(f"\n{'=' * 60}")
    print(f"APPROVAL REQUIRED: {request.checkpoint}")
    print(f"{'=' * 60}")
    print(f"\nFile: {request.file}")

    if request.preview:
        print(f"\nPreview:\n{request.preview[:500]}...")

    if request.changed_files:
        print(f"\nChanged files ({len(request.changed_files)}):")
        for fc in request.changed_files[:10]:  # Limit to first 10
            print(f"  [{fc.status}] {fc.path}")
        if len(request.changed_files) > 10:
            print(f"  ... and {len(request.changed_files) - 10} more")

    print(f"\n{'=' * 60}")

    # Prompt for approval (run in thread to avoid blocking)
    response = await asyncio.to_thread(
        input,
        "Approve? [y/n/r(eject with reason)]: "
    )

    duration = asyncio.get_event_loop().time() - start_time

    response_lower = response.lower().strip()

    if response_lower in ('y', 'yes', 'approve'):
        return ApprovalResponse(
            status=ApprovalStatus.APPROVED,
            duration_seconds=duration
        )
    elif response_lower.startswith('r'):
        # Get reason
        reason = await asyncio.to_thread(
            input,
            "Reason for rejection: "
        )
        return ApprovalResponse(
            status=ApprovalStatus.REJECTED,
            reason=reason,
            duration_seconds=duration
        )
    else:
        return ApprovalResponse(
            status=ApprovalStatus.REJECTED,
            reason="User rejected approval",
            duration_seconds=duration
        )
