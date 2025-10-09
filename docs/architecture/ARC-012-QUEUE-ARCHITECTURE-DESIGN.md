# ARC-012: Queue Integration & Background Processing - Architecture Design

**Status**: Design Phase
**Date**: 2025-10-05
**Author**: Architecture Analysis
**Priority**: HIGH - Unblocks content extraction

---

## Executive Summary

This document defines the queue architecture for content processing in a **single-service deployment** with considerations for horizontal scaling, latency compliance, and availability requirements.

### Key Design Decisions

1. **BullMQ with Redis**: Proven technology already used in legacy system
2. **In-Process Workers**: Workers run in same process as API (single service)
3. **Horizontal Scaling Ready**: Multiple replicas share job processing
4. **Event-Driven Architecture**: Decoupled from API request/response cycle
5. **Consolidated Pipeline**: Single-stage processing (not two-stage legacy)

---

## 1. Current State Analysis

### Legacy Architecture (Two Microservices)

```
┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  API Service │───▶│ Content-Fetch   │───▶│ Queue-Processor  │
│              │    │ Worker          │    │ Worker           │
│ - Save URL   │    │ - Puppeteer     │    │ - Save to DB     │
│ - Enqueue    │    │ - Cache         │    │ - Readability    │
└──────────────┘    │ - GCS Upload    │    │ - Rules          │
                    └─────────────────┘    └──────────────────┘
```

**Problems**:
- **High Latency**: Two separate services, two queue hops
- **Operational Complexity**: 3 services to deploy/monitor
- **Resource Waste**: Dedicated worker processes often idle
- **State Management**: Redis cache + GCS for intermediate state

### Desired Architecture (Single Service)

```
┌────────────────────────────────────────────────────────┐
│  API-Nest Service (Single Deployment)                  │
│                                                         │
│  ┌──────────────┐         ┌─────────────────────┐     │
│  │  API Layer   │  event  │  Background Worker  │     │
│  │              │────────▶│                     │     │
│  │ - GraphQL    │         │ - Content Fetch     │     │
│  │ - REST       │         │ - Processing        │     │
│  │ - Events     │         │ - Save to DB        │     │
│  └──────────────┘         └─────────────────────┘     │
│                                                         │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │ Redis/Queue │
                  │ - Jobs      │
                  │ - Cache     │
                  └─────────────┘
```

**Benefits**:
- **Lower Latency**: Single service, single queue hop
- **Simpler Operations**: One deployment artifact
- **Better Resource Utilization**: Workers scale with API demand
- **Easier Development**: Single codebase, shared types

---

## 2. Scaling Architecture

### Single Instance (Development/Small Production)

```
┌──────────────────────────────────────────┐
│  api-nest Container                      │
│                                          │
│  Main Thread:                            │
│  ├─ NestJS HTTP Server (Port 4001)      │
│  ├─ GraphQL/REST APIs                   │
│  └─ Event Emitters                      │
│                                          │
│  Background Threads:                     │
│  ├─ BullMQ Worker #1 (concurrency: 2)   │
│  └─ BullMQ Worker #2 (concurrency: 2)   │
│                                          │
└──────────────┬───────────────────────────┘
               │
               ▼
        ┌─────────────┐
        │   Redis     │
        │  (Shared)   │
        └─────────────┘
```

**Resource Allocation**:
- **API Requests**: 60% of CPU/memory
- **Worker Processing**: 40% of CPU/memory
- **Concurrency**: 2-4 jobs max to prevent API degradation

### Horizontal Scaling (Production)

```
┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│  api-nest Replica #1     │  │  api-nest Replica #2     │  │  api-nest Replica #3     │
│  - API (Primary)         │  │  - API (Primary)         │  │  - API (Primary)         │
│  - Worker (Secondary)    │  │  - Worker (Secondary)    │  │  - Worker (Secondary)    │
│    concurrency: 2        │  │    concurrency: 2        │  │    concurrency: 2        │
└──────┬───────────────────┘  └──────┬───────────────────┘  └──────┬───────────────────┘
       │                              │                              │
       └──────────────────────────────┴──────────────────────────────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │   Redis     │
                               │  (Shared)   │
                               │             │
                               │ BullMQ      │
                               │ - Locks     │
                               │ - Queue     │
                               │ - Jobs      │
                               └─────────────┘
```

