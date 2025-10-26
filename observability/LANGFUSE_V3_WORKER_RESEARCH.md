# Langfuse v3 Worker Container Research Report

## Executive Summary

After thorough investigation of Langfuse v3 architecture, documentation, and source code, **THE CRITICAL ISSUE HAS BEEN IDENTIFIED**: Your local docker-compose.yml is incorrectly configured for the worker container, which is why your 16 OTLP ingestion jobs are stuck in Redis and not being processed.

## Critical Finding: Incorrect Worker Configuration

### The Problem

Your current docker-compose.yml (lines 140-188) uses:
```yaml
langfuse-worker:
  image: langfuse/langfuse:3
  container_name: langfuse-worker
  environment:
    LANGFUSE_WORKER: true
```

**THIS IS WRONG.** `LANGFUSE_WORKER=true` is NOT a valid Langfuse v3 environment variable.

### The Official Solution (From Langfuse Repository)

The official docker-compose.yml uses:
```yaml
langfuse-worker:
  image: docker.io/langfuse/langfuse-worker:3
  restart: always
```

**There is a SEPARATE Docker image specifically for workers: `langfuse/langfuse-worker:3`**

## Architecture Deep Dive

### Langfuse v3 Architecture

Langfuse v3 uses a **Queue-based Job Processing System** (Bull/BullMQ):

1. **Web Container** (`langfuse/langfuse:3`)
   - Runs the Next.js web interface
   - Receives OTLP traces via API endpoints
   - **ENQUEUES jobs to Redis** when traces arrive
   - Does NOT process jobs from queues
   - Runs on port 3000

2. **Worker Container** (`langfuse/langfuse-worker:3`)
   - A completely separate service built from `worker/Dockerfile`
   - Only responsibility: **PROCESS jobs from Redis queues**
   - Handles OTLP ingestion processing, evaluations, exports, etc.
   - Uses Bull queue consumers (BullMQ)
   - Runs on port 3030
   - **NO web interface** (minimal Express server just for health checks)

### Why Jobs Are Stuck

Your setup is using the wrong image. The `langfuse/langfuse:3` image is built for the web interface and:
- Does NOT register queue consumers by default
- Does NOT process OTLP ingestion jobs (or any background jobs)
- When `LANGFUSE_WORKER=true` is set, it's ignored (not a real env variable)
- So your jobs remain in Redis indefinitely

## Source Code Evidence

### From worker/src/app.ts (Main Worker Logic)

The worker registers multiple queue processors:

```typescript
if (env.QUEUE_CONSUMER_OTEL_INGESTION_QUEUE_IS_ENABLED === "true") {
  // Register workers for all ingestion queue shards
  const shardNames = OtelIngestionQueue.getShardNames();
  shardNames.forEach((shardName) => {
    WorkerManager.register(
      shardName as QueueName,
      otelIngestionQueueProcessor,
      {
        concurrency: env.LANGFUSE_OTEL_INGESTION_QUEUE_PROCESSING_CONCURRENCY,
      },
    );
  });
}

if (env.QUEUE_CONSUMER_INGESTION_QUEUE_IS_ENABLED === "true") {
  // Register workers for all ingestion queue shards
  const shardNames = IngestionQueue.getShardNames();
  shardNames.forEach((shardName) => {
    WorkerManager.register(
      shardName as QueueName,
      ingestionQueueProcessorBuilder(true),
      {
        concurrency: env.LANGFUSE_INGESTION_QUEUE_PROCESSING_CONCURRENCY,
      },
    );
  });
}
```

### From worker/src/env.ts (Environment Variable Defaults)

All queue processing is **ENABLED by default**:

```typescript
QUEUE_CONSUMER_OTEL_INGESTION_QUEUE_IS_ENABLED: z
  .enum(["true", "false"])
  .default("true"),  // ENABLED BY DEFAULT!

QUEUE_CONSUMER_INGESTION_QUEUE_IS_ENABLED: z
  .enum(["true", "false"])
  .default("true"),  // ENABLED BY DEFAULT!

// ... and many more for other queue types
// All default to "true"
```

### From worker/Dockerfile vs web/Dockerfile

**Distinct Dockerfiles:**

1. **worker/Dockerfile** - Final CMD:
   ```dockerfile
   ENTRYPOINT ["dumb-init", "--", "./worker/entrypoint.sh"]
   CMD ["node", "worker/dist/index.js"]
   ```

2. **web/Dockerfile** - Final CMD:
   ```dockerfile
   CMD if [ -n "$NEXT_PUBLIC_LANGFUSE_CLOUD_REGION" ]; then \
       node --import dd-trace/initialize.mjs ./web/server.js --keepAliveTimeout 110000; \
       else \
       node ./web/server.js --keepAliveTimeout 110000; \
       fi
   ```

**These are completely different processes.**

## Queue Consumer Flags

