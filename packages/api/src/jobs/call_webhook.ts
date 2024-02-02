import axios, { Method } from 'axios'
import { findWebhooksByEventType } from '../services/webhook'
import { logger } from '../utils/logger'

export interface CallWebhookJobData {
  data: unknown
  userId: string
  type: string
  action: string
}

export const CALL_WEBHOOK_JOB_NAME = 'call-webhook'
const TIMEOUT = 5000 // 5s

export const callWebhook = async (jobData: CallWebhookJobData) => {
  const { data, type, action, userId } = jobData
  const eventType = `${type}_${action}`.toUpperCase()
  const webhooks = await findWebhooksByEventType(userId, eventType)

  if (webhooks.length <= 0) {
    return
  }

  await Promise.all(
    webhooks.map((webhook) => {
      const url = webhook.url
      const method = webhook.method as Method
      const body = {
        action,
        userId,
        [type]: data,
      }

      logger.info('triggering webhook', { url, method })

      return axios
        .request({
          url,
          method,
          headers: {
            'Content-Type': webhook.contentType,
          },
          data: body,
          timeout: TIMEOUT,
        })
        .then(() => logger.info('webhook triggered'))
        .catch((error) => {
          if (axios.isAxiosError(error)) {
            logger.info('webhook failed', error.response)
          } else {
            logger.info('webhook failed', error)
          }
        })
    })
  )
}
