import axios, { AxiosResponse } from 'axios'
import { filterPage } from './filter'
import { getAuthToken, PubSubData } from './index'
import { setLabels } from './label'
import { NotificationData, sendNotification } from './notification'
import { archivePage, markPageAsRead } from './page'

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

export enum RuleEventType {
  PageCreated = 'PAGE_CREATED',
  PageUpdated = 'PAGE_UPDATED',
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
  eventTypes: RuleEventType[]
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
            eventTypes
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
  jwtSecret: string,
  eventType: RuleEventType
) => {
  const authToken = await getAuthToken(userId, jwtSecret)
  const actionPromises: Promise<AxiosResponse<any, any> | undefined>[] = []

  for (const rule of rules) {
    // Check if the rule is enabled for the event type
    if (!rule.eventTypes.includes(eventType)) {
      continue
    }

    const filteredPage = await filterPage(
      apiEndpoint,
      authToken,
      rule.filter,
      data.id
    )
    if (!filteredPage) {
      continue
    }

    rule.actions.forEach((action) => {
      switch (action.type) {
        case RuleActionType.AddLabel: {
          const existingLabelIds =
            filteredPage.labels?.map((label) => label.id) || []
          const labelIdsToSet = [...existingLabelIds]

          // combine existing labels with new labels to avoid duplicates
          action.params.forEach((newLabelId) => {
            if (!labelIdsToSet.includes(newLabelId)) {
              labelIdsToSet.push(newLabelId)
            }
          })

          // call the api if it has new labels to set
          return (
            labelIdsToSet.length > existingLabelIds.length &&
            actionPromises.push(
              setLabels(
                apiEndpoint,
                authToken,
                data.id,
                labelIdsToSet,
                rule.name
              )
            )
          )
        }
        case RuleActionType.Archive:
          return (
            !filteredPage.isArchived &&
            actionPromises.push(archivePage(apiEndpoint, authToken, data.id))
          )
        case RuleActionType.MarkAsRead:
          return (
            filteredPage.readingProgressPercent < 100 &&
            actionPromises.push(markPageAsRead(apiEndpoint, authToken, data.id))
          )
        case RuleActionType.SendNotification: {
          const data: NotificationData = {
            title: filteredPage.author || filteredPage.siteName || 'Omnivore',
            body: filteredPage.title,
            image: filteredPage.image || undefined,
          }

          const params = action.params
          if (params.length > 0) {
            const param = JSON.parse(params[0]) as NotificationData
            data.body = param.body || data.body
            data.title = param.title || data.title
            data.image = param.image || data.image
          }

          return actionPromises.push(
            sendNotification(apiEndpoint, authToken, data)
          )
        }
      }
    })
  }

  return Promise.all(actionPromises)
}
