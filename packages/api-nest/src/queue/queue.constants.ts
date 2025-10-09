/**
 * Queue Configuration Constants
 *
 * Centralized constants for queue names, job types, and priorities
 * to avoid magic strings throughout the codebase.
 */

/**
 * Queue Names - Define all queues used in the system
 */
export const QUEUE_NAMES = {
  CONTENT_PROCESSING: 'content-processing',
  NOTIFICATIONS: 'notifications',
  POST_PROCESSING: 'post-processing',
} as const

/**
 * Job Types - Define all job types for each queue
 */
export const JOB_TYPES = {
  // Content Processing Queue
  FETCH_CONTENT: 'fetch-content',
  PARSE_CONTENT: 'parse-content',
  EXTRACT_METADATA: 'extract-metadata',

  // Notifications Queue
  SEND_NOTIFICATION: 'send-notification',
  SEND_EMAIL: 'send-email',

  // Post Processing Queue
  UPDATE_SEARCH_INDEX: 'update-search-index',
  GENERATE_THUMBNAIL: 'generate-thumbnail',
} as const

/**
 * Job Priority Levels
 * Lower numbers = higher priority
 */
export const JOB_PRIORITY = {
  CRITICAL: 1,
  HIGH: 5,
  NORMAL: 10,
  LOW: 20,
} as const

/**
 * Job Configuration Defaults
 */
export const JOB_CONFIG = {
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_BACKOFF_TYPE: 'exponential' as const,
  RETRY_BACKOFF_DELAY: 2000, // 2 seconds initial delay

  // Rate limiting
  RATE_LIMIT_MAX: 5, // Max jobs per time window
  RATE_LIMIT_DURATION: 60000, // 1 minute window

  // Job timeouts
  TIMEOUT_CONTENT_FETCH: 60000, // 60 seconds
  TIMEOUT_PARSE_CONTENT: 30000, // 30 seconds
  TIMEOUT_NOTIFICATION: 10000, // 10 seconds

  // Worker concurrency
  WORKER_CONCURRENCY: 4,
} as const

/**
 * Redis Configuration
 */
export const REDIS_CONFIG = {
  // Connection
  HOST: process.env.REDIS_HOST || 'localhost',
  PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  PASSWORD: process.env.REDIS_PASSWORD,

  // Sentinel configuration (for production)
  SENTINEL_NAME: process.env.REDIS_SENTINEL_NAME || 'mymaster',
  SENTINELS: process.env.REDIS_SENTINELS
    ? process.env.REDIS_SENTINELS.split(',').map(s => {
        const [host, port] = s.split(':')
        return { host, port: parseInt(port, 10) }
      })
    : undefined,

  // Connection pool
  // BullMQ requires null for blocking operations (BRPOPLPUSH, etc.)
  MAX_RETRIES_PER_REQUEST: null,
  ENABLE_READY_CHECK: true,
  ENABLE_OFFLINE_QUEUE: true,

  // Key prefixes for different environments
  KEY_PREFIX: process.env.NODE_ENV === 'test'
    ? 'omnivore:test:'
    : 'omnivore:',
} as const

/**
 * Queue State Values
 */
export const QUEUE_STATE = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DELAYED: 'delayed',
  WAITING: 'waiting',
} as const

/**
 * Type exports for type-safe usage
 */
export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES]
export type JobType = typeof JOB_TYPES[keyof typeof JOB_TYPES]
export type JobPriority = typeof JOB_PRIORITY[keyof typeof JOB_PRIORITY]
export type QueueState = typeof QUEUE_STATE[keyof typeof QUEUE_STATE]
