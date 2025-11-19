# LLM Observability, Logging, and Monitoring Research
## For Multi-Command Workflow Systems with Human-in-the-Loop

**Generated**: 2025-10-19
**Purpose**: Research observability solutions for multi-command LLM workflows (e.g., `/next-feature-full-flow`) with quality measurement and human-in-the-loop approval systems

---

## Executive Summary

This research examines observability, logging, and monitoring solutions for LLM-powered multi-command workflows. The goal is to track everything happening in real-time when running command chains like `/next-feature-full-flow`, measure code quality via automated scripts, and provide a custom interface for human-in-the-loop (HITL) approval of PRDs, designs, tasks, code, and system improvements.

### Key Findings

1. **OpenTelemetry** is the industry standard for distributed tracing and should be the foundation
2. **Server-Sent Events (SSE)** are optimal for real-time log streaming (simpler than WebSockets for one-way data)
3. **Langfuse** is the most popular open-source LLM observability tool with comprehensive features
4. **Human-in-the-Loop** systems require workflow orchestration with approval gates (LangGraph interrupts, Permit.io, or custom)
5. **Code Quality** measurement uses static analysis (SonarQube, ESLint) + LLM-based evaluation + pass@k metrics

---

## Part 1: LLM Observability Fundamentals

### What is LLM Observability?

LLM observability extends traditional software observability to address the unique challenges of LLM applications:

- **Prompt and Response Tracking**: Capturing input prompts and LLM outputs
- **Token Usage Monitoring**: Tracking token consumption for cost attribution
- **Latency Measurement**: Request/response timing across the LLM pipeline
- **Quality Evaluation**: Measuring output quality, hallucination detection, and relevance
- **Context Propagation**: Tracing requests through multi-step agent workflows

### The Three Pillars Applied to LLMs

| Pillar | Traditional Software | LLM Applications |
|--------|---------------------|------------------|
| **Metrics** | CPU, memory, request rate | Token count, latency, cost per request, quality scores |
| **Logs** | Application logs, error messages | Prompts, responses, tool calls, reasoning traces |
| **Traces** | Request path through services | Multi-step agent workflows, tool invocations, decision paths |

---

## Part 2: Leading Observability Tools & Frameworks

### Open Source Solutions

#### 1. Langfuse (⭐ Most Popular)

**Overview**: The most used open-source LLM observability tool with comprehensive tracing, evaluations, prompt management, and metrics.

**Key Features**:
- Model and framework agnostic (works with OpenAI, Anthropic, LangChain, LlamaIndex)
- Self-hosting options for data privacy
- OpenTelemetry integration
- Prompt versioning and experimentation
- Cost tracking and analytics
- Real-time dashboards

**Use Case for This Project**: Track each slash command execution as a trace, with spans for PRD generation, design, task creation, and code execution.

```typescript
// Example integration
import Langfuse from 'langfuse';

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
});

// Track a multi-command workflow
const trace = langfuse.trace({
  name: 'next-feature-full-flow',
  userId: 'user-123',
  metadata: { feature: 'user-authentication' }
});

const prdSpan = trace.span({
  name: '/prd',
  input: { featureDescription: '...' },
});

// Later: prdSpan.end({ output: prdContent });
```

**Pros**:
- Comprehensive features
- Active development
- Self-hostable
- Great UI

**Cons**:
- Requires separate service deployment
- Learning curve for setup

---

#### 2. OpenLLMetry + Traceloop

**Overview**: OpenTelemetry-based semantic conventions for LLM observability, transmits traces to 10+ visualization tools.

**Key Features**:
- OpenTelemetry standard compliance
- Framework-agnostic instrumentation
- Compatible with existing observability stacks (Datadog, Grafana, Jaeger)
- Automatic instrumentation for LangChain, LlamaIndex

**Use Case for This Project**: Instrument slash commands to send traces to your existing observability platform.

```python
# Auto-instrumentation example
from traceloop.sdk import Traceloop

Traceloop.init(app_name="class-one-rapids")

# Automatic tracing of LLM calls
```

**Pros**:
- Standards-based
- Works with existing tools
- Minimal code changes

**Cons**:
- Less LLM-specific features than Langfuse
- Requires OpenTelemetry knowledge

---

#### 3. Phoenix (by Arize AI)

**Overview**: Open-source observability platform for the entire LLM application lifecycle.

**Key Features**:
- Trace debugging and visualization
- Embedding analysis for RAG systems
- LLM evaluation tools
- Drift detection

**Use Case for This Project**: Debugging failed command executions and analyzing quality degradation over time.

**Pros**:
- Excellent debugging UI
- Good for RAG systems
- Free and open-source

**Cons**:
- Smaller community than Langfuse
- More focused on experimentation than production monitoring

---

### Commercial/Managed Platforms

#### 1. LangSmith (by LangChain)

**Overview**: Official observability platform for LangChain, with end-to-end OpenTelemetry support.

**Key Features**:
- Native LangChain/LangGraph integration
- Test and evaluation suites
- Prompt playground
- Dataset management
- Production monitoring

**Use Case for This Project**: If building orchestration with LangGraph, LangSmith provides the best integration.

```typescript
// LangSmith integration
import { Client } from "langsmith";

const client = new Client({
  apiKey: process.env.LANGSMITH_API_KEY
});

// Trace entire workflow
await client.createRun({
  name: "next-feature-full-flow",
  inputs: { featureDescription },
  run_type: "chain"
});
```

**Pros**:
- Best LangChain integration
- Managed service (no ops)
- Excellent evaluation tools

**Cons**:
- Cost scales with usage
- Vendor lock-in

---

