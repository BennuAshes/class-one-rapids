"""
Tests for LLM-as-Judge prompt templates
Following TDD red-green-refactor methodology
"""

import pytest
import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

from judge_prompts import (
    PRD_JUDGE_PROMPT,
    DESIGN_JUDGE_PROMPT,
    TASKS_JUDGE_PROMPT,
    format_prd_judge_prompt,
    format_design_judge_prompt,
    format_tasks_judge_prompt,
)


class TestPromptTemplates:
    """Test that prompt templates are properly defined"""

    def test_prd_prompt_exists(self):
        """PRD judge prompt template should exist"""
        assert PRD_JUDGE_PROMPT is not None
        assert len(PRD_JUDGE_PROMPT) > 0

    def test_design_prompt_exists(self):
        """Design judge prompt template should exist"""
        assert DESIGN_JUDGE_PROMPT is not None
        assert len(DESIGN_JUDGE_PROMPT) > 0

    def test_tasks_prompt_exists(self):
        """Tasks judge prompt template should exist"""
        assert TASKS_JUDGE_PROMPT is not None
        assert len(TASKS_JUDGE_PROMPT) > 0

    def test_prd_prompt_has_placeholders(self):
        """PRD prompt should have content placeholder"""
        assert "{prd_content}" in PRD_JUDGE_PROMPT

    def test_design_prompt_has_placeholders(self):
        """Design prompt should have content placeholder"""
        assert "{design_content}" in DESIGN_JUDGE_PROMPT

    def test_tasks_prompt_has_placeholders(self):
        """Tasks prompt should have content placeholder"""
        assert "{tasks_content}" in TASKS_JUDGE_PROMPT


class TestPromptFormatting:
    """Test prompt formatting functions"""

    def test_format_prd_prompt_basic(self):
        """Should format PRD prompt with content"""
        content = "Sample PRD content"
        result = format_prd_judge_prompt(content)
        
        assert content in result
        assert "{prd_content}" not in result  # Placeholder should be replaced

    def test_format_design_prompt_basic(self):
        """Should format design prompt with content"""
        content = "Sample design content"
        result = format_design_judge_prompt(content)
        
        assert content in result
        assert "{design_content}" not in result

    def test_format_tasks_prompt_basic(self):
        """Should format tasks prompt with content"""
        content = "Sample tasks content"
        result = format_tasks_judge_prompt(content)
        
        assert content in result
        assert "{tasks_content}" not in result

    def test_format_prd_prompt_with_long_content(self):
        """Should handle long PRD content"""
        content = "x" * 10000  # 10K characters
        result = format_prd_judge_prompt(content)
        assert content in result

    def test_format_prd_prompt_with_special_chars(self):
        """Should handle special characters in content"""
        content = "PRD with {braces} and $pecial ch@rs!"
        result = format_prd_judge_prompt(content)
        assert content in result


class TestPromptStructure:
    """Test that prompts have required structure"""

    def test_prd_prompt_requests_json(self):
        """PRD prompt should request JSON response"""
        assert "json" in PRD_JUDGE_PROMPT.lower() or "JSON" in PRD_JUDGE_PROMPT

    def test_design_prompt_requests_json(self):
        """Design prompt should request JSON response"""
        assert "json" in DESIGN_JUDGE_PROMPT.lower() or "JSON" in DESIGN_JUDGE_PROMPT

    def test_tasks_prompt_requests_json(self):
        """Tasks prompt should request JSON response"""
        assert "json" in TASKS_JUDGE_PROMPT.lower() or "JSON" in TASKS_JUDGE_PROMPT

    def test_prd_prompt_has_scoring_criteria(self):
        """PRD prompt should mention scoring criteria"""
        prompt_lower = PRD_JUDGE_PROMPT.lower()
        assert "completeness" in prompt_lower or "clarity" in prompt_lower

    def test_design_prompt_has_scoring_criteria(self):
        """Design prompt should mention scoring criteria"""
        prompt_lower = DESIGN_JUDGE_PROMPT.lower()
        assert "architecture" in prompt_lower or "feasibility" in prompt_lower

    def test_tasks_prompt_has_scoring_criteria(self):
        """Tasks prompt should mention scoring criteria"""
        prompt_lower = TASKS_JUDGE_PROMPT.lower()
        assert "actionability" in prompt_lower or "clarity" in prompt_lower


class TestPromptConsistency:
    """Test consistency across prompts"""

    def test_all_prompts_use_010_scale(self):
        """All prompts should use 0-10 scoring scale"""
        assert "0-10" in PRD_JUDGE_PROMPT or "0 to 10" in PRD_JUDGE_PROMPT
        assert "0-10" in DESIGN_JUDGE_PROMPT or "0 to 10" in DESIGN_JUDGE_PROMPT
        assert "0-10" in TASKS_JUDGE_PROMPT or "0 to 10" in TASKS_JUDGE_PROMPT

    def test_all_prompts_have_overall_quality(self):
        """All prompts should request overall quality assessment"""
        assert "overall" in PRD_JUDGE_PROMPT.lower()
        assert "overall" in DESIGN_JUDGE_PROMPT.lower()
        assert "overall" in TASKS_JUDGE_PROMPT.lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


