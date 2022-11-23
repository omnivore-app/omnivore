import { sendNotification } from './notification'
import { getAuthToken, PubSubData } from './index'
import axios from 'axios'
import { parse, SearchParserKeyWordOffset } from 'search-query-parser'
import { addLabels } from './label'
import { archivePage, markPageAsRead } from './page'
import { SearchFilter } from './search_filter'
import { SubscriptionFilter } from './search_filter/subscription_filter'
import { ContentFilter } from './search_filter/content_filter'
import { ReadFilter } from './search_filter/read_filter'

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

const parseSearchFilter = (filter: string): SearchFilter[] => {
  const searchFilter = filter ? filter.replace(/\W\s":/g, '') : undefined
  const result: SearchFilter[] = []

  if (!searchFilter || searchFilter === '*') {
    return result
  }

  const parsed = parse(searchFilter, {
    keywords: ['subscription', 'content', 'is'],
    tokenize: true,
  })
  if (parsed.offsets) {
    const keywords = parsed.offsets
      .filter((offset) => 'keyword' in offset)
      .map((offset) => offset as SearchParserKeyWordOffset)

    for (const keyword of keywords) {
      switch (keyword.keyword) {
        case 'subscription':
          keyword.value && result.push(new SubscriptionFilter(keyword.value))
          break
        case 'content':
          keyword.value && result.push(new ContentFilter(keyword.value))
          break
        case 'is':
          keyword.value && result.push(new ReadFilter(keyword.value))
          break
      }
    }
  }

  return result
}

const isValidData = (filter: string, data: PubSubData): boolean => {
  const searchFilters = parseSearchFilter(filter)

  if (searchFilters.length === 0) {
    console.debug('no search filters found')
    return true
  }

  return searchFilters.every((searchFilter) => searchFilter.isValid(data))
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
  const triggeredActions: RuleAction[] = []
  const authToken = await getAuthToken(userId, jwtSecret)

  for (const rule of rules) {
    if (!isValidData(rule.filter, data)) {
      continue
    }

    for (const action of rule.actions) {
      switch (action.type) {
        case RuleActionType.AddLabel:
          if (!data.id || action.params.length === 0) {
            console.log('invalid data for add label action')
            continue
          }
          await addLabels(apiEndpoint, authToken, data.id, action.params)
          triggeredActions.push(action)
          break
        case RuleActionType.Archive:
          if (!data.id) {
            console.log('invalid data for archive action')
            continue
          }
          await archivePage(apiEndpoint, authToken, data.id)
          triggeredActions.push(action)
          break
        case RuleActionType.MarkAsRead:
          if (!data.id) {
            console.log('invalid data for mark as read action')
            continue
          }
          await markPageAsRead(apiEndpoint, authToken, data.id)
          triggeredActions.push(action)
          break
        case RuleActionType.SendNotification:
          for (const message of action.params) {
            await sendNotification(apiEndpoint, authToken, message)
          }
          triggeredActions.push(action)
          break
      }
    }
  }

  return triggeredActions
}
