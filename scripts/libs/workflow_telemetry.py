"""
Workflow telemetry wrapper for detailed observability with Langfuse

Provides decorators and functions for tracking workflow steps,
substeps, and approval checkpoints with comprehensive metadata.
"""

import os
import sys
import time
import functools
import subprocess
from typing import Optional, Dict, Any, Callable
from contextlib import contextmanager
from datetime import datetime

def _test_langfuse_import(timeout_seconds=3):
    """Test if langfuse can be imported within timeout using subprocess."""
    # NOTE: Subprocess test can have false negatives due to subprocess initialization overhead
    # We try subprocess first for safety, but fall back to direct import if it fails
    try:
        # Test import in subprocess with timeout
        result = subprocess.run(
            [sys.executable, "-c", "from langfuse import Langfuse"],
            timeout=timeout_seconds,
            capture_output=True
        )
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        # Subprocess timed out - try direct import as fallback
        # This can happen when langfuse package has subprocess-specific initialization issues
        try:
            import importlib.util
            spec = importlib.util.find_spec("langfuse")
            return spec is not None
        except:
            return False
    except Exception:
        return False

def _show_docker_warning():
    """Show helpful Docker warning message."""
    print("\n" + "="*60, file=sys.stderr)
    print("⚠️  WARNING: Langfuse connection timed out", file=sys.stderr)
    print("="*60, file=sys.stderr)
    print("\nLangfuse telemetry requires Docker to be running.", file=sys.stderr)
    print("\nPlease check:", file=sys.stderr)
    print("  1. Docker Desktop is running", file=sys.stderr)
    print("  2. Langfuse containers are up:", file=sys.stderr)
    print("     cd observability && docker-compose ps", file=sys.stderr)
    print("  3. Start Langfuse if needed:", file=sys.stderr)
    print("     cd observability && docker-compose up -d", file=sys.stderr)
    print("\nContinuing without telemetry...", file=sys.stderr)
    print("="*60 + "\n", file=sys.stderr)

# Lazy initialization - only test/import when actually needed
# This avoids 3+ second subprocess timeout at import time
LANGFUSE_AVAILABLE = None  # None = not yet tested
Langfuse = None
observe = None

def _ensure_langfuse_imported():
    """Lazily import langfuse only when needed."""
    global LANGFUSE_AVAILABLE, Langfuse, observe, langfuse_context

    if LANGFUSE_AVAILABLE is not None:
        return  # Already tested

    # Test if langfuse is available
    if _test_langfuse_import():
        try:
            from langfuse import Langfuse as LF, observe as obs
            LANGFUSE_AVAILABLE = True
            Langfuse = LF
            observe = obs

            # Try to import langfuse_context as well
            try:
                from langfuse import langfuse_context as lf_context
                langfuse_context = lf_context
            except ImportError:
                pass  # Keep the stub version
        except ImportError:
            LANGFUSE_AVAILABLE = False
    else:
        # Import timed out - show warning
        _show_docker_warning()
        LANGFUSE_AVAILABLE = False

# Create stub for langfuse_context initially (will be replaced if langfuse is imported)
class langfuse_context:
    @staticmethod
    def update_current_observation(**kwargs):
        pass

    @staticmethod
    def update_current_trace(**kwargs):
        pass

# Create stub observe decorator initially (will be replaced if langfuse is imported)
if observe is None:
    def observe(**kwargs):
        def decorator(func):
            return func
        return decorator


