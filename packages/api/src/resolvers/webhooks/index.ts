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
import { authTrx } from '../../repository'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/helpers'

export const webhooksResolver = authorized<WebhooksSuccess, WebhooksError>(
  async (_obj, _params, { uid, log }) => {
    try {
      const webhooks = await authTrx((t) =>
        t.getRepository(Webhook).findBy({
          user: { id: uid },
        })
      )

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
>(async (_, { id }, { authTrx, log }) => {
  try {
    const webhook = await authTrx((t) =>
      t.getRepository(Webhook).findOne({
        where: { id },
        relations: ['user'],
      })
    )

    if (!webhook) {
      return {
        errorCodes: [WebhookErrorCode.NotFound],
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
>(async (_, { id }, { authTrx, uid, log }) => {
  try {
    const deletedWebhook = await authTrx(async (t) => {
      const webhook = await t.getRepository(Webhook).findOne({
        where: { id },
        relations: ['user'],
      })

      if (!webhook) {
        throw new Error('Webhook not found')
      }

      return t.getRepository(Webhook).remove(webhook)
    })

    analytics.track({
      userId: uid,
      event: 'webhook_delete',
      properties: {
        webhookId: id,
        env: env.server.apiEnv,
      },
    })

    return {
      webhook: webhookDataToResponse(deletedWebhook),
    }
  } catch (error) {
    log.error('Error deleting webhook', error)
    return {
      errorCodes: [DeleteWebhookErrorCode.BadRequest],
    }
  }
})

export const setWebhookResolver = authorized<
  SetWebhookSuccess,
  SetWebhookError,
  MutationSetWebhookArgs
>(async (_, { input }, { authTrx, claims: { uid }, log }) => {
  log.info('setWebhookResolver')

  try {
    const webhookToSave: Partial<Webhook> = {
      url: input.url,
      eventTypes: input.eventTypes as string[],
      method: input.method || 'POST',
      contentType: input.contentType || 'application/json',
      enabled: input.enabled === null ? true : input.enabled,
    }

    if (input.id) {
      // Update
      const existingWebhook = await authTrx((t) =>
        t.getRepository(Webhook).findOne({
          where: { id: input.id || '' },
          relations: ['user'],
        })
      )
      if (!existingWebhook) {
        return {
          errorCodes: [SetWebhookErrorCode.NotFound],
        }
      }

      webhookToSave.id = input.id
    }
    const webhook = await authTrx((t) =>
      t.getRepository(Webhook).save({
        user: { id: uid },
        ...webhookToSave,
      })
    )

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
