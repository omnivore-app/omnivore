import Foundation
import Models
import SwiftGraphQL

extension DataService {
  struct LinkedItemIDFetchResult {
    let itemIDs: [String]
    let cursor: String?
  }

  func fetchLinkedItemIDs(limit: Int, cursor: String?) async throws -> LinkedItemIDFetchResult {
    enum QueryResult {
      case success(result: LinkedItemIDFetchResult)
      case error(error: String)
    }

    let articleIDSelection = Selection.SearchItemEdge {
      try $0.node(selection: Selection.SearchItem { try $0.id() })
    }

    let selection = Selection<QueryResult, Unions.SearchResult> {
      try $0.on(
        searchError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        searchSuccess: .init {
          QueryResult.success(
            result: LinkedItemIDFetchResult(
              itemIDs: try $0.edges(selection: articleIDSelection.list),
              cursor: try $0.pageInfo(selection: Selection.PageInfo {
                try $0.endCursor()
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
        query: OptionalArgument(nil),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network error"))
          return
        }

        switch payload.data {
        case let .success(result: result):
          continuation.resume(returning: result)
        case .error:
          continuation.resume(throwing: BasicError.message(messageText: "LinkedItem fetch error"))
        }
      }
    }
  }
}