class WorkflowObserver:
    """
    Context manager for workflow observation
    
    Provides a clean interface for creating traces and managing
    Langfuse client lifecycle.
    """
    
    def __init__(self, execution_id: str):
        """
        Initialize workflow observer

        Args:
            execution_id: Unique identifier for this workflow execution
        """
        self.execution_id = execution_id
        self.langfuse = None
        self.workflow_trace = None  # Parent trace for entire workflow
        self.workflow_trace_context = None
        self.current_span = None
        self.current_span_context = None

        # Ensure langfuse is imported if available
        _ensure_langfuse_imported()

        if LANGFUSE_AVAILABLE:
            # Initialize Langfuse client using v3 API
            from langfuse import get_client
            self.langfuse = get_client()

            # Create parent trace for the entire workflow
            self._create_workflow_trace()

    def _create_workflow_trace(self):
        """Create the parent trace context for the entire workflow"""
        if not self.langfuse:
            return

        # Create a parent trace span that will contain all workflow steps
        self.workflow_trace_context = self.langfuse.start_as_current_span(
            name="Feature-to-Code Workflow"
        )
        self.workflow_trace = self.workflow_trace_context.__enter__()

        # Update with workflow metadata
        if self.workflow_trace:
            self.workflow_trace.update(
                metadata={
                    "execution_id": self.execution_id,
                    "workflow_type": "feature-to-code",
                    "started_at": datetime.now().isoformat(),
                }
            )

    def create_trace(self, name: str, **kwargs):
        """
        Create a trace for the workflow (deprecated - use _create_workflow_trace)

        Args:
            name: Name of the workflow
            **kwargs: Additional trace parameters
        """
        # This method kept for backwards compatibility but not used in v3
        pass

    def start_step(self, step_name: str):
        """
        Start tracking a workflow step (Langfuse v3 API)

        Args:
            step_name: Name of the step
        """
        if not self.langfuse:
            return

        import time

        # Create a span using v3 API
        # Store the context manager so we can call __exit__ later
        self.current_span_context = self.langfuse.start_as_current_span(
            name=step_name
        )

        # Enter the context manager
        self.current_span = self.current_span_context.__enter__()
        self.current_span_start_time = time.time()

        # Update with metadata
        if self.current_span:
            self.current_span.update(
                metadata={
                    "step_name": step_name,
                    "execution_id": self.execution_id,
                    "started_at": datetime.now().isoformat(),
                }
            )

    def complete_step(self, step_name: str, success: bool = True, duration: float = None, metadata: dict = None):
        """
        Complete tracking a workflow step (Langfuse v3 API)

        Args:
            step_name: Name of the step
            success: Whether the step succeeded
            duration: Duration in seconds (calculated if not provided)
            metadata: Additional metadata to log
        """
        if not self.langfuse or not self.current_span:
            return

        import time
        if duration is None and hasattr(self, 'current_span_start_time'):
            duration = time.time() - self.current_span_start_time

        # Update span with completion data
        self.current_span.update(
            metadata={
                **(metadata or {}),
                "success": success,
                "duration_seconds": duration,
                "completed_at": datetime.now().isoformat(),
            }
        )

        # Exit the context manager (closes the span)
        if self.current_span_context:
            self.current_span_context.__exit__(None, None, None)
            self.current_span_context = None
            self.current_span = None

    def flush(self):
        """Flush telemetry data to Langfuse and close workflow trace"""
        # Close the workflow trace if it exists
        if self.workflow_trace_context:
            try:
                self.workflow_trace_context.__exit__(None, None, None)
                self.workflow_trace_context = None
                self.workflow_trace = None
            except Exception as e:
                print(f"Warning: Failed to close workflow trace: {e}", file=sys.stderr)

        # Flush remaining data
        if self.langfuse:
            try:
                self.langfuse.flush()
            except Exception as e:
                print(f"Warning: Failed to flush Langfuse data: {e}", file=sys.stderr)

    def __enter__(self):
        """Enter context manager"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Exit context manager and flush data"""
        self.flush()
        return False  # Don't suppress exceptions


def observe_workflow_step(step_name: str, execution_id: str):
    """
    Decorator to observe a workflow step
    
    Creates a span for the step and tracks timing, errors, and metadata.
    
    Args:
        step_name: Name of the workflow step
        execution_id: Execution ID for linking to trace
        
    Example:
        @observe_workflow_step(step_name="Generate PRD", execution_id="123")
        def generate_prd():
            return create_prd()
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            _ensure_langfuse_imported()
            if not LANGFUSE_AVAILABLE:
                return func(*args, **kwargs)
            
            # Get or create Langfuse client
            langfuse = Langfuse(
                public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
                secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
                host=os.getenv("LANGFUSE_HOST", "http://localhost:3000"),
            )
            
            # Get existing trace or create new one
            trace = langfuse.trace(
                name="workflow-step",
                session_id=execution_id,
            )
            
            # Create span for this step
            start_time = time.time()
            span = trace.span(
                name=step_name,
                metadata={
                    "step_name": step_name,
                    "execution_id": execution_id,
                    "started_at": datetime.now().isoformat(),
                }
            )
            
            try:
                # Execute function
                result = func(*args, **kwargs)
                
                # Update span with success
                duration = time.time() - start_time
                span.end(
                    metadata={
                        "duration_seconds": duration,
                        "status": "success",
                    }
                )
                
                return result
                
            except Exception as e:
                # Update span with error
                duration = time.time() - start_time
                span.end(
                    level="ERROR",
                    status_message=str(e),
                    metadata={
                        "duration_seconds": duration,
                        "status": "error",
                        "error_type": type(e).__name__,
                    }
                )
                raise
            finally:
                langfuse.flush()
        
        return wrapper
    return decorator


def observe_substep(substep_name: str):
    """
    Decorator to observe a substep within a workflow step
    
    Creates a nested observation for detailed tracking.
    
    Args:
        substep_name: Name of the substep (e.g., "planning", "execution", "validation")
        
    Example:
        @observe_substep(substep_name="planning")
        def plan_approach():
            return generate_plan()
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            _ensure_langfuse_imported()
            if not LANGFUSE_AVAILABLE:
                return func(*args, **kwargs)
            
            start_time = time.time()
            
            # Update current observation with substep metadata
            langfuse_context.update_current_observation(
                metadata={
                    "substep": substep_name,
                    "substep_started_at": datetime.now().isoformat(),
                }
            )
            
            try:
                result = func(*args, **kwargs)
                
                # Update with completion
                duration = time.time() - start_time
                langfuse_context.update_current_observation(
                    metadata={
                        "substep": substep_name,
                        "substep_duration": duration,
                        "substep_status": "success",
                    }
                )
                
                return result
                
            except Exception as e:
                # Update with error
                duration = time.time() - start_time
                langfuse_context.update_current_observation(
                    level="ERROR",
                    metadata={
                        "substep": substep_name,
                        "substep_duration": duration,
                        "substep_status": "error",
                        "substep_error": str(e),
                    }
                )
                raise
        
        return wrapper
    return decorator