#### 2. Datadog LLM Observability

**Overview**: Enterprise APM extended for LLM applications.

**Key Features**:
- Infrastructure + LLM monitoring in one platform
- Automatic instrumentation for popular frameworks
- Pre-built dashboards
- Integration with existing Datadog setup

**Use Case for This Project**: If you already use Datadog for infrastructure monitoring.

**Pros**:
- Enterprise-grade reliability
- Unified observability platform
- Strong alerting capabilities

**Cons**:
- Expensive for small teams
- Overkill for LLM-only projects

---

## Part 3: OpenTelemetry for Multi-Command Workflows

### Context Propagation Challenges in CLI Workflows

Traditional OpenTelemetry assumes continuous spans in long-lived processes. CLI commands that execute sequentially face unique challenges:

1. **Process Boundaries**: Each command may run in a separate process
2. **Non-Continuous Spans**: Traces can't be "resumed" after process exit
3. **Manual Propagation**: Context must be explicitly passed between commands

### Solution Architecture for `/next-feature-full-flow`

```
┌─────────────────────────────────────────────────────────────┐
│  /next-feature-full-flow (Parent Trace)                     │
│  Trace ID: abc123                                            │
└─────────────────────────────────────────────────────────────┘
         │
         ├──► Span 1: /next-feature
         │    └──► Output: feature-description.md
         │
         ├──► Span 2: /prd [feature-description.md]
         │    └──► Output: prd_feature_20251019.md
         │
         ├──► Span 3: /design [prd_feature_20251019.md]
         │    └──► Output: tdd_feature_20251019.md
         │
         ├──► Span 4: /tasks [tdd_feature_20251019.md]
         │    └──► Output: tasks_feature_20251019.md
         │
         └──► Span 5: /execute-tasks [tasks_feature_20251019.md]
              └──► Sub-spans for each task execution
```

### Implementation Strategy

#### Option 1: Trace Context in Environment Variables

```bash
# Parent command sets trace context
export OTEL_TRACE_ID="abc123"
export OTEL_PARENT_SPAN_ID="span456"

# Each command reads context and creates child span
/prd feature-description.md
```

#### Option 2: Trace Context in Metadata Files

```typescript
// Parent command writes trace context to .trace-context.json
{
  "traceId": "abc123",
  "parentSpanId": "span456",
  "workflow": "next-feature-full-flow",
  "startTime": "2025-10-19T10:00:00Z"
}

// Each command reads and extends the trace
const traceContext = JSON.parse(fs.readFileSync('.trace-context.json'));
const span = tracer.startSpan('/prd', {
  parent: traceContext,
  attributes: {
    'command.input': prdFilePath,
    'command.type': 'prd-generation'
  }
});
```

#### Option 3: Centralized Orchestrator

```typescript
// Single orchestrator process manages entire workflow
class WorkflowOrchestrator {
  async executeFullFlow(featureDescription: string) {
    const trace = tracer.startTrace('next-feature-full-flow');

    try {
      // Execute each command as a span
      const feature = await this.executeCommand('/next-feature', trace);
      const prd = await this.executeCommand('/prd', trace, { input: feature });
      const design = await this.executeCommand('/design', trace, { input: prd });
      const tasks = await this.executeCommand('/tasks', trace, { input: design });
      await this.executeCommand('/execute-tasks', trace, { input: tasks });

      trace.end({ status: 'success' });
    } catch (error) {
      trace.end({ status: 'error', error });
    }
  }
}
```

**Recommendation**: **Option 3 (Centralized Orchestrator)** provides the cleanest trace hierarchy and simplest implementation.

---

## Part 4: Real-Time Logging & Streaming

### Server-Sent Events (SSE) vs WebSockets

| Feature | Server-Sent Events | WebSockets |
|---------|-------------------|------------|
| **Direction** | Server → Client only | Bi-directional |
| **Protocol** | HTTP/HTTPS | WebSocket protocol |
| **Reconnection** | Automatic | Manual implementation |
| **Browser Support** | All modern browsers | All modern browsers |
| **Debugging** | Easy (curl, dev tools) | Harder (requires WS client) |
| **Use Case** | Log streaming, real-time updates | Chat, gaming, real-time collaboration |

**Recommendation**: **Server-Sent Events** for log streaming because:
1. Logs are one-way (server → client)
2. Automatic reconnection is crucial for long-running commands
3. Simpler to implement and debug
4. Works over standard HTTP/HTTPS

### SSE Implementation for Live Command Output

#### Backend (Node.js/Express)

```typescript
// Real-time log streaming endpoint
import express from 'express';

const app = express();

app.get('/api/logs/stream/:executionId', (req, res) => {
  const { executionId } = req.params;

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', executionId })}\n\n`);

  // Stream logs from execution
  const logStream = getLogStream(executionId);

  logStream.on('data', (logEntry) => {
    res.write(`event: log\n`);
    res.write(`data: ${JSON.stringify(logEntry)}\n\n`);
  });

  logStream.on('end', () => {
    res.write(`event: complete\n`);
    res.write(`data: ${JSON.stringify({ status: 'completed' })}\n\n`);
    res.end();
  });

  // Cleanup on client disconnect
  req.on('close', () => {
    logStream.destroy();
  });
});
```

#### Frontend (React Native - using EventSource polyfill)

```typescript
import EventSource from 'react-native-sse';

