/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { parse } from '@fast-csv/parse'
import { Stream } from 'stream'
import { ImportContext } from '.'
import { createMetrics, ImportStatus, updateMetrics } from './metrics'

const parseLabels = (labels: string): string[] => {
  try {
    // labels follows format: "[""label1"",""label2""]"
    return JSON.parse(labels) as string[]
  } catch (error) {
    console.debug('invalid labels format', labels)

    // labels follows format: "[label1,label2]"
    return labels
      .slice(1, -1)
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l !== '')
  }
}

export const importCsv = async (ctx: ImportContext, stream: Stream) => {
  // create metrics in redis
  await createMetrics(ctx.redisClient, ctx.userId, ctx.taskId, 'csv-importer')

  const parser = parse()
  stream.pipe(parser)
  for await (const row of parser) {
    try {
      const url = new URL(row[0])
      const state = row.length > 1 && row[1] ? row[1] : undefined
      const labels = row.length > 2 ? parseLabels(row[2]) : undefined

      // update total counter
      await updateMetrics(
        ctx.redisClient,
        ctx.userId,
        ctx.taskId,
        ImportStatus.TOTAL
      )

      await ctx.urlHandler(ctx, url, state, labels)

      ctx.countImported += 1
      // update started counter
      await updateMetrics(
        ctx.redisClient,
        ctx.userId,
        ctx.taskId,
        ImportStatus.STARTED
      )
    } catch (error) {
      console.log('invalid url', row, error)

      ctx.countFailed += 1
      // update invalid counter
      await updateMetrics(
        ctx.redisClient,
        ctx.userId,
        ctx.taskId,
        ImportStatus.INVALID
      )
    }
  }
}
