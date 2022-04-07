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
>((_, { scope }, { claims }) => {
  try {
    console.log('generateApiKeyResolver', scope)

    analytics.track({
      userId: claims.uid,
      event: 'generate_api_key',
      properties: {
        scope,
        env: env.server.apiEnv,
      },
    })

    const apiKey = generateApiKey({
      iat: new Date().getTime(),
      scope: scope || 'all',
      uid: claims.uid,
    })

    return { apiKey }
  } catch (error) {
    console.error(error)
    return { errorCodes: [GenerateApiKeyErrorCode.BadRequest] }
  }
})