def track_approval_checkpoint(
    execution_id: str,
    checkpoint: str,
    status: str,
    duration_seconds: float,
    reviewer: Optional[str] = None,
    reason: Optional[str] = None,
    add_score: bool = True
):
    """
    Track an approval checkpoint in the workflow with optional scoring

    Args:
        execution_id: Execution ID for linking to trace
        checkpoint: Name of checkpoint (e.g., "PRD", "Design", "Tasks")
        status: Approval status ("approved", "rejected", "timeout")
        duration_seconds: Time spent waiting for approval
        reviewer: Optional reviewer identifier
        reason: Optional reason for rejection
        add_score: Whether to add numeric score (default: True)
    """
    _ensure_langfuse_imported()
    if not LANGFUSE_AVAILABLE:
        return

    try:
        langfuse = Langfuse(
            public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
            secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
            host=os.getenv("LANGFUSE_HOST", "http://localhost:3000"),
        )

        # Create span for approval checkpoint using v3 API context manager
        with langfuse.start_as_current_span(
            name=f"Approval: {checkpoint}",
            metadata={
                "checkpoint": checkpoint,
                "status": status,
                "duration_seconds": duration_seconds,
                "reviewer": reviewer,
                "reason": reason,
                "timestamp": datetime.now().isoformat(),
                "tracked_by": "workflow-telemetry"
            }
        ) as span:
            # Update trace with session_id and name (v3 API)
            langfuse.update_current_trace(
                name="workflow-approval",
                session_id=execution_id
            )

            # Add numeric score for the approval decision (v3 API)
            if add_score:
                score_value = 1.0 if status == "approved" else 0.0
                score_comment = reason if reason else f"{checkpoint} {status}"

                langfuse.score_current_trace(
                    name=f"approval_{checkpoint.lower().replace(' ', '_')}",
                    value=score_value,
                    comment=score_comment,
                    data_type="NUMERIC"
                )

        langfuse.flush()
    except Exception as e:
        # Graceful degradation - don't fail workflow if telemetry fails
        print(f"[WARNING] Failed to track approval checkpoint: {e}")


def create_step_generation(
    execution_id: str,
    step_name: str,
    input_prompt: str,
    output_text: str,
    model: str,
    tokens_input: Optional[int] = None,
    tokens_output: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None
):
    """
    Create a generation observation for LLM calls
    
    Args:
        execution_id: Execution ID for linking to trace
        step_name: Name of the generation step
        input_prompt: Input prompt sent to LLM
        output_text: Output received from LLM
        model: Model name used
        tokens_input: Input token count
        tokens_output: Output token count
        metadata: Additional metadata
    """
    _ensure_langfuse_imported()
    if not LANGFUSE_AVAILABLE:
        return
    
    langfuse = Langfuse(
        public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
        secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
        host=os.getenv("LANGFUSE_HOST", "http://localhost:3000"),
    )
    
    # Get trace
    trace = langfuse.trace(
        name="workflow-generation",
        session_id=execution_id,
    )
    
    # Create generation observation
    usage = {}
    if tokens_input is not None:
        usage['input'] = tokens_input
    if tokens_output is not None:
        usage['output'] = tokens_output
    if usage:
        usage['unit'] = "TOKENS"
    
    generation = trace.generation(
        name=step_name,
        model=model,
        input=input_prompt[:1000],  # Truncate for storage
        output=output_text[:1000],  # Truncate for storage
        usage=usage or None,
        metadata=metadata or {}
    )
    
    langfuse.flush()


def score_artifact(
    execution_id: str,
    name: str,
    value: Any,
    comment: Optional[str] = None,
    data_type: Optional[str] = None,
    observation_id: Optional[str] = None
):
    """
    Add a score to a trace or observation
    
    Args:
        execution_id: Execution ID for linking to trace
        name: Score name (e.g., "prd_completeness")
        value: Score value (numeric, string, or boolean)
        comment: Optional comment explaining the score
        data_type: Optional data type ("NUMERIC", "CATEGORICAL", "BOOLEAN")
        observation_id: Optional observation ID to attach score to
    """
    _ensure_langfuse_imported()
    if not LANGFUSE_AVAILABLE:
        return
    
    langfuse = Langfuse(
        public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
        secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
        host=os.getenv("LANGFUSE_HOST", "http://localhost:3000"),
    )
    
    # Infer data type if not provided
    if data_type is None:
        if isinstance(value, bool):
            data_type = "BOOLEAN"
        elif isinstance(value, (int, float)):
            data_type = "NUMERIC"
        else:
            data_type = "CATEGORICAL"
    
    # Create score
    langfuse.score(
        trace_id=execution_id,  # Use execution_id as trace_id
        name=name,
        value=value,
        comment=comment,
        data_type=data_type,
        observation_id=observation_id,
    )
    
    langfuse.flush()

