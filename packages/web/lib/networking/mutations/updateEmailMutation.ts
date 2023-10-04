import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export interface UpdateEmailInput {
  email: string
}

export interface UpdateEmailSuccess {
  email: string
  verificationEmailSent: boolean
}

interface Response {
  updateEmail: UpdateEmailSuccess
}

export async function updateEmailMutation(
  input: UpdateEmailInput
): Promise<UpdateEmailSuccess | undefined> {
  const mutation = gql`
    mutation UpdateEmail($input: UpdateEmailInput!) {
      updateEmail(input: $input) {
        ... on UpdateEmailSuccess {
          email
          verificationEmailSent
        }
        ... on UpdateEmailError {
          errorCodes
        }
      }
    }
  `
  try {
    const data = await gqlFetcher(mutation, {
      input,
    })
    const output = data as Response
    if ('errorCodes' in output.updateEmail) {
      return undefined
    }
    return {
      email: output.updateEmail.email,
      verificationEmailSent: output.updateEmail.verificationEmailSent,
    }
  } catch (err) {
    return undefined
  }
}
