"""
Tests for Langfuse evaluator functions
Following TDD red-green-refactor methodology
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

from langfuse_evaluators import (
    evaluate_prd,
    evaluate_design,
    evaluate_tasks,
    PRDScore,
    DesignScore,
    TasksScore,
)


class TestPRDEvaluator:
    """Test PRD evaluation function"""

    @pytest.fixture
    def good_prd(self):
        """Load good PRD fixture"""
        fixtures_path = Path(__file__).parent / "fixtures" / "sample_prd_good.md"
        return fixtures_path.read_text(encoding='utf-8')

    @pytest.fixture
    def poor_prd(self):
        """Load poor PRD fixture"""
        fixtures_path = Path(__file__).parent / "fixtures" / "sample_prd_poor.md"
        return fixtures_path.read_text(encoding='utf-8')

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_prd_returns_score_object(self, mock_llm, good_prd):
        """Should return PRDScore object"""
        mock_llm.return_value = {
            "completeness": 9,
            "clarity": 8,
            "technical_depth": 7,
            "overall": "excellent"
        }
        
        result = evaluate_prd(good_prd)
        assert isinstance(result, PRDScore)

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_prd_has_all_scores(self, mock_llm, good_prd):
        """Should return all required scores"""
        mock_llm.return_value = {
            "completeness": 9,
            "clarity": 8,
            "technical_depth": 7,
            "overall": "excellent"
        }
        
        result = evaluate_prd(good_prd)
        assert hasattr(result, 'completeness')
        assert hasattr(result, 'clarity')
        assert hasattr(result, 'technical_depth')
        assert hasattr(result, 'overall')

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_prd_scores_in_range(self, mock_llm, good_prd):
        """Numeric scores should be 0-10"""
        mock_llm.return_value = {
            "completeness": 9,
            "clarity": 8,
            "technical_depth": 7,
            "overall": "excellent"
        }
        
        result = evaluate_prd(good_prd)
        assert 0 <= result.completeness <= 10
        assert 0 <= result.clarity <= 10
        assert 0 <= result.technical_depth <= 10

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_prd_overall_is_categorical(self, mock_llm, good_prd):
        """Overall score should be categorical"""
        mock_llm.return_value = {
            "completeness": 9,
            "clarity": 8,
            "technical_depth": 7,
            "overall": "excellent"
        }
        
        result = evaluate_prd(good_prd)
        valid_categories = ["excellent", "good", "needs_improvement", "poor"]
        assert result.overall in valid_categories

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_prd_good_scores_higher(self, mock_llm, good_prd, poor_prd):
        """Good PRD should score higher than poor PRD"""
        # First call for good PRD
        mock_llm.return_value = {
            "completeness": 9,
            "clarity": 8,
            "technical_depth": 7,
            "overall": "excellent"
        }
        good_result = evaluate_prd(good_prd)
        
        # Second call for poor PRD
        mock_llm.return_value = {
            "completeness": 3,
            "clarity": 2,
            "technical_depth": 1,
            "overall": "poor"
        }
        poor_result = evaluate_prd(poor_prd)
        
        assert good_result.completeness > poor_result.completeness
        assert good_result.clarity > poor_result.clarity

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_prd_handles_errors(self, mock_llm, good_prd):
        """Should handle LLM errors gracefully"""
        mock_llm.side_effect = Exception("API Error")
        
        with pytest.raises(Exception):
            evaluate_prd(good_prd)


class TestDesignEvaluator:
    """Test Design evaluation function"""

    @pytest.fixture
    def good_design(self):
        """Load good design fixture"""
        fixtures_path = Path(__file__).parent / "fixtures" / "sample_design_good.md"
        return fixtures_path.read_text(encoding='utf-8')

    @pytest.fixture
    def poor_design(self):
        """Load poor design fixture"""
        fixtures_path = Path(__file__).parent / "fixtures" / "sample_design_poor.md"
        return fixtures_path.read_text(encoding='utf-8')

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_design_returns_score_object(self, mock_llm, good_design):
        """Should return DesignScore object"""
        mock_llm.return_value = {
            "architecture": 9,
            "feasibility": 8,
            "completeness": 9,
            "has_security": True,
            "overall": "excellent"
        }
        
        result = evaluate_design(good_design)
        assert isinstance(result, DesignScore)

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_design_has_all_scores(self, mock_llm, good_design):
        """Should return all required scores"""
        mock_llm.return_value = {
            "architecture": 9,
            "feasibility": 8,
            "completeness": 9,
            "has_security": True,
            "overall": "excellent"
        }
        
        result = evaluate_design(good_design)
        assert hasattr(result, 'architecture')
        assert hasattr(result, 'feasibility')
        assert hasattr(result, 'completeness')
        assert hasattr(result, 'has_security')
        assert hasattr(result, 'overall')

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_design_has_security_is_boolean(self, mock_llm, good_design):
        """has_security should be boolean"""
        mock_llm.return_value = {
            "architecture": 9,
            "feasibility": 8,
            "completeness": 9,
            "has_security": True,
            "overall": "excellent"
        }
        
        result = evaluate_design(good_design)
        assert isinstance(result.has_security, bool)

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_design_good_has_security(self, mock_llm, good_design, poor_design):
        """Good design should have security section"""
        mock_llm.return_value = {
            "architecture": 9,
            "feasibility": 8,
            "completeness": 9,
            "has_security": True,
            "overall": "excellent"
        }
        good_result = evaluate_design(good_design)
        
        mock_llm.return_value = {
            "architecture": 3,
            "feasibility": 2,
            "completeness": 2,
            "has_security": False,
            "overall": "poor"
        }
        poor_result = evaluate_design(poor_design)
        
        assert good_result.has_security == True
        assert poor_result.has_security == False


class TestTasksEvaluator:
    """Test Tasks evaluation function"""

    @pytest.fixture
    def good_tasks(self):
        """Load good tasks fixture"""
        fixtures_path = Path(__file__).parent / "fixtures" / "sample_tasks_good.md"
        return fixtures_path.read_text(encoding='utf-8')

    @pytest.fixture
    def poor_tasks(self):
        """Load poor tasks fixture"""
        fixtures_path = Path(__file__).parent / "fixtures" / "sample_tasks_poor.md"
        return fixtures_path.read_text(encoding='utf-8')

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_tasks_returns_score_object(self, mock_llm, good_tasks):
        """Should return TasksScore object"""
        mock_llm.return_value = {
            "actionability": 9,
            "completeness": 8,
            "clarity": 9,
            "has_criteria": True,
            "overall": "excellent"
        }
        
        result = evaluate_tasks(good_tasks)
        assert isinstance(result, TasksScore)

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_tasks_has_all_scores(self, mock_llm, good_tasks):
        """Should return all required scores"""
        mock_llm.return_value = {
            "actionability": 9,
            "completeness": 8,
            "clarity": 9,
            "has_criteria": True,
            "overall": "excellent"
        }
        
        result = evaluate_tasks(good_tasks)
        assert hasattr(result, 'actionability')
        assert hasattr(result, 'completeness')
        assert hasattr(result, 'clarity')
        assert hasattr(result, 'has_criteria')
        assert hasattr(result, 'overall')

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_tasks_has_criteria_is_boolean(self, mock_llm, good_tasks):
        """has_criteria should be boolean"""
        mock_llm.return_value = {
            "actionability": 9,
            "completeness": 8,
            "clarity": 9,
            "has_criteria": True,
            "overall": "excellent"
        }
        
        result = evaluate_tasks(good_tasks)
        assert isinstance(result.has_criteria, bool)

    @patch('langfuse_evaluators.call_llm_judge')
    def test_evaluate_tasks_good_scores_higher(self, mock_llm, good_tasks, poor_tasks):
        """Good tasks should score higher than poor tasks"""
        mock_llm.return_value = {
            "actionability": 9,
            "completeness": 8,
            "clarity": 9,
            "has_criteria": True,
            "overall": "excellent"
        }
        good_result = evaluate_tasks(good_tasks)
        
        mock_llm.return_value = {
            "actionability": 2,
            "completeness": 1,
            "clarity": 2,
            "has_criteria": False,
            "overall": "poor"
        }
        poor_result = evaluate_tasks(poor_tasks)
        
        assert good_result.actionability > poor_result.actionability
        assert good_result.completeness > poor_result.completeness


class TestScoreDataClasses:
    """Test score data class structure"""

    def test_prd_score_has_to_dict(self):
        """PRDScore should be convertible to dict"""
        score = PRDScore(
            completeness=9,
            clarity=8,
            technical_depth=7,
            overall="excellent"
        )
        result = score.to_dict()
        assert isinstance(result, dict)
        assert result['completeness'] == 9

    def test_design_score_has_to_dict(self):
        """DesignScore should be convertible to dict"""
        score = DesignScore(
            architecture=9,
            feasibility=8,
            completeness=9,
            has_security=True,
            overall="excellent"
        )
        result = score.to_dict()
        assert isinstance(result, dict)
        assert result['has_security'] == True

    def test_tasks_score_has_to_dict(self):
        """TasksScore should be convertible to dict"""
        score = TasksScore(
            actionability=9,
            completeness=8,
            clarity=9,
            has_criteria=True,
            overall="excellent"
        )
        result = score.to_dict()
        assert isinstance(result, dict)
        assert result['has_criteria'] == True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

