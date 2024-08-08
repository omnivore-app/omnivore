import { gql } from 'graphql-request'
// import { gqlFetcher } from '../networkHelpers'
// import { LibraryItems } from '../library_items/useLibraryItems'

const foo = () => {
  return 'bar'
}
// export type LibraryItemsQueryInput = {
//   limit?: number
//   searchQuery?: string
//   includeContent?: boolean
// }

// export async function searchQuery({
//   limit = 10,
//   searchQuery,
//   includeContent = false,
// }: LibraryItemsQueryInput): Promise<LibraryItemsData | undefined> {
//   const query = gql`
//     query Search(
//       $after: String
//       $first: Int
//       $query: String
//       $includeContent: Boolean
//     ) {
//       search(
//         first: $first
//         after: $after
//         query: $query
//         includeContent: $includeContent
//       ) {
//         ... on SearchSuccess {
//           edges {
//             cursor
//             node {
//               id
//               title
//               slug
//               url
//               pageType
//               contentReader
//               createdAt
//               readingProgressPercent
//               readingProgressTopPercent
//               readingProgressAnchorIndex
//               author
//               image
//               description
//               publishedAt
//               ownedByViewer
//               originalArticleUrl
//               uploadFileId
//               labels {
//                 id
//                 name
//                 color
//               }
//               pageId
//               shortId
//               quote
//               annotation
//               state
//               siteName
//               subscription
//               readAt
//             }
//           }
//           pageInfo {
//             hasNextPage
//             hasPreviousPage
//             startCursor
//             endCursor
//             totalCount
//           }
//         }
//         ... on SearchError {
//           errorCodes
//         }
//       }
//     }
//   `

//   const variables = {
//     first: limit,
//     query: searchQuery,
//     includeContent,
//   }

//   try {
//     const data = await gqlFetcher(query, { ...variables })
//     return (data as LibraryItemsData) || undefined
//   } catch (error) {
//     console.log('search error', error)
//     return undefined
//   }
// }
