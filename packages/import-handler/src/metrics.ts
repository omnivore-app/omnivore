import { RedisDataSource } from '@omnivore/utils'
import Redis from 'ioredis'
import { sendImportCompletedEmail } from '.'

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
  redisClient: Redis,
  userId: string,
  taskId: string,
  source: string
) => {
  const key = `import:${userId}:${taskId}`
  try {
    // set multiple fields
    await redisClient.hset(key, {
      ['start_time']: Date.now(),
      ['source']: source,
      ['state']: ImportTaskState.STARTED,
    })
  } catch (error) {
    console.error('Redis Error', error)
  }
}

export const updateMetrics = async (
  redisDataSource: RedisDataSource,
  userId: string,
  taskId: string,
  status: ImportStatus
) => {
  const key = `import:${userId}:${taskId}`

  const redisClient = redisDataSource.cacheClient
  /**
   * Define our command
   */
  redisClient.defineCommand('updatemetrics', {
    numberOfKeys: 1,
    lua: `
      local key = tostring(KEYS[1]);
      local status = tostring(ARGV[1]);
      local timestamp = tonumber(ARGV[2]);

      -- increment the status counter
      redis.call('HINCRBY', key, status, 1);

      if (status == "imported" or status == "failed") then
        -- get the current metrics
        local bulk = redis.call('HGETALL', key);
        -- get the total, imported and failed counters
        local result = {}
        local nextkey
        for i, v in ipairs(bulk) do
          if i % 2 == 1 then
            nextkey = v
          else
            result[nextkey] = v
          end
        end
        
        local imported = tonumber(result['imported']) or 0;
        local failed = tonumber(result['failed']) or 0;
        local total = tonumber(result['total']) or 0;
        local state = tonumber(result['state']) or 0;
        if (state == 0 and imported + failed >= total) then
          -- all the records have been processed
          -- update the metrics
          redis.call('HSET', key, 'end_time', timestamp, 'state', 1);
          return 1
        end
      end

      return 0;
    `,
  })

  try {
    // use lua script to increment hash field
    const state = await redisClient.updatemetrics(
      key,
      status,
      Date.now().toString()
    )

    // if the task is finished, send email
    if ((state as ImportTaskState) == ImportTaskState.FINISHED) {
      const metrics = await getMetrics(redisClient, userId, taskId)
      if (metrics) {
        await sendImportCompletedEmail(
          redisDataSource,
          userId,
          metrics.imported,
          metrics.failed
        )
      }
    }
  } catch (error) {
    console.error('Redis Error', error)
  }
}

export const getMetrics = async (
  redisClient: Redis,
  userId: string,
  taskId: string
): Promise<ImportMetrics | null> => {
  const key = `import:${userId}:${taskId}`
  try {
    const metrics = await redisClient.hgetall(key)

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
