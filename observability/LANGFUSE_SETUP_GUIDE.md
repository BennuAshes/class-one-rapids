# Langfuse Setup Guide - Complete Walkthrough

## 🎯 Overview

This guide walks you through connecting Claude Code telemetry to Langfuse for LLM observability.

## 🏗️ Architecture

```
Claude Code (native OTEL support)
        │
        └─► Sends telemetry via OTLP HTTP (port 4318)
                │
                ▼
        OpenTelemetry Collector
                │
                ├─► Langfuse (traces, logs, LLM metrics)
                └─► Prometheus (general metrics)
                        │
                        ▼
                    Grafana (dashboards)
```

## ✅ Prerequisites

- Docker and Docker Compose installed
- Claude Code with native OTEL support
- Port 3000, 3001, 4317, 4318, 9090 available

## 📋 Step-by-Step Setup

### Step 1: Start the Observability Stack

```bash
cd observability
docker-compose up -d
```

Wait 30-60 seconds for all services to initialize:

```bash
docker-compose ps
```

All services should show "Up" status.

### Step 2: Access Langfuse Web UI

1. Open your browser
2. Navigate to: **http://localhost:3000**
3. You should see the Langfuse welcome/sign-up page

**✅ Checkpoint**: If you can't access localhost:3000, check:

```bash
docker-compose logs langfuse-web
curl -I http://localhost:3000  # Should return 200 OK
```

### Step 3: Create Your Admin Account

1. On the Langfuse UI, click **Sign Up**
2. Enter your details:
   - Email (can be fake for local dev, e.g., `admin@localhost`)
   - Password (remember this!)
   - Name
3. Click **Create Account**
4. Sign in with your credentials

### Step 4: Create a Project

1. After signing in, you'll be prompted to create a project
2. Project name: **"Claude Code Observability"** (or your preference)
3. Click **Create Project**

### Step 5: Generate API Keys

1. Navigate to **Settings** (gear icon) → **API Keys**
2. Click **Create New API Key**
3. Give it a name: **"OTEL Collector"**
4. Copy both keys immediately:
   - **Public Key** (starts with `pk-lf-...`)
   - **Secret Key** (starts with `sk-lf-...`)

**⚠️ Important**: The secret key is only shown once! Save it securely.

### Step 6: Update OTEL Collector Configuration

**Option A: Use the automated script (recommended)**

On Windows (PowerShell):

```powershell
cd observability
.\update-langfuse-auth.ps1 "pk-lf-your-public-key" "sk-lf-your-secret-key"
```

On Linux/WSL:

```bash
cd observability
chmod +x update-langfuse-auth.sh
./update-langfuse-auth.sh "pk-lf-your-public-key" "sk-lf-your-secret-key"
```

**Option B: Manual update**

1. Generate base64 auth string:

   ```bash
   echo -n "pk-lf-xxx:sk-lf-yyy" | base64
   ```

2. Edit `otel-collector-config.yaml`:
   ```yaml
   exporters:
     otlphttp/langfuse:
       endpoint: http://langfuse-web:3000/api/public/otel
       headers:
         authorization: "Basic YOUR_BASE64_STRING_HERE"
   ```

### Step 7: Restart OTEL Collector

```bash
docker-compose restart otel-collector
```

Check logs to verify no errors:

```bash
docker-compose logs -f otel-collector
```

You should see: `Everything is ready. Begin running and processing data.`

### Step 8: Test the Connection

**Method 1: Quick test with curl**

Send a test trace to the OTEL collector:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -d '{
    "resourceSpans": [{
      "resource": {
        "attributes": [{
          "key": "service.name",
          "value": {"stringValue": "test-service"}
        }]
      },
      "scopeSpans": [{
        "spans": [{
          "traceId": "0123456789abcdef0123456789abcdef",
          "spanId": "0123456789abcdef",
          "name": "test-span",
          "kind": 1,
          "startTimeUnixNano": "1699564800000000000",
          "endTimeUnixNano": "1699564801000000000"
        }]
      }]
    }]
  }'
