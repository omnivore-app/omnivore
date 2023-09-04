import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export interface RecommendationGroup {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

type JoinGroupResponse = {
  joinGroup?: JoinGroupData
  errorCodes?: string[]
}

type JoinGroupData = {
  group: RecommendationGroup | undefined
}

export async function joinGroupMutation(
  inviteCode: string
): Promise<RecommendationGroup | undefined> {
  const mutation = gql`
    mutation JoinGroup($inviteCode: String!) {
      joinGroup(inviteCode: $inviteCode) {
        ... on JoinGroupSuccess {
          group {
            id
            name
            createdAt
            updatedAt
          }
        }
        ... on JoinGroupError {
          errorCodes
        }
      }
    }
  `

  const response = await gqlFetcher(mutation, { inviteCode })
  const data = response as JoinGroupResponse | undefined
  const error = data?.errorCodes?.find(() => true)
  if (error) {
    throw error
  }
  return data?.joinGroup?.group
}