The worker accepts environment variables to toggle queue processing:

```
QUEUE_CONSUMER_CLOUD_USAGE_METERING_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_CLOUD_SPEND_ALERT_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_FREE_TIER_USAGE_THRESHOLD_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_INGESTION_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_BATCH_EXPORT_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_BATCH_ACTION_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_EVAL_EXECUTION_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_TRACE_UPSERT_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_CREATE_EVAL_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_TRACE_DELETE_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_SCORE_DELETE_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_DATASET_DELETE_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_PROJECT_DELETE_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_DATASET_RUN_ITEM_UPSERT_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_EXPERIMENT_CREATE_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_POSTHOG_INTEGRATION_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_BLOB_STORAGE_INTEGRATION_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_OTEL_INGESTION_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_INGESTION_SECONDARY_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_DATA_RETENTION_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_DEAD_LETTER_RETRY_QUEUE_IS_ENABLED=true|false (default: false)
QUEUE_CONSUMER_WEBHOOK_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_ENTITY_CHANGE_QUEUE_IS_ENABLED=true|false (default: true)
QUEUE_CONSUMER_EVENT_PROPAGATION_QUEUE_IS_ENABLED=true|false (default: false)
```

## Key Differences Between Images

| Aspect | langfuse:3 (Web) | langfuse-worker:3 |
|--------|------------------|-------------------|
| **Process** | Next.js server + Node.js | Node.js worker |
| **Entrypoint** | web/entrypoint.sh | worker/entrypoint.sh |
| **Main Binary** | web/server.js | worker/dist/index.js |
| **Queue Processing** | Enqueues jobs only | Processes jobs from queues |
| **Web UI** | Serves Next.js UI | Minimal Express server (health checks) |
| **Ports** | 3000 | 3030 |
| **Build Source** | web/ directory | worker/ directory |
| **Database Migrations** | Runs Postgres & Clickhouse migrations | No migrations |

## Redis Queue Status

Your 16 stuck jobs are in Redis because:

1. **Web container** receives OTLP trace at `/api/ingestion`
2. **Web container** enqueues job to Redis queue `otel-ingestion-queue-*`
3. **Worker container** should pick up and process these jobs
4. **YOUR SETUP**: Running `langfuse/langfuse:3` with `LANGFUSE_WORKER=true`
   - This ignores the flag
   - No queue consumers registered
   - Jobs sit in Redis indefinitely

## Docker Hub Evidence

**langfuse-worker:3** exists and is actively maintained:
- Latest: October 21, 2025
- Multiple architecture support (amd64, arm64)
- Version tags available (3.119, 3.120, 3.121, etc.)
- Published to `docker.io/langfuse/langfuse-worker:3`

## Official Docker Compose Reference

The official docker-compose.yml shows the correct structure:
- Source: https://raw.githubusercontent.com/langfuse/langfuse/main/docker-compose.yml
- Uses separate `langfuse-worker:3` image
- Both web and worker share the same environment variables (via YAML anchors)
- Worker service listens on different port (3030)

## Job Processing Flow in v3

```
1. OTLP Trace Ingestion
   ↓
2. Web Container Receives via API
   ↓
3. Web Container Enqueues to Redis
   └─ Jobs go to OtelIngestionQueue (sharded)
   └─ Jobs go to IngestionQueue (for Langfuse SDK traces)
   └─ Other queues for evaluations, exports, webhooks, etc.
   ↓
4. Worker Container Processes
   ├─ OtelIngestionQueueProcessor (if QUEUE_CONSUMER_OTEL_INGESTION_QUEUE_IS_ENABLED=true)
   ├─ IngestionQueueProcessor (if QUEUE_CONSUMER_INGESTION_QUEUE_IS_ENABLED=true)
   ├─ EvalJobExecutor
   ├─ BatchExportProcessor
   ├─ WebhookProcessor
   └─ ... 20+ other processors
   ↓
5. Data Written to ClickHouse
```

## Environment Variable Configuration

### Required for Both Web and Worker:

```
DATABASE_URL=postgresql://...
CLICKHOUSE_URL=http://clickhouse:8123
CLICKHOUSE_MIGRATION_URL=clickhouse://...
CLICKHOUSE_USER=...
CLICKHOUSE_PASSWORD=...
REDIS_HOST=...
REDIS_PORT=...
REDIS_AUTH=...
LANGFUSE_S3_*=... (all S3/MinIO settings)
```

### Worker-Specific Concurrency Controls:

```
LANGFUSE_INGESTION_QUEUE_PROCESSING_CONCURRENCY (default: varies)
LANGFUSE_OTEL_INGESTION_QUEUE_PROCESSING_CONCURRENCY (default: varies)
LANGFUSE_EVAL_CREATOR_WORKER_CONCURRENCY (default: 5)
LANGFUSE_EVAL_EXECUTION_WORKER_CONCURRENCY (default: 5)
LANGFUSE_TRACE_UPSERT_WORKER_CONCURRENCY (default: varies)
LANGFUSE_TRACE_DELETE_CONCURRENCY (default: varies)
LANGFUSE_BATCH_EXPORT_QUEUE_PROCESSING_CONCURRENCY (default: varies)
```

