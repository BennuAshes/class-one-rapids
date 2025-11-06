# Claude Code Observability Stack

Complete observability setup for tracking Claude Code workflows.

## 📌 Which Stack Should I Use?

**⭐ RECOMMENDED: Langfuse Stack** (`./start.sh`) - See [WHICH_STACK.md](./WHICH_STACK.md) for comparison

**Alternative: Grafana Stack** (`./start-grafana.sh`) - For those who prefer Grafana interface

**Both are 100% FOSS!** Langfuse is just better for LLM workflows.

---

## Langfuse Stack (Primary Option)

Complete observability setup for tracking Claude Code workflows with Langfuse, Grafana, and Prometheus.

## Architecture

```
Claude Code (with native OTEL)
        │
        ▼ (OTLP HTTP/protobuf on port 4318)
        │
OpenTelemetry Collector
        │
        ├──► Langfuse (LLM-specific observability)
        └──► Prometheus (metrics storage)
                │
                ▼
            Grafana (visualization)
```

## Components

| Service | Port | Purpose |
|---------|------|---------|
| **Langfuse Web** | 3000 | LLM observability UI - traces, prompts, costs |
| **Grafana** | 3001 | Metrics dashboards and visualization |
| **Prometheus** | 9090 | Metrics storage and queries |
| **Approval Server** | 8080 | Workflow approval management UI and API |
| **OTEL Collector** | 4317 (gRPC), 4318 (HTTP) | Telemetry data collection and routing |
| **PostgreSQL** | 5432 | Langfuse database |
| **ClickHouse** | 8123, 9000 | Langfuse events database |
| **Redis** | 6379 | Langfuse caching |
| **MinIO** | 9002 (API), 9003 (Console) | S3-compatible storage |

## Quick Start

### 1. Start the Observability Stack

```bash
cd observability
docker-compose up -d
```

Wait for all services to start (30-60 seconds):

```bash
docker-compose ps
```

All services should show "Up" status.

### 2. Initial Langfuse Setup

1. Open http://localhost:3000
2. Create your admin account (first user)
3. Create a new project (e.g., "Claude Code Workflows")
4. Go to **Settings** → **API Keys**
5. Copy your **Public Key** and **Secret Key**

### 3. Configure OTEL Collector Authentication

Update the OTEL collector configuration with your Langfuse keys:

```bash
# Create base64 encoded auth string
echo -n "your-public-key:your-secret-key" | base64

# Set environment variable
export LANGFUSE_AUTH="base64-encoded-string"

# Restart OTEL collector
docker-compose restart otel-collector
```

**Or** edit `otel-collector-config.yaml`:

```yaml
exporters:
  otlphttp/langfuse:
    endpoint: http://langfuse-web:3000/api/public/otel
    headers:
      authorization: "Basic YOUR_BASE64_STRING_HERE"
```

Then restart:
```bash
docker-compose restart otel-collector
```

### 4. Run Your Observable Workflow

```bash
cd ..
./scripts/next-feature-full-flow-observable.sh "your feature description"
```

The script will:
- ✅ Configure Claude Code's native OTEL support
- ✅ Generate feature description, PRD, design, tasks
- ✅ Send all telemetry to Langfuse + Prometheus
- ✅ Provide human approval checkpoints
- ✅ Track execution with unique ID

### 5. View Observability Data

**Langfuse (LLM-specific):**
- URL: http://localhost:3000
- View: Traces, token usage, costs, prompts
- Search by execution ID

**Approval Server (Workflow Management):**
- **Web UI**: http://localhost:8080 - Full-featured dashboard for managing approvals
- **API Info**: http://localhost:8080/api - API documentation
- Features: Real-time updates, file previews, structured feedback, approve/reject with feedback

**Grafana (Metrics):**
- URL: http://localhost:3001
- Login: admin / admin
- Data source: Prometheus (pre-configured)

