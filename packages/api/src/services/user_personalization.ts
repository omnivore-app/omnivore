import { DeepPartial, IsNull } from 'typeorm'
import { Shortcut, UserPersonalization } from '../entity/user_personalization'
import { authTrx } from '../repository'
import { findLabelsByUserId } from './labels'
import { findSubscriptionById } from './subscriptions'
import { Filter } from '../entity/filter'
import { Subscription, SubscriptionStatus } from '../entity/subscription'

export const findUserPersonalization = async (userId: string) => {
  return authTrx(
    (t) =>
      t.getRepository(UserPersonalization).findOneBy({
        user: { id: userId },
      }),
    undefined,
    userId
  )
}

export const deleteUserPersonalization = async (userId: string) => {
  return authTrx(
    (t) =>
      t.getRepository(UserPersonalization).delete({
        user: { id: userId },
      }),
    undefined,
    userId
  )
}

export const saveUserPersonalization = async (
  userId: string,
  userPersonalization: DeepPartial<UserPersonalization>
) => {
  return authTrx(
    (t) => t.getRepository(UserPersonalization).save(userPersonalization),
    undefined,
    userId
  )
}

export const getShortcuts = async (userId: string): Promise<Shortcut[]> => {
  const personalization = await authTrx(
    (t) =>
      t.getRepository(UserPersonalization).findOneBy({
        user: { id: userId },
      }),
    undefined,
    userId
  )
  if (personalization?.shortcuts) {
    return personalization?.shortcuts as Shortcut[]
  }

  return await userDefaultShortcuts(userId)
}

export const resetShortcuts = async (userId: string): Promise<boolean> => {
  const result = await authTrx(
    (t) => {
      return t
        .createQueryBuilder()
        .update(UserPersonalization)
        .set({ shortcuts: () => 'null' }) // Use a raw SQL string to set the value to null
        .where({
          user: { id: userId },
        })
        .execute()
    },
    undefined,
    userId
  )
  if (!result) {
    throw Error('Could not update shortcuts')
  }
  return true
}

export const setShortcuts = async (
  userId: string,
  shortcuts: Shortcut[]
): Promise<Shortcut[]> => {
  const result = await authTrx(
    (t) =>
      t.getRepository(UserPersonalization).update(
        {
          user: { id: userId },
        },
        {
          shortcuts: shortcuts,
        }
      ),
    undefined,
    userId
  )
  if (!result.affected || result.affected < 1) {
    throw Error('Could not update shortcuts')
  }
  return shortcuts
}

const userDefaultShortcuts = async (userId: string): Promise<Shortcut[]> => {
  const labels = await findLabelsByUserId(userId)
  const savedSearches = await authTrx((t) =>
    t.getRepository(Filter).find({
      where: { user: { id: userId } },
      order: { position: 'ASC' },
    })
  )
  const subscriptions = await authTrx((t) =>
    t.getRepository(Subscription).find({
      where: { user: { id: userId }, status: SubscriptionStatus.Active },
      order: { mostRecentItemDate: 'DESC' },
    })
  )

  return [
    {
      id: '1',
      type: 'folder',
      name: 'Labels',
      section: 'library',
      children: labels.map((label) => {
        return {
          id: label.id,
          type: 'label',
          name: label.name,
          section: 'library',
          label: label,
          filter: `in:all label:"${label.name}"`,
        }
      }),
    },
    {
      id: '2',
      type: 'folder',
      name: 'Subscriptions',
      section: 'subscriptions',
      children: subscriptions.map((subscription) => {
        return {
          id: subscription.id,
          type: subscription.type == 'NEWSLETTER' ? 'newsletter' : 'feed',
          name: subscription.name,
          section: 'subscriptions',
          icon: subscription.icon ?? undefined,
          filter:
            subscription.type == 'NEWSLETTER'
              ? `in:following subscription:"${subscription.name}"`
              : `in:following rss:"${subscription.url ?? ''}"`,
        }
      }),
    },
    {
      id: '3',
      type: 'folder',
      name: 'Saved Searches',
      section: 'library',
      children: savedSearches.map((search) => {
        return {
          id: search.id,
          type: 'search',
          name: search.name,
          section: 'library',
          filter: search.filter,
        }
      }),
    },
  ]
}
