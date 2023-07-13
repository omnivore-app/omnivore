import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { v4 as uuidv4 } from 'uuid'

export type SaveLinkOutput = {
  jobId?: string
  url?: string
  clientRequestId?: string
}

export type SaveResponseData = {
  saveUrl?: SaveUrlData
}

export type SaveUrlData = {
  id: string
  url: string
  slug: string
  clientRequestId: string
}

export async function saveUrlMutation(
  url: string,
  timezone?: string,
  locale?: string
): Promise<SaveLinkOutput | undefined> {
  const clientRequestId = uuidv4()
  const mutation = gql`
    mutation SaveUrl($input: SaveUrlInput!) {
      saveUrl(input: $input) {
        ... on SaveSuccess {
          url
          clientRequestId
        }
        ... on SaveError {
          errorCodes
          message
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation, {
      input: {
        url,
        clientRequestId,
        source: 'add-link',
        timezone,
        locale,
      },
    })
    const output = data as SaveResponseData | undefined
    return {
      url: output?.saveUrl?.url,
      jobId: output?.saveUrl?.clientRequestId,
      clientRequestId: output?.saveUrl?.clientRequestId,
    }
  } catch (error) {
    console.log('error savingUrl', { error })
    return undefined
  }
}
