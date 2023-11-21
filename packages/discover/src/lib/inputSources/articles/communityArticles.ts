import { PubSub } from '@google-cloud/pubsub'
import { catchError, EMPTY, Observable, Subscriber } from 'rxjs'
import { Message } from '@google-cloud/pubsub/build/src/subscriber'
import { OmnivoreArticle } from '../../../types/OmnivoreArticle'

const TOPIC_NAME = 'discordCommunityArticles'
const client = new PubSub()

const extractArticleFromMessage = (message: Message): OmnivoreArticle => {
  const parsedMessage: OmnivoreArticle = JSON.parse(
    message.data.toString()
  ) as OmnivoreArticle

  return {
    ...parsedMessage,
    publishedAt: parsedMessage.publishedAt ?? new Date(),
    type: 'community',
  }
}

export const communityArticles$ = new Observable(
  (subscriber: Subscriber<any>) => {
    const subscription = client.topic(TOPIC_NAME).subscription(TOPIC_NAME)

    subscription.on('message', (msg: Message) => {
      subscriber.next(extractArticleFromMessage(msg))
      msg.ack()
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
