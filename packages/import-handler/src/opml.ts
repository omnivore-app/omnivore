// @ts-ignore
import OpmlParser from 'opmlparser'
import { Stream } from 'stream'
import { ArticleSavingRequestStatus, ImportContext } from '.'
import { createMetrics, ImportStatus, updateMetrics } from './metrics'

export const importOpml = async (
  ctx: ImportContext,
  stream: Stream
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    // create metrics in redis
    await createMetrics(ctx.redisClient, ctx.userId, ctx.taskId, ctx.source)

    const opmlParser = new OpmlParser()
    stream.pipe(opmlParser)

    // helper to know when to resolve
    const workings = {}

    opmlParser.on('readable', async function () {
      let feed
      while ((feed = opmlParser.read())) {
        const { xmlurl } = feed
        const url = new URL(xmlurl)
        // @ts-ignore
        workings[xmlurl] = true
        try {
          if (feed.xmlurl === undefined) continue

          // update total counter
          await updateMetrics(
            ctx.redisClient,
            ctx.userId,
            ctx.taskId,
            ImportStatus.TOTAL
          )
          await ctx.urlHandler(ctx, url)
          ctx.countImported += 1
          // update started counter
          await updateMetrics(
            ctx.redisClient,
            ctx.userId,
            ctx.taskId,
            ImportStatus.STARTED
          )
          // limit import to 20k urls
          if (ctx.countImported + ctx.countFailed >= 20000) {
            console.log('import limit reached')
            reject()
          }
        } catch (error) {
          console.log('invalid data', feed, error)

          ctx.countFailed += 1
          // update invalid counter
          await updateMetrics(
            ctx.redisClient,
            ctx.userId,
            ctx.taskId,
            ImportStatus.INVALID
          )
        }
        // @ts-ignore
        workings[xmlurl] = false
        if (Object.values(workings).every((v) => !v)) {
          resolve()
        }
      }
    })
  })

  // TODO: handle errors
}
