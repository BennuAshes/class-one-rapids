# Which Observability Stack Should I Use?

## TL;DR: Use Langfuse (Recommended)

**Primary Option**: Langfuse stack (`./start.sh`)
**Alternative**: Grafana stack (`./start-grafana.sh`)

---

## Option 1: Langfuse Stack ⭐ RECOMMENDED

**Start with**: `./start.sh`

### Why Langfuse is Recommended

✅ **Built specifically for LLMs**
- Understands tokens, prompts, and costs
- Beautiful trace visualization for multi-step workflows
- Automatic cost calculation per execution
- Prompt versioning and management
- Evaluation and testing tools

✅ **100% Open Source**
- MIT License (very permissive)
- Self-hosted - all data stays local
- No external dependencies
- GitHub: https://github.com/langfuse/langfuse

✅ **Better for your use case**
- Tracks Claude Code workflows perfectly
- Shows parent-child span relationships
- Captures LLM-specific metadata
- Built-in cost analytics

### About the "API Keys"

**Important**: The API keys are just authentication for YOUR local instance!

- Not connected to any external service
- Not a paid service
- Just like creating a password on your own app
- Stored in YOUR PostgreSQL database
- Used to separate projects and track users

**Setup**: Takes 2 minutes to create keys in the UI after first login.

### What You Get

- **LLM Traces**: Complete workflow execution trees
- **Token Tracking**: Input/output tokens per command
- **Cost Analytics**: Estimated costs per execution
- **Prompt Management**: Version and test prompts
- **Evaluations**: Score and evaluate outputs
- **Sessions**: Group related executions
- **Beautiful UI**: Designed for LLM workflows

---

## Option 2: Grafana Stack (Alternative)

**Start with**: `./start-grafana.sh`

### When to Use Grafana Stack

Use this if:
- ❓ You're already familiar with Grafana
- ❓ You prefer Grafana's interface
- ❓ You want zero UI setup (anonymous access)
- ❓ You need custom dashboards for non-LLM metrics

### What You Get

- **Prometheus**: Metrics storage
- **Loki**: Log aggregation
- **Tempo**: Distributed tracing
- **Grafana**: Unified visualization
- **No authentication**: Anonymous admin access (dev mode)

### What You DON'T Get

- ❌ LLM-specific features (tokens, costs, prompts)
- ❌ Automatic cost calculation
- ❌ Prompt management
- ❌ Pre-built dashboards (have to create yourself)
- ❌ Evaluation tools

### Setup

Zero setup - just start and go to http://localhost:3000

---

## Comparison Table

| Feature | Langfuse | Grafana Stack |
|---------|----------|---------------|
| **License** | MIT (FOSS) | Apache/AGPL (FOSS) |
| **Setup time** | 2 mins (create keys) | 0 mins (anonymous) |
| **LLM-specific** | ✅ Yes | ❌ No |
| **Token tracking** | ✅ Automatic | ⚠️ Manual |
| **Cost analytics** | ✅ Built-in | ❌ None |
| **Trace UI** | ✅ LLM-optimized | ⚠️ Generic |
| **Prompt management** | ✅ Yes | ❌ No |
| **Evaluations** | ✅ Yes | ❌ No |
| **Custom dashboards** | ⚠️ Limited | ✅ Full Grafana |
| **Authentication** | ✅ Multi-user | ⚠️ Anonymous (dev) |
| **Best for** | LLM workflows | Generic observability |

---

## My Recommendation

**Start with Langfuse** (`./start.sh`). It's:

1. Built for your exact use case (Claude Code workflows)
2. 100% FOSS (MIT license)
3. Self-hosted (all data local)
4. Better UX for LLM observability
5. Only 2 minutes of setup

The "API keys" concern is a non-issue - they're just local authentication tokens, not external service credentials.

**Try Grafana later** if you need custom dashboards for non-LLM metrics or want to visualize infrastructure alongside LLM data.

---

## Quick Start Commands

### Langfuse (Recommended)
```bash
./start.sh
# Open http://localhost:3000
# Create account + project
# Get API keys from Settings
# Configure in otel-collector-config.yaml
# Restart: docker-compose restart otel-collector
```

### Grafana (Alternative)
```bash
./start-grafana.sh
# Open http://localhost:3000 (no login needed)
# Go to Explore → Tempo
# Run workflow and search for traces
```

---

## Both Are Great!

Both stacks are:
- ✅ 100% Open Source
- ✅ Self-hosted
- ✅ No vendor lock-in
- ✅ Free forever
- ✅ Privacy-respecting

**Langfuse** is just more tailored to LLM workflows, which is why it's recommended for your use case.

---

**Questions?** See `/observability/README.md` for detailed setup guides for both options.
