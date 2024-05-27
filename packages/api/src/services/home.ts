import { PublicItem } from '../entity/public_item'
import { HomeItem } from '../generated/graphql'
import { authTrx } from '../repository'
import { findLibraryItemsByIds } from './library_item'

export const batchGetHomeItems = async (
  ids: readonly string[]
): Promise<Array<HomeItem>> => {
  const libraryItems = await findLibraryItemsByIds(ids as string[])

  const publicItems = await authTrx(async (tx) =>
    tx
      .getRepository(PublicItem)
      .createQueryBuilder('public_item')
      .innerJoin(
        'public_item_stats',
        'stats',
        'stats.public_item_id = public_item.id'
      )
      .innerJoin(
        'public_item_source',
        'source',
        'source.id = public_item.source_id'
      )
      .where('public_item.id IN (:...ids)', { ids })
      .getMany()
  )

  return ids
    .map((id) => {
      const libraryItem = libraryItems.find((li) => li.id === id)
      if (libraryItem) {
        return {
          ...libraryItem,
          date: libraryItem.savedAt,
          url: libraryItem.originalUrl,
          canArchive: !libraryItem.archivedAt,
          canDelete: !libraryItem.deletedAt,
          canSave: false,
          dir: libraryItem.directionality,
        }
      } else {
        const publicItem = publicItems.find((pi) => pi.id === id)
        return publicItem
          ? {
              ...publicItem,
              date: publicItem.createdAt,
              url: publicItem.url,
              canArchive: false,
              canDelete: false,
              canSave: true,
              broadcastCount: publicItem.stats.broadcastCount,
              likeCount: publicItem.stats.likeCount,
              saveCount: publicItem.stats.saveCount,
              subscription: publicItem.source,
            }
          : undefined
      }
    })
    .filter((item) => item !== undefined) as Array<HomeItem>
}

export const findUnseenPublicItems = async (
  userId: string,
  options: {
    limit?: number
    offset?: number
  }
): Promise<Array<PublicItem>> => {
  return authTrx(
    async (tx) =>
      tx
        .getRepository(PublicItem)
        .createQueryBuilder('public_item')
        .leftJoin(
          'public_item_interactions',
          'interaction',
          'interaction.public_item_id = public_item.id'
        )
        .innerJoin(
          'public_item_stats',
          'stats',
          'stats.public_item_id = public_item.id'
        )
        .innerJoin(
          'public_item_source',
          'source',
          'source.id = public_item.source_id'
        )
        .where('interaction.user_id = :userId', { userId })
        .andWhere('interaction.seen_at IS NULL')
        .orderBy('public_item.createdAt', 'DESC')
        .take(options.limit)
        .skip(options.offset)
        .getMany(),
    undefined,
    userId
  )
}
