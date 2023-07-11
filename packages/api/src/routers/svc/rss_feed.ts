/* eslint-disable @typescript-eslint/no-misused-promises */
import { stringify } from 'csv-stringify/.'
import express from 'express'
import { DateTime } from 'luxon'
import { readPushSubscription } from '../../datalayer/pubsub'
import { Subscription } from '../../entity/subscription'
import { getRepository } from '../../entity/utils'
import { SubscriptionStatus, SubscriptionType } from '../../generated/graphql'
import { createGCSFile } from '../../utils/uploads'

export function rssFeedRouter() {
  const router = express.Router()

  router.post('/fetchAll', async (req, res) => {
    console.log('fetch all rss feeds')

    const { message: msgStr, expired } = readPushSubscription(req)
    console.log('read pubsub message', msgStr, 'has expired', expired)

    if (expired) {
      console.log('discarding expired message')
      return res.status(200).send('Expired')
    }

    let writeStream: NodeJS.WritableStream | undefined
    try {
      // get all active rss feed subscriptions
      const subscriptions = await getRepository(Subscription).find({
        select: ['id', 'url', 'user'],
        where: {
          type: SubscriptionType.Rss,
          status: SubscriptionStatus.Active,
        },
        relations: ['user'],
      })

      // write the list of subscriptions to a csv file and upload it to gcs
      // path style: rss/<date>.csv
      const dateStr = DateTime.now().toISODate()
      const fullPath = `rss/${dateStr}.csv`
      // open a write_stream to the file
      const file = createGCSFile(fullPath)
      writeStream = file.createWriteStream({
        contentType: 'text/csv',
      })
      // stringify the data and pipe it to the write_stream
      const stringifier = stringify({
        header: false,
        columns: ['subscriptionId', 'userId', 'feedUrl'],
      })
      stringifier.pipe(writeStream)

      subscriptions.forEach((sub) => {
        stringifier.write([sub.id, sub.user.id, sub.url])
      })
    } catch (error) {
      console.log('error fetching rss feeds', error)
      return res.status(500).send('Internal Server Error')
    } finally {
      writeStream?.end()
    }

    res.send('OK')
  })

  return router
}
