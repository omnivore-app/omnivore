import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { Rule } from '../queries/useGetRulesQuery'

type DeleteRuleResult = {
  deleteRule?: DeleteRuleData
}

type DeleteRuleData = {
  deleteRule?: DeleteRuleSuccess
  errorCodes?: unknown[]
}

type DeleteRuleSuccess = {
  rule: Rule
}

export async function deleteRuleMutation(id: string): Promise<Rule> {
  const mutation = gql`
    mutation DeleteRule($id: ID!) {
      deleteRule(id: $id) {
        ... on DeleteRuleSuccess {
          rule {
            id
            name
          }
        }
        ... on DeleteRuleError {
          errorCodes
        }
      }
    }
  `

  const data = (await gqlFetcher(mutation, { id })) as DeleteRuleResult
  const output = data as any
  const error = data.deleteRule?.errorCodes?.find(() => true)
  if (error) {
    throw error
  }
  return output.deleteRule?.rule
}
