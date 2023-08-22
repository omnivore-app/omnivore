import { getRepository } from '../../entity'
import { ApiKey } from '../../entity/api_key'
import { User } from '../../entity/user'
import { env } from '../../env'
import {
  ApiKeysError,
  ApiKeysErrorCode,
  ApiKeysSuccess,
  GenerateApiKeyError,
  GenerateApiKeyErrorCode,
  GenerateApiKeySuccess,
  MutationGenerateApiKeyArgs,
  MutationRevokeApiKeyArgs,
  RevokeApiKeyError,
  RevokeApiKeyErrorCode,
  RevokeApiKeySuccess,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { generateApiKey, hashApiKey } from '../../utils/auth'
import { authorized } from '../../utils/helpers'

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
        select: ['id', 'name', 'scopes', 'expiresAt', 'createdAt', 'usedAt'],
        where: { user: { id: uid } },
        order: {
          usedAt: { direction: 'DESC', nulls: 'last' },
          createdAt: 'DESC',
        },
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
    const apiKeyData = await getRepository(ApiKey).save({
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

    return {
      apiKey: {
        ...apiKeyData,
        key: apiKey,
      },
    }
  } catch (error) {
    log.error(error)

    return { errorCodes: [GenerateApiKeyErrorCode.BadRequest] }
  }
})

export const revokeApiKeyResolver = authorized<
  RevokeApiKeySuccess,
  RevokeApiKeyError,
  MutationRevokeApiKeyArgs
>(async (_, { id }, { claims: { uid }, log }) => {
  log.info('RevokeApiKeyResolver')

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [RevokeApiKeyErrorCode.Unauthorized],
      }
    }

    const apiKey = await getRepository(ApiKey).findOne({
      where: { id },
      relations: ['user'],
    })
    if (!apiKey) {
      return {
        errorCodes: [RevokeApiKeyErrorCode.NotFound],
      }
    }

    if (apiKey.user.id !== uid) {
      return {
        errorCodes: [RevokeApiKeyErrorCode.Unauthorized],
      }
    }

    const deletedApiKey = await getRepository(ApiKey).remove(apiKey)

    return {
      apiKey: {
        ...deletedApiKey,
        id,
        key: null,
      },
    }
  } catch (e) {
    log.error(e)

    return {
      errorCodes: [RevokeApiKeyErrorCode.BadRequest],
    }
  }
})
