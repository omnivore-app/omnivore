import { PubSub } from '@google-cloud/pubsub'
import { Observable, Subscriber } from 'rxjs'
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

const communityArticles$ = new Observable((subscriber: Subscriber<any>) => {
  const subscription = client.subscription(TOPIC_NAME)

  subscription.on('message', (msg: Message) => {
    subscriber.next(extractArticleFromMessage(msg))
    msg.ack()
  })
}).pipe()
