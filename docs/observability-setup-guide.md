# Observable Multi-Command Workflow Implementation

**Created**: 2025-10-19
**Status**: Ready for testing

---

## What Was Implemented

A complete observability stack for tracking Claude Code multi-command workflows with:

1. ✅ **Claude Code native OpenTelemetry support** (no wrapper needed!)
2. ✅ **Langfuse** for LLM-specific observability (traces, costs, prompts)
3. ✅ **Grafana + Prometheus** for metrics visualization
4. ✅ **OpenTelemetry Collector** for routing telemetry data
5. ✅ **Observable workflow script** with human approval checkpoints
6. ✅ **Complete documentation** and quick-start guide

---

## File Structure

```
class-one-rapids/
├── observability/                    # Observability stack
│   ├── docker-compose.yml           # All services (Langfuse, Grafana, etc.)
│   ├── otel-collector-config.yaml   # OTEL collector configuration
│   ├── prometheus.yml               # Prometheus scrape config
│   ├── start.sh                     # Quick start script
│   ├── README.md                    # Complete setup guide
│   └── grafana/
│       └── provisioning/
│           └── datasources/
│               └── datasources.yml   # Auto-configure Prometheus
├── scripts/
│   └── next-feature-full-flow-observable.sh  # Observable workflow script
└── docs/
    ├── research/
    │   ├── llm_observability_monitoring_research_20251019.md
    │   └── claude_code_cursor_cli_observability_integration_20251019.md
    └── observability-setup-guide.md  # This file
```

---

## Quick Start (5 Minutes)

### Step 1: Start Observability Stack

```bash
cd observability
./start.sh
```

