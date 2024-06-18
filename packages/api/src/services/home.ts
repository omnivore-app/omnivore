import { PublicItem } from '../entity/public_item'
import { authTrx } from '../repository'

export const batchGetPublicItems = async (
  ids: readonly string[]
): Promise<Array<PublicItem | undefined>> => {
  const publicItems = await authTrx(async (tx) =>
    tx
      .getRepository(PublicItem)
      .createQueryBuilder('public_item')
      .where('public_item.id IN (:...ids)', { ids })
      .getMany()
  )

  return ids.map((id) => publicItems.find((pi) => pi.id === id))
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
    {
      uid: userId,
    }
  )
}
