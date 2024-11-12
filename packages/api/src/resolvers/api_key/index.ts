import { ApiKey } from '../../entity/api_key'
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
import { getRepository } from '../../repository'
import { findApiKeys } from '../../services/api_key'
import { analytics } from '../../utils/analytics'
import {
  deleteCachedClaims,
  generateApiKey,
  hashApiKey,
} from '../../utils/auth'
import { authorized } from '../../utils/gql-utils'

export const apiKeysResolver = authorized<ApiKeysSuccess, ApiKeysError>(
  async (_, __, { log, uid }) => {
    try {
      const apiKeys = await findApiKeys(uid)

      return {
        apiKeys,
      }
    } catch (e) {
      log.error('apiKeysResolver error', e)

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
>(async (_, { input: { name, expiresAt } }, { log, uid }) => {
  try {
    const exp = new Date(expiresAt)
    const originalKey = generateApiKey()
    const apiKeyCreated = await getRepository(ApiKey).save({
      user: { id: uid },
      name,
      key: hashApiKey(originalKey),
      expiresAt: exp,
    })

    analytics.capture({
      distinctId: uid,
      event: 'api_key_generated',
      properties: {
        name,
        expiresAt: exp,
        env: env.server.apiEnv,
      },
    })

    return {
      apiKey: {
        ...apiKeyCreated,
        key: originalKey,
      },
    }
  } catch (error) {
    log.error('generateApiKeyResolver', error)

    return { errorCodes: [GenerateApiKeyErrorCode.BadRequest] }
  }
})

export const revokeApiKeyResolver = authorized<
  RevokeApiKeySuccess,
  RevokeApiKeyError,
  MutationRevokeApiKeyArgs
>(async (_, { id }, { claims: { uid }, log }) => {
  try {
    const apiRepo = getRepository(ApiKey)

    const apiKey = await apiRepo.findOneBy({ id, user: { id: uid } })
    if (!apiKey) {
      return {
        errorCodes: [RevokeApiKeyErrorCode.NotFound],
      }
    }

    const deletedApiKey = await apiRepo.remove(apiKey)

    await deleteCachedClaims(deletedApiKey.key)

    analytics.capture({
      distinctId: uid,
      event: 'api_key_revoked',
      properties: {
        id,
        env: env.server.apiEnv,
      },
    })

    return {
      apiKey: {
        ...deletedApiKey,
        id,
        key: null,
      },
    }
  } catch (e) {
    log.error('revokeApiKeyResolver error', e)

    return {
      errorCodes: [RevokeApiKeyErrorCode.BadRequest],
    }
  }
})
