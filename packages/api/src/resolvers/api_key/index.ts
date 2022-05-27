import {
  GenerateApiKeyError,
  GenerateApiKeyErrorCode,
  GenerateApiKeySuccess,
  MutationGenerateApiKeyArgs,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { authorized } from '../../utils/helpers'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { ApiKey } from '../../entity/api_key'
import { generateApiKey, hashApiKey } from '../../utils/auth'

export const generateApiKeyResolver = authorized<
  GenerateApiKeySuccess,
  GenerateApiKeyError,
  MutationGenerateApiKeyArgs
>(async (_, { input: { name, expiresAt } }, { claims: { uid }, log }) => {
  try {
    log.info('generateApiKeyResolver')
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [GenerateApiKeyErrorCode.Unauthorized],
      }
    }

    const existingApiKey = await getRepository(ApiKey).findOneBy({
      user: { id: uid },
      name,
    })
    if (existingApiKey) {
      return {
        errorCodes: [GenerateApiKeyErrorCode.AlreadyExists],
      }
    }

    const exp = new Date(expiresAt)
    const apiKey = generateApiKey()
    await getRepository(ApiKey).save({
      user: { id: uid },
      name,
      key: hashApiKey(apiKey),
      expiresAt: exp,
    })

    analytics.track({
      userId: uid,
      event: 'api_key_generated',
      properties: {
        name,
        expiresAt: exp,
        env: env.server.apiEnv,
      },
    })

    return { apiKey }
  } catch (error) {
    console.error(error)

    return { errorCodes: [GenerateApiKeyErrorCode.BadRequest] }
  }
})
