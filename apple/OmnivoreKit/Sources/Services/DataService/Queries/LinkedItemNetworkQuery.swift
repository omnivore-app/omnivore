import CoreData
import Foundation
import Models
import SwiftGraphQL

struct InternalLinkedItemQueryResult {
  let items: [InternalLibraryItem]
  let cursor: String?
  let totalCount: Int?
}

struct InternalLinkedItemUpdatesQueryResult {
  let deletedItemIDs: [String]
  let newItems: [InternalLibraryItem]
  let updatedItems: [InternalLibraryItem]
  let cursor: String?
  let hasMoreItems: Bool
  let totalCount: Int
}

private struct SyncItemEdge {
  let itemID: String
  let isDeletedItem: Bool
  let isUpdatedItem: Bool
  let item: InternalLibraryItem?
}

extension DataService {
  // swiftlint:disable:next function_body_length
  func linkedItemUpdates(
    since: Date,
    limit: Int,
    cursor: String?,
    descending: Bool = true
  ) async throws -> InternalLinkedItemUpdatesQueryResult {
    struct QuerySuccessResult {
      let edges: [SyncItemEdge]
      let cursor: String?
      let hasMoreItems: Bool
      let totalCount: Int
    }
    enum QueryResult {
      case success(result: QuerySuccessResult)
      case error(error: String)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    let selection = Selection<QueryResult, Unions.UpdatesSinceResult> {
      try $0.on(
        updatesSinceError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        updatesSinceSuccess: .init {
          QueryResult.success(
            result: QuerySuccessResult(
              edges: try $0.edges(selection: syncItemEdgeSelection.list),
              cursor: try $0.pageInfo(selection: Selection.PageInfo {
                try $0.endCursor()
              }),
              hasMoreItems: try $0.pageInfo(selection: Selection.PageInfo {
                try $0.hasNextPage()
              }),
              totalCount: try $0.pageInfo(selection: Selection.PageInfo {
                try $0.totalCount() ?? -1
              })
            )
          )
        }
      )
    }

    let sort = InputObjects.SortParams(
      by: .updatedTime,
      order: OptionalArgument(descending ? .descending : .ascending)
    )

    let query = Selection.Query {
      try $0.updatesSince(
        after: OptionalArgument(cursor),
        first: OptionalArgument(limit),
        folder: OptionalArgument("all"),
        since: DateTime(from: since),
        sort: OptionalArgument(sort),
        selection: selection
      )
    }

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: ContentFetchError.network)
          return
        }

        switch payload.data {
        case let .success(result: result):
          var newItems = [InternalLibraryItem]()
          var updatedItems = [InternalLibraryItem]()
          var deletedItemIDs = [String]()

          for edge in result.edges {
            if edge.isDeletedItem {
              deletedItemIDs.append(edge.itemID)
            } else if let item = edge.item, edge.isUpdatedItem {
              updatedItems.append(item)
            } else if let item = edge.item {
              newItems.append(item)
            }
          }

          continuation.resume(
            returning: InternalLinkedItemUpdatesQueryResult(
              deletedItemIDs: deletedItemIDs,
              newItems: newItems,
              updatedItems: updatedItems,
              cursor: result.cursor,
              hasMoreItems: result.hasMoreItems,
              totalCount: result.totalCount
            )
          )
        case let .error(error):
          continuation.resume(throwing: ContentFetchError.unknown(description: error.description))
        }
      }
    }
  }

  /// Performs GraphQL request to fetch `InternalLinkedItem`s and a cursor value
  /// - Parameters:
  ///   - limit: max number of items to return
  ///   - searchQuery: search query used by server to narrow search
  ///   - cursor: cursor to indicate batch cutoff
  /// - Returns: `InternalLinkedItemQueryResult` or a `ContentFetchError` if request fails.
  func fetchLinkedItems(
    limit: Int,
    searchQuery: String?,
    cursor: String?
  ) async throws -> InternalLinkedItemQueryResult {
    enum QueryResult {
      case success(result: InternalLinkedItemQueryResult)
      case error(error: String)
    }

    let selection = Selection<QueryResult, Unions.SearchResult> {
      try $0.on(
        searchError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        searchSuccess: .init {
          QueryResult.success(
            result: InternalLinkedItemQueryResult(
              items: try $0.edges(selection: searchItemEdgeSelection.list),
              cursor: try $0.pageInfo(selection: Selection.PageInfo {
                try $0.endCursor()
              }),
              totalCount: try $0.pageInfo(selection: Selection.PageInfo {
                try $0.totalCount()
              })
            )
          )
        }
      )
    }

    let query = Selection.Query {
      try $0.search(
        after: OptionalArgument(cursor),
        first: OptionalArgument(limit),
        includeContent: OptionalArgument(true),
        query: OptionalArgument(searchQuery),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: ContentFetchError.network)
          return
        }

        switch payload.data {
        case let .success(result: result):
          continuation.resume(returning: result)
        case let .error(error):
          continuation.resume(throwing: ContentFetchError.unknown(description: error.description))
        }
      }
    }
  }

  /// Performs GraphQL request to fetch a single `InternalLinkedItem`
  /// - Parameters:
  ///   - username: the Viewer's username
  ///   - itemID: id of the item being requested
  /// - Returns: Returns an `InternalLinkedItem` or throws a `ContentFetchError` if
  /// request could not be completed
  func fetchLinkedItem(username: String, itemID: String) async throws -> InternalLibraryItem {
    struct ArticleProps {
      let item: InternalLibraryItem
    }

    enum QueryResult {
      case success(result: InternalLibraryItem)
      case error(error: String)
    }

    let selection = Selection<QueryResult, Unions.ArticleResult> {
      try $0.on(
        articleError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        articleSuccess: .init {
          QueryResult.success(result: try $0.article(selection: libraryArticleSelection))
        }
      )
    }

    let query = Selection.Query {
      // backend has a hack that allows us to pass in itemID in place of slug
      try $0.article(slug: itemID, username: username, selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: ContentFetchError.network)
          return
        }
        switch payload.data {
        case let .success(result: result):
          continuation.resume(returning: result)
        case let .error(error):
          continuation.resume(throwing: ContentFetchError.unknown(description: error.description))
        }
      }
    }
  }
}

