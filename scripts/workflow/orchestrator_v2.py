"""
Enhanced Workflow Orchestrator with feedback, reflection, and git tracking.

This module provides the main coordination logic for executing workflow steps,
including the missing features from the bash implementation.
"""

import asyncio
import subprocess
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple
import tempfile

from .types import (
    WorkflowConfig,
    WorkflowState,
    StepRecord,
    StepName,
    StepStatus,
    StepResult,
    ApprovalMode,
    ApprovalStatus,
    ApprovalRequest,
    ApprovalResponse,
    FeedbackCategory,
    StructuredFeedback,
    dataclass_replace
)
from .services.telemetry import TelemetryTracker
from .services.approval import request_approval
from .services.artifact_extraction import extract_artifacts
from .services.cache import get_cache_service, StepCacheService
from .utils.file_ops import async_write_json, async_read_json, async_file_exists, async_read_file, async_write_file

# Import step executors
from .steps import prd, design, tasks, execute, summary


class WorkflowOrchestrator:
    """Enhanced workflow orchestrator with complete feature parity."""

    def __init__(self, config: WorkflowConfig):
        self.config = config
        self.telemetry = TelemetryTracker(
            execution_id=config.execution_id,
            enabled=config.telemetry_enabled
        )
        self.git_initialized = False
        self.cache_service: Optional[StepCacheService] = None

    async def run(self) -> bool:
        """Run complete workflow from start."""
        state = self._create_initial_state()
        return await self._execute_workflow(state)

    async def resume(self, work_dir: Path) -> bool:
        """Resume workflow from existing state."""
        state = await self._load_state(work_dir)
        if not state:
            print(f"❌ Failed to load workflow state from {work_dir}")
            return False

        # Update state to resumed
        state = dataclass_replace(state, status="resumed")
        return await self._execute_workflow(state)

    def _create_initial_state(self) -> WorkflowState:
        """Create initial workflow state."""
        steps = tuple(
            StepRecord(name=step_name, status=StepStatus.PENDING)
            for step_name in StepName
        )

        return WorkflowState(
            config=self.config,
            steps=steps,
            status="initializing",
            started_at=datetime.now()
        )

    async def _load_state(self, work_dir: Path) -> Optional[WorkflowState]:
        """Load workflow state from disk."""
        status_file = work_dir / "workflow-status.json"

        if not await async_file_exists(status_file):
            return None

        try:
            data = await async_read_json(status_file)

            # Parse steps
            steps = []
            for step_data in data.get("steps", []):
                step = StepRecord(
                    name=StepName(step_data["name"]),
                    status=StepStatus(step_data.get("status", "pending")),
                    started_at=self._parse_datetime(step_data.get("started_at")),
                    updated_at=self._parse_datetime(step_data.get("updated_at")),
                    output_file=Path(step_data["output_file"]) if "output_file" in step_data else None,
                    error_message=step_data.get("error_message"),
                    feedback_received=step_data.get("feedback_received", False),
                    feedback_file=Path(step_data["feedback_file"]) if "feedback_file" in step_data else None,
                    reflection_file=Path(step_data["reflection_file"]) if "reflection_file" in step_data else None
                )
                steps.append(step)

            # Update config with loaded values
            self.config = dataclass_replace(
                self.config,
                execution_id=data["execution_id"],
                feature_source=data.get("feature_source", ""),
                feature_description=data.get("feature_description", "")
            )

            return WorkflowState(
                config=self.config,
                steps=tuple(steps),
                status=data.get("status", "resumed"),
                started_at=self._parse_datetime(data["started_at"]),
                completed_at=self._parse_datetime(data.get("completed_at"))
            )

        except Exception as e:
            print(f"❌ Failed to load workflow state: {e}")
            return None

    async def _execute_workflow(self, state: WorkflowState) -> bool:
        """Execute workflow with all steps."""
        state = dataclass_replace(state, status="running")
        await self._save_state(state)

        # Initialize cache service
        cache_dir = self.config.work_dir / ".cache"
        self.cache_service = await get_cache_service(
            cache_dir=cache_dir,
            enabled=True,  # Always enable for better development experience
            max_age_hours=24
        )

        # Initialize git tracking if enabled
        if self.config.show_file_changes:
            await self._init_git_tracking()

        # Execute steps in sequence
        for step_name in StepName:
            # Skip if already completed (resume case)
            if state.is_step_completed(step_name):
                print(f"[{step_name.value}] ✓ Skipping (already completed)")
                continue

            print(f"\n{'=' * 60}")
            print(f"📍 Step: {step_name.value}")
            print('=' * 60)

            # Execute step
            state = await self._execute_step(state, step_name)

            # Save state after each step
            await self._save_state(state)

            # Check for failure
            step = state.get_step(step_name)
            if step and step.status == StepStatus.FAILED:
                state = dataclass_replace(state, status="failed")
                await self._save_state(state)
                self.telemetry.flush()
                return False

        # Mark workflow complete
        state = dataclass_replace(
            state,
            status="completed",
            completed_at=datetime.now()
        )
        await self._save_state(state)
        self.telemetry.flush()

        return True

    async def _execute_step(
        self,
        state: WorkflowState,
        step_name: StepName
    ) -> WorkflowState:
        """Execute a single workflow step with approval and feedback handling."""

        print(f"⏳ Starting: {step_name.value}")

        # Update state: mark step as in progress
        state = state.with_step_update(
            step_name,
            status=StepStatus.IN_PROGRESS,
            started_at=datetime.now()
        )

        # Track start
        self.telemetry.track_step_start(step_name.value)

        # Get step executor
        executor = self._get_step_executor(step_name)
        if not executor:
            error_msg = f"No executor found for step: {step_name}"
            print(f"❌ {error_msg}")
            return state.with_step_update(
                step_name,
                status=StepStatus.FAILED,
                error_message=error_msg,
                updated_at=datetime.now()
            )

        # Try to get from cache first
        cached_result = None
        if self.cache_service and step_name != StepName.EXECUTE_TASKS:  # Never cache Execute step
            # Get input for cache key
            cache_input = await self._get_cache_input(state, step_name)
            if cache_input:
                cached_content, cache_metadata = await self.cache_service.get(
                    step_name.value,
                    cache_input,
                    {"execution_id": self.config.execution_id[:8]}  # Use partial ID for better reuse
                )

                if cached_content:
                    # Create a cached result
                    from pathlib import Path
                    from .types import StepResult

                    # Save cached content to output file
                    output_file = self.config.work_dir / f"{step_name.value.lower().replace(' ', '_')}_cached_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
                    await async_write_file(output_file, cached_content)

                    cached_result = StepResult(
                        success=True,
                        output_file=output_file,
                        duration_seconds=0.1,  # Instant from cache
                        metadata={"from_cache": True, "cache_hits": cache_metadata.get("hit_count", 1)}
                    )

        # Execute step if not cached
        if cached_result:
            result = cached_result
            print(f"⚡ Using cached result (instant)")
        else:
            try:
                result = await executor.execute(state)

                # Cache successful results
                if result.success and self.cache_service and step_name != StepName.EXECUTE_TASKS:
                    cache_input = await self._get_cache_input(state, step_name)
                    if cache_input and result.output_file and result.output_file.exists():
                        output_content = await async_read_file(result.output_file)
                        await self.cache_service.set(
                            step_name.value,
                            cache_input,
                            output_content,
                            {"execution_id": self.config.execution_id[:8]},
                            {"duration_seconds": result.duration_seconds}
                        )

            except Exception as e:
                error_msg = f"Step execution exception: {str(e)}"
                print(f"❌ {error_msg}")

                self.telemetry.track_step_complete(
                    step_name.value,
                    duration_seconds=0,
                    success=False,
                    metadata={"error": str(e)}
                )

                return state.with_step_update(
                    step_name,
                    status=StepStatus.FAILED,
                    error_message=error_msg,
                    updated_at=datetime.now()
                )

        # Handle result
        if result.success:
            state = state.with_step_update(
                step_name,
                status=StepStatus.COMPLETED,
                output_file=result.output_file,
                updated_at=datetime.now()
            )

            print(f"✅ Completed: {step_name.value}")
            if result.output_file:
                print(f"   📄 Output: {result.output_file.name}")

            # Track completion
            self.telemetry.track_step_complete(
                step_name.value,
                duration_seconds=result.duration_seconds,
                success=True,
                metadata=result.metadata
            )

            # Extract artifacts if needed
            if self.config.auto_extract and result.output_file:
                await self._extract_artifacts(state, step_name, result.output_file)

            # Request approval and handle feedback
            state = await self._handle_approval(state, step_name, result)

        else:
            state = state.with_step_update(
                step_name,
                status=StepStatus.FAILED,
                error_message=result.error_message,
                updated_at=datetime.now()
            )

            print(f"❌ Failed: {result.error_message}")

            self.telemetry.track_step_complete(
                step_name.value,
                duration_seconds=result.duration_seconds,
                success=False,
                metadata=result.metadata
            )

        return state

    async def _handle_approval(
        self,
        state: WorkflowState,
        step_name: StepName,
        result: StepResult
    ) -> WorkflowState:
        """Handle approval request with feedback support."""

        if not result.output_file or not result.output_file.exists():
            return state

        # Skip approval in certain modes
        if self.config.approval_mode == ApprovalMode.AUTO and step_name != StepName.EXECUTE_TASKS:
            print(f"✅ Auto-approved: {step_name.value}")
            return state

        # Get file changes if tracking enabled
        file_changes = []
        git_diff = ""
        if self.config.show_file_changes:
            file_changes, git_diff = await self._get_git_changes()

        # Create approval request
        preview = await self._get_file_preview(result.output_file)

        approval_request = ApprovalRequest(
            execution_id=self.config.execution_id,
            checkpoint=step_name.value,
            file=result.output_file,
            timestamp=datetime.now(),
            timeout_seconds=self.config.approval_timeout,
            preview=preview,
            changed_files=file_changes,
            git_diff=git_diff,
            feedback_requested=True
        )

        # Request approval
        print(f"⏳ Requesting approval for: {step_name.value}")
        approval_response = await request_approval(
            approval_request,
            self.config.approval_mode,
            self.config.approval_timeout
        )

        # Track approval
        self.telemetry.track_approval(
            checkpoint=step_name.value,
            status=approval_response.status.value,
            duration_seconds=approval_response.duration_seconds,
            reason=approval_response.reason
        )

        # Handle response
        if approval_response.status == ApprovalStatus.APPROVED:
            print(f"✅ Approved: {step_name.value}")

        elif approval_response.status == ApprovalStatus.REJECTED:
            print(f"❌ Rejected: {step_name.value}")
            if approval_response.reason:
                print(f"   Reason: {approval_response.reason}")

            # Handle feedback if provided
            if approval_response.feedback or approval_response.structured_feedback:
                state = await self._handle_feedback(
                    state,
                    step_name,
                    approval_response.feedback,
                    approval_response.structured_feedback
                )

        elif approval_response.status == ApprovalStatus.TIMEOUT:
            print(f"⏱️  Approval timeout: {step_name.value}")

        # Commit git changes after approval
        if self.config.show_file_changes and self.git_initialized:
            await self._commit_git_checkpoint(step_name.value)

        return state

    async def _handle_feedback(
        self,
        state: WorkflowState,
        step_name: StepName,
        feedback: Dict[str, Any],
        structured_feedback: Optional[List] = None
    ) -> WorkflowState:
        """Handle feedback and potentially retry step."""

        print(f"\n📝 Processing feedback for: {step_name.value}")

        # Process structured feedback if available
        if structured_feedback:
            print(f"📊 Structured feedback received:")
            for fb in structured_feedback:
                severity_emoji = {"low": "🟢", "medium": "🟡", "high": "🔴"}.get(fb.get("severity", "medium"), "🟡")
                print(f"  {severity_emoji} [{fb.get('category', 'OTHER')}] {fb.get('description', '')}")
                if fb.get("suggestions"):
                    for suggestion in fb.get("suggestions", []):
                        print(f"    💡 {suggestion}")

        # Save feedback to file
        feedback_data = {
            "raw_feedback": feedback,
            "structured_feedback": structured_feedback,
            "timestamp": datetime.now().isoformat()
        }
        feedback_file = self.config.work_dir / f".feedback_{step_name.value.replace(' ', '_')}.json"
        await async_write_json(feedback_file, feedback_data)

        # Update state with feedback
        state = state.with_step_update(
            step_name,
            feedback_received=True,
            feedback_file=feedback_file,
            feedback_timestamp=datetime.now()
        )

        # Run reflection if configured
        if self.config.auto_apply_feedback:
            reflection_file = await self._run_reflection(step_name, feedback_file)

            if reflection_file:
                state = state.with_step_update(
                    step_name,
                    reflection_file=reflection_file
                )

                # Apply improvements if configured
                if await self._apply_improvements(step_name, reflection_file):
                    print(f"✅ Improvements applied to command")

                    # Retry if configured
                    if self.config.auto_retry_after_feedback:
                        print(f"🔄 Retrying step with improvements...")
                        state = await self._retry_step(state, step_name)

        return state

    async def _run_reflection(
        self,
        step_name: StepName,
        feedback_file: Path
    ) -> Optional[Path]:
        """Run reflection command on feedback."""

        print(f"🤔 Running reflection analysis...")

        # Create reflection input
        feedback_content = await async_read_file(feedback_file)
        reflection_input = f"""
The {step_name.value} was rejected with the following feedback:

{feedback_content}

Please analyze:
1. What went wrong in the command
2. How the command should be improved
3. Specific changes needed to address the feedback

Focus on making the command better so it generates higher quality output next time.
"""

        # Save reflection input
        reflect_input_file = self.config.work_dir / f".reflect_input_{step_name.value.replace(' ', '_')}.txt"
        await async_write_file(reflect_input_file, reflection_input)

        # Run reflection command
        reflect_output_file = self.config.work_dir / f"reflection_{step_name.value.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"

        try:
            result = await asyncio.create_subprocess_exec(
                "claude",
                "/reflect",
                str(reflect_input_file),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await result.communicate()

            if result.returncode == 0:
                await async_write_file(reflect_output_file, stdout.decode('utf-8'))
                print(f"✅ Reflection complete: {reflect_output_file.name}")
                return reflect_output_file
            else:
                print(f"❌ Reflection failed: {stderr.decode('utf-8')}")
                return None

        except Exception as e:
            print(f"❌ Reflection error: {e}")
            return None

    async def _apply_improvements(
        self,
        step_name: StepName,
        reflection_file: Path
    ) -> bool:
        """Apply improvements from reflection to command."""

        # Map step to command file
        command_map = {
            StepName.GENERATE_PRD: "prd",
            StepName.GENERATE_DESIGN: "design",
            StepName.GENERATE_TASKS: "tasks"
        }

        command_name = command_map.get(step_name)
        if not command_name:
            return False

        print(f"📝 Applying improvements to {command_name} command...")

        # Check if command approval required
        if self.config.require_command_approval:
            # Generate proposed changes first
            proposed = await self._generate_proposed_changes(
                step_name.value,
                reflection_file,
                command_name
            )

            if not proposed:
                return False

            # Request approval for changes
            if not await self._approve_command_changes(proposed):
                print(f"❌ Command changes rejected")
                return False

        # Apply changes using apply-reflect command
        try:
            result = await asyncio.create_subprocess_exec(
                "claude",
                "/flow:apply-reflect",
                step_name.value.replace("Generate ", ""),
                str(reflection_file),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await result.communicate()

            if result.returncode == 0:
                print(f"✅ Command improvements applied")
                return True
            else:
                print(f"❌ Failed to apply improvements: {stderr.decode('utf-8')}")
                return False

        except Exception as e:
            print(f"❌ Error applying improvements: {e}")
            return False

    async def _retry_step(
        self,
        state: WorkflowState,
        step_name: StepName
    ) -> WorkflowState:
        """Retry a step after improvements."""

        print(f"\n🔄 Retrying: {step_name.value}")

        # Update status
        state = state.with_step_update(
            step_name,
            status=StepStatus.RETRYING,
            started_at=datetime.now()
        )

        # Re-execute the step
        executor = self._get_step_executor(step_name)
        if not executor:
            return state

        try:
            result = await executor.execute(state)

            if result.success:
                state = state.with_step_update(
                    step_name,
                    status=StepStatus.RETRY_COMPLETED,
                    output_file=result.output_file,
                    updated_at=datetime.now()
                )
                print(f"✅ Retry successful: {step_name.value}")
            else:
                state = state.with_step_update(
                    step_name,
                    status=StepStatus.RETRY_FAILED,
                    error_message=result.error_message,
                    updated_at=datetime.now()
                )
                print(f"❌ Retry failed: {result.error_message}")

        except Exception as e:
            state = state.with_step_update(
                step_name,
                status=StepStatus.RETRY_FAILED,
                error_message=str(e),
                updated_at=datetime.now()
            )
            print(f"❌ Retry error: {e}")

        return state

    async def _init_git_tracking(self):
        """Initialize git repository for file tracking."""
        if self.git_initialized:
            return

        try:
            # Initialize git repo in work directory
            await asyncio.create_subprocess_exec(
                "git", "init",
                cwd=self.config.work_dir,
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL
            )

            # Configure git
            await asyncio.create_subprocess_exec(
                "git", "config", "user.name", "Workflow",
                cwd=self.config.work_dir,
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL
            )

            await asyncio.create_subprocess_exec(
                "git", "config", "user.email", "workflow@localhost",
                cwd=self.config.work_dir,
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL
            )

            # Initial commit
            await asyncio.create_subprocess_exec(
                "git", "add", "-A",
                cwd=self.config.work_dir,
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL
            )

            await asyncio.create_subprocess_exec(
                "git", "commit", "-q", "-m", "Initial workflow state",
                cwd=self.config.work_dir,
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL
            )

            self.git_initialized = True
            print("📊 Git tracking initialized")

        except Exception as e:
            print(f"⚠️  Git tracking failed to initialize: {e}")
            self.git_initialized = False

    async def _get_git_changes(self) -> Tuple[List[Dict], str]:
        """Get current git changes."""
        if not self.git_initialized:
            return [], ""

        try:
            # Get status
            result = await asyncio.create_subprocess_exec(
                "git", "status", "--porcelain",
                cwd=self.config.work_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.DEVNULL
            )
            status_output, _ = await result.communicate()

            # Parse status into file changes
            changes = []
            for line in status_output.decode('utf-8').split('\n'):
                if not line.strip():
                    continue

                status_code = line[:2].strip()
                filepath = line[3:]

                if status_code in ["??", "A"]:
                    file_status = "created"
                elif status_code == "D":
                    file_status = "deleted"
                else:
                    file_status = "modified"

                changes.append({
                    "path": filepath,
                    "status": file_status
                })

            # Get diff
            result = await asyncio.create_subprocess_exec(
                "git", "diff", "HEAD",
                cwd=self.config.work_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.DEVNULL
            )
            diff_output, _ = await result.communicate()

            return changes, diff_output.decode('utf-8')

        except Exception as e:
            print(f"⚠️  Failed to get git changes: {e}")
            return [], ""

    async def _commit_git_checkpoint(self, checkpoint: str):
        """Commit changes at checkpoint."""
        if not self.git_initialized:
            return

        try:
            await asyncio.create_subprocess_exec(
                "git", "add", "-A",
                cwd=self.config.work_dir,
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL
            )

            await asyncio.create_subprocess_exec(
                "git", "commit", "-q", "-m", f"Checkpoint: {checkpoint}",
                cwd=self.config.work_dir,
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL
            )

        except Exception:
            # Ignore commit errors (might be nothing to commit)
            pass

    async def _extract_artifacts(
        self,
        state: WorkflowState,
        step_name: StepName,
        output_file: Path
    ):
        """Extract artifacts from step output."""
        if self.config.extract_to_specs:
            specs_dir = Path("docs/specs") / self.config.execution_id
            success, message = await extract_artifacts(self.config.work_dir, specs_dir)

            if success:
                print(f"   📦 Artifacts extracted to: {specs_dir}")
            elif "not JSON format" not in message:
                print(f"   ⚠️  Extraction issue: {message}")

    async def _get_file_preview(self, file_path: Path, lines: int = 20) -> str:
        """Get preview of file content."""
        try:
            content = await async_read_file(file_path)
            lines_list = content.split('\n')[:lines]
            return '\n'.join(lines_list)
        except:
            return ""

    async def _save_state(self, state: WorkflowState):
        """Save workflow state to disk."""
        status_file = self.config.work_dir / "workflow-status.json"

        data = {
            "execution_id": self.config.execution_id,
            "feature_source": self.config.feature_source,
            "feature_description": self.config.feature_description,
            "approval_mode": self.config.approval_mode.value,
            "telemetry_enabled": self.config.telemetry_enabled,
            "auto_extract": self.config.auto_extract,
            "status": state.status,
            "started_at": state.started_at.isoformat(),
            "completed_at": state.completed_at.isoformat() if state.completed_at else None,
            "working_directory": str(self.config.work_dir),
            "steps": [
                {
                    "name": step.name.value,
                    "status": step.status.value,
                    "started_at": step.started_at.isoformat() if step.started_at else None,
                    "updated_at": step.updated_at.isoformat() if step.updated_at else None,
                    "output_file": str(step.output_file) if step.output_file else None,
                    "error_message": step.error_message,
                    "feedback_received": step.feedback_received,
                    "feedback_file": str(step.feedback_file) if step.feedback_file else None,
                    "reflection_file": str(step.reflection_file) if step.reflection_file else None
                }
                for step in state.steps
            ]
        }

        await async_write_json(status_file, data)

    def _get_step_executor(self, step_name: StepName):
        """Get executor for step."""
        executors = {
            StepName.GENERATE_PRD: prd,
            StepName.GENERATE_DESIGN: design,
            StepName.GENERATE_TASKS: tasks,
            StepName.EXECUTE_TASKS: execute,
            StepName.GENERATE_SUMMARY: summary
        }
        return executors.get(step_name)

    def _parse_datetime(self, dt_str: Optional[str]) -> Optional[datetime]:
        """Parse datetime string."""
        if not dt_str:
            return None
        try:
            return datetime.fromisoformat(dt_str)
        except:
            return None

    async def _get_cache_input(self, state: WorkflowState, step_name: StepName) -> Optional[str]:
        """
        Get the input content for cache key generation.

        Args:
            state: Current workflow state
            step_name: Step to get input for

        Returns:
            Input content string or None
        """
        # Map step to its input
        if step_name == StepName.GENERATE_PRD:
            # PRD uses feature description
            return self.config.feature_description

        elif step_name == StepName.GENERATE_DESIGN:
            # Design uses PRD output
            prd_step = state.get_step(StepName.GENERATE_PRD)
            if prd_step and prd_step.output_file and prd_step.output_file.exists():
                return await async_read_file(prd_step.output_file)

        elif step_name == StepName.GENERATE_TASKS:
            # Tasks uses Design output
            design_step = state.get_step(StepName.GENERATE_DESIGN)
            if design_step and design_step.output_file and design_step.output_file.exists():
                return await async_read_file(design_step.output_file)

        elif step_name == StepName.GENERATE_SUMMARY:
            # Summary uses all previous outputs (concatenated)
            summary_parts = []
            for prev_step in [StepName.GENERATE_PRD, StepName.GENERATE_DESIGN, StepName.GENERATE_TASKS]:
                step_record = state.get_step(prev_step)
                if step_record and step_record.output_file and step_record.output_file.exists():
                    content = await async_read_file(step_record.output_file)
                    summary_parts.append(f"=== {prev_step.value} ===\n{content}\n")
            return "\n".join(summary_parts) if summary_parts else None

        return None

    async def _generate_proposed_changes(
        self,
        checkpoint: str,
        reflection_file: Path,
        command_name: str
    ) -> Optional[Dict]:
        """Generate proposed command changes."""
        # Implementation would generate diff of proposed changes
        # For now, return simplified version
        return {
            "command_file": f".claude/commands/flow/{command_name}.md",
            "proposed_diff": "Sample diff output",
            "change_summary": ["Improvement 1", "Improvement 2"]
        }

    async def _approve_command_changes(self, proposed: Dict) -> bool:
        """Request approval for command changes."""
        # Simplified approval for command changes
        # In production, would create proper approval request
        if self.config.approval_mode == ApprovalMode.AUTO:
            return True

        print(f"📝 Proposed changes to: {proposed['command_file']}")
        print("Changes:")
        for change in proposed.get('change_summary', []):
            print(f"  - {change}")

        if self.config.approval_mode == ApprovalMode.INTERACTIVE:
            response = input("Apply these changes? (y/n): ")
            return response.lower() == 'y'

        # File-based approval would go here
        return True