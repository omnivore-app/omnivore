import { gql } from 'graphql-request'
import useSWRImmutable from 'swr'
import useSWR from 'swr'
import { makeGqlFetcher, RequestContext, ssrFetcher } from '../networkHelpers'
import { articleFragment, ContentReader } from '../fragments/articleFragment'
import { Highlight, highlightFragment } from '../fragments/highlightFragment'
import { KeyedMutator, ScopedMutator } from 'swr/dist/types'
import { Label, labelFragment } from '../fragments/labelFragment'

type ArticleQueryInput = {
  username?: string
  slug?: string
  includeFriendsHighlights?: boolean
}

type ArticleQueryOutput = {
  articleData?: ArticleData
  articleFetchError: unknown
  isLoading: boolean
  mutate: KeyedMutator<unknown>
}

type ArticleData = {
  article: NestedArticleData
}

type NestedArticleData = {
  article: ArticleAttributes
  errorCodes?: string[]
}

export type ArticleAttributes = {
  id: string
  title: string
  url: string
  originalArticleUrl: string
  author?: string
  image?: string
  savedAt: string
  createdAt: string
  publishedAt?: string
  description?: string
  contentReader: ContentReader
  readingProgressPercent: number
  readingProgressAnchorIndex: number
  slug: string
  savedByViewer?: boolean
  content: string
  highlights: Highlight[]
  linkId: string
  labels?: Label[]
}

const query = gql`
  query GetArticle(
    $username: String!
    $slug: String!
    $includeFriendsHighlights: Boolean
  ) {
    article(username: $username, slug: $slug) {
      ... on ArticleSuccess {
        article {
          ...ArticleFields
          content
          highlights(input: { includeFriends: $includeFriendsHighlights }) {
            ...HighlightFields
          }
          labels {
            ...LabelFields
          }
        }
      }
      ... on ArticleError {
        errorCodes
      }
    }
  }
  ${articleFragment}
  ${highlightFragment}
  ${labelFragment}
`
export const cacheArticle = (
  mutate: ScopedMutator,
  username: string,
  article: ArticleAttributes,
  includeFriendsHighlights = false
) => {
  mutate([query, username, article.slug, includeFriendsHighlights], {
    article: { article: { ...article, cached: true } },
  })
}

export function useGetArticleQuery({
  username,
  slug,
  includeFriendsHighlights,
}: ArticleQueryInput): ArticleQueryOutput {
  const variables = {
    username,
    slug,
    includeFriendsHighlights,
  }

  const { data, error, mutate } = useSWR(
    slug ? [query, username, slug, includeFriendsHighlights] : null,
    makeGqlFetcher(variables)
  )

  let resultData: ArticleData | undefined = data as ArticleData
  let resultError = error
  // We need to check the response errors here and return the error
  // it will be nested in the data pages, if there is one error,
  // we invalidate the data and return the error. We also zero out
  // the response in the case of an error.
  if (!error && resultData && resultData.article.errorCodes) {
    resultError = resultData.article.errorCodes
    resultData = undefined
  }

  return {
    mutate,
    articleData: resultData,
    articleFetchError: resultError as unknown,
    isLoading: !error && !data,
  }
}

export async function articleQuery(
  context: RequestContext,
  input: ArticleQueryInput
): Promise<ArticleAttributes> {
  const result = (await ssrFetcher(context, query, input)) as ArticleData
  if (result.article) {
    return result.article.article
  }

  return Promise.reject()
}
