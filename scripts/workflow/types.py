"""
Core type definitions for the workflow system.

This module contains all enums, type aliases, and protocol definitions
used throughout the workflow system.
"""

from dataclasses import dataclass, field, replace
from typing import Optional, List, Dict, Any, Literal, Protocol, Tuple
from datetime import datetime
from pathlib import Path
from enum import Enum


# ============================================================================
# Enums
# ============================================================================

class StepName(str, Enum):
    """Workflow step names"""
    GENERATE_PRD = "Generate PRD"
    GENERATE_DESIGN = "Generate Technical Design"
    GENERATE_TASKS = "Generate Task List"
    EXECUTE_TASKS = "Execute Tasks"
    GENERATE_SUMMARY = "Generate Summary"


class StepStatus(str, Enum):
    """Step execution status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"
    RETRY_COMPLETED = "retry_completed"
    RETRY_FAILED = "retry_failed"
    FEEDBACK_APPLIED = "feedback_applied"


class ApprovalMode(str, Enum):
    """Approval flow modes"""
    FILE = "file"
    INTERACTIVE = "interactive"
    AUTO = "auto"


class ApprovalStatus(str, Enum):
    """Approval decision status"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    TIMEOUT = "timeout"


class FeedbackCategory(str, Enum):
    """Categories for structured feedback"""
    FACTUAL_ERROR = "factual_error"
    INCOMPLETE = "incomplete"
    TONE = "tone"
    STRUCTURE = "structure"
    MISSING_CONTEXT = "missing_context"
    TECHNICAL_ISSUE = "technical_issue"
    CLARITY = "clarity"
    REQUIREMENTS_MISMATCH = "requirements_mismatch"
    OTHER = "other"


# ============================================================================
# Configuration
# ============================================================================

@dataclass(frozen=True)
class WorkflowConfig:
    """Immutable workflow configuration"""
    execution_id: str
    work_dir: Path
    feature_source: str
    feature_description: str

    # Core features - always enabled for best practices
    telemetry_enabled: bool = True
    auto_extract: bool = True
    extract_to_specs: bool = True
    show_file_changes: bool = True

    # Approval settings
    approval_mode: ApprovalMode = ApprovalMode.FILE
    approval_timeout: int = 0  # 0 = unlimited

    # Advanced approval settings (set by approval profile)
    require_command_approval: bool = True
    auto_apply_feedback: bool = False
    auto_retry_after_feedback: bool = False
    require_all_approvals: bool = False  # For strict mode

    # Execution settings
    parallel_execution: bool = False  # Enable parallel step execution
    max_concurrent_steps: int = 3  # Max steps to run in parallel

    # Optional webhook
    webhook_url: Optional[str] = None

    # Langfuse config (if telemetry enabled)
    langfuse_public_key: Optional[str] = None
    langfuse_secret_key: Optional[str] = None
    langfuse_host: str = "http://localhost:3000"

    def _replace(self, **kwargs):
        """Helper to create a new config with updated fields."""
        from dataclasses import replace
        return replace(self, **kwargs)


# ============================================================================
# Workflow State (Immutable)
# ============================================================================

@dataclass(frozen=True)
class StepRecord:
    """Immutable record of a workflow step"""
    name: StepName
    status: StepStatus
    started_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    error_message: Optional[str] = None
    output_file: Optional[Path] = None

    # Feedback tracking
    feedback_received: bool = False
    feedback_file: Optional[Path] = None
    reflection_file: Optional[Path] = None
    feedback_timestamp: Optional[datetime] = None


@dataclass(frozen=True)
class WorkflowState:
    """Immutable workflow state snapshot"""
    config: WorkflowConfig
    steps: Tuple[StepRecord, ...]  # Immutable tuple
    status: Literal["initializing", "running", "resumed", "completed", "failed"]
    started_at: datetime
    completed_at: Optional[datetime] = None

    def with_step_update(self, step_name: StepName, **updates) -> "WorkflowState":
        """Return new state with updated step (pure function)"""
        new_steps = []
        for step in self.steps:
            if step.name == step_name:
                # Create new step with updates
                new_step = replace(step, **updates)
                new_steps.append(new_step)
            else:
                new_steps.append(step)

        return replace(self, steps=tuple(new_steps))

    def get_step(self, step_name: StepName) -> Optional[StepRecord]:
        """Get step by name (pure function)"""
        return next((s for s in self.steps if s.name == step_name), None)

    def is_step_completed(self, step_name: StepName) -> bool:
        """Check if step is completed (pure function)"""
        step = self.get_step(step_name)
        return step is not None and step.status == StepStatus.COMPLETED


# ============================================================================
# Step Results
# ============================================================================

@dataclass(frozen=True)
class StepResult:
    """Result of a workflow step execution"""
    success: bool
    output_file: Optional[Path] = None
    duration_seconds: float = 0.0
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def is_success(self) -> bool:
        """Alias for success property."""
        return self.success


# ============================================================================
# Approval System
# ============================================================================

@dataclass(frozen=True)
class FileChange:
    """Represents a changed file."""
    path: str
    status: Literal["created", "modified", "deleted"]


