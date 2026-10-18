import CoreData
import Foundation
import Models
import SwiftGraphQL
import Utils

public struct TypeaheadSearchItem: Identifiable {
  public let id: String
  public let title: String
  let slug: String
  let siteName: String?
}

public extension DataService {
  func typeaheadSearch(searchTerm: String) async throws -> [TypeaheadSearchItem] {
    enum QueryResult {
      case success(result: [TypeaheadSearchItem])
      case error(error: String)
    }

    let typeaheadSelection = Selection.TypeaheadSearchItem {
      TypeaheadSearchItem(
        id: try $0.id(),
        title: try $0.title(),
        slug: try $0.slug(),
        siteName: try $0.siteName()
      )
    }

    let selection = Selection<QueryResult, Unions.TypeaheadSearchResult> {
      try $0.on(
        typeaheadSearchError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        typeaheadSearchSuccess: .init {
          QueryResult.success(result: try $0.items(selection: typeaheadSelection.list))
        }
      )
    }

    let query = Selection.Query {
      try $0.typeaheadSearch(query: searchTerm, selection: selection)
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
        case .error:
          continuation.resume(throwing: ContentFetchError.badData)
        }
      }
    }
  }
}
