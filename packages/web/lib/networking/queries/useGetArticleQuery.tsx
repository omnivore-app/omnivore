import { gql } from 'graphql-request'
import useSWRImmutable, { useSWRConfig } from 'swr'
import { makeGqlFetcher, RequestContext, ssrFetcher } from '../networkHelpers'
import { articleFragment, ContentReader } from '../fragments/articleFragment'
import { highlightFragment, Highlight } from '../fragments/highlightFragment'
import { ScopedMutator } from 'swr/dist/types'

type ArticleQueryInput = {
  username?: string
  slug?: string
  includeFriendsHighlights?: boolean
}

type ArticleQueryOutput = {
  articleData?: ArticleData
  articleFetchError: unknown
  isLoading: boolean
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
  postedByViewer?: boolean
  savedByViewer?: boolean
  content: string
  shareInfo?: ArticleShareInfo
  highlights: Highlight[]
}

type ArticleShareInfo = {
  title?: string
  description?: string
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
          postedByViewer
          savedByViewer
          content
          shareInfo {
            title
            description
          }
          highlights(input: { includeFriends: $includeFriendsHighlights }) {
            ...HighlightFields
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
`
export const cacheArticle = (mutate: ScopedMutator, username: string, article: ArticleAttributes, includeFriendsHighlights = false) => {
  mutate([query, username, article.slug, includeFriendsHighlights], {
    article: { article: {...article, cached: true} }
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

  const { data, error } = useSWRImmutable(
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

