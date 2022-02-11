import { gql } from 'graphql-request'
import useSWR from 'swr'
import { makePublicGqlFetcher, RequestContext, ssrFetcher } from '../networkHelpers'
import { Highlight } from '../fragments/highlightFragment'

type PublicArticleQueryInput = {
  username: string
  slug: string
  selectedHighlightId?: string
}

export type PublicArticleQueryOutput = {
  publicArticle?: PublicArticleAttributes
  fetchError: unknown
  isLoading: boolean
  isValidating: boolean
}

type PublicArticleData = {
  sharedArticle: NestedPublicArticleData
}

type NestedPublicArticleData = {
  article: PublicArticleAttributes
}

export type PublicArticleAttributes = {
  id: string
  title: string
  slug: string
  url: string
  author?: string
  image?: string
  description?: string
  savedByViewer?: boolean
  postedByViewer?: boolean
  hasContent?: boolean
  shareInfo?: PublicArticleShareInfo
  highlights: Highlight[]
}

type PublicArticleShareInfo = {
  title?: string
  description?: string
}

export const PublicArticleGQLFragment = gql`
  fragment PublicArticle on Article {
    id
    title
    slug
    url
    author
    image
    description
    savedByViewer
    postedByViewer
    hasContent
    shareInfo {
      title
      description
    }
    highlights {
      id
      shortId
      quote
      prefix
      suffix
      patch
      annotation
      sharedAt
      user {
        id
        name
        profile {
          id
          username
          pictureUrl
        }
      }
    }
  }
`

const query = gql`
  query GetPublicArticle(
    $username: String!
    $slug: String!
    $selectedHighlightId: String
  ) {
    sharedArticle(
      username: $username
      slug: $slug
      selectedHighlightId: $selectedHighlightId
    ) {
      ... on SharedArticleSuccess {
        article {
          ...PublicArticle
        }
      }

      ... on SharedArticleError {
        errorCodes
      }
    }
  }
  ${PublicArticleGQLFragment}
`

export function useGetPublicArticleQuery({
  username,
  slug,
  selectedHighlightId,
}: PublicArticleQueryInput): PublicArticleQueryOutput {
  const variables = {
    username,
    slug,
    selectedHighlightId,
  }

  const { data, error, isValidating } = useSWR(
    // Only make request if username is defined
    !!username ? [query, username, slug, selectedHighlightId] : null,
    makePublicGqlFetcher(variables)
  )
  const publicArticle = (data as PublicArticleData)?.sharedArticle?.article

  return {
    publicArticle,
    fetchError: error as unknown,
    isLoading: !error && !publicArticle,
    isValidating,
  }
}

export async function publicArticleQuery(
  context: RequestContext,
  input: PublicArticleQueryInput
): Promise<PublicArticleAttributes> {
  const result = (await ssrFetcher(context, query, input, false)) as PublicArticleData
  if (result.sharedArticle.article) {
    return result.sharedArticle.article
  }

  return Promise.reject()
}
