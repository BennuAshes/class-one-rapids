"""
Workflow telemetry wrapper for detailed observability with Langfuse

Provides decorators and functions for tracking workflow steps,
substeps, and approval checkpoints with comprehensive metadata.
"""

import os
import sys
import time
import functools
from typing import Optional, Dict, Any, Callable
from contextlib import contextmanager
from datetime import datetime

try:
    from langfuse import Langfuse, observe
    # Import langfuse_context if it exists, otherwise create a stub
    try:
        from langfuse import langfuse_context
    except ImportError:
        # Create stub for langfuse_context if not available
        class langfuse_context:
            @staticmethod
            def update_current_observation(**kwargs):
                pass
            
            @staticmethod
            def update_current_trace(**kwargs):
                pass
    
    LANGFUSE_AVAILABLE = True
except ImportError:
    LANGFUSE_AVAILABLE = False
    print("Warning: Langfuse SDK not available. Install with: pip install langfuse", file=sys.stderr)
    
    # Create stubs for testing
    class langfuse_context:
        @staticmethod
        def update_current_observation(**kwargs):
            pass
        
        @staticmethod
        def update_current_trace(**kwargs):
            pass
    
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
        self.trace = None
        
        if LANGFUSE_AVAILABLE:
            # Initialize Langfuse client
            # Will use mocked version in tests
            self.langfuse = Langfuse(
                public_key=os.getenv("LANGFUSE_PUBLIC_KEY", ""),
                secret_key=os.getenv("LANGFUSE_SECRET_KEY", ""),
                host=os.getenv("LANGFUSE_HOST", "http://localhost:3000"),
            )
    
    def create_trace(self, name: str, **kwargs):
        """
        Create a trace for the workflow
        
        Args:
            name: Name of the workflow
            **kwargs: Additional trace parameters
        """
        if not self.langfuse:
            return None
            
        self.trace = self.langfuse.trace(
            name=name,
            session_id=self.execution_id,
            metadata={
                "execution_id": self.execution_id,
                "started_at": datetime.now().isoformat(),
                **kwargs.get('metadata', {})
            },
            **{k: v for k, v in kwargs.items() if k != 'metadata'}
        )
        return self.trace
    
    def __enter__(self):
        """Enter context manager"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Exit context manager and flush data"""
        if self.langfuse:
            try:
                self.langfuse.flush()
            except Exception as e:
                print(f"Warning: Failed to flush Langfuse data: {e}", file=sys.stderr)
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

