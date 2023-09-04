import {
  RecentSearchesError,
  RecentSearchesSuccess,
} from '../../generated/graphql'
import { getRecentSearches } from '../../services/search_history'
import { authorized } from '../../utils/helpers'

export const recentSearchesResolver = authorized<
  RecentSearchesSuccess,
  RecentSearchesError
>(async (_obj, _params) => {
  const searches = await getRecentSearches()
  return {
    searches,
  }
})
