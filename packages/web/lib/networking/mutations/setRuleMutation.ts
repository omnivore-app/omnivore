import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { Rule, RuleAction, RuleEventType } from '../queries/useGetRulesQuery'

export type SetRuleInput = {
  id?: string
  name: string
  filter: string
  actions: RuleAction[]
  enabled: boolean
  eventTypes: RuleEventType[]
}

type SetRuleResult = {
  setRule?: SetRuleData
}

type SetRuleData = {
  rule: Rule
  errorCodes?: unknown[]
}

export async function setRuleMutation(
  input: SetRuleInput
): Promise<Rule | undefined> {
  const mutation = gql`
    mutation SetRule($input: SetRuleInput!) {
      setRule(input: $input) {
        ... on SetRuleSuccess {
          rule {
            id
            name
            filter
            actions {
              type
              params
            }
            enabled
            eventTypes
          }
        }
        ... on SetRuleError {
          errorCodes
        }
      }
    }
  `

  const data = (await gqlFetcher(mutation, { input })) as SetRuleResult
  const output = data as any
  const error = data.setRule?.errorCodes?.find(() => true)
  if (error) {
    if (error === 'INVALID_TOKEN') throw 'Your token is invalid.'
    throw error
  }
  return output.setRule?.rule
}
