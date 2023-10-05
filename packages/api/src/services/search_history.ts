import { SearchHistory } from '../entity/search_history'
import { authTrx } from '../repository'

export const getRecentSearches = async (): Promise<SearchHistory[]> => {
  // get top 10 recent searches
  return authTrx((t) =>
    t.getRepository(SearchHistory).find({
      order: { createdAt: 'DESC' },
      take: 10,
    })
  )
}

export const saveSearchHistory = async (
  userId: string,
  term: string
): Promise<void> => {
  await authTrx((t) =>
    t.getRepository(SearchHistory).upsert(
      {
        user: { id: userId },
        term,
        createdAt: new Date(),
      },
      {
        conflictPaths: ['user', 'term'],
      }
    )
  )
}

export const deleteSearchHistory = async (userId: string): Promise<void> => {
  await authTrx((t) =>
    t.getRepository(SearchHistory).delete({ user: { id: userId } })
  )
}

export const deleteSearchHistoryById = async (
  searchHistoryId: string
): Promise<void> => {
  await authTrx((t) =>
    t.getRepository(SearchHistory).delete({
      id: searchHistoryId,
    })
  )
}
