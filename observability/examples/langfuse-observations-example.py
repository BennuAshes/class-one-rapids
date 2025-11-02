#!/usr/bin/env python3
"""
Example: Using Langfuse Observations for Detailed Tracking

Demonstrates how to:
1. Create nested observations for workflow steps
2. Track sub-steps within a workflow
3. Add metadata to observations
4. Track approval checkpoints

Prerequisites:
- Langfuse server running (docker-compose up in observability/)
- Set LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST env vars
"""

import sys
import time
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from workflow_telemetry import (
    WorkflowObserver,
    observe_workflow_step,
    observe_substep,
    track_approval_checkpoint,
    create_step_generation,
)


# Example workflow functions with observations
@observe_substep(substep_name="planning")
def plan_prd():
    """Plan PRD structure"""
    print("  └─ Planning PRD structure...")
    time.sleep(0.5)
    return ["Overview", "Goals", "Requirements", "Success Metrics"]


@observe_substep(substep_name="execution")
def execute_prd_generation(sections):
    """Execute PRD generation"""
    print("  └─ Generating PRD sections...")
    time.sleep(1.0)
    return f"# PRD\n" + "\n".join(f"## {s}" for s in sections)


@observe_substep(substep_name="validation")
def validate_prd(prd):
    """Validate PRD completeness"""
    print("  └─ Validating PRD...")
    time.sleep(0.3)
    return len(prd) > 100  # Simple validation


@observe_workflow_step(step_name="Generate PRD", execution_id="obs_demo")
def generate_prd_with_substeps():
    """Generate PRD with tracked sub-steps"""
    print("Step 1: Generate PRD")
    
    # Plan (substep 1)
    sections = plan_prd()
    
    # Execute (substep 2)
    prd = execute_prd_generation(sections)
    
    # Validate (substep 3)
    is_valid = validate_prd(prd)
    
    if is_valid:
        print("  ✓ PRD generated successfully")
    else:
        print("  ✗ PRD validation failed")
    
    return prd


@observe_workflow_step(step_name="Generate Design", execution_id="obs_demo")
def generate_design():
    """Generate design document"""
    print("Step 2: Generate Design")
    time.sleep(0.8)
    print("  ✓ Design generated")
    return "# Design Document\n..."


@observe_workflow_step(step_name="Generate Tasks", execution_id="obs_demo")
def generate_tasks():
    """Generate task list"""
    print("Step 3: Generate Tasks")
    time.sleep(0.6)
    print("  ✓ Tasks generated")
    return "# Task List\n..."


def simulate_approval_checkpoint(checkpoint_name, duration=2.0):
    """Simulate an approval checkpoint"""
    print(f"\nApproval Checkpoint: {checkpoint_name}")
    print(f"  Waiting for approval...")
    
    start_time = time.time()
    time.sleep(duration)  # Simulate waiting
    elapsed = time.time() - start_time
    
    # Track the approval checkpoint
    track_approval_checkpoint(
        execution_id="obs_demo",
        checkpoint=checkpoint_name,
        status="approved",
        duration_seconds=elapsed,
        reviewer="demo_user"
    )
    
    print(f"  ✓ Approved ({elapsed:.1f}s)")


def main():
    """Demonstrate observations and tracking"""
    print("=" * 70)
    print("Langfuse Observations Example")
    print("=" * 70)
    print()
    
    execution_id = "obs_demo"
    
    # Use WorkflowObserver as context manager
    with WorkflowObserver(execution_id=execution_id) as observer:
        # Create main workflow trace
        observer.create_trace(
            name="feature-to-code-workflow",
            metadata={
                "feature": "User Authentication",
                "demo": "observations-example"
            }
        )
        
        print("Starting workflow with detailed observations...")
        print()
        
        # Step 1: Generate PRD (with sub-steps)
        prd = generate_prd_with_substeps()
        
        # Track the LLM generation that created the PRD
        create_step_generation(
            execution_id=execution_id,
            step_name="PRD Generation LLM Call",
            input_prompt="Generate a PRD for user authentication...",
            output_text=prd,
            model="claude-3-5-sonnet-20241022",
            tokens_input=150,
            tokens_output=800
        )
        
        # Approval checkpoint after PRD
        simulate_approval_checkpoint("PRD Review", duration=1.0)
        
        print()
        
        # Step 2: Generate Design
        design = generate_design()
        
        # Track LLM generation for design
        create_step_generation(
            execution_id=execution_id,
            step_name="Design Generation LLM Call",
            input_prompt=f"Create design based on: {prd[:100]}...",
            output_text=design,
            model="claude-3-5-sonnet-20241022",
            tokens_input=900,
            tokens_output=1200
        )
        
        # Approval checkpoint after Design
        simulate_approval_checkpoint("Design Review", duration=0.8)
        
        print()
        
        # Step 3: Generate Tasks
        tasks = generate_tasks()
        
        # Track LLM generation for tasks
        create_step_generation(
            execution_id=execution_id,
            step_name="Tasks Generation LLM Call",
            input_prompt=f"Create tasks from design: {design[:100]}...",
            output_text=tasks,
            model="claude-3-5-sonnet-20241022",
            tokens_input=1300,
            tokens_output=600
        )
        
        # Final approval
        simulate_approval_checkpoint("Tasks Review", duration=0.7)
        
        print()
        print("=" * 70)
        print("✓ Workflow Complete!")
        print()
    
    # After context exits, data is flushed automatically
    print("Observations Details:")
    print("-" * 70)
    print("✓ Main trace: feature-to-code-workflow")
    print("✓ Step 1: Generate PRD")
    print("  ├─ Sub-step: planning")
    print("  ├─ Sub-step: execution")
    print("  ├─ Sub-step: validation")
    print("  └─ LLM Generation tracked (150 → 800 tokens)")
    print("✓ Approval Checkpoint: PRD Review (tracked)")
    print("✓ Step 2: Generate Design")
    print("  └─ LLM Generation tracked (900 → 1200 tokens)")
    print("✓ Approval Checkpoint: Design Review (tracked)")
    print("✓ Step 3: Generate Tasks")
    print("  └─ LLM Generation tracked (1300 → 600 tokens)")
    print("✓ Approval Checkpoint: Tasks Review (tracked)")
    print()
    print("=" * 70)
    print()
    print("View in Langfuse:")
    print(f"  URL: http://localhost:3000")
    print(f"  Session ID: {execution_id}")
    print()
    print("You can now:")
    print("  1. View the complete execution tree")
    print("  2. See timing for each step and sub-step")
    print("  3. Inspect LLM call details (tokens, costs)")
    print("  4. Analyze approval checkpoint durations")
    print("  5. Filter by step name or metadata")
    print("=" * 70)


if __name__ == "__main__":
    main()


