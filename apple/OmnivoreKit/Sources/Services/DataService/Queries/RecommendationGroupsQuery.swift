import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func recommendationGroups() async throws -> [InternalRecommendationGroup] {
    enum QueryResult {
      case success(result: [InternalRecommendationGroup])
      case error(error: String)
    }

    let selection = Selection<QueryResult, Unions.GroupsResult> {
      try $0.on(
        groupsError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        groupsSuccess: .init {
          QueryResult.success(result: try $0.groups(selection: recommendationGroupSelection.list))
        }
      )
    }

    let query = Selection.Query {
      try $0.groups(selection: selection)
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
        case let .success(result: result):
          if result.persist(context: context) != nil {
            continuation.resume(returning: result)
          } else {
            continuation.resume(throwing: BasicError.message(messageText: "CoreData error"))
          }
        case .error:
          continuation.resume(throwing: BasicError.message(messageText: "Recommendation Groups fetch error"))
        }
      }
    }
  }
}