**Prometheus (Raw metrics):**
- URL: http://localhost:9090
- Query: `claude_code_*`

## Environment Variables for Claude Code

The workflow script sets these automatically:

```bash
# OpenTelemetry (Claude Code native telemetry)
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
export OTEL_RESOURCE_ATTRIBUTES="service.name=feature-to-code,execution.id=<id>"

# Langfuse SDK (for direct tracing in your code)
export LANGFUSE_PUBLIC_KEY="pk-lf-e7b25b9c-356f-4268-96cf-07318a4a5ee4"
export LANGFUSE_SECRET_KEY="sk-lf-980bcde7-ff84-40b2-b127-1e68a0b6c406"
export LANGFUSE_HOST="http://localhost:3000"
```

## What Gets Tracked

### In Langfuse:
- ✅ **Traces**: Complete workflow execution tree
- ✅ **Spans**: Each command (PRD, design, tasks)
- ✅ **Token Usage**: Input/output tokens per command
- ✅ **Costs**: Calculated per execution
- ✅ **Timing**: Latency for each step
- ✅ **Metadata**: Execution ID, feature description
- ✅ **Custom Tracing**: Your own code with Langfuse SDK

### In Prometheus/Grafana:
- ✅ **Request counts** by service
- ✅ **Token throughput** over time
- ✅ **Error rates** and failures
- ✅ **Latency percentiles** (p50, p95, p99)
- ✅ **Resource usage** of observability stack

## Workflow Approval Server

The approval server provides a REST API and web UI for managing workflow approvals. It's automatically started as part of the docker-compose stack.

### Features

- **REST API**: Programmatic approval management
- **Real-time Updates**: SSE (Server-Sent Events) for live status
- **File Preview**: Read workflow artifacts and view changes
- **Structured Feedback**: Submit detailed feedback on rejections
- **Langfuse Integration**: Automatically tracks approval decisions

### API Endpoints

```
GET  /workflows                  - List all workflows
GET  /workflows/{id}             - Get workflow details
GET  /workflows/{id}/approvals   - Get pending approvals for workflow
POST /approvals/approve          - Approve a request
POST /approvals/reject           - Reject a request
POST /approvals/feedback         - Submit feedback
GET  /approvals/pending          - Get all pending approvals
GET  /events                     - SSE endpoint for real-time updates
GET  /files/read?path={path}     - Read file contents
GET  /health                     - Health check
```

### Example Usage

**Approve a request:**
```bash
curl -X POST http://localhost:8080/approvals/approve \
  -H "Content-Type: application/json" \
  -d '{"file_path": "/path/to/.approval_PRD.json"}'
```

**Reject with feedback:**
```bash
curl -X POST http://localhost:8080/approvals/reject \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "/path/to/.approval_PRD.json",
    "reason": "Missing requirements",
    "feedback": {
      "specific_issues": ["Unclear user stories", "No acceptance criteria"],
      "missing_elements": ["Performance requirements"],
      "suggested_improvements": ["Add user story details"],
      "rating": 2
    }
  }'
```

### Configuration

The approval server is configured via environment variables in docker-compose:

```yaml
environment:
  LANGFUSE_PUBLIC_KEY: ${LANGFUSE_PUBLIC_KEY:-}
  LANGFUSE_SECRET_KEY: ${LANGFUSE_SECRET_KEY:-}
  LANGFUSE_HOST: http://langfuse-web:3000
```

Set these environment variables on your host to enable Langfuse tracking of approvals.

### Web UI

The approval server includes a built-in web dashboard served at the root URL:

**Access the dashboard:**
```
http://localhost:8080
```

The UI automatically connects to the API on the same server and provides:
- Real-time workflow list with status
- Pending approval notifications
- One-click approve/reject
- Structured feedback forms
- File previews for PRDs, designs, and task lists
- Live updates via Server-Sent Events

**Alternative React App:**
There's also a standalone React app in `/approval-app` for development:
```bash
cd approval-app
npm install
npm start
```

