import { gql } from 'graphql-request'
import useSWR from 'swr'
import { publicGqlFetcher } from '../networkHelpers'

export type RuleAction = {
  type: RuleActionType
  params: string[]
}

export enum RuleActionType {
  AddLabel = 'ADD_LABEL',
  Archive = 'ARCHIVE',
  MarkAsRead = 'MARK_AS_READ',
  Delete = 'DELETE',
  SendNotification = 'SEND_NOTIFICATION',
  Webhook = 'WEBHOOK',
  Export = 'EXPORT',
}

export enum RuleEventType {
  PAGE_CREATED = 'PAGE_CREATED',
  PAGE_UPDATED = 'PAGE_UPDATED',
  LABEL_CREATED = 'LABEL_CREATED',
  HIGHLIGHT_CREATED = 'HIGHLIGHT_CREATED',
  HIGHLIGHT_UPDATED = 'HIGHLIGHT_UPDATED',
}

export interface Rule {
  id: string
  name: string
  filter: string
  actions: RuleAction[]
  enabled: boolean
  createdAt: Date
  updatedAt: Date
  eventTypes: RuleEventType[]
  failedAt?: Date
}

interface RulesQueryResponse {
  isValidating: boolean
  rules: Rule[]
  revalidate: () => void
}

interface RulesQueryResponseData {
  rules: RulesData
}

interface RulesData {
  rules: Rule[]
  errorCodes?: string[]
}

export function useGetRulesQuery(): RulesQueryResponse {
  const query = gql`
    query GetRules {
      rules {
        ... on RulesSuccess {
          rules {
            id
            name
            filter
            actions {
              type
              params
            }
            enabled
            createdAt
            updatedAt
            eventTypes
            failedAt
          }
        }
        ... on RulesError {
          errorCodes
        }
      }
    }
  `

  const { data, mutate, isValidating } = useSWR(query, publicGqlFetcher)
  if (!data) {
    return {
      isValidating: false,
      rules: [],
      revalidate: () => {
        mutate()
      },
    }
  }

  const result = data as RulesQueryResponseData
  const error = result.rules.errorCodes?.find(() => true)
  if (error) {
    throw error
  }

  return {
    isValidating,
    rules: result.rules.rules,
    revalidate: () => {
      mutate()
    },
  }
}
