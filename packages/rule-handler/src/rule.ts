import { sendNotification } from './notification'
import { getAuthToken, PubSubData } from './index'
import axios, { AxiosResponse } from 'axios'
import { addLabels } from './label'
import { archivePage, markPageAsRead } from './page'
import { isMatched } from './filter'

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
  const authToken = await getAuthToken(userId, jwtSecret)
  const actionPromises: Promise<AxiosResponse<any, any> | undefined>[] = []

  for (const rule of rules) {
    if (
      !(await isMatched(userId, apiEndpoint, authToken, rule.filter, data.id))
    ) {
      continue
    }

    rule.actions.forEach((action) => {
      switch (action.type) {
        case RuleActionType.AddLabel:
          data.id &&
            actionPromises.push(
              addLabels(apiEndpoint, authToken, data.id, action.params)
            )
          break
        case RuleActionType.Archive:
          data.id &&
            actionPromises.push(archivePage(apiEndpoint, authToken, data.id))
          break
        case RuleActionType.MarkAsRead:
          data.id &&
            actionPromises.push(markPageAsRead(apiEndpoint, authToken, data.id))
          break
        case RuleActionType.SendNotification:
          actionPromises.push(
            sendNotification(
              apiEndpoint,
              authToken,
              'New page added to your feed'
            )
          )
          break
      }
    })
  }

  return Promise.all(actionPromises)
}