## Using Langfuse SDK for Direct Tracing

In addition to automatic OTLP tracing from Claude Code, you can use the Langfuse SDK directly in your code:

### Quick Start

**Python:**
```bash
pip install langfuse
```

```python
from langfuse.decorators import observe

@observe()
def my_workflow_step():
    # Your code here - automatically traced!
    pass
```

**TypeScript/JavaScript:**
```bash
npm install langfuse
```

```typescript
import { Langfuse } from "langfuse";

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_HOST,
});

const trace = langfuse.trace({
  name: "my-workflow",
  sessionId: execution_id,
});
```

### Examples

See detailed examples in [examples/](./examples/):
- [Python SDK Examples](./examples/langfuse-tracing-python.py)
- [TypeScript SDK Examples](./examples/langfuse-tracing-typescript.ts)
- [Examples README](./examples/README.md)

### Use Cases for Direct SDK Tracing

1. **Custom automation scripts** - Track your own workflow steps
2. **React Native app monitoring** - Monitor user actions and performance
3. **LLM API calls** - Track Claude API calls with detailed token usage
4. **Complex workflows** - Create nested spans for detailed visibility

### Benefits of Dual Tracking

With both OTLP and Langfuse SDK:
- **OTLP**: Automatic tracking of Claude Code commands
- **Langfuse SDK**: Manual tracking of your custom code
- **Combined View**: Everything in one Langfuse dashboard!

## Troubleshooting

### Check if services are running:
```bash
cd observability
docker-compose ps
```

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f langfuse-web
docker-compose logs -f otel-collector
```

### Test OTEL endpoint:
```bash
curl -v http://localhost:4318/v1/traces
# Should return 405 Method Not Allowed (normal - needs POST)
```

### Verify Langfuse is receiving data:
1. Go to http://localhost:3000
2. Navigate to your project
3. Check **Traces** tab
4. Look for traces with service name `next-feature-full-flow`

### Common Issues:

**Issue**: No telemetry data in Langfuse
- Check OTEL collector logs: `docker-compose logs otel-collector`
- Verify authentication is configured correctly
- Ensure Langfuse API keys are correct

**Issue**: Claude Code not sending telemetry
- Verify environment variables are set: `env | grep OTEL`
- Check Claude Code version supports OTEL (recent versions)
- Try setting `OTEL_LOG_LEVEL=debug` for verbose logging

**Issue**: Port conflicts
- Change ports in `docker-compose.yml` if 3000, 3001, etc. are in use
- Update endpoint URLs accordingly

## Stopping the Stack

```bash
cd observability
docker-compose down

# To also remove volumes (deletes all data):
docker-compose down -v
```

## Data Persistence

Data is stored in Docker volumes:
- `langfuse_postgres_data`: Langfuse traces, projects, users
- `grafana_data`: Grafana dashboards and settings
- `prometheus_data`: Metrics (30-day retention by default)

## Security Notes

**⚠️ This is a development setup. For production:**

1. Change all passwords in `docker-compose.yml`
2. Use HTTPS with proper certificates
3. Set up authentication for Prometheus and Grafana
4. Use secrets management (not environment variables)
5. Configure firewall rules
6. Enable encryption at rest
7. Set up backup procedures

## Next Steps

1. **Create Grafana Dashboards**: Build custom dashboards for your workflow metrics
2. **Set up Alerts**: Configure alerts for errors, high costs, slow executions
3. **Human Approval Integration**: Build a web UI for approval checkpoints
4. **Quality Gates**: Add automated quality checks before approvals
5. **Cost Tracking**: Monitor token usage and set budget alerts

## Resources

- [Langfuse Documentation](https://langfuse.com/docs)
- [Claude Code Monitoring](https://docs.claude.com/en/docs/claude-code/monitoring-usage)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)

---

**Setup Date**: 2025-10-19
**Maintained By**: Class One Rapids Team
