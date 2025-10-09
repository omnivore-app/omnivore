# ARC-012: Event Management & Redis Architecture - Deep Dive Analysis

**Status**: Analysis Phase
**Date**: 2025-10-05
**Purpose**: Evaluate event management patterns and Redis configurations

---

## Part 1: Event Management System Analysis

### Current State (Legacy API)

The legacy API **does have an EventManager** (`packages/api/src/events/event-manager.ts`):

```typescript
export class EventManager implements EventEmitter {
  private queues: Map<string, Queue> = new Map()
  private eventRoutes: Map<string, EventRoute> = new Map()

  // Singleton instance
  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager()
    }
    return EventManager.instance
  }

  public async emit<T extends BaseEvent>(event: T): Promise<void> {
    const route = this.eventRoutes.get(event.eventType)
    const queue = await this.getOrCreateQueue(route.queueName)
    await queue.add(route.jobName, event, route.jobOptions || {})
  }
}
```

**What it does**:
1. **Event → Queue Mapping**: Routes event types to BullMQ queues
2. **Centralized Configuration**: Retry policies, job options in one place
3. **Queue Management**: Lazy-creates and caches Queue instances
4. **Thin Wrapper**: ~150 lines, minimal abstraction over BullMQ

**How it's used**:
```typescript
// In service
const eventManager = EventManager.getInstance()
await eventManager.emit(
  new ContentSaveRequestedEvent({
    userId,
    libraryItemId: item.id,
    url,
    contentType: 'HTML',
  })
)
```

---

## Three Event Management Options

### Option 1: Direct BullMQ Calls (No Abstraction)

**Implementation**:
```typescript
@Injectable()
export class LibraryService {
  constructor(
    @InjectQueue('content-processing') private contentQueue: Queue
  ) {}

  async saveUrl(userId: string, input: SaveUrlInput) {
    // Create library item
    const item = await this.libraryItemRepo.save({...})

    // Queue job directly
    await this.contentQueue.add('fetch-content', {
      libraryItemId: item.id,
      userId,
      url: input.url,
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    })

    return item
  }
}
```

**Pros**:
- ✅ **Simplest**: No extra abstraction
- ✅ **Explicit**: You see exactly what queue/job is used
- ✅ **Type-safe**: NestJS provides strong typing with `@InjectQueue`
- ✅ **Debuggable**: Easy to trace queue operations

**Cons**:
- ❌ **Tight Coupling**: Service knows about queue implementation
- ❌ **Scattered Config**: Retry policies repeated across services
- ❌ **Hard to Refactor**: Changing queue structure requires updating all callers
- ❌ **Testing**: Must mock Queue objects in tests

**When to Use**:
- Single queue, single job type
- No plans for multiple event consumers
- Team prefers explicit over implicit

---

### Option 2: Node.js EventEmitter (Minimal Abstraction)

**Implementation**:
```typescript
// events.ts
export enum EventType {
  CONTENT_SAVE_REQUESTED = 'content.save.requested',
  CONTENT_PROCESSING_COMPLETED = 'content.processing.completed',
}

export interface ContentSaveRequestedEvent {
  libraryItemId: string
  userId: string
  url: string
}

// event-bus.service.ts
@Injectable()
export class EventBusService extends EventEmitter {
  constructor(
    @InjectQueue('content-processing') private contentQueue: Queue
  ) {
    super()
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    // Map events to queue operations
    this.on(EventType.CONTENT_SAVE_REQUESTED, async (data: ContentSaveRequestedEvent) => {
      await this.contentQueue.add('fetch-content', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      })
    })
  }

  // Type-safe emit
  emitContentSaveRequested(data: ContentSaveRequestedEvent) {
    this.emit(EventType.CONTENT_SAVE_REQUESTED, data)
  }
}

// Usage in service
@Injectable()
export class LibraryService {
  constructor(private eventBus: EventBusService) {}

  async saveUrl(userId: string, input: SaveUrlInput) {
    const item = await this.libraryItemRepo.save({...})

    // Fire and forget (synchronous, in-memory)
    this.eventBus.emitContentSaveRequested({
      libraryItemId: item.id,
      userId,
      url: input.url,
    })

    return item
  }
}
```

