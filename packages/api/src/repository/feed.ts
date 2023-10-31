import { ILike } from 'typeorm'
import { appDataSource } from '../data_source'
import { Feed } from '../entity/feed'

export const feedRepository = appDataSource.getRepository(Feed).extend({
  async searchFeeds(
    query = '',
    take = 10,
    skip = 0,
    orderBy = 'title',
    order = 'ASC'
  ) {
    const where = []
    if (query !== '') {
      query = `%${query}%`
      where.push({ title: ILike(query) }, { url: ILike(query) })
    }

    const feeds = await this.find({
      where,
      order: { [orderBy]: order },
      take,
      skip,
    })

    const count = await this.countBy(where)

    return {
      feeds,
      count,
    }
  },
})
