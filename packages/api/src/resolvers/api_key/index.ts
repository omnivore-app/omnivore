import {
  ApiKeysError,
  ApiKeysErrorCode,
  ApiKeysSuccess,
  DeleteApiKeyError,
  DeleteApiKeyErrorCode,
  DeleteApiKeySuccess,
  GenerateApiKeyError,
  GenerateApiKeyErrorCode,
  GenerateApiKeySuccess,
  MutationDeleteApiKeyArgs,
  MutationGenerateApiKeyArgs,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { authorized } from '../../utils/helpers'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { ApiKey } from '../../entity/api_key'
import { generateApiKey, hashApiKey } from '../../utils/auth'

export const apiKeysResolver = authorized<ApiKeysSuccess, ApiKeysError>(
  async (_, __, { claims: { uid }, log }) => {
    log.info('apiKeysResolver')

    try {
      const user = await getRepository(User).findOneBy({ id: uid })
      if (!user) {
        return {
          errorCodes: [ApiKeysErrorCode.Unauthorized],
        }
      }

      const apiKeys = await getRepository(ApiKey).find({
        where: { user: { id: uid } },
        order: { usedAt: 'DESC', createdAt: 'DESC' },
      })

      return {
        apiKeys,
      }
    } catch (e) {
      log.error(e)

      return {
        errorCodes: [ApiKeysErrorCode.BadRequest],
      }
    }
  }
)

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

export const deleteApiKeyResolver = authorized<
  DeleteApiKeySuccess,
  DeleteApiKeyError,
  MutationDeleteApiKeyArgs
>(async (_, { id }, { claims: { uid }, log }) => {
  log.info('deleteApiKeyResolver')

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [DeleteApiKeyErrorCode.Unauthorized],
      }
    }

    const apiKey = await getRepository(ApiKey).findOne({
      where: { id },
      relations: ['user'],
    })
    if (!apiKey) {
      return {
        errorCodes: [DeleteApiKeyErrorCode.NotFound],
      }
    }

    if (apiKey.user.id !== uid) {
      return {
        errorCodes: [DeleteApiKeyErrorCode.Unauthorized],
      }
    }

    const deletedApiKey = await getRepository(ApiKey).remove(apiKey)
    deletedApiKey.id = id

    return {
      apiKey: deletedApiKey,
    }
  } catch (e) {
    log.error(e)

    return {
      errorCodes: [DeleteApiKeyErrorCode.BadRequest],
    }
  }
})
