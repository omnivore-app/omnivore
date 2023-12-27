import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func deleteSubscription(subscriptionName: String, subscriptionId: String) async throws {
    enum MutationResult {
      case success(id: String)
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.UnsubscribeResult> {
      try $0.on(
        unsubscribeError: .init { .error(errorMessage: (try $0.errorCodes().first ?? .unauthorized).rawValue) },
        unsubscribeSuccess: .init {
          .success(id: try $0.subscription(selection: Selection.Subscription { try $0.id() }))
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.unsubscribe(name: subscriptionName, subscriptionId: OptionalArgument(subscriptionId), selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { mutationResult in
        guard let payload = try? mutationResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network request failed"))
          return
        }

        switch payload.data {
        case .success:
          continuation.resume()
        case .error:
          continuation.resume(throwing: BasicError.message(messageText: "Subscriptions fetch error"))
        }
      }
    }
  }
}
