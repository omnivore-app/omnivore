import { PublicItem } from '../entity/public_item'
import { getRepository } from '../repository'

export const findUnseenPublicItems = async (
  userId: string,
  options: {
    limit?: number
    offset?: number
  }
): Promise<Array<PublicItem>> =>
  getRepository(PublicItem)
    .createQueryBuilder('public_item')
    .leftJoin(
      'omnivore.public_item_interactions',
      'interaction',
      'interaction.public_item_id = public_item.id'
    )
    .where('interaction.user_id = :userId', { userId })
    .andWhere('interaction.seen_at IS NULL')
    .orderBy('public_item.created_at', 'DESC')
    .limit(options.limit)
    .offset(options.offset)
    .getMany()
