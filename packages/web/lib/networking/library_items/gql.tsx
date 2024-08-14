import { gql } from 'graphql-request'
import { articleFragment } from '../fragments/articleFragment'
import { highlightFragment } from '../fragments/highlightFragment'
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

export const gqlSearchQuery = (includeTotalCount = false) => gql`
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
            highlightsCount
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
          totalCount @include(if: ${includeTotalCount})
        }
      }
      ... on SearchError {
        errorCodes
      }
    }
  }
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

export const GQL_MOVE_ITEM_TO_FOLDER = gql`
  mutation MoveToFolder($id: ID!, $folder: String!) {
    moveToFolder(id: $id, folder: $folder) {
      ... on MoveToFolderSuccess {
        success
      }
      ... on MoveToFolderError {
        errorCodes
      }
    }
  }
`

export const GQL_SET_LABELS = gql`
  mutation SetLabels($input: SetLabelsInput!) {
    setLabels(input: $input) {
      ... on SetLabelsSuccess {
        labels {
          ...LabelFields
        }
      }
      ... on SetLabelsError {
        errorCodes
      }
    }
  }
  ${labelFragment}
`

export const GQL_SAVE_ARTICLE_READING_PROGRESS = gql`
  mutation SaveArticleReadingProgress(
    $input: SaveArticleReadingProgressInput!
  ) {
    saveArticleReadingProgress(input: $input) {
      ... on SaveArticleReadingProgressSuccess {
        updatedArticle {
          id
          readingProgressPercent
          readingProgressAnchorIndex
        }
      }
      ... on SaveArticleReadingProgressError {
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

export const GQL_GET_LIBRARY_ITEM = gql`
  query GetArticle(
    $username: String!
    $slug: String!
    $includeFriendsHighlights: Boolean
  ) {
    article(username: $username, slug: $slug) {
      ... on ArticleSuccess {
        article {
          ...ArticleFields
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

export const GQL_BULK_ACTION = gql`
  mutation BulkAction(
    $action: BulkActionType!
    $query: String!
    $expectedCount: Int
    $labelIds: [ID!]
  ) {
    bulkAction(
      query: $query
      action: $action
      labelIds: $labelIds
      expectedCount: $expectedCount
    ) {
      ... on BulkActionSuccess {
        success
      }
      ... on BulkActionError {
        errorCodes
      }
    }
  }
`

export const GQL_SAVE_URL = gql`
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
