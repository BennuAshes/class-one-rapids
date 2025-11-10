#!/usr/bin/env python3
"""
Run only the design phase on an existing PRD file.
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Add scripts to path
sys.path.insert(0, str(Path(__file__).parent / "scripts"))

from workflow.services.claude_cli import run_claude_design
from workflow.types import ClaudeCommandResult


async def main():
    if len(sys.argv) < 2:
        print("Usage: python run-design-only.py <prd-file-path>")
        sys.exit(1)

    prd_file = sys.argv[1]
    prd_path = Path(prd_file)

    if not prd_path.exists():
        print(f"Error: PRD file not found: {prd_file}")
        sys.exit(1)

    # Determine output file (same directory as PRD)
    output_dir = prd_path.parent
    output_file = output_dir / f"technical_design_{datetime.now():%Y%m%d}.md"

    print(f"Running /flow:design on {prd_file}")
    print(f"Output will be written to: {output_file}")
    print()

    # Run the design command
    result: ClaudeCommandResult = await run_claude_design(
        prd_file_path=str(prd_path),
        output_file=output_file,
        execution_id=f"design-only-{datetime.now():%Y%m%d_%H%M%S}",
        mock_mode=False
    )

    if result.success:
        print(f"✅ Design generated successfully!")
        print(f"Output file: {output_file}")
        if output_file.exists():
            print(f"File size: {output_file.stat().st_size} bytes")
    else:
        print(f"❌ Design generation failed")
        print(f"Error: {result.stderr}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
