import { authorized } from '../../utils/helpers'
import {
  MutationSetWebhookArgs,
  SetWebhookError,
  SetWebhookErrorCode,
  SetWebhookSuccess,
  WebhookEvent,
} from '../../generated/graphql'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { Webhook } from '../../entity/webhook'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'

export const setWebhookResolver = authorized<
  SetWebhookSuccess,
  SetWebhookError,
  MutationSetWebhookArgs
>(async (_, { input }, { claims: { uid }, log }) => {
  log.info('setWebhookResolver')

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [SetWebhookErrorCode.Unauthorized],
      }
    }

    const webhookToSave: Partial<Webhook> = {
      url: input.url,
      eventTypes: input.eventTypes as string[],
      method: input.method || 'POST',
      contentType: input.contentType || 'application/json',
      enabled: input.enabled === null ? true : input.enabled,
    }

    if (input.id) {
      // Update
      const existingWebhook = await getRepository(Webhook).findOne({
        where: { id: input.id },
        relations: ['user'],
      })
      if (!existingWebhook) {
        return {
          errorCodes: [SetWebhookErrorCode.NotFound],
        }
      }
      if (existingWebhook.user.id !== uid) {
        return {
          errorCodes: [SetWebhookErrorCode.Unauthorized],
        }
      }

      webhookToSave.id = input.id
    } else {
      // Create
      const existingWebhook = await getRepository(Webhook).findOneBy({
        user: { id: uid },
        eventTypes: `{${input.eventTypes.join(',')}}`,
      })

      if (existingWebhook) {
        return {
          errorCodes: [SetWebhookErrorCode.AlreadyExists],
        }
      }
    }

    const webhook = await getRepository(Webhook).save({
      user,
      ...webhookToSave,
    })

    analytics.track({
      userId: uid,
      event: 'webhook_set',
      properties: {
        webhookId: webhook.id,
        env: env.server.apiEnv,
      },
    })

    return {
      webhook: {
        ...webhook,
        eventTypes: webhook.eventTypes as WebhookEvent[],
      },
    }
  } catch (error) {
    log.error(error)

    return {
      errorCodes: [SetWebhookErrorCode.BadRequest],
    }
  }
})
