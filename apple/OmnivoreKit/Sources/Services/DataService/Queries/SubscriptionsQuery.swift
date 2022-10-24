import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func subscriptions() async throws -> [Subscription] {
    enum QueryResult {
      case success(result: [Subscription])
      case error(error: String)
    }

    let subsciptionSelection = Selection.Subscription {
      Subscription(
        createdAt: try $0.createdAt().value,
        description: try $0.description(),
        subscriptionID: try $0.id(),
        name: try $0.name(),
        newsletterEmailAddress: try $0.newsletterEmail(),
        status: try SubscriptionStatus.make(from: $0.status()),
        unsubscribeHttpUrl: try $0.unsubscribeHttpUrl(),
        unsubscribeMailTo: try $0.unsubscribeMailTo(),
        updatedAt: try $0.updatedAt().value,
        url: try $0.url(),
        icon: try $0.icon()
      )
    }

    let selection = Selection<QueryResult, Unions.SubscriptionsResult> {
      try $0.on(
        subscriptionsError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        subscriptionsSuccess: .init {
          QueryResult.success(result: try $0.subscriptions(selection: subsciptionSelection.list))
        }
      )
    }

    let query = Selection.Query {
      try $0.subscriptions(selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network request failed"))
          return
        }

        switch payload.data {
        case let .success(result: result):
          continuation.resume(returning: result)
        case .error:
          continuation.resume(throwing: BasicError.message(messageText: "Subscriptions fetch error"))
        }
      }
    }
  }
}

extension SubscriptionStatus {
  static func make(from status: Enums.SubscriptionStatus) -> SubscriptionStatus {
    switch status {
    case .active:
      return .active
    case .deleted:
      return .deleted
    case .unsubscribed:
      return .unsubscribed
    }
  }
}
