#!/usr/bin/env python3
"""
Feature to Code Workflow - Simplified Python Implementation

A streamlined workflow automation tool for generating PRDs, technical designs,
task lists, and executing implementation tasks.

Usage:
    workflow "feature description"                    # Run with inline description
    workflow feature.md                              # Run with feature file
    workflow workflow-outputs/20251108_123456        # Resume existing workflow

Options:
    --approval {minimal,standard,strict,interactive} # Approval mode (default: standard)
    --output DIR                                     # Output directory (default: workflow-outputs)
    --timeout SECONDS                                # Approval timeout (0 = unlimited)
    --webhook URL                                     # Webhook for notifications
    --no-telemetry                                   # Disable Langfuse telemetry
"""

import argparse
import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional
import json

# Add the scripts directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from workflow.types import WorkflowConfig, ApprovalMode
from workflow.orchestrator_v2 import WorkflowOrchestrator
from workflow.utils.file_ops import generate_feature_folder_name


def parse_approval_mode(mode: str) -> tuple[ApprovalMode, dict]:
    """
    Parse approval mode string into enum and additional settings.

    Approval profiles:
    - minimal: Auto-approve all except Execute Tasks
    - standard: File-based approval flow (default)
    - strict: Require approval for everything including command changes
    - interactive: Terminal prompts for approval
    """
    profiles = {
        "test": {
            "mode": ApprovalMode.AUTO,
            "require_command_approval": False,
            "auto_apply_feedback": True,
            "auto_retry_after_feedback": False,
            "skip_execute_approval": True  # NEW: Auto-approve Execute Tasks too
        },
        "minimal": {
            "mode": ApprovalMode.AUTO,
            "require_command_approval": False,
            "auto_apply_feedback": True,
            "auto_retry_after_feedback": False
        },
        "standard": {
            "mode": ApprovalMode.FILE,
            "require_command_approval": True,
            "auto_apply_feedback": False,
            "auto_retry_after_feedback": False
        },
        "strict": {
            "mode": ApprovalMode.FILE,
            "require_command_approval": True,
            "auto_apply_feedback": False,
            "auto_retry_after_feedback": False,
            "require_all_approvals": True
        },
        "interactive": {
            "mode": ApprovalMode.INTERACTIVE,
            "require_command_approval": True,
            "auto_apply_feedback": False,
            "auto_retry_after_feedback": False
        }
    }

    if mode not in profiles:
        raise ValueError(f"Invalid approval mode: {mode}")

    profile = profiles[mode]
    return profile["mode"], {k: v for k, v in profile.items() if k != "mode"}


def load_langfuse_config() -> Optional[dict]:
    """Load Langfuse configuration from environment."""
    public_key = os.getenv("LANGFUSE_PUBLIC_KEY")
    secret_key = os.getenv("LANGFUSE_SECRET_KEY")

    if not public_key or not secret_key:
        # Try to load from default values if not in environment
        public_key = public_key or "pk-lf-e7b25b9c-356f-4268-96cf-07318a4a5ee4"
        secret_key = secret_key or "sk-lf-980bcde7-ff84-40b2-b127-1e68a0b6c406"

    return {
        "public_key": public_key,
        "secret_key": secret_key,
        "host": os.getenv("LANGFUSE_HOST", "http://localhost:3000")
    }


