import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func updateSubscription(_ subscriptionID: String, folder: String? = nil, fetchContentType: FetchContentType? = nil) async throws {
    enum MutationResult {
      case success(subscriptionID: String)
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.UpdateSubscriptionResult> {
      try $0.on(
        updateSubscriptionError: .init { .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "Unknown Error") },
        updateSubscriptionSuccess: .init { .success(subscriptionID: try $0.subscription(selection: subscriptionSelection).subscriptionID) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.updateSubscription(
        input: InputObjects.UpdateSubscriptionInput(
          fetchContentType: OptionalArgument(fetchContentType?.toGQLType()),
          folder: OptionalArgument(folder),
          id: subscriptionID
        ),
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
        case .success:
          continuation.resume()
        case let .error(errorMessage: errorMessage):
          continuation.resume(throwing: BasicError.message(messageText: errorMessage))
        }
      }
    }
  }
}
