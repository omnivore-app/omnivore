import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func recommendPage(pageID: String, groupIDs: [String]) async throws {
    enum MutationResult {
      case saved(taskNames: [String])
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.RecommendResult> {
      try $0.on(
        recommendError: .init { .error(errorMessage: try $0.errorCodes().first.toString()) },
        recommendSuccess: .init {
          .saved(taskNames: try $0.taskNames())
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.recommend(
        input: .init(groupIds: groupIDs, pageId: pageID),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network error"))
          return
        }

        switch payload.data {
        case .saved:
          continuation.resume()
        case let .error(errorMessage: errorMessage):
          continuation.resume(throwing: BasicError.message(messageText: errorMessage))
        }
      }
    }
  }
}
