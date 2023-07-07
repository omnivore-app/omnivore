/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { readPushSubscription } from '../../datalayer/pubsub'
import { Subscription } from '../../entity/subscription'
import { getRepository } from '../../entity/utils'
import { SubscriptionStatus, SubscriptionType } from '../../generated/graphql'
import { enqueueRssFeedFetch } from '../../utils/createTask'

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

    try {
      // get all active rss feed subscriptions
      const subscriptions = await getRepository(Subscription).find({
        where: {
          type: SubscriptionType.Rss,
          status: SubscriptionStatus.Active,
        },
        relations: ['user'],
      })

      // create a cloud taks to fetch rss feed item for each subscription
      await Promise.all(
        subscriptions.map((subscription) => {
          try {
            return enqueueRssFeedFetch(subscription)
          } catch (error) {
            console.log('error creating rss feed fetch task', error)
          }
        })
      )

      res.send('OK')
    } catch (error) {
      console.log('error fetching rss feeds', error)
      res.status(500).send('Internal Server Error')
    }
  })

  return router
}