**Pros**:
- ✅ **Simple**: Built into Node.js, no dependencies
- ✅ **Decoupled**: Service doesn't know about queues
- ✅ **Synchronous**: Events handled in same process (fast)
- ✅ **Testable**: Easy to spy on event emissions
- ✅ **Type-safe**: Helper methods provide TypeScript safety

**Cons**:
- ⚠️ **In-Memory Only**: Events lost if process crashes before handler runs
- ⚠️ **Single Process**: Events don't cross service boundaries
- ⚠️ **Error Handling**: If handler throws, emit() fails
- ⚠️ **No Retry**: Must manually handle failures

**When to Use**:
- **Perfect for your use case**: Single service, minimal architecture
- Event handlers run quickly (queue operations are fast)
- Don't need event persistence
- Want decoupling without complexity

---

### Option 3: Custom EventManager (Full Abstraction)

**Implementation** (Port from legacy):
```typescript
// event-manager.service.ts
@Injectable()
export class EventManagerService {
  private queues = new Map<string, Queue>()
  private routes = new Map<string, EventRoute>()

  constructor(
    @Inject('REDIS_CONNECTION') private redisConnection: ConnectionOptions
  ) {
    this.registerDefaultRoutes()
  }

  registerRoute(eventType: string, route: EventRoute) {
    this.routes.set(eventType, route)
  }

  async emit<T extends BaseEvent>(event: T): Promise<void> {
    const route = this.routes.get(event.eventType)
    if (!route) {
      throw new Error(`No route for event: ${event.eventType}`)
    }

    const queue = await this.getOrCreateQueue(route.queueName)
    await queue.add(route.jobName, event.data, route.jobOptions)
  }

  private registerDefaultRoutes() {
    this.registerRoute('CONTENT_SAVE_REQUESTED', {
      queueName: 'content-processing',
      jobName: 'fetch-content',
      jobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    })
  }
}

// Usage
@Injectable()
export class LibraryService {
  constructor(private eventManager: EventManagerService) {}

  async saveUrl(userId: string, input: SaveUrlInput) {
    const item = await this.libraryItemRepo.save({...})

    await this.eventManager.emit({
      eventType: 'CONTENT_SAVE_REQUESTED',
      data: {
        libraryItemId: item.id,
        userId,
        url: input.url,
      },
    })

    return item
  }
}
```

**Pros**:
- ✅ **Centralized Config**: All event routes and retry policies in one place
- ✅ **Async/Persistent**: Uses BullMQ, survives restarts
- ✅ **Flexible Routing**: One event can trigger multiple queues
- ✅ **Future-Proof**: Easy to add message broker (Kafka, RabbitMQ) later

**Cons**:
- ❌ **Over-Engineering**: ~200 lines for what could be 20
- ❌ **Indirection**: Hard to trace event → queue → job flow
- ❌ **Performance**: Extra Map lookups, queue creation overhead
- ❌ **Async Complexity**: `await emit()` adds latency

**When to Use**:
- Multiple microservices consuming same events
- Event-driven architecture across services
- Need event versioning/replay
- Large team needs strict separation of concerns

---

## Decision Matrix

| Criteria | Direct BullMQ | EventEmitter | EventManager |
|----------|---------------|--------------|--------------|
| **Simplicity** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Decoupling** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Type Safety** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Testability** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Future-Proof** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Lines of Code** | 10 | 50 | 200+ |

---

## Recommendation for Minimal Architecture

### ✅ **Use Option 2: EventEmitter**

**Rationale**:
1. **Perfect for single-service**: You don't have microservices, so in-memory events are fine
2. **Decouples services from queues**: LibraryService doesn't import BullMQ
3. **Fast**: Synchronous, no Redis roundtrip for event emission
4. **Simple**: ~50 lines vs 200+ for EventManager
5. **Testable**: Easy to mock/spy in unit tests
6. **Upgradeable**: Can swap to EventManager later if needed

**Implementation Strategy**:
```typescript
// Start simple
@Injectable()
export class EventBusService extends EventEmitter {
  constructor(
    @InjectQueue('content-processing') private contentQueue: Queue
  ) {
    super()
    this.on('content.save.requested', this.handleContentSave.bind(this))
  }

  private async handleContentSave(data: ContentSaveRequestedEvent) {
    await this.contentQueue.add('fetch-content', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    })
  }

  emitContentSaveRequested(data: ContentSaveRequestedEvent) {
    this.emit('content.save.requested', data)
  }
}
```