function CommandExecutionMonitor({ executionId }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<'running' | 'completed' | 'error'>('running');

  useEffect(() => {
    const eventSource = new EventSource(
      `https://api.example.com/logs/stream/${executionId}`
    );

    eventSource.addEventListener('log', (event) => {
      const logEntry = JSON.parse(event.data);
      setLogs(prev => [...prev, logEntry]);
    });

    eventSource.addEventListener('complete', (event) => {
      setStatus('completed');
      eventSource.close();
    });

    eventSource.addEventListener('error', (event) => {
      setStatus('error');
      eventSource.close();
    });

    return () => eventSource.close();
  }, [executionId]);

  return (
    <ScrollView>
      {logs.map((log, i) => (
        <LogLine key={i} log={log} />
      ))}
    </ScrollView>
  );
}
```

### Log Entry Schema

```typescript
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  command: string;  // e.g., '/prd', '/design'
  phase: string;    // e.g., 'analysis', 'generation', 'validation'
  message: string;
  metadata?: {
    traceId?: string;
    spanId?: string;
    tokens?: number;
    latency?: number;
    [key: string]: any;
  };
}
```

---

## Part 5: Human-in-the-Loop (HITL) Systems

### Core HITL Concepts

Human-in-the-Loop integrates human judgment into automated processes by pausing at critical decision points for review, validation, or approval before proceeding.

**Why HITL is Essential for LLM Workflows**:
- LLMs can hallucinate or misinterpret requirements
- Critical decisions (architecture, tech stack) benefit from human expertise
- Compliance requirements (EU AI Act Article 14) mandate human oversight for high-risk systems
- Quality assurance before expensive downstream execution

### HITL Architecture Patterns

#### Pattern 1: Checkpoint-Based Approval

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Generate   │ ───► │  Human       │ ───► │  Continue   │
│  PRD        │      │  Reviews PRD │      │  to Design  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Reject &    │
                     │  Provide     │
                     │  Feedback    │
                     └──────────────┘
                            │
                            ▼
                     (Regenerate PRD)
```

**Checkpoints for `/next-feature-full-flow`**:
1. After `/prd`: Review product requirements
2. After `/design`: Review technical architecture decisions
3. After `/tasks`: Review task breakdown and estimates
4. After `/execute-tasks`: Review generated code
5. Before `/reflect`: Approve or reject process improvements

#### Pattern 2: Confidence-Based Routing

```typescript
interface GenerationResult {
  content: string;
  confidence: number;  // 0-1
  flags: string[];     // ['uncertain-architecture', 'high-complexity']
}

async function generateWithConditionalHumanReview(
  command: string,
  input: string,
  confidenceThreshold = 0.85
): Promise<string> {
  const result = await executeCommand(command, input);

  if (result.confidence < confidenceThreshold || result.flags.length > 0) {
    // Route to human review queue
    return await requestHumanReview({
      command,
      result,
      reason: result.confidence < confidenceThreshold
        ? 'Low confidence'
        : `Flags: ${result.flags.join(', ')}`
    });
  }

  // Auto-approve high-confidence results
  return result.content;
}
```

### HITL Implementation Frameworks

#### Option 1: LangGraph with Interrupts

**Overview**: LangGraph provides built-in interrupt() functionality for pausing workflows.

```typescript
import { StateGraph } from "@langchain/langgraph";

const workflow = new StateGraph({
  channels: {
    prd: null,
    design: null,
    approved: false
  }
});

workflow.addNode("generate_prd", async (state) => {
  const prd = await generatePRD(state.feature);
  return { prd };
});

workflow.addNode("human_review_prd", async (state) => {
  // This interrupts the workflow
  throw new GraphInterrupt({
    type: "human_review",
    data: { prd: state.prd }
  });
});

workflow.addNode("generate_design", async (state) => {
  if (!state.approved) {
    throw new Error("PRD not approved");
  }
  const design = await generateDesign(state.prd);
  return { design };
});

workflow.addEdge("generate_prd", "human_review_prd");
workflow.addEdge("human_review_prd", "generate_design");

// Execution
const runner = workflow.compile();
const execution = await runner.invoke({ feature: "authentication" });

// Later, after human approval:
await execution.resume({ approved: true });
```

**Pros**:
- Built-in workflow state management
- Native support for interrupts
- Good for complex multi-step workflows

**Cons**:
- Requires LangGraph adoption
- Learning curve

---

#### Option 2: Custom Approval Queue System

**Overview**: Build a simple approval queue with state persistence.

```typescript
// Approval queue schema
interface ApprovalRequest {
  id: string;
  workflow: string;  // 'next-feature-full-flow'
  checkpoint: string;  // 'prd', 'design', 'tasks', 'code'
  timestamp: Date;
  content: string;
  metadata: {
    traceId: string;
    command: string;
    previousStep?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  reviewer?: string;
  reviewNotes?: string;
  reviewedAt?: Date;
}

// API endpoints
POST   /api/approvals                 # Create approval request
GET    /api/approvals                 # List pending approvals
GET    /api/approvals/:id             # Get specific approval
POST   /api/approvals/:id/approve     # Approve and continue workflow
POST   /api/approvals/:id/reject      # Reject with feedback
```

**State Machine**:

```typescript
class WorkflowExecutor {
  async executeWithApprovals(workflow: string, input: any) {
    const execution = await this.createExecution(workflow, input);

    for (const step of execution.steps) {
      // Execute step
      const result = await this.executeStep(step, execution.context);

      // Check if this step requires approval
      if (step.requiresApproval) {
        const approval = await this.createApprovalRequest({
          workflow: execution.id,
          checkpoint: step.name,
          content: result.output,
          metadata: {
            traceId: execution.traceId,
            command: step.command
          }
        });

        // Pause execution and wait for approval
        await this.pauseExecution(execution.id, approval.id);

        // Execution resumes when approval granted
        const decision = await this.waitForApproval(approval.id);

        if (decision.status === 'rejected') {
          // Handle rejection - possibly retry with feedback
          await this.handleRejection(execution, decision.reviewNotes);
          return;
        }
      }

      // Continue to next step
      execution.context = { ...execution.context, ...result };
    }
  }

  async approveAndResume(approvalId: string, reviewNotes?: string) {
    const approval = await this.getApproval(approvalId);
    approval.status = 'approved';
    approval.reviewNotes = reviewNotes;

    // Resume execution
    await this.resumeExecution(approval.metadata.executionId);
  }
}
```

