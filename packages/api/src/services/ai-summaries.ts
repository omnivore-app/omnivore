import { AISummary } from '../entity/AISummary'
import { User } from '../entity/user'
import { authTrx } from '../repository'

export const getAISummary = async (data: {
  userId: string
  idx: string
  libraryItemId: string
}): Promise<AISummary | undefined> => {
  const aiSummary = await authTrx(
    async (t) => {
      const repo = t.getRepository(AISummary)
      if (data.idx == 'latest') {
        return repo.findOne({
          where: {
            user: { id: data.userId },
            libraryItem: { id: data.libraryItemId },
          },
          order: { createdAt: 'DESC' },
        })
      } else {
        return repo.findOne({
          where: {
            id: data.idx,
            user: { id: data.userId },
            libraryItem: { id: data.libraryItemId },
          },
        })
      }
    },
    undefined,
    data.userId
  )
  return aiSummary ?? undefined
}

// Gets an ordered list of the most recent summaries with
// the provided offset and limit
export const getRecentAISummaries = async (data: {
  user: User
  offset: number
  count: number
}): Promise<AISummary[]> => {
  const summaries = await authTrx(
    async (t) => {
      return await t
        .getRepository(AISummary)
        .createQueryBuilder()
        .select('ais.user_id', 'user_id')
        .addSelect('ais.summary', 'summary')
        .addSelect('ais.library_item_id', 'library_item_id')
        .addSelect('ais.title', 'title')
        .addSelect('ais.slug', 'slug')
        .from((subQuery) => {
          return subQuery
            .select('t.user_id', 'user_id')
            .addSelect('t.library_item_id', 'library_item_id')
            .addSelect('t.title', 'title')
            .addSelect('t.slug', 'slug')
            .addSelect('t.summary', 'summary')
            .addSelect('t.created_at', 'created_at')
            .addSelect(
              'ROW_NUMBER() OVER (PARTITION BY t.library_item_id ORDER BY t.created_at DESC)',
              'row_num'
            )
            .from('omnivore.ai_summaries', 't')
            .where('t.user_id = :userId', { userId: data.user.id })
        }, 'ais')
        .skip(data.offset)
        .take(data.count)
        .getRawMany()
    },
    undefined,
    data.user.id
  )
  return summaries ?? undefined
}