**If you need EventManager later** (multiple services, event replay):
- EventEmitter → EventManager is a straightforward refactor
- Change `this.emit()` to `await this.eventManager.emit()`
- No service code changes (same interface)

---

## Part 2: Redis Architecture - Sentinel vs Cluster

### Redis Sentinel (Master-Slave with HA)

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│                    Sentinel Cluster                     │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Sentinel 1  │  │ Sentinel 2  │  │ Sentinel 3  │    │
│  │  Monitor    │  │  Monitor    │  │  Monitor    │    │
│  │  Failover   │  │  Failover   │  │  Failover   │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         └─────────────────┴─────────────────┘           │
└─────────────────────────────────────────────────────────┘
                            │
                   Monitor & Control
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────┐      ┌─────▼────┐      ┌─────▼────┐
    │ Master  │─────▶│ Replica 1│      │ Replica 2│
    │ (R/W)   │      │ (R/O)    │      │ (R/O)    │
    │         │◀─────│          │      │          │
    └─────────┘      └──────────┘      └──────────┘
       ALL              Async            Async
       DATA            Replication      Replication
```

**How It Works**:

1. **Data Storage**:
   - **Master**: One node receives ALL writes and reads
   - **Replicas**: Async copies of master data (read-only)
   - **No Sharding**: All data on every node (master + replicas)

2. **Sentinel Monitoring**:
   - 3+ Sentinel processes monitor master health
   - Send PING to master every second
   - If majority of sentinels agree master is down → trigger failover

3. **Automatic Failover**:
   ```
   Time 0: Master (A) down
   Time 1: Sentinel 1 detects (SDOWN - subjective down)
   Time 2: Sentinel 2 detects (SDOWN)
   Time 3: Sentinel 3 detects (SDOWN)
   Time 4: Quorum reached (3/3) → ODOWN (objective down)
   Time 5: Leader election among sentinels
   Time 6: Chosen sentinel promotes Replica 1 to master
   Time 7: Other replicas point to new master
   Time 8: Clients informed of new master address
   ```

4. **Client Behavior**:
   ```typescript
   const redis = new Redis({
     sentinels: [
       { host: 'sentinel-1', port: 26379 },
       { host: 'sentinel-2', port: 26379 },
       { host: 'sentinel-3', port: 26379 },
     ],
     name: 'mymaster',  // Name of master set
   })

   // Client asks sentinel: "Who is the current master?"
   // Sentinel responds: "Master is at redis-master:6379"
   // Client connects to master directly
   ```

**Configuration**:
```yaml
# docker-compose.yml
redis-master:
  image: redis:7-alpine
  command: redis-server --appendonly yes

redis-replica-1:
  image: redis:7-alpine
  command: redis-server --replicaof redis-master 6379

redis-replica-2:
  image: redis:7-alpine
  command: redis-server --replicaof redis-master 6379

sentinel-1:
  image: redis:7-alpine
  command: >
    redis-sentinel --sentinel monitor mymaster redis-master 6379 2
                    --sentinel down-after-milliseconds mymaster 5000
                    --sentinel failover-timeout mymaster 10000
```

**Pros**:
- ✅ **Simple**: Single master, easy to reason about
- ✅ **Strong Consistency**: All writes go to one node
- ✅ **Automatic Failover**: 5-10 second recovery
- ✅ **Read Scaling**: Can read from replicas (eventually consistent)
- ✅ **Good for Queues**: BullMQ works perfectly with Sentinel

**Cons**:
- ❌ **Single Write Node**: All writes bottleneck on master
- ❌ **Limited Scaling**: Can't scale beyond one machine's capacity
- ❌ **Data Size Limit**: All data must fit on one machine
- ❌ **Replication Lag**: Replicas may be slightly behind (async)

**When to Use**:
- **Your use case**: BullMQ queues + caching (writes are moderate)
- Data fits on single machine (<50GB typical, <200GB max)
- Failover is priority over write scaling
- Simpler operational model

---

### Redis Cluster (Distributed Sharding)

**Architecture**:
```
┌──────────────────────────────────────────────────────────────┐
│                    Redis Cluster                             │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Shard 1        │  │  Shard 2        │  │  Shard 3     │ │
│  │                 │  │                 │  │              │ │
│  │  Master 1       │  │  Master 2       │  │  Master 3    │ │
│  │  Slots 0-5460   │  │  Slots 5461-    │  │  Slots       │ │
│  │                 │  │  10922          │  │  10923-16383 │ │
│  │  Replica 1A     │  │  Replica 2A     │  │  Replica 3A  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘

