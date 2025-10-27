# Langfuse Scores and Observations Implementation Guide

This guide explains how to use the Langfuse Scores and Observations system to evaluate workflow artifacts and track detailed telemetry.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Scores System](#scores-system)
4. [Observations System](#observations-system)
5. [Integration with Workflows](#integration-with-workflows)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Overview

The Langfuse Scores and Observations implementation provides:

- **Automated Quality Evaluation**: LLM-as-judge evaluates PRDs, Designs, and Tasks
- **Detailed Telemetry**: Track every step, sub-step, and decision in your workflow
- **Comprehensive Metrics**: Monitor quality scores, timing, token usage, and costs
- **Human-in-the-Loop**: Enable manual review via Langfuse Annotation Queues

### Architecture

```
Workflow Execution
    │
    ├─► Observations (Telemetry)
    │   ├── Main workflow trace
    │   ├── Step-level observations (PRD, Design, Tasks)
    │   ├── Sub-step observations (planning, execution, validation)
    │   └── Approval checkpoints (user interactions)
    │
    └─► Scores (Quality Evaluation)
        ├── LLM-as-judge (automated)
        ├── Human annotation (manual review)
        └── Custom metrics (your own evaluators)
```

## Quick Start

### Prerequisites

1. **Langfuse Server Running**:

   ```bash
   cd observability
   docker-compose up -d
   ```

2. **Environment Variables Set**:

   ```bash
   export LANGFUSE_PUBLIC_KEY="pk-lf-..."
   export LANGFUSE_SECRET_KEY="sk-lf-..."
   export LANGFUSE_HOST="http://localhost:3000"
   export ANTHROPIC_API_KEY="sk-ant-..."  # For LLM-as-judge
   ```

3. **Dependencies Installed**:
   ```bash
   pip install langfuse anthropic
   ```

### Run Examples

**Scores Example**:

```bash
python observability/examples/langfuse-scores-example.py
```

**Observations Example**:

```bash
python observability/examples/langfuse-observations-example.py
```

## Scores System

### Overview

Scores provide quantitative and qualitative assessments of artifact quality.

### Score Types

#### 1. PRD Scores

- **Completeness** (0-10): Are all required sections present?
- **Clarity** (0-10): Is the language clear and specific?
- **Technical Depth** (0-10): Sufficient technical detail?
- **Overall** (categorical): excellent, good, needs_improvement, poor

#### 2. Design Scores

- **Architecture** (0-10): System design quality
- **Feasibility** (0-10): Implementation practicality
- **Completeness** (0-10): All design elements present
- **Has Security** (boolean): Security section present
- **Overall** (categorical): excellent, good, needs_improvement, poor

#### 3. Task Scores

- **Actionability** (0-10): Tasks are specific and executable
- **Completeness** (0-10): All aspects covered
- **Clarity** (0-10): Descriptions are clear
- **Has Criteria** (boolean): Acceptance criteria present
- **Overall** (categorical): excellent, good, needs_improvement, poor

### Using Evaluators

```python
from langfuse_evaluators import evaluate_prd, evaluate_design, evaluate_tasks
from workflow_telemetry import score_artifact

# Evaluate PRD
prd_content = open("prd.md").read()
scores = evaluate_prd(prd_content)

print(f"Completeness: {scores.completeness}/10")
print(f"Overall: {scores.overall}")

# Add scores to Langfuse
execution_id = "workflow_123"
score_artifact(
    execution_id=execution_id,
    name="prd_completeness",
    value=scores.completeness,
    comment=scores.reasoning
)
```

### Custom Judge Prompts

Prompts are defined in `scripts/judge_prompts.py`. You can customize them for your needs:

```python
from judge_prompts import format_prd_judge_prompt

# Format a prompt
prompt = format_prd_judge_prompt(prd_content)

# Use with your LLM
response = llm.complete(prompt)
```

### Score Configuration in Langfuse UI

Create score configurations in Langfuse UI (Settings → Score Configs):

**Numeric Scores** (0-10 scale):

- `prd_completeness`
- `prd_clarity`
- `prd_technical_depth`
- `design_architecture`
- `design_feasibility`
- `design_completeness`
- `tasks_actionability`
- `tasks_completeness`
- `tasks_clarity`

**Categorical Scores**:

- `overall_quality`: excellent | good | needs_improvement | poor

**Boolean Scores**:

- `design_has_security`
- `tasks_has_criteria`

## Observations System

### Overview

Observations provide detailed telemetry about workflow execution.

### Observation Levels

1. **Level 1: Workflow Trace** - Entire execution
2. **Level 2: Steps** - PRD generation, Design generation, etc.
3. **Level 3: Sub-steps** - Planning, execution, validation
4. **Level 4: Approval Checkpoints** - User decisions

### Creating Observations

#### Method 1: WorkflowObserver (Recommended)

```python
from workflow_telemetry import WorkflowObserver

execution_id = "workflow_123"

with WorkflowObserver(execution_id=execution_id) as observer:
    # Create main trace
    observer.create_trace(
        name="feature-to-code-workflow",
        metadata={"feature": "User Auth"}
    )

    # Your workflow code here
    generate_prd()
    generate_design()
    generate_tasks()

# Data is automatically flushed on exit
```

#### Method 2: Decorators

```python
from workflow_telemetry import observe_workflow_step, observe_substep

@observe_workflow_step(step_name="Generate PRD", execution_id="workflow_123")
def generate_prd():
    # Step-level observation automatically created

    @observe_substep(substep_name="planning")
    def plan():
        # Sub-step observation
        return ["section1", "section2"]

    sections = plan()
    return create_prd(sections)
```

### Tracking LLM Generations

```python
from workflow_telemetry import create_step_generation

create_step_generation(
    execution_id="workflow_123",
    step_name="PRD Generation",
    input_prompt="Create a PRD for...",
    output_text="# PRD\n...",
    model="claude-3-5-sonnet-20241022",
    tokens_input=150,
    tokens_output=800,
    metadata={"temperature": 0.7}
)
```

### Tracking Approval Checkpoints

```python
from workflow_telemetry import track_approval_checkpoint

track_approval_checkpoint(
    execution_id="workflow_123",
    checkpoint="PRD Review",
    status="approved",  # or "rejected", "timeout"
    duration_seconds=45.3,
    reviewer="user@example.com",
    reason=None  # Optional rejection reason
)
```

## Integration with Workflows

### Enhancing feature-to-code-unified.sh

To integrate with your existing workflow:

```bash
# In feature-to-code-unified.sh

# Step 1: Generate PRD
PRD_FILE="$WORK_DIR/prd_$(date +%Y%m%d).md"

# Generate PRD (existing code)
claude -p "Generate PRD..." > "$PRD_FILE"

# NEW: Evaluate and score PRD
if [ "$ENABLE_EVALUATION" = "true" ]; then
    python scripts/evaluate_and_score.py \
        --execution-id "$EXECUTION_ID" \
        --artifact-type "prd" \
        --artifact-file "$PRD_FILE"
fi

# NEW: Track approval checkpoint
if [ -n "$APPROVAL_START_TIME" ]; then
    APPROVAL_DURATION=$(($(date +%s) - APPROVAL_START_TIME))
    python scripts/track_approval.py \
        --execution-id "$EXECUTION_ID" \
        --checkpoint "PRD" \
        --status "approved" \
        --duration "$APPROVAL_DURATION"
fi
```

### Adding to Python Scripts

```python
# In your workflow script
from workflow_telemetry import WorkflowObserver
from langfuse_evaluators import evaluate_prd

execution_id = "workflow_123"

with WorkflowObserver(execution_id=execution_id) as observer:
    observer.create_trace(name="my-workflow")

    # Generate artifact
    prd = generate_prd()

    # Evaluate it
    scores = evaluate_prd(prd)

    # Add scores
    for name, value in scores.to_dict().items():
        if name != "reasoning":
            score_artifact(
                execution_id=execution_id,
                name=f"prd_{name}",
                value=value
            )
```

## Best Practices

### 1. Use Consistent Naming

```python
# Good: Consistent naming across workflow
execution_id = f"feature_{timestamp}"
step_names = ["Generate PRD", "Generate Design", "Generate Tasks"]

# Bad: Inconsistent naming
execution_id = "exec_123"
step_names = ["prd_step", "design", "task_generation"]
```

### 2. Add Rich Metadata

```python
# Good: Rich metadata for filtering and analysis
observer.create_trace(
    name="feature-to-code",
    metadata={
        "feature": feature_name,
        "user": user_id,
        "environment": "production",
        "version": "2.0"
    }
)

# Bad: Minimal metadata
observer.create_trace(name="workflow")
```

### 3. Handle Errors Gracefully

```python
# Good: Observations closed even on error
@observe_workflow_step(step_name="Generate PRD", execution_id=exec_id)
def generate_prd():
    try:
        return create_prd()
    except Exception as e:
        # Error is logged in observation
        raise

# The decorator ensures observation is closed with error info
```

### 4. Use Session IDs for Grouping

```python
# Good: Related workflows grouped by session
execution_id = f"feature_{feature_id}_{timestamp}"
session_id = f"feature_{feature_id}"  # Same for all iterations

observer.create_trace(
    name="workflow",
    session_id=session_id  # Groups related executions
)
```

### 5. Batch Score Updates

```python
# Good: Batch updates for efficiency
scores = evaluate_prd(prd)
for name, value in scores.to_dict().items():
    score_artifact(execution_id, f"prd_{name}", value)

langfuse.flush()  # Send all at once

# Bad: Individual flushes
score_artifact(execution_id, "prd_completeness", 9)
langfuse.flush()
score_artifact(execution_id, "prd_clarity", 8)
langfuse.flush()
```

## Troubleshooting

### Issue: No data appearing in Langfuse

**Check**:

1. Langfuse server is running: `docker-compose ps`
2. Environment variables are set: `env | grep LANGFUSE`
3. API keys are correct (check Langfuse UI → Settings → API Keys)
4. `langfuse.flush()` is called or context manager exits

**Test connection**:

```python
from langfuse import Langfuse
langfuse = Langfuse()
trace = langfuse.trace(name="test")
langfuse.flush()
# Check Langfuse UI for "test" trace
```

### Issue: Evaluations failing

**Check**:

1. `ANTHROPIC_API_KEY` is set
2. LLM model is available (default: `claude-3-5-sonnet-20241022`)
3. Artifact content is not empty

**Debug**:

```python
from langfuse_evaluators import evaluate_prd

try:
    scores = evaluate_prd(prd_content)
    print(scores)
except Exception as e:
    print(f"Evaluation failed: {e}")
```

### Issue: Tests failing

**Check**:

1. All dependencies installed: `pip install -r tests/requirements.txt`
2. Run tests with: `pytest tests/ -v`
3. Check for import errors: `python -c "import langfuse; print('OK')"`

### Issue: Scores not showing correct data type

**Fix**: Specify data_type explicitly:

```python
# For categorical scores
score_artifact(
    execution_id=exec_id,
    name="overall_quality",
    value="excellent",
    data_type="CATEGORICAL"  # Explicitly set type
)

# For boolean scores
score_artifact(
    execution_id=exec_id,
    name="has_security",
    value=True,
    data_type="BOOLEAN"
)
```

## Advanced Topics

### Custom Evaluators

Create your own evaluators:

```python
from dataclasses import dataclass
from langfuse_evaluators import call_llm_judge

@dataclass
class CustomScore:
    metric1: int
    metric2: int
    overall: str

    def to_dict(self):
        return {
            "metric1": self.metric1,
            "metric2": self.metric2,
            "overall": self.overall
        }

def evaluate_custom(content):
    prompt = f"Evaluate this: {content}"
    result = call_llm_judge(prompt)
    return CustomScore(
        metric1=result['metric1'],
        metric2=result['metric2'],
        overall=result['overall']
    )
```

### Async Evaluation

For non-blocking evaluation:

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=3)

def evaluate_async(content, artifact_type):
    """Evaluate artifact asynchronously"""
    loop = asyncio.get_event_loop()

    if artifact_type == "prd":
        future = loop.run_in_executor(executor, evaluate_prd, content)
    elif artifact_type == "design":
        future = loop.run_in_executor(executor, evaluate_design, content)
    else:
        future = loop.run_in_executor(executor, evaluate_tasks, content)

    return future
```

### Filtering and Analysis

In Langfuse UI:

1. **Filter by score**: Show only traces where `prd_completeness > 8`
2. **Group by session**: See all iterations of a feature
3. **Compare runs**: Compare scores across workflow executions
4. **Custom dashboards**: Create visualizations of quality metrics

## Resources

- [Langfuse Documentation](https://langfuse.com/docs)
- [Langfuse Scores Guide](https://langfuse.com/docs/scores)
- [Langfuse Observations Guide](https://langfuse.com/docs/tracing)
- [Example Scripts](../../observability/examples/)
- [Test Files](../../tests/) - See test files for more usage examples

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review test files for correct usage patterns
3. Check Langfuse server logs: `docker-compose logs langfuse-web`
4. Verify OTEL collector logs: `docker-compose logs otel-collector`

---

**Last Updated**: October 27, 2025
**Version**: 1.0
