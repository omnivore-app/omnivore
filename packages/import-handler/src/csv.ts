/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { parse } from '@fast-csv/parse'
import { Stream } from 'stream'
import { ImportContext } from '.'

export const importCsv = async (ctx: ImportContext, stream: Stream) => {
  const parser = parse()
  stream.pipe(parser)
  for await (const row of parser) {
    try {
      const url = new URL(row[0])
      const state = row.length > 1 ? row[1] : undefined
      // labels follows format: "[label1, label2]"
      const labels = row.length > 2 ? row[2].slice(1, -1).split(',') : undefined
      await ctx.urlHandler(ctx, url, state, labels)
    } catch (error) {
      console.log('invalid url', row, error)
      ctx.countFailed += 1
    }
  }
}
