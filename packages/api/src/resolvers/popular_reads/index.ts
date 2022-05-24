import {
  MutationAddPopularReadArgs,
  AddPopularReadError,
  AddPopularReadErrorCode,
  AddPopularReadSuccess,
} from '../../generated/graphql'

import { authorized, userDataToUser } from '../../utils/helpers'
import { analytics } from '../../utils/analytics'
import { addPopularRead } from '../../services/popular_reads'
import { env } from '../../env'

export const addPopularReadResolver = authorized<
  AddPopularReadSuccess,
  AddPopularReadError,
  MutationAddPopularReadArgs
>(async (_, { name }, ctx) => {
  const {
    models,
    claims: { uid },
  } = ctx
  analytics.track({
    userId: uid,
    event: 'popular_read_added',
    properties: {
      name: name,
      env: env.server.apiEnv,
    },
  })

  const user = userDataToUser(await models.user.get(uid))
  if (!user) {
    return { errorCodes: [AddPopularReadErrorCode.Unauthorized] }
  }

  const pageId = await addPopularRead(uid, name)
  if (!pageId) {
    return { errorCodes: [AddPopularReadErrorCode.NotFound] }
  }

  return {
    pageId,
  }
})
