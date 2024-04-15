import {
  FetchContentType,
  Subscription,
  SubscriptionStatus,
} from '../entity/subscription'
import { getRepository } from '../repository'

const ensureOwns = async (userId: string, subscriptionId: string) => {
  const repo = getRepository(Subscription)

  const existing = await repo.findOneByOrFail({
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
  fetchContentType?: FetchContentType | null
  folder?: string | null
  isPrivate?: boolean | null
  mostRecentItemDate?: Date | null
  lastFetchedChecksum?: string | null
  name?: string | null
  scheduledAt?: Date | null
  status?: SubscriptionStatus | null
  refreshedAt?: Date | null
  failedAt?: Date | null
}

export const updateSubscription = async (
  userId: string,
  subscriptionId: string,
  newData: UpdateSubscriptionData
): Promise<Subscription> => {
  await ensureOwns(userId, subscriptionId)

  const repo = getRepository(Subscription)
  await repo.save({
    id: subscriptionId,
    name: newData.name || undefined,
    description: newData.description || undefined,
    mostRecentItemDate: newData.mostRecentItemDate || undefined,
    refreshedAt: newData.refreshedAt || undefined,
    lastFetchedChecksum: newData.lastFetchedChecksum || undefined,
    status: newData.status || undefined,
    scheduledAt: newData.scheduledAt || undefined,
    failedAt: newData.failedAt,
    autoAddToLibrary: newData.autoAddToLibrary ?? undefined,
    isPrivate: newData.isPrivate ?? undefined,
    fetchContentType: newData.fetchContentType || undefined,
    folder: newData.folder ?? undefined,
  })

  return await repo.findOneByOrFail({
    id: subscriptionId,
    user: { id: userId },
  })
}

export const updateSubscriptions = async (
  subscriptionIds: string[],
  newData: UpdateSubscriptionData
) => {
  return getRepository(Subscription).save(
    subscriptionIds.map((id) => ({
      id,
      name: newData.name || undefined,
      description: newData.description || undefined,
      mostRecentItemDate: newData.mostRecentItemDate || undefined,
      refreshedAt: newData.refreshedAt || undefined,
      lastFetchedChecksum: newData.lastFetchedChecksum || undefined,
      status: newData.status || undefined,
      scheduledAt: newData.scheduledAt || undefined,
      failedAt: newData.failedAt || undefined,
      autoAddToLibrary: newData.autoAddToLibrary ?? undefined,
      isPrivate: newData.isPrivate ?? undefined,
      fetchContentType: newData.fetchContentType ?? undefined,
      folder: newData.folder ?? undefined,
    }))
  )
}
