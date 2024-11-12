/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { parse } from '@fast-csv/parse'
import { Stream } from 'stream'
import { ArticleSavingRequestStatus, ImportContext } from '.'
import { createMetrics, ImportStatus, updateMetrics } from './metrics'

const parseLabels = (labels: string): string[] => {
  try {
    // labels follows format: "[""label1"",""label2""]"
    return JSON.parse(labels) as string[]
  } catch (error) {
    // labels follows format: "[label1,label2]"
    return labels
      .slice(1, -1)
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l !== '')
  }
}

const parseState = (state: string): ArticleSavingRequestStatus => {
  const validStates = ['SUCCEEDED', 'ARCHIVED']
  // validate state
  if (!validStates.includes(state.toUpperCase())) {
    throw new Error('invalid state')
  }

  return state as ArticleSavingRequestStatus
}

const parseDate = (date: string): Date => {
  // date is unix timestamp in milliseconds
  const parsedDate = new Date(parseInt(date, 10))
  if (isNaN(parsedDate.getTime())) {
    throw new Error('invalid date')
  }

  return parsedDate
}

export const importCsv = async (ctx: ImportContext, stream: Stream) => {
  // create metrics in redis
  await createMetrics(
    ctx.redisDataSource.cacheClient,
    ctx.userId,
    ctx.taskId,
    ctx.source
  )

  const parser = parse({
    headers: true,
    discardUnmappedColumns: true,
    objectMode: true,
    ignoreEmpty: true,
    trim: true,
  })
  stream.pipe(parser)
  for await (const row of parser) {
    try {
      const url = new URL(row['url'])
      const state = row['state'] ? parseState(row['state']) : undefined
      const labels = row['labels'] ? parseLabels(row['labels']) : undefined
      const savedAt = row['saved_at'] ? parseDate(row['saved_at']) : undefined
      const publishedAt = row['published_at']
        ? parseDate(row['published_at'])
        : undefined

      // update total counter
      await updateMetrics(
        ctx.redisDataSource,
        ctx.userId,
        ctx.taskId,
        ImportStatus.TOTAL
      )

      await ctx.urlHandler(ctx, url, state, labels, savedAt, publishedAt)

      ctx.countImported += 1
      // update started counter
      await updateMetrics(
        ctx.redisDataSource,
        ctx.userId,
        ctx.taskId,
        ImportStatus.STARTED
      )

      // limit import to 20k urls
      if (ctx.countImported + ctx.countFailed >= 20000) {
        console.log('import limit reached')
        break
      }
    } catch (error) {
      console.log('invalid data', row, error)

      ctx.countFailed += 1
      // update invalid counter
      await updateMetrics(
        ctx.redisDataSource,
        ctx.userId,
        ctx.taskId,
        ImportStatus.INVALID
      )
    }
  }
}
