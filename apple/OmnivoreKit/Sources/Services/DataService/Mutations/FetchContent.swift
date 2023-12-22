import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func fetchContent(itemID: String) async throws {
    enum MutationResult {
      case result(success: Bool)
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.FetchContentResult> {
      try $0.on(
        fetchContentError: .init { .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "Unknown Error") },
        fetchContentSuccess: .init { .result(success: try $0.success()) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.fetchContent(id: itemID, selection: selection)
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
        case let .result(success: success):
          if success {
            continuation.resume()
          } else {
            continuation.resume(throwing: BasicError.message(messageText: "Operation failed"))
          }
        case let .error(errorMessage: errorMessage):
          continuation.resume(throwing: BasicError.message(messageText: errorMessage))
        }
      }
    }
  }
}
