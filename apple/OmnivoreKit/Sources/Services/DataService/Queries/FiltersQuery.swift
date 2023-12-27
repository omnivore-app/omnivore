import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func filters() async throws -> [InternalFilter] {
    enum QueryResult {
      case success(result: [InternalFilter])
      case error(error: String)
    }

    let selection = Selection<QueryResult, Unions.FiltersResult> {
      try $0.on(
        filtersError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        filtersSuccess: .init {
          QueryResult.success(result: try $0.filters(selection: filterSelection.list))
        }
      )
    }

    let query = Selection.Query {
      try $0.filters(selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders
    let context = backgroundContext

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network request failed"))
          return
        }

        switch payload.data {
        case let .success(result: filters):
          if filters.persist(context: context) != nil {
            continuation.resume(returning: filters)
          } else {
            continuation.resume(throwing: BasicError.message(messageText: "CoreData error"))
          }
        case .error:
          continuation.resume(throwing: BasicError.message(messageText: "Filter fetch error"))
        }
      }
    }
  }
}