**Pros**:
- Full control over approval logic
- Easy to customize
- Simple data model

**Cons**:
- More code to maintain
- Need to handle state persistence

---

#### Option 3: Integration with Ticketing Systems

**Overview**: Use existing tools like Jira, Linear, or GitHub Issues for approvals.

```typescript
import { Octokit } from '@octokit/rest';

async function createApprovalIssue(prdContent: string, executionId: string) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const issue = await octokit.issues.create({
    owner: 'username',
    repo: 'class-one-rapids',
    title: `[Approval Required] PRD Review - ${executionId}`,
    body: `
## PRD Approval Request

**Execution ID**: ${executionId}
**Workflow**: next-feature-full-flow

### Generated PRD

${prdContent}

### Actions

- [ ] Approve (comment \`/approve\`)
- [ ] Reject (comment \`/reject [reason]\`)
    `,
    labels: ['approval-required', 'prd-review']
  });

  return issue.data;
}

// Webhook handler for issue comments
async function handleIssueComment(comment: any) {
  if (comment.body.startsWith('/approve')) {
    const executionId = extractExecutionId(comment.issue.body);
    await workflowExecutor.approveAndResume(executionId);
    await closeIssue(comment.issue.number);
  } else if (comment.body.startsWith('/reject')) {
    const reason = comment.body.replace('/reject', '').trim();
    await workflowExecutor.rejectAndRetry(executionId, reason);
  }
}
```

**Pros**:
- Uses existing tools (no new UI)
- Built-in notifications
- Audit trail included

**Cons**:
- Less flexible than custom solution
- Rate limits on APIs
- Not real-time

---

### HITL UI/UX Recommendations

A custom approval interface should include:

#### 1. Approval Dashboard

```typescript
interface ApprovalDashboard {
  pendingApprovals: ApprovalRequest[];
  filters: {
    workflow: string[];
    checkpoint: string[];
    dateRange: [Date, Date];
  };
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    avgReviewTime: number;
  };
}
```

**Key Features**:
- List of pending approvals sorted by priority/age
- Quick filters by workflow type and checkpoint
- Search by execution ID or content
- Batch approval for multiple items

#### 2. Approval Detail View

```
┌──────────────────────────────────────────────────────┐
│  PRD Approval - Execution #abc123                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Workflow: next-feature-full-flow                   │
│  Checkpoint: /prd                                   │
│  Created: 2 minutes ago                             │
│  Trace: [View in Observability →]                  │
│                                                      │
├──────────────────────────────────────────────────────┤
│  Generated PRD Content:                             │
│                                                      │
│  [Rendered markdown with syntax highlighting]       │
│                                                      │
├──────────────────────────────────────────────────────┤
│  Quality Metrics:                                   │
│  • Confidence Score: 87%                            │
│  • Completeness: 12/12 sections                     │
│  • Token Usage: 4,523 tokens                        │
│  • Generation Time: 45 seconds                      │
│                                                      │
├──────────────────────────────────────────────────────┤
│  Actions:                                            │
│                                                      │
│  [Approve & Continue ✓]  [Reject & Retry ✗]        │
│                                                      │
│  Feedback (optional):                               │
│  ┌────────────────────────────────────────────────┐ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### 3. Diff View for Iterations

When a checkpoint is rejected and regenerated, show side-by-side comparison:

```
┌─────────────────────────────┬─────────────────────────────┐
│  Previous Version           │  New Version (after feedback)│
├─────────────────────────────┼─────────────────────────────┤
│  ## Problem Statement       │  ## Problem Statement       │
│                             │                             │
│  Users need authentication  │  Users need secure OAuth2   │
│  to access the app.         │  authentication with MFA    │
│                             │  to protect sensitive data. │
│  [Lines removed in red]     │  [Lines added in green]     │
└─────────────────────────────┴─────────────────────────────┘
```

---

## Part 6: Code Quality Measurement & Validation

### Quality Metrics for LLM-Generated Code

#### 1. Functional Correctness

**Pass@k**: The probability that generated code passes test cases within k attempts.

```typescript
interface CodeGenerationResult {
  code: string;
  passRate: number;  // Percentage of test cases passed
  pass_at_1: number; // Probability of passing on first attempt
  pass_at_5: number; // Probability of passing within 5 attempts
}

async function measurePassAtK(
  generatedCode: string,
  testCases: TestCase[],
  k: number
): Promise<number> {
  let successCount = 0;

  for (let i = 0; i < k; i++) {
    const result = await runTests(generatedCode, testCases);
    if (result.allPassed) {
      successCount++;
    }
  }

  return successCount / k;
}
```

**Test Coverage**: Measure what percentage of generated code is covered by tests.

```bash
# Using Jest for React Native
npx jest --coverage --collectCoverageFrom='src/**/*.{ts,tsx}'
```

---

#### 2. Static Code Analysis

**SonarQube Integration**: Analyze code for bugs, vulnerabilities, code smells, and maintainability.

