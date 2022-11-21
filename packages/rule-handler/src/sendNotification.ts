import { applicationDefault, initializeApp } from 'firebase-admin/app'
import {
  BatchResponse,
  getMessaging,
  Message,
  MulticastMessage,
} from 'firebase-admin/messaging'
import axios from 'axios'
import { getAuthToken } from './index'

export interface UserDeviceToken {
  id: string
  token: string
  userId: string
  createdAt: Date
}

// getting credentials from App Engine
initializeApp({
  credential: applicationDefault(),
})

export const getUserDeviceTokens = async (
  userId: string,
  apiEndpoint: string,
  jwtSecret: string
): Promise<UserDeviceToken[]> => {
  const auth = await getAuthToken(userId, jwtSecret)

  const data = JSON.stringify({
    query: `query {
      userDeviceTokens(userId: "${userId}") {
        ... on UserDeviceTokensError {
          errorCodes
        }
        ... on UserDeviceTokensSuccess {
          userDeviceTokens {
            id
            token
            userId
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
  return response.data.data.userDeviceTokens
    .userDeviceTokens as UserDeviceToken[]
}

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