@dataclass(frozen=True)
class ApprovalRequest:
    """Request for approval at a checkpoint."""
    execution_id: str
    checkpoint: str
    file: Path
    timestamp: datetime
    timeout_seconds: int = 0
    preview: str = ""
    changed_files: List[FileChange] = field(default_factory=list)
    git_diff: str = ""
    feedback_requested: bool = True
    approval_type: str = "standard"
    command_improvement_metadata: Optional[Dict[str, Any]] = None


@dataclass(frozen=True)
class StructuredFeedback:
    """Structured feedback for better learning."""
    category: FeedbackCategory
    description: str
    severity: Literal["low", "medium", "high"] = "medium"
    suggestions: List[str] = field(default_factory=list)
    examples: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ApprovalResponse:
    """Response from approval request."""
    status: ApprovalStatus
    duration_seconds: float = 0.0
    reason: Optional[str] = None
    feedback: Optional[Dict[str, Any]] = None
    structured_feedback: Optional[List[StructuredFeedback]] = None

    @property
    def is_success(self) -> bool:
        return self.success

    @property
    def is_failure(self) -> bool:
        return not self.success


# ============================================================================
# Approval Models
# ============================================================================

@dataclass(frozen=True)
class FileChange:
    """Represents a changed file"""
    path: str
    status: Literal["created", "modified", "deleted"]


@dataclass(frozen=True)
class FileTreeNode:
    """Represents a node in file tree"""
    name: str
    type: Literal["file", "directory"]
    children: Optional[Tuple["FileTreeNode", ...]] = None
    status: Optional[Literal["created", "modified", "deleted"]] = None


@dataclass(frozen=True)
class ApprovalRequest:
    """Approval checkpoint request"""
    execution_id: str
    checkpoint: str
    file: Path
    timestamp: datetime
    status: ApprovalStatus = ApprovalStatus.PENDING
    timeout_seconds: int = 0

    # Preview and file changes
    preview: str = ""
    changed_files: Tuple[FileChange, ...] = field(default_factory=tuple)
    git_diff: str = ""
    file_tree: Tuple[FileTreeNode, ...] = field(default_factory=tuple)

    # Feedback settings
    feedback_requested: bool = True

    def to_json_dict(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dict"""
        return {
            "execution_id": self.execution_id,
            "checkpoint": self.checkpoint,
            "file": str(self.file),
            "timestamp": self.timestamp.isoformat(),
            "status": self.status.value,
            "timeout_seconds": self.timeout_seconds,
            "preview": self.preview,
            "changed_files": [
                {"path": fc.path, "status": fc.status}
                for fc in self.changed_files
            ],
            "git_diff": self.git_diff,
            "file_tree": [self._serialize_tree_node(node) for node in self.file_tree],
            "feedback_requested": self.feedback_requested,
            "feedback_template": {
                "specific_issues": "What specific issues did you find?",
                "missing_elements": "What's missing or unclear?",
                "suggested_improvements": "How should this be improved?",
                "rating": "Rate the quality (1-5 stars)"
            }
        }

    @staticmethod
    def _serialize_tree_node(node: FileTreeNode) -> Dict[str, Any]:
        result = {
            "name": node.name,
            "type": node.type
        }
        if node.children:
            result["children"] = [
                ApprovalRequest._serialize_tree_node(child)
                for child in node.children
            ]
        if node.status:
            result["status"] = node.status
        return result


@dataclass(frozen=True)
class ApprovalResponse:
    """Approval decision response"""
    status: ApprovalStatus
    reason: Optional[str] = None
    feedback: Optional[Dict[str, Any]] = None
    duration_seconds: float = 0.0


# ============================================================================
# Claude CLI Models
# ============================================================================

@dataclass(frozen=True)
class ClaudeCommandResult:
    """Result of claude CLI execution"""
    success: bool
    stdout: str
    stderr: str
    exit_code: int
    duration: float
    metadata: Dict[str, Any] = field(default_factory=dict)


# ============================================================================
# Protocols (Interface definitions)
# ============================================================================

class StepExecutor(Protocol):
    """Interface for step executors"""
    async def execute(
        self,
        state: WorkflowState,
        input_data: Optional[Any] = None
    ) -> StepResult:
        """Execute the step and return result"""
        ...


class ApprovalService(Protocol):
    """Interface for approval services"""
    async def request_approval(
        self,
        request: ApprovalRequest
    ) -> ApprovalResponse:
        """Request approval and wait for response"""
        ...


class TelemetryService(Protocol):
    """Interface for telemetry services"""
    def track_step_start(
        self,
        execution_id: str,
        step_name: str
    ) -> None:
        """Track step start"""
        ...

    def track_step_complete(
        self,
        execution_id: str,
        step_name: str,
        duration_seconds: float,
        success: bool
    ) -> None:
        """Track step completion"""
        ...

    def track_approval(
        self,
        execution_id: str,
        checkpoint: str,
        status: str,
        duration_seconds: float,
        reason: Optional[str] = None
    ) -> None:
        """Track approval decision"""
        ...


# ============================================================================
# Helper Functions
# ============================================================================

def dataclass_replace(obj, **changes):
    """Helper to create new dataclass instance with changes (functional)"""
    return replace(obj, **changes)