```typescript
// Quality gate thresholds
interface QualityGate {
  coverage: number;            // > 80%
  duplications: number;        // < 3%
  maintainability_rating: 'A' | 'B' | 'C' | 'D' | 'E';  // Must be 'A'
  reliability_rating: 'A' | 'B' | 'C' | 'D' | 'E';      // Must be 'A'
  security_rating: 'A' | 'B' | 'C' | 'D' | 'E';         // Must be 'A'
  security_hotspots: number;   // Must be reviewed
  bugs: number;                // 0
  vulnerabilities: number;     // 0
  code_smells: number;         // < 10
}

async function analyzeWithSonarQube(codeDirectory: string): Promise<QualityGate> {
  // Run SonarScanner
  await exec(`sonar-scanner \
    -Dsonar.projectKey=class-one-rapids \
    -Dsonar.sources=${codeDirectory} \
    -Dsonar.host.url=http://localhost:9000`);

  // Fetch quality gate status
  const response = await fetch(
    `http://localhost:9000/api/qualitygates/project_status?projectKey=class-one-rapids`
  );

  return await response.json();
}
```

**ESLint for TypeScript/React Native**:

```bash
# Run ESLint with autofix
npx eslint src/ --ext .ts,.tsx --fix --max-warnings=0
```

---

#### 3. LLM-Based Code Review

Use a second LLM to review the first LLM's generated code.

```typescript
async function llmCodeReview(generatedCode: string): Promise<CodeReviewResult> {
  const reviewPrompt = `
You are a senior code reviewer. Analyze the following code and provide feedback:

${generatedCode}

Evaluate on:
1. Correctness: Does the code do what it claims?
2. Security: Any vulnerabilities or unsafe patterns?
3. Performance: Any obvious bottlenecks?
4. Maintainability: Is the code readable and well-structured?
5. Best Practices: Does it follow TypeScript/React Native conventions?

Provide a score (0-100) for each category and overall recommendation (approve/needs_changes/reject).
`;

  const review = await claude.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content: reviewPrompt }]
  });

  return parseReviewResponse(review.content);
}

interface CodeReviewResult {
  scores: {
    correctness: number;
    security: number;
    performance: number;
    maintainability: number;
    bestPractices: number;
    overall: number;
  };
  issues: Array<{
    severity: 'critical' | 'major' | 'minor';
    category: string;
    description: string;
    lineNumber?: number;
    suggestion?: string;
  }>;
  recommendation: 'approve' | 'needs_changes' | 'reject';
}
```

---

#### 4. Performance Benchmarks

**Response Time Testing**:

```typescript
import { performance } from 'perf_hooks';

async function benchmarkComponent(Component: React.ComponentType) {
  const iterations = 100;
  const timings: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    render(<Component />);
    const end = performance.now();
    timings.push(end - start);
  }

  return {
    mean: timings.reduce((a, b) => a + b) / iterations,
    p50: percentile(timings, 50),
    p95: percentile(timings, 95),
    p99: percentile(timings, 99),
  };
}

// Quality gate: p95 < 100ms for component render
```

**Memory Usage**:

```typescript
async function measureMemoryUsage(operation: () => Promise<void>) {
  const before = process.memoryUsage();
  await operation();
  const after = process.memoryUsage();

  return {
    heapUsed: after.heapUsed - before.heapUsed,
    heapTotal: after.heapTotal - before.heapTotal,
    external: after.external - before.external,
  };
}
```

---

### Automated Quality Scripts

Create executable quality validation scripts for each checkpoint:

```bash
#!/bin/bash
# scripts/quality-check.sh

echo "Running quality checks..."

# 1. Run tests
echo "1/5 Running tests..."
npm test -- --coverage --passWithNoTests
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

# 2. Check test coverage
echo "2/5 Checking coverage..."
COVERAGE=$(npx coverage-node ./coverage/coverage-summary.json)
if (( $(echo "$COVERAGE < 80" | bc -l) )); then
  echo "❌ Coverage below 80%: $COVERAGE%"
  exit 1
fi

# 3. Run linter
echo "3/5 Running ESLint..."
npx eslint src/ --ext .ts,.tsx --max-warnings=0
if [ $? -ne 0 ]; then
  echo "❌ Linting errors found"
  exit 1
fi

# 4. Type checking
echo "4/5 Type checking..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ Type errors found"
  exit 1
fi

# 5. Security audit
echo "5/5 Security audit..."
npm audit --audit-level=high
if [ $? -ne 0 ]; then
  echo "⚠️  Security vulnerabilities found"
  # Don't fail, just warn
fi

echo "✅ All quality checks passed!"
```

Integrate into workflow:

```typescript
async function executeTasksWithQualityGates(tasksFile: string) {
  const tasks = await loadTasks(tasksFile);

  for (const task of tasks) {
    // Execute task
    await executeTask(task);

    // Run quality checks
    const qualityResult = await runQualityChecks();

    if (!qualityResult.passed) {
      // Create approval request with quality issues
      await createApprovalRequest({
        checkpoint: `task-${task.id}`,
        content: task.output,
        qualityMetrics: qualityResult,
        requiresReview: true
      });
    }
  }
}
```

---

## Part 7: Recommended Architecture for Class One Rapids

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Orchestration Layer                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  WorkflowExecutor                                         │  │
│  │  - Manages /next-feature-full-flow                        │  │
│  │  - Creates traces                                         │  │
│  │  - Handles approval checkpoints                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Observability  │   │  Approval       │   │  Quality        │
│  Service        │   │  Service        │   │  Validation     │
│                 │   │                 │   │  Service        │
│  - Langfuse     │   │  - Approval     │   │  - ESLint       │
│  - OpenTelemetry│   │    Queue        │   │  - TypeScript   │
│  - SSE streaming│   │  - HITL UI      │   │  - Jest + Cov   │
│  - Metrics      │   │  - Notifications│   │  - SonarQube    │
└─────────────────┘   └─────────────────┘   └─────────────────┘
         │                      │                      │
         └──────────────────────┴──────────────────────┘
                                │
                                ▼
                   ┌─────────────────────────┐
                   │  Data Storage           │
                   │  - Execution history    │
                   │  - Approval records     │
                   │  - Quality metrics      │
                   │  - Traces & logs        │
                   └─────────────────────────┘
```

