import { gql } from 'graphql-request'
import { highlightFragment } from '../fragments/highlightFragment'
import { articleFragment } from '../fragments/articleFragment'
import { labelFragment } from '../fragments/labelFragment'

export const recommendationFragment = gql`
  fragment RecommendationFields on Recommendation {
    id
    name
    note
    user {
      userId
      name
      username
      profileImageURL
    }
    recommendedAt
  }
`

export const GQL_SEARCH_QUERY = gql`
  query Search(
    $after: String
    $first: Int
    $query: String
    $includeContent: Boolean
  ) {
    search(
      first: $first
      after: $after
      query: $query
      includeContent: $includeContent
    ) {
      ... on SearchSuccess {
        edges {
          cursor
          node {
            id
            title
            slug
            url
            folder
            pageType
            contentReader
            createdAt
            readingProgressPercent
            readingProgressTopPercent
            readingProgressAnchorIndex
            author
            image
            description
            publishedAt
            ownedByViewer
            originalArticleUrl
            uploadFileId
            labels {
              id
              name
              color
            }
            pageId
            shortId
            quote
            annotation
            state
            siteName
            siteIcon
            subscription
            readAt
            savedAt
            wordsCount
            recommendations {
              id
              name
              note
              user {
                userId
                name
                username
                profileImageURL
              }
              recommendedAt
            }
            highlights {
              ...HighlightFields
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
          totalCount
        }
      }
      ... on SearchError {
        errorCodes
      }
    }
  }
  ${highlightFragment}
`

export const GQL_SET_LINK_ARCHIVED = gql`
  mutation SetLinkArchived($input: ArchiveLinkInput!) {
    setLinkArchived(input: $input) {
      ... on ArchiveLinkSuccess {
        linkId
        message
      }
      ... on ArchiveLinkError {
        message
        errorCodes
      }
    }
  }
`

export const GQL_DELETE_LIBRARY_ITEM = gql`
  mutation SetBookmarkArticle($input: SetBookmarkArticleInput!) {
    setBookmarkArticle(input: $input) {
      ... on SetBookmarkArticleSuccess {
        bookmarkedArticle {
          id
        }
      }
      ... on SetBookmarkArticleError {
        errorCodes
      }
    }
  }
`

export const GQL_UPDATE_LIBRARY_ITEM = gql`
  mutation UpdatePage($input: UpdatePageInput!) {
    updatePage(input: $input) {
      ... on UpdatePageSuccess {
        updatedPage {
          id
          title
          url
          createdAt
          author
          image
          description
          savedAt
          publishedAt
        }
      }
      ... on UpdatePageError {
        errorCodes
      }
    }
  }
`

export const GQL_GET_LIBRARY_ITEM_CONTENT = gql`
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
          recommendations {
            ...RecommendationFields
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
  ${recommendationFragment}
`
