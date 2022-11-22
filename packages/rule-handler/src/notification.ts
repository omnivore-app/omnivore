import { applicationDefault, initializeApp } from 'firebase-admin/app'
import {
  BatchResponse,
  getMessaging,
  Message,
  MulticastMessage,
} from 'firebase-admin/messaging'
import axios from 'axios'
import { getAuthToken } from './index'

export interface DeviceToken {
  id: string
  token: string
  userId: string
  createdAt: Date
}

// getting credentials from App Engine
initializeApp({
  credential: applicationDefault(),
})

export const getDeviceTokens = async (
  userId: string,
  apiEndpoint: string,
  jwtSecret: string
): Promise<DeviceToken[]> => {
  const auth = await getAuthToken(userId, jwtSecret)

  const data = JSON.stringify({
    query: `query {
      deviceTokens {
        ... on DeviceTokensError {
          errorCodes
        }
        ... on DeviceTokensSuccess {
          deviceTokens {
            id
            token
            createdAt
          }
        }
      }
    }`,
  })

  const response = await axios.post(`${apiEndpoint}/graphql`, data, {
    headers: {
      Cookie: `auth=${auth};`,
      'Content-Type': 'application/json',
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return response.data.data.deviceTokens.deviceTokens as DeviceToken[]
}

export const getBatchMessages = (
  messages: string[],
  tokens: string[],
  title?: string,
  imageUrl?: string
): Message[] => {
  const batchMessages: Message[] = []
  messages.forEach((message) => {
    tokens.forEach((token) => {
      batchMessages.push({
        token,
        notification: {
          title,
          body: message,
          imageUrl,
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
  return getMessaging().sendAll(messages)
}
