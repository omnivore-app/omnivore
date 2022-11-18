import { initializeApp } from 'firebase-admin/app'
import {
  BatchResponse,
  getMessaging,
  Message,
  MulticastMessage,
} from 'firebase-admin/messaging'

// getting credentials from App Engine
initializeApp()

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
  console.debug('success count: ', res.successCount)

  return res
}
