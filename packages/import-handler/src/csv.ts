/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { parse } from '@fast-csv/parse'
import { Stream } from 'stream'
import { ImportContext } from '.'

export const importCsv = async (stream: Stream, ctx: ImportContext) => {
  const parser = parse()
  stream.pipe(parser)
  for await (const row of parser) {
    try {
      const url = new URL(row[0])
      await ctx.urlHandler(ctx, url)
      ctx.countImported += 1
    } catch (error) {
      console.log('invalid url', row, error)
      ctx.countFailed += 1
    }
  }
}