let recommendingUserSelection = Selection.RecommendingUser {
  InternalUserProfile(
    userID: try $0.userId(),
    name: try $0.name(),
    username: try $0.username(),
    profileImageURL: nil // try $0.profileImageUrl() ?? nil
  )
}

let recommendationSelection = Selection.Recommendation {
  InternalRecommendation(
    groupID: try $0.id(),
    name: try $0.name(),
    note: try $0.note(),
    user: try $0.user(selection: recommendingUserSelection.nullable),
    recommendedAt: try $0.recommendedAt().value ?? Date()
  )
}

private let libraryArticleSelection = Selection.Article {
  InternalLibraryItem(
    id: try $0.id(),
    title: try $0.title(),
    createdAt: try $0.createdAt().value ?? Date(),
    savedAt: try $0.savedAt().value ?? Date(),
    readAt: try $0.readAt()?.value,
    updatedAt: try $0.updatedAt()?.value ?? Date(),
    folder: try $0.folder(),
    state: try $0.state()?.rawValue.asArticleContentStatus ?? .succeeded,
    readingProgress: try $0.readingProgressPercent(),
    readingProgressAnchor: try $0.readingProgressAnchorIndex(),
    imageURLString: try $0.image(),
    onDeviceImageURLString: nil,
    documentDirectoryPath: nil,
    pageURLString: try $0.url(),
    descriptionText: try $0.description(),
    publisherURLString: try $0.originalArticleUrl(),
    siteName: try $0.siteName(),
    author: try $0.author(),
    publishDate: try $0.publishedAt()?.value,
    slug: try $0.slug(),
    isArchived: try $0.isArchived(),
    contentReader: try $0.contentReader().rawValue,
    htmlContent: try $0.content(),
    originalHtml: nil,
    language: try $0.language(),
    wordsCount: try $0.wordsCount(),
    downloadURL: try $0.url(),
    recommendations: try $0.recommendations(selection: recommendationSelection.list.nullable) ?? [],
    labels: try $0.labels(selection: feedItemLabelSelection.list.nullable) ?? [],
    highlights: try $0.highlights(selection: highlightSelection.list)
  )
}

private let syncItemEdgeSelection = Selection.SyncUpdatedItemEdge {
  SyncItemEdge(
    itemID: try $0.itemId(),
    isDeletedItem: try $0.updateReason() == .deleted,
    isUpdatedItem: try $0.updateReason() == .updated,
    item: try $0.node(selection: searchItemSelection.nullable)
  )
}

private let searchItemSelection = Selection.SearchItem {
  return InternalLibraryItem(
    id: try $0.id(),
    title: try $0.title(),
    createdAt: try $0.createdAt().value ?? Date(),
    savedAt: try $0.savedAt().value ?? Date(),
    readAt: try $0.readAt()?.value,
    updatedAt: try $0.updatedAt()?.value ?? Date(),
    folder: try $0.folder(),
    state: try $0.state()?.rawValue.asArticleContentStatus ?? .succeeded,
    readingProgress: try $0.readingProgressPercent(),
    readingProgressAnchor: try $0.readingProgressAnchorIndex(),
    imageURLString: try $0.image(),
    onDeviceImageURLString: nil,
    documentDirectoryPath: nil,
    pageURLString: try $0.url(),
    descriptionText: try $0.description(),
    publisherURLString: try $0.originalArticleUrl(),
    siteName: try $0.siteName(),
    author: try $0.author(),
    publishDate: try $0.publishedAt()?.value,
    slug: try $0.slug(),
    isArchived: try $0.isArchived(),
    contentReader: try $0.contentReader().rawValue,
    htmlContent: try $0.content(),
    originalHtml: nil,
    language: try $0.language(),
    wordsCount: try $0.wordsCount(),
    downloadURL: try $0.url(),
    recommendations: try $0.recommendations(selection: recommendationSelection.list.nullable) ?? [],
    labels: try $0.labels(selection: feedItemLabelSelection.list.nullable) ?? [],
    highlights: try $0.highlights(selection: highlightSelection.list.nullable) ?? []
  )
}

private let searchItemEdgeSelection = Selection.SearchItemEdge {
  try $0.node(selection: searchItemSelection)
}
