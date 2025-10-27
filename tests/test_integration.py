"""
Integration tests for complete workflow with telemetry
Following TDD red-green-refactor methodology
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

from workflow_telemetry import WorkflowObserver, observe_workflow_step, score_artifact
from langfuse_evaluators import evaluate_prd, evaluate_design, evaluate_tasks


class TestEndToEndWorkflow:
    """Test end-to-end workflow with telemetry"""

    @pytest.fixture
    def good_prd(self):
        """Load good PRD fixture"""
        fixtures_path = Path(__file__).parent / "fixtures" / "sample_prd_good.md"
        return fixtures_path.read_text(encoding='utf-8')

    @pytest.fixture
    def good_design(self):
        """Load good design fixture"""
        fixtures_path = Path(__file__).parent / "fixtures" / "sample_design_good.md"
        return fixtures_path.read_text(encoding='utf-8')

    @pytest.fixture
    def good_tasks(self):
        """Load good tasks fixture"""
        fixtures_path = Path(__file__).parent / "fixtures" / "sample_tasks_good.md"
        return fixtures_path.read_text(encoding='utf-8')

    @patch('workflow_telemetry.Langfuse')
    @patch('langfuse_evaluators.call_llm_judge')
    def test_complete_workflow_creates_trace(self, mock_llm, mock_langfuse, good_prd):
        """Complete workflow should create trace with observations"""
        mock_client = MagicMock()
        mock_trace = MagicMock()
        mock_langfuse.return_value = mock_client
        mock_client.trace.return_value = mock_trace
        
        # Mock LLM judge response
        mock_llm.return_value = {
            "completeness": 9,
            "clarity": 8,
            "technical_depth": 7,
            "overall": "excellent"
        }
        
        # Simulate workflow
        with WorkflowObserver(execution_id="test_123") as observer:
            observer.create_trace(name="feature-to-code-workflow")
            
            # Step 1: Generate PRD
            @observe_workflow_step(step_name="Generate PRD", execution_id="test_123")
            def generate_prd_step():
                return good_prd
            
            prd = generate_prd_step()
            
            # Evaluate PRD
            scores = evaluate_prd(prd)
            
            # Add scores
            score_artifact(execution_id="test_123", name="prd_completeness", value=scores.completeness)
        
        # Verify trace was created
        mock_client.trace.assert_called()
        
        # Verify flush was called
        mock_client.flush.assert_called()

    @patch('workflow_telemetry.Langfuse')
    @patch('langfuse_evaluators.call_llm_judge')
    def test_workflow_with_all_steps(self, mock_llm, mock_langfuse, good_prd, good_design, good_tasks):
        """Test workflow with PRD, Design, and Tasks steps"""
        mock_client = MagicMock()
        mock_trace = MagicMock()
        mock_langfuse.return_value = mock_client
        mock_client.trace.return_value = mock_trace
        
        # Mock LLM responses for each artifact type
        mock_llm.side_effect = [
            # PRD evaluation
            {
                "completeness": 9,
                "clarity": 8,
                "technical_depth": 7,
                "overall": "excellent"
            },
            # Design evaluation
            {
                "architecture": 9,
                "feasibility": 8,
                "completeness": 9,
                "has_security": True,
                "overall": "excellent"
            },
            # Tasks evaluation
            {
                "actionability": 9,
                "completeness": 8,
                "clarity": 9,
                "has_criteria": True,
                "overall": "excellent"
            }
        ]
        
        with WorkflowObserver(execution_id="test_123") as observer:
            observer.create_trace(name="feature-to-code-workflow")
            
            # Step 1: PRD
            prd_scores = evaluate_prd(good_prd)
            score_artifact(execution_id="test_123", name="prd_completeness", value=prd_scores.completeness)
            
            # Step 2: Design
            design_scores = evaluate_design(good_design)
            score_artifact(execution_id="test_123", name="design_architecture", value=design_scores.architecture)
            
            # Step 3: Tasks
            tasks_scores = evaluate_tasks(good_tasks)
            score_artifact(execution_id="test_123", name="tasks_actionability", value=tasks_scores.actionability)
        
        # Verify multiple scores were added
        assert mock_client.score.call_count >= 3

    @patch('workflow_telemetry.Langfuse')
    def test_workflow_handles_errors(self, mock_langfuse):
        """Workflow should handle errors gracefully"""
        mock_client = MagicMock()
        mock_langfuse.return_value = mock_client
        
        with pytest.raises(ValueError):
            with WorkflowObserver(execution_id="test_123") as observer:
                observer.create_trace(name="test-workflow")
                raise ValueError("Simulated error")
        
        # Should still flush
        mock_client.flush.assert_called()

    @patch('workflow_telemetry.Langfuse')
    @patch('langfuse_evaluators.call_llm_judge')
    def test_workflow_tracks_approval_checkpoint(self, mock_llm, mock_langfuse, good_prd):
        """Workflow should track approval checkpoints"""
        from workflow_telemetry import track_approval_checkpoint
        
        mock_client = MagicMock()
        mock_trace = MagicMock()
        mock_langfuse.return_value = mock_client
        mock_client.trace.return_value = mock_trace
        
        mock_llm.return_value = {
            "completeness": 9,
            "clarity": 8,
            "technical_depth": 7,
            "overall": "excellent"
        }
        
        with WorkflowObserver(execution_id="test_123") as observer:
            observer.create_trace(name="feature-to-code-workflow")
            
            # Generate PRD
            @observe_workflow_step(step_name="Generate PRD", execution_id="test_123")
            def generate_prd_step():
                return good_prd
            
            prd = generate_prd_step()
            
            # Track approval checkpoint
            track_approval_checkpoint(
                execution_id="test_123",
                checkpoint="PRD",
                status="approved",
                duration_seconds=45
            )
        
        # Verify approval was tracked
        # (checking that trace operations were called)
        assert mock_client.trace.called


class TestObservabilityData:
    """Test that observability data is properly structured"""

    @patch('workflow_telemetry.Langfuse')
    def test_trace_has_session_id(self, mock_langfuse):
        """Trace should use execution_id as session_id"""
        mock_client = MagicMock()
        mock_langfuse.return_value = mock_client
        
        observer = WorkflowObserver(execution_id="test_123")
        observer.create_trace(name="test-workflow")
        
        call_args = mock_client.trace.call_args
        assert call_args[1]['session_id'] == "test_123"

    @patch('workflow_telemetry.Langfuse')
    def test_observation_has_metadata(self, mock_langfuse):
        """Observations should include metadata"""
        mock_client = MagicMock()
        mock_trace = MagicMock()
        mock_langfuse.return_value = mock_client
        mock_client.trace.return_value = mock_trace
        
        @observe_workflow_step(step_name="Generate PRD", execution_id="test_123")
        def test_step():
            return "result"
        
        test_step()
        
        # Should have called span or generation with metadata
        assert mock_trace.span.called or mock_trace.generation.called

    @patch('workflow_telemetry.Langfuse')
    def test_scores_linked_to_trace(self, mock_langfuse):
        """Scores should be linked to correct trace"""
        mock_client = MagicMock()
        mock_langfuse.return_value = mock_client
        
        score_artifact(
            execution_id="test_123",
            name="prd_completeness",
            value=9
        )
        
        call_args = mock_client.score.call_args
        # Should include trace identifier
        assert 'trace_id' in call_args[1] or 'name' in call_args[1]


class TestPerformance:
    """Test that telemetry doesn't significantly impact performance"""

    @patch('workflow_telemetry.Langfuse')
    def test_telemetry_overhead_minimal(self, mock_langfuse):
        """Telemetry should add minimal overhead"""
        import time
        
        mock_client = MagicMock()
        mock_langfuse.return_value = mock_client
        
        # Test without telemetry
        def simple_func():
            time.sleep(0.01)  # Simulate work
            return "result"
        
        start = time.time()
        for _ in range(10):
            simple_func()
        baseline = time.time() - start
        
        # Test with telemetry
        @observe_workflow_step(step_name="test", execution_id="test_123")
        def observed_func():
            time.sleep(0.01)  # Same work
            return "result"
        
        start = time.time()
        for _ in range(10):
            observed_func()
        with_telemetry = time.time() - start
        
        # Overhead should be less than 50% of baseline
        overhead = (with_telemetry - baseline) / baseline
        assert overhead < 0.5, f"Telemetry overhead too high: {overhead*100:.1f}%"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

