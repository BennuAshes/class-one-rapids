"""
Parallel step execution service with dependency graph support.

Enables concurrent execution of independent workflow steps for
significant performance improvements.
"""

import asyncio
from typing import Dict, List, Set, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum

from ..types import StepName, StepStatus, WorkflowState, StepResult


@dataclass
class StepDependency:
    """Defines dependencies between workflow steps."""
    step: StepName
    depends_on: List[StepName]
    can_parallel_with: List[StepName] = None

    def __post_init__(self):
        if self.can_parallel_with is None:
            self.can_parallel_with = []


class ExecutionStrategy(str, Enum):
    """Execution strategies for workflow steps."""
    SEQUENTIAL = "sequential"  # Traditional linear execution
    PARALLEL = "parallel"      # Maximum parallelism where possible
    SMART = "smart"           # Adaptive based on resources and history


class ParallelExecutionService:
    """
    Manages parallel execution of workflow steps.

    Features:
    - Dependency graph resolution
    - Concurrent execution management
    - Resource-aware scheduling
    - Progress tracking
    """

    # Default dependency graph
    DEFAULT_DEPENDENCIES = [
        StepDependency(
            step=StepName.GENERATE_PRD,
            depends_on=[],
            can_parallel_with=[]  # PRD variants could run in parallel
        ),
        StepDependency(
            step=StepName.GENERATE_DESIGN,
            depends_on=[StepName.GENERATE_PRD],
            can_parallel_with=[]
        ),
        StepDependency(
            step=StepName.GENERATE_TASKS,
            depends_on=[StepName.GENERATE_DESIGN],
            can_parallel_with=[]
        ),
        StepDependency(
            step=StepName.EXECUTE_TASKS,
            depends_on=[StepName.GENERATE_TASKS],
            can_parallel_with=[]
        ),
        StepDependency(
            step=StepName.GENERATE_SUMMARY,
            depends_on=[StepName.EXECUTE_TASKS],
            can_parallel_with=[]
        )
    ]

    def __init__(
        self,
        strategy: ExecutionStrategy = ExecutionStrategy.SEQUENTIAL,
        max_concurrent: int = 3
    ):
        """
        Initialize parallel execution service.

        Args:
            strategy: Execution strategy to use
            max_concurrent: Maximum concurrent executions
        """
        self.strategy = strategy
        self.max_concurrent = max_concurrent
        self.dependencies = {dep.step: dep for dep in self.DEFAULT_DEPENDENCIES}
        self.execution_times: Dict[StepName, float] = {}

    def get_execution_groups(self, state: WorkflowState) -> List[List[StepName]]:
        """
        Get groups of steps that can be executed in parallel.

        Args:
            state: Current workflow state

        Returns:
            List of step groups, each group can be executed in parallel
        """
        if self.strategy == ExecutionStrategy.SEQUENTIAL:
            # Return each step in its own group for sequential execution
            return [[step] for step in StepName]

        # Get pending steps
        pending_steps = set()
        completed_steps = set()

        for step in state.steps:
            if step.status == StepStatus.PENDING:
                pending_steps.add(step.name)
            elif step.status in [StepStatus.COMPLETED, StepStatus.RETRY_COMPLETED]:
                completed_steps.add(step.name)

        # Build execution groups based on dependencies
        groups = []
        remaining = pending_steps.copy()

        while remaining:
            current_group = []

            for step in remaining:
                dep = self.dependencies.get(step)
                if not dep:
                    continue

                # Check if all dependencies are satisfied
                if all(dep_step in completed_steps for dep_step in dep.depends_on):
                    current_group.append(step)

            if not current_group:
                # No steps can be executed, might be a dependency issue
                print(f"⚠️  Warning: Cannot resolve dependencies for steps: {remaining}")
                break

            groups.append(current_group)

            # Mark current group as completed for next iteration
            for step in current_group:
                completed_steps.add(step)
                remaining.remove(step)

        return groups

    async def execute_parallel_group(
        self,
        steps: List[StepName],
        executor_func: Any,
        state: WorkflowState
    ) -> List[Tuple[StepName, StepResult]]:
        """
        Execute a group of steps in parallel.

        Args:
            steps: Steps to execute in parallel
            executor_func: Function to execute each step
            state: Current workflow state

        Returns:
            List of (step_name, result) tuples
        """
        if len(steps) == 1:
            # Single step, no parallelism needed
            result = await executor_func(state, steps[0])
            return [(steps[0], result)]

        print(f"🚀 Executing {len(steps)} steps in parallel: {', '.join(s.value for s in steps)}")

        # Create tasks for parallel execution
        tasks = []
        for step in steps:
            task = asyncio.create_task(executor_func(state, step))
            tasks.append((step, task))

        # Use semaphore to limit concurrent executions
        semaphore = asyncio.Semaphore(self.max_concurrent)

        async def execute_with_limit(step_name, task):
            async with semaphore:
                result = await task
                return (step_name, result)

        # Execute all tasks
        results = await asyncio.gather(
            *[execute_with_limit(step, task) for step, task in tasks],
            return_exceptions=True
        )

        # Process results
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"❌ Error in parallel execution of {steps[i].value}: {result}")
                # Create failure result
                failure_result = StepResult(
                    success=False,
                    error_message=str(result),
                    duration_seconds=0
                )
                processed_results.append((steps[i], failure_result))
            else:
                processed_results.append(result)

        return processed_results

    def can_parallelize(self, step1: StepName, step2: StepName) -> bool:
        """
        Check if two steps can be executed in parallel.

        Args:
            step1: First step
            step2: Second step

        Returns:
            True if steps can run in parallel
        """
        dep1 = self.dependencies.get(step1)
        dep2 = self.dependencies.get(step2)

        if not dep1 or not dep2:
            return False

        # Check explicit parallel compatibility
        if step2 in dep1.can_parallel_with or step1 in dep2.can_parallel_with:
            return True

        # Check if they have the same dependencies (siblings)
        if set(dep1.depends_on) == set(dep2.depends_on):
            return True

        # Check if one depends on the other
        if step1 in dep2.depends_on or step2 in dep1.depends_on:
            return False

        return False

    def update_execution_time(self, step: StepName, duration: float):
        """
        Update execution time for a step (for smart scheduling).

        Args:
            step: Step that was executed
            duration: Execution duration in seconds
        """
        # Use exponential moving average
        alpha = 0.3
        if step in self.execution_times:
            self.execution_times[step] = (
                alpha * duration + (1 - alpha) * self.execution_times[step]
            )
        else:
            self.execution_times[step] = duration

    def get_estimated_time(self, steps: List[StepName]) -> float:
        """
        Get estimated execution time for a group of steps.

        Args:
            steps: Steps to estimate

        Returns:
            Estimated time in seconds
        """
        if self.strategy == ExecutionStrategy.SEQUENTIAL:
            # Sum all times for sequential
            return sum(self.execution_times.get(s, 60) for s in steps)
        else:
            # Max time for parallel (bottleneck)
            return max(self.execution_times.get(s, 60) for s in steps) if steps else 0

    def optimize_groups(self, groups: List[List[StepName]]) -> List[List[StepName]]:
        """
        Optimize execution groups based on historical data.

        Args:
            groups: Initial groups from dependency analysis

        Returns:
            Optimized groups for better performance
        """
        if self.strategy != ExecutionStrategy.SMART:
            return groups

        optimized = []

        for group in groups:
            if len(group) <= 1:
                optimized.append(group)
                continue

            # Sort by estimated execution time (longest first)
            sorted_steps = sorted(
                group,
                key=lambda s: self.execution_times.get(s, 60),
                reverse=True
            )

            # Balance into subgroups if too many steps
            if len(sorted_steps) > self.max_concurrent:
                # Split into balanced subgroups
                subgroups = [[] for _ in range(self.max_concurrent)]
                subgroup_times = [0.0] * self.max_concurrent

                for step in sorted_steps:
                    # Add to subgroup with least total time
                    min_idx = subgroup_times.index(min(subgroup_times))
                    subgroups[min_idx].append(step)
                    subgroup_times[min_idx] += self.execution_times.get(step, 60)

                # Add non-empty subgroups
                for subgroup in subgroups:
                    if subgroup:
                        optimized.append(subgroup)
            else:
                optimized.append(sorted_steps)

        return optimized


