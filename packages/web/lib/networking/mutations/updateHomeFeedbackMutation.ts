import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export type SendHomeFeedbackType = 'MORE' | 'LESS'

export type SendHomeFeedbackInput = {
  site?: string
  author?: string
  subscriptionId?: string
  feedbackType: SendHomeFeedbackType
}

type SendHomeFeedbackResponseData = {
  message?: string
  errorCodes?: string[]
}

type SendHomeFeedbackResponse = {
  sendHomeFeedback?: SendHomeFeedbackResponseData
}

export async function sendHomeFeedbackMutation(
  input: SendHomeFeedbackInput
): Promise<boolean> {
  const mutation = gql`
    mutation SendHomeFeedback($input: SendHomeFeedbackInput!) {
      sendHomeFeedback(input: $input) {
        ... on SendHomeFeedbackSuccess {
          message
        }
        ... on SendHomeFeedbackError {
          errorCodes
        }
      }
    }
  `

  try {
    const response = await gqlFetcher(mutation, {
      input,
    })
    const data = response as SendHomeFeedbackResponse | undefined
    return !!data?.sendHomeFeedback?.message
  } catch (error) {
    console.error(error)
    return false
  }
}
