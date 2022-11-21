import {
  getBatchMessages,
  getDeviceTokens,
  sendBatchPushNotifications,
} from './sendNotification'
import { getAuthToken, PubSubData } from './index'
import axios from 'axios'

export enum RuleActionType {
  AddLabel = 'ADD_LABEL',
  Archive = 'ARCHIVE',
  MarkAsRead = 'MARK_AS_READ',
  SendNotification = 'SEND_NOTIFICATION',
}

export interface RuleAction {
  type: RuleActionType
  params: string[]
}

export interface Rule {
  id: string
  userId: string
  name: string
  filter: string
  actions: RuleAction[]
  description?: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export const getEnabledRules = async (
  userId: string,
  apiEndpoint: string,
  jwtSecret: string
): Promise<Rule[]> => {
  const auth = await getAuthToken(userId, jwtSecret)

  const data = JSON.stringify({
    query: `query {
      rules(enabled: true) {
        ... on RulesError {
          errorCodes
        }
        ... on RulesSuccess {
          rules {
            id
            name
            filter
            actions {
              type
              params
            }
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
  return response.data.data.rules.rules as Rule[]
}

export const triggerActions = async (
  userId: string,
  rules: Rule[],
  data: PubSubData,
  apiEndpoint: string,
  jwtSecret: string
) => {
  for (const rule of rules) {
    // TODO: filter out rules that don't match the trigger
    if (!data.subscription) {
      console.debug('no subscription')
      continue
    }

    for (const action of rule.actions) {
      switch (action.type) {
        case RuleActionType.AddLabel:
        case RuleActionType.Archive:
        case RuleActionType.MarkAsRead:
          continue
        case RuleActionType.SendNotification:
          if (action.params.length === 0) {
            console.log('No notification messages provided')
            continue
          }
          await sendNotification(userId, action.params, apiEndpoint, jwtSecret)
      }
    }
  }
}

export const sendNotification = async (
  userId: string,
  messages: string[],
  apiEndpoint: string,
  jwtSecret: string
) => {
  // get device tokens by calling api
  const tokens = await getDeviceTokens(userId, apiEndpoint, jwtSecret)

  const batchMessages = getBatchMessages(
    messages,
    tokens.map((t) => t.token)
  )

  return sendBatchPushNotifications(batchMessages)
}
