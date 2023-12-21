import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func subscribeToFeed(feedURL: String, folder: String? = nil, fetchContent: Bool? = nil) async throws -> Bool {
    enum MutationResult {
      case success(subscriptionIds: [String])
      case error(errorMessage: String)
    }

    let subscriptionIdSelection = Selection.Subscription {
      try $0.id()
    }

    let selection = Selection<MutationResult, Unions.SubscribeResult> {
      try $0.on(
        subscribeError: .init {
          .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "unknown error")
        },
        subscribeSuccess: .init {
          .success(subscriptionIds: try $0.subscriptions(selection: subscriptionIdSelection.list))
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.subscribe(input: InputObjects.SubscribeInput(
        fetchContent: OptionalArgument(fetchContent),
        folder: OptionalArgument(folder),
        url: feedURL
      ), selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { mutationResult in
        guard let payload = try? mutationResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "failed to add feed \(feedURL)"))
          return
        }

        switch payload.data {
        case .success:
          print("subscribed to feed:", feedURL)
          continuation.resume(returning: true)
        case .error:
          print("failed to subscribe to feed:", feedURL)
          continuation.resume(throwing: BasicError.message(messageText: "failed to add feed \(feedURL)"))
        }
      }
    }
  }
}