### Implementation Phases

#### Phase 1: Foundation (Week 1-2)

**Goal**: Basic observability and logging

**Tasks**:
1. Set up Langfuse (self-hosted or cloud)
2. Instrument slash commands with OpenTelemetry
3. Implement basic SSE log streaming
4. Create simple logging dashboard

**Deliverables**:
- Real-time command execution logs visible in UI
- Traces viewable in Langfuse
- Basic metrics (execution time, token count)

---

#### Phase 2: HITL System (Week 3-4)

**Goal**: Human approval workflow

**Tasks**:
1. Design approval database schema
2. Implement approval queue API
3. Build approval dashboard UI (React Native or web)
4. Add approval checkpoints to workflow executor
5. Implement notification system

**Deliverables**:
- Approval requests created after PRD/design/tasks generation
- UI for reviewing and approving/rejecting
- Email/push notifications for pending approvals
- Feedback loop for rejected items

---

#### Phase 3: Quality Automation (Week 5-6)

**Goal**: Automated quality validation

**Tasks**:
1. Create quality validation scripts
2. Integrate ESLint, TypeScript, Jest coverage
3. Set up SonarQube (optional)
4. Implement LLM-based code review
5. Create quality gates and thresholds

**Deliverables**:
- Automated quality checks run after code generation
- Quality metrics displayed in approval UI
- Failing quality gates trigger mandatory human review
- Quality trends tracked over time

---

#### Phase 4: Advanced Features (Week 7-8)

**Goal**: Process improvement and analytics

**Tasks**:
1. Implement `/reflect` approval workflow
2. Build analytics dashboard for workflow metrics
3. Add A/B testing for prompt variations
4. Create learning loop for improving prompts based on rejections

**Deliverables**:
- Analytics showing approval rates, rejection reasons, quality trends
- Automated suggestions for process improvements
- Prompt versioning and experimentation framework

---

### Technology Stack Recommendations

| Component | Recommended Tool | Alternative |
|-----------|-----------------|-------------|
| **LLM Observability** | Langfuse (self-hosted) | LangSmith (managed) |
| **Distributed Tracing** | OpenTelemetry | Custom trace context |
| **Log Streaming** | Server-Sent Events | WebSockets |
| **Approval Queue** | Custom (PostgreSQL) | GitHub Issues API |
| **Approval UI** | React Native (shared codebase) | Web dashboard |
| **Quality Analysis** | ESLint + TypeScript + Jest | SonarQube |
| **Code Review** | Claude Sonnet 4.5 | GPT-4 |
| **Metrics Storage** | PostgreSQL + TimescaleDB | Prometheus |
| **Dashboard** | React + Recharts | Grafana |

---

### Data Models

#### Execution Tracking

```typescript
interface WorkflowExecution {
  id: string;
  workflow: 'next-feature-full-flow' | 'prd' | 'design' | 'tasks' | 'execute-tasks';
  status: 'running' | 'paused' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  traceId: string;

  // Context
  input: any;
  output?: any;

  // Steps
  currentStep?: string;
  completedSteps: string[];

  // Approvals
  pendingApprovalId?: string;

  // Metadata
  userId: string;
  metadata: {
    featureName?: string;
    estimatedDuration?: number;
    tokenUsage?: number;
  };
}
```

#### Approval Request

```typescript
interface ApprovalRequest {
  id: string;
  executionId: string;
  workflow: string;
  checkpoint: 'prd' | 'design' | 'tasks' | 'code' | 'reflection';

  // Content
  content: string;
  contentType: 'markdown' | 'code' | 'json';

  // Quality metrics
  qualityMetrics?: {
    confidence?: number;
    testCoverage?: number;
    lintErrors?: number;
    typeErrors?: number;
    codeReviewScore?: number;
  };

  // Approval state
  status: 'pending' | 'approved' | 'rejected';
  reviewer?: string;
  reviewedAt?: Date;
  reviewNotes?: string;

  // Iteration tracking
  iteration: number;  // If rejected and regenerated
  previousVersionId?: string;

  // Timestamps
  createdAt: Date;
  expiresAt?: Date;
}
```

#### Quality Metrics History

```typescript
interface QualityMetricsSnapshot {
  id: string;
  executionId: string;
  checkpoint: string;
  timestamp: Date;

  metrics: {
    // Test metrics
    testsPassed: number;
    testsFailed: number;
    testCoverage: number;

    // Static analysis
    lintErrors: number;
    lintWarnings: number;
    typeErrors: number;

    // Code quality
    maintainabilityIndex?: number;
    cyclomaticComplexity?: number;
    duplicatedLines?: number;

    // LLM metrics
    confidence?: number;
    tokens?: number;
    latency?: number;

    // Custom metrics
    [key: string]: any;
  };

  passed: boolean;
  gates: Array<{
    name: string;
    passed: boolean;
    threshold: number;
    actual: number;
  }>;
}
```

---

### API Design

