import { PubSub } from '@google-cloud/pubsub'
import { catchError, EMPTY, Observable, Subscriber } from 'rxjs'
import { Message } from '@google-cloud/pubsub/build/src/subscriber'
import { OmnivoreFeed } from '../../../../types/Feeds'

const TOPIC_NAME = 'entityCreated'
const client = new PubSub()

// If a user creates a brand new Feed (IE: Never before subscribed to) we will endeavor to
// create all the items from it immediately.
export const newFeeds$ = new Observable<OmnivoreFeed>(
  (subscriber: Subscriber<any>) => {
    client
      .topic(TOPIC_NAME)
      .exists()
      .then((exists) => {
        if (exists[0]) {
          return client
            .topic(TOPIC_NAME)
            .subscription(`${TOPIC_NAME}Discover`)
            .exists()
            .then((subExists) => {
              if (subExists[0]) {
                return client
                  .topic(TOPIC_NAME)
                  .subscription(`${TOPIC_NAME}Discover`)
              }

              return client
                .topic(TOPIC_NAME)
                .createSubscription(`${TOPIC_NAME}Discover`)
                .then((_sub) => {
                  return client
                    .topic(TOPIC_NAME)
                    .subscription(`${TOPIC_NAME}Discover`)
                })
            })
        }

        return client.createTopic(TOPIC_NAME).then((_) => {
          return client
            .topic(TOPIC_NAME)
            .createSubscription(`${TOPIC_NAME}Discover`)
            .then((_sub) => {
              return client
                .topic(TOPIC_NAME)
                .subscription(`${TOPIC_NAME}Discover`)
            })
        })
      })
      .then((subscription) => {
        subscription.on('message', (msg: Message) => {
          const parsedMessage = JSON.parse(msg.data.toString())
          if (parsedMessage.type == 'feed') {
            subscriber.next(parsedMessage.feed as OmnivoreFeed)
          }
          msg.ack()
        })
      })
      .catch((e) => {
        console.error(
          'Error creating Subscription, continuing without new feed parsing...',
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