Hash Slot Distribution:
Key "user:123" → CRC16("user:123") % 16384 → Slot 7532 → Shard 2
Key "job:456"  → CRC16("job:456") % 16384  → Slot 1234 → Shard 1
```

**How It Works**:

1. **Data Sharding**:
   - **16,384 hash slots** divided among masters
   - Each key mapped to slot: `CRC16(key) % 16384`
   - Each master owns a range of slots
   - Data distributed across machines

2. **Client Behavior**:
   ```typescript
   const cluster = new Redis.Cluster([
     { host: 'cluster-1', port: 6379 },
     { host: 'cluster-2', port: 6379 },
     { host: 'cluster-3', port: 6379 },
   ])

   // SET user:123 "data"
   // Client calculates: slot = CRC16("user:123") % 16384 = 7532
   // Finds: Slot 7532 is on cluster-2
   // Sends command to cluster-2
   ```

3. **Redirects**:
   ```
   Client: SET key1 "value"
   Node 1: -MOVED 3999 cluster-2:6379  (key belongs to node 2)
   Client: [connects to node 2]
   Client: SET key1 "value"
   Node 2: OK
   ```

4. **Multi-Key Operations**:
   ```typescript
   // ❌ FAILS: Keys on different shards
   await cluster.mget('user:123', 'user:456')
   // Error: CROSSSLOT Keys in request don't hash to the same slot

   // ✅ WORKS: Hash tags force same slot
   await cluster.mget('{user}:123', '{user}:456')
   // Both keys hash on "user" → same slot → same shard
   ```

**Configuration**:
```bash
# Create cluster
redis-cli --cluster create \
  127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \
  127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
  --cluster-replicas 1  # 1 replica per master
```

**Pros**:
- ✅ **Horizontal Scaling**: Add more shards to increase capacity
- ✅ **High Availability**: Each shard can fail over independently
- ✅ **Large Datasets**: Petabytes of data across machines
- ✅ **Write Scaling**: Writes distributed across masters

**Cons**:
- ❌ **Complexity**: Much harder to operate and debug
- ❌ **Multi-Key Limits**: MGET, transactions must use hash tags
- ❌ **BullMQ Issues**: Requires careful key design (see below)
- ❌ **Rebalancing**: Adding/removing nodes requires slot migration
- ❌ **Network Overhead**: More cross-node communication

**When to Use**:
- **Not your use case**: You don't need this complexity
- Dataset >200GB (won't fit on single machine)
- Write throughput exceeds single machine capacity
- Multiple independent applications sharing Redis

---

## BullMQ Compatibility

### BullMQ + Sentinel ✅

**Works perfectly**:
```typescript
const redis = new Redis({
  sentinels: [
    { host: 'sentinel-1', port: 26379 },
    { host: 'sentinel-2', port: 26379 },
    { host: 'sentinel-3', port: 26379 },
  ],
  name: 'mymaster',
})

const queue = new Queue('my-queue', {
  connection: redis,  // Just works!
})
```

**Why it works**:
- BullMQ keys naturally grouped: `bull:queue-name:*`
- All keys for queue on same (master) node
- Multi-key operations (EVAL scripts) work fine

---

### BullMQ + Cluster ⚠️

**Requires hash tags**:
```typescript
// ❌ DEFAULT: Keys spread across shards
bull:my-queue:id           → Shard 1
bull:my-queue:jobs         → Shard 2
bull:my-queue:completed    → Shard 3
// BullMQ scripts FAIL (multi-key operations across shards)

// ✅ SOLUTION: Use hash tags
const queue = new Queue('my-queue', {
  prefix: '{bull:my-queue}',  // Force all keys to same slot
})

