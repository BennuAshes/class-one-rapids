"""
Tests for workflow telemetry wrapper
Following TDD red-green-refactor methodology
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock, call
from contextlib import contextmanager

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

from workflow_telemetry import (
    observe_workflow_step,
    observe_substep,
    track_approval_checkpoint,
    create_step_generation,
    score_artifact,
    WorkflowObserver,
)


class TestWorkflowObserver:
    """Test WorkflowObserver class"""

    @patch('workflow_telemetry.Langfuse')
    def test_observer_initialization(self, mock_langfuse):
        """Should initialize with Langfuse client"""
        observer = WorkflowObserver(execution_id="test_123")
        assert observer.execution_id == "test_123"
        assert observer.langfuse is not None

    @patch('workflow_telemetry.Langfuse')
    def test_observer_creates_trace(self, mock_langfuse):
        """Should create a trace on initialization"""
        mock_client = MagicMock()
        mock_langfuse.return_value = mock_client
        
        observer = WorkflowObserver(execution_id="test_123")
        observer.create_trace(name="test-workflow")
        
        mock_client.trace.assert_called_once()

    @patch('workflow_telemetry.Langfuse')
    def test_observer_uses_session_id(self, mock_langfuse):
        """Should use execution_id as session_id"""
        mock_client = MagicMock()
        mock_langfuse.return_value = mock_client
        
        observer = WorkflowObserver(execution_id="test_123")
        observer.create_trace(name="test-workflow")
        
        call_args = mock_client.trace.call_args
        assert call_args[1]['session_id'] == "test_123"


class TestObserveWorkflowStep:
    """Test observe_workflow_step decorator"""

    @patch('workflow_telemetry.Langfuse')
    def test_decorator_wraps_function(self, mock_langfuse):
        """Should wrap function and preserve return value"""
        @observe_workflow_step(step_name="test_step", execution_id="test_123")
        def test_func():
            return "test_result"
        
        result = test_func()
        assert result == "test_result"

    @patch('workflow_telemetry.Langfuse')
    def test_decorator_creates_observation(self, mock_langfuse):
        """Should create observation for step"""
        mock_client = MagicMock()
        mock_trace = MagicMock()
        mock_langfuse.return_value = mock_client
        mock_client.trace.return_value = mock_trace
        
        @observe_workflow_step(step_name="test_step", execution_id="test_123")
        def test_func():
            return "test_result"
        
        test_func()
        
        # Should create a span for the step
        assert mock_trace.span.called or mock_trace.generation.called

    @patch('workflow_telemetry.Langfuse')
    def test_decorator_handles_errors(self, mock_langfuse):
        """Should track errors and re-raise"""
        @observe_workflow_step(step_name="test_step", execution_id="test_123")
        def test_func():
            raise ValueError("Test error")
        
        with pytest.raises(ValueError):
            test_func()

    @patch('workflow_telemetry.Langfuse')
    def test_decorator_closes_observation_on_error(self, mock_langfuse):
        """Should close observation even on error"""
        mock_client = MagicMock()
        mock_trace = MagicMock()
        mock_span = MagicMock()
        mock_langfuse.return_value = mock_client
        mock_client.trace.return_value = mock_trace
        mock_trace.span.return_value = mock_span
        
        @observe_workflow_step(step_name="test_step", execution_id="test_123")
        def test_func():
            raise ValueError("Test error")
        
        with pytest.raises(ValueError):
            test_func()
        
        # Span should still be ended
        mock_span.end.assert_called()


class TestObserveSubstep:
    """Test observe_substep decorator"""

    @patch('workflow_telemetry.langfuse_context')
    def test_substep_decorator_creates_nested_observation(self, mock_context):
        """Should create nested observation"""
        @observe_substep(substep_name="planning")
        def test_func():
            return "result"
        
        result = test_func()
        assert result == "result"

    @patch('workflow_telemetry.langfuse_context')
    def test_substep_decorator_updates_current_observation(self, mock_context):
        """Should update current observation with substep metadata"""
        mock_context.update_current_observation = MagicMock()
        
        @observe_substep(substep_name="planning")
        def test_func():
            return "result"
        
        test_func()
        
        # Should have updated observation with metadata
        assert mock_context.update_current_observation.called


class TestTrackApprovalCheckpoint:
    """Test approval checkpoint tracking"""

    @patch('workflow_telemetry.Langfuse')
    def test_track_approval_creates_observation(self, mock_langfuse):
        """Should create observation for approval checkpoint"""
        mock_client = MagicMock()
        mock_trace = MagicMock()
        mock_langfuse.return_value = mock_client
        mock_client.trace.return_value = mock_trace
        
        track_approval_checkpoint(
            execution_id="test_123",
            checkpoint="PRD",
            status="approved",
            duration_seconds=30
        )
        
        # Should create observation
        assert mock_trace.span.called or mock_trace.event.called

    @patch('workflow_telemetry.Langfuse')
    def test_track_approval_includes_metadata(self, mock_langfuse):
        """Should include checkpoint metadata"""
        mock_client = MagicMock()
        mock_trace = MagicMock()
        mock_span = MagicMock()
        mock_langfuse.return_value = mock_client
        mock_client.trace.return_value = mock_trace
        mock_trace.span.return_value = mock_span
        
        track_approval_checkpoint(
            execution_id="test_123",
            checkpoint="PRD",
            status="approved",
            duration_seconds=30
        )
        
        # Check that metadata was passed
        call_args = mock_trace.span.call_args
        if call_args:
            metadata = call_args[1].get('metadata', {})
            assert 'checkpoint' in metadata or 'status' in metadata


class TestCreateStepGeneration:
    """Test LLM generation observation creation"""

    @patch('workflow_telemetry.Langfuse')
    def test_create_generation_observation(self, mock_langfuse):
        """Should create generation observation"""
        mock_client = MagicMock()
        mock_trace = MagicMock()
        mock_langfuse.return_value = mock_client
        mock_client.trace.return_value = mock_trace
        
        create_step_generation(
            execution_id="test_123",
            step_name="Generate PRD",
            input_prompt="Create a PRD for...",
            output_text="# PRD...",
            model="claude-3-5-sonnet",
            tokens_input=100,
            tokens_output=500
        )
        
        # Should create generation observation
        mock_trace.generation.assert_called_once()

    @patch('workflow_telemetry.Langfuse')
    def test_create_generation_includes_token_usage(self, mock_langfuse):
        """Should include token usage in generation"""
        mock_client = MagicMock()
        mock_trace = MagicMock()
        mock_langfuse.return_value = mock_client
        mock_client.trace.return_value = mock_trace
        
        create_step_generation(
            execution_id="test_123",
            step_name="Generate PRD",
            input_prompt="Create a PRD",
            output_text="# PRD",
            model="claude-3-5-sonnet",
            tokens_input=100,
            tokens_output=500
        )
        
        call_args = mock_trace.generation.call_args
        usage = call_args[1].get('usage', {})
        assert usage.get('input') == 100 or usage.get('output') == 500


class TestScoreArtifact:
    """Test artifact scoring function"""

    @patch('workflow_telemetry.Langfuse')
    def test_score_artifact_adds_score(self, mock_langfuse):
        """Should add score to trace"""
        mock_client = MagicMock()
        mock_langfuse.return_value = mock_client
        
        score_artifact(
            execution_id="test_123",
            name="prd_completeness",
            value=9,
            comment="High quality PRD"
        )
        
        # Should call score method
        mock_client.score.assert_called_once()

    @patch('workflow_telemetry.Langfuse')
    def test_score_artifact_with_categorical_score(self, mock_langfuse):
        """Should handle categorical scores"""
        mock_client = MagicMock()
        mock_langfuse.return_value = mock_client
        
        score_artifact(
            execution_id="test_123",
            name="overall_quality",
            value="excellent",
            data_type="CATEGORICAL"
        )
        
        call_args = mock_client.score.call_args
        assert call_args[1]['value'] == "excellent"
        assert call_args[1].get('data_type') == "CATEGORICAL"

    @patch('workflow_telemetry.Langfuse')
    def test_score_artifact_with_boolean_score(self, mock_langfuse):
        """Should handle boolean scores"""
        mock_client = MagicMock()
        mock_langfuse.return_value = mock_client
        
        score_artifact(
            execution_id="test_123",
            name="has_security",
            value=True,
            data_type="BOOLEAN"
        )
        
        call_args = mock_client.score.call_args
        assert call_args[1]['value'] == True
        assert call_args[1].get('data_type') == "BOOLEAN"


class TestContextManagers:
    """Test context manager behavior"""

    @patch('workflow_telemetry.Langfuse')
    def test_observer_context_manager(self, mock_langfuse):
        """Observer should work as context manager"""
        mock_client = MagicMock()
        mock_langfuse.return_value = mock_client
        
        with WorkflowObserver(execution_id="test_123") as observer:
            assert observer is not None
        
        # Should flush on exit
        mock_client.flush.assert_called()

    @patch('workflow_telemetry.Langfuse')
    def test_observer_flushes_on_error(self, mock_langfuse):
        """Observer should flush even on error"""
        mock_client = MagicMock()
        mock_langfuse.return_value = mock_client
        
        with pytest.raises(ValueError):
            with WorkflowObserver(execution_id="test_123") as observer:
                raise ValueError("Test error")
        
        # Should still flush
        mock_client.flush.assert_called()


class TestIntegrationScenarios:
    """Test realistic usage scenarios"""

    @patch('workflow_telemetry.Langfuse')
    def test_complete_workflow_step(self, mock_langfuse):
        """Test complete workflow step with substeps"""
        mock_client = MagicMock()
        mock_trace = MagicMock()
        mock_langfuse.return_value = mock_client
        mock_client.trace.return_value = mock_trace
        
        @observe_workflow_step(step_name="Generate PRD", execution_id="test_123")
        def generate_prd():
            # Simulate substeps
            planning()
            execution()
            return "PRD content"
        
        @observe_substep(substep_name="planning")
        def planning():
            pass
        
        @observe_substep(substep_name="execution")
        def execution():
            pass
        
        result = generate_prd()
        assert result == "PRD content"

    @patch('workflow_telemetry.Langfuse')
    def test_workflow_with_scores(self, mock_langfuse):
        """Test workflow step with scoring"""
        mock_client = MagicMock()
        mock_trace = MagicMock()
        mock_langfuse.return_value = mock_client
        mock_client.trace.return_value = mock_trace
        
        # Generate artifact
        @observe_workflow_step(step_name="Generate PRD", execution_id="test_123")
        def generate_prd():
            return "PRD content"
        
        prd = generate_prd()
        
        # Score it
        score_artifact(
            execution_id="test_123",
            name="prd_completeness",
            value=9
        )
        
        # Verify score was added
        mock_client.score.assert_called()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