**How BullMQ Handles Multiple Workers**:

1. **Job Locking**: Workers acquire locks before processing (Redis SETNX)
2. **Fair Distribution**: Jobs distributed evenly across all workers
3. **No Duplication**: Lock prevents duplicate processing
4. **Failure Recovery**: If worker dies, lock expires → job reprocessed

**Scaling Metrics**:
```
Single Instance:  ~50-100 jobs/hour  (limited by resource sharing)
3 Replicas:       ~150-300 jobs/hour (3x workers)
5 Replicas:       ~250-500 jobs/hour (5x workers)
```

### Dedicated Worker Pattern (Advanced Scaling)

For extreme load, can deploy **dedicated worker pods**:

```
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────────┐
│  api-nest-api        │  │  api-nest-api        │  │  api-nest-worker (No API)│
│  - API Only          │  │  - API Only          │  │  - Workers Only          │
│  - No Workers        │  │  - No Workers        │  │    concurrency: 10       │
└──────────────────────┘  └──────────────────────┘  └──────────┬───────────────┘
                                                                 │
                  ┌──────────────────────────────────────────────┘
                  │
                  ▼
           ┌─────────────┐
           │   Redis     │
           └─────────────┘
```

**Configuration Flag**:
```typescript
// Environment variable
ENABLE_WORKERS=false  // For API-only pods
ENABLE_WORKERS=true   // For worker pods (default)
```

---

## 3. Latency & Availability Compliance

### Latency Requirements

| Operation | Target Latency | Strategy |
|-----------|---------------|----------|
| **API Request** (saveUrl) | <200ms | Fire-and-forget event, return immediately |
| **Job Queue** | <100ms | Redis in-memory, local network |
| **Job Processing** | 2-30 seconds | Async, doesn't block API |
| **User Visibility** | <5 seconds | Optimistic UI + polling/websocket |

### Architecture Guarantees

**1. API Never Blocks on Job Processing**

```typescript
// ❌ WRONG: Blocking API request
@Mutation()
async saveUrl(@Args('input') input: SaveUrlInput) {
  const item = await this.libraryService.createItem(...)
  await this.contentWorker.processContent(item.id)  // BLOCKING! ❌
  return item
}

// ✅ CORRECT: Fire-and-forget
@Mutation()
async saveUrl(@Args('input') input: SaveUrlInput) {
  const item = await this.libraryService.createItem(...)

  // Emit event (async, non-blocking)
  this.eventManager.emit(EventType.CONTENT_SAVE_REQUESTED, {
    libraryItemId: item.id,
    userId: user.id,
    url: input.url,
  })

  return item  // Returns immediately with state: PROCESSING
}
```

**2. Worker Processing in Background**

```typescript
// Worker listens to queue, separate from request thread
@Processor('content-processing')
export class ContentProcessor {
  @Process('fetch-content')
  async handleContentFetch(job: Job<ContentSaveRequestedEvent>) {
    // This runs async, doesn't affect API latency
    await this.fetchAndSaveContent(job.data)
  }
}
```

**3. Redis Connection Pooling**

```typescript
// Shared connection for cache + queue (prevents connection overhead)
export class RedisDataSource {
  private cacheClient: Redis
  private queueConnection: ConnectionOptions

  constructor() {
    this.cacheClient = new Redis({
      host: 'redis',
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
      lazyConnect: false,
    })

    // BullMQ reuses cache client connection
    this.queueConnection = {
      host: 'redis',
      port: 6379,
      maxRetriesPerRequest: null,  // BullMQ requirement
    }
  }
}
```

### Availability Guarantees

**1. Redis Failover**

```yaml
# Redis Sentinel (HA configuration)
redis:
  mode: sentinel
  sentinels:
    - host: redis-sentinel-1
      port: 26379
    - host: redis-sentinel-2
      port: 26379
  name: mymaster

# OR Redis Cluster
redis:
  cluster:
    - host: redis-1
      port: 6379
    - host: redis-2
      port: 6379
```

