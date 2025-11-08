"""
Async file operations utilities.

Provides non-blocking file I/O operations using asyncio.
"""

import asyncio
import json
from pathlib import Path
from typing import Dict, Any, Optional
import aiofiles  # type: ignore


async def async_write_file(path: Path, content: str) -> None:
    """
    Write content to file asynchronously.

    Args:
        path: File path to write to
        content: Content to write

    Raises:
        IOError: If file cannot be written
    """
    async with aiofiles.open(path, 'w', encoding='utf-8') as f:
        await f.write(content)


async def async_read_file(path: Path) -> str:
    """
    Read file content asynchronously.

    Args:
        path: File path to read from

    Returns:
        File content as string

    Raises:
        IOError: If file cannot be read
        FileNotFoundError: If file does not exist
    """
    async with aiofiles.open(path, 'r', encoding='utf-8') as f:
        return await f.read()


async def async_write_json(path: Path, data: Dict[str, Any], indent: int = 2) -> None:
    """
    Write JSON data to file asynchronously.

    Args:
        path: File path to write to
        data: Dictionary to serialize as JSON
        indent: JSON indentation level

    Raises:
        IOError: If file cannot be written
        TypeError: If data is not JSON serializable
    """
    content = json.dumps(data, indent=indent, default=str)
    await async_write_file(path, content)


async def async_read_json(path: Path) -> Dict[str, Any]:
    """
    Read JSON file asynchronously.

    Args:
        path: File path to read from

    Returns:
        Parsed JSON as dictionary

    Raises:
        IOError: If file cannot be read
        FileNotFoundError: If file does not exist
        json.JSONDecodeError: If file is not valid JSON
    """
    content = await async_read_file(path)
    return json.loads(content)


async def async_file_exists(path: Path) -> bool:
    """
    Check if file exists asynchronously.

    Args:
        path: File path to check

    Returns:
        True if file exists, False otherwise
    """
    return await asyncio.to_thread(path.exists)


async def async_file_size(path: Path) -> int:
    """
    Get file size asynchronously.

    Args:
        path: File path to check

    Returns:
        File size in bytes

    Raises:
        FileNotFoundError: If file does not exist
    """
    stat = await asyncio.to_thread(path.stat)
    return stat.st_size


async def async_mkdir(path: Path, parents: bool = True, exist_ok: bool = True) -> None:
    """
    Create directory asynchronously.

    Args:
        path: Directory path to create
        parents: Create parent directories if needed
        exist_ok: Don't raise error if directory already exists

    Raises:
        FileExistsError: If directory exists and exist_ok=False
    """
    await asyncio.to_thread(path.mkdir, parents=parents, exist_ok=exist_ok)


async def async_list_files(
    directory: Path,
    pattern: str = "*",
    recursive: bool = False
) -> list[Path]:
    """
    List files in directory asynchronously.

    Args:
        directory: Directory to list
        pattern: Glob pattern to match (default: all files)
        recursive: Search recursively if True

    Returns:
        List of matching file paths

    Raises:
        FileNotFoundError: If directory does not exist
    """
    if recursive:
        matches = await asyncio.to_thread(list, directory.rglob(pattern))
    else:
        matches = await asyncio.to_thread(list, directory.glob(pattern))

    return matches


def find_workflow_file(work_dir: Path, prefix: str) -> Optional[Path]:
    """
    Find workflow file by prefix (synchronous helper).

    Args:
        work_dir: Workflow working directory
        prefix: File prefix to search for (e.g., "prd_", "tdd_")

    Returns:
        Path to matching file, or None if not found
    """
    matches = list(work_dir.glob(f"{prefix}*.md"))
    return matches[0] if matches else None


async def async_find_workflow_file(work_dir: Path, prefix: str) -> Optional[Path]:
    """
    Find workflow file by prefix asynchronously.

    Args:
        work_dir: Workflow working directory
        prefix: File prefix to search for (e.g., "prd_", "tdd_")

    Returns:
        Path to matching file, or None if not found
    """
    return await asyncio.to_thread(find_workflow_file, work_dir, prefix)
