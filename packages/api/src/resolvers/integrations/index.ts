import { authorized } from '../../utils/helpers'
import {
  MutationSetIntegrationArgs,
  SetIntegrationError,
  SetIntegrationErrorCode,
  SetIntegrationSuccess,
} from '../../generated/graphql'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { Integration } from '../../entity/integration'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { validateToken } from '../../services/integrations'

export const setIntegrationResolver = authorized<
  SetIntegrationSuccess,
  SetIntegrationError,
  MutationSetIntegrationArgs
>(async (_, { input }, { claims: { uid }, log }) => {
  log.info('setIntegrationResolver')

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [SetIntegrationErrorCode.Unauthorized],
      }
    }

    const integrationToSave: Partial<Integration> = {
      user,
      token: input.token,
      type: input.type,
      enabled: input.enabled === null ? true : input.enabled,
    }

    if (input.id) {
      // Update
      const existingIntegration = await getRepository(Integration).findOne({
        where: { id: input.id },
        relations: ['user'],
      })
      if (!existingIntegration) {
        return {
          errorCodes: [SetIntegrationErrorCode.NotFound],
        }
      }
      if (existingIntegration.user.id !== uid) {
        return {
          errorCodes: [SetIntegrationErrorCode.Unauthorized],
        }
      }

      integrationToSave.id = input.id
    } else {
      // Create
      const existingIntegration = await getRepository(Integration).findOneBy({
        user: { id: uid },
        type: input.type,
      })

      if (existingIntegration) {
        return {
          errorCodes: [SetIntegrationErrorCode.AlreadyExists],
        }
      }

      // validate token
      if (!(await validateToken(input.token, input.type))) {
        return {
          errorCodes: [SetIntegrationErrorCode.InvalidToken],
        }
      }
    }

    const integration = await getRepository(Integration).save(integrationToSave)

    analytics.track({
      userId: uid,
      event: 'integration_set',
      properties: {
        id: integration.id,
        env: env.server.apiEnv,
      },
    })

    return {
      integration,
    }
  } catch (error) {
    log.error(error)

    return {
      errorCodes: [SetIntegrationErrorCode.BadRequest],
    }
  }
})
