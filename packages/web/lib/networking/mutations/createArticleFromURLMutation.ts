import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

type CreateArticleFromURLMutationInput = {
  url: string
}

type CreateArticleFromURLMutationOutput = {
  jobId?: string
}

type ResponseData = {
  createArticleSavingRequest?: ArticleSavingRequest
}

type ArticleSavingRequest = {
  articleSavingRequest: ArticleSavingRequestData
}

type ArticleSavingRequestData = {
  id: string
}

export async function createArticleFromURLMutation(
  input: CreateArticleFromURLMutationInput
): Promise<CreateArticleFromURLMutationOutput> {
  const mutation = gql`
    mutation CreateArticleSavingRequest(
      $input: CreateArticleSavingRequestInput!
    ) {
      createArticleSavingRequest(input: $input) {
        ... on CreateArticleSavingRequestSuccess {
          articleSavingRequest {
            id
            status
          }
        }
        ... on CreateArticleSavingRequestError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation, { input })
    const output = data as ResponseData | undefined
    return {
      jobId: output?.createArticleSavingRequest?.articleSavingRequest.id,
    }
  } catch {
    return {}
  }
}
