# Issue Resolved: 404 Error in OTEL Collector

## 🔍 Problem Identified

Your Langfuse instance at `http://localhost:3000` was running correctly, but no data was appearing because:

**Root Cause**: The OTEL Collector was trying to send **logs** to Langfuse, but Langfuse **only supports OTLP traces** (not logs or metrics).

### Error Details

```
error exporting items, request to http://langfuse-web:3000/api/public/otel/v1/logs
responded with HTTP Status Code 404
```

## ✅ Fix Applied

Modified `otel-collector-config.yaml` to:

- **Keep** traces pipeline → Langfuse ✅
- **Keep** metrics pipeline → Prometheus ✅
- **Remove** Langfuse from logs pipeline (now only goes to debug)

```yaml
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch, resource]
      exporters: [otlphttp/langfuse, debug] # ✅ Traces to Langfuse

    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch, resource]
      exporters: [prometheus, debug] # ✅ Metrics to Prometheus

    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch, resource]
      exporters: [debug] # ❌ Langfuse doesn't support logs
```

## 📊 What Langfuse Supports

| Signal Type | Langfuse Support | Configured Destination        |
| ----------- | ---------------- | ----------------------------- |
| **Traces**  | ✅ YES           | Langfuse (`/api/public/otel`) |
| **Metrics** | ❌ NO            | Prometheus (port 9090)        |
| **Logs**    | ❌ NO            | Debug only (dropped)          |

## 🎯 Next Steps to See Data

### 1. Verify Langfuse is Ready

Access Langfuse at: **http://localhost:3000**

You should be able to:

- ✅ Log in
- ✅ See your project
- ✅ Navigate to "Traces" section

### 2. Send Some Test Data

The OTEL collector is now ready to receive traces. You need an application to send data to it.

**Option A: Test with curl (quick verification)**

```powershell
$trace = @{
    resourceSpans = @(
        @{
            resource = @{
                attributes = @(
                    @{
                        key = "service.name"
                        value = @{ stringValue = "test-service" }
                    }
                )
            }
            scopeSpans = @(
                @{
                    spans = @(
                        @{
                            traceId = "0123456789abcdef0123456789abcdef"
                            spanId = "0123456789abcdef"
                            name = "test-span"
                            kind = 1
                            startTimeUnixNano = "1699564800000000000"
                            endTimeUnixNano = "1699564801000000000"
                            attributes = @(
                                @{
                                    key = "test.attribute"
                                    value = @{ stringValue = "test-value" }
                                }
                            )
                        }
                    )
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri "http://localhost:4318/v1/traces" `
    -Method POST `
    -ContentType "application/json" `
    -Body $trace
```

**Option B: Run Your Observable Workflow**

If you have workflow scripts that generate telemetry:

```bash
./scripts/next-feature-full-flow-observable.sh "test feature"
```

**Option C: Instrument Your React Native App**

Install Langfuse SDK in your app:

```bash
cd frontend
npm install langfuse
```

Then add tracing to your code:

```typescript
import { Langfuse } from "langfuse";

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: "http://localhost:3000",
});

// In your code
const trace = langfuse.trace({
  name: "user-action",
  metadata: { feature: "button-click" },
});

// Trace your operations
const span = trace.span({
  name: "api-call",
  input: { endpoint: "/api/data" },
});

// ... your code ...

span.end({ output: { status: 200 } });
trace.update({ output: { success: true } });
```

### 3. Verify Data Appears in Langfuse

1. Go to http://localhost:3000
2. Select your project
3. Click **"Traces"** in the left sidebar
4. You should see your traces appear!

**Search/Filter Options:**

- Filter by `service.name`
- Filter by time range
- Search by trace ID
- View span details

## 📊 Alternative: View Metrics in Prometheus/Grafana

If you're sending metrics (from Claude Code or your app):

**Prometheus (Raw Metrics):**

- URL: http://localhost:9090
- Query: `claude_code_*` or `{service_name="your-service"}`

**Grafana (Dashboards):**

- URL: http://localhost:3001
- Login: admin / admin
- Add Prometheus data source (already configured)
- Create custom dashboards

## 🔧 Troubleshooting

### If you still don't see traces in Langfuse:

**1. Check OTEL Collector is receiving data:**

```powershell
docker-compose logs --tail=100 otel-collector | Select-String "Traces","spans"
```

**2. Verify no errors:**

```powershell
docker-compose logs --tail=50 otel-collector | Select-String "error"
```

**3. Check Langfuse logs:**

```powershell
docker-compose logs --tail=50 langfuse-web | Select-String "otel","error"
```

**4. Verify API keys are correct:**
The base64 string in your config should decode to: `public-key:secret-key`

To verify:

```powershell
$base64 = "cGstbGYtZTdiMjViOWMtMzU2Zi00MjY4LTk2Y2YtMDczMThhNGE1ZWU0OnNrLWxmLTk4MGJjZGU3LWZmODQtNDBiMi1iMTI3LTFlNjhhMGI2YzQwNg=="
$decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($base64))
Write-Host $decoded
```

Should output: `pk-lf-...:sk-lf-...`

Compare with your actual keys from Langfuse Settings → API Keys.

## 🎉 Summary

- ✅ **Fixed**: Removed unsupported logs from Langfuse export
- ✅ **Working**: Traces → Langfuse (port 3000)
- ✅ **Working**: Metrics → Prometheus (port 9090) → Grafana (port 3001)
- ✅ **Ready**: OTEL Collector accepting data on ports 4317/4318

**Your observability stack is now correctly configured!**

Next: Send some trace data to see it visualized in Langfuse.

---

**Date Fixed**: 2025-10-25  
**Issue**: OTLP logs 404 error  
**Solution**: Remove logs from Langfuse pipeline (not supported)
