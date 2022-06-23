import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func deleteAccount(userID: String) async throws {
    enum MutationResult {
      case success(id: String)
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.DeleteAccountResult> {
      try $0.on(
        deleteAccountError: .init {
          .error(errorMessage: (try $0.errorCodes().first ?? .forbidden).rawValue)
        },
        deleteAccountSuccess: .init {
          .success(id: try $0.userId())
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.deleteAccount(userId: userID, selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { mutationResult in
        guard let payload = try? mutationResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "failed to delete user"))
          return
        }

        switch payload.data {
        case .success:
          continuation.resume()
        case .error:
          continuation.resume(throwing: BasicError.message(messageText: "failed to delete user"))
        }
      }
    }
  }
}
