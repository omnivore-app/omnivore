import { Subscription } from '../entity/subscription'
import { getRepository } from '../entity/utils'
import { SubscriptionStatus } from '../generated/graphql'

export const saveSubscription = async (
  userId: string,
  name: string,
  unsubscribeMailTo?: string,
  unsubscribeHttpUrl?: string
): Promise<Subscription> => {
  const subscription = await getRepository(Subscription).findOneBy({
    name,
    user: { id: userId },
  })

  if (subscription) {
    // if subscription already exists, updates updatedAt
    subscription.updatedAt = new Date()
    subscription.status = SubscriptionStatus.Active
    unsubscribeMailTo && (subscription.unsubscribeMailTo = unsubscribeMailTo)
    unsubscribeHttpUrl && (subscription.unsubscribeHttpUrl = unsubscribeHttpUrl)
    return getRepository(Subscription).save(subscription)
  }

  // create new subscription
  return getRepository(Subscription).save({
    name,
    user: { id: userId },
    status: SubscriptionStatus.Active,
    unsubscribeHttpUrl,
    unsubscribeMailTo,
  })
}
