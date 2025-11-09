# Langfuse v3 Worker Investigation - Final Summary

## Investigation Complete: Root Cause Identified

After comprehensive research of Langfuse v3 documentation, source code, and configuration, the root cause of your 16 stuck OTLP ingestion jobs has been identified and thoroughly documented.

---

## Quick Answer

**Your docker-compose.yml is using the wrong Docker image for the worker service.**

| Aspect | Current (BROKEN) | Correct (WORKING) |
|--------|------------------|-------------------|
| **Image** | `langfuse/langfuse:3` | `langfuse/langfuse-worker:3` |
| **Environment Variable** | `LANGFUSE_WORKER=true` | Not needed |
| **Why It's Wrong** | Web image doesn't process queues | Worker image has queue processing built-in |
| **Result** | Jobs stuck in Redis | Jobs processed within minutes |

---

## The Investigation

### 1. Documentation Research
- Searched Langfuse official docs at langfuse.com
- Reviewed deployment guides
- Checked self-hosting documentation
- **Finding**: No mention of `LANGFUSE_WORKER=true` anywhere. Official docs use separate `langfuse-worker:3` image.

### 2. GitHub Repository Analysis
- Reviewed `/worker/Dockerfile` - completely separate build
- Reviewed `/web/Dockerfile` - completely different
- Checked `worker/package.json` - lists BullMQ queue processors
- Checked `web/package.json` - lists Next.js and web UI libraries
- **Finding**: Two completely separate services with different purposes.

### 3. Source Code Examination
- **worker/src/app.ts**: Explicitly registers 23+ queue consumers
- **worker/src/env.ts**: All queue processing defaults to `true`
- **No LANGFUSE_WORKER variable**: Doesn't exist in environment schema
- **Dockerfiles are completely different**: Different entry points, different binaries
- **Finding**: Worker image is purpose-built for queue processing. Web image is not.

### 4. Docker Hub Verification
- `langfuse/langfuse-worker:3` exists and is active
- Updated: October 21, 2025
- Available in multiple architectures (amd64, arm64)
- Version tags: 3.119, 3.120, 3.121, 3.121.0, etc.
- **Finding**: Dedicated worker image is real, maintained, and actively used.

### 5. Official Configuration Reference
- Downloaded official docker-compose.yml from Langfuse GitHub
- Uses `langfuse/langfuse-worker:3` for worker
- Uses `langfuse/langfuse:3` for web
- Both share same environment variables
- **Finding**: This is the standard, recommended setup.

---

## Why Your Jobs Are Stuck

```
Sequence of Events:
1. OTLP trace arrives at web container API
2. Web container enqueues job to Redis (OtelIngestionQueue)
3. Job waits for a consumer
4. No consumer is registered (wrong image)
5. Job remains in Redis indefinitely
6. User sees 16 jobs that never process
```

The web image (`langfuse/langfuse:3`) handles steps 1-2 but not 3-5.
The worker image (`langfuse/langfuse-worker:3`) handles step 3-5.
You're only running the web image for worker, so step 3 never happens.

---

## The Fix

**Two simple changes to docker-compose.yml:**

### Change 1: Line 141
```yaml
# BEFORE (WRONG)
langfuse-worker:
  image: langfuse/langfuse:3

# AFTER (CORRECT)
langfuse-worker:
  image: langfuse/langfuse-worker:3
```

### Change 2: Line 185
```yaml
# DELETE THIS LINE (INVALID)
LANGFUSE_WORKER: true
```

### Apply and Restart
```bash
cd /mnt/c/dev/class-one-rapids/observability
docker-compose down
docker-compose up -d
```

---

## What Will Change

### Before Fix
- Worker container runs `web/server.js` (Next.js web server)
- No queue consumers registered
- 16 jobs stuck in Redis indefinitely
- Jobs never reach ClickHouse

### After Fix
- Worker container runs `worker/dist/index.js` (job processor)
- 23+ queue consumers automatically registered
- 16 jobs process within minutes
- Data flows to ClickHouse normally

---

## Verification

After applying the fix, you should see:

### In Logs
```bash
docker logs langfuse-worker | head -100
# Should show queue consumer registration messages:
# "Registering worker for otel-ingestion-queue-0"
# "Registering worker for ingestion-queue-0"
# etc.
```

### In Redis
```bash
docker exec langfuse-redis redis-cli
> KEYS "otel*"
# Should show queue keys like:
# 1) "otel-ingestion-queue-0:delayed"
# 2) "otel-ingestion-queue-0:active"
# 3) "otel-ingestion-queue-0:completed"  <- grows as jobs process
```

### In ClickHouse
- Trace data starts appearing
- Tables populate with OTLP data
- Dashboard shows new traces

