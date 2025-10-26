#!/usr/bin/env python3
"""
Langfuse Tracing Example - Python
Demonstrates how to use Langfuse SDK for direct tracing

Prerequisites:
  pip install langfuse

Environment Variables (already set by feature-to-code.sh):
  LANGFUSE_PUBLIC_KEY
  LANGFUSE_SECRET_KEY
  LANGFUSE_HOST
"""

import os
import time
from langfuse import Langfuse
from langfuse.decorators import observe, langfuse_context

# Initialize Langfuse client
# Uses environment variables: LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST
langfuse = Langfuse()


# Example 1: Using @observe decorator (simplest approach)
@observe()
def generate_prd(feature_description: str) -> str:
    """Generate a Product Requirements Document"""
    # Simulate work
    time.sleep(0.5)

    # Add metadata to the current span
    langfuse_context.update_current_observation(
        metadata={"feature": feature_description, "step": "prd"},
        tags=["workflow", "documentation"]
    )

    return f"PRD for: {feature_description}"


@observe()
def generate_design(prd: str) -> str:
    """Generate a Technical Design Document"""
    time.sleep(0.5)

    langfuse_context.update_current_observation(
        metadata={"step": "design"},
        tags=["workflow", "design"]
    )

    return f"Design based on: {prd}"


@observe()
def generate_tasks(design: str) -> list:
    """Generate task list from design"""
    time.sleep(0.5)

    langfuse_context.update_current_observation(
        metadata={"step": "tasks"},
        tags=["workflow", "tasks"]
    )

    return ["Task 1", "Task 2", "Task 3"]


# Example 2: Manual trace creation (more control)
def feature_workflow_manual(feature_description: str, execution_id: str):
    """
    Example of manual trace creation with explicit span control
    """
    # Create a trace
    trace = langfuse.trace(
        name="feature-to-code-workflow",
        user_id="script-runner",
        session_id=execution_id,
        metadata={
            "execution_id": execution_id,
            "feature": feature_description
        },
        tags=["workflow", "feature-to-code"]
    )

    # Step 1: PRD Generation
    prd_span = trace.span(
        name="generate-prd",
        metadata={"step": "1/5"},
        tags=["prd", "documentation"]
    )
    prd_result = f"PRD for: {feature_description}"
    time.sleep(0.5)
    prd_span.end(output=prd_result)

    # Step 2: Design Generation
    design_span = trace.span(
        name="generate-design",
        metadata={"step": "2/5"},
        tags=["design", "technical"]
    )
    design_result = f"Design for: {feature_description}"
    time.sleep(0.5)
    design_span.end(output=design_result)

    # Step 3: Task Generation
    task_span = trace.span(
        name="generate-tasks",
        metadata={"step": "3/5"},
        tags=["tasks"]
    )
    tasks = ["Task 1", "Task 2", "Task 3"]
    time.sleep(0.5)
    task_span.end(output={"tasks": tasks, "count": len(tasks)})

    # End the trace
    trace.update(
        output={"status": "completed", "tasks": tasks}
    )

    print(f"✓ Trace created: {trace.id}")
    print(f"  View at: {os.getenv('LANGFUSE_HOST', 'http://localhost:3000')}")


# Example 3: Using @observe with automatic workflow tracing
@observe()
def feature_workflow_decorated(feature_description: str, execution_id: str):
    """
    Full workflow using decorators - traces are automatically nested
    """
    # Update root trace
    langfuse_context.update_current_trace(
        session_id=execution_id,
        user_id="script-runner",
        tags=["workflow", "automated"]
    )

    print(f"Starting workflow for: {feature_description}")

    # Each decorated function becomes a child span
    prd = generate_prd(feature_description)
    print(f"✓ Generated PRD")

    design = generate_design(prd)
    print(f"✓ Generated Design")

    tasks = generate_tasks(design)
    print(f"✓ Generated {len(tasks)} tasks")

    return {
        "status": "completed",
        "execution_id": execution_id,
        "tasks": tasks
    }


# Example 4: LLM call tracing (for when you make actual LLM calls)
@observe()
def call_llm_with_tracing(prompt: str, model: str = "claude-3-5-sonnet"):
    """
    Example of tracing an LLM call
    This would be used when you're calling Claude API directly
    """
    # Simulate LLM call
    time.sleep(1)
    response = f"Response to: {prompt[:50]}..."

    # Record the LLM call with Langfuse
    langfuse_context.update_current_observation(
        input=prompt,
        output=response,
        model=model,
        metadata={
            "provider": "anthropic",
            "temperature": 0.7
        },
        # Optional: track token usage if available
        usage={
            "input": 100,
            "output": 200,
            "total": 300,
            "unit": "TOKENS"
        }
    )

    return response


if __name__ == "__main__":
    import datetime

    execution_id = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    feature = "User authentication with OAuth2"

    print("=" * 50)
    print("Langfuse Tracing Examples")
    print("=" * 50)
    print()

    # Example 1: Decorated workflow (recommended for most cases)
    print("Running decorated workflow...")
    result = feature_workflow_decorated(feature, execution_id)
    print(f"Result: {result}")
    print()

    # Example 2: Manual trace creation
    print("Running manual workflow...")
    feature_workflow_manual(feature, f"{execution_id}_manual")
    print()

    # Example 3: LLM call tracing
    print("Simulating LLM call...")
    llm_response = call_llm_with_tracing(f"Generate a PRD for: {feature}")
    print(f"LLM Response: {llm_response}")
    print()

    # Flush all pending traces to Langfuse
    langfuse.flush()

    print("=" * 50)
    print(f"✓ All traces sent to Langfuse!")
    print(f"View at: http://localhost:3000")
    print(f"Search for execution_id: {execution_id}")
    print("=" * 50)
