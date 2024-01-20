import { Subscription } from '../entity/subscription'
import {
  SubscriptionStatus,
  UpdateSubscriptionInput,
} from '../generated/graphql'
import { getRepository } from '../repository'

const ensureOwns = async (userId: string, subscriptionId: string) => {
  const repo = getRepository(Subscription)

  const existing = repo.findOneByOrFail({
    id: subscriptionId,
    user: { id: userId },
  })
  if (!existing) {
    throw new Error('Can not find subscription being updated.')
  }
}

type UpdateSubscriptionData = {
  autoAddToLibrary?: boolean | null
  description?: string | null
  fetchContent?: boolean | null
  folder?: string | null
  isPrivate?: boolean | null
  lastFetchedAt?: Date | null
  lastFetchedChecksum?: string | null
  name?: string | null
  scheduledAt?: Date | null
  status?: SubscriptionStatus | null
}

export const updateSubscription = async (
  userId: string,
  subscriptionId: string,
  newData: UpdateSubscriptionData
): Promise<Subscription> => {
  ensureOwns(userId, subscriptionId)

  const repo = getRepository(Subscription)
  await repo.save({
    id: subscriptionId,
    name: newData.name || undefined,
    description: newData.description || undefined,
    lastFetchedAt: newData.lastFetchedAt
      ? new Date(newData.lastFetchedAt)
      : undefined,
    lastFetchedChecksum: newData.lastFetchedChecksum || undefined,
    status: newData.status || undefined,
    scheduledAt: newData.scheduledAt
      ? new Date(newData.scheduledAt)
      : undefined,
    autoAddToLibrary: newData.autoAddToLibrary ?? undefined,
    isPrivate: newData.isPrivate ?? undefined,
    fetchContent: newData.fetchContent ?? undefined,
    folder: newData.folder ?? undefined,
  })

  return (await getRepository(Subscription).findOneByOrFail({
    id: subscriptionId,
    user: { id: userId },
  })) as Subscription
}