---

## Queue Consumer Details

The worker automatically registers and enables these processors (all default to `true`):

**Data Ingestion:**
- OTEL Ingestion Queue
- Ingestion Queue
- Ingestion Secondary Queue
- Trace Upsert Queue

**Evaluations:**
- Create Eval Queue
- Eval Execution Queue
- Eval Trace Creator Queue
- Eval Dataset Creator Queue

**Data Operations:**
- Batch Export Queue
- Batch Action Queue
- Trace Delete Queue
- Score Delete Queue
- Dataset Delete Queue
- Project Delete Queue
- Dataset Run Item Upsert Queue

**Integrations & Features:**
- PostHog Integration Queue
- Blob Storage Integration Queue
- Data Retention Queue
- Dead Letter Retry Queue (disabled by default)
- Event Propagation Queue (disabled by default)
- Webhook Queue
- Entity Change Queue

**Billing (Cloud):**
- Cloud Usage Metering Queue
- Cloud Spend Alert Queue
- Free Tier Usage Threshold Queue

All these are enabled automatically when using the `langfuse-worker:3` image.

---

## Why LANGFUSE_WORKER=true Doesn't Work

1. **Not in code**: No TypeScript file references this variable
2. **Not in env.ts**: Environment schema doesn't define it
3. **Not in docs**: Langfuse documentation doesn't mention it
4. **Image selection is at Docker level**: The image itself determines behavior
   - `langfuse/langfuse:3` → runs web server
   - `langfuse/langfuse-worker:3` → runs job processor
5. **Different Dockerfiles**: Completely separate build processes
   - web/Dockerfile: builds web/server.js
   - worker/Dockerfile: builds worker/dist/index.js

The environment variable approach simply doesn't exist. The distinction is made via different Docker images.

---

## Key Findings Summary

| Finding | Details |
|---------|---------|
| **Root Cause** | Wrong Docker image for worker service |
| **Impact** | 16 OTLP ingestion jobs stuck in Redis |
| **Type of Issue** | Configuration error, not code bug |
| **Severity** | Complete loss of background job processing |
| **Fix Complexity** | 2 lines changed in docker-compose.yml |
| **Time to Fix** | 5 minutes |
| **Time to Process Stuck Jobs** | ~minutes (depends on concurrency settings) |

---

## Research Documentation

Three comprehensive documents have been created:

1. **WORKER_FIX_SUMMARY.md** - Quick reference (2.6 KB)
   - The fix at a glance
   - How to apply it
   - How to verify

2. **LANGFUSE_V3_WORKER_RESEARCH.md** - Full technical document (13 KB)
   - Complete architecture explanation
   - Source code evidence
   - Configuration details
   - Known issues and solutions

3. **LANGFUSE_V3_WORKER_FINDINGS.md** - Investigation details (15 KB)
   - Research methodology
   - Evidence from documentation
   - Evidence from source code
   - Queue processor details
   - Comparison of correct vs incorrect setup

---

## Next Steps

### Immediate
1. Read WORKER_FIX_SUMMARY.md for quick reference
2. Make the 2 changes to docker-compose.yml
3. Run `docker-compose down && docker-compose up -d`
4. Monitor logs for queue consumer registration

### Short-term
1. Verify worker logs show queue processing
2. Check Redis queue sizes decreasing
3. Confirm ClickHouse receiving trace data
4. Monitor first few jobs completing

### Long-term
1. Adjust concurrency settings if needed
2. Monitor performance and resource usage
3. Consider tuning LANGFUSE_OTEL_INGESTION_QUEUE_PROCESSING_CONCURRENCY if needed
4. Standard environment variable tuning (documented in LANGFUSE_V3_WORKER_RESEARCH.md)

---

## Files in Your Observability Directory

- `/mnt/c/dev/class-one-rapids/observability/WORKER_FIX_SUMMARY.md` - Quick fix guide
- `/mnt/c/dev/class-one-rapids/observability/LANGFUSE_V3_WORKER_RESEARCH.md` - Full research
- `/mnt/c/dev/class-one-rapids/observability/LANGFUSE_V3_WORKER_FINDINGS.md` - Investigation details
- `/mnt/c/dev/class-one-rapids/observability/docker-compose.yml` - Your configuration (needs fix)

---

## Conclusion

The investigation conclusively shows that your 16 stuck OTLP ingestion jobs are caused by using the wrong Docker image for the worker service. This is a **configuration issue, not a product limitation or bug**.

Once you switch to the correct `langfuse/langfuse-worker:3` image, job processing will resume automatically, and your stuck jobs will be processed within minutes.

The fix is simple, documented, and proven by the official Langfuse repository configuration.
