import { IsNull } from 'typeorm'
import { PublicItem } from '../entity/public_item'
import { getRepository } from '../repository'

export const findUnseenPublicItems = async (
  userId: string,
  options: {
    limit?: number
    offset?: number
  }
) =>
  getRepository(PublicItem).find({
    where: {
      interaction: IsNull(),
      interaction: {
        user: {
          id: userId,
        },
        seenAt: IsNull(),
      },
      approved: true,
    },
    order: {
      createdAt: 'DESC',
    },
    take: options.limit,
    skip: options.offset,
  })
