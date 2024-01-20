import { Subscription } from '../entity/subscription'
import { UpdateSubscriptionInput } from '../generated/graphql'
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

export const updateSubscription = async (
  userId: string,
  subscriptionId: string,
  newData: UpdateSubscriptionInput
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