```typescript
// RESTful API for observability and approvals

// Executions
POST   /api/executions                    # Start new workflow
GET    /api/executions                    # List executions
GET    /api/executions/:id                # Get execution details
POST   /api/executions/:id/pause          # Pause execution
POST   /api/executions/:id/resume         # Resume execution
DELETE /api/executions/:id                # Cancel execution

// Logs & Streaming
GET    /api/executions/:id/logs           # Get logs (paginated)
GET    /api/executions/:id/logs/stream    # SSE stream of logs

// Traces
GET    /api/traces/:traceId               # Get full trace
GET    /api/traces/:traceId/spans         # Get all spans in trace

// Approvals
POST   /api/approvals                     # Create approval request
GET    /api/approvals                     # List approvals (with filters)
GET    /api/approvals/:id                 # Get approval details
POST   /api/approvals/:id/approve         # Approve
POST   /api/approvals/:id/reject          # Reject with feedback

// Quality Metrics
GET    /api/executions/:id/quality        # Get quality metrics
POST   /api/executions/:id/quality        # Record quality metrics
GET    /api/quality/trends                # Historical quality trends

// Analytics
GET    /api/analytics/approvals           # Approval rate, rejection reasons
GET    /api/analytics/quality             # Quality trends over time
GET    /api/analytics/performance         # Execution time, token usage
```

---

## Part 8: Custom Interface Design

### Approval Dashboard Mockup

```
┌─────────────────────────────────────────────────────────────────┐
│  Class One Rapids - Workflow Observability                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Dashboard] [Approvals] [Executions] [Analytics]              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Pending Approvals (3)                    [Filter ▼] [Sort ▼]  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ PRD Review - User Authentication Feature                │  │
│  │ ⏱️ 5 minutes ago • Confidence: 89% • 🟢 Quality: Pass   │  │
│  │ [Review] [Quick Approve ✓] [Reject ✗]                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Design Review - Authentication Architecture              │  │
│  │ ⏱️ 12 minutes ago • Confidence: 72% • 🟡 Quality: Warning│  │
│  │ [Review] [Quick Approve ✓] [Reject ✗]                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Code Review - Login Component                            │  │
│  │ ⏱️ 1 hour ago • Coverage: 85% • 🔴 Lint Errors: 3        │  │
│  │ [Review] [Quick Approve ✓] [Reject ✗]                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Recent Executions                                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ next-feature-full-flow - User Auth                       │  │
│  │ ⏸️ Paused at Design Review • 15 min runtime              │  │
│  │ [View Logs] [View Trace]                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ execute-tasks - Password Reset                           │  │
│  │ ✅ Completed • 2.3 hours • 145K tokens                   │  │
│  │ [View Results] [View Trace]                              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Approval View

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Approvals                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PRD Review - User Authentication Feature                       │
│  Execution #abc123 • Created 5 minutes ago                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Content] [Quality Metrics] [Trace] [History]                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  # User Authentication Feature - PRD                            │
│                                                                 │
│  ## Executive Summary                                           │
│  This feature implements secure user authentication...          │
│                                                                 │
│  ## Problem Statement                                           │
│  Currently, users cannot create accounts or log in...           │
│                                                                 │
│  [Full PRD content rendered as markdown...]                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Quality Metrics                                                │
│                                                                 │
│  Overall: 🟢 Pass                                               │
│                                                                 │
│  • Confidence Score: 89% (threshold: 85%) ✓                    │
│  • Completeness: 12/12 sections ✓                              │
│  • Word Count: 2,847 (min: 1,500) ✓                            │
│  • Readability: Grade 10 (target: < 12) ✓                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Actions                                                        │
│                                                                 │
│  [Approve & Continue to Design ✓]  [Reject & Regenerate ✗]    │
│                                                                 │
│  Feedback (optional):                                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Looks good, but please add more detail on MFA           │  │
│  │ requirements and session timeout policies.              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [ ] Apply feedback and approve                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Live Execution Monitor

```
┌─────────────────────────────────────────────────────────────────┐
│  Execution Monitor - next-feature-full-flow #abc123             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Status: ⏸️ Paused (awaiting approval)                          │
│  Runtime: 15 minutes 32 seconds                                 │
│  Tokens: 12,458 / ~50,000 estimated                            │
│  Cost: $0.42 / ~$1.50 estimated                                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Progress                                                       │
│                                                                 │
│  [██████████████████████░░░░░░░░] 60%                          │
│                                                                 │
│  ✅ /next-feature - Feature Description (2 min, 1.2K tokens)   │
│  ✅ /prd - Product Requirements (8 min, 4.5K tokens)           │
│  ✅ /design - Technical Design (5 min, 6.8K tokens)            │
│  ⏸️ Approval Required - PRD Review                             │
│  ⏳ /tasks - Task Generation (pending)                         │
│  ⏳ /execute-tasks - Implementation (pending)                  │
│  ⏳ /reflect - Process Reflection (pending)                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Live Logs                              [Auto-scroll] [Filter] │
│                                                                 │
│  [15:32:45] INFO  Starting /design command                     │
│  [15:32:46] INFO  Reading PRD from prd_user_auth_20251019.md  │
│  [15:32:47] INFO  Analyzing requirements...                    │
│  [15:33:12] INFO  Generated system architecture diagram        │
│  [15:34:28] INFO  Completed API design section                 │
│  [15:37:15] INFO  Design document generated successfully       │
│  [15:37:16] INFO  Creating approval request...                 │
│  [15:37:17] WARN  Execution paused for human review            │
│                                                                 │
│  ▼ Waiting for approval... [View Approval Request →]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 9: Implementation Recommendations

### Quick Start (Minimal Setup)

If you want to get started quickly with minimal infrastructure:

