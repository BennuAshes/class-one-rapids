"""
CLI entry point for Python workflow.

Provides command-line interface for running the feature-to-code workflow.
"""

import argparse
import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path

from .types import WorkflowConfig, ApprovalMode
from .orchestrator import run_workflow, load_workflow_state
from .utils.file_ops import async_read_file, async_mkdir, generate_feature_folder_name


async def main_async(args: argparse.Namespace) -> int:
    """
    Main async entry point.

    Args:
        args: Parsed command-line arguments

    Returns:
        Exit code (0 for success, 1 for failure)
    """
    # Determine feature source and description
    feature_source = args.feature
    feature_description = ""

    # Read feature description
    feature_path = Path(feature_source)
    if feature_path.exists() and feature_path.is_file():
        # It's a file, read it
        feature_description = await async_read_file(feature_path)
        feature_source = f"file: {feature_path.name}"
    else:
        # It's a directory or text - use as-is
        if Path(feature_source).is_dir():
            # Resume from existing workflow
            existing_state = await load_workflow_state(Path(feature_source))
            if existing_state:
                print(f"Resuming workflow from: {feature_source}")
                final_state = await run_workflow(
                    existing_state.config,
                    resume_from=existing_state
                )
                return 0 if final_state.status == "completed" else 1
            else:
                print(f"Error: No workflow found in directory: {feature_source}")
                return 1
        else:
            # Treat as feature description text
            feature_description = feature_source
            feature_source = "inline: command-line argument"

    # Generate execution ID
    execution_id = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Determine work directory
    if args.work_dir:
        work_dir = Path(args.work_dir)
    else:
        work_dir = Path(f"workflow-outputs/{execution_id}")

    # Create work directory
    await async_mkdir(work_dir)

    # Determine feature folder name for docs/specs/
    feature_folder_name = None
    if args.extract_to_specs:
        if args.feature_folder:
            # User-specified feature folder
            feature_folder_name = args.feature_folder
        else:
            # Auto-generate from feature description
            feature_folder_name = generate_feature_folder_name(feature_description)

    # Build config
    config = WorkflowConfig(
        execution_id=execution_id,
        work_dir=work_dir,
        feature_source=feature_source,
        feature_description=feature_description,
        telemetry_enabled=args.telemetry,
        auto_extract=args.auto_extract,
        extract_to_specs=args.extract_to_specs,
        feature_folder_name=feature_folder_name,
        approval_mode=ApprovalMode(args.approval_mode),
        approval_timeout=args.approval_timeout,
        webhook_url=args.webhook_url,
        langfuse_public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
        langfuse_secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
        langfuse_host=os.getenv("LANGFUSE_HOST", "http://localhost:3000")
    )

    # Run workflow
    print(f"Starting workflow: {execution_id}")
    print(f"Feature source: {feature_source}")
    print(f"Work directory: {work_dir}")
    print(f"Approval mode: {args.approval_mode}")
    print("")

    final_state = await run_workflow(config)

    # Print summary
    print(f"\n{'=' * 60}")
    if final_state.status == "completed":
        print("✓ Workflow completed successfully!")
        print(f"Working directory: {work_dir}")
        print("\nGenerated files:")
        for step in final_state.steps:
            if step.output_file and step.output_file.exists():
                print(f"  - {step.output_file.name}")
        return 0
    else:
        print("✗ Workflow failed")
        for step in final_state.steps:
            if step.error_message:
                print(f"  [{step.name.value}] {step.error_message}")
        return 1


def main() -> int:
    """
    Main entry point.

    Returns:
        Exit code
    """
    parser = argparse.ArgumentParser(
        description="Feature-to-code workflow automation (Python implementation)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run workflow with feature file
  python3 -m scripts.workflow.cli docs/features/my-feature.md

  # Run with auto-approval
  python3 -m scripts.workflow.cli --approval-mode auto feature.md

  # Resume existing workflow
  python3 -m scripts.workflow.cli workflow-outputs/20251107_120000

  # Interactive approval mode
  python3 -m scripts.workflow.cli --approval-mode interactive feature.md
        """
    )

    parser.add_argument(
        "feature",
        help="Feature description file, directory to resume, or inline text"
    )

    parser.add_argument(
        "--work-dir",
        help="Working directory for workflow outputs (default: auto-generated)"
    )

    parser.add_argument(
        "--approval-mode",
        choices=["file", "auto", "interactive"],
        default="file",
        help="Approval mode (default: file)"
    )

    parser.add_argument(
        "--approval-timeout",
        type=int,
        default=0,
        help="Approval timeout in seconds (0 = unlimited, default: 0)"
    )

    parser.add_argument(
        "--telemetry",
        action="store_true",
        default=True,
        help="Enable telemetry (default: enabled)"
    )

    parser.add_argument(
        "--no-telemetry",
        action="store_false",
        dest="telemetry",
        help="Disable telemetry"
    )

    parser.add_argument(
        "--auto-extract",
        action="store_true",
        default=True,
        help="Auto-extract artifacts from JSON (default: enabled)"
    )

    parser.add_argument(
        "--no-auto-extract",
        action="store_false",
        dest="auto_extract",
        help="Disable auto-extraction"
    )

    parser.add_argument(
        "--extract-to-specs",
        action="store_true",
        default=True,
        help="Extract artifacts to docs/specs (default: enabled)"
    )

    parser.add_argument(
        "--feature-folder",
        help="Feature folder name for docs/specs/ (auto-generated if not specified)"
    )

    parser.add_argument(
        "--webhook-url",
        help="Webhook URL for notifications"
    )

    args = parser.parse_args()

    # Run async main
    try:
        return asyncio.run(main_async(args))
    except KeyboardInterrupt:
        print("\n\nWorkflow interrupted by user")
        return 130
    except Exception as e:
        print(f"\nFatal error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
