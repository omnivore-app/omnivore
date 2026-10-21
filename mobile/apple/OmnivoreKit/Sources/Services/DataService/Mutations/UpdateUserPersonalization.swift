import CoreData
import Foundation
import Models
import SwiftGraphQL

struct DigestConfig {
  let channels: [String]
}

struct UserPersonalization {
  let digestConfig: DigestConfig
}

let digestConfigSelection = Selection.DigestConfig {
  DigestConfig(channels: (try? $0.channels())?.compactMap { $0 } ?? [])
}

let channelSelection = Selection.UserPersonalization {
  try $0.digestConfig(selection: digestConfigSelection.nullable)?.channels ?? []
}


public extension DataService {
  func setupUserDigestConfig() async throws {
    enum MutationResult {
      case success(channels: [String])
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.SetUserPersonalizationResult> {
      try $0.on(
        setUserPersonalizationError: .init {
          .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "Unknown Error")
        },
        setUserPersonalizationSuccess: .init { .success(channels: try $0.updatedUserPersonalization(selection: channelSelection)) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.setUserPersonalization(
        input: InputObjects.SetUserPersonalizationInput(
          digestConfig: OptionalArgument(
            InputObjects.DigestConfigInput(channels: OptionalArgument([OptionalArgument("push")]))
          )
        ),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          print("network error setting up user digest config")
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

