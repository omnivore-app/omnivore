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
  SendNotification = 'SEND_NOTIFICATION',
}

export interface Rule {
  id: string
  name: string
  filter: string
  actions: RuleAction[]
  enabled: boolean
  createdAt: Date
  updatedAt: Date
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
  rules: unknown
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
          }
        }
        ... on RulesError {
          errorCodes
        }
      }
    }
  `

  const { data, mutate, error, isValidating } = useSWR(query, publicGqlFetcher)

  try {
    if (data) {
      const result = data as RulesQueryResponseData
      const rules = result.rules.rules as Rule[]

      const actions: RuleAction[] = [
        {
          type: RuleActionType.SendNotification,
          params: [] as string[],
        },
        {
          type: RuleActionType.AddLabel,
          params: ['2dfd9ce2-cc9f-11ec-b535-3be2782c2107'],
        },
      ]

      return {
        isValidating,
        rules: rules ?? [],
        revalidate: () => {
          mutate()
        },
      }
    }
  } catch (error) {
    console.log('error', error)
  }
  return {
    isValidating: false,
    rules: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    revalidate: () => {},
  }
}