## Why LANGFUSE_WORKER=true Doesn't Work

1. **Not in env.ts** - The worker's environment schema doesn't define this variable
2. **Not used anywhere** - No code references `LANGFUSE_WORKER`
3. **Image differentiation is at Docker level** - The image itself determines behavior, not an env variable
4. **Different entrypoints** - web/ vs worker/ directories have different entrypoints

## Migration from Your Current Setup

### Current (BROKEN):
```yaml
langfuse-worker:
  image: langfuse/langfuse:3
  environment:
    LANGFUSE_WORKER: true  # <-- NOT VALID
```

### Correct:
```yaml
langfuse-worker:
  image: langfuse/langfuse-worker:3
  restart: unless-stopped
  depends_on:
    postgres:
      condition: service_healthy
    clickhouse:
      condition: service_healthy
    redis:
      condition: service_healthy
    minio:
      condition: service_healthy
  environment:
    DATABASE_URL: postgresql://langfuse:langfuse_password_change_me@postgres:5432/langfuse
    CLICKHOUSE_URL: http://clickhouse:8123
    CLICKHOUSE_MIGRATION_URL: clickhouse://langfuse:langfuse_clickhouse_password@clickhouse:9000/langfuse
    CLICKHOUSE_USER: langfuse
    CLICKHOUSE_PASSWORD: langfuse_clickhouse_password
    CLICKHOUSE_DB: langfuse
    REDIS_HOST: redis
    REDIS_PORT: 6379
    REDIS_AUTH: langfuse_redis_password
    LANGFUSE_S3_EVENT_UPLOAD_BUCKET: langfuse
    LANGFUSE_S3_EVENT_UPLOAD_REGION: us-east-1
    LANGFUSE_S3_EVENT_UPLOAD_ACCESS_KEY_ID: langfuse
    LANGFUSE_S3_EVENT_UPLOAD_SECRET_ACCESS_KEY: langfuse_minio_password
    LANGFUSE_S3_EVENT_UPLOAD_ENDPOINT: http://minio:9000
    LANGFUSE_S3_EVENT_UPLOAD_FORCE_PATH_STYLE: "true"
```

## Known Issues and Discussions

### Issue #9368: Worker High Memory Usage
- Langfuse v3.106.1
- 2,000 Redis keys with ~150 delayed jobs each in 6 queues
- High memory consumption but low CPU
- Indicates jobs are being held in memory waiting for processing

### Issue #9697: Timeout During Span Export
- Related to queue job processing
- Indicates timeout issues when exporting data

## Recommendations

### Immediate Action Required:

1. **Change Worker Image**: Update docker-compose.yml line 141 from:
   ```yaml
   image: langfuse/langfuse:3
   ```
   To:
   ```yaml
   image: langfuse/langfuse-worker:3
   ```

2. **Remove Invalid Environment Variable**: Delete the `LANGFUSE_WORKER: true` line (185)

3. **Restart Containers**: 
   ```bash
   docker-compose down
   docker-compose up -d
   ```

4. **Monitor Processing**: Check logs for queue consumer registration:
   ```
   # Should see messages like:
   # "Registering worker for otel-ingestion-queue-0"
   # "Registering worker for ingestion-queue-0"
   # etc.
   ```

### Debugging Steps:

1. **Verify Worker is Processing**:
   ```bash
   docker logs langfuse-worker | grep -i "queue\|ingestion"
   ```

2. **Check Redis Queue Status**:
   ```bash
   redis-cli
   > KEYS "*"  # Should see otel-ingestion and ingestion queue names
   ```

3. **Monitor Job Count**:
   ```bash
   redis-cli
   > ZCARD otel-ingestion-queue-0:delayed  # Shows delayed jobs
   > ZCARD otel-ingestion-queue-0:active   # Shows active jobs
   ```

4. **Verify Web Container Still Works**:
   - Web container should still enqueue jobs when traces arrive
   - Check logs: `docker logs langfuse-web | grep -i "ingestion"`

## Conclusion

The root cause of your 16 stuck OTLP ingestion jobs is **using the wrong Docker image for the worker**. The `langfuse/langfuse:3` image is for the web interface only. You must use the dedicated `langfuse/langfuse-worker:3` image for job processing.

This is a **configuration issue, not a code issue**. Once corrected, your worker should:
- Register all queue consumers (23 different types)
- Begin processing your stuck jobs immediately
- Process new OTLP traces as they arrive

Expected processing time for 16 jobs depends on your concurrency settings but should complete within minutes, not hours.
