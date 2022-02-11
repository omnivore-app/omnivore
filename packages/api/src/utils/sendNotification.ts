import { initializeApp } from 'firebase-admin/app'
import {
  BatchResponse,
  getMessaging,
  Message,
  MulticastMessage,
} from 'firebase-admin/messaging'
import { env } from '../env'
import { analytics } from './analytics'

type PushNotificationType = 'newsletter' | 'reminder'

// getting credentials from App Engine
initializeApp()

export const sendPushNotification = async (
  userId: string,
  message: Message,
  type: PushNotificationType
): Promise<string | undefined> => {
  try {
    analytics.track({
      userId,
      event: 'notification_sent',
      properties: {
        type,
        multicast: false,
        env: env.server.apiEnv,
      },
    })

    const res = await getMessaging().send(message)
    console.log(res)

    return res
  } catch (err) {
    console.log('firebase cloud message error: ', err)

    return undefined
  }
}

export const sendMulticastPushNotifications = async (
  userId: string,
  message: MulticastMessage,
  type: PushNotificationType
): Promise<BatchResponse | undefined> => {
  try {
    analytics.track({
      userId,
      event: 'notification_sent',
      properties: {
        type,
        multicast: true,
        env: env.server.apiEnv,
      },
    })

    console.log('sending multicast message: ', JSON.stringify(message))
    const res = await getMessaging().sendMulticast(message)
    console.log('send notification result: ', JSON.stringify(res.responses))

    return res
  } catch (err) {
    console.log('firebase cloud message error: ', err)

    return undefined
  }
}

export const sendBatchPushNotifications = async (
  messages: Message[]
): Promise<BatchResponse | undefined> => {
  try {
    const res = await getMessaging().sendAll(messages)
    console.log('success count: ', res.successCount)

    return res
  } catch (err) {
    console.log('firebase cloud message error: ', err)

    return undefined
  }
}
