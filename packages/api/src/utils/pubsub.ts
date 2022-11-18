import { CreateSubscriptionOptions, PubSub } from '@google-cloud/pubsub'

// init pubsub client
const pubsub = new PubSub()

export const createPubSubSubscription = async (
  topicName: string,
  subscriptionName: string,
  options?: CreateSubscriptionOptions
) => {
  const topic = pubsub.topic(topicName)
  const [exists] = await topic.exists()
  if (!exists) {
    await topic.create()
  }

  const subscription = topic.subscription(subscriptionName)
  const [subscriptionExists] = await subscription.exists()
  if (!subscriptionExists) {
    await subscription.create(options)
  }
}

export const deletePubSubSubscription = async (
  topicName: string,
  subscriptionName: string
) => {
  const topic = pubsub.topic(topicName)
  const [exists] = await topic.exists()
  if (!exists) {
    return
  }

  const subscription = topic.subscription(subscriptionName)
  const [subscriptionExists] = await subscription.exists()
  if (subscriptionExists) {
    await subscription.delete()
  }
}