**2. Job Persistence**

```typescript
// Jobs persisted to Redis (survives restarts)
await queue.add('fetch-content', jobData, {
  attempts: 3,                    // Retry 3 times
  backoff: {
    type: 'exponential',          // 1s, 2s, 4s
    delay: 1000,
  },
  removeOnComplete: {
    age: 3600,                    // Keep 1 hour for debugging
    count: 1000,
  },
  removeOnFail: {
    age: 86400,                   // Keep failed 24 hours
  },
})
```

**3. Graceful Shutdown**

```typescript
// On SIGTERM/SIGINT
async onApplicationShutdown() {
  // 1. Stop accepting new jobs
  await this.worker.close()

  // 2. Wait for in-flight jobs (up to 30s)
  await this.worker.disconnect(30000)

  // 3. Jobs not finished return to queue
  // 4. Other workers can pick them up
}
```

**4. Health Checks**

```typescript
@Controller('health')
export class HealthController {
  @Get('worker')
  async workerHealth() {
    const queue = this.queueService.getQueue()

    // Check queue connectivity
    const health = await queue.client.ping()

    // Check backlog
    const waiting = await queue.getWaitingCount()

    return {
      status: health === 'PONG' && waiting < 1000 ? 'healthy' : 'degraded',
      metrics: {
        waiting,
        active: await queue.getActiveCount(),
        failed: await queue.getFailedCount(),
      },
    }
  }
}
```

---

## 4. Resource Management & Auto-Scaling

### CPU/Memory Limits

**Single Container Resource Allocation**:
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"        # 0.5 CPU cores
  limits:
    memory: "2Gi"
    cpu: "2000m"       # 2 CPU cores
```

**Resource Distribution**:
- **API Threads**: 60% (1.2 CPU cores)
- **Worker Threads**: 40% (0.8 CPU cores)

### Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-nest-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-nest
  minReplicas: 2
  maxReplicas: 10
  metrics:

  # Scale on CPU usage
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70

  # Scale on memory usage
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80

  # Scale on queue depth (custom metric)
  - type: Pods
    pods:
      metric:
        name: bullmq_queue_waiting_count
      target:
        type: AverageValue
        averageValue: "50"

  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300  # Wait 5 min before scaling down
      policies:
      - type: Percent
        value: 50                      # Remove max 50% of pods at once
        periodSeconds: 60

    scaleUp:
      stabilizationWindowSeconds: 60   # Scale up faster
      policies:
      - type: Percent
        value: 100                     # Double pods if needed
        periodSeconds: 15
```

### Queue Depth Monitoring

```typescript
// Prometheus metrics for HPA
const queueDepthGauge = new client.Gauge({
  name: 'bullmq_queue_waiting_count',
  help: 'Number of jobs waiting in queue',
  async collect() {
    const waiting = await queue.getWaitingCount()
    this.set(waiting)
  },
})

// Alert when queue backs up
const queueBacklogAlert = new client.Gauge({
  name: 'bullmq_queue_backlog_high',
  help: 'Queue backlog exceeds threshold',
  async collect() {
    const waiting = await queue.getWaitingCount()
    const active = await queue.getActiveCount()
    const total = waiting + active

    // Alert if >500 jobs pending
    this.set(total > 500 ? 1 : 0)
  },
})
```

---

## 5. Worker Concurrency Strategy

### Concurrency Configuration

```typescript
export interface WorkerConfig {
  // How many jobs to process simultaneously
  concurrency: number

  // Rate limiting (jobs per time period)
  limiter?: {
    max: number       // Max jobs
    duration: number  // Per milliseconds
  }

  // Memory/CPU protection
  lockDuration: number  // Max job processing time
}

// Development (single instance)
const devConfig: WorkerConfig = {
  concurrency: 2,
  limiter: { max: 10, duration: 1000 },  // 10 jobs/sec
  lockDuration: 60000,  // 1 minute
}

// Production (multiple replicas)
const prodConfig: WorkerConfig = {
  concurrency: 4,  // Higher since resources not shared as much
  limiter: { max: 20, duration: 1000 },  // 20 jobs/sec per replica
  lockDuration: 120000,  // 2 minutes
}
```

