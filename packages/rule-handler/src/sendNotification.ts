import { applicationDefault, initializeApp } from 'firebase-admin/app'
import {
  BatchResponse,
  getMessaging,
  Message,
  MulticastMessage,
} from 'firebase-admin/messaging'

// getting credentials from App Engine
initializeApp({
  credential: applicationDefault(),
})

export const getBatchMessages = (
  messages: string[],
  tokens: string[]
): Message[] => {
  const batchMessages: Message[] = []
  messages.forEach((message) => {
    tokens.forEach((token) => {
      batchMessages.push({
        token,
        notification: {
          body: message,
        },
      })
    })
  })

  return batchMessages
}

export const sendPushNotification = async (
  message: Message
): Promise<string | undefined> => {
  return getMessaging().send(message)
}

export const sendMulticastPushNotifications = async (
  message: MulticastMessage
): Promise<BatchResponse | undefined> => {
  return getMessaging().sendMulticast(message)
}

export const sendBatchPushNotifications = async (
  messages: Message[]
): Promise<BatchResponse | undefined> => {
  const res = await getMessaging().sendAll(messages)
  console.debug('res', res)

  return res
}
