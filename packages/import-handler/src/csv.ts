/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { parse } from '@fast-csv/parse'
import { Stream } from 'stream'
import { ImportContext } from '.'
import { ImportStatus, updateMetrics } from './metrics'

export const importCsv = async (ctx: ImportContext, stream: Stream) => {
  const parser = parse()
  stream.pipe(parser)
  for await (const row of parser) {
    try {
      const url = new URL(row[0])
      const state = row.length > 1 && row[1] ? row[1] : undefined
      // labels follows format: "[label1,label2]"
      const labels =
        row.length > 2
          ? (row[2] as string)
              .slice(1, -1)
              .split(',')
              .map((l) => l.trim())
              .filter((l) => l !== '')
          : undefined

      // update total counter
      await updateMetrics(
        ctx.redisClient,
        ctx.userId,
        ctx.taskId,
        ImportStatus.TOTAL,
        ctx.source
      )

      await ctx.urlHandler(ctx, url, state, labels)

      ctx.countImported += 1
      // update started counter
      await updateMetrics(
        ctx.redisClient,
        ctx.userId,
        ctx.taskId,
        ImportStatus.STARTED,
        ctx.source
      )
    } catch (error) {
      console.log('invalid url', row, error)

      ctx.countFailed += 1
      // update invalid counter
      await updateMetrics(
        ctx.redisClient,
        ctx.userId,
        ctx.taskId,
        ImportStatus.INVALID,
        ctx.source
      )
    }
  }
}