// Now all keys on same shard:
{bull:my-queue}:id           → Slot 7532 → Shard 2
{bull:my-queue}:jobs         → Slot 7532 → Shard 2
{bull:my-queue}:completed    → Slot 7532 → Shard 2
```

**Downsides**:
- All queue data on one shard (defeats purpose of clustering)
- Hot shard if queue is busy
- Can't scale queue beyond single shard capacity

**Verdict**: Cluster + BullMQ is **possible but defeats the purpose**

---

## Comparison Table

| Feature | Sentinel | Cluster |
|---------|----------|---------|
| **Architecture** | Master-Slave | Distributed Shards |
| **Data Distribution** | Replicated (all data on all nodes) | Sharded (data split across nodes) |
| **Write Scaling** | ❌ Single master | ✅ Multiple masters |
| **Read Scaling** | ✅ Read from replicas | ✅ Read from any shard |
| **Max Data Size** | ~200GB (single machine) | Unlimited (add shards) |
| **Failover Time** | 5-10 seconds | 5-10 seconds per shard |
| **Complexity** | ⭐⭐ Low | ⭐⭐⭐⭐⭐ High |
| **BullMQ Support** | ✅ Perfect | ⚠️ Requires hash tags |
| **Multi-Key Ops** | ✅ All work | ⚠️ Need hash tags |
| **Setup Difficulty** | ⭐⭐ Easy | ⭐⭐⭐⭐ Hard |
| **Operational Complexity** | ⭐⭐ Low | ⭐⭐⭐⭐⭐ High |

---

## Recommendation: Redis Sentinel

**For your architecture**:

### ✅ **Use Redis Sentinel**

**Rationale**:
1. **BullMQ Compatibility**: Perfect support, no workarounds needed
2. **Simpler Operations**: 3 sentinels + 1 master + 2 replicas (6 total)
3. **Adequate Capacity**: Queue data is small (<1GB typical)
4. **Faster Failover**: All nodes know each other, quicker recovery
5. **Lower Latency**: No cross-shard redirects

**Configuration** (Production-Ready):

```yaml
# docker-compose.yml (simplified)
services:
  redis-master:
    image: redis:7-alpine
    command: >
      redis-server
      --appendonly yes
      --maxmemory 2gb
      --maxmemory-policy allkeys-lru
    volumes:
      - redis-master-data:/data

  redis-replica-1:
    image: redis:7-alpine
    command: redis-server --replicaof redis-master 6379

  redis-replica-2:
    image: redis:7-alpine
    command: redis-server --replicaof redis-master 6379

  sentinel-1:
    image: redis:7-alpine
    command: >
      redis-sentinel /sentinel.conf
      --sentinel monitor mymaster redis-master 6379 2
      --sentinel down-after-milliseconds mymaster 5000
      --sentinel failover-timeout mymaster 10000
      --sentinel parallel-syncs mymaster 1

  sentinel-2:
    image: redis:7-alpine
    command: [same as sentinel-1]

  sentinel-3:
    image: redis:7-alpine
    command: [same as sentinel-1]

volumes:
  redis-master-data:
```

**NestJS Configuration**:
```typescript
// redis.config.ts
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

export const createRedisConnection = (config: ConfigService) => {
  if (config.get('REDIS_SENTINEL_ENABLED')) {
    return new Redis({
      sentinels: [
        { host: config.get('REDIS_SENTINEL_1_HOST'), port: 26379 },
        { host: config.get('REDIS_SENTINEL_2_HOST'), port: 26379 },
        { host: config.get('REDIS_SENTINEL_3_HOST'), port: 26379 },
      ],
      name: 'mymaster',
      password: config.get('REDIS_PASSWORD'),
      // Sentinel-specific options
      sentinelPassword: config.get('REDIS_SENTINEL_PASSWORD'),
      sentinelRetryStrategy: (times) => Math.min(times * 100, 3000),
    })
  }

  // Fallback: Direct connection (dev/test)
  return new Redis({
    host: config.get('REDIS_HOST', 'localhost'),
    port: config.get('REDIS_PORT', 6379),
    password: config.get('REDIS_PASSWORD'),
  })
}
```

**When to Consider Cluster** (Future):
- Queue data exceeds 100GB regularly
- Write throughput >50,000 ops/sec
- Running multiple independent apps on same Redis

---

## Summary

### Event Management: **EventEmitter** ✅
- 50 lines of code vs 200+
- Fast (synchronous, in-memory)
- Decouples services from queues
- Testable and simple
- Upgradeable to EventManager if needed

### Redis Architecture: **Sentinel** ✅
- Perfect BullMQ support
- Adequate capacity for queues
- Simple operations (6 nodes total)
- 5-10 second failover
- Lower complexity

**Decision**: Start simple, scale when needed. Both can be upgraded later without major refactoring.
