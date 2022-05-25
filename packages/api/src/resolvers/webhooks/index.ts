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

    const webhookToAdd = {
      url: input.url,
      eventTypes: input.eventTypes as string[],
      method: input.method || 'POST',
      contentType: input.contentType || 'application/json',
      enabled: input.enabled === null ? true : input.enabled,
    }

    let webhook: Webhook | null

    if (input.id) {
      // Update
      webhook = await getRepository(Webhook).findOneBy({ id: input.id })
      if (!webhook) {
        return {
          errorCodes: [SetWebhookErrorCode.NotFound],
        }
      }
      if (webhook.user.id !== uid) {
        return {
          errorCodes: [SetWebhookErrorCode.Unauthorized],
        }
      }
      await getRepository(Webhook).update(webhook.id, webhookToAdd)
    } else {
      // Create
      webhook = await getRepository(Webhook).save({
        user,
        ...webhookToAdd,
      })

      if (!webhook) {
        return {
          errorCodes: [SetWebhookErrorCode.AlreadyExists],
        }
      }
    }

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
