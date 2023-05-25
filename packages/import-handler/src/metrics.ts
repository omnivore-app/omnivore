import { createClient } from 'redis'
import { lua } from './redis'

// explicitly create the return type of RedisClient
type RedisClient = ReturnType<typeof createClient>

enum ImportStatus {
  STARTED = 'started',
  INVALID = 'invalid',
  IMPORTED = 'imported',
  FAILED = 'failed',
  TOTAL = 'total',
}

enum ImportTaskState {
  STARTED,
  FINISHED,
}

interface ImportMetrics {
  started: number
  invalid: number
  imported: number
  failed: number
  total: number
  importer: string
  state: ImportTaskState
  startTime: number
  endTime: number
}

export const startImport = async (
  redisClient: RedisClient,
  userId: string,
  taskId: string,
  importer: string
) => {
  const key = `import:${userId}:${taskId}`
  try {
    // set multiple fields
    await redisClient.hSet(key, {
      ['start_time']: Date.now(), // unix timestamp in seconds
      ['importer']: importer,
      ['state']: ImportTaskState.STARTED,
    })
  } catch (error) {
    console.error('Redis Error', error)
  }
}

export const updateMetrics = async (
  redisClient: RedisClient,
  userId: string,
  taskId: string,
  status: ImportStatus
) => {
  const key = `import:${userId}:${taskId}`

  try {
    // use lua script to increment hash field
    await redisClient.evalSha(lua.sha, {
      keys: [key],
      arguments: [status, Date.now().toString()],
    })
  } catch (error) {
    console.error('Redis Error', error)
  }
}

export const getMetrics = async (
  redisClient: RedisClient,
  userId: string,
  taskId: string
): Promise<ImportMetrics | null> => {
  const key = `import:${userId}:${taskId}`
  try {
    const metrics = await redisClient.hGetAll(key)

    return {
      // convert to integer
      started: parseInt(metrics.started, 10),
      invalid: parseInt(metrics.invalid, 10),
      imported: parseInt(metrics.imported, 10),
      failed: parseInt(metrics.failed, 10),
      total: parseInt(metrics.total, 10),
      importer: metrics.importer,
      state: parseInt(metrics.state, 10),
      startTime: parseInt(metrics.start_time, 10),
      endTime: parseInt(metrics.end_time, 10),
    }
  } catch (error) {
    console.error('Redis Error', error)
    return null
  }
}