# Enhanced dependency configurations for different scenarios

class ParallelWorkflowConfigs:
    """Pre-defined configurations for different parallel execution scenarios."""

    @staticmethod
    def experimental_parallel() -> List[StepDependency]:
        """
        Experimental configuration with multiple PRD/Design variants.

        Generates multiple alternatives in parallel for better quality.
        """
        return [
            # Generate 3 PRD variants in parallel
            StepDependency(
                step="PRD_v1",
                depends_on=[],
                can_parallel_with=["PRD_v2", "PRD_v3"]
            ),
            StepDependency(
                step="PRD_v2",
                depends_on=[],
                can_parallel_with=["PRD_v1", "PRD_v3"]
            ),
            StepDependency(
                step="PRD_v3",
                depends_on=[],
                can_parallel_with=["PRD_v1", "PRD_v2"]
            ),
            # Select best PRD
            StepDependency(
                step="PRD_selection",
                depends_on=["PRD_v1", "PRD_v2", "PRD_v3"],
                can_parallel_with=[]
            ),
            # Continue with selected PRD
            StepDependency(
                step=StepName.GENERATE_DESIGN,
                depends_on=["PRD_selection"],
                can_parallel_with=[]
            ),
            # Rest follows standard flow
            StepDependency(
                step=StepName.GENERATE_TASKS,
                depends_on=[StepName.GENERATE_DESIGN],
                can_parallel_with=[]
            ),
            StepDependency(
                step=StepName.EXECUTE_TASKS,
                depends_on=[StepName.GENERATE_TASKS],
                can_parallel_with=[]
            ),
            StepDependency(
                step=StepName.GENERATE_SUMMARY,
                depends_on=[StepName.EXECUTE_TASKS],
                can_parallel_with=[]
            )
        ]

    @staticmethod
    def research_heavy() -> List[StepDependency]:
        """
        Configuration for research-heavy workflows.

        PRD and initial research can happen in parallel.
        """
        return [
            StepDependency(
                step=StepName.GENERATE_PRD,
                depends_on=[],
                can_parallel_with=["Research"]
            ),
            StepDependency(
                step="Research",
                depends_on=[],
                can_parallel_with=[StepName.GENERATE_PRD]
            ),
            StepDependency(
                step=StepName.GENERATE_DESIGN,
                depends_on=[StepName.GENERATE_PRD, "Research"],
                can_parallel_with=[]
            ),
            StepDependency(
                step=StepName.GENERATE_TASKS,
                depends_on=[StepName.GENERATE_DESIGN],
                can_parallel_with=[]
            ),
            StepDependency(
                step=StepName.EXECUTE_TASKS,
                depends_on=[StepName.GENERATE_TASKS],
                can_parallel_with=[]
            ),
            StepDependency(
                step=StepName.GENERATE_SUMMARY,
                depends_on=[StepName.EXECUTE_TASKS],
                can_parallel_with=[]
            )
        ]