```

**Method 2: Run a Claude Code workflow**

If you have the workflow script:

```bash
cd ..
./scripts/next-feature-full-flow-observable.sh "test feature"
```

### Step 9: Verify Data in Langfuse

1. Go back to **http://localhost:3000**
2. Navigate to your project
3. Click on **Traces** in the sidebar
4. You should see incoming traces!

**Search tips:**

- Filter by `service.name = claude-code`
- Filter by `execution.id` for specific workflow runs
- Use the search bar to find specific spans

## 🎨 Explore Langfuse Features

### Traces View

- See complete execution trees
- Drill down into individual spans
- View timing and latency

### Metrics View

- Token usage (input/output/cache)
- Cost calculations per trace
- Performance metrics

### Sessions View

- Group traces by session
- Track user workflows
- Analyze patterns

### Prompts View

- Store and version prompts
- Track prompt performance
- A/B test different prompts

## 🔧 Troubleshooting

### Issue: Can't access localhost:3000

**Check if Langfuse is running:**

```bash
docker-compose ps langfuse-web
```

**Check logs:**

```bash
docker-compose logs langfuse-web
```

**Test connectivity:**

```bash
curl -I http://localhost:3000
# Should return: HTTP/1.1 200 OK
```

### Issue: 404 errors in OTEL collector logs

**Symptom:**

```
error exporting items, request to http://langfuse-web:3000/api/public/otel/v1/logs
responded with HTTP Status Code 404
```

**Causes:**

1. ❌ Using incorrect endpoint path
2. ❌ Langfuse version too old (need v3.22.0+)
3. ❌ Invalid API keys

**Fix:**

1. Verify endpoint is `/api/public/otel` (not `/api/public/otel/v1/logs`)
2. Update API keys using the script (Step 6)
3. Restart collector: `docker-compose restart otel-collector`

### Issue: Authentication errors (401)

**Symptom:**

```
error exporting items, request responded with HTTP Status Code 401
```

**Fix:**

1. Verify your API keys are correct
2. Re-generate the base64 string:
   ```bash
   echo -n "your-public-key:your-secret-key" | base64
   ```
3. Update `otel-collector-config.yaml`
4. Restart: `docker-compose restart otel-collector`

### Issue: No traces appearing in Langfuse

**Check OTEL collector logs:**

```bash
docker-compose logs -f otel-collector
```

Look for:

- ✅ "Everything is ready" message
- ❌ Any export errors
- ❌ Connection refused errors

**Check if telemetry is being sent:**

```bash
# Check if environment variables are set
env | grep OTEL

# Should see:
# CLAUDE_CODE_ENABLE_TELEMETRY=1
# OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

**Check Langfuse logs:**

```bash
docker-compose logs -f langfuse-web
```

### Issue: Port conflicts

If port 3000 is already in use:

1. Edit `docker-compose.yml`:

   ```yaml
   langfuse-web:
     ports:
       - "3002:3000" # Change to different port
   ```

2. Restart:

   ```bash
   docker-compose up -d
   ```

3. Access at: http://localhost:3002

## 📊 Accessing Other Services

### Grafana (Metrics Dashboards)

- **URL**: http://localhost:3001
- **Login**: admin / admin
- **Data Source**: Prometheus (pre-configured)

### Prometheus (Raw Metrics)

- **URL**: http://localhost:9090
- **Query**: `claude_code_*` to see all metrics
- **No login required**

### OTEL Collector Health

- **Health**: http://localhost:13133
- **Metrics**: http://localhost:8889/metrics

## 🔐 Security Notes

**⚠️ This is a DEVELOPMENT setup only!**

For production:

1. ✅ Change all passwords in `docker-compose.yml`
2. ✅ Use HTTPS with proper certificates
3. ✅ Use secrets management (not hardcoded)
4. ✅ Configure firewall rules
5. ✅ Enable encryption at rest
6. ✅ Set up backup procedures

## 📚 Additional Resources

- [Langfuse Documentation](https://langfuse.com/docs)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)
- [Langfuse OpenTelemetry Guide](https://langfuse.com/docs/opentelemetry)

## 🎉 Next Steps

Now that Langfuse is set up:

1. **Create custom dashboards** in Grafana
2. **Set up alerts** for high costs or errors
3. **Integrate Langfuse SDK** in your custom scripts
4. **Track prompts** and evaluate performance
5. **Monitor token usage** and optimize costs

---

**Need help?** Check the logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f langfuse-web
docker-compose logs -f otel-collector
docker-compose logs -f grafana
```
