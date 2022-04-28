import {
  GenerateApiKeyError,
  GenerateApiKeyErrorCode,
  GenerateApiKeySuccess,
  MutationGenerateApiKeyArgs,
} from '../../generated/graphql'
import { generateApiKey } from '../../utils/auth'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { authorized } from '../../utils/helpers'

export const generateApiKeyResolver = authorized<
  GenerateApiKeySuccess,
  GenerateApiKeyError,
  MutationGenerateApiKeyArgs
>((_, { input: { scope, expiredAt } }, { claims }) => {
  try {
    console.log('generateApiKeyResolver', scope, expiredAt)

    const exp = expiredAt ? new Date(expiredAt).getTime() / 1000 : null
    const apiKey = generateApiKey({
      iat: new Date().getTime(),
      scope: scope || 'all',
      uid: claims.uid,
      ...(exp && { exp }),
    })

    analytics.track({
      userId: claims.uid,
      event: 'generate_api_key',
      properties: {
        scope,
        expiredAt: exp,
        env: env.server.apiEnv,
      },
    })

    return { apiKey }
  } catch (error) {
    console.error(error)
    return { errorCodes: [GenerateApiKeyErrorCode.BadRequest] }
  }
})
