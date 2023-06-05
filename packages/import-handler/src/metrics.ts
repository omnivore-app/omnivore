import { createClient } from 'redis'
import { sendImportCompletedEmail } from '.'
import { lua } from './redis'

// explicitly create the return type of RedisClient
type RedisClient = ReturnType<typeof createClient>

export enum ImportStatus {
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
  source: string
  state: ImportTaskState
  startTime: number
  endTime: number
}

export const createMetrics = async (
  redisClient: RedisClient,
  userId: string,
  taskId: string,
  source: string
) => {
  const key = `import:${userId}:${taskId}`
  try {
    // set multiple fields
    await redisClient.hSet(key, {
      ['start_time']: Date.now(),
      ['source']: source,
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
    const state = await redisClient.evalSha(lua.sha, {
      keys: [key],
      arguments: [status, Date.now().toString()],
    })

    // if the task is finished, send email
    if (state == ImportTaskState.FINISHED) {
      const metrics = await getMetrics(redisClient, userId, taskId)
      if (metrics) {
        await sendImportCompletedEmail(userId, metrics.imported, metrics.failed)
      }
    }
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
      started: parseInt(metrics.started, 10) || 0,
      invalid: parseInt(metrics.invalid, 10) || 0,
      imported: parseInt(metrics.imported, 10) || 0,
      failed: parseInt(metrics.failed, 10) || 0,
      total: parseInt(metrics.total, 10) || 0,
      source: metrics.source,
      state: parseInt(metrics.state, 10) || ImportTaskState.STARTED,
      startTime: parseInt(metrics.start_time, 10),
      endTime: parseInt(metrics.end_time, 10),
    }
  } catch (error) {
    console.error('Redis Error', error)
    return null
  }
}
