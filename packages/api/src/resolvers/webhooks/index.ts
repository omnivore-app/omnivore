import { getRepository } from '../../entity'
import { User } from '../../entity/user'
import { Webhook } from '../../entity/webhook'
import { env } from '../../env'
import {
  DeleteWebhookError,
  DeleteWebhookErrorCode,
  DeleteWebhookSuccess,
  MutationDeleteWebhookArgs,
  MutationSetWebhookArgs,
  QueryWebhookArgs,
  SetWebhookError,
  SetWebhookErrorCode,
  SetWebhookSuccess,
  Webhook as WebhookResponse,
  WebhookError,
  WebhookErrorCode,
  WebhookEvent,
  WebhooksError,
  WebhooksErrorCode,
  WebhooksSuccess,
  WebhookSuccess,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/helpers'

export const webhooksResolver = authorized<WebhooksSuccess, WebhooksError>(
  async (_obj, _params, { claims: { uid }, log }) => {
    log.info('webhooksResolver')

    try {
      const user = await getRepository(User).findOneBy({ id: uid })
      if (!user) {
        return {
          errorCodes: [WebhooksErrorCode.Unauthorized],
        }
      }

      const webhooks = await getRepository(Webhook).findBy({
        user: { id: uid },
      })

      return {
        webhooks: webhooks.map((webhook) => webhookDataToResponse(webhook)),
      }
    } catch (error) {
      log.error(error)

      return {
        errorCodes: [WebhooksErrorCode.BadRequest],
      }
    }
  }
)

export const webhookResolver = authorized<
  WebhookSuccess,
  WebhookError,
  QueryWebhookArgs
>(async (_, { id }, { claims: { uid }, log }) => {
  log.info('webhookResolver')

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [WebhookErrorCode.Unauthorized],
      }
    }

    const webhook = await getRepository(Webhook).findOne({
      where: { id },
      relations: ['user'],
    })

    if (!webhook) {
      return {
        errorCodes: [WebhookErrorCode.NotFound],
      }
    }

    if (webhook.user.id !== uid) {
      return {
        errorCodes: [WebhookErrorCode.Unauthorized],
      }
    }

    return {
      webhook: webhookDataToResponse(webhook),
    }
  } catch (error) {
    log.error(error)

    return {
      errorCodes: [WebhookErrorCode.BadRequest],
    }
  }
})

export const deleteWebhookResolver = authorized<
  DeleteWebhookSuccess,
  DeleteWebhookError,
  MutationDeleteWebhookArgs
>(async (_, { id }, { claims: { uid }, log }) => {
  log.info('deleteWebhookResolver')

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [DeleteWebhookErrorCode.Unauthorized],
      }
    }

    const webhook = await getRepository(Webhook).findOne({
      where: { id },
      relations: ['user'],
    })

    if (!webhook) {
      return {
        errorCodes: [DeleteWebhookErrorCode.NotFound],
      }
    }

    if (webhook.user.id !== uid) {
      return {
        errorCodes: [DeleteWebhookErrorCode.Unauthorized],
      }
    }

    const deletedWebhook = await getRepository(Webhook).remove(webhook)
    deletedWebhook.id = id

    analytics.track({
      userId: uid,
      event: 'webhook_delete',
      properties: {
        webhookId: webhook.id,
        env: env.server.apiEnv,
      },
    })

    return {
      webhook: webhookDataToResponse(deletedWebhook),
    }
  } catch (error) {
    log.error(error)

    return {
      errorCodes: [DeleteWebhookErrorCode.BadRequest],
    }
  }
})

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
      webhook: webhookDataToResponse(webhook),
    }
  } catch (error) {
    log.error(error)

    return {
      errorCodes: [SetWebhookErrorCode.BadRequest],
    }
  }
})

const webhookDataToResponse = (webhook: Webhook): WebhookResponse => ({
  ...webhook,
  eventTypes: webhook.eventTypes as WebhookEvent[],
})