### Dynamic Concurrency Adjustment

```typescript
export class AdaptiveWorkerManager {
  private currentConcurrency: number = 2
  private readonly minConcurrency = 1
  private readonly maxConcurrency = 6

  async adjustConcurrency() {
    // Check system metrics
    const cpuUsage = await this.getCPUUsage()
    const memoryUsage = await this.getMemoryUsage()
    const queueDepth = await this.getQueueDepth()

    if (cpuUsage < 50 && memoryUsage < 60 && queueDepth > 50) {
      // System has capacity, queue is backed up → increase concurrency
      this.currentConcurrency = Math.min(
        this.currentConcurrency + 1,
        this.maxConcurrency
      )
      await this.worker.concurrency = this.currentConcurrency

    } else if (cpuUsage > 80 || memoryUsage > 85) {
      // System under pressure → reduce concurrency
      this.currentConcurrency = Math.max(
        this.currentConcurrency - 1,
        this.minConcurrency
      )
      await this.worker.concurrency = this.currentConcurrency
    }
  }
}
```

---

## 6. Job Priority & Queue Management

### Priority Levels

```typescript
export enum JobPriority {
  CRITICAL = 1,   // User-initiated saves (interactive)
  HIGH = 5,       // Recent API requests
  NORMAL = 10,    // Background refresh
  LOW = 20,       // RSS feed updates
}

// User saves URL → HIGH priority
await queue.add('fetch-content', jobData, {
  priority: JobPriority.HIGH,
  jobId: `content_${itemId}`,  // Deduplication
})

// Background RSS → LOW priority
await queue.add('fetch-content', jobData, {
  priority: JobPriority.LOW,
  jobId: `rss_${feedId}_${timestamp}`,
})
```

### Deduplication Strategy

```typescript
// Job ID prevents duplicate processing
const jobId = `fetch_${createHash('sha256').update(url).digest('hex')}`

await queue.add('fetch-content', { url, userId }, {
  jobId,  // If job exists with same ID, doesn't create duplicate
  removeOnComplete: { age: 3600 },
})
```

### Rate Limiting Per User

```typescript
// Prevent abuse: 5 saves per minute per user
export class UserRateLimiter {
  async checkRateLimit(userId: string): Promise<'high' | 'low'> {
    const key = `rate_limit:${userId}`
    const count = await redis.incr(key)

    if (count === 1) {
      await redis.expire(key, 60)  // Reset after 1 minute
    }

    return count > 5 ? 'low' : 'high'
  }
}

// In API handler
const priority = await this.rateLimiter.checkRateLimit(userId)
await queue.add('fetch-content', data, {
  priority: priority === 'high' ? JobPriority.HIGH : JobPriority.LOW,
})
```

---

## 7. Monitoring & Observability

### Key Metrics

```typescript
// Prometheus metrics
export const queueMetrics = {
  // Queue depth
  waiting: new Gauge({
    name: 'omnivore_queue_waiting',
    help: 'Jobs waiting in queue',
    labelNames: ['queue'],
  }),

  // Active processing
  active: new Gauge({
    name: 'omnivore_queue_active',
    help: 'Jobs currently processing',
    labelNames: ['queue'],
  }),

  // Job latency (time in queue before processing)
  queueLatency: new Histogram({
    name: 'omnivore_queue_latency_seconds',
    help: 'Time job spends waiting',
    labelNames: ['queue', 'priority'],
    buckets: [0.1, 0.5, 1, 5, 10, 30, 60],
  }),

  // Job processing time
  processingDuration: new Histogram({
    name: 'omnivore_job_duration_seconds',
    help: 'Time to process job',
    labelNames: ['job_type', 'status'],
    buckets: [1, 2, 5, 10, 30, 60, 120],
  }),

  // Success/failure rates
  jobsCompleted: new Counter({
    name: 'omnivore_jobs_completed_total',
    help: 'Total jobs completed',
    labelNames: ['job_type', 'status'],
  }),
}
```

### Alerts

