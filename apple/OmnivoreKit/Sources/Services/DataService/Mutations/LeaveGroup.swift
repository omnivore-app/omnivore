import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func leaveGroup(groupID: String) async throws {
    enum MutationResult {
      case saved(success: Bool)
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.LeaveGroupResult> {
      try $0.on(
        leaveGroupError: .init { .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "Unknown Error") },
        leaveGroupSuccess: .init {
          .saved(success: try $0.success())
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.leaveGroup(
        groupId: groupID,
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
        case let .saved(success):
          if success {
            continuation.resume()
          } else {
            continuation.resume(throwing: BasicError.message(messageText: "Unknown error"))
          }
          return
        case let .error(errorMessage: errorMessage):
          continuation.resume(throwing: BasicError.message(messageText: errorMessage))
        }
      }
    }
  }
}
