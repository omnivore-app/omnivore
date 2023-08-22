import { getRepository } from '../entity'
import { SearchHistory } from '../entity/search_history'

export const getRecentSearches = async (
  userId: string
): Promise<SearchHistory[]> => {
  // get top 10 recent searches
  return getRepository(SearchHistory).find({
    where: { user: { id: userId } },
    order: { createdAt: 'DESC' },
    take: 10,
  })
}

export const saveSearchHistory = async (
  userId: string,
  term: string
): Promise<void> => {
  await getRepository(SearchHistory).upsert(
    {
      user: { id: userId },
      term,
      createdAt: new Date(),
    },
    {
      conflictPaths: ['user', 'term'],
    }
  )
}

export const deleteSearchHistory = async (userId: string): Promise<void> => {
  await getRepository(SearchHistory).delete({ user: { id: userId } })
}

export const deleteSearchHistoryById = async (
  userId: string,
  searchHistoryId: string
): Promise<void> => {
  await getRepository(SearchHistory).delete({
    user: { id: userId },
    id: searchHistoryId,
  })
}