async def main_async(args: argparse.Namespace) -> int:
    """Main async entry point."""

    # Determine if we're resuming or starting new
    # Normalize path to handle both Windows and Unix separators
    normalized_feature = args.feature.replace('\\', '/')
    input_path = Path(normalized_feature)

    if input_path.is_dir() and (input_path / "workflow-status.json").exists():
        # Resume existing workflow
        print(f"📂 Resuming workflow from: {input_path}")

        # Load existing configuration
        with open(input_path / "workflow-status.json", 'r') as f:
            status_data = json.load(f)

        config = WorkflowConfig(
            execution_id=status_data["execution_id"],
            work_dir=input_path,
            feature_source=status_data.get("feature_source", "resumed"),
            feature_description=status_data.get("feature_description", ""),
            telemetry_enabled=args.telemetry,
            approval_mode=ApprovalMode.FILE,  # Will be updated below
            approval_timeout=args.timeout,
            webhook_url=args.webhook
        )

        resume_from = input_path

    else:
        # New workflow
        execution_id = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Determine feature source and description
        if input_path.exists() and input_path.is_file():
            # Read from file
            with open(input_path, 'r', encoding='utf-8') as f:
                feature_description = f.read()
            feature_source = f"file: {input_path.name}"
        else:
            # Use as inline description
            feature_description = args.feature
            feature_source = "command line"

        # Generate feature folder name for docs/specs/
        feature_folder_name = generate_feature_folder_name(feature_description)

        # Set up work directory
        if args.output:
            work_dir = Path(args.output) / execution_id
        else:
            work_dir = Path("workflow-outputs") / execution_id

        work_dir.mkdir(parents=True, exist_ok=True)

        # Parse approval settings
        approval_mode, approval_settings = parse_approval_mode(args.approval)

        # Load Langfuse config if telemetry enabled
        langfuse_config = load_langfuse_config() if args.telemetry else None

        # Create configuration
        config = WorkflowConfig(
            execution_id=execution_id,
            work_dir=work_dir,
            feature_source=feature_source,
            feature_description=feature_description,
            feature_folder_name=feature_folder_name,
            telemetry_enabled=args.telemetry,
            approval_mode=approval_mode,
            approval_timeout=args.timeout,
            webhook_url=args.webhook,
            parallel_execution=args.parallel,
            mock_mode=args.mock,
            mock_delay=args.mock_delay,
            **approval_settings
        )

        if langfuse_config and args.telemetry:
            config = config._replace(
                langfuse_public_key=langfuse_config["public_key"],
                langfuse_secret_key=langfuse_config["secret_key"],
                langfuse_host=langfuse_config["host"]
            )

        resume_from = None

    # Print configuration summary
    print("=" * 60)
    print("🚀 Feature to Code Workflow")
    print("=" * 60)
    print(f"📋 Execution ID: {config.execution_id}")
    print(f"📁 Work Directory: {config.work_dir}")
    print(f"🎯 Approval Mode: {args.approval}")
    print(f"📊 Telemetry: {'Enabled' if args.telemetry else 'Disabled'}")
    if args.mock:
        print(f"🎭 Mock Mode: ENABLED (delay: {args.mock_delay}s)")
    if args.parallel:
        print(f"⚡ Parallel Execution: Enabled")
    if args.webhook:
        print(f"🔔 Webhook: {args.webhook}")
    print("=" * 60)
    print()

    # Run workflow
    try:
        orchestrator = WorkflowOrchestrator(config)

        if resume_from:
            success = await orchestrator.resume(resume_from)
        else:
            success = await orchestrator.run()

        if success:
            print("\n" + "=" * 60)
            print("✅ Workflow completed successfully!")
            print(f"📁 Output directory: {config.work_dir}")
            print("=" * 60)
            return 0
        else:
            print("\n" + "=" * 60)
            print("❌ Workflow failed or was cancelled")
            print(f"📁 Output directory: {config.work_dir}")
            print("=" * 60)
            return 1

    except KeyboardInterrupt:
        print("\n\n⚠️  Workflow interrupted by user")
        return 130
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        return 1


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Feature to Code Workflow - Streamlined Automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic usage with feature description
  %(prog)s "Add user authentication with OAuth2"

  # Use a feature file
  %(prog)s docs/features/oauth.md

  # Resume existing workflow
  %(prog)s workflow-outputs/20251108_123456

  # Minimal approval mode (auto-approve except Execute)
  %(prog)s --approval minimal "Add login feature"

  # Interactive mode with custom output
  %(prog)s --approval interactive --output my-project feature.md

  # With webhook notifications
  %(prog)s --webhook https://hooks.slack.com/xxx "New feature"

Approval Modes:
  minimal     - Auto-approve all steps except Execute Tasks
  standard    - File-based approval (default)
  strict      - Require approval for all changes
  interactive - Terminal prompts for approval
        """
    )

    parser.add_argument(
        "feature",
        help="Feature description, file path, or workflow directory to resume"
    )

    parser.add_argument(
        "--approval",
        choices=["test", "minimal", "standard", "strict", "interactive"],
        default="standard",
        help="Approval mode profile (default: standard)"
    )

    parser.add_argument(
        "--output",
        help="Output directory (default: workflow-outputs)"
    )

    parser.add_argument(
        "--timeout",
        type=int,
        default=0,
        help="Approval timeout in seconds (0 = unlimited)"
    )

    parser.add_argument(
        "--webhook",
        help="Webhook URL for notifications"
    )

    parser.add_argument(
        "--no-telemetry",
        action="store_false",
        dest="telemetry",
        help="Disable Langfuse telemetry"
    )

    parser.add_argument(
        "--parallel",
        action="store_true",
        help="Enable parallel step execution (experimental)"
    )

    parser.add_argument(
        "--mock",
        action="store_true",
        help="Use mock LLM responses for fast testing (no API calls)"
    )

    parser.add_argument(
        "--mock-delay",
        type=float,
        default=0.1,
        help="Delay for mock responses in seconds (default: 0.1)"
    )

    parser.add_argument(
        "--version",
        action="version",
        version="%(prog)s 2.0.0"
    )

    args = parser.parse_args()

    # Run async main
    sys.exit(asyncio.run(main_async(args)))


if __name__ == "__main__":
    main()