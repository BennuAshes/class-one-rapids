"""
Langfuse evaluator functions for artifact quality assessment

Uses LLM-as-judge to evaluate PRDs, Technical Designs, and Task Lists.
"""

import json
import os
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional
import anthropic

from judge_prompts import (
    format_prd_judge_prompt,
    format_design_judge_prompt,
    format_tasks_judge_prompt,
)


@dataclass
class PRDScore:
    """Score data class for PRD evaluation"""
    completeness: int
    clarity: int
    technical_depth: int
    overall: str
    reasoning: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return asdict(self)


@dataclass
class DesignScore:
    """Score data class for Design evaluation"""
    architecture: int
    feasibility: int
    completeness: int
    has_security: bool
    overall: str
    reasoning: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return asdict(self)


@dataclass
class TasksScore:
    """Score data class for Tasks evaluation"""
    actionability: int
    completeness: int
    clarity: int
    has_criteria: bool
    overall: str
    reasoning: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return asdict(self)


def call_llm_judge(prompt: str, model: str = "claude-3-5-sonnet-20241022") -> Dict[str, Any]:
    """
    Call LLM to evaluate content based on prompt
    
    Args:
        prompt: The evaluation prompt with content
        model: Model to use for evaluation
        
    Returns:
        Dictionary with evaluation scores
        
    Raises:
        Exception: If API call fails or response is invalid
    """
    # Get API key from environment
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable not set")
    
    # Initialize client
    client = anthropic.Anthropic(api_key=api_key)
    
    # Call API
    try:
        message = client.messages.create(
            model=model,
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,  # Lower temperature for more consistent evaluations
        )
        
        # Extract response text
        response_text = message.content[0].text
        
        # Parse JSON response
        # Try to extract JSON from response (in case LLM adds extra text)
        if "```json" in response_text:
            # Extract JSON from code block
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            json_str = response_text[json_start:json_end].strip()
        elif "{" in response_text and "}" in response_text:
            # Extract JSON object
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1
            json_str = response_text[json_start:json_end]
        else:
            json_str = response_text
        
        result = json.loads(json_str)
        return result
        
    except Exception as e:
        raise Exception(f"LLM judge evaluation failed: {str(e)}")


def evaluate_prd(prd_content: str, model: str = "claude-3-5-sonnet-20241022") -> PRDScore:
    """
    Evaluate PRD quality using LLM-as-judge
    
    Args:
        prd_content: The PRD text to evaluate
        model: Model to use for evaluation
        
    Returns:
        PRDScore object with evaluation results
    """
    prompt = format_prd_judge_prompt(prd_content)
    result = call_llm_judge(prompt, model)
    
    return PRDScore(
        completeness=result['completeness'],
        clarity=result['clarity'],
        technical_depth=result['technical_depth'],
        overall=result['overall'],
        reasoning=result.get('reasoning')
    )


def evaluate_design(design_content: str, model: str = "claude-3-5-sonnet-20241022") -> DesignScore:
    """
    Evaluate Design quality using LLM-as-judge
    
    Args:
        design_content: The design document text to evaluate
        model: Model to use for evaluation
        
    Returns:
        DesignScore object with evaluation results
    """
    prompt = format_design_judge_prompt(design_content)
    result = call_llm_judge(prompt, model)
    
    return DesignScore(
        architecture=result['architecture'],
        feasibility=result['feasibility'],
        completeness=result['completeness'],
        has_security=result['has_security'],
        overall=result['overall'],
        reasoning=result.get('reasoning')
    )


def evaluate_tasks(tasks_content: str, model: str = "claude-3-5-sonnet-20241022") -> TasksScore:
    """
    Evaluate Tasks quality using LLM-as-judge
    
    Args:
        tasks_content: The task list text to evaluate
        model: Model to use for evaluation
        
    Returns:
        TasksScore object with evaluation results
    """
    prompt = format_tasks_judge_prompt(tasks_content)
    result = call_llm_judge(prompt, model)
    
    return TasksScore(
        actionability=result['actionability'],
        completeness=result['completeness'],
        clarity=result['clarity'],
        has_criteria=result['has_criteria'],
        overall=result['overall'],
        reasoning=result.get('reasoning')
    )

