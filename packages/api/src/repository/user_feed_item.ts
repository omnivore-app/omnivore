import { Between, FindOptionsWhere } from 'typeorm'
import { appDataSource } from '../data_source'
import { UserFeedItem } from '../entity/user_feed_item'

export const userFeedItemRepository = appDataSource
  .getRepository(UserFeedItem)
  .extend({
    async searchUserFeedItems(
      take = 10,
      skip = 0,
      since = new Date(0),
      until = new Date()
    ) {
      const where: FindOptionsWhere<UserFeedItem> = {
        updatedAt: Between(since, until),
      }

      const userFeedItems = await this.find({
        where,
        order: { updatedAt: 'DESC' },
        take,
        skip,
        relations: {
          user: true,
          feedItem: true,
        },
      })

      const count = await this.countBy(where)

      return {
        userFeedItems,
        count,
      }
    },
  })