1. **Logging**: Write structured logs to files, display with `tail -f`
   ```typescript
   // Simple file-based logging
   import fs from 'fs';

   function log(level: string, message: string, metadata?: any) {
     const entry = {
       timestamp: new Date().toISOString(),
       level,
       message,
       ...metadata
     };
     fs.appendFileSync('workflow.log', JSON.stringify(entry) + '\n');
   }
   ```

2. **Approvals**: Use simple CLI prompts
   ```typescript
   import prompts from 'prompts';

   async function requestApproval(content: string): Promise<boolean> {
     console.log('\n--- APPROVAL REQUIRED ---\n');
     console.log(content);

     const response = await prompts({
       type: 'confirm',
       name: 'approved',
       message: 'Approve and continue?',
       initial: true
     });

     return response.approved;
   }
   ```

3. **Quality**: Run scripts synchronously and display results
   ```bash
   npm test && npm run lint && npm run type-check
   ```

**Timeline**: 1-2 days
**Effort**: Low
**Scalability**: Limited (single user, no persistence)

---

### Production Setup (Full System)

For a production-ready observability system:

1. **Deploy Langfuse** (self-hosted via Docker Compose)
2. **Build approval API** (Node.js + PostgreSQL)
3. **Create React Native dashboard** (reuse app codebase)
4. **Set up SSE streaming** for real-time logs
5. **Integrate quality scripts** into workflow executor
6. **Add notifications** (email, push, Slack)

**Timeline**: 6-8 weeks
**Effort**: High
**Scalability**: Production-ready

---

### Hybrid Approach (Recommended)

Start simple, add features incrementally:

**Week 1**: File logging + CLI approvals
**Week 2**: Basic Langfuse integration for traces
**Week 3**: Simple web dashboard for viewing logs
**Week 4**: Approval queue API
**Week 5**: React Native approval UI
**Week 6**: SSE streaming
**Week 7**: Quality automation
**Week 8**: Analytics & insights

This allows you to get value quickly while building toward a full system.

---

## Part 10: Key Recommendations Summary

### Top Priorities

1. **Start with OpenTelemetry** for distributed tracing
   - Future-proof, vendor-neutral
   - Works with any observability backend
   - Industry standard

2. **Use Langfuse for LLM observability**
   - Self-hostable (data privacy)
   - Comprehensive LLM-specific features
   - Active community

3. **Implement Server-Sent Events** for log streaming
   - Simpler than WebSockets for one-way logs
   - Automatic reconnection
   - Easy debugging

4. **Build custom approval system** (don't use external ticketing)
   - Full control over UX
   - Tight integration with workflow
   - Real-time updates

5. **Automate quality checks** but require human review on failures
   - ESLint, TypeScript, Jest coverage as gates
   - LLM-based code review for additional insights
   - Human approval for low-confidence or failing outputs

### Architecture Principles

- **Trace everything**: Every command execution should create spans
- **Stream logs in real-time**: Use SSE to show live progress
- **Gate quality**: Don't proceed if quality checks fail
- **Enable human oversight**: Critical decisions need approval
- **Learn from feedback**: Track rejection reasons to improve prompts
- **Measure everything**: Tokens, cost, time, quality, approval rates

### Anti-Patterns to Avoid

❌ **Don't** build everything at once (incremental is better)
❌ **Don't** skip tracing (you can't debug what you can't see)
❌ **Don't** auto-approve low-confidence outputs (defeats the purpose)
❌ **Don't** use WebSockets for logs (SSE is simpler and better)
❌ **Don't** ignore quality metrics (measure code quality objectively)

---

## Part 11: Next Steps

### Immediate Actions

1. **Set up Langfuse** (cloud or self-hosted)
2. **Add basic tracing** to existing slash commands
3. **Create approval checkpoints** in `/next-feature-full-flow`
4. **Build simple approval UI** (CLI or web)
5. **Integrate quality scripts** into workflow

### Research & Experimentation

1. **Try LangGraph** for workflow orchestration
2. **Experiment with LLM code review** prompts
3. **Test different confidence thresholds** for auto-approval
4. **Benchmark quality metrics** on existing code
5. **A/B test prompt variations** and track quality differences

### Long-Term Enhancements

1. **Analytics dashboard** showing trends over time
2. **Prompt optimization** based on approval/rejection patterns
3. **Multi-user approvals** with role-based permissions
4. **Integration with CI/CD** for automated deployments
5. **Learning loop** that improves prompts automatically

---

## Conclusion

Implementing comprehensive observability for multi-command LLM workflows requires:

1. **Distributed tracing** (OpenTelemetry + Langfuse) to track execution across commands
2. **Real-time streaming** (Server-Sent Events) to monitor progress live
3. **Human-in-the-loop** systems to approve critical outputs before proceeding
4. **Quality automation** (static analysis + LLM review + tests) to validate code
5. **Custom interfaces** tailored to the specific workflow (approvals, monitoring, analytics)

Start with the **hybrid approach**: implement basic logging and approvals immediately, then incrementally add observability, streaming, and quality automation over 6-8 weeks.

The key is to **measure everything**, **gate on quality**, and **learn from feedback** to continuously improve the LLM workflow system.

---

## References

- [Langfuse Documentation](https://langfuse.com/docs)
- [OpenTelemetry Tracing](https://opentelemetry.io/docs/concepts/signals/traces/)
- [Server-Sent Events Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [SonarQube Code Quality Metrics](https://docs.sonarqube.org/latest/user-guide/metric-definitions/)
- [HumanEval Benchmark](https://github.com/openai/human-eval)
- [EU AI Act - Article 14](https://artificialintelligenceact.eu/article/14/)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-19
**Author**: Research conducted via web search and synthesis
**Status**: Ready for review and implementation planning
