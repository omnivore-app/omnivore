import { PubSub } from '@google-cloud/pubsub'
import { catchError, EMPTY, Observable, Subscriber } from 'rxjs'
import { Message } from '@google-cloud/pubsub/build/src/subscriber'
import { OmnivoreArticle } from '../../../types/OmnivoreArticle'

const TOPIC_NAME = 'discordCommunityArticles'
const client = new PubSub()

export const COMMUNITY = 'OMNIVORE_COMMUNITY'

const extractArticleFromMessage = (message: Message): OmnivoreArticle => {
  const parsedMessage: OmnivoreArticle = JSON.parse(
    message.data.toString()
  ) as OmnivoreArticle

  return {
    ...parsedMessage,
    feedId: COMMUNITY,
    publishedAt: parsedMessage.publishedAt ?? new Date(),
    type: 'community',
  }
}

export const communityArticles$ = new Observable(
  (subscriber: Subscriber<any>) => {
    client
      .topic(TOPIC_NAME)
      .exists()
      .then((exists) => {
        if (exists[0]) {
          return client.topic(TOPIC_NAME).subscription(TOPIC_NAME)
        }

        return client
          .createTopic(TOPIC_NAME)
          .then((_topic) => {
            return client.topic(TOPIC_NAME).createSubscription(TOPIC_NAME)
          })
          .then((_sub) => {
            return client.topic(TOPIC_NAME).subscription(TOPIC_NAME)
          })
      })
      .then((subscription) => {
        subscription.on('message', (msg: Message) => {
          subscriber.next(extractArticleFromMessage(msg))
          msg.ack()
        })
      })
      .catch((e) => {
        console.error(
          'Error creating Subscription, continuing without community articles...',
          e
        )
      })
  }
).pipe(
  catchError((err) => {
    console.log('Caught Error, continuing')
    console.error(err)

    // Return an empty Observable which gets collapsed in the output
    return EMPTY
  })
)
