import { entityManager } from '.'
import { ApiKey } from '../entity/api_key'

export const apiKeyRepository = entityManager.getRepository(ApiKey)
