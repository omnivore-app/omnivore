import { authorized } from '../../utils/helpers'
import {
  RecentSearchesError,
  RecentSearchesErrorCode,
  RecentSearchesSuccess,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { getRecentSearches } from '../../services/search_history'

export const recentSearchesResolver = authorized<
  RecentSearchesSuccess,
  RecentSearchesError
>(async (_obj, _params, { claims: { uid }, log }) => {
  log.info('recentSearches')

  analytics.track({
    userId: uid,
    event: 'recentSearches',
    properties: {
      env: env.server.apiEnv,
    },
  })

  const user = await getRepository(User).findOneBy({ id: uid })
  if (!user) {
    return { errorCodes: [RecentSearchesErrorCode.Unauthorized] }
  }

  const searches = await getRecentSearches(uid)
  return {
    searches,
  }
})
