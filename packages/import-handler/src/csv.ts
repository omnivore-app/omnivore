/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { parse } from '@fast-csv/parse'
import { Stream } from 'stream'

export type UrlHandler = (url: URL) => Promise<void>

export const importCsv = async (
  stream: Stream,
  handler: UrlHandler
): Promise<number> => {
  const parser = parse()
  stream.pipe(parser)
  let count = 0
  for await (const row of parser) {
    try {
      const url = new URL(row[0])
      await handler(url)
    } catch (error) {
      console.log('invalid url', row, error)
    }
    count++
  }
  return count
}
