# Claude Code Observability Stack

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
| **OTEL Collector** | 4317 (gRPC), 4318 (HTTP) | Telemetry data collection and routing |
| **PostgreSQL** | 5432 | Langfuse database |

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
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
export OTEL_RESOURCE_ATTRIBUTES="service.name=next-feature-full-flow,execution.id=<id>"
```

## What Gets Tracked

### In Langfuse:
- ✅ **Traces**: Complete workflow execution tree
- ✅ **Spans**: Each command (PRD, design, tasks)
- ✅ **Token Usage**: Input/output tokens per command
- ✅ **Costs**: Calculated per execution
- ✅ **Timing**: Latency for each step
- ✅ **Metadata**: Execution ID, feature description

### In Prometheus/Grafana:
- ✅ **Request counts** by service
- ✅ **Token throughput** over time
- ✅ **Error rates** and failures
- ✅ **Latency percentiles** (p50, p95, p99)
- ✅ **Resource usage** of observability stack

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