This starts:
- Langfuse (http://localhost:3000)
- Grafana (http://localhost:3001)
- Prometheus (http://localhost:9090)
- OpenTelemetry Collector (ports 4317, 4318)
- PostgreSQL (Langfuse database)

### Step 2: Configure Langfuse

1. Open http://localhost:3000
2. Create admin account (first user)
3. Create project: "Claude Code Workflows"
4. Go to Settings → API Keys
5. Copy your **Public Key** and **Secret Key**

### Step 3: Configure OTEL Collector

```bash
# Create base64 auth string
echo -n "pk-your-public-key:sk-your-secret-key" | base64

# Output: cGsteW91ci1wdWJsaWMta2V5OnNrLXlvdXItc2VjcmV0LWtleQ==
```

Edit `observability/otel-collector-config.yaml`:

```yaml
exporters:
  otlphttp/langfuse:
    endpoint: http://langfuse-web:3000/api/public/otel
    headers:
      authorization: "Basic cGsteW91ci1wdWJsaWMta2V5OnNrLXlvdXItc2VjcmV0LWtleQ=="
```

Restart:
```bash
docker-compose restart otel-collector
```

### Step 4: Run Observable Workflow

```bash
cd ..
./scripts/next-feature-full-flow-observable.sh "user authentication with OAuth2"
```

### Step 5: View Telemetry

**Langfuse** (http://localhost:3000):
- Navigate to your project
- Click **Traces** tab
- See complete workflow execution tree
- View token usage, costs, timing

**Grafana** (http://localhost:3001):
- Login: admin / admin
- Explore → Prometheus
- Query: `claude_code_*`

---

## How It Works

### Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│  ./next-feature-full-flow-observable.sh                 │
│  Sets OTEL environment variables                        │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Claude Code (native OTEL support)                      │
│  - Sends traces via OTLP HTTP/protobuf                  │
│  - Sends metrics every 60s                              │
│  - Sends logs every 5s                                  │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼ (port 4318)
┌─────────────────────────────────────────────────────────┐
│  OpenTelemetry Collector                                │
│  - Receives OTLP data                                   │
│  - Batches and processes                                │
│  - Routes to backends                                   │
└─────────────────────────────────────────────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────┐    ┌──────────────────────┐
│  Langfuse            │    │  Prometheus          │
│  (LLM observability) │    │  (Metrics storage)   │
└──────────────────────┘    └──────────────────────┘
                                      │
                                      ▼
                            ┌──────────────────────┐
                            │  Grafana             │
                            │  (Visualization)     │
                            └──────────────────────┘
```

### Environment Variables Set by Script

The workflow script automatically configures:

```bash
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
export OTEL_RESOURCE_ATTRIBUTES="service.name=next-feature-full-flow,execution.id=20251019_143022"
```

### Workflow Steps with Observability

1. **Generate Feature Description**
   - Claude Code sends trace with span "generate-feature"
   - Tracks tokens, timing, cost
   - Human approval checkpoint

2. **Generate PRD**
   - New span linked to parent trace
   - Full command context captured
   - Human approval checkpoint

3. **Generate Technical Design**
   - Spans continue building trace tree
   - All metadata preserved
   - Human approval checkpoint

4. **Generate Task List**
   - Complete workflow visible as trace hierarchy
   - Total cost and time calculated
   - Human approval checkpoint

5. **Summary**
   - Workflow summary generated
   - Links to observability dashboards
   - Execution ID for searching

---

## What Gets Tracked

### In Every Trace/Span:

**Metadata:**
- Execution ID (unique per workflow run)
- Service name: `next-feature-full-flow`
- Feature description
- Timestamp
- Span hierarchy (parent-child relationships)

**Performance:**
- Start time
- End time
- Duration
- Latency percentiles

**LLM Specific:**
- Model used (Claude Sonnet 4.5)
- Input tokens
- Output tokens
- Total tokens
- Estimated cost
- Prompt length (content redacted by default)

**Tool Usage:**
- Which tools were called (Read, Write, Bash, etc.)
- Tool execution time
- Tool success/failure

---

## Features Implemented

### 1. Native OpenTelemetry Integration ✅

No wrapper needed! Uses Claude Code's built-in OTEL support.

**Benefits:**
- Cross-platform (Windows, WSL, Linux, Mac)
- Official Anthropic support
- No extra dependencies
- Production-ready

### 2. Human-in-the-Loop Approval ✅

After each major step (PRD, Design, Tasks):
- Shows preview of generated content
- Options: Approve (y), Reject (n), Edit (e)
- Stops workflow if rejected
- Allows editing before continuing

### 3. Unique Execution Tracking ✅

Every workflow run gets:
- Unique execution ID (timestamp-based)
- Separate working directory
- Searchable in Langfuse/Grafana
- Complete audit trail

### 4. Multi-Backend Observability ✅

**Langfuse** for:
- LLM-specific insights
- Trace visualization
- Cost tracking
- Prompt management

**Prometheus + Grafana** for:
- Time-series metrics
- Custom dashboards
- Alerting
- Long-term trends

### 5. Workflow Outputs ✅

All artifacts saved to:
```
workflow-outputs/20251019_143022/
├── feature-description.md
├── prd_20251019.md
├── tdd_20251019.md
├── tasks_20251019.md
└── workflow-summary.md
```

---

## Advanced Usage

### Run Without Approval Checkpoints

Modify the script to skip approvals:

```bash
# Comment out approval checkpoint lines
# request_approval "Feature Description" "$FEATURE_FILE"
```

### Add Quality Gates

Before approval checkpoints, add quality checks:

```bash
# After generating PRD
echo "Running quality checks..."
npm run lint
npm run type-check
npm test

if [ $? -ne 0 ]; then
  echo "Quality checks failed - fix before approval"
  exit 1
fi

request_approval "PRD" "$PRD_FILE"
```

### Custom OTEL Attributes

Add more context to traces:

```bash
export OTEL_RESOURCE_ATTRIBUTES="service.name=next-feature-full-flow,execution.id=$EXECUTION_ID,user.email=you@example.com,environment=dev,team=engineering"
```

### Export to Multiple Backends

The OTEL collector can route to multiple destinations:

Edit `otel-collector-config.yaml`:
```yaml
exporters:
  otlphttp/langfuse:
    endpoint: http://langfuse-web:3000/api/public/otel
    headers:
      authorization: "Basic ..."

  otlp/datadog:
    endpoint: "https://api.datadoghq.com"
    headers:
      DD-API-KEY: "your-key"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch, resource]
      exporters: [otlphttp/langfuse, otlp/datadog]  # Multiple!
```

---

## Troubleshooting

### No Telemetry Data

**Check 1**: Is OTEL enabled?
```bash
env | grep CLAUDE_CODE_ENABLE_TELEMETRY
# Should show: CLAUDE_CODE_ENABLE_TELEMETRY=1
```

**Check 2**: Is OTEL collector running?
```bash
curl http://localhost:4318/v1/traces
# Should get 405 Method Not Allowed (normal - needs POST)
```

**Check 3**: OTEL collector logs
```bash
cd observability
docker-compose logs otel-collector | tail -50
```

Look for errors about authentication or connection failures.

**Check 4**: Langfuse authentication
```bash
# In otel-collector-config.yaml, verify authorization header is correct
# Format: Basic base64(public_key:secret_key)
```

### Claude Code Version

Claude Code's OTEL support is in **beta**. Ensure you have a recent version:

```bash
claude --version
```

### Port Conflicts

If ports 3000, 3001, etc. are in use, edit `docker-compose.yml`:

```yaml
services:
  langfuse-web:
    ports:
      - "3100:3000"  # Change external port
```

---

## Next Steps

### 1. Create Grafana Dashboards

Import or create dashboards for:
- Token usage over time
- Cost per workflow
- Average execution time
- Error rates
- Most expensive commands

### 2. Set Up Alerts

In Grafana, create alerts for:
- High token usage (> 50K tokens/hour)
- Expensive workflows (> $5/execution)
- Slow executions (> 30 minutes)
- Error rates (> 5%)

### 3. Build Approval UI

Create a web-based approval interface:
- List pending approvals
- Side-by-side diff view
- Batch approval
- Comments/feedback
- Notification system

### 4. Integrate with CI/CD

Add workflow to GitHub Actions:
```yaml
- name: Run Observable Workflow
  run: |
    ./observability/start.sh
    ./scripts/next-feature-full-flow-observable.sh "${{ github.event.issue.title }}"
```

### 5. Add Quality Automation

Integrate code quality tools:
- ESLint for code quality
- TypeScript for type checking
- Jest for test coverage
- SonarQube for static analysis

---

## Cost Estimation

Based on typical usage with Claude Sonnet 4.5:

| Workflow Step | Avg Tokens | Estimated Cost |
|---------------|------------|----------------|
| Feature Description | 1,500 | $0.05 |
| PRD Generation | 5,000 | $0.15 |
| Technical Design | 8,000 | $0.24 |
| Task List | 6,000 | $0.18 |
| **Total per workflow** | **~20,000** | **~$0.60** |

With observability, you can:
- Track actual costs per workflow
- Identify expensive steps
- Optimize prompts to reduce tokens
- Set budget alerts

---

## Security Considerations

**⚠️ This is a development setup**

For production use:

1. **Change default passwords** in `docker-compose.yml`
2. **Use secrets management** (not env vars)
3. **Enable HTTPS** with proper certificates
4. **Set up authentication** for all services
5. **Configure firewall rules**
6. **Enable audit logging**
7. **Implement backup procedures**
8. **Use private networks** for service communication
9. **Review Langfuse privacy settings** (prompt redaction)
10. **Rotate API keys** regularly

---

## Resources

- [Main Observability Research](./research/llm_observability_monitoring_research_20251019.md)
- [Claude Code CLI Integration](./research/claude_code_cursor_cli_observability_integration_20251019.md)
- [Observability Stack README](../observability/README.md)
- [Claude Code Monitoring Docs](https://docs.claude.com/en/docs/claude-code/monitoring-usage)
- [Langfuse Documentation](https://langfuse.com/docs)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)

---

## Summary

You now have:

✅ **Complete observability stack** running in Docker
✅ **Observable workflow script** with HITL approvals
✅ **Langfuse** for LLM-specific insights
✅ **Grafana** for metrics visualization
✅ **Full documentation** for setup and usage

**To get started:**
```bash
cd observability
./start.sh

# Then configure Langfuse API keys as described above

cd ..
./scripts/next-feature-full-flow-observable.sh "your feature idea"
```

**View results:**
- Langfuse: http://localhost:3000
- Grafana: http://localhost:3001

---

**Created by**: Claude Code Observability Research
**Date**: 2025-10-19
**Status**: ✅ Ready for testing
