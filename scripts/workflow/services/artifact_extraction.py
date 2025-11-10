"""
Artifact extraction service.

Wraps the existing extract-artifacts.py script to extract clean markdown
from stream-json conversation logs.
"""

import asyncio
from pathlib import Path
from typing import Optional, Tuple


async def extract_artifacts(
    work_dir: Path,
    output_dir: Path
) -> Tuple[bool, str]:
    """
    Extract artifacts from JSON conversation logs.

    Runs the extract-artifacts.py script to parse stream-json output
    and extract clean markdown artifacts.

    Args:
        work_dir: Workflow working directory with JSON files
        output_dir: Output directory for extracted files

    Returns:
        Tuple of (success, message)
    """
    extract_script = Path(__file__).parent.parent.parent / "utils" / "extract-artifacts.py"

    if not extract_script.exists():
        return False, f"Extraction script not found: {extract_script}"

    try:
        # Run extraction script as subprocess
        proc = await asyncio.create_subprocess_exec(
            "python3",
            str(extract_script),
            str(work_dir),
            str(output_dir),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout_bytes, stderr_bytes = await proc.communicate()
        stdout = stdout_bytes.decode('utf-8', errors='replace')
        stderr = stderr_bytes.decode('utf-8', errors='replace')

        # Note: extract-artifacts.py may return exit code 1 when files
        # are already clean markdown (not JSON). This is not an error.
        if proc.returncode == 0:
            return True, stdout
        else:
            # Check if it's the "already extracted" case
            if "Already extracted" in stdout or "not JSON format" in stdout:
                return True, stdout
            else:
                return False, stderr or stdout

    except Exception as e:
        return False, f"Extraction failed: {str(e)}"


async def should_extract(file_path: Path) -> bool:
    """
    Check if file needs extraction (is it JSON format?).

    Args:
        file_path: Path to file to check

    Returns:
        True if file appears to be JSON conversation log
    """
    if not file_path.exists():
        return False

    try:
        # Read first few bytes to check format
        async with asyncio.to_thread(open, file_path, 'r', encoding='utf-8') as f:
            first_line = await asyncio.to_thread(f.readline)
            return first_line.strip().startswith('{')
    except:
        return False


async def find_extracted_file(
    work_dir: Path,
    specs_dir: Path,
    file_prefix: str,
    date_str: str
) -> Optional[Path]:
    """
    Find extracted artifact file.

    Args:
        work_dir: Workflow working directory
        specs_dir: Specs output directory
        file_prefix: File prefix (e.g., "prd", "tdd", "tasks")
        date_str: Date string (YYYYMMDD)

    Returns:
        Path to extracted file, or None if not found
    """
    # Try specs directory first
    extracted_file = specs_dir / work_dir.name / f"{file_prefix}_{date_str}.md"
    if await asyncio.to_thread(extracted_file.exists):
        return extracted_file

    # Try alternate naming (from extraction script)
    alt_names = [
        f"{file_prefix}_extracted_{date_str}.md",
        f"technical_design_{date_str}.md",  # TDD uses different name
        f"prd_extracted_{date_str}.md"
    ]

    for alt_name in alt_names:
        alt_path = specs_dir / work_dir.name / alt_name
        if await asyncio.to_thread(alt_path.exists):
            return alt_path

    return None
