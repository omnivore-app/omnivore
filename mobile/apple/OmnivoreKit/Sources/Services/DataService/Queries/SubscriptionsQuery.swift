import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func subscriptions() async throws -> [Subscription] {
    enum QueryResult {
      case success(result: [Subscription])
      case error(error: String)
    }

    let selection = Selection<QueryResult, Unions.SubscriptionsResult> {
      try $0.on(
        subscriptionsError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        subscriptionsSuccess: .init {
          QueryResult.success(result: try $0.subscriptions(selection: subscriptionSelection.list))
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
          print("QUERY RESULT: ", queryResult)
          continuation.resume(throwing: BasicError.message(messageText: "Subscriptions fetch error"))
        }
      }
    }
  }
}