```yaml
# Prometheus AlertManager rules
groups:
- name: omnivore_queue
  rules:

  # Queue backing up
  - alert: QueueBacklogHigh
    expr: omnivore_queue_waiting > 500
    for: 5m
    annotations:
      summary: "Queue has {{$value}} jobs waiting"
      description: "May need to scale up workers"

  # High failure rate
  - alert: JobFailureRateHigh
    expr: |
      rate(omnivore_jobs_completed_total{status="failed"}[5m])
      / rate(omnivore_jobs_completed_total[5m]) > 0.1
    for: 5m
    annotations:
      summary: "{{$value}}% of jobs failing"

  # Worker stalled
  - alert: WorkerStalled
    expr: |
      omnivore_queue_active > 0
      and rate(omnivore_jobs_completed_total[5m]) == 0
    for: 10m
    annotations:
      summary: "Worker appears stalled (jobs active but not completing)"
```

### Dashboard Queries

```promql
# Queue depth over time
omnivore_queue_waiting{queue="content-processing"}

# Average processing time
rate(omnivore_job_duration_seconds_sum[5m])
/ rate(omnivore_job_duration_seconds_count[5m])

# P95 queue latency
histogram_quantile(0.95, omnivore_queue_latency_seconds_bucket)

# Job throughput (jobs/second)
rate(omnivore_jobs_completed_total{status="completed"}[5m])
```

---

## 8. Implementation Phases

### Phase 1: Infrastructure Setup (1 day)
- [ ] Install `@nestjs/bullmq`
- [ ] Create `QueueModule` with configuration
- [ ] Set up Redis connection sharing (cache + queue)
- [ ] Add Prometheus metrics
- [ ] Create health check endpoints

### Phase 2: Basic Content Worker (1 day)
- [ ] Create `ContentProcessor` service
- [ ] Implement job handler skeleton
- [ ] Integrate with EventManager
- [ ] Add job scheduling on saveUrl

### Phase 3: Content Extraction (1 day)
- [ ] Port Puppeteer extraction logic
- [ ] Integrate content handlers
- [ ] Add caching strategy
- [ ] Implement error classification

### Phase 4: Database Integration (0.5 day)
- [ ] Save extracted content to library_item
- [ ] Update item state (PROCESSING → SUCCEEDED/FAILED)
- [ ] Trigger follow-up jobs (rules, thumbnails)

### Phase 5: Testing & Optimization (0.5 day)
- [ ] Load testing with 100+ concurrent jobs
- [ ] Latency profiling
- [ ] Error scenario testing
- [ ] Scaling validation

---

## 9. Rollback Plan

### Fallback to Legacy System

If issues arise, can roll back by:

1. **Feature Flag**: `USE_LEGACY_CONTENT_FETCH=true`
2. **Dual Write**: Both systems active temporarily
3. **Gradual Migration**: Percentage-based rollout

```typescript
// Gradual rollout strategy
const shouldUseLegacy = (userId: string): boolean => {
  const hash = createHash('md5').update(userId).digest('hex')
  const value = parseInt(hash.substring(0, 8), 16)
  const percentage = (value % 100) / 100

  const rolloutPercentage = parseFloat(process.env.NEW_WORKER_ROLLOUT || '0.1')
  return percentage > rolloutPercentage  // 10% on new system
}
```

---

## 10. Success Criteria

- [ ] **Latency**: <200ms API response time (unchanged from current)
- [ ] **Throughput**: Process 50+ jobs/hour on single instance
- [ ] **Scaling**: Linear scaling with replicas (2x replicas = ~2x throughput)
- [ ] **Reliability**: <1% job failure rate
- [ ] **Availability**: 99.9% uptime with proper monitoring
- [ ] **Resource Efficiency**: <50% CPU usage under normal load

---

## Conclusion

This architecture provides:

✅ **Single-Service Simplicity**: Easier operations, single deployment
✅ **Horizontal Scaling**: Add replicas to increase throughput
✅ **Latency Compliance**: Async workers don't block API
✅ **High Availability**: Redis persistence, graceful shutdown
✅ **Resource Efficiency**: Workers scale with API demand
✅ **Production Ready**: Monitoring, alerts, health checks

Next step: Begin implementation with Phase 1 (Infrastructure Setup).